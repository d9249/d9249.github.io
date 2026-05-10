---
title: "CodexBar는 AI 코딩 한도를 메뉴바에 고정하는 사용량 모니터다"
date: "2026-05-10T22:15:42"
description: "CodexBar는 Codex, Claude, Cursor, Gemini, Copilot, OpenRouter 등 AI 코딩 도구의 세션 한도, 주간 한도, 크레딧, 리셋 시간을 macOS 메뉴바와 CLI에서 확인하게 해주는 Swift 기반 오픈소스 앱이다."
author: "Sangmin Lee"
repository: "steipete/CodexBar"
sourceUrl: "https://github.com/steipete/CodexBar"
status: "Active open source"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "AI Coding"
  - "Menu Bar"
  - "Usage Monitoring"
  - "macOS"
  - "CLI"
highlights:
  - "Codex, Claude, Cursor, Gemini, Copilot, OpenRouter 등 여러 AI 코딩 provider의 사용량과 리셋 시간을 한곳에 모은다."
  - "macOS 메뉴바 앱은 provider별 아이콘, 사용량 바, 세션·주간 한도, 크레딧, 비용 추정을 보여준다."
  - "번들 CLI인 codexbar로 스크립트, CI, 대시보드에서도 같은 사용량 데이터를 JSON 또는 텍스트로 가져올 수 있다."
  - "브라우저 쿠키, OAuth, API 키, 로컬 CLI·로그 등 민감한 인증 경로를 다루므로 권한 범위를 이해하고 설정해야 한다."
draft: false
---

`CodexBar`는 AI 코딩 도구를 여러 개 쓰는 개발자를 위한 메뉴바 사용량 모니터다. Codex, Claude, Cursor, Gemini, Copilot, OpenRouter, DeepSeek, Codebuff 같은 provider의 세션 한도, 주간 한도, 크레딧, 리셋 시간을 macOS 메뉴바에서 바로 확인하게 해준다.

핵심 문제는 단순하다. AI 코딩 도구를 하루 종일 쓰다 보면 “지금 긴 작업을 시작해도 되는가?”, “세션 리셋은 언제인가?”, “Claude와 Codex 중 무엇을 먼저 써야 하는가?”를 자주 확인하게 된다. CodexBar는 이 정보를 브라우저 대시보드 여러 개로 흩어 두지 않고 메뉴바의 작은 usage meter로 모은다.

![CodexBar hero](/images/tips/codexbar-social.png)

## 무엇을 보여주나

공식 README의 한 줄 설명은 “Every AI coding limit, in your menu bar.”다. 앱 화면을 보면 provider 탭이 상단에 놓이고, 선택한 provider의 세션 사용량, 주간 사용량, 모델별 한도, 추가 사용량, 오늘 비용과 최근 30일 비용이 카드 형태로 표시된다.

![CodexBar menu popover](/images/tips/codexbar-menu.png)

Claude 예시 화면에서는 다음 정보가 한 번에 보인다.

- `Session`: 현재 세션 사용량과 다음 리셋까지 남은 시간
- `Weekly`: 주간 한도 사용량과 주간 리셋 카운트다운
- `Sonnet`: 모델별 세부 한도
- `Extra usage`: 월별 추가 사용량 또는 크레딧
- `Cost`: 오늘과 최근 30일의 토큰·비용 추정
- `Usage Dashboard`, `Status Page`: provider별 공식 대시보드와 장애 상태로 이동하는 링크

이 흐름은 “사용량을 보고 도구를 고르는” 작업에 맞다. Codex가 곧 리셋된다면 Codex 작업을 조금 미루고, Claude 주간 한도가 넉넉하다면 긴 리팩터링을 Claude에 맡기는 식으로 운영할 수 있다.

## provider를 한곳에 모으는 방식

CodexBar의 장점은 단순히 Codex와 Claude만 다루지 않는다는 점이다. README와 docs 기준으로 Codex, Claude, Cursor, OpenCode, Alibaba Coding Plan, Gemini, Copilot, Kimi, Kilo, Kiro, Vertex AI, Augment, JetBrains AI, Warp, OpenRouter, Perplexity, DeepSeek, Codebuff, Command Code 등 많은 coding provider를 등록해 두었다.

provider마다 사용량을 가져오는 방식은 다르다.

- Codex: OAuth API, Codex CLI RPC/PTy, 선택적으로 OpenAI web dashboard
- Claude: OAuth API, Claude CLI PTY, claude.ai web API
- Gemini: Gemini CLI credentials 기반 OAuth quota API
- Copilot: GitHub device flow와 Copilot internal usage API
- OpenRouter, DeepSeek, Warp 등: API token 기반 credit 또는 quota API
- Cursor, OpenCode, Amp, Perplexity 등: browser cookies 또는 web dashboard 기반 사용량
- JetBrains AI: IDE 설정 디렉터리의 local quota file

즉 CodexBar는 “모든 provider를 같은 API로 호출한다”기보다 provider별로 현실적인 인증·수집 경로를 각각 구현한 앱에 가깝다. 그래서 특정 provider는 웹 세션이 필요하고, 다른 provider는 CLI 로그인이나 API 키가 필요하다.

## CLI도 같이 제공한다

CodexBar는 macOS 메뉴바 앱이지만 `codexbar` CLI도 함께 제공한다. 앱의 Preferences에서 CLI를 설치하거나, 릴리스 tarball과 Homebrew formula로 CLI만 설치할 수 있다. 공식 문서 기준 CLI tarball은 macOS arm64/x86_64와 Linux aarch64/x86_64를 제공한다.

대표적인 사용 예시는 다음과 같다.

```bash
codexbar
codexbar --provider claude
codexbar --provider all --format json --pretty
codexbar cost --provider both --format json --pretty
codexbar config validate
```

이 CLI는 메뉴바 앱과 같은 `~/.codexbar/config.json` 설정을 읽는다. 따라서 단순 표시용 앱을 넘어, 개인 대시보드·CI·스크립트에서 “현재 AI coding quota 상태”를 기계적으로 가져오는 도구로도 쓸 수 있다.

## 설치와 릴리스 상태

최신 GitHub Release는 조사 시점 기준 `v0.24`이며, 릴리스 노트에는 Windsurf, Codebuff, Copilot multi-account, DeepSeek, local provider storage usage, Codex dashboard refresh 개선, CLI tarball 확장 등이 포함되어 있다.

설치 경로는 두 가지가 가장 간단하다.

```bash
brew install --cask steipete/tap/codexbar
```

또는 GitHub Releases에서 `CodexBar-0.24.zip` 같은 앱 릴리스 파일을 내려받을 수 있다. Homebrew cask는 macOS Sonoma 이상을 요구한다. CLI만 쓰고 싶다면 다음 formula도 제공된다.

```bash
brew install steipete/tap/codexbar
```

CLI formula는 macOS와 Linux용 릴리스 tarball을 대상으로 한다. 다만 전체 메뉴바 앱은 macOS 전용이다. README에는 별도 Windows 구현체로 `Win-CodexBar` 링크가 있지만, 이 글에서 다루는 공식 CodexBar 앱 자체는 macOS 중심으로 보는 편이 정확하다.

## 권한과 보안은 반드시 이해해야 한다

CodexBar는 사용량을 보여주기 위해 인증 정보와 로컬 사용 기록 주변을 다룬다. 공식 README의 privacy note는 “전체 파일시스템을 크롤링하지 않고, 관련 기능이 켜졌을 때 알려진 위치의 browser cookies/local storage, provider config files, local JSONL logs 등을 읽는다”고 설명한다.

특히 다음 권한은 사용자가 의식적으로 판단해야 한다.

- **Full Disk Access**: Safari cookie/local storage를 읽어야 하는 web 기반 provider에서 선택적으로 필요하다.
- **Keychain access**: Chromium 계열 브라우저의 Safe Storage key로 쿠키를 복호화하거나, Claude OAuth bootstrap, OAuth/device-flow credential cache에 접근할 때 macOS가 요청할 수 있다.
- **Files & Folders prompts**: 일부 provider CLI나 local probe가 특정 프로젝트 디렉터리에서 실행될 때 macOS가 폴더 접근 권한을 요청할 수 있다.
- **요청하지 않는 권한**: README 기준 CodexBar는 백그라운드에서 Screen Recording이나 Accessibility 권한을 요구하지 않는다고 밝힌다.

![CodexBar Keychain access control](/images/tips/codexbar-keychain-allow.png)

Keychain 알림을 줄이고 싶다면 공식 문서처럼 Keychain Access에서 해당 항목의 Access Control에 `CodexBar.app`만 추가하는 방식이 낫다. “Allow all applications”를 켜는 것은 범위가 너무 넓다. 또한 수동 cookie header나 API key를 `~/.codexbar/config.json`에 넣는 경우, 이 파일은 비밀정보로 취급해야 한다. 공식 docs는 CodexBar가 config 파일을 쓸 때 제한적인 권한을 적용한다고 설명하지만, 사용자가 직접 복사·백업·이슈 첨부를 할 때는 실제 토큰과 쿠키를 절대 포함하면 안 된다.

## 이런 사람에게 잘 맞는다

CodexBar는 AI 코딩 도구를 한두 개만 가볍게 쓰는 사람보다, 여러 provider를 병렬로 돌리며 사용량 한도와 리셋 시간을 실제 운영 변수로 보는 개발자에게 더 잘 맞는다.

좋은 사용 사례는 다음과 같다.

- Codex와 Claude Code를 함께 쓰며 작업을 provider별로 분산한다.
- Cursor, Copilot, Gemini, OpenRouter 등 여러 coding subscription의 남은 quota를 자주 본다.
- “긴 refactor를 지금 시작해도 되는지”를 세션 리셋 시간 기준으로 판단한다.
- provider 상태 페이지와 incident badge를 한 메뉴에서 보고 싶다.
- CLI JSON 출력으로 개인 usage dashboard나 자동화 스크립트를 만들고 싶다.

반대로 브라우저 쿠키 접근, Keychain prompt, local JSONL cost scan 같은 권한 모델이 부담스럽다면 provider별 공식 대시보드만 쓰는 편이 더 단순하다. CodexBar의 가치는 여러 provider를 운영하는 사람에게 커지고, 그만큼 설정과 권한 이해도 함께 필요하다.

## 한 줄 평가

CodexBar는 “AI 코딩 사용량을 눈앞에 계속 띄워 두는 계기판”에 가깝다. macOS 메뉴바에서 세션·주간 한도와 리셋 시간을 바로 보게 해주고, CLI까지 제공해 자동화에도 붙일 수 있다. 다만 쿠키, OAuth, API 키, 로컬 로그를 다루는 도구인 만큼 처음 설정할 때 권한 범위를 꼼꼼히 확인하는 것이 좋다.
