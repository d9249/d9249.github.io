---
title: "Harmony — 안전한 사내 AI 지식 시스템"
projectName: "Harmony"
tagline: "권한·승인·인용이 계약으로 강제되는 엔터프라이즈 AI 에이전트"
period: "AsianaIDT / 2026.05.11 - 2026.05.22"
periodOrder: 20260522
description: "에이전트 런타임을 프로토콜 계약으로 추상화하고, 검색을 에이전트 주도 멀티홉으로 전환해 검색 후보와 인용을 분리하며, AI가 만든 지식은 사람 승인을 거쳐야만 공식 corpus가 되는 human-gated 사내 AI 시스템입니다. 해커톤 2주 개발."
metrics:
  - "해커톤 2주 · 사내 에이전트 플랫폼"
  - "Human-gated 지식 승인 루프"
  - "Agentic 멀티홉 검색 (최대 6회)"
stack:
  - "Python"
  - "FastAPI"
  - "Next.js"
  - "AWS Bedrock"
  - "PageIndex"
  - "SQLAlchemy"
  - "OpenTofu"
details:
  - "run_turn/stream_turn을 정의한 IAIAgent 프로토콜로 에이전트 런타임을 계약화하고, 로컬·Bedrock·stub 3개 구현을 같은 계약 아래 교체 가능하게 만들었습니다."
  - "프리페치 RAG를 에이전트 주도 검색으로 전환해, 검색 후보(tool trace)와 실제 인용(citations)을 분리하고 멀티홉(최대 6회) 검색을 가능하게 했습니다."
  - "LLM-Wiki Compiler가 만든 지식 초안은 review queue에서 사람이 승인·발행해야만 검색 corpus에 편입되는 human-gated loop를 설계했습니다."
order: 10
draft: false
---

<section class="harmony-lead-panel">
  <span class="harmony-kicker">핵심 개발 · 해커톤 2주 (2026.05.11 – 05.22)</span>
  <p><strong>사내 AI의 어려움은 답변 생성이 아니라 경계입니다 — 누가, 어떤 권한으로, 어떤 지식을 보고, 그 근거가 어떻게 남는가. Harmony는 이 경계를 문서 규칙이 아니라 코드 계약으로 강제한 시스템입니다.</strong></p>
  <p>이 글은 2주 해커톤에서 내린 네 가지 설계 결정을 다룹니다. ① 에이전트 런타임을 프로토콜로 계약화한 이유, ② 프리페치 RAG를 버리고 에이전트 주도 검색으로 간 이유(검색 후보와 인용의 분리), ③ 벡터 인덱스 대신 PageIndex를 택한 트레이드오프, ④ AI가 만든 지식에 사람 게이트를 세운 방법.</p>
</section>

<figure class="harmony-diagram">
  <img src="/images/projects/harmony-overall-architecture.svg" alt="Harmony overall architecture diagram">
  <figcaption>전체 구조. 채널, IAIAgent 런타임 계약, 에이전트 주도 검색, human-gated knowledge loop, 배포·감사 경계가 한 턴 계약으로 연결됩니다.</figcaption>
</figure>

## 딥다이브 ① 에이전트 런타임을 계약으로 — IAIAgent 프로토콜

에이전트 구현체는 바뀝니다. 로컬 개발과 시연에서는 자체 런타임을, AWS 운영에서는 Bedrock Runtime Converse를 씁니다. 바뀌면 안 되는 것은 **한 턴이 남겨야 하는 사실의 모양**입니다.

그래서 런타임 경계를 `IAIAgent` 프로토콜로 고정했습니다. `run_turn`/`stream_turn`은 user message, UserContext, Session을 받고, 반환은 텍스트가 아니라 **TurnResult** — 답변, tool calls(질의·결과·소요시간), citations, persona key, model, usage, latency — 입니다. 스트리밍 경로는 `turn.start / token / tool.call.start / tool.call.end / citation / approval.required / approval.decided / turn.end` 이벤트를 흘려, UI와 감사 로그가 같은 사실을 봅니다.

구현은 3개입니다. 로컬 런타임 어댑터(개발·제어된 시연), Bedrock 어댑터(운영), 그리고 stub. 의도적으로 **폴백을 두지 않았습니다** — 로컬 런타임이 없으면, Bedrock 설정이 없으면 즉시 명시적 에러로 실패합니다(fail-fast). 사내 시스템에서 "조용히 다른 구현으로 대체"는 권한·감사 관점에서 버그이기 때문입니다. 멀티프로세스 환경에서 현재 요청자의 user/session은 ContextVar로 고정되어, process-singleton 도구 레지스트리를 쓰더라도 모든 도구 호출이 최초 요청자의 권한으로 평가됩니다.

## 딥다이브 ② 검색 후보와 인용의 분리 — 프리페치 RAG를 버리다

초기 구조는 흔한 프리페치 RAG였습니다: 사용자 메시지가 오면 시스템이 한 번 검색(k=5)하고, 결과 전체를 system prompt에 넣고, 에이전트가 답합니다. 이 구조의 문제는 두 겹입니다. 에이전트가 "더 찾아야 하는지"를 결정할 수 없고(1-hop 고정), **프롬프트에 들어간 모든 chunk가 곧 인용처럼 취급**되어 실제로 답변에 쓰이지 않은 문서까지 근거로 표시됐습니다.

전환한 구조는 에이전트 주도 검색입니다. 시스템은 가속용 힌트(k=1)만 미리 넣고, `knowledge_search`를 도구로 노출합니다. 에이전트가 검색 필요를 판단해 도구를 호출하면 그 질의·결과·소요시간이 **tool trace**에 누적되고, 부족하면 재검색합니다(멀티홉, 최대 6회). 최종 **citations는 trace에서 실제 인용된 소스만** 추립니다.

이 분리가 준 것은 세 가지입니다. 인용 정합성 — UI가 "본 것"과 "쓴 것"을 구별해 표시할 수 있고, 멀티홉 — 첫 검색이 빗나가도 에이전트가 질의를 바꿔 재시도하며, 비용 통제 — 충분하면 추가 검색을 하지 않습니다. 검색 품질 문제로 보였던 것이 실은 **책임 소재 문제**(검색을 누가 결정하는가)였다는 것이 이 트러블슈팅의 결론입니다.

<figure class="harmony-diagram">
  <img src="/images/projects/harmony-deepdive-agentic-retrieval.svg" alt="Harmony agentic retrieval candidate and citation separation diagram">
  <figcaption>에이전트 주도 검색 구조. 검색 후보(tool trace)와 실제 인용(citations)을 분리하고, 필요할 때만 멀티홉 재검색으로 확장합니다.</figcaption>
</figure>

## 딥다이브 ③ PageIndex — 벡터 인덱스 없는 검색의 트레이드오프

검색 백엔드로는 임베딩 벡터 스토어 대신 **PageIndex** 방식(reasoning-based retrieval)을 택했습니다. 문서를 chapter→section 계층 트리로 변환해 두고, 질의 시 LLM이 트리를 탐색하며 관련 노드를 고르는 구조입니다 — 사람이 목차를 보고 찾아가는 방식에 가깝습니다.

트레이드오프는 명확합니다. 임베딩 인덱스(OpenSearch/Bedrock KB 경로)는 인프라 비용이 상시 발생하는 반면(당시 산정 월 수백 달러 규모), PageIndex는 트리 생성을 ingest 시 1회만 수행해 S3에 저장하고, 질의마다 소형 모델 호출 1–2회의 비용만 듭니다. 2주 해커톤과 사내 규모 corpus라는 조건에서는 검색 지연을 조금 내주고 인프라 비용과 운영 복잡도를 크게 줄이는 쪽이 옳았습니다. 권한은 검색 후보 생성 전에 계산됩니다 — 세션 채널(개인/Space/회의)과 사용자의 팀·permission tag 기준으로 corpus를 먼저 좁힌 뒤 트리 탐색이 시작되므로, 다른 팀 자료는 후보 단계에서부터 존재하지 않습니다.

## 딥다이브 ④ Human-gated Knowledge Loop — AI가 만든 지식에 게이트 세우기

문서 업로드가 곧 "공식 지식"이 되면 사내 AI는 편해지는 만큼 위험해집니다. 민감정보, 임시 초안, 만료된 정책이 corpus에 스며들기 때문입니다. Harmony는 업로드와 공식 지식 사이에 **컴파일러와 승인 큐**를 둡니다.

LLM-Wiki Compiler는 raw source를 ingest(포맷 정규화) → sanitize(이메일·전화번호·토큰·라이선스 위험 탐지와 redaction 후보) → classify(팀·permission tag·만료일 frontmatter 제안) → draft(검토 가능한 초안) 단계로 처리합니다. 결과는 곧바로 발행되지 않고 `PENDING` 리뷰 아이템이 됩니다. 리뷰어가 승인·발행해야만 corpus에 쓰이고 검색 인덱스가 리로드됩니다.

같은 원리를 실행 시점에도 적용했습니다 — **approval gate**입니다. 턴 시작 전에 고위험 요청(외부 웹 검색, 서브에이전트 실행 등)을 감지하면 승인 레코드를 만들고 SSE `approval.required` 이벤트를 발행합니다. 관리자가 큐에서 승인/거절하면 `approval.decided` 이벤트로 사용자 흐름이 재개되거나 중단됩니다. 권한 태그에 따라 자동 승인 우회가 있어 임원·관리자 흐름은 막히지 않습니다. 처음에는 승인 저장소만 있고 채팅과 연결되지 않은 scaffold 상태였는데, 턴 전 감지 → SSE → 결정 UI를 end-to-end로 배선한 것이 실제 작동하는 게이트를 만들었습니다.

<figure class="harmony-diagram">
  <img src="/images/projects/harmony-deepdive-gated-knowledge.svg" alt="Harmony human-gated knowledge and approval gate diagram">
  <figcaption>발행 게이트와 실행 게이트. 지식은 승인 후에만 corpus로 들어가고, 고위험 요청은 턴 시작 전 승인 이벤트로 분기됩니다.</figcaption>
</figure>

## 4×6 페르소나와 3중 방어선

사용자 맥락은 4팀(business/development/infra/management) × 6직급 매트릭스로 모델링됩니다. 페르소나는 캐릭터 설정이 아니라 합성 함수입니다 — 직급 기반 표현 수준 + 팀 오버레이 + 직무 오버레이 + 연차 조정 + 사용자 메모리를 합쳐 턴마다 system prompt에 주입됩니다. 같은 질문에 주니어 개발자와 임원이 다른 깊이의 답을 받는 것이 의도된 동작입니다.

격리는 세 겹입니다. **1선** JWT 인증(미인증 차단) → **2선** 페르소나 합성 시 팀 컨텍스트 주입 → **3선** 검색 엔진의 팀 기반 corpus 필터. 어느 한 층이 뚫려도 다른 층이 잡도록, 권한 검사를 한 곳에 몰지 않았습니다.

## 시스템 표면과 배포

이 계약 위에 제품 표면이 올라갑니다 — 개인/Space 채팅(SSE 스트리밍, tool trace·citation·approval 표시), Knowledge 화면(개인 자료·사내 제출·리뷰 큐), Space 협업(owner/member/guest 정책), Voice meeting(transcript, 회의 중 자료조사, 회의 후 요약·할일·회의록 생성), 운영 화면(승인 큐·사용량·감사). 배포는 OpenTofu 모듈로 CloudFront + API Gateway + Cognito + ECS Fargate + Aurora PostgreSQL + EFS(PageIndex) + S3(corpus/audit) + Bedrock Runtime 구조를 계약으로 정의했고, 최소 8개 모듈만으로 한 턴 실행을 검증할 수 있게 단계화했습니다. 로컬은 SQLite + 파일 corpus로 같은 코드가 돌아갑니다.

테스트도 같은 방향입니다 — "응답이 나온다"가 아니라 권한 경계가 지켜지는지, Space 세션이 검색 범위를 좁히는지, 승인 전 지식이 발행되지 않는지, tool trace가 기록되는지를 검증합니다.

## 정리

2주라는 제약에서 내린 선택들은 하나의 원칙으로 수렴합니다 — **경계를 코드 계약으로 만들 것.** 런타임은 프로토콜로(구현 교체가 감사 형식을 바꾸지 못하게), 검색은 에이전트 주도로(본 것과 인용한 것이 분리되게), 지식 편입은 사람 게이트로(AI의 속도와 조직의 신뢰가 충돌하지 않게), 권한은 3중으로(한 층의 실수가 사고가 되지 않게). 사내 AI 시스템의 설계 문제를 가장 압축적으로 연습한 프로젝트였습니다.
