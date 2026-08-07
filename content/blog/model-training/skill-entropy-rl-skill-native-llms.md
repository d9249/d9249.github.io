---
title: "Skill Entropy는 LLM의 장기 추론을 ‘정답률’이 아니라 ‘기술 전환 난이도’로 본다"
date: "2026-08-08T00:12:00+09:00"
description: "Skill²-Bench와 Skill-Entropy RL은 긴 reasoning chain에서 모델이 앞 단계의 기술을 관성적으로 재사용하지 않고 다음 단계에 맞는 skill로 전환하는 능력을 측정하고 훈련하는 프레임워크다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Skill Entropy
  - Long-Horizon Reasoning
  - Reinforcement Learning
  - LLM Evaluation
  - Qwen
draft: false
---

긴 reasoning task가 어려운 이유를 단순히 “step 수가 많기 때문”이라고 보면 중요한 실패를 놓친다. 모델은 방금 수학식을 풀던 흐름에서 다음 step이 문서 추출이나 일정 계획을 요구해도, 직전의 사고 방식과 답변 형식을 계속 재사용하기 쉽다. 각 skill을 따로 평가하면 잘 풀던 모델도, 한 chain 안에서 **언제 다른 skill로 갈아타야 하는가**가 문제로 바뀌면 정확도가 떨어진다.

<em>Toward Skill-Native LLMs: Skill Entropy for Benchmarking and Training Long-Horizon Reasoning</em>은 이 현상을 **Skill Entropy**로 정의한다.[1] 이는 두 skill을 독립적으로 풀 때의 성능과, 한 task 안에서 앞 skill 다음에 뒤 skill을 연결했을 때의 성능 차이로 계산하는 directed quantity다. 즉 math → planning과 planning → math는 같은 두 domain을 포함해도 서로 다른 전환 난이도를 가질 수 있다.[2]

이 논문은 같은 signal을 benchmark와 post-training에 함께 쓴다. **Skill²-Bench**는 9개 domain의 558개 skill을 엮어 cross-skill long-horizon task를 만들고, **Skill-Entropy RL**은 각 step의 answer뿐 아니라 model이 예측한 skill sequence까지 reward에 반영한다. Qwen3-4B-Instruct의 Skill²-Bench score는 <strong>34.4% → 68.4%</strong>, Qwen3-1.7B는 <strong>14.6% → 40.1%</strong>로 보고됐다.[1][2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/skill-entropy-rl-skill-native-llms-overview.png">
    <img
      src="/images/blog/skill-entropy-rl-skill-native-llms-overview.png"
      alt="Skill²-Bench의 9개 domain과 cross-skill task 예시, skill entropy의 의미, 그리고 skill-entropy reward를 사용하는 RL training pipeline을 함께 보여 주는 공식 개요"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. 위쪽은 cross-skill benchmark와 entropy scale, 아래쪽은 기존 training data의 reasoning step에 skill label과 entropy reward를 붙이는 Skill-Entropy RL pipeline이다.[2]
  </figcaption>
</figure>

## 문제를 다시 정의한다: 잘 푸는가가 아니라 잘 전환하는가

기존 reasoning benchmark는 대개 math, coding, planning처럼 한 skill을 고립해 측정하거나, 복잡한 agent environment에서 많은 turn을 끝냈는지를 본다. 전자는 skill 사이 전환을 놓치고, 후자는 어느 전환이 병목이었는지 분해하기 어렵다.[2]

Skill²-Bench가 말하는 **cross-skill long-horizon task**는 여러 step이 앞선 output에 의존하면서도 서로 다른 reasoning skill을 요구하는 task다. 예를 들어 equation solving으로 값을 구한 뒤, document extraction으로 constraint를 읽고, grid traversal을 거쳐, action scheduling으로 최종 plan을 내는 sequence가 여기에 속한다.[2]

중요한 점은 task 길이나 surface topic이 같아도 전환 난이도는 같지 않다는 것이다. Skill Entropy는 reference model이 skill A와 B를 각각 풀 때의 accuracy를 baseline으로 두고, A 다음 B를 풀 때의 accuracy가 얼마나 떨어지는지 본다. 값이 높을수록 두 skill을 잇는 것이 더 어렵고, 순서가 바뀌면 값도 달라진다.[2]

| 비교 대상 | Skill Entropy가 추가하는 것 |
|---|---|
| 난이도 | question 정답률에 더해, 이전 step 뒤에 다음 skill로 갈아타는 비용을 본다. |
| skill 조합 | aggregate score 대신 A → B와 B → A를 구분하는 directed transition을 본다. |
| 실패 원인 | “긴 task를 못 풀었다”가 아니라, 직전 skill·answer modality를 재사용했는지 진단한다. |
| 훈련 신호 | 최종 answer correctness와 predicted skill chain의 정렬을 함께 보상한다. |

## Skill²-Bench: 전환 자체를 난이도로 만드는 benchmark

benchmark는 math, science, coding, logic, planning, information extraction, creative writing, context retrieval, instruction following의 9개 domain과 **558개 labeled skill**로 구성된다. verifiable domain은 question–answer pair를 이용하고, open-ended domain은 question–rubric pair와 LLM judge를 이용한다. 각 task에는 task-level entropy score가 붙고 low·medium·high 세 difficulty level로 나뉜다.[1][2]

논문은 8개 frontier model과 4개 open-source model을 평가해 entropy가 높은 task일수록 거의 단조롭게 accuracy가 낮아지는 skill-switching gap을 관찰했다. 같은 skill을 single-skill question에서 쓸 때와 cross-skill task 안에서 쓸 때의 성능 하락은 <strong>4%~13%</strong> 범위로 보고된다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/skill-entropy-rl-skill-native-llms-entropy-map.png">
    <img
      src="/images/blog/skill-entropy-rl-skill-native-llms-entropy-map.png"
      alt="9개 domain 사이의 평균 pairwise skill entropy를 보여 주는 heatmap. source domain과 target domain의 방향에 따라 전환 난이도가 달라진다"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2의 domain-level entropy map. 색이 진할수록 source domain에서 target domain으로 skill을 전환하기 어렵다는 뜻이며, 난이도는 대칭적이지 않다.[2]
  </figcaption>
</figure>

이 heatmap은 “어려운 domain은 전환도 어렵다”는 직관도 깨뜨린다. 논문에서 science는 isolated-domain accuracy가 높은 편이지만 skill entropy는 가장 높은 축에 속한다. 개별 science skill을 풀 수 있어도 다른 domain에서 science로 들어오거나 science에서 다른 skill로 나갈 때의 context switch가 쉽지 않다는 해석이다.[2]

실패 분석은 더 구체적이다. cross-skill step에서 model은 필요한 skill family로 바꾸기보다, 이전 step의 skill과 answer modality를 반복하는 경향을 보인다. 예컨대 다음 step이 theme creation을 요구해도 직전 math skill을 유지하며 짧은 numeric answer를 내는 식이다. 따라서 문제는 긴 context를 단순히 잊는 것보다 **잘못된 cognitive mode를 계속 들고 가는 관성**에 가깝다.[2]

## Skill-Entropy RL: 정답 reward에 skill-plan reward를 더한다

저자들은 entropy를 diagnosis score로만 두지 않는다. training에서는 model이 매 step에서 answer와 함께 skill label을 예측하게 만들고, reward를 두 성분으로 구성한다.

1. **answer reward**: 각 step의 intermediate conclusion과 final answer가 맞는지 본다.
2. **skill-entropy reward**: model이 예측한 skill sequence가 gold skill sequence의 entropy structure와 얼마나 맞는지 본다.

이 설계에서 model은 “정답 하나를 맞혔는가”뿐 아니라, 그 정답으로 가는 chain에서 어떤 skill transition을 인식해야 하는지도 학습한다. 예측 skill은 embedding similarity로 canonical skill bank의 가까운 항목에 mapping할 수 있어, label 문자열이 완전히 일치하지 않아도 의미적으로 유사한 plan을 보상할 수 있게 한다.[2]

| Qwen model | Skill-Entropy RL 전후 |
|---|---|
| Qwen3-4B-Instruct | <strong>34.4% → 68.4%</strong>. cross-skill score가 크게 상승했다. |
| Qwen3-1.7B | <strong>14.6% → 40.1%</strong>. 작은 scale에서도 baseline을 앞섰다. |

수치 자체만으로 일반화 능력이 완전히 해결됐다고 보기는 이르다. 평가와 training reward가 같은 entropy framework를 공유하므로, independent benchmark에 대한 검증이 특히 중요하다. 논문은 OpenR1-Math의 6K labeled subset에도 같은 pipeline을 적용했고, 여섯 external math benchmark 평균에서 GRPO보다 **+1.9 percentage point** 높았다고 보고한다. 다만 이 결과는 해당 논문의 controlled setup에서 나온 것이므로, 다른 base model·tool-use agent·production trace에서도 같은 gain이 재현되는지는 별도 검증이 필요하다.[2]

## 실무적으로 읽는 법

이 논문이 제안하는 실무적 단위는 “skill 목록”이 아니다. **transition graph**다. agent 또는 reasoning model이 어떤 domain에서 약한지보다, 어느 state에서 어떤 cognitive mode로 넘어갈 때 실패하는지를 log에서 찾아야 한다. 예를 들어 retrieval → calculation, coding → policy interpretation, planning → structured reporting transition을 별도 slice로 추적할 수 있다.

training에도 같은 구분이 유용하다. process reward model이 한 step *안에서*의 reasoning quality를 다룬다면, skill entropy는 step *사이*의 plan switching을 보상한다. 두 signal은 대체 관계가 아니라 서로 다른 failure surface를 덮는다.[2]

공개 repository는 MIT license로 code와 pipeline을 제공하고 Hugging Face의 Skill²-Bench dataset을 연결한다. 다만 Python 3.10+, CUDA 12.x, PyTorch 2.8을 권장하며, entropy calibration에는 API gateway, 여러 pipeline stage에는 vLLM·SLURM launcher가 필요하다. tag나 GitHub Release가 아직 없는 연구용 artifact이므로, 바로 install하는 end-user package보다 재현·확장을 위한 training workflow로 읽는 편이 정확하다.[3]

핵심은 간단하다. long-horizon reasoning의 병목을 “더 길게 생각하게 하자”로만 다루지 말고, **언제 skill을 전환해야 하는지 식별하고 그 전환을 채점·훈련할 수 있는가**로 바꾸자는 제안이다. Skill Entropy는 이 질문에 benchmark scale과 reward signal을 같은 언어로 제공한다.[1][2]

## Sources

[1] https://arxiv.org/abs/2608.05139 — arXiv abstract: 2608.05139
[2] https://arxiv.org/html/2608.05139 — arXiv HTML: 2608.05139
[3] https://github.com/Gen-Verse/Skill-Entropy-RL — Skill-Entropy-RL official GitHub repository
