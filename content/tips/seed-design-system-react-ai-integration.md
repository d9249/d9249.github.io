---
title: "당근 SEED: 토큰·컴포넌트·AI 컨텍스트를 한 흐름으로 쓰는 법"
date: "2026-09-20T01:40:29"
description: "당근의 오픈소스 디자인 시스템 SEED를 React 프로젝트와 AI 에이전트 작업 흐름에 연결할 때 확인할 구조와 실전 도입 순서를 정리합니다."
author: "Sangmin Lee"
category: "dev-tip"
tags: ["design-system-react-ai"]
repository: "daangn/seed-design"
sourceUrl: "https://seed-design.io/"
license: "Apache-2.0"
status: "Open source"
platforms: ["macos-linux", "winos"]
draft: false
highlights:
  - "토큰부터 패턴까지"
  - "React와 Lynx 지원"
  - "AI 도구 통합"
---

## 한 줄 요약

**SEED**는 당근이 공개한 디자인 시스템이다.[1]

색상·타이포그래피·간격 같은 foundation, UI component, 반복 문제를 위한 pattern을 하나의 설계 언어로 묶고, React·Lynx 개발 경로와 AI 도구 연동까지 함께 문서화한다.[1][2]

## 왜 살펴볼 만한가

SEED를 도입할 때는 버튼만이 아니라 token·상태·접근성·조합 규칙까지 함께 점검하는 편이 낫다.[2] SEED의 공개 문서는 이를 다음 세 층으로 구분한다.[2]

- **Foundations**: 색상, 타이포그래피, 간격, 아이콘처럼 화면 전반에서 재사용할 결정 [2]
- **Components**: 버튼, 입력, 선택, navigation처럼 조립 가능한 UI 단위 [2]
- **Patterns**: component를 조합해 반복되는 제품 문제를 푸는 가이드 [2]

이 분리는 새 화면을 만들 때 “어떤 컴포넌트를 쓸까?”보다 먼저 **어떤 토큰과 상태 규칙을 공유해야 하는가**를 검토하게 한다.[2] 공개 저장소도 token build engine, style recipe engine, Figma variable extractor, PostCSS plugin 등 시스템을 유지하는 기반 도구를 별도 ecosystem으로 둔다.[5]

## 도입 전 확인할 것

- **디자인 결정의 원천 — Foundations / design token**: 색·간격·radius 값을 개별 화면에서 다시 정하고 있지 않은가?
- **재사용 단위 — Components**: component API가 상태와 접근성 요구를 표현하는가?
- **조합 규칙 — Patterns**: 목록·입력·empty state 같은 흐름을 팀마다 다르게 만들고 있지 않은가?
- **구현 경로 — React / Lynx 문서**: 현재 앱의 renderer와 build 도구에 맞는 경로가 있는가?
- **자동화 컨텍스트 — AI & Tools**: 에이전트가 임의 CSS 대신 시스템 문서를 참조하게 할 수 있는가?

SEED React 문서는 v2.0을 최신 경로로 안내하며, layout·typography·iconography와 component library, Stackflow block, CLI, migration을 나누어 제공한다.[3] 즉, 설치만 끝내는 라이브러리라기보다 **새 UI를 만들고 기존 UI를 옮기는 작업**까지 다루는 문서 구조다.[3]

React 문서는 Vite 등 번들러별 설치 경로도 별도 navigation으로 제공한다.[3]

## 빠르게 시작하는 순서

### 1. 화면 하나가 아니라 token 사용 지점부터 찾기

새 디자인 시스템을 얹을 때는 전체 화면을 한 번에 교체하기보다, 먼저 token 사용 지점을 수집하는 pilot을 권한다.[2]

- 하드코딩된 색상·spacing·font-size
- 같은 역할인데 서로 다른 button / input 구현
- loading, disabled, error, selected 상태가 화면마다 달라지는 부분

그 다음 SEED foundation에서 대응 token을 정하고, 작은 기능 영역 하나를 component 조합으로 전환한다.[2] token을 먼저 맞추면 이후 component 교체 범위를 더 정확히 예측할 수 있다.[2]

### 2. React에서는 layout과 UI component를 분리해 읽기

SEED의 React 문서는 `@seed-design/react`의 layout·typography 계층과 `seed-design/ui/...` component import를 함께 보여준다.[3] 예를 들어 화면 골격은 `VStack`, `HStack`, `Box` 같은 layout primitive로 표현하고, 상호작용 UI는 `ActionButton`, `TextField`, `BottomSheet` 같은 component로 연결한다.[3]

```tsx
import { VStack, Text } from "@seed-design/react";
import { ActionButton } from "seed-design/ui/action-button";

export function EmptyInbox() {
  return (
    <VStack gap="x4" align="center">
      <Text textStyle="t5Bold">받은 메시지가 없어요</Text>
      <ActionButton size="large" variant="brandSolid">
        새 글 작성
      </ActionButton>
    </VStack>
  );
}
```

이 코드는 SEED 문서의 API 이름과 조합 방식을 설명하기 위한 최소 예시다.[3] 실제 설치·theming·bundler 설정은 프로젝트 환경에 따라 달라지므로 React의 Installation과 Styling 문서를 기준으로 맞춘다.[3]

### 3. AI 에이전트에도 같은 설계 문맥을 공급하기

SEED는 AI 도구가 문서를 읽을 수 있도록 `llms.txt`를 제공하고, design-to-code 및 문서 접근을 위한 MCP를 안내한다.[4] 저장소에서 제공하는 `seed-design` skill은 다음 명령으로 추가할 수 있다.[3]

```bash
npx skills add https://github.com/daangn/seed-design --skill seed-design
```

여기서 핵심은 “AI가 UI를 만들어 준다”가 아니다.[4]

**프로젝트의 token·component·pattern 제약을 에이전트의 컨텍스트로 넣어, 임의의 CSS와 일회성 컴포넌트를 줄이는 것**이다.[2][4]

skill 또는 MCP를 연결했다면, 다음처럼 결과 기준을 명시하는 편이 안전하다.[4]

- “이 화면은 SEED component만으로 구성할 수 있는지 먼저 확인해 줘.”
- “새 token을 만들기 전 기존 foundation에 대응 값이 있는지 찾아 줘.”
- “컴포넌트의 disabled·error·loading 상태를 문서 기준으로 빠뜨리지 말아 줘.”

## 이런 팀에 잘 맞는다

- Figma와 코드에서 같은 디자인 결정을 공유해야 하는 제품 팀
- React 앱에서 토큰과 component API를 같이 정리하려는 팀
- 모바일 UI 흐름을 Stackflow 같은 activity 기반 구조와 함께 다루는 팀
- AI 코딩 도구가 프로젝트 고유의 UI 규칙을 참조하게 만들고 싶은 팀

SEED는 Apache-2.0으로 공개되어 상업적 사용, 수정, 배포가 가능하다.[2][5]

다만 저작권 고지와 라이선스 사본을 포함해야 하며, 당근 로고·브랜드 자산은 별도 가이드에 따른다.[2][5]

## 도입 판단

SEED의 장점은 component 수가 많다는 데만 있지 않다.[1][2]

**foundation → component → pattern → 개발 문서 → AI 컨텍스트**가 이어져 있어, 디자인 시스템을 단순 UI kit이 아니라 협업 규칙으로 운영하려는 팀에 맞는다.[1][2][4]

반대로 이미 다른 token 체계와 component 플랫폼을 깊게 쓰고 있다면, 전체 교체보다 간격·색·상태 규칙을 비교하는 작은 pilot부터 시작하는 편이 낫다.[2] 먼저 한 화면에서 token drift와 상태 누락이 실제로 줄어드는지 확인하고 확장하자.[2]

## 참고한 공개 자료

- [1] [SEED Design System](https://seed-design.io/)
- [2] [SEED Get Started](https://seed-design.io/get-started)
- [3] [SEED React 문서](https://seed-design.io/react)
- [4] [SEED AI & Tools 문서](https://seed-design.io/ai-integration)
- [5] [daangn/seed-design GitHub 저장소](https://github.com/daangn/seed-design)

Sources:
[1] https://seed-design.io — SEED Design System
[2] https://seed-design.io/get-started — SEED Get Started
[3] https://seed-design.io/react — SEED React documentation
[4] https://seed-design.io/ai-integration — SEED AI and tools documentation
[5] https://github.com/daangn/seed-design — SEED GitHub repository
