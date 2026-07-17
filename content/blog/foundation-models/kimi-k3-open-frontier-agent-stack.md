---
title: "Kimi K3는 2.8T·1M context를 ‘오픈 웨이트 이전’ API agent stack으로 먼저 꺼낸다"
date: "2026-07-17T12:54:28+09:00"
description: "Moonshot AI의 Kimi K3는 2.8T MoE, 1M context, native vision을 내세운 Kimi의 새 flagship이다. API·Kimi Code·Kimi Work에는 이미 들어왔지만, full weights와 technical report는 아직 예정된 공개물이다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - Kimi K3
  - Moonshot AI
  - MoE
  - Long Context
  - Agentic Coding
image: "/images/blog/kimi-k3-benchmark-1.webp"
draft: false
---

Kimi K3를 읽을 때 가장 먼저 분리해야 할 것은 **모델의 규모**와 **공개의 형태**다. Moonshot AI는 K3를 2.8조 파라미터, 100만 토큰 context, native vision을 갖춘 “open 3T-class” flagship으로 소개한다. 동시에 공식 런치 페이지는 full model weights와 architecture·training·evaluation technical report를 7월 27일에 맞춰 공개하겠다고 밝힌다. 지금 당장 쓸 수 있는 것은 Kimi API, Kimi Code, Kimi Work라는 제품 표면이고, 지금 당장 내려받아 재현할 수 있는 것은 아직 아니다.

이 순서는 단순한 릴리스 일정의 차이가 아니다. K3는 model checkpoint 하나보다 **장기 agent workflow를 위한 제품·serving·API contract**를 먼저 내놓았다. 1M context를 cache와 함께 쓰고, reasoning은 기본 `max`로 고정하며, tool call과 multi-turn history를 보존해야 한다는 API 규칙까지 모델의 사용법에 묶여 있다. 따라서 K3를 “큰 오픈 모델”이라고만 부르면 반만 맞는다. 현 단계에서 더 정확한 표현은 **오픈 웨이트 공개를 예고한, API-first frontier agent model**이다.

## 무엇을 해결하려는가

K3가 겨냥하는 문제는 일반적인 chat completion보다 오래 가는 agent task다. 런치 페이지는 대형 repository를 읽고 terminal tool을 조직하며, kernel을 profile·rewrite·benchmark하거나, research 자료를 읽고 실행 가능한 numerical pipeline으로 옮기거나, screenshot을 보며 frontend·CAD·game development를 반복하는 작업을 강조한다.

이런 작업에서는 모델의 한 번짜리 답변 품질보다 다음 네 가지가 함께 중요하다.

| 병목 | K3가 제시하는 답 | 현재 확인 가능한 범위 |
|---|---|---|
| 장기 context | 1M-token context와 automatic caching | 공식 API 문서가 요청 형태·cache 사용을 설명 |
| agent reasoning | thinking always-on, 현재 `reasoning_effort=max`만 지원 | K3 API에서 실제 contract로 공개 |
| code + visual loop | native image·video input과 Kimi Code/Work | 공식 API·제품 페이지에서 사용 표면 확인 |
| scale의 serving 비용 | sparse MoE, QAT, large-supernode 권장 | 구조적 설명은 런치 페이지에 있으나 세부 report는 대기 상태 |

Moonshot이 특히 강조하는 것은 long-horizon coding이다. kernel optimization에서는 동일 sandbox에서 최대 24시간 동안 profile·rewrite·benchmark를 시켰고, GPU compiler 사례에서는 K3가 MLIR 위 tile-level IR, optimization pass, PTX code-generation path를 가진 MiniTriton을 만들었다고 소개한다. chip-design 사례는 48시간 autonomous run으로 45nm library에서 timing을 닫고 simulation상 8,700 tokens/s decode throughput을 냈다고 주장한다. 이 사례들은 independent reproduction이 아닌 회사의 공식 showcase이므로, “가능한 agent behavior의 예”로 읽어야지 일반 pass rate로 바꾸면 안 된다.

## 핵심 아이디어 / 구조 / 동작 방식

공식 런치 페이지가 제공하는 K3의 architecture story는 두 층이다. 첫째는 long context와 deep model scale을 위한 **Kimi Delta Attention (KDA)** 및 **Attention Residuals (AttnRes)**다. KDA는 hybrid linear-attention 계열의 기반, AttnRes는 depth를 따라 표현을 일괄 축적하는 대신 필요한 representation을 선택적으로 되찾는 장치로 설명된다.

둘째는 2.8T 규모를 실제로 학습·serve하기 위한 sparse MoE 운영이다. Moonshot은 Stable LatentMoE에서 총 896 expert 중 16개를 효과적으로 활성화한다고 밝힌다. 여기에 router-score quantile로 allocation을 정하는 Quantile Balancing, attention head별 최적화를 내세우는 Per-Head Muon, SiTU, Gated MLA를 함께 언급한다. K2 대비 약 **2.5× scaling efficiency**를 얻었다는 수치는 공식 런치 페이지의 주장이다. 아직 technical report가 없으므로, exact active-parameter count, training FLOPs, data mixture, ablation과 같은 재현 가능한 근거는 공개되지 않았다.

| 구성 | 공식 공개 자료가 말하는 내용 | 실무적 의미 |
|---|---|---|
| 규모·문맥 | 2.8T parameters, 1M-token context | 큰 codebase·document corpus·long tool trace를 한 작업 안에 유지하려는 방향 |
| 모달리티 | native vision, API의 image·video input | 스크린샷·파일·video를 agent input으로 넣을 수 있음 |
| sparse routing | 896 experts 중 효과적으로 16개 활성화 | 총 parameter 크기와 step당 계산량을 분리하려는 MoE 설계 |
| training·serve | QAT부터 MXFP4 weights / MXFP8 activations, 64+ accelerator supernode 권장 | full-weight 공개 뒤에도 일반 단일-node local inference와는 거리가 있을 가능성 |
| serving | KDA prefix-cache 구현을 vLLM community에 기여 예정이라고 설명 | long context의 비용은 model architecture뿐 아니라 cache implementation에 좌우됨 |

API contract는 이 architecture story보다 더 즉시적이다. K3는 OpenAI-compatible Chat Completions에서 `model="kimi-k3"`로 호출한다. reasoning은 항상 활성화되어 있으며 지금은 `max`만 지원한다. multi-turn 및 tool-call loop에서는 이전 assistant message 전체를 다음 request에 그대로 돌려줘야 하고, `content`만 남기면 안 된다. 기본 `max_completion_tokens`는 131,072이며 최대 1,048,576까지 설정할 수 있다. `temperature=1.0`, `top_p=0.95`, `n=1` 등은 고정값이라 요청에서 생략하라고 API 문서가 안내한다.

이 제약은 모델 사용의 작은 구현 detail이 아니다. K3가 stored reasoning history를 포함한 long-running agent runtime을 전제한다는 뜻이다. 기존 session에서 다른 model을 K3로 중간 교체하거나, harness가 완전한 assistant history를 되돌려주지 않으면 generation quality가 불안정해질 수 있다고 런치 페이지도 경고한다.

## 공개된 근거에서 확인되는 점

### API·제품 표면은 이미 열려 있다

K3는 Kimi.com, Kimi Work, Kimi Code, Kimi API에서 쓸 수 있다고 공식 런치 페이지가 명시한다. Kimi Code 페이지도 “K3 is now available” 및 최대 1M context를 안내한다. API 가격은 cache-hit input **$0.30/MTok**, cache-miss input **$3.00/MTok**, output **$15.00/MTok**으로 제시된다. Moonshot은 coding workload에서 cache-hit rate가 90% 이상이라고 설명하지만, 이 값은 제공사 workload에 대한 주장이지 모든 application의 보장치가 아니다.

또한 K3 API 문서는 strict JSON Schema structured output, `tool_choice`, dynamic tool loading, partial mode를 지원한다고 밝힌다. 반면 official tools의 web search는 업데이트 중이라 가까운 시점의 production workflow에는 권장하지 않는다고도 적는다. “agentic”이라는 말이 다양한 기능을 뜻해도, 개별 tool의 성숙도는 다를 수 있다는 점을 보여 주는 좋은 caveat다.

### 코딩 benchmark: 상위권이지만 모든 행의 1위는 아니다

공식 benchmark table의 K3 결과는 max thinking effort, temperature 1.0, top-p 1.0으로 보고됐다. 이 값은 API quickstart의 고정 `top_p=0.95` 설명과 다른데, benchmark harness setting과 product API default를 혼동하지 말아야 한다. 또한 비교 모델은 benchmark에 따라 KimiCode·Claude Code·Codex 등 서로 다른 harness를 썼고, Claude Fable 5에는 fallback, GPT-5.6 Sol에는 cyberguard가 포함될 수 있다고 공식 figure가 명시한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kimi-k3-benchmark-1.webp"
    alt="Kimi K3와 Claude Fable 5, GPT-5.6 Sol, Claude Opus 4.8, GLM-5.2의 코딩 benchmark를 비교한 Moonshot AI 공식 figure"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Moonshot AI 공식 coding benchmark figure. 모든 K3 값은 max thinking effort 기반이며, Fable 5의 fallback·GPT-5.6 Sol의 cyberguard 가능성 등 harness 차이가 figure와 footnote에 함께 표기돼 있다.
  </figcaption>
</figure>

| Benchmark | Kimi K3 | Claude Fable 5 | GPT-5.6 Sol | 읽는 법 |
|---|---:|---:|---:|---|
| DeepSWE | 67.5 | 70.0 | 73.0 | K3는 근접하지만 이 행의 최고점은 아님 |
| Program Bench | **77.8** | 76.8 | 77.6 | 세 모델이 매우 가깝게 보고됨 |
| Terminal-Bench 2.1 | 88.3 | 84.6 | **88.8** | terminal agent setting에서 상위권 경쟁 |
| FrontierSWE | 81.2 | **86.6** | 71.3 | K3가 GPT-5.6 Sol보다 높지만 Fable 5보다 낮음 |
| SWE Marathon | **42.0** | 35.0 | 39.0 | 장기 coding benchmark에서 K3가 공식 표의 최고점 |
| MLS Bench | 48.3 | **49.9** | 46.2 | research-oriented coding에서도 근접하되 선두는 아님 |

이 표가 말하는 가장 안전한 결론은 “K3가 frontier coding agent table에 들어왔다”이다. 여러 행에서 proprietary competitor에 근접하거나 앞서지만, DeepSWE·Terminal-Bench·FrontierSWE·MLS Bench를 모두 이긴 것은 아니다. Moonshot 자신도 K3의 overall performance가 가장 강한 proprietary model을 아직 뒤따른다고 쓴다. 따라서 이 release는 단일 champion score보다 **큰 long-context MoE를 agent harness로 연결했을 때의 경쟁력**으로 보는 편이 정확하다.

### knowledge work·vision도 넓지만, internal score를 따로 구분해야 한다

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kimi-k3-benchmark-2.webp"
    alt="Kimi K3와 경쟁 모델의 agentic, reasoning, vision benchmark를 비교한 Moonshot AI 공식 figure"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Moonshot AI 공식 agentic·reasoning·vision benchmark figure. GDPval-AA v2, BrowseComp, Automation Bench, GPQA-Diamond, MMMU-Pro 등 공개·외부 성격의 benchmark와 internal benchmark가 함께 포함돼 있어 행별 provenance를 분리해 읽어야 한다.
  </figcaption>
</figure>

Agentic 쪽에서 K3는 BrowseComp 91.2, Automation Bench 30.8, MCP Atlas 84.2, SpreadsheetBench 2 34.8로 보고된다. reasoning에서는 GPQA-Diamond 93.5, HLE-Full 43.5, tools를 쓴 HLE-Full 56.0이고, vision에서는 MMMU-Pro 81.6, MathVision 94.3, OmniDocBench 91.1이 공식 표에 있다. 이 중 Kimi Code Bench 2.0과 DECK-Bench는 내부 benchmark라고 명시되어 있으며, GDPval-AA v2·AA-Briefcase는 Artificial Analysis에서 인용한 Elo score다. 한 장의 leaderboard로 합치지 말고 공개 benchmark, 외부 aggregator, internal evaluation을 구분해야 한다.

### ‘open’이라는 말의 현재 상태

공식 release surface를 확인하면 K3는 아직 완전한 open-weight package가 아니다.

| 표면 | 확인 결과 | 해석 |
|---|---|---|
| Kimi 런치 페이지 | full weights와 technical report를 7월 27일 공개 예정으로 안내 | architecture·training·evaluation의 독립 검증은 아직 제한적 |
| Kimi API docs | `kimi-k3` 호출, vision/video, tool-call, context caching 문서화 | API product는 실제로 접근 가능한 표면 |
| Hugging Face official author API | `author=moonshotai&search=K3` 결과가 빈 배열 | 확인 시점에는 공식 K3 model card/weights가 보이지 않음 |
| MoonshotAI public GitHub org | K3 이름의 공개 repository가 확인되지 않음 | code·inference reference·technical report repo도 아직 공개 표면이 아님 |

이 구분은 부정적인 평가가 아니라 release maturity의 정확한 표현이다. API에서 모델을 사용하는 것과, weights·license·checkpoint format·reference inference·evaluation protocol을 내려받아 검증하는 것은 다른 단계다. K3는 첫 단계를 먼저 열었고 두 번째 단계를 약속했다.

## 실무 관점에서의 해석

K3의 가장 흥미로운 점은 2.8T라는 headline보다 **long-context agent를 운영하는 방식을 제품 계약으로 밀어 넣었다**는 데 있다. K3의 1M context는 단순히 큰 input limit가 아니다. cacheable prefix를 유지하라는 문서, full assistant message를 보존하라는 multi-turn 규칙, reasoning을 항상 켜는 모델 mode, Kimi Code·Kimi Work라는 host product가 함께 있을 때만 실제 작업 흐름이 된다.

도입 판단은 세 갈래로 나뉜다.

| 목적 | 지금 가능한 경로 | 먼저 검증할 질문 |
|---|---|---|
| API 기반 coding agent | Kimi API 또는 Kimi Code | history preservation·tool schema·max-only reasoning 비용이 현재 harness와 맞는가 |
| knowledge-work desktop agent | Kimi Work | local-file/browser/cron 권한과 approval model을 조직 정책에 맞출 수 있는가 |
| self-host·fine-tune·reproducible research | 아직 대기 | weights, license, technical report, inference recipe, hardware requirement이 실제로 공개되는가 |

특히 “open 3T-class”라는 표현을 self-host 가능하다는 말로 번역하면 안 된다. 64+ accelerator supernode 권장, KDA prefix cache 구현의 별도 필요성, full weights와 report의 미공개 상태는 모두 큰 모델을 실제로 운영하기 위한 기술·인프라 조건이 아직 열려 있지 않다는 신호다. 현재는 API를 통해 capability를 평가할 수 있는 시점이며, open-weight ecosystem이 실제로 형성됐는지는 후속 release를 보고 판단해야 한다.

K3는 Kimi K2.7 Code가 밀었던 “모델 + Kimi Code + API” 방향을 한 단계 더 큰 scale과 더 긴 context로 연장한다. 다만 이번에는 모델 카드보다 product page가 먼저 왔다. 이 순서는 Moonshot이 K3를 일반 purpose checkpoint보다 **agent runtime의 backbone**으로 포지셔닝한다는 뜻일 수 있다. technical report와 weights가 공개된 뒤에는 KDA·AttnRes·Stable LatentMoE의 약속이 실제 training recipe와 serving cost로 이어지는지, 그리고 third-party inference stack이 1M context를 어느 수준까지 재현하는지가 진짜 검증 항목이 될 것이다.

Sources: https://www.kimi.com/blog/kimi-k3, https://www.kimi.com/blog/, https://platform.kimi.ai/docs/guide/kimi-k3-quickstart, https://www.kimi.com/code, https://www.kimi.com/products/kimi-work, https://huggingface.co/api/models?author=moonshotai&search=K3, https://api.github.com/orgs/MoonshotAI/repos?per_page=100&type=all
