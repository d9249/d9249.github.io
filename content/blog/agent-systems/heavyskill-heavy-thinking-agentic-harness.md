---
title: "HeavySkill은 에이전트 하네스의 복잡함을 병렬 추론과 요약이라는 내부 스킬로 환원한다"
date: "2026-05-06T18:48:35"
description: "HeavySkill은 멀티에이전트 오케스트레이션의 성능 원천을 외부 시스템 복잡도보다 모델 내부의 heavy thinking 스킬로 재해석하며, 이를 병렬 추론과 순차적 숙의로 분해해 test-time scaling과 RLVR의 결합 지점을 제시한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - HeavySkill
  - Agents
  - Test-Time Scaling
  - Reasoning
  - RLVR
draft: false
---

최근 에이전트 시스템 담론에서 자주 보이는 장면은 비슷하다. 오케스트레이터가 작업을 쪼개고, 여러 서브에이전트가 병렬로 움직이며, 스킬과 메모리, 도구 호출이 얽힌 복잡한 하네스가 고난도 문제를 푼다. 그런데 이런 시스템이 정말로 강한 이유가 무엇인지는 의외로 명확하지 않다. 성능 향상의 원인이 더 많은 도구인지, 더 정교한 orchestration인지, 혹은 결국 더 많은 사고 경로를 탐색했다는 사실 자체인지 분리해서 설명하기가 어렵기 때문이다.

`HeavySkill: Heavy Thinking as the Inner Skill in Agentic Harness`는 바로 이 지점을 정면으로 건드린다. 이 논문은 에이전트 하네스를 구성하는 복잡한 외형을 한 겹 벗겨내고, 그 아래서 실제로 작동하는 핵심 메커니즘을 **parallel reasoning → summarization**의 2단계로 본다. 즉 복잡한 agentic harness는 본질적으로 “여러 추론 경로를 병렬로 만들고, 그것을 다시 숙의해 최종 답으로 압축하는 과정”이라는 해석이다.

이 관점이 흥미로운 이유는 단순한 개념 정리로 끝나지 않기 때문이다. 저자들은 HeavySkill을 training-free workflow, readable skill file, 그리고 RLVR로 확장 가능한 learnable reasoning skill이라는 세 층위에서 다룬다. 다시 말해 이 작업은 에이전트 시스템을 더 화려하게 쌓는 논문이라기보다, **하네스의 핵심 성능 원천을 모델 내부화 가능한 reasoning protocol로 다시 정의하는 논문**에 가깝다.

![HeavySkill overview](https://arxiv.org/html/2605.02396v1/x1.png)

## 무엇을 해결하려는가

HeavySkill이 겨냥하는 문제는 agentic harness의 성능을 설명하고 재사용하는 방식이 지나치게 시스템 의존적이라는 점이다. Claude Code, OpenClaw, Hermes, 각종 multi-agent harness는 겉으로 보면 서로 다른 설계처럼 보이지만, 실제로는 비슷한 패턴을 공유한다. 작업을 여러 관점으로 병렬 분해하고, 그 결과를 다시 더 강한 reasoning 단계에서 통합하는 식이다.

문제는 이 패턴이 지금까지는 주로 orchestration layer의 복잡함으로 표현됐다는 데 있다. 어떤 프레임워크는 subagent spawning을 강조하고, 어떤 프레임워크는 skill loading이나 memory cache를 강조한다. 하지만 이렇게 시스템별 표면 구조에 집중하면, 성능의 진짜 원천이 “여러 독립 추론 경로를 확보한 뒤 그것을 재심사하는 과정”인지, 아니면 특정 프레임워크의 구현 세부인지 분간하기 어려워진다.

HeavySkill은 여기서 질문을 바꾼다. “좋은 에이전트 하네스란 무엇인가”가 아니라, **그 하네스가 내부적으로 어떤 사고 프로토콜을 실행하고 있는가**를 묻는다. 그 대답이 바로 heavy thinking이다. 논문은 이를 병렬 추론(parallel reasoning)과 순차적 숙의(sequential deliberation)로 분해하고, 이것이 agentic harness 아래에서 작동하는 최소 실행 단위이자 모델이 학습할 수 있는 inner skill이라고 본다.

이 문제 설정은 test-time scaling 논의와도 맞닿아 있다. 지금까지 다수의 reasoning 연구는 더 긴 사고, 더 많은 샘플, 더 다양한 trajectories를 쓰면 성능이 올라간다고 보여줬지만, 그것이 실제 agent system의 구조와 어떻게 이어지는지는 상대적으로 덜 설명됐다. HeavySkill은 바로 그 틈을 메운다.

## 핵심 아이디어 / 구조 / 동작 방식

HeavySkill의 기본 workflow는 꽤 단순하다. 먼저 질의 하나에 대해 **K개의 독립 reasoning trajectory**를 병렬로 생성한다. 그 다음 이 여러 경로를 메모리 캐시 형태로 정리한 뒤, 별도의 숙의 단계에서 다시 읽고 비교해 최종 답을 만든다. 핵심은 이 두 번째 단계가 단순 majority voting이 아니라는 점이다. 논문과 부록 설명에 따르면 숙의 모델은 각 trajectory의 논리를 비판적으로 읽고, 잘못된 경로를 버리며, 필요하면 새로운 경로를 재구성해 최종 답을 낼 수 있다.

이 흐름은 세부적으로 다음 요소로 구성된다.

- **Parallel Reasoning**: 동일한 문제를 여러 독립 trajectory로 푼다.
- **Serialized Memory Cache**: 생성된 reasoning 경로를 이후 단계가 읽을 수 있는 형태로 저장·정리한다.
- **Sequential Deliberation**: 여러 경로를 비교·비판·요약해 최종 답을 만든다.
- **Iterative Deliberation**: 필요하면 숙의 결과를 다시 캐시에 넣고 반복적으로 refinement한다.
- **Readable Skill**: 위 프로토콜을 코드가 아니라 agentic harness가 직접 읽을 수 있는 skill 문서로도 표현한다.

논문이 특히 강조하는 부분은 readable skill이다. 2.4절과 Appendix C는 HeavySkill을 단순 Python pipeline이 아니라, 오케스트레이터가 context에 로드해 실행할 수 있는 문서형 skill로 정리한다. activation condition, 병렬 reasoning protocol, deliberation prompt, output format 같은 구조가 들어가며, 이 점 때문에 HeavySkill은 "새 알고리즘"인 동시에 "에이전트가 불러 쓸 수 있는 실행 스펙"이 된다.

![HeavySkill prompt / skill framing](https://arxiv.org/html/2605.02396v1/x8.png)

GitHub 저장소도 이 이중 구조를 그대로 반영한다. README 기준 프로젝트는 두 모드로 나뉜다.

| 모드 | 공개 자료에서 확인되는 구성 | 용도 |
|---|---|---|
| Workflow | `workflow/`, `scripts/run_heavyskill.py`, async pipeline | 배치 평가, 실험, 커스텀 배포 |
| Skill | `skill/heavyskill.md` | Claude Code류 agentic harness에 로드하는 readable skill |
| Memory / Deliberation | `memory_cache.py`, `sequential_deliberation.py` | trajectory 저장, 비교, 요약 |
| Iteration | `--iterations`, iterative deliberation | 반복적 재숙의 |
| Model split | `--model`과 `--summary_model` 분리 가능 | 생성 모델과 숙의 모델 분업 |

이 설계는 실무적으로 꽤 중요하다. HeavySkill은 어떤 특정 foundation model 구조를 바꾸지 않는다. 대신 **추론 경로를 더 많이 확보하고, 그 경로들을 더 잘 평가하는 inference-time protocol**을 제안한다. 그래서 OpenAI-compatible API면 비교적 넓게 붙일 수 있고, 로컬 vLLM이든 외부 API든 같은 구조를 적용할 수 있다고 설명한다.

## 공개된 근거에서 확인되는 점

가장 중요한 정량 메시지는 HeavySkill이 단순 Best-of-N이나 voting보다 일관되게 낫다는 것이다. 논문 Table 1은 STEM 계열 벤치마크에서 `Heavy Mean@4(HM@4)`와 `Heavy Pass@4(HP@4)`를 기존 `Mean@K`, `Pass@K`, `Vote@K`와 비교한다. 예를 들어 **R1-Distill-Qwen3-8B**는 AIME25에서 `M@8 76.7`, `P@8 90.0`, `V@8 83.3`에 비해 `HM@4 85.8`, `HP@4 90.0`을 기록한다. 단순 다수결보다 숙의 기반 요약이 더 강하다는 뜻이다.

일반 reasoning 태스크에서도 비슷한 메시지가 나온다. Table 2를 보면 **Qwen3-8B**는 LiveCodeBench에서 `M@K 55.5`에 비해 `HM@4 56.8`, `P@K 67.4`에 비해 `HP@4 63.8`을 기록하고, **GLM 4.6**은 `M@K 81.0`에서 `HM@4 81.3`, `P@K 90.3`에서 `HP@4 87.9`를 보인다. 모든 경우가 Pass@K를 넘는 것은 아니지만, 단순 mean보다 heavy thinking 기반 숙의가 더 안정적으로 상향되는 패턴이 보인다.

또 하나 흥미로운 부분은 tool-interleaved reasoning 시나리오다. Table 3에서 **GPT-OSS-20B**는 AIME25에서 `M@K 69.8`, `P@K 95.0`, `V@4 83.3`, `HM@4 90.0`을 기록한다. 즉 도구가 끼는 환경에서도 heavy mode가 여전히 유효하다는 의미다. 논문 4.4절은 이를 agentic tool use 적응 가능성으로 다룬다.

시각 자료도 논문의 핵심 주장을 뒷받침한다. Figure 2는 parallel reasoning의 pass rate가 높을수록 heavy thinking의 최종 pass rate가 더 좋아지는 분포를 보여주고, Figure 3은 summarization 단계에서 어떤 모델을 쓰는지가 최종 성능에 크게 영향을 준다는 점을 보여준다. 즉 HeavySkill의 성능은 단순히 K를 늘리는 문제만이 아니라, **좋은 trajectory 생성과 강한 deliberation 모델의 조합** 문제이기도 하다.

![HeavySkill pass-rate distribution](https://arxiv.org/html/2605.02396v1/x2.png)

![HeavySkill deliberation-model comparison](https://arxiv.org/html/2605.02396v1/x3.png)

GitHub 공개 범위도 해석 포인트가 있다. 저장소는 2026-05-02 생성, stars 13, forks 1 수준으로 아직 매우 초기다. README는 Apache-2.0 라이선스를 명시하고 있고, `workflow/`, `skill/`, `scripts/`, `paper/`를 포함하지만 GitHub API 기준 **`/releases/latest`는 404**, **tags는 비어 있음** 상태다. 즉 코드와 스킬 문서는 빠르게 공개됐지만, 전통적인 릴리스 관리나 안정 버전 시그널은 아직 약하다.

## 실무 관점에서의 해석

내가 보기에 HeavySkill의 진짜 가치는 “멀티에이전트 시스템을 더 쉽게 만드는 툴”이라기보다, **에이전트 시스템의 성능 원천을 더 작은 추론 프로토콜로 환원했다**는 데 있다. 지금 많은 agent stack은 orchestration 자체가 복잡해질수록 더 똑똑해진다고 느끼기 쉽다. 하지만 HeavySkill은 그 복잡함의 밑바닥에 사실상 병렬 추론과 숙의라는 고전적인 구조가 놓여 있다고 본다.

이 해석은 꽤 실용적이다. 첫째, agent framework가 달라도 핵심 reasoning pattern이 비슷하다면, 성능 개선 포인트를 프레임워크별 구현보다 protocol 수준에서 잡을 수 있다. 둘째, 이 protocol이 readable skill 문서로 표현될 수 있다면, 하네스 코드를 크게 바꾸지 않고도 더 강한 사고 방식을 로드하는 식의 운영이 가능해진다. 셋째, 논문이 Appendix B와 Figure 6에서 보여주듯 이 heavy thinking 자체를 RLVR로 더 넓고 깊게 학습시킬 수 있다면, 미래에는 “좋은 오케스트레이터”가 단순 프롬프트 엔지니어링 결과물이 아니라 학습된 inner skill 묶음이 될 가능성이 커진다.

다만 한계도 분명하다. 우선 이 논문이 다루는 heavy thinking은 계산 비용을 줄이는 방법이 아니라, **계산을 더 잘 쓰는 방법**이다. K개의 trajectory를 만들고 이를 다시 숙의하는 만큼 토큰 비용과 latency는 기본적으로 증가한다. 또한 Table 2가 보여주듯 모든 태스크에서 heavy mode가 Pass@K를 항상 넘는 것은 아니며, subjective alignment나 일반 대화형 문제에서는 숙의 단계의 품질이 훨씬 중요해질 수 있다.

또 하나 중요한 점은 HeavySkill이 orchestration layer를 완전히 대체한다기보다, 그 아래에 있는 핵심 reasoning loop를 추출한다는 데 있다. 실제 서비스 환경에서는 여전히 tool sandbox, memory policy, retry logic, permission boundary 같은 시스템 요소가 필요하다. HeavySkill은 그 위에 얹히는 “사고 프로토콜”에 가깝다. 그래서 이 작업을 agent platform 그 자체로 보기보다는, **에이전트 플랫폼들이 공통적으로 내장해야 할 reasoning primitive를 정의한 연구**로 읽는 편이 더 정확하다.

결국 HeavySkill은 에이전트 시스템 연구가 다음에 어디로 갈지 꽤 선명하게 보여준다. 앞으로의 차별점은 더 많은 스레드, 더 많은 subagent, 더 복잡한 하네스를 쌓는 데만 있지 않을 수 있다. 오히려 핵심은 그 하네스가 내부적으로 어떤 사고 스킬을 실행하고 있으며, 그 스킬이 문서로도 읽히고 RL로도 강화될 수 있는가에 있을 가능성이 크다. 그런 의미에서 HeavySkill은 orchestration을 설명하는 논문이 아니라, **orchestration 뒤에 숨어 있던 thinking skill을 전면으로 끌어낸 논문**이다.

Sources: https://arxiv.org/abs/2605.02396, https://arxiv.org/html/2605.02396v1, https://github.com/wjn1996/HeavySkill, https://raw.githubusercontent.com/wjn1996/HeavySkill/main/README.md