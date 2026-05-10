---
title: "OpenClaw는 개인용 AI 비서를 여러 채널로 연결하는 로컬 게이트웨이다"
date: "2026-05-10T23:05:16"
description: "OpenClaw는 Node 기반 로컬 Gateway를 중심으로 Telegram, WhatsApp, Slack, Discord 같은 메시징 채널, CLI·웹·macOS 앱, 스킬·플러그인·크론 자동화를 묶어 개인용 AI 비서를 운영하는 MIT 오픈소스 프로젝트입니다."
author: "Sangmin Lee"
repository: "openclaw/openclaw"
sourceUrl: "https://github.com/openclaw/openclaw"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Personal AI"
  - "Gateway"
  - "Messaging"
  - "CLI"
  - "Automation"
  - "TypeScript"
highlights:
  - "로컬 Gateway를 중심으로 Telegram, WhatsApp, Slack, Discord, Signal, iMessage 등 여러 채널을 한 개인 AI 비서에 연결합니다."
  - "`openclaw onboard`가 모델, 워크스페이스, 채널, 스킬, 데몬 설치를 단계별로 잡아주는 CLI-first 온보딩을 제공합니다."
  - "Node 24 권장, Node 22.16+ 지원이며 macOS·Linux·Windows를 지원하되 Windows는 WSL2가 더 안정적인 경로로 안내됩니다."
  - "macOS 메뉴바 앱은 Gateway 관리와 TCC 권한, Canvas, 화면·카메라·시스템 노드를 담당하고, iOS·Android는 companion node 방향으로 설계되어 있습니다."
  - "메시징 채널과 로컬 도구 권한을 다루므로 DM pairing, allowlist, Gateway auth, sandbox, Tailscale/VPN 같은 보안 설정을 먼저 읽어야 합니다."
draft: false
---

OpenClaw는 “내가 쓰는 채팅방에서 호출할 수 있는 개인 AI 비서”를 직접 운영하려는 사람에게 맞는 프로젝트다. 핵심은 SaaS 챗봇 하나를 더 쓰는 것이 아니라, 내 장비에서 Gateway를 띄우고 그 위에 메시징 채널, 모델 provider, 스킬, 로컬 도구, 크론 작업, 모바일·데스크톱 노드를 연결하는 방식이다.

README 기준 OpenClaw는 Telegram, WhatsApp, Slack, Discord, Google Chat, Signal, iMessage, IRC, Microsoft Teams, Matrix, Feishu, LINE, Mattermost, Nextcloud Talk, Nostr, Synology Chat, Twitch, Zalo, WeChat, QQ, WebChat 등 많은 채널을 목표로 한다. 혼자 쓰는 “always-on assistant”를 만들고 싶지만 특정 플랫폼 하나에 갇히고 싶지 않은 사용자에게 특히 흥미롭다.

저장소는 TypeScript 중심의 MIT 오픈소스다. npm 패키지 이름은 `openclaw`이고 CLI 바이너리도 `openclaw`로 노출된다. 조사 시점의 npm `latest`는 `2026.5.7`, `beta`는 `2026.5.10-beta.1`이며, GitHub Release에는 macOS용 `OpenClaw-2026.5.7.dmg`와 ZIP 자산도 올라와 있다.

![OpenClaw logo](/images/tips/openclaw-logo.png)

## OpenClaw 개요

OpenClaw를 단순히 “AI agent CLI”로 보면 조금 좁다. 프로젝트가 설명하는 제품의 중심은 **Gateway**다. Gateway는 오래 떠 있는 control plane이고, 다음 요소들을 한곳에서 조정한다.

- 메시징 채널: Telegram, WhatsApp, Slack, Discord, Signal, iMessage 등
- 모델 provider: OpenAI, Anthropic, Google 등 여러 모델 설정과 failover
- 에이전트 세션: 개인 DM, 그룹 채널, 워크스페이스, multi-agent routing
- 도구: shell/file/browser/web search/media/메시징 액션 등
- 자동화: cron job, webhook, background task
- 스킬과 플러그인: AgentSkills 호환 skill folder, OpenClaw plugin API, ClawHub 생태계
- companion node: macOS 앱, iOS·Android 앱, headless node

즉 “터미널에서 한 번 대화하는 AI”보다 “내 채널과 기기 사이에서 계속 살아 있는 개인 비서 런타임”에 가깝다.

![OpenClaw Gateway architecture](/images/tips/openclaw-architecture.svg)

## 설치와 첫 설정

공식 README가 권장하는 경로는 CLI 온보딩이다. 런타임은 **Node 24 권장**, **Node 22.16+ 지원**으로 안내된다.

```bash
npm install -g openclaw@latest
# 또는: pnpm add -g openclaw@latest

openclaw onboard --install-daemon
```

`openclaw onboard`는 Gateway, 워크스페이스, 모델 provider, 채널, 스킬, 데몬 설치를 단계별로 구성한다. macOS에서는 LaunchAgent, Linux/WSL2에서는 systemd user unit, Windows에서는 Scheduled Task와 Startup-folder fallback을 다루는 식이다.

수동으로 Gateway를 띄우고 테스트하려면 README의 quick start 흐름은 다음처럼 시작한다.

```bash
openclaw gateway --port 18789 --verbose

openclaw agent --message "Ship checklist" --thinking high
```

메시징 채널까지 연결한 뒤에는 `openclaw message send`처럼 특정 target으로 메시지를 보내거나, 채널에서 들어온 DM을 agent turn으로 라우팅할 수 있다. 다만 실제 전화번호, 채팅 ID, 토큰은 로컬 설정과 pairing 절차에 맞춰 넣어야 한다.

## 어디에 쓰기 좋은가

OpenClaw가 빛나는 경우는 “AI에게 일을 시키는 표면”이 하나가 아닐 때다. 예를 들어 Telegram DM으로 간단한 지시를 보내고, 데스크톱에서는 CLI와 Control UI로 상태를 보며, macOS 앱은 화면·카메라·Canvas·알림 권한을 담당하고, 반복 작업은 cron job으로 돌리는 식이다.

실용적인 활용 그림은 다음에 가깝다.

- 개인 Telegram/WhatsApp DM에서 로컬 AI 비서 호출
- Slack/Discord 그룹에서는 mention 기반으로만 응답하도록 설정
- cron으로 주기적인 보고서, 모니터링, 리마인더 실행
- webhook으로 외부 이벤트를 agent session에 연결
- browser/file/shell 도구를 스킬과 함께 묶어 반복 업무 자동화
- Tailscale 또는 SSH tunnel로 원격 Gateway에 안전하게 접속

여러 AI 코딩 도구와 비교하면 OpenClaw는 “코드를 고치는 에이전트”에만 머무르지 않고, 채팅 채널·디바이스·자동화를 한 런타임에 묶으려는 쪽이다.

## 플랫폼과 앱 상태

CLI/Gateway는 macOS, Linux, Windows를 대상으로 한다. 공식 Getting Started는 Windows native도 지원한다고 설명하지만, 전체 경험은 WSL2가 더 안정적인 경로로 안내된다. Docker 설치도 가능하지만, 로컬 머신에서 빠르게 쓰려면 일반 npm 설치와 온보딩이 기본 선택지다.

macOS 앱은 좀 더 구체적인 companion 역할을 한다. 문서 기준 macOS 앱은 메뉴바 상태, 알림, Gateway lifecycle, local/remote mode, TCC 권한, Canvas, Camera, Screen Recording, `system.run`, PeekabooBridge 같은 macOS 전용 능력을 담당한다. GitHub Release와 `appcast.xml`에는 macOS 앱 업데이트 정보가 있고, `sparkle:minimumSystemVersion`은 `15.0`으로 표기되어 있다.

모바일은 아직 “Gateway를 대체하는 앱”이라기보다 node다.

- iOS 문서는 internal preview라고 명시하며, 공개 배포 앱으로 보기에는 이르다.
- Android 문서는 source가 `apps/android`에 있고 직접 빌드할 수 있다고 설명한다. Android는 Gateway를 호스팅하지 않고, macOS/Linux/Windows/WSL2에서 돌아가는 Gateway에 연결하는 companion node 역할이다.

따라서 지금 추천 경로는 **CLI/Gateway 먼저**, 필요하면 **macOS companion app**, 모바일은 문서와 릴리스 상태를 확인하며 실험하는 흐름이 안전하다.

## 보안과 운영 caveat

OpenClaw는 로컬 파일, shell, browser, 메시징 계정, 모델 API key, 모바일·데스크톱 권한을 다룰 수 있다. 그래서 “오픈소스라서 안전하다”보다 “권한 모델을 이해하고 켜야 한다”에 가깝다.

특히 먼저 확인할 부분은 다음이다.

- **Inbound DM은 untrusted input**: README는 Telegram/WhatsApp/Signal/iMessage/Teams/Discord/Google Chat/Slack 등에서 기본 DM pairing 또는 allowlist 정책을 강조한다.
- **공개 노출 금지에 가깝게 운영**: 원격 접속은 Tailscale/VPN 또는 SSH tunnel이 우선이다. non-loopback bind나 public Funnel을 쓰면 Gateway auth, allowed origins, password/token 설정을 반드시 점검해야 한다.
- **main session 도구는 host 권한**: 문서상 기본 main session의 도구는 host에서 실행될 수 있다. 그룹·채널 session에는 `agents.defaults.sandbox.mode: "non-main"` 같은 sandbox 설정을 검토하는 편이 좋다.
- **macOS 권한은 강력하다**: macOS 앱은 Accessibility, Screen Recording, Microphone, Speech Recognition, Automation/AppleScript 같은 TCC 권한을 소유할 수 있다. 편리하지만 권한 승인 범위를 이해해야 한다.
- **플러그인·스킬은 실행 표면**: 스킬은 agent 행동을 바꾸고, 플러그인은 tool/provider/channel을 확장한다. 외부 catalog나 workspace skill을 추가할 때 출처를 확인해야 한다.

운영 전에는 `openclaw doctor`, Security 문서, Sandboxing 문서, Gateway Configuration 문서를 함께 읽는 것이 좋다.

## 내 판단

OpenClaw는 “개인 AI 비서”를 제품처럼 운영하고 싶은 사람에게 꽤 매력적인 베이스다. 채팅 채널, 로컬 도구, 스케줄러, 스킬, 모바일·데스크톱 노드, 웹 Control UI가 한 방향으로 모여 있어, 단순 CLI보다 실제 생활/업무 채널에 붙이기 쉽다.

반대로 가볍게 한 번 써보는 챗봇을 찾는 사람에게는 설정면이 넓다. 모델 API key, 채널 pairing, Gateway auth, sandbox, 원격 접속, 앱 권한까지 운영자가 이해해야 하는 요소가 많다. 빠르게 변하는 프로젝트라 stable/beta release와 docs를 맞춰 보며 업데이트하는 습관도 필요하다.

그래도 “내 데이터와 내 채널 위에서 돌아가는 assistant를 직접 소유하고 싶다”면, OpenClaw는 지금 확인해볼 만한 오픈소스 프로젝트다. 처음에는 `openclaw onboard`로 로컬 Gateway 하나를 만들고, Telegram 같은 단일 채널부터 붙여본 뒤, cron·skills·macOS app·sandbox를 단계적으로 확장하는 접근을 추천한다.

## 참고한 공개 자료

- [openclaw/openclaw GitHub repository](https://github.com/openclaw/openclaw)
- [OpenClaw README](https://github.com/openclaw/openclaw/blob/main/README.md)
- [OpenClaw Getting Started](https://docs.openclaw.ai/start/getting-started)
- [OpenClaw Gateway Security](https://docs.openclaw.ai/gateway/security)
- [OpenClaw Sandboxing](https://docs.openclaw.ai/gateway/sandboxing)
- [OpenClaw macOS app docs](https://docs.openclaw.ai/platforms/macos)
- [OpenClaw npm package](https://www.npmjs.com/package/openclaw)
