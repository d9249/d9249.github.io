---
title: "LightGCN / WF-GCN / OptGCN 추천 시스템 연구"
projectName: "LightGCN / WF-GCN / OptGCN"
tagline: "추천 시스템 연구"
period: "Kyonggi University / M.S. Research"
periodOrder: 20240600
description: "사용자-아이템 그래프에서 임베딩 전파와 가중 전달을 개선해 추천 정확도를 높인 그래프 추천 시스템 연구입니다."
metrics:
  - "LightGCN"
  - "WF-GCN"
  - "SCIE"
stack:
  - "PyTorch"
  - "Graph Neural Network"
  - "MovieLens"
  - "Yelp"
details:
  - "LightGCN embedding enhancement와 Weighted Forwarding Graph Convolution Network 연구를 SCIE 논문으로 확장했습니다."
  - "MovieLens, FilmTrust, Yelp 등 공개 데이터셋에서 Recall, NDCG 기반 추천 품질을 비교했습니다."
  - "석사 논문에서는 추천 시스템에서 그래프 컨볼루션 네트워크 최적화 방법을 정리했습니다."
order: 60
draft: false
---

## Problem

사용자-아이템 상호작용 그래프에서는 이웃 노드 정보를 전파하는 과정에서 embedding 표현력이 약해지거나, 모든 연결을 동일하게 취급해 추천 품질이 제한될 수 있습니다. 연구의 초점은 그래프 전파를 더 효율적으로 최적화하는 것이었습니다.

## Approach

LightGCN 계열의 단순화된 그래프 전파 구조를 기반으로 embedding enhancement, weighted forwarding, graph convolution optimization을 실험했습니다. MovieLens, FilmTrust, Yelp 같은 공개 데이터셋에서 Recall과 NDCG를 중심으로 비교했습니다.

## Impact

LightGCN, WF-GCN, OptGCN 관련 연구를 석사 논문과 SCIE 논문으로 확장했습니다. 추천 시스템 연구에서 모델 구조, 데이터셋 실험, 지표 검증을 연결한 연구 기반을 만들었습니다.
