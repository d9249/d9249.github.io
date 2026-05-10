---
title: "Mole은 터미널에서 CleanMyMac·AppCleaner·DaisyDisk 역할을 묶어 쓰는 macOS 정리 CLI다"
date: "2026-05-10T22:36:19"
description: "Mole은 macOS 캐시 정리, 앱 제거, 디스크 분석, 빌드 산출물 삭제, 시스템 상태 모니터링을 하나의 `mo` 명령으로 묶은 오픈소스 로컬 유지보수 도구다."
author: "Sangmin Lee"
repository: "tw93/Mole"
sourceUrl: "https://github.com/tw93/Mole"
status: "Open source macOS CLI"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "macOS"
  - "CLI"
  - "System Utility"
  - "Cleanup"
  - "Developer Tools"
highlights:
  - "`mo clean`, `mo uninstall`, `mo analyze`, `mo status`로 Mac 정리·삭제·분석·모니터링을 한 도구에서 처리한다."
  - "주요 삭제 명령은 `--dry-run` 미리보기, 경로 검증, 보호 경로, 확인 프롬프트, 작업 로그를 전제로 설계되어 있다."
  - "Homebrew 설치가 가장 간단하지만, GitHub Releases에는 darwin amd64/arm64 바이너리와 SHA256SUMS도 함께 배포된다."
  - "macOS 전용 도구에 가깝고 Windows 브랜치는 실험 단계이므로, Linux/Windows 범용 클리너로 이해하면 안 된다."
draft: false
---

`Mole`은 “터미널용 CleanMyMac”에 가까운 macOS 유지보수 CLI다. 캐시와 로그를 지우는 `clean`, 앱과 찌꺼기를 같이 제거하는 `uninstall`, 큰 폴더를 훑는 `analyze`, CPU·메모리·디스크·네트워크 상태를 보여주는 `status`, 프로젝트의 `node_modules`나 `target` 같은 빌드 산출물을 정리하는 `purge`를 `mo` 명령 하나로 묶었다.

README 기준으로 Mole은 macOS용으로 만들어졌고, Windows 브랜치는 early adopter용 실험판이다. 최신 GitHub Release는 `V1.38.0 Owl`이며 darwin amd64/arm64 바이너리와 `SHA256SUMS`를 배포한다. 소스는 Shell과 Go 조합이고, 라이선스는 MIT다.

![Mole cleanup preview and result](/images/tips/mole-hero.png)

## 무엇을 해주는 도구인가

Mole의 핵심은 “Mac 정리 작업을 GUI 앱 대신 터미널 워크플로우로 가져오는 것”이다. README가 제시하는 기본 명령은 다음 흐름으로 정리할 수 있다.

```bash
mo                           # Interactive menu
mo clean                     # 캐시·로그·브라우저/개발도구 찌꺼기 정리
mo uninstall                 # 앱과 관련 파일 제거
mo optimize                  # 캐시·서비스·LaunchServices·Spotlight 등 갱신
mo analyze                   # 디스크 사용량 탐색기
mo status                    # 실시간 시스템 상태 대시보드
mo purge                     # 프로젝트 빌드 산출물 정리
mo installer                 # DMG/PKG/ZIP 설치 파일 찾기
```

일반적인 Mac 사용자에게는 `clean`, `uninstall`, `analyze`가 가장 눈에 띄고, 개발자에게는 `purge`가 꽤 실용적이다. `node_modules`, Rust `target`, Swift `.build`, `build`, `dist`, Python `venv`처럼 프로젝트 안에서 커지는 산출물을 찾아서 정리 대상으로 보여주기 때문이다.

## 설치는 Homebrew가 가장 무난하다

공식 README의 1순위 설치 방법은 Homebrew다.

```bash
brew install mole
```

직접 설치 스크립트도 제공한다.

```bash
curl -fsSL https://raw.githubusercontent.com/tw93/mole/main/install.sh | bash
```

다만 시스템 정리 도구는 설치 스크립트 자체도 신뢰 경계에 들어간다. 보수적으로 쓰려면 Homebrew를 먼저 쓰고, 스크립트 설치가 필요하면 `install.sh`를 내려받아 내용을 확인한 뒤 실행하는 편이 좋다.

작성 시점 기준 GitHub 최신 릴리스는 `V1.38.0`이지만, Homebrew core formula는 `1.37.0`을 가리키고 있었다. 즉 “가장 최신 기능”이 필요하면 GitHub Releases와 `mo update` 경로를 확인하고, 안정적인 패키지 관리 흐름이 우선이면 Homebrew 쪽을 쓰는 식으로 선택하면 된다.

## 안전장치: dry-run부터 시작해야 한다

Mole은 로컬 시스템 유지보수 도구이고, 일부 명령은 실제로 파일을 지운다. README도 `clean`, `uninstall`, `purge`, `installer`, `remove`를 destructive command로 분류하고 먼저 `--dry-run`을 쓰라고 안내한다.

```bash
mo clean --dry-run
mo uninstall --dry-run
mo purge --dry-run
mo installer --dry-run
mo clean --dry-run --debug
```

`SECURITY_AUDIT.md`를 보면 Mole의 안전 설계는 다음 원칙에 가깝다.

- 삭제 경로는 `validate_path_for_deletion()` 같은 공통 검증을 지난다.
- `/`, `/System`, `/bin`, `/usr`, `/etc`, `/private`, `/Library/Extensions` 같은 루트·시스템 경로는 기본 차단한다.
- Keychain, password manager, VPN/proxy, browser history/cookies, Apple Notes group container, iCloud `Mobile Documents`, `com.apple.*` LaunchAgents/Daemons 같은 민감 범주는 보호 대상으로 둔다.
- symlink와 path traversal은 보수적으로 처리한다.
- `mo analyze`의 삭제는 직접 삭제보다 Finder Trash 경로를 사용한다.
- 작업 로그는 기본적으로 `~/Library/Logs/mole/operations.log`에 남긴다. 필요하면 `MO_NO_OPLOG=1`로 끌 수 있다.

이런 안전장치가 있어도 “휴지통으로 가는 작업”과 “영구 삭제되는 cleanup flow”가 섞여 있다는 점은 기억해야 한다. 특히 `purge`는 프로젝트 산출물을 대상으로 하지만, 잘못 선택하면 재설치·재빌드 시간이 크게 들 수 있다.

## 어떤 작업에 특히 잘 맞나

Mole은 다음 상황에서 유용하다.

- GUI 클리너 앱을 매번 열기보다 터미널에서 빠르게 정리하고 싶을 때
- 앱 삭제 후 `Application Support`, `Caches`, `Preferences`, `Logs`, `LaunchAgent` 잔여물을 함께 점검하고 싶을 때
- Xcode, npm, Node.js, 브라우저, 개발 도구 캐시가 너무 커졌는지 확인하고 싶을 때
- `~/Projects`, `~/GitHub`, `~/dev` 아래의 오래된 `node_modules`와 빌드 폴더를 찾고 싶을 때
- `mo status --json`이나 `mo analyze --json`으로 시스템/디스크 정보를 스크립트에 연결하고 싶을 때

`mo analyze`는 기본적으로 `/Volumes` 아래 외장 드라이브를 건너뛰므로, 외장 디스크까지 보려면 명시적으로 실행해야 한다.

```bash
mo analyze /Volumes
mo status --json
mo analyze --json ~/Documents
```

## 주의할 점

첫째, 이 도구는 macOS 중심이다. tips 사이트의 분류상 `macos-linux` bucket에 넣었지만, 실제로는 Linux 유틸리티가 아니다. README는 Windows 브랜치를 실험판으로 언급하지만, 최신 릴리스 자산은 darwin amd64/arm64 중심이다.

둘째, `optimize`는 시스템 캐시·서비스·LaunchServices·Spotlight 쪽을 건드릴 수 있고 일부 작업은 sudo가 필요할 수 있다. 릴리스 노트에 따르면 sudo가 거부되면 더 보수적으로 skip하도록 개선되고 있지만, 회사 장비나 MDM 정책이 걸린 Mac에서는 먼저 dry-run과 출력 로그를 확인하는 편이 안전하다.

셋째, cleanup tool 특성상 “공간을 더 많이 비웠다”가 항상 좋은 결과는 아니다. Mole의 장점은 공격적으로 다 지우는 데 있다기보다, README와 보안 문서가 강조하듯 불확실하면 skip하고, 위험한 경로는 보호하고, 미리보기와 확인 단계를 둔다는 데 있다.

## 내 판단

Mole은 Mac을 자주 정리하는 개발자에게 특히 잘 맞는 도구다. CleanMyMac류 GUI 앱을 싫어하거나, 앱 삭제·캐시 정리·프로젝트 산출물 정리를 터미널에서 한 번에 처리하고 싶은 사람이라면 `brew install mole` 후 `mo clean --dry-run`, `mo analyze`, `mo status`부터 시험해볼 만하다.

반대로 “절대 삭제 사고가 나면 안 되는 업무용 Mac”이라면 바로 `mo clean`부터 실행하지 말고, `--dry-run --debug`와 `SECURITY_AUDIT.md`를 먼저 보는 쪽을 추천한다. Mole은 안전장치를 꽤 세밀하게 두고 있지만, 최종적으로는 로컬 파일 삭제 권한을 가진 유지보수 도구다.

## 참고한 공개 자료

- [tw93/Mole GitHub repository](https://github.com/tw93/Mole)
- [Mole README](https://github.com/tw93/Mole#readme)
- [Mole V1.38.0 Release](https://github.com/tw93/Mole/releases/tag/V1.38.0)
- [Mole SECURITY.md](https://github.com/tw93/Mole/blob/main/SECURITY.md)
- [Mole SECURITY_AUDIT.md](https://github.com/tw93/Mole/blob/main/SECURITY_AUDIT.md)
- [Homebrew formula: mole](https://formulae.brew.sh/formula/mole)
