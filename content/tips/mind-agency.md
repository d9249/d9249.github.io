---
title: "Mind Agency는 AI 에이전트를 팀처럼 굴리는 로컬 협업 대시보드다"
date: "2026-06-06T21:36:36"
description: "Toufumind/mind-agency는 여러 AI 에이전트를 역할·그룹·워크플로로 묶어 채팅, 리뷰, 투표, 메모리, 감사 로그를 로컬에서 관리하려는 Windows 중심 오픈소스 멀티 에이전트 플랫폼입니다."
author: "Sangmin Lee"
repository: "Toufumind/mind-agency"
sourceUrl: "https://github.com/Toufumind/mind-agency"
status: "Open source beta"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Multi-Agent"
  - "Workflow"
  - "Desktop App"
  - "TypeScript"
  - "MCP"
highlights:
  - "Alice, Bob, Charlie처럼 역할이 다른 에이전트를 만들고 그룹 채팅·메일·워크플로 안에서 협업시키는 제품형 UI를 제공합니다."
  - "YAML DAG 워크플로, human approval, consensus voting, adversarial review, checkpoint recovery를 하나의 로컬 대시보드에 묶는 방향입니다."
  - "v0.4.0 기준 Windows x64 설치 파일이 공개되어 있고, macOS/Linux는 현재 소스 실행 경로를 사용해야 합니다."
  - "API Key와 에이전트 기억, 그룹 채팅, 감사 로그가 로컬 파일에 쌓이므로 개인/팀 데이터 보관 위치와 provider 전송 범위를 먼저 확인해야 합니다."
  - "로드맵에 CLI, Docker, multi-workspace, 인증 시스템이 남아 있어 지금은 실험·프로토타입 팀 운영에 더 적합합니다."
draft: false
---

Mind Agency는 “프롬프트 템플릿을 잘 짜는 앱”이라기보다, 여러 AI 에이전트를 작은 조직처럼 배치해 일을 나누게 하려는 **로컬 멀티 에이전트 협업 플랫폼**이다. 사용자는 Alice, Bob, Charlie 같은 에이전트를 만들고, 각자에게 역할·성격·메모리를 주고, 그룹과 워크플로 안에서 대화·리뷰·테스트·승인 과정을 돌린다.

제품의 메시지는 단순하다. 한 AI가 처음부터 끝까지 혼자 처리하다가 놓치는 일을, 역할이 다른 여러 AI가 서로 리뷰하고 투표하고 기록하면 더 안정적으로 만들 수 있다는 것이다. README는 이를 “From Agent to Agency”라고 표현한다.

조사 시점 기준 저장소는 TypeScript 중심이며, Next.js 15, React 19, Electron, Node WebSocket 서버, Claude Agent SDK, 자체 MCP group server로 구성되어 있다. 최신 공개 릴리스는 `v0.4.0`이고, Windows용 `Mind-Agency-Setup-0.4.0.exe`가 GitHub Releases에 올라와 있다.

![Mind Agency dashboard](/images/tips/mind-agency-dashboard.png)

## Mind Agency 개요

Mind Agency의 중심은 대시보드다. 왼쪽 사이드바에서 개요, 감사 로그, 워크플로, 그룹, 멤버, 사용량, 설정을 이동하고, 메인 화면에서는 에이전트 수, 그룹 수, 오늘 비용, 대기 승인 같은 상태를 확인한다.

구조는 대략 다음처럼 볼 수 있다.

- **Frontend**: Next.js + Tailwind 기반 대시보드, Agent/Group/Workflow/Settings 화면
- **Backend**: Node.js WebSocket 서버, EventBus, WorkflowEngine, DLQ/Outbox, checkpoint recovery
- **AI Layer**: Claude Agent SDK와 Codex CLI provider, MCP group server
- **Data**: `Agents/`, `Groups/`, `.audit/`, `.mind/` 아래 로컬 파일 시스템

README가 강조하는 기능도 제품형 협업 도구에 가깝다. 에이전트 간 그룹 채팅과 메일, AND/OR/threshold voting, adversarial review, YAML로 정의하는 DAG workflow, human approval gate, 장기 메모리, 감사 로그가 한 화면 계열에 묶인다.

## 왜 흥미로운가

여러 에이전트를 “동시에 많이 부르는” 수준의 프로젝트는 많지만, Mind Agency는 에이전트 협업을 **조직 운영 문제**로 다룬다는 점이 눈에 띈다.

- 한 에이전트가 코드를 작성하면 다른 에이전트가 리뷰하고, 또 다른 에이전트가 테스트하는 흐름을 기본 예제로 둔다.
- 합의가 필요한 작업은 voting rule과 승인자를 통해 처리하려고 한다.
- 실패·재시도·중단 복구를 워크플로 엔진의 일부로 다룬다.
- 에이전트 기억과 프로젝트 기억을 로컬 파일로 남겨 다음 실행의 컨텍스트로 다시 쓴다.
- 모든 액션을 감사 로그로 남기려는 방향이라, “왜 이 결정이 났는가”를 나중에追적할 여지가 있다.

즉 CrewAI나 AutoGen 같은 프레임워크를 직접 조립하기보다, 팀 협업 UI와 운영 규칙까지 포함한 데스크톱 제품으로 실험해보고 싶은 사람에게 맞는 형태다.

![Mind Agency workflows](/images/tips/mind-agency-workflows.png)

## 설치와 첫 사용법

가장 직접적인 설치 경로는 Windows 설치 파일이다. GitHub Releases에서 `Mind-Agency-Setup-0.4.0.exe`를 내려받아 실행한다.

```text
https://github.com/Toufumind/mind-agency/releases
```

macOS와 Linux는 현재 설치 파일보다 소스 실행 경로가 현실적이다. 공식 README의 개발 실행 흐름은 다음과 같다.

```bash
git clone https://github.com/Toufumind/mind-agency.git
cd mind-agency
npm install
npm run dev          # Next.js (:3000)
npm run dev:ws       # WebSocket (:3001)
npm run dev:all      # 둘 다 실행
```

필수 런타임은 Node.js 18 이상이다. 처음 열면 Settings에서 API Key를 넣고, Claude / DeepSeek / GPT-4o 계열 provider를 설정하는 흐름이다. 웹사이트 FAQ는 데이터가 로컬에 남고, 실제 AI 대화만 사용자가 설정한 API provider로 전송된다고 설명한다.

## 활용 포인트

Mind Agency를 지금 써볼 만한 경우는 세 가지다.

첫째, **멀티 에이전트 리뷰 루프를 눈으로 보고 싶을 때**다. 단일 에이전트에게 “코드 작성, 리뷰, 테스트”를 모두 맡기는 대신, 작성자·리뷰어·테스터 역할을 분리하고 그룹 채팅 기록으로 남길 수 있다.

둘째, **워크플로를 YAML로 고정하고 싶은 경우**다. `Groups/*/workflow.yaml` 아래에는 code review, deploy pipeline, research project 같은 예제 워크플로가 들어 있다. 단계 간 의존성, 리뷰 단계, human approval gate를 명시해 반복 작업을 일정한 구조로 돌릴 수 있다.

셋째, **에이전트 협업 운영 모델을 실험하고 싶은 경우**다. 어떤 작업에 투표를 걸지, 누가 승인자인지, 어떤 메모리가 다음 실행에 들어가야 하는지 같은 질문을 UI와 파일 구조로 다룰 수 있다. 팀 내부 PoC나 개인 연구 자동화 실험에 특히 잘 맞는다.

## 주의할 점

아직은 초기 공개 버전으로 보는 편이 안전하다. 저장소는 2026년 6월 공개되었고, `ROADMAP.md` 기준 v0.4.0은 “오픈소스 공개” 단계다. v0.5.0 이후 과제로 CLI, Docker 배포, 추가 provider가 남아 있고, v0.6.0 과제로 multi-workspace, issue board, 인증 시스템이 적혀 있다.

플랫폼도 구분해야 한다. Windows x64는 설치 파일이 있지만, macOS/Linux는 소스 실행 중심이다. 사이트의 tips 분류상 `macos-linux`와 `winos`를 모두 넣지만, 실제 데스크톱 배포는 Windows가 먼저다.

보안·운영 측면에서는 로컬 파일과 에이전트 권한을 먼저 확인해야 한다. 설정 API는 API Key를 `.mind/settings.json`에 저장하고, 화면 응답에서는 마스킹한다. 에이전트 메모리, 그룹 채팅, 이메일형 메시지, 감사 로그, 토큰 사용량도 로컬 데이터 디렉터리에 쌓인다. 백업·공유·스크린샷을 만들 때 이 데이터가 함께 나가지 않도록 봐야 한다.

또 소스상 Claude provider는 `permissionMode: 'bypassPermissions'`를 사용하고, Codex provider는 `--full-auto`로 실행된다. 즉 실험용 워크스페이스에서는 편하지만, 실제 프로젝트에 붙이기 전에는 허용 도구, 작업 디렉터리, provider key, 외부 전송 범위, 로컬 파일 쓰기 권한을 명시적으로 제한하는 편이 좋다.

## 내 판단

Mind Agency는 지금 당장 “팀 전체가 도입할 완성형 에이전트 운영 플랫폼”이라기보다, **AI 에이전트를 조직처럼 운영하면 어떤 UX가 필요한지 보여주는 빠른 프로토타입**에 가깝다. 대시보드, 워크플로, 합의, 메모리, 감사 로그를 한 저장소에 묶은 방향은 좋고, 특히 로컬 파일 기반으로 협업 흔적을 남긴다는 점이 실험하기 쉽다.

반대로 인증, workspace isolation, Docker/self-hosting, CLI, 더 넓은 provider 지원이 필요한 팀이라면 로드맵 진행을 지켜보는 편이 낫다. 그래도 “한 명의 AI에게 모든 일을 맡기는 방식”에서 벗어나, 작성자·리뷰어·테스터·승인자 역할을 나눠보려는 사람이라면 짧게 clone해서 워크플로 예제를 살펴볼 가치가 있다.

## 참고한 공개 자료

- [Toufumind/mind-agency GitHub repository](https://github.com/Toufumind/mind-agency)
- [Mind Agency official website](https://mindagency.cn)
- [Mind Agency v0.4.0 GitHub Release](https://github.com/Toufumind/mind-agency/releases/tag/v0.4.0)
- [Mind Agency ROADMAP.md](https://github.com/Toufumind/mind-agency/blob/master/ROADMAP.md)
