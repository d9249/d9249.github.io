---
title: "CLI-Anything은 GUI 소프트웨어를 에이전트용 CLI로 바꾸려는 허브이자 생성기다"
date: "2026-05-25T14:45:02"
description: "HKUDS/CLI-Anything은 기존 GUI 앱·개발 도구·SaaS를 AI 에이전트가 다루기 쉬운 CLI와 SKILL.md로 감싸려는 Python 기반 CLI 허브/생성기 프로젝트입니다."
author: "Sangmin Lee"
repository: "HKUDS/CLI-Anything"
sourceUrl: "https://github.com/HKUDS/CLI-Anything"
status: "Open source beta"
license: "Apache-2.0 / MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "CLI"
  - "Developer Tools"
  - "Python"
  - "Automation"
  - "Agent-Native Software"
highlights:
  - "`pip install cli-anything-hub`로 CLI-Hub를 설치한 뒤 `cli-hub list/search/info/install`로 에이전트용 CLI harness를 탐색한다."
  - "Claude Code plugin, Codex/OpenClaw/Nanobot 계열 SKILL 흐름, `SKILL.md` catalog를 함께 제공해 에이전트가 도구를 발견하고 쓰는 경로를 만든다."
  - "핵심 생성 흐름은 codebase analysis → CLI design → implementation → test planning/implementation → docs/SKILL.md → packaging으로 이어지는 7단계 pipeline이다."
  - "각 harness는 REPL, one-shot subcommand, `--json` 출력, undo/redo, 실제 앱 backend 호출을 목표로 한다."
  - "아직 v0.3.0·베타 성격이 강하고, telemetry opt-out·registry install 명령·대상 앱 권한/계정/파일 쓰기 범위를 확인해야 한다."
draft: false
---

AI 에이전트가 터미널에서는 강하지만 GUI 앱 앞에서는 갑자기 약해지는 순간이 있다. Blender, GIMP, LibreOffice, OBS, Audacity처럼 기능은 강력하지만 에이전트가 안정적으로 조작하기 어려운 도구가 대표적이다. 화면을 보고 클릭하는 방식은 깨지기 쉽고, 앱마다 API가 흩어져 있으면 에이전트가 매번 새로운 조작법을 배워야 한다.

`CLI-Anything`은 이 문제를 “모든 소프트웨어를 CLI-first로 다시 만들자”가 아니라, **기존 소프트웨어 위에 에이전트가 읽고 실행하기 쉬운 command interface를 얹자**는 방향으로 접근한다. 저장소는 두 층으로 나뉜다. 하나는 이미 만들어진 harness를 찾아 설치하는 `cli-hub`, 다른 하나는 새 소프트웨어나 코드베이스를 분석해 CLI harness와 `SKILL.md`를 생성하는 agent plugin/skill 흐름이다.

조사 시점 기준 GitHub 저장소 `HKUDS/CLI-Anything`은 Python 중심의 공개 저장소이며, GitHub API와 checked-in `LICENSE`는 Apache License 2.0으로 확인된다. 다만 PyPI 패키지 `cli-anything-hub`와 `cli-hub/setup.py`는 MIT로 표시되어 있어, “루트 프로젝트”와 “허브 패키지”의 라이선스를 구분해서 보는 편이 안전하다. 최신 GitHub Release와 PyPI 패키지는 모두 `0.3.0` 계열이며, PyPI classifier도 `Development Status :: 4 - Beta`다.

![CLI-Anything teaser](/images/tips/cli-anything-teaser.webp)

## CLI-Anything 개요

CLI-Anything을 한 문장으로 줄이면 **AI 에이전트용 CLI 생태계를 만들려는 허브 + harness generator**다.

가장 빠른 시작점은 CLI-Hub다.

```bash
pip install cli-anything-hub

cli-hub list
cli-hub search image
cli-hub info gimp
cli-hub install gimp
cli-hub launch gimp
```

`cli-hub`는 registry를 받아와 사용 가능한 CLI를 보여주고, 선택한 항목을 `pip`, `npm`, `uv`, Homebrew/installer command 등 해당 항목의 설치 전략에 맞게 설치한다. README와 `cli-hub` 문서 기준으로 GIMP, Blender, Inkscape, LibreOffice, Audacity, OBS Studio 같은 GUI/creative 도구뿐 아니라 Exa, WireMock, AdGuard Home, Zoom, NotebookLM, Ollama 등 여러 category의 harness와 public CLI를 다루려는 구조다.

두 번째 시작점은 “없는 CLI를 새로 만들기”다. Claude Code 쪽은 marketplace plugin으로 설치하는 흐름을 제공한다.

```text
/plugin marketplace add HKUDS/CLI-Anything
/plugin install cli-anything

/cli-anything <software-path-or-repo>
```

SKILL-compatible agent 쪽은 meta-skill로 CLI-Hub를 붙이는 흐름도 있다.

```bash
npx skills add HKUDS/CLI-Anything --skill cli-hub-meta-skill -g -y
```

README는 OpenClaw, Nanobot, Claude Code, Codex, Antigravity 등 SKILL-compatible agent를 언급한다. 즉 “사람이 직접 쓰는 CLI catalog”이기도 하지만, 더 중요한 목표는 에이전트가 task를 받으면 적절한 CLI를 검색하고, 설치하고, 각 CLI의 `SKILL.md`를 읽어 실행까지 이어가게 하는 것이다.

## 어떻게 동작하는가

CLI-Anything generator의 핵심은 7단계 pipeline이다. README와 plugin 문서 기준 흐름은 다음과 같다.

```text
1. Codebase Analysis
2. CLI Design
3. Implementation
4. Test Planning
5. Test Implementation
6. Test Documentation / SKILL.md generation
7. Packaging / publishing / installation
```

![CLI-Anything architecture](/images/tips/cli-anything-architecture.webp)

생성되는 harness는 단순 wrapper만 목표로 하지 않는다. 각 harness는 보통 다음 성격을 갖도록 설계된다.

- `cli-anything-<software>` 형태의 일관된 command name
- one-shot subcommand와 interactive REPL 모드
- 에이전트가 파싱하기 쉬운 `--json` 출력
- project/session state, undo/redo, operation history
- 실제 앱 backend나 파일 포맷을 호출하는 authentic integration
- `tests/TEST.md`, unit/E2E/subprocess test, 사용 예제
- repo-root 또는 package-local `SKILL.md`를 통한 agent discovery

예를 들어 README의 generated CLI 사용 예시는 이런 형태다.

```bash
cd gimp/agent-harness && pip install -e .

cli-anything-gimp --help
cli-anything-gimp project new --width 1920 --height 1080 -o poster.json
cli-anything-gimp --json layer add -n "Background" --type solid --color "#1a1a2e"
cli-anything-gimp
```

좋은 점은 에이전트 입장에서 모든 GUI 앱을 “화면 좌표”가 아니라 “도움말이 있고 JSON을 반환하는 명령어”로 볼 수 있다는 것이다. 이 구조가 잘 맞으면 screenshots + click automation보다 훨씬 재현 가능하고, testable하고, 토큰도 덜 쓴다.

## 왜 유용한가

첫째, **에이전트에게 안정적인 조작 표면을 준다.** GUI automation은 화면 크기, theme, focus, 언어 설정, loading 상태에 약하다. CLI harness는 `--help`, subcommand, exit code, JSON output으로 capability를 노출하므로 에이전트가 더 쉽게 탐색하고 검증할 수 있다.

둘째, **“진짜 소프트웨어”를 계속 쓰게 한다.** CLI-Anything의 README는 toy reimplementation이 아니라 Blender, LibreOffice, Audacity, GIMP 같은 실제 backend나 파일 포맷을 호출하는 방향을 강조한다. 에이전트가 간이 PNG 생성기를 쓰는 대신 실제 GIMP/Blender/LibreOffice workflow를 command로 몰아붙일 수 있다면 결과물 품질과 재현성이 올라간다.

셋째, **SKILL.md와 package manager를 함께 본다.** 단순히 CLI 하나를 만드는 데서 끝나지 않고, `cli-hub` registry, public registry, harness별 `SKILL.md`, meta-skill까지 연결한다. 이 조합은 “에이전트가 어떤 도구를 써야 하는지 모르는 문제”를 catalog/search/install/read-docs 흐름으로 줄이려는 시도다.

넷째, **검증 문화가 들어 있다.** README는 harness마다 unit test, native E2E, true backend E2E, installed command subprocess test를 강조한다. 물론 README의 테스트 총계는 빠르게 바뀔 수 있고 독립 benchmark는 아니지만, 최소한 “에이전트가 만든 CLI도 테스트와 문서가 있어야 한다”는 방향은 맞다.

## 설치와 첫 사용법

이미 만들어진 harness를 써보려면 `cli-hub`부터 시작하는 것이 가장 현실적이다.

```bash
pip install cli-anything-hub
cli-hub list
cli-hub search blender
cli-hub info blender
cli-hub install blender
```

단, 여기서 중요한 점이 있다. `cli-hub install <name>`은 registry entry에 따라 `pip`, `npm`, `uv`, Homebrew/installer command 등을 실행한다. 일부 public CLI는 API key, 계정 로그인, 로컬 앱 설치, Docker, browser/desktop 권한이 필요할 수 있다. 설치 전에 `cli-hub info <name>`로 source URL, install command, required dependency를 먼저 확인하는 편이 좋다.

새 harness를 만들려면 agent plugin/skill 흐름이 필요하다. Claude Code에서는 README 기준 다음 경로가 기본이다.

```text
/plugin marketplace add HKUDS/CLI-Anything
/plugin install cli-anything
/cli-anything <software-path-or-repo>
```

생성된 harness는 보통 해당 software 폴더 아래 `agent-harness/`에 만들어지고, 개발 중에는 editable install로 확인한다.

```bash
cd <software>/agent-harness
pip install -e .
which cli-anything-<software>
cli-anything-<software> --help
cli-anything-<software> --json <command>
```

Windows에서 Claude Code plugin을 쓰는 경우 README는 Git for Windows의 `bash`/`cygpath` 또는 WSL이 필요할 수 있다고 적고 있다. Python 패키지 자체는 `>=3.10`을 요구하지만, 실제 harness의 OS 지원은 대상 앱과 backend 의존성에 크게 좌우된다.

## 활용 포인트

CLI-Anything은 다음 상황에서 특히 흥미롭다.

- **AI 에이전트에게 GUI 앱을 맡기고 싶을 때**: “Blender로 scene 만들기”, “LibreOffice로 문서 생성/변환”, “OBS/Shotcut/Kdenlive workflow 조작”처럼 화면 조작보다 명령형 interface가 더 맞는 작업.
- **사내 도구나 오픈소스 앱에 agent surface를 붙이고 싶을 때**: 기존 codebase를 분석해 `click` 기반 CLI, test, docs, `SKILL.md`까지 한 묶음으로 만드는 실험.
- **에이전트용 tool catalog가 필요한 팀**: 팀 내부에서 “이 task에는 어떤 CLI를 써야 하나?”를 매번 prompt에 쓰지 않고 registry와 skill catalog로 관리하는 방식.
- **GUI agent benchmark를 만들고 싶을 때**: 같은 앱을 pixel-click agent와 CLI harness agent로 비교하면 task success, token/tool call, artifact 검증을 더 구조적으로 볼 수 있다.

내가 보기에는 CLI-Anything의 진짜 가치는 “자동으로 완벽한 CLI를 만든다”보다 **agent-native software adapter를 어떻게 표준화할지에 대한 실험장**이라는 데 있다. 모든 앱을 한 번에 coverage 100%로 감싸기는 어렵지만, command naming, JSON 출력, REPL, preview, `SKILL.md`, test report 같은 관례가 쌓이면 에이전트가 쓸 수 있는 소프트웨어 표면이 훨씬 넓어진다.

## 주의할 점

첫째, 아직 베타로 보는 것이 맞다. 저장소는 빠르게 변하고, Release는 v0.3.0 계열이며, README의 harness 수·test 수·지원 agent 목록은 계속 갱신되는 중이다. 중요한 workflow에 넣기 전에는 특정 harness의 `README.md`, `TEST.md`, dependency, 최근 commit을 별도로 확인해야 한다.

둘째, `cli-hub`는 anonymous usage analytics를 보낸다. `cli-hub/README.md`는 기본 provider가 PostHog이고 legacy Umami 경로가 남아 있다고 설명하며, opt-out은 다음 환경 변수로 한다.

```bash
export CLI_HUB_NO_ANALYTICS=1
```

소스의 `analytics.py`를 보면 `~/.cli-hub/.analytics_id`에 distinct id를 만들고, command, platform, agent/human invocation signal 같은 event property를 전송한다. 민감한 프로젝트에서 agent가 자동으로 CLI를 설치·실행하게 할 계획이라면 이 opt-out을 기본값으로 두는 편이 낫다.

셋째, registry install은 신뢰 경계가 넓다. `cli-hub`는 GitHub Pages registry를 캐시하고, 항목별 install command를 실행한다. 공식 harness는 `pip` 경로가 많지만 public registry에는 npm, uv, bundled installer, shell pipeline성 command가 섞일 수 있다. 에이전트에게 `cli-hub install` 권한을 줄 때는 registry source, package manager, lock/pin 전략, sandbox, 네트워크 권한을 같이 설계해야 한다.

넷째, 생성된 harness는 대상 앱의 권한을 그대로 만진다. GIMP/Blender/LibreOffice 같은 로컬 파일 생성 앱은 workspace 밖으로 쓸 수 있고, Zoom/Mailchimp/Contentful/Sentry류 CLI는 계정 token과 원격 API를 다룰 수 있다. `SECURITY.md`도 prompt-injected agent가 crafted argument를 backend에 전달할 수 있음을 threat model로 잡고, subprocess argument allowlist, Script-Fu escaping, XML/SVG escaping, path normalization, secret logging 금지를 강조한다.

다섯째, “소스 코드가 있어야 잘 된다.” README의 limitation도 compiled-only software나 복잡한 closed-source 앱은 harness 품질이 떨어질 수 있다고 본다. CLI-Anything은 마법의 GUI 자동화기가 아니라, 좋은 소스·명확한 backend·강한 모델·반복 refinement가 있을 때 가치가 커지는 생성 workflow에 가깝다.

## 내 판단

CLI-Anything은 지금 바로 “모든 앱을 안정적으로 agent-native로 바꿔주는 완제품”이라기보다, **에이전트 시대의 tool adapter 표준을 빠르게 실험하는 프로젝트**로 보는 것이 좋다. 이미 있는 harness를 CLI-Hub로 훑어보고, 잘 맞는 하나를 sandbox에서 실행해 보는 것만으로도 감이 온다.

추천하는 첫 실험은 안전한 read/write 범위가 분명한 앱으로 시작하는 것이다. 예를 들어 `drawio`, `mermaid`, `gimp`, `libreoffice`처럼 local artifact를 만들고 결과 파일을 검증할 수 있는 대상이 좋다. 계정 token이 필요한 SaaS, browser/desktop 자동화, system-level 권한이 필요한 harness는 한 단계 뒤로 미루고, telemetry opt-out과 sandbox를 먼저 잡는 편이 낫다.

팀 관점에서는 더 흥미롭다. 내부 도구마다 “API 문서 + 사용 예제”만 주는 대신, agent가 바로 실행할 수 있는 CLI, JSON schema, `SKILL.md`, test report를 같이 배포하는 방식은 충분히 실용적인 개발 문화가 될 수 있다. CLI-Anything은 그 전환을 꽤 공격적으로 밀어붙이는 초기 레퍼런스다.

## 참고한 공개 자료

- [HKUDS/CLI-Anything GitHub repository](https://github.com/HKUDS/CLI-Anything)
- [CLI-Anything Hub](https://clianything.cc/)
- [cli-hub README](https://github.com/HKUDS/CLI-Anything/blob/main/cli-hub/README.md)
- [CLI-Anything plugin README](https://github.com/HKUDS/CLI-Anything/blob/main/cli-anything-plugin/README.md)
- [CLI-Anything SECURITY.md](https://github.com/HKUDS/CLI-Anything/blob/main/SECURITY.md)
- [cli-anything-hub on PyPI](https://pypi.org/project/cli-anything-hub/)
