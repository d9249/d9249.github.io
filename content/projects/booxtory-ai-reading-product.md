---
title: "booxTory - AI 독서 경험 제품 개발"
projectName: "booxTory"
tagline: "AI 독서 경험 제품 개발"
period: "ArtygenSpace / 2024.07 - 2025.07"
periodOrder: 20250705
description: "CES 2025 Best of Innovation을 받은 booxTory에서 책 페이지 인식, 사용자별 독서 AI, RAG, TTS, 퀴즈, 번역, 추천 기능을 제품 흐름으로 묶은 경험입니다."
metrics:
  - "CES 2025 Best of Innovation"
  - "Personalized Reading AI"
  - "OCR/RAG/TTS"
stack:
  - "Python"
  - "FastAPI"
  - "Qdrant"
  - "LangChain"
  - "OpenAI"
  - "Computer Vision"
  - "TTS"
details:
  - "책 페이지 이미지를 텍스트·영역으로 변환해 사용자·책 단위 독서 데이터로 연결 → 종이책을 개인화 AI가 붙는 디지털 독서 세션으로 만들었습니다."
  - "사용자별 문서 컬렉션과 채팅 메모리를 분리 → 독서 질문·이전 대화·책 맥락이 섞이지 않고 안전하게 결합되는 개인화 RAG를 설계했습니다."
  - "TTS·퀴즈·요약·번역·추천 질문·사운드 추천을 독서 후속 활동으로 확장 → 한 번의 페이지 인식에서 여러 상호작용이 파생되는 제품 흐름을 완성했습니다."
  - "모델 실험을 API·저장소·비동기 작업·테스트 가능한 서비스로 이관 → 연구 코드를 CES 2025 Best of Innovation 제품 런타임으로 안착시켰습니다."
order: 51
draft: false
---

<section class="project-lead-panel">
  <span class="project-kicker">booxTory</span>
  <p><strong>booxTory에서 맡은 일은 책을 AI가 읽고, 사용자가 다시 질문하고, 그 결과를 듣기와 퀴즈, 번역, 추천으로 확장하는 독서 경험을 만드는 것이었습니다.</strong></p>
  <p>책 이미지를 텍스트로 바꾸는 일, 텍스트를 사용자별로 저장하는 일, 질문에 맞는 문맥을 찾는 일, 답변을 교육 콘텐츠로 확장하는 일이 하나의 제품 흐름 안에서 이어져야 했습니다.</p>
</section>

## 제품 개요

booxTory는 CES 2025 AI 부문 Best of Innovation을 받은 ArtygenSpace의 독서 AI 제품입니다. 제품이 해결하려는 문제는 단순합니다. 책은 이미 좋은 콘텐츠지만, 아이나 학습자가 책을 읽는 과정에서 질문하고, 다시 듣고, 이해도를 확인하고, 장면에 어울리는 도움을 받으려면 책의 내용이 AI가 다룰 수 있는 구조로 바뀌어야 합니다.

내가 맡은 범위는 이 전환 과정에 있었습니다. 책 페이지를 OCR과 영역 정보로 바꾸고, 페이지와 책 metadata를 보존하고, 사용자별 문서 저장소에 넣고, 질문이 들어오면 그 사용자와 책에 맞는 문맥만 찾아 답하게 만드는 흐름을 구현했습니다. 이후 답변은 TTS, 퀴즈, 요약, 번역, 추천 질문, 사운드 추천 같은 활동으로 이어졌습니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>제품 목표</strong>
    <p>책을 읽는 사용자가 AI에게 질문하고, 듣고, 이해를 확인하고, 장면 맥락을 확장할 수 있게 만드는 것입니다.</p>
  </div>
  <div class="project-fact">
    <strong>기술 문제</strong>
    <p>책 페이지, 사용자, 도서, 채팅 이력, 음성/퀴즈 결과가 서로 다른 경계를 가지면서도 한 경험으로 이어져야 했습니다.</p>
  </div>
  <div class="project-fact">
    <strong>기여 범위</strong>
    <p>OCR, 개인화 RAG, 벡터 메모리, TTS/퀴즈/번역 API, 추천 검색, 실행 가능한 서비스 계층을 함께 다뤘습니다.</p>
  </div>
</div>

<figure class="project-diagram">
  <img src="/images/projects/booxtory-product-loop.svg" alt="booxTory AI reading product loop">
  <figcaption>booxTory 제품 흐름. 책 페이지 입력은 인식, 저장, 검색, 답변, 학습 콘텐츠로 이어집니다.</figcaption>
</figure>

## 사용자가 만나는 경험

사용자는 책을 읽다가 페이지 내용을 바탕으로 질문할 수 있습니다. 시스템은 사용자의 책 페이지와 이전 대화 중 관련 있는 정보를 찾고, 선택된 LLM으로 답변을 만듭니다. 이 답변은 텍스트로 끝나지 않고 음성으로 들을 수 있으며, 같은 독서 맥락에서 퀴즈, 요약, 번역, 추천 질문으로 확장됩니다.

이 경험을 만들기 위해서는 사용자별 격리가 중요했습니다. 같은 책을 읽더라도 사용자마다 업로드한 페이지, 읽은 범위, 질문 이력이 다릅니다. 그래서 문서 컬렉션과 채팅 메모리를 사용자 기준으로 분리하고, 질문 시점에는 해당 사용자에게 맞는 문맥만 검색하도록 구성했습니다.

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3>책 페이지 이해</h3>
    <p>책 이미지와 PDF 입력을 텍스트, 영역, 좌표, 페이지 단위 정보로 바꿔 다음 AI 기능이 사용할 수 있게 했습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>개인화 독서 질문</h3>
    <p>사용자와 책 단위로 저장된 문서를 검색해 현재 질문에 맞는 문맥을 찾고 답변을 생성했습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>대화 메모리</h3>
    <p>이전 질문과 답변을 별도 검색 공간에 저장해 한 번의 질의응답이 아니라 이어지는 독서 대화를 만들었습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>듣기와 학습 활동</h3>
    <p>TTS, 퀴즈, 요약, 번역, 추천 질문을 붙여 책을 읽은 뒤의 활동까지 제품 경험으로 확장했습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>장면 추천</h3>
    <p>상황, 감정, 행동 정보를 벡터 검색 가능한 형태로 바꿔 효과음과 배경음악 추천 후보를 만들었습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>서비스 운영 형태</h3>
    <p>연구 스크립트를 제품 서버가 호출할 수 있는 API, 작업 상태, 저장 구조, Docker 실행 단위로 옮겼습니다.</p>
  </div>
</div>

## 책 페이지에서 답변까지

booxTory의 독서 AI 흐름은 크게 다섯 단계로 볼 수 있습니다. 먼저 책 페이지가 들어오면 OCR과 layout 분석으로 텍스트와 영역 정보를 추출합니다. 다음으로 페이지 단위 텍스트를 청크로 나누고, `user_id`, `book_id`, page metadata를 붙여 사용자별 벡터 저장소에 넣습니다. 사용자가 질문하면 vector search와 BM25 검색을 함께 사용해 관련 문맥을 찾고, 선택된 모델로 답변을 생성합니다. 생성된 답변과 질문은 별도의 채팅 메모리로 저장되어 이후 질문의 맥락으로 다시 활용됩니다.

이 구조의 장점은 제품 경계가 분명하다는 점입니다. 책 문서와 채팅 메모리는 모두 검색에 참여하지만 저장 공간은 분리됩니다. 따라서 사용자의 독서 자료와 대화 이력이 다른 사용자와 섞이지 않고, 책 단위 조회도 가능합니다.

## 제품 안에 들어간 기술

<div class="article-table-wrap">
  <table>
    <thead>
      <tr>
        <th>영역</th>
        <th>내가 만든 흐름</th>
        <th>제품에서의 의미</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>책 페이지 인식</td>
        <td>텍스트 영역 탐지, crop, OCR, layout 분석, PDF page rendering, annotated artifact 생성</td>
        <td>책 이미지를 AI가 읽고 후속 기능에 넘길 수 있는 입력으로 바꿉니다.</td>
      </tr>
      <tr>
        <td>개인화 RAG</td>
        <td>사용자별 문서 컬렉션, book/page metadata, vector retriever와 BM25 retriever 조합</td>
        <td>사용자의 책 자료를 기준으로 독서 질문에 답합니다.</td>
      </tr>
      <tr>
        <td>대화 메모리</td>
        <td>질문과 답변을 채팅 전용 컬렉션에 저장하고 유사 대화를 검색</td>
        <td>읽는 중간의 질문이 다음 질문의 맥락으로 이어집니다.</td>
      </tr>
      <tr>
        <td>학습 콘텐츠</td>
        <td>TTS, 퀴즈, 요약, 번역, 맞춤법, 추천 질문, 이미지 기반 문제 풀이 API</td>
        <td>책 내용을 이해하고 다시 활용하는 활동으로 확장합니다.</td>
      </tr>
      <tr>
        <td>추천 검색</td>
        <td>상황/환경/감정/행동 metadata와 embedding을 이용한 효과음/배경음악 후보 검색</td>
        <td>책 장면과 어울리는 청각적 경험을 붙일 수 있습니다.</td>
      </tr>
      <tr>
        <td>운영 계층</td>
        <td>FastAPI router, provider 선택, job status, WebSocket/SSE 알림, Docker 실행 환경</td>
        <td>모델 기능을 제품 서버가 반복적으로 호출할 수 있는 형태로 만듭니다.</td>
      </tr>
    </tbody>
  </table>
</div>

## 기술적으로 어려웠던 부분

가장 중요한 문제는 "검색이 잘 되는가"보다 "검색 경계가 제품 경계와 맞는가"였습니다. 독서 AI에서는 사용자별 자료가 섞이면 안 되고, 같은 사용자 안에서도 책과 페이지 단위가 유지되어야 합니다. 그래서 문서 저장과 채팅 메모리를 분리하고, 검색에는 필요한 순간에만 함께 참여시키는 구조를 택했습니다.

두 번째 문제는 OCR 이후의 형태였습니다. OCR은 문자열만 반환하면 끝나는 기능이 아닙니다. 페이지 안에서 어디에 있던 텍스트인지, 어떤 순서로 읽어야 하는지, 장면이나 효과음 추천과 어떻게 이어지는지가 중요했습니다. 이 때문에 detection, crop, layout, 후처리, 검수 가능한 이미지 산출물을 함께 다뤘습니다.

마지막으로 여러 AI 기능을 제품에서 호출 가능한 형태로 만드는 일이 필요했습니다. TTS, 퀴즈, 번역, 요약, 추천은 각각 다른 모델이나 외부 API를 사용할 수 있지만, 제품 입장에서는 일관된 요청 형식과 상태 확인, 저장 위치가 더 중요합니다. 이 부분을 API와 서비스 계층으로 묶은 것이 booxTory 개발에서 큰 비중을 차지했습니다.

## 결과

booxTory 작업을 통해 내가 보여줄 수 있는 역량은 RAG 하나를 만든 경험이 아니라, 독서 제품에 필요한 여러 AI 기능을 사용자 경험 안으로 배치한 경험입니다. 책 페이지를 읽고, 사용자별로 기억하고, 질문에 답하고, 음성과 퀴즈와 추천으로 이어지게 만드는 전체 흐름을 설계하고 구현했습니다.
