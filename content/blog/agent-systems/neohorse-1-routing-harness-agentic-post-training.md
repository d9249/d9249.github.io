---
title: "NeoHorse-1은 라우팅 하네스를 ‘서빙 최적화’에서 다음 학습 분포를 만드는 관측 계층으로 확장한다"
date: "2026-09-10T16:35:22+09:00"
description: "NeoHorse-1은 라우팅·도구 실행 기록을 에이전트 post-training에 연결한 RSI 초기 프로토타입이며, 후속 NeoHorse-Jev는 같은 4B 계열을 구조화된 선택과 점수화에 활용한다."
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

반면 공개 범위는 서로 구분해 읽어야 한다. GitHub Releases의 최신 릴리스 endpoint는 404를 반환하고 tags 목록도 비어 있다.[9][10]
저장소 README는 9월 24일 NeoHorse-Jev-4B 공개를 알리고 있으며, 최근 변경에는 Jev 배포 가이드 갱신도 포함된다.[4][13]
`jev/`에는 추론 코드와 backend adapter, 배포 예시가 있으나 이는 NeoHorse-1 논문이 설명하는 post-training 전체 파이프라인을 재현하는 코드와는 다르다.[14]
따라서 공개 모델을 실행할 수 있다는 사실과 논문의 학습 레시피를 독립 재현할 수 있다는 주장은 분리해야 한다.

## 후속 공개: NeoHorse-Jev-4B

**2026년 9월 29일 업데이트.** 논문 공개 뒤 공식 저장소는 NeoHorse-1-4B를 바탕으로 한 별도 4B 구조화 의사결정 모델 NeoHorse-Jev-4B를 공개했다.[14][15]
원 논문의 열 개 benchmark 결과에 포함된 체크포인트는 아니므로, 아래 평가는 논문의 NeoHorse-1 결과와 합산하거나 같은 실험으로 해석하면 안 된다.[2][14]

Jev의 차이는 출력 인터페이스에 있다. 애플리케이션이 상태와 선택지·질문을 정하면, 모델은 자유 형식 텍스트를 autoregressive하게 이어 쓰는 대신 prefill-only 추론으로 후보 답의 결정과 확률을 반환한다.[14][15] 공식 문서는 세 가지 결정 유형을 제공한다.[14]

- **Choice:** 앱이 정의한 후보 중 하나를 고르고 각 후보의 확률을 반환한다. 요청 라우팅이나 도구·행동 선택에 쓸 수 있다.[14]
- **Noul:** 예/아니요 질문에 대해 조건이 참일 확률을 반환한다. 조건 검사나 workflow gate에 적합하다.[14]
- **Score:** 낮은 값부터 순서가 있는 rating level의 확률 분포와 기대 점수를 반환해 품질·심각도·우선순위를 수치화한다.[14]

저자 평가는 서로 다른 두 aggregate를 제시하므로, 같은 점수 축으로 합치지 않고 나눠 읽어야 한다.[14]

| 평가 집계 | 보고 결과 |
|---|---:|
| 6-group 균등 평균 | 77.70 |
| 3개 고정 subset 평균 | 83.26% |

첫 번째 77.70은 여섯 group을 모두 보고한 네 open-weight decision model 중 가장 높은 값이라고 저자들은 보고한다.[14]
하지만 각 benchmark를 모두 이긴 것은 아니다. Open-Jev-9B는 JevBench와 OpenJev text, Kev-4B는 MASSIVE, Laya는 VitaminC에서 더 높은 점수를 기록한다.[14]

두 번째 83.26%는 Nimble·VitaminC·MASSIVE의 고정 subset 평균이며, 같은 비교에서 NeoHorse-1-4B가 기록한 71.76%보다 11.50 percentage point 높다.[14][15]
77.70은 여섯 group의 비가중 평균이지 전체 예제를 합친 정확도가 아니며, subset 구성과 채점 방식도 benchmark마다 다르다.[14]
따라서 이는 저자들이 제시한 비교 결과이지 독립 재현이나 하나의 통합 leaderboard로 읽을 숫자는 아니다.

모델 카드는 텍스트와 이미지 한 장을 함께 넣는 입력도 지원한다고 명시하고, image-NLI 8,000개 예제에서 60.65%를 보고한다.[15]
그러나 해당 표에는 비교 모델의 결과가 없어, 이 수치는 이미지 입력 성능을 측정한 단일 모델 결과이지 상대적 우위를 보여주는 근거는 아니다.[15]

운영 신호도 함께 보수적으로 볼 필요가 있다. 저장소에는 NeoHorse-1-9B의 tool call이 특정 Windows 10·OpenAI Chat Completions 연동 환경에서 실패했다는 공개 이슈가 올라와 있다.[16] 이 한 건만으로 checkpoint 자체의 결함이나 일반적인 실패율을 단정할 수는 없지만, 배포 전에는 실제 serving backend·tool schema·client 조합에서 function-call 경로를 별도로 검증해야 한다.

## 실무 관점에서의 해석

NeoHorse-1의 가장 실용적인 기여는 RSI라는 큰 이름보다 **라우팅 로그를 training-data control plane으로 바꾼 것**에 있다. 대다수 팀도 이미 route, tool trace, retry, verifier result, artifact path를 남긴다. 그 상태에서 바로 다음 모델을 fine-tune하기보다, 먼저 prediction·실제 action·verified outcome을 분리하고 evaluation set과 training set의 경계를 강제해야 한다. 그래야 routing policy의 편향이나 availability failure를 ‘모델 난이도’로 잘못 학습시키지 않는다.

다음 단계는 아직 열려 있다. 논문도 넓은 harness task 범위와 successive iteration에서 개선이 누적되는지 검증하지 않았으며, 현재 실험은 evaluation–selection–update loop의 single pass다.[2] 그러므로 NeoHorse-1은 자율적으로 폭주하는 자기개선 시스템의 증거가 아니라, **운영 telemetry를 human-reviewable한 데이터 배분과 post-training으로 이어 붙일 수 있다는 공개된 출발점**으로 보는 것이 정확하다.

## Sources

[1] https://arxiv.org/abs/2609.08183
[2] https://arxiv.org/html/2609.08183
[3] https://github.com/TokenRhythm/NeoHorse
[4] https://raw.githubusercontent.com/TokenRhythm/NeoHorse/main/README.md
[5] https://huggingface.co/collections/TokenRhythm/neohorse-1
[6] https://huggingface.co/TokenRhythm/NeoHorse-1-4B
[7] https://huggingface.co/TokenRhythm/NeoHorse-1-9B
[8] https://api.github.com/repos/TokenRhythm/NeoHorse
[9] https://api.github.com/repos/TokenRhythm/NeoHorse/tags
[10] https://api.github.com/repos/TokenRhythm/NeoHorse/releases/latest
[11] https://api.github.com/repos/TokenRhythm/NeoHorse/contents
[12] https://api.github.com/repos/TokenRhythm/NeoHorse/license
[13] https://api.github.com/repos/TokenRhythm/NeoHorse/commits?per_page=5
[14] https://raw.githubusercontent.com/TokenRhythm/NeoHorse/main/jev/README.md
[15] https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B
[16] https://github.com/TokenRhythm/NeoHorse/issues/3
