---
title: "OpenAI Codex Use Cases는 Codex를 어디까지 맡길지 가늠하게 해주는 공식 워크플로 카탈로그다"
date: "2026-05-31T14:29:11"
description: "OpenAI Developers의 Codex Use Cases는 inbox 관리, Mac Computer Use, PR 리뷰, 데이터 분석, 보안 점검, 네이티브 앱 개발 같은 Codex 업무 위임 예시를 카드와 starter prompt로 묶은 공식 문서형 카탈로그다."
author: "Sangmin Lee"
repository: "OpenAI Developers / Codex Use Cases"
sourceUrl: "https://developers.openai.com/codex/use-cases"
status: "Official documentation catalog"
license: "Proprietary documentation / Terms of Use"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Codex"
  - "AI Agents"
  - "Workflow"
  - "Automation"
  - "Developer Tools"
highlights:
  - "GeekNews가 소개한 원문은 OpenAI Developers의 Codex Use Cases 페이지이며, 조사 시점 공식 HTML에는 55개의 use-case 카드가 노출되어 있었다."
  - "Productivity & Collaboration, Web development, Native development, Production systems, Security 등 컬렉션과 category/workflow/team/task type 필터로 Codex 업무 후보를 고를 수 있다."
  - "각 상세 페이지는 난이도, 예상 소요 시간, starter prompt, 추천 skill/plugin, 관련 use case를 함께 제공해 팀용 프롬프트·런북 초안으로 옮기기 쉽다."
  - "Slack, Gmail, Calendar, Notion, GitHub, Linear, Zoom, 로컬 Mac 앱 같은 업무 도구를 전제로 한 예시가 많아 권한·데이터 경계를 먼저 정해야 한다."
  - "설치형 오픈소스 도구가 아니라 공식 문서/레퍼런스 카탈로그이므로, 실제 사용 가능 범위는 ChatGPT 플랜, 조직 설정, 연결한 Codex 통합에 좌우된다."
draft: false
---

Codex를 쓰다 보면 “코드를 고쳐줘” 말고 어디까지 맡겨도 되는지가 더 어려운 질문이 된다. PR 리뷰, 데이터 정리, 받은편지함 요약, Slack 액션 아이템 정리, iOS/macOS 앱 디버깅, 보안 스캔, 재무 모델링까지 한꺼번에 이야기하면 가능성과 과장이 섞이기 쉽다.

OpenAI Developers의 `Codex Use Cases`는 이 범위를 카드형 카탈로그로 정리한 공식 레퍼런스다. GeekNews 소개 글은 기존 12개에서 52개 유스케이스로 확장됐다고 요약했지만, 내가 직접 확인한 조사 시점의 공식 페이지 HTML에는 55개의 use-case 카드가 들어 있었다. 숫자는 계속 바뀔 수 있으니 “현재 Codex 문서가 제안하는 업무 위임 패턴 모음”으로 보는 것이 좋다.

![OpenAI Codex use cases](https://developers.openai.com/codex/open-graph.png)

## 무엇을 볼 수 있나

페이지의 첫 화면은 검색창과 추천 검색어, Featured use case, 컬렉션, 필터, 전체 카드 목록으로 구성된다. Featured에는 다음 세 가지가 먼저 나온다.

- `Manage your inbox` — 중요한 이메일을 찾고 사용자 목소리로 답장 초안을 쓰는 흐름
- `Use your computer with Codex` — `@Computer`로 Mac 앱을 클릭·입력·탐색하게 하는 흐름
- `Follow a goal` — 장기 목표를 스레드에 맡기고 반복적으로 진행시키는 흐름

그 아래 컬렉션은 `Productivity & Collaboration`, `Web development`, `Game development`, `Native development`, `Production systems`, `Security`로 나뉜다. 필터는 category, native platform, workflows, team, task type 단위로 걸 수 있어서 “엔지니어링 작업만”, “macOS/iOS 네이티브만”, “운영 자동화만”, “QA 팀에 맞는 것만”처럼 좁혀 볼 수 있다.

내가 흥미롭게 본 지점은 Codex가 더 이상 “코드 생성기”만으로 설명되지 않는다는 점이다. 공식 Codex 메인 문서는 Codex를 “One agent for everywhere you code”라고 소개하고, ChatGPT Plus, Pro, Business, Edu, Enterprise 플랜에 포함된다고 설명한다. 그런데 use case 카탈로그는 거기서 한발 더 나아가 실제 업무 도구와 산출물까지 묶는다. Slack thread에서 cloud coding task를 만들고, Gmail·Calendar·Notion을 보고 아침 브리핑을 만들고, Zoom 미팅을 후속 액션으로 바꾸고, PowerPoint 파일이나 spreadsheet까지 다루는 식이다.

## 카탈로그로서 유용한 부분

첫째, **프롬프트보다 작업 단위가 먼저 정리되어 있다.** 각 카드는 “무슨 일을 맡길 수 있는가”를 짧게 설명하고, 상세 페이지로 들어가면 난이도, 예상 시간, 추천 skill/plugin, starter prompt, 좋은 결과 예시, 관련 use case가 이어진다. 예를 들어 `Set up a teammate`는 Slack, Gmail, Google Calendar, Notion 같은 소스를 연결해 “무엇이 바뀌었고 무엇이 내 판단을 필요로 하는지”를 찾게 하는 장기 스레드 패턴으로 설명한다.

둘째, **Codex를 연결할 주변 도구가 드러난다.** 카탈로그 전반에 GitHub, Slack, Linear, Gmail, Calendar, Notion, Google Drive, Zoom, 로컬 파일, Mac 앱, PowerPoint, spreadsheet 같은 표면이 반복해서 등장한다. 팀에서 Codex 도입을 논의할 때 “우리에게 필요한 것은 모델 성능인가, 아니면 안전하게 읽고 쓰는 연결면인가?”를 분리해 보기 좋다.

셋째, **반복 업무를 skill/CLI/runbook으로 바꾸는 방향이 명확하다.** `Save workflows as skills`는 성공한 Codex 스레드, 리뷰 규칙, 테스트 명령, 릴리즈 체크리스트, 팀 runbook을 `SKILL.md` 같은 재사용 가능한 형태로 저장하는 흐름을 설명한다. `Create a CLI Codex can use`는 API, 로그, CSV export, SQLite DB, 사내 스크립트처럼 반복해서 만지는 대상을 agent-friendly CLI로 감싸는 패턴을 제안한다. 이 두 카드는 단순 팁을 넘어서 “에이전트에게 일을 잘 맡기기 위한 인프라”를 보여준다.

## 먼저 눌러볼 만한 카드

카탈로그가 길기 때문에 처음부터 55개를 모두 볼 필요는 없다. 나는 다음 순서가 가장 실용적이라고 본다.

1. `Understand large codebases` — 낯선 저장소의 request flow, 모듈 책임, 읽을 파일, 변경 후 테스트 후보를 뽑는 기본기다.
2. `Review GitHub pull requests` — 자동 리뷰를 붙일 때 AGENTS.md나 repo별 리뷰 기준을 어떻게 생각해야 하는지 감을 준다.
3. `Set up a teammate` — 여러 업무 도구를 연결한 “아침 스윕”이나 “변경 감지”의 기본 패턴이다.
4. `Use your computer with Codex` — 전용 plugin이 없는 Mac 앱 UI를 직접 조작하는 Computer Use의 장단점을 이해하는 데 좋다.
5. `Save workflows as skills`와 `Create a CLI Codex can use` — 한 번 성공한 작업을 다음 스레드에서 재사용 가능하게 만드는 운영 패턴이다.
6. `Run verified operations` — 자동화가 실제로 끝났는지 검증하고 보고하는 방식이 필요한 팀에 맞다.
7. `Run a deep security scan`, `Scan code changes for security`, `Remediate a vulnerability backlog` — “보안도 AI가 해준다”가 아니라, authorized code와 검토 가능한 evidence를 전제로 어떻게 다뤄야 하는지 확인하는 용도다.

![Codex Computer Use use case](https://developers.openai.com/codex/use-cases/use-your-computer-with-codex-featured.png)

## 팀에서 쓰는 방법

이 페이지를 가장 잘 쓰는 방식은 “우리 팀에 맞는 Codex 업무 후보 백로그”를 만드는 것이다.

- 먼저 현재 반복 업무를 `분석`, `코드`, `워크플로`, `테스트`, `디자인`, `데이터`로 나눈다.
- use case 카드에서 비슷한 예시를 5~10개만 고른다.
- 각 상세 페이지의 starter prompt를 그대로 쓰지 말고, 사내 도구명, 읽기 전용 범위, 승인 필요한 write action, 성공 기준을 추가한다.
- 반복될 작업은 AGENTS.md, Codex skill, 내부 runbook, 또는 작은 CLI로 승격한다.
- 첫 몇 번은 자동화보다 수동 실행으로 calibration한다. 유용했던 출력과 noise였던 항목을 기록한 뒤 schedule/automation을 건다.

특히 “피드백을 액션으로 바꾸기”, “회의를 follow-up으로 바꾸기”, “Slack action item 우선순위화” 같은 업무는 모델이 똑똑한지만으로는 성공하지 않는다. 원천 데이터에 접근할 권한, 중복/낡은 정보 처리 규칙, 사람이 검토할 중간 산출물 형식, 외부 전송 전 승인 단계가 같이 있어야 한다.

## 주의할 점

첫째, 이 페이지는 설치형 오픈소스 프로젝트가 아니라 OpenAI의 공식 문서형 카탈로그다. 따라서 `repository`와 `license`를 GitHub 라이브러리처럼 해석하면 안 된다. 공개 소스 라이선스가 붙은 도구라기보다, OpenAI Codex 제품을 어떻게 쓸지 보여주는 proprietary documentation에 가깝다.

둘째, 예시 상당수가 민감한 업무 데이터에 닿는다. Gmail, Slack, Calendar, Notion, GitHub, Linear, Zoom, Google Drive, 로컬 Mac 앱을 연결하면 이메일, 고객 피드백, 회의록, 코드, 토큰, 개인 메시지, 내부 의사결정이 Codex 컨텍스트로 들어갈 수 있다. 팀에서는 최소 권한, 읽기 전용 시작, 쓰기 작업 승인, 로그 보존 정책, 외부 공유 금지 범위를 먼저 정해야 한다.

셋째, Computer Use 계열은 특히 조심해야 한다. 공식 use case는 `@Computer`로 Mac 앱을 클릭하고 입력하는 흐름을 보여주지만, 같은 앱을 병렬로 조작하거나 잠금 화면·로그인 상태·브라우저 선택이 꼬이면 사람이 기대한 상태와 다른 화면에서 동작할 수 있다. 결제, 삭제, 메시지 전송, production 설정 변경처럼 되돌리기 어려운 행동은 명시적으로 중단 조건과 승인 단계를 둬야 한다.

넷째, 카탈로그의 숫자와 카드 구성은 빠르게 바뀔 수 있다. GeekNews 요약은 52개 확장을 말했고, 조사 시점 공식 페이지에서는 55개 카드가 확인됐다. Codex의 앱, IDE extension, CLI, Web, GitHub/Slack/Linear integration, Security 기능도 문서와 제품 릴리즈에 따라 계속 움직인다. 중요한 도입 판단은 항상 해당 상세 페이지와 현재 조직 설정에서 다시 확인하는 편이 안전하다.

## 내 판단

`Codex Use Cases`는 “Codex가 할 수 있다는 홍보 페이지”로만 보면 조금 과장돼 보일 수 있다. 하지만 팀에서 실제로는 어떤 업무를 맡길지 고르는 체크리스트로 보면 꽤 쓸 만하다. 특히 코드 작업과 지식 노동, 로컬 Computer Use, 통합 도구, reusable skill/CLI 사이의 경계를 한 화면에서 보여준다는 점이 좋다.

내 추천은 이 페이지를 그대로 따라 하기보다, **업무 후보를 고르는 레퍼런스 북**으로 쓰는 것이다. 각 use case를 보고 “우리도 해볼까?”가 아니라 “이 업무를 맡기려면 어떤 소스, 어떤 권한, 어떤 검증, 어떤 사람 승인, 어떤 반복 저장소가 필요한가?”를 적으면 더 실용적이다. Codex를 팀 동료처럼 쓰고 싶다면, 이 카탈로그는 기능 목록보다 onboarding checklist에 가깝게 읽는 편이 맞다.

## 참고한 공개 자료

- [GeekNews: Codex, 활용 사례 모음 대폭 확장](https://news.hada.io/topic?id=29847)
- [OpenAI Developers: Codex Use Cases](https://developers.openai.com/codex/use-cases)
- [OpenAI Developers: Codex](https://developers.openai.com/codex)
- [Set up a teammate](https://developers.openai.com/codex/use-cases/proactive-teammate)
- [Use your computer with Codex](https://developers.openai.com/codex/use-cases/use-your-computer-with-codex)
- [Save workflows as skills](https://developers.openai.com/codex/use-cases/reusable-codex-skills)
- [Create a CLI Codex can use](https://developers.openai.com/codex/use-cases/agent-friendly-clis)
