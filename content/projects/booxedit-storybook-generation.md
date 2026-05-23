---
title: "Booxedit - 생성형 동화책 제작 워크플로우"
projectName: "Booxedit"
tagline: "생성형 동화책 제작 워크플로우"
period: "ArtygenSpace / 2024.07 - 2025.07"
periodOrder: 20250703
description: "사용자 입력을 바탕으로 이야기, 페이지별 이미지, 음성 나레이션, PDF, 갤러리 이력을 생성하는 동화책 제작 시스템입니다."
metrics:
  - "Story Generation"
  - "Image Consistency"
  - "PDF/TTS Output"
stack:
  - "Python"
  - "Streamlit"
  - "FastAPI"
  - "OpenAI GPT"
  - "DALL-E"
  - "Imagen"
  - "SQLite"
  - "PDF"
details:
  - "Streamlit 기반 제작 화면에서 제목, 작가, 페이지 수, 주인공, 성격, 상황, 분위기, 시간 배경을 받아 동화책을 생성합니다."
  - "GPT로 페이지별 이야기를 만들고, 장면 설명과 이미지 프롬프트를 생성해 DALL-E/Imagen/Midjourney 계열 이미지 생성 흐름과 연결했습니다."
  - "페이지별 음성 나레이션, 이미지 저장, PDF 생성, SQLite 기반 갤러리/좋아요/조회수/다운로드 흐름을 하나의 앱으로 묶었습니다."
  - "첫 이미지의 seed와 스타일 가이드를 기준으로 나머지 페이지 이미지를 이어 생성하는 흐름을 구성했습니다."
order: 52
draft: false
---

<section class="project-lead-panel">
  <span class="project-kicker">Generation Workflow</span>
  <p><strong>Booxedit은 텍스트 생성 데모가 아니라, 한 권의 동화책을 만들기 위해 필요한 글, 이미지, 음성, PDF, 갤러리 이력을 연결한 창작 워크플로우입니다.</strong></p>
  <p>사용자는 책 제목과 주인공, 상황, 분위기만 입력하지만 시스템 내부에서는 이야기 생성, 장면 요약, 이미지 프롬프트 생성, TTS, PDF 조판, 로컬 저장, 갤러리 노출이 순서대로 실행됩니다.</p>
</section>

## 개요

Booxedit의 핵심은 "생성형 AI로 책 한 페이지를 만든다"가 아니라 "사용자가 다시 열람하고 공유할 수 있는 책 artifact를 만든다"입니다. 소스에서는 Streamlit 화면이 책 만들기와 갤러리 두 표면을 제공하고, SQLite가 책과 페이지 정보를 저장합니다. 책 만들기 화면은 제목, 작성자, 페이지 수, 주인공, 성별, 외모, 성격, 상황, 분위기, 시간 배경을 받습니다. 이후 GPT가 페이지별 이야기를 생성하고, 이미지 생성 함수가 각 페이지의 장면을 그리며, TTS가 음성 나레이션을 붙입니다.

생성 결과는 단순 preview로 사라지지 않습니다. 이미지는 `books/images`, 오디오는 `books/audio`, PDF는 `books/pdf`에 저장되고, DB에는 책 metadata와 페이지별 content/image/audio path가 남습니다. 갤러리 화면은 최신/인기 동화, 검색, 상세 보기, 페이지 넘김, 오디오 재생, PDF 다운로드, 좋아요와 조회수 흐름을 제공합니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>문제</strong>
    <p>생성형 AI 결과가 한 번 보고 끝나면 제품 경험이 되기 어렵습니다. 책처럼 저장되고 다시 읽혀야 합니다.</p>
  </div>
  <div class="project-fact">
    <strong>접근</strong>
    <p>입력 form, generation chain, 파일 저장, SQLite metadata, gallery UI를 하나의 제작 루프로 연결했습니다.</p>
  </div>
  <div class="project-fact">
    <strong>결과</strong>
    <p>이야기, 일러스트, 나레이션, PDF, 인기/최신 갤러리가 모두 이어지는 동화책 제작 앱이 되었습니다.</p>
  </div>
</div>

<figure class="project-diagram">
  <img src="/images/projects/booxedit-generation-loop.svg" alt="Booxedit storybook generation loop">
  <figcaption>Booxedit generation loop. 사용자의 책 설정은 이야기, 이미지, 음성, PDF, 갤러리 저장으로 이어집니다.</figcaption>
</figure>

## 사용자 경험

사용자 입장에서는 두 화면이 중요합니다. 첫 번째는 책 만들기입니다. 페이지 수는 2-10페이지 범위로 제한되고, 주인공과 분위기, 상황 설정을 입력하면 시스템이 페이지별 텍스트를 생성합니다. 이어서 각 페이지는 장면 설명으로 바뀌고, 이미지 생성 모델이 일러스트를 생성합니다. 페이지 내용은 TTS로 읽을 수 있고, 최종 결과는 PDF로 내려받을 수 있습니다.

두 번째는 갤러리입니다. 생성된 책은 최신 동화와 인기 동화 탭으로 나타나고, 사용자는 제목/작가 검색, 좋아요, 읽기, 페이지 이동, 오디오 재생, PDF 다운로드를 할 수 있습니다. 이 구조 덕분에 Booxedit은 prompt 실험이 아니라 사용자가 다시 방문할 수 있는 작은 콘텐츠 서비스가 됩니다.

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3>Story Form</h3>
    <p>제목, 작가, 페이지 수, 주인공, 성격, 상황, 분위기, 시간 배경을 받아 생성 조건을 구조화합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Page Writing</h3>
    <p>GPT 기반 프롬프트로 지정한 페이지 수만큼 이야기를 생성하고 부족한 페이지를 보정합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Scene Prompting</h3>
    <p>페이지 내용을 장면 설명으로 바꾸고, 스타일 가이드와 캐릭터 특징을 포함해 이미지 프롬프트를 만듭니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Image Model Choice</h3>
    <p>DALL-E, Imagen, Midjourney 계열 생성 경로를 분리해 페이지 이미지와 스타일 일관성을 실험했습니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>TTS Narration</h3>
    <p>페이지별 텍스트를 음성으로 만들고, 생성된 오디오를 로컬 파일과 페이지 metadata에 연결합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Book Artifact</h3>
    <p>이미지와 텍스트를 PDF로 조판하고, SQLite에 책/페이지/좋아요/조회수 정보를 저장합니다.</p>
  </div>
</div>

## 생성 흐름

Booxedit은 한 번에 모든 것을 생성하지 않습니다. 먼저 책 전체의 글을 만들고, 각 페이지마다 장면 설명을 만듭니다. 이미지 생성 API에서는 첫 번째 이미지를 생성하면서 generation id와 seed를 저장하고, 나머지 페이지는 같은 style object와 seed를 참고해 이어 생성합니다. 별도 page image API는 책 전체 요약, 페이지 요약, 페이지 본문을 함께 보고 이미지 프롬프트를 생성합니다. 즉 전체 책 맥락과 현재 페이지 내용이 동시에 이미지 프롬프트에 반영됩니다.

<div class="project-flow">
  <span>01 User brief</span>
  <span>02 Page story</span>
  <span>03 Scene prompt</span>
  <span>04 Image/TTS</span>
  <span>05 PDF gallery</span>
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
        <td>Streamlit app</td>
        <td>책 만들기 form, 갤러리 탭, 책 상세, 페이지 navigation, 오디오 재생, PDF 다운로드</td>
        <td>생성 결과를 사용자가 반복해서 볼 수 있는 앱 표면으로 만듭니다.</td>
      </tr>
      <tr>
        <td>Book database</td>
        <td>books, book_pages 테이블, likes, views, pdf_path, thumbnail, audio_url 저장</td>
        <td>AI 결과가 transient response가 아니라 관리 가능한 콘텐츠가 됩니다.</td>
      </tr>
      <tr>
        <td>Story generation</td>
        <td>페이지 수, 주인공, 성격, 상황, 분위기, 시간 배경을 prompt에 넣어 페이지별 이야기 생성</td>
        <td>사용자 입력을 구조화된 창작 brief로 바꿉니다.</td>
      </tr>
      <tr>
        <td>Image generation API</td>
        <td>첫 이미지 생성, generation id, seed, style guide, remaining pages generation</td>
        <td>연속 페이지의 시각 스타일을 유지하려는 생성 전략을 둡니다.</td>
      </tr>
      <tr>
        <td>Page analysis API</td>
        <td>전체 요약, 페이지 요약, 이미지 프롬프트, DALL-E/Imagen 선택</td>
        <td>책 전체 맥락과 현재 페이지를 함께 반영한 일러스트 후보를 만듭니다.</td>
      </tr>
      <tr>
        <td>Output packaging</td>
        <td>books/images, books/audio, books/pdf 저장과 PDF 생성</td>
        <td>생성 결과를 다운로드 가능한 책 artifact로 완성합니다.</td>
      </tr>
    </tbody>
  </table>
</div>

## 기여 내용

이 프로젝트는 창작 AI 제품에서 엔지니어가 어디까지 책임져야 하는지 잘 보여줍니다. 좋은 프롬프트만으로는 제품이 되지 않습니다. 입력 form, 모델 선택, 스타일 일관성, 실패 처리, 오디오와 이미지 저장, PDF 조판, DB schema, 갤러리 UX가 모두 있어야 사용자가 "책을 만들었다"고 느낍니다. Booxedit 작업은 모델 호출을 제품 workflow로 감싸는 경험이었습니다.
