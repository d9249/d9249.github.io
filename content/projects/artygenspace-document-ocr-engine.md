---
title: "ArtygenSpace Document OCR Engine - 책 페이지 인식과 레이아웃 분석"
projectName: "ArtygenSpace Document OCR Engine"
tagline: "책 페이지 인식과 레이아웃 분석"
period: "ArtygenSpace / 2024.07 - 2025.07"
periodOrder: 20250702
description: "책 페이지와 문서 이미지를 텍스트, 영역, 레이아웃, crop artifact로 바꾸기 위해 GroundingDINO, Google Vision, Surya OCR/layout, SageMaker 배포 경로를 실험한 OCR 엔진입니다."
metrics:
  - "GroundingDINO"
  - "Surya OCR/Layout"
  - "SageMaker Endpoint"
stack:
  - "Python"
  - "FastAPI"
  - "GroundingDINO"
  - "Surya"
  - "Google Vision"
  - "OpenCV"
  - "PyTorch"
  - "SageMaker"
details:
  - "책 페이지에서 텍스트 영역을 탐지하고 crop, 전처리, OCR, LLM 후처리까지 이어지는 API 흐름을 구성했습니다."
  - "Surya 기반 OCR 서비스는 text detection, OCR, layout detection, PDF page rendering, cropped image zip 반환을 제공합니다."
  - "GroundingDINO 모델은 endpoint inference, box filtering/merging, annotated image, YOLO JSON 생성, endpoint test script로 배포 실험이 진행되었습니다."
  - "모델 실험을 API, endpoint, annotation artifact, 배포 스크립트까지 이어지는 제품형 pipeline으로 정리했습니다."
order: 53
draft: false
---

<section class="project-lead-panel">
  <span class="project-kicker">Document OCR</span>
  <p><strong>문서 OCR 엔진의 목표는 이미지를 텍스트로 바꾸는 데서 끝나지 않고, 책 페이지의 읽기 순서와 시각 영역을 다음 AI 엔진이 사용할 수 있는 구조로 바꾸는 것이었습니다.</strong></p>
  <p>책 페이지에는 본문, 말풍선, 그림, 표지, 배경, 효과음 후보가 함께 있습니다. 그래서 OCR은 recognition 하나가 아니라 detection, crop, denoise, layout, 후처리, 저장 artifact를 포함한 pipeline으로 설계되어야 했습니다.</p>
</section>

## 개요

ArtygenSpace의 OCR 작업은 여러 실험 축으로 나뉘었습니다. 초기 책 OCR 경로는 GroundingDINO로 텍스트 영역을 찾고, crop된 영역에 Google Vision OCR을 적용하고, LLM으로 문장과 사운드 효과 후보를 정리하는 구조였습니다. 이후 OCR 개발 축에서는 Surya 기반 OCR과 layout detection을 API로 감싸 PDF/이미지 입력에서 text line, layout element, cropped image를 반환하도록 구성했습니다. Detection 배포 축에서는 GroundingDINO inference를 endpoint 형태로 준비하고, box filtering, merging, annotated image, JSON artifact 생성을 다뤘습니다.

이 작업의 제품 의미는 명확합니다. 독서 AI나 동화책 편집 제품은 원본 이미지 그대로는 이해할 수 없습니다. 페이지를 텍스트, 영역, 순서, 좌표, 이미지 artifact로 바꿔야 다음 단계인 교정, 번역, 퀴즈, 사운드 추천, TTS로 이어질 수 있습니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>문제</strong>
    <p>책 페이지는 텍스트와 그림이 섞여 있어 OCR 결과만으로는 읽기 순서와 영역 맥락을 유지하기 어렵습니다.</p>
  </div>
  <div class="project-fact">
    <strong>접근</strong>
    <p>open-vocabulary detection, OCR, layout analysis, crop artifact, 후처리를 각각 API 단계로 분리했습니다.</p>
  </div>
  <div class="project-fact">
    <strong>결과</strong>
    <p>페이지 이미지를 텍스트, bounding box, layout label, annotated image, JSON 결과로 바꾸는 엔진 경계를 만들었습니다.</p>
  </div>
</div>

<figure class="project-diagram">
  <img src="/images/projects/artygenspace-ocr-pipeline.svg" alt="ArtygenSpace OCR and layout analysis pipeline">
  <figcaption>OCR pipeline. 이미지/PDF 입력은 detection, OCR/layout, crop, 후처리, 저장 artifact를 거쳐 다음 AI 기능으로 전달됩니다.</figcaption>
</figure>

## 주요 기능

OCR 엔진의 주요 기능은 API 중심으로 구성했습니다. 이미지를 업로드하면 텍스트 영역을 찾고, 영역별 crop과 OCR 결과를 반환합니다. PDF 입력은 지정 페이지를 렌더링해 이미지로 바꾼 뒤 동일한 OCR/layout 경로를 탑니다. layout detection은 제목, 본문, 표, 그림 같은 영역 label을 반환하고, text detection은 polygon/box와 디버그 이미지를 함께 제공합니다. Detection endpoint 경로는 base64 이미지 요청을 받아 좌표, 병합 이미지, 주석 이미지, JSON artifact를 반환하는 구조입니다.

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3>Text Region Detection</h3>
    <p>GroundingDINO로 페이지 안의 텍스트 또는 본문 영역 후보를 찾고 원본 좌표로 변환합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Crop Preprocessing</h3>
    <p>crop 영역에 grayscale, CLAHE, sharpening, denoise를 적용해 OCR 입력 품질을 높입니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>OCR Recognition</h3>
    <p>Google Vision 또는 Surya recognition을 통해 text line과 confidence, bbox를 구조화합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Layout Detection</h3>
    <p>Surya layout predictor로 PDF/이미지의 제목, 본문, 표, 그림 영역을 탐지합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Artifact Export</h3>
    <p>annotated image, merged image, crop zip, base64 image, YOLO JSON 같은 검수 가능한 결과물을 만듭니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Endpoint Packaging</h3>
    <p>SageMaker용 inference app, serve script 준비, endpoint test script로 모델 서빙 형태를 실험했습니다.</p>
  </div>
</div>

## 기술 구현

초기 OCR 경로는 이미지 업로드 후 OpenCV로 디코딩하고 RGB로 변환합니다. GroundingDINO inference는 caption prompt와 threshold를 받아 box, logit, phrase를 만들고, normalized box를 원본 이미지 좌표로 환산합니다. 각 box는 crop되고, 빈 영역은 제외되며, 전처리 후 OCR에 들어갑니다. 이후 LLM 후처리는 문장과 사운드 효과 후보를 특정 포맷으로 반환하도록 설계되어 있습니다.

Surya 기반 경로는 다른 방향입니다. 서비스 시작 시 detection/recognition predictor를 로드하고, PDF 입력은 pypdfium2로 page image를 렌더링합니다. `/v1/text_detection`, `/v1/ocr`, `/v1/layout_detection`, `/v2/detect_text_zip` 같은 엔드포인트가 text line, layout element, debug image, crop archive를 제공합니다. 이 경로는 문서 처리 제품에서 OCR과 layout을 분리해 다룰 수 있게 합니다.

<div class="project-flow">
  <span>01 Image/PDF</span>
  <span>02 Detection</span>
  <span>03 Crop/OCR</span>
  <span>04 Layout JSON</span>
  <span>05 AI workflow</span>
</div>

## 기능 구성

<div class="article-table-wrap">
  <table>
    <thead>
      <tr>
        <th>영역</th>
        <th>구성</th>
        <th>제품 의미</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Book page detection</td>
        <td>GroundingDINO load, predict, annotate, box conversion, crop, OCR 후처리</td>
        <td>책 페이지에서 AI가 읽을 수 있는 텍스트 영역 후보를 만듭니다.</td>
      </tr>
      <tr>
        <td>Image preprocessing</td>
        <td>grayscale, CLAHE, sharpening, non-local means denoising, temp image 저장</td>
        <td>OCR 품질을 모델 교체만이 아니라 입력 품질 개선으로 다룹니다.</td>
      </tr>
      <tr>
        <td>Surya OCR API</td>
        <td>recognition/detection model loading, `/ocr`, language form, bbox와 confidence 반환</td>
        <td>다국어 OCR 결과를 line 단위 JSON으로 제공합니다.</td>
      </tr>
      <tr>
        <td>Surya layout API</td>
        <td>PDF rendering, text detection, OCR, layout detection, zip crop endpoint</td>
        <td>텍스트뿐 아니라 문서 구조와 영역 artifact를 함께 제공합니다.</td>
      </tr>
      <tr>
        <td>Detection endpoint</td>
        <td>base64 image request, box filtering/merging, annotated/merged image, JSON 결과</td>
        <td>모델 실험을 endpoint와 검수 가능한 산출물로 옮깁니다.</td>
      </tr>
      <tr>
        <td>Deployment scripts</td>
        <td>SageMaker model directory, inference app, serve script, endpoint invocation test</td>
        <td>OCR/detection 모델을 서비스 배포 단위로 포장하는 경험을 쌓았습니다.</td>
      </tr>
    </tbody>
  </table>
</div>

## 기여 내용

이 프로젝트의 핵심 역량은 컴퓨터 비전 모델을 제품 파이프라인으로 엮는 것입니다. OCR 모델 하나를 고르는 것보다 중요한 일은 입력을 어떻게 렌더링하고, 어떤 영역을 crop하고, 좌표를 어떤 기준으로 정렬하고, 디버그 가능한 이미지를 어떻게 남기고, 다음 LLM/음성/추천 엔진에 어떤 형식으로 넘길지 결정하는 것입니다. ArtygenSpace OCR 작업은 이 중간 계층을 설계하고 실험한 기록입니다.
