---
title: "NeoHorse-1은 라우팅 하네스를 ‘서빙 최적화’에서 다음 학습 분포를 만드는 관측 계층으로 확장한다"
date: "2026-09-10T16:35:22+09:00"
description: "NeoHorse-1은 에이전트 실행 중 남는 라우팅·도구·결과 기록을 커리큘럼과 온폴리시 증류, 다음 데이터 배분에 연결해 4B·9B 오픈 가중치 모델을 post-training한 초기 RSI 프로토타입이다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - NeoHorse-1
  - Agentic Post-Training
  - Agent Harness
  - LLM Routing
  - Recursive Self-Improvement
draft: false
---

LLM routing은 보통 요청을 더 싼 모델과 더 강한 모델 사이에 배분하는 서빙 최적화로 설명된다.
NeoHorse-1은 routing harness가 선택 결과뿐 아니라 capability demand, 실제 service tier, 도구 실행과 결과를 함께 기록한다고 본다.[1][2]
이 기록을 다음 모델 학습의 입력으로 되돌리면, 라우터는 inference-time 제어기가 아니라 **모델이 무엇을 더 배워야 하는지 관측하는 계층**이 된다.[1][2]

<em>NeoHorse-1: Towards Recursive Self-Improvement via Agentic Post-Training with Routing Harness</em>는 이 가설을 4B와 9B 텍스트 모델로 구현한 기술 보고서다.[1][2]
Qwen3.5-4B·9B를 바탕으로 tool use, coding, instruction following, text-based agent harness를 겨냥해 post-training했고, 저자들은 이를 RSI의 완성된 증명이라기보다 evaluation–selection–update loop의 초기 프로토타입으로 규정한다.[1][2]

## 무엇을 해결하려는가

에이전트용 post-training 데이터는 정적인 instruction–response 쌍만으로 설명하기 어렵다.[2]
실제 실행에는 사용자 요청, reasoning, tool call, observation, recovery, 최종 산출물이 얽히고, 같은 결과라도 어떤 harness context 안에서 나왔는지가 중요하다.[2]
NeoHorse-1은 이 trajectory를 user turn 단위로 직렬화하되, 현재 turn의 reasoning·tool call·응답을 supervision 대상으로 두고 이전 turn의 visible response와 tool interaction은 context로 보존한다.[2]

여기서 핵심은 ‘어떤 모델이 실제로 처리했는가’를 난이도 라벨로 쓰지 않는 점이다.[2]
실제 route는 사용자 override, 서비스 가용성, 정책의 영향을 받는다.[2]
대신 저자들은 요청·최근 대화·실행 상태에서 추정한 capability demand를 C0~C3 네 service tier로 기록하고, raw prediction·policy-adjusted decision·실제 served tier를 분리해 남긴다.[2]

## 핵심 아이디어 / 구조 / 동작 방식

NeoHorse-1의 loop는 데이터 선별, 학습 순서, 다음 데이터 배분의 세 층으로 읽는 편이 정확하다.[2]

1. **하네스 기록을 학습 가능한 사례로 만든다.** trajectory는 구조 검증, 중복 제거·평가 오염 제거, 여섯 차원의 semantic evaluation, subscene 수준 Scene/Goal/Outcome 라벨링을 거친다. 검증 가능한 구조 오류와 의미·결과 품질을 분리해, 단순히 ‘끝까지 실행된 대화’를 전부 정답 supervision으로 쓰지 않으려는 설계다.[1][2]
2. **라우팅 신호로 학습 순서를 정한다.** SFT는 capability-demand score가 낮은 사례에서 높은 사례로 넘어가는 세 단계 curriculum을 쓴다. 각 단계는 대략 전체 사례의 3분의 1이며, 낮은 score 일부도 후반에 남겨 고난도 사례만으로 학습 말미가 편향되지 않게 한다.[2]
3. **평가 결과로 다음 mixture를 다시 배분한다.** 분리된 평가 suite에서 나온 deficiency profile이 약한 region의 trajectory 비중을 높이고, 새 checkpoint가 다시 harness에서 실행되면 다음 round의 trajectory와 outcome이 쌓인다. 같은 routing progression은 student가 만든 prefix에 teacher가 token-level supervision을 제공하는 routing-guided on-policy distillation에도 적용된다.[2]

즉 ‘self-improvement’의 단위는 모델이 즉시 자신의 weight를 고치는 장면이 아니다. 서빙 중 축적된 **prediction → action → outcome** 기록을 데이터 선택, curriculum, post-training으로 연결하고 다시 서빙에 돌려보내는 운영 loop다.[2] 이 구분은 품질 개선을 주장할 때 data provenance와 evaluation 분리를 함께 요구한다는 점에서 중요하다.[2]

## 공개된 근거에서 확인되는 점

저자들의 main table은 10개 benchmark 열에서 4B·9B 각각의 base model과 post-trained model을 비교한다.[2]
4B macro average는 58.94에서 64.87로, 9B는 65.60에서 69.04로 상승했다.[2]
절대 차이는 각각 5.93점과 3.44점이다.[2]
4B는 HumanEval 87.20→96.95, PinchBench 71.19→77.33, WorkBuddyBench 24.62→34.41처럼 execution·coding 성격의 일부 표면에서 눈에 띄는 차이를 보였지만, 모든 개별 benchmark에서 최고 점수를 기록한 것은 아니다.[2]

| 동일 scale 비교 | Base macro average | NeoHorse-1 macro average | 절대 변화 | 읽는 방법 |
|---|---:|---:|---:|---|
| 4B | 58.94 | 64.87 | +5.93 | Qwen3.5-4B 대비 저자 보고 결과 |
| 9B | 65.60 | 69.04 | +3.44 | Qwen3.5-9B 대비 저자 보고 결과 |

<figure style="margin: 1.8rem 0;">
  <a href="https://huggingface.co/TokenRhythm/NeoHorse-1-4B/resolve/main/4B_head_fig.jpg">
    <img src="/images/blog/neohorse-1-4b-benchmark.jpg" alt="NeoHorse-1-4B와 다섯 3B~4B급 오픈 가중치 모델을 에이전트·코딩·지시 이행 10개 벤치마크에서 비교한 공식 모델 카드 그래프" style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;" />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">공식 4B 모델 카드의 benchmark 요약. 평균은 10개 benchmark의 비가중 평균이며, 개별 benchmark의 harness·budget·일부 외부 보고 결과 여부는 기술 보고서의 조건을 함께 확인해야 한다.[2][6]</figcaption>
</figure>

이 수치는 독립 leaderboard가 아니라 저자들이 정한 harness, tool interface, context limit, interaction budget 아래의 보고 결과다.[2]
QwenClawBench·WorkBuddyBench·τ²-Bench는 세 independent run의 산술평균이지만, PinchBench와 VitaBench는 single run이며, 일부 baseline 값에는 공식 보고서에서 인용한 결과가 섞여 있다.[2]
따라서 이 글에서 읽을 수 있는 것은 “동일 연구 protocol 안에서 agentic post-training이 base 대비 넓은 개선을 보였다”는 정도이지, 범용 agent 성능의 확정 순위는 아니다.

제어 실험도 routing-harness data의 품질 주장을 뒷받침하려 한다.[2] 동일 Qwen3.5-4B 시작점과 curriculum·optimizer·seed·평가 protocol에서 Toucan public tool-agent data와 비교했을 때, 저자들은 다섯 benchmark 평균이 64.32에서 70.57로 6.26점 상승했다고 보고한다.[2] 다만 이 역시 공개 데이터와 내부 harness trajectory의 내용·수집 분포가 함께 달라지는 비교이므로, routing signal 하나의 순수 인과효과로 해석해서는 안 된다.[2]

## 공개 범위와 실무 적용의 경계

이 프로젝트는 논문만 있는 사례는 아니다. GitHub repository는 2026년 9월 4일 생성됐다.[8]
Repository는 Apache-2.0 LICENSE, deployment README, `examples/` 및 technical report PDF를 공개한다.[3][11][12]
Hugging Face collection은 4B·9B BF16 가중치를 함께 배포하며, 두 model card는 text-only inference용 패키지이고 vision weights는 포함하지 않는다고 밝힌다.[5][6][7]
README는 SGLang 0.5.17과 vLLM 예시를 통해 262,144-token context 설정, Qwen3 reasoning parser, tool-call parser를 안내한다.[4]

반면 release maturity는 조심스럽게 읽어야 한다. 확인 시점에 repository에는 GitHub Release가 없고 tags endpoint도 비어 있으며, 최근 커밋은 평가 표와 모델 카드 결과의 동기화 성격이다.[9][10][13] 즉 공개 가중치와 serving recipe는 있으나, versioned SDK나 재현 가능한 end-to-end training pipeline이 갖춰진 일반-purpose framework로 보기는 이르다. 실무 팀은 우선 self-hosted text agent의 base checkpoint 후보로 평가하되, 자신의 tool schema·router policy·task 분포에서 별도 harness evaluation과 safety gate를 붙이는 편이 맞다.

## 실무 관점에서의 해석

NeoHorse-1의 가장 실용적인 기여는 RSI라는 큰 이름보다 **라우팅 로그를 training-data control plane으로 바꾼 것**에 있다. 대다수 팀도 이미 route, tool trace, retry, verifier result, artifact path를 남긴다. 그 상태에서 바로 다음 모델을 fine-tune하기보다, 먼저 prediction·실제 action·verified outcome을 분리하고 evaluation set과 training set의 경계를 강제해야 한다. 그래야 routing policy의 편향이나 availability failure를 ‘모델 난이도’로 잘못 학습시키지 않는다.

다음 단계는 아직 열려 있다. 논문도 넓은 harness task 범위와 successive iteration에서 개선이 누적되는지 검증하지 않았으며, 현재 실험은 evaluation–selection–update loop의 single pass다.[2] 그러므로 NeoHorse-1은 자율적으로 폭주하는 자기개선 시스템의 증거가 아니라, **운영 telemetry를 human-reviewable한 데이터 배분과 post-training으로 이어 붙일 수 있다는 공개된 출발점**으로 보는 것이 정확하다.

## Sources

[1] https://arxiv.org/abs/2609.08183 — arXiv abstract
[2] https://arxiv.org/html/2609.08183 — arXiv HTML
[3] https://github.com/TokenRhythm/NeoHorse — NeoHorse official repository
[4] https://raw.githubusercontent.com/TokenRhythm/NeoHorse/main/README.md — NeoHorse README
[5] https://huggingface.co/collections/TokenRhythm/neohorse-1 — NeoHorse Hugging Face collection
[6] https://huggingface.co/TokenRhythm/NeoHorse-1-4B — NeoHorse-1-4B model card
[7] https://huggingface.co/TokenRhythm/NeoHorse-1-9B — NeoHorse-1-9B model card
[8] https://api.github.com/repos/TokenRhythm/NeoHorse — NeoHorse GitHub metadata
[9] https://api.github.com/repos/TokenRhythm/NeoHorse/tags — NeoHorse GitHub tags
[10] https://api.github.com/repos/TokenRhythm/NeoHorse/releases/latest — NeoHorse GitHub latest release
[11] https://api.github.com/repos/TokenRhythm/NeoHorse/contents — NeoHorse repository file list
[12] https://api.github.com/repos/TokenRhythm/NeoHorse/license — NeoHorse repository license
[13] https://api.github.com/repos/TokenRhythm/NeoHorse/commits?per_page=5 — NeoHorse recent commits
