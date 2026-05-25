---
title: "Unsloth Ministral 3 VL Colab은 3B급 VLM fine-tuning을 T4에서 빠르게 검증하게 해준다"
date: "2026-05-25T16:55:34"
description: "Unsloth의 Ministral 3 VL 3B Vision Colab은 Google Colab T4 환경에서 Ministral 3 3B Instruct VLM을 LaTeX OCR 데이터로 SFT/LoRA fine-tuning하고 LoRA, 16bit, GGUF export까지 이어보는 실습 노트북이다."
author: "Sangmin Lee"
repository: "unslothai/notebooks"
sourceUrl: "https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Ministral_3_VL_(3B)_Vision.ipynb"
status: "Open source notebook"
license: "LGPL-3.0"
platforms:
  - "macos-linux"
tags:
  - "Unsloth"
  - "Vision Language Model"
  - "Fine-tuning"
  - "LoRA"
  - "Colab"
  - "Hugging Face"
highlights:
  - "`unslothai/notebooks`의 `Ministral_3_VL_(3B)_Vision.ipynb`는 README의 Main Notebooks 표에서 Mistral Ministral 3 (3B) Vision 항목으로 노출되는 Colab 실습이다."
  - "노트북 metadata와 안내문은 Google Colab GPU, 특히 무료 Tesla T4 런타임을 기준으로 하며, repo 자체는 Jupyter Notebook 중심의 LGPL-3.0 오픈소스다."
  - '`FastVisionModel.from_pretrained("unsloth/Ministral-3-3B-Instruct-2512")`로 3B Instruct VLM을 불러오고 vision/language/attention/MLP layer에 LoRA를 걸어본다.'
  - "예제 데이터는 `unsloth/LaTeX_OCR` train split이며, 이미지와 지시문을 multimodal chat message 형식으로 바꿔 `SFTTrainer`와 `UnslothVisionDataCollator`에 넣는다."
  - "학습 뒤에는 LoRA adapter 저장, merged 16bit export, GGUF q8_0/f16/q4_k_m 변환, Hugging Face Hub 업로드 경로까지 이어진다."
  - "Colab/package/model version이 빠르게 바뀌는 실습 노트북이므로 재현 목적이면 notebook raw 파일과 모델/dataset revision을 함께 pin하는 편이 안전하다."
draft: false
---

VLM을 fine-tuning해보고 싶을 때 가장 큰 장벽은 “모델을 어떻게 불러오지?”보다 **이미지 입력 데이터셋을 어떤 message 형식으로 만들고, 학습 뒤 어떤 형태로 저장할지**를 한 번에 확인하는 것이다. Unsloth의 Ministral 3 VL Colab은 이 과정을 짧은 실습 흐름으로 묶어둔 노트북이다.

입력 URL은 Google Colab이지만, 실제 원본은 `unslothai/notebooks` 저장소의 `nb/Ministral_3_VL_(3B)_Vision.ipynb`다. 조사 시점 기준 이 저장소는 README에서 “250+ Fine-tuning & RL Notebooks for text, vision, audio, embedding, TTS models”라고 설명되며, 기본 브랜치는 `main`, 주 언어는 Jupyter Notebook, 라이선스는 LGPL-3.0이다. GitHub Release와 tag는 비어 있고, 노트북 컬렉션 자체가 빠르게 업데이트되는 배포면에 가깝다.

![Unsloth notebooks repository](https://opengraph.githubassets.com/d9249-ministral-3-vl-colab/unslothai/notebooks)

## 무엇을 해보는 노트북인가

이 Colab은 `unsloth/Ministral-3-3B-Instruct-2512`를 기반으로 vision-language fine-tuning을 실습한다. 노트북 안에는 같은 Ministral 3 계열의 3B/8B/14B Instruct, Reasoning, Base 모델 후보도 리스트로 들어 있지만, 실제 예제 호출은 3B Instruct 모델을 사용한다.

핵심 흐름은 다음과 같다.

1. Colab 또는 로컬/클라우드 Python 환경에 Unsloth와 관련 패키지를 설치한다.
2. `FastVisionModel.from_pretrained`로 Ministral 3 3B Instruct VLM을 불러온다.
3. `FastVisionModel.get_peft_model`로 vision layer, language layer, attention module, MLP module에 LoRA를 붙인다.
4. `unsloth/LaTeX_OCR` 데이터셋을 이미지+정답 LaTeX text 쌍으로 읽는다.
5. 이미지를 포함한 chat message format으로 변환한다.
6. `SFTTrainer`와 `UnslothVisionDataCollator`로 짧은 SFT run을 돌린다.
7. 학습 전후 inference를 비교하고, LoRA adapter 또는 merged/GGUF 형태로 저장한다.

즉 모델 발표 분석 글이 아니라, **VLM fine-tuning recipe를 실행 가능한 Colab으로 압축한 도구**라고 보는 편이 맞다.

## 설치와 첫 실행

노트북의 첫 markdown cell은 “Runtime → Run all”을 눌러 무료 Tesla T4 Google Colab 인스턴스에서 실행할 수 있다고 안내한다. 실제 metadata도 Colab accelerator를 `GPU`, `gpuType`을 `T4`로 지정한다.

설치 cell은 Colab 여부에 따라 경로가 갈린다. 로컬/일반 클라우드 환경에서는 단순히 Unsloth를 설치하고, Colab에서는 PyTorch version에 맞춰 xFormers wheel을 고른 뒤 필요한 패키지를 나눠 설치한다.

```python
if "COLAB_" not in "".join(os.environ.keys()):
    !pip install unsloth  # Do this in local & cloud setups
else:
    import torch
    xformers = 'xformers==' + {'2.10':'0.0.34','2.9':'0.0.33.post1','2.8':'0.0.32.post2'}.get(v, "0.0.34")
    !pip install sentencepiece protobuf "datasets==4.3.0" "huggingface_hub>=0.34.0" hf_transfer
    !pip install --no-deps unsloth_zoo bitsandbytes accelerate {xformers} peft trl triton unsloth
    !pip install --no-deps --upgrade "torchao>=0.16.0"
!pip install transformers==5.3.0
!pip install --no-deps trl==0.22.2
```

이 부분은 그대로 복사하기보다 Colab 런타임의 PyTorch/CUDA 상태와 Unsloth 문서의 최신 설치 가이드를 같이 보는 편이 좋다. 노트북은 “지금 실행되는 Colab”에 맞춘 recipe이고, 장기 재현용 lockfile은 아니다.

## 모델과 LoRA 설정

모델 로딩은 Unsloth의 vision model wrapper를 쓴다.

```python
from unsloth import FastVisionModel

model, tokenizer = FastVisionModel.from_pretrained(
    "unsloth/Ministral-3-3B-Instruct-2512",
    load_in_4bit = False,
    use_gradient_checkpointing = "unsloth",
)
```

Hugging Face API 기준 `unsloth/Ministral-3-3B-Instruct-2512`는 `mistralai/Ministral-3-3B-Instruct-2512`를 base model로 하는 공개 모델이며, model card metadata에는 Apache-2.0 license가 잡혀 있다. `load_in_4bit = False`로 되어 있어 예제 기본값은 16bit LoRA 쪽에 가깝지만, 주석은 4bit를 켜면 memory usage를 줄일 수 있다고 설명한다.

LoRA는 꽤 넓게 건다.

```python
model = FastVisionModel.get_peft_model(
    model,
    finetune_vision_layers     = True,
    finetune_language_layers   = True,
    finetune_attention_modules = True,
    finetune_mlp_modules       = True,
    r = 32,
    lora_alpha = 32,
    lora_dropout = 0,
    bias = "none",
    random_state = 3407,
)
```

여기서 실무적으로 중요한 포인트는 “vision only”, “language only”, attention/MLP 선택을 따로 끌 수 있다는 점이다. 단순 demo라면 전체를 켜도 되지만, 실제 데이터가 작거나 domain adaptation이 좁다면 어느 부분을 train할지 줄이는 실험이 필요하다.

## 데이터셋 형식: 이미지 OCR을 chat message로 바꾸기

예제 데이터는 Hugging Face의 `unsloth/LaTeX_OCR` train split이다.

```python
from datasets import load_dataset

dataset = load_dataset("unsloth/LaTeX_OCR", split = "train")
```

노트북 설명에 따르면 목표는 손글씨 수식 이미지를 컴퓨터가 읽을 수 있는 LaTeX 표현으로 바꾸는 것이다. `unsloth/LaTeX_OCR` dataset card metadata 기준 feature는 `image`와 `text`이고, train 68,686개, test 7,632개 split이 공개되어 있으며 license는 Apache-2.0으로 잡혀 있다. 노트북은 원본 전체 데이터셋으로 `linxy/LaTeX_OCR`도 함께 링크한다.

VLM fine-tuning에서 가장 실수하기 쉬운 부분은 dataset row를 trainer가 기대하는 multimodal conversation shape로 바꾸는 일이다. 이 노트북은 다음처럼 user message 안에 text instruction과 image를 같이 넣고, assistant message에 정답 text를 넣는다.

```python
instruction = "Write the LaTeX representation for this image."

def convert_to_conversation(sample):
    conversation = [
        {"role": "user", "content": [
            {"type": "text",  "text": instruction},
            {"type": "image", "image": sample["image"]},
        ]},
        {"role": "assistant", "content": [
            {"type": "text", "text": sample["text"]},
        ]},
    ]
    return {"messages": conversation}
```

이 형식만 제대로 잡아도 다른 image-to-text, UI screenshot QA, document OCR, chart captioning 데이터로 바꿔 끼우기가 쉬워진다.

## 학습 설정과 출력

학습은 TRL의 `SFTTrainer`를 쓰되, vision fine-tuning에 필요한 `UnslothVisionDataCollator`를 반드시 넣는다.

```python
from unsloth.trainer import UnslothVisionDataCollator
from trl import SFTTrainer, SFTConfig

trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    data_collator = UnslothVisionDataCollator(model, tokenizer),
    train_dataset = converted_dataset,
    args = SFTConfig(
        per_device_train_batch_size = 4,
        gradient_accumulation_steps = 2,
        warmup_steps = 5,
        max_steps = 30,
        learning_rate = 2e-4,
        optim = "adamw_8bit",
        max_length = 2048,
        remove_unused_columns = False,
        dataset_text_field = "",
        dataset_kwargs = {"skip_prepare_dataset": True},
    ),
)
```

노트북의 설명문에는 빠른 실습을 위해 60 step이라고 쓰인 부분이 있지만, 조사한 raw notebook code의 실제 `SFTConfig`는 `max_steps = 30`이다. 이런 작은 drift가 생길 수 있으므로, 글이나 README 문장보다 실행 cell의 값을 기준으로 확인하는 편이 안전하다.

학습 전후 inference는 같은 이미지와 instruction을 넣고 `TextStreamer`로 생성 결과를 확인하는 방식이다. 학습이 끝나면 GPU memory와 train runtime을 출력하는 cell도 있어, Colab T4에서 어느 정도 memory headroom이 남는지 감을 잡기 좋다.

## 저장, vLLM, GGUF로 이어지는 경로

이 노트북이 단순 training demo보다 유용한 이유는 저장 경로까지 보여준다는 점이다.

먼저 LoRA adapter만 저장한다.

```python
model.save_pretrained("ministral_lora")
tokenizer.save_pretrained("ministral_lora")
```

그다음 필요한 경우 merged 16bit model을 만들거나 Hugging Face Hub에 올릴 수 있다.

```python
model.save_pretrained_merged("unsloth_finetune", tokenizer)
# model.push_to_hub_merged("YOUR_USERNAME/unsloth_finetune", tokenizer, token="YOUR_HF_TOKEN")
```

마지막으로 llama.cpp 쪽에서 쓰기 위한 GGUF export도 들어 있다.

```python
model.save_pretrained_gguf("ministral_finetune", tokenizer)
model.save_pretrained_gguf("ministral_finetune", tokenizer, quantization_method = "q4_k_m")
```

Q8_0, f16, q4_k_m, q5_k_m 같은 선택지가 예제로 들어 있고, Hub push를 하려면 Hugging Face token이 필요하다고 안내한다. 개인 실험을 넘어 공유하거나 배포하려면 모델 license, dataset license, fine-tuned adapter의 공개 범위를 별도로 확인해야 한다.

## 주의할 점

첫째, 이것은 안정 배포 패키지가 아니라 빠르게 바뀌는 Colab notebook이다. `unslothai/notebooks` 저장소는 GitHub Release/tag 없이 `main`의 노트북들이 계속 갱신되는 구조다. 재현 가능한 실험 기록이 필요하면 raw notebook URL, Git commit SHA, 모델 revision, dataset revision, pip package version을 함께 남겨야 한다.

둘째, Colab T4 기준이라는 점을 잊으면 안 된다. notebook metadata와 안내문은 T4 GPU를 가정하지만, 런타임에 실제로 어떤 GPU가 배정되는지, Colab이 어떤 PyTorch/CUDA stack을 제공하는지는 시점에 따라 달라질 수 있다. 로컬 GPU에서 돌릴 때는 Unsloth install page와 자신의 CUDA/PyTorch 조합을 우선 확인해야 한다.

셋째, notebook source license와 model/dataset license는 다르다. `unslothai/notebooks`는 LGPL-3.0이고, 조사 시점 기준 Hugging Face의 `unsloth/Ministral-3-3B-Instruct-2512`, `mistralai/Ministral-3-3B-Instruct-2512`, `unsloth/LaTeX_OCR`, `linxy/LaTeX_OCR` metadata는 Apache-2.0 license를 표시한다. fine-tuned 결과물을 제품이나 공개 모델로 배포할 때는 이 경계를 따로 검토해야 한다.

넷째, 예제는 OCR 성격의 LaTeX 변환 task다. 문서 QA, 의료 이미지, UI 자동화, 차트 해석처럼 domain과 실패 비용이 다른 vision task에 그대로 성능을 기대하면 안 된다. 데이터셋 품질, annotation format, image resolution, evaluation set을 새로 설계해야 한다.

## 내 판단

이 Colab은 “Ministral 3 VL을 써야 한다”는 추천서라기보다, **작은 VLM을 Unsloth 방식으로 fine-tuning하는 전체 손동작을 한 번에 익히기 좋은 recipe**다. 특히 이미지+텍스트 pair를 chat message로 바꾸는 부분, `UnslothVisionDataCollator`를 넣는 부분, LoRA adapter에서 GGUF까지 이어지는 저장 경로가 실전적으로 유용하다.

추천 대상은 다음에 가깝다.

- Colab에서 VLM SFT/LoRA를 처음 돌려보려는 사람
- image-to-text 또는 OCR류 데이터셋을 VLM fine-tuning format으로 바꾸고 싶은 사람
- 학습 후 Hugging Face Hub, vLLM, llama.cpp/GGUF 경로까지 한 번에 확인하고 싶은 사람
- 큰 VLM보다 3B급 모델로 빠른 domain adaptation 실험을 하고 싶은 사람

반대로 독립 benchmark, production serving template, long-running training recipe, Windows/macOS desktop app 같은 것을 기대한다면 범위가 다르다. 이 항목은 catalog 관점에서 **“VLM fine-tuning의 최소 실행 경로를 보여주는 Unsloth Colab 노트북”**으로 저장해둘 만하다.

## 참고한 공개 자료

- [Ministral 3 VL (3B) Vision Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Ministral_3_VL_(3B)_Vision.ipynb)
- [unslothai/notebooks GitHub repository](https://github.com/unslothai/notebooks)
- [Ministral_3_VL_(3B)_Vision.ipynb raw notebook](https://raw.githubusercontent.com/unslothai/notebooks/main/nb/Ministral_3_VL_(3B)_Vision.ipynb)
- [Unsloth notebooks documentation](https://unsloth.ai/docs/get-started/unsloth-notebooks)
- [Unsloth installation documentation](https://unsloth.ai/docs/get-started/install)
- [Unsloth saving to GGUF documentation](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf)
- [unsloth/Ministral-3-3B-Instruct-2512 Hugging Face model](https://huggingface.co/unsloth/Ministral-3-3B-Instruct-2512)
- [mistralai/Ministral-3-3B-Instruct-2512 Hugging Face model](https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512)
- [unsloth/LaTeX_OCR Hugging Face dataset](https://huggingface.co/datasets/unsloth/LaTeX_OCR)
- [linxy/LaTeX_OCR Hugging Face dataset](https://huggingface.co/datasets/linxy/LaTeX_OCR)
