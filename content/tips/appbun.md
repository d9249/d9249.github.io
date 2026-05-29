---
title: "appbun은 웹 앱을 읽을 수 있는 Electrobun 데스크톱 프로젝트로 바꿔주는 CLI다"
date: "2026-05-29T14:31:55"
description: "bigmacfive/appbun은 URL, localhost 앱, SaaS 대시보드를 소스가 보이는 Electrobun 프로젝트와 macOS DMG 패키징 흐름으로 scaffold하는 TypeScript CLI다."
author: "Sangmin Lee"
repository: "bigmacfive/appbun"
sourceUrl: "https://github.com/bigmacfive/appbun"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "CLI"
  - "Desktop App"
  - "Developer Tools"
  - "Bun"
  - "Electrobun"
highlights:
  - "웹 URL, built-in recipe, 실행 중인 localhost 앱을 일반 Electrobun 프로젝트로 생성한다."
  - "생성물은 appbun.generated.json, 아이콘, 로컬 webview shell, GitHub Actions release workflow, macOS/Windows/Linux native-runner 빌드 스크립트를 포함한다."
  - "npx, npm 전역 설치, Bun 전역 설치를 모두 지원하고 Bun이 있으면 Bun을 우선 사용한다."
  - "macOS DMG, signing, notarization 흐름이 준비되어 있지만 공개 배포에는 Apple 인증서와 notary 환경변수 관리가 필요하다."
  - "Codex skill, Claude Code CLAUDE.md, agent prompt 생성 기능이 있어 에이전트에게 웹 앱 패키징 작업을 맡기기 쉽다."
draft: false
---

`bigmacfive/appbun`은 웹사이트나 로컬 프론트엔드 앱을 데스크톱 앱처럼 포장하고 싶을 때 쓰는 CLI다. 핵심은 “웹 주소를 앱으로 감싸는 도구”에 그치지 않고, **읽고 고칠 수 있는 Electrobun 프로젝트**를 만들어준다는 점이다. 결과물에는 `appbun.generated.json`, 아이콘 자산, 로딩/에러 상태가 있는 webview shell, native-runner 빌드 스크립트, GitHub Actions release workflow가 같이 들어간다.

그래서 Pake류의 빠른 URL-to-app 데모와 비슷하게 시작하지만, 다음 날에도 소스 코드를 열어보고 CI에 넣고 패키징 경로를 고칠 수 있는 쪽에 더 가깝다. README와 npm 메타데이터 기준 최신 버전은 `0.10.4`, 라이선스는 MIT, 구현은 TypeScript이며 npm 패키지 `appbun`으로 배포된다.

![appbun 터미널 데모](/images/tips/appbun-terminal-demo.gif)

## appbun 개요

가장 단순한 흐름은 URL을 넘겨 데스크톱 wrapper 프로젝트를 만드는 것이다.

```bash
npx -y appbun@latest https://github.com --name "GitHub" --dmg
```

`appbun`은 target을 URL로 받을 수도 있고, `chatgpt`, `github`, `linear`, `notion`, `gmail`, `figma`, `youtube`, `excalidraw`, `squoosh` 같은 built-in recipe slug로 받을 수도 있다. `appbun dev`는 흔한 로컬 개발 포트(`3000`, `5173`, `8080` 등)를 찾아 실행 중인 localhost 앱을 scaffold한다.

```bash
cd your-web-app
npm run dev
npx -y appbun@latest dev --name "My App" --out-dir ../appbun-output/my-app --yes
cd ../appbun-output/my-app
npx -y appbun@latest doctor --project
npx -y appbun@latest package --install
```

생성된 프로젝트는 “닫힌 앱 바이너리”가 아니라 보통의 저장소처럼 다룰 수 있다. `src/mainview`에는 로컬 shell UI가, `src/bun/index.ts`에는 Electrobun 쪽 엔트리가, `electrobun.config.ts`에는 macOS/Windows/Linux 빌드 설정이 들어간다. `appbun.generated.json`에는 원본 URL, 앱 이름, bundle identifier, titlebar preset, package manager, icon source 같은 generator metadata가 남는다.

## 설치와 첫 사용법

공식 설치 경로는 npm/Bun이다. package metadata 기준 요구 런타임은 Node.js `>=20.0.0`, Bun `>=1.3.0`이다.

```bash
bun add -g appbun
```

```bash
npm install -g appbun
```

설치하지 않고 한 번만 실행하려면 `npx` 경로가 가장 가볍다.

```bash
npx -y appbun@latest chatgpt --dmg
```

Bun이 있으면 생성 프로젝트의 package manager로 Bun을 우선 사용하고, 없으면 npm으로 폴백할 수 있다. 필요하면 `--package-manager npm`처럼 명시하면 된다. 생성 전에 결과 설정을 보고 싶다면 `--show-config`, 기존 디렉터리 질문을 자동 수락하려면 `--yes`, 아이콘 수집을 끄려면 `--no-icon`을 쓴다.

## 패키징 흐름

appbun의 차별점은 생성 프로젝트 안에 바로 쓸 수 있는 빌드 스크립트를 넣어준다는 데 있다.

```bash
appbun package --install
appbun package --dmg
appbun package --dmg --sign
appbun package --notarize
```

macOS에서는 `build:dmg`가 stable build를 만든 뒤 `scripts/create-dmg.mjs`를 실행한다. 기본 DMG는 개인 사용이나 내부 확인용 unsigned DMG이고, 공개 배포에는 보통 Developer ID 서명과 notarization이 필요하다.

```bash
APPLE_SIGN_IDENTITY="Developer ID Application: Your Name (TEAMID)" \
appbun package --dmg --sign
```

```bash
APPLE_SIGN_IDENTITY="Developer ID Application: Your Name (TEAMID)" \
APPLE_ID="you@example.com" \
APPLE_TEAM_ID="TEAMID" \
APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx" \
appbun package --notarize
```

Windows와 Linux도 `build:windows`, `build:linux` 스크립트를 갖지만, README와 template script가 말하는 원칙은 “해당 플랫폼 native runner에서 빌드”다. 즉 macOS에서 Windows/Linux까지 한 번에 cross-compile해준다고 기대하면 안 된다. 특히 Linux native webview 빌드는 런타임 패키지와 배포 방식 이슈가 남을 수 있고, README의 기여 영역에도 Windows installer helper와 Linux packaging helper가 따로 적혀 있다.

![appbun showcase grid](/images/tips/appbun-showcase-grid.png)

## 에이전트 워크플로와 잘 맞는 지점

appbun은 CLI 자체에 에이전트용 경로를 넣어둔 점이 흥미롭다. `appbun prompt`는 다른 코딩 에이전트에게 붙여넣을 수 있는 웹 앱 패키징 지시문을 만들고, `appbun skill --install`은 bundled Codex skill을 `CODEX_HOME` 또는 `~/.codex` 아래에 설치한다. `appbun skill --install-claude --cwd .`는 현재 프로젝트에 `CLAUDE.md` 가이드를 만든다.

```bash
appbun skill --install
appbun skill --install-claude --cwd .
appbun prompt http://localhost:3000 --name "My App"
```

이 흐름은 “로컬 웹 앱을 실행해두고, 에이전트에게 데스크톱 wrapper 생성·진단·패키징까지 맡긴다”는 작업에 잘 맞는다. README에 포함된 bundled skill은 `appbun dev`, `appbun doctor --project`, `appbun package --install`, `appbun package --dmg` 같은 명령을 자연스럽게 쓰도록 설계되어 있다.

## 활용 포인트

- **내부 도구를 임시 데스크톱 앱으로 만들기**: 사내 dashboard, localhost admin UI, 반복해서 여는 SaaS 페이지를 독립 창으로 빼고 싶을 때 빠르다.
- **생성물을 리뷰 가능한 코드로 남기기**: `.app`이나 `.dmg`만 받는 방식보다, 원본 URL과 shell 코드가 저장소에 남으므로 팀원이 수정하거나 CI에서 재현하기 쉽다.
- **macOS 개인 배포를 빠르게 확인하기**: signing/notarization 전 단계의 unsigned DMG를 만들어 설치 흐름을 검토할 수 있다.
- **에이전트 자동화와 연결하기**: prompt/skill/CLAUDE.md 경로가 있어서 “웹 앱을 데스크톱 앱으로 포장해줘” 같은 반복 작업을 코딩 에이전트에게 넘기기 좋다.

## 주의할 점

- **아직 초기 프로젝트다.** GitHub 기준 2026년 3월에 만들어진 비교적 새 저장소이고, 최신 GitHub release는 `v0.10.4`다. npm 배포는 있지만 최신 release에는 완성 앱 바이너리 asset이 붙어 있지 않다. 도구 자체는 npm CLI로 쓰는 모델에 가깝다.
- **macOS DMG 자동화가 가장 구체적이다.** Windows/Linux native build script와 GitHub Actions matrix는 생성되지만, installer helper와 Linux packaging은 README의 high-value contribution 영역으로 남아 있다.
- **웹 앱 wrapper는 원본 서비스의 보안·약관 경계를 그대로 가져온다.** 로그인 필요한 SaaS, 관리자 콘솔, 사내 대시보드, OAuth/SSO 세션을 감싼다면 쿠키·토큰·데이터 표시 범위를 별도로 검토해야 한다.
- **Apple credential은 CI secret로 다뤄야 한다.** `APPLE_ID`, `APPLE_TEAM_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_SIGN_IDENTITY` 같은 값은 shell history, CI log, agent transcript에 노출되지 않게 관리해야 한다.
- **agent skill 설치는 instruction supply chain이다.** `appbun skill --install`은 `~/.codex/skills/appbun-web-desktop` 쪽을, `--install-claude`는 프로젝트의 `CLAUDE.md`를 바꿀 수 있다. 팀 repo에 넣기 전에는 생성된 지시문을 코드처럼 리뷰하는 편이 안전하다.

## 내 판단

appbun은 “웹사이트 하나를 당장 앱처럼 띄우기”보다 “그 앱 wrapper를 계속 다룰 수 있는 프로젝트로 남기기”에 가치가 있다. URL-to-desktop 도구를 쓰다가 생성물이 불투명해서 고치기 어려웠거나, 로컬 웹 앱을 내부용 데스크톱 앱으로 빠르게 포장해 검토해야 하는 개발자라면 써볼 만하다.

다만 공개 배포용 앱 제작 도구로 바로 믿기보다는, 먼저 작은 공개 URL이나 내부 데모 앱으로 `create → doctor → package` 흐름을 돌려보고, macOS 서명/노터라이즈와 Windows/Linux runner 전략을 별도로 정하는 쪽을 추천한다. npm CLI와 생성 프로젝트가 모두 소스로 열려 있다는 점은 장점이지만, 초기 도구인 만큼 배포 자동화의 책임은 아직 사용자 쪽에 많이 남아 있다.

## 참고한 공개 자료

- [bigmacfive/appbun GitHub repository](https://github.com/bigmacfive/appbun)
- [appbun npm package](https://www.npmjs.com/package/appbun)
- [appbun v0.10.4 release](https://github.com/bigmacfive/appbun/releases/tag/v0.10.4)
- [appbun showcase docs](https://github.com/bigmacfive/appbun/blob/main/docs/showcase/README.md)
- [Electrobun project](https://electrobun.dev)
