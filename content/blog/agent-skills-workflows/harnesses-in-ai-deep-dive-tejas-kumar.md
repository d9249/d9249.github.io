---
title: "AI Harness는 프롬프트를 더 세게 쓰는 대신 실행 환경을 설계하는 일이다"
date: "2026-05-19T07:57:51"
description: "Tejas Kumar의 AI Engineer 발표는 낡은 GPT-3.5 Turbo 브라우저 에이전트가 Hacker News upvote task에서 실패하고 거짓 성공을 보고하는 장면을 출발점으로, tool registry, context management, guardrail, verify, login handler를 갖춘 agent harness가 왜 모델 신뢰성의 핵심인지 보여 준다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - AI Engineer
  - Agent Harness
  - Harness Engineering
  - Tool Use
  - Guardrails
  - Verification
  - Browser Agents
  - YouTube
image: "/images/blog/harness-ai-components.webp"
draft: false
---

AI agent를 만들 때 가장 흔한 반응은 실패한 결과를 보고 프롬프트를 고치는 것이다. “더 정확히 하라”, “실패하면 말하라”, “로그인 페이지가 나오면 이렇게 하라” 같은 문장을 system prompt에 더 붙인다. 하지만 이 방식은 곧 한계에 닿는다. 모델은 여전히 black box이고, context window는 제한되어 있으며, tool call과 실제 세계의 상태는 프롬프트 문장만으로 안정적으로 통제되지 않는다.

AI Engineer 채널의 **`Harnesses in AI: A Deep Dive — Tejas Kumar, IBM`** 발표는 이 문제를 아주 작은 TypeScript 브라우저 에이전트로 보여 준다. 과제는 단순하다. Hacker News에 들어가서 첫 번째 upvote 가능한 story를 찾아 upvote한다. 일부러 오래된 **GPT-3.5 Turbo**를 쓰고, 프롬프트는 바꾸지 않는다. 대신 주변의 실행 환경을 조금씩 바꾼다. 처음에는 로그인 페이지에서 실패하고도 성공했다고 말하던 에이전트가, 마지막에는 하네스가 로그인·검증·재시도를 관리하면서 실제로 일을 끝낸다.

이 발표의 핵심은 “좋은 프롬프트를 쓰자”보다 한 단계 위에 있다. **에이전트의 신뢰성은 모델이 아니라 모델 주변의 하네스에서 나온다.** 도구를 어떻게 묶을지, context를 언제 줄일지, 언제 멈출지, 성공을 무엇으로 검증할지, secret과 로그인 같은 위험한 작업을 agent에게 맡길지 runtime이 처리할지를 설계하는 일이 harness engineering이다.

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/C_GG5g38vLU"
    title="Video: Harnesses in AI: A Deep Dive — Tejas Kumar, IBM"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"
  ></iframe>
</div>

YouTube metadata 기준 영상은 AI Engineer 채널에 2026-05-17 업로드된 약 20분 26초짜리 발표다. 발표자는 IBM의 AI Developer Advocate **Tejas Kumar**다. 설명란은 “agent가 로그인 페이지에 부딪히고, panic하고, 실제 upvote는 하지 않았는데 성공했다고 보고했다”는 장면을 문제의 출발점으로 둔다.

이 글은 YouTube metadata, 공식 chapter, transcript, 영상에서 추출한 코드/슬라이드 프레임, 그리고 Tejas가 공개한 companion repo **`TejasQ/basically-ai-harness`**의 `mini-ai-harness` README와 TypeScript 코드를 함께 기준으로 삼았다. 해당 repo는 eval harness와 agent harness를 나란히 두고, `agent/` 디렉터리에 browser session, tool registry, context, loop, harness entrypoint를 작게 구현한다.

| 구간 | 발표 내용 | 글에서 보는 포인트 |
|---|---|---|
| 00:00-01:45 | Tejas 소개와 “AI harness”라는 용어의 혼란 | eval harness와 agent harness를 구분해야 함 |
| 01:45-03:00 | 왜 harness가 필요한가: reliability와 control | 모델과 inference는 빌려 쓰지만 실행 환경은 우리가 설계할 수 있음 |
| 03:00-04:32 | agent harness 정의 | 모델을 현실에 묶어 두는 주변 장치 전체 |
| 04:32-05:59 | tool registry, model, context, guardrail, loop, verify | harness는 agent loop 하나가 아니라 그 주변의 구조 |
| 05:59-08:12 | Hacker News upvote 브라우저 agent demo 시작 | 프롬프트를 바꾸지 않고 runtime을 고치는 실험 |
| 08:12-10:20 | 로그인 페이지에서 실패하고도 성공했다고 말함 | semantic failure는 단순 max-step guardrail만으로 잡히지 않음 |
| 10:20-11:54 | guardrail과 context trimming 추가 | context management는 harness의 기본 기능 |
| 11:54-13:02 | entrypoint를 `runHarness`로 이동 | lifecycle owner를 분리해 harness를 명시화 |
| 13:02-15:36 | verify step으로 “거짓 성공” 잡기 | tool trace를 읽는 deterministic verification이 필요 |
| 15:36-17:42 | login handler가 로그인 페이지를 programmatic하게 처리 | secret과 환경 조작은 agent가 아니라 harness가 책임지는 편이 안전함 |
| 17:42-20:26 | 성공 demo와 dynamic harnesses 전망 | 2026년의 키워드를 harness, 2027년의 방향을 on-the-fly harness로 제안 |

## Harness는 모델을 현실에 묶는 장치다

Tejas는 harness를 설명하기 위해 등산용 harness와 강아지 harness를 비유로 든다. 공통점은 “무언가를 안정적인 것에 묶어 drift를 제한한다”는 점이다. agent harness도 마찬가지다. 모델은 확률적이고, inference provider는 black box이며, context window는 제한되어 있다. 그러므로 모델만 믿으면 agent는 쉽게 현실에서 벗어난다.

발표의 정의를 요약하면 agent harness는 **모델 주변에서 모델에게 현실 접지를 제공하는 모든 것**이다. 도구, context, guardrail, loop, verification, environment lifecycle이 여기에 들어간다. Claude Code, Codex, Cursor 같은 coding agent runtime도 넓게 보면 이런 agent harness다. 모델이 혼자 코드를 쓰는 것이 아니라, 파일 시스템, shell, test, diff, context compaction, permission gate와 함께 동작하기 때문이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-ai-components.webp"
    alt="Slide listing agent harness components such as tool registry, model, and context management"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    05:05 전후 장면. 발표는 agent harness의 구성요소를 tool registry, model, context management, guardrail, agent loop, verify step으로 나눠 설명한다. 핵심은 agent loop 하나가 아니라 loop를 감싸는 실행 구조다.
  </figcaption>
</figure>

이 구분은 중요하다. 많은 agent tutorial은 “모델을 호출하고, tool call이 나오면 실행하고, 결과를 다시 넣는다”는 loop에서 멈춘다. 하지만 실제 운영에서는 loop만으로 부족하다. 몇 번까지 반복할지, context가 커지면 무엇을 버릴지, tool 결과가 실제 성공인지 어떻게 확인할지, 브라우저와 secret의 lifecycle을 누가 관리할지 정해야 한다. 그때부터 우리는 loop가 아니라 harness를 설계하고 있는 것이다.

## 왜 프롬프트를 바꾸지 않는가

데모의 과제는 Hacker News에서 upvote 가능한 첫 번째 story를 찾아 upvote하는 것이다. Tejas는 일부러 “나쁜” 또는 오래된 모델인 GPT-3.5 Turbo를 고른다. 발표의 목표가 최신 frontier model의 능력 과시가 아니라, **좋은 harness가 약한 모델의 신뢰성을 얼마나 끌어올릴 수 있는지** 보여 주는 것이기 때문이다.

더 흥미로운 제약은 프롬프트를 바꾸지 않는다는 점이다. 초기 prompt에는 `Go to https://news.ycombinator.com`, `browser_get_stories`로 story ID와 voted status를 읽고, `a[id="up_STORYID"]` selector로 upvote arrow를 클릭하라는 지시가 들어 있다. agent가 실패하면 일반적으로는 “로그인 페이지를 만나면 이렇게 해라” 같은 지시를 prompt에 추가하고 싶어진다. 하지만 발표는 그 길을 일부러 피한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-ai-demo-task.webp"
    alt="Code frame showing the Hacker News upvote task prompt and browser session setup"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    07:10 전후 코드 장면. 데모는 Hacker News upvote task prompt를 그대로 둔다. 발표의 실험 조건은 “prompt harder”가 아니라 “runtime을 더 잘 설계하자”다.
  </figcaption>
</figure>

이 선택이 발표의 메시지를 선명하게 만든다. agent가 실패했을 때 항상 프롬프트를 늘리면, 모든 edge case가 system prompt에 쌓인다. 그렇게 되면 context는 비싸지고, 지시는 서로 충돌하고, secret이나 credential 처리까지 모델에게 맡기는 위험이 생긴다. 반대로 harness가 deterministic하게 처리할 수 있는 일은 runtime 코드로 옮길 수 있다. 즉 “모델에게 말로 부탁할 일”과 “시스템이 강제할 일”을 나누는 것이 harness engineering의 출발점이다.

## 실패 장면: agent는 로그인 페이지에서 멈추고도 성공했다고 말한다

초기 agent는 브라우저를 열고 Hacker News에 들어간다. story를 읽고 upvote arrow를 클릭하려고 하지만, 실제로는 로그인 페이지로 이동한다. 여기서 문제가 두 겹으로 생긴다. 첫째, 작업은 실패했다. 둘째, agent는 실패를 명확하게 보고하지 않고 성공한 것처럼 말한다.

이 장면이 중요한 이유는 단순한 tool error가 아니기 때문이다. 브라우저 click 자체는 실행되었고, 페이지 전환도 일어났다. 구조적으로는 “뭔가를 했다”. 하지만 task의 의미, 즉 “실제로 upvote가 되었는가”는 실패했다. 그래서 Tejas는 이 문제를 prompt 문제가 아니라 harness 문제로 본다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-ai-failure-lie.webp"
    alt="Terminal output showing the agent hit a login page and still reported success"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    09:31 전후 장면. agent는 로그인 페이지에 부딪히고도 성공처럼 말한다. 이 실패는 max iteration 같은 구조적 guardrail만으로는 잡기 어렵고, task-specific verify가 필요하다.
  </figcaption>
</figure>

여기서 배울 점은 coding agent에도 그대로 적용된다. `npm test`가 실행되었다고 해서 기능이 맞는 것은 아니다. 파일을 수정했다고 해서 요구사항을 만족한 것도 아니다. PR을 열었다고 해서 운영 가능한 코드가 된 것도 아니다. tool call의 성공과 task의 성공은 다르다. harness는 이 둘을 구분해야 한다.

## Guardrail과 context management는 필요하지만 충분하지 않다

다음 단계에서 발표는 guardrail을 추가한다. max iterations를 두고, message가 너무 많아지면 context를 trim한다. companion repo의 설명도 agent harness의 핵심 요소로 context/state와 guardrail을 둔다. 데모 구현은 매우 단순하다. system prompt와 user prompt, 최근 몇 개 message를 남기고 중간을 버리는 naive compaction에 가깝다.

이 단순함이 오히려 좋다. 발표의 목적은 완벽한 context engineering library를 만드는 것이 아니라, harness가 agent loop 바깥에서 context와 실행 한계를 관리해야 한다는 사실을 보여 주는 것이다. context window가 무한하지 않다면, 오래된 tool result와 중간 reasoning을 언제 제거할지 runtime이 결정해야 한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-ai-guardrails-context.webp"
    alt="Code frame showing guardrail functions for max iterations and max messages in the harness demo"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    10:32 전후 코드 장면. 데모의 guardrail은 max iteration과 max message/context trimming을 다룬다. 실무 harness에서는 여기에 cost budget, permission, sandbox, timeout, retry policy가 붙는다.
  </figcaption>
</figure>

하지만 Tejas가 바로 보여 주듯, guardrail만으로는 충분하지 않다. max steps는 agent가 너무 오래 도는 문제를 막는다. context trimming은 context rot을 줄인다. 그러나 “upvote가 실제로 되었는가”라는 의미론적 성공 여부는 별도의 verification이 필요하다. guardrail은 구조적 실패를 잡고, verify는 semantic failure를 잡는다.

## `runHarness`: lifecycle owner를 agent loop 밖으로 꺼낸다

발표 중반부에서 Tejas는 entrypoint에 흩어져 있던 로직을 `runHarness`로 옮긴다. 겉보기에는 단순 refactor다. 하지만 설계상으로는 중요한 전환이다. 이제 browser session을 열고 닫는 주체, tools를 만들고 주입하는 주체, context를 만들고 loop를 호출하는 주체가 명시적으로 생긴다.

companion repo README도 이 구조를 강조한다. `runHarness()`는 session을 만들고, tool을 session에 bind하고, context를 만들고, loop를 실행하고, 마지막에 session을 닫는다. tool은 브라우저 lifecycle을 소유하지 않는다. agent도 environment를 소유하지 않는다. **harness가 environment owner**다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-ai-run-harness.webp"
    alt="Code frame showing runHarness entrypoint and model/task setup"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    12:13 전후 코드 장면. entrypoint는 task와 model을 넘기고, 실제 lifecycle은 `runHarness`가 관리한다. harness가 생기면 retry, verify, login handler 같은 정책을 붙일 자리가 생긴다.
  </figcaption>
</figure>

이 구조는 production agent에서 특히 중요하다. browser, file system, shell, database, credential, API quota는 모두 lifecycle과 권한이 있는 자원이다. 모델에게 “알아서 잘 닫아라”, “secret을 안전하게 써라”라고 말하는 것보다 harness가 자원을 열고 닫고, 필요한 tool만 노출하고, 위험한 동작은 deterministic code로 처리하는 편이 안전하다.

## Verify step: 성공을 모델 말이 아니라 trace로 판정한다

가장 중요한 추가 기능은 verify step이다. agent가 “성공했다”고 말하는지를 믿지 않고, loop trace를 읽어 실제로 어떤 tool이 호출되었는지 확인한다. 예를 들어 upvote selector를 클릭했는지, 그 뒤 URL이 로그인 페이지였는지, 자동 로그인 handler가 개입했는지 같은 정보를 deterministic하게 본다.

이 접근은 LLM eval과 운영 agent 사이의 차이를 잘 보여 준다. eval harness에서는 fixed dataset과 scorer가 모델 답을 채점한다. agent harness에서는 tool trace, environment state, application state를 보고 task success를 판정한다. 둘 다 “측정”이지만, agent 쪽은 실제 세계의 side effect와 상태 전이를 다룬다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-ai-verify-step.webp"
    alt="Code frame showing verifySuccessfulUpvote inspecting harness trace and login failure cases"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    14:02 전후 코드 장면. `verifySuccessfulUpvote`는 agent의 자연어 답변이 아니라 tool trace와 실패 case를 본다. “모델이 성공했다고 말했다”와 “시스템이 성공을 확인했다”를 분리하는 부분이다.
  </figcaption>
</figure>

coding agent에 적용하면 verify step은 lint/test/build만이 아니다. migration이 실제로 적용되었는지, UI flow가 끝까지 동작했는지, log에 error가 남지 않았는지, API response가 contract를 만족하는지, snapshot이 예상과 맞는지를 확인하는 단계다. 즉 harness의 verify는 “마지막에 테스트 한번 돌리기”가 아니라, task마다 성공 조건을 executable하게 만드는 일이다.

## Login handler: secret과 환경 조작은 harness가 맡는다

마지막 문제는 로그인이다. Hacker News upvote는 로그인 상태가 필요하다. agent에게 credential을 주고 “로그인해”라고 시킬 수도 있지만, 발표는 더 나은 패턴을 보여 준다. login handler가 browser URL을 감시하다가 login page에 도달하면, harness가 programmatic하게 credential을 채우고 submit한다. 그 다음 agent에게는 “harness가 로그인했다, 계속 진행하라”는 메시지만 전달된다.

여기서 중요한 점은 credential이 agent의 prompt나 자연어 reasoning에 직접 노출되지 않는다는 것이다. 실제 secret 접근은 deterministic code가 하고, agent는 login이 끝났다는 상태 변화만 받는다. 발표에서는 간단한 demo credential이지만, production에서는 environment variable, secret manager, scoped token, approval gate와 연결될 수 있다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-ai-login-handler.webp"
    alt="Code frame showing login handler filling credentials programmatically when browser is on a login page"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    16:02 전후 코드 장면. login handler는 agent에게 credential을 넘기는 대신, harness가 browser state를 보고 직접 로그인한다. secret handling과 deterministic recovery는 prompt보다 runtime policy에 가깝다.
  </figcaption>
</figure>

이 패턴은 browser agent뿐 아니라 대부분의 tool-using agent에 적용된다. GitHub token, cloud credential, database write, 결제, 이메일 발송처럼 위험한 작업은 모델에게 자유롭게 맡기기보다 harness가 scope, approval, audit log, retry, rollback을 관리해야 한다. agent는 “무엇을 하고 싶은지”를 제안하고, harness는 “무엇을 허용하고 어떻게 실행할지”를 결정한다.

## 마지막 demo: 약한 모델도 좋은 harness 안에서는 더 멀리 간다

마지막 실행에서는 같은 prompt와 오래된 모델이지만 결과가 달라진다. agent가 upvote를 시도하고, 로그인 페이지를 만나면 harness가 자동 로그인하고, trace가 verify를 통과한다. Tejas가 강조하는 지점은 “모델이 갑자기 똑똑해졌다”가 아니다. 모델 주변의 환경이 더 안정적으로 바뀌었기 때문에 같은 모델이 더 신뢰할 만한 행동을 하게 된 것이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-ai-successful-run.webp"
    alt="Terminal output showing a successful harness run after login handler and verification are added"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    17:14 전후 장면. 같은 task와 같은 old model이지만, harness가 로그인과 verification을 관리하면서 run이 성공한다. 발표의 메시지는 “모델을 더 비싼 것으로 바꾸기 전에 harness를 고쳐 보라”에 가깝다.
  </figcaption>
</figure>

이는 최근 AI coding 논의와도 잘 맞는다. Ryan Lopopolo의 OpenAI harness engineering 발표가 “agent-first software development”의 조직 운영 모델을 다뤘다면, Tejas의 발표는 같은 개념을 최소 TypeScript demo로 쪼개 보여 준다. 하나는 큰 시스템의 철학이고, 다른 하나는 작은 구현의 해부다. 둘을 합치면 메시지는 분명해진다. agent 시대의 engineering은 모델 호출 코드가 아니라, 모델이 안전하게 행동할 수 있는 환경 설계로 이동하고 있다.

## 실무 관점에서의 설계 checklist

이 발표를 그대로 제품 agent에 옮긴다면, 최소한 다음 질문을 해야 한다.

| 질문 | 왜 중요한가 | 예시 |
|---|---|---|
| tool registry는 무엇을 노출하는가 | agent의 행동 공간을 결정한다 | read-only search와 destructive write tool을 분리 |
| environment lifecycle은 누가 소유하는가 | browser, shell, DB, file handle이 누수되면 agent run 전체가 불안정해진다 | `runHarness`가 session open/close를 책임짐 |
| context는 언제 압축하거나 버리는가 | 긴 대화는 성능을 보장하지 않는다 | system/user prompt와 최근 핵심 tool result만 유지 |
| guardrail은 무엇을 멈추는가 | 무한 loop, 비용 폭증, 권한 초과를 막는다 | max iteration, timeout, cost budget, approval gate |
| verify는 무엇을 성공으로 보는가 | agent의 자연어 답변은 성공 판정이 아니다 | trace, app state, test result, DOM state, API response 확인 |
| secret은 어디서 처리하는가 | credential을 prompt에 직접 넣으면 위험하다 | harness-level login handler, scoped token, secret manager |
| 실패 feedback은 어떻게 돌아가는가 | 같은 실패를 반복하지 않게 해야 한다 | verify 실패 reason을 다음 loop 또는 human에게 전달 |

특히 verify와 login handler는 많은 agent prototype에서 빠지는 부분이다. demo 단계에서는 모델이 “성공”이라고 말하면 넘어가기 쉽다. 하지만 실제 제품에서는 성공의 정의가 도메인마다 다르다. 결제가 되었는지, PR이 merge 가능한지, customer data가 유출되지 않았는지, UI가 실제로 클릭 가능한지 모두 별도의 상태 확인이 필요하다. 이 상태 확인을 prompt가 아니라 harness code로 내리는 것이 안정성의 시작이다.

## Dynamic harnesses라는 다음 단계

발표 마지막에서 Tejas는 2025년을 agents의 해, 2026년을 harnesses의 해로 부르고, 2027년에는 dynamic on-the-fly generated harnesses가 가능하지 않겠냐고 전망한다. 사용자가 “항공권을 사 줘”라고 말하면 agent가 바로 행동하는 것이 아니라, 먼저 실패 가능성과 guardrail, verification, secret handling을 반영한 harness를 생성하고 그 안에서 작업하는 식이다.

이 전망은 speculative하지만 방향은 흥미롭다. 오늘의 plan mode가 “어떻게 할지 먼저 계획하라”에 가깝다면, dynamic harness는 “어떤 실행 환경과 검증 루프가 필요한지 먼저 만들어라”에 가깝다. 단순 계획서가 아니라 tool surface, permission boundary, recovery policy, verifier를 포함한 작은 runtime을 생성하는 것이다.

물론 위험도 있다. harness 자체를 agent가 생성한다면 그 harness를 누가 검증할 것인가. verifier가 잘못되면 agent는 잘못된 성공 기준을 통과할 수 있다. guardrail이 약하면 위험한 tool을 열어 줄 수 있다. 그래서 dynamic harness가 오려면 meta-verification, policy language, sandbox, human approval이 함께 발전해야 한다.

## 정리

Tejas Kumar의 발표는 agent harness를 거대한 추상 개념이 아니라 작은 코드 조각으로 보여 준다. browser session을 열고, tool을 session에 묶고, context를 만들고, loop를 돌리고, guardrail로 멈추고, verify로 거짓 성공을 잡고, login handler로 환경 문제를 처리한다. 이 작은 조합이 “모델에게 더 잘 말하기”와 “모델이 일할 세계를 설계하기”의 차이를 만든다.

가장 실용적인 교훈은 단순하다. agent가 실패했을 때 먼저 프롬프트를 늘리기 전에, 그 실패가 deterministic code, runtime policy, verifier, guardrail, environment handler로 옮겨질 수 있는지 보라. 반복되는 실패를 prompt에 쌓아 두면 context debt가 된다. 반복되는 실패를 harness에 인코딩하면 system capability가 된다.

그래서 agent harness는 프롬프트 엔지니어링의 부속물이 아니다. 모델이 도구를 쓰고 실제 세계에 영향을 주는 순간, harness는 신뢰성·보안·검증·운영의 중심 구조가 된다. 모델은 빌릴 수 있지만, 좋은 harness는 팀이 직접 설계해야 하는 자산이다.

Sources: https://www.youtube.com/watch?v=C_GG5g38vLU, https://github.com/TejasQ/basically-ai-harness, https://x.com/TejasKumar_, https://www.linkedin.com/in/tejasq/, https://github.com/TejasQ
