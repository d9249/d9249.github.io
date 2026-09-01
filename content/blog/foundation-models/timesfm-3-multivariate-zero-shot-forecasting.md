---
title: "TimesFM-3는 다변량 시계열을 한 번의 추론으로 예측하려 한다"
date: "2026-09-01T11:41:33"
description: "TimesFM-3는 목표 시계열·과거 공변량·알려진 미래 공변량을 함께 읽고 시간축 인과 주의와 변수축 전체 주의를 교차시켜, fine-tuning 없이 다변량 예측과 분위수 예측을 한 번의 forward pass로 수행하려는 3억 3천만 파라미터 시계열 파운데이션 모델이다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - TimesFM-3
  - Time Series Forecasting
  - Foundation Models
  - Multivariate Forecasting
  - Google Research
draft: false
---

시계열 예측은 종종 한 줄의 과거 데이터에서 다음 값을 맞히는 문제로 축소된다. 그러나 재고·매출·수요·관측 지표의 실제 예측에서는 상품 간 관계, 과거 유입량, 예정된 행사와 날씨처럼 **미래에 이미 알려진 외생 신호**가 함께 움직인다. TimesFM-2.5까지 단변량 예측에 머물렀던 Google Research의 TimesFM 계열은, 이번 TimesFM-3에서 그 다변량 조건을 zero-shot 모델의 기본 입력으로 올렸다.[1]

TimesFM-3는 3억 3천만 파라미터 규모로, 실제·합성 시계열을 합친 1조 개 이상 시점의 말뭉치에서 사전학습됐다고 발표됐다.[1] 핵심 주장은 복잡한 다변량 예측을 task별 fine-tuning 없이 수행하되, 예측 구간 전체를 반복 생성하지 않고 한 번의 forward pass에서 산출한다는 것이다.[1]

모델 가중치는 Hugging Face에서 공개됐지만, 코드의 Apache-2.0 라이선스와 달리 TimesFM-3 기본 가중치는 비상업·비프로덕션 용도로 제한된 별도 라이선스다.[2][3]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/timesfm-3-architecture.png"
    alt="목표 시계열과 공변량을 32개 시점 패치로 만들고, 시간축 인과 주의와 변수축 전체 주의를 교차해 여러 목표 시계열의 미래 구간을 예측하는 TimesFM-3 공식 구조도"
    style="width: 100%; max-width: 900px; height: auto; display: block; margin: 0 auto;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    TimesFM-3는 시간 방향의 인과성은 유지하면서 같은 시점의 다른 변수는 함께 읽는다. 녹색 F1처럼 미래까지 알려진 공변량은 lookahead 입력으로 유지된다.[1]
  </figcaption>
</figure>

## 무엇을 해결하려는가

단변량 모델은 목표값의 과거만으로 미래를 외삽한다.[1] 이 방식은 계절성이나 반복 패턴에는 강할 수 있지만, 예정된 프로모션·휴일·날씨처럼 미래 시점에 이미 알려진 변화나 서로 얽힌 여러 수요 신호를 모델 안에서 직접 활용하기 어렵다.[1] Google의 예시는 아이스크림 매출을 예측할 때 과거 매출뿐 아니라 콘·시럽·유동인구와 향후 판촉·날씨를 함께 읽어야 한다는 문제를 보여 준다.[1]

TimesFM-3는 입력을 세 부류로 구분한다.[1] 여러 목표 시계열을 동시에 예측하고, 과거에서만 알 수 있는 공변량과 예측 구간까지 미리 아는 동적 공변량을 각각 별도 표면으로 받는다.[1] 따라서 모델의 유용성은 “변수를 많이 넣을 수 있다”는 데보다, 미래 정보가 알려진 범위를 명시적으로 구분해 leakage 없이 예측 계산에 넣는 데 있다.

| 입력 | 예측 구간·역할 |
|---|---|
| 목표 시계열 | **미지** — 여러 관련 target을 함께 예측 |
| 과거 공변량 | **미지** — 과거의 보조 관측치로 관계를 학습 |
| 과거-미래 공변량 | **알려짐** — 판촉·휴일·날씨 예보처럼 예정된 신호를 예측 구간까지 제공 |

이 구분은 실무에서 데이터 계약을 먼저 정하게 만든다. 예를 들어 내일의 판촉 일정은 valid한 future covariate지만, 내일의 실제 유입량을 지금 입력하는 것은 아니다. 모델 전환 전에 feature별 업데이트 시점과 예측 시점의 정보 가용성을 점검해야 하는 이유다.

## 핵심 아이디어 / 구조 / 동작 방식

입력 시계열은 연속된 32개 시점씩 patch로 묶이고, 시계열마다 정규화된다.[1] 목표와 과거 공변량은 한 patch에서 token을 만들지만, 과거-미래 공변량 token에는 현재 patch와 이어지는 미래 patch를 함께 붙이는 lookahead를 쓴다.[1] 이것은 미래 target을 보는 장치가 아니라, 이미 확정된 휴일·프로모션 같은 신호를 예측 구간에 전달하는 장치다.[1]

Transformer 내부에는 두 종류의 attention이 교차한다.[1] 시간축의 causal temporal attention은 같은 시계열에서 과거 token만 보므로 예측 누설을 막고, 변수축의 full variate attention은 같은 시점의 다른 시계열을 모두 보며 cross-series 관계를 학습한다.[1] 여러 변수를 하나의 긴 순서로 평평하게 합치는 대신, 시간과 변수라는 두 축을 분리해서 처리하는 설계다.[1]

출력 단계도 이전 세대와 다르다.[1] TimesFM-3는 미래 구간에 mask placeholder를 붙인 뒤 Contiguous Patch Masking으로 그 구간의 모든 patch를 동시에 채운다.[1] 한 patch씩 자기회귀로 생성하는 반복 loop를 없애 latency와 오차 누적을 줄이려는 선택이며, 각 목표 시계열·각 horizon step에 대해 10~90백분위의 9개 분위수도 함께 낸다.[1]

## 공개된 근거에서 확인되는 점

Google은 GIFT-Eval, FEV-Bench, TIME 세 공개 벤치마크에서 point forecast와 probabilistic forecast의 평균 순위를 비교했고, TimesFM-3가 사전학습된 foundation model 가운데 세 벤치마크 모두에서 최상위라고 보고한다.[1] 순위는 낮을수록 좋으며, 발표 차트는 공변량·교차 시계열 정보를 뺀 단변량 모드도 경쟁 모델과 비슷하거나 더 좋은 위치에 있고, 다변량 모드가 추가 개선을 만든다고 해석한다.[1]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/timesfm-3-benchmark-ranks.png"
    alt="GIFT-Eval에서 TimesFM-3 다변량 모드와 단변량 모드를 Chronos-2, Toto-2.0, TimesFM-2.5 등과 비교한 평균 순위 산점도. 왼쪽 아래일수록 점·확률 예측 평균 순위가 좋다."
    style="width: 100%; max-width: 900px; height: auto; display: block; margin: 0 auto;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    GIFT-Eval 공식 발표 차트. 왼쪽 아래가 더 좋은 평균 순위이며, 주황색은 TimesFM-3다. 이 비교는 Google이 공개한 평가 결과이므로 실제 도입 데이터에서 별도 검증이 필요하다.[1]
  </figcaption>
</figure>

공개 모델 카드에는 Stacked Mixing Transformer, Variate Attention, CPM Iterative RevIN, 20개 transformer layer, 모델 차원 1,280, 16개 head가 명시돼 있다.[3] Hugging Face API 기준 단일 `model.safetensors` 파일로 배포되며, FP32 파라미터 수는 330,710,976개다.[3] GitHub 저장소는 v3.0.0 release와 TimesFM-3용 다변량·공변량 예제를 제공한다.[2]

다만 공개 상태를 두 층으로 읽어야 한다. 저장소의 소스 코드는 Apache-2.0이지만, TimesFM-3 pretrained weights는 `timesfm-non-commercial-license-v1.0`으로 배포되고 상업 또는 프로덕션 사용이 허용되지 않는다.[2][3] 즉 실험·평가·내부 연구를 위한 코드와 checkpoint는 갖췄지만, 기본 가중치를 곧바로 상용 예측 서비스에 넣을 수 있다는 뜻은 아니다.

## 실무 관점에서의 해석

TimesFM-3의 가장 실질적인 변화는 다변량 예측의 성능 주장보다 **예측 요청의 인터페이스**에 있다. 과거 관측치와 미래에 확정된 신호를 분리하고, 여러 target을 같은 모델 호출에서 예측하며, point estimate와 quantile을 함께 반환한다. 수요 예측이나 observability 팀이라면 모델 교체만큼 feature freshness, promotion calendar, weather feed, horizon별 data availability를 다시 정의하는 작업이 중요해진다.

한 번의 forward pass라는 특성도 항상 자동 이득은 아니다. 긴 horizon에서 반복 decoding 비용을 줄일 여지는 크지만, 다변량 attention의 실제 latency와 memory는 변수 수·context 길이·batch 구성에 따라 달라진다. 그러므로 현재 단변량 baseline과 비교할 때 MAE 하나만 보지 말고, target 수별 latency, quantile calibration, feature 누락 시의 성능 저하, 전체 예측 파이프라인 비용을 함께 측정하는 편이 안전하다.

가장 큰 도입 제약은 라이선스다. 비상업 기본 가중치는 연구용 PoC와 benchmark 재현에는 유용하지만, production 전환의 허들은 성능이 아니라 사용 권한이 될 수 있다.[2][3] TimesFM-3는 “모델 하나를 다운로드해 바로 배포하는” 릴리스보다, 다변량 zero-shot forecasting의 제품 형태와 그 운영 조건을 구체적으로 보여 주는 공개 기준점으로 보는 편이 정확하다.

## Sources

[1] https://research.google/blog/timesfm-3-a-zero-shot-foundation-model-for-multivariate-forecasting — TimesFM-3 공식 Google Research 발표
[2] https://github.com/google-research/timesfm — TimesFM 공식 GitHub 저장소
[3] https://huggingface.co/google/timesfm-3.0-pytorch — TimesFM 3.0 공식 Hugging Face 모델 카드
