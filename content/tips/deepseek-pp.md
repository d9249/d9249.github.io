---
title: "DeepSeek++는 DeepSeek 웹 채팅에 MCP·메모리·스킬·자동화를 붙이는 브라우저 확장이다"
date: "2026-05-29T14:22:58"
description: "DeepSeek++는 Chrome/Edge/Firefox용 확장으로 DeepSeek 웹 채팅에 도구 호출, MCP, 장기 메모리, 스킬, 자동화 작업, Shell/OfficeCLI 연동을 얹어 에이전트식 워크플로를 실험하게 해준다."
author: "Sangmin Lee"
repository: "zhu1090093659/deepseek-pp"
sourceUrl: "https://github.com/zhu1090093659/deepseek-pp"
status: "Source available"
license: "MIT (README only)"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "DeepSeek"
  - "Browser Extension"
  - "MCP"
  - "Agent Tools"
  - "Memory"
  - "Automation"
  - "OfficeCLI"
  - "TypeScript"
highlights:
  - "DeepSeek 웹판 위에서 도구 호출, MCP 도구 실행, 장기 메모리, `/skill` 프롬프트 전환, 자동화 작업을 한 확장 안에 묶는다."
  - "WXT + React + TypeScript 기반이며 v0.4.1 릴리스는 Chrome, Edge, Firefox용 zip과 sources zip을 제공한다."
  - "MCP는 Streamable HTTP, SSE, stdio bridge, Native Messaging 계열 연결을 다루며 서비스·도구별 자동/수동 실행 제어를 제공한다."
  - "Shell Native Host를 설치하면 로컬 명령과 OfficeCLI 문서 도구까지 연결할 수 있지만, 그만큼 로컬 파일·명령 실행 권한 경계를 엄격히 봐야 한다."
  - "README는 MIT를 표기하지만 GitHub API와 루트 파일 목록에는 별도 LICENSE 파일이 보이지 않아 재배포·상업 채택 전 라이선스 확인이 필요하다."
draft: false
---

DeepSeek++는 DeepSeek의 새 모델이나 별도 챗봇이 아니라, **DeepSeek 웹 채팅을 에이전트 실행 환경처럼 쓰게 만드는 브라우저 확장**이다. DeepSeek가 답변 중 도구 호출을 요청하면 확장이 이를 감지해 실행 결과를 다시 같은 대화로 돌려주고, MCP 도구·장기 메모리·스킬·시스템 프리셋·자동화 작업을 함께 얹는다.

내가 보기엔 이 프로젝트의 포인트는 “DeepSeek 웹판을 계속 쓰고 싶은데 Claude Code나 Codex처럼 도구 실행 루프가 있었으면 좋겠다”는 사람에게 있다. 독립 IDE나 터미널 에이전트를 새로 띄우는 대신, 이미 로그인한 DeepSeek 화면 위에 사이드패널과 실행 기록을 붙이는 접근이다.

![DeepSeek++ inline tool execution](https://raw.githubusercontent.com/zhu1090093659/deepseek-pp/main/assets/screenshot-inline-tools.svg)

## DeepSeek++ 개요

저장소 설명과 README 기준으로 DeepSeek++는 Chrome / Edge / Firefox용 확장이다. 구현은 WXT, React, TypeScript, Tailwind CSS, Dexie.js 조합이고, `package.json` 버전과 최신 GitHub Release는 조사 시점 기준 `0.4.1`이다. Release에는 브라우저별 zip 파일이 따로 올라와 있다.

기능 묶음은 꽤 넓다.

- DeepSeek 답변에서 도구 호출 요청을 감지해 자동 실행하고, 실행 결과를 접힌 블록 형태로 보여준다.
- MCP 서버를 등록하고 도구 목록을 새로고침하거나, 서비스·도구별로 자동 실행/수동 실행을 바꿀 수 있다.
- 장기 메모리를 브라우저 로컬 DB에 저장하고, 관련 기억을 다음 대화에 주입한다.
- `/skill` 입력으로 프롬프트 템플릿을 전환하고, 시스템 프리셋을 별도로 관리한다.
- 자동화 탭에서 즉시 실행 또는 cron/RRULE 기반 반복 작업을 만들 수 있다.
- Shell Native Host를 설치하면 로컬 명령 실행과 OfficeCLI 문서 도구까지 MCP 흐름에 연결할 수 있다.

즉 “MCP 클라이언트 하나”라기보다는 DeepSeek 웹판 위에 올리는 **개인용 에이전트 런타임 레이어**에 가깝다.

## 어디에 쓰기 좋은가

첫 번째 용도는 DeepSeek를 메인 웹 챗으로 쓰는 사람의 반복 작업 자동화다. 예를 들어 특정 MCP 서버를 붙여 검색·파일 처리·문서 검증 도구를 쓰고, 결과가 나오면 같은 DeepSeek 대화가 다음 단계를 이어가게 만들 수 있다. README는 이 흐름을 “Agent 식 지속 실행”으로 설명한다.

두 번째는 기억과 스킬 관리다. 매번 같은 역할 지시문을 복사해 넣는 대신 `/skill`로 전환하고, 장기 기억을 타입·태그·핀·접근 빈도 기준으로 관리한다. 완성도 높은 팀용 메모리 시스템이라기보다는, DeepSeek 웹판에 개인화 레이어를 빠르게 붙이는 쪽에 가깝다.

세 번째는 Office 문서 작업이다. v0.4.0부터 Shell MCP와 OfficeCLI 연동이 들어가서 DOCX, XLSX, PPTX 검사·조회·수정·검증 흐름을 DeepSeek 대화에서 호출하는 구성을 제안한다. 문서 편집 자동화에 관심이 있다면 이 부분이 가장 차별적이다.

![DeepSeek++ MCP side panel](https://raw.githubusercontent.com/zhu1090093659/deepseek-pp/main/assets/screenshot-sidepanel-mcp.svg)

## 설치와 첫 사용법

README의 기본 설치 경로는 소스 빌드다.

```bash
git clone https://github.com/zhu1090093659/deepseek-pp.git
cd deepseek-pp
npm install
npm run build
```

기본 `npm run build`는 Chrome MV3 산출물을 만든다. 브라우저별 빌드 명령은 다음처럼 분리되어 있다.

```bash
npm run build:chrome
npm run build:edge
npm run build:firefox
npm run build:all
```

빌드 후에는 Chrome은 `chrome://extensions/`, Edge는 `edge://extensions/`, Firefox는 `about:debugging#/runtime/this-firefox`에서 빌드된 확장 디렉터리 또는 manifest를 로드하는 흐름이다. GitHub Release에는 `deepseek-plus-plus-0.4.1-chrome.zip`, `edge.zip`, `firefox.zip`, `sources.zip`도 올라와 있으므로, 직접 빌드하지 않을 때는 릴리스 산출물을 먼저 확인할 수 있다.

Shell MCP host를 쓰려면 README가 다음 명령을 안내한다.

```bash
npm run shell:install -- --browser chrome --extension-id <확장ID>
```

이 명령은 Shell Native Host와 명령형 OfficeCLI 설치까지 같이 다룬다. 로컬 명령 실행 권한이 생기는 경로이므로, 처음부터 켜기보다는 확장의 기본 기능과 MCP 권한 모델을 이해한 뒤 필요한 경우에만 설치하는 편이 좋다.

## 주의할 점

가장 큰 경계는 권한이다. 이 확장은 DeepSeek 채팅 화면 안에서 동작하고, 브라우저 `storage`, `alarms`, `nativeMessaging`, Chromium 계열의 `sidePanel`, `chat.deepseek.com` host permission을 사용한다. `wxt.config.ts`에는 HTTP/HTTPS optional host permission도 잡혀 있어, 어떤 MCP/외부 도구를 붙이느냐에 따라 접근 범위가 커질 수 있다.

MCP와 Shell 연동은 특히 보수적으로 봐야 한다. 새 MCP 서비스는 편의를 위해 자동 실행 흐름과 연결될 수 있고, README는 서비스나 개별 도구 단위로 수동 전환할 수 있다고 설명한다. 파일 시스템, 셸, 문서 편집, 사내 API처럼 부작용이 큰 도구는 자동 실행보다 수동 승인 모드로 시작하는 편이 안전하다.

메모리와 도구 결과도 데이터 경계가 중요하다. 장기 메모리는 Dexie/IndexedDB 기반으로 브라우저 로컬에 저장되지만, 대화에 주입되면 DeepSeek 서버로 함께 전송될 수 있다. MCP 결과나 Office 문서 내용도 모델에게 넘기는 순간 외부 서비스 처리 범위에 들어간다. 개인 문서, 고객 데이터, API 키, 사내 경로가 섞이는 워크플로에서는 별도 테스트 프로필을 쓰는 편이 낫다.

라이선스도 한 번 더 확인해야 한다. README 하단은 MIT를 표기하지만, GitHub API는 license를 `null`로 반환했고 루트 목록에서도 별도 `LICENSE` 파일을 확인하지 못했다. 그래서 이 팁에서는 상태를 `Source available`, 라이선스를 `MIT (README only)`로 적었다. 개인 실험에는 큰 문제가 아닐 수 있지만, 재배포나 상업 채택 전에는 저장소 소유자가 명확한 LICENSE 파일을 추가했는지 다시 확인하는 편이 안전하다.

## 내 판단

DeepSeek++는 “DeepSeek 웹판을 버리지 않고 에이전트 도구 실행을 붙이고 싶은 사람”에게 꽤 흥미로운 실험이다. MCP, 메모리, 스킬, 자동화, Shell/OfficeCLI까지 한 번에 묶는 방향은 야심 차고, v0.4.x 릴리스에서 Chrome/Edge/Firefox 산출물을 꾸준히 내고 있다는 점도 긍정적이다.

반대로 팀 표준 도구로 바로 채택하기에는 아직 확인할 것이 많다. 확장 권한, Native Messaging, 자동 도구 실행, DeepSeek 대화로 주입되는 로컬 메모리와 문서 내용, README-only 라이선스 표기까지 모두 운영 리스크가 된다. 개인 실험은 추천하지만, 업무 데이터에 붙이기 전에는 별도 브라우저 프로필·테스트 MCP 서버·수동 실행 모드로 충분히 검증하는 편이 맞다.

## 참고한 공개 자료

- [zhu1090093659/deepseek-pp GitHub repository](https://github.com/zhu1090093659/deepseek-pp)
- [DeepSeek++ v0.4.1 release](https://github.com/zhu1090093659/deepseek-pp/releases/tag/v0.4.1)
- [WXT configuration in the repository](https://github.com/zhu1090093659/deepseek-pp/blob/main/wxt.config.ts)
- [Shell host installer script](https://github.com/zhu1090093659/deepseek-pp/blob/main/scripts/install-shell-host.mjs)
