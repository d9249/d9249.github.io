---
title: "이 워크숍은 로컬 LLM 훈련을 신비화하지 않고 tokenizer·transformer·loop로 다시 분해한다"
date: "2026-05-10T00:05:00"
description: "Angelos Perivolaropoulos의 'Training an LLM from Scratch, Locally'는 로컬에서 LLM을 훈련한다는 과장된 서사를 걷어내고, 작은 GPT를 tokenizer·architecture·training loop·inference 네 블록으로 다시 분해해 실전 감각으로 설명한다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - YouTube
  - LLM Training
  - NanoGPT
  - Transformer
  - Tokenizer
  - ElevenLabs
  - PyTorch
draft: false
---

로컬에서 LLM을 처음부터 훈련한다는 말은 여전히 두 가지 오해를 동시에 부른다. 한쪽에서는 그게 거의 불가능한 일처럼 들리고, 다른 한쪽에서는 카라파시 스타일의 데모 몇 줄만 따라 치면 금방 재현할 수 있는 취미 프로젝트처럼 받아들여진다. 실제로는 그 중간 어디쯤에 있다.

`Training an LLM from Scratch, Locally — Angelos Perivolaropoulos, ElevenLabs`가 좋은 이유는 바로 이 과장을 걷어낸다는 점이다. 이 세션은 “노트북 한 대로 frontier model을 만들 수 있다”는 식의 과장 대신, **작은 GPT를 직접 만들어 보면서 어떤 부품이 진짜 핵심이고 어떤 부분이 scale의 문제인지**를 분해해서 보여준다.

내가 보기에 이 영상의 핵심 가치는 결과물보다 framing에 있다. Angelos는 로컬 LLM 훈련을 magical한 black box로 취급하지 않고, tokenizer, transformer, training loop, inference라는 네 블록으로 잘라낸다. 그리고 이 네 블록 각각에서 **왜 작은 모델은 character-level tokenization을 택해야 하는지, 왜 training bug는 loss 곡선에서 먼저 드러나는지, 왜 reasoning model과 base model의 차이가 architecture보다 post-training에 더 가까운지**를 워크숍 형태로 설명한다.

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/UsB70Tf5zcE"
    title="Training an LLM from Scratch, Locally — Angelos Perivolaropoulos, ElevenLabs"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

이 영상은 AI Engineer 채널에 2026-05-04 업로드된 **`Training an LLM from Scratch, Locally`** 워크숍이다. 발표자는 ElevenLabs의 Angelos Perivolaropoulos로, 설명란과 transcript 기준 발표의 목표는 명확하다. 사전학습된 가중치나 Transformers 라이브러리의 완성품을 가져다 쓰지 않고, **PyTorch와 몇 개의 기본 라이브러리만으로 작은 GPT를 로컬에서 훈련하는 과정을 끝까지 따라가 보자**는 것이다.

이 세션은 단순한 입문 강의라기보다, nanoGPT 계열의 “작동하는 최소 단위”를 다시 실습형으로 재패키징한 워크숍에 가깝다. 설명란과 GitHub 저장소를 보면 이 프로젝트는 약 **10M parameter** 수준의 모델을 기본값으로 잡고, 노트북에서 1시간 이내에 훈련 가능한 범위로 문제를 축소한다.

즉 이 영상은 "최신 LLM을 이해하는 방법"을 frontier scale에서 설명하지 않는다. 대신 **작은 모델을 직접 만들어 보면 큰 모델이 무엇을 더 많이 하고 있는지 역으로 감이 잡힌다**는 교육 철학에 서 있다.

## 핵심 아이디어 / 구조 / 시연 흐름

워크숍 구조는 surprisingly orthodox하다. 발표는 대략 다음 순서로 진행된다.

| 단계 | 영상에서 다루는 내용 | 왜 중요한가 |
|---|---|---|
| 1. 문제 축소 | GPT-2 계열의 작은 모델로 목표를 제한 | frontier scale의 환상을 걷어내고 구조 이해에 집중하게 함 |
| 2. tokenizer 선택 | Shakespeare 데이터셋에 character-level tokenization 적용 | 작은 데이터에서 BPE보다 왜 단순 tokenizer가 유리한지 보여줌 |
| 3. transformer 구성 | embedding, self-attention, MLP, residual, layer norm 설명 | 최신 모델과의 공통 골격을 유지한 채 본질을 드러냄 |
| 4. training loop | next-token prediction, AdamW, LR scheduling, val loss | 실제로 모델이 "배운다"는 것이 무엇인지 loss 기반으로 체감시킴 |
| 5. inference | temperature, top-k, seed 기반 generation | 훈련과 생성이 어떤 식으로 이어지는지 연결 |
| 6. 확장 논의 | reasoning model, audio, multimodal Q&A | 작은 GPT 실습이 최신 모델 해석으로 이어지는 다리 역할 |

이 흐름에서 중요한 건 각 단계가 서로 분리된 강의가 아니라는 점이다. 예를 들어 tokenizer 파트는 단순 전처리 설명이 아니라, **왜 작은 데이터셋에서는 vocabulary 크기가 곧 학습 가능성의 상한을 결정하는지**까지 연결된다. 같은 방식으로 training loop 파트도 단순 코드 walkthrough가 아니라, loss curve를 읽는 습관과 overfitting·bug detection까지 이어진다.

## 타임라인으로 보는 핵심 구간

### 00:01~00:03 — 로컬 훈련이라는 목표를 과장 없이 정의한다

초반부에서 Angelos는 이 워크숍이 “pretrained weights 없이”, “Transformers의 완성품 없이”, “torch와 기본 라이브러리 위에서” 진행된다고 선을 긋는다. 다만 동시에 이것이 frontier-scale training이 아니라, 실제 연구 엔지니어링의 핵심 부품을 이해하기 위한 축소판이라는 점도 분명히 한다.

이 framing이 좋다. 로컬 훈련을 허세로 포장하지 않고, **실전의 80%를 감각적으로 이해하는 훈련**으로 위치시킨다.

### 00:03~00:07 — nanoGPT를 blueprint로 삼되 목표는 더 작게 잡는다

3분대에는 Andrej Karpathy의 nanoGPT가 직접 언급된다. 이 워크숍은 nanoGPT의 정신적 후계작에 가깝지만, GPT-2 재현보다 더 작은 스케일로 내려가 single-session workshop 형태에 맞게 다시 설계돼 있다.

여기서 메시지는 분명하다. **최소한으로 작동하는 GPT를 이해하는 경험**이 먼저고, 대규모 최적화는 그다음이라는 것이다.

### 00:07~00:24 — character-level tokenizer가 왜 작은 데이터에 맞는가

7분 이후부터는 setup과 tokenizer가 길게 이어진다. 여기서 가장 중요한 기술 포인트는 Shakespeare 같은 작은 데이터셋에 대해 **character-level tokenization**을 택한다는 점이다. transcript상 Angelos는 이 경우 vocab size가 65 정도로 줄어들고, 가능한 bigram 조합 수 역시 제한되기 때문에 작은 데이터에서도 학습이 성립한다고 설명한다.

반대로 GPT-2식 50k BPE를 같은 데이터에 바로 얹으면 조합 희소성이 너무 커져서 사실상 훈련이 잘 되지 않는다는 설명이 뒤따른다. 즉 이 워크숍의 tokenizer 선택은 단순한 simplification이 아니라, **데이터 크기와 vocabulary 크기의 비율을 맞추기 위한 실전적 타협**이다.

### 00:24~00:37 — transformer는 여전히 본질적으로 같은 골격 위에 있다

24분 이후 architecture 파트에서는 vocab size, block size, layer 수, head 수, embedding dimension 같은 기본 config를 설명하고, 30분대에는 GPT class와 transformer block 구조를 다룬다. 여기서 발표자가 반복해서 강조하는 것은, 최신 모델이 아무리 복잡해 보여도 **기본 transformer 골격 자체는 크게 달라지지 않았다**는 점이다.

물론 실제 대형 모델은 longer context, 효율적인 attention, 더 큰 scale을 위한 수많은 최적화를 갖지만, core abstraction은 여전히 recognizable하다. 이 워크숍은 바로 그 공통 골격을 다시 잡아 준다.

### 00:40~00:53 — 진짜 핵심은 training loop를 읽는 눈이다

40분대 이후 training loop 파트는 이 영상의 실전 가치가 가장 크게 드러나는 구간이다. next-token prediction objective, learning rate scheduling, warm-up, cosine decay, validation loss, overfitting, debugging 신호가 한꺼번에 연결된다.

특히 흥미로운 점은 loss curve를 단순 성능 지표가 아니라 **디버깅 도구**로 다룬다는 것이다. train loss가 안 내려가면 코드 버그 가능성을 의심하고, val loss가 올라가면 overfitting을 의심하며, loss spike가 이상하면 데이터나 training step의 이상을 먼저 본다. 작은 워크숍이지만, 이 부분은 실제 연구/실험 운영 습관과 매우 가깝다.

### 00:53~01:00 — generation은 sampling 규칙을 이해하는 문제다

53분 이후 inference 파트에서는 greedy decoding, temperature, top-k, seed가 소개된다. 이 구간은 “모델이 글을 쓴다”는 현상을 마술처럼 소비하지 않게 해준다. generation은 결국 logits distribution에서 어떤 규칙으로 다음 token을 고르는지의 문제라는 점을 다시 드러내기 때문이다.

이런 설명은 초보자에게 중요하다. 훈련된 모델의 출력 품질이 architecture만의 문제가 아니라, **sampling policy의 결과**이기도 하다는 감각을 심어 주기 때문이다.

### 01:05~01:21 — reasoning, audio, multimodal로 이어지는 확장 질문

후반 Q&A에서는 reasoning model과 base model의 차이, audio tokenization, multimodal encoder가 텍스트 transformer와 어떻게 연결되는지가 다뤄진다. 이 부분은 워크숍 본편보다 더 넓은 시야를 준다.

특히 reasoning model을 별도 architecture 혁신보다 **base/instruct model 위의 post-training 차이**로 설명하는 대목은 중요하다. 발표자는 reasoning의 핵심 난점이 새 블록을 발명하는 것보다, 고품질 chain-of-thought 데이터와 post-training 방식에 있다고 설명한다.

## 영상과 연결 자료에서 확인되는 점

영상 설명란에 연결된 GitHub 저장소 `angelos-p/llm-from-scratch`는 이 워크숍을 꽤 잘 뒷받침한다. 공개 저장소 메타데이터 기준 이 repo는 2026-04-04 생성, 조회 시점 기준 약 **2.2k stars**, **153 forks**, **11 commits**를 보인다. README는 이 프로젝트를 “few hundred lines” 수준의 교육용 GPT pipeline으로 소개하며, 기본 목표를 **MacBook에서 1시간 이내에 훈련 가능한 ~10M parameter 모델**로 잡고 있다.

README가 특히 좋은 부분은 workshop outline이 코드 구조와 직접 연결된다는 점이다. `Part 1: Tokenization`, `Part 2: The Transformer`, `Part 3: The Training Loop`, `Part 4: Text Generation`, `Part 5: Putting It All Together`, `Part 6: Competition`으로 쪼개져 있고, 각각이 실제로 `model.py`, `train.py`, `generate.py` 같은 결과물로 수렴한다. 즉 이 프로젝트는 발표 슬라이드용 artifact가 아니라, **실습을 염두에 둔 교육용 repo**다.

또 하나 중요한 점은 README가 character-level tokenization과 BPE를 정면 비교한다는 것이다. 작은 Shakespeare 데이터셋에서는 `vocab_size=65`, `block_size=256` 같은 설정이 합리적이며, 더 큰 tokenizer는 더 많은 데이터 없이는 제대로 수렴하지 않기 어렵다고 설명한다. 이 부분은 영상에서 나온 주장과 repo 문서가 잘 맞물리는 지점이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/llm-from-scratch-github-repo.png"
    alt="angelos-p/llm-from-scratch GitHub 저장소"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    이 워크숍의 companion repo는 tokenizer, transformer, training loop, generation을 문서와 코드 구조로 직접 대응시키며 교육용 artifact로 잘 정리돼 있다.
  </figcaption>
</figure>

README의 config table도 유용하다. Tiny(~0.5M), Small(~4M), Medium(~10M) 세 구성을 두고, M3 Pro 기준 대략적인 훈련 시간까지 제시한다. 이건 이 프로젝트가 단순히 “LLM을 만든다”는 구호보다, **어떤 규모를 어느 정도 시간 안에 실습 가능한가**를 명시적으로 설계했다는 뜻이다.

## 실무 관점에서의 해석

내가 보기엔 이 영상의 진짜 가치는 “로컬에서 LLM 훈련이 가능하다”는 문장 자체보다, **무엇을 frontier-scale problem으로 보고 무엇을 교육 가능한 core primitive로 볼 것인지 구분해 준다**는 데 있다.

오늘날 많은 팀은 LLM을 볼 때 곧바로 수십억 파라미터, 대규모 post-training, inference optimization, distributed systems의 문제로 들어간다. 물론 실제 제품화에서는 그게 맞다. 하지만 그렇게만 보면 모델이 실제로 어떤 부품들의 결합체인지 감각을 잃기 쉽다.

이 워크숍은 그 반대 방향으로 간다. 먼저 작은 모델을 끝까지 만들어 보게 하고, 그다음에야 scale의 문제를 이야기한다. 이런 접근의 장점은 분명하다.

- tokenizer 선택이 왜 데이터 가용성과 직결되는지 감이 생긴다.
- transformer block이 추상 수식이 아니라 실제 코드 단위로 보인다.
- training instability가 loss curve로 어떻게 나타나는지 몸으로 익히게 된다.
- generation quality가 sampling policy와도 연결된다는 사실을 체감하게 된다.
- reasoning, audio, multimodal 이야기도 결국 같은 기반 위의 변형으로 읽히기 시작한다.

물론 한계도 분명하다. character-level Shakespeare toy problem은 현대 LLM 개발의 중요한 축인 large-scale pretraining, curated data mixtures, tokenizer engineering, distributed optimization, RL/post-training, serving stack complexity를 거의 건드리지 못한다. 다시 말해 이 워크숍은 **실전의 축소판**이지 실전 그 자체는 아니다.

그럼에도 이 축소판은 충분히 가치가 있다. 특히 모델을 "API로 쓰는 사람"에서 "구조를 이해하는 사람"으로 넘어가고 싶을 때 그렇다. 실제 연구나 인프라 운영을 하더라도, 작은 GPT를 손으로 한 번 끝까지 만들어 본 경험은 생각보다 오래 남는다.

## 한 줄로 요약하면

`Training an LLM from Scratch, Locally`는 로컬 훈련이 대형 모델을 대체할 수 있다고 주장하지 않는다. 대신 **작은 GPT를 tokenizer·transformer·training loop·generation이라는 부품 수준으로 분해해, 현대 LLM이 어떤 기초 위에 서 있는지 다시 몸으로 이해하게 만드는 워크숍**이다.

Sources: https://youtu.be/UsB70Tf5zcE, https://www.youtube.com/watch?v=UsB70Tf5zcE, https://github.com/angelos-p/llm-from-scratch, https://raw.githubusercontent.com/angelos-p/llm-from-scratch/main/README.md, https://api.github.com/repos/angelos-p/llm-from-scratch, https://api.github.com/users/angelos-p, https://github.com/karpathy/nanoGPT