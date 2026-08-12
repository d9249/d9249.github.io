---
title: "U-OPSD는 모델 자신의 다수결을 teacher context로 바꿔 정답 없이 자기 증류한다"
date: "2026-08-12T23:45:18+09:00"
description: "U-OPSD는 여러 on-policy rollout의 합의를 pseudo-solution으로 만들고, 그 합의와 갈린 trajectory에만 token-level distillation을 적용해 ground truth·verifier·더 큰 teacher 없이 reasoning post-training을 시도한다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - U-OPSD
  - Self-Distillation
  - On-Policy Distillation
  - Reasoning Models
  - Post-Training
draft: false
---

reasoning 모델의 post-training에서 가장 비싼 자원은 종종 모델 크기보다 **외부 supervision**이다. 수학 정답, verifier, 환경 피드백, 더 강한 teacher가 있어야 rollout을 무엇으로 고칠지 알 수 있기 때문이다. 그런데 정답이 없거나 검증기가 약한 문제에서는 그 경로가 막힌다. 모델이 자기 답을 반복 생성해 다수결을 내는 self-consistency는 inference 기법으로 널리 쓰이지만, 그것만으로 잘못된 reasoning trace를 어떻게 학습해야 할지는 별개의 문제다.

`On-Policy Self-Distillation without Any Supervision`은 이 간극에 `U-OPSD`(Unsupervised On-Policy Self-Distillation)를 제안한다. 같은 모델에서 여러 on-policy rollout을 뽑아 **가장 많이 나온 답을 pseudo-solution으로 삼고**, 그 답과 달랐던 trajectory의 prefix에서만 조건부 teacher 분포를 student에 증류한다. 외부 정답·환경 feedback·대형 teacher 없이도, 모델이 이미 어느 정도 확신하는 문제에서 자기 불일치를 dense token-level learning signal로 바꾸려는 방법이다.

논문은 Qwen3 4B·8B의 thinking/non-thinking 설정과 두 instruction-tuned 모델을 다섯 수학 benchmark에서 평가한다. 다만 중심 증거는 competition mathematics와 parse 가능한 boxed final answer에 한정된다. 따라서 이 글은 “정답 없는 범용 self-improvement”보다, **정규화 가능한 최종 답과 일정 수준의 base competence가 있을 때 합의를 privileged context로 쓸 수 있는가**라는 더 좁은 주장으로 읽는다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/uopsd-official-overview.png"
    alt="공식 U-OPSD 구조도. 여러 rollout의 다수결이 pseudo-label을 만들고, 이를 본 teacher가 불일치 rollout의 student 분포를 token 단위로 교정한다."
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 프로젝트 페이지의 U-OPSD overview. pseudo-solution을 본 동일 모델의 detached teacher와, 문제만 보는 student를 분리해 불일치 rollout에 증류를 적용한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

일반 on-policy distillation(OPD)은 student가 실제로 생성한 trajectory 위에서 teacher의 다음-token 분포를 맞춘다. on-policy라는 점 덕분에 teacher-forced SFT보다 training–inference mismatch를 줄이고, sparse outcome reward보다 조밀한 supervision을 줄 수 있다. 그러나 기존 OPD는 대개 별도 강한 teacher에 의존한다.

on-policy self-distillation(OPSD)은 teacher와 student parameter를 공유하되, teacher에게 gold solution처럼 더 많은 문맥을 준다. student는 문제만 보고, teacher는 문제와 정답을 함께 보므로 같은 모델이라도 더 유리한 next-token distribution을 만들 수 있다. 하지만 이때도 핵심 정보는 ground truth라는 외부 source에서 온다. GRPO 계열 RL은 verifier가 필요하고, feedback 기반 방법은 environment signal이 필요하다.

U-OPSD의 관찰은 단순하다. 개별 rollout은 흔들릴 수 있어도, 독립적으로 뽑은 여러 rollout의 **답 일치도**는 내재적 confidence signal이 될 수 있다. 다수결에서 이긴 답이 충분히 많이 지지되면, 그 답을 지닌 긴 reasoning trace를 teacher가 보는 pseudo-solution으로 쓰고, 반대 답으로 간 trace만 고친다. 즉 “모델이 스스로 정답을 안다”가 아니라, **모델이 이미 형성한 합의와 여전히 남은 내부 모순을 분리한다**는 설계다.

## 핵심 아이디어 / 구조 / 동작 방식

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/uopsd-consensus-distillation-loop.svg"
    alt="U-OPSD의 한국어 흐름도. 문제마다 여덟 rollout을 생성하고 다수결과 임계값으로 pseudo-solution을 선택한 다음, 합의 rollout은 teacher context로, 불일치 rollout은 token-level distillation target으로 사용한다."
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    원문 §3.2와 Algorithm 1을 바탕으로 재구성한 흐름. 기본 설정은 prompt당 rollout <code>G=8</code>, self-consistency threshold <code>τ=0.5</code>다.
  </figcaption>
</figure>

### 1. 여러 rollout을 생성하고 답만 비교한다

unlabeled prompt $x$마다 gradient를 멈춘 현재 policy에서 $G$개 rollout을 sampling한다. 각 rollout에서 `\boxed{...}` 형식의 최종 답을 추출하고, 표기 차이를 정규화·canonicalization한 뒤 답별 투표 수를 센다. 답을 parse하지 못한 truncation은 valid vote로 취급하지 않는다.

승자 답의 비율 $c(x)$가 threshold $\tau$보다 낮으면 update를 건너뛴다. 논문의 기본값은 $G=8$, $\tau=0.5$이며, 이 기준을 통과한 prompt에서만 pseudo-answer를 채택한다. 모든 valid rollout이 이미 같은 답이면 고칠 disagreement가 없으므로 역시 gradient를 주지 않는다.

### 2. 합의 trace는 teacher의 privileged context가 된다

다수결 답에 동의한 rollout 중 하나를 pseudo-solution으로 택한다. 원문 기본 선택은 가장 긴 agreeing rollout이다. teacher와 student는 parameter가 같은 모델이지만 입력 문맥이 다르다.

| 분기 | 입력 | training 중 역할 | deployment 때 사용 |
|---|---|---|---|
| Teacher | 문제 + pseudo-solution + 불일치 prefix | pseudo-solution을 이미 아는 조건부 next-token distribution | 아니오 |
| Student | 문제 + 불일치 prefix | 실제로 학습될 policy distribution | 예 |

teacher는 stop-gradient copy로 평가되므로 pseudo-solution을 받는 문맥은 학습 중에만 존재한다. 배포 모델이 rollout bank, vote procedure, teacher prompt를 매 요청마다 다시 실행해야 하는 architecture가 아니라는 뜻이다. 단, 이 장점은 training에서 여러 긴 rollout을 생성하고 paired distribution을 계산하는 비용과 교환된다.

### 3. 합의와 다른 trajectory에서만 dense correction을 준다

U-OPSD는 다수결 답을 teacher-forced label로 복사하지 않는다. 합의에서 벗어난 rollout $y^-$의 각 prefix에서, pseudo-solution을 본 teacher distribution과 ordinary student distribution의 divergence를 최소화한다. 논문 기본 objective는 full-vocabulary **forward KL**($\beta=0$)이며 per-token clipping을 사용한다.

이 선택은 learning signal의 위치를 바꾼다. sequence 전체에 “정답/오답” scalar reward를 뿌리는 대신, 모델이 합의와 갈라진 구체적 prefix에서 teacher가 어떤 token 확률을 더 높게 두는지를 전달한다. 반대로 pseudo-solution을 최종 boxed answer만으로 축소하면, reasoning trace를 포함할 때보다 성능이 크게 떨어졌다고 보고한다. final answer 자체보다 teacher가 참조하는 **완전한 reasoning trace**가 핵심이라는 결과다.

## 공개된 근거에서 확인되는 점

### non-thinking Qwen3에서 supervised baseline을 넘은 결과

다음은 저자가 같은 다섯 benchmark(AIME24, AIME25, HMMT25, MATH500, AMC23)의 평균으로 보고한 수치다. `Avg.`는 benchmark average이며, 독립 재현 결과가 아니다. SFT·GRPO·OPSD에는 ground truth가 사용되고, TTRL·RENT·Intuitor·U-OPSD는 label-free 계열 비교다.

| 모델·모드 | Base | GRPO (GT) | OPSD (GT) | U-OPSD | Base 대비 | OPSD 대비 |
|---|---:|---:|---:|---:|---:|---:|
| Qwen3-4B non-thinking | 40.96 | 45.86 | 46.29 | **49.49** | +8.53p | +3.20p |
| Qwen3-8B non-thinking | 43.57 | 45.43 | 52.04 | **54.31** | +10.74p | +2.27p |
| Qwen3-4B thinking | 74.85 | 76.35 | 76.20 | **77.05** | +2.20p | +0.85p |
| Qwen3-8B thinking | 76.09 | 76.92 | 77.97 | **77.99** | +1.90p | +0.02p |

non-thinking 4B·8B에서 U-OPSD는 각각 49.49, 54.31로 base보다 8.53, 10.74 percentage point 높고, gold solution을 본 OPSD보다도 3.20, 2.27 point 높다고 보고된다. 반면 thinking mode에서는 base 자체가 74.85·76.09로 훨씬 높은 구간에서 시작하고, OPSD와의 차이는 0.85·0.02 point다. 논문도 이 차이를 “consensus가 충분히 믿을 만하면서도 개선 여지가 남은 regime”에서 이점이 크다는 신호로 해석한다.

instruction-tuned 설정에서도 Qwen3-30B-A3B-Instruct-2507은 75.77에서 77.46, Qwen3-4B-Instruct-2507은 67.00에서 68.78로 올랐다고 보고한다. 하지만 4B instruct의 일부 individual benchmark에서는 OPSD가 앞선다. 따라서 결과를 “모든 model·mode에서 supervision을 대체한다”로 일반화하기보다, 본 실험의 five-benchmark average에서 경쟁력이 있었다고 보는 편이 정확하다.

### pseudo-label의 질과 hyperparameter가 보여 주는 조건

저자들은 Qwen3-8B non-thinking, $G=8$, $\tau=0.5$의 64개 training prompt probe에서 rollout의 96.3%가 parse 가능한 answer를 냈고, prompt의 94.0%가 threshold를 통과했으며, 채택된 pseudo-label의 86.7%가 데이터 source의 gold answer와 일치했다고 보고한다. 이는 vote가 무작위로 만들어진 신호가 아니라는 근거지만, 동시에 약 13.3%가 틀린 pseudo-label이었다는 뜻이기도 하다.

흥미롭게도 threshold를 높여 pseudo-label을 더 엄격히 거르면 오히려 성능이 나빠졌다. 같은 ablation에서 $\tau=0.3$은 best checkpoint average 58.59, 기본 $\tau=0.5$는 57.10, $\tau=0.9$는 44.40이었다. agreement purity만 높이는 전략은 사용할 prompt와 disagreement 사례를 줄일 수 있다. rollout 수는 $G=4$와 $G=8$이 56.99·57.10으로 거의 같았고 $G=12$에서 개선된 뒤 $G=16$에서 일부 되돌아갔다고 보고한다. sampling 비용이 $G$에 선형으로 증가하므로, 더 많은 vote가 항상 더 낫지는 않다.

### 공개 artifact: adapters는 있으나 training code는 아직 placeholder다

공식 project page는 Qwen3 4B·8B의 thinking/non-thinking 네 run을 Hugging Face LoRA adapter로 연결한다. 각 model repository는 `peft`, `lora`, `safetensors` tag와 base model을 명시하고, `adapter_model.safetensors`, training log, checkpoint별 다섯 benchmark evaluation log를 포함한다. Model card metadata 기준 license는 Apache-2.0이며, training data tag는 `siyanzhao/Openthoughts_math_30k_opsd`다.

반면 `williamium3000/u-opsd` GitHub repository는 확인 시점에 2026년 8월 7일 commit 하나와 Apache-2.0 `LICENSE`, 논문 abstract를 담은 README만 있다. README는 명시적으로 <strong>“Code will be available soon”</strong>이라고 적고, GitHub Release·tag·실행 recipe·training implementation은 제공하지 않는다. arXiv abstract의 “Code is available” 문구만으로 학습 code가 이미 재현 가능하다고 읽으면 안 된다.

| 공개 surface | 확인되는 내용 | 현재 해석 |
|---|---|---|
| arXiv v2 | 방법, 실험표, ablation, 제한점, project·code 링크 | 논문의 주장과 실험 조건을 검토할 수 있음 |
| 공식 project page | 구조도, 결과표, 네 Hugging Face adapter 링크 | 방법 설명과 결과 checkpoint 탐색 surface |
| Hugging Face `u-opsd/*` | Qwen3 4B·8B, thinking/non-thinking LoRA adapter·logs | 특정 reported run의 adapter와 기록은 확인 가능 |
| GitHub `williamium3000/u-opsd` | license와 placeholder README | full training/evaluation 재현 code는 아직 공개 대기 상태 |

## 실무 관점에서의 해석

U-OPSD가 던지는 중요한 질문은 “self-consistency를 어떻게 더 많이 얻는가”가 아니라, **합의와 불일치의 차이를 training signal로 어떻게 배치하는가**다. 다수결 답을 pseudo-label로 SFT하면, 모델이 이미 뽑은 한 trace를 반복 모방하는 데 그칠 수 있다. 이 방법은 pseudo-solution을 teacher context로만 활용하고, student가 실제로 틀린 방향으로 갔던 prefix에서 distributional correction을 준다. 합의가 결론 선택 도구인 동시에 local token supervision의 조건을 여는 장치가 된다.

적용 조건은 명확하다. 답을 안정적으로 추출·정규화할 수 있어야 하고, base model이 다수결에서 어느 정도 맞는 답을 만들 만큼 유능해야 한다. 개방형 writing, 장문의 research synthesis, tool-use task처럼 “동일 답”을 정의하기 어려운 곳에는 exact-match vote를 그대로 옮길 수 없다. 논문도 softer consensus가 필요하다고 적는다. 잘못된 consensus가 반복적으로 학습되거나, low-confidence prompt를 너무 많이 버릴 때의 dynamics도 아직 충분히 분해되지 않았다.

운영 관점에서는 label cost를 없애는 대신 sampling cost를 옮긴다. 기본 설정은 prompt당 여덟 rollout과 최대 4,096-token completion을 사용한다. verifier 비용이 너무 크거나 gold solution이 없는 domain에서는 이 교환이 유리할 수 있지만, long-context reasoning에서는 rollout 생성·answer parsing·full-vocabulary KL 자체가 상당한 training budget이 된다. 지금 시점에는 공개 adapter와 evaluation log는 확인되지만 end-to-end code가 비어 있으므로, 실험 재현이나 다른 domain 적용은 GitHub training release가 나온 뒤 다시 판단하는 것이 적절하다.

Sources: https://arxiv.org/abs/2608.06296v2, https://arxiv.org/html/2608.06296v2, https://williamium3000.github.io/u-opsd/, https://github.com/williamium3000/u-opsd, https://api.github.com/repos/williamium3000/u-opsd, https://huggingface.co/u-opsd/qwen3-4b-non-thinking, https://huggingface.co/u-opsd/qwen3-4b-thinking, https://huggingface.co/u-opsd/qwen3-8b-non-thinking, https://huggingface.co/u-opsd/qwen3-8b-thinking
