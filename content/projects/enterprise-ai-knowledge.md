---
title: "AIO - Enterprise AI 지식 관리 시스템"
projectName: "AIO"
tagline: "Graph + Vector Hybrid RAG와 Agent Builder를 갖춘 엔터프라이즈 지식 플랫폼"
period: "AsianaIDT / 2025.10 - 2026.02"
periodOrder: 20260203
description: "기업 문서를 Graph + Vector 이중 인덱스로 지식화하고, 5가지 검색 모드와 RRF 4벡터 융합으로 질의하며, LangGraph 기반 Agent Builder로 워크플로우를 조립하는 엔터프라이즈 AI 지식 플랫폼입니다."
metrics:
  - "5종 DB 오케스트레이션"
  - "RRF 4벡터 융합 (k=60)"
  - "검색 모드 5종"
stack:
  - "FastAPI"
  - "LangGraph"
  - "Milvus"
  - "Neo4j"
  - "PostgreSQL"
  - "Redis"
  - "Elasticsearch"
  - "Vue 3"
  - "Celery"
details:
  - "LightRAG를 Milvus + Neo4j로 재구성해 local/global/hybrid/naive/mix 5개 검색 모드를 한 파이프라인에 통합 → 질의 성격에 따라 벡터·그래프 검색을 골라 쓰는 Hybrid RAG를 구축했습니다."
  - "content/title/domain/structure 4개 벡터 필드를 병렬 검색해 RRF(k=60)로 융합 → 단일 임베딩이 놓치는 제목·도메인·구조 신호까지 반영한 멀티벡터 검색을 구현했습니다."
  - "다중 저장소 삭제 잔존과 동시 연결 초기화 경합을 세션 기반 삭제 파이프라인·asyncio.Lock double-check로 해결 → Graph/Vector 인덱스가 서로 어긋나지 않는 삭제 일관성을 확보했습니다."
order: 20
draft: false
---

<div class="aio-lead-panel">
  <span class="aio-kicker">백엔드 핵심 · 2025.10 – 2026.02</span>
  <p><strong>AIO는 기업 문서가 데이터셋이 되고, 데이터셋이 지식 그래프와 벡터 인덱스로 바뀌며, 그 지식을 Agent Workflow에서 재사용하는 전체 흐름을 제품화한 시스템입니다.</strong> 이 글은 그 중 세 가지 기술 문제를 다룹니다 — ① 그래프와 벡터를 왜, 어떻게 함께 쓰는가, ② 벡터 하나로 부족할 때의 멀티벡터 융합, ③ 저장소 5종에 걸친 데이터 정합성.</p>
</div>

## 문제: 벡터 검색만으로는 "관계"를 답할 수 없다

순수 벡터 RAG는 "이 문서와 비슷한 내용"은 잘 찾지만, "A 규정과 B 절차가 어떤 관계인가" 같은 엔티티 간 관계 질의에는 약합니다. 반대로 지식 그래프만으로는 자유 텍스트의 의미 유사성을 다루지 못합니다. 기업 지식 관리에서는 두 질의 유형이 모두 들어오므로, 인덱싱 단계부터 두 표현을 함께 만들어야 했습니다.

설계 기반으로 LightRAG의 구조를 가져오되 그대로 쓰지 않았습니다. 저장 백엔드를 Qdrant에서 Milvus로 전환하고, 스토리지 계층을 지식 저장소별 멀티 네임스페이스 구조로 재설계했으며, Neo4j·Milvus·NetworkX 각각의 저장소 래퍼를 모듈로 분리해 서비스 계층이 특정 구현체에 묶이지 않게 했습니다.

<div class="aio-diagram">
  <img src="/images/projects/aio-overall-architecture.svg" alt="AIO overall architecture — async ingestion, graph + vector grounding, query and RRF fusion" />
</div>

## 딥다이브 ① Graph + Vector 이중 인덱스와 5가지 검색 모드

문서가 지식이 되는 파이프라인은 이렇습니다. 업로드된 문서는 Celery worker가 비동기로 `parsing` → `chunking` → `indexing`을 수행하고, 이 과정에서 **세 종류의 벡터 컬렉션**(chunk / entity / relationship)과 **Neo4j 그래프**가 함께 만들어집니다. chunk에서 LLM이 엔티티와 관계를 추출하고, 엔티티·관계 각각의 서술도 임베딩되어 벡터로 저장됩니다. 업로드·문서 메타데이터·ingestion·인덱싱이 서로 다른 실패 지점과 재시도 단위를 갖도록 분리했고, 진행률은 SSE로 화면에 흐릅니다.

질의 시에는 먼저 키워드 추출기가 질문에서 저수준(구체 엔티티)·고수준(주제·테마) 키워드를 분리하고, 검색 모드에 따라 다른 경로를 탑니다.

<div class="aio-feature-grid">
  <div class="aio-feature-card">
    <h3>local</h3>
    <p>저수준 키워드로 entity 벡터를 검색하고, 그래프에서 해당 엔티티 주변의 관계·근거 chunk를 확장합니다. "특정 대상"에 대한 질의에 강합니다.</p>
  </div>
  <div class="aio-feature-card">
    <h3>global</h3>
    <p>고수준 키워드로 relationship 벡터를 검색해 테마 단위 관계망을 가져옵니다. "전반적 경향·관계" 질의에 강합니다.</p>
  </div>
  <div class="aio-feature-card">
    <h3>hybrid</h3>
    <p>local과 global 컨텍스트를 함께 구성해 대상과 맥락을 동시에 잡습니다.</p>
  </div>
  <div class="aio-feature-card">
    <h3>naive</h3>
    <p>그래프를 거치지 않는 순수 chunk 벡터 검색입니다. 단순 사실 조회의 기준선이자 폴백입니다.</p>
  </div>
  <div class="aio-feature-card">
    <h3>mix</h3>
    <p>그래프 컨텍스트와 벡터 chunk 검색을 통합하는 기본 모드입니다. 두 표현의 강점을 합칩니다.</p>
  </div>
</div>

검색 모드를 사용자 선택으로 노출한 이유는 단순합니다 — 질의 유형별로 최적 경로가 다르고, 그 차이가 실제 답변 품질로 드러나기 때문입니다. Agent Builder에서 retrieval 노드의 파라미터로 모드를 지정할 수 있어, 워크플로우 설계자가 용도별 검색 전략을 조립합니다.

## 딥다이브 ② RRF 멀티벡터 융합 — 한 chunk를 네 방향에서 본다

법령·규정류 문서 코퍼스에서는 단일 content 임베딩의 한계가 뚜렷했습니다. 조문 본문은 비슷한데 소속 법령이 다르거나, 제목·조 구조가 검색 의도의 핵심인 경우가 많았기 때문입니다.

그래서 chunk 하나에 **4개 벡터 필드**를 저장합니다 — 본문(content), 제목(title), 도메인(domain), 문서 구조(structure). 각 필드는 COSINE metric의 HNSW 인덱스를 따로 가집니다. 질의 시에는 4개 필드를 **병렬로 각각 검색**(필드당 top_k×2)한 뒤, **RRF(Reciprocal Rank Fusion, k=60)**로 순위를 융합해 최종 랭킹을 만듭니다.

RRF를 고른 이유는 점수 정규화가 필요 없어서입니다. 필드마다 유사도 분포가 달라 raw score를 섞으면 특정 필드가 랭킹을 지배하는데, RRF는 순위만 사용하므로(1/(k+rank) 합산, 동일 가중치) 분포 차이에 강건합니다. 컬렉션 로드를 검색 전 1회로 묶고 필드별 검색을 asyncio.gather로 병렬화해, 검색을 4배로 늘리면서도 지연 증가를 억제했습니다.

<div class="aio-diagram">
  <img src="/images/projects/aio-deepdive-rrf.svg" alt="RRF 4-vector fusion — parallel field search fused by reciprocal rank" />
</div>

## 딥다이브 ③ 정합성 트러블슈팅 2건

**삭제했는데 남아 있는 지식.** 지식 저장소를 삭제해도 검색 결과에 유령처럼 남는 문제가 있었습니다. 원인은 지식 하나가 물리적으로 여러 저장소에 흩어져 있다는 점입니다 — PostgreSQL의 메타데이터, Milvus의 chunk/entity/relationship 컬렉션, Neo4j의 그래프 노드와 관계. 초기 삭제 로직은 메타데이터 중심으로 지워 인덱스 잔존물을 남겼습니다. 해결은 삭제를 단일 DELETE가 아니라 **삭제 세션**으로 다루는 것이었습니다. 삭제 요청이 오면 세션을 만들고, 저장소별 삭제 태스크를 발행해 벡터 컬렉션 엔트리·그래프 노드·관계·메타데이터를 각각 정리하며, 상태를 추적해 부분 실패를 드러냅니다. "삭제는 즉시 끝난다"는 가정을 버리고 삭제도 ingestion처럼 비동기 파이프라인으로 승격시킨 것이 핵심입니다.

**동시 요청이 만든 이중 연결.** 비동기 서버에서 여러 요청이 동시에 그래프 DB 연결을 초기화하려 하면서 커넥션이 중복 생성되는 경합이 있었습니다. 싱글톤이되 연결은 지연 초기화해야 하는 상황이라 **asyncio.Lock + double-check** 패턴으로 풀었습니다. Lock 획득 후 연결 여부를 다시 확인(double-check)한 뒤에만 연결을 수행하고, 연결 URI는 폴백 체인(외부 인스턴스 → Docker 네트워크 → localhost)으로 시도해 배포 환경별 연결 실패가 서비스 기동 실패로 번지지 않게 했습니다.

<div class="aio-diagram">
  <img src="/images/projects/aio-deepdive-deletion.svg" alt="Session-based deletion pipeline — before and after, with asyncio.Lock double-check singleton" />
</div>

## Agent Builder — 검색 전략을 조립 가능하게

검색·생성 파이프라인은 코드가 아니라 화면에서 조립할 수 있어야 운영 조직이 씁니다. Vue Flow 기반 canvas에서 노드를 연결하면 workflow가 JSON spec으로 직렬화되고, 백엔드가 이를 LangGraph StateGraph로 빌드해 실행합니다.

<div class="aio-flow">
  <div><strong>1. Design</strong><span>Vue Flow canvas에서 node와 edge를 배치합니다.</span></div>
  <div><strong>2. Serialize</strong><span>workflow graph를 backend spec(JSON)으로 변환합니다.</span></div>
  <div><strong>3. Build</strong><span>spec에서 LangGraph StateGraph를 생성합니다.</span></div>
  <div><strong>4. Retrieve</strong><span>검색 node가 Milvus·Neo4j·Elasticsearch 컨텍스트를 조합합니다.</span></div>
  <div><strong>5. Stream</strong><span>답변과 conversation state를 화면으로 스트리밍합니다.</span></div>
</div>

노드 라이브러리는 검색(전처리·검색·후처리·rerank), 생성, 라우팅·분기·루프, 데이터 ingestion, 멀티모달(vision) 등 **20개 카테고리 65개 노드 모듈**로 구성했습니다. 위에서 설명한 멀티벡터 검색과 법령 준수 검증도 각각 노드로 등록되어 있어 워크플로우에 그대로 꽂을 수 있습니다.

<div class="aio-diagram">
  <img src="/images/projects/aio-deepdive-agent-builder.svg" alt="Agent Builder execution path — canvas to JSON spec to LangGraph StateGraph to SSE streaming" />
</div>

## 시스템 규모와 구조

런타임은 FastAPI 백엔드 + Vue 3 콘솔이며, PostgreSQL(메타데이터·권한)·Milvus(벡터)·Neo4j(그래프)·Redis(캐시·태스크 브로커)·Elasticsearch(텍스트 검색) **5종 저장소**와 Celery worker를 docker-compose로 오케스트레이션합니다. API 표면은 라우터 기준 **160여 개 엔드포인트**로, 문서 저장소·데이터셋 ingestion·지식 그래프 질의·Agent 실행·계정/역할/ACL이 분리된 라우터로 운영됩니다. 권한은 JWT + role/permission/ACL bitmask로 평가되며, 접근 불가 문서가 답변 근거에 섞이지 않도록 검색 경로와 연결됩니다.

## 정리

AIO에서 개발한 핵심 구현은 **검색 품질을 구조로 푼 것**입니다. 그래프와 벡터의 이중 인덱스, 질의 유형별 5가지 검색 경로, 4벡터 RRF 융합은 각각 "벡터 하나로는 답변 품질이 너무 떨어진다." 구체적인 실패 케이스에서 출발한 설계입니다. 그리고 그 인덱스들이 5종 저장소에 흩어질 때 생기는 정합성 문제 — 삭제 잔존, 초기화 경합 — 를 세션 기반 삭제 파이프라인과 double-check 락으로 마무리했습니다. 이 엔진은 이후 Plan2do의 법령 검색 전략을 노드로 이식받으며 법령 워크플로우 기반으로 확장되었습니다.
