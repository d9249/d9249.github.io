---
title: "Effect 앱을 바이브 코딩하려면 프롬프트보다 저장소를 같이 넣어야 한다"
date: "2026-05-09T23:47:06"
description: "Michael Arnaldi의 'Vibe Engineering Effect Apps'는 코딩 에이전트가 낯선 라이브러리를 잘 쓰게 만드는 핵심이 더 긴 프롬프트가 아니라 해당 라이브러리의 실제 저장소와 패턴을 작업 컨텍스트에 함께 넣는 것이라고 주장한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Effect
  - Coding Agents
  - TypeScript
  - Agentic Coding
  - Vibe Coding
  - Open Source
  - Developer Tools
draft: false
---

코딩 에이전트가 특정 라이브러리를 이상하게 쓰는 장면은 이제 꽤 익숙하다. 문법은 맞는데 해당 생태계의 관용구를 어기고, 공식 문서는 읽은 것처럼 보이는데도 실제 코드베이스에서는 거의 쓰지 않는 패턴을 끌고 오는 식이다. 프롬프트를 더 길게 쓰거나 규칙 파일을 더 많이 붙여도 어느 순간 다시 흔들리는 이유도 여기에 있다.

`Vibe Engineering Effect Apps — Michael Arnaldi, Effectful`가 흥미로운 이유는 이 문제를 굉장히 실무적인 방식으로 뒤집기 때문이다. 핵심 주장은 단순하다. **에이전트가 Effect를 제대로 쓰게 만들고 싶다면 Effect에 대해 더 길게 설명하는 대신, 그냥 Effect 저장소 자체를 작업 컨텍스트에 같이 넣으라**는 것이다.

이 발표는 1시간 43분짜리 라이브 코딩 세션이지만, 내가 보기엔 단순 workshop 이상이다. Michael Arnaldi는 빈 저장소에서 Effect 기반 앱을 세팅하고, 테스트·TypeScript diagnostics·HTTP API·패턴 문서까지 순서대로 쌓아 올리면서, 에이전트 코딩의 성패가 결국 **얼마나 좋은 실행 맥락을 모델에 주느냐**에 달려 있다고 보여준다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/effect-solutions-homepage.png"
    alt="Effect Solutions 홈페이지"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    발표에서 직접 언급되는 <code>effect.solutions</code>는 Effect 프로젝트를 위한 prescriptive guide이자 agent-guided setup 진입점으로 소개된다.
  </figcaption>
</figure>

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/Wmp2Tku2PrI"
    title="Vibe Engineering Effect Apps — Michael Arnaldi, Effectful"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

이 영상은 AI Engineer 채널에 2026-05-07 업로드된 **`Vibe Engineering Effect Apps — Michael Arnaldi, Effectful`** 세션이다. 설명란 기준 발표의 framing은 꽤 명확하다. “코딩 에이전트가 라이브러리를 잘 쓰게 만드는 가장 좋은 방법은 더 나은 프롬프트가 아니라 라이브러리의 실제 코드를 주는 것”이라는 문제의식에서 출발한다.

영상은 세 가지 층을 동시에 다룬다.

- **Effect 자체의 개발 패턴**: 테스트, strict TypeScript 설정, shared HTTP API 같은 관용구
- **에이전트 사용법**: plan mode보다 spec 문서를 남기고 구현을 반복시키는 흐름
- **컨텍스트 설계**: 저장소, 패턴 파일, 규칙 파일, slash command 같은 재사용 가능한 지식층

즉 이 발표를 “Effect 데모”로만 보면 절반만 보는 셈이다. 더 정확히는 **특정 라이브러리의 로컬 코드와 패턴을 agent runtime의 일부로 편입하는 방법**을 보여주는 실험에 가깝다.

## 핵심 주장: 그냥 저장소를 같이 넣어라

발표의 가장 강한 문장은 초반 3분대에 나온다. Michael은 “이 세션의 제목은 사실 `just clone the repo`여야 한다”고 말한다. 그리고 13분대에 같은 메시지를 한 번 더 반복한다. **모델이 언어와 도구를 가리지 않고 좋아지게 만드는 가장 일관된 방법은, 결국 그 프로젝트의 저장소 자체를 함께 주는 것**이라는 주장이다.

이게 중요한 이유는 단순한 retrieval 문제가 아니기 때문이다. 그는 모델이 낯선 코드베이스에서 잘하는 일과 못하는 일을 구분한다. RL로 보강된 코딩 모델은 이미 **기존 코드베이스 패턴을 읽고 복제하는 일**에는 꽤 강하다. 반대로 프로젝트 바깥의 추상적인 문서 설명만으로 내부 관용구를 안정적으로 재현하는 일에는 훨씬 약하다.

그래서 이 발표의 문제 설정은 “어떻게 더 영리한 프롬프트를 쓸까”보다 “어떻게 하면 모델이 *실제 패턴이 있는 장소*에 닿게 할까”에 더 가깝다. Effect처럼 추상화가 많은 라이브러리일수록 이 차이는 더 커진다.

## 세션이 실제로 보여주는 작업 흐름

영상은 철학만 이야기하지 않고, 빈 저장소에서 바로 작업을 시작한다. 흐름을 압축하면 대략 다음과 같다.

| 단계 | 영상에서 보이는 작업 | 의미 |
|---|---|---|
| 1. 초기화 | 빈 프로젝트에서 소스/테스트 구조와 TypeScript 설정을 잡음 | 에이전트가 움직일 최소한의 규율을 먼저 만듦 |
| 2. 기본 엄격성 확보 | diagnostics, strict defaults, language service 같은 안전장치를 강조 | 자유로운 생성보다 나쁜 생성의 조기 차단을 우선시 |
| 3. companion context 추가 | `effect.solutions`와 Effect 저장소 접근을 함께 언급 | 문서보다 코드 패턴을 우선하는 컨텍스트 전략 |
| 4. 패턴 추출 | repo를 읽고 HTTP API, SQL, 테스트 관련 패턴 파일을 만들게 함 | 라이브러리 지식을 재사용 가능한 중간 산출물로 압축 |
| 5. 구현 반복 | spec을 남기고 구현시키며 context를 정리해 재시작 | 장시간 세션에서 context window를 운영하는 방식 제시 |
| 6. 장기 전략 논의 | rules, lint, slash command, fine-tuning 가능성까지 논의 | 일회성 프롬프트가 아니라 운영 체계로 확장 |

이 표가 보여주듯 중요한 것은 “AI가 코드를 대신 쳤다”가 아니다. 더 중요한 것은 **에이전트가 따라야 할 패턴을 발견하고, 그것을 문서와 규칙으로 재압축하고, 다시 다음 작업의 컨텍스트로 되먹이는 루프**다.

## 타임라인으로 보는 핵심 장면

### 00:03~00:13 — 발표의 테제 제시

3분대부터 Michael은 이 세션의 본질을 사실상 한 문장으로 요약한다. “just clone the repo”라는 말은 단순 농담이 아니라, 에이전트가 외부 라이브러리를 쓸 때 가장 먼저 확보해야 할 것은 설명 텍스트보다 **실제 구현과 실제 패턴**이라는 선언이다.

### 00:13~00:33 — 빈 프로젝트에서 시작해 기본 규율을 먼저 만든다

13분대 이후에는 완전히 빈 프로젝트에서 출발한다. 여기서 흥미로운 점은 기능 구현보다 먼저 소스 구조, 테스트, TypeScript 설정, diagnostics 같은 **실패 방지 장치**를 세팅한다는 것이다. “바이브 코딩”이라는 제목과 달리, 실제 내용은 꽤 규율 중심적이다.

### 00:33~00:34 — `effect.solutions`를 quick start가 아니라 agent entrypoint로 읽는다

33분대에서 그는 `effect.solutions`를 직접 언급하며, 이 사이트가 language service와 strict defaults를 포함한 빠른 시작점을 제공한다고 설명한다. 동시에 그 흐름도 결국 모델에게 Effect repo 접근을 주는 쪽으로 이어진다고 말한다.

핵심은 여기서도 같다. 문서 사이트는 useful하지만, **문서 사이트만으로는 충분하지 않다**는 것이다.

### 00:43~00:44 — plan mode보다 spec-driven development

43분대의 발언도 인상적이다. Michael은 plan mode를 선호하지 않는 이유를 “모델이 도구에 crippled access를 가지기 때문”이라고 설명한다. 대신 먼저 스펙을 함께 논의하고, 그 결과를 markdown 파일로 남긴 뒤, 구현 단계는 다시 루프를 돌리는 **spec-driven development**를 쓴다고 말한다.

이건 에이전트 코딩에서 꽤 현실적인 조언이다. 계획을 모델 머릿속에만 남겨 두지 않고 파일로 남기면, 컨텍스트가 리셋되어도 작업의 구조는 보존된다.

### 00:45~00:46 — shared HTTP API를 기본 패턴으로 고정

45분 후반에는 “이 저장소에서 가장 강한 기본 Effect 패턴은 shared HTTP API를 정의하는 것”이라는 정리가 나온다. 이후 OpenAPI를 derive하고 docs를 mount하는 흐름이 따라온다.

여기서 중요한 것은 에이전트가 임의 구현을 invent하지 않게 하고, **repo에서 강한 기본값을 하나 뽑아 그 방향으로 유도한다**는 점이다. 패턴 수를 늘리는 것보다 우선순위가 높은 패턴을 먼저 고정하는 편이 안정적이라는 메시지로 읽힌다.

### 01:02~01:03 — 패턴 문서화와 파인튜닝 가능성

후반부에는 아예 “Effect patterns를 기본으로 쓰는 오픈소스 모델을 fine-tune할 수 있지 않겠느냐”는 이야기까지 나온다. 즉 repo cloning, pattern file, lint/rule, slash command는 임시 우회책이 아니라, 장기적으로는 **모델 자체의 기본 습관을 바꾸는 학습 신호**로도 연결될 수 있다는 관점이다.

## 공개된 근거에서 확인되는 점

영상의 주장은 companion material과도 잘 맞는다.

첫째, **Effect Solutions** 홈페이지는 자신을 “idiomatic Effect programs”를 위한 high-level, prescriptive guide라고 소개한다. 실제 화면에서도 Quick Start, Project Setup, TypeScript Configuration, Services & Layers, Error Handling, Testing 같은 항목이 전면에 놓여 있다. 즉 이 생태계는 처음부터 “아무렇게나 써도 되는 라이브러리”보다 **좋은 기본 패턴을 강하게 제안하는 환경**에 가깝다.

둘째, **Effect-TS/effect** 저장소는 조회 시점 기준 약 **14.1k stars**, **565 forks**, 기본 브랜치 `main`, 최신 공개 릴리스 `@effect/workflow@0.18.1`을 보인다. GitHub languages API 기준으로도 거의 전부가 TypeScript다. 발표의 주장이 “작은 예제 폴더 하나만 참고하자”가 아니라 “실제 monorepo를 함께 읽히자”인 이유가 여기서 보인다. 학습해야 할 패턴의 양과 밀도가 크다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/effect-ts-github-repo.png"
    alt="Effect-TS effect GitHub 저장소"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    발표의 실질적 전제는 문서 설명보다 실제 monorepo 패턴을 에이전트 컨텍스트에 넣는 것이 더 강력하다는 점이다.
  </figcaption>
</figure>

셋째, 발표 중간에 나오는 패턴 파일 생성 흐름은 단순 메모가 아니다. transcript상 42분대 이후에는 Effect repo를 탐색해 패턴을 문서화하고, 45분대에는 shared HTTP API를 가장 강한 기본 패턴으로 요약하게 만든다. 즉 저장소 전체를 무작정 넣는 데서 멈추지 않고, **저장소 → 패턴 문서 → 다음 구현 지시**로 압축하는 중간 계층이 들어간다.

## 실무 관점에서의 해석

내가 보기엔 이 영상의 진짜 포인트는 “Effect를 AI로 만들 수 있다”가 아니다. 더 넓게 보면, **에이전트가 낯선 프레임워크를 다루는 방식 자체를 재설계**하자는 제안이다.

보통 팀은 라이브러리 사용 규칙이 흔들릴 때 다음 순서로 대응한다.

1. 시스템 프롬프트를 더 길게 쓴다.
2. 규칙 파일을 더 추가한다.
3. 예제 코드를 조금 붙인다.
4. 그래도 이상한 패턴이 나오면 금지 규칙을 더 늘린다.

Michael의 접근은 여기서 출발점이 다르다. 처음부터 **라이브러리의 실전 코드와 누적된 관용구를 모델이 읽을 수 있게 만드는 것**을 기본값으로 둔다. 그런 다음 그 안에서 HTTP API, 테스트, SQL, service/layer 같은 패턴을 뽑아 더 작은 재사용 단위로 만든다.

이 방식의 장점은 분명하다.

- 모델이 invent한 스타일보다 **실제 저장소의 스타일**을 따를 가능성이 높아진다.
- 규칙이 추상 명령이 아니라 **실제 코드 예시와 연결된 규율**이 된다.
- 컨텍스트 윈도우가 제한돼도 패턴 파일로 다시 압축할 수 있다.
- 장기적으로는 lint, slash command, fine-tuning 같은 운영 계층으로 확장할 수 있다.

반면 비용도 있다.

- 큰 저장소를 에이전트 컨텍스트에 넣는 것은 토큰·검색·도구 비용을 늘린다.
- 저장소 자체가 일관되지 않다면, 모델은 좋은 패턴뿐 아니라 나쁜 패턴도 함께 배운다.
- 결국 사람 쪽에서 “무엇이 strongest default pattern인가”를 한 번은 명시적으로 판단해야 한다.

그래도 최근 agentic coding 흐름을 생각하면 이 방향은 꽤 설득력 있다. 앞으로 차별점은 “더 말을 잘하는 모델”보다 **특정 코드베이스의 실제 습관을 더 정확히 복제하는 모델**에서 나올 가능성이 크기 때문이다.

## 한 줄로 요약하면

`Vibe Engineering Effect Apps`는 바이브 코딩을 감성의 문제로 다루지 않는다. 오히려 **코딩 에이전트가 프레임워크를 제대로 쓰게 만들려면, 프롬프트를 늘리는 대신 그 프레임워크의 실제 저장소와 패턴을 작업 컨텍스트에 편입해야 한다**는 아주 실무적인 운영 원칙을 제시한다.

Sources: https://youtu.be/Wmp2Tku2PrI, https://www.youtube.com/watch?v=Wmp2Tku2PrI, https://effect.solutions/, https://github.com/Effect-TS/effect, https://api.github.com/repos/Effect-TS/effect, https://api.github.com/repos/Effect-TS/effect/languages, https://api.github.com/repos/Effect-TS/effect/releases/latest