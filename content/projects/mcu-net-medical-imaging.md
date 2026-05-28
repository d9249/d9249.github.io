---
title: "MCU-Net 기반 췌장 CT 분할 연구"
projectName: "MCU-Net Pancreas Segmentation"
tagline: "다중 연쇄 U-Net으로 작은 장기 분할 성능을 개선한 의료영상 연구"
period: "Kyonggi University / KCI Journal"
periodOrder: 20220500
description: "KCI 논문 「의료 영상 시스템에서 다중 연쇄 U-Net 모델을 이용한 개선된 췌장 영역 분할 탐지」를 바탕으로, 복부 CT에서 췌장 영역을 더 안정적으로 분할하기 위해 서로 다른 패치 크기의 U-Net 특징을 결합한 프로젝트입니다."
metrics:
  - "Pancreas DSC 0.916"
  - "Pancreas-CT 82 scans"
  - "KCI 2022"
stack:
  - "Medical Image Segmentation"
  - "U-Net / MCU-Net"
  - "TensorFlow / Keras"
  - "Pancreas-CT"
  - "Dice Coefficient"
details:
  - "췌장 CT segmentation에서는 서로 다른 패치 크기의 U-Net을 마지막 단계에서 연쇄 결합하는 MCU-Net 구조를 제안했습니다."
  - "Pancreas-CT 데이터셋 82개 3D CT scan, 19,328장 슬라이스를 대상으로 4-fold 검증과 Dice coefficient 기반 평가를 수행했습니다."
  - "MCU-Net M5 구조는 DSC 0.916으로 기존 U-Net 0.896, Attention U-Net 0.832, RSTN 0.846 대비 높은 분할 성능을 보였습니다."
order: 70
draft: false
---

## 연구의 출발점

췌장 segmentation은 의료영상 딥러닝에서 특히 까다로운 문제입니다. 췌장은 복부 장기 중에서도 크기가 작고 위장 뒤쪽, 십이지장과 연결된 위치적 특성 때문에 CT 영상에서 경계를 찾기 어렵습니다. 모델은 배경과 장기 경계를 안정적으로 구분해야 하며, 진단 보조 시스템으로 쓰이기 위해서는 성능 수치뿐 아니라 어떤 기준으로 평가했는지도 명확해야 합니다.

이 프로젝트는 복부 CT에서 췌장 영역을 더 정확하게 분할하기 위한 **MCU-Net 기반 segmentation 연구**입니다. 연구의 핵심은 새로운 의료영상 문제를 단순히 더 큰 모델로 해결하려는 것이 아니라, 작은 장기와 제한된 데이터 조건에서 기존 U-Net 계열 구조를 어떻게 조정하면 더 안정적인 분할 결과를 얻을 수 있는지 검증하는 데 있었습니다.

무릎 X-ray 기반 퇴행성 관절염 분류와 specialist ensemble 연구는 [별도 프로젝트 페이지](/projects/degenerative-arthritis-specialist-ensemble/)로 분리했습니다. 이 페이지는 췌장 CT segmentation과 MCU-Net 구조에 집중합니다.

## MCU-Net: 작은 장기 분할을 위한 다중 연쇄 U-Net

논문은 기존 U-Net, Attention U-Net, RSTN 기반 접근이 췌장 분할에서는 충분한 정확도에 도달하기 어렵다는 문제의식에서 출발했습니다. 단일 U-Net은 입력 패치 크기와 receptive field에 강하게 의존하기 때문에, stride 기반 패치 탐색 과정에서 일부 문맥 정보가 손실될 수 있습니다.

제안한 **MCU-Net(Multiple Concatenated U-Net)**은 서로 다른 패치 크기를 가진 여러 U-Net을 마지막 단계에서 결합하는 구조입니다. (3,3), (5,5), (7,7)처럼 서로 다른 크기의 패치에서 추출된 특징을 마지막 계층에서 concatenate한 뒤 Softmax를 통해 췌장 영역을 예측하도록 설계했습니다.

이 접근은 Faster R-CNN의 anchor box처럼 서로 다른 관점의 후보 정보를 동시에 보겠다는 아이디어에 가깝습니다. 작은 장기 분할에서는 한 가지 크기의 패치만으로는 장기 주변 문맥을 충분히 포착하기 어렵기 때문에, 여러 U-Net의 결과를 단순 평균하는 앙상블이 아니라 **다른 패치 스케일의 특징을 한 모델 흐름 안에서 결합**하는 방식을 선택했습니다.

## 실험 설계와 췌장 분할 결과

췌장 분할 실험은 NIH Clinical Center에서 공개한 **Pancreas-CT set**을 사용했습니다. 데이터는 82개의 3D 복부 CT scan과 19,328장 이미지로 구성되어 있으며, 논문에서는 이를 4개의 fold로 나누어 교차 검증했습니다. 평가는 예측 영역과 실제 영역의 겹침 정도를 보는 **Dice coefficient**를 기준으로 했습니다.

실험에서는 기존 U-Net 기반 모델을 기준점으로 두고, 같은 패치 크기의 U-Net을 앙상블한 구조와 서로 다른 패치 크기를 연쇄 결합한 구조를 비교했습니다. 최종적으로 패치 크기 (3,3), (5,5), (7,7)을 사용하는 3개의 U-Net을 결합한 M5 구조가 가장 좋은 성능을 보였습니다.

| 모델 | 구조 요약 | Total AVG / DSC |
| --- | --- | --- |
| M1 | 기존 U-Net 기반 췌장 분할 모델 | 0.896 |
| M3 | 같은 패치 크기 (3,3)의 U-Net 3개 앙상블 | 0.904 |
| M4 | 패치 크기 (3,3), (5,5)의 다중 연쇄 U-Net | 0.903 |
| M5 | 패치 크기 (3,3), (5,5), (7,7)의 다중 연쇄 U-Net | 0.916 |

선행 모델과의 비교에서도 MCU-Net은 Attention U-Net 0.832, RSTN 0.846, U-Net 0.896보다 높은 0.916 DSC를 기록했습니다. 단순히 모델 수를 늘린 앙상블보다, 서로 다른 패치 스케일의 특징을 마지막 단계에서 결합하는 설계가 췌장 영역의 문맥 정보를 더 잘 활용한 것으로 해석할 수 있습니다.

## 프로젝트에서의 기여

이 프로젝트에서 제가 집중한 기여는 세 가지입니다.

1. **의료영상 문제 정의**: 췌장 CT segmentation을 작은 장기 분할 문제로 정의하고, 경계가 불명확한 장기에서 패치 스케일이 미치는 영향을 실험 주제로 설정했습니다.
2. **모델 구조 설계와 비교 실험**: 서로 다른 패치 크기의 U-Net을 마지막 단계에서 연쇄 결합하는 MCU-Net 구조를 구성하고, 단일 U-Net 및 동일 패치 앙상블과 비교했습니다.
3. **근거 기반 성능 해석**: Dice coefficient와 4-fold 검증을 통해 구조 변경이 실제 segmentation 성능에 어떤 차이를 만드는지 확인했습니다.

이 경험은 의료 도메인에서 AI 모델을 다룰 때 단순히 “정확도가 높다”는 결과만으로는 충분하지 않다는 점을 학습한 연구였습니다. 어떤 데이터셋을 사용했는지, 어떤 fold와 metric으로 평가했는지, 모델이 어떤 장기 경계에서 강점을 보였는지를 함께 설명해야 실제 진단 보조 시스템으로 이어질 수 있습니다.

## 근거 자료

- KCI 논문: **의료 영상 시스템에서 다중 연쇄 U-Net 모델을 이용한 개선된 췌장 영역 분할 탐지**
- 영문 제목: **Improved Pancreas Segmentation using Multiple Concatenated U-Net Model for Medical Image Systems**
- 저널/발행: The Journal of Korean Institute of Information Technology, Vol. 20, No. 5, 2022
- DOI: [10.14801/jkiit.2022.20.5.81](https://doi.org/10.14801/jkiit.2022.20.5.81)
- 원문 PDF: [pancreas-segmentation-mcu-net-jkiit-2022.pdf](/evidence/papers/pancreas-segmentation-mcu-net-jkiit-2022.pdf)
