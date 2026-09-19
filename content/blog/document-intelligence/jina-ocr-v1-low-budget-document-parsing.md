---
title: "jina-ocr-v1은 OCR 품질보다 ‘문서 한 페이지를 얼마나 싸게 끝낼지’를 겨냥한다"
date: "2026-09-20T01:02:03+09:00"
description: "jina-ocr-v1은 DeepSeek-OCR의 압축형 vision encoder와 3B MoE decoder 위에 FastMTP speculative decoding과 dense verifiable reward post-training을 얹어, 이미지·PDF를 Markdown으로 빠르게 변환하는 3.4B 문서 파서다."
author: "Sangmin Lee"
category: "document-intelligence"
tags:
  - jina-ocr-v1
  - OCR
  - Document Intelligence
  - Speculative Decoding
  - Vision-Language Model
draft: false
---

문서 OCR을 실제 서비스에 넣으면 병목은 모델이 글자를 읽는 정확도 하나가 아니다.[1][2][3]
page image를 몇 개의 visual token으로 표현하는지, 긴 Markdown output을 얼마나 빨리 decode하는지, 표·수식·다단 layout을 별도 post-processing 없이 얼마나 보존하는지가 page당 비용을 결정한다.[1][2][3]

Jina AI의 `jina-ocr-v1`은 이 비용 구조를 정면으로 겨냥한다.[1][2][4]
image와 PDF를 text·formula·table·reading order를 포함한 Markdown으로 바꾸는 end-to-end parser이며, 3.4B total parameter 가운데 token마다 약 570M만 활성화하는 MoE와 speculative decoding을 결합한다.[1][2][4]

## 무엇을 해결하려는가

문서를 VLM으로 한 번에 Markdown으로 변환하면 layout analysis, text recognition, table structure, formula transcription을 하나의 output sequence에 담을 수 있다.[2][3]
하지만 이 방식은 page image를 encoder가 처리하는 비용과, 길고 구조화된 output을 autoregressively 생성하는 비용을 함께 감당해야 한다.[2][3]

`jina-ocr-v1`은 DeepSeek-OCR의 DeepEncoder와 MoE decoder를 이어받고, 남은 decoding 병목을 FastMTP로 줄인다.[2][3]
동시에 post-training에서는 text similarity만 보지 않고 formula, table, brace balance, tag closure, unit test, repetition 같은 deterministic check를 dense reward로 결합한다.[2][3]

<figure style="margin: 1.8rem 0;">
  <img src="/images/blog/jina-ocr-v1-serving-path.svg" alt="문서 이미지 또는 PDF가 DeepEncoder 압축, MoE decoder와 FastMTP speculative decoding을 거쳐 Markdown 텍스트·표·수식으로 변환되는 jina-ocr-v1 구조도" style="width: 100%; max-width: 500px; height: auto; display: block; margin: 0 auto;" />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">시각 표현 압축과 lossless speculative decoding을 함께 써서 문서 파싱의 입력·출력 비용을 줄이는 경로다.[2][3][4]</figcaption>
</figure>

## 핵심 아이디어 / 구조 / 동작 방식

첫 번째 cost lever는 visual compression이다.[2][3]
DeepEncoder는 1024×1024 global view를 256 visual token으로 표현하고, 필요한 경우 local tile을 추가하는 dynamic-resolution mode를 사용한다.[2][3]
논문은 global view에 256 token, 추가 tile당 100 token을 쓰며 최대 1,156 visual token까지 확장한다고 설명한다.[2][3]

두 번째 cost lever는 decoder다.[1][2][4]
전체 model은 약 3.4B parameter지만 decoder의 token별 active parameter는 약 570M이며, `FastMTP`는 dense draft block 하나를 재귀적으로 사용해 K=3 prediction step을 제안한다.[1][2][4]

검증은 greedy다.[1][2][3]
verifier와 draft가 일치하는 가장 긴 prefix만 commit하기 때문에, 저자들은 speculative path가 plain greedy autoregressive decoding과 byte-identical output을 유지하며 속도만 바꾼다고 주장한다.[1][2][3]

| 구성 요소 | 비용 또는 품질에 미치는 역할 | 공개된 사양 |
|---|---|---|
| DeepEncoder | page-level visual token 수를 압축 | 1024×1024 global view → 256 token |
| Dynamic local tile | 작은 글자·복잡한 page detail 보강 | tile당 100 token, 최대 9개 추가 |
| DeepSeek 3B MoE decoder | total capacity와 token별 compute 분리 | 3.4B total, 약 570M active/token |
| FastMTP | verifier pass당 여러 output token commit | shared draft block, K=3 |
| Dense verifiable rewards | 표·수식·구조 오류에 부분 credit 제공 | formula·table·structural·unit-test signal |

## 공개된 근거에서 확인되는 점

Jina가 기본 dynamic-resolution setting에서 제시한 score는 OmniDocBench v1.6 **91.14**, olmOCR-Bench **83.4**다.[1][4][5]
같은 발표는 one A100 SXM4 40GB, concurrency 32, 1,403 page 조건에서 **2.57 pages/s**를 측정했으며, 이는 자사가 비교한 시스템 중 가장 높은 page throughput이라고 설명한다.[1][4][5]

| 지표 | jina-ocr-v1의 공개 수치 | 해석할 때의 조건 |
|---|---:|---|
| OmniDocBench v1.6 | 91.14 | 기본 dynamic-resolution 설정의 vendor-reported result |
| olmOCR-Bench | 83.4 | text, reading order, math, table 관련 official overall |
| A100 throughput | 2.57 pages/s | A100 SXM4 40GB·concurrency 32·1,403 page 조건 |
| L4 FastMTP speedup | 42.7 → 83.1 output tokens/s | batch 1 eager mode, K=3·57.6% acceptance rate |

핵심은 최고 quality point 하나보다 throughput–quality trade-off다.[1][3][5]
Jina의 자체 비교에서 quality가 더 높은 일부 parser는 있었지만 더 느렸고, `jina-ocr-v1`은 active parameter와 output token을 낮춰 low-budget GPU에서 page/s를 확보하는 쪽에 위치한다.[1][3][5]

다만 `2.57 pages/s`와 다른 model의 비교 수치는 Jina가 정한 hardware, concurrency, batching, document set에서 나온 자체 measurement다.[1][2][5]
서로 다른 GPU와 batch setting의 pages/s를 일반 순위처럼 섞으면 안 되며, 특히 L4 batch-1 decoding 수치는 A100 throughput과 직접 비교할 수 없다.[1][2][5]

quality profile도 균일하지 않다.[1]
model page는 olmOCR-Bench의 Base 99.9, Tables 88.8, Multi-column 85.5와 함께 OldScans 42.6을 제시한다.[1]
오래되고 강하게 degraded된 scan은 여전히 human check나 task-specific fallback이 필요한 구간이라는 뜻이다.[1]

## 배포 표면과 라이선스

가중치는 Hugging Face에서 `jinaai/jina-ocr-v1`로 공개돼 있으며, model card는 CC BY-NC 4.0 license를 표시한다.[1][4]
따라서 model을 직접 내려받아 상업 document pipeline에 넣기 전에 non-commercial 조건과 별도 commercial licensing 경로를 반드시 검토해야 한다.[1][4]

hosted path도 있다.[4][6]
Jina API는 OpenAI chat completions schema를 따르며, `https://api.jina.ai/v1`에서 model을 `jina-ocr-v1`으로 지정할 수 있다고 문서화한다.[6]
model card는 Jina Reader, Playground, Transformers 로컬 inference 경로도 함께 안내한다.[4]

이 세 배포 방식은 운영 조건이 다르다. Hosted API는 ingestion 구현을 빠르게 시작할 수 있지만 vendor dependency와 data handling 검토가 필요하고, local Transformers path는 resource·model loading·`trust_remote_code` 검토를 포함한 배포 책임이 팀에 돌아온다. API 호환성이 model output의 품질·latency·license 문제까지 없애 주는 것은 아니다.[4][6]

## 실무 관점에서의 해석

`jina-ocr-v1`을 일반-purpose multimodal model의 축소판으로 읽으면 핵심을 놓친다. 이 모델의 중심은 “한 page의 답을 더 잘 쓰는가”보다 **문서 파싱 output의 token economy를 관리하면서 Markdown 구조를 유지하는가**다.

문서 RAG, scanned archive, paper-to-dataset, PDF ingestion에는 특히 맞는다. 표와 formula를 별도 OCR branch로 다시 조립하지 않고 Markdown으로 바로 넘길 수 있고, output이 구조화돼 있어 chunking·indexing·citation region link로 이어지는 후속 pipeline을 단순화할 수 있다.[1][4][6]

반대로 high-stakes 문서에서는 end-to-end OCR output을 진실로 취급하면 안 된다. Old scan, 계약서의 숫자·부정어, 표의 cell alignment, 수식의 기호는 page-level average가 높아도 개별 오류의 비용이 클 수 있다. source image region, structural validator, critical-field cross-check, human review queue를 OCR 뒤에 남기는 편이 안전하다.

결국 이 release는 OCR 경쟁의 단위를 한 번 바꾼다. 더 많은 total parameter를 가진 parser와 정면 승부하기보다, **visual token 압축 + sparse MoE + verifier-backed speculative decoding**으로 문서 한 페이지를 끝내는 비용을 낮춘다. production에서는 이 trade-off가 가장 높은 benchmark score보다 더 중요한 경우가 많다.

## Sources

[1] https://jina.ai/models/jina-ocr-v1 — Jina OCR model page
[2] https://arxiv.org/abs/2609.03181 — Jina-OCR-v1 arXiv abstract
[3] https://arxiv.org/html/2609.03181 — Jina-OCR-v1 arXiv HTML
[4] https://huggingface.co/jinaai/jina-ocr-v1 — Jina-OCR-v1 Hugging Face model card
[5] https://jina.ai/news/jina-ocr-v1-faster-document-parsing-on-low-budget-gpus — Jina OCR release post
[6] https://api.jina.ai/docs — Jina API documentation
