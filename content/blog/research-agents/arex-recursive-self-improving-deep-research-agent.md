---
title: "AREX는 검증을 끝단 필터가 아니라 다음 조사 라운드의 제어 신호로 쓴다"
date: "2026-07-25T21:09:47+09:00"
description: "BAAI의 AREX는 provisional answer를 제약별로 감사해 accept·refine·restart를 고르고, 검증된 근거와 미해결 조건만 남기는 autonomous context update로 긴 deep research를 재귀적으로 개선하는 4B·122B-A10B 모델군이다."
author: "Sangmin Lee"
category: "research-agents"
tags:
  - AREX
  - Deep Research
  - Recursive Self-Improvement
  - Agentic RL
  - Long-Horizon Agents
image: "/images/blog/arex-framework.webp"
draft: false
---

deep research agent의 어려움은 검색을 한 번 더 하는 데만 있지 않다. 여러 출처에 흩어진 조건을 동시에 만족하는 후보를 찾아야 하고, 이미 찾은 근거 가운데 무엇이 검증됐는지와 무엇이 아직 비어 있는지를 놓치지 않아야 한다. 이 상태 관리가 실패하면 agent는 이미 배제한 후보를 다시 탐색하고, 일부만 맞는 답을 너무 일찍 확정하며, 긴 history에서 중요한 출처를 잃는다.

`AREX: Towards a Recursively Self-Improving Agent for Deep Research`는 이 문제를 **발견(discovery)보다 검증(verification)이 더 잘게 나눌 수 있다**는 비대칭으로 풀려 한다. 후보 답을 찾는 일은 넓은 탐색 공간을 지나야 하지만, 만들어진 답이 각 제약을 만족하는지 확인하는 일은 제약별 검사로 분해할 수 있다는 관찰이다. BAAI는 이 검증 결과를 최종 채점용 filter로만 쓰지 않고, 다음 조사 라운드가 무엇을 찾아야 하는지를 정하는 상태 전이로 쓴다.

공개물은 논문뿐이 아니다. 2026년 7월 23일 공개된 두 Hugging Face checkpoint인 **AREX-Turbo**(Qwen3.5-4B 기반 dense)와 **AREX-Base**(Qwen3.5-122B-A10B 기반 MoE), 프로젝트 페이지, live research application을 함께 제공한다. 이 글은 benchmark 수치와 함께 실제 공개 범위가 어디까지인지도 분리해서 본다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/arex-framework.webp">
    <img
      src="/images/blog/arex-framework.webp"
      alt="AREX의 inner research loop와 outer self-improvement loop. 내부 루프는 조사·관찰·중간 분석·context update를 수행하고, 외부 루프는 provisional answer의 confidence와 trajectory를 평가해 accept, refine, restart를 결정한다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2를 로컬 최적화한 공식 구조도. 핵심은 답안을 낸 뒤에도 검증된 근거·미해결 제약·다음 계획을 상태로 갱신해 다음 조사 라운드를 조준한다는 점이다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

긴 조사형 task에서는 검색 결과와 intermediate conclusion이 누적될수록 “더 많은 context”가 곧 “더 나은 다음 행동”을 뜻하지 않게 된다. history에는 검증된 출처, 중복 관찰, 이미 폐기한 가설, 충돌하는 근거, 오래된 계획이 함께 섞인다. 단순 token-limit 요약이나 오래된 message 삭제는 문맥 길이는 줄일 수 있어도, 왜 어떤 후보를 버렸는지와 다음에 어떤 조건을 검사해야 하는지를 보존하지 못할 수 있다.

AREX의 문제 정의는 답을 한 번에 생성하는 대신, 현재 답을 원 문제의 제약 단위로 감사하는 데서 출발한다. inner loop는 검색·열람·근거 통합을 거쳐 provisional answer, supporting evidence, confidence score를 만든다. 이어지는 outer loop는 confidence가 임계값을 넘으면 답을 채택하고, 낮으면 현재 trajectory가 복구 가능한지 판단한다. 유효한 조사 진전이 남아 있으면 **refine**, 방향 자체가 오염됐거나 비생산적이면 **restart**로 간다.

| 기존 deep research loop에서 흔한 처리 | AREX가 상태로 다루는 것 | 다음 라운드에 주는 효과 |
|---|---|---|
| history를 길게 유지하거나 token 기준으로 요약 | 검증된 finding과 source identifier | 확인된 근거를 다시 찾는 비용을 줄임 |
| 불확실한 답을 재검색 | unresolved constraint와 validity concern | 모호한 전체 질문 대신 빈 조건을 겨냥 |
| 실패한 경로를 암묵적으로 잊음 | rejected candidate와 폐기 이유 | 같은 막다른 길의 반복을 방지 |
| 한 번의 `finish`를 최종 종료로 간주 | accept·refine·restart의 외부 판단 | 부분적으로 맞는 trajectory를 재사용하거나 과감히 초기화 |

## 핵심 아이디어: 두 루프와 `update_context`

### inner loop는 답과 근거를 함께 외부화한다

inner research loop는 현재 objective를 기준으로 `search`, `visit`, `update_context`, `finish`를 사용한다. 공식 model card의 BrowseComp prompt에는 `google_scholar`도 포함된다. 이 루프의 `finish`는 전체 process의 종료가 아니라 한 research round의 종료다. 결과물은 자연어 답 하나가 아니라 provisional answer, supporting evidence, 0~100 confidence score를 포함하는 structured result다.

가장 중요한 도구는 **Autonomous Context Updating(ACU)** 이다. model이 필요하다고 판단할 때 `update_context`를 호출해 전체 history를 그대로 압축하는 대신, 다음 항목을 중심으로 refreshed research state를 만든다.

- verified findings와 source identifier
- current/rejected candidate
- unresolved constraint와 validity concern
- 다음 조사 계획

따라서 ACU는 generic summarizer라기보다 **trajectory consolidation**에 가깝다. 논문은 중요한 subproblem을 풀었을 때, 큰 후보를 탈락시켰을 때, 충돌한 근거를 정리했을 때, research plan이 바뀌었을 때처럼 의미 있는 상태 전이마다 호출될 수 있다고 설명한다. 반대로 매 round에 반드시 호출되는 고정 heuristic은 아니다.

### outer loop는 confidence를 검사 가능한 분기로 바꾼다

`finish` 뒤 outer loop는 confidence만 보고 무조건 재검색하지 않는다. low-confidence result가 나왔을 때도, 현재 trajectory에 재사용할 근거가 남았는지를 구분한다. 남아 있다면 verified progress는 보존하고 issue를 다음 targeted objective로 바꿔 **refine**한다. 남은 것이 noise·잘못된 전제·비생산적 탐색뿐이라면 original problem에서 **restart**한다.

이 구분은 “reflection을 한 번 더 한다”보다 운영적으로 더 구체적이다. 좋은 재귀 loop는 결과를 비판하는 문장을 추가하는 것이 아니라, **보존할 근거·버릴 후보·다음에 검증할 조건**을 명시적인 state contract로 만들어야 한다는 주장이다.

## 학습: 장기 trajectory에서 key step에 credit을 준다

AREX의 학습 데이터는 browse-intensive, reasoning-intensive, scientific-literature research task를 포함하는 verified synthetic task와 teacher trajectory로 구성된다. 저자들은 human expert가 answer format·available source·reasoning requirement·verification criterion을 가진 template을 정의하고, real-world web page·논문·structured knowledge base·public repository에서 concrete instance를 만든다고 설명한다.

그 다음 강한 teacher model이 같은 tool environment에서 만든 trajectory를 quality control한다. 바로 답을 추측한 기록, 관찰을 무시한 실행, invalid tool interaction, 근거로 재구성할 수 없는 final answer, low-confidence output을 제거한다. 이 필터는 단순 질의-정답 supervision보다 search action, evidence acquisition, state maintenance, answer revision을 함께 학습시키려는 장치다.

학습 recipe도 순서가 있다. 먼저 browse-intensive task로 tool use와 evidence acquisition을 익히고, expert reasoning task로 장문 추론·가설 비교를 강화한다. 이후 long-horizon trajectory의 key step을 replay하면서 capability를 섞고, long-horizon RL에서는 결정적 근거 획득·모순 해소·잘못된 조사 방향 수정처럼 credit assignment가 중요한 step을 더 강조한다. 논문의 ablation은 BrowseComp에서 full AREX **82.5**, key-step supervision을 random-step replay로 바꾼 설정 **74.1**, standard GRPO로 바꾼 설정 **79.4**를 보고한다. 이는 저자 실험의 ablation이며 독립 재현 수치는 아니다.

## 공개된 근거에서 확인되는 점

### 여섯 평가에서 보고한 수치

아래는 논문 Table 1과 공식 project/model card가 제시한 결과다. 모든 비교가 동일한 tool budget·benchmark split·proprietary model setting을 의미한다고 단정할 수는 없다. 특히 HLE 표의 `*` 표기는 full HLE 결과이고, 표식이 없는 결과는 text-only subset이라는 논문 주석을 함께 읽어야 한다.

| 평가 | AREX-Base | AREX-Turbo | 같은 표에서 볼 수 있는 맥락 |
|---|---:|---:|---|
| BrowseComp | 82.5 | 70.7 | Kimi-K2.6 83.2, GLM-5 75.9 |
| GAIA | 85.4 | 81.6 | Miro-H1 88.5, Miro-1.7 82.7 |
| xbench-2510 | 71.0 | 57.0 | DeepSeek-V4-Pro 80.0 |
| DeepSearchQA | 89.9 | 78.5 | Gemini-3.1-Pro 93.3, GPT-5.4 88.5 |
| WideSearch-en | **82.0** | 68.5 | Kimi-K2.6 80.8, GPT-5.4 77.5 |
| HLE with tools | 52.4 | 40.6 | GPT-5.4 52.1*, GLM-5 50.4 |

이 결과의 가장 흥미로운 패턴은 Base가 모든 benchmark에서 최상위라는 점보다, 122B-A10B MoE가 WideSearch-en과 HLE with tools에서 강한 값을 보이면서도 4B dense Turbo가 BrowseComp 70.7, GAIA 81.6을 기록한다는 데 있다. 논문 저자들의 주장은 더 큰 model 하나보다 **검증-상태 갱신-재귀적 objective 재정의**가 deep research 능력을 구성하는 중요한 단위라는 것이다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/arex-benchmark-results.webp">
    <img
      src="/images/blog/arex-benchmark-results.webp"
      alt="BrowseComp, GAIA, xbench-2510, DeepSearchQA, WideSearch, HLE에서 AREX-Base·AREX-Turbo와 closed/open model을 비교한 공식 benchmark 결과"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1을 로컬 최적화한 공식 결과 요약. 각 benchmark의 protocol·tool setting·HLE subset 표식을 보존해, 한 개의 리더보드 숫자로 단순화하지 않는 것이 중요하다.
  </figcaption>
</figure>

### model release와 deployability의 실제 범위

공식 Hugging Face collection에는 두 checkpoint가 있으며, 둘 다 non-gated `transformers` model로 Apache-2.0 license를 명시한다. model card의 release shape는 다음과 같다.

| 모델 | backbone / 구조 | 총·활성 parameter | context | 공개된 실행 보조물 |
|---|---|---:|---:|---|
| AREX-Turbo | Qwen3.5-4B / dense | 4B | 262,144 tokens | 2개 safetensors shard, XML tool-call prompt와 minimal inference 예제 |
| AREX-Base | Qwen3.5-122B-A10B / MoE | 122B / 10B activated | 262,144 tokens | 61개 safetensors shard, XML tool-call prompt와 minimal inference 예제 |

여기서 “공개됐다”와 “바로 완성된 research product로 재현된다”는 구분할 필요가 있다. inference README는 vLLM·SGLang 등 OpenAI-compatible server를 전제로 하며, Base 예시는 8-way tensor parallelism을 출발점으로 든다. 더 중요한 점은 제공된 `inference.py`가 model의 **다음 action**을 내보내고, caller가 실제 tool을 실행해 `<tool_response>`를 history에 넣는 구조라는 것이다. 즉 weights와 BrowseComp prompt·minimal wrapper는 공개됐지만, search/visit/context-update를 안정적으로 운영하는 tool backend, retry·citation validation·observability·human review는 배포자가 직접 마련해야 한다.

논문, project page, 두 model card와 release file tree를 확인한 범위에서 public release는 weights와 inference/evaluation-oriented helper를 제공한다. 반면 이 공식 surface들은 별도의 training-code repository를 연결하지 않는다. 따라서 현 시점의 공개물은 **모델을 실행·연구할 수 있는 release**이지, 논문의 data construction·teacher collection·RL pipeline 전체를 end-to-end 재현하는 code package로 읽기는 어렵다.

## 실무 관점에서의 해석

AREX가 주는 가장 실용적인 설계 신호는 “더 긴 context”가 아니라 **연구 상태를 어떤 schema로 남길 것인가**다. 실제 deep research product라면 추론 history 전체를 요약하는 것보다, claim별 evidence와 source provenance, unresolved constraint, rejected candidate, validity concern, next action을 별도 state로 저장하는 편이 검증·재시도·human review에 유리하다.

다만 confidence는 자동화된 진실 판정이 아니다. model이 스스로 만든 confidence와 trajectory assessment가 잘못된 source를 보존하거나, 그럴듯하지만 불완전한 answer를 accept할 위험은 남는다. 고위험 domain에서는 constraint별 verifier, citation freshness check, source quality policy, confidence threshold calibration, human approval gate가 이 outer loop 바깥에 추가돼야 한다.

결국 AREX의 가치는 “agent가 자기 자신을 개선한다”는 넓은 구호보다 구체적인 세 가지에 있다. **검증을 다음 objective로 전환하는 outer loop, evidence와 미해결 조건을 보존하는 autonomous context update, 그리고 긴 trajectory의 decisive step에 집중하는 학습 신호**다. weights는 이미 공개돼 있지만, 이 상태 contract가 실제 서비스의 재현성·안전성·비용을 개선하는지는 deployment 환경에서 별도로 검증해야 한다.

Sources: https://arxiv.org/abs/2607.21461, https://arxiv.org/html/2607.21461v1, https://vectorspacelab.github.io/arex-model/, https://huggingface.co/collections/BAAI/arex, https://huggingface.co/BAAI/AREX-Base, https://huggingface.co/BAAI/AREX-Turbo, https://huggingface.co/BAAI/AREX-Base/raw/main/README.md, https://huggingface.co/BAAI/AREX-Turbo/raw/main/README.md, https://huggingface.co/BAAI/AREX-Base/raw/main/inference/README.md, https://huggingface.co/BAAI/AREX-Turbo/raw/main/inference/README.md
