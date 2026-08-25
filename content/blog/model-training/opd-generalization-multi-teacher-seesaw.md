---
title: "OPD는 답보다 교사의 정책을 옮기고, 그래서 다중 교사에서 줄다리기가 된다"
date: "2026-08-26T00:53:58"
description: "Every Coin Has Two Sides는 on-policy distillation이 교사의 문제별 정답보다 reasoning behavior를 전이하며, 같은 계보 teacher에서는 범위를 넓히지만 multi-teacher 조합에서는 capability seesaw를 낳을 수 있음을 통제 실험으로 분석한다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - On-Policy Distillation
  - Multi-Teacher Distillation
  - Post-Training
  - Reasoning Models
  - Generalization
draft: false
---

on-policy distillation(OPD)은 작은 student가 **자기 policy가 실제로 방문한 trajectory**를 만들고, teacher가 그 prefix에서 더 높게 둘 token 확률을 dense supervision으로 제공하게 하는 post-training 방식이다.[2]
그래서 단순한 offline response imitation보다 training–inference mismatch를 줄일 가능성이 있지만, 흔히 남는 질문은 하나다.[2]
수학 prompt에서 얻은 OPD 신호가 정말 reasoning behavior를 옮기는가, 아니면 그 training distribution 근처의 답을 더 잘 맞히게 하는가?[1][2]

`Every Coin Has Two Sides`는 이 질문을 난이도, 언어, reasoning horizon, task domain, teacher–student 계보 관계, multi-teacher mixture라는 축으로 하나씩 바꿔 본 controlled study다.[2]
결론은 직관적이면서도 불편하다.[2]
OPD의 전이는 같은 base model 계보에서 매우 넓게 퍼질 수 있지만, 바로 그 확장성 때문에 domain expert routing만으로는 여러 teacher의 영향을 격리할 수 없다.[1][2]

이 글은 새 model이나 바로 설치 가능한 training framework 소개가 아니다.[2]
2026년 8월 공개된 under-review 연구가 **OPD 일반화가 언제 policy-level transfer가 되고, 언제 teacher 간 간섭이 되는지**를 분석한 결과로 읽는다.[2]
arXiv 논문 페이지에는 별도의 저자 code·project release 링크가 확인되지 않으므로, 아래 수치는 저자 실험의 보고값이지 독립 재현값이 아니다.[1][2]

## 무엇을 해결하려는가

일반 offline distillation은 보통 teacher가 만든 response를 dataset처럼 student에 보여 준다.[2]
반면 OPD에서는 student가 현재 policy로 rollout을 먼저 만들고, teacher는 student가 실제로 생성한 history에서 token-level 확률을 제공한다.[2]
논문은 이 방식이 student가 deployment 때 방문할 상태에 맞춘 supervision을 준다는 장점에서 출발한다.[2]

그러나 기존 OPD 평가는 대체로 training domain 안이나 가까운 benchmark에 머물렀다.[2]
저자들이 분리하려는 것은 두 설명이다.[2]
첫째, teacher가 training prompt의 정답·형식을 국소적으로 잘 맞추게 만들었을 수 있다.[2]
둘째, teacher의 reasoning behavior 자체가 student policy에 더 넓게 전이됐을 수 있다.[2]
둘은 data selection, teacher 선택, multi-teacher routing을 설계할 때 전혀 다른 결론으로 이어진다.[1][2]

논문은 이를 위해 수학·code·science·instruction following 네 domain을 사용하고, math에서는 영어→중국어, 짧은 문제→여러 문제를 조합한 long-horizon 문제라는 distribution shift도 둔다.[2]
teacher와 student가 같은 base checkpoint에서 갈라졌는지에 따라 **same-origin**과 **cross-origin** OPD를 비교한다.[2]

## 핵심 아이디어 / 구조 / 동작 방식

### student가 간 상태에서 teacher를 읽는다

OPD에서 prompt $x$에 대해 student가 response $y$를 생성하면, 각 prefix $h_t=(x,y_{<t})$에서 student와 teacher의 분포를 비교한다.[2]
이 논문은 teacher가 student보다 높은 확률을 준 token을 강화하고 반대 token을 억제하는 policy-gradient 스타일의 reverse-KL 근사를 사용한다.[2]

여기서 핵심은 teacher가 무엇을 “정답으로 출력했는가”가 아니다.[2]
student가 만든 prefix에서 teacher와 student가 얼마나 다른 next-token policy를 갖는가다.[2]
저자들은 이 때문에 teacher가 end-to-end로 문제를 풀지 못한 prompt에서도 유용한 token-level supervision을 줄 수 있다고 가정하고, 그 가설을 teacher pass-rate별 data split으로 시험한다.[2]

| 구분 | same-origin OPD | cross-origin OPD |
|---|---|---|
| 계보 | teacher와 student가 같은 base model에서 출발 | 서로 다른 base model에서 출발 |
| 논문이 관찰한 전이 | 언어·horizon·다른 domain으로도 teacher 수준에 가까워지는 경향 | 주로 training distribution에서 개선하고 cross-domain에서는 약해지는 경향 |
| 실무 해석 | policy compatibility가 높을 때 넓은 전이가 가능 | 강한 teacher라도 student와의 분포 간격이 큰지 별도 검증 필요 |

표는 논문의 same/cross-origin 정의와 결과 방향을 압축한 것이다.[2]
이는 “같은 계보면 항상 좋다”는 규칙이 아니라, 이 실험에서 teacher의 standalone score보다 **student policy와의 정렬 가능성**이 더 중요한 변수였다는 관찰이다.[2]

### 1. 교사가 못 푼 문제도 training value가 있을 수 있다

저자들은 BigMath에서 teacher가 네 번의 rollout을 모두 푼 easy(pass-rate 1), 한 번도 못 푼 hard(pass-rate 0), 무작위 random subset을 각각 25K개로 만들어 비교했다.[2]
Qwen3-32B→Qwen3-8B-SFT, Polaris-7B→DS-distill-1.5B/7B의 세 pair에서 final math accuracy는 세 subset이 거의 같은 지점으로 수렴했다고 보고한다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/opd-generalization-model-origin.svg">
    <img
      src="/images/blog/opd-generalization-chinese-math-crop.svg"
      alt="DS-distill-1.5B 학생 모델에서 cross-origin Polaris-7B와 same-origin JustRL-1.5B teacher의 OPD 중국어 수학 전이 결과를 비교한 공식 그래프의 중앙 패널"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2(a).[2]
영어 수학 prompt만 사용했는데도 중국어·long-horizon benchmark로의 전이를 추적하며, teacher–student 계보 관계가 gain의 크기와 안정성에 영향을 준다는 결과를 보인다.[2]
영어 원본 그림이다.[2]
  </figcaption>
</figure>

이 결과는 teacher의 final answer correctness가 sample usefulness의 유일한 기준이 아니라는 뜻이다.[2]
OPD가 student rollout의 국소 prefix에서 teacher policy를 읽기 때문에, teacher가 끝까지 정답을 내지 못한 trajectory에도 student보다 나은 token preference가 남아 있을 수 있다는 해석이 가능하다.[2]
다만 저자들도 가장 다양한 BigMath mixture가 extreme difficulty dataset보다 전반적으로 나았다고 보고한다.[2]
“hard example filtering은 필요 없다”가 아니라, **teacher pass-rate 하나만으로 training set을 고르는 것은 정보가 부족하다**는 결론에 가깝다.[2]

student 쪽 dynamic sampling에서는 이미 student가 확실히 푸는 problem만 버리는 전략이 작지만 일관된 gain을 보였다.[2]
Polaris-7B→DS-distill-1.5B는 six-math-benchmark average가 41.4에서 42.0으로, Light-R1-14B→DS-distill-7B는 52.4에서 52.8로 상승했다.[2]
반대로 fully unsolved 또는 fully solved prompt만 남기는 극단 filtering은 개선을 만들지 못했다.[2]

### 2. 전이 범위는 teacher 크기보다 model origin에 민감했다

영어의 짧은 수학 문제만으로 OPD를 했을 때, 논문은 중국어 수학 및 long-horizon composed math에서도 성능 상승이 나타났다고 보고한다.[2]
특히 same-origin pair는 in-distribution뿐 아니라 language·horizon shift에서도 student가 teacher 성능에 가까워지는 경향을 보였고, cross-origin pair는 더 강한 standalone teacher를 써도 gain이 작거나 long-horizon에서 거의 나타나지 않는 경우가 있었다.[2]

이 차이는 cross-domain에서도 반복된다.[2]
same-origin 설정에서는 math prompt로 학습한 student가 LiveCodeBench와 GPQA-Diamond에서도 teacher 쪽으로 이동하고, code·science·instruction-following prompt에서 얻은 supervision이 다시 math로 전이됐다고 저자들은 보고한다.[2]
cross-origin 설정에서는 target domain prompt로 직접 학습하는 curve가 다른 domain prompt로 학습한 curve보다 일관되게 높았다.[2]

따라서 OPD의 teacher 선택을 leaderboard score 하나로 처리하면 위험하다.[2]
이 논문의 제한된 experimental family에서는 “더 강한 외부 teacher”보다 **student와 가까운 policy 변화로부터 나온 teacher**가 일반화에 더 유리했다.[2]
이는 model lineage, tokenizer·base distribution, post-training path를 teacher selection의 실험 변수로 넣어야 한다는 신호다.[2]

### 3. 다중 교사 routing은 능력을 domain별로 봉인하지 못한다

multi-teacher OPD(MOPD)는 prompt를 math teacher, science teacher, instruction-following teacher처럼 domain expert에게 route한다.[2]
표면적으로는 각 teacher가 자신에게 배정된 prompt에서만 영향을 줄 것 같지만, single-teacher OPD에서 이미 cross-domain transfer가 확인됐다면 이 전제는 약해진다.[2]

저자들은 math에 강한 JustRL-1.5B와 science·instruction following에 강한 Nemotron-1.5B를 섞고, prompt mixture ratio를 바꿨다.[2]
JustRL share를 늘리자 JustRL이 상대적으로 약한 GPQA-Diamond, LiveCodeBench, IF-Eval 성능도 그 teacher 쪽으로 함께 내려갔다.[2]
teacher가 맡은 domain label보다 **mixture에서 차지하는 비중과 teacher의 전 domain policy**가 student를 끌어당겼다는 것이다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/opd-multi-teacher-seesaw.svg">
    <img
      src="/images/blog/opd-multi-teacher-livecodebench-crop.svg"
      alt="Nemotron과 JustRL teacher의 prompt mixture 비율에 따라 LiveCodeBench 성능 곡선이 달라지는 공식 MOPD seesaw 실험 그래프의 중앙 패널"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 4(a).[2]
JustRL이 math teacher로 route된 setting에서도 JustRL 배정 비중이 커질수록 science·code·instruction-following 지표가 함께 낮아지는 capability seesaw를 보여 준다.[2]
영어 원본 그림이다.[2]
  </figcaption>
</figure>

이 **seesaw effect**는 expert를 더 붙이면 capability가 단순 합산된다는 가정을 반박한다.[2]
다른 teacher가 특정 domain에서 약하다면, 그 teacher의 prompt 비중 증가는 routing label과 무관하게 student의 해당 capability를 끌어내릴 수 있다.[2]
또 training time에는 한 teacher 쪽 curve를 따라가다가 later step에 다른 teacher 쪽으로 drift하는 tug-of-war 현상과, teacher를 순서대로 적용했을 때 성능이 다시 되돌아가는 cascaded OPD 결과도 보고됐다.[2]

## 공개된 근거에서 확인되는 점

논문은 대부분 설정이 100–200 step 안에 수렴하도록 최대 200 step, prompt batch 128, prompt당 student rollout 4개를 사용했다.[2]
따라서 run 하나의 최대 budget은 25.6K prompt instance이며, 모델 group에 따라 최대 sequence length는 40K, 64K, 96K로 다르다.[2]
평가도 benchmark에 따라 Avg@1, Avg@4, Avg@5, Avg@10, Avg@16처럼 독립 sample 수가 달라 단일한 pass@1 score처럼 비교하면 안 된다.[2]

| 질문 | 논문이 테스트한 축 | 보고한 핵심 관찰 |
|---|---|---|
| 문제 난이도가 중요한가 | teacher/student pass-rate, easy·hard·random | teacher가 못 푼 prompt도 OPD gain에 기여할 수 있으며, 이미 student가 푼 prompt만 제외하는 전략이 소폭 유리 |
| 같은 domain 밖에서도 남는가 | English→Chinese, short→long horizon | same-origin에서 전이가 더 안정적이고 teacher 수준에 가까워지는 경향 |
| 다른 domain으로도 옮겨지는가 | math, code, science, instruction following | same-origin은 training prompt domain을 넘어 capability가 이동, cross-origin은 target-domain data가 더 중요 |
| 여러 teacher를 섞으면 합쳐지는가 | JustRL/Nemotron mixture ratio | teacher 비중에 따라 여러 domain capability가 반대 방향으로 움직이는 seesaw |

이 표는 paper의 RQ1–RQ3를 재구성한 것이다.[2]
특히 multi-teacher 결과는 general-purpose mixture rule을 확정하는 실험이 아니라, 두 complementary teacher와 지정된 prompt·benchmark protocol에서 **routing만으로 interference를 막지 못한 반례**로 해석해야 한다.[2]

## 실무 관점에서의 해석

이 연구가 주는 가장 실용적인 메시지는 OPD dataset을 “teacher가 정답을 낸 prompt 모음”으로 다루지 말라는 데 있다.[2]
data difficulty, teacher quality, task label보다 먼저 확인할 것은 student rollout 위에서 teacher가 실제로 제공하는 policy signal과, 그것이 student의 base distribution에서 얼마나 자연스럽게 해석되는가다.[2]
작은 held-out probe라도 same-origin/cross-origin, in-domain/cross-domain을 나누어 측정하는 편이 더 안전하다.[2]

multi-teacher 설계도 router accuracy 하나로 끝낼 수 없다.[2]
아래처럼 teacher별 evaluation vector와 mixture sweep을 release gate로 두는 편이 낫다.[2]

```text
teacher별 in-domain + off-domain capability 측정
  → student와 teacher의 policy compatibility probe
  → 단일-teacher OPD transfer 확인
  → mixture ratio sweep + held-out regression matrix
  → capability trade-off를 명시적으로 승인하거나 fallback 적용
```

이 절차는 논문 결과를 일반 법칙으로 과장하지 않기 위한 최소 장치다.[2]
논문은 open reasoning model 계보, 정해진 수학·code·science·instruction-following benchmark, 특정 teacher–student pair와 training budget을 다뤘다.[2]
production agent의 tool-use, safety policy, long-running environment에 같은 seesaw가 동일한 형태로 나타난다는 직접 증거는 아직 없다.[1][2]

그럼에도 질문 자체는 넓게 남는다.[2]
OPD가 한 domain의 답을 옮기는 방식이 아니라 teacher policy의 넓은 성향을 옮긴다면, multi-teacher post-training의 본질은 router 문제가 아니라 **서로 간섭하는 policy field를 어떻게 측정하고 조정할 것인가**가 된다.[2]
이 논문은 교사를 더 많이 붙이는 일보다, 각 teacher의 off-domain pull과 mixture-dependent regression을 먼저 측정해야 한다는 근거를 제공한다.[2]

## Sources

[1] https://arxiv.org/abs/2608.16647 — arXiv abstract: 2608.16647
[2] https://arxiv.org/html/2608.16647 — arXiv HTML: 2608.16647
