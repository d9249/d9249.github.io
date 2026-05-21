---
title: "DOT Studio는 OpenCode 위에서 AI 에이전트 팀을 시각적으로 설계하는 로컬 작업대다"
date: "2026-05-22T02:00:12"
description: "DOT Studio는 Tal, Dance, Performer, Act를 캔버스에서 조합하고 이를 OpenCode 실행 아티팩트로 투영하는 TypeScript 기반 MIT 오픈소스 로컬 AI 에이전트 워크스페이스입니다."
author: "Sangmin Lee"
repository: "dance-of-tal/dot-studio"
sourceUrl: "https://github.com/dance-of-tal/dot-studio"
status: "Open source beta"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "OpenCode"
  - "Visual Workflow"
  - "MCP"
  - "CLI"
  - "TypeScript"
highlights:
  - "Figma식 캔버스에서 Tal, Dance, Performer, Act를 배치하고 연결해 AI 워크플로를 설계합니다."
  - "작성 상태를 `.opencode/agents/dot-studio/...` 같은 OpenCode 실행 아티팩트로 투영해 실제 런타임과 연결합니다."
  - "npm 패키지 `dot-studio`로 배포되며 Node.js `>=20.19.0`, macOS·Linux·Windows·WSL, OpenCode 지원 환경을 요구합니다."
  - "Studio Assistant, performer chat, Act runtime thread, MCP 설정, Discord runtime chat 표면까지 한 로컬 UI 안에서 다루려는 방향입니다."
  - "아직 0.2.x 계열의 빠르게 변하는 도구이므로 OpenCode 권한, 로컬 포트, provider auth, MCP/Discord 토큰, 생성 아티팩트 범위를 확인하고 써야 합니다."
draft: false
---

DOT Studio는 “AI 에이전트 설정 파일을 직접 뒤지는 일”을 줄이고 싶은 사람에게 흥미로운 로컬 작업대다. 프로젝트가 내세우는 핵심은 **Dance of Tal을 위한 시각적 Studio**이며, 그 위에서 Tal, Dance, Performer, Act 같은 에이전트 구성 요소를 캔버스로 조합한 뒤 OpenCode가 실행할 수 있는 형태로 투영한다.

일반적인 agent builder는 프롬프트, 스킬, 모델 설정, MCP 서버, 협업 규칙, 실행 이력을 서로 다른 파일과 터미널 창에서 추적한다. DOT Studio는 이 조각들을 브라우저 기반 로컬 UI로 모아 “설계 → 실행 → 채팅 → 수정” 루프를 한 화면에서 다루려는 쪽에 가깝다.

조사 시점 기준 저장소는 TypeScript 중심의 MIT 오픈소스이고, npm 패키지 `dot-studio`의 최신 버전은 `0.2.13`이다. GitHub의 latest release 페이지는 `v0.2.12`로 보이지만 태그와 npm 패키지는 `v0.2.13`까지 올라와 있어, 지금은 npm 배포와 태그를 함께 확인하는 편이 안전하다.

![DOT Studio canvas](/images/tips/dot-studio-canvas.png)

## DOT Studio 개요

DOT Studio의 기본 단위는 다음 네 가지로 이해하면 쉽다.

- **Tal**: 에이전트의 정체성, 지시문, 행동 스타일을 담는 레이어
- **Dance**: 재사용 가능한 스킬 또는 capability 패키지
- **Performer**: Tal, Dance, model, MCP 설정을 조합한 실행 가능한 에이전트
- **Act**: 여러 Performer가 어떤 관계와 규칙으로 협업할지 정의하는 choreography

짧게 쓰면 `Tal + Dance + model + tools = Performer`, `Performers + relationships + rules = Act`에 가깝다. Studio는 이 구조를 텍스트 파일만으로 관리하는 대신, canvas, panel, chat, inspector, runtime thread로 다루게 해준다.

아키텍처상으로는 `src/`가 브라우저 UI, `shared/`가 클라이언트/서버 계약, `server/`가 workspace·session·projection·runtime action을 담당한다. 중요한 점은 Studio 자체가 최종 실행 런타임을 모두 대체한다기보다, 작성 상태를 OpenCode가 이해할 수 있는 projection으로 내보내고 OpenCode sidecar가 실제 실행을 맡는다는 점이다.

## 설치와 첫 사용법

공식 README 기준 설치는 npm global package가 기본 경로다.

```bash
npm install -g dot-studio
dot-studio /path/to/project
```

요구 조건은 다음이다.

- Node.js `>=20.19.0`
- macOS, Linux, Windows, 또는 WSL
- OpenCode가 동작할 수 있는 환경

대상 디렉터리가 DOT workspace로 초기화되어 있지 않으면 Studio가 자동으로 준비한 뒤 브라우저 UI를 연다. 현재 디렉터리를 바로 열려면 다음처럼 쓸 수 있다.

```bash
dot-studio
# 또는
dot-studio open .
```

유용한 CLI 흐름도 있다.

```bash
dot-studio doctor
dot-studio --openai-oauth
dot-studio open . --no-open
dot-studio open . --port 43111
dot-studio open . --act act/@acme/workflows/review-flow
```

published CLI는 기본적으로 Studio app/API를 `43100`, 관리되는 OpenCode sidecar를 `43102`에 둔다. 개발 모드에서는 client/API/sidecar가 각각 `43200`, `43201`, `43202`를 쓴다. 이미 다른 로컬 agent UI나 OpenCode 인스턴스를 띄워둔 환경에서는 포트 충돌 여부를 먼저 보는 게 좋다.

## 왜 유용한가

DOT Studio가 노리는 문제는 단순히 “예쁜 노드 그래프”가 아니다. AI agent workflow는 시간이 지나면 정체성 프롬프트, 스킬 묶음, 모델 선택, 도구 권한, MCP 설정, agent 간 메시지 규칙이 금방 흩어진다. Studio는 이 흩어진 설정을 다음처럼 한 workspace로 묶으려 한다.

- canvas에서 Performer와 Act를 배치하고 관계를 확인한다.
- Studio Assistant에게 Tal, Dance, Performer, Act 초안을 만들거나 수정하게 한다.
- standalone performer, Act participant, Studio Assistant와 같은 UI에서 채팅한다.
- workspace 상태를 로컬에 보존하면서 OpenCode 실행 아티팩트를 갱신한다.
- MCP 서버, 모델, provider auth, runtime 설정을 같은 작업 흐름 안에서 다룬다.
- 필요하면 Discord bot을 연결해 저장된 Studio workspace와 performer/Act thread를 외부 채팅 표면으로 노출한다.

특히 “에이전트 하나”보다 “역할이 다른 여러 에이전트가 협업하는 워크플로”를 실험하는 사람에게 맞다. 예를 들어 reviewer, implementer, planner, researcher 같은 Performer를 만들고, 이들이 어떤 Act 안에서 어떤 규칙으로 메시지를 주고받을지 시각적으로 잡아볼 수 있다.

## OpenCode와 projection 경계

DOT Studio를 쓸 때 가장 중요한 개념은 **작성 상태와 실행 아티팩트를 분리한다**는 점이다. README도 `.opencode/`를 generated output으로 보고, Studio state와 source files를 source of truth로 취급하라고 강조한다.

즉 다음 경계를 기억하는 편이 좋다.

- Studio UI: 사람과 assistant가 agent 구성을 보고 수정하는 authoring surface
- Studio server: workspace, chat session, projection, runtime action을 조정하는 로컬 API
- `.opencode/` projection: OpenCode가 읽을 수 있도록 생성된 실행 아티팩트
- OpenCode runtime: 실제 Performer와 Act 실행을 담당하는 쪽

문서에는 Codex project subagent projection 관련 규칙도 보인다. Performer가 Codex 지원 OpenAI 모델을 사용할 때 `.codex/agents/dot_studio_*.toml` 같은 Codex용 projection을 만들 수 있고, Dance access는 Codex-native skill config와 MCP server TOML로 투영하는 식이다. 이 부분은 꽤 흥미롭지만, 사용자는 generated 파일을 직접 손으로 편집하기보다 Studio의 source state를 통해 수정하는 쪽이 안전하다.

## 활용 포인트

DOT Studio를 바로 써볼 만한 경우는 다음이다.

- OpenCode 기반 agent를 여러 개 만들고 역할별로 분리하고 싶다.
- skill/prompt/model/MCP 조합이 늘어나면서 어떤 agent가 어떤 능력을 갖는지 시각적으로 보고 싶다.
- multi-agent workflow를 텍스트 문서가 아니라 canvas와 runtime chat으로 실험하고 싶다.
- agent 팀의 실행 history와 permission/question 상태를 한 UI에서 따라가고 싶다.
- Discord 같은 외부 채팅 표면을 agent runtime에 붙이되, Studio workspace를 source of truth로 유지하고 싶다.

반대로 단일 CLI agent에게 가끔 코딩 작업을 맡기는 정도라면 초기 설정과 개념이 다소 크게 느껴질 수 있다. DOT Studio는 “가벼운 채팅창”보다는 agent composition IDE에 가깝다.

## 주의할 점

첫째, 아직 빠르게 변하는 0.2.x 계열이다. 저장소 생성 시점도 2026년 3월이고, README·태그·npm·GitHub release 사이에 버전 표면이 조금씩 어긋날 수 있다. 설치 전에는 npm 패키지와 GitHub 태그를 함께 확인하는 게 좋다.

둘째, 로컬 실행 권한을 가볍게 보면 안 된다. Studio는 OpenCode sidecar를 관리하고, provider auth, MCP server, workspace files, generated projection을 다룬다. AI agent가 로컬 프로젝트를 읽고 수정할 수 있는 구조이므로, 신뢰하지 않는 repo나 비밀이 많은 workspace에서는 권한·설정·생성 파일 범위를 먼저 확인해야 한다.

셋째, Discord integration은 편하지만 보안 표면이 넓다. 문서 기준 Discord bot token은 `~/.dot-studio/discord-config.json`에 로컬 저장되고, 기본 접근 제어는 Discord `Manage Server` 권한을 요구한다. 그래도 Discord message가 로컬 Studio runtime 실행으로 이어질 수 있으므로, 공개 서버에 붙이기 전에는 bot token, Message Content Intent, role/user allowlist, 채널 권한을 검토해야 한다.

넷째, generated output을 source of truth로 삼지 않는 습관이 필요하다. `.opencode/`, Codex projection, skill bundle sync 결과물은 디버깅에는 유용하지만, 장기적으로는 Studio state와 원본 Tal/Dance/Performer/Act 정의를 기준으로 관리하는 편이 맞다.

## 내 판단

DOT Studio는 OpenCode 생태계에서 “에이전트를 한 명씩 호출하는 단계”를 넘어, 여러 역할과 스킬을 가진 agent 팀을 설계하고 실행하려는 사람에게 잘 맞는다. 캔버스, assistant, runtime chat, projection, MCP 설정이 한 방향으로 묶여 있어, 복잡한 agent workflow를 눈으로 보며 다듬는 경험을 만들려는 의도가 분명하다.

다만 지금은 안정된 기업용 orchestrator라기보다, 빠르게 진화 중인 로컬 agent studio에 가깝다. 그래서 추천 흐름은 간단하다. 먼저 테스트용 프로젝트에서 `dot-studio doctor`와 `dot-studio open .`로 기본 실행을 확인하고, 작은 Performer 하나를 만든 뒤, Act와 Discord/MCP/Codex projection은 단계적으로 켜는 편이 좋다.

OpenCode를 이미 쓰고 있고 “이제 agent 구성을 그림처럼 설계하고 싶다”면 확인해볼 가치가 크다. 반대로 OpenCode 자체를 아직 쓰지 않거나, 단일 agent CLI만으로 충분하다면 DOT Studio의 개념 밀도는 다소 높게 느껴질 수 있다.

## 참고한 공개 자료

- [dance-of-tal/dot-studio GitHub repository](https://github.com/dance-of-tal/dot-studio)
- [DOT Studio README](https://github.com/dance-of-tal/dot-studio/blob/main/README.md)
- [DOT Studio npm package](https://www.npmjs.com/package/dot-studio)
- [DOT Studio v0.2.12 release](https://github.com/dance-of-tal/dot-studio/releases/tag/v0.2.12)
- [Discord Integration guide](https://github.com/dance-of-tal/dot-studio/blob/main/DISCORD_INTEGRATION.md)
- [Runtime Change Boundary Guide](https://github.com/dance-of-tal/dot-studio/blob/main/doc/RUNTIME_CHANGE_BOUNDARY_GUIDE.md)
- [Chat Session Runtime Guide](https://github.com/dance-of-tal/dot-studio/blob/main/doc/CHAT_SESSION_RUNTIME_GUIDE.md)
