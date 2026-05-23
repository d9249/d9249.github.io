---
title: "Transformer Lab은 로컬 실험과 GPU 클러스터를 하나의 AI 연구실 UI로 묶는다"
date: "2026-05-23T15:19:24"
description: "transformerlab/transformerlab-app은 모델 다운로드, fine-tuning, evaluation, dataset/task/job 관리, Slurm·SkyPilot·cloud GPU 실행을 한 UI와 CLI로 묶는 AGPL-3.0 오픈소스 AI 연구 플랫폼이다."
author: "Sangmin Lee"
repository: "transformerlab/transformerlab-app"
sourceUrl: "https://github.com/transformerlab/transformerlab-app"
status: "Open source"
license: "AGPL-3.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Research"
  - "MLOps"
  - "LLM Training"
  - "Evaluation"
  - "GPU Orchestration"
  - "Developer Tools"
highlights:
  - "개인용으로는 macOS Apple Silicon, Linux GPU, Windows WSL2/CUDA 환경에서 브라우저 기반 연구 UI를 띄우는 흐름을 제공한다."
  - "팀용으로는 Slurm, SkyPilot, RunPod, dstack, AWS, Azure, GCP 같은 compute provider를 등록하고 task/job을 큐잉하는 control plane에 가깝다."
  - "MLX, vLLM, Ollama, Hugging Face Transformers, LoRA/QLoRA/RLHF, LM Evaluation Harness, model registry, dataset/task gallery를 한 제품 표면으로 묶는다."
  - "공식 Desktop app은 v0.28.0 이후 deprecate 방향이며, 현재 권장 경로는 CLI로 서버를 설치하고 브라우저에서 `localhost:8338`에 접속하는 방식이다."
  - "기본 admin 계정, 원격 storage credential, Slurm SSH key, AGPL-3.0, 앱 telemetry opt-out을 도입 전에 반드시 확인해야 한다."
draft: false
---

AI 연구 환경은 쉽게 조각난다. 모델은 Hugging Face에서 받고, inference는 Ollama나 vLLM으로 돌리고, fine-tuning은 별도 trainer를 쓰고, evaluation은 또 다른 harness를 붙이고, GPU 클러스터 작업은 Slurm이나 cloud queue에 따로 제출한다. 개인 실험에서는 이 정도가 귀찮은 수준이지만, 연구실·스타트업·팀 단위가 되면 “누가 어떤 모델을 어떤 데이터로 어느 GPU에서 돌렸는가”를 추적하는 일 자체가 플랫폼 문제가 된다.

`Transformer Lab`은 이 조각난 AI 연구 도구들을 하나의 UI와 CLI로 묶으려는 오픈소스 프로젝트다. README 표현을 빌리면 “The Operating System for AI Research Labs”이고, 실제 제품 표면도 단순 채팅 앱이나 inference server보다 **ML 연구 control plane**에 가깝다. 모델 갤러리, dataset, task, job, evaluation, notes, model registry, compute provider, artifact storage를 한 화면에서 다루는 방향이다.

조사 시점 기준 저장소 `transformerlab/transformerlab-app`은 Python/TypeScript 중심의 AGPL-3.0 오픈소스이며, GitHub 최신 릴리스는 `v0.38.0`이다. README는 개인용과 팀용을 나눠 설명한다. 개인용은 로컬 machine에서 모델을 내려받고 train/evaluate/chat하는 흐름이고, 팀용은 Slurm, SkyPilot, cloud GPU, shared storage 위에서 task와 job을 queueing하는 흐름이다.

![Transformer Lab task queue UI](/images/tips/transformer-lab-tasks.png)

## Transformer Lab 개요

Transformer Lab을 한 문장으로 줄이면 **AI 연구 워크플로용 web UI + API server + CLI + compute orchestration layer**다. 개인 노트북에서 “모델을 받아서 실험해보는 도구”로도 쓸 수 있지만, 프로젝트의 더 큰 방향은 여러 연구자가 공유하는 GPU 자원과 실험 산출물을 관리하는 플랫폼이다.

주요 표면은 다음과 같다.

- **모델과 inference**: Llama, DeepSeek, Mistral, Qwen, Phi 계열 모델 다운로드와 실행, MLX/vLLM/Ollama/Hugging Face Transformers engine 지원
- **학습과 fine-tuning**: full fine-tuning, LoRA/QLoRA, RLHF 계열 DPO/ORPO/SIMPO, reward modeling, Apple Silicon MLX·NVIDIA CUDA·AMD ROCm trainer 경로
- **평가와 분석**: LLM-as-a-judge, EleutherAI LM Evaluation Harness 기반 benchmark, bias/toxicity/faithfulness scoring, red-teaming workflow
- **연구 산출물 관리**: experiment, notes, dataset, model registry, artifact, checkpoint, job output
- **팀 실행 계층**: Slurm, SkyPilot, RunPod, dstack, AWS, Azure, GCP 같은 provider를 붙이고 task/job을 실행
- **확장성**: Python plugin architecture, `transformerlab` SDK, `lab` CLI

중요한 경계도 있다. Transformer Lab은 Ollama처럼 “모델 하나를 빠르게 serve하는 초간단 CLI”가 아니다. 반대로 Kubeflow처럼 거대한 enterprise ML platform을 처음부터 깔자는 제안도 아니다. 위치를 잡자면 **연구자가 실제로 만지는 UI를 앞에 두고, 뒤에서는 local/server/cloud/cluster 실행을 연결하는 중간층**에 가깝다.

## 설치와 첫 실행

README의 개인용 quick start는 install script로 시작한다. 공식 docs의 예전 Individuals install page는 “더 이상 유지보수되지 않으며 최신 setup은 Teams install page를 보라”는 warning을 달고 있지만, README와 install page 모두 기본 실행 흐름 자체는 다음처럼 설명한다.

```bash
curl -LsSf https://lab.cloud/install.sh | bash
cd ~/.transformerlab/src
./run.sh
```

서버가 뜨면 브라우저에서 다음 주소로 접속한다.

```text
http://localhost:8338
```

팀용 설치 문서는 `uv`로 CLI를 먼저 설치하고, CLI가 server install을 진행하는 흐름을 권장한다.

```bash
uv tool install transformerlab-cli
lab server install
cd ~/.transformerlab/src && ./run.sh
```

`lab server install`은 frontend URL, storage backend, admin account, compute provider, SMTP, authentication provider를 대화형으로 설정하고, 값은 `~/.transformerlab/.env`에 저장한다. 이때 첫 실행 기본 admin 계정은 문서상 `admin@example.com` / `admin123`이므로, 접속 직후 반드시 변경해야 한다.

CLI는 브라우저를 열지 않고 task와 job을 다룰 때 유용하다.

```bash
lab login
lab status
lab task add ./my-task-directory --dry-run
lab task queue <task-id>
lab job list
lab job artifacts <job-id>
```

패키지 표면은 조금 나뉘어 있다. GitHub 저장소의 `cli/pyproject.toml`은 `transformerlab-cli`와 `lab` entrypoint를 정의하고, `lab-sdk/pyproject.toml`은 Python SDK 패키지 `transformerlab`을 정의한다. 조사 시점 기준 PyPI에는 `transformerlab-cli`와 `transformerlab` 패키지가 올라와 있지만, 빠르게 움직이는 프로젝트라 저장소 manifest, PyPI, GitHub Release의 버전 번호가 항상 같은 의미로 정렬된다고 가정하지 않는 편이 안전하다.

## 팀용 control plane으로 볼 때

Transformer Lab for Teams의 핵심은 기존 scheduler를 대체하는 것이 아니라, 그 위에 연구자가 쓰기 쉬운 layer를 얹는 것이다. README도 “Slurm clusters or SkyPilot clouds from one UI”를 강조하고, install 문서는 compute provider로 Slurm, SkyPilot, RunPod, dstack, AWS, Azure, GCP를 별도로 안내한다.

![Transformer Lab architecture diagram](/images/tips/transformer-lab-architecture.png)

공식 architecture 이미지는 Transformer Lab을 세 층으로 그린다.

- **Machine Learning Research Platform**: experiment management, model gallery, multimodal inference UI, training, dataset management, recipe gallery, evals, data generation, team collaboration
- **GPU Orchestration Bridge**: quota, checkpoint, artifact storage, job failure handling, reservations, persistent storage, telemetry, jobs, logs
- **Compute Layer**: Kubernetes, Slurm, SkyPilot, clouds, local machine, NVIDIA/AMD/Intel/MLX

실제 도입에서는 shared storage가 중요하다. Teams 문서는 coordinator node와 worker node가 같은 artifact/job data를 봐야 하므로 S3, GCS, Azure Blob, localfs/NFS 같은 storage backend를 먼저 결정하라고 설명한다. 특히 GCS를 remote worker에서 쓰려면 service account key를 worker에 주입하는 설정이 필요하다. 즉 “웹 UI를 띄웠다”가 끝이 아니라, 팀 환경에서는 storage credential, compute credential, user credential, network 접근을 함께 설계해야 한다.

Slurm provider도 마찬가지다. 문서는 Team Settings에서 SSH host, Slurm user ID, SSH port, SSH key path 등을 넣고, 각 사용자가 User Settings에서 provider credential을 설정하는 흐름을 설명한다. 연구실 내부 Slurm login node에 붙이는 경우라면 권한, key rotation, job account 정책까지 같이 봐야 한다.

## 왜 유용한가

Transformer Lab의 실용 포인트는 “모델 실행”보다 **실험 흐름 전체를 같은 vocabulary로 묶는다**는 데 있다.

첫째, 개인 연구자에게는 여러 tool을 오가며 실험 state를 잃어버리는 문제를 줄인다. 모델 다운로드, inference, fine-tuning, eval, notes, dataset을 같은 프로젝트/experiment 맥락에서 다룰 수 있다. Apple Silicon에서는 MLX, Linux GPU에서는 CUDA/ROCm, Windows에서는 WSL2/CUDA라는 식으로 하드웨어 경로도 나뉜다.

둘째, 팀에게는 GPU job 제출과 결과 추적의 진입 장벽을 낮춘다. Slurm이나 SkyPilot을 이미 운영하고 있어도, 모든 연구자가 scheduler CLI와 cloud credential을 똑같이 잘 다루기는 어렵다. Transformer Lab은 task definition, provider selection, job status, output/artifact 확인을 UI/CLI 레벨로 끌어올린다.

셋째, evaluation과 training을 한 제품 안에 같이 둔다. 로컬 챗봇 UI는 많지만, LM Evaluation Harness, red teaming, reward modeling, RLHF 계열 workflow까지 연구 산출물 관리와 함께 묶는 제품은 범위가 다르다. 모델을 “한 번 실행해보기”보다 “반복해서 바꾸고 비교하기”에 초점이 맞아 있다.

넷째, SDK와 CLI가 있어서 완전 GUI-only 제품은 아니다. 기존 Python training script에 `transformerlab` SDK를 붙여 logging, progress, artifact tracking을 연동하거나, `lab task add`, `lab task queue`, `lab job list` 같은 명령으로 반복 작업을 자동화할 수 있다.

## 도입 전에 확인할 점

Transformer Lab은 강력하지만, 그만큼 trust boundary가 넓다.

- **Desktop app deprecation**: 저장소에는 Electron 흔적과 desktop announcement가 남아 있지만, 공식 announcement는 v0.28.0 이후 새 desktop app release를 내지 않고 CLI 설치 + browser 접속 방식을 지원 경로로 삼겠다고 안내한다. “설치형 데스크톱 앱”을 기대하기보다 server/web UI로 보는 편이 맞다.
- **기본 계정**: Teams install 문서의 첫 admin 계정은 `admin@example.com` / `admin123`이다. LAN이나 public endpoint에 노출하기 전 비밀번호 변경, OAuth/OIDC, SMTP, TLS/reverse proxy, firewall을 먼저 잡아야 한다.
- **원격 credential**: S3/GCS/Azure storage credential, GCP service account key, Slurm SSH private key, cloud provider credential이 worker/job 실행 표면에 들어간다. 연구 데이터와 cloud bill을 다루는 권한이므로 최소 권한과 rotation 정책이 필요하다.
- **AGPL-3.0**: 네트워크 서비스로 수정·운영하는 경우 license 의무가 중요해질 수 있다. 사내 fork나 hosted service를 고려한다면 법무/라이선스 검토가 필요하다.
- **Telemetry**: 공식 analytics 문서는 API에는 embedded analytics/telemetry가 없고, App은 anonymous feature-usage/crash 수준의 basic telemetry를 포함하며 Settings → Do Not Share Any Data에서 opt-out할 수 있다고 설명한다.
- **설치 표면의 변화**: README quick start, Teams docs, CLI PyPI package, GitHub Release가 동시에 움직인다. 재현 가능한 환경을 원하면 install script만 믿기보다 release tag, CLI package version, server config, Docker/conda/python/node 요구사항을 같이 pin하는 편이 좋다.
- **Windows 지원 경계**: README의 Windows 경로는 native Windows app이라기보다 NVIDIA GPU via WSL2/CUDA setup이다. Windows 팀원이 있다면 WSL2와 CUDA driver 준비를 별도 작업으로 봐야 한다.

## 이런 경우에 잘 맞는다

Transformer Lab은 다음 상황에서 특히 설득력이 있다.

- 개인 연구자가 Mac/Linux GPU machine에서 모델 실험, fine-tuning, eval을 한 UI에서 관리하고 싶다.
- 연구실이나 스타트업이 Slurm/SkyPilot/cloud GPU를 쓰지만, 연구자별 job 제출·artifact 추적 경험이 제각각이다.
- 모델 registry, dataset, task gallery, evaluation, notes를 “실험 단위”로 묶고 싶다.
- 기존 Python training script를 완전히 갈아엎기보다 SDK/CLI로 platform integration을 붙이고 싶다.
- Kubeflow류의 무거운 platform보다 연구자-facing UI와 GPU orchestration bridge가 먼저 필요하다.

반대로 단순히 “로컬 LLM을 OpenAI API로 serve”하는 것이 목표라면 Ollama, vLLM, llama.cpp, MLX server류가 더 직접적일 수 있다. Transformer Lab은 inference backend 하나가 아니라 연구 lifecycle 전체를 관리하려는 쪽이라, 설치와 권한 설계가 더 무겁다.

## 내 판단

Transformer Lab은 “모델 실행 도구”라기보다 **AI 연구실의 운영 표면을 제품화하려는 프로젝트**다. README의 개인용 기능만 보면 로컬 AI 앱처럼 보이지만, for Teams 문서와 CLI, compute provider, shared storage, task/job 흐름을 같이 보면 방향은 더 분명하다. 연구자가 직접 쓰는 web UI를 앞에 두고, 뒤에서는 Slurm/SkyPilot/cloud/local GPU를 연결하는 control plane이다.

내 기준으로는 개인 hobbyist가 간단히 LLM을 돌리기 위해 바로 선택할 도구라기보다, 여러 모델·데이터·eval·fine-tuning 실험을 반복하거나 팀 GPU 자원을 관리해야 하는 사람에게 더 흥미롭다. 특히 Slurm이나 cloud GPU queue는 이미 있는데, 실험 제출과 결과 확인 경험을 연구자 친화적으로 만들고 싶은 팀이라면 한 번 설치해서 task/job 흐름을 검증해볼 가치가 있다.

다만 운영 전에 보안과 라이선스는 가볍게 넘기면 안 된다. 기본 admin 계정, 원격 credential, SSH key, shared storage, telemetry opt-out, AGPL-3.0 의무를 체크리스트로 두고 접근해야 한다. “AI 연구실 OS”라는 표현이 과장이 되지 않으려면, 모델 기능보다 이 운영 경계를 제대로 다루는지가 실제 도입의 관건이다.

## 참고한 공개 자료

- [transformerlab/transformerlab-app GitHub repository](https://github.com/transformerlab/transformerlab-app)
- [Transformer Lab README](https://github.com/transformerlab/transformerlab-app/blob/main/README.md)
- [Transformer Lab latest GitHub release](https://github.com/transformerlab/transformerlab-app/releases/tag/v0.38.0)
- [Install Transformer Lab for Individuals](https://lab.cloud/docs/install/)
- [Transformer Lab for Teams install guide](https://lab.cloud/for-teams/install)
- [Transformer Lab CLI docs](https://lab.cloud/for-teams/cli)
- [Running tasks with the CLI](https://lab.cloud/for-teams/running-a-task/task-submission-cli)
- [Transformer Lab for Teams overview](https://lab.cloud/for-teams/)
- [Cloud storage setup](https://lab.cloud/for-teams/advanced-install/cloud-storage)
- [Authentication setup](https://lab.cloud/for-teams/advanced-install/authentication)
- [Analytics and Telemetry docs](https://lab.cloud/docs/analytics)
- [transformerlab-cli PyPI package](https://pypi.org/project/transformerlab-cli/)
- [transformerlab PyPI package](https://pypi.org/project/transformerlab/)
- [Transformer Lab LICENSE](https://github.com/transformerlab/transformerlab-app/blob/main/LICENSE)
