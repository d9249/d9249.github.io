---
title: "Anything(Docufinder)는 HWP·PDF·Office 문서 내용을 로컬에서 찾아주는 데스크톱 검색 엔진이다"
date: "2026-05-10T23:49:59"
description: "Anything은 HWP/HWPX, Office, PDF, 이미지 OCR까지 로컬에서 인덱싱하고, 선택적으로 Gemini 기반 문서 질의응답을 붙일 수 있는 Tauri 데스크톱 문서 검색 앱이다."
author: "Sangmin Lee"
repository: "chrisryugj/Docufinder"
sourceUrl: "https://github.com/chrisryugj/Docufinder"
status: "Source available desktop app"
license: "Business Source License 1.1"
platforms:
  - "winos"
  - "macos-linux"
tags:
  - "Document Search"
  - "Local AI"
  - "OCR"
  - "Tauri"
  - "Windows"
  - "macOS"
highlights:
  - "파일명이 아니라 문서 본문으로 HWP/HWPX, Office, PDF, 이미지 OCR 결과를 검색하는 로컬 데스크톱 앱이다."
  - "SQLite FTS5, usearch 벡터 인덱스, KoSimCSE ONNX, PaddleOCR ONNX를 조합해 키워드·파일명·시맨틱·하이브리드 검색 모드를 제공한다."
  - "Gemini API 키를 넣으면 인덱싱된 문서를 근거로 자연어 질의응답과 온라인 요약을 사용할 수 있지만, AI를 끄면 검색·임베딩·OCR은 로컬 중심으로 동작한다."
  - "최신 Release는 Windows x64 설치 파일과 macOS Apple Silicon DMG를 제공하며, macOS는 수동 업데이트와 ad-hoc 서명 caveat가 있다."
  - "BSL 1.1 라이선스라 비프로덕션 사용은 열려 있지만 프로덕션·상용 사용은 별도 라이선스 확인이 필요하다."
draft: false
---

`Anything`은 `Docufinder` 저장소에서 배포되는 로컬 문서 검색 앱이다. 이름만 보면 Everything류 파일명 검색 도구처럼 보이지만, 실제 초점은 “파일명이 아니라 문서 안의 내용으로 찾기”에 있다. 폴더를 등록하면 HWP/HWPX, Office, PDF, 이미지 OCR 결과를 인덱싱하고, 검색창에서 키워드·파일명·시맨틱·하이브리드 방식으로 문서를 찾는 흐름이다.

한국어 업무 문서가 많은 환경이라면 특히 흥미롭다. README는 HWP5와 1996~2002년 HWP3 구버전, HWPX, DOCX, PPTX, XLSX/XLS, PDF, 이미지, TXT/Markdown을 대상으로 설명한다. “어느 폴더에 저장했는지 모르지만 문서 안에 들어 있던 문장이나 숫자는 기억난다”는 상황을 겨냥한 앱에 가깝다.

![Anything promo demo](/images/tips/docufinder-promo.gif)

## 어떤 문제를 해결하나

일반 파일 검색은 파일명과 경로를 알아야 강하다. Anything은 그보다 한 단계 안쪽인 문서 본문을 검색 대상으로 삼는다. 예를 들어 `계약서`, `예산`, `연차 조건`, `회의록의 특정 표현`처럼 파일명에 없을 가능성이 큰 단어를 문서 안에서 찾아준다.

README 기준 핵심 기능은 다음과 같다.

- 문서 본문 인덱싱과 키워드 검색
- Everything 스타일의 빠른 파일명 검색
- KoSimCSE 기반 시맨틱 검색과 키워드+시맨틱 하이브리드 검색
- PDF와 이미지 OCR
- 파일 추가·수정·삭제 실시간 반영
- 선택 기능으로 Gemini API 기반 문서 질의응답과 AI 요약
- 인터넷 없이 쓰는 오프라인 요약(TextRank)

검색 결과 화면은 “검색어가 어디에서 걸렸는지”를 보여주는 쪽에 맞춰져 있다. 단순히 파일 목록만 뿌리는 것이 아니라, 본문 매치와 파일 경로, 문서 종류를 함께 보여주는 검색 앱에 가깝다.

![Anything search results](/images/tips/docufinder-search-results.png)

## 검색 구조가 꽤 로컬 지향이다

아키텍처는 React 19 + TypeScript + Tailwind CSS 프론트엔드, Tauri 2 + Rust 백엔드 조합이다. 저장과 검색 쪽은 SQLite FTS5, usearch HNSW 벡터 인덱스, Lindera 한국어 형태소 분석, KoSimCSE-roberta ONNX 임베딩, PaddleOCR ONNX로 구성되어 있다.

이 구조의 장점은 검색의 기본 경로가 클라우드 서비스가 아니라 로컬 앱 안에 있다는 점이다. README의 보안/데이터 흐름 설명에 따르면 문서 파싱, 인덱싱, 키워드·시맨틱 검색, 로컬 임베딩, OCR은 로컬에서 처리된다. AI 기능을 끄면 문서 검색 자체는 외부 LLM 없이 돌아가는 설계다.

다만 “완전 로컬”이라는 표현은 기능별로 나눠 읽는 편이 안전하다. 자동 업데이트 확인은 GitHub Releases 엔드포인트를 볼 수 있고, Gemini 기반 AI 질의응답을 켜면 질문과 관련 청크가 Gemini API로 나간다. 온라인 AI 요약은 문서 텍스트를 외부 API에 보내는 기능으로 이해해야 한다.

## 설치와 첫 사용법

최신 GitHub Release 기준으로는 Windows x64 설치 파일과 macOS Apple Silicon DMG가 올라온다. README 본문은 Windows 설치 파일을 `.msi`라고 설명하지만, 현재 릴리스 자산명은 `Anything_2.5.25_x64-setup.exe` 계열이고 Tauri 설정도 Windows 번들 타깃을 NSIS로 둔다. 설치할 때는 항상 Release 페이지의 최신 자산명을 확인하는 편이 좋다.

Windows 쪽 README 요구사항은 다음과 같다.

- Windows 10 21H2 이상 또는 Windows 11
- RAM 8GB 이상, 16GB 권장
- 디스크 여유 1GB 이상
- 최초 1회 모델 자동 다운로드를 위한 인터넷 연결
- 표준 설치 과정의 UAC 프롬프트
- WebView2와 VC++ 런타임은 설치 파일에 포함

macOS는 Apple Silicon 전용으로 설명되어 있다. macOS 11 Big Sur 이상, M1/M2/M3 계열을 대상으로 하고 Intel Mac은 README 기준 미지원이다. DMG를 받아 Applications에 넣은 뒤 첫 실행은 우클릭 → 열기로 Gatekeeper 경고를 통과해야 할 수 있다. “손상된 앱”으로 표시될 때는 quarantine 속성을 제거하는 안내도 README에 들어 있다.

```bash
xattr -dr com.apple.quarantine /Applications/Anything.app
```

개발 빌드는 pnpm, Node.js, Rust, Tauri가 필요하다. README는 대략 다음 흐름을 제시한다.

```bash
pnpm install
pnpm run download-model
pnpm tauri:dev
pnpm tauri:build
```

소스에서 직접 빌드하려는 경우에는 ONNX 모델, PaddleOCR 리소스, kordoc 번들, Windows VC++ 재배포 패키지 같은 앱 리소스까지 맞아야 하므로, 일반 사용자는 Release 바이너리로 먼저 평가하는 편이 현실적이다.

## AI 기능은 편하지만 데이터 경계를 구분해야 한다

Anything의 AI 기능은 “문서 검색 앱 + RAG 패널”처럼 볼 수 있다. 설정에서 Gemini API 키를 넣고 AI 기능을 켜면, 인덱싱된 문서에서 관련 청크를 찾아 자연어 답변을 만들거나 문서를 요약할 수 있다. 답변에는 근거 문서와 페이지를 함께 보여주는 방향이다.

여기서 중요한 것은 기능별 데이터 경계다.

- 일반 검색, FTS 인덱싱, 로컬 임베딩, OCR은 로컬 중심이다.
- AI 질의응답은 질문과 관련 청크가 Gemini API로 전송될 수 있다.
- 온라인 AI 요약은 요약 대상 문서 텍스트가 외부 API로 나갈 수 있다.
- Gemini API 키는 앱 데이터 폴더의 `credentials.json`에 분리 저장되며, Windows에서는 현재 사용자 ACL 제한을 시도한다.
- 오류 리포트 기능은 빌드 시 Telegram Bot 토큰이 주입된 배포판에서 동작할 수 있고, 코드상 문서 내용과 검색어는 보내지 않으며 파일 경로는 홈 디렉터리를 `~`로 마스킹한다고 되어 있다.

따라서 개인 문서함이나 내부망 문서 검색용으로 검토한다면, 먼저 AI 기능을 끈 상태로 검색 품질을 확인하고, 필요할 때만 Gemini 연동을 켜는 순서가 좋다. 회사 문서나 고객 데이터가 들어가는 폴더라면 온라인 요약과 오류 리포트 설정도 함께 확인해야 한다.

## 주의할 점

첫째, 라이선스가 일반적인 MIT/Apache 오픈소스가 아니다. 저장소의 `LICENSE`는 Business Source License 1.1이고, 비프로덕션 용도는 허용하지만 프로덕션 사용은 금지한다. Change Date는 2030-04-15이며 이후 Apache License 2.0으로 전환된다고 명시되어 있다. 회사 업무에 실제 배포하거나 상용 서비스에 포함하려면 별도 라이선스 확인이 필요하다.

둘째, 배포판 서명 상태를 이해해야 한다. README는 Windows에서 Microsoft 코드서명 인증서가 없어 SmartScreen이나 브라우저 보안 경고가 뜰 수 있다고 안내하고, macOS도 Apple Developer ID가 아니라 ad-hoc 서명이라고 설명한다. 신뢰할 수 있는 경로는 GitHub Releases이며, 다운로드 후 바이너리 실행 정책은 각 조직 보안 정책을 따라야 한다.

셋째, macOS 지원은 “macOS 전체”가 아니라 Apple Silicon DMG 중심이다. 이 사이트의 플랫폼 분류상 `macos-linux` 버킷에도 들어가지만, 실제 앱 릴리스는 macOS Apple Silicon과 Windows가 중심이고 Linux 데스크톱 앱은 제공되지 않는다.

넷째, 전체 드라이브·시스템 폴더·클라우드 폴더 인덱싱은 신중해야 한다. 소스에는 `C:\Windows`, `Program Files`, `/System`, `/usr/bin` 같은 보호 경로 차단, 개발·캐시 폴더 제외, 클라우드/네트워크 폴더 본문 인덱싱 기본 스킵 같은 방어 로직이 들어 있다. 그래도 사용자가 설정을 바꿔 넓은 범위를 인덱싱하면 DB 크기, 벡터 인덱싱 시간, 네트워크 드라이브 hydrate, 민감 문서 노출 범위가 달라진다.

## 내 판단

Anything은 “한국어 업무 문서가 많은 PC에서, 파일명보다 문서 내용으로 찾고 싶다”는 요구에 잘 맞는 도구다. 특히 HWP/HWPX, 오래된 HWP, Office, PDF, 스캔 문서 OCR까지 한 앱 안에서 묶으려는 방향이 분명하다. Everything이나 Spotlight류가 파일명·메타데이터 검색에 강하다면, Anything은 문서 본문 검색과 선택적 RAG 답변 쪽을 노린다.

반대로 모든 환경에 바로 배포할 수 있는 범용 오픈소스 검색 엔진으로 보면 주의할 점이 많다. BSL 1.1 라이선스, 코드서명 경고, macOS Apple Silicon 한정, Gemini 사용 시 외부 전송, 오류 리포트/업데이트 경로를 확인해야 한다. 개인 PC나 소규모 팀에서 “로컬 문서 검색 앱”으로 먼저 평가하고, 회사 표준 도구로 쓰려면 라이선스와 보안 설정을 별도로 검토하는 편이 맞다.

## 참고한 공개 자료

- [chrisryugj/Docufinder GitHub repository](https://github.com/chrisryugj/Docufinder)
- [Docufinder README](https://github.com/chrisryugj/Docufinder/blob/main/README.md)
- [Anything v2.5.25 release](https://github.com/chrisryugj/Docufinder/releases/tag/v2.5.25)
- [Business Source License 1.1 file](https://github.com/chrisryugj/Docufinder/blob/main/LICENSE)
- [Tauri configuration](https://github.com/chrisryugj/Docufinder/blob/32f42eef85490e39b43905c2475cdf1376692c0b/src-tauri/tauri.conf.json)
- [Settings and credential storage source](https://github.com/chrisryugj/Docufinder/blob/32f42eef85490e39b43905c2475cdf1376692c0b/src-tauri/src/commands/settings.rs)
- [Telemetry source](https://github.com/chrisryugj/Docufinder/blob/32f42eef85490e39b43905c2475cdf1376692c0b/src-tauri/src/commands/telemetry.rs)
