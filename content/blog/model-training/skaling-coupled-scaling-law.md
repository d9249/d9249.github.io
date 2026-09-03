---
title: "Skaling은 스케일링 법칙의 실험 예산을 ‘전면 격자’에서 경계 샘플링으로 옮긴다"
date: "2026-09-03T18:30:27+09:00"
description: "Skaling은 모델 크기와 학습 토큰 수가 독립적으로 loss를 낮춘다는 Chinchilla의 가정을 하나의 결합 지수로 완화하고, 저비용 L-shape 격자만으로 대규모 학습 구간의 loss를 예측하려는 스케일링 법칙이다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Scaling Laws
  - Chinchilla
  - Compute Allocation
  - LLM Training
  - Skaling
draft: false
---

대규모 사전학습의 예산 결정은 대개 작은 모델·짧은 학습에서 관측한 loss를 더 큰 모델과 더 긴 token horizon으로 외삽하는 문제다. 널리 쓰이는 Chinchilla 계열 법칙은 모델 크기 `N`과 학습 토큰 수 `D`의 효과를 별도 항으로 더한다. 단순하고 해석하기 좋지만, 이 형태는 두 변수가 서로 영향을 주지 않는다는 강한 가정을 품고 있다.

`Skaling: Chinchilla's Exponents Meet Kaplan's Coupling`은 바로 그 가정을 검증 대상으로 둔다. 저자들은 `N`과 `D`를 함께 키울 때의 loss 감소가 각각을 따로 키운 효과의 단순 합이 아닐 수 있다고 보고, Chinchilla의 두 항을 유지하면서도 전체에 결합 지수 하나를 둔다.[1][2] 핵심은 더 복잡한 곡선을 맞추는 일이 아니라, **저비용 구간의 실험으로 큰 학습 run의 경계 오차를 얼마나 안정적으로 예측할 수 있는가**다.

논문은 이 결합형이 interpolation뿐 아니라 모델·데이터 한쪽 또는 양쪽을 벗어나는 extrapolation에서 MAPE를 1.5–3배 낮춘다고 보고한다. 또한 전체 `(N, D)` 격자를 채우지 않고 낮은 compute 경계만 샘플링하는 L-shape 설계로, full-grid Chinchilla와 비슷한 예측 정확도를 최대 약 10배 적은 profiling compute로 얻을 수 있다고 주장한다.[1][2]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/skaling-coupled-scaling-law-boundary-error.webp"
    alt="Chinchilla와 Skaling의 예측 오차를 비교한 공식 그림. Chinchilla는 격자 모서리에서 파란색과 빨간색 오차가 교차하는 안장형 잔차를 보이는 반면, Skaling은 오차가 더 작고 균일하다."
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 Figure 1. 왼쪽부터 Chinchilla의 signed error, Skaling의 signed error, 두 방법의 run별 MAPE 비율이다. Skaling이 76%의 구성에서 더 낮은 오차를 보였다고 저자들은 보고한다.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

Chinchilla의 환원 가능 loss는 개념적으로 `A / N^α + B / D^β + E`처럼 쓸 수 있다. 이 덧셈 구조에서는 혼합 미분 `∂²L / ∂N∂D`가 항상 0이다. 즉 모델 크기를 키운 효과와 데이터를 더 넣은 효과가 서로의 수익률을 바꾸지 않는다고 모델이 미리 결정한다.[2]

저자들은 Farseer 데이터의 local derivative를 살펴본 뒤, 이 가정이 실제 측정 grid와 맞지 않는다고 해석한다. 추정된 혼합 미분은 grid 전반에서 0이 아니고 주로 음수였으며, 이는 모델과 데이터를 함께 키울 때 loss 감소가 단독 증가의 합보다 커지는 synergy와 일관된다는 설명이다.[2] 이때 additive law는 격자 내부에서는 그럴듯하게 맞아도, 데이터가 부족한 큰 모델 또는 오래 학습한 작은 모델 같은 모서리에서 체계적인 과대·과소예측을 만들 수 있다.

이 구분은 실무적으로 중요하다. scaling law의 목적은 이미 실행한 run을 설명하는 것이 아니라, 아직 비싼 run을 실행할지와 `N:D` 예산 비율을 어떻게 둘지 결정하는 데 있기 때문이다. 따라서 높은 interpolation `R²`만으로는 충분하지 않고, 큰 `N`, 큰 `D`, 그리고 둘 다 큰 far extrapolation의 오차를 따로 봐야 한다.

## 핵심 아이디어 / 구조 / 동작 방식

Skaling의 형태는 다음과 같다.

```text
L(N, D) = (A / N^α + B / D^β)^k + E
```

`k=1`이면 정확히 additive Chinchilla 형태로 돌아간다. `k≠1`일 때만 두 항의 합 전체가 결합되어, non-zero cross-derivative를 표현할 수 있다. Kaplan식 coupling의 장점은 되살리되, 안쪽의 `α`와 `β`는 독립적으로 남겨 Chinchilla의 해석 가능성과 고정 compute 예산에서의 closed-form allocation 구조를 보존하려는 절충이다.[2]

두 번째 기여는 법칙 자체보다 실험 배치에 가깝다. 전체 격자는 큰 모델을 가장 긴 token horizon까지 학습하는 오른쪽 위 모서리에 compute가 집중된다. 논문은 대신 가장 작은 모델에서 `D`만 넓게 훑는 band와, 가장 짧은 학습 horizon에서 `N`만 넓게 훑는 band를 합친 L-shape grid를 쓴다. 각 축의 decay를 저비용 경계에서 먼저 고정한 뒤, 그 정보로 결합을 추정하는 방식이다.[2]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/skaling-coupled-scaling-law-sparse-grid.webp"
    alt="무작위 holdout, L-shape 저비용 경계 학습 grid, 데이터 축 band를 비교한 Skaling 공식 샘플링 전략 그림. 파란색은 학습 구성, 빨간색은 검증 구성을 뜻한다."
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 Figure 6(a)의 sampling 전략. L-shape는 가장 큰 모델·가장 긴 학습을 조합한 고비용 내부를 비우고, 두 저비용 경계에서 parameter와 data의 감쇠율을 관찰한다.[2]
  </figcaption>
</figure>

- **Chinchilla**: `N`과 `D`의 두 독립 항을 더한다. 따라서 혼합 미분은 구조적으로 0이다.
- **Skaling**: 두 항의 합 전체에 결합 지수 `k`를 적용한다. `k≠1`이면 non-zero mixed derivative를 표현할 수 있다.
- **호환성**: `k=1`에서 Chinchilla를 포함하는 nested form이므로, 데이터가 additive surface를 지지하면 더 복잡한 결합을 강제하지 않는다.
- **실험 설계**: full grid 또는 일반 holdout 대신, 저비용 `N`-band와 `D`-band를 합친 L-shape profiling을 제안한다.

## 공개된 근거에서 확인되는 점

평가는 Farseer와 저자들이 구성한 SK-Grid에서 수행됐다. Farseer는 100M–6.4B parameter, 1B–512B token 범위의 404개 구성이고, SK-Grid는 134M–4.9B parameter와 316M–316B token 범위의 134개 구성이다. 모든 법칙은 같은 log-space Huber objective와 optimizer로 fit했고, 5-fold 평가에서 interpolation과 세 종류의 extrapolation MAPE를 분리해 보고했다.[2]

| 평가 설정 | MAPE: Chinchilla → Skaling |
|---|---:|
| Farseer full, 큰 `N` 외삽 | 1.48% → 0.47% |
| Farseer full, 큰 `D` 외삽 | 1.98% → 0.88% |
| SK-Grid full, far 외삽 | 5.17% → 0.70% |
| Farseer L-shape, far 외삽 | 9.82% → 1.51% |
| SK-Grid L-shape, far 외삽 | 14.63% → 1.15% |

가장 큰 차이는 두 축을 함께 벗어나는 far extrapolation과 저비용 L-shape 설정에서 나타난다. 즉 논문이 보여 주는 패턴은 interpolation의 미세한 차이보다, 큰 run을 아직 보지 못한 상태에서의 경계 예측 안정성에 가깝다.[2]

또 하나의 별도 compute extrapolation 실험에서, 저자들은 14개 고정 `D/N` slice마다 가장 고비용 8개 run을 holdout했다. 모든 slice를 합친 112개 holdout run에서 Skaling의 평균 MAPE는 0.60%였고, Chinchilla는 2.34%, 더 많은 parameter를 쓰는 Farseer는 0.80%였다.[2] 다만 이 결과는 해당 데이터·학습 recipe·fitting protocol 안의 예측 성능이며, 새 아키텍처나 데이터 혼합에서 자동으로 같은 효과가 난다는 보장은 아니다.

공개 범위도 구분해야 한다. arXiv v1은 논문 HTML·PDF·TeX source를 제공하며, 본문은 Meta Lingua를 SK-Grid의 기본 training framework로 참조한다.[2][3] 그러나 논문 전용 fitting script, dataset, 결과 재현 config를 묶은 공식 Skaling repository는 확인되지 않았다. 따라서 현재는 공개 논문과 실험 결과가 있는 방법론으로는 읽을 수 있지만, 바로 실행 가능한 reproduction package로 부르기에는 근거가 부족하다.

## 실무 관점에서의 해석

Skaling의 가장 현실적인 메시지는 “Chinchilla가 틀렸다”보다 **예산이 제한된 scaling study에서 어떤 실험을 먼저 실행할 것인가**에 있다. full grid를 작게라도 촘촘히 채우면 그래프는 보기 좋지만, 가장 비싼 오른쪽 위 몇 점이 예산 대부분을 소비한다. 먼저 `N`과 `D`를 한 축씩 움직이는 경계 run을 설계하고, 이후 coupling이 실제로 있는지 mixed derivative와 held-out corner error로 검증하는 편이 더 정보 효율적일 수 있다.

다만 L-shape가 범용 절약법은 아니다. 논문도 coupling이 additive에 가까운 Farseer-code와 원래 Chinchilla 측정값에서는 Skaling이 대체로 Chinchilla 수준의 정확도로 수렴한다고 보고한다.[2] 먼저 작은 pilot grid에서 cross-derivative, parameter stability, far extrapolation error를 확인한 뒤에만 고비용 full-grid를 줄이는 것이 안전하다.

팀 관점에서는 scaling law를 하나의 숫자나 고정 token-to-parameter ratio로 취급하지 않는 것이 핵심이다. 데이터 품질, architecture, optimizer recipe가 바뀌면 fit된 `A`, `B`, `α`, `β`, `k`와 최적 allocation도 다시 달라진다. Skaling은 그 재추정 과정을 대체하지 않는다. 대신 모델 크기와 학습 데이터가 독립이라는 기본 가정부터 검증하고, 그 검증을 더 싼 실험 설계와 연결한다는 점에서 유용하다.

## Sources

1. [Skaling: Chinchilla's Exponents Meet Kaplan's Coupling — arXiv abstract](https://arxiv.org/abs/2608.07222)
2. [Skaling: Chinchilla's Exponents Meet Kaplan's Coupling — arXiv HTML v1](https://arxiv.org/html/2608.07222v1)
3. [Meta Lingua — facebookresearch/lingua](https://github.com/facebookresearch/lingua)
