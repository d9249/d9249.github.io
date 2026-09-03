---
title: "Harness-of-Harness는 coding agent를 한 번의 실행기가 아니라 계속 개선되는 개발 루프로 만든다"
date: "2026-09-03T19:28:59+09:00"
description: "Harness-of-Harness는 planner·developer·QA tester를 artifact와 evidence로 연결해, coding agent가 여러 iteration에 걸쳐 계획·구현·검증을 누적하도록 설계한 autonomous software development harness다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Harness-of-Harness
  - Autonomous Software Development
  - Coding Agents
  - Agent Harness
  - Continual Improvement
draft: false
---

coding agent의 첫 결과를 받아 사람이 다음 요구를 덧붙이는 방식은, 짧은 feature에는 충분하다. 하지만 여러 날 이어지는 개발에서는 중간 구현이 깨지지 않게 보존하면서 bug, UX, test, 배포 조건을 차례로 닫아야 한다. 이때 어려운 점은 model이 code를 한 번 생성하는가보다 **어떤 변경을 다음 iteration으로 넘기고, 무엇을 독립적으로 검증하며, 실패를 어떻게 다음 계획의 증거로 남기는가**에 있다.

<em>Harness-of-Harness: Multi-Day Autonomous Software Development with Continual Improvement</em>는 기존 coding-agent harness 위에 planning–coding–testing loop를 다시 얹는다. Harness-of-Harness(HoH)는 Project Planner, Developer, QA Tester를 분리하고, software artifact·개발 문서·검증 evidence를 iteration 사이에 명시적으로 전달한다.[1][2]

논문은 GameCraft-Bench, FrontierSWE, ProgramBench에서 Codex + GPT-5.5, OpenCode + DeepSeek-V4-Pro, Pi + MiniMax-M3의 세 harness–model 조합을 비교했다. 저자들은 HoH를 세 번 반복했을 때 standalone harness 대비 평균 상대 향상 <strong>52.25%</strong>, 최대 <strong>82.86%</strong>를 보고한다.[1][2] 이는 특정 agent model의 절대 성능 순위라기보다, 반복 개발을 관리하는 상위 control loop가 결과물의 완성도에 미치는 영향을 살펴본 실험이다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/harness-of-harness-framework.webp">
    <img src="/images/blog/harness-of-harness-framework.webp" alt="사용자 요구사항에서 Project Planner, Developer, QA Tester가 개발 문서·software artifact·evidence bundle을 교환하며 반복 개발하는 Harness-of-Harness 공식 구조도" style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;" />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">논문 Figure 3. HoH는 계획·구현·QA를 독립 역할로 두고, artifact와 evidence를 다음 iteration의 입력으로 되돌린다.[2]</figcaption>
</figure>

## 무엇을 해결하려는가

논문이 겨냥하는 것은 “한 번의 agent run으로 완성된 code를 받는” 상황이 아니다. 실제 소프트웨어 작업에서는 현재 artifact의 알려진 결함, 이미 검증된 동작, 남아 있는 요구사항, 이전 변경이 보존해야 하는 제약이 함께 존재한다. 이 정보를 대화 요약이나 직전 prompt에만 남기면 iteration이 늘수록 좋은 변경도 쉽게 되돌리고, test 통과와 제품 품질을 혼동하기 쉽다.[2]

HoH의 핵심 주장은 coding harness를 단순 실행 도구가 아니라 **계속 개선되는 개발 시스템의 한 component**로 봐야 한다는 것이다. 따라서 agent가 생성한 코드뿐 아니라, 무엇을 확인했고 어떤 기준을 통과했는지를 구조화된 evidence로 남긴다. 다음 계획은 이 evidence와 현재 project state를 함께 읽고 하나의 제한된 task scope를 고른다.[1][2]

## 핵심 아이디어 / 구조 / 동작 방식

### 세 역할은 같은 파일을 편집하지 않고, 서로 다른 책임을 가진다

- **Project Planner**는 software specification, 이전 project state, evidence bundle을 바탕으로 unresolved gap과 검증된 behavior를 구분한다. 그리고 보존 제약·validation requirement를 가진 development document를 만든다.
- **Developer**는 이 문서에서 정의된 task scope 안에서 code와 asset을 고친다. 결과는 새 software artifact와 갱신된 개발 문서다.
- **QA Tester**는 candidate artifact를 read-only 상태로 받고, white-box test·black-box test·source inspection·build/test integrity를 조합해 evidence bundle을 만든다. planner가 스스로 만든 결과를 승인하지 않게 하는 분리다.[2]

여기서 중요한 산출물은 code diff 하나가 아니다. HoH는 iteration마다 `software artifact`, `development document`, `evidence bundle`의 세 상태를 materialize한다. development document에는 prior issue와 verified behavior가 남고, evidence에는 기능 정확성, interface·interaction, data·dependency, configuration, stability·completeness에 대한 관찰이 들어간다.[2]

이 경계는 실무에서 reviewability를 높인다. “agent가 계속 돌고 있다”보다 “어떤 요구가 아직 열려 있고, 어떤 동작은 다시 깨면 안 되며, 어떤 test 관찰이 그 판단을 지지하는가”를 다음 iteration이 직접 읽을 수 있기 때문이다.

### 반복은 무제한 실행이 아니라 bounded change와 independent acceptance의 조합이다

HoH는 매 loop에 새 목표를 넓게 추가하는 대신, planner가 prior state와 evidence를 결합해 하나의 priority task scope를 정한다. developer는 그 범위에서 변경하고, QA tester는 candidate artifact를 평가한다. QA가 확인한 evidence는 다음 planner의 입력으로 돌아간다.[2]

이 설계는 장기 개발에서 흔한 두 실패를 줄이려는 선택이다. 첫째, 새 기능을 넣다가 이미 동작하는 부분을 망가뜨리는 regression이다. 둘째, “command가 실행됐다”는 신호를 실제 사용자 관점의 completion으로 잘못 읽는 문제다. HoH의 QA 표면에는 build·test integrity뿐 아니라 UI/interaction, configuration, completeness가 포함되며, 이는 단위 test만으로 닫히지 않는 요구를 겨냥한다.[2]

## 공개된 근거에서 확인되는 점

논문의 benchmark 결과는 세 개발 pass를 쓴 HoH@3와 standalone harness를 비교한다. GameCraft-Bench는 runnable artifact가 아니면 0점을 주고, 실행 가능한 game은 core mechanics·content depth·functional visuals·art and presentation을 합쳐 평가한다. 논문은 45개 task의 overall score를 평균낸다.[2]

| 평가 표면 | 논문이 확인하려는 것 | 해석할 때의 범위 |
|---|---|---|
| GameCraft-Bench | 게임 artifact의 실행 가능성과 mechanic·content·visual·presentation 품질 | 45개 task 평균이며, compile/run 실패는 0점이다. |
| FrontierSWE | from-scratch implementation을 포함한 open-ended software engineering | 저자들은 자원 제약 때문에 17개 중 15개 task를 선택했다. |
| ProgramBench | program-level 개발 task에서의 반복 개발 효과 | 세 harness–model 조합에서 standalone과 HoH@3를 비교했다. |

저자들의 aggregate claim은 HoH@3가 세 benchmark와 세 harness–model 조합에서 standalone harness를 일관되게 앞섰다는 것이다. 다만 이 결과를 “세 번 돌리면 모든 agent가 52.25% 좋아진다”로 일반화하면 안 된다. 평가한 backend, task subset, toolchain, loop budget이 고정된 조건의 논문 보고이며, 반복 횟수가 늘면 token·wall-clock·검증 비용도 함께 늘어난다.[2]

또 하나의 공개 근거는 long-running demonstration이다. 논문과 공식 project는 HoH가 70회 이상의 iteration으로 first-person shooter <em>Fusepoint</em>를 개발한 사례를 제시한다. 공식 repository의 `gameloop` branch에는 Project Planner → Developer → QA Tester workflow와 각 loop의 focus·strategy·task 기록이 남아 있다.[3][4]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/harness-of-harness-fusepoint-trajectory.webp">
    <img src="/images/blog/harness-of-harness-fusepoint-trajectory.webp" alt="Harness-of-Harness가 FPS Fusepoint를 70회 이상 반복 개발하며 새 issue와 닫힌 issue, 기능·연출·수정 단계를 표시한 공식 trajectory" style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;" />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">논문 Figure 1. Fusepoint 사례는 iteration별 issue 흐름과 feature·polish·recovery 단계를 시각화한다. 작은 레이블은 원본을 열어 확인할 수 있다.[2]</figcaption>
</figure>

이 사례는 product-quality를 독립적으로 인증하는 benchmark가 아니라 저자들이 공개한 end-to-end demonstration이다. 그래도 1회성 code generation이 아니라, feature 추가 뒤의 regression recovery와 polish까지 포함한 trace-backed workflow라는 점은 repository 기록으로 확인할 수 있다.[3][4]

## 실무 관점에서의 해석

HoH에서 가져갈 수 있는 핵심은 multi-agent 역할 수를 늘리는 일이 아니다. 더 중요한 것은 **planner의 task selection, developer의 artifact modification, QA의 acceptance를 서로 다른 입력·출력 계약으로 고정하는 것**이다. 코드 agent를 여러 번 실행하더라도, 이전 iteration에서 무엇이 확인됐는지와 다음 변경이 보존해야 할 범위가 남지 않으면 장기 작업은 반복이 아니라 재시도가 된다.

도입할 때는 세 역할을 완벽히 분리하기 전에 evidence contract부터 좁게 만드는 편이 낫다. 예를 들어 CI 결과, screenshot, reproduction command, expected/actual behavior, 변경된 file 목록을 iteration 산출물로 고정할 수 있다. 이후에 이 evidence를 읽는 planner와 독립적으로 acceptance를 판정하는 verifier를 붙이면 “개발이 진행됐다”와 “요구사항이 닫혔다”를 구분할 수 있다.

공개 범위도 신중히 봐야 한다. 공식 GitHub repository는 framework 개요, project page, Fusepoint trajectory와 showcase를 제공하지만 README에는 HoH-lite를 `Coming soon`으로 표시한다. 따라서 현재 HoH는 즉시 설치해 production에 넣을 완성된 framework라기보다, 논문·project·trace로 검토 가능한 autonomous development methodology와 사례 묶음으로 읽는 편이 정확하다.[3][4]

결국 장기 autonomous development의 경쟁력은 한 번의 큰 계획보다, **작은 변경을 evidence로 승인하고 그 evidence를 다음 계획에 되돌리는 닫힌 loop**에 있다. HoH는 그 loop를 planner, developer, tester의 역할명보다 artifact·문서·검증 증거의 흐름으로 설계했다는 점에서 참고할 만하다.

## Sources

[1] https://arxiv.org/abs/2609.01481 — arXiv abstract: 2609.01481
[2] https://arxiv.org/html/2609.01481v1 — arXiv HTML: 2609.01481v1
[3] https://github.com/Flesymeb/HarnessOfHarness — Harness-of-Harness official repository
[4] https://flesymeb.github.io/HarnessOfHarness/ — Harness-of-Harness official project page
[5] https://github.com/Flesymeb/fusepoint/tree/gameloop — Fusepoint 공개 개발 기록
