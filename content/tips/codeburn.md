---
title: "CodeBurn은 AI 코딩 토큰 비용을 로컬 대시보드로 보여준다"
date: "2026-05-10T17:54:57"
description: "CodeBurn은 Claude Code, Codex, Cursor 등 AI 코딩 도구의 로컬 세션 로그를 읽어 토큰 사용량, 비용, 모델, 프로젝트, 작업 유형을 TUI와 메뉴바에서 보여주는 오픈소스 비용 관측 도구입니다."
author: "Sangmin Lee"
repository: "getagentseal/codeburn"
sourceUrl: "https://github.com/getagentseal/codeburn"
status: "Open source beta"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Coding"
  - "Cost Tracking"
  - "CLI"
  - "Developer Tools"
  - "Observability"
  - "TUI"
  - "macOS"
highlights:
  - "Claude Code, Codex, Cursor, Gemini CLI, OpenCode 등 여러 AI 코딩 도구의 로컬 세션 데이터를 한 화면에서 비교합니다."
  - "프로젝트, 모델, 작업 유형, core tool, shell command, MCP 서버별 비용과 호출 수를 TUI 대시보드로 보여줍니다."
  - "래퍼나 프록시 없이 디스크의 세션 로그를 읽는 방식이라 기존 AI 코딩 워크플로를 바꾸지 않고 붙일 수 있습니다."
  - "npm, Homebrew, npx 실행을 지원하고 macOS 메뉴바 앱과 GNOME 패널 확장도 함께 제공합니다."
  - "아직 0.9.x 단계라 Node 버전, provider 로그 포맷, macOS/GNOME 보조 앱 상태는 릴리스 노트를 보며 쓰는 편이 좋습니다."
draft: false
---

AI 코딩 도구를 여러 개 쓰기 시작하면 비용 감각이 금방 흐려진다. Claude Code, Codex, Cursor, Gemini CLI를 오가며 작업하다 보면 “이번 달에 어디서 많이 썼지?”, “Opus를 너무 많이 쓴 건가?”, “반복 디버깅 때문에 토큰을 태우고 있나?” 같은 질문이 남는다.

CodeBurn은 이 문제를 로컬 관측 도구로 풀려는 프로젝트다. 기존 AI 코딩 도구 앞에 프록시를 세우거나 API 키를 가로채지 않고, 각 도구가 로컬 디스크에 남기는 세션 데이터를 읽어 토큰 사용량과 비용을 계산한다. 계산된 결과는 터미널 TUI, JSON/CSV export, macOS 메뉴바, GNOME 패널 확장으로 볼 수 있다.

GitHub 기준 TypeScript 기반 오픈소스이며 라이선스는 MIT다. 최신 공개 버전은 npm/GitHub Releases 기준 `0.9.7`이고, macOS 메뉴바 앱도 `mac-v0.9.7` 릴리스 자산으로 배포된다.

![CodeBurn TUI dashboard](/images/tips/codeburn-dashboard.jpg)

## CodeBurn 개요

CodeBurn의 핵심은 “AI 코딩 세션 비용 대시보드”다. README 기준 Claude Code, Claude Desktop, Codex, Cursor, cursor-agent, Gemini CLI, GitHub Copilot, Kiro, OpenCode, OpenClaw, Pi, OMP, Droid, Roo Code, KiloCode, Qwen, Goose, Antigravity, Crush 같은 여러 provider를 지원한다.

대시보드에서는 기간을 Today, 7 Days, 30 Days, Month, 6 Months 또는 명시적 날짜 범위로 바꾸며 볼 수 있다. 화면은 크게 다음 데이터를 보여준다.

- 전체 비용, 호출 수, 세션 수, cache hit 같은 요약 지표
- 날짜별 사용량과 비용 추이
- 프로젝트별 비용과 세션 수
- Coding, Exploration, Debugging, Feature Dev, Refactoring, Testing 같은 작업 유형별 비용
- 모델별 비용과 호출 수
- Bash, Read, Edit, Grep, Write 같은 core tool 사용량
- 자주 실행된 shell command
- MCP 서버 호출 통계

즉 단순히 “총 비용이 얼마인가”에서 멈추지 않고, 어느 프로젝트/모델/작업 패턴이 비용을 만들었는지까지 내려가 볼 수 있다.

## 왜 유용한가

AI 코딩 비용은 계정 청구 페이지에서 보는 총액만으로는 원인을 찾기 어렵다. CodeBurn은 로컬 로그를 활동 단위로 다시 묶어주기 때문에, 비용이 많이 나온 날을 보고 곧바로 “어떤 프로젝트에서 어떤 모델로 어떤 작업을 했는지”를 확인할 수 있다.

특히 유용한 지점은 다음과 같다.

- **프로젝트별 관측**: 여러 repo에서 AI 코딩 도구를 쓰는 사람은 프로젝트별 지출과 세션 수를 나눠 볼 수 있다.
- **모델별 관측**: Opus/Sonnet/Haiku/GPT/Gemini 계열 모델의 비용 비중을 비교할 수 있다.
- **작업 유형 분류**: 편집, 탐색, 디버깅, 기능 개발, 테스트, 리팩터링처럼 실제 개발 활동에 가까운 분류로 비용을 본다.
- **낭비 탐지**: `codeburn optimize`가 반복 파일 읽기, 낮은 Read:Edit 비율, 큰 shell output, 잘 안 쓰는 MCP 서버, bloated `CLAUDE.md`, context-heavy session 같은 패턴을 찾아준다.
- **비교와 회고**: `compare`, `models`, `yield` 명령으로 모델 효율, 생산성 신호, 커밋과 세션의 관계를 볼 수 있다.
- **자동화 친화성**: `--format json`, CSV export, `status --format json`이 있어 개인 대시보드나 스크립트에 붙이기 쉽다.

README가 강조하는 점도 “Everything runs locally. No wrapper, no proxy, no API keys.”다. API 호출 경로를 바꾸지 않고, 이미 남아 있는 세션 파일을 읽는 방식이라 기존 Claude Code나 Codex 사용 습관을 크게 바꾸지 않아도 된다.

## 설치와 첫 사용법

가장 단순한 설치는 npm 전역 설치다.

```bash
npm install -g codeburn
```

Homebrew tap도 제공한다.

```bash
brew tap getagentseal/codeburn
brew install codeburn
```

설치하지 않고 바로 실행할 수도 있다.

```bash
npx codeburn
bunx codeburn
```

README의 requirements에는 Node.js 20+가 적혀 있지만, 현재 npm registry의 `codeburn@0.9.7` 엔진 조건은 Node `>=22`로 배포되어 있다. 새 환경에서는 Node 22 이상으로 맞춰 시도하는 편이 안전하다.

기본 명령은 다음 흐름으로 시작하면 된다.

```bash
codeburn                        # interactive dashboard, 기본 7일
codeburn today                  # 오늘 사용량
codeburn month                  # 이번 달 사용량
codeburn report -p 30days       # 최근 30일
codeburn report -p all          # 긴 기간 보기
codeburn status                 # 오늘/이번 달 compact status
codeburn export                 # CSV export
codeburn report --format json   # JSON report
```

대시보드 안에서는 방향키로 기간을 바꾸고, `q`로 종료한다. `c`는 model comparison, `o`는 optimize 화면으로 들어가는 shortcut이다.

## 메뉴바와 데스크톱 패널

CodeBurn은 CLI가 중심이지만, 데스크톱 표면도 함께 제공한다. macOS에서는 `codeburn menubar` 또는 `npx codeburn menubar`로 최신 `.app`을 GitHub Releases에서 내려받아 `~/Applications`에 설치하고 실행한다.

```bash
npx codeburn menubar
```

공식 macOS README 기준 요구사항은 macOS 14+이고, 네이티브 Swift/SwiftUI 앱은 내부적으로 `codeburn status --format menubar-json --no-optimize`를 주기적으로 실행해 JSON을 읽는다. 메뉴바 아이콘에는 오늘 비용이 표시되고, 팝오버에서는 provider 탭, 기간 선택, Trend/Forecast/Pulse/Stats, 활동/모델 breakdown, export, full report 진입점을 제공한다.

![CodeBurn macOS menubar](/images/tips/codeburn-menubar.png)

Linux GNOME 환경도 별도 확장이 있다. `gnome/` 디렉터리의 install script로 `~/.local/share/gnome-shell/extensions/`에 설치하고, GNOME Shell 45 이상과 `codeburn` CLI가 필요하다. 다만 npm/Homebrew CLI처럼 완전히 패키징된 배포 채널보다는 저장소 기반 설치에 가깝기 때문에, Linux 데스크톱 패널 용도라면 문서를 확인하고 테스트 환경에서 먼저 써보는 편이 좋다.

Windows는 메뉴바 앱이 아니라 CLI 관측 대상으로 보는 편이 맞다. README는 Linux/Windows 경로를 자동 감지한다고 설명하고, Cursor 같은 provider의 Windows 경로도 문서화한다.

## 어떤 데이터를 읽는가

CodeBurn은 provider마다 다른 로컬 저장 형식을 읽는다. 예를 들어 README 기준:

- Claude Code: `~/.claude/projects/<sanitized-path>/<session-id>.jsonl`
- Codex: `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`
- Cursor: `~/Library/Application Support/Cursor/User/globalStorage/state.vscdb`, Linux `~/.config/Cursor/...`, Windows `%APPDATA%/Cursor/...`
- OpenCode: `~/.local/share/opencode/opencode*.db`
- Gemini CLI: `~/.gemini/tmp/<project>/chats/session-*.json` 또는 JSONL 계열
- Roo Code/KiloCode: VS Code globalStorage의 task별 `ui_messages.json`

이 데이터를 모아 dedup, date filtering, provider별 parsing을 거친 뒤 프로젝트/모델/작업 유형으로 집계한다. 가격 계산은 LiteLLM의 model pricing 데이터를 사용하고, 24시간 캐시와 하드코딩 fallback을 둔다.

환경 변수도 실용적이다.

```bash
CLAUDE_CONFIG_DIRS=~/.claude-work:~/.claude-personal codeburn
CODEX_HOME=~/.codex-alt codeburn today
codeburn report --provider claude
codeburn export --provider cursor -f json
```

여러 Claude 계정/프로필을 나눠 쓰는 경우 `CLAUDE_CONFIG_DIRS`로 여러 디렉터리를 한 번에 합산할 수 있는 점이 특히 좋다.

## 활용 포인트

CodeBurn은 “비용 확인”보다 “AI 코딩 습관 디버깅”에 더 가깝게 쓰면 가치가 커진다.

추천하는 사용 패턴은 다음과 같다.

1. 하루가 끝날 때 `codeburn today`로 오늘 비용과 작업 유형을 확인한다.
2. 주간 회고 때 `codeburn report -p 7days`로 프로젝트/모델별 비용을 본다.
3. 비용이 튄 날에는 project와 activity breakdown을 같이 본다.
4. `codeburn optimize -p week`로 반복 read, context bloat, unused MCP, bash output 낭비를 점검한다.
5. 모델을 바꿔가며 쓴 주에는 `codeburn compare`나 `codeburn models`로 비용 대비 효율을 비교한다.
6. Claude Pro/Max, Cursor Pro 같은 플랜 기준으로 보고 싶으면 `codeburn plan set ...`을 설정한다.
7. 팀이나 개인 dashboard에 붙이고 싶으면 `codeburn report --format json` 또는 `codeburn export -f json`을 사용한다.

AI 코딩을 “느낌상 많이 썼다”에서 “어떤 작업이 어떤 비용을 만들었다”로 바꾸는 것이 이 도구의 핵심 효용이다.

## 주의할 점

첫째, 아직 빠르게 움직이는 0.9.x 프로젝트다. GitHub 저장소는 2026년 4월에 만들어졌고, v0.9.7 기준 changelog도 provider 추가, parser 보정, menubar 안정화, optimize detector가 매우 빠르게 갱신되고 있다. 유용하지만 안정화된 장기 운영 도구라기보다는 적극적으로 발전 중인 관측 도구로 보는 편이 맞다.

둘째, 일부 provider는 정확한 token count가 아니라 추정값을 섞는다. README는 Cursor의 Auto mode, Kiro, GitHub Copilot VS Code transcript처럼 모델명이나 token count가 완전히 드러나지 않는 경우를 설명한다. 따라서 dollar amount를 회계 시스템처럼 절대값으로 보기보다는 비용 방향과 이상치 탐지에 쓰는 것이 좋다.

셋째, 로컬 세션 로그에는 프로젝트 경로, 명령어, 대화/작업 흔적이 포함될 수 있다. CodeBurn 자체는 로컬에서 읽는 구조지만, JSON/CSV export를 공유하거나 스크린샷을 올릴 때는 민감한 프로젝트명과 비용 정보가 노출될 수 있다.

넷째, Node 버전 요구사항을 확인해야 한다. README에는 Node.js 20+가 보이지만, 현재 npm 패키지 metadata는 Node `>=22`를 요구한다. 설치가 실패하면 먼저 Node 버전을 확인하는 것이 좋다.

다섯째, 메뉴바/패널 앱은 CLI보다 플랫폼 제약이 크다. macOS 앱은 macOS 14+가 필요하고, GNOME 확장은 Shell 45 이상과 수동 설치 흐름이 필요하다. Windows 사용자는 우선 CLI와 JSON export 중심으로 보는 편이 현실적이다.

## 내 판단

CodeBurn은 AI 코딩 도구를 여러 개 쓰는 개발자에게 꽤 직접적인 효용이 있는 도구다. 특히 Claude Code나 Codex를 매일 쓰고, 모델 선택과 컨텍스트 관리가 비용에 미치는 영향을 보고 싶은 사람에게 잘 맞는다.

추천 대상은 다음과 같다.

- Claude Code, Codex, Cursor, Gemini CLI, OpenCode 등을 함께 쓰는 개발자
- 프로젝트별/모델별 AI 코딩 비용을 보고 싶은 사람
- AI 세션이 반복 디버깅이나 과도한 context read로 새는지 확인하고 싶은 사람
- 로컬에서만 세션 데이터를 읽는 관측 도구를 선호하는 사람
- macOS 메뉴바나 GNOME 패널에 오늘 AI 코딩 비용을 띄워두고 싶은 사람

반대로 AI 코딩 도구를 가끔 쓰거나, 청구 총액만 확인하면 충분한 사람에게는 다소 과한 도구일 수 있다. 또 회사 정책상 로컬 로그 분석, 세션 export, 도구별 사용량 수집 자체가 민감할 수 있다면 먼저 내부 보안 기준을 확인하는 편이 안전하다.

내 기준에서는 “AI 코딩을 많이 쓰는 사람의 개인 FinOps 대시보드”에 가깝다. 매일의 AI 사용량이 실제 개발 생산성으로 이어지는지 점검하고 싶다면 한 번 설치해볼 만하다.

## 참고한 공개 자료

- [getagentseal/codeburn GitHub repository](https://github.com/getagentseal/codeburn)
- [CodeBurn README](https://github.com/getagentseal/codeburn/blob/main/README.md)
- [CodeBurn npm package](https://www.npmjs.com/package/codeburn)
- [CodeBurn latest CLI release v0.9.7](https://github.com/getagentseal/codeburn/releases/tag/v0.9.7)
- [CodeBurn macOS menubar release mac-v0.9.7](https://github.com/getagentseal/codeburn/releases/tag/mac-v0.9.7)
- [CodeBurn architecture docs](https://github.com/getagentseal/codeburn/blob/main/docs/architecture.md)
- [CodeBurn macOS menubar README](https://github.com/getagentseal/codeburn/blob/main/mac/README.md)
- [CodeBurn GNOME extension README](https://github.com/getagentseal/codeburn/blob/main/gnome/README.md)
- [CodeBurn Homebrew tap formula](https://github.com/getagentseal/homebrew-codeburn/blob/main/Formula/codeburn.rb)
- [CodeBurn changelog](https://github.com/getagentseal/codeburn/blob/main/CHANGELOG.md)
