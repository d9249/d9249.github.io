---
title: "Experience Distillation은 agent의 시행착오를 context에서 가중치로 옮긴다"
date: "2026-07-27T02:32:17+09:00"
description: "Experience Distillation(EPD)은 agent가 실제 환경에서 모은 긴 시행착오 기록을 경험 context로 읽는 교사의 다음 결정으로 바꾼 뒤, 새 환경 상호작용이나 world model rollout 없이 학생 모델 가중치에 distill하는 sample-efficient 학습 방법이다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Experience Distillation
  - Agent Learning
  - Context Distillation
  - Sample Efficiency
  - Reinforcement Learning
  - Software Engineering
draft: false
---

agent가 실제 환경에서 배우게 하려면 대가가 크다. 코드 수정 agent라면 repository를 열고, 명령을 실행하고, 테스트를 돌리고, 실패를 해석하며 다시 시도해야 한다. 실험실·법률 검토·human feedback처럼 한 번의 환경 상호작용 자체가 비싼 장면에서는 RL의 대량 rollout이 곧바로 학습 비용의 병목이 된다.

`Sample-Efficient Learning from Agent Experience`는 이 병목을 **Experience Distillation(EPD)**이라는 문제로 정식화한다. 핵심 관찰은 간단하다. agent가 이미 모은 시행착오 기록을 context에 넣으면 다음 시도가 좋아질 수 있지만, context를 빼면 그 이득도 사라진다. 반대로 그 기록을 그대로 SFT하면, 성공을 낳은 *경험을 읽고 판단하는 과정*이 아니라 과거 행동 문자열만 모방하기 쉽다.

저자들의 해법은 경험을 읽은 교사 model이 **이미 기록된 과거 상태에서 다음 결정 하나만** 다시 생성하게 하고, 그 결정을 경험 context가 없는 학생에게 학습시키는 것이다. 미래 관측을 합성하지 않으므로 추가 환경 실행도, 긴 world model rollout도 필요하지 않다. 논문 보고치에서는 749개 curated software-engineering task에서 ICL이 만든 이득의 **64.8%**를 가중치에 남겼고, 같은 경험을 직접 SFT한 경우는 **3.8%**에 그쳤다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/experience-distillation-process.svg">
    <img
      src="/images/blog/experience-distillation-process.svg"
      alt="실제 환경에서 수집한 반복 시도 기록이 경험 context를 읽는 교사의 한 단계 결정 생성으로 이어지고, 그 결정이 경험 context 없이 동작하는 학생 모델의 가중치에 학습되는 Experience Distillation 과정"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Section 3을 바탕으로 재구성한 process map. 교사는 기록된 history에서 다음 결정만 생성하므로 새 환경 관측이나 world model rollout을 만들지 않는다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

이 논문이 겨냥하는 것은 offline RL 일반이 아니라, **한 task를 실제로 여러 번 시도하며 얻은 긴 agent experience를 어떻게 재사용할 것인가**다. 저자들의 curated SWE setting에서 하나의 경험 기록은 평균 60.5 interaction turn, 82.4k token이며, 749개 task를 합치면 61.7M token이다. TaleSuite text-adventure도 task별로 여러 trial을 누적한 뒤 그 기록을 다음 trial의 context로 제공한다.

여기서 ICL은 environment sample 측면에서 효율적이다. 같은 task를 다시 풀 때 과거 실패와 feedback을 읽으면 model parameter를 바꾸지 않고도 더 나은 결정을 할 수 있다. 문제는 inference 때마다 긴 기록을 실어 나르고, 기록을 빼는 순간 성능 향상이 사라진다는 데 있다.

직접 SFT는 언뜻 자연스러운 baseline이지만, 논문은 이것이 충분하지 않다고 본다. 기록 속 행동은 당시의 불완전한 관측과 탐색 중 나온 행동이다. 필요한 target은 “과거 기록을 읽고 더 잘 판단한 교사”의 행동이지, 기록에 남은 과거 행동 자체가 아니다. EPD는 이 차이를 privileged context를 가진 교사와 context 없는 학생의 distillation으로 바꾼다.

| 접근 | 학습 시 보는 정보 | 추가 환경 상호작용 | 배포 시 경험 context | 논문이 겨냥한 한계 |
|---|---|---:|---:|---|
| In-context learning | 과거 시행착오 전체 | 경험 수집만 필요 | 필요 | context를 빼면 이득이 사라짐 |
| 직접 SFT | 기록된 과거 행동 | 없음 | 불필요 | 행동 log만 모방해 경험 기반 판단을 충분히 옮기지 못할 수 있음 |
| 긴 model-based rollout | 경험 + 합성 미래 관측 | 없음 | 불필요 | world model 오차가 긴 rollout에 누적될 수 있음 |
| **Experience Distillation** | 경험을 읽은 교사의 다음 결정 | **없음** | **불필요** | 기록된 history까지만 supervision을 만든다는 절충 |

## 핵심 구조: 경험을 읽은 교사의 다음 결정만 남긴다

이상적인 context distillation은 경험 `τexp`를 읽는 교사의 **미래 trajectory 전체**를, 경험이 없는 학생이 재현하도록 만드는 일이다. 하지만 그 trajectory를 실제 환경에서 다시 rollout하면 “distillation 단계에서 환경 sample을 더 쓰지 않는다”는 목표가 무너진다.

논문은 recorded history `hᵗexp`를 분기점으로 삼는다. 교사는 그 history와 전처리된 전체 경험을 함께 받고 한 번의 다음 결정 `a′t`만 생성한다. 그 뒤의 environment observation은 만들지 않는다. 즉 branch length를 `k=1`로 두면 teacher decision 뒤에 world model이 예측해야 할 미래가 없어진다.

학생의 loss에는 teacher가 만든 결정만 들어가며, 기존 history와 그 안의 observation·action은 context 역할만 한다. 이 design은 “실제 과거 상태에서는 교사가 무엇을 했어야 했는가?”라는 teacher-sampled forward KL 문제를 token-level next-token prediction으로 바꾼 것이다. 논문 기본 구현은 full teacher logit을 저장하는 대신 sampled teacher token을 사용한다.

### branch packing은 긴 history의 중복 비용을 줄인다

상태마다 `(history, teacher decision)` 예제를 따로 만들면, 거의 같은 긴 prefix를 반복해 처리하면서 정작 loss는 짧은 decision에만 걸린다. EPD는 같은 trajectory의 연속된 분기점을 하나의 packed sequence에 넣는다. 매 분기점에서 teacher decision을 넣고, 이어서 원래 기록에 있던 action·observation을 context로 붙여 다음 분기점으로 진행한다.

중요한 주의점은 이 sequence가 teacher가 environment를 다시 실행한 결과가 아니라는 점이다. 교사 결정 뒤에 붙는 observation은 그 교사 결정의 결과가 아니라 **기록된 원래 action의 결과**다. 저자들도 이를 exact objective가 아닌 practical approximation으로 분류한다. 대신 원래 history support를 벗어나지 않고 supervision density를 높일 수 있다.

논문이 보고한 TaleSuite ablation에서 separate branch example 4,096개는 packed sequence 128개로 줄었고, training step은 768에서 64로 감소했다. total time은 branch packing을 1.0으로 두면 separate example 방식이 `>10.0`이었으며, 평균 normalized score는 43.1에서 43.8로 유지됐다.

| branch 구성 | 생성 단위 | training step | 총 시간(정규화) | 평균 normalized score / ICL gain retained |
|---|---:|---:|---:|---:|
| Separate branch examples | 4,096 examples | 768 | >10.0 | 43.1 / 84.2% |
| **Branch-packed sequences** | **128 sequences** | **64** | **1.0** | **43.8 / 90.1%** |

## 공개된 근거에서 확인되는 점

### ICL의 이득을 얼마나 가중치에 남겼는가

아래 수치는 저자들이 보고한 multi-task joint-training 결과다. `GICL`은 zeroshot을 0%, experience를 context에 넣은 ICL reference를 100%로 놓고, 경험을 제거한 뒤에도 얼마나 그 이득을 유지했는지 나타낸다. 따라서 서로 다른 model이나 public leaderboard와 직접 섞어 ranking하면 안 된다.

| 방법 | 749 curated SWE: 평균 pass@1 | SWE `GICL` | TaleSuite 6개: 평균 normalized score | TaleSuite `GICL` |
|---|---:|---:|---:|---:|
| ICL reference | 76.4% | 100.0% | 45.6 | 100.0% |
| Zeroshot | 5.3% | 0.0% | 18.5 | 0.0% |
| 직접 SFT | 8.0% | 3.8% | 17.8 | -2.6% |
| **Experience Distillation** | **51.4%** | **64.8%** | **43.8** | **93.4%** |

SWE에서는 EPD가 ICL reference를 완전히 복제하지는 못한다. 하지만 context를 제거한 상태에서 pass@1 51.4%를 보고했고, SFT의 8.0%와 큰 차이가 난다. TaleSuite에서는 normalized score 43.8로 ICL 45.6에 더 가깝다. 이 결과가 보여 주는 것은 “긴 경험 log를 학습 데이터로 쓰면 된다”가 아니라, **그 log로 강화된 teacher behavior를 target으로 다시 만들어야 한다**는 점이다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/experience-distillation-sample-efficiency.webp">
    <img
      src="/images/blog/experience-distillation-sample-efficiency.webp"
      alt="749개 software-engineering task와 6개 TaleSuite task에서 ICL과 Experience Distillation이 PPO 또는 GRPO보다 각각 9.6배와 57.2배 적은 평균 환경 sample로 더 높은 보고 성능에 도달했음을 보여 주는 공식 비교 차트"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1의 공식 chart를 고해상도로 변환했다. 점은 각 방법의 best observed performance와 논문이 해당 run 전체에 부과한 environment-sample budget의 짝이며, 실험 간 절대 leaderboard 비교가 아니다.
  </figcaption>
</figure>

### sample efficiency의 비교는 “환경 호출”과 “teacher compute”를 분리해 읽어야 한다

Figure 1에서 ICL + EPD는 SWE에서 평균 pass@1 51.4%를 기록하며 PPO 17.7% 대비 **9.6× fewer environment samples**, TaleSuite에서는 normalized score 43.8로 GRPO 29.9 대비 **57.2× fewer samples**를 보고한다. 논문의 sample 단위는 token이나 gradient step이 아니라 complete agent trial/rollout이다.

다만 이 결과를 “EPD가 공짜”라고 읽으면 안 된다. 경험을 모으는 비용은 여전히 있고, teacher가 branch-packed training data를 생성하는 GPU inference 비용도 있다. 저자들이 749개 SWE에서 branch-packed sequence 수를 trial당 1개에서 16개로 늘리자 `GICL`은 31.8%에서 64.8%로 높아졌지만, teacher-generated token은 61.7M-token experience corpus의 0.17×에서 2.79×로 늘었다. EPD가 줄이는 것은 주로 **비싸거나 느린 environment interaction**이지, training compute 전체가 아니다.

### 짧은 branch가 긴 synthetic rollout보다 나았다는 ablation

저자들의 five-task TaleSuite 실험에서는 model-free 1-step branch rollout의 평균 task-level `GICL`이 83.8%였고, world model observation을 하나 포함한 model-based branch rollout은 57.3%였다. `Detective` task에서는 full rollout 19.2%, branch rollout 68.1%, model-free 1-step 86.7%가 보고됐다.

논문의 해석은 조심스럽지만 설득력 있는 failure mode를 제시한다. 합성 environment observation이 실제 dynamics와 어긋나거나 policy output이 observation 속으로 섞이면, 다음 teacher decision은 이미 off-distribution prefix에 조건화된다. EPD의 `k=1` 선택은 더 정교한 world model을 만드는 대신, error가 누적될 미래를 **애초에 target 생성에서 제거**하는 방법이다.

### OOD와 반복 cycle은 유망하지만, 아직 연구 결과다

749개 SWE 경험으로 학습한 model은 경험 수집·distillation에서 제외한 494개 OOD SWE task에서 pass@1이 4.62%에서 8.84%, pass@5가 20.39%에서 26.13%으로 올랐다고 보고한다. six-task TaleSuite continual setting에서는 매 cycle마다 task당 네 번의 trial을 새로 모아 distill했을 때, 평균 normalized score가 cycle 0의 7.1에서 다섯 cycle 뒤 47.0까지 증가했다.

이는 task-specific memory를 단순 암기하는 데 그치지 않고 일부 behavior가 transfer·accumulate할 가능성을 시사한다. 다만 OOD의 절대 pass@1도 8.84%이며, task suite·in-house base model·collection protocol에 의존한 결과다. 범용 coding agent나 실제 운영 workflow로 그대로 일반화할 근거는 아직 부족하다.

## 공개 범위와 재현성: 방법은 자세하지만 release는 확인되지 않는다

arXiv v1의 abstract page와 source bundle에는 공식 code/project link가 제시되지 않는다. source에는 논문 LaTex와 figure asset은 포함돼 있지만 training code, model checkpoint, curated SWE experience corpus, 실행 script는 들어 있지 않다. 따라서 이 글의 수치와 method 설명은 논문 자체에서 검증했지만, 제3자가 같은 결과를 재현할 수 있는 public implementation은 현재 확인되지 않았다.

특히 핵심 실험은 “749 curated SWE tasks”와 in-house base model을 사용한다. 경험의 길이·선별 기준·branch packing의 원리는 충분히 설명됐어도, 동일한 task collection과 model checkpoint가 없으면 결과 재현은 별개의 일이다. 실무 팀이 채택을 검토한다면 논문의 headline score보다 먼저 다음을 작은 내부 benchmark에서 검증하는 편이 낫다.

1. **environment cost를 정확히 계량한다.** 실제 agent trial 하나가 GPU inference보다 얼마나 비싼지, human review나 flaky test가 병목인지 구분한다.
2. **experience의 품질을 점검한다.** 반복 탐색의 잡음·우연한 성공·민감 정보가 teacher context에 그대로 들어가면 distillation target도 흔들릴 수 있다.
3. **recorded-state replay를 보장한다.** EPD의 장점은 검증된 history에만 teacher를 세우는 데 있다. 실행 trace·tool output·repository state를 재현 가능하게 남겨야 한다.
4. **context 없는 evaluation을 분리한다.** 경험을 prompt에 넣었을 때의 성능과 가중치에 실제로 남은 성능을 같은 dashboard에서 섞지 않아야 한다.

## 실무 관점에서의 해석

Experience Distillation은 agent memory를 vector store에 오래 보관하는 방법과 경쟁하기보다, 그와 다른 층을 다룬다. memory/RAG는 과거의 구체적인 사실과 trace를 필요할 때 다시 꺼내 쓴다. EPD는 반복된 경험에서 얻은 **행동 경향과 판단 방식**을 model weight에 압축하려 한다. 특정 incident의 상세 증거는 retrieval에 남기고, 자주 반복되는 diagnosis·tool usage·repair pattern은 distillation 후보로 보는 조합이 자연스럽다.

이 논문의 더 큰 메시지는 agent training에서 environment sample과 teacher token을 같은 비용으로 취급하지 말라는 데 있다. environment가 비싸고 기록된 history가 신뢰할 수 있는 조직이라면, 한 번 모은 experience에서 teacher supervision을 더 뽑아내는 것이 RL rollout을 더 늘리는 것보다 현실적일 수 있다. 반대로 environment가 싸거나 기록의 상태 재현이 어렵다면 EPD의 장점은 약해진다.

결국 EPD는 “agent가 모든 일을 weight에 암기하게 하자”는 제안이 아니다. **실제 환경에서 이미 지불한 시행착오를, 이후에도 context window에 계속 싣지 않고 재사용하는 방법**에 가깝다. public code와 benchmark artifact가 공개돼야 재현성 평가는 한 단계 더 나아가겠지만, expensive environment에서 agent learning을 설계하는 팀이라면 `collect → experience-conditioned teacher → recorded-state one-step target → context-free student`이라는 분해 자체는 즉시 검토할 만하다.

Sources: https://arxiv.org/abs/2607.21051, https://arxiv.org/pdf/2607.21051, https://arxiv.org/e-print/2607.21051
