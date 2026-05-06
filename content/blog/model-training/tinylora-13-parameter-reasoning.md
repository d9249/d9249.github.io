---
title: "TinyLoRA는 추론 파인튜닝을 13개 파라미터까지 압축한다"
date: "2026-05-06T03:35:58"
description: "Learning to Reason in 13 Parameters는 RL 기반 post-training이 SFT보다 훨씬 정보 밀도가 높은 업데이트를 만든다는 가설 아래, TinyLoRA로 Qwen2.5-7B의 추론 성능을 단 13개 파라미터와 26바이트만으로 크게 끌어올릴 수 있음을 보여준다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - TinyLoRA
  - Reinforcement Learning
  - PEFT
  - Reasoning
  - Qwen
draft: false
---

추론 모델의 성능을 높이는 방법을 이야기할 때 우리는 보통 두 가지를 떠올린다. 하나는 거대한 모델 전체를 다시 post-train하는 것이고, 다른 하나는 LoRA처럼 상대적으로 작은 adapter를 붙여 특정 작업에 맞게 조정하는 것이다. 그런데 이 논문은 그 전제를 정면으로 흔든다. 정말 수백만 개의 LoRA 파라미터가 필요하냐는 질문에서 출발해, 수학 추론 성능 향상에 필요한 실제 업데이트 용량이 생각보다 훨씬 작을 수 있다고 주장한다.

Meta FAIR, Cornell, Carnegie Mellon University 소속 저자들이 제안한 "Learning to Reason in 13 Parameters"의 핵심은 TinyLoRA다. 이 방법은 기존 LoRA와 LoRA-XS를 더 밀어붙여, 심지어 단 하나의 trainable parameter만으로도 추론 성능을 끌어올릴 수 있는 초소형 adapter 구조를 만든다. 더 흥미로운 점은 이런 극단적인 압축이 SFT에서는 잘 작동하지 않고, RL에서만 유난히 강하게 나타난다는 사실이다. 논문은 결국 "reasoning post-training에서 모델이 실제로 배우는 것은 무엇인가"라는 질문을 파라미터 수와 바이트 단위까지 내려가며 실험한다.

![TinyLoRA overview](https://arxiv.org/html/2602.04118v1/x1.png)

## 무엇을 해결하려는가

이 논문이 겨냥하는 문제는 단순한 파라미터 절감이 아니다. 더 정확히 말하면, reasoning 성능 향상을 위해 모델 전체를 크게 바꾸지 않고도 얼마나 효율적으로 업데이트를 저장하고 배포할 수 있는지를 묻는다. 기존 LoRA도 full finetuning보다 훨씬 가볍지만, 8B급 모델에서 rank 1 LoRA조차 여전히 수백만 파라미터를 요구한다. 대규모 분산 학습에서는 이 업데이트를 동기화하는 통신 비용이 커지고, 서빙 환경에서는 여러 개의 adapter를 동시에 메모리에 올리는 비용도 무시하기 어렵다.

저자들의 가설은 여기서 한 걸음 더 나아간다. SFT는 정답 시퀀스의 세부 정보를 통째로 흡수해야 하므로 저용량 업데이트에 불리하지만, RL은 보상 신호만으로도 유용한 방향을 분리해낼 수 있기 때문에 훨씬 더 정보 밀도가 높은 업데이트를 만들 수 있다는 것이다. 즉 reasoning 능력을 새로 "주입"한다기보다, 이미 기반 모델 안에 있던 잠재 능력을 아주 작은 방향 수정으로 끌어내는 편에 가깝다는 해석이다.

이 문제의식은 실무적으로도 중요하다. 만약 특정 수학·도메인 추론 스타일을 수십 바이트에서 수 킬로바이트 수준의 adapter로 표현할 수 있다면, personalization, 멀티테넌트 서빙, 분산 RL 학습, 빠른 롤백 같은 운영 패턴이 지금보다 훨씬 가벼워질 수 있기 때문이다.

## 핵심 아이디어 / 구조 / 동작 방식

TinyLoRA의 출발점은 LoRA-XS다. 기존 LoRA가 각 선형층에 대해 저랭크 행렬 A와 B를 학습해 수백만 개 규모의 파라미터를 만든다면, LoRA-XS는 원래 가중치의 truncated SVD를 활용해 trainable한 부분을 더 작은 행렬 R로 줄인다. TinyLoRA는 여기서 다시 한 번 R 자체를 고정된 랜덤 텐서 위에 투영되는 작은 벡터 v로 치환한다. 이렇게 하면 각 모듈마다 학습해야 하는 값이 행렬이 아니라 몇 개의 스칼라로 줄어든다.

논문이 제안하는 두 번째 축은 parameter sharing이다. Transformer 블록마다 query, key, value, output, up, down, gate projection 등에 개별 adapter를 두면 아무리 작은 구조라도 전체 파라미터 수가 다시 커진다. 저자들은 여러 모듈이 동일한 trainable vector를 공유하게 만드는 weight tying factor를 도입해, 계층과 모듈 전체에 걸쳐 같은 업데이트를 재사용하도록 만든다. 이 설계를 극단까지 밀면 모든 모듈이 하나의 벡터를 공유할 수 있고, 총 trainable parameter 수는 정말 1개까지 내려간다.

핵심은 이 구조가 단순한 압축 트릭이 아니라 RL과 결합될 때 비로소 강력해진다는 점이다. 실험은 Qwen2.5와 Llama 계열 instruction model에 대해 GRPO를 사용해 진행됐고, 보상은 exact-match 기반으로 준다. 저자들은 GSM8K뿐 아니라 MATH training setup과 MATH500, Minerva, OlympiadBench, AIME24, AMC23 등 더 어려운 수학 벤치마크로도 확장해, 저용량 adapter가 단일 장난감 결과가 아니라는 점을 확인하려 했다.

또 하나 눈에 띄는 구현 포인트는 vLLM/VERL 기반 RL 실험 경로다. vLLM은 최소 LoRA rank 제한과 커스텀 kernel 제약이 있어 TinyLoRA 같은 변형을 바로 넣기 어렵다. 논문은 이를 우회하기 위해 추론 시점에는 merged weights를 쓰고, 마지막 forward에서만 실제 LoRA 모델을 사용하는 방식으로 훈련을 돌린다. 이때 생기는 train/inference mismatch는 truncated importance sampling으로 완화했다고 설명한다. 즉 아이디어 자체뿐 아니라 기존 RL 학습 스택 위에 이런 초소형 adapter를 어떻게 실험적으로 얹을지도 함께 다룬 셈이다.

| 방식 | 학습되는 업데이트 크기 | 특징 | 한계 |
|---|---|---|---|
| Full Finetuning | 모델 전체 | 최고 성능 상한이 높고 단순함 | 메모리·통신·배포 비용이 큼 |
| LoRA | 보통 수백만 개 이상 | 가장 널리 쓰이는 PEFT 방식 | 모델 폭에 묶여 작은 규모로 잘 안 내려감 |
| LoRA-XS | 수천~수만 개까지 축소 가능 | SVD 기반으로 더 작은 적응 가능 | 여전히 모듈 수에 비례한 하한이 존재 |
| TinyLoRA | 1개~수백 개까지 축소 가능 | 랜덤 투영 + weight tying으로 극단적 압축 가능 | SFT에서는 성능 유지가 어렵고 RL 세팅 의존성이 큼 |

## 공개된 근거에서 확인되는 점

가장 강한 결과는 Qwen2.5-7B-Instruct의 GSM8K 실험이다. 논문 초록과 본문에 따르면 TinyLoRA + GRPO는 단 13개의 trainable parameter, 즉 bf16 기준 총 26바이트만으로 91% 정확도를 달성한다. 같은 모델에서 저자들은 120개 수준의 파라미터만으로도 최대 성능 향상의 95%를 회수할 수 있다고 보고한다. 이는 기존 low-rank adapter 논의에서 보던 "수백만 개에서 수만 개로 감소"보다 한 단계 더 나아가, 사실상 바이트 단위 추론 튜닝이라는 관점을 제시한다.

SFT와 RL의 차이도 꽤 선명하다. Qwen2.5-7B-Instruct 기준으로 RL은 13개 파라미터에서 91%, 120개 부근에서 95%에 도달하지만, SFT는 같은 저용량 구간에서 각각 83%, 84% 수준에 머문다. 논문은 이를 두고 RL이 더 information-dense한 업데이트를 만든다고 해석한다. 즉 정답 시퀀스 전체를 복제해야 하는 SFT보다, reward를 통해 유의미한 방향만 증폭하는 RL이 tiny update regime에 더 잘 맞는다는 주장이다.

더 넓은 수학 벤치마크에서도 결과는 일관적이다. HTML 테이블 기준으로 Qwen2.5-7B-Instruct base 모델은 GSM8K 88.2, MATH500 64.6, AIME24 3.3, AMC23 30.0, 평균 40.3을 기록한다. 그런데 13개 파라미터만 학습한 TinyLoRA 모델은 GSM8K 91.8, MATH500 74.6, AIME24 16.0, AMC23 54.5, 평균 50.1까지 오른다. 196개 파라미터에서는 평균 53.2, 100,352개 파라미터에서는 평균 54.6으로 full finetuning 평균 55.2에 근접한다. 논문 본문은 이 수치를 요약하며, 196개 파라미터만으로도 여섯 개 어려운 수학 벤치마크에서 절대 성능 향상의 87%를 유지한다고 설명한다.

또한 모델 크기가 커질수록 필요한 업데이트가 더 작아지는 경향도 흥미롭다. Figure 3과 Figure 6은 큰 백본일수록 peak performance의 95% 수준에 도달하는 데 필요한 파라미터 수가 더 작아지는 경향을 보인다고 정리한다. 저자들은 이를 근거로, 앞으로 더 큰 모델일수록 극소형 adapter가 더 실용적인 학습 수단이 될 수 있다고 본다.

| 설정 | GSM8K | MATH500 | AIME24 | AMC23 | 평균 |
|---|---:|---:|---:|---:|---:|
| Qwen2.5-7B-Instruct Base | 88.2 | 64.6 | 3.3 | 30.0 | 40.3 |
| TinyLoRA 13 params | 91.8 | 74.6 | 16.0 | 54.5 | 50.1 |
| TinyLoRA 196 params | 92.2 | 76.6 | 16.7 | 57.5 | 53.2 |
| TinyLoRA 100,352 params | 92.8 | 78.0 | 16.7 | 60.0 | 54.6 |
| Full Finetuning | 91.7 | 78.2 | 20.0 | 62.5 | 55.2 |

## 실무 관점에서의 해석

내가 보기에 이 논문의 진짜 흥미는 "LoRA를 더 작게 만들었다"보다도, RL post-training이 실제로 모델 안에 무엇을 저장하는지를 정면으로 건드린다는 데 있다. 만약 13개 파라미터와 26바이트만으로도 수학 추론 성능이 크게 올라간다면, 이는 reasoning 학습이 완전히 새로운 지식을 집어넣는다기보다 기존 모델의 표현을 특정 방식으로 재배열하거나 증폭하는 쪽에 가깝다는 신호일 수 있다. 논문 후반부의 discussion도 같은 방향을 시사한다. 특히 긴 답변을 생성하는 스타일 변화 자체가 reasoning 성능 향상과 깊게 연결되어 있을 가능성을 언급한다.

운영 관점에서는 adapter 배포 단위가 극단적으로 작아질 때의 가능성이 크다. 초소형 adapter는 더 많은 개인화 버전을 메모리에 올릴 수 있고, RL 기반 업데이트를 여러 노드에 동기화할 때 통신 병목도 줄일 수 있다. 멀티테넌트 서빙이나 사용자별 reasoning style personalization을 생각하면 꽤 실용적인 그림이다. 논문이 굳이 byte-constrained regime과 fp32/bf16 비교까지 실험한 이유도 이 맥락으로 읽힌다.

물론 한계도 분명하다. 결과는 현재 수학 reasoning 벤치마크에 집중돼 있고, 과학 문제 해결이나 코딩, 개방형 도메인 추론, 창의적 생성에서도 같은 현상이 유지되는지는 아직 모른다. 또 TinyLoRA가 강력한 이유는 RL 세팅과 결합됐기 때문이라, reward 설계가 어려운 실제 업무에서는 재현 난도가 올라갈 수 있다. Llama 계열보다 Qwen 계열에서 훨씬 잘 먹힌다는 점도 모델 아키텍처나 사전학습 데이터의 영향을 시사한다.

그럼에도 불구하고 이 논문은 post-training 비용을 줄이는 방향이 단순히 더 좋은 optimizer나 더 큰 GPU 클러스터에만 있지 않다는 점을 보여준다. 앞으로는 "얼마나 많은 파라미터를 학습했는가"보다 "얼마나 적은 정보로 원하는 행동을 다시 끌어낼 수 있는가"가 더 중요한 질문이 될 수 있다. TinyLoRA는 그 질문을 꽤 강렬한 방식으로 던진다.

Sources: https://arxiv.org/abs/2602.04118, https://arxiv.org/html/2602.04118v1, https://arxiv.org/pdf/2602.04118
