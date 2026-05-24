---
title: "Garden Skills는 웹 디자인·지식검색·이미지 생성을 묶은 Agent Skills 카탈로그다"
date: "2026-05-25T03:40:20"
description: "ConardLi/garden-skills는 Claude Code, Cursor, Codex, Gemini CLI, OpenCode 등에서 쓸 수 있는 SKILL.md 기반 생산형 에이전트 스킬 4종을 묶은 MIT 카탈로그다."
author: "Sangmin Lee"
repository: "ConardLi/garden-skills"
sourceUrl: "https://github.com/ConardLi/garden-skills"
status: "Open source skill catalog"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Agent Skills"
  - "Claude Code"
  - "Codex"
  - "Cursor"
  - "AI Agents"
highlights:
  - "웹 비디오 프레젠테이션, 웹 디자인 엔지니어, GPT Image 2, 로컬 지식검색까지 4개 SKILL.md를 한 저장소에서 고를 수 있다."
  - "공식 README는 `npx skills add ConardLi/garden-skills` 설치와 Claude Code plugin marketplace 설치를 함께 안내한다."
  - "스킬별 GitHub Release, 버전 태그, ZIP, SHA-256 checksum을 제공해 CI나 팀 환경에서는 특정 릴리스로 고정하기 좋다."
  - "스킬은 에이전트 행동을 바꾸는 신뢰 표면이므로 설치 전 SKILL.md, references, scripts, API key·파일 접근 범위를 직접 읽어야 한다."
draft: false
---

`ConardLi/garden-skills`는 일반적인 앱이나 라이브러리라기보다, AI 코딩 에이전트가 필요할 때 읽고 따르는 **Agent Skills 카탈로그**다. Claude Code, Cursor, Codex CLI, Gemini CLI, OpenCode처럼 `SKILL.md` 폴더를 읽을 수 있는 환경에 “작업 절차”를 주입하는 방식이다.

현재 공개된 핵심 스킬은 4개다. 웹 발표 영상을 만드는 `web-video-presentation`, 고품질 프런트엔드 산출물을 겨냥한 `web-design-engineer`, GPT Image 2 이미지 생성/편집 프롬프트 워크플로인 `gpt-image-2`, 로컬 문서 지식베이스를 점진적으로 검색하는 `kb-retriever`가 들어 있다. 저장소와 checked-in `LICENSE`는 MIT이고, GitHub API 기준 기본 언어는 CSS로 잡힌다. 실제로는 Vite/React 웹 데모, Markdown 지침, Node 기반 릴리스 스크립트, 일부 헬퍼 스크립트가 섞인 스킬 모노레포에 가깝다.

![Garden Skills repository](https://opengraph.githubassets.com/garden-skills-tips/ConardLi/garden-skills)

## 무엇을 담고 있나

루트 README 기준 Garden Skills는 “production-ready Agent Skills”를 목표로 한다. 각 스킬은 `skills/<name>/SKILL.md`를 중심으로, 사람이 읽는 `README.md`, 설치/릴리스용 `manifest.json`, 필요할 때 불러오는 `references/`, 실행 보조용 `scripts/`, 템플릿과 에셋을 함께 둔다.

확인 시점의 스킬 구성은 다음과 같다.

| 스킬 | 현재 manifest 버전 | 핵심 용도 |
|---|---:|---|
| `web-video-presentation` | `1.2.1` | 글·스크립트·강의 자료를 16:9 Vite + React + TypeScript 기반의 클릭 진행형 웹 프레젠테이션으로 만들고, 필요하면 TTS 오디오 합성 흐름까지 연결한다. |
| `web-design-engineer` | `1.2.0` | 랜딩 페이지, 대시보드, 프로토타입, 슬라이드, UI mockup 같은 브라우저 기반 시각 산출물을 더 의도적인 디자인 시스템과 검증 흐름으로 만들게 한다. |
| `gpt-image-2` | `1.0.3` | GPT Image 2 또는 OpenAI 호환 이미지 API를 대상으로 이미지 생성·편집 prompt를 구성하고, 환경에 따라 로컬 실행·호스트 도구 위임·prompt advisor 모드로 분기한다. |
| `kb-retriever` | `1.0.0` | `knowledge/` 같은 로컬 문서 폴더를 계층 인덱스와 검색 라운드로 좁혀 읽고, PDF/Excel은 처리 방법을 먼저 확인한 뒤 근거 중심으로 답하게 한다. |

![Garden Skills web design skill card](https://raw.githubusercontent.com/ConardLi/garden-skills/main/dist/imgs/web-design-skill.png)

특히 `web-design-engineer`는 단순히 “예쁘게 만들어라”가 아니라, 요구사항 확인 → 맥락 수집 → 디자인 시스템 선언 → v0 확인 → 전체 구현 → 검증으로 이어지는 6단계 워크플로를 강하게 둔다. Linear, Aesop, Pentagram, Bloomberg, Stripe Press, Mid-Century 같은 스타일 레시피 25개와 OKLCH, container query, reduced motion 같은 구현 규칙도 포함한다.

`web-video-presentation`은 영상 편집기가 아니라 “녹화하기 좋은 웹 프레젠테이션”을 만드는 스킬이다. 챕터와 step cursor, 1920×1080 stage, 숨겨진 진행 컨트롤, narration beat별 화면 전환, MiniMax/OpenAI TTS provider 예시가 들어 있다. 발표 자료를 화면 녹화용 웹앱으로 만들고 싶은 경우에 맞다.

`gpt-image-2`는 API key가 있는 Garden 로컬 모드, 숙주 에이전트의 이미지 생성 도구에 prompt를 넘기는 Host-Native 모드, 도구가 없을 때 prompt만 작성하는 Advisor 모드를 구분한다. `kb-retriever`는 반대로 “한 번에 문서를 다 읽는” 방식이 아니라 `data_structure.md`, keyword search, windowed read, PDF/Excel 처리 가이드, 최대 5회 검색 라운드로 컨텍스트 폭주를 줄이려는 스킬이다.

## 설치와 첫 사용 흐름

README가 제시하는 가장 쉬운 설치 경로는 `skills` CLI다.

```bash
# 4개 스킬 전체 설치
npx skills add ConardLi/garden-skills

# 특정 스킬만 설치
npx skills add ConardLi/garden-skills -s web-design-engineer

# 전역 설치
npx skills add ConardLi/garden-skills -s gpt-image-2 --global

# 특정 에이전트 대상으로 설치
npx skills add ConardLi/garden-skills -s kb-retriever -a claude-code
```

Claude Code 사용자는 plugin marketplace 흐름도 쓸 수 있다.

```bash
/plugin marketplace add ConardLi/garden-skills
/plugin install presentation-skills@garden-skills
/plugin install web-design-skills@garden-skills
/plugin install knowledge-base-skills@garden-skills
/plugin install image-generation-skills@garden-skills
```

재현성이 필요한 환경에서는 `main` 브랜치 최신 상태를 그대로 따라가기보다, 스킬별 release tag나 ZIP을 고정하는 편이 낫다. 저장소는 각 스킬별로 `web-video-presentation-v1.2.1`, `web-design-engineer-v1.2.0`, `gpt-image-2-v1.0.3`, `kb-retriever-v1.0.0` 같은 태그와 GitHub Release를 제공하고, 릴리스 asset에는 `.zip`과 `.zip.sha256`이 같이 붙는다.

예를 들어 README는 특정 버전으로 고정할 때 다음처럼 tag-scoped `tree/` URL을 쓰는 방식을 안내한다.

```bash
npx skills add ConardLi/garden-skills/tree/web-design-engineer-v1.0.0/skills/web-design-engineer
```

## 왜 유용한가

이 저장소의 장점은 “모델에게 더 열심히 하라고 말하는 프롬프트”가 아니라, 반복 작업에서 생기는 실패 패턴을 **작업 절차와 검증 규칙**으로 압축했다는 점이다.

예를 들어 웹 디자인 작업에서 에이전트는 자주 파란색 gradient, Inter, 카드 몇 장으로 도망간다. `web-design-engineer`는 이런 AI-default 패턴을 피하기 위해 디자인 방향을 먼저 선언하고, 시각 hierarchy, motion, typography, color token, anti-pattern을 점검하게 만든다. `web-video-presentation`은 “슬라이드처럼 보이지만 영상처럼 녹화되는 웹”이라는 좁은 산출물을 위해 script, outline, chapter implementation, narration source of truth를 분리한다.

이미지 생성 쪽에서는 prompt 작성과 실제 생성 환경이 자주 섞인다. `gpt-image-2`는 API key가 있는지, 숙주 에이전트가 이미지 도구를 갖고 있는지부터 확인하게 해서, 없는 도구를 있는 척하거나 실패하는 흐름을 줄인다. 로컬 지식검색 쪽에서는 `kb-retriever`가 PDF/Excel 같은 무거운 파일을 바로 통째로 읽지 않고 처리 방법을 먼저 읽게 하며, 검색 라운드를 제한한다.

즉 Garden Skills는 “AI 에이전트에게 일감을 던지는 사람”보다, “에이전트에게 특정 작업 습관을 계속 주입하고 싶은 사람”에게 더 잘 맞는다.

## 활용 포인트

개인 사용에서는 필요한 스킬 하나만 프로젝트에 넣는 흐름이 현실적이다. 디자인 산출물이 자주 필요하면 `web-design-engineer`, 발표·해설 영상을 웹으로 녹화하고 싶으면 `web-video-presentation`, 로컬 문서 폴더를 자주 물어보면 `kb-retriever`처럼 좁게 가져가면 된다.

팀 환경에서는 바로 설치하기보다 다음 흐름이 더 안전하다.

1. GitHub에서 해당 `SKILL.md`, `references/`, `scripts/`를 먼저 읽는다.
2. 팀의 에이전트가 스킬을 어느 경로에서 읽는지 확인한다.
3. `npx skills add` 또는 ZIP으로 설치하되, 설치한 commit/tag와 CLI 버전을 기록한다.
4. 팀 내부 규칙과 충돌하는 지침은 fork하거나 private skill repo로 옮겨 수정한다.
5. 스킬이 제안하는 명령, 파일 접근, API 호출은 에이전트 권한 정책으로 한 번 더 제한한다.

이 저장소 자체도 스킬 작성 예시로 볼 만하다. 다국어 README, 스킬별 `manifest.json`, release packer, README download link updater, Claude Code plugin marketplace manifest까지 갖추고 있어서, 개인/팀 스킬 카탈로그를 만들 때 구조 참고 자료가 된다.

## 주의할 점

첫째, `skills` CLI와 `garden-skills` 저장소를 분리해서 봐야 한다. `npx skills add ConardLi/garden-skills`에서 실행되는 `skills` npm package는 별도 설치 도구이고, 조사 시점 기준 npm registry의 `skills`는 `1.5.7`, Node.js `>=18`을 요구한다. 반면 `garden-skills` 루트 `package.json`은 private maintainer package이며 Node.js `>=20`으로 릴리스·검증 스크립트를 돌린다.

둘째, 스킬은 에이전트의 행동을 바꾸는 공급망 아티팩트다. 이 저장소의 스킬 중 일부는 로컬 파일을 읽고, 프로젝트 scaffold를 만들고, TTS provider 스크립트를 실행하고, 이미지 API key를 참조하고, PDF/Excel 처리를 유도한다. 설치만으로 곧바로 위험한 명령이 실행되는 것은 아니지만, 에이전트가 “무엇을 해도 된다고 생각하는지”가 달라진다.

셋째, `main`을 따라가는 설치는 편하지만 팀 재현성에는 약하다. Garden Skills는 스킬별 release tag와 checksum ZIP을 제공하므로, CI나 장기 프로젝트에서는 “최신”보다 “검토한 버전”을 쓰는 편이 안전하다. 특히 `gpt-image-2`처럼 API key와 생성 결과물을 다루는 스킬, `kb-retriever`처럼 로컬 문서를 읽는 스킬은 설치 전후에 어떤 파일과 credential 경계를 건드리는지 확인해야 한다.

넷째, 모든 에이전트가 같은 방식으로 `SKILL.md`를 해석하는 것은 아니다. README는 Claude Code, Claude.ai, Cursor, Codex CLI, Gemini CLI, OpenCode를 tested로 표시하지만, 실제 설치 경로와 활성화 조건, 도구 호출 권한, 프로젝트/전역 우선순위는 환경마다 다르다. 이미 다른 스킬 관리자나 `.agents/skills`, `.claude/skills`, `.codex/skills` 구성을 쓰고 있다면 중복·우선순위·업데이트 흐름을 확인해야 한다.

## 내 판단

Garden Skills는 “작지만 바로 써볼 수 있는 Agent Skills 묶음”으로 꽤 흥미롭다. Google/NVIDIA처럼 특정 클라우드·GPU 제품의 운영 지식을 담은 공식 카탈로그와 달리, 이 저장소는 콘텐츠 제작, 프런트엔드 디자인, 이미지 prompt, 로컬 지식검색처럼 개인 에이전트 사용자가 매일 부딪히는 생산성 작업에 초점을 둔다.

이미 Claude Code, Codex, Cursor, OpenCode 같은 에이전트를 쓰고 있고 “매번 같은 품질 기준을 다시 말하기 귀찮다”는 느낌이 있다면 하나씩 설치해볼 만하다. 다만 한 번에 전체 카탈로그를 넣기보다는 필요한 스킬을 골라 읽고, 프로젝트별로 pinning한 뒤, 팀/개인 기준에 맞게 fork하는 방식을 추천한다.

한 줄로 정리하면: Garden Skills는 에이전트에게 “무엇을 할 수 있는지”보다 “어떤 절차와 품질 기준으로 해야 하는지”를 가르치는 카탈로그다. 설치 버튼보다 `SKILL.md` 리뷰가 먼저인 도구다.

## 참고한 공개 자료

- [ConardLi/garden-skills GitHub repository](https://github.com/ConardLi/garden-skills)
- [Garden Skills README](https://github.com/ConardLi/garden-skills/blob/main/README.md)
- [web-video-presentation/SKILL.md](https://github.com/ConardLi/garden-skills/blob/main/skills/web-video-presentation/SKILL.md)
- [web-design-engineer/SKILL.md](https://github.com/ConardLi/garden-skills/blob/main/skills/web-design-engineer/SKILL.md)
- [gpt-image-2/SKILL.md](https://github.com/ConardLi/garden-skills/blob/main/skills/gpt-image-2/SKILL.md)
- [kb-retriever/SKILL.md](https://github.com/ConardLi/garden-skills/blob/main/skills/kb-retriever/SKILL.md)
- [Claude Code plugin marketplace manifest](https://github.com/ConardLi/garden-skills/blob/main/.claude-plugin/marketplace.json)
- [Garden Skills GitHub Releases](https://github.com/ConardLi/garden-skills/releases)
- [skills npm package](https://www.npmjs.com/package/skills)
- [Agent Skills specification](https://agentskills.io)
