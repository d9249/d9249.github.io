---
title: "StoryMate - 개인화 독서 AI와 교육 콘텐츠 엔진"
projectName: "StoryMate"
tagline: "개인화 독서 AI와 교육 콘텐츠 엔진"
period: "ArtygenSpace / 2024.07 - 2025.07"
periodOrder: 20250705
description: "사용자별 문서 격리, Qdrant hybrid retrieval, 벡터 기반 대화 메모리, TTS/퀴즈/번역/요약 API를 연결한 독서 AI 제품 엔진입니다."
metrics:
  - "Hybrid RAG"
  - "User-isolated Qdrant"
  - "TTS/Quiz Engine"
stack:
  - "Python"
  - "FastAPI"
  - "Qdrant"
  - "LangChain"
  - "OpenAI"
  - "Gemini"
  - "Anthropic"
  - "WebSocket/SSE"
details:
  - "문서 업로드 API가 user_id, book_id, page 단위 입력을 청크로 나누고 사용자별 Qdrant 컬렉션에 저장하도록 구성했습니다."
  - "벡터 검색과 BM25 검색을 EnsembleRetriever로 결합하고, 사용자별 BM25 캐시를 둬 독서 질문의 의미 검색과 키워드 검색을 함께 사용했습니다."
  - "채팅 전용 메모리 컬렉션을 별도로 두어 이전 대화를 벡터 기반 맥락으로 검색하도록 설계했습니다."
  - "TTS, 맞춤법, 사운드, 퀴즈, 가사, 번역, 요약, 추천 질문, 이미지 기반 문제 풀이 API를 독서 경험 엔진으로 확장했습니다."
order: 51
draft: true
---

<section class="project-lead-panel">
  <span class="project-kicker">Personalized Reading AI</span>
  <p><strong>StoryMate는 책 내용을 넣고 질문하는 단순 챗봇이 아니라, 사용자별 독서 자료와 대화 맥락을 분리해 관리하는 개인화 독서 AI 엔진입니다.</strong></p>
  <p>핵심은 책 페이지, 사용자, 도서, 대화 이력을 같은 검색 공간에 섞지 않는 것입니다. 문서 컬렉션과 채팅 컬렉션을 분리하고, 검색은 vector similarity와 BM25를 결합하며, 생성 결과는 TTS, 퀴즈, 번역, 요약 같은 교육 콘텐츠 기능으로 확장됩니다.</p>
</section>

## 개요

StoryMate의 중심 질문은 "책을 읽는 사용자가 AI와 어떻게 지속적으로 상호작용할 수 있는가"였습니다. 사용자가 책 페이지를 업로드하면 시스템은 페이지를 문서로 만들고, 청크로 나누고, 사용자별 Qdrant 컬렉션에 저장합니다. 이후 사용자가 질문하면 시스템은 해당 사용자의 문서 컬렉션만 대상으로 hybrid retrieval을 수행하고, 다중 LLM provider 중 선택된 모델로 답변을 생성합니다.

여기서 중요한 점은 개인화와 격리입니다. 문서 저장소는 사용자 단위 컬렉션으로 구성되고, 채팅 메모리는 `{user_id}_chat` 형태의 별도 컬렉션에 저장됩니다. 즉 문서 검색 결과와 대화 메모리는 모두 벡터 검색에 참여할 수 있지만 저장 경계는 분리됩니다. 이 구조는 독서 기록, 업로드 문서, 이전 질문이 서로 영향을 주되 다른 사용자의 자료와 섞이지 않게 만드는 제품 경계입니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>문제</strong>
    <p>독서 AI는 책 전체를 기억해야 하지만 사용자별 자료와 대화 이력이 섞이면 제품 신뢰를 잃습니다.</p>
  </div>
  <div class="project-fact">
    <strong>접근</strong>
    <p>문서 컬렉션, 채팅 컬렉션, BM25 캐시를 사용자 기준으로 분리하고 hybrid retrieval로 검색 품질을 보강했습니다.</p>
  </div>
  <div class="project-fact">
    <strong>결과</strong>
    <p>질문 답변, 문서 목록 조회, TTS, 퀴즈, 요약, 추천 질문이 하나의 독서 경험으로 이어지는 엔진이 되었습니다.</p>
  </div>
</div>

<figure class="project-diagram">
  <img src="/images/projects/storymate-rag-runtime.svg" alt="StoryMate personalized reading AI runtime">
  <figcaption>StoryMate runtime. 사용자가 올린 페이지는 사용자별 문서 컬렉션으로 들어가고, 채팅은 별도 메모리 컬렉션에 저장됩니다.</figcaption>
</figure>

## 주요 기능

사용자가 만나는 기능은 크게 네 가지입니다. 첫째, 문서 업로드 API는 `user_id`, `book_id`, `pages` 구조를 받아 페이지별 텍스트를 정리하고 청크로 분할한 뒤 벡터 DB에 저장합니다. 둘째, 채팅 API는 질문과 모델명을 받아 RAG 시스템을 호출하고 답변을 반환합니다. 셋째, 문서 조회 API는 사용자별 컬렉션에서 도서와 청크를 다시 읽어 UI가 책 단위로 보여줄 수 있게 합니다. 넷째, 교육 콘텐츠 엔진은 같은 독서 입력을 TTS, 퀴즈, 요약, 추천 질문, 번역, 사운드 추천으로 확장합니다.

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3>Document Upload</h3>
    <p>페이지 기반 요청을 문서 객체와 청크로 바꾼 뒤 사용자별 Qdrant 컬렉션에 저장합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Hybrid Retrieval</h3>
    <p>OpenAI embedding 기반 vector search와 BM25 keyword search를 `EnsembleRetriever`로 결합합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Vector Memory</h3>
    <p>질문과 답변을 채팅 전용 컬렉션에 저장하고, 새 질문과 의미적으로 가까운 이전 대화를 검색합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Multi-model Chat</h3>
    <p>OpenAI, Gemini, Claude 계열 모델을 선택할 수 있는 provider 구조를 두고 독서 질문에 답합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>TTS and Realtime Job</h3>
    <p>단일/배치 TTS 생성, 다운로드, job status, WebSocket, SSE 진행 알림을 제공합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Learning Content</h3>
    <p>맞춤법, 퀴즈, 요약, 추천 질문, 번역, 검색, 캐릭터 응답을 독서 후 활동으로 확장합니다.</p>
  </div>
</div>

## 기술 구현

채팅 API의 흐름은 단순합니다. 요청은 `/api/v1/chat`으로 들어오고, RAG 시스템은 사용자 ID에 맞는 문서 컬렉션을 찾습니다. 검색기는 기본 vector retriever를 만들고, 가능한 경우 Qdrant에 저장된 payload를 샘플링해 BM25 retriever를 추가합니다. 두 retriever는 설정된 가중치로 합쳐지고, 답변 생성 후에는 대화가 채팅 전용 컬렉션에 저장됩니다.

이 구조에서 사용자별 cache가 중요한 이유는 동시성 때문입니다. BM25 검색기는 컬렉션 내용을 읽어 생성되므로 전역 객체로 섞이면 다른 사용자 문서가 검색 후보에 섞일 수 있습니다. 구현은 `user_id`와 collection name을 조합한 cache key를 사용해 사용자별 BM25 retriever를 분리합니다. 또한 Qdrant client를 공유하되 collection name은 사용자 기준으로 결정합니다.

<div class="project-flow">
  <span>01 Page upload</span>
  <span>02 User collection</span>
  <span>03 Hybrid retrieval</span>
  <span>04 LLM answer</span>
  <span>05 Vector memory</span>
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
        <td>Chat API</td>
        <td>model list, `/chat`, `/documents/upload`, `/documents/user/{user_id}`, health endpoint</td>
        <td>업로드, 질의응답, 문서 조회가 독서 챗봇의 기본 API가 됩니다.</td>
      </tr>
      <tr>
        <td>Vector Store</td>
        <td>사용자별 collection name 생성, book_id metadata, Qdrant scroll 기반 문서 상세 조회</td>
        <td>책과 페이지를 사용자 단위로 격리하고 다시 UI가 읽을 수 있는 구조로 보존합니다.</td>
      </tr>
      <tr>
        <td>Retriever Manager</td>
        <td>vector retriever, BM25 retriever, ensemble weights, 사용자별 BM25 cache</td>
        <td>의미 검색과 키워드 검색을 동시에 사용해 독서 질문의 검색 실패를 줄입니다.</td>
      </tr>
      <tr>
        <td>Chat Memory</td>
        <td>질문/답변을 `{user_id}_chat` 컬렉션에 upsert하고 유사 대화를 검색</td>
        <td>한 번의 질문으로 끝나지 않는 독서 대화 맥락을 만듭니다.</td>
      </tr>
      <tr>
        <td>Content Engine</td>
        <td>TTS, quiz, orthography, summary, question, translation, sound, search router</td>
        <td>독서 내용을 듣기, 문제 풀기, 요약, 추천 질문으로 확장합니다.</td>
      </tr>
      <tr>
        <td>Smoke Test</td>
        <td>health, models, document upload, chat, user document 조회 테스트</td>
        <td>업로드부터 채팅, 문서 조회까지 핵심 흐름을 빠르게 점검할 수 있습니다.</td>
      </tr>
    </tbody>
  </table>
</div>

## 기여 내용

이 프로젝트에서 포트폴리오에 드러내고 싶은 역량은 RAG 자체보다 RAG를 제품 경계에 맞춘 점입니다. 사용자별 문서 격리, book/page metadata, hybrid retriever, vector memory, TTS와 퀴즈 같은 후속 기능이 함께 있어야 독서 제품이 됩니다. 또한 FastAPI router, Docker 구성, 실시간 알림, pytest smoke test를 통해 연구 기능을 서비스 형태로 옮기는 작업을 수행했습니다.
