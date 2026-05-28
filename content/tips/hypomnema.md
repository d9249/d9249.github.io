---
title: "Hypomnema는 Claude Code가 로컬 Markdown 위키를 읽고 갱신하게 만드는 git-backed 개인 지식 베이스다"
date: "2026-05-28T16:44:48"
description: "sk-lim19f/Hypomnema는 Claude Code 플러그인과 npm CLI로 /hypo:* 명령, lifecycle hook, 로컬 Markdown vault, git 동기화를 묶어 개인 위키를 세션 기억 장치처럼 쓰게 하는 MIT 오픈소스 도구다."
author: "Sangmin Lee"
repository: "sk-lim19f/Hypomnema"
sourceUrl: "https://github.com/sk-lim19f/Hypomnema"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "Claude Code"
  - "AI Agents"
  - "Knowledge Base"
  - "CLI"
  - "Markdown"
highlights:
  - "Claude Code 플러그인 경로와 npm 전역 CLI 경로를 모두 제공하며, 둘 다 /hypo:* slash command와 hook 기반 자동화를 설치한다."
  - "wiki root는 기본적으로 ~/hypomnema이고, pages·projects·sources·journal을 plain Markdown/frontmatter로 저장한 뒤 git repo로 동기화한다."
  - "ingest, query, feedback, crystallize, resume, lint, verify, graph 같은 명령으로 지식 수집·검색·세션 종료·행동 교정을 Claude Code 안에서 처리한다."
  - "SessionStart/UserPromptSubmit/PostToolUse/Stop hook이 context 주입, 자동 stage, auto commit/push까지 건드리므로 개인 위키와 ~/.claude 변경 범위를 먼저 확인해야 한다."
  - "최신 GitHub Release와 npm package는 v1.2.1이며, Node.js >=18과 Claude Code CLI가 전제다."
draft: false
---

`sk-lim19f/Hypomnema`는 Claude Code를 위한 **LLM-native personal wiki**다. 일반 노트 앱처럼 사람이 글을 직접 정리하는 대신, Claude Code 세션 안에서 `/hypo:ingest`, `/hypo:query`, `/hypo:feedback`, `/hypo:crystallize` 같은 명령을 호출하고, lifecycle hook이 세션 시작·프롬프트 제출·파일 변경·세션 종료 시점에 wiki 내용을 읽거나 갱신한다.

핵심은 저장소가 화려한 SaaS가 아니라는 점이다. README와 architecture 문서 기준 Hypomnema의 데이터 경계는 `~/hypomnema` 같은 로컬 wiki root, Markdown/frontmatter 파일, `.hypoignore`, git이다. Node.js 스크립트와 Claude Code hook이 이 plain file vault 위에서 동작하므로, 잘 맞는 사용자에게는 “Claude가 오래 기억하는 개인 작업 노트”가 되고, 안 맞는 환경에서는 “자동으로 `~/.claude`와 git을 만지는 강한 로컬 자동화”가 된다.

## Hypomnema 개요

Hypomnema가 노리는 문제는 AI 코딩 세션의 기억 단절이다. 오늘 Claude Code가 어떤 문서를 읽었고, 어떤 결정을 했고, 왜 특정 구현을 골랐는지 다음 주 세션에서는 다시 설명해야 한다. Hypomnema는 그 정보를 wiki page, project `hot.md`, `session-state.md`, feedback page, session log로 남기고 다음 세션의 `additionalContext`에 다시 넣는 쪽으로 설계되어 있다.

저장 구조는 단순하다. README의 directory layout은 다음 흐름을 보여준다.

- `index.md`, `hot.md`, `log.md`, `SCHEMA.md`, `hypo-guide.md` 같은 root 문서
- `pages/` 아래의 장기 지식 page와 `pages/feedback/` 행동 교정 page
- `projects/<name>/hot.md`, `session-state.md`, `session-log/` 같은 프로젝트별 재개 문맥
- `sources/` 원본 자료 저장소
- `journal/` 일간·주간·월간 기록
- `.hypoignore`로 hook과 ingest에서 제외할 민감 경로 지정

v1.2.x README는 “완전 자율 wiki”를 v2 비전으로 두고, 현재는 명시적인 `/hypo:*` 명령이 아직 중심이라고 설명한다. 다만 v1.2.0부터 feedback-as-source-of-truth projection, extension companion sync, cwd 기반 auto-project 제안, Stop-chain minimal crystallize 같은 자동화 면적이 커졌다.

## 설치와 첫 사용법

공식 README는 두 가지 설치 경로를 제시한다. 권장 경로는 Claude Code plugin marketplace다.

```text
/plugin marketplace add sk-lim19f/Hypomnema
/plugin install hypomnema@hypomnema
/hypo:init
```

이 경로는 package의 `commands/` directory를 Claude Code plugin cache에서 slash command로 제공하고, `/hypo:init`이 wiki scaffold와 hook 설정을 진행한다. `.claude-plugin/plugin.json`도 package 이름 `hypomnema`, version `1.2.1`, `commands: "./commands/"`, `skills: "./skills/"`를 선언한다.

두 번째 경로는 npm 전역 CLI다.

```bash
npm install -g hypomnema
hypomnema
```

`package.json`과 npm registry 모두 package 이름은 `hypomnema`, 최신 version은 `1.2.1`, Node engine은 `>=18`, license는 `MIT`로 확인된다. CLI entrypoint는 `scripts/init.mjs`이고, `hypomnema`를 그냥 실행하면 wiki를 만들고 hook을 설치하며 slash command 파일을 `~/.claude/commands/hypo/`로 복사한다. 이후 `hypomnema upgrade --apply`, `hypomnema doctor`, `hypomnema uninstall` 같은 subcommand로 설치 상태를 관리한다.

첫 실행 후에는 README가 안내하듯 Claude Code를 재시작하거나 새 세션을 열어야 새 hook과 slash command가 잡힌다.

## 실제로 쓰는 명령 흐름

자주 쓰는 표면은 `/hypo:*` 명령이다.

```text
/hypo:ingest https://example.com/some-article-or-paper.pdf
/hypo:query "summarize what I know about X"
/hypo:feedback "always include test commands when explaining a fix"
```

README의 command table과 `commands/` directory 기준으로는 `init`, `ingest`, `query`, `feedback`, `crystallize`, `resume`, `verify`, `lint`, `graph`, `doctor`, `upgrade`, `uninstall`, `stats`, `audit` 같은 흐름이 보인다. 합성 작업이 많은 `ingest`, `query`, `crystallize`, `lint`, `verify`, `graph`는 `skills/<name>/SKILL.md` 형태의 Claude Agent Skill로도 들어 있다.

사용 패턴은 다음처럼 생각하면 쉽다.

1. 읽을 만한 문서·PR·논문·블로그를 `/hypo:ingest`로 넣는다.
2. Claude가 원본을 `sources/`에 두고, 사람이 읽을 수 있는 page를 `pages/`에 합성한다.
3. 나중에 `/hypo:query`로 wiki 전체에서 BM25 검색과 LLM 합성을 거쳐 답을 받는다.
4. 세션이 길어지면 `/hypo:crystallize`로 결정과 다음 작업을 남긴다.
5. Claude가 반복적으로 틀리는 행동은 `/hypo:feedback`으로 `pages/feedback/`에 남기고, projection으로 `MEMORY.md`와 `~/.claude/CLAUDE.md`의 learned behaviors에 반영한다.

즉 Hypomnema는 “문서를 보관하는 앱”이라기보다 Claude Code에게 개인 wiki를 읽고 쓰는 운영 규칙을 주는 도구에 가깝다.

## hook 자동화가 주는 장점

`hooks/hooks.json`과 README를 보면 Hypomnema의 hook surface가 꽤 넓다. `SessionStart`에서는 `hot.md`와 `session-state.md`를 주입하고 git pull을 시도한다. `UserPromptSubmit`에서는 첫 프롬프트용 hot cache 주입, BM25 lookup, `/compact` guard가 걸린다. `PostToolUse`에서는 wiki file 편집 후 자동 stage, web fetch/search 뒤 ingest nudge가 돈다. `Stop`에서는 `hot.md` rebuild, session record, auto commit/push, minimal crystallize prompt가 이어진다.

이 설계의 장점은 세션 복귀 비용을 줄인다는 점이다. 프로젝트를 몇 주 쉬었다가 돌아와도 `projects/<name>/session-state.md`와 `hot.md`가 다음 작업과 최근 결정을 담고 있으면 Claude Code가 첫 프롬프트부터 더 많은 맥락을 가진다. 문서 ingest도 “한 번 넣고 끝”이 아니라 기존 page를 갱신하고 wikilink를 유지하는 쪽을 지향한다.

또 하나의 장점은 format lock-in이 낮다는 것이다. README는 별도 vector DB, API key, 외부 서비스 없이 Node.js script + Markdown + git을 전체 stack으로 잡는다. 이 방식은 검색·동기화·diff·백업을 이미 익숙한 git 도구로 처리할 수 있게 해준다.

## 주의할 점

Hypomnema는 로컬-first라는 점이 장점이지만, 자동화의 권한도 그만큼 직접적이다. 도입 전에는 아래를 확인하는 편이 좋다.

- **`~/.claude`를 실제로 변경한다.** npm CLI 경로는 hook을 `~/.claude/hooks/`에 배치하고, `~/.claude/settings.json`에 등록하며, slash command를 `~/.claude/commands/hypo/`에 복사한다. plugin 경로는 plugin cache에서 command를 제공하지만 `/hypo:init`은 여전히 wiki scaffold와 settings merge를 수행한다.
- **Stop hook의 auto commit/push가 surprise가 될 수 있다.** README는 wiki가 git repo이며 Stop hook이 sync를 돕는다고 설명한다. 회사 지식, 고객명, 실험 로그가 섞인 wiki에 remote를 붙이기 전 `.hypoignore`와 공개/비공개 remote 설정을 먼저 점검해야 한다.
- **wiki 내용은 Claude provider로 전송될 수 있다.** README의 provider transmission disclaimer는 content-injection hook이 `additionalContext`로 wiki 내용을 내보내며, `.hypoignore`에 걸리지 않은 파일은 모델 provider prompt에 포함될 수 있다고 명시한다.
- **agent instruction trust가 필요하다.** `commands/*.md`, `skills/*/SKILL.md`, hook scripts, feedback projection은 Claude의 행동을 바꾸는 정책 파일이다. 외부 repo의 agent instruction을 설치하는 행위로 보고, package version과 diff를 리뷰해야 한다.
- **extension companion sync는 강하다.** v1.2.x는 `~/hypomnema/extensions/{agents,commands,hooks,skills}/`를 `~/.claude/`로 mirror할 수 있고, 옵션에 따라 일부를 `~/.codex/`에도 반영한다. 개인 장비에서는 편하지만 팀 repo나 공유 장비에서는 별도 승인 절차가 필요하다.
- **플랫폼은 Claude Code와 Node.js 전제다.** package 자체는 Node.js `>=18`이며 README 요구 사항은 Claude Code CLI다. 이 사이트 분류상 `macos-linux`에 넣었지만, 실제 호환성은 Claude Code가 안정적으로 도는 환경과 shell/git 사용성에 좌우된다.

## 내 판단

Hypomnema는 Obsidian이나 Notion을 대체하려는 일반 노트 앱보다, **Claude Code를 계속 쓰는 개발자에게 세션 기억과 개인 연구 노트를 붙이는 도구**로 보는 편이 맞다. plain Markdown + git 구조라서 자료가 남는 위치가 명확하고, `/hypo:query`와 `/hypo:resume` 흐름은 장기 프로젝트·논문 읽기·아키텍처 결정 추적에 잘 맞는다.

반대로 처음부터 모든 wiki와 Claude 설정을 맡기기에는 자동화 표면이 크다. 나는 작은 개인 repo나 별도 테스트 wiki에서 `HYPO_DIR`를 분리하고, `--dry-run`, `hypomnema doctor`, `.hypoignore`, git remote 공개 범위를 확인한 뒤 넓히는 쪽을 추천한다. 특히 `~/.claude/CLAUDE.md` learned behavior, auto commit/push, extension sync는 “편의 기능”이면서 동시에 장기적인 agent 정책이므로 코드처럼 리뷰해야 한다.

## 참고한 공개 자료

- [sk-lim19f/Hypomnema GitHub repository](https://github.com/sk-lim19f/Hypomnema)
- [Hypomnema README](https://github.com/sk-lim19f/Hypomnema/blob/main/README.md)
- [Hypomnema Architecture](https://github.com/sk-lim19f/Hypomnema/blob/main/docs/ARCHITECTURE.md)
- [Hypomnema Security Policy](https://github.com/sk-lim19f/Hypomnema/blob/main/SECURITY.md)
- [Hypomnema v1.2.1 release](https://github.com/sk-lim19f/Hypomnema/releases/tag/v1.2.1)
- [hypomnema npm package](https://www.npmjs.com/package/hypomnema)
