---
title: "OpenOPC는 AI 에이전트를 ‘1인 회사’처럼 조직하고 운영한다"
date: "2026-08-30T14:08:33"
description: "HKUDS/OpenOPC는 목표에 맞춰 AI 역할을 구성하고, 작업을 위임·검토·재작업하며, CLI와 Office UI에서 진행 상황을 볼 수 있게 만든 Python 기반 오픈소스 에이전트 운영 도구다."
author: "Sangmin Lee"
repository: "HKUDS/OpenOPC"
sourceUrl: "https://github.com/HKUDS/OpenOPC"
status: "Open source beta"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Developer Tools"
  - "Workflow"
  - "Python"
  - "Office UI"
highlights:
  - "하나의 목표를 역할 기반 AI 팀과 작업 의존성 그래프로 나눠 진행한다."
  - "Task Mode와 Company Mode를 CLI·웹 Office UI에서 각각 실행하고 추적할 수 있다."
  - "칸반, 역할별 실행 기록, 리뷰·재작업·인간 에스컬레이션 흐름을 함께 제공한다."
  - "Python 3.10 이상과 Node.js 18 이상(Office UI 빌드 시)이 필요하며, 현재 버전 태그·릴리스는 없다."
  - "API 키, 외부 에이전트 CLI, 브라우저 자동화의 권한·비용·데이터 범위를 먼저 점검해야 한다."
draft: false
---

`HKUDS/OpenOPC`는 AI 에이전트 여러 명을 단순히 병렬 호출하는 데서 한 단계 더 나아가, 목표에 맞는 역할과 보고 구조를 만들고 이를 하나의 “회사”처럼 운영하려는 오픈소스 프로젝트다. 공개 저장소 기준 Python 중심 구현이며, CLI와 React + Phaser 기반 Office UI를 함께 제공한다.[1][2][3]

이 도구의 핵심은 **Self-Built / Self-Run / Self-Grown**이라는 세 단계다.[2] 역할과 조직도를 만들고, 업무를 의존성이 있는 work item으로 나눠 위임·검토·통합·재작업하며, 결과에서 얻은 경험을 역할별·공유 지식으로 축적하겠다는 구조다.[2] 막힌 일이 팀의 권한을 넘으면 사람에게 올리는 human-owner escalation도 설계에 들어 있다.[2]

![OpenOPC Company Mode kanban workflow](/images/tips/openopc-kanban-workflow.png)

## 무엇이 다른가

OpenOPC는 “에이전트에게 한 번 지시하고 답을 받는” 도구보다, **완성해야 할 산출물이 여러 역할과 검토 단계를 요구하는 작업**에 더 맞는다.[2] Company Mode에서는 매니저 역할이 일을 분해하고, 항목 상태에 따라 담당자·실행 가능 여부·칸반 위치를 관리한다.[2] 독립 작업은 병렬로 처리하고, 선행 조건이 있는 작업은 기다리게 하는 의존성 DAG도 명시한다.[2]

Office UI의 Workspace는 대화, 실행 진행도, 역할별 상태, 작업 상세, 커뮤니케이션을 모으고, Kanban은 계획·실행·리뷰·완료 흐름을 보여준다.[2] Office 탭은 에이전트를 시각적으로 보고 상태와 현재 작업을 확인하는 공간이며, Org 탭에서는 조직 구조·역할·채용된 직원·런타임 정책을 다룬다.[2]

## 설치와 첫 실행

프로젝트는 패키지 버전 `0.1.0`을 선언하며 Python `>=3.10`을 요구한다.[3] README는 전역 Python을 섞지 않도록 `uv` 환경을 권장한다.[2] Office UI 프런트엔드를 빌드해야 할 때는 Node.js `>=18`도 필요하다.[2]

```bash
# macOS 예시: uv와 Python 3.12 환경 준비
brew install uv
cd /path/to/OpenOPC
uv python install 3.12
uv venv --python 3.12
source .venv/bin/activate

# OpenOPC 설치 및 초기화
uv pip install -e .
uv run python -m playwright install chromium  # 브라우저 도구를 쓸 때
uv run opc init

# .opc/config/llm_config.yaml 또는 지정된 환경 변수에 API 키를 설정한 뒤
uv run opc ui
```

기본 UI 주소는 `http://localhost:8765`이다.[2] CLI만 써보고 싶다면 다음처럼 Task Mode와 Company Mode를 나눠 실행할 수 있다.[2]

```bash
# 단일 에이전트 작업
uv run opc chat -p demo --mode task --agent codex "Refactor this module and run focused tests"

# 역할 기반 회사 실행
uv run opc chat -p demo --mode company --company-profile corporate \
  "Plan, implement, review, and document this feature"
```

## 언제 유용한가

- 구현, 검토, 문서화가 이어지는 **중간 규모 이상의 개발 작업**을 역할 단위로 나눠 보고 싶을 때[2]
- 조사·기획·제작·검증처럼 결과물이 여러 개이고, 누가 어느 결과를 검토해야 하는지 남겨야 할 때[2]
- 실행 중인 에이전트 팀을 칸반과 실행 기록으로 관찰하고, 재작업 또는 사람의 결정을 어느 지점에서 넣을지 통제하고 싶을 때[2]
- Codex, Claude Code, Cursor, OpenCode 같은 외부 에이전트 CLI를 Task Mode의 실행 주체로 선택해 비교해 보고 싶을 때[2]

특히 여러 에이전트에 단순한 역할 프롬프트만 붙이는 방식이 답답했던 경우에 흥미롭다.[2] 조직도, 업무 의존성, 담당 역할, 리뷰 결과가 한 실행 모델 안에 들어가므로 “누가 무엇을 했고 왜 멈췄는가”를 추적하기 쉽다.[2] 다만 이런 구조가 가볍다는 뜻은 아니다. 작은 일 하나에는 직접 CLI나 단일 에이전트가 더 빠를 수 있다.[2]

## 운영 전에 볼 점

OpenOPC는 로컬에 `.opc/config/`, `.opc/memory/`, 프로젝트 런타임 정보와 UI 상태를 만들고, 기본 workplace에는 실제 산출물을 쓴다.[2] 처음에는 별도 테스트 프로젝트와 별도 API 키를 사용하고, 외부 에이전트·브라우저 도구에 줄 수 있는 파일·네트워크 권한과 토큰 비용 범위를 좁혀 두는 편이 좋다.[2]

또한 현재 GitHub Releases와 태그가 없고, 보안 정책도 버전 릴리스가 아직 없으며 최신 `main`만 지원한다고 명시한다.[1][5]
따라서 “설치형 완성 제품”보다 빠르게 변하는 소스 기반 베타로 보는 것이 정확하다.[1][5]
운영 환경에 바로 넣기보다, 재현 가능한 커밋을 고정하고 작은 작업으로 평가한 뒤 도입 범위를 넓히는 편을 권한다.[5]

라이선스는 MIT다.[4] 상업·수정·재배포가 가능한 허용적 라이선스지만, 소프트웨어는 보증 없이 제공된다는 조항도 함께 확인해야 한다.[4]

## 내 판단

OpenOPC는 에이전트 오케스트레이션을 “여러 모델을 동시에 돌리는 기능”이 아니라 **조직 운영과 검토 가능한 작업 흐름**으로 풀어내려는 프로젝트다. 여러 역할이 필요한 개발·리서치·콘텐츠 생산을 실제로 반복하는 팀이라면 Company Mode의 칸반과 역할별 진행 기록을 먼저 시험해 볼 가치가 있다.

반대로 API 키 설정, Python/Node 환경, 브라우저 자동화, 외부 에이전트 CLI까지 한꺼번에 관리하고 싶지 않거나 단발성 작업이 대부분이라면 너무 무겁다. 그 경우에는 Task Mode만 제한적으로 써 본 뒤, 회사 모드가 실제 품질·감사·재작업 비용을 낮추는지 확인하는 순서가 현실적이다.

## Sources

[1] https://github.com/HKUDS/OpenOPC — HKUDS/OpenOPC GitHub repository
[2] https://raw.githubusercontent.com/HKUDS/OpenOPC/main/README.md — OpenOPC README
[3] https://raw.githubusercontent.com/HKUDS/OpenOPC/main/pyproject.toml — OpenOPC pyproject.toml
[4] https://raw.githubusercontent.com/HKUDS/OpenOPC/main/LICENSE — OpenOPC MIT license
[5] https://raw.githubusercontent.com/HKUDS/OpenOPC/main/SECURITY.md — OpenOPC security policy
