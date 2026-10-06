---
title: "Entire CLI: Git 커밋에 AI 작업 맥락을 연결하기"
date: "2026-10-06T22:21:34"
description: "AI 코딩 세션을 Git checkpoint로 남겨 커밋의 배경을 찾고, 다른 작업자와 세션을 이어가는 오픈소스 CLI."
author: "Sangmin Lee"
repository: "entireio/cli"
sourceUrl: "https://github.com/entireio/cli"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Coding"
  - "Git"
  - "CLI"
  - "Developer Tools"
highlights:
  - "에이전트 세션을 커밋과 연결된 별도 Git checkpoint로 보관"
  - "프롬프트·응답·파일 변경 맥락을 검색하고 세션을 다시 이어가기"
  - "세션 기록은 기본적으로 Git push와 함께 전송되므로 저장 위치를 먼저 확인"
draft: false
---

Entire CLI는 AI 코딩 에이전트의 세션 기록을 Git 커밋과 연결해, 코드 diff뿐 아니라 변경이 만들어진 배경도 나중에 찾도록 돕는 CLI다.[1][2] 에이전트 작업 중 대화·프롬프트와 파일 변경 정보를 기록하고, 커밋이 생기면 해당 작업의 checkpoint를 별도 Git ref에 저장한다.[2]

## 왜 유용한가

`Entire-Checkpoint` trailer가 커밋과 checkpoint를 연결하지만, 세션 데이터 자체는 일반 브랜치 히스토리에 커밋되지 않는다.[2] `entire checkpoint explain`으로 특정 변경의 세션 맥락을 확인하고, `entire search`로 checkpoint·커밋·세션을 검색하거나 `entire session resume <branch>`로 이전 작업을 이어갈 수 있다.[2]

처음 설정하면 `.entire/settings.json`과 Git hook을 구성하고, `entire status`에서 활성 상태와 checkpoint 전송 대상을 확인한다.[2]

## 설치와 첫 사용법

macOS/Linux에서는 공식 Homebrew cask를 설치한 뒤 저장소에서 에이전트 연동을 켠다.[2] Windows용 PowerShell 설치 경로도 제공된다.[2]

```bash
brew install --cask entireio/tap/entire
cd your-project
entire enable --agent codex
entire status
```

Stable 채널이 Homebrew와 기본 설치 스크립트의 기본값이며, 더 자주 바뀌는 nightly 채널도 따로 있다.[2]

현재 README는 Antigravity, Claude Code, Codex, Copilot CLI, Cursor, Factory AI Droid, OpenCode, Pi 연동을 안내한다.[2] Pi는 preview다.[2] Gemini CLI 지원은 제거됐지만 이전에 기록한 Gemini checkpoint는 읽을 수 있다.[5]

## 도입 전에 꼭 볼 점

“브랜치 기록과 분리된다”는 말이 “로컬에만 남는다”는 뜻은 아니다.[2] checkpoint는 기본적으로 Git push 때 선택된 단일 remote로 자동 전송되며, `entire status`에서 목적지와 미전송 개수를 볼 수 있다.[2]

세션에는 사용자 프롬프트와 대화 기록이 포함될 수 있다.[2] public repository에 올라간 데이터는 누구나 볼 수 있다.[3]

- 공개 코드 저장소라면 세션 저장용 private repository를 따로 지정한다.[2]

  ```bash
  entire configure --checkpoint-remote github:ORG/checkpoints-private
  ```

- 세션 기록을 push하지 않으려면 `entire configure --skip-push-sessions`를 설정한다.[2] 동료와 checkpoint를 공유하거나 다른 컴퓨터에서 이어가는 기능은 제한될 수 있다.[2]
- 자동 secret redaction은 완벽하지 않다.[3] 임시 shadow branch의 코드 snapshot은 원본 blob으로 남고 Entire가 push하지 않지만, 직접 push하지 말아야 한다.[2][3]

저장소는 MIT 라이선스다.[4]

## 내 판단

에이전트가 만든 변경을 나중에 설명하거나, 팀원이 작업을 이어받을 때 대화 맥락까지 남기고 싶은 개발팀에 유용하다.[2] 먼저 비공개 테스트 저장소에서 checkpoint remote와 `entire status`를 확인한 뒤 실제 프로젝트에 적용하는 편이 안전하다.[2]

특히 공개 저장소에서는 기록을 켜기 전에 push 대상과 redaction 한계를 확인하자.[2][3]

## Sources

[1] https://github.com/entireio/cli — Entire CLI GitHub repository

[2] https://raw.githubusercontent.com/entireio/cli/main/README.md — Entire CLI README

[3] https://raw.githubusercontent.com/entireio/cli/main/docs/security-and-privacy.md — Entire CLI Security & Privacy

[4] https://raw.githubusercontent.com/entireio/cli/main/LICENSE — Entire CLI LICENSE

[5] https://github.com/entireio/cli/commit/844e915630d4068a2b00f8da7973d387a3988688 — Remove Gemini CLI support commit
