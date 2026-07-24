---
title: "GLM-5.2의 600 tok/s는 커널 하나가 아니라 MTP acceptance를 보존한 서빙 스택의 결과다"
date: "2026-07-24T23:13:47"
description: "Sionic은 B300에서 753B MoE GLM-5.2의 batch-1 생성을 600~1000 tok/s로 끌어올렸다고 보고한다. 핵심은 SASS·TMEM 기반 커널, live FP8 quantization, SGLang 런타임 패치, 그리고 MTP acceptance length를 함께 최적화해 HBM 병목을 여러 토큰에 나누는 데 있다."
author: "Sangmin Lee"
category: "inference-systems"
tags:
  - GLM-5.2
  - B300
  - Blackwell
  - SGLang
  - MTP
  - Inference Optimization
draft: false
---

753B 파라미터급 MoE 모델을 batch-1으로 생성할 때, 문제는 보통 GPU의 FLOPS가 부족한 것이 아니다. 토큰 하나를 확정할 때 활성화된 expert 가중치를 HBM에서 읽어 와야 하고, 이 전송이 끝나기 전에는 다음 계산도 진행되지 않는다. 모델이 커질수록 “더 많은 연산 장치”보다 **가중치를 얼마나 빠르고 빈틈없이 스트리밍하는가**가 decode 속도를 결정한다.

Sionic의 [GLM-5.2 최적화 사례](https://blog.sionic.ai/glm-5-2-x10)는 이 병목을 B300 Blackwell Ultra와 753B GLM-5.2라는 매우 구체적인 조합에서 파고든다. 이 글이 흥미로운 이유는 600~1000 tok/s라는 headline 자체보다, 그 속도가 단일 CUDA kernel의 성과가 아니라 **모델 구조, quantization, GPU microarchitecture, speculative decoding, runtime scheduling이 서로의 효과를 지키도록 맞춘 결과**라고 설명한다는 데 있다.

다만 수치는 Sionic이 자체 시스템·자체 workload에서 보고한 값이다. 공개 재현 스크립트나 제3자 benchmark가 이 글에서 함께 제공되지는 않으므로, 범용적인 GLM-5.2 속도 수치가 아니라 어떤 조건에서 병목을 풀었는지 보여 주는 엔지니어링 case study로 읽는 편이 정확하다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/glm-5-2-b300-memory-bandwidth.webp">
    <img
      src="/images/blog/glm-5-2-b300-memory-bandwidth.webp"
      alt="LLM 토큰 생성에서 HBM의 가중치 데이터가 GPU SM으로 스트리밍되고 적은 연산이 수행되는 메모리 병목 구조"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Sionic 원문 이미지. autoregressive decode의 중심 병목은 대개 행렬 연산량보다 HBM에서 SM으로 가중치를 읽어 오는 데이터 이동이다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

GLM-5.2는 Z.AI가 공개한 753B MoE 모델이며, NVIDIA NIM model card와 기존 공개 model card는 1M context와 sparse attention 계열 구조를 명시한다. Sionic 사례에서의 전제는 더 좁다. token마다 top-8 expert가 활성화되는 이 모델을 TP8로 나누면, 각 GPU rank는 token 하나당 약 **6.65GB**의 active weight traffic을 감당해야 한다는 것이다.

원문은 B300의 HBM3e peak bandwidth를 약 8TB/s로 두고, 이상적인 rank당 전송 시간을 0.83ms, 현실적인 60% 달성률을 둔 상한을 약 1.1ms로 계산한다. 반면 초기 측정 forward는 약 9ms였다고 한다. 즉 목표는 모델 자체를 바꾸는 일이 아니라, peak bandwidth가 있어도 실제 GEMM이 이를 못 쓰게 만드는 빈 구간을 찾아 줄이는 일이었다.

| 관찰된 문제 | 원문의 진단 | 최적화 방향 |
|---|---|---|
| 작은 batch-1 GEMM | CTA가 적어 SM 대부분이 놀고, HBM 요청 자체가 부족함 | K축 Split-K로 병렬성을 키움 |
| live FP8 quantization | load와 quant가 겹치지 않아 pipeline이 직렬화됨 | quantization과 GEMM의 결합 방식을 다시 설계 |
| HMMA-scale path | 반복 scale 연산이 prefetch pipeline을 끊음 | `tcgen05`·TMEM으로 load와 compute를 겹침 |
| register pressure | accumulator가 register를 많이 차지해 CTA 수가 줄어듦 | TMEM accumulator로 memory-level parallelism 확보 |
| 수백 개의 작은 kernel | launch/flush와 HBM round trip이 누적됨 | PQ-GEMM과 필요한 범위의 fusion 적용 |

여기서 중요한 점은 “B300은 8TB/s이니 모델도 8TB/s로 움직인다”가 성립하지 않는다는 것이다. Sionic은 초기 GEMM의 effective bandwidth를 약 2.1TB/s, peak의 26%로 보고한다. bandwidth-bound 모델의 성능 문제는 명령어 하나의 latency보다 **얼마나 많은 SM이 동시에 충분히 긴 memory stream을 만들고 있는가**에 더 가깝다.

## 핵심 아이디어 / 구조 / 동작 방식

### 1. live quantization을 붙이는 대신, 실행 경로 자체를 바꾼다

일반적인 생각은 FP8 activation quantization을 GEMM 직전에 하나 더 붙여 HBM traffic을 줄이는 것이다. 하지만 원문에서 이 단순 fusion은 SM103의 `cp.async` 경로와 잘 겹치지 않아, 원래 53µs였던 구간을 **127µs**까지 느리게 만들었다. bytes를 줄였지만, 그 과정이 weight load와 serial하게 실행되면서 더 큰 손해가 난 사례다.

Sionic은 K축을 16개로 나누는 Split-K로 충분한 CTA를 만들고, 해당 fused path를 **37µs**까지 줄였다고 보고한다. 비교 기준은 완전히 같은 kernel이 아니므로 이를 일반적인 3.4배 benchmark로 읽으면 안 된다. 다만 live quantization을 “추가 연산”이 아닌 memory scheduling 문제로 다뤄야 한다는 교훈은 분명하다.

### 2. Blackwell의 TMEM은 FLOPS보다 pipeline 모양을 바꾼다

원문은 기존 HMMA path에서 K=48 반복마다 scale calculation이 barrier처럼 작동한다고 설명한다. 다음 weight를 미리 가져오는 비동기 pipeline이 끊기면서 effective bandwidth가 약 **0.49TB/s(peak의 6%)**까지 내려간다는 것이다.

여기서 사용한 Blackwell 특화 장치가 `tcgen05`와 TMEM(Tensor Memory)이다. tensor-core 결과와 관련 scale 처리를 TMEM 중심으로 다루면 accumulator를 register에 계속 붙잡아 둘 필요가 줄고, weight load와 tensor-core calculation을 더 오래 겹칠 수 있다. Sionic은 이 경로의 bandwidth가 **1.53TB/s(19%)**로 약 3.1배 올랐다고 보고한다.

이 수치는 “TMEM을 쓰면 모든 모델이 3.1배 빨라진다”는 뜻이 아니다. batch-1 MoE, live quantization, B300의 특정 kernel shape에서 나온 값이다. 오히려 실무적 결론은 더 보수적이다. GPU 세대가 새 기능을 내더라도, 실제 이득은 feature 사용 여부가 아니라 **register·CTA·prefetch·barrier 배치를 함께 바꿨는가**에 달려 있다.

### 3. MTP는 HBM 전송을 없애지 않고 여러 token에 분배한다

커널과 fusion으로 single forward를 줄여도, autoregressive decode는 main model weight를 token마다 다시 읽어야 한다. 여기서 MTP(Multi-Token Prediction)는 “더 빠른 1회 forward”와 다른 축이다. 작은 draft path가 미래 token 후보를 만들고, main model이 이를 검증해 앞부분이 일치한 여러 token을 한 번에 확정한다.

평균 acceptance length가 3.5라면 main model의 weight stream 한 번으로 1개가 아니라 평균 3.5개 token을 확정한다. batch를 키워 여러 request가 weight를 공유하는 효과를, batch-1의 한 request 내부에서 일부 재현하는 셈이다. 원문은 greedy decoding 약 **100 tok/s**에서 MTP 적용 후 약 **600 tok/s**로 올랐다고 설명한다.

하지만 MTP는 이론상의 multiplier가 아니다. Sionic은 activation quantization으로 logits 분포가 조금 달라졌을 때 acceptance length가 **7.13 → 4.47**로 떨어진 사례를 든다. 이 상황에서는 quantization이 아낀 bandwidth보다 MTP가 잃은 token 확정 수가 더 커져 end-to-end throughput이 오히려 하락할 수 있다.

| 최적화 축 | 직접 줄이는 것 | 실패하면 생기는 문제 | 이 사례의 연결점 |
|---|---|---|---|
| kernel / Split-K / TMEM | forward 1회의 idle time과 bandwidth underutilization | peak bandwidth에 못 미침 | live quant path와 GEMM pipeline을 재구성 |
| quantization / PQ-GEMM | 읽어야 할 byte와 HBM 왕복 | extra kernel·serialization이 이득을 상쇄 | quant을 GEMM 실행 경로 안에서 다룸 |
| MTP / speculative decode | main forward당 확정 token 수 | acceptance가 낮으면 실제 gain이 사라짐 | quantization fidelity를 acceptance 조건으로 검증 |
| runtime | CPU H2D sync·launch·graph·collective overhead | MTP가 깊어질수록 GPU 밖 병목이 부각 | SGLang에 20개 이상 patch를 적용했다고 보고 |

## 공개된 근거에서 확인되는 점

Sionic이 공개한 수치와 변경 범위는 다음처럼 정리할 수 있다. 모두 해당 팀의 B300·GLM-5.2·workload 조건에서 나온 author-reported measurement다.

| 항목 | 원문 보고값 | 읽는 방법 |
|---|---:|---|
| 모델 / 구조 | GLM-5.2 753B MoE, token당 top-8 expert | Z.AI/NVIDIA의 공개 model information과 큰 틀에서 일치 |
| B300 HBM3e peak | 약 8TB/s | 하드웨어 peak와 effective bandwidth는 다름 |
| 초기 full forward | 약 9ms | 원문 조건의 baseline이며 universal latency가 아님 |
| 초기 GEMM effective bandwidth | 약 2.1TB/s | peak의 약 26%로 제시 |
| fused live-quant path | 127µs → 37µs | 같은 문제 구간의 최적화 전후로 제시 |
| TMEM/tcgen05 path bandwidth | 0.49TB/s → 1.53TB/s | pipeline serialization을 줄인 kernel-level measurement |
| end-to-end decode | 108 tok/s → 600 tok/s, 최종 600~1000 tok/s | MTP·runtime·kernel을 묶은 self-reported system result |
| runtime 변경 | SGLang 20개 이상 patch | CPU sync, CUDA Graph, MoE AllReduce, sampling fusion 등을 언급 |

이 공개물은 코드 release나 독립 leaderboard가 아니라 hands-on engineering write-up이다. 그래서 가장 강한 근거는 “누구나 같은 수치를 즉시 재현할 수 있다”가 아니라, **속도 개선을 어떤 계층에서 측정했고 어떤 상호의존성을 발견했는가**에 있다. 특히 600~1000 tok/s 범위는 prompt length, output length, sampling, MTP depth, acceptance, TP topology, cache state에 민감할 수 있으므로, 구매·용량 계획의 고정 상수로 사용하면 안 된다.

## 실무 관점에서의 해석

이 사례의 핵심은 LLM serving optimization을 “더 좋은 GEMM을 쓰는 일”로 좁히지 않는 데 있다. GLM-5.2처럼 MoE와 MTP를 이미 지닌 모델에서는 커널 최적화가 MTP의 acceptance distribution을 망가뜨리면 총속도가 떨어질 수 있고, MTP를 깊게 하면 CPU synchronization과 runtime path가 새 병목이 될 수 있다. 따라서 각각의 microbenchmark가 좋아 보이는 것만으로는 충분하지 않다.

실제 운영에서 먼저 고정해야 할 것은 목표 지표다. interactive batch-1 latency인지, multi-request throughput인지, 긴 context prefill인지, MTP acceptance를 포함한 generated token/s인지에 따라 좋은 최적화가 달라진다. 이 글의 600 tok/s는 특별히 **batch-1 decode와 MTP acceptance**에 최적화된 방향의 숫자다. KV cache hit, routing, session reuse가 중심인 서비스 전체의 p95 latency와는 별도 측정이 필요하다.

또한 B300의 SASS·`tcgen05`·TMEM 경로는 이식성이 낮다. 같은 모델이라도 H100, B200, 다른 tensor parallel degree, 다른 quant scheme, 다른 inference engine에서는 kernel schedule과 병목이 달라진다. 이 사례를 곧바로 복제하기보다, 먼저 profiler로 CTA occupancy, HBM throughput, register spill, small-kernel launch, CPU/GPU synchronization, MTP acceptance length를 같은 trace에서 연결해 보는 편이 낫다.

결론적으로 Sionic의 결과는 “전용 ASIC이 아니면 753B 모델을 빠르게 못 돌린다”는 직관에 중요한 반례를 준다. 다만 그 반례의 조건은 매우 구체적이다. **모델별 커널, GPU 세대별 memory hierarchy, numerical fidelity, speculative decoding, runtime scheduler를 함께 co-design할 수 있을 때**다. 대형 오픈 모델의 다음 경쟁은 parameter 수나 단일 GEMM TFLOPS보다, 이 다섯 계층을 얼마나 한 시스템으로 묶을 수 있는가에서 갈릴 가능성이 높다.

Sources: [Sionic GLM-5.2 B300 최적화 글](https://blog.sionic.ai/glm-5-2-x10), [Z.AI GLM-5.2 Hugging Face 모델 카드](https://huggingface.co/zai-org/GLM-5.2), [NVIDIA NIM GLM-5.2 model card](https://build.nvidia.com/z-ai/glm-5.2/modelcard), [기존 GLM-5.2 릴리스 분석](/blog/foundation-models/glm-5-2-long-horizon-agentic-coding/)
