---
title: "Plan2Do - AI 산업안전 위험성평가 플랫폼"
projectName: "Plan2Do"
tagline: "법령 근거가 검증된 위험성평가를 생성하는 산업안전 RAG 엔진"
period: "AsianaIDT / 2025.07 - 2025.12"
periodOrder: 20251215
description: "현장 이미지·문서에서 위험요인을 추출하고, 법령 벡터 검색과 LLM 재검증(removed_laws·removal_rate)으로 근거의 정확성을 보증하며, LangGraph 워크플로우로 위험성평가 표를 생성하는 AI 안전 분석 엔진입니다. 이 엔진을 탑재한 Plan2Do 플랫폼은 행정안전부 장관상·한국건설기술연구원 원장상을 수상했습니다."
metrics:
  - "행안부 장관상 수상 플랫폼"
  - "법령 검증 파이프라인"
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
  - "산업안전보건법·중대재해처벌법·건설기술진흥법 계열 XML을 조·항·호 계층으로 정규화해 Qdrant 법령 검색 corpus를 구축했습니다."
  - "키워드 강화 이중 검색과 법령·조문 편중 방지 cap으로 검색 다양성을 확보하고, 생성된 감소대책의 법령 근거를 LLM으로 재검증해 부적합 근거를 제거하는 파이프라인을 설계했습니다."
  - "LangGraph 상태 머신이 법령 검색 → 위험 분석·감소대책 병렬 생성 → 법령 검증 → HTML 표 생성을 SSE 진행 이벤트로 반환합니다."
order: 25
draft: false
---

<section class="project-lead-panel">
  <span class="project-kicker">AI 엔진 단독 개발 · 2025.07 – 12 · 입사 첫 프로젝트</span>
  <p><strong>Plan2Do는 현장 사진이나 문서에서 위험요인을 찾고, 법령 근거가 붙은 감소대책 표를 생성하는 AI 안전도우미입니다. 이 프로젝트의 진짜 기술 문제는 생성이 아니라 검증이었습니다 — LLM은 그럴듯한 법령을 "지어서" 붙이기 때문입니다.</strong></p>
  <p>이 글은 산업안전 도메인 RAG의 세 가지 문제를 다룹니다. ① 법령 원문을 검색 가능한 corpus로 만드는 전처리, ② 위험 설명과 법령 사이의 어휘 간극을 메우는 검색 전략, ③ 검색이 붙인 근거를 생성 이후 다시 심판하는 법령 준수 검증.</p>
</section>

## 문제: 잘못된 법령 인용은 "틀린 답"보다 위험하다

산업안전 담당자가 위험성평가 표를 만들 때 각 감소대책에는 근거 법령이 붙어야 합니다. 그런데 LLM 기반 생성에는 두 가지 실패 모드가 있습니다. 근거 없이 법령명을 환각하거나, 벡터 검색이 가져온 조문 중 실제로는 해당 대책과 무관한 것을 그대로 인용하는 경우입니다. 안전 업무에서 무관한 법령이 근거로 붙은 표는 검토자의 신뢰를 통째로 무너뜨립니다.

그래서 이 엔진은 "검색해서 붙인다"에서 멈추지 않고, **corpus 구축 → 이중 검색 → 편중 방지 → 생성 후 재검증**의 4단계로 근거 품질을 통제합니다.

<figure class="project-diagram">
  <img src="/images/projects/plan2do-overall-architecture.svg" alt="Plan2Do overall architecture diagram">
  <figcaption>전체 구조. 현장 입력을 산업안전 관련성으로 분류하고, 법령 corpus·이중 검색·LangGraph 위험성평가·SSE 리포트로 연결합니다.</figcaption>
</figure>

## 딥다이브 ① 법령 XML을 검색 가능한 계층 corpus로

법령 원문은 국가법령 XML로 제공되지만 그대로는 검색 corpus가 되지 못합니다. 원문자(①②③), 특수기호, HTML 태그, 전각 문자가 섞여 있어 임베딩 품질을 해치고, 무엇보다 법령은 평평한 텍스트가 아니라 **법령 → 조 → 항 → 호**의 계층 구조입니다.

전처리기는 문자 정규화를 수행한 뒤 조문을 계층 단위로 분할하고, 각 chunk의 제목에 상위 계층(법령명·조 번호)을 포함시킵니다. "제38조 제1항"만으로는 어느 법의 조문인지 알 수 없기 때문에, 검색 결과가 그 자체로 인용 가능한 표기("산업안전보건법 제38조(안전조치) 제1항")가 되도록 만든 것입니다. 이렇게 만든 chunk는 text-embedding-3-large로 임베딩되어 Qdrant 컬렉션에 적재됩니다. 대상 corpus는 산업안전보건법·중대재해처벌법·건설기술진흥법 계열 법령과 행정규칙입니다.

## 딥다이브 ② 검색 — 어휘 간극과 편중을 함께 잡기

위험 설명("고소 작업 중 작업자가 안전대를 걸지 않음")과 법령 조문("사업주는 추락할 위험이 있는 장소에서…")은 같은 내용을 다른 어휘로 말합니다. 위험 설명을 그대로 임베딩해 검색하면 이 간극에서 recall이 샙니다.

그래서 검색을 이중으로 수행합니다. 먼저 LLM이 위험 설명에서 안전 도메인 키워드를 추출하고(JSON 파싱 실패 시 정규식·명사 기반 fallback), **원본 설명 검색**과 **키워드 강화 검색**을 각각 수행한 뒤 가중치를 두어 병합·재순위화합니다.

병합 단계에는 편중 방지 cap을 둡니다 — 같은 법령에서 최대 2건(per-law cap), 같은 조에서 최대 1건(per-article cap). 유사도 상위만 자르면 검색 결과가 특정 법령 한 곳의 인접 조문들로 도배되는데, 위험성평가 근거는 서로 다른 법령·조문을 폭넓게 커버할수록 유용하기 때문입니다. 유사도 순위를 다양성 제약과 교환한 설계입니다.

<figure class="project-diagram">
  <img src="/images/projects/plan2do-deepdive-search.svg" alt="Plan2Do dual legal search and law cap diagram">
  <figcaption>이중 검색 구조. 원본 설명 검색과 키워드 강화 검색을 병렬로 수행하고, 법령·조문 cap으로 근거 편중을 줄입니다.</figcaption>
</figure>

## 딥다이브 ③ 법령 준수 검증 — 검색이 붙인 근거를 다시 심판한다

이 프로젝트의 핵심 트러블슈팅입니다. 이중 검색과 cap으로도 "검색은 됐지만 이 대책과는 무관한" 조문이 근거로 붙는 문제가 남았습니다. 벡터 유사도는 관련성의 필요조건이지 충분조건이 아니기 때문입니다.

해결은 생성 이후에 검증 단계를 별도로 두는 것이었습니다. 감소대책이 만들어지면, **각 대책 단위로** LLM에게 매칭된 법령 목록을 다시 판정시킵니다 — 이 법령이 해당 위험요인 해결과 감소대책에 직접 관련이 있는가. 판정 결과는 구조화된 JSON으로 받습니다:

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>validated_laws</strong>
    <p>위험요인·감소대책과 직접 관련이 확인되어 유지하는 법령 목록.</p>
  </div>
  <div class="project-fact">
    <strong>removed_laws</strong>
    <p>무관하다고 판정되어 제거하는 법령 목록. 대책 자체는 변경하지 않고 근거만 정리합니다.</p>
  </div>
  <div class="project-fact">
    <strong>overall_relevance</strong>
    <p>매칭 전체의 적절성 점수(0–1). 검증 품질의 모니터링 신호로 사용합니다.</p>
  </div>
  <div class="project-fact">
    <strong>removal_rate</strong>
    <p>전체 매칭 대비 제거 비율(%). 최종 리포트에 "검증에서 몇 건이 걸러졌는지"로 함께 표기됩니다.</p>
  </div>
</div>

중요한 설계 결정은 제거 내역을 숨기지 않는 것입니다. 최종 HTML 리포트에는 검증 요약 — 유지·제거 건수와 removal_rate — 이 함께 표기됩니다. 검토자는 "이 표의 근거는 기계가 한 번 걸러낸 것"임을 알고 보게 되고, 제거율이 비정상적으로 높으면 검색 단계의 문제를 역추적하는 신호가 됩니다. 생성형 시스템에서 신뢰는 결과가 아니라 **검증 과정의 가시화**에서 나온다는 것이 이 단계에서 얻은 결론입니다.

<figure class="project-diagram">
  <img src="/images/projects/plan2do-deepdive-validation.svg" alt="Plan2Do legal compliance validation diagram">
  <figcaption>법령 준수 검증. 감소대책 단위로 매칭 법령을 LLM이 재판정해 validated_laws / removed_laws / overall_relevance로 구조화하고, removal_rate 집계를 최종 HTML 리포트에 그대로 표기합니다.</figcaption>
</figure>

## 실행 구조 — LangGraph 상태 머신과 SSE

전체 흐름은 LangGraph 상태 머신 하나로 이어집니다. 위험요인 입력을 정규화하고, 위험요인별 법령 검색을 수행한 뒤, 위험 상세 분석과 감소대책 생성을 **병렬로** 실행하고, 법령 검증을 거쳐 검토용 HTML 표(체크박스·위험요인·예상 위험 수준·감소대책·관련 근거)를 생성합니다.

<div class="project-flow">
  <span>01 입력 정규화</span>
  <span>02 법령 검색 (이중 검색 + cap)</span>
  <span>03 위험 분석 ∥ 감소대책 생성</span>
  <span>04 법령 준수 검증</span>
  <span>05 HTML 표 + 검증 요약 반환</span>
</div>

<figure class="project-diagram">
  <img src="/images/projects/plan2do-risk-workflow.svg" alt="Plan2Do risk analysis workflow diagram">
  <figcaption>법령 검색이 먼저 수행되고, 위험 분석과 감소대책 생성이 병렬로 진행된 뒤 법령 검증과 HTML 표 생성으로 합류합니다.</figcaption>
</figure>

분석은 수십 초 단위의 긴 작업이므로 단계 완료마다 SSE 이벤트(법규 검색 완료, 감소대책 수립 완료, 결과 테이블 생성 완료 등)를 흘려보내 클라이언트가 진행 상황을 보여줄 수 있게 했습니다. 입력 채널은 세 가지입니다 — 현장 이미지(산업안전 관련성 분류 후 vision 분석, 무관 이미지는 거절), 텍스트 질의(위험성평가 키워드 감지 시 workflow 진입), PDF/이미지 문서(파일별·통합 분석). 이미지 다중 처리는 asyncio 병렬로 수행합니다.

<figure class="project-diagram">
  <img src="/images/projects/plan2do-runtime-topology.svg" alt="Plan2Do runtime topology diagram">
  <figcaption>FastAPI 엔진이 AI provider, PostgreSQL, Qdrant 법령 검색, vector build/load 파이프라인과 연결됩니다.</figcaption>
</figure>

런타임은 FastAPI 엔진 + PostgreSQL(대화·질문·답변·참조 이력) + Qdrant를 Docker Compose로 묶고, 벡터 초기화 작업이 corpus 빌드와 적재를 담당합니다.

## 수상과 기여의 관계

Plan2Do 플랫폼은 **행정안전부 안전산업진흥 유공 장관상('25)**과 **한국건설기술연구원 원장상('25)**을 수상했습니다. 수상 주체는 Plan2Do 플랫폼이고, 나는 이 플랫폼에 탑재된 AI 위험성평가 엔진 — 이 글에서 설명한 법령 RAG·검증 파이프라인·워크플로우 — 을 단독 개발했습니다.

## 정리

입사 후 첫 프로젝트였고, "생성형 AI를 안전 업무에 쓸 수 있는가"라는 질문에 대한 나의 답은 **검증 계층을 생성과 분리해서 세우는 것**이었습니다. 법령 계층을 보존한 corpus, 어휘 간극을 메우는 이중 검색, 편중을 막는 cap, 그리고 생성 후 근거를 다시 심판해 제거 내역까지 공개하는 법령 준수 검증 — 이 구조는 이후 AIO 플랫폼에 검색 전략과 법령 검증 노드로 이식되어 사내 공용 워크플로우의 일부가 되었습니다.
