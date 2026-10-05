---
title: "Learn Harness Engineering: 코딩 에이전트 하네스 실습 코스"
date: "2026-10-05T13:35:00"
description: "코딩 에이전트의 지침·상태·검증·범위를 설계하는 한국어 실습형 오픈소스 코스."
author: "Sangmin Lee"
repository: "walkinglabs/learn-harness-engineering"
sourceUrl: "https://github.com/walkinglabs/learn-harness-engineering"
status: "Open source course"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "AI Agents"
  - "Coding Agents"
  - "Developer Tools"
  - "Education"
highlights:
  - "한국어 실습 코스"
  - "지침·상태·검증·범위·수명 주기"
  - "Bash 감사 도구"
  - "MIT 라이선스"
draft: false
---

Learn Harness Engineering은 코딩 에이전트에 더 좋은 프롬프트를 얹기보다, 에이전트가 저장소를 읽고 범위를 지키며 검증을 반복할 수 있는 작업 환경을 설계하는 실습형 코스다.[1][2]
공식 사이트에는 한국어 강의와 프로젝트, 복사해 쓸 수 있는 리소스가 각각 학습 경로로 정리되어 있다.[8][9]

![하네스의 다섯 하위 시스템: 지침, 상태, 검증, 범위, 수명 주기](/images/tips/learn-harness-engineering-subsystems.png)

*공식 한국어 README에 실린 하네스 구성도.[13] 모바일에서는 그림을 가로로 밀어 보거나 눌러 확대하면 세부 내용을 읽기 쉽다.*

## 무엇을 배우나

한국어 2강은 하네스를 모델 바깥의 다섯 하위 시스템, 즉 지침·상태·검증·범위·수명 주기로 설명한다.[10]
강의는 개념 설명에서 끝나지 않고, AGENTS.md나 CLAUDE.md, 진행 상태 파일, 검증 명령, 세션 인계 같은 저장소 산출물을 직접 다루도록 안내한다.[9][10]

현재 영문 README의 상세 커리큘럼과 저장소 트리에는 14개 강의와 8개 프로젝트가 보인다.[2][12]
다만 README의 이전 요약은 13강·7개 프로젝트, 한국어 프로젝트 소개는 6개라고 적어 표기가 서로 맞지 않는다.[2][11]
정확한 개수보다 현재 강의·프로젝트 목차를 기준으로 보는 편이 낫다.[11][12]

## 빠르게 써보기

문서를 로컬에서 미리 보려면 저장소 루트에서 VitePress 개발 서버를 실행한다.[2][5]

```sh
npm install
npm run docs:dev
```

저장소를 복제한 뒤 루트에서 프로젝트 경로를 넘겨 감사 스크립트를 실행한다.[2][6]

```sh
bash tools/audit-harness.sh PROJECT
```

`PROJECT`는 검사할 저장소의 실제 경로로 바꾼다.[6]

이 도구는 다섯 하위 시스템에 필요한 파일과 설정을 점검하며, 핵심 항목이 모두 통과하면 종료 코드 0을 반환한다.[6]
Node.js는 필요하지 않지만, 파일·패턴 중심의 구조 점검이므로 프로젝트 테스트를 직접 실행하거나 에이전트의 실제 성공률을 보증하지는 않는다.[6][7]
새 하네스를 만들고 싶다면 `skills/harness-creator/`의 생성·검증 스크립트도 살펴볼 수 있으며, 만들어진 파일은 프로젝트 규칙에 맞게 검토하고 수정해야 한다.[7]

## 도입 전에 볼 점

GitHub Releases와 tags에는 등록된 항목이 없고, 저장소에 포함된 라이선스는 MIT다.[3][4][14]
한국어 문서는 브라우저로 볼 수 있으며, 아래 macOS/Linux 분류는 포함된 Bash 도구를 기준으로 한 사이트의 넓은 범주이지 별도 데스크톱 앱의 지원표는 아니다.[6][8]

## 내 판단

코딩 에이전트를 이미 쓰지만 매번 저장소 규칙을 설명하거나, 긴 작업의 상태·검증이 자주 끊기는 팀이라면 한국어 2강과 리소스 템플릿부터 보기 좋다.[9][10]
감사 점수는 개선 후보를 찾는 출발점으로 쓰고, 중요한 판단은 실제 작업을 시켜 본 결과와 테스트 증거로 확인하는 편이 안전하다.[6][7]

## Sources

[1] https://github.com/walkinglabs/learn-harness-engineering

[2] https://raw.githubusercontent.com/walkinglabs/learn-harness-engineering/main/README.md

[3] https://api.github.com/repos/walkinglabs/learn-harness-engineering/releases

[4] https://api.github.com/repos/walkinglabs/learn-harness-engineering/tags

[5] https://raw.githubusercontent.com/walkinglabs/learn-harness-engineering/main/package.json

[6] https://raw.githubusercontent.com/walkinglabs/learn-harness-engineering/main/tools/audit-harness.sh

[7] https://raw.githubusercontent.com/walkinglabs/learn-harness-engineering/main/skills/harness-creator/SKILL.md

[8] https://walkinglabs.github.io/learn-harness-engineering/ko

[9] https://raw.githubusercontent.com/walkinglabs/learn-harness-engineering/main/docs/ko/index.md

[10] https://raw.githubusercontent.com/walkinglabs/learn-harness-engineering/main/docs/ko/lectures/lecture-02-what-a-harness-actually-is/index.md

[11] https://raw.githubusercontent.com/walkinglabs/learn-harness-engineering/main/docs/ko/projects/index.md

[12] https://api.github.com/repos/walkinglabs/learn-harness-engineering/git/trees/main?recursive=1

[13] https://raw.githubusercontent.com/walkinglabs/learn-harness-engineering/main/assets/readme/ko-KR/harness-subsystems.png

[14] https://raw.githubusercontent.com/walkinglabs/learn-harness-engineering/main/LICENSE
