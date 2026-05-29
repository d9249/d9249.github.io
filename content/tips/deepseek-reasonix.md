---
title: "Reasonix는 DeepSeek prefix cache에 맞춘 터미널 AI 코딩 에이전트다"
date: "2026-05-29T14:26:48"
description: "esengine/DeepSeek-Reasonix는 DeepSeek API의 prefix-cache 특성을 전제로 설계한 TypeScript 기반 터미널 AI 코딩 에이전트로, 긴 세션의 비용·캐시 hit·도구 실행을 한 화면에서 관리한다."
author: "Sangmin Lee"
repository: "esengine/DeepSeek-Reasonix"
sourceUrl: "https://github.com/esengine/DeepSeek-Reasonix"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Developer Tools"
  - "CLI"
  - "DeepSeek"
  - "TUI"
highlights:
  - "DeepSeek 전용으로 byte-stable prefix-cache, append-only log, cache/cost meter를 중심에 둔 터미널 코딩 에이전트다."
  - "Node 22 이상에서 `npx reasonix code` 또는 `npm install -g reasonix`로 시작하고, `reasonix`와 `dsnix` CLI alias를 제공한다."
  - "code/chat/run/doctor, MCP, skills, memory, hooks, permissions, semantic index, dashboard 같은 agent-runtime 기능을 한 패키지에 묶는다."
  - "CLI는 macOS·Linux·Windows 터미널을 지원하고, 별도 Tauri desktop release는 DMG/AppImage/deb/rpm/EXE/MSI 자산을 제공하지만 README 기준 아직 prerelease·미서명이다."
  - "DeepSeek API key, `~/.reasonix/config.json`, shell/edit gate, hooks, MCP 서버, QQ/Telegram류 remote channel은 신뢰 경계를 확인하고 켜야 한다."
draft: false
---

`esengine/DeepSeek-Reasonix`는 “여러 모델을 고르는 범용 에이전트”가 아니라 **DeepSeek API 하나에 맞춰 코딩 루프를 다시 설계한 터미널 AI 에이전트**다. README가 강조하는 핵심은 DeepSeek의 prefix cache가 정확한 byte prefix에 민감하다는 점이고, Reasonix는 세션을 오래 켜둬도 캐시가 깨지지 않도록 append-only log, 고정 prefix, volatile scratch 분리 같은 규칙을 제품 구조에 넣는다.

그래서 이 도구는 Claude Code나 Aider의 단순 대체재라기보다 “DeepSeek를 주력 backend로 쓰고, 긴 세션의 입력 토큰 비용을 낮게 유지하고 싶은 사람”에게 맞는 실험적인 선택지다. 조사 시점 기준 저장소는 TypeScript 중심의 MIT 오픈소스이고, npm 패키지 `reasonix` 최신은 `0.53.2`, GitHub latest release 표면은 desktop용 `desktop-v0.53.0`이다.

![Reasonix code mode preview](/images/tips/deepseek-reasonix-hero.svg)

## Reasonix 개요

Reasonix의 기본 표면은 `reasonix code` TUI다. 현재 작업 디렉터리를 workspace root로 삼고, 파일 읽기/검색/편집, shell command, plan gate, edit review, MCP, memory, skill을 한 루프 안에서 다룬다. `reasonix chat`은 filesystem·shell tool이 없는 가벼운 chat 모드이고, `reasonix run "task"`는 CI나 shell pipe에 넣기 좋은 one-shot 실행 모드다.

공식 CLI reference에서 보이는 주요 명령은 다음과 같다.

| 명령 | 용도 |
|---|---|
| `reasonix code [dir]` | 파일 편집, plan mode, edit gate가 있는 코딩 TUI |
| `reasonix chat` | 도구 없는 chat TUI |
| `reasonix run <task>` | headless one-shot 실행 |
| `reasonix doctor` | API, config, hooks, project 상태 점검 |
| `reasonix stats` / `reasonix diff` | token·cache·cost 분석 |
| `reasonix mcp ...` | MCP 서버 검색·설치·점검 |
| `reasonix index` | local semantic index 구축 |

흥미로운 점은 “agent runtime” 쪽 기능이 꽤 넓다는 것이다. configuration guide는 `~/.reasonix/config.json`와 프로젝트별 `<project>/.reasonix/` override를 중심으로 MCP 서버, Markdown skill, user/project memory, lifecycle hook, shell allowlist, web search engine, semantic embedding provider를 설정한다고 설명한다.

## 왜 DeepSeek 전용인가

Reasonix의 차별점은 모델 라우팅 폭이 아니라 **DeepSeek prefix-cache 경제성에 최적화한 루프**다. architecture 문서는 cache-first loop를 위해 context를 immutable prefix, append-only log, volatile scratch로 나누고, tool result ordering과 history append를 안정적으로 유지한다고 설명한다. 그 결과를 TUI의 cache cell과 session stats에서 확인하게 만드는 것이 제품 철학이다.

또 다른 축은 tool-call repair다. 문서는 DeepSeek 계열에서 tool-call JSON이 reasoning 영역에 숨어버리거나, schema가 깊을 때 argument가 빠지거나, 동일 tool call이 폭주하거나, JSON이 truncation되는 상황을 가정하고 `flatten`, `scavenge`, `truncation`, `storm` 같은 보정 단계를 둔다고 설명한다.

비용 제어도 이 흐름의 일부다. `/preset auto|flash|pro`, `/model`, session budget, turn-end auto-compaction, per-turn/session cost 색상 표시처럼 “계속 켜놓는 코딩 에이전트”에서 비용이 눈에 보이게 하는 장치가 들어 있다. 단, README의 cache-hit/cost 절감 수치는 프로젝트가 공개한 benchmark·case study 기준이므로, 실제 업무 비용은 사용하는 DeepSeek 모델, prompt 길이, tool result, 작업 패턴에 따라 달라진다.

![Reasonix capabilities](/images/tips/deepseek-reasonix-features.svg)

## 설치와 첫 사용법

CLI는 Node `>=22`가 필요하다. 가장 간단한 경로는 프로젝트 디렉터리에서 `npx`로 바로 실행하는 것이다.

```bash
cd my-project
npx reasonix code
```

매일 쓸 계획이라면 전역 설치도 공식 README가 안내한다.

```bash
npm install -g reasonix
reasonix code my-project   # 첫 실행에서 DeepSeek API key 입력
```

짧은 alias를 원하면 `dsnix`도 쓸 수 있다.

```bash
npm install -g dsnix
npx dsnix@latest code
```

첫 실행에는 DeepSeek API key가 필요하다. README와 `.env.example` 기준 기본 endpoint는 `https://api.deepseek.com`이고, 설정은 `~/.reasonix/config.json`에 남는다. 따라서 Reasonix를 팀 장비나 공유 서버에서 쓸 때는 이 파일을 일반 credential store처럼 다뤄야 한다.

## CLI와 desktop release를 구분해서 보자

README는 CLI를 canonical surface로 둔다. desktop client는 같은 loop 위에 Tauri GUI를 얹은 companion에 가깝고, 멀티 탭, session별 read/edit file panel, cost/cache/token meter를 보여주는 방향이다. GitHub latest release에는 macOS universal DMG/app tarball, Linux AppImage/deb/rpm, Windows setup EXE/MSI가 올라와 있다.

다만 desktop은 README에서 **prerelease**로 설명되고, installer가 아직 code-signed 되어 있지 않다고 적혀 있다. macOS는 Gatekeeper 경고 뒤 `xattr -dr com.apple.quarantine /Applications/Reasonix.app` 또는 우클릭 실행이 필요할 수 있고, Windows는 SmartScreen “Unknown publisher” 경고를 통과해야 할 수 있다. 안정적인 일상 도구로 쓰려면 CLI부터 확인하고, desktop은 별도 release note와 서명 상태를 보고 올리는 편이 안전하다.

버전 표면도 분리되어 보인다. 조사 시점에 npm `reasonix`는 `0.53.2`, npm `dsnix`는 `0.53.1`, GitHub latest release는 `desktop-v0.53.0`, default branch의 `package.json`은 `0.52.0`으로 확인됐다. 설치 후에는 `reasonix version` 또는 `npm view reasonix version`으로 실제 패키지 버전을 확인하는 쪽이 좋다.

## 확장 포인트와 보안 caveat

Reasonix는 단순 TUI보다 권한 표면이 넓다. configuration guide와 security policy 기준으로 특히 확인할 부분은 다음이다.

- **DeepSeek API key**: `~/.reasonix/config.json`에 저장된다. shell profile, dotfile sync, backup에 섞이지 않게 관리해야 한다.
- **editMode**: `review`, `auto`, `yolo`가 있고, `yolo`는 edit·shell gate를 건너뛰는 신뢰 모드다. 샌드박스 밖에서는 기본 review/ask 흐름을 유지하는 편이 맞다.
- **shell allowlist**: `run_command`와 `!` shortcut은 permission allowlist를 따른다. workspace별 허용 prefix를 너무 넓게 잡으면 agent가 기대보다 많은 명령을 실행할 수 있다.
- **hooks**: `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop` 같은 hook은 사용자가 설정한 shell script를 실행한다. 모르는 repo의 `.reasonix/settings.json`은 코드처럼 리뷰해야 한다.
- **MCP 서버**: stdio, SSE/HTTP, Streamable HTTP MCP를 붙일 수 있다. 외부 MCP는 파일, 브라우저, GitHub, database 같은 권한을 agent 루프에 추가하는 것이므로 공급망·토큰·네트워크 경계를 확인해야 한다.
- **memory/skills**: user/project memory와 Markdown skill은 편하지만, 장기 context와 agent instruction을 prefix에 고정한다. 사내 repo에서는 어떤 기억과 skill이 주입되는지 확인해야 한다.
- **remote channel**: README에는 QQ channel setup이 있고 `.env.example`에는 optional Telegram remote channel 변수가 보인다. 메신저를 붙이면 외부 메시지가 현재 session에 들어올 수 있으므로 allowlist와 bot credential을 최소 범위로 둬야 한다.

## 내 판단

DeepSeek를 주력으로 쓰고 “에이전트를 오래 켜둔 채 작은 수정·검색·테스트를 계속 반복하는” 개발자라면 Reasonix는 꽤 선명한 시도다. 범용 multi-provider 대신 DeepSeek cache mechanics에 제품 전체를 맞춘 덕분에, cache hit와 비용을 실제 UX 요소로 다루는 점이 좋다. MCP, skills, memory, hooks까지 들어 있어 에이전트 런타임으로 확장할 여지도 크다.

반대로 Anthropic/OpenAI/Gemini를 자유롭게 섞어 쓰고 싶거나, IDE 안의 tight integration을 원하거나, 회사 정책상 unsigned desktop app·메신저 remote channel·MCP tool 권한을 바로 열기 어려운 환경이라면 신중하게 봐야 한다. 처음에는 작은 throwaway repo에서 `npx reasonix code`, `reasonix doctor`, edit review, shell allowlist, cost stats를 확인한 뒤 실제 업무 repo로 가져가는 접근을 추천한다.

## 참고한 공개 자료

- [esengine/DeepSeek-Reasonix GitHub repository](https://github.com/esengine/DeepSeek-Reasonix)
- [Reasonix official website](https://esengine.github.io/DeepSeek-Reasonix/)
- [Reasonix configuration guide](https://esengine.github.io/DeepSeek-Reasonix/configuration.html)
- [Reasonix architecture document](https://github.com/esengine/DeepSeek-Reasonix/blob/main/docs/ARCHITECTURE.md)
- [Reasonix CLI reference](https://github.com/esengine/DeepSeek-Reasonix/blob/main/docs/CLI-REFERENCE.md)
- [Reasonix security policy](https://github.com/esengine/DeepSeek-Reasonix/blob/main/SECURITY.md)
- [reasonix npm package](https://www.npmjs.com/package/reasonix)
- [DeepSeek-Reasonix desktop-v0.53.0 release](https://github.com/esengine/DeepSeek-Reasonix/releases/tag/desktop-v0.53.0)
