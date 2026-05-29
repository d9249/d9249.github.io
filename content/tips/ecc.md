---
title: "ECC는 Claude Code 중심의 agent harness를 스킬·훅·보안 규칙으로 표준화하는 카탈로그다"
date: "2026-05-29T14:32:00"
description: "affaan-m/ECC는 Claude Code, Codex, OpenCode, Cursor 같은 AI 코딩 harness에 공통으로 재사용할 스킬, 에이전트, 훅, 규칙, MCP 설정, AgentShield 보안 점검을 묶은 MIT 오픈소스 워크플로 카탈로그다."
author: "Sangmin Lee"
repository: "affaan-m/ECC"
sourceUrl: "https://github.com/affaan-m/ECC"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Claude Code"
  - "Codex"
  - "Developer Tools"
  - "Security"
  - "MCP"
highlights:
  - "Claude Code plugin, npm `ecc-universal`, Codex/OpenCode/Cursor용 파일, `skills/*/SKILL.md`, rules, hooks, MCP configs를 한 저장소에서 관리한다."
  - "조사 시점 기준 GitHub 최신 Release는 `v1.10.0`, tag와 main의 `package.json`은 `v2.0.0-rc.1`, npm `ecc-universal`은 latest `1.10.0`·next `2.0.0-rc.1`로 표면이 나뉘어 있다."
  - "README 기준 빠른 경로는 Claude Code plugin `ecc@ecc`이고, 수동 설치는 `./install.sh --profile minimal --target claude` 또는 `npx ecc-install` 계열을 쓴다."
  - "AgentShield는 `npx ecc-agentshield scan`으로 `.claude` 설정의 secrets, permission, hooks, MCP, agent instruction 위험을 점검하는 별도 보안 레이어다."
  - "스킬·훅·MCP 설정은 에이전트의 실행 표면을 바꾸므로 plugin install과 manual full install을 겹치지 말고, 복사되는 파일과 권한을 diff로 검토해야 한다."
draft: false
---

AI 코딩 도구를 오래 쓰면 “좋은 프롬프트”보다 **반복 가능한 작업 표준**이 더 중요해진다. 리뷰는 어떤 순서로 할지, 테스트 실패는 누가 고칠지, MCP와 hooks는 어디까지 열어둘지, 세션이 길어질 때 context를 어떻게 줄일지 같은 규칙이 매번 새로 만들어지면 생산성이 흔들린다.

`ECC`는 이 지점을 Claude Code 중심의 agent harness 카탈로그로 풀려는 저장소다. 이름은 짧아졌지만 README와 이미지에는 이전 “Everything Claude Code” 정체성이 남아 있다. 현재 저장소 `affaan-m/ECC`는 Claude Code, Codex, OpenCode, Cursor, Gemini, Zed 같은 실행 표면이 같은 `SKILL.md`, rules, hooks, MCP convention을 공유하도록 만드는 쪽에 초점을 둔다.

조사 시점 기준 GitHub API와 checked-in `LICENSE` 모두 MIT로 확인된다. 저장소의 최신 GitHub Release는 `v1.10.0`이고, tag에는 `v2.0.0-rc.1`이 올라와 있다. npm은 `ecc-universal`의 `latest`가 `1.10.0`, `next`가 `2.0.0-rc.1`이라서, 실제 도입 전에는 “GitHub release / main branch / npm dist-tag / Claude plugin” 중 어느 표면을 설치하는지 먼저 맞춰 보는 편이 좋다.

![ECC hero](/images/tips/ecc-hero.png)

## ECC를 무엇으로 봐야 하나

ECC는 완성형 코딩 에이전트라기보다 **agent harness를 위한 재사용 가능한 운영 레이어**에 가깝다. 저장소 안에는 다음 축이 함께 들어 있다.

- `skills/*/SKILL.md`: TDD, code review, security review, framework별 패턴, content/research/operator workflow 같은 재사용 절차
- `agents/`와 harness별 설정: planner, architect, code reviewer, build resolver, e2e runner 같은 역할 분리
- `commands/`와 legacy command shim: `/plan`, `/tdd`, `/code-review`, `/context-budget` 같은 slash-style 진입점
- `hooks/`와 `scripts/hooks/`: PreToolUse, PostToolUse, Stop 같은 이벤트 기반 자동화
- `rules/`: 공통 coding/security/testing 지침과 언어·프레임워크별 규칙
- `.mcp.json`, `mcp-configs/`: MCP 서버 연결 예시와 convention
- `AgentShield`: agent 설정을 별도 보안 관점에서 점검하는 npm 패키지

중요한 설계 방향은 “각 harness마다 workflow를 다시 쓰지 말자”다. `docs/architecture/cross-harness.md`는 `SKILL.md`를 가장 portable한 단위로 보고, Claude Code는 plugin/hooks로, Codex는 `AGENTS.md`와 plugin metadata로, OpenCode는 package/plugin surface로, Cursor는 rules/hooks/skills 변환으로 같은 원본을 적응시키는 모델을 설명한다.

## 설치할 때는 한 경로만 고르기

README가 반복해서 강조하는 포인트는 **plugin install과 manual full install을 겹치지 말라**는 것이다. Claude Code 사용자는 보통 plugin 경로를 먼저 본다.

```text
/plugin marketplace add https://github.com/affaan-m/ECC
/plugin install ecc@ecc
```

단, plugin은 rules를 자동 배포하지 못하므로 필요한 rule folder만 직접 `~/.claude/rules/ecc/` 아래로 복사하는 흐름을 권한다. hooks가 부담스럽거나 낮은 context footprint로 시작하고 싶다면 수동 minimal profile이 더 안전한 출발점이다.

```bash
./install.sh --profile minimal --target claude
# Windows PowerShell 또는 clone 없이 시도하는 경로
npx ecc-install --profile minimal --target claude
```

수동 전체 설치를 선택했다면 plugin을 또 설치하지 않는다.

```bash
./install.sh --profile full
# 또는
npx ecc-install --profile full
```

이미 겹쳐 설치했다면 README의 uninstall/reset 흐름처럼 `node scripts/ecc.js list-installed`, `doctor`, `repair`, `uninstall --dry-run`으로 설치 상태를 먼저 확인하는 쪽이 낫다. 이 계열 도구는 사용자 홈의 `.claude`·rules·hooks·commands 같은 실제 agent 설정을 건드릴 수 있기 때문이다.

## npm과 보안 레이어

npm 쪽 핵심 패키지는 두 개다.

```bash
npm i -g ecc-universal
npx ecc consult "security reviews" --target claude
```

`ecc-universal`은 Node `>=18`을 요구하며, `ecc`와 `ecc-install` 실행 파일을 노출한다. `consult`는 원하는 목적을 입력하면 관련 component, profile, preview/install command를 제안하는 advisor 역할을 한다.

보안 쪽은 `ecc-agentshield`가 별도 패키지로 있다.

```bash
npx ecc-agentshield scan
# 또는
npm install -g ecc-agentshield
agentshield scan --format json
```

AgentShield는 `.claude` 설정을 기준으로 hardcoded secrets, 너무 넓은 permission, unsafe hooks, MCP server risk, agent prompt injection surface를 점검한다고 설명한다. ECC를 실제 팀 저장소에 넣는다면 “설치 후 기분 좋게 쓰기”보다 “설치 전후 diff와 AgentShield 결과를 함께 리뷰하기”가 맞는 사용법에 가깝다.

## 활용 포인트

ECC가 가장 잘 맞는 상황은 이미 Claude Code나 Codex/OpenCode를 자주 쓰고 있고, 다음 문제가 반복되는 팀이다.

- code review, TDD, build fix, e2e, security review 같은 흐름을 매번 프롬프트로 다시 설명한다.
- 여러 agent harness를 쓰다 보니 `.claude`, `AGENTS.md`, OpenCode config, Cursor rules가 서로 다른 방향으로 drift한다.
- MCP와 hooks를 많이 붙여 context window와 권한 표면이 커졌다.
- 개인용 slash command를 팀 표준 skill로 정리하고 싶다.
- agent session이 길어질 때 memory, checkpoint, compact, status 같은 운영 규칙이 필요하다.

개인 실험이라면 minimal profile 또는 특정 skill만 골라 보는 편이 좋다. 팀 표준으로 쓰려면 rules와 hooks를 한꺼번에 복사하기보다, repository-local branch에서 설치 결과를 diff로 보고 “우리 팀이 실제로 받아들일 workflow”만 남기는 절차가 필요하다.

## 주의할 점

첫째, ECC는 “prompt 모음”보다 권한 표면에 더 가깝다. hooks는 로컬 명령을 실행할 수 있고, MCP 설정은 외부 서비스와 credentials를 연결할 수 있으며, rules와 skills는 에이전트의 장기 행동을 바꾼다. 저장소를 clone해 읽는 것과 user-scope agent 설정에 설치하는 것은 완전히 다른 행위다.

둘째, 버전 표면이 하나로 고정돼 있지 않다. GitHub 최신 Release, `v2.0.0-rc.1` tag, main branch `package.json`, npm `latest`/`next`, Claude plugin identifier가 서로 다른 속도로 움직인다. 문서나 예전 글에서 `everything-claude-code`라는 이름을 보더라도 현재 GitHub source repo는 `affaan-m/ECC`, Claude plugin identifier는 `ecc@ecc`, npm package는 `ecc-universal`로 구분하는 편이 안전하다.

셋째, GitHub App과 Pro/Enterprise 표면은 OSS repo와 분리해서 봐야 한다. `ecc.tools`는 public repo 분석, `/ecc-tools analyze`, PR-first automation, private repo coverage 같은 hosted/product layer를 함께 소개하지만, 이 tips entry의 핵심은 MIT 오픈소스 저장소와 로컬 설치 표면이다. private repo 자동화나 결제 레이어는 별도 검토 대상이다.

넷째, 보안 가이드는 좋은 방향을 제시하지만 모든 위험을 대신 없애 주지는 않는다. 외부 skill catalog, prompt file, MCP server, hook script를 신뢰하기 전에 hidden instruction, broad permission, outbound command, secret injection을 직접 확인해야 한다. 특히 shared team repo에서는 user-scope가 아니라 project-local로 어떤 설정이 들어가는지 reviewable PR로 남기는 것이 좋다.

## 내 판단

ECC는 “Claude Code를 더 잘 쓰는 요령”에서 출발했지만, 지금은 여러 agent harness에 걸쳐 **스킬·규칙·훅·보안 점검을 표준화하려는 agent workflow distribution**에 가깝다. AI 코딩 도구를 매일 쓰는 개발자나 팀이라면 특정 skill 몇 개만 훑어도 얻을 것이 많다.

다만 바로 `--profile full`로 밀어 넣을 도구는 아니다. 먼저 README의 install path 차이를 이해하고, minimal/profile preview 또는 개별 skill 검토로 시작한 뒤, hooks·MCP·rules는 diff와 AgentShield scan을 거쳐 천천히 켜는 편이 좋다. “우리 agent에게 어떤 습관을 장착할 것인가”를 정하는 도구로 보면 가치가 크고, “유명해 보이니 통째로 설치하는 config pack”으로 보면 위험하다.

## 참고한 공개 자료

- [affaan-m/ECC GitHub repository](https://github.com/affaan-m/ECC)
- [ECC Tools website](https://ecc.tools)
- [ECC v2.0.0-rc.1 release notes](https://github.com/affaan-m/ECC/blob/main/docs/releases/2.0.0-rc.1/release-notes.md)
- [Cross-Harness Architecture](https://github.com/affaan-m/ECC/blob/main/docs/architecture/cross-harness.md)
- [Security Policy](https://github.com/affaan-m/ECC/blob/main/SECURITY.md)
- [`ecc-universal` on npm](https://www.npmjs.com/package/ecc-universal)
- [`ecc-agentshield` on npm](https://www.npmjs.com/package/ecc-agentshield)
