---
title: "Awesome Open Source AI는 AI 개발 스택을 14개 영역으로 훑는 오픈소스 큐레이션 지도다"
date: "2026-05-27T19:59:33"
description: "Awesome Open Source AI는 모델, 추론 서버, 에이전트, RAG, MLOps, 평가, 안전성, 개발 도구까지 오픈소스 AI 생태계를 14개 큰 축과 100여 개 세부 분류로 정리한 CC0 큐레이션 저장소다."
author: "Sangmin Lee"
repository: "alvinreal/awesome-opensource-ai"
sourceUrl: "https://github.com/alvinreal/awesome-opensource-ai"
status: "Open source catalog"
license: "CC0-1.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Open Source AI"
  - "Awesome List"
  - "MLOps"
  - "AI Agents"
  - "Developer Tools"
highlights:
  - "README는 Core Frameworks, Foundation Models, Inference, Agents, RAG, MLOps, Evaluation, Safety 등 14개 대분류로 AI 스택을 훑는다."
  - "조사 시점의 README에는 101개 세부 섹션과 800개가 넘는 GitHub 프로젝트 링크가 들어 있어 새 도구 후보를 빠르게 좁히기 좋다."
  - "프로젝트 추가 기준은 단순 스타 수가 아니라 1000+ stars, 6개월 내 활동, 생산 사용 증거, 문서·테스트·릴리스 품질을 함께 본다."
  - "설치형 앱이 아니라 Markdown 카탈로그이므로, 팀 도입 전에는 개별 프로젝트의 라이선스·보안·운영 성숙도를 다시 확인해야 한다."
draft: false
---

`Awesome Open Source AI`는 “요즘 오픈소스 AI 스택에서 무엇을 먼저 봐야 하나”를 빠르게 좁혀주는 **AI 생태계 지도**다. 하나의 라이브러리나 앱이 아니라, 모델·프레임워크·인프라·에이전트·RAG·평가·안전성·학습 자료를 한 저장소의 Markdown 목록으로 정리한 큐레이션 프로젝트다.

PyTorchKR 소개 글은 이 저장소를 한국어로 길게 풀어, 14개 대분류와 각 영역의 대표 프로젝트를 한 번에 훑을 수 있게 정리했다. 원본 저장소 기준으로도 README는 14개 대분류, 101개 세부 섹션, 800개가 넘는 GitHub 프로젝트 링크를 담고 있어, 특정 영역의 후보군을 뽑는 출발점으로 쓰기 좋다.

![Awesome Open Source AI 소개 이미지](/images/tips/awesome-opensource-ai-hero.png)

## 무엇을 담고 있나

핵심은 “AI 개발자가 실제로 만지는 스택”을 기준으로 정리했다는 점이다. 일반적인 awesome list처럼 유명 프로젝트를 평면적으로 모으기보다, 프런티어 AI 개발·운영 흐름을 따라 영역을 나눈다.

![Awesome Open Source AI 14개 카테고리](/images/tips/awesome-opensource-ai-categories.png)

저장소의 큰 축은 다음 14개다.

1. **Core Frameworks & Libraries** — PyTorch, TensorFlow, JAX, Triton, MLX, Polars, DuckDB 같은 기반 도구
2. **Open Foundation Models** — Qwen, GLM, Llama, OLMo, Whisper, Stable Diffusion 계열 등 공개 모델
3. **Inference Engines & Serving** — vLLM, SGLang, llama.cpp, Ollama, TensorRT-LLM, Triton Inference Server 등
4. **Agentic AI & Multi-Agent Systems** — LangGraph, CrewAI, AutoGen, OpenHands, Aider, Hermes Agent 등
5. **RAG & Knowledge** — LlamaIndex, Haystack, Chroma, Qdrant, Milvus, GraphRAG, Docling 등
6. **Generative Media Tools** — ComfyUI, Diffusers, HunyuanVideo, Wan, AudioCraft, 3D/비디오 생성 도구
7. **Training & Fine-tuning Ecosystem** — Axolotl, Unsloth, TRL, DeepSpeed, Megatron-LM, torchtune 등
8. **MLOps / LLMOps & Production** — MLflow, Langfuse, BentoML, ZenML, Kubeflow, KServe, LiteLLM 등
9. **Evaluation, Benchmarks & Datasets** — lm-evaluation-harness, HELM, SWE-bench, GAIA, DeepEval, RAGAs 등
10. **AI Safety, Alignment & Interpretability** — TransformerLens, Captum, NeMo Guardrails, PyRIT, Garak 등
11. **Specialized Domains** — 의료, 생명과학, 비전, 로보틱스, 금융, 과학계산 등 도메인별 AI 도구
12. **User Interfaces & Self-hosted Platforms** — Open WebUI, LobeChat, LibreChat, AnythingLLM, Jan 등
13. **Developer Tools & Integrations** — Continue, Tabby, Cline, Codex CLI, Repomix, Vercel AI SDK 등
14. **Resources & Learning** — Papers with Code, Hugging Face Course, Karpathy 자료, ML 강의 자료 등

각 항목은 대체로 GitHub 링크, 한 줄 설명, Star 배지를 함께 둔다. 그래서 “이 영역에 어떤 이름들이 있는가”뿐 아니라, 프로젝트의 대략적인 생태계 위치와 활성도를 빠르게 훑을 수 있다.

## 왜 유용한가

이 저장소의 쓸모는 **검색어를 만들기 전 단계**에 있다. 예를 들어 “로컬 추론을 해보고 싶다” 정도의 막연한 니즈가 있을 때 바로 특정 도구를 고르기는 어렵다. 하지만 이 목록에서 `Inference Engines & Serving`과 `User Interfaces & Self-hosted Platforms`를 펼쳐 보면 llama.cpp, Ollama, vLLM, SGLang, Open WebUI, Jan 같은 후보군이 한 화면에 잡힌다.

또 다른 장점은 AI 스택을 부분 최적화가 아니라 전체 흐름으로 보게 만든다는 점이다. 모델만 고르면 끝나는 것이 아니라, 학습·파인튜닝, 서빙, RAG, 평가, 관측, 안전성, 개발자 도구까지 이어진다. 팀에서 “우리 LLM 앱 스택에 빠진 축이 무엇인가”를 점검할 때 체크리스트처럼 쓰기 좋다.

특히 PyTorchKR 게시글은 원본 README의 분류와 대표 프로젝트를 한국어로 풀어 놓았기 때문에, 팀 내부 공유나 입문자 온보딩 자료로도 더 읽기 쉽다.

## 설치와 첫 사용 흐름

설치해서 실행하는 도구는 아니다. 가장 자연스러운 사용법은 GitHub에서 README를 열어 관심 영역을 펼쳐 보거나, 저장소를 고정해 두고 Markdown 안에서 검색하는 것이다.

```bash
git clone https://github.com/alvinreal/awesome-opensource-ai.git
cd awesome-opensource-ai
```

재현성 있게 특정 시점의 목록을 공유하려면 `main` 브랜치만 링크하기보다 조사 시점의 커밋을 함께 남기는 편이 좋다.

```bash
git checkout 8df7636852256651a0f9a51db0eaadc90e5a08e8
```

새 프로젝트를 제안하려면 `CONTRIBUTING.md`를 먼저 읽어야 한다. 메인 README의 기본 기준은 대략 다음과 같다.

- GitHub Star 1000개 이상
- 최근 6개월 안의 의미 있는 개발 활동
- 실제 배포나 운영 사용 증거
- 문서, 테스트, 릴리스 등 프로젝트 품질 신호

이 기준을 아직 만족하지 못하는 새 프로젝트는 `EMERGING.md` 쪽에 들어갈 수 있다. Emerging 목록은 1000 stars 미만이지만 활성 개발, 명확한 문제 정의, 기본 문서, OSI 승인 라이선스, 성장 가능성이 있는 프로젝트를 위한 별도 공간이다.

## 활용 포인트

실무적으로는 다음 상황에서 좋다.

- 새 AI 프로젝트를 시작하기 전, **후보 도구 longlist**를 빠르게 만들 때
- 특정 영역, 예를 들어 RAG·평가·서빙·에이전트 프레임워크의 주요 이름을 한 번에 훑을 때
- 팀 온보딩 문서에 “이 분야를 이해하려면 먼저 볼 프로젝트” 링크 묶음을 붙일 때
- 오픈소스 AI 스택을 모델, 앱, 서버, 관측, 안전성까지 빠짐없이 점검하는 체크리스트로 쓸 때
- 새 프로젝트를 홍보하기 전에 어떤 수준의 문서·활동·생산 사용 증거가 필요한지 확인할 때

나는 특히 `MLOps / LLMOps & Production`, `Evaluation, Benchmarks & Datasets`, `AI Safety, Alignment & Interpretability` 축이 같이 들어 있는 점이 좋다. 많은 AI 목록은 모델과 앱에 쏠리지만, 실제 운영에서는 평가·관측·안전성·데이터 품질이 빠지면 금방 병목이 생긴다.

## 주의할 점

첫째, 이 목록 자체가 어떤 프로젝트의 품질을 보증하는 것은 아니다. 큐레이션 기준은 꽤 명확하지만, 개별 프로젝트의 라이선스, 보안 모델, 유지보수 속도, 클라우드 비용, 모델 가중치 사용 조건은 각 저장소에서 다시 확인해야 한다.

둘째, README는 빠르게 움직이는 `main` 브랜치 문서다. 조사 시점에는 GitHub Releases와 태그가 없었고, 원본 저장소의 HEAD는 `8df7636852256651a0f9a51db0eaadc90e5a08e8`이었다. 팀 문서나 교육 자료에 그대로 가져간다면 특정 커밋을 기준으로 링크하거나 내부 문서에 스냅샷을 남겨 두는 편이 안전하다.

셋째, 이름이 “open source AI”라고 해서 여기에 링크된 모든 모델 가중치와 데이터셋이 같은 의미의 오픈소스라는 뜻은 아니다. 코드 라이선스, 모델 라이선스, 데이터 라이선스, 상업적 사용 가능 여부는 프로젝트마다 다르다. 특히 foundation model과 생성 미디어 모델은 사용 조건을 따로 봐야 한다.

넷째, 현재 이 tips 사이트의 플랫폼 분류는 `macOS / Linux`와 `WinOS` 두 축만 있다. 이 항목은 OS별 앱이 아니라 브라우저와 Markdown으로 읽는 카탈로그라 양쪽에 넣었지만, 실제로는 플랫폼 독립적인 참고 자료에 가깝다.

## 내 판단

`Awesome Open Source AI`는 매일 실행할 도구라기보다, AI 스택을 설계하거나 새 분야를 파고들 때 열어 두는 **지도 겸 후보군 생성기**다. 이미 각 분야를 깊게 아는 사람에게도 “요즘 이 영역에서 뭐가 같이 언급되는지”를 빠르게 확인하는 데 쓸모가 있다.

다만 목록을 그대로 권위로 받아들이기보다는, 관심 있는 프로젝트를 5~10개로 좁힌 뒤 각 저장소의 README, 라이선스, 릴리스, 이슈, 보안 경계, 벤치마크 재현성을 다시 보는 흐름이 좋다. 개인적으로는 AI 개발 스택을 처음 정리하는 팀, LLMOps 도구를 비교하는 팀, 오픈소스 후보군을 넓게 스캔해야 하는 리서처에게 추천한다.

## 참고한 공개 자료

- [Awesome Open Source AI GitHub repository](https://github.com/alvinreal/awesome-opensource-ai)
- [Awesome Open Source AI README](https://github.com/alvinreal/awesome-opensource-ai/blob/main/README.md)
- [CONTRIBUTING.md](https://github.com/alvinreal/awesome-opensource-ai/blob/main/CONTRIBUTING.md)
- [EMERGING.md](https://github.com/alvinreal/awesome-opensource-ai/blob/main/EMERGING.md)
- [LICENSE — CC0 1.0 Universal](https://github.com/alvinreal/awesome-opensource-ai/blob/main/LICENSE)
- [PyTorchKR 소개 글](https://discuss.pytorch.kr/t/awesome-open-source-ai-ai-14/10375)
