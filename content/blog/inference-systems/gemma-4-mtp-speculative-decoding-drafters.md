---
title: "Gemma 4 MTP는 speculative decoding을 제품형 추론 가속 계층으로 밀어 넣는다"
date: "2026-05-06T12:30:48"
description: "Google의 Gemma 4 Multi-Token Prediction drafters는 작은 draft model이 여러 토큰을 미리 제안하고 target model이 이를 병렬 검증하는 구조를 통해, 출력 품질을 바꾸지 않으면서 최대 3배까지 추론 속도를 끌어올리려는 inference acceleration layer다."
author: "Sangmin Lee"
category: "inference-systems"
tags:
  - Gemma
  - Inference Optimization
  - Speculative Decoding
  - LLM Serving
  - Edge AI
draft: false
---

오픈 모델 경쟁이 점점 더 흥미로워지는 이유는 이제 좋은 base model을 하나 공개하는 것만으로는 충분하지 않기 때문이다. 실제 배포 단계에서 개발자들이 먼저 부딪히는 병목은 모델의 raw quality보다도 latency, memory bandwidth, 그리고 같은 하드웨어에서 얼마나 반응성을 끌어낼 수 있는가에 가깝다. 특히 로컬 워크스테이션, 모바일 디바이스, edge runtime처럼 자원이 제한된 환경에서는 "한 토큰 더 똑똑하게 생성하느냐" 못지않게 "같은 품질로 얼마나 빨리 생성하느냐"가 제품성을 좌우한다.

Google이 발표한 Gemma 4용 Multi-Token Prediction(MTP) drafters는 바로 그 문제를 겨냥한다. 이 발표는 새 foundation model 출시가 아니라, 이미 나온 Gemma 4 계열 위에 speculative decoding을 더 실용적인 배포 계층으로 얹는 작업에 가깝다. 공식 블로그와 Gemma 문서 기준으로 MTP는 작은 draft model이 여러 토큰을 먼저 예측하고, 더 큰 target model이 이를 병렬로 검증하는 구조이며, 이 방식을 통해 품질과 reasoning logic을 바꾸지 않으면서 최대 3배 속도 향상을 노린다.

내가 보기엔 이번 발표의 핵심은 speculative decoding 자체의 새로움보다, Google이 그것을 Gemma 4 제품군의 표준 배포 옵션처럼 다루기 시작했다는 데 있다. 즉 추론 최적화가 더 이상 serving 팀의 비공식 트릭이 아니라, model family 차원에서 공식 지원되는 runtime primitive가 되고 있다는 뜻이다.

![Gemma 4 MTP hero](https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Hero_Visual.width-200.format-webp.webp)

## 무엇을 해결하려는가

이 발표가 푸는 문제는 명확하다. 표준 autoregressive decoding은 한 번에 정확히 한 토큰씩 생성한다. 그런데 실제 하드웨어에서는 이 과정이 종종 compute-bound가 아니라 memory-bandwidth-bound다. 공식 블로그 표현을 빌리면, 프로세서는 매 토큰마다 수십억 개 파라미터를 VRAM에서 compute unit으로 옮기느라 대부분의 시간을 쓰고, 그 결과 계산 유닛은 완전히 활용되지 못한 채 latency가 커진다. 특히 consumer-grade hardware에서 이 병목이 더 두드러진다.

Speculative decoding은 이 비효율을 줄이려는 접근이다. 큰 target model이 매 토큰을 직접 한 개씩 생성하는 대신, 더 작은 draft model이 몇 토큰 앞을 먼저 예측하고 target model이 이를 한 번에 검증한다. target model이 draft를 받아들이면 한 번의 forward pass에서 여러 토큰을 처리한 효과를 낼 수 있다. 결국 핵심은 target model의 비싼 계산을 더 잘 amortize하는 것이다.

Gemma 4에서 이 문제가 특히 중요한 이유는 모델군의 배포 범위가 넓기 때문이다. Google은 Gemma 4를 워크스테이션, 모바일, 클라우드 전반에 걸친 open model family로 포지셔닝했고, 발표 당시 이미 몇 주 만에 6천만 다운로드를 기록했다고 밝혔다. 동시에 Gemma 4 본체 소개 글에서는 Gemma 전체 생태계가 4억 다운로드와 10만 개 이상의 변형 모델을 만들었다고 설명한다. 이렇게 다양한 환경에서 쓰이는 모델군이라면, 추론 속도 최적화는 부가 기능이 아니라 핵심 경쟁력이 된다.

## 핵심 아이디어 / 구조 / 동작 방식

Gemma 4 문서에 따르면 MTP는 speculative decoding을 가능하게 하는 구체적 아키텍처다. 여기서 중요한 점은 draft model이 target model과 완전히 독립된 작은 모델이 아니라는 것이다. Gemma 4의 MTP drafter는 target model의 input embedding table을 공유하고, target model 마지막 레이어의 activation을 활용해 그 위에 얹힌다. 다시 말해 별도 소형 LLM을 옆에 붙이는 방식보다 더 긴밀하게 결합된 drafter 구조다.

공식 문서는 이 결합 방식을 세 가지 enhancement로 설명한다. 첫째, shared input embeddings이다. draft model이 target model의 embedding table을 공유하므로 중복 비용을 줄인다. 둘째, target activations 활용이다. target model 마지막 레이어의 activation을 token embedding과 결합한 뒤 drafter 차원으로 down-projection해 다음 토큰들을 예측한다. 셋째, efficient embedder다. 특히 E2B와 E4B edge 모델에서는 전체 vocabulary에 대해 비싼 최종 logit 계산을 매번 수행하지 않도록, 유사 토큰을 cluster로 묶고 유력한 cluster만 먼저 고른 뒤 그 안의 토큰에만 계산을 집중한다.

블로그는 여기에 KV cache 공유를 추가로 강조한다. draft model이 target model의 activation과 KV cache를 활용하므로, 큰 모델이 이미 계산한 문맥을 다시 계산할 필요가 없다. 이 점은 단순 speculative decoding 개념 설명보다 더 중요하다. MTP가 실제로 빠르려면 draft가 target과 별도 문맥 경로를 매번 다시 밟지 않아야 하는데, Gemma 4는 이를 구조적으로 줄인 셈이다.

또 하나 중요한 예외가 있다. Gemma 4 26B A4B처럼 mixture-of-experts(MoE) 구조에서는 speculative decoding의 이득이 dense model만큼 단순하지 않다. 문서에 따르면 MoE는 토큰마다 다른 expert가 활성화되기 때문에, drafted token을 검증할 때 추가 expert weights를 메모리에서 불러와야 할 수 있다. 그래서 batch size 1에서는 expert reuse가 적어 속도 향상이 제한되거나 없을 수 있고, batch size가 4~8로 늘어나야 overlap이 커져 local Apple Silicon 환경에서도 약 2.2배 가속이 나온다. 즉 MTP는 "언제나 무조건 빠르다"가 아니라, 모델 구조와 batch regime에 따라 이득이 달라지는 runtime technique다.

| 구성 요소 | 공개 자료에서 확인되는 내용 | 의미 |
|---|---|---|
| Drafting loop | 작은 drafter가 여러 토큰을 먼저 예측하고 target model이 병렬 검증 | 한 토큰씩 생성하던 autoregressive 병목을 완화 |
| Shared embeddings | draft model이 target model의 input embedding table 공유 | 중복 계산과 파라미터 비용 절감 |
| Target activations | target 마지막 레이어 activation을 drafter 입력에 활용 | draft 품질을 높이면서 추가 모델 비용을 낮춤 |
| KV cache sharing | target이 이미 계산한 문맥 상태를 drafter가 재사용 | speculative decoding의 실제 wall-clock 이득에 중요 |
| Efficient embedder | E2B/E4B에서 token cluster 기반 최종 계산 축소 | edge 모델에서 logit bottleneck 완화 |
| MoE caveat | 26B A4B는 batch size 1에서 expert routing 때문에 이득 제한 가능 | MTP 효과가 모델 구조와 배치 전략에 의존 |

## 공개된 근거에서 확인되는 점

공식 블로그가 가장 전면에 내세우는 수치는 "up to 3x speedup"이다. 또한 Gemma 4 26B를 NVIDIA RTX PRO 6000에서 돌렸을 때 standard inference 대비 MTP drafter가 "same output quality, half the wait time"을 제공한다고 설명한다. 더 넓게는 LiteRT-LM, MLX, Hugging Face Transformers, vLLM 같은 서로 다른 런타임에서 tokens-per-second 향상을 테스트했다고 적혀 있다. 즉 이 발표는 특정 단일 프레임워크의 hack이 아니라, 여러 서빙 스택에 걸쳐 재사용 가능한 acceleration layer라는 메시지를 준다.

문서 쪽에서 더 중요한 주장은 "exact same quality as standard autoregressive generation"이다. draft token이 reject되더라도 target model이 그 위치의 정답 토큰을 직접 산출하므로, speculative decoding은 잘 설계되면 품질을 근본적으로 바꾸지 않는다. 이 점은 quantization이나 pruning처럼 품질-속도 trade-off를 감수하는 기법과 다르다. MTP의 메시지는 정확도 희생이 아니라 latency amortization이다.

하드웨어별 caveat도 공개적으로 적혀 있다는 점이 좋다. 블로그와 문서는 모두 26B A4B MoE 모델의 batch size 1 조건에서 routing 특성 때문에 속도 향상이 제한될 수 있다고 밝힌다. 대신 여러 요청을 동시에 처리하면 loaded expert reuse가 늘어나 Apple Silicon 로컬 환경에서 batch size 4~8 기준 약 2.2배 속도 향상이 나온다고 설명한다. Nvidia A100에서도 batch size 증가에 따른 유사한 이득이 있다고 한다. 즉 Google은 단순 최고 수치만 내세우지 않고, dense/MoE와 single-request/batched serving의 차이까지 드러낸다.

배포 표면도 꽤 넓다. 블로그 기준으로 MTP drafters는 Gemma 4와 같은 Apache 2.0 라이선스로 공개되며, Hugging Face와 Kaggle에서 가중치를 받을 수 있고, transformers, MLX, vLLM, SGLang, Ollama, LiteRT-LM, Google AI Edge Gallery에서 사용할 수 있다. 이건 단순 문서 발표가 아니라, 이미 Gemma 4 ecosystem 전반에 MTP를 꽂아 넣으려는 배포 전략으로 읽힌다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| Google blog | 몇 주 만에 Gemma 4 6천만 다운로드, MTP로 최대 3배 속도 향상 | Gemma 4의 배포 모멘텀 위에 runtime optimization을 추가 |
| Gemma docs | standard autoregressive generation과 동일 품질 보장 명시 | 정확도 희생형 압축이 아니라 decoding efficiency 개선 |
| Hardware caveat | 26B A4B MoE는 batch size 1에서 이득 제한 가능, batch 4~8에서 Apple Silicon 약 2.2배 | MTP 효과는 모델 구조와 serving regime에 따라 달라짐 |
| Architecture notes | shared embeddings, target activations, KV cache sharing, efficient embedder | 단순 draft model 추가보다 더 깊은 시스템 결합 |
| Deployment surface | LiteRT-LM, MLX, Transformers, vLLM, SGLang, Ollama, Edge Gallery 지원 언급 | edge부터 workstation까지 넓은 런타임 호환성을 지향 |
| License | Gemma 4와 동일한 Apache 2.0 | 연구용 데모가 아니라 실제 제품 적용을 염두에 둔 공개 방식 |

## 실무 관점에서의 해석

내가 보기에 Gemma 4 MTP의 가장 중요한 의미는 speculative decoding을 "논문 속 트릭"에서 "모델 제품군의 기본 서빙 옵션"으로 격상시켰다는 데 있다. 그동안 speculative decoding은 분명 잘 알려진 기법이었지만, 많은 팀에게는 구현 난도가 높고 프레임워크별 지원 편차가 큰 최적화였다. 반면 이번 발표는 Google이 Gemma 4 family 수준에서 drafter, 문서, 런타임 연결점, 배포 경로를 함께 제공하면서 이 기술을 더 표준화된 선택지로 만들고 있음을 보여 준다.

또한 이 발표는 앞으로의 오픈 모델 경쟁이 quality leaderboard만으로는 설명되지 않는다는 점을 잘 보여 준다. Gemma 4 본체가 intelligence-per-parameter를 내세웠다면, MTP는 그 intelligence를 실제 제품 반응성으로 바꾸는 계층이다. 즉 base model, quantization, serving runtime, speculative decoding, edge deployment가 분리된 문제가 아니라 하나의 product stack으로 묶이고 있다는 신호다.

실무적으로는 적용 포인트가 꽤 분명하다. coding assistant, 다단계 plan을 반복하는 agent, on-device 모바일 앱, local-first chat UI처럼 첫 토큰과 전체 응답 속도가 모두 중요한 워크로드에서 특히 매력적이다. 반대로 batch size 1의 MoE serving이나 expert routing 비용이 큰 환경에서는 기대치를 조정해야 한다. 결국 MTP는 만능 가속기가 아니라, dense model과 batched serving에서 가장 깔끔하게 먹히고 MoE에서는 런타임 설계와 함께 조율해야 하는 기법이다.

물론 한계도 있다. 공개 자료는 최대 3배, 특정 환경의 2.2배 같은 인상적인 수치를 주지만, 상세한 per-runtime benchmark 표나 재현용 표준 벤치마크 세트가 이 글 자체에 풍부하게 공개된 것은 아니다. 또한 chart 이미지는 현재 해상도가 낮아 세부 수치를 독립적으로 검증하기 어렵다. 따라서 팀이 실제 채택을 검토한다면, 자신의 batch size·하드웨어·runtime 조합에서 토큰당 latency와 throughput을 다시 측정해야 한다.

그럼에도 방향성은 분명하다. 앞으로 추론 최적화의 승부는 더 작은 모델을 하나 더 만드는 데만 있지 않을 수 있다. 같은 모델 가족 안에서, 같은 품질을 유지한 채, draft·verify·cache sharing 같은 runtime policy를 얼마나 잘 설계하느냐가 점점 더 중요해질 것이다. Gemma 4 MTP는 그 경쟁이 이제 본격적으로 제품화 단계에 들어섰다는 신호로 읽힌다.

Sources: https://blog.google/innovation-and-ai/technology/developers-tools/multi-token-prediction-gemma-4/, https://ai.google.dev/gemma/docs/mtp/overview, https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/, https://ai.google.dev/edge/litert-lm/overview, https://arxiv.org/abs/2211.17192