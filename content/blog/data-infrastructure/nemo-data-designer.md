---
title: "NeMo Data Designer는 합성 데이터를 프롬프트가 아니라 파이프라인으로 만든다"
date: "2026-05-06"
description: "합성 데이터의 품질은 더 좋은 프롬프트 한 줄보다 컬럼 간 상관관계, 검증, 반복 가능한 생성 파이프라인에서 결정된다."
author: "Sangmin Lee"
category: "data-infrastructure"
tags:
  - Synthetic Data
  - NVIDIA NeMo
  - Data Pipeline
  - Validation
draft: false
---

합성 데이터 이야기는 종종 너무 쉽게 소비된다. 좋은 모델에 좋은 프롬프트를 넣으면 필요한 학습 데이터를 빠르게 만들 수 있다는 식이다. 하지만 실제 제품이나 평가 파이프라인으로 들어가면 문제는 전혀 다르게 보인다. 레코드 하나하나는 그럴듯해 보여도 전체 분포가 무너지고, 컬럼 간 관계가 어색하고, 검증 경로가 없으면 데이터셋은 금방 데모용 산출물로 전락한다.

NVIDIA의 NeMo Data Designer가 흥미로운 이유는 바로 이 지점을 정면으로 다루기 때문이다. 이 도구는 합성 데이터를 단순한 텍스트 생성 문제가 아니라, 통계적 샘플링과 LLM 생성, 컬럼 의존성, 자동 검증, 반복적 미리보기를 포함하는 오케스트레이션 문제로 재정의한다. 즉 "좋은 문장 몇 개를 뽑는 도구"가 아니라, 학습·평가에 투입할 수 있는 데이터셋을 설계하는 프레임워크에 가깝다.

![NeMo Data Designer overview](https://discuss.pytorch.kr/uploads/default/optimized/2X/1/10bcdd585ea631400f91ffba95dbd0b1db952f5f_2_1028x300.png)

## 무엇을 해결하려는가

합성 데이터를 만들 때 가장 흔한 실패는 품질의 단위를 행 하나로만 보는 것이다. LLM은 개별 예시를 자연스럽게 만들어낼 수 있지만, 실제 데이터셋에서는 다양성, 필드 간 상관관계, 금지 조건, 검증 가능성, 재현성이 동시에 필요하다. 이름은 한국식인데 주소는 미국이고, 직업과 나이가 논리적으로 맞지 않으며, 특정 응답 유형만 과도하게 반복되는 데이터는 표면적으로는 그럴듯해도 학습과 평가에서 금방 문제가 된다.

PyTorchKR 글이 잘 짚고 있듯이, NeMo Data Designer는 이런 한계를 단순 프롬프트 개선이 아니라 데이터셋 구조 설계 문제로 본다. 공식 문서와 GitHub README 역시 같은 메시지를 반복한다. 이 프레임워크의 핵심 가치는 statistical diversity, field correlations, automated validation, reproducible workflows에 있다. 결국 이 도구가 겨냥하는 것은 "한 번 생성하고 끝나는 샘플"이 아니라, 미세 조정 데이터, RAG 평가 데이터, 개인정보를 직접 쓰기 어려운 도메인 데이터의 대체재처럼 운영 가능한 synthetic dataset이다.

## 핵심 아이디어 / 구조 / 동작 방식

NeMo Data Designer의 구조는 단순하다. 컬럼과 모델을 설정하고, 소량 미리보기로 결과를 확인한 뒤, 전체 데이터셋을 생성하는 흐름이다. 다만 중요한 차이는 각 컬럼을 같은 방식으로 만들지 않는다는 점이다. 분포가 중요한 값은 statistical sampler로 만들고, 문맥이 필요한 텍스트는 LLM이 생성하며, 앞선 컬럼 값을 다음 컬럼 프롬프트에 주입해 필드 간 관계를 유지한다.

공식 문서 기준으로 사용자는 Python 라이브러리에서 `DataDesignerConfigBuilder`로 컬럼을 조합한다. 예를 들어 제품 카테고리는 category sampler로 뽑고, 리뷰 텍스트는 `{{ product_category }}` 같은 변수를 참조해 생성한다. 이 구조 덕분에 합성 데이터 생성은 자유형 텍스트 작성이 아니라 dependency-aware generation이 된다. README는 이를 "generate diverse data using statistical samplers, LLMs, or existing seed datasets"와 "control relationships between fields"로 설명한다.

PyTorchKR 글에서 특히 인상적인 부분은 이를 데이터셋 아키텍트 관점으로 번역한 대목이다. 사용자는 단순히 모델에 지시를 던지는 사람이 아니라, 어떤 컬럼을 샘플링으로 만들고 어떤 컬럼을 LLM으로 만들지, 어떤 제약을 코드와 검증기로 강제할지 정하는 설계자가 된다. 문서에 따르면 person sampling 같은 기능은 나이, 성별, 직업처럼 서로 모순되기 쉬운 속성 조합을 보다 현실적으로 생성하는 데 초점을 둔다.

생성 파이프라인도 일회성 배치가 아니라 반복 가능한 워크플로우로 설계되어 있다. 공식 소개 페이지와 커뮤니티 글을 종합하면 기본 흐름은 Configure → Preview → Create이며, 글에서는 이를 Design 단계를 포함한 4-step workflow로 설명한다. Preview 단계에서 샘플 레코드를 먼저 확인하고 프롬프트나 샘플링 설정을 조정할 수 있다는 점은 특히 실무적이다. 합성 데이터의 실패는 대량 생성 뒤에 발견될수록 비용이 크기 때문이다.

비슷한 이름 때문에 NeMo Curator와 NeMo Data Designer를 같은 범주의 도구로 오해하기 쉽지만, 실제 역할은 꽤 다르다. 커뮤니티 글에서 정리한 비교는 제품 도입 관점에서도 유용하다.

| 특징 | NeMo Curator | NeMo Data Designer |
|---|---|---|
| 주 목적 | 데이터 전처리와 정제 | 합성 데이터 생성과 설계 |
| 핵심 기능 | 중복 제거, PII 비식별화, 필터링, 텍스트 추출 | 통계적 샘플링, LLM 기반 텍스트 생성, 필드 간 상관관계 설계 |
| 대상 데이터 | Common Crawl, Wikipedia 등 대규모 원시 데이터 | 시드 데이터 또는 완전히 새로운 시나리오 |
| 주요 기술 | GPU 가속, RAPIDS, CUDA, MPI 기반 분산 처리 | LLM prompting, Python/SQL 검증, iterative workflow |
| 활용 단계 | Pre-training 데이터 준비 | Fine-tuning, RAG 평가, alignment 데이터 준비 |

한 문장으로 줄이면 Curator가 이미 존재하는 대규모 데이터를 정제하는 도구라면, Data Designer는 아직 존재하지 않는 데이터를 원하는 구조로 설계하고 생성하는 도구다. 두 도구를 같은 NeMo 생태계 안에서 함께 쓰더라도, 하나는 원시 데이터를 다듬는 계층이고 다른 하나는 목적형 synthetic dataset을 만드는 계층에 더 가깝다.

검증 계층도 이 프레임워크의 중요한 축이다. README 기준으로 Data Designer는 Python, SQL, custom local/remote validators를 지원하고, LLM-as-a-judge 기반 품질 평가도 제공한다. 즉 생성 자체보다 더 중요한 "이 데이터를 믿을 수 있는가"를 파이프라인 내부에 넣어두려는 설계다. 최근 기본 실행 경로가 cell-level async engine으로 바뀌어, 독립 컬럼을 겹쳐 실행하고 provider/model 단위로 동시성을 조절한다는 점도 공개적으로 명시돼 있다. 이는 합성 데이터 생성이 이제 연구용 스크립트가 아니라 성능과 운영성을 함께 보는 엔진으로 발전하고 있음을 보여준다.

## 공개된 근거에서 확인되는 점

공식 문서와 GitHub 저장소에서 확인되는 가장 분명한 사실은 배포 형태가 두 갈래라는 점이다. 하나는 `pip install data-designer`로 바로 쓸 수 있는 오픈소스 Python 라이브러리이고, 다른 하나는 NeMo Microservices 쪽 배포 문서와 연결되는 마이크로서비스 경로다. 전자는 노트북, 실험, 커스터마이징에 어울리고, 후자는 더 안정적인 서비스형 파이프라인으로 이어진다.

또 하나 눈에 띄는 부분은 모델 연결 계층의 유연성이다. 공식 문서는 NVIDIA API를 권장값으로 제시하지만, OpenAI와 OpenRouter도 기본 provider 예시로 안내하고 있다. README는 더 나아가 NVIDIA, OpenAI, vLLM 등 다양한 LLM endpoint를 연결할 수 있다고 설명한다. 즉 이 프레임워크의 본질은 특정 모델을 감싸는 wrapper가 아니라, 여러 추론 엔드포인트 위에서 synthetic data workflow를 일관되게 운영하는 orchestration layer에 가깝다.

라이선스는 Apache License 2.0이며, GitHub README에는 익명 텔레메트리 관련 설명도 포함돼 있다. 모델 사용 이름과 토큰 수 같은 집계 정보를 제품 개선에 활용할 수 있고, `NEMO_TELEMETRY_ENABLED=false`로 비활성화할 수 있다고 명시한다. 또한 NVIDIA Build 같은 일부 서드파티 endpoint는 평가와 테스트 목적이며 production 용도가 아니라는 경고도 README에 적혀 있다. 이런 운영상 주의사항은 단순 기능 소개보다 실제 도입 검토에서 더 중요하다.

## 실무 관점에서의 해석

내가 이 프로젝트를 높게 보는 이유는 합성 데이터를 더 "잘 쓰는 프롬프트"의 문제가 아니라, 데이터 엔지니어링과 모델 운영의 교차점으로 끌어올렸기 때문이다. 실제 팀에서 synthetic data가 오래 살아남으려면 생성 규칙이 설명 가능해야 하고, 실패 샘플을 다시 재현할 수 있어야 하며, 검증 로직을 코드로 남길 수 있어야 한다. 그 점에서 NeMo Data Designer는 LLM을 데이터 생성기의 한 부품으로 두되, 전체 품질 책임은 파이프라인 설계가 지도록 만든다.

동시에 이 도구의 한계도 분명하다. 아무리 좋은 프레임워크라도 데이터셋 설계 자체를 대신해주지는 않는다. 어떤 필드를 샘플링으로 만들고 어떤 필드를 생성으로 넘길지, 어떤 상관관계를 강제해야 하는지, 어떤 검증 규칙이 실제 업무 품질과 연결되는지는 여전히 사용자 조직의 도메인 이해에 달려 있다. 그래서 이 프로젝트의 진짜 가치는 "합성 데이터를 자동으로 만들어준다"가 아니라, 팀이 합성 데이터 설계를 운영 가능한 자산으로 바꾸게 해준다는 데 있다.

RAG 평가, alignment 데이터 구축, 개인정보 제약이 있는 산업 데이터 대체, 미세 조정용 시나리오 확장 같은 문제를 다루는 팀이라면 이 프레임워크는 한 번 볼 가치가 있다. 특히 데이터 품질을 개별 예시의 자연스러움이 아니라, 구조적 일관성·검증 가능성·반복 가능성으로 보는 팀일수록 더 잘 맞는다.

Sources: https://discuss.pytorch.kr/t/nemo-data-designer-feat-nvidia/8386 , https://nvidia-nemo.github.io/DataDesigner/latest/ , https://github.com/NVIDIA-NeMo/DataDesigner
