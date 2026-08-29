---
title: "Agent-G²는 에이전트 RL의 힌트 깊이를 하나의 값이 아니라 분포로 학습한다"
date: "2026-08-29T22:53:04+09:00"
description: "Agent-G²는 장기 에이전트 과제에서 expert trajectory의 prefix를 얼마나 남길지 Gaussian 분포로 샘플링하고, 별도 probe rollout 없이 기존 GRPO rollout 통계만으로 guidance schedule을 갱신하는 post-training 방법이다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Agentic Reinforcement Learning
  - GRPO
  - Long-Horizon Agents
  - ALFWorld
  - WebShop
draft: false
---

장기 horizon 에이전트를 강화학습으로 훈련할 때 보상 희소성은 여전히 가장 비싼 병목이다.[1]
웹 쇼핑이나 텍스트 기반 embodied task처럼 수십 개의 행동을 거쳐야 하는 환경에서는, 초기 상태에서 시작한 policy가 성공 terminal state까지 도달할 확률이 낮다.[1]
그래서 expert trajectory의 앞부분을 먼저 실행한 뒤 남은 구간을 rollout하는 hint-based RL이 쓰인다.[1]
문제는 prefix를 얼마나 길게 남길지다. 너무 짧으면 탐색은 다시 어려워지고, 너무 길면 policy가 직접 배워야 할 구간을 잃는다.[1]

`Agent-G²: Gaussian Guidance for Agentic Reinforcement Learning`은 이 깊이를 모든 task에 공통인 스칼라로 정하지 않는다.[1][2]
논문의 가설은 유효한 guidance가 한 점이 아니라 task마다 다른 중심을 가진 **폭 있는 구간**에 있다는 것이다.[1][2]
그래서 각 task의 guidance ratio를 Gaussian 분포에서 뽑고, 이미 policy optimization을 위해 수집한 rollout의 통계만으로 그 분포를 다음 batch에 맞게 갱신한다.[1][2]

이 접근은 “힌트를 더 많이 준다”는 방법이 아니다.[1][2]
일정표 기반 방법의 일괄성, probe 기반 방법의 rollout 비용 사이에서, **task별 적응성과 학습 비용을 동시에 다루는 schedule 설계**에 가깝다.[1][2]
논문은 ALFWorld와 WebShop에서 Qwen2.5-1.5B/7B-Instruct를 실험했고, Agent-G²가 강한 hint-based·hint-free·auxiliary-RL baseline보다 개선되면서 probe 방식보다 낮은 rollout 비용을 쓴다고 보고한다.[1][3]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/agent-g2-pipeline.png"
    alt="Agent-G²의 task clustering, Gaussian guidance sampling, GRPO policy update, schedule feedback loop을 보여 주는 공식 파이프라인"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 프로젝트 페이지의 Agent-G² 학습 파이프라인. task를 난이도 cluster로 나누고, 기존 rollout 통계에서 Gaussian guidance를 만든 뒤, 같은 rollout을 policy와 schedule 양쪽 갱신에 재사용한다.[3]
  </figcaption>
</figure>

## 무엇을 해결하려는가

Hint-based RL의 출발점은 단순하다.[1]
expert trajectory의 prefix를 유지하면 policy가 성공에 더 가까운 상태에서 exploration을 시작할 수 있다.[1]
그러나 기존 schedule 방식은 같은 training step의 모든 sample에 하나의 depth를 배정한다.[1][2]
task마다 성공까지 필요한 행동 수와 난이도가 다르다는 사실을 반영하지 못한다.[1][2]
반대로 binary search나 enumeration처럼 task별 최적 depth를 probe하면 적응성은 좋아지지만, 본 학습에 쓰지 않는 추가 rollout이 필요해진다.[1][2]

Agent-G²는 이 trade-off를 “최적 depth 하나를 찾는 문제”로 보지 않는다.[1][2]
저자들은 동일 task에서도 유익한 depth가 단일 값에 몰리지 않고 일정한 band를 이룬다고 관찰했다.[2]
ALFWorld 1.5B 실험의 정렬된 informativeness profile은 Gaussian fit에서 표준편차 0.22, 결정계수 R² 0.92를 보였다.[2]
즉 depth를 정확히 한 지점에 고정하는 것보다, 중심과 spread를 가진 분포로 다루는 편이 training signal의 모양에 더 잘 맞는다는 주장이다.[2]

## 핵심 아이디어 / 구조 / 동작 방식

Agent-G²의 한 batch는 다섯 단계로 읽을 수 있다.[2][3]
먼저 expert trajectory 길이를 lightweight difficulty signal로 사용해 task를 cluster로 묶는다.[2][3]
다음으로 global baseline과 cluster별 성공률·분산 통계를 결합해 task별 Gaussian `N(μ_i, σ_i²)`를 정한다.[2][3]
각 task는 이 분포에서 prefix depth 하나를 샘플링하고, 그 prefix 뒤에서 여러 rollout을 수행한다.[2][3]
policy는 sampled prefix의 supervision과 post-prefix rollout의 GRPO loss로 업데이트된다.[2][3]
마지막으로 동일 rollout의 terminal reward가 다음 batch의 global baseline과 cluster statistics를 갱신한다.[2][3]

여기서 중요한 설계는 schedule을 위한 별도 predictor나 probe trajectory를 추가하지 않는다는 점이다.[1][2]
schedule estimator가 보는 signal은 policy optimization에서 이미 생성한 rollout이다.[1][2]
Table 2 기준 Qwen2.5-1.5B/ALFWorld에서 Agent-G²의 median cost는 gradient step당 88초였다.[2]
enumeration probe는 425초, binary-search probe는 285초로 보고돼 각각 Agent-G²의 4.83배와 3.24배다.[2]
스칼라 schedule은 더 싸지만, task별 mismatch를 감수하는 기준점이다.[2]

| 방식 | task별 guidance | schedule용 추가 rollout | Qwen2.5-1.5B ALFWorld 비용/step | 해석 |
|---|---|---:|---:|---|
| 선형·cosine·step schedule | 아니오 | 없음 | 57–61초 | 싸지만 같은 depth를 여러 task에 공유 |
| Target-accuracy schedule | 제한적 | 없음 | 80초 | batch-level feedback은 쓰되 task별 sample은 아님 |
| Binary search probe | 예 | 있음 | 285초 | depth를 찾는 비용이 큼 |
| Enumeration probe | 예 | 있음 | 425초 | 더 넓게 찾지만 가장 무거움 |
| **Agent-G²** | **예, Gaussian sampling** | **없음** | **88초** | 기존 rollout으로 task별 분포를 갱신 |

## 공개된 근거에서 확인되는 점

핵심 결과는 task별 적응이 단순한 sampling noise가 아니라 method 구성요소라는 점이다.[2]
Qwen2.5-1.5B 기반 ALFWorld에서 Agent-G²는 all-task success 95.3%를 보고한다.[2]
동일 조건에서 Gaussian sampling을 평균 `μ_i`에 고정하면 89.8%, uniform sampling으로 바꾸면 88.3%, cluster grouping을 없애면 89.1%였다.[2]
`GRPO` loss를 제거하고 sampled-prefix SFT만 남긴 variant는 26.6%로 낮아진다.[2]
이 ablation은 분포 sampling, adaptive moments, grouping, RL objective가 각각 역할을 한다는 저자들의 해석을 지지한다.[2]

공식 결과 표의 1.5B 행은 ALFWorld에서 short/medium/long task success 96.8%/100.0%/94.7%, overall 95.3%를 보고하며, WebShop에서는 reward score 92.3과 final-purchase success 78.9%를 제시한다. 7B 공개 checkpoint의 model card는 ALFWorld 전체 98.4%, WebShop reward 92.3 및 final-purchase success 84.4%를 별도로 명시한다. 이 수치는 저자 측 평가 결과이며, model card도 독립 재현과 evaluation variance가 아직 제공되지 않았다고 분명히 적는다.[2][5][6]

공개 범위는 논문만으로 끝나지 않는다. 공식 project page는 code, 모델 collection, expert trajectory dataset을 함께 연결한다. Hugging Face collection에는 ALFWorld/WebShop 각각의 1.5B·7B checkpoint 네 개와 dataset 한 개가 있다. dataset은 9,408개 trajectory로 표시되며, WebShop 5,855개와 ALFWorld 3,553개로 구성된다. 따라서 “방법만 공개된 논문”보다 검토 가능한 artefact가 넓은 편이다.[3][7]

다만 repository를 production-ready framework로 읽기는 이르다. GitHub 저장소는 Apache-2.0 LICENSE를 포함하고, paper-locked 1.5B 학습 스크립트와 여러 baseline reproduction path를 제공한다. 반면 package metadata의 이름과 import 구조는 `verl`이고, NOTICE는 `verl` 및 `verl-agent` 계열의 코드 기반을 명시한다. GitHub API 조회 시 releases와 tags는 없으며, README도 base framework와 WebShop을 분리한 환경, GPU용 PyTorch·FlashAttention·vLLM 설치를 전제로 한다. 이것은 독립된 경량 라이브러리라기보다 연구 재현에 초점을 둔 upstream-derived code release에 가깝다.[4]

## 실무 관점에서의 해석

Agent-G²의 실용적 기여는 agent RL에서 curriculum을 시간에 따른 하나의 schedule로만 생각하지 않게 만든다는 데 있다. rollout cost가 큰 환경에서는 task별 최적 prefix를 계속 probe하는 것이 부담스럽고, 전역 decay는 heterogeneous task를 한 숫자로 뭉개 버린다. 기존 rollout을 재활용해 per-task distribution을 update하는 방식은 이 두 문제 사이의 괜찮은 engineering compromise다.

다만 Gaussian 가정이 모든 agent domain에 그대로 옮겨진다고 볼 근거는 아직 없다. 실험은 ALFWorld와 WebShop, Qwen2.5-1.5B/7B-Instruct, expert trajectory length 기반 clustering에 집중돼 있다. 실제 browser automation, API orchestration, 장기 coding처럼 action space와 실패 회복 구조가 다른 환경에서는 informative depth profile이 Gaussian-like인지 별도 확인이 필요하다.[1][2]

또한 배포 시에는 checkpoint의 사용 범위를 엄격히 봐야 한다. 공개 7B 모델은 general-purpose chat model이나 실제 구매 자동화 시스템이 아니라 sandboxed ALFWorld/WebShop 연구용으로 명시돼 있다. faithful evaluation에는 repository의 environment, prompt template, action parser, rollout loop를 쓰라고 안내한다. 따라서 이 release의 가치는 당장 범용 agent를 제공한다기보다, **긴 horizon에서 guidance를 어떻게 적응시킬지 검증 가능한 training recipe와 artefact 묶음을 공개했다**는 데 있다.[5][6]

Agent-G²는 agent post-training의 다음 질문을 잘 드러낸다. 희소 reward를 해결할 때 expert prefix를 쓸 것인가가 아니라, *어떤 task에 어느 정도의 도움을 언제 줄 것인가*가 핵심이다. 그 답을 더 많은 probe로 찾는 대신, 이미 지불한 rollout 비용 안에서 분포를 추정하려 한 점이 이 작업의 가장 설득력 있는 부분이다.

## Sources

[1] https://arxiv.org/abs/2608.23318 — Agent-G2 arXiv abstract
[2] https://arxiv.org/html/2608.23318v1 — Agent-G2 arXiv HTML
[3] https://zju-real.github.io/Agent-G2 — Agent-G2 project page
[4] https://github.com/ZJU-REAL/Agent-G2 — Agent-G2 GitHub repository
[5] https://huggingface.co/xiamoent/Agent-G2-alfworld-7b — Agent-G2 ALFWorld 7B model card
[6] https://huggingface.co/xiamoent/Agent-G2-webshop-7b — Agent-G2 WebShop 7B model card
[7] https://huggingface.co/datasets/xiamoent/Agent-G2-ALFWorld-Webshop-sft-data — Agent-G2 expert trajectory dataset
