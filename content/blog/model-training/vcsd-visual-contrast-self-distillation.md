---
title: "VCSD는 ‘검은 이미지와의 차이’로 VLM self-distillation을 시각 근거에 묶는다"
date: "2026-07-25T22:58:01+09:00"
description: "Visual Contrastive Self-Distillation(VCSD)은 EMA teacher가 원본 이미지와 content-erased control에서 낸 token distribution의 차이를 이용해, 별도 teacher·정답 hint·visual evidence label 없이 image-dependent target을 만드는 on-policy VLM post-training 방법이다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - VCSD
  - Vision-Language Models
  - Self-Distillation
  - On-Policy Distillation
  - VLM Alignment
image: "/images/blog/vcsd-method.webp"
draft: false
---

Vision-Language Model(VLM)의 post-training에서 model이 이미지를 실제로 보고 답하게 만드는 일은 생각보다 까다롭다. 답변이 그럴듯해도, 그 token이 image evidence에서 나왔는지 아니면 언어 prior만으로도 나올 수 있었는지는 분리하기 어렵다. On-Policy Distillation(OPD)은 rollout을 만든 student보다 더 강한 teacher target을 제공할 수 있지만, 보통 privileged answer, external teacher, evidence crop, reasoning trace처럼 teacher와 student 사이에 비대칭 정보를 추가한다.

`Visual Contrastive Self-Distillation`은 그 비대칭을 **원본 image와 내용이 지워진 control image의 조건부 예측 차이**에서 찾는다. 같은 질문과 같은 student-generated prefix를 놓고, EMA teacher가 원본 image를 볼 때와 black image를 볼 때의 next-token distribution을 각각 계산한다. 원본 image 때문에 확률이 뚜렷이 높아지는 token만 찾아, 원본 teacher가 이미 plausible하다고 보는 candidate 안에서 재가중한다. 그 target을 다시 student에 distill하는 방식이다.

결과적으로 VCSD는 external teacher, privileged answer, visual evidence label, reasoning trace, verifier reward를 사용하지 않는다고 주장한다. 논문은 Qwen3-VL 2B·4B·8B와 Qwen3.5 2B·4B·9B에서 일곱 vision benchmark 평균을 base model 대비 **+1.86~+4.77 point** 높였다고 보고한다. 다만 “추론 비용이 없다”는 말은 deployment inference에만 해당한다. training 중에는 EMA teacher가 원본/control 두 조건에서 추가 forward pass를 해야 한다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/vcsd-method.webp">
    <img
      src="/images/blog/vcsd-method.webp"
      alt="VCSD의 세 단계 구조. EMA teacher가 원본 이미지와 black control 이미지에서 next-token distribution을 만들고, 두 분포의 log probability contrast로 original-image target을 재가중한 뒤 forward KL로 student에 distill한다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2를 로컬 최적화한 공식 method overview. VCSD의 contrast는 embedding-level positive/negative pair loss가 아니라, 동일 prefix에서 image condition만 바꾼 두 token distribution의 log-ratio다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

Self-distillation은 model 자신의 behavior에서 supervision을 뽑아낸다는 장점이 있지만, teacher가 student보다 더 유익한 target을 주려면 어느 정도의 **asymmetry**가 필요하다. 기존 OPSD 계열은 정답 hint를 teacher에게만 보여 주거나, 추가 visual evidence를 teacher signal로 사용해 이 차이를 만들었다.

VCSD의 질문은 더 좁다. “정답이나 별도 evidence 없이, 이미지가 실제로 바꾼 token preference만으로 teacher target을 더 informative하게 만들 수 있는가?”다. 원본 이미지 `J`와 content-erased control `J_ctrl`가 있을 때, EMA teacher의 token `v`에 대한 contrast는 다음 직관으로 읽을 수 있다.

```text
contrast(v) = log P_teacher(v | original image, prefix)
            - log P_teacher(v | control image, prefix)
```

이 값이 양수로 크면 해당 token은 질문·prefix만으로 설명되기보다 원본 image 내용이 있을 때 특히 강해진 후보라는 뜻이다. 반대로 두 조건에서 거의 변하지 않는 token은 일반 언어 prior, 문법, answer format일 수 있다.

| target asymmetry의 원천 | teacher가 추가로 받는 것 | VCSD와의 차이 |
|---|---|---|
| Privileged-answer OPSD | reference answer 또는 answer hint | target이 정답 정보에 의존 |
| Visual-evidence OPSD | crop·grounding signal·시각 evidence label | 별도 visual supervision이 필요 |
| **VCSD** | 원본 image와 content-erased control의 paired condition | 같은 입력 쌍의 prediction 차이만 사용 |

이 설계는 contrastive decoding과도 다르다. VCSD는 inference 때 원본/control branch를 비교해 token을 선택하는 decoding trick이 아니라, **training 때만 contrast-shaped full-distribution target을 만들고 student weight에 흡수하는 distillation objective**다.

## 핵심 아이디어: 원본 teacher를 anchor로 두고, image-dependent token만 기울인다

### 1. student rollout과 EMA teacher를 같은 prefix에 맞춘다

student가 원본 prompt-image pair에서 on-policy response를 생성하면, EMA teacher는 그 **같은 고정 prefix**에서 두 번 next-token distribution을 계산한다. 하나는 원본 image 조건(`p_hi`), 하나는 black/degraded/no-image control(`p_ctrl`) 조건이다. 두 teacher pass가 별도의 response trajectory를 생성하는 것이 아니라, 매 token position의 distribution을 비교한다는 점이 중요하다.

teacher는 student update 뒤 exponential moving average(EMA)로 갱신된다. 즉 external frontier teacher를 호출하지 않으면서도, 현재 student보다 조금 느리게 변하는 reference distribution을 유지한다.

### 2. original image가 지지한 token을 reweight한다

VCSD target은 처음부터 control distribution을 따라가지 않는다. **원본-image teacher distribution을 anchor**로 삼고, 그 안에서 contrast가 큰 token을 더 올린다. 논문 식을 간단히 쓰면 다음과 같다.

```text
q*(v) ∝ p_hi(v) × exp(α × contrast(v))
```

여기서 `α`는 contrastive shaping strength다. `α=0`이면 contrast가 사라지고 original-image teacher의 제한된 distribution만 남는다. 논문 기본값은 `α=1.0`이다.

그러나 log-ratio만 크게 보면, 원본 image에서도 거의 불가능했던 token이 control image에서 더 불가능하다는 이유만으로 과도하게 올라갈 수 있다. VCSD는 이를 막기 위해 원본 teacher의 최고 확률 대비 `β` 이상인 token만 **plausibility support**에 남긴다. 기본 `β=0.1`에서 probability mass는 원본 teacher가 이미 plausible하다고 판단한 candidate들 사이에서만 재배분된다.

### 3. forward KL로 full distribution을 student에 옮긴다

contrast-shaped target `q*`는 response mask 전체에서 token-averaged full-vocabulary **forward KL**로 student distribution에 distill된다. gradient는 student에만 흐르며, teacher target은 stop-gradient다. EOS와 image-end token은 contrastive tilt에서 제외해 termination behavior가 불안정해지는 것을 막는다.

이 선택은 “visual reward가 큰 token 하나만 강화한다”는 token-level RL보다 보수적이다. anchor가 language fluency와 일반적인 response prior를 붙들고, contrast가 그 안에서 image-dependent evidence 쪽으로 확률을 이동시킨다. 논문이 이를 conditional pointwise mutual information의 controlled approximation으로 설명하는 이유도 여기에 있다.

## 공개된 근거에서 확인되는 점

### 여섯 모델 설정에서 보고한 평균 정확도

모든 post-training은 ViRL39K single-image data에서 수행됐고, aggregate accuracy는 BLINK·MMStar·V*Bench·MathVista·HRBench4K·HRBench8K·HallusionBench의 unweighted mean이다. 따라서 이 표는 저자들이 보고한 같은 training budget 안의 비교이며, production VLM 전반의 독립적 ranking은 아니다.

| model | Base | answer-hint OPSD | VCSD | Base 대비 VCSD |
|---|---:|---:|---:|---:|
| Qwen3-VL-2B | 62.27 | 64.89 | **67.04** | **+4.77** |
| Qwen3-VL-4B | 71.30 | 71.40 | **73.16** | **+1.86** |
| Qwen3-VL-8B | 72.51 | 73.72 | **76.26** | **+3.75** |
| Qwen3.5-2B | 68.61 | 66.18 | **71.51** | **+2.90** |
| Qwen3.5-4B | 73.94 | 73.92 | **76.77** | **+2.83** |
| Qwen3.5-9B | 74.97 | 74.73 | **79.24** | **+4.27** |

특히 Qwen3.5 계열에서는 answer-hint OPSD가 base model을 일관되게 넘지 못하는 반면, VCSD는 세 scale 모두에서 개선을 보고한다. 2B Qwen3-VL에서는 OPSD 대비 BLINK +1.27, MMStar +3.00, V*Bench +2.09, MathVista +1.40, HRBench4K +1.00, HRBench8K +2.00, HallusionBench +4.32로 모든 개별 benchmark에서 높았다고 쓴다.

학습 설정은 `α=1.0`, `β=0.1`, distillation temperature 2, prompt당 8 rollouts, batch 32, 8×NVIDIA B200 GPU, 90 optimization step이다. 상대적으로 짧고 통제된 post-training setup이므로, 더 긴 schedule·다른 data mixture·다른 multimodal backbone에서도 같은 개선 폭이 유지되는지는 별도로 검증해야 한다.

### 안정성은 contrast 자체보다 guardrail에서 나온다

논문의 ablation은 VCSD가 단순히 `p_hi / p_ctrl` ratio를 키우는 방법이 아님을 보여 준다.

| 실험 | 설정 | 7-benchmark Acc. | 해석 |
|---|---|---:|---|
| Distillation divergence | forward KL | **67.04** | JSD 66.25, reverse KL 64.77보다 높음 |
| Plausibility support | `β=0.1` | 장기 학습에서 안정 | `β=0`은 초반 뒤 progressive degradation을 보고 |
| Contrast strength | `α=1~1.5` | 가장 강하고 비교적 robust | `α=0` 대비 α=1에서 +2.33, α=2는 다시 하락 |
| Control construction | Gaussian noise | 67.14 | black 67.04, blur 66.36, no-image 66.24로 control 유형에 완전히 민감하지는 않음 |

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/vcsd-stability-ablation.webp">
    <img
      src="/images/blog/vcsd-stability-ablation.webp"
      alt="VCSD의 Qwen3-VL-2B ablation. plausibility support 유무에 따른 장기 학습 안정성, contrast strength alpha 변화에 따른 평균 정확도, original-image anchor가 language drift를 줄이는 정도를 세 개의 chart로 보여 준다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 3을 로컬 최적화한 공식 ablation. contrast의 이득은 원본 teacher의 plausibility support와 anchor를 유지할 때 안정적이며, 단순한 unrestricted log-ratio 증폭은 장기 self-distillation에서 무너질 수 있다.
  </figcaption>
</figure>

이 결과는 method의 핵심을 더 명확히 한다. image가 없을 때 바뀌는 token을 무조건 밀어 올리는 것이 아니라, 원본-image teacher가 이미 지지하는 후보 집합 안에서만 **evidence-sensitive redistribution**을 해야 한다. 이 anchor가 없으면 vision-grounded signal을 강화하는 대신 language distribution 자체를 손상시킬 수 있다.

## 코드와 재현성: 실행 가능한 연구 코드이지만 아직 WIP다

논문 abs/html에는 code link가 보이지 않지만, authors의 GitHub `joliang17/VCSD`와 project page가 공개돼 있다. repository는 Apache-2.0이며, `verl` GRPO/PPO framework와 Vision-OPD 기반 위에 VCSD-specific target/loss patch를 얹은 형태다. README가 가리키는 핵심 구현 지점은 다음과 같다.

| 파일/구성 | 역할 |
|---|---|
| `verl/trainer/ppo/vcsd.py` | contrast target과 token-averaged KL loss |
| `verl/workers/actor/dp_actor.py` | EMA teacher의 original/control forward pass와 loss 호출 |
| `verl/.../actor.py`, `actor.yaml` | `vcsd_*` config schema |
| `scripts/run_experiment_contrast_standard.sh` | `α=1.0`, `β=0.1`, black control을 둔 training launcher |
| `prepare_degraded_images.py` | degrade-control image 준비 helper |

README는 Qwen3-VL-2B 같은 model path, 8 GPU, Parquet input을 주어 launcher를 실행하는 예시를 제공하며, FSDP shard merge 명령도 문서화한다. 그러므로 method 자체는 pseudocode보다 훨씬 구체적인 training artifact로 공개된 상태다.

다만 public release maturity는 초기다. repository는 2026년 7월 23일 생성됐고, tags는 비어 있으며 latest GitHub Release endpoint는 404다. README도 paper와 code가 active development인 **work in progress**라고 명시한다. checkpoint, dataset, cache, generated output은 포함하지 않고, 사용자가 `train.parquet`, answer-conditioned validation split 등 자신의 Parquet data를 지정해야 한다. CUDA stack과 pinned `torch`·`vllm`·`flash-attn`도 요구한다.

따라서 이는 “checkpoint를 받아 inference만 하면 되는 VLM release”가 아니라, own data와 multi-GPU RL stack을 갖춘 팀이 method를 재현·변형할 수 있는 **research training repository**에 가깝다. `verl/`이 inherited framework라는 점도 읽어야 한다. VCSD의 새로운 기여는 대형 trainer 전체가 아니라 original/control teacher pass, plausibility-guarded contrast target, KL loss, 관련 config/launcher patch에 집중돼 있다.

## 실무 관점에서의 해석

VCSD의 가장 좋은 아이디어는 “VLM이 이미지를 봤는지”를 final answer correctness 하나로 판단하지 않고, **같은 prefix에서 image condition을 바꿨을 때 어떤 token의 확률이 달라지는가**로 dense supervision을 만든다는 점이다. 이는 caption·VQA·visual math처럼 image evidence가 답의 일부 token에만 강하게 작용하는 task에서 특히 자연스럽다.

그러나 control image는 진실한 counterfactual world가 아니다. black image나 blur는 원본 scene의 information을 지우지만, VLM의 vision encoder와 prompt format이 만들어 내는 다른 artifact도 함께 바꾼다. 논문은 noise/blur/no-image control이 비슷한 결과를 낸다고 보고하지만, medical image, chart, OCR, long-video처럼 visual conditioning이 다른 domain에서 같은 log-ratio가 실제 evidence importance를 잘 나타내는지는 열린 문제다.

운영 측면에서는 inference cost를 늘리지 않는다는 장점이 분명하다. deployment 시에는 student 하나만 남고 EMA teacher/control branch를 유지하지 않는다. 반면 training은 teacher의 paired forward pass와 on-policy rollout을 더하므로 cheap한 SFT replacement는 아니다. 실무 팀이라면 `α`, `β`, control type, hallucination·grounding·language drift, GPU-hour를 함께 sweep해야 한다.

결국 VCSD는 self-distillation에서 비대칭 정보를 찾는 위치를 바꾼다. 정답을 더 보여 주는 대신, model 자신의 conditional prediction이 **실제 image가 있을 때만 지지하는 token**을 찾아낸다. 이 signal을 원본 teacher의 plausible support 안에 가두는 것이 핵심이다. 별도 annotated evidence 없이 VLM을 시각 근거 쪽으로 미세 조정하려는 팀이라면, 이 논문의 headline accuracy보다도 paired condition contrast, original anchor, support guardrail이라는 세 설계 결정을 분리해 검토할 가치가 있다.

Sources: https://arxiv.org/abs/2607.21556, https://arxiv.org/html/2607.21556v1, https://github.com/joliang17/VCSD, https://api.github.com/repos/joliang17/VCSD, https://api.github.com/repos/joliang17/VCSD/contents, https://api.github.com/repos/joliang17/VCSD/tags, https://api.github.com/repos/joliang17/VCSD/releases/latest, https://raw.githubusercontent.com/joliang17/VCSD/main/README.md, https://joliang17.github.io/VisualCSD/
