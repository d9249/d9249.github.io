---
title: "자기개선 에이전트는 모델과 scaffold를 따로 봐야 한다"
date: "2026-07-18T20:34:45+09:00"
description: "arXiv 2607.13104는 자기개선 에이전트를 foundation model 업데이트와 prompt·memory·tool·control logic을 고치는 scaffold 업데이트로 나누고, 성능보다 transfer·regression·비용·안전성을 함께 추적하는 평가 체계를 제안한다."
author: "Sangmin Lee"
category: "research-agents"
tags:
  - Self-Improving Agents
  - Agent Scaffold
  - Evaluation
  - Agent Memory
  - AI Safety
image: "/images/blog/self-improving-agent-taxonomy.webp"
draft: false
---

“에이전트가 스스로 개선한다”는 말은 너무 넓어서 오해를 만든다. 실패한 답변을 다시 고치는 것, 다음 실행에서 더 나은 prompt를 쓰는 것, 메모리를 업데이트하는 것, tool wrapper를 디버깅하는 것, 그리고 foundation model의 weight를 fine-tuning하는 것은 모두 개선처럼 보인다. 그러나 수정 대상·되돌릴 수 있는 정도·필요한 검증은 완전히 다르다.

`Self-Improvements in Modern Agentic Systems: A Survey`는 이 혼재를 모델 중심으로 정리하지 않는다. 저자들은 현대 agent를 foundation model과 그 주위의 operational scaffold가 결합된 시스템으로 보고, 자기개선을 경험에서 나온 신호를 이용해 이 둘 중 하나를 **지속적으로 갱신·커밋하는 update operator**로 정의한다. 핵심은 “agent가 반성 문장을 생성했는가”가 아니라, 그 결과가 다음 행동을 바꾸는 상태로 실제 저장됐는가다.

97쪽 분량의 이 survey가 특히 유용한 이유는 역사나 논문 목록을 모으는 데서 멈추지 않는다는 점이다. parameter update와 prompt·memory·tool·control logic update를 한 taxonomy에 놓고, 왜 improvement claim이 평균 score 하나로 끝나면 안 되는지까지 다룬다. 즉 이 글은 자기개선을 능력의 슬로건이 아니라 **변경 관리와 평가의 문제**로 다시 정의한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/self-improving-agent-taxonomy.webp"
    alt="foundation model 개선과 scaffold 개선, 각 개선 신호와 적용 영역을 한 장에 정리한 자기개선 에이전트 분류도"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. survey는 자기개선을 foundation model의 parameter update와 scaffold update라는 두 경로로 나누고, 생성 데모·내재적 평가·환경 경험 같은 신호가 각각의 갱신을 어떻게 이끄는지 배치한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

이 분야의 문헌에는 self-correction, self-refine, self-play, prompt evolution, memory learning, tool creation, harness evolution처럼 서로 다른 이름이 섞여 있다. 겉으로는 모두 “self-improvement”지만, 어떤 방법은 model weight를 업데이트하고 다른 방법은 외부 memory만 수정한다. 어떤 것은 실행 가능한 verifier의 피드백을 쓰고, 어떤 것은 LLM judge의 critique를 쓴다. 이 차이를 구분하지 않으면 더 높은 점수가 진짜 능력 이전인지, 특정 evaluator에 대한 적응인지 판단하기 어렵다.

저자들이 제시한 공통 상태는 다음처럼 간단하다.

- **Agent:** `A_t = (θ_t, Σ_t)`
- **`θ` (foundation model):** parameter와 그 parameter가 만드는 일반적 능력
- **`Σ` (scaffold):** prompt, memory, tool set, control logic 등 model 밖의 운영 구조
- **`S_t` (learning signal):** 실행 결과, critique, reward, verifier output, 환경 interaction에서 나온 갱신 근거

따라서 개선은 `θ`를 바꾸는 `U_θ`이거나 `Σ`를 바꾸는 `U_Σ`이다. 이 표현의 장점은 과장된 자기개선 서사를 실제 엔지니어링 질문으로 바꾼다는 데 있다. *무엇을 고쳤는가? 어떤 신호가 그 변경을 정당화했는가? 변경 전후를 어떻게 비교했는가?*가 모두 기록 가능한 질문이 된다.

## 핵심 아이디어 / 구조 / 동작 방식

### 느리지만 넓게 남는 model 개선, 빠르지만 검증 가능한 scaffold 개선

survey의 첫 축은 foundation model improvement다. 이 경로는 생성한 demonstration, 자기평가 feedback, 또는 환경에서 모은 trajectory로 weight를 업데이트한다. 잘 작동하면 특정 작업에서 얻은 행동을 여러 future task에 amortize할 수 있지만, update 비용이 크고 credit assignment가 어렵다. regression이 생겨도 어느 데이터·어느 gradient step이 원인인지 추적하기 어렵고, catastrophic forgetting 위험도 있다.

반대쪽 scaffold improvement는 model parameter를 고정한 채 prompt, memory, tools, full scaffolding을 고친다. 비교적 싸고 되돌리기 쉽다. 예를 들어 실패 사례를 보고 prompt policy를 수정하거나, 고품질 실행 기록을 memory에 저장하고, 깨진 tool wrapper를 고치거나, agent codebase의 orchestration 자체를 재설계할 수 있다. 하지만 “쉽게 수정한다”는 것이 “안전하게 개선한다”는 뜻은 아니다. 잘못된 reflection이 memory에 영구 저장되거나, tool logic의 취약점이 다음 실행에도 이어질 수 있다.

| 개선 대상 | 대표 update | 강점 | 핵심 위험 |
|---|---|---|---|
| Foundation model `θ` | synthetic demonstration, preference/RL, 환경 trajectory로 fine-tuning | capability gain을 다양한 task에 장기 이전할 가능성 | 비용·data provenance·catastrophic forgetting·원인 추적 난이도 |
| Prompt | score search, critique refinement, population evolution, textual gradient | 빠르고 model-agnostic하며 되돌리기 쉬움 | evaluator나 wording template에 과적합 |
| Memory | create/read/update/delete, hierarchy·graph·vector retrieval 개선 | 경험을 장기적으로 재사용 | retrieval noise, stale heuristic, poisoning, privacy leakage |
| Tool | routing, refinement, autonomous tool creation | 실행 능력과 환경 커버리지 확장 | 잘못된 호출·권한 확대·새 tool의 공급망/검증 문제 |
| Full scaffold | prompt·memory·tools·control logic을 함께 변경 | component 조합을 넘어 전체 loop를 개선 | self-confirming evaluation, 복잡성 폭증, persistent vulnerability |

### signal은 ‘점수’가 아니라 개선의 원인 기록이다

저자들은 무엇을 고치는지와 별도로, 개선을 이끄는 signal의 출처를 세 갈래로 둔다. **intrinsic generative demonstrations**는 agent가 만든 고품질 input-output 예시를 학습에 쓰는 경우다. **intrinsic evaluative feedback**은 critic·judge·self-reward가 만든 score나 자연어 critique를 사용한다. **extrinsic exploratory experience**는 test, 환경 상태 변화, execution trace처럼 환경이 직접 돌려주는 피드백을 사용한다.

실무적으로는 세 번째가 가장 해석하기 쉽다. unit test나 SQL execution처럼 실행 가능한 verifier가 있으면 agent가 “그럴듯한 답”이 아니라 성공·실패라는 외부 신호를 받는다. 반대로 judge 기반 신호는 열린 문제에서 불가피하지만, 그 judge가 개선 loop와 final evaluation을 동시에 담당하면 agent는 실제 목표보다 judge의 latent bias를 공략할 유인을 갖는다.

이 때문에 survey는 critic을 단순 score generator가 아니라 **governed infrastructure**로 본다. update를 제안하는 agent와 update를 승인하는 evaluator를 같은 loop에 무제한으로 겹치면 자기확증 loop가 된다. evaluator를 독립시키고, evaluator가 더 엄격해지는 변화도 human audit trail과 monotone한 제약 아래 두어야 한다는 주장이다.

## 공개된 근거에서 확인되는 점

이 논문은 새로운 self-improving agent 하나의 성능을 보고하는 실험 논문이 아니라 taxonomy와 evaluation protocol을 제안하는 survey다. 따라서 headline metric을 제시하지 않는다. 대신 어떤 evidence가 있어야 “개선”이라고 부를 수 있는지를 구체화한다.

### 평균 score 하나로는 부족한 평가 항목

논문은 fixed improvement budget 뒤의 score만 보고하지 말고, 아래 항목을 같이 공개해야 한다고 제안한다.

| 평가 항목 | 왜 필요한가 |
|---|---|
| 초기 baseline과 iteration별 learning curve | 한 번의 좋은 결과와 지속적인 개선 경향을 구분 |
| held-out 또는 temporally shifted task transfer | update에 쓴 feedback·benchmark에 대한 암기를 배제 |
| 이전에 풀었던 task의 regression rate | 새 능력 때문에 기존 능력이 무너지는지 확인 |
| compute, token, tool invocation, wall-clock cost | 성능 향상이 단순 예산 확대의 결과인지 분리 |
| human intervention의 형태와 양 | “self” improvement에 외부 감독이 얼마나 들어갔는지 명시 |
| safety violation과 tail risk | 평균 성공률이 가리는 goal drift, reward hacking, 권한 위반을 추적 |

특히 held-out evaluation은 중요하다. 저자들은 private unreleased task set이나 model knowledge cutoff 이후에 새로 생성한 task를 사용해 feedback leakage를 줄일 것을 권한다. LLM judge를 쓰는 경우에도 judge의 model version, prompt, rubric, 접근 가능한 evidence, 그리고 judge 자체의 compute budget을 공개해야 한다. update signal과 final report에 같은 judge를 쓰면, 좋은 score가 capability gain이 아니라 judge 최적화일 수 있기 때문이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/self-improving-agent-evaluation-map.webp"
    alt="self-improving agent 방법과 benchmark family의 연결을 foundation model 수준과 scaffold 수준으로 나누어 표시한 행렬"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 12. 방법과 benchmark의 연결 행렬. survey는 static model evaluation과 tool·memory·environment를 포함한 interactive scaffold evaluation을 분리해 보라고 제안한다.
  </figcaption>
</figure>

### 공개 artifact는 ‘계속 갱신되는 지도’에 가깝다

논문은 project page와 `selfimproving-agent/Awesome-Self-Improving-Agents`를 함께 공개했다. 프로젝트 페이지는 조사 대상 **239편**을 foundation model improvement 73편, scaffolding improvement 166편, 15개 세부 section으로 집계한다. GitHub 저장소는 MIT LICENSE를 실제 포함하고, 조회 시점 기준 48 stars·7 forks·122 commits이며 2026년 7월 18일에도 새 논문 항목을 merge했다. tag와 GitHub Release는 아직 없다.

이 공개물의 성격은 runnable framework가 아니라 **curated literature map**이다. 따라서 논문의 분류 체계와 대표 논문 링크를 계속 따라가기에는 좋지만, survey의 모든 정성적 scorecard나 method comparison이 표준 benchmark의 실측 결과라는 뜻은 아니다. 예를 들어 memory object scorecard는 여러 시스템 설계와 failure analysis를 종합한 ordinal assessment라고 명시한다. 이를 보편적인 숫자 성능표처럼 읽어서는 안 된다.

## 실무 관점에서의 해석

이 survey가 팀에 남기는 가장 실용적인 원칙은 빠른 scaffold loop와 느린 parameter loop를 같은 변경 관리 체계로 취급하지 말라는 것이다. 환경 신호가 불완전하거나 deployment risk가 큰 상황에서는 prompt·retrieval·memory·tool wrapper처럼 되돌리기 쉬운 layer에서 먼저 탐색하고, 실행 테스트·regression test·안전성 검토를 통과한 패턴만 나중에 weight로 distill하는 편이 합리적이다.

또 하나는 memory와 tool을 기능이 아니라 **학습되는 권한 표면**으로 봐야 한다는 점이다. memory에 무엇을 쓰고 버릴지, 어떤 tool을 active pool에 넣을지, 실패한 wrapper를 언제 재사용할지는 모두 다음 행동을 바꾼다. 따라서 self-improvement loop에 memory poisoning 방어, provenance, version history, rollback, permission boundary가 없으면 adaptation 속도는 곧 persistent failure의 전파 속도가 될 수 있다.

결국 자기개선 에이전트의 질문은 “agent가 스스로 바뀌는가”가 아니다. 더 정확한 질문은 **어떤 변경이, 어떤 근거로, 어떤 budget 안에서, 어떤 independent gate를 통과해 영구 상태가 되는가**다. 이 survey는 그 질문을 parameter와 scaffold, signal과 evaluator, 평균 성능과 regression/safety라는 축으로 분해한다. 앞으로 self-evolving agent를 도입하거나 연구할 때 가장 먼저 필요한 것은 더 긴 autonomous loop가 아니라, 그 loop가 만든 변화를 검증·귀속·되돌릴 수 있는 운영 체계일 가능성이 크다.

Sources: https://arxiv.org/abs/2607.13104, https://arxiv.org/html/2607.13104v1, https://selfimproving-agent.github.io/, https://github.com/selfimproving-agent/Awesome-Self-Improving-Agents, https://api.github.com/repos/selfimproving-agent/Awesome-Self-Improving-Agents, https://api.github.com/repos/selfimproving-agent/Awesome-Self-Improving-Agents/contents/LICENSE
