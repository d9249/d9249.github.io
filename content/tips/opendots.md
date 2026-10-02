---
title: "OpenDots: 개인 AI 동료를 직접 구성하는 셀프호스팅 템플릿"
date: "2026-10-02T19:08:08"
description: "전문 역할별 AI Dot, 문서 Space, 승인 흐름과 Dot별 컴퓨터를 조합하는 CopilotKit의 오픈소스 에이전트 워크스페이스 템플릿."
author: "Sangmin Lee"
repository: "CopilotKit/OpenDots"
sourceUrl: "https://github.com/CopilotKit/OpenDots"
status: "Open source alpha"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "AI Agents"
  - "Self-hosted"
  - "CopilotKit"
  - "Agent Computers"
highlights:
  - "완성된 SaaS가 아니라, Dots·Spaces·서비스 연결을 직접 구성하는 셀프호스팅 에이전트 템플릿이다."
  - "대화에서 초안을 검토·승인한 뒤 Space 문서로 저장하고, 필요하면 Dot별 컴퓨터 도구를 연결한다."
  - "Node.js 24와 외부 대화·모델 서비스를 준비해야 한다. 저장소는 Alpha이며 GitHub release/tag가 아직 없다."
  - "단일 소유자 시작점이다. Docker 컴퓨터는 호스트 커널을 공유하므로 보안 경계로 과신하면 안 된다."
draft: false
---

OpenDots는 AI 동료를 바로 구독하는 서비스가 아니라, 역할별 에이전트(Dot)와 문서 공간(Space), 대화·도구를 한데 묶어 직접 고칠 수 있는 오픈소스 템플릿이다.[1][2][3]
운영자가 템플릿을 복제해 각 Dot의 역할·지침·허용 도구와 연결 서비스를 구성하는 출발점으로 소개된다.[2]

![OpenDots의 Scout가 채팅에서 브라우저를 여는 공식 데모 화면](/images/tips/opendots-computer-chat-poster.jpg)

*공식 Computer chat 데모의 한 장면이다.[14][17] README의 영상은 실제 화면 녹화지만 대기 구간을 줄이고 재생 속도를 높인 설명용 캡처이며, 응답 속도 측정 자료는 아니다.[14]*

별도의 Chat-to-Space 데모에서는 초안을 사람에게 보여주고 승인받은 뒤 Space 페이지로 저장하는 흐름을 확인할 수 있다.[14][15][16]

## 어떻게 쓰는가

Space는 작업 문서를 모으는 공간이며, 페이지를 직접 작성하거나 대화에서 초안을 받아 사람의 승인 카드 후 저장할 수 있다.[2]
페이지와 Dot 조합마다 별도의 대화를 연결하고, 수동 문서 편집은 대화 서비스를 설정하기 전에도 가능하다.[6]

각 Dot에 OpenBot 기반 컨테이너 컴퓨터를 붙일 수 있고, 브라우저 프로필과 작업 파일은 컨테이너를 멈췄다 다시 시작해도 유지된다.[2][7]
브라우저·파일·셸 권한은 Dot별로 관리되며 기본값은 비활성이다.[7]
컴퓨터 서비스에 연결되지 않으면 OpenDots가 호스트의 셸이나 파일로 우회 실행하지 않는다.[7]

Slack과 음성 통화도 지원 경로에 포함되지만, 별도 서비스 구성이 필요한 기능이다.[2][6]
Slack은 CopilotKit Intelligence의 관리형 채널을 연결하고 작업공간과 사용자 ID 허용 목록을 설정해야 한다.[6]
저장소의 검증 노트는 Slack 연동과 음성 통화에서의 컴퓨팅 위임을 아직 라이브로 확인하지 않았다고 구분한다.[14]

## 설치와 첫 실행

공식 로컬 시작 절차는 Node.js 24와 npm을 사용하는 방식이다.[2][6][8]

```sh
git clone https://github.com/CopilotKit/OpenDots.git
cd OpenDots
npm ci
cp .env.example .env
npm run dev
```

개발 화면은 `http://127.0.0.1:5173`에서 열리고 API 서버는 4310 포트를 사용한다.[6]
모델 대화를 사용하려면 서버의 `.env`에 CopilotKit Intelligence 프로젝트 자격 증명과 모델 제공자 설정을 넣어야 한다.[6][11]
설정 전에도 Space와 페이지를 직접 다룰 수 있지만, 앱은 연결되지 않은 모델 응답을 흉내 내지 않고 설정 상태를 보여준다.[6]

Dot 컴퓨터 기능은 Docker Engine, Compose v2와 BuildKit을 이용한 추가 설정이 필요하다.[7][13]
컨테이너로 배포할 때는 `OWNER_TOKEN`과 `BROWSER_SECRET`에 서로 다른 24자 이상의 비밀값을 설정하고, 원격 접속에는 인증과 HTTPS를 구성하라고 안내한다.[6][12]

## 도입 전에 볼 점

페이지와 워크스페이스 메타데이터는 로컬 SQLite에 저장되고 대화 기록은 연결한 Intelligence 프로젝트에 보관된다.[6][11]
따라서 SQLite 파일만 복사해서는 대화 기록까지 백업되지 않으며 두 저장소를 따로 다뤄야 한다.[6]

`package.json` 버전은 `0.1.0`이고 README는 프로젝트를 Alpha로 표시한다.[2][8]
확인 시점의 GitHub Releases와 tags 목록은 비어 있다.[4][5]
README도 자동화 테스트의 서비스 fixture와 실제 연결 서비스 검증을 구분하며, 일부 통합은 아직 확인이 필요하다고 밝힌다.[2][14]
라이선스는 MIT다.[10]

보안 문서는 OpenDots를 단일 소유자용 초기 템플릿이자 보안 감사를 받은 자율 에이전트가 아닌 프로젝트로 설명한다.[2][9]
컴퓨터는 표준 Docker 격리라 호스트 커널을 공유하고, 허용된 셸은 컨테이너 내부에서 프로그램과 네트워크에 접근할 수 있다.[7]
기본 구성은 제한적인 네트워크 송신 정책을 제공한다고 주장하지 않는다.[7]
민감한 데이터나 시스템에 연결하기 전에는 권한 계정·네트워크 정책·승인 흐름을 별도로 설계하는 편이 안전하다.[7][9]

이 저장소의 빠른 시작 문서는 Node.js 24와 npm을 안내하지만, OS별 호스트 검증 표는 제시하지 않는다.[2][6]
여기서 macOS/Linux 분류는 로컬 Node 개발 환경 기준이며, Windows 전용 설치 경로를 공식 지원한다고 단정할 근거는 없다.[2][6]

## 내 판단

개인 또는 내부 프로토타입에서 “대화 → 검토 → 문서 저장” 흐름과 역할별 에이전트 컴퓨터를 조립해 보고 싶다면 흥미로운 출발점이다.[2]
반대로 설치 즉시 작동하는 호스팅 앱, 멀티유저 협업 제품, 보안 검증이 끝난 운영 에이전트를 기대하면 맞지 않는다.[2][9]
서비스 키 없이 Space와 페이지 흐름부터 살펴보고, 이후 격리된 개발 환경에서 모델·Intelligence를 연결한 뒤 파일·셸 권한은 꼭 필요한 Dot에만 켜는 접근을 권한다.[6][7][9]


## Sources

[1] https://github.com/CopilotKit/OpenDots

[2] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/README.md

[3] https://api.github.com/repos/CopilotKit/OpenDots

[4] https://api.github.com/repos/CopilotKit/OpenDots/releases

[5] https://api.github.com/repos/CopilotKit/OpenDots/tags

[6] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/docs/SETUP.md

[7] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/docs/COMPUTERS.md

[8] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/package.json

[9] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/SECURITY.md

[10] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/LICENSE

[11] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/.env.example

[12] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/compose.yml

[13] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/compose.computers.yml

[14] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/docs/demos/README.md

[15] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/docs/demos/chat-to-space-poster.jpg

[16] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/docs/demos/chat-to-space.mp4

[17] https://raw.githubusercontent.com/CopilotKit/OpenDots/main/docs/demos/computer-chat-poster.jpg
