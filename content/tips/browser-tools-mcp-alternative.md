---
title: "browser-tools는 MCP 서버 대신 Bash로 쓰는 초경량 브라우저 에이전트 도구다"
date: "2026-05-26T00:12:18"
description: "badlogic/pi-skills의 browser-tools는 Chrome DevTools Protocol 스크립트를 에이전트에게 Bash 도구처럼 건네 브라우저 시작, 이동, DOM 실행, 스크린샷, 요소 선택, 쿠키 확인을 처리하게 해준다."
author: "Sangmin Lee"
repository: "badlogic/pi-skills/browser-tools"
sourceUrl: "https://github.com/badlogic/pi-skills/tree/main/browser-tools"
status: "Open source skill/tool catalog"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "AI Agents"
  - "Browser Automation"
  - "MCP"
  - "CLI"
  - "JavaScript"
  - "Chrome DevTools"
highlights:
  - "Mario Zechner의 글은 Playwright MCP 13.7k tokens, Chrome DevTools MCP 18.0k tokens 대신 225-token README와 작은 CLI 스크립트로 필요한 브라우저 작업만 노출하는 전략을 보여준다."
  - "현재 실사용 대상은 archived 된 `badlogic/browser-tools`가 아니라 `badlogic/pi-skills` 안의 `browser-tools` skill이며, Chrome DevTools Protocol과 Puppeteer 계열 스크립트로 동작한다."
  - "핵심 도구는 Chrome 시작, URL 이동, 페이지 컨텍스트 JavaScript 실행, 스크린샷이고, 현재 skill에는 element picker, cookie dump, readable content extraction도 포함되어 있다."
  - "현 `browser-start.js`는 macOS의 Google Chrome 경로와 Chrome profile 위치를 가정하므로 Windows/Linux 범용 브라우저 자동화 도구라고 소개하면 안 된다."
  - "`--profile`, remote debugging `:9222`, cookie 출력, arbitrary DOM eval은 강력하지만 로그인 세션·쿠키·민감 페이지를 에이전트에게 노출할 수 있어 신뢰한 프로젝트에서만 써야 한다."
draft: false
---

AI 에이전트에 브라우저 조작 능력을 붙일 때 가장 먼저 떠오르는 선택지는 Playwright MCP나 Chrome DevTools MCP 같은 서버다. 그런데 모든 작업에 그만큼 큰 도구 표면이 필요한 것은 아니다. Mario Zechner의 글과 이를 소개한 AI Sparkup 글은 “에이전트가 이미 Bash와 JavaScript를 잘 쓴다면, MCP 서버 대신 작은 CLI 스크립트를 읽히는 편이 더 단순할 수 있다”는 점을 브라우저 자동화 예제로 보여준다.

핵심은 기능을 없애자는 이야기가 아니다. 에이전트에게 매번 수십 개 MCP tool schema를 주입하는 대신, 실제로 자주 쓰는 브라우저 작업만 짧은 README와 실행 파일로 노출하자는 전략이다. 원 글의 비교 기준에서는 Playwright MCP가 약 13.7k tokens, Chrome DevTools MCP가 약 18.0k tokens를 차지하는 반면, 네 개의 브라우저 도구를 설명하는 README는 225 tokens 수준이라고 설명한다.

![MCP 대신 작은 browser tools를 쓰는 전략](/images/tips/browser-tools-mcp-alternative-header.png)

## 무엇을 담고 있나

조사 시점 기준으로 원래 글에서 링크한 `badlogic/browser-tools` 저장소는 archived 상태이고, README는 `badlogic/agent-tools`로 이동했다고 안내한다. 다시 `agent-tools` README는 현재 `badlogic/pi-skills`가 후속 위치라고 안내한다. 따라서 새로 살펴볼 대상은 `badlogic/pi-skills` 저장소의 `browser-tools` skill이다.

`pi-skills`는 Claude Code, Codex CLI, Amp, Droid, pi-coding-agent 같은 에이전트가 읽을 수 있는 `SKILL.md` 기반 카탈로그다. 그중 `browser-tools`는 Chrome DevTools Protocol에 붙는 Node.js/Puppeteer 계열 스크립트를 skill 안에 넣어둔 형태다. GitHub API 기준 저장소 `badlogic/pi-skills`는 MIT 라이선스이고, 별도 GitHub Releases나 tags는 아직 없다.

중요한 점은 이것이 “완성형 브라우저 자동화 앱”이라기보다 **에이전트에게 건네는 작은 도구 묶음**이라는 점이다. 에이전트는 MCP tool schema를 새로 배우는 대신, `SKILL.md`에 적힌 명령을 Bash로 실행하고 필요한 DOM 로직은 JavaScript로 직접 작성한다.

## 도구 표면

현재 `browser-tools/SKILL.md`와 스크립트 목록에서 확인되는 도구는 다음과 같다.

- `browser-start.js`: Chrome을 remote debugging port `9222`로 시작한다. `--profile`을 붙이면 기본 Chrome profile을 `~/.cache/browser-tools`로 복사해 로그인 상태를 재사용한다.
- `browser-nav.js`: 현재 탭 또는 새 탭으로 URL을 연다.
- `browser-eval.js`: 활성 탭의 page context에서 JavaScript를 실행한다. DOM 추출, 버튼 클릭, 폼 조작, 상태 확인을 모델이 직접 JS로 작성할 수 있다.
- `browser-screenshot.js`: 현재 viewport를 이미지로 저장하고 파일 경로를 반환한다.
- `browser-pick.js`: 사용자가 화면에서 DOM 요소를 직접 클릭해 선택하면 selector/element 정보를 돌려주는 interactive picker다.
- `browser-cookies.js`: 현재 탭의 cookie 이름, 값, domain, path, `httpOnly`, `secure` 정보를 출력한다.
- `browser-content.js`: 페이지를 열고 Mozilla Readability와 Turndown으로 readable content를 Markdown으로 추출한다.

원 글은 4개 core tool에서 시작해 `pick.js`, `cookies.js` 같은 특수 도구를 즉석에서 추가하는 흐름을 강조한다. 현재 `pi-skills` 버전은 그 아이디어가 skill catalog 형태로 정리된 것에 가깝다.

## 왜 유용한가

이 접근법이 유용한 이유는 도구의 “표준성”보다 **컨텍스트 효율과 조합성**이 중요한 작업이 있기 때문이다.

MCP 서버는 클라이언트가 tool 설명과 JSON schema를 컨텍스트에 주입한다. 범용 서버는 많은 기능을 제공하는 대신, 지금 당장 필요 없는 설명까지 모델이 함께 읽는다. 반면 이 방식은 에이전트에게 짧은 README/SKILL만 읽히고, 나머지는 이미 모델이 아는 Bash, 파일, JavaScript, DOM API에 맡긴다.

또 하나의 차이는 출력 경로다. MCP tool output은 보통 에이전트 컨텍스트를 거쳐야 다음 단계로 넘어간다. CLI 스크립트는 stdout, 파일, pipe, 임시 이미지 경로를 그대로 쓸 수 있으므로 큰 HTML, cookie dump, scraper 결과를 파일로 저장한 뒤 필요한 부분만 다시 읽게 만들기 쉽다.

![브라우저 도구 실험의 token tally 예시](/images/tips/browser-tools-mcp-alternative-tokens.png)

## 설치와 첫 사용 흐름

`pi-skills` README는 에이전트별 설치 위치를 나눠 안내한다. 예를 들어 Codex CLI에서는 다음처럼 skill catalog를 복제한다.

```bash
git clone https://github.com/badlogic/pi-skills ~/.codex/skills/pi-skills
```

Claude Code는 한 단계 아래의 `SKILL.md`만 찾는 구조라, 저장소를 별도 위치에 clone한 뒤 개별 skill을 symlink하는 흐름을 제안한다.

```bash
git clone https://github.com/badlogic/pi-skills ~/pi-skills
mkdir -p ~/.claude/skills
ln -s ~/pi-skills/browser-tools ~/.claude/skills/browser-tools
```

`browser-tools` 자체의 요구 사항은 Chrome과 Node.js다. skill README는 최초 사용 전에 skill 디렉터리에서 의존성을 설치하라고 안내한다.

```bash
cd ~/pi-skills/browser-tools
npm install
```

그 뒤 에이전트가 skill을 읽으면 대략 다음 같은 명령을 쓰게 된다.

```bash
# fresh profile
~/pi-skills/browser-tools/browser-start.js

# 로그인 세션을 복사한 profile 사용
~/pi-skills/browser-tools/browser-start.js --profile

# URL 열기
~/pi-skills/browser-tools/browser-nav.js https://example.com --new

# DOM 상태 읽기
~/pi-skills/browser-tools/browser-eval.js 'document.title'
~/pi-skills/browser-tools/browser-eval.js 'document.querySelectorAll("a").length'
```

단, 현재 `browser-start.js`는 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`과 `~/Library/Application Support/Google/Chrome/` 같은 macOS 경로를 직접 사용한다. 따라서 이 항목은 사이트 분류상 `macOS / Linux` bucket에 넣지만, 실제 구현은 **macOS Chrome 중심**으로 이해하는 편이 안전하다. Linux나 Windows에서 그대로 동작한다고 가정하면 안 된다.

## 활용 포인트

가장 잘 맞는 용도는 “에이전트와 함께 웹 페이지를 관찰하고, 필요한 DOM 조작만 빠르게 자동화하는 작업”이다.

예를 들어 프론트엔드 개발 중에는 에이전트가 현재 페이지를 열고, 버튼/폼 상태를 DOM으로 읽고, 특정 사용자 흐름을 JS로 실행하고, 마지막 화면만 screenshot으로 확인하게 만들 수 있다. 스크래핑 실험에서는 `browser-pick.js`로 사람이 실제 화면에서 목록 item이나 버튼을 찍어주고, 에이전트가 그 selector 정보를 바탕으로 deterministic scraper를 작성하는 흐름이 가능하다.

내가 보기에 이 방식의 핵심은 “MCP를 쓰지 말자”가 아니라 **큰 MCP 서버를 기본값으로 켜기 전에, 작은 CLI harness로도 충분한지 먼저 따져보자**에 가깝다. 브라우저뿐 아니라 로그 분석, 파일 변환, 내부 API smoke test, 반복적인 QA 플로우도 비슷한 방식으로 짧은 README와 작은 스크립트 묶음으로 만들 수 있다.

## 주의할 점

강력한 만큼 보안 경계는 분명히 해야 한다.

첫째, `--profile`은 편하지만 민감하다. 기본 Chrome profile을 `~/.cache/browser-tools`로 복사하면 로그인 쿠키와 세션이 도구가 조작하는 브라우저로 들어간다. 내부 admin, 결제, 고객 데이터가 열린 상태에서 에이전트가 DOM eval을 실행하도록 두면 의도보다 넓은 권한을 줄 수 있다.

둘째, Chrome remote debugging port `9222`는 로컬 브라우저 제어면이다. 보통 localhost 용도로 쓰이지만, 실행 환경·방화벽·터널 설정에 따라 노출 범위가 달라질 수 있다. 신뢰하지 않는 네트워크나 공유 머신에서는 켜둔 채 방치하지 않는 편이 좋다.

셋째, `browser-cookies.js`는 cookie 값을 그대로 출력한다. `httpOnly` cookie까지 디버깅할 수 있다는 장점은 곧 토큰·세션 유출 위험이기도 하다. 공개 이슈, 블로그, PR 로그, agent transcript에 cookie dump가 남지 않게 해야 한다.

넷째, 외부 skill catalog를 설치한다는 것은 에이전트가 읽고 따를 instruction surface를 늘리는 일이다. `pi-skills`는 MIT 오픈소스이지만, 팀에서 재현성을 원한다면 floating `main`을 그대로 쓰기보다 검토한 commit으로 pinning하거나 내부 fork로 관리하는 편이 안전하다. 현재 저장소에는 공식 release/tag가 없으므로 이 점이 더 중요하다.

## 내 판단

`browser-tools`는 MCP 생태계를 대체하는 표준이라기보다, 에이전트 도구 설계의 좋은 반례다. 에이전트가 이미 Bash와 JavaScript를 잘 다룬다면, 모든 기능을 MCP 서버로 포장하지 않아도 된다. 작은 실행 파일과 짧은 사용법만으로 더 적은 컨텍스트, 더 쉬운 수정, 더 좋은 파일 기반 조합성을 얻을 수 있다.

다만 이 항목을 “누구나 바로 설치할 범용 브라우저 자동화 패키지”로 추천하기보다는, **macOS에서 Chrome을 직접 띄워 에이전트와 함께 프론트엔드 QA나 스크래핑 실험을 하는 개발자**에게 맞는 패턴으로 보는 편이 정확하다. 이미 Playwright MCP나 Chrome DevTools MCP가 너무 무겁게 느껴졌고, 자신만의 agent-tool 폴더를 관리할 의지가 있다면 한 번 살펴볼 만하다. 반대로 권한 경계가 엄격한 회사 환경이나 재현 가능한 CI 브라우저 테스트가 목적이라면, 정식 Playwright 테스트나 더 엄격한 MCP/runner 구성이 낫다.

## 참고한 공개 자료

- [AI Sparkup: MCP 서버 없이 AI 에이전트 도구 만들기](https://aisparkup.com/posts/6640)
- [Mario Zechner: What if you don’t need MCP at all?](https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp/)
- [badlogic/pi-skills GitHub repository](https://github.com/badlogic/pi-skills)
- [badlogic/pi-skills browser-tools skill](https://github.com/badlogic/pi-skills/tree/main/browser-tools)
- [archived badlogic/browser-tools repository](https://github.com/badlogic/browser-tools)
- [archived badlogic/agent-tools repository](https://github.com/badlogic/agent-tools)
