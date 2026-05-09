---
title: "MiMo-V2.5는 1M 컨텍스트·오디오·에이전트를 한 모델로 묶는다"
date: "2026-05-06T09:06:03"
description: "Xiaomi의 MiMo-V2.5는 310B Sparse MoE에 비전·오디오 인코더와 에이전트 후학습을 결합해, 1M 컨텍스트와 네이티브 옴니모달 이해를 하나의 공개 모델로 밀어 넣은 릴리스다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - MiMo
  - Multimodal
  - Agents
  - Sparse MoE
  - Long Context
draft: false
---

최근 공개 모델 경쟁에서 흥미로운 변화는, 더 이상 “텍스트를 얼마나 잘 푸는가”만으로 모델을 설명하기 어려워졌다는 점이다. 실제 제품 환경에서는 코드 작업과 툴 사용, 이미지·문서 해석, 비디오 이해, 오디오 입력, 그리고 긴 컨텍스트를 한 시스템 안에서 함께 다뤄야 한다. 그동안 이런 요구를 만족시키는 방식은 대개 여러 특화 모델을 붙이거나, 폐쇄형 멀티모달 API에 의존하는 쪽에 가까웠다.

Xiaomi가 공개한 MiMo-V2.5는 이 흐름에 대해 꽤 분명한 답을 내놓는다. Hugging Face 모델 카드와 Xiaomi 공식 소개 페이지 기준으로, 이 모델은 310B total / 15B active의 Sparse MoE 구조 위에 전용 비전 인코더와 오디오 인코더를 얹고, 에이전트 후학습과 긴 컨텍스트 확장을 함께 밀어 넣은 네이티브 옴니모달 모델이다. 즉 “텍스트 LLM에 이미지 입력을 덧댄 모델”이라기보다, 시각·오디오·툴 사용·긴 문맥을 하나의 운영 surface로 통합하려는 릴리스에 가깝다.

특히 인상적인 점은 이 모델이 단순히 멀티모달 이해를 표방하는 데서 멈추지 않는다는 것이다. Xiaomi는 MiMo-V2.5를 agentic capability와 multimodal understanding을 동시에 끌어올린 모델로 포지셔닝하고 있으며, 공식 페이지에서는 Coding Agent, Claw-Eval, Terminal-Bench 2.0 같은 작업형 벤치마크와 이미지·비디오·문서 이해 벤치마크를 한 묶음으로 제시한다. 이 글은 MiMo-V2.5가 실제로 무엇을 공개했고, 어떤 기술적 선택을 묶었으며, 그 포지셔닝이 실무적으로 무엇을 뜻하는지 정리한다.

![MiMo-V2.5 Architecture](https://huggingface.co/XiaomiMiMo/MiMo-V2.5/resolve/main/assets/architecture.svg)

## 무엇을 해결하려는가

MiMo-V2.5가 겨냥하는 문제는 멀티모달 기능을 많이 붙인 모델을 하나 더 만드는 일이 아니다. 더 정확히는, 긴 컨텍스트 추론과 멀티모달 이해, 그리고 에이전트형 작업 수행이 각각 별도 모델이나 별도 제품으로 분리되는 현재의 운영 비용을 줄이려는 시도에 가깝다. 이미지와 문서를 이해하는 모델이 있다고 해도 terminal task나 coding workflow에서 약하면 실제 자동화 파이프라인은 다시 쪼개지고, 반대로 코드 에이전트가 강해도 비디오·오디오 입력을 네이티브로 다루지 못하면 제품 구성이 금세 복잡해진다.

공식 소개 페이지가 반복해서 강조하는 것도 바로 이 결합 문제다. Xiaomi는 MiMo-V2.5를 “native visual and audio understanding”과 “agentic capability”를 동시에 강화한 모델로 설명하며, 최대 1M 토큰 컨텍스트까지 한 모델 안에 넣었다고 말한다. 즉 이 모델이 풀려는 핵심 과제는 멀티모달 perception, long-context reasoning, tool-using workflow를 하나의 backbone과 하나의 post-training 체계로 묶는 것이다.

여기서 중요한 것은 단순한 스펙 합치기가 아니라 효율성이다. Xiaomi는 MiMo-V2.5의 언어 백본이 MiMo-V2-Flash의 hybrid sliding-window attention 구조를 계승한다고 밝히며, 이 설계가 KV-cache 부담을 크게 줄이면서도 긴 문맥 성능을 유지하도록 설계됐다고 주장한다. 결국 문제 설정은 “더 많은 모달리티를 넣는다”가 아니라, “실제로 서빙 가능한 비용 구조 안에서 더 많은 모달리티와 작업 유형을 한 모델로 수렴시킨다”에 가깝다.

## 핵심 아이디어 / 구조 / 동작 방식

구조적으로 MiMo-V2.5는 Sparse MoE 기반의 대형 backbone 위에 전용 멀티모달 인코더를 결합한 형태다. Hugging Face 모델 카드와 공식 블로그에 따르면 전체 파라미터는 310B, 활성 파라미터는 15B이며, 최대 컨텍스트 길이는 1M tokens다. 텍스트 backbone은 MiMo-V2-Flash에서 이어진 hybrid sliding-window attention 구조를 사용하고, 여기에 729M 규모의 Vision Transformer와 261M 규모의 audio encoder를 붙였다. 두 인코더는 lightweight projector를 통해 언어 모델과 연결된다.

이 모델의 설계에서 가장 눈에 띄는 부분은 attention과 추론 비용을 동시에 의식한 구성이다. 공식 README는 SWA(Sliding Window Attention)와 GA(Global Attention)를 5:1 비율로 interleave하고, window size 128을 사용한다고 설명한다. 이 조합은 KV-cache 저장량을 거의 6배 줄이면서도 learnable attention sink bias로 긴 문맥 성능을 유지하는 것이 목표다. 즉 MiMo-V2.5는 “1M context”를 단순 마케팅 문구로 올려둔 것이 아니라, 그 긴 컨텍스트를 감당하기 위한 memory-aware backbone을 전면에 둔다.

멀티모달 쪽에서는 네이티브 인코더 전략이 핵심이다. 비전 인코더는 28개 레이어 중 24개 SWA와 4개 full attention을 사용하는 729M ViT이고, 오디오 인코더는 MiMo-Audio-Tokenizer 가중치로 초기화된 261M Audio Transformer다. 여기에 3개의 MTP(Multi-Token Prediction) 모듈을 더해 speculative decoding과 RL 학습 효율을 높였다고 설명한다. 즉 이미지·비디오·오디오를 받아들이는 입력층, 긴 문맥을 감당하는 backbone, 그리고 agentic post-training을 위한 decoding/training 가속층이 분리되어 있으면서도 한 제품 패키지로 묶여 있다.

훈련 파이프라인도 단계가 분명하다. 공개 자료는 총 48T 토큰 학습과 함께 5단계 과정을 제시한다. 먼저 텍스트 pre-training으로 backbone을 만들고, projector warmup으로 audio/vision projector를 정렬한 뒤, multimodal pre-training을 거친다. 이후 SFT와 agentic post-training 단계에서 컨텍스트 길이를 32K에서 256K, 다시 1M으로 확장하고, 마지막으로 RL과 MOPD(Multi-Teacher On-Policy Distillation)로 perception·reasoning·agent capability를 강화한다. 이 순서는 MiMo-V2.5가 단순한 base multimodal model이 아니라, deployment-ready agent model을 목표로 후반부 학습을 강하게 설계했다는 뜻이기도 하다.

| 구성 요소 | 공개 자료에서 확인되는 내용 | 역할 |
|---|---|---|
| LLM Backbone | MiMo-V2-Flash 기반 hybrid SWA/GA Sparse MoE | 긴 컨텍스트와 추론 효율을 담당하는 중심 백본 |
| Vision Encoder | 729M ViT, 28 layers (24 SWA + 4 Full) | 이미지·문서·비디오 프레임 이해 |
| Audio Encoder | 261M Audio Transformer, MiMo-Audio 기반 초기화 | 오디오 이해 |
| MTP Modules | 329M, 3 layers | speculative decoding과 RL 학습 효율 개선 |
| Post-training | SFT + agentic RL + MOPD | 도구 사용, reasoning, multimodal behavior 강화 |

![MiMo-V2.5 Multimodal Benchmarks](https://huggingface.co/XiaomiMiMo/MiMo-V2.5/resolve/main/assets/mimo-v2.5-multimodal-bench.png)

![MiMo-V2.5 Coding and Agent Benchmarks](https://huggingface.co/XiaomiMiMo/MiMo-V2.5/resolve/main/assets/mimo-v2.5-coding-bench.png)

![MiMo-V2.5 Long Context / Graphwalks](https://huggingface.co/XiaomiMiMo/MiMo-V2.5/resolve/main/assets/mimo-v2.5-graphwalks.jpeg)

## 공개된 근거에서 확인되는 점

가장 먼저 확인되는 사실은 MiMo-V2.5가 진짜로 꽤 큰 공개 모델이라는 점이다. Hugging Face API 기준 이 리포지토리는 2026-04-27에 생성되었고, 마지막 수정 시각은 2026-04-29T14:45:09Z다. 다운로드 수는 57,759, likes는 212로 표시되며, 라이선스는 MIT다. 저장소에는 모델 가중치 샤드, `configuration_mimo_v2.py`, `modeling_mimo_v2.py`, tokenizer/config 파일, 그리고 architecture / benchmark 이미지 자산이 함께 공개돼 있다.

스펙도 비교적 구체적이다. 모델 카드는 MiMo-V2.5를 310B total / 15B active Sparse MoE로 설명하고, 1M context, 텍스트·이미지·비디오·오디오 입력, 729M vision encoder, 261M audio encoder, 3-layer MTP를 명시한다. 훈련 규모는 총 48T tokens이며, 양자화 표기는 FP8 mixed precision이다. 또한 Xiaomi 공식 블로그는 MiMo-V2.5와 MiMo-V2.5-Base 두 모델을 함께 제시하며, 둘 다 310B/15B 구조지만 context는 각각 1M과 256K라고 설명한다.

벤치마크 포지셔닝도 어느 정도 확인된다. Xiaomi 공식 페이지에 따르면 agent/coding 축에서는 MiMo Coding Bench 71.8, Claw-Eval Text 62.3, Terminal-Bench 2.0 65.8, SWE-Bench Pro 56.1이 제시된다. 같은 표에서 MiMo-V2-Pro는 각각 71.5, 57.8, 57.1, 55.0으로 나오며, 일부 항목에서는 Claude Opus 4.6, Gemini 3.1 Pro, GPT-5.4, Kimi K2.6와의 비교도 함께 실려 있다. Xiaomi는 이를 바탕으로 MiMo-V2.5가 agentic benchmark에서 best-in-class에 가깝다고 주장한다.

멀티모달 쪽 수치도 공개된다. 공식 페이지는 CharXiv RQ 81.0, MMMU-Pro 77.9, HR-Bench (4k) 88.5, OmniDocBench 87.2를 제시하며, 비디오·멀티모달 에이전트 영역에서는 Claw-Eval Multimodal 23.8, Video-MME 87.7, DailyOmni 83.5, VideoHolmes 64.0을 보여준다. 이 수치들만 보면 MiMo-V2.5는 이미지·문서 이해에서는 매우 경쟁적이고, 비디오 및 multimodal-agent 영역에서는 여전히 frontier closed model들과 혼전인 포지션으로 읽힌다. 즉 “전 영역 절대 우위”보다는 “한 모델 안에 매우 넓은 범위를 묶었다”는 쪽이 더 정확한 해석이다.

실제 운영 관점에서 중요한 caveat도 드러난다. 모델 카드 상단에는 `config.json`과 `tokenizer_config.json`이 초기 릴리스 이후 업데이트되었으며, 특정 커밋 이전에 모델을 받은 사용자는 해당 파일을 다시 받아야 한다는 공지가 있다. 즉 공개 직후 구성 파일 수정이 있었고, 이 부분을 놓치면 성능 저하가 생길 수 있다는 의미다. 또한 배포 가이드에는 SGLang과 vLLM 경로가 따로 적혀 있고, 특히 SGLang 예시 명령은 다수의 병렬화·FP8·FA3·MoE 옵션을 포함한다. 이것은 MiMo-V2.5가 “노트북에서 바로 가볍게 돌리는 작은 공개모델”과는 거리가 멀고, 실제로는 상당한 서빙 인프라 전제를 가진 모델임을 보여준다.

| 항목 | 확인된 내용 | 의미 |
|---|---|---|
| 공개 시점 | HF 생성 2026-04-27, Xiaomi 블로그 공개 2026-04-22 | 비교적 최근의 대형 옴니모달 공개 릴리스 |
| 모델 스펙 | 310B total / 15B active, 1M context, FP8 mixed | 큰 총규모와 비교적 낮은 활성 파라미터를 결합한 효율 지향 구조 |
| 모달리티 | Text / Image / Video / Audio | 네이티브 옴니모달 지향 |
| 훈련 파이프라인 | text pretrain → projector warmup → multimodal pretrain → SFT/agentic PT → RL/MOPD | 단순 멀티모달 pretraining보다 agent behavior까지 후반부에서 강화 |
| 운영 주의사항 | config/tokenizer config 업데이트 공지, SGLang/vLLM 배포 가이드 | 초기 사용 시 설정 파일과 서빙 스택 확인이 필요 |

## 실무 관점에서의 해석

내가 보기에 MiMo-V2.5의 핵심 가치는 “멀티모달이 된다”가 아니라, 멀티모달과 에이전트를 하나의 공개 모델 전략으로 묶었다는 데 있다. 지금 많은 팀이 겪는 문제는 이미지 읽는 모델, 문서 읽는 모델, 긴 문맥 요약 모델, 코드 에이전트 모델을 각각 따로 조합하다가 시스템이 지나치게 복잡해지는 것이다. MiMo-V2.5는 그런 분절을 줄이기 위해 backbone, modality encoder, long-context 설계, agentic post-training을 한 번에 밀어 넣은 사례로 읽힌다.

특히 15B active라는 숫자가 의미심장하다. 총 310B라는 거대한 규모는 여전히 부담스럽지만, activation 기준으로 보면 Xiaomi가 노리는 메시지는 분명하다. “폐쇄형 frontier model과 비교 가능한 폭넓은 작업 범위를, 더 효율적인 active path와 attention 구조로 가져가겠다”는 것이다. SWA/GA 혼합, MTP, FP8, projector warmup, MOPD까지 한데 묶인 설계는 전부 이 효율성 서사를 뒷받침한다.

다만 이 모델을 당장 대부분의 팀이 self-hosting 가능한 실전 대안으로 받아들이기는 어렵다. 공개된 배포 예시만 봐도 높은 수준의 분산 추론 환경과 최신 inference engine 지원이 전제된다. 벤치마크 수치도 공식 자료 중심이어서, 제3자 재현 결과가 더 쌓여야 실제 상대적 위치를 판단하기 쉬울 것이다. 그리고 VideoHolmes나 Claw-Eval Multimodal처럼 일부 영역에서는 최고 점수보다 “경쟁 가능한 수준”에 머무는 모습도 보인다.

그럼에도 방향성은 분명하다. MiMo-V2.5는 오픈 모델 진영이 앞으로 어디를 노리는지를 잘 보여준다. 작은 범용 LLM 하나를 잘 만드는 시대에서, 긴 컨텍스트·멀티모달·에이전트 능력을 하나의 제품 단위로 통합하는 시대로 넘어가고 있다는 뜻이다. 그런 관점에서 MiMo-V2.5는 단순한 모델 카드 한 장이 아니라, “공개 모델도 점점 단일 모달 추론기를 넘어서 운영 가능한 범용 agent substrate가 되려 한다”는 선언에 가깝다.

Sources: https://huggingface.co/XiaomiMiMo/MiMo-V2.5, https://huggingface.co/api/models/XiaomiMiMo/MiMo-V2.5, https://huggingface.co/XiaomiMiMo/MiMo-V2.5/raw/main/README.md, https://mimo.xiaomi.com/mimo-v2-5, https://r.jina.ai/http://mimo.xiaomi.com/mimo-v2-5