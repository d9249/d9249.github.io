---
title: "AI 연구를 제품 가치로 연결하는 엔지니어 프로필"
date: "2026-05-25T15:34:35"
description: "RAG, 멀티 에이전트, 문서 OCR, 추천·그래프 연구 경험을 하나의 포트폴리오 구조로 압축한 AI Engineer & Researcher 요약입니다."
author: "Sangmin Lee"
category: "career-notes"
tags:
  - Career
  - AI Engineering
  - RAG
  - Document AI
  - Research
draft: false
---

AI 엔지니어로서의 방향은 비교적 분명하다. 연구에서 얻은 깊이를 실제 제품과 운영 가능한 시스템으로 연결하는 것이다. 모델을 구현하는 데서 끝나지 않고, 비즈니스 문제가 어떤 데이터 흐름과 AI 아키텍처로 풀려야 하는지 정의하고, 그 구조가 사용자 경험과 운영 안정성까지 이어지는지를 본다.

이 프로필의 중심축은 세 가지다. 첫째, **엔터프라이즈 RAG와 멀티 에이전트 시스템**을 실제 업무 흐름에 맞게 설계하는 것. 둘째, **문서 OCR과 표 구조 복원**처럼 모델 출력 이후의 구조화·검증 문제를 제품 수준으로 다루는 것. 셋째, 추천 시스템·그래프 신경망·의료 영상 연구에서 쌓은 연구 감각을 실무 판단의 근거로 사용하는 것이다.

## 한 문장 포지셔닝

**AI 연구의 언어를 제품·운영·비즈니스 가치의 언어로 번역하는 AI Engineer & Researcher.**

이 포지셔닝은 단순한 문장이 아니라 경험의 압축이다. CES 2025 수상 제품에서는 AI 엔진과 콘텐츠 생성·추천 흐름을 제품 경험으로 연결했고, AsianaIDT에서는 지식 관리, 안전관리 RAG, 시장 인텔리전스, 문서 OCR을 엔터프라이즈 업무 시스템으로 확장했다. 학술적으로는 추천 시스템과 의료 영상 AI를 중심으로 SCIE/KCI 논문과 Best Paper 성과를 쌓았다.

## 핵심 성과 요약

| 축 | 요약 | 포트폴리오에서 보여줄 증거 |
|---|---|---|
| Product AI | booxTory, arti, StoryMate, Booxedit 등 AI 콘텐츠 제품 개발 및 기술 리더십 | CES 2025 Innovation Awards, 제품 기획·AI 엔진 개발 경험 |
| Enterprise AI | 기업 지식 관리, 산업안전 RAG, 시장 인텔리전스, 문서 OCR을 업무 시스템으로 구현 | Graph + Vector RAG, LangGraph workflow, 비동기 문서 처리, 운영 콘솔 |
| Document Intelligence | OCR bbox와 선분 정보를 결합한 표 구조 복원, parser 기반 문서 재구성, 정량 벤치마크 구축 | TEDS/TEDS-S, Cell F1, CER, row/column accuracy 기반 평가 체계 |
| Multi-Agent Systems | RFP 기반 조사 계획, 병렬 agent 실행, synthesizer, 품질 평가 loop, Knowledge Base 동기화 | Planner/Researcher/Competitor/Tech/Synthesizer 역할 분리와 상태 관리 |
| Research | 추천 시스템 GCN 최적화, LightGCN 개선, 의료 영상 분류·분할 연구 | SCIE 3편, KCI 2편, 국제/국내 학술대회 발표, Best Paper |
| Modeling & Competition | 정형·비전·시계열·추천 문제 해결 경험 | HD현대 AI Challenge 4위, DACON 상위권 경험 |

## 실무 프로젝트는 네 개의 레이어로 읽힌다

### 1. Enterprise Knowledge AI

엔터프라이즈 지식 관리 시스템에서는 문서를 업로드하고, 데이터셋으로 만들고, Graph DB와 Vector DB를 함께 사용해 검색 가능한 지식으로 바꾸는 흐름을 다뤘다. 핵심은 RAG를 단일 검색 API로 보지 않는 것이다. 문서 저장소, ingestion, chunking, indexing, ACL, 검색 모드, agent workflow, observability가 함께 맞물려야 실제 기업 환경에서 사용할 수 있다.

이 경험은 포트폴리오에서 **“문서 기반 RAG 엔진”보다 “기업 지식 운영 플랫폼”**으로 설명하는 편이 적절하다. 사용자가 어떤 문서에 접근할 수 있는지, 어떤 검색 모드가 어떤 질문에 적합한지, 긴 문서 처리 병목을 어떻게 나눌지까지 포함하기 때문이다.

### 2. Document OCR & Table Reconstruction

문서 OCR 프로젝트의 핵심은 OCR API를 호출하는 것이 아니라, 결과를 업무에서 쓸 수 있는 문서 구조로 복원하는 것이다. 표는 특히 어렵다. 텍스트 좌표만으로는 행·열·병합 셀·헤더·본문 영역을 안정적으로 결정하기 어렵기 때문에, bbox, 선분, overlap, fallback assignment, body-first selection, post-fusion rescue 같은 규칙 기반 신호를 결합해야 한다.

평가 체계도 중요하다. 행 수와 열 수가 맞는지, 셀 텍스트가 맞는지, 전체 HTML table 구조가 얼마나 유사한지, TEDS/TEDS-S와 Cell F1을 함께 봐야 한다. 이 프로젝트는 모델 출력 이후의 **구조화·검증·운영 UX**가 문서 AI의 품질을 좌우한다는 점을 보여준다.

### 3. Market Intelligence Multi-Agent System

시장 인텔리전스 시스템은 RFP를 읽고 조사 계획을 만든 뒤, 시장·경쟁사·기술 agent가 병렬로 자료를 수집하고, synthesizer가 최종 보고서로 통합하는 구조다. 중요한 점은 “검색 결과를 LLM에 넣는 것”이 아니라, **조사의 질문 자체를 RFP별로 생성하고, agent별 역할과 저장 경로를 분리하는 것**이다.

이 구조는 기업용 생성형 AI 시스템에서 반복적으로 필요한 패턴이다. 입력 문서가 달라질 때마다 계획이 달라져야 하고, 여러 agent가 만든 중간 산출물과 최종 보고서는 서로 다른 수명주기와 검색 대상을 가져야 한다.

### 4. AI Product Leadership

ArtygenSpace에서는 AI 콘텐츠 제품 개발을 총괄하며 모델, 추천, 생성, 편집 자동화 기능을 실제 사용자 경험으로 묶었다. booxTory와 arti의 CES 2025 수상은 이 경험을 대표하는 외부 증거다. 이 레이어는 연구나 시스템 설계가 제품 기획, 사용자 경험, 사업 요구와 만났을 때 어떤 형태가 되는지를 보여준다.

## 연구 경험은 실무 판단의 기반이다

석사 과정과 논문 성과는 추천 시스템과 그래프 신경망을 중심으로 쌓였다. LightGCN embedding enhancement, weighted forwarding in GCN, 사용자 행동 시간 기반 데이터 분석은 모두 추천 품질을 높이기 위한 표현·전달·데이터 선택 문제를 다룬다. 의료 영상 쪽에서는 퇴행성 관절염 분류와 췌장 영역 분할을 통해 비전 모델의 실험 설계와 평가를 경험했다.

이 연구 경험은 실무에서 두 가지 방식으로 연결된다. 첫째, 모델 성능을 단일 숫자로 보지 않고 평가 지표와 데이터 조건을 함께 본다. 둘째, 그래프와 검색 구조를 단순 저장소가 아니라 관계·맥락·권한을 다루는 시스템 설계 문제로 바라본다.

## 사이트에서 확인하는 구조

이 프로필은 한 페이지에 모든 정보를 밀어 넣기보다, d9249.github.io 안에서 다음 구조로 확인하는 편이 좋다.

| 확인 위치 | 역할 | 읽는 방식 |
|---|---|---|
| [/](https://d9249.github.io/) | 전체 프로필 요약 | 핵심 성과, 경력 타임라인, 프로젝트·연구·수상으로 빠르게 이동 |
| [/projects/](https://d9249.github.io/projects/) | 실무 프로젝트 증거 | Enterprise RAG, Document OCR, Market Intelligence, 제품 AI 프로젝트를 개별 사례로 확인 |
| [/research/](https://d9249.github.io/research/) | 논문과 연구 기반 | 추천 시스템, GNN, 의료 영상 연구 성과를 논문 단위로 확인 |
| [/awards/](https://d9249.github.io/awards/) | 외부 인정 | CES, 장관상, Best Paper 등 검증 가능한 수상 이력 확인 |
| [/portfolio/](https://d9249.github.io/portfolio/) | 발표용 요약 | 면접·발표 상황에서 빠르게 넘겨볼 수 있는 슬라이드형 포트폴리오 |
| [/blog/](https://d9249.github.io/blog/) | 판단의 로그 | 기술 조사, 논문/도구 리뷰, 커리어 메모를 누적 기록으로 확인 |

## 정리

이 프로필은 “AI를 할 수 있다”가 아니라 **연구, 시스템 설계, 제품화, 운영 검증을 하나의 흐름으로 연결할 수 있다**는 점을 보여주는 쪽으로 정리하는 것이 맞다. 강점은 화려한 기술 목록이 아니라, 문제를 데이터와 아키텍처로 쪼개고, 다시 사용자가 확인 가능한 제품 경험으로 묶는 능력에 있다.

따라서 d9249.github.io에서의 표현도 같은 방향이 좋다. 홈에서는 압축된 정체성과 성과를 보여주고, 프로젝트 페이지에서는 실제 시스템 설계와 책임 범위를 보여주며, 연구·수상·블로그는 그 판단이 어디서 왔고 어떻게 검증되었는지를 보완하는 증거로 배치하면 된다.
