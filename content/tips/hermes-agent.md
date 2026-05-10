---
title: "Hermes Agent는 스스로 배운 절차를 축적하는 개인용 AI 런타임이다"
date: "2026-05-10T23:24:42"
description: "Hermes Agent는 Nous Research가 공개한 MIT 오픈소스 AI 에이전트로, CLI/TUI, Telegram·Discord 같은 메시징 Gateway, 스킬·메모리·크론·Kanban 자동화, 여러 모델 provider를 하나의 개인 비서 런타임으로 묶습니다."
author: "Sangmin Lee"
repository: "NousResearch/hermes-agent"
sourceUrl: "https://github.com/NousResearch/hermes-agent"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Personal AI"
  - "Gateway"
  - "CLI"
  - "Automation"
  - "Python"
highlights:
  - "스킬, 지속 메모리, 세션 검색을 통해 복잡한 작업에서 배운 절차를 다음 세션에 다시 불러오는 학습 루프를 강조합니다."
  - "CLI/TUI뿐 아니라 Telegram, Discord, Slack, WhatsApp, Signal, Email 등 메시징 Gateway를 통해 같은 에이전트를 호출할 수 있습니다."
  - "Nous Portal, OpenRouter, Anthropic, OpenAI Codex, Gemini, Copilot, Hugging Face, 커스텀 endpoint 등 다양한 모델 provider를 `hermes model`로 바꿉니다."
  - "cron, delegate_task, durable Kanban, MCP, plugins, Docker/SSH/Modal/Daytona 같은 실행 backend까지 포함해 개인용 자동화 control plane에 가깝습니다."
  - "기본 local terminal은 호스트 권한으로 실행되므로 Gateway allowlist/pairing, 승인 프롬프트, secrets 분리, sandbox 설정을 먼저 이해해야 합니다."
draft: false
---

Hermes Agent는 “터미널에서 실행하는 AI 코딩 도구”라고만 보기에는 범위가 넓다. Nous Research가 공개한 이 프로젝트는 CLI/TUI, 메시징 Gateway, 도구 실행 환경, 스킬, 장기 메모리, 크론, multi-agent Kanban, 모델 provider 라우팅을 하나로 묶어 **개인용 AI 비서 런타임**을 만들려는 쪽에 가깝다.

핵심 차이는 학습 루프다. Hermes는 복잡한 작업을 하며 얻은 절차를 `SKILL.md` 형태로 저장하고, 사용 중 스킬이 부족하거나 틀렸다는 사실을 알게 되면 갱신할 수 있다. 여기에 사용자 프로필, 환경 메모리, 과거 세션 검색이 붙어서 “매번 처음 보는 에이전트”가 아니라 “내 작업 방식과 도구 습관을 조금씩 축적하는 에이전트”를 지향한다.

저장소는 Python 중심의 MIT 오픈소스이며, 조사 시점 기준 `pyproject.toml`의 버전은 `0.13.0`이다. 최신 GitHub Release는 `v2026.5.7` / “The Tenacity Release”로, durable Kanban, `/goal`, `video_analyze`, Gateway auto-resume, `no_agent` cron mode, 보안 hardening 등이 핵심 변경점으로 정리되어 있다.

![Hermes Agent banner](/images/tips/hermes-agent-banner.png)

## Hermes Agent 개요

Hermes Agent의 제품 중심은 단순한 채팅창이 아니라 **AIAgent runtime + Gateway + 도구/스킬 생태계**다. 사용자는 터미널에서 `hermes`를 실행할 수도 있고, Gateway를 띄워 Telegram·Discord·Slack·WhatsApp 같은 채팅 플랫폼에서 같은 에이전트에게 일을 시킬 수도 있다.

큰 구성 요소는 다음처럼 볼 수 있다.

![Hermes Agent architecture](/images/tips/hermes-agent-architecture.svg)

- **대화 표면**: classic CLI, TUI, Web dashboard, Telegram/Discord/Slack/WhatsApp/Signal/Email 등
- **모델 provider**: Nous Portal, OpenRouter, Anthropic, OpenAI Codex, GitHub Copilot, Gemini, Kimi, MiniMax, Hugging Face, AWS Bedrock, 커스텀 OpenAI-compatible endpoint 등
- **도구 runtime**: terminal, file, browser, web search/extract, vision, image generation, TTS, messaging, Home Assistant, Spotify 등
- **지속성 계층**: session store, persistent memory, `USER.md`/`MEMORY.md`, session search, context files
- **절차 지식**: `~/.hermes/skills/` 아래의 skill 문서, Skills Hub, 외부 skill directory
- **자동화**: cron scheduler, webhook, background session, `delegate_task`, durable Kanban board
- **실행 backend**: local, Docker, SSH, Singularity, Modal, Daytona, Vercel Sandbox

이 조합 때문에 Hermes는 “한 번 답하는 챗봇”보다 “내 작업 환경 위에서 계속 살아 있는 control plane”에 더 가깝다.

## 설치와 첫 설정

공식 README의 빠른 설치 경로는 `curl | bash` 방식이다. Linux, macOS, WSL2, Termux에서 같은 명령을 사용한다.

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

설치가 끝나면 shell을 다시 읽고 실행한다.

```bash
source ~/.bashrc    # 또는 source ~/.zshrc
hermes              # 대화 시작
```

Windows native는 PowerShell installer가 있지만, 문서상 **early beta**로 표시된다. 가장 검증된 Windows 경로는 WSL2 안에서 Linux installer를 쓰는 방식이고, native Windows는 일반 CLI/Gateway/Cron/Browser/MCP는 동작하지만 dashboard의 browser-based chat pane은 WSL2가 필요하다고 설명한다.

```powershell
irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1 | iex
```

설치 스크립트는 Git을 전제로 하고, `uv`, Python 3.11, Node.js 22, ripgrep, ffmpeg, 가상환경, `hermes` command link를 잡는다. 패키지 레지스트리에서 `pip install hermes-agent`나 `npm install hermes-agent`로 쓰는 형태가 아니라, 공식 installer와 source checkout이 중심이라는 점도 알아두면 좋다.

첫 설정의 핵심 명령은 다음이다.

```bash
hermes setup          # 전체 설정 wizard
hermes model          # 모델 provider와 모델 선택
hermes tools          # 사용할 toolset 선택
hermes gateway setup  # Telegram/Discord/Slack 등 메시징 플랫폼 연결
hermes doctor         # 의존성/설정 점검
```

공식 Quickstart는 Hermes가 안정적으로 multi-step tool calling을 하려면 **64K token 이상 context window**를 가진 모델을 요구한다고 설명한다. 로컬 모델을 붙인다면 llama.cpp/Ollama/vLLM 쪽 context 설정을 이 기준에 맞춰야 한다.

## 무엇이 차별점인가

### 1. 스킬과 메모리가 제품의 중심이다

Hermes에서 skill은 “프롬프트 조각”보다 더 실용적인 절차 문서다. `SKILL.md` 안에 언제 쓰는지, 어떤 명령을 실행하는지, 자주 나는 오류와 검증 방법을 적어두고, 필요할 때만 로드한다. 문서상 skill은 `~/.hermes/skills/`가 기본 source of truth이고, 외부 skill directory도 추가할 수 있다.

이 구조는 반복 업무에 강하다. 예를 들어 특정 블로그 업로드 절차, GitHub PR workflow, macOS 자동화, cron 보고서, 영상 요약, PDF OCR 같은 작업을 한 번 정리해두면 다음 세션에서 다시 불러와 실행할 수 있다. Hermes가 “해본 일을 기억하고 더 잘하게 되는” 느낌을 주는 지점도 여기에 있다.

장기 메모리는 사용자 선호, 환경 정보, 프로젝트 관례를 보존하고, session search는 과거 대화에서 필요한 맥락을 찾아온다. 단순히 대화 history가 길게 남는 것이 아니라, **절차는 skill**, **사용자/환경 facts는 memory**, **과거 작업 기록은 session search**로 역할을 나누는 방식이다.

### 2. Gateway가 실제 사용 표면을 넓힌다

Hermes는 CLI에서만 쓰는 도구가 아니다. Gateway를 띄우면 Telegram, Discord, Slack, WhatsApp, Signal, SMS, Email, Home Assistant, Mattermost, Matrix, DingTalk, Feishu/Lark, WeCom, Weixin, BlueBubbles, QQ, Yuanbao, Microsoft Teams, LINE, Webhooks, OpenAI-compatible API server 같은 표면에서 접근할 수 있다.

즉 출근길에는 Telegram DM으로 “어제 빌드 로그 확인하고 요약해줘”라고 보내고, 데스크톱에서는 TUI로 파일 수정 과정을 보며, 정기 보고서는 cron으로 돌리는 식의 구성이 가능하다. 이때 Gateway는 단순 relay가 아니라 session store, cron scheduler, platform adapter를 함께 가진 장기 실행 프로세스다.

![Hermes Agent model dashboard](/images/tips/hermes-agent-dashboard-models.png)

### 3. 모델과 실행 환경을 바꿔 끼울 수 있다

README와 provider 문서 기준 Hermes는 Nous Portal, OpenRouter, Anthropic, OpenAI Codex, GitHub Copilot, Google/Gemini, Hugging Face, MiniMax, Kimi/Moonshot, Z.AI/GLM, AWS Bedrock, NVIDIA NIM, custom endpoint 등 여러 provider를 지원한다. `hermes model`로 provider를 바꾸고, 일부 auxiliary 작업은 별도 모델로 라우팅할 수 있다.

실행 backend도 넓다. 기본값은 local terminal이지만, Docker, SSH, Singularity, Modal, Daytona, Vercel Sandbox 같은 backend를 통해 격리나 원격 실행을 선택할 수 있다. 개인 노트북에서 가볍게 쓰는 경우와 VPS/GPU box/serverless 환경에서 항상 켜두는 경우를 모두 염두에 둔 설계다.

### 4. cron, delegate_task, Kanban이 자동화 레이어를 만든다

Hermes의 cron은 “몇 시에 알림 보내기”에서 끝나지 않는다. job마다 skill을 붙이고, 특정 workdir에서 실행하고, 결과를 origin chat이나 Telegram 같은 platform target으로 전달할 수 있다. `no_agent` mode를 쓰면 LLM 없이 script stdout만 그대로 보내는 watchdog도 만들 수 있다.

짧은 병렬 작업은 `delegate_task`로 subagent를 spawn해 처리하고, 더 오래 가거나 여러 profile이 이어받아야 하는 작업은 Kanban을 쓴다. v0.13.0 release에서 강조한 durable Kanban은 task를 SQLite-backed board에 두고, worker heartbeat, reclaim, zombie detection, retry budget, blocked state 같은 운영 기능을 추가했다.

![Hermes Agent Kanban dashboard](/images/tips/hermes-agent-kanban-board.png)

이 차이는 중요하다. `delegate_task`는 부모 agent가 결과를 기다리는 함수 호출에 가깝고, Kanban은 작업이 재시작·차단·재시도·인계될 수 있는 durable queue에 가깝다. 연구 triage, PR review pipeline, 반복 운영 보고서처럼 “한 번에 끝나지 않는 일”은 Kanban 쪽이 더 잘 맞는다.

## 보안과 운영 caveat

Hermes는 강력한 만큼 권한 모델을 먼저 이해해야 한다. 특히 기본 `terminal.backend: local`은 host에서 명령을 실행한다. 개인 장비의 파일, shell, 네트워크, API key, 브라우저 세션 주변에 접근할 수 있는 도구를 에이전트에게 주는 셈이다.

운영 전에 확인할 부분은 다음이다.

- **Gateway allowlist/pairing**: 메시징 Gateway는 기본적으로 allowlist나 DM pairing을 통해 사용자 접근을 제한한다. bot을 공개 채널에 붙이거나 `ALLOW_ALL` 계열 설정을 켜기 전에 반드시 권한 범위를 확인해야 한다.
- **위험 명령 승인**: destructive command는 approval layer가 가로막는다. 다만 `--yolo`, `/yolo`, `approvals.mode: off` 같은 break-glass 설정은 안전 프롬프트를 우회하므로 disposable container나 신뢰된 자동화에서만 써야 한다.
- **host 실행 vs sandbox**: untrusted workload에는 local backend보다 Docker/Modal/Daytona 같은 격리 backend가 낫다. 문서도 production sandboxing을 권장한다.
- **secrets 위치**: API key와 token은 `~/.hermes/.env`에 두고, 일반 설정은 `~/.hermes/config.yaml`에 둔다. 로그 공유나 이슈 첨부 전에는 redaction 상태를 확인해야 한다.
- **skills는 높은 신뢰 표면**: skill은 local command, script, file mutation 절차를 포함할 수 있다. 외부 skill catalog나 GitHub skill을 설치할 때는 출처를 확인해야 한다.
- **MCP server도 공급망 표면**: MCP subprocess는 env filtering과 OSV check 같은 보호가 있지만, 외부 도구 서버를 붙인다는 사실 자체는 변하지 않는다.
- **Gateway 공개 노출 주의**: API server나 Gateway를 public internet에 직접 열기보다는 VPN, Tailscale, SSH tunnel, firewall, 인증 정책을 먼저 검토하는 편이 안전하다.

Hermes는 개인용 agent라는 trust model을 분명히 둔다. “한 명의 신뢰된 operator가 자기 환경에서 쓰는 강력한 도구”라는 전제를 벗어나 팀/공개 서비스처럼 쓰려면 OS/host/container 수준의 별도 격리가 필요하다.

## 이런 사람에게 잘 맞는다

Hermes Agent는 다음 유형의 사용자에게 특히 잘 맞는다.

- Telegram이나 Discord에서 호출할 수 있는 개인 AI 비서를 직접 운영하고 싶다.
- 반복되는 개발/리서치/콘텐츠/운영 절차를 skill로 축적하고 싶다.
- cron과 webhook으로 정기 보고서, 모니터링, 빌드 점검, 요약 작업을 자동화하고 싶다.
- 여러 모델 provider를 상황에 맞춰 바꾸거나 fallback/routing을 구성하고 싶다.
- 로컬 노트북뿐 아니라 VPS, Docker, SSH, serverless backend에서 agent를 운용하고 싶다.
- 단기 subagent와 durable Kanban을 모두 써서 multi-agent workflow를 실험하고 싶다.

반대로 단순히 “브라우저에서 챗봇 하나 쓰기”를 원한다면 설정 범위가 넓게 느껴질 수 있다. 모델 provider, toolset, Gateway 권한, secrets, sandbox, skill trust, cron delivery까지 운영자가 알아야 할 게 많다.

## 내 판단

Hermes Agent의 매력은 기능 수보다 **기능들이 한 방향으로 묶여 있다는 점**이다. CLI, Gateway, skills, memory, cron, provider routing, tool runtime, Kanban이 따로 노는 부품이 아니라 “나를 오래 도와주는 개인 agent”라는 제품 철학으로 연결된다.

그래서 처음부터 모든 기능을 켜기보다, 로컬 CLI에서 provider 하나를 안정화하고, 그다음 Telegram 같은 단일 Gateway 채널을 붙이고, 반복 업무 하나를 skill/cron으로 승격하는 순서가 좋다. 이 흐름을 거치면 Hermes의 강점인 “경험을 절차로 저장하고 다음에 더 빨리 실행하는 루프”가 실제로 체감된다.

다만 host 권한으로 명령을 실행하는 에이전트라는 사실은 끝까지 중요하다. 개인용 자동화 control plane으로는 매우 흥미롭지만, 공개 채널·공유 서버·untrusted repo에 붙일 때는 allowlist, approval, sandbox, secrets, 로그 redaction을 먼저 점검해야 한다.

## 참고한 공개 자료

- [NousResearch/hermes-agent GitHub repository](https://github.com/NousResearch/hermes-agent)
- [Hermes Agent README](https://github.com/NousResearch/hermes-agent/blob/main/README.md)
- [Hermes Agent documentation](https://hermes-agent.nousresearch.com/docs/)
- [Installation guide](https://hermes-agent.nousresearch.com/docs/getting-started/installation)
- [Quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart)
- [AI Providers](https://hermes-agent.nousresearch.com/docs/integrations/providers)
- [Messaging Gateway](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/)
- [Security](https://hermes-agent.nousresearch.com/docs/user-guide/security)
- [Skills System](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)
- [Cron Scheduling](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron)
- [Kanban Multi-Agent Board](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban)
- [Hermes Agent v0.13.0 release notes](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.5.7)
