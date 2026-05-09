---
title: "AutoKernel은 GPU 커널 최적화를 에이전트 실험 루프로 바꾼다"
date: "2026-05-06T04:22:43"
description: "AutoKernel은 PyTorch 모델을 프로파일링해 병목 GPU 커널을 추출한 뒤, Triton 또는 CUDA C++ 커널을 에이전트가 반복적으로 수정·벤치마크·유지/되돌리기 하도록 설계해 하룻밤 단위의 자동 커널 최적화를 가능하게 하려는 오픈소스 프레임워크다."
author: "Sangmin Lee"
category: "inference-systems"
tags:
  - GPU Optimization
  - Triton
  - CUDA
  - Agents
  - PyTorch
draft: false
---

대형 모델 인프라에서 병목은 점점 더 모델 구조 자체보다 실행 커널 쪽으로 내려오고 있다. 같은 PyTorch 모델이라도 어떤 matmul, norm, softmax, attention 커널이 깔려 있는지에 따라 실제 처리량은 크게 달라진다. 문제는 이런 최적화가 여전히 소수의 CUDA/Triton 전문가가 긴 수작업 실험을 통해 하나씩 밀어붙이는 형태라는 점이다. 아이디어는 많지만, 실제 현장에서는 “어떤 커널을 먼저 최적화할지”, “정확도는 안 깨졌는지”, “이 개선이 end-to-end latency에 얼마나 의미가 있는지”를 체계적으로 추적하기가 어렵다.

RightNow AI의 `autokernel`은 이 문제를 꽤 선명하게 정의한다. 이 저장소는 스스로를 “Autoresearch for GPU kernels”라고 부르며, 아무 PyTorch 모델이나 넣으면 프로파일링 → 병목 커널 추출 → 커널 단위 반복 최적화 → end-to-end 검증까지 이어지는 에이전트 루프를 제공하겠다고 한다. 핵심은 단순히 커널 코드를 생성하는 것이 아니라, 고정된 평가 하네스 안에서 에이전트가 한 파일만 바꾸고, 벤치마크를 돌리고, 좋아지면 유지하고 나빠지면 되돌리는 실험 체계를 자동화한다는 점이다.

특히 이 프로젝트가 흥미로운 이유는 “AI가 GPU 커널도 써 줄 수 있다”는 데서 멈추지 않는다는 데 있다. AutoKernel은 커널 생성보다 커널 연구 프로세스 자체를 소프트웨어로 만든다. 어떤 커널이 전체 모델 latency에서 가장 중요하고, 지금 시점에 Triton이 유리한지 CUDA C++가 유리한지, 어느 순간 다음 병목으로 넘어가야 하는지까지 Amdahl's law와 고정 벤치마크 흐름으로 제어한다. 즉 프롬프트형 코드 생성기가 아니라, GPU 최적화용 autonomous experiment loop에 가깝다.

![AutoKernel progress](https://github.com/RightNow-AI/autokernel/raw/main/progress.png)

## 무엇을 해결하려는가

AutoKernel이 겨냥하는 문제는 GPU 커널 최적화의 높은 탐색 비용이다. 보통 모델 서빙이나 학습 가속에서 “병목은 알겠는데 어디서부터 손대야 하는지”가 첫 번째 문제이고, 특정 커널을 바꿨을 때 실제로 전체 모델 속도가 얼마나 좋아지는지 계산하는 것이 두 번째 문제다. 여기에 correctness, numerical stability, determinism 같은 검증까지 붙으면, 작은 아이디어 하나를 검증하는 데도 적지 않은 시간이 든다.

이 저장소는 그 복잡성을 실험 루프로 재구성한다. README 기준 AutoKernel은 먼저 `profile.py`로 모델을 프로파일링해 GPU 시간 기준 병목 커널을 찾고, `extract.py`로 각 병목을 독립적인 Triton 또는 CUDA C++ 커널로 추출한 다음, `bench.py`가 정한 고정 평가 하네스 안에서 `kernel.py`를 계속 수정하게 만든다. 각 실험은 약 90초 정도 걸리고, 저장소 설명대로라면 시간당 약 40회, 하룻밤 동안 320회 수준의 반복 실험을 돌릴 수 있다. 다시 말해 사람이 계속 붙어서 튜닝하던 작업을 “잠자는 동안 실험이 누적되는 구조”로 바꾸는 것이 프로젝트의 목표다.

실무적으로 더 중요한 문제 정의는 end-to-end 관점이다. 어떤 커널 하나를 2배 빠르게 만든다고 해서 모델 전체가 2배 빨라지는 것은 아니다. 그래서 AutoKernel은 단일 커널 throughput 경쟁보다 Amdahl's law 기반 우선순위 결정을 전면에 내세운다. 60% 병목을 1.5배 개선하는 것과 5% 병목을 3배 개선하는 것은 전혀 같은 가치가 아니며, 저장소는 이 판단을 `orchestrate.py`가 담당하도록 설계했다.

## 핵심 아이디어 / 구조 / 동작 방식

AutoKernel의 핵심은 “수정 대상은 하나, 평가는 고정, 선택은 keep/revert”라는 실험 규율에 있다. 에이전트는 `program.md`를 읽고 동작하는데, 이 문서는 사실상 연구 조직의 운영 규칙처럼 쓰여 있다. 모델을 프로파일링하고, 상위 5~10개 병목 커널을 뽑고, branch를 만들고, baseline을 기록하고, 그 후에는 `kernel.py` 한 파일만 수정하면서 반복 실험을 진행한다. 성능이 좋아지면 유지하고, correctness가 깨지거나 throughput이 개선되지 않으면 되돌린다.

구조적으로는 네 단계가 명확하다. 첫째, `profile.py`가 `torch.profiler`를 사용해 모델 전체에서 어떤 op가 GPU 시간을 가장 많이 먹는지 파악한다. 둘째, `extract.py`가 상위 병목을 standalone 커널로 뽑아 workspace에 배치한다. 셋째, `bench.py`가 5단계 correctness 검사와 roofline 분석, 성능 측정을 반복한다. 넷째, `verify.py`가 최적화된 커널을 다시 모델에 꽂아 end-to-end correctness와 총 speedup을 검증한다. 즉 커널 생성과 모델 통합 사이에 실험 안전장치가 촘촘히 들어 있다.

또 하나 중요한 축은 dual backend 전략이다. README와 changelog에 따르면 AutoKernel은 Triton뿐 아니라 CUDA C++ 백엔드도 지원한다. Triton은 빠른 반복 실험과 비교적 낮은 구현 복잡도에 강하고, CUDA C++는 tensor core, warp intrinsic, shared memory tiling 같은 더 직접적인 하드웨어 제어를 가능하게 한다. 이 둘을 같은 `kernel_fn()` 인터페이스 아래 두고, `bench.py`가 동일한 방식으로 평가하도록 만든 점은 꽤 실용적이다. 초기 탐색은 Triton으로, 마지막 몇 퍼센트는 CUDA C++로 미는 식의 운영이 가능해진다.

KernelBench 통합도 흥미롭다. AutoKernel은 one-shot LLM kernel generation과 달리, 문제당 50~300회 이상의 iterative refinement를 수행하는 구조를 강조한다. `kernelbench/bridge.py`, `bench_kb.py`, `scorer.py`, `program_kb.md`가 별도 모드로 제공되며, `fast_p` 기반 점수 계산까지 포함한다. 즉 이 프로젝트는 실사용 모델 최적화와 benchmark-style kernel generation 평가를 같은 agentic loop 아래 묶으려는 시도라고 볼 수 있다.

| 단계 | 핵심 스크립트 | 하는 일 | 실무적 의미 |
|---|---|---|---|
| Profiling | `profile.py` | 모델 전체에서 GPU 시간 기준 병목 op 식별 | 어디부터 최적화할지 결정 |
| Extraction | `extract.py` | 병목을 standalone Triton/CUDA 커널로 추출 | 실험 단위를 작은 커널로 분리 |
| Optimization Loop | `kernel.py`, `bench.py`, `orchestrate.py` | 한 파일 수정, correctness 검사, 성능 측정, keep/revert | 자동화된 반복 실험 루프 형성 |
| Integration | `verify.py` | 최적화 커널을 다시 모델에 연결해 end-to-end 검증 | micro-benchmark 착시 방지 |

| 관점 | 일반적인 LLM 기반 커널 생성 | AutoKernel |
|---|---|---|
| 실행 방식 | 한 번 생성하고 결과를 보는 one-shot 경향 | 수십~수백 회의 iterative refinement |
| 최적화 대상 | 단일 문제 또는 단일 커널 중심 | 전체 모델 병목을 Amdahl's law로 우선순위화 |
| 검증 | 정답 통과 여부 위주인 경우가 많음 | 5단계 correctness + performance + roofline |
| 코드 수정 범위 | 프롬프트에 따라 넓게 바뀔 수 있음 | `kernel.py` 한 파일로 제한 |
| 최종 목표 | 빠른 커널 생성 데모 | end-to-end 모델 speedup |

## 공개된 근거에서 확인되는 점

공개 저장소에서 확인되는 수치와 구성도 꽤 선명하다. 조회 시점 기준 GitHub 저장소는 약 1.3k stars, 129 forks를 보이며, 기본 브랜치 기준 43 commits가 쌓여 있다. 저장소 설명은 “Give it any PyTorch model, go to sleep, wake up to optimized Triton or CUDA C++ kernels”로 요약된다. 라이선스는 MIT다. 만들어진 시점은 2026년 3월로 비교적 최근이지만, 짧은 시간 안에 커널 최적화와 에이전트 자동화 교차점에서 주목을 받은 프로젝트로 보인다.

README 기준 지원 커널도 명확하다. `matmul`, `softmax`, `layernorm`, `rmsnorm`, `flash_attention`, `fused_mlp`, `cross_entropy`, `rotary_embedding`, `reduce`의 9개 커널 타입을 제공하며, 각 커널은 PyTorch reference, Triton starter kernel, CUDA C++ starter kernel을 함께 갖는다. 예제 모델로는 GPT-2 Small, compact LLaMA, LLaMA 7B, BERT-base, custom template이 포함돼 있고, optional dependency를 통해 Hugging Face `transformers` 모델도 프로파일링 대상으로 삼을 수 있다.

운영 요구사항도 실무적이다. Quick Start는 NVIDIA GPU를 기본 전제로 하며 H100, A100, RTX 4090에서 테스트됐다고 적고 있다. Python 3.10+, `uv`가 기본 요구사항이고, `pyproject.toml` 기준 기본 의존성은 `torch>=2.4.0`, `triton>=3.3.0`, `numpy`, `pandas`, `matplotlib`다. 추가로 `models`, `cuda`, `kernelbench`, `profiling`, `hf-kernels` extras가 분리돼 있어 사용 시나리오별 의존성 확장이 가능하다.

changelog도 프로젝트 방향을 잘 보여준다. `v1.1.0`에서는 CUDA C++ 백엔드와 KernelBench 통합이 추가됐고, `v1.2.0`에서는 profiler에 trace/memory snapshot/torch.compile log export와 HuggingFace Kernels export가 붙었다. `v1.3.0`에서는 AMD ROCm 지원(MI300X, MI325X, MI350X, MI355X)과 함께 여러 correctness-related bugfix가 들어갔다. 즉 초기의 Triton-only 실험에서 출발해, 최근에는 CUDA와 ROCm, export, profiling artifact까지 넓히며 실제 사용 범위를 키우는 흐름이다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub 저장소 메타데이터 | 1.3k+ stars, 129 forks, Python 기반, MIT License | 빠르게 주목받은 초기 오픈소스 인프라 프로젝트 |
| README | 9개 핵심 커널, profile→extract→bench→verify 파이프라인 | 데모가 아니라 반복 가능한 최적화 공정 지향 |
| `program.md` | 10+시간 autonomous run, keep/revert 규칙, Amdahl's law orchestration | 에이전트 행동 규율을 문서화한 연구 운영체제에 가까움 |
| `CHANGELOG.md` | CUDA C++ backend, KernelBench, HF export, ROCm support | 단일 실험 저장소에서 점차 범용 최적화 도구로 확장 중 |

## 실무 관점에서의 해석

내가 보기에 AutoKernel의 진짜 포인트는 커널 최적화 자체보다 “최적화 연구의 운영체제”를 만들었다는 데 있다. 지금까지 많은 GPU 튜닝 작업은 특정 전문가가 감으로 block size를 바꾸고, roofline을 보고, 여러 버전을 비교하며, 잘 안 되면 원복하는 식으로 흘렀다. AutoKernel은 이 흐름을 에이전트가 안전하게 반복할 수 있는 단위 작업으로 쪼개고, correctness와 revert 규칙을 강하게 박아 넣는다. 결국 AI가 코드를 쓰는 것이 아니라, 연구 실험을 관리하는 구조가 더 중요하다는 메시지다.

특히 `kernel.py` 한 파일만 수정하게 만드는 설계는 매우 영리하다. 에이전트의 자유도를 줄이면 겉보기 창의성은 떨어질 수 있지만, 대신 diff가 관리 가능해지고 revert가 쉬워지며, 어떤 변화가 성능 차이를 만들었는지 추적하기 훨씬 쉬워진다. 이것은 자율성을 올리기 위해 오히려 수정 범위를 줄인 사례다.

물론 한계도 분명하다. 첫째, 공개 README에 “각 실험이 약 90초”라고 적혀 있듯, 반복 실험 비용이 결코 싸지 않다. 둘째, 실제 production 커널 최적화는 단일 op throughput 외에도 framework integration, graph capture, launch overhead, allocator behavior, batching 전략 같은 요소에 좌우된다. 셋째, 저장소가 아직 비교적 초기 단계라, 대규모 실전 도입 사례보다는 강한 방향성의 오픈소스 prototype에 더 가깝다. GitHub Releases API 상의 정식 release 객체가 없고 changelog 중심으로 버전을 관리하는 점도 이런 초기성을 보여준다.

그럼에도 방향은 매우 설득력 있다. 앞으로 모델 최적화에서 중요한 것은 “좋은 커널을 한 번 생성하는 능력”보다 “좋은 실험을 밤새 수백 번 굴리는 능력”일 수 있다. AutoKernel은 그 가설을 GPU 커널 영역에서 가장 직설적으로 구현한 프로젝트 중 하나다. Triton, CUDA, KernelBench, Hugging Face Kernels export, ROCm 지원까지 잇는 현재 구조를 보면, 장기적으로는 AI가 하드웨어 근접 최적화까지 맡는 운영 흐름의 초입에 서 있는 프로젝트로 읽힌다.

Sources: https://github.com/RightNow-AI/autokernel, https://github.com/RightNow-AI/autokernel/blob/main/CHANGELOG.md, https://github.com/RightNow-AI/autokernel/blob/main/program.md, https://github.com/ScalingIntelligence/KernelBench