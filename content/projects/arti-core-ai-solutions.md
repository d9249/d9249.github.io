---
title: "arti - 핵심 AI 솔루션 기술 리드"
projectName: "arti"
tagline: "핵심 AI 솔루션 기술 리드"
period: "ArtygenSpace / 2024.07 - 2025.07"
periodOrder: 20250704
description: "CES 2025 Honoree 제품인 arti에서 CATS, MERGE, CLEAR, NEXIS 네 가지 핵심 AI 솔루션의 기술 방향과 제품화 흐름을 리드한 경험입니다."
metrics:
  - "CES 2025 Honoree"
  - "4 Core AI Solutions"
  - "AI Tech Lead"
stack:
  - "LangGraph"
  - "Qdrant"
  - "BGE-M3"
  - "Vision Transformer"
  - "OCR"
  - "RAG"
  - "FastAPI"
  - "NLP"
details:
  - "CATS: LangGraph 다중 에이전트로 책 한 권을 퀴즈·음악·인터랙티브 스토리로 변환하는 콘텐츠 솔루션의 기술 방향을 리드 → 정적인 책을 능동형 콘텐츠로 확장했습니다."
  - "MERGE: 자연어 프롬프트로 객체를 탐지하고 정밀 분할·중복 제거하는 탐지 솔루션을 리드 → 좌표를 몰라도 '무엇을'을 말로 지정하는 이미지 편집 흐름을 가능하게 했습니다."
  - "CLEAR: 다국어 문서를 레이아웃 보존한 채 인식하고 OCR 결과를 교정·구조화하는 문서 인식 솔루션을 리드 → 원문 구조가 살아있는 디지털화를 구현했습니다."
  - "NEXIS: 문서 기반 질의응답과 텍스트–효과음 매칭을 잇는 검색/추천 솔루션을 리드 → 콘텐츠 맥락에 맞는 사운드를 자동 연결했습니다. (4개 솔루션으로 CES 2025 Honoree 기여)"
order: 52
draft: false
---

<section class="project-lead-panel">
  <span class="project-kicker">arti</span>
  <p><strong>arti는 하나의 단일 기능이 아니라, 네 가지 핵심 AI 솔루션을 묶어 제품화한 프로젝트입니다.</strong></p>
  <p>내 역할은 CATS, MERGE, CLEAR, NEXIS의 기술 방향을 잡고, 각 솔루션이 실제 제품 기능으로 동작할 수 있도록 모델, 검색, 문서 처리, 에이전트 workflow를 연결하는 것이었습니다.</p>
</section>

## 제품 개요

arti는 CES 2025 Honoree를 받은 ArtygenSpace의 AI 제품 프로젝트입니다. 이 프로젝트 안에서 내가 담당한 핵심은 네 가지 AI 솔루션입니다. 콘텐츠를 자동 생성하는 `CATS`, 이미지 속 객체를 자연어 프롬프트로 찾는 `MERGE`, 다국어 문서를 인식하고 교정하는 `CLEAR`, 문서를 바탕으로 대화하고 효과음까지 매칭하는 `NEXIS`입니다.

이 네 솔루션은 서로 다른 모델을 쓰지만 제품 관점에서는 같은 목표를 가집니다. 사용자의 콘텐츠와 문서를 AI가 이해 가능한 구조로 바꾸고, 그 결과를 대화, 생성, 추천, 매칭 기능으로 연결하는 것입니다. 그래서 arti는 "생성 기능 하나"가 아니라 콘텐츠 AI, 비전 AI, 문서 AI, 검색/추천 AI를 함께 다루는 제품 프로젝트로 정리하는 편이 정확합니다.

<figure class="project-diagram">
  <img src="/images/projects/arti-core-solutions.svg" alt="arti four core AI solutions">
  <figcaption>arti의 네 가지 핵심 AI 솔루션. CATS, MERGE, CLEAR, NEXIS가 각각 콘텐츠, 탐지, 문서 인식, 문서 대화/매칭을 담당합니다.</figcaption>
</figure>

## 핵심 AI 솔루션

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3>CATS</h3>
    <p>LangGraph 기반 다중 에이전트로 책 내용을 퀴즈, 음악, 인터랙티브 스토리로 자동 변환하는 콘텐츠 솔루션입니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>MERGE</h3>
    <p>자연어 프롬프트로 이미지에서 객체를 찾고, 정밀 영역 분할과 중복 제거까지 수행하는 탐지 솔루션입니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>CLEAR</h3>
    <p>90여 개 언어 문서를 읽고 레이아웃을 보존하며 OCR 결과를 교정/구조화하는 문서 인식 솔루션입니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>NEXIS</h3>
    <p>문서 기반 질문에 답하고, 텍스트 분위기와 맞는 효과음까지 추천하는 대화/매칭 솔루션입니다.</p>
  </div>
</div>

## CATS - 다중 에이전트 콘텐츠 솔루션

CATS는 책 내용을 그대로 보여주는 것이 아니라, 독자가 상호작용할 수 있는 콘텐츠로 바꾸는 솔루션입니다. LangGraph 기반 다중 에이전트가 책 내용을 분석하고, 퀴즈와 음악, 인터랙티브 스토리 같은 후속 콘텐츠를 생성합니다.

이 솔루션에서 중요한 것은 여러 생성 기능을 따로 호출하는 것이 아니라, 책의 맥락을 유지한 상태로 콘텐츠를 나누어 만드는 것입니다. 벡터 검색은 책 내용과 질문의 관련성을 유지하는 데 사용되고, 에이전트 workflow는 퀴즈 생성, 음악 매칭, 스토리 변환처럼 서로 다른 출력을 하나의 흐름 안에서 조율합니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>핵심 기술</strong>
    <p>LangGraph, 벡터 검색, 자동 콘텐츠 생성</p>
  </div>
  <div class="project-fact">
    <strong>주요 기능</strong>
    <p>퀴즈 생성, 음악 매칭, 인터랙티브 스토리 변환</p>
  </div>
  <div class="project-fact">
    <strong>목표 지표</strong>
    <p>퀴즈 생성 관련성 95%, 음악 매칭 일치율 90%</p>
  </div>
</div>

## MERGE - 프롬프트 기반 탐지 솔루션

MERGE는 "검은 고양이 찾아줘"처럼 자연어로 요청하면 이미지 안에서 해당 객체를 찾는 솔루션입니다. 정해진 class label만 찾는 탐지기가 아니라, 프롬프트 기반으로 다양한 객체를 실시간 감지하는 쪽에 초점을 맞췄습니다.

멀티모달 Transformer를 활용해 이미지와 텍스트 프롬프트를 함께 해석하고, 탐지 결과는 정밀 영역 분할과 중복 제거 과정을 거칩니다. 제품 관점에서는 사용자가 복잡한 설정을 몰라도 찾고 싶은 대상을 말로 지정할 수 있다는 점이 중요했습니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>핵심 기술</strong>
    <p>멀티모달 Transformer, 프롬프트 기반 객체 탐지</p>
  </div>
  <div class="project-fact">
    <strong>주요 기능</strong>
    <p>자연어 객체 탐지, 정밀 영역 분할, 중복 제거</p>
  </div>
  <div class="project-fact">
    <strong>목표 지표</strong>
    <p>bbox AP 56.7, 0.2초 처리 속도, 제로샷 매칭</p>
  </div>
</div>

## CLEAR - 다국어 문서 인식 및 교정

CLEAR는 다국어 문서를 정확히 읽고, 레이아웃을 보존하며, OCR 결과를 자동 교정하는 문서 인식 솔루션입니다. 단순 텍스트 추출이 아니라 문서 구조를 유지하면서 후속 검색이나 대화 기능에서 사용할 수 있는 형태로 정리하는 것이 목표였습니다.

Vision Transformer와 OCR-free 인식 흐름을 바탕으로 문서 이미지를 처리하고, NLP 교정으로 인식 결과의 품질을 높입니다. 레이아웃과 텍스트 검출에는 SegFormer/EfficientViT 계열 접근을 적용해 문서 안의 구조를 분리하고, 대량 문서를 처리할 수 있는 pipeline 형태로 설계했습니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>핵심 기술</strong>
    <p>Vision Transformer, OCR-free 인식, NLP 교정</p>
  </div>
  <div class="project-fact">
    <strong>주요 기능</strong>
    <p>다국어 인식, 레이아웃 보존, 텍스트 교정, 구조화</p>
  </div>
  <div class="project-fact">
    <strong>목표 지표</strong>
    <p>99% 검출 정확도, 98.7% 교정 정확도</p>
  </div>
</div>

## NEXIS - 문서기반 대화 및 매칭 솔루션

NEXIS는 문서 기반 질의응답과 매칭을 담당하는 솔루션입니다. 사용자가 문서에 대해 질문하면 핵심 내용을 찾아 답하고, 텍스트 분위기나 장면에 맞는 효과음까지 추천할 수 있도록 설계했습니다.

기술적으로는 RAG, Qdrant, BGE-M3를 중심으로 문서 검색과 cross-modal 매칭을 구성했습니다. 문서 기반 대화에서는 검색 품질과 할루시네이션 억제가 중요하고, 효과음 매칭에서는 텍스트와 사운드 자산을 같은 검색 문제로 다루는 설계가 필요했습니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>핵심 기술</strong>
    <p>RAG, Qdrant, BGE-M3</p>
  </div>
  <div class="project-fact">
    <strong>주요 기능</strong>
    <p>문서 질의응답, cross-modal 텍스트-효과음 매칭, 크로스링구얼 처리</p>
  </div>
  <div class="project-fact">
    <strong>목표 지표</strong>
    <p>50ms 검색, 할루시네이션 2% 이하</p>
  </div>
</div>

## 기술 리드 범위

arti에서 맡은 일은 네 솔루션을 각각의 실험 코드로 두지 않고, 제품에서 설명 가능한 기능 단위로 정리하는 것이었습니다. CATS는 콘텐츠 생성 workflow, MERGE는 프롬프트 기반 탐지, CLEAR는 문서 인식과 교정, NEXIS는 문서 검색과 매칭이라는 식으로 역할을 분리했습니다.

<div class="article-table-wrap">
  <table>
    <thead>
      <tr>
        <th>솔루션</th>
        <th>제품 문제</th>
        <th>기술 리드 범위</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>CATS</td>
        <td>책 내용을 상호작용 가능한 콘텐츠로 확장</td>
        <td>다중 에이전트 workflow, 벡터 검색, 퀴즈/음악/스토리 생성 흐름 구성</td>
      </tr>
      <tr>
        <td>MERGE</td>
        <td>사용자 프롬프트로 이미지 객체 탐지</td>
        <td>멀티모달 탐지, bounding box, 영역 분할, 중복 제거, 제로샷 매칭</td>
      </tr>
      <tr>
        <td>CLEAR</td>
        <td>다국어 문서 인식과 자동 교정</td>
        <td>문서 layout 분석, OCR-free 인식, NLP 교정, 대량 처리 pipeline</td>
      </tr>
      <tr>
        <td>NEXIS</td>
        <td>문서 기반 대화와 효과음 매칭</td>
        <td>RAG, Qdrant 검색, BGE-M3 embedding, cross-modal matching</td>
      </tr>
    </tbody>
  </table>
</div>

## 결과

arti 프로젝트에서 보여주고 싶은 것은 네 가지입니다. 콘텐츠를 만드는 CATS, 이미지를 이해하는 MERGE, 문서를 읽고 고치는 CLEAR, 문서와 사운드를 검색/매칭하는 NEXIS를 하나의 제품 프로젝트 안에서 기술적으로 리드했다는 점입니다.

각 솔루션은 모델 하나로 끝나지 않습니다. 사용자 입력, 데이터 구조, 검색 방식, 후처리, API 경계, 성능 목표까지 함께 맞춰야 제품 기능이 됩니다. arti에서의 역할은 이 기술들을 실제 솔루션 이름으로 묶고, 제품에서 설명 가능한 구조로 만드는 일이었습니다.
