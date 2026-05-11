---
title: "Harness Engineering은 코딩 에이전트 시대의 소프트웨어 공학을 ‘하네스 설계’로 바꾼다"
date: "2026-05-11T10:59:55"
description: "OpenAI Ryan Lopopolo의 AI Engineer Europe 발표는 코드 작성이 싸진 뒤의 병목이 인간의 주의, 모델 컨텍스트, 검증 루프가 되며, 엔지니어의 역할이 에이전트가 일하기 좋은 하네스를 설계하는 쪽으로 이동한다고 설명한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - AI Engineer
  - Harness Engineering
  - Codex
  - Coding Agents
  - Agent Workflows
  - Context Engineering
  - OpenAI
draft: false
---

코딩 에이전트에 대한 논의는 자주 “모델이 얼마나 코드를 잘 쓰는가”로 시작한다. 하지만 OpenAI의 Ryan Lopopolo가 AI Engineer Europe에서 한 **`Harness Engineering: How to Build Software When Humans Steer, Agents Execute`** 발표는 질문을 조금 다르게 놓는다.

만약 코드 작성 자체가 더 이상 병목이 아니라면, 소프트웨어 엔지니어링에서 정말 희소한 것은 무엇인가. Ryan의 답은 인간의 시간과 주의, 모델의 attention, 그리고 컨텍스트 윈도우다. 그래서 앞으로 중요한 일은 에이전트에게 더 긴 프롬프트를 던지는 것이 아니라, 에이전트가 올바른 코드를 반복적으로 만들고 검증하고 수정할 수 있는 **하네스**를 설계하는 것이다.

한 줄로 줄이면 이렇다. **코드가 싸지는 순간, 진짜 엔지니어링은 에이전트가 실수하지 않도록 세계를 구조화하는 일이 된다.**

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/am_oeAoUhew"
    title="Harness Engineering: How to Build Software When Humans Steer, Agents Execute — Ryan Lopopolo, OpenAI"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

이 영상은 AI Engineer 채널에 2026-04-17 업로드된 약 46분 길이의 발표와 Q&A다. 발표자는 OpenAI Member of Technical Staff인 **Ryan Lopopolo**이며, 설명란은 OpenAI 공식 글 **`Harness engineering: leveraging Codex in an agent-first world`**와 Ryan의 X, LinkedIn, GitHub 프로필을 연결한다.

공식 YouTube chapter는 제공되지 않는다. 그래서 이 글은 `yt-dlp` metadata, oEmbed title, 전체 transcript, 영상에서 추출한 주요 슬라이드 프레임, 그리고 OpenAI 공식 글을 기준으로 흐름을 재구성했다. 특히 OpenAI 글은 2026-02-11 게시된 companion source로, 발표에서 언급되는 “0 lines of manually-written code”, Codex 중심 개발, repo-local knowledge base, custom lint, observability stack 같은 세부 내용을 교차 검증하는 데 중요하다.

발표의 형식은 제품 데모가 아니라 강한 운영 철학을 가진 keynote에 가깝다. 전반부는 “구현이 희소 자원이 아니게 된 세계”라는 thesis를 제시하고, 후반부 Q&A는 Codex, skills, GitHub PR, lint/test/reviewer agent, repository 구조를 실제로 어떻게 묶는지 설명한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-engineering-scarce-resources.jpg"
    alt="Ryan Lopopolo slide listing scarce resources as human time, human and model attention, and model context window"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    05:10 전후 장면. Ryan은 코드가 풍부해진 뒤의 병목을 human time, human and model attention, model context window로 정리한다. 이 세 자원이 글 전체의 경제학이다.
  </figcaption>
</figure>

## 핵심 아이디어: 인간은 조향하고, 에이전트는 실행한다

발표의 가장 강한 문장은 초반 1분대에 나온다. Ryan은 자신을 “token billionaire”라고 소개하고, 지난 몇 달 동안 에이전트만으로 소프트웨어를 만들었다고 말한다. 인간이 직접 에디터를 만지는 대신, 모델을 통해 작업하게 만드는 제약을 의도적으로 걸었다는 것이다.

이 주장은 OpenAI 공식 글의 “Humans steer. Agents execute.”와 같은 방향이다. 글은 내부 beta 제품을 **0 lines of manually-written code**로 만들었다고 설명하고, application logic, tests, CI configuration, documentation, observability, internal tooling까지 Codex가 작성했다고 말한다. 또한 약 5개월 동안 백만 줄 규모의 코드, 약 1,500개 PR, 초기 3명의 엔지니어 기준 하루 3.5개 PR/엔지니어 수준의 처리량을 언급한다.

중요한 점은 “사람이 사라진다”가 아니다. 사람은 더 높은 추상화 레이어로 올라간다. 우선순위를 정하고, acceptance criteria를 만들고, 제품 감각과 품질 기준을 문서화하고, 에이전트가 반복해서 실패하는 지점을 도구와 규칙으로 바꾼다. 손으로 코드를 쓰는 시간이 줄어드는 대신, 에이전트가 코드를 쓸 수 있는 환경을 설계하는 시간이 늘어난다.

그래서 Ryan이 말하는 harness engineering은 단순히 Codex CLI를 잘 쓰는 법이 아니다. 에이전트에게 필요한 텍스트, 도구, 테스트, 관찰 가능성, 리뷰 피드백을 **적절한 순간에 공급하는 시스템**을 만드는 일이다.

## “좋은 코드”의 암묵지를 시스템으로 바꾼다

Ryan은 “What does it mean to do a good job?”이라는 질문을 던진다. 사람 개발자라면 좋은 PR이 무엇인지 암묵적으로 안다. 보안상 위험한 경계는 검증해야 하고, 네트워크 호출에는 timeout과 retry가 있어야 하며, logging과 metrics는 운영자가 읽을 수 있어야 하고, 코드 구조는 다음 사람이 이해할 수 있어야 한다.

하지만 에이전트는 그 암묵지를 자동으로 공유하지 않는다. 한 번의 프롬프트에 “좋은 코드를 작성해”라고 써도, 팀의 취향과 reliability 기준과 아키텍처 제약이 지속적으로 유지되지는 않는다. 그러므로 좋은 팀은 이 암묵지를 문서, custom lint, source-code test, reviewer agent, PR checklist, error message로 바꿔야 한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-engineering-good-job.jpg"
    alt="Slide asking what does it mean to do a good job in harness engineering"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    08:35 전후 장면. “좋은 일을 한다”는 기준을 에이전트가 실행 가능한 규칙과 피드백 루프로 바꾸는 것이 발표의 중심축이다.
  </figcaption>
</figure>

OpenAI 글도 같은 지점을 더 구체적으로 설명한다. `AGENTS.md`를 1,000페이지짜리 매뉴얼로 키우는 대신, 약 100줄짜리 지도처럼 두고 `docs/`, `ARCHITECTURE.md`, `DESIGN.md`, `QUALITY_SCORE.md`, `RELIABILITY.md`, `SECURITY.md` 같은 repo-local knowledge base로 연결한다. 에이전트는 한 번에 모든 지시를 읽는 것이 아니라, 작은 entry point에서 필요한 문서로 점진적으로 이동한다.

이 구조는 컨텍스트 절약이기도 하지만, 더 본질적으로는 **agent legibility**의 문제다. 에이전트가 실행 중 접근할 수 없는 Google Docs, Slack thread, 사람 머릿속의 결정은 사실상 존재하지 않는 정보다. 그래서 중요한 지식은 repository-local, versioned, machine-readable한 형태로 내려와야 한다.

## 하네스는 “적시에 텍스트를 주는 시스템”이다

발표 중반의 핵심 문장은 “You can just prompt things.”에 가깝다. 여기서 prompt는 채팅창에 넣는 한 문단만 뜻하지 않는다. rules file, skill, lint error message, failing test, PR review comment, reviewer agent의 피드백, QA plan, GitHub issue가 모두 모델 행동을 유도하는 텍스트다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-engineering-prompt-things.jpg"
    alt="Ryan Lopopolo slide saying You can just prompt things"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    17:00 전후 장면. Ryan의 “prompt”는 채팅창 프롬프트보다 넓다. lint, test, PR comment, reviewer agent, skills까지 전부 모델 행동을 유도하는 입력 표면이다.
  </figcaption>
</figure>

이 관점이 실무적으로 중요한 이유는 모든 지시를 upfront로 밀어 넣을 필요가 없기 때문이다. 네트워크 코드에 timeout이 빠졌다면, 전역 시스템 프롬프트에 긴 reliability 문서를 붙이는 것보다 custom lint가 실패하면서 “이 상황에서는 timeout과 retry를 이렇게 추가하라”는 remediation prompt를 주는 편이 낫다. UI regression이라면 Chrome DevTools snapshot, screenshot, runtime event가 agent runtime에 들어와야 한다.

OpenAI 공식 글은 실제로 Codex가 worktree별 앱 인스턴스를 띄우고, Chrome DevTools Protocol로 UI를 조작하며, 로그·메트릭·트레이스를 local observability stack에서 조회하도록 만들었다고 설명한다. 다시 말해 harness는 “좋은 지시문 모음”이 아니라, 에이전트가 보고, 실행하고, 실패를 관찰하고, 다시 고칠 수 있게 하는 폐루프다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-engineering-codex-devtools.png"
    alt="OpenAI diagram showing Codex driving an app with Chrome DevTools MCP to validate its work"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    OpenAI 공식 글의 Chrome DevTools MCP 다이어그램. Codex가 앱 상태를 관찰하고, UI 경로를 실행하고, runtime event를 보고, 수정 후 재검증하는 루프가 하네스의 핵심이다.
  </figcaption>
</figure>

## 코드베이스 자체가 에이전트에게 주는 프롬프트다

Ryan의 발표에서 특히 중요한 확장은 코드베이스 구조 자체가 prompt라는 관점이다. 파일 시스템에 들어 있는 코드, 패키지 경계, naming convention, canonical utility, CI script는 다음 에이전트가 무엇을 자연스럽게 따라 할지 결정한다.

사람 개발자에게도 일관된 구조는 중요했지만, 에이전트 시대에는 그 중요도가 더 올라간다. 모델은 기존 패턴을 복제한다. 좋은 패턴이 명확하면 빨리 확산되고, 나쁜 패턴이 섞여 있으면 그것도 빠르게 복제된다. 따라서 “한 가지 방식”을 만들고, 구조적 경계를 강제하고, custom lint로 dependency direction을 막는 일이 단순한 코드 품질 활동이 아니라 에이전트 출력 분포를 조절하는 일이 된다.

OpenAI 글의 layered domain architecture 예시는 이 철학을 잘 보여 준다. business domain 안에서 Types → Config → Repo → Service → Runtime → UI 같은 고정 레이어를 두고, cross-cutting concern은 Providers라는 명시적 경로로만 들어가게 한다. 이런 규칙은 인간에게는 때로 답답해 보일 수 있지만, 에이전트에게는 탐색 공간을 줄이고 예측 가능한 출력을 만들게 하는 장치가 된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-engineering-layered-architecture.png"
    alt="OpenAI diagram of layered domain architecture with explicit cross-cutting boundaries"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    OpenAI 공식 글의 layered domain architecture 다이어그램. agent-generated codebase에서는 아키텍처 제약이 속도를 늦추는 장치가 아니라, 속도를 유지하면서 drift를 막는 guardrail이 된다.
  </figcaption>
</figure>

## 타임라인으로 보는 핵심 구간

| 구간 | 핵심 장면 | 의미 |
|---|---|---|
| 00:40~02:20 | “token billionaire”, “implementation is no longer the scarce resource”, “code is free” | 코드 생산이 아니라 인간 시간과 컨텍스트가 병목이라는 thesis 제시 |
| 02:20~05:20 | 5, 50, 5,000명의 엔지니어급 capacity와 staff engineer 비유 | 개인 개발자의 역할이 구현자에서 에이전트 팀을 조율하는 운영자로 이동 |
| 05:10~08:35 | scarce resources: human time, attention, context window | harness engineering의 경제학. 무엇을 아껴야 하는지 정의 |
| 08:35~11:15 | “What does it mean to do a good job?” | 좋은 코드의 암묵지를 문서·테스트·리뷰·lint로 명시화해야 함 |
| 11:15~15:20 | reviewer agents, custom lint, source-code tests | 반복 실패를 개인 리뷰가 아니라 시스템적 피드백 루프로 전환 |
| 15:20~18:35 | “You can just prompt things”, QA plan, PR media | 모든 피드백 표면을 prompt delivery channel로 해석 |
| 18:35~24:30 | Q&A: ticket, skills, Codex, GitHub PR | 실제 workflow는 ticket에서 시작해 skills와 repo-local docs로 이어짐 |
| 24:30~30:00 | 좋은 harness는 right text at the right time | instruction을 전부 upfront로 넣지 않고 필요한 시점에 공급 |
| 30:00~36:30 | 초보자는 test를 늘리고, 반복 병목을 자동화하라 | 도입 전략은 거창한 custom platform보다 작은 실패 루프 제거에서 시작 |
| 36:30~42:30 | garbage collection, review automation, “LLM as fuzzy compiler” | 코드가 artifact가 되고, spec·prompt·guardrail이 더 근본적인 자산이 된다는 관점 |
| 42:30~46:15 | token budget과 장기 목표를 agent에게 맡기는 미래상 | 인간은 목표·제약·acceptance criteria를 쓰는 메타 프로그래밍 레이어로 이동 |

## 영상과 공개 자료에서 확인되는 점

확인 가능한 사실부터 나누면, 영상 metadata와 oEmbed title은 모두 **`Harness Engineering: How to Build Software When Humans Steer, Agents Execute — Ryan Lopopolo, OpenAI`**로 일치한다. 채널은 AI Engineer, upload date는 2026-04-17이다. transcript 초반에서도 사회자가 OpenAI MTS Ryan Lopopolo를 소개하고, Ryan은 harness engineering과 agent-first software development를 주제로 발표를 시작한다.

영상 설명란의 핵심 companion link는 OpenAI 공식 글이다. 이 글은 2026-02-11 게시되었고, 작성자는 Ryan Lopopolo로 표시된다. 여기서 확인되는 구체적 수치는 다음과 같다.

| 공개 근거 | 확인되는 내용 | 해석 |
|---|---|---|
| OpenAI 공식 글 | 내부 beta 제품을 0 lines of manually-written code로 구축 | “agent-first”가 단순 실험이 아니라 실제 내부 사용자와 외부 alpha tester가 있는 제품 개발 경험에서 나온 주장 |
| OpenAI 공식 글 | 약 5개월, 백만 줄 규모, 약 1,500개 PR, 초기 3명 기준 3.5 PR/엔지니어/일 | throughput이 인간 리뷰와 QA capacity를 압박하는 수준으로 커졌다는 근거 |
| OpenAI 공식 글 | 짧은 `AGENTS.md`와 structured `docs/`를 system of record로 사용 | 에이전트용 지식은 사람 머릿속이나 chat thread가 아니라 repo-local artifact로 내려와야 함 |
| OpenAI 공식 글 | Chrome DevTools, local observability stack, custom lint, structural tests | harness가 프롬프트 모음이 아니라 실행·관찰·검증 인프라라는 점 |
| 영상 transcript | “Implementation is no longer the scarce resource”, “Code is free” | 발표의 강한 thesis. 다만 이는 경제적 비유이지 유지보수 비용이 0이라는 뜻은 아님 |

주의할 점도 있다. “Code is free”는 아무 코드나 merge해도 된다는 말이 아니다. 오히려 반대다. 코드 생산 비용이 낮아질수록 나쁜 패턴도 더 빨리 복제되므로, 품질 기준과 아키텍처 제약을 더 적극적으로 시스템화해야 한다.

또 하나의 caveat는 일반화 범위다. OpenAI 글도 “이 동작은 특정 repository 구조와 tooling에 크게 의존하므로 비슷한 투자가 없으면 그대로 일반화된다고 가정하면 안 된다”고 선을 긋는다. Ryan의 팀은 token budget, internal tooling, Codex, observability, agent review loop에 상당한 투자를 한 극단적인 선도 사례다. 모든 팀이 같은 throughput을 바로 얻을 수 있다는 뜻은 아니다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-engineering-agent-knowledge.png"
    alt="OpenAI diagram showing that what Codex cannot see does not exist and must be encoded as markdown in the codebase"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    OpenAI 공식 글의 “what Codex can’t see doesn’t exist” 다이어그램. 에이전트가 보지 못하는 조직 지식은 사실상 실행 시스템 밖에 있다.
  </figcaption>
</figure>

## 실무 관점에서의 해석

이 발표의 가치는 Codex 사용 팁보다 넓다. Ryan이 말하는 harness engineering은 사실상 **AI 코딩 에이전트 시대의 소프트웨어 공학 운영 모델**이다.

기존에도 좋은 팀은 architecture doc, design doc, test, CI, code review, observability, incident review를 운영했다. 달라진 점은 이 산출물들이 사람의 이해를 돕는 보조 문서에서, 에이전트가 직접 실행하고 판단하는 입력 표면으로 바뀐다는 점이다. `AGENTS.md`는 onboarding 문서가 아니라 runtime map이고, lint error는 style warning이 아니라 remediation prompt이며, PR comment는 사람에게 남기는 피드백이면서 동시에 다음 agent run을 조종하는 지시문이다.

따라서 팀이 당장 배울 수 있는 첫 번째 교훈은 “더 긴 프롬프트를 쓰자”가 아니다. 반복되는 리뷰 코멘트, 자주 깨지는 테스트, agent가 계속 헷갈리는 폴더 구조, 매번 복붙하는 setup 설명을 찾아서 durable artifact로 바꾸는 것이다. 작은 custom lint 하나, 잘 관리되는 `docs/` index 하나, 재현 가능한 local dev command 하나가 거대한 프롬프트보다 더 큰 효과를 낼 수 있다.

두 번째 교훈은 review philosophy다. Ryan은 accepted code와 perfect code를 구분한다. throughput이 높은 시스템에서는 모든 PR을 인간이 완벽하게 붙잡는 방식이 오히려 병목이 된다. 대신 반복 가능한 기준은 reviewer agent와 test로 밀어내고, 인간은 제품 판단, taste, 새로운 원칙 발견, failure class 제거에 집중해야 한다.

세 번째 교훈은 entropy management다. agent-generated codebase는 빠르게 성장하지만, 그만큼 drift도 빠르다. OpenAI 글은 금요일마다 AI slop을 청소하던 방식이 scale하지 않았고, golden principles와 recurring cleanup process를 repository에 인코딩하는 방향으로 갔다고 설명한다. 즉 자율성을 높일수록 garbage collection도 자동화해야 한다.

## 코드가 artifact가 되는 순간

후반부 Q&A에서 Ryan은 코드를 “compiled artifact”처럼 볼 수 있다고 말한다. spec, prompt, guardrail, test가 있고, LLM이 일종의 fuzzy compiler처럼 그 사이에서 코드를 만들어 낸다는 비유다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/harness-engineering-fuzzy-compiler.jpg"
    alt="Q&A frame mentioning OpenAI Symphony and LLM as fuzzy compiler"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    42:05 전후 Q&A 장면. “LLM as fuzzy compiler” 비유는 코드보다 specification, prompt, guardrail, acceptance criteria가 더 근본적인 자산이 될 수 있다는 관점을 압축한다.
  </figcaption>
</figure>

이 비유는 과격하지만 방향은 명확하다. 코드 자체가 덜 귀해진다면, 귀해지는 것은 코드를 생성하게 만든 상위 구조다. 어떤 사용자 journey가 중요한지, 어떤 failure를 허용하지 않을지, 어떤 architecture boundary를 깨면 안 되는지, 어떤 test와 observability signal이 merge 가능성을 판단하는지 같은 메타 레이어가 소프트웨어 팀의 핵심 자산이 된다.

그렇다고 코드가 중요하지 않다는 뜻은 아니다. 오히려 코드는 여전히 제품이 돌아가는 실제 artifact다. 다만 그 코드를 안정적으로 계속 만들어 내는 체계—문서, 테스트, 하네스, 리뷰 루프, 컨텍스트 관리, observability—가 점점 더 큰 레버리지가 된다.

그래서 harness engineering을 “프롬프트 엔지니어링의 다음 단계”로만 보면 부족하다. 더 정확히는 소프트웨어 공학의 오래된 원칙들이 AI agent runtime에 맞게 재배치되는 과정이다. 좋은 architecture, 좋은 test, 좋은 docs, 좋은 CI가 사라지는 것이 아니라, 이제는 사람이 읽기 위해서만이 아니라 에이전트가 실행하기 위해서도 존재한다.

## 정리

Ryan Lopopolo의 발표는 AI 코딩의 미래를 낙관적으로 말하지만, 무책임하게 단순화하지는 않는다. 핵심은 “모델이 코드를 다 써 주니 엔지니어링이 쉬워진다”가 아니다. 오히려 코드 작성이 쉬워질수록, 하네스 설계와 검증 루프와 조직 지식의 구조화가 더 중요해진다는 주장이다.

개발자가 직접 타이핑하는 코드의 양은 줄어들 수 있다. 그러나 어떤 코드를 받아들일지, 어떤 실패를 시스템적으로 제거할지, 어떤 맥락을 에이전트에게 보이게 만들지, 어떤 기준을 문서가 아니라 실행 가능한 guardrail로 바꿀지는 여전히 인간의 일이다.

그 의미에서 harness engineer는 코딩을 포기한 개발자가 아니다. 수천 개의 에이전트 작업을 안전하게 통과시키기 위해, 코드보다 한 단계 위의 시스템을 설계하는 개발자다.

Sources: https://www.youtube.com/watch?v=am_oeAoUhew, https://openai.com/index/harness-engineering/, https://www.latent.space/p/harness-eng
