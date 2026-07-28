---
title: "Kimi K3는 2.8T·104B 활성 경로를 open weight로 공개했다"
date: "2026-07-28T18:36:05+09:00"
description: "Moonshot AI의 Kimi K3는 2.8T parameter·104B activated MoE, 1M context, native vision을 내세운 모델이다. 96개 safetensors shard의 full weight와 47쪽 technical report가 공개됐지만, 64+ accelerator 배포 권고와 Kimi K3 License의 서비스 조건까지 함께 읽어야 하는 frontier-scale release다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - Kimi K3
  - Moonshot AI
  - MoE
  - Open Weights
  - Agentic Coding
image: "/images/blog/kimi-k3-benchmark-1.webp"
draft: false
---

Kimi K3를 처음 소개한 7월 17일의 런치 글은 API·Kimi Code·Kimi Work를 먼저 열고, full weight와 technical report는 7월 27일까지 공개하겠다고 예고했다. 그 약속은 실제 배포물로 이어졌다. 현재 공식 Hugging Face `moonshotai/Kimi-K3`에는 non-gated full model weight 96개 shard, custom Transformers implementation, tokenizer·vision processor·eval YAML이 있고, MoonshotAI GitHub repository에는 47쪽 `k3_tech_report.pdf`가 있다.

따라서 K3는 더 이상 “오픈 웨이트 이전의 API-first flagship”이 아니다. 2.8T total parameter, **104B activated parameter**, 1M-token context를 가진 native multimodal MoE가 실제로 내려받을 수 있는 형태로 공개됐다. 다만 공개 weight가 곧바로 보편적인 self-hosting을 의미하지는 않는다. 저자들은 64개 이상 accelerator의 supernode 배포를 권하고, 모델은 MXFP4 weight·MXFP8 activation을 전제로 하며, 라이선스에는 대형 Model-as-a-Service 사업자와 대형 상용 product를 위한 별도 조건이 있다.

이번 update에서 중요한 변화는 숫자 자체보다 **검증 가능한 공개 표면이 생겼다**는 점이다. architecture·post-training·infrastructure·evaluation을 담은 technical report, checkpoint 형식, custom code, license를 직접 읽을 수 있게 됐다. 반대로 official GitHub repository는 report와 README 중심이며 end-to-end training script나 standalone inference framework를 담은 제품형 codebase는 아니다. K3를 채택하려면 “open”과 “바로 운영 가능”을 계속 분리해야 한다.

## 무엇을 해결하려는가

K3가 겨냥하는 것은 단발 chat보다 오래 가는 agent task다. 대형 repository를 읽고 terminal tool을 조직하는 coding agent, 문서·web·spreadsheet를 다루는 knowledge work, screenshot을 보고 수정하는 frontend·CAD·game development가 대표적인 target이다. 이런 작업에서는 한 번의 answer quality보다 context 유지, tool-call loop, action 후 관측, 실패 복구, 긴 reasoning budget이 함께 작동해야 한다.

K3의 공개 report는 이를 `reason → act → observe → verify → adapt`의 일반 loop로 설명한다. general·agentic·coding domain에서 여러 reasoning-effort level의 RL을 수행하고, 전문화된 policy를 multi-teacher on-policy distillation으로 하나의 model에 합친다는 구상이다. training environment에는 verifiable search·professional knowledge work, software engineering·kernel optimization, vision-in-the-loop tool use, persistent assistant workflow, web development, autonomous execution을 포함한다고 적혀 있다.

| 병목 | K3가 제시하는 장치 | 실제 도입에서 확인할 점 |
|---|---|---|
| 긴 trace와 자료 | 1,048,576-token context, KDA, automatic prefix caching | 256 token을 넘는 불변 prefix를 유지해야 cache hit를 시도할 수 있음 |
| compute와 model scale | 2.8T total / 104B activated Stable LatentMoE | 96 shard weight와 64+ accelerator 권고는 local deployment와 다른 문제 |
| 긴 agent training | partial rollout·external KV retention·resumable microVM sandbox | 공개 report는 방법을 설명하지만 training harness 전체는 배포물에서 확인되지 않음 |
| product loop | Kimi API·Kimi Code·Kimi Work | API history, tool schema, permission/approval 정책을 host product별로 검증해야 함 |

## 핵심 아이디어 / 구조 / 동작 방식

### 1. sequence·depth·width를 나눠 다루는 93-layer MoE

공식 model card는 K3를 93-layer MoE로 정리한다. attention layer는 **69 KDA + 24 Gated MLA**이며, 각 block은 KDA 세 층과 Gated MLA 한 층을 조합한다. KDA(Kimi Delta Attention)는 long context의 token mixing을 효율화하려는 hybrid linear-attention 계열이고, Gated MLA는 필요한 지점에서 더 높은 capacity의 attention을 보완한다.

Attention Residuals(AttnRes)는 depth 방향의 정보 흐름을 다룬다. 이전 layer representation을 모두 동일하게 누적하는 대신, learned pseudo-query가 embedding과 앞선 block output 중 필요한 것을 선택적으로 가져온다. 저자들이 말하는 핵심은 KDA가 sequence length, AttnRes가 network depth, MoE가 model width의 병목을 나눠 푼다는 것이다.

| 구조 축 | 공개된 K3 사양 | 의미 |
|---|---|---|
| 총규모 / 활성 경로 | 2.8T total / **104B activated** | 총 parameter와 token당 compute를 MoE routing으로 분리 |
| expert | routed 896개 중 token당 16개 선택, shared expert 2개 | 극단적 sparsity를 안정적으로 운용하려는 설계 |
| attention | 69 KDA + 24 Gated MLA | long-context 효율과 선택적 고용량 attention의 혼합 |
| context | 1,048,576 tokens | 긴 codebase·tool trace를 한 session에 유지하려는 상한 |
| vision | MoonViT-V2, 401M parameter | weight package에서는 text·image native path가 명시됨 |
| quantization | MXFP4 weight / MXFP8 activation의 QAT | checkpoint 크기와 accelerator/kernel 호환성이 deployment 핵심이 됨 |

Stable LatentMoE에는 Normalized LatentMoE, SiTU-GLU, Quantile Balancing이 들어간다. 특히 Quantile Balancing은 router score의 quantile에서 expert allocation을 정해 heuristic update와 민감한 balancing hyperparameter를 줄이려는 방식이다. K3 technical report는 K2 대비 약 **2.5× overall scaling efficiency**를 주장하지만, 이는 저자 recipe 전체의 결과이지 architecture component 하나의 독립 효과로 읽어서는 안 된다.

### 2. 1M context RL은 model만의 문제가 아니다

K3 report에서 인상적인 부분은 million-token agentic RL을 model loss만으로 설명하지 않는다는 점이다. partial rollout, external KV-cache retention, adaptive throttling, resumable microVM sandbox로 model state와 environment state를 오래 보존하는 co-located system을 제시한다. trajectory가 수백·수천 tool call과 누적 million-token context로 길어질 수 있다는 전제다.

이 설계는 KDA-aware prefix cache management, fused kernel, context parallelism, balanced expert-parallel training, fleet-level scheduling과 연결된다. 즉 K3의 long-horizon claim은 “1M을 받을 수 있다”보다 **긴 context·sandbox·cache·expert parallelism을 동시에 유지하는 serving system**에 가깝다. 공개된 weight는 이 방향을 직접 검증할 출발점을 주지만, 같은 규모의 hardware와 runtime을 갖추지 못하면 report의 latency·cost profile을 그대로 재현할 수는 없다.

### 3. API에서는 reasoning level과 history가 contract다

Kimi API는 OpenAI-compatible Chat Completions에서 `model="kimi-k3"`로 호출한다. K3는 thinking을 끌 수 없으며 top-level `reasoning_effort`에 **`low`·`high`·`max`**를 넣을 수 있고 default는 `max`다. 초기 런치 시점의 “max only” 안내는 현재 문서 기준으로는 더 이상 정확하지 않다.

multi-turn 및 tool-call loop에서는 이전 assistant message 전체를 다음 request에 그대로 넣어야 한다. `content`만 남기면 reasoning/tool state를 잃을 수 있다. `max_completion_tokens`는 기본 131,072, 최대 1,048,576이며, `temperature=1.0`, `top_p=0.95`, `n=1` 등은 fixed value라 request에서 생략하라고 문서가 안내한다. vision input은 public image URL을 직접 받지 않고 base64 또는 `ms://<file-id>`를 써야 한다.

## 공개된 근거에서 확인되는 점

### 96 shard weight·technical report·custom code가 실제로 공개됐다

Hugging Face API 기준으로 `moonshotai/Kimi-K3`는 public·non-gated repository이며, 2026-07-27에 마지막 수정됐다. `model-00001-of-000096.safetensors`부터 `model-00096-of-000096.safetensors`까지의 weight, config·tokenizer, `modeling_kimi_k3.py`, vision processor, encoding module, evaluation YAML이 함께 있다. Hub metadata는 `custom_code`, `transformers`, `image-text-to-text`, `license:other`를 표시하며, full model weight는 Kimi K3 License 아래 배포된다.

공식 GitHub repository `MoonshotAI/Kimi-K3`는 2026-07-27 생성됐고, root에는 README·LICENSE·assets·`k3_tech_report.pdf`가 있다. release endpoint는 404이고 tags도 비어 있다. 따라서 이 repo는 versioned runtime product보다 technical report와 release provenance를 위한 **source companion**으로 보는 편이 정확하다. end-to-end training script, data recipe implementation, benchmark harness, official vLLM/SGLang serving repo는 이 확인 범위의 root release 표면에서 보이지 않았다.

| 공개 표면 | 확인된 내용 | 해석 |
|---|---|---|
| Hugging Face | non-gated full weight 96 shard, custom Transformers code, vision processor, eval artifacts | checkpoint·format·model implementation을 직접 inspect할 수 있음 |
| GitHub | 47쪽 technical report, README, LICENSE, asset | method와 release provenance는 공개됐지만 runtime framework repo는 아님 |
| API | `kimi-k3`, low/high/max effort, tool/vision/context caching 문서화 | managed product로는 바로 평가 가능 |
| Kimi Code | K3 선택 및 최대 1M context 안내 | terminal/IDE workflow를 위한 hosted surface |
| Kimi Work | local file·browser automation·cron·ask-before-acting 설명 | desktop knowledge-work product와 model capability는 별도 검증 대상 |

### coding benchmark는 상위권이지만 harness를 섞어 읽으면 안 된다

공식 table의 K3 수치는 `max` thinking effort에서 보고됐다. DeepSWE 67.5, ProgramBench **77.8**, Terminal-Bench 2.1 88.3, FrontierSWE 81.2, SWE-Marathon **42.0**, MLS-Bench-Lite 48.3이 핵심 coding 행이다. K3가 ProgramBench·SWE-Marathon에서 가장 높게 제시되지만, DeepSWE는 GPT-5.6 Sol 73.0, Terminal-Bench 2.1은 GPT-5.6 Sol 88.8, FrontierSWE와 MLS-Bench-Lite는 Claude Fable 5가 앞선다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kimi-k3-benchmark-1.webp"
    alt="Kimi K3와 Claude Fable 5, GPT-5.6 Sol, Claude Opus 4.8, GLM-5.2의 코딩 benchmark를 비교한 Moonshot AI 공식 figure"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Moonshot AI 공식 coding benchmark figure. K3는 max effort, 비교 모델은 benchmark별 Kimi Code·Claude Code·Codex·Terminus 2 등 서로 다른 harness에 놓여 있어 단일 leaderboard로 읽으면 안 된다.
  </figcaption>
</figure>

이 차이는 footnote에 실제로 드러난다. DeepSWE에서 K3는 Kimi Code harness로 평가됐고, 다른 행에서는 model별 best harness를 취하기도 한다. Claude Fable 5 result에는 fallback이 포함될 수 있고 GPT-5.6 Sol에는 cyberguard가 포함될 수 있다고 report가 명시한다. K3는 frontier coding agent table에 실질적으로 들어왔지만, 동일 policy·tool·fallback·compute budget에서 모두 이겼다는 뜻은 아니다.

### agentic·reasoning·vision 결과도 provenance를 나눠야 한다

K3는 BrowseComp 91.2, DeepSearchQA F1 95.0, ResearchRubrics 76.2, MCPMark-Verified 94.5, AutomationBench 30.8을 보고한다. reasoning에서는 GPQA Diamond 93.5, AA-LCR 74.7, HLE-Full 43.5 / tool 사용 56.0이 제시된다. vision 관련 공식 표에는 MMMU-Pro 81.6, MathVision 94.3, OmniDocBench 91.1이 있다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kimi-k3-benchmark-2.webp"
    alt="Kimi K3와 경쟁 모델의 agentic, reasoning, vision benchmark를 비교한 Moonshot AI 공식 figure"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Moonshot AI 공식 agentic·reasoning·vision benchmark figure. 공개 benchmark, Artificial Analysis의 Elo, Kimi internal benchmark가 한 표에 섞여 있으므로 행별 provenance가 중요하다.
  </figcaption>
</figure>

Kimi Code Bench 2.0과 일부 knowledge-work evaluation은 internal benchmark이며, GDPval-AA v2·AA-Briefcase는 Artificial Analysis에서 인용한 Elo다. 따라서 이 수치는 release positioning의 근거이지만, 독립 reproduced score와 internal task score를 같은 신뢰도로 취급해서는 안 된다.

### Kimi K3 License는 permissive-looking이지만 조건 없는 MIT가 아니다

license는 use·copy·modify·distribute·sublicense·sell·deploy·fine-tune·derivative work를 허용한다. 다만 **Model as a Service** 사업을 운영하는 licensee 및 affiliate의 연속 12개월 aggregate revenue가 2,000만 달러를 넘으면 commercial use 전에 Moonshot AI와 별도 agreement가 필요하다. 월간 active user가 1억 명을 넘거나 월 매출이 2,000만 달러를 넘는 상용 product/service는 UI에 `Kimi K3`를 눈에 띄게 표시해야 한다.

이 조건들은 internal use, Moonshot official product, certified inference partner를 통해 접근하는 경우에는 적용되지 않는다고 쓰여 있다. 즉 개인 연구·사내 실험·대부분의 작은 product에는 폭넓은 권한을 주지만, 대규모 inference provider나 대형 commercial surface에까지 무조건적인 unrestricted license를 주는 형태는 아니다.

## 실무 관점에서의 해석

### autonomy를 설계하기 전에 boundary를 명시해야 한다

공식 런치 글도 K3의 한계를 직접 적는다. long-horizon task에 강하게 맞춘 탓에, minor issue나 ambiguous user intent를 만났을 때 사용자 대신 예상 밖의 결정을 내릴 수 있다는 것이다. 잘 정의된 boundary 안에서만 행동해야 하는 application이라면 explicit behavioral constraint를 추가하라고 권한다. 제공사 스스로 Claude Fable 5와 GPT-5.6 Sol 대비 user experience gap도 남아 있다고 평가한다.

따라서 K3를 autonomous executor로 붙일 때는 model score보다 먼저 **approval gate, write/delete/payment 같은 side effect의 allowlist, tool별 argument validation, task budget, human handoff**를 설계해야 한다. 이는 model의 결함을 단정하는 말이 아니라, official release가 스스로 밝힌 product-level caveat를 운영 control로 번역한 것이다.

K3의 변화는 “거대한 model이 나왔다”보다 **전면 공개의 검증 단위가 완성됐다**는 데 있다. 이제 weight 96 shard, custom model code, technical report, license, API doc을 함께 놓고 architecture·packaging·service contract를 구분할 수 있다. 특히 104B activated parameter라는 값은 2.8T headline보다 deployment planning에 더 직접적이지만, MoE routing과 1M context cache가 들어가는 순간 단일 GPU에서의 단순 parameter arithmetic만으로 운영 가능성을 판단할 수 없다.

self-hosting 관점에서는 세 단계가 있다. 첫째, Hugging Face checkpoint가 실제 공개됐는가. 답은 그렇다. 둘째, model을 특정 hardware·runtime에서 안정적으로 serve할 수 있는가. 여기서는 MXFP4/MXFP8, KDA kernel, context parallelism, expert parallelism, 64+ accelerator 권고가 즉시 기술적 제약이 된다. 셋째, production API나 fine-tuning product로 재배포해도 license가 맞는가. 이 단계에서는 Kimi K3 License의 Model-as-a-Service 및 규모 조건을 법무·사업 측과 함께 읽어야 한다.

API adoption에도 update가 있다. low/high/max reasoning effort가 생겼으므로, 기존의 max-only latency profile을 그대로 가정할 필요는 없다. 반면 K3는 항상 thinking mode를 켜며, long session에서는 complete assistant history와 unchanged prefix를 유지해야 한다. 비용은 cache-hit input $0.30/MTok, cache-miss input $3.00/MTok, output $15.00/MTok이고 context length에 따른 별도 tier는 없다. 긴 agent workflow에서 cache hit가 설계의 일부가 되어야 하는 이유다.

결론적으로 K3는 “download 가능한 3T-class frontier model”이 됐지만 “평범한 open checkpoint”가 되지는 않았다. 공개된 것은 큰 장점이지만, 구현 난이도·hardware·license·benchmark provenance가 함께 커진 release다. 실무팀은 먼저 API에서 tool loop와 effort별 quality/cost를 작은 workload로 측정하고, self-hosting은 checkpoint download보다 **KDA-compatible runtime, MoE parallelism, 1M context memory, license fit**을 통과시키는 별도 project로 다루는 편이 현실적이다.

Sources: https://www.kimi.com/blog/kimi-k3, https://huggingface.co/moonshotai/Kimi-K3, https://huggingface.co/api/models/moonshotai/Kimi-K3, https://github.com/MoonshotAI/Kimi-K3, https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf, https://raw.githubusercontent.com/MoonshotAI/Kimi-K3/main/LICENSE, https://platform.kimi.ai/docs/guide/kimi-k3-quickstart, https://platform.kimi.ai/docs/pricing/chat-k3, https://www.kimi.com/code, https://www.kimi.com/products/kimi-work
