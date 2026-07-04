---
title: "Jeani Market Intelligence Multi-Agent System"
projectName: "Jeani"
tagline: "RFP 기반 제안서·시장 인텔리전스 멀티에이전트 플랫폼"
period: "AsianaIDT / AWS EST 과정 2025.09.08 - 12.05 · 집중 개발 2025.11 - 12"
periodOrder: 20251200
description: "RFP를 분석·수정하는 8+8 에이전트 파이프라인 위에, 시장 인텔리전스를 자동 수집해 Bedrock Knowledge Base로 동기화하는 KB Intelligence 오케스트레이터를 얹은 팀 프로젝트입니다. 본인 담당: 프론트엔드, KB Intelligence 오케스트레이터, IaC."
metrics:
  - "KB Intelligence 5 Agents"
  - "8+8 분석·수정 에이전트"
  - "BFF 라우트 14"
stack:
  - "AWS Lambda"
  - "Amazon S3"
  - "DynamoDB"
  - "EventBridge"
  - "AWS Bedrock"
  - "Bedrock Knowledge Base"
  - "Terraform"
  - "Next.js"
  - "TypeScript"
details:
  - "시장 인텔리전스 수집을 supervisor 오케스트레이터 + 5개 전문 에이전트(planner/researcher/competitor/tech analyst/synthesizer)로 설계하고 KB 동기화까지 자동화했습니다. (본인 담당)"
  - "Next.js 프론트엔드와 14개 BFF 라우트를 구현하고, S3 단일 소스 원칙으로 클라이언트 상태 불일치를 해결했습니다. (본인 담당)"
  - "AWS EST Gen AI 실무 역량 강화 과정(2025.09.08–12.05, 13주)의 팀 프로젝트로 수행하고 과정을 이수했습니다."
order: 40
draft: false
---

<section class="market-lead-panel">
  <span class="market-kicker">Team3 팀 프로젝트 · 본인: 프론트엔드 · KB Intelligence 오케스트레이터 · IaC</span>
  <p><strong>Jeani는 RFP를 읽고 제안서 작업을 돕는 멀티에이전트 시스템입니다. 팀이 RFP 분석·수정 에이전트 파이프라인을 만들었고, 나는 그 위에 세 가지를 얹었습니다 — 시장 정보를 스스로 수집해 Knowledge Base를 최신으로 유지하는 KB Intelligence 오케스트레이터, 사용자가 만나는 프론트엔드와 BFF 전체, 그리고 Terraform 인프라 정의.</strong></p>
  <p>이 글은 팀 산출물과 내 기여를 구분해서 씁니다. 딥다이브는 내가 설계한 두 지점입니다 — ① supervisor 패턴의 KB Intelligence 파이프라인, ② S3를 단일 소스로 만드는 과정에서 잡은 3중 원인 트러블슈팅.</p>
</section>

## 시스템 전체 — 팀이 만든 것

Jeani의 본체는 RFP 문서를 8개 관점(개요·요구사항·구조·인력·문서·발표·질의·현황)으로 병렬 분석하는 **analyzer 에이전트 8종**과, 같은 8개 관점으로 제안 산출물을 수정하는 **modifier 에이전트 8종**입니다. 각 에이전트는 Lambda로 배포되고 오케스트레이터가 병렬 호출·결과 통합을 담당합니다. 인증(Cognito)과 CI/CD는 팀원이 구축했습니다.

<figure class="market-diagram">
  <img src="/images/projects/market-intelligence-overall.svg" alt="Jeani overall architecture and contribution boundary diagram">
  <figcaption>전체 구조와 기여 경계. 프론트엔드·BFF, KB Intelligence, IaC는 본인 담당이고, RFP 8+8 에이전트·인증·CI/CD는 팀 산출물로 분리됩니다.</figcaption>
</figure>

이 구조의 약점은 지식의 신선도였습니다. 제안서 작업에는 "지금의" 시장·경쟁사·기술 동향이 필요한데, Knowledge Base는 넣어준 문서만 압니다. 여기가 내가 맡은 지점입니다.

## 딥다이브 ① KB Intelligence — Knowledge Base가 스스로 최신이 되게 하기

설계 목표는 "사람이 시장 조사 문서를 갱신해 넣는" 운영을 없애는 것이었습니다. 구조는 supervisor 패턴입니다 — **오케스트레이터** 하나가 5개 전문 에이전트를 조정합니다.

<div class="market-feature-grid">
  <div class="market-feature-card">
    <h3>Planner</h3>
    <p>S3의 RFP 문서를 파싱해 조사 계획을 만듭니다. 경쟁사(name/priority/reason), 검색 키워드(keyword/category/purpose), 기술·시장 주제(search_query 포함)를 담은 plan schema가 후속 에이전트의 입력 계약입니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>Researcher</h3>
    <p>시장 동향 검색면을 담당합니다. plan의 시장 주제를 실제 검색 질의로 실행하고 출처별 결과를 수집합니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>Competitor</h3>
    <p>경쟁사 목록을 우선순위 순으로 조사합니다. 같은 plan을 공유하되 검색면과 품질 기준이 다릅니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>Tech Analyst</h3>
    <p>기술 트렌드 검색면을 담당합니다. 기술 주제별 search_query를 실행합니다.</p>
  </div>
  <div class="market-feature-card">
    <h3>Synthesizer</h3>
    <p>세 검색면의 결과를 종합 보고서로 만들고, 출처 중복(duplicate URL) 필터링 메타데이터를 남깁니다.</p>
  </div>
</div>

오케스트레이터는 이 에이전트들을 ThreadPoolExecutor로 **병렬 호출**하고, 결과를 통합해 daily_updates 경로에 저장한 뒤 **KB 동기화를 자동 트리거**합니다. EventBridge 스케줄로 주기 실행되므로, RFP가 들어오면 그 프로젝트 맥락으로, 없으면 기본 컨텍스트로 시장 정보가 계속 갱신됩니다. 계획은 프로젝트별 search_plan.json으로 남겨 "이 보고서가 어떤 질문에서 나왔는지"를 추적할 수 있게 했습니다.

핵심 설계 판단은 **계획과 실행의 분리**입니다. 검색 키워드를 에이전트마다 하드코딩하면 RFP가 바뀔 때마다 코드가 바뀝니다. Planner가 RFP에서 plan schema를 뽑고 나머지가 그 계약을 실행하는 구조로, 새 도메인의 RFP에도 코드 수정 없이 대응합니다.

<figure class="market-diagram">
  <img src="/images/projects/market-deepdive-kb-supervisor.svg" alt="Jeani KB Intelligence supervisor pipeline diagram">
  <figcaption>KB Intelligence supervisor 파이프라인. Planner가 plan schema(계약)를 산출하고, Researcher·Competitor·Tech Analyst가 ThreadPoolExecutor로 병렬 실행되며, Synthesizer 종합 후 daily_updates 저장과 KB 동기화가 자동으로 이어집니다.</figcaption>
</figure>

## 딥다이브 ② S3 표시 트러블슈팅 — 원인은 하나가 아니었다

프론트엔드에서 "S3에는 있는 제안서가 화면에 안 보이거나, 삭제된 것이 계속 보이는" 문제가 있었습니다. 전형적인 "새로고침하면 가끔 고쳐지는" 종류의 버그였고, 원인은 세 겹이었습니다.

**① 캐시 계층.** Next.js는 fetch와 라우트 응답을 여러 층에서 캐싱합니다. S3 목록처럼 갱신이 잦은 데이터가 stale하게 남았습니다. 데이터 조회 fetch에 `cache: 'no-store'`를 강제하고, BFF 라우트 응답에도 `Cache-Control: no-store, no-cache, must-revalidate` 헤더를 명시해 클라이언트·서버 양쪽 캐시를 껐습니다.

**② 빈 응답을 믿는 로직.** 일시적 오류나 동기화 타이밍에 API가 빈 목록을 반환하면, 클라이언트가 이를 "데이터 없음"으로 신뢰하고 로컬 상태를 비워버렸습니다. 실패·빈 응답을 상태 덮어쓰기의 근거로 쓰지 않도록 응답 검증을 분리했습니다.

**③ 상태 소스의 이원화.** 근본 원인은 localStorage와 S3가 각자 진실을 주장하는 구조였습니다. 해결로 **S3SyncProvider**를 앱 루트에 두어, 앱 시작 시 S3 목록을 가져와 localStorage를 전부 비우고 S3 데이터로 재구성하게 했습니다 — "로컬은 캐시일 뿐, 진실은 S3"라는 단일 소스 원칙을 컴포넌트가 아니라 앱 계층에서 강제한 것입니다.

교훈은 단순합니다. 상태 불일치 버그에서 첫 번째 수정(캐시 헤더)이 증상을 줄였다고 멈췄다면 ②③이 계속 재발했을 것입니다. 세 원인을 분리해 각각 잡고, 마지막에 구조(단일 소스)로 재발을 막았습니다.

<figure class="market-diagram">
  <img src="/images/projects/market-deepdive-s3-sync.svg" alt="Jeani S3 display troubleshooting and single-source diagram">
  <figcaption>S3 표시 불일치 트러블슈팅. 캐시 계층·빈 응답 신뢰·상태 소스 이원화 세 원인을 각각 해결하고, S3SyncProvider가 앱 시작 시 S3 기준으로 로컬 상태를 재구성해 재발을 구조적으로 막습니다.</figcaption>
</figure>

## 프론트엔드와 BFF — 사용자 표면 전체

프론트엔드는 Next.js(App Router)로 대시보드·현황 분석·검색·프로필 화면을 만들고, 제안서·발표자료 다운로드(docx/pptx export)까지 연결했습니다. 백엔드 Lambda들과 브라우저 사이에는 **BFF 라우트 14개**를 두었습니다 — RFP 업로드/분석, 제안서 목록·상세·갱신 폴링, 수정 요청과 콜백(webhook), S3 이벤트 수신, KB 동기화 트리거, 문서·결과 조회, ppt/docx export, health. 브라우저가 AWS 자원을 직접 만지지 않고 BFF가 인증·응답 정형화·캐시 정책을 관장하는 경계입니다.

## IaC — Terraform으로 재현 가능한 배포

KB Intelligence를 포함한 인프라는 Terraform으로 정의했습니다. Lambda 함수들, S3 prefix 구조, DynamoDB, EventBridge 스케줄, Bedrock KB 연결이 코드로 관리되어 팀원 누구나 같은 환경을 재현할 수 있습니다.

## 과정과 팀

Jeani는 **AWS EST(Enterprise Skills Transformation) Gen AI 실무 역량 강화 과정** — 2025.09.08–12.05, 13주 — 의 팀 프로젝트(Team3)로 수행했고, 과정을 이수했습니다. 교육은 AWS 정규 직원 강의와 실습(Generative AI on AWS, Agentic AI, Advanced RAG, MCP, SageMaker/MLOps)으로 구성됐고, 집중 개발은 2025.11–12에 이루어졌습니다. 분석·수정 에이전트 16종과 인증·CI/CD는 팀 산출물이며, 이 글의 딥다이브 두 지점(KB Intelligence, 프론트·BFF)과 IaC가 나의 기여입니다.

## 정리

이 프로젝트에서 내 역할은 "에이전트를 하나 더 만든 것"이 아니라 **시스템이 스스로 최신 지식을 유지하는 루프**와 **사용자가 신뢰할 수 있는 상태 표면**을 만든 것입니다. supervisor 패턴의 수집 파이프라인은 계획(plan schema)과 실행을 분리해 도메인 변경에 강하고, S3 단일 소스 원칙은 멀티에이전트가 뒤에서 무엇을 갱신하든 화면이 진실을 보여주게 합니다. AWS 네이티브 서버리스 구성에서 에이전트 시스템을 팀으로 만드는 경험 — 역할 분담, 계약 정의, 인프라 코드화 — 이 이 프로젝트의 가장 큰 수확이었습니다.
