---
title: "AIHOT: 업종별 뉴스룸을 만드는 자체 호스팅 프레임워크"
date: "2026-09-29T20:13:10"
description: "RSS·웹·API 등 여러 신호원을 모으고, 업종별 선별 기준으로 브리핑·웹 피드·Agent 인터페이스를 만드는 AIHOT의 사용 흐름과 운영 주의점을 정리합니다."
author: "Sangmin Lee"
repository: "KKKKhazix/AIHOT"
sourceUrl: "https://github.com/KKKKhazix/AIHOT"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "Self-hosted"
  - "News Aggregation"
  - "AI Agents"
  - "MCP"
  - "Docker"
  - "LLM"
highlights:
  - "RSS·웹 목록·JSON·X·위챗 공식 계정·외부 스크립트 등 여섯 종류의 신호원을 한 뉴스룸으로 모읍니다."
  - "중복 제거와 업종 사전 필터 뒤 같은 기준으로 두 번 독립 채점하고, 출처 등급별 문턱으로 선별합니다."
  - "프롬프트·신호원·분류·선별 기준을 industry/ 아래에서 바꾸고, 직접 라벨링한 자료로 기준을 재조정할 수 있습니다."
  - "Docker Compose로 자체 호스팅하며 웹·RSS·공개 API·MCP로 결과를 읽습니다."
  - "MIT 라이선스는 코드에 적용되지만 AIHOT 이름과 로고는 별도 사용 허가 대상입니다."
draft: false
---

AIHOT는 완성된 뉴스 구독 서비스라기보다, **내가 중요하게 보는 소식을 모아 업종별 뉴스룸으로 돌리는 자체 호스팅 웹앱 프레임워크**다.[1][3]
기본 예시는 AI 업계용이지만, 신호원·분류·선별 기준·사이트 문구를 바꿔 법률·HR·금융 등 다른 분야에 맞추는 것이 프로젝트의 목적이다.[1][3]

![AIHOT 6-step flow](/images/tips/aihot-selection-pipeline.webp)

*공식 저장소가 설명하는 6단계 흐름: 수집 → 사전 필터 → 독립 채점 → 요약 작성 → 사건 묶기 → 핫토픽과 정기 브리핑.[1] 좁은 화면에서는 좌우로 스크롤하거나 눌러 확대할 수 있다.*

## 어떤 도구인가

신호원은 RSS, 웹 목록, JSON API, X 계정, 위챗 공식 계정, 외부 스크립트 입력을 지원한다.[5]
중복 자료를 정리한 뒤 업종 관련성을 먼저 거르고, 후보는 같은 기준으로 독립 채점 두 번을 받아 출처 등급별 문턱을 넘을 때만 ‘선별’에 들어간다.[4]
통과한 자료에는 중국어 제목·요약·추천 이유·태그를 붙이고, 여러 출처가 다룬 같은 사건을 묶어 웹 피드와 일간·주간·월간 브리핑으로 낸다.[1][4]
결과는 웹뿐 아니라 RSS, 공개 API, MCP, `llms.txt`로도 읽을 수 있어 사람용 뉴스룸과 에이전트용 데이터 출구를 함께 운영할 수 있다.[7]

![AIHOT demo screen](/images/tips/aihot-dashboard.webp)

*공식 README의 UI 예시이며, 화면 숫자는 데모 스냅샷 값으로 운영 성과나 처리량을 검증한 지표가 아니다.[1]*

## 내 업종에 맞추는 핵심

대부분의 업종별 설정은 `industry/` 안에 있다.[3] `site.ts`에서 이름과 문구, `taxonomy.ts`·`topics.json`에서 분류와 주제, `sources.json`에서 시작 신호원, `prompts/`에서 선별·요약 규칙, `selection.ts`에서 선별 문턱을 조정한다.[3]

처음에는 코드를 많이 바꾸기보다 업종 지식을 프롬프트와 예시로 옮기는 편이 낫다.[3] 저장소 가이드는 신호원에서 100–200건을 직접 ‘선별/제외’로 라벨링하고 `scripts/eval-selection.ts`로 정확도·정밀도·재현율을 비교한 다음, 프롬프트와 문턱을 다시 조정하라고 안내한다.[3][4]
가능하면 튜닝에 쓰지 않은 holdout 자료도 남겨 두자.[4] 표본에만 맞춘 선별 규칙인지 별도로 확인할 수 있다.[4]

## 설치와 첫 실행

공식 배포 경로는 Docker Compose이며, 모델 API 키가 필요하다.[6] 로컬 테스트용 시작은 다음과 같다.[6]

초기화 스크립트는 호스트 Node.js 24.11 이상에서 실행해야 한다.[17] Node.js가 없다면 `.env.example`을 `.env`로 복사해 문서대로 필요한 값을 직접 채우는 경로를 쓸 수 있다.[6]
초기화 후 Docker를 시작하기 전에 `.env`에 `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`을 설정한다.[13][15]

```bash
git clone https://github.com/KKKKhazix/AIHOT.git myhot
cd myhot
node scripts/init-env.ts
docker compose up -d --build
```

초기화 스크립트는 `.env`와 무작위 관리자 비밀번호·서명 키·DB 비밀번호를 만들고 관리자 비밀번호를 한 번 출력한다.[13] 생성된 비밀번호를 안전하게 보관하고, `.env`는 Git에 올리지 말자.[13][15]
API 키는 명령행에 직접 넣기보다 `.env`에 비공개로 설정하는 편이 안전하다.[13][15] `.env`가 이미 있으면 초기화 스크립트가 덮어쓰지 않으므로 실행 전에 확인해야 한다.[13]

공개 서버로 쓸 때는 기본 HTTP 포트만 외부에 열어 두지 말고, 도메인과 `SITE_URL`을 설정한 뒤 Caddy HTTPS 프로필이나 기존 reverse proxy를 구성한다.[6] 공식 Caddy 예시는 `PORT=127.0.0.1:3000`, `TRUST_PROXY=true`와 `docker compose --profile https up -d --build`를 안내한다.[6][14]
이 서비스는 데스크톱 앱이 아니라 브라우저로 보는 웹앱이다.[6] 사이트의 `macos-linux` 플랫폼 표기는 Docker 호스트를 위한 가장 가까운 분류이며, 공식 배포 문서는 Docker/Compose 서버 설치를 설명한다.[6]

## 운영 전에 볼 점

모델 호출 비용은 사용량에 따라 달라진다.[6] 유지관리자의 예시 신호원으로 152건을 처음 처리했을 때 약 930회의 모델 호출이 발생했다고 하므로, 본인 데이터 규모로 비용을 시험하고 분당·시간당·일일 예산 상한을 먼저 설정하자.[6]
X·위챗·Jina 같은 외부 수집은 별도 유료 키가 필요한 선택 기능이며, 기본 설정은 사용하지 않도록 되어 있다.[6][15]

원문 전체 노출과 전체 RSS는 기본적으로 꺼져 있고, 출처가 허용할 때만 켜도록 문서가 안내한다.[5]
내부 자료를 넣는다면 본문이 설정한 모델 API로 처리될 수 있으니 제공자의 보관·학습 정책과 조직의 데이터 규칙부터 확인해야 한다.[6][15]
약관·개인정보 처리 페이지도 예시 템플릿이므로 공개 운영 전에 실제 서비스에 맞게 고쳐야 한다.[3]

코드는 MIT지만 `AIHOT` 이름과 로고는 MIT 라이선스 범위에 포함되지 않는다.[8][9] 파생 사이트는 자체 이름과 로고를 쓰고, 저장소의 별도 고지와 제3자 자산 조건도 확인해야 한다.[9]
README는 저장소를 현재 서비스 코드의 스냅샷이라고 설명하며 업데이트 동기화를 보장하지 않는다.[1]
GitHub API의 UTC 타임스탬프상 저장소는 2026-09-28에 만들어졌고, 최신 커밋은 2026-09-29에 기록돼 있다.[2][12]
확인 시점에는 공개 Release와 tag가 없으므로, 운영 환경에서는 검토한 커밋에 고정하고 업그레이드 때 변경점을 다시 살피는 편이 낫다.[10][11][16]

## 내 판단

AIHOT의 핵심은 뉴스 수집 자체보다 **업종의 판단 기준을 수정 가능한 프롬프트·출처 등급·평가셋으로 관리하는 것**이다.[3][4]
Docker와 모델 API를 운영할 수 있고, 매일 확인할 산업 브리핑의 기준을 직접 다듬고 싶은 팀이라면 살펴볼 만하다.[1][6]
간단한 RSS 리더만 필요한 개인에게는 설정·비용·운영 부담이 더 클 수 있다.[6]

## Sources

[1] https://github.com/KKKKhazix/AIHOT — AIHOT GitHub repository and README

[2] https://api.github.com/repos/KKKKhazix/AIHOT — AIHOT GitHub repository metadata

[3] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/docs/customize.md — AIHOT docs: customize for your industry

[4] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/docs/selection.md — AIHOT docs: selection and calibration

[5] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/docs/sources.md — AIHOT docs: sources and full-text policy

[6] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/docs/deploy.md — AIHOT docs: deployment and costs

[7] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/docs/architecture.md — AIHOT docs: architecture

[8] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/LICENSE — AIHOT MIT license

[9] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/NOTICE — AIHOT NOTICE: branding and third-party material

[10] https://api.github.com/repos/KKKKhazix/AIHOT/tags?per_page=10 — AIHOT GitHub tags

[11] https://api.github.com/repos/KKKKhazix/AIHOT/releases/latest — AIHOT latest GitHub release

[12] https://api.github.com/repos/KKKKhazix/AIHOT/commits?per_page=5 — AIHOT recent commit history

[13] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/scripts/init-env.ts — AIHOT setup script: generated secrets

[14] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/docker-compose.yml — AIHOT Docker Compose deployment

[15] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/.env.example — AIHOT environment and secret configuration

[16] https://api.github.com/repos/KKKKhazix/AIHOT/releases?per_page=10 — AIHOT GitHub releases

[17] https://raw.githubusercontent.com/KKKKhazix/AIHOT/main/package.json — AIHOT package.json runtime requirements
