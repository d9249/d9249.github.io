---
title: "PilotDeck은 여러 에이전트 작업을 WorkSpace 단위로 격리·관찰·라우팅하는 오픈소스 cockpit이다"
date: "2026-05-29T15:15:38"
description: "OpenBMB/PilotDeck은 프로젝트별 WorkSpace, 화이트박스 메모리, Smart Router/TokenSaver, Always-on 실행, MCP·플러그인 확장을 한 브라우저 UI와 로컬 Gateway로 묶는 AGPL-3.0 오픈소스 AI 에이전트 운영 플랫폼이다."
author: "Sangmin Lee"
repository: "OpenBMB/PilotDeck"
sourceUrl: "https://github.com/OpenBMB/PilotDeck"
status: "Open source early public release"
license: "AGPL-3.0"
platforms:
  - "macos-linux"
tags:
  - "AI Agents"
  - "Agent OS"
  - "WorkSpace"
  - "Smart Routing"
  - "Memory"
  - "MCP"
  - "Always-on"
  - "TypeScript"
  - "Web UI"
highlights:
  - "프로젝트마다 파일, 메모리, 스킬을 분리하는 WorkSpace를 기본 단위로 삼아 여러 에이전트 작업이 서로 오염되지 않도록 설계했다."
  - "로컬 Gateway(기본 18789)와 Web UI 서버(기본 3001)를 분리하고, 브라우저 화면에서 세션·파일·스킬·라우팅·메모리·Always-on 상태를 한 번에 보게 한다."
  - "Smart Router/TokenSaver는 작업 난이도에 따라 모델 tier를 바꾸고 multi-provider fallback과 비용 통계를 붙이는 방향이다. README는 일부 워크로드에서 큰 비용 절감 수치를 제시한다."
  - "화이트박스 메모리, Dream Mode, Cron/Always-on, MCP 서버, lifecycle hook, custom skill/plugin을 한 플랫폼 안에 묶으려는 야심이 크다."
  - "조사 시점 기준 GitHub Release/tag는 없고, one-line installer는 macOS/Linux와 Node.js 22+를 전제로 하므로 실제 도입은 sandbox와 commit pinning부터 시작하는 편이 안전하다."
draft: false
---

PilotDeck은 “채팅창 하나 더”라기보다 **여러 AI 에이전트 작업을 프로젝트 단위로 운영하기 위한 로컬 cockpit**에 가깝다. 브라우저에서 WorkSpace를 만들고, 그 안의 파일·메모리·스킬·라우팅·Always-on 작업을 보면서, 뒤쪽의 Gateway가 모델 호출과 도구 실행을 관리한다.

`OpenBMB/PilotDeck` 저장소와 공식 문서를 기준으로 보면 핵심 메시지는 분명하다. 긴 프로젝트를 여러 개 동시에 굴릴 때 생기는 문제, 즉 메모리 오염, 모델 비용, 백그라운드 작업 중단, agent handoff 불투명성을 **WorkSpace-first 구조**로 풀겠다는 것이다.

조사 시점 기준 저장소는 공개된 지 얼마 되지 않은 초기 오픈소스 프로젝트다. GitHub API 기준 라이선스는 AGPL-3.0이고, 기본 브랜치 최신 커밋은 `75c9181`이었다. 별도 GitHub Release나 tag는 아직 없었다.

![PilotDeck architecture overview](/images/tips/pilotdeck-architecture.svg)

## PilotDeck 개요

PilotDeck의 기본 단위는 WorkSpace다. WorkSpace마다 파일 시스템, 메모리, 스킬이 분리되고, 사용자는 Web UI에서 각 프로젝트의 세션과 산출물을 확인한다. 공식 소개는 이를 “one deck per project”라고 설명한다.

구성은 크게 네 층으로 볼 수 있다.

- **Web UI / UI Server**: 기본 `http://localhost:3001`에서 프로젝트, 세션, 파일, 스킬, 라우팅, 메모리, Always-on 화면을 제공한다.
- **Gateway**: 기본 `18789` 포트에서 agent runtime, 세션, 도구, 모델 호출을 관리한다.
- **WorkSpace data**: 프로젝트별 파일, 메모리, 스킬, 세션 상태가 쌓이는 영역이다.
- **Provider / Tool 확장**: OpenAI, Anthropic, DeepSeek, Qwen, Kimi, MiniMax, OpenAI-compatible endpoint, MCP 서버, lifecycle hook, custom tool/skill을 붙이는 방향이다.

기술 스택은 TypeScript와 JavaScript가 중심이고, Web UI는 React/Vite 계열이다. `package.json` 기준 root package는 private이고, CLI entry는 `pilotdeck`이다. UI 쪽은 `concurrently`로 Gateway와 UI server를 함께 띄우는 구조를 사용한다.

## 핵심 기능: WorkSpace, 메모리, 라우팅, Always-on

PilotDeck이 기존 agent UI와 구분되는 지점은 네 가지다.

첫째, **WorkSpace 단위 격리**다. 한 프로젝트에서 배운 선호, 파일, 스킬이 다른 프로젝트에 무심코 섞이지 않도록 작업 단위를 분리한다. 장기 프로젝트를 여러 개 병렬로 굴리는 사람에게는 “대화 하나를 길게 이어가기”보다 이쪽 모델이 더 자연스럽다.

둘째, **화이트박스 메모리**다. README와 공식 문서는 메모리 생성, 추출, 저장, 검색 과정을 볼 수 있고 잘못된 기억을 직접 수정하거나 삭제할 수 있다고 설명한다. Dream Mode는 idle window에서 메모리를 정리하고, 필요하면 이전 상태로 되돌리는 흐름을 지향한다.

셋째, **Smart Router / TokenSaver**다. 단순한 요청은 가벼운 모델로, 복잡한 계획이나 orchestration은 강한 모델로 보내는 식의 tiering을 설정할 수 있다. README는 Xiaohongshu식 소셜 운영 워크로드에서 Smart Routing을 켰을 때 비용이 `$2.83`이고, 모두 Opus 4.5로 돌린 설정이 `$12.58`이었다고 보고한다. 또 7개 복합 작업 benchmark에서는 Sonnet 4.6 main + MiniMax-M2.7 sub 조합이 score `70.6`, cost `$3.15`로 Claude Sonnet 4.6 single-agent의 score `69.1`, cost `$18.36`과 비교된다. 이 수치는 프로젝트 팀이 제시한 벤치마크 결과이므로 그대로 보증처럼 받아들이기보다는, 라우팅 설계의 방향성을 보여주는 자료로 보는 편이 맞다.

넷째, **Always-on / Cron 기반 백그라운드 실행**이다. 사용자가 브라우저를 계속 붙잡고 있지 않아도 Discovery와 scheduled work를 돌리고, 결과를 파일과 요약으로 남기는 방향이다. 저장소 코드에는 `always-on`, `cron`, `sessionOverrides`, `applyCycle` 같은 런타임 구성이 들어 있다.

## 설치와 첫 실행

README가 권장하는 빠른 설치는 macOS / Linux용 one-line installer다.

```bash
curl -fsSL https://raw.githubusercontent.com/OpenBMB/PilotDeck/main/install.sh | bash
```

설치 스크립트는 Node.js 22 이상, git, ripgrep, lsof, native build tools를 확인하고, repo를 clone한 뒤 root dependency와 UI dependency를 설치하고 frontend를 build한다. Git LFS demo media는 기본적으로 skip하며, 필요한 경우 `PILOTDECK_INSTALL_LFS=1`로 받을 수 있다.

설치 후 기본 실행은 다음이다.

```bash
pilotdeck            # http://localhost:3001 시작
pilotdeck status     # 설치 위치, remote, branch, config, 다음 포트 확인
```

개발자가 source에서 직접 실행하려면 다음 흐름이다.

```bash
git clone https://github.com/OpenBMB/PilotDeck.git
cd PilotDeck

npm install
cd ui && npm install
cd ..

# dev mode: Gateway + UI dev server
cd ui && npm run dev

# production-style local start
cd ui && npm run start
```

Docker Compose도 제공한다.

```bash
docker compose up -d
```

Docker 문서는 `~/.pilotdeck/pilotdeck.yaml`을 container 안의 `/root/.pilotdeck/pilotdeck.yaml`로 mount하고, project data를 `pilotdeck-data` volume에 보존하는 구성을 제시한다. UI 서버는 `3001`, Gateway는 내부적으로 `18789`를 사용한다.

## 모델 설정은 어떻게 보나

PilotDeck 설정 파일은 기본적으로 `~/.pilotdeck/pilotdeck.yaml`이다. README의 최소 예시는 다음 형태다.

```yaml
schemaVersion: 1
agent:
  model: deepseek/deepseek-v4-pro
model:
  providers:
    deepseek:
      protocol: openai
      url: https://api.deepseek.com/v1
      apiKey: ***
      models:
        deepseek-v4-pro: {}
```

중요한 점은 “OpenAI-compatible endpoint 하나를 넣는 UI”보다 범위가 넓다는 것이다. model provider catalog, router tier, fallback, token stats, auto-orchestrate, memory model, web search provider, platform adapter가 같은 config surface 안에 들어간다. 공식 README는 OpenAI, Anthropic, DeepSeek, Qwen, Kimi, MiniMax, 기타 OpenAI-compatible endpoint를 언급한다.

즉 PilotDeck을 제대로 평가하려면 모델 하나를 붙여 채팅해보는 것보다, 다음을 같이 봐야 한다.

- 프로젝트별 WorkSpace가 실제로 파일·메모리·스킬을 잘 분리하는가
- 라우터가 어떤 요청을 어떤 tier로 보내는가
- token/cost 통계가 팀 운영에 충분히 설명 가능한가
- Always-on/Cron 작업이 실패했을 때 로그와 산출물을 추적하기 쉬운가
- MCP 서버와 lifecycle hook이 어느 권한 경계에서 실행되는가

## 도입 전 주의할 점

첫째, **초기 공개 프로젝트로 봐야 한다.** 조사 시점 기준 release/tag가 없고, 설치 스크립트는 default branch를 clone하거나 update한다. 팀에서 실험할 때는 특정 commit hash로 고정하고, installer를 그대로 pipe-to-bash 하기 전에 내용을 읽는 편이 좋다.

둘째, **AGPL-3.0 라이선스**다. 개인 로컬 실험은 큰 부담이 아닐 수 있지만, 사내 배포, SaaS형 운영, 수정본 배포, 네트워크 서비스 형태로 묶을 때는 AGPL 의무를 검토해야 한다.

셋째, **API key와 로컬 작업공간을 동시에 다루는 도구**다. `pilotdeck.yaml`에는 model provider key가 들어갈 수 있고, WorkSpace에는 프로젝트 파일, 메모리, agent output이 쌓인다. 백업, 화면 공유, Git add, Docker volume, 로그 수집 범위를 조심해야 한다.

넷째, **도구 실행 권한이 넓어질 수 있다.** MCP 서버, custom tools, lifecycle hooks, browser-use plugin, Always-on 작업은 편하지만 모두 로컬 파일·네트워크·브라우저 세션과 연결될 수 있다. 파일 시스템이나 사내 API를 다루는 MCP는 먼저 테스트 WorkSpace와 낮은 권한 credential로 시작하는 편이 안전하다.

다섯째, **포트와 프로세스 구조를 이해해야 한다.** 기본 UI 포트는 `3001`, Gateway 포트는 `18789`다. installer와 wrapper는 포트가 바쁘면 근처의 빈 포트를 찾도록 되어 있지만, reverse proxy나 firewall, Docker compose, 로컬 보안 도구를 붙일 때는 이 구조를 알고 있어야 한다.

마지막으로, **Windows 지원을 과하게 가정하면 안 된다.** 공식 사이트에는 Desktop Install/Windows navigation이 보이지만, README의 one-line installer는 macOS/Linux를 기준으로 하고 GitHub Release도 조사 시점에는 비어 있었다. Windows에서 쓰려면 Docker, WSL, 향후 desktop release 여부를 따로 확인하는 편이 맞다.

## 어디에 잘 맞는가

PilotDeck은 “AI에게 질문하고 답을 받는 도구”보다 “AI가 여러 프로젝트를 계속 굴리게 하는 운영면”이 필요한 사람에게 더 잘 맞는다.

좋은 사용처는 다음과 같다.

- 연구 조사, 문서 생성, 데이터 정리처럼 하루 이상 이어지는 프로젝트를 여러 개 병렬로 돌리는 경우
- 팀이나 개인이 agent memory를 블랙박스로 두지 않고 직접 보고 수정하고 싶은 경우
- 비싼 frontier model과 가벼운 model을 섞어 쓰면서 비용과 품질을 같이 관리하고 싶은 경우
- MCP, custom skill, lifecycle hook, Cron 작업을 하나의 UI에서 통제하고 싶은 경우
- “대화 로그”보다 파일, 메모리, 세션, tool call, 산출물을 운영 artifact로 남기고 싶은 경우

반대로 단일 IDE 안에서 코드 자동완성만 원하거나, API key를 넣지 않는 완전 오프라인 도구를 원하거나, 안정 release와 enterprise policy가 먼저 필요한 팀에는 아직 이르다. 특히 AGPL과 agent 권한 경계는 도입 전에 반드시 검토해야 한다.

## 내 판단

PilotDeck은 지금 시점에서 완성된 범용 agent OS라기보다, **에이전트 운영에서 진짜로 귀찮은 부분을 정면으로 다루는 초기 플랫폼**으로 보는 것이 맞다. WorkSpace 단위 격리, 화이트박스 메모리, 모델 라우팅, Always-on 실행을 한 화면에 모으려는 방향은 매우 실용적이다. 특히 에이전트를 “한 번 답하는 봇”이 아니라 “여러 프로젝트를 계속 관리하는 작업자”로 쓰려는 사람에게는 읽어볼 가치가 크다.

다만 바로 업무 핵심 환경에 붙이기보다는 sandbox에서 시작하는 편을 추천한다. 별도 API key, 별도 WorkSpace, 테스트용 MCP 서버, 작은 Cron 작업부터 붙여 보고, 라우팅 로그와 메모리 동작이 설명 가능한지 확인해야 한다. 그 과정에서 “우리 팀의 agent 작업은 어떤 단위로 격리해야 하는가”를 설계하는 데 PilotDeck이 좋은 참고 모델이 될 수 있다.

## 참고한 공개 자료

- [OpenBMB/PilotDeck GitHub repository](https://github.com/OpenBMB/PilotDeck)
- [PilotDeck official website](https://pilotdeck.openbmb.cn)
- [PilotDeck Project Overview documentation](https://pilotdeck.openbmb.cn/pilotdeck.github.io/docs/en/introduction)
- [PilotDeck live demo sandbox](https://pilotdeck.openbmb.cn/pilotdeck.github.io/demo/p/pilotdeck-demo)
- [PilotDeck README](https://github.com/OpenBMB/PilotDeck/blob/main/README.md)
- [PilotDeck Docker README](https://github.com/OpenBMB/PilotDeck/blob/main/README_DOCKER.md)
- [PilotDeck install.sh](https://github.com/OpenBMB/PilotDeck/blob/main/install.sh)
- [PilotDeck LICENSE](https://github.com/OpenBMB/PilotDeck/blob/main/LICENSE)
