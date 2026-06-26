---
title: "EverOS는 에이전트 기억을 Markdown·SQLite·LanceDB로 묶는 로컬 메모리 런타임이다"
date: "2026-06-26T19:54:16"
description: "EverMind-AI/EverOS는 Python 3.12+ 기반의 로컬 우선 AI 에이전트 메모리 서버로, 대화와 파일 지식을 Markdown 원본에 저장하고 SQLite/LanceDB 인덱스로 검색하게 해주는 Apache-2.0 프로젝트입니다."
author: "Sangmin Lee"
repository: "EverMind-AI/EverOS"
sourceUrl: "https://github.com/EverMind-AI/EverOS"
status: "Open source"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Memory"
  - "RAG"
  - "Python"
  - "CLI"
  - "Developer Tools"
highlights:
  - "PyPI·GitHub 최신 버전은 v1.1.0이고, Python 3.12+에서 `pip install everos` 또는 `uv pip install everos`로 설치하는 순수 Python 패키지다."
  - "대화·agent trace·file knowledge를 `~/.everos` 아래 Markdown 원본으로 남기고, SQLite는 queue/state/audit, LanceDB는 vector·BM25·scalar 검색 인덱스를 맡는다."
  - "CLI는 `everos init`, `everos server start`, `everos cascade` 같은 운영 표면이고, 실제 add/flush/search/get 흐름은 기본 `127.0.0.1:8000` HTTP API가 처리한다."
  - "v1.1.0에서 Knowledge API와 Reflection이 추가됐지만, real memory flow에는 LLM·embedding·rerank provider 설정이 필요하고 `everos demo`만 별도 키 없이 체험할 수 있다."
  - "내장 인증은 없고 memory/config가 로컬 plaintext에 가까우므로, API 노출·provider 전송·multimodal `file://` 읽기 범위를 먼저 제한해야 한다."
draft: false
---

AI 에이전트를 오래 쓰는 사람에게 제일 답답한 지점은 모델이 똑똑하지 않아서가 아니라 **기억이 세션마다 끊긴다**는 점일 때가 많다. 프로젝트 규칙, 사용자의 선호, 지난번에 성공한 절차, 실패한 접근을 매번 다시 설명하면 결국 “context engineering”이 수작업이 된다.

`EverOS`는 이 문제를 메모리 전용 로컬 런타임으로 풀려는 프로젝트다. 저장소 설명처럼 “모든 AI agent를 위한 portable memory layer”를 지향하고, 핵심 구조는 **Markdown source of truth + SQLite 상태 저장 + LanceDB 검색 인덱스 + FastAPI 서버**다. 사람이 읽을 수 있는 `.md` 파일을 원본으로 두고, 검색과 queue 처리는 재생성 가능한 인덱스로 분리한다는 점이 눈에 띈다.

조사 시점 기준 `EverMind-AI/EverOS`는 Apache-2.0 라이선스의 Python 프로젝트이며, GitHub Release와 PyPI 최신 버전은 모두 `1.1.0`이다. PyPI metadata는 Python `>=3.12`를 요구하고, console script는 `everos`로 노출된다.

![EverOS banner](/images/tips/everos-banner.jpg)

## EverOS 개요

EverOS를 단순한 “메모 저장 라이브러리”로 보면 조금 빗나간다. Quickstart가 명시하듯 OSS EverOS는 **in-process library mode가 아니라 서버를 앞에 세우는 service**다.

기본 제품 경계는 다음에 가깝다.

```text
agent / app / workflow
  → HTTP API: /api/v1/memory/add, /flush, /search, /get
  → extraction pipeline + everalgo packages
  → Markdown files under ~/.everos
  → SQLite state/queue/audit + LanceDB hybrid index
  → future sessions retrieve episode/profile/fact/skill context
```

메모리는 user track과 agent track으로 나뉜다. user 쪽은 episode, atomic fact, foresight, profile을 다루고, agent 쪽은 case와 skill을 다룬다. v1.1.0에서는 여기에 Knowledge API가 추가되어 PDF/HTML/DOCX 같은 문서를 업로드·파싱·검색하는 shared knowledge surface도 생겼다.

공식 문서는 EverOS를 “Memory OS for Agentic AI”라고 크게 포지셔닝하지만, OSS repo에서 바로 확인되는 강점은 더 구체적이다. **에이전트 기억을 opaque SaaS나 vector DB 안에만 가두지 않고, 사람이 열어볼 수 있는 Markdown tree로 남기는 것**이다.

## 로컬 기억이 어떻게 저장되나

EverOS의 가장 좋은 설계 포인트는 저장소 역할을 명확히 나눴다는 점이다.

| 층 | 역할 | 도입자가 봐야 할 점 |
|---|---|---|
| Markdown | memory의 원본. episode/profile/skill/knowledge가 YAML frontmatter와 본문으로 저장된다. | Git으로 diff할 수 있고 Obsidian류 도구로 열어볼 수 있다. 삭제하면 실제 기억이 사라진다. |
| SQLite | boundary buffer, cascade queue, audit/state, OME 상태를 관리한다. | 운영 상태와 동기화 backlog를 보는 쪽이다. |
| LanceDB | vector ANN, BM25, scalar filter 기반 검색 인덱스를 제공한다. | `.index/`는 재생성 가능하지만, 검색은 eventual consistency를 갖는다. |

기본 memory root는 `~/.everos`다. `app_id`와 `project_id`가 먼저 디렉터리로 나뉘고, 기본값은 `default_app/default_project`로 물리화된다. 인덱스는 `.index/sqlite`와 `.index/lancedb` 아래에 놓이며, 문서에 따르면 `.index/`를 지워도 Markdown 원본에서 다시 만들 수 있다.

![EverOS demo TUI](/images/tips/everos-demo-tui.png)

이 구조는 AI agent memory를 “나중에 export할 수 있는 DB”가 아니라 **처음부터 파일 시스템에 존재하는 지식 베이스**로 다루게 만든다. 장기적으로는 자동 추출 결과를 사람이 리뷰하거나, 팀에서 memory root를 백업·버전관리·검토하는 식의 운영이 가능해진다.

## 설치와 첫 사용법

공식 Quickstart 기준 가장 단순한 설치는 PyPI 패키지다.

```bash
pip install everos
# or: uv pip install everos
```

키 없이 먼저 감을 잡으려면 educational TUI demo부터 실행한다.

```bash
everos demo
# plain terminal preview가 필요하면:
everos demo --plain
```

실제 서버-backed memory flow는 설정 파일과 provider key가 필요하다. 현재 Quickstart와 configuration docs 기준 `everos init`은 기본 root인 `~/.everos`에 `everos.toml`과 `ome.toml`을 만든다.

```bash
everos init
$EDITOR ~/.everos/everos.toml

everos server start
curl http://127.0.0.1:8000/health
```

그 다음 애플리케이션이나 에이전트가 HTTP API를 호출한다.

```bash
TS=$(($(date +%s)*1000))

curl -X POST http://127.0.0.1:8000/api/v1/memory/add \
  -H 'Content-Type: application/json' \
  -d "{
    \"session_id\": \"demo-001\",
    \"app_id\": \"default\",
    \"project_id\": \"default\",
    \"messages\": [
      {\"sender_id\": \"alice\", \"role\": \"user\", \"timestamp\": $TS, \"content\": \"I love climbing in Yosemite every spring.\"}
    ]
  }"
```

빠른 실험에서는 `/api/v1/memory/flush`로 extraction을 강제하고, `/api/v1/memory/search`로 다시 찾는다. 단, `/flush`는 OSS-only endpoint라고 route 주석과 API 문서가 설명한다. Cloud 쪽은 boundary timing을 서버가 결정한다.

## 어디에 쓰기 좋은가

EverOS가 맞는 상황은 “한 번 검색하고 끝나는 RAG”보다 **시간이 지나며 변하는 기억**이 필요한 경우다.

예를 들면 다음과 같다.

- 개인 AI 비서가 사용자의 반복 선호, 일정한 표현 방식, 과거 의사결정을 세션을 넘어 기억해야 한다.
- 코딩 에이전트가 특정 repo의 해결 패턴, 실패한 migration, 테스트 절차를 case/skill로 남겨 다음 작업에 써야 한다.
- 앱이 대화, workflow trace, 업로드 문서, multimodal 자료를 한 memory root 아래에서 같이 검색해야 한다.
- memory 결과를 사람이 직접 열람·수정·백업해야 해서 opaque hosted memory보다 Markdown 원본이 중요하다.
- 작은 팀이 별도 MongoDB/Elastic/Redis/vector DB 운영 없이 local-first memory runtime을 시험하고 싶다.

v1.1.0의 Knowledge API도 눈여겨볼 만하다. 문서와 changelog 기준 document CRUD, taxonomy, topic search, BM25+vector+rerank+category boost를 제공한다. 즉 “대화 memory”와 “문서 knowledge”를 같은 root와 index 운영 모델 안에 두려는 방향이다.

## 주의할 점

첫째, **OSS API와 Cloud/legacy 문서를 섞지 말아야 한다.** 공식 docs에는 Cloud SDK `everos-cloud`, hosted API base URL, `/api/v1/memories` 계열 설명도 함께 나온다. 반면 이 저장소의 OSS Quickstart/API는 `pip install everos`, `everos server start`, `/api/v1/memory/add`처럼 단수 `memory` route를 쓴다. repo 안의 `use-cases/claude-code-plugin`도 README 첫머리에서 “legacy EverMem Cloud plugin이며 canonical local EverOS 1.0 OSS API로 보지 말라”고 적고 있다.

둘째, **provider 비용과 데이터 전송 경계**가 있다. `everos demo`는 key 없이 돌아가지만, real extraction/search flow는 LLM, multimodal, embedding, rerank provider 설정을 요구한다. 기본 템플릿은 OpenAI-compatible endpoint를 전제로 하고, README/Quickstart는 OpenRouter와 DeepInfra 조합을 예로 든다. 대화·문서·agent trace가 외부 provider로 나갈 수 있으니 어떤 provider에 어떤 필드가 전달되는지 확인해야 한다.

셋째, **HTTP API에는 내장 인증이 없다.** 기본 bind가 `127.0.0.1`인 이유도 여기에 있다. `0.0.0.0`이나 LAN에 열려면 reverse proxy, 인증, network ACL을 먼저 둬야 한다. SECURITY.md도 untrusted network 노출은 지원 threat model 밖이라고 설명한다.

넷째, **memory는 plaintext Markdown에 가깝다.** 사용자가 읽고 Git으로 관리할 수 있다는 장점이 그대로 위험이 된다. 개인 선호, 고객 대화, agent tool output, 파일 경로, 문서 요약이 `~/.everos` 아래에 남을 수 있으므로 OS 권한, disk encryption, backup 정책을 같이 봐야 한다.

다섯째, **multimodal `file://` 입력은 범위를 제한하는 편이 좋다.** default config 주석은 `file_uri_allow_dirs`가 비어 있으면 local-first 기본값으로 “읽을 수 있는 모든 파일”을 허용한다고 설명한다. API를 loopback 밖으로 노출하거나 여러 앱이 공유한다면 allowlist를 지정하는 편이 안전하다.

마지막으로, benchmark와 marketing 수치는 내 workload에서 다시 확인해야 한다. 웹사이트는 LoCoMo accuracy, latency, token saving 같은 강한 수치를 제시하지만, 도입 판단에서는 “내 데이터에서 extraction 품질이 충분한가”, “검색 지연과 eventual consistency가 허용되는가”, “Reflection을 켰을 때 비용과 오류가 관리되는가”가 더 중요하다.

## 내 판단

EverOS는 “AI agent memory를 어디에 둘 것인가”라는 질문에 꽤 선명한 답을 준다. **사람이 읽을 수 있는 Markdown을 원본으로 두고, SQLite와 LanceDB는 운영·검색을 위한 파생 레이어로 둔다**는 선택은 마음에 든다. 에이전트가 오래 일할수록 memory를 검토하고 고치는 사람이 필요해지는데, 이때 파일 기반 원본은 큰 장점이다.

내 기준으로는 개인 AI 비서, 반복 코딩 에이전트, 연구/업무 assistant처럼 같은 사용자·프로젝트를 오래 따라가는 시스템을 만드는 사람에게 먼저 추천할 만하다. 반대로 단순 FAQ/RAG, 일회성 챗봇, 인증 없는 내부망 노출이 어려운 회사 환경이라면 바로 붙이기보다 `everos demo`, 작은 `~/.everos` root, loopback 서버, 더미 데이터로 extraction/search 품질을 먼저 확인하는 편이 낫다.

특히 이미 Claude Code, Codex, Hermes, OpenClaw 같은 agent runtime을 여러 개 만지는 사람이라면 EverOS를 “또 하나의 챗앱”이 아니라 **공유 memory substrate 후보**로 보는 게 맞다. 좋은 memory layer는 답변을 더 길게 만드는 도구가 아니라, 다음 세션에서 다시 설명하지 않아도 되는 일을 줄이는 도구다.

## 참고한 공개 자료

- [EverMind-AI/EverOS GitHub repository](https://github.com/EverMind-AI/EverOS)
- [EverOS PyPI package](https://pypi.org/project/everos/)
- [EverOS v1.1.0 GitHub release](https://github.com/EverMind-AI/EverOS/releases/tag/v1.1.0)
- [EverOS README](https://github.com/EverMind-AI/EverOS/blob/main/README.md)
- [EverOS QUICKSTART.md](https://github.com/EverMind-AI/EverOS/blob/main/QUICKSTART.md)
- [EverOS architecture docs](https://github.com/EverMind-AI/EverOS/blob/main/docs/architecture.md)
- [EverOS how-memory-works docs](https://github.com/EverMind-AI/EverOS/blob/main/docs/how-memory-works.md)
- [EverOS HTTP API docs](https://github.com/EverMind-AI/EverOS/blob/main/docs/api.md)
- [EverOS SECURITY.md](https://github.com/EverMind-AI/EverOS/blob/main/SECURITY.md)
- [EverOS official product page](https://evermind.ai/everos)
- [EverOS documentation index](https://docs.evermind.ai/llms.txt)
