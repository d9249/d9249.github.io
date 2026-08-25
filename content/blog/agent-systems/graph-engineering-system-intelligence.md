---
title: "그래프 엔지니어링은 에이전트를 더 붙이는 대신, 관계를 운영 대상으로 만든다"
date: "2026-08-26T00:41:37"
description: "Graph Engineering은 LLM 에이전트 시스템의 task·agent·runtime state 관계를 명시적·동적 그래프로 다뤄, 단일 agent loop를 넘어 system intelligence를 설계하자는 survey다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Graph Engineering
  - Agent Systems
  - Multi-Agent Systems
  - Runtime State
  - Agent Orchestration
draft: false
---

에이전트 시스템을 복잡하게 만드는 것은 agent 수 자체가 아니다. 실제로 어려운 지점은 “무엇을 먼저 해야 하는가”, “누가 맡아야 하는가”, “현재 어디까지 유효하게 끝났는가”가 서로 얽힌다는 데 있다. `Graph Engineering in the Era of LLM Agents`는 이 관계를 prompt나 대화 context 속에 암묵적으로 두지 말고, **변경·조회·검증 가능한 그래프 구조**로 외부화하자고 제안한다.[1][2]

이 글은 새로운 single benchmark나 특정 framework의 성능 보고가 아니라 survey다. 저자들은 foundation model을 둘러싼 Prompt·Context Engineering, 단일 agent의 Harness·Loop Engineering 다음 단계로, 여러 task·agent·공유 자원·실행 상태를 함께 조직하는 **System Intelligence**라는 관점을 제시한다.[1][2] 따라서 “그래프를 쓰면 agent가 좋아진다”는 일반 명제가 아니라, 복잡한 에이전트 운영에서 그래프가 *시스템의 제어·기록·복구 구조*가 될 수 있다는 설계 언어로 읽는 편이 정확하다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/graph-engineering-system-intelligence-overview.png">
    <img
      src="/images/blog/graph-engineering-system-intelligence-overview.png"
      alt="Foundation Model, Prompt Engineering, Context Engineering, Harness Engineering, Loop Engineering, Graph Engineering, Ontology Engineering으로 이어지는 계층과 Model·Individual·System Intelligence 범위를 정리한 Graph Engineering 공식 개요 그림"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    저자 공개 저장소의 개요 그림. 위쪽은 engineering paradigm의 확장, 아래쪽은 그 범위가 model → individual agent → system으로 넓어지는 방식을 보여 준다. 영어 원본 그림이다.[2][3]
  </figcaption>
</figure>

## 핵심 주장: 모델 호출에서 시스템 관계로

논문은 하나의 individual agent를 대략 `Loop(LLM + Harness)`로 설명한다. 여기서 harness는 tool, memory, skill, 실행 환경처럼 모델 호출 바깥의 지속적 자원을 제공하고, loop는 계획·행동·관찰·검증·적응을 반복해 그 자원을 시간에 따라 사용하게 한다.[2]

하지만 장기적이고 상호의존적인 업무에서는 agent가 더 똑똑해지거나 context가 더 길어지는 것만으로 조직 문제를 풀기 어렵다. 예를 들어 연구, 소프트웨어 개발, 운영 업무는 병렬 branch, 전문 역할, 독립 검증, 공유 결과, 실패 후 일부만 복구할 경계를 함께 요구한다. 이를 한 agent의 하나의 context와 순차적 loop에 눌러 넣으면, 작업 의존성·역할 경계·실행 이력이 섞여 버린다는 것이 저자들의 문제 설정이다.[1][2]

그래서 논문이 말하는 **System Intelligence**는 “여러 agent의 능력을 합친 값”이 아니다. 복잡한 objective를 분해하고, 이질적인 component에 책임을 배정하며, 상호의존 실행을 조정하고, 시스템 수준의 상태를 유지하는 능력이다.[2] Graph Engineering은 이 조직 문제를 세 개의 연결된 그래프로 다룬다.

| 그래프 관점 | 답하려는 질문 | 운영에서 명시해야 할 것 |
|---|---|---|
| Task Organization | **무엇을** 해야 하는가 | subtask, dependency, 병렬성, 검증 조건, workflow 변경 |
| Agent Coordination | **누가** 어떻게 하는가 | capability, 역할, 권한, delegation, communication, review |
| Runtime State Management | 시스템이 **어떻게 진행 중인가** | 실행 이력, artifact, provenance, 상태 전이, fault, recovery boundary |

이 표는 논문의 세 축을 실무 질문으로 옮긴 것이다. 저자들은 task organization을 목표·의존성·실행 구조의 표현으로, agent coordination을 capability·team·communication의 조직으로, runtime state management를 상태 기록·fault localization·recovery의 구조로 설명한다.[2]

## 1. Task Organization: 계획을 prompt가 아닌 실행 가능한 구조로

복잡한 목표를 작은 작업으로 나누는 것만으로는 충분하지 않다. 어떤 작업은 먼저 끝나야 하고, 어떤 작업은 동시에 돌려도 되며, 어떤 결과는 verifier를 통과해야 다음 단계가 열려야 한다. Graph Engineering의 task graph에서 node는 subgoal 또는 operation을, edge는 순서·데이터·논리 의존성을 나타낸다.[2]

이 방식의 실무적 장점은 “계획을 잘 쓴 prompt”와 “스케줄 가능한 실행 구조”를 구분한다는 데 있다. 예를 들어 code repair 업무라면 log 분석, failure reproduction, 관련 코드 탐색은 병렬 후보가 될 수 있지만, patch 적용과 regression test는 그 결과에 의존한다. dependency를 명시하면 ready node만 실행하고, 중간 evidence가 새로 나오면 남은 graph를 수정할 수 있다.[2]

다만 graph는 계획의 그림이 아니라 계약이어야 한다. 각 node에는 최소한 입력 artifact, 기대 출력, 권한, 완료 기준, 실패 시 다음 상태를 붙여야 한다. 이것이 없으면 DAG를 만들었어도 실제 실행은 다시 자연어 요약과 사람의 기억에 의존하게 된다.

## 2. Agent Coordination: 역할 이름 대신 capability와 책임 경계

multi-agent 구성이 자주 실패하는 이유는 “researcher”, “coder”, “reviewer”라는 이름을 붙였는데도 실제로 누가 어떤 tool·data·권한을 가졌는지, 어떤 결과를 검증해야 하는지가 불분명하기 때문이다. 논문은 agent, skill, tool, model, resource를 node로 두고 capability ownership, resource access, permission, reliability 같은 관계를 typed edge로 표현하는 관점을 제시한다.[2]

여기서 team graph와 communication graph를 분리하는 것이 중요하다.

- **team graph**는 누가 참여하고, 누가 owner이며, 어떤 결과를 handoff·review·승인하는지를 비교적 안정적으로 표현한다.
- **communication graph**는 지금 이 시점에 어떤 정보가 누구에게 전달되어야 하는지, feedback이 어디로 되돌아가야 하는지를 실행 중에 표현한다.[2]

두 graph를 혼합하면, 모든 agent가 모든 agent에게 메시지를 보내는 연결 과잉으로 흐르기 쉽다. 반대로 역할·입출력·review edge를 좁혀 두면 message의 양이 아니라 **검증 가능한 handoff**가 협업의 단위가 된다. 논문도 더 많은 통신 연결이 항상 더 좋은 협업을 뜻하지 않으며, 정보 경로 자체가 비용과 오류 전파를 결정한다고 정리한다.[2]

## 3. Runtime State Management: 대화 기록은 시스템 상태가 아니다

여러 agent와 tool이 동시에 움직일 때 채팅 로그만으로는 “현재 무엇이 사실인가”를 답하기 어렵다. 성공한 artifact와 잠정 추론, 확정된 external effect와 재실행 가능한 internal step, 아직 유효한 작업과 이미 무효화된 작업을 구분해야 한다.

논문은 runtime state management를 세 단계로 정리한다.[2]

1. **State recording** — task progress, 결과물, role binding, resource 상태, 관측과 그 provenance를 구조화해 기록한다.
2. **Fault localization** — 보이는 실패와 최초 원인을 구분하고, dependency와 evidence로 영향 범위를 추적한다.
3. **Failure recovery** — 유효한 작업을 버리지 않고, 검증된 recovery boundary에서 영향받은 부분만 재실행·분기·보상한다.

특히 recovery는 단순 rollback과 다르다. file write나 model call처럼 내부에서 재구성 가능한 상태도 있지만, 메일 발송·배포·DB 변경처럼 외부에 효과를 남긴 작업은 보상이나 사람 승인 없이는 되돌릴 수 없다. 그러므로 운영 graph에는 `proposed → validated → committed` 같은 상태 전이와, side effect의 확인 근거를 함께 남기는 편이 안전하다. 이는 논문이 강조하는 traceability·provenance·recovery boundary를 실제 운영 계약으로 번역한 것이다.[2]

## 그래프가 필요한 신호와, 아직 필요 없는 신호

다음 조건이 동시에 나타날수록 graph engineering의 비용을 지불할 이유가 커진다.

| 관찰되는 신호 | 먼저 외부화할 구조 |
|---|---|
| 작업이 종종 병렬·의존 branch로 갈린다 | task dependency와 ready/blocked 상태 |
| specialist와 verifier가 결과를 주고받는다 | owner, handoff, review·approval edge |
| 재시도 때 이미 끝난 일을 자주 다시 한다 | artifact provenance와 recovery boundary |
| shared memory가 충돌하거나 stale result가 섞인다 | versioned state, scope, commit 규칙 |
| tool·권한·비용이 agent마다 다르다 | capability·permission graph |

반대로 단일 tool 호출, 짧은 일회성 요약, 실패해도 전체를 다시 돌리는 편이 더 싼 작업에는 graph runtime이 과한 구조일 수 있다. graph는 agent를 추가하는 제품 기능이 아니라, **관계가 이미 운영 복잡도의 주원인이 되었을 때** 도입하는 제어면이다.

## 실무에 옮길 때의 최소 단위

처음부터 범용 knowledge graph나 자율적인 agent organization을 만들 필요는 없다. 한 업무를 골라 아래 네 가지를 versioned artifact로 남기는 것부터 시작할 수 있다.

```text
1. Task: node별 입력·출력·완료 조건·의존성
2. Capability: agent/tool별 가능한 행동과 권한
3. State: 관측·artifact·검증 결과·commit 시점
4. Recovery: 실패 영향 범위·재실행 조건·human approval 경계
```

그 다음에는 quality만 보지 말고 구조도 평가해야 한다. 논문은 system-level evaluation에서 structural fidelity, operational correctness, system evolution, governance를 함께 봐야 한다고 제안한다.[2] 실무 지표로는 “최종 답이 맞았는가” 외에 dependency 위반 없이 실행했는가, verifier가 실제로 독립적이었는가, 실패 원인을 재현할 수 있는가, permission boundary를 넘지 않았는가를 측정하는 편이 낫다.

## 공개 artifact의 범위와 한계

이 논문은 2026년 8월 공개된 survey이며, 저자들은 논문과 함께 `DEEP-JLU/Awesome-Graph-Engineering`이라는 curated resource collection을 제공한다. 저장소는 연구 논문, benchmark·dataset·environment, open-source library, application을 Model·Individual·System Intelligence의 분류에 맞춰 모으고 지속 갱신하겠다고 밝힌다.[1][3]

그러나 이것은 즉시 설치해 production orchestration을 만드는 단일 구현체가 아니다. 논문의 taxonomy에는 이미 서로 다른 목표와 runtime semantics를 가진 많은 시스템이 함께 들어간다. 따라서 도입 판단에서는 “우리 workflow의 dependency·state·권한을 어떤 graph contract로 표현할 것인가”를 먼저 정하고, 그 다음에 LangGraph류 workflow runtime, state store, orchestration library를 고르는 순서가 안전하다. **framework 선택보다 실행 관계의 명세가 먼저**라는 점이 이 survey에서 가장 실용적으로 남는 메시지다.[2][3]

## Sources

[1] [arXiv abstract](https://arxiv.org/abs/2608.21156) — 서지, 제출일, 초록, 저자 공개 resource collection 링크

[2] [arXiv HTML](https://arxiv.org/html/2608.21156v1) — System Intelligence 정의, Graph Engineering taxonomy, task·coordination·runtime-state 방법과 한계

[3] [DEEP-JLU/Awesome-Graph-Engineering](https://github.com/DEEP-JLU/Awesome-Graph-Engineering) — 저자 공개 resource collection, 그림 원본, MIT license 및 repository scope
