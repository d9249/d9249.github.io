---
title: "D³-MOPD는 멀티티처 증류의 도메인 비중을 학습 중에 다시 배분한다"
date: "2026-08-29T23:07:58+09:00"
description: "D³-MOPD는 multi-teacher on-policy distillation에서 이미 계산되는 도메인별 reverse-KL을 이용해, 빠르게 수렴한 도메인에서 아직 개선 중인 도메인으로 rollout 예산을 동적으로 옮기는 zero-overhead scheduler다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Multi-Teacher Distillation
  - On-Policy Distillation
  - Domain Scheduling
  - Reverse KL
  - Qwen3.6
draft: false
---

여러 specialist teacher를 하나의 student로 압축하는 multi-teacher on-policy distillation(MOPD)은 배포 시 teacher를 모두 서빙하지 않아도 된다는 장점이 있다.[1][2] 하지만 Math, Code, Instruction Following, Tool-use처럼 학습 난이도와 수렴 속도가 다른 도메인을 같은 비율로 계속 섞는다면, 이미 plateau에 들어간 도메인에 rollout 예산을 쓰고 느린 도메인은 덜 훈련하는 문제가 생긴다.[1][2]

`D³-MOPD`는 이 문제를 새로운 loss나 extra rollout으로 해결하지 않는다.[1] 대신 MOPD objective가 원래 산출하는 도메인별 reverse-KL history를 watcher가 읽어, 다음 batch의 domain mixture를 온라인으로 갱신한다.[1][2] 핵심은 모델의 능력을 더하는 것이 아니라, 이미 지불하는 학습 비용을 **아직 배울 여지가 있고 실제로 개선 중인 도메인**에 더 많이 배분하는 것이다.[2]

## 무엇을 해결하려는가

기존 vanilla MOPD의 per-domain mixture는 training 시작 전에 정한 뒤 고정된다.[2] 논문이 단일-domain OPD로 관찰한 결과는 도메인마다 다르다. Math는 초반에 reverse-KL이 빠르게 떨어진 뒤 floor 근처에서 멈추고, Code는 더 느리게 계속 하락하며, Instruction Following은 절대 KL이 더 큰 상태에서 학습 budget 전반에 걸쳐 개선된다.[2]

고정된 uniform mixture는 이런 비동기 수렴을 무시한다.[2] 예를 들어 세 도메인 실험에서 Code는 약 step 48, Math는 약 step 96에 low-KL 구간에 들어가지만, IF는 약 step 144까지 남은 gap을 보인다.[2] D³-MOPD의 출발점은 “모든 domain에 공평한 sample 수”가 아니라, **현재의 marginal learning value에 비례한 allocation**이다.[2]

## 핵심 아이디어 / 구조 / 동작 방식

watcher는 trainer와 별도 process로 실행된다.[2] trainer가 student rollout과 teacher prefill에서 얻은 sample별 reverse-KL을 shared log에 기록하면, watcher는 도메인별 EMA history에서 두 신호를 계산한다.[2] 첫째는 initial KL 대비 현재 smoothed KL의 비율인 remaining gap이고, 둘째는 최근 여러 window에서 KL이 실제로 내려가는 속도인 descent velocity다.[2]

D³-MOPD는 두 값을 곱한 composite signal을 softmax와 domain floor로 mixture로 바꾼다.[2] 따라서 gap만 크지만 더 이상 감소하지 않는 domain과, 빨리 감소하지만 거의 수렴한 domain 모두 지나치게 우대하지 않는다.[2] floor는 일시적으로 plateau한 domain이 allocation 0이 되는 것을 막아 catastrophic forgetting 위험을 낮춘다.[2]

| 구성 | 역할 | 학습 loop에 주는 변화 |
|---|---|---|
| Off-process watcher | domain별 reverse-KL의 gap·velocity를 읽어 mixture 계산 | trainer를 block하지 않음 |
| Stratified data source | 목표 mixture에 맞춰 다음 batch의 domain sample 수를 구성 | 기존 pool-and-shuffle을 교체 |
| Batch-level jitter | batch마다 비율을 작게 흔들어 long-run mixture 근처의 variation 유지 | 고정된 batch 조성을 피함 |
| Mixture floor | 모든 domain에 최소 비중 보장 | 일시적 plateau를 영구 배제로 바꾸지 않음 |

논문 구현은 watcher cadence 10 rollout step, velocity window 10 step과 3개 non-overlapping window, mixture floor 0.10, batch jitter 0.30을 사용한다.[2] 중요한 제약도 있다. scheduler가 zero-overhead라는 말은 KL 계산을 공짜로 만든다는 뜻이 아니라, **이미 MOPD loss를 위해 계산한 KL을 재사용하므로 추가 teacher rollout이나 별도 predictor training이 없다는 뜻**이다.[1][2]

## 공개된 근거에서 확인되는 점

주 실험은 Qwen3.6-35B-A3B student와 Math·Code·Instruction Following·Tool-use의 domain-expert teacher 네 개를 사용한다.[1][2] 256 rollout step에서 vanilla MOPD의 best-average checkpoint는 step 143, D³-MOPD는 step 95다.[2] 같은 best-average checkpoint 비교에서 normalized score는 vanilla 0.48, D³-MOPD 0.73으로 보고되며, AIME25·HMMT·IFEval·LiveCodeBench v6·OJBench C++·BFCL에서 D³-MOPD가 vanilla보다 높고 IFBench만 0.6 point 낮다.[2]

Peak value를 benchmark별로 따로 보면 논문은 D³-MOPD normalized score 0.97, vanilla 0.63을 제시한다.[1][2] specialist teacher 대비 gap도 평균 3% 수준까지 닫았다는 해석이며, HMMT, IFEval, OJBench에서는 specialist teacher peak보다 높은 값을 보고한다.[2] 다만 이 수치는 16개 evaluation checkpoint 중 각 benchmark의 최고값을 택한 표와, 하나의 best-average checkpoint를 고른 표가 구분돼 있으므로 같은 종류의 비교로 섞어 읽으면 안 된다.[2]

| 지표 | Vanilla MOPD | D³-MOPD | 읽는 법 |
|---|---:|---:|---|
| Best-average step | 143 | 95 | 동일 평균 peak까지 더 적은 rollout step |
| Best-checkpoint normalized score | 0.48 | 0.73 | 하나의 checkpoint에서 본 평균 상대 성능 |
| Per-benchmark peak normalized score | 0.63 | 0.97 | 각 benchmark의 최고 checkpoint를 따로 취한 값 |
| Teacher gap closure | 63% | 97% | 논문이 정의한 normalized score 기준 |

Ablation도 composite signal의 필요성을 보여 준다.[2] D³-MOPD의 평균 peak는 62.34이고, velocity를 빼면 61.41, gap을 빼면 61.46, jitter를 빼면 61.63, smoothing을 빼면 62.17로 낮아진다.[2] 이 결과는 gap과 velocity를 함께 써야 한다는 설계에는 힘을 싣지만, 절대적인 차이는 작다. 따라서 이 논문의 더 강한 메시지는 scheduler 자체의 거대한 SOTA leap보다는, **heterogeneous distillation의 sample allocation을 KL learning dynamics로 제어할 수 있다**는 점이다.[2]

## 실무 관점에서의 해석

D³-MOPD는 multi-domain training에서 data mixture를 고정된 dataset 비율로만 보지 말라는 제안이다. 모델이 어느 domain에서 현재 효율적으로 개선되는지를 알고 있다면, training budget은 static curriculum보다 control loop에 가깝게 다뤄야 한다.[2] 특히 여러 teacher를 운영하는 경우 teacher quality보다 먼저 “어느 teacher/domain에 다음 rollout을 줄 것인가”가 비용과 성능을 함께 좌우할 수 있다.[1][2]

그러나 general-purpose deployment 결론으로 확대하기에는 아직 이르다. 공개 arXiv v1은 code, project page, model checkpoint를 연결하지 않으며, 실험은 동일 backbone의 네 specialist와 특정 MOPD/slime training setup에 집중돼 있다.[1][2] reverse-KL plateau가 실제 task accuracy plateau의 reliable proxy인지, teacher family와 tool environment가 바뀌어도 watcher의 hyperparameter가 유지되는지는 독립 재현이 필요하다.[2]

그럼에도 이 방법은 agent와 foundation-model post-training 모두에 유용한 질문을 남긴다. 더 많은 data를 섞는 것보다, 각 data/domain이 지금도 **학습 가능한 signal**을 주는지 측정하고 budget을 재배분하는 편이 나은가. D³-MOPD는 이 질문에 이미 존재하는 reverse-KL telemetry만으로 답하려 한, 작지만 실용적인 scheduling layer다.[1][2]

## Sources

[1] https://arxiv.org/abs/2608.24987 — D3-MOPD arXiv abstract
[2] https://arxiv.org/html/2608.24987v1 — D3-MOPD arXiv HTML
