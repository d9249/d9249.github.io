---
title: "OSCAR는 VLM 환각 억제를 더 강한 교사보다 자기 검증 루프로 옮긴다"
date: "2026-05-06T15:09:56"
description: "OSCAR는 더 강한 VLM의 오프라인 정답을 흉내 내는 대신, 모델 자신의 판별 능력과 MCTS 탐색을 이용해 온라인 preference 데이터를 만들고 DPO로 갱신함으로써 시각 환각을 줄이는 정렬 프레임을 제안한다."
author: "Sangmin Lee"
category: "safety-privacy"
tags:
  - VLM
  - Hallucination
  - DPO
  - MCTS
  - Multimodal Safety
draft: false
---

멀티모달 모델이 실제 제품에 들어가면 가장 먼저 드러나는 약점 중 하나가 환각이다. 이미지에 없는 물체를 있다고 말하거나, 배경 속 관계를 과하게 추론하거나, 작은 시각 단서를 언어 prior로 메워 버리는 문제는 데모에서는 인상적인 문장력 뒤에 가려지지만, 배포 단계에서는 바로 신뢰성 이슈로 번진다. 특히 자율주행, 로보틱스, 의료 보조처럼 시각 근거가 중요한 환경에서는 "그럴듯한 설명"보다 "실제로 본 것만 말하는가"가 훨씬 중요하다.

이번 논문 *Online Self-Calibration Against Hallucination in Vision-Language Models*는 이 문제를 단순히 더 강한 교사 모델의 supervision으로 덮으려 하지 않는다. 오히려 그런 접근 자체가 약한 학생 모델에게는 독이 될 수 있다고 본다. 저자들은 이를 **Supervision-Perception Mismatch**라고 부르며, 더 잘 보는 교사가 만든 상세 설명을 덜 보는 학생에게 그대로 학습시키면 학생은 시각적으로 확인한 사실이 아니라 언어적 추측을 학습하게 된다고 주장한다.

핵심 제안인 **OSCAR**는 여기서 한 걸음 더 나아간다. 생성은 서투르지만 판별은 상대적으로 낫다는 **Generative-Discriminative Gap**을 이용해, 모델 스스로 문장 단위 사실성을 검사하고 Monte Carlo Tree Search(MCTS)로 더 나은 생성 경로를 탐색한 뒤, 그 트리에서 preference pair를 뽑아 DPO로 다시 학습한다. 요약하면 "더 강한 외부 심사관에게 맞추는 정렬"이 아니라, **모델 자신의 지각 한계 안에서 자기 검증 루프를 돌리는 정렬**로 프레임을 바꾼 작업이다.

![OSCAR mismatch framing](https://arxiv.org/html/2605.00323v1/x1.png)

## 무엇을 해결하려는가

기존 LVLM 환각 억제 흐름에는 크게 세 갈래가 있다. 하나는 contrastive decoding이나 retrospection처럼 디코딩을 바꾸는 방법이고, 다른 하나는 후처리 보정기나 외부 verifier를 붙이는 방법이며, 또 하나는 preference optimization이나 RLHF/DPO 같은 정렬 계층이다. OSCAR가 겨냥하는 지점은 이 중 마지막이다. 문제는 이 계층이 지금까지 너무 자주 **더 강한 모델이 만든 오프라인 데이터**에 의존해 왔다는 데 있다.

저자들의 문제 제기는 꽤 날카롭다. 학생 모델이 실제로는 잘 보지 못하는 작은 물체나 세밀한 속성을 교사 모델은 자연스럽게 서술한다. 그런데 학생이 그 서술을 정답처럼 따라 배우면, 시각 표현을 더 정교하게 배우는 것이 아니라 "그럴듯하게 메우는 법"을 배우기 쉽다. 논문은 LLaVA-1.5-7B에 Qwen3-VL-8B가 생성한 상세 설명을 점점 더 많이 학습시킬수록 POPE와 AMBER 계열 지표가 오히려 악화된다고 보고한다. 즉 교사가 강할수록 항상 좋은 것이 아니라, **교사의 시각 해상도와 학생의 지각 해상도가 다르면 정렬 데이터 자체가 mismatch**가 될 수 있다는 것이다.

OSCAR는 그래서 환각 억제를 단순한 정답 증류 문제가 아니라, **모델이 실제로 볼 수 있는 범위 안에서 truthful supervision을 어떻게 만들 것인가**의 문제로 다시 정의한다. 이 재정의가 이 논문의 출발점이다.

![Offline supervision mismatch result](https://arxiv.org/html/2605.00323v1/x2.png)

## 핵심 아이디어 / 구조 / 동작 방식

OSCAR의 핵심 아이디어는 두 축으로 요약된다. 첫째는 생성형 응답과 판별형 검증 사이의 능력 차이를 활용하는 것이고, 둘째는 한 번의 greedy decoding이 아니라 탐색을 통해 더 나은 trajectory를 찾아 preference 데이터로 바꾸는 것이다.

### 1) Generative-Discriminative Gap 활용

논문은 LLaVA-1.5-7B가 자유 서술에서는 이미지에 없는 `clock`을 환각하지만, 같은 이미지에 대해 "시계가 있느냐"고 묻는 판별형 질문에는 `No`를 맞히는 사례를 제시한다. 더 정량적으로는 COCO 샘플 500장에 대해 hallucinated object를 검출한 뒤 이를 Yes/No 검증 질문으로 바꿔 다시 묻는 방식으로 self-verification을 수행했고, 그 결과 CHAIR S가 **49.0% → 36.0%**, CHAIR I가 **14.3% → 9.3%**로 내려간다고 보고한다. 생성은 흔들려도, 특정 객체 존재 여부를 확인하는 판별은 더 안정적이라는 뜻이다.

### 2) MCTS 기반 sentence-level 탐색

OSCAR는 응답을 토큰이 아니라 **문장 단위**로 나눠 탐색한다. 각 노드는 부분 응답 상태를, 각 액션은 다음 문장 생성을 뜻한다. 탐색은 selection, expansion, evaluation, backpropagation의 4단계로 이루어지며, PUCT 기준으로 분기 선택을 한다. 핵심은 지금 당장 무난해 보이는 문장이 몇 문장 뒤 환각을 유발할 수 있다는 점을 탐색으로 미리 반영한다는 것이다.

### 3) Dual-Granularity Reward Mechanism

OSCAR의 reward는 두 층위로 나뉜다.

- **Process Reward**: 각 문장이 이미지에 없는 객체를 언급하는지 모델 스스로 `No` 확률로 검증한다.
- **Gated Outcome Reward**: 전체 rollout이 hallucination-free일 때만 응답 품질 점수를 주고, 사실성 검사를 통과하지 못하면 outcome reward를 0으로 둔다.

이 구조는 "유창하지만 사실이 틀린 문장"이 전체 trajectory 점수를 쉽게 가져가지 못하게 만든다. 즉, 품질 평가는 하되 **사실성 통과가 먼저인 gate**를 둔다.

### 4) Preference pair 추출과 DPO 반복 학습

탐색 트리에서 저자들은 두 종류의 preference pair를 뽑는다.

- **Global path comparison**: 누적 가치가 가장 높은 전체 경로와 가장 낮은 전체 경로를 짝지음
- **Sibling comparison**: 최적 경로 위 노드와 같은 부모를 가진 최악의 형제 분기를 짝지음

그 뒤 이 쌍을 사용해 DPO로 모델을 업데이트한다. 업데이트된 모델은 다시 MCTS를 돌려 새로운 preference 데이터를 만들고, 이 루프를 반복한다. 이 구조 덕분에 데이터 분포가 고정된 teacher corpus에 묶이지 않고, 모델이 좋아질수록 supervision granularity도 함께 진화한다.

![OSCAR overview](https://arxiv.org/html/2605.00323v1/x4.png)

| 구성 요소 | OSCAR에서 하는 일 | 실무적 의미 |
|---|---|---|
| 판별형 self-check | 각 문장이 이미지 근거를 벗어나는지 `Yes/No`로 확인 | 외부 judge 없이도 내부 verifier 역할 일부 대체 |
| MCTS 탐색 | 장기적으로 덜 위험한 문장 경로를 찾음 | greedy decoding이 놓치는 downstream hallucination 위험 반영 |
| Gated outcome reward | 사실성 통과 후에만 품질 점수 반영 | 유창하지만 틀린 응답을 고득점에서 배제 |
| DPO 반복 업데이트 | 트리에서 뽑은 preference pair로 모델 재학습 | 오프라인 teacher corpus 대신 online alignment 루프 형성 |

## 공개된 근거에서 확인되는 점

논문은 LLaVA-1.5 7B와 13B를 기반으로 Object HalBench, AMBER-Gen, MM-VET, AMBER-Dis, POPE를 함께 평가한다. 중요한 점은 hallucination 억제뿐 아니라 일반 멀티모달 성능도 같이 본다는 것이다. 단순히 답변을 짧고 보수적으로 만들어 환각만 줄이는 접근과 구분하려는 의도로 읽힌다.

가장 눈에 띄는 수치는 LLaVA-1.5-7B 기준의 iterative improvement다. 베이스라인은 Object HalBench CHAIR S **49.0**, CHAIR I **14.3**, AMBER-Dis Hal **31.2**, Cog **3.6**, POPE F1 **85.87**이다. 여기에 OSCAR를 3회 반복 적용하면 CHAIR S **27.6**, CHAIR I **8.2**, Hal **17.2**, Cog **1.6**, POPE F1 **86.22**까지 개선된다. 즉 환각 관련 지표는 뚜렷하게 내려가고, 판별형 benchmark의 F1도 소폭 오른다.

13B 모델에서는 개선 폭이 더 인상적이다. LLaVA-1.5-13B baseline 대비 OSCAR Iter3는 Object HalBench CHAIR S를 **44.8 → 5.4**, CHAIR I를 **11.8 → 2.6**으로 크게 낮춘다. AMBER-Dis Hal은 **30.3 → 8.0**, Cog는 **3.1 → 0.5**가 되며, POPE F1은 **86.67 → 87.26**으로 오른다. MM-VET overall은 baseline 37.6에서 OSCAR Iter1 37.4, Iter2 35.6, Iter3 36.5로 약간 출렁이지만, 환각 억제와 일반 멀티모달 능력 사이의 trade-off를 크게 무너뜨리지는 않았다는 해석이 가능하다.

또 하나 중요한 근거는 ablation이다. 단순 process reward만 쓴 경우보다, MCTS와 gated outcome reward를 함께 붙였을 때 개선 폭이 커진다. Table 2에서 full OSCAR는 baseline 대비 CHAIR S를 **49.0 → 32.0**, CHAIR I를 **14.3 → 9.7**로 낮춘다. 이는 "self-check만 넣으면 끝"이 아니라, **탐색과 두 층위 reward를 함께 써야 효과가 난다**는 논문 주장을 뒷받침한다.

오프라인 teacher data와의 비교도 직접 제시된다. AMBER benchmark에서 10k 샘플 기준으로 `SFT(Qwen3-VL)`은 baseline보다 오히려 나빠져 CHAIR가 **7.6 → 9.2**, Hal이 **31.2 → 62.7**, Cog가 **3.6 → 6.1**로 악화된다. 반면 `SFT(OSCAR)`는 CHAIR **4.5**, Hal **15.4**, Cog **1.4**를 기록한다. 이 부분이야말로 논문의 핵심 메시지를 가장 직접적으로 보여주는 표다.

| 설정 | Object HalBench CHAIR S | Object HalBench CHAIR I | AMBER-Dis Hal | AMBER-Dis Cog | POPE F1 |
|---|---:|---:|---:|---:|---:|
| LLaVA-1.5-7B baseline | 49.0 | 14.3 | 31.2 | 3.6 | 85.87 |
| Self-Rewarding | 38.4 | 11.2 | 27.5 | 3.0 | 85.93 |
| OSCAR Iter1 | 32.0 | 9.7 | 22.1 | 2.1 | 86.04 |
| OSCAR Iter2 | 28.6 | 9.0 | 19.4 | 1.9 | 86.07 |
| OSCAR Iter3 | 27.6 | 8.2 | 17.2 | 1.6 | 86.22 |

| 데이터 소스 비교(10k samples) | AMBER CHAIR | AMBER Hal | AMBER Cog |
|---|---:|---:|---:|
| LLaVA-1.5-7B baseline | 7.6 | 31.2 | 3.6 |
| SFT (Qwen3-VL) | 9.2 | 62.7 | 6.1 |
| SFT (LLaVA self-generated) | 7.5 | 30.6 | 3.4 |
| SFT (OSCAR) | 4.5 | 15.4 | 1.4 |

정성 비교도 논문은 함께 제시한다. Figure 5 예시에서는 baseline이 존재하지 않는 물체나 속성을 덧붙이는 반면, OSCAR는 설명을 약간 더 보수적으로 가져가더라도 환각을 줄인 응답을 만든다. 즉 이 방법은 모델을 침묵하게 만드는 방식이라기보다, **지각 가능한 범위 안으로 서술 granularity를 다시 조정하는 방식**에 가깝다.

![Qualitative comparison](https://arxiv.org/html/2605.00323v1/x5.png)

## 실무 관점에서의 해석

이 논문의 진짜 포인트는 hallucination mitigation 기법 하나를 추가했다는 데만 있지 않다. 더 중요한 것은 멀티모달 alignment를 설계할 때, "강한 교사가 만든 정답을 더 많이 모으면 좋아진다"는 직관을 깨고, **모델별 지각 한계를 존중하는 supervision design**이 더 중요할 수 있음을 보여준다는 점이다.

실무적으로 보면 세 가지 해석이 가능하다.

첫째, LVLM 정렬 데이터는 모델 불문 공용 자산이 아니라 **backbone-specific asset**에 더 가깝다. Qwen3-VL이 본 것을 LLaVA가 동일한 해상도로 볼 수 없는데, 그 설명을 그대로 학습시키면 정답 distillation이 아니라 hallucination distillation이 될 수 있다.

둘째, self-improvement를 멀티모달로 가져오려면 단순 self-training보다 **판별형 verification channel**이 중요하다. 텍스트 LLM에서는 자기 비평이 주로 reasoning refinement로 연결되지만, VLM에서는 "무엇을 실제로 봤는지"를 확인하는 binary verification이 훨씬 직접적인 safety signal이 된다.

셋째, OSCAR의 구조는 inference-time search와 training-time alignment를 하나의 루프로 엮는다. 이는 에이전트 시스템에서 planning trace를 preference data로 되먹이는 흐름과도 닮아 있다. 즉 향후 멀티모달 agent가 환경과 상호작용하면서 self-generated trajectory를 다시 정렬 데이터로 쓰는 방향과도 자연스럽게 연결된다.

물론 비용과 복잡도는 남는다. MCTS를 sentence-level로 돌리고, 각 노드에서 verification과 rollout을 수행한 뒤, 다시 DPO까지 이어가는 과정은 일반적인 SFT보다 훨씬 무겁다. 또한 논문은 LLaVA 계열에서 강한 결과를 보였지만, 모든 backbone에서 동일한 정도의 generative-discriminative gap이 재현되는지, 그리고 더 최신 네이티브 멀티모달 모델에서도 같은 구조가 통하는지는 별도 검증이 필요하다.

그럼에도 불구하고 OSCAR는 멀티모달 환각 억제를 "더 센 교사"의 문제에서 "더 좋은 자기 보정 루프"의 문제로 옮겼다는 점에서 꽤 중요한 작업이다. 앞으로 신뢰성 있는 VLM을 만들려면, 더 강한 정답을 모으는 일만큼이나 **모델이 실제로 볼 수 있는 것만 말하게 만드는 online calibration 구조**가 중요해질 가능성이 크다.

Sources: https://arxiv.org/abs/2605.00323, https://arxiv.org/html/2605.00323v1, https://arxiv.org/pdf/2605.00323