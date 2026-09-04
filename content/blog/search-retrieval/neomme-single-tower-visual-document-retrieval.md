---
title: "NeoMME는 문서 검색을 위해 VLM을 버리고 단일 멀티모달 인코더로 간다"
date: "2026-09-04T13:28:34"
description: "H Company의 NeoMME는 텍스트 토큰과 원본 이미지 패치를 하나의 양방향 Transformer로 처리하고, dense·late-interaction 검색 표현을 한 번에 내보내며 시각 문서 RAG의 모델 크기·색인 비용·속도 균형을 겨냥한다."
author: "Sangmin Lee"
category: "search-retrieval"
tags:
  - NeoMME
  - Visual RAG
  - Document Retrieval
  - Multimodal AI
  - Embeddings
draft: false
---

문서 RAG의 품질 문제는 OCR을 얼마나 잘 돌렸는가만으로 끝나지 않는다. PDF 페이지에는 표의 열 정렬, 차트의 축과 범례, 작은 주석, 글자 크기와 공간 배치처럼 텍스트 추출 과정에서 평탄화되기 쉬운 신호가 남는다. ColPali 계열이 PDF 페이지를 이미지로 검색하기 시작한 이유도 여기에 있다.[1][2]

문제는 이 작업에 쓰이던 다수의 멀티모달 retriever가 본래 생성용 VLM의 구성—별도 vision tower, projector, causal language model—을 encoder로 재활용한다는 점이다. 검색은 다음 토큰을 생성하지 않는데도 해당 구조의 파라미터와 계산 경로를 함께 떠안는다.[1][2]

H Company가 공개한 `NeoMME`는 이 병목을 다른 방향에서 푼다. 260M·800M 규모의 다국어 멀티모달 **양방향 encoder**를 처음부터 학습하고, 텍스트 토큰과 원본 이미지 패치를 하나의 Transformer에 넣는다. 이후 `NeoMME-Retriever`로 fine-tuning하면 한 번의 forward pass에서 dense embedding과 late-interaction embedding을 동시에 얻는다.[1][2]

## 무엇을 해결하려는가

시각 문서 검색은 “문장”이 아니라 “페이지”를 후보로 다룬다. 따라서 검색기가 질문과 PDF 페이지 스크린샷을 연결할 수 있어야 하고, 생성 단계의 VLM에는 검색된 원본 페이지를 넘겨야 한다. 이 방식은 OCR이 놓친 표·도표·레이아웃을 보존하지만, 고해상도 페이지의 patch 수가 증가하면서 색인 생성 시간과 multi-vector 저장 공간도 함께 커진다.[1]

NeoMME의 목표는 생성 모델을 retriever로 전환하는 것이 아니라, **검색에 맞는 멀티모달 표현 모델을 직접 만드는 것**이다. 이미지와 텍스트가 같은 계산 경로를 공유하면 사전학습·fine-tuning·병렬화·서빙을 하나의 encoder backbone 중심으로 다룰 수 있다. 모델은 dynamic-resolution 입력을 유지하고, 32×32 비중첩 patch와 긴 양방향 문맥으로 정보량이 높은 문서 페이지를 처리한다.[1][2]

## 핵심 아이디어 / 구조 / 동작 방식

NeoMME는 260M과 800M 두 크기에서 같은 설계를 공유한다. 텍스트는 factorized token embedding으로, 이미지는 32×32 patch를 작은 MLP로 projection해 동일한 Transformer encoder에 넣는다. 16,384-token context는 표준 4K UHD 이미지 최대 두 장을 인코딩할 수 있는 길이로 제시된다. attention은 대부분 sliding window를 쓰되 매 여섯 번째 레이어와 마지막 레이어에 global attention을 두는 방식이다.[1][2]

사전학습도 생성형 VLM의 next-token objective와 다르다. 텍스트 예제는 임의의 corruption rate로 token을 마스킹하는 discrete masked-diffusion denoising을 사용하고, 이미지-텍스트 예제에서는 보이는 이미지 patch를 조건으로 마스킹된 텍스트를 복원한다. 약한 마스킹에서는 주변 문맥이 답을 줄 수 있지만, 높은 마스킹에서는 이미지 자체를 읽어야 하므로 시각 근거를 encoder 표현에 밀어 넣는 설계다.[1]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/neomme-retrieval-stack.svg"
    alt="텍스트 토큰과 32×32 이미지 패치가 NeoMME 공유 양방향 인코더로 들어가 dense와 late-interaction 임베딩을 만들고, 이를 Visual RAG 검색과 생성으로 연결하는 세로 구조도"
    style="width: 100%; max-width: 660px; height: auto; display: block; margin: 0 auto;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    NeoMME의 차별점은 입력 modality를 합친 뒤, 하나의 backbone이 dense와 late-interaction 두 검색 표현을 동시에 낸다는 점이다.[1][2]
  </figcaption>
</figure>

Retriever fine-tuning에서는 두 head를 함께 학습한다. dense head는 hidden state를 mean pooling한 정규화 벡터로 압축해 ANN 검색에 맞고, late-interaction head는 text token 또는 image patch마다 128차원 정규화 벡터를 만들어 국소적 query–page 매칭을 보존한다. 기본 checkpoint는 두 표현을 함께 반환하며, Sentence Transformers용으로는 dense와 late-interaction head를 각각 독립 fine-tuning할 수 있는 별도 checkpoint도 제공된다.[1][3][4][5]

## 공개된 근거에서 확인되는 점

공식 보고서와 모델 카드는 ViDoRe 시각 문서 검색에서 260M·800M의 성능과 배포 trade-off를 함께 제시한다. 아래 값은 모두 저자 측 보고치이며, 비교표 안에는 MTEB 값과 저자 자체 평가 값이 함께 있으므로 독립 재현 순위로 읽기보다 해당 평가 설정의 신호로 보는 편이 안전하다.[1][2]

| 모델 | ViDoRe v3 (규모 · nDCG@10) |
|---|---:|
| NeoMME Retriever 260M | 260M · 0.523 |
| NeoMME Retriever 800M | 800M · 0.556 |
| ColQwen2.5 v0.2 | 3.75B · 0.524 |

260M은 공식 표에서 평가된 800M 미만 모델 가운데 최고라고 제시되며, 800M은 0.8B급 비교 모델과 근접한 점수로 보고된다. 특히 `ColQwen2.5-v0.2`의 0.524와 비교하면, 이 표가 말하는 핵심은 단일 절대 순위보다 **작은 모델 크기에서의 효율 frontier**다.[1]

260M 결과가 특히 흥미로운 이유는 단순 점수보다 색인 economics에 있다. 공식 측정에서 2048×2048 입력, NVIDIA L40S 조건의 `NeoMME-Retriever-260M`은 초당 약 51페이지를 인코딩했고, 비교 대상 `ColModernVBERT`의 약 26페이지보다 1.97배 빠르다고 보고됐다. late-interaction 표현은 원래 ViDoRe v3 문서당 평균 약 1.5MB를 차지하지만, hierarchical token pooling과 비대칭 quantization을 조합한 공격적 설정에서는 문서 vector를 6kB로 줄여 255배 압축하면서 baseline nDCG@10의 95% 이상을 유지했다고 제시한다.[1][2]

공개 범위도 개념 발표 수준은 넘는다. Hugging Face collection에는 260M·800M backbone, 두 retriever, Sentence Transformers용 dense/late checkpoint, pretraining checkpoint와 데모 Space가 함께 묶여 있다. base와 retriever 카드에는 Apache-2.0 라이선스와 `safetensors` 배포가 표시되며, Transformers 문서는 `AutoProcessor`/`NeoMMEForRetrieval` 사용 예제를 제공한다.[3][4][5][6]

다만 이 릴리스는 아직 매우 새롭다. arXiv v1은 2026년 8월 31일에 제출됐고, 공식 quickstart의 설치 예시는 `transformers`의 main branch와 `sentence-transformers>=6.0.0`을 지정한다. 따라서 도입 전에는 고정된 package release만으로 재현되는지, GPU·입력 해상도·문서 언어가 바뀌어도 지표가 유지되는지를 별도 smoke test로 확인하는 편이 좋다.[1][2][3]

## 실무 관점에서의 해석

NeoMME를 가장 정확하게 읽는 방법은 “더 작은 VLM”이 아니라 **visual retrieval을 위해 설계된 representation stack**으로 보는 것이다. 단일 tower가 곧바로 모든 업무를 단순화한다는 뜻은 아니다. 그러나 같은 backbone이 텍스트와 페이지 이미지를 다루고, 한 번의 인코딩에서 ANN용 dense 벡터와 정밀 reranking용 late-interaction 벡터를 함께 내면 retrieval architecture의 선택권은 커진다.

대규모 corpus에서는 두 단계 경로가 현실적이다. dense embedding으로 넓은 후보군을 빠르게 줄이고, 같은 모델이 만든 late-interaction embedding으로 상위 후보를 다시 정렬할 수 있다. 반대로 품질을 우선하는 작은 corpus라면 late-interaction을 바로 쓸 수 있다. 이때 병목은 모델 크기보다 page resolution과 index footprint가 되며, NeoMME가 pooling·quantization frontier를 같이 공개한 이유도 여기에 있다.[1]

도입 검증은 benchmark 재현보다 업무 문서로 시작하는 편이 낫다. 표·도표가 많은 PDF, 스캔 품질이 낮은 문서, 다국어 query, OCR 기반 RAG가 자주 틀리는 질문을 고정 test set으로 만들고, `dense only`·`late interaction`·`dense → rerank` 세 경로를 비교해야 한다. 그때 recall/nDCG뿐 아니라 페이지당 index 크기, ingest 시간, GPU 메모리, end-to-end answer grounding을 함께 측정해야 이 릴리스의 실질적인 가치를 판단할 수 있다.

결국 NeoMME가 던지는 질문은 “VLM을 검색기로도 쓸 수 있는가”가 아니다. 생성하지 않는 작업에 생성 모델의 구조를 계속 가져갈 이유가 있는가에 가깝다. 시각 문서 RAG가 표·레이아웃·차트를 더 충실히 다뤄야 하는 단계로 갈수록, 단일 멀티모달 encoder와 압축 가능한 late-interaction index라는 조합은 충분히 검증할 만한 대안이다.

## Sources

[1] [Hugging Face launch post](https://huggingface.co/blog/Hcompany/neomme) — architecture, training, ViDoRe, compression, throughput, package guidance
[2] [NeoMME technical report](https://arxiv.org/abs/2609.01657) — paper abstract, submission date, architecture and reported evaluation context
[3] [Transformers NeoMME documentation](https://huggingface.co/docs/transformers/main/en/model_doc/neomme) — public API and retrieval interfaces
[4] [NeoMME-260M-Retriever model card](https://huggingface.co/Hcompany/NeoMME-260M-Retriever) — 260M checkpoint, dual output and release surface
[5] [NeoMME-800M-Retriever model card](https://huggingface.co/Hcompany/NeoMME-800M-Retriever) — 800M checkpoint and release surface
[6] [NeoMME Hugging Face collection](https://huggingface.co/collections/Hcompany/neomme) — checkpoint family and demo distribution
