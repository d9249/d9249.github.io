---
title: "Tolaria는 Markdown vault를 Git과 AI 에이전트 작업대로 바꾼다"
date: "2026-05-10"
description: "Tolaria는 Markdown 파일, YAML frontmatter, Git 이력, 로컬/클라우드 AI 모델, CLI 에이전트를 한 vault 위에 묶어 개인 지식베이스와 AI 작업 맥락을 운영하게 해 주는 로컬 퍼스트 데스크톱 앱입니다."
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
  - "macOS, Windows, Linux용 데스크톱 앱이며 macOS는 Homebrew cask로 설치할 수 있습니다."
  - "노트, 타입, 저장된 뷰, 첨부파일을 일반 파일로 다루고 Git으로 이력과 동기화를 관리합니다."
  - "Claude Code, Codex, Gemini CLI 같은 로컬 에이전트와 Ollama, LM Studio, OpenAI 호환 모델을 vault 문맥 위에서 연결합니다."
draft: false
---

AI 도구를 많이 쓰기 시작하면 가장 먼저 무너지는 것은 답변 품질이 아니라 **작업 맥락의 보존 방식**이다. 채팅창마다 좋은 답은 나오지만, 그 답이 다음 작업의 문서, 절차, 결정 기록, 코드 에이전트 지시문으로 자연스럽게 이어지지 않으면 결국 사람은 같은 설명을 계속 반복하게 된다. 개인 노트, 프로젝트 메모, 회의 결정, AI 에이전트용 절차가 서로 다른 앱과 폴더에 흩어져 있으면 "내 지식베이스"가 아니라 "매번 다시 찾아야 하는 자료 더미"가 된다.

`refactoringhq/tolaria`는 이 문제를 Markdown, Git, 로컬 데스크톱 앱, AI 에이전트 연결로 풀어보려는 프로젝트다. 공식 README는 Tolaria를 macOS, Windows, Linux에서 동작하는 Markdown knowledge base 관리 앱으로 소개한다. 사용처도 꽤 분명하다. 개인 second brain, 회사 문서를 AI의 context로 정리하는 용도, OpenClaw나 assistants의 memory/procedure 저장소가 대표 예시로 제시된다.

내가 보기엔 Tolaria를 단순 "예쁜 Markdown 노트 앱"으로 보면 핵심을 놓치기 쉽다. 더 정확히는 **Markdown vault를 사람이 읽는 지식베이스이자 AI 에이전트가 수정할 수 있는 작업 공간으로 만드는 데스크톱 클라이언트**에 가깝다. Obsidian류의 파일 기반 노트 앱, Git 클라이언트, AI 패널, MCP 설정 도구, 로컬/호스티드 모델 연결이 한 제품 안에서 만나는 구조다.

![Tolaria repository](https://opengraph.githubassets.com/tolaria-tip/refactoringhq/tolaria)

## 무엇을 해결하려는가

Tolaria가 겨냥하는 첫 번째 문제는 **지식베이스의 소유권과 이식성**이다. 많은 노트 앱은 앱 안에서는 편하지만, 데이터가 서비스 전용 DB나 동기화 계층에 갇히기 쉽다. Tolaria는 이와 반대로 vault 폴더의 파일 시스템을 source of truth로 둔다. 노트는 Markdown 파일이고, 구조화된 정보는 YAML frontmatter로 들어가며, 첨부파일도 vault 안의 일반 파일로 남는다. 앱 상태와 캐시는 파일에서 파생되는 보조 계층일 뿐, 최종 권위는 디스크 위의 파일에 있다.

두 번째 문제는 **AI 시대의 문서 맥락 관리**다. Codex, Claude Code, Gemini CLI 같은 에이전트는 파일을 읽고 고칠 수 있을 때 훨씬 유용해진다. 그런데 프로젝트 설명, 개인 원칙, 반복 작업 절차, 의사결정 기록이 SaaS 노트 앱 안에만 있으면 에이전트가 자연스럽게 접근하기 어렵다. Tolaria의 vault는 Markdown과 Git을 중심에 두기 때문에, 사람이 편집하고 에이전트가 읽고, 변경사항은 Git diff로 검토하는 흐름이 자연스럽다.

세 번째 문제는 **노트 정리와 실제 운영의 간극**이다. 단순 메모 앱은 생각을 적는 데는 좋지만, 장기적으로 프로젝트, 사람, 자료, 절차, 결정, 회고를 연결하는 운영 도구가 되기는 어렵다. Tolaria는 타입, 관계, wikilink, saved view, Git history, AI panel을 제공해 노트를 "문서 조각"이 아니라 "작업 그래프의 노드"로 다루려 한다. 다만 타입은 강제 schema가 아니라 navigation aid에 가깝다. 즉 완벽한 DB 설계를 먼저 요구하지 않고, 사용자가 점진적으로 구조를 붙일 수 있게 한다.

## 핵심 구조와 동작 방식

Tolaria의 가장 중요한 설계는 **files-first**다. vault는 그냥 폴더다. 그 안에 Markdown 노트, YAML frontmatter, 첨부파일, saved view, type definition이 들어간다. 공식 문서는 Tolaria가 폴더 구조에 강하게 의존하지 않는다고 설명한다. 새 노트는 기본적으로 루트에 만들어질 수 있고, 실제 분류는 폴더보다 frontmatter의 `type`, 관계 필드, wikilink, saved view가 담당한다.

노트 하나는 다음처럼 이해하면 쉽다.

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

첫 번째 H1은 앱 안에서 보이는 주 제목이 되고, frontmatter는 type, status, date, url, belongs_to, related_to 같은 구조 필드를 담는다. 본문에서는 `[[wikilinks]]`로 노트를 연결한다. 중요한 점은 이 모든 것이 Tolaria만 이해하는 폐쇄 포맷이 아니라, 일반 Markdown과 YAML이라는 점이다. 앱을 그만 써도 파일은 남고, VS Code, Obsidian, CLI 검색, GitHub, static site generator 같은 다른 도구로 계속 읽을 수 있다.

두 번째 축은 **Git-first**다. Tolaria는 vault가 Git 저장소일 때 변경 파일, 전체 vault diff, 개별 노트 history, commit, pull, push, conflict handling, remote 연결을 앱 안에서 다루는 lightweight Git client 역할을 한다. Git remote는 GitHub, GitLab, Gitea 등 사용자의 기존 인증 설정을 활용할 수 있다. 아직 remote가 없어도 로컬 commit만으로 복원 지점을 만들 수 있고, 필요하면 나중에 remote를 연결하면 된다.

세 번째 축은 **AI 연결**이다. Tolaria의 AI는 크게 두 경로로 나뉜다. 하나는 Claude Code, Codex, OpenCode, Pi, Gemini CLI 같은 coding agent를 로컬에서 실행해 vault를 읽고 수정하게 하는 방식이다. 다른 하나는 Ollama, LM Studio, OpenAI, Anthropic, Gemini, OpenRouter, OpenAI-compatible endpoint 같은 model provider를 연결해 note context 기반 채팅을 하는 방식이다. 전자는 도구 기반 편집에 가깝고, 후자는 vault 문맥을 참조하는 chat mode에 가깝다.

권한 모델도 실무적으로 나뉜다. coding agent는 Vault Safe mode에서 파일, 검색, 편집 위주로 제한할 수 있고, Power User mode에서는 에이전트가 지원하는 경우 vault 범위의 shell command까지 허용할 수 있다. 반면 direct model target은 note context와 대화 기록은 받지만 vault-write tool이나 shell access는 받지 않는다. AI가 만든 변경사항은 결국 파일 변경이므로, Tolaria의 diff와 Git history로 검토한 뒤 commit하는 흐름이 핵심이다.

기술적으로는 Tauri v2, React, TypeScript, Rust, BlockNote, CodeMirror, tldraw, Mermaid, Tailwind, Radix/shadcn, Vite, MCP SDK 등을 사용하는 데스크톱 앱이다. 저장소 구조도 `src`, `src-tauri`, `mcp-server`, `site`, `docs`, `demo-vault-v2`처럼 실제 제품, 네이티브 백엔드, 문서, MCP 연동, 샘플 vault가 함께 들어 있는 형태다.

## 설치와 첫 사용법

macOS에서는 Homebrew cask가 가장 간단하다.

```bash
brew install --cask tolaria
```

Windows와 Linux는 공식 다운로드 페이지에서 최신 stable build를 받는 방식이 기본이다. 공식 문서 기준 macOS는 주 개발 타깃이고, Windows와 Linux도 release pipeline을 통해 지원된다. Windows는 NSIS installer와 signed updater bundle, Linux는 AppImage와 deb artifact가 제공되는 흐름으로 설명된다. Linux는 배포판별 WebKitGTK, 입력기, 데스크톱 통합 상태에 따라 차이가 날 수 있다는 점은 감안해야 한다.

처음 열었을 때는 두 가지 선택지가 있다. 하나는 Getting Started vault를 받아 앱 전체 흐름을 따라가 보는 것이다. 다른 하나는 이미 갖고 있는 Markdown 폴더를 vault로 여는 것이다. 개인적으로는 바로 기존 노트 폴더를 넣기보다, 먼저 별도의 작은 테스트 vault를 만드는 편이 좋다. Git과 AI를 붙이는 앱이므로, 초반에는 실험 범위를 명확히 잡는 것이 안전하다.

추천 초기 세팅은 다음 순서다.

1. `~/Documents/TolariaVault`처럼 독립된 폴더를 만든다.
2. Getting Started vault를 열어 UI와 command palette를 익힌다.
3. 새 vault를 만들고 `Project`, `Source`, `Person`, `Procedure`, `Decision` 같은 기본 타입을 몇 개 정한다.
4. `Cmd+N` 또는 `Ctrl+N`으로 빠르게 캡처하고, 제목은 H1로 명확히 쓴다.
5. 정리가 필요한 노트에는 `type`, `status`, `url`, `belongs_to`, `related_to`를 frontmatter에 붙인다.
6. 관련 노트는 본문에서 `[[wikilinks]]`로 연결한다.
7. Git surface에서 변경사항을 확인하고 첫 commit을 만든다.
8. 여러 기기에서 쓰려면 GitHub 같은 remote를 연결해 push/pull 흐름을 만든다.

Command Palette는 `Cmd+K` 또는 `Ctrl+K`로 여는 것이 기본이다. Tolaria는 keyboard-first 제품을 지향하므로, 새 노트 생성, 검색, vault reload, Git 관련 작업, AI 호출 같은 주요 동작은 command palette 중심으로 익히는 편이 좋다.

## 활용법 1: 개인 second brain

Tolaria는 개인 지식베이스를 "노트 앱 안의 페이지"가 아니라 "Git으로 versioning되는 Markdown repository"로 운영하고 싶은 사람에게 잘 맞는다. 예를 들어 매일 떠오르는 아이디어는 inbox성 노트로 빠르게 캡처하고, 주간 리뷰 때 `Project`, `Area`, `Source`, `Decision` 같은 타입을 붙여 정리할 수 있다.

이때 폴더를 과하게 설계할 필요는 없다. 공식 문서도 flat vault가 잘 동작한다고 설명한다. 자료가 많아질수록 폴더보다 frontmatter, wikilink, saved view가 더 유연하다. 예를 들어 `status: Active`인 프로젝트만 모아보거나, 특정 사람과 연결된 회의/결정 노트를 따라가거나, 한 소스 자료에서 파생된 아이디어를 연결하는 식이다.

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

## 활용법 2: AI 에이전트용 작업 메모리

Tolaria의 진짜 재미는 AI 에이전트와 붙일 때 나온다. Codex나 Claude Code를 자주 쓰는 사람이라면, 에이전트에게 매번 프로젝트 배경, 선호하는 코드 스타일, 반복 작업 절차, 배포 체크리스트를 설명하는 일이 많다. Tolaria vault에 이런 정보를 `Procedure`, `Project`, `Decision`, `Checklist` 타입으로 정리해 두면, 사람이 읽는 문서와 에이전트가 참고할 컨텍스트를 같은 파일 세트로 유지할 수 있다.

예를 들어 다음 같은 노트를 만들 수 있다.

- `AGENTS.md 작성 규칙`
- `블로그 글 발행 체크리스트`
- `GitHub Pages 배포 확인 절차`
- `AI 논문 리뷰 글 구조`
- `프로젝트별 금지사항과 선호사항`

이런 노트는 단순 기록이 아니다. 에이전트에게 "이 vault에서 관련 절차를 찾아서 현재 작업에 맞게 적용해줘"라고 요청할 수 있는 실행 맥락이 된다. Tolaria가 Git과 diff를 강조하는 이유도 여기 있다. AI가 vault를 고쳤다면 사람이 변경사항을 보고, 작은 commit으로 남기고, 문제가 있으면 되돌릴 수 있어야 한다.

권한은 처음부터 보수적으로 잡는 것이 좋다. vault 문서 정리나 검색 중심 작업은 Vault Safe mode로 시작하고, shell command가 필요한 워크플로우만 Power User mode로 올리는 편이 안전하다. direct model provider는 vault를 직접 수정하지 않는 chat mode로 쓰면 된다.

## 활용법 3: 회사 문서와 팀 컨텍스트

Tolaria는 실시간 협업 문서 도구를 대체하는 제품은 아니다. 하지만 팀이 Git에 익숙하고, 문서를 코드처럼 관리하는 문화가 있다면 꽤 유용한 선택지가 될 수 있다. 예를 들어 사내 운영 문서, 제품 결정 기록, 고객별 메모, 반복 대응 절차, 개발 온보딩 문서를 Markdown vault로 두고 Git remote에 연결하면 된다.

이 방식의 장점은 세 가지다.

첫째, 변경 이력이 명확하다. 어떤 결정 문서가 언제 바뀌었는지 Git history로 확인할 수 있다.

둘째, 도구 독립성이 높다. Tolaria를 쓰는 사람은 앱에서 편집하고, 다른 사람은 VS Code나 GitHub 웹에서 읽어도 된다.

셋째, AI 도입이 자연스럽다. 문서가 Markdown과 Git 안에 있으면 AI 에이전트가 읽고 수정하기 쉽고, 변경사항도 pull request나 commit diff로 검토할 수 있다.

다만 강한 권한 관리, 댓글 기반 실시간 협업, 승인 워크플로우, 문서별 접근제어가 필요한 조직이라면 Notion, Confluence, Google Docs 같은 도구와 역할이 다르다. Tolaria는 "문서 운영을 로컬 파일과 Git 중심으로 가져오고 싶은 팀"에 더 적합하다.

## 활용법 4: 연구 자료와 라이브러리 분석 노트

GitHub 라이브러리, 논문, 모델 카드, 도구 비교를 자주 하는 사람에게도 Tolaria는 잘 맞는다. `Source` 타입을 만들고, 각 저장소나 논문을 하나의 노트로 둔다. `url`, `status`, `tags`, `related_to`, `belongs_to`를 붙이면 나중에 특정 주제의 자료만 다시 묶어볼 수 있다.

예를 들어 이런 식이다.

```yaml
type: Source
status: Reviewed
url: "https://github.com/refactoringhq/tolaria"
related_to:
  - "[[local-first-apps]]"
  - "[[ai-knowledge-base]]"
  - "[[markdown-vault]]"
```

본문에는 "무엇을 해결하는가", "핵심 구조", "사용법", "도입 리스크", "비슷한 도구와의 차이"를 고정 섹션으로 둔다. 이렇게 하면 자료 하나를 읽고 끝내는 것이 아니라, 시간이 지날수록 개인적인 OSS 분석 데이터베이스가 된다. Git으로 관리되므로 특정 분석이 언제 바뀌었는지도 추적할 수 있다.

## 도입할 때 볼 장점과 한계

Tolaria의 장점은 선명하다. 데이터가 Markdown 파일로 남고, Git으로 이력을 관리하고, 오프라인에서도 동작하며, AI 에이전트가 이해하기 쉬운 형태로 지식베이스를 운영할 수 있다. 특히 개발자, 연구자, 기술 블로거, AI 에이전트를 자주 쓰는 사람에게는 "노트 앱"보다 "개인 운영 지식 저장소"로 가치가 크다.

반대로 모두에게 쉬운 도구는 아니다. Git, Markdown, frontmatter, wikilink, vault라는 개념이 낯선 사용자에게는 Notion이나 Apple Notes보다 진입장벽이 높다. 실시간 공동 편집, 모바일 중심 캡처, 복잡한 권한 관리, spreadsheet-like database view를 기대한다면 맞지 않을 수 있다. Windows와 Linux는 지원되지만, 공식 문서상 macOS가 주 개발 타깃이므로 플랫폼별 자잘한 이슈도 감안해야 한다.

라이선스도 확인해야 한다. Tolaria는 AGPL-3.0-or-later로 공개되어 있고, 이름과 로고는 trademark policy의 영향을 받는다. 개인 사용이나 일반적인 오픈소스 사용에는 매력적이지만, 제품에 포함하거나 회사 내부 배포/수정본 운영을 고려한다면 AGPL 의무와 상표 정책을 별도로 검토하는 편이 안전하다.

## 내 판단

Tolaria는 "문서를 예쁘게 쓰는 앱"보다 **AI 시대의 로컬 지식 작업대**에 가깝다. Markdown으로 남기고, Git으로 추적하고, AI 에이전트가 읽고 고칠 수 있게 하며, 사람이 diff로 검토하는 흐름이 핵심이다. 이 조합은 요즘처럼 Codex, Claude Code, Gemini CLI 같은 도구를 여러 프로젝트에 쓰는 사람에게 특히 잘 맞는다.

추천하는 사용자는 명확하다. 개인 지식베이스를 장기 자산으로 관리하고 싶은 사람, Git 기반 문서 운영에 거부감이 없는 사람, AI 에이전트에게 줄 절차와 맥락을 로컬 파일로 정리하고 싶은 사람, OSS/논문/도구 분석 노트를 계속 축적하는 사람에게 적합하다.

반대로 "가입하면 바로 동기화되고, 팀원이 동시에 편집하고, 모바일에서 빠르게 메모하는" SaaS형 경험을 원한다면 Tolaria는 다소 공학적인 도구처럼 느껴질 수 있다. 하지만 데이터 소유권, 이식성, Git history, AI agent compatibility를 중요하게 본다면 충분히 살펴볼 만한 프로젝트다. 내 기준으로는 지금의 Tolaria는 Obsidian 대체재라기보다, **AI 에이전트 시대에 맞춘 Git-first Markdown workspace**라는 표현이 더 정확하다.

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
