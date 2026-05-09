---
title: "Matt Pocock의 AI 코딩 워크플로는 ‘프롬프트 비법’이 아니라 소프트웨어 공학의 재배치다"
date: "2026-05-10T04:17:39"
description: "AI Engineer의 Matt Pocock 워크숍은 AI 코딩의 핵심을 더 긴 프롬프트가 아니라 작은 작업, 공유된 설계 개념, PRD, Kanban, TDD, deep module, 병렬 에이전트 운영으로 재구성하는 실무 워크플로로 설명한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - AI Coding
  - Coding Agents
  - Agent Workflows
  - TDD
  - Kanban
  - Sandcastle
  - Matt Pocock
  - AI Engineer
draft: false
---

AI 코딩 이야기는 자주 모델 성능이나 프롬프트 기술의 문제로 축소된다. 더 큰 컨텍스트 윈도우, 더 강한 추론 모델, 더 긴 시스템 프롬프트가 있으면 코딩 에이전트가 알아서 더 잘해 줄 것처럼 보인다.

Matt Pocock의 **`Full Walkthrough: Workflow for AI Coding`** 워크숍은 이 직관을 조금 다른 방향으로 틀어 놓는다. 영상의 핵심은 “AI가 완전히 새로운 패러다임이니 기존 개발 방법론을 버리자”가 아니다. 오히려 반대다. **사람과 함께 소프트웨어를 만들 때 중요했던 기본기—작은 작업 단위, 공유된 설계 개념, 명확한 요구사항, 테스트, 코드 리뷰, 좋은 모듈 경계—가 AI와 일할 때도 그대로 중요하다**는 주장에 가깝다.

다만 재배치가 필요하다. 사람이 기억하던 맥락은 PRD와 이슈로 남겨야 하고, 사람이 알아서 조절하던 작업 크기는 에이전트의 “smart zone” 안에 들어가게 쪼개야 하며, 사람이 감으로 하던 리뷰는 컨텍스트를 비운 별도 루프로 돌려야 한다. 이 워크숍이 흥미로운 이유는 바로 그 전환을 한 번의 긴 라이브 워크플로로 보여 준다는 데 있다.

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/-QFHIoCo-Ko"
    title="Full Walkthrough: Workflow for AI Coding — Matt Pocock"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

이 영상은 AI Engineer 채널에 2026-04-24 업로드된 약 96분 길이의 워크숍이다. 발표자는 TypeScript 교육자로 잘 알려진 **Matt Pocock**이며, 영상 설명란은 “모호한 요구사항을 agent-ready plan으로 바꾸고, autonomous coding agent가 production feature를 ship하도록 운영하는 전체 lifecycle”을 다룬다고 설명한다.

공식 YouTube chapter는 제공되지 않는다. 그래서 이 글은 `yt-dlp` metadata, oEmbed title, 전체 transcript, 그리고 영상에서 추출한 주요 프레임을 기준으로 흐름을 재구성했다. 설명란에 있는 외부 링크는 주로 Matt의 X, LinkedIn, YouTube 프로필이고, 별도 GitHub repo나 논문 링크는 확인되지 않았다.

영상의 포맷은 강연이라기보다 워크숍에 가깝다. Matt는 한 예시 프로젝트를 놓고, 모호한 client brief를 받아 `grill-me` 스킬로 질문을 만들고, PRD를 작성하고, Kanban 보드로 쪼개고, TDD로 구현시키고, 리뷰와 병렬 실행까지 연결한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/ai-coding-workflow-night-shift-flow.jpg"
    alt="Matt Pocock AI coding workflow slide showing Idea, Research, Prototype, PRD, Kanban, Implementation, QA and Code Review"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    53:15 전후 장면. 영상 후반부에 정리되는 전체 흐름은 Idea → Research → Prototype → PRD → Kanban → Implementation → QA / Code Review로 이어진다. 핵심은 “스펙을 코드로 바로 컴파일”하는 것이 아니라, 에이전트가 잡을 수 있는 작은 작업과 피드백 루프를 설계하는 데 있다.
  </figcaption>
</figure>

## 핵심 아이디어: AI는 새롭지만, 작업 관리 원칙은 새롭지 않다

초반 1분대에서 Matt는 이 워크숍의 테제를 직접 말한다. AI는 분명 새로운 패러다임이지만, 우리가 사람과 일할 때 중요하게 여겼던 소프트웨어 엔지니어링 기본기는 AI와 일할 때도 “super well” 작동한다는 것이다.

이 주장은 영상 전체의 해석 키다. Matt가 보여주는 것은 마법 같은 프롬프트 한 줄이 아니다. 오히려 오래된 개발 원칙을 LLM runtime의 제약에 맞게 다시 배치하는 방식이다.

가장 먼저 나오는 제약은 컨텍스트다. 그는 LLM이 대화 초반에는 “smart zone”에 있지만, 컨텍스트가 길어질수록 점점 “dumb zone”으로 밀려난다고 설명한다. 컨텍스트 윈도우가 200K든 1M이든 실제 작업 품질은 무한히 선형적으로 유지되지 않고, 어느 시점부터 의사결정이 무뎌진다는 경험적 주장이다.

그래서 워크플로의 첫 번째 원칙은 **작업을 작게 만들라**는 것이다. 사람 개발자에게도 “한 번에 너무 많이 물지 말라”는 조언이 유효했듯, 에이전트에게도 한 번에 너무 많은 책임을 주면 안 된다. 문제는 AI 코딩에서는 이 원칙이 단순한 생산성 조언이 아니라 컨텍스트 품질 관리 전략이 된다는 점이다.

두 번째 제약은 기억이다. Matt는 compact보다 clear를 선호한다고 말한다. compact는 대화 기록을 압축해 남기는 방식이지만, clear는 아예 비우고 다시 시작한다. 그는 에이전트를 영화 `Memento`의 주인공처럼 다루는 편이 낫다고 비유한다. 매번 같은 시작점으로 돌아가고, 필요한 정보는 파일과 문서에서 다시 끌어오게 만드는 쪽이 더 재현 가능하다는 뜻이다.

## 모호한 brief를 바로 구현하지 않고, 먼저 공유된 설계 개념을 만든다

영상에서 가장 중요한 초반 장면은 `grill-me` 스킬이다. Matt는 client brief를 바로 구현시키지 않는다. 대신 `/clear`로 컨텍스트를 비운 뒤, `grill-me @client-brief.md`처럼 스킬과 brief만 주고 출발한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/ai-coding-workflow-grill-me-skill.jpg"
    alt="VS Code frame showing Matt Pocock's grill-me skill prompt for interviewing the user until shared understanding"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    16:35 전후 장면. `grill-me` 스킬은 “계획의 모든 측면을 집요하게 인터뷰해 shared understanding에 도달하라”고 지시한다. 여기서 skill은 단순 프롬프트가 아니라 작업 시작 방식을 고정하는 작은 운영 자산이다.
  </figcaption>
</figure>

이 스킬의 문장은 짧다. 하지만 역할은 크다. “Interview me relentlessly”, “shared understanding”, “decision tree”, “one at a time” 같은 표현은 에이전트가 성급하게 계획을 뱉지 못하게 막는다. 대신 사람과 에이전트가 같은 설계 개념을 공유할 때까지 질문을 계속하게 만든다.

Matt는 이 부분을 Frederick Brooks의 “design concept”과 연결한다. 새로운 것을 함께 만들 때 참여자들이 공유해야 하는 추상적 설계 개념이 있고, AI와 일할 때도 그 개념을 먼저 맞춰야 한다는 것이다.

이 관점은 꽤 실무적이다. 많은 agentic coding 실패는 모델이 코드를 못 써서가 아니라, 애초에 무엇을 만들고 있는지에 대한 사람과 모델의 이해가 어긋나서 발생한다. `grill-me`는 그 어긋남을 구현 전에 드러내기 위한 장치다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/ai-coding-workflow-subagent-explore.jpg"
    alt="Terminal frame showing clear context, grill-me invocation, subagent codebase exploration, and the first clarification question"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    18:10 전후 장면. 워크플로는 `/clear` 이후 brief와 skill만 남긴 상태에서 시작하고, 에이전트가 먼저 코드베이스를 탐색한 뒤 질문을 이어 간다. “묻기 전에 코드로 답할 수 있으면 먼저 탐색하라”는 규칙도 이 흐름의 일부다.
  </figcaption>
</figure>

## PRD는 문서가 아니라 컨텍스트를 보존하는 목적지다

30분대에 들어서면 `grill-me` 세션에서 나온 좋은 토큰들을 어떻게 보존할지가 문제가 된다. Matt는 여기서 PRD를 “destination document”로 설명한다. 중요한 것은 특정 회사 양식이 아니라, 지금까지 만든 설계 개념을 다시 사용할 수 있는 문서 형태로 고정하는 것이다.

이 지점이 AI 코딩 워크플로에서 자주 빠진다. 사람은 대화 중에 어느 정도 맥락을 머릿속에 유지할 수 있지만, LLM 세션은 clear되거나 compact되거나 오래되어 품질이 변한다. 그러므로 좋은 대화는 그대로 두면 사라지는 자원이 아니라, **파일로 압축해야 하는 중간 산출물**이다.

Matt의 PRD 템플릿은 문제 설명, 가정 검증, 사용자 스토리, 구현 노트, 모듈 설계 같은 정보를 담는다. 이 문서는 구현을 바로 대체하지 않는다. 대신 다음 단계인 Kanban 분해의 기준점이 된다.

## Sequential plan보다 Kanban DAG가 낫다

PRD가 “어디로 갈 것인가”를 정한다면, Kanban은 “어떤 순서와 병렬성으로 갈 것인가”를 정한다. 영상 39분대 이후 Matt는 단순한 multi-phase plan 대신 Kanban board를 선호한다고 말한다.

이유는 명확하다. 순차 계획은 한 명의 에이전트가 위에서 아래로 따라가기 쉽지만, 병렬화하기 어렵다. 반면 Kanban 이슈는 blocking relationship을 가질 수 있다. 어떤 작업은 독립적으로 잡을 수 있고, 어떤 작업은 먼저 끝나야 하며, 어떤 작업은 같은 phase에서 병렬로 처리될 수 있다.

Matt는 이를 사실상 directed acyclic graph로 설명한다. 핵심은 agent에게 “큰 기능 하나”를 던지는 것이 아니라, agent가 독립적으로 집을 수 있는 작은 ticket 묶음으로 만드는 것이다. 이때 “tracer bullet” 또는 vertical slice가 중요해진다. 시스템의 얇은 조각을 끝까지 관통시키면, 이후 작업의 불확실성이 줄어든다.

이 방식은 단순한 프로젝트 관리 취향이 아니다. 에이전트의 컨텍스트 제약과도 맞물린다. 작은 ticket은 smart zone 안에서 처리될 가능성이 높고, blocking relationship은 여러 에이전트를 동시에 돌릴 때 충돌을 줄인다.

## 구현 단계의 핵심은 TDD와 컨텍스트 리셋이다

Matt가 구현 단계에서 강하게 강조하는 것은 TDD다. transcript 기준 67분 전후에 그는 TDD가 agent를 최대한 활용하는 데 “absolutely essential”하다고 말한다.

여기서 말하는 TDD는 단순히 테스트를 많이 쓰자는 이야기가 아니다. 에이전트에게 red-green-refactor 절차를 가르치고, 먼저 실패하는 테스트를 만들게 한 뒤, 그 테스트를 통과시키는 최소 구현으로 진행하게 한다는 의미다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/ai-coding-workflow-tdd-red-green.jpg"
    alt="Terminal frame showing a TDD red step where an agent writes a failing Vitest test before implementing a gamification service"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    67:20 전후 장면. 에이전트는 먼저 `RED: Test 1`을 만들고, 구현 모듈이 없어서 실패하는 상태를 확인한다. 이 실패가 다음 구현의 피드백 표면이 된다.
  </figcaption>
</figure>

AI 코딩에서 TDD가 특히 중요한 이유는 모델이 그럴듯한 코드를 빨리 만들기 때문이다. 그럴듯함은 검증이 아니다. 실패하는 테스트를 먼저 만들면, 에이전트가 방금 만든 코드를 스스로 평가할 수 있는 좁고 빠른 신호가 생긴다.

또 하나 중요한 것은 리뷰 컨텍스트다. Matt는 구현이 끝난 긴 세션 안에서 그대로 리뷰하면, 리뷰어도 이미 dumb zone에 있을 수 있다고 말한다. 그래서 구현 후 리뷰는 가능하면 컨텍스트를 비운 별도 상태에서 돌리는 편이 낫다. 같은 모델을 쓰더라도 “구현한 세션”과 “검토하는 세션”을 분리하는 것이 품질에 영향을 준다는 해석이다.

## 에이전트가 좋아하는 코드베이스: deep module과 thin wiring

워크숍 후반부의 흥미로운 지점은 AI 코딩이 프롬프트만의 문제가 아니라 코드베이스 설계의 문제로 확장된다는 점이다. Matt는 John Ousterhout의 표현을 빌려 **deep module**을 이야기한다.

Deep module은 작은 인터페이스 뒤에 많은 기능을 감춘 모듈이다. 호출자는 단순한 API만 다루고, 내부 복잡성은 모듈 안에 머문다. 반대로 shallow module은 인터페이스는 많고 내부 응집도는 낮은 구조다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/ai-coding-workflow-deep-modules.jpg"
    alt="Markdown PRD frame showing Gamification Service marked as a new deep module with a compact API surface"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    78:40 전후 장면. PRD 안에는 `Gamification Service [new, deep module]`가 명시되고, 외부에 노출할 함수 목록이 정리된다. 에이전트에게도 “어떤 모듈을 깊게 만들고, 기존 경로는 얇게 연결할지”를 미리 알려 줘야 한다는 메시지다.
  </figcaption>
</figure>

이 주장은 agentic coding에서 특히 중요하다. 에이전트가 방치되면 기능을 여러 route, service, helper에 얇게 흩뿌릴 가능성이 높다. 그러면 테스트 경계도 흐려지고, 리뷰도 어려워지고, 다음 에이전트가 이어받기도 힘들어진다.

반대로 PRD 단계에서 “이 서비스는 새 deep module이고, 이 route와 progress service는 thin wiring만 한다”고 명시하면, 구현의 중심이 생긴다. 테스트도 그 모듈 경계에 크게 걸 수 있다. 결국 좋은 agent workflow는 좋은 코드베이스 구조를 요구하고, 좋은 코드베이스 구조는 다시 agent workflow를 더 쉽게 만든다.

## Push와 Pull: 모든 규칙을 항상 밀어 넣을 필요는 없다

Q&A 후반부에서 Matt는 coding standards를 에이전트에게 어떻게 전달할지에 대해 push/pull 구분을 제시한다. Push는 `CLAUDE.md`처럼 항상 컨텍스트에 밀어 넣는 지시다. Pull은 skill처럼 에이전트가 필요할 때 가져올 수 있는 정보다.

이 구분은 작지만 중요하다. 구현 에이전트에게 모든 규칙을 항상 밀어 넣으면 토큰이 낭비되고, 오히려 중요한 작업 맥락이 흐려질 수 있다. 반대로 자동 리뷰어에게는 coding standards를 명시적으로 push하는 편이 좋다. 리뷰어는 작성된 코드와 기준을 비교해야 하므로, 기준을 확실히 갖고 있어야 하기 때문이다.

즉 같은 규칙이라도 역할에 따라 전달 방식이 달라진다.

| 역할 | 더 적합한 방식 | 이유 |
|---|---|---|
| 구현 에이전트 | Pull | 필요할 때 coding standard나 skill을 가져오게 해 컨텍스트를 아낀다 |
| 리뷰 에이전트 | Push | 작성된 코드와 기준을 직접 비교해야 하므로 규칙을 명시적으로 제공한다 |
| 사람 운영자 | 파일/이슈/PRD | 세션이 바뀌어도 목표와 결정사항이 사라지지 않게 한다 |

## Sandcastle: 병렬 에이전트를 실제 실행 루프로 묶기

90분 전후에는 Matt가 직접 만든 **Sandcastle**을 소개한다. transcript에서 그는 Sandcastle을 “AFK로 agent를 실행하는 옵션들”에 대한 불만에서 만든 TypeScript library로 설명한다. run 함수가 worktree를 만들고, Docker container 안에 sandboxing한 뒤, prompt를 실행하고, 나중에 branch를 merge할 수 있게 한다는 설명이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/ai-coding-workflow-sandcastle-api.jpg"
    alt="Sandcastle README frame showing npx tsx .sandcastle/main.ts and JavaScript API usage with run and claudeCode"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    90:25 전후 장면. Sandcastle은 `.sandcastle/main.ts`와 JS API를 통해 에이전트 실행 루프를 코드화한다. 공개 npm registry에서도 `@ai-hero/sandcastle` 패키지는 “isolated sandbox environments”에서 AI agents를 orchestrate하는 CLI로 설명된다.
  </figcaption>
</figure>

공개 npm registry 기준 `@ai-hero/sandcastle`의 latest dist-tag는 조회 시점에 `0.5.10`이고, 패키지 설명은 “CLI for orchestrating AI agents in isolated sandbox environments”로 표시된다. 영상에서 보이는 설명과 큰 방향이 맞는다.

이 장면이 중요한 이유는 앞의 Kanban DAG와 연결되기 때문이다. PRD에서 이슈를 만들고, blocking relationship으로 phase를 나누고, 독립적인 이슈를 여러 agent가 병렬로 잡게 하려면, 결국 실행 환경도 코드로 관리되어야 한다. Sandcastle은 그 운영층을 보여 주는 사례다.

## 타임라인으로 보는 핵심 구간

| 구간 | 핵심 장면 | 의미 |
|---|---|---|
| 00:50~04:30 | AI는 새 패러다임이지만 소프트웨어 공학 기본기는 여전히 유효하다는 테제 | 영상 전체의 프레임. “프롬프트 비법”이 아니라 기존 협업 원칙의 재배치 |
| 03:20~05:40 | LLM의 smart zone / dumb zone 설명 | 작업 크기와 컨텍스트 길이를 관리해야 하는 이유 제시 |
| 09:30~12:40 | compact보다 clear를 선호한다는 설명 | 세션 기억에 의존하지 않고 파일과 문서로 맥락을 복구하는 전략 |
| 15:40~20:30 | `grill-me` 스킬과 codebase exploration | 모호한 요구를 구현 전에 질문과 탐색으로 정렬 |
| 30:00~36:30 | PRD를 destination document로 작성 | 좋은 대화를 세션 안에 버리지 않고 문서 산출물로 압축 |
| 39:30~46:40 | PRD를 Kanban ticket과 vertical slice로 분해 | sequential plan 대신 blocking relationship이 있는 작업 그래프 생성 |
| 49:30~55:30 | DAG와 병렬 실행, night shift 비유 | 독립 작업을 여러 에이전트가 동시에 처리할 수 있는 형태로 전환 |
| 66:00~74:30 | TDD, red-green-refactor, 리뷰 컨텍스트 분리 | 에이전트 출력에 빠른 실패 신호와 별도 검토 루프를 부여 |
| 77:00~84:40 | deep module과 코드베이스 아키텍처 | 에이전트가 좋아하는 구조는 테스트 가능한 깊은 모듈과 얇은 연결부 |
| 87:30~96:00 | push/pull 규칙 전달, Sandcastle, 최종 workflow 정리 | 병렬 agent runtime과 code review 운영까지 연결 |

## 영상과 공개 자료에서 확인되는 점

확인 가능한 사실부터 정리하면, 영상의 metadata와 oEmbed title은 모두 **`Full Walkthrough: Workflow for AI Coding — Matt Pocock`**로 일치한다. 채널은 AI Engineer, upload date는 2026-04-24로 잡힌다. transcript도 opening에서 Matt가 직접 자신을 teacher라고 소개하고, 이후 AI coding workflow를 워크숍 형식으로 진행한다.

공식 chapters는 없다. 그래서 세부 구간은 transcript의 topic shift와 추출 프레임을 기준으로 재구성했다. 이 점은 중요하다. 타임라인은 YouTube가 제공한 chapter 목록이 아니라, 실제 transcript와 화면 변화에서 추론한 독자용 구조다.

설명란에는 speaker profile 링크만 있고, 워크숍 exercise repo나 slide deck 링크는 metadata상 확인되지 않았다. 대신 영상 자체에는 `grill-me` skill, PRD template, Kanban issue, TDD skill, Sandcastle README/API 같은 작업 표면이 직접 등장한다. 이 글의 기술적 해석은 그 화면 증거와 transcript를 중심으로 삼았다.

Sandcastle은 별도 공개 패키지로도 확인된다. npm registry의 `@ai-hero/sandcastle` package는 Matt Pocock 계정의 패키지로 보이며, AI agents를 isolated sandbox environment에서 orchestrate하는 CLI로 설명된다. 다만 이 글에서는 Sandcastle의 내부 구현 품질이나 프로덕션 성숙도를 평가하지 않는다. 영상이 보여주는 범위는 “병렬 에이전트 루프를 코드화하려는 방향”까지다.

## 실무 관점에서의 해석

이 워크숍의 가장 큰 가치는 “AI에게 코딩을 잘 시키는 법”보다 넓다. 더 정확히는 **에이전트 시대에 개발 프로세스의 중간 산출물을 어떻게 재설계해야 하는가**를 보여 준다.

전통적인 개발팀에도 brief, PRD, ticket, test, code review, architecture doc은 있었다. 하지만 AI 코딩에서는 이 산출물들이 훨씬 더 직접적인 실행 입력이 된다. PRD는 사람이 읽는 문서가 아니라 다음 에이전트 세션의 컨텍스트가 되고, Kanban board는 PM 도구가 아니라 병렬 실행 그래프가 되며, 테스트는 QA 단계의 산출물이 아니라 agent loop 안의 즉각적인 reward signal이 된다.

이 관점에서 보면 Matt의 workflow는 꽤 보수적이다. 그는 “AI가 다 알아서 한다”고 말하지 않는다. 오히려 사람이 더 명시적으로 결정해야 할 것들이 늘어난다.

- 어떤 요구사항이 아직 모호한가?
- 어떤 질문을 먼저 해야 하는가?
- 어떤 맥락은 clear 후에도 살아남아야 하는가?
- 어떤 ticket은 독립적으로 실행 가능한가?
- 어떤 모듈을 깊게 만들고, 어떤 route는 얇게 연결할 것인가?
- 어떤 규칙은 구현 agent가 pull하게 하고, 어떤 규칙은 리뷰 agent에게 push할 것인가?

즉 AI 코딩의 숙련도는 “모델에게 맡기는 정도”가 아니라 **모델이 실패하기 어려운 작업 지형을 설계하는 능력**에 가까워진다.

이 접근의 장점은 분명하다.

- 모호한 brief가 바로 코드로 폭주하지 않는다.
- 좋은 대화가 PRD와 issue로 남아 세션을 넘어 재사용된다.
- 작은 ticket과 TDD가 에이전트의 실수 비용을 줄인다.
- deep module 설계가 테스트와 리뷰 경계를 명확히 한다.
- 병렬 실행과 리뷰 루프를 별도 runtime으로 확장할 수 있다.

반면 비용도 있다.

- 사전 질문과 PRD 작성 시간이 필요하다.
- Kanban ticket 품질이 낮으면 병렬화도 같이 망가진다.
- TDD를 형식적으로만 시키면 테스트가 구현을 검증하지 못하고 스냅샷처럼 굳을 수 있다.
- deep module 기준을 사람이 판단하지 않으면 에이전트가 shallow structure를 대량 생산할 수 있다.
- Sandcastle 같은 자동화 루프는 branch, sandbox, merge, secret, CI 비용을 별도로 관리해야 한다.

그래도 방향성은 설득력 있다. 특히 장시간 agentic coding을 해 본 팀일수록, “대화 한 번을 잘하는 법”보다 “대화가 끝난 뒤에도 살아남는 구조를 만드는 법”이 더 중요해진다. 이 워크숍은 그 구조를 꽤 선명하게 보여 준다.

## 한 줄로 요약하면

`Full Walkthrough: Workflow for AI Coding`은 AI 코딩을 프롬프트 마술로 설명하지 않는다. 대신 **모호한 요구를 질문으로 정렬하고, PRD와 Kanban으로 작업을 작게 만들고, TDD와 deep module로 피드백 경계를 세우며, 병렬 에이전트 실행까지 운영하는 소프트웨어 공학 워크플로**로 다룬다.

Sources: https://youtu.be/-QFHIoCo-Ko, https://www.youtube.com/watch?v=-QFHIoCo-Ko, https://www.youtube.com/oembed?url=https://youtu.be/-QFHIoCo-Ko&format=json, https://registry.npmjs.org/%40ai-hero%2Fsandcastle, https://x.com/mattpocockuk, https://www.linkedin.com/in/mapocock/, https://youtube.com/@mattpocockuk
