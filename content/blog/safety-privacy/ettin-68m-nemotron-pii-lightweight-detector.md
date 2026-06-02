---
title: "ETTIN-68M Nemotron PII는 개인정보 탐지를 68M 토큰 분류기로 낮춘다"
date: "2026-05-13T19:28:03"
description: "kalyan-ks/ettin-68m-nemotron-pii는 ETTIN 68M encoder와 NVIDIA Nemotron-PII 데이터를 결합해, 영어 PII/PHI 탐지를 작은 NER 모델로 운영 파이프라인에 넣으려는 Hugging Face 모델이다."
author: "Sangmin Lee"
category: "safety-privacy"
tags:
  - Privacy
  - PII Detection
  - Hugging Face
  - Token Classification
  - Data Security
draft: false
---

AI 제품이 실제 업무 데이터에 가까워질수록 개인정보 탐지는 별도 보안 기능이 아니라 기본 런타임 기능에 가까워진다. RAG 인덱싱 전처리, 상담 로그 저장, 에이전트 실행 기록, 파인튜닝 데이터 정제처럼 평범해 보이는 경로에도 이름, 주소, 이메일, 계좌번호, API key, 쿠키, 의료 식별자 같은 민감 정보가 섞일 수 있다. 문제는 이 작업을 매번 거대한 LLM이나 외부 비식별화 서비스에 맡기기에는 비용, 지연, 데이터 반출 부담이 크다는 점이다.

`kalyan-ks/ettin-68m-nemotron-pii`는 이 지점을 작은 토큰 분류 모델로 겨냥한다. Hugging Face 모델 카드 기준 이 모델은 `jhu-clsp/ettin-encoder-68m`을 기반으로 하고, NVIDIA의 `nvidia/Nemotron-PII` 데이터셋 위에서 PII 탐지용으로 fine-tuning된 `transformers` token-classification 모델이다. 공개 safetensors 메타데이터 기준 파라미터 수는 BF16 68,462,187개이며, 모델 카드에는 Nemotron-PII 10K test instances에서 micro F1 0.9627, precision 0.9635, recall 0.9619가 제시되어 있다.

흥미로운 점은 이 모델이 “개인정보를 잘 찾는 LLM”이 아니라는 것이다. 구조상 NER에 가까운 span detector다. 즉 입력 텍스트를 생성하지 않고, 토큰 단위로 어느 구간이 어떤 PII/PHI 라벨에 해당하는지 표시한다. 그래서 이 모델의 실무적 의미는 챗봇 답변 품질보다 로그·문서·데이터셋을 통과하는 앞단 필터에 있다. 개인정보 탐지를 더 작고 빠르며 배포하기 쉬운 운영 계층으로 분리하려는 시도라고 보는 편이 맞다.

![ETTIN-68M Nemotron PII가 입력 스트림을 토큰 분류와 마스킹 조치로 처리하는 파이프라인](/images/blog/ettin-68m-nemotron-pii-pipeline.svg)

## 무엇을 해결하려는가

개인정보 탐지는 오래된 문제지만, LLM 애플리케이션에서는 새롭게 어려워졌다. 예전에는 전화번호, 이메일, 주민번호처럼 정규식으로 잡기 쉬운 패턴이 중심이었다. 지금은 상담 문맥, 의료·금융 문서, 개발 로그, 코드 블록, 자연어 지시, API 응답, 에이전트 tool trace가 한데 섞인다. 어떤 문자열이 식별자인지, 어떤 이름이 공개된 회사명인지, 어떤 토큰이 단순 예시인지 비밀값인지가 문맥에 따라 달라진다.

규칙 기반 필터는 빠르지만 문맥을 거의 보지 못한다. 반대로 대형 생성 모델을 매번 호출하면 문맥은 더 잘 볼 수 있지만 비용과 지연이 커지고, 원문을 외부 API로 보낼 때 프라이버시 경계가 다시 흔들린다. 특히 개인정보 필터는 “가끔 좋은 답을 생성하는 모델”보다 “매번 빠르게 통과하며 놓치지 않는 전처리기”에 가까워야 한다.

ETTIN-68M Nemotron PII는 이 중간 지점을 선택한다. 영어 텍스트에서 55개 PII/PHI entity type을 span 단위로 찾고, 이를 redaction, masking, route-to-review, training-data cleaning 같은 후속 파이프라인에 넘기는 작은 전용 모델이다. healthcare, finance, legal, cybersecurity 같은 도메인을 언급하는 모델 카드의 포지셔닝도 이 성격과 맞다. 핵심은 범용 reasoning이 아니라, 구조화·비구조화 텍스트 안의 민감 스팬을 싸고 빠르게 찾아내는 것이다.

## 핵심 아이디어 / 구조 / 동작 방식

모델의 베이스는 Johns Hopkins CLSP의 ETTIN encoder 68M이다. ETTIN 자체는 17M부터 1B까지 encoder-only와 decoder-only 모델을 같은 데이터와 레시피로 훈련해 비교하려는 공개 모델군이다. 베이스 모델 카드에 따르면 ETTIN은 DCLM, Dolma v1.7, 과학 논문, 코드, curated source를 포함한 2T+ token 규모의 3단계 학습 레시피를 사용하고, encoder 계열은 분류·검색·임베딩류 작업에 강점을 두도록 설계되어 있다.

이 PII 모델은 그중 `ettin-encoder-68m`을 토큰 분류 모델로 바꾼 형태다. 공개 `config.json`은 `ModernBertForTokenClassification` 아키텍처, hidden size 512, 19 layers, 8 attention heads, intermediate size 768을 노출한다. tokenizer config에는 `model_max_length` 8192가 표시되며, model config 쪽 `max_position_embeddings`는 7999로 잡혀 있다. 아주 긴 128K 문서를 한 번에 처리하는 계열은 아니지만, 일반 로그 chunk나 문서 조각 전처리에는 충분히 실용적인 길이다.

라벨 체계는 BIO tagging이다. `config.json`에는 `B-`와 `I-` prefix가 붙은 PII label들과 `O` label이 들어 있고, 총 107개 label id가 정의되어 있다. 사람이 읽는 entity type 기준으로는 모델 카드가 55개 유형을 제시한다. 단순한 이름·이메일·전화번호뿐 아니라 `api_key`, `password`, `http_cookie`, `mac_address`, `medical_record_number`, `health_plan_beneficiary_number`, `swift_bic`, `tax_id`, `vehicle_identifier` 같은 운영·의료·금융성 식별자가 포함된다.

사용 경로는 표준 Hugging Face `transformers` pipeline에 가깝다.

```python
from transformers import pipeline

ner = pipeline(
    "ner",
    model="kalyan-ks/ettin-68m-nemotron-pii",
    aggregation_strategy="simple",
)
```

모델 카드 예시는 pipeline 출력에서 인접한 같은 라벨의 토큰을 병합하고, 원문 offset에 맞춰 스팬을 정리하는 후처리 함수를 함께 보여 준다. 이 점도 중요하다. 실제 마스킹 시스템에서는 “어떤 라벨이 나왔는가”보다 “원문 몇 번째 문자부터 몇 번째 문자까지 가릴 것인가”가 더 중요하기 때문이다.

| 구성 축 | 공개 자료에서 확인되는 내용 | 의미 |
|---|---|---|
| 베이스 모델 | `jhu-clsp/ettin-encoder-68m` | 작은 encoder-only 모델을 PII NER에 특화 |
| 아키텍처 | `ModernBertForTokenClassification`, 19 layers, hidden 512, 8 heads | 생성형 모델이 아니라 토큰별 span classifier |
| 파라미터 | HF API safetensors 기준 BF16 68,462,187개 | 로컬·서버 전처리 계층에 넣기 쉬운 크기 |
| 입력 길이 | tokenizer `model_max_length` 8192, config `max_position_embeddings` 7999 | 긴 로그/문서 chunk 처리에는 유리하지만 초장문 단일 패스 모델은 아님 |
| 데이터셋 | `nvidia/Nemotron-PII` | synthetic persona-grounded PII/PHI span 데이터 위 fine-tuning |
| 라이선스 | 모델 MIT, 데이터셋 CC BY 4.0 | 상용 사용 가능성을 열어 두지만 배포 정책 검토는 별도 필요 |

## 공개된 근거에서 확인되는 점

Hugging Face API 기준으로 `kalyan-ks/ettin-68m-nemotron-pii`는 공개·비게이트 모델이며, `transformers`, `safetensors`, `modernbert`, `token-classification`, `pii-detection`, `privacy`, `en`, `license:mit` 태그를 갖는다. 조회 시점의 API 값은 생성일 2026-05-06, 마지막 수정 2026-05-13T09:30:35Z, downloads 63, likes 0이다. repository sibling은 `.gitattributes`, `README.md`, `config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json` 여섯 개로 단순하다. 별도 GitHub repo나 release note 묶음보다는 모델 카드와 config 중심의 Hugging Face 배포라고 보는 편이 맞다.

성능 수치는 모델 카드의 `model-index`와 Evaluation 섹션에 들어 있다. Nemotron-PII 10K test instances에서 F1 96.27, precision 96.35, recall 96.19, accuracy 99.26을 기록했다고 제시된다. HF API의 model-index 항목은 F1 0.9627, precision 0.9635, recall 0.9619를 노출하며, `verified`는 false로 표시된다. 따라서 이 수치는 독립 검증 leaderboard라기보다 모델 카드가 제시한 공개 평가 결과로 읽어야 한다.

세부 entity별 결과도 모델의 성격을 잘 보여 준다. 모델 카드 기준 상위권 entity에는 biometric identifier F1 0.9964, date of birth 0.9957, api key 0.9955, MAC address 0.9947, email 0.9942, IPv4 0.9941 등이 있다. 비교적 패턴성이 강하거나 synthetic data에서 표준화되기 쉬운 항목들은 매우 높게 나온다.

반대로 어려운 항목도 분명하다. occupation은 precision 0.7200, recall 0.5493, F1 0.6232로 가장 낮은 축에 속한다. time F1 0.7934, age 0.8778, political view 0.8876, state 0.8932도 상대적으로 도전적이다. 이 결과는 개인정보 탐지가 단순 포맷 매칭 문제가 아니라는 점을 다시 보여 준다. 직업, 정치적 견해, 주 이름처럼 문맥에 따라 entity 경계와 민감성이 달라지는 항목은 작은 모델에서도 여전히 조심해야 한다.

데이터셋 쪽 근거도 중요하다. `nvidia/Nemotron-PII` 데이터셋 카드는 이를 synthetic, persona-grounded dataset으로 설명한다. NVIDIA NeMo Data Designer로 생성했고, U.S. Census 기반 synthetic persona를 사용해 demographic realism과 contextual consistency를 확보하려 했다고 적는다. 크기는 100,000 English records이며, train 50,000 / test 50,000 split, 50+ industries, 55+ PII/PHI categories, structured forms·invoices와 unstructured emails·notes·free text를 포함한다. 데이터셋 API 기준 downloads 4,556, likes 97이며, 라이선스는 CC BY 4.0이다.

다만 이 구조는 장점과 한계를 동시에 만든다. synthetic dataset은 실제 개인정보 노출 없이 span-level annotation을 대규모로 만들 수 있다는 장점이 있다. 하지만 실제 운영 텍스트의 오타, 다국어 혼합, 회사 내부 약어, 지역별 민감 정보 규칙, 특정 산업의 예외 표현까지 자동으로 보장하지는 않는다. 데이터셋 카드도 fully synthetic이고 real personal data를 피하도록 설계되었지만, deployment에서는 missed detection이나 unintended leakage를 막기 위해 별도 검증이 필요하다고 명시한다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| Target model API | 68.46M BF16 safetensors, token-classification, MIT, downloads 63 | 작은 공개 PII detector로 막 배포된 초기 모델 |
| Model card metrics | F1 96.27, precision 96.35, recall 96.19, accuracy 99.26 | Nemotron-PII test 기준 성능은 강하지만 verified leaderboard는 아님 |
| Base ETTIN model | encoder 68M, fill-mask, MIT, arXiv 2507.11412 tag | 생성형 LLM보다 encoder classification 계열에 가까운 기반 |
| Nemotron-PII dataset | 100K synthetic English records, 55+ categories, 50+ industries | 실제 개인정보 없이 폭넓은 span annotation을 만들려는 synthetic-data 접근 |
| Limitations | English only, occupation 등 일부 entity F1 낮음 | 도메인·언어·정책별 추가 평가 없이 compliance 자동화로 과신하면 위험 |

## 실무 관점에서의 해석

내가 보기에 ETTIN-68M Nemotron PII의 가치는 “최고 성능 개인정보 모델”이라는 주장보다 “PII detection을 매우 작은 운영 컴포넌트로 만들 수 있다”는 데 있다. 68M token classifier라면 대형 LLM 호출 전에 로컬 전처리기로 붙이거나, 로그 수집 파이프라인에서 batch masking을 돌리거나, RAG 인덱싱 전에 민감 스팬을 제거하는 식의 배치·온라인 혼합 구조를 만들기 쉽다. 특히 `api_key`, `password`, `http_cookie` 같은 소프트웨어 운영 민감값이 라벨에 포함되어 있다는 점은 개발자 로그와 에이전트 trace를 다루는 팀에 직접적이다.

동시에 이 모델은 OpenAI Privacy Filter 같은 더 큰 개인정보 전용 모델과는 다른 포지션에 있다. Privacy Filter 계열이 긴 컨텍스트와 preset operating point, 브라우저·로컬 실행 같은 제품화된 방향을 강조한다면, ETTIN-68M Nemotron PII는 훨씬 작고 표준적인 Hugging Face NER 모델에 가깝다. 그래서 고위험 컴플라이언스 판단의 최종 방어막이라기보다, 여러 보호 계층 중 가장 앞단의 빠른 detector로 읽는 편이 안전하다.

운영에 넣을 때는 적어도 세 가지를 따로 확인해야 한다. 첫째, 실제 데이터 분포에서 false negative 비용이 큰 entity를 별도 샘플링해 평가해야 한다. 모델 카드에서도 occupation처럼 낮은 F1을 보이는 항목이 있다. 둘째, 영어 전용 한계를 명확히 받아들여야 한다. 한국어 이름, 주소, 주민등록번호, 사업자번호, 지역별 전화번호 형식은 별도 규칙이나 추가 모델이 필요할 수 있다. 셋째, synthetic training data의 장점을 활용하되, 실제 배포 전에는 조직 내부 문서·로그·상담 데이터의 representative sample로 threshold와 후처리를 검증해야 한다.

그럼에도 방향성은 꽤 실용적이다. LLM 시스템의 프라이버시는 거대한 정책 문서만으로 지켜지지 않는다. 데이터가 모델에 들어가기 전, 검색 인덱스에 저장되기 전, 로그로 장기 보관되기 전, 사람이 리뷰하기 전의 작은 지점들에서 반복적으로 감지·마스킹·라우팅이 일어나야 한다. ETTIN-68M Nemotron PII는 바로 그 작고 반복적인 지점에 넣기 좋은 형태의 공개 모델이다. 완성된 개인정보 보호 솔루션은 아니지만, privacy-by-design 파이프라인을 더 가볍고 로컬 친화적으로 만들 수 있는 좋은 building block으로 볼 만하다.

Sources: https://huggingface.co/kalyan-ks/ettin-68m-nemotron-pii, https://huggingface.co/api/models/kalyan-ks/ettin-68m-nemotron-pii, https://huggingface.co/kalyan-ks/ettin-68m-nemotron-pii/raw/main/README.md, https://huggingface.co/kalyan-ks/ettin-68m-nemotron-pii/raw/main/config.json, https://huggingface.co/jhu-clsp/ettin-encoder-68m, https://huggingface.co/api/models/jhu-clsp/ettin-encoder-68m, https://huggingface.co/datasets/nvidia/Nemotron-PII, https://huggingface.co/api/datasets/nvidia/Nemotron-PII
