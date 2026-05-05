---
title: "dFactory는 Diffusion LLM 파인튜닝을 실험이 아니라 공정으로 만든다"
date: "2026-05-06"
description: "dFactory는 확산 언어 모델의 미세 조정을 위해 block diffusion, MoE 가중치 병합, 분산 학습, 병렬 디코딩 경로를 하나의 실행 가능한 프레임워크로 묶는다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Diffusion LLM
  - Fine-Tuning
  - MoE
  - Distributed Training
  - SGLang
draft: false
---

확산 모델은 이미지 생성에서 이미 익숙한 개념이지만, 텍스트 생성에서는 아직 대부분의 도구와 운영 경험이 자기회귀(autoregressive) LLM 중심에 머물러 있다. 문제는 여기서 시작된다. 확산 언어 모델(dLLM)이 병렬 디코딩과 새로운 학습 레시피를 무기로 실제 성능과 효율을 보여주기 시작해도, 이를 커스텀 데이터로 미세 조정할 수 있는 실전용 프레임워크가 부족하면 연구 성과는 쉽게 재현되지 않는다.

InclusionAI가 공개한 dFactory가 흥미로운 이유는 바로 이 간극을 겨냥하기 때문이다. 이 프로젝트는 dLLM 파인튜닝을 단순한 모델 로딩 문제가 아니라, block diffusion 기반 학습, discrete diffusion objective, MoE 가중치 포맷 변환, 분산 학습 엔진, 추론 경로 복원까지 포함하는 전체 워크플로우 문제로 다룬다. 쉽게 말해 "확산 언어 모델도 학습은 되는데 툴링이 없다"는 상태를, 실제로 손에 잡히는 오픈소스 파이프라인으로 바꾸려는 시도다.

![dFactory overview](https://discuss.pytorch.kr/uploads/default/optimized/3X/f/5/f5ed638fe09adc8990bc7218d2bb9e51fde3a670_2_1028x352.png)

## 무엇을 해결하려는가

현재 대다수 SFT 생태계는 Hugging Face `transformers`, TRL, 일반적인 FSDP/DeepSpeed 조합처럼 자기회귀 LLM을 잘 학습시키는 방향으로 최적화돼 있다. 하지만 dLLM은 텍스트를 한 토큰씩 왼쪽에서 오른쪽으로 예측하는 방식이 아니라, 마스킹된 토큰을 복원하거나 텍스트 블록 전체를 병렬적으로 다루는 다른 학습 규칙을 필요로 한다. 즉 모델만 확산형으로 바꾼다고 기존 SFT 스택이 그대로 동작하는 게 아니다.

PyTorchKR 정리 글과 공식 문서가 공통으로 보여주는 문제는, dLLM 학습이 아직 범용 오픈소스 프레임워크의 기본 경로가 아니라는 점이다. 텍스트용 discrete diffusion objective, block diffusion 학습 방식, MoE 구조를 고려한 고성능 분산 학습, 병렬 디코딩 추론 경로까지 한 번에 다루려면 별도의 엔지니어링이 필요하다. dFactory는 이 복잡성을 사용자 스크립트가 아니라 프레임워크 내부의 규칙으로 옮기려 한다.

## 핵심 아이디어 / 구조 / 동작 방식

dFactory의 핵심은 dLLM 전용 파인튜닝 경로를 표준화하는 데 있다. GitHub README는 이 프로젝트를 "Easy and Efficient dLLM Fine-Tuning"으로 정의하고, 공식 문서는 installation → model preparation → training → inference의 일관된 절차를 제공한다. 즉 단순히 학습 스크립트 몇 개를 던져주는 수준이 아니라, 어떤 포맷의 모델을 어떻게 받아서 어떤 구조로 학습하고 다시 어떤 형식으로 추론 단계에 넘기는지까지 흐름이 정리돼 있다.

학습 알고리즘 측면에서 중요한 축은 세 가지다. 첫째는 random masking 기반의 discrete diffusion objective다. 이미지처럼 연속값 노이즈를 더하는 대신 텍스트 토큰을 마스킹하고 이를 복원하는 방식으로 정방향/역방향 과정을 구성한다. 둘째는 block diffusion이다. 이는 텍스트 블록 전체를 한 번에 처리하는 방식으로, 자기회귀 모델의 순차적 학습/생성과 다른 효율 경로를 연다. 셋째는 trainable parallel decoding과 path distillation이다. 공식 자료는 이를 trajectory compression과 learnable parallel decoding으로 설명하며, 결국 dLLM의 강점인 병렬 생성 속도를 학습과 추론 양쪽에서 살리려는 방향이다.

프레임워크 구조에서 특히 실무적인 부분은 MoE 가중치 처리 방식이다. dFactory는 학습 전 Hugging Face 스타일의 separate-expert 포맷을 merged-expert 포맷으로 바꾸는 유틸리티를 제공한다. 예를 들어 각 expert의 가중치가 따로 저장되어 있던 구조를 expert 축을 가진 하나의 텐서로 병합해 GPU에서 batched matrix multiplication을 더 효율적으로 활용한다. 학습 후에는 다시 split 모드로 분리해 SGLang이나 일반적인 Hugging Face 기반 추론 경로에 맞출 수 있다. 이 설계는 단순 편의 기능이 아니라, 대형 MoE dLLM을 실제로 돌릴 수 있게 만드는 성능 최적화 계층에 가깝다.

또 하나 눈에 띄는 점은 기반 엔진이다. PyTorchKR 글과 문서에 따르면 dFactory는 VeOmni 분산 학습 엔진 위에 구축되며, FSDP2 같은 병렬화 기법을 활용할 수 있다. README 기준 지원 모델은 LLaDA2.0-mini 계열(16B)과 LLaDA2.0-flash 계열(100B)이다. 즉 이 프로젝트는 장난감 수준의 diffusion LM 데모가 아니라, 비교적 큰 스케일의 dLLM을 실제 GPU 클러스터에서 훈련하는 사용 시나리오를 전제로 하고 있다.

읽기 쉽게 정리하면 dFactory의 위치는 다음 표에 가깝다.

| 관점 | 일반적인 LLM SFT 프레임워크 | dFactory |
|---|---|---|
| 기본 학습 패러다임 | 자기회귀 next-token prediction 중심 | discrete diffusion + block diffusion 중심 |
| 텍스트 처리 방식 | 순차적 생성/학습 경로 | 마스킹 복원 및 블록 단위 처리 |
| MoE 가중치 운용 | 기본 포맷 그대로 사용 | merged/split 유틸리티로 학습·추론 포맷 전환 |
| 분산 학습 초점 | 범용 LLM SFT 최적화 | VeOmni 기반 dLLM 전용 고성능 학습 경로 |
| 추론 연결 | 표준 HF/SGLang 경로 중심 | 학습 후 split 변환을 거쳐 추론 경로 복원 |

## 공개된 근거에서 확인되는 점

공식 GitHub README에서 확인되는 가장 분명한 사실은 지원 모델 범위다. 현재 공개된 라인업은 `inclusionAI/LLaDA2.0-mini`, `LLaDA2.0-mini-preview`, `LLaDA2.0-flash`, `LLaDA2.0-flash-preview`이며 각각 16B와 100B 규모를 커버한다. 즉 이 프레임워크는 범용 dLLM을 아무거나 연결하는 추상 도구라기보다, 우선 LLaDA 2.0 계열을 중심으로 현실적인 학습 파이프라인을 제공하는 쪽에 더 가깝다.

문서에서 확인되는 설치 조건도 꽤 명확하다. 설치 가이드는 Python 3.10 이상, CUDA 12.4 이상을 요구하고, `uv sync --extra gpu` 기반 경로를 권장한다. 또한 저장소는 `--recursive` 클론이 필요하고, 실제 의존성 설치는 `dFactory/VeOmni` 하위에서 진행하는 방식으로 안내된다. 이런 세부는 겉으로 보기엔 사소하지만, 실제 재현성을 크게 좌우하는 운영 정보다.

README와 문서가 공통으로 강조하는 또 다른 실용 포인트는 학습 전후의 모델 포맷 변환 절차다. 학습 전에는 `scripts/moe_convertor.py --mode merge`로 merged-expert 포맷을 만들고, 학습 후에는 `--mode split`으로 separate-expert 구조를 복원해야 한다. 여기에 원본 베이스 모델의 `modeling_llada2_moe.py` 파일을 수동 복사해야 한다는 단계까지 포함돼 있다. 즉 현재 dFactory는 완전 자동화된 SaaS형 툴이라기보다, 고성능 학습을 위해 사용자가 모델 파일 구조를 어느 정도 이해하고 조작해야 하는 연구-실무 중간 단계의 프레임워크다.

추론 경로도 확인된다. 문서는 SGLang dLLM inference guide를 별도로 제공하고, PyTorchKR 글 역시 학습 후 SGLang 기반 로컬 서버 실행을 안내한다. 라이선스는 Apache License 2.0이다. 종합하면 dFactory는 단순 논문 구현체가 아니라 문서, 설치 경로, 모델 준비, 학습, 추론 가이드까지 갖춘 비교적 완성도 있는 공개 스택으로 볼 수 있다.

## 실무 관점에서의 해석

내가 이 프로젝트를 높게 보는 이유는 "diffusion LLM도 학습할 수 있다"는 가능성 자체보다, 그것을 반복 가능한 공정으로 만들려는 태도 때문이다. 실제 팀에서 새로운 모델 패러다임이 등장해도 생태계가 늦게 따라오면, 초기 도입자는 연구 코드를 조립해 겨우 한 번 돌리는 수준에서 멈추기 쉽다. dFactory는 그 상태를 넘어 학습 준비, 분산 실행, 가중치 포맷 최적화, 추론 연결까지 한 줄기의 작업으로 묶는다.

동시에 한계도 분명하다. 우선 현재는 LLaDA 2.0 계열 중심의 생태계이고, MoE 병합/분리나 모델링 파일 복사처럼 사용자가 직접 이해해야 할 절차가 남아 있다. 즉 Hugging Face에서 모델 하나 받아서 바로 SFT하는 경험과 비교하면 진입 장벽은 높다. 하지만 이건 약점이면서도 신호다. 아직 diffusion LM 툴링이 초기 단계라는 뜻이고, 그런 점에서 dFactory는 완성품이라기보다 dLLM 운영 스택의 초석에 더 가깝다.

만약 팀이 병렬 디코딩 기반 텍스트 생성, dLLM 학습 레시피, MoE 기반 diffusion model 실험, 혹은 차세대 텍스트 생성 패러다임에 미리 올라타고 싶다면 dFactory는 충분히 볼 가치가 있다. 특히 "모델 구조의 새로움"을 논문에서 끝내지 않고, 실제 훈련 가능한 인프라 문제로 끌고 와야 하는 팀이라면 더 그렇다. 이 프로젝트의 진짜 의미는 확산 언어 모델을 위한 또 하나의 스크립트가 아니라, 그 생태계가 독립적인 툴체인을 갖기 시작했다는 데 있다.

Sources: https://discuss.pytorch.kr/t/dfactory-diffusion-llm/9152 , https://www.inclusion-ai.org/dFactory/ , https://github.com/inclusionAI/dFactory
