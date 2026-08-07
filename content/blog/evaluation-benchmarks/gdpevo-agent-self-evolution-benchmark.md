---
title: "GDPevo는 agent self-evolution을 ‘경험에서 실제로 배웠는가’로 평가한다"
date: "2026-08-07T23:53:00+09:00"
description: "GDPevo는 기업 업무의 숨은 business rule을 train task에 분산하고 held-out test에서 재조합하는 rule hybridization으로, agent의 persistent skill이 경험에서 일반화됐는지를 측정하는 240-task benchmark다."
author: "Sangmin Lee"
category: "evaluation-benchmarks"
tags:
  - GDPevo
  - Agent Self-Evolution
  - Agent Evaluation
  - Benchmark
  - Enterprise Workflows
draft: false
---

agent가 과거 task에서 얻은 경험을 다음 task에 남겨 두고 더 잘 푼다면, 우리는 이를 self-evolution이라고 부른다. 문제는 “지난번보다 점수가 높아졌다”는 결과만으로 agent가 경험에서 **일반화 가능한 규칙을 배웠는지** 말하기 어렵다는 데 있다. train과 test가 너무 비슷하면 memorization일 수 있고, 반대로 전혀 무관하면 persistent state가 좋아졌는지 측정할 수 없다.

`GDPevo: Evaluating Agent Self-Evolution on Real Business Tasks`는 이 인과관계를 benchmark 설계 안으로 끌어들인다.[1] CRM, ERP, finance, healthcare, legal, data-centric workflow에 있는 enterprise rule을 원자 단위로 나누고, train task에는 일부만 흩뿌린 뒤 held-out test에서 새로운 조합으로 다시 묻는다. 따라서 test의 이득은 단순히 같은 문제를 다시 본 효과가 아니라, 앞선 경험에서 rule을 추출해 persistent skill로 남겼는지에 더 직접적으로 연결된다.[2][3]

논문은 self-evolution이 현재 agent에서 의미 있는 성능 향상을 만들 수 있지만, 아직 완성된 능력은 아니라고 결론낸다. four model–harness 조합에서 supervision을 준 evolution은 base보다 최대 **16.44 percentage point** 높은 held-out accuracy를 기록했지만, 가장 높은 evolved score도 fully informed oracle ceiling <strong>91.6%</strong>와는 큰 간격이 남았다.[1][2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/gdpevo-agent-self-evolution-benchmark-pipeline.png">
    <img
      src="/images/blog/gdpevo-agent-self-evolution-benchmark-pipeline.png"
      alt="실제 업무 benchmark에서 seed scenario를 찾고, agent가 business rule과 environment·task를 만들며, calibration과 독립 review를 거쳐 GDPevo task group을 구성하는 과정"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. scenario seed discovery, task-group generation, calibration·review로 이어지는 automated construction pipeline.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

기존 agent benchmark는 경제적으로 중요한 business workflow를 충분히 포괄하지 못하거나, train 경험이 test 성능을 높였을 때 그 원인이 정말 experience reuse인지 분리하기 어려운 경우가 있다. 공개 benchmark가 널리 알려진 뒤 생기는 data contamination도 장기적인 평가를 더 어렵게 만든다.[1][2]

GDPevo의 답은 **rule hybridization**이다. 하나의 enterprise scenario를 여러 개의 independently checkable business rule로 분해한 뒤, 다섯 train task에는 각 rule의 일부를 노출한다. 다섯 held-out test task는 이 rule들을 이전과 다른 방식으로 조합한다. agent가 train answer를 그대로 기억해서는 풀 수 없고, priority·exclusion·expiration처럼 기업 특유의 rule을 추론해 적용해야 한다.[2]

각 task group은 하나의 shared business environment, 5개 training task, 5개 held-out test task로 이루어진다. V1의 CRM·ERP·finance 12개 group과 V2의 healthcare·legal·data-centric 12개 group을 합치면 **240개 task, 24개 group, 6개 domain**이다. 이 benchmark는 deterministic rule-based grader로 채점한다.[2][3]

| 평가 계약 | 설계상 의미 |
|---|---|
| Train–test 관계 | rule을 분산하고 held-out task에서 재조합해 반복 노출과 generalization을 분리한다. |
| Agent의 학습 상태 | skill-based persistent state가 단발 prompt 성능보다 나아졌는지 본다. |
| 채점 | deterministic grader로 그럴듯한 답변이 아니라 업무 rule 준수를 확인한다. |
| 오염 대응 | 자동 pipeline으로 새 task group을 생성해 공개 benchmark 노출 위험을 낮춘다. |

## 핵심 아이디어 / 구조 / 동작 방식

### 네 가지 supervision은 ‘무엇을 보고 진화했는가’를 바꾼다

GDPevo는 진화 여부만 비교하지 않는다. `base`는 evolution 없이 test를 직접 풀고, `self`는 train input과 environment만 본다. `fewshot`은 train question과 gold answer를 demonstration으로 제공하며, `reflect-3`는 train-only judge feedback을 반복해 workflow를 다듬고 skill로 정리한다.[2][3]

이 분리는 중요하다. fewshot의 높은 점수는 agent가 정답이 있는 과거 example에서 절차를 학습할 수 있음을 보여 주지만, 그 skill이 다른 domain으로 잘 옮겨간다는 뜻은 아니다. 논문은 fewshot이 source group에 과적합해 cross-domain transfer에서 손해를 볼 수 있는 반면, feedback 기반 reflect 방식은 더 견고하게 transfer하는 패턴을 보고한다.[2]

또한 논문은 evaluation을 accuracy 하나로 끝내지 않는다. test task당 agent turn, tool-call request, token, USD cost를 같이 기록한다. skill generation은 one-time overhead로 따로 두고, 같은 group의 다섯 held-out test에 재사용할 때의 amortized cost를 계산한다. 진화가 추론 품질을 높이면서 test-time 비용을 줄일 수 있는지까지 보는 구조다.[2][3]

## 공개된 근거에서 확인되는 점

공개 leaderboard에서 Codex + GPT-5.5의 fewshot은 base <strong>49.37%</strong>에서 <strong>64.51%</strong>로, Claude Code + Opus 4.8의 fewshot은 <strong>50.63%</strong>에서 <strong>67.07%</strong>로 올라갔다. 후자의 **+16.44pp**가 논문 abstract가 강조한 최대 held-out lift다.[1][3]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/gdpevo-agent-self-evolution-benchmark-accuracy-cost.png">
    <img
      src="/images/blog/gdpevo-agent-self-evolution-benchmark-accuracy-cost.png"
      alt="네 model-harness 조합에서 base, self, reflect-3, fewshot supervision별 accuracy와 240 task 전체 평가 비용을 비교한 GDPevo 결과"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2. fewshot이 네 조합에서 가장 높은 accuracy를 보이지만, accuracy–cost frontier와 improvement 폭은 model·harness별로 다르다.[2]
  </figcaption>
</figure>

이 결과를 “약한 model일수록 더 많이 진화한다”로 읽으면 안 된다. DeepSeek-V4-Pro-Preview는 base accuracy가 <strong>43.58%</strong>로 가장 낮았지만 fewshot lift도 **+5.21pp**로 가장 작았다. 반대로 Opus 4.8은 가장 높은 base accuracy와 가장 큰 fewshot lift를 함께 보였다. 이 benchmark에서 evolution headroom은 출발 score 하나보다 model이 experience에서 rule을 추출·압축·재사용하는 능력에 더 가까운 변수라는 해석이 가능하다.[2][3]

| 관찰 | 공개 수치와 해석 |
|---|---|
| Codex + GPT-5.5 fewshot | <strong>49.37% → 64.51%</strong>. gold demonstration에서 skill을 뽑아낸 경우다. |
| Claude Code + Opus 4.8 fewshot | <strong>50.63% → 67.07%</strong>. 최대 **+16.44pp** lift다. |
| Fully informed oracle | <strong>91.6%</strong>. 현재 evolved agent가 아직 닿지 못한 rule-application 상한이다. |
| V2 benchmark 규모 | **240 task / 24 group**. benchmark exposure 뒤에도 새 group으로 재생성할 수 있는 기반이다. |

## 실무 관점에서의 해석

GDPevo의 기여는 “agent가 skill을 만들면 좋아진다”는 사실 자체보다, **무엇을 배워야 test에서 이득이 나는지**를 benchmark의 train–test graph로 명시했다는 데 있다. 과거 task에서 얻은 긴 trace를 통째로 저장하는 것보다, 업무 환경에 특화된 atomic rule을 추출하고 새 case에서 조합 가능하게 만드는 persistent state가 핵심이라는 주장이다.

이 관점은 enterprise agent 운영에도 바로 연결된다. CRM policy, invoice exception, clinical workflow처럼 public world knowledge에 없고 조직마다 다른 규칙은 단순 retrieval corpus에 쌓는다고 자동으로 재사용되지 않는다. rule의 출처, 적용 조건, 예외, 평가 가능한 결과를 함께 보존해야 다음 task에서 검증 가능한 skill이 된다.

다만 GDPevo는 product-ready SaaS benchmark라기보다 공개된 **research artifact bundle**에 가깝다. repository는 benchmark data, data-construction workspace, evaluation workspace, per-task report와 experiment board를 함께 제공하지만, tag나 GitHub Release는 아직 없다. 따라서 팀이 바로 install해 leaderboard만 돌리는 패키지라기보다, 자체 업무 benchmark를 설계·확장하고 agent skill evaluation을 재현할 수 있는 reference implementation으로 보는 편이 맞다.[3]

가장 큰 메시지는 결국 measurement에 있다. self-evolution을 도입하려는 팀은 “이전 task를 읽었는가”가 아니라, **train experience에서 얻은 rule이 held-out 업무 조합에서도 deterministic하게 통과하는가**, 그리고 그 과정의 test-time 비용은 줄었는가를 따로 측정해야 한다. GDPevo는 그 질문을 실험 계약으로 만든 사례다.[1][2]

## Sources

[1] https://arxiv.org/abs/2608.03764 — arXiv abstract: 2608.03764
[2] https://arxiv.org/html/2608.03764 — arXiv HTML: 2608.03764
[3] https://github.com/Prism-Shadow/GDPevo — GDPevo official GitHub repository
