---
title: "Gemini API 출시 노트: 모델 이름보다 저장 설정과 종료 일정을 먼저 본다"
date: "2026-10-27T21:34:06"
description: "Gemini API의 공식 변경 이력을 운영 체크리스트로 읽는 방법. 새 프로젝트의 요청 저장 기본값, 모델 자동 전환과 종료, SDK·비용·데이터 정책을 함께 확인한다."
author: "Sangmin Lee"
repository: "Google AI for Developers / Gemini API Release notes"
sourceUrl: "https://ai.google.dev/gemini-api/docs/changelog"
status: "Official documentation / Cloud API"
license: "Docs: CC BY 4.0 / API: Google Terms"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Gemini API"
  - "Release Notes"
  - "API Migration"
  - "Data Privacy"
  - "Developer Tools"
highlights:
  - "출시 소식뿐 아니라 요청 저장 기본값, 모델 자동 전환, 종료 일정과 API 변경을 확인하는 공식 운영 참고 자료다."
  - "2026년 10월 26일부터 새 유료 프로젝트의 Generate Content API는 요청을 기본 저장하며, 기존 프로젝트는 설정을 유지한다."
  - "store=False, 프로젝트 로깅, 데이터셋 공유와 Contributor Tier를 구분해 데이터 정책을 점검한다."
  - "모델 이름만 바꾸지 말고 SDK·응답 구조·도구 호출·비용을 회귀 테스트한다."
draft: false
---

공식 Gemini API Release notes는 모델 출시뿐 아니라 **요청 저장, 모델 전환, 엔드포인트 종료** 변경을 날짜별로 모아 둔다.[1]

이 페이지는 설치하는 앱이나 오픈소스 라이브러리가 아니라 **클라우드 API의 공식 변경 이력**이다.[1] 아래 내용은 2026년 10월 27일 확인 기준이다. 사이트의 OS 분류는 문서를 읽고 API 클라이언트를 개발하는 환경을 뜻하며, Gemini를 해당 OS에서 로컬 실행한다는 의미는 아니다.

## 최근 변경에서 바로 확인할 것

| 공지일·변경 | 먼저 할 일 |
| --- | --- |
| 10/26 · 요청 저장 | 새 프로젝트의 로깅 기본값 확인 |
| 10/13 · Argon GA | 모델 이전 가이드 확인 |
| 10/8 · Flash 전환 | 자동 라우팅 후 동작 재검증 |
| 10/8 · Research 종료 공지 | 실제 종료일 확인·agent ID 교체 |

위 표는 전체 릴리스 목록이 아니라 운영에 영향을 주는 최근 항목을 추린 것이다.[1]
지원 중단 페이지는 **공지와 실제 종료를 구분**하고, 원칙적으로 가장 이른 종료 가능 날짜를 추적한다.[3]
종료되면 엔드포인트를 더 이상 사용할 수 없다.[3]

### 요청 저장: 새 프로젝트와 기존 프로젝트를 나눈다

10월 26일 공지는 **새 유료 프로젝트**에서 `generateContent`, `streamGenerateContent`, `batchGenerateContent` 요청이 기본적으로 저장된다고 명시한다.[1]
기존 프로젝트는 현재 설정을 유지하며, 세부 문서도 2026년 10월 26일 이후 생성된 프로젝트와 이전 프로젝트를 구분한다.[2]

요청별 `store=false`가 프로젝트 설정보다 우선한다.[2]
AI Studio의 Logs and Datasets 설정에서는 Generate Content와 Interactions의 로깅을 각각 조정할 수 있다.[2]
따라서 “유료 API이니 기본적으로 아무것도 저장하지 않을 것”이라고 가정하지 말고, 프로젝트 생성 시점과 실제 설정을 함께 확인하는 편이 안전하다.

### 모델 전환: ID를 고정해도 같은 모델이라는 보장은 없다

`gemini-3.7-flash` 요청은 `gemini-3.8-flash`로, `gemini-3.5-flash` 요청은 `gemini-3.6-flash`로 자동 라우팅된다고 공지되어 있다.[1]
지원 중단 표는 이 두 엔드포인트가 종료되는 것은 아니라고 구분한다.[3]

반면 `deep-research-pro-preview-12-2025`는 10월 23일 종료 대상으로 공지됐다.[1]
대체 ID는 `deep-research-preview-04-2026` 또는 `deep-research-max-preview-04-2026`이며, `interactions.create`의 **`agent`** 값을 바꾸는 흐름이다.[1]

## 처음 연결할 때: SDK와 저장 옵션을 같이 확인한다

공식 시작 가이드는 AI Studio에서 API 키를 만들고 환경 변수 `GEMINI_API_KEY`로 전달하는 방법과 Google Gen AI SDK 설치를 안내한다.[4]

```bash
pip install -U google-genai
```

현재 로깅 문서는 Generate Content에서 `store`를 지정하려면 Python `google-genai` **2.33.0 이상**, JavaScript `@google/genai` **2.31.0 이상**이 필요하다고 명시한다.[2]

아래는 공식 Generate Content 예시에서 요청 저장을 끄도록 바꾼 형태다.[2]
`GEMINI_API_KEY`가 환경에 설정되어 있어야 하며, 실제 호출에는 해당 프로젝트의 요금과 한도가 적용된다.[4][6]

```python
from google import genai

client = genai.Client()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents="Explain quantum entanglement briefly.",
    config={"store": False},
)

print(response.text)
```

Interactions API는 `config` 안이 아니라 `interactions.create(..., store=False)`로 지정한다.[2]
다만 저장을 끄면 자동으로 서버에 대화 이력을 저장·조회하는 흐름도 영향을 받으므로, `previous_interaction_id`에 기대는 서비스는 별도 검토가 필요하다.[2][4]
위 예시는 저장 옵션의 위치를 설명하며, 이 글에서 인증된 API 호출이나 응답 품질을 직접 시험한 것은 아니다.

## 저장, 학습 공유, 악용 모니터링은 별개다

**개발자용 로그와 악용 모니터링용 로그는 별개**이며, 유료 서비스 약관도 안전·정책 위반 탐지 등을 위한 제한적 로그 처리를 설명한다.[5][7]
따라서 `store=False`를 모든 서버 로그가 남지 않는다는 보장으로 읽으면 안 된다.

개발자 로그의 기본 최대 보존 기간은 55일이며, 프로젝트별로 7·14·28·55일 중 선택할 수 있다.[2]
데이터셋에 저장한 로그는 같은 만료 규칙을 따르지 않는다.[2]

데이터 공유 정책은 기본 유료 로그의 프롬프트·응답을 제품 개선에 쓰지 않는다고 설명하지만, **데이터셋 공유나 Contributor Tier 활성화는 별도 조건**이다.[7]
공유 데이터는 모델 개선·학습에 사용될 수 있고 사람이 검토할 수 있으므로, 개인·민감·기밀 정보를 넣지 말라고 안내한다.[7]
무료 서비스의 데이터 이용 조건과 지역별 예외도 약관에서 따로 확인해야 한다.[5]

## 모델 교체 전에 남길 작은 체크리스트

모델 ID를 교체하는 PR에는 다음 항목도 함께 남기는 편을 권한다.

- **현재 ID → 대체 ID와 적용일:** 자동 라우팅인지, 실제 종료인지 먼저 구분한다.[1][3]
- **API 종류와 SDK 버전:** Generate Content의 `config`와 Interactions의 `generation_config`·상태 관리 방식을 섞지 않는다.[2][4][9]
- **요청 파라미터:** Gemini 3.8 이전 가이드는 `thinking_budget` 대신 `thinking_level`을 쓰고, 폐기된 샘플링 파라미터 등을 정리하라고 안내한다.[9]
- **응답·도구 회귀 테스트:** 3.8 가이드도 함수 호출과 멀티턴 검증을 이전 항목으로 다루므로, 기존 사례로 JSON·스트리밍·도구 인자·실패 처리·이력을 다시 확인한다.[9]
- **요금과 데이터 조건:** Argon의 무료 티어 미제공, 명시적 캐시 미지원 등 모델별 차이를 확인하고, 프로모션 종료일·thinking 토큰·도구 비용도 검토한다.[6][8]

가격은 이 글의 고정 숫자를 복사하기보다 **적용 날짜와 요금 구간이 표시된 공식 가격표**에서 다시 확인하는 편이 낫다.[6] 실제 운영에서는 응답 품질만 아니라 요청당 토큰·지연 시간·오류율을 함께 비교해야 한다.

## 내 판단

Gemini API Release notes는 “새 모델이 나왔는가”를 보는 뉴스 페이지보다 **배포 전 변경 영향 점검표**로 쓸 때 유용하다. 특히 새 프로젝트를 만들거나, 오래된 모델 ID를 계속 쓰거나, 고객 데이터를 전송하는 서비스라면 저장 설정과 종료 표를 먼저 보는 편을 권한다.

문서의 일반 콘텐츠는 별도 표시가 없으면 CC BY 4.0, 코드 예시는 Apache 2.0으로 안내된다.[3]
실제 API 이용에는 Google API 약관과 Gemini API 추가 약관이 적용되므로, **문서 라이선스를 모델·서비스의 오픈소스 라이선스로 오해하면 안 된다.**[5]

## Sources

[1] https://ai.google.dev/gemini-api/docs/changelog — Gemini API release notes

[2] https://ai.google.dev/gemini-api/docs/logs-datasets

[3] https://ai.google.dev/gemini-api/docs/deprecations

[4] https://ai.google.dev/gemini-api/docs/quickstart

[5] https://ai.google.dev/gemini-api/terms

[6] https://ai.google.dev/gemini-api/docs/pricing

[7] https://ai.google.dev/gemini-api/docs/logs-policy

[8] https://ai.google.dev/gemini-api/docs/latest-model

[9] https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.8
