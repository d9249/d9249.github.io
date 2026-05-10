---
title: "PortKiller는 개발 중 점유된 포트를 메뉴바와 트레이에서 정리한다"
date: "2026-05-10"
description: "PortKiller는 macOS 메뉴바와 Windows 시스템 트레이에서 로컬 TCP 포트, 프로세스, Kubernetes port-forward, Cloudflare Tunnel을 확인하고 문제 프로세스를 빠르게 종료할 수 있게 해주는 오픈소스 개발자 도구입니다."
author: "Sangmin Lee"
repository: "productdevbook/port-killer"
sourceUrl: "https://github.com/productdevbook/port-killer"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Developer Tools"
  - "macOS"
  - "Windows"
  - "Menu Bar"
  - "System Tray"
  - "Kubernetes"
  - "Cloudflare"
highlights:
  - "현재 열려 있는 TCP 포트, 프로세스 이름, PID를 자동으로 감지하고 검색할 수 있습니다."
  - "macOS 메뉴바와 Windows 시스템 트레이에서 포트 충돌을 빠르게 확인하고 프로세스를 종료합니다."
  - "Kubernetes port-forward 세션과 Cloudflare Tunnel 상태까지 한 화면에서 관리합니다."
  - "macOS는 Homebrew cask 또는 DMG, Windows는 x64/arm64 ZIP 릴리스로 설치할 수 있습니다."
  - "프로세스 종료와 Kill All 기능은 편리하지만 시스템 프로세스나 중요한 서버를 끊을 수 있어 신중하게 써야 합니다."
draft: false
---

개발하다 보면 `3000`, `5173`, `8000`, `8080` 같은 포트가 이미 사용 중이라는 오류를 자주 만난다. 보통은 `lsof`, `netstat`, `taskkill`, Activity Monitor, 작업 관리자 사이를 오가며 어떤 프로세스가 포트를 잡고 있는지 찾아야 한다.

PortKiller는 이 반복 작업을 GUI로 묶어주는 도구다. 로컬에서 listening 중인 TCP 포트를 자동으로 찾고, 포트 번호·프로세스명·PID를 보여주며, 필요하면 해당 프로세스를 한 번에 종료한다. 여기에 Kubernetes port-forward와 Cloudflare Tunnel 관리까지 붙어 있어 로컬 개발 환경의 네트워크 상태판처럼 쓸 수 있다.

GitHub 기준 Swift 중심의 오픈소스 프로젝트이며 라이선스는 MIT다. 최신 공개 릴리스는 `v3.3.1`이고, macOS DMG와 Windows x64/arm64 ZIP 자산을 함께 제공한다.

![PortKiller macOS UI](/images/tips/port-killer-macos.png)

## PortKiller 개요

PortKiller는 “어떤 프로세스가 어떤 포트를 쓰고 있는지”를 빠르게 확인하고 정리하는 데 초점을 맞춘 데스크톱 앱이다. macOS에서는 메뉴바 앱, Windows에서는 시스템 트레이 앱으로 동작한다.

기본 기능은 다음과 같다.

- listening 중인 TCP 포트 자동 탐색
- 포트 번호 또는 프로세스명 검색
- graceful 종료 후 force kill로 이어지는 프로세스 종료 흐름
- 자주 보는 포트 즐겨찾기
- watched port와 알림
- Web Server, Database, Development, System 같은 프로세스 유형 분류
- Kubernetes port-forward 생성·중지·자동 재연결·로그 확인
- Cloudflare Tunnel 상태 확인과 중지

macOS 공식 화면을 보면 메뉴바 팝오버 안에 Cloudflare Tunnels, K8s Port Forward, Local Ports가 섹션별로 나뉘어 나온다. 로컬 포트 목록에는 `:5000`, `:7700` 같은 포트 번호와 프로세스명, PID가 함께 표시되고, 하단에는 Refresh, Tree View, Kill All, Settings 같은 빠른 액션이 있다.

## 왜 유용한가

PortKiller가 유용한 순간은 명확하다. 로컬 개발 서버를 끄지 않고 터미널을 닫았거나, Docker·Kubernetes·프론트엔드 dev server가 같은 포트를 두고 충돌하거나, `kubectl port-forward`가 살아 있는지 헷갈릴 때다.

특히 좋은 점은 “포트 죽이기”만 하는 작은 유틸리티를 넘어, 개발자가 자주 보는 포트 관련 상태를 한 화면에 모았다는 점이다.

- 브라우저에서 `localhost:3000`이 안 열릴 때 어떤 프로세스가 포트를 잡고 있는지 바로 찾는다.
- 메뉴바/트레이에서 포트 상태를 glance로 확인한다.
- Kubernetes port-forward 세션을 만들고 끊고, 끊겼을 때 자동 재연결하도록 설정할 수 있다.
- Cloudflare Tunnel로 노출 중인 로컬 포트를 앱 안에서 확인한다.
- 중요한 포트는 Favorites나 Watched로 따로 관리한다.
- Windows에서는 포트 카드에 Address, PID, User가 보여 시스템 포트와 개발 서버를 구분하기 쉽다.

CLI 명령을 잘 아는 사람도 매번 명령을 떠올리는 것보다 빠른 순간이 있다. 특히 여러 로컬 서버, port-forward, tunnel을 동시에 켜두는 개발자라면 PortKiller가 작은 운영 패널 역할을 한다.

## 설치와 첫 사용법

macOS는 Homebrew cask 설치가 가장 간단하다. README와 Homebrew tap 기준 명령은 다음과 같다.

```bash
brew install --cask productdevbook/tap/portkiller
```

직접 설치하려면 GitHub Releases에서 최신 `PortKiller-v3.3.1-macos.dmg`를 내려받으면 된다. appcast에는 macOS 최소 버전이 15.0으로 표시되고, Homebrew cask도 Sequoia 이상을 요구한다.

Windows는 GitHub Releases에서 ZIP을 내려받아 압축을 풀고 실행하는 방식이다.

- `PortKiller-v3.3.1-windows-x64.zip`
- `PortKiller-v3.3.1-windows-arm64.zip`

Windows README 기준으로는 Windows 10 1809 이상 또는 Windows 11을 지원하고, 프로세스 종료를 위해 관리자 권한이 필요하다. 현재 Windows 프로젝트 파일은 `net9.0-windows`를 대상으로 하므로, 실행이 안 되면 .NET 9 Runtime 설치 여부를 먼저 확인하는 것이 좋다.

## Windows UI에서 보는 것

![PortKiller Windows UI](/images/tips/port-killer-windows.jpeg)

Windows 화면은 다크 테마의 포트 카드 목록에 가깝다. 왼쪽 사이드바에는 All Ports, Favorites, Watched, Web Server, Database, Development, System, Other 같은 필터가 있고, 중앙에는 현재 listening 중인 포트들이 카드로 표시된다.

각 카드에는 다음 정보가 나온다.

- 포트 번호
- 프로세스 이름
- 바인딩 주소
- PID
- 실행 사용자
- 종료 버튼

하단에는 현재 감지된 포트 수와 Auto-refresh 상태가 보인다. Windows 구현 문서에 따르면 포트 스캔은 `GetExtendedTcpTable` Win32 API를 사용하고, 프로세스 상세 정보는 WMI와 Windows token API를 통해 보강한다. 프로세스 종료는 먼저 `CloseMainWindow()`를 시도하고, 필요하면 `Process.Kill(entireProcessTree: true)`로 강제 종료한다.

## macOS에서는 어떻게 동작하나

macOS 구현은 SwiftUI 기반 메뉴바 앱이다. `Package.swift` 기준 macOS 15 이상, Swift 6 계열을 대상으로 하고, KeyboardShortcuts, Defaults, LaunchAtLogin, Sparkle 같은 의존성을 사용한다.

포트 스캔은 내부적으로 다음 계열의 시스템 정보를 읽는다.

```bash
lsof -iTCP -sTCP:LISTEN -P -n +c 0
```

프로세스 종료는 먼저 `SIGTERM`을 보내고, 살아 있으면 `SIGKILL`로 넘어가는 방식이다. 코드상 deep kill은 listening process뿐 아니라 해당 포트에 ESTABLISHED connection이 남아 있는 프로세스까지 찾아 종료하는 흐름을 갖는다.

이 구조 덕분에 macOS에서는 터미널 명령을 직접 입력하지 않아도 메뉴바에서 포트 검색, 개별 kill, Kill All, Kubernetes port-forward 중지, Cloudflare Tunnel 중지를 처리할 수 있다.

## Kubernetes와 Cloudflare Tunnel 관리

PortKiller가 단순 포트 종료 앱과 달라지는 지점은 Kubernetes와 Cloudflare Tunnel이다. README는 Kubernetes port-forward 세션을 만들고 관리하며, 연결이 끊어졌을 때 auto-reconnect, 연결 로그, connect/disconnect notification을 제공한다고 설명한다.

macOS 공식 화면에서도 K8s Port Forward 섹션에 네임스페이스와 서비스명이 보이고, 선택한 연결의 Port Mapping에서 Proxy, Local, Remote 포트 관계를 시각적으로 보여준다. 로그 영역에는 `kubectl Forwarding from ...` 같은 실제 포워딩 로그가 남는다.

Cloudflare Tunnel 쪽은 활성 tunnel 연결을 보고, tunnel 상태를 확인하고, 필요하면 중지하는 용도다. Windows 구현에는 `cloudflared.exe` 설치 경로를 탐색하고 프로세스를 시작·종료하는 서비스 코드도 포함되어 있다.

즉 PortKiller는 로컬 포트 목록만 보는 도구라기보다, “로컬 개발 서버를 외부/클러스터와 연결하는 포트 주변 작업”을 통합하려는 방향에 가깝다.

## 주의할 점

가장 중요한 주의점은 프로세스 종료 권한이다. PortKiller는 이름 그대로 포트를 점유한 프로세스를 끊는 도구다. 개발 서버나 남은 `node` 프로세스를 종료하는 데는 편하지만, 시스템 프로세스, 데이터베이스, Docker, 회사 VPN/보안 에이전트 같은 프로세스를 잘못 끊으면 작업 환경에 영향을 줄 수 있다.

특히 Windows README는 다음 한계를 명시한다.

- 프로세스 종료에는 관리자 권한이 필요하다.
- 시스템 프로세스는 의도적으로 종료할 수 없다.
- 현재 IPv6 지원은 제한적이며 IPv4 중심이다.
- 일부 프로세스는 force kill이 필요할 수 있다.

macOS에서도 `Kill All`이나 deep kill은 신중히 써야 한다. 어떤 포트에 물려 있는 프로세스인지 확인하지 않고 전체 종료를 누르면, 실행 중인 로컬 DB나 백그라운드 작업까지 같이 꺼질 수 있다.

또 하나는 플랫폼 경계다. README 배지는 macOS 15+와 Windows 10+를 명시하고, 저장소 구조도 `platforms/macos`, `platforms/windows`로 나뉜다. Linux용 앱은 현재 주요 지원 대상이 아니다. 이 블로그의 플랫폼 분류상 macOS 항목은 `macOS / Linux` 버킷에 들어가지만, 실제 사용 대상은 macOS와 Windows라고 보는 것이 맞다.

## 내 판단

PortKiller는 로컬 개발 서버와 포트 포워딩을 자주 다루는 사람에게 실용적인 도구다. `lsof`, `kill`, `netstat`, 작업 관리자, `kubectl port-forward` 상태 확인을 자주 오가는 사람이라면 꽤 빠르게 손에 붙을 수 있다.

추천 대상은 다음과 같다.

- 프론트엔드/dev server 포트 충돌을 자주 겪는 개발자
- `localhost:3000`, `5173`, `8000`, `8080` 같은 포트를 자주 바꾸는 사람
- Kubernetes port-forward를 여러 개 켜두는 백엔드/플랫폼 개발자
- Cloudflare Tunnel로 로컬 서비스를 임시 노출하는 개발자
- macOS 메뉴바나 Windows 트레이에서 포트 상태를 상시 확인하고 싶은 사람

반대로 포트 충돌을 거의 겪지 않거나, CLI 명령 몇 개로 충분한 사람에게는 과한 앱일 수 있다. 또한 회사 장비에서 프로세스 종료 도구를 쓰는 경우에는 관리자 권한, 보안 에이전트, 시스템 프로세스 정책과 충돌하지 않는지 먼저 확인하는 편이 안전하다.

내 기준에서는 “포트 충돌 해결 유틸리티”라기보다 “로컬 개발 네트워크 상태판”에 가깝다. 단순히 죽이는 기능보다 검색, 분류, watched port, port-forward/tunnel 관리까지 묶어둔 점이 좋다.

## 참고한 공개 자료

- [productdevbook/port-killer GitHub repository](https://github.com/productdevbook/port-killer)
- [PortKiller README](https://github.com/productdevbook/port-killer/blob/main/README.md)
- [PortKiller latest release v3.3.1](https://github.com/productdevbook/port-killer/releases/tag/v3.3.1)
- [PortKiller Homebrew cask](https://github.com/productdevbook/homebrew-tap/blob/main/Casks/portkiller.rb)
- [PortKiller appcast.xml](https://github.com/productdevbook/port-killer/blob/main/appcast.xml)
- [PortKiller Windows README](https://github.com/productdevbook/port-killer/blob/main/platforms/windows/README.md)
- [PortKiller contributing guide](https://github.com/productdevbook/port-killer/blob/main/CONTRIBUTING.md)
- [PortKiller macOS Package.swift](https://github.com/productdevbook/port-killer/blob/main/platforms/macos/Package.swift)
- [PortKiller license](https://github.com/productdevbook/port-killer/blob/main/LICENSE)
