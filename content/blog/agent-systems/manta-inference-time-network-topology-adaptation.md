---
title: "MANTA는 멀티에이전트의 연결 구조까지 추론 중에 고친다"
date: "2026-08-02T22:34:53+09:00"
description: "arXiv 2607.28527의 MANTA는 agent role·통신 link·실행 순서·정보 가시성·검증 경로를 inference-time trace에 맞춰 제한적으로 갱신하는 Multi-Agent Network Topology Adaptation을 제안한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - MANTA
  - Multi-Agent Systems
  - Agent Topology
  - Inference-Time Adaptation
  - Agent Collaboration
draft: false
---

멀티에이전트 시스템의 성능을 높이려 할 때 흔히 모델을 바꾸거나, agent 수를 늘리거나, prompt를 다듬는다. 그러나 실제 협업 성능은 *누가 누구에게 무엇을 언제 공유하는가*에도 크게 좌우된다. planner가 모든 정보를 받는 star topology, 역할별 agent를 직렬로 넘기는 pipeline, 여러 specialist가 병렬로 토론하는 graph는 같은 모델과 tool을 써도 전혀 다른 병목과 실패 양상을 만든다.

`MANTA: Multi-Agent Network Topology Adaptation for Self-Evolving Multi-Agent Systems`는 이 협업 구조를 실행 전에 한 번 정하고 고정하는 대신, task와 execution trace를 근거로 **inference 중에 topology를 바꿀 수 있어야 한다**고 주장한다. MANTA가 다루는 대상은 메시지 route만이 아니다. agent role, communication link, execution order, information visibility, intermediate validation path까지 포함한 조직 구조다.

핵심은 무제한적인 agent 증식이나 prompt rewriting이 아니라 **정해진 agent budget과 task interface를 보존한 bounded structural update**다. 현재의 협업 조직이 충분하지 않다는 신호가 있을 때만, 다음 실행을 위해 어떤 연결을 열고 닫거나 어떤 역할 순서를 바꿀지 조정한다. 즉 자기개선의 단위를 individual agent의 답변 품질에서, agent들이 구성하는 **협업 아키텍처**로 옮긴다.

## 무엇을 해결하려는가

고정 topology는 설계와 운영을 단순하게 만든다. 예를 들어 research agent라면 `planner → searcher → writer → verifier`의 직렬 flow를 미리 정할 수 있다. 하지만 모든 task가 이 순서에 맞지는 않는다. 검색이 부족하면 writer가 너무 일찍 결론을 내리고, tool result가 특정 specialist에게만 머물면 planner가 필요한 근거를 보지 못하며, 검증이 마지막에만 오면 이미 비싼 작업을 되돌려야 한다.

기존 multi-agent 연구에서는 topology를 사람의 설계로 고정하거나, benchmark 이전에 offline으로 탐색해 하나의 graph를 고르는 경우가 많다. MANTA의 문제 제기는 여기서 출발한다. task difficulty와 진행 중인 trace가 달라지는데 collaboration network가 고정돼 있으면, 조직 자체가 현재 작업의 병목이 될 수 있다.

논문이 겨냥하는 질문은 “어떤 agent가 더 똑똑한가”가 아니다. **현재 실패나 정체가 model capability 문제인지, 아니면 information flow·역할 배치·검증 위치의 문제인지 어떻게 구분하고 조직을 최소한으로 바꿀 것인가**다.

## 핵심 아이디어 / 구조 / 동작 방식

### 실행 전: task-conditioned topology를 초기화한다

MANTA는 실행을 시작하기 전에 이전 structural experience를 바탕으로 task에 맞는 초기 network topology를 만든다. 모든 task에 하나의 범용 graph를 강요하지 않고, 정보 탐색·tool use·planning·workflow execution·수학 추론처럼 다른 작업 형태가 요구하는 협업 구조가 다를 수 있다는 전제를 둔다.

여기서 topology는 단순한 edge list보다 넓다. 논문 abstract가 명시하는 변경 대상은 다음 다섯 가지다.

| 구조 요소 | 바꿀 수 있는 것 | 실무에서의 의미 |
|---|---|---|
| Agent role | 어떤 agent가 탐색·계획·검증·종합을 맡는가 | 역할 불일치나 과도한 중복을 줄이는 수단 |
| Communication link | 누가 누구에게 결과와 상태를 전달하는가 | 중요한 근거가 필요한 의사결정 지점에 도달하게 함 |
| Execution order | 어떤 역할이 먼저 실행되고 무엇이 기다리는가 | 검증·탐색을 뒤늦게 수행하는 병목을 조정 |
| Information visibility | 어떤 agent가 어떤 trace·artifact를 볼 수 있는가 | context 과부하와 정보 단절 사이를 조절 |
| Validation pathway | 중간 결과를 어디에서 확인·반려하는가 | 값비싼 잘못된 방향을 더 이른 단계에 차단 |

### 실행 중: collaboration trace를 관찰하고 제한적으로 갱신한다

실행 중에는 collaboration trace를 모니터링한다. abstract가 말하는 핵심 조건은 “현재 organization이 insufficient할 때” structural update를 적용한다는 점이다. 모든 turn마다 network를 다시 설계하는 것이 아니라, 기존 구조가 task를 풀기에 부족하다는 근거가 생겼을 때만 수정하는 방식이다.

이 제한은 중요하다. topology를 자주 바꾸면 system이 task를 푸는 대신 자기 조직을 계속 재구성하는 데 token과 tool call을 쓸 수 있다. 반대로 구조를 전혀 바꾸지 않으면 잘못된 routing과 정보 차단을 같은 방식으로 반복한다. MANTA는 task interface와 agent budget을 보존하는 제약을 둬, adaptation이 문제 정의 자체를 바꾸거나 무한한 specialist를 추가하는 우회로가 되지 않게 한다.

이 흐름을 운영 관점으로 옮기면 다음과 같다.

1. task type과 prior structural experience에서 초기 조직을 선택한다.
2. agent들이 계획·도구 실행·정보 전달·중간 검증을 수행한다.
3. trace에서 협업 구조의 부족 신호를 관찰한다.
4. 역할, link, 실행 순서, 가시성, 검증 경로 중 필요한 부분만 업데이트한다.
5. 동일한 task interface와 agent budget 안에서 다음 협업 단계를 계속한다.

## 공개된 근거에서 확인되는 점

이 논문은 single-agent 및 representative multi-agent baseline과 MANTA를 다섯 benchmark에서 비교했다고 보고한다. benchmark 범위는 information seeking, tool use, planning, workflow execution, mathematical reasoning으로 넓다. 이 구성이 좋은 이유는 topology adaptation이 단일 분야의 prompt trick이 아니라, information routing과 intermediate validation이 실제로 다른 업무들에서 의미가 있는지 보려는 시도이기 때문이다.

저자가 보고한 headline 결과는 평균 score **74.0**이다. strongest baseline보다 **5.8 percentage point** 높고, PlanCraft에서 가장 좋은 결과를 얻었다고 적혀 있다. 다만 현재 확인 가능한 공식 abstract에는 benchmark별 score, variance, 비용, topology update 횟수, update trigger의 false positive/negative 같은 상세 표가 담겨 있지 않다. 따라서 이 숫자는 “구조 적응이 가능성을 보였다”는 저자 보고로 읽어야 하며, 모든 agent workload에서 5.8 point 개선이 재현된다는 뜻으로 일반화해서는 안 된다.

| 확인된 항목 | 논문이 밝힌 내용 | 읽을 때의 주의점 |
|---|---|---|
| Adaptation 시점 | inference time | offline topology search만의 결과가 아니라 trace 중 구조 갱신을 목표로 함 |
| 변경 범위 | role, link, order, visibility, validation | message routing 하나만 바꾸는 방법보다 넓은 조직 단위의 개입 |
| 보존 제약 | task interface와 agent budget | agent 수를 계속 늘려 얻는 성능과 구분하려는 장치 |
| 평가 영역 | 다섯 benchmark, 다섯 업무 성격 | 영역별 세부 조건과 비용은 논문 본문·artifact에서 별도 확인이 필요 |
| headline 결과 | 평균 74.0, strongest baseline 대비 +5.8%p, PlanCraft 최고 | 저자 보고값이며 독립 재실행 결과는 아님 |

공개 arXiv 기록상 이 글은 2026년 7월 30일 `cs.AI`로 v1이 제출됐고, 8월 2일 metadata update가 확인된다. 이 초기 preprint의 arXiv page/HTML에서 코드 repository, model checkpoint, project page 링크는 확인하지 못했다. 그래서 현재 공개물은 runnable platform이라기보다 **inference-time collaboration topology라는 설계·평가 제안**으로 보는 편이 정확하다. code와 trace artifact가 뒤따르는지에 따라 재현성과 운영 적용성의 판단은 달라질 수 있다.

## 실무 관점에서의 해석

MANTA가 남기는 가장 유용한 관점은 agent system의 “policy”가 model parameter나 system prompt에만 있지 않다는 것이다. `A가 검색하고 B가 평가하며 C가 요약한다`는 역할 배치, B의 evidence를 C가 볼 수 있게 하는 edge, verifier를 planning 뒤가 아니라 tool call 직후에 두는 순서 역시 행동을 결정하는 정책이다.

예를 들어 문헌 조사 agent가 같은 논문을 반복 검색하고 서로의 evidence를 제대로 이용하지 못한다면, reasoning model을 더 큰 것으로 바꾸기 전에 topology 문제를 의심할 수 있다. search agent의 raw artifact를 claim verifier에게 직접 노출하고, verifier의 rejection을 writer와 planner 모두가 볼 수 있게 하며, unresolved claim이 남으면 synthesis 전에 추가 retrieval로 되돌리는 것이다. 이 변경은 agent를 추가하지 않아도 협업의 정보 병목을 줄일 수 있다.

그러나 topology adaptation에는 독립적인 평가가 필요하다. 구조를 바꾼 뒤 점수가 올랐다는 사실만으로 좋은 조직 변경이라고 결론 내리기 어렵다. 더 많은 정보 공유가 context cost와 noise를 키울 수 있고, 검증 edge를 추가하면 정확도는 올라도 latency가 늘 수 있으며, agent가 자기 trace를 근거로 자기 조직을 고치면 update trigger 자체가 self-confirming loop가 될 수 있다.

실무 도입에서는 결과 score 외에도 아래를 함께 추적하는 편이 낫다.

- topology update 한 번당 추가 token, tool call, wall-clock latency
- 고정 topology 대비 success·regression·retry 횟수
- 새 link가 실제로 사용한 evidence와 그 provenance
- update 뒤에 늘어난 context 길이와 duplicate work
- validation pathway가 막아 낸 오류와 놓친 오류
- task family가 바뀌었을 때 초기 topology와 update rule이 transfer되는지

MANTA의 주장대로라면 멀티에이전트 시스템은 여러 LLM을 연결한 정적 graph가 아니라, 제한된 예산 안에서 **자기 협업 구조를 수정하는 실행 조직**이 될 수 있다. 다음 검증 과제는 그 조직이 언제 바뀌어야 하는지, 바뀐 구조가 왜 더 좋은지, 그리고 더 나은 score가 단순한 정보량·비용 증가가 아닌지를 trace 수준에서 투명하게 보여 주는 일이다.

Sources: https://arxiv.org/abs/2607.28527, https://arxiv.org/pdf/2607.28527, https://arxiv.org/html/2607.28527, https://export.arxiv.org/api/query?id_list=2607.28527
