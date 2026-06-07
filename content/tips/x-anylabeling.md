---
title: "X-AnyLabeling은 YOLO·SAM·OCR까지 한곳에서 다루는 AI 데이터 라벨링 도구다"
date: "2026-06-08T03:34:41"
description: "CVHub520/X-AnyLabeling은 이미지·비디오·문서 데이터를 PyQt 기반 GUI에서 라벨링하고, YOLO·SAM·PaddleOCR·VLM 계열 모델로 자동 라벨링을 붙일 수 있는 오픈소스 annotation 도구입니다."
author: "Sangmin Lee"
repository: "CVHub520/X-AnyLabeling"
sourceUrl: "https://github.com/CVHub520/X-AnyLabeling"
status: "Open source beta"
license: "GPL-3.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Data Labeling"
  - "Computer Vision"
  - "Annotation"
  - "AI Tools"
  - "Python"
highlights:
  - "PyQt6 데스크톱 앱에서 이미지·비디오·OCR·VQA·문서 파싱 라벨링을 한 프로젝트 흐름으로 다룹니다."
  - "YOLO, SAM 1/2/3, Grounding DINO, PaddleOCR, VLM 계열 등 다양한 모델을 ONNX Runtime·TensorRT·OpenCV DNN 백엔드로 붙일 수 있습니다."
  - "COCO, VOC, YOLO, DOTA, MOT, MASK, PPOCR, ShareGPT 등 여러 라벨 포맷의 import/export와 CLI 변환 명령을 제공합니다."
  - "GitHub Release 바이너리, PyPI 패키지, source install이 공존하지만 최신 기능은 4.0.0 beta와 git clone 경로에 더 가깝습니다."
  - "모델 자동 다운로드, 외부 LLM/API 키, PaddleOCR API, GPL-3.0 copyleft, unsigned macOS 빌드 같은 도입 전 확인 지점이 있습니다."
draft: false
---

데이터 라벨링 도구는 크게 두 부류로 갈린다. 하나는 팀 협업과 운영을 전제로 한 웹 플랫폼이고, 다른 하나는 연구자나 엔지니어가 로컬에서 빠르게 데이터셋을 보고 고치는 데 맞춘 데스크톱 도구다. `X-AnyLabeling`은 후자에 가깝지만, 단순 박스 그리기 앱이라고 보기에는 기능 폭이 꽤 넓다.

이미지·비디오 annotation, YOLO/SAM 기반 자동 라벨링, OCR·문서 파싱, VQA/ShareGPT 형식 데이터 생성, CLI 포맷 변환까지 한 저장소에 묶여 있다. “라벨링 UI + 모델 zoo + 데이터셋 변환기 + 작은 멀티모달 데이터 제작 도구”로 보는 편이 더 정확하다.

조사 시점 기준 저장소 기본 브랜치는 `main`, 주 언어는 Python, 앱 버전은 `4.0.0-beta.7`이다. GitHub 최신 릴리스도 `v4.0.0-beta.7`이며 Windows CPU `.exe`, Linux CPU 실행 파일, macOS arm64 unsigned zip 자산을 제공한다. PyPI의 stable latest는 `3.3.10`이고, 4.x 라인은 `4.0.0b7` pre-release로 올라와 있어 설치 표면별 버전 차이를 구분해야 한다.

![X-AnyLabeling Segment Anything workflow](https://github.com/user-attachments/assets/208dc9ed-b8c9-4127-9e5b-e76f53892f03)

## X-AnyLabeling 개요

X-AnyLabeling의 핵심은 PyQt6 기반 데스크톱 annotation GUI다. 파일/폴더를 불러오고, 라벨을 만들고, shape을 편집하고, 결과를 JSON 또는 여러 표준 라벨 포맷으로 내보내는 기본 흐름은 LabelMe류 도구와 비슷하다. 차이는 AI 보조 기능이 훨씬 강하게 붙어 있다는 점이다.

README와 문서 기준으로 지원하는 작업 범위는 꽤 넓다.

- 이미지 분류, 객체 탐지, instance/semantic segmentation, pose, depth, matting
- 비디오 분류, tracking, interactive video object segmentation
- OCR, key information extraction, document parsing
- VQA, captioning, chatbot, ShareGPT 형식 multimodal 데이터 export
- YOLO, SAM 1/2/3, Grounding DINO, YOLO-World/YOLOE, PaddleOCR, Qwen/Gemini/ChatGPT 계열 VLM 연동
- COCO, VOC, YOLO, DOTA, MOT, MASK, PPOCR, MMGD, VLM-R1, ShareGPT 등 포맷 import/export

라벨 파일은 기본적으로 이미지와 같은 디렉터리에 `*.json` 형태로 저장된다. 문서의 user guide는 annotation shape뿐 아니라 `chat_history`, `vqaData`, `checked` 같은 검수/멀티모달 데이터 필드도 설명한다. 즉 일반 object detection 데이터셋뿐 아니라 “이미지 + 질문/답변 + 대화” 형태의 학습 데이터를 정리하는 데도 쓸 수 있다.

## 왜 유용한가

가장 큰 장점은 **모델 기반 자동 라벨링을 GUI 안에 넣어둔 것**이다. 예를 들어 SAM 계열 모델로 polygon을 만들고, YOLO 계열 모델로 bounding box를 먼저 뽑은 뒤, 사람이 GUI에서 검수·수정하는 흐름을 만들 수 있다. 모델이 완벽하지 않아도 “처음부터 손으로 그리기”보다 훨씬 빠른 baseline을 만들 수 있다.

둘째, **포맷 변환 도구로도 쓸 수 있다.** CLI 문서는 `xanylabeling convert` 아래에 YOLO, VOC, COCO, DOTA, MOT, PPOCR, MASK 등 import/export 변환 태스크를 둔다. 이미 라벨링이 끝난 데이터셋을 다른 학습 프레임워크에 맞춰 옮기거나, 기존 라벨을 GUI로 불러와 수정하는 상황에 좋다.

셋째, **모델 커스터마이징 경로가 열려 있다.** 기본 모델 zoo 외에도 custom ONNX 모델과 YAML 설정을 로드할 수 있고, YOLO 계열은 ONNX Runtime 기본 경로 외에 OpenCV DNN, NVIDIA TensorRT 엔진 설정도 문서화되어 있다. 팀 내부 모델을 빠르게 붙여 annotation assist 용도로 써보려는 사람에게는 이 부분이 중요하다.

넷째, **멀티모달 데이터 제작 기능이 별도로 있다.** Chatbot/VQA 패널은 이미지 참조 토큰, 컴포넌트 기반 질문/답변 입력, prompt template, ShareGPT export를 제공한다. LLaMA-Factory 같은 fine-tuning 파이프라인에 넣을 이미지-텍스트 데이터셋을 사람이 보면서 만드는 용도에 맞다.

## 설치와 첫 사용법

문서가 권장하는 빠른 설치는 `uv`를 쓰는 방식이다. CPU 환경에서 GUI와 CLI를 먼저 확인할 때는 다음 흐름이 가장 단순하다.

```bash
pip install -U uv

# CPU [Windows/Linux/macOS]
uv pip install --pre "x-anylabeling-cvhub[cpu]"

# 설치/환경 확인
xanylabeling checks

# GUI 실행
xanylabeling
```

GPU 쪽은 OS와 CUDA 버전에 따라 달라진다. 문서상 CUDA 12.x가 기본 GPU 옵션이고 Windows/Linux를 대상으로 한다.

```bash
# CUDA 12.x [Windows/Linux]
uv pip install --pre "x-anylabeling-cvhub[gpu]"

# CUDA 11.x [Windows/Linux]
uv pip install --pre "x-anylabeling-cvhub[gpu-cu11]"
```

최신 기능을 따라가거나 remote inference, video object tracking, training, custom model 같은 고급 기능을 쓰려면 저장소 clone 설치가 더 현실적이다.

```bash
git clone https://github.com/CVHub520/X-AnyLabeling.git
cd X-AnyLabeling

# CPU [Windows/Linux/macOS]
uv pip install -e ".[cpu]"

# 개발/패키징 도구까지 포함
uv pip install -e ".[cpu,dev]"

xanylabeling
```

릴리스 페이지에는 GUI 실행 패키지도 있다. 다만 최신 릴리스 기준 macOS 자산 이름은 `macOS-arm64-unsigned.zip`이라서 Gatekeeper/서명 이슈를 직접 감수해야 할 수 있고, GUI 패키지는 source install보다 기능 반영이 늦거나 문제 원인 추적이 어려울 수 있다고 공식 문서도 설명한다.

| 표면 | 조사 시점 상태 | 메모 |
| --- | --- | --- |
| GitHub Release | `v4.0.0-beta.7` | Windows CPU, Linux CPU, macOS arm64 unsigned zip 자산 제공 |
| PyPI stable | `3.3.10` | stable latest는 3.x 라인 |
| PyPI pre-release | `4.0.0b7` | 문서의 `--pre` 설치 명령과 맞는 4.x beta 라인 |
| Source install | `main` / `4.0.0-beta.7` | 고급 기능과 최신 모델 연동을 따라가기 좋음 |

## 활용 포인트

개인적으로는 세 가지 상황에서 특히 쓸 만하다고 본다.

첫째, **작은 팀이나 개인 연구자가 로컬에서 빠르게 데이터셋을 정리할 때**다. CVAT 같은 웹 플랫폼을 띄우기에는 무겁고, LabelImg/LabelMe만으로는 AI 보조가 부족할 때 X-AnyLabeling의 위치가 선명해진다. 이미지 폴더를 열고, 모델로 초안을 만들고, 사람이 수정하고, YOLO/COCO/VOC 등으로 export하는 흐름이 한 앱 안에 있다.

둘째, **foundation model을 annotation assistant로 실험할 때**다. SAM, Grounding, OCR, VLM 기능이 모두 production-ready로 끝난 솔루션이라기보다는 “이 모델을 라벨링 작업에 붙이면 얼마나 시간이 줄어드는지” 테스트하기 좋다. 특히 custom model YAML과 ONNX Runtime/TensorRT 경로가 열려 있어 내부 모델을 붙이는 실험에도 맞다.

셋째, **멀티모달 instruction 데이터셋을 사람이 검수하면서 만들 때**다. Chatbot과 VQA 패널은 이미지, 기존 label shape, 텍스트 입력 컴포넌트를 prompt에 참조할 수 있고, 결과를 JSONL/ShareGPT 쪽으로 내보낼 수 있다. 단순 object detection 라벨이 아니라 “이미지에 대한 질문·답변·설명” 데이터가 필요할 때 유용하다.

## 주의할 점

첫째, 최신 라인은 beta 성격이 강하다. `pyproject.toml` classifier도 Development Status를 Beta로 둔다. 실험/내부 라벨링에는 충분히 매력적이지만, 대규모 production annotation workflow의 표준 도구로 바로 고정하기 전에는 사용하려는 기능, OS, 모델, export 포맷을 작은 데이터셋으로 먼저 검증해야 한다.

둘째, dependency와 GPU 조합이 가볍지 않다. CPU 모드는 Windows/Linux/macOS 모두 가능하지만, GPU 옵션은 Windows/Linux 중심이고 ONNX Runtime GPU, CUDA 11/12, TensorRT 버전 호환성을 맞춰야 한다. 문서도 CUDA 11.x에서 `onnx`와 `onnxruntime-gpu` 버전 범위를 따로 제한한다.

셋째, 모델 다운로드와 외부 API 경계가 있다. Built-in model은 기본적으로 GitHub Releases에서 `~/xanylabeling_data/models/${model_name}` 경로로 자동 다운로드된다. Chatbot은 Anthropic, DeepSeek, Google AI, OpenAI, OpenRouter, Qwen, Ollama, custom OpenAI-compatible endpoint 설정을 지원하고, API provider 설정은 로컬 설정 디렉터리에 저장된다. PaddleOCR 패널도 공식 API를 쓰면 API key와 문서/이미지 데이터가 외부 서비스 경계를 지난다. 민감한 이미지, 고객 문서, 사내 데이터셋은 local model/remote server 구성을 먼저 정해야 한다.

넷째, 라벨 JSON 자체가 민감할 수 있다. user guide의 예시처럼 label file에는 `imagePath`, shape 좌표, `chat_history`, `vqaData`, optional base64 `imageData`가 들어갈 수 있다. 데이터셋 repo에 결과물을 커밋할 때는 원본 이미지 경로, 대화 기록, API가 생성한 설명, 비공개 클래스명이 함께 들어가지 않는지 확인하는 편이 안전하다.

다섯째, 라이선스는 GPL-3.0로 보는 것이 맞다. README 상단 badge에는 LGPL v3 문구가 남아 있지만, GitHub API, checked-in `LICENSE`, `pyproject.toml`, README의 License 섹션은 GPL-3.0을 가리킨다. 내부 도구로 쓰는 것과 수정본/번들 배포는 의미가 다르므로, 제품에 포함하거나 재배포할 계획이라면 GPL copyleft 영향을 확인해야 한다.

## 내 판단

X-AnyLabeling은 “웹 기반 annotation 운영 플랫폼”을 대체한다기보다, **AI 모델을 곁들인 로컬 데이터셋 제작·검수 워크벤치**로 보는 편이 좋다. 특히 컴퓨터비전 모델을 만들고 있는 연구자, 작은 팀, 데이터 엔지니어가 “수동 라벨링만으로는 느리고, 그렇다고 대형 라벨링 플랫폼을 세팅하기에는 과하다”는 상황에서 꽤 강력한 선택지다.

반대로 팀 권한관리, 브라우저 기반 대규모 작업 배분, 감사 로그, annotator QA queue 같은 운영 기능이 핵심이라면 CVAT/Label Studio류와 비교해야 한다. X-AnyLabeling의 강점은 운영 플랫폼이 아니라, 로컬 GUI 안에서 다양한 AI 모델과 export 포맷을 빨리 묶어보는 데 있다.

내가 쓴다면 먼저 CPU 또는 source install로 작은 이미지 폴더를 열고, SAM/YOLO 기반 자동 라벨링과 `xanylabeling convert`를 검증해볼 것이다. 그 다음에야 GPU/TensorRT, PaddleOCR API, VQA/Chatbot, X-AnyLabeling-Server 같은 고급 경로를 붙이는 순서가 안전하다.

## 참고한 공개 자료

- [CVHub520/X-AnyLabeling GitHub repository](https://github.com/CVHub520/X-AnyLabeling)
- [X-AnyLabeling Releases](https://github.com/CVHub520/X-AnyLabeling/releases)
- [X-AnyLabeling Quick Start Guide](https://github.com/CVHub520/X-AnyLabeling/blob/main/docs/en/get_started.md)
- [X-AnyLabeling User Manual](https://github.com/CVHub520/X-AnyLabeling/blob/main/docs/en/user_guide.md)
- [X-AnyLabeling CLI documentation](https://github.com/CVHub520/X-AnyLabeling/blob/main/docs/en/cli.md)
- [X-AnyLabeling custom model documentation](https://github.com/CVHub520/X-AnyLabeling/blob/main/docs/en/custom_model.md)
- [X-AnyLabeling Chatbot documentation](https://github.com/CVHub520/X-AnyLabeling/blob/main/docs/en/chatbot.md)
- [X-AnyLabeling VQA documentation](https://github.com/CVHub520/X-AnyLabeling/blob/main/docs/en/vqa.md)
- [X-AnyLabeling PaddleOCR documentation](https://github.com/CVHub520/X-AnyLabeling/blob/main/docs/en/paddle_ocr.md)
- [x-anylabeling-cvhub PyPI package](https://pypi.org/project/x-anylabeling-cvhub/)
- [X-AnyLabeling-Server repository](https://github.com/CVHub520/X-AnyLabeling-Server)
