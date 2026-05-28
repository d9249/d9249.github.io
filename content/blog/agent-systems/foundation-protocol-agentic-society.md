---
title: "Foundation Protocol은 에이전트 사회의 신뢰·거래·감사를 한 계층으로 묶으려 한다"
date: "2026-05-28T17:01:48"
description: "arXiv 2605.23218은 Foundation Protocol(FP)을 agent, tool, human, organization을 하나의 entity graph로 묶고 session, event, receipt, provenance를 표준화하는 조정 계층으로 제안한다. 공개 reference runtime과 AI-Link-Net 구현은 있지만 아직 non-normative 초기 스택으로 보는 편이 안전하다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Foundation Protocol
  - Multi-Agent Systems
  - Agentic Society
  - Agent Economy
  - Protocols
  - MCP
image: "/images/blog/foundation-protocol-architecture.webp"
draft: false
---

AI 에이전트 논의가 “모델이 도구를 얼마나 잘 부르는가”에서 “에이전트들이 서로 어떻게 관계를 맺고, 일을 나누고, 비용을 정산하고, 나중에 감사를 받을 수 있는가”로 이동하고 있다. MCP는 도구 연결의 표준 포트가 되었고, A2A나 A2UI 같은 흐름은 에이전트 간 위임과 UI 조작까지 넓히고 있다. 하지만 실제 시스템에서는 여전히 비어 있는 층이 있다. 서로 다른 프로토콜로 움직이는 agent, tool, human, service, organization을 같은 신뢰·세션·거래·감사 모델 위에서 다룰 수 있는가?

arXiv 2605.23218, **Foundation Protocol: A Coordination Layer for Agentic Society**는 이 빈칸을 정면으로 겨냥한다. 논문의 주장은 단순히 “또 하나의 agent protocol”을 만들자는 것이 아니다. 저자들은 Foundation Protocol(FP)을 agentic society를 위한 graph-first coordination layer로 정의한다. 모든 참여자를 entity로 보고, 관계와 membership을 edge로 보고, session과 activity를 graph 위의 상호작용으로 본다. 여기에 value exchange와 policy, provenance, audit을 protocol-level concern으로 올린다.

요약하면 FP의 질문은 이렇다. 에이전트가 도구를 호출하는 수준을 넘어 서로 고용하고, 협업하고, 지불하고, 분쟁을 처리하고, 사람이나 조직의 감독을 받아야 한다면 어떤 공통 어휘가 필요한가?

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/foundation-protocol-web-evolution.webp"
    alt="Foundation Protocol paper figure comparing Web 1.0, Web 2.0, Web 3.0, and Web 4.0 coordination failures"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. 웹의 세대가 올라갈수록 capability는 커졌지만, Web 4.0식 agentic system에서는 identity, trust, context, coordination 실패가 더 커진다는 문제의식에서 출발한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

논문이 보는 병목은 raw model capability가 아니다. 자율 에이전트가 브라우징, 구매, 배포, 시스템 관리, 상호 협업으로 확장되면 핵심 병목은 coordination으로 바뀐다. 에이전트는 신뢰 가능한 관계를 만들고, 여러 참여자가 있는 일을 조직하고, 사용량과 대가를 계량하고, 나중에 사람이 검토할 수 있는 evidence를 남겨야 한다.

현재 프로토콜들은 이 문제를 각자 일부만 다룬다. MCP는 tool access와 external system 연결에 강하고, A2A는 agent-to-agent delegation을 겨냥하며, A2UI는 UI delegation에 초점을 둔다. DIDComm은 secure messaging과 identity 쪽에 가깝고, UCP는 commerce/payment 쪽 문제를 본다. FP는 이들을 대체하겠다는 포지션보다, 서로 다른 프로토콜을 감싸고 bridge하는 공통 control surface를 만들겠다는 쪽에 가깝다.

논문 Table 2의 비교를 실무 언어로 바꾸면 다음과 같다.

| Capability | FP가 끌어올리는 층 | 기존 흐름과의 관계 |
|---|---|---|
| Unified entities | agent, tool, human, org, institution을 같은 addressable entity로 본다 | MCP/A2A의 participant 개념보다 더 넓은 entity model |
| Native groups and orgs | session, role, membership, delegation을 protocol object로 만든다 | multi-agent orchestration의 application logic을 일부 표준화 |
| Economy primitives | metering, receipt, settlement, dispute signal을 포함한다 | payment rail 자체가 아니라 감사 가능한 거래 기록 계층 |
| Policy and provenance | policy outcome, approval, revocation, audit evidence를 first-class로 둔다 | 안전장치를 prompt나 app log가 아니라 protocol boundary에 둠 |
| Progressive disclosure | capability와 schema를 필요할 때 단계적으로 공개한다 | 거대한 tool spec을 context에 통째로 넣는 방식을 줄임 |

이 관점에서 FP는 “MCP의 경쟁자”라기보다 MCP, A2A, A2UI, DIDComm, UCP 위나 사이에 놓이는 조정 계층을 자처한다. 물론 이 주장이 실제 표준으로 성립하려면 구현 성숙도와 생태계 합의가 필요하다. 지금은 설계 제안과 초기 reference stack의 성격이 더 강하다.

## 핵심 구조: 네 개의 plane과 profile layer

FP의 architecture는 네 개의 핵심 plane과 configuration/profile plane으로 구성된다. Entity & Trust Plane은 참여자가 누구인지, 무엇을 할 수 있는지, 어떤 trust signal과 privacy constraint를 갖는지 다룬다. Transport & Routing Plane은 주소, discovery hook, channel setup, protocol binding, termination을 다룬다. Interaction & Organization Plane은 message schema, event stream, session, organization, role, economic primitive를 다룬다. Regulation & Oversight Plane은 policy enforcement, audit, provenance, monitoring, compliance, dispute signal을 맡는다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/foundation-protocol-architecture.webp"
    alt="Foundation Protocol architecture with Entity and Trust, Transport and Routing, Interaction and Organization, Regulation and Oversight planes"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Foundation Protocol 공식 architecture diagram. 핵심은 agent/tool/human/org를 graph의 node로 보고, session·membership·delegation·policy·provenance를 graph edge와 event로 다루는 것이다.
  </figcaption>
</figure>

논문이 제안하는 최소 vocabulary도 흥미롭다. Entity, Session, Activity, Envelope, Event, Receipt/Settlement, Provenance라는 일곱 개 객체로 tool call, multi-agent collaboration, organization workflow, commerce를 모두 표현하려 한다. 여기서 중요한 것은 객체 이름 자체보다, 협업과 거래와 감사를 같은 trace 안에 묶는다는 점이다.

예를 들어 `Envelope`는 단순 message wrapper가 아니라 intent, routing, correlation id, policy reference, 최소 metadata를 담는 signed wrapper다. `Session`은 참여자와 역할, policy reference, optional budget을 묶는 scoped context다. `Receipt/Settlement`는 사용량과 value exchange를 검증 가능한 record로 남긴다. `Provenance`는 policy decision, approval, revocation 같은 evidence를 audit 가능한 형태로 보존한다.

이 구조의 실무적 의미는 “에이전트 대화 로그를 잘 저장하자”가 아니다. 로그 이전에 session, role, envelope, event, receipt, provenance라는 공통 단위를 만들어 두면, 나중에 UI, auditor, compliance service, 다른 agent가 같은 interaction을 서로 다른 관점으로 읽을 수 있다. 장기적으로는 이것이 multi-agent system의 observability와 governance substrate가 된다.

## AI 회사 시나리오가 보여 주는 것

논문은 작은 AI company를 예시로 든다. 인간 founder가 local host에 자신을 entity로 등록하고, organization entity를 만들고, planner, developer, reviewer agent를 내부 entity로 등록한다. 각 entity는 address, cryptographic identity, organization role을 갖는다. 이후 외부 agent나 GPU provider를 발견하고, identity와 capability를 확인하고, session과 contract를 만든다. 작업이 진행되면 message, tool invocation, event, receipt가 trace로 남고, budget limit이나 contract approval 같은 중요한 transition은 human owner에게 escalation될 수 있다.

이 예시가 말하는 핵심은 특수한 “AI 회사 앱”이 아니다. 같은 entity model이 founder와 external GPU provider를 모두 표현하고, 같은 checkpoint pipeline이 access control과 budget policy를 모두 처리하며, 같은 envelope가 task message와 payment receipt를 모두 운반할 수 있다는 점이다. FP가 노리는 장점은 바로 이 uniformity다.

| 단계 | FP plane | 실무 해석 |
|---|---|---|
| organization 설립 | Entity & Trust, Interaction & Organization | 사람, 조직, 내부 agent를 같은 identity/address 체계에 올림 |
| 외부 capability 발견·고용 | Transport & Routing, Entity & Trust | capability summary로 후보를 찾고 필요할 때 세부 schema를 공개 |
| 협업 실행 | Interaction & Organization | session, role, event stream으로 multi-party work를 추적 |
| 거래·정산 | Interaction & Organization, Regulation & Oversight | metering, receipt, settlement, dispute signal을 trace에 포함 |
| 감사·감독 | Regulation & Oversight | policy decision과 human approval을 provenance로 보존 |

이 부분은 최근 agent 제품들이 부딪히는 현실적 문제와 맞닿아 있다. “에이전트가 알아서 외주를 맡긴다”는 문장은 데모로는 멋지지만, 실제 운영에서는 누가 권한을 줬는지, 얼마까지 쓸 수 있는지, 어떤 근거로 승인했는지, 실패했을 때 어떻게 분쟁을 처리할지를 설명해야 한다. FP는 이 질문들을 app별 convention으로 남기지 않고 protocol vocabulary로 끌어올리려 한다.

## 공개 구현 상태: reference stack은 있지만 표준 구현은 아니다

논문 Appendix A는 공개 reference stack을 소개한다. 하나는 `FoundationAgents/foundation-protocol` runtime이고, 다른 하나는 그 위에 구축된 application-network 구현인 `FoundationAgents/ai-link-net`이다. 두 저장소 모두 MIT license로 공개되어 있다. `foundation-protocol` README는 FP를 agent, human, tool, service가 shared protocol layer 위에서 협업하기 위한 Python runtime으로 설명하고, contract, escrow, settlement, dispute resolution, federation, MCP tool integration 같은 예제를 언급한다. `ai-link-net`은 multi-agent collaboration, web UI, entity discovery, marketplace, reputation system을 포함한 full-stack application으로 소개된다.

다만 논문은 이 reference stack을 non-normative로 둔다. 즉 코드가 곧 표준이라는 뜻은 아니다. 구현은 feasibility와 trade-off를 보여 주는 청사진에 가깝고, 실제 protocol semantics는 main text가 정의한다는 포지션이다. 또한 조회 시점 기준 두 GitHub 저장소에는 release나 tag가 없고, 비교적 최근에 공개된 초기 프로젝트 상태다. 따라서 당장 production standard로 채택한다기보다, 설계 방향과 vocabulary를 검토하고 작은 실험으로 만져 보는 단계가 맞다.

구현 설계에서 눈에 띄는 부분은 세 가지다.

첫째, dependency direction을 protocol core 쪽으로 엄격히 유지하려 한다. protocol core는 entity model, message semantics, mail envelope, cryptography, host topology, checkpoint pipeline, protocol adapter를 포함하지만 web framework나 database에는 의존하지 않는다. application layer와 CLI/UI는 그 위에 붙는다.

둘째, checkpoint pipeline을 중심으로 access control과 human-in-the-loop approval을 처리한다. inbound message는 handler에 도달하기 전에 friend-list access, session validation, rate limit, content-length, payment verification, contract approval, payment approval 같은 checkpoint를 통과할 수 있다. 중요한 결정은 owner escalation으로 인간 승인 큐에 들어갈 수 있다.

셋째, topology는 현재 tree-based default를 쓰되 decentralization path를 열어 둔다. cloud root가 rendezvous point가 되고 local host가 child로 붙는 운영 모델은 시작하기 쉽지만, 장기적으로 agentic society라는 목표와 얼마나 잘 맞을지는 추가 검증이 필요하다.

## 실무 관점에서의 해석

Foundation Protocol의 가장 흥미로운 점은 agent system을 “더 똑똑한 assistant”가 아니라 “새로운 사회적·경제적 infrastructure”로 본다는 데 있다. 이 관점은 과장처럼 들릴 수 있지만, 실제로 agent가 조직 내부 workflow, 외부 SaaS, 결제, 코드 배포, customer operation을 건드리기 시작하면 사회적 단어들이 다시 필요해진다. role, delegation, contract, budget, audit, dispute, reputation은 모두 전통 조직이 오래전부터 써 온 coordination vocabulary다.

좋게 보면 FP는 agent economy가 필요로 할 공통 회계·감사·신뢰 계층을 미리 설계하려는 시도다. 특히 progressive disclosure와 policy/provenance first design은 실무적으로 중요하다. 모든 tool schema와 capability를 model context에 밀어 넣는 방식은 비용과 보안 면에서 오래 버티기 어렵다. 반대로 짧은 capability summary로 시작해 authorization 이후 필요한 schema와 pricing, policy를 가져오는 구조는 token overhead와 정보 노출을 줄일 수 있다.

하지만 위험도 있다. FP가 다루려는 범위는 넓다. identity, routing, session, organization, economy, policy, provenance, bridge까지 한꺼번에 묶으면 protocol이 지나치게 야심찬 추상화가 될 수 있다. 표준은 좋은 vocabulary만으로는 성공하지 않는다. 실제 adoption은 기존 MCP/A2A/A2UI 생태계와 얼마나 friction 없이 연결되는지, 구현체가 얼마나 가볍고 안정적인지, audit evidence가 조직의 실제 compliance 요구와 맞는지에 달려 있다.

그래서 지금 시점의 결론은 “FP를 바로 도입하자”보다 “multi-agent product를 설계할 때 빠뜨리기 쉬운 층을 확인하는 lens로 쓰자”에 가깝다. 우리 시스템에 agent와 tool identity가 같은 표면에 있는가, session과 role이 로그가 아니라 객체로 남는가, budget과 settlement가 trace에 들어오는가, human approval이 provenance로 보존되는가, policy decision을 나중에 재검토할 수 있는가. 이 질문들만으로도 FP 논문은 유용하다.

agentic system이 커질수록 문제는 prompt engineering에서 organizational engineering으로 이동한다. Foundation Protocol은 그 이동을 가장 노골적으로 선언한 문서 중 하나다. 아직 초기 제안이지만, 에이전트가 서로 협업하고 거래하고 감사를 받아야 하는 미래를 진지하게 생각한다면, FP의 entity graph와 evidence-first vocabulary는 한 번 검토할 가치가 있다.

Sources: https://arxiv.org/abs/2605.23218 , https://arxiv.org/html/2605.23218v1 , https://github.com/FoundationAgents/foundation-protocol , https://foundationagents.github.io/foundation-protocol/ , https://github.com/FoundationAgents/ai-link-net
