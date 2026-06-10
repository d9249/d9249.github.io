---
title: "GBrain은 에이전트에게 Markdown 기반 장기 기억과 MCP 검색 레이어를 붙이는 개인 지식 뇌다"
date: "2026-06-10T19:20:45"
description: "garrytan/gbrain은 Markdown brain repo를 PGLite 또는 Postgres/pgvector에 동기화하고, hybrid search·skills·MCP·OAuth를 통해 Claude Code, Codex, Hermes, OpenClaw 같은 에이전트가 장기 기억을 쓸 수 있게 하는 Bun/TypeScript 오픈소스다."
author: "Sangmin Lee"
repository: "garrytan/gbrain"
sourceUrl: "https://github.com/garrytan/gbrain"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "AI Agents"
  - "Memory"
  - "MCP"
  - "RAG"
  - "Developer Tools"
  - "Knowledge Management"
  - "TypeScript"
  - "CLI"
highlights:
  - "Markdown brain repo를 source of truth로 두고, `gbrain sync`가 PGLite 또는 Postgres/pgvector에 pages·chunks·embeddings를 인덱싱하는 구조다."
  - "Claude Code와 Codex는 `claude mcp add gbrain -- gbrain serve`, `codex mcp add gbrain -- gbrain serve`처럼 로컬 stdio MCP로 붙일 수 있고, 원격 brain은 HTTP MCP/OAuth와 `gbrain connect`를 쓴다."
  - "README 기준 PGLite는 zero-config 개인 brain의 기본 경로이고, 공유·대규모·멀티 머신 환경은 Supabase/self-hosted Postgres + pgvector, source/brain routing, OAuth scoping을 고려한다."
  - "설치 표준은 `bun install -g github:garrytan/gbrain`이며, npm registry의 `gbrain` 패키지는 garrytan/gbrain이 아니라 다른 과거 JavaScript ML 패키지라 혼동하면 안 된다."
  - "프롬프트, 회의록, 사람/회사 페이지, API-key 주변 설정, OAuth token, database URL을 다루는 장기 기억 계층이므로 검색 mode 비용, source scope, secrets 저장, remote MCP 노출을 먼저 점검해야 한다."
draft: false
---

AI 코딩 에이전트를 여러 날 같은 프로젝트에 붙여 쓰다 보면 가장 아쉬운 것은 “모델이 똑똑한가”보다 **어제의 맥락이 오늘까지 이어지는가**다. 어떤 회의에서 누가 무엇을 약속했는지, 특정 회사·사람·프로젝트에 대한 메모가 어디에 있는지, 지난번 에이전트가 만든 절차와 citation을 다음 작업에서도 바로 검색할 수 있어야 한다.

`GBrain`은 이 문제를 개인 또는 팀 단위의 **agent memory / knowledge brain**으로 풀려는 프로젝트다. 핵심은 Markdown 파일을 사람이 읽고 git으로 관리할 수 있는 원본으로 두고, 이를 PGLite 또는 Postgres/pgvector에 동기화해 hybrid search, MCP tool, skill, cron enrichment, OAuth-scoped remote access로 에이전트에게 노출하는 것이다.

조사 시점 기준 저장소 `garrytan/gbrain`은 MIT 오픈소스이고, GitHub 기본 브랜치는 `master`, `VERSION`과 `package.json`은 `0.42.38.0`이다. 런타임은 Bun + TypeScript이며 `package.json`은 Bun `>=1.3.10`을 요구한다. GitHub API 기준 저장소 설명은 “Garry's Opinionated OpenClaw/Hermes Agent Brain”이고, README는 OpenClaw와 Hermes 배포 뒤에서 쓰는 production brain이라는 맥락을 전면에 둔다.

![GBrain architecture overview](/images/tips/gbrain-architecture.svg)

## GBrain을 무엇으로 봐야 하나

GBrain은 단순한 “메모 검색 CLI”보다 범위가 넓다. 저장소와 문서를 기준으로 보면 다음 요소가 한 묶음이다.

- **Brain repo**: 사람, 회사, 회의, 아이디어, 문헌, 프로젝트 메모 같은 Markdown 파일이 실제 원본이다.
- **Engine**: `gbrain sync`, `gbrain import`, `gbrain onboard` 등이 Markdown을 page/chunk/embedding/fact/link 형태로 DB에 넣는다.
- **Retrieval layer**: vector search, BM25 keyword search, reciprocal-rank fusion, source-tier boost, reranker, intent-aware query rewrite를 섞는 hybrid search 계층이다.
- **MCP server**: `gbrain serve` 또는 `gbrain serve --http`로 Claude Code, Codex, Claude Desktop, Cursor, Hermes/OpenClaw 같은 MCP client에 brain을 노출한다.
- **Skills and crons**: brain ops, ingest, enrichment, citation fixer, briefing, daily task prep 같은 작업을 agent-facing skill로 묶고, cron/dream cycle로 야간 정리 작업을 돌릴 수 있다.
- **Multi-source / multi-brain model**: 하나의 DB 안에 여러 source repo를 둘 수 있고, 필요하면 여러 brain을 mount해 owner와 access boundary를 나눈다.

이 설계에서 중요한 점은 DB가 영구 원본이 아니라는 것이다. README는 “brain repo is the system of record”라고 설명한다. 지식은 일반 git repo의 Markdown으로 남기고, GBrain은 이를 검색 가능한 Postgres 계층으로 동기화한다. 그래서 사람이 직접 문서를 고칠 수 있고, 에이전트도 citation이 붙은 page를 만들거나 갱신할 수 있다.

## 설치와 첫 연결

공식 문서의 기본 설치 경로는 npm package가 아니라 **Bun으로 GitHub 저장소를 전역 설치**하는 방식이다.

```bash
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
bun install -g github:garrytan/gbrain

gbrain init --pglite
gbrain doctor
```

여기서 주의할 점이 있다. npm registry에도 `gbrain`이라는 패키지가 있지만, 현재 latest `1.3.1`은 `stormcolor/gbrain`을 가리키는 과거 GPU JavaScript ML library다. `garrytan/gbrain`을 설치하려면 문서처럼 `bun install -g github:garrytan/gbrain` 경로를 써야 한다.

로컬에서 Claude Code나 Codex에 붙이는 가장 단순한 방법은 stdio MCP다.

```bash
claude mcp add gbrain -- gbrain serve
codex  mcp add gbrain -- gbrain serve
```

이 경우 별도 서버나 token 없이 에이전트가 `gbrain serve`를 subprocess로 띄워 현재 로컬 brain에 접근한다. 이미 원격 호스트에 brain이 떠 있다면 `gbrain serve --http`와 `gbrain connect` 경로가 있다.

```bash
gbrain serve --http

gbrain auth create "claude-code"
gbrain connect https://YOUR-DOMAIN.example/mcp --token gbrain_xxx --install

gbrain auth create "codex"
gbrain connect https://YOUR-DOMAIN.example/mcp --token gbrain_xxx --agent codex --install
```

원격 경로에서는 bearer token 또는 OAuth client가 실제 access boundary가 된다. Claude Code 문서는 token이 `~/.claude.json` 같은 client config에 들어갈 수 있다고 경고하고, Codex 문서는 token 값을 config에 직접 저장하지 않고 `GBRAIN_REMOTE_TOKEN` env var 이름을 저장하는 방식을 안내한다.

## PGLite와 Postgres를 고르는 기준

GBrain은 시작점으로 PGLite를 강하게 밀고 있다. `gbrain init --pglite`는 로컬 파일 기반 Postgres 17 WASM 엔진을 써서 Docker나 별도 DB 없이 개인 brain을 만들 수 있다. 개인 노트, 작은 research repo, 단일 장비에서 쓰는 agent memory라면 이 경로가 가장 빠르다.

공유·대규모·멀티 머신 환경에서는 Postgres + pgvector 쪽이 자연스럽다. 문서상 Supabase가 대표 경로로 자주 등장하고, `gbrain migrate --to supabase`로 PGLite brain을 옮기는 흐름도 있다. 여러 사람이 같은 institutional memory를 쓰거나, 서버에서 HTTP MCP를 열고 OAuth scope로 access를 나눠야 한다면 처음부터 remote Postgres를 고려하는 편이 낫다.

```bash
gbrain migrate --to supabase

gbrain serve --http --port 3131 --bind 0.0.0.0 --public-url https://brain.example.com
```

이때 GBrain의 두 축을 이해해야 한다.

- **Brain**은 어느 DB를 볼 것인가다. 개인 brain, 팀 brain, 회사 brain처럼 owner와 access control이 달라지는 단위다.
- **Source**는 그 DB 안의 어느 repo를 볼 것인가다. 예를 들어 shared wiki, customer notes, internal docs처럼 같은 DB 안에서도 source를 나눌 수 있다.

문서가 계속 강조하는 이유는 잘못된 brain/source에 query하거나 write하면 결과가 조용히 빗나갈 수 있기 때문이다. 팀용으로 쓴다면 `--brain`, `--source`, `.gbrain-mount`, `.gbrain-source`, OAuth `--source`, `--federated-read`를 운영 규칙으로 정리해야 한다.

## 에이전트와 함께 쓸 때의 실전 포인트

GBrain이 가장 흥미로운 지점은 “사람이 검색하는 노트 앱”보다 “에이전트가 먼저 brain을 조회하고, 결과를 바탕으로 행동하는 runtime”에 가깝다는 점이다.

예를 들어 코딩 에이전트에 붙이면 다음 질문이 가능해진다.

```text
Call get_brain_identity, then search my brain for the payment migration decision.
```

또는 팀 brain에서는 다음처럼 쓸 수 있다.

```text
Find the latest customer notes for Acme, cite the relevant meeting page, and draft a follow-up.
```

`skills/RESOLVER.md`와 bundled skills는 이런 작업을 “검색하고 요약해줘” 수준에서 끝내지 않고, ingest, citation repair, briefing, signal detection, daily task prep 같은 반복 절차로 만들려는 표면이다. `gbrain skillpack scaffold --all`은 agent workspace에 skill 파일을 복사하는 방식이라, 설치 후 팀의 실제 workflow에 맞게 diff하고 편집할 수 있다.

이 구조는 Hermes나 OpenClaw 같은 장기 실행 에이전트와 잘 맞는다. Hermes의 skill/memory/cron 모델이나 OpenClaw 계열의 fat skill runtime 위에 GBrain을 붙이면, 에이전트가 로컬 session memory만 보는 것이 아니라 별도 knowledge brain을 통해 사람·회사·회의·문서 단위의 장기 맥락을 조회하게 된다.

## 비용과 provider 설정

GBrain은 embedding provider와 reranker를 여러 개 지원한다. 문서 기준 OpenAI, ZeroEntropy, Voyage, OpenRouter, Google, Azure OpenAI, MiniMax, DashScope, Zhipu, Ollama, llama-server, LiteLLM proxy 등이 provider recipe로 정리되어 있다.

초기화 과정에서 env key를 보고 provider를 고르거나, 명시적으로 embedding model을 지정할 수 있다.

```bash
export ZEROENTROPY_API_KEY=...
export OPENAI_API_KEY=...
export VOYAGE_API_KEY=...

gbrain init --pglite --embedding-model voyage:voyage-code-3 --embedding-dimensions 1024
```

agent가 대신 설치하는 경우에는 특히 **search mode 선택**을 자동으로 넘기면 안 된다. `INSTALL_FOR_AGENTS.md`는 `gbrain init`이 search mode × downstream model 비용 matrix를 출력하면 operator에게 전달하고 확인을 받으라고 적는다. 검색 mode와 reranking, summarization, embedding provider 조합에 따라 장기 운영 비용이 크게 달라질 수 있기 때문이다.

로컬/무료 쪽을 선호한다면 Ollama나 llama-server 기반 embedding/reranker recipe도 보이지만, 품질·언어·멀티모달·코드 검색 성능은 provider마다 차이가 난다. 개인 brain을 처음 만들 때는 비용 cap과 reindex 가능성을 염두에 두고 시작하는 편이 안전하다.

## 보안과 운영 caveat

GBrain은 “내 모든 맥락을 잘 찾아주는 도구”인 만큼, 저장하고 노출하는 범위가 넓다. 실제 도입 전에 최소한 다음은 확인해야 한다.

- **API key와 DB URL**: `~/.gbrain/config.json`, env var, Supabase/Postgres URL, `database_url`, embedding provider key가 어디에 저장되는지 확인한다.
- **MCP token**: 원격 `gbrain connect`의 token은 장기 접근 권한이 될 수 있다. shell profile, Claude/Codex config, logs에 남지 않게 다룬다.
- **HTTP bind**: `gbrain serve --http --bind 0.0.0.0`는 외부 interface를 연다. 실험은 ngrok/Tailscale/VPN 뒤에서, 운영은 TLS·OAuth·firewall과 함께 봐야 한다.
- **Source scoping**: 고객 노트, HR/법무 문서, 개인 메모가 같은 brain에 들어간다면 source와 federated-read 정책을 먼저 설계한다.
- **Agent write 권한**: MCP tool은 검색만 하는 것이 아니라 page를 만들거나 고칠 수 있다. 어느 client가 write/admin scope를 갖는지 분리한다.
- **Prompt injection / untrusted content**: brain repo 안의 Markdown은 에이전트가 읽는 context가 된다. 외부 문서 ingest pipeline에는 hidden instruction과 citation poisoning 점검이 필요하다.
- **Windows caveat**: README에는 Windows + Bun + Supabase pooler 주변 migration/DNS 실패 사례가 troubleshooting에 언급된다. 문서의 주된 설치·빌드 표면은 Bun 기반 macOS/Linux 경로로 보는 편이 안전하다.

특히 팀 brain은 단순히 “Supabase 하나 만들고 다 같이 검색”이 아니다. company brain tutorial은 source별 scoping, teammate별 OAuth client, per-person folders, per-person crons와 skills까지 설명한다. 10~50명 규모 팀에서 institutional memory를 만들려면 제품보다 운영 규칙이 먼저다.

## 내 판단

GBrain은 `agentmemory`류의 로컬 세션 기억 도구보다 더 **지식베이스/조직 기억** 쪽으로 무게중심이 있다. Markdown repo를 원본으로 두고 Postgres 검색 계층을 붙이는 방식은 사람이 읽고 고칠 수 있다는 장점이 크고, MCP로 Claude Code·Codex·Hermes/OpenClaw에 연결하는 흐름도 현재 에이전트 생태계와 잘 맞는다.

반대로 “그냥 내 Claude Code가 어제 한 일을 조금 기억했으면 좋겠다” 정도라면 설정 범위가 크게 느껴질 수 있다. Bun 설치, embedding provider, PGLite/Postgres, source routing, skillpack, cron, remote MCP, OAuth, token 관리까지 제품이 다루는 층이 많다.

내 기준으로는 다음 유형에 특히 잘 맞는다.

- 개인 위키나 Obsidian 비슷한 Markdown repo를 이미 꾸준히 쓰고 있다.
- 사람·회사·미팅·문헌·프로젝트 정보를 에이전트가 citation과 함께 검색해야 한다.
- Claude Code, Codex, Hermes, OpenClaw 같은 여러 agent client가 같은 memory layer를 공유해야 한다.
- 단일 repo context보다 넓은 “내 장기 업무 맥락”을 RAG로 연결하고 싶다.
- 팀이나 회사 단위로 shared institutional memory를 실험하되, source scope와 OAuth를 진지하게 설계할 의지가 있다.

작게 시작한다면 `bun install -g github:garrytan/gbrain`, `gbrain init --pglite`, `claude/codex mcp add ... -- gbrain serve` 정도로 local brain부터 확인하는 편이 좋다. 그 다음에 `gbrain import`, `skillpack scaffold`, remote HTTP MCP, Supabase migration, company brain scoping 순서로 넓히는 것이 안전하다. GBrain의 가치는 “한 번에 모든 기억을 맡기는 것”보다, 어떤 지식을 어떤 source에 넣고 어떤 에이전트가 읽고 쓸 수 있는지 차근차근 운영 규칙을 쌓을 때 더 잘 드러난다.

## 참고한 공개 자료

- [garrytan/gbrain GitHub repository](https://github.com/garrytan/gbrain)
- [GBrain README](https://github.com/garrytan/gbrain/blob/master/README.md)
- [GBrain install guide](https://github.com/garrytan/gbrain/blob/master/docs/INSTALL.md)
- [INSTALL_FOR_AGENTS.md](https://github.com/garrytan/gbrain/blob/master/INSTALL_FOR_AGENTS.md)
- [Brains and Sources architecture](https://github.com/garrytan/gbrain/blob/master/docs/architecture/brains-and-sources.md)
- [Deployment topologies](https://github.com/garrytan/gbrain/blob/master/docs/architecture/topologies.md)
- [Claude Code MCP guide](https://github.com/garrytan/gbrain/blob/master/docs/mcp/CLAUDE_CODE.md)
- [Codex MCP guide](https://github.com/garrytan/gbrain/blob/master/docs/mcp/CODEX.md)
- [Company brain tutorial](https://github.com/garrytan/gbrain/blob/master/docs/tutorials/company-brain.md)
- [Embedding providers guide](https://github.com/garrytan/gbrain/blob/master/docs/integrations/embedding-providers.md)
- [GBrain SECURITY.md](https://github.com/garrytan/gbrain/blob/master/SECURITY.md)
