---
title: "AIO - Enterprise AI 지식 관리 시스템"
projectName: "AIO"
tagline: "Enterprise AI 지식 관리 시스템"
period: "AsianaIDT / 2025.09 - 2026.01"
description: "문서 업로드, 지식 저장소, Graph + Vector RAG, ACL 권한, LangGraph 기반 Agent Builder를 하나의 운영 콘솔로 묶은 엔터프라이즈 AI 지식 플랫폼입니다."
metrics:
  - "FastAPI 15+ router"
  - "Milvus + Neo4j"
  - "Vue Flow Agent Builder"
stack:
  - "Vue 3"
  - "Vite"
  - "LangGraph"
  - "FastAPI"
  - "Milvus"
  - "Neo4j"
  - "PostgreSQL"
  - "Redis"
  - "Celery"
details:
  - "Vue 3 콘솔에서 문서 저장소, 지식 아카이브, 데이터셋 생성, AI 모델 설정, Agent Graph 편집, Playground 실행을 하나의 워크스페이스로 제공합니다."
  - "FastAPI 서비스 계층은 문서 업로드 세션, 데이터셋 ingestion, Knowledge Graph 검색, Agent 실행, 계정/역할/ACL을 분리된 router와 service로 운영합니다."
  - "Milvus vector collection, Neo4j graph workspace, PostgreSQL metadata, Redis/Celery 비동기 작업을 조합해 대용량 문서 처리와 RAG 질의 흐름을 분리했습니다."
order: 20
draft: false
---

<div class="aio-lead-panel">
  <span class="aio-kicker">Source-based project document</span>
  <p>AIO는 기업 문서를 단순히 올려두는 저장소가 아니라, 문서가 데이터셋이 되고, 데이터셋이 검색 가능한 지식 그래프와 벡터 인덱스로 바뀌며, 그 지식을 Agent Workflow에서 재사용하는 전체 흐름을 제품화한 시스템입니다.</p>
</div>

## 프로젝트를 다시 정의하면

기존 설명은 "Hybrid RAG 플랫폼"이라는 방향은 맞았지만, 실제 소스가 보여주는 제품 범위에 비해 너무 좁았습니다. `/Users/mean/Downloads/AIO`의 백엔드와 프론트엔드를 기준으로 보면 AIO의 핵심은 다음 네 가지를 한 화면 흐름 안에 묶는 데 있습니다.

<div class="aio-feature-grid">
  <div class="aio-feature-card">
    <h3>문서 운영</h3>
    <p>공용/개인 문서 저장소, 폴더 트리, 대용량 chunk upload, 중복 검증, 업로드 진행률 SSE를 제공합니다.</p>
  </div>
  <div class="aio-feature-card">
    <h3>지식화 파이프라인</h3>
    <p>선택한 문서를 dataset ingestion 작업으로 넘기고 Celery worker가 parsing, chunking, indexing을 비동기로 처리합니다.</p>
  </div>
  <div class="aio-feature-card">
    <h3>Graph + Vector RAG</h3>
    <p>Milvus chunk/entity/relationship collection과 Neo4j graph query를 함께 사용해 local, global, hybrid, mix 검색 전략을 지원합니다.</p>
  </div>
  <div class="aio-feature-card">
    <h3>Agent Builder</h3>
    <p>Vue Flow 기반 canvas에서 retrieval, rerank, generation node를 연결하고 LangGraph StateGraph 실행 사양으로 직렬화합니다.</p>
  </div>
</div>

## 서비스 표면

AIO는 별도의 기능 데모 모음이 아니라 하나의 운영 콘솔입니다. 프론트엔드 라우팅을 보면 `/aio/knowledgeArchive`, `/aio/knowledgeArchive/:id/dataset`, `/aio/knowledgeArchive/:id/config`, `/aio/playground`, `/aio/agent/graph`, `/aio/document/public`, `/aio/document/private`, `/aio/setting/account/*`, `/aio/setting/aiModel`이 같은 로그인 세션 위에서 동작합니다.

<div class="aio-diagram">
  <img src="/images/projects/aio-runtime-architecture.svg" alt="AIO runtime architecture" />
</div>

백엔드는 이 화면들을 `main.py`의 FastAPI application에서 `knowl`, `dataset`, `config`, `agent`, `sse`, `roles`, `permissions`, `acl`, `account`, `folder`, `doc`, `ai-model`, `dictionary`, `conversation` router로 나눠 받습니다. 이 분리는 화면 단위와 운영 책임이 거의 일대일로 대응되기 때문에, 프로젝트를 설명할 때 "RAG 엔진"보다 "엔터프라이즈 지식 운영 플랫폼"으로 말하는 편이 정확합니다.

<div class="aio-fact-grid">
  <div class="aio-fact">
    <strong>Frontend</strong>
    <p>Vue 3, Vite, Pinia, Vue Router, Vue Flow, Tailwind 기반 관리 콘솔입니다.</p>
  </div>
  <div class="aio-fact">
    <strong>Backend</strong>
    <p>FastAPI service/DAO/DTO 구조와 JWT permission dependency로 API 경계를 구성합니다.</p>
  </div>
  <div class="aio-fact">
    <strong>Runtime</strong>
    <p>Nginx, PostgreSQL, Redis, Celery, Milvus, Neo4j, Elasticsearch를 docker-compose로 함께 구동합니다.</p>
  </div>
</div>

## 문서가 지식이 되는 경로

문서 처리는 사용자가 파일을 올리는 순간부터 ingestion 작업이 끝날 때까지 긴 비동기 흐름입니다. 프론트엔드의 `uploadApi.js`는 `/doc/upload/begin`으로 업로드 세션을 만들고, 파일을 chunk 단위로 전송하며, `/subscribe/progress/doc/uploads` EventSource로 진행률을 받습니다. 브라우저 쪽에는 IndexedDB 기반 upload queue와 heartbeat cleanup이 있어 새로고침이나 장시간 업로드 상황도 고려합니다.

백엔드의 `DocService`는 session id, chunk id, file hash, size, count, duplication을 검증하고 Celery `finalize_upload_file` 작업으로 최종 파일 병합과 문서 레코드 저장을 처리합니다. 이후 `DatasetService`가 `/dataset/ingestion` 요청을 받아 `DataIngestionTaskProvider`와 `CeleryTaskLauncher`를 통해 dataset ingestion job을 시작합니다. 진행률은 Redis task progress와 `/subscribe/progress/dataset/ingestion` SSE로 다시 화면에 전달됩니다.

<div class="aio-diagram">
  <img src="/images/projects/aio-ingestion-lifecycle.svg" alt="AIO document upload and ingestion lifecycle" />
</div>

이 구조의 장점은 업로드, 문서 메타데이터, dataset ingestion, 검색 인덱싱이 서로 다른 실패 지점과 재시도 단위를 갖는다는 점입니다. 대용량 문서 처리에서 API request 하나에 모든 일을 묶지 않고, 사용자에게는 진행 상태를 계속 보여주면서 worker 계층에서 오래 걸리는 작업을 처리합니다.

## Graph + Vector RAG

AIO의 검색은 "문서를 chunk로 나눠 벡터 검색한다"에서 멈추지 않습니다. `core/kg/milvus_vector_storage.py`는 지식 저장소별로 `{knowl_id}_chunks`, `{knowl_id}_entities`, `{knowl_id}_relationships`, `{knowl_id}_plan2do_chunks` collection을 사용합니다. 특히 Plan2Do chunk에는 `content_vector`, `title_vector`, `domain_vector`, `structure_vector` 같은 다중 벡터 필드가 있어 질의 목적별 검색 신호를 분리할 수 있습니다.

`core/graph/graph_query.py`와 `service/agent_service.py`는 Milvus vector search와 Neo4j graph query를 엮어 local, global, hybrid, mix, naive 검색 모드를 제공합니다. 검색 모드가 분리되어 있으므로 단순 QA, 관계 중심 탐색, 문서 내용 중심 검색, graph context가 필요한 질문을 다른 전략으로 처리할 수 있습니다.

| 검색 계층 | 소스 기준 역할 | 제품 가치 |
| --- | --- | --- |
| Milvus chunks | 문서 chunk와 embedding 검색 | 질문과 의미적으로 가까운 근거 문단을 빠르게 찾습니다. |
| Milvus entities / relationships | entity, relationship vector 검색 | 문서에서 추출한 구조적 단서를 벡터 검색에 포함합니다. |
| Neo4j graph | entity 관계와 graph traversal | 단순 유사도 검색으로 놓치는 연결 관계를 추적합니다. |
| PostgreSQL metadata | knowl, dataset, doc, chunk, answer schema | 권한, 상태, 출처, 이력 같은 운영 데이터를 보존합니다. |

## Agent Workflow Builder

프론트엔드의 `AgentGraphPage.vue`는 Vue Flow canvas를 사용해 agent workflow를 시각적으로 구성합니다. `workflowSerializer.js`는 화면의 node와 edge를 백엔드가 이해하는 JSON spec으로 변환하고, spec 안에는 `layer1`, `layer2`, `layer3`, `metadata`, node data, edge 연결 정보가 포함됩니다.

백엔드에서는 `core/agent/agent_factory.py`가 YAML 또는 JSON spec을 읽어 `LangGraphAgent`를 만들고, `core/agent/graph.py`가 node type을 LangGraph `StateGraph`에 매핑합니다. pre retrieval, retrieval, post retrieval, generation, Plan2Do, data ingestion 계층이 node로 추상화되어 있어, 고정된 RAG chain 하나가 아니라 업무 목적별 agent graph를 구성할 수 있습니다.

<div class="aio-diagram">
  <img src="/images/projects/aio-agent-workflow.svg" alt="AIO agent workflow builder" />
</div>

<div class="aio-flow">
  <div><strong>1. Design</strong><span>Vue Flow canvas에서 node와 edge를 배치합니다.</span></div>
  <div><strong>2. Serialize</strong><span>프론트엔드가 workflow graph를 backend spec으로 변환합니다.</span></div>
  <div><strong>3. Build</strong><span>AgentFactory가 LangGraphAgent와 StateGraph를 생성합니다.</span></div>
  <div><strong>4. Retrieve</strong><span>검색 node가 Milvus, Neo4j, Elasticsearch context를 조합합니다.</span></div>
  <div><strong>5. Stream</strong><span>Agent API가 답변과 conversation state를 화면으로 돌려줍니다.</span></div>
</div>

## 권한과 운영 경계

기업 지식 플랫폼에서 중요한 부분은 "누가 어떤 문서와 지식 저장소를 볼 수 있는가"입니다. AIO는 로그인 시 bcrypt password 검증과 JWT 발급을 수행하고, role/permission/ACL을 별도 schema와 router로 관리합니다. `permission_evaluator.py`에는 READ, WRITE, DELETE, FULL bitmask와 Redis ACL cache가 정의되어 있으며, API dependency에서 현재 사용자의 permission context를 평가합니다.

이 권한 모델은 단순 관리자 기능이 아니라 RAG 품질과 보안에 직접 연결됩니다. 검색 인덱스가 잘 만들어져도 사용자가 접근할 수 없는 문서가 답변 근거에 섞이면 엔터프라이즈 시스템으로 사용할 수 없습니다. AIO는 계정, 역할, 권한, ACL, 공용/개인 문서 저장소를 같은 운영 흐름에서 다루도록 설계되어 있습니다.

## 코드 기준 기술 소스맵

| 영역 | 대표 파일 | 확인한 구현 |
| --- | --- | --- |
| API composition | `AIO-main/main.py` | FastAPI app 생성, CORS, router 등록, RDB 초기화 흐름 |
| 문서 업로드 | `service/doc_service.py`, `router/doc_router.py` | upload begin, chunk upload, finalize task, refer page extraction |
| 데이터셋 ingestion | `service/dataset_service.py`, `router/dataset_router.py` | ingestion task 시작, task status mapping, SSE progress |
| 검색 저장소 | `core/kg/milvus_vector_storage.py` | chunk/entity/relationship/Plan2Do collection과 multi-vector schema |
| Graph query | `core/graph/graph_query.py` | local/global/hybrid/mix 검색 전략과 Neo4j 연동 |
| Agent runtime | `core/agent/agent_factory.py`, `core/agent/graph.py` | JSON/YAML spec 기반 LangGraphAgent 생성과 StateGraph node mapping |
| 권한 | `service/account_service.py`, `core/permission_evaluator.py` | JWT, role permission, ACL bitmask, Redis permission cache |
| 프론트 라우팅 | `AIO-Front-main/src/router/index.js` | knowledge archive, dataset, config, playground, setting, document, agent graph route |
| 업로드 UX | `AIO-Front-main/src/api/uploadApi.js` | chunk upload, EventSource progress, upload background manager |
| Agent 편집 | `AIO-Front-main/src/pages/agent/AgentGraphPage.vue`, `utils/workflowSerializer.js` | Vue Flow graph editing과 backend workflow spec 직렬화 |

## API와 화면별 기능 매트릭스

| 사용자 화면 | 연결 API / 서비스 | 의미 |
| --- | --- | --- |
| Knowledge Archive | `knowl`, `dataset`, `config` | 지식 저장소를 만들고 dataset/config/playground로 확장합니다. |
| Document Storage | `doc`, `folder`, upload SSE | 공용/개인 문서를 업로드하고 폴더 단위로 관리합니다. |
| Dataset Page | `dataset/ingestion`, dataset progress SSE | 문서를 지식화 작업으로 넘기고 indexing 상태를 확인합니다. |
| Playground | `agent`, `conversation` | 지식 저장소와 agent 설정을 실제 질문 답변으로 검증합니다. |
| Agent Graph | `agent`, workflow serializer | 업무 목적별 LangGraph workflow를 시각적으로 구성합니다. |
| Settings | `account`, `roles`, `permissions`, `acl`, `ai-model` | 사용자, 권한, 모델 접속 정보를 운영자가 관리합니다. |

## 검증과 한계

이번 문서는 저장소 소스를 기준으로 다시 작성했습니다. 백엔드는 실제 router/service/core 구현을, 프론트엔드는 route/page/API client를 기준으로 제품 기능을 매핑했습니다. 다만 이 포트폴리오 페이지에서는 보안상 내부 업무 데이터, 실제 운영 데이터, 모델 API key, 고객사별 설정값은 다루지 않았습니다.

결과적으로 AIO는 "문서 기반 RAG"보다 넓은 프로젝트입니다. 문서 저장소, 비동기 ingestion, graph/vector retrieval, agent workflow, ACL 운영이 결합된 엔터프라이즈 AI 지식 관리 시스템이며, 이 페이지는 그 구조를 코드 근거 중심으로 설명하도록 재정리했습니다.
