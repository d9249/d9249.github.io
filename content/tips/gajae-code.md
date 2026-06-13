---
title: "Gajae-Code는 의도 인터뷰·계획·검증을 작은 표면으로 묶은 외부 코딩 에이전트 러너다"
date: "2026-06-14T02:09:28"
description: "Yeachan-Heo/gajae-code는 Bun 기반 `gjc` CLI로 deep-interview, ralplan, ultragoal, team workflow와 네 가지 역할 에이전트를 제공하는 MIT 오픈소스 코딩-agent harness다."
author: "Sangmin Lee"
repository: "Yeachan-Heo/gajae-code"
sourceUrl: "https://github.com/Yeachan-Heo/gajae-code"
status: "Open source beta"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Coding Agent"
  - "CLI"
  - "Developer Tools"
  - "Bun"
  - "TypeScript"
highlights:
  - "`gjc`는 Codex CLI, Claude Code, OpenCode, Claw Code를 대체하는 플러그인이 아니라 같은 repo/worktree 옆에서 실행하는 외부 coding-agent runner로 설계됐다."
  - "기본 workflow는 `deep-interview`, `ralplan`, `ultragoal`, `team` 네 개로 좁히고, `executor`, `architect`, `planner`, `critic` 네 역할 에이전트를 함께 제공한다."
  - "공식 설치 경로는 Bun `>=1.3.14`에서 `bun install -g gajae-code`이며, Windows 11 native install 가이드와 `gjc --smoke-test` 검증 흐름이 README에 포함돼 있다."
  - "조사 시점 기준 GitHub 최신 release/tag는 `v0.5.0`이고 macOS arm64, Linux arm64/x64, Windows x64 실행 파일 asset이 배포돼 있다."
  - "로컬 파일·bash·edit/write tool, 세션 JSONL, optional memory/secrets/bridge 표면을 다루는 베타 agent runtime이므로 중요한 repo에서는 isolated worktree와 실제 검증 로그를 먼저 요구하는 편이 안전하다."
draft: false
---

코딩 에이전트 도구가 많아질수록 차이는 “모델에게 코드를 쓰게 할 수 있는가”보다 **요구사항을 어떻게 확정하고, 어떤 계획을 승인하고, 어떤 증거로 완료를 판단하는가**에서 난다. `Gajae-Code`는 이 지점을 아주 좁은 workflow surface로 밀어붙이는 Bun/TypeScript 기반 `gjc` CLI다.

저장소 `Yeachan-Heo/gajae-code`의 README는 프로젝트를 “focused coding-agent runner for interviews, reviewed plans, tmux-native execution, and durable verification”라고 설명한다. 즉 Claude Code나 Codex CLI 안에 설치되는 플러그인이 아니라, 같은 repo나 별도 worktree 옆에서 `gjc`를 실행하고 인터뷰·계획·목표 실행·팀 실행을 별도 harness로 운영하는 쪽에 가깝다.

조사 시점 기준 GitHub API와 checked-in `LICENSE`는 MIT로 확인된다. 기본 언어는 TypeScript이고, 루트 `package.json`은 Bun `1.3.14` workspace를 기준으로 여러 `@gajae-code/*` 패키지를 묶는다. GitHub Releases의 최신 tag는 `v0.5.0`이며, release asset에는 `gjc-darwin-arm64`, `gjc-linux-arm64`, `gjc-linux-x64`, `gjc-windows-x64.exe`가 포함돼 있다.

![Gajae-Code hero](/images/tips/gajae-code-hero.png)

## Gajae-Code를 무엇으로 봐야 하나

Gajae-Code의 핵심은 “큰 skill zoo”가 아니라 **작은 공개 workflow를 반복적으로 다듬는 agent runner**다. README와 `AGENTS.md`가 반복해서 고정하는 기본 표면은 다음 네 가지다.

- `deep-interview`: 애매한 요청을 바로 구현하지 않고 요구사항과 acceptance criteria로 좁힌다.
- `ralplan`: 구현 전에 계획을 만들고 비판·승인 단계를 둔다.
- `ultragoal`: 실행 목표, revision, check, completion evidence를 durable ledger로 추적한다.
- `team`: 병렬 tmux worker가 실제로 도움이 될 때만 coordinated execution을 붙인다.

역할 에이전트도 `executor`, `architect`, `planner`, `critic` 네 개로 제한한다. `architect`, `planner`, `critic`는 제품 파일을 직접 바꾸는 역할이 아니라 읽기 중심의 설계·순서·비판 lane으로 두고, 구현은 bounded executor나 승인된 workflow가 담당하게 만드는 구조다.

이 구조는 “에이전트가 무엇이든 알아서 하게 하자”보다 “사람이 승인할 수 있는 좁은 단계로 나누자”에 가깝다. 특히 큰 변경을 바로 `bash`와 `edit`에 맡기기 전에 인터뷰와 계획을 별도 산출물로 남기고 싶다면 잘 맞는다.

## 설치와 첫 사용 흐름

README의 표준 설치는 Bun global install이다.

```bash
bun install -g gajae-code
```

그 다음 현재 checkout에서 바로 `gjc`를 실행하거나, tmux-backed leader session과 isolated worktree를 조합한다.

```bash
# 현재 repo에서 바로 실행
gjc

# tmux-backed leader session
gjc --tmux

# 위험하거나 reviewable한 작업은 별도 worktree에서 실행
gjc --tmux --worktree ../my-task-worktree
```

Windows도 README에 native install 경로가 따로 적혀 있다. 깨끗한 Windows 11에서는 Bun을 먼저 설치하고 PowerShell을 재시작한 뒤 `bun install -g gajae-code`, `gjc --version`, `gjc --smoke-test`로 확인하는 흐름이다.

```powershell
powershell -c "irm bun.sh/install.ps1|iex"
bun --version
bun install -g gajae-code
gjc --version
gjc --smoke-test
```

npm registry에는 두 표면이 보인다. `gajae-code`는 one-line wrapper로 `gjc` launcher를 제공하고, scoped package `@gajae-code/coding-agent`는 실제 coding-agent CLI package다. 둘 다 조사 시점 기준 `0.5.0`, Bun `>=1.3.14`, MIT metadata를 가진다. 다만 npm metadata의 repository URL은 `gajae-ai/gajae-code`로 표시되는 반면, 사용자가 확인할 공개 저장소는 `Yeachan-Heo/gajae-code`라서 링크를 공유할 때는 실제 GitHub URL을 기준으로 확인하는 편이 좋다.

## 활용 포인트

Gajae-Code가 흥미로운 상황은 다음과 같다.

- 기능 요청이 자주 애매해서 구현 전에 requirements interview를 강제하고 싶다.
- Codex CLI, Claude Code, OpenCode 같은 기존 agent를 쓰되, 실행 전 계획·검토·증거 산출 흐름을 별도 runner에서 관리하고 싶다.
- 긴 작업을 `ultragoal` 같은 ledger로 쪼개고, “완료했다”가 아니라 어떤 check와 evidence가 있었는지 남기고 싶다.
- 한 repo에서 병렬 agent worker를 쓸 때 tmux session과 역할 분리를 명시적으로 다루고 싶다.
- risky change를 main checkout이 아니라 isolated worktree에서 실행하는 습관을 도구 수준에서 만들고 싶다.

`docs/codebase-overview.md`를 보면 `packages/coding-agent`가 제품 중심이고, agent session은 interactive TUI, print, RPC, RPC-UI, ACP mode로 흐른다. built-in tool registry에는 read, bash, edit, write, search/find, LSP, browser, task/subagent, todo, web search 같은 로컬 개발 표면이 포함된다. 따라서 단순 prompt wrapper라기보다, 파일 시스템과 shell execution을 실제로 잡고 있는 local agent runtime으로 봐야 한다.

## 주의할 점

첫째, README가 직접 **experimental, beta-stage project**라고 못박는다. 별과 릴리스가 빠르게 늘고 있어도 중요한 repo에서는 `gjc --smoke-test`, 별도 worktree, git diff, test/build evidence를 기본으로 요구하는 편이 안전하다.

둘째, `gjc`는 로컬 작업을 수행하는 agent harness다. 문서 기준 세션은 `~/.gjc/agent/sessions/...` JSONL로 저장되고, blob·terminal breadcrumb·stats aggregation 같은 로컬 runtime 파일도 생긴다. `gjc stats` 계열은 local session log와 SQLite aggregation을 다루므로, prompt, path, command, cost 정보를 외부에 공유하기 전에 민감한 내용이 들어갔는지 확인해야 한다.

셋째, built-in `bash` tool은 shell command를 foreground/PTY/background로 실행할 수 있고, 실패·timeout·artifact spill을 session에 기록한다. 이 장점은 곧 위험 표면이기도 하다. repository-local agent에게 넓은 shell 권한을 줄 때는 destructive command 승인, isolated worktree, test evidence, secrets redaction이 workflow 안에 들어가야 한다.

넷째, optional 기능들은 안전 기본값을 이해하고 켜야 한다. `docs/secrets.md` 기준 secret obfuscation은 기본 비활성이고 `secrets.enabled: true`가 필요하다. `docs/memory.md` 기준 autonomous memory도 기본 비활성이다. `docs/bridge.md`의 bridge mode는 HTTPS와 bearer token을 요구하고 session endpoint가 fail-closed인 experimental surface다. 기능 이름만 보고 “항상 안전하게 보호된다”고 가정하면 안 된다.

다섯째, `v0.5.0` release asset 기준 macOS는 arm64 binary만 보이고, Windows는 x64 실행 파일이 제공된다. 이전 release에는 darwin-x64 asset이 보이지만 최신 release asset과 README 설치 경로를 기준으로 실제 대상 환경을 다시 확인하는 편이 좋다.

## 내 판단

Gajae-Code는 “또 하나의 코딩 에이전트”라기보다 **agent 작업을 인터뷰→계획→목표 실행→검증으로 좁히는 운영 harness**로 보는 것이 맞다. 이미 Codex CLI나 Claude Code를 쓰면서도 작업이 즉흥적으로 흘러가거나, 사람이 승인할 계획과 완료 증거가 부족하다고 느꼈다면 시험해 볼 만하다.

반대로 단순히 작은 파일 하나를 빠르게 고치고 싶은 개인 작업에는 workflow가 무겁게 느껴질 수 있다. `deep-interview`, `ralplan`, `ultragoal`, `team`이라는 표면은 빠른 자동완성보다 “반복 가능한 변경 관리”에 더 가까운 도구다.

가장 안전한 시작점은 기존 repo에서 바로 돌리는 것보다 작은 실험 repo나 별도 worktree에서 `gjc --tmux --worktree ...`를 사용해 보고, 결과물이 실제로 어떤 plan/evidence/session 파일을 남기는지 확인하는 것이다. 마음에 들면 그때부터 팀의 acceptance criteria, 테스트 명령, reviewer gate에 맞춰 GJC workflow를 붙이는 편이 좋다.

## 참고한 공개 자료

- [Yeachan-Heo/gajae-code GitHub repository](https://github.com/Yeachan-Heo/gajae-code)
- [Gajae-Code README](https://github.com/Yeachan-Heo/gajae-code/blob/main/README.md)
- [Gajae-Code Releases](https://github.com/Yeachan-Heo/gajae-code/releases)
- [`gajae-code` on npm](https://www.npmjs.com/package/gajae-code)
- [`@gajae-code/coding-agent` on npm](https://www.npmjs.com/package/@gajae-code/coding-agent)
- [Codebase overview](https://github.com/Yeachan-Heo/gajae-code/blob/main/docs/codebase-overview.md)
- [Session storage docs](https://github.com/Yeachan-Heo/gajae-code/blob/main/docs/session.md)
- [Secret obfuscation docs](https://github.com/Yeachan-Heo/gajae-code/blob/main/docs/secrets.md)
- [Bridge protocol docs](https://github.com/Yeachan-Heo/gajae-code/blob/main/docs/bridge.md)
