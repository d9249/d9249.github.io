---
title: "Jina Embeddings v5 Omni는 텍스트 인덱스를 그대로 둔 채 모든 미디어를 같은 벡터 공간으로 보낸다"
date: "2026-05-13T21:07:44"
description: "jina-embeddings-v5-omni는 Jina v5 Text의 벡터 geometry를 보존하면서 이미지·비디오·오디오 타워를 frozen projector로 붙여, 기존 텍스트 인덱스를 멀티모달 검색 surface로 확장하려는 compact embedding suite다."
author: "Sangmin Lee"
category: "search-retrieval"
tags:
  - Jina AI
  - Multimodal Embeddings
  - Vector Search
  - Retrieval
  - Elastic
draft: false
---

텍스트 임베딩은 이미 RAG, semantic search, 분류, 클러스터링, 에이전트 메모리의 공통 인터페이스가 되었다. 하지만 실제 기업 데이터는 텍스트만으로 존재하지 않는다. PDF 스캔, 제품 이미지, 차트, 회의 녹음, 짧은 영상 클립, SNS 스크린샷이 모두 같은 검색 문제 안에 들어온다. 이때 보통의 구현은 모달리티마다 다른 모델과 다른 인덱스를 두고, 검색 시점에 여러 파이프라인을 이어 붙이는 방식으로 복잡해진다.

`jina-embeddings-v5-omni`는 이 문제를 정면으로 줄이려는 모델 묶음이다. Hugging Face collection 기준 이 릴리스는 논문 1개, small/nano 두 개의 base 모델, retrieval·classification·clustering·text-matching task variant, 그리고 MLX/GGUF 배포형 패키지까지 포함한다. 핵심은 “텍스트 임베딩 모델을 새로 멀티모달 학습한다”가 아니라, 이미 강한 `jina-embeddings-v5-text`의 벡터 공간을 그대로 보존한 채 이미지·비디오·오디오 입력을 같은 공간으로 들여보내는 것이다.

이 설계가 흥미로운 이유는 성능만이 아니다. 공식 모델 카드와 논문은 텍스트 입력에 대해 v5-omni가 대응되는 v5-text 모델과 **정확히 같은 임베딩**을 낸다고 설명한다. 즉 기존 텍스트 인덱스를 깨지 않고, 같은 벡터 공간에 비텍스트 미디어 쿼리를 얹는 전략이다. 검색 제품 관점에서는 “멀티모달 모델 하나 더”보다 “기존 vector index의 geometry를 보존한 확장 경로”라는 점이 더 중요하다.

![jina-embeddings-v5-omni frontier chart](https://huggingface.co/jinaai/jina-embeddings-v5-omni-small/resolve/main/omni_frontier.png)

## 무엇을 해결하려는가

멀티모달 검색의 가장 큰 운영 병목은 representation space의 분열이다. 텍스트는 텍스트 임베딩 모델로, 이미지는 CLIP류 모델로, 오디오는 CLAP이나 Whisper 기반 모델로, 비디오는 또 다른 VLM 기반 임베더로 처리하면 각 모델은 자기 영역에서는 잘 동작할 수 있다. 하지만 인덱스는 나뉘고, score calibration은 어려워지고, 기존 텍스트 검색 시스템을 이미지·오디오 검색으로 확장할 때 재색인 비용이 커진다.

Jina의 문제 설정은 조금 다르다. 이미 잘 훈련된 text embedding model이 있다면, 그 text geometry를 유지하면서 다른 미디어를 거기에 맞출 수 있느냐가 핵심 질문이다. 논문은 이를 frozen-encoder model composition이라고 부른다. 텍스트 backbone과 비텍스트 encoder tower를 대부분 고정하고, 그 사이를 잇는 작은 projector만 학습해 같은 semantic embedding space를 만든다는 접근이다.

실무적으로 이 질문은 “검색 인프라를 얼마나 덜 갈아엎을 수 있는가”로 이어진다. 모델 카드가 반복해서 강조하듯, `jina-embeddings-v5-text-small`로 만든 텍스트 인덱스는 `jina-embeddings-v5-omni-small`의 이미지·비디오·오디오 embedding과 같은 공간을 공유한다. 그래서 텍스트로 인덱싱하고 이미지나 오디오로 질의하거나, 반대로 비텍스트 자료를 문서처럼 검색하는 흐름을 하나의 벡터 인덱스에서 설계할 수 있다.

## 핵심 아이디어 / 구조 / 동작 방식

구조는 VLM 스타일이지만 학습 범위가 매우 제한적이다. 텍스트 입력은 기존 `jina-embeddings-v5-text` 경로를 그대로 탄다. 이미지와 비디오는 Qwen3.5 계열 vision encoder를 거치고, 오디오는 Qwen2.5-Omni에서 가져온 audio encoder를 거친다. 이 encoder tower들은 frozen 상태로 유지된다. 새로 학습되는 부분은 vision/audio 출력을 Jina text backbone의 hidden space로 맞추는 projector와 일부 modality delimiter token이다.

![jina-embeddings-v5-omni architecture](https://huggingface.co/jinaai/jina-embeddings-v5-omni-small/resolve/main/architecture.png)

논문 기준으로 trainable set은 `fc_vision_2`, `fc_audio`, modality delimiter embedding이다. Vision 쪽은 Qwen visual merger 구조의 일부를 유지하되 마지막 projection을 small은 1024차원, nano는 768차원 text hidden space에 맞춘다. Audio 쪽은 Qwen2.5-Omni audio encoder의 1280차원 출력을 같은 text hidden dimension으로 투사한다. 이후 media token sequence가 텍스트 토큰과 같은 backbone에 들어가고, last-token pooling과 L2 normalization으로 최종 embedding이 나온다.

또 하나 중요한 점은 task adapter다. v5-text 계열처럼 retrieval, classification, clustering, text-matching이 서로 다른 LoRA adapter를 사용한다. Base repo는 네 task adapter를 모두 보유하고, task-specific repo는 하나의 목적에 맞게 pre-merged된 형태다. 모델 카드도 retrieval embedding을 clustering이나 semantic similarity에 그대로 쓰지 말라고 명시한다. 즉 “하나의 omni embedding”이라고 해도 사용자는 목적에 맞는 task head/adaptor를 골라야 한다.

| 구성 요소 | 공개 자료에서 확인되는 내용 | 의미 |
|---|---|---|
| Text backbone | `jina-embeddings-v5-text-small` / `v5-text-nano` 유지 | 기존 텍스트 embedding geometry를 보존 |
| Vision path | Qwen3.5 vision encoder 계열 + projector | 이미지와 비디오 프레임을 text hidden space로 투사 |
| Audio path | Qwen2.5-Omni audio encoder + `fc_audio` | speech/music/sound를 같은 embedding space로 연결 |
| Task variants | retrieval, classification, clustering, text-matching | 목적별 LoRA/projector 조합을 분리 |
| Matryoshka | small 1024d, nano 768d에서 32d까지 truncation 지원 | 저장 비용·속도·정확도 trade-off를 조절 가능 |

패키징도 비교적 넓다. Hugging Face collection은 작성 시점 API 기준 26개 model item과 1개 paper item으로 구성되며, core transformers repo 외에 MLX와 GGUF variant가 함께 올라와 있다. GGUF repo는 llama.cpp 경로에서 text tower와 vision/audio multimodal projector를 분리해 제공하고, torch 기준 cosine parity를 modality별로 검증했다고 적는다. 반면 모델 카드는 `trust_remote_code=True`, `transformers >= 4.57`, `torch >= 2.5`, vLLM path는 `vllm==0.20.1` 검증 같은 운영 조건도 함께 제시한다.

## 공개된 근거에서 확인되는 점

논문 Table 1에서 가장 눈에 띄는 숫자는 small 모델의 평균 점수다. `jina-embeddings-v5-omni-small`은 1.57B parameter counting 기준 Text 67.00, Image 56.05, Video 41.20, Audio 51.46, 평균 53.93을 기록한다. 이는 LCO-Embedding-Omni-3B의 평균 53.83보다 약간 높고, 더 큰 LCO-Embedding-Omni-7B의 54.43보다는 낮다. Nano는 평균 45.19로 LanguageBind 36.27보다 높지만, small과는 분명한 격차가 있다.

| 모델 | Params (B) | Text | Image | Video | Audio | Avg |
|---|---:|---:|---:|---:|---:|---:|
| jina-v5-omni-nano | 0.95 | 65.52 | 44.36 | 26.87 | 44.00 | 45.19 |
| LanguageBind | 1.14 | 27.34 | 47.80 | 48.06 | 20.08 | 36.27 |
| jina-v5-omni-small | 1.57 | 67.00 | 56.05 | 41.20 | 51.46 | 53.93 |
| LCO-Embedding-Omni-3B | 4.70 | 57.55 | 58.42 | 46.84 | 52.51 | 53.83 |
| LCO-Embedding-Omni-7B | 8.93 | 59.31 | 58.64 | 47.41 | 52.37 | 54.43 |

다만 평균만 보면 안 된다. 상세 Table 3에서는 strong/weak area가 꽤 선명하다. Small은 image classification, image clustering, visual STS, multilingual image retrieval, audio classification 쪽에서 강하다. ViDoRe-in-MIEB document retrieval에서는 small이 79.08로 LCO-Embedding-Omni-3B의 78.24보다 높고 LCO-Embedding-Omni-7B의 80.32에 가깝다. 반면 generic image retrieval, MMEB-Video, audio clustering에서는 강한 baseline 대비 약점이 남는다.

| 항목 | 확인된 내용 | 해석 |
|---|---|---|
| Four-modality average | small 53.93, LCO-3B 53.83, LCO-7B 54.43 | 2B 미만 모델로 대형 omni baseline 근처까지 접근 |
| Visual document retrieval | small 79.08, nano 70.05 | PDF·scan·chart 검색 같은 문서형 이미지에 강점 |
| Text behavior | v5-text와 동일 embedding | 기존 text index 확장 시 재색인 부담을 줄일 수 있음 |
| Video | 평균 41.20, V-RET 27.82 | 짧은 클립/temporal grounding은 가능하지만 범용 비디오 검색은 약함 |
| Audio | MAEB audio 50.77, audio clustering 5.99 | classification/retrieval은 의미 있으나 clustering은 약점 |

논문은 학습 효율도 중요한 근거로 제시한다. 전체 모델을 다시 학습하는 대신 projector 경로만 학습하면 15k-step budget에서 vision은 약 1.8배, audio는 약 3.2–3.9배 빠르며 peak GPU memory도 낮다고 보고한다. 또한 abstract는 학습된 연결부가 joint model 전체 weight의 0.35%라고 설명한다. 성능을 “큰 모델을 통째로 재학습한 결과”가 아니라 “기존 embedding geometry를 보존하는 작은 연결 학습의 결과”로 읽어야 하는 이유다.

![Matryoshka truncation across modalities](https://arxiv.org/html/2605.08384v2/x6.png)

릴리스 상태도 비교적 실전 지향적이다. Collection API 기준 마지막 업데이트는 2026-05-12이고, 모델 item은 26개다. Base repo의 모델 카드 기준 small은 약 1.74B parameter, 1024차원 embedding, 32K max sequence length를 제시하고, nano는 약 1.04B parameter, 768차원 embedding, 8K max sequence length를 제시한다. 다만 API safetensors count나 논문 Table의 task-path parameter count는 서로 정의가 다르므로, parameter 숫자는 “어떤 tower와 task path를 세느냐”에 따라 다르게 읽어야 한다.

## 실무 관점에서의 해석

내가 보기에 v5-omni의 가장 중요한 가치는 “오픈 멀티모달 임베딩 모델이 하나 더 나왔다”가 아니라, **기존 텍스트 검색 자산을 보존하는 확장 방식**을 제품 수준으로 밀었다는 점이다. 많은 팀은 이미 text embedding index를 갖고 있고, 그 위에 RAG·추천·분류·모니터링 파이프라인을 쌓아 두었다. 이 상태에서 이미지나 오디오를 검색하려고 전체 인덱스를 다시 만들면 비용과 리스크가 크다. v5-omni는 이 지점에서 “텍스트 공간을 유지하고 비텍스트 tower를 맞춘다”는 현실적인 선택을 한다.

두 번째 장점은 task-specific design이다. Retrieval, classification, clustering, text-matching을 한 embedding으로 뭉개지 않고, LoRA/projector 조합을 목적별로 분리한다. 이는 운영자에게는 약간의 선택 부담을 만들지만, 임베딩을 실제 제품에 넣을 때는 오히려 건강한 설계다. 검색용 embedding과 군집화용 embedding은 좋은 공간의 조건이 다르기 때문이다.

세 번째는 배포 surface다. Transformers와 sentence-transformers, vLLM, Elastic Inference Service, Jina API, MLX, GGUF까지 경로가 열려 있다. 특히 Elastic 블로그는 `semantic_text` field와 EIS를 통해 텍스트·이미지·비디오·오디오를 Elasticsearch index 안에서 다루는 시나리오를 전면에 둔다. GGUF variant는 llama.cpp 경로에서 text tower와 vision/audio projector를 조합하는 방식까지 문서화해, 실험·로컬·edge 사용 가능성을 넓힌다.

하지만 caveat도 분명하다. 라이선스는 CC BY-NC 4.0이므로 상업 사용에는 별도 계약이 필요하다. 또한 모델 카드의 sentence-transformers 경로는 멀티모달 입력이 per-sample forward로 처리된다고 적고, 대규모 멀티모달 throughput에는 vLLM을 권장한다. Elastic 블로그도 긴 영상 전체를 하나로 임베딩하는 방식은 정보가 희석되기 쉽다고 경고한다. 실제로 비디오는 최대 32개 frame을 추출하는 전처리 성격이 강하므로, 긴 영화나 장시간 회의 녹화를 그대로 “하나의 embedding”으로 처리하는 것은 좋은 사용법이 아니다.

따라서 v5-omni는 모든 멀티모달 검색 문제를 한 번에 해결하는 만능 모델이라기보다, 텍스트 중심 검색 시스템을 이미지·문서·오디오·짧은 영상으로 확장하는 **compact compatibility layer**에 가깝다. 특히 PDF 스캔, 차트, 제품 이미지, 짧은 영상 scene, speech recording처럼 기존 텍스트 인덱스와 함께 검색되어야 하는 데이터가 많은 팀에게 의미가 크다. 반대로 generic video retrieval, audio clustering, 복잡한 mixed-media reasoning이 중심인 팀이라면 아직 benchmark 약점과 전처리 한계를 별도로 검증해야 한다.

결론적으로 `jina-embeddings-v5-omni`는 멀티모달 임베딩의 방향을 “더 거대한 joint model” 하나로만 보지 않는다. 이미 검증된 text embedding geometry를 고정하고, frozen modality tower와 작은 projector를 통해 현실적인 확장을 만든다. 이 접근이 장기적으로 일반화된다면, 앞으로의 검색 인프라는 모달리티별로 새로 지어지는 것이 아니라, 기존 text vector space를 중심으로 점진적으로 확장되는 형태에 더 가까워질 수 있다.

Sources: https://huggingface.co/collections/jinaai/jina-embeddings-v5-omni, https://huggingface.co/api/collections/jinaai/jina-embeddings-v5-omni, https://huggingface.co/jinaai/jina-embeddings-v5-omni-small, https://huggingface.co/jinaai/jina-embeddings-v5-omni-nano, https://huggingface.co/jinaai/jina-embeddings-v5-omni-small-text-matching-GGUF, https://arxiv.org/abs/2605.08384, https://arxiv.org/html/2605.08384, https://huggingface.co/papers/2605.08384.md, https://www.elastic.co/search-labs/blog/jina-embeddings-v5-omni-all-media-one-index
