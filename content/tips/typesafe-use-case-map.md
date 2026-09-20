---
title: "TypeSafe Use Case Map: AI를 ‘답변기’보다 판단 라우터로 쓰는 법"
date: "2026-09-20T11:31:43"
description: "TypeSafe의 Use Case Map을 바탕으로, 자동화에 AI 판단을 넣을 때 어떤 문제부터 작게 모델링하고 어떻게 사람 검토 경로를 남길지 정리합니다."
author: "Sangmin Lee"
category: "dev-tip"
tags: ["typesafe", "decision-api", "ai-automation"]
repository: "TypeSafe AI / Jev"
sourceUrl: "https://docs.typesafe.ai/concepts/use-case-map"
license: "Commercial / terms apply"
status: "Early access"
platforms: ["macos-linux", "winos"]
draft: false
highlights:
  - "분류·탐지·점수·라우팅으로 문제를 잘게 나누기"
  - "확신도에 따라 자동 처리와 검토를 분기"
  - "질문과 임계값을 코드에서 함께 리뷰"
---

## 한 줄 요약

**TypeSafe의 Use Case Map은 ‘LLM에게 답을 쓰게 하는 일’보다, 입력 상태에 대해 작고 명확한 판단을 만들고 그 결과를 코드가 조합하는 자동화**를 위한 아이디어 목록이다. 공식 문서는 검색·검색 결과 정렬·지원 티켓 라우팅·안전성 검토·문서 추출·ML feature 생성처럼, 판단 형태별로 시작점을 제시한다.[Use Case Map](https://docs.typesafe.ai/concepts/use-case-map)

이 글은 특정 산업의 완성된 솔루션 목록으로 읽기보다, 내 제품의 오래된 규칙·취약한 parsing·사람이 반복하는 triage 중 어느 부분을 **명시적인 질문**으로 바꿀 수 있는지 찾는 체크리스트로 쓰는 편이 좋다.

## 먼저 찾을 문제: ‘자유 서술’이 아니라 결정 하나

TypeSafe 문서는 다음처럼 결과 모양이 분명한 작업을 구분한다.

- **Classification**: 정해진 범주 중 하나를 고른다. 예: 문의 부서, 위험 유형, 문서 유형
- **Detection**: 어떤 속성의 존재 확률을 구한다. 예: 긴급성, 스팸, 민감 정보, jailbreak
- **Scoring**: 정의된 순서의 rubric 위에서 위치를 매긴다. 예: 심각도, 적합성, 고객 불만
- **Routing**: 분류 결과가 다음 code path를 고른다. 예: 사람 검토, 모델 선택, 지원 queue
- **Retrieval / Ranking**: 자연어 조건과 맞는 후보를 찾거나 순서를 매긴다

이 분류는 [Use Case Map](https://docs.typesafe.ai/concepts/use-case-map)과 [Primitives 문서](https://docs.typesafe.ai/primitives)의 공통된 메시지다. “이 대화를 분석해서 최선의 조치를 내려 줘” 같은 큰 요청을 그대로 던지기보다, **한 질문에는 한 판단**을 넣고 결과 조합은 코드에 남긴다.

## 가장 작은 pilot: 지원 티켓 triage

처음에는 외부 행동을 바꾸지 않는 read-only 분류부터 시작하는 것이 안전하다. 예를 들어 support ticket 하나에 아래 세 질문을 붙일 수 있다.

```python
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

with TypeSafeClient() as client:
    response = client.system_one(
        state={"ticket": incoming_ticket},
        questions={
            "department": Choice(
                instructions="Which team should handle this ticket?",
                criteria={"billing": None, "technical": None, "other": None},
            ),
            "is_urgent": Noul(
                instructions="Does this ticket express time-sensitive urgency?",
            ),
            "frustration": Score(
                instructions="How frustrated does the customer appear?",
                criteria=["calm", "concerned", "very angry"],
            ),
        },
    )
```

이 형태는 공식 quick start와 Python SDK가 보여 주는 `state` + `questions` + typed answer 방식에 맞춘 축약 예시다.[Quick start](https://docs.typesafe.ai/introduction/quickstart) [Python SDK](https://github.com/typesafe-ai/typesafe-sdk-python)

여기서 `department`는 route 선택에, `is_urgent`는 escalation 조건에, `frustration`은 우선순위 계산에 쓸 수 있다. 중요한 점은 이 값들을 모델의 문장 답변에서 추출하지 않고, Choice·Noul·Score처럼 각기 다른 typed 결과로 받는다는 것이다.[Primitives](https://docs.typesafe.ai/primitives)

## 자동 처리와 사람 검토를 어떻게 가를까

Choice와 Score 응답에는 option 또는 level별 확률과 `confidence`가 포함될 수 있다. TypeSafe는 확률 분포가 한 결과에 집중될수록 confidence가 높고, 퍼질수록 낮다고 설명한다.[Confidence](https://docs.typesafe.ai/confidence)

그래서 첫 버전에서는 다음처럼 보수적으로 나누는 편이 낫다.

```python
answer = response.answers["department"]

if answer.confidence < 0.5:
    send_to_human_review(incoming_ticket)
elif answer.choice == "billing":
    queue_for_billing(incoming_ticket)
else:
    queue_for_general_support(incoming_ticket)
```

임계값은 제품 전체에 하나만 두는 숫자가 아니다. 공식 guidance도 행동의 결과가 큰 경우에는 더 높은 확신도와 추가 확인을 요구하고, 실제 데이터로 보정하라고 권한다.[Confidence](https://docs.typesafe.ai/confidence)

## Use Case Map을 실제 backlog로 바꾸는 질문

문서의 업종별 예시를 그대로 복제하지 말고, 다음 네 질문에 답해 보자.

1. **입력 state는 무엇인가?** 티켓, 문서, agent trace, 검색 후보, 정책처럼 판단에 필요한 정보를 하나의 읽기 전용 payload로 정한다.
2. **코드가 정말 알아야 하는 것은 무엇인가?** 생성문이 아니라 option, true/false 확률, 순서 있는 score, 혹은 후보 순위인가?
3. **오류가 났을 때 안전한 기본값은 무엇인가?** 보류·사람 검토·추가 정보 요청·기존 규칙 fallback 중 하나를 명시한다.
4. **무엇을 리뷰해야 하는가?** 질문 문구, criteria, score legend, confidence threshold는 prompt string에 숨기지 말고 버전 관리되는 한 파일에 둔다.

마지막 항목은 특히 중요하다. TypeSafe의 agent skill 문서도 사람이 검토할 핵심을 question과 threshold constant로 보고, 한 곳에 모으라고 안내한다.[Agent skill](https://docs.typesafe.ai/agent-skill)

## 시작 방법

공식 quick start는 Playground에서 text state와 질문을 시험한 뒤, dashboard에서 API key를 만들고 `POST https://api.typesafe.ai/v1/systemone`으로 호출하는 순서를 제시한다.[Quick start](https://docs.typesafe.ai/introduction/quickstart)

Python 환경에서는 Python 3.10 이상에서 다음 SDK 설치 경로가 제공된다.[Quick start](https://docs.typesafe.ai/introduction/quickstart)

```bash
uv add typesafe-sdk
# 또는
pip install typesafe-sdk
```

API key는 채팅이나 저장소에 넣지 말고 `TYPESAFE_API_KEY` 환경 변수로 주입한다. agent skill을 쓰고 싶다면 공식 문서의 `npx skills add typesafe-ai/skills --skill typesafe-ai` 설치 경로와, 질문·threshold를 함께 검토하는 workflow를 따른다.[Agent skill](https://docs.typesafe.ai/agent-skill)

## 도입 전에 확인할 점

- **이것은 early-access 상용 API다.** 공개 웹사이트는 Jev를 early access로 안내하며, public SDK와 skill이 있다고 해서 모델 서비스 자체가 오픈소스라는 뜻은 아니다.[TypeSafe AI](https://typesafe.ai/)
- **운영 데이터 전송은 별도 검토가 필요하다.** 개인정보·고객 대화·규제 데이터는 API 사용 조건과 보안·보존 정책을 조직의 DPA/보안 검토 기준으로 확인한 뒤 pilot에 넣어야 한다. TypeSafe의 사이트 이용은 별도 Terms of Use의 적용을 받는다.[Terms of Use](https://typesafe.ai/legal/terms)
- **confidence는 정답 보증이 아니다.** 먼저 오프라인 샘플과 인간의 판정을 비교하고, 낮은 확신도 또는 고위험 action은 사람에게 보낸 뒤 threshold를 조정하자.[Confidence](https://docs.typesafe.ai/confidence)

## 내 판단

Use Case Map의 가장 실용적인 부분은 ‘AI를 어디에 붙일까’가 아니라 **이미 코드에 흩어진 모호한 판단을 어떤 output shape로 고정할까**를 묻게 만든다는 점이다.

지원 분류, moderation 보조, search ranking처럼 결과를 사람이 확인하거나 기존 규칙과 함께 쓸 수 있는 업무부터 시작하면 좋다. 반대로 결제 승인·해지·법적 판정처럼 결과가 곧바로 비가역 행동이 되는 업무는, independent validation과 human review 경로 없이 automation target으로 삼지 않는 편이 낫다.

## 참고한 공개 자료

- [TypeSafe Use Case Map](https://docs.typesafe.ai/concepts/use-case-map)
- [TypeSafe Quick start](https://docs.typesafe.ai/introduction/quickstart)
- [TypeSafe Primitives](https://docs.typesafe.ai/primitives)
- [TypeSafe Confidence](https://docs.typesafe.ai/confidence)
- [TypeSafe Agent skill](https://docs.typesafe.ai/agent-skill)
- [TypeSafe Python SDK](https://github.com/typesafe-ai/typesafe-sdk-python)
- [TypeSafe Terms of Use](https://typesafe.ai/legal/terms)
