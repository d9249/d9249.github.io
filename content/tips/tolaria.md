---
title: "Tolaria는 Markdown 지식 베이스를 Git-first AI 작업대로 관리한다"
date: "2026-05-10T16:30:57"
description: "Tolaria는 Markdown 지식 베이스를 macOS, Linux, Windows에서 관리하는 데스크톱 앱으로, files-first와 Git-first 구조 위에 AI 에이전트용 문맥 관리까지 얹은 로컬 퍼스트 오픈소스 도구입니다."
author: "Sangmin Lee"
repository: "refactoringhq/tolaria"
sourceUrl: "https://github.com/refactoringhq/tolaria"
status: "Open source"
license: "AGPL-3.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Markdown KB"
  - "Git-first"
  - "Offline-first"
  - "Tauri"
  - "AI Agents"
  - "MCP"
highlights:
  - "Markdown 지식 베이스를 macOS, Linux, Windows에서 관리하는 데스크톱 앱입니다."
  - "Files-first와 Git-first 구조로 노트를 일반 Markdown 파일과 Git 저장소로 다룹니다."
  - "Offline-first, zero lock-in을 내세워 계정, 구독, 클라우드 의존성 없이 동작합니다."
  - "Types as lenses, not schemas 원칙으로 타입을 강제 스키마가 아니라 탐색 보조 수단으로 사용합니다."
  - "Tauri, React, TypeScript 기반의 오픈소스 앱이며 AI-first but not AI-only 방향을 취합니다."
draft: false
---

Markdown 지식 베이스를 Mac과 Linux에서 관리하는 데 초점을 둔 데스크톱 앱이며, 개인용 second brain부터 회사 문서를 AI 컨텍스트로 정리하는 작업까지 겨냥한다.

Files-first와 Git-first 구조를 채택해 노트를 일반 Markdown 파일과 Git 저장소로 다루며, export 없이도 데이터 이식성과 전체 버전 히스토리를 유지한다.

Offline-first, zero lock-in을 전면에 두고 계정, 구독, 클라우드 의존성 없이 완전한 오프라인 동작과 사용자 중심 데이터 소유권을 유지한다.

Types as lenses, not schemas 원칙으로 필수 필드나 강제 검증 없이 탐색 보조 수단으로 타입을 쓰고, AI-first but not AI-only 방향으로 Claude Code와 Codex CLI를 포함한 로컬 CLI 에이전트를 지원한다.

10,000+ 노트 워크스페이스를 실제 운영하며 부딪힌 문제를 바탕으로 기능이 추가됐고, Tauri, React, TypeScript 기반의 오픈소스 앱으로 실사용 중심 설계가 드러난다.

![Tolaria repository](https://opengraph.githubassets.com/tolaria-tip/refactoringhq/tolaria)

![Tolaria desktop interface](/images/tips/tolaria-interface.png)

## Tolaria 개요

Tolaria는 Markdown 지식 베이스를 macOS, Linux, Windows에서 관리하는 데 초점을 둔 데스크톱 앱이다. 개인용 second brain, 회사 문서를 AI용 컨텍스트로 정리하는 용도, OpenClaw와 assistants의 메모리 및 절차 저장에 맞춰 설계됐다.

대규모 10,000+ 노트 워크스페이스를 실제로 운영하는 과정에서 만들어졌고, 모든 기능도 실사용 중 부딪힌 문제를 해결하는 방향으로 추가됐다. 그래서 제품의 방향도 "노트 앱"보다 "파일 기반 지식 작업대"에 가깝다.

짧은 사용 흐름 자료도 함께 제공된다.

- [How I Organize My Own Tolaria Workspace](https://www.loom.com/share/bb3aaffa238b4be0bd62e4464bca2528)
- [My Inbox Workflow](https://www.loom.com/share/dffda263317b4fa8b47b59cdf9330571)
- [How I Save Web Resources to Tolaria](https://www.loom.com/share/8a3c1776f801402ebbf4d7b0f31e9882)

## 핵심 원칙

Files-first 원칙을 따르며, 노트는 일반 Markdown 파일로 저장된다. 데이터 이식이 가능하고 어떤 편집기와도 함께 쓸 수 있다. 별도 export 단계가 필요 없고, 데이터 소유권도 앱이 아니라 사용자에게 남는다.

Git-first 구조를 채택해 각 vault를 Git 저장소로 다룬다. 전체 버전 히스토리를 유지할 수 있고, 어떤 Git remote도 사용할 수 있으며, Tolaria 서버에도 의존하지 않는다.

Offline-first, zero lock-in을 전면에 둔다. 계정, 구독, 클라우드 의존성이 없고, vault가 완전히 오프라인으로 동작한다. 사용을 중단해도 데이터 손실이 없도록 Markdown 파일과 Git 이력을 사용자가 그대로 보유한다.

오픈소스로 공개되어 있으며 무료로 제공된다. 다만 라이선스는 AGPL-3.0-or-later이므로 상업적 재배포나 수정본 운영을 고려한다면 별도 검토가 필요하다.

Standards-based 설계를 적용해 노트 형식을 Markdown과 YAML frontmatter로 유지한다. 독점 포맷을 쓰지 않기 때문에 Tolaria를 떠나더라도 표준 도구와 함께 계속 활용할 수 있다.

Types as lenses, not schemas 원칙을 두고, 타입을 강제 스키마가 아니라 탐색 보조 수단으로 사용한다. 필수 필드가 없고 검증을 강제하지 않으며, 노트를 더 쉽게 찾기 위한 범주 역할에 머문다.

AI-first but not AI-only 방향을 취한다. 파일 기반 vault가 AI 에이전트와 잘 맞도록 설계됐지만, 특정 AI 제품에 종속되지는 않는다. Claude Code와 Codex CLI를 포함한 로컬 CLI 에이전트 흐름을 지원하고, 다른 AI 도구도 vault의 파일을 직접 읽고 수정할 수 있다.

Keyboard-first 사용성을 강조한다. 키보드 중심 작업을 원하는 power-user를 겨냥하며, Editor와 Command Palette 설계에도 이 원칙이 반영되어 있다.

## 구조와 구현

Tolaria는 Tauri, React, TypeScript로 구현된다. 데스크톱 셸은 Tauri v2를 사용하고, 프론트엔드는 React와 TypeScript를 중심으로 구성된다. 저장소에는 앱 코드뿐 아니라 `src-tauri`, `mcp-server`, `site`, `docs`, `demo-vault-v2` 같은 디렉터리가 함께 존재한다.

vault는 Tolaria가 읽고 쓰는 폴더이며, 파일 시스템이 source of truth다. 앱 상태와 캐시는 파일에서 파생되는 보조 계층이고, 충돌이나 불일치가 생기면 디스크 위의 Markdown 파일이 기준이 된다.

노트는 Markdown 파일이고, 구조화된 정보는 YAML frontmatter로 표현된다. 예를 들어 `type`, `status`, `url`, `date`, `belongs_to`, `related_to`, `has` 같은 필드가 관례적으로 쓰인다.

```md
---
type: Project
status: Active
belongs_to:
  - "[[workspace]]"
url: "https://example.com"
---

# Launch Documentation

문서화할 내용과 다음 액션을 적는다.
```

기술 문서 묶음도 함께 제공된다.

- `ARCHITECTURE.md`: 시스템 설계, 기술 스택, 데이터 흐름
- `ABSTRACTIONS.md`: 핵심 추상화와 모델
- `GETTING-STARTED.md`: 코드베이스 탐색 방법
- `ADRs`: 아키텍처 결정 기록

## 설치와 첫 사용법

최신 배포본은 latest release에서 내려받을 수 있다. macOS에서는 Homebrew cask가 가장 간단하다.

```bash
brew install --cask tolaria
```

Windows와 Linux는 공식 다운로드 페이지에서 최신 stable build를 받는 방식이 기본이다. macOS는 주 개발 타깃이고, Windows와 Linux도 release pipeline을 통해 지원된다. Linux는 배포판별 WebKitGTK, 입력기, 데스크톱 통합 상태에 따라 차이가 날 수 있다.

첫 실행 시 getting started vault를 clone할 기회가 주어지며, 이를 통해 앱 전체 흐름을 둘러볼 수 있다. 기존 Markdown 폴더가 있다면 해당 폴더를 vault로 열 수도 있다.

추천 사용 흐름은 다음과 같다.

1. `~/Documents/TolariaVault`처럼 독립된 폴더를 만든다.
2. Getting Started vault로 기본 UI와 Command Palette를 익힌다.
3. 새 vault를 만들고 `Project`, `Source`, `Person`, `Procedure`, `Decision` 같은 기본 타입을 정한다.
4. `Cmd+N` 또는 `Ctrl+N`으로 빠르게 노트를 캡처한다.
5. 제목은 첫 번째 H1로 명확히 쓴다.
6. 정리가 필요한 노트에는 `type`, `status`, `url`, `belongs_to`, `related_to`를 frontmatter에 붙인다.
7. 관련 노트는 본문에서 `[[wikilinks]]`로 연결한다.
8. Git surface에서 변경사항을 확인하고 첫 commit을 만든다.
9. 여러 기기에서 쓰려면 GitHub 같은 remote를 연결해 push/pull 흐름을 만든다.

Command Palette는 `Cmd+K` 또는 `Ctrl+K`로 여는 것이 기본이다. Tolaria는 keyboard-first 제품을 지향하므로, 새 노트 생성, 검색, vault reload, Git 관련 작업, AI 호출 같은 주요 동작은 command palette 중심으로 익히는 편이 좋다.

## 활용법

개인용 second brain으로 사용할 수 있다. 매일 떠오르는 아이디어, 읽은 글, 프로젝트 메모, 회고, 결정 기록을 Markdown 노트로 남기고, `type`, `status`, `related_to` 같은 frontmatter로 점진적으로 정리한다.

회사 문서를 AI 컨텍스트로 정리하는 용도로도 쓸 수 있다. 제품 결정 기록, 운영 절차, 고객별 메모, 온보딩 문서, 반복 대응 절차를 Markdown vault에 두면 AI 에이전트가 읽고 수정하기 쉬운 파일 기반 컨텍스트가 된다.

AI 에이전트용 작업 메모리로도 적합하다. Codex나 Claude Code를 자주 쓰는 사람이라면 프로젝트 배경, 선호하는 코드 스타일, 배포 체크리스트, 리뷰 기준, 반복 작업 절차를 vault 안에 `Procedure`, `Project`, `Decision`, `Checklist` 노트로 둘 수 있다.

GitHub 라이브러리 분석 노트로도 잘 맞는다. 저장소 하나를 `Source` 타입 노트로 만들고, URL, status, related topic을 frontmatter에 넣으면 OSS 조사 기록이 시간이 지나도 재사용 가능한 데이터베이스가 된다.

좋은 기본 패턴은 다음과 같다.

```yaml
type: Source
status: Reading
url: "https://github.com/refactoringhq/tolaria"
related_to:
  - "[[local-first-tools]]"
  - "[[ai-agent-memory]]"
```

이런 식으로 정리하면 Tolaria는 일반 메모 앱보다 "나중에 다시 찾아 쓸 수 있는 작업 그래프"에 가까워진다.

예를 들어 AI 작업용 vault에는 다음 같은 노트를 둘 수 있다.

- `AGENTS.md 작성 규칙`
- `블로그 글 발행 체크리스트`
- `GitHub Pages 배포 확인 절차`
- `AI 논문 리뷰 글 구조`
- `프로젝트별 금지사항과 선호사항`

이런 노트는 단순 기록이 아니다. 에이전트에게 "이 vault에서 관련 절차를 찾아서 현재 작업에 맞게 적용해줘"라고 요청할 수 있는 실행 맥락이 된다. AI가 vault를 고쳤다면 사람이 변경사항을 보고, 작은 commit으로 남기고, 문제가 있으면 되돌릴 수 있다.

## 개발 환경 관련 사항

로컬 개발 전제 조건으로 Node.js 20+, pnpm 8+, Rust stable, macOS 또는 Linux 개발 환경이 요구된다.

Linux에서는 Tauri 2 실행을 위해 WebKit2GTK 4.1과 GTK 3가 필요하다. 공식 README에는 Arch / Manjaro, Debian / Ubuntu 22.04+, Fedora 38+용 시스템 의존성 설치 예시가 포함되어 있다.

번들된 MCP server는 Linux 런타임에서 시스템 `node` 바이너리를 실행하므로, 외부 AI 도구 흐름을 쓰려면 배포판 패키지 관리자로 Node를 설치해야 한다.

빠른 시작 명령도 포함되어 있다.

```bash
pnpm install
pnpm dev
```

브라우저 기반 mock mode는 `http://localhost:5173`에서 열리고, 네이티브 데스크톱 앱은 다음 명령으로 실행할 수 있다.

```bash
pnpm tauri dev
```

## 보안과 라이선스

라이선스는 AGPL-3.0-or-later를 따른다.

Tolaria 이름과 로고는 프로젝트의 trademark policy 적용을 받는다.

보안 이슈는 공개 이슈가 아니라 프로젝트의 security policy에 따라 비공개로 제보하도록 안내되어 있다.

## 내 판단

Tolaria는 "문서를 예쁘게 쓰는 앱"보다 AI 시대의 로컬 지식 작업대에 가깝다. Markdown으로 남기고, Git으로 추적하고, AI 에이전트가 읽고 고칠 수 있게 하며, 사람이 diff로 검토하는 흐름이 핵심이다.

추천하는 사용자는 명확하다. 개인 지식베이스를 장기 자산으로 관리하고 싶은 사람, Git 기반 문서 운영에 거부감이 없는 사람, AI 에이전트에게 줄 절차와 맥락을 로컬 파일로 정리하고 싶은 사람, OSS/논문/도구 분석 노트를 계속 축적하는 사람에게 적합하다.

반대로 가입하면 바로 동기화되고, 팀원이 동시에 편집하고, 모바일에서 빠르게 메모하는 SaaS형 경험을 원한다면 Tolaria는 다소 공학적인 도구처럼 느껴질 수 있다. 하지만 데이터 소유권, 이식성, Git history, AI agent compatibility를 중요하게 본다면 충분히 살펴볼 만한 프로젝트다.

## 참고한 공개 자료

- [refactoringhq/tolaria GitHub repository](https://github.com/refactoringhq/tolaria)
- [Tolaria official site](https://tolaria.md/)
- [Install Tolaria](https://tolaria.md/start/install)
- [Vaults concept](https://tolaria.md/concepts/vaults)
- [Git concept](https://tolaria.md/concepts/git)
- [AI concept](https://tolaria.md/concepts/ai)
- [Use the AI](https://tolaria.md/guides/use-ai-panel)
- [Manage Git manually or with AutoGit](https://tolaria.md/guides/commit-and-push)
- [File layout reference](https://tolaria.md/reference/file-layout)
- [Architecture document](https://github.com/refactoringhq/tolaria/blob/main/docs/ARCHITECTURE.md)
