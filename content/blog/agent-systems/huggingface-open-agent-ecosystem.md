---
title: "Hugging Face Open Agent Ecosystem은 에이전트가 모델을 고르고 학습하는 Hub를 만든다"
date: "2026-05-16T20:34:37"
description: "Merve Noyan의 AI Engineer 발표는 Hugging Face Hub가 모델 저장소를 넘어, 오픈 모델 탐색·Inference Providers·traces·skills·MCP·Jobs를 묶어 에이전트가 직접 모델을 선택하고 학습 작업을 실행하는 런타임으로 확장되는 흐름을 보여준다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Hugging Face
  - AI Agents
  - Open Models
  - Agent Systems
  - Model Training
  - Inference Providers
  - MCP
  - YouTube
draft: false
---

AI 에이전트 논의는 자주 “어떤 모델이 가장 똑똑한가”에서 시작한다. 하지만 실제로 에이전트를 매일 쓰게 되면 더 중요한 질문은 조금 다르다. 모델을 어디서 찾고, 어떤 벤치마크로 고르고, 어디서 실행하고, 실패한 실행 로그를 어디에 남기며, 필요하면 어떻게 다시 학습시킬 것인가.

Merve Noyan의 AI Engineer 발표 **`Your Agent Can Now Train Models`**는 Hugging Face가 이 질문에 답하려는 방향을 보여준다. 여기서 Hub는 단순한 모델/데이터셋 저장소가 아니다. 오픈 모델, Inference Providers, benchmark datasets, agent traces, HF CLI skills, MCP, Jobs, Buckets가 한 묶음으로 연결되면서, 에이전트가 직접 모델을 고르고 실험을 시작할 수 있는 운영 표면이 된다.

핵심은 “에이전트에게 Hugging Face를 붙인다”가 아니다. 더 정확히는 **모델 선택, 실행, 학습, 로그 축적, 데이터 처리까지 에이전트가 호출 가능한 Hub primitive로 바꾸는 것**이다.

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/OV56RddyFuU"
    title="Your Agent Can Now Train Models — Merve Noyan, Hugging Face"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

이 영상은 AI Engineer 채널에 2026-05-13 업로드된 약 19분 길이의 발표다. 발표자는 Hugging Face 오픈소스 팀의 **Merve Noyan**이며, YouTube 설명란과 transcript는 발표 주제를 “open agent ecosystem”과 “having an AI engineer at your fingertips”로 잡는다.

공식 chapters가 제공되어 있어 흐름은 비교적 분명하다. 발표는 오픈소스/오픈웨이트 모델의 의미에서 시작해, Hub의 모델·데이터셋 탐색, Inference Providers, 로컬 코딩 에이전트, Hermes Agent, traces repository, HF skills, MCP, Jobs 기반 처리 사례로 이어진다.

이 글은 YouTube metadata와 transcript, 공식 chapter, 영상에서 추출한 주요 슬라이드 프레임, 그리고 Hugging Face 공식 문서 중 Inference Providers, HF CLI for AI Agents, Jobs, Dataset Viewer 문서를 함께 확인해 정리했다.

## 핵심 아이디어: Hub가 에이전트의 작업면이 된다

발표의 중심축은 Hugging Face Hub를 “사람이 웹에서 모델을 찾는 사이트”가 아니라 “에이전트가 호출할 수 있는 작업면”으로 재해석하는 데 있다.

초반부에서 Merve는 오픈 모델의 실용적 이점을 privacy, quantization, fine-tuning, edge/browser deployment와 연결한다. 발표 당시 슬라이드는 Artificial Analysis index에서 오픈 모델이 폐쇄 모델과 경쟁하는 장면을 보여 주고, 설명란도 GLM 5.1 같은 오픈 모델이 intelligence index 상위권에 올라왔다는 맥락을 강조한다.

하지만 글의 더 중요한 지점은 성능 순위가 아니다. 오픈웨이트 모델을 갖고 있으면 에이전트가 단순히 API를 호출하는 데서 멈추지 않고, 필요하면 더 작은 포맷으로 줄이고, 로컬에서 실행하고, 특정 데이터셋으로 fine-tune하고, 그 실행 흔적을 다시 학습 데이터로 쌓을 수 있다. 즉 오픈 모델은 에이전트에게 **실행 가능한 재료**가 된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/hf-open-agent-hub-meets-agent.webp"
    alt="Slide titled The Hub meets your agent, showing MCP Server, HF CLI, Skills, and Local Agents"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    06:10 전후 슬라이드. 발표는 Hugging Face Hub와 에이전트를 연결하는 표면을 MCP Server, HF CLI, Skills, Local Agents 네 갈래로 정리한다.
  </figcaption>
</figure>

이 장면이 발표 전체를 가장 잘 압축한다. Hub는 모델 카탈로그이고, Inference Providers는 실행 경로이며, benchmark datasets는 선택 기준이고, traces는 실행 데이터 저장소이며, skills와 MCP는 에이전트가 그 기능들을 사용할 수 있게 해 주는 인터페이스다.

## 오픈 모델 탐색에서 실행까지: 선택 기준이 Hub 안으로 들어온다

발표 초반의 Hub 데모는 모델 수가 많아졌을 때 생기는 문제를 다룬다. 모델이 많다는 것은 선택지가 많다는 뜻이지만, 동시에 “무엇을 골라야 하는가”라는 운영 문제가 커진다는 뜻이기도 하다.

Merve는 Hub의 models 페이지에서 agentic models와 vision-language models를 필터링하고, datasets 쪽의 benchmark button을 통해 SWE-bench, Humanity's Last Exam, AIME 같은 benchmark datasets로 모델을 비교하는 흐름을 보여 준다. 발표의 해석은 명확하다. 에이전트에 넣을 모델을 고르는 일이 더 이상 블로그 글이나 별도 리더보드 탐색만의 문제가 아니라, Hub UI와 데이터셋 뷰어 안에서 직접 이루어지는 workflow가 되어 간다는 것이다.

Hugging Face Dataset Viewer 문서도 이 방향을 뒷받침한다. Dataset Viewer는 Hub datasets를 미리 처리해 table, split, column, row, search, filter, statistics, parquet 접근을 제공한다고 설명한다. 즉 benchmark dataset은 사람이 눈으로 보는 표이면서, 동시에 agent나 script가 API로 소비할 수 있는 구조화된 평가 표면이 된다.

여기에 Inference Providers가 붙으면 다음 단계가 생긴다. Hugging Face 문서는 Inference Providers를 “수백 개 모델을 여러 inference provider 위에서 일관된 API로 접근하게 하는 레이어”로 설명하고, OpenAI-compatible API, Python/JavaScript SDK, provider policy를 제공한다고 적는다. 특히 model id 뒤에 `:fastest`, `:cheapest`, `:preferred` 같은 suffix를 붙여 provider selection policy를 바꿀 수 있다는 점은 에이전트 시스템에 중요하다.

사람이 “가장 싸게 돌려 봐”, “latency가 제일 낮은 쪽으로 실행해”, “우리 preference order를 따라가”라고 지시하면, 에이전트는 추상적인 provider 비교가 아니라 실제 API 표면을 통해 그 선택을 실행할 수 있다.

## 로컬 에이전트와 Hermes: 모델이 내 인프라 안으로 내려올 때

발표 중반에는 로컬 코딩 에이전트 이야기가 나온다. Merve는 `pi`, `llama-agent`, `llama.cpp` 같은 경로를 언급하며, Hugging Face model id를 받아 로컬 모델을 agent loop에 붙이는 흐름을 설명한다.

여기서 중요한 것은 “로컬 실행도 가능하다”는 기능 목록이 아니다. 오픈웨이트 모델이 많아질수록, 에이전트 운영자는 cloud inference와 local serving 사이를 계속 오가게 된다. 민감한 데이터, 비용, latency, hardware availability, 실험 단계에 따라 실행 위치가 달라진다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/hf-open-agent-hermes-local-agents.webp"
    alt="Slide titled Local self-improving agents, showing Hermes Agent setup with Inference Providers or local served endpoint"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    07:50 전후 슬라이드. Merve는 Hermes Agent를 self-improving local agent의 예로 들며, Inference Providers 또는 로컬 served endpoint와 연결할 수 있다고 설명한다.
  </figcaption>
</figure>

Hermes Agent를 언급하는 대목도 이 맥락에 있다. 발표자는 Hermes Agent의 memory management와 self-improvement를 강하게 추천하고, Hugging Face Inference Providers 또는 로컬 endpoint와 함께 쓸 수 있다고 말한다. 이는 “에이전트 앱”과 “모델 서빙”이 분리된 두 세계가 아니라는 뜻이다.

에이전트가 장기 메모리와 skills를 갖고 있고, 모델은 필요에 따라 GLM, Gemma, MiniMax, GGUF local model 등으로 바뀔 수 있다면, 시스템 설계의 핵심은 특정 모델 하나가 아니라 **모델을 교체 가능한 실행 자원으로 다루는 agent runtime**이 된다.

## Traces: 에이전트 실행 로그가 다시 데이터셋이 된다

가장 흥미로운 부분 중 하나는 traces repository다. 발표에 따르면 Hugging Face Hub는 Codex, Claude Code, pi 같은 에이전트 실행 traces를 올리고 탐색할 수 있는 새로운 dataset repository type을 제공한다. Dataset Viewer에서 traces column을 클릭하면 세션이 파싱되어 보이고, 나중에는 그 데이터를 모델 학습에도 사용할 수 있다는 설명이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/hf-open-agent-traces-dataset.webp"
    alt="Slide saying Hub hosts your agent traces, showing a dataset-style traces repository on Hugging Face Hub"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    09:28 전후 슬라이드. 에이전트 세션 로그를 Hub의 dataset-like repository로 올리고 탐색하는 traces 흐름이 소개된다.
  </figcaption>
</figure>

이 기능의 의미는 단순 저장소보다 크다. 에이전트 시스템에서 가장 가치 있는 데이터는 성공/실패가 섞인 실제 실행 궤적이다. 어떤 prompt가 들어갔고, 어떤 tool call을 했고, 어떤 오류를 만났고, 사람이 어디서 개입했는지가 모두 학습 가능한 운영 데이터가 된다.

물론 여기에는 privacy와 secret filtering 문제가 반드시 따라온다. 실행 trace에는 API key, 내부 repo 경로, 사용자 데이터, 실패 로그가 섞일 수 있기 때문이다. 따라서 traces를 “모델 학습용 금광”으로만 보면 위험하다. 더 정확한 해석은, agent ops가 점점 **데이터셋 관리 문제**로 바뀐다는 것이다. 저장, 익명화, 필터링, 샘플링, 평가 split이 모두 중요해진다.

## Skills와 MCP: 에이전트가 Hub 기능을 실제로 호출하는 인터페이스

발표 후반의 핵심은 skills다. Hugging Face의 `hf` CLI 문서는 “AI agents와 함께 CLI를 쓴다면 Skill을 설치하라”고 안내하고, `hf skills add --global`, Claude Code용 `hf skills add --claude --global` 같은 명령을 제시한다. 이 skill은 로컬에 설치된 CLI 버전을 기준으로 생성되므로 최신 command surface를 agent에게 알려 주는 역할을 한다.

문서가 말하는 범위도 발표와 맞물린다. HF CLI for AI Agents 문서는 agent가 CLI를 통해 models 검색, datasets/buckets 관리, Spaces launch, Jobs 실행을 할 수 있다고 설명한다. 발표에서 Merve가 보여 준 “Hub를 에이전트에게 붙인다”는 말은 결국 이런 CLI/skill/MCP 표면이 있어야 실제 작업이 된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/hf-open-agent-skills-action.webp"
    alt="Slide titled Skills in action, showing a prompt to train Qwen2-VL on llava-instruct-mix and a terminal running an agent job"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    13:48 전후 장면. 발표의 live demo는 “Qwen2-VL을 LLaVA-Instruct-Mix에 학습시켜 달라”는 식의 지시가 infrastructure 질문, VRAM 계산, job 실행으로 이어지는 흐름을 보여 준다.
  </figcaption>
</figure>

이 데모는 발표 제목의 의미를 직접 보여 준다. 사용자는 “이 모델을 이 데이터셋으로 학습해 줘”라고 말한다. 그러면 agent는 필요한 instance 선택, VRAM 요구량, validation split, batch size 같은 질문을 하고, 적절한 job을 시작한다. 발표자는 이를 “napkin math”를 에이전트가 대신 처리하는 장면으로 설명한다.

여기서 주의할 점은, 이게 “한 문장으로 모든 모델 학습이 자동화됐다”는 뜻은 아니라는 것이다. 좋은 dataset, 올바른 objective, evaluation, 비용 통제, 결과 검증은 여전히 필요하다. 그러나 반복적인 인프라 산수와 boilerplate job setup이 agent-callable skill로 내려오면, 연구자나 엔지니어는 더 높은 수준의 실험 질문에 집중할 수 있다.

## Jobs와 OCR 사례: Hub primitive를 묶으면 데이터 처리 파이프라인이 된다

마지막 사례는 30,000개 AI paper를 OCR 처리한 workflow다. 발표자는 Hugging Face Hub의 papers 중 markdown이 없는 paper를 indexing/query에 쓰기 위해, Codex, open OCR models, Jobs를 통해 대량 OCR을 수행한 사례를 소개한다.

흐름은 단순하다. 먼저 OCR 모델을 고른다. 그다음 LLM에게 processing job을 kick off하게 하고, 필요한 script를 작성하게 한다. 이후 Hugging Face infra에서 job을 실행하고, skill이 instance와 model hosting을 설정한다. 발표자는 이 과정에서 agent가 instance와 비용을 계산한다고 설명한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/hf-open-agent-ocr-papers-case.webp"
    alt="Slide titled tying it all together, showing how Hugging Face OCRed 30,000 papers using Codex, open OCR models and Jobs"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    16:40 전후 장면. 발표는 Codex, open OCR models, Jobs를 묶어 30,000개 paper를 OCR 처리한 사례를 “tying it all together”로 제시한다.
  </figcaption>
</figure>

Hugging Face Jobs 문서는 Jobs를 AI/data workflow용 compute로 설명한다. `hf` CLI, Python client, HTTP API로 실행할 수 있고, CPU부터 A100·TPU까지 지원하며, 사용한 초 단위로 과금되는 pay-as-you-go 모델이라는 점도 명시한다. 이 문서적 정의를 발표 사례에 대입하면, Jobs는 agent가 “모델을 호출하는” 수준을 넘어 “데이터 처리 작업을 실제 infra 위에 띄우는” 실행 단위가 된다.

발표 말미에는 Buckets도 언급된다. 장기 실행이나 반복 처리에서는 결과물을 저장하고 다시 붙이는 storage primitive가 필요하다. 즉 모델, 데이터셋, job, bucket, trace가 각각 따로 존재하는 것이 아니라, 에이전트가 호출하는 하나의 workflow graph로 연결된다.

## 타임라인으로 보는 핵심 구간

| 구간 | 핵심 장면 | 의미 |
|---|---|---|
| 00:15~02:36 | 오픈소스/오픈웨이트 모델의 차이와 privacy, quantization, fine-tuning | 오픈 모델은 API 대체제가 아니라 조작 가능한 실행 자산이라는 프레임 제시 |
| 02:36~05:16 | Hub models, agentic models, VLM, benchmark datasets | 모델 선택이 leaderboard 탐색에서 Hub 내부 workflow로 이동 |
| 05:16~06:50 | Inference Providers와 MCP/skills/local agents 개요 | 모델 실행, provider routing, agent interface가 하나의 생태계로 묶임 |
| 06:50~09:20 | 로컬 코딩 에이전트와 Hermes Agent | cloud inference와 local serving을 오가며 agent runtime을 구성하는 방향 |
| 09:20~10:22 | Hub hosts your agent traces | 에이전트 실행 로그가 dataset-like artifact가 되고, 향후 학습/분석 자원이 됨 |
| 10:22~12:07 | GGUF, local app compatibility, `use this model` | 로컬 실행 가능성을 Hub model page 안에서 판단하도록 만드는 흐름 |
| 12:07~13:41 | HF CLI Skill, LLM trainer, Gradio, Dataset skills | agent가 Hub 기능을 실제 명령으로 호출할 수 있게 하는 skill layer |
| 13:41~14:41 | Qwen2-VL fine-tuning demo | 모델 학습 job setup의 VRAM/instance/validation 질문을 agent가 처리 |
| 15:00~16:30 | MCP로 models, datasets, spaces, jobs 호출 | Hub 기능을 LLM tool surface로 노출하는 방향 |
| 16:30~18:50 | 30,000개 paper OCR 처리 사례 | Codex, open OCR model, Jobs, Buckets가 데이터 처리 pipeline으로 연결됨 |

## 영상과 연결 자료에서 확인되는 점

확인 가능한 사실을 나누면 다음과 같다.

| 근거 | 확인되는 내용 | 해석 |
|---|---|---|
| YouTube metadata | 제목은 `Your Agent Can Now Train Models — Merve Noyan, Hugging Face`, 채널은 AI Engineer, 업로드일은 2026-05-13 | Hugging Face agent ecosystem을 소개하는 짧은 컨퍼런스 발표 |
| Transcript/chapters | open models, Hub overview, benchmark datasets, Inference Providers, local agents, Hermes, traces, skills, MCP, OCR+Jobs 순서로 진행 | 제품 하나의 launch라기보다 Hub 전체를 agent runtime으로 묶는 ecosystem talk |
| Hugging Face Inference Providers docs | 여러 provider를 단일 API/SDK로 접근하고, `:fastest`, `:cheapest`, `:preferred` policy를 제공 | agent가 비용/속도/선호도 기준으로 provider routing을 실행할 수 있는 표면 |
| HF CLI for AI Agents docs | `hf skills add`, `hf skills add --claude`로 agent용 CLI skill 설치 가능 | CLI command surface를 agent가 이해 가능한 skill로 배포하는 방식 |
| Hugging Face Jobs docs | Jobs는 AI/data workflow compute이며 CLI/Python/API로 실행, CPU~A100/TPU와 초 단위 과금 지원 | fine-tuning, inference, data processing을 agent가 실행할 수 있는 infra primitive |
| Dataset Viewer docs | Hub datasets를 table/search/filter/statistics/parquet/API로 접근 가능 | benchmark datasets와 traces를 사람이 보는 UI이자 agent가 쓰는 데이터 표면으로 만들 수 있음 |

다만 영상의 일부 표현은 발표 당시의 product/roadmap 톤을 포함한다. 예를 들어 traces repository type, Hermes traces 지원 예정, MCP dynamic spaces 같은 대목은 영상에서 소개된 흐름을 기준으로 읽어야 한다. 실제 조직에 도입할 때는 권한, 비용 한도, secret filtering, 실행 job의 승인 단계, 데이터셋 license를 별도로 점검해야 한다.

## 실무 관점에서의 해석

이 발표의 가치는 “Hugging Face에 기능이 많다”는 소개보다 넓다. 에이전트 시스템이 유용해지려면 모델 호출 하나만으로는 부족하고, 주변 운영 자원이 모두 tool-callable해야 한다는 점을 잘 보여 준다.

첫째, 모델 선택은 이제 agent workflow의 일부가 된다. benchmark datasets와 model filters가 Hub 안에 있고, Inference Providers가 실행 경로를 제공하면, agent는 “모델을 골라 봐”라는 지시를 실제 탐색·비교·실행으로 바꿀 수 있다.

둘째, fine-tuning과 data processing은 점점 promptable infrastructure가 된다. 물론 좋은 실험 설계는 사람이 해야 하지만, job script 작성, instance sizing, provider 선택, 결과 저장 같은 반복 작업은 skill과 Jobs가 맡을 수 있다. 이 변화는 작은 팀이나 개인 연구자에게 특히 크다.

셋째, traces가 중요해진다. 에이전트 실행이 늘어날수록, 가장 값비싼 데이터는 성공한 답변 그 자체보다 실행 과정이다. 어떤 tool을 불렀는지, 어디서 실패했는지, 어떤 human intervention이 있었는지가 다음 모델과 다음 skill을 개선하는 원료가 된다.

넷째, 로컬과 클라우드의 경계가 흐려진다. 어떤 작업은 Inference Providers로 빠르게 돌리고, 어떤 작업은 GGUF/MLX/llama.cpp로 로컬에서 처리하며, 어떤 작업은 Jobs로 remote GPU를 띄운다. 에이전트 런타임은 이 실행 위치들을 바꿔 끼우는 orchestration layer가 된다.

## 남는 질문

가장 큰 질문은 안전한 자동화 경계다. “에이전트가 모델을 학습한다”는 문장은 매력적이지만, 실제로는 dataset 품질, license, 비용 한도, GPU quota, 결과 모델의 evaluation, 잘못된 trace 업로드, secret leakage 같은 문제가 붙는다.

따라서 실무 도입의 첫 단계는 모든 것을 자동화하는 것이 아니라, 반복적이고 실패 비용이 낮은 부분부터 skill로 내리는 것이다. 예를 들면 benchmark dataset 검색, 후보 모델 shortlist, provider별 비용 비교, job dry-run, trace 정리, OCR batch의 작은 샘플 처리 같은 경로가 안전한 시작점이다.

그럼에도 방향은 분명하다. Hugging Face가 보여 주는 open agent ecosystem은 모델 저장소의 다음 형태가 무엇인지 보여 준다. 앞으로의 Hub는 사람이 파일을 다운로드하는 장소가 아니라, 에이전트가 모델을 찾고, 실행하고, 학습하고, 결과와 traces를 다시 축적하는 **실험 운영체제**에 가까워질 가능성이 크다.

Sources: https://www.youtube.com/watch?v=OV56RddyFuU, https://huggingface.co/docs/inference-providers/index, https://huggingface.co/docs/hub/agents-cli, https://huggingface.co/docs/hub/jobs, https://huggingface.co/docs/dataset-viewer/index, https://huggingface.co/docs/huggingface_hub/guides/cli
