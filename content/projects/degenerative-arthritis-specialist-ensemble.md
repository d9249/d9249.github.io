---
title: "퇴행성 관절염 분류를 위한 Specialist Ensemble 연구"
projectName: "Degenerative Arthritis Specialist Ensemble"
tagline: "KneeXray 5-class K-L grade 분류에서 class별 전문 모델을 결합한 의료영상 앙상블 연구"
period: "Kyonggi University / SCIE Journal"
periodOrder: 20230100
description: "CMC 2023 논문 「Deep Learning Model Ensemble for the Accuracy of Classification Degenerative Arthritis」를 바탕으로, 무릎 X-ray 영상의 Kellgren–Lawrence grade 분류에서 여러 CNN·Transformer 계열 모델을 비교하고 class별 specialist ensemble로 성능을 개선한 프로젝트입니다."
metrics:
  - "SCIE(Q2) · CMC 1저자"
  - "Accuracy 77.05% / F1 0.78"
  - "KneeXray 5-class · 8,260장"
stack:
  - "Medical Image Classification"
  - "Specialist Ensemble"
  - "PyTorch / timm"
  - "Transfer Learning"
  - "KneeXray"
  - "Kellgren–Lawrence Grade"
details:
  - "KneeXray 데이터셋 8,260장의 무릎 X-ray를 Kellgren–Lawrence grade 0~4의 5-class classification 문제로 정의했습니다."
  - "VGGNet, DenseNet, ResNet, TinyNet, EfficientNet, MobileNet, Xception, ViT 계열 모델을 같은 조건에서 비교했습니다."
  - "각 grade에서 가장 강한 모델을 선택하는 specialist ensemble을 구성해 accuracy 77.05%, precision 0.79, recall 0.77, F1 0.78을 확인했습니다."
order: 69
draft: false
---

## 연구의 출발점

퇴행성 관절염은 무릎 X-ray 영상에서 관절 간격, 골극, 경화 정도 등을 종합적으로 보고 Kellgren–Lawrence grade로 평가합니다. 하지만 grade 0부터 4까지를 자동 분류하는 문제는 단순한 정상/비정상 이진 분류보다 훨씬 어렵습니다. 특히 grade별 데이터 수가 균형적이지 않고, 인접 grade 사이의 시각적 차이가 크지 않기 때문에 전체 accuracy만으로 모델의 유용성을 설명하기 어렵습니다.

이 프로젝트는 **무릎 X-ray 기반 퇴행성 관절염 5-class classification**을 대상으로, 다양한 딥러닝 모델을 같은 조건에서 비교하고 class별로 강한 모델을 결합하는 specialist ensemble 전략을 검증한 연구입니다. 논문의 목표는 완전히 새로운 분류 모델을 설계하는 것이 아니라, 이미 검증된 CNN·Transformer 계열 모델을 의료영상 분류 문제에 적용했을 때 어떤 모델이 어떤 grade에서 강점을 보이는지 확인하고, 그 차이를 앙상블 전략으로 활용하는 데 있었습니다.

## 문제 정의와 데이터셋

실험은 osteoarthritis classification에서 널리 사용되는 **KneeXray** 데이터셋을 사용했습니다. 전체 데이터는 8,260장으로 구성되어 있으며, train 6,604장과 test 1,656장으로 나뉩니다. 각 이미지는 Kellgren–Lawrence grade 0~4 중 하나로 분류됩니다.

| Grade | Train | Test | Total |
| --- | ---: | ---: | ---: |
| 0 | 2,614 | 639 | 3,253 |
| 1 | 1,199 | 296 | 1,495 |
| 2 | 1,728 | 447 | 2,175 |
| 3 | 863 | 223 | 1,086 |
| 4 | 200 | 51 | 251 |
| **Total** | **6,604** | **1,656** | **8,260** |

이 분포에서 grade 4는 전체 251장에 불과하고, test set에서도 51장만 존재합니다. 따라서 모델이 다수 class에만 맞춰지는 것을 피하려면 class별 precision, recall, F1 score를 함께 확인해야 합니다. 연구에서는 별도의 data augmentation을 적용하지 않고, transfer learning과 검증 설계를 통해 제한된 데이터 조건에서 모델 성능을 비교했습니다.

## 모델 비교와 학습 방식

비교 대상은 VGGNet, DenseNet, ResNet, TinyNet, EfficientNet, MobileNet, Xception, Vision Transformer 계열 모델이었습니다. 모델 구현에는 PyTorch와 timm 기반 pre-trained model을 활용했고, 입력 이미지는 224×224×3 크기로 맞췄습니다. 학습 환경은 Ubuntu 18.04, PyTorch 1.7.1+cu110, Nvidia GeForce RTX 3090 GPU 조건으로 정리되어 있습니다.

실험 과정은 다음 흐름으로 구성했습니다.

1. 데이터를 5개 set으로 나누어 5-fold cross-validation에 가까운 방식으로 학습·검증합니다.
2. 같은 모델에서 얻은 5개 예측 결과를 평균해 generalized model을 구성합니다.
3. 각 class에서 가장 높은 정확도를 보인 모델을 선택합니다.
4. 선택된 모델들을 average ensemble, weighted ensemble, specialist ensemble 방식으로 결합해 성능을 비교합니다.

핵심은 모든 grade를 하나의 모델이 균일하게 잘 맞히리라고 가정하지 않았다는 점입니다. 논문은 class별 confusion matrix와 validation accuracy를 확인해, 각 grade에서 가장 강한 모델을 따로 찾았습니다.

| Class | 선택된 specialist model | Correct / Support | Class accuracy |
| --- | --- | ---: | ---: |
| 0 | TinyNetA | 582 / 639 | 0.9108 |
| 1 | VGG19 | 149 / 296 | 0.5034 |
| 2 | DenseNet169 | 315 / 447 | 0.7047 |
| 3 | Swin_tiny_patch4_window7_224 | 185 / 223 | 0.8296 |
| 4 | MobileVitV2_150 | 45 / 51 | 0.8824 |

## Specialist ensemble의 핵심 아이디어

일반적인 average ensemble은 여러 모델의 예측 확률을 동일하게 평균합니다. 이 방식은 구현이 단순하지만, grade별로 강점이 다른 모델의 차이를 충분히 반영하지 못할 수 있습니다. 실제 실험에서도 class별 specialist 모델들을 단순 평균했을 때는 71.4% accuracy로 성능이 낮아졌습니다.

Weighted ensemble은 모델별 가중치를 다르게 주어 더 강한 모델의 의견을 크게 반영하려는 방식입니다. 이 접근은 accuracy 약 72.8%, 논문 표기 기준 0.7276을 기록했습니다. 하지만 이 역시 모델 단위의 전반적 가중치에 가까워, 특정 grade에서만 강한 모델의 정보를 충분히 살리기 어렵습니다.

**Specialist ensemble**은 이 문제를 class 단위로 다시 정의합니다. 각 Kellgren–Lawrence grade에서 가장 강한 모델을 “전문가”로 선택하고, 해당 grade의 판단에는 그 모델의 예측을 더 적극적으로 반영합니다. 의료영상 분류에서 인접 class 간 차이가 작고 데이터 불균형이 큰 경우, 모든 class를 하나의 평균 의견으로 처리하는 것보다 class별 강점을 분리해 결합하는 전략이 더 효과적일 수 있다는 가설을 검증한 것입니다.

## 실험 결과

최종적으로 proposed specialist ensemble은 accuracy 0.7705, precision 0.79, recall 0.77, F1 score 0.78을 기록했습니다. 논문은 기존 연구 및 weighted ensemble과의 비교를 통해, class별 전문 모델 조합이 단순 가중 평균보다 더 큰 개선을 만들 수 있음을 보였습니다.

| Model | Accuracy | Precision | Recall | F1 score | Support |
| --- | ---: | ---: | ---: | ---: | ---: |
| VGG19-Ordinal | 0.6969 | 0.69 | 0.70 | 0.70 | 1,656 |
| ORM + DenseNet161 | 0.7023 | 0.70 | 0.71 | 0.70 | 1,656 |
| OsteoHRNet | 0.7174 | 0.73 | 0.71 | 0.72 | 1,656 |
| Proposed weighted ensemble | 0.7276 | 0.73 | 0.71 | 0.71 | 1,656 |
| **Proposed specialist ensemble** | **0.7705** | **0.79** | **0.77** | **0.78** | **1,656** |

Class별 결과에서도 specialist ensemble은 grade 0에서 recall 0.91, grade 3에서 F1 0.85, grade 4에서 F1 0.90을 기록했습니다. 데이터가 적은 severe grade에서도 성능을 따로 확인했다는 점이 중요합니다. 전체 평균만 보는 대신 grade별 precision, recall, F1 score를 함께 제시해야 실제 진단 보조 관점에서 어떤 class가 취약한지 판단할 수 있습니다.

## 프로젝트에서의 기여

이 프로젝트에서 제가 집중한 기여는 세 가지입니다.

1. **의료영상 분류 문제 정의**: 퇴행성 관절염 진단 자동화를 Kellgren–Lawrence grade 0~4의 불균형 5-class classification 문제로 정의했습니다.
2. **동일 조건 모델 비교**: VGGNet, DenseNet, ResNet, TinyNet, EfficientNet, MobileNet, Xception, ViT 계열 모델을 동일 데이터와 학습 조건에서 비교했습니다.
3. **Class-specialist ensemble 설계**: 각 grade에서 강한 모델을 따로 선택해 결합함으로써, 단순 average/weighted ensemble보다 높은 accuracy와 F1 score를 확인했습니다.

이 연구는 의료영상 분류에서 앙상블을 사용할 때 “여러 모델의 평균”만으로는 충분하지 않을 수 있음을 보여줍니다. 특히 질병 grade처럼 class 간 경계가 흐리고 데이터 불균형이 큰 문제에서는, 모델별 전반 성능뿐 아니라 **어느 class에서 강한지**를 기준으로 결합 전략을 설계하는 것이 실무적으로 더 설득력 있는 접근이 될 수 있습니다.

## 근거 자료

- CMC 논문: **Deep Learning Model Ensemble for the Accuracy of Classification Degenerative Arthritis**
- 저자: **Sang-min Lee, Namgi Kim**
- 저널/발행: Computers, Materials & Continua, Vol. 75, No. 1, 2023
- DOI: [10.32604/cmc.2023.035245](https://doi.org/10.32604/cmc.2023.035245)
- 원문 PDF: [deep-learning-ensemble-degenerative-arthritis-cmc-2023.pdf](/evidence/papers/deep-learning-ensemble-degenerative-arthritis-cmc-2023.pdf)
