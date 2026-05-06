---
title: "DeepSeek-V4-Pro는 1M 컨텍스트를 49B 활성 경로로 밀어붙인다"
date: "2026-05-06T09:15:33"
description: "DeepSeek-V4-Pro는 1.6T total / 49B activated MoE와 CSA·HCA 하이브리드 attention, mHC, Muon optimizer를 결합해 1M 토큰 문맥에서 추론 비용과 KV-cache를 크게 줄이면서도 코딩·추론·에이전트 성능을 함께 끌어올리려는 공개 모델이다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - DeepSeek
  - MoE
  - Long Context
  - Agents
  - Reasoning
draft: false
---

요즘 오픈 모델 경쟁은 단순히 “누가 더 큰 점수를 찍었는가”보다, 긴 문맥과 에이전트형 작업을 얼마나 실제 비용 구조 안에서 처리하느냐로 무게중심이 이동하고 있다. reasoning benchmark에서 강한 모델은 많아졌지만, 1M 토큰 같은 초장문 문맥, 코드 작업, 툴 사용, 그리고 배포 가능한 추론 효율까지 동시에 맞추는 모델은 여전히 드물다. 특히 long-context 성능은 종종 홍보 문구로는 크게 보이지만, 실제 inference FLOPs나 KV-cache 비용까지 같이 공개되는 경우는 많지 않다.

DeepSeek-V4-Pro는 바로 그 지점을 전면에 내세운다. Hugging Face 모델 카드 기준으로 이 모델은 DeepSeek-V4 시리즈의 Pro 버전으로, 1.6T total parameter와 49B activated parameter를 가진 MoE 모델이며 1M tokens context를 지원한다. 핵심은 단순히 큰 모델이라는 사실이 아니라, CSA(Compressed Sparse Attention)와 HCA(Heavily Compressed Attention)를 결합한 하이브리드 attention, mHC(Manifold-Constrained Hyper-Connections), 그리고 Muon optimizer를 묶어 “길고 복잡한 문맥을 더 싸게 처리하는 대형 모델”을 노린다는 점이다.

또 하나 흥미로운 부분은 DeepSeek이 이 모델을 reasoning-only showcase로 밀지 않는다는 것이다. 모델 카드는 DeepSeek-V4-Pro-Max를 knowledge, coding, long-context, agentic benchmark 전반에서 open-source 최상위권으로 포지셔닝하고, inference/encoding 폴더까지 함께 제공해 로컬 실행 경로를 꽤 구체적으로 열어둔다. 즉 DeepSeek-V4-Pro는 논문용 스코어보드라기보다, frontier에 가까운 대형 오픈 모델을 실제 엔지니어링 스택 위에 올리려는 시도에 가깝다.

![DeepSeek-V4 performance overview](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/resolve/main/assets/dsv4_performance.png)

## 무엇을 해결하려는가

DeepSeek-V4-Pro가 겨냥하는 문제는 긴 컨텍스트 지원을 단순히 “토큰 수를 키웠다” 수준에서 끝내지 않는 것이다. 일반적으로 1M 토큰 문맥은 인상적인 숫자이지만, 실제 사용 단계로 가면 single-token inference FLOPs와 KV-cache가 너무 커져서 현실적인 운영 비용이 무너지는 경우가 많다. 결국 중요한 것은 몇 백만 토큰을 이론적으로 지원하는가가 아니라, 그 긴 문맥에서 얼마의 메모리와 계산량으로 움직이는가다.

모델 카드가 가장 강하게 주장하는 포인트도 바로 이 효율 문제다. DeepSeek은 DeepSeek-V4-Pro가 1M-token context setting에서 DeepSeek-V3.2 대비 single-token inference FLOPs를 27% 수준으로, KV cache는 10% 수준으로 낮춘다고 설명한다. 다시 말해 DeepSeek-V4-Pro는 “더 긴 문맥을 처리하는 더 큰 모델”이 아니라, 초장문 컨텍스트를 상대적으로 더 감당 가능한 비용 구조로 옮기려는 아키텍처 업데이트다.

동시에 이 모델은 long-context만 보는 것도 아니다. 공개 자료는 코딩, 지식, 수학, 에이전트 벤치마크를 함께 제시하고, reasoning effort mode를 Non-think / Think High / Think Max로 분리한다. 이는 DeepSeek-V4-Pro가 단일 모드의 정적 LLM이 아니라, 작업 난이도와 비용 사이에서 생각 budget을 조절하는 실전형 운영 모델을 지향한다는 뜻이기도 하다.

## 핵심 아이디어 / 구조 / 동작 방식

구조의 중심은 거대한 MoE backbone과 long-context 최적화 attention 조합이다. Hugging Face README에 따르면 DeepSeek-V4-Pro는 1.6T total / 49B activated parameter 구조를 쓰며, 같은 시리즈의 Flash 버전은 284B total / 13B activated parameter다. Pro와 Flash 모두 1M context를 지원하지만, Pro는 더 높은 활성 파라미터와 더 강한 상한 성능을 담당하는 포지션으로 배치된다.

핵심 설계는 세 가지다. 첫째, CSA와 HCA를 결합한 hybrid attention architecture다. DeepSeek은 이를 통해 1M 문맥에서 추론 FLOPs와 KV-cache를 동시에 줄인다고 주장한다. 둘째, mHC를 넣어 기존 residual connection을 강화함으로써 깊은 네트워크에서 신호 전달 안정성을 높인다. 셋째, Muon optimizer를 사용해 학습 수렴 속도와 안정성을 개선했다고 말한다. 즉 이 모델의 서사는 단순히 parameter scaling이 아니라, long-context inference와 large-scale training 안정성을 동시에 보강하는 시스템 레벨 패치에 가깝다.

훈련 파이프라인도 비교적 분명하다. 공개 자료는 32T 이상의 diverse, high-quality token으로 pre-training을 수행한 뒤, 두 단계 post-training을 쓴다고 설명한다. 먼저 SFT와 GRPO 기반 RL을 통해 domain-specific expert를 개별적으로 키우고, 이후 on-policy distillation으로 다양한 전문성을 하나의 모델에 통합한다. 이 구조는 MoE 내부의 전문가 다양성을 살리면서도 최종 사용 단계에서는 하나의 일관된 instruct model처럼 작동하게 하려는 설계로 읽힌다.

또 하나 실무적으로 중요한 차별점은 reasoning mode와 input encoding 방식이다. DeepSeek-V4-Pro는 Non-think, Think High, Think Max 세 모드를 제공하고, 각각 응답 속도와 분석 깊이를 조절한다. 다만 이 릴리스는 Jinja-format chat template를 바로 제공하지 않고, 대신 `encoding` 폴더에 OpenAI-compatible message를 입력 문자열로 바꾸는 Python 스크립트와 테스트 케이스를 제공한다. 즉 Hugging Face tokenizer만 바로 붙이면 끝나는 평범한 instruct release가 아니라, custom encoding/parsing 흐름을 이해해야 하는 모델이다.

| 구성 축 | 공개 자료에서 확인되는 내용 | 의미 |
|---|---|---|
| Model scale | 1.6T total / 49B activated MoE | 거대한 총규모와 제한된 활성 경로를 함께 쓰는 효율 지향 구조 |
| Long-context attention | CSA + HCA hybrid attention | 1M 문맥에서 FLOPs와 KV-cache를 줄이기 위한 핵심 장치 |
| Stability/optimization | mHC + Muon optimizer | 깊은 모델 학습 안정성과 수렴 효율 보강 |
| Post-training | SFT + RL(GRPO) + on-policy distillation | 전문가별 능력을 키운 뒤 하나의 instruct model로 통합 |
| Serving interface | reasoning modes + custom encoding folder | 단순 chat template보다 더 명시적인 입력/출력 제어 필요 |

## 공개된 근거에서 확인되는 점

Hugging Face API 기준으로 DeepSeek-V4-Pro 저장소는 2026-04-22에 생성되었고, 마지막 수정 시각은 2026-04-27T06:51:04Z다. 다운로드 수는 631,499, likes는 3,576으로 표시되며, 라이선스는 MIT다. 저장소에는 `DeepSeek_V4.pdf`, `encoding/`, `inference/`, `assets/dsv4_performance.png`, 그리고 64개 safetensors shard가 포함되어 있어, 단순 모델 카드 수준을 넘어 로컬 실행과 포맷 처리까지 어느 정도 함께 배포하고 있음을 보여준다.

기본 스펙 차원에서 DeepSeek-V4-Pro는 1.6T total / 49B activated, DeepSeek-V4-Flash는 284B / 13B로 명시된다. 두 모델 모두 1M context를 지원하고, Pro instruct 버전은 FP4 + FP8 mixed precision을 사용한다고 적혀 있다. 또한 README는 1M-token setting에서 DeepSeek-V4-Pro가 DeepSeek-V3.2 대비 single-token inference FLOPs는 27%, KV-cache는 10%만 필요하다고 주장한다. 이 수치는 단순 quality benchmark보다도 long-context serving economics를 전면에 둔 메시지다.

Base model 비교표를 보면 DeepSeek-V4-Pro-Base는 knowledge 계열에서 꽤 강한 개선을 보인다. 예를 들어 MMLU 90.1, MMLU-Redux 90.8, MMLU-Pro 73.5, C-Eval 93.1, Simple-QA verified 55.2, FACTS Parametric 62.6, LongBench-V2 51.5로 제시된다. V3.2-Base 대비 특히 MMLU-Pro, MultiLoKo, Simple-QA verified, FACTS Parametric, LongBench-V2 같은 항목에서 상승폭이 더 눈에 띈다. 반면 BigCodeBench는 59.2로 V3.2-Base의 63.9보다 낮아, base stage만 놓고 보면 모든 영역을 일방적으로 압도하는 것은 아니다.

Instruct/Think Max 비교에서는 포지셔닝이 더 선명하다. DeepSeek-V4-Pro-Max는 LiveCodeBench 93.5, Codeforces 3206, Apex Shortlist 90.2, SWE Verified 80.6, Terminal Bench 2.0 67.9, MCPAtlas Public 73.6, Toolathlon 51.8로 제시된다. 다만 모든 영역에서 최고는 아니다. 예를 들어 MMLU-Pro는 Gemini-3.1-Pro High 91.0이 더 높고, HLE는 Gemini 44.4가 앞서며, Terminal Bench 2.0은 GPT-5.4 xHigh 75.1이 더 높다. 즉 DeepSeek-V4-Pro-Max의 실제 그림은 “전방위 절대 1등”이라기보다, 코딩과 일부 에이전트 지표에서 매우 공격적이고, long-context와 reasoning에서는 closed frontier와 상당히 근접한 open model이라는 쪽이 더 정확하다.

Reasoning mode 비교도 유용하다. 같은 Pro 모델 안에서도 Non-think에서 Think High, Think Max로 갈수록 대부분의 지식·수학·agent benchmark가 크게 오른다. 예를 들어 HLE는 7.7 → 34.5 → 37.7, LiveCodeBench는 56.8 → 89.8 → 93.5, MRCR 1M은 44.7 → 83.3 → 83.5, Terminal Bench 2.0은 59.1 → 63.3 → 67.9로 제시된다. 이는 DeepSeek-V4-Pro를 단일 고정 모델이라기보다, 사고 budget을 늘릴수록 성능이 계단식으로 올라가는 controllable reasoning system으로 봐야 함을 시사한다.

| 항목 | 확인된 내용 | 해석 |
|---|---|---|
| 공개 범위 | HF 모델, PDF 리포트, encoding 코드, inference 코드 동시 공개 | 단순 가중치 배포보다 구현/운영 경로까지 일부 노출 |
| 핵심 효율 주장 | 1M context에서 V3.2 대비 FLOPs 27%, KV-cache 10% | long-context 비용 구조 자체를 차별점으로 전면화 |
| Base model 성능 | MMLU 90.1, MMLU-Pro 73.5, LongBench-V2 51.5 | 기본 모델 단계에서도 지식/장문 항목 개선이 큼 |
| Pro-Max 상한 | LiveCodeBench 93.5, Codeforces 3206, SWE Verified 80.6 | 코딩과 일부 에이전트 영역에서 매우 공격적인 포지션 |
| 인터페이스 특징 | Jinja chat template 없음, custom encoding folder 제공 | 실제 통합 시 입력 포맷 계층을 별도로 이해해야 함 |

## 실무 관점에서의 해석

내가 보기에 DeepSeek-V4-Pro의 가장 중요한 메시지는 “1M context를 지원한다”가 아니라 “1M context를 감당할 비용 구조를 모델 아키텍처 안에서 다시 설계했다”는 점이다. 실제 제품에서는 long-context capability보다 long-context cost가 먼저 병목이 되기 때문이다. CSA/HCA, mHC, Muon optimizer라는 키워드들은 결국 이 모델이 초장문 문맥에서의 계산·메모리 비용을 정면으로 다루고 있음을 보여준다.

또한 이 모델은 open-source 진영에서 거대 reasoning model의 운영 형태가 어떻게 바뀌는지도 드러낸다. 예전에는 instruct model 하나를 내고 끝났다면, 여기서는 Think High / Think Max 같은 effort mode가 명시되고, encoding/parsing 계층도 별도 코드로 제공된다. 이는 앞으로 frontier open model이 단순한 `AutoModelForCausalLM` 객체를 넘어서, 추론 budget과 인터페이스 규약을 함께 노출하는 방향으로 갈 수 있음을 시사한다.

물론 현실적인 장벽도 높다. 1.6T total parameter 모델은 오픈이라고 해도 대부분의 팀이 손쉽게 self-hosting할 수 있는 대상이 아니다. 게다가 custom encoding 경로와 별도 inference 가이드를 요구한다는 것은, 표준 chat-template 기반 모델보다 통합 난이도가 높다는 뜻이기도 하다. 일부 벤치마크에서는 closed frontier 모델이 여전히 앞서고, DeepSeek이 직접 제시한 수치 중심이라는 점도 감안해야 한다.

그럼에도 DeepSeek-V4-Pro는 방향성 면에서 매우 중요하다. 이 모델은 오픈 모델이 더 이상 “작은 비용의 대안”에 머무르지 않고, million-token context·reasoning control·agent benchmark까지 포함하는 대형 시스템으로 진화하고 있음을 보여준다. 특히 코딩과 장문 reasoning이 중요한 팀에게는, 단순 점수표 이상의 의미가 있다. 앞으로 오픈 모델 선택 기준이 parameter 수보다 “활성 경로 효율, reasoning mode 제어, long-context economics”로 이동할 수 있다는 신호이기 때문이다.

Sources: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro, https://huggingface.co/api/models/deepseek-ai/DeepSeek-V4-Pro, https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/raw/main/README.md, https://r.jina.ai/http://huggingface.co/deepseek-ai/DeepSeek-V4-Pro