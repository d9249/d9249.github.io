---
title: "RepoBar는 GitHub 저장소 상태를 macOS 메뉴바에 올려둔다"
date: "2026-05-10T17:42:31"
description: "RepoBar는 여러 GitHub 저장소의 이슈, PR, CI, 릴리스, 로컬 Git 상태, API rate limit을 macOS 메뉴바에서 확인하고 빠르게 이동할 수 있게 해주는 오픈소스 개발자 도구입니다."
author: "Sangmin Lee"
repository: "steipete/RepoBar"
sourceUrl: "https://github.com/steipete/RepoBar"
status: "Open source beta"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "macOS"
  - "Menu Bar"
  - "GitHub"
  - "Developer Tools"
  - "Swift"
  - "CLI"
highlights:
  - "GitHub 저장소의 이슈, PR, 릴리스, CI, 최근 활동을 메뉴바에서 한눈에 확인합니다."
  - "로컬 프로젝트 폴더를 스캔해 브랜치, upstream, ahead/behind, dirty 상태를 함께 보여줍니다."
  - "Homebrew cask와 GitHub Releases로 설치할 수 있고, Swift 기반 macOS 네이티브 앱과 repobar CLI를 함께 제공합니다."
  - "GitHub App 토큰을 기본으로 사용하며, 조직 비공개 저장소나 SAML SSO 환경에서는 PAT 범위 검토가 필요합니다."
  - "프로젝트가 빠르게 움직이는 초기 단계라 릴리스/권한/동기화 동작은 업데이트 내역을 확인하며 쓰는 편이 좋습니다."
draft: false
---

RepoBar는 여러 GitHub 저장소를 동시에 관리하는 개발자를 위한 macOS 메뉴바 앱이다. 브라우저 탭을 계속 열어두지 않아도 이슈, PR, CI, 릴리스, 최근 활동, 로컬 Git 상태를 메뉴바에서 바로 확인할 수 있게 해준다.

핵심은 “알림 앱”보다는 “작은 GitHub 운영 대시보드”에 가깝다는 점이다. 관심 있는 저장소를 고정하고, 이슈/PR 압박이 있는 저장소를 훑고, 로컬 checkout이 최신인지 본 뒤 Finder, Terminal, GitHub로 바로 넘어가는 흐름을 만든다.

SwiftPM 기반의 네이티브 macOS 앱이며, 자동화와 디버깅을 위한 `repobar` CLI도 함께 제공한다. 라이선스는 MIT이고, 최신 공개 릴리스는 GitHub Releases 기준 v0.5.1이다.

![RepoBar screenshot](/images/tips/repobar-screenshot.png)

## RepoBar 개요

RepoBar는 GitHub 저장소들을 macOS 메뉴바 안에 카드 형태로 보여준다. 저장소별로 이슈 수, PR 수, 스타/포크, 최신 릴리스, 최근 활동, CI 상태, 로컬 브랜치 상태를 표시하고, 필요하면 저장소별 하위 메뉴에서 이슈, PR, 릴리스, CI runs, discussions, tags, branches, contributors, commits까지 바로 탐색할 수 있다.

공식 스크린샷을 보면 메인 메뉴에는 기여도 그래프와 저장소 목록이 나오고, 선택한 저장소의 서브메뉴에서는 GitHub 열기, Finder 열기, Terminal 열기, 현재 브랜치와 upstream 상태, Sync/Rebase/Reset 같은 Git 작업, 최근 커밋과 활동 로그, 열린 이슈 목록이 이어진다.

즉 여러 저장소를 오가며 “뭐가 바뀌었지?”, “어느 repo에 PR/issue가 쌓였지?”, “내 로컬 checkout이 뒤처졌나?”, “GitHub API 제한에 걸릴 것 같나?”를 자주 확인하는 사람에게 맞는 도구다.

## 왜 유용한가

RepoBar가 풀려는 문제는 명확하다. GitHub는 강력하지만, 여러 저장소를 동시에 보고 있으면 브라우저 탭과 알림이 금방 산만해진다. RepoBar는 그 상태 정보를 메뉴바의 짧은 glance로 압축한다.

특히 유용한 지점은 다음과 같다.

- 여러 저장소의 이슈, PR, 릴리스, CI 상태를 한 화면에서 비교한다.
- `Pinned`, `Hidden`, 업무용 필터처럼 관심 저장소를 정리해 메뉴에 남길 수 있다.
- 로컬 프로젝트 폴더를 스캔해 GitHub 저장소와 checkout을 매칭한다.
- 브랜치, upstream, ahead/behind, dirty files, worktree 상태를 메뉴 안에서 확인한다.
- GitHub rate limit과 REST/GraphQL 상태를 앱 안에서 보여준다.
- persistent cache와 gitcrawl 형식 archive를 활용해 GitHub가 느리거나 제한에 걸렸을 때도 일부 목록을 캐시에서 보여주는 구조를 갖고 있다.
- `repobar` CLI로 앱이 보는 저장소/이슈/PR/cache/rate-limit 상태를 터미널에서도 확인할 수 있다.

단순히 “새 알림이 왔다”를 알려주는 앱보다, 여러 프로젝트를 운영하는 개발자가 GitHub 상태판을 자주 훑는 용도에 더 가깝다.

## 설치와 첫 사용법

공식 README 기준 추천 설치 경로는 Homebrew cask다.

```bash
brew install --cask repobar
```

직접 내려받고 싶다면 GitHub Releases에서 최신 ZIP을 받을 수 있다. 현재 최신 릴리스는 `RepoBar-0.5.1.zip` 자산을 제공한다.

설치 후 기본 흐름은 다음과 같다.

1. RepoBar를 실행한다.
2. GitHub.com 또는 GitHub Enterprise 계정으로 로그인한다.
3. 접근할 저장소 범위를 정한다.
4. Preferences > Repositories에서 메뉴에 보여줄 저장소를 `Visible`, `Pinned`, `Hidden`으로 정리한다.
5. 필요하면 `~/Projects` 같은 로컬 프로젝트 폴더를 지정해 로컬 checkout 상태를 연결한다.
6. 메뉴바에서 저장소별 이슈, PR, 릴리스, CI, 최근 커밋, 브랜치 상태를 확인한다.

로컬 개발은 SwiftPM 기반이며, 저장소를 직접 빌드하려면 README 기준 macOS, Xcode 26 / Swift 6.2, pnpm 10+가 필요하다.

```bash
pnpm install
pnpm check
pnpm build
pnpm start
```

## CLI로 확인할 수 있는 것

RepoBar는 메뉴바 앱만 제공하는 것이 아니라 `repobar` CLI도 포함한다. 앱에서 보는 GitHub/cache 상태를 자동화나 디버깅에 사용할 수 있게 만든 점이 좋다.

README에 나온 예시는 다음과 같다.

```bash
repobar login
repobar repos --plain
repobar repos --owner openclaw --sort prs --plain
repobar repo openclaw/openclaw --plain
repobar issues openclaw/openclaw --limit 20 --plain
repobar pulls openclaw/openclaw --limit 20 --plain
repobar activity steipete --include-repos --limit 10 --plain
repobar rate-limits --plain
repobar cache status --plain
```

`--json`을 쓰면 기계가 읽기 쉬운 출력도 받을 수 있고, `--plain`은 색상이나 링크 장식을 뺀 출력에 유용하다. 메뉴바 앱에서 이상하게 보이는 저장소 목록, GitHub rate limit, cache 상태를 터미널에서 재현해볼 수 있다는 점이 운영 도구답다.

## GitHub 권한과 비공개 저장소

RepoBar는 GitHub.com에서는 기본적으로 RepoBar GitHub App user token을 사용한다. README 설명에 따르면 broad classic OAuth repository scope를 기본으로 요청하지 않고, 접근 범위는 로그인한 사용자의 권한과 RepoBar GitHub App이 설치된 저장소/조직 범위에 의해 제한된다.

비공개 조직 저장소는 해당 조직 또는 선택 저장소에 RepoBar GitHub App이 설치되어야 한다. 조직에서 SAML SSO를 요구하거나 GitHub App 설치 범위를 벗어난 접근이 필요하면 Personal Access Token을 써야 하고, 이 경우 `repo`, `read:org` 같은 범위를 검토해야 한다.

릴리스 빌드는 토큰을 macOS Keychain에 저장한다. 반면 debug build와 SwiftPM CLI/test 실행은 개발 중 Keychain prompt를 피하기 위해 file-backed auth storage를 기본으로 쓴다고 문서화되어 있다.

따라서 회사 조직 저장소에 연결하기 전에는 다음을 확인하는 편이 좋다.

- RepoBar GitHub App이 어느 조직/저장소에 설치되는지
- PAT를 쓴다면 필요한 scope가 정말 맞는지
- 회사의 SSO/보안 정책과 충돌하지 않는지
- 로컬 프로젝트 폴더와 cache/archive 저장 위치가 조직 정책상 괜찮은지

## 활용 포인트

여러 오픈소스 저장소를 관리하거나, 개인/회사 프로젝트를 동시에 보는 개발자라면 RepoBar를 다음 용도로 쓸 수 있다.

- 아침에 메뉴바를 열어 저장소별 이슈/PR 압박을 먼저 훑는다.
- 릴리스가 잦은 프로젝트에서 latest release와 changelog를 빠르게 확인한다.
- 로컬 checkout이 `main` 기준으로 뒤처졌는지, dirty 상태인지 확인한다.
- 자주 보는 저장소만 `Pinned`로 올리고 나머지는 숨긴다.
- GitHub API rate limit이나 endpoint cooldown 때문에 앱/스크립트가 느려지는지 확인한다.
- `repobar repos --json`, `repobar issues ... --json` 같은 CLI 출력을 다른 자동화 스크립트에 붙인다.

특히 저장소가 1~2개라면 GitHub 웹 UI만으로도 충분하지만, 저장소가 많고 “상태 확인 → 이슈/PR 확인 → 로컬 폴더/터미널 열기”를 하루에도 여러 번 반복한다면 메뉴바 대시보드의 효용이 커진다.

## 주의할 점

RepoBar는 README에서도 early and moving quickly라고 설명하는 초기 프로젝트다. GitHub API, local project scan, cache/archive, reference monitor, iOS target 등 기능이 빠르게 늘고 있으므로, 안정적인 장기 운영 도구로 보기보다는 빠르게 발전 중인 생산성 도구로 보는 편이 맞다.

또한 macOS 중심 도구다. Package.swift에는 macOS와 iOS target이 보이지만, 실제 주력 경험은 macOS 메뉴바 앱이다. Windows/Linux 개발자에게는 앱 자체보다는 GitHub 상태를 메뉴바/CLI로 묶는 제품 아이디어가 더 참고가 될 수 있다.

Git 작업 메뉴도 편리하지만, 로컬 저장소 상태를 건드릴 수 있는 기능은 항상 조심해야 한다. 문서상 auto-sync는 clean repo에 대해 fast-forward 중심으로 동작하고 force-push, hard reset, local changes discard를 하지 않는 방향이지만, 회사 저장소에 연결하기 전에는 설정과 권한을 먼저 확인하는 것이 좋다.

## 내 판단

RepoBar는 GitHub를 많이 쓰는 macOS 개발자에게 꽤 실용적인 “작은 운영 패널”이다. GitHub 웹사이트, GitHub CLI, 로컬 Git 클라이언트 사이를 계속 오가는 사람이라면 상태 확인 비용을 줄여준다.

추천 대상은 저장소를 여러 개 관리하는 오픈소스 maintainer, GitHub 이슈/PR/릴리스 흐름을 자주 보는 개발자, macOS 메뉴바에 프로젝트 상태를 올려두고 싶은 사람, GitHub API rate limit과 local checkout 상태까지 같이 보고 싶은 사람이다.

반대로 저장소가 적거나, GitHub 알림만 가끔 확인하면 되는 사람, 회사 보안 정책상 외부 GitHub App 설치가 까다로운 사람에게는 도입 비용이 더 클 수 있다. 이 경우에는 GitHub CLI와 기존 알림만으로도 충분할 수 있다.

## 참고한 공개 자료

- [steipete/RepoBar GitHub repository](https://github.com/steipete/RepoBar)
- [RepoBar official site](https://repobar.app/)
- [RepoBar latest release](https://github.com/steipete/RepoBar/releases/latest)
- [RepoBar README](https://github.com/steipete/RepoBar/blob/main/README.md)
- [RepoBar CLI reference](https://github.com/steipete/RepoBar/blob/main/docs/cli.md)
- [RepoBar auth storage docs](https://github.com/steipete/RepoBar/blob/main/docs/auth-storage.md)
- [RepoBar cache and archive design](https://github.com/steipete/RepoBar/blob/main/docs/cache.md)
- [RepoBar local project sync docs](https://github.com/steipete/RepoBar/blob/main/docs/reposync.md)
- [RepoBar changelog](https://github.com/steipete/RepoBar/blob/main/CHANGELOG.md)
