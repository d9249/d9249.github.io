---
title: "OneDayAgent는 장기 agent를 모델이 아니라 harness의 문제로 본다"
date: "2026-08-08T01:25:00+09:00"
description: "OneDayAgent는 open-ended everyday task를 bounded subtask, execution memory, global verify/repair로 관리하는 long-horizon harness를 제안하고 AgentIF-OneDay 104개 task에서 GLM-5.2로 0.821을 보고한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - OneDayAgent
  - Long-Horizon Agents
  - Agent Harness
  - Agent Evaluation
  - Autonomous Agents
draft: false
---

하루짜리 실제 업무 요청은 “한 번의 tool call”로 끝나지 않는다. 자료를 읽고, 여러 application을 옮겨 다니고, 중간 산출물을 확인하고, 마지막에는 attachment까지 포함한 deliverable을 제출해야 한다. 이때 agent의 실패는 모델이 단일 질문을 못 푼다는 문제보다 **goal drift, context accumulation, state transfer**가 합쳐지는 문제에 가깝다.

<em>OneDayAgent: Towards a Long-Horizon Harness for Autonomous Agents</em>는 이를 모델 자체의 장기 기억 능력보다 **execution harness의 관리 문제**로 다룬다.[1] open-ended request를 bounded subtask로 나누고, context pressure 아래에서 execution memory를 유지하며, 최종 산출물을 global verification과 repair로 다시 검사한다.[1][2]

저자들은 AgentIF-OneDay의 104개 task에서 GLM-5.2 backend를 쓴 OneDayAgent가 overall score **0.821**을 기록했다고 보고한다. 같은 harness를 세 model family의 다섯 backend에 적용해, backend마다 execution style은 달라도 workflow 자체는 tuning 없이 동작한다는 점을 보이려 한다.[1][2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/onedayagent-long-horizon-agent-harness-overview.png">
    <img src="/images/blog/onedayagent-long-horizon-agent-harness-overview.png" alt="long-horizon everyday challenge의 goal drift·context accumulation·state transfer 문제와 OneDayAgent의 decompose, verify-repair, memory workflow 및 AgentIF-OneDay 결과" style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;" />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">논문 Figure 1. OneDayAgent는 task decomposition, execution memory, verify/repair를 묶어 long-horizon request를 관리하고, GLM-5.2 backend에서 0.821 overall score를 보고한다.[2]</figcaption>
</figure>

## 핵심은 ‘더 긴 context’가 아니라 managed execution이다

논문이 분리하는 long-horizon failure는 세 가지다. **goal drift**는 중간 subtask가 늘어나며 처음 제약과 목표가 흐려지는 현상이다. **context accumulation**은 관찰·tool output·attachment가 쌓여 필요한 state가 묻히는 문제다. **state transfer**는 한 environment에서 얻은 결과를 다음 app과 artifact에 정확히 넘기지 못하는 경우다.[1][2]

OneDayAgent의 harness는 이 문제를 하나의 긴 prompt로 감당하지 않는다. task를 bounded subtask로 분해하고, 각 subtask를 environment-grounded tool로 실행하며, execution memory에 필요한 상태를 보존한다. 마지막에는 final artifact가 request의 제약을 만족하는지 global verification으로 확인하고, 빠진 산출물이나 불완전한 결과를 repair loop로 되돌린다.[2]

| failure surface | harness의 대응과 운영상 의미 |
|---|---|
| Goal drift | task decomposition과 constraint 관리로 중간 성공이 원래 요청을 벗어나지 않게 한다. |
| Context accumulation | execution memory로 긴 trace 전체가 아니라 다음 action에 필요한 state를 보존한다. |
| State transfer | environment-grounded execution으로 app·file·attachment 사이 handoff를 명시적으로 다룬다. |
| Final artifact 누락 | global verify / repair로 reasoning trace가 아니라 제출 결과물을 다시 검사한다. |

## 결과는 harness와 backend의 상호작용을 보여 준다

논문은 AgentIF-OneDay를 Open Workflow Execution, Latent Instruction Inference, Iterative Refinement와 instruction following·factuality·logic/functionality 같은 rubric으로 나눠 본다. attachment가 주어진 경우와 아닌 경우, latency와 overall score도 함께 보고한다.[2]

가장 높은 overall score는 GLM-5.2 기반 OneDayAgent의 **0.821**이다. 다만 이를 “GLM-5.2가 본질적으로 가장 좋은 long-horizon agent model”이라고 읽으면 안 된다. 논문의 backend scaling 분석은 strict parameter scaling law보다 약한 scaling trend를 보고하며, 같은 harness 아래에서도 backend마다 planning, tool-call, repair profile이 다르게 나타난다고 설명한다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/onedayagent-long-horizon-agent-harness-backend-scaling.png">
    <img src="/images/blog/onedayagent-long-horizon-agent-harness-backend-scaling.png" alt="OneDayAgent에서 backend parameter trend, model 간 execution style distance, planning과 tool call 및 repair 비중을 비교한 공식 figure" style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;" />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">논문 Figure 4. 같은 harness에서도 backend별 overall score와 execution style은 다르며, parameter 수만으로 performance를 설명하는 strict scaling law는 보이지 않는다.[2]</figcaption>
</figure>

이 관찰은 agent system의 평가 단위를 바꾼다. model score만 비교하면 model이 낸 plan과 harness가 제공한 memory·verification·repair 효과가 섞인다. 반대로 harness를 고정하고 backend를 바꾸면, 어떤 model이 더 많은 planning을 하는지, tool call을 얼마나 쓰는지, repair에 얼마나 의존하는지를 같은 operational surface에서 볼 수 있다.[2]

## 실무에서 가져갈 설계 원칙

첫째, 장기 task에는 planner보다 **completion contract**가 필요하다. subtask checklist와 intermediate artifact가 있어도 최종 deliverable이 요구한 attachment, 형식, 제약을 빠뜨릴 수 있다. final verifier는 “모든 step이 실행됐는가”보다 “사용자가 받을 artifact가 완전한가”를 판단해야 한다.

둘째, memory는 대화 요약이 아니라 execution state여야 한다. 다음 environment에서 사용할 filename, constraint, pending decision, verified output처럼 행동에 직접 필요한 상태를 고정해야 한다. 긴 trace의 자연어 recap만 저장하면 state transfer 오류를 막기 어렵다.

셋째, model 교체는 harness observability와 함께 해야 한다. backend별 success rate뿐 아니라 planning depth, tool-call mix, verification failure, repair frequency를 함께 기록해야 원인을 model capability와 workflow design으로 나눌 수 있다. OneDayAgent의 핵심 가치는 이 operational difference를 보이게 만드는 데 있다.

공개 GitHub repository는 존재하지만 README에는 **“Releasing soon”**만 표시돼 있어 구현·benchmark artifact가 즉시 사용 가능한 상태라고 보기는 어렵다. 따라서 현재는 재현 가능한 production framework라기보다 long-horizon harness의 연구 설계와 평가 관찰로 읽는 편이 정확하다.[3]

핵심 메시지는 단순하다. autonomous agent가 하루짜리 request를 처리하려면 더 큰 context window만으로는 부족하다. goal, state, artifact를 분리해 관리하고, 마지막 결과를 검증·수리하는 **harness-level control loop**가 필요하다.[1][2]

## Sources

[1] https://arxiv.org/abs/2608.05013 — arXiv abstract: 2608.05013
[2] https://arxiv.org/html/2608.05013 — arXiv HTML: 2608.05013
[3] https://github.com/zjunlp/OneDayAgent — OneDayAgent official GitHub repository
