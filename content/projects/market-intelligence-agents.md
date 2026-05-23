---
title: "Jeani Market Intelligence Multi-Agent System"
projectName: "Jeani"
tagline: "RFP 기반 시장 인텔리전스 에이전트"
period: "AsianaIDT / 2025.07 - 2025.11"
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
  - "중복 소스 후보를 비교해 backend는 Jeani-back-main의 kb_intelligence 구현과 Terraform 운영 계약을 기준으로 삼았습니다."
  - "Planner가 RFP에서 경쟁사, 검색 키워드, 기술 주제를 추출하고 researcher, competitor, tech_analyst가 병렬로 조사합니다."
  - "Synthesizer가 최종 리포트를 만들면 daily_updates에 저장하고, KB Sync가 Jeani의 Market Intelligence Knowledge Base 인제스천을 트리거합니다."
order: 40
draft: false
---

<section class="market-lead-panel">
  <span class="market-kicker">Service Thesis</span>
  <p><strong>Jeani는 RFP를 읽고 "무엇을 조사해야 하는가"부터 다시 계획하는 시장 조사 에이전트 파이프라인입니다.</strong></p>
  <p>단일 챗봇에 시장 조사를 맡기면 검색어 선정, 경쟁사 범위, 기술 트렌드, 출처 중복, 최종 보고서 저장 경로가 흐려집니다. Jeani는 RFP 문서를 기준으로 조사 계획을 만들고, 시장 리서치, 경쟁사 분석, 기술 분석, 종합 보고, Knowledge Base 동기화를 분리된 Lambda agent와 S3 lifecycle로 다룹니다.</p>
</section>

## 최종판을 먼저 판별하기

`/Users/mean/Downloads/Jeani`에는 같은 계열의 backend와 frontend 후보가 두 벌씩 들어 있었습니다. backend의 `EST-Agent-main/src`와 `Jeani-back-main/src`는 동일했지만, `Jeani-back-main`에는 CDK 문서, KMS fix summary, pipeline/validation 문서, `.kiro` steering 문서가 더 들어 있었습니다. 따라서 시장 인텔리전스의 실제 기능은 공통 `src/kb_intelligence`를 기준으로 읽되, 운영판 판단은 `Jeani-back-main`으로 잡았습니다.

frontend도 `Jeani-front-main`이 후속판입니다. 특히 `/documents` 화면과 `/api/documents` route는 `06_market_intelligence/` 아래의 `daily_updates`, `plans`, `workflows` 폴더를 읽고, planner/researcher/competitor/tech_analyst/synthesizer 결과를 문서관리 UI에서 보여주는 경로를 포함합니다. 이 때문에 기존 페이지의 "25 agents"나 추상적인 4-Layer 표현보다, Jeani 소스에 있는 5개 KB Intelligence agent와 S3/Bedrock KB 동기화 흐름을 중심으로 설명하는 편이 정확합니다.

<div class="market-fact-grid">
  <div class="market-fact">
    <strong>최종 backend</strong>
    <p><code>Jeani-back-main</code>의 <code>src/kb_intelligence</code>와 Terraform 정의를 기준으로 분석했습니다.</p>
  </div>
  <div class="market-fact">
    <strong>최종 frontend</strong>
    <p><code>Jeani-front-main</code>의 문서관리 화면이 Jeani의 market intelligence folders와 workflow 결과를 노출합니다.</p>
  </div>
  <div class="market-fact">
    <strong>검증 범위</strong>
    <p>코드와 배포 계약으로 확인되는 구조를 설명하고, 실제 AWS 실행 성공은 새로 주장하지 않습니다.</p>
  </div>
</div>

## 시스템을 다시 정의하면

Jeani의 핵심은 시장 조사 결과를 한 번 생성하는 것이 아닙니다. RFP마다 조사 대상이 달라진다는 점을 시스템 경계로 끌어올린 것이 핵심입니다. `PlannerAgent`는 `00_input_data/`의 RFP 문서를 읽고 프로젝트 요약, 고객사, 산업, 경쟁사, 검색 키워드, 기술 주제, 시장 주제, 실행 우선순위를 만듭니다. 이후 `ResearcherAgent`, `CompetitorAgent`, `TechAnalystAgent`가 같은 plan을 받아 병렬로 외부 검색과 분석을 수행합니다.

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

실행 단계는 세 개입니다. Phase 1은 planner입니다. planner는 RFP를 읽고 검색 계획을 만듭니다. Phase 2는 researcher, competitor, tech analyst의 병렬 실행입니다. researcher는 검색 키워드와 시장 주제를 사용하고, competitor는 경쟁사별 검색과 뉴스 검색을 수행하며, tech analyst는 기술 주제별 트렌드와 활용 사례를 찾습니다. Phase 3은 synthesizer입니다. synthesizer는 이전 결과를 보고서 형식으로 통합합니다. 마지막으로 trigger option이 켜져 있으면 KB sync Lambda를 비동기로 호출합니다.

<div class="market-flow">
  <span>01 RFP parse</span>
  <span>02 plan topics</span>
  <span>03 parallel search</span>
  <span>04 synthesize report</span>
  <span>05 sync to KB</span>
</div>

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
        <td>S3 폴더와 workflow 결과 조회</td>
        <td>운영자가 daily updates와 agent별 산출물을 확인하는 UI</td>
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

이 구조 덕분에 agent별 품질 기준을 다르게 둘 수 있습니다. planner는 경쟁사, 키워드, 기술 주제, 시장 주제, 실행 우선순위가 충분한지 봅니다. researcher는 findings, trends, recommendations를 봅니다. competitor는 competitor 분석, insights, opportunities를 봅니다. tech analyst는 technologies, must-have/nice-to-have tech, trends, risks를 봅니다. synthesizer는 executive summary, strategic recommendations, action items, trend/tech recommendations를 봅니다.

## S3와 Knowledge Base 경계

S3 폴더 구조는 Jeani에서 중요한 설계입니다. `06_market_intelligence/plans`는 검색 계획, `06_market_intelligence/workflows`는 agent별 실행 결과와 workflow metadata, `06_market_intelligence/daily_updates`는 최종 market intelligence report를 담습니다. KB sync는 daily updates만 Jeani의 Market Intelligence Knowledge Base 대상으로 삼고, plans/workflows는 KB에서 제외합니다. 이렇게 해야 내부 실행 흔적과 최종 검색 대상이 섞이지 않습니다.

또 하나의 세부 설계는 중복 URL 필터링입니다. Orchestrator는 문서별 daily_updates 폴더에서 기존 source URL을 모은 뒤, 새 researcher/competitor/tech analyst 결과의 source를 필터링합니다. 반복 실행될수록 같은 URL이 계속 보고서에 쌓이는 문제를 줄이기 위한 장치입니다.

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

## 운영 경계와 한계

Jeani는 backend 기능과 운영 계약이 꽤 분명합니다. Terraform에는 KB Intelligence Lambda group, EventBridge daily schedule, S3 object-created notification, KB sync Lambda가 정의되어 있습니다. frontend에는 market intelligence folders와 workflow를 읽는 문서관리 API와 UI가 있습니다. 다만 CDK 쪽은 RFP core Lambda/API/pipeline을 중심으로 정리되어 있고, market intelligence 자동 실행 경계는 Terraform 쪽이 더 직접적입니다.

현재 글은 소스 분석 기반입니다. 실제 AWS 계정에서 EventBridge가 마지막으로 언제 실행됐는지, Bedrock ingestion job이 성공했는지는 이 문서 작성 과정에서 새로 확인하지 않았습니다. 그래서 "배포되어 정상 운영 중"이라고 쓰지 않고, 코드와 IaC가 어떤 실행 경계를 정의하는지만 설명했습니다.

포트폴리오 관점의 기여는 Jeani에서 시장 조사 업무를 하나의 prompt가 아니라 data lifecycle로 나눈 데 있습니다. RFP에서 질문을 뽑고, 외부 검색을 agent별로 분리하고, 결과를 평가하며, 최종 보고서만 Knowledge Base에 넣는 구조는 제안 업무에서 반복 가능한 시장 인텔리전스 루프를 만들기 위한 설계입니다.
