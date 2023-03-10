---
title: 2021 Ego-Vision 손동작 인식 AI 경진대회
layout: default
parent: Competition
nav_order: 7
description: "2021 Ego-Vision 손동작 인식 AI 경진대회"
---

Description: 2021 Ego-Vision 손동작 인식 AI 경진대회
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

# [2021 Ego-Vision 손동작 인식 AI 경진대회](https://dacon.io/competitions/official/235805/overview/description)

> 대회의 문제를 해결하기 위해서 진행된 EDA, Code, Submission의 설명 및 기록.

## Directory structure description.

```Egp-Vision
├── Baseline(DACON)
├── DenseNet121
├── DenseNet201
├── Reference
├── pytorch_python
├── ResNet18
└── ResNet34
```

# Rules.

1. 평가 산식 : logloss
2. 예측 대상 : 손 동작의 Label
3. Public Score : 자신의 모델 성능을 확인해 볼 수 있는 점수, 비공개 데이터셋의 33%
4. Private Score : 최종 점수에 반영되는 Score, 비공개 데이터셋의 Public에 적용되지 않은 66%

## 사전학습모델 사용

1. 누구나 얻을 수 있고 법적 제약이 없는 사전학습 모델 사용 가능 (코드 제출시 사전학습에 사용된 모델 명시 필요)

# Result.

| model              | score            |
| ------------------ | ---------------- |
| resnet18           | 0.2994078162     |
| resnet34           | 0.3613903250     |
| resnet50           | going            |
| resnet101          | 0.4248803836     |
| resnet152          | 0.351421641      |
| **densenet121**    | **0.2414113323** |
| densenet169        | 0.4418508527     |
| densenet201        | 0.2786221306     |
| densenet161        | 0.2575585124     |
| googlenet          | 0.3528536391     |
| shufflenet_v2_x1_0 | going            |
| alexnet            | going            |
| squeezenet1_0      | 1.7984093391     |
| squeezenet1_1      | 1.5959589286     |
| vgg11              | 1.4910493616     |
| vgg13              | 1.8825040228     |
| vgg16              | 1.8191852852     |
| vgg19              | 2.0701736357     |

