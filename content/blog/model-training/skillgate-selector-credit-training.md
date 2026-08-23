---
title: "SkillGate는 에이전트의 ‘어떤 스킬을 읽을까’를 별도 학습 문제로 만든다"
date: "2026-08-23T20:14:06+09:00"
description: "SkillGate는 장기 에이전트 RL에서 스킬 이름을 고르는 극소수 토큰이 보상 신호를 거의 받지 못하는 selector credit starvation을 진단하고, 선택과 실행의 credit을 분리한 두 채널 GRPO로 이를 교정한다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - SkillGate
  - Agent Skills
  - Reinforcement Learning
  - GRPO
  - Credit Assignment
draft: false
---

에이전트 스킬 라이브러리가 커질수록 `SKILL.md`를 **어떻게 쓸지** 못지않게 **어떤 파일을 먼저 읽게 할지**가 중요해진다. 하지만 이 선택은 보통 긴 tool-use trajectory 한가운데에서 몇 개 토큰으로 끝난다. 선택 뒤에 수천 개의 실행 토큰이 이어지는 환경에서는, 최종 성공·실패만으로 RL을 돌려도 그 몇 토큰이 제대로 학습될 것이라고 기대하기 어렵다.

**SkillGate: Training In-Policy Skill Selection in Long-Horizon Agents**는 이 구조적 문제를 *selector credit starvation*으로 정의한다.[1][2] 논문의 주장은 “스킬 선택에 더 큰 보상을 주자”가 아니다. 선택이 맞았는지와 이후 실행이 성공했는지는 서로 다른 근거로 판단해야 하므로, **손실이 닿는 토큰 영역 자체를 분리해야 한다**는 것이다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/skillgate-selector-credit-teaser.png">
    <img
      src="/images/blog/skillgate-selector-credit-teaser.png"
      alt="하나의 시퀀스 수준 advantage가 스킬 identity token과 수천 개의 실행 토큰 모두에 전달되면서, 선택 토큰의 신호 비중이 희석되고 부호가 잘못될 수 있음을 보여 주는 SkillGate 공식 Figure 1"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. 올바른 스킬 선택은 trajectory 전체의 성공을 크게 좌우하지만, 기존 sequence-level advantage에서는 선택 토큰의 loss 비중과 신호 품질이 긴 실행에 묻힌다.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

논문이 다루는 것은 외부 retriever가 후보를 미리 정렬하는 문제가 아니라, 후보 slate가 이미 주어진 뒤 정책이 episode 중간에 직접 내리는 **in-policy selection**이다. 에이전트는 이름과 한 줄 설명만 보고 여러 후보 중 하나를 읽거나, 아예 읽지 않을 수 있다. 스킬 본문을 열기 전에는 어떤 절차가 들어 있는지 알 수 없고, 비슷해 보이지만 기능적으로 틀린 hard negative도 함께 놓인다.[2]

기본적인 outcome-only RL에서는 terminal reward에서 계산한 하나의 advantage가 trajectory의 생성 토큰 전반에 broadcast된다. 문제는 읽을 스킬의 path에서 identity를 결정하는 토큰이 너무 작다는 점이다. 저자들이 완료된 on-policy 학습 run의 12,800개 trajectory를 감사한 결과, 이 토큰들의 loss 점유율 중앙값은 **0.14%**였고 trajectory가 길어질수록 약 **7배** 더 희석됐다.[2][3]

더 근본적인 문제는 credit의 부호다. 스킬 선택이 맞아도 이후 코드 실행이나 tool call이 실패하면, 선택 토큰은 음의 advantage를 받을 수 있다. 논문은 올바른 선택이 그런 wrong-signed credit을 받는 비율이 약 40%라고 보고한다. 반면 prompt group을 맞춰 비교하면 oracle skill을 읽는 것은 task success를 **+11.2 percentage point** 높였다.[2] 가치가 큰 선택이 가장 약하고 때로는 반대 방향인 신호를 받는 셈이다.

## 핵심 아이디어: 선택과 실행에 다른 판정을 적용한다

SkillGate의 핵심은 하나의 GRPO update 안에서 token support를 겹치지 않는 두 채널로 나누는 것이다.[2]

| 채널 | credit 설계 |
|---|---|
| Task channel | read call 전체를 뺀 실행 토큰에 group-normalized terminal outcome을 적용해 실제 작업 수행을 학습한다. |
| Selector channel | 스킬 이름의 identity token에만 action-local selector utility를 적용해 올바른 스킬 하나를 고르게 한다. |

Task channel에서는 read tool call의 wrapper와 path를 통째로 loss에서 뺀다. 따라서 이후 실행 실패가 “그 스킬을 골랐기 때문”이라고 잘못 역전파되지 않는다. Selector channel은 정확히 하나의 skill만 읽었고 그 skill이 oracle일 때만 양의 utility를 준 뒤, 같은 prompt group의 read action들에 대해 중심화한다. oracle을 읽고 다른 후보도 더 읽거나, 잘못된 후보를 읽거나, 여러 번 읽으면 utility는 0이다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/skillgate-selector-credit-method.png">
    <img
      src="/images/blog/skillgate-selector-credit-method.png"
      alt="task channel은 실행 토큰에 outcome advantage를, selector channel은 스킬 identity token에 action-local advantage를 배치하고 두 support를 분리하는 SkillGate 공식 구조도"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2. task outcome은 실행을, slate에서 확인 가능한 선택의 정오답은 selection을 판정한다. 두 채널은 하나의 forward pass와 GRPO update 안에서 결합되지만 token support는 겹치지 않는다.[2]
  </figcaption>
</figure>

여기서 중요한 설계는 단순 masking이 아니다. 각 채널의 token weight 총량을 같은 batch 총량 `N`으로 정규화하고, credit을 받는 selector action에는 같은 총 가중치를 배분한다. 그래서 스킬 이름이 tokenizer에서 몇 조각으로 나뉘는지, 그 뒤 실행이 얼마나 길어지는지가 selection signal의 상대적 크기를 바꾸지 않는다.[2]

## 공개된 근거에서 확인되는 점

저자들은 16개 후보 slate에서 Claw-Eval, SkillsBench, SETA, SWE, Terminal-Bench 2.0 다섯 agentic benchmark를 평가했다. 학습은 같은 Qwen3.5-9B SFT initialization에서 491개 task, 100 step의 on-policy GRPO로 수행됐으며, SkillGate와 outcome-only baseline은 data·step·hyperparameter를 공유하고 gradient가 닿는 token만 다르다.[2]

| 지표 | SkillRL → SkillGate |
|---|---|
| 전체 trial success | 47.0% → **53.2%** (**+6.2pp**) |
| oracle skill을 한 번 이상 읽은 trial | 54.3% → **83.9%** (+29.6pp) |
| misleading skill을 읽은 trial | 69.6% → **21.8%** (−47.8pp) |
| clean single-oracle read | 21.4% → **75.4%** (+54.0pp) |
| 읽은 distinct skill 수 / trial | 1.88 → **1.11** (−0.77) |

성공률만 올라간 것이 아니라, 더 많이 읽어서 운 좋게 맞히는 전략이 아니라 **더 적게 읽고 더 정확히 고르는 행동**으로 바뀌었다는 점이 핵심이다. 특히 ablation에서 whole-trajectory bonus는 읽는 양을 늘리지만 misleading exposure도 함께 높였고, identity token에 처음으로 credit을 주는 action credit은 크게 개선됐지만 여러 후보를 읽는 문제를 남겼다. 정확히 하나의 oracle read만 보상하는 SkillGate utility가 이 차이를 닫는다.[2]

결과를 과장해서는 안 된다. 각 configuration은 single training run이고 불확실성은 task-level bootstrap으로 평가됐다. 반복 trial을 묶은 pass@4 차이의 95% interval은 0을 포함하므로, 논문도 모든 집계 방식에서 강한 통계적 확정을 주장하지 않는다.[2] 또한 frontier model 비교는 같은 training setup의 통제군이 아니라 capability reference다. 이 표가 말해 주는 것은 “9B가 더 큰 모델을 일반적으로 이겼다”가 아니라, **일반 능력과 안정적인 in-policy skill selection은 다른 능력 축일 수 있다**는 점이다.

## 코드와 모델 배포 표면에서 읽히는 신호

논문은 code와 final RL checkpoint를 함께 공개한다.[1] arXiv에 연결된 `DeepExperience/SkillGate`는 `SIMONLQY/SkillGate` upstream의 fork로 확인되며, canonical upstream에는 Apache-2.0 first-party code와 vendored tree의 별도 라이선스 경계가 명시돼 있다.[3][4]

공개 README는 method 구현을 `selector_clean_oracle_action_credit.py`, identity-span detection, two-channel GRPO loss로 구분하고, frozen evaluation protocol과 CPU smoke test도 안내한다.[3] 반면 end-user용 경량 package로 읽기는 어렵다. Python 3.12 기반의 세 개 환경을 분리해야 하고, slate·training data·benchmark bundle·retrieval index는 별도 Hugging Face asset pack으로 복원하며, heavy verifier image는 로컬에서 다시 build해야 한다.[3]

가중치는 Hugging Face의 `simonlqy/SkillGate-9B`에서 공개 상태로 제공된다. API metadata상 Qwen3.5-9B 기반의 Transformers text-generation checkpoint이며, 4개 `safetensors` shard와 tokenizer·chat template를 포함한다.[5] 다만 model card license는 base Qwen license를 가리키므로, 코드의 Apache-2.0과 모델 사용 조건을 같은 것으로 취급하면 안 된다.[5]

## 실무 관점에서의 해석

SkillGate의 가장 유용한 메시지는 “더 좋은 reward design”보다 **결정의 책임 범위를 먼저 분리하라**는 데 있다. terminal outcome 하나로 모든 prior action을 평가하면, 어떤 action은 결과에 크게 기여했어도 이후의 독립적인 실패 때문에 벌을 받는다. 스킬 이름, 도구 선택, permission-gated retrieval, 모델 라우팅처럼 결과가 즉시 관찰되는 discrete decision은 특히 이런 문제가 크다.

실제 agent system에 그대로 적용하려면 oracle 여부를 어떻게 얻을지가 먼저 과제다. 논문은 검증된 task-specific oracle skill과 통제된 16-way slate를 사용한다. 운영 환경의 스킬 레지스트리에는 outdated instruction, 중복, 권한 차이, 여러 스킬을 함께 써야 하는 task가 섞인다. 따라서 production에서는 human review, verifier, offline trace audit, 승인된 skill–task mapping 같은 별도의 label surface가 필요하다.

그럼에도 설계 원리는 충분히 일반적이다. 실행 결과로 판단해야 할 token과, 선택 순간에 이미 채점 가능한 token을 구분하고, 후자에는 길이와 후속 실패에 흔들리지 않는 local credit을 준다. 스킬 생태계가 커질수록 “좋은 문서를 많이 쌓는 일”과 “그 문서를 읽을 정책을 제대로 훈련하는 일”은 분리된 시스템 문제로 다뤄져야 한다. SkillGate는 그 두 번째 문제를 꽤 정교한 token-level objective로 만든 초기 연구 사례다.

## Sources

[1] https://arxiv.org/abs/2608.18852 — arXiv abstract: SkillGate
[2] https://arxiv.org/html/2608.18852 — 논문 HTML 및 실험·부록 원문
[3] https://github.com/SIMONLQY/SkillGate — SkillGate canonical upstream repository
[4] https://api.github.com/repos/DeepExperience/SkillGate — arXiv 연결 repository의 fork provenance 및 metadata
[5] https://huggingface.co/api/models/simonlqy/SkillGate-9B — 공개 checkpoint metadata와 파일 구성
