---
title: "CodeGraph는 AI 코딩 에이전트에게 로컬 코드 지식 그래프를 붙이는 MCP 서버다"
date: "2026-05-25T03:33:50"
description: "colbymchenry/codegraph는 Claude Code, Cursor, Codex CLI, OpenCode, Hermes Agent가 큰 코드베이스를 grep 반복 대신 로컬 SQLite 지식 그래프로 탐색하게 해주는 TypeScript 기반 CLI/MCP 도구입니다."
author: "Sangmin Lee"
repository: "colbymchenry/codegraph"
sourceUrl: "https://github.com/colbymchenry/codegraph"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "MCP"
  - "Knowledge Graph"
  - "Developer Tools"
  - "TypeScript"
  - "CLI"
highlights:
  - "`codegraph init -i`로 프로젝트별 `.codegraph/codegraph.db`를 만들고, MCP tool이 symbol/search/call graph/context를 바로 질의한다."
  - "Claude Code, Cursor, Codex CLI, opencode, Hermes Agent를 대상으로 MCP 설정과 instruction 파일을 자동으로 써 주는 installer를 제공한다."
  - "macOS·Linux·Windows x64/arm64용 self-contained release bundle과 npm optional dependency를 제공해 Node가 없거나 버전이 달라도 실행 경로가 있다."
  - "tree-sitter AST, SQLite FTS5, import/framework route resolution, native file watcher를 조합해 코드 탐색을 로컬에서 처리한다."
  - "agent 설정과 프로젝트 인덱스를 건드리는 도구라서 설치 전후 diff, `.gitignore`, `.codegraph/` 커밋 여부를 반드시 확인해야 한다."
draft: false
---

큰 저장소에서 AI 코딩 에이전트가 헤매는 이유는 대개 “모델이 모른다”보다 “어디를 먼저 봐야 하는지 모른다”에 가깝다. 파일을 하나씩 읽고, `grep`을 반복하고, sub-agent가 또 같은 탐색을 되풀이하면 토큰과 시간이 빠르게 사라진다.

`CodeGraph`는 이 탐색 단계를 미리 만든 **로컬 코드 지식 그래프**로 바꾸려는 CLI/MCP 도구다. 프로젝트를 한 번 인덱싱해 `.codegraph/codegraph.db` SQLite 데이터베이스를 만들고, Claude Code·Cursor·Codex CLI·opencode·Hermes Agent가 MCP tool로 symbol, callers/callees, impact, task context를 질의하게 한다.

조사 시점 기준 저장소 `colbymchenry/codegraph`는 TypeScript 프로젝트이며 GitHub 최신 Release와 npm 패키지 `@colbymchenry/codegraph` 모두 `v0.9.4`다. GitHub API와 checked-in `LICENSE` 모두 MIT로 확인된다. README의 benchmark 수치는 자체 측정 기준이므로 독립 벤치마크처럼 받아들이기보다는 “대형 repo에서 탐색 호출을 줄이는 방향”의 참고 신호로 보는 편이 좋다.

![CodeGraph interactive init demo](/images/tips/codegraph-init.gif)

## CodeGraph 개요

CodeGraph의 핵심 구조는 단순하다.

```text
source files
  → tree-sitter extraction
  → SQLite graph database + FTS5
  → import/framework resolution
  → MCP tools for agents
```

인덱스에는 파일, 함수, 클래스, 메서드, 타입, import, route 같은 node와 `calls`, `imports`, `extends`, `references` 같은 edge가 저장된다. 에이전트는 `codegraph_search`, `codegraph_context`, `codegraph_trace`, `codegraph_callers`, `codegraph_callees`, `codegraph_impact`, `codegraph_explore` 같은 MCP tool을 통해 이 그래프를 조회한다.

중요한 포인트는 CodeGraph가 “또 하나의 채팅 앱”이 아니라는 점이다. 실제 편집과 판단은 기존 코딩 에이전트가 하고, CodeGraph는 그 에이전트가 파일 시스템을 원시 탐색하기 전에 볼 수 있는 구조화된 지도 역할을 한다.

## 왜 유용한가

CodeGraph가 겨냥하는 문제는 명확하다. 큰 코드베이스에서 “이 요청 흐름이 어디로 이어지나?”, “이 함수를 바꾸면 어디가 영향 받나?”, “이 기능을 고치려면 어떤 파일부터 봐야 하나?” 같은 질문을 매번 raw `grep`으로 풀지 않게 하는 것이다.

특히 유용한 지점은 다음과 같다.

- **탐색 호출 감소**: README 기준 7개 오픈소스 저장소 A/B 측정에서 평균 35% 비용 절감, 57% token 감소, 46% 시간 단축, 71% tool call 감소를 주장한다. 숫자 자체보다 “한두 번의 graph query로 탐색을 좁힌다”는 사용 패턴이 핵심이다.
- **flow 질문에 강함**: `codegraph_trace`는 두 symbol 사이 call path를 본문과 함께 반환하고, callback, observer, React re-render, interface→implementation 같은 정적 호출만으로는 끊기기 쉬운 흐름도 일부 합성 edge로 이어준다.
- **framework route 인식**: Django, FastAPI, Express, NestJS, Rails, Spring, Laravel, Gin, Axum, ASP.NET, SvelteKit, Vue/Nuxt 등 여러 framework route를 handler와 연결하려는 resolver가 들어 있다.
- **항상 최신 상태 유지**: MCP server가 FSEvents, inotify, ReadDirectoryChangesW 같은 OS file event를 보고 변경된 source file을 incremental sync한다.
- **local-first**: README와 문서 기준 데이터는 `.codegraph/` 아래 SQLite DB에 저장되고, API key나 외부 서비스 없이 로컬에서 동작한다.

지원 언어도 꽤 넓다. 문서 기준 TypeScript/JavaScript, Python, Go, Rust, Java, C#, PHP, Ruby, C/C++, Swift, Kotlin, Scala, Dart, Svelte, Vue, Liquid, Pascal/Delphi, Lua, Luau를 파싱한다.

## 설치와 첫 사용법

가장 간단한 설치는 OS별 standalone installer다. 이 경로는 CodeGraph가 vendored Node runtime을 포함한 release bundle을 내려받기 때문에, 로컬에 Node.js가 없어도 된다.

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh

# Windows PowerShell
irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex
```

이미 Node/npm을 쓰는 환경이라면 npm 경로도 제공된다.

```bash
npx @colbymchenry/codegraph
npm i -g @colbymchenry/codegraph
```

npm 패키지는 `@colbymchenry/codegraph-darwin-arm64`, `@colbymchenry/codegraph-linux-x64`, `@colbymchenry/codegraph-win32-x64` 같은 platform optional dependency를 통해 self-contained bundle을 설치하는 방식이다. npm registry mirror가 이 optional package를 누락하면 GitHub Release bundle로 self-heal download를 시도하고, `SHA256SUMS`가 있는 최신 release에서는 checksum도 확인한다.

프로젝트별 첫 사용은 다음 흐름이다.

```bash
cd your-project
codegraph init -i      # initialize + full index
codegraph status       # node/edge/file count와 SQLite 상태 확인
```

그 뒤에는 CLI로 직접 질의할 수도 있다.

```bash
codegraph query UserService
codegraph callers handleRequest
codegraph callees handleRequest
codegraph impact AuthMiddleware
codegraph context "fix the login flow"
```

## 에이전트에 붙이는 방식

`codegraph install` 또는 bare `codegraph` 실행은 interactive installer로 동작한다. 설치기는 Claude Code, Cursor, Codex CLI, opencode, Hermes Agent를 감지하고, 선택한 대상에 MCP server 설정과 instruction 파일을 쓴다.

비대화형 환경에서는 다음처럼 쓸 수 있다.

```bash
codegraph install --yes
codegraph install --target=cursor,claude --yes
codegraph install --target=auto --location=local
codegraph install --print-config codex
```

수동 MCP 설정의 핵심은 결국 stdio server 한 줄이다.

```json
{
  "mcpServers": {
    "codegraph": {
      "type": "stdio",
      "command": "codegraph",
      "args": ["serve", "--mcp"]
    }
  }
}
```

Hermes Agent 쪽은 소스 기준 `$HERMES_HOME/config.yaml`의 `mcp_servers.codegraph`와 `platform_toolsets.cli`의 `mcp-codegraph` entry를 함께 다룬다. Cursor는 MCP subprocess working directory 문제가 있어 installer가 `--path`를 자동으로 넣는 식으로 보정한다.

## 활용 포인트

내가 본 CodeGraph의 좋은 사용처는 “AI에게 코드를 덜 읽게 하는 것”이 아니라 **처음부터 더 맞는 코드를 읽게 하는 것**이다.

예를 들어 이런 workflow에 잘 맞는다.

```bash
# 새 프로젝트에 지도 만들기
codegraph init -i

# 변경된 파일만 갱신
codegraph sync

# PR에서 바뀐 source가 건드릴 가능성이 있는 테스트 찾기
git diff --name-only | codegraph affected --stdin --quiet

# 에이전트에게는 MCP tool로 먼저 구조를 보게 하기
codegraph serve --mcp
```

특히 `codegraph affected`는 import dependency를 따라 변경 파일과 관련된 test file을 찾는 기능이라, 대형 repo의 pre-commit hook이나 CI optimization에도 응용할 수 있다.

## 주의할 점

첫째, installer는 agent 설정을 실제로 수정한다. Claude Code, Cursor, Codex, opencode, Hermes의 MCP config와 instruction 파일에 CodeGraph entry를 넣고, Claude 쪽은 permission allow-list도 다룬다. 이미 직접 관리하던 agent instruction이나 dotfile sync가 있다면 설치 전후 diff를 확인하는 편이 좋다.

둘째, `.codegraph/`는 로컬 인덱스다. 문서 기준 데이터가 외부로 나가지는 않지만, SQLite DB 안에는 프로젝트의 파일명, symbol 이름, route, call 관계 같은 구조 정보가 들어간다. 보통은 커밋하지 않는 것이 자연스럽고, 공개 repo에 실수로 올라가지 않도록 `.gitignore`를 확인해야 한다.

셋째, CodeGraph는 `.gitignore`를 신뢰한다. 문서가 명시하듯 `node_modules`, build output, `.env`처럼 gitignore된 파일은 인덱싱하지 않지만, `vendor/`나 `dist/`가 커밋되어 있고 gitignore되지 않았다면 인덱싱 대상이 될 수 있다. “그래프에 들어가면 안 되는 파일”은 먼저 `.gitignore` 정책부터 정리하는 편이 안전하다.

넷째, local-first는 “위험이 없다”는 뜻이 아니다. MCP tool 자체는 주로 조회용이지만, 이를 호출하는 에이전트는 여전히 프로젝트 파일을 읽고 수정할 권한을 가진다. CodeGraph의 instruction은 “grep으로 재검증하지 말고 그래프 결과를 신뢰하라”는 방향을 강하게 제안하므로, 중요한 변경에서는 테스트와 코드 리뷰로 별도 검증해야 한다.

다섯째, source build와 release bundle 경로를 구분해야 한다. 사용자 설치는 self-contained bundle 중심이지만, 저장소를 직접 빌드하는 개발 경로는 `package.json` 기준 Node `>=20.0.0 <25.0.0`을 요구한다. Node 25 계열은 소스의 version check와 changelog상 명시적으로 막고 있다.

## 내 판단

CodeGraph는 Graphify처럼 사람이 볼 `graph.html`을 만들어주는 도구라기보다, **에이전트가 바로 질의하는 코드 탐색 인프라**에 더 가깝다. 큰 저장소에서 Claude Code, Codex, Cursor가 “일단 grep부터 많이 하는” 패턴을 자주 보인다면 꽤 실용적인 보조 레이어가 될 수 있다.

반대로 작은 스크립트 repo, 단일 파일 수정, 문서 작업 위주라면 초기 인덱싱과 agent 설정 변경이 과할 수 있다. 내 기준 추천 대상은 큰 TypeScript/Python/Go/Rust/Java 계열 저장소를 AI agent와 자주 다루고, “이 코드 어디서 호출돼?” “이 route가 어느 service로 가?” 같은 구조 질문을 반복하는 개발자다. 먼저 한 프로젝트에서 `.codegraph/`를 만들고, 에이전트가 실제로 raw file read를 얼마나 줄이는지 관찰해보는 식으로 도입하는 게 좋다.

## 참고한 공개 자료

- [colbymchenry/codegraph GitHub repository](https://github.com/colbymchenry/codegraph)
- [CodeGraph documentation](https://colbymchenry.github.io/codegraph/)
- [CodeGraph installation guide](https://colbymchenry.github.io/codegraph/getting-started/installation/)
- [CodeGraph MCP server reference](https://colbymchenry.github.io/codegraph/reference/mcp-server/)
- [CodeGraph language reference](https://colbymchenry.github.io/codegraph/reference/languages/)
- [@colbymchenry/codegraph npm package](https://www.npmjs.com/package/@colbymchenry/codegraph)
- [v0.9.4 GitHub release](https://github.com/colbymchenry/codegraph/releases/tag/v0.9.4)
- [CodeGraph CHANGELOG](https://github.com/colbymchenry/codegraph/blob/main/CHANGELOG.md)
