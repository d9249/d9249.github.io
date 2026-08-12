---
title: "Motif 3는 314B MoE를 7개 전문 교사의 단일 정책으로 묶는다"
date: "2026-08-13T01:43:48"
description: "Motif 3는 314B total·13.2B activated MoE, 256K context, GDLA와 MOPD를 결합해 큰 희소 모델의 용량을 도구 사용·코드·장문 추론 전문성으로 통합하려는 공개 모델 릴리스다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - Motif 3
  - MoE
  - Post-training
  - Long Context
  - Agentic AI
draft: false
---

오픈 웨이트 모델의 경쟁은 이제 parameter 수만의 문제가 아니다. MoE가 total parameter를 크게 늘리면서도 token마다 일부 경로만 활성화하는 방식이 보편화됐지만, 그 큰 용량을 코드·도구 사용·장문 맥락·대화처럼 성격이 다른 작업에 어떻게 나누고 다시 하나로 합칠지는 별도의 post-training 문제다. 하나의 RL reward에 전부를 얹으면 verifier의 지연 시간과 reward 분산, 실패 양식이 서로 다른 작업들이 같은 최적화 표면에서 충돌할 수 있다.

Motif Technologies의 **Motif 3**는 이 문제를 전면에 둔 decoder-only MoE 모델이다. 기술 리포트 기준 총 314B parameter 중 token마다 약 13.2B만 활성화하며, 384개 routed expert 가운데 8개를 선택한다. 아키텍처는 GDLA(Grouped Differential Latent Attention), Expert-Specific PolyNorm, 수정한 mHC, 1-layer MTP를 묶고, 256K context까지 학습한다. 더 중요한 차이는 일반 SFT 학생을 만든 뒤 역량별 교사를 따로 훈련하고, 마지막에 **Multi-teacher On-Policy Distillation(MOPD)**으로 단일 모델에 통합하는 post-training 설계다.

이 글에서 말하는 수치와 성능은 모두 저자가 arXiv 리포트와 모델 카드에 보고한 값이다. 공개 가중치·serving 안내·B200용 학습 예제는 확인할 수 있지만, 외부의 동일 harness 재현 결과와 동의어로 읽어서는 안 된다.

![Motif 3 전문 교사 통합 흐름](/images/blog/motif3-specialist-consolidation.svg)

*Motif 3 공개 리포트 §4.3, §5, §5.2.4에 근거해 정리한 post-training 흐름. 일반 SFT 학생에서 전문 교사 학습과 MOPD 통합으로 이어지는 순서를 나타낸다.*

## 무엇을 해결하려는가

큰 MoE의 난점은 expert 수를 늘리는 데서 끝나지 않는다. sparse routing이 초기에 일부 expert로 쏠리면 자주 선택된 expert만 더 많은 gradient를 받고, 나머지는 사실상 죽은 expert가 되기 쉽다. 반대로 post-training에서 agentic, 업무 문서, 소프트웨어 공학, 수학, 과학 코드, 장문 근거 기반 응답, chat을 하나의 reward와 rollout 설정으로 섞으면, task마다 다른 verifier 비용과 신호 품질이 서로의 학습을 방해할 수 있다.

Motif 3 리포트는 이 두 층을 분리한다. pretraining에서는 FP32 router, auxiliary-loss-free bias, sequence-wise balancing loss, 감쇠하는 router noise, layer별 계수를 조합해 expert utilization과 수치 안정성을 관리한다. post-training에서는 먼저 일반 SFT 모델을 만들고, 그 checkpoint에서 도메인 특화 교사를 분리해 키운다. 즉 “거대한 모델 하나를 범용 RL로 훈련한다”보다, 공통 능력은 학생에 남기고 고비용·고분산 문제는 교사별로 다루겠다는 설계다.

## 핵심 아이디어: 세 층의 확장과 통합

Motif 3의 backbone은 53 Transformer layer 중 처음 2개는 dense FFN, 나머지 51개는 sparse MoE FFN으로 구성된다. 각 sparse layer에는 384 routed expert와 1개의 shared expert가 있고, normalized sigmoid router가 token당 routed expert 8개를 고른다. attention은 80 query head와 16 KV head를 쓰며, 4개 layer마다 한 번은 full causal attention, 나머지 세 번은 128-token sliding-window attention을 쓰는 hybrid GDLA schedule을 채택한다.

GDLA는 differential attention의 noise-suppression 발상과 MLA의 compressed KV state를 결합한다. 신호 query head는 noise query head보다 많게 배치하고, input-dependent coefficient로 noise 경로를 빼며, 압축된 KV representation은 두 경로가 함께 쓴다. 리포트의 약 10B controlled experiment에서는 GDLA가 GDA와 MLA보다 낮은 training loss를 보였고, loss 3.2에 MLA보다 <strong>9.2% 적은 training token</strong>으로 도달했다고 보고한다. 이는 최종 314B 모델의 직접 A/B 결과가 아니라, attention 설계를 진단하기 위한 소형 통제 실험이라는 범위를 유지해 읽어야 한다.

![GDLA attention 학습 손실 비교](/images/blog/motif3-gdla-training-loss.png)

*공식 리포트 Figure 2. 약 10B controlled experiment에서 보고한 GDLA·GDA·MLA의 attention training-loss 비교. 빨간 표시의 9.2%는 loss 3.2에 도달하기 위해 MLA 대비 필요했던 training token 차이다.*

post-training은 더 흥미롭다. 일반 SFT 학생에서 출발해 여섯 교사는 domain-specific GRPO로, software-engineering 교사 하나는 SFT로 만든다. 리포트가 정리한 교사 범위는 다음과 같다.

| 전문 교사 | 학습/검증 범위 | 통합 시 의미 |
|---|---|---|
| Agentic tool use | interactive shell·tool environment, multi-step task | 도구 호출과 실행 결과를 연결 |
| Professional work | 문서·스프레드시트·슬라이드 산출물 | 열린 업무 산출물 품질을 preference reward로 다룸 |
| Software engineering | repository 수정과 test 실행 | 성공한 모델 생성 trajectory를 SFT 신호로 사용 |
| Long context & abstention | 장문 retrieval·synthesis, 근거 부족 시 abstention | 무리한 답변보다 보류를 선택하는 신호 포함 |
| Mathematics | 경시·증명형 문제, symbolic/LLM judge | 정답 형식이 다양한 수학 문제 대응 |
| Code & science | program synthesis·scientific computing·물리 추론 | 실행 가능한 검증과 과학 계산을 결합 |
| Chat | instruction following·safety·한국어 응답 | 대화 품질과 언어·안전 제약을 별도 관리 |

MOPD 단계에서는 학생이 on-policy trajectory를 생성하고, 각 example을 해당 domain의 교사에게 routing한다. 이때 환경 reward를 다시 목적식에 넣는 대신, 교사가 학생이 실제로 생성한 token에 부여하는 log probability를 사용한다. generation policy와 현재 student policy의 차이는 importance weight로 거르고, 범위 밖 token은 ICE-POP filter로 제외한다. 따라서 이 방법은 full vocabulary distribution 전체를 강제 정렬하는 전통적 distillation보다, **현재 학생이 생성한 행동을 각 전문 교사가 얼마나 지지하는지**에 집중하는 token-level 업데이트다.

## 공개된 근거에서 확인되는 점

리포트가 보고한 pretraining 규모는 약 12.5T token이며, web·STEM·code·math·다국어·domain-specific corpus를 포함한다. context length는 262,144 token이고, 4K에서 32K를 거쳐 256K로 전환하는 schedule을 사용했다고 설명한다. 256K stage에서는 1개 full-attention layer와 3개 sliding-window layer의 비율을 유지하고, window size 128에서 window-aware Ring Attention을 사용한다.

저자 보고 evaluation table에서 Motif 3는 agentic·terminal 계열에 상대적으로 강한 모습을 보인다. 예를 들어 τ³-Banking은 <strong>35.3</strong>, Terminal-Bench 2.1은 <strong>74.9</strong>, SWE-bench Verified는 <strong>76.2</strong>, ITBench-AA public subset은 <strong>51.5</strong>로 적혀 있다. 그러나 같은 표의 비교 열은 각 benchmark leaderboard에서 취한 결과이고, harness·prompt·subset이 완전히 같다고 보장하지 않는다. 특히 ITBench-AA에는 public subset이라는 별표가 붙어 있어, 이 표를 일괄적인 head-to-head 리더보드로 과장할 수 없다.

| 공개 surface | 확인된 범위 | 실무에서 읽을 점 |
|---|---|---|
| arXiv technical report | 모델·학습·MOPD·평가 설정의 상세 서술 | 수치와 설계의 1차 근거지만 저자 보고치 |
| Hugging Face `Motif-3` | Block-FP8 가중치, 155 safetensors shard, MIT | 공개 가중치와 vLLM serving 설정 제공 |
| Hugging Face `Motif-3-Base` | pretraining base checkpoint | post-training 전 checkpoint를 별도 공개 |
| Hugging Face `Motif-3-NVFP4` | NVFP4 variant | 카드 기준 Blackwell/B200 2 GPU serving을 검증 구성으로 제시 |
| `motif3-training-example` | TorchTitan 기반 B200 train-only 예제, MIT | 4 nodes × 8 B200을 전제로 한 대규모 학습 예제 |

NVFP4 모델 카드는 같은 five-benchmark suite에서 Block-FP8 대비 평균 61.65 대 61.80이라고 적고, 차이를 run-to-run evaluation noise 수준으로 해석한다. 이는 quantized release가 무조건 정확도 손실이 없다는 독립 증명은 아니지만, 저자가 제공하는 deployment-oriented variant의 평가 범위를 보여준다. 해당 카드가 명시하는 검증된 serving 구성은 NVIDIA Blackwell/B200 2 GPU이며, 가벼운 로컬 모델처럼 취급할 수 있는 크기는 아니다.

![전문 교사별 RL reward trajectory](/images/blog/motif3-specialist-reward-trajectories.png)

*공식 리포트 Figure 7. Agentic, Professional Work, Long Context, Math, Code & Science, Chat RL의 누적 RL compute 대비 mean reward를 나타낸다. 옅은 선은 update별 측정값, 진한 선은 smoothing trend이며, 수치 축 눈금이 생략된 추세 그림이므로 교사 간 절대 reward를 비교하는 그래프로 해석하면 안 된다.*

## 학습 시스템을 공개했다는 것의 의미

Motif 3의 공개 범위는 model card만 있는 release보다 넓다. 공식 GitHub의 `motif3-training-example`은 TorchTitan 위에 구성된 train-only 예제이며, `llm_training.train` entrypoint, MoE/GDLA layer, distributed·quantization helper, TOML config, Dockerfile을 포함한다. README는 pretraining·SFT 예제를 모두 **4 nodes × 8 NVIDIA B200**, 즉 최소 32 GPU 대상으로 설명한다. B200 지원 CUDA image, HybridEP/DeepEP, DeepGEMM, FlashAttention, TransformerEngine 등이 들어간 container image를 전제로 하므로, 이것은 일반적인 laptop reproduction recipe가 아니라 특정 대규모 하드웨어에 맞춘 reference training framework다.

그 구분은 중요하다. repository가 있다는 사실은 방법의 코드 형태와 system decision을 검토할 수 있게 하지만, 12.5T-token 사전학습이나 저자 표의 최종 성능을 재현할 수 있다는 뜻은 아니다. repository API 기준으로 이 저장소는 2026-08-04 생성, 2026-08-10 push 상태이고 tag와 release는 없었다. 반면 MIT `LICENSE`와 third-party notices는 포함하며, TorchTitan/PyTorch·ring-flash-attention·vLLM/kernel-builder 유래 코드의 라이선스도 분리해 적고 있다.

## 실무 관점에서의 해석

Motif 3의 핵심은 314B/13.2B라는 숫자 자체보다 **전문화와 배포 통합을 분리한 운영 모델**에 있다. 전문 교사별로 verifier와 rollout budget을 달리할 수 있으면서, 최종 serving은 여러 모델을 routing하는 ensemble이 아니라 하나의 학생 policy로 끝낸다. agent stack을 운영하는 팀이라면 “여러 specialist model을 runtime에 유지할 것인가” 대신, “학습 중 specialist를 사용하고 production은 단일 policy로 압축할 수 있는가”라는 선택지를 보게 된다.

동시에 현실적인 제약도 분명하다. 314B total MoE는 token별 활성량이 13.2B라고 해도 weight storage·expert parallelism·custom kernel·GPU 세대 요구를 없애지 않는다. 공식 NVFP4 안내조차 Blackwell/B200 2 GPU를 검증된 serving 구성으로 제시하며, 학습 예제는 32 B200 node-level topology를 요구한다. 따라서 이 릴리스는 보편적 self-hosting 모델이라기보다, **대형 open-weight MoE를 architecture·post-training·systems recipe까지 함께 공개한 사례**로 보는 편이 정확하다.

Sources: [arXiv technical report](https://arxiv.org/abs/2608.09119), [Motif-3 model card](https://huggingface.co/Motif-Technologies/Motif-3), [Motif-3-Base](https://huggingface.co/Motif-Technologies/Motif-3-Base), [Motif-3-NVFP4](https://huggingface.co/Motif-Technologies/Motif-3-NVFP4), [training example repository](https://github.com/MotifTechnologies/motif3-training-example)
