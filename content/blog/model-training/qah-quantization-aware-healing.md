---
title: "4비트가 16비트를 이긴 이유는 양자화가 아니라 두 번째 증류였다"
date: "2026-08-27T15:26:15+09:00"
description: "Quantization-Aware Healing은 구조적으로 압축한 4비트 LLM을 원본 teacher에 다시 증류해, 양자화를 손실 단계가 아니라 배포 직전의 두 번째 복구 단계로 바꾼다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Quantization
  - Knowledge Distillation
  - Model Compression
  - MXFP4
  - LLM Training
draft: false
---

LLM을 더 싸게 서빙하려는 팀은 대개 두 번 모델을 깎는다.[3]
먼저 layer·head·neuron 같은 구조를 줄여 파라미터 수를 낮추고, 남은 가중치를 4비트로 낮춰 메모리와 추론 비용을 더 줄인다.[3]
문제는 이 순서가 reasoning·수학·코딩·긴 문맥 능력에 연속적으로 손실을 남긴다는 점이다.[1][3]

Multiverse Computing의 **Quantization-Aware Healing(QAH)**은 여기서 양자화를 단순한 마지막 변환으로 보지 않는다.[3] 이미 구조가 바뀐 4비트 student를 원래의 큰 모델에 다시 증류해, 양자화 구간을 **두 번째 capability-recovery 단계**로 쓴다.[1][3]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/qah-quantization-aware-healing-official-overview.png"
    alt="원본 모델을 압축·양자화한 student가 원본 teacher logits의 KL divergence로 healing되는 QAH 공식 구조도"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 QAH overview. 원본 모델의 frozen teacher logits가 압축·양자화된 student의 가중치를 직접 교정한다.[3]
  </figcaption>
</figure>

## 무엇을 해결하려는가

구조 압축만 했다면, 압축된 아키텍처의 bfloat16 checkpoint를 다시 학습해 어느 정도 성능을 복구할 수 있다.[3] 그러나 그 checkpoint는 독립적으로 full precision에서 학습한 모델이 아니라, 원본 모델을 압축한 뒤 distillation으로 회복한 근사치다.[3]

그래서 구조 압축 뒤 4비트 양자화를 적용할 때 그 bfloat16 checkpoint를 teacher로 다시 쓰면, student는 이미 줄어든 아키텍처의 ceiling을 따라가게 된다.[3] 논문의 핵심 문제의식은 “양자화-only QAD의 teacher 선택을 구조 압축까지 섞인 pipeline에 그대로 가져와도 되는가”다.[3]

| recovery 방법 | student가 맞추는 신호 | 구조 압축 뒤의 해석 |
|---|---|---|
| QAT | hard label에 대한 cross-entropy | 잃어버린 행동을 label만으로 다시 획득해야 함 |
| 일반 QAD | 같은 구조의 full-precision checkpoint logits | quantization-only에서는 자연스럽지만, 압축 intermediate가 teacher면 ceiling이 낮아질 수 있음 |
| QAH | **원본·비압축 모델의 logits** | student 구조와 무관하게 더 강한 원본 분포를 직접 supervision으로 사용 |

## 핵심 아이디어 / 구조 / 동작 방식

QAH의 teacher는 압축된 bfloat16 모델이 아니라 **압축 전 원본 모델**이다.[3] teacher와 student의 구조가 달라도, 다음 token의 확률분포를 맞추는 KL divergence는 logit 수준에서 작동하므로 같은 layer 수나 hidden size를 요구하지 않는다.[3]

실험 pipeline은 GPT-OSS 120B를 60B로, GPT-OSS 20B를 9B로 구조 압축한 뒤 bfloat16 recovery와 MXFP4 re-quantization을 거친다.[3] QAH 단계에서는 fake quantizer가 들어간 4비트 student가 원본 GPT-OSS teacher의 출력분포만 보고 학습하며, hard label을 직접 보지 않는다.[3]

### 1. teacher를 training loop에서 꺼낸다

긴 context의 distillation은 teacher와 student를 함께 올리고 vocab 전체 logits를 보존하는 순간 VRAM이 급격히 커진다.[3] QAH는 teacher의 top-100 logits를 example별로 한 번 미리 계산해 cache하고, 그 뒤에는 frozen teacher를 training loop에서 제거한다.[3][4]

이 offline cache는 “teacher를 매 step 다시 실행하지 않아도 되는가”와 “많은 ablation에서 같은 supervision을 재사용할 수 있는가”를 동시에 해결한다.[3] companion work는 이 방식이 online distillation과 거의 같은 training loss를 유지하면서 teacher 상주 비용을 없앤다고 설명한다.[4]

### 2. KL을 sequence chunk 단위로 계산한다

여전히 student의 `[batch, sequence, vocabulary]` logits를 통째로 만들면 32K context에서는 메모리가 병목이 된다.[3] QAH는 fused chunked KL을 써서 output projection과 loss를 작은 sequence chunk 단위로 계산하고, 전체 logits grid를 저장하지 않는다.[3][4]

그 결과 intermediate memory는 full sequence 길이 대신 chunk에 의해 제한된다.[3] 논문은 이 구현이 short-context QAT와 같은 hardware에서 32K context QAH를 가능하게 했다고 보고하며, 긴 문맥은 압축 후 손실이 특히 큰 능력이어서 이 systems detail이 방법의 일부다.[3]

### 3. quantization-sensitive 부분은 함부로 움직이지 않는다

저자들은 embedding, layer norm, 일부 attention component처럼 quantization에 민감한 submodule을 freeze했다.[3] 이들을 높은 learning rate에서 풀면 unhealed MXFP4보다 나쁜 checkpoint가 나왔다는 것이 논문이 제시한 operational lesson이다.[3]

즉 QAH는 “더 좋은 teacher 하나”만으로 끝나는 recipe가 아니다.[3] teacher cache, long-context loss kernel, fake quantizer, freeze policy, distributed backend가 함께 맞아야 하는 training systems 문제다.[3][4]

## 공개된 근거에서 확인되는 점

논문의 120B → 60B → MXFP4 pipeline에서, QAH를 거친 4비트 60B는 압축·복구된 bfloat16 60B보다 9개 benchmark 중 7개에서 같거나 높았다.[3] 아래는 그림에서 읽을 수 있는 대표 비교이며, 이는 저자들의 single-run pipeline 측정값이지 독립 재현 leaderboard가 아니다.[3]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/qah-quantization-aware-healing-benchmark-results.svg"
    alt="GPT-OSS 120B, 60B BF16, QAH를 적용한 60B MXFP4의 9개 벤치마크 비교 막대그래프"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2. 빨간 막대의 QAH 60B MXFP4는 자신의 60B BF16 source를 9개 중 7개 benchmark에서 따라잡거나 앞선다.[3]
  </figcaption>
</figure>

| benchmark | 60B BF16 | QAH 60B MXFP4 | 변화 |
|---|---:|---:|---:|
| AIME 2025 | 70.7 | 76.3 | +5.6p |
| LiveCodeBench | 65.5 | 66.5 | +1.0p |
| τ²-bench | 59.4 | 61.7 | +2.3p |
| Aider | 38.2 | 40.9 | +2.7p |
| AA-LCR | 35.3 | 42.7 | +7.4p |

가장 중요한 해석은 “4비트 표현 자체가 더 낫다”가 아니다.[3] 4비트 artifact가 bfloat16 source보다 좋아진 것은 양자화 직전에 **원본 120B teacher로 한 번 더 distillation**을 받았기 때문이며, 저자들도 이를 quantization의 본질적 우위로 해석하지 말라고 명시한다.[3]

원본 120B와 비교하면 LiveCodeBench는 66.5 대 66.0으로 사실상 match로 읽고, GPQA Diamond는 67.4 대 69.0으로 1.6점 차이까지 좁혔다.[3] 반면 AA-LCR은 42.7 대 50.0으로 residual gap이 남아, 구조 압축으로 잃은 extreme long-context capacity가 가장 회복하기 어렵다는 점도 드러난다.[3]

### QAT보다 중요한 차이는 peak가 아니라 운영 안정성이다

9B student 비교에서 QAH는 약 100 step에 평균 54.9까지 올라가고 1,200 step까지 peak 근처를 유지했다.[3] 같은 조건의 QAT는 약 700 step에서 54.6에 도달한 뒤 1,200 step에서 약 36까지 떨어졌으며, 저자들은 이 차이를 hand-tuned early stopping이 필요한가의 문제로 해석한다.[1][3]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/qah-quantization-aware-healing-qah-vs-qat.svg"
    alt="QAH와 QAT의 학습 step별 평균 점수를 비교한 공식 그래프. QAH는 빠르게 안정화되고 QAT는 후반에 크게 하락한다.[3]"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 3. 이 결과는 20B → 9B MXFP4 설정의 단일 비교이며, QAH의 핵심 장점은 peak보다도 continued training에 대한 안정성으로 제시된다.[3]
  </figcaption>
</figure>

논문은 QAH의 KL objective가 student를 frozen teacher distribution 근처에 묶어 두는 반면, QAT의 cross-entropy는 이미 갖고 있던 다른 능력을 침식할 수 있다고 가설을 제시한다.[3] 이는 설득력 있는 운영 가설이지만, 손실 함수 외 data mixture·backend·freeze policy를 완전히 분리한 인과 증명으로 읽어서는 안 된다.[3]

## 실무 관점에서의 해석

QAH가 바꾸는 것은 4비트 양자화의 benchmark 결과보다 **pipeline의 책임 분리**다.[3] 압축은 serving cost를 줄이고, recovery는 압축 손실을 메우며, quantization 직전의 healing은 원본 model behavior를 배포 artifact에 다시 주입하는 별도 학습 단계가 된다.[3]

이 관점에서는 “PTQ 후 성능이 떨어졌으니 약간 fine-tuning하자”보다, 원본 teacher에 접근 가능한 동안 어떤 supervision을 cache해 두고 어느 checkpoint를 최종 artifact로 만들지 설계하는 일이 더 중요하다.[3] 특히 teacher가 너무 커서 online distillation이 불가능한 팀이라면 offline top-K logits와 chunked KL은 QAH의 부수 구현이 아니라 현실적인 실행 조건이다.[3][4]

다만 도입 판단에는 세 가지 경계가 있다.[3] 첫째, 원본 teacher와 training corpus에 대한 장기 접근·라이선스·logit 저장 비용이 있어야 한다.[3] 둘째, 논문은 MXFP4를 쓴 GPT-OSS MoE 한 family와 하나의 data mixture를 중심으로 평가했으며, 다른 format·Llama·Qwen·Mistral로의 일반화는 아직 확인하지 않았다.[3]

셋째, 가장 직접적인 비교인 “원본 teacher QAH 대 recovered bfloat16 teacher QAD”가 같은 조건에서 수행되지 않았다.[3] 저자들이 스스로 가장 가치 있는 후속 실험으로 꼽은 이 baseline, seed variance, proprietary structural compression operator는 headline 수치를 production guarantee가 아닌 유망한 recipe evidence로 읽어야 하는 이유다.[3]

공개 모델 surface는 HyperNova 60B 계열을 open-weight·tool-calling 모델로 제시하지만, 논문은 공개 release가 평가 pipeline 이후의 추가 training을 포함한다고 적는다.[3] 따라서 이 글의 수치는 특정 배포 checkpoint의 현재 model-card score가 아니라, QAH pipeline 자체를 검토한 결과로 분리해 해석하는 것이 정확하다.[3][5]

결국 QAH의 가장 실용적인 메시지는 단순하다.[3]
구조 압축과 저비트화가 함께 들어간다면, 양자화는 끝점이 아니라 **더 강한 teacher를 한 번 더 활용할 수 있는 마지막 training slot**일 수 있다.[3]
하지만 그 slot의 가치는 4비트라는 숫자보다 teacher 선택, cache 가능성, long-context loss, 그리고 아직 비어 있는 직접 baseline을 얼마나 엄격하게 검증하느냐에 달려 있다.[1][3]

## Sources

[1] https://huggingface.co/blog/MultiverseComputingCAI/quantization-aware-healing
[3] https://arxiv.org/html/2608.20953v1
[4] https://huggingface.co/blog/MultiverseComputingCAI/efficient-knowledge-distillation
[5] https://huggingface.co/MultiverseComputingCAI/Hypernova-60B-2605
