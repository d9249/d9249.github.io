---
title: "멀티모달 사전학습의 물리학: 무엇을 공유하고, 언제 섞고, 생성에는 얼마나 써야 하는가"
date: "2026-08-07T23:28:00+09:00"
description: "arXiv 2608.05000은 언어·시각 이해·시각 생성을 하나의 모델에 함께 사전학습할 때의 지식 흐름, 용량 경쟁, 조기 통합, 데이터 비율을 통제 실험으로 분해해 실무적인 설계 규칙으로 연결한다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Multimodal Pretraining
  - Vision-Language Models
  - Mixture of Experts
  - Model Training
  - Generative AI
draft: false
---

멀티모달 foundation model을 설계할 때 흔한 답은 데이터를 더 모으고, 언어 model에 vision encoder를 붙인 뒤, generation objective를 추가하는 것이다. 하지만 이 조합에서 **어느 modality가 다른 능력을 실제로 키우는지**, 공유 parameter는 어디까지 두어야 하는지, 언어 pretraining 뒤에 vision을 붙여도 되는지는 대개 경험칙으로 남아 있다.

`Towards Physics of Multimodal Pretraining`은 이 빈칸을 메우려는 실험 연구다.[1] 저자들은 언어·시각 이해·시각 생성을 함께 다루는 unified pretraining을 synthetic CLEVR와 대규모 실제 데이터에서 분해해 관찰하고, 그 결론을 13.5B MoE model(활성 parameter 1.5B)을 2T token으로 학습해 다시 검증했다.[1][2]

핵심 메시지는 “multimodal을 넣으면 좋다”가 아니다.[1] 지식은 대칭적으로 흐르지 않고, task 복잡도가 높아지면 synergy가 competition으로 바뀌며, **초기부터 함께 학습하되 FFN은 modality별로 나누고 attention·normalization은 공유하는 편**이 유리하다는 것이다.[2][3]

## 무엇을 해결하려는가

이 논문은 multimodal model을 하나의 큰 상자로 보지 않는다. 언어(Language), 시각 이해(Visual Understanding), 시각 생성(Visual Generation)을 구분한 뒤, 한 축의 data를 늘렸을 때 나머지 축의 성능이 어떻게 달라지는지를 측정한다.[2] 이 관점이 중요한 이유는 세 objective가 같은 방식으로 서로를 돕는다는 가정이 틀릴 수 있기 때문이다.

실험에서 언어 data 증가는 여러 시각 이해·생성 지표를 폭넓게 끌어올렸다. 반면 시각 이해는 생성에 강한 prior를 주지만 순수 언어 성능과는 trade-off를 보일 수 있었고, 시각 생성은 다른 능력에 대체로 중립적이었다.[2][3]

CLEVR의 개념 hold-out 실험에서도 relation·size·count 같은 구조적 개념은 이해에서 생성으로 zero-shot 전이가 나타난 반면, color·shape 같은 저수준 속성은 양방향 전이가 약했다.[2][3]

| 학습 signal을 늘린 방향 | 논문이 관찰한 주된 흐름 | 설계상 함의 |
|---|---|---|
| Language → vision | 이해와 생성 전반을 끌어올리는 범용 booster | language token은 multimodal budget의 기반 역할 |
| Visual Understanding → generation | generation에 강한 prior, 구조적 개념은 zero-shot 전이 | 이해 data를 단순 보조 task로 취급하면 손해 |
| Visual Generation → 다른 축 | 대체로 중립적, 저수준 개념 회복에는 간접 도움 | generation 비율을 초기에 과도하게 둘 근거는 약함 |

## 핵심 아이디어 / 구조 / 동작 방식

### synergy는 “모든 것을 공유”해서 나오지 않는다

공동 학습의 성패는 data만이 아니라 Transformer 내부에서 무엇을 공유하느냐에도 좌우된다. 논문은 fully shared dense block, FFN만 분리한 구조, attention·normalization까지 분리한 구조, 완전 분리 구조를 비교했다.[2][3]

fully shared는 modality 간 competition이 커졌고, 모든 것을 분리하면 synergy 자체가 사라졌다. 좋은 절충은 **FFN 분리·shared attention·normalization**이었다.[2][3]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/physics-multimodal-pretraining-architecture.png">
    <img
      src="/images/blog/physics-multimodal-pretraining-architecture.png"
      alt="완전 공유, FFN만 분리, attention과 normalization까지 분리한 Transformer 구조별 언어 perplexity와 시각 생성 diffusion loss 변화 비교"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 project page의 architecture comparison. FFN만 분리한 <code>split_ffn</code>이 language perplexity와 generation loss 모두에서 가장 큰 개선을 보인다.[3]
  </figcaption>
</figure>

해석은 비교적 직관적이다. FFN은 각 modality가 필요로 하는 feature transformation과 capacity를 충돌 없이 갖는 공간이고, attention과 normalization은 modality 사이에서 정보를 맞추고 연결하는 공통 통로가 될 수 있다. 따라서 parameter sharing을 줄이는 일은 단순한 isolation이 아니라, *competition이 큰 부분만 분리하고 transfer가 일어나는 부분은 남기는 배치*에 가깝다.

### 늦은 alignment는 vision branch를 덜 쓰게 만든다

언어 model을 오래 pretrain한 뒤 vision을 붙이는 late alignment도 흔한 경로다. 저자들은 1T-token budget에서 vision을 섞기 전의 pure-language 구간을 0B부터 800B token까지 바꿨다.[2][3]

언어 지표의 초기 이득은 곧 완만해졌지만, 시각 이해와 시각 생성 성능은 대체로 계속 하락했다.[2][3]

논문은 이를 **vision laziness**로 설명한다.[2][3]

language trunk가 먼저 강하게 자리 잡으면 model이 vision-conditioned task에서도 언어 prior에 기대기 쉬워지고, image-side FFN activation, image-wrapper token embedding norm, image token에 둔 attention이 함께 약해진다는 진단 결과를 제시한다.[2][3]

## 공개된 근거에서 확인되는 점

저자들은 앞선 관찰을 data mixture recipe로 압축한다. 탐색 결과의 대표 설정은 Language 70%, Visual Understanding 25%, Visual Generation 5%인 `L70/U25/G5`다.[2][3]

이는 생성 data가 무의미하다는 주장이 아니라, language와 understanding이 generation을 돕는 비대칭적 흐름 때문에 **초기 전체 budget에서 generation이 차지할 몫은 작아도 될 수 있다**는 조건부 결론이다.[2][3]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/physics-multimodal-pretraining-recipes.png">
    <img
      src="/images/blog/physics-multimodal-pretraining-recipes.png"
      alt="시각 통합 전 언어 token 수가 늘어날수록 언어 지표는 일부 개선되지만 시각 이해와 시각 생성 지표가 대체로 하락하는 실험 결과"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 project page의 early-unification 결과. language-only warm-up이 길어질수록 visual understanding·generation 지표가 전반적으로 약해지는 패턴을 보여 준다.[3]
  </figcaption>
</figure>

2T-token scale 비교에서 Full recipe는 Late-Fusion보다 PPL이 **11.67 대 12.25**, visual-understanding 평균이 **43.08 대 40.66**, DPG가 **0.689 대 0.672**, GenEval이 **0.482 대 0.471**이었다. 다만 diffusion loss는 Full이 **0.272**, Late-Fusion이 **0.269**로 한 축에서는 반대 방향이다.[2]

따라서 이 결과는 “모든 loss가 일괄 개선됐다”라기보다, early unification이 최종 이해·생성 품질의 주요 지표에서 우세했지만 objective별 trade-off는 남는다는 증거로 읽는 편이 정확하다.[2]

| 설계 선택 | 논문이 제시한 규칙 | 과도한 일반화를 피할 지점 |
|---|---|---|
| Data mix | L70/U25/G5를 강한 출발점으로 제안 | tokenization, data quality, 목표 generation 품질에 따라 재탐색 필요 |
| Parameter sharing | FFN 분리, attention·normalization 공유 | 모든 model family·MoE routing에 자동 적용되는 법칙은 아님 |
| Training timing | 처음부터 joint training | 이미 대규모 text-only checkpoint가 있는 조직의 전환 비용은 별도 문제 |
| Evaluation | 이해·생성·언어를 함께 본다 | 한 scalar score만으로 recipe를 고르면 trade-off를 놓칠 수 있음 |

## 실무 관점에서의 해석

이 연구가 유용한 이유는 새로운 VLM architecture 하나를 소개해서가 아니라, **multimodal pretraining을 tuning checklist가 아니라 인과적으로 분해 가능한 design space로 바꿨다**는 데 있다.[2][3] 특히 “generation token은 많이 넣을수록 좋다”거나 “language backbone을 먼저 끝까지 만들고 vision을 align하면 된다”는 직관을 검증 가능한 가설로 낮춘 점이 좋다.

실무 팀이라면 이 논문을 그대로 recipe로 복사하기보다 세 가지 질문으로 활용할 만하다. 첫째, 우리 data mix에서 어떤 objective가 다른 objective의 prior 역할을 하는가. 둘째, 성능 하락은 data 부족이 아니라 shared capacity competition에서 오는가. 셋째, 늦은 vision integration이 실제로 model의 visual pathway 사용량을 낮추고 있는가. 이 세 질문에 답하면 model size를 더 키우기 전에 더 값싼 설계 변경을 찾을 수 있다.

다만 범위는 분명하다.[2] 저자들도 text와 static image를 중심으로 실험했으며, video·audio·action modality와 더 큰 frontier-scale system으로의 확장은 남은 과제로 든다.[2] 그러므로 이 글의 가장 안전한 takeaway는 `L70/U25/G5` 자체가 아니라, **knowledge flow·capacity sharing·integration timing을 각각 독립 변수로 두고 측정하라**는 방법론이다.

## Sources

[1] https://arxiv.org/abs/2608.05000 — arXiv abstract: 2608.05000
[2] https://arxiv.org/html/2608.05000 — arXiv HTML: 2608.05000
[3] https://junlinhan.github.io/projects/physics_of_mm_pretrain — Physics of Multimodal Pretraining project page
