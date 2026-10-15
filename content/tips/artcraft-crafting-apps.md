---
title: "ArtCraft Crafting Apps: Rust로 만든 창작·문서 앱 13종을 한 런처에서"
date: "2026-10-16T00:44:43"
description: "사진·벡터·영상·PDF·UI·문서 편집을 위한 오픈소스 앱 모음. ArtCraft Launcher로 설치하되 초기 개발 상태, 파일 호환성, 온라인 공유의 데이터 경계를 확인한다."
author: "Sangmin Lee"
repository: "storytold/craft-launcher"
sourceUrl: "https://getartcraft.com/apps"
status: "Open source alpha"
license: "MIT OR Apache-2.0 (Launcher)"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Creative Tools"
  - "Rust"
  - "Desktop Apps"
  - "Local First"
  - "MCP"
highlights:
  - "이미지·벡터·영상·PDF·UI·오피스·CAD까지 13개 독립 앱을 모은 창작 도구군이다."
  - "Launcher가 OS·CPU에 맞는 설치 파일을 고르고 설치·업데이트·실행을 관리한다."
  - "macOS·Windows·Linux용 배포가 있으며, 앱별 웹 지원과 요구 환경은 따로 확인해야 한다."
  - "초기 개발판이다. 원본 파일 대신 사본으로 열기·편집·저장 호환성을 먼저 시험하는 편이 좋다."
draft: false
---

**ArtCraft Crafting Apps**는 사진, 디자인, 영상, 문서 작업을 위한 Rust 기반 오픈소스 앱 모음이다.[1]
하나의 거대한 편집기 안에 모든 기능을 넣는 대신, 용도별 독립 앱을 제공하고 ArtCraft Launcher가 설치와 업데이트를 묶는다.[1][2]

홈페이지의 AI 이미지·영상 스튜디오인 **ArtCraft 자체와는 구분**해야 한다.[8]
이번 도구군의 중심은 로컬 파일을 편집하는 네이티브 앱이며, 13개 앱이 모두 기존 상용 도구를 완전히 대체할 만큼 검증되었다는 뜻은 아니다.[1]
카탈로그도 초기 알파 또는 개발 중 상태로 소개한다.[1][8]

## 어떤 앱이 들어 있나

공식 카탈로그에서 확인되는 앱은 다음 13종이다.[1]
용도별로 필요한 것부터 하나씩 고르면 된다.[1]

| 앱 | 주된 용도 |
| --- | --- |
| PhotoCraft | 이미지·레이어 편집 |
| VectorCraft | 벡터 일러스트 |
| FilmCraft | 영상 편집 |
| LightCraft | 사진 관리·RAW 현상 |
| PdfCraft | PDF 열람·정리·결합·분할 |
| EffectCraft | 모션 그래픽·VFX |
| DesignCraft | 페이지 레이아웃·출판 |
| FigCraft | UI 디자인·프로토타입 |
| WordCraft | 워드 문서 |
| SoundCraft | 오디오 녹음·편집·믹싱 |
| DeckCraft | 프레젠테이션 |
| CADCraft | CAD·도면 |
| GridCraft | 스프레드시트·데이터 분석 |

공식 설명상 데스크톱은 macOS·Windows·Linux를 대상으로 하며 Electron이나 웹뷰를 감싼 형태가 아니다.[1]
다수 앱은 WebAssembly 빌드도 제공하지만, 카탈로그는 FilmCraft를 웹 지원 목록에 넣지 않는다.[1]
한 앱의 지원 범위나 최소 OS를 전체 제품군에 그대로 적용하면 안 된다.[1]

## 설치는 Launcher부터 확인한다

일반 사용자는 [공식 Launcher Releases](https://github.com/storytold/craft-launcher/releases/latest)에서 운영체제와 CPU에 맞는 파일을 받는 경로가 가장 단순하다.[2]
런처는 각 앱의 공식 배포 패키지를 설치하고, 설치된 버전과 새 버전을 표시하며 업데이트와 실행을 관리한다.[2]

2026년 10월 16일 확인한 최신 Launcher 릴리스는 **v0.4.1**이며, 변경 내역에는 FigCraft 추가가 들어 있다.[3]
카탈로그의 다운로드 링크에는 v0.3.2가 남아 있으므로, 페이지에 고정된 버전보다 공식 Releases의 최신 버전·변경 내역을 함께 확인하는 편이 낫다.[1][3]

- **macOS:** Universal DMG로 Apple Silicon과 Intel을 지원한다.[2]
  Launcher 문서상 최소 버전은 macOS 11이며, DMG의 앱을 Applications로 옮기는 방식이다.[2]
- **Windows:** x64·ARM64·x86 MSI 또는 portable ZIP이 제공된다.[3]
  휴대용 버전은 압축을 풀어 실행하는 경로다.[2][3]
- **Linux:** AppImage·deb·rpm·Flatpak 등이 제공된다.[2]
  Launcher 문서는 일반적인 설치·실행 경로로 AppImage·deb·rpm을 권하며, Flatpak은 sandbox와 호스트 접근 권한에 따른 제약을 설명한다.[2]

![앱별 설치 상태와 버전 및 업데이트 버튼을 보여주는 ArtCraft Launcher 공식 화면](/images/tips/artcraft-crafting-apps-launcher.webp)

*공식 Launcher 화면 예시. 설치·업데이트·실행이 한곳에 모인다. 화면의 “12개”와 개별 버전은 이전 예시 상태이며 현재 카탈로그의 13종 집계와 구분해야 한다. 모바일에서는 눌러 확대할 수 있다.[1][2]*

런처는 다운로드를 릴리스의 SHA-256 값과 대조하고 실행 중인 앱은 교체하지 않는다고 설명한다.[2]
다만 체크섬 일치는 파일 무결성 확인이지 앱의 안정성·보안 감사 완료를 뜻하지 않는다.[2]
업데이트 조회와 패키지 다운로드에는 네트워크가 필요하므로, 로컬 편집 중심이라는 설명을 런처까지 완전 오프라인이라는 의미로 읽어서는 안 된다.[2]

## 처음에는 PhotoCraft나 FigCraft 하나만 시험한다

**PhotoCraft**는 레이어·마스크·보정 레이어·필터·문자와 PSD 작업을 제공한다.[4]
익숙한 메뉴와 단축키를 지향하므로 기존 이미지 편집 흐름과 비교하기 좋다.[4]
다만 현재 README는 앱에서 다시 저장한 PSD가 원본과 바이트 단위로 동일한 것은 아니라고 명시하며, 독립 PSD parser의 왕복 테스트와 실제 편집 앱의 저장 동작을 구분한다.[4]

![보정 곡선과 레이어 패널을 열고 이미지를 편집하는 PhotoCraft 공식 화면](/images/tips/artcraft-crafting-apps-photocraft.webp)

*공식 PhotoCraft 화면. 곡선 보정과 레이어·문자 편집의 배치를 보여주는 예시이며, 모든 PSD 기능의 호환성을 보증하는 자료는 아니다. 모바일에서는 눌러 확대할 수 있다.[4]*

**FigCraft**는 프레임·자동 레이아웃·컴포넌트·변수·프로토타입 작업을 다룬다.[5]
기본 문서는 로컬 `.figcraft` 파일이며, Figma `.fig` 가져오기는 README에서 best effort로 설명한다.[5]
중요한 디자인은 가져오기 성공 여부뿐 아니라 폰트·배치·변수·내보내기 결과까지 사본으로 대조하는 편이 좋다.[5]

추천하는 첫 검증은 작다. 샘플 파일을 열고, 필요한 기능 하나를 수정하고, 새 이름으로 저장한 뒤 다시 열어 보는 것이다. 스크린샷의 익숙한 UI나 지원 확장자 목록만으로 기존 제작 환경과의 동등성을 판단하지 않는 것이 안전하다.

## CLI·MCP는 자동화 접점이지 품질 보증은 아니다

PhotoCraft와 FigCraft는 UI와 CLI·JSON 제어 채널·MCP가 같은 명령 엔진을 사용한다고 설명한다.[4]
특히 PhotoCraft에는 폴더 단위 일괄 처리와 headless 실행 경로가 있어 반복 보정·변환을 자동화하는 데 관심을 둘 만하다.[4][5]

아래는 PhotoCraft README의 명령 형식이다.[4]
설치된 CLI와 별도로 준비한 `grade.json`이 필요하며, GUI 앱을 설치했다고 모든 OS에서 CLI가 자동으로 PATH에 들어간다고 가정해서는 안 된다.[4]

```bash
photocraft-cli batch --help
photocraft-cli batch --actions grade.json --in ./raw --out ./graded
```

에이전트에 연결하기 전에는 작업 폴더를 제한하고 결과를 별도 경로에 저장하는 편이 좋다. 메뉴 조작과 같은 엔진에 접근한다는 것은 파일 변경 권한도 갖는다는 의미다. MCP 지원 자체가 잘못된 편집·덮어쓰기에서 원본을 보호해 주지는 않는다.

## 로컬 작업과 온라인 공유의 경계

FigCraft는 계정·telemetry 없이 오프라인 작업이 가능하다고 설명하지만, **온라인 공유를 선택하면 파일이 서버로 올라간다**.[5]
현재 README의 기본 공유 서버는 `collab.craftapps.dev`이며, 공유를 중단하는 것만으로 서버 파일이 즉시 삭제되는 것은 아니다.[5]

온라인 세션은 종단간 암호화가 아니고 서버 운영자가 저장 파일을 읽을 수 있다.[5]
편집·열람 링크나 코드가 접근 권한 역할을 하며, 로컬 네트워크 공유도 암호화되지 않는다고 명시한다.[5]
기밀 자료는 신뢰하지 않는 서버에 올리지 말고, 별도 저장본과 삭제·권한 회수 절차를 확인해야 한다.[5]

라이선스는 **Launcher 기준 MIT 또는 Apache-2.0 선택형**이다.[2]
GitHub API의 단일 Apache 표기보다 실제 두 라이선스 파일과 README를 함께 보는 것이 정확하며, 개별 앱·번들 자산·상표의 조건은 별도다.[2]
특히 ArtCraft 이름과 로고는 같은 코드 라이선스로 자유롭게 재배포되는 항목이 아니라고 명시한다.[2][6][7]

## 내 판단

상용 작업 환경을 즉시 교체할 패키지라기보다, **필요한 편집 기능을 로컬·오픈소스 도구로 시험하고 자동화 가능성까지 살펴볼 초기 제품군**으로 보는 편이 맞다. 먼저 필요한 앱 하나를 골라 사본으로 파일 호환성을 확인하고, 만족한 범위에서만 작업을 옮기는 접근을 권한다. 무료·Rust·네이티브라는 특징과 납품 파일의 안정성은 별도로 평가해야 한다.
## Sources


[1] https://getartcraft.com/apps

[2] https://raw.githubusercontent.com/storytold/craft-launcher/main/README.md

[3] https://api.github.com/repos/storytold/craft-launcher/releases/latest

[4] https://raw.githubusercontent.com/storytold/photocraft/main/README.md

[5] https://raw.githubusercontent.com/storytold/figcraft/main/README.md

[6] https://raw.githubusercontent.com/storytold/craft-launcher/main/LICENSE-MIT

[7] https://raw.githubusercontent.com/storytold/craft-launcher/main/LICENSE-APACHE

[8] https://getartcraft.com
