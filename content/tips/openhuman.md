---
title: "OpenHuman은 로컬 Memory Tree를 중심으로 개인 AI 비서를 데스크톱 앱으로 묶는다"
date: "2026-05-27T20:16:21"
description: "tinyhumansai/openhuman은 Rust·Tauri 기반 데스크톱 앱과 openhuman-core를 통해 로컬 Memory Tree, Obsidian형 wiki, 118+ 통합, 모델 라우팅, 음성·도구 실행을 한 개인 AI 비서 흐름으로 묶는 GPL-3.0 오픈소스 베타입니다."
author: "Sangmin Lee"
repository: "tinyhumansai/openhuman"
sourceUrl: "https://github.com/tinyhumansai/openhuman"
status: "Open source beta"
license: "GPL-3.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Personal AI"
  - "Desktop App"
  - "Memory"
  - "Tauri"
  - "Rust"
highlights:
  - "Memory Tree SQLite와 Obsidian형 Markdown vault를 로컬 workspace에 두고, Gmail·Slack·GitHub·Notion 같은 연결 소스를 20분 주기로 요약·동기화하는 방향이다."
  - "기본 경험은 sign-in, 모델 라우팅, 웹 검색 프록시, Composio 기반 OAuth/통합 호출에 OpenHuman 관리형 backend를 사용하므로 ‘완전 오프라인 앱’은 아니다."
  - "GitHub 최신 stable Release는 v0.54.0이고 macOS DMG/app tarball, Linux AppImage/deb/core tarball, Windows EXE/MSI 자산을 제공한다. main 소스와 staging 태그는 더 앞서갈 수 있다."
  - "Tauri 설정 기준 desktop bundle은 macOS·Linux·Windows를 겨냥하고, 모바일 Tauri 설정은 iOS/Android 개발 경로를 보이지만 stable Release 표면은 데스크톱 중심이다."
  - "OAuth 연결, OS Keychain/Credential Manager/Secret Service, Accessibility·Input Monitoring·Camera·Microphone, remote core bearer token처럼 권한·데이터 경계를 먼저 읽고 켜야 한다."
draft: false
---

OpenHuman은 “개인 AI 비서를 쓰고 싶지만 터미널과 설정 파일부터 만지고 싶지는 않은” 사용자 쪽으로 기울어진 프로젝트다. 저장소 설명은 “Personal AI super intelligence”라고 강하게 말하지만, 실제로 확인할 핵심은 **로컬 Memory Tree + 데스크톱 앱 + 관리형 통합 backend**의 조합이다.

일반적인 에이전트 CLI가 “이번 대화에서 파일을 읽고 명령을 실행한다”에 가깝다면, OpenHuman은 사용자의 이메일·문서·채팅·저장소 같은 생활/업무 데이터를 계속 가져와 로컬 지식 베이스로 정리하고, 데스크톱 mascot/voice/chat UI에서 바로 물어보게 만드는 흐름을 노린다. README와 GitBook 문서 기준 아직 **Early Beta**이므로, 안정된 기업용 비서라기보다는 빠르게 커지는 개인 AI 런타임으로 보는 편이 맞다.

조사 시점 기준 GitHub 저장소 `tinyhumansai/openhuman`은 Rust가 주 언어로 잡히며, checked-in `LICENSE`와 GitHub API 모두 GPL 계열로 식별된다. 최신 stable GitHub Release는 `v0.54.0`이고, 소스 `main`의 `Cargo.toml`·Tauri 설정은 `0.54.22`까지 앞서 있어 release, staging tag, source version을 구분해서 봐야 한다.

![OpenHuman desktop demo](/images/tips/openhuman-demo.png)

## OpenHuman 개요

OpenHuman의 중심에는 Rust로 작성된 `openhuman-core`와 Tauri 데스크톱 앱이 있다. 데스크톱 앱은 사용자가 보는 UI, voice/microphone, mascot, OS 권한, local workspace 설정을 담당하고, core는 memory ingest, tools, model/provider routing, integration state, RPC를 맡는다.

README와 문서가 반복해서 강조하는 구성 요소는 다음이다.

- **Memory Tree**: connected source를 canonical Markdown으로 바꾸고, 3k token 이하 chunk로 나눈 뒤 SQLite와 summary tree에 저장한다.
- **Obsidian형 wiki**: 같은 memory chunk가 `<workspace>/wiki/` 아래 Markdown vault로 떨어져 사람이 열어보고 수정할 수 있다.
- **118+ 통합**: Gmail, Notion, GitHub, Slack, Stripe, Calendar, Drive, Linear, Jira 등은 Composio 기반 connector layer를 통해 OAuth로 연결된다.
- **Auto-fetch**: active connection을 20분 단위 scheduler가 훑어 새 데이터를 Memory Tree에 접어 넣는다.
- **모델 라우팅**: `hint:reasoning`, `hint:fast`, `hint:vision`, `hint:summarize` 같은 hint를 provider/model로 매핑한다.
- **도구와 음성**: web search, web fetch, filesystem/git/lint/test 계열 coder tool, browser/computer control, cron, subagent, STT/TTS, Google Meet agent까지 포함하려는 방향이다.

이런 조합 때문에 OpenHuman은 단순한 챗봇 앱보다 “내 활동을 계속 읽고 요약하는 개인 context layer”에 가깝다. 반대로 말하면 설치 후 연결하는 계정, 권한, backend 경계가 결과 품질과 보안성을 크게 좌우한다.

## Memory Tree가 핵심인 이유

OpenHuman 문서는 기존 vector database식 memory를 “비슷한 chunk 검색”에 치우친 구조로 보고, summary tree를 별도로 둔다. source adapter가 가져온 이메일·채팅·문서가 canonical Markdown으로 변환되고, deterministic chunk ID와 provenance metadata를 붙인 뒤, source tree/topic tree/global tree로 요약된다.

![OpenHuman Memory Tree concept](/images/tips/openhuman-memory-tree.png)

사용자 입장에서 좋은 점은 두 가지다. 첫째, memory가 opaque SaaS 내부에만 갇히지 않고 `memory_tree/chunks.db`와 `wiki/` vault로 로컬에 남는다. 둘째, Obsidian으로 열 수 있는 Markdown vault가 있으므로 “AI가 나에 대해 무엇을 기억하고 있는지”를 사람이 읽고 수정할 여지가 있다.

다만 “로컬 memory”라는 표현을 “모든 처리가 로컬”로 오해하면 안 된다. 문서는 기본 설정에서 sign-in, 모델 라우팅, 웹 검색 프록시, 관리형 integration OAuth/tool call을 OpenHuman backend가 처리한다고 명시한다. embeddings나 summary-tree building도 local AI를 켜지 않으면 backend/LLM 경로를 탈 수 있다. 민감한 조직 데이터라면 local AI, direct Composio, backend URL, workspace 위치를 먼저 검토해야 한다.

## 설치와 첫 사용법

공식 README는 웹사이트 또는 GitHub Release에서 installer를 받거나, OS별 package manager 경로를 우선하라고 안내한다. macOS Homebrew 경로는 다음과 같다.

```bash
brew tap tinyhumansai/core
brew install openhuman
```

Debian/Ubuntu는 signed apt repo를 추가하는 방식이다.

```bash
sudo apt-get install -y --no-install-recommends gnupg2 curl ca-certificates
curl -fsSL https://tinyhumansai.github.io/openhuman/apt/KEY.gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/openhuman.gpg

echo "deb [signed-by=/etc/apt/keyrings/openhuman.gpg arch=amd64] \
  https://tinyhumansai.github.io/openhuman/apt stable main" \
  | sudo tee /etc/apt/sources.list.d/openhuman.list

sudo apt-get update
sudo apt-get install -y openhuman
```

Windows는 최신 Release의 signed `.msi`를 받는 경로가 README에 적혀 있다. stable Release `v0.54.0`에는 macOS `dmg`와 app tarball, Linux `AppImage`·`.deb`·`openhuman-core` tarball, Windows setup EXE/MSI가 올라와 있고, Tauri updater용 `latest.json`도 함께 배포된다.

주의할 점은 distribution 표면이 빠르게 움직인다는 것이다. 예를 들어 Homebrew tap formula는 조사 시점에 `v0.52.27` source tarball을 가리키고 있었고, GitHub latest stable은 `v0.54.0`, main branch와 staging tag는 `v0.54.22` 계열이었다. 설치 후에는 `openhuman --version` 또는 앱의 updater 표면에서 실제 버전을 확인하는 편이 안전하다.

source build는 훨씬 무겁다. 저장소는 `pnpm@10.10.0`, Node 24+, Rust 1.93.0, Tauri/CEF 관련 submodule과 platform별 desktop build prerequisite을 요구한다. 기여 목적이 아니라면 installer/package 경로가 낫다.

## 어디에 쓰기 좋은가

OpenHuman을 가장 흥미롭게 볼 만한 사람은 “내 개인/업무 데이터 위에 계속 살아 있는 AI context layer”를 원하는 사용자다.

예를 들어 이런 흐름이다.

1. 데스크톱 앱에서 sign in한다.
2. Gmail, Calendar, Notion, GitHub, Slack 같은 source를 OAuth로 연결한다.
3. 첫 auto-fetch tick 또는 수동 ingest로 Memory Tree를 채운다.
4. Memory tab에서 Obsidian vault를 열어 요약과 provenance를 확인한다.
5. Human 화면에서 voice/chat으로 “지난 12시간 동안 내가 봐야 할 것”, “이번 주 결정사항”, “최근 GitHub/메일에서 기다리는 일”을 묻는다.

이 방향은 일반 생산성 앱보다 강력하지만, “읽는 범위”가 곧 가치이자 위험이다. 이메일·캘린더·문서·repo·채팅을 많이 연결할수록 답변은 좋아지지만, OAuth scope, sync interval, local storage, backend proxy, LLM routing 정책도 함께 커진다.

## 플랫폼과 앱 구조

Tauri desktop config는 bundle target으로 macOS app/dmg, Linux deb/AppImage, Windows nsis/msi를 명시한다. minimum macOS version은 Tauri 설정 기준 `10.15`로 표시되어 있고, Linux deb dependency에는 GTK/WebKit/X11 계열 패키지가 들어간다. GitHub Release assets도 macOS, Linux, Windows 데스크톱을 중심으로 맞춰져 있다.

모바일 흔적도 있다. `app/src-tauri-mobile/tauri.conf.json`에는 iOS minimum `16.0`, Android `minSdkVersion 24`가 보이고, `package.json`에는 `tauri:ios:*`, `tauri:android:*` script가 있다. 하지만 공개 stable Release에서 사용자가 바로 설치할 수 있는 중심 표면은 데스크톱 앱과 `openhuman-core`다. 모바일은 문서와 release 상태를 따로 확인하며 실험하는 쪽으로 보는 편이 맞다.

원격/클라우드 운영도 가능하지만 여기에는 별도 주의가 필요하다. 문서상 remote deployment의 기본은 “core remote, UI local”이다. `openhuman-core serve`는 기본적으로 port `7788`에서 JSON-RPC를 제공하고, remote/dockerized deploy에서는 `OPENHUMAN_CORE_TOKEN`을 반드시 설정하라고 안내한다. 공용 인터넷에 UI/RPC를 노출하려면 TLS, CORS allowlist, bearer token 관리, persistent workspace를 따로 설계해야 한다.

## 보안과 개인정보 caveat

OpenHuman은 개인 데이터를 많이 다루는 도구라서, 기능보다 먼저 경계를 이해해야 한다.

- **로컬에 남는 것**: Memory Tree SQLite database, Obsidian Markdown vault, workspace config, local runtime state는 기본적으로 사용자 머신에 있다.
- **관리형 backend가 맡는 것**: 기본 설정에서는 sign-in, LLM call proxy/model routing, web search proxy, integration OAuth와 tool proxy가 OpenHuman backend를 지난다.
- **OAuth token 위치**: 관리형 integration에서는 third-party OAuth token을 local disk plaintext로 쓰지 않고 backend가 brokering한다. direct mode를 쓰면 Composio API key, webhook, billing/rate limit 책임이 사용자 쪽으로 온다.
- **로컬 secret 저장**: desktop build는 macOS Keychain, Windows Credential Manager, Linux Secret Service/libsecret을 root secret store로 사용하고, file에는 ciphertext를 두는 모델을 설명한다.
- **OS 권한**: macOS Accessibility, voice hotkey용 Input Monitoring, Meeting Agent용 Camera/Microphone 같은 permission prompt가 뜰 수 있다.
- **agent 도구 권한**: filesystem/git/lint/test/browser/computer control은 편리하지만 workspace와 승인 정책을 확인해야 한다. remote core bearer token을 가진 caller는 core를 움직일 수 있다는 점도 중요하다.

GPL-3.0 라이선스도 adoption check에 포함해야 한다. 개인 사용·실험에는 큰 장벽이 아니지만, 수정 배포나 제품에 끼워 넣는 방식이라면 copyleft 조건을 검토해야 한다.

## 내 판단

OpenHuman은 “AI agent를 쓰는 법”을 개발자 CLI에서 데스크톱 소비자 경험으로 끌어오려는 프로젝트다. 특히 Memory Tree와 Obsidian형 vault를 중심에 둔 점은 좋다. AI 비서가 내 이메일·문서·저장소를 읽고 요약한다면, 최소한 그 memory가 어디에 있고 사람이 열람할 수 있는지가 중요하기 때문이다.

반면 아직 Early Beta이고, 기본값이 완전 self-hosted/offline인 제품도 아니다. 관리형 backend, Composio OAuth, model routing, web search proxy, local AI 옵션이 섞여 있으므로 “개인정보가 로컬에만 있다”는 단일 문장으로 이해하면 위험하다. 처음 써볼 때는 Gmail 하나, 작은 Obsidian vault 하나처럼 범위를 좁혀 시작하고, 자동 동기화 결과와 권한 로그를 보며 연결 범위를 늘리는 접근을 추천한다.

이미 OpenClaw나 Hermes Agent처럼 gateway/agent runtime류 도구를 만져본 사람에게는 비교 포인트가 분명하다. OpenHuman은 채널·스킬을 직접 조립하는 느낌보다 **UI-first onboarding과 memory ingestion**에 더 무게를 둔다. 터미널이 부담스러운 사용자에게 개인 AI 비서를 보여주려면 확인해볼 만하고, 운영자가 세부 권한을 끝까지 통제해야 하는 환경이라면 direct/local/self-host 옵션이 실제 요구사항을 만족하는지 먼저 검증해야 한다.

## 참고한 공개 자료

- [tinyhumansai/openhuman GitHub repository](https://github.com/tinyhumansai/openhuman)
- [OpenHuman official website](https://tinyhumans.ai/openhuman)
- [OpenHuman GitBook documentation](https://tinyhumans.gitbook.io/openhuman/)
- [OpenHuman Getting Started](https://tinyhumans.gitbook.io/openhuman/overview/getting-started)
- [OpenHuman Privacy & Security](https://tinyhumans.gitbook.io/openhuman/features/privacy-and-security)
- [OpenHuman Memory Trees](https://tinyhumans.gitbook.io/openhuman/features/obsidian-wiki/memory-tree)
- [OpenHuman Third-party Integrations](https://tinyhumans.gitbook.io/openhuman/features/integrations)
- [OpenHuman v0.54.0 Release](https://github.com/tinyhumansai/openhuman/releases/tag/v0.54.0)
