---
title: "arti - 생성형 스토리텔링 제품 개발"
projectName: "arti"
tagline: "생성형 스토리텔링 제품 개발"
period: "ArtygenSpace / 2024.07 - 2025.07"
periodOrder: 20250704
description: "CES 2025 Honoree를 받은 arti에서 사용자 입력을 이야기, 페이지 이미지, 음성 나레이션, PDF, 갤러리로 이어지는 생성형 동화책 제품 흐름으로 만든 경험입니다."
metrics:
  - "CES 2025 Honoree"
  - "Story/Image/TTS"
  - "PDF Gallery Workflow"
stack:
  - "Python"
  - "Streamlit"
  - "FastAPI"
  - "OpenAI"
  - "DALL-E"
  - "Imagen"
  - "SQLite"
  - "Kafka"
details:
  - "주인공, 분위기, 상황, 시간 배경을 받아 페이지별 이야기와 장면 프롬프트를 생성하는 흐름을 만들었습니다."
  - "페이지 이미지, 음성 나레이션, PDF, 갤러리, 좋아요/조회수/다운로드까지 창작 결과가 남는 구조로 연결했습니다."
  - "이미지 생성, TTS, 퀴즈, 번역, 배경음악, 효과음 기능을 제품 서버가 호출할 수 있는 API 계층으로 정리했습니다."
  - "긴 작업과 여러 모델 호출을 workflow, queue, 저장소 구조로 묶어 제품화 단계의 복잡도를 낮췄습니다."
order: 52
draft: false
---

<section class="project-lead-panel">
  <span class="project-kicker">arti</span>
  <p><strong>arti에서 맡은 일은 사용자의 간단한 설정을 한 권의 동화책으로 바꾸는 생성형 스토리텔링 흐름을 만드는 것이었습니다.</strong></p>
  <p>이야기 생성, 장면 이미지, 음성 나레이션, PDF 저장, 갤러리 관리, 모델 API 운영이 서로 끊어지지 않고 하나의 창작 경험으로 이어져야 했습니다.</p>
</section>

## 제품 개요

arti는 CES 2025 Honoree를 받은 ArtygenSpace의 생성형 스토리텔링 제품입니다. 사용자는 책 제목, 주인공, 성격, 상황, 분위기, 시간 배경처럼 창작에 필요한 정보를 입력합니다. 시스템은 이 입력을 페이지별 이야기로 만들고, 각 페이지를 장면 프롬프트로 바꾸고, 이미지와 음성 나레이션을 생성한 뒤 PDF와 갤러리로 남깁니다.

이 제품에서 중요한 점은 "이미지 한 장을 잘 만든다"가 아니라 "한 권의 책처럼 완성된다"입니다. 페이지가 여러 장이면 캐릭터와 분위기가 이어져야 하고, 텍스트와 이미지와 음성이 같은 페이지에 붙어야 하며, 사용자는 생성 결과를 다시 열람하고 다운로드할 수 있어야 합니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>제품 목표</strong>
    <p>짧은 사용자 입력을 글, 이미지, 음성, PDF가 포함된 동화책 결과물로 만드는 것입니다.</p>
  </div>
  <div class="project-fact">
    <strong>기술 문제</strong>
    <p>스토리, 장면 프롬프트, 이미지 스타일, 나레이션, 파일 저장, 갤러리 metadata가 같은 책 단위로 묶여야 했습니다.</p>
  </div>
  <div class="project-fact">
    <strong>기여 범위</strong>
    <p>생성 workflow, 이미지 모델 호출, TTS, PDF 조판, SQLite 저장, API 서비스 계층, 비동기 처리 흐름을 다뤘습니다.</p>
  </div>
</div>

<figure class="project-diagram">
  <img src="/images/projects/arti-product-loop.svg" alt="arti AI storytelling product loop">
  <figcaption>arti 제품 흐름. 사용자 설정은 이야기, 장면 이미지, 음성, PDF, 갤러리로 이어집니다.</figcaption>
</figure>

## 사용자가 만나는 경험

사용자는 먼저 책 만들기 화면에서 제목, 작성자, 페이지 수, 주인공, 외모, 성격, 상황, 분위기, 시간 배경을 입력합니다. 생성이 시작되면 시스템은 지정한 페이지 수에 맞춰 이야기를 만들고, 각 페이지의 핵심 장면을 이미지 프롬프트로 바꿉니다. 이후 페이지별 이미지와 음성 나레이션이 만들어지고, 최종 결과는 PDF로 저장됩니다.

두 번째 표면은 갤러리입니다. 생성한 책은 다시 볼 수 있어야 제품이 됩니다. 그래서 최신/인기 동화 목록, 검색, 상세 보기, 페이지 넘김, 오디오 재생, PDF 다운로드, 좋아요와 조회수 같은 흐름을 함께 구성했습니다.

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3>창작 입력</h3>
    <p>제목, 페이지 수, 주인공, 성격, 상황, 분위기, 시간 배경을 구조화된 생성 조건으로 받습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>페이지 이야기</h3>
    <p>사용자 입력을 바탕으로 지정한 페이지 수만큼 이야기를 만들고 부족한 페이지를 보정합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>장면 이미지</h3>
    <p>페이지 내용을 장면 설명으로 바꾸고, 스타일과 캐릭터 특징이 이어지도록 이미지 프롬프트를 구성합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>음성 나레이션</h3>
    <p>페이지별 텍스트를 음성으로 생성하고 오디오 파일을 책 페이지 metadata와 연결합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>PDF와 갤러리</h3>
    <p>텍스트, 이미지, 오디오, PDF, 좋아요, 조회수, 다운로드 정보를 책 단위로 저장합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>AI 서비스 계층</h3>
    <p>이미지, TTS, 퀴즈, 번역, 음악/효과음 기능을 제품 서버가 호출할 수 있는 API로 묶었습니다.</p>
  </div>
</div>

## 생성 흐름

arti의 생성 흐름은 한 번의 모델 호출로 끝나지 않습니다. 먼저 책 전체의 이야기를 만들고, 각 페이지에 맞는 장면 설명을 만듭니다. 첫 페이지의 이미지 생성 결과에서 스타일과 캐릭터 방향을 잡고, 이후 페이지는 같은 책처럼 보이도록 style guide와 장면 요약을 함께 사용합니다. 페이지 텍스트는 TTS로 변환되고, 이미지와 음성 파일은 책 metadata와 함께 저장됩니다.

이 구조는 사용자가 다시 볼 수 있는 결과물을 만드는 데 중요합니다. 생성형 AI 결과가 화면에서 사라지면 데모에 가깝지만, 이미지와 오디오와 PDF가 저장되고 갤러리에서 다시 열리면 콘텐츠 제품에 가까워집니다.

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
        <td>책 만들기 화면</td>
        <td>생성 조건 form, 페이지 수 선택, 주인공/상황/분위기 입력, 생성 실행</td>
        <td>사용자의 아이디어를 모델이 이해할 수 있는 창작 brief로 바꿉니다.</td>
      </tr>
      <tr>
        <td>스토리 생성</td>
        <td>페이지별 이야기 생성, 전체 요약, 페이지 요약, 장면 설명 생성</td>
        <td>한 권의 책 안에서 페이지들이 이어지는 서사를 만듭니다.</td>
      </tr>
      <tr>
        <td>이미지 생성</td>
        <td>DALL-E, Imagen, Midjourney 계열 생성 경로와 스타일 유지 전략</td>
        <td>각 페이지가 같은 책의 일러스트처럼 보이도록 합니다.</td>
      </tr>
      <tr>
        <td>음성/오디오</td>
        <td>페이지별 TTS, quiz TTS, 배경음악, 효과음, 노래 생성 기능 연결</td>
        <td>책을 읽는 경험을 듣는 경험으로 확장합니다.</td>
      </tr>
      <tr>
        <td>책 artifact</td>
        <td>이미지/오디오/PDF 파일 저장, 책/페이지 metadata, 좋아요와 조회수 관리</td>
        <td>생성 결과를 다시 열람하고 공유할 수 있는 콘텐츠로 남깁니다.</td>
      </tr>
      <tr>
        <td>모델 서비스</td>
        <td>Agent/Language/Voice API, LangGraph workflow, Kafka 처리, Docker 실행 환경</td>
        <td>여러 모델 기능을 제품 서버가 안정적으로 호출하게 합니다.</td>
      </tr>
    </tbody>
  </table>
</div>

## 기술적으로 어려웠던 부분

첫 번째 어려움은 결과물의 일관성이었습니다. 생성형 동화책은 각 페이지가 따로 잘 만들어지는 것보다, 전체가 같은 책으로 보이는지가 중요합니다. 그래서 전체 이야기 요약, 페이지 요약, 캐릭터 특징, 스타일 가이드를 함께 사용해 이미지 프롬프트를 구성했습니다.

두 번째는 생성 결과를 제품 데이터로 남기는 일이었습니다. 이미지, 음성, PDF는 서로 다른 파일이지만 사용자는 "한 권의 책"으로 경험합니다. 이를 위해 책 metadata와 페이지 metadata를 나누고, 각 페이지에 텍스트, 이미지, 오디오 경로를 연결했습니다. 갤러리에서는 이 구조를 바탕으로 최신/인기 목록, 상세 보기, 다운로드를 제공합니다.

세 번째는 모델 기능이 늘어날수록 운영 복잡도가 커지는 문제였습니다. OCR, 퀴즈, 번역, 배경음악, 효과음, TTS, 노래 생성은 각각 요청 형식과 실패 지점이 다릅니다. 이를 기능군별 API와 workflow, queue 처리로 묶어 제품에서 호출 가능한 형태로 정리했습니다.

## 결과

arti 작업을 통해 보여줄 수 있는 것은 생성형 AI를 제품 workflow로 감싸는 역량입니다. 글, 이미지, 음성, PDF, 갤러리가 하나의 사용자 경험으로 이어지도록 만들고, 그 뒤에서 여러 모델 기능을 안정적으로 호출할 수 있는 서비스 계층을 설계했습니다.
