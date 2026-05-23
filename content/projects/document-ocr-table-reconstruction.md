---
title: "InVision OCR Suite — 문서 OCR 및 표 구조 복원 스택"
projectName: "InVision OCR Suite"
tagline: "문서 OCR 및 표 구조 복원 스택"
period: "AsianaIDT / 2026.02 - 2026.05"
description: "자체 구축 InVision OCR Engine, 레이아웃 분석, PDF 문서 복원, 표 구조 추출, 배치 처리, 운영 UI, 연구 벤치마크, 보안 납품 프로필을 하나로 묶은 문서 OCR 제품 스택입니다."
metrics:
  - "InVision OCR Engine"
  - "Document Parser"
  - "Table Reconstruction"
stack:
  - "FastAPI"
  - "Next.js"
  - "InVision OCR Engine"
  - "Private Model Serving"
  - "Document Parser"
  - "Table Reconstruction"
  - "SQLite"
  - "Docker"
details:
  - "FastAPI feature router registry와 Next.js feature composition을 기준으로 OCR, layout, parser, batch, template report, admin, benchmark, experimental 기능을 선택적으로 노출하는 제품 구조를 설계했습니다."
  - "자체 구축한 InVision OCR Engine과 문서 레이아웃/표 구조 분석 엔진을 서빙하고, 내부 후보 선택 파이프라인으로 표 중심 문서의 구조 복원을 다뤘습니다."
  - "단건 업로드 화면을 넘어 PDF 페이지 선택, 영역 지정, 이력 저장, 결과 재처리, 템플릿 리포트, 관리자, 연구 벤치마크 화면까지 운영 흐름을 연결했습니다."
  - "Docker unified/standalone/dev/gpu/research/customer/monitoring 프로필과 secure delivery, license lock, feature pruning 테스트를 통해 배포와 납품 경계를 코드로 관리했습니다."
order: 30
draft: false
---

<section class="ppocr-lead-panel">
  <span class="ppocr-kicker">Service Thesis</span>
  <p><strong>InVision OCR Suite는 이미지를 텍스트로 바꾸는 단일 OCR API가 아니라, 문서가 들어와 검수 가능한 결과와 납품 가능한 런타임으로 나가기까지의 전체 흐름을 다루는 문서 처리 스택입니다.</strong></p>
  <p>이 프로젝트의 핵심은 "OCR 결과가 나왔다"가 아니라 "어떤 입력이 어떤 feature profile에서 처리됐고, 레이아웃과 표 구조 후보가 어떻게 선택됐으며, 사용자가 UI에서 결과를 다시 확인하고, 운영자는 이력과 배포 형태를 어떻게 관리하는가"입니다. 그래서 저장소는 FastAPI 백엔드, Next.js 웹 앱, 문서 복원 parser, 표 구조 파이프라인, 연구 벤치마크, 보안 납품 빌드를 함께 갖고 있습니다.</p>
</section>

## 프로젝트를 다시 정의하면

`pp-ocr` 저장소의 현재 모습은 OCR 모델을 감싼 API 서버보다 큽니다. `app/main.py`는 기능별 router를 registry로 등록하고, `build/config/registry.json`은 `ocr`, `batch`, `layout`, `parser`, `template-report`, `benchmark`, `experimental` 계열, `admin.*` 기능이 API와 Web 표면에 어떻게 노출되는지 정의합니다. 즉 프로젝트의 중심은 "모델 하나"가 아니라 **기능 선택, 런타임 준비 상태, 화면 노출, 배포 프로필을 함께 묶는 제품 경계**입니다.

사용자 관점에서 보면 InVision OCR Suite는 이미지나 PDF를 올리고, OCR 또는 Layout OCR을 선택하고, 표/그림/본문 영역을 확인하며, 결과를 이력으로 저장하거나 재처리합니다. 숙련자는 threshold, layout option, table backend, parser quality mode를 조절하고, 연구자는 benchmark 화면에서 데이터셋과 방법 조합을 비교합니다. 관리자는 사용자, 이력, 템플릿, AI 보조 설정, anchor weight 같은 운영 항목을 확인합니다.

기술 관점에서 보면 FastAPI는 인증, 이력, OCR, 레이아웃, batch, parser, benchmark, experimental, admin router를 묶고, Next.js는 같은 feature composition을 읽어 화면의 navigation과 기능 접근을 결정합니다. OCR 경로는 자체 구축한 `InVision OCR Engine`을 서빙하고, 문서 구조화 경로는 내부 레이아웃 분석 엔진, 표 구조 파이프라인, PDF digital text strategy를 조합합니다. 배포는 API와 웹을 하나로 묶는 unified image, 분리형 standalone, dev/gpu/research/customer/monitoring profile, secure delivery 경로로 나뉩니다.

<div class="ppocr-fact-grid">
  <div class="ppocr-fact">
    <strong>문제</strong>
    <p>문서 OCR은 텍스트만 맞아도 충분하지 않습니다. 표 구조, 페이지 맥락, PDF 원문 레이어, 사용자 검수, 재처리, 이력 관리가 함께 필요합니다.</p>
  </div>
  <div class="ppocr-fact">
    <strong>접근</strong>
    <p>OCR, layout, parser, batch, template, benchmark를 feature 단위로 분리하고 같은 API/UI/배포 계약 위에 올렸습니다.</p>
  </div>
  <div class="ppocr-fact">
    <strong>결과</strong>
    <p>데모 화면, 연구 실험, 고객 납품 이미지, 보안 라이선스 런타임을 같은 저장소 안에서 추적 가능한 제품 스택으로 연결했습니다.</p>
  </div>
</div>

<div class="ppocr-shot-grid">
  <figure class="ppocr-shot">
    <img src="/images/projects/pp-ocr-main-page.jpg" alt="InVision OCR main upload and analysis screen">
    <figcaption>메인 OCR 화면. 파일 업로드, OCR/Layout 처리, 결과 확인, 이력 접근이 하나의 작업 표면으로 연결됩니다.</figcaption>
  </figure>
  <figure class="ppocr-shot">
    <img src="/images/projects/pp-ocr-result-review.jpg" alt="InVision OCR result review screen">
    <figcaption>결과 검수 화면. 페이지 이미지와 OCR/레이아웃 결과를 나란히 두고 표와 영역 결과를 검토합니다.</figcaption>
  </figure>
  <figure class="ppocr-shot">
    <img src="/images/projects/pp-ocr-template-report.jpg" alt="InVision OCR template report screen">
    <figcaption>템플릿 리포트 화면. 정형 문서 처리와 저장된 결과 확인을 운영 흐름으로 확장합니다.</figcaption>
  </figure>
</div>

## 제품 표면

서비스 표면은 크게 여덟 가지입니다. 첫째, 기본 OCR은 `POST /predict`로 이미지와 PDF에서 텍스트를 추출합니다. 둘째, 옵션 OCR은 `POST /predict/options`로 detection threshold, recognition threshold, layout 사용 여부, table enhancement 같은 요청별 설정을 받습니다. 셋째, Layout OCR은 `POST /predict/layout`에서 제목, 본문, 표, 그림 같은 문서 영역과 OCR 결과를 함께 반환합니다. 넷째, `POST /predict/regions`는 템플릿 기반 업무처럼 지정 영역만 OCR할 수 있게 합니다.

다섯째, batch와 ZIP 경로는 `POST /predict/batch`, `POST /predict/zip`, `GET /tasks/{task_id}`로 긴 작업을 비동기 task로 관리합니다. 여섯째, Document Parser는 `POST /predict/document`에서 PDF를 페이지 이미지와 디지털 텍스트 레이어로 나누고, page block, table block, merged table, assembled document를 구성합니다. 일곱째, Template Report와 History는 작업 결과를 저장하고 다시 열어 수정/재처리할 수 있게 합니다. 여덟째, Admin, Benchmark, Experimental 화면은 사용자/운영/연구/정밀 처리 기능을 같은 제품 안에서 검증하게 합니다.

<div class="ppocr-feature-grid">
  <div class="ppocr-feature-card">
    <h3>OCR and Layout</h3>
    <p><code>InVision OCR Engine</code>으로 텍스트를 추출하고, 자체 문서 레이아웃 엔진으로 제목, 본문, 표, 그림 영역을 나눕니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>Document Parser</h3>
    <p>PDF를 렌더링하고 digital text, layout region, table block, merged table, markdown/html 후보를 묶어 문서 단위 결과를 만듭니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>Table Reconstruction</h3>
    <p>OCR 기반 구조, 이미지/문서 기반 표 후보, header attachment, text fusion을 stage plan으로 비교합니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>Batch and History</h3>
    <p>대량 처리와 ZIP 처리는 task id로 추적하고, 결과는 SQLite 기반 history에서 목록/상세/수정/재처리 흐름으로 이어집니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>Template Workflow</h3>
    <p>영역 지정 OCR, template storage, template report 화면을 통해 반복 문서의 필드 추출과 검수 흐름을 지원합니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>Research Bench</h3>
    <p>research profile에서는 dataset stats, method catalog, async experiment, result dashboard, comparison/history 화면을 제공합니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>Admin and Ops</h3>
    <p>사용자 승인, role/status 변경, 이력 관리, 템플릿 관리, AI 보조 설정, anchor weight 같은 운영 항목을 관리자 router로 노출합니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>Delivery Profiles</h3>
    <p>unified, standalone, dev, gpu, research, customer, monitoring compose profile과 secure delivery/license lock 경로를 분리했습니다.</p>
  </div>
</div>

<figure class="ppocr-diagram">
  <img src="/images/projects/pp-ocr-runtime-architecture.svg" alt="InVision OCR runtime architecture diagram">
  <figcaption>Runtime architecture. Browser와 API 요청은 feature registry, auth/history, OCR/layout/parser/table runtime, storage, monitoring, delivery profile 경계를 통과합니다.</figcaption>
</figure>

## 런타임 구조

FastAPI의 시작점은 `app/main.py`입니다. 여기서 `build_feature_router_registry()`가 feature map을 보고 auth, users, admin, history, templates, ocr, layout, batch, tasks, parser, benchmark, experimental router를 조건부로 등록합니다. 같은 파일의 `/features` 응답은 Next.js의 `demo/src/lib/features.ts`가 읽어 navigation과 feature visibility를 결정합니다. 이 때문에 고객 납품 profile, research profile, secure profile에서 어떤 기능이 보이는지 코드로 설명할 수 있습니다.

OCR 실행은 `app/invision/workflows/pipeline.py`가 담당하는 공용 경로로 모입니다. 요청이 OCR만 요구하면 `OCREngine.predict(...)`로 들어가고, layout을 요구하면 `LayoutEngine`과 함께 `predict_with_layout(...)`을 실행합니다. 이때 자체 구축한 `InVision OCR Engine`을 서비스 모델로 서빙합니다. 문서 방향 보정이 켜져 있으면 orientation engine이 먼저 이미지 방향을 보정하고, 결과에는 감지된 방향, confidence, correction 여부가 metadata로 붙습니다.

문서 복원은 `app/invision/parser/service.py`의 `DocumentParserService`가 담당합니다. PDF를 페이지별 이미지로 렌더링하고, tagged PDF hint와 digital text layer를 분석하고, 각 페이지에서 layout OCR과 table block 추출을 수행합니다. 품질 기준이 낮거나 복잡한 표가 감지되면 high-quality rescue 경로를 검토하고, 최종적으로 `assembled_document`, page summaries, merged table 정보를 응답 스키마에 맞춰 정리합니다.

표 구조는 `app/invision/table/pipeline.py`와 `app/invision/table/plans.py`가 핵심입니다. 기본 plan은 기본 구조 생성, 표 후보 구성, 후보 선택, 행/열 정렬, 복잡 헤더 보정, 조밀한 요약표 보정, 목록형 표 후처리, wrapped row refinement, text fusion, header attachment 순서로 후보를 쌓습니다. `app/invision/table/selection.py`는 coverage, text match, density, split pressure, header hierarchy 같은 신호를 이용해 내부 구조 결과와 표 후보 사이의 승격 조건을 판단합니다.

<div class="ppocr-flow">
  <span>01 Feature profile 확정</span>
  <span>02 Auth와 작업 이력 연결</span>
  <span>03 OCR/Layout/Parser 선택</span>
  <span>04 표 후보 생성과 선택</span>
  <span>05 UI 검수와 재처리</span>
</div>

## 코드 기준 소스맵

이번 글은 기존 페이지 문구가 아니라 현재 저장소 구조를 기준으로 다시 작성했습니다. 아래 표는 공개 설명으로 옮긴 코드 근거입니다.

<div class="article-table-wrap ppocr-table-wrap">
  <table>
    <thead>
      <tr>
        <th>코드 영역</th>
        <th>분석한 책임</th>
        <th>제품 의미</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>app/main.py</code></td>
        <td>FastAPI app, lifespan, feature router registry, OpenAPI overview, health/status/features endpoint</td>
        <td>기능 선택과 런타임 상태를 API 표면으로 고정하는 서버 진입점</td>
      </tr>
      <tr>
        <td><code>app/config.py</code></td>
        <td><code>OCR_</code> 환경변수, private model bundle, layout backend, table backend, parser 품질 옵션, secure profile 설정</td>
        <td>로컬, Docker, GPU, 연구, 납품 환경에서 같은 설정 계약을 쓰게 하는 구성 계층</td>
      </tr>
      <tr>
        <td><code>app/invision/ocr</code>, <code>app/invision/layout</code></td>
        <td>단건 OCR, 옵션 OCR, 영역 OCR, Layout OCR, layout engine status</td>
        <td>이미지/PDF 입력을 텍스트와 문서 영역 결과로 바꾸는 핵심 추론 경로</td>
      </tr>
      <tr>
        <td><code>app/invision/parser</code></td>
        <td>PDF rendering, digital text strategy, tagged PDF hints, document assembly, table merge</td>
        <td>페이지별 OCR 결과를 문서 블록과 markdown/html 표 후보로 재구성하는 Parser 기능</td>
      </tr>
      <tr>
        <td><code>app/invision/table</code></td>
        <td>table stage plan, structure candidate, hybrid refinement, text fusion, header preview, selection metadata</td>
        <td>표를 텍스트 목록이 아니라 행/열/헤더/병합 후보를 가진 구조로 복원하는 파이프라인</td>
      </tr>
      <tr>
        <td><code>app/history</code>, <code>app/templates</code></td>
        <td>OCR history, result update, reprocess, template CRUD, template report summary</td>
        <td>한 번 처리한 문서를 다시 열고 수정/재처리하는 운영형 workflow</td>
      </tr>
      <tr>
        <td><code>demo/src</code></td>
        <td>Next.js main, parser, benchmark, experimental, template report, admin 화면과 feature hook</td>
        <td>InVision OCR Engine의 결과를 사람이 검수하고 조정할 수 있는 제품 UI로 노출</td>
      </tr>
      <tr>
        <td><code>build/</code>, <code>Dockerfile.unified</code></td>
        <td>feature pruning, customer delivery, secure model bundle, license payload, unified image build</td>
        <td>개발 데모를 납품 가능한 컨테이너와 기능별 profile로 바꾸는 배포/보안 경계</td>
      </tr>
      <tr>
        <td><code>tests/</code></td>
        <td>config, feature manifest, parser schema, table fusion, secure delivery, runtime safety 등 47개 테스트 파일</td>
        <td>OCR 품질 수치보다 구조 계약과 회귀 방지를 확인하는 검증 축</td>
      </tr>
    </tbody>
  </table>
</div>

## API와 화면별 기능 매트릭스

기능은 API와 UI가 같이 맞물릴 때 제품이 됩니다. InVision OCR Suite는 같은 기능을 FastAPI router, Next.js route, 사용자의 작업 단위로 연결합니다.

<div class="article-table-wrap ppocr-table-wrap">
  <table>
    <thead>
      <tr>
        <th>기능</th>
        <th>Backend</th>
        <th>Frontend</th>
        <th>사용자 관점</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>기본 OCR</td>
        <td><code>POST /predict</code>, <code>POST /predict/options</code></td>
        <td><code>/main</code>, <code>FileUploader</code>, <code>ResultList</code></td>
        <td>이미지/PDF를 업로드하고 threshold와 layout 옵션을 조정해 OCR 결과를 확인합니다.</td>
      </tr>
      <tr>
        <td>Layout OCR</td>
        <td><code>POST /predict/layout</code>, <code>GET /layout/status</code></td>
        <td><code>LayoutRegionImagePanel</code>, <code>LayoutRegionTextPanel</code></td>
        <td>제목, 본문, 표, 그림 영역을 구분하고 영역별 텍스트와 preview를 봅니다.</td>
      </tr>
      <tr>
        <td>영역 지정 OCR</td>
        <td><code>POST /predict/regions</code></td>
        <td><code>TemplateEditor</code>, <code>ImageViewer</code></td>
        <td>정형 문서에서 필요한 위치만 지정해 필드 단위로 추출합니다.</td>
      </tr>
      <tr>
        <td>Batch/ZIP</td>
        <td><code>POST /predict/batch</code>, <code>POST /predict/zip</code>, <code>GET /tasks/{task_id}</code></td>
        <td><code>BatchResultView</code>, history sidebar</td>
        <td>여러 파일을 비동기로 처리하고 진행률과 결과를 task 단위로 조회합니다.</td>
      </tr>
      <tr>
        <td>Document Parser</td>
        <td><code>POST /predict/document</code></td>
        <td><code>/parser</code>, markdown/table preview</td>
        <td>PDF를 문서 블록, 표 블록, merged table, assembled document로 재구성합니다.</td>
      </tr>
      <tr>
        <td>Template Report</td>
        <td><code>/templates</code>, <code>/history/template-report</code></td>
        <td><code>/template-report</code></td>
        <td>저장된 템플릿과 리포트 결과를 반복 업무 화면에서 확인합니다.</td>
      </tr>
      <tr>
        <td>Benchmark</td>
        <td><code>/research/*</code></td>
        <td><code>/benchmark</code>, charts, comparison, history</td>
        <td>데이터셋, method, table plan, 내부 보정 모드를 바꿔 연구 결과를 비교합니다.</td>
      </tr>
      <tr>
        <td>Experimental</td>
        <td><code>/experimental/*</code></td>
        <td><code>/experimental</code></td>
        <td>차트/표 변환과 정밀 문서 분석 runtime을 별도 실험 기능으로 검토합니다.</td>
      </tr>
      <tr>
        <td>Admin/Ops</td>
        <td><code>/admin/*</code>, <code>/auth/*</code>, <code>/users/*</code></td>
        <td><code>/admin</code>, <code>/profile</code>, <code>/login</code></td>
        <td>계정 승인, 권한 변경, 이력/템플릿/AI 보조 설정을 운영 화면에서 관리합니다.</td>
      </tr>
    </tbody>
  </table>
</div>

<figure class="ppocr-diagram">
  <img src="/images/projects/pp-ocr-document-lifecycle.svg" alt="InVision OCR document processing lifecycle diagram">
  <figcaption>Document lifecycle. 파일 업로드에서 OCR/Layout/Parser, 이력 저장, UI 검수, batch/reprocess, 납품 profile까지 이어지는 처리 흐름입니다.</figcaption>
</figure>

## 문서 복원과 표 구조 파이프라인

일반 OCR 결과는 텍스트와 bounding box의 목록입니다. 하지만 업무 문서에서 중요한 것은 "이 텍스트가 어느 셀, 어느 헤더, 어느 페이지 블록에 속하는가"입니다. InVision OCR Suite는 이 문제를 두 단계로 나눕니다. 먼저 layout parser가 페이지에서 텍스트, 제목, 표, 그림 같은 영역을 감지합니다. 그다음 table pipeline이 TABLE 영역을 대상으로 여러 구조 후보를 만들고, 점수와 규칙으로 하나를 선택합니다.

`DocumentParserService`는 PDF 입력을 받아 페이지를 렌더링하고, 디지털 PDF의 텍스트 레이어를 함께 분석합니다. 텍스트 레이어가 유효하면 OCR만으로 처리하지 않고 hybrid strategy를 사용하며, tagged PDF hint도 참고합니다. 각 페이지에서는 layout OCR 결과와 table block을 만들고, 필요하면 PDF 표 후보를 추가로 평가합니다. 이후 `merge_table_segments`, `normalize_table_rows`, `to_markdown_table` 계열 로직이 페이지를 넘어 이어지는 표와 markdown/html 표현을 구성합니다.

표 구조 pipeline은 연구와 서비스가 같은 stage plan을 공유하도록 되어 있습니다. `resolve_table_structure_plan()`은 preset 또는 직접 지정 stage를 해석하고, `run_table_structure_pipeline_with_context()`는 선택된 stage들을 하나의 context 위에서 실행합니다. context에는 base result, lattice candidates, selected result, selection metadata, fusion diagnostics가 남습니다. 이 설계 덕분에 UI는 최종 표만 보여줄 수 있고, 연구 화면은 후보 선택 과정과 stage prefix를 비교할 수 있습니다.

<figure class="ppocr-diagram">
  <img src="/images/projects/pp-ocr-table-pipeline.svg" alt="InVision OCR table reconstruction pipeline diagram">
  <figcaption>Table reconstruction pipeline. OCR 내부 구조, 표 후보, 자체 보정 단계, text fusion, header attachment가 같은 context 위에서 순차적으로 후보를 갱신합니다.</figcaption>
</figure>

## 배포, 보안, 연구 경계

이 프로젝트에서 배포 구조는 부가 문서가 아니라 코드의 일부입니다. `Dockerfile.unified`는 자체 모델 번들 선택, Python runtime, optional precision runtime, GPU builder, Next.js build, nginx, supervisord를 거쳐 API와 웹을 하나의 이미지로 묶습니다. `docker-compose.yml`은 unified, standalone, dev, gpu, research, customer, monitoring profile을 나눠 같은 저장소를 개발/검증/납품/관측 환경에 맞게 실행하게 합니다.

보안 납품 경로는 `app/secure_delivery.py`, `app/secure_loader.py`, `app/secure_artifacts.py`, `build/workflows/delivery.py`에 흩어져 있습니다. InVision OCR Engine bundle을 sealed payload로 만들고, customer license payload와 wrap key를 검증하며, license lock 상태에서는 런타임 초기화를 제한합니다. 이 흐름은 `tests/test_secure_delivery.py`, `tests/test_secure_delivery_model_bundle.py`, `tests/test_license_lock_middleware.py`, `tests/test_kumho_secure_delivery_build.py` 같은 테스트로 회귀를 확인합니다.

연구 경계도 별도 repo가 아니라 같은 제품 안에 있습니다. `app/benchmark/research_router.py`는 method catalog, runtime setting, dataset stats, sync/async experiment, result list/detail, file serving을 제공합니다. `demo/src/app/(protected)/benchmark/page.tsx`는 결과 dashboard, analysis, comparison, history를 화면으로 묶습니다. 이 글에서는 성능 수치를 주장하지 않고, 현재 코드가 어떤 실험 경로를 제공하는지만 설명합니다.

## 검증과 한계

현재 저장소에는 47개의 `test_*.py` 파일이 있으며, 대상은 OCR 정확도 단일 수치가 아니라 기능 계약입니다. 예를 들어 `test_feature_manifest.py`와 `test_feature_router_registration.py`는 기능 선택과 router 등록을 확인하고, `test_document_parser_response_schema.py`와 `test_document_parser_router_integration.py`는 parser 응답 형태를 검증합니다. `test_table_fusion_improvements.py`, `test_parser_table_improvements.py`, `test_layout_table_performance_optimizations.py`는 표 처리 개선 흐름을 고정하고, secure delivery와 runtime safety 테스트는 납품형 실행 조건을 다룹니다.

최근 커밋 이력도 같은 방향을 보여줍니다. 최신 기록은 Windows 납품 실행 wrapper, bbox/template handling, interactive binarize UI, visualization mode 정리, table overlay rendering 개선처럼 제품 UI와 납품/검수 편의성을 강화하는 쪽에 집중되어 있습니다. 다만 이 글에서는 최신 벤치마크 점수나 운영 배포 상태를 새로 단정하지 않습니다. 코드가 보여주는 확실한 사실은 "문서 OCR, 표 구조 복원, UI 검수, 연구 실험, 보안 납품 경계를 한 repo에서 다루는 스택"이라는 점입니다.

## 기여 프레임

이 프로젝트에서 내가 만든 가치는 OCR 모델을 호출하는 얇은 wrapper보다 넓습니다. 자체 구축한 InVision OCR Engine의 서빙 경로와 문서 처리 workflow를 제품 기능으로 쪼개고, 그 기능들이 API, UI, 테스트, Docker profile, 납품 profile에서 같은 이름으로 추적되게 했습니다. 특히 표 구조 복원은 단일 algorithm 선택이 아니라 후보 생성, 후보 평가, 후처리, 연구 비교, UI 검수까지 이어지는 파이프라인으로 정리했습니다.

그래서 InVision OCR Suite는 포트폴리오에서 "OCR 프로젝트"라고만 설명하기보다, **문서 AI를 실제 업무 도구로 만들기 위해 필요한 실행 경계와 운영 표면을 설계한 프로젝트**로 보는 편이 정확합니다. 파일 업로드부터 PDF 복원, 표 구조화, 이력/재처리, 연구 벤치마크, 고객 납품 이미지까지 같은 저장소에서 다뤘다는 점이 이 프로젝트의 기술적 밀도입니다.
