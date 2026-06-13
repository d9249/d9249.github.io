---
title: "codebase-memory-mcp는 AI 코딩 에이전트에 초고속 로컬 코드 지식 그래프를 붙이는 MCP 서버다"
date: "2026-06-14T02:32:03"
description: "DeusData/codebase-memory-mcp는 C 기반 단일 바이너리로 코드베이스를 로컬 지식 그래프에 인덱싱하고, Claude Code·Codex CLI·OpenCode 같은 MCP 클라이언트가 구조 검색·call graph·impact 분석을 바로 질의하게 해주는 개발자용 도구입니다."
author: "Sangmin Lee"
repository: "DeusData/codebase-memory-mcp"
sourceUrl: "https://github.com/DeusData/codebase-memory-mcp"
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
  - "C"
  - "CLI"
highlights:
  - "158개 tree-sitter grammar와 Hybrid LSP 해석을 단일 C 바이너리에 묶어 함수·클래스·route·call chain·cross-service edge를 로컬 SQLite 그래프로 만든다."
  - "Claude Code, Codex CLI, Gemini CLI, Zed, OpenCode, Aider, VS Code 등 11개 에이전트 설정을 `install` 명령으로 자동 감지·등록한다."
  - "macOS·Linux·Windows release asset, npm/PyPI package, Homebrew/Scoop/Winget/Chocolatey/AUR 설치 경로를 함께 제공한다."
  - "UI variant를 쓰면 `localhost:9749`에서 3D graph visualization을 열 수 있고, v0.8.1부터 localhost 전용 first-party HTTP 서버로 바뀌었다."
  - "프로젝트 구조가 로컬 DB나 선택적 `.codebase-memory/graph.db.zst` artifact로 남으므로 공개 repo에 커밋할지, agent config diff를 허용할지 먼저 정해야 한다."
draft: false
---

큰 코드베이스에서 AI 코딩 에이전트가 시간을 쓰는 지점은 대개 “코드를 수정하는 순간”보다 그 전에 벌어지는 탐색이다. 파일을 읽고, `grep`을 반복하고, 비슷한 symbol을 다시 찾다가 context와 tool call을 소모한다.

`codebase-memory-mcp`는 이 탐색 단계를 **로컬 코드 지식 그래프**로 바꾸려는 MCP 서버다. 저장소를 한 번 인덱싱해 함수, 클래스, 메서드, route, import, call chain, HTTP 호출, data-flow, IaC resource를 그래프에 저장하고, 에이전트가 MCP tool로 구조를 먼저 질의하게 한다.

조사 시점 기준 저장소 `DeusData/codebase-memory-mcp`의 GitHub 최신 Release는 `v0.8.1`이고, npm·PyPI package도 `0.8.1`이다. GitHub API와 package manifest, checked-in license 모두 MIT로 확인된다. 구현 언어는 C이며, README는 “single static binary, zero runtime dependencies, no API key, all processing local”을 핵심 전제로 둔다.

![codebase-memory-mcp graph visualization UI](/images/tips/codebase-memory-mcp-graph-ui.png)

## 무엇을 해주는 도구인가

codebase-memory-mcp는 채팅 앱이나 독립 AI 에이전트가 아니다. 역할은 **구조 분석 backend**에 가깝다.

```text
source repository
  → tree-sitter AST parsing
  → Hybrid LSP type/call resolution for selected languages
  → SQLite-backed persistent knowledge graph
  → MCP tools / CLI queries / optional graph UI
  → existing coding agent answers in natural language
```

README 기준 현재 파싱 범위는 158개 언어다. 그중 Python, TypeScript/JavaScript/JSX/TSX, PHP, C#, Go, C/C++, Java, Kotlin, Rust에는 “Hybrid LSP”라는 type-aware pass를 얹어 tree-sitter만으로는 약한 import, generic, inheritance, stdlib, trait/interface dispatch 같은 해석을 보강한다.

에이전트 입장에서 중요한 MCP tool은 다음 계열이다.

- `index_repository`, `index_status`, `list_projects`: 프로젝트를 그래프에 등록하고 상태를 확인한다.
- `search_graph`, `search_code`, `semantic_query`: symbol, 구조, 코드 텍스트, semantic similarity를 찾는다.
- `trace_path`, `detect_changes`: call path와 git diff 영향 범위를 본다.
- `query_graph`, `get_graph_schema`: Cypher-like read-only query로 graph를 직접 질의한다.
- `get_architecture`, `manage_adr`, `ingest_traces`: architecture 요약, ADR, runtime trace 보강까지 다룬다.

즉 “AI가 모든 파일을 많이 읽게 하는 것”보다 **AI가 처음부터 더 맞는 파일과 call chain을 읽게 하는 것**이 핵심 사용처다.

## 왜 눈에 띄나

비슷한 코드 그래프/MCP 도구는 이미 여럿 있지만, 이 프로젝트는 배포·성능·보안 검증 쪽을 꽤 강하게 밀고 있다.

- **단일 C 바이너리**: macOS, Linux, Windows용 release asset을 제공하고, Linux에는 portable build도 따로 둔다. 별도 DB 서버나 Docker가 필수는 아니다.
- **넓은 에이전트 자동 설정**: README 기준 `install` 명령은 Claude Code, Codex CLI, Gemini CLI, Zed, OpenCode, Antigravity, Aider, KiloCode, VS Code, OpenClaw, Kiro를 감지해 MCP 설정과 instruction/hook을 써준다.
- **그래프 UI 선택지**: `ui` variant는 MCP 서버와 함께 `http://localhost:9749` 3D graph visualization을 띄운다. v0.8.1 release note에 따르면 이 UI 서버는 third-party server library를 제거한 first-party `src/ui/httpd.c`로 바뀌었고, `127.0.0.1` 전용 bind와 request size cap, strict HTTP/1.1 parsing을 적용했다.
- **팀 공유 artifact**: 원하면 `.codebase-memory/graph.db.zst` 하나를 저장소에 커밋해 동료가 full reindex를 건너뛰게 할 수 있다. SQLite DB를 compact/vacuum 후 zstd 압축하는 방식이며, merge conflict를 줄이기 위한 `.gitattributes` 처리도 자동 생성한다고 설명한다.
- **검증된 release flow 지향**: release asset에는 `checksums.txt`, Sigstore bundle, SBOM이 있고, SECURITY 문서는 SLSA provenance, cosign, VirusTotal, CodeQL, fuzzing, checksum verification을 release gate로 설명한다.

성능 수치는 README/논문 기준으로 읽어야 한다. README는 Apple M3 Pro에서 Linux kernel full index 3분, Cypher query 1ms 미만, trace path 10ms 미만, 5개 structural query에서 file-by-file 방식 대비 약 120배 token 절감이라고 주장한다. arXiv preprint는 31개 실제 저장소 평가에서 답변 품질 83%, token 10배 감소, tool call 2.1배 감소를 보고한다. 독립 재현 벤치마크로 확정하기보다는 “구조 질의가 반복되는 큰 repo에서 탐색 비용을 줄이는 방향”의 근거로 보는 편이 안전하다.

## 설치와 첫 사용법

README가 제시하는 가장 단순한 설치는 macOS/Linux one-line installer다.

```bash
curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash
```

그래프 UI가 필요하면 `--ui`를 붙인다.

```bash
curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash -s -- --ui
```

Windows는 PowerShell 스크립트 경로를 제공한다.

```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.ps1 -OutFile install.ps1
notepad install.ps1
.\install.ps1
```

package registry 경로도 있다. npm package는 Node `>=18`을 요구하고 postinstall에서 platform별 GitHub Release binary를 내려받아 checksum을 확인한다. PyPI package는 Python `>=3.8` console script를 제공한다. `server.json`도 npm은 `npx`, PyPI는 `uvx` runtime hint를 명시한다.

설치 후에는 코딩 에이전트를 재시작하고 프로젝트에서 “Index this project”라고 요청하는 흐름이 README의 기본 사용법이다. 자동 인덱싱을 켤 수도 있다.

```bash
codebase-memory-mcp config set auto_index true
codebase-memory-mcp config set auto_index_limit 50000
```

CLI로 MCP tool을 직접 호출하는 형태도 지원한다.

```bash
codebase-memory-mcp cli index_repository '{"repo_path": "/path/to/repo"}'
codebase-memory-mcp cli search_graph '{"name_pattern": ".*Handler.*", "label": "Function"}'
codebase-memory-mcp cli trace_path '{"function_name": "ProcessOrder", "direction": "both"}'
codebase-memory-mcp cli query_graph '{"query": "MATCH (f:Function) RETURN f.name LIMIT 5"}'
```

UI variant를 받았다면 다음처럼 로컬 graph viewer를 연다.

```bash
codebase-memory-mcp --ui=true --port=9749
# browser: http://localhost:9749
```

## CodeGraph와 어떻게 다르게 볼까

이 사이트에 이미 정리한 `CodeGraph`와 문제의식은 비슷하다. 둘 다 “에이전트가 raw file 탐색을 덜 하도록 로컬 code graph를 MCP로 제공한다”는 계열이다.

다만 성격은 조금 다르다.

- CodeGraph는 TypeScript 기반 CLI/MCP 도구로 `.codegraph/codegraph.db`를 프로젝트 옆에 두고, agent navigation infrastructure로 쓰는 흐름이 강하다.
- codebase-memory-mcp는 C 기반 single binary, 158개 vendored tree-sitter grammar, Hybrid LSP, release verification, 다수 package manager 배포를 전면에 세운다.
- codebase-memory-mcp의 optional UI는 사람이 graph를 직접 훑는 surface도 제공하지만, 기본 제품 경계는 여전히 “에이전트를 위한 구조 분석 backend”다.

따라서 이미 CodeGraph류를 써봤다면 비교 포인트는 “내 에이전트가 어느 쪽 installer/config와 잘 맞는가”, “내 언어의 symbol/call resolution이 충분한가”, “그래프 artifact를 repo 안에 둘지 캐시 디렉터리에 둘지”, “UI가 필요한가” 정도다.

## 주의할 점

첫째, installer는 agent 설정을 실제로 수정한다. README는 MCP server entry, instruction file, skill, hook, pre-tool hook을 자동 구성한다고 설명한다. dotfiles로 agent 설정을 관리하거나 회사 표준 MCP 설정이 있다면 설치 전후 diff를 확인하는 편이 좋다.

둘째, local-first라도 구조 정보는 남는다. 기본 SQLite database는 `~/.cache/codebase-memory-mcp/`에 저장되고, 팀 공유용 `.codebase-memory/graph.db.zst`를 선택하면 repo 안에 symbol 이름, route, call 관계, domain concept가 압축 artifact로 들어간다. 공개 저장소에서는 이 artifact를 의도적으로 공유할지, 아니면 `.gitignore`에 둘지 먼저 결정해야 한다.

셋째, `.gitignore`와 `.cbmignore` 정책이 중요하다. README는 `.git`, `node_modules` 같은 hardcoded skip, 계층적 `.gitignore`, project-specific `.cbmignore`, symlink skip을 언급한다. 반대로 private docs나 generated bundle이 repo에 커밋되어 있고 ignore되지 않았다면 graph에 포함될 수 있다.

넷째, MCP graph layer는 sandbox가 아니다. codebase-memory-mcp 자체는 구조 조회 backend에 가깝지만, 이를 호출하는 Claude Code/Codex/OpenCode류 에이전트는 여전히 파일 수정, shell 실행, git 작업 권한을 가질 수 있다. “그래프가 알려준 경로”는 탐색 힌트이지, 테스트·리뷰·권한 정책의 대체물이 아니다.

다섯째, 연구/README 수치는 프로젝트 자체 설명과 preprint 기준이다. 특히 preprint는 2026년 3월 제출본으로 66개 언어 파싱을 언급하고, 현재 README는 158개 언어와 v0.8.x 기능을 설명한다. 버전이 빠르게 움직이는 프로젝트라서 도입 전 release note와 `codebase-memory-mcp --version` 결과를 같이 보는 편이 좋다.

## 내 판단

codebase-memory-mcp는 작은 script repo보다 **중대형 codebase를 AI coding agent와 반복해서 탐색하는 사람**에게 맞다. 특히 “이 handler가 어디서 호출되지?”, “이 route 변경이 어느 service를 건드리지?”, “dead code 후보가 뭐지?”, “에이전트가 매번 grep부터 하는데 줄일 수 없나?” 같은 질문이 자주 나온다면 실험해볼 가치가 있다.

반대로 한두 파일짜리 프로젝트, 문서 수정, 가끔 쓰는 toy repo라면 인덱싱·설정 변경·artifact 관리가 과할 수 있다. 내 기준 추천 도입 순서는: 먼저 개인 프로젝트 하나에서 `--skip-config`나 수동 MCP 설정으로 좁게 테스트하고, graph query 결과가 실제 탐색 시간을 줄이는지 확인한 뒤, 팀 공유 artifact나 agent hook 자동 설치를 검토하는 것이다.

## 참고한 공개 자료

- [DeusData/codebase-memory-mcp GitHub repository](https://github.com/DeusData/codebase-memory-mcp)
- [codebase-memory-mcp official project page](https://deusdata.github.io/codebase-memory-mcp/)
- [v0.8.1 GitHub release](https://github.com/DeusData/codebase-memory-mcp/releases/tag/v0.8.1)
- [codebase-memory-mcp README](https://github.com/DeusData/codebase-memory-mcp/blob/main/README.md)
- [SECURITY.md](https://github.com/DeusData/codebase-memory-mcp/blob/main/SECURITY.md)
- [docs/BENCHMARK.md](https://github.com/DeusData/codebase-memory-mcp/blob/main/docs/BENCHMARK.md)
- [arXiv:2603.27277 — Codebase-Memory: Tree-Sitter-Based Knowledge Graphs for LLM Code Exploration via MCP](https://arxiv.org/abs/2603.27277)
- [codebase-memory-mcp npm package](https://www.npmjs.com/package/codebase-memory-mcp)
- [codebase-memory-mcp PyPI package](https://pypi.org/project/codebase-memory-mcp/)
