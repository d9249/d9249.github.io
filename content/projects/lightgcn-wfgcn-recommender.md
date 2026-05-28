---
title: "추천 시스템에서 그래프 콘볼루션 네트워크 최적화"
projectName: "GCN 추천 시스템 최적화 연구"
tagline: "Egress 초기화와 Weighted Forwarding으로 임베딩 손실을 완화한 석사 논문 연구"
period: "Kyonggi University / M.S. Thesis"
periodOrder: 20240200
description: "석사학위논문 「추천 시스템에서 그래프 콘볼루션 네트워크 최적화 방법」을 기반으로, GCN 추천 시스템의 임베딩 값 손실과 깊은 Layer 구성 한계를 분석하고 Egress 초기화와 Weighted Forwarding(WF)으로 학습 속도와 추천 정확도 개선을 검증한 연구입니다."
metrics:
  - "Egress Initialization"
  - "Weighted Forwarding"
  - "Recall@20 / NDCG@20"
stack:
  - "Graph Convolution Network"
  - "Recommendation System"
  - "LightGCN"
  - "PyTorch"
  - "PCA / GKDE"
  - "MovieLens-1M / FilmTrust / Yelp2018 / Douban-book"
details:
  - "GCN 기반 추천에서 임베딩 값이 작은 범위로 수렴하며 정보가 약화되는 문제와 깊은 Layer를 쌓기 어려운 문제를 연구 주제로 정의했습니다."
  - "Egress 초기화로 더 넓은 임베딩 초기화 범위를 적용하고, Weighted Forwarding으로 전파 전 임베딩에 가중치를 곱해 다음 Layer에 전달하는 구조를 제안했습니다."
  - "FilmTrust, MovieLens-1M, Yelp2018, Douban-book 벤치마크에서 Recall@20/NDCG@20과 최고 성능 epoch를 비교했습니다."
  - "LightGCN, BUIR, MixGCF, SGL, SimGCL, XSimGCL 등 기존 추천 알고리즘에 제안 기법을 적용해 효과와 한계를 검증했습니다."
order: 60
draft: false
---

## 연구의 출발점

추천 시스템은 사용자가 방대한 콘텐츠와 상품 중에서 자신에게 맞는 항목을 빠르게 찾도록 돕는 기술입니다. 논문은 이 문제를 사용자-아이템 상호작용 그래프로 바라보고, 그래프 콘볼루션 네트워크(Graph Convolution Network, GCN)가 복잡한 관계를 모델링하는 데 강점이 있다는 점에서 출발했습니다.

다만 GCN 기반 추천 모델은 학습 과정에서 두 가지 실용적인 한계를 보였습니다.

- **임베딩 값 손실**: Layer를 거치며 사용자와 아이템 임베딩이 작은 값으로 수렴하고, 전파되는 정보의 표현력이 약해질 수 있습니다.
- **깊은 Layer 구성의 어려움**: 더 깊은 관계를 반영하고 싶어도 Layer를 무작정 늘리면 학습 속도와 추천 정확도에 부정적인 영향을 줄 수 있습니다.

이 연구의 목표는 모델을 더 복잡하게 만드는 것이 아니라, 기존 GCN 추천 알고리즘의 전파와 초기화 방식을 조정해 **학습 속도와 추천 정확도를 함께 개선할 수 있는지**를 검증하는 것이었습니다.

## 제안 방법 1: Egress Initialization

첫 번째 제안은 **Egress 초기화(Egress Initialization)**입니다. 기존 초기화 방식보다 임베딩 값을 더 넓은 범위에서 시작하게 만들어, 학습 초기에 각 노드가 더 다양한 값의 범위를 갖도록 설계했습니다.

논문에서 Egress 초기화는 다음 목적을 가집니다.

- 임베딩 값이 지나치게 작아지며 정보가 약해지는 현상 완화
- 학습 과정 가속
- 사용자와 아이템 노드의 정보가 더 넓은 값 범위에서 전파되도록 유도
- 그래프 구조 안의 다양한 상호작용 패턴을 포착해 추천 정확도 향상

즉, Egress 초기화는 단순히 파라미터 초기값을 바꾸는 실험이 아니라, GCN 추천 모델에서 **전파될 정보의 출발 범위**를 다시 설계한 접근입니다.

## 제안 방법 2: Weighted Forwarding

두 번째 제안은 **가중치 전달(Weighted Forwarding, WF)**입니다. 일반적인 GCN 전파 규칙이 다음 Layer로 임베딩을 전달하기 전에, 임베딩 값에 특정 가중치를 곱해 더 강화된 표현을 전달하도록 구성했습니다.

WF의 핵심 아이디어는 다음과 같습니다.

- propagation rule 이전에 사용자/아이템 임베딩에 스칼라 가중치를 적용
- 작은 값으로 수렴한 임베딩 표현을 강화
- 다음 Layer가 더 선명한(sharpened) 임베딩을 입력으로 사용하도록 유도
- 기존 알고리즘 구조를 크게 바꾸지 않고 학습 속도와 정확도 개선 가능성을 검증

이 방식은 새로운 추천 모델을 처음부터 설계하기보다, LightGCN 계열을 포함한 기존 GCN 추천 알고리즘에 적용 가능한 **최적화 모듈**로 다뤘습니다.

## 실험 설계

실험은 제안 기법이 특정 데이터셋이나 단일 모델에만 맞는지 확인하기 위해 여러 추천 알고리즘과 공개 벤치마크를 대상으로 구성했습니다.

**비교 대상 알고리즘**

- DirectAU, NGCF, LightGCN
- BUIR, SelfCF, MixGCF
- SGL, SimGCL, XSimGCL

**데이터셋**

- FilmTrust
- MovieLens-1M
- Yelp2018
- Douban-book

**평가 지표와 분석 방법**

- 추천 성능: Recall@20, NDCG@20
- 학습 효율: 최고 성능에 도달하기까지 필요한 epoch
- 임베딩 분석: 통계적 분석, PCA, GKDE(Gaussian Kernel Density Estimation)

논문은 성능 지표만 비교하지 않고, 제안 기법 적용 전후의 임베딩 분포가 어떻게 바뀌는지도 함께 분석했습니다. 이 덕분에 “점수가 올랐다”에서 멈추지 않고, 임베딩 공간에서 어떤 변화가 생겼는지를 설명할 수 있었습니다.

## 결과 해석

실험 결과는 Egress 초기화와 WF가 기존 GCN 추천 알고리즘의 학습 과정에서 발생하던 문제를 완화할 수 있음을 보여주었습니다.

- 대부분의 실험에서 제안 기법을 적용한 모델이 더 적은 epoch 안에 더 높은 Recall@20 또는 NDCG@20에 도달했습니다.
- FilmTrust의 SimGCL/XSimGCL, MovieLens-1M의 MixGCF처럼 초기 epoch에서 성능 개선이 정체되던 사례에서도 제안 방법이 학습 문제를 완화하는 효과를 보였습니다.
- PCA와 GKDE 분석을 통해 제안 기법 적용 후 임베딩의 분포와 밀도가 달라지는 것을 확인했고, 이는 모델이 사용자-아이템 특성을 더 잘 포착하는 방향으로 변화했음을 해석하는 근거가 되었습니다.

중요한 점은 이 연구가 단순히 “새 모델이 더 좋다”고 주장하지 않았다는 것입니다. 기존 알고리즘의 구조를 유지하면서도 초기화와 forwarding 방식을 바꿨을 때, 학습 속도·추천 정확도·임베딩 분포가 어떻게 달라지는지를 함께 검증했습니다.

## 프로젝트에서의 기여

이 프로젝트는 석사학위논문 **「추천 시스템에서 그래프 콘볼루션 네트워크 최적화 방법」**의 핵심 연구 내용을 포트폴리오 관점에서 정리한 것입니다.

제가 집중한 기여는 세 가지입니다.

1. **문제 재정의**: GCN 추천 시스템의 성능 저하를 단순 모델 복잡도 문제가 아니라, 임베딩 값 손실과 Layer 전파 과정의 문제로 정의했습니다.
2. **경량 최적화 제안**: Egress 초기화와 Weighted Forwarding을 통해 기존 알고리즘에 적용 가능한 개선 방향을 제시했습니다.
3. **성능과 표현 공간을 함께 검증**: Recall@20/NDCG@20뿐 아니라 epoch, 통계 분석, PCA, GKDE를 함께 사용해 추천 성능 개선의 근거를 다층적으로 확인했습니다.

## 근거 자료

- 석사학위논문: **추천 시스템에서 그래프 콘볼루션 네트워크 최적화 방법**
- 영문 제목: **Optimization methods for Graph Convolution Networks in Recommendation Systems**
- 학위/소속: 경기대학교 대학원 컴퓨터과학과 석사학위논문
- 발행/수여: 2024년 2월
- 원문 PDF: [ms-thesis-gcn-recommendation-optimization.pdf](/evidence/papers/ms-thesis-gcn-recommendation-optimization.pdf)
- dCollection: [논문 상세 페이지](http://www.dcollection.net/handler/kyonggi/000000057783)
