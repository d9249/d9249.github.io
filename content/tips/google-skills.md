---
title: "google/skills는 Google Cloud 작업을 에이전트 스킬로 가져오는 공식 카탈로그다"
date: "2026-05-12T14:51:58"
description: "google/skills는 Gemini API, Cloud Run, BigQuery, GKE, Firebase, Well-Architected Framework 등 Google 제품 작업 지식을 Agent Skills 형식으로 배포하는 공식 스킬 모음이다."
author: "Sangmin Lee"
repository: "google/skills"
sourceUrl: "https://github.com/google/skills"
status: "Open source"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Agent Skills"
  - "Google Cloud"
  - "Gemini API"
  - "AI Agents"
  - "Developer Tools"
highlights:
  - "Gemini API, Cloud Run, BigQuery, GKE, Firebase, AlloyDB 등 Google 제품별 SKILL.md를 한 저장소에서 고를 수 있다."
  - "공식 설치 흐름은 `npx skills add google/skills`이며, 필요한 스킬만 선택해 설치하는 방식이다."
  - "Apache-2.0으로 공개되어 복사·수정·리믹스가 가능하지만 저장소는 active development 상태이고 릴리스 태그는 아직 없다."
  - "Cloud 권한, gcloud 명령, 프로젝트/결제/네트워크 설정을 다루므로 설치 전 스킬 내용을 먼저 읽는 편이 안전하다."
draft: false
---

`google/skills`는 Google 제품과 기술을 AI 에이전트가 더 잘 다루도록 만든 **Agent Skills 카탈로그**다. 일반적인 CLI나 라이브러리라기보다는, Claude Code·Codex·Gemini CLI·Hermes 같은 에이전트가 읽고 따를 수 있는 `SKILL.md` 지침 묶음에 가깝다.

현재 저장소는 Google Cloud 중심이다. Gemini API, Cloud Run, BigQuery, Cloud SQL, Firebase, GKE, AlloyDB 같은 제품별 기본 스킬과 Google Cloud 온보딩·인증·네트워크 관측·Well-Architected Framework 관련 레시피를 제공한다. README 기준으로 저장소는 아직 **active development** 상태이며, 외부 PR은 받지 않고 이슈/요청을 통해 피드백을 받는 형태다.

![google/skills repository](https://opengraph.githubassets.com/google-skills-tips/google/skills)

## 무엇을 담고 있나

저장소 구조는 단순하다. 루트에는 `README.md`, `LICENSE`, `CONTRIBUTING.md`가 있고, 실제 스킬은 `skills/cloud/<skill-name>/SKILL.md`에 들어 있다. 확인 시점의 스킬 수는 13개였다.

주요 범주는 다음과 같다.

- **Gemini API in Agent Platform**: Google Gen AI SDK 사용, Vertex AI/Agent Platform 환경 변수, 모델 선택, 멀티모달·함수 호출·구조화 출력·캐싱·배치 예측 가이드
- **Google Cloud 제품 기본기**: AlloyDB, BigQuery, Cloud Run, Cloud SQL, Firebase, GKE
- **Google Cloud 레시피**: 온보딩, 인증, 네트워크 관측
- **Well-Architected Framework**: Security, Reliability, Cost Optimization 관점의 검토 지침

각 스킬은 YAML frontmatter에 `name`, `description`, 일부는 `compatibility`를 두고, 본문에는 에이전트가 따라야 할 명령어·권한·주의점·권장 SDK 패턴을 적는다. 예를 들어 Gemini API 스킬은 `google-genai`, `@google/genai`, `google.golang.org/genai` 같은 새 Gen AI SDK 사용을 강하게 권하고, 레거시 SDK 사용을 피하라고 지시한다.

## 설치와 첫 사용 흐름

README가 제시하는 공식 설치 명령은 아래 하나다.

```bash
npx skills add google/skills
```

이 명령은 저장소 전체를 무조건 다 넣기보다, 설치 과정에서 필요한 스킬을 선택하는 흐름으로 설명되어 있다. `skills` npm 패키지는 별도 프로젝트로 배포되는 CLI이고, `google/skills`는 그 CLI로 가져올 수 있는 Google 측 스킬 카탈로그라고 보면 된다.

실제로 적용할 때는 한 번에 전부 설치하기보다 다음처럼 접근하는 편이 좋다.

1. 먼저 GitHub에서 필요한 `SKILL.md`를 직접 읽는다.
2. 현재 사용하는 에이전트가 Agent Skills 형식을 어떻게 읽는지 확인한다.
3. `npx skills add google/skills`로 필요한 항목만 선택한다.
4. 설치 후에는 에이전트가 생성하는 `gcloud`, IAM, 결제, 네트워크, 배포 명령을 그대로 실행하지 말고 한 번 더 검토한다.

## 왜 유용한가

이 저장소의 장점은 “Google Cloud 문서를 에이전트가 바로 실행 가능한 작업 지식으로 압축했다”는 데 있다.

예를 들어 Cloud Run 스킬은 서비스·잡·워커 풀의 차이, 필요한 API, IAM 역할, `$PORT`/`0.0.0.0` 같은 배포 실패 포인트를 에이전트 지침으로 정리한다. GKE 스킬은 Autopilot 중심의 골든 패스, 네트워킹, Workload Identity, 릴리스 채널 같은 운영 판단을 다룬다. Gemini API 스킬은 Agent Platform/Vertex AI 문맥에서 인증 방식, SDK 선택, 모델 이름, 구조화 출력과 Live API 같은 기능을 한 파일에 모아둔다.

즉, Google Cloud 작업을 할 때 에이전트가 오래된 SDK 이름을 쓰거나, Cloud Run 컨테이너를 `127.0.0.1`에 바인딩하거나, 필요한 IAM 역할을 빼먹는 식의 실수를 줄이는 데 도움이 된다.

## 활용 포인트

특히 이런 경우에 유용하다.

- 에이전트에게 “Cloud Run에 배포해줘”라고 시키기 전에 기본 배포 규칙을 주입하고 싶을 때
- BigQuery, Cloud SQL, AlloyDB 작업에서 리소스 이름·권한·쿼리 실행 흐름을 놓치지 않게 하고 싶을 때
- Gemini API를 Google Cloud/Agent Platform 환경에서 쓰며 최신 Gen AI SDK 기준을 강제하고 싶을 때
- GKE나 Well-Architected Framework 검토처럼 체크리스트가 긴 작업을 에이전트에게 맡기고 싶을 때
- 개인·팀의 사내 Runbook과 Google의 공개 스킬을 섞어 커스텀 스킬 세트를 만들고 싶을 때

이 저장소 자체가 코드 라이브러리는 아니므로, 설치 후 “무엇이 실행되는가”보다 “에이전트가 어떤 지침을 읽고 판단하는가”에 초점을 두고 평가해야 한다.

## 주의할 점

첫째, 저장소는 공개되어 있고 Apache-2.0 라이선스지만 README가 명시하듯 아직 active development 상태다. GitHub Releases와 태그는 확인 시점에 없었다. 팀 환경에서 재현성을 원한다면 `main` 브랜치를 그대로 따라가기보다 특정 커밋을 기준으로 검토·복사하는 편이 안전하다.

둘째, 이 스킬들은 Google Cloud 리소스를 다룬다. 에이전트가 스킬을 읽고 `gcloud services enable`, IAM 바인딩, Cloud Run 배포, 네트워크 진단, 결제/프로젝트 설정 같은 명령을 제안할 수 있다. 실제 프로젝트에 적용하기 전에는 대상 프로젝트 ID, 권한 범위, 과금 영향, 리전, 공개 접근 여부를 반드시 확인해야 한다.

셋째, installer와 catalog를 분리해서 봐야 한다. `npx skills add google/skills`에서 사용하는 `skills` CLI는 npm 패키지로 배포되는 별도 도구이고, `google/skills` 저장소는 설치 대상 스킬 모음이다. 보안이 중요한 환경에서는 설치 CLI 버전과 가져오는 스킬 커밋을 같이 기록해 두는 편이 좋다.

넷째, 외부 PR은 받지 않는 정책이다. 공개적으로 수정 제안을 바로 병합하는 프로젝트라기보다는, 이슈를 통해 오류·낡은 패턴·신규 스킬 요청을 전달하고 Google 내부 검토를 거치는 형태다. 팀 전용 지침이 필요하면 fork하거나 별도 private skill repo로 remix하는 흐름이 더 현실적이다.

## 내 판단

Google Cloud를 자주 다루는 에이전트 환경이라면 `google/skills`는 바로 체크해볼 만하다. 특히 Gemini API, Cloud Run, GKE처럼 문서 변화가 빠르고 “작은 설정 실수”가 배포 실패나 보안 문제로 이어지는 영역에서 값이 크다.

다만 이 저장소를 설치한다고 에이전트가 자동으로 안전해지는 것은 아니다. 스킬은 지식과 절차를 주입하는 장치이고, 실제 명령 실행 권한은 여전히 사용자의 로컬 환경·클라우드 자격 증명·에이전트 샌드박스 정책에 달려 있다. 개인적으로는 필요한 Google Cloud 제품 스킬만 골라 설치하고, 팀 표준에 맞게 private fork나 별도 스킬 저장소에서 보강하는 방식을 추천한다.

## 참고한 공개 자료

- [google/skills GitHub repository](https://github.com/google/skills)
- [google/skills on skills.sh](https://skills.sh/google/skills)
- [Agent Skills overview](https://agentskills.io/home)
- [skills npm package](https://www.npmjs.com/package/skills)
