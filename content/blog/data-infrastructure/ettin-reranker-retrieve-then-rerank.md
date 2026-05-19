---
title: "Ettin Reranker는 retrieve-then-rerank 스택을 작은 ModernBERT 계열로 압축한다"
date: "2026-05-20T06:53:21"
description: "Hugging Face의 ettin-reranker-v1 계열은 Ettin ModernBERT encoder 위에 17M~1B CrossEncoder를 학습해, 공개 데이터·증류 레시피·MTEB/NanoBEIR·속도 벤치마크를 함께 제공하는 실전형 reranker 릴리스다."
author: "Sangmin Lee"
category: "data-infrastructure"
tags:
  - Hugging Face
  - Reranking
  - Retrieval
  - Sentence Transformers
  - ModernBERT
draft: false
---

검색형 AI 시스템에서 첫 번째 retrieval은 이미 꽤 싸졌다. 좋은 embedding 모델과 벡터 인덱스가 있으면 수백만 문서에서도 top-k 후보를 빠르게 뽑아낼 수 있다. 문제는 그 다음이다. 실제 사용자가 보는 답변 품질은 “비슷한 문서가 후보에 들어왔는가”보다, 그 후보들을 **질문과 문서의 세부 상호작용까지 보고 제대로 다시 정렬했는가**에 더 자주 좌우된다.

Hugging Face의 Tom Aarsen이 공개한 `ettin-reranker-v1` 계열은 바로 이 두 번째 단계를 겨냥한다. 릴리스는 `cross-encoder/ettin-reranker-17m-v1`부터 `1b-v1`까지 여섯 개 Sentence Transformers `CrossEncoder` 모델, 학습 데이터셋 `cross-encoder/ettin-reranker-v1-data`, 그리고 약 150줄짜리 단일 학습 스크립트/레시피를 함께 제시한다. 단일 모델 카드가 아니라, **크기별 품질·속도 trade-off를 같은 실험 틀에서 고를 수 있는 reranker ladder**에 가깝다.

흥미로운 점은 “더 큰 reranker 하나”가 아니라는 데 있다. 이 계열은 Johns Hopkins CLSP의 Ettin encoder suite를 기반으로 한다. Ettin은 17M부터 1B까지 같은 데이터와 레시피로 paired encoder/decoder를 훈련한 공개 모델군이고, encoder 쪽은 분류·검색·임베딩 같은 discriminative workload에 맞는다. `ettin-reranker-v1`은 그 encoder들을 query-document cross-encoder로 바꿔, RAG와 semantic search의 마지막 ranking 계층을 더 작고 빠른 ModernBERT 계열로 구성하려는 시도다.

![Embedding vs Reranker Models](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/train-reranker/embedding_vs_reranker_model.png)

## 무엇을 해결하려는가

일반적인 embedding 검색은 query와 document를 따로 인코딩한 뒤 벡터 유사도를 계산한다. 이 방식은 빠르고 대규모 인덱싱에 적합하지만, query와 document가 transformer layer 안에서 직접 서로를 보지는 못한다. 반대로 reranker, 즉 pointwise cross-encoder는 `(query, document)` 쌍을 한 번에 넣고 하나의 relevance score를 출력한다. 두 텍스트가 모든 layer에서 서로 attend할 수 있으므로 더 정확하지만, 후보 쌍마다 모델을 다시 실행해야 한다.

그래서 실무 패턴은 보통 retrieve-then-rerank다. embedding 모델이 top-100 같은 후보 집합을 빠르게 가져오고, cross-encoder가 그 작은 후보 집합만 다시 정렬한다. 비용은 후보 수에 묶이고, ranking 품질은 단순 벡터 유사도보다 올라간다. `ettin-reranker-v1`이 겨냥하는 병목은 바로 여기다. “큰 corpus 전체를 cross-encoder로 훑자”가 아니라, 이미 retrieval로 좁혀진 후보를 얼마나 싸고 강하게 재정렬할 수 있느냐가 핵심이다.

이 문제는 RAG에서 특히 중요하다. generator가 아무리 강해도, context에 들어온 문서 순서가 엉망이거나 정답 근거가 아래쪽으로 밀리면 답변 품질은 흔들린다. 기존에는 `ms-marco-MiniLM` 계열처럼 작고 빠른 reranker와, 1B 이상 대형 reranker 사이의 간극이 꽤 컸다. Ettin Reranker 계열은 그 사이를 17M, 32M, 68M, 150M, 400M, 1B로 촘촘하게 채운다.

## 핵심 아이디어 / 구조 / 동작 방식

모든 모델은 같은 큰 구조를 공유하고, backbone 크기만 다르다. 기본 backbone은 Ettin encoder이고, 그 위에 Sentence Transformers의 모듈형 classification head를 얹는다. 블로그가 공개한 head는 `Transformer(FA2) → CLS Pooling → Dense → LayerNorm → Dense(score)` 흐름이다. 일반적인 `AutoModelForSequenceClassification` 대신 `AutoModel` 기반 `Transformer` 모듈을 쓰는 이유도 실용적이다. variable-length input에서 sequence unpadding을 활용해 Flash Attention 2 경로를 더 잘 타기 위해서다.

| 모델 | Backbone | Hidden | Layers | Params |
|---|---|---:|---:|---:|
| `ettin-reranker-17m-v1` | `ettin-encoder-17m` | 256 | 7 | 17.6M |
| `ettin-reranker-32m-v1` | `ettin-encoder-32m` | 384 | 10 | 32.8M |
| `ettin-reranker-68m-v1` | `ettin-encoder-68m` | 512 | 19 | 68.6M |
| `ettin-reranker-150m-v1` | `ettin-encoder-150m` | 768 | 22 | 150.9M |
| `ettin-reranker-400m-v1` | `ettin-encoder-400m` | 1024 | 28 | 401.6M |
| `ettin-reranker-1b-v1` | `ettin-encoder-1b` | 1792 | 28 | 1.00B |

Hugging Face API와 모델 config를 보면 여섯 모델 모두 `sentence-transformers` 라이브러리의 `text-ranking` pipeline으로 공개되어 있고, 언어는 영어, 라이선스는 Apache 2.0, gated가 아닌 공개 모델이다. `config.json` 기준 model type은 `modernbert`, 최대 position은 7999로 잡혀 있다. 블로그는 이를 ModernBERT의 long-context pretraining 덕분에 8K token context를 받을 수 있는 reranker로 설명한다.

사용 방식도 표준 `CrossEncoder`에 맞춰져 있다.

```python
from sentence_transformers import CrossEncoder

model = CrossEncoder("cross-encoder/ettin-reranker-32m-v1")
scores = model.predict([
    ("Where was Apple founded?", "Apple Inc. was founded in Cupertino, California in 1976."),
    ("Where was Apple founded?", "The Fuji apple is an apple cultivar."),
])
```

즉 이 릴리스의 포인트는 새로운 추론 서버나 별도 프레임워크를 강제하는 것이 아니라, 이미 Sentence Transformers 기반으로 embedding/reranking을 쓰는 팀이 모델 이름만 바꿔 품질·속도 trade-off를 실험할 수 있게 하는 데 있다.

## 공개된 근거에서 확인되는 점

성능 근거는 두 축으로 제시된다. 첫째는 MTEB(eng, v2) Retrieval이다. 블로그는 10개 retrieval task에서 top-100 reranking을 수행하고, 여섯 embedding 모델과 조합해 평가했다고 설명한다. 대표 비교표에서 `cross-encoder/ettin-reranker-1b-v1`은 NDCG@10 0.6114로 teacher인 `mixedbread-ai/mxbai-rerank-large-v2`의 0.6115와 거의 같고, `400m-v1`은 0.6091로 1.54B teacher와 0.0024 차이라고 보고된다. `150m-v1`도 0.5994로, 600M 미만 reranker 중 강한 중간 계층으로 제시된다.

| Reranker | Params | MTEB(eng, v2) Retrieval NDCG@10 |
|---|---:|---:|
| `Qwen3-Reranker-4B` | 4.02B | 0.6367 |
| `mxbai-rerank-large-v2` teacher | 1.54B | 0.6115 |
| `ettin-reranker-1b-v1` | 1.00B | 0.6114 |
| `ettin-reranker-400m-v1` | 401M | 0.6091 |
| `ettin-reranker-150m-v1` | 151M | 0.5994 |
| `Qwen3-Reranker-0.6B` | 596M | 0.5940 |
| `ettin-reranker-68m-v1` | 68.6M | 0.5915 |
| `ettin-reranker-32m-v1` | 32.8M | 0.5779 |
| `ettin-reranker-17m-v1` | 17.6M | 0.5576 |

![Ettin rerankers with embeddinggemma-300m on MTEB retrieval](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ettin-reranker/mteb_ndcg10_embeddinggemma-300m.png)

둘째는 속도다. H100 80GB 단일 GPU, `bfloat16`, 자연스러운 Natural Questions 문서 길이 분포, `max_length=512`, 모델별 최적 attention implementation 조건에서 측정한 throughput 표가 공개되어 있다. 여기서 작은 Ettin 모델들은 기존 MiniLM reranker보다 높은 throughput과 높은 retrieval 점수를 동시에 보인다. 특히 17M은 7517 pairs/sec, 32M은 6602 pairs/sec, 68M은 4913 pairs/sec이고, 1B 모델도 928 pairs/sec로 teacher `mxbai-rerank-large-v2`의 387 pairs/sec보다 빠르게 제시된다.

| 모델 | Params | Attention | pairs/sec |
|---|---:|---|---:|
| `ettin-reranker-17m-v1` | 17M | FA2 | 7517 |
| `ettin-reranker-32m-v1` | 32M | FA2 | 6602 |
| `ettin-reranker-68m-v1` | 68M | FA2 | 4913 |
| `ettin-reranker-150m-v1` | 150M | FA2 | 3237 |
| `ettin-reranker-400m-v1` | 400M | FA2 | 1738 |
| `ettin-reranker-1b-v1` | 1B | FA2 | 928 |
| `mxbai-rerank-large-v2` teacher | 1.5B | FA2 | 387 |

학습 레시피도 공개 범위가 넓다. 여섯 모델은 모두 같은 단일 단계 distillation recipe로 학습됐다. teacher는 `mixedbread-ai/mxbai-rerank-large-v2`, loss는 pointwise MSE, 데이터는 `cross-encoder/ettin-reranker-v1-data`다. 이 데이터셋은 LightOn pre-training data 32개 split에서 온 약 110M triple과, LightOn fine-tuning retrieval data 7개 split을 teacher로 다시 점수화한 부분을 합쳐 총 약 143M `(query, document, score)` triple을 만든다. Hugging Face dataset API 기준 이 데이터셋은 public, non-gated, Apache 2.0이며, `task_categories:text-ranking`, `language:en`, `size_categories:100M<n<1B` 태그를 갖는다.

중요한 디테일은 hard negative만 잔뜩 넣은 것이 아니라는 점이다. 블로그는 fine-tuning retrieval data에서 query마다 최대 2048개 후보를 teacher로 다시 매기고, Jang et al.의 quantile-anchor/score-distribution 아이디어를 반영해 256개 후보로 줄인 뒤, 학습에서는 상위 hard negative와 중간 난이도 negative를 섞었다고 설명한다. 이는 reranker distillation을 “정답/오답을 가르는 분류”보다 teacher가 보는 score distribution을 흉내 내는 문제로 다루려는 선택이다.

| 공개 요소 | 확인된 내용 | 해석 |
|---|---|---|
| 모델 묶음 | 17M~1B 여섯 개 `CrossEncoder` | latency/quality 예산별 선택지를 한 family로 제공 |
| Backbone | JHU CLSP Ettin ModernBERT encoder | encoder-only discriminative workload에 맞춘 공개 기반 모델 |
| 입력 길이 | config `max_position_embeddings: 7999` | 일반 짧은 passage뿐 아니라 긴 문서 후보 reranking도 겨냥 |
| 학습 데이터 | 약 143M `(query, document, score)` triples | teacher distillation을 대규모 공개 데이터로 재현 가능하게 구성 |
| 라이선스 | 모델·데이터셋 모두 Apache 2.0 | 상용/운영 검토가 비교적 쉬운 공개 배포 |
| 평가 | MTEB(eng, v2), NanoBEIR, H100 throughput | 품질과 비용을 함께 보여 주려는 release shape |

## 실무 관점에서의 해석

내가 보기에 이 릴리스의 가장 중요한 의미는 “reranker도 모델 크기 ladder를 갖기 시작했다”는 점이다. 기존 검색 스택에서는 embedding 모델 선택지는 많았지만, reranker는 작은 MS MARCO 계열을 쓰거나, 비용을 감수하고 큰 reranker를 붙이는 식의 선택이 많았다. Ettin Reranker는 같은 backbone family와 같은 distillation recipe 위에서 17M부터 1B까지 이어지므로, 팀이 latency budget에 맞춰 단계적으로 실험하기 좋다.

두 번째 의미는 training recipe의 단순함이다. 블로그의 결론처럼 이 계열은 복잡한 multi-stage RL이나 proprietary labeling pipeline보다, 강한 teacher의 점수를 넓은 공개 데이터에 증류하는 방식으로 만들어졌다. 물론 teacher와 데이터 분포에 의존한다는 한계도 있지만, 공개 데이터셋과 학습 스크립트가 함께 있으므로 조직 내부 query-document 로그를 섞어 재학습하거나, 더 강한 teacher로 같은 구조를 반복하는 실험 경로가 비교적 명확하다.

세 번째는 RAG 운영에서의 분리 가능성이다. Retriever를 바꾸지 않아도 reranker만 교체해 최종 문서 순서를 개선할 수 있고, embedding model별로 reranker가 실제로 retriever-only baseline을 넘는지 확인할 수 있다. 블로그가 여섯 embedding 모델과 조합한 chart를 공개한 것도 이 점에서 중요하다. reranker는 단독 leaderboard 모델이 아니라, 특정 retriever와 top-k 후보 분포 위에서 평가되어야 하기 때문이다.

다만 caveat도 분명하다. 성능 주장은 MTEB(eng, v2) Retrieval과 NanoBEIR 중심이며, 언어도 영어로 명시되어 있다. 한국어 문서 검색, 코드 검색, 사내 위키, 고객 상담 로그처럼 분포가 다른 환경에서는 자체 held-out query set으로 다시 측정해야 한다. 또한 8K context를 받을 수 있다는 것과, 모든 운영 상황에서 긴 문서 reranking이 싸다는 것은 다르다. 블로그의 주요 throughput 표는 `max_length=512` 조건이므로, 실제 긴 passage를 많이 넣으면 후보 수·sequence length·batching 전략이 다시 병목이 된다.

또 하나 조심할 점은 score calibration이다. Cross-encoder score는 retrieval 후보를 정렬하는 데 유용하지만, 그 자체를 “답변 신뢰도”나 “문서 진실성”으로 직접 해석하면 위험하다. 운영 시스템에서는 retriever score, reranker score, source freshness, 권한/보안 필터, generator confidence를 분리해 봐야 한다. 특히 RAG에서 reranker는 좋은 문서를 위로 올리는 계층이지, hallucination이나 데이터 권한 문제를 자동으로 해결하는 계층은 아니다.

그럼에도 `ettin-reranker-v1`은 실무 검색 스택에 넣어 볼 만한 공개 릴리스다. 작은 17M/32M 모델은 빠른 재정렬 baseline으로, 68M/150M은 비용 대비 품질 균형점으로, 400M/1B는 강한 teacher급 성능을 더 작은 공개 모델로 재현하려는 선택지로 읽힌다. 앞으로 RAG 시스템의 경쟁력은 embedding 모델 하나보다, retriever·reranker·generator·evaluation set을 얼마나 함께 튜닝하느냐에 달려 있다. Ettin Reranker 계열은 그중 reranker 계층을 더 촘촘하고 재현 가능하게 만드는 좋은 building block이다.

Sources: https://huggingface.co/blog/ettin-reranker, https://github.com/huggingface/blog/blob/main/ettin-reranker.md, https://huggingface.co/collections/jhu-clsp/encoders-vs-decoders-the-ettin-suite, https://huggingface.co/blog/ettin, https://arxiv.org/abs/2507.11412, https://huggingface.co/cross-encoder/ettin-reranker-17m-v1, https://huggingface.co/cross-encoder/ettin-reranker-32m-v1, https://huggingface.co/cross-encoder/ettin-reranker-68m-v1, https://huggingface.co/cross-encoder/ettin-reranker-150m-v1, https://huggingface.co/cross-encoder/ettin-reranker-400m-v1, https://huggingface.co/cross-encoder/ettin-reranker-1b-v1, https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data, https://arxiv.org/abs/2604.04734
