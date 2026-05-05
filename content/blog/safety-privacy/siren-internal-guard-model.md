---
title: "SIREN은 LLM 내부 표현으로 더 가벼운 세이프티 가드를 만든다"
date: "2026-05-06"
description: "SIREN은 마지막 레이어 출력만 쓰는 기존 guard model 대신 LLM 내부 레이어의 safety neuron을 모아 harmfulness detector를 구성함으로써, 훨씬 적은 학습 파라미터로 더 강한 일반화와 스트리밍 감지를 노린다."
author: "Sangmin Lee"
category: "safety-privacy"
tags:
  - Safety
  - Guard Models
  - LLM Internals
  - Moderation
  - MLOps
draft: false
---

LLM 제품이 실제 서비스에 배포될수록, 안전성은 더 이상 프롬프트 필터 몇 개로 해결되는 문제가 아니다. 사용자 입력을 막는 일도 중요하지만, 모델이 생성하는 응답이 어느 시점부터 위험해지는지 실시간으로 감지하고, 이를 낮은 지연과 낮은 비용으로 운영 파이프라인에 붙일 수 있어야 한다. 문제는 현재의 guard model 다수가 여전히 마지막 레이어 출력과 생성형 분류에 크게 의존한다는 점이다.

이번 논문 "LLM Safety From Within: Detecting Harmful Content with Internal Representations"은 이 전제를 정면으로 뒤집는다. 저자들은 안전 관련 신호가 terminal layer에만 있는 것이 아니라 모델 내부 여러 레이어에 분산되어 있다고 보고, 그 내부 표현만으로 harmfulness detector를 만드는 SIREN을 제안한다. 핵심은 backbone 전체를 safety fine-tuning 하지 않고도, 내부 표현에서 safety neuron을 추출해 작은 분류기만 얹어 더 빠르고 가벼운 세이프티 가드를 만들 수 있다는 주장이다.

![SIREN overview](https://arxiv.org/html/2604.18519v1/x1.png)

## 무엇을 해결하려는가

기존 오픈 가드 모델의 대표적인 경로는 크게 두 가지다. 하나는 마지막 hidden state 위에 분류기를 얹는 방식이고, 다른 하나는 아예 안전 분류를 생성형 태스크로 바꿔 `safe` 또는 `unsafe` 같은 레이블을 디코딩하게 만드는 방식이다. 이런 접근은 이미 실용적으로 널리 쓰이지만, 공통된 약점도 분명하다. 첫째, 내부 레이어에 퍼져 있는 safety-relevant feature를 거의 활용하지 못한다. 둘째, 생성형 guard는 추론 시 autoregressive decoding이 들어가므로 지연과 계산량이 늘어난다. 셋째, 특정 벤치마크에 맞춘 fine-tuning은 분포가 바뀌거나 reasoning trace처럼 낯선 입력이 들어왔을 때 일반화가 흔들릴 수 있다.

SIREN이 겨냥하는 문제는 따라서 단순한 "더 높은 moderation accuracy"가 아니다. 더 정확히는, 이미 범용 LLM 내부에 형성된 안전 관련 표현을 재사용해서 더 작고 빠르며 plug-and-play에 가까운 guard layer를 만드는 것이다. 이 문제 설정은 실무적으로도 중요하다. 모델 본체를 다시 학습하지 않고도 safety detector를 교체하거나, 응답 생성 중간 단계에서 위험 전이를 감시하거나, 동일 backbone 위에서 더 작은 운영 비용으로 세이프티를 확보할 수 있기 때문이다.

## 핵심 아이디어 / 구조 / 동작 방식

SIREN은 두 단계로 구성된다. 첫 번째 단계는 safety neuron identification이다. 저자들은 각 레이어의 residual stream 또는 feedforward activation을 꺼내고, 토큰 단위 표현을 mean pooling한 뒤, 레이어별 선형 probe를 학습한다. 이때 L1 regularization이 걸린 probe의 가중치 크기를 이용해 harmfulness classification에 특히 기여하는 뉴런만 골라낸다. 논문은 이렇게 선택된 뉴런을 safety neuron이라고 부른다.

두 번째 단계는 adaptive aggregation이다. 레이어마다 뽑아낸 safety neuron을 그냥 이어 붙이는 것이 아니라, 각 레이어 선형 probe의 validation 성능을 바탕으로 layer weight를 계산한 뒤 가중 결합한다. 즉 "어느 레이어가 safety signal을 더 잘 담고 있는가"를 먼저 측정하고, 그 비중을 반영해 최종 feature를 만든 뒤 작은 MLP classifier를 학습한다. 중요한 점은 backbone LLM 자체는 frozen 상태로 두고, 그 위에 얇은 분류기만 추가한다는 것이다.

이 설계는 세 가지 의미를 갖는다. 첫째, safety를 생성형 분류가 아니라 representation-level classification 문제로 바꾼다. 둘째, 마지막 레이어 하나가 아니라 cross-layer signal을 활용한다. 셋째, full fine-tuning 대신 sparse neuron selection과 소형 classifier로 끝내기 때문에 운영 자산이 훨씬 가벼워진다. GitHub 공개 저장소 기준으로 배포 패키지는 전체 모델을 다시 배포하는 방식이 아니라, `siren_config.json`과 `siren.safetensors` 형태의 classifier head만 제공하고 공식 Hugging Face backbone을 불러와 결합하는 구조다.

| 접근 방식 | safety 신호 원천 | 운영 특성 | 한계 |
|---|---|---|---|
| 생성형 guard model | terminal layer + autoregressive decoding | 기존 guard 생태계와 호환되지만 추론 비용이 큼 | 여러 토큰 생성이 필요하고 streaming 대응이 무거움 |
| 마지막 레이어 분류기 | final hidden state | 구조가 단순하고 구현이 쉬움 | 내부 레이어의 풍부한 safety signal을 놓치기 쉬움 |
| SIREN | 전 레이어의 safety neuron + adaptive aggregation | backbone 수정 없이 plug-and-play로 붙일 수 있고 classifier만 학습하면 됨 | 어떤 뉴런을 고를지, 어떤 레이어를 얼마나 반영할지 설계 품질이 중요 |

## 공개된 근거에서 확인되는 점

논문은 SIREN을 LlamaGuard3(1B, 8B)와 Qwen3Guard(0.6B, 4B) 같은 오픈 guard model과 비교한다. 학습에는 ToxicChat, OpenAIModeration, Aegis, Aegis2.0, WildGuard, SafeRLHF, BeaverTails까지 7개 safety benchmark를 사용했고, prompt-level과 response-level harmfulness detection을 모두 binary classification으로 평가했다. 중요한 비교 방식은 공정성이다. SIREN은 각 guard와 동일한 backbone인 Llama3 또는 Qwen3 위에서 학습되어, "더 좋은 베이스 모델을 썼기 때문"이라는 반론을 최대한 줄인다.

핵심 수치는 꽤 강하다. 논문은 SIREN이 state-of-the-art 오픈 guard model보다 전반적으로 더 높은 성능을 보였고, 250배 적은 trainable parameter로도 이를 달성했다고 주장한다. 예를 들어 Figure 1 설명 기준으로 4B backbone 위의 SIREN은 약 14M trainable parameter만 추가하지만, 동급 generative guard는 사실상 4B 전체를 fine-tuning하는 구조다. GitHub에 공개된 체크포인트도 이 방향과 일치한다. 공개 모델 중 Qwen3-4B 기반 SIREN은 14.0M 파라미터로 benchmark performance 86.7, Llama-3.2-1B 기반은 5.4M 파라미터로 85.7, Qwen3-0.6B 기반은 12.3M 파라미터로 85.6을 기록했다고 정리돼 있다.

| 공개 SIREN 모델 | Backbone | 추가 학습 파라미터 | 공개 저장소 기준 평균 성능 |
|---|---|---:|---:|
| SIREN-Qwen3-0.6B | Qwen3-0.6B | 12.3M | 85.6 |
| SIREN-Llama-3.2-1B | Llama-3.2-1B | 5.4M | 85.7 |
| SIREN-Qwen3-4B | Qwen3-4B | 14.0M | 86.7 |
| SIREN-Llama-3.1-8B | Llama-3.1-8B | 56.0M | 86.3 |

일반화 성능도 흥미롭다. 논문은 학습에 쓰지 않은 Think benchmark의 reasoning trace harmfulness detection에서 SIREN이 safety-specialized guard model을 일관되게 앞섰다고 보고한다. 특히 8B급 모델 비교에서 평균 11.2% F1 개선을 언급한다. 또 streaming detection 실험에서는 별도의 streaming supervision 없이도 토큰이 생성되는 과정에서 harmful span이 시작되는 지점을 따라가며 감지할 수 있었고, Qwen3Guard-Stream보다 여러 latency position에서 더 높은 탐지 성능을 보였다고 설명한다. 운영 관점에서 보면 이는 "응답이 다 나온 뒤 판정"하는 것이 아니라, 생성 도중 끊어낼 수 있는 가능성을 보여준다는 점에서 중요하다.

효율성 주장도 비교적 설득력이 있다. SIREN은 단일 forward pass로 내부 표현을 뽑아 분류기를 돌리면 되기 때문에 autoregressive label generation이 필요한 guard보다 FLOPs 기준 약 4배 낮은 계산 비용을 보였다고 한다. 게다가 safety neuron selection 분석에서는 Llama3.2-1B에서 전체 32,706개 feature 중 1.75% 수준인 571개 뉴런만 선택해도 안정적인 성능 구간에 도달했다고 보고한다. 즉 저자들이 말하는 "safety signal의 sparsity"는 단순 직관이 아니라 실제 선택 비율과 연결되어 있다.

## 실무 관점에서의 해석

내가 보기에 이 논문의 진짜 포인트는 세이프티를 별도 거대 모델의 생성 능력으로 보지 않고, 기존 LLM 내부에 이미 학습된 표현을 재활용 가능한 운영 자산으로 본다는 데 있다. 이는 최근 LLM 시스템 설계가 "더 큰 모델 하나"에서 "주변 제어 계층을 어떻게 붙이느냐"로 이동하는 흐름과 맞닿아 있다. SIREN은 특히 그 제어 계층을 parameter-efficient하게 구성할 수 있음을 보여준다.

실무적으로는 세 가지 장면이 떠오른다. 첫째, 이미 특정 오픈 LLM backbone을 제품에 쓰고 있는 팀이라면 full guard fine-tuning 없이 safety classifier만 올려 moderation layer를 구성할 수 있다. 둘째, streaming detection처럼 응답 중간 감시가 필요한 에이전트나 코파일럿 제품에서 자연스러운 활용 지점이 있다. 셋째, 같은 safety detector라도 분류기 헤드만 교체·배포하면 되므로 모델 관리와 릴리즈 단위가 훨씬 가벼워진다.

물론 과장하면 안 되는 부분도 있다. harmfulness는 정책 정의에 따라 달라지고, 실제 운영에서는 false positive와 false negative 비용이 제품마다 다르다. 또한 SIREN이 내부 표현을 잘 활용한다 해도, 최종 판정 경계와 taxonomy 설계는 여전히 데이터셋과 운영 정책의 영향을 강하게 받는다. 논문도 benchmark 중심으로 강점을 보여주고 있으며, 다국어 정책 일관성이나 domain-specific moderation까지 자동으로 보장하는 것은 아니다.

그럼에도 이 작업은 guard model의 설계 중심을 terminal layer와 generation에서 internal representation과 sparse feature selection으로 옮긴다는 점에서 꽤 인상적이다. 앞으로 safety infra가 모델 바깥의 후처리 규칙과 모델 자체 사이 어딘가에 자리 잡게 된다면, SIREN 같은 방식은 그 중간층을 설계하는 중요한 힌트가 될 가능성이 높다.

Sources: https://arxiv.org/abs/2604.18519, https://arxiv.org/html/2604.18519v1, https://arxiv.org/pdf/2604.18519, https://github.com/CSSLab/SIREN
