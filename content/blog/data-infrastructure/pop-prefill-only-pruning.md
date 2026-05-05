---
title: "POP은 prefill만 가지치기해 LLM 추론을 가속한다"
date: "2026-05-06"
description: "POP은 LLM 추론의 prefill과 decode가 서로 다른 역할을 가진다는 점을 이용해, 문맥 인코딩 단계에서만 깊은 층을 생략하고 decode는 풀모델로 유지함으로써 정확도 손실을 크게 늘리지 않고 prefill 지연을 줄이려는 stage-aware pruning 접근이다."
author: "Sangmin Lee"
category: "data-infrastructure"
tags:
  - Inference Optimization
  - Model Pruning
  - KV Cache
  - LLM Serving
  - VLM
 draft: false
---

대형 언어모델 서빙에서 비용을 키우는 병목은 단순히 파라미터 수가 많다는 사실만이 아니다. 실제 운영에서는 사용자의 긴 입력을 한꺼번에 읽어 KV cache를 쌓는 prefill 단계와, 그 뒤 토큰을 한 개씩 생성하는 decode 단계가 서로 전혀 다른 성격의 비용 구조를 만든다. 그런데 지금까지 많은 structured pruning 방법은 이 둘을 같은 문제로 취급해, 한 번 줄인 모델 구조를 prefill과 decode 전체에 똑같이 적용해 왔다.

POP: Prefill-Only Pruning for Efficient Large Model Inference가 흥미로운 이유는 바로 이 전제를 뒤집기 때문이다. 이 논문은 깊은 층이 다음 토큰을 예측하는 decode에는 중요하지만, 긴 문맥을 KV cache로 바꾸는 prefill에는 상대적으로 덜 중요하다는 점을 실험적으로 보여준다. 그래서 모델을 통째로 더 작게 만들기보다, 가장 계산량이 큰 prefill에서만 깊은 층을 생략하고 decode는 원래 풀모델로 복원하는 비대칭 전략을 택한다. 핵심은 pruning 자체보다도, 추론 파이프라인을 단계별로 다르게 최적화해야 한다는 문제 정의에 있다.

![POP stage-aware importance analysis](https://arxiv.org/html/2602.03295v2/x1.png)

## 무엇을 해결하려는가

논문이 겨냥하는 문제는 익숙하다. structured pruning은 실제 하드웨어에서 속도 이득을 내기 쉽지만, 오픈엔디드 생성 작업으로 갈수록 정확도 하락이 크게 나타난다. 반면 unstructured pruning은 성능 보존은 상대적으로 좋지만, 특수 커널이나 희소 연산 최적화 없이는 벽시계 시간(wall-clock) 개선이 제한적이다. 결국 서빙 팀 입장에서는 “실제로 빨라지면서도 품질이 무너지지 않는” pruning이 필요하다.

저자들의 주장은 이 정확도 손실이 pruning 방식 자체보다, 추론 과정을 stage-agnostic하게 보는 데서 비롯된다는 것이다. prefill은 과거 입력을 병렬로 읽어 각 층의 KV cache를 만드는 과정이고, decode는 현재 토큰을 cache에 추가하는 동시에 다음 토큰 확률을 계산해야 한다. 같은 레이어라도 이 두 단계에서 맡는 역할이 다르다면, 어느 단계에서 어느 층을 건너뛸 수 있는지도 달라져야 한다는 논리다.

실무적으로 보면 이 문제는 긴 프롬프트, 대용량 문서 질의, 멀티모달 입력처럼 prefill 비용이 빠르게 커지는 워크로드에서 특히 중요하다. decode 최적화는 이미 speculative decoding, KV cache 압축, sparse retrieval 등 다양한 방법이 있지만, 입력을 읽는 첫 구간 자체를 더 싸게 만드는 방법은 상대적으로 덜 정리돼 있었다. POP은 바로 그 지점에 답하려는 접근이다.

## 핵심 아이디어 / 구조 / 동작 방식

POP의 출발점은 레이어 중요도를 “한 번 줄인 모델의 전체 성능”이 아니라, prefill과 decode 각각에서 따로 측정하는 것이다. 이를 위해 저자들은 각 레이어의 residual branch에 virtual gate를 붙이고, 해당 gate가 loss에 얼마나 민감한지를 gradient 기반으로 추정한다. 이 분석 결과가 논문의 핵심인데, Llama-3.1-8B-Instruct와 Qwen3-VL-8B-Instruct 모두에서 깊은 층은 decode에는 매우 중요하지만 prefill에는 상대적으로 덜 중요하다는 비대칭성이 드러난다.

이 관찰을 바탕으로 POP은 깊은 층을 prefill 단계에서만 생략한다. 문맥을 읽는 동안에는 계산량이 큰 상위 1/3 정도의 레이어를 건너뛰어 FLOPs를 줄이고, 실제 생성이 시작되면 다시 원래 풀모델 경로로 돌아온다. 다만 이렇게 하면 prefill 동안 생략된 레이어의 KV cache가 비어 있게 되므로, decode에서 full model을 그대로 쓰려면 중간 연결이 끊기는 문제가 생긴다.

그래서 POP은 두 가지 장치를 더 넣는다. 첫째는 independent KV projection이다. prefill에서 생략된 깊은 층에 대해서도, 해당 층의 residual update는 하지 않더라도 decode가 참조할 key/value state는 별도 projection으로 생성해 cache 무결성을 유지한다. 둘째는 boundary handling이다. 마지막 입력 토큰은 pruned prefill 모델이 아니라 full model로 처리해, 첫 생성 토큰에서 품질이 급격히 흔들리는 문제를 막는다. 논문 ablation에서 이 두 장치가 빠지면 성능이 사실상 붕괴하는 이유도 여기에 있다.

저자들은 추가로 왜 이런 방식이 통하는지도 분석한다. Figure 2 설명에 따르면, 깊은 층을 생략하면 hidden state와 value state는 full model 경로와 점점 달라지지만, attention output 자체의 cosine similarity는 0.96 이상으로 높게 유지된다. 즉 내부 표현에는 drift가 생기더라도, attention aggregation이 그 오차를 흡수해 기능적으로는 안정성을 유지한다는 해석이다. POP은 이 “representation drift는 생기지만 기능적 출력은 버틴다”는 속성을 활용하는 셈이다.

| 방식 | pruning 적용 방식 | 장점 | 한계 |
|---|---|---|---|
| Wanda | 가중치 수준의 unstructured pruning | 정확도 보존이 상대적으로 좋음 | 전용 커널 없이는 실제 지연 개선이 제한적 |
| SliceGPT / ShortGPT | 줄어든 구조를 prefill·decode 전체에 공통 적용 | 구현이 단순하고 구조적 가속이 쉬움 | 생성 품질과 reasoning 성능이 크게 무너질 수 있음 |
| POP | 깊은 층을 prefill에서만 생략하고 decode는 full model 유지 | stage-aware 가속, 정확도-속도 균형이 좋음 | KV projection·boundary handling 같은 연결 장치가 필수 |

## 공개된 근거에서 확인되는 점

정량 결과에서 가장 눈에 띄는 부분은 POP이 structured pruning 계열의 흔한 성능 붕괴를 상당 부분 피한다는 점이다. Qwen3-VL-8B-Instruct 기준 Table 1을 보면 full model 평균 점수는 74.00이고, POP(33.3%)은 73.16이다. 반면 같은 표에서 SliceGPT(25%)는 32.82, ShortGPT(25%)는 30.59까지 내려간다. 즉 pruning 비율은 비슷한데도, 어떤 단계에서 레이어를 줄이느냐에 따라 손실 양상이 완전히 달라진다.

속도 측면에서는 Table 2와 Table 4가 메시지를 명확하게 준다. Gemma-3-12B-It에서는 입력 길이 2048에서 prefill TTFT 기준 1.37배, Llama-3.1-8B-Instruct에서는 1.36배, Qwen3-VL-8B-Instruct에서는 해상도 640×480에서 1.19배 수준의 속도 향상이 보고된다. Qwen3-VL 기준 pruning ratio를 조절한 실험에서는 33% 설정에서 1.37배 speedup과 GSM8K 80.21, HotpotQA 63.13을 기록한다. 20%와 25%에서는 정확도 손실이 더 작지만 속도 이득이 제한적이고, 50%를 넘기면 HotpotQA가 34.69, 60%에서는 5.45까지 급락해 안전한 operating point가 따로 있음을 보여준다.

ablation도 꽤 설득력 있다. Qwen3-VL-8B-Instruct에서 independent KV projection을 제거하면 GSM8K가 2.05, HotpotQA가 1.18까지 떨어지고, boundary handling을 제거하면 GSM8K는 77.33으로 소폭 하락에 그치지만 HotpotQA는 11.45까지 무너진다. 단순히 “깊은 층을 건너뛰면 된다”가 아니라, pruned prefill과 full decode를 이어주는 cache/경계 처리 설계가 성능 유지의 핵심이라는 뜻이다.

또 하나 흥미로운 점은 POP이 다른 long-context 최적화와도 결합 가능하다는 것이다. 부록 Table 5에 따르면 Llama-3.1-8B-Instruct에서 FlexPrefill(γ=0.95)에 POP(31.25%)을 결합하면 TTFT speedup이 1.13배에서 1.54배로, LLMLingua-2(0.4)와 POP을 결합하면 1.37배에서 1.56배로 올라간다. 성능은 일부 감소하지만, POP이 sequence length 축의 토큰 압축이나 sparse attention과 직교적인 depth 축 최적화라는 저자들의 주장을 뒷받침한다.

| Qwen3-VL-8B-Instruct 설정 | 평균 점수 | 대표 속도 지표 | 해석 |
|---|---:|---:|---|
| Full Model | 74.00 | 1.00× | 기준선 |
| SliceGPT (25%) | 32.82 | 1.14~1.16× | 속도 이득은 있지만 정확도 손실이 큼 |
| ShortGPT (25%) | 30.59 | 1.13~1.18× | 구조적 가속은 되지만 생성 품질 붕괴가 큼 |
| POP (33.3%) | 73.16 | 1.16~1.19× | 속도-정확도 균형이 가장 안정적 |

## 실무 관점에서의 해석

내가 보기에 이 논문의 진짜 포인트는 pruning을 모델 압축 기법이 아니라 추론 스케줄링 기법으로 재해석했다는 데 있다. 기존 structured pruning은 “어떤 레이어가 불필요한가”를 묻는 데 가까웠다면, POP은 “어떤 단계에서 어떤 레이어가 불필요한가”를 묻는다. 이 차이는 단순해 보이지만, 실제 서빙 아키텍처에서는 훨씬 중요하다. prefill과 decode는 이미 커널 최적화, 배치 전략, KV cache 관리가 서로 다른데, pruning도 그 구분을 따라가야 한다는 이야기이기 때문이다.

특히 긴 문맥 질의, 대형 system prompt, 멀티모달 입력처럼 prefill이 전체 latency를 크게 좌우하는 워크로드에서는 꽤 실용적이다. decode 품질을 크게 건드리지 않으면서도 입력 인코딩 비용을 먼저 줄일 수 있기 때문이다. 앞으로 serving stack이 token pruning, sparse attention, KV offloading, speculative decoding 같은 조합형 최적화로 갈수록, POP 같은 stage-aware depth pruning은 그 위에 꽂기 쉬운 하나의 레이어가 될 가능성이 크다.

물론 한계도 있다. speedup이 1.3배 안팎이라는 점만 보면 극적인 숫자는 아니다. 그리고 독립 KV projection, 마지막 토큰 경계 처리처럼 모델 구현 내부를 건드려야 하는 요소가 있어, 단순한 checkpoint 변환보다 엔지니어링 난도는 높다. 또한 논문 결과는 주로 open-weight 모델과 정해진 benchmark 세팅에서 나온 것이므로, 실제 production serving에서의 kernel/메모리/배치 전략과 결합했을 때 이득이 얼마나 유지되는지는 별도 검증이 필요하다.

그럼에도 POP은 중요한 방향을 보여준다. 앞으로의 추론 최적화는 더 작은 모델 하나를 만드는 경쟁이 아니라, 같은 모델을 단계별로 다르게 실행하는 runtime policy 경쟁이 될 수 있다. POP은 그 정책을 레이어 깊이 차원에서 구현한 사례이고, “prefill은 덜 비싸게, decode는 덜 위험하게”라는 매우 실용적인 철학을 갖고 있다.

Sources: https://arxiv.org/abs/2602.03295, https://arxiv.org/html/2602.03295v2, https://arxiv.org/pdf/2602.03295