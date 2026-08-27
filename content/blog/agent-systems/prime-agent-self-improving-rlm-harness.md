---
title: "Prime Agent는 긴 작업의 성패를 모델 밖 상태 계층으로 옮긴다"
date: "2026-08-27T10:46:56"
description: "Prime Agent는 persistent REPL, recursive subagent, disk-backed Continual Harness를 결합해 long-horizon agent의 문맥·계산·기억을 분리 운영하려는 오픈소스 RLM 하네스다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Prime Agent
  - RLM
  - Agent Harness
  - Long-Horizon Agents
  - Continual Harness
  - Multi-Agent Systems
draft: false
---

긴 작업을 하는 agent가 무너질 때, 원인은 언제나 모델의 추론 부족일까. 앞선 결정을 잃고, 실행 중인 하위 작업을 추적하지 못하고, 파일·로그·검증 결과를 다음 turn에 제대로 다시 가져오지 못해서 실패하는 경우도 많다. `Prime Agent: A Self-Improving RLM Harness`는 이 문제를 model weight나 prompt 한 장의 문제가 아니라, **모델의 문맥 바깥에 상태와 계산을 어떻게 남길지**의 문제로 다룬다.[1][2]

Prime Intellect가 공개한 Prime Agent는 long-horizon evaluation과 coding workflow를 위한 오픈소스 agent harness다.[1][7]
persistent IPython REPL을 model의 programmatic control surface로 두고, `rlm(...)`으로 독립된 하위 agent session을 만들며, history·memory·skill·prompt·subagent specification을 Continual Harness 상태로 보존한다.[1][7][11]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/prime-agent-paper-architecture.svg"
    alt="사람의 Agents View, root session, subagent, environment와 daemon 및 Continual Harness의 연결을 보여 주는 Prime Agent 논문 공식 구조도"
    style="width: 100%; max-width: 1080px; height: auto; display: block; margin: 0 auto;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. root session과 subagent, daemon, Continual Harness, 사람의 관찰·개입 지점을 함께 놓은 공식 구조도다.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

일반적인 chat agent에서 활성 문맥은 한 번의 model invocation이 직접 읽는 작업 공간이다.[2] 그러나 실제 장기 작업에는 이미 실행한 명령, 큰 파일의 중간 분석, 결과를 기다리는 subagent, 검증 로그, 다음번에도 써야 할 절차처럼 문맥 창에 모두 넣기 어렵거나 넣을 필요가 없는 상태가 계속 생긴다.[2] 논문은 이를 “언제 무엇을 prompt로 직렬화할지”와 “무엇을 주소 지정 가능한 외부 상태로 남길지”를 함께 설계하는 문제로 본다.[2]

Prime Agent의 관점에서 하네스는 단순 tool wrapper가 아니다.[2]
정보 관리는 어떤 상태가 compaction·detach·restart 뒤에도 살아남는지를 결정하고, 계산 관리는 모델이 선택한 action을 코드·도구·recursive session에 연결한다.[10][12]
daemon은 root와 child의 lifecycle을 소유하고, session artifact는 재접속·복구의 기반이 된다.[10][12]

## 핵심 아이디어 / 구조 / 동작 방식

### L0~L3: 문맥 안의 모델과 문맥 밖의 실행 상태를 구분한다

논문은 상태를 네 층으로 나눈다.[2] L0는 학습된 model weight, L1은 한 요청에 보이는 active context, L2는 persistent REPL·code·tool·retained value·recursive session, L3는 disk-backed history·artifact·memory·skill·prompt·subagent specification이다.[2] 특히 L1과 L2 사이의 경계는 token-visible state와 모델이 명시적으로 읽고 쓰는 실행 상태를 구분한다.[2]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/prime-agent-paper-state-hierarchy.svg"
    alt="Prime Agent가 모델 weight, 활성 문맥, REPL과 하위 에이전트, 디스크 기반 영속 상태를 네 층으로 나누고 모델-문맥 경계를 표시한 공식 상태 계층도"
    style="width: 100%; max-width: 1200px; height: auto; display: block; margin: 0 auto;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2. L1은 model이 즉시 보는 문맥이고, L2·L3은 코드·도구·검색으로 선택적으로 다루는 작업 공간이다.[2]
  </figcaption>
</figure>

각 층은 다른 방식으로 바뀐다.[2]
fine-tuning은 L0를, compaction은 L1을, REPL value 및 subagent의 생성·보존·정리는 L2를 바꾼다.[2]
L3의 Continual Harness는 trajectory에서 얻은 근거를 prompt note, memory, skill, subagent specification 같은 typed state의 versioned update로 남기며, base system prompt 자체는 바꾸지 않고 rollback 가능한 기록을 유지한다고 설명한다.[2][7]

### RLM은 “도구 모음”보다 code-first 제어면에 가깝다

Prime Agent의 기본 model-facing tool은 persistent IPython이다.[7][11]
파일 읽기·편집, shell command, 변환, skill 호출, subagent 위임을 각기 다른 built-in UI tool로 나누기보다 Python code에서 조합한다.[11]
`rlm(...)` 호출은 child의 최종 답을 즉시 반환하는 completion API가 아니라, 별도 context·kernel·session directory를 가진 child session의 admission handle을 돌려준다.[7][11]

이 설계는 parent의 L1을 필요한 decision 중심으로 유지하는 대신, 대용량 중간값·실험 code·여러 child의 독립 실행을 L2에 남긴다는 선택이다.[11] 공식 RLM 문서는 parent와 descendant의 session tree, parent-scoped child registry, direct message가 compaction·kernel restart·parent restore 뒤에도 이어지는 lifecycle을 목표로 한다고 설명한다.[11][12]

| 운영 표면 | Prime Agent가 분리하는 역할 | 실무에서 확인할 질문 |
|---|---|---|
| Persistent REPL | code, data, tool output, 중간값을 context 밖에서 조작 | 큰 로그를 prompt에 반복해서 넣지 않고 재탐색할 수 있는가 |
| Recursive subagent | 독립 context와 lifecycle을 가진 병렬 작업 단위 | child 결과·비용·종료를 parent가 추적할 수 있는가 |
| Daemon worker | detach 뒤에도 session·kernel·schedule·descendant를 보유 | terminal 종료와 실제 작업 종료를 구분하는가 |
| Continual Harness | memory, prompt, skill, subagent spec의 선택적 축적 | 수정 근거·version·rollback을 review할 수 있는가 |
| Controls | goal, heartbeat, schedule, autonomous budget·gate | “더 실행했다”와 “검증을 통과했다”를 구분하는가 |

### 장기 실행은 계속 돌리는 기능이 아니라 종료 계약이다

Prime Agent는 persistent goal, heartbeat, schedule, autonomous mode를 같은 worker/session runtime에 연결한다.[12] autonomous mode는 turn·token·wall-clock budget과 user-defined quality gate 안에서 continuation을 허용하며, 문서도 limit 도달이나 gate 하나의 통과가 task 전체 성공을 자동 보장하지는 않는다고 구분한다.[12]

compaction 역시 완료 판정이 아니다.[14] context가 threshold를 넘으면 오래된 대화를 structured summary로 바꾸고 최근 메시지를 남기지만, summary·kept boundary·token count·읽고 수정한 file 목록을 기록해 다음 session context를 재구성하는 복구 절차다.[14]

## 공개된 근거에서 확인되는 점

논문은 ARC-AGI-3 RHAE에서 Prime Agent + Opus 5의 Best@1을 95.5%로 보고하며, 비교용 external reference로 Opus 5 + ARCharness의 30.2%를 함께 제시한다.[2] 저자들은 native-harness rerun이 공개 점수보다 낮았다고도 적기 때문에, 이 수치를 하네스 하나의 보편적 인과 효과가 아니라 특정 model·budget·environment 설정에서의 test-time scaling 결과로 읽어야 한다.[2]

long-context 표에서도 모델별·task별 ordering은 바뀐다.[2] 논문은 여러 long-context·coding task에서 경쟁력을 보고하지만, Table 1의 굵은 표시가 statistical significance를 뜻하지 않는다고 명시한다.[2] 이 글에서 더 중요한 근거는 단일 benchmark의 승패보다, context·REPL·subagent·persistent state를 함께 평가 가능한 execution substrate로 제시했다는 점이다.[2]

공개 범위는 연구용 코드만 있는 상태를 넘는다.[3][5]
GitHub repository는 MIT License이며, 현재 stable `v0.8.1` release에는 설치용 archive, 분리된 core/TUI package archive, `SHA256SUMS`, stable marker가 포함돼 있다.[3][5][13]
release note에는 새 session에서 기본 RLM recursion depth를 1에서 2로 변경한 점도 기록돼 있다.[5]

다만 오픈소스 agent runtime을 “안전한 sandbox”로 오해해서는 안 된다.[7][11]
README와 RLM 문서는 model-generated Python 및 project command가 worker의 운영체제 권한으로 실행되며, worker/kernel 분리는 lifecycle·recovery를 위한 것이지 security sandbox가 아니라고 명시한다.[7][11]
신뢰하지 않는 repository, instruction, skill은 별도 sandbox 또는 제한된 환경에서 다뤄야 한다.[7][11]

## 실무 관점에서의 해석

Prime Agent가 던지는 가장 유용한 질문은 “더 큰 context window가 필요한가”보다 **어떤 상태를 L1에 계속 들고 있어야 하고, 어떤 상태를 L2/L3에 남겨 필요할 때 꺼낼 것인가**다.[2][14]
보고서·codebase·실험 log처럼 큰 증거가 누적되는 작업에서는, context를 요약만 하는 것보다 재검색 가능한 artifact, typed memory, reusable skill, retained subagent를 서로 다른 lifetime으로 관리하는 편이 더 검토 가능하다.[2][14]

도입 순서는 기능을 전부 켜는 것보다 상태 계약을 좁히는 편이 낫다.[12]
첫째, 완료 기준과 external verifier가 있는 단일 long-running task부터 고른다.[12]
둘째, 이번 작업의 임시 code/value와 다음 작업에도 남길 memory·skill을 섞지 않는다.[2][12]
셋째, local refinement·version history·rollback이 있어도 global prompt나 executable skill 변경은 diff review와 human gate를 거친다.[7][12]

또한 agent tree의 비용을 합산해야 한다.[12]
subagent를 많이 만들수록 병렬성은 얻지만, token·time·message queue·검증 책임도 root session에 함께 쌓인다.[10][12]
persistent kernel과 daemon은 편리함을 주지만 sandbox가 아니므로, credential·destructive command·untrusted instruction에는 최소 권한·격리·독립 검증을 별도로 둬야 한다.[10][11][12]

결국 이 논문은 agent의 실력을 model 하나의 property로만 보지 않는다.[1][2]
**실행을 지속시키는 daemon, 문맥 밖에서 계산하는 REPL, 재귀적으로 분업하는 session, 근거를 남기는 harness state, 그리고 검증 가능한 종료 조건**을 함께 설계해야 long-horizon capability를 재현 가능하게 측정할 수 있다는 주장이다.[1][2]
Prime Agent의 수치들은 아직 저자 환경의 보고로 신중히 읽어야 하지만, “하네스 실패를 모델 실패로 착각하지 말자”는 문제 설정 자체는 agent 시스템을 운영하는 팀이 바로 적용할 수 있는 설계 기준이다.[1][2]

## Sources

[1] https://arxiv.org/abs/2608.23552
[2] https://arxiv.org/html/2608.23552v1
[3] https://api.github.com/repos/PrimeIntellect-ai/prime-agent
[5] https://api.github.com/repos/PrimeIntellect-ai/prime-agent/releases/latest
[7] https://raw.githubusercontent.com/PrimeIntellect-ai/prime-agent/main/README.md
[10] https://raw.githubusercontent.com/PrimeIntellect-ai/prime-agent/main/packages/coding-agent/docs/architecture.md
[11] https://raw.githubusercontent.com/PrimeIntellect-ai/prime-agent/main/packages/coding-agent/docs/rlm.md
[12] https://raw.githubusercontent.com/PrimeIntellect-ai/prime-agent/main/packages/coding-agent/docs/long-running-agents.md
[13] https://api.github.com/repos/PrimeIntellect-ai/prime-agent/contents/LICENSE
[14] https://raw.githubusercontent.com/PrimeIntellect-ai/prime-agent/main/packages/coding-agent/docs/compaction.md
