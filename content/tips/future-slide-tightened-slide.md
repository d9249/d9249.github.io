---
title: "future-slide의 tightened-slide는 Codex로 일관된 슬라이드 덱을 만들기 위한 레이아웃 잠금 스킬이다"
date: "2026-06-16T20:24:53"
description: "bytonylee/future-slide는 Codex Skills 방식으로 DESIGN.md 추출, 슬라이드 계획, 페이지별 프롬프트, 이미지 렌더링을 분리하고, tightened-slide로 HTML 발표 덱의 레이아웃을 고정해 반복 품질을 높이려는 공개 스킬 묶음입니다."
author: "Sangmin Lee"
repository: "bytonylee/future-slide"
sourceUrl: "https://github.com/bytonylee/future-slide"
status: "Open source skill bundle"
license: "Apache-2.0"
platforms:
  - "macos-linux"
tags:
  - "Codex"
  - "Agent Skills"
  - "Presentation"
  - "Slide Generation"
  - "AI Workflow"
highlights:
  - "슬라이드 생성을 DESIGN.md 추출, deck plan, page prompt, render 네 단계로 쪼개 모델이 순서를 건너뛰는 문제를 줄인다."
  - "`tightened-slide`는 `S01`~`S22` 등록 레이아웃과 이미지 슬롯 규칙을 강제해 HTML 가로 스와이프 덱의 화면 일관성을 높인다."
  - "설치 후 Codex에서는 프롬프트 앞에 `With $tightened-slide skill,`처럼 스킬 호출 맥락을 붙여야 스킬 규칙이 적용된다."
  - "프롬프트 웹사이트는 별도 비밀번호와 Turnstile 접근 확인이 걸려 있으므로, 공개적으로 재사용할 때는 저장소의 SKILL.md와 README를 기준으로 검토하는 편이 안전하다."
  - "외부 스킬을 설치하면 에이전트가 읽는 절차가 바뀌므로 팀 환경에서는 커밋 고정, SKILL.md 리뷰, HTML validator 실행을 함께 두는 것이 좋다."
draft: false
---

슬라이드 생성에서 가장 자주 무너지는 지점은 “예쁘게 만들어줘”라는 한 문장 자체다. 모델은 첫 장의 톤을 보다가도 다음 장에서 레이아웃을 바꾸고, 표가 들어가야 할 곳에 장식 카드를 넣고, 마지막에는 파일을 어디에 저장했는지조차 애매하게 끝내곤 한다.

`future-slide`는 이 문제를 **Codex Skills용 작업 절차**로 다루는 저장소다. 특히 이번에 공유된 `tightened-slide`는 생성 이미지보다 HTML 발표 덱에 초점을 둔다. 단일 `index.html`, 인접 `images/` 폴더, 키보드 이동, 정적 모드, 등록 레이아웃, 검증 스크립트까지 묶어서 “매번 비슷한 밀도의 덱”을 만들게 하는 쪽이다.

조사 시점 기준 LinkedIn 단축 링크는 `bytonylee/future-slide` 저장소의 `skills/tightened-slide/SKILL.md`로 연결된다. GitHub API와 checked-in `LICENSE`는 Apache-2.0으로 확인했고, 저장소 최신 Release는 `v0.0.3`이다. `bytonylee/future-slide-skill`과 README에 남아 있는 `jyoung105/future-slide-skill` 주소는 모두 현재 canonical 저장소인 `bytonylee/future-slide`로 redirect된다.

![future-slide 4단계 워크플로](/images/tips/future-slide-flow-ko.png)

## 무엇을 담고 있나

저장소의 핵심은 일반 앱이나 라이브러리가 아니라 **에이전트가 읽고 따르는 절차 파일**이다. `skills/` 아래에 여러 `SKILL.md`가 있고, 각 스킬이 슬라이드 제작의 한 단계를 맡는다.

```text
reference slide / source files / deck request
  → slide-design: DESIGN.md 추출
  → gpt-image-slide-plan: slide_plan.json 작성
  → gpt-image-slide-prompt: slide_prompts.json 작성
  → gpt-image-slide-render: page_1.png ... page_N.png 생성
```

`tightened-slide`는 이 흐름과 별도로 HTML 덱을 만드는 독립 스킬이다. 출력은 보통 다음처럼 잡힌다.

```text
path/to/deck/
  ├─ index.html
  └─ images/
```

중요한 차이는 “HTML을 자유롭게 만들어도 된다”가 아니라는 점이다. `tightened-slide`는 본문 슬라이드에 `S01`부터 `S22`까지 등록된 레이아웃만 쓰게 하고, 이미지도 먼저 슬롯을 정한 뒤 배치하도록 요구한다. 지도나 위치 관계는 `S08 + Tightened Map Component`, 큰 이미지 페이지는 `S22`, 복수 이미지는 `S15`나 `S16` 계열처럼 정해진 규칙을 따른다.

## 왜 유용한가

이 스킬의 포인트는 더 화려한 장식을 추가하는 것이 아니라 **모델이 마음대로 만드는 범위를 줄이는 것**이다.

- 디자인 분석과 자료 요약을 섞지 않고, 먼저 `DESIGN.md`를 뽑게 한다.
- 덱의 설득 흐름을 `slide_plan.json`으로 한 번 고정한다.
- 페이지별 생성 프롬프트를 JSON으로 분리해 각 장의 역할, 레이아웃, 표/차트/카드 위치를 명시한다.
- `tightened-slide`에서는 색상, 타이포그래피, 캡션, navigation safe area, 이미지 슬롯을 더 엄격하게 제한한다.
- 전달 전 `validate-deck.mjs`를 실행하도록 요구한다.

슬라이드 AI 도구를 써본 사람이라면 “첫 장은 괜찮은데 전체 덱으로 보면 한 사람이 만든 것 같지 않다”는 문제를 겪는다. `future-slide`는 그 문제를 프롬프트 한 방이 아니라 **단계 분리와 레이아웃 잠금**으로 풀려는 접근이다.

## 설치와 첫 사용 흐름

게시글에서 안내한 설치 명령은 다음이다.

```bash
npx skills add bytonylee/future-slide-skill
```

현재 GitHub redirect 기준 canonical 저장소는 `bytonylee/future-slide`이므로, 팀 문서나 자동화에서는 명시 URL을 같이 적어두는 편이 좋다.

```bash
npx skills add https://github.com/bytonylee/future-slide.git
```

`npx skills`는 별도 npm CLI이며, 조사 시점의 npm metadata는 package `skills` `1.5.11`, Node.js `>=18` 요구 조건을 가진다. 설치 뒤에는 Codex를 재시작해야 새 스킬이 발견된다.

수동 설치도 가능하다. `tightened-slide`만 테스트하려면 저장소를 받은 뒤 해당 폴더를 Codex skills 경로로 복사한다.

```bash
mkdir -p ~/.codex/skills
cp -R skills/tightened-slide ~/.codex/skills/
```

단, 전체 이미지 생성 워크플로까지 쓰려면 `slide-design`, `gpt-image-slide-plan`, `gpt-image-slide-prompt`, `gpt-image-slide-render`도 함께 복사해야 한다.

## 프롬프트를 쓸 때의 핵심 규칙

이번 공유 글에서 가장 중요한 사용 규칙은 이 문장이다.

```text
With $tightened-slide skill,
```

Codex에서 `tightened-slide` 스킬을 설치했다면, 프롬프트 맨 앞에 이 표현을 붙여 스킬 맥락을 열어주는 방식이다. 예를 들면 다음처럼 쓸 수 있다.

```text
With $tightened-slide skill,
한국어로 9페이지짜리 제품 소개 HTML 발표 덱을 만들어줘.
International Klein Blue 테마를 쓰고, 각 페이지는 등록된 layout만 사용해.
마지막에는 validator를 실행해서 오류를 고쳐줘.
```

반대로 ChatGPT에 그대로 붙이면 `$tightened-slide`가 특별한 의미를 갖지 않는다. ChatGPT에서는 스킬 호출 문구가 아니라 실제 프롬프트 내용만 복사해 쓰는 편이 맞다. 즉 이 표현은 “마법 문장”이라기보다 **Codex Skills 라우팅 힌트**에 가깝다.

## tightened-slide를 볼 때 확인할 부분

`skills/tightened-slide/SKILL.md`를 보면 실제 운영 규칙이 꽤 구체적이다.

- 기본 출력은 `index.html`과 `images/` 폴더다.
- 언어는 English/Korean 모드를 지원하고, 한국어 모드에서는 `SUIT`, `Pretendard`, `Noto Sans KR` 계열 폰트 스택을 쓴다.
- 본문 슬라이드는 `S01`~`S22` 레이아웃을 사용한다.
- 7~8페이지 덱은 최소 6개, 10페이지 이상은 최소 8개 레이아웃을 쓰도록 요구한다.
- gradient, shadow, rounded card, glass, neon, 3D 같은 장식은 금지한다.
- SVG에는 도형만 그리고, 보이는 label은 HTML로 둔다.
- 마지막에는 validator를 돌려야 한다.

검증 명령은 저장소 기준 다음 형태다.

```bash
node skills/tightened-slide/scripts/validate-deck.mjs path/to/index.html
```

이 점 때문에 `tightened-slide`는 “PPTX 파일을 바로 만들어주는 도구”라기보다, 브라우저에서 열 수 있는 HTML 발표 덱을 안정적으로 생성하는 Codex 작업 절차에 더 가깝다. PowerPoint 납품이 필요하면 이후 HTML 캡처, 이미지 변환, PPTX 재구성 같은 별도 후처리를 설계해야 한다.

## 함께 공개된 프롬프트 웹사이트

글에는 별도의 slide 프롬프트 웹사이트도 포함되어 있다. 해당 사이트는 조사 시점에 password 입력과 Cloudflare Turnstile 확인을 요구했고, `robots`도 `noindex,nofollow`로 설정되어 있었다.

그래서 공개 tips 글에서는 그 사이트의 내용을 그대로 복제하기보다, 다음 정도로 바라보는 것이 적절하다.

1. Codex 사용자는 GitHub 스킬을 먼저 설치한다.
2. 프롬프트 예시를 자기 회사, 발표 목적, 자료 형식에 맞게 고쳐 쓴다.
3. Codex에서는 `With $tightened-slide skill,`을 붙여 스킬 규칙을 활성화한다.
4. ChatGPT에서는 `$tightened-slide` 표현을 붙이지 않는다.

즉 웹사이트는 “정답 프롬프트 보관함”이라기보다, 스킬과 함께 쓰는 **프롬프트 패턴 참고 자료**에 가깝다.

## 주의할 점

외부 에이전트 스킬을 설치한다는 것은 단순한 템플릿 추가가 아니다. Codex가 읽는 지시문, 참고 파일, 스크립트가 작업 흐름에 들어온다는 뜻이다.

- 저장소를 팀에서 쓰려면 floating `main`보다 검토한 commit이나 Release tag를 기준으로 고정하는 편이 낫다.
- `SKILL.md`, `references/`, `scripts/`, `assets/`를 한 번 읽고 어떤 파일 생성·검증·명령 실행을 요구하는지 확인해야 한다.
- 사용자 자료가 보고서 PDF, 고객사 제안서, 내부 수치라면 생성된 HTML과 이미지 폴더를 어디에 저장하고 공유할지 먼저 정해야 한다.
- 웹사이트 프롬프트는 공개 접근 제어가 걸려 있으므로, 비밀번호를 사내 문서나 공개 글에 다시 퍼뜨리는 방식은 피하는 편이 좋다.
- `npx skills` CLI, Codex 버전, 로컬 skills 경로 정책에 따라 설치 위치와 발견 방식이 달라질 수 있다.

## 내 판단

`future-slide`와 `tightened-slide`는 “AI가 슬라이드를 알아서 예쁘게 만든다”는 방향보다, **에이전트에게 슬라이드 제작 SOP를 강제로 읽히는 방식**에 가깝다. 그래서 한두 장짜리 이미지 생성보다, 반복적으로 같은 톤의 발표 자료를 만들고 싶은 사람에게 더 잘 맞는다.

특히 기업 분석, 제품 소개, 리서치 요약처럼 표·차트·근거·스토리라인이 중요한 덱에서는 단계 분리의 이점이 크다. 반대로 즉석 아이디어 스케치나 자유로운 moodboard에는 규칙이 다소 빡빡하게 느껴질 수 있다.

직접 써본다면 먼저 `tightened-slide` 하나만 설치해 7~9페이지 HTML 덱을 만들어 보고, validator가 잡는 오류와 화면 일관성이 실제로 좋아지는지 확인하는 순서가 좋다. 마음에 들면 그다음 `slide-design → plan → prompt → render`의 4단계 이미지 생성 흐름으로 확장하면 된다.

## 참고한 공개 자료

- [bytonylee/future-slide GitHub repository](https://github.com/bytonylee/future-slide)
- [tightened-slide SKILL.md](https://github.com/bytonylee/future-slide/blob/main/skills/tightened-slide/SKILL.md)
- [future-slide 공식 소개 사이트](https://future-slide.tonylee.im/)
- [slide-prompter 접근 페이지](https://slide-prompter.tonylee.im/)
- [npm package: skills](https://www.npmjs.com/package/skills)
