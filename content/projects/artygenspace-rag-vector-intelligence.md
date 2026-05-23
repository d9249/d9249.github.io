---
title: "ArtygenSpace RAG & Vector Intelligence - 문서 질의응답과 추천 검색"
projectName: "ArtygenSpace RAG & Vector Intelligence"
tagline: "문서 질의응답과 추천 검색"
period: "ArtygenSpace / 2024.07 - 2025.07"
periodOrder: 20250701
description: "콘텐츠 산업 백서 RAG, multilingual embedding, Qdrant 기반 효과음/배경음악 검색을 통해 문서와 멀티미디어 추천을 벡터 검색 문제로 풀어낸 연구입니다."
metrics:
  - "FAISS RAG"
  - "Multilingual E5"
  - "Qdrant/BGE-M3"
stack:
  - "Python"
  - "LangChain"
  - "FAISS"
  - "Qdrant"
  - "BGE-M3"
  - "multilingual-e5"
  - "OpenAI"
  - "Pandas"
details:
  - "2021-2023 콘텐츠산업백서를 PyPDF, chunking, FAISS, GPT-4o RetrievalQA로 연결해 조사 응답형 RAG를 구성했습니다."
  - "multilingual-e5-large 기반 embedding을 3072차원으로 확장/정규화하고 CSV 자산을 분할해 대용량 처리 흐름을 만들었습니다."
  - "상황, 환경, 감정, 행동 조합을 생성하고 BGE-M3 embedding으로 Qdrant 컬렉션을 구성해 효과음 검색 후보를 만들었습니다."
  - "배경음악 데이터셋은 분위기와 상황 요소 조합으로 파일명, 설명, 생성형 AI 프롬프트를 만드는 방식으로 확장했습니다."
order: 54
draft: true
---

<section class="project-lead-panel">
  <span class="project-kicker">Vector Intelligence</span>
  <p><strong>이 프로젝트 축은 문서 답변과 멀티미디어 추천을 모두 "좋은 검색 후보를 어떻게 만들 것인가"라는 문제로 다뤘습니다.</strong></p>
  <p>콘텐츠 산업 백서 RAG에서는 보고서 문서를 바탕으로 답변해야 했고, 효과음/배경음악 추천에서는 상황, 감정, 환경, 행동 같은 비정형 신호를 벡터 검색 가능한 자산으로 바꿔야 했습니다.</p>
</section>

## 개요

RAG와 vector intelligence 작업은 두 종류의 검색 문제를 다뤘습니다. 첫 번째는 문서 기반 질의응답입니다. 2021, 2022, 2023 콘텐츠산업백서 PDF를 로드하고, chunking하고, embedding하고, FAISS vector store를 구성해 GPT-4o 기반 RetrievalQA chain으로 설문/보고서형 질문에 답했습니다. 답변에는 참조 문서를 함께 저장해 보고서형 결과를 관리할 수 있게 했습니다.

두 번째는 추천 후보 생성입니다. 독서 제품이나 콘텐츠 경험에서는 "무서운 숲 장면에 어울리는 효과음", "비 오는 도시 장면에 어울리는 배경음악"처럼 텍스트 query와 멀티미디어 자산을 연결해야 합니다. 이를 위해 multilingual-e5 embedding, BGE-M3 embedding, Qdrant collection, payload filter, 조합형 데이터 생성 스크립트를 활용했습니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>문제</strong>
    <p>문서 답변과 사운드 추천 모두 단순 키워드 매칭만으로는 맥락을 충분히 반영하기 어렵습니다.</p>
  </div>
  <div class="project-fact">
    <strong>접근</strong>
    <p>문서는 RAG chain으로, 추천 자산은 embedding과 payload metadata를 가진 Qdrant collection으로 구조화했습니다.</p>
  </div>
  <div class="project-fact">
    <strong>결과</strong>
    <p>보고서형 답변, 효과음 검색, 배경음악 후보 생성을 모두 vector retrieval 설계로 설명할 수 있게 됐습니다.</p>
  </div>
</div>

<figure class="project-diagram">
  <img src="/images/projects/artygenspace-rag-vector-loop.svg" alt="ArtygenSpace RAG and vector intelligence loop">
  <figcaption>RAG and vector intelligence loop. 문서와 멀티미디어 자산은 청크, 임베딩, 컬렉션, 검색, 생성 답변으로 이어집니다.</figcaption>
</figure>

## 주요 기능

문서 RAG 표면에서는 질문 리스트가 있고, 시스템은 각 질문에 대해 답변과 참조 문서를 파일로 저장합니다. 이 흐름은 보고서 작성, 시장 조사, 정책/수출 전망 응답처럼 "문서를 바탕으로 자연어 답변을 만들어야 하는" 업무에 맞습니다.

추천 검색 표면에서는 상황, 환경, 감정, 행동의 조합이 하나의 sentence와 payload로 변환됩니다. 사용자는 자연어 장면을 입력하거나 metadata filter를 걸어 적절한 효과음/배경음악 후보를 찾을 수 있습니다. 배경음악 데이터셋은 분위기와 상황 요소를 조합해 파일명, 설명, 생성형 AI 프롬프트를 함께 만듭니다.

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3>PDF RAG</h3>
    <p>콘텐츠산업백서 PDF를 로드하고 청크로 나눈 뒤 FAISS vector store를 만들어 RetrievalQA를 실행합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Report-grounded Answer</h3>
    <p>각 질문의 답변과 함께 참조 문서를 저장해 보고서 작성 흐름에서 다시 볼 수 있게 합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Embedding Toolkit</h3>
    <p>multilingual-e5-large 임베딩을 생성하고 3072차원으로 확장/정규화해 CSV 자산에 저장합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Large CSV Handling</h3>
    <p>대용량 embedding CSV를 chunk 단위로 분할해 서비스 입력 자산으로 다룰 수 있게 합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Qdrant Search Asset</h3>
    <p>상황, 환경, 감정, 행동 payload를 가진 effect collection을 만들고 검색/분포 점검 도구를 둡니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>BGM Prompt Dataset</h3>
    <p>분위기와 상황 조합으로 배경음악 파일명, 설명, 생성형 AI 프롬프트 후보를 생성합니다.</p>
  </div>
</div>

## 기술 구현

문서 RAG는 고전적인 흐름을 충실히 따릅니다. PDF loader가 각 백서를 읽고, `RecursiveCharacterTextSplitter`가 chunk를 만들고, `OpenAIEmbeddings`가 vector를 만들고, FAISS vector store가 retriever가 됩니다. prompt는 한국어 보고서 답변 어투와 문서 컨텍스트 사용 규칙을 포함하고, 질문별 결과는 답변과 참조 문서로 저장됩니다.

추천 검색은 더 실험적입니다. 상황, 환경, 감정, 행동의 조합을 만들되 명백히 불가능한 조합은 rule로 필터링합니다. 각 조합은 자연어 sentence와 payload metadata가 되고, BGE-M3 dense embedding으로 Qdrant에 저장됩니다. 이후 search utility는 collection size, vector shape, situation distribution, payload filter를 점검합니다. 이 흐름은 추천 모델을 바로 학습하기보다 검색 가능한 후보 공간을 먼저 구축하는 접근입니다.

<div class="project-flow">
  <span>01 Input data</span>
  <span>02 Chunk/expand</span>
  <span>03 Embed</span>
  <span>04 Vector store</span>
  <span>05 Answer/search</span>
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
        <td>Content report RAG</td>
        <td>PDF load, chunking, OpenAI embedding, FAISS, RetrievalQA, 참조 문서 저장</td>
        <td>시장/정책 질문에 참조 문서 기반 답변을 생성합니다.</td>
      </tr>
      <tr>
        <td>Prompt design</td>
        <td>한국어 답변, 모르면 모른다고 말하기, 보고서 답변 어투, 2025 질문 맥락 지정</td>
        <td>단순 Q&A보다 실제 설문/보고서 작성 목적에 맞춘 응답을 만듭니다.</td>
      </tr>
      <tr>
        <td>Embedding toolkit</td>
        <td>multilingual-e5-large, 3072차원 확장, L2 정규화, 결측값 처리</td>
        <td>텍스트 자산을 검색/추천에 재사용 가능한 embedding table로 만듭니다.</td>
      </tr>
      <tr>
        <td>Effect vector DB</td>
        <td>상황/환경/감정/행동 조합, rule filter, BGE-M3 embedding, Qdrant upsert</td>
        <td>장면 맥락을 효과음 추천 후보 공간으로 변환합니다.</td>
      </tr>
      <tr>
        <td>Qdrant utilities</td>
        <td>collection inspect, vector shape 점검, payload distribution, filter search</td>
        <td>검색 품질을 운영자가 점검할 수 있는 도구를 둡니다.</td>
      </tr>
      <tr>
        <td>BGM dataset generation</td>
        <td>분위기와 상황 요소 조합, 파일명, 설명, 생성형 AI 프롬프트 생성</td>
        <td>배경음악 추천과 생성 후보를 structured catalog로 확장합니다.</td>
      </tr>
    </tbody>
  </table>
</div>

## 기여 내용

이 작업의 강점은 RAG와 추천을 별개의 기술로 보지 않은 점입니다. 둘 다 결국 "어떤 원천 데이터를 어떤 단위로 쪼개고, 어떤 임베딩으로 표현하고, 어떤 metadata를 붙여 검색할 것인가"의 문제입니다. 문서 RAG에서는 참조 문서가 답변 품질을 지탱하고, 사운드 추천에서는 상황/감정 payload가 검색 제어면이 됩니다. 이 관점은 이후 StoryMate와 Engine Service의 검색/추천 기능으로 이어질 수 있는 기반입니다.
