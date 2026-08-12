---
title: "RBE는 heavy ranker를 ‘전체 정렬기’가 아니라 후보 선택용 측정기로 바꾼다"
date: "2026-08-12T21:17:45+09:00"
description: "Relevance-Based Embeddings(RBE)는 소수 support item에만 heavy ranker를 호출하고, CUR 행렬 근사로 전체 후보 relevance를 복원해 값비싼 reranking 호출을 후보 선택 단계로 압축하려는 연구형 코드 공개물이다."
author: "Sangmin Lee"
category: "search-retrieval"
tags:
  - Relevance-Based Embeddings
  - Retrieval
  - Reranking
  - CUR Decomposition
  - Candidate Selection
draft: false
---

강한 cross-encoder나 LLM reranker는 query와 문서 쌍의 relevance를 정교하게 읽지만, corpus 전체에 적용하기에는 비싸다. 그래서 일반적인 검색 스택은 cheap embedding 또는 lexical retriever로 넓게 후보를 뽑고, heavy ranker는 작은 top-k에만 쓴다. `Relevance-Based Embeddings: Lightweight Candidate Selection via Heavy Ranker Calls`(RBE)는 여기서 한 단계 더 들어간다. heavy ranker를 최종 후보 모두에 호출하지 않고, **소수의 support item에 대한 점수만 계산한 뒤 그 신호로 전체 후보의 점수를 근사**하려 한다.[1][2]

이 공개물은 완성된 라이브러리나 논문 landing page보다 실험 notebook 묶음에 가깝다. 저장소 README도 추가 실험에는 재사용보다 재구현이 쉽다고 적고 있으며, 표별 실험 위치 중 일부는 아직 찾지 못했다고 명시한다.[2] 따라서 RBE는 당장 도입할 package라기보다, expensive relevance function을 저차원 관측으로 압축할 수 있는지 검토하기 위한 **후보 선택 설계와 재현 단서**로 읽는 편이 정확하다.

<figure style="margin: 1.8rem 0;">
  <div style="overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch;">
    <a href="/images/blog/rbe-heavy-ranker-candidate-flow.svg" style="display: block; min-width: 760px;">
      <img
        src="/images/blog/rbe-heavy-ranker-candidate-flow.svg"
        alt="소수 support item에만 heavy ranker를 호출하고 CUR 근사로 전체 후보를 복원해 top-k 후보를 고르는 RBE 흐름도"
        style="width: 100%; min-width: 760px; max-width: none; height: auto; display: block; background: #fff;"
      />
    </a>
  </div>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    저장소의 `AnnCUR`와 `CURApprox` 구현을 바탕으로 재구성한 후보 선택 흐름. 전체 corpus 점수를 직접 계산하는 대신 support item 점수로 근사한다.[3][4]
  </figcaption>
</figure>

## 무엇을 해결하려는가

Reranking 비용은 대체로 `query × 후보 수 × 문서 길이`에 비례한다. 후보를 1,000개로 넓히면 recall에는 유리할 수 있지만 heavy ranker의 GPU 시간과 latency가 빠르게 커진다. 반대로 처음 단계의 dense embedding만으로 후보 수를 아주 작게 자르면, heavy ranker가 되살릴 수 있었던 관련 문서를 놓칠 수 있다.

RBE의 문제 설정은 둘 사이의 절충이다. 어떤 query와 모든 item의 heavy-ranker relevance를 행렬로 생각하면, 온라인에서 필요한 것은 그 행렬의 한 행이다. 하지만 이 행 전체를 계산하지 않고, 미리 고른 support item 열의 score만 얻어 전체 행을 추정할 수 있다면 heavy ranker의 호출 수를 corpus 크기에서 support-set 크기로 옮길 수 있다.[3][4]

핵심은 support item이 무작위 샘플이 아니라 전체 relevance 구조를 대표해야 한다는 점이다. 저장소에는 K-means 계열, farthest-first에 가까운 `K_by_min`, popularity, co-item 기반 및 greedy 선택 실험이 함께 있다.[2][5] 즉 RBE의 성패는 “embedding dimension을 몇으로 둘까”보다 **어떤 item을 실제 측정 지점으로 선택할 것인가**에 크게 묶인다.

## 핵심 아이디어: ranker score를 CUR 좌표로 바꾼다

저장소의 `CURApprox`는 선택한 행·열로 행렬을 근사하는 CUR 분해를 구현한다. 코드 주석의 표기는 `M ≈ C U R`이다. `C`는 선택 열, `R`은 선택 행, `U`는 두 부분을 연결하는 작은 행렬이며, 기본 경로에서는 교차 부분행렬의 Moore–Penrose pseudoinverse를 사용한다.[3]

RBE의 후보 선택 관점에서는 다음처럼 읽을 수 있다.

| 단계 | 오프라인에 준비할 것 | query마다 계산할 것 | 목적 |
|---|---|---|---|
| 1. support 선택 | corpus에서 대표 item `S` 선택 | 없음 | 측정할 relevance 좌표를 제한 |
| 2. CUR factor 구성 | 학습 relevance 행렬의 `C`, `U`, `R` 구성 | 없음 | support score에서 전체 점수를 복원할 선형 구조 준비 |
| 3. support scoring | support item 목록 유지 | `q × S`만 heavy ranker로 점수화 | 비싼 호출을 `|S|`개로 제한 |
| 4. 점수 복원 | factor cache | `q × S`에서 전체 item score 근사 | full corpus 후보를 재정렬하지 않고 top-k 추출 |
| 5. 정밀 단계 | 선택 사항 | 근사 top-k만 추가 rerank | 근사 오차를 최종 품질 단계에서 완화 |

`AnnCUR` notebook 구현도 이 흐름을 직접 드러낸다. 초기화 때 training relevance matrix에서 support item 열을 잡고 `CURApprox(..., approx_preference="rows")`를 구성한다. 이후 `recommend`는 새 request의 support-item relevance만 모아 `get_complete_row`에 넣고, 이 함수는 sparse row와 latent column의 곱으로 전체 score row를 만든다.[4]

```text
support 점수 s(q, S)
        ↓
전체 relevance 근사  ŝ(q, I) = s(q, S) · latent_cols
        ↓
argsort(ŝ) → candidate top-k
```

여기서 RBE는 일반 semantic embedding처럼 텍스트만 독립적으로 encode하는 모델이 아니다. embedding의 좌표는 support item에 대한 relevance 관측에서 나온다. 그래서 support item을 바꾸면 representation도 바뀌고, underlying heavy ranker를 바꾸면 같은 후보 선택기의 의미도 달라진다.

## 공개된 근거에서 확인되는 점

저장소가 실제로 무엇을 제공하는지와 무엇을 제공하지 않는지는 분리해서 봐야 한다.

| 확인 항목 | 공개물에서 확인한 내용 | 해석 |
|---|---|---|
| 저장소 성격 | Python 파일 1개와 다수 Jupyter notebook 실험으로 구성 | product-ready package보다 experiment archive에 가깝다 |
| 핵심 근사 | `CURApprox`가 선택 행·열, pseudoinverse, latent row/column을 계산 | CUR 기반 전체 relevance 복원이 구현돼 있다 |
| 후보 선택 | K-means, MiniBatch K-means, clustering, random, greedy 등 variant | support-item 선택 자체가 연구 변수다 |
| heavy-ranker 신호 | README는 `QA sample, different heavy ranker` 실험 notebook을 지정 | ranker 교체에 대한 실험 의도는 보이나, 통합 API는 없다 |
| 실험 자산 | README는 Table 1, 2, 4, 7, 8, 9의 notebook 위치를 연결 | 여러 실험 결과의 원자료는 남아 있다 |
| 재현성 경고 | README가 새 구현을 권하고 일부 table data는 `tbd`로 표시 | 논문 수치 재현이나 확장 실험은 추가 정리가 필요하다 |
| 릴리스·라이선스 | GitHub API 기준 tags·releases가 비어 있고, checked-in `LICENSE`도 없다 | 버전 고정과 법적 사용 조건은 별도 확인이 필요하다 |

한 가지 구체적인 실행 흔적도 있다. `proof-of-concept-open-data-round7-ms-query-ce9650.ipynb`의 `AnnCUR`은 100개 key item을 사용하며, `get_score`는 예측 top-100과 target score의 top-100 사이 교집합 비율을 평균한다.[4] 이 notebook에는 train 0.5138, test 0.4983의 출력이 남아 있다. 다만 이것은 표준 MS MARCO MRR이나 nDCG가 아니라 해당 notebook의 **top-100 overlap proxy**이며, 데이터 준비·heavy ranker·split·support 선택 조건이 함께 고정된 단일 실행 결과다.[4] 일반 benchmark SOTA나 다른 reranker 대비 우위로 옮겨 읽으면 안 된다.

또한 코드가 말하는 약속은 score reconstruction이지 최종 answer quality가 아니다. `get_complete_row`는 작은 support score vector에 latent factor를 곱할 뿐이다.[3] 따라서 실제 도입에서는 최소한 후보 recall@k, 후보 수별 latency, final reranker의 nDCG/MRR, support selection 갱신 비용을 따로 봐야 한다.

## 왜 ‘후보 선택기’로 해석해야 하는가

RBE는 heavy ranker를 없애는 기술이 아니다. 오히려 heavy ranker의 relevance function을 더 적은 위치에서 호출하고, 그 결과를 후보 생성기로 재활용하는 방법이다. 이 차이가 중요하다.

| 접근 | expensive model의 역할 | 전체 corpus에서의 계산 | 주된 실패 모드 |
|---|---|---|---|
| Dense retriever | 사전학습/encoding | query와 vector index 비교 | relevance 정의가 weak ranker에 제한 |
| 일반 2-stage rerank | 최종 후보 재정렬 | cheap retriever가 먼저 후보를 좁힘 | 첫 단계 recall 손실 |
| RBE 후보 선택 | support item의 relevance 측정 | CUR 근사로 전체 후보 score 생성 | support가 구조를 대표하지 못하면 근사 recall 하락 |
| full cross-encoder | 모든 item 정밀 점수화 | 모든 `(query, item)`을 계산 | 비용과 latency가 corpus 크기에 묶임 |

이 방식이 어울리는 조건도 비교적 명확하다. 첫째, heavy ranker의 score matrix가 어느 정도 저차원 또는 반복 구조를 가져야 한다. 둘째, support set을 오프라인에서 안정적으로 고를 수 있어야 한다. 셋째, 서비스는 근사 후보를 빠르게 만들고 그 뒤에 별도 precision layer를 둘 수 있어야 한다. 반대로 query distribution이나 catalog가 자주 바뀌면 factor와 support set이 오래된 relevance geometry를 반영할 수 있다.

## 실무 관점에서의 해석

내가 보기에 RBE의 가장 흥미로운 지점은 “embedding 모델”이라는 이름보다 **expensive scorer를 약한 retriever의 teacher로만 쓰지 않고, 온라인 후보 선택의 측정 장치로도 쓴다**는 발상이다. 기존 distillation은 heavy ranker로 label을 만들고 lightweight bi-encoder를 훈련해 ranker를 대체하는 경우가 많다. RBE는 support item에 대한 actual score를 온라인에도 남겨 둔다. 그러므로 query가 바뀌어도 heavy ranker의 신호를 일부 직접 가져갈 수 있다.

그 대가로 운영 표면은 가벼워지지 않는다. support-size `m`을 잡으면 온라인에 최소 `m`회의 heavy-ranker pair scoring이 남는다. `m`이 너무 작으면 candidate recall이 떨어지고, 너무 크면 일반 reranking과의 비용 차이가 사라진다. support set 교체, matrix factor의 conditioning, score calibration, catalog 증분 반영도 모두 운영 변수다.

도입 전에는 다음처럼 작은 검증으로 시작하는 편이 낫다.

| 검증 | 이유 |
|---|---|
| support size별 candidate recall@50/100/500 | RBE의 첫 번째 목적은 final rank가 아니라 후보 누락을 막는 것 |
| random·popular·clustering·greedy support를 같은 budget에서 비교 | 저장소도 support-selection strategy를 핵심 실험 변수로 둔다 |
| full heavy ranker 대비 p50/p95 latency와 GPU pair-score 수 측정 | 절감은 구조적 가능성이지 저장소가 보편 수치로 보장한 값은 아니다 |
| RBE top-k 뒤 final rerank의 nDCG/MRR 측정 | 근사 단계의 score MSE가 최종 검색 품질과 같지 않다 |
| catalog/query drift 후 factor 재생성 주기 측정 | 오래된 support와 factor는 relevance geometry를 놓칠 수 있다 |
| 라이선스·재현성 검토 | 현재 저장소에는 release/tag와 LICENSE가 없고 README도 재구현을 권한다 |

정리하면 RBE는 “작은 embedding 모델 하나를 내려받아 vector DB에 넣는” 형태의 기술이 아니다. heavy ranker가 가진 판단을 소수 support item에서 측정하고, CUR 근사로 넓은 후보군에 퍼뜨리는 retrieval architecture다. 코드 공개 범위는 아직 연구 노트에 가깝지만, ranker 비용을 줄이면서 약한 first-stage retriever의 recall 한계를 넘고 싶은 팀에는 충분히 검증할 가치가 있는 질문을 던진다: **모든 문서를 다시 점수화하지 않고도, relevance function의 구조를 얼마나 보존할 수 있는가.**

## Sources

[1] https://github.com/shevkunov/Relevance-Based-Embeddings-Lightweight-Candidate-Retrieval — 공식 저장소
[2] https://raw.githubusercontent.com/shevkunov/Relevance-Based-Embeddings-Lightweight-Candidate-Retrieval/main/README.md — README, 실험 위치와 재사용 경고
[3] https://raw.githubusercontent.com/shevkunov/Relevance-Based-Embeddings-Lightweight-Candidate-Retrieval/main/exps/matrix_approx_zeshel.py — CURApprox 구현
[4] https://github.com/shevkunov/Relevance-Based-Embeddings-Lightweight-Candidate-Retrieval/blob/main/exps/proof-of-concept-open-data-round7-ms-query-ce9650.ipynb — AnnCUR, support item, 실행 출력
[5] https://github.com/shevkunov/Relevance-Based-Embeddings-Lightweight-Candidate-Retrieval/blob/main/exps/greedy_item_choice_variants.ipynb — greedy support-item 선택 variant
[6] https://api.github.com/repos/shevkunov/Relevance-Based-Embeddings-Lightweight-Candidate-Retrieval — GitHub API metadata, release/tag/license 상태
