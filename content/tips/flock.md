---
title: "Flock은 여러 머신의 로컬 LLM을 한 엔드포인트로 묶는 self-hosted inference control plane이다"
date: "2026-06-06T21:40:05"
description: "hadihonarvar/flock은 macOS·Linux 머신의 Ollama, vLLM, MLX-LM, llama.cpp-RPC 백엔드를 OpenAI·Anthropic 호환 API, 키·쿼터·감사 로그, 대시보드로 묶는 Go 기반 로컬 LLM 오케스트레이터다."
author: "Sangmin Lee"
repository: "hadihonarvar/flock"
status: "Upstream unavailable"
license: "Apache-2.0"
platforms:
  - "macos-linux"
tags:
  - "Local LLM"
  - "Inference Server"
  - "OpenAI API"
  - "Claude Code"
  - "Go"
  - "Developer Tools"
highlights:
  - "단일 Go 바이너리로 leader/worker/CLI를 겸하며, GitHub Release v0.1.0은 darwin·linux의 amd64/arm64 tarball과 checksums.txt를 제공한다."
  - "`/v1/chat/completions`, `/v1/models`, `/v1/messages`, `/v1/messages/count_tokens`를 인증·쿼터 middleware 뒤에 두고 OpenAI/Anthropic 호환 client를 받는다."
  - "Ollama를 기본 엔진으로 쓰되 vLLM, MLX-LM, llama.cpp/RPC 엔진과 model catalog, `flock shard create <model> [N]` 흐름을 함께 둔다."
  - "`flock connect`는 Claude Code, Cursor, Aider, Continue, Zed, Cline, Qwen Code, OpenAI/Anthropic SDK, curl용 snippet을 생성한다."
  - "기본 listen 값은 `:8080`이고 API key는 켜져 있지만, LAN/외부 노출·worker join token·cloud fallback key·Prometheus `/metrics` 범위는 직접 통제해야 한다."
draft: false
---

AI coding agent를 오래 쓰다 보면 “모델 하나를 로컬에서 띄우는 것”보다 “여러 개발자가 쓰는 엔드포인트를 어떻게 운영할 것인가”가 더 까다롭다. 한 명은 Mac Studio에서 MLX를 쓰고, 다른 한 명은 Linux GPU 박스의 vLLM을 쓰고, Cursor·Claude Code·Aider·Continue 같은 클라이언트는 서로 다른 API 호환성을 기대한다. 여기에 사용자별 key, 일일 token quota, 감사 로그, fallback 정책까지 붙이면 단순한 `ollama serve`만으로는 부족해진다.

> 공개 상태 안내 (2026-07-12): 이 글이 다룬 원본 저장소, 릴리스, 설치 스크립트는 현재 공개 접근이 중단됐고 공식 이전 경로도 확인되지 않았다. 아래 내용은 공개 당시 구조를 기록한 아카이브이며, 설치·운영 가이드로 사용하면 안 된다.

`Flock`은 이 지점을 겨냥한 **self-hosted LLM control plane**이다. 저장소의 표현을 빌리면 “one endpoint, your hardware”에 가깝다. Go 단일 바이너리가 로컬 inference engine 앞단의 gateway, leader/worker control plane, CLI, embedded admin UI를 함께 제공하고, 외부 client에는 OpenAI-compatible API와 Anthropic-compatible API를 노출한다.

조사 시점 기준 `hadihonarvar/flock`은 기본 브랜치가 `main`, 주 구현 언어는 Go, checked-in `LICENSE`와 GitHub API 모두 Apache-2.0이다. GitHub latest release는 `v0.1.0`이고, Release asset은 `flock-darwin-amd64.tar.gz`, `flock-darwin-arm64.tar.gz`, `flock-linux-amd64.tar.gz`, `flock-linux-arm64.tar.gz`, `checksums.txt`로 확인된다. 다만 README와 `TASKS.md`의 default-branch 문서는 v0.4 수준의 shipped/gap 메모까지 앞서 적고 있으므로, 실사용자는 **release tarball 기준 기능**과 **main branch 문서 기준 기능**을 분리해서 보는 편이 안전하다.

## Flock 개요

Flock을 완성형 chat UI나 Claude Code 같은 agent UI로 보면 과장이다. 더 정확히는 **로컬/사내 LLM backend를 agent와 SDK가 쓰기 쉬운 API 서버로 묶는 오케스트레이션 계층**이다.

핵심 표면은 다음과 같다.

- **Gateway/API server**: `/v1/chat/completions`, `/v1/models`는 OpenAI 호환, `/v1/messages`, `/v1/messages/count_tokens`는 Anthropic 호환 흐름이다. 코드상 이 `/v1` route는 API key 인증과 quota middleware 뒤에 있다.
- **Engine adapter**: 기본값은 Ollama이며, 문서와 설정에는 vLLM, MLX-LM, llama.cpp/RPC endpoint도 등장한다. `FLOCK_OLLAMA_ENDPOINT`, `FLOCK_VLLM_ENDPOINT`, `VLLM_API_KEY` 같은 환경 변수로 각 엔진을 조정할 수 있다.
- **Control plane**: leader는 node 등록, heartbeat, model placement, sharded model 상태, token, usage, audit 데이터를 SQLite store에 둔다. 기본 data dir은 `~/.flock`, 기본 DB는 `~/.flock/state.db`다.
- **Dashboard**: embedded HTML UI가 `/`에 있고, Quick Start 기준 Dashboard, Nodes, Models, Shards, Tokens, Usage, Audit, Settings, Connect, Playground, Invite 같은 탭을 제공한다.
- **Observability**: `/healthz`, `/readyz`, Prometheus `/metrics`, usage record, audit log가 있다.

즉 혼자 쓰는 “로컬 모델 실행기”라기보다는, 팀이나 여러 머신이 있는 개인 lab에서 **하나의 base URL**을 정하고 그 뒤에 여러 backend와 policy를 붙이는 구조에 가깝다.

## 설치와 첫 실행

공개 당시 Quick Start는 macOS Apple Silicon과 Linux x86_64/arm64를 대상으로 Ollama와 전용 installer를 함께 사용했다. 그러나 현재 installer와 Release를 검증할 공식 배포 경로가 없으므로 재공개 전까지 설치를 시도하지 않는 편이 안전하다.

installer는 `--version`, `--install-dir`, `--no-engine`, `--dry-run` 같은 옵션을 제공하고, Release의 `checksums.txt`를 찾으면 `shasum -a 256`로 검증한 뒤 바이너리를 설치한다. GoReleaser 설정도 darwin/linux × amd64/arm64 build를 생성하도록 되어 있다. Homebrew tap 설정은 템플릿/주석 형태로 남아 있지만, 조사 시점 `.goreleaser.yaml`에서는 tap publishing block이 비활성화되어 있으므로 **공식 설치 경로는 installer 또는 GitHub Release tarball**로 보는 편이 맞다.

`flock up`이 처음 leader를 띄우면 admin key를 한 번 보여주고, 이후 CLI command가 쓰도록 `~/.flock/admin.key`에도 저장한다는 안내가 있다. 글에 key 값을 남기면 안 되므로 실제 사용 예시는 다음처럼 placeholder로만 이해하자.

```bash
curl http://localhost:8080/v1/chat/completions -H "Authorization: Bearer [REDACTED]" -H "Content-Type: application/json" -d '{"model":"auto","messages":[{"role":"user","content":"say hi in 5 words"}]}'
```

Claude Code 쪽은 Anthropic-compatible endpoint로 붙인다.

```bash
export ANTHROPIC_BASE_URL=http://localhost:8080
export ANTHROPIC_AUTH_TOKEN=[REDACTED]
export ANTHROPIC_MODEL=llama-3.2-1b
claude
```

## 모델과 클러스터 운영 감각

Flock의 모델 선택 흐름은 “사용자가 직접 backend별 설정 파일을 다 쓰는 것”보다 **catalog와 하드웨어 감지**에 기대는 쪽이다. `MODELS.md`는 laptop smoke test용 `llama-3.2-1b`, 8-16GB급 coder/chat 모델, 24-32GB급 모델, sharded tier 모델을 RAM 기준으로 나눠 설명한다. catalog YAML도 각 모델의 `size_bytes`, `quant`, `capabilities`, `recommended_engines`, `min_ram_gb`를 갖는다.

대표적인 CLI 표면은 다음과 같다.

```bash
flock doctor                         # 하드웨어와 엔진 상태 진단
flock model search qwen              # catalog 검색
flock model add qwen-coder-14b        # catalog 모델 설치
flock model info qwen-coder-14b       # 모델 상세 확인
FLOCK_DEFAULT_MODEL=qwen-coder-14b flock up
```

여러 머신을 붙일 때는 첫 머신이 leader가 되고, 다른 머신은 worker로 join한다. token이 들어간 join URL은 secret이므로 문서나 chat에 그대로 남기지 말고 다음처럼 취급하는 편이 맞다.

```bash
flock token create --node
flock join "http://leader.example:8080?token=[REDACTED]"
```

default branch의 `TASKS.md`는 LAN backend 기반 multi-node routing, heartbeat 기반 loaded-model placement, local-preferred/least-loaded worker routing, `flock shard create <model> <N>`를 통한 llama.cpp-RPC sharding orchestration, worker process supervisor를 shipped state로 적고 있다. 반대로 Tailscale `tsnet` mesh, NetBird mesh, shard crash recovery, coordinator를 worker에 올리는 구조 등은 deferred/gap으로 남겨져 있다. 그래서 글을 읽고 바로 “자동 mesh와 완전한 HA inference cluster가 된다”고 기대하기보다는, 현재는 **LAN/실험실/작은 팀의 self-hosted gateway**로 시작하는 게 현실적이다.

## coding agent backend로 붙일 때

Flock이 특히 흥미로운 이유는 지원 client 목록이 agent/coding tool 중심이라는 점이다. `internal/control/connect.go` 기준 `flock connect --list`가 다루는 client는 다음 순서다.

- `claude-code` — Anthropic API
- `cursor` — OpenAI API
- `aider` — OpenAI API
- `continue` — OpenAI/Anthropic
- `zed` — OpenAI API
- `cline` — OpenAI/Anthropic
- `qwen-code` — Anthropic API
- `openai-sdk` — OpenAI SDK
- `anthropic-sdk` — Anthropic SDK
- `curl` — raw HTTP smoke test

실무에서는 이 점이 꽤 중요하다. Cursor류는 `http://localhost:8080/v1`을 OpenAI base URL로 쓰고, Claude Code류는 `ANTHROPIC_BASE_URL=http://localhost:8080`를 쓰면 된다. Flock이 model name을 보고 `claude-*` 또는 `gpt-*` 요청을 실제 Anthropic/OpenAI 쪽으로 fallback할 수도 있지만, 이 기능은 `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` 같은 외부 provider key가 있을 때만 켜진다. 로컬-only 실험에서는 `ANTHROPIC_MODEL`이나 client 설정의 model id를 `llama-3.2-1b`, `qwen-coder-14b`처럼 Flock catalog의 local model로 명시하는 편이 안전하다.

팀 공유에는 `flock invite <name> --quota 100000` 같은 흐름이 있다. 이 명령은 user-scope token을 만들고 share card/snippet을 출력한다. token은 한 번만 보이므로 Slack/Discord/문서에 붙일 때는 전달 채널, 만료/회수 정책, quota를 같이 정해야 한다.

## 운영과 보안 caveat

Flock은 로컬 inference backend지만, “로컬이라 안전하다”로 끝낼 수 있는 종류의 도구는 아니다. gateway가 prompt, code context, token, usage log, audit log, optional cloud fallback key를 모두 만질 수 있기 때문이다.

도입 전 확인할 점은 다음과 같다.

- **bind address**: 기본 `Listen` 값은 `:8080`이다. Go 서버에서 이 값은 로컬 전용이 아니라 모든 interface에 bind될 수 있다. 노트북 단독 실험이면 `FLOCK_LISTEN=127.0.0.1:8080`처럼 loopback을 명시하는 편이 낫다.
- **인증 기본값**: `Auth.RequireKeys` 기본값은 `true`이고 `/v1`과 `/admin/v1` route가 인증 middleware를 탄다. 개발 중 `FLOCK_REQUIRE_KEYS=false`로 끌 수 있지만, LAN이나 외부에 노출되는 환경에서는 피해야 한다.
- **secret 저장과 출력**: admin/user/node key는 plaintext가 한 번 출력되고 hash가 store에 남는다. CLI 편의를 위해 admin key file도 생긴다. `~/.flock/admin.key`, config, shell history, screenshot, invite card 공유 범위를 관리해야 한다.
- **metrics와 logs**: `/metrics`는 public route로 등록되어 있다. metric label에 어떤 정보가 들어가는지, reverse proxy 뒤에서 접근을 어떻게 막을지 확인하자. usage/audit log에는 model/protocol/token/latency와 admin action 흔적이 남을 수 있다.
- **cloud fallback**: `ANTHROPIC_API_KEY`나 `OPENAI_API_KEY`가 있으면 vendor model 요청을 외부 API로 proxy하는 경로가 켜진다. self-hosted cost/privacy를 위해 도입했다면, fallback이 언제 쓰이는지와 provider egress policy를 명확히 해야 한다.
- **초기 maturity**: GitHub release는 v0.1.0이고 README도 Alpha라고 표시한다. default branch의 `TASKS.md`는 더 앞선 shipped state를 말하지만, 실제 운영은 tag/release를 pin하고 작은 workload에서 smoke test한 뒤 넓히는 편이 맞다.

## 내 판단

Flock은 “Ollama 대체재”라기보다, Ollama/vLLM/MLX/llama.cpp를 이미 쓰고 있는 사람이 **팀용 endpoint와 운영 표면을 얹고 싶을 때** 흥미로운 프로젝트다. 특히 Claude Code, Cursor, Aider, Continue처럼 서로 다른 client를 같은 backend pool에 붙이고, 사용자별 token/quota/audit을 남기고 싶은 작은 팀이나 개인 lab에 잘 맞는다.

반대로 단일 노트북에서 혼자 한 모델을 테스트하는 정도라면 Flock은 조금 이르거나 과할 수 있다. 그 경우에는 Ollama/MLX/vLLM 단독 서버로 충분하다. Flock을 볼 만한 순간은 “로컬 모델을 하나 띄웠다” 다음 단계, 즉 여러 머신·여러 client·여러 사용자·외부 fallback·감사 로그를 한 주소로 관리하고 싶어지는 때다.

내 기준의 추천 순서는 **loopback 단일 머신 → `flock connect`로 한 client만 연결 → 사용자 token/quota 실험 → LAN worker 추가 → sharding/fallback 검증**이다. 이 순서로 가면 source가 빠르게 변하는 alpha 프로젝트에서도 secret 노출과 운영 복잡도를 단계적으로 통제할 수 있다.

## 참고한 공개 자료

- `hadihonarvar/flock` 원본 저장소와 v0.1.0 릴리스(2026-07-12 기준 공개 접근 중단, 공식 후속 미확인)
