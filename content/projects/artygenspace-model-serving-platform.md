---
title: "ArtygenSpace Model Serving Platform - AI 기능을 운영 API로 묶기"
projectName: "ArtygenSpace Model Serving Platform"
tagline: "AI 기능을 운영 API로 묶기"
period: "ArtygenSpace / 2024.07 - 2025.07"
periodOrder: 20250704
description: "OCR, TTS, 번역, 퀴즈, 배경음악, 효과음, 노래 생성 기능을 Agent/Language/Voice API와 Kafka workflow, DB schema, Docker 배포로 묶은 모델 서빙 플랫폼 작업입니다."
metrics:
  - "Agent/Language/Voice API"
  - "Kafka Registry"
  - "LangGraph Workflow"
stack:
  - "Python"
  - "FastAPI"
  - "LangGraph"
  - "Kafka"
  - "Docker"
  - "MySQL"
  - "OpenAI"
  - "Google Vision"
details:
  - "Engine Service는 Agent, Language, Voice API prefix를 분리해 OCR, Sound, Quiz, Translation, Play, TTS, Song 기능을 통합 router로 제공합니다."
  - "LangGraph 기반 workflow로 OCR 전처리, 사운드 추천, 퀴즈 생성을 순차/병렬 조합으로 실행하도록 구성했습니다."
  - "Kafka utility는 service registry와 factory를 통해 서비스별 consumer/producer 중복을 줄이고 새 기능 등록을 단순화합니다."
  - "books, pages, contents schema는 OCR text, background, sound, content URL 같은 AI 처리 결과를 제품 데이터로 저장하는 형태입니다."
order: 55
draft: true
---

<section class="project-lead-panel">
  <span class="project-kicker">Model Serving</span>
  <p><strong>모델 서빙 플랫폼 작업의 핵심은 AI 기능을 각각의 실험 스크립트로 두지 않고, 제품이 호출할 수 있는 API, workflow, queue, schema로 묶는 것이었습니다.</strong></p>
  <p>OCR, 퀴즈, 번역, 배경음악, 효과음, TTS, 노래 생성은 서로 다른 모델과 외부 API를 사용하지만, 제품 입장에서는 안정적인 요청/응답, 인증, 비동기 처리, 저장 구조가 더 중요합니다.</p>
</section>

## 개요

ArtygenSpace 모델 서빙 작업은 AI 기능을 하나의 운영 경계로 묶는 프로젝트였습니다. Engine Service는 API를 Agent, Language, Voice 세 계층으로 나눕니다. Agent API는 OCR, Sound, Quiz, Translation, All, Play 같은 복합 workflow를 담당하고, Language API는 OCR, cover, quiz, background music, effect, song lyrics처럼 개별 기능을 제공합니다. Voice API는 TTS, 음성 추가, 배경음악 생성, 효과음 생성, quiz TTS, song 생성으로 나뉩니다.

기술적으로는 FastAPI router, LangGraph workflow, Kafka utility, Docker Compose, DB schema가 함께 움직입니다. 즉 모델 하나를 서빙하는 것이 아니라 여러 AI 기능이 제품의 책/페이지/콘텐츠 데이터와 이어지도록 API와 저장소 계약을 만든 것입니다.

<div class="project-fact-grid">
  <div class="project-fact">
    <strong>문제</strong>
    <p>AI 기능이 늘어날수록 endpoint, queue, 요청 모델, 저장 결과가 흩어져 운영 복잡도가 커집니다.</p>
  </div>
  <div class="project-fact">
    <strong>접근</strong>
    <p>Agent/Language/Voice API와 Kafka service registry를 두어 기능군별 경계와 실행 방식을 정리했습니다.</p>
  </div>
  <div class="project-fact">
    <strong>결과</strong>
    <p>OCR부터 TTS와 사운드 추천까지 제품 서버가 호출할 수 있는 통합 AI service layer가 되었습니다.</p>
  </div>
</div>

<figure class="project-diagram">
  <img src="/images/projects/artygenspace-model-serving-topology.svg" alt="ArtygenSpace model serving platform topology">
  <figcaption>Model serving topology. 제품 API는 Agent/Language/Voice 경계로 들어오고, workflow와 Kafka registry를 통해 개별 AI 서비스를 호출합니다.</figcaption>
</figure>

## 주요 기능

이 플랫폼의 표면은 세 계층입니다. Agent API는 여러 단계가 필요한 복합 작업을 다룹니다. 예를 들어 All workflow는 OCR 전처리를 먼저 실행하고, 그 결과를 사운드 추천과 퀴즈 생성에 넘겨 병렬 처리한 뒤 최종 결과를 합칩니다. Language API는 OCR, cover 분석, quiz, background music, effect, song lyrics 같은 단일 기능을 제공합니다. Voice API는 TTS, voice cloning, BGM/effect creation, quiz TTS, song generation 같은 음성/오디오 작업을 담당합니다.

<div class="project-feature-grid">
  <div class="project-feature-card">
    <h3>Agent API</h3>
    <p>OCR, Sound, Quiz, Translation, All, Play 같은 다단계 AI workflow를 제품 요청 단위로 제공합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Language API</h3>
    <p>OCR, cover, quiz, background music, effect, song lyrics 기능을 인증된 FastAPI endpoint로 노출합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Voice API</h3>
    <p>TTS, voice add, BGM/effect generation, quiz TTS, song 생성 기능을 음성 처리 계층으로 분리합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>LangGraph Workflow</h3>
    <p>OCR 전처리 후 Sound와 Quiz를 병렬 처리하고 결과를 합치는 식으로 복합 AI 흐름을 구성합니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Kafka Registry</h3>
    <p>서비스 타입, processor function, request model을 등록해 consumer/producer 중복을 줄입니다.</p>
  </div>
  <div class="project-feature-card">
    <h3>Product Schema</h3>
    <p>book, page, content 테이블에 OCR text, background, URL, sound, position, similarity를 저장합니다.</p>
  </div>
</div>

## 기술 구현

FastAPI 라우터는 `Agent`, `Language`, `Voice` 세 router를 통합 router에 include합니다. 각 router는 prefix를 통해 경계를 분리하고, 기능별 request/response model을 둡니다. Language API는 `ACCESS_TOKEN` header 기반 인증을 사용하고, OpenAI health check처럼 외부 모델 provider 상태를 점검하는 endpoint도 제공합니다.

Kafka utility는 운영 코드의 반복을 줄이는 쪽에 초점이 있습니다. 기존에는 각 서비스 파일마다 consumer와 producer를 직접 만들고, 메시지 파싱, 처리, 응답 전송, 에러 응답을 반복해야 했습니다. registry 구조에서는 service type, processor function, request model을 등록하고 factory가 KafkaService를 만듭니다. 새 기능을 넣을 때 서비스 파일은 비즈니스 로직에 집중하고, 메시징 코드는 공통 유틸리티가 담당합니다.

<div class="project-flow">
  <span>01 API request</span>
  <span>02 Router layer</span>
  <span>03 Workflow/queue</span>
  <span>04 Model service</span>
  <span>05 Product data</span>
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
        <td>Integrated router</td>
        <td>Agent, Language, Voice router를 `/agent/v1`, `/language/v1`, `/voice/v1` prefix로 등록</td>
        <td>기능군별 API 경계를 명확하게 나눕니다.</td>
      </tr>
      <tr>
        <td>Language API</td>
        <td>cover, quiz, OCR, OCR detail/orientation, songLyrics, backgroundMusic, effect endpoint</td>
        <td>단일 AI 기능을 제품 서버가 직접 호출할 수 있는 endpoint로 제공합니다.</td>
      </tr>
      <tr>
        <td>Agent workflow</td>
        <td>orthography 결과를 Sound와 Quiz 입력으로 변환하고 병렬 처리 후 최종 결과 통합</td>
        <td>여러 AI 기능을 하나의 사용자 작업으로 묶습니다.</td>
      </tr>
      <tr>
        <td>Kafka utility</td>
        <td>KafkaService, factory, config manager, service registry, request model registration</td>
        <td>비동기 메시징 중복을 줄이고 새 AI 기능 추가 비용을 낮춥니다.</td>
      </tr>
      <tr>
        <td>Data schema</td>
        <td>books, pages, contents 테이블과 OCR text, background, effect, content URL, similarity 필드</td>
        <td>AI 처리 결과를 책/페이지/콘텐츠 제품 데이터로 저장합니다.</td>
      </tr>
      <tr>
        <td>Deployment boundary</td>
        <td>Dockerfile, Docker Compose, service health, required provider key checks</td>
        <td>연구 기능을 실행 가능한 서비스 단위로 포장합니다.</td>
      </tr>
    </tbody>
  </table>
</div>

## 기여 내용

이 프로젝트는 AI 엔지니어링의 운영 감각을 보여줍니다. 모델 기능을 많이 만드는 것만으로는 충분하지 않습니다. 각 기능이 어떤 API prefix에 속하는지, 어떤 request model을 받는지, 긴 작업은 queue로 어떻게 처리하는지, 결과가 어떤 테이블과 URL에 남는지, 실패를 어떤 응답으로 돌려줄지까지 결정해야 제품이 됩니다. ArtygenSpace의 모델 서빙 작업은 이 제품 운영 경계를 만든 경험입니다.
