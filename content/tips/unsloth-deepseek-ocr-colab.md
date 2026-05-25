---
title: "Unsloth DeepSeek-OCR Colab은 3B OCR VLM을 내 문서 언어에 맞게 LoRA fine-tuning하는 빠른 실험대다"
date: "2026-05-26T00:13:07"
description: "Unsloth의 DeepSeek-OCR 3B Colab은 Google Colab GPU에서 DeepSeek-OCR을 불러와 Persian OCR 데이터로 baseline inference, LoRA fine-tuning, CER 비교, LoRA/merged 16bit 저장까지 이어보는 실습 노트북이다."
author: "Sangmin Lee"
repository: "unslothai/notebooks"
sourceUrl: "https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Deepseek_OCR_(3B).ipynb"
status: "Open source notebook"
license: "LGPL-3.0"
platforms:
  - "macos-linux"
tags:
  - "Unsloth"
  - "DeepSeek-OCR"
  - "OCR"
  - "Vision Language Model"
  - "Fine-tuning"
  - "LoRA"
  - "Colab"
  - "Hugging Face"
highlights:
  - "`unslothai/notebooks`의 `Deepseek_OCR_(3B).ipynb`는 README의 OCR Notebooks 표에서 Deepseek OCR 3B Fine Tuning 항목으로 노출되는 Google Colab 실습이다."
  - "노트북은 `unsloth/DeepSeek-OCR`을 `snapshot_download`로 내려받고 `FastVisionModel.from_pretrained(..., auto_model=AutoModel, trust_remote_code=True)`로 로드한다."
  - "예제 데이터는 Persian OCR용 `hezarai/parsynth-ocr-200k`이며, notebook code는 baseline에는 `train[:2000]`, fine-tuning에는 `train[:1000]` slice를 사용한다."
  - "sample 하나에서는 baseline CER 23%에서 60-step LoRA 후 6%로 좋아지는 예시를 보여주고, Unsloth 문서는 200-sample Persian eval에서 평균 CER 149.07% → 60.43%/60.81% 개선을 별도로 제시한다."
  - "저장 경로는 LoRA adapter local/Hub 저장과 merged 16bit export 중심이며, DeepSeek-OCR 자체 inference는 Transformers 또는 upstream vLLM 지원 경로를 함께 확인해야 한다."
  - "OCR 문서는 개인정보·계약서·스캔 원본이 섞이기 쉬우므로 Colab/Hugging Face Hub 업로드, `trust_remote_code`, dataset license 경계를 따로 검토해야 한다."
draft: false
---

문서 OCR 모델을 fine-tuning할 때 가장 빨리 막히는 지점은 모델 성능 자체보다 **내 이미지와 정답 텍스트를 어떤 형식으로 넣고, 어느 layer에 LoRA를 걸고, 학습 후 adapter를 어떻게 다시 불러올지**다. Unsloth의 DeepSeek-OCR Colab은 이 손동작을 한 번에 훑는 실습 노트북이다.

입력 URL은 Google Colab이지만, 실제 원본은 `unslothai/notebooks` 저장소의 `nb/Deepseek_OCR_(3B).ipynb`다. 조사 시점 기준 `unslothai/notebooks`는 “250+ Fine-tuning & RL Notebooks for text, vision, audio, embedding, TTS models”를 모아둔 Jupyter Notebook 중심 저장소이고, 기본 브랜치는 `main`, 라이선스는 LGPL-3.0이다. GitHub Release와 tag는 비어 있어, 안정 버전 패키지라기보다 `main`의 실습 recipe 컬렉션으로 보는 편이 맞다.

![Unsloth DeepSeek-OCR Colab source repository](https://opengraph.githubassets.com/d9249-deepseek-ocr-colab/unslothai/notebooks)

## 무엇을 해보는 노트북인가

이 Colab은 DeepSeek의 `deepseek-ai/DeepSeek-OCR`을 Unsloth가 fine-tuning 가능하게 맞춘 `unsloth/DeepSeek-OCR` upload로 불러온다. DeepSeek-OCR 자체는 3B급 BF16 safetensors model이고, Hugging Face metadata와 GitHub repository는 image-text-to-text, vision-language, OCR, custom code, MIT license를 표시한다.

DeepSeek 측 원 저장소의 설명은 “Contexts Optical Compression”이다. 문서 이미지를 단순 문자 인식 대상으로만 보지 않고, 2D layout을 vision token으로 압축해 긴 문맥을 다루려는 OCR/VLM 계열 모델로 포지셔닝한다.

![DeepSeek-OCR overview figure](https://raw.githubusercontent.com/deepseek-ai/DeepSeek-OCR/main/assets/fig1.png)

노트북의 흐름은 다음과 같다.

1. Colab 또는 로컬/클라우드 Python 환경에 Unsloth, Transformers, TRL, jiwer, DeepSeek-OCR 관련 의존성을 설치한다.
2. `huggingface_hub.snapshot_download("unsloth/DeepSeek-OCR", local_dir="deepseek_ocr")`로 모델 파일을 로컬 디렉터리에 받는다.
3. `FastVisionModel.from_pretrained`와 `AutoModel`로 DeepSeek-OCR custom model code를 로드한다.
4. Persian OCR 데이터셋 `hezarai/parsynth-ocr-200k`에서 baseline sample을 뽑아 inference한다.
5. 이미지와 정답 텍스트를 DeepSeek-OCR conversation/message 형식으로 변환한다.
6. LoRA adapter를 attention/MLP 계열 module에 붙이고 60 step 학습을 돌린다.
7. 학습 전후 OCR 결과와 CER를 비교한다.
8. LoRA adapter 또는 merged 16bit 형태로 저장하거나 Hugging Face Hub에 올릴 수 있는 경로를 보여준다.

즉 “DeepSeek-OCR 논문 분석”이라기보다, **OCR용 VLM을 내 언어·글꼴·문서 도메인에 맞춰 빠르게 적응시키는 Colab recipe**에 가깝다.

## 설치와 첫 실행

노트북 첫 cell은 “Runtime → Run all”을 눌러 무료 Tesla T4 Google Colab 인스턴스에서 실행할 수 있다고 안내한다. 실제 notebook metadata도 accelerator를 `GPU`, `gpuType`을 `T4`로 둔다. 다만 저장된 실행 출력에는 `NVIDIA L4`가 찍힌 cell도 있어, Colab에서 배정되는 GPU는 시점과 계정 상태에 따라 달라질 수 있다.

설치 cell은 Colab 여부에 따라 경로가 갈린다.

```python
if "COLAB_" not in "".join(os.environ.keys()):
    !pip install unsloth  # Do this in local & cloud setups
else:
    import torch
    v = re.match(r'[\d]{1,}\.[\d]{1,}', str(torch.__version__)).group(0)
    xformers = 'xformers==' + {'2.10':'0.0.34','2.9':'0.0.33.post1','2.8':'0.0.32.post2'}.get(v, "0.0.34")
    !pip install sentencepiece protobuf "datasets==4.3.0" "huggingface_hub>=0.34.0" hf_transfer
    !pip install --no-deps unsloth_zoo bitsandbytes accelerate {xformers} peft trl triton unsloth
    !pip install --no-deps --upgrade "torchao>=0.16.0"
!pip install transformers==4.56.2
!pip install --no-deps trl==0.22.2
!pip install jiwer
!pip install einops addict easydict
```

이 부분은 장기 재현용 lockfile이 아니다. Colab의 PyTorch/CUDA stack, Unsloth release, Transformers version이 자주 바뀔 수 있으므로, 재현 기록이 필요하면 notebook raw URL뿐 아니라 `unslothai/notebooks` commit SHA, model revision, dataset revision, pip package version까지 남기는 편이 안전하다.

## 모델 로딩: Unsloth upload와 `trust_remote_code`

노트북은 원본 `deepseek-ai/DeepSeek-OCR`를 직접 받지 않고, Unsloth가 올린 `unsloth/DeepSeek-OCR`를 먼저 로컬 폴더로 내려받는다.

```python
from huggingface_hub import snapshot_download
snapshot_download("unsloth/DeepSeek-OCR", local_dir = "deepseek_ocr")
```

그다음 `FastVisionModel.from_pretrained`로 custom model을 로드한다.

```python
from unsloth import FastVisionModel
from transformers import AutoModel
import os

os.environ["UNSLOTH_WARN_UNINITIALIZED"] = '0'

model, tokenizer = FastVisionModel.from_pretrained(
    "./deepseek_ocr",
    load_in_4bit = False,
    auto_model = AutoModel,
    trust_remote_code = True,
    unsloth_force_compile = True,
    use_gradient_checkpointing = "unsloth",
)
```

Unsloth model card는 이 upload가 “latest transformers에서 inference와 fine-tuning을 가능하게 하도록 수정된 버전이며 accuracy change는 없다”고 설명한다. 이 말은 편의성이 높다는 뜻이지만, 동시에 `trust_remote_code=True`로 모델 저장소의 Python code를 실행한다는 뜻이기도 하다. 개인 노트북에서는 편하지만, 기업/보안 환경에서는 revision pinning, code review, 격리된 런타임이 필요하다.

## 데이터셋 형식: Persian OCR 샘플을 conversation으로 만들기

예제 데이터는 Hugging Face의 `hezarai/parsynth-ocr-200k`다.

```python
from datasets import load_dataset

dataset = load_dataset("hezarai/parsynth-ocr-200k", split = "train[:1000]")
dataset = dataset.rename_column("image_path", "image")
```

Hugging Face API 기준 이 데이터셋은 Persian(`fa`) 이미지+텍스트 데이터이며, 공개 metadata에는 `image_path` image feature와 `text` string feature가 보인다. split은 train 179,999개, test 20,000개로 노출된다. 노트북은 baseline sample 확인에는 `train[:2000]`을, fine-tuning에는 `train[:1000]`을 사용한다.

DeepSeek-OCR용 conversation 변환은 일반적인 OpenAI-style `role: user/assistant`와 살짝 다르다. user message에 `<|User|>` role, OCR prompt, image를 넣고 assistant message에 정답 text를 둔다.

```python
instruction = "<image>\nFree OCR. "

def convert_to_conversation(sample):
    conversation = [
        {
            "role": "<|User|>",
            "content": instruction,
            "images": [sample['image']]
        },
        {
            "role": "<|Assistant|>",
            "content": sample["text"]
        },
    ]
    return {"messages": conversation}

converted_dataset = [convert_to_conversation(sample) for sample in dataset]
```

이 구조가 이 노트북의 실전 포인트다. 다른 OCR 데이터셋으로 바꿔 끼울 때도 핵심은 “이미지 객체와 정답 텍스트를 DeepSeek-OCR collator가 기대하는 형태로 유지하는가”다.

## 학습 설정과 CER 예시

LoRA adapter는 attention projection과 MLP 계열 module에 들어간다.

```python
model = FastVisionModel.get_peft_model(
    model,
    target_modules = [
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
    ],
    r = 16,
    lora_alpha = 16,
    lora_dropout = 0,
    bias = "none",
    random_state = 3407,
)
```

학습은 Transformers `Trainer`를 쓰고, 별도 `DeepSeekOCRDataCollator`를 정의해서 image token 수, crop ratio, assistant response masking 등을 처리한다. 빠른 실습을 위해 설정은 60 step이다.

```python
trainer = Trainer(
    model = model,
    tokenizer = tokenizer,
    data_collator = data_collator,
    train_dataset = converted_dataset,
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        max_steps = 60,
        learning_rate = 2e-4,
        optim = "adamw_8bit",
        weight_decay = 0.001,
        lr_scheduler_type = "linear",
        seed = 3407,
        fp16 = not is_bf16_supported(),
        bf16 = is_bf16_supported(),
        output_dir = "outputs",
        report_to = "none",
        dataloader_num_workers = 2,
        remove_unused_columns = False,
    ),
)
```

노트북에 저장된 sample 결과는 다음과 같다.

| 비교 | OCR 출력 |
| --- | --- |
| Baseline | `انضباطم نندم حقيقتن باورم نميتند` |
| Fine-tuned 60 steps | `انضباطم نشدم حقیقتن باورم نمیشد` |
| Ground truth | `انضباطمم شدم حقیقتن باورم نمیشد` |

노트북 설명은 이 단일 sample에서 Character Error Rate가 23%에서 6%로 떨어졌다고 적는다. Unsloth 문서에는 더 큰 Persian eval도 있다. 200개 sample 기준 baseline mean CER 149.07%, fine-tuned mean CER 60.43%/60.81%라는 수치를 함께 제시하며, 60 step, total batch size 8 조건이라고 설명한다.

다만 이 숫자는 “모든 OCR 데이터에서 57% 더 정확하다”는 일반 benchmark가 아니다. Persian synthetic OCR slice, 특정 prompt, 특정 preprocessing, 짧은 LoRA run에서의 예시다. 내 데이터에 적용하려면 별도 validation split과 CER/WER 또는 layout-aware metric을 다시 잡아야 한다.

## 저장과 serving 경로

학습 뒤에는 LoRA adapter를 로컬에 저장하거나 Hugging Face Hub에 올릴 수 있다.

```python
model.save_pretrained("deepseek_ocr_lora")
tokenizer.save_pretrained("deepseek_ocr_lora")
# model.push_to_hub("your_name/deepseek_ocr_lora", token = "YOUR_HF_TOKEN")
# tokenizer.push_to_hub("your_name/deepseek_ocr_lora", token = "YOUR_HF_TOKEN")
```

다시 불러올 때는 같은 `FastVisionModel.from_pretrained` 경로로 adapter directory를 지정한다. 배포용으로는 merged 16bit export 예시도 들어 있다.

```python
# Save locally to 16bit
if False: model.save_pretrained_merged("unsloth_finetune", tokenizer)

# To export and save to your Hugging Face account
if False: model.push_to_hub_merged(
    "YOUR_USERNAME/unsloth_finetune",
    tokenizer,
    token = "YOUR_HF_TOKEN",
)
```

DeepSeek-OCR 자체 inference는 Transformers뿐 아니라 vLLM upstream guide도 있다. vLLM recipe는 `NGramPerReqLogitsProcessor`, `temperature=0.0`, `max_tokens=8192`, `ngram_size=30`, `window_size=90`, prefix caching off, multimodal processor cache off 같은 설정을 강조한다. Colab notebook은 fine-tuning 손동작에 초점이 있고, 대량 PDF batch serving이나 OpenAI-compatible API server는 vLLM 문서를 함께 봐야 한다.

## 주의할 점

첫째, **DeepSeek-OCR와 DeepSeek-OCR 2를 섞지 말아야 한다.** 이 입력 URL은 `Deepseek_OCR_(3B).ipynb`이고, 모델은 `unsloth/DeepSeek-OCR` / `deepseek-ai/DeepSeek-OCR` 경로다. DeepSeek-OCR 2용 notebook과 model card는 따로 있다.

둘째, **Colab은 편하지만 문서 보안 경계가 약하다.** OCR 대상에는 주민번호, 계약서, 의료 기록, 사내 PDF, 고객 스캔본이 섞이기 쉽다. Colab에 업로드하는 순간 데이터 위치와 접근 권한이 바뀐다. Hub에 adapter나 merged model을 올릴 때도 training data가 민감하지 않은지 확인해야 한다.

셋째, **`trust_remote_code=True`와 custom code를 가볍게 보면 안 된다.** DeepSeek-OCR는 custom modeling files를 포함한다. 재현성과 보안을 모두 챙기려면 model revision을 pin하고, 실행 전 code diff를 훑고, 격리된 GPU runtime에서 돌리는 편이 낫다.

넷째, **notebook source license, model license, dataset license는 서로 다르다.** `unslothai/notebooks`는 LGPL-3.0이고, `deepseek-ai/DeepSeek-OCR`와 `unsloth/DeepSeek-OCR` metadata는 MIT를 표시한다. 반면 `hezarai/parsynth-ocr-200k`의 공개 API metadata에서는 license field가 명확히 보이지 않았다. fine-tuned 결과를 공개하거나 제품에 넣는다면 각 license와 dataset 사용 조건을 따로 확인해야 한다.

다섯째, **CER 개선 수치는 adoption hint이지 품질 보증이 아니다.** OCR은 글꼴, 언어, 스캔 해상도, crop mode, table/layout 구조, prompt에 매우 민감하다. 실제 pipeline에 넣을 때는 실패 문서 샘플, 숫자/표/고유명사 오류, layout preservation, Markdown 변환 품질을 따로 QA해야 한다.

## 내 판단

이 Colab은 DeepSeek-OCR을 “바로 production OCR로 쓰자”는 배포 템플릿이라기보다, **내 언어·문서 도메인에서 DeepSeek-OCR가 LoRA로 얼마나 빨리 적응하는지 확인하는 최소 실험대**로 유용하다. 특히 Persian OCR 예제처럼 base model이 엉뚱한 문자열을 내는 영역에서, 60 step만으로도 방향성이 개선되는지 빠르게 확인할 수 있다.

추천 대상은 다음에 가깝다.

- 특정 언어, 글꼴, 양식, 스캔 품질에 맞춰 OCR VLM을 domain adaptation해보고 싶은 사람
- DeepSeek-OCR inference와 fine-tuning을 Unsloth 방식으로 한 번에 훑고 싶은 사람
- image+text OCR dataset을 conversation format과 custom collator로 연결하는 예제를 찾는 사람
- vLLM/Transformers serving 전, 작은 Colab 실험으로 데이터 적합성을 먼저 검증하려는 사람

반대로 CPU-only OCR, 설치형 데스크톱 앱, 완성된 RAG ingestion product, 검증된 대규모 benchmark를 기대한다면 범위가 다르다. 이 항목은 catalog 관점에서 **“DeepSeek-OCR 3B를 Unsloth로 fine-tuning하는 실행 가능한 Colab recipe”**로 저장해둘 만하다.

## 참고한 공개 자료

- [Deepseek OCR (3B) Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Deepseek_OCR_(3B).ipynb)
- [Deepseek_OCR_(3B).ipynb raw notebook](https://raw.githubusercontent.com/unslothai/notebooks/main/nb/Deepseek_OCR_(3B).ipynb)
- [unslothai/notebooks GitHub repository](https://github.com/unslothai/notebooks)
- [Unsloth DeepSeek-OCR: How to Run & Fine-tune](https://unsloth.ai/docs/models/tutorials/deepseek-ocr-how-to-run-and-fine-tune)
- [unsloth/DeepSeek-OCR Hugging Face model](https://huggingface.co/unsloth/DeepSeek-OCR)
- [deepseek-ai/DeepSeek-OCR Hugging Face model](https://huggingface.co/deepseek-ai/DeepSeek-OCR)
- [deepseek-ai/DeepSeek-OCR GitHub repository](https://github.com/deepseek-ai/DeepSeek-OCR)
- [vLLM DeepSeek-OCR usage guide](https://docs.vllm.ai/projects/recipes/en/latest/DeepSeek/DeepSeek-OCR.html)
- [hezarai/parsynth-ocr-200k Hugging Face dataset](https://huggingface.co/datasets/hezarai/parsynth-ocr-200k)
