---
title: "Open CoDesign은 BYOK 모델로 프롬프트를 디자인 산출물로 바꾸는 로컬 AI 디자인 앱이다"
date: "2026-05-15T03:17:05"
description: "OpenCoworkAI/open-codesign은 Claude Design·v0·Lovable류의 프롬프트→프로토타입 흐름을 Electron 데스크톱, BYOK 모델 설정, 로컬-first workspace, HTML/PDF/PPTX/ZIP/Markdown export로 가져오는 MIT 오픈소스 앱이다."
author: "Sangmin Lee"
repository: "OpenCoworkAI/open-codesign"
sourceUrl: "https://github.com/OpenCoworkAI/open-codesign"
status: "Open source pre-alpha"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Design"
  - "Desktop App"
  - "BYOK"
  - "Prototyping"
  - "Electron"
  - "Local-First"
  - "TypeScript"
highlights:
  - "프롬프트를 HTML/React 프로토타입, 슬라이드, PDF, PPTX, ZIP, Markdown 산출물로 바꾸는 Electron 기반 데스크톱 AI 디자인 도구다."
  - "Claude, OpenAI, Gemini, DeepSeek, OpenRouter, SiliconFlow, Ollama, OpenAI-compatible endpoint, ChatGPT Plus/Codex 로그인까지 BYOK/구독형 모델 경로를 폭넓게 지원한다."
  - "v0.2.0의 핵심은 workspace-backed session, permissioned local tools, Files panel, `DESIGN.md` 디자인 시스템, agent activity panel이다."
  - "macOS DMG, Windows EXE/ZIP, Linux AppImage/deb/rpm/snap 릴리스가 있고 Homebrew Cask와 Scoop은 live, winget은 문서 기준 review 대기 상태다."
  - "설치 파일은 아직 notarization/AuthentiCode signing 전이므로 Gatekeeper·SmartScreen 우회, checksums/SBOM 확인, 모델 API key 저장 방식을 먼저 봐야 한다."
  - "디자인 agent가 로컬 파일을 읽고 쓰며 명령 실행 권한을 요청할 수 있으므로, ‘로컬-first’라도 untrusted prompt·reference·workspace에는 보수적으로 쓰는 편이 안전하다."
draft: false
---

`Open CoDesign`은 Claude Design, v0, Lovable, Bolt.new 같은 “프롬프트를 넣으면 바로 프로토타입을 만들어주는” 제품군을 오픈소스 데스크톱 앱으로 가져오려는 프로젝트다. 차이는 모델과 데이터 경계다. 특정 SaaS 계정에 묶이는 대신, 사용자가 이미 쓰는 Claude/OpenAI/Gemini/OpenRouter/Ollama/사내 OpenAI-compatible endpoint를 연결하고, 디자인 세션과 산출물은 로컬 workspace 파일로 남기는 방향을 택한다.

저장소는 TypeScript 중심의 Electron 앱이고, GitHub API 기준 조사 시점에는 stars 5,893, forks 620, open issues 54, 기본 브랜치 `main`, 라이선스 MIT로 확인된다. 최신 공개 릴리스는 `v0.2.0`이며, README와 changelog는 이 버전을 “Agentic Design” 릴리스라고 부른다. 단순 one-shot 생성기가 아니라, 디자인별 workspace, JSONL session history, permissioned tool use, `DESIGN.md` 디자인 시스템 파일을 갖춘 로컬 디자인 agent 쪽으로 이동했다는 뜻이다.

![Open CoDesign hero](/images/tips/open-codesign-hero.webp)

## Open CoDesign 개요

Open CoDesign의 기본 사용 흐름은 간단하다. 앱을 설치하고, 모델 provider를 연결한 뒤, landing page·dashboard·pitch slide·mobile app·chat UI 같은 예시 또는 직접 쓴 프롬프트를 넣으면 preview canvas에 HTML/React 기반 산출물이 렌더링된다. 이후 comment mode로 특정 영역을 찍어 수정하거나, 모델이 노출한 tweak slider로 색상·간격·타이포그래피를 조정하고, 결과를 HTML/PDF/PPTX/ZIP/Markdown으로 내보낸다.

제품 표면은 “디자인 툴”이지만 내부 구조는 coding agent에 더 가깝다. v0.2.0 문서 기준 agent는 workspace 안의 파일을 읽고 쓰며, `ask`, `scaffold`, `skill`, `preview`, `gen_image`, `tweaks`, `todos`, `done` 같은 디자인용 도구를 사용한다. 사용자는 agent panel에서 todos, tool call, 진행 상태를 보며 중간에 중단할 수 있다.

![Open CoDesign agent panel](/images/tips/open-codesign-agent-panel.webp)

## 왜 유용한가

Open CoDesign이 흥미로운 지점은 “AI 디자인 앱”을 클라우드 서비스가 아니라 로컬-first 개발 도구처럼 다룬다는 점이다.

- **모델 선택권**: Anthropic Claude, OpenAI GPT, Google Gemini, DeepSeek, OpenRouter, SiliconFlow, local Ollama, OpenAI-compatible endpoint, keyless IP-allowlisted proxy, ChatGPT Plus/Codex subscription login을 같은 설정 표면에서 다룬다.
- **기존 개발 도구와의 연결**: Claude Code나 Codex 설정을 가져오는 import 흐름이 있고, API key를 다시 복사하지 않아도 되는 경로를 제공한다.
- **파일로 남는 산출물**: v0.2부터 디자인은 workspace-backed session이 되고, 생성된 소스·assets·exports·`AGENTS.md`·`DESIGN.md`가 로컬 파일로 남는다.
- **디자인-specific agent loop**: 단순히 HTML 한 덩어리를 뱉는 것이 아니라, preview self-check, inline comment, tweak controls, scaffold, skill, image generation 같은 도구를 통해 반복 수정하도록 설계되어 있다.
- **내보내기 중심**: 결과물을 앱 안에 가둬두는 대신 HTML, PDF, PPTX, ZIP, Markdown으로 꺼낼 수 있다.

특히 “기획안/랜딩/슬라이드/대시보드 mockup을 빠르게 만들고 싶은데, 회사나 개인 workflow 때문에 특정 SaaS에 모든 prompt와 asset을 맡기기는 싫다”는 사람에게 맞는다. 로컬 앱이지만 선택한 모델 provider에는 prompt와 context가 전송될 수 있으므로, 로컬-first와 완전 오프라인은 구분해서 봐야 한다.

## 설치와 첫 사용법

공식 Quickstart의 권장 경로는 package manager 또는 GitHub Release 다운로드다.

```bash
# macOS
brew install --cask opencoworkai/tap/open-codesign

# Windows — Scoop
scoop bucket add opencoworkai https://github.com/OpenCoworkAI/scoop-bucket
scoop install opencoworkai/open-codesign
```

직접 내려받을 때는 GitHub Release의 `v0.2.0` 자산을 기준으로 고르면 된다.

- macOS Apple Silicon: `open-codesign-*-arm64.dmg`
- macOS Intel: `open-codesign-*-x64.dmg`
- Windows x64/ARM64: `open-codesign-*-setup.exe` 또는 portable ZIP
- Linux x64: AppImage, deb, rpm, snap

릴리스에는 `SHA256SUMS.txt`, CycloneDX SBOM, provenance JSON도 붙어 있다. GitHub 다운로드가 느린 지역을 위해 SourceForge mirror도 안내하지만, mirror 파일은 같은 GitHub Release의 checksum으로 검증하는 쪽이 안전하다.

소스에서 직접 실행하려면 Node 22 계열과 pnpm workspace 환경이 필요하다.

```bash
git clone https://github.com/OpenCoworkAI/open-codesign.git
cd open-codesign
pnpm install
pnpm dev
```

첫 실행 후에는 Settings에서 provider를 고른다. API key를 직접 붙여 넣거나, ChatGPT subscription login으로 Codex 모델을 쓰거나, Claude Code/Codex 설정을 import하거나, local Ollama 또는 사내 OpenAI-compatible gateway를 넣는 식이다.

## 실제로 볼 포인트

Open CoDesign을 평가할 때는 README의 “대체재” 표보다 다음 네 가지를 보는 편이 실용적이다.

### 1. Agentic Design이 필요한 작업인가

간단한 hero section 하나라면 어떤 LLM UI에서도 만들 수 있다. Open CoDesign이 더 의미 있는 경우는 여러 파일, 반복 수정, 댓글 기반 patch, 디자인 시스템 파일, export가 필요한 작업이다. v0.2.0은 design session을 workspace로 바꾸고, agent가 source file을 고치며 preview하고 완료 선언을 하는 구조를 강화했다.

### 2. Provider 설정이 내 환경과 맞는가

Open CoDesign은 BYOK라서 무료 무제한 도구가 아니다. Anthropic/OpenAI/Gemini/OpenRouter 같은 원격 provider를 쓰면 해당 provider 비용과 데이터 정책을 따른다. Ollama나 keyless local proxy를 붙이면 더 로컬에 가깝게 쓸 수 있지만, 품질과 속도는 모델·하드웨어·endpoint 구현에 좌우된다.

### 3. Export 품질이 목적에 충분한가

HTML/React preview는 빠른 mockup에는 강하지만, 바로 production design system이나 Figma layer로 넘어가는 것은 별개의 문제다. 현재 roadmap에서도 Figma layer export는 post-1.0으로 잡혀 있다. 지금은 “아이디어를 artifact로 빠르게 만들고 공유 가능한 파일로 뽑는 도구”로 보는 편이 정확하다.

### 4. Desktop packaging 상태를 감수할 수 있는가

릴리스 자산은 다양하지만 아직 pre-alpha다. `SECURITY.md`도 “Only the latest commit on main is supported”라고 밝힌다. 또한 v0.2.0 기준 설치 파일은 macOS notarization과 Windows Authenticode signing 전이다. macOS에서는 Gatekeeper가 막을 수 있고, Windows에서는 SmartScreen 경고가 뜰 수 있다. 공식 문서의 우회 방법을 따라야 하지만, 조직 장비에서는 보안 정책상 허용되지 않을 수 있다.

## 보안과 운영 caveat

Open CoDesign은 “로컬 앱”이라는 점이 장점이지만, 권한 표면은 작지 않다.

- **모델 API key와 OAuth token**: 공식 Quickstart는 API-key credentials가 `~/.config/open-codesign/config.toml`에 저장되고, 최근 코드에서는 Electron `safeStorage`가 가능할 때 `safe:` prefix로 암호화하며 불가능하면 plaintext fallback을 남긴다. ChatGPT OAuth token은 앱 config token store에 저장된다. 백업·로그·화면공유 전에 config 경로를 의식해야 한다.
- **Claude Code/Codex import**: 편하지만 기존 local CLI 설정과 key를 읽는 흐름이다. 어떤 provider와 모델이 import되는지 Settings에서 확인해야 한다.
- **Permissioned local tools**: v0.2의 agent loop는 read/write/edit/bash류 도구를 permission UI로 gate한다. untrusted prompt, untrusted reference URL, 민감한 workspace에서는 “AI 디자인 앱”이 아니라 “파일을 수정할 수 있는 agent”로 취급해야 한다.
- **Reference/network hardening은 진행 중**: changelog에는 private-network provider probe 확인, reference URL의 private/link-local target 차단, SVG sanitization, diagnostics redaction 같은 hardening이 명시되어 있다. 그래도 pre-alpha인 만큼 최신 릴리스와 Security 문서를 함께 봐야 한다.
- **설치 파일 signing**: macOS/Windows unsigned installer 경고를 무시하는 절차가 필요하다. 개인 실험은 가능하지만, 팀 배포나 회사 장비에는 code signing이 붙은 뒤가 더 편하다.
- **이미지 생성과 외부 provider**: AI image generation은 opt-in이지만, 켜면 prompt와 asset context가 선택한 이미지 모델/provider로 나갈 수 있다.

## 내 판단

Open CoDesign은 “Claude Design을 로컬-first/BYOK 방식으로 쓰고 싶다”는 문제의식이 분명한 프로젝트다. 디자인 산출물을 빠르게 만들고, 모델 provider를 바꿔가며 실험하고, 결과를 HTML/PDF/PPTX 같은 파일로 빼고 싶은 사람에게 꽤 잘 맞는다. 특히 AI coding tool 사용자라면 Claude Code/Codex config import, agent panel, workspace file model이 익숙하게 느껴질 가능성이 높다.

반대로 완성도 높은 상용 디자인 툴, signed enterprise installer, 안정적인 협업/권한/브랜드 관리, Figma 수준의 layer editing을 기대하면 아직 이르다. README와 release 속도는 매우 빠르지만, `SECURITY.md`가 말하듯 pre-alpha이고 latest main 중심 지원이다.

내 기준으로는 **개인 개발자·프로덕트 메이커·AI 디자인 workflow 실험자에게 추천할 만한 open-source desktop design agent**다. 처음에는 민감하지 않은 샘플 프로젝트에서 Homebrew/Scoop 또는 GitHub Release로 설치하고, API key 하나나 local Ollama로 작게 시작한 뒤, workspace 저장 위치와 export 결과, permission prompt 동작을 확인하는 순서가 좋다.

## 참고한 공개 자료

- [OpenCoworkAI/open-codesign GitHub repository](https://github.com/OpenCoworkAI/open-codesign)
- [Open CoDesign website](https://opencoworkai.github.io/open-codesign/)
- [Open CoDesign Quickstart](https://opencoworkai.github.io/open-codesign/quickstart)
- [Open CoDesign Architecture](https://opencoworkai.github.io/open-codesign/architecture)
- [Open CoDesign v0.2.0 release](https://github.com/OpenCoworkAI/open-codesign/releases/tag/v0.2.0)
- [Open CoDesign CHANGELOG](https://github.com/OpenCoworkAI/open-codesign/blob/main/CHANGELOG.md)
- [Open CoDesign SECURITY.md](https://github.com/OpenCoworkAI/open-codesign/blob/main/SECURITY.md)
- [Open CoDesign packaging docs](https://github.com/OpenCoworkAI/open-codesign/blob/main/packaging/README.md)
- [Open CoDesign LICENSE](https://github.com/OpenCoworkAI/open-codesign/blob/main/LICENSE)
