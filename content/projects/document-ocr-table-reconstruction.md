---
title: "InVision OCR — 문서 OCR·표 구조 복원·벤치마크 플랫폼"
projectName: "InVision OCR"
tagline: "문서 OCR·표 구조 복원·벤치마크 플랫폼"
period: "AsianaIDT / 2026.02 - 현재"
periodOrder: 20260523
description: "OCR API 호출을 넘어 문서 레이아웃 분석, 로직 기반 표 구조 복원, parser 기반 문서 재구성, 정량 벤치마크, 검수·운영 콘솔, 보안 납품 환경까지 하나로 묶은 Document AI 플랫폼입니다."
metrics:
  - "TEDS 0.9188"
  - "TEDS-S 0.9506"
  - "Cell F1 0.9702"
stack:
  - "FastAPI"
  - "Next.js"
  - "InVision OCR Engine"
  - "Document Parser"
  - "Table Reconstruction"
  - "Benchmark Console"
  - "RBAC/JWT"
  - "Docker Compose"
details:
  - "이미지/PDF/배치 OCR, 레이아웃 분석, 영역 지정, 이력 저장, 템플릿 리포트, 관리자 기능을 하나의 작업 흐름으로 연결했습니다."
  - "OCR bbox와 선분 정보를 결합해 row/column grouping, spanned cell·merged header 복원, fallback assignment, hybrid selection 등 로직 기반 표 구조 복원 엔진을 설계·고도화했습니다."
  - "HTML table GT 기준 Row/Col, Cell F1, CER, TEDS/TEDS-S를 함께 보는 평가 체계를 만들고 실험 콘솔에서 다중 메서드 비교와 ablation을 실행할 수 있게 했습니다."
  - "parser 기반 문서 복원, visual block payload, guide 기반 보정, LLM 후처리 enrichment, secure build, 운영 모니터링 프로필까지 제품·연구·납품 경계를 함께 관리했습니다."
order: 30
draft: false
---

<section class="ppocr-lead-panel">
  <span class="ppocr-kicker">진행 중인 프로젝트</span>
  <p><strong>InVision OCR은 단순히 문서 이미지를 텍스트로 바꾸는 도구가 아닙니다. 문서 레이아웃을 분석하고, 표 구조를 복원하고, parser로 문서 단위 결과를 재조립하며, 정량 벤치마크와 검수 화면까지 함께 제공하는 Document AI 플랫폼입니다.</strong></p>
  <p>실제 업무 문서는 OCR 결과만으로 끝나지 않습니다. PDF가 여러 페이지일 수 있고, 표가 페이지를 넘어 이어질 수 있고, 사용자가 추출 결과를 다시 확인해야 할 때도 많습니다. 이 프로젝트에서는 OCR, 레이아웃, 표 구조화, 문서 복원, 평가 실험, 보안 납품 프로필을 한 제품 안에서 맞춰 가고 있습니다.</p>
</section>

## 무엇을 만들었나

InVision OCR은 2026년 2월부터 진행 중인 문서 OCR·복원 프로젝트입니다. 이미지나 PDF를 입력받아 텍스트를 추출하고, 문서 영역을 나누고, 표를 행과 열 구조로 복원한 뒤, 사용자가 결과를 확인하고 저장할 수 있게 만드는 것이 기본 목표입니다.

내가 맡은 범위는 OCR 호출부 하나에 그치지 않았습니다. 업로드 화면, 레이아웃 OCR, 영역 지정 OCR, 배치 처리, 이력 저장, 템플릿 리포트, 관리자 화면, parser 기반 문서 재구성, 연구 벤치마크, 고객 납품용 실행 프로필까지 함께 담당했습니다. 그래서 이 프로젝트는 모델 정확도만의 문제가 아니라, 문서가 들어와서 사람이 검수할 수 있는 구조화 결과로 남는 전체 과정의 문제에 가까웠습니다.

최근 고도화에서는 표 구조 복원을 정량 평가 가능한 연구·제품 플랫폼으로 확장했습니다. HTML table GT를 기준으로 Row/Col 일치, Cell F1, CER, TEDS/TEDS-S를 함께 측정했고, hf_finance_legal_mrc 480샘플 기준 TEDS 0.9188, TEDS-S 0.9506, Cell F1 0.9702까지 개선했습니다. 수치는 데이터셋과 실행 조건에 묶인 실험 결과로 보고, 제품 설명에서는 "OCR 이후 구조 복원 품질을 측정하고 개선하는 체계"에 초점을 둡니다.

<div class="ppocr-fact-grid">
  <div class="ppocr-fact">
    <strong>입력</strong>
    <p>이미지, PDF, ZIP 파일을 받아 단건 처리와 대량 처리를 모두 지원합니다.</p>
  </div>
  <div class="ppocr-fact">
    <strong>처리</strong>
    <p>OCR, 레이아웃 분석, 문서 복원, 표 구조 복원을 단계별로 연결했습니다.</p>
  </div>
  <div class="ppocr-fact">
    <strong>운영</strong>
    <p>결과 검수, 저장, 재처리, 템플릿 리포트, 관리자 기능, 납품 프로필까지 함께 관리합니다.</p>
  </div>
  <div class="ppocr-fact">
    <strong>평가</strong>
    <p>Row/Col, Cell F1, CER, TEDS/TEDS-S를 함께 측정해 구조 복원 품질을 정량화합니다.</p>
  </div>
</div>

<div class="ppocr-shot-grid">
  <figure class="ppocr-shot">
    <img src="/images/projects/pp-ocr-main-page.jpg" alt="InVision OCR main upload and analysis screen">
    <figcaption>메인 OCR 화면. 파일을 올리고 처리 옵션을 선택한 뒤 결과와 이력으로 이어집니다.</figcaption>
  </figure>
  <figure class="ppocr-shot">
    <img src="/images/projects/pp-ocr-result-review.jpg" alt="InVision OCR result review screen">
    <figcaption>결과 검수 화면. 원본 페이지와 OCR/레이아웃 결과를 함께 보면서 표와 영역을 확인합니다.</figcaption>
  </figure>
  <figure class="ppocr-shot">
    <img src="/images/projects/pp-ocr-template-report.jpg" alt="InVision OCR template report screen">
    <figcaption>템플릿 리포트 화면. 반복되는 문서의 추출 결과를 저장하고 다시 확인할 수 있게 했습니다.</figcaption>
  </figure>
</div>

## 제품 화면

사용자가 처음 만나는 화면은 파일 업로드와 OCR 실행 화면입니다. 여기서 기본 OCR, 레이아웃 OCR, 영역 지정 OCR, PDF 페이지 처리, 배치 처리를 선택할 수 있습니다. 처리 결과는 단순 텍스트 목록으로 끝나지 않고, 페이지 이미지와 함께 검수할 수 있는 형태로 보여줍니다.

운영에 가까운 기능도 같이 만들었습니다. 결과 이력은 다시 열어 수정하거나 재처리할 수 있고, 템플릿 리포트는 반복 문서에서 필요한 필드를 확인하는 용도로 사용합니다. 관리자 화면에서는 사용자 승인, 권한 변경, 이력 관리, 템플릿 관리 같은 항목을 다룹니다.

연구 화면은 별도로 분리했습니다. 표 구조 복원 방식이나 보정 옵션을 비교해야 할 때 운영 화면에 실험 기능을 섞어 두면 사용자가 헷갈립니다. 그래서 연구 벤치마크와 실험 기능은 별도 화면과 프로필에서 다루도록 정리했습니다.

<div class="ppocr-feature-grid">
  <div class="ppocr-feature-card">
    <h3>OCR와 레이아웃</h3>
    <p>InVision OCR Engine으로 텍스트를 추출하고, 자체 레이아웃 분석으로 제목, 본문, 표, 그림 영역을 나눕니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>문서 복원</h3>
    <p>PDF를 페이지 단위로 렌더링하고, 디지털 텍스트와 OCR 결과를 함께 사용해 문서 블록을 만듭니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>표 구조 복원</h3>
    <p>OCR bbox와 선분 정보를 결합해 행/열 grouping, 병합 셀, 헤더, fallback assignment, hybrid selection을 복원합니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>배치와 이력</h3>
    <p>여러 파일을 작업 단위로 처리하고, 완료된 결과는 이력에서 다시 열어볼 수 있게 했습니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>템플릿 업무</h3>
    <p>정형 문서에서 필요한 영역을 지정하고, 추출 결과를 템플릿 리포트로 확인합니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>연구 벤치</h3>
    <p>데이터셋, 처리 방법, CI95, pairwise 비교, ablation을 실험 job으로 실행하고 결과를 재조회합니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>관리자 기능</h3>
    <p>계정, 권한, 이력, 템플릿, 운영 설정을 관리하는 화면을 따로 두었습니다.</p>
  </div>
  <div class="ppocr-feature-card">
    <h3>납품 프로필</h3>
    <p>개발, 연구, 고객 납품, 모니터링 환경에서 필요한 기능만 노출되도록 실행 조건을 나눴습니다.</p>
  </div>
</div>

<figure class="ppocr-diagram">
  <img src="/images/projects/pp-ocr-runtime-architecture.svg" alt="InVision OCR runtime architecture diagram">
  <figcaption>런타임 구조. 사용자 요청은 인증, 기능 선택, OCR/레이아웃/문서 복원/표 구조화, 저장소, 모니터링, 납품 프로필을 거쳐 처리됩니다.</figcaption>
</figure>

## 처리 흐름

처리 흐름은 되도록 한 방향으로 정리했습니다. 먼저 사용자가 파일을 올리고 처리 모드를 고릅니다. OCR만 필요한 경우에는 텍스트와 좌표를 반환하고, 레이아웃 분석이 필요한 경우에는 제목, 본문, 표, 그림 같은 영역을 함께 계산합니다. PDF 문서는 페이지 단위로 나누고, 디지털 텍스트 레이어가 있으면 OCR 결과와 함께 비교합니다.

문서 복원 단계에서는 페이지별 결과를 문서 블록으로 묶습니다. 표가 있는 경우에는 표 영역을 따로 추출하고, 페이지를 넘어 이어지는 표가 있는지도 확인합니다. 최종 결과는 화면에서 바로 검수할 수 있도록 원본 이미지, 추출 텍스트, 표 후보, 저장 가능한 결과 형태로 정리합니다.

표 구조 복원은 특히 시간이 많이 들어간 부분입니다. OCR 결과는 텍스트 좌표를 주지만, 업무에서 필요한 것은 "이 값이 어느 행과 열에 들어가는가"입니다. 그래서 기본 구조 후보, 이미지 기반 후보, 헤더 후보, 텍스트 재배치 결과를 비교하고, 가장 설득력 있는 표 구조를 선택하는 방식으로 만들었습니다.

<div class="ppocr-flow">
  <span>01 파일 업로드</span>
  <span>02 처리 모드 선택</span>
  <span>03 OCR와 레이아웃 분석</span>
  <span>04 표 후보 생성</span>
  <span>05 검수와 저장</span>
</div>

## 내가 맡은 설계

공개 글에서 내부 파일명이나 함수명을 나열하는 것은 큰 의미가 없다고 봅니다. 대신 이 프로젝트에서 내가 나눈 책임은 아래처럼 정리할 수 있습니다.

<div class="article-table-wrap ppocr-table-wrap">
  <table>
    <thead>
      <tr>
        <th>영역</th>
        <th>맡은 일</th>
        <th>왜 필요했나</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>입력과 작업 관리</td>
        <td>파일 업로드, 요청 검증, 긴 작업 추적, 결과 이력 저장</td>
        <td>대량 문서 처리에서는 한 번 실행하고 끝나는 방식으로는 부족했습니다.</td>
      </tr>
      <tr>
        <td>OCR와 레이아웃</td>
        <td>텍스트 추출 결과와 문서 영역 결과를 함께 다루는 처리 흐름 구성</td>
        <td>문서에서는 텍스트 자체보다 위치와 영역 맥락이 중요했습니다.</td>
      </tr>
      <tr>
        <td>문서 복원</td>
        <td>PDF 페이지, 디지털 텍스트, OCR 결과, 표 블록을 문서 단위로 조립</td>
        <td>페이지별 결과를 그대로 보여주면 사용자가 업무 결과물로 쓰기 어려웠습니다.</td>
      </tr>
      <tr>
        <td>표 구조 복원</td>
        <td>행/열/헤더 후보를 만들고 선택 근거를 남기는 구조 설계</td>
        <td>표는 텍스트 추출보다 구조 복원이 품질을 좌우했습니다.</td>
      </tr>
      <tr>
        <td>검수 화면</td>
        <td>원본 이미지, OCR 결과, 표 결과, 이력, 재처리 흐름 연결</td>
        <td>자동 추출 결과를 사람이 빠르게 확인할 수 있어야 했습니다.</td>
      </tr>
      <tr>
        <td>납품과 보안</td>
        <td>고객 납품용 실행 프로필, 보안 모델 번들, 라이선스 조건 관리</td>
        <td>연구용 데모와 고객사에 전달할 실행 환경은 요구사항이 달랐습니다.</td>
      </tr>
    </tbody>
  </table>
</div>

## 기능별 사용 흐름

<div class="article-table-wrap ppocr-table-wrap">
  <table>
    <thead>
      <tr>
        <th>기능</th>
        <th>사용자가 하는 일</th>
        <th>내가 신경 쓴 부분</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>기본 OCR</td>
        <td>이미지나 PDF를 올리고 텍스트 결과를 확인합니다.</td>
        <td>옵션이 늘어나도 결과 구조가 흔들리지 않게 정리했습니다.</td>
      </tr>
      <tr>
        <td>레이아웃 OCR</td>
        <td>제목, 본문, 표, 그림 영역을 나눠 봅니다.</td>
        <td>원본 페이지와 영역 결과를 함께 보며 검수할 수 있게 했습니다.</td>
      </tr>
      <tr>
        <td>영역 지정 OCR</td>
        <td>정형 문서에서 필요한 위치만 지정해 읽습니다.</td>
        <td>템플릿 좌표와 필드 결과가 리포트로 이어지도록 연결했습니다.</td>
      </tr>
      <tr>
        <td>배치 처리</td>
        <td>여러 파일을 올리고 진행 상태와 결과를 확인합니다.</td>
        <td>긴 작업을 이력, 결과 검수, 재처리와 분리하지 않도록 맞췄습니다.</td>
      </tr>
      <tr>
        <td>문서 복원</td>
        <td>PDF를 문서 블록과 표 블록으로 재구성합니다.</td>
        <td>OCR 결과와 디지털 텍스트를 같이 보고 문서 단위 결과로 묶었습니다.</td>
      </tr>
      <tr>
        <td>연구 벤치마크</td>
        <td>데이터셋과 처리 방법을 바꿔 결과를 비교합니다.</td>
        <td>운영 기능과 실험 기능이 섞이지 않도록 화면과 프로필을 나눴습니다.</td>
      </tr>
      <tr>
        <td>관리자 기능</td>
        <td>계정, 권한, 이력, 템플릿, 운영 설정을 관리합니다.</td>
        <td>문서 처리 도구를 데모가 아니라 운영 서비스로 다룰 수 있게 했습니다.</td>
      </tr>
    </tbody>
  </table>
</div>

<figure class="ppocr-diagram">
  <img src="/images/projects/pp-ocr-document-lifecycle.svg" alt="InVision OCR document processing lifecycle diagram">
  <figcaption>문서 처리 흐름. 업로드한 파일이 OCR, 레이아웃 분석, 문서 복원, 이력 저장, 검수, 재처리, 납품 프로필로 이어집니다.</figcaption>
</figure>

## 표 구조 복원

표 복원은 이 프로젝트에서 가장 까다로운 부분 중 하나였습니다. 단순히 셀 안의 글자를 읽는 것과 표를 업무에서 쓸 수 있는 구조로 복원하는 것은 다른 문제였습니다. 헤더가 여러 줄이거나, 셀이 병합되어 있거나, 페이지를 넘어 표가 이어지면 텍스트 좌표만으로는 부족했습니다.

그래서 표 영역마다 여러 후보를 만들고 비교하는 방식을 사용했습니다. OCR bbox에서 row/column grouping 후보를 만들고, 선분 정보와 overlap을 사용해 column을 추정하며, spanned cell과 merged header를 복원합니다. 셀 배치가 흔들릴 때는 fallback assignment를 적용하고, body-first hybrid selection, line-hint/post-fusion rescue, row-stability guard 같은 보정 규칙으로 구조 붕괴를 줄였습니다.

연구 화면에서는 같은 결과를 조금 더 자세히 봅니다. 어떤 후보가 선택됐는지, 어떤 보정이 들어갔는지, 텍스트가 어떤 셀로 옮겨졌는지 확인할 수 있어야 개선 방향을 잡을 수 있기 때문입니다. 운영 화면에서는 사용자가 최종 표를 검수하고 저장할 수 있도록 복잡한 후보 탐색 과정을 단순한 결과와 이력으로 정리했습니다.

<figure class="ppocr-diagram">
  <img src="/images/projects/pp-ocr-table-pipeline.svg" alt="InVision OCR table reconstruction pipeline diagram">
  <figcaption>표 구조 복원 흐름. 표 영역에서 구조 후보를 만들고, 보정과 텍스트 배치를 거쳐 최종 표를 선택합니다.</figcaption>
</figure>

## 정량 평가와 검증

표 구조 복원은 눈으로 보기에 그럴듯한 결과만으로는 부족합니다. 그래서 HTML table GT를 기준으로 행 수 일치, 열 수 일치, 셀 매칭 정확도, 셀 텍스트 오류율, 전체 구조 유사도를 함께 측정했습니다. 이 지표 조합은 "텍스트는 맞지만 셀 구조가 틀린 경우"와 "구조는 맞지만 텍스트가 깨진 경우"를 분리해서 볼 수 있게 합니다.

<div class="article-table-wrap ppocr-table-wrap">
  <table>
    <thead>
      <tr>
        <th>실험 / 지표</th>
        <th>확인한 값</th>
        <th>해석</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>hf_korean_table 100샘플 Proposed</td>
        <td>TEDS 0.9174, Cell F1 0.9934, Row 1.00, Col 0.96</td>
        <td>규칙 기반 구조 복원이 row/column 안정성과 셀 매칭에서 강하게 동작함을 확인했습니다.</td>
      </tr>
      <tr>
        <td>fixed_threshold baseline</td>
        <td>TEDS 0.7540</td>
        <td>고정 임계값만으로는 다양한 표 레이아웃을 안정적으로 처리하기 어렵다는 기준점입니다.</td>
      </tr>
      <tr>
        <td>kmeans baseline</td>
        <td>TEDS 0.3304</td>
        <td>좌표 군집만으로는 병합 셀과 헤더 구조를 복원하기 어렵다는 한계를 보여줍니다.</td>
      </tr>
      <tr>
        <td>hf_finance_legal_mrc 480샘플 최신 실행</td>
        <td>TEDS 0.9188, TEDS-S 0.9506, Cell F1 0.9702</td>
        <td>금융·법률 문서 계열에서도 구조와 텍스트 유사도를 함께 개선한 결과입니다.</td>
      </tr>
    </tbody>
  </table>
</div>

벤치마크 콘솔은 단발 실행 결과를 남기는 데서 끝나지 않습니다. dataset stats, 다중 메서드 비교, CI95, pairwise 비교, ablation 분석, async experiment job, checkpoint/resume/cancel/stale handling을 같은 흐름으로 묶어 실험을 반복 가능하게 만들었습니다.

## 배포와 납품

이 프로젝트는 연구용으로만 실행되는 코드가 아니라 고객 납품까지 고려해야 했습니다. 그래서 실행 환경을 개발, 연구, 고객 납품, 모니터링 용도로 나누고, 각 환경에서 노출할 기능과 필요한 자산을 다르게 관리했습니다.

보안 납품 쪽에서는 자체 모델 번들, 라이선스 조건, 실행 잠금 상태를 함께 다뤘습니다. 고객사에 전달되는 실행 환경이 임의로 풀리거나 잘못된 프로필로 실행되지 않도록 하는 것이 목적이었습니다.

아직 진행 중인 프로젝트라 운영 환경별 성능과 고객 문서 품질은 계속 검증해야 합니다. 다만 지금까지의 작업은 문서 OCR, 표 구조 복원, 정량 평가, 검수 화면, 연구 실험, 납품 프로필을 한 제품 안에서 맞춰 가는 방향으로 쌓이고 있습니다.

## 정리

InVision OCR에서 내가 만든 가치는 OCR 모델을 호출하는 얇은 실행 계층보다 넓습니다. 문서가 들어오고, 분석되고, 구조화되고, 사람이 확인하고, 저장되고, 다시 처리되고, 납품 가능한 형태로 묶이는 과정을 함께 설계했습니다.

특히 표 구조 복원은 단일 알고리즘을 붙이는 문제가 아니었습니다. 후보를 만들고, 비교하고, 보정하고, 정량 지표로 검증하고, 사람이 검수할 수 있게 보여주는 일이 함께 필요했습니다. 이 프로젝트는 OCR 이후의 문서 구조화 품질을 제품·연구·운영 관점에서 동시에 다룬 진행형 Document AI 프로젝트입니다.
