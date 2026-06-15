---
title: "Learn Harness Engineering은 코딩 에이전트를 위한 ‘실행 환경 설계’를 커리큘럼으로 만든다"
date: "2026-06-15T11:41:07"
description: "walkinglabs/learn-harness-engineering은 하네스 엔지니어링을 12개 강의, 6개 실습 프로젝트, 복사 가능한 템플릿과 harness-creator 스킬로 정리한 오픈소스 코스다. 프롬프트 팁보다 에이전트가 읽고, 실행하고, 검증하고, 다음 세션으로 이어갈 수 있는 저장소 구조가 핵심이다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - Harness Engineering
  - Coding Agents
  - Agent Workflows
  - Codex
  - Claude Code
  - AI Engineering
  - Developer Tools
draft: false
---

코딩 에이전트를 오래 써 보면 반복해서 같은 결론에 도착한다. 모델이 코드를 꽤 잘 쓰는 것과, 실제 저장소에서 긴 작업을 안정적으로 끝내는 것은 다른 문제다. 작업 요구사항이 흐릿하거나, 프로젝트 규칙이 사람 머릿속에만 있거나, 테스트와 빌드 명령이 명확하지 않거나, 이전 세션의 상태가 사라지면 좋은 모델도 쉽게 길을 잃는다.

`walkinglabs/learn-harness-engineering`은 이 문제를 “더 좋은 프롬프트”가 아니라 <strong>하네스 엔지니어링</strong>이라는 실행 환경 설계 문제로 다룬다. 저장소를 확인해 보면 이 프로젝트는 단순한 글 모음이 아니다. VitePress 기반 문서 사이트, 12개 강의, 6개 실습 프로젝트, 다국어 리소스 라이브러리, 그리고 실제로 다른 저장소에 복사해서 쓸 수 있는 `harness-creator` 스킬까지 포함한 오픈소스 코스다.

조회 시점 기준 GitHub API에서 확인한 저장소 설명은 “Harness engineering beginner tutorial, from 0 to 1”이고, 공개 저장소는 MIT 라이선스다. 별도 release나 tag 중심 배포보다는 문서와 템플릿을 계속 갱신하는 course repository에 가깝다. 그래서 이 글에서는 “새 프레임워크 출시”라기보다, 코딩 에이전트 시대의 작업 환경을 어떻게 가르치고 표준화하려는지에 초점을 맞춰 봤다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/learn-harness-engineering-home.webp"
    alt="Learn Harness Engineering documentation home page showing lectures, projects, and resource library cards"
    style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 12px;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Learn Harness Engineering 문서 사이트. 강의, 프로젝트, 리소스 라이브러리로 진입점을 나누고, 코딩 에이전트가 안정적으로 일하기 위한 저장소 구조를 단계적으로 설명한다.
  </figcaption>
</figure>

## 핵심 문제의식: 모델이 아니라 작업 환경이 실패한다

README의 정의는 꽤 직접적이다. 하네스 엔지니어링은 모델 주위에 완전한 작업 환경을 만들어서 신뢰 가능한 결과를 내게 하는 일이다. 더 나은 프롬프트를 쓰는 것만이 아니라, 모델이 작동하는 시스템 자체를 설계하는 것이다.

이 저장소가 반복해서 강조하는 실패 양상은 실무에서 익숙하다.

- 요구사항이 모호해서 에이전트가 추측한다.
- 팀 규칙과 아키텍처 제약이 문서화되어 있지 않다.
- 매 세션마다 설치, 빌드, 테스트 방법을 다시 탐색한다.
- 검증 명령이 없어서 에이전트가 “보기엔 괜찮다”로 완료를 선언한다.
- 긴 작업이 여러 세션으로 넘어가면 진행 상태가 사라진다.

이때 해결책은 “모델을 바꾸자”가 아니라 “에이전트가 일하는 저장소를 바꾸자”다. `AGENTS.md`나 `CLAUDE.md`로 시작 경로를 고정하고, `feature_list.json`과 progress log로 상태를 남기고, `init.sh`와 테스트 명령으로 검증 루프를 만들고, 세션 종료 시 handoff를 남기는 식이다.

저장소의 README는 하네스를 다섯 하위 시스템으로 나눈다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/learn-harness-engineering-subsystems.png"
    alt="Diagram of harness engineering subsystems: instructions, state, verification, scope, and session lifecycle"
    style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 12px;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    이 코스가 제안하는 하네스의 5개 하위 시스템. Instructions, State, Verification, Scope, Session Lifecycle이 함께 있어야 에이전트 작업이 다음 세션까지 이어진다.
  </figcaption>
</figure>

| 하위 시스템 | 대표 산출물 | 역할 |
|---|---|---|
| Instructions | `AGENTS.md`, `CLAUDE.md`, `docs/` | 에이전트가 무엇을 읽고 어떤 순서로 작업할지 알려준다. |
| State | `feature_list.json`, `progress.md`, git log | 무엇이 완료됐고, 무엇이 진행 중이며, 다음에 무엇을 해야 하는지 남긴다. |
| Verification | tests, lint, type-check, smoke run | “완료”를 주장하기 전에 실행 가능한 증거를 요구한다. |
| Scope | one feature at a time, definition of done | 에이전트가 여러 기능을 반쯤 건드리는 것을 막는다. |
| Session Lifecycle | `init.sh`, clean-state checklist, handoff note | 시작과 종료 절차를 고정해 다음 세션이 이어받을 수 있게 한다. |

이 구분이 중요한 이유는 하네스를 “문서 하나 잘 쓰기”로 축소하지 않기 때문이다. 실제 실패는 instruction만의 문제가 아니라 상태, 검증, 범위, 수명주기가 함께 깨질 때 생긴다. 이 코스는 그 실패 지점을 각각 독립된 설계 대상으로 만든다.

## 구성: 12개 강의, 6개 프로젝트, 리소스 라이브러리

코스의 본문은 세 갈래로 나뉜다.

첫째, 12개 lecture는 이론을 담당한다. 강의 제목만 봐도 흐름이 선명하다. “왜 강한 모델도 실패하는가”에서 시작해, “왜 저장소가 system of record가 되어야 하는가”, “왜 하나의 거대한 instruction file이 실패하는가”, “왜 long-running task가 continuity를 잃는가”, “왜 agent가 너무 빨리 victory를 선언하는가” 같은 질문으로 이어진다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/learn-harness-engineering-lecture-01.webp"
    alt="Lecture 01 page from Learn Harness Engineering explaining why strong models do not mean reliable execution"
    style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 12px;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Lecture 01은 “강한 모델이 곧 안정적인 실행은 아니다”라는 thesis로 출발한다. 모델 성능과 실행 신뢰성을 분리해서 보는 것이 코스의 출발점이다.
  </figcaption>
</figure>

둘째, 6개 project는 같은 제품을 단계적으로 발전시키는 실습이다. 프로젝트의 공통 대상은 Electron 기반 personal knowledge base desktop app이다. 문서 목록, Q&A 패널, 로컬 데이터 디렉터리, 문서 import, indexing, grounded answer와 citation 같은 기능을 가진 앱을 조금씩 개선한다. 중요한 점은 매번 다른 장난감 예제를 만드는 것이 아니라, 같은 앱을 P01에서 P06까지 진화시키면서 하네스가 실제 작업 결과를 어떻게 바꾸는지 보게 한다는 점이다.

| 단계 | 실습 초점 | 하네스 메커니즘 |
|---|---|---|
| P01 | prompt-only vs rules-first 비교 | `AGENTS.md` + `init.sh` + `feature_list.json` |
| P02 | agent-readable workspace 만들기 | 저장소 구조와 persistent state |
| P03 | multi-session continuity | progress log와 handoff |
| P04 | runtime feedback와 scope control | 너무 많이/적게 하는 문제 제어 |
| P05 | grounded Q&A verification | self-verification과 evidence-based completion |
| P06 | complete harness capstone | 관찰 가능성, 디버깅, 전체 하네스 조립 |

셋째, resource library는 바로 복사해서 쓸 수 있는 템플릿을 제공한다. README와 `docs/en/resources/index.md`에서 확인되는 minimal pack은 `AGENTS.md` 또는 `CLAUDE.md`, `feature_list.json`, `claude-progress.md`, `init.sh`다. 여기에 session handoff, clean-state checklist, evaluator rubric, OpenAI-style advanced repository skeleton이 추가된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/learn-harness-engineering-resources.webp"
    alt="Learn Harness Engineering resource library page with templates and openai advanced repository structure"
    style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 12px;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    리소스 라이브러리는 코스의 실무적인 부분이다. 최소 템플릿, reference note, advanced repository skeleton을 나눠 제공한다.
  </figcaption>
</figure>

이 구조 덕분에 이 저장소는 읽을거리와 starter kit 사이에 걸쳐 있다. 처음에는 lecture로 개념을 잡고, 이후 프로젝트로 실패 양상을 관찰한 뒤, 템플릿을 자기 저장소에 옮겨 붙이는 흐름이다.

## 가장 실용적인 부분: `harness-creator` 스킬

저장소 안에서 특히 눈에 띄는 부분은 `skills/harness-creator/`다. 이 디렉터리는 하네스 엔지니어링을 에이전트용 skill로 패키징한다. README 기준 설치 명령은 다음과 같다.

```bash
npx skills add walkinglabs/learn-harness-engineering --skill harness-creator
```

스킬의 목적은 명확하다. 한 저장소가 코딩 에이전트에게 필요한 다섯 가지—instructions, state, verification, scope boundaries, lifecycle handoff—를 제공하는지 만들고 점검한다. 함께 제공되는 스크립트도 실용적이다.

```bash
node skills/harness-creator/scripts/create-harness.mjs --target /path/to/project
node skills/harness-creator/scripts/validate-harness.mjs --target /path/to/project
node skills/harness-creator/scripts/run-benchmark.mjs --target /path/to/project --html /path/to/report.html
```

`create-harness.mjs`는 대상 프로젝트에 `AGENTS.md` 또는 `CLAUDE.md`, `feature_list.json`, `progress.md`, `init.sh`, `session-handoff.md` 같은 파일을 만들도록 설계되어 있다. `validate-harness.mjs`는 다섯 하위 시스템을 구조적으로 점검한다. `run-benchmark.mjs`와 HTML report는 shareable assessment를 만드는 쪽에 가깝다.

다만 여기서 중요한 caveat가 있다. 이 스킬의 README도 structural score가 실제 before/after agent-session testing을 대체하지 않는다고 선을 긋는다. 즉 “하네스 파일이 있다”는 사실은 출발점이지, 에이전트 성능이 실제로 좋아졌다는 최종 증거는 아니다. 진짜 검증은 대표 작업을 정하고, agent run을 반복하고, 실패 원인을 하네스 계층별로 기록하는 과정에서 나온다.

이 점은 오히려 신뢰를 준다. 하네스 엔지니어링을 과장된 마법처럼 팔지 않고, structural readiness와 empirical improvement를 구분하고 있기 때문이다.

## 왜 지금 유용한가

최근 코딩 에이전트 논의는 빠르게 “모델이 코드를 얼마나 잘 쓰는가”에서 “에이전트가 오래 일할 수 있는 환경을 어떻게 만들 것인가”로 이동하고 있다. OpenAI의 harness engineering 글, Anthropic의 long-running agents 글, Thoughtworks/Martin Fowler의 coding agent user harness 글이 모두 비슷한 방향을 가리킨다.

`learn-harness-engineering`의 가치는 이 흐름을 beginner course 형태로 낮춰 놓은 데 있다. 좋은 팀이 암묵적으로 하던 일을, 에이전트가 읽을 수 있는 파일과 명령으로 바꾸는 법을 단계별로 보여준다.

실무적으로는 이런 팀에 특히 맞다.

- Claude Code, Codex, Cursor, Gemini CLI 같은 코딩 에이전트를 이미 쓰고 있지만 결과가 들쭉날쭉한 팀
- 매번 같은 setup 설명, 테스트 명령, architecture rule을 반복해서 프롬프트에 붙이는 팀
- multi-session 작업에서 에이전트가 이전 맥락을 잃는 문제를 겪는 팀
- “에이전트가 완료했다고 했는데 실제로는 실패”하는 verification gap을 줄이고 싶은 팀
- 개인 프롬프트가 아니라 저장소 자체를 agent-readable하게 만들고 싶은 팀

특히 `AGENTS.md` 하나만 두는 것보다, feature state와 progress log와 `init.sh`까지 함께 두라는 메시지가 좋다. 많은 팀이 instruction file은 만들지만, 상태와 검증을 별도 artifact로 만들지 않는다. 그 결과 에이전트는 “어떻게 일해야 하는지”는 대략 알지만, “무엇이 끝났는지”와 “무엇을 통과해야 완료인지”를 놓친다.

## 한계와 주의점

물론 이 코스가 모든 문제를 해결하지는 않는다.

첫째, 하네스는 모델 능력을 대체하지 않는다. 요구사항이 너무 복잡하거나, 도메인 지식이 부족하거나, 테스트 자체가 틀렸다면 하네스만으로 좋은 결과가 나오지 않는다.

둘째, 템플릿을 그대로 복사하는 것만으로 충분하지 않다. `feature_list.json`의 feature definition, `init.sh`의 검증 명령, `AGENTS.md`의 저장소별 규칙은 각 프로젝트에 맞게 바꿔야 한다. 오히려 잘못된 규칙을 durable artifact로 고정하면 에이전트가 반복해서 같은 실수를 더 빠르게 재생산할 수 있다.

셋째, structural validation과 실제 agent 성과를 구분해야 한다. `validate-harness.mjs`가 높은 점수를 준다고 해서 실제 long-running task 성공률이 자동으로 올라간다고 말할 수는 없다. 좋은 측정은 동일하거나 비슷한 작업을 weak harness와 strong harness에서 비교하고, 실패 원인을 task specification, context, environment, verification, state management로 분류하는 것이다.

넷째, 프로젝트가 제안하는 방식은 “프롬프트 엔지니어링”보다 더 운영적인 부담이 있다. progress log를 관리하고, feature list를 업데이트하고, session handoff를 남기려면 팀의 습관도 바뀌어야 한다. 하지만 긴 작업을 자주 맡기는 팀이라면 이 부담은 비용이라기보다 안정성을 사는 보험에 가깝다.

## 정리

`walkinglabs/learn-harness-engineering`은 하네스 엔지니어링을 막연한 업계 buzzword에서 구체적인 학습 경로로 바꿔 놓은 저장소다. 12개 강의는 왜 에이전트가 실패하는지 설명하고, 6개 프로젝트는 같은 앱을 단계적으로 발전시키며 하네스 차이를 관찰하게 하고, resource library와 `harness-creator`는 실제 저장소에 옮겨 쓸 수 있는 출발점을 제공한다.

가장 중요한 메시지는 단순하다. 코딩 에이전트가 더 강해질수록, 좋은 개발자는 “더 긴 프롬프트를 쓰는 사람”이 아니라 “에이전트가 읽고, 실행하고, 검증하고, 다음 세션으로 이어갈 수 있는 환경을 설계하는 사람”에 가까워진다.

이 저장소는 그 전환을 배우기 위한 좋은 입문 코스다. 특히 이미 AI 코딩 도구를 쓰고 있지만 결과를 믿기 어렵다고 느끼는 팀이라면, 모델을 바꾸기 전에 먼저 자신의 저장소가 에이전트에게 충분히 읽기 쉽고, 검증 가능하고, 재시작 가능한지 점검해 볼 만하다.

Sources: https://github.com/walkinglabs/learn-harness-engineering, https://walkinglabs.github.io/learn-harness-engineering/, https://api.github.com/repos/walkinglabs/learn-harness-engineering
