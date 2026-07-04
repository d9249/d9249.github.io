---
title: "OpenCode·Pi·Goose는 같은 AI 코딩 에이전트가 아니라 서로 다른 스택 계층이다"
date: "2026-07-04T16:28:48"
description: "AIMOWAY의 공개 Gist와 각 프로젝트 자료를 바탕으로 OpenCode, Pi, Goose를 코딩 에이전트·agent harness·local workbench라는 세 계층으로 나눠 보는 선택 가이드다."
author: "Sangmin Lee"
repository: "AIMOWAY/gist:bd8007c8"
sourceUrl: "https://gist.github.com/AIMOWAY/bd8007c8f834a9bc83c71e3178239d75"
status: "Public Gist / OSS tools"
license: "Mixed / see sources"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Developer Tools"
  - "Coding Agents"
  - "Agent Runtime"
  - "MCP"
highlights:
  - "AIMOWAY의 Gist는 Pi를 agent kernel/harness, Goose를 local agent workbench, OpenCode를 coding-first development agent로 나누는 계층 모델을 제안한다."
  - "OpenCode는 저장소 안에서 탐색·계획·수정·테스트를 반복하는 코딩 중심 에이전트이고, build/plan agent처럼 권한 모드를 나눠 쓴다."
  - "Pi는 TypeScript 기반 agent harness와 package 모음으로, provider abstraction·tool calling·state management를 직접 다루려는 사람에게 더 가깝다."
  - "Goose는 desktop·CLI·API와 MCP/ACP extension을 묶는 로컬 workbench에 가까워 코딩 밖의 연구·작성·자동화 작업까지 넓게 본다."
  - "세 도구 모두 로컬 파일·명령·자격 증명 경계를 건드릴 수 있으므로, 선택 기준은 기능표보다 권한·로그·provider 설정·sandbox 전략이어야 한다."
draft: false
---

오픈소스 AI 에이전트 도구가 많아지면서 “이 셋 중 뭐가 더 낫나?”라는 비교가 자주 나온다. 하지만 OpenCode, Pi, Goose는 같은 제품군 안에서 단순히 순위를 매길 대상이라기보다 **AI agent stack의 서로 다른 계층**에 놓인 도구로 보는 편이 더 실용적이다.

AIMOWAY의 공개 Gist는 이 차이를 간결하게 정리한다. Pi는 agent kernel/harness/toolkit에 가깝고, Goose는 local AI agent workbench와 orchestration surface에 가깝고, OpenCode는 coding-first software-development agent에 가깝다는 관점이다. 이 글은 그 Gist를 출발점으로 삼되, 각 프로젝트의 README·문서·릴리스 정보를 함께 확인해 실제 선택 가이드로 정리한 것이다.

조사 시점 기준 OpenCode는 `anomalyco/opencode`의 MIT 오픈소스 TypeScript 프로젝트이고 최신 GitHub Release와 npm `opencode-ai` latest는 `v1.17.13`이다. Pi는 `earendil-works/pi`의 MIT 오픈소스 TypeScript monorepo이며 `@earendil-works/pi-coding-agent` latest는 `0.80.3`, Node 요구사항은 `>=22.19.0`이다. Goose는 `aaif-goose/goose`의 Apache-2.0 Rust 프로젝트이고 최신 release는 `v1.41.0`, 현재 Agentic AI Foundation(AAIF) 아래에서 관리된다.

![OpenCode·Pi·Goose layer model](/images/tips/opencode-pi-goose-stack.svg)

## 세 프로젝트를 한 줄로 나누기

| 도구 | 가장 자연스러운 계층 | 먼저 봐야 할 질문 |
|---|---|---|
| Pi | agent kernel / harness / toolkit | “에이전트를 어떻게 만들고 확장할지 공부하거나 직접 제어하고 싶은가?” |
| Goose | local AI agent workbench / orchestration surface | “모델, 파일, 터미널, API, MCP/ACP extension을 한 로컬 작업 공간으로 묶고 싶은가?” |
| OpenCode | coding-first software-development agent | “저장소 안에서 탐색, 계획, 수정, 테스트를 반복할 개발 파트너가 필요한가?” |

이 구분의 장점은 비교 기준을 바꿔준다는 점이다. “코딩도 할 수 있나?”라는 질문만 던지면 세 도구가 비슷해 보인다. 하지만 “내가 agent stack의 어느 층에서 일하고 있나?”라고 묻기 시작하면 선택이 훨씬 쉬워진다.

## Pi: agent를 만드는 사람에게 더 가까운 harness

`Pi`는 README에서 스스로를 Pi agent harness project라고 설명한다. 사용자-facing CLI인 `@earendil-works/pi-coding-agent`도 있지만, 저장소의 핵심은 그보다 넓다.

- `@earendil-works/pi-ai`: OpenAI, Anthropic, Google 등을 다루는 unified multi-provider LLM API
- `@earendil-works/pi-agent-core`: tool calling과 state management를 포함한 agent runtime
- `@earendil-works/pi-coding-agent`: interactive coding agent CLI
- `@earendil-works/pi-tui`: terminal UI library

즉 Pi는 완성형 coding assistant라기보다, agent loop·provider abstraction·tool calling·state·session·extension을 직접 이해하고 조립하려는 사람에게 더 흥미로운 기반이다. 공식 문서도 TypeScript extension, skills, prompt templates, themes, Pi packages, custom model/provider, SDK/RPC/JSON event stream mode 같은 확장 표면을 전면에 둔다.

설치는 npm 또는 installer 경로가 공개되어 있다.

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
# 또는 Linux/macOS installer
curl -fsSL https://pi.dev/install.sh | sh

pi
```

중요한 caveat도 명확하다. Pi README는 **filesystem, process, network, credential access를 제한하는 내장 permission system을 포함하지 않는다**고 설명한다. 기본적으로 Pi는 실행한 사용자와 프로세스의 권한으로 동작한다. 더 강한 경계가 필요하면 Gondolin extension, Docker, OpenShell 같은 외부 containerization/sandboxing 전략을 붙여야 한다.

그래서 Pi를 볼 때의 핵심 질문은 “바로 생산성 도구로 쓸 수 있나?”보다 “내가 agent runtime의 구조와 확장점을 직접 다뤄야 하나?”에 가깝다.

## Goose: local agent workbench와 orchestration surface

`Goose`는 README에서 “desktop app, CLI, API를 가진 native open source AI agent”라고 설명한다. 코딩만이 아니라 research, writing, automation, data analysis 같은 로컬 작업을 폭넓게 대상으로 삼는다. macOS, Linux, Windows desktop app과 CLI를 제공하고, provider는 Anthropic, OpenAI, Google, Ollama, OpenRouter, Azure, Bedrock 등 15개 이상을 언급한다.

공식 설치 문서 기준 desktop과 CLI를 각각 선택할 수 있다.

```bash
# CLI
curl -fsSL https://github.com/aaif-goose/goose/releases/download/stable/download_cli.sh | bash

# macOS Desktop cask
brew install --cask block-goose
```

Goose가 흥미로운 지점은 extension과 provider 쪽이다. README는 70개 이상 extension을 Model Context Protocol(MCP)로 연결할 수 있다고 설명한다. 또 ACP provider 문서에서는 Amp, Claude Code, Codex, Pi 같은 외부 coding agent CLI/adapter를 provider처럼 붙이는 흐름도 다룬다. 특히 ACP provider는 goose extension을 MCP server로 external agent에 넘길 수 있으므로, Goose는 단일 coding agent라기보다 **로컬 agent 작업장을 조율하는 표면**에 가깝다.

다만 이 장점은 그대로 운영상 주의점이 된다. Goose Desktop과 CLI는 core provider/model 설정을 공유하고, extension credential은 extension별 저장 방식이 다를 수 있다. MCP/ACP extension을 많이 붙일수록 로컬 파일, 외부 API, provider credential, 로그, telemetry 상관관계를 분리해서 봐야 한다. “어떤 모델을 쓰나”만큼 “어떤 extension이 어떤 권한과 자격 증명을 갖나”가 중요하다.

## OpenCode: 저장소 안의 coding-first agent

`OpenCode`는 포지셔닝이 가장 직접적이다. README 첫 줄부터 “The open source AI coding agent”이고, install surface도 CLI와 desktop app에 맞춰져 있다.

```bash
# installer
curl -fsSL https://opencode.ai/install | bash

# package managers
npm i -g opencode-ai@latest
brew install anomalyco/tap/opencode
brew install opencode

# Desktop app은 별도 beta surface
brew install --cask opencode-desktop
```

OpenCode의 중심은 소프트웨어 개발 작업이다. 문서 기준 agent는 primary agent와 subagent로 나뉘고, built-in primary agent에는 `Build`와 `Plan`이 있다. `Build`는 기본 full-access 개발 에이전트이고, `Plan`은 분석·계획·리뷰용 read-only 성격으로 file edit와 bash command를 기본적으로 ask 권한에 둔다. `General`, `Explore`, `Scout` 같은 subagent도 있어 복잡한 검색, 코드베이스 탐색, 외부 문서 조사 역할을 나눌 수 있다.

이 구조는 OpenCode가 왜 “coding-first”인지 잘 보여준다. 핵심 흐름은 unfamiliar codebase 탐색, 변경 계획, 파일 수정, 테스트 실행, 개발 명령 반복이다. Goose처럼 넓은 local workbench라기보다 저장소 안에서 개발자의 루프에 붙는 제품에 가깝고, Pi처럼 agent runtime 자체를 조립하는 toolkit이라기보다 일상 coding task를 바로 맡기는 표면에 가깝다.

주의할 점은 desktop app이 README에서 beta로 표시된다는 것, 그리고 full-access agent를 쓸 때는 결국 로컬 파일과 command execution 권한이 열린다는 점이다. Plan agent가 read-only 흐름을 제공하더라도, Build mode나 subagent 설정을 어떻게 두는지에 따라 실제 권한 경계는 크게 달라진다.

## 언제 무엇을 고를까

세 도구는 겹친다. Pi에도 coding-agent CLI가 있고, Goose도 coding task를 처리할 수 있고, OpenCode도 여러 agentic workflow를 가진다. 그래도 기본 선택 기준은 다음처럼 잡는 편이 낫다.

- **agent 구조를 공부하거나 직접 만들고 싶다 → Pi**  
  provider abstraction, tool calling, state/session format, extension, sandbox 연결 같은 내부 구조를 직접 다루는 쪽에 관심이 있으면 Pi가 더 좋은 출발점이다.

- **코딩과 비코딩 작업을 함께 다루는 로컬 workbench가 필요하다 → Goose**  
  Desktop/CLI/API, provider 설정, MCP extension, ACP provider를 한 공간에서 묶고 싶다면 Goose가 더 자연스럽다. 연구, 문서 작성, 자동화, data workflow까지 함께 보려는 사람에게 맞다.

- **저장소 안에서 바로 개발을 맡길 coding agent가 필요하다 → OpenCode**  
  plan/build 모드를 오가며 codebase 탐색, 구현, 테스트, 리팩터링을 반복하고 싶다면 OpenCode가 가장 직접적이다.

이 모델은 “최고의 에이전트 하나”를 고르는 모델이 아니다. 오히려 세 도구를 조합해서 볼 수도 있다. 예를 들어 Goose의 ACP provider가 Pi를 연결할 수 있다는 점은 workbench 계층과 harness 계층이 실제로 만날 수 있다는 신호다.

## 주의할 점

첫째, 이 글은 benchmark가 아니다. AIMOWAY의 Gist도 세 도구를 ranking하지 않고 layer distinction으로 본다. 실제 day-to-day ergonomics, long multi-step reliability, failure transparency, custom OpenAI-compatible endpoint 지원, provider 설정 UX는 각자의 workflow에서 직접 시험해야 한다.

둘째, release와 package surface가 빠르게 움직인다. 조사 시점에는 OpenCode `v1.17.13`, Pi `0.80.3`, Goose `v1.41.0`을 확인했지만, 이 계열 도구는 문서·GitHub Release·npm package·desktop app이 짧은 주기로 바뀐다. 팀 도입이나 글 재사용 전에는 설치 경로와 버전을 다시 pin하는 편이 안전하다.

셋째, 권한 경계를 기능표보다 먼저 봐야 한다. Pi는 내장 permission system이 없다고 명시한다. OpenCode는 Plan/Build 같은 agent mode로 권한을 나누지만 full-access 개발 흐름도 있다. Goose는 MCP/ACP extension과 provider credential을 많이 붙일 수 있다. 세 도구 모두 로컬 파일, shell command, provider key, subscription login, extension credential, session log가 민감 정보가 될 수 있다.

넷째, 라이선스도 한 줄로 끝나지 않는다. 연결된 프로젝트 중 OpenCode와 Pi는 MIT, Goose는 Apache-2.0으로 확인된다. 반면 출발점인 Gist 자체는 일반 GitHub repository처럼 명시적 LICENSE 파일을 제공하는 형태가 아니므로, Gist의 문장이나 도표를 그대로 재배포할 때는 별도 확인이 필요하다.

## 내 판단

OpenCode, Pi, Goose를 같은 “AI 코딩 에이전트” 상자에 넣으면 중요한 차이를 놓친다. 내가 보는 실용적인 구분은 다음이다.

```text
Pi       = agent를 만드는 계층
Goose    = agent를 로컬 작업 환경으로 엮는 계층
OpenCode = agent를 개발 작업에 바로 쓰는 계층
```

그래서 처음 고를 때는 “어느 것이 더 유명한가?”보다 “내가 지금 고치려는 문제가 agent architecture 문제인지, local workflow orchestration 문제인지, repository coding 문제인지”를 먼저 묻는 편이 좋다. 그 질문에 답하면 세 도구는 경쟁자라기보다 서로 다른 층의 참고 구현으로 보인다.

## 참고한 공개 자료

- [AIMOWAY Gist: OpenCode, Pi, and Goose — Three Layers of the AI Agent Stack](https://gist.github.com/AIMOWAY/bd8007c8f834a9bc83c71e3178239d75)
- [anomalyco/opencode GitHub repository](https://github.com/anomalyco/opencode)
- [OpenCode Agents documentation](https://opencode.ai/docs/agents)
- [earendil-works/pi GitHub repository](https://github.com/earendil-works/pi)
- [Pi documentation](https://pi.dev/docs/latest)
- [aaif-goose/goose GitHub repository](https://github.com/aaif-goose/goose)
- [Goose installation documentation](https://goose-docs.ai/docs/getting-started/installation)
- [Goose ACP providers documentation](https://goose-docs.ai/docs/guides/acp-providers)
