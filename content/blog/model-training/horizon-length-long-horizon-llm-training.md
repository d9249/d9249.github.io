---
title: "긴 작업을 못 버티는 이유는 모델 크기가 아니라 horizon일 수 있다"
date: "2026-05-06T19:08:51"
description: "이 논문은 장기 상호작용 에이전트 학습의 병목을 추상적인 탐색 난이도가 아니라 horizon length 자체에서 찾고, macro action과 subgoal decomposition 같은 horizon reduction이 RL 안정성과 일반화까지 개선한다는 점을 실험적으로 보인다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Reinforcement Learning
  - Agents
  - Long-Horizon
  - Horizon Generalization
  - LLM Training
draft: false
---

요즘 에이전트 연구를 보면 병목 설명이 대체로 비슷하다. 더 좋은 프롬프트, 더 긴 컨텍스트, 더 정교한 하네스, 더 강한 베이스 모델, 더 나은 보상 설계 같은 식이다. 물론 모두 중요한 변수지만, 실제로 여러 턴의 환경 상호작용을 거치는 long-horizon 작업에서는 그보다 더 기초적인 문제가 숨어 있을 수 있다. 바로 **성공까지 필요한 행동 길이 자체**, 즉 horizon이다.

`On Training Large Language Models for Long-Horizon Tasks: An Empirical Study of Horizon Length`는 이 단순하지만 자주 뭉개졌던 질문을 정면으로 다룬다. 논문은 복잡한 실제 업무를 바로 실험하는 대신, 같은 규칙과 같은 추론 구조를 유지하면서도 성공까지 필요한 행동 수만 다르게 만든 통제된 환경을 구성한다. 그리고 그 결과, horizon 길이만 늘어나도 RL 학습은 급격히 불안정해지고 탐색과 credit assignment가 동시에 무너질 수 있음을 보여준다.

흥미로운 점은 이 논문이 단순히 “긴 작업은 어렵다”는 상식 수준의 결론에서 멈추지 않는다는 것이다. 저자들은 horizon reduction이라는 원칙을 전면에 놓고, macro action과 subgoal decomposition이 long-horizon LLM agent 학습을 얼마나 안정화하는지 실험한다. 더 나아가 짧은 horizon에서 학습한 정책이 더 긴 horizon으로 일반화되는 현상까지 포착하며 이를 **horizon generalization**이라고 부른다.

![Contribution summary](https://arxiv.org/html/2605.02572v1/figures/main.png)

## 무엇을 해결하려는가

논문이 겨냥하는 문제는 long-horizon 에이전트 학습의 실패 원인을 너무 많은 변수 속에 섞어버리는 관행이다. 기존 연구는 주로 두 방향으로 나뉘었다. 하나는 context engineering, workflow orchestration, memory management처럼 시스템 층을 개선하는 방향이고, 다른 하나는 SFT나 RL로 모델 자체를 더 잘 학습시키는 방향이다. 하지만 이런 접근은 대체로 single-turn 패러다임을 조금 확장한 수준에 머무르며, 여러 단계 상호작용이 필요한 작업에서 **왜 학습이 붕괴하는지**를 horizon 관점으로 분리해서 보지 못했다.

이 논문은 horizon을 단순한 interaction budget이 아니라 과제의 본질적 속성으로 본다. horizon이 길어질수록 각 단계 정확도가 조금만 낮아도 전체 성공 확률은 빠르게 떨어지고, 가능한 상태-행동 조합은 폭발적으로 늘어나 탐색이 훨씬 어려워진다. 동시에 보상은 더 늦게 도착하므로, 어떤 중간 행동이 성공에 기여했는지 신용을 배분하기도 훨씬 힘들어진다.

중요한 것은 이 저자들이 이 문제를 추상적으로만 말하지 않는다는 점이다. Sudoku와 Rush Hour 같은 퍼즐 환경에서, 같은 규칙·같은 추론 복잡도를 유지한 채 목표 상태까지의 거리만 다르게 설계해 horizon 효과를 최대한 분리해 본다. 즉 “문제가 더 복잡해서 어려운 것”과 “성공까지 더 오래 걸려서 어려운 것”을 실험적으로 분리하려는 시도다.

## 핵심 아이디어 / 구조 / 동작 방식

논문의 구조는 크게 세 단계로 읽힌다.

첫째, horizon을 통제된 변수로 만들기 위한 데이터셋/환경 설계다. Sudoku는 목표 상태까지 거리 `d(s0, g)`에 따라 L1~L7 레벨로 나뉘며, L1~L4는 훈련에 포함되고 L5~L7은 더 긴 미지의 horizon 일반화 평가에 사용된다. Rush Hour도 비슷하게 거리 구간별로 나뉜다. 핵심은 같은 게임 규칙 아래에서 goal distance만 달라진다는 점이다.

둘째, 긴 horizon에서 RL이 왜 실패하는지 보는 본 실험이다. 논문은 짧은 거리 레벨에서는 훈련이 상대적으로 안정적이지만, 목표 거리가 길어질수록 success rate가 심하게 흔들리고 collapse에 가까운 양상이 나타난다고 보고한다. 이 현상은 특정 모델이나 특정 옵티마이저에 국한되지 않고, 여러 설정에서 반복된다.

셋째, 이를 해결하기 위한 horizon reduction 원칙이다. 저자들이 제시하는 대표 수단은 두 가지다.

- **Macro action**: 여러 atomic action을 하나의 더 큰 행동 단위로 묶어 effective horizon을 줄인다.
- **Subgoal decomposition**: 최종 목표를 바로 맞히기보다 중간 목표를 명시해 credit assignment와 탐색을 단순화한다.

이 논문의 중요한 메시지는 horizon reduction이 단순한 엔지니어링 편법이 아니라는 데 있다. 논문 Figure 4 설명처럼, macro-action policy를 학습시킨 뒤 실행 시 다시 atomic action만 허용해 effective horizon을 인위적으로 복원하면 안정성이 다시 깨진다. 즉 성능 향상의 핵심은 “표현이 달라졌다”가 아니라 실제로 **유효 horizon이 줄었다**는 사실에 있다는 주장이다.

| 요소 | 논문에서의 역할 | 실무적으로 읽히는 의미 |
|---|---|---|
| Controlled horizon construction | 같은 규칙, 같은 추론 구조에서 행동 길이만 다르게 설계 | long-horizon 실패 원인을 다른 변수와 분리하려는 실험 장치 |
| Macro action | 여러 atomic step을 한 번에 묶어 horizon 축소 | action abstraction이 RL 안정화에 직접 기여할 수 있음 |
| Subgoal decomposition | 중간 목표를 통해 문제를 나눔 | credit assignment와 exploration 부담을 줄이는 고전적이지만 강한 수단 |
| Horizon generalization | 짧은 horizon 학습이 더 긴 horizon으로 확장됨 | curriculum이나 staged training의 이론적 근거를 강화 |

## 공개된 근거에서 확인되는 점

가장 먼저 확인되는 것은 데이터셋 구성이다. 논문 Table 1 기준 Sudoku는 목표 거리별로 L1~L7로 나뉘며, 예를 들어 L1은 `11–15`, L2는 `16–20`, L3는 `21–25`, L4는 `26–30`, L5~L7은 그보다 더 긴 구간으로 정의된다. 훈련 세트는 L1과 L2에 각각 640개씩 포함되고, 테스트는 L1~L6 각 100개, L7은 50개로 제시된다. Rush Hour도 Table 2에서 `4–6`부터 `19–21`까지 구간별 테스트 셋이 100개씩 분할된다.

이 구성은 horizon generalization 주장과 직결된다. 훈련 때 보지 못한 더 긴 거리 구간을 별도로 남겨 두었기 때문에, 모델이 단순 암기나 환경별 특수 패턴이 아니라 horizon 변화에 어느 정도 견디는지를 볼 수 있다.

![Training instability by goal distance](https://arxiv.org/html/2605.02572v1/x19.png)

Figure 2와 3의 캡션은 논문의 핵심 실험 메시지를 잘 압축한다. Figure 2는 짧은 goal distance(L1–L2)에서는 RL이 안정적이지만, 긴 goal distance(L3–L4)로 갈수록 훈련이 심하게 불안정해진다고 설명한다. Figure 3은 atomic action 대신 macro action을 썼을 때 Sudoku와 Rush Hour 모두에서 학습과 테스트 success rate가 더 안정적이고 효과적으로 올라간다고 밝힌다. 즉 긴 horizon의 병목은 환경 하나의 우연한 특성이 아니라, 서로 다른 과제에서도 반복되는 패턴으로 제시된다.

![Macro actions vs atomic actions](https://arxiv.org/html/2605.02572v1/x20.png)

또한 Figure 7은 이 현상이 Sudoku에만 갇힌 것이 아니라 WebShop, 4B 모델, GRPO 스타일 옵티마이저에서도 반복된다고 주장한다. 논문 캡션 표현대로 horizon reduction은 “collapse를 막고 final performance를 개선”하는 방향으로 일관되게 작동한다. 즉 특정 알고리즘의 미세 튜닝 요령이라기보다, long-horizon RL 전반의 구조적 원칙처럼 제시된다.

Figure 8과 9는 이 논문이 단순 안정성 논문을 넘어서는 지점이다. 짧은 goal distance 구간에서 학습한 정책이 더 긴 미관측 horizon에서도 의미 있게 작동하고, short-only → long-only로 이어지는 curriculum이 long-only 단독 학습보다 나은 결과를 보일 수 있음을 시사한다. 저자들은 이 현상을 horizon generalization이라 부르며, 단지 “짧은 작업만 잘하게 된다”가 아니라 **짧은 horizon이 긴 horizon 학습의 발판이 될 수 있다**는 메시지를 낸다.

![Horizon generalization](https://arxiv.org/html/2605.02572v1/x25.png)

추가로 구현 세부도 공개돼 있다. Table 3은 Sudoku와 Rush Hour 실험에서 learning rate `1e-6`, temperature `0.8`, top-p `1.0`, discount factor `0.995` 등을 사용했다고 밝히며, maximum response length나 rollout correction 관련 설정도 정리한다. 즉 결과를 단지 개념적 주장으로만 내놓지 않고, 재현 가능한 훈련 설정을 꽤 구체적으로 문서화했다.

## 실무 관점에서의 해석

내가 보기에 이 논문의 진짜 가치는 “더 좋은 RL 알고리즘을 하나 더 제안했다”는 데 있지 않다. 오히려 **long-horizon agent 학습을 볼 때 무엇을 먼저 의심해야 하는지 우선순위를 바꿔 놓는다**는 데 있다. 보통은 모델이 약해서, reward가 나빠서, 데이터가 부족해서 실패한다고 생각하기 쉽다. 하지만 이 논문은 그 전에 먼저 “이 작업의 effective horizon을 줄일 수 있는가?”를 물어보라고 말한다.

이 관점은 실제 에이전트 제품 설계에도 바로 이어진다. 복잡한 웹 작업, 코딩 에이전트, 멀티턴 도구 사용 환경에서 policy learning을 붙이려 할 때, 처음부터 원자적 행동 단위로 끝까지 학습시키는 것은 생각보다 훨씬 불안정할 수 있다. 반대로 action abstraction, subtask packaging, intermediate milestone 설계처럼 시스템 계층에서 horizon을 줄여 주면, RL이 갑자기 훨씬 다룰 만한 문제가 될 수 있다. 즉 이 논문은 model training과 agent systems engineering 사이를 잇는 다리 역할을 한다.

물론 한계도 분명하다. 논문 스스로 Appendix A에서 인정하듯 실험 도메인은 Sudoku, Rush Hour, WebShop처럼 비교적 통제된 환경에 치우쳐 있고, 모델 스케일과 다양성도 무한정 넓지는 않다. 또한 horizon reduction이 잘 작동한다는 사실이 곧 실제 업무에서 macro action 설계를 쉽게 할 수 있다는 뜻은 아니다. 실무에서는 어떤 행동들을 하나의 macro로 묶을지, 어디까지를 subgoal로 정의할지 자체가 도메인 지식과 제품 설계의 문제이기 때문이다.

그럼에도 이 논문은 long-horizon LLM 학습을 보는 프레임을 꽤 선명하게 바꾼다. 앞으로 더 강한 agent를 만들려면 무조건 더 큰 모델이나 더 복잡한 harness만 쌓을 것이 아니라, **행동 공간을 어떻게 추상화해 effective horizon을 줄일지**를 먼저 고민해야 한다는 신호다. 그리고 그 과정에서 얻는 이점은 단순 안정성 개선에 그치지 않고, 더 긴 작업으로의 일반화와 curriculum 설계의 실마리까지 이어질 수 있다.

Sources: https://arxiv.org/abs/2605.02572, https://arxiv.org/html/2605.02572v1