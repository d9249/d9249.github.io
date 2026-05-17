---
title: "agentmemory는 코딩 에이전트의 세션 기억을 MCP와 hooks로 이어주는 로컬 메모리 서버다"
date: "2026-05-18T01:11:19"
description: "rohitg00/agentmemory는 Claude Code, Codex, Cursor, Hermes 같은 AI 코딩 에이전트가 세션을 넘겨도 프로젝트 맥락을 검색·주입할 수 있게 해주는 TypeScript 기반 persistent memory 서버다."
author: "Sangmin Lee"
repository: "rohitg00/agentmemory"
sourceUrl: "https://github.com/rohitg00/agentmemory"
status: "Open source"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Memory"
  - "MCP"
  - "Developer Tools"
  - "TypeScript"
  - "CLI"
highlights:
  - "`npm install -g @agentmemory/agentmemory` 또는 `npx -y @agentmemory/agentmemory@latest`로 시작하는 Node 20+ TypeScript CLI이며, npm 최신 버전은 v0.9.18이다."
  - "Claude Code·Codex CLI는 hooks/plugin까지, Cursor·Gemini CLI·OpenCode·Cline·Roo Code 등은 MCP shim으로 붙일 수 있고, 서버가 떠 있으면 51개 MCP memory tool을 노출한다."
  - "PostToolUse/UserPrompt/SessionStart 같은 이벤트를 관찰해 BM25·vector·graph 검색과 4-tier memory consolidation으로 다음 세션에 필요한 맥락을 돌려주는 구조다."
  - "REST API는 기본 `127.0.0.1:3111`, viewer는 `127.0.0.1:3113`, iii-engine WebSocket은 `49134`를 쓰며, Windows는 별도 iii-engine binary 또는 Docker 경로가 필요하다."
  - "프롬프트·tool input/output·파일 접근 패턴을 장기 저장하는 도구라서 `AGENTMEMORY_SECRET`, LLM/embedding key, context injection, export/delete/team-share 범위를 먼저 확인해야 한다."
draft: false
---

AI 코딩 에이전트를 오래 쓰다 보면 모델 성능보다 **기억의 단절**이 더 크게 느껴질 때가 있다. 어제 고친 인증 구조, 지난 세션에서 합의한 테스트 방식, 어떤 파일을 왜 건드렸는지를 매번 다시 설명하면 토큰도 시간도 새나간다.

`agentmemory`는 이 문제를 “에이전트 바깥의 로컬 메모리 서버”로 풀려는 프로젝트다. Claude Code, Codex CLI, Cursor, Gemini CLI, Hermes, OpenClaw, OpenCode 같은 도구에 hooks, MCP, REST API를 붙이고, 세션에서 나온 관찰을 검색 가능한 메모리로 축적한다. 다음 세션에서는 프로젝트 profile, 과거 session, smart search, context payload 형태로 다시 꺼내 쓰는 구조다.

조사 시점 기준 저장소 `rohitg00/agentmemory`는 TypeScript 중심의 Apache-2.0 오픈소스이며, GitHub 최신 Release와 npm 패키지 `@agentmemory/agentmemory` 모두 `v0.9.18`이다. 실행 패키지는 Node.js `>=20`을 요구하고, 내부 런타임은 `iii-engine` v0.11.x 계열에 기대는 구조다.

![agentmemory banner](/images/tips/agentmemory-banner.png)

## agentmemory 개요

agentmemory의 제품 중심은 단순한 “메모 저장 CLI”가 아니라 **로컬 daemon + MCP server + agent hooks + viewer** 조합이다.

기본 흐름은 다음과 같다.

- 에이전트의 `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart` 같은 이벤트를 hooks가 관찰한다.
- 관찰 내용은 dedup과 privacy filter를 거쳐 raw observation으로 저장된다.
- 선택적으로 LLM compression, vector embedding, knowledge graph extraction, slot reflection 같은 후처리가 붙는다.
- 검색은 BM25, vector, graph signal을 섞고, 필요한 메모리를 token budget 안에서 다음 세션/context에 돌려준다.
- viewer와 iii console은 live observation, session replay, memory browser, trace/state를 보는 디버깅 표면을 제공한다.

README는 working/episodic/semantic/procedural의 4-tier memory model을 강조한다. 즉 “최근 tool output을 저장한다”에서 끝나는 것이 아니라, session summary, 반복 패턴, 프로젝트별 profile, 절차 기억까지 단계적으로 정리하려는 설계다.

## 설치와 첫 사용법

가장 단순한 시작은 npm 패키지다.

```bash
npm install -g @agentmemory/agentmemory
agentmemory                                  # memory server 시작
agentmemory demo                             # 샘플 세션 seed + recall 확인
agentmemory connect claude-code              # 지원 에이전트 연결
agentmemory doctor                           # 진단과 수정 프롬프트
```

전역 설치 없이 바로 시험하려면 다음도 된다.

```bash
npx -y @agentmemory/agentmemory@latest
```

서버를 띄운 뒤 기본 확인 지점은 두 개다.

```bash
curl http://localhost:3111/agentmemory/health
open http://localhost:3113
```

기본 REST API는 `127.0.0.1:3111`, stream port는 `3112`, viewer는 `3113`, iii-engine WebSocket은 `49134`를 쓴다. README 기준 source build는 `git clone`, `npm install`, `npm run build`, `npm start` 흐름이고, iii-engine이 없으면 local binary 또는 Docker Compose 경로를 사용한다.

Windows도 지원 대상에 들어가지만 “npm 패키지만 설치하면 끝”은 아니다. 별도의 `iii.exe`를 PATH에 두거나 Docker Desktop 경로를 써야 한다. macOS/Linux 쪽은 iii-engine prebuilt tarball과 Docker 경로가 함께 안내되어 있다.

## MCP와 agent 연결 방식

agentmemory가 흥미로운 지점은 여러 에이전트에 같은 메모리 서버를 공유할 수 있다는 점이다.

Claude Code는 plugin marketplace 흐름을 제공한다. README 기준 `/plugin marketplace add rohitg00/agentmemory`와 `/plugin install agentmemory`로 12 hooks, 4 skills, MCP 설정을 함께 등록하는 방식이다.

Codex CLI도 별도 plugin 흐름이 있다.

```bash
npx @agentmemory/agentmemory                 # 별도 터미널에서 서버 시작
codex plugin marketplace add rohitg00/agentmemory
codex plugin install agentmemory
```

Cursor, Claude Desktop, Cline, Roo Code, Windsurf, Gemini CLI, OpenClaw 같은 MCP 클라이언트는 보통 다음 block을 각 클라이언트의 MCP 설정에 merge한다.

```json
{
  "mcpServers": {
    "agentmemory": {
      "command": "npx",
      "args": ["-y", "@agentmemory/mcp"],
      "env": {
        "AGENTMEMORY_URL": "http://localhost:3111"
      }
    }
  }
}
```

여기서 중요한 디테일이 있다. `@agentmemory/mcp`는 얇은 shim 패키지다. `AGENTMEMORY_URL`로 실행 중인 agentmemory 서버에 닿으면 51개 MCP tool을 proxy하고, 서버가 없으면 `memory_save`, `memory_recall`, `memory_smart_search`, `memory_sessions`, `memory_export`, `memory_audit`, `memory_governance_delete` 같은 축소된 local fallback 도구만 제공한다. “툴이 7개밖에 안 보인다”면 MCP 설정이 아니라 서버 실행과 `AGENTMEMORY_URL`부터 확인하는 편이 맞다.

## 무엇이 유용한가

agentmemory가 잘 맞는 상황은 명확하다. 같은 프로젝트를 여러 날에 걸쳐 코딩 에이전트와 작업하고, 매번 같은 맥락을 다시 주입하고 있다면 효과를 체감하기 쉽다.

예를 들면 다음 같은 기억을 자동으로 되살리는 쪽이다.

- 인증은 `jose` middleware로 구현했고, Edge runtime 때문에 `jsonwebtoken`을 피했다.
- 특정 API route의 rate limit 테스트는 어느 파일에 있다.
- 지난 세션에서 N+1 query를 어떤 relation preload로 해결했다.
- 프로젝트별 선호 테스트 명령, lint 예외, migration 주의점이 있다.
- subagent나 다른 MCP client가 같은 memory server를 공유해야 한다.

수동 메모 도구와의 차이는 hooks다. `/remember`처럼 사람이 직접 저장하는 경로도 있지만, agentmemory의 기본 가치는 tool use와 session lifecycle을 관찰해 “나중에 검색할 재료”를 계속 쌓는 데 있다. README의 benchmark 수치처럼 retrieval 품질을 강조하는 주장도 있지만, 실제 도입에서는 숫자보다 **내 프로젝트에서 어떤 이벤트를 저장하고, 얼마만큼 다시 주입할지**를 먼저 측정하는 편이 좋다.

## viewer와 운영 표면

agentmemory는 `http://localhost:3113` viewer를 자동으로 띄운다. 여기서는 live observation stream, session explorer, memory browser, knowledge graph, health dashboard를 볼 수 있다. session replay도 지원해서 과거 세션의 prompt, tool call, tool result, response를 timeline으로 다시 보는 흐름을 제공한다.

![agentmemory iii console traces](/images/tips/agentmemory-iii-traces.png)

또 하나의 표면은 iii console이다. agentmemory가 iii-engine primitive 위에 올라가 있기 때문에 workers, functions, triggers, state, streams, traces를 엔진 관점에서 볼 수 있다. 제품 사용자에게는 viewer가 더 직관적이고, 런타임을 디버깅하거나 self-host 환경에서 상태를 확인할 때는 iii console이 더 낮은 레벨의 관측 창에 가깝다.

REST API도 넓다. README 기준 `/agentmemory/health`, `/agentmemory/observe`, `/agentmemory/smart-search`, `/agentmemory/context`, `/agentmemory/remember`, `/agentmemory/forget`, `/agentmemory/export`, `/agentmemory/audit`, `/agentmemory/team/share` 같은 endpoint가 있고 전체 endpoint 수는 121개로 정리되어 있다.

## 주의할 점

가장 큰 caveat는 privacy와 권한 경계다. agentmemory는 이름 그대로 “에이전트가 한 일을 오래 기억하게 하는” 도구다. README 기준 hooks는 user prompt, tool input/output, file access pattern, error context, session summary 등을 다룬다. privacy filter가 API key와 secret을 지우는 설계를 갖고 있더라도, 회사 코드·고객 데이터·credential이 섞인 환경에서는 저장 위치, export 범위, delete/audit 흐름을 먼저 확인해야 한다.

실무적으로는 다음 항목을 체크하는 편이 좋다.

- **REST/viewer 노출**: 기본은 loopback bind지만, reverse proxy나 LAN 노출을 고려한다면 `AGENTMEMORY_SECRET`을 설정해야 한다. `.env.example`은 secret이 없으면 REST endpoint가 loopback에서 열려 있다고 설명한다.
- **LLM 비용**: 기본 no-op provider에서는 LLM-backed compression/summarization이 꺼져 있고 synthetic/BM25 경로가 동작한다. `AGENTMEMORY_AUTO_COMPRESS=true`나 provider key를 켜면 관찰 batch마다 LLM 비용이 발생할 수 있다.
- **context injection**: `AGENTMEMORY_INJECT_CONTEXT`는 기본 off다. 켜면 SessionStart/PreToolUse 주변에서 메모리를 더 적극적으로 주입할 수 있지만, 세션 token budget과 프롬프트 오염을 같이 관리해야 한다.
- **Claude subscription fallback**: `AGENTMEMORY_ALLOW_AGENT_SDK=true`는 opt-in이다. 소스와 문서는 Claude Agent SDK child session이 Stop-hook recursion을 만들 수 있어 기본값에서 빠졌다고 설명한다.
- **MCP tool 권한**: `memory_export`, `memory_governance_delete`, team share, snapshot, signal, action 계열 도구는 단순 검색 이상의 상태 변경을 한다. 신뢰한 MCP client와 project에서만 붙이는 편이 안전하다.
- **upgrade command**: `agentmemory upgrade`는 JavaScript dependency update, `cargo install iii-engine --force`, Docker image pull 같은 runtime mutation을 할 수 있다고 README가 경고한다.

## 내 판단

agentmemory는 “에이전트가 기억을 가지면 좋겠다”는 추상적 아이디어를 꽤 제품형으로 밀어붙인 프로젝트다. MCP shim, Claude/Codex plugin, hooks, REST, viewer, session replay, export/audit/delete까지 갖추고 있어 단순 라이브러리보다 로컬 memory runtime에 가깝다.

내 기준으로는 Claude Code나 Codex를 매일 같은 repo에서 쓰고, 세션이 바뀔 때마다 “이 프로젝트에서는 이렇게 해”를 반복하는 사람에게 특히 잘 맞는다. 여러 에이전트가 같은 프로젝트를 건드리는 workflow라면 공유 메모리 서버라는 구조도 매력적이다.

반대로 작은 one-off 작업, 민감한 고객 저장소, 엄격한 보안 경계가 필요한 회사 환경에서는 바로 hooks를 전부 켜기보다, no-op/loopback 기본값으로 시작해서 저장되는 observation, export 결과, delete/audit 기능, `AGENTMEMORY_SECRET` 설정을 확인한 뒤 범위를 넓히는 편이 낫다. 기억은 강력하지만, 오래 남는다는 점 자체가 리스크이기도 하다.

## 참고한 공개 자료

- [rohitg00/agentmemory GitHub repository](https://github.com/rohitg00/agentmemory)
- [agentmemory README](https://github.com/rohitg00/agentmemory/blob/main/README.md)
- [@agentmemory/agentmemory npm package](https://www.npmjs.com/package/@agentmemory/agentmemory)
- [v0.9.18 GitHub release](https://github.com/rohitg00/agentmemory/releases/tag/v0.9.18)
- [agentmemory SECURITY.md](https://github.com/rohitg00/agentmemory/blob/main/SECURITY.md)
- [agentmemory .env.example](https://github.com/rohitg00/agentmemory/blob/main/.env.example)
- [@agentmemory/mcp package README](https://github.com/rohitg00/agentmemory/blob/main/packages/mcp/README.md)
