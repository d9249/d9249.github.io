---
title: "HPD-Parsing은 문서 파서를 ‘하나의 긴 생성’에서 꺼낸다"
date: "2026-08-06T15:39:36+09:00"
description: "HPD-Parsing은 전체 페이지의 읽기 순서는 layout branch가 조정하고, 블록별 내용은 병렬 branch가 생성하게 해 unified 문서 파서의 긴 autoregressive decoding 병목을 줄이는 1B 모델이다."
author: "Sangmin Lee"
category: "document-intelligence"
tags:
  - HPD-Parsing
  - Document Parsing
  - OCR
  - VLM
  - vLLM
draft: false
---

문서 AI의 병목은 글자를 읽는 vision encoder보다, 읽은 결과를 길고 구조화된 Markdown이나 HTML로 한 token씩 이어 쓰는 decoder에 생기는 경우가 많다.[1]

표가 크고 수식이 많고 다단 레이아웃까지 들어가면, unified VLM parser는 페이지 전체를 이해하고도 마지막 출력 token까지 하나의 autoregressive 경로를 따라가야 한다.[1][3]

`HPD-Parsing: Hierarchical Parallel Document Parsing`은 이 경로를 통째로 짧게 만들려 하지 않는다.[1]

대신 페이지의 읽기 순서와 영역 관계만 main layout branch가 잡고, 각 영역의 텍스트·표·수식은 서로 다른 content branch가 동시에 생성하도록 바꾼다.[1][2]

저자들은 HPD-Parsing이 OmniDocBench v1.6에서 1B parameter로 overall 94.91을 기록했고, batch size 512의 A800 80GB 조건에서 4,752.1 TPS와 2.68 PPS를 기록했다고 보고한다.[1]

이 값은 저자 측 benchmark·hardware·serving 조건의 결과이며, 일반적인 모든 OCR workload의 성능 보장은 아니다.[1][3]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/hpd-parsing-decoding-comparison.png">
    <img
      src="/images/blog/hpd-parsing-decoding-comparison.png"
      alt="기존 순차 autoregressive decoding과 HPD-Parsing의 계층적 병렬 decoding을 비교하고 OmniDocBench 성능 위치를 나타내는 공식 그림"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. HPD는 페이지 전체의 순서 정보는 남기되, block content를 단일 token stream으로 직렬화하지 않으려는 decoding 재구성이다.[7]
  </figcaption>
</figure>

## 무엇을 해결하려는가

문서 parsing은 layout, reading order, 표·수식·본문의 관계를 전역적으로 알아야 한다.[1]

그러나 본문의 문자와 표 셀처럼 지역 visual evidence에 강하게 묶인 내용까지 먼 영역의 token history를 모두 기다릴 이유는 약하다.[1]

기존 unified parser는 이 두 종류의 의존성을 같은 token-by-token trajectory에 넣는다.[1]

출력이 길어질수록 decoder latency가 visual encoding 비용을 압도하며, 논문은 긴 output에서 decoding 시간이 encoder보다 거의 500배 길어질 수 있다고 측정했다.[1]

HPD-Parsing의 출발점은 단순하다.[1]

**문서의 구조는 전역적으로 조정하되, 구조 아래의 내용은 가능한 한 지역적으로 풀자**는 것이다.[1]

| 생성 단위 | 기존 full-page autoregressive parser | HPD-Parsing |
|---|---|---|
| 페이지 구조 | 전체 output sequence 안에서 순차 생성 | main layout branch가 reading order와 영역 정보를 생성 |
| 블록 내용 | 앞선 모든 token을 기다린 뒤 순차 생성 | 각 영역에 content branch를 fork해 동시 생성 |
| 공통 context | 긴 prefix를 매 단계 attention 대상으로 유지 | visual context와 structural prefix KV cache를 공유 |
| branch 내부 token | 한 token씩 생성 | P-MTP로 여러 future token을 draft·verify·accept |

## 핵심 아이디어: layout scheduler와 content worker를 분리한다

### main layout branch는 문서의 뼈대를 생성한다

HPD-Parsing은 InternVL3.5-1B를 backbone으로 사용하며, 0.3B InternViT visual encoder와 약 0.8B Qwen3-0.6B 기반 decoder를 결합한다.[1]

입력 문서는 해상도와 aspect ratio에 따라 최대 24개의 448×448 tile로 나뉘어 visual representation으로 인코딩된다.[1]

main layout branch는 reading order에 따라 영역의 category와 normalized coordinate를 생성한다.[1]

각 layout unit 뒤의 `<FORK>` token은 해당 영역을 별도의 content branch가 처리할 수 있다는 routing signal이다.[1]

content branch는 shared visual context와 자신이 fork된 지점의 structural prefix를 이어받고 `<CHILD>` 뒤에서 해당 영역의 내용만 생성한다.[1]

이 설계는 새 branch가 이미지 encoder를 다시 실행하거나 공통 prefill을 반복하지 않게 한다.[1]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/hpd-parsing-architecture.png">
    <img
      src="/images/blog/hpd-parsing-architecture.png"
      alt="visual encoder, main layout parsing, 여러 content decoding branch, shared-prefix KV cache reuse, P-MTP module로 구성된 HPD-Parsing 공식 아키텍처"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 3. main branch는 구조와 routing을 담당하고, branch들은 공유 prefix KV cache를 재사용하면서 지역 content를 병렬 decoding한다.[8]
  </figcaption>
</figure>

### P-MTP는 남아 있는 branch 내부의 순차성도 줄인다

branch를 나눠도 각 branch 안에서 한 token씩 생성하면 긴 표나 수식은 여전히 느리다. HPD-Parsing은 layout branch와 content branch 모두에 Progressive Multi-Token Prediction(P-MTP)을 붙여 여러 future token을 draft한 뒤 병렬 검증한다.[1]

논문은 P-MTP가 step당 평균 6.6 tokens를 accept했다고 보고한다. 따라서 HPD의 효과는 block 간 병렬성 하나가 아니라, block 간 branch concurrency와 block 내부 multi-token prediction의 결합에서 나온다.[1]

### 학습도 decoding format을 단계적으로 바꾼다

학습은 세 단계로 나뉜다. 첫 단계는 full-page sequence로 일반 parsing 능력을 익히고, 둘째 단계는 layout sequence와 block-specific content sequence를 분리해 branch-specific supervision을 적용하며, 마지막 단계는 formula·table·layout 품질과 consistency를 위한 task-aware reward로 경량 RL을 수행한다.[1]

data curation은 feature clustering, multi-model pseudo-label과 difficulty estimation, stronger VLM 기반 refinement, distribution balancing의 네 단계로 구성된다. 저자들은 stage 1에 2.8M full-page sample, stage 2에 100K branch-specific sample, stage 3에 600 hard case를 사용했다고 설명한다.[1]

## 공개된 근거에서 확인되는 점

### 정확도와 throughput은 같은 표에서 읽어야 한다

논문 Table 1에서 HPD-Parsing의 OmniDocBench v1.6 overall score는 94.91이고, ReadOrderEdit은 0.124다. 저자들은 이 값을 end-to-end unified parser 범주에서 최고치라고 설명하지만, pipeline parser와 unified parser는 model composition과 inference path가 달라 같은 숫자만으로 일반적인 우열을 단정하기 어렵다.[1]

논문 Table 2의 throughput은 NVIDIA A800 80GB, batch size 512 조건이다. 같은 1B autoregressive baseline은 1,554.8 TPS·1.02 PPS인 반면 HPD-Parsing은 4,752.1 TPS·2.68 PPS로, 저자 표의 기준으로 각각 3.06배와 2.62배가 됐다.[1]

| OmniDocBench v1.6, BS=512 | Avg. input tokens | TPS | PPS | 읽는 법 |
|---|---:|---:|---:|---|
| Autoregressive baseline | 4,809.3 | 1,554.8 | 1.02 | HPD와 같은 input-token budget의 기준선 |
| HPD-Parsing | 4,809.3 | 4,752.1 | 2.68 | 저자 보고값, branch parallelism과 P-MTP 적용 |
| DeepSeek-OCR-2 | 1,100.2 | 2,932.1 | 2.05 | HPD보다 input token 수가 훨씬 적은 비교 대상 |
| FireRed-OCR | 4,532.3 | 1,082.0 | 0.90 | Table 2의 unified parser 비교 대상 |

input token budget을 함께 봐야 하는 이유도 있다. HPD-Parsing은 페이지당 약 4,800 input token을 처리하면서도 DeepSeek-OCR-2보다 1.62배 높은 TPS와 1.31배 높은 PPS를 기록했다고 저자들은 해석한다.[1]

다만 paper abstract와 model card에서 “fastest existing parser 대비 2.62배”라는 문구를 볼 때는 TPS와 PPS의 기준을 분리해 읽을 필요가 있다. Table 2는 baseline 대비 2.62배가 PPS, 3.06배가 TPS이며, DeepSeek-OCR-2 대비 수치는 1.31배 PPS와 1.62배 TPS로 제시한다.[1][6]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/hpd-parsing-length-efficiency.png">
    <img
      src="/images/blog/hpd-parsing-length-efficiency.png"
      alt="output length bucket별 baseline과 HPD-Parsing의 decoding steps, request throughput, inference latency를 비교한 공식 효율 그래프"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 5. output이 길어질수록 순차 decoding 경로의 차이가 커지며, 가장 긴 bucket에서 저자들은 18.04배 적은 decoding step, 3.67배 높은 request throughput, 5.80배 낮은 single-request latency를 보고했다.[9]
  </figcaption>
</figure>

길이별 graph의 메시지는 작은 페이지에서의 미세한 속도 향상보다 긴 output에서의 scaling이다. 7K–8K token bucket에서 branch를 합친 critical path가 모든 block length의 합보다 가장 긴 active branch에 가까워지기 때문에, 저자들은 18.04배 적은 decoding step과 5.80배 낮은 latency를 제시한다.[1][9]

## 모델·코드 공개 범위와 운영 조건

공식 Hugging Face model page는 Apache-2.0 licensed checkpoint, `model.safetensors`, 별도 `P-MTP/` weight, evaluation script, 그리고 demo Space를 공개하고 있다. metadata API는 약 1.07B BF16 parameter와 2.81GB storage를 표시하며, base model은 `OpenGVLab/InternVL3_5-1B`로 기록한다.[4][5]

재현 path는 두 갈래다. model card는 `transformers`의 `generate_hpd(...)` reference implementation과 customized vLLM build를 모두 안내하지만, 실제 production throughput은 paged KV cache로 shared prefix를 zero-copy 재사용하는 customized vLLM path를 사용해야 한다고 명시한다.[6]

Docker image는 GPU와 host network를 요구하고, 수동 설치 경로는 Python 3.10–3.13과 CUDA 12.8 이상 NVIDIA driver용 customized vLLM wheel을 요구한다. 따라서 공개 checkpoint가 있다는 사실만으로 표준 `transformers`나 일반 vLLM 환경에서 논문 throughput이 즉시 재현된다고 보기는 어렵다.[6]

## 실무 관점에서의 해석

HPD-Parsing이 흥미로운 이유는 OCR accuracy만 높이려는 모델이 아니라, **문서 출력의 dependency graph를 시스템이 실제로 이용하게 만든 parser**라는 점이다. 한 페이지의 reading order는 공유해야 하지만, 표의 한 셀을 생성하는 일과 멀리 있는 본문 문단의 text를 생성하는 일은 대개 같은 순서로 기다릴 필요가 없다.[1]

이 관점은 긴 Markdown 변환, 대형 표 재구성, 수식 transcription처럼 decoder가 오래 일하는 document workload에서 특히 설득력이 있다. 반면 layout branch의 routing 오류, branch scheduling overhead, 특수 vLLM runtime 의존성은 일반-purpose deployment에서 따로 측정해야 할 운영 변수다.[1][6]

결국 이 연구의 강점은 “더 많은 token을 한 번에 찍는다”보다, 페이지의 전역 구조와 지역 content를 서로 다른 concurrency 단위로 취급한 데 있다. 문서 AI 팀이라면 HPD-Parsing을 단순 OCR model 후보로만 보지 말고, 긴 structured generation을 어떤 dependency graph로 스케줄할지에 대한 serving design으로 읽을 만하다.[1]

## Sources

[1] https://arxiv.org/html/2607.18839v1 — arXiv HTML paper
[2] https://arxiv.org/abs/2607.18839 — arXiv abstract
[3] https://arxiv.org/pdf/2607.18839 — arXiv PDF
[4] https://huggingface.co/PaddlePaddle/HPD-Parsing — Official HPD-Parsing model page
[5] https://huggingface.co/api/models/PaddlePaddle/HPD-Parsing — HPD-Parsing Hugging Face metadata API
[6] https://huggingface.co/PaddlePaddle/HPD-Parsing/raw/main/README.md — HPD-Parsing official model card
[7] https://arxiv.org/html/2607.18839v1/x4.png — HPD-Parsing decoding comparison figure
[8] https://arxiv.org/html/2607.18839v1/x6.png — HPD-Parsing architecture figure
[9] https://arxiv.org/html/2607.18839v1/Arxiv/figure/bucket_speed.png — HPD-Parsing efficiency scaling figure
