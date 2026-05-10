---
title: "Scroll Reverser는 마우스와 트랙패드 스크롤 방향을 따로 고치는 macOS 유틸리티다"
date: "2026-05-10T22:23:13"
description: "Scroll Reverser는 macOS에서 트랙패드와 마우스, 특히 휠 마우스의 스크롤 방향을 독립적으로 반전하고 단계 크기까지 조정할 수 있는 오픈소스 메뉴바 유틸리티다."
author: "Sangmin Lee"
repository: "pilotmoon/Scroll-Reverser"
sourceUrl: "https://pilotmoon.com/scrollreverser/"
status: "Open source macOS utility"
license: "Apache-2.0"
platforms:
  - "macos-linux"
tags:
  - "macOS"
  - "Mouse"
  - "Trackpad"
  - "Productivity"
  - "Utility"
highlights:
  - "macOS의 Natural Scrolling 설정 위에서 트랙패드와 마우스의 스크롤 방향을 독립적으로 바꾼다."
  - "휠 마우스를 감지하면 스크롤 가속 대신 고정 줄 단위로 움직이는 step size control을 제공한다."
  - "최신 1.9는 macOS 13.5 이상을 요구하지만, 공식 사이트에서 macOS 10.12~12와 더 오래된 OS X용 빌드도 제공한다."
  - "스크롤 이벤트를 가로채는 앱이므로 Accessibility와 Input Monitoring 권한 범위를 이해하고 써야 한다."
draft: false
---

`Scroll Reverser`는 macOS에서 마우스와 트랙패드의 스크롤 방향을 따로 설정하게 해주는 오래된, 하지만 여전히 실용적인 메뉴바 유틸리티다. Apple의 “자연스러운 스크롤” 설정은 시스템 전체에 적용되기 때문에 트랙패드는 자연스럽게 두고, 일반 휠 마우스만 예전 방향으로 쓰고 싶은 사람에게 특히 잘 맞는다.

공식 사이트 기준 최신 버전은 `1.9`이고, 2024년 6월 릴리스에서 macOS 13.5 이상, Intel과 Apple Silicon을 지원한다. 소스는 GitHub에 공개되어 있으며 라이선스는 Apache-2.0이다.

![Scroll Reverser overview](/images/tips/scroll-reverser-og.png)

## 어떤 문제를 풀어주나

가장 흔한 사용 사례는 이렇다.

- macOS System Settings에서는 `Natural Scrolling`을 켠다.
- Scroll Reverser에서는 `Reverse Trackpad`를 끈다.
- Scroll Reverser에서는 `Reverse Mouse`를 켠다.

이렇게 하면 트랙패드 제스처는 macOS 기본 감각대로 유지하면서, 휠 마우스만 “휠을 아래로 굴리면 페이지가 아래로 간다”는 전통적인 방향으로 맞출 수 있다. 반대로 설정할 수도 있지만, 공식 FAQ는 이 조합이 제스처 감각을 덜 망가뜨린다고 설명한다.

![Scroll Reverser preferences](/images/tips/scroll-reverser-preferences.png)

환경설정 화면은 매우 단순하다. `Enable Scroll Reverser`로 전체 동작을 켜고, 축은 `Reverse Vertical`과 `Reverse Horizontal`로 나뉘며, 입력 장치는 `Reverse Trackpad`와 `Reverse Mouse`로 분리된다. Magic Mouse도 마우스 쪽 설정에 포함된다.

## 휠 마우스 step size control

Scroll Reverser는 단순히 델타 부호만 뒤집는 앱이 아니다. 공식 사이트는 휠 마우스 사용자에게 `step size control`을 제공한다고 설명한다. 앱이 비연속 스크롤, 보통 물리 휠 마우스 입력을 감지하면 step size slider를 보여주고, 스크롤 가속 대신 휠 한 칸마다 고정된 줄 수만큼 움직이게 할 수 있다.

소스의 `MouseTap.m`도 이 설계를 잘 보여준다. 앱은 scroll wheel event와 gesture event를 event tap으로 받아서, 연속 스크롤인지, 두 손가락 이상이 트랙패드에 닿았는지, 최근 touch event가 있었는지를 보고 마우스와 트랙패드를 구분한다. 이후 `ReverseTrackpad`, `ReverseMouse`, `ReverseY`, `ReverseX` 설정에 따라 scroll delta를 조정한다.

## 설치와 버전 선택

최신 macOS라면 공식 사이트의 zip 또는 Homebrew를 쓰면 된다.

```bash
brew install scroll-reverser
```

공식 설치 방법은 zip을 풀고 `Scroll Reverser.app`을 Applications 폴더로 옮기는 방식이다. Homebrew cask metadata도 `ScrollReverser-1.9.zip`을 가리키며, 앱 제거 시 지울 수 있는 설정·캐시 경로로 다음을 제시한다.

```text
~/Library/Preferences/com.pilotmoon.scroll-reverser.plist
~/Library/Caches/com.pilotmoon.scroll-reverser/
```

사용자가 보내준 `#older-versions` 섹션이 특히 중요한 이유는 최신 버전의 요구 OS가 꽤 높기 때문이다. 공식 사이트의 구버전 안내는 다음처럼 나뉜다.

- `1.9`: macOS 13.5 이상, Intel / Apple Silicon
- `1.8.2`: macOS 10.12—12, Intel / Apple Silicon
- `1.7.6`: OS X 10.7—10.11, Intel
- `1.5.1`: OS X 10.4 PowerPC, OS X 10.5—10.6 Intel 32/64-bit

오래된 맥에서 “스크롤 방향만 분리하고 싶다”면 임의의 미러보다 공식 Older Version Downloads에서 맞는 빌드를 고르는 편이 안전하다.

## 권한과 동작 방식

Scroll Reverser는 전역 스크롤 이벤트를 수정해야 하므로 macOS 권한과 직접 맞닿아 있다. README는 핵심 로직이 `MouseTap.m`에 있으며 event tap을 설치해 scrolling event와 gesture event를 관찰한다고 설명한다. 소스에서는 `CGEventTapCreate`로 gesture를 listen-only로 보고, scroll wheel event는 수정 가능한 active tap으로 처리한다.

그래서 최신 macOS에서는 다음 권한이 중요하다.

- **Accessibility**: macOS Mojave 10.14 이상에서 필요하다. 소스는 `AXIsProcessTrustedWithOptions`로 상태를 확인하고 prompt를 띄운다.
- **Input Monitoring**: macOS Catalina 10.15 이상에서 필요하다. 소스는 `IOHIDRequestAccess(kIOHIDRequestTypeListenEvent)`와 `IOHIDCheckAccess`를 사용한다.
- **Applications 폴더 위치**: 공식 FAQ는 enable이 되지 않을 때 앱을 Applications 폴더에 두고 Accessibility 목록에서 제거 후 다시 추가하라고 안내한다.

이 권한들은 “화면 녹화”나 “네트워크 계정 접근”과는 다르지만, 입력 이벤트를 관찰·수정하는 권한이라는 점에서 가볍게 넘길 종류는 아니다. 회사 장비나 보안 정책이 엄격한 환경에서는 승인 가능한 유틸리티인지 먼저 확인하는 편이 좋다.

## 한계도 명확하다

Scroll Reverser가 뒤집는 것은 scroll event이지 모든 제스처가 아니다. 공식 FAQ는 swipe gesture 자체를 반전할 수 없다고 못박는다. iPhone Mirroring이나 Calendar처럼 gesture 기반의 커스텀 스크롤 UI를 쓰는 앱에서도 기대처럼 동작하지 않을 수 있다.

또 하나의 예외는 remote desktop 환경이다. 로컬과 원격 양쪽에서 Scroll Reverser가 동시에 돌면 방향이 꼬일 수 있다. 공식 사이트는 원격 머신에서 다음 설정을 적용한 뒤 앱을 재시작하는 우회책을 제시한다.

```bash
defaults write com.pilotmoon.scroll-reverser ReverseOnlyRawInput -bool YES
```

## 내 판단

Scroll Reverser는 기능이 넓은 마우스 튜닝 앱이라기보다, “트랙패드는 자연 스크롤, 마우스 휠은 클래식 스크롤”이라는 딱 한 가지 불편을 안정적으로 해결하는 도구다. LinearMouse, Mac Mouse Fix, MOS처럼 더 많은 마우스 기능을 다루는 대안도 있지만, 스크롤 방향 분리만 필요하다면 Scroll Reverser의 단순함이 장점이다.

다만 macOS 전역 입력 이벤트를 다루는 앱이므로 처음 설치할 때 Accessibility와 Input Monitoring 권한을 왜 요구하는지 이해하고 켜는 것이 좋다. 최신 macOS 사용자는 1.9를, 구형 맥은 공식 older versions 섹션에서 OS에 맞는 빌드를 선택하는 쪽을 추천한다.

## 참고한 공개 자료

- [Scroll Reverser 공식 사이트](https://pilotmoon.com/scrollreverser/)
- [Scroll Reverser older version downloads](https://pilotmoon.com/scrollreverser/#older-versions)
- [pilotmoon/Scroll-Reverser GitHub repository](https://github.com/pilotmoon/Scroll-Reverser)
- [Scroll Reverser 1.9 GitHub Release](https://github.com/pilotmoon/Scroll-Reverser/releases/tag/v1.9)
- [Homebrew cask metadata: scroll-reverser](https://formulae.brew.sh/cask/scroll-reverser)
