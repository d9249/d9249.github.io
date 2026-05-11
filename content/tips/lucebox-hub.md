---
title: "Lucebox Hub는 소비자용 NVIDIA GPU에 맞춰 손으로 튜닝한 로컬 LLM 추론 실험장이다"
date: "2026-05-12T07:57:45"
description: "Luce-Org/lucebox-hub는 RTX 3090 같은 소비자용 NVIDIA GPU에서 로컬 LLM 추론을 더 빠르고 효율적으로 돌리기 위해 Megakernel, DFlash, PFlash 같은 CUDA/C++ 최적화 프로젝트를 모아둔 오픈소스 허브다."
author: "Sangmin Lee"
repository: "Luce-Org/lucebox-hub"
sourceUrl: "https://github.com/Luce-Org/lucebox-hub"
status: "Open source research code"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Local AI"
  - "LLM Inference"
  - "CUDA"
  - "GPU"
  - "C++"
  - "Research Code"
highlights:
  - "Megakernel, DFlash, PFlash 세 프로젝트를 한 저장소에 묶어 RTX 3090/5090/GB10/Jetson Thor 계열 CUDA GPU에서 로컬 LLM 추론 병목을 직접 건드린다."
  - "공식 배포 패키지나 Release가 아니라 source build 중심이며, DFlash는 `git clone --recurse-submodules`, CUDA 12+, CMake 3.18+, 22GB+ VRAM을 사실상 요구한다."
  - "Megakernel은 Qwen 3.5-0.8B 전체 forward를 단일 CUDA dispatch로 묶고, DFlash/PFlash는 27B GGUF target의 speculative decode/prefill을 실험한다."
  - "Apache-2.0 top-level LICENSE가 확인되지만, 하위 bench harness metadata와 외부 submodule/모델 weight 라이선스는 별도로 확인해야 한다."
  - "Linux/Windows CUDA 개발자에게 맞는 연구 코드이며 macOS Metal, ROCm, 범용 모델/하드웨어 지원을 기대하면 맞지 않는다."
draft: false
---

로컬 LLM 추론은 “모델을 내 컴퓨터에서 돌린다”는 목표만으로 끝나지 않는다. 실제로는 특정 GPU, 특정 모델 구조, 특정 quantization 조합에 맞춰 얼마나 효율적으로 kernel을 짜느냐가 체감 속도와 전력 효율을 크게 바꾼다.

`Lucebox Hub`는 이 문제를 정면으로 다루는 CUDA/C++ 중심의 오픈소스 연구 코드 허브다. 목표는 범용 inference framework를 하나 더 만드는 것이 아니라, **한 번에 하나의 chip과 model family를 겨냥해 소프트웨어를 손으로 다시 쓰는 것**이다. README 표현대로 “better silicon을 기다리지 않고 software를 rewrite”하는 쪽에 가깝다.

조사 시점 기준 GitHub 저장소에는 GitHub Release와 tag가 없고, 설치 가능한 PyPI/npm 패키지도 확인되지 않았다. 대신 `megakernel/`, `dflash/`, `pflash/` 하위 프로젝트마다 별도 README, benchmark, blog writeup, 재현 명령을 제공한다. 기본 브랜치는 `main`, 주 언어는 C++, top-level 라이선스는 Apache-2.0이다.

![Lucebox Hub banner](/images/tips/lucebox-hub-banner.png)

## Lucebox Hub 개요

저장소의 현재 중심은 세 가지 실험이다.

- **Megakernel**: Qwen 3.5-0.8B의 24개 layer forward pass를 하나의 persistent CUDA kernel dispatch로 묶는다. 목표는 CPU round-trip과 layer별 kernel launch overhead를 줄여 consumer NVIDIA GPU의 전력 효율을 끌어올리는 것이다.
- **DFlash**: Qwen3.5/Qwen3.6 27B GGUF target에 DFlash speculative decoding과 DDTree verify를 붙인 C++/CUDA runtime이다. 24GB RTX 3090에서 Q4_K_M target과 BF16 draft를 맞춰 넣는 것이 핵심 제약이다.
- **PFlash**: 긴 context에서 prefill이 병목이 되는 문제를 speculative prefill로 줄인다. 작은 drafter가 token importance를 점수화하고, 큰 target은 중요한 span만 prefill하도록 만든다.

README의 기준 하드웨어는 RTX 3090 24GB다. 다만 문서에는 Turing RTX 2080 Ti, Ada RTX 4090, Blackwell RTX 5090, DGX Spark/GB10, Jetson AGX Thor 같은 경로도 언급된다. 중요한 점은 이것이 “모든 GPU에서 잘 돌아가는 앱”이 아니라, **CUDA가 되는 NVIDIA GPU와 특정 모델 조합을 전제로 한 성능 연구 코드**라는 점이다.

## 왜 유용한가

Lucebox Hub가 흥미로운 이유는 llama.cpp, vLLM, SGLang 같은 범용 runtime이 놓치기 쉬운 작은 경계를 직접 건드린다는 데 있다. README와 각 결과 문서는 다음 문제를 반복해서 다룬다.

- layer마다 CPU로 돌아왔다가 다시 CUDA kernel을 dispatch하는 overhead
- 24GB VRAM 안에 27B quantized target, draft model, verify tree state, KV cache를 함께 넣는 memory budget
- long-context prompt에서 prefill 시간이 decode보다 커지는 현상
- generic software stack이 소비자용 GPU의 tensor core, shared memory, cooperative group을 충분히 활용하지 못하는 문제

예를 들어 Megakernel은 Qwen 3.5-0.8B에서 “모든 layer를 하나의 CUDA dispatch로” 묶는 접근을 보여준다. DFlash는 public DFlash 구현이 B200/BF16 중심인 상황에서, 24GB consumer GPU에 맞는 GGUF/Q4_K_M target path를 별도로 만든다. PFlash는 128K prompt prefill을 줄이기 위해 drafter scoring과 sparse forward kernel을 daemon 안으로 끌어온다.

실무적으로는 이런 사람에게 유용하다.

- RTX 3090/4090/5090 같은 NVIDIA GPU에서 로컬 LLM inference를 직접 튜닝하고 싶다.
- speculative decoding, DDTree, speculative prefill, block-sparse attention 구현을 읽고 재현하고 싶다.
- “범용 프레임워크로 충분히 빠른가?”가 아니라 “특정 모델/하드웨어에서 어디까지 갈 수 있는가?”를 보고 싶다.
- 논문 아이디어를 consumer GPU와 GGUF/ggml runtime 쪽으로 옮기는 사례를 찾고 있다.

## 설치와 첫 사용법

이 저장소는 아직 일반 사용자용 installer가 아니라 source build 흐름에 가깝다. 먼저 전체 저장소를 submodule까지 받아야 한다. 특히 DFlash는 pinned `Luce-Org/llama.cpp@luce-dflash` fork와 Block-Sparse-Attention submodule을 사용한다.

```bash
git clone --recurse-submodules https://github.com/Luce-Org/lucebox-hub
cd lucebox-hub
```

Megakernel을 먼저 확인하고 싶다면 `megakernel/`에서 Python extension을 빌드한다. README 기준 Python 3.10+, CUDA 12+, PyTorch 2.0+가 필요하고, `setup.py`가 build time에 torch를 import하므로 torch를 먼저 설치해야 한다.

```bash
cd megakernel
python -m venv .venv && source .venv/bin/activate
pip install --upgrade pip
pip install torch
pip install -e . --no-build-isolation
python final_bench.py
```

DFlash는 CMake/CUDA build다. README 기준 CUDA 12+, CMake 3.18+가 필요하고, 3090만 겨냥하면 `-DCMAKE_CUDA_ARCHITECTURES=86`을 명시해 build 시간을 줄일 수 있다.

```bash
cd lucebox-hub/dflash
cmake -B build -S . -DCMAKE_BUILD_TYPE=Release -DCMAKE_CUDA_ARCHITECTURES=86
cmake --build build --target test_dflash -j
```

그다음 target/draft weight를 Hugging Face에서 내려받는다. 27B target과 draft를 합치면 디스크와 VRAM 요구량이 커지므로, 단순 데모처럼 보이더라도 작업 공간을 넉넉히 잡아야 한다.

```bash
huggingface-cli download unsloth/Qwen3.6-27B-GGUF Qwen3.6-27B-Q4_K_M.gguf --local-dir models/
huggingface-cli download z-lab/Qwen3.6-27B-DFlash model.safetensors --local-dir models/draft/
python3 scripts/run.py --prompt "def fibonacci(n):"
```

PFlash는 별도 runtime이라기보다 `dflash/` daemon 안의 speculative-prefill path에 가깝다. `pflash/` 디렉터리는 NIAH case generation과 benchmark harness 같은 Python tooling을 담는다. 긴 context 실험을 하려면 BSA kernel까지 켜서 build한다.

```bash
cd lucebox-hub/dflash
cmake -B build -S . -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_CUDA_ARCHITECTURES=86 \
  -DDFLASH27B_ENABLE_BSA=ON
cmake --build build --target test_dflash test_flashprefill_kernels -j
```

## 플랫폼과 하드웨어 범위

이 tips 사이트의 platform bucket은 거칠지만, 실제 지원 범위는 분명히 **NVIDIA CUDA 중심**이다. macOS Metal용 프로젝트가 아니고, ROCm도 범위 밖이라고 문서가 말한다.

README 기준 요구 사항은 다음처럼 보는 것이 안전하다.

- Megakernel: CUDA 12+, PyTorch 2.0+, Turing 이상 NVIDIA GPU. RTX 3090이 primary target이고, RTX 2080 Ti는 FP16 path로 지원된다.
- DFlash: NVIDIA sm_75+ 또는 Jetson AGX Thor sm_110, CUDA 12+ (Thor는 CUDA 13+), CMake 3.18+, 22GB+ VRAM, 약 80GB 디스크 여유.
- PFlash: headline long-context 성능은 sm_80+ BSA path가 전제다. Turing sm_75에서는 BSA가 꺼지고 WMMA fallback으로 느려질 수 있다.
- Windows: `RESULTS.md`에 RTX 5090 Windows 11 community run이 있지만, 공식 quickstart는 Linux shell/CMake/CUDA 흐름에 더 가깝다.

즉 일반 macOS 노트북이나 AMD GPU에서 바로 써볼 도구라기보다, NVIDIA CUDA 개발 환경을 갖춘 사람이 읽고 빌드해보는 코드에 가깝다.

## 주의할 점

첫째, Lucebox Hub는 빠르게 움직이는 연구 저장소다. GitHub Release와 tag가 없고, 각 프로젝트가 README와 benchmark 결과를 통해 배포된다. 의존성, weight 경로, 성능 숫자는 commit과 하드웨어에 따라 바뀔 수 있다.

둘째, benchmark 숫자는 특정 조건을 강하게 탄다. README는 RTX 3090, 특정 power limit, Q4_K_M target, BF16 draft, DDTree budget, KV cache quantization, Flash Attention window 같은 설정을 자세히 적는다. 다른 GPU나 다른 context length에서는 budget과 cache 설정을 다시 sweep해야 한다.

셋째, top-level 라이선스는 Apache-2.0이지만 외부 submodule과 모델 weight는 별개다. DFlash는 `Luce-Org/llama.cpp-dflash-ggml` fork와 `mit-han-lab/Block-Sparse-Attention`을 끌어오고, 모델 weight는 Hugging Face의 `unsloth`, `z-lab`, `Qwen`, `poolside` 계열 리소스를 사용한다. 제품에 넣거나 재배포할 때는 코드 라이선스만 보지 말고 weight와 submodule 라이선스도 확인해야 한다.

넷째, `pflash/pyproject.toml`은 Python bench harness metadata에서 MIT를 선언하지만, 저장소의 top-level `LICENSE`와 CONTRIBUTING 문서는 Apache-2.0을 기준으로 설명한다. 하위 패키지만 따로 배포하거나 재사용한다면 해당 경계도 다시 확인하는 편이 안전하다.

## 내 판단

Lucebox Hub는 일반 사용자가 “앱처럼 설치해서 로컬 LLM을 돌리는 도구”라기보다, 로컬 inference runtime을 직접 파고드는 개발자와 연구자에게 좋은 자료다. CUDA kernel, ggml, speculative decoding, long-context prefill, consumer GPU memory budget에 관심이 있다면 README와 subproject 결과 문서만 읽어도 배울 것이 많다.

반대로 Ollama처럼 모델을 간단히 내려받아 쓰고 싶은 사용자, macOS/Metal 환경 사용자, 다양한 모델을 범용으로 서빙하려는 팀이라면 바로 도입하기에는 범위가 좁다. 내 기준으로는 **RTX 3090급 NVIDIA GPU를 가진 로컬 AI 최적화 실험자에게 추천할 만한 research code hub**다.

## 참고한 공개 자료

- [Luce-Org/lucebox-hub GitHub repository](https://github.com/Luce-Org/lucebox-hub)
- [Lucebox website](https://www.lucebox.com/)
- [Lucebox blog](https://www.lucebox.com/blog)
- [Megakernel writeup](https://github.com/Luce-Org/lucebox-hub/tree/main/megakernel)
- [DFlash writeup](https://github.com/Luce-Org/lucebox-hub/tree/main/dflash)
- [PFlash writeup](https://github.com/Luce-Org/lucebox-hub/tree/main/pflash)
- [Lucebox Hub LICENSE](https://github.com/Luce-Org/lucebox-hub/blob/main/LICENSE)
