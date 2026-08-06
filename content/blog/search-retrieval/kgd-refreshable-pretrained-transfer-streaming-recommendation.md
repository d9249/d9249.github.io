---
title: "KGD는 추천 모델의 ‘지식 갱신’과 ‘작업 적응’을 분리한다"
date: "2026-08-06T14:08:37+09:00"
description: "Knowledge–Geometry Decoupling(KGD)은 스트리밍 추천에서 행동 지식을 계속 갱신하는 encoder와 task별 ranking geometry를 분리한다. BMTP로 noisy next-item supervision을 걸러 내고, read-only encoder·ACR residual로 refresh와 적응의 충돌을 피하려는 논문과 공개 구현을 정리한다."
author: "Sangmin Lee"
category: "search-retrieval"
tags:
  - Recommender Systems
  - Sequential Recommendation
  - Pretraining
  - Streaming
  - Knowledge Geometry Decoupling
  - BMTP
draft: false
image: "/images/blog/kgd-architecture.webp"
---

추천 모델을 한 번 학습하고 오래 쓰기는 어렵다.[3] 신규 상품, 캠페인, 사용자 유입이 바뀌면 행동 sequence의 분포도 함께 움직이고, pretrained encoder를 새 로그로 갱신하는 동안 ranking task의 fine-tuning이 같은 parameter를 덮어쓸 수 있다. `Knowledge–Geometry Decoupling: Refreshable Pretrained Transfer for Streaming Recommendation`은 이 문제를 **무엇을 pretrain할지**와 **그 지식을 task에 어떻게 넘길지**로 나눠 푼다.[1][2][3]

논문이 제안하는 KGD는 행동 지식을 담당하는 refreshable encoder와 task별 판별 geometry를 담당하는 learner를 분리한다.[3] 저자들은 BMTP(Behavioral Multi-Token Prediction), read-only cross-attention, ACR(Anchored Calibration Residual)을 묶어 이 구조를 구현했고, Shopee Homepage Search의 online A/B test와 8개 Amazon 공개 benchmark 결과를 함께 보고한다.[3]

## 문제가 되는 것은 “다음 아이템” 자체가 아니다

일반적인 sequential pretraining은 바로 다음 item을 예측한다.[3] 하지만 추천 로그는 문장처럼 한 가지 주제로 이어지지 않는다.[3] 논문은 서로 무관한 browsing session이 한 sequence 안에서 붙을 수 있으므로, 단순한 인접성이 의존 관계를 뜻하지 않는다고 지적한다.[3]

예를 들어 자전거 부품을 보다가 바지를 본 사용자의 로그는, 두 item을 강한 다음-item 신호로 학습하면 noise가 될 수 있다.[3] 동시에 production stream에서는 item pool과 사용자 분포가 계속 바뀌므로 encoder도 새 window로 갱신해야 한다.[3]

여기서 fine-tuning은 또 다른 문제를 만든다.[3] pretraining의 생성적 objective와 CTR·ranking 같은 downstream의 판별 objective가 같은 embedding을 서로 다른 방향으로 움직이려 하기 때문이다. 저자들은 shared parameter에서 이 gradient conflict가 생기며, full fine-tuning은 pretrained knowledge를 훼손하고 frozen transfer는 task가 필요한 geometry를 만들기 어렵다고 설명한다.[3]

## KGD의 구조: encoder는 읽고, task는 자기 공간에 쓴다

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kgd-architecture.webp"
    alt="KGD의 knowledge pretraining과 task-specific training을 분리한 구조. 왼쪽은 BMTP와 sequence encoder, 오른쪽은 Anchored Calibration Residual과 read-only task learner를 보여 준다."
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv HTML Figure 2. BMTP는 collaborative·semantic 축에서 걸러 낸 future transition으로 encoder를 pretrain하고, task learner는 encoder state를 읽되 encoder parameter에는 쓰지 않는다.[3][9][11]
  </figcaption>
</figure>

BMTP는 모든 다음 item을 같은 정답으로 취급하지 않는다.[3] 각 position에서 collaborative graph의 근접도 또는 item text embedding의 semantic similarity가 threshold를 넘는 이후 item만 골라 supervision에 넣는다.[3] 이 similarity는 offline에서 계산·cache해 두고, sequence마다 별도 model inference를 추가하지 않는다는 것이 논문의 설명이다.[3]

transfer 단계에서 task learner는 encoder의 contextualized state를 read-only cross-attention으로 읽는다.[3] task gradient가 encoder까지 전달되지 않도록 막아, 행동 knowledge를 담은 encoder는 새 로그로 갱신할 수 있게 한다.[3]

ACR은 pretrained embedding의 detached copy에 task-owned residual을 더한다.[3] 논문은 residual을 pretrained direction에 직교하도록 구성해 task별 분별력을 추가하되, 기존 행동 geometry를 단순히 회전·overwrite하지 않게 하려 한다.[3]

| 운영상의 충돌 | KGD의 분리 방식 | 의도 |
|---|---|---|
| Raw adjacency가 session boundary noise를 포함 | BMTP가 collaborative·semantic transition만 선택 | pretraining target을 정제 |
| 최신 로그로 encoder를 갱신해야 함 | behavioral encoder를 refreshable component로 둠 | drift를 새 window에서 반영 |
| ranking task가 encoder knowledge를 망칠 수 있음 | read-only cross-attention | task gradient가 encoder를 쓰지 못하게 함 |
| task마다 필요한 ranking geometry가 다름 | ACR의 task-owned residual | encoder와 별도의 판별 공간을 학습 |

## 저자들이 보고한 결과는 무엇인가

논문은 8개 Amazon category의 공개 benchmark에서 KGD가 기존 pretrain-transfer baseline보다 4–12% 높은 결과를 보였다고 보고한다.[3] 이 수치는 저자들의 비교 실험 결과이며, 서로 다른 task·metric·dataset의 개선폭을 하나의 절대 성능으로 읽으면 안 된다.[3]

industrial stream의 28일 비교에서는 KGD(BMTP)가 click AUC 0.7867, click GAUC 0.7826, order AUC 0.9015, order GAUC 0.8477로 표의 최고값을 기록했다.[3] 같은 표에서 ACR과 read-only interface를 모두 뺀 설정은 click AUC 0.7785로, scratch 0.7806보다 낮았다.[3]

저자들은 Shopee Homepage Search의 full-traffic online A/B test에서 GMV per user +1.75%, advertising revenue +1.53%를 보고한다.[3] 이 수치는 외부 재현 결과가 아니라 논문 저자들이 공개한 산업 실험 결과라는 한계를 전제로 볼 필요가 있다.[3]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kgd-90-day-results.webp"
    alt="KGD와 여러 baseline의 90일 click AUC 및 order AUC 추세 비교 그래프"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv HTML Figure 3. 위 행은 click AUC, 아래 행은 order AUC이며, 저자들은 90일 stream에서 KGD(S3)의 안정적인 추세를 제시한다. 곡선은 가독성을 위해 10일 window의 Savitzky–Golay smoothing을 적용했다.[3][10]
  </figcaption>
</figure>

90일 figure에서는 KGD(S3) 곡선이 여섯 panel에서 비교적 높은 위치를 유지한다.[3][10] 다만 그래프의 shading·smoothing과 industry dataset의 비공개성 때문에, 이 그림만으로 다른 서비스에 대한 효과 크기까지 일반화할 수는 없다.[3]

## 공개 구현은 어디까지 가능한가

논문 저자들은 `FuCongResearchSquad/KGD4REC`에 reference implementation을 공개했다.[4] README는 ManCAR backbone 위에서 8개 Amazon benchmark를 사용하며, 1단계 encoder pretraining과 2단계 task training으로 실행 흐름을 나눈다고 안내한다.[6]

공개 dataset `PIIR/KGD-dataset`에는 train/validation/test interaction split, BMTP용 collaborative·semantic embedding, ManCAR용 swing graph가 포함돼 있다.[6] Hugging Face metadata는 Amazon Reviews 2023의 8개 category를 처리한 dataset이며 MIT license라고 표시한다.[7][8]

```bash
# 공식 README의 두 단계 흐름
cd ManCAR_KGD
DATASET=Software bash run_pretrain.sh
DATASET=Software PRETRAIN_INIT_PATH=save_model/Software/pretrain/xxx.pt \
  bash run_mancar_kgd.sh
```

코드는 Python 3.10 이상, PyTorch 2.4.1 등을 권장한다.[6] 저장소에는 release와 tag가 없으므로, 지금의 repository 상태를 재현 실험의 고정된 배포판으로 보기는 어렵다.[5][6]

## 도입 전에 확인할 것

KGD의 아이디어는 매일 변하는 로그를 가진 조직에 특히 맞는다.[3] 반대로 offline dataset 한 번으로 training을 끝내는 모델이라면 encoder refresh와 task ownership을 분리하는 비용이 성능 이득보다 클 수 있다.

도입 실험에서는 먼저 session boundary가 실제로 noisy next-item label을 만드는지 확인하는 편이 좋다.[3] 그 다음에는 encoder refresh cadence, BMTP의 graph·semantic signal 품질, task learner가 encoder에 gradient를 쓰지 않는지, offline gain이 online metric으로 이어지는지를 순서대로 검증해야 한다.

이 논문의 흥미로운 점은 더 큰 encoder나 더 많은 replay buffer를 우선 제안하지 않는다는 데 있다. 변화하는 행동 지식과 task별 ranking geometry는 같은 parameter에 계속 섞어 두기보다, **누가 읽고 누가 쓰는지부터 분리할 수 있다**는 설계다. 공개 코드와 data surface가 있어 Amazon benchmark에서 출발할 수 있지만, Shopee의 online 효과는 별도의 production 검증이 필요하다.[3][6][8]

## Sources

[1] https://arxiv.org/abs/2608.02738 — arXiv abstract page
[2] https://export.arxiv.org/api/query?id_list=2608.02738 — arXiv API metadata
[3] https://arxiv.org/html/2608.02738v1 — arXiv HTML paper
[4] https://github.com/FuCongResearchSquad/KGD4REC — KGD4REC official repository
[5] https://api.github.com/repos/FuCongResearchSquad/KGD4REC — KGD4REC GitHub API metadata
[6] https://raw.githubusercontent.com/FuCongResearchSquad/KGD4REC/main/README.md — KGD4REC README
[7] https://huggingface.co/datasets/PIIR/KGD-dataset — KGD dataset card
[8] https://huggingface.co/api/datasets/PIIR/KGD-dataset — KGD dataset API metadata
[9] https://arxiv.org/html/2608.02738v1/x2.png — KGD architecture figure
[10] https://arxiv.org/html/2608.02738v1/x3.png — KGD 90-day results figure
[11] https://raw.githubusercontent.com/FuCongResearchSquad/KGD4REC/main/img/framework.png — KGD repository framework figure
