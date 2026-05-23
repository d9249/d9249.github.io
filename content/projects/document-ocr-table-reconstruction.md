---
title: "InVision OCR — 문서 OCR 및 표 구조 복원 스택"
projectName: "InVision OCR"
tagline: "문서 OCR 및 표 구조 복원 스택"
period: "AsianaIDT / 2026.02 - 현재"
periodOrder: 20260523
description: "자체 구축한 InVision OCR Engine을 중심으로 PDF/이미지 문서 처리, 레이아웃 분석, 표 구조 복원, 결과 검수, 배치 처리, 보안 납품까지 이어지는 OCR 제품을 개발하고 있습니다."
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
  - "이미지와 PDF 업로드, OCR, 레이아웃 분석, 영역 지정, 배치 처리, 이력 저장, 템플릿 리포트까지 한 작업 흐름으로 연결했습니다."
  - "자체 구축한 InVision OCR Engine과 문서 레이아웃/표 구조 분석 엔진을 서빙하고, 표 중심 업무 문서의 구조 복원 품질을 계속 개선하고 있습니다."
  - "사용자가 결과를 직접 검수하고 재처리할 수 있도록 페이지 이미지, OCR 결과, 표 후보, 저장 이력을 함께 보여주는 화면을 만들었습니다."
  - "개발/연구/고객 납품/모니터링 환경을 분리하고, 보안 납품과 라이선스 잠금 조건을 함께 관리했습니다."
order: 30
draft: false
---

<section class="ppocr-lead-panel">
  <span class="ppocr-kicker">진행 중인 프로젝트</span>
  <p><strong>InVision OCR은 단순히 문서 이미지를 텍스트로 바꾸는 도구가 아닙니다. 문서를 올리고, 레이아웃과 표를 확인하고, 결과를 고치고, 다시 처리하고, 납품 가능한 실행 환경으로 묶는 것까지 다룬 프로젝트입니다.</strong></p>
  <p>실제 업무 문서는 OCR 결과만으로 끝나지 않습니다. PDF가 여러 페이지일 수 있고, 표가 페이지를 넘어 이어질 수 있고, 사용자가 추출 결과를 다시 확인해야 할 때도 많습니다. 이 프로젝트에서는 모델 서빙, 문서 복원, 표 구조화, 검수 화면, 배치 처리, 납품 프로필을 한 제품 안에서 맞춰 가고 있습니다.</p>
</section>

## 무엇을 만들었나

InVision OCR은 2026년 2월부터 진행 중인 문서 OCR 프로젝트입니다. 이미지나 PDF를 입력받아 텍스트를 추출하고, 문서 영역을 나누고, 표를 행과 열 구조로 복원한 뒤, 사용자가 결과를 확인하고 저장할 수 있게 만드는 것이 기본 목표입니다.

내가 맡은 범위는 OCR 호출부 하나에 그치지 않았습니다. 업로드 화면, 레이아웃 OCR, 영역 지정 OCR, 배치 처리, 이력 저장, 템플릿 리포트, 관리자 화면, 연구 벤치마크, 고객 납품용 실행 프로필까지 함께 담당했습니다. 그래서 이 프로젝트는 모델 정확도만의 문제가 아니라, 문서가 들어와서 사람이 검수할 수 있는 결과로 남는 전체 과정의 문제에 가까웠습니다.

현재도 개발과 고도화가 이어지고 있기 때문에, 이 글에서는 운영 성능 수치나 최종 벤치마크 점수를 단정하지 않습니다. 대신 지금까지 만든 구조와 내가 설계한 역할을 중심으로 정리합니다.

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
    <p>표 영역에서 행, 열, 셀, 헤더 후보를 만들고 여러 신호를 비교해 최종 구조를 선택합니다.</p>
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
    <p>데이터셋, 처리 방법, 보정 옵션을 바꿔 표 복원 결과를 비교할 수 있게 했습니다.</p>
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

그래서 표 영역마다 여러 후보를 만들고 비교하는 방식을 사용했습니다. OCR 결과에서 얻은 기본 행/열 힌트, 이미지에서 보이는 선과 간격, 헤더로 보이는 행, 텍스트가 어느 셀에 더 자연스럽게 들어가는지를 함께 봅니다. 최종 결과는 사용자가 검수 화면에서 확인할 수 있는 표 형태로 정리했습니다.

연구 화면에서는 같은 결과를 조금 더 자세히 봅니다. 어떤 후보가 선택됐는지, 어떤 보정이 들어갔는지, 텍스트가 어떤 셀로 옮겨졌는지 확인할 수 있어야 개선 방향을 잡을 수 있기 때문입니다.

<figure class="ppocr-diagram">
  <img src="/images/projects/pp-ocr-table-pipeline.svg" alt="InVision OCR table reconstruction pipeline diagram">
  <figcaption>표 구조 복원 흐름. 표 영역에서 구조 후보를 만들고, 보정과 텍스트 배치를 거쳐 최종 표를 선택합니다.</figcaption>
</figure>

## 배포와 납품

이 프로젝트는 연구용으로만 실행되는 코드가 아니라 고객 납품까지 고려해야 했습니다. 그래서 실행 환경을 개발, 연구, 고객 납품, 모니터링 용도로 나누고, 각 환경에서 노출할 기능과 필요한 자산을 다르게 관리했습니다.

보안 납품 쪽에서는 자체 모델 번들, 라이선스 조건, 실행 잠금 상태를 함께 다뤘습니다. 고객사에 전달되는 실행 환경이 임의로 풀리거나 잘못된 프로필로 실행되지 않도록 하는 것이 목적이었습니다.

아직 진행 중인 프로젝트라 운영 성능이나 최종 품질 수치를 공개적으로 단정하기는 어렵습니다. 대신 지금까지의 작업은 문서 OCR, 표 구조 복원, 검수 화면, 연구 실험, 납품 프로필을 한 제품 안에서 맞춰 가는 방향으로 쌓이고 있습니다.

## 정리

InVision OCR에서 내가 만든 가치는 OCR 모델을 호출하는 얇은 실행 계층보다 넓습니다. 문서가 들어오고, 분석되고, 사람이 확인하고, 저장되고, 다시 처리되고, 납품 가능한 형태로 묶이는 과정을 함께 설계했습니다.

특히 표 구조 복원은 단일 알고리즘을 붙이는 문제가 아니었습니다. 후보를 만들고, 비교하고, 보정하고, 사람이 검수할 수 있게 보여주는 일이 함께 필요했습니다. 이 프로젝트는 그런 문서 AI 제품의 실제 작업면을 다룬 진행형 프로젝트입니다.
