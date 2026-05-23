---
title: "Harmony — 안전한 사내 AI 지식 시스템"
period: "AsianaIDT / 2026.05.11 - 2026.05.22"
description: "자동으로 문서를 넣고 답하는 RAG를, 승인·권한·페르소나가 끝까지 추적되는 멀티테넌트 AI 지식 시스템으로 재설계했습니다."
metrics:
  - "LLM-Wiki Compiler"
  - "Space-scoped RAG"
  - "Hermes / Bedrock runtime"
stack:
  - "Python"
  - "FastAPI"
  - "Next.js"
  - "Hermes Agent"
  - "AWS Bedrock"
  - "PageIndex"
  - "SQLAlchemy"
  - "OpenTofu"
details:
  - "FastAPI의 IAIAgent 경계를 기준으로 로컬 Hermes Agent와 AWS Bedrock Converse 런타임을 같은 Session/UserContext 계약에서 실행하도록 구성했습니다."
  - "문서 유입은 ingest, sanitize, classify, draft, review queue, publish, reload 흐름으로 분리해 AI 제안과 사람 승인을 명확히 나눴습니다."
  - "개인 채팅, Space 채팅, 회의 산출물, 공유 지식을 session channel과 permission metadata 기준으로 합성하는 retrieval boundary를 구현했습니다."
order: 10
draft: false
---

## What It Is

Harmony는 사내 문서를 검색해 답하는 챗봇을 넘어, 문서 유입부터 승인, 권한, 회의 기록, 페르소나, 감사 로그까지 하나의 업무 흐름으로 묶은 엔터프라이즈 AI 지식 시스템입니다.

핵심은 "AI가 사내 지식을 바로 공식화하지 않는다"는 경계입니다. 모델은 문서의 분류, 권한, 만료일, 초안 본문을 제안하지만, 실제 지식 corpus에 반영되는 시점은 review queue에서 사람이 승인한 뒤입니다. 답변 시점에도 사용자의 팀, 직급, 직무, 연차, permission tag, Space 멤버십이 retrieval 범위를 제한합니다.

## Architecture

구현은 Python/FastAPI와 Next.js를 중심으로 나뉩니다. FastAPI는 `/v1/chat`, sessions, spaces, approvals, knowledge, voice API를 제공하고, Next.js 앱은 채팅, 지식 관리, Space, Persona, Voice 회의 화면을 제공합니다.

에이전트 실행은 `IAIAgent` 프로토콜로 고정했습니다. 로컬 개발에서는 Hermes Agent adapter가 같은 계약을 구현하고, AWS 경로에서는 Bedrock Runtime Converse 기반 agent가 같은 `Session`과 `UserContext`를 받아 동작합니다. 덕분에 모델 공급자나 실행 환경이 달라져도 채팅 이력, tool trace, citation, persona key, audit payload의 모양은 유지됩니다.

런타임의 주요 흐름은 다음과 같습니다.

- Client: Next.js Web에서 채팅, Space, 지식, Voice UI를 제공
- API: FastAPI가 auth header 또는 local mock auth에서 4D 사용자 문맥을 복원
- Agent Core: Hermes Agent 또는 Bedrock agent가 같은 turn contract로 실행
- Knowledge Plane: PageIndex 기반 RAG와 personal corpus, Space scoped retrieval을 합성
- Compiler: raw 문서를 sanitize, classify, draft 후 review queue로 보내고 승인 후 corpus에 publish
- Storage: 로컬은 SQLite/파일 기반, AWS 설계는 Aurora PostgreSQL, S3, EFS, CloudFront, ECS Fargate, Cognito, Bedrock Runtime을 사용

## Knowledge Plane

Harmony의 지식 계층은 단순 업로드 폴더가 아니라 생명주기를 가진 compiler pipeline입니다.

1. Ingest: markdown, text, docx, pdf 자료를 `RawSource`로 정규화
2. Sanitize: 외부 이메일, 전화번호, 주민번호 유사 패턴, 토큰, 라이선스 위험을 탐지하고 redaction 후보 생성
3. Classify: 팀, permission tag, classification, owner, expiry 같은 frontmatter 후보 제안
4. Draft: 출처 본문을 사람이 검토 가능한 proposed article로 변환
5. Queue: `PENDING` review item으로 저장
6. Publish: reviewer가 승인한 항목만 corpus에 쓰고 retrieval index를 reload

이 구조에서 LLM은 최종 결정자가 아닙니다. LLM은 tag proposal과 article draft를 만들 뿐이고, 권한 메타데이터가 실제 RAG 대상이 되는 시점은 승인 이후입니다.

## Permission-Aware RAG

검색 권한은 문서 frontmatter와 디렉터리 `_index.yaml` 기본값을 합성해 계산합니다. 명시 권한이 없으면 default deny가 적용되고, meeting source는 참석자 ACL이 없으면 검색되지 않습니다. 공개 문서, 팀 권한, permission tag, participant user/email, 만료일이 모두 retrieval 단계에서 평가됩니다.

개인 채팅과 Space 채팅의 검색 범위도 다릅니다. 개인 채팅은 현재 사용자의 global corpus와 owner-only personal uploads를 합성합니다. Space 채팅은 `Session.channel = "space:<space_id>"`를 기준으로 Space 멤버가 볼 수 있는 shared corpus, 명시적으로 공유된 personal source, 연결된 회의 산출물을 합성합니다. 같은 질문이어도 어떤 Space에서 묻는지에 따라 retrieval 후보가 달라집니다.

## Persona Runtime

Harmony는 페르소나를 16개 고정 프롬프트로 복제하지 않습니다. `UserContext`의 team, rank, role, tenure를 기반으로 다음 overlay를 합성합니다.

- 직급 base: 신입, 주니어, 시니어, 임원에 따라 답변 깊이와 형식 조절
- 팀 overlay: 사업, 개발, 인프라, 관리팀의 관심사와 출처 선호 반영
- 직무 overlay: BE, FE, ML, SRE, PM 등 직무별 판단 기준 반영
- 연차 보정: 사내 용어 설명 수준과 결론 우선 정도 조절
- 누적 메모리: Hermes runtime의 USER/MEMORY/SOUL 계층을 user-specific context로 연결

이 합성 결과는 agent system prompt에 들어가고, 응답 이력에는 persona key가 남습니다. 그래서 "누가 어떤 맥락에서 어떤 자료를 근거로 답을 받았는지"를 audit와 디버깅 단위로 추적할 수 있습니다.

## Spaces And Meetings

Space 기능은 팀 단위 협업을 위한 boundary입니다. owner, member, guest 역할을 분리하고, guest는 공유 채팅 생성이나 multi-mode 실행이 제한됩니다. Space별 knowledge policy는 shared corpus mode, curated key, personal source 공유 여부를 따로 관리합니다.

회의 기능은 VoiceSession과 MeetingPipeline으로 나뉩니다. VoiceSession은 wake word, transcript, in-meeting research, post-meeting handoff를 담당하고, MeetingPipeline은 pre/post phase skill을 순서대로 실행해 summary, task list, automation log, persona별 minutes 같은 artifact를 생성합니다. 생성된 회의 산출물은 Space에 연결되면 이후 Space 검색 범위에 포함됩니다.

## Deployment Design

AWS 배포 설계는 ECS Fargate에 FastAPI agent container를 올리고, 모델 호출은 Bedrock Runtime으로 보내는 구조입니다. 여기서 `agent_core`는 Terraform/OpenTofu 모듈 이름이며, Amazon Bedrock AgentCore Runtime에 agent를 배포한다는 뜻은 아닙니다.

표준 설계는 Cognito, API Gateway, WAF, internal ALB, ECS Fargate, Aurora PostgreSQL, EFS PageIndex storage, S3 corpus/audit bucket, Step Functions compiler, Lambda preprocessors, CloudFront static frontend로 구성됩니다. 다만 현재 프로젝트 소개에서는 실제 AWS 운영 완료가 아니라, 저장소에 구현된 AWS-native deployment contract와 local/runtime proof를 기준으로 설명합니다.

## My Contribution

제가 이 프로젝트에서 맡은 중심 기여는 세 가지입니다.

첫째, 사내 자료가 자동으로 RAG에 편입되지 않도록 LLM-Wiki Compiler와 human review queue의 경계를 정리했습니다. 둘째, personal chat, shared corpus, Space chat, meeting artifact가 섞여도 현재 사용자의 권한과 세션 scope가 유지되도록 retrieval composition을 설계했습니다. 셋째, 팀과 직급별로 답변 품질을 다르게 보는 persona overlay 구조를 구현 가능한 prompt/runtime 계약으로 만들었습니다.

결과적으로 Harmony는 "문서를 넣으면 답하는 RAG"가 아니라, 들어올 때는 승인으로 막고, 흐를 때는 권한으로 제한하고, 나갈 때는 사용자 맥락에 맞추는 사내 AI 지식 시스템입니다.
