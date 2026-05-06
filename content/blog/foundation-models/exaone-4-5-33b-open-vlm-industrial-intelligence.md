---
title: "EXAONE 4.5 33B는 LG가 산업형 오픈 비전언어모델을 어떻게 포지셔닝하는지 보여 준다"
date: "2026-05-06T11:28:14"
description: "EXAONE 4.5 33B는 31.7B 언어모델과 1.29B 비전 인코더를 결합한 LG AI Research의 첫 오픈 웨이트 VLM으로, 256K 컨텍스트와 문서 이해 중심 데이터 전략을 앞세워 범용 벤치마크보다 산업형 멀티모달 실전성에 무게를 둔 릴리스다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - EXAONE
  - Vision Language Model
  - Foundation Models
  - Open Weights
  - Korean AI
draft: false
---

오픈모델 경쟁이 다시 흥미로워진 이유는 단순히 “누가 가장 큰 모델을 공개했는가”가 아니라, 어떤 회사가 자사 제품·산업 맥락에 맞는 운영 가능한 모델 계층을 얼마나 설득력 있게 내놓느냐가 더 중요해졌기 때문이다. 특히 비전 입력, 장문 문맥, 문서 이해, 한국어 추론 같은 요소가 동시에 필요한 환경에서는 범용 채팅 모델 하나만으로는 실제 현장 요구를 설명하기 어렵다.

LG AI Research가 공개한 EXAONE 4.5 33B는 바로 이 지점에 서 있다. Hugging Face 모델 카드와 기술 보고서 기준으로 이 모델은 EXAONE 4.0 언어모델 계열 위에 전용 비전 인코더를 결합한 첫 오픈 웨이트 비전언어모델이며, 총 33B 파라미터 중 31.7B가 언어모델, 1.29B가 비전 인코더다. 공개 메시지도 꽤 분명하다. 범용 멀티모달 모델 경쟁에 참여하되, 특히 문서 이해와 한국어 문맥 추론에서 동급 모델 대비 우위를 노리겠다는 것이다.

내가 보기엔 EXAONE 4.5의 핵심은 “한국에서 나온 첫 공개 VLM” 같은 상징성보다, LG가 오픈 웨이트를 어떤 산업형 포지셔닝으로 사용하려는지를 드러낸다는 데 있다. 기술 보고서는 문서 중심 코퍼스와 기업형 장문 처리, 그리고 한국어 추론을 반복해서 강조한다. 즉 이 모델은 단순한 데모용 멀티모달 확장이 아니라, 기업 문서·표·차트·복합 시각 정보까지 포함한 실제 업무 입력을 더 잘 다루기 위한 설계로 읽는 편이 정확하다.

![LG AI Research EXAONE roadmap slide](https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B/resolve/main/assets/exaone45_input2.png)

## 무엇을 해결하려는가

EXAONE 4.5가 풀려는 문제는 두 갈래다. 첫째는 오픈 웨이트 계열에서 언어모델과 비전모델이 여전히 분리된 채 제공되거나, 멀티모달이 가능하더라도 문서 이해·차트 해석·OCR 이후 추론 같은 엔터프라이즈형 워크로드에서 약한 경우가 많다는 점이다. 모델 카드와 기술 보고서는 EXAONE 4.5가 document-centric corpora를 의도적으로 강조했다고 설명하는데, 이는 LG가 멀티모달을 “이미지 캡셔닝”보다 “실제 업무 문서 해석” 쪽에 가깝게 보고 있음을 시사한다.

둘째는 한국어와 장문 문맥의 결합 문제다. 오픈모델 다수는 한국어 지원을 표기하더라도, 깊은 문맥 추론이나 한국어 벤치마크에서 일관되게 강하다고 보기 어렵다. EXAONE 4.5는 262,144 토큰 컨텍스트를 제공하고, 한국어 벤치마크 항목을 별도로 내세우며, 기술 보고서에서도 Korean contextual reasoning을 전면 메시지로 삼는다. 이는 글로벌 범용 모델을 그대로 가져다 쓰는 대신, 한국 기업 환경에서 요구되는 장문·다국어·문서 중심 입력을 함께 겨냥하는 선택이다.

또 하나 눈여겨볼 점은 이 모델이 “오픈 웨이트”이기는 하지만 완전히 자유로운 범용 배포 자산은 아니라는 점이다. 라이선스는 연구·교육 목적 사용을 명시적으로 허용하지만 상업적 사용은 별도 계약 없이는 금지한다. 다시 말해 LG는 오픈 공개를 통해 생태계 채택과 기술 신뢰를 얻으려 하지만, 실제 상용화 통제는 여전히 유지하는 전략을 택하고 있다.

## 핵심 아이디어 / 구조 / 동작 방식

구조적으로 EXAONE 4.5는 기존 EXAONE 4.0 계열 언어 백본에 전용 비전 인코더를 붙인 형태다. Hugging Face 설정 파일과 모델 카드 기준으로 언어 쪽은 64개 메인 레이어와 1개 MTP 레이어를 가지며, hidden size 5120, intermediate size 27392, 40개 Q head와 8개 KV head를 사용한다. attention 패턴은 3개의 sliding window attention 다음 1개의 global attention이 반복되는 `LLLG` 패턴으로 구성돼 있다.

이 설계에서 중요한 포인트는 “긴 문맥을 무작정 전역 attention으로 처리하지 않는다”는 점이다. 설정 파일에는 sliding window size 4096이 명시돼 있고, 전역 attention 레이어를 주기적으로 섞는다. 즉 대부분의 토큰은 지역적 문맥으로 효율적으로 처리하면서, 일부 레이어에서 전역 문맥을 회수하는 하이브리드 long-context 구조다. 기술 보고서가 enterprise-scale use case를 언급하는 것도 이와 맞물린다.

비전 쪽도 단순 부착 수준은 아니다. 모델 카드에는 Grouped Query Attention과 2D RoPE를 사용하는 전용 vision encoder가 명시돼 있고, 설정 파일에는 vision hidden size 2048, depth 28, patch size 14, spatial merge size 2 등이 드러난다. 즉 이 모델은 텍스트 중심 모델에 이미지 토큰을 억지로 붙였다기보다, 아예 시각 입력을 장기적으로 수용할 수 있는 별도 전처리·임베딩 경로를 마련한 구성에 가깝다.

또 하나 흥미로운 점은 배포 표면이다. README는 TensorRT-LLM, vLLM, SGLang, llama.cpp 등 여러 추론 엔진 지원을 언급하고, 256K 컨텍스트 기준으로 단일 H200 GPU 혹은 4x A100-40GB 텐서 병렬 구성을 제시한다. 이는 “연구용 모델 카드”보다 훨씬 운영 친화적인 신호다. LG는 이 모델을 단지 공개하고 끝내려는 것이 아니라, 실제 서빙 스택에 올릴 수 있는 모델로 유통하려는 셈이다.

| 레이어 | 공개 자료에서 확인되는 구성 | 의미 |
|---|---|---|
| Language backbone | 31.7B LM, hidden size 5120, 64 main layers + 1 MTP layer | EXAONE 4.0 계열 언어 능력을 유지한 대형 베이스 |
| Long-context design | 262,144 context, 4096 sliding window, `LLLG` hybrid attention | 장문 문서와 기업형 문맥을 효율적으로 처리하려는 설계 |
| Vision path | 1.29B vision encoder, GQA, 2D RoPE, depth 28 | 이미지·문서·차트 입력을 네이티브하게 수용 |
| Deployment surface | TensorRT-LLM, vLLM, SGLang, llama.cpp, transformers 언급 | 연구 공개를 넘어 실제 추론 인프라 연결을 의식 |
| License strategy | EXAONE AI Model License Agreement 1.2 - NC | 오픈 웨이트이지만 상업 사용은 통제하는 절충형 전략 |

## 공개된 근거에서 확인되는 점

공개 수치만 보면 EXAONE 4.5는 “전방위 절대 1위”보다 “특정 실무 축에서 동급 대비 의미 있는 경쟁력”을 주장하는 방식에 가깝다. 비전-언어 표에서는 MMMU 78.7, MMMU-Pro 68.6, MathVision 75.2, OCRBench v2 63.2, OmniDocBench v1.5 81.2, KRETA 91.9 등이 제시된다. 이 수치들은 GPT-5 mini high reasoning, Qwen3-VL 32B/235B, Qwen3.5 27B와의 비교 맥락 안에서 읽어야 한다.

흥미로운 점은 LG가 강점으로 내세우는 축과 실제 표의 모양이 비교적 일치한다는 것이다. 예를 들어 OCRBench v2에서는 GPT-5 mini 55.8보다 높지만 Qwen3-VL 32B 68.4나 Qwen3.5 27B 67.3보다는 낮다. OmniDocBench v1.5도 81.2로 GPT-5 mini 77.0보다 높지만 Qwen 계열 상위 수치에는 못 미친다. 즉 문서 이해에서 “동급 경쟁력”은 분명하지만, 문서 과제 전반에서 무조건 최고라고 말할 정도는 아니다.

반면 언어 중심 reasoning 항목에서는 꽤 인상적인 숫자도 보인다. AIME 2025 92.9, AIME 2026 92.6, LiveCodeBench v6 81.4는 강한 편이다. 특히 LiveCodeBench v6에서 GPT-5 mini high reasoning 78.1, K-EXAONE 236B 80.7, Qwen3-VL 235B 70.1보다 높은 수치를 제시한다. 다만 GPQA-Diamond 80.5, MMLU-Pro 83.3, instruction-following 계열 IFBench 62.6, IFEval 89.6, 장문 이해 AA-LCR 50.6을 보면 장문·지시 이행에서는 경쟁 모델 대비 약점도 함께 드러난다.

한국어 항목은 해석이 조금 더 섬세해야 한다. 비전-언어 Korean 구간에서 KMMMU 42.7은 GPT-5 mini 42.6보다 아주 약간 높지만, Qwen3.5 27B 51.7보다 낮다. K-Viscuit 80.1과 KRETA 91.9도 강한 수치지만 각각 Qwen3-VL 235B 83.9, GPT-5 mini 94.8, Qwen3.5 27B 96.5보다 열세다. 언어 전용 Korean 구간의 KMMLU-Pro 67.6, KoBALT 52.1 역시 “한국어 특화 강점”을 시사하지만 절대 우위라기보다 경쟁 가능한 상위권 정도로 읽는 편이 더 정확하다.

라이선스는 실무 채택에서 매우 중요하다. LICENSE 파일은 연구·교육 목적 사용, 파생 모델 생성, 연구 결과 공개를 허용하지만 상업적 사용은 금지한다. 또한 경쟁 모델 개발 또는 개선 목적으로의 사용도 제한한다. 즉 이 모델은 “사내 파일럿·연구 검증”에는 매력적일 수 있지만, 상용 제품에 바로 넣는 오픈모델 후보로 보기에는 법무 장벽이 분명하다.

| 비교 축 | EXAONE 4.5 33B | 비교해서 읽을 포인트 |
|---|---:|---|
| OCRBench v2 | 63.2 | GPT-5 mini 55.8보다 높지만 Qwen3-VL 32B 68.4보다는 낮음 |
| OmniDocBench v1.5 | 81.2 | 문서 이해 경쟁력은 강하지만 동급 최고치는 아님 |
| AIME 2025 | 92.9 | GPT-5 mini 91.1, Qwen3-VL 235B 89.7보다 높아 추론 축은 강함 |
| LiveCodeBench v6 | 81.4 | 공개 표 기준 비교군 중 가장 높은 편에 속함 |
| IFBench | 62.6 | instruction following은 GPT-5 mini 74.0, Qwen3.5 27B 76.5 대비 약함 |
| AA-LCR | 50.6 | 256K 컨텍스트를 제공하지만 장문 이해 점수는 보수적으로 봐야 함 |
| License | NC, 상업 사용 금지 | 채택 판단에서 성능만큼 법무 검토가 중요 |

## 실무 관점에서의 해석

내가 보기엔 EXAONE 4.5 33B의 가장 중요한 의미는 “한국 기업이 산업형 VLM을 어떤 문제 정의로 설계하는가”를 비교적 선명하게 보여 준다는 점이다. 글로벌 오픈모델이 범용 멀티모달 챗 경험을 넓히는 데 집중해 왔다면, EXAONE 4.5는 문서 이해, 기업형 장문 처리, 한국어 문맥, 추론 가능한 비전 입력을 하나의 패키지로 묶으려 한다. 이 방향은 보험·제조·전자·화학처럼 문서가 많고 한국어 비중이 높은 조직에서 특히 설득력이 있다.

또한 이 모델은 “오픈 웨이트 = 자유로운 제품화”라는 등식이 더 이상 성립하지 않는다는 점도 잘 보여 준다. 배포 엔진 호환성과 256K 컨텍스트, 추론 친화 아키텍처는 매우 실전적이지만, 라이선스는 분명히 비상업적 연구 사용에 가깝다. 따라서 실제 팀에서는 이 모델을 두 단계로 평가하게 될 가능성이 크다. 먼저 연구·PoC·벤치마크 재현 단계에서 기술 적합성을 검증하고, 이후 상용 도입 여부는 별도 계약 가능성과 비용 구조를 검토하는 식이다.

벤치마크 해석도 냉정할 필요가 있다. EXAONE 4.5는 일부 reasoning 항목에서 인상적인 수치를 보여 주지만, 문서 이해·한국어·instruction following·장문 이해 전체를 통틀어 경쟁 모델을 일관되게 압도하지는 않는다. 오히려 이 모델의 장점은 “모든 축에서 최고”가 아니라, 한국어와 문서 중심 산업 환경에 맞춘 균형 잡힌 설계와 운영 친화적 공개 방식에 있다. 다시 말해 이 릴리스는 리더보드 정복 선언이라기보다, LG가 실무형 멀티모달 모델을 어떤 조건으로 외부에 공개할지에 대한 전략 문서에 더 가깝다.

그럼에도 시사점은 분명하다. 한국어와 문서 이해가 중요한 기업 환경에서는 이제 글로벌 API 모델만이 유일한 선택지가 아니다. 다만 진짜 경쟁력은 공개 여부 자체보다, 긴 문맥 성능의 실제 재현성, 문서 파이프라인 적합성, 그리고 무엇보다 라이선스 협상 가능성에서 갈릴 것이다. EXAONE 4.5 33B는 바로 그 질문을 던지는 모델이다.

Sources: https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B, https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B/raw/main/README.md, https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B/raw/main/LICENSE, https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B/raw/main/config.json, https://github.com/LG-AI-EXAONE/EXAONE-4.5, https://arxiv.org/abs/2604.08644, https://arxiv.org/html/2604.08644