---
title: "WeMM-Embedding은 왜 2B로 8B 멀티모달 임베딩을 넘었나"
date: "2026-08-30T14:21:16"
description: "Tencent WeChat Vision의 WeMM-Embedding은 Qwen3.5 기반 2B·4B·9B 멀티모달 임베딩 모델군으로, 데이터 정제·세밀한 관련도 감독·교차 규모 증류와 Matryoshka 차원 절감을 결합해 작은 모델의 검색 효율을 밀어붙인다."
author: "Sangmin Lee"
category: "search-retrieval"
tags:
  - WeMM-Embedding
  - Multimodal Embeddings
  - Vector Search
  - Retrieval
  - Qwen3.5
draft: false
---

멀티모달 검색의 난점은 이미지·영상·시각 문서·텍스트를 각각 다른 임베더와 다른 점수 체계로 처리해야 한다는 데 있다.[3]
Tencent WeChat Vision이 공개한 `WeMM-Embedding`은 이 입력들을 하나의 벡터 공간에 놓고, 텍스트·이미지·영상·시각 문서·interleaved input을 같은 검색 인터페이스로 다루려는 Qwen3.5 기반 모델군이다.[2][3]

국내 커뮤니티에서 먼저 주목받은 포인트는 “2B가 8B 공개 베이스라인을 넘었다”는 결과다.[1]
현재 공식 배포는 2B·4B·9B 세 모델로 정리되어 있으며, 각각 Hugging Face 가중치와 GitHub 추론·평가 코드를 함께 제공한다.[2][4]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/wemm-embedding-efficiency-dashboard.svg"
    alt="MMEB-v2 78개 데이터셋 평균에서 WeMM 2B 77.9가 Qwen3-VL 2B의 73.2와 8B의 77.8보다 높고, WeMM 9B는 80.6이며, WeMM 2B는 256차원에서 이미지와 비디오 성능의 98.7%를 유지한다는 비교 도표"
    style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0 auto;"
  />
  <figcaption style="margin-top: 0.65rem; font-size: 0.95rem; color: #666;">
    Tencent의 기술 보고서와 공개 저장소에 있는 MMEB-v2 저자 보고 수치로 재구성한 비교 도표. 공개 benchmark 결과이지 독립 재현 결과는 아니다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

CLIP 계열의 dual encoder는 이미지와 텍스트의 정렬에는 강하지만, 여러 이미지와 텍스트가 섞인 문서나 영상+설명처럼 **입력이 원래부터 interleaved인 검색 문제**를 자연스럽게 표현하기 어렵다.[3]
WeMM-Embedding은 Qwen3.5의 멀티모달 입력 능력을 바탕으로, 단일 모달 입력뿐 아니라 이런 조합 자체를 하나의 embedding으로 만들겠다는 방향을 잡는다.[3]

모델은 마지막 층 hidden state에서 전용 `<embedding>` token 위치를 읽고 L2 정규화한 벡터를 반환한다.[2]
공개 README와 모델 카드는 text, image, video를 독립적으로 넣을 수도 있고, 이미지·영상·텍스트를 함께 넣는 message 형식도 지원한다고 설명한다.[2][5]

## 핵심은 아키텍처보다 학습 신호의 설계다

논문은 2B·4B·9B Qwen3.5 백본에 두 단계 학습을 적용한다.[3]
1단계에서는 대규모 multimodal pair로 정렬을 만들면서 contrastive learning, graded relevance learning, Matryoshka Representation Learning(MRL)을 함께 사용하고, 2단계에서는 정제 데이터·hard negative·reranker supervision·embedding distillation을 더한다.[3]

여기서 중요한 해석은 “2B가 큰 모델을 이겼다”가 새로운 backbone 하나의 마법이라는 뜻은 아니라는 점이다.[3]
저자들이 강조하는 경로는 빈도가 높은 semantic pattern을 덜 뽑도록 하는 Semantic-ID 기반 재샘플링, 멀티모달 LLM으로 noisy pair를 정제하는 과정, 그리고 비슷하지만 틀린 후보를 넣는 hard negative 구성이다.[3]

2B와 4B는 9B 계열의 embedding 교사로부터 지식을 옮기는 경로도 사용한다.[3]
반면 9B는 더 큰 교사가 없어서 서로 다른 특화 변형을 병합하는 방식을 썼다고 보고서는 설명한다.[3]

## 공개된 성능에서 읽어야 할 점

MMEB-v2는 이미지·영상·시각 문서에 걸친 78개 데이터셋을 묶어 평가한다.[2][3]
저자 보고 기준 `WeMM-Embedding-2B`의 평균은 77.9로, `Qwen3-VL-Embedding-2B`의 73.2보다 4.7점 높고 `Qwen3-VL-Embedding-8B`의 77.8도 0.1점 앞선다.[2][3]

같은 표에서 4B는 79.2, 9B는 80.6이다.[2][3]
다만 수치는 이미지·영상에는 Hit@1, 시각 문서에는 NDCG@5를 쓰는 benchmark 집계이므로, 하나의 숫자를 모든 검색 workload의 절대 순위로 읽기보다 특정 평가 묶음의 신호로 보는 편이 맞다.[2][3]

MMEB-v3에서는 텍스트와 agent task까지 포함한 190개 과제를 본다.[2][3]
2B는 V3-All 56.0, Text 45.3, Agent 45.1을 기록했고 9B는 각각 59.5, 48.8, 51.0으로 올라간다.[2][3]
그러나 오디오 입력은 현재 지원하지 않기 때문에 Audio 열은 0.0이며, 이 모델을 “모든 모달리티를 포괄하는 omni embedder”로 부르는 것은 정확하지 않다.[2][3]

## 차원은 모델을 바꾸지 않고도 줄일 수 있다

MRL은 하나의 full embedding에서 앞부분을 잘라 더 작은 nested representation으로 쓸 수 있게 만드는 학습 방식이다. 2B 모델은 64·128·256·512·1024·2048차원을, 4B는 2560차원까지, 9B는 4096차원까지의 차원 목록을 모델 설정에 공개한다.[2][5][6]

특히 2B 모델은 MMEB-v2 이미지·영상 부분집합에서 256차원만 써도 2048차원 결과의 98.7%를 유지한다고 저자들이 보고한다. 이는 벡터 저장 공간과 ANN 검색 비용이 병목인 팀에는 유용한 출발점이지만, 시각 문서와 retrieval task는 낮은 차원에 더 민감하다고 보고서가 함께 지적하므로 자체 corpus에서 dimension sweep을 해야 한다.[2][3]

```python
# 차원 축소 후 재정규화
F = torch.nn.functional
v = embedding[..., :256]
embedding_256 = F.normalize(
    v, dim=-1
)
```

## 가중치는 열렸지만, 도입 난이도는 가볍지 않다

추론은 `transformers==5.2.0`, `qwen-vl-utils[decord]==0.0.14`, `sentence-transformers`, `accelerate` 조합을 권장한다. 모델 카드는 `trust_remote_code=True`로 모델을 불러오는 예시를 제시하므로, 조직 환경에서는 고정 commit 검토·의존성 잠금·격리된 평가 환경을 먼저 두는 편이 안전하다.[2][5]

vLLM `0.27.0`과 SGLang `0.5.9`용 serving 예시도 공개되어 있으며, repository에는 MMEB-v3 평가 코드가 들어 있다. 다만 이 평가 코드는 VLM2Vec pipeline을 최소 변경한 포크이고, 저자 보고 video score에 맞추기 위해 video당 64 frame을 사용한다. 결과 비교 때 frame 수, GPU 수, 긴 문서의 max length 같은 조건을 같이 맞춰야 한다.[2]

라이선스도 한 번 더 확인할 필요가 있다. GitHub 저장소의 Tencent 작성 코드는 Apache-2.0이라고 명시하지만, Hugging Face 카드의 표준 `license` 필드는 `other`로 표시되고 `license_name`과 링크는 Apache-2.0을 가리킨다. 코드와 weight의 사용 조건을 계약·배포 정책에 넣기 전에는 각 모델 저장소의 LICENSE를 실제로 다시 읽는 것이 안전하다.[2][5][6]

릴리스 성숙도도 과장할 단계는 아니다. GitHub 저장소는 2026년 8월 25일에 만들어졌고 현재 GitHub Releases와 태그가 없으며, 공개 issue에는 평가 검증과 video retrieval 관련 질문도 남아 있다.[7] 공개 코드와 가중치가 있다는 점은 분명한 장점이지만, headline score를 production KPI로 옮기기 전에 한국어 데이터, 영상 frame 정책, visual-document 비중, latency·메모리 예산으로 자체 hold-out 평가를 해야 한다.

## 실무 관점에서의 해석

WeMM-Embedding이 주는 가장 유용한 신호는 파라미터 규모보다 **데이터 분포와 관련도 감독이 멀티모달 retrieval 품질을 얼마나 크게 바꿀 수 있는가**에 있다. 모델을 2B에서 9B로 키우는 경로도 공개했지만, 2B가 8B baseline을 살짝 넘긴 결과는 작은 모델을 곧바로 배제하지 말고 학습 데이터·negative·차원 정책을 함께 보라는 메시지에 가깝다.

도입 우선순위는 명확하다. 이미지·짧은 영상·시각 문서가 같은 검색 index에 들어가고, 오디오가 핵심이 아니며, 256~512차원으로 vector cost를 줄여야 한다면 2B부터 자체 평가하기 좋다. 반대로 오디오 검색, 한국어 품질 보증, 장시간 영상, 독립적으로 검증된 대규모 운영 안정성이 핵심이면 지금 공개된 benchmark만으로 결론을 내리기보다 다른 omni embedding 모델과 같은 조건의 A/B 평가를 먼저 해야 한다.

## Sources

[1] https://discuss.pytorch.kr/t/wemm-embedding-2b-8b/11750 — PyTorch Korea discussion: WEMM-Embedding-2B / 8B
[2] https://github.com/Tencent/WeMM-Embedding — Tencent WeMM-Embedding repository
[3] https://arxiv.org/abs/2608.24053 — WeMM-Embedding technical report
[4] https://huggingface.co/collections/tencent/wemm-embedding — Tencent WeMM-Embedding Hugging Face collection
[5] https://huggingface.co/tencent/WeMM-Embedding-2B — WeMM-Embedding-2B model card
[6] https://huggingface.co/tencent/WeMM-Embedding-9B — WeMM-Embedding-9B model card
[7] https://api.github.com/repos/Tencent/WeMM-Embedding — Tencent WeMM-Embedding GitHub API metadata
