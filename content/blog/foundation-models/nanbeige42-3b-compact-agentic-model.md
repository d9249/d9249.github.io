---
title: "Nanbeige4.2-3B는 3B 규모로 agent·코드·툴 사용을 함께 겨냥한다"
date: "2026-07-28T16:04:16+09:00"
description: "Nanbeige4.2-3B는 반복 레이어를 쓰는 Looped Transformer와 실행 환경 기반 SFT·다단계 RL을 결합해 3B non-embedding parameter 안에서 코드 agent, office workflow, MCP tool use와 reasoning을 함께 노린 공개 가중치 모델이다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - Nanbeige
  - Agentic Model
  - Small Language Model
  - Tool Use
  - Reinforcement Learning
draft: false
---

작은 모델이 reasoning benchmark 하나에서 강한 것과, repository를 고치고 문서를 다루며 여러 도구를 호출하는 agent로 쓸 수 있는 것은 다른 문제다. 긴 trajectory에서는 tool-call 형식, 실패 복구, 환경 상태, 종료 판단까지 함께 학습해야 하며, 이 때문에 agent 성능은 흔히 훨씬 큰 모델이나 특정 domain에 특화된 post-training에 의존해 왔다.

`Nanbeige4.2-3B`는 이 간극을 3B non-embedding parameter 안에서 메우려는 모델이다. 논문과 Hugging Face 모델 카드는 Looped Transformer, 28T-token pre-training, 실행 가능한 환경을 넓힌 SFT trajectory, Think/Non-Think를 함께 다루는 RLHF와 action-centric agentic RL을 핵심으로 제시한다. 가중치·custom modeling code·evaluation result는 공개됐고, model card에는 Transformers·SGLang·vLLM·llama.cpp·Ollama 경로도 적혀 있다.

흥미로운 지점은 “작은 모델도 agent가 될 수 있다”는 선언보다 **어떤 training recipe가 작은 모델의 긴 행동 궤적을 안정화하는가**에 있다. 이 글의 benchmark 수치는 모두 저자 보고치이며, 일부 office/cowork 평가는 저자 측 scaffold를 쓴다는 조건을 함께 읽어야 한다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/nanbeige42-3b-performance.webp">
    <img
      src="/images/blog/nanbeige42-3b-performance.webp"
      alt="Nanbeige4.2-3B와 Gemma4, Qwen3.5 모델군의 agent task 및 reasoning task 점수를 비교한 공식 막대 그래프"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1을 로컬 최적화한 공식 비교. 서로 다른 크기의 공개 모델을 agent와 reasoning task에서 함께 비교하지만, 모든 benchmark가 외부 공통 harness인 것은 아니다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

논문이 겨냥하는 병목은 작은 모델의 단일 능력이 아니라 **범용 agent 행동의 조합**이다. 코드 agent는 repository 상태를 읽고 patch를 만들며 test feedback을 반영해야 한다. office agent는 여러 문서와 작업 자산을 다루고, tool-use agent는 서로 다른 schema와 긴 multi-step interaction을 견뎌야 한다. 한 domain의 trajectory만 대량으로 학습하면 그 scaffolding과 prompt 형식에 과적합할 위험도 있다.

Nanbeige4.2-3B는 total parameter 기준으로는 4B, embedding을 제외하면 3B다. 더 큰 model을 그대로 축소하는 대신, hidden state가 같은 Transformer stack을 한 번 더 통과하도록 하는 **Looped Transformer**를 채택했다. 저자들은 이를 parameter를 더하지 않고 effective capacity를 키우는 방식으로 설명한다. base model 비교에서 Nanbeige4-3B 대비 GSM8K는 85.9에서 92.7, MMLU-Pro는 47.6에서 63.8, GPQA는 36.2에서 53.3으로 상승했다고 보고한다.

다만 architecture만으로 agent capability가 생기는 것은 아니다. 논문의 중심은 pre-training 뒤의 environment-grounded data와 RL 설계다. 특히 training trajectory를 단순 chat log가 아니라 실행·검증 가능한 작업 기록으로 만들고, model이 자주 실패하는 지점을 다음 data mining의 구조적 단서로 되돌리는 closed loop를 제시한다.

## 핵심 아이디어 / 구조 / 동작 방식

### 1. 28T token과 반복 레이어로 만든 compact base

모델은 28T token으로 scratch pre-training 됐다. Looped Transformer는 공유된 layer stack이 hidden state를 추가로 처리하게 해, non-embedding 3B라는 parameter budget 안에서 깊이와 capacity를 늘리려는 선택이다. model card에는 이후 세대에 반영될 개선으로 LoopSplit, depth attention을 포함한 mHC, concatenated n-gram embeddings도 언급되지만, 이들은 Nanbeige4.5 training 중인 기능이라는 점에서 4.2의 headline result와 분리해서 봐야 한다.

Hugging Face card 기준 context length는 최대 **256K token**이다. tool-use 상황에서는 `preserve_thinking=true`을 권하고, tool-call format은 XML을 우선 권장하며 JSON compatibility도 제공한다. 즉 일반 chat template만 붙이는 모델이 아니라 reasoning history와 tool-call parser의 설정이 실제 integration 품질에 영향을 주는 model family다.

### 2. SFT는 “실행되는 환경”과 여러 agent scaffold를 늘린다

코드 agent data에서는 code repository를 모으고, dependency와 infrastructure를 포함한 self-contained container image를 재구성한 뒤, patch가 target 및 regression test를 통과한 trajectory만 남긴다. 이후 잘못된 tool call, 끝나지 않는 loop, 불필요한 action, context truncation을 turn 단위로 거른다.

또 같은 fail-to-pass task에 Claude Code, OpenHands, SWE-agent, Codex 기반 driver 등 서로 다른 agent scaffold를 병렬로 적용해 trajectory를 모은다고 설명한다. 목적은 특정 prompt template이나 editing UI가 아니라, scaffold가 달라도 남는 debugging·repair pattern을 학습시키는 것이다. tool-use data도 MCP specification을 수집하고, 실제 데이터와 Python callable interface를 결합한 hybrid environment를 만들어 확장한다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/nanbeige42-3b-code-data-pipeline.webp">
    <img
      src="/images/blog/nanbeige42-3b-code-data-pipeline.webp"
      alt="코드 저장소 수집, 실행 환경 재구성, 테스트 검증, 여러 agent scaffold의 trajectory synthesis, turn-level filtering으로 이어지는 Nanbeige4.2-3B의 agentic software engineering 데이터 합성 과정"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2를 로컬 최적화한 공식 pipeline. 검증된 patch와 실행 기록을 남기고, 서로 다른 scaffold의 trajectory를 통합하는 것이 핵심이다.
  </figcaption>
</figure>

### 3. RL은 reasoning 길이와 action error를 함께 다룬다

post-training은 세 겹이다. 먼저 Think와 Non-Think response를 함께 다루는 two-stage RLHF로 alignment·reasoning·agentic behavior의 bad case를 줄인다. 다음으로 length-controlled reasoning RL은 correctness를 희생하지 않는 범위에서 response가 token budget을 넘을 때 penalty를 준다. 마지막 agentic RL은 outcome reward뿐 아니라 tool-call accuracy와 turn별 information gain을 보는 process reward를 쓴다.

이때 agentic RL task를 무작정 어려운 long-horizon task로 밀어 넣지 않는다. 저자들은 reasoning-RL model의 pass@8을 이용해 상대적으로 짧고 풀 가능성이 높은 task를 우선 선택하는 편이 compact model의 optimization 안정성과 gain에 유리했다고 쓴다. action-centric rubric은 single-turn action error를 줄이면서 전체 score를 올리는 방향으로 설계됐다.

| RL 단계별 대표 결과 | SFT | Think RLHF | Non-Think RLHF |
|---|---:|---:|---:|
| AA-LCR accuracy | 50.00 | 53.00 | **57.00** |
| AA-LCR bad-case rate | 17.00 | 8.00 | **2.00** |
| LiveCodeBench-V6 accuracy | 65.45 | 68.51 | **72.10** |
| PinchBench-V2 accuracy | 55.89 | 71.14 | **75.49** |
| PinchBench-V2 average output tokens | 20,515 | 13,098 | **11,808** |

표는 논문 Table 2의 Think-mode 동일 decoding setting 결과다. 정확도와 average length가 함께 바뀐 checkpoint 비교이므로, 다른 benchmark protocol의 final score와 한 줄로 섞어 해석해서는 안 된다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/nanbeige42-3b-rl-quality-efficiency.webp">
    <img
      src="/images/blog/nanbeige42-3b-rl-quality-efficiency.webp"
      alt="강화학습 전후 LiveCodeBench, SWE-Verified, PinchBench, ClawGym 등에서 정확도는 높아지고 평균 출력 token은 낮아진 Nanbeige4.2-3B의 공식 비교 차트"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 7을 로컬 최적화한 공식 비교. 저자들은 RL 뒤 여러 benchmark에서 accuracy가 오르고 output length가 감소했다고 보고한다.
  </figcaption>
</figure>

## 공개된 근거에서 확인되는 점

논문 Table 3은 Nanbeige4.2-3B를 Qwen3.5와 Gemma4 계열에 맞춰 평가한다. code-agent 행에서는 SWE-Bench Verified **63.6**, SWE-Bench Pro **46.9**, Terminal-Bench 2.0 **44.1**을 보고했다. 같은 table에서 Qwen3.5-9B는 각각 53.1·33.8·29.2, Gemma4-12B는 44.2·21.9·21.1이다. 일반 agent 항목에서도 GDPval rubrics 74.3, PinchBench-V2 74.7, ClawGym 65.0, MCP-Atlas 57.8로 제시된다.

reasoning에서도 모든 숫자가 agent benchmark만큼 높게 보이는 것은 아니다. Nanbeige4.2-3B는 GPQA Diamond 87.4, HMMT-Feb-2026 82.8, IMO-Answer-Bench 67.3, LiveCodeBench-V6 72.5를 보고했다. 반면 SciCode 35.6은 Gemma4-12B의 38.2보다 낮고, alignment의 IF-Bench 54.6은 Gemma4-12B의 73.5보다 낮다. 따라서 이 release를 “전 영역 최고”보다 **작은 크기에서 code·tool·office agent와 여러 reasoning task를 함께 끌어올린 모델**로 읽는 편이 정확하다.

OpenClaw scaffold로 맞춘 local personal assistant table도 따로 있다. 여기서 Nanbeige4.2-3B는 PinchBench-V2 74.7, Claw-Gym 65.0, GDPval 68.8, AgentIF-Oneday 58.9, DeepResearch Bench II 33.4, ResearchRubrics 44.8을 기록했다고 보고했다. 같은 scaffold·tool set·protocol로 비교했다는 설명은 유용하지만, GDPval·OfficeQA-Pro·AgentIF-Oneday 등에는 저자 측 in-house scaffold가 포함돼 있어 공개 표준 benchmark처럼 일반화하기에는 한계가 있다.

release surface도 실제로 확인할 수 있다. Hugging Face API에서 model repository는 2026-07-21에 생성됐고, 이번 확인 시점의 last modified는 2026-07-27이었다. Apache-2.0 license, `transformers` library, custom code, 모델 가중치 2개 shard, config·tokenizer, `modeling_nanbeige.py`, benchmark별 eval YAML이 들어 있다. 반면 model card와 paper에서 확인되는 공개물은 inference/weight 중심이며, 논문이 설명하는 SFT/RL training pipeline 전체나 curated trajectory corpus가 함께 공개된 것은 확인되지 않는다.

| 배포·통합 항목 | 공개 자료에서 확인되는 내용 | 실무적 의미 |
|---|---|---|
| 모델 규모 | 4B total / 3B non-embedding | 작은 parameter budget을 전면에 둔 general agent model |
| context | 최대 256K token | 긴 tool trajectory를 겨냥하지만, 실제 memory budget은 별도 검증 필요 |
| license | Apache-2.0 | model card metadata 기준 공개 라이선스 |
| Transformers | `trust_remote_code=True` example | custom modeling code를 pin·review한 뒤 실행해야 함 |
| serving | SGLang, vLLM, llama.cpp, Ollama 경로 제시 | 일부 경로는 Nanbeige branch 또는 parser 지원을 요구 |
| training 재현성 | weights·inference artifacts는 확인, full training data/script는 미확인 | headline score의 독립 재현은 별도 과제 |

## 실무 관점에서의 해석

Nanbeige4.2-3B의 가장 강한 메시지는 model size가 아니라 **data와 reward의 granularity**다. code repository를 containerized environment로 복원하고 test를 통과한 patch를 고른 뒤, trajectory를 turn 단위로 정리한다. 여기에 scaffold 다양성과 action-centric process reward를 더한다. 작은 모델이 tool schema를 외우는 데 그치지 않고, 실패 후 어떤 action을 다시 해야 하는지를 배우게 하려는 설계다.

그렇다고 3B가 곧바로 “아무 기기에서나 가볍게 돌아가는 개인 비서”를 뜻하지는 않는다. 256K context와 최대 131,072 new token 권장 설정은 memory·latency·tool-call loop cost를 크게 바꾼다. 특히 Transformers quickstart가 `trust_remote_code=True`을 요구하고, llama.cpp·Ollama 경로도 Nanbeige 지원 branch와 별도 build 단계를 안내한다. production adoption에서는 weight size만 보지 말고 custom code review, parser compatibility, quantization quality, long-context KV/cache budget, tool execution permission을 함께 검증해야 한다.

benchmark 해석도 신중해야 한다. 저자들이 고정한 scaffold와 tool protocol 안에서의 상대 비교는 meaningful하지만, code agent의 결과는 OpenHands·SWE-agent·Terminus 2 같은 서로 다른 evaluator harness 위에 놓여 있다. office와 cowork 지표 일부는 in-house setting이다. 독립 팀이라면 작은 자체 suite에서 model의 tool-call syntax, multi-turn thinking preservation, 실패 후 recovery, 그리고 실제 hardware에서의 tokens/sec를 먼저 확인하는 편이 안전하다.

그럼에도 이 release는 compact agent model을 평가하는 기준을 넓힌다. 단순 parameter 수나 one-shot reasoning score가 아니라, **검증 가능한 environment data → scaffold-diverse trajectory → action-level reward → deployment parser**까지 이어지는 전체 stack이 결과를 만든다는 점을 보여준다. 작은 open model을 local assistant나 cost-sensitive code/tool agent에 적용하려는 팀이라면, Nanbeige4.2-3B는 “3B도 가능하다”는 홍보 문구보다 그 pipeline을 재현 가능한 운영 규칙으로 바꿀 수 있는지 검토할 만한 사례다.

Sources: https://arxiv.org/abs/2607.22083, https://arxiv.org/html/2607.22083v2, https://huggingface.co/Nanbeige/Nanbeige4.2-3B, https://huggingface.co/api/models/Nanbeige/Nanbeige4.2-3B, https://huggingface.co/Nanbeige/Nanbeige4.2-3B/raw/main/README.md
