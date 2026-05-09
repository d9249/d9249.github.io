---
title: "왜 비전도 결국 Transformer로 수렴했는가"
date: "2026-05-09T14:19:30"
description: "Isaac Robinson의 짧은 발표는 CNN에서 ViT, Swin, ConvNeXt, Hiera, DINOv3, SAM3, RF-DETR로 이어지는 흐름을 따라가며, 비전에서 Transformer가 늦게 이겼지만 한 번 이기기 시작한 뒤 왜 빠르게 표준이 되었는지를 pretraining·inference infrastructure·deployment flexibility 관점에서 정리한다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - Vision Transformer
  - Computer Vision
  - DINOv2
  - SAM
  - RF-DETR
draft: false
---

언어 모델에서는 Transformer가 비교적 빠르게 표준이 됐지만, 비전에서는 이야기가 훨씬 더 꼬여 있었다. 이미지 쪽에는 이미 convolution이라는 강한 inductive bias가 있었고, locality와 translation invariance는 실제로 잘 작동했다. 반면 Vision Transformer는 처음 등장했을 때부터 구조적으로 더 단순했지만, 계산량은 거칠고 데이터와 pretraining에 훨씬 더 많이 의존하는 방식처럼 보였다. 그래서 한동안의 질문은 늘 같았다. **정말 비전에서도 결국 Transformer가 끝까지 이길 수 있느냐**였다.

AI Engineer Europe에서 Roboflow의 Isaac Robinson이 발표한 *How Transformers Finally Ate Vision*은 이 질문에 대한 17분짜리 압축 답안에 가깝다. 발표의 핵심은 단순히 "ViT가 CNN보다 좋다"가 아니다. 오히려 **비전에서 Transformer가 늦게 이긴 이유**, 그리고 **그럼에도 결국 승리한 이유**를 architecture 자체가 아니라 pretraining, systems optimization, deployment economics까지 포함한 더 큰 흐름으로 설명한다. ViT, Swin, ConvNeXt, Hiera, DINOv3, SAM3, RF100-VL, RF-DETR까지 이어지는 계보를 따라가 보면, 이제 비전의 경쟁축이 더 이상 "누가 더 자연스러운 inductive bias를 갖고 있나"에만 머물지 않는다는 점이 분명해진다.

## 무엇을 다루는 영상인가

이 영상은 Roboflow의 Research Lead인 Isaac Robinson이 AI Engineer Europe 무대에서 진행한 공개 발표다. 길이는 약 17분으로 짧지만, 내용은 의외로 넓다. CNN과 Vision Transformer의 구조 차이에서 출발해, Swin과 ConvNeXt 같은 중간 단계의 반격, Hiera의 정리된 설계, MAE·DINO 계열 pretraining의 역할, 그리고 마지막으로 SAM3와 RF-DETR 같은 실제 제품형/배포형 시스템까지 한 번에 연결한다.

발표를 관통하는 질문은 명확하다. **왜 이미지처럼 강한 도메인 prior가 필요한 영역에서, 오히려 그 prior가 약한 Transformer가 최종 승자가 되었는가?** 그리고 그 승리가 연구 벤치마크 차원에 머무르지 않고 실제 deployment stack까지 밀고 내려왔을 때, 실무자는 무엇을 읽어야 하는가를 묻는다. 그래서 이 발표는 순수한 backbone 역사 요약이면서도 동시에 foundation model 운영 전략에 대한 짧은 메모이기도 하다.

## 핵심 아이디어 / 구조 / 시연 흐름

발표의 첫 축은 **CNN의 강한 inductive bias 대 ViT의 약한 inductive bias**라는 고전 구도다. CNN은 locality와 translation invariance를 구조적으로 갖고 시작한다. 반면 ViT는 이미지를 patch token으로 쪼갠 뒤 attention에 넣는 비교적 "무심한" 구조다. 발표에서는 이 점을 강조하며, 비전 쪽 Transformer가 본질적으로 더 우아해서 이긴 것이 아니라 처음에는 오히려 더 불리해 보였다고 짚는다. 특히 해상도 증가에 따라 토큰 수가 빠르게 늘어나는 구조 때문에, naïve한 ViT는 비전에서 비용이 커 보일 수밖에 없었다.

그 다음 축은 **"Transformer를 비전에 맞게 고쳐보려는 시도"의 역사**다. Swin은 윈도우 단위 attention과 shifted window로 locality를 다시 주입했다. ConvNeXt는 아예 "Transformer에서 배운 좋은 습관을 convolution 쪽으로 역수입하면 어떨까"라는 접근으로 읽힌다. 즉 한동안의 경쟁은 Transformer가 CNN을 밀어낸다기보다, 양쪽이 서로의 장점을 흡수하며 중간지대를 넓혀 가는 과정에 가까웠다.

하지만 발표가 진짜로 힘을 주는 지점은 그 다음이다. Robinson은 Hiera와 MAE, 그리고 DINOv2/DINOv3 계열을 거치며 판이 바뀌었다고 본다. 요약하면 이렇다. 과거에는 구조 내부에 직접 넣어야 했던 비전 inductive bias를, 이제는 **대규모 self-supervised pretraining이 다시 학습해 준다**. MAE는 빠진 patch를 복원하게 만들면서 구조에 없던 bias를 데이터에서 되찾아 오고, DINO 계열은 단순 분류 성능을 넘어 feature map 자체를 매우 풍부하게 만든다. 발표 속 표현을 빌리면, 이제 ViT는 "bias가 없는 구조"라기보다 **pretraining으로 bias를 다시 획득한 범용 backbone**이 된다.

여기에 LLM 붐이 만든 systems layer가 얹힌다. FlashAttention 같은 attention 최적화, 더 성숙한 accelerator support, Transformer-friendly inference stack이 비전에도 그대로 흘러들어오면서, 한때는 구조적 약점처럼 보였던 비효율이 점점 덜 치명적이 됐다. 즉 비전용 Transformer의 승리는 architecture 단독 승리가 아니라, **pretraining + infra + ecosystem의 결합 승리**라는 것이 발표의 핵심 메시지다.

| 단계 | 대표 계열 | 무엇을 보완하려 했나 | 이 발표가 읽는 의미 |
|---|---|---|---|
| 고전 비전 | CNN / ResNet | locality, translation invariance를 구조적으로 내장 | 비전에서는 원래 inductive bias가 강한 쪽이 상식이었다 |
| 초기 전환 | ViT | 단순한 patch + attention으로 전역 상호작용 확보 | 구조는 단순하지만 계산량과 bias 부족이 약점처럼 보였다 |
| 중간 절충 | Swin | window attention으로 locality와 계산 효율 회복 | "Transformer를 비전에 맞게 손보는" 단계 |
| 역수입 실험 | ConvNeXt | Transformer 시대의 학습 관례를 convolution에 재적용 | CNN도 여전히 강력했음을 보여준 반격 |
| 단순화된 재정렬 | Hiera | 불필요한 장식을 빼고 pretraining으로 bias 복구 | 구조보다 pretraining 전략이 더 중요해지기 시작한 지점 |
| 기반모델 시대 | DINOv2/DINOv3, SAM3, RF-DETR | 풍부한 feature, 더 넓은 transfer, 실제 배포 성능 | ViT가 연구 구조를 넘어 foundation backbone으로 굳어진 단계 |

발표 후반부는 이 흐름을 **실제 모델 계보와 deployment 문제**로 연결한다. SAM 계열에서는 SAM → MobileSAM → SAM2 → SAM3로 갈수록 backbone 실험이 이어지지만, 결국 massively pretrained ViT 계열로 다시 수렴하는 패턴이 관찰된다고 설명한다. 동시에 문제는 하나 더 남는다. 그렇게 강력한 backbone은 대개 비싸고 무겁다. 그래서 최종 승부는 단순 정확도가 아니라 **그 backbone을 얼마나 다양한 하드웨어와 데이터 조건에 맞게 재조정할 수 있느냐**로 넘어간다.

## 영상과 연결 자료에서 확인되는 점

강연 transcript에서 직접 확인되는 주장 몇 가지는 분명하다. 첫째, Robinson은 ViT의 최종 승인을 설명할 때 구조적 우월성보다 **VIT-specific pretraining의 누적 효과**를 핵심 원인으로 둔다. 둘째, DINOv3류의 self-supervised pretraining이 feature map의 semantic richness를 크게 끌어올렸다고 설명한다. 셋째, SAM 계열의 backbone 진화도 결국 heavily pretrained ViT 쪽으로 다시 기울었다고 해석한다. 넷째, 발표 후반에서는 SAM3가 강력하지만 무겁고, deployment flexibility가 부족한 one-size-fits-all 모델일 수 있다는 비판을 명시적으로 제기한다.

이 가운데 실무적인 뒷받침이 가장 잘 잡히는 부분은 Roboflow의 공개 자산이다. RF100-VL 공식 저장소는 이 벤치마크를 **100개의 멀티도메인 object detection 데이터셋**으로 설명하며, flora/fauna, sport, industrial, document, medical/laboratory, aerial, miscellaneous 등 여러 도메인을 한 벤치마크 표면에 묶는다. 즉 발표에서 말하는 "foundation model transfer를 실제 downstream 다양성 위에서 다시 봐야 한다"는 문제의식은 단순 수사만이 아니라, Roboflow가 실제로 공개한 benchmark 설계와 맞물려 있다.

![RF100-VL domain overview](https://rf100-vl.org/assets/results.png)

RF-DETR 공개 저장소도 같은 방향을 보여준다. GitHub README 기준 RF-DETR은 **DINOv2 vision transformer backbone** 위에 구축된 실시간 detection/instance segmentation 아키텍처로 소개되며, COCO와 RF100-VL에서 accuracy-latency trade-off를 전면에 내세운다. 벤치마크 수치는 NVIDIA T4, TensorRT, FP16, batch size 1 조건으로 제시돼 있어 단순 연구 수치보다 deployment surface를 강하게 의식한 자료다. 저장소 메타데이터상 `roboflow/rf-detr`는 2025년 3월 생성 이후 현재 약 6.9k stars, 887 forks, 다수의 태그와 릴리스를 유지하고 있고, 기본 브랜치는 `develop`이다. 즉 이것은 아이디어 메모 수준이 아니라, 실제 사용자와 배포 경로를 가진 공개 프로젝트다.

![RF-DETR latency-accuracy tradeoff](https://storage.googleapis.com/com-roboflow-marketing/rf-detr/rf_detr_1-4_latency_accuracy_object_detection.png)

라이선스 구조도 흥미롭다. RF-DETR 저장소와 오픈소스 `rfdetr` 패키지는 Apache 2.0으로 공개되지만, README는 일부 Plus 컴포넌트가 별도 PML 1.0 라이선스를 따른다고 분리해 적는다. 이건 "Transformer backbone이 강해졌다"는 이야기와 별개로, 실제 비전 기반모델 시대에는 **오픈소스 모델, 상용 확장, 배포 스택**이 함께 얽힌다는 사실을 보여준다. 다시 말해 비전 Transformer의 승리는 논문 승리가 아니라, 이미 제품 패키징과 사업 모델까지 닿아 있는 승리다.

## 실무 관점에서의 해석

내가 보기에 이 발표의 가장 좋은 점은 "Transformer가 CNN보다 좋다"는 단순 구호를 반복하지 않는다는 데 있다. 오히려 **왜 CNN이 한동안 계속 의미 있었는지**를 인정한 뒤, 그 장점을 이제는 구조보다 pretraining과 transfer에서 회수할 수 있게 됐다는 흐름을 보여준다. 이 해석은 중요하다. 왜냐하면 실제 팀이 모델을 고를 때는 더 이상 "convolution이냐 attention이냐" 같은 교과서식 대립보다, **어떤 backbone이 더 넓은 downstream 표면을 커버하고, 어떤 inference stack과 hardware path를 공유하며, 어떤 fine-tuning 전략으로 재활용될 수 있는가**를 먼저 보기 때문이다.

특히 비전에서 foundation model이 진짜로 자리 잡으려면 두 가지가 동시에 필요하다. 하나는 DINOv2/DINOv3, MAE처럼 **generic representation을 크게 끌어올리는 pretraining**이고, 다른 하나는 RF100-VL이나 RF-DETR처럼 **그 representation을 특정 deployment envelope에 맞게 다시 압축하고 최적화하는 방법**이다. 발표는 바로 이 두 층을 이어 붙인다. 그래서 이 영상은 "ViT가 이겼다"는 선언보다, **이제 비전의 핵심 경쟁력이 backbone 발명보다 backbone 활용과 재배치에 있다**는 점을 더 설득력 있게 보여준다.

물론 한계도 있다. 이 발표는 17분짜리 요약이기 때문에, Swin·ConvNeXt·Hiera·DINOv3 각각의 수치와 반례를 세세하게 따지지는 않는다. 또 SAM3의 parameter/latency나 Roboflow의 speedup 수치는 영상 속 주장으로 제시되므로, 제품 의사결정에 그대로 옮길 때는 원 논문·벤치마크 문서·재현 환경을 다시 확인하는 편이 안전하다. 그럼에도 방향성만큼은 분명하다. **비전에서 Transformer의 승리는 늦었지만, 한 번 전환점이 만들어진 뒤에는 backbone 구조 하나가 아니라 pretraining, infra, deployment stack 전체를 끌고 들어온 승리였다.**

이 지점에서 남는 질문도 자연스럽다. 다음 경쟁은 "Transformer냐 아니냐"가 아니라, 그렇게 만들어진 거대한 시각 backbone을 얼마나 싸고 빠르고 유연하게 task-specific product로 바꿀 수 있느냐일 가능성이 크다. 그리고 바로 그 지점에서 Roboflow가 RF100-VL과 RF-DETR로 던지는 메시지는 꽤 선명하다. **비전의 미래는 더 강한 backbone 하나보다, foundation backbone을 다양한 현실 세계 제약으로 번역하는 능력에 달려 있다.**

Sources: https://www.youtube.com/watch?v=VhfAVA3BG2I, https://github.com/roboflow/rf-detr, https://api.github.com/repos/roboflow/rf-detr, https://blog.roboflow.com/rf-detr/, https://www.roboflow.com/model/rf-detr, https://github.com/roboflow/rf100-vl, https://api.github.com/repos/roboflow/rf100-vl, https://rf100-vl.org, https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2505.20612
