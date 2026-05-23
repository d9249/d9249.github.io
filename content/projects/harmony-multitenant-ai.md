---
title: "Harmony — 안전한 사내 AI 지식 시스템"
period: "AsianaIDT / 2026.05.11 - 2026.05.22"
description: "Harmony Agent가 사용자 맥락, 권한, 사내 지식, 회의 흐름을 이해하고 행동하는 엔터프라이즈 AI 에이전트 시스템입니다."
metrics:
  - "Harmony Agent Runtime"
  - "Permission-aware RAG"
  - "Human-gated Knowledge Loop"
stack:
  - "Python"
  - "FastAPI"
  - "Next.js"
  - "Harmony Agent"
  - "AWS Bedrock"
  - "PageIndex"
  - "SQLAlchemy"
  - "OpenTofu"
details:
  - "Harmony Agent를 UserContext, Session, persona overlay, tool context, citation, audit trail이 연결된 실행 단위로 설계했습니다."
  - "개인 채팅, Space 공유 채팅, 회의 세션마다 검색 후보가 다르게 합성되도록 SessionScopedRetrievalEngine과 permission metadata 경계를 구성했습니다."
  - "문서와 회의 기록은 바로 지식화하지 않고 LLM-Wiki Compiler, review queue, reviewer 승인, publish, PageIndex reload 흐름을 거쳐 공식 corpus로 편입되게 만들었습니다."
  - "FastAPI API, Next.js Web, PageIndex RAG, Space 협업, Voice meeting, AWS 배포 계약까지 하나의 엔터프라이즈 AI 제품 구조로 묶었습니다."
order: 10
draft: false
---

<section class="harmony-lead-panel">
  <span class="harmony-kicker">Service Thesis</span>
  <p><strong>Harmony는 사내 문서를 검색해 답하는 RAG가 아니라, 사용자의 업무 맥락과 권한을 들고 행동하는 Harmony Agent 시스템입니다.</strong></p>
  <p>이 프로젝트에서 중요한 단위는 "모델이 한 번 답변했다"가 아니라 "누가, 어떤 세션에서, 어떤 권한으로, 어떤 지식과 도구를 사용했고, 그 결과가 어떻게 기록되었는가"입니다. 그래서 Harmony는 채팅, 지식 관리, Space 협업, 회의 보조, 승인 큐, 감사 로그, AWS 배포 계약을 하나의 agent turn lifecycle로 묶었습니다.</p>
</section>

## 프로젝트를 다시 정의하면

Harmony는 사내 AI가 실제 업무 환경에서 쓰이기 위해 필요한 조건을 제품 구조로 구현한 프로젝트입니다. 일반적인 챗봇이나 단일 RAG 데모는 질문을 받고 문서를 찾아 답하는 데 집중합니다. 하지만 사내에서는 그것만으로 부족합니다. 같은 질문이라도 개발팀 시니어, 관리팀 임원, 외부 협업 guest가 볼 수 있는 자료가 다르고, 회의 중 만들어진 산출물이 어느 Space에 귀속되는지도 중요하며, AI가 새 문서를 "공식 지식"처럼 퍼뜨리기 전에 사람이 검토해야 합니다.

Harmony는 이 문제를 Harmony Agent 중심으로 풀었습니다. Agent는 사용자에게 보이는 답변 텍스트만 만드는 것이 아니라, `UserContext`, `Session`, persona overlay, permission-aware retrieval, tool trace, citation, approval, audit payload를 함께 들고 한 turn을 실행합니다. 즉 Harmony의 핵심은 모델 공급자나 프롬프트가 아니라 **사내 AI가 지켜야 하는 실행 경계**입니다.

소스 구조를 기준으로 보면 프로젝트는 크게 여섯 영역으로 나뉩니다. `core/`는 agent runtime 계약과 도구 실행 경계를 담당하고, `identity/`와 `personas/`는 사용자의 4D 업무 맥락을 복원합니다. `rag/`와 `compiler/`는 PageIndex 기반 검색과 human-gated 지식 편입 흐름을 담당합니다. `api/`는 채팅, 세션, Space, 지식, 승인, 음성 API를 제공하고, `web/`은 Next.js UI로 이를 노출합니다. `deploy/`는 AWS에서 이 구조를 Fargate, Cognito, Aurora PostgreSQL, S3, EFS, Bedrock Runtime, Step Functions로 배치하는 계약을 담습니다.

<div class="harmony-fact-grid">
  <div class="harmony-fact">
    <strong>문제</strong>
    <p>사내 AI는 답변 정확도만으로는 부족합니다. 권한, 출처, 승인, 회의 맥락, 사용자별 표현 수준까지 함께 관리되어야 합니다.</p>
  </div>
  <div class="harmony-fact">
    <strong>접근</strong>
    <p>모든 채팅과 회의 요청을 Harmony Agent turn으로 통일하고, 검색과 도구 호출 전에 현재 사용자와 세션 범위를 고정했습니다.</p>
  </div>
  <div class="harmony-fact">
    <strong>결과</strong>
    <p>개인 채팅, Space 협업, 지식 승인, 회의 보조, AWS 배포까지 같은 runtime contract 위에서 설명 가능한 구조가 되었습니다.</p>
  </div>
</div>

## 서비스 관점에서 본 Harmony

서비스 표면은 크게 다섯 가지입니다. 첫째, 사용자는 채팅에서 개인 업무 질문을 던지고, Harmony Agent는 현재 사용자의 팀, 직급, 직무, 연차, permission tag에 맞는 자료만 검색합니다. 둘째, Knowledge 화면에서는 개인 자료를 올리거나, 사내 공식 지식으로 제출하거나, 접근 가능한 공유 자료를 확인하고, 관리자라면 review queue를 처리할 수 있습니다. 셋째, Space는 여러 사람이 같은 업무 맥락을 공유하는 경계입니다. Space owner, member, guest 역할에 따라 공유 채팅 생성, 지식 정책 관리, 회의 산출물 접근 범위가 달라집니다. 넷째, Voice meeting은 회의 중 transcript와 자료 조사, 회의 후 artifact 생성을 담당합니다. 다섯째, Admin/Operations 표면은 approval, usage, tool visibility, audit 흐름을 운영 관점에서 확인하게 합니다.

이 다섯 표면은 따로 붙인 기능 묶음이 아닙니다. 모두 `Session`과 `UserContext`를 통해 Harmony Agent runtime으로 들어갑니다. 사용자가 개인 채팅에서 묻는 경우와 Space 채팅에서 묻는 경우, 같은 질문이라도 검색 후보가 다릅니다. 개인 자료는 기본적으로 owner-only이고, Space에 명시적으로 공유되지 않으면 다른 멤버의 검색 후보가 되지 않습니다. 회의 transcript와 post-meeting artifacts도 Space에 링크되어야 이후 공유 맥락에서 검색됩니다.

그래서 Harmony의 서비스 방향은 "사내 문서를 많이 넣으면 답이 좋아진다"가 아닙니다. 오히려 "자료가 들어오는 순간부터, 누구에게 언제 보여도 되는지, 사람이 승인했는지, 답변 근거로 남길 수 있는지"를 관리합니다. 이 점이 프로젝트의 가장 큰 차별점입니다.

<figure class="harmony-diagram">
  <img src="/images/projects/harmony-agent-runtime.svg" alt="Harmony Agent runtime architecture diagram">
  <figcaption>Harmony Agent Runtime 구성도. Web, Space, Voice 요청은 FastAPI에서 UserContext와 Session으로 정규화되고, Harmony Agent가 persona, tool context, citation, audit 정보를 하나의 turn 결과로 남깁니다.</figcaption>
</figure>

## Harmony Agent Runtime

Harmony Agent의 실행 경계는 `IAIAgent` 프로토콜입니다. 이 프로토콜은 `run_turn`과 `stream_turn`을 제공하고, 입력으로 user message, `UserContext`, `Session`을 받습니다. 출력은 단순 텍스트가 아니라 `TurnResult`입니다. 여기에는 답변 텍스트, tool calls, citations, persona key, model, usage, latency가 들어갑니다. 스트리밍 경로에서는 `turn.start`, `token`, `tool.call.start`, `tool.call.end`, `citation`, `turn.end`, `approval.required`, `approval.decided` 같은 이벤트가 흘러 UI와 audit에 같은 사실을 남깁니다.

이 구조가 중요한 이유는 provider 교체보다 더 큽니다. 사내 agent는 "어떤 모델이 답했는가"보다 "현재 사용자의 권한과 세션 범위가 끝까지 유지되었는가"가 더 중요합니다. Harmony는 agent adapter가 달라져도 `Session`, `UserContext`, citation, tool trace의 모양이 유지되게 했습니다. 로컬 실행에서는 local runtime adapter가 같은 계약을 구현하고, AWS 경로에서는 Bedrock Runtime Converse 기반 adapter가 같은 계약을 구현합니다. 공개 글에서는 이를 모두 Harmony Agent라고 표현하지만, 코드상 핵심은 provider별 구현보다 그 위에 놓인 agent turn contract입니다.

실제 한 turn은 다음 순서로 움직입니다.

<div class="harmony-flow">
  <span>01 Auth에서 UserContext 복원</span>
  <span>02 Session channel 판별</span>
  <span>03 Persona prompt 합성</span>
  <span>04 Tool context 고정</span>
  <span>05 답변, 근거, 감사 기록 저장</span>
</div>

API는 인증 헤더나 local auth에서 사용자 정보를 읽어 `UserContext`를 만듭니다. 여기에는 `user_id`, email, display name, company, department, job, team, rank, role, tenure, permission tags, preferred AI model이 포함됩니다. 그다음 `personas` 모듈이 팀, 직급, 직무, 연차, 사용자 메모리를 합쳐 persona prompt를 만듭니다. 이 prompt는 단순 캐릭터 설정이 아니라, 사용자의 업무 깊이와 표현 수준을 조절하는 runtime overlay입니다.

그 후 `tool_context`가 현재 사용자와 세션을 ContextVar로 고정합니다. 이 설계 덕분에 process-singleton tool registry를 쓰더라도, 도구 handler는 현재 요청자의 user/session scope를 읽을 수 있습니다. Agent가 `knowledge_search`를 여러 번 호출하거나 skill을 등록하더라도 검색과 도구 실행은 최초 요청자의 권한을 기준으로 평가됩니다. 고위험 동작은 approval gate를 통과해야 하고, 답변 근거와 tool trace는 UI와 audit writer에 남습니다.

## 기능 단위와 실제 구현 표면

<div class="harmony-feature-grid">
  <div class="harmony-feature-card">
    <h3>Chat and Streaming</h3>
    <p>동기 `/chat`, 비동기 job, SSE streaming을 모두 제공하며, tool trace와 citation 이벤트를 UI가 실시간으로 받을 수 있게 구성했습니다.</p>
  </div>
  <div class="harmony-feature-card">
    <h3>Identity and Persona</h3>
    <p>team, rank, role, tenure, permission tag를 `UserContext`로 복원하고, 직급/팀/직무/연차 overlay를 합성해 사용자별 답변 깊이를 조절합니다.</p>
  </div>
  <div class="harmony-feature-card">
    <h3>Knowledge Plane</h3>
    <p>공유 corpus, owner-only personal docs, Space-shared personal source, meeting artifacts를 PageIndex 기반 검색 전에 권한 기준으로 합성합니다.</p>
  </div>
  <div class="harmony-feature-card">
    <h3>Human Review Queue</h3>
    <p>새 문서는 compiler가 초안을 만들지만, reviewer가 approve/publish하기 전에는 공식 corpus가 되지 않도록 흐름을 분리했습니다.</p>
  </div>
  <div class="harmony-feature-card">
    <h3>Spaces</h3>
    <p>owner/member/guest 역할, Space session, Space knowledge policy, meeting link를 통해 협업 단위의 검색 범위를 별도로 관리합니다.</p>
  </div>
  <div class="harmony-feature-card">
    <h3>Voice Meeting</h3>
    <p>회의 transcript, wake/research intent, 진행상황 SSE, post-meeting pipeline을 통해 회의 중 도움과 회의 후 지식화를 연결합니다.</p>
  </div>
  <div class="harmony-feature-card">
    <h3>Skills and MCP</h3>
    <p>personal, team, shared skill 계층과 사용자 MCP 서버 등록 API를 제공해 Agent가 조직별 실행 능력을 확장할 수 있게 했습니다.</p>
  </div>
  <div class="harmony-feature-card">
    <h3>Operations and Deploy</h3>
    <p>audit writer, usage API, approval store, local SQLite, cloud PostgreSQL, S3/EFS/PageIndex/AWS Bedrock 경로를 같은 설정 체계로 묶었습니다.</p>
  </div>
</div>

## 지식은 어떻게 들어오고 검증되는가

Harmony에서 가장 조심스럽게 다룬 부분은 지식 편입 과정입니다. 사용자가 문서를 업로드했다고 해서 그 문서가 곧바로 사내 공식 지식이 되면 안 됩니다. 사내 문서에는 민감정보, 임시 초안, 라이선스가 애매한 외부 자료, 부서 한정 자료, 만료된 정책이 섞일 수 있습니다. 그래서 Harmony는 "업로드"와 "검색 가능한 공식 지식" 사이에 compiler와 review queue를 둡니다.

LLM-Wiki Compiler는 raw source를 받아 ingest, sanitize, classify, draft 단계를 거칩니다. ingest는 markdown, text, docx, pdf를 내부 RawSource 형태로 정규화합니다. sanitize는 이메일, 전화번호, 주민번호 유사 패턴, token, license 위험을 탐지하고 redaction 후보를 만듭니다. classify는 team, permission tag, classification, owner, expiry 같은 frontmatter 후보를 제안합니다. draft는 사람이 검토할 수 있는 문서 본문과 제목을 만듭니다.

하지만 여기서 끝나지 않습니다. compiler output은 `PENDING` review item으로 저장됩니다. 관리자는 Knowledge admin queue에서 preview를 보고 approve, reject, publish를 결정합니다. publish가 일어나야만 corpus에 markdown이 쓰이고 retrieval engine reload가 호출됩니다. 즉 AI는 지식화 후보를 빠르게 만들지만, 조직 지식의 최종 반영은 사람이 결정합니다. 이 구조가 없으면 사내 AI는 편해지는 만큼 위험해집니다. Harmony는 그 위험을 제품 기능으로 정면에서 다뤘습니다.

<figure class="harmony-diagram">
  <img src="/images/projects/harmony-knowledge-loop.svg" alt="Harmony human-gated knowledge loop diagram">
  <figcaption>Human-gated knowledge loop. 문서와 회의 산출물은 compiler, review queue, approval/publish, PageIndex reload를 거쳐야 Harmony Agent의 공식 근거가 됩니다.</figcaption>
</figure>

## 권한형 RAG와 Space 검색 경계

Harmony의 RAG는 "검색하고 나서 권한을 가리는" 방식이 아니라, 검색 후보를 만들기 전에 권한을 계산합니다. 문서 권한은 frontmatter와 디렉터리 기본값에서 합성되고, 기본 classification은 안전하게 confidential 쪽으로 기울어 있습니다. 만료된 문서는 제외되고, meeting source는 participant ACL이 없으면 검색되지 않습니다. public, team, permission tag, participant user/email 조건을 모두 통과해야 검색 후보가 됩니다.

개인 채팅과 Space 채팅의 차이도 코드에서 분명하게 나뉩니다. 개인 채팅은 현재 사용자가 접근 가능한 shared corpus와 본인의 personal uploads를 합칩니다. Space 채팅은 `Session.channel = "space:<space_id>"`를 기준으로 Space 멤버가 접근 가능한 shared corpus, Space policy에서 명시적으로 공유된 personal source, 연결된 meeting artifacts만 합칩니다. 사용자가 자기 개인 문서를 가지고 있어도 Space 전체에 자동 공개되지 않습니다. guest는 읽기 중심으로 제한되고, owner/member만 Space 정책을 조정할 수 있습니다.

이 구조는 회의 기능과도 연결됩니다. 회의 transcript와 post-meeting artifact는 단순 로그가 아니라 Space와 연결될 수 있는 지식 후보입니다. 회의가 끝난 뒤 summary, task list, automation result, member persona minutes가 생성되고, 해당 meeting result가 Space에 링크되면 이후 Space 검색 범위의 일부가 됩니다. 하지만 이 역시 Space role과 policy를 통과해야 합니다.

<figure class="harmony-diagram">
  <img src="/images/projects/harmony-scope-map.svg" alt="Harmony session scoped retrieval map">
  <figcaption>Session-scoped retrieval map. 개인 채팅, Space 채팅, Voice meeting은 같은 Harmony Agent로 들어가지만, 검색 후보를 합성하는 방식은 session channel과 Space policy에 따라 달라집니다.</figcaption>
</figure>

## 회의에 참여하는 Harmony Agent

Voice meeting은 이 프로젝트에서 단순 음성 입출력 기능이 아닙니다. 회의는 사내 지식이 가장 많이 생기지만, 동시에 가장 쉽게 사라지는 장소입니다. Harmony는 회의 중 발화를 transcript로 쌓고, 회의 중간에 사용자가 자료 조사를 요청하면 최근 회의 맥락을 읽어 내부 지식과 외부 검색 후보를 구성합니다. 회의가 끝나면 post-meeting pipeline이 실행되어 요약, 할 일, 자동화 로그, 사람별/페르소나별 회의록을 만듭니다.

구현상 VoiceSession은 transport와 분리되어 있습니다. WebSocket, browser mic, STT provider가 무엇이든 `feed_transcript`, `feed_audio_frame`, `request_research`, `request_end` 같은 메서드로 lifecycle을 drive할 수 있습니다. 이 덕분에 wake keyword, transcript append, research mode, closing handoff, post-meeting handler를 단위 테스트로 검증할 수 있습니다. 사용자는 우측 meeting panel에서 회의 시작/종료, live transcript, 진행상황, 자료조사 popup, 지난 회의 기록을 볼 수 있습니다.

ResearchOrchestrator는 최근 회의 발화를 읽어 조사 후보를 만들고, 내부 knowledge search와 외부 web search provider를 병렬로 호출할 수 있는 구조입니다. 내부 검색은 agent ReAct 루프를 거치지 않고 `knowledge_search` handler를 직접 호출해 latency를 줄입니다. 어느 한쪽 검색이 실패해도 다른 결과로 답할 수 있게 설계했습니다. 회의 중 답변은 TTS 친화적인 짧은 문장으로 요약되고, citation은 별도 필드로 남습니다.

## Web 제품 표면

Next.js frontend는 단순 데모 페이지가 아니라 운영자가 실제 흐름을 볼 수 있는 화면들로 구성되어 있습니다. `/chat`은 새 session을 만들고, Space scope를 선택한 경우 Space session을 생성한 뒤 같은 화면에서 initial prompt를 시작합니다. ChatThread는 SSE event를 받아 token, tool progress, citation, approval state를 반영합니다. `/knowledge`는 overview, 접근 가능 자료, 내 자료, 사내 제출, skills, MCP, admin queue를 segmented control로 전환합니다. `/spaces`는 Space 생성, 멤버 관리, 지식 정책, 회의록, 다중 모드 실행을 다룹니다. `/personas`는 4D persona matrix와 현재 사용자 soul preview를 보여줍니다. `/voice`는 회의 panel을 열어 live meeting 기능을 계속 사용할 수 있게 합니다.

이 UI는 backend 기능을 단순히 노출하는 데서 끝나지 않습니다. 사용자가 현재 어떤 scope에서 대화하고 있는지, 어떤 지식이 접근 가능한지, 어떤 자료가 개인 자료인지 shared corpus인지, 어떤 item이 admin approval을 기다리는지를 표면화합니다. 사내 AI 제품에서 중요한 것은 "모델이 안쪽에서 뭘 했는지"를 사용자가 어느 정도 볼 수 있게 하는 것입니다. Harmony의 citation card, progress timeline, approval banner, knowledge overview는 그 목적을 위해 존재합니다.

## AWS 배포 설계

Harmony의 AWS 배포 설계는 FastAPI agent container를 ECS Fargate에 올리고, 모델 호출은 Bedrock Runtime으로 보내는 구조입니다. 여기서 `agent_core`는 Terraform/OpenTofu 모듈 이름이며, Amazon Bedrock AgentCore Runtime에 agent를 배포한다는 뜻이 아닙니다. 중요한 점은 "agent runtime contract는 애플리케이션이 소유하고, AWS는 인증, 네트워크, 컴퓨트, 저장소, 모델 호출, 운영 관측을 제공한다"는 경계입니다.

표준 배포 그래프는 CloudFront 정적 frontend, WAF, API Gateway, Cognito, internal ALB, ECS Fargate Agent, ECS Builder, Lambda compiler stages, Step Functions, Aurora PostgreSQL, EFS PageIndex storage, S3 corpus/audit bucket, Secrets Manager, Bedrock Runtime, Transcribe/Polly, CloudWatch로 구성됩니다. local 개발에서는 SQLite와 파일 기반 corpus를 쓰고, AWS에서는 Aurora PostgreSQL, S3, EFS, Bedrock Runtime을 사용합니다. 이때 PageIndex는 EFS에 저장되어 Agent task는 읽고 Builder task는 새 index를 발행하는 구조입니다.

배포 문서에는 minimum stack도 별도로 정리되어 있습니다. networking, audit, ecr, database, storage_efs, identity, agent_core, compiler 여덟 모듈만으로도 `/v1/chat` 한 턴과 빈 PageIndex manifest 발행까지 검증할 수 있게 설계했습니다. 그 위에 channels, frontend, observability, backup, security를 단계적으로 붙입니다. 다만 이 프로젝트 소개에서는 실제 AWS 운영 완료를 과장하지 않고, 저장소에 구현된 AWS-native deployment contract와 local/runtime proof를 기준으로 설명합니다.

## 테스트와 검증 관점

이 프로젝트는 기능 영역별 테스트가 넓게 잡혀 있습니다. agent runtime은 Bedrock adapter, local runtime adapter, tool context trace, approval/session goal 테스트가 있고, knowledge plane은 PageIndex builder/retrieval, permissions, personal corpus, citations, session scoped retrieval 테스트가 있습니다. compiler는 loaders, sanitize, raw layer, review queue, decay, meeting path를 검증합니다. API는 auth, personas, spaces, me knowledge, me skills, me MCP, admin knowledge, usage, health/ready 경로를 검증합니다. Voice는 state machine, wake word, intent router, speaker mapper, research orchestrator, progress bus, provider factory, refined STT, meeting pipeline phase filter를 다룹니다.

테스트의 방향도 프로젝트의 성격과 맞습니다. 단순히 "응답이 나온다"를 보는 것이 아니라, 권한 경계가 맞는지, Space session이 검색 범위를 제대로 좁히는지, reviewer 승인 전 지식이 publish되지 않는지, tool trace가 기록되는지, Voice lifecycle이 transport와 분리되어 검증 가능한지를 확인합니다.

## 내가 이 프로젝트에서 잡은 핵심

제가 이 프로젝트에서 집중한 것은 기능을 더 많이 붙이는 일이 아니라, 사내 AI가 제품으로 성립하기 위한 경계를 코드로 만드는 일이었습니다. Harmony Agent가 매 turn마다 사용자 identity, session scope, persona, tool context를 함께 들고 실행되게 만들고, 지식은 compiler와 사람 승인을 통과해야만 공식 corpus가 되게 만들고, Space 협업에서는 개인 자료와 공유 자료와 회의 산출물이 섞여도 권한이 흐트러지지 않게 구성했습니다.

이 프로젝트를 "RAG 만들었다"로 줄이면 핵심을 놓칩니다. Harmony는 사내 지식을 검색하는 기능을 넘어, 지식이 들어오는 길, 흘러가는 길, 답변 근거로 나가는 길을 모두 통제하려는 시스템입니다. 사용자의 업무 맥락을 이해하고, 허용된 자료만 보고, 필요한 도구를 실행하고, 그 근거를 남기고, 새 지식은 사람 승인 뒤에만 조직 지식으로 편입합니다. 이 네 가지가 Harmony의 서비스 소개이자 기술 소개입니다.
