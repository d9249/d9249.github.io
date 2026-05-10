---
title: "HOP는 HWP/HWPX 문서를 열고 편집하는 오픈소스 데스크톱 앱이다"
date: "2026-05-11T01:00:07"
description: "HOP는 rhwp 엔진 위에 Tauri 데스크톱 셸을 얹어 HWP/HWPX 문서 열기, HWP 저장, PDF 내보내기, 인쇄, 파일 연결을 제공하는 macOS·Windows·Linux용 오픈소스 앱이다."
author: "Sangmin Lee"
repository: "golbin/hop"
sourceUrl: "https://github.com/golbin/hop"
status: "Open source desktop app"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "HWP"
  - "HWPX"
  - "Document Editor"
  - "Tauri"
  - "Productivity"
  - "Windows"
  - "macOS"
  - "Linux"
highlights:
  - "HWP/HWPX 문서를 열고, HWP 저장·다른 이름으로 저장·PDF 내보내기·인쇄 같은 데스크톱 문서 흐름을 제공한다."
  - "rhwp 문서 엔진과 웹 에디터를 기반으로 하고, HOP는 Tauri 2 앱 셸·파일 연결·창 관리·네이티브 메뉴 같은 제품 레이어를 담당한다."
  - "최신 릴리스는 macOS Apple Silicon/Intel DMG, Windows x64 MSI/EXE, Linux x64 deb/rpm/AppImage를 제공한다."
  - "macOS 빌드는 signed/notarized DMG로 안내되며 Homebrew 설치도 가능하지만, Windows는 아직 unsigned라 SmartScreen 경고가 뜰 수 있다."
  - "HWPX 열기는 가능하지만 개발 문서 기준 HWPX 저장은 아직 막혀 있어, 편집 저장 워크플로는 현재 HWP 중심으로 보는 편이 안전하다."
draft: false
---

`HOP`는 “HOP is Open HWP”라는 이름 그대로, 한글 HWP/HWPX 문서를 데스크톱에서 열고 편집하기 위한 오픈소스 앱이다. 저장소 README 기준 macOS, Windows, Linux를 모두 대상으로 하고, 최신 릴리스에는 각 OS별 설치 파일이 올라와 있다.

핵심은 새로운 문서 엔진을 처음부터 만드는 것이 아니라, 공개 HWP 엔진인 [`rhwp`](https://github.com/edwardkim/rhwp)를 기반으로 실제 사용자가 실행할 수 있는 데스크톱 앱 경험을 덧붙인다는 점이다. 파일 열기, HWP 저장, PDF 내보내기, 인쇄, 드래그 앤 드롭, `.hwp`/`.hwpx` 파일 연결, 여러 창 열기 같은 OS 통합 흐름을 HOP 쪽에서 담당한다.

![HOP editor screenshot](/images/tips/hop-editor.webp)

## HOP 개요

HOP는 한글 문서 포맷을 다루는 로컬 데스크톱 앱이다. README가 현재 지원한다고 설명하는 흐름은 다음과 같다.

- HWP/HWPX 문서 열기
- HWP 문서 저장과 다른 이름으로 저장
- PDF로 내보내기
- 인쇄 다이얼로그 열기
- 파일 드래그 앤 드롭으로 열기
- `.hwp`, `.hwpx` 파일 연결
- 여러 창에서 문서 열기

한국어 문서 환경에서는 이 포지션이 꽤 선명하다. HWP 파일은 공공기관, 학교, 계약·행정 문서에서 여전히 자주 등장하지만, 모든 사용자가 상용 오피스 제품을 설치해 두는 것은 아니다. HOP는 이런 문서를 “일단 로컬 앱에서 열고, 필요한 만큼 편집하고, PDF로 내보내는” 실용적인 경로를 목표로 한다.

## 구조: rhwp 위의 얇은 데스크톱 제품 레이어

개발 문서 기준 프로젝트 구조는 `apps/desktop`, `apps/studio-host`, `third_party/rhwp`로 나뉜다. `third_party/rhwp`는 upstream submodule로 유지하고, HOP 제품 기능 때문에 직접 수정하지 않는 것을 원칙으로 한다. HOP 전용 동작은 데스크톱 앱과 studio host overlay 쪽에 둔다.

기술적으로는 Tauri 2 데스크톱 앱이다. 루트 `package.json`은 pnpm workspace를 쓰고, `apps/desktop/src-tauri/Cargo.toml`에는 `tauri`, `tauri-plugin-dialog`, `tauri-plugin-fs`, `tauri-plugin-single-instance`, `tauri-plugin-updater`, `svg2pdf`, `pdf-writer`, `rhwp` 같은 의존성이 보인다. `tauri.conf.json`에는 HWP/HWPX 파일 연결, updater endpoint, 앱 창 크기, CSP, 아이콘 번들 설정이 들어 있다.

개발 문서가 HOP의 담당 범위로 적는 것은 다음에 가깝다.

- Tauri 2 앱 셸
- native menu와 파일 명령 연결
- Rust document session 관리
- atomic save
- native SVG-to-PDF export 경로
- webview print 경로
- single-instance와 파일 open event 라우팅
- 새 창 생성과 창별 drag/drop 처리
- GitHub Actions 기반 desktop build/release 초안

즉 HOP를 “HWP 렌더러 자체”로만 보기보다, `rhwp`를 실제 데스크톱 사용 흐름으로 포장하는 앱으로 이해하는 편이 맞다.

## 설치와 다운로드

README 기준 공식 다운로드는 GitHub Releases다. 작성 시점 최신 릴리스는 `v0.1.11`이고, 주요 배포 파일은 다음처럼 나뉜다.

- macOS Apple Silicon: `HOP-macos-arm64.dmg`
- macOS Intel: `HOP-macos-x64.dmg`
- Windows x64: `HOP-windows-x64.msi`, `HOP-windows-x64.exe`
- Linux x64: `.deb`, `.rpm`, `AppImage`
- 업데이트용 아카이브와 `latest.json`
- `SHA256SUMS.txt`와 각 플랫폼별 서명 파일

macOS는 README에서 signed/notarized `.dmg`라고 안내한다. Homebrew로도 설치할 수 있다.

```bash
brew install hop
```

Arch Linux 계열은 AUR 패키지 `hop-openhwp-bin`을 사용할 수 있다고 안내한다.

```bash
yay -S hop-openhwp-bin
# 또는
paru -S hop-openhwp-bin
```

소스에서 개발 모드로 실행하려면 submodule과 pnpm 의존성을 준비한 뒤 studio host를 빌드하고 데스크톱 앱을 실행한다.

```bash
git submodule update --init --recursive
pnpm install --frozen-lockfile
pnpm run build:studio
pnpm --filter hop-desktop dev
```

## 실제로 볼 때 중요한 제한

첫째, HWPX 저장은 아직 완성 기능으로 보면 안 된다. README는 HWP/HWPX 열기를 지원한다고 설명하지만, 개발 문서의 “아직 준비 중인 부분”에는 HWPX 저장을 막아 두었다고 적혀 있다. HWPX는 열 수 있지만 안전한 HWPX serializer가 준비되기 전까지 저장은 지원하지 않는다는 의미다. 따라서 편집 후 저장 워크플로는 현재 HWP 중심으로 보는 편이 안전하다.

둘째, autosave/recovery와 외부 파일 변경 감지는 아직 없다고 개발 문서가 밝힌다. 중요한 문서를 오래 편집한다면 수동 저장 습관이 필요하고, 다른 앱에서 같은 파일을 동시에 수정하는 흐름은 조심해야 한다.

셋째, 큰 문서는 아직 개선 여지가 있다. 개발 문서는 큰 문서에서 현재 WASM mirror를 거치는 구간이 있어 native-authoritative 구조로 더 개선해야 한다고 설명한다. 간단한 문서 열람·수정부터 평가해 보고, 대형/복잡한 문서는 원본 백업을 둔 상태에서 확인하는 편이 좋다.

## OS별 주의사항

Windows 빌드는 아직 서명되지 않아 Edge나 Windows SmartScreen에서 “일반적으로 다운로드되지 않습니다” 또는 실행 경고가 뜰 수 있다고 README가 안내한다. GitHub Releases에서 내려받은 파일인지 확인하고, 조직 보안 정책이 있는 환경에서는 서명되지 않은 앱 실행 허용 여부를 먼저 확인해야 한다.

Linux에서는 배포판에 맞는 네이티브 패키지를 우선 쓰는 편이 좋다. README는 한글 IME와 WebKitGTK 런타임 안정성을 이유로 `.deb` 또는 `.rpm` 같은 네이티브 패키지를 권장하고, AppImage는 portable 실행이 필요할 때만 권장한다고 설명한다. 일부 Wayland/IME 환경에서는 한영 전환이나 창 표시가 불안정할 수 있다는 caveat도 있다.

macOS는 Apple Silicon과 Intel DMG가 모두 제공된다. Homebrew 설치도 가능하므로 Mac 사용자는 Release DMG와 Homebrew 중 익숙한 경로를 선택하면 된다.

## 어떤 사람에게 유용한가

HOP는 다음 상황에서 특히 볼 만하다.

- HWP/HWPX 문서를 자주 받지만 전용 상용 오피스 설치를 피하고 싶다.
- 문서를 열람만 하는 것이 아니라 가벼운 편집, HWP 저장, PDF 내보내기까지 필요하다.
- macOS나 Linux에서 HWP 문서 작업 흐름을 실험해 보고 싶다.
- 오픈소스 HWP 생태계가 실제 데스크톱 앱으로 어디까지 왔는지 확인하고 싶다.
- Tauri 기반 문서 앱, 파일 연결, updater, PDF export 구현 예시를 보고 싶다.

반대로 다음 경우에는 아직 조심스럽게 평가하는 편이 맞다.

- HWPX 파일을 열고 다시 HWPX로 안전하게 저장해야 한다.
- autosave/recovery가 필수인 긴 문서 편집 환경이다.
- 조직 표준 배포에서 Windows 코드서명 여부가 중요하다.
- 매우 큰 문서나 복잡한 레이아웃의 호환성을 보장해야 한다.

## 내 판단

HOP는 아직 “모든 HWP/HWPX 업무를 대체하는 완성형 오피스”라기보다, 오픈 HWP 생태계를 실제 데스크톱 앱으로 묶어낸 초기 제품에 가깝다. 그럼에도 가치가 분명하다. macOS, Windows, Linux용 설치 파일을 모두 제공하고, HWP/HWPX 열기부터 HWP 저장, PDF 내보내기, 인쇄, 파일 연결까지 사용자가 기대하는 기본 문서 앱 흐름을 잡고 있기 때문이다.

특히 macOS/Linux에서 HWP 문서를 받아 확인하거나 PDF로 넘겨야 하는 일이 잦다면 한 번 설치해 볼 만하다. 다만 중요한 원본 문서를 바로 맡기기보다는 복사본으로 호환성을 확인하고, HWPX 저장·autosave·대형 문서 처리 같은 제한을 이해한 상태에서 쓰는 것이 좋다.

## 참고한 공개 자료

- [golbin/hop GitHub repository](https://github.com/golbin/hop)
- [HOP README](https://github.com/golbin/hop/blob/main/README.md)
- [HOP v0.1.11 release](https://github.com/golbin/hop/releases/tag/v0.1.11)
- [HOP development document](https://github.com/golbin/hop/blob/main/docs/DEVELOPMENT.md)
- [HOP Tauri configuration](https://github.com/golbin/hop/blob/main/apps/desktop/src-tauri/tauri.conf.json)
- [HOP desktop Cargo manifest](https://github.com/golbin/hop/blob/main/apps/desktop/src-tauri/Cargo.toml)
- [Homebrew Cask: hop](https://formulae.brew.sh/cask/hop)
- [rhwp repository](https://github.com/edwardkim/rhwp)
