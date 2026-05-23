---
title: "booxTory / arti - ArtygenSpace AI 제품 개발 포트폴리오"
projectName: "ArtygenSpace"
tagline: "booxTory / arti 제품 개발 포트폴리오"
period: "ArtygenSpace / 2024.07 - 2025.07"
periodOrder: 20250706
description: "ArtygenSpace에서 booxTory와 arti를 중심으로 수행한 독서 AI, 생성형 동화책, OCR, 추천, 모델 서비스 개발 경험을 제품명 기준으로 정리한 포트폴리오 허브입니다."
metrics:
  - "CES 2025"
  - "booxTory Best of Innovation"
  - "arti Honoree"
stack:
  - "Python"
  - "FastAPI"
  - "LLM"
  - "Qdrant"
  - "Computer Vision"
  - "TTS"
  - "Kafka"
details:
  - "booxTory는 CES 2025 AI 부문 Best of Innovation, arti는 CES 2025 Honoree 성과를 기록했습니다."
  - "독서 AI, 생성형 동화책, OCR, RAG, 음성/사운드, 모델 서비스 작업을 공식 제품 경험 안에서 다시 정리했습니다."
  - "공개 포트폴리오에서는 내부 저장소 이름보다 제품, 역할, 사용자 경험, 기술적 문제 해결을 중심으로 설명합니다."
order: 50
draft: false
---

<section class="project-lead-panel">
  <span class="project-kicker">Product Portfolio</span>
  <p><strong>ArtygenSpace에서의 1년은 booxTory와 arti라는 두 제품을 만들기 위해 독서, 창작, 인식, 음성, 추천, 모델 운영 기술을 한 제품 흐름 안에 묶어 간 기간이었습니다.</strong></p>
  <p>이전 글은 기술 축이 앞에 나오면서 실제 프로젝트명이 흐려졌습니다. 이 페이지는 공개 포트폴리오 기준을 제품명으로 다시 세우고, 내가 맡았던 연구와 엔지니어링을 booxTory와 arti 안에서 설명합니다.</p>
</section>

## 제품 기준으로 다시 정리한 이유

ArtygenSpace에서 진행한 작업은 저장소나 기술 이름만 보면 OCR, RAG, 생성, TTS, Kafka, 모델 서빙처럼 여러 갈래로 보입니다. 하지만 실제 포트폴리오에서 먼저 보여야 하는 것은 "무엇을 만들었는가"입니다. 그 답은 booxTory와 arti입니다.

booxTory는 책을 더 잘 읽고 이해하도록 돕는 독서 AI 제품입니다. 책 페이지를 읽고, 사용자별 자료를 분리하고, 질문에 답하고, 퀴즈와 번역, 요약, 음성 기능으로 이어지는 경험이 중심입니다. arti는 사용자의 입력을 바탕으로 이야기, 일러스트, 음성, PDF까지 만들어 내는 생성형 스토리텔링 제품입니다. 두 제품 모두 CES 2025에서 성과를 냈고, 내가 맡은 작업은 그 제품 경험을 가능하게 하는 AI 엔진과 서비스 계층을 만드는 일이었습니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>booxTory</strong>
    <p>책 페이지 이해, 독서 챗봇, 개인화 검색, TTS, 퀴즈, 번역, 추천 질문을 독서 경험으로 연결했습니다.</p>
  </div>
  <div class="project-fact">
    <strong>arti</strong>
    <p>사용자 설정에서 이야기, 장면 이미지, 나레이션, PDF, 갤러리로 이어지는 생성형 동화책 흐름을 만들었습니다.</p>
  </div>
  <div class="project-fact">
    <strong>공통 기반</strong>
    <p>OCR, 벡터 검색, 모델 API, 비동기 처리, 저장 구조를 제품 서버가 호출할 수 있는 형태로 정리했습니다.</p>
  </div>
</div>

<figure class="project-diagram">
  <img src="/images/projects/artygenspace-product-map.svg" alt="booxTory and arti product portfolio map">
  <figcaption>ArtygenSpace 제품 개발 지도. 독립 기술 목록이 아니라 booxTory와 arti를 만든 하위 기능으로 정리했습니다.</figcaption>
</figure>

## 상세 글

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3><a href="/projects/booxtory-ai-reading-product/">booxTory</a></h3>
    <p>CES 2025 Best of Innovation 제품인 booxTory에서 책 페이지 인식, 개인화 독서 AI, RAG, TTS, 퀴즈와 추천 기능을 제품 흐름으로 묶은 경험입니다.</p>
  </div>
  <div class="project-feature-card">
    <h3><a href="/projects/arti-ai-storytelling-product/">arti</a></h3>
    <p>CES 2025 Honoree 제품인 arti에서 이야기 생성, 페이지 이미지, 음성 나레이션, PDF, 갤러리와 모델 서비스 계층을 연결한 경험입니다.</p>
  </div>
</div>

## 내가 맡은 역할

내 역할은 모델을 단독으로 실험하는 데서 끝나지 않았습니다. 사용자가 보는 제품 흐름으로 넘어가기 위해 API, 저장소, 검색 구조, 모델 호출, 비동기 작업, 배포 단위를 함께 맞췄습니다. 예를 들어 책 페이지를 AI가 읽게 하려면 OCR 결과만 있으면 부족합니다. 페이지 순서, 영역 위치, 사용자와 책의 관계, 후속 퀴즈나 음성 기능이 함께 이어져야 합니다. 동화책 생성도 마찬가지입니다. 한 장의 이미지를 만드는 것보다 중요한 일은 여러 페이지의 이야기와 이미지, 음성, PDF가 같은 책으로 남는 것입니다.

따라서 이 포트폴리오에서는 기술을 따로 세우지 않고, 제품 안에서 어떤 문제를 풀었는지로 정리합니다. OCR은 booxTory의 책 이해 흐름으로, RAG와 벡터 검색은 독서 질문과 사운드 추천으로, 모델 서빙은 booxTory와 arti가 공통으로 호출하는 AI 기능 계층으로 설명합니다.

<div class="article-table-wrap">
  <table>
    <thead>
      <tr>
        <th>제품</th>
        <th>사용자 경험</th>
        <th>내가 만든 기술 흐름</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>booxTory</td>
        <td>책을 읽고, 질문하고, 듣고, 퀴즈를 풀고, 장면에 맞는 추천을 받는 독서 경험</td>
        <td>책 페이지 OCR, 사용자별 문서 검색, 독서 챗봇, TTS, 퀴즈/요약/번역, 벡터 추천</td>
      </tr>
      <tr>
        <td>arti</td>
        <td>주인공과 상황을 입력하면 글, 이미지, 음성, PDF로 완성되는 창작 경험</td>
        <td>스토리 생성, 장면 프롬프트, 이미지 생성, 음성 나레이션, PDF 저장, 갤러리 관리</td>
      </tr>
      <tr>
        <td>공통 AI 서비스</td>
        <td>제품 서버가 여러 모델 기능을 안정적으로 호출하고 결과를 제품 데이터로 저장하는 운영 경험</td>
        <td>FastAPI 라우터, 기능별 요청 모델, LangGraph workflow, Kafka 처리, Docker 배포, 책/페이지 데이터 구조</td>
      </tr>
    </tbody>
  </table>
</div>

## 포트폴리오에서 보여주고 싶은 점

booxTory와 arti는 단순히 "LLM을 붙인 서비스"가 아닙니다. 둘 다 책이라는 콘텐츠를 다룹니다. 책은 페이지 순서, 장면 맥락, 캐릭터 일관성, 읽기 방식, 음성, 추천, 저장과 다시 읽기가 함께 있어야 제품이 됩니다. 이 프로젝트에서 내가 만든 가치는 모델 호출을 그런 제품 경험에 맞게 구조화한 데 있습니다.

공개 글에서는 내부 저장소나 실험 이름을 전면에 세우지 않습니다. 대신 booxTory와 arti라는 제품 이름을 기준으로, 내가 어떤 사용자 흐름을 만들었고 어떤 기술적 문제를 해결했는지 보여줍니다.
