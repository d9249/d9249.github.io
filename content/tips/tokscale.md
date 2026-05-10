---
title: "Tokscale은 AI 코딩 도구의 토큰 사용량을 한곳에서 보여준다"
date: "2026-05-10"
description: "Tokscale은 Claude Code, Codex, Cursor, Gemini, OpenCode, Hermes Agent 등 여러 AI 코딩 도구의 로컬 세션 로그를 읽어 토큰 사용량, 비용, 모델별 비중, 기여 그래프를 TUI와 웹 대시보드로 보여주는 오픈소스 CLI입니다."
author: "Sangmin Lee"
repository: "junhoyeo/tokscale"
sourceUrl: "https://github.com/junhoyeo/tokscale"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "CLI"
  - "Developer Tools"
  - "AI Agents"
  - "Token Usage"
  - "Cost Tracking"
  - "TUI"
  - "Rust"
highlights:
  - "Claude Code, Codex, Cursor, Gemini, OpenCode, Hermes Agent 등 여러 AI 코딩 도구의 사용량을 한곳에서 집계합니다."
  - "Rust native core와 Ratatui TUI로 모델별 비용, 날짜별 토큰, 캐시 토큰, 기여 그래프를 빠르게 탐색합니다."
  - "npx, bunx, Deno로 바로 실행할 수 있고 macOS, Linux, Windows용 native optional package를 제공합니다."
  - "LiteLLM/OpenRouter 가격 데이터를 이용해 비용을 추정하고 JSON export, headless Codex 수집, 날짜/클라이언트 필터를 지원합니다."
  - "리더보드 제출과 Cursor 연동은 계정 토큰·로컬 로그를 다루므로 공개 업로드 전 데이터 범위를 확인해야 합니다."
draft: false
---

AI 코딩 도구를 여러 개 쓰기 시작하면 “이번 달에 내가 어떤 모델을 얼마나 썼는지”가 금방 흐려진다. Claude Code, Codex CLI, Cursor, Gemini CLI, OpenCode, OpenClaw, Hermes Agent처럼 도구마다 로그 위치와 토큰 기록 방식이 다르기 때문이다.

Tokscale은 이 흩어진 사용량을 한곳에 모아 보여주는 CLI다. 로컬 세션 파일과 SQLite DB를 읽어 입력 토큰, 출력 토큰, cache read/write, reasoning token, 비용 추정치를 집계하고, 터미널 TUI와 웹 시각화로 보여준다.

저장소 기준 Rust가 핵심 구현이고, npm에는 `tokscale` alias package와 `@tokscale/cli` 패키지가 배포되어 있다. 최신 릴리스와 npm 버전은 `v2.1.1`이며, 라이선스는 MIT다.

![Tokscale hero](/images/tips/tokscale-hero.png)

## Tokscale 개요

Tokscale은 AI 코딩 도구 사용량을 “개발자의 토큰 계기판”처럼 보여준다. README의 표현을 빌리면, Kardashev scale이 문명의 에너지 사용량을 보는 척도라면 Tokscale은 AI 개발자의 토큰 사용량을 보는 척도다.

지원 대상으로 명시된 클라이언트는 꽤 넓다.

- OpenCode
- Claude Code
- OpenClaw
- Codex CLI
- GitHub Copilot CLI
- Hermes Agent
- Gemini CLI
- Cursor IDE
- Amp / Codebuff / Droid / Pi / Kimi / Qwen
- Roo Code / Kilo / Kilo CLI / Mux / Crush / Goose / Antigravity / Synthetic 등

핵심은 단순히 총 토큰을 더하는 것이 아니다. 모델별 비용 비중, 날짜별 사용량, 클라이언트별 필터, cache token, reasoning token, JSON export, contribution graph까지 분석 단위를 여러 층으로 제공한다.

## TUI에서 무엇을 볼 수 있나

![Tokscale TUI overview](/images/tips/tokscale-tui-overview.png)

기본 실행은 인터랙티브 TUI다.

```bash
npx tokscale@latest
```

또는 Bun과 Deno로도 바로 실행할 수 있다.

```bash
bunx tokscale@latest
deno x npm:tokscale@latest
```

TUI 화면은 `Overview`, `Models`, `Daily`, `Hourly`, `Stats`, `Agents` 같은 뷰를 제공한다. Overview에서는 날짜별 토큰 막대그래프와 모델별 비용 순위를 함께 보여준다. 각 모델 행에는 input, output, cache read, cache write 같은 토큰 세부 항목이 붙고, 하단에는 총 토큰 수와 총 비용이 요약된다.

자주 쓰는 조작도 TUI 안에서 해결된다.

- `1-6`, 방향키, Tab으로 뷰 전환
- `c/d/t`로 비용·날짜·토큰 기준 정렬
- `s`로 source picker 열기
- `g`로 group-by 전략 변경
- `p`로 색상 테마 변경
- `r`로 refresh
- `e`로 JSON export
- `q`로 종료

터미널에서 표만 보고 싶으면 light mode를 쓰면 된다.

```bash
tokscale --light
tokscale models --light
```

스크립트나 자동화에서는 JSON 출력이 더 유용하다.

```bash
tokscale --json
tokscale models --json > report.json
tokscale graph --output data.json
```

## 왜 유용한가

Tokscale의 실용성은 여러 AI 코딩 도구를 섞어 쓸 때 커진다. 예를 들어 Claude Code로 설계하고, Codex CLI로 리팩터링하고, Cursor에서 일부 수정하고, Gemini CLI로 긴 컨텍스트 확인을 했다면 사용량은 각 도구의 로컬 로그에 흩어진다. Tokscale은 그 로그들을 도구별 포맷에 맞춰 읽고 하나의 보고서로 합친다.

특히 좋은 지점은 다음과 같다.

- **모델별 비용 감각**: 어떤 모델이 비용을 크게 만드는지 비용 순으로 확인한다.
- **날짜별 사용량**: 특정 날짜에 토큰이 튄 이유를 추적한다.
- **클라이언트 필터**: `--client claude,codex`처럼 도구별로 범위를 좁힌다.
- **가격 조회**: LiteLLM/OpenRouter 가격 데이터와 Cursor 모델 가격 fallback을 이용한다.
- **기여 그래프**: GitHub 잔디밭처럼 AI 사용량 패턴을 시각화한다.
- **JSON export**: 개인 대시보드나 비용 리포트에 다시 넣을 수 있다.

예를 들어 Claude Code와 OpenCode만 보고 싶다면 다음처럼 실행한다.

```bash
tokscale --client claude,opencode --week
tokscale models --client claude,codex --month --json
```

날짜 범위도 직접 줄 수 있다.

```bash
tokscale --today
tokscale --week
tokscale --month
tokscale --since 2026-01-01 --until 2026-01-31
```

모델 가격만 확인하는 명령도 있다.

```bash
tokscale pricing "claude-3-5-sonnet-20241022"
tokscale pricing "gpt-4o"
tokscale pricing "grok-code" --provider openrouter
```

## 웹 시각화와 리더보드

![Tokscale contribution graph](/images/tips/tokscale-contributions-graph.png)

Tokscale은 로컬 CLI에서 끝나지 않고 웹 시각화와 social platform도 제공한다. contribution graph는 GitHub 잔디밭 UI를 AI 토큰 사용량에 맞게 바꾼 형태다. 2D/3D 보기 전환, 색상 팔레트, 도구별 필터, 날짜별 상세 breakdown, 총 비용과 active days, streak 같은 지표를 보여준다.

공개 프로필이나 리더보드에 참여하고 싶다면 로그인 후 데이터를 제출할 수 있다.

```bash
# GitHub auth로 로그인
tokscale login

# 제출 전 미리보기
tokscale submit --dry-run

# 실제 제출
tokscale submit
```

CI나 headless 환경에서는 API token을 쓸 수 있다.

```bash
TOKSCALE_API_TOKEN=*** tokscale submit
```

GitHub 프로필 README에 Tokscale stats를 넣는 embed/badge URL도 제공한다.

```md
[![Tokscale Stats](https://tokscale.ai/api/embed/<username>/svg)](https://tokscale.ai/u/<username>)
![Tokscale Tokens](https://tokscale.ai/api/badge/<username>/svg)
```

다만 이 기능은 로컬 사용량 일부를 공개 서비스에 올리는 흐름이다. 기본 로컬 분석만 쓸 때와 `submit`으로 업로드할 때의 데이터 경계는 반드시 구분해야 한다.

## 설치와 패키지 구조

Tokscale은 npm에서 바로 실행하는 방식이 가장 간단하다.

```bash
npx tokscale@latest
bunx tokscale@latest
deno x npm:tokscale@latest
```

npm metadata 기준 `tokscale`은 alias package이고 실제 CLI는 `@tokscale/cli`다. `@tokscale/cli`는 플랫폼별 native optional dependency를 제공한다.

- `@tokscale/cli-darwin-arm64`
- `@tokscale/cli-darwin-x64`
- `@tokscale/cli-linux-x64-gnu`
- `@tokscale/cli-linux-x64-musl`
- `@tokscale/cli-linux-arm64-gnu`
- `@tokscale/cli-linux-arm64-musl`
- `@tokscale/cli-win32-x64-msvc`
- `@tokscale/cli-win32-arm64-msvc`

README의 native module target 표도 macOS x86_64/aarch64, Linux glibc/musl x86_64/aarch64, Windows x86_64/aarch64를 지원 대상으로 적고 있다. 개발 빌드는 Bun과 Rust toolchain을 요구하지만, 일반 실행은 prebuilt native package를 받는 방식이다.

소스에서 개발하려면 다음 흐름을 쓴다.

```bash
git clone https://github.com/junhoyeo/tokscale.git
cd tokscale
bun install
bun run build:core
bun run cli
```

## 데이터 소스와 보존 이슈

Tokscale은 각 도구가 남기는 로컬 로그를 읽는다. 예를 들어 README 기준 주요 위치는 다음과 같다.

- Claude Code: `~/.claude/projects/`, `~/.claude/transcripts/`
- Codex CLI: `~/.codex/sessions/`
- OpenCode: `~/.local/share/opencode/opencode.db` 또는 legacy message storage
- Hermes Agent: `$HERMES_HOME/state.db` 또는 `~/.hermes/state.db`
- Gemini CLI: `~/.gemini/tmp/*/chats/*.json`
- Cursor IDE: `~/.config/tokscale/cursor-cache/`로 API sync
- OpenClaw: `~/.openclaw/agents/`와 legacy `.clawdbot`, `.moltbot`, `.moldbot`

기본 경로 밖에 있는 세션도 설정으로 추가할 수 있다.

```bash
TOKSCALE_EXTRA_DIRS='codex:/Users/me/workspace/project-a/.codex/sessions,gemini:/Users/me/imports/imac/gemini/tmp' tokscale
```

또는 `~/.config/tokscale/settings.json`의 `scanner.extraScanPaths`에 지속 설정을 둘 수 있다.

한 가지 중요한 점은 세션 보존 기간이다. README는 Claude Code의 기본 cleanup period가 30일일 수 있다고 설명하고, 장기 추적을 원한다면 설정에서 보존 기간을 늘리라고 안내한다. 반대로 Codex CLI와 OpenCode는 자동 cleanup이 없다고 설명되어 있다. 정확한 월별 사용량을 보고 싶다면, 각 도구의 로그 보존 정책부터 확인하는 편이 좋다.

## 주의할 점

Tokscale은 로컬 로그를 읽는 도구다. 토큰 수와 비용만 보는 것처럼 느껴질 수 있지만, 로그 경로에는 프로젝트 경로, 모델명, provider, timestamp, 메시지 메타데이터가 함께 들어 있을 수 있다. 따라서 다음 구분이 중요하다.

- 로컬 TUI/JSON 분석: 내 머신에서 로그를 읽어 요약한다.
- `tokscale submit`: 사용량 데이터를 Tokscale social platform에 업로드한다.
- `tokscale cursor login`: Cursor session token을 입력하고 Cursor API sync를 수행한다.

특히 Cursor session token은 README에서도 비밀번호처럼 취급하라고 경고한다. 공개 스크린샷, GitHub 이슈, 블로그 글, dotfiles에 절대 넣으면 안 된다.

비용 계산도 “청구서 원본”이라기보다는 가격 데이터 기반 추정치로 보는 편이 안전하다. Tokscale은 LiteLLM pricing data, OpenRouter fallback, Cursor 모델 가격 보정 등을 사용하지만, 실제 결제 금액은 provider의 할인, enterprise 계약, 캐시 정책, 내부 크레딧 처리에 따라 다를 수 있다.

또 하나는 실행 자체다. 내가 이 글을 쓰면서 로컬에서 `tokscale`을 직접 실행하지 않은 이유도 여기에 있다. 실행하면 현재 머신의 AI 도구 사용 로그를 읽을 수 있기 때문이다. 처음 써볼 때는 `--client`, `--since`, `--json`, `submit --dry-run`으로 범위를 좁히고 어떤 데이터가 나오는지 먼저 확인하는 편이 안전하다.

## 내 판단

Tokscale은 AI 코딩 도구를 “비용 없이 마법처럼 쓰는 것”이 아니라, 실제 자원 사용량이 있는 개발 인프라로 바라보게 해주는 도구다. 특히 여러 CLI와 에디터를 함께 쓰는 사람, 모델별 비용 차이를 체감하고 싶은 사람, 팀/개인 단위로 AI 사용량 리포트를 만들고 싶은 사람에게 유용하다.

추천 대상은 다음과 같다.

- Claude Code, Codex, Cursor, Gemini, OpenCode 등을 함께 쓰는 개발자
- 모델별 비용과 cache token 비중을 확인하고 싶은 사람
- AI coding 사용량을 JSON으로 뽑아 개인 대시보드에 넣고 싶은 사람
- headless Codex 실행이나 CI automation의 토큰 사용량을 추적하고 싶은 사람
- GitHub contribution graph처럼 AI 활동량을 시각화하고 싶은 사람

반대로 한 가지 AI 도구만 가끔 쓰거나, 로컬 로그 접근과 공개 리더보드 업로드가 부담스러운 사람에게는 과할 수 있다. 그런 경우에는 `npx tokscale@latest --light`로 로컬 요약만 한 번 확인하고, social 기능은 쓰지 않는 방식이 적당하다.

내 기준에서는 Tokscale이 단순 “토큰 카운터”보다 한 단계 더 나아간다. Rust 기반 파서, 다양한 클라이언트 지원, TUI, 웹 기여 그래프, 리더보드까지 묶어 AI 개발 시대의 개인 사용량 관측 도구로 포지셔닝한 점이 인상적이다.

## 참고한 공개 자료

- [junhoyeo/tokscale GitHub repository](https://github.com/junhoyeo/tokscale)
- [Tokscale README](https://github.com/junhoyeo/tokscale/blob/main/README.md)
- [Tokscale latest release v2.1.1](https://github.com/junhoyeo/tokscale/releases/tag/v2.1.1)
- [tokscale npm package](https://www.npmjs.com/package/tokscale)
- [@tokscale/cli npm package](https://www.npmjs.com/package/@tokscale/cli)
- [Tokscale website](https://tokscale.ai)
- [Tokscale MIT license](https://github.com/junhoyeo/tokscale/blob/main/LICENSE)
