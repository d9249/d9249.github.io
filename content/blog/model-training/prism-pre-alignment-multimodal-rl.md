---
title: "PRISM은 멀티모달 RL의 병목을 RL 자체보다 SFT 이후의 분포 붕괴에서 찾는다"
date: "2026-05-06T14:34:20"
description: "PRISM은 멀티모달 모델의 표준 SFT→RLVR 파이프라인 사이에 black-box on-policy distillation 기반의 pre-alignment 단계를 삽입해, 시각 인식과 추론이 서로 다른 방식으로 무너지는 distributional drift를 먼저 복구하자고 제안한다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Multimodal RL
  - Distillation
  - Qwen3-VL
  - RLVR
  - VLM
draft: false
---

멀티모달 모델의 후처리 파이프라인은 점점 비슷해지고 있다. 대규모 데모 데이터로 supervised fine-tuning(SFT)을 한 번 걸고, 그 다음 reinforcement learning with verifiable rewards(RLVR)로 수학·과학·시각추론 벤치마크를 밀어 올리는 방식이다. 문제는 이 레시피가 너무 익숙해진 나머지, SFT가 정말로 RL의 좋은 출발점인지 자체를 잘 묻지 않는다는 점이다.

PRISM은 바로 그 지점을 겨냥한다. 이 논문은 멀티모달 모델이 SFT를 거친 뒤 오히려 supervision distribution과 원래 base model의 강점 둘 다에서 멀어질 수 있다고 주장한다. 특히 시각 grounding 오류와 reasoning 오류가 서로 다른 방식으로 누적되는 멀티모달 환경에서는, RL을 더 세게 돌리는 것만으로는 이 드리프트를 회복하기 어렵다. 그래서 저자들은 SFT와 RLVR 사이에 distribution alignment라는 별도 단계를 넣고, black-box on-policy distillation으로 정책 분포를 먼저 바로잡는 세 단계 파이프라인을 제안한다.

![PRISM overview](https://xiao4579.github.io/PRISM/static/images/overview.png)

## 무엇을 해결하려는가

논문이 해결하려는 문제는 "RL 알고리즘을 어떻게 더 잘 만들까"보다 한 단계 앞에 있다. 멀티모달 모델이 SFT를 거친 직후 이미 왜곡된 상태에 들어간다면, 이후의 RLVR은 그 왜곡을 품은 채 온라인 최적화를 시작해야 한다. 텍스트 모델에서도 SFT 이후 drift 문제는 알려져 있었지만, 멀티모달에서는 상황이 더 복잡하다. 이미지 이해 단계에서 생긴 오차가 이후 reasoning trace의 전제를 흔들고, 그 오류가 RL 과정에서 다시 증폭되기 때문이다.

PRISM의 핵심 가정은 이렇다. SFT는 demonstration policy를 토큰 단위로 모사하지만, 그 과정이 모델의 native reasoning distribution을 보존한다는 보장은 없다. 더 강한 base model일수록 이 문제는 더 치명적일 수 있다. 이미 꽤 괜찮은 내부 분포를 가진 모델에 외부 시연 궤적을 균일한 token likelihood로 덮어씌우면, 도움을 주는 것이 아니라 오히려 본래 강점을 밀어낼 수 있기 때문이다.

이 관점에서 보면 RLVR의 병목은 보상 함수나 optimizer 세부 조정보다, 그 직전 policy가 어떤 분포에 놓여 있느냐에 더 가깝다. PRISM은 SFT 이후의 모델을 곧바로 RL로 밀어 넣지 않고, 먼저 supervision distribution 쪽으로 재정렬한 뒤 RL을 시작해야 한다고 본다.

## 핵심 아이디어 / 구조 / 동작 방식

PRISM은 세 단계 파이프라인으로 구성된다.

1. **SFT cold start**
   - 1.26M public demonstration과 113K 고품질 multimodal reasoning demonstration을 합쳐 초기 policy를 만든다.
2. **Pre-alignment stage**
   - post-SFT policy의 on-policy rollout을 supervision 분포와 비교해, black-box adversarial on-policy distillation으로 분포를 복구한다.
3. **RLVR stage**
   - alignment를 마친 checkpoint를 GRPO, DAPO, GSPO 같은 RL 알고리즘의 초기값으로 사용한다.

여기서 진짜 새로움은 2단계다. 저자들은 alignment를 teacher logits가 필요한 일반 distillation이 아니라, **response-level adversarial game**으로 재정의한다. 정책이 생성한 응답과 supervision pool의 응답을 구분하는 discriminator를 두고, policy는 그 판별을 속이는 방향으로 업데이트된다. 이때 discriminator는 하나의 단일 점수기가 아니라 **Mixture-of-Experts(MoE)** 구조를 택한다.

- **Perception expert**: 시각 설명과 grounding이 제대로 되었는지 본다.
- **Reasoning expert**: 추론 단계의 정합성과 논리 전개를 본다.

즉 멀티모달 드리프트를 하나의 스칼라 오류로 다루지 않고, perception failure와 reasoning failure를 분리해 교정 신호를 준다. 논문이 말하는 "disentangled corrective signals"의 의미가 여기에 있다.

![PRISM alignment pipeline](https://xiao4579.github.io/PRISM/static/images/alignment_pipeline.png)

논문 구현도 이 구상을 꽤 구체적으로 공개한다. SFT용 데이터는 약 1.37M 샘플 규모이고, alignment stage에는 `rl_training_data_5.9k.parquet`, RL stage에는 `rl_training_data_filtered_2k.parquet`를 사용한다. MoE discriminator는 별도 warmup checkpoint로 공개됐고, RL 이후의 4B/8B PRISM checkpoint들도 Hugging Face에서 바로 내려받을 수 있다. 즉 아이디어 차원에 그치지 않고, 재현 가능한 3-stage training recipe와 모델 아티팩트까지 함께 배포한 셈이다.

## 공개된 근거에서 확인되는 점

가장 중요한 관찰은 **SFT 자체가 평균 성능을 깎는 경우가 많다**는 점이다. 프로젝트 페이지에 공개된 Qwen3-VL 결과를 보면, 4B 기준 Instruct의 평균 점수는 59.7인데 `+ SFT`는 56.8로 내려간다. 8B도 63.3에서 58.1로 떨어진다. 즉 PRISM의 출발점은 "SFT 이후 RL"이 당연히 좋은 경로라는 가정을 부순다.

반면 RL 이후에는 차이가 분명해진다. PRISM-aligned 초기값에서 RLVR을 수행하면 같은 알고리즘이라도 더 높은 평균 점수를 낸다.

| 모델 / 경로 | Avg. |
|---|---:|
| Qwen3-VL-4B Instruct | 59.7 |
| 4B + SFT | 56.8 |
| 4B + GRPO | 61.8 |
| 4B + PRISM + GRPO | 66.2 |
| 4B + DAPO | 63.2 |
| 4B + PRISM + DAPO | 66.3 |
| 4B + GSPO | 61.6 |
| 4B + PRISM + GSPO | 65.8 |
| Qwen3-VL-8B Instruct | 63.3 |
| 8B + SFT | 58.1 |
| 8B + GRPO | 63.3 |
| 8B + PRISM + GRPO | 69.3 |
| 8B + DAPO | 65.2 |
| 8B + PRISM + DAPO | 68.9 |
| 8B + GSPO | 63.3 |
| 8B + PRISM + GSPO | 68.7 |

이 표에서 읽히는 메시지는 두 가지다. 첫째, PRISM 자체만으로는 최종 해답이 아니다. 프로젝트 페이지 수치에서도 `PRISM` 단독 평균은 4B 57.2, 8B 59.3으로 아주 높지 않다. 즉 alignment stage는 final task performance를 곧장 올리는 단계라기보다, **RL이 잘 먹히는 초기 분포를 만드는 단계**에 가깝다. 둘째, 그 초기화 효과는 꽤 크다. 논문 abstract가 강조한 것처럼 `SFT→RLVR` baseline 대비 평균 정확도가 4B에서 **+4.4p**, 8B에서 **+6.0p** 좋아졌다는 주장은 프로젝트 페이지 표와도 정합적이다.

세부 벤치마크에서도 개선 폭이 눈에 띈다. 예를 들어 8B에서 `PRISM + GRPO`는 MathVision 52.0, WeMath 86.4, MMMU-Pro 53.3으로, 같은 `+ GRPO` 경로의 37.1, 79.7, 48.8보다 높다. 4B에서도 `PRISM + GRPO`는 MathVision 45.4, WeMath 82.9, MMMU-Pro 49.7로 `+ GRPO`의 35.5, 77.8, 47.3을 앞선다. 특히 수학·시각 reasoning 계열 벤치마크에서 이득이 크게 보인다는 점은, PRISM이 단순한 style alignment보다 multimodal reasoning failure를 직접 건드리고 있음을 시사한다.

데이터 구성도 중요하다. 논문은 1.26M public demonstration 위에, **Gemini 3 Flash로 만든 113K 추가 시연 데이터**를 쌓는다. 이 데이터는 hardest unsolved problem 위주로 dense visual grounding과 step-by-step reasoning을 담았고, 그중 107K는 SFT에, 6K는 alignment/RL stage에 사용했다고 설명한다. 즉 PRISM의 성능은 alignment objective 하나만이 아니라, 어떤 supervision pool을 준비했는지와도 강하게 결합돼 있다.

![PRISM benchmark comparison](https://xiao4579.github.io/PRISM/static/images/benchmark_comparison.png)

## 실무 관점에서의 해석

내가 보기에 이 논문의 진짜 포인트는 RL을 더 잘하는 새 optimizer보다, **post-training 스택의 상태 전이(state transition)** 자체를 다시 본다는 점이다. 보통은 SFT checkpoint를 RL의 자연스러운 출발점으로 취급하지만, PRISM은 그 checkpoint가 이미 "잘못된 분포"에 있을 수 있다고 본다. 그리고 그 분포를 바로잡는 중간 레이어를 별도 학습 문제로 분리한다.

이 사고방식은 멀티모달뿐 아니라 에이전트형 후처리 파이프라인에도 확장 가능성이 있다. 예를 들어 도구 사용 모델이나 코드 에이전트도 SFT 이후 특정 형식에 과적합되면서 base capability를 잃는 일이 잦다. PRISM의 framing을 빌리면, 문제는 RL을 더 돌릴지 말지가 아니라 **SFT가 무엇을 망가뜨렸는지부터 복구할 수 있느냐**가 된다.

또 하나 흥미로운 점은 black-box setting을 전제로 했다는 것이다. teacher logits 없이도 alignment를 할 수 있도록 response-level adversarial game으로 설계했기 때문에, proprietary teacher나 폐쇄형 API에서 얻은 supervision을 써야 하는 현실적 학습 파이프라인과도 맞닿아 있다. 실제로 논문과 프로젝트 페이지 모두 Gemini 계열 시연 데이터를 활용한다고 명시한다. 이 점은 오픈모델 후처리에서 꽤 실무적인 가치가 있다.

물론 한계도 분명하다. 첫째, 이 접근은 결국 좋은 supervision pool에 많이 의존한다. 113K의 추가 고품질 데이터와 1.26M public demonstration 없이 같은 효과가 유지될지는 별도 검증이 더 필요하다. 둘째, alignment stage를 위해 MoE discriminator warmup과 별도 stage orchestration이 추가되므로, 파이프라인 복잡도는 확실히 올라간다. 셋째, 공개 저장소는 코드와 체크포인트를 제공하지만 **GitHub tags가 비어 있고 `/releases/latest`도 404**라서, 아직은 연구 코드에 가까운 배포 상태로 보는 편이 맞다.

그럼에도 이 논문이 던지는 메시지는 강하다. 멀티모달 RL의 다음 개선 포인트가 보상 설계나 sampling trick만이 아니라, **SFT와 RL 사이의 분포 정렬 계층**일 수 있다는 것이다. PRISM은 그 계층을 명시적으로 드러낸 첫 번째 사례에 가깝고, 특히 Qwen3-VL처럼 이미 강한 base model에서 왜 SFT가 때로는 성능을 떨어뜨리는지 설명하는 데 꽤 설득력 있는 프레임을 제공한다.

Sources: https://huggingface.co/papers/2604.28123, https://arxiv.org/abs/2604.28123, https://arxiv.org/html/2604.28123v2, https://xiao4579.github.io/PRISM/, https://github.com/XIAO4579/PRISM