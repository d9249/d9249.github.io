---
title: "Plan2Do - AI 산업안전 위험성평가 플랫폼"
projectName: "Plan2Do"
tagline: "AI 산업안전 위험성평가 플랫폼"
period: "AsianaIDT / 2025.07.24 - 2025.12.15"
periodOrder: 20251215
description: "이미지와 문서를 산업안전 맥락으로 해석하고, 법령 벡터 검색과 LangGraph 워크플로우로 위험요인, 감소대책, 근거 테이블을 생성하는 RAG 기반 안전 분석 API입니다."
metrics:
  - "AI 안전도우미"
  - "Qdrant Legal RAG"
  - "LangGraph Risk Workflow"
stack:
  - "Python"
  - "FastAPI"
  - "LangGraph"
  - "Qdrant"
  - "PostgreSQL"
  - "OpenAI GPT-4o"
  - "Gemini"
  - "Docker Compose"
details:
  - "이미지, PDF, 일반 질의를 산업안전 위험성평가 요청으로 정규화하는 FastAPI 엔진을 기준으로 분석했습니다."
  - "산업안전보건법, 중대재해처벌법, 건설기술진흥법 계열 XML을 전처리하고 OpenAI embedding으로 Qdrant 검색 컬렉션을 만드는 법령 RAG 파이프라인을 확인했습니다."
  - "LangGraph 기반 workflow가 법규 검색, 위험 분석, 감소대책 생성, 법령 검증, HTML 표 생성을 SSE 이벤트로 단계별 반환합니다."
  - "Plan2Do 수상 맥락은 포트폴리오 수상 데이터의 AI 안전도우미/위험성평가 지원 시스템 고도화 기여와 연결해 정리했습니다."
order: 25
draft: false
---

<section class="project-lead-panel">
  <span class="project-kicker">Service Thesis</span>
  <p><strong>Plan2Do는 산업 현장 사진이나 문서를 입력받아 "무엇이 위험한가"를 찾고, 법령 근거가 붙은 감소대책 표로 바꾸는 AI 안전도우미입니다.</strong></p>
  <p>핵심은 일반 챗봇 답변이 아니라 위험요인, 예상 위험 수준, 감소대책, 관련 법령 근거를 구조화된 산출물로 만드는 실행 흐름입니다. FastAPI 엔진은 이미지/문서 분석, Qdrant 법령 검색, LangGraph 위험성평가 workflow, PostgreSQL 기록 저장을 하나의 API 서비스로 묶습니다.</p>
</section>

## Plan2Do를 다시 정의하면

Plan2Do의 문제 공간은 산업안전 담당자가 현장 사진, 작업 설명, PDF 자료를 읽고 위험요인과 감소대책을 표로 정리해야 하는 반복 업무입니다. 단순히 "안전모를 쓰세요"라고 답하는 AI가 아니라, 입력 자료에서 위험 후보를 추출하고, 관련 법령을 찾아 근거를 붙이며, 사용자가 검토할 수 있는 HTML 테이블을 반환하는 것이 목표입니다.

소스 기준의 제품 표면은 세 가지입니다. `/api/chat/reqQuestion`과 `/api/v2/chat/reqQuestion`은 이미지를 산업안전 관련 자료인지 먼저 분류하고, 안전 현장 이미지일 때만 위험 관찰 결과를 만듭니다. `/api/chat/noRag`와 `/api/v2/chat/noRag/stream`은 위험성평가, 위험요인, 감소대책, 표 요청 같은 키워드를 감지해 LangGraph workflow로 넘어갑니다. `/api/document/riskAnalysis`와 `/api/document/riskAnalysisIntegrated`는 PDF나 이미지 파일을 개별 또는 통합 분석해 위험성평가 JSON을 반환합니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>문제</strong>
    <p>산업 현장 자료는 비정형 입력이 많고, 결과는 검토 가능한 표와 법령 근거로 남아야 합니다.</p>
  </div>
  <div class="project-fact">
    <strong>접근</strong>
    <p>입력 분석, 위험요인 추출, 법령 벡터 검색, 감소대책 생성, 법령 검증, HTML 표 생성을 단계별 workflow로 분리했습니다.</p>
  </div>
  <div class="project-fact">
    <strong>결과</strong>
    <p>사용자는 위험요인과 감소대책을 체크 가능한 표로 받고, 각 조치가 어떤 법령 근거와 연결되는지 함께 검토할 수 있습니다.</p>
  </div>
</div>

## 사용자가 실제로 얻는 기능

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3>이미지 안전 판별</h3>
    <p>업로드 이미지를 산업안전 관련 이미지인지 먼저 분류하고, 관련성이 낮으면 <code>NON_INDUSTRIAL_IMAGE</code>로 거절합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>현장 위험 관찰</h3>
    <p>안전모 미착용, 사다리 안전대, 낙하물, 감전, 화재 같은 관찰 결과를 이미지 설명으로 통합합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>문서 위험성 분석</h3>
    <p>PDF와 이미지 파일을 읽어 파일별 위험요인과 감소대책을 만들고, 여러 파일을 하나의 통합 분석으로 합칠 수 있습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>법령 근거 검색</h3>
    <p>산업안전보건법, 중대재해처벌법, 건설기술진흥법 계열 XML을 Qdrant collection으로 올려 관련 조문을 검색합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>LangGraph Workflow</h3>
    <p>법규 검색 후 위험 분석과 감소대책 생성을 병렬 수행하고, 법령 검증과 HTML 표 생성까지 같은 상태 객체로 이어갑니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>SSE Progress</h3>
    <p>긴 분석 작업은 진행 시작, 관련 법규 검색 완료, 감소대책 수립 완료, 결과 테이블 생성 완료 같은 이벤트로 흘러갑니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>HTML 결과 테이블</h3>
    <p>선택 체크박스, 위험요인, 예상 위험 수준, 감소대책, 관련 근거, 상세내용을 포함하는 검토용 표를 생성합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>로컬 운영 묶음</h3>
    <p>Docker Compose가 FastAPI engine, PostgreSQL, Qdrant, vector init/load 작업을 한 개발 환경으로 묶습니다.</p>
  </div>
</div>

<figure class="project-diagram">
  <img src="/images/projects/plan2do-runtime-topology.svg" alt="Plan2Do runtime topology diagram">
  <figcaption>Plan2Do runtime topology. FastAPI engine은 API 요청을 받아 AI provider, PostgreSQL, Qdrant 법령 검색, vector build/load pipeline과 연결됩니다.</figcaption>
</figure>

## 위험성평가 workflow

`NoRagLangGraphWorkflow`는 Plan2Do에서 가장 제품적인 실행 단위입니다. 입력은 `risk_factors`, `query`, `trace_id`이고, 출력은 `processed_risks`, `references`, `mitigation_plans`, `legal_validations`, `html_table`, `summary`를 담은 최종 결과입니다. 이 구조 덕분에 UI나 클라이언트는 전체 분석이 끝날 때까지 기다리지 않고 단계별 진행 상황을 받을 수 있습니다.

workflow는 먼저 입력 위험요인을 초기화하고, 각 위험요인에 대해 Qdrant 법령 검색을 수행합니다. 그다음 위험요인 상세 분석과 감소대책 생성을 병렬로 실행합니다. 이후 법령 검증 단계에서 감소대책과 법령 매칭 품질을 다시 판단한 뒤, `HtmlGenerator.generate_progressive_table`이 최종 표를 만듭니다.

<div class="project-flow">
  <span>01 입력 정규화</span>
  <span>02 법령 검색</span>
  <span>03 위험 분석</span>
  <span>04 감소대책 생성</span>
  <span>05 표와 근거 반환</span>
</div>

<figure class="project-diagram">
  <img src="/images/projects/plan2do-risk-workflow.svg" alt="Plan2Do risk analysis workflow diagram">
  <figcaption>Risk analysis workflow. 법령 검색이 먼저 수행되고, 위험 분석과 감소대책 생성이 병렬로 진행된 뒤 법령 검증과 HTML 테이블 생성으로 합류합니다.</figcaption>
</figure>

## 법령 RAG가 동작하는 방식

Plan2Do의 RAG는 산업안전 관련 법령 corpus를 먼저 구축해 놓고 위험요인에 맞는 근거를 찾는 구조입니다. `servers/vectordb/data`에는 법령 XML 10개와 행정규칙 XML 1개가 포함되어 있고, 전처리기는 법령 원문의 원문자, 특수기호, HTML 태그, 전각 문자를 정규화합니다. 법령은 조, 항, 호 같은 계층 단위로 나뉘고, `build.py`가 `text-embedding-3-large` 기반 embedding과 Qdrant point payload를 생성합니다. `load.py`는 `documents` collection을 준비하고 batch upload와 간단한 검색 확인을 담당합니다.

검색 시에는 위험 설명 하나를 그대로 embedding하는 것에서 끝나지 않습니다. `RiskAnalysisService`는 먼저 LLM으로 안전 키워드를 추출하고, JSON 파싱에 실패하면 정규식/명사 기반 fallback을 사용합니다. 이후 원본 설명 검색과 키워드 강화 검색을 따로 수행하고, 두 결과에 가중치를 부여해 병합합니다. 같은 법령이나 같은 조문으로 결과가 편중되지 않도록 law/article cap도 둡니다.

## 코드 기준으로 확인한 구성

<div class="article-table-wrap">
  <table>
    <thead>
      <tr>
        <th>구성</th>
        <th>확인한 역할</th>
        <th>제품 의미</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>servers/engine/src/main.py</code></td>
        <td>FastAPI app, CORS, router mount, docs endpoint</td>
        <td>외부 요청이 들어오는 API 경계</td>
      </tr>
      <tr>
        <td><code>api/chat_endpoints.py</code></td>
        <td>이미지 질문 생성, noRag streaming, RAG 분석 분기</td>
        <td>사용자 입력을 위험성평가 요청으로 바꾸는 기존 API 표면</td>
      </tr>
      <tr>
        <td><code>api/chat_v2_endpoints.py</code></td>
        <td>UUID 기반 이미지 병렬 처리, stream 분석</td>
        <td>여러 이미지와 진행률이 필요한 클라이언트 흐름</td>
      </tr>
      <tr>
        <td><code>api/document_endpoints.py</code></td>
        <td>PDF/image 위험성 분석, 여러 파일 통합 분석</td>
        <td>현장 문서까지 입력 채널을 넓히는 기능</td>
      </tr>
      <tr>
        <td><code>service/workflow_service.py</code></td>
        <td>LangGraph node와 async SSE event 생성</td>
        <td>법령 검색부터 표 생성까지 이어지는 핵심 실행 경로</td>
      </tr>
      <tr>
        <td><code>service/risk_analysis_service.py</code></td>
        <td>키워드 추출, vector search, 위험 분석, 감소대책, 법령 검증</td>
        <td>LLM 추론과 법령 근거를 제품 로직으로 묶는 서비스 계층</td>
      </tr>
      <tr>
        <td><code>servers/vectordb/processor.py</code></td>
        <td>법령 XML 정규화, 조문 단위 chunk 생성</td>
        <td>검색 가능한 안전 법령 corpus를 만드는 전처리 파이프라인</td>
      </tr>
      <tr>
        <td><code>data/database.py</code></td>
        <td>Conversation, Question, Document, Answer, Report, Reference, Userlist schema</td>
        <td>대화, 질문, 문서, 답변, 참조 관계를 PostgreSQL에 남기는 영속성 경계</td>
      </tr>
      <tr>
        <td><code>docker-compose.yml</code></td>
        <td>engine, rdb, qdrant, init-check, load-data 서비스 연결</td>
        <td>로컬 개발자가 한 번에 API, RDB, VectorDB, 벡터 로딩을 띄우는 운영 단위</td>
      </tr>
    </tbody>
  </table>
</div>

## API와 산출물 매트릭스

<div class="article-table-wrap">
  <table>
    <thead>
      <tr>
        <th>사용자 기능</th>
        <th>Endpoint</th>
        <th>주요 처리</th>
        <th>반환 산출물</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>이미지 기반 질문 생성</td>
        <td><code>POST /api/chat/reqQuestion</code></td>
        <td>산업안전 이미지 분류, vision 분석, 여러 이미지 관찰 결과 통합, 질문 저장</td>
        <td><code>query</code>, <code>img_description</code>, <code>question_id</code>, <code>rag_flag</code></td>
      </tr>
      <tr>
        <td>v2 이미지 병렬 처리</td>
        <td><code>POST /api/v2/chat/reqQuestion</code></td>
        <td><code>asyncio.gather</code>로 uuid별 이미지 분류와 vision 분석 수행</td>
        <td>uuid가 유지된 <code>img_descriptions</code> 배열</td>
      </tr>
      <tr>
        <td>이미지/문서 설명 기반 RAG 분석</td>
        <td><code>GET /api/chat/noRag</code></td>
        <td>description을 위험요인으로 추출하고 Qdrant 근거와 감소대책으로 확장</td>
        <td><code>risk_factor</code>, <code>reduction_measure</code>, <code>related_evidence</code></td>
      </tr>
      <tr>
        <td>위험성평가 표 생성</td>
        <td><code>GET /api/chat/noRag</code></td>
        <td>위험성평가/표 키워드를 감지해 LangGraph workflow 실행</td>
        <td>SSE chunk와 최종 <code>html_table</code></td>
      </tr>
      <tr>
        <td>v2 위험분석 스트리밍</td>
        <td><code>GET /api/v2/chat/noRag/stream</code></td>
        <td>URL encoded risk descriptions와 uuids를 risk factor 객체로 매핑</td>
        <td>진행률, references, mitigations, validations, final result</td>
      </tr>
      <tr>
        <td>파일별 위험성 분석</td>
        <td><code>POST /api/document/riskAnalysis</code></td>
        <td>PDF text extraction 또는 image vision 후 JSON 위험 분석 수행</td>
        <td>파일별 <code>filename</code>, <code>page_cnt</code>, 위험 분석 결과</td>
      </tr>
      <tr>
        <td>여러 파일 통합 분석</td>
        <td><code>POST /api/document/riskAnalysisIntegrated</code></td>
        <td>파일 설명을 병렬 생성하고 하나의 통합 prompt로 종합 분석</td>
        <td><code>total_files</code>, <code>page_cnt</code>, 통합 위험성평가 JSON</td>
      </tr>
    </tbody>
  </table>
</div>

## 운영과 검증 관점

Docker Compose 기준으로 Plan2Do는 `engine`, `rdb`, `qdrant`, `init-check`, `load-data`로 나뉩니다. `init-check`는 vector 파일이 비어 있을 때만 `build.py`를 실행하고, `load-data`는 Qdrant가 시작된 뒤 생성된 point 데이터를 collection에 올립니다. engine은 PostgreSQL이 열릴 때까지 대기한 뒤 `python3 main.py`로 시작합니다.

다만 현재 소스 묶음은 git repository가 아니며, 별도의 자동 테스트 파일도 포함되어 있지 않았습니다. 그래서 이 글은 "코드와 문서로 확인되는 아키텍처"를 기준으로 작성했고, 실제 운영 트래픽이나 배포 상태를 새로 검증했다는 의미는 아닙니다. 운영 환경에서는 API key와 DB password를 파일이 아니라 환경변수나 Secret Manager로 주입하고, Qdrant/PostgreSQL 포트는 외부 인터넷에 노출하지 않는 구성이 필요합니다.

## 기여를 어떻게 볼 수 있는가

포트폴리오의 수상 데이터는 Plan2Do를 "AI 안전도우미와 위험성평가 지원 시스템" 고도화 기여로 설명합니다. 소스 기준으로 보면 이 기여는 단순 prompt 작성이 아니라, 현장 입력을 산업안전 도메인으로 판별하고, 법령 검색으로 근거를 붙이며, LangGraph 상태 머신으로 위험성평가 표를 끝까지 생성하는 제품 실행 경계에 가깝습니다.

그래서 Plan2Do 프로젝트 페이지의 핵심 메시지는 "AI로 안전 답변을 생성했다"가 아닙니다. 더 정확히는 **산업안전 담당자가 검토 가능한 위험성평가 표를 만들기 위해, 비정형 입력, 법령 corpus, LLM 추론, 벡터 검색, 관계형 저장, SSE 진행률을 하나의 API 제품으로 묶었다**는 점입니다.
