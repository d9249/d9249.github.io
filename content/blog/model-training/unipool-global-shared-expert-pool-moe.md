---
title: "UniPool은 MoE expert를 레이어별 자산이 아니라 전역 풀로 바꾼다"
date: "2026-05-08T19:47:06"
description: "UniPool은 MoE에서 레이어마다 따로 들고 있던 expert 집합을 전역 공유 풀로 바꾸고, pool-level balancing과 NormRouter를 더해 깊이에 비례하던 expert 파라미터 증가를 느슨하게 만든다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - MoE
  - LLM Architecture
  - Sparse Models
  - Routing
  - Megatron-LM
draft: false
---

Mixture-of-Experts가 큰 모델을 효율적으로 키우는 표준처럼 자리 잡으면서, 이제 병목은 “expert를 쓸지 말지”가 아니라 **expert budget을 어떤 단위로 나눌지**로 옮겨가고 있다. 오늘의 전형적인 MoE는 각 transformer layer가 자기만의 expert 집합을 갖고, 그 레이어의 router가 그 안에서만 고르게 만든다. 이 설계는 익숙하고 구현도 명확하지만, 한 가지 강한 가정을 깔고 있다. 깊이가 늘어나면 expert도 레이어 수에 비례해 늘어야 하고, 서로 다른 레이어의 expert는 사실상 공유될 수 없다는 가정이다.

`UniPool: A Globally Shared Expert Pool for Mixture-of-Experts`는 이 관습을 정면으로 건드린다. 논문의 핵심 주장은 단순하다. 깊은 MoE 층들 사이에는 생각보다 routing redundancy가 크고, 그렇다면 expert를 layer-private asset처럼 쪼개 들고 있기보다 **전역 공유 pool로 묶어 재사용하는 편이 더 낫지 않겠느냐**는 것이다. 저자들은 이를 위해 각 레이어의 router는 유지하되 expert ownership만 제거한 UniPool 구조를 제안하고, 여기에 pool-level auxiliary loss와 NormRouter를 결합해 shared-pool training을 안정화한다.

흥미로운 점은 이 아이디어가 단순한 파라미터 절감 장치에 머물지 않는다는 것이다. 논문은 UniPool이 matched vanilla MoE보다 validation loss와 perplexity를 일관되게 낮춘다고 보고하고, 더 나아가 reduced-pool 설정에서는 vanilla expert budget의 41.6%–66.7%만 써도 layer-wise MoE를 맞추거나 넘길 수 있다고 주장한다. 즉 이 논문은 “MoE를 더 싸게 만들 수 있다”보다, **MoE의 depth scaling law 자체를 다시 쓸 수 있다**는 쪽에 더 가까운 메시지를 던진다.

![UniPool overview](https://arxiv.org/html/2605.06665v1/x1.png)

## 무엇을 해결하려는가

이 논문이 겨냥하는 문제는 MoE의 희소 계산 자체가 아니다. 더 정확히 말하면, **현재 MoE가 expert capacity를 레이어 단위로 너무 경직되게 배분한다**는 점이다. 각 레이어가 자기 expert를 독점하면 depth를 늘릴 때마다 새로운 expert FFN 묶음이 선형적으로 추가된다. 이는 구현 관점에서는 단순하지만, 모델이 실제로 그런 정도의 layer-isolated specialization을 항상 필요로 하는지는 별개의 문제다.

저자들은 먼저 이 가정을 생산계 MoE 모델들에서 시험한다. Qwen1.5-MoE, DeepSeek-V2-Lite, Qwen3-30B-A3B 같은 모델에서 deep-half의 특정 MoE layer router를 learned top-k 대신 uniform random routing으로 바꿔도, downstream 평균 정확도 하락이 1.0~1.6포인트 수준에 그친다고 보고한다. 이것은 꽤 강한 시사점이다. **적어도 일부 깊은 층에서는 router가 매우 정교한 전용 expert 배치를 하고 있다는 믿음이 과장돼 있을 수 있다**는 뜻이기 때문이다.

이 관찰이 맞다면, layer-private expert 설계는 두 가지 면에서 비효율적일 수 있다.

- 서로 다른 깊이에서 사실상 비슷한 변환을 수행하는 expert가 중복 저장될 수 있다.
- depth를 늘릴 때 expert budget도 선형적으로 커져야 한다는 암묵적 규칙이 굳어진다.

UniPool은 바로 이 지점을 문제로 본다. 논문의 질문은 “MoE를 더 sparse하게 만들 수 있는가?”가 아니라, **expert를 레이어에 귀속시키지 않고도 sparse routing의 장점을 유지할 수 있는가?**에 가깝다.

## 핵심 아이디어 / 구조 / 동작 방식

UniPool의 구조는 surprisingly clean하다. 기존 vanilla MoE에서는 `L`개의 레이어가 각각 `E`개의 private expert FFN을 갖는다. 반면 UniPool에서는 각 레이어의 router는 유지하되, expert 자체는 전역 pool `M`개로 모아 둔다. 즉 레이어마다 “누가 고르느냐”는 독립적이지만, “무엇을 고를 수 있느냐”는 공유된다. 이 덕분에 어떤 expert든 서로 다른 깊이의 레이어에서 재사용될 수 있다.

하지만 expert를 그냥 공유만 하면 곧바로 안정적으로 학습되는 것은 아니다. 여러 레이어의 router가 하나의 pool을 경쟁적으로 바라보면 특정 expert만 과도하게 쓰이거나, 반대로 어떤 expert는 전역적으로 죽어 버릴 수 있다. 논문은 이를 막기 위해 두 가지 장치를 넣는다.

첫째는 **pool-level auxiliary loss**다. 기존 per-layer aux loss가 각 레이어 안에서만 load balancing을 맞춘다면, UniPool은 같은 pool을 공유하는 모든 레이어의 utilization을 합쳐 전체적으로 balance를 맞춘다. 이 설계의 중요한 포인트는 “모든 레이어가 모든 expert를 골고루 쓰게 만들자”가 아니라, **전역적으로 죽은 expert를 없애되 레이어별 specialization은 남겨 두자**는 데 있다.

둘째는 **NormRouter**다. softmax 대신 L2 normalization과 ReLU 기반 sparse gating, 그리고 learnable scale을 사용하는 routing 방식으로, 많은 per-layer router가 큰 shared pool을 향해 경쟁할 때 routing score의 scale stability를 유지하려는 목적이다. 논문 Table 5를 보면 shared pool에 softmax만 얹는 단순 설계는 오히려 vanilla MoE보다 손해를 보지만, pool aux와 NormRouter를 함께 쓴 최종 UniPool은 182M 실험에서 가장 좋은 loss를 만든다. 즉 shared pool 아이디어만으로는 부족하고, **그 공유 구조를 버틸 수 있는 routing/balancing 규칙이 같이 들어가야 한다**는 메시지다.

| 구성 요소 | 논문에서의 역할 | 실무적으로 읽히는 의미 |
|---|---|---|
| Global shared expert pool | 레이어별 private expert ownership 제거 | depth가 늘어도 expert budget을 꼭 선형으로 늘릴 필요가 없게 만듦 |
| Independent per-layer routers | 레이어별 입력 특성에 맞는 routing 유지 | 공유 구조 속에서도 깊이별 specialization을 완전히 버리지 않음 |
| Pool-level auxiliary loss | 전역 expert utilization 균형화 | shared pool에서 dead expert 문제를 완화 |
| NormRouter | sparse·scale-stable routing 제공 | 큰 공유 pool에서 softmax routing의 불안정을 줄이는 장치 |
| Pool size as hyperparameter | 공유 범위를 조절 | “expert 수 = layer 수에 비례” 대신 새로운 scaling knob 제공 |

![Efficiency and granularity sweeps](https://arxiv.org/html/2605.06665v1/x2.png)

## 공개된 근거에서 확인되는 점

가장 먼저 눈에 띄는 것은 저자들이 동기 자체를 꽤 직접적으로 계량했다는 점이다. production MoE 모델에서 deep-half layer 하나씩을 random routing으로 바꿔도 평균 정확도 하락이 크지 않았다.

| 모델 | Learned Top-K 평균 | Random 평균 | 평균 하락 |
|---|---:|---:|---:|
| Qwen1.5-MoE | 67.92 | 66.29 | -1.6 |
| DeepSeek-V2-Lite | 54.19 | 53.03 | -1.2 |
| Qwen3-30B-A3B | 73.02 | 72.06 | -1.0 |

이 수치는 UniPool의 전제를 뒷받침한다. 깊은 층 일부에서 router 정밀도가 생각보다 덜 중요하다면, expert를 꼭 그 레이어 전용 자산처럼 분리해 둘 이유도 약해진다.

다운스트림 결과도 일관된 편이다. Table 3 기준 default 8E/top-1 설정에서 UniPool은 다섯 스케일 중 거의 전 구간에서 평균 zero-shot accuracy를 끌어올린다.

| 스케일 | Vanilla MoE 평균 | UniPool 평균 | 차이 |
|---|---:|---:|---:|
| 182M | 38.74 | 39.61 | +0.87 |
| 469M | 41.62 | 43.11 | +1.49 |
| 650M | 43.04 | 43.79 | +0.75 |
| 830M | 43.82 | 45.67 | +1.85 |
| 978M | 43.91 | 44.07 | +0.16 |

이 논문이 더 강하게 말하는 것은 raw benchmark gain보다 **validation loss / perplexity와 expert budget 효율**이다. abstract와 README는 다섯 LLaMA-style scale(182M, 469M, 650M, 830M, 978M)에서 UniPool이 matched vanilla MoE보다 validation loss를 최대 0.0386까지 더 낮췄다고 요약한다. 또한 reduced-pool variant는 vanilla expert budget의 41.6%~66.7%만 사용해도 동일하거나 더 나은 성능을 냈다고 주장한다. 이게 사실상 이 논문의 headline이다. UniPool의 핵심은 “더 좋은 expert routing”보다 **expert budget을 depth와 느슨하게 분리하는 것**이다.

Ablation도 메시지가 분명하다. 182M 실험에서:

- `Vanilla MoE + softmax`: loss 1.9317
- `Vanilla MoE + NormRouter`: 1.9375로 오히려 악화
- `Shared + layer aux + softmax`: 1.9480으로 더 악화
- `Shared + pool aux + softmax`: 1.9180으로 개선
- `UniPool (G=1)`: 1.9029로 최종 최고

즉 **shared pool만 도입한다고 좋아지는 것이 아니라**, pool-level balancing과 NormRouter가 함께 들어가야 shared design의 이득이 제대로 살아난다. 단순 공유는 손해를 볼 수 있고, shared pool을 위한 routing law를 같이 설계해야 한다는 뜻이다.

![Shared pool + softmax + per-layer aux](https://arxiv.org/html/2605.06665v1/x4.png)

![UniPool with NormRouter + pool aux](https://arxiv.org/html/2605.06665v1/x5.png)

공개 범위도 체크할 만하다. GitHub 저장소 `Centaurus-Alpha/UniPool`은 2026-05-07 생성, 기본 브랜치 `main`, stars 4, forks 1 상태로 공개돼 있고, releases와 tags는 아직 없다. README는 이 코드를 Megatron-LM / Megatron Core 위의 research code release로 소개하며, ReMoE의 data pipeline과 baseline protocol을 재사용한다고 밝힌다. 설치 패키지 이름은 `unipool-megatron`이지만 import path는 여전히 `megatron`이고, 훈련 스크립트도 `scripts/train_llama_*_moe_UniPool.sh` 형태로 제공된다. 즉 현재 릴리스는 production-ready 새 프레임워크라기보다, **Megatron 파생 연구 코드와 재현 스크립트를 묶은 초기 공개판**에 가깝다.

라이선스 표기도 약간 흥미롭다. GitHub API의 license 필드는 `Other / NOASSERTION`으로 잡히지만, 실제 저장소에는 derivative upstream notice가 포함된 `LICENSE` 파일이 존재한다. 이런 모양새는 독립적인 깔끔한 greenfield OSS라기보다, 여러 upstream 조각을 안고 있는 연구용 fork 계열 릴리스라는 신호로 읽는 편이 맞다.

## 실무 관점에서의 해석

내가 보기에 UniPool의 진짜 포인트는 단순히 shared weights가 아니다. 더 본질적으로는 **MoE의 기본 회계 단위를 레이어에서 아키텍처 전체로 옮긴다**는 데 있다. 지금까지는 layer 수가 늘면 expert도 당연히 더 많이 필요하다고 생각해 왔다. UniPool은 그 규칙이 자연법칙이 아니라 하나의 설계 관습에 불과할 수 있음을 보여준다.

이 관점은 앞으로 sparse model scaling을 보는 방식에도 영향을 줄 수 있다. dense model에서는 depth, width, data, optimizer scaling law를 따로 논하지만, MoE에서는 여기에 “expert budget을 어느 축에 귀속시킬 것인가”라는 문제가 하나 더 붙는다. UniPool은 그 축을 레이어 단위 ownership이 아니라 pool size라는 전역 하이퍼파라미터로 바꾸자는 제안이다. 만약 이 방향이 더 큰 스케일에서도 유지된다면, 미래의 sparse LLM은 layer마다 expert bank를 반복 복제하기보다 **여러 깊이가 공통으로 접근하는 capacity substrate** 쪽으로 갈 가능성이 있다.

물론 한계도 선명하다.

- 실험은 최대 978M 규모, 30B tokens 수준의 LLaMA-style pretraining 구간에 집중돼 있다.
- 실제 frontier-scale MoE에서 routing contention과 distributed systems 비용이 어떻게 바뀌는지는 아직 열려 있다.
- shared pool이 모델 해석 가능성이나 expert specialization의 질을 장기적으로 어떻게 바꾸는지도 더 봐야 한다.
- 공개 저장소도 막 올라온 연구 코드라, releases/tags 없는 초기 상태다.

그럼에도 UniPool은 꽤 좋은 질문을 던진다. **MoE에서 정말 layer마다 새로운 expert를 사야 하는가?** 이 질문이 맞다면, sparse scaling의 다음 단계는 더 복잡한 router를 붙이는 것만이 아니라, expert ownership 자체를 다시 설계하는 일일 수 있다. 그런 의미에서 UniPool은 단순한 효율 트릭보다, MoE depth scaling을 다시 쓰려는 아키텍처 제안으로 읽는 편이 더 정확하다.

Sources: https://arxiv.org/abs/2605.06665, https://arxiv.org/html/2605.06665, https://github.com/Centaurus-Alpha/UniPool, https://api.github.com/repos/Centaurus-Alpha/UniPool, https://api.github.com/repos/Centaurus-Alpha/UniPool/readme