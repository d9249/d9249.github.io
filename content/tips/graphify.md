---
title: "Graphify는 AI 코딩 에이전트에게 프로젝트 지도를 만들어주는 지식 그래프 CLI다"
date: "2026-05-11T18:12:29"
description: "safishamsi/graphify는 Claude Code, Codex, Hermes, Cursor, Gemini CLI 같은 AI 코딩 어시스턴트에서 프로젝트 폴더를 graph.html, GRAPH_REPORT.md, graph.json으로 변환해 코드·문서·PDF·이미지·영상까지 질의 가능한 지식 그래프로 만드는 Python CLI/skill입니다."
author: "Sangmin Lee"
repository: "safishamsi/graphify"
sourceUrl: "https://github.com/safishamsi/graphify"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Knowledge Graph"
  - "CLI"
  - "RAG"
  - "Developer Tools"
  - "Python"
highlights:
  - "`uv tool install graphifyy && graphify install`로 설치하는 Python 3.10+ CLI이며, PyPI 패키지명은 `graphifyy`, 실행 명령은 `graphify`입니다."
  - "`/graphify .` 한 번으로 `graph.html`, `GRAPH_REPORT.md`, `graph.json`을 만들고, 이후 에이전트가 raw grep보다 그래프·리포트를 먼저 보게 만드는 흐름을 제공합니다."
  - "코드는 tree-sitter AST로 로컬 추출하고, 문서·PDF·이미지 등 의미 추출은 사용 중인 AI assistant/model API를 통과할 수 있어 데이터 경계를 구분해야 합니다."
  - "Claude Code, Codex, OpenCode, Cursor, Gemini CLI, GitHub Copilot CLI, VS Code Copilot Chat, Aider, OpenClaw, Hermes 등 여러 에이전트별 skill 설치 경로를 제공합니다."
  - "MCP stdio server, query/path/explain 명령, call-flow HTML, wiki/Obsidian/GraphML/Neo4j export까지 있어 큰 코드베이스 탐색 보조 도구로 써볼 만합니다."
draft: false
---

큰 프로젝트를 AI 코딩 에이전트에게 맡길 때 가장 자주 생기는 문제는 “어디부터 읽어야 하는지”다. README와 몇 개 파일만 보면 전체 구조를 놓치고, 반대로 모든 파일을 grep으로 훑으면 토큰과 시간이 금방 사라진다.

`graphify`는 이 사이를 지식 그래프로 풀려는 Python CLI이자 AI assistant skill이다. 프로젝트 폴더를 한 번 스캔해 `graphify-out/` 아래에 브라우저에서 보는 그래프, 요약 리포트, 재사용 가능한 JSON 그래프를 만들고, 이후 Claude Code·Codex·Hermes 같은 에이전트가 그 그래프를 “프로젝트 지도”처럼 먼저 읽도록 만든다.

조사 시점 기준 저장소의 기본 브랜치는 `v7`, PyPI 패키지는 `graphifyy` `0.7.13`, GitHub 최신 Release도 `v0.7.13`이다. 저장소와 checked-in LICENSE는 MIT이며, Python 3.10 이상을 요구한다. 다만 2026년 4월에 만들어진 빠르게 움직이는 프로젝트라 release/tag/README 변화가 잦다는 점은 감안하는 편이 좋다.

![Graphify repository](https://opengraph.githubassets.com/d9249-graphify/safishamsi/graphify)

## Graphify 개요

Graphify의 기본 사용 흐름은 단순하다. AI 코딩 어시스턴트 안에서 `/graphify .`를 실행하거나, 터미널에서 `graphify .`를 실행하면 현재 폴더를 분석해 세 가지 결과물을 만든다.

```text
graphify-out/
├── graph.html       # 브라우저에서 여는 인터랙티브 그래프
├── GRAPH_REPORT.md  # god nodes, 의외의 연결, 추천 질문이 담긴 요약
└── graph.json       # query/path/MCP/export에 재사용하는 전체 그래프
```

핵심은 단순 시각화가 아니라 **에이전트의 탐색 순서를 바꾸는 것**이다. 설치된 skill은 “코드베이스 질문을 받으면 먼저 `graphify-out/GRAPH_REPORT.md`를 읽고, 필요하면 그래프 query/path/explain을 사용하라”는 식의 지침을 각 에이전트 설정 위치에 심는다. 그래서 큰 저장소를 볼 때 raw file search로 바로 뛰어들기 전에 구조적 힌트를 먼저 얻는 흐름이 된다.

Graphify가 리포트에서 강조하는 항목도 이 목적에 맞춰져 있다.

- **God nodes**: 프로젝트에서 연결이 가장 많은 핵심 개념
- **Surprising connections**: 서로 멀리 있는 파일·모듈 사이의 의외 연결
- **The why**: `NOTE`, `WHY`, `HACK` 같은 주석과 문서화된 설계 이유
- **Suggested questions**: 그래프로 물어보면 좋은 질문 후보
- **Confidence tags**: 관계가 `EXTRACTED`, `INFERRED`, `AMBIGUOUS` 중 어디에 가까운지 표시

## 설치와 첫 사용법

공식 README의 기본 설치 경로는 `uv tool` 또는 `pipx`다. 주의할 점은 PyPI 패키지명은 `graphifyy`로 y가 두 개지만, 설치 뒤 실행 명령은 `graphify`라는 것이다.

```bash
uv tool install graphifyy && graphify install
# 또는
pipx install graphifyy && graphify install
# 또는
pip install graphifyy && graphify install
```

기본 `graphify install`은 Claude Code 쪽 설치 흐름이다. 다른 에이전트는 platform 옵션을 명시하는 방식이 더 안전하다.

```bash
graphify install --platform codex
graphify install --platform opencode
graphify install --platform hermes
graphify install --platform gemini
graphify install --platform cursor
```

README와 패키지 소스 기준으로 Claude Code, Codex, OpenCode, Cursor, Gemini CLI, GitHub Copilot CLI, VS Code Copilot Chat, Aider, OpenClaw, Factory Droid, Trae, Hermes, Kimi Code, Kiro, Pi, Google Antigravity 등을 대상으로 한 설치 경로가 제공된다. Windows Claude Code용으로는 `graphify install --platform windows`도 따로 안내한다.

첫 실행은 에이전트 안에서 다음처럼 시작한다.

```bash
/graphify .
```

Codex에서는 README 기준 `$graphify`를 쓰며, PowerShell에서는 `/graphify .`의 앞 슬래시가 경로 구분자로 해석될 수 있으므로 `graphify .`처럼 실행하라고 안내한다.

## 무엇을 그래프로 만들 수 있나

Graphify는 코드만 다루는 도구가 아니다. README 기준 지원 범위는 꽤 넓다.

- **코드**: Python, TypeScript/JavaScript, Go, Rust, Java, C/C++, Ruby, C#, Kotlin, Swift, Lua, Zig, PowerShell, Elixir, Objective-C, Julia, Vue/Svelte, SQL 등 다수 언어
- **문서**: Markdown, MDX, HTML, txt, reStructuredText, YAML
- **PDF와 Office**: PDF, docx, xlsx 등. Office는 `graphifyy[office]` extra 필요
- **이미지·영상·오디오**: png, jpg, webp, gif, mp4, mov, mp3, wav 등. 영상/오디오는 `graphifyy[video]` extra 필요
- **URL/YouTube**: `graphify add <url>` 형태로 추가 가능
- **Google Workspace shortcut**: `.gdoc`, `.gsheet`, `.gslides`는 opt-in과 `gws` 인증이 필요

내부 처리는 세 층으로 나뉜다. 코드 파일은 tree-sitter AST로 로컬에서 구조를 뽑는다. 영상과 오디오는 `faster-whisper`로 로컬 전사한다. 문서, 논문, 이미지, transcript의 의미 관계 추출은 AI assistant나 지정한 headless backend를 통해 처리될 수 있다.

이 구분이 중요하다. “코드는 로컬 파싱”이라고 해서 모든 입력이 항상 로컬만 도는 것은 아니다. README의 Privacy 섹션은 docs/PDF/images가 사용 중인 assistant model API로 전달될 수 있고, headless extraction에는 Gemini, Kimi, Claude, OpenAI, Ollama, Bedrock 같은 backend 설정이 필요하다고 설명한다.

## 활용 포인트

Graphify가 특히 잘 맞는 경우는 “이미 저장소가 크고, 에이전트가 자주 길을 잃는” 상황이다.

```bash
/graphify .                        # 현재 폴더 그래프 생성
/graphify ./docs --update          # 바뀐 파일만 재추출
/graphify . --wiki                 # agent가 순회하기 쉬운 Markdown wiki 생성
/graphify query "what connects auth to the database?"
/graphify path "UserService" "DatabasePool"
/graphify explain "RateLimiter"

graphify export callflow-html      # Mermaid 기반 architecture/call-flow HTML 생성
graphify hook install              # git commit/check-out 뒤 graph 갱신 hook 설치
graphify merge-graphs a.json b.json --out merged.json
```

특히 `graphify export callflow-html`은 `graphify-out/graph.json`에서 self-contained architecture/call-flow HTML을 만들기 때문에, 코드 리뷰나 온보딩 문서에 붙이기 좋다. `python -m graphify.serve graphify-out/graph.json`로 MCP stdio server를 띄우면 agent가 `query_graph`, `get_node`, `get_neighbors`, `shortest_path` 같은 구조화된 도구로 그래프를 탐색할 수도 있다.

팀 단위로는 `graphify-out/`을 일부 커밋해 공유하는 흐름을 제안한다. 한 사람이 `/graphify .`를 돌려 그래프와 리포트를 만들고, 다른 사람이 pull해서 바로 같은 지도를 읽게 하는 식이다. README는 `graphify-out/manifest.json`과 `graphify-out/cost.json`은 로컬 성격이 강하므로 `.gitignore`에 넣는 쪽을 권장한다.

## 주의할 점

첫째, 데이터 경계를 먼저 정해야 한다. 코드 AST 추출은 로컬이고, 보안 문서도 “analysis 중 네트워크 리스너를 띄우지 않고, MCP는 stdio이며, source file을 실행하지 않는다”고 설명한다. 하지만 문서·PDF·이미지 의미 추출이나 headless LLM extraction은 외부 model API를 쓸 수 있다. 회사 코드, 고객 문서, 계약서, 비공개 논문을 넣기 전에는 어떤 backend가 호출되는지 확인해야 한다.

둘째, `graphify-out/`을 그대로 커밋하면 프로젝트 구조와 개념, 파일명, 설계 의도, 일부 문서 내용이 팀 저장소에 남는다. 협업에는 유용하지만 공개 repo나 고객사 repo에서는 `GRAPH_REPORT.md`, `graph.json`, `graph.html`에 민감한 이름이나 비즈니스 로직이 들어가지 않는지 봐야 한다. 필요하면 `.graphifyignore`로 `node_modules/`, `dist/`, generated file뿐 아니라 secrets, customer data, private docs도 제외하는 편이 좋다.

셋째, agent 설정을 수정하는 도구라는 점을 기억해야 한다. `graphify install --platform hermes`는 `~/.hermes/skills/graphify/SKILL.md` 쪽에 skill을 복사하고, Codex/OpenCode/OpenClaw 계열은 `.agents`나 각 agent별 skill 경로를 건드린다. 기존에 직접 관리하던 agent instruction, skill manager, project-level config가 있다면 설치 전후 diff를 확인하는 습관이 좋다.

넷째, 프로젝트가 매우 빠르게 변한다. GitHub API 기준 최신 Release는 `v0.7.13`이고 PyPI도 `0.7.13`이지만, tag 목록에는 더 높은 이름의 tag도 보인다. 실제 도입에서는 README, PyPI, GitHub Release 중 어느 표면을 기준으로 고정할지 정하고, `uv tool upgrade graphifyy`나 `pip install --upgrade graphifyy`로 업데이트할 때 출력과 changelog를 확인하는 쪽이 안전하다.

## 내 판단

Graphify는 “AI에게 코드베이스를 더 많이 읽게 하는 도구”라기보다 “먼저 지도를 만들고, 그 지도를 따라 읽게 하는 도구”에 가깝다. 작은 프로젝트에서는 준비 비용이 오히려 클 수 있지만, 코드·문서·PDF·설계 메모가 섞인 큰 작업 공간에서는 에이전트가 같은 질문을 반복해서 파일 검색하는 비용을 줄여줄 가능성이 있다.

개인적으로는 새 repo 온보딩, 레거시 코드 구조 파악, 여러 서비스 사이 연결 추적, 문서와 코드가 엇갈린 프로젝트 정리, AI 코딩 세션 전에 “먼저 지도부터 만들기” 루틴에 잘 맞는다고 본다. 반대로 민감한 문서가 많은 회사 저장소에서는 바로 전체 폴더를 넣기보다 `.graphifyignore`, backend 설정, `graphify-out/` 커밋 정책을 먼저 정한 뒤 제한된 범위에서 시작하는 편이 낫다.

## 참고한 공개 자료

- [safishamsi/graphify GitHub repository](https://github.com/safishamsi/graphify)
- [Graphify README](https://github.com/safishamsi/graphify/blob/v7/README.md)
- [Graphify PyPI package: graphifyy](https://pypi.org/project/graphifyy/)
- [Latest GitHub release v0.7.13](https://github.com/safishamsi/graphify/releases/tag/v0.7.13)
- [How graphify works](https://github.com/safishamsi/graphify/blob/v7/docs/how-it-works.md)
- [Graphify SECURITY.md](https://github.com/safishamsi/graphify/blob/v7/SECURITY.md)
- [Graphify LICENSE](https://github.com/safishamsi/graphify/blob/v7/LICENSE)
