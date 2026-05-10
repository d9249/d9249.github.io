---
title: "xingkongliang Skills Manager는 여러 AI 에이전트의 스킬을 한곳에서 동기화한다"
date: "2026-05-10T21:40:52"
description: "xingkongliang/skills-manager는 Claude Code, Codex, Cursor, Gemini CLI 등 여러 AI 코딩 도구의 SKILL.md 기반 스킬을 중앙 라이브러리와 프리셋으로 관리하는 Tauri 데스크톱 앱이다."
author: "Sangmin Lee"
repository: "xingkongliang/skills-manager"
sourceUrl: "https://github.com/xingkongliang/skills-manager"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Developer Tools"
  - "Desktop App"
  - "Workflow"
  - "Tauri"
highlights:
  - "Claude Code, Codex, Cursor, Gemini CLI 같은 여러 AI 도구의 skills 폴더를 중앙에서 관리한다."
  - "Git 저장소, 로컬 폴더, .zip/.skill 아카이브, skills.sh 마켓플레이스에서 스킬을 가져올 수 있다."
  - "Preset, Global Workspace, Project Workspace로 전역/프로젝트별 스킬 구성을 나눠 적용한다."
  - "Symlink 또는 File Copy 방식으로 각 에이전트 폴더에 동기화하고 Git 백업/복원을 지원한다."
draft: false
---

`xingkongliang/skills-manager`는 AI 코딩 도구가 늘어날수록 생기는 “스킬 파일 관리 문제”를 데스크톱 앱으로 풀려는 프로젝트다. Claude Code, Codex, Cursor, Gemini CLI처럼 서로 다른 도구가 각자 `skills` 폴더를 갖기 시작하면, 같은 코드 리뷰 스킬이나 배포 스킬을 여러 위치에 복사하고 최신 상태로 맞추는 일이 금방 번거로워진다.

이 앱은 그 중간에 **중앙 Skills Library**를 두고, 필요한 스킬을 **Preset**으로 묶은 뒤, 전역 또는 프로젝트 워크스페이스에 적용하는 방식으로 관리한다. 이름이 같은 다른 Skills Manager 프로젝트들과 구분하면, 이 저장소는 Tauri 2 기반의 크로스플랫폼 데스크톱 앱이며 Git 백업, 마켓플레이스 검색, 여러 에이전트 경로 감지, symlink/copy 동기화까지 한 화면에 모아둔 쪽에 가깝다.

![Skills Manager My Skills 화면](/images/tips/xingkong-skills-manager-my-skills.png)

## 무엇을 관리하는 도구인가

핵심은 AI 에이전트용 `SKILL.md` 폴더를 하나의 앱에서 탐색, 설치, 태깅, 활성화, 동기화하는 것이다. README 기준으로 스킬은 다음 경로에서 가져올 수 있다.

- Git 저장소
- 로컬 폴더
- `.zip` 또는 `.skill` 아카이브
- [skills.sh](https://skills.sh) 마켓플레이스
- SkillsMP API 키를 설정한 경우 AI 검색

가져온 스킬은 기본적으로 `~/.skills-manager` 아래 중앙 저장소에 들어간다. 이후 사용자는 스킬을 태그로 분류하고, 여러 스킬을 Preset으로 묶고, 특정 에이전트나 프로젝트 워크스페이스에 적용한다.

소스의 `tool_adapters.rs`를 보면 내장 어댑터는 45개로 구성되어 있다. README에는 Cursor, Claude Code, Codex, OpenCode, Amp, Kilo Code, Roo Code, Goose, Gemini CLI, GitHub Copilot, Windsurf, TRAE IDE, Antigravity, Clawdbot, Droid 등이 대표적으로 적혀 있고, 코드에는 Hermes Agent, Qwen Code, OpenHands, Cline, Warp, Augment 같은 추가 도구도 보인다.

## Preset과 Workspace 모델

![Skills Manager concept map](/images/tips/xingkong-skills-manager-concept-map.png)

이 앱에서 헷갈리기 쉬운 개념은 Preset과 Workspace다.

- **Library**: 스킬을 중앙에 저장하는 원천 저장소다.
- **Tag**: 스킬을 찾고 필터링하기 위한 메타데이터다. 적용 상태를 의미하지 않는다.
- **Preset**: 여러 스킬을 묶어 둔 이름 있는 템플릿이다.
- **Global Workspace**: `~/.claude/skills/`, `~/.codex/skills/`처럼 사용자 전역 에이전트 폴더를 관리한다.
- **Project Workspace**: `<project>/.claude/skills/`처럼 특정 프로젝트 안의 스킬 폴더를 관리한다.

중요한 점은 Preset 적용이 “라이브 동기화”가 아니라는 것이다. README는 Preset을 적용하면 선택한 Workspace에 스킬을 한 번 써 넣는 방식이라고 설명한다. 따라서 Preset은 작업 유형별 시작점으로 보고, 실제 파일 상태는 Workspace에서 확인하는 편이 안전하다.

## 왜 유용한가

AI 코딩 도구를 하나만 쓴다면 수동으로 `~/.claude/skills`나 `~/.codex/skills`를 관리해도 된다. 하지만 여러 도구를 함께 쓰면 문제가 달라진다.

- 같은 스킬을 Claude Code와 Codex에 모두 넣고 싶다.
- 특정 프로젝트에는 테스트/빌드 스킬만 따로 두고 싶다.
- 프론트엔드, 백엔드, DevOps처럼 작업 유형별 스킬 묶음을 만들고 싶다.
- 로컬에서 만든 스킬 라이브러리를 Git으로 백업하고 다른 머신과 맞추고 싶다.
- 설치된 스킬의 원본, 태그, 활성화 상태, 업데이트 여부를 한 화면에서 보고 싶다.

Skills Manager는 이런 경우에 “스킬 파일 탐색기 + 프리셋 관리자 + Git 백업 UI” 역할을 한다. My Skills 화면에서는 검색, 태그 필터, 활성화 상태, 출처, Git 동기화, 버전 이력, 일괄 업데이트 버튼을 같이 보여준다.

## 설치와 첫 사용 흐름

최신 릴리스는 GitHub Releases 기준 `v1.18.0`이며, macOS, Windows, Linux용 빌드 자산이 함께 올라와 있다. 릴리스 파일에는 macOS용 `.dmg`와 `.app.tar.gz`, Windows용 `.exe`/`.msi`, Linux용 `.deb`/`.rpm`/`.AppImage`가 포함된다. Tauri 설정에는 macOS 최소 버전이 `10.15`로 지정되어 있다.

일반 사용자는 GitHub Releases에서 자신의 OS에 맞는 설치 파일을 받으면 된다.

- macOS: `skills-manager_1.18.0_aarch64.dmg`, `skills-manager_1.18.0_x64.dmg`
- Windows: `skills-manager_1.18.0_x64-setup.exe`, `skills-manager_1.18.0_x64_en-US.msi`
- Linux: `.deb`, `.rpm`, `.AppImage`

소스에서 개발용으로 실행하려면 README 기준으로 Node.js 18+, Rust toolchain, Tauri prerequisites가 필요하다.

```bash
npm install
npm run tauri:dev
```

빌드는 다음 명령을 사용한다.

```bash
npm run tauri:build
npm run cli:build
```

에이전트나 스크립트에서 데스크톱 앱 없이 같은 Rust core를 쓰고 싶다면 `skills-manager-cli`도 제공된다.

```bash
# 저장소 경로와 통계 확인
npm run cli -- repo status

# 스킬 목록과 단일 스킬 확인
npm run cli -- skills list
npm run cli -- skills show db

# 프리셋/시나리오 미리보기와 적용
npm run cli -- scenarios list
npm run cli -- scenarios preview Default
npm run cli -- scenarios apply Default

# 단일 스킬을 특정 에이전트 폴더로 내보내기
npm run cli -- skills export db --dest ~/.claude/skills/db
```

CLI 바이너리를 PATH에 직접 설치하려면 다음을 실행한다.

```bash
npm run cli:install
```

## 설정에서 봐야 할 것

![Skills Manager Settings 화면](/images/tips/xingkong-skills-manager-settings.png)

Settings 화면은 이 앱의 성격을 가장 잘 보여준다. 각 AI 도구의 설치 여부와 skills 경로를 감지하고, 활성화할 에이전트를 고른 뒤, 중앙 저장소와 동기화 방식을 정한다.

특히 확인할 항목은 세 가지다.

1. **Supported Agents**  
   Claude Code, Codex, Gemini CLI, OpenCode, Cursor, GitHub Copilot, Windsurf 같은 도구가 감지되었는지 확인한다. 감지되었지만 비활성화된 도구는 필요할 때만 켜면 된다.

2. **Central Repository Path**  
   기본값은 `~/.skills-manager`다. 스킬 라이브러리를 별도 Git 저장소나 동기화 폴더에 두고 싶다면 이 위치를 바꿀 수 있다.

3. **Default Sync Mode**  
   Symlink와 File Copy 중 하나를 고른다. README와 설정 문구는 Symlink를 권장하지만, 에이전트별로 독립 복사본을 유지하고 싶다면 File Copy가 더 안전할 수 있다.

## Git 백업과 버전 이력

Skills Manager는 중앙 저장소의 `skills/` 폴더를 Git으로 백업하는 기능을 제공한다. README는 개인 스킬 라이브러리에는 작업 습관, 내부 프로젝트 이름, 프롬프트, 자동화 절차가 들어갈 수 있으므로 **private repository**를 권장한다.

Git 백업을 쓰려면 Settings에서 remote URL을 설정하고 My Skills 화면에서 Start Backup 또는 Sync to Git을 실행한다. `Sync to Git`은 현재 상태에 따라 pull, commit, push를 처리하고, 성공할 때마다 snapshot tag를 만들어 Version History에서 복원할 수 있게 한다.

참고로 SQLite 데이터베이스인 `skills-manager.db`는 Git에 포함되지 않는다. README는 이 DB가 스킬 파일을 스캔해 재구성할 수 있는 메타데이터 저장소라고 설명한다.

## 주의할 점

이런 도구는 편하지만, 실제로는 여러 에이전트가 읽는 로컬 폴더에 파일을 쓰는 관리자다. 몇 가지는 명확히 의식하고 쓰는 편이 좋다.

- **스킬은 실행 지침이 될 수 있다.** 신뢰하지 않는 Git 저장소나 마켓플레이스 스킬을 무심코 설치하면, 에이전트가 위험한 명령이나 민감한 워크플로우를 따르게 될 수 있다.
- **Symlink는 편하지만 영향 범위가 넓다.** 중앙 스킬을 수정하면 링크된 에이전트 경로에도 바로 반영된다. 팀/프로젝트별 재현성이 중요하면 copy 모드가 나을 수 있다.
- **Git 백업 저장소는 private으로 두는 편이 안전하다.** 개인 자동화, 내부 도구명, 프로젝트 경로, 프롬프트가 그대로 들어갈 수 있다.
- **SkillsMP AI 검색은 API 키가 필요하다.** 외부 API를 쓰는 기능은 키 관리와 네트워크 정책을 같이 봐야 한다.
- **Preset은 템플릿이지 지속 동기화 규칙이 아니다.** 적용 후 실제 Workspace 파일 상태를 확인해야 한다.

## 내 판단

여러 AI 코딩 도구를 병행하고 있고, `SKILL.md` 기반 워크플로우를 점점 많이 쌓고 있다면 꽤 실용적인 앱이다. 특히 Claude Code, Codex, Gemini CLI, Cursor, OpenCode를 함께 쓰는 환경에서는 “어느 스킬이 어느 도구에 들어가 있는지”를 시각적으로 확인하는 것만으로도 관리 비용이 줄어든다.

반대로 스킬이 몇 개 없거나 한 도구만 쓴다면 수동 폴더 관리가 더 단순할 수 있다. 이 앱의 장점은 스킬 수가 늘고, 전역/프로젝트별 구성이 갈라지고, 여러 머신이나 여러 에이전트로 동기화해야 할 때부터 분명해진다.

## 참고한 공개 자료

- [xingkongliang/skills-manager GitHub repository](https://github.com/xingkongliang/skills-manager)
- [Skills Manager v1.18.0 release](https://github.com/xingkongliang/skills-manager/releases/tag/v1.18.0)
- [README.md](https://github.com/xingkongliang/skills-manager/blob/main/README.md)
- [CHANGELOG.md](https://github.com/xingkongliang/skills-manager/blob/main/CHANGELOG.md)
- [src-tauri/tauri.conf.json](https://github.com/xingkongliang/skills-manager/blob/main/src-tauri/tauri.conf.json)
