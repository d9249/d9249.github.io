---
title: "Jeani Market Intelligence Multi-Agent System"
projectName: "Jeani"
tagline: "RFP 기반 시장 인텔리전스 에이전트"
period: "AsianaIDT / 2025.09 - 2025.12"
description: "Jeani는 RFP 문서를 읽어 조사 계획을 만들고, 시장/경쟁사/기술 동향을 병렬 수집한 뒤 Bedrock Knowledge Base로 동기화하는 시장 인텔리전스 멀티에이전트 시스템입니다."
metrics:
  - "5 KB Intelligence Agents"
  - "RFP-driven Search Plan"
  - "Bedrock KB Sync"
stack:
  - "AWS Lambda"
  - "Amazon S3"
  - "DynamoDB"
  - "EventBridge"
  - "AWS Bedrock"
  - "Bedrock Knowledge Base"
  - "Brave Search"
  - "Terraform"
  - "Next.js"
  - "TypeScript"
details:
  - "Planner가 S3 RFP 문서를 파싱해 project context, competitors, search keywords, tech topics, market topics, execution priority를 생성합니다."
  - "Researcher, Competitor, Tech Analyst는 같은 plan을 공유하되 서로 다른 검색면과 품질 평가 기준으로 병렬 실행됩니다."
  - "Synthesizer가 최종 보고서를 만들면 Orchestrator가 source_data, duplicate URL filtering metadata와 함께 daily_updates에 저장하고 KB Sync를 트리거합니다."
  - "AWS EST Gen AI 실무 역량 강화 과정에서 팀 프로젝트로 Jeani를 개발하고 과정을 이수했습니다."
order: 40
draft: false
---

<section class="market-lead-panel">
  <span class="market-kicker">Service Thesis</span>
  <p><strong>Jeani는 RFP를 읽고 "무엇을 조사해야 하는가"부터 다시 계획하는 시장 조사 에이전트 파이프라인입니다.</strong></p>
  <p>단일 챗봇에 시장 조사를 맡기면 검색어 선정, 경쟁사 범위, 기술 트렌드, 출처 중복, 최종 보고서 저장 경로가 흐려집니다. Jeani는 RFP 문서를 기준으로 조사 계획을 만들고, 시장 리서치, 경쟁사 분석, 기술 분석, 종합 보고, Knowledge Base 동기화를 분리된 Lambda agent와 S3 lifecycle로 다룹니다.</p>
</section>

## AWS EST 교육 기반 팀 프로젝트

Jeani는 `AWS EST Gen AI 실무 역량 강화 과정` 안에서 수행한 팀 프로젝트입니다. 이 과정은 전사 클라우드 및 생성형 AI 기술 내재화를 목표로 한 Enterprise Skills Transformation 프로그램으로, 2025년 9월 8일부터 2025년 12월 5일까지 총 13주 동안 진행됐습니다.

교육은 AWS 본사 정규 직원 강의, 오프라인 실습, 온라인 자율 학습, 팀 프로젝트 기반 개발로 구성됐습니다. 이 기간 동안 Generative AI Essentials on AWS, Developing Generative AI Applications on AWS, Agentic AI Foundations, Advanced RAG, MCP, SageMaker, MLOps 관련 과정을 이수했고, 학습 내용을 Jeani의 RFP 분석, agent workflow, S3/Bedrock Knowledge Base 연동 구조에 적용했습니다.

## RFP가 검색 계획으로 바뀌는 방식

Jeani는 시장 조사를 고정 키워드 목록으로 시작하지 않습니다. `PlannerAgent`가 S3의 `00_input_data/` 문서를 먼저 읽고, 그 문서에서 프로젝트 요약, 고객사, 산업 도메인, 범위, 경쟁사, 검색 키워드, 기술 주제, 시장 주제, 실행 우선순위를 뽑습니다. `.docx`는 내부 XML에서 텍스트를 꺼내고, `.pdf`, `.txt`, `.json`도 같은 `DocumentParser` 경계로 정규화합니다. RFP 본문은 최대 8,000자까지 prompt에 넣고, 기본 경쟁사/키워드/기술 컨텍스트는 fallback 정보로 붙습니다.

Planner의 결과는 단순 요약문이 아니라 다음 agent들이 바로 실행할 수 있는 plan schema입니다. 경쟁사는 `name`, `priority`, `reason`을 갖고, 검색 키워드는 `keyword`, `category`, `purpose`를 갖습니다. 기술/시장 주제에는 실제 검색에 사용할 `search_query`가 들어갑니다. 이 계획은 `06_market_intelligence/plans/{project_id}/search_plan.json`에 저장되어, 이후 workflow가 어떤 질문을 기준으로 움직였는지 되짚을 수 있게 합니다.

<div class="market-fact-grid">
  <div class="market-fact">
    <strong>Plan Schema</strong>
    <p>RFP에서 경쟁사, 검색 키워드, 기술/시장 주제, 실행 우선순위를 추출해 후속 agent의 입력 계약으로 사용합니다.</p>
  </div>
  <div class="market-fact">
    <strong>Traceable Plans</strong>
    <p>생성된 검색 계획은 <code>plans/{project_id}/search_plan.json</code>에 남겨 조사 방향을 나중에 확인할 수 있습니다.</p>
  </div>
  <div class="market-fact">
    <strong>Quality Gate</strong>
    <p>Planner는 경쟁사, 키워드, 기술 주제, 시장 주제, 실행 우선순위가 충분한지 점수화하고 부족하면 재분석합니다.</p>
  </div>
</div>

## 시스템을 다시 정의하면

Jeani의 핵심은 시장 조사 결과를 한 번 생성하는 것이 아닙니다. RFP마다 조사 대상이 달라진다는 점을 시스템 경계로 끌어올린 것이 핵심입니다. `PlannerAgent`가 만든 plan을 `ResearcherAgent`, `CompetitorAgent`, `TechAnalystAgent`가 공유하고, 각 agent는 같은 프로젝트를 서로 다른 관점에서 조사합니다.

마지막 `SynthesizerAgent`는 각 agent 결과를 종합해 executive summary, market trends, competitive insights, tech recommendations, strategic recommendations, action items, risks, next steps를 만듭니다. Orchestrator는 이 결과를 `06_market_intelligence/workflows/{project_id}/`에 agent별 원본으로 저장하고, 최종 보고서는 `06_market_intelligence/daily_updates/{document_name}/{timestamp}.json`으로 저장합니다. 저장 시 기존 URL을 다시 수집하지 않도록 문서별 기존 source URL을 읽어 중복을 필터링하는 로직도 들어 있습니다.

<div class="market-feature-grid">
  <div class="market-feature-card">
    <h3>RFP-driven Planning</h3>
    <p>고정 검색어가 아니라 RFP 본문에서 경쟁사, 검색 키워드, 기술 주제, 시장 주제를 뽑아 실행 계획을 만듭니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>Parallel Collection</h3>
    <p>researcher, competitor, tech analyst가 같은 plan을 공유하면서 시장 동향, 경쟁사 활동, 기술 트렌드를 병렬 수집합니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>Self-Reflexion Loop</h3>
    <p>공통 agent base가 수집, 분석, 평가 사이클을 제공하고, 품질 기준 미달 시 이전 피드백을 반영해 재분석합니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>Report Synthesis</h3>
    <p>synthesizer는 여러 agent 결과를 경영진 요약, 권고, action item, risk, next step으로 정리합니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>S3 Lifecycle</h3>
    <p>plans, workflows, daily_updates를 분리해 내부 실행 흔적과 KB에 넣을 최종 리포트를 구분합니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>Bedrock KB Sync</h3>
    <p>daily_updates만 Jeani의 Market Intelligence KB 인제스천 대상으로 삼고, plans/workflows는 내부 운영용으로 남깁니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>Document UI</h3>
    <p>Next.js 문서관리 화면은 market intelligence folders, 프로젝트별 업데이트, workflow agent 결과를 탐색합니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>Scheduled Operation</h3>
    <p>EventBridge daily schedule과 S3 object-created notification으로 반복 수집과 KB 동기화 경로를 둡니다.</p>
  </div>
</div>

<figure class="market-diagram">
  <img src="/images/projects/market-intelligence-runtime.svg" alt="Market intelligence runtime flow diagram">
  <figcaption>Jeani market intelligence runtime. RFP 문서에서 계획을 만들고, 병렬 조사 agent가 수집한 결과를 synthesizer가 보고서로 묶은 뒤 S3와 Bedrock Knowledge Base로 보냅니다.</figcaption>
</figure>

## Agent Runtime

runtime의 supervisor는 `KBIntelligenceOrchestrator`입니다. 입력으로 특정 `rfp_document_key`가 오면 해당 문서를 파싱하고, 없으면 `00_input_data/`에서 최신 RFP 문서를 찾습니다. scheduled run에서는 `00_input_data/`의 모든 문서를 순회하며 문서별 workflow를 실행합니다.

실행 단계는 세 개입니다. Phase 1은 planner입니다. planner는 RFP를 읽고 검색 계획을 만듭니다. Phase 2는 researcher, competitor, tech analyst의 병렬 실행입니다. Orchestrator는 `ThreadPoolExecutor(max_workers=3)`로 세 agent를 동시에 호출하고, 성공 또는 partial 결과만 `context.agent_results`에 넣어 synthesizer가 사용할 수 있게 합니다. Phase 3은 synthesizer입니다. synthesizer는 이전 결과를 보고서 형식으로 통합합니다. 마지막으로 trigger option이 켜져 있으면 KB sync Lambda를 비동기로 호출합니다.

진행 상태도 별도 데이터로 남습니다. agent 실행 결과는 `workflows/{project_id}/{agent_name}/result.json`에 저장되고, DynamoDB에는 `kb-{project_id}` 파티션 아래 agent별 결과와 `KB_WORKFLOW_STATUS`가 기록됩니다. UI나 운영 스크립트는 이 상태를 통해 현재 agent, progress, 완료/오류 상태를 확인할 수 있습니다.

<div class="market-flow">
  <span>01 RFP parse</span>
  <span>02 plan topics</span>
  <span>03 parallel search</span>
  <span>04 synthesize report</span>
  <span>05 sync to KB</span>
</div>

## 검색 수집 계층

Jeani의 세 조사 agent는 모두 Brave Search를 사용하지만 같은 검색을 반복하지 않습니다. `ResearcherAgent`는 plan의 `search_keywords` 최대 5개와 `market_topics` 최대 3개를 읽고, 각 쿼리마다 웹 검색 결과를 수집합니다. 수집된 result에는 검색어와 category를 다시 붙여서 후속 LLM 분석에서 어떤 키워드가 어떤 결과를 만들었는지 잃지 않게 합니다.

`CompetitorAgent`는 plan의 경쟁사 목록을 기준으로 회사별 검색을 수행합니다. 각 경쟁사에 대해 "AI 서비스", "디지털 전환", "신규 사업" 주제를 붙인 웹 검색과 최신 뉴스 검색을 분리해 가져오고, LLM 분석 단계에서 threat level, strengths, key activity, market leaders, opportunities로 압축합니다. 경쟁사 이름이 plan에 없으면 기본 산업 컨텍스트의 경쟁사 목록을 fallback으로 사용합니다.

`TechAnalystAgent`는 기술 주제별로 trend 검색과 use case 검색을 나눕니다. 예를 들어 특정 기술에 대해 `트렌드` 쿼리와 `활용 사례` 쿼리를 따로 만들고, 산업 도메인이 있으면 쿼리에 같이 넣습니다. 분석 결과는 maturity, recommendation, must-have tech, nice-to-have tech, trends, risks로 정리되어 제안서 전략에 바로 연결될 수 있는 기술 판단 자료가 됩니다.

검색 helper에는 무료 플랜 rate limit을 고려한 요청 간 지연이 들어 있고, API key는 환경변수 우선으로 읽습니다. 공개 문서에는 키 값을 쓰지 않고 Brave Search integration이라는 역할만 남기는 것이 맞습니다.

<div class="article-table-wrap market-table-wrap">
  <table>
    <thead>
      <tr>
        <th>코드 영역</th>
        <th>분석한 책임</th>
        <th>제품에서 보이는 의미</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>src/kb_intelligence/orchestrator</code></td>
        <td>문서 선택, agent phase 실행, 중복 URL 필터링, report 저장, KB sync trigger</td>
        <td>시장 인텔리전스 workflow의 supervisor</td>
      </tr>
      <tr>
        <td><code>src/shared/document_parser.py</code></td>
        <td>S3 문서를 읽고 docx, pdf, txt, json 입력을 텍스트로 정규화</td>
        <td>RFP 파일 형식 차이를 planner 이전 단계에서 흡수</td>
      </tr>
      <tr>
        <td><code>src/shared/kb_agent_base.py</code></td>
        <td>collect, analyze, evaluate, feedback loop 공통 실행 계약</td>
        <td>agent별 출력 품질을 점수화하고 재분석하는 기반</td>
      </tr>
      <tr>
        <td><code>src/shared/web_search.py</code></td>
        <td>Brave web/news 검색, 경쟁사/기술 주제별 query helper, 요청 지연</td>
        <td>외부 시장 근거 수집을 agent 내부 구현에서 분리</td>
      </tr>
      <tr>
        <td><code>planner/handler.py</code></td>
        <td>RFP 파싱, project context 추출, 경쟁사/키워드/기술 주제 계획</td>
        <td>조사의 질문 자체를 RFP별로 다르게 만드는 계획 단계</td>
      </tr>
      <tr>
        <td><code>researcher/handler.py</code></td>
        <td>검색 키워드와 시장 주제로 Brave Search 수행</td>
        <td>시장 동향과 일반 리서치 근거 수집</td>
      </tr>
      <tr>
        <td><code>competitor/handler.py</code></td>
        <td>경쟁사별 웹/뉴스 검색, threat level, strengths, opportunities 분석</td>
        <td>제안 전략에 필요한 경쟁 구도 파악</td>
      </tr>
      <tr>
        <td><code>tech_analyst/handler.py</code></td>
        <td>기술 주제별 trend/use case 검색과 기술 권고 생성</td>
        <td>제안서에 넣을 기술 선택지와 리스크 정리</td>
      </tr>
      <tr>
        <td><code>synthesizer/handler.py</code></td>
        <td>시장, 경쟁사, 기술 분석을 executive report로 종합</td>
        <td>경영진이 읽을 수 있는 최종 market intelligence report</td>
      </tr>
      <tr>
        <td><code>kb_sync/handler.py</code></td>
        <td>Jeani Market Intelligence KB data source ingestion trigger</td>
        <td>새 보고서를 Bedrock Knowledge Base 검색 대상으로 편입</td>
      </tr>
      <tr>
        <td><code>app/documents</code>, <code>app/api/documents</code></td>
        <td>S3 폴더, 프로젝트별 daily updates, workflow 결과 조회</td>
        <td>운영자가 daily updates와 agent별 산출물을 확인하는 UI</td>
      </tr>
      <tr>
        <td><code>app/api/bedrock/sync</code></td>
        <td>Knowledge Base, data source, ingestion job 조회와 수동 sync 시작</td>
        <td>문서관리 화면에서 KB 동기화 상태를 확인하고 재실행</td>
      </tr>
    </tbody>
  </table>
</div>

<figure class="market-diagram">
  <img src="/images/projects/market-intelligence-data-lifecycle.svg" alt="Market intelligence data lifecycle diagram">
  <figcaption>Data lifecycle. plans와 workflows는 내부 실행 추적용으로 보존하고, daily_updates만 Knowledge Base ingestion 대상으로 분리합니다.</figcaption>
</figure>

## Self-Reflexion 구조

`KBAgentBase`는 KB Intelligence agent들의 공통 실행 계약입니다. 각 agent는 `collect`, `analyze`, `evaluate` 단계를 따릅니다. collect는 Brave Search나 RFP parser처럼 외부 데이터를 가져오는 단계이고, analyze는 Bedrock 모델을 호출해 agent별 JSON schema를 채우는 단계입니다. evaluate는 결과 품질을 점수화하고, 부족하면 개선 피드백을 만들어 다음 분석 prompt에 다시 넣습니다.

이 구조 덕분에 agent별 품질 기준을 다르게 둘 수 있습니다. planner는 경쟁사, 키워드, 기술 주제, 시장 주제, 실행 우선순위가 충분한지 봅니다. researcher는 findings, trends, recommendations를 봅니다. competitor는 analysis summary, competitors, insights, opportunities를 봅니다. tech analyst는 technologies, must-have/nice-to-have tech, trends, risks를 봅니다. synthesizer는 executive summary, strategic recommendations, action items, trend/tech recommendations를 봅니다.

중요한 점은 평가가 단순 boolean이 아니라 다음 시도에 들어가는 feedback이라는 점입니다. 각 agent는 품질 기준을 넘지 못하면 평가 feedback을 다음 prompt에 붙여 다시 분석합니다. planner, researcher, competitor, tech analyst는 최대 2회, synthesizer는 최대 3회까지 반복하도록 설정되어 있습니다. 그래서 이 시스템은 "검색 결과를 LLM에 한 번 넣고 끝"나는 구조가 아니라, 수집 결과를 agent별 schema와 품질 기준에 맞춰 다시 다듬는 구조입니다.

## 저장, 중복 제거, Knowledge Base 경계

S3 폴더 구조는 Jeani에서 중요한 설계입니다. `06_market_intelligence/plans`는 검색 계획, `06_market_intelligence/workflows`는 agent별 실행 결과와 workflow metadata, `06_market_intelligence/daily_updates`는 최종 market intelligence report를 담습니다. KB sync는 daily updates만 Jeani의 Market Intelligence Knowledge Base 대상으로 삼고, plans/workflows는 KB에서 제외합니다. 이렇게 해야 내부 실행 흔적과 최종 검색 대상이 섞이지 않습니다.

또 하나의 세부 설계는 중복 URL 필터링입니다. Orchestrator는 문서별 daily_updates 폴더에서 기존 source URL을 모은 뒤, 새 researcher/competitor/tech analyst 결과의 source를 필터링합니다. 반복 실행될수록 같은 URL이 계속 보고서에 쌓이는 문제를 줄이기 위한 장치입니다.

최종 보고서에는 synthesizer 결과만 들어가지 않습니다. Orchestrator는 `source_data`에 agent별 원본 결과를 붙이고, metadata에는 report id, generated time, project id, RFP document key, agents used, filtered URL count, new source count를 기록합니다. 이 metadata 덕분에 portfolio 관점에서도 Jeani의 시장 조사 루프가 단발성 생성물이 아니라 반복 실행과 누적 지식을 전제로 설계됐다는 점이 드러납니다.

## API와 화면별 기능 매트릭스

<div class="article-table-wrap market-table-wrap">
  <table>
    <thead>
      <tr>
        <th>기능</th>
        <th>Backend / data path</th>
        <th>Frontend surface</th>
        <th>사용자 관점</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>수동 workflow 실행</td>
        <td>KB orchestrator <code>run_workflow</code></td>
        <td>직접 API 또는 운영 스크립트 경로</td>
        <td>특정 RFP 문서에 대해 시장 인텔리전스 리포트를 생성합니다.</td>
      </tr>
      <tr>
        <td>주기 실행</td>
        <td>EventBridge <code>scheduled_run</code></td>
        <td>문서관리 업데이트 결과</td>
        <td><code>00_input_data/</code>의 여러 문서를 일괄 처리하는 자동 실행 경로입니다.</td>
      </tr>
      <tr>
        <td>검색 계획</td>
        <td><code>06_market_intelligence/plans</code></td>
        <td>문서관리 market intelligence folders</td>
        <td>RFP에서 어떤 경쟁사와 키워드를 조사했는지 확인할 수 있습니다.</td>
      </tr>
      <tr>
        <td>Agent 결과 추적</td>
        <td><code>06_market_intelligence/workflows/{project_id}/{agent}</code></td>
        <td>workflow agent map</td>
        <td>planner, researcher, competitor, tech analyst, synthesizer 결과를 단계별로 분리해 봅니다.</td>
      </tr>
      <tr>
        <td>최종 보고서</td>
        <td><code>06_market_intelligence/daily_updates/{document_name}</code></td>
        <td>프로젝트별 market intelligence updates</td>
        <td>문서별 최신 market intelligence report를 시간순으로 확인합니다.</td>
      </tr>
      <tr>
        <td>KB 동기화</td>
        <td><code>kb_sync</code>, Bedrock Knowledge Base ingestion</td>
        <td>Bedrock sync API 및 문서관리 화면</td>
        <td>최종 리포트를 이후 RFP/제안 생성 과정에서 검색 가능한 지식으로 편입합니다.</td>
      </tr>
      <tr>
        <td>문서 탐색</td>
        <td><code>app/api/documents?marketIntelligence=...</code></td>
        <td><code>/documents</code>의 Market Intelligence tab</td>
        <td>S3 폴더를 직접 열지 않고도 운영 산출물을 UI에서 스캔합니다.</td>
      </tr>
    </tbody>
  </table>
</div>

<figure class="market-diagram">
  <img src="/images/projects/market-intelligence-ops-topology.svg" alt="Market intelligence operations topology diagram">
  <figcaption>Operations topology. Terraform은 KB Intelligence Lambda와 EventBridge/S3 trigger를 정의하고, frontend 문서관리 화면은 S3의 market intelligence 산출물을 읽습니다.</figcaption>
</figure>

## 문서관리 UI와 운영 루프

Jeani의 문서관리 화면은 market intelligence 산출물을 단순 파일 목록이 아니라 운영 상태로 보여줍니다. `/api/documents?marketIntelligence=true`는 `06_market_intelligence/` 아래의 `daily_updates`, `plans`, `workflows` 폴더를 읽어 파일 수와 마지막 수정 시각을 반환합니다. `/api/documents?marketIntelligence=projects`는 daily update의 문서별 프로젝트와 workflow 목록을 함께 구성해, 사용자가 어떤 RFP에 대해 어떤 보고서와 agent 결과가 생겼는지 확인하게 합니다.

frontend는 이 데이터를 Market Intelligence tab의 통계, 프로젝트 카드, 업데이트 파일, workflow card, agent badge로 풀어냅니다. agent별 `result.json`은 download action으로 이어지고, Bedrock tab에서는 Knowledge Base와 data source, ingestion job status를 조회하거나 manual sync를 실행할 수 있습니다. 즉 Jeani의 시장 조사 루프는 backend batch 작업에서 끝나지 않고, 운영자가 산출물과 동기화 상태를 확인하는 화면까지 연결됩니다.

포트폴리오 관점의 구현 포인트는 시장 조사 업무를 하나의 prompt가 아니라 data lifecycle로 나눈 데 있습니다. RFP에서 질문을 뽑고, 외부 검색을 agent별로 분리하고, 결과를 평가하며, 최종 보고서만 Knowledge Base에 넣습니다. 여기에 문서관리 UI가 plans, workflows, daily updates, KB sync를 한 화면 흐름으로 묶으면서 제안 업무에서 반복 가능한 시장 인텔리전스 운영 루프를 만듭니다.
