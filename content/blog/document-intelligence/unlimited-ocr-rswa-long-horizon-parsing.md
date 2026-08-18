---
title: "Unlimited-OCR은 긴 문서 OCR을 고정 KV 캐시 문제로 푼다"
date: "2026-08-19T08:29:35"
description: "Baidu의 Unlimited-OCR은 DeepSeek-OCR의 압축 encoder 위에 Reference Sliding Window Attention을 얹어, 수십 페이지 문서를 한 번의 디코딩 흐름으로 처리하려는 3B급 OCR 모델이다."
author: "Sangmin Lee"
category: "document-intelligence"
tags:
  - Unlimited-OCR
  - OCR
  - Document Intelligence
  - R-SWA
  - Long-Context Inference
draft: false
---

문서 OCR의 병목은 점점 “글자를 얼마나 잘 맞히는가”에서 “긴 문서를 얼마나 오래, 같은 속도와 메모리로 파싱할 수 있는가”로 이동하고 있다. 한 페이지짜리 스캔 이미지는 여러 VLM·OCR 모델이 다룰 수 있지만, 수십 페이지 PDF를 페이지마다 끊지 않고 하나의 연속된 작업으로 처리하려면 디코더의 KV cache와 출력 길이가 곧바로 병목이 된다.

`baidu/Unlimited-OCR`은 이 문제를 정면으로 겨냥한 Baidu의 공개 OCR 모델이다. 기술보고서의 제목은 *Unlimited OCR Works: Welcome the Era of One-shot Long-horizon Parsing*이며, 핵심은 DeepSeek-OCR의 고압축 visual encoder를 유지하되 디코더 attention을 **Reference Sliding Window Attention(R-SWA)** 으로 바꾸는 것이다. 모델은 3B MoE 구조와 약 0.5B activated parameter 구성을 유지하면서, 출력이 길어져도 decode-side KV cache가 계속 커지지 않도록 설계한다.[2]

이 글은 Unlimited-OCR을 단순한 “새 OCR 리더보드 모델”이라기보다, **문서 파싱을 long-horizon decoding 문제로 다시 정의한 실험**으로 읽는다. 2026년 8월 19일 기준 GitHub 저장소는 약 2.4만 stars, Hugging Face 모델은 약 318만 downloads를 보이며, 초기 연구 코드 단계에서 Transformers·vLLM·SGLang·MS-Swift와 여러 배포 경로를 갖춘 공개 릴리스로 확장됐다.[1][3]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/unlimited-ocr-official-overview.webp"
    alt="Baidu가 공개한 Unlimited-OCR의 장문서 파싱 구조 개요"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Baidu 공식 저장소의 개요 이미지. 이 릴리스의 중심은 DeepEncoder의 visual token 압축과 R-SWA 기반 디코더를 결합해 긴 문서 출력을 계속 생성하는 데 있다.[1]
  </figcaption>
</figure>

## 무엇을 해결하려는가

기존 OCR 파이프라인은 긴 문서를 보통 페이지 단위로 잘라 처리한다. 각 페이지를 독립적으로 OCR하고, 외부 스케줄러나 후처리 코드가 결과를 다시 합친다. 이 방식은 실용적이지만 모델 입장에서는 매 페이지마다 문맥이 초기화된다. 문서 전체의 흐름, 페이지 간 이어지는 표기, 반복되는 구조, 방금 출력한 주변 context는 모델 내부에서 자연스럽게 유지되지 않는다.

문제는 표준 full attention이 이 작업에 비싸다는 점이다. 출력 길이 `T`가 늘어날수록 Multi-Head Attention의 KV cache는 `L_m + T`로 커진다. 여기서 `L_m`은 visual token과 prompt 같은 prefix/reference 길이다. 긴 PDF를 한 번에 파싱하려면 출력 토큰이 매우 길어지고, 그 결과 메모리와 디코딩 latency가 함께 증가한다. Unlimited-OCR의 질문은 그래서 단순하다. **문서 reference는 항상 보되, 이미 생성한 출력은 최근 일부만 보면 충분하지 않은가?**[2]

보고서는 이를 사람이 책을 베껴 쓰는 작업에 비유한다. 사람은 이미 쓴 모든 문장을 다시 읽기보다 원본과 방금 쓴 부분, 다음에 쓸 위치를 확인한다. 멀리 있는 출력은 부드럽게 잊고 원본 reference는 계속 보는 형태다. 이 비유가 R-SWA의 설계 제약을 잘 보여 준다.

## 핵심 아이디어 / 구조 / 동작 방식

Unlimited-OCR은 DeepSeek-OCR을 baseline으로 삼는다. 입력 쪽에서는 DeepSeek-OCR의 `DeepEncoder`를 유지한다. 보고서에 따르면 이 encoder는 SAM-ViT와 CLIP-ViT 계열을 결합하고 bridge에서 16× token compression을 적용해, 1024×1024 PDF image를 256 visual token 수준으로 압축한다. 단일 페이지에는 dynamic resolution인 `Gundam` 모드를, 다중 페이지에는 1024×1024 `Base` 모드를 사용한다.[2]

디코더 쪽이 핵심 변경점이다. 기존 DeepSeek-OCR의 표준 attention을 모두 R-SWA로 바꾼다. 각 생성 토큰은 visual token·prompt 전체와, 최근 일부의 출력 token만 본다.

| 항목 | R-SWA에서의 처리 |
|---|---|
| Reference / prefix | visual token과 prompt 전체를 항상 attend해 원본 문서 증거를 보존 |
| Decode window | 직전 `n`개 출력 token만 causal sliding window로 attend해 진행 위치와 최근 문맥을 유지 |
| 기본 연구 설정 | 보고서의 기본 window는 `n=128`이며, 출력이 길어져도 decode cache를 고정 |
| KV cache | `L_m + min(n, T)`로 상한을 둬 표준 MHA의 `L_m + T` 증가를 피함 |

이 구조는 단순 sliding window attention과 다르다. 모든 과거 정보를 sliding state로 흘려보내면 visual token 자체가 반복적인 상태 전이를 거치며 흐려질 수 있다. R-SWA는 visual/reference token을 고정된 prefix로 남겨 둔다. 즉 “원본 문서 전체는 계속 보고, 내가 방금 쓴 일부만 작업 기억으로 유지하는” 형태에 가깝다.[2]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/unlimited-ocr-rswa-cache-board.svg"
    alt="표준 full attention과 R-SWA의 KV cache 정책을 한국어로 비교한 도표"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    글의 해석을 위해 재구성한 R-SWA 설명도. 표준 attention은 출력 길이에 따라 KV cache가 계속 증가하지만, R-SWA는 reference token을 고정으로 보존하고 출력 token은 최근 window만 유지한다.[2]
  </figcaption>
</figure>

학습 설정도 이 목적에 맞춰져 있다. 보고서는 약 200만 document OCR sample을 구성하고 single-page와 multi-page 비율을 9:1로 둔다. multi-page data는 single-page data를 2~50페이지 단위로 이어 붙여 합성하고, 모든 데이터를 32K token 길이로 packing한다. DeepSeek-OCR checkpoint에서 출발해 DeepEncoder는 freeze하고 LLM parameter만 4,000 step 추가 학습했으며, 8×16 A800 GPU와 Megatron-LM 기반 pipeline을 사용했다고 밝힌다.[2]

## 공개된 근거에서 확인되는 점

보고서의 OmniDocBench v1.5 표에서 Unlimited-OCR은 overall 93.23을 기록한다. 같은 표의 DeepSeek-OCR baseline은 87.01이므로, 저자들은 +6.22 overall 개선으로 제시한다. 세부적으로 text edit distance는 0.073에서 0.038로, Formula CDM은 83.37에서 92.61로, Table TEDS는 84.97에서 90.93으로 바뀐다. v1.6 표에서는 overall 93.92가 제시된다. 다만 표의 비교군 수치는 OmniDocBench repository에서 가져오고 Unlimited-OCR 결과는 제안 모델의 자체 평가이므로, 실제 도입 전에는 목표 문서군으로 재현 평가가 필요하다.[2]

효율 지표도 이 글의 중심이다. 보고서는 OmniDocBench의 `Base` DeepEncoder mode에서 5,580 TPS를, DeepSeek-OCR은 4,951 TPS를 보였다고 적는다. 이는 저자 계산으로 12.7% 차이다. 이론적 ceiling 비교에서는 DeepSeek-OCR이 output length 256에서 7,229 TPS 수준이었다가 6,144 token에서 5,823 TPS로 내려가는 반면, Unlimited-OCR은 7,230에서 7,848 TPS 근처로 유지된다. 저자들은 6,000 token 부근에서 R-SWA가 약 35% 앞선다고 해석한다.[2]

긴 문서 실험에서는 2, 5, 10, 15, 20, 40+ pages를 한 번에 넣는 in-house benchmark가 제시된다. Table 3에서 40+ pages 조건의 Distinct-35는 96.90%, edit distance는 0.1069다. 이 역시 저자 주도의 내부 평가이며, 보고서는 반복 오류의 상당 부분을 R-SWA의 방향 상실보다 multi-page `Base` 해상도에서 작은 글자가 잘 보이지 않는 문제로 설명한다.[2]

현재 공개 표면은 처음 릴리스 때보다 넓어졌다. README에는 Transformers, vLLM용 공식 recipe와 Docker image, SGLang OpenAI-compatible server, PDF/이미지 directory batch script가 있고, 7월에는 MS-Swift training 지원이 추가됐다. GitHub에는 MIT `LICENSE`가 있으며 Hugging Face도 MIT tag와 BF16 safetensors·모델 코드·tokenizer 파일을 공개한다.[1][3]

다만 “연구 모델이 공개됐다”와 “어떤 환경에서나 안전한 drop-in OCR 서비스다”는 다르다. Transformers 예시는 `trust_remote_code=True`와 NVIDIA GPU, Python 3.12.3·CUDA 12.9에서 시험한 패키지 조합을 명시한다. 또한 논문의 기본 R-SWA window는 128이지만, 현재 README의 multi-page `infer_multi` 예시는 `ngram_window=1024`를 전달한다. 실제 서비스에서는 논문 설정·모드·runtime별 설정이 같은지 확인하고, 모델 revision을 고정해 벤치마크하는 편이 안전하다.[1][2]

공개 이슈는 제품 한계의 확정 증거가 아니라, 운영 테스트가 필요한 지점을 보여 준다. 예를 들어 한 vLLM 사용자는 특허 PDF에서 ST.25 sequence listing이 거대한 HTML table로 변환되고 숫자가 바뀌는 생성 loop가 token limit까지 이어졌다고 재현 환경과 함께 보고했다. 별도 이슈에는 CPU-only llama.cpp 환경에서 무한 반복 출력이 보고돼 있다. 둘 다 아직 열린 사용자 보고이므로 일반화할 수는 없지만, 법무·특허·과학 문서에서는 long-output guardrail, 반복 탐지, max-token fallback, 원문 region 대조가 필수라는 신호로 읽을 만하다.[4][5]

## 실무 관점에서의 해석

Unlimited-OCR의 가장 중요한 메시지는 “OCR 모델이 더 많은 페이지를 읽는다”가 아니라, **문서 파싱의 비용 축을 decoder memory policy로 옮긴다**는 데 있다. DeepEncoder는 페이지를 visual token으로 강하게 압축하고, R-SWA는 reference token을 계속 유지하면서 output-side KV cache만 sliding window로 제한한다. 이 조합은 문서 전체를 외부 for-loop로 쪼개는 대신 모델 내부의 working memory 정책으로 긴 출력을 다루려는 시도다.

이 관점은 문서 RAG와 에이전트 시스템에 중요하다. 실제 업무 문서는 한 장짜리 이미지가 아니라 수십 페이지 보고서, 논문, 계약서, 매뉴얼, 스캔본으로 들어온다. 페이지별 OCR 결과를 붙이는 방식은 구현은 쉽지만, 모델이 “나는 지금 문서 전체에서 어디를 베껴 쓰고 있는가”를 내부 상태로 유지하지 못한다. Unlimited-OCR은 이 문제를 attention 구조 차원에서 다루며, 출력 길이에 따라 latency와 GPU memory가 계속 나빠지는 문제를 줄이려 한다.

동시에 이름을 과대해석하면 안 된다. 보고서 스스로도 finite context length, 예를 들어 32K에서는 truly unlimited parsing이 아니라고 밝힌다. prefill length는 여전히 페이지 수와 해상도에 따라 길어지고, 더 많은 페이지를 넣으려면 128K 같은 longer-context training 또는 prefill pool이 필요하다. 현재의 “unlimited”는 수학적으로 무한이라는 뜻이 아니라, 기존 페이지별 for-loop OCR보다 긴 horizon을 한 번의 디코딩 흐름으로 처리하려는 방향에 가깝다.[2]

도입 판단은 “기본 OCR 점수” 하나가 아니라 별도 운영 계약으로 해야 한다. 문서 유형별 exactness·표 구조·reading order·반복률을 나누어 평가하고, 출력 길이 상한·반복 감시·페이지/region 원문 연결·human review fallback을 둬야 한다. 특히 계약서, 특허, 재무·의료 문서처럼 숫자와 구조가 중요한 경우에는 high score가 일괄 자동화를 정당화하지 않는다.

그럼에도 Unlimited-OCR은 문서 AI에서 볼 만한 전환 신호다. OCR을 단순히 “이미지에서 텍스트를 추출하는 전처리”라고 보면 R-SWA 같은 attention 구조는 부차적일 수 있다. 하지만 OCR을 **긴 문서 reference를 보며 구조화된 output을 계속 생성하는 decoding system**으로 보면, KV cache와 attention window는 제품 품질과 비용을 결정하는 핵심 설계가 된다. Unlimited-OCR의 가치는 이 질문을 명확하게 드러냈다는 데 있다.

## Sources

- [Baidu Unlimited-OCR GitHub repository](https://github.com/baidu/Unlimited-OCR) — README, 릴리스 이력, 설치·배포 경로, 라이선스
- [Unlimited OCR Works technical report](https://arxiv.org/abs/2606.23050) — R-SWA, 학습 설정, OmniDocBench·long-horizon·효율 결과
- [Baidu Unlimited-OCR on Hugging Face](https://huggingface.co/baidu/Unlimited-OCR) — 공개 model artifact와 현재 모델 메타데이터
- [GitHub issue #84](https://github.com/baidu/Unlimited-OCR/issues/84) — vLLM 기반 특허 PDF 처리의 공개 사용자 재현 보고
- [GitHub issue #82](https://github.com/baidu/Unlimited-OCR/issues/82) — llama.cpp CPU 환경의 반복 출력 공개 사용자 보고
