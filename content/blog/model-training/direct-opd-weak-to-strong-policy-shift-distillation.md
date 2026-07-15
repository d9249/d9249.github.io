---
title: "Direct-OPD는 작은 모델의 RL 결과를 큰 모델용 보상으로 다시 쓴다"
date: "2026-07-15T11:21:51+09:00"
description: "Direct-OPD는 작은 RL teacher의 최종 정책을 모방하지 않고, 사전·사후 체크포인트의 로그비에 남은 policy shift를 큰 student의 온폴리시 학습용 dense reward로 바꿔 weak-to-strong post-training의 비용 구조를 재설계한다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Direct-OPD
  - On-policy Distillation
  - Reinforcement Learning
  - Weak-to-Strong Generalization
  - Reasoning Models
image: "/images/blog/direct-opd-intro-opd-vs-direct.webp"
draft: false
---

추론 모델의 강화학습은 대개 두 번 비싸다. 정답을 검증할 수 있는 수학·코딩 문제를 마련해야 하고, **학습 대상 모델 자신이** 긴 rollout을 반복 생성하며 보상을 받아야 한다. 모델이 커질수록 후자의 비용이 빠르게 커진다. 그래서 작은 모델에서 이미 성공한 RL 학습을 더 큰 모델에 어떻게 재사용할지가 post-training의 중요한 질문이 됐다.

`Weak-to-Strong Generalization via Direct On-Policy Distillation`은 이 문제의 전제를 바꾼다. 작은 teacher의 *최종 답변 분포*를 큰 student가 따라 하게 만들면, RL로 얻은 개선뿐 아니라 작은 모델의 능력 상한까지 함께 복사할 수 있다. 대신 Direct-OPD는 RL 전후의 작은 모델 체크포인트 한 쌍을 비교한다. 이때 생기는 확률 변화, 즉 **policy shift**만을 뽑아 큰 모델의 자기 rollout 위에서 읽는다.

이 구분은 실제 결과와도 맞닿아 있다. 논문은 post-RL JustRL-1.5B teacher를 그대로 모방하는 일반 OPD가 이미 더 강한 R1-Distill-7B를 약 56.7에서 약 50으로 떨어뜨린다고 보인다. 반면 teacher의 RL 전후 차이만 쓰는 Direct-OPD는 같은 종류의 신호로 R1-Distill-7B, Qwen3-1.7B, Qwen3-4B를 모두 끌어올린다. 핵심은 “작은 모델을 흉내 낸다”가 아니라, **작은 모델의 RL이 어느 행동을 밀고 억제했는지**를 재활용한다는 데 있다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/direct-opd-intro-opd-vs-direct.webp"
    alt="Direct-OPD와 일반 OPD의 성능 차이 및 약한 teacher에서 강한 student로의 policy shift 전이 결과"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 프로젝트 페이지의 도입 비교. 왼쪽은 약한 post-RL teacher 자체를 모방하는 OPD가 강한 student를 끌어내릴 수 있음을, 오른쪽은 같은 RL 변화량을 전이하면 더 강한 student도 개선될 수 있음을 보여 준다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

RLVR(Reinforcement Learning with Verifiable Rewards)는 계산 가능한 정답이나 verifier가 있는 과제에서 강력하지만, 더 큰 모델마다 RL을 처음부터 다시 수행하는 방식은 비효율적이다. 각 update마다 현재 정책으로 rollout을 만들고, 그 결과를 채점해 policy를 갱신해야 하기 때문이다. target model이 커질수록 rollout 비용과 학습 wall-clock이 함께 늘어난다.

기존 on-policy distillation(OPD)은 student가 자기 trajectory를 생성하고 teacher의 token 분포를 그 상태에서 맞추도록 한다. 이 방식은 student가 실제로 방문하는 상태에서 dense supervision을 받는다는 장점이 있다. 그러나 약한 teacher를 strong student에게 그대로 증류하는 상황에는 문제가 있다. post-RL teacher의 분포에는 두 신호가 섞여 있기 때문이다.

| post-RL teacher에 섞인 것 | strong student에 그대로 모방할 때의 결과 |
|---|---|
| RL이 새로 강화한 token·추론 방향 | 전이하고 싶은 유용한 학습 신호 |
| 작은 모델의 사전 능력·표현 한계 | 이미 더 강한 student를 불필요하게 낮출 수 있는 상한 |

Direct-OPD의 문제 설정은 이 둘을 분리하는 것이다. 작은 모델을 RL이 실행된 값싼 탐색 장치로 보고, 그 실행이 만든 **개선 방향**만 student에게 전달한다. 따라서 weak-to-strong은 teacher의 절대 성능을 넘을 수 없다는 일반적인 증류의 직관을 직접 시험한다.

## 핵심 아이디어 / 구조 / 동작 방식

teacher의 RL 이전 기준 체크포인트를 $\pi_{T_{\mathrm{ref}}}$, RL 이후 teacher를 $\pi_T$라 두면 Direct-OPD가 읽는 신호는 다음과 같다.

$$
\Delta_T(y \mid x) = \log \pi_T(y \mid x) - \log \pi_{T_{\mathrm{ref}}}(y \mid x)
$$

같은 prompt에서 어떤 응답의 확률이 RL 뒤 높아졌다면 $\Delta_T$는 양수, 낮아졌다면 음수가 된다. 논문은 KL-regularized RL의 해가 $\pi^* \propto \pi_{\mathrm{ref}}\exp(r/\beta)$라는 성질을 사용한다. 따라서 post-RL policy와 reference policy의 로그비는 prompt별 상수를 제외하면, teacher RL이 사용한 reward에 비례하는 값으로 해석할 수 있다.

중요한 것은 이 reward-like signal을 **teacher가 만든 trajectory**가 아니라 student가 현재 만든 trajectory에서 평가한다는 점이다. 매 prefix에서 student가 고려하는 top-$k$ token에 대해 teacher와 reference의 log-prob 차이를 계산하고, 이를 dense token-level reward로 쓴다. student는 자기 초기 체크포인트 $\pi_S$에서 너무 멀어지지 않도록 별도의 KL 항으로 제약된다.

| 단계 | Direct-OPD에서 일어나는 일 | 목적 |
|---|---|---|
| 1. 작은 모델 RL | $\pi_{T_{\mathrm{ref}}} \rightarrow \pi_T$ | 값싼 모델에서 verifier 기반 탐색과 credit assignment 수행 |
| 2. policy shift 추출 | $\log \pi_T - \log \pi_{T_{\mathrm{ref}}}$ | 작은 모델 자체가 아니라 RL이 만든 변화만 분리 |
| 3. student on-policy rollout | 현재 $\pi_\theta$가 응답과 prefix 생성 | 실제 배포 모델이 방문할 상태에서 학습 |
| 4. top-$k$ dense supervision | student 후보 token을 shift로 점수화 | sparse reward를 다시 실행하지 않고 local learning signal 제공 |
| 5. student KL 제어 | $\pi_\theta$를 $\pi_S$에 anchor | teacher/reference가 의미 없는 OOD 상태로의 과도한 drift 억제 |

구현상 Direct-OPD는 일반 OPD의 on-policy·top-$k$ 인터페이스를 유지한다. 달라지는 것은 teacher의 최종 확률분포를 KL로 맞추는 대신, teacher/reference 쌍의 차이를 token별 advantage처럼 사용한다는 부분이다. 논문 기본 설정은 `verl` 위에서 global batch 64, rollout $n=4$, student top-$k=16$, 300 step, 최대 응답 길이 2,048 token이다.

### KL은 부수적 regularizer가 아니라 신호의 적용 범위를 정한다

논문이 짚는 실무적 난점은 policy shift의 절대 스케일을 사전에 알기 어렵다는 것이다. teacher가 어떤 KL budget과 reward scale로 학습됐는지는 checkpoint 차이만으로 완전히 복원되지 않는다. student가 너무 자유롭게 움직이면 teacher와 reference 모두 낮은 확률을 주는 영역으로 가서 큰 로그비가 노이즈가 될 수 있고, 반대로 KL이 너무 강하면 유용한 변화를 따라가지 못한다.

그래서 저자들은 batch에서 관측되는 student-weighted shift의 부호에 따라 KL coefficient를 조금씩 조절하는 adaptive-KL controller도 제안한다. 이 결과는 Direct-OPD를 “teacher difference를 최대화하는 단순 reward hacking”이 아니라, **teacher 쌍의 비교가 계속 의미 있는 rollout 분포를 유지하는 문제**로 읽어야 함을 보여 준다.

## 공개된 근거에서 확인되는 점

첫 번째 실험은 R1-Distill-1.5B → JustRL-1.5B teacher pair의 변화를 세 student에 옮긴다. AIME는 각 문제에 32개 sample을 생성하는 `average@32`로 보고되므로, 단일 샷 배포 성능과 같은 지표로 읽으면 안 된다. 다만 teacher보다 이미 출발점이 높은 모델도 개선되는지가 방법의 핵심 검증이다.

| student | AIME 2024: 초기 → Direct-OPD | 변화 | AIME 2025: 초기 → Direct-OPD | 변화 |
|---|---:|---:|---:|---:|
| Qwen3-1.7B | 48.3 → **58.3** | +10.0 | 36.8 → **43.2** | +6.4 |
| Qwen3-4B | 72.5 → **77.6** | +5.1 | 65.6 → **68.8** | +3.2 |
| R1-Distill-7B | 56.7 → **63.1** | +6.4 | 40.5 → **48.8** | +8.3 |

JustRL-1.5B post-RL teacher의 AIME 2024 점수는 51.3이다. 그보다 높은 점수에서 시작한 Qwen3-4B와 R1-Distill-7B도 개선됐다는 점이 중요하다. 이 결과만으로 일반적 weak-to-strong 성립을 단정할 수는 없지만, 최소한 이 설정에서는 final teacher imitation보다 policy shift가 더 적절한 전이 단위라는 해석을 지지한다.

두 번째 teacher pair인 Nemotron-1.5B → QuestA-Nemotron-1.5B에서도 Qwen3-1.7B는 AIME 2024에서 48.3 → 59.0, R1-Distill-7B는 56.3 → 61.2로 보고됐다. 더 나아가 Qwen3-1.7B에 JustRL shift를 먼저 적용하고 QuestA shift를 이어 적용했을 때, AIME 2024는 48.3 → 58.3 → 63.8로 늘었다. 서로 다른 RL run의 변화를 순차적으로 합성할 수 있다는 실험이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/direct-opd-sequential-composition.webp"
    alt="Qwen3-1.7B에 JustRL과 QuestA policy shift를 순차 적용했을 때 AIME 2024와 AIME 2025 성능이 상승하는 그래프"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 프로젝트 페이지의 순차 조합 결과. Qwen3-1.7B는 JustRL shift 적용 뒤 QuestA shift를 이어 받아 AIME 2024에서 48.3에서 63.8까지 상승했다고 보고된다.
  </figcaption>
</figure>

비용 비교도 논문의 강한 주장 중 하나다. R1-Distill-7B를 직접 RL하는 경로와, R1-Distill-1.5B에서 RL을 한 뒤 7B로 shift를 옮기는 경로를 같은 RL step 기준으로 비교했다. 저자들의 환경에서 1.5B 모델 1,500 RL step은 32×A100으로 약 160시간, 7B 직접 RL은 약 320시간이 들었다. 이후 Direct-OPD transfer는 8×A100에서 약 4시간을 추가한다. 즉 값비싼 exploration을 작은 모델로 옮기고, 큰 모델에는 짧은 dense-supervision 단계만 남기는 구조다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/direct-opd-weak-to-strong-compute.webp"
    alt="작은 모델 RL 뒤 Direct-OPD 전이와 큰 모델 직접 RL의 AIME 2025 성능 및 시간 비교"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 프로젝트 페이지의 compute 비교. 같은 RL step 관점에서 작은 모델이 찾은 shift를 옮기는 경로가 직접 대형 모델 RL보다 더 짧은 wall-clock 경로에서 높은 성능 지점에 도달한다는 것이 저자들의 주장이다.
  </figcaption>
</figure>

공개 범위도 비교적 구체적이다. 공식 GitHub 저장소는 Apache-2.0 license로 공개돼 있고, `verl`의 patched source tree, training script, 작은 validation parquet, setup 문서를 담고 있다. README와 setup 문서는 Qwen3-1.7B / JustRL-DeepSeek-1.5B / DeepSeek-R1-Distill-Qwen-1.5B 가중치와 Skywork-OR1의 105,055-row math parquet은 별도로 준비해야 한다고 명시한다. 즉 재현 가능한 연구 코드에 가깝지만, 모든 학습 입력을 포함한 원클릭 패키지는 아니다.

Hugging Face collection에는 gated가 아닌 여섯 개 결과 checkpoint가 연결돼 있다. 예를 들어 `Sequential-Qwen3-1.7B`는 Qwen3-1.7B 기반 약 2.03B parameter safetensors model로, 순차 shift 조합의 결과를 직접 확인할 수 있다. `JustRL-R1-7B`, `QuestA-R1-7B`도 각각 약 7.62B parameter checkpoint로 공개돼 있다. 다만 GitHub 저장소는 2026년 7월 6일 생성된 초기 release이며, 확인 시점 tags와 GitHub Releases는 없다. 연구 artifact로서 검토·실험하기에는 충분한 출발점이지만, 장기 유지되는 범용 training library로 보기는 이르다.

## 실무 관점에서의 해석

Direct-OPD의 가장 흥미로운 제안은 RL 결과물을 **완성된 모델**이 아니라 **재사용 가능한 방향성**으로 취급하는 것이다. 보통 작은 RL model은 더 큰 model으로 가기 전의 baseline, 또는 더 큰 teacher를 위한 값싼 student로 생각된다. 여기서는 반대로 작은 model이 verifier feedback을 통해 발견한 행동 변화가 자산이 된다. 큰 model은 자신의 표현 능력과 reasoning pattern을 유지한 채 그 자산을 읽는다.

이 관점은 RL 비용을 계층화할 수 있는 팀에 특히 유용하다. 같은 base family에서 작은 model로 reward·data·rollout recipe를 빠르게 탐색하고, 검증된 shift만 중간 또는 큰 model로 보내는 방식이다. 하나의 teacher endpoint에 종속되지 않으므로, 서로 다른 teacher pair에서 발견한 변화를 순차적으로 조합할 여지도 있다. 모델 병합처럼 weight delta를 더하는 방식과도 다르다. 이 방법은 행동 공간에서 계산한 log-ratio를 student가 실제 방문한 state에만 적용한다.

하지만 적용 조건은 꽤 강하다. 우선 pre-RL과 post-RL teacher checkpoint가 모두 필요하고, 같은 tokenizer·확률 공간에서 log-prob를 읽을 수 있어야 한다. 또한 shift가 teacher의 실제 개선을 반영해야 한다. teacher RL이 verifier의 허점을 학습했거나, student가 teacher pair와 전혀 다른 OOD state로 이동하면 로그비는 좋은 reward가 아닐 수 있다. 논문도 최적 KL과 적절한 response length가 teacher–student pair에 따라 달라진다고 보고한다.

평가 범위도 제한적이다. 중심 결과는 수학 reasoning과 AIME 2024/2025이며, `average@32`는 여러 sample을 내는 평가다. 단일 응답 품질, latency, serving cost, 개방형 지식 또는 tool orchestration으로 곧장 일반화할 근거는 아직 약하다. 그럼에도 Direct-OPD는 post-training의 질문을 정확히 한 단계 앞으로 옮긴다. **작은 모델에서 비싸게 찾은 RL 신호 중 무엇을 큰 모델에 옮겨야 하는가?** 이 논문은 답을 final policy가 아니라 policy shift라고 제안한다.

Sources: https://arxiv.org/abs/2607.05394, https://arxiv.org/html/2607.05394v2, https://bytedtsinghua-sia.github.io/Direct-OPD/, https://github.com/BytedTsinghua-SIA/Direct-OPD, https://raw.githubusercontent.com/BytedTsinghua-SIA/Direct-OPD/main/docs/setup.md, https://huggingface.co/collections/BytedTsinghua-SIA/direct-opd, https://huggingface.co/api/models/BytedTsinghua-SIA/Sequential-Qwen3-1.7B, https://huggingface.co/api/models/BytedTsinghua-SIA/JustRL-R1-7B, https://huggingface.co/api/models/BytedTsinghua-SIA/QuestA-R1-7B
