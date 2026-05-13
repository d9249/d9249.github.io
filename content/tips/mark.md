---
title: "Mark는 Markdown 파일을 문서처럼 열고 바로 다듬는 작은 데스크톱 앱이다"
date: "2026-05-13T19:38:55"
description: "Playloom Mark는 Markdown을 코드 편집기보다 문서 뷰어에 가깝게 열고, 읽기·검색·목차·PDF 출력·가벼운 AI 편집을 한 화면에 묶은 크로스 플랫폼 데스크톱 앱이다."
author: "Sangmin Lee"
repository: "Playloom Mark"
sourceUrl: "https://playloom.app/mark"
status: "Proprietary desktop app"
license: "Proprietary / Terms of Use"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Markdown"
  - "Desktop App"
  - "Document Editor"
  - "AI Writing"
  - "Productivity"
highlights:
  - "Markdown을 코드 파일이 아니라 읽기 좋은 문서처럼 열고, 필요할 때만 바로 편집하는 데 초점을 둔다."
  - "목차, 검색, 표·이미지·코드 렌더링, 인쇄/PDF 저장, 폰트 선택, 이미지 크기 조절을 한 앱 안에 묶는다."
  - "macOS Apple Silicon/Intel DMG, Windows x64 ZIP, Linux x64 AppImage 다운로드 링크가 공식 페이지에 공개되어 있다."
  - "AI 다시 쓰기·요약·번역·이어 쓰기를 내세우지만, 비공개 문서에서는 AI 기능의 데이터 경계와 설정을 먼저 확인하는 편이 좋다."
  - "소스 저장소나 오픈소스 라이선스는 공식 Mark 페이지에서 확인되지 않으므로, 팀 표준 도구로 쓰기 전 약관과 배포 정책을 따로 확인해야 한다."
draft: false
---

Mark는 Playloom이 공개한 Markdown 전용 데스크톱 앱이다. 공식 문구는 “AI 시대의 표준 문서 형식 Markdown을 위한 빠르고 쉬운 데스크톱 앱”이고, 영어 메타데이터는 “Open Markdown like a document”라고 설명한다. 핵심은 Markdown을 개발자용 텍스트 파일로만 다루지 않고, 일반 문서처럼 열고 읽고 바로 고치는 경험에 맞춘다는 점이다.

이 방향은 꽤 실용적이다. Markdown은 AI 결과물, 기술 문서, 회의록, README, 보고서 초안에서 점점 더 많이 쓰이지만, 매번 VS Code나 무거운 노트 앱을 열기에는 과하다. Mark는 “단일 Markdown 파일을 빠르게 열어 문서처럼 보고, 필요한 순간만 수정하고, 공유 가능한 형태로 내보내는 앱”에 가깝다.

![Mark view and edit mode](/images/tips/mark-view-edit.webp)

## Mark 개요

공식 페이지 기준 Mark가 강조하는 기능은 단순하다.

- Markdown 파일을 문서처럼 읽기
- 표, 이미지, 코드, 제목, 목록 렌더링
- 문서 화면에서 바로 수정하고 필요할 때 Markdown 텍스트 확인
- 긴 문서용 목차와 검색
- 인쇄 또는 PDF 저장
- 폰트 선택과 이미지 크기 조절
- AI 기반 다시 쓰기, 요약, 번역, 이어 쓰기

이 기능 묶음만 보면 Mark는 “Markdown IDE”가 아니라 “Markdown 문서 뷰어 + 가벼운 편집기”에 가깝다. 공식 스크린샷도 대형 사이드바나 프로젝트 탐색기보다 문서 본문, 검색, 목차, 작은 편집 툴바를 앞에 둔다. 이미 Markdown 파일이 있고, 그 파일 하나를 읽기 좋게 열어 검토·수정·전송하려는 상황에 맞다.

## 왜 유용한가

Markdown 앱은 크게 두 갈래로 나뉜다. 하나는 개발자 중심의 코드 편집기이고, 다른 하나는 노트 데이터베이스에 가까운 지식관리 앱이다. Mark는 둘 사이에서 훨씬 좁은 문제를 잡는다. 파일 하나를 열고, 읽고, 필요한 부분을 고치고, PDF나 인쇄 형태로 넘기는 흐름이다.

특히 AI 시대에는 이 좁은 흐름이 자주 생긴다. Claude, ChatGPT, Gemini, 로컬 에이전트가 생성한 산출물은 Markdown으로 떨어지는 경우가 많다. 보고서 초안, 회의록, 체크리스트, 코드 리뷰 요약, 실행 계획을 빠르게 확인하고 조금 다듬은 뒤 공유해야 한다면, 일반 문서 뷰어처럼 동작하는 Markdown 앱이 편하다.

공식 스크린샷의 UI도 이 의도를 잘 보여준다. 문서 본문은 읽기 모드로 크게 보이고, 필요할 때 H2, 굵게, 기울임, 링크, 목록, 체크리스트, 인용, 코드, 표, 이미지, AI 버튼이 떠 있는 작은 툴바가 나온다. 편집기가 항상 전면에 있는 구조가 아니라, 문서를 먼저 읽고 필요한 순간에만 편집 도구가 나타나는 쪽이다.

![Mark table of contents and document rendering](/images/tips/mark-toc-etc.webp)

## 설치와 첫 사용법

공식 페이지의 기본 다운로드 버튼은 Mac Apple Silicon을 가리킨다. “다른 다운로드”에는 다음 배포 파일이 함께 노출되어 있다.

| 플랫폼 | 공식 다운로드 표면 | 파일 형태 |
|---|---|---|
| macOS Apple Silicon | `Mark-macos-arm64.dmg` | DMG |
| macOS Intel | `Mark-macos-x64.dmg` | DMG |
| Windows x64 | `Mark-windows-x64.zip` | ZIP |
| Linux x64 | `Mark-linux-x64.AppImage` | AppImage |

직접 설치 명령을 제공하는 오픈소스 프로젝트라기보다, 공식 웹사이트에서 바이너리를 내려받아 쓰는 데스크톱 앱으로 보면 된다. 조사 시점의 다운로드 HEAD 응답 기준으로 macOS DMG는 약 24MB, Windows ZIP은 약 9MB, Linux AppImage는 약 91MB 수준이었다. 파일명에 버전 번호가 들어가지 않으므로, 배포 버전·업데이트 정책은 앱 내부 또는 공식 페이지의 최신 파일을 기준으로 확인해야 한다.

첫 사용 흐름은 간단하다. Markdown 파일을 열고, 문서처럼 읽으면서 목차나 검색으로 이동하고, 필요한 부분을 직접 수정한 뒤 PDF 저장이나 인쇄로 공유하는 방식이다. 지원 확장자는 공식 스크린샷에서 `.md`, `.markdown`, `.mdown`, `.mkd` 예시가 보인다.

## AI 편집은 편하지만 문서 경계를 확인해야 한다

Mark 페이지는 AI 기능을 “다시 쓰기, 요약, 번역, 이어 쓰기”로 설명한다. 스크린샷에서도 제안된 변경을 검토하고 적용·되돌리기·닫기 버튼을 누르는 흐름이 보인다. Markdown 문서를 일반 텍스트처럼 다루는 앱에서 이 기능은 자연스럽다. 긴 문단을 짧게 줄이거나, 회의록을 요약하거나, 영어/한국어 초안을 번역하는 데 잘 맞는다.

![Mark AI editing suggestion](/images/tips/mark-ai-edit.webp)

다만 여기서 데이터 경계는 반드시 확인해야 한다. Mark 페이지 자체는 AI 기능이 어떤 모델을 쓰는지, 문서 내용이 언제 외부로 전송되는지, 로컬 모델만 쓸 수 있는지까지 세부적으로 설명하지 않는다. Playloom의 별도 보안 페이지는 Loom 제품군이 Cloud AI와 Local AI를 선택할 수 있고, 원본 파일은 사용자의 로컬 폴더에 남는다는 큰 방향을 설명하지만, Mark의 AI 편집 기능별 전송 경계를 문서화한 것은 아니다.

따라서 사내 문서, 고객 정보, 계약서, 개인 메모처럼 민감한 Markdown을 다룬다면 먼저 AI 기능을 끈 상태로 문서 뷰어/편집기 역할을 평가하는 편이 안전하다. AI 편집을 쓸 경우에는 어떤 모델·계정·네트워크 경로를 쓰는지, 조직 정책상 허용되는지, 약관과 개인정보처리방침이 어떤 범위의 데이터 처리를 허용하는지 확인해야 한다.

## 주의할 점

첫째, 공식 Mark 페이지에서는 GitHub 저장소나 소스 코드, 오픈소스 라이선스가 확인되지 않는다. 이 tips 항목에서는 그래서 상태를 `Proprietary desktop app`, 라이선스를 `Proprietary / Terms of Use`로 분류했다. 개인 생산성 앱으로 시험해보는 것과 팀 표준 도구로 배포하는 것은 다른 문제이므로, 조직 도입 전에는 약관, 업데이트 정책, 코드서명, 데이터 처리 범위를 따로 확인해야 한다.

둘째, 플랫폼 지원은 다운로드 파일 기준으로 읽어야 한다. 페이지에는 macOS Apple Silicon/Intel, Windows x64, Linux x64 AppImage 링크가 보인다. 하지만 각 OS의 최소 버전, 자동 업데이트 방식, 코드서명·notarization 여부, Windows installer 형태, Linux 데스크톱 통합 방식은 공식 Mark 페이지에서 자세히 설명되지 않는다. 특히 업무용 PC에서 쓰려면 배포 파일이 조직 보안 정책과 맞는지 확인하는 과정이 필요하다.

셋째, Mark는 Markdown 생태계의 모든 기능을 대체하는 앱이라기보다 “문서처럼 열기”에 초점을 둔 도구다. Git 연동, 다중 파일 워크스페이스, 플러그인, 프로젝트 전체 검색, 정교한 Markdown linting 같은 개발자 기능이 필요하면 VS Code, Obsidian, MarkEdit, Typora류 도구와 비교해야 한다. Mark가 잘 맞는 사용자는 “Markdown 파일 하나를 빠르게 읽고 예쁘게 고쳐서 보내고 싶은 사람”이다.

## 내 판단

Mark는 Markdown을 많이 받지만 Markdown 편집기를 항상 켜두고 싶지는 않은 사람에게 유용하다. AI가 만든 보고서 초안, README, 회의록, 체크리스트, 간단한 기술 문서를 빠르게 열어 읽고, 목차와 검색으로 훑고, 조금 다듬어 PDF로 보내는 흐름이라면 코드 편집기보다 덜 무겁게 느껴질 수 있다.

반대로 소스 코드와 문서를 한 프로젝트 안에서 함께 관리하거나, 플러그인과 Git 기반 워크플로가 중요한 사람에게는 부족할 수 있다. 이 앱은 “Markdown을 더 강력하게 프로그래밍 가능한 형식으로 다루는 도구”라기보다 “Markdown을 일반 문서처럼 다루는 작은 앱”이다. 그 경계를 이해하고 쓰면 꽤 깔끔한 도구다.

## 참고한 공개 자료

- [Playloom Mark 공식 페이지](https://playloom.app/mark)
- [Playloom 보안 페이지](https://playloom.app/security)
- [Playloom 개인정보처리방침](https://playmoreai.notion.site/Privacy-Policy-2e311fa0194e8170a2c9fecf3024cd35)
- [Playloom 이용약관](https://playmoreai.notion.site/Terms-of-Use-2e311fa0194e81548f6ff9181421cf9b)
