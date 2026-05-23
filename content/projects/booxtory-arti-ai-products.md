---
title: "ArtygenSpace AI Product Research Portfolio"
projectName: "ArtygenSpace"
tagline: "AI Product Research Portfolio"
period: "ArtygenSpace / 2024.07 - 2025.07"
periodOrder: 20250706
description: "booxTory와 arti의 CES 2025 성과를 중심으로, 1년간 수행한 독서 AI, 생성형 동화책, OCR, 벡터 검색, 모델 서빙 연구를 제품 포트폴리오로 정리한 허브입니다."
metrics:
  - "CES 2025"
  - "5 Product Tracks"
  - "AI Product Portfolio"
stack:
  - "Python"
  - "FastAPI"
  - "LLM"
  - "Qdrant"
  - "LangGraph"
  - "Computer Vision"
  - "Kafka"
details:
  - "booxTory는 CES 2025 AI 부문 Best of Innovation, arti는 CES 2025 Honoree 성과를 기록했습니다."
  - "StoryMate, Booxedit, 문서 OCR, RAG/vector intelligence, Engine Service를 별도 상세 프로젝트로 나누어 정리했습니다."
  - "제품 기능, 아키텍처, 기여 범위를 중심으로 공개 포트폴리오에 맞게 정리했습니다."
order: 50
draft: false
---

<section class="project-lead-panel">
  <span class="project-kicker">AI Product Portfolio</span>
  <p><strong>ArtygenSpace에서의 1년은 "AI 콘텐츠 제품 하나"를 만든 기간이라기보다, 독서 경험을 AI 제품으로 바꾸기 위한 여러 엔진을 실험하고 제품화한 기간이었습니다.</strong></p>
  <p>booxTory와 arti의 CES 2025 성과 뒤에는 문서 기반 독서 챗봇, 동화책 생성/편집 도구, OCR과 layout 분석, 벡터 기반 추천, 모델 서빙과 메시징 인프라가 함께 놓여 있었습니다. 이 페이지는 그 전체 지도를 보여주는 허브입니다.</p>
</section>

## 한 문장으로 정리하면

AI 콘텐츠 제품은 모델 성능만으로 완성되지 않습니다. 사용자가 책을 읽고, 내용을 이해하고, 장면을 만들고, 음성으로 듣고, 다시 편집하고, 추천받는 반복적인 경험이 하나의 제품 흐름으로 연결되어야 합니다. ArtygenSpace에서 맡은 일은 이 흐름을 모델 호출 묶음이 아니라 제품 엔진과 서비스 API로 바꾸는 것이었습니다.

기존 포트폴리오에는 이 경험이 booxTory / arti 한 줄로만 요약되어 있었습니다. 하지만 실제 산출물은 훨씬 넓었습니다. 문서를 사용자별로 분리해 검색하는 독서 챗봇, 책 내용에서 퀴즈와 추천 질문을 만드는 교육 엔진, GPT와 이미지 생성 모델을 연결한 동화책 제작 도구, GroundingDINO와 Surya를 활용한 OCR 실험, Qdrant 기반 음향/배경음악 추천, Kafka 기반 모델 서비스 운영 구조가 함께 진행되었습니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>제품 성과</strong>
    <p>booxTory Best of Innovation, arti Honoree라는 CES 2025 성과와 연결되는 AI 엔진 개발을 담당했습니다.</p>
  </div>
  <div class="project-fact">
    <strong>기술 범위</strong>
    <p>LLM, RAG, OCR, 이미지 생성, TTS, vector DB, Kafka, Docker 배포까지 제품형 AI 스택을 다뤘습니다.</p>
  </div>
  <div class="project-fact">
    <strong>기여 방식</strong>
    <p>연구 코드를 데모로 끝내지 않고 API, 워크플로우, 저장소, 배포 스크립트, 테스트 가능한 엔드포인트로 묶었습니다.</p>
  </div>
</div>

<figure class="project-diagram">
  <img src="/images/projects/artygenspace-product-map.svg" alt="ArtygenSpace AI product research portfolio map">
  <figcaption>ArtygenSpace 작업 지도. 공개 글에서는 내부 저장소 이름보다 제품 기능과 연구 축을 중심으로 정리했습니다.</figcaption>
</figure>

## 프로젝트 축

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3><a href="/projects/storymate-personalized-reading-ai/">StoryMate 독서 AI</a></h3>
    <p>사용자별 문서 컬렉션, hybrid retrieval, 벡터 기반 대화 메모리, TTS/퀴즈/번역 API를 연결한 독서 경험 엔진입니다.</p>
  </div>
  <div class="project-feature-card">
    <h3><a href="/projects/booxedit-storybook-generation/">Booxedit 생성형 동화책</a></h3>
    <p>스토리 작성, 이미지 생성, 음성 나레이션, PDF 출력, 갤러리 관리를 하나의 창작 워크플로우로 묶었습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3><a href="/projects/artygenspace-document-ocr-engine/">문서 OCR 엔진</a></h3>
    <p>GroundingDINO, Google Vision, Surya OCR/layout, SageMaker endpoint 실험을 통해 책 페이지와 문서 영역 인식을 다뤘습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3><a href="/projects/artygenspace-rag-vector-intelligence/">RAG와 Vector Intelligence</a></h3>
    <p>콘텐츠 산업 백서 RAG, multilingual embedding, Qdrant 기반 배경음악/효과음 검색을 연구형 기능에서 제품 후보로 확장했습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3><a href="/projects/artygenspace-model-serving-platform/">모델 서빙 플랫폼</a></h3>
    <p>Agent/Language/Voice API, LangGraph workflow, Kafka service registry, DB schema, Docker 배포를 통합 API 서비스로 정리했습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>booxTory / arti 제품화</h3>
    <p>위 연구 축을 실제 제품 기능으로 연결해 생성, 편집, 추천, 독서 보조 경험을 제품 지표와 수상 성과로 이어갔습니다.</p>
  </div>
</div>

## 제품으로 연결된 기술 판단

이 포트폴리오를 레포지토리 목록 그대로 나누지 않은 이유는 명확합니다. 실제 제품 경험은 저장소 경계와 다르게 움직였습니다. 예를 들어 StoryMate의 독서 경험은 문서 RAG만으로 끝나지 않고, TTS, 퀴즈, 요약, 추천 질문, 캐릭터 응답과 이어집니다. Booxedit 역시 Streamlit 데모 하나가 아니라 스토리 생성, 장면 프롬프트, 이미지 일관성, 오디오 저장, PDF 생성, 갤러리 이력 관리가 같이 있어야 제품처럼 보입니다.

그래서 이 허브는 "어떤 레포를 만들었다"보다 "어떤 제품 문제를 어떤 엔진으로 풀었는가"를 기준으로 구성했습니다. 공개 포트폴리오에서는 내부 구현명보다 제품 기능, 아키텍처, 기여 범위가 먼저 보이도록 정리했습니다.

<div class="article-table-wrap">
  <table>
    <thead>
      <tr>
        <th>프로젝트 축</th>
        <th>사용자 가치</th>
        <th>기술 구성</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>독서 챗봇과 교육 엔진</td>
        <td>사용자가 업로드한 책을 기반으로 질문하고, 듣고, 퀴즈를 풀고, 요약을 받는 경험</td>
        <td>FastAPI chat/upload endpoints, Qdrant vector store, BM25 ensemble, TTS WebSocket/SSE, quiz workflow</td>
      </tr>
      <tr>
        <td>동화책 생성/편집</td>
        <td>입력한 주인공과 상황을 바탕으로 이미지와 음성이 포함된 책을 생성</td>
        <td>Streamlit form, SQLite book/page tables, GPT story generation, DALL-E/Imagen image generation, PDF/audio persistence</td>
      </tr>
      <tr>
        <td>OCR와 layout analysis</td>
        <td>책 페이지와 문서 이미지에서 텍스트/영역/레이아웃을 구조화</td>
        <td>GroundingDINO crop pipeline, Surya OCR/layout endpoints, PDF page rendering, SageMaker endpoint test script</td>
      </tr>
      <tr>
        <td>벡터 추천과 RAG</td>
        <td>문서 기반 답변, 상황/감정/행동 기반 음향 추천, 배경음악 검색 후보 생성</td>
        <td>FAISS RetrievalQA, multilingual-e5 embedding, BGE-M3/Qdrant collection build, payload filter/search utilities</td>
      </tr>
      <tr>
        <td>모델 서비스 운영</td>
        <td>여러 AI 기능을 API, workflow, message queue, storage schema로 운영 가능하게 연결</td>
        <td>Agent/Language/Voice router, LangGraph workflow, Kafka registry, Docker Compose, MySQL book/page/content schema</td>
      </tr>
    </tbody>
  </table>
</div>

## 기여 내용

이 작업의 핵심 기여는 "좋은 모델을 써봤다"가 아닙니다. 모델을 제품 기능으로 옮기는 중간 계층을 설계하고 구현한 것입니다. 문서는 청크와 권한/사용자 경계가 있어야 검색될 수 있고, 이미지 생성은 페이지 맥락과 스타일 일관성이 있어야 책처럼 보이며, OCR은 텍스트만이 아니라 영역 순서와 후처리까지 있어야 다음 엔진에 넘길 수 있습니다. 또한 TTS, 퀴즈, 번역, 사운드 추천 같은 기능은 단건 함수가 아니라 API와 비동기 작업, 저장소, 배포 형태로 묶여야 실제 서비스가 됩니다.

따라서 ArtygenSpace 경험은 AI 연구, 제품 개발, MLOps를 분리하지 않고 연결한 경험입니다. 이 허브 아래의 상세 글들은 그 연결 지점을 프로젝트 단위로 풀어낸 기록입니다.
