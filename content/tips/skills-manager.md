---
title: "Skills Manager는 Claude Code와 Codex 스킬을 Mac 앱에서 탐색·설치한다"
date: "2026-05-10T21:21:46"
description: "Skills Manager는 GitHub 저장소나 로컬 폴더에 있는 AI 코딩 에이전트용 SKILL.md를 macOS 앱에서 탐색하고, Claude Code와 Codex 스킬 폴더로 설치·태깅·편집까지 관리하는 SwiftUI 유틸리티입니다."
author: "Sangmin Lee"
repository: "tddworks/SkillsManager"
sourceUrl: "https://github.com/tddworks/SkillsManager"
status: "Source available macOS utility"
license: "Unknown"
platforms:
  - "macos-linux"
tags:
  - "macOS"
  - "AI Agents"
  - "Claude Code"
  - "Codex"
  - "Skills"
  - "SwiftUI"
  - "Developer Tools"
highlights:
  - "GitHub skill catalog와 `file://` 로컬 디렉터리를 추가해 여러 SKILL.md 저장소를 한 화면에서 탐색할 수 있습니다."
  - "Claude Code의 `~/.claude/skills`와 Codex의 `~/.codex/skills/public` 설치 상태를 함께 보여주고, 같은 스킬을 양쪽 provider에 연결할 수 있습니다."
  - "스킬 카드, 상세 패널, Markdown 렌더링, 커스텀 태그, 그리드/리스트 전환으로 개인 스킬 라이브러리를 정리하기 좋습니다."
  - "최신 GitHub Release는 `v0.1.3`이며 DMG/ZIP과 Sparkle appcast를 제공합니다. 배포 앱은 macOS 15 이상을 기준으로 봐야 합니다."
  - "README에는 MIT라고 적혀 있지만 GitHub API와 루트 디렉터리 기준 LICENSE 파일이 확인되지 않아, 재배포·상업적 사용 전 라이선스를 직접 확인해야 합니다."
draft: false
---

AI 코딩 에이전트의 “스킬”은 점점 플러그인처럼 쓰이고 있다. Claude Code, Codex, Hermes Agent처럼 도구마다 스킬 디렉터리와 포맷이 조금씩 다르고, GitHub에는 `SKILL.md`를 모아둔 catalog 저장소도 늘어난다. 몇 개만 설치할 때는 복사로 충분하지만, 여러 저장소를 둘러보고 태그를 붙이고 provider별 설치 상태를 보려면 금방 관리 화면이 필요해진다.

Skills Manager는 이 지점을 노리는 macOS 앱이다. GitHub 저장소나 로컬 폴더에서 `SKILL.md`를 찾아 카드로 보여주고, 선택한 스킬을 Claude Code와 Codex의 스킬 폴더로 설치하거나 연결한다. 저장소 설명 그대로 “AI coding assistant용 스킬을 발견, 탐색, 설치, 태깅하는” 데 집중한 도구다.

저장소의 주 언어는 Swift이고 UI는 SwiftUI 기반이다. README는 macOS 15 이상과 Swift 6 이상을 요구한다고 적고, Tuist 프로젝트·Info.plist·Sparkle appcast도 배포 앱의 최소 macOS 버전을 15.0으로 잡고 있다. 이 사이트의 플랫폼 카테고리는 아직 macOS와 Linux가 같은 `macos-linux` 버킷에 묶여 있지만, Skills Manager 자체는 macOS 전용 앱으로 봐야 한다.

![Skills Manager UI](/images/tips/skills-manager-ui.png)

## Skills Manager 개요

앱의 핵심 화면은 3단 구성이다.

- 왼쪽 사이드바: 설치된 스킬, Claude Code/Codex provider 필터, 등록한 catalog 목록, `+ Add Catalog` 버튼
- 중앙 영역: 스킬 카드 또는 리스트, 검색, 태그 필터, 전체/설치됨/catalog 통계
- 오른쪽 상세 패널: 선택한 스킬의 설명, 태그, 버전, reference/script 수, 설치 경로, uninstall/edit/link 버튼

공식 스크린샷을 보면 개인 스킬 라이브러리 앱에 가깝다. 각 스킬은 카드로 보이고, 설치된 provider가 뱃지로 붙으며, 오른쪽 패널에서는 `SKILL.md` 설명을 Markdown으로 읽고 커스텀 태그를 달 수 있다. 단순 installer라기보다 “내가 쓰는 에이전트 스킬 catalog”를 정리하는 브라우저다.

## 무엇을 관리하나

README와 소스 기준으로 Skills Manager가 직접 다루는 provider는 두 가지다.

- Claude Code: `~/.claude/skills`
- Codex: `~/.codex/skills/public`

로컬 설치 스킬은 위 디렉터리에서 재귀적으로 `SKILL.md`를 찾는다. 원격 catalog는 GitHub 저장소를 로컬 캐시에 clone한 뒤, 저장소 안에서 `SKILL.md`를 가진 폴더를 찾아 스킬로 파싱한다. 로컬 catalog도 `file://` URL 또는 일반 폴더 경로로 추가할 수 있고, `.claude`, `.codex`, `.agent`, `.gemini` 같은 숨김 디렉터리도 일부 허용한다.

설치 흐름은 꽤 실용적이다. 선택한 원격 스킬을 provider별 대상 폴더에 만들고, `SKILL.md`뿐 아니라 `references`, `scripts`, `assets` 같은 추가 파일도 함께 복사한다. 또한 `.skill-id` 메타데이터를 남겨 같은 이름의 스킬이 여러 catalog 경로에 있을 때 구분하려는 구조도 보인다.

## 왜 유용한가

AI 에이전트 스킬은 “한 번 설치하고 끝”보다 “계속 찾아보고 갈아끼우는” 성격이 강하다. 그래서 Skills Manager가 유용한 지점은 다음이다.

- **여러 catalog를 한 화면에 모은다**: Anthropic 공식 skill 저장소, 개인 GitHub 저장소, 로컬 실험 폴더를 함께 둘러볼 수 있다.
- **설치 상태가 보인다**: 같은 스킬이 Claude Code에만 있는지, Codex에도 연결되어 있는지 UI에서 확인한다.
- **태그로 정리한다**: `SKILL.md` frontmatter의 태그와 사용자가 붙인 커스텀 태그를 구분해서 필터링한다.
- **Markdown을 바로 읽는다**: 스킬의 설명, 사용 조건, 명령어, checklist를 앱 안에서 훑어본다.
- **로컬 편집 흐름이 있다**: 로컬 스킬은 split-pane editor와 live preview로 수정할 수 있게 설계되어 있다.

특히 스킬을 직접 만들거나 여러 에이전트를 병행해서 쓰는 사람에게 맞다. 예를 들어 Claude Code용으로 만든 skill을 Codex에서도 써보고 싶거나, GitHub catalog를 여러 개 등록해 두고 “이 분야에는 어떤 스킬이 있나”를 빠르게 훑는 식이다.

## 설치와 첫 사용법

일반 사용자는 GitHub Releases에서 최신 배포본을 받는 흐름이 가장 간단하다. 조사 시점 기준 최신 릴리스는 `v0.1.3`이고, asset은 DMG와 ZIP 두 종류다.

```text
https://github.com/tddworks/SkillsManager/releases/latest
```

릴리스 노트 기준 설치 방법은 다음이다.

1. `SkillsManager-0.1.3.dmg`를 내려받는다.
2. DMG를 열고 `SkillsManager.app`을 Applications로 끌어다 놓는다.
3. 앱을 실행한다.

ZIP으로 받을 수도 있다.

```text
SkillsManager-0.1.3.zip
SkillsManager-0.1.3.zip.sha256
```

체크섬 검증 파일도 함께 제공된다.

```bash
shasum -a 256 -c SkillsManager-0.1.3.zip.sha256
```

소스에서 빌드하려면 Swift Package Manager 또는 Tuist 흐름을 쓴다.

```bash
git clone https://github.com/tddworks/SkillsManager.git
cd SkillsManager
swift build -c release
```

SwiftUI Preview와 Xcode workspace를 쓰고 싶다면 README는 Tuist를 안내한다.

```bash
brew install tuist
tuist generate
open SkillsManager.xcworkspace
```

## 사용할 때 먼저 볼 부분

처음 실행하면 먼저 catalog를 추가하는 흐름이 자연스럽다.

1. 왼쪽 아래 `+ Add Catalog`를 누른다.
2. GitHub Repository 또는 Local Directory를 고른다.
3. `https://github.com/anthropics/skills` 같은 저장소 URL이나 로컬 폴더를 넣는다.
4. 중앙 카드 그리드에서 스킬을 검색하고 태그로 좁힌다.
5. 오른쪽 상세 패널에서 설명을 읽고 Claude Code, Codex 중 설치할 대상을 선택한다.

개인적으로는 “공개 catalog 탐색용”보다 “내가 실제 쓰는 스킬들의 상태판”으로 쓸 때 가치가 커 보인다. 이미 설치한 스킬, 새로 발견한 스킬, 직접 작성 중인 로컬 스킬을 한 화면에서 보고, 어떤 provider에 연결되어 있는지 확인할 수 있기 때문이다.

## 주의할 점

첫째, macOS 전용 앱이다. README 배지와 요구사항은 macOS 15 이상을 말하고, `Project.swift`, `Info.plist`, Sparkle `appcast.xml`도 minimum system version을 15.0으로 둔다. `Package.swift`에는 `.macOS(.v14)`가 보이지만, 실제 배포 앱 기준으로는 macOS 15 이상으로 보는 편이 안전하다.

둘째, 라이선스 확인이 필요하다. README 하단에는 “MIT License - see LICENSE”라고 적혀 있지만, GitHub API의 license 값은 `None`이고 루트 contents에서도 `LICENSE` 파일이 확인되지 않았다. 공개 저장소라서 소스는 볼 수 있지만, 재배포·수정 배포·상업적 사용을 전제로 한다면 저장소에 라이선스 파일이 추가되었는지 먼저 확인해야 한다. 그래서 이 글의 frontmatter도 `license: "Unknown"`으로 두었다.

셋째, 로컬 파일을 실제로 쓰는 도구다. 설치 동작은 provider별 스킬 폴더에 디렉터리를 만들고 `SKILL.md`와 추가 파일을 복사한다. 스킬은 실행 가능한 스크립트나 외부 reference를 포함할 수 있으므로, 낯선 catalog에서 가져온 스킬은 내용을 읽고 설치하는 편이 좋다.

넷째, GitHub catalog는 공개 저장소 중심으로 보는 것이 맞다. 소스의 GitHub client와 clone 흐름은 공개 URL과 unauthenticated GitHub API를 전제로 한 구조에 가깝다. 사내 private skill catalog나 토큰이 필요한 저장소까지 관리하려면 현재 버전에서 지원 범위를 직접 테스트해야 한다.

다섯째, `SKILL.md` frontmatter 파서는 단순한 형태를 우선한다. 소스의 `SkillParser`는 `name`, `description`, `version`, `tags`를 추출하고, tags는 comma-separated 문자열로 해석한다. YAML list 스타일 태그를 쓰는 다양한 skill 포맷을 얼마나 잘 보여주는지는 실제 catalog로 확인해 보는 편이 좋다.

## 내 판단

Skills Manager는 AI 코딩 도구를 하나만 쓰는 사람보다는, 스킬을 적극적으로 모으고 직접 고치는 사람에게 맞는다. Claude Code와 Codex를 함께 쓰고, GitHub의 skill catalog를 여러 개 구독하고, 개인 스킬 저장소까지 관리한다면 UI가 있는 catalog manager가 꽤 유용하다.

반대로 “Claude Code에 스킬 한두 개만 수동 복사해서 쓴다”면 아직은 과할 수 있다. 최신 릴리스가 `0.1.x`이고 라이선스 파일도 정리되지 않은 상태라, 팀 표준 도구로 바로 도입하기보다는 개인용 macOS 유틸리티로 먼저 써보는 쪽이 자연스럽다.

그래도 방향성은 좋다. AI 에이전트 생태계에서 prompt, skill, MCP 서버, local tool 설정은 점점 패키지 관리 대상이 되고 있다. Skills Manager는 그중 `SKILL.md` 중심의 관리 경험을 Mac 네이티브 앱으로 끌어온 시도라서, Claude Code/Codex 스킬을 자주 다루는 사람이라면 한 번 살펴볼 만하다.

## 참고한 공개 자료

- [tddworks/SkillsManager GitHub repository](https://github.com/tddworks/SkillsManager)
- [Skills Manager README](https://github.com/tddworks/SkillsManager/blob/main/README.md)
- [Skills Manager GitHub Releases](https://github.com/tddworks/SkillsManager/releases/latest)
- [Skills Manager appcast.xml](https://tddworks.github.io/SkillsManager/appcast.xml)
- [Architecture documentation](https://github.com/tddworks/SkillsManager/blob/main/docs/ARCHITECTURE.md)
- [Package.swift](https://github.com/tddworks/SkillsManager/blob/main/Package.swift)
- [Project.swift](https://github.com/tddworks/SkillsManager/blob/main/Project.swift)
