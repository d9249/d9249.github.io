---
title: "claude-obsidian은 Obsidian vault를 AI 에이전트용 지식 엔진으로 바꾸는 Claude Code 플러그인이다"
date: "2026-05-25T03:33:04"
description: "AgriciDaniel/claude-obsidian은 Obsidian 폴더를 Claude Code 플러그인과 agent skills, wiki/hot cache, ingest/lint/save/autoresearch 흐름으로 묶어 지속적으로 누적되는 개인·팀 지식 vault로 만드는 MIT 오픈소스 프로젝트다."
author: "Sangmin Lee"
repository: "AgriciDaniel/claude-obsidian"
sourceUrl: "https://github.com/AgriciDaniel/claude-obsidian"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "AI Agents"
  - "Obsidian"
  - "Knowledge Base"
  - "Claude Code"
  - "Memory"
  - "Markdown"
highlights:
  - "Claude Code 플러그인과 seeded Obsidian vault가 함께 들어 있어 `/wiki`, `ingest`, `/save`, `/autoresearch`, `lint the wiki` 흐름을 바로 시험할 수 있다."
  - "공식 설치 경로는 repo를 vault로 clone한 뒤 `bash bin/setup-vault.sh`를 실행하거나, Claude Code plugin marketplace에서 `claude-obsidian`을 설치하는 방식이다."
  - "`wiki/index.md`, `wiki/log.md`, `wiki/hot.md`, `.raw/` source folder, Obsidian Bases dashboard, Canvas map을 기준으로 지식이 누적되는 구조를 제안한다."
  - "Codex CLI, OpenCode, Gemini CLI, Cursor, Windsurf용 skill symlink installer도 제공하지만 핵심 제품 경험은 여전히 Claude Code + Obsidian 중심이다."
  - "MCP/Local REST API, filesystem MCP, SessionStart/PostToolUse hooks, auto-commit 흐름이 포함되므로 개인 vault·회사 자료·API key 범위를 먼저 점검해야 한다."
draft: false
---

AI 에이전트에게 긴 프로젝트나 연구 주제를 맡길 때 가장 귀찮은 부분은 “지난번에 어디까지 읽었는지”와 “지식이 어디에 정리됐는지”가 세션마다 끊긴다는 점이다. Obsidian은 사람이 쓰기 좋은 지식 vault지만, 에이전트가 스스로 파일을 만들고 정리하고 다시 읽는 규칙까지 갖추려면 별도 설계가 필요하다.

`claude-obsidian`은 이 지점을 정면으로 겨냥한 프로젝트다. 저장소는 단순한 Obsidian 템플릿이 아니라 **Claude Code 플러그인 + agent skills + seeded Obsidian vault + MCP 설정 가이드 + wiki 운영 규칙**을 한 폴더에 묶는다. 사용자는 `.raw/`에 source를 넣고 Claude에게 `ingest`를 시키며, Claude는 source를 읽어 wiki page, index, log, hot cache를 갱신하는 식이다.

조사 시점 기준 저장소 `AgriciDaniel/claude-obsidian`은 Python 중심으로 분류되는 MIT 오픈소스 프로젝트이며, GitHub 최신 Release는 `v1.6.0`이다. 공식 홈페이지/블로그는 프로젝트를 Andrej Karpathy의 LLM Wiki 패턴을 Obsidian과 Claude Code 위에 구현한 “AI second brain”으로 설명한다.

![claude-obsidian cover](/images/tips/claude-obsidian-cover.png)

## claude-obsidian 개요

claude-obsidian의 핵심 단위는 “앱”보다 **vault protocol**에 가깝다. repo 자체를 Obsidian vault로 열 수 있고, 그 안에는 agent가 따라야 할 `CLAUDE.md`, `WIKI.md`, `skills/`, `commands/`, `hooks/`, `wiki/`, `.raw/`, `_templates/`가 들어 있다.

기본 루프는 다음과 같다.

- `.raw/`에 PDF, Markdown, transcript, article 같은 source를 넣는다.
- Claude Code에서 `/wiki`로 vault를 scaffold하거나 상태를 점검한다.
- `ingest [file]`로 source를 읽고 8–15개 정도의 wiki page, cross-reference, index/log를 만든다.
- `what do you know about X?`처럼 물으면 `wiki/hot.md`와 `wiki/index.md`를 먼저 읽고 관련 page를 drill-down한다.
- `/save`는 현재 대화를 wiki note로 저장하고, `lint the wiki`는 orphan, dead link, stale claim, missing cross-reference를 점검한다.
- `/autoresearch [topic]`은 web research loop를 돌려 source와 concept page를 보강하는 흐름이다.

여기서 중요한 것은 “채팅창에 답을 받는 것”이 아니라, 답변 과정에서 만들어진 지식이 Obsidian의 Markdown page와 canvas, graph 구조로 남는다는 점이다. 다음 세션은 `wiki/hot.md`를 읽고 최근 맥락을 복구하도록 설계되어 있다.

![claude-obsidian wiki map](/images/tips/claude-obsidian-wiki-map.png)

## 설치와 첫 사용법

README가 가장 추천하는 경로는 repo를 그대로 vault로 clone하는 방식이다.

```bash
git clone https://github.com/AgriciDaniel/claude-obsidian
cd claude-obsidian
bash bin/setup-vault.sh
```

그 다음 Obsidian에서 **Manage Vaults → Open folder as vault**로 `claude-obsidian/` 폴더를 열고, 같은 폴더에서 Claude Code를 실행해 `/wiki`를 입력한다. `setup-vault.sh`는 `.obsidian/graph.json`, `app.json`, `appearance.json`, 기본 wiki folder, `_templates/`, `.raw/`를 준비하고, Excalidraw plugin의 `main.js`가 없으면 GitHub Release에서 내려받는다.

Claude Code 플러그인으로 설치하려면 marketplace catalog를 먼저 추가한 뒤 plugin을 설치한다.

```bash
claude plugin marketplace add AgriciDaniel/claude-obsidian
claude plugin install claude-obsidian@claude-obsidian-marketplace
claude plugin list
```

기존 Obsidian vault에 얹고 싶다면 `WIKI.md`를 vault root에 복사한 뒤 Claude에게 “WIKI.md를 읽고 Local REST API plugin/MCP/vault 목적 질문/scaffold를 순서대로 확인하라”는 bootstrap prompt를 주는 방식도 문서화되어 있다.

## 어떤 구조가 만들어지나

base scaffold는 다음 파일들을 중심으로 동작한다.

- `wiki/index.md`: 전체 catalog와 domain sub-index의 출발점
- `wiki/log.md`: ingest/save/lint 같은 operation log
- `wiki/hot.md`: 다음 세션이 먼저 읽는 최근 context cache
- `wiki/overview.md`: vault의 executive summary
- `wiki/meta/dashboard.base`: Obsidian Bases 기반 dashboard
- `wiki/Wiki Map.canvas`: Obsidian canvas로 보는 visual hub
- `.raw/`: 원본 source document를 두는 hidden folder
- `_templates/`: note type별 Obsidian Templater template

README는 여섯 가지 모드도 제안한다. Website, GitHub codebase, business intelligence, personal second brain, research/papers, book/course notes처럼 vault 목적에 따라 folder와 index를 다르게 잡는 방식이다. 그래서 단순 “노트 앱 플러그인”이라기보다, 특정 domain을 장기적으로 읽고 정리하는 agent workflow template에 가깝다.

## multi-agent와 DragonScale

초기 경험은 Claude Code 중심이지만, repo에는 다른 agent가 같은 skills를 발견하도록 symlink를 거는 installer도 있다.

```bash
bash bin/setup-multi-agent.sh
```

스크립트 기준 대상은 Codex CLI, OpenCode, Gemini CLI, Cursor, Windsurf다. 예를 들어 Codex는 `~/.codex/skills/claude-obsidian`, OpenCode는 `~/.opencode/skills/claude-obsidian`로 `skills/`를 연결한다. 즉 “Claude 전용 vault”에서 출발했지만, agent skills 표준을 쓰는 도구들이 같은 wiki 운영 규칙을 공유하도록 넓히는 방향이다.

`v1.6.0`에서는 DragonScale Memory라는 opt-in 확장도 문서화되어 있다. `bash bin/setup-dragonscale.sh`를 실행하면 log fold, deterministic page address, semantic tiling lint, boundary-first autoresearch topic suggestion 같은 기능을 켤 수 있다. 단, base vault에는 필수가 아니고, semantic tiling lint는 `python3`, `ollama`, `nomic-embed-text` 같은 로컬 embedding stack을 요구한다.

## 주의할 점

첫째, 권한 경계를 먼저 정해야 한다. claude-obsidian은 agent가 vault를 읽고 쓰게 만드는 프로젝트다. `.raw/`에 회사 문서, 고객 자료, 비공개 PDF, transcript를 넣으면 그 내용이 `wiki/` 아래의 요약 page, concept page, log, hot cache로 재구성될 수 있다. 공개 repo에 vault를 올리거나 Obsidian Git을 켜기 전에는 어떤 source와 generated note가 commit되는지 확인하는 편이 좋다.

둘째, MCP 설정은 편하지만 강력하다. README의 REST API 방식은 Obsidian Local REST API plugin, API key, `127.0.0.1:27124`를 전제로 한다. filesystem MCP 방식은 `npx -y @bitbonsai/mcpvault@latest /path/to/your/vault` 형태로 vault path를 직접 넘긴다. 둘 다 agent가 note를 읽고 쓸 수 있는 표면이므로, vault를 외부 네트워크나 신뢰하지 않는 MCP client에 열지 않는 것이 기본이다.

셋째, hooks를 그대로 쓰기 전에 읽어보는 것이 좋다. 저장소의 `hooks/hooks.json`에는 SessionStart에서 `wiki/hot.md`를 읽고, PostToolUse에서 `wiki/`, `.raw/`, `.vault-meta/`를 stage한 뒤 자동 commit하는 흐름이 들어 있다. 개인 vault에서는 편하지만, 회사 repo나 별도 git 정책이 있는 폴더에서는 auto-commit 범위가 기대와 다를 수 있다.

넷째, 설치 스크립트와 community plugin 구성이 Obsidian 환경을 바꾼다. `setup-vault.sh`는 graph/app/appearance 설정을 쓰고, Calendar, Thino, Excalidraw, Banners 같은 community plugin 구성을 전제로 한다. Excalidraw `main.js`는 setup 중 GitHub latest release에서 다운로드될 수 있다. 재현성을 중요하게 본다면 release/tag를 고정하고 설치 전후 diff를 확인하는 편이 낫다.

다섯째, Windows 지원은 조심해서 봐야 한다. Obsidian 자체는 cross-platform이지만, 공식 quick start와 setup scripts는 `bash`, symlink, Unix-style path, Claude Code plugin 흐름을 중심으로 설명한다. Windows 사용자는 WSL이나 수동 복사/설정 경로가 필요할 수 있다.

## 내 판단

claude-obsidian은 “Obsidian에 AI 채팅을 붙이는 플러그인”이라기보다, **AI 에이전트가 지식을 계속 누적하도록 vault 운영 방식을 정해주는 starter kit**에 가깝다. Karpathy의 LLM Wiki 패턴을 좋아하고, Claude Code를 자주 쓰며, 연구/사업/코드베이스 지식을 한 곳에 장기 축적하고 싶은 사람에게는 꽤 직접적으로 맞는다.

특히 여러 source를 읽고, 그 결과를 질문 답변용 context뿐 아니라 Obsidian page, graph, canvas, dashboard로 남기고 싶다면 유용하다. 반대로 이미 정교한 Obsidian vault를 운영 중이거나, 회사 보안 정책상 agent가 note와 source를 자동으로 수정·commit하면 안 되는 환경이라면 새 vault에서 먼저 실험하고, MCP/hook/Obsidian Git 범위를 하나씩 켜는 편이 안전하다.

## 참고한 공개 자료

- [AgriciDaniel/claude-obsidian GitHub repository](https://github.com/AgriciDaniel/claude-obsidian)
- [claude-obsidian README](https://github.com/AgriciDaniel/claude-obsidian/blob/main/README.md)
- [v1.6.0 GitHub release](https://github.com/AgriciDaniel/claude-obsidian/releases/tag/v1.6.0)
- [claude-obsidian install guide](https://github.com/AgriciDaniel/claude-obsidian/blob/main/docs/install-guide.md)
- [DragonScale Memory guide](https://github.com/AgriciDaniel/claude-obsidian/blob/main/docs/dragonscale-guide.md)
- [Claude plugin manifest](https://github.com/AgriciDaniel/claude-obsidian/blob/main/.claude-plugin/plugin.json)
- [hooks configuration](https://github.com/AgriciDaniel/claude-obsidian/blob/main/hooks/hooks.json)
- [Agrici Daniel blog: Obsidian AI Second Brain](https://agricidaniel.com/blog/claude-obsidian-ai-second-brain)
