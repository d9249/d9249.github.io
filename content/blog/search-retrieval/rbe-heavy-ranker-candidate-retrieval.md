---
title: "RBE는 heavy ranker의 점수를 support 좌표로 바꿔 후보 검색을 다시 설계한다"
date: "2026-08-12T21:48:59+09:00"
description: "Relevance-Based Embeddings는 query와 item을 소수 support 집합에 대한 heavy-ranker relevance 벡터로 표현하고, CUR 또는 경량 신경 변환으로 별도 embedding을 만들어 후보 검색에 쓰는 방법이다."
author: "Sangmin Lee"
category: "search-retrieval"
tags:
  - Relevance-Based Embeddings
  - Retrieval
  - Reranking
  - Candidate Selection
  - Dual Encoder
draft: false
---

검색·추천 시스템의 final ranker는 대체로 가장 똑똑하다. query와 문서를 함께 읽는 cross-encoder, 사용자·아이템·문맥을 함께 보는 production ranker는 pairwise feature를 활용할 수 있다. 하지만 후보가 수십만~수억 개면 모든 쌍을 점수화할 수 없다. 그래서 보통은 query와 item을 따로 embedding하는 dual encoder로 후보를 빠르게 만들고, 그 뒤 작은 top-k만 heavy ranker로 다시 정렬한다.[1]

`Relevance-Based Embeddings: Lightweight Candidate Retrieval via Heavy-Ranker Calls`는 이 분업을 다른 방식으로 잇는다. query를 **소수 support item에 대한 heavy-ranker 점수 벡터**로, item을 **소수 support query에 대한 점수 벡터**로 표현한다. 그리고 이 relevance vector를 CUR 근사 또는 작은 신경망에 넣어 query/item embedding을 만든다. 즉 “텍스트나 메타데이터만 따로 encode한 벡터” 대신, 강한 ranker가 이미 알고 있는 pairwise 판단을 좌표계로 삼는다.[1]

![논문 Figure 1: RBE가 support query와 support item에 대한 relevance로 전체 query-item 행렬을 근사하는 구조](/images/blog/rbe-paper-overview.png)

*논문 Figure 1. 노란색은 support item, 빨간색은 support query, 파란색은 test query를 나타낸다. test query의 support-item relevance와 각 item의 support-query relevance를 독립 변환해 전체 relevance를 근사한다.[2]*

이 글은 이전에 공개 GitHub notebook만 중심으로 설명했던 내용을 **OpenReview 원문과 대응 arXiv v1 본문을 기준으로 전면 정정**한 것이다. 핵심은 CUR 자체가 아니라, support relevance를 입력으로 쓰는 embedding family와 그 이론·실험이다. 논문은 2026년 7월 3일 공개된 arXiv v1이며, 공식 코드는 저자 저장소에 공개되어 있다.[1][2][3]

## 무엇을 해결하려는가

일반 dual encoder는 다음과 같이 동작한다.

```text
item → F_I(item) ┐
                 ├─ dot product / cosine → ANN search → candidate top-k
query → F_Q(query)┘
```

이 구조는 ANN index와 잘 맞지만, query와 item을 함께 봐야 계산되는 신호를 직접 넣기 어렵다. 예를 들어 검색에서는 query term과 document term의 상호작용, 추천에서는 사용자와 아이템의 최근 상호작용·문맥 feature가 중요할 수 있다. 이런 정보는 strong cross-encoder 또는 tabular ranker에는 들어가도, item과 query를 독립적으로 인코딩하는 dual encoder에는 그대로 남기기 어렵다.[2]

RBE의 출발점은 이것이다. 이미 강한 relevance function `R(item, query)`가 있다면, 새 query를 support item `S_I`에 대한 점수 벡터 `R(S_I, q)`로 표현할 수 있다. 마찬가지로 item은 support query `S_Q`에 대한 점수 벡터 `R(i, S_Q)`로 표현한다. 이 벡터는 heavy ranker가 잡아낸 pairwise signal의 일부를 보존한 관측값이다.[2]

| 방식 | 후보 검색에 쓰는 표현 | heavy ranker와의 관계 | 핵심 한계 |
|---|---|---|---|
| Dual encoder | 원본 query/item feature의 독립 embedding | 보통 distillation target 또는 final reranker | pairwise feature를 직접 담기 어렵다 |
| CUR / AnnCUR | support relevance vector + 선형 복원 | support 점수에서 전체 score를 행렬 근사 | 선형 구조와 support 선택에 민감하다 |
| RBE | support relevance vector를 경량 신경 변환한 embedding | heavy-ranker prediction 자체를 feature로 사용 | support score 호출과 offline 준비 비용이 남는다 |
| Full reranking | 모든 `(query, item)` pair score | ranker를 직접 전체에 호출 | corpus 규모에서 latency·비용이 감당되지 않는다 |

따라서 RBE는 heavy ranker를 제거하는 방법이 아니다. **heavy ranker를 소수 support 좌표를 측정하는 장치로 쓰고**, 이후 후보 탐색은 ANN-friendly embedding 공간에서 수행하려는 아키텍처다.

## 핵심 아이디어 / 구조 / 동작 방식

### support relevance가 embedding의 입력이 된다

논문은 support item 집합 `S_I`와 support query 집합 `S_Q`를 둔다. query `q`의 입력은 `R(S_I, q)`, item `i`의 입력은 `R(i, S_Q)`다. 두 입력을 각각 변환한 뒤 내적으로 최종 근사 score를 만든다.

```text
query q
  └─ heavy ranker on support items S_I ─→ R(S_I, q) ─→ f_Q ─→ e_Q(q)

item i
  └─ offline heavy ranker on support queries S_Q ─→ R(i, S_Q) ─→ f_I ─→ e_I(i)

candidate score:  R̃(i, q) = < e_I(i), e_Q(q) >
```

여기서 `f_Q`, `f_I`는 identity/선형 변환일 수도 있고, 논문의 neural RBE에서는 MLP 같은 universal approximator가 된다. CUR은 이 family의 특별한 경우다. support submatrix의 pseudoinverse를 통해 item relevance vector를 선형 변환하고, query의 support-item relevance vector와 내적한다.[2]

```text
CUR: R̃(i, q) = < R(i, S_Q) · pinv(R(S_I, S_Q)), R(S_I, q) >

RBE: R̃(i, q) = < f_I(R(i, S_Q), θ_I), f_Q(R(S_I, q), θ_Q) >
```

논문 구현에서는 CUR representation을 출발점으로 남겨 두고, 신경망이 그 오차를 추가 예측하도록 구성한다. 저자들은 이 분해가 수렴과 학습 안정성에 도움이 됐다고 보고한다. 학습은 sampled batch와 listwise loss, Adam을 사용한다.[2]

### 이론적 주장: support가 충분하면 연속 relevance를 근사할 수 있다

논문은 두 수준의 보장을 제시한다.

1. **Regularized CUR 보장**: 적절히 많은 독립 표본 support item/query와 작은 regularization이 있으면, CUR 근사는 true relevance function에 `L2` 의미에서 임의로 가까워질 수 있다.
2. **Neural RBE 보장**: query/item 공간이 compact이고 relevance function이 연속이면, support relevance vector를 입력으로 하는 두 신경 변환의 내적으로 true relevance를 균일 오차 기준에서 임의로 가깝게 근사할 수 있다.

두 번째가 논문의 중심이다. 단순히 “CUR이 잘 된다”가 아니라, pairwise feature에 의존하는 연속 relevance function도 support relevance를 통한 별도 query/item embedding으로 표현할 수 있다는 존재 보장이다.[2]

다만 이는 **충분히 큰 support set과 적합한 변환이 존재한다**는 근사 이론이다. 특정 support budget, 특정 ranker, 특정 catalog에서 정해진 recall·latency를 보장하는 production SLA는 아니다. 논문도 실제 성능과 호출 수를 맞추려면 support 선택과 원래 feature 보강이 중요하다고 적는다.[2]

### support selection은 부수 옵션이 아니라 핵심 설계다

random support는 기존 AnnCUR 계열의 기본 출발점이지만, 논문은 support item을 어떻게 고르느냐가 근사 품질을 크게 바꾼다고 본다. 비교한 선택 전략은 random, popular, cluster center, most diverse, 그리고 CUR의 train-query MSE를 greedy하게 줄이는 `l2-greedy`다.[2]

| support 선택 | 직관 | 논문에서의 역할 |
|---|---|---|
| Random | 균일 샘플 | AnnCUR 계열의 기준선 |
| Popular | 평균 relevance가 높은 item | 인기 분포가 강한 추천 영역에서 유용할 수 있음 |
| Cluster centers | 대표적인 relevance vector 선택 | 간단한 clustering만으로도 random보다 개선되는 경우가 많음 |
| Most diverse | 기존 support와 가장 먼 item을 순차 선택 | coverage를 넓히는 휴리스틱 |
| `l2-greedy` | CUR reconstruction MSE를 직접 줄이도록 선택 | 논문의 주력 선택 전략 |

`l2-greedy`의 비용도 함께 봐야 한다. 기본 형태의 popularity·cluster center·diversity·`l2-greedy` 선택은 item 전체와 support query 사이 relevance를 계산해야 하므로 offline `O(M·|S_Q|)` 비용이 든다. 이것이 불가능할 때 논문은 candidate downsampling, 더 싼 기존 embedding 사용, 사전 정의 category cluster 활용을 제안한다.[2]

## 공개된 근거에서 확인되는 점

### 데이터와 heavy ranker의 범위

논문은 entity linking, QA, recommendation을 함께 다룬다. 공개 재현 측면에서 ZESHEL의 5개 domain에는 선행 연구의 cross-encoder를, MS MARCO 기반 QA에는 `all-mpnet-base-v2`를 heavy ranker로 사용한다. QA full setting은 약 1만 test query와 0.8M passage, support-selection table용 QA.Small은 82K passage다. recommendation 실험은 Yandex Games/Music의 CatBoost 기반 heavy ranker와 강한 production dual encoder를 사용한다.[2]

| 평가 영역 | 규모/예시 | heavy ranker | 주의할 점 |
|---|---|---|---|
| ZESHEL entity linking | 5개 Wikia domain | 선행 연구 cross-encoder | 공개 academic benchmark |
| QA / MS MARCO | QA는 약 0.8M passage, QA.Small 82K | `all-mpnet-base-v2` | 논문 자체의 candidate retrieval metric 사용 |
| RecGames1/2 | 각 16,514 item | CatBoost production ranker | 내부 production data/feature에 의존 |
| RecMusic | 8,950 item | CatBoost production ranker | 내부 production data/feature에 의존 |

논문 전반의 후보 품질 지표는 `HitRate(k_r, k)`이며, predicted top-`k_r`와 heavy-ranker true top-`k` 사이 교집합 비율이다. 저자들은 이를 Yadav et al. (2022)의 Top-k Recall@`k_r`와 동등하다고 설명한다. 모든 기본 실험에서 test query 비중은 약 30%, support item 수는 100, support query 집합은 training query로 둔다.[2]

### RBE의 neural mapping과 support selection 결과

Table 2에서 `RBE + l2-greedy`는 `HitRate(100)`로 ZESHEL 5개 domain, RecGames1/2, RecMusic, QA를 비교한다. RBE mapping은 Military를 제외한 각 데이터셋에서 같은 support-selection의 AnnCUR보다 높다. 예를 들어 QA는 AnnCUR `0.5522`, AnnCUR + `l2-greedy` `0.5700`, RBE + `l2-greedy` `0.6022`다. RecMusic에서는 각각 `0.1478`, `0.1478`, `0.3964`로 neural RBE의 차이가 크게 나타난다.[2]

| `HitRate(100)` 예시 | AnnCUR | AnnCUR + `l2-greedy` | RBE + `l2-greedy` |
|---|---:|---:|---:|
| Yugioh | 0.4724 | 0.5618 | **0.5849** |
| RecGames1 | 0.5842 | 0.6565 | **0.6682** |
| RecMusic | 0.1478 | 0.1478 | **0.3964** |
| QA | 0.5522 | 0.5700 | **0.6022** |

이 표는 final answer 품질이나 표준 nDCG/MRR을 뜻하지 않는다. heavy ranker가 정의한 top-100을 RBE candidate가 얼마나 회수하는가를 보는 candidate-retrieval 평가다. 특히 production recommendation 결과는 내부 데이터와 baseline 위에서 나온 것이므로 외부 시스템에 그대로 숫자를 이식할 수 없다.[2]

### dual encoder와의 비용-품질 비교

논문은 RecGames와 RecMusic에서 기존 production dual encoder와 직접 비교한다. Table 3의 trainable parameter 수는 RBE 약 50K, RecGames DE 약 300M, RecMusic DE 약 700M으로 제시된다. 이는 RBE의 변환부가 작다는 뜻이지, support score를 얻는 heavy-ranker 인프라 비용까지 50K parameter라는 뜻은 아니다.[2]

공정한 비교를 위해 저자들은 RBE가 query당 support item 100개에 heavy ranker를 호출하는 비용을 반영한다. 즉 DE에는 RBE의 support-call 수만큼 더 큰 final reranking budget을 주고 비교한다. 그럼에도 RecGames1 Table 4에서 candidate budget이 커질수록 `RBE + l2-greedy`가 dual encoder/AXN DE보다 높은 HitRate를 보인다. 예컨대 predicted top-500과 heavy-ranker top-100을 비교하는 `HR(500,100)`은 Dual Encoder `0.9086`, AXN DE `0.9153`, RBE `0.9522`다.[2]

| RecGames1, heavy-ranker top-100 회수 | Dual Encoder | AXN DE | RBE + `l2-greedy` |
|---|---:|---:|---:|
| `HR(200,100)` | 0.7977 | 0.7970 | **0.8359** |
| `HR(500,100)` | 0.9086 | 0.9153 | **0.9522** |
| `HR(900,100)` | 0.9561 | 0.9660 | **0.9799** |

저자들의 해석은 “RBE가 작은 trainable mapping으로도 heavy ranker의 pairwise judgement를 후보 단계에 더 잘 전달할 수 있다”는 것이다. 하지만 이 비교 역시 해당 production data, support size 100, budget-adjusted protocol에 한정된다.[2]

## 실무 관점에서의 해석

이 논문을 단순히 “heavy ranker를 덜 부르는 CUR trick”으로 보면 핵심을 놓친다. RBE는 **relevance function이 representation을 만드는 교사이자 feature provider**라는 관점이다. distillation이 heavy model의 output으로 새 bi-encoder를 훈련해 대체하려 한다면, RBE는 inference 시에도 support set에 대한 실제 heavy-ranker score를 남겨 둔다. 따라서 query가 바뀌어도 strong pairwise model의 signal 일부를 직접 사용한다.[2]

대신 시스템 조건이 명확하다.

| 도입 체크 | 왜 필요한가 |
|---|---|
| strong하고 안정적인 heavy ranker | RBE는 그 ranker의 relevance를 근사하므로 teacher가 나쁘면 사용자 경험도 나빠질 수 있다 |
| query당 support-call budget | inference마다 `|S_I|`개의 heavy-ranker score가 필요하다 |
| offline support/index refresh | catalog drift와 ranker update가 있으면 item representation·support selection을 갱신해야 한다 |
| candidate recall과 final metric 분리 | HitRate가 좋아도 final nDCG, CTR, answer quality가 자동으로 좋아지는 것은 아니다 |
| filter-aware ANN 운영 | RBE embedding은 ANN index로 갈 수 있지만 서비스 filter·freshness 조건과 함께 검증해야 한다 |
| support strategy A/B | random, category center, KMeans, `l2-greedy`는 같은 budget에서 결과가 크게 달라질 수 있다 |

동적 catalog에는 feature-based item RBE가 장점이 될 수 있다. 새 item은 support query에 대한 score를 구해 기존 `f_I`로 embedding할 수 있다. 반대로 item 집합이 작고 안정적이면 item별 trainable vector로 바꿔 offline heavy-ranker 호출을 더 줄일 수 있다. query는 열린 집합이므로 완전히 item lookup 방식으로 바꾸기 어렵다는 점도 논문이 구분한다.[2]

한계도 분명하다. 이론 보장은 support set이 충분히 커지는 극한의 결과이고, 실제 시스템은 작은 support budget·ranker latency·drift·feature availability 안에서 움직인다. 특히 support score를 만드는 final ranker가 신뢰할 수 없으면 RBE가 heavy-ranker top-k를 더 잘 회수해도 실제 사용자 효용은 나빠질 수 있다. 논문도 바로 이 점을 limitation으로 든다.[2]

그래도 RBE는 중요한 질문을 제기한다. 후보 검색 모델은 반드시 query와 item의 원본 feature만 따로 압축해야 할까? 이미 잘 작동하는 expensive relevance function이 있다면, 그 판단을 소수 support 축에서 관찰하고 별도 embedding 공간으로 옮기는 길도 있다. RBE는 그 길을 CUR, 신경 근사, support selection, ANN retrieval까지 하나의 설계로 연결한다.

## Sources

[1] https://openreview.net/forum?id=0RNjyGzTSJ — 사용자 제공 OpenReview PDF 식별자
[2] https://arxiv.org/abs/2607.03515v1 및 https://arxiv.org/html/2607.03515v1 — 논문 본문, 이론, Figure 1, 표와 실험 설정
[3] https://github.com/shevkunov/Relevance-Based-Embeddings-Lightweight-Candidate-Retrieval — 저자 공개 코드 및 experiment notebook
