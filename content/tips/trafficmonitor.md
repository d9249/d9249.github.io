---
title: "TrafficMonitor는 Windows 작업표시줄에 네트워크·CPU·메모리를 붙여두는 경량 모니터다"
date: "2026-05-10T23:14:52"
description: "TrafficMonitor는 Windows에서 현재 업로드·다운로드 속도, CPU·메모리·GPU·디스크 사용률을 플로팅 창이나 작업표시줄에 작게 붙여두는 소스 공개 모니터링 유틸리티다."
author: "Sangmin Lee"
repository: "zhongyang219/TrafficMonitor"
sourceUrl: "https://github.com/zhongyang219/TrafficMonitor"
status: "Source available Windows utility"
license: "Anti-996 License 1.0"
platforms:
  - "winos"
tags:
  - "Windows"
  - "Monitoring"
  - "Taskbar"
  - "Network"
  - "Utility"
highlights:
  - "Windows 작업표시줄이나 작은 플로팅 창에 업로드·다운로드 속도, CPU, 메모리, GPU, 디스크 사용률을 계속 표시한다."
  - "V1.86 기준 x86, x64, ARM64EC ZIP 빌드를 제공하며, 온도 모니터링이 필요 없다면 관리자 권한이 필요 없는 Lite판이 기본 선택지에 가깝다."
  - "표시 항목, 색상, 폰트, 단위, 다크·라이트 테마 대응, 스킨을 세밀하게 바꿀 수 있어 데스크톱 상주 위젯으로 쓰기 좋다."
  - "라이선스는 GitHub가 Other로 분류하는 Anti-996 License라서 재배포·상업 활용 전에는 조직 정책 확인이 필요하다."
  - "온도 모니터링과 플러그인은 시스템 안정성·신뢰 경계와 맞닿으므로 필요한 기능만 켜는 편이 안전하다."
draft: false
---

`TrafficMonitor`는 Windows에서 네트워크 속도와 시스템 사용률을 계속 보고 싶은 사람을 위한 데스크톱 유틸리티다. 작은 플로팅 창을 띄우거나 작업표시줄 안에 업로드·다운로드 속도, CPU, 메모리 같은 지표를 넣어두는 방식이라, 별도 대시보드 창을 열지 않아도 현재 상태를 바로 확인할 수 있다.

프로젝트는 C++ 기반 Windows 앱이고, GitHub 저장소는 2017년부터 이어져 왔다. 공개 저장소 기준으로 최신 릴리스는 `V1.86`이며, `x86`, `x64`, `ARM64EC` ZIP 파일과 Lite 빌드를 함께 제공한다. 설치형 앱이라기보다는 ZIP을 내려받아 실행하는 휴대용 유틸리티에 가깝다.

![TrafficMonitor right click menu](/images/tips/trafficmonitor-menu.png)

## 무엇을 보여주나

핵심은 “작게, 계속, 내가 원하는 항목만”이다. README가 설명하는 기본 기능은 다음에 가깝다.

- 현재 업로드·다운로드 속도 표시
- CPU와 메모리 사용률 표시
- 여러 네트워크 어댑터 중 자동 또는 수동 선택
- 네트워크 연결 상세 정보 확인
- 작업표시줄 내장 표시
- 일/주 단위에 가까운 역사적 트래픽 통계
- 스킨 교체와 직접 스킨 제작
- 플러그인 시스템

플로팅 창은 오른쪽 클릭 메뉴가 중심이다. 여기에서 네트워크 연결 선택, 연결 상세 정보, 항상 위에 표시, 마우스 통과, 창 위치 잠금, 알림 영역 아이콘 표시, 작업표시줄 창 표시, 옵션, 도움말 같은 기능을 바로 열 수 있다.

## 작업표시줄에 붙여두는 흐름

TrafficMonitor는 기본적으로 플로팅 창을 띄우지만, 실제로 오래 쓰게 되는 지점은 작업표시줄 창이다. 플로팅 창 또는 트레이 아이콘을 오른쪽 클릭한 뒤 `Show Taskbar Window`를 켜면 작업표시줄 안에 작은 모니터가 들어간다.

![TrafficMonitor taskbar display settings](/images/tips/trafficmonitor-taskbar-settings.png)

작업표시줄 표시 항목은 `Display Settings`에서 고른다. 업로드, 다운로드, CPU 사용률, 메모리 사용률, CPU 온도, 전체 속도, CPU 주파수, 전체 트래픽 같은 항목을 체크박스로 켜고 끌 수 있고, 항목 순서도 조정할 수 있다. 그래서 “네트워크 속도만 보고 싶다”와 “CPU·메모리·온도까지 작은 시스템 모니터처럼 보고 싶다”를 같은 도구 안에서 모두 처리할 수 있다.

## 설치와 버전 선택

공식 설치 경로는 GitHub Releases의 ZIP 파일이다. 최신 릴리스 페이지에는 다음 계열이 나뉘어 올라온다.

- `TrafficMonitor_V1.86_x64.zip`
- `TrafficMonitor_V1.86_x64_Lite.zip`
- `TrafficMonitor_V1.86_x86.zip`
- `TrafficMonitor_V1.86_x86_Lite.zip`
- `TrafficMonitor_V1.86_arm64ec.zip`
- `TrafficMonitor_V1.86_arm64ec_Lite.zip`

실사용에서는 먼저 `x64_Lite`를 보는 편이 무난하다. README 기준으로 표준판은 모든 기능을 포함하지만 관리자 권한이 필요하고, Lite판은 온도 모니터링을 제외한 경량 버전이다. 특히 `V1.86`부터는 Lite판도 GPU와 디스크 사용률 표시를 제공하며, 앞으로 TrafficMonitor 본체의 온도 모니터링 기능은 더 이상 유지하지 않고 별도 하드웨어 모니터링 플러그인으로 옮기는 방향이라고 설명한다.

| 구분 | 표준판 | Lite판 |
| --- | --- | --- |
| 네트워크 속도 | 지원 | 지원 |
| CPU·메모리 | 지원 | 지원 |
| GPU·디스크 사용률 | 지원 | V1.86부터 지원 |
| 온도 모니터링 | 지원 | 미지원, 플러그인 권장 |
| 플러그인 시스템 | 지원 | 지원 |
| 관리자 권한 | 필요 | 불필요 |

실행 시 `MSVC*.dll`을 찾을 수 없다는 오류가 나오면 Microsoft Visual C++ Redistributable을 설치해야 한다. 중국 내 다운로드 속도를 고려한 Gitee와 Baidu Netdisk 링크도 README에 함께 제공된다.

## 커스터마이즈 폭이 넓다

TrafficMonitor의 장점은 단순히 숫자를 보여주는 데서 끝나지 않는다는 점이다. 옵션 화면에서 작업표시줄 텍스트의 폰트, 크기, 색상, 배경 투명도, 상태바 색상, 업로드·다운로드 라벨, 단위 표기, 좌우 정렬, 다크·라이트 테마 자동 대응을 꽤 세밀하게 바꿀 수 있다.

![TrafficMonitor option settings](/images/tips/trafficmonitor-options.jpg)

스킨 시스템도 오래 유지된 기능이다. 기본 스킨 외에 별도 스킨 저장소에서 더 많은 스킨을 받을 수 있고, `skins` 디렉터리 아래에 스킨별 폴더를 두는 방식으로 관리한다. 스킨은 `background.bmp`, `background_l.bmp`, `skin.ini` 같은 파일로 구성되며, 최근 버전에서는 투명 PNG 배경과 `skin.xml` 기반 설정도 지원한다.

![TrafficMonitor skin examples](/images/tips/trafficmonitor-skins.png)

## 플러그인과 하드웨어 모니터링

`V1.82`부터는 플러그인 시스템이 들어갔다. 플러그인 DLL은 `TrafficMonitor.exe`와 같은 위치의 `plugins` 디렉터리에 두고, 앱 시작 시 자동 로드된다. 플러그인 관리는 오른쪽 클릭 메뉴의 `More Functions` 또는 옵션의 고급 설정 쪽에서 접근한다.

여기서 주의할 점은 하드웨어 모니터링이다. TrafficMonitor는 온도·GPU·디스크 같은 하드웨어 정보를 얻기 위해 LibreHardwareMonitor 계열을 사용해 왔고, README와 FAQ는 온도 모니터링 기능이 CPU·메모리를 더 쓰거나 일부 환경에서 앱/시스템 불안정으로 이어질 수 있다고 명시한다. 실제로 FAQ는 충돌 문제가 생기면 먼저 하드웨어 모니터링 항목을 모두 끄고, 그 다음 플러그인을 비활성화해 보라고 안내한다.

따라서 “작업표시줄에 네트워크 속도와 CPU·메모리만 표시”가 목적이라면 Lite판으로 시작하고, 온도까지 꼭 필요할 때만 별도 하드웨어 모니터링 플러그인을 검토하는 편이 안전하다.

## 주의할 점

첫째, Windows 전용 도구다. 저장소와 릴리스는 `x86`, `x64`, `ARM64EC` Windows 빌드를 중심으로 제공되며, macOS나 Linux용 앱은 아니다.

둘째, 라이선스가 일반적인 MIT/Apache/BSD가 아니다. GitHub API는 이 저장소의 라이선스를 `Other`로 분류하고, 실제 파일은 `Anti-996 License Version 1.0`이다. 개인 사용에는 큰 문제가 없을 수 있지만, 회사 장비에 배포하거나 제품/이미지에 포함하려면 라이선스 조건을 별도로 검토해야 한다.

셋째, 표준판과 Lite판의 권한 모델이 다르다. 표준판은 관리자 권한을 요구하고, Lite판은 관리자 권한 없이 실행하는 쪽에 맞춰져 있다. 자동 실행 방식도 버전에 따라 레지스트리 `Run` 키 또는 작업 스케줄러를 사용하므로, 앱 위치를 옮기면 자동 실행이 깨질 수 있다.

넷째, 플러그인은 DLL을 앱 프로세스에 로드하는 구조다. 공식 플러그인 저장소나 신뢰할 수 있는 출처의 플러그인만 사용하고, 문제가 생기면 `plugins` 폴더의 DLL을 비활성화하는 식으로 원인을 분리하는 편이 좋다.

## 내 판단

TrafficMonitor는 “Windows 작업표시줄에 네트워크 속도와 자원 사용량을 계속 붙여두고 싶다”는 요구에 잘 맞는다. Windows의 기본 작업 관리자나 위젯은 순간 확인에는 좋지만, 상시 표시와 작업표시줄 통합, 스킨, 항목별 색상·단위 설정까지 한 번에 해결해 주지는 않는다.

반대로 온도·센서 정보까지 모두 정확히 보고 싶은 하드웨어 진단 도구로 접근하면 기대와 리스크가 커진다. 그런 목적이라면 HWiNFO, LibreHardwareMonitor, vendor 툴과 비교해야 한다. 하지만 “작업표시줄 한쪽에 현재 네트워크와 CPU·메모리 상태를 작게 고정해두는 도구”로는 여전히 꽤 실용적인 선택지다.

## 참고한 공개 자료

- [zhongyang219/TrafficMonitor GitHub repository](https://github.com/zhongyang219/TrafficMonitor)
- [TrafficMonitor README_en-us.md](https://github.com/zhongyang219/TrafficMonitor/blob/master/README_en-us.md)
- [TrafficMonitor V1.86 release](https://github.com/zhongyang219/TrafficMonitor/releases/tag/V1.86)
- [TrafficMonitor FAQ](https://github.com/zhongyang219/TrafficMonitor/blob/master/Help_en-us.md)
- [TrafficMonitor plugins repository](https://github.com/zhongyang219/TrafficMonitorPlugins)
