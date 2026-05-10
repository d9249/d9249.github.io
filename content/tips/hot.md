---
title: "Hot은 Mac 발열과 스로틀링을 메뉴바에서 바로 보여준다"
date: "2026-05-10"
description: "Hot은 macOS 메뉴바에서 CPU 온도, Intel Mac의 CPU speed limit, Apple Silicon의 thermal pressure, 센서 그래프를 확인할 수 있는 오픈소스 유틸리티입니다."
author: "Sangmin Lee"
repository: "macmade/Hot"
sourceUrl: "https://github.com/macmade/Hot"
status: "Open source macOS utility"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "macOS"
  - "Menu Bar"
  - "Monitoring"
  - "CPU"
  - "Thermal"
  - "Swift"
highlights:
  - "macOS 메뉴바에 CPU 온도와 열 상태를 바로 표시해 고부하 작업 중 발열을 빠르게 확인할 수 있습니다."
  - "Intel Mac에서는 CPU speed limit, scheduler limit, available CPUs, CPU temperature를 보여주고, Apple Silicon에서는 thermal pressure 중심으로 표시합니다."
  - "공식 릴리스 ZIP과 Homebrew cask(`brew install --cask hot`)로 설치할 수 있는 작은 네이티브 메뉴바 앱입니다."
  - "Apple Silicon에서는 전체 센서 그래프 창을 열어 온도/전압/전류 센서를 검색하고 필터링할 수 있습니다."
  - "정밀 벤치마크 도구라기보다 '지금 발열 때문에 Mac이 느려지는지'를 빠르게 보는 상태 표시기로 쓰기 좋습니다."
draft: false
---

Hot은 Mac의 발열 상태를 메뉴바에서 바로 확인하는 작은 macOS 유틸리티다. 앱을 열어 두면 메뉴바에 CPU 온도나 열 상태가 표시되고, 드롭다운 메뉴에서 CPU 제한 상태와 그래프를 볼 수 있다.

핵심은 “온도 숫자”만이 아니다. Intel Mac에서는 열 때문에 CPU가 제한되는지 확인하기 위해 CPU speed limit, scheduler limit, available CPUs, CPU temperature를 보여준다. Apple Silicon에서는 Intel과 같은 제한 수치가 제공되지 않기 때문에 CPU temperature와 macOS의 thermal pressure를 중심으로 보여준다.

저장소는 Swift 기반의 공개 macOS 앱이고, 라이선스는 MIT다. 최신 GitHub release는 `1.9.4`이며, release asset으로 `Hot.zip`이 제공된다. Homebrew cask도 같은 `1.9.4` ZIP을 사용한다.

![Hot Intel menu](/images/tips/hot-intel-menu.png)

## Hot 개요

Hot은 macOS 메뉴바 앱이다. `Info.plist`에는 `LSUIElement`가 `true`로 설정되어 있어 일반 Dock 앱보다는 메뉴바 상태 앱처럼 동작한다. 앱 bundle identifier는 `com.xs-labs.Hot`이고, Xcode project의 `MACOSX_DEPLOYMENT_TARGET`은 `10.13`으로 설정되어 있다.

기본 사용 흐름은 단순하다.

1. Hot을 설치하고 실행한다.
2. 메뉴바에서 온도나 제한 상태를 본다.
3. 메뉴를 열어 CPU speed limit, scheduler limit, thermal pressure, 그래프, 센서 목록을 확인한다.
4. 필요하면 Preferences에서 표시 항목, Fahrenheit 변환, 메뉴바 아이콘 숨김, refresh interval, login item 등을 조정한다.

내부적으로는 Swift 앱에서 `IOHIDKit`, `SMCKit`, `pmset -g therm` 같은 macOS 시스템 정보를 읽는다. 소스의 `ThermalLog.swift`는 온도 센서를 읽고, Intel 계열에서는 `CPU_Scheduler_Limit`, `CPU_Available_CPUs`, `CPU_Speed_Limit` 값을 파싱한다. Apple Silicon 빌드에서는 `ProcessInfo.processInfo.thermalState`로 thermal pressure를 읽는다.

## Intel Mac에서는 speed limit을 본다

Intel Mac에서 Hot의 장점은 “CPU가 실제로 열 때문에 제한되고 있는가?”를 메뉴바에서 바로 볼 수 있다는 점이다. README에 따르면 Intel 버전은 다음 정보를 보여준다.

- CPU temperature
- CPU speed limit, 즉 throttling 상태
- scheduler limit
- number of available CPUs

기본 설정에서는 CPU speed limit이 60% 아래로 내려가면 메뉴바 텍스트를 주황색으로 표시한다. 예를 들어 무거운 빌드, 영상 인코딩, 로컬 LLM 추론, 게임, 외장 모니터 연결 상태에서 Mac이 갑자기 느려질 때 “CPU가 식어서 회복되길 기다려야 하는 상황인지” 빠르게 파악하기 좋다.

공식 Intel 스크린샷에서도 메뉴에 `Scheduler Limit`, `Available CPUs`, `Speed Limit`, `CPU Temperature`가 함께 표시된다. 일반적인 온도 앱보다 “성능 제한 여부”에 초점이 더 있다.

## Apple Silicon에서는 thermal pressure를 본다

![Hot Apple Silicon menu](/images/tips/hot-apple-silicon-menu.png)

Apple Silicon에서는 Intel Mac에서처럼 CPU speed limit과 scheduler limit을 같은 방식으로 표시할 수 없다. README도 이 차이를 명확히 적고 있다. Apple Silicon 버전은 CPU temperature와 함께 system thermal pressure를 보여준다.

스크린샷처럼 `Thermal Pressure: Nominal`이 보이면 macOS가 아직 열 상태를 정상 범위로 판단하고 있다는 뜻이다. 온도 숫자가 높아 보여도 thermal pressure가 nominal이면 당장 성능 제한으로 이어지는 상황은 아닐 수 있다. 반대로 pressure가 nominal이 아니면 메뉴바 텍스트가 주황색으로 바뀌도록 설계되어 있다.

즉 Apple Silicon 사용자는 Hot을 “CPU 온도계”로만 보기보다 “macOS가 현재 열 압박을 어떻게 판단하는지”를 함께 보는 도구로 쓰는 편이 좋다.

## 전체 센서 그래프

![Hot sensors](/images/tips/hot-sensors.png)

Hot은 메뉴바 드롭다운뿐 아니라 센서 그래프 창도 제공한다. README 기준으로 Apple Silicon에서는 모든 센서에 대한 graph view를 볼 수 있다.

Sensors 창은 카드형 그래프 UI로 구성된다. 각 센서마다 현재값, 최소값, 최대값, 최근 추이를 보여주고, 하단에서 검색과 필터를 사용할 수 있다.

- Search: 센서 이름으로 빠르게 찾기
- Temperature: 온도 센서만 보기
- Voltage: 전압 센서 보기
- Current: 전류 센서 보기
- Graph Style: 그래프 표현 방식 변경

일반 사용자는 메뉴바의 온도와 thermal pressure만으로 충분할 수 있다. 하지만 발열 문제를 더 자세히 보고 싶거나, 특정 센서가 이상한 값을 내는지 확인하고 싶다면 Sensors 창이 유용하다. 최신 릴리스 노트에도 센서 창 스크롤 crash 수정, 특정 센서 무시 기능, SMC calibration sensor 무시, 센서 필터 개선 같은 변경이 반복적으로 등장한다.

## 설치 방법

가장 편한 설치 방법은 Homebrew cask다.

```bash
brew install --cask hot
```

Homebrew cask는 GitHub release의 `Hot.zip`을 내려받고 `Hot.app`을 설치한다. cask 메타데이터에는 `auto_updates true`도 설정되어 있다.

GitHub Releases에서 직접 설치할 수도 있다.

```text
https://github.com/macmade/Hot/releases/latest
```

최신 release `1.9.4`의 asset은 `Hot.zip`이다. 이 버전의 release note는 센서 창에서 스크롤할 때 발생하던 crash 수정을 언급한다. 직전 `1.9.3`은 startup crash 수정, `1.9.2`는 macOS 14 Sonoma 표시/센서 crash 수정과 SMC calibration sensor 무시 등을 포함한다.

## 설정에서 먼저 볼 만한 것

Hot의 Preferences 쪽 소스와 README 기준으로 먼저 볼 만한 항목은 다음이다.

- CPU temperature 표시 여부
- scheduler limit 표시 여부
- CPU speed limit 또는 thermal pressure가 나빠질 때 텍스트를 주황색으로 표시할지
- Celsius/Fahrenheit 변환
- 자동 업데이트 확인
- 메뉴바 아이콘 숨김
- refresh interval
- start at login
- 사용할 폰트
- 특정 센서 선택/무시

특히 노치가 있는 MacBook이나 메뉴바 공간이 좁은 환경에서는 메뉴바 아이콘 숨김, 폰트, 표시 항목 조합을 조절하는 것이 좋다.

## 주의할 점

첫째, Hot은 macOS 전용이다. 이 블로그의 tips 플랫폼 분류상 가장 가까운 버킷이 `macos-linux`라 그렇게 분류했지만, 실제 앱은 macOS 메뉴바 앱이다. Windows나 Linux용 앱으로 이해하면 안 된다.

둘째, Intel과 Apple Silicon에서 보이는 정보가 다르다. Intel에서는 CPU speed limit과 scheduler limit이 핵심이고, Apple Silicon에서는 thermal pressure가 핵심이다. 두 화면을 같은 기준으로 비교하면 오해하기 쉽다.

셋째, 센서 값은 모델과 macOS 버전에 따라 다르게 보일 수 있다. Hot은 SMC/IOHID/macOS thermal state를 읽어 보여주는 도구라서, 모든 Mac에서 같은 센서 이름과 같은 정확도를 기대하기보다는 “상태 변화를 보는 도구”로 생각하는 편이 안전하다.

넷째, 최신 릴리스는 2024년 7월의 `1.9.4`다. 저장소는 archived 상태가 아니고 README는 active badge를 달고 있으며 Homebrew cask도 유지되고 있지만, 매우 빠르게 기능이 추가되는 앱이라기보다는 안정된 단일 목적 유틸리티에 가깝다.

## 어떤 사람에게 잘 맞나

Hot은 다음 사용자에게 잘 맞는다.

- MacBook에서 빌드, 인코딩, 게임, 로컬 AI 작업 중 발열을 자주 확인하는 사람
- Intel Mac에서 thermal throttling 여부를 숫자로 보고 싶은 사람
- Apple Silicon에서 thermal pressure 상태를 메뉴바에서 바로 보고 싶은 사람
- 팬 소음이나 성능 저하가 발열 때문인지 빠르게 확인하고 싶은 사람
- 무거운 모니터링 대시보드보다 작은 메뉴바 앱을 선호하는 사람

반대로 장기간 로그 저장, 알림 라우팅, 원격 모니터링, Prometheus/Grafana 연동이 필요하다면 Hot은 목적이 다르다. 이 앱은 “지금 내 Mac이 뜨겁고 제한되고 있는가?”를 즉시 보는 도구다.

## 내 판단

Hot은 Mac 사용자에게 꽤 실용적인 메뉴바 앱이다. 특히 Intel Mac을 아직 쓰고 있다면 CPU speed limit이 100% 아래로 떨어지는 순간을 바로 볼 수 있어 체감 성능 저하의 원인을 파악하기 쉽다. Apple Silicon에서도 온도와 thermal pressure를 함께 볼 수 있으므로, 고부하 작업 중 상태 확인용으로 유용하다.

다만 이 앱을 정밀한 하드웨어 진단 도구처럼 쓰기보다는, 메뉴바에 늘 켜 두는 가벼운 열 상태 표시기로 보는 것이 맞다. 설치도 Homebrew cask 한 줄이면 되므로, MacBook이 자주 뜨거워지는 사용자라면 한 번쯤 깔아볼 만하다.

## 참고한 공개 자료

- [macmade/Hot GitHub repository](https://github.com/macmade/Hot)
- [Hot README](https://github.com/macmade/Hot/blob/main/README.md)
- [Hot latest release](https://github.com/macmade/Hot/releases/latest)
- [Homebrew Cask: hot](https://formulae.brew.sh/cask/hot)
- [Homebrew cask source for hot](https://github.com/Homebrew/homebrew-cask/blob/master/Casks/h/hot.rb)
