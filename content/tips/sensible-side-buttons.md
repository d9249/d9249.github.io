---
title: "SensibleSideButtons는 Mac 마우스 사이드 버튼을 진짜 뒤로/앞으로 버튼처럼 바꾼다"
date: "2026-05-10"
description: "SensibleSideButtons는 macOS에서 일반 마우스의 M4/M5 사이드 버튼을 앱별 키보드 단축키가 아니라 네이티브 페이지 이동 제스처처럼 동작하게 만드는 오픈소스 메뉴바 유틸리티입니다."
author: "Sangmin Lee"
repository: "archagon/sensible-side-buttons"
sourceUrl: "https://github.com/archagon/sensible-side-buttons"
status: "Open source"
license: "GPL-2.0"
platforms:
  - "macos-linux"
tags:
  - "macOS"
  - "Menu Bar"
  - "Mouse"
  - "Productivity"
highlights:
  - "macOS에서 일반 마우스 M4/M5 버튼을 뒤로/앞으로 이동으로 바꿔주는 메뉴바 앱입니다."
  - "⌘+[ / ⌘+] 단축키를 보내는 대신 3-finger swipe 계열 이벤트를 흉내 내어 커서 아래 뷰에 더 자연스럽게 적용합니다."
  - "Accessibility 권한이 필요하며 메뉴에서 Enabled, Trigger on Mouse Down, Swap Buttons를 조정할 수 있습니다."
  - "최신 GitHub Release가 2018년 v1.0.6이라 최신 macOS에서는 설치·권한 동작을 직접 확인하고 쓰는 편이 좋습니다."
draft: false
---

macOS에서 일반 마우스의 옆 버튼을 눌렀을 때 기대하는 동작은 보통 단순합니다. 아래쪽 버튼은 뒤로 가기, 위쪽 버튼은 앞으로 가기입니다. Windows에서는 익숙한 흐름이지만, macOS에서는 많은 서드파티 마우스의 M4/M5 버튼이 애매한 중간 클릭처럼 처리되거나 앱마다 제각각 반응합니다.

SensibleSideButtons는 이 작은 불편을 매우 좁게 해결하는 메뉴바 유틸리티입니다. 핵심은 마우스 사이드 버튼을 `⌘+[` / `⌘+]` 같은 키보드 단축키로 매핑하는 대신, macOS의 페이지 이동 스와이프에 가까운 이벤트를 만들어 Safari, Finder, Xcode 문서, 여러 히스토리 기반 창에서 더 자연스러운 뒤로/앞으로 이동을 시도한다는 점입니다.

![SensibleSideButtons가 동작하는 macOS 예시 화면](/images/tips/sensible-side-buttons-app.jpg)

## SensibleSideButtons 개요

SensibleSideButtons는 `archagon/sensible-side-buttons` 저장소에서 공개된 macOS 전용 오픈소스 앱입니다. GitHub 설명 그대로, 서드파티 마우스의 사이드 버튼에 시스템 전역 내비게이션 기능을 부여하는 메뉴바 앱입니다.

공식 README의 요지는 명확합니다. macOS는 일반적으로 M4/M5 마우스 버튼을 거의 무시하고, 다른 앱으로 `⌘+[` / `⌘+]`를 보내는 방식은 일부 앱에서만 그럭저럭 동작하며 어색합니다. 이 앱은 사이드 버튼 클릭을 3-finger swipe 계열 동작처럼 시뮬레이션해서 히스토리가 있는 거의 모든 창을 이동할 수 있게 만드는 것을 목표로 합니다.

저장소 기준으로 구현은 Objective-C/C 중심의 네이티브 macOS 앱입니다. 앱 번들 식별자는 `net.archagon.sensible-side-buttons`이고, Xcode 프로젝트의 배포 타깃은 macOS 10.10으로 설정되어 있습니다. 공식 웹사이트의 다운로드 버튼도 `For macOS 10.10+`라고 안내합니다.

## 왜 단축키 매핑보다 낫나

마우스 사이드 버튼을 키보드 단축키로 바꾸는 방법은 흔합니다. Logitech Options, USB Overdrive 같은 도구에서 M4/M5를 `⌘+[` / `⌘+]`에 묶으면 브라우저에서는 어느 정도 동작합니다. 하지만 이 방식은 전면 앱 전체에 키보드 이벤트를 보내는 셈이라 몇 가지 문제가 남습니다.

- 커서가 올라간 창이 아니라 현재 포커스된 앱/창으로 명령이 갈 수 있습니다.
- 메뉴바가 깜빡이거나 경고음이 날 수 있습니다.
- 앱마다 같은 단축키가 다른 의미로 쓰일 수 있습니다.
- Finder, 문서 뷰, 개발 도구처럼 여러 히스토리 영역이 있는 앱에서 예측이 어려울 수 있습니다.

SensibleSideButtons는 이 문제를 피하려고 M4/M5 이벤트를 잡아 기존 이벤트는 삼키고, 대신 macOS의 스와이프 내비게이션에 가까운 이벤트를 보냅니다. 공식 웹사이트 설명에 따르면 이 방식은 커서 아래 뷰에 더 직접적으로 적용되고, 키보드 단축키 오작동 위험을 줄이는 쪽에 초점을 둡니다.

## 메뉴바에서 조용히 켜두는 구조

SensibleSideButtons는 큰 설정 창을 열어두는 앱이 아니라 메뉴바에 상주하는 작은 유틸리티입니다. 실행 중이면 메뉴바 아이콘으로 상태를 확인하고, 필요할 때 메뉴에서 켜고 끌 수 있습니다.

![SensibleSideButtons 메뉴바 아이콘](/images/tips/sensible-side-buttons-menubar.png)

소스의 `AppDelegate.m` 기준 메뉴에는 다음 옵션이 있습니다.

- `Enabled`: 사이드 버튼 변환 기능 켜기/끄기
- `Trigger on Mouse Down`: 버튼을 누르는 순간 트리거할지 여부
- `Swap Buttons`: 뒤로/앞으로 버튼 방향 바꾸기
- `Hide Menu Bar Icon`: macOS 10.12 이상에서 메뉴바 아이콘 숨기기
- `Open Accessibility Whitelist`: 권한 설정 안내
- `Quit`: 앱 종료

즉, 복잡한 프로파일 매니저라기보다 “마우스 사이드 버튼만 제대로 고치자”에 가까운 단일 목적 앱입니다. 이 점이 오히려 장점입니다. 앱별 매핑을 만들고 관리해야 하는 도구가 부담스러운 사람에게는 훨씬 가볍습니다.

## 설치와 첫 사용법

공식 배포 경로는 GitHub Releases의 DMG 파일입니다. 최신 릴리스는 `1.0.6`이며, 릴리스 자산으로 `SensibleSideButtons-1.0.6.dmg`가 제공됩니다. Homebrew Formula/Cask는 확인되지 않았습니다.

설치 흐름은 대략 다음과 같습니다.

1. [GitHub Releases](https://github.com/archagon/sensible-side-buttons/releases)에서 최신 DMG를 내려받습니다.
2. `SensibleSideButtons.app`을 Applications 폴더로 옮깁니다.
3. 앱을 실행합니다.
4. macOS가 요구하면 시스템 설정의 Accessibility 권한 목록에 앱을 추가합니다.
5. 메뉴바 아이콘에서 `Enabled` 상태를 확인합니다.
6. 브라우저, Finder, 문서 뷰 등에서 마우스 M4/M5 버튼을 눌러 뒤로/앞으로 동작을 확인합니다.

앱은 전역 마우스 이벤트를 처리해야 하므로 Accessibility 권한이 핵심입니다. 소스에서도 `AXIsProcessTrustedWithOptions`로 Accessibility 신뢰 상태를 확인하고, 권한이 없으면 메뉴 항목을 비활성화하면서 Accessibility 패널을 열도록 안내합니다.

## 동작 원리: M4/M5를 스와이프 이벤트로 치환

구현을 보면 이 앱의 범위가 꽤 선명합니다. `CGEventTapCreate`로 `kCGEventOtherMouseUp`과 `kCGEventOtherMouseDown` 이벤트를 관찰하고, `kCGMouseEventButtonNumber`가 M4/M5에 해당하면 원래 이벤트를 `NULL`로 반환해 삼킵니다. 그 대신 `tl_CGEventCreateFromGesture`로 만든 좌우 스와이프 이벤트를 `CGEventPost(kCGHIDEventTap, ...)`로 보냅니다.

공식 웹사이트는 이 기술적 배경을 macOS의 트랙패드 페이지 이동 제스처와 연결해 설명합니다. 아래 이미지는 SensibleSideButtons 자체의 설정 화면이 아니라, 공식 설명에 등장하는 macOS 트랙패드의 “Swipe between pages” 설정 예시입니다.

![macOS 트랙패드의 페이지 쓸어넘기기 설정](/images/tips/sensible-side-buttons-trackpad-settings.png)

이 차이가 중요합니다. 단순히 키보드 단축키를 보내는 앱이 아니라, macOS가 이미 갖고 있는 페이지 이동 제스처의 성격을 일반 마우스 사이드 버튼에 빌려오는 방식입니다.

## 활용 포인트

SensibleSideButtons가 특히 잘 맞는 경우는 다음과 같습니다.

- Logitech MX Master류가 아닌 일반 마우스에서도 브라우저 뒤로/앞으로 버튼을 자연스럽게 쓰고 싶을 때
- Safari, Finder, 문서 뷰, 개발 문서처럼 히스토리 기반 화면을 자주 오갈 때
- `⌘+[` / `⌘+]` 매핑에서 메뉴바 깜빡임, 경고음, 포커스 오작동이 거슬릴 때
- 마우스 제조사 드라이버를 설치하지 않고 작은 네이티브 유틸리티로만 해결하고 싶을 때
- 앱별 버튼 매핑보다 “뒤로/앞으로만 제대로”라는 좁은 해결책이 더 마음에 들 때

반대로 마우스 버튼마다 앱별 액션을 다르게 지정하고 싶다면 이 앱은 너무 단순할 수 있습니다. 그 경우에는 BetterTouchTool, SteerMouse, USB Overdrive, Karabiner 계열 도구가 더 넓은 선택지를 제공합니다.

## 주의할 점

가장 큰 주의점은 유지보수와 최신 macOS 호환성입니다. GitHub 최신 릴리스는 2018년에 올라온 `1.0.6`이고, 저장소 자체는 이후에도 일부 push 이력이 있지만 배포판은 오래되었습니다. macOS 보안 모델과 Gatekeeper, Accessibility 권한 UX는 계속 바뀌었기 때문에, 최신 macOS에서 바로 문제없이 동작한다고 단정하기보다는 직접 테스트하는 편이 안전합니다.

또한 이 앱은 전역 마우스 이벤트를 처리하기 위해 Accessibility 권한이 필요합니다. 기능상 자연스러운 요구이지만, 회사 장비나 보안 정책이 엄격한 환경에서는 설치 전에 소스와 권한 범위를 확인해야 합니다.

라이선스는 GitHub API와 저장소 라이선스 기준 GPL-2.0입니다. 내부 배포나 수정 배포를 고려한다면 GPL 조건을 확인해야 합니다.

마지막으로, 공식 웹사이트의 설명과 이미지가 구형 macOS UI를 기준으로 작성되어 있습니다. 개념은 여전히 이해하기 쉽지만, 최신 macOS의 시스템 설정 화면 경로와 UI는 이미지와 다를 수 있습니다.

## 내 판단

SensibleSideButtons는 “작지만 정확한 불편”을 겨냥한 좋은 macOS 유틸리티입니다. 일반 마우스를 Mac에 연결했을 때 사이드 버튼이 예상대로 뒤로/앞으로 동작하지 않아 답답했다면, 이 앱은 가장 먼저 떠올려볼 만한 해결책입니다.

다만 2026년에 새로 설치한다면 추천 방식은 조심스럽습니다. 오픈소스이고 구현이 단순하다는 점은 장점이지만, 최신 릴리스가 오래되었고 Accessibility 권한이 필요합니다. 개인 장비에서 가볍게 테스트해보고, 잘 맞으면 로그인 항목에 넣어 쓰는 정도가 적당합니다. 업무용 보안 장비라면 더 최신 유지보수 상태의 대안과 함께 비교해보는 편이 좋습니다.

## 참고한 공개 자료

- [archagon/sensible-side-buttons GitHub repository](https://github.com/archagon/sensible-side-buttons)
- [SensibleSideButtons official website](https://sensible-side-buttons.archagon.net/)
- [SensibleSideButtons Releases](https://github.com/archagon/sensible-side-buttons/releases)
- [SensibleSideButtons README](https://github.com/archagon/sensible-side-buttons/blob/master/README.md)
- [SensibleSideButtons source: AppDelegate.m](https://github.com/archagon/sensible-side-buttons/blob/master/SideButtonFixer/AppDelegate.m)
