---
title: "OCR It은 페이지형 뷰어의 같은 영역을 단축키로 읽어 텍스트로 쌓는 오프라인 브라우저 확장이다"
date: "2026-08-26T00:08:27"
description: "thiagotigaz/ocr-it은 Chrome과 Firefox에서 한 번 지정한 화면 영역을 페이지마다 캡처해 로컬 Tesseract OCR로 텍스트화하고, 반복 페이지 넘김과 .txt 내보내기까지 지원하는 Manifest V3 확장이다."
author: "Sangmin Lee"
repository: "thiagotigaz/ocr-it"
sourceUrl: "https://github.com/thiagotigaz/ocr-it"
status: "Open source beta"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Browser Extension"
  - "OCR"
  - "Tesseract"
  - "Offline-first"
  - "Privacy"
  - "Productivity"
highlights:
  - "한 번 정한 사각형을 `Alt+Shift+S`로 페이지마다 캡처하거나 `Alt+Shift+A` 자동 실행으로 반복해, 선택 불가한 스캔 문서·슬라이드 뷰어의 텍스트를 순서대로 모은다."
  - "OCR은 번들 Tesseract와 WebAssembly로 기기 안에서 수행된다. 프로젝트의 공개 개인정보 정책은 네트워크 요청·분석·계정·원격 코드를 쓰지 않는다고 설명한다."
  - "v0.3.0은 Chrome 116+와 Firefox 140+를 대상으로 하며, GitHub Release에 브라우저별 ZIP이 있다. 현재 스토어 심사 중이므로 Chrome은 압축 해제 후 개발자 모드 로드, Firefox는 임시 add-on 로드가 기본 경로다."
  - "기본 언어는 영어·포르투갈어·스페인어이고, 다른 Tesseract 언어는 source build 때 별도 vendoring해야 한다. 한국어 문서에는 `kor` 모델을 직접 추가해야 한다."
  - "자동 페이지 넘김은 사이트별 권한을 명시적으로 허용한 뒤 동작하며, Chrome 내장 PDF viewer·브라우저 내부 페이지·보이지 않는 영역에는 적용되지 않는다."
draft: false
---

온라인 도서관, 슬라이드 뷰어, 스캔본처럼 **글자가 화면에는 보이지만 선택할 수 없는 페이지형 문서**는 읽고 검색하거나 LLM에 요약을 맡기기 불편하다. `OCR It`은 그 틈을 겨냥한 Chrome·Firefox 확장이다. 문서 본문 영역을 한 번 사각형으로 지정해 두면 이후에는 같은 단축키로 현재 페이지의 그 부분만 캡처하고 OCR 결과를 계속 쌓는다.

핵심은 범용 스크린샷 OCR보다 **반복되는 페이지 작업을 줄이는 인터페이스**다. 결과는 페이지 순서대로 편집·재실행할 수 있고, 전체 복사 또는 `.txt` 다운로드로 내보낸다. v0.3.0 기준 공개 저장소는 JavaScript 기반 Manifest V3 프로젝트이며, MIT 라이선스로 공개되어 있다. 최신 릴리스는 2026년 8월 25일 공개된 `v0.3.0`이다.

![OCR It 자동 실행 화면](/images/tips/ocr-it-auto-run.png)

## 무엇을 해결하나

기본 흐름은 단순하다.

1. `Alt+Shift+R`로 본문이 있는 화면 영역을 고른다.
2. 문서를 직접 넘기며 `Alt+Shift+S`를 누른다. 캡처는 즉시 큐에 들어가고 OCR은 백그라운드에서 순차 처리된다.
3. 반복 작업이라면 다음 페이지 버튼 또는 키를 설정한 뒤 `Alt+Shift+A`로 자동 실행을 시작한다.
4. 팝업에서 각 페이지의 썸네일·문자 수·인식 신뢰도를 확인하고, 잘못 읽힌 페이지는 수정하거나 다시 OCR한 뒤 전체 텍스트를 복사·다운로드한다.

자동 실행은 캡처 → OCR → 페이지 넘김을 반복하다가, 동일한 텍스트가 연속되거나 페이지를 넘기지 못했을 때, OCR이 실패했을 때, 또는 기본 300페이지 상한에 도달했을 때 멈춘다. 단순 타이머로 끝 페이지를 계속 찍는 방식보다 안전한 설계다.

## 로컬 OCR과 권한 경계

이 도구의 가장 좋은 점은 OCR이 외부 API로 스크린샷을 보내지 않는다는 점이다. 프로젝트 설명과 `PRIVACY.md`에 따르면 Tesseract 엔진과 언어 모델을 확장 패키지에 넣어 기기 안에서 처리하며, 분석·텔레메트리·계정·원격 코드를 사용하지 않는다.

인식이 끝나면 원본 크롭은 버리고, 검수용 작은 썸네일과 인식 텍스트·설정만 `chrome.storage.local`에 남긴다고 설명한다. 저장 데이터에 페이지 URL이나 제목은 기록하지 않는다는 것이 프로젝트의 주장이다. 팝업의 **Clear** 또는 확장 삭제로 로컬 결과를 지울 수 있다.

다만 “오프라인”이 곧 “권한이 없다”는 뜻은 아니다. `activeTab`, `scripting`, `storage`, `unlimitedStorage`, `tabs`, `alarms` 등을 쓰며, 장시간 자동 실행이나 cross-origin iframe 안의 뷰어를 제어하려면 사용자가 현재 사이트에 대해 별도 **Allow**를 눌러야 한다. 설치 시점에는 사이트 접근 권한을 요구하지 않고, 일반 단발 캡처는 hotkey나 팝업 동작에 맞춰 `activeTab`으로 처리하는 설계다.

## 설치와 첫 사용

공식 README 기준 최신 Release에는 Chrome·Firefox용 ZIP이 각각 있다. 아직 두 웹 스토어의 `0.3.0` 심사가 끝나지 않았으므로, 현 시점의 공식 설치 경로는 sideload에 가깝다.

- **Chrome 116 이상**: `ocr-it-chrome-0.3.0.zip`을 내려받아 압축을 푼 뒤 `chrome://extensions`에서 Developer mode를 켜고 **Load unpacked**로 폴더를 불러온다.
- **Firefox 140 이상**: `ocr-it-firefox-0.3.0.zip`을 받은 뒤 `about:debugging#/runtime/this-firefox`에서 **Load Temporary Add-on…**으로 로드한다. 서명되지 않은 확장이므로 Firefox를 종료하면 제거된다.

소스에서 직접 빌드할 수도 있다.

```bash
git clone https://github.com/thiagotigaz/ocr-it.git
cd ocr-it
npm run build
# build/chrome, build/firefox 생성
```

README는 확장 자체를 로드하는 데 `npm install`이 필수는 아니며, 테스트·Firefox lint·추가 언어 vendoring에 필요하다고 설명한다. 단축키가 다른 확장과 충돌하면 Chrome은 `chrome://extensions/shortcuts`에서 실제 할당 상태를 확인해야 한다.

![OCR It 영역·자동 실행 설정](/images/tips/ocr-it-settings.png)

## 자동 페이지 넘김이 맞는 경우와 아닌 경우

자동 실행은 “다음” 버튼의 화면 좌표를 고르거나 키 입력을 보내는 방식이다. CSS selector가 아니라 점을 저장하기 때문에 DOM이 다시 그려지는 독서 뷰어나 Shadow DOM, 일부 iframe 상황에서도 대응하려는 의도가 보인다. 시작 전 **Test now**로 다음 페이지 전환이 실제로 되는지 먼저 시험하는 것이 좋다.

반대로 다음 경우에는 수동 캡처가 현실적인 선택이다.

- Chrome 내장 PDF viewer는 확장이 내부 plugin에 주입할 수 없어 자동 넘김을 지원하지 않는다. 문서를 직접 `PageDown`/아래 화살표로 넘기며 캡처해야 한다.
- `chrome://`, `about:`, 확장 스토어 같은 브라우저 내부 페이지는 모든 확장과 마찬가지로 대상이 아니다.
- 창 크기나 브라우저 zoom을 실행 중 바꾸면 저장된 캡처 영역·다음 버튼 좌표가 어긋난다.
- 스캔 품질과 글씨체가 낮으면 OCR 신뢰도가 떨어진다. 결과를 바로 인용·업로드하기보다 썸네일과 텍스트를 검수해야 한다.

## 언어와 결과 품질

기본 번들은 영어(`eng`), 포르투갈어(`por`), 스페인어(`spa`)만 포함한다. README가 안내하는 대로 추가 언어는 `npm run vendor -- <언어 코드>`로 Tesseract 모델을 가져오고 `src/shared.js`의 `LANGUAGES`에 표시 항목을 더하는 방식이다. 한국어 문서라면 `kor` 모델을 추가한 자체 build가 필요하다.

```bash
npm install
npm run vendor -- kor
```

그 뒤 `LANGUAGES` 배열에 `{ code: 'kor', label: 'Korean' }`을 넣어 다시 빌드해야 한다. 한 페이지가 여러 언어를 섞는다면 `eng+kor` 같은 조합도 가능하지만, README는 속도·정확도 측면에서 가능한 한 단일 언어를 권한다. 기본 설정의 sharpen 옵션은 저해상도 화면에서 도움이 될 수 있지만, 손글씨·낮은 해상도 스캔·복잡한 표에서는 결국 후편집이 필요하다.

## 주의할 점

첫째, 아직 초기 배포 단계다. v0.3.0 릴리스와 Chrome/Firefox 빌드는 존재하지만 스토어 심사 중이며, Firefox 경로는 영구 설치가 아닌 임시 로드다. 매일 쓰는 업무 도구로 정착시키기 전에는 짧은 문서로 단축키·권한·OCR 결과를 먼저 확인하는 편이 낫다.

둘째, 로컬 처리여도 민감한 텍스트는 로컬 extension storage에 남는다. 비밀번호, API 키, 개인정보, 비공개 계약서 같은 화면은 캡처 영역에 포함하지 말고, 작업 후 Clear로 결과와 썸네일을 지우는 습관이 필요하다. OCR 결과를 LLM에 붙여 넣는 순간부터는 별도의 서비스·데이터 정책이 적용된다.

셋째, 읽을 권한과 재이용 권한은 구분해야 한다. 브라우저에서 보인다는 사실만으로 스캔 책·강의자료·구독형 문서를 대량 복제·배포할 권리가 생기지는 않는다. 개인적인 접근성 보조·검색·학습 목적으로 좁게 쓰고, 조직이나 서비스의 이용 약관 및 저작권 조건을 확인하는 것이 안전하다.

## 내 판단

`OCR It`은 대형 문서 관리 플랫폼이 아니라, “매 페이지에서 같은 본문 사각형을 읽어야 하는” 귀찮은 작업을 정확히 덜어주는 작은 도구다. 특히 선택 불가 웹 뷰어, 슬라이드형 전자책, 스캔 아카이브처럼 텍스트 접근성이 낮은 자료를 개인 연구 노트나 검색 가능한 초안으로 바꾸려 할 때 유용하다.

추천 대상은 네트워크에 이미지를 보내지 않고 문서 OCR을 해보고 싶은 사람, 그리고 몇 페이지가 아니라 수십 페이지의 반복 작업을 다루는 사람이다. 반대로 한국어가 주력이고 browser extension sideload를 피하고 싶거나, PDF의 레이아웃·표 구조를 정교하게 복원해야 한다면 스토어 배포·한국어 모델·후처리 흐름이 정리될 때까지 다른 전문 OCR 도구와 함께 비교하는 편이 낫다.

## 참고한 공개 자료

- [thiagotigaz/ocr-it GitHub repository](https://github.com/thiagotigaz/ocr-it)
- [OCR It README](https://github.com/thiagotigaz/ocr-it/blob/main/README.md)
- [OCR It v0.3.0 release](https://github.com/thiagotigaz/ocr-it/releases/tag/v0.3.0)
- [OCR It manifest.json](https://github.com/thiagotigaz/ocr-it/blob/main/manifest.json)
- [OCR It privacy policy](https://github.com/thiagotigaz/ocr-it/blob/main/PRIVACY.md)
- [OCR It LICENSE](https://github.com/thiagotigaz/ocr-it/blob/main/LICENSE)
- [Tesseract tessdata language models](https://github.com/tesseract-ocr/tessdata)
