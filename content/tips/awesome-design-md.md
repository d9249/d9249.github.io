---
title: "getdesign.md는 AI 코딩 에이전트에게 먹일 DESIGN.md를 바로 고를 수 있는 웹 디자인 레퍼런스 카탈로그다"
date: "2026-05-11T08:10:40"
description: "getdesign.md와 VoltAgent/awesome-design-md는 실제 웹사이트의 시각 언어를 DESIGN.md로 정리해, Claude·Cursor·Gemini 같은 AI 코딩 에이전트가 더 일관된 UI를 만들도록 참고시킬 수 있는 디자인 문서 컬렉션이다."
author: "Sangmin Lee"
repository: "VoltAgent/awesome-design-md"
sourceUrl: "https://getdesign.md/"
status: "Open source catalog / hosted service"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Design Systems"
  - "UI"
  - "Prompting"
  - "Markdown"
highlights:
  - "getdesign.md는 Claude, Vercel, Stripe, Cursor, Raycast, Supabase, VoltAgent 같은 실제 웹사이트 스타일을 `DESIGN.md` 형태로 둘러보고 가져오는 웹 카탈로그다."
  - "공개 컬렉션의 원천은 MIT 라이선스의 `VoltAgent/awesome-design-md` 저장소이며, 조사 시점에는 `design-md` 아래 71개 사이트 폴더가 확인됐다."
  - "사용법은 원하는 페이지의 `DESIGN.md`를 프로젝트 루트에 두고, Claude·Cursor·Gemini 같은 AI 코딩 에이전트에게 그 디자인 언어를 따르라고 지시하는 식이다."
  - "Google의 `DESIGN.md` 사양과 `@google/design.md` CLI는 별도 프로젝트다. 카탈로그 문서를 가져온 뒤 lint·diff·export로 검증하는 흐름까지 연결하면 더 안전하다."
  - "개별 브랜드의 공식 디자인 시스템이 아니라 공개 웹사이트에서 추출·해석한 참고 문서이므로, 상표·브랜드 모방 리스크와 에이전트 컨텍스트 오염 가능성은 별도로 점검해야 한다."
draft: false
---

AI 코딩 에이전트에게 “Vercel처럼 깔끔하게”, “Stripe 느낌으로”, “Cursor 스타일로”라고 말하면 어느 정도 분위기는 따라오지만, 결과는 자주 흔들린다. 모델이 브랜드의 색, 간격, 타입 스케일, 카드 밀도, 버튼 반경 같은 세부 규칙을 즉석에서 추측하기 때문이다.

`getdesign.md`는 이 문제를 `DESIGN.md` 파일로 풀어보려는 웹 카탈로그다. 사이트에서 원하는 레퍼런스 브랜드를 고르고, 해당 `DESIGN.md`를 프로젝트에 넣은 다음, 에이전트에게 그 문서를 기준으로 UI를 만들라고 지시하는 흐름이다.

공개 컬렉션의 원천은 `VoltAgent/awesome-design-md` 저장소다. README는 “실제 웹사이트에서 추출한 DESIGN.md 파일 모음”이라고 설명하고, 사이트는 이를 브라우저에서 검색·미리보기·요청할 수 있는 형태로 보여준다. `AGENTS.md`가 코딩 에이전트에게 “어떻게 빌드할지”를 알려준다면, `DESIGN.md`는 “어떻게 보이고 느껴져야 하는지”를 알려주는 보조 컨텍스트 파일에 가깝다.

![getdesign.md 소개 이미지](/images/tips/awesome-design-md-og.png)

## getdesign.md 개요

`getdesign.md`의 홈페이지는 스스로를 “AI coding agents를 위한 DESIGN.md collection”이라고 소개한다. `/design-md` 페이지에서는 “real websites” 기반의 디자인 시스템 영감을 고르는 흐름을 제공하고, Lovable·Bolt 같은 AI 웹 빌더부터 Claude·Cursor·Gemini 같은 코딩 에이전트까지 폭넓게 쓸 수 있다고 안내한다.

조사 시점의 공개 저장소 기준으로는 `design-md` 아래 71개의 사이트 폴더가 확인됐다. 각 폴더는 대체로 다음처럼 `DESIGN.md`와 설명용 `README.md`를 가진다.

```text
design-md/
  stripe/
    DESIGN.md
    README.md
  vercel/
    DESIGN.md
    README.md
  claude/
    DESIGN.md
    README.md
```

README의 컬렉션 목록은 AI/LLM 플랫폼, 개발자 도구, 백엔드·DevOps, 생산성 SaaS, 디자인·크리에이티브 툴, 핀테크, 이커머스, 미디어, 자동차 등으로 나뉜다. 예를 들어 AI 쪽에는 Claude, Cohere, ElevenLabs, Mistral AI, Ollama, Replicate, Together AI, xAI가 있고, 개발자 도구 쪽에는 Cursor, Expo, Lovable, Raycast, Superhuman, Vercel, Warp가 있다.

## DESIGN.md가 담는 정보

각 `DESIGN.md`는 단순한 컬러 목록보다 훨씬 구체적이다. Vercel 예시는 흰 캔버스, Geist 계열 타이포그래피, shadow-as-border 패턴, 워크플로별 액센트 색상을 설명한다. Claude 예시는 크림색 캔버스, 따뜻한 코럴 CTA, 세리프 계열 디스플레이 헤드라인을 정리한다. VoltAgent 예시는 거의 검은 배경, 에메랄드 액센트, 터미널/IDE 느낌의 개발자 브랜드 언어를 문서화한다.

좋은 `DESIGN.md`는 보통 다음 정보를 함께 담는다.

- 시각적 분위기와 브랜드 톤
- 색상 팔레트와 역할
- 타이포그래피 규칙
- 버튼, 카드, 입력창, 내비게이션 같은 컴포넌트 스타일
- 레이아웃 원칙과 간격 체계
- 그림자, 표면, elevation 규칙
- 해야 할 것과 피해야 할 것
- 반응형 동작
- 에이전트에게 바로 넣을 수 있는 프롬프트 힌트

이 정도로 써두면 에이전트에게 “예쁘게”라고 말하는 대신 “이 색상 역할, 이 폰트 스케일, 이 카드 규칙을 지켜라”라고 말할 수 있다. 특히 랜딩 페이지, 대시보드, 문서 사이트, 제품 소개 페이지처럼 브랜드 분위기가 중요한 UI 작업에서 효과가 크다.

## 사용법

가장 단순한 사용법은 공식 README의 흐름 그대로다.

```bash
# 1. 원하는 사이트 폴더에서 DESIGN.md를 고른다.
# 예: design-md/vercel/DESIGN.md

# 2. 내 프로젝트 루트로 복사한다.
cp design-md/vercel/DESIGN.md ./DESIGN.md

# 3. AI 코딩 에이전트에게 이 파일을 참고하라고 지시한다.
# 예: "DESIGN.md를 기준으로 pricing page를 만들어줘."
```

웹에서 쓸 때는 `getdesign.md/<site>/design-md` 페이지를 열어 내용을 보고 복사하는 흐름이 자연스럽다. 로컬에서 여러 문서를 비교하고 싶다면 저장소를 clone해서 필요한 파일만 가져오면 된다.

```bash
git clone https://github.com/VoltAgent/awesome-design-md.git
```

이 저장소 자체에는 실행형 앱이나 별도 바이너리가 없다. 따라서 “설치해서 쓰는 도구”라기보다 “에이전트에게 먹일 디자인 컨텍스트 라이브러리”로 보는 것이 맞다.

## Google DESIGN.md 사양과의 관계

`DESIGN.md`라는 파일 형식 자체는 Google의 `google-labs-code/design.md` 프로젝트가 공개한 사양이다. 해당 저장소는 Apache-2.0 라이선스이고, npm에는 `@google/design.md` CLI가 올라와 있다. 조사 시점의 npm 최신 버전은 `0.1.1`이었다.

카탈로그에서 가져온 문서를 실제 프로젝트에 넣는다면, 가능하면 Google CLI로 구조와 대비를 한 번 검증하는 편이 좋다.

```bash
# 구조, 토큰 참조, WCAG 대비 관련 finding 확인
npx -y @google/design.md lint DESIGN.md

# 두 버전의 디자인 문서 차이 비교
npx -y @google/design.md diff DESIGN.md DESIGN-v2.md

# Tailwind 또는 DTCG 토큰으로 내보내기
npx -y @google/design.md export --format tailwind DESIGN.md > tailwind.theme.json
npx -y @google/design.md export --format dtcg DESIGN.md > tokens.json
```

즉, `getdesign.md`와 `awesome-design-md`는 “참고할 만한 DESIGN.md 샘플 모음”이고, Google의 `design.md` 저장소와 CLI는 “그 파일 형식의 사양과 검증 도구”에 가깝다. 둘을 섞어 쓰면 빠른 레퍼런스 확보와 최소한의 구조 검증을 함께 가져갈 수 있다.

## 활용 포인트

첫째, AI 에이전트 UI 작업의 시작점을 빠르게 잡을 수 있다. 빈 화면에서 “SaaS 랜딩 페이지를 만들어줘”라고 요청하는 대신, “`design-md/vercel/DESIGN.md`의 레이아웃 밀도와 타이포그래피를 참고해 제품 소개 페이지를 만들어줘”처럼 지시할 수 있다.

둘째, 스타일 수정 루프를 줄이는 데 좋다. 에이전트가 매번 다른 보라색, 다른 카드 반경, 다른 버튼 높이를 고르는 대신, 문서에 적힌 디자인 토큰과 컴포넌트 규칙을 반복해서 참조하게 만들 수 있다.

셋째, 팀 내부 디자인 가이드의 초안으로도 쓸 수 있다. 특정 브랜드를 그대로 복제하는 목적이 아니라, “우리 서비스는 어떤 밀도, 어떤 대비, 어떤 타입 스케일을 선호하는가”를 논의할 때 샘플 문서로 삼기 좋다. 특히 자체 `DESIGN.md`를 만들기 전 구조 참고용으로 유용하다.

넷째, 에이전트별 컨텍스트 파일과 함께 쓰기 쉽다. `AGENTS.md`, `CLAUDE.md`, `.cursorrules`가 코드 품질과 작업 방식에 대한 지침이라면, `DESIGN.md`는 UI 결과물의 표면 품질에 대한 지침이다. 둘을 같이 두면 “이 프로젝트는 이렇게 만들고, 이렇게 보여야 한다”를 동시에 전달할 수 있다.

## 유료 요청 기능

`getdesign.md/request`에는 특정 웹사이트를 대상으로 private `DESIGN.md`를 요청하는 기능도 있다. 조사 시점에는 private `DESIGN.md` 요청이 39달러, 코드 템플릿까지 포함한 “Vibecoder kit + DESIGN.md”가 49달러로 안내됐다. 결제는 Stripe로 이어지고, 결과물은 이메일로 전달되는 구조다.

이 부분은 공개 GitHub 컬렉션과는 성격이 다르다. 공개 저장소의 문서는 MIT 라이선스 컬렉션이지만, private 요청 결과물과 키트는 getdesign.md가 제공하는 유료 서비스다. 팀에서 쓰려면 공개 컬렉션과 유료 산출물의 사용 조건을 따로 확인하는 편이 좋다.

## 주의할 점

첫째, 이 문서들은 각 브랜드의 공식 디자인 시스템이 아니다. README도 “공개 웹사이트에서 추출한 디자인 시스템 문서”이며 “as is, without warranty”라고 설명한다. 색상과 패턴은 참고용으로 쓰되, 특정 회사의 공식 가이드라인이나 상표 사용 허가처럼 다루면 안 된다.

둘째, 브랜드 모방과 영감의 경계를 구분해야 한다. 내부 프로토타입이나 개인 실험에서는 빠른 레퍼런스로 유용하지만, 공개 제품에서 특정 서비스의 시각 정체성을 지나치게 베끼면 법무·브랜드 리스크가 생길 수 있다. 완성본에는 자기 제품의 색, 타이포그래피, 아이콘, 카피를 다시 입히는 편이 안전하다.

셋째, 컬렉션 수와 웹 미리보기 상태는 빠르게 바뀔 수 있다. 사이트 홈은 71개 DESIGN.md 파일을 표시했고, GitHub API로도 71개 폴더가 확인됐지만, README 배지에는 73개로 표시되는 등 표면마다 숫자가 조금 다를 수 있다. 글을 쓰는 시점의 스냅샷으로 이해하는 것이 좋다.

넷째, DESIGN.md를 에이전트 컨텍스트에 넣는다고 해서 결과가 자동으로 픽셀 퍼펙트가 되지는 않는다. 모델과 프레임워크, 기존 컴포넌트 구조, CSS 리셋, 이미지 자산 유무에 따라 결과가 달라진다. 실제 프로젝트에서는 한 번 생성한 뒤 스크린샷 비교, 접근성 체크, 모바일 반응형 확인을 추가로 해야 한다.

다섯째, 외부 문서를 그대로 프로젝트 루트에 넣기 전에는 내용을 읽어야 한다. 이 저장소의 `DESIGN.md`들은 디자인 설명 중심이지만, 에이전트가 읽는 컨텍스트 파일은 곧 행동 지침이 된다. 다른 출처에서 가져온 `DESIGN.md`, `AGENTS.md`, `CLAUDE.md`를 섞을 때는 숨은 명령, 외부 링크, 불필요한 브랜드 지시가 없는지 확인하는 습관이 필요하다.

## 내 판단

`getdesign.md`와 `awesome-design-md`는 AI 코딩 에이전트 시대의 “디자인 프롬프트 레퍼런스 북”에 가깝다. Figma 파일이나 토큰 패키지처럼 엄격한 소스 오브 트루스는 아니지만, 에이전트에게 UI 감각을 전달하는 텍스트 컨텍스트로는 충분히 실용적이다.

가장 좋은 사용처는 빠른 프로토타이핑과 스타일 방향성 탐색이다. “이 제품은 Vercel처럼 절제된 개발자 인프라 톤”, “이 대시보드는 Stripe처럼 부드러운 금융 SaaS 톤”, “이 AI 도구는 Claude처럼 따뜻한 editorial 톤”처럼 초반 방향을 잡을 때 효과가 있다.

반대로 운영 중인 제품의 최종 디자인 시스템으로 그대로 채택하기에는 부족하다. 실서비스라면 이 문서를 출발점으로 삼되, 실제 브랜드 자산, 접근성 기준, 컴포넌트 구현, 토큰 네이밍, 라이선스·상표 검토까지 거쳐 자기 프로젝트의 `DESIGN.md`로 다시 정리하는 편이 좋다.

## 참고한 공개 자료

- [getdesign.md](https://getdesign.md/)
- [getdesign.md design-md catalog](https://getdesign.md/design-md)
- [getdesign.md request page](https://getdesign.md/request)
- [VoltAgent/awesome-design-md GitHub repository](https://github.com/VoltAgent/awesome-design-md)
- [README.md](https://github.com/VoltAgent/awesome-design-md/blob/main/README.md)
- [CONTRIBUTING.md](https://github.com/VoltAgent/awesome-design-md/blob/main/CONTRIBUTING.md)
- [LICENSE](https://github.com/VoltAgent/awesome-design-md/blob/main/LICENSE)
- [Google DESIGN.md repository](https://github.com/google-labs-code/design.md)
- [`@google/design.md` on npm](https://www.npmjs.com/package/@google/design.md)
