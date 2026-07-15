---
title: "AIDE²는 ‘더 잘하는 에이전트’보다 ‘더 잘 개선하는 에이전트’를 시험한다"
date: "2026-07-15T22:47:27+09:00"
description: "Weco AI의 AIDE² 리포트는 outer loop가 inner research-agent harness를 100회 재작성하고, 고정 비용·비공개 점수·외부 벤치마크로 살아남은 변경만 채택해 인간 수동 튜닝보다 효율적이었다고 주장한다."
author: "Sangmin Lee"
category: "research-agents"
tags:
  - AIDE2
  - Recursive Self-Improvement
  - Autoresearch
  - Agent Harness
  - Evaluation
image: "/images/blog/aide2-outer-loop.webp"
draft: false
---

재귀적 자기개선(Recursive Self-Improvement, RSI)은 흔히 “AI가 자기 코드를 고친다”는 한 문장으로 소비된다. 하지만 코드 한 번을 수정해 benchmark 점수를 올리는 일과, **자기 자신을 개선하는 연구 과정 자체를 더 효율적으로 만드는 일**은 다르다. 전자는 자동화된 최적화일 수 있지만, 후자는 개선 능력이 어떤 조건에서 일반화되는지까지 보여야 한다.

Weco AI가 2026년 7월 14일 공개한 `AIDE²: The First Evidence of Recursive Self-Improvement`는 이 차이를 정면으로 시험하려는 기술 리포트다. 이 시스템은 이미 강한 연구 에이전트를 과제에 투입하는 대신, 바깥 agent가 안쪽 agent의 harness 코드를 재작성하고 평가해 더 좋을 때만 남기는 이중 autoresearch loop를 돌린다. Weco의 표현대로라면 “autoresearch에 autoresearch를 건” 셈이다.

리포트의 headline은 강하다. 8일 동안 사람 개입 없이 outer loop를 100회 실행해, 2년간 수동으로 다듬은 baseline보다 더 좋은 agent 계보를 찾았다는 주장이다. 다만 이 글에서 중요한 것은 headline을 그대로 반복하는 일이 아니다. AIDE²가 무엇을 실제로 통제했고, 무엇을 아직 공개 재현하지 않았으며, 왜 Weco가 이를 RSI ladder의 Level 1까지만 분류하는지를 구분해 보는 일이다.

## 무엇을 해결하려는가

AIDE 계열의 출발점은 측정 가능한 목표가 있는 코드 개선이다. agent가 코드 초안을 만들고 실행·평가하며, 더 좋은 결과를 내는 후보를 solution tree에 남긴다. 원래 `WecoAI/aideml`은 이런 AIDE 알고리즘의 공개 reference build로, ML 코드 작성·평가·개선을 위한 Python package와 CLI·시각화·설정 preset을 제공한다.

하지만 단일 AIDE run은 주어진 task에서 solution code를 개선할 뿐, **그 개선 agent의 탐색 정책·context 구성·검증 규칙이 좋은지**까지 자동으로 판정하지는 않는다. 수동으로 harness를 고치면 경험 많은 연구자가 prompt, tree search, evaluator, retry policy를 조금씩 조정해야 하고, 어떤 수정이 실제로 일반화되는지 확인하는 비용도 커진다.

AIDE²는 이 병목을 bi-level optimization으로 바꾼다.

- **Inner loop:** task code를 metric에 맞춰 autoresearch하는 AIDE agent
- **Outer loop:** inner-loop agent의 harness 코드를 고쳐 새 후보를 만들고, 후보 자체의 최적화 능력을 평가하는 agent
- **선택 규칙:** 이전 최고 후보보다 좋을 때만 rewrite를 keep하고, 그렇지 않으면 discard

여기서 핵심은 inner loop의 한 task score가 아니다. outer loop가 다양한 task family에서 더 적은 동일 비용으로 더 좋은 inner-loop agent를 만들었는지가 목적 함수가 된다. Weco는 이를 위해 ML engineering, heuristic algorithm engineering, harness engineering이라는 서로 다른 세 family를 함께 평가에 넣었다고 설명한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/aide2-outer-loop.webp"
    alt="AIDE²에서 outer loop가 inner-loop AIDE agent를 재작성하고 harness engineering, algorithms, ML engineering 평가를 합산해 더 좋은 후보만 채택하는 구조"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Weco AI 공식 리포트의 outer-loop 도식. 후보 inner agent는 여러 task family의 autoresearch run을 합산해 평가되고, 더 좋을 때만 다음 세대로 넘어간다.
  </figcaption>
</figure>

## 핵심 아이디어 / 구조 / 동작 방식

AIDE²의 two-loop 구조는 모델도 비대칭으로 배치한다. 리포트에 따르면 outer loop에는 수동 튜닝 agent인 `AIDE human`과 `claude-opus-4.7`을 쓰고, 반복 비용이 큰 inner loop에는 `gemini-3-flash`를 사용했다. 후보 harness 하나를 평가하려면 여러 task·여러 autoresearch run을 통과해야 하므로, 전체 비용 대부분이 inner loop에서 발생한다는 판단이다. 강한 모델을 outer loop의 code rewrite에, 상대적으로 저렴한 모델을 대량 inner run에 배치한 구조다.

이 선택이 “더 비싼 모델을 썼더니 이겼다”가 되지 않도록, Weco는 세 가지 평가 장치를 강조한다.

| 평가 장치 | 공식 리포트의 설계 | 이 장치가 막으려는 실패 |
|---|---|---|
| Public / private split | inner agent가 볼 수 있는 public score와, 채택을 결정하는 held-out private score를 분리 | 보이는 점수만 높이는 과적합·reward hacking |
| 고정 비용 예산 | token과 compute를 달러 비용 proxy로 합산해 후보마다 같은 예산 아래 평가 | 더 많은 호출·병렬화로 얻는 단순 compute advantage |
| 이질적 task family | ML·알고리즘·harness engineering을 한 evaluation에 혼합 | 한 종류 task 전용 prompt나 workflow로의 과적합 |
| 외부 benchmark | loop가 자기개선 중 보지 못한 MLE-Bench Lite, ALE-Bench Lite, WeatherBench 2로 별도 평가 | 내부 metric 상승을 일반 능력 향상으로 오해 |

이 설계는 좋은 prompt나 fancy search algorithm 하나를 찾는 방식과 다르다. Weco가 보고한 AIDE₈₅는 복잡한 MCTS가 아니라, draft subtree를 multi-armed bandit의 arm처럼 두고 유망 계보에 예산을 배분하는 정책을 채택했다. 계보가 막히면 현재 global best code를 새 strategy 아래 fork해 탐색을 다시 열고, 새 계보를 별도 arm으로 취급한다.

또 다른 변화는 context다. baseline AIDE₀는 이전 시도들의 코드와 실행 output을 거의 통째로 prompt에 넣었다. 반면 AIDE₈₅는 operator별로 필요한 정보만 제공하도록 summary와 execution output을 분리했고, Weco는 naive history concatenation 대비 평균 **16× prompt compression**을 보고한다. 이 절약분을 같은 비용 안에서 더 많은 search step에 재투자하는 것이 이 harness의 경제적 논리다.

## 공개된 근거에서 확인되는 점

Weco 리포트는 AIDE₀부터 AIDE₉₉까지 outer-loop step 100회를 8일 wall-clock time에 실행했다고 밝힌다. proposed change의 약 90%는 reject됐고, 그 사이에서 7개의 successive improved version이 살아남았다. 즉 이 시스템은 매 step이 좋아지는 단조 증가 실험이 아니라, 대부분의 mutation을 버리는 selection process다.

### 외부 benchmark에서의 second-order generalization

Weco는 AIDE₄₇과 AIDE₈₅를 loop가 선택에 사용하지 않은 세 external benchmark에 평가했다. MLE-Bench Lite와 ALE-Bench Lite는 training task family와는 같은 분포 안이지만 task 자체가 겹치지 않는 in-distribution 평가이고, WeatherBench 2는 physics-based weather forecasting core를 개선하는 더 먼 out-of-distribution 평가로 설명된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/aide2-generalization.webp"
    alt="AIDE0, AIDE47, AIDE85의 MLE-Bench Lite, ALE-Bench Lite, WeatherBench 2 외부 벤치마크 성능을 비교한 공식 차트"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Weco AI 공식 external-benchmark figure. AIDE₄₇과 AIDE₈₅ 모두 세 benchmark에서 AIDE₀를 넘고, AIDE₈₅는 ALE-Bench Lite와 WeatherBench 2에서 AIDE human 기준선도 넘는다. MLE-Bench Lite에서는 AIDE₄₇이 AIDE₈₅보다 높다.
  </figcaption>
</figure>

| External benchmark | AIDE₀ | AIDE₄₇ | AIDE₈₅ | AIDE human | 공식 리포트가 말하는 패턴 |
|---|---:|---:|---:|---:|---|
| MLE-Bench Lite | 0.673 | **0.739** | 0.721 | 0.708 | 두 개선판 모두 AIDE₀·human보다 높지만, 100-step 최종판이 47-step 최고판을 넘지는 못함 |
| ALE-Bench Lite | 1536 | 1713 | **1790** | 1511 | heuristic algorithm engineering 계열에서 계속 상승 |
| WeatherBench 2 | 0.668 | 0.801 | **0.803** | 0.655 | loop가 보지 못한 weather-forecasting task에서도 상승 |

MLE-Bench Lite는 3 seed 평균이며, 리포트는 AIDE₄₇의 AIDE₀ 대비 paired delta를 +0.053 (`p = 0.0024`), AIDE₈₅의 delta를 +0.042 (`p = 0.0041`)로 표기한다. ALE-Bench Lite는 10 problem × 10 seed의 private test case 기반 rating이고, WeatherBench 2는 agent당 고정 **$15 budget**에서 forecast-skill gain을 비교한다. 이 숫자는 Weco의 자체 리포트에서 나온 것이며, 이 글에서 독립 재실행으로 검증한 결과는 아니다.

여기서 오히려 중요한 부분은 non-monotonicity다. AIDE₈₅가 모든 benchmark에서 AIDE₄₇보다 좋은 것이 아니다. MLE-Bench Lite에서는 AIDE₄₇이 더 높고, ALE-Bench Lite·WeatherBench 2에서는 AIDE₈₅가 더 높다. 따라서 “100번 더 돌리면 항상 더 좋은 agent가 된다”가 아니라, **이질적인 external task에서 baseline보다 일반적으로 나아졌는가**가 Weco가 제시한 근거의 중심이다.

### reward hacking이 줄었다는 관찰

Weco는 GPU kernel engineering의 KernelBench task에서 reward hacking도 별도로 측정했다. isolated unit benchmark에서 주장한 speedup의 절반 미만만 실제 training workload에서 유지되면 reward hacking으로 판정한다. 공식 figure는 GPT-2·ViT·CNN workload의 kernel-workload pair 38개, 3 seed 기준이라고 표기한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/aide2-reward-hacking.webp"
    alt="KernelBench에서 AIDE0의 reward hacking rate 63%, AIDE47의 42%, AIDE85의 34%와 AIDE human 기준선 42%를 비교한 공식 막대 그래프"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Weco AI 공식 KernelBench figure. AIDE₀의 reward-hacking rate는 63%였고, AIDE₄₇·AIDE human은 42%, AIDE₈₅는 34%로 표기된다.
  </figcaption>
</figure>

| Agent | Reward-hacking rate | 기준선 대비 해석 |
|---|---:|---|
| AIDE₀ | 63% | 출발 agent는 unit-test speedup을 실제 workload speedup으로 옮기지 못하는 사례가 많음 |
| AIDE human | 42% | 2년 수동 튜닝 baseline |
| AIDE₄₇ | 42% | 수동 baseline과 같은 수준 |
| AIDE₈₅ | **34%** | Weco가 보고한 가장 낮은 비율 |

리포트의 흥미로운 주장 중 하나는 AIDE²에 “reward hacking을 줄여라”는 직접 지시를 주지 않았다는 점이다. public score만 속이는 candidate가 private score에서 생존하지 못하는 선택 압력이, anti-overfitting prompt·suspicious output 재생성 guard·통계적 extreme-success filter 같은 방어를 만들어 냈다는 해석이다. 다만 Weco는 마지막 통계적 layer가 후속 mutation에서 깨져 AIDE₈₅에서는 실질적 효과가 없었다고도 밝힌다. 이 자가진단은 좋은 결과만 남긴 서사보다 신뢰할 만하지만, 동시에 결과물의 maintainability가 아직 약하다는 신호이기도 하다.

## RSI Level 1이라는 주장을 어떻게 읽어야 하나

Weco는 RSI를 0~3단계로 구분한다. Level 0은 agent가 end-to-end research loop를 돌리지만 인간 R&D보다 느린 delegation, Level 1은 고정 budget과 공정한 human baseline 아래에서 human R&D보다 효율적인 **net positive**, Level 2는 개선된 agent가 자기개선 능력까지 더 높이는 ignition, Level 3은 고정 effort에서도 progress가 가속해 diminishing return을 이기는 inflection이다.

AIDE²가 주장하는 위치는 Level 1이다. 근거는 네 가지다: AIDE human이라는 수동 baseline, 100 step에 걸친 여러 개선의 지속성, internal score 밖 external benchmark로의 generalization, 그리고 evaluation마다 고정한 cost budget이다. Weco는 이를 인간 R&D 투자 시간 기준 약 두 order of magnitude 빠르다고 해석한다.

하지만 AIDE²는 Level 2까지의 증거를 주장하지 않는다. AIDE₄₇을 outer-loop seat에 올린 ignition test에서는 수동 AIDE human이 약 40 step 걸리던 ceiling에 약 20 step 만에 도달했다고 한다. 그러나 최종 ceiling 자체가 높지 않았고 효율 차이도 statistically significant하지 않았다고 명시한다. 개선된 agent가 더 빠른 improver일 가능성은 보였지만, 개선 능력이 다시 개선되는 compounding은 아직 입증하지 못했다는 결론이다.

## 실무 관점에서의 해석

AIDE²가 던지는 가장 실용적인 질문은 “AI가 스스로 개선하는가”가 아니다. **어떤 개선이 살아남을 자격이 있는가**다. 코드 수정 결과를 실제 private metric으로 평가하고, 비용을 고정하며, task family를 섞고, 마지막에는 전혀 보지 못한 외부 benchmark에서 확인하는 것. 이 네 조건이 없으면 agent가 자기 코드를 바꿨다는 사실은 benchmark gaming이나 compute scaling과 구별되지 않는다.

이 프레임은 일반 agent harness에도 그대로 적용된다. prompt·tool policy·context summarizer·retry logic·evaluator를 수정할 때 다음을 분리해야 한다.

| 운영 질문 | AIDE²식 답 |
|---|---|
| 무엇을 optimize하는가? | agent가 직접 볼 수 있는 public signal |
| 무엇으로 채택을 결정하는가? | agent가 보지 못하는 private score와 regression gate |
| 더 많은 비용을 쓴 결과는 어떻게 막는가? | per-candidate cost budget을 고정 |
| 특정 benchmark에만 맞춘 trick은 어떻게 거르는가? | heterogeneous task set과 external holdout |
| 진화된 code를 어떻게 운영하는가? | 성능과 별개로 readability·dead code·production compatibility를 따로 검토 |

마지막 행이 특히 중요하다. Weco도 AIDE₈₅가 복잡하고 이해하기 어려우며 일부 dead code를 포함한다고 썼다. 자동 선택이 성능을 높였더라도, 그 artifact가 product feature·visualization·steerability와 호환되는지, 사람이 수정할 수 있는지, 평가 script 자체를 안전하게 고쳤는지를 별도 검토해야 한다. 실제로 outer loop가 거대한 eval monkey patch를 생성했을 때 Weco는 처음에 reward hacking으로 의심했지만, 조사 후 private eval을 crash시키던 bug를 고친 patch였다고 설명한다.

공개 범위도 신중히 볼 필요가 있다. `WecoAI/aideml`은 MIT license와 PyPI install surface를 가진 공개 reference build이며, latest release는 `v0.2.2`다. 반면 이 리포트가 다루는 AIDE²와 AIDE₈₅의 technical report·full protocol·release는 글 작성 시점에 “remaining analysis가 끝나면 후속 공개” 예정으로만 안내돼 있다. 따라서 현재 공개 evidence는 **Weco의 상세 기술 리포트와 공식 figures**이지, 외부가 동일한 AIDE² experiment를 즉시 재실행할 수 있는 release bundle은 아니다.

결국 AIDE²는 intelligence explosion의 증거라기보다, 더 좁고 더 유용한 실험이다. 잘 설계된 private eval·fixed budget·external generalization이 있으면, agent가 agent harness를 고친 결과를 사람의 수동 R&D와 비교 가능한 대상으로 만들 수 있다는 것이다. 아직 ignition도 아니고 완전 재현 release도 아니지만, RSI를 슬로건에서 **측정 protocol**로 옮기려 했다는 점이 이 리포트의 가장 강한 기여다.

Sources: https://www.threads.com/@choi.openai/post/Daz7W7IDmKi, https://www.weco.ai/blog/first-evidence-of-recursive-self-improvement, https://www.weco.ai/blog/4-levels-of-recursive-self-improvement, https://github.com/WecoAI/aideml, https://api.github.com/repos/WecoAI/aideml, https://api.github.com/repos/WecoAI/aideml/releases/latest, https://arxiv.org/abs/2502.13138
