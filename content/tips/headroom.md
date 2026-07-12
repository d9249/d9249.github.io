---
title: "Headroom은 AI 에이전트의 tool output과 로그를 LLM 앞에서 압축하는 context layer다"
date: "2026-06-02T20:51:22"
description: "chopratejas/headroom은 Python·TypeScript 라이브러리, 로컬 proxy, MCP 서버, agent wrap 명령으로 tool output·로그·RAG chunk를 압축해 AI 코딩 에이전트의 token 비용과 context pressure를 줄이는 Apache-2.0 프로젝트다."
author: "Sangmin Lee"
repository: "chopratejas/headroom"
sourceUrl: "https://github.com/chopratejas/headroom"
status: "Open source beta"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Context Engineering"
  - "MCP"
  - "Developer Tools"
  - "Python"
  - "Proxy"
highlights:
  - "Python 패키지 `headroom-ai`는 PyPI/GitHub Release 기준 v0.22.4, Python `>=3.10`이며 설치 후 `headroom` CLI를 노출한다."
  - "`headroom proxy --port 8787`, `headroom wrap claude|codex|cursor|aider|copilot`, `headroom mcp install`처럼 proxy·agent wrapper·MCP tool 세 경로로 붙일 수 있다."
  - "ContentRouter가 JSON, 로그, 검색 결과, 코드, 일반 텍스트를 구분하고 SmartCrusher·CodeCompressor·Kompress-base·CacheAligner·CCR로 token을 줄이거나 원문 retrieval을 남긴다."
  - "Docker-native install은 macOS/Linux/Windows PowerShell 경로를 제공하지만, 조사 시점 Python wheel release asset은 macOS arm64와 manylinux x86_64/aarch64 중심이다."
  - "프롬프트·tool output·로그·RAG chunk를 proxy/MCP/local store가 다루므로 `~/.headroom`, request log, telemetry opt-out, public proxy 노출, `headroom learn`의 AGENTS.md 수정 범위를 먼저 확인해야 한다."
draft: false
---

AI 코딩 에이전트를 오래 쓰면 “모델이 몰라서”보다 **도구 출력이 너무 커서** 문제가 생기는 순간이 많다. `grep` 결과 수백 줄, 빌드 로그, RAG 검색 결과, DB row dump, 긴 conversation history가 한 번에 LLM으로 들어가면 context window와 비용을 동시에 압박한다.

`Headroom`은 이 지점에 끼워 넣는 **context compression layer**다. 앱이나 에이전트가 LLM provider로 보내기 전에 tool output·로그·파일·RAG chunk·대화 이력을 압축하고, 필요한 경우 원문을 다시 가져올 수 있도록 hash/retrieval 경로를 남긴다. 저장소는 이를 “library · proxy · MCP · local-first · reversible” 조합으로 설명한다.

조사 시점 기준 저장소 `chopratejas/headroom`은 Python 중심 프로젝트이고, GitHub Release와 PyPI `headroom-ai` 최신 버전은 `v0.22.4`다. GitHub API와 checked-in `LICENSE` 모두 Apache-2.0으로 확인된다. 다만 PyPI classifier는 `Development Status :: 4 - Beta`이고, npm registry의 `headroom-ai` latest는 `0.1.0`으로 source package/release tarball의 `0.22.4`와 어긋나므로 TypeScript SDK를 도입할 때는 npm 배포 상태를 따로 확인하는 편이 좋다.

![Headroom demo](/images/tips/headroom-demo.gif)

## Headroom 개요

Headroom의 핵심은 “큰 맥락을 LLM에 그대로 밀어 넣지 말고, 목적에 맞게 줄여서 보내자”는 것이다. README 기준으로 제공되는 표면은 꽤 넓다.

- **Python/TypeScript library**: Python에서는 `compress(messages)`, TypeScript에서는 `compress(messages, { model })` 같은 API로 앱 안에서 직접 호출한다.
- **Proxy**: `headroom proxy --port 8787`을 띄운 뒤 Anthropic/OpenAI-compatible client의 base URL을 바꾸면, 코드 변경 없이 요청을 거치게 할 수 있다.
- **Agent wrapper**: `headroom wrap claude`, `headroom wrap codex`, `headroom wrap cursor`, `headroom wrap aider`, `headroom wrap copilot`처럼 자주 쓰는 AI coding CLI 앞단에 붙이는 경로가 있다.
- **MCP server**: `headroom_compress`, `headroom_retrieve`, `headroom_stats`를 노출해 Claude Code, Cursor, Codex 등 MCP-compatible host가 on-demand로 압축·원문검색·통계를 요청할 수 있다.
- **Cross-agent memory / learn**: 공유 store, session stats, 실패 세션을 읽어 `CLAUDE.md`·`AGENTS.md`·`GEMINI.md`에 correction을 쓰는 `headroom learn` 흐름도 포함한다.

내부 구조는 `ContentRouter`가 입력 종류를 판단하고, JSON류는 `SmartCrusher`, 코드류는 `CodeCompressor`, 일반 텍스트는 opt-in `Kompress-base`, prefix cache 안정화는 `CacheAligner`, 원문 회수는 `CCR`이 담당하는 식이다. README의 benchmark 표는 코드 검색·SRE incident debugging·GitHub issue triage 같은 agent workload에서 47-92% 절감 사례를 제시하지만, 공식 limitations 문서는 코드와 RAG plain text가 상황에 따라 passthrough되거나 latency를 더할 수 있다고도 설명한다.

## 설치와 첫 사용법

공식 README와 `pyproject.toml` 기준 Python 패키지명은 **`headroom-ai`**이고, 설치 후 실행 명령이 `headroom`이다.

```bash
pip install "headroom-ai[all]"          # Python, 전체 extras
npm install headroom-ai                 # TypeScript / Node client

docker pull ghcr.io/chopratejas/headroom:latest
```

가장 빠른 체험 흐름은 proxy나 wrapper다.

```bash
headroom wrap claude                    # Claude Code 앞단에 붙이기
headroom proxy --port 8787              # 로컬 proxy 시작
headroom stats                          # 절감 통계 확인
```

OpenAI-compatible client라면 base URL을 proxy로 바꾸는 식이다.

```bash
OPENAI_BASE_URL=http://localhost:8787/v1 your-app
```

Claude Code 쪽 MCP tool만 붙이고 싶다면 다음처럼 시작한다.

```bash
pip install "headroom-ai[mcp]"
headroom mcp install
claude
```

주의할 점은 일부 wiki 문서의 오래된 snippet이다. `wiki/getting-started.md`에는 `pip install headroom`이 남아 있지만, 조사 시점 PyPI의 `headroom`은 `SUNKENDREAMS/headroom`으로 연결되는 별도 AI assistant 프로젝트다. Headroom context compression layer를 설치하려면 README/pyproject/PyPI project URL이 일치하는 `headroom-ai`를 기준으로 삼는 편이 안전하다.

## 언제 유용한가

Headroom이 가장 잘 맞는 곳은 “LLM이 읽어야 하는 맥락이 크고 반복적이지만, 원문 전체가 매번 꼭 필요한 것은 아닌” 워크플로다.

예를 들면 다음과 같다.

- AI coding agent가 search result, build log, test log, stack trace를 반복적으로 읽는다.
- SRE/debugging 세션에서 긴 JSON log나 metrics row를 계속 넘긴다.
- RAG 앱에서 검색 chunk가 많아 token budget을 빠르게 소모한다.
- Claude Code, Codex, Cursor, Aider, Copilot CLI 같은 여러 에이전트를 오가며 같은 프로젝트 맥락을 공유하고 싶다.
- OpenAI/Anthropic prefix cache를 더 안정적으로 쓰고 싶다.

특히 MCP 방식은 마음에 든다. 전체 요청을 proxy로 자동 압축하는 경로가 부담스럽다면, 처음에는 MCP tool로 큰 출력만 선택적으로 `headroom_compress`하고, 필요할 때 `headroom_retrieve`로 원문을 되돌려 받는 식으로 위험을 줄일 수 있다.

![Headroom savings dashboard](/images/tips/headroom-savings.png)

## 버전과 배포 표면

조사 시점 기준 주요 표면은 다음처럼 정리된다.

- GitHub repository: `chopratejas/headroom`
- GitHub latest release: `v0.22.4`
- PyPI package: `headroom-ai` `0.22.4`, Python `>=3.10`
- Python console script: `headroom = headroom.cli:main`
- npm package name: `headroom-ai`
- checked-in TypeScript package version: `0.22.4`, Node `>=18.0.0`
- npm registry latest: `0.1.0`
- Docker image path: `ghcr.io/chopratejas/headroom:latest`

이 차이는 실무 도입에서 중요하다. Python/CLI/proxy 경로는 GitHub Release와 PyPI가 맞물려 있는 편이지만, TypeScript SDK는 npm registry의 published version과 GitHub source/release asset을 함께 확인해야 한다. 또한 Docker-native install 문서는 Linux, macOS, Windows PowerShell 경로를 모두 제공하지만, GitHub Release의 Python wheel asset은 macOS arm64와 manylinux x86_64/aarch64 중심이다. Windows에서는 Docker wrapper나 source build 전제를 먼저 보는 쪽이 맞다.

## 주의할 점

Headroom은 단순한 “토큰 계산기”가 아니라, LLM 앞단에서 실제 prompt/tool output 흐름을 만지는 runtime이다. 따라서 도입 전에는 다음을 확인하는 편이 좋다.

- **정확도와 latency**: README benchmark는 인상적이지만, limitations 문서는 일반 텍스트·코드·RAG context에서 압축 효과와 latency가 workload별로 달라진다고 설명한다. `audit`/`simulate` 성격의 흐름이나 제한된 프로젝트에서 먼저 비교하는 편이 안전하다.
- **원문 저장 위치**: CCR, MCP, proxy는 원문을 local store에 남기고 hash로 회수한다. 문서 기준 `HEADROOM_WORKSPACE_DIR` 기본은 `~/.headroom`이며, proxy savings, session stats, memory DB, logs, telemetry/cache 관련 파일이 이 아래에 생길 수 있다. 일부 memory 경로는 project-local `.headroom/`도 쓴다.
- **민감정보**: SECURITY 문서는 API key를 저장/로그하지 않는다고 설명하지만, 동시에 request log가 민감정보를 포함할 수 있고 public internet에 proxy를 노출하지 말라고 경고한다. 회사 코드, 고객 로그, secret이 섞인 tool output을 다룬다면 log file, backup, screenshots, 공유 dashboard 범위를 먼저 정해야 한다.
- **Telemetry**: proxy 문서 기준 anonymous aggregate telemetry는 기본 enabled다. 끄려면 `HEADROOM_TELEMETRY=off` 또는 `headroom proxy --no-telemetry`를 쓴다. OTEL/Langfuse 같은 운영 계측은 별도 opt-in 경로다.
- **`headroom learn`의 파일 수정**: 실패 세션을 읽어 `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` 같은 agent instruction file에 correction을 쓸 수 있다. 자동 반영 전후 diff를 확인하지 않으면, 프로젝트 지침이 의도치 않게 바뀔 수 있다.
- **ML extras**: `headroom-ai[ml]`의 Kompress 경로는 model weight download와 첫 호출 latency, CPU/GPU 메모리 사용을 동반한다. 비용 절감 목적에는 유용할 수 있지만 빠른 응답이 더 중요한 proxy에는 별도 측정이 필요하다.

## 내 판단

Headroom은 AI agent를 매일 쓰는 개발자에게 꽤 현실적인 문제를 겨냥한다. “context window가 넓어졌으니 괜찮다”가 아니라, tool output과 로그가 반복적으로 들어가는 구조 자체를 줄이는 접근이기 때문이다. Claude Code나 Codex를 긴 디버깅 세션에서 돌리고, 매번 검색 결과와 빌드 로그가 context를 밀어내는 사람이라면 한 번 시험해볼 만하다.

반대로 짧은 one-off 질문, 작은 코드베이스, provider native compaction만으로 충분한 workflow라면 초기 설정이 과할 수 있다. 내 기준의 추천 순서는 **MCP tool로 선택적 압축 → proxy audit/소규모 프로젝트 테스트 → wrapper/persistent install** 순서다. 이렇게 들어가면 token savings를 보면서도 prompt 변형, local store, telemetry, log 노출 범위를 단계적으로 통제할 수 있다.

## 참고한 공개 자료

- [chopratejas/headroom GitHub repository](https://github.com/chopratejas/headroom)
- [Headroom README](https://github.com/chopratejas/headroom/blob/main/README.md)
- [Headroom documentation](https://headroom-docs.vercel.app/docs)
- [Headroom latest release v0.22.4](https://github.com/chopratejas/headroom/releases/tag/v0.22.4)
- [headroom-ai PyPI package](https://pypi.org/project/headroom-ai/)
- [headroom-ai npm package](https://www.npmjs.com/package/headroom-ai)
- [Headroom MCP documentation](https://headroom-docs.vercel.app/docs/mcp)
- [Headroom proxy documentation](https://headroom-docs.vercel.app/docs/proxy)
- [Headroom limitations](https://headroom-docs.vercel.app/docs/limitations)
- [Headroom filesystem contract](https://github.com/headroomlabs-ai/headroom/blob/main/docs/content/docs/filesystem-contract.mdx)
- [Headroom SECURITY.md](https://github.com/chopratejas/headroom/blob/main/SECURITY.md)
