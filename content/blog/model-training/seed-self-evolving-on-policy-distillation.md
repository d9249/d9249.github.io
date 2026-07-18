---
title: "SEED는 hindsight skill을 프롬프트가 아닌 정책 안으로 증류한다"
date: "2026-07-19T04:01:57+09:00"
description: "arXiv 2607.14777의 SEED는 완료된 on-policy trajectory에서 hindsight skill을 만들고, 같은 행동을 skill 유무 두 문맥에서 재채점해 GRPO에 dense token-level distillation 신호를 더한다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - SEED
  - Agentic RL
  - On-Policy Distillation
  - GRPO
  - Long-Horizon Agents
image: "/images/blog/seed-pipeline.webp"
draft: false
---

긴 horizon의 agent를 outcome reward만으로 학습시키면 마지막 성공·실패는 알 수 있어도, 그 과정의 어느 관찰과 행동이 다음 시도에 남아야 하는지는 잘 드러나지 않는다. 특히 tool 호출·탐색·환경 피드백이 길게 이어지는 작업에서는 한 trajectory 안에 유용한 부분 행동과 치명적인 실수가 섞인다. terminal reward 하나를 모든 action token에 넓게 전파하는 방식만으로는 credit assignment가 거칠 수밖에 없다.

`SEED: Self-Evolving On-Policy Distillation for Agentic Reinforcement Learning`은 완료된 trajectory를 보고 “이번에는 무엇을 재사용하거나 피해야 했는가”를 자연어 **hindsight skill**로 압축한 뒤, 이를 deployment prompt나 외부 memory로 남기지 않고 policy parameter에 다시 증류하자는 접근이다. 핵심은 별도 고정 teacher가 아니라 **현재 policy가 actor와 trajectory analyzer를 함께 맡는다**는 점이다. policy가 바뀌면 새로 만나는 상태·실패 양상과 거기서 추출하는 supervision도 함께 바뀐다.

논문은 ALFWorld, Search-based QA, WebShop에 더해 Sokoban·EZPoints 시각 작업을 다루고, 코드·프로젝트 페이지·ALFWorld용 3B checkpoint도 함께 공개했다. 다만 2026년 7월 중순 공개된 초기 artifact다. 구현은 공개되어 있지만 repository는 tag와 GitHub Release가 없고, 배포 checkpoint도 범용 agent model이 아니라 ALFWorld용 Qwen2.5-3B-Instruct fine-tune 한 개다. 따라서 이 글은 방법의 학습 신호와 공개물의 실제 범위를 함께 본다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/seed-pipeline.webp"
    alt="SEED의 두 단계 학습 구조. hindsight skill SFT 뒤에 actor와 analyzer가 같은 정책을 공유하는 self-evolving on-policy distillation loop가 이어진다."
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 저장소의 SEED pipeline. 1단계는 완료 trajectory를 hindsight skill로 주석해 analyzer 능력을 준비하고, 2단계는 최신 policy가 rollout과 분석을 함께 수행하며 RL loss와 OPD loss를 결합한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

기존 agentic RL의 outcome reward는 “episode가 성공했는가”에는 강하지만, 긴 interaction 안에서 **어떤 선택을 강화해야 하는가**에는 약하다. skill prompt를 inference에 끼워 넣는 방법도 가능하지만, 그 경우 배포 시 context 길이·retrieval·prompt formatting이라는 운영 의존성이 늘어난다. 한 번 만든 offline skill library를 teacher로 쓰면 policy가 달라진 뒤 새로 나타나는 failure mode와도 멀어질 수 있다.

SEED의 문제 설정은 간결하다. trajectory가 끝난 뒤에는 성공한 subgoal, 결정적 observation, 잘못된 탐색과 회피 규칙을 hindsight로 읽을 수 있다. 이 hindsight를 다음 실행에 그대로 보여 주는 대신, **그 skill이 있을 때 더 타당해지는 기존 action token**을 찾아 ordinary policy가 그 행동을 더 잘 내도록 학습시킨다. 즉 skill은 inference-time capability가 아니라 training-time privileged supervision이다.

## 핵심 아이디어 / 구조 / 동작 방식

### 1단계: hindsight skill을 만드는 법을 먼저 학습한다

먼저 base model로 task를 수행해 완료 trajectory를 모은다. observation·action·reward·최종 outcome이 담긴 기록을 external analyzer가 읽고, 재사용 전략이나 failure correction을 자연어 skill로 만든다. 이 trajectory–skill pair로 SFT를 수행해, 이후의 policy가 완료된 경험을 분석하는 능력도 갖추게 한다.

논문 설정에서는 backbone별로 180개 training task에서 task당 8개 rollout, 총 1,440개 trajectory를 모아 3 epoch SFT를 수행한다. 이 초기 주석 단계에는 GLM-5.2를 external analyzer로 사용했다고 적혀 있다. 따라서 “한 policy가 스스로 모든 hindsight를 무에서 생성한다”기보다, **초기 analyst capability를 외부 analyzer로 bootstrap한 뒤 self-evolving loop로 넘기는 구성**으로 읽어야 한다.

### 2단계: 같은 policy가 actor와 analyzer를 동시에 맡는다

RL update마다 frozen current policy는 두 역할을 맡는다. actor는 ordinary interaction history로 grouped on-policy trajectory를 수집하고, analyzer는 막 끝난 trajectory를 hindsight skill로 요약한다. 다음으로 trainable policy는 각 sampled action을 두 번 평가한다.

| 분기 | 입력 문맥 | 역할 |
|---|---|---|
| Student | 원래 interaction history | deployment에서 사용할 ordinary policy 확률 |
| Teacher | 원래 history + hindsight skill | hindsight가 해당 action을 얼마나 지지하는지 측정하는 training-time 분기 |

두 분기는 **같은 sampled action token**을 re-score한다. skill-augmented 문맥에서의 log-probability가 ordinary 문맥보다 높으면, 그 차이를 sigmoid gate로 바꿔 해당 token에 더 큰 auxiliary supervision을 준다. 최종 목적함수는 environment outcome을 최적화하는 GRPO 계열 RL loss와 이 confidence-gated OPD loss의 합이다.

이 설계의 중요한 제약은 gradient가 ordinary student branch에만 흐른다는 점이다. teacher는 hindsight를 본 동일 policy의 detached 평가값일 뿐, inference 때 모델에 skill context를 붙이는 구조가 아니다. 업데이트가 끝나면 새 policy가 다음 round의 actor와 analyzer가 된다. 따라서 trajectory distribution과 그 trajectory에서 뽑는 hindsight가 같은 checkpoint를 기준으로 동기화된다.

## 공개된 근거에서 확인되는 점

### 세 long-horizon benchmark에서 보고한 결과

아래는 논문 저자가 보고한 Qwen2.5-3B-Instruct 결과다. 독립 재실행 수치가 아니다. ALFWorld는 여섯 task family의 macro-average success rate, Search-based QA는 일곱 QA subset의 macro-average accuracy, WebShop은 normalized score와 exact success rate를 보고한다.

| 방법 | ALFWorld 평균 | Search-based QA 평균 | WebShop score | WebShop success |
|---|---:|---:|---:|---:|
| GRPO | 75.0 | 36.4 | 79.8 | 63.3 |
| GRPO+OPSD | 81.2 | 44.6 | 77.8 | 66.4 |
| SDAR | 84.4 | 43.4 | 85.0 | 68.0 |
| **SEED** | **91.8** | **45.7** | **88.5** | **78.9** |

특히 ALFWorld unseen split에서 논문은 SEED 3B checkpoint가 GRPO의 70.9보다 15.3 point 높은 86.2 macro-average를 기록했다고 보고한다. sample efficiency 분석에서도 training data의 60%만 쓴 SEED가 80.7로, full-data GRPO의 75.0을 넘었다고 주장한다. 이는 terminal reward를 늘리는 것보다 같은 trajectory에서 token-level signal을 더 추출하는 쪽이 효율적일 수 있다는 근거다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/seed-results.webp"
    alt="Qwen2.5 3B·7B와 Qwen3 1.7B에서 ALFWorld, Search-based QA, WebShop을 비교한 SEED 공식 결과 표"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 저장소의 main-results 표. SEED는 세 backbone에서 ALFWorld와 WebShop의 강한 결과를 보고하지만, Search-based QA에서는 일부 baseline과 차이가 작거나 metric별 우위가 갈린다.
  </figcaption>
</figure>

성능 해석에는 두 가지 단서가 있다. 첫째, 논문은 reproduced post-training baseline에 대해 backbone·rollout budget·training schedule을 맞췄다고 밝히지만, 이 비교는 저자 실험 환경 안의 결과다. 둘째, Search-based QA에서 “모든 곳에서 압도적”이라고 읽을 수는 없다. 예를 들어 7B의 Search-based QA 평균은 SDAR 49.0, SEED 48.6이며, 1.7B에서는 GRPO+OPSD와 SEED가 모두 42.2다. SEED의 중심 주장은 범용 최고 점수 하나보다 **현재 policy의 hindsight를 dense on-policy signal로 만드는 방식**에 있다.

### 공개 code와 checkpoint의 범위

공식 GitHub repository는 2026년 7월 13일 생성됐고 7월 15~16일 paper·code 공개를 알렸다. 조회 시점 API 기준 main branch, MIT LICENSE, 98 stars·2 forks이며 tag 목록은 비어 있고 `releases/latest` endpoint는 404였다. `agent_system/`, `examples/`, `scripts/`, `tests/`, `recipe/`, `seed/`, `verl/`을 포함해 단순 pseudocode보다 넓은 training bundle이다.

다만 독립된 경량 library로 보기는 어렵다. root `pyproject.toml`의 package name은 `verl`이고 Notice는 ByteDance의 verl 및 NTU/verl-agent(GiGPO) 기반 코드를 포함한다고 밝힌다. ALFWorld·WebShop·Search-based QA는 각각 별도 environment setup을 요구하며, WebShop은 Python 3.10 이하 환경을 따로 만들도록 README가 안내한다. 재현성의 출발점으로는 유용하지만, “한 줄 설치로 논문 전체를 재현하는 framework”라는 성숙도는 아직 아니다.

Hugging Face에는 `Jinyang23/Seed-AlfWorld-3B` checkpoint가 공개되어 있다. Qwen2.5-3B-Instruct를 바탕으로 한 BF16 약 3.40B parameter model이며, 2개의 safetensors shard로 제공된다. card가 명시하듯 이 checkpoint는 ALFWorld-style text interaction용이고 다른 환경·prompt format으로의 전이를 보장하지 않는다. license도 repository의 MIT와 달리 base model을 따르는 Qwen Research License다. code license와 model license를 같은 것으로 취급하면 안 된다.

## 실무 관점에서의 해석

SEED가 제시하는 좋은 패턴은 “reflection을 memory에 쌓자”보다 더 좁고 검증 가능하다. 완료된 trajectory에서 hindsight를 만들되, 그 text를 production context에 계속 주입하지 않고 **action probability의 변화량을 학습 signal로만 사용한다.** 배포 모델은 analyzer·skill bank·retrieval module 없이 ordinary history만 받는다. inference latency와 context 비용을 늘리지 않으면서 hindsight를 parametric behavior로 남기려는 선택이다.

하지만 비용이 사라지는 것은 아니다. training 중에는 trajectory analysis와 ordinary/skill-augmented paired scoring이 추가된다. 논문도 interaction length와 multimodal context가 길어질수록 이 비용이 커진다고 인정하며, selective analysis·cached representation·batched scoring을 후속 과제로 든다. 또한 self-evolving loop는 analyzer가 policy와 함께 개선된다는 장점이 있지만, analyzer의 잘못된 해석도 policy 변화와 함께 증폭될 가능성이 있다. reward verifier, skill quality audit, held-out environment에서의 transfer·regression 점검이 필요한 이유다.

결국 SEED는 agent skill을 별도 prompt asset으로 관리하는 방식과, 모든 경험을 곧바로 weight에 넣는 방식 사이의 흥미로운 중간 지점이다. **trajectory가 끝난 뒤에만 보이는 hindsight를 현재 policy에 맞춘 dense supervision으로 바꾸고, 그 결과를 inference 의존성 없이 정책에 흡수한다.** 장기 상호작용 RL에서 sparse reward의 빈틈을 메우려는 팀이라면, 이 논문의 성능표보다도 actor·analyzer 동기화, 동일 action의 paired re-scoring, 그리고 deployment-time skill 제거라는 세 설계 결정을 분리해 검토할 가치가 있다.

Sources: https://arxiv.org/abs/2607.14777, https://arxiv.org/html/2607.14777v1, https://jinyangwu.github.io/seed/, https://github.com/jinyangwu/SEED, https://api.github.com/repos/jinyangwu/SEED, https://api.github.com/repos/jinyangwu/SEED/tags, https://api.github.com/repos/jinyangwu/SEED/releases/latest, https://huggingface.co/Jinyang23/Seed-AlfWorld-3B, https://huggingface.co/api/models/Jinyang23/Seed-AlfWorld-3B
