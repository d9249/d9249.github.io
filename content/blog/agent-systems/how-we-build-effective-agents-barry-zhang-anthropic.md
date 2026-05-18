---
title: "Anthropic의 effective agent 원칙은 ‘더 자율적인 모델’보다 먼저 ‘더 단순한 운영면’을 요구한다"
date: "2026-05-19T06:55:35"
description: "Barry Zhang의 AI Engineer 발표는 Anthropic의 Building Effective Agents 글을 바탕으로, 에이전트를 모든 문제에 붙이는 대신 복잡도·가치·검증 가능성·오류 비용을 따지고, 도구와 환경과 시스템 프롬프트로 이루어진 단순한 루프부터 다듬으라고 말한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Anthropic
  - AI Agents
  - Agent Engineering
  - Agent Systems
  - Claude
  - AI Engineer
  - YouTube
draft: false
---

에이전트 담론은 자주 “모델이 얼마나 자율적으로 행동할 수 있는가”로 시작한다. 하지만 실제 제품에서 더 먼저 부딪히는 질문은 조금 다르다. 이 작업이 정말 agent가 필요한 작업인가. workflow로 충분한가. 한 번 더 탐색하게 만들 때 늘어나는 토큰 비용과 지연 시간은 감당할 수 있는가. 실패했을 때 발견하기 쉬운가. 그리고 agent가 보는 세계는 사람이 보는 세계와 얼마나 다른가.

AI Engineer 채널의 **`How We Build Effective Agents: Barry Zhang, Anthropic`** 발표는 이 질문들을 짧고 실무적인 형태로 정리한다. 발표자인 Barry Zhang은 Anthropic Applied AI 팀에서 enterprise와 startup의 agentic system을 다루는 member of technical staff로 소개된다. 발표는 Anthropic Engineering 블로그의 **`Building Effective AI Agents`** 글을 바탕으로, 세 가지 메시지에 집중한다.

1. 모든 곳에 agent를 만들지 말 것.
2. 만들기로 했다면 가능한 오래 단순하게 유지할 것.
3. 반복 개선할 때 사람의 관점이 아니라 agent의 관점에서 생각할 것.

이 글의 핵심 해석은 다음과 같다. Barry의 발표에서 “effective agent”는 복잡한 multi-agent framework나 긴 prompt 기교가 아니다. **환경, 도구, 시스템 프롬프트, 모델 루프라는 가장 작은 운영면을 정확히 설계하고, agent가 직접 볼 수 있는 ground truth와 피드백을 잘 주는 것**에 가깝다.

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/D7_ipDqhtwk"
    title="Video: How We Build Effective Agents — Barry Zhang, Anthropic"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"
  ></iframe>
</div>

이 영상은 AI Engineer 채널에 2025-04-04 업로드된 약 15분짜리 컨퍼런스 발표다. 설명란에 따르면 New York에서 열린 AI Engineer Summit 2025의 Agent Engineering Session Day에서 녹화되었다. YouTube metadata 기준 공식 chapter는 제공되지 않는다. 따라서 이 글의 타임라인은 transcript의 주제 전환과 영상에서 추출한 주요 프레임을 기준으로 재구성했다.

Barry는 발표 초반에 자신과 Eric이 약 두 달 전 Anthropic 블로그에 쓴 **`Building Effective Agents`** 글을 언급한다. 그 글은 agentic system을 크게 두 갈래로 나눈다. **workflow**는 LLM과 tool을 미리 정의된 코드 경로로 오케스트레이션하는 시스템이고, **agent**는 LLM이 자신의 절차와 tool 사용을 동적으로 지시하는 시스템이다. 발표는 이 구분을 가져와 “언제 agent까지 가야 하는가”를 더 직접적으로 묻는다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/how-effective-agents-checklist.webp"
    alt="Barry Zhang slide showing checklist for whether to build an agent"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    03:05 전후 슬라이드. Barry는 agent 도입 여부를 task complexity, task value, critical capability, error cost/discovery 네 질문으로 점검한다. 핵심은 “agent는 복잡하고 가치 있는 작업을 scale하기 위한 수단이지, 모든 LLM 기능의 기본 upgrade가 아니다”라는 점이다.
  </figcaption>
</figure>

## 첫 번째 원칙: agent는 workflow의 상위 호환이 아니다

발표에서 가장 먼저 나오는 경고는 “Don’t build agents for everything”이다. 이유는 단순하다. agent는 탐색한다. 탐색은 토큰을 쓰고, 지연 시간을 늘리고, 잘못된 행동이 누적될 수 있는 표면을 만든다. 따라서 agent를 붙이면 더 똑똑해질 것이라는 기대보다, agent가 추가하는 비용과 불확실성을 먼저 계산해야 한다.

Barry가 제시한 체크리스트는 네 단계다.

| 질문 | Agent가 어울리는 경우 | Workflow가 더 나은 경우 |
|---|---|---|
| 작업이 충분히 복잡한가 | decision tree를 미리 그리기 어렵고 모호한 문제 공간 | 전체 분기와 처리 경로를 명시적으로 설계할 수 있음 |
| 작업의 가치가 충분한가 | 토큰 비용과 latency를 감수할 만큼 task value가 큼 | 고빈도·저마진 task라 budget이 작음 |
| 핵심 능력을 derisk했는가 | agent trajectory의 주요 병목이 테스트 가능함 | 쓰기, 디버깅, 복구 같은 필수 능력이 불안정함 |
| 오류 비용과 발견 가능성은 어떤가 | 실패를 빨리 발견하거나 sandbox/human-in-loop로 통제 가능 | high-stake이고 오류 발견이 늦거나 어려움 |

이 판단 기준은 Anthropic의 블로그 글과도 맞물린다. 블로그는 “가능한 가장 단순한 해결책을 찾고, 필요할 때만 복잡도를 높이라”고 말한다. 많은 애플리케이션에서는 retrieval과 in-context example을 붙인 단일 LLM call만으로 충분하고, 잘 정의된 작업에는 workflow가 predictability와 consistency를 준다. agent는 flexibility와 model-driven decision making이 실제로 필요한 경우에 의미가 있다.

여기서 흥미로운 예시는 coding agent다. Barry는 coding이 좋은 agent use case인 이유를 네 가지로 설명한다. design doc에서 PR까지 가는 과정은 모호하고 복잡하다. 좋은 코드는 가치가 크다. Claude 같은 모델은 이미 코딩 workflow의 여러 부분에서 강하다. 마지막으로 unit test와 CI를 통해 결과를 비교적 쉽게 검증할 수 있다.

즉 coding agent가 성공한 이유는 단지 “모델이 코드를 잘 써서”가 아니다. **작업은 복잡하지만, 피드백 루프는 비교적 명확하고, 결과 검증 표면이 있다**는 조합 때문이다. 이 조합이 없으면 agent의 자율성은 장점이 아니라 운영 리스크가 된다.

## 두 번째 원칙: agent의 최소 골격은 생각보다 작다

Agent를 만들기로 했다면 다음 원칙은 단순성이다. Barry는 agent를 “models using tools in a loop”라고 정의한다. 이 정의는 일부러 작다. 커다란 agent framework나 복잡한 planner를 먼저 떠올리지 말고, 다음 세 요소를 먼저 보라는 뜻이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/how-effective-agents-loop.webp"
    alt="Slide explaining that agents are models using tools in a loop"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    05:55 전후 슬라이드. Agent는 환경 상태를 보고, 시스템 프롬프트와 함께 모델을 호출하고, tool을 실행한 뒤, 그 결과로 환경 상태를 갱신하는 루프다. Barry는 이 간단한 골격을 먼저 다듬는 것이 iteration ROI가 가장 높다고 말한다.
  </figcaption>
</figure>

1. **Environment**: agent가 작동하는 시스템과 상태.
2. **Tools**: agent가 행동하고 피드백을 얻는 인터페이스.
3. **System prompt**: 목표, 제약, 이상적인 행동 양식.

이 셋을 정하면 모델은 loop 안에서 호출된다. 어떤 작업에서는 search tool을 호출하고, 어떤 작업에서는 shell이나 browser를 쓰며, 어떤 작업에서는 code edit와 test 실행을 반복한다. 하지만 Barry가 강조하는 것은 backbone이 의외로 비슷하다는 점이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/how-effective-agents-same-backbone.webp"
    alt="Slide showing coding, computer use, and search agents sharing environment, tools, and system prompt columns"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    06:45 전후 슬라이드. Coding, computer use, search agent는 product surface와 scope가 달라도 environment, tools, system prompt라는 같은 세 칸으로 정리된다. 복잡한 최적화는 behavior가 잡힌 뒤에 붙이는 편이 낫다.
  </figcaption>
</figure>

이 관점은 실무적으로 꽤 중요하다. 많은 agent 프로젝트는 초기에 architecture를 크게 잡는 순간 iteration speed가 죽는다. 아직 tool description도 제대로 검증하지 않았고, agent가 실제로 어떤 observation을 받는지도 불분명한데, memory layer, multi-agent delegation, reflection loop, planner, router를 한꺼번에 붙이면 어디가 실패하는지 알기 어렵다.

Barry는 최적화를 부정하지 않는다. Coding이나 computer use에서는 trajectory caching으로 비용을 줄일 수 있고, search agent에서는 많은 tool call을 병렬화해 latency를 낮출 수 있다. 사용자에게 agent progress를 보여 주는 것도 trust를 위해 중요하다. 다만 순서가 중요하다. **먼저 단순한 세 구성요소로 behavior를 맞추고, 그 다음 cost·latency·trust 최적화를 붙이는 것**이 더 안전하다.

## 세 번째 원칙: agent의 context window 안에 들어가 보라

발표에서 가장 좋은 실험은 “think like your agents” 부분이다. Barry는 사람이 자기 관점에서 agent를 설계한 뒤, agent가 이상한 실수를 하면 당황하는 경우가 많다고 말한다. 하지만 agent는 사람처럼 전체 환경을 계속 보는 것이 아니다. 매 step마다 제한된 context로 inference를 하고, tool을 호출하고, 그 결과를 다시 본다.

컴퓨터 사용 agent를 예로 들면 이 차이가 더 선명해진다. agent가 받는 것은 정적인 screenshot과 종종 부족한 설명뿐이다. 모델이 생각하고 tool이 실행되는 몇 초 동안에는 사실상 눈을 감고 컴퓨터를 조작하는 것과 비슷하다. 다음 screenshot을 봤을 때 click이 성공했는지, 엉뚱한 곳을 눌렀는지, 심지어 시스템을 꺼 버렸는지 그제야 알 수 있다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/how-effective-agents-computer-use-perspective.webp"
    alt="Slide asking what it is like as a computer use agent, with a screenshot and minimal task description"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    09:20 전후 슬라이드. 사람에게는 당연한 GUI 맥락도 agent에게는 정적 screenshot, 제한된 설명, tool 결과의 반복으로만 들어온다. Barry는 실제로 agent의 관점에서 task를 해 보는 것을 추천한다.
  </figcaption>
</figure>

이 실험을 해 보면 agent에게 필요한 정보가 더 구체적으로 보인다. 화면 해상도, screenshot refresh 주기, 가능한 행동과 금지된 행동, 추천 action, “터미널로 설치 가능” 같은 limitation이 모두 context 품질을 바꾼다. 사람에게는 자명한 전제가 agent에게는 빠진 instruction일 수 있다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/how-effective-agents-context-needs.webp"
    alt="Slide listing what a computer use agent would need: environment context, recommended actions, and limitations"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    10:25 전후 슬라이드. Agent에게 필요한 것은 추상적인 “잘해라”가 아니라 환경 context, 권장 행동, limitation이다. 좋은 ACI(agent-computer interface)는 좋은 HCI만큼 설계가 필요하다.
  </figcaption>
</figure>

Anthropic 블로그의 Appendix도 같은 메시지를 다른 말로 정리한다. Tool definition과 specification은 전체 prompt만큼이나 prompt engineering이 필요하다. 좋은 tool 설명에는 example usage, edge case, input format requirement, 다른 tool과의 경계가 들어가야 한다. 블로그는 이를 HCI와 빗대어 **agent-computer interface, ACI**라고 부른다.

이 지점이 발표의 practical center다. Agent 실패를 “모델이 멍청해서”라고만 보면 개선 방향이 막힌다. 반대로 “agent가 본 context 안에서 이 결정을 하는 것이 합리적이었나”를 물으면 개선 항목이 나온다. tool 이름을 바꿔야 할 수도 있고, parameter를 줄여야 할 수도 있고, screenshot에 해상도 정보를 붙여야 할 수도 있으며, system prompt의 금지/허용 범위를 더 선명하게 써야 할 수도 있다.

## Claude에게 Claude를 이해시킨다는 작은 루프

Barry는 agent의 관점을 이해하는 방법으로 직접적인 self-analysis도 제안한다. 시스템 프롬프트를 Claude에게 넣고 “이 지시가 모호한가”, “따를 수 있는가”를 묻는다. Tool description을 넣고 “이 tool을 어떻게 써야 하는지 알겠는가”, “parameter가 너무 많은가 혹은 부족한가”를 묻는다. Agent trajectory 전체를 넣고 “왜 이 결정이 나왔다고 생각하는가”, “더 나은 결정을 위해 어떤 정보가 필요했는가”를 묻는다.

물론 이 방법이 사람의 이해를 대체하지는 않는다. 모델에게 자신의 실패를 해석하게 하면 또 다른 hallucination이 들어갈 수 있다. 하지만 debugging surface로는 유용하다. 특히 tool description과 system prompt는 사람이 읽기에 명확해 보여도 모델에게는 다르게 보일 수 있다. 모델이 “내가 이 tool을 이 boundary 안에서 써야 한다는 점이 불명확하다”고 말하면, 그 자체가 ACI 개선 신호가 된다.

실무적으로는 다음 루프가 유용하다.

| 산출물 | Claude에게 던질 질문 | 기대 효과 |
|---|---|---|
| System prompt | 이 지시에서 모호하거나 충돌하는 부분은 무엇인가 | goal, constraint, allowed behavior 정리 |
| Tool description | 이 tool을 언제 쓰고 언제 쓰지 말아야 하는지 알겠는가 | tool boundary와 parameter naming 개선 |
| Failed trajectory | 이 step에서 왜 이 결정을 했다고 보는가 | observation gap, missing context, bad affordance 발견 |
| Successful trajectory | 어떤 context가 성공에 가장 도움이 되었는가 | reusable instruction과 test case 확보 |

이 루프는 “모델에게 모든 것을 맡기자”가 아니라 “모델이 어떤 affordance를 보고 행동하는지 측정하자”에 가깝다. Agent engineering은 prompt 작성만이 아니라, agent가 보는 세계를 실험하고 계측하는 일이다.

## 개인적 전망: budget-aware, self-evolving tools, multi-agent communication

발표 후반의 personal musings는 세 가지 open question으로 이어진다. 첫째, agent는 더 budget-aware해져야 한다. Workflow는 어느 정도 cost와 latency를 예측하기 쉽지만, agent는 exploration이 늘어나면 비용과 시간이 크게 출렁인다. Production deployment에서는 time, money, token budget을 어떻게 정의하고 강제할지가 핵심 문제가 된다.

둘째, self-evolving tools다. 이미 사람은 모델을 써서 tool description을 고치고 있다. Barry는 이것이 더 일반화되어, agent가 자기 tool ergonomics를 설계하고 개선하는 meta tool로 갈 수 있다고 본다. 다만 이 방향은 안전 장치가 필요하다. Agent가 tool을 더 편하게 바꾸는 것과 권한 경계를 흐리는 것은 한 끗 차이이기 때문이다.

셋째, multi-agent collaboration이다. Barry는 올해 안에 production에서 더 많은 multi-agent 협업을 보게 될 것이라는 개인적 확신을 말한다. 장점은 병렬화, 관심사 분리, main agent context window 보호다. 반대로 큰 질문은 communication protocol이다. 지금 많은 시스템은 synchronous user-assistant turn에 맞춰져 있다. 여러 agent가 서로 비동기적으로 메시지를 주고받고, 역할을 인식하고, 중간 산출물을 넘기는 구조는 아직 열린 설계 문제다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/how-effective-agents-open-questions.webp"
    alt="Slide listing personal musings and open questions: budget-aware agents, self-evolving tools, and multi-agent communication"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    11:48 전후 슬라이드. Barry의 open questions는 budget-aware agents, self-evolving tools, multi-agent communication 세 가지다. 모두 “agent가 더 자율적이 되는 만큼 운영 통제면도 더 정교해야 한다”는 문제로 이어진다.
  </figcaption>
</figure>

이 전망은 앞의 원칙들과 모순되지 않는다. 오히려 같은 방향이다. Budget-aware agent는 “복잡해진 agent를 어떻게 다시 통제 가능한 단위로 만들 것인가”의 문제다. Self-evolving tools는 “도구 인터페이스를 어떻게 agent에게 더 명확하게 만들 것인가”의 확장이다. Multi-agent communication은 “큰 context 하나에 모든 것을 넣지 않고, 역할과 산출물을 어떻게 나눌 것인가”의 문제다.

## 타임라인으로 보는 핵심 구간

| 구간 | 영상 흐름 | 관찰 포인트 |
|---|---|---|
| 00:17–00:52 | 발표자 소개와 세 가지 core ideas | Anthropic의 Building Effective Agents 글을 바탕으로, agent 도입 판단·단순성·agent 관점 사고를 예고한다. |
| 00:52–02:31 | 단순 LLM 기능에서 workflow, agentic system으로 진화 | summarization/classification/extraction → predefined workflow → domain-specific agent라는 역사적 흐름을 잡는다. |
| 02:31–04:58 | “Don’t build agents for everything”와 agent checklist | 복잡도, 가치, 핵심 능력, 오류 비용/발견 가능성을 기준으로 agent가 필요한지 점검한다. |
| 04:58–05:38 | Coding이 좋은 agent use case인 이유 | design doc→PR의 모호성, 높은 가치, Claude의 코딩 능력, unit test/CI 검증 가능성이 결합된다. |
| 05:38–08:03 | “Keep it simple”와 agent 최소 골격 | environment, tools, system prompt, loop를 먼저 다듬고, caching/parallelization/trust UI는 behavior 이후에 붙인다. |
| 08:03–10:38 | “Think like your agents”와 computer-use agent 실험 | 정적 screenshot, 제한된 설명, tool delay가 agent의 실제 세계라는 점을 보여 준다. |
| 10:38–11:26 | Claude에게 prompt/tool/trajectory를 분석시키기 | system prompt와 tool description의 모호성을 모델 관점에서 점검하는 debugging loop를 제안한다. |
| 11:26–13:35 | Personal musings와 open questions | budget-aware agents, self-evolving tools, multi-agent communication이 다음 운영 문제로 제시된다. |
| 13:35–14:51 | 최종 takeaways와 speaker context | “모든 것에 agent를 만들지 말라, 단순하게 유지하라, agent처럼 생각하라”로 마무리한다. |

## 영상과 연결 자료에서 확인되는 점

확인 가능한 공개 자료를 나누면 다음과 같다.

| 근거 | 확인되는 내용 | 이 글에서의 사용 |
|---|---|---|
| YouTube metadata | 제목은 `How We Build Effective Agents: Barry Zhang, Anthropic`, 채널은 AI Engineer, 업로드일은 2025-04-04, 길이는 약 15분 | 영상의 기본 맥락과 embed, 발표 정보 확인 |
| YouTube description | Agent Engineering Session Day at AI Engineer Summit 2025 in New York 녹화, Barry는 Anthropic Applied AI MTS | 발표자/행사 맥락 확인 |
| Transcript | 세 core ideas, agent checklist, simple loop, computer-use agent 비유, open questions가 순서대로 등장 | 타임라인과 본문 해석의 1차 근거 |
| Video frames | checklist, agent loop, same backbone, computer-use context, agent가 필요한 정보, open questions 슬라이드 | 본문 figure와 caption 구성 |
| Anthropic Engineering blog | workflow와 agent 구분, simple/composable patterns, augmented LLM, tool/ACI 설계 원칙 | 발표가 기대는 companion source로 사용 |

특히 Anthropic 블로그의 마지막 요약은 발표와 거의 같은 결을 가진다. 성공은 가장 sophisticated한 시스템을 만드는 것이 아니라, 필요에 맞는 right system을 만드는 데 있다. Simple prompt에서 시작하고, evaluation으로 최적화하며, 단순한 방식이 부족하다는 증거가 있을 때만 multi-step agentic system을 붙이라는 것이다.

## 실무 관점에서의 해석

이 발표는 짧지만 agent engineering의 기본 hygiene를 잘 찌른다. 요즘 agent 제품은 빠르게 “더 많은 tool, 더 큰 context, 더 많은 sub-agent”로 가기 쉽다. 하지만 Barry의 메시지는 반대 방향에서 시작한다. **Agent가 필요한 문제인지 먼저 의심하고, 필요하다면 최소 루프로 만들고, 그 루프 안에서 agent가 실제로 무엇을 보는지 점검하라.**

가장 중요한 교훈은 agent의 자율성이 곧 제품 가치가 아니라는 점이다. 자율성은 비용, latency, error compounding을 함께 가져온다. 따라서 agent의 좋은 use case는 “모델에게 마음대로 시켜도 되는 일”이 아니라, 복잡하고 가치 있지만 환경 피드백과 검증 루프가 있어 실패를 줄일 수 있는 일이다. Coding이 대표적인 이유도 여기에 있다.

두 번째 교훈은 tool design이 prompt design만큼 중요하다는 점이다. Agent가 행동할 수 있는 유일한 통로는 tool이다. Tool 이름, parameter, error message, result shape, permission boundary가 애매하면 agent는 사람 눈에는 이상해 보이는 결정을 할 수밖에 없다. ACI를 설계한다는 말은 결국 “모델이 사용할 수 있는 제품 API를 설계한다”는 뜻이다.

세 번째 교훈은 multi-agent나 self-evolving tool 같은 다음 단계도 단순성의 원칙을 버리는 것이 아니라 확장한다는 점이다. 여러 agent를 쓰려면 communication과 role boundary가 더 명확해야 하고, tool을 스스로 개선하게 하려면 budget과 permission이 더 분명해야 한다. 더 자율적인 시스템일수록 더 적은 추상화가 아니라 더 명확한 운영면이 필요하다.

결국 Barry의 effective agent는 “많은 것을 알아서 하는 모델”보다 “자기가 본 것과 할 수 있는 일을 정확히 알고, 환경의 피드백으로 다음 행동을 고를 수 있는 시스템”에 가깝다. Agent를 만든다는 것은 모델을 풀어놓는 일이 아니라, 모델이 안전하게 탐색할 수 있는 작업장과 계측 가능한 루프를 설계하는 일이다.

## 참고한 공개 자료

- [YouTube: How We Build Effective Agents — Barry Zhang, Anthropic](https://www.youtube.com/watch?v=D7_ipDqhtwk)
- [Anthropic Engineering: Building Effective AI Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [AI Engineer](https://ai.engineer)
