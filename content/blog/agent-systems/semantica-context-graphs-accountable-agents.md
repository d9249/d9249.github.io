---
title: "Semantica는 에이전트의 컨텍스트를 ‘감사 가능한 결정 그래프’로 바꾼다"
date: "2026-08-06T23:22:11"
description: "semantica-agi/semantica는 검색용 벡터 인덱스만으로 남기 쉬운 에이전트의 상태·판단·근거를 context graph, provenance, reasoning, policy 계층으로 묶어 질의 가능한 결정 인프라로 만들려는 오픈소스 Python 프로젝트다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Semantica
  - Context Graphs
  - Agent Memory
  - Knowledge Graphs
  - AI Governance
draft: false
---

에이전트가 길게 일할수록 문제는 단순히 “관련 문서를 찾았는가”에서 끝나지 않는다.[2]
어떤 사실을 근거로 판단했는지, 그 판단이 뒤의 작업에 무엇을 일으켰는지, 나중에 같은 상황을 다시 만났을 때 어떤 선례를 꺼낼 수 있는지가 운영 품질을 가른다.[2]
`semantica-agi/semantica`는 이 빈칸을 context graph와 decision intelligence로 채우려는 Python 프로젝트다.[1][2]


Semantica의 중심 주장은 벡터 검색을 대체하자는 것이 아니다.[2]
문서·웹·데이터베이스에서 들어온 정보를 그래프로 정리하고, 그 위에 provenance·추론·ontology·결정 기록을 함께 올려 **에이전트가 아는 것과 결정한 것을 같은 질의 표면에서 다루자**는 쪽에 가깝다.[2][5]

![Semantica 공식 아키텍처 개요: 수집·처리·지식 저장소·출력 계층](/images/blog/semantica-architecture-overview.webp)

*Semantica 공식 architecture overview. 파일·웹·데이터베이스 등의 입력을 semantic engine으로 처리하고, knowledge store를 거쳐 GraphRAG agent·decision tracking·reasoning·explorer로 연결하는 구성을 보여 준다.[7]*

## 무엇을 해결하려는가

일반적인 RAG는 질문과 비슷한 문서 조각을 찾는 데 강하지만, 이전 판단의 인과 관계나 충돌한 사실의 처리 이력까지 기본 단위로 보존하지는 않는다.[2]
Semantica는 `ContextGraph`에서 entity, relationship, fact, decision을 graph node로 다루고, decision record에는 scenario·reasoning·outcome·confidence·metadata를 담는 API를 제공한다.[2]


이 접근에서 결정은 단순 로그가 아니다.[2]
`record_decision()`으로 남긴 기록은 원인과 결과를 관계로 연결하고, 유사한 과거 판단을 검색하거나 causal chain과 downstream impact를 다시 질의하는 출발점이 된다.[2][5]

| 보관 대상 | Semantica가 공개한 처리 방식 | 실무에서의 의미 |
| --- | --- | --- |
| 사실·엔티티 | extraction, entity resolution, graph construction | 단순 문서 chunk보다 관계를 따라 다시 찾을 수 있는 구조 |
| 상충 정보 | conflict detection과 resolution | 충돌을 조용히 덮어쓰지 않고 검토 대상으로 남김 |
| 에이전트 판단 | first-class decision record, causal relationship | “무엇을 했나”뿐 아니라 판단의 전후 관계를 재질의 |
| 출처와 근거 | W3C PROV-O provenance, JSON/CSV/RDF export | 감사·검토 시 source-linked trail을 꺼낼 수 있는 표면 |
| 정책과 추론 | SHACL/OWL, Rete·Datalog·SPARQL reasoning | 규칙 기반 검증과 설명 경로를 같은 graph 위에 둠 |

## 핵심은 파이프라인 하나가 아니라 ‘결정 이후’까지 남기는 층이다

공식 architecture는 입력을 ingest → parse → normalize → split → extract → conflict detection → deduplication → knowledge graph로 이어 붙인다.[2][5]
그 뒤 ontology, reasoning, provenance, context & decisions를 intelligence layer로 올리고, vector store와 RDF/LPG graph store, REST·MCP·CLI·explorer 같은 출력 표면으로 연결한다.[2][5]


이 순서에서 중요한 것은 graph가 ingest의 마지막 산출물에 그치지 않는다는 점이다.[2][5]
충돌 감지·deduplication을 거친 fact와 relationship 위에 provenance와 추론 결과, 그리고 의사결정 기록을 겹쳐 두므로, 이후 agent가 retrieval만 하는 것이 아니라 **선례·원인·정책 충족 여부를 함께 묻는 구조**를 지향한다.[2][5]

![Semantica 공식 AgentContext 흐름: AI agent와 vector retrieval, context graph의 연결](/images/blog/semantica-agent-context-flow.webp)

*공식 AgentContext 도식. agent의 `store`, `retrieve`, `record_decision` 호출이 embedding-backed retrieval과 decision graph로 갈라지고, causal chain·precedent 검색으로 다시 돌아오는 흐름을 요약한다.[8]*

README가 제시하는 MCP 도구도 이 구분을 드러낸다.[2]
entity·relation extraction, graph node/edge 추가, reasoning 실행과 함께 `record_decision`, `query_decisions`, `find_precedents`, `get_causal_chain`이 나란히 노출된다.[2]
즉 에이전트 연결은 “지식 그래프를 검색하는 도구”만 주는 방식보다, 결정 기록을 읽고 쓰는 context runtime에 더 가깝다.[2]

## 검색·그래프·정책을 한 배포물로 묶는 대가

Semantica는 FAISS, Qdrant, Weaviate, Milvus, Pinecone, PgVector 같은 vector store와 Neo4j, FalkorDB, Apache AGE, AWS Neptune 같은 labeled property graph, Oxigraph·Blazegraph·Jena·RDF4J 같은 RDF 표면을 함께 열거한다.[2]
 저장소 선택을 바꾸더라도 application code를 바꾸지 않는다는 것이 README의 목표지만, 실제 운영에서는 이 선택이 schema, query, security boundary, 비용을 좌우한다.[2]


그래서 이 프로젝트를 가벼운 agent-memory 패키지로 읽기는 어렵다.[2]
기본 Python dependency에도 NLP, embedding, RDF, visualization, FAISS 계열이 포함되고, graph database·vector store·warehouse·LLM provider는 extras로 나뉜다.[2]
production deployment에 대해서도 README는 local `pip install`보다 Docker 또는 Kubernetes, persistent graph/triple store와 hosted vector backend, `SEMANTICA_SECRET_KEY` 설정을 권한다.[2]


이 폭은 장점이자 도입 장벽이다. 하나의 팀이 GraphRAG, entity resolution, provenance, ontology, policy enforcement, agent integration을 같은 모델로 다뤄야 한다면 통합된 표면이 유리할 수 있다. 반대로 현재 문제가 “문서 검색 품질” 하나라면 모든 intelligence layer를 도입하기보다, 어떤 decision·relationship·provenance를 실제로 보존해야 하는지부터 작게 정하는 편이 안전하다.

## Knowledge Explorer는 graph를 운영 화면으로 올린다

Semantica는 라이브 graph를 탐색하고, timeline을 훑고, decision의 causal chain을 검토하며, duplicate를 merge하고 ontology를 편집하는 browser-based Knowledge Explorer를 제공한다고 설명한다.[2]
 `semantica[explorer]` extra를 설치해 graph JSON을 열 수 있다는 것이 공개된 최소 실행 경로다.[2]

![Semantica Knowledge Explorer 공식 데모 첫 화면](/images/blog/semantica-knowledge-explorer.webp)

*공식 Knowledge Explorer 데모의 첫 화면. graph 탐색뿐 아니라 Analyze·Decisions·Enrich·Ontology Hub을 하나의 workbench navigation에 배치한 제품 표면을 보여 준다.[9]*

이 UI가 의미하는 바는 꽤 크다. provenance나 causal chain은 API 응답으로만 남으면 개발자에게만 보이기 쉽지만, explorer가 안정적으로 작동하면 운영자·도메인 전문가·감사 담당자가 같은 graph를 서로 다른 관점에서 확인할 수 있다. 다만 공개 GIF는 제품 표면을 보여 주는 데모이며, 특정 조직의 데이터 규모·권한 모델·감사 절차에서의 readiness를 독립적으로 보장하는 근거는 아니다.

## v0.6.0은 ‘연결 가능한 back-end’ 범위를 넓혔다

최신 GitHub release는 `v0.6.0`이며, 2026년 7월 21일 게시됐다.[4][6]
 이 release는 Blazegraph·RDF4J·Jena 사이 named-graph parity, parameterized SPARQL `CONSTRUCT` template, Databricks Unity Catalog·Delta Lake connector, `sqlite-vec` 기반의 disk-backed SQLite vector store를 주요 변경으로 열거한다.[6]


이 변화는 Semantica가 agent context의 추상 API만 다루지 않고, 실제 data/graph backend와 연결되는 경로를 계속 넓히고 있음을 보여 준다. 특히 warehouse table의 catalog·schema·table·lineage introspection과 named graph/CONSTRUCT 지원은, “답변용 memory”보다 기업 데이터와 감사 가능한 knowledge layer 사이에 놓이려는 방향과 맞물린다.[2][6]


저장소 API 조회 시점에 이 프로젝트는 MIT license, Python 중심, 2,072 stars와 284 forks를 보였고, main branch에는 architecture·changelog·security·cookbook·deploy·explorer·integrations·MCP·plugins 디렉터리가 함께 존재한다.[3]
 이는 단일 demo repository보다 훨씬 넓은 공개 표면이지만, 별도의 production SLA나 특정 workload 성능을 보장하는 신호로 과대해석해서는 안 된다.

## 실무 관점에서의 해석

Semantica의 가장 선명한 포인트는 “에이전트에게 더 많은 컨텍스트를 넣자”가 아니라, **컨텍스트가 어떻게 만들어졌고 어떤 결정에 쓰였는지를 graph object로 남기자**는 데 있다. 잘 설계된 시스템이라면 과거 답변의 문장 자체보다, 답에 쓰인 entity·source·정책·인과 관계·후속 outcome이 다음 판단에서 더 가치 있는 memory가 될 수 있다.

반대로 이 설계는 데이터 모델링을 피할 수 없게 만든다. 어떤 entity를 canonical하게 볼지, 무엇을 conflict로 볼지, decision node에 어떤 민감 정보를 허용할지, provenance retention과 deletion을 어떻게 할지는 프레임워크가 자동으로 대신 정할 수 없다. regulated domain에서 특히 중요한 것은 기능 수가 아니라, 이 policy와 access boundary가 조직의 실제 책임 구조에 맞는지다.

그래서 Semantica는 “RAG를 그래프로 바꾸는 라이브러리”로만 보기보다, agent memory·data integration·reasoning·governance를 한 graph substrate에 묶으려는 오픈소스 인프라로 읽는 편이 정확하다. 지금 바로 필요한 것이 거대한 platform인지, 아니면 decision record와 provenance를 먼저 남기는 좁은 context layer인지는 팀의 운영 요구에 따라 달라질 것이다.

## Sources

[1] https://github.com/semantica-agi/semantica — Semantica GitHub repository
[2] https://raw.githubusercontent.com/semantica-agi/semantica/main/README.md — Semantica README
[3] https://api.github.com/repos/semantica-agi/semantica — Semantica repository metadata
[4] https://api.github.com/repos/semantica-agi/semantica/releases — Semantica releases metadata
[5] https://raw.githubusercontent.com/semantica-agi/semantica/main/ARCHITECTURE.md — Semantica architecture
[6] https://github.com/semantica-agi/semantica/releases/tag/v0.6.0 — Semantica v0.6.0 release
[7] https://raw.githubusercontent.com/semantica-agi/semantica/main/docs/assets/img/diagrams/architecture-overview.svg — Semantica architecture overview diagram
[8] https://raw.githubusercontent.com/semantica-agi/semantica/main/docs/assets/img/diagrams/agent-context-flow.svg — Semantica agent context diagram
[9] https://raw.githubusercontent.com/semantica-agi/semantica/main/docs/assets/img/semantica-knowledge-explorer-demo.gif — Semantica Knowledge Explorer demo
