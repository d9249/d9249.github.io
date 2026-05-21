---
title: "Google I/O 2026은 Gemini를 에이전트 시대의 풀스택 플랫폼으로 배치한다"
date: "2026-05-21T11:22:06"
description: "Google I/O 2026의 Sundar Pichai 키노트는 Gemini 3.5, Antigravity, Spark, Search agents, TPU 8을 하나의 agentic Gemini stack으로 묶어 제품·모델·인프라 전략을 재정의한다."
author: "Sangmin Lee"
category: "ai-business"
tags:
  - Google I/O
  - Gemini
  - Agentic AI
  - Product Strategy
  - AI Infrastructure
draft: false
---

Google I/O 2026의 Sundar Pichai 오프닝 키노트는 단순한 신제품 발표라기보다, Google이 AI 경쟁을 어디로 끌고 가려는지 보여 주는 전략 문서에 가깝다. 공식 제목은 **“Welcome to the agentic Gemini era”**다. 여기서 중요한 단어는 Gemini보다 오히려 *agentic*이다.

Google은 이번 발표에서 Gemini를 챗봇, 검색 보조, 이미지 생성 모델 중 하나로만 설명하지 않는다. Gemini 3.5 Flash, Gemini Omni, Antigravity 2.0, Gemini Spark, Search agents, TPU 8t/8i, SynthID, Flow, Docs Live, Gemini for Science까지 이어지는 계층을 한 번에 보여 준다. 메시지는 명확하다. Google은 모델 성능 경쟁을 **제품 표면, 에이전트 하네스, 인프라, 배포 채널을 모두 묶은 풀스택 경쟁**으로 바꾸려 한다.

이 글의 핵심 해석은 이렇다. Google I/O 2026은 “더 똑똑한 Gemini” 발표가 아니라, Gemini를 사용자가 매일 쓰는 Search·Workspace·Android·Chrome·Labs·Cloud 안에서 **24시간 실행되는 에이전트 운영 레이어**로 만들겠다는 선언에 가깝다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/google-io-2026-hero.webp"
    alt="Google I/O 2026 official hero image with colorful icons on a black background"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Google I/O 2026 키노트의 공식 hero image. 발표 전체의 중심 메시지는 Gemini가 독립 앱을 넘어 Google 제품군 전반의 agentic layer가 된다는 것이다. 출처: Google The Keyword.
  </figcaption>
</figure>

## 무엇을 해결하려는가

지금 AI 제품의 병목은 “대답을 생성할 수 있는가”에서 “사용자의 실제 일을 끝까지 처리할 수 있는가”로 이동하고 있다. 사용자는 더 이상 모델이 문장을 잘 쓰는지만 보지 않는다. 영상 속 필요한 구간을 찾아 주고, 문서를 음성으로 만들고, 이메일·캘린더·작업 목록을 묶어 하루 계획을 정리하고, 검색 결과를 동적 UI나 대시보드로 바꾸고, 장시간 백그라운드에서 도구를 호출하며 작업을 완료하기를 기대한다.

Google이 제시한 답은 제품별 AI 기능을 더하는 수준이 아니다. 공식 키노트는 AI 사용량 자체가 폭발적으로 커졌다는 수요 신호를 먼저 보여 준다. Google 표면 전체에서 처리되는 월간 토큰은 2024년 5월 9.7조 개, 2025년 I/O 시점 약 480조 개, 2026년 5월 3.2 quadrillion, 즉 약 3200조 개 이상으로 증가했다고 설명한다. 개발자와 기업 사용량도 같은 방향이다. 월간 850만 명 이상의 개발자가 Google 모델로 앱과 경험을 만들고, 모델 API는 분당 약 190억 토큰을 처리하며, 지난 12개월 동안 1조 토큰 이상을 처리한 Google Cloud 고객이 375곳을 넘는다고 말한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/google-io-2026-tokens-chart.webp"
    alt="Google I/O 2026 chart showing monthly tokens processed across Google surfaces growing from 9.7 trillion to over 3.2 quadrillion"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Google이 공개한 월간 토큰 처리량 추이. 9.7조에서 480조를 거쳐 약 3200조 개 이상으로 커졌다는 수치는 Gemini가 실험적 기능을 넘어 대규모 제품 운영의 기본 부하가 되었음을 보여 준다. 출처: Google The Keyword.
  </figcaption>
</figure>

이 수요는 두 가지 문제를 동시에 만든다. 첫째, 모델은 더 빠르고 저렴해야 한다. AI 기능이 Search, Gemini app, Workspace, Android, Chrome 안으로 들어가면 frontier model만을 고가로 호출하는 구조는 오래 버티기 어렵다. 둘째, 모델은 도구와 제품 권한을 안전하게 다루어야 한다. Search agent, Spark, Antigravity, MCP, Workspace integration은 단순 질의응답이 아니라 사용자의 계정, 파일, 브라우저, 일정, 외부 도구 위에서 행동하는 시스템이다.

따라서 Google이 해결하려는 문제는 “하나의 새로운 모델 출시”가 아니다. **수십억 사용자 규모에서 agentic workflow를 제품화할 수 있는 비용, 속도, 권한, 검증, UX의 결합 문제**다.

## 핵심 아이디어 / 구조 / 동작 방식

이번 발표를 하나의 stack으로 보면 여섯 층으로 나눌 수 있다.

| 층 | 발표에서 드러난 구성 | 실무적으로 읽는 법 |
|---|---|---|
| 수요 신호 | 월간 3.2 quadrillion+(약 3200조+) 토큰, 850만+ 월간 개발자, 190억 토큰/분 API 처리량 | AI 기능이 제품 실험이 아니라 대규모 운영 부하가 됨 |
| 인프라 | TPU 8t/8i, JAX·Pathways, 다중 사이트 학습, 100만+ TPU scale 언급 | agentic workload는 모델만이 아니라 훈련·추론용 전용 인프라 문제 |
| 모델 | Gemini 3.5 Flash, Gemini 3.5 Pro 예정, Gemini Omni Flash | 빠른 frontier action model과 multimodal generation model을 분리 배치 |
| 하네스 | Antigravity 2.0, agent-first development platform | 에이전트가 코드·도구·작업을 실행하는 orchestration layer |
| 개인/검색 에이전트 | Gemini Spark, Daily Brief, Search information agents, persistent dashboards | 소비자 제품 안에서 24시간 백그라운드 실행을 제품화 |
| 신뢰·출처 | SynthID, Content Credentials, Search·Chrome verification 확장 | 생성 콘텐츠가 많아질수록 provenance layer가 제품 인프라가 됨 |

이 구조에서 가장 중요한 것은 **모델과 하네스의 결합**이다. Gemini 3.5 Flash는 “frontier intelligence with action”으로 소개된다. 단순히 답변 품질을 높이는 모델이 아니라, coding, long-horizon tasks, real-world workflows에 맞춘 모델이라는 설명이 반복된다. Antigravity 2.0은 이 모델을 개발자 환경 안에서 쓰는 정도를 넘어, autonomous AI agents의 cohort를 개발·관리하는 독립 desktop application으로 확장된다.

Gemini Spark는 같은 철학을 소비자 제품으로 가져온다. Google은 Spark를 Gemini app 안의 personal AI agent로 설명한다. 사용자의 지시에 따라 디지털 생활을 탐색하고 행동하며, dedicated virtual machines on Google Cloud에서 24시간 실행되고, Gemini 3.5와 Antigravity harness로 long-horizon task를 백그라운드에서 수행한다. Google 도구부터 시작해, 이후 third-party tools를 MCP로 연결한다는 점도 중요하다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/google-io-2026-gemini-app-bento.webp"
    alt="Google Gemini app bento image showing Daily Brief, Neural Expressive, Gemini 3.5 Flash, Gemini Spark, Gemini Omni and Gemini on macOS"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Gemini app 업데이트의 공식 bento image. Daily Brief, Gemini Spark, Gemini Omni, macOS app, Gemini 3.5 Flash가 한 화면에 배치된다. Google은 Gemini app을 단순 챗봇보다 더 넓은 개인 agent surface로 확장하고 있다. 출처: Google The Keyword.
  </figcaption>
</figure>

인프라 쪽에서는 TPU 8이 agentic era를 위한 기반으로 배치된다. Google은 8세대 TPU를 학습용 TPU 8t와 추론용 TPU 8i의 이중 칩 접근으로 설명한다. TPU 8t는 대규모 pretraining에 최적화되어 이전 세대 대비 거의 세 배의 raw computing power를 제공한다고 하고, JAX와 Pathways를 통해 단일 대형 데이터센터의 한계를 넘어 여러 사이트에 학습을 분산할 수 있다고 말한다. TPU 8i는 추론용이며, reasoning model의 KV cache footprint와 latency를 염두에 둔 칩으로 소개된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/google-io-2026-tpu8.webp"
    alt="Google TPU 8 hardware image from official blog post about two chips for the agentic era"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    TPU 8 공식 이미지. Google은 TPU 8t를 대규모 학습용, TPU 8i를 추론용으로 나누고, agentic workload의 latency·KV cache·대규모 학습 요구를 별도 인프라 문제로 다룬다. 출처: Google The Keyword.
  </figcaption>
</figure>

즉 Google의 agentic Gemini stack은 “Gemini 모델 하나”가 아니라, **칩 → 모델 → 하네스 → 개인/검색/업무 제품 → 출처 검증**으로 이어지는 세로 통합 구조다.

## Gemini 3.5 Flash: 빠른 frontier model을 기본 실행 엔진으로 만든다

Gemini 3.5 Flash는 이번 발표에서 가장 중요한 모델 축이다. Google은 Gemini 3.5 Flash가 3.1 Pro 대비 거의 모든 benchmark에서 더 낫고, coding과 GDPVal에서 큰 개선을 보였다고 설명한다. 별도 Gemini 3.5 공식 글에서는 Terminal-Bench 2.1 76.2%, GDPval-AA 1656 Elo, MCP Atlas 83.6%, CharXiv Reasoning 84.2% 같은 수치를 제시한다.

다만 Google이 더 강조한 것은 raw benchmark보다 **intelligence와 output speed의 조합**이다. 공식 설명에 따르면 Gemini 3.5 Flash는 다른 frontier model 대비 output tokens per second 기준 네 배 빠르며, comparable frontier model의 절반 미만 가격으로 frontier-level capability를 제공한다고 한다. 기업들이 workload의 80%를 다른 frontier model에서 3.5 Flash로 옮기면 연간 10억 달러 이상을 절감할 수 있다는 가정도 제시됐다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/google-io-2026-gemini35-speed.webp"
    alt="Artificial Analysis Intelligence Index versus Output Speed chart with Gemini 3.5 Flash positioned in the high intelligence and high speed quadrant"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Gemini 3.5 Flash의 intelligence-speed positioning. Google은 3.5 Flash를 단순 경량 모델이 아니라, 높은 지능과 빠른 출력 속도를 함께 가진 agentic workload 기본 엔진으로 배치한다. 출처: Google The Keyword.
  </figcaption>
</figure>

이 대목은 AI 제품 팀에게 중요하다. 에이전트 제품에서는 “가장 똑똑한 모델을 가끔 호출하는 구조”만으로는 부족하다. 백그라운드 agent, search UI generation, daily digest, document creation, coding assistant는 반복 호출이 많고 latency에 민감하다. 따라서 Google의 전략은 Flash 계열을 대량 실행 가능한 기본 엔진으로 깔고, 더 무거운 Pro 계열이나 특수 모델을 필요할 때 쓰는 방향으로 읽힌다.

Google 내부 사용량도 같은 메시지를 뒷받침한다. 키노트는 Google 내부 AI developer tools에서 2026년 3월 하루 5천억 토큰을 처리했고, 이제 하루 3조 토큰 이상을 처리한다고 설명한다. 이 scale은 모델을 개선하는 feedback loop가 된다고도 말한다. 즉 Google은 Antigravity와 내부 개발 도구를 단순 dogfooding이 아니라 Gemini 3.5 개선의 대규모 사용 데이터 표면으로 보고 있다.

## Search와 Gemini app은 agent surface가 된다

이번 발표에서 Search는 검색 결과 페이지를 넘어선다. Google은 Search의 AI Overviews가 월간 active user 25억 명 이상, AI Mode가 1년 만에 월간 active user 10억 명 이상을 넘었다고 말한다. 그리고 2026년 I/O에서는 Search에 information agents와 agentic coding capability를 넣겠다고 발표했다.

Search information agents는 사용자가 설정하면 백그라운드에서 24시간 정보를 찾고, 적절한 순간에 행동을 돕는 personalized AI agent다. 또 Gemini 3.5 Flash와 Antigravity를 Search에 넣어, 사용자의 질문에 맞춘 dynamic layout, interactive visual, persistent dashboard나 tracker를 만들어 주는 방향도 제시됐다. 이건 검색 결과를 “문서 목록”으로 보는 관점에서, 검색을 “임시 미니 앱 생성기”로 보는 관점으로의 이동이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/google-io-2026-search-ai.webp"
    alt="Google Search AI official image saying the best of a search engine with the best of AI"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Google Search I/O 2026 업데이트의 공식 이미지. Search는 AI Overview와 AI Mode를 넘어, 정보 agent와 generative UI를 포함하는 agent surface로 확장된다. 출처: Google The Keyword.
  </figcaption>
</figure>

Gemini app도 비슷하다. 2025년 I/O 시점 4억 monthly active users였던 Gemini app은 2026년 9억 명 이상으로 늘었고, daily requests는 7배 이상 증가했다고 발표됐다. Google은 여기에 Daily Brief, Gemini Spark, Gemini Omni, macOS app, Neural Expressive design language를 얹는다.

여기서 Spark는 특히 상징적이다. “앱을 열고 묻는 assistant”에서 “클라우드 VM 위에서 계속 실행되는 agent”로 제품 정의가 바뀌기 때문이다. Android Halo에서 agent progress를 보여 주고, Chrome 안에서 agentic browser처럼 작동하며, email과 chat으로도 접근할 수 있게 하겠다는 계획은 Gemini가 특정 앱 UI를 넘어 운영체제와 브라우저의 상태 공간으로 들어간다는 뜻이다.

## 공개된 근거에서 확인되는 점

Google I/O 2026의 주요 수치와 제품 발표를 정리하면 다음과 같다. 여기서 대부분의 수치는 Google 공식 블로그와 연결된 The Keyword 글에서 제시한 값이므로, 독립 benchmark로 과장하기보다는 Google이 어떤 방향으로 제품과 인프라를 밀고 있는지 보여 주는 근거로 읽는 편이 안전하다.

| 영역 | 공개된 내용 | 해석 |
|---|---|---|
| 토큰 scale | 월간 9.7조 → 약 480조 → 3.2 quadrillion+(약 3200조+) 토큰 처리 | AI 기능이 Google 제품군의 상시 운영 부하가 됨 |
| 개발자·기업 사용 | 월간 850만+ 개발자, 모델 API 약 190억 토큰/분, 1조+ 토큰 처리 Cloud 고객 375곳+ | Gemini API와 Cloud usage가 consumer product만큼 중요한 성장 표면 |
| Search | AI Overviews 25억+ MAU, AI Mode 10억+ MAU | Search는 생성형 AI의 최대 배포 채널 중 하나로 작동 |
| Gemini app | 9억+ MAU, daily requests 7배+ 증가, Nano Banana 이미지 500억+ 생성 | Gemini app은 standalone assistant에서 creative·agentic hub로 확장 |
| Gemini 3.5 Flash | Terminal-Bench 2.1 76.2%, GDPval-AA 1656 Elo, MCP Atlas 83.6%, CharXiv Reasoning 84.2%, output speed 4배 claim | 빠르고 싼 frontier action model을 대규모 agent workload의 default로 만들려는 시도 |
| Antigravity 2.0 | autonomous AI agents cohort를 개발·관리하는 standalone desktop app | 코딩 보조 도구에서 agent orchestration platform으로 확장 |
| Gemini Spark | dedicated Google Cloud VM, 24/7, Antigravity harness, MCP third-party tools 예정 | 개인 agent를 로컬 앱이 아니라 cloud-run background worker로 제품화 |
| Search agents | 24/7 information agents, dynamic UI, persistent dashboard/tracker | 검색이 답변 생성에서 개인화된 task workspace 생성으로 이동 |
| SynthID·Content Credentials | 1000억+ 이미지·영상 watermark, 6만 년 분량 audio asset, OpenAI·Kakao·ElevenLabs 채택 발표 | 생성 콘텐츠 provenance가 AI 제품군의 공통 인프라가 됨 |

확인되는 제한도 있다. Gemini Spark는 trusted testers와 Google AI Ultra subscribers in the U.S. beta부터 시작한다. Search information agents와 persistent dashboard도 Google AI Pro/Ultra, 미국, 여름 또는 향후 몇 달 같은 단계적 출시 조건이 붙는다. Gemini Omni Flash의 API 제공도 “coming weeks”로 설명된다. 즉 이번 발표는 즉시 전 세계 모든 사용자가 쓸 수 있는 완성형 제품 묶음이라기보다, Google이 2026년 agentic product roadmap을 한꺼번에 공개한 성격이 강하다.

또한 Gemini 3.5 Flash의 benchmark와 비용 절감 예시는 공식 claim이다. 특히 “80% workload 이동 시 10억 달러 이상 절감” 같은 문장은 실제 조직의 workload mix, latency tolerance, tool calling pattern, 품질 기준에 크게 의존한다. 제품 팀은 이를 절대값으로 받아들이기보다, **빠른 중간 모델을 대량 agent workload에 섞어 비용 곡선을 낮추려는 전략적 방향**으로 읽어야 한다.

## 실무 관점에서의 해석

Google I/O 2026의 가장 큰 의미는 agentic AI가 더 이상 실험실 데모가 아니라, 대규모 consumer product와 enterprise platform의 공통 설계 원리가 되고 있다는 점이다. Search, Gemini app, Workspace, Android, Chrome, Flow, Science tooling이 모두 같은 방향으로 움직인다. 사용자가 질문하면 답을 주는 수준을 넘어, 사용자의 컨텍스트를 읽고, 백그라운드에서 실행하고, 결과를 product-native UI로 되돌려 주는 구조다.

이 구조에서 경쟁 우위는 모델 leaderboard 하나로 결정되지 않는다. Google은 세 가지 자산을 동시에 묶고 있다. 첫째, Search와 Android, Workspace, Chrome 같은 거대한 배포 표면이다. 둘째, TPU와 Cloud, Pathways, JAX, 내부 AI developer tools에서 오는 실행 scale이다. 셋째, Gemini 3.5·Omni·Antigravity·Spark·SynthID를 연결하는 product-system layer다. 다른 AI lab이 모델 성능으로 앞서더라도, Google은 “그 모델이 어디서 실행되고, 어떤 권한으로 행동하며, 어떤 UI에 결과를 놓는가”라는 제품화 문제에서 강한 위치를 가진다.

반대로 리스크도 분명하다. 개인 agent가 Gmail, Docs, Slides, Chrome, third-party MCP tools까지 연결되면 권한 경계와 failure recovery가 핵심 문제가 된다. Search가 generative UI와 persistent dashboard를 만들면, 사용자는 검색 결과의 출처와 생성된 인터페이스의 신뢰도를 구분해야 한다. Spark가 24시간 cloud VM에서 실행되면 비용, privacy, task cancellation, audit trail, human approval UX가 제품 품질의 일부가 된다.

따라서 실무 팀이 이 발표에서 배울 점은 “우리도 agent를 붙이자”가 아니다. 더 정확히는 다음 질문을 해야 한다.

| 질문 | 왜 중요한가 |
|---|---|
| 어떤 작업은 한 번의 답변이 아니라 background trajectory가 필요한가 | agentic product의 가치가 생기는 지점은 장시간 실행과 상태 유지에 있음 |
| 빠른 모델과 강한 모델을 어떻게 섞을 것인가 | 모든 작업을 최고가 frontier model로 처리하면 비용 곡선이 맞지 않음 |
| agent가 어떤 도구와 권한을 갖고, 어디서 실행되는가 | cloud VM, browser, workspace, MCP tool의 권한 경계가 제품 신뢰를 결정 |
| 사용자는 agent progress와 실패를 어떻게 볼 수 있는가 | Android Halo 같은 progress surface는 agent UX의 핵심 구성요소 |
| 생성 콘텐츠의 출처와 편집 이력을 어떻게 검증할 것인가 | SynthID와 Content Credentials는 생성형 AI 제품의 trust layer가 됨 |

결국 Google I/O 2026은 Gemini를 “하나의 AI 앱”이 아니라 **Google 생태계 전반의 실행 계층**으로 재배치한다. 이 방향이 성공하려면 모델 성능만으로는 충분하지 않다. 비용 효율적인 Flash 계열, 장기 실행을 관리하는 Antigravity harness, 사용자 권한 위에서 안전하게 행동하는 Spark, Search 안의 generative UI, 그리고 SynthID 같은 provenance layer가 함께 맞물려야 한다.

그런 의미에서 이번 I/O의 진짜 발표는 Gemini 3.5도, Spark도, TPU 8도 단독으로는 아니다. 진짜 발표는 Google이 AI 제품 경쟁을 **agentic full-stack competition**으로 정의했다는 점이다. 모델을 만들고, 칩을 만들고, 클라우드에서 실행하고, 검색과 운영체제와 업무 앱에 배포하며, 생성물의 출처까지 관리하는 회사만이 수십억 사용자 규모의 에이전트 시대를 열 수 있다는 주장이다.

Sources: https://blog.google/innovation-and-ai/sundar-pichai-io-2026/, https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-collection/, https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/, https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/, https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/eighth-generation-tpu-agentic-era/, https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni/, https://blog.google/products-and-platforms/products/search/search-io-2026/
