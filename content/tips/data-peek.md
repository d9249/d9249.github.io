---
title: "Data Peek은 AI와 ERD를 품은 가벼운 데스크톱 SQL 클라이언트다"
date: "2026-05-10T22:00:07"
description: "Data Peek은 PostgreSQL, MySQL, SQL Server, SQLite를 빠르게 탐색하고 AI 자연어 쿼리, ERD, 성능 분석까지 제공하는 Electron 기반 데스크톱 데이터베이스 클라이언트다."
author: "Sangmin Lee"
repository: "Rohithgilla12/data-peek"
sourceUrl: "https://github.com/Rohithgilla12/data-peek"
status: "Open source / commercial binaries"
license: "MIT source / commercial binaries"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Database"
  - "SQL"
  - "Developer Tools"
  - "AI Assistant"
  - "Desktop App"
highlights:
  - "PostgreSQL, MySQL, Microsoft SQL Server, SQLite를 하나의 데스크톱 앱에서 탐색한다."
  - "자연어 질문을 SQL로 바꾸고 결과를 차트·인사이트로 요약하는 AI Assistant를 제공한다."
  - "ERD, 스키마 탐색, Monaco SQL 에디터, 쿼리 히스토리, 저장 쿼리를 한 화면 흐름으로 묶는다."
  - "macOS, Windows, Linux 릴리스와 Homebrew cask, quick install 스크립트를 제공한다."
draft: false
---

`Data Peek`은 “무거운 데이터베이스 관리 도구를 열기 전에 잠깐 데이터를 확인하고 싶다”는 개발자 사용 사례에 초점을 맞춘 데스크톱 SQL 클라이언트다. Electron, React, TypeScript로 만들어졌고, README 기준으로 PostgreSQL, MySQL, Microsoft SQL Server, SQLite를 지원한다.

핵심은 단순 쿼리 실행만이 아니다. 스키마 탐색, Monaco 기반 SQL 에디터, 결과 그리드, ERD, 쿼리 히스토리, 저장 쿼리, CSV/JSON/Excel 내보내기, 인라인 데이터 편집, 성능 분석, AI 자연어 쿼리까지 “개발 중 데이터 확인”에 필요한 기능을 한 앱에 모아 둔다.

![Data Peek 메인 화면](/images/tips/data-peek-hero.png)

## Data Peek이 풀려는 문제

pgAdmin이나 DBeaver처럼 범용 DB 클라이언트는 강력하지만, 단순히 테이블을 열어 보고 SQL을 몇 번 실행하려는 상황에서는 느리고 복잡하게 느껴질 때가 있다. Data Peek은 이 지점을 정면으로 겨냥한다.

README와 docs가 강조하는 방향은 다음과 같다.

- 앱을 빠르게 열고 바로 연결한다.
- 좌측에서 스키마와 테이블을 검색한다.
- SQL은 Monaco Editor에서 작성하고 실행한다.
- 결과 테이블에서 타입, PK/FK, 관계를 함께 확인한다.
- 자주 쓰는 쿼리는 저장하고, 실행 이력은 다시 불러온다.
- 필요한 경우 AI Assistant에게 자연어로 SQL 초안을 요청한다.

메인 스크린샷을 보면 좌측에는 스키마 트리와 히스토리, 중앙에는 SQL 에디터와 결과 그리드가 있고, 결과 컬럼에는 `uuid`, `varchar`, `integer` 같은 타입 배지와 관계 정보가 함께 표시된다. 개발자가 “지금 이 테이블에 뭐가 있지?”를 빠르게 확인하는 흐름에 맞춰진 UI다.

## AI Assistant: 자연어에서 SQL로

![Data Peek AI Assistant](/images/tips/data-peek-ai-assistant.png)

Data Peek의 차별점은 AI Assistant가 앱 안에 붙어 있다는 점이다. README는 OpenAI, Anthropic, Google, Groq, 로컬 Ollama 모델을 지원한다고 설명한다. BYOK 방식이므로 사용자가 자신의 API 키나 로컬 모델을 설정하는 구조다.

AI Assistant 화면에서는 연결된 데이터베이스의 테이블 수와 스키마를 인식한 상태에서 자연어 요청을 SQL로 바꾼다. 예를 들어 `Join api keys and org` 같은 요청을 입력하면, `api_keys`와 `organizations`의 관계를 이용해 조인 쿼리를 생성하고, 생성된 SQL을 복사하거나 바로 실행하거나 별도 탭으로 열 수 있다.

유용한 포인트는 세 가지다.

- **스키마 인식**: 테이블명과 컬럼, 관계를 기반으로 SQL을 제안한다.
- **실행 가능한 카드**: 생성된 SQL에 `Run Query`, `Open in Tab`, `Copy` 같은 액션이 붙는다.
- **차트와 인사이트**: 결과를 라인 차트나 요약 지표로 보여주는 기능도 포함되어 있다.

다만 AI가 만든 SQL은 그대로 신뢰하기보다 항상 실행 전 확인하는 편이 좋다. 특히 `UPDATE`, `DELETE`, `ALTER TABLE` 같은 쓰기 작업은 미리 결과 범위와 조건을 확인해야 한다.

## ERD와 스키마 탐색

![Data Peek ERD 화면](/images/tips/data-peek-erd.png)

ERD 화면도 Data Peek의 강점이다. 공식 스크린샷에서는 SaaS 예시 데이터베이스의 11개 테이블과 관계가 자동으로 시각화되어 있다. `organizations`를 중심으로 `users`, `projects`, `subscriptions`, `invoices`, `events`, `api_keys` 같은 테이블이 연결되고, 각 테이블 카드에는 컬럼명, 타입, PK/FK 표시가 함께 나온다.

이 기능은 새 코드베이스나 외부 DB를 처음 볼 때 특히 유용하다. SQL을 바로 실행하기 전에 전체 데이터 모델을 보고, 어떤 테이블이 허브인지, 어떤 외래키를 따라가야 하는지, 어떤 테이블을 필터링해서 봐야 하는지를 빠르게 잡을 수 있다.

Data Peek은 여기에 더해 다음 기능도 제공한다.

- 쿼리 실행 계획 확인과 EXPLAIN 뷰어
- 벤치마크 모드와 p50/p90/p99 통계
- 누락 인덱스, N+1 패턴, 느린 쿼리 감지와 개선 제안
- 컬럼 통계와 데이터 프로파일링
- CSV import, fake data generator, JSON/JSONB 편집
- PostgreSQL LISTEN/NOTIFY, connection health monitor, kill query 기능

## 설치와 배포 상태

README 기준 quick install은 다음과 같다.

```bash
curl -fsSL https://install.cat/Rohithgilla12/data-peek | sh
```

Windows PowerShell에서는 다음 명령을 제공한다.

```powershell
irm https://install.cat/Rohithgilla12/data-peek | iex
```

macOS 사용자는 Homebrew cask도 쓸 수 있다.

```bash
brew install --cask Rohithgilla12/tap/data-peek
```

GitHub Releases에는 macOS `.dmg`, Windows `.exe`, Linux `.AppImage`/`.deb`/`.tar.gz` 계열 자산이 올라와 있다. Electron Builder 설정도 macOS DMG/ZIP, Windows NSIS installer, Linux AppImage/deb 타깃을 갖고 있다. README에 따르면 macOS 앱은 v0.4.0부터 code signed and notarized 상태로 배포된다.

주의할 점은 버전 표기가 조금 빠르게 움직인다는 것이다. 조사 시점 기준 루트 `package.json`과 tags는 `v0.21.7`까지 올라와 있지만, GitHub API의 최신 downloadable release는 `v0.21.2`였다. 실제 설치 전에는 Releases 페이지와 앱 내 업데이트 상태를 함께 확인하는 편이 좋다.

## 라이선스와 보안 주의점

이 프로젝트는 단순한 “MIT 오픈소스 앱”으로만 보면 안 된다. `LICENSE` 파일 상단에는 MIT License가 있지만, 같은 파일 아래에 **Commercial Use License** 섹션이 별도로 있다. 소스 코드는 MIT로 공개되어 있지만, pre-built binaries는 영리 조직에서 업무용으로 사용할 경우 라이선스가 필요하다고 명시한다.

또한 데이터베이스 클라이언트 특성상 다음 항목을 꼭 확인해야 한다.

- 연결 정보와 API 키를 저장하는 앱이므로, 회사 DB에 붙이기 전 보안 정책을 확인한다.
- README는 connection credentials가 로컬에서 암호화되고 telemetry가 없다고 설명한다.
- 소스의 storage 계층은 Electron `safeStorage` 기반 암호화 키를 사용하지만, OS 암호화가 불가능한 환경에서는 fallback key 경로가 있다.
- AI Assistant를 외부 API provider로 쓰면 스키마와 질문/결과 일부가 외부 모델 API로 나갈 수 있다.
- 민감 데이터가 있는 DB에서는 Ollama 같은 로컬 모델 옵션이나 마스킹 기능을 우선 검토하는 편이 안전하다.
- 인라인 편집, table designer, kill query 같은 기능은 편하지만 운영 DB에서는 권한을 최소화해야 한다.

## 내 판단

Data Peek은 “가볍게 DB를 들여다보는 앱”으로 시작했지만, 현재 기능 목록은 꽤 넓다. SQL 에디터, 스키마 탐색, ERD, AI Assistant, 성능 분석, 데이터 편집까지 들어가 있어 개발자용 로컬 DB 클라이언트와 AI 데이터 보조 도구의 중간 지점에 있다.

개인 프로젝트, 로컬 개발 DB, staging DB를 빠르게 탐색하는 용도라면 바로 써볼 만하다. 반대로 회사 운영 DB에 붙일 계획이라면 commercial binary license, AI provider 설정, credential storage, 쓰기 권한 범위를 먼저 검토하는 것이 좋다.

## 참고한 공개 자료

- [Rohithgilla12/data-peek GitHub repository](https://github.com/Rohithgilla12/data-peek)
- [Data Peek 공식 홈페이지](https://www.datapeek.dev/)
- [Data Peek Releases](https://github.com/Rohithgilla12/data-peek/releases)
- [README.md](https://github.com/Rohithgilla12/data-peek/blob/main/README.md)
- [LICENSE.md](https://github.com/Rohithgilla12/data-peek/blob/main/LICENSE.md)
- [apps/desktop/electron-builder.yml](https://github.com/Rohithgilla12/data-peek/blob/main/apps/desktop/electron-builder.yml)
