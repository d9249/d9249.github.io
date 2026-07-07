---
title: "Instok3D는 3D 장면을 프리미티브가 아니라 객체 토큰으로 본다"
date: "2026-07-07T15:42:17"
description: "arXiv 2606.29513은 unposed multi-view 이미지에서 장면을 dense Gaussian 집합이 아니라 instance token과 anchor token으로 구성된 객체 중심 3D token group으로 재구성해, 렌더링·인스턴스 분할·편집·검색을 같은 표현 위에서 처리하려는 연구다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - Instok3D
  - 3D Tokenization
  - Gaussian Splatting
  - Object-Centric Representation
  - VGGT
  - Open-Vocabulary 3D
image: "/images/blog/instok3d-token-groups-thumbnail.webp"
draft: false
---

3D 재구성 연구에서 장면은 대개 point, voxel, Gaussian 같은 낮은 수준의 프리미티브 집합으로 표현된다. 렌더링 품질만 보면 이 방식은 강력하다. 문제는 사람이 장면을 다룰 때의 단위가 프리미티브가 아니라 **객체**라는 점이다. 의자를 지우고 싶고, 테이블을 옮기고 싶고, “sofa”를 검색하고 싶은데, 표현 자체는 수만 개의 작은 조각으로 흩어져 있으면 매번 후처리로 grouping을 해야 한다.

`Scenes as Objects, Not Primitives: Instance-Structured 3D Tokenization from Unposed Views`는 이 표현 불일치를 정면으로 다룬다. 논문의 핵심 주장은 단순하다. 3D 장면을 먼저 dense primitive로 만들고 나중에 객체를 복원하지 말고, 처음부터 장면을 **객체 중심 3D token group**으로 재구성하자는 것이다. 각 group은 객체 identity를 담는 instance token과, 로컬 geometry/appearance를 담는 anchor token들로 구성되고, anchor token은 다시 3D Gaussian으로 디코딩된다.

공개 페이지 기준 프로젝트명은 `instok3d`이고, arXiv v1은 2026년 6월 28일에 올라왔다. 확인 시점 기준 project page의 code 항목은 `TBD`라서, 이 글은 공개 논문·arXiv HTML·프로젝트 페이지에 보고된 구조와 수치만 기준으로 읽는 편이 안전하다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/instok3d-teaser.webp"
    alt="Official teaser showing instance-structured 3D token groups enabling novel view synthesis, instance segmentation, manipulation, and open-vocabulary retrieval"
    style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv Figure 1. 논문은 unposed multi-view 이미지를 바로 instance-structured 3D token group으로 바꾸고, 같은 group을 렌더링, 인스턴스 분할, 객체 편집, open-vocabulary 검색의 인터페이스로 쓴다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

기존 feed-forward 3D reconstruction은 unposed view에서 빠르게 geometry를 뽑는 데 집중해 왔다. DUSt3R, MASt3R, VGGT, pixel-aligned Gaussian 계열 방법들은 카메라 pose가 명시적으로 주어지지 않아도 dense point나 Gaussian을 예측할 수 있다. 하지만 이 결과는 대부분 **unstructured primitive set**이다. 각 primitive에 LSeg 같은 2D foundation feature를 붙이면 local annotation은 가능하지만, 객체 identity는 여전히 여러 primitive에 흩어진다.

이 논문이 보는 문제는 feature 부족이 아니라 **표현 단위의 mismatch**다. primitive는 로컬 geometry fragment일 뿐이고, 그 위에 semantic vector를 붙인다고 해서 “이 조각들이 하나의 의자다”라는 entity-level context가 자동으로 생기지는 않는다. 결국 query, editing, reasoning을 하려면 post-hoc segmentation, grouping, feature aggregation이 따라붙는다.

Instok3D의 방향은 반대다. 장면을 처음부터 객체 단위의 group으로 만들고, 렌더링에 필요한 세부는 group 내부 anchor token이 담당하게 한다.

| 표현 단위 | 기존 dense primitive 방식 | Instok3D의 방향 |
|---|---|---|
| 렌더링 | 많은 point/Gaussian이 직접 색과 geometry를 표현 | anchor token이 Gaussian을 생성 |
| 객체 identity | 후처리 grouping으로 복원 | instance/group token이 기본 단위 |
| semantic feature | primitive마다 고차원 feature를 반복 저장 | group-level embedding + anchor residual로 분해 |
| 편집/검색 | mask, grouping, optimization이 필요 | token group을 직접 선택해 조작 |

## 핵심 아이디어 / 구조 / 동작 방식

Instok3D는 unposed RGB 이미지 여러 장을 입력으로 받는다. 먼저 frozen 3D foundation model인 VGGT가 multi-view feature와 pointmap을 만든다. RGB patch와 pointmap cue를 VGGT feature에 더해 context token을 만들고, 여기서 anchor token과 group token을 디코딩한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/instok3d-method.webp"
    alt="Official architecture diagram for instance-structured 3D token groups"
    style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv Figure 2. VGGT 기반 context feature와 pointmap에서 anchor token을 만들고, anchor-grouping transformer가 group token과 anchor ownership을 학습한다. 같은 구조가 RGB reconstruction, instance mask rendering, semantic feature lifting에 같이 쓰인다.
  </figcaption>
</figure>

구조를 조금 더 풀면 세 단계다.

1. **Multi-view feature encoding**  
   VGGT가 view별 feature와 pointmap을 만든다. pointmap은 patch grid에 맞게 downsample되고, RGB/pointmap patch feature와 함께 context token이 된다.

2. **Anchor token decoding**  
   farthest point sampling으로 1,024개 anchor position을 고르고, image-anchor transformer가 multi-view context를 보면서 anchor token을 업데이트한다. 각 anchor token은 이후 32개의 3D Gaussian을 생성한다.

3. **Anchor-to-group assignment**  
   최대 100개의 learnable group token이 anchor token을 cross-attention으로 읽고, anchor와 group token의 dot-product softmax로 ownership을 정한다. 각 Gaussian은 부모 anchor의 group assignment를 상속한다.

여기서 중요한 점은 group token과 anchor token의 역할 분리다.

| 구성 요소 | 역할 |
|---|---|
| Instance / group token | 객체 단위 identity와 extent를 요약 |
| Anchor token | 객체 내부의 로컬 geometry와 appearance를 표현 |
| 3D Gaussian | anchor에서 생성되는 실제 renderable primitive |
| Assignment map | anchor와 Gaussian을 instance group에 연결 |
| Group-level semantic embedding | 객체 단위 open-vocabulary retrieval에 사용 |
| Anchor residual | group embedding만으로 부족한 로컬 semantic variation 보완 |

학습은 2D supervision으로 이루어진다. RGB rendering loss는 Gaussian reconstruction을 맞추고, rendered instance mask는 Hungarian matching + BCE/Dice loss로 group assignment를 맞춘다. 논문은 3D annotation 없이 학습된다고 표현하지만, 엄밀히는 2D RGB와 2D instance mask supervision이 필요하다. RealEstate10K 확장 실험에서는 SAM2 pseudo-label을 instance supervision으로 사용한다.

semantic feature lifting도 이 표현의 장점을 살린다. 기존 방식처럼 모든 Gaussian에 512차원 LSeg feature를 붙이지 않고, group마다 512차원 shared embedding을 두고 anchor에는 8차원 residual만 둔다. 렌더링 시에는 group assignment map과 residual map을 합쳐 per-pixel semantic feature를 복원한다. 이 덕분에 retrieval은 Gaussian 수가 아니라 instance group 수에 비례한다.

## 공개된 근거에서 확인되는 점

ScanNet 2-view 설정에서 Instok3D는 feature lifting 쪽이 특히 강하다. target view mIoU는 0.657로 Uni3R의 0.558, C3G의 0.513보다 높다. 더 흥미로운 것은 저장 비용이다. Uni3R은 compressed 64-dim feature를 Gaussian마다 저장해 8.4M scalar가 필요하고, LSM은 67.1M scalar가 필요하다. 반면 Instok3D는 group feature와 8-dim anchor residual을 써서 59.4K scalar로 줄인다.

| 방법 | Target mIoU ↑ | Target Acc. ↑ | PSNR ↑ | SSIM ↑ | LPIPS ↓ | #Semantic units | Feature size |
|---|---:|---:|---:|---:|---:|---:|---:|
| LSM | 0.512 | 0.795 | 24.24 | 0.821 | 0.222 | 131,072 | 67.1M |
| Uni3R | 0.558 | 0.827 | **25.53** | **0.873** | **0.138** | 131,072 | 8.4M |
| C3G | 0.513 | 0.783 | 23.89 | 0.770 | 0.285 | 2,048 | 1.0M |
| Instok3D | **0.657** | 0.789 | 25.28 | 0.771 | 0.238 | **<100** | **59.4K** |

이 표를 “모든 면에서 이겼다”로 읽으면 안 된다. novel-view reconstruction 품질에서는 Uni3R이 PSNR, SSIM, LPIPS 모두 더 좋다. Instok3D는 렌더링 품질을 극대화하는 모델이라기보다, reconstruction 품질을 어느 정도 유지하면서 representation unit을 객체 중심으로 바꾼 연구에 가깝다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/instok3d-reconstruction.webp"
    alt="Qualitative reconstruction comparisons with two context views"
    style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv Figure 3. 2-view reconstruction qualitative 결과. Instok3D는 compact token group 표현을 쓰기 때문에 pixel-aligned Gaussian baseline과 완전히 같은 렌더링 성격은 아니지만, target view reconstruction을 실용적인 수준으로 유지한다.
  </figcaption>
</figure>

8-view class-agnostic instance segmentation에서는 메시지가 더 명확하다. Instok3D는 feed-forward 방식인데도 per-scene optimization baseline인 Gaussian Grouping, ObjectGS보다 높은 AP를 보고한다.

| 유형 | 방법 | AP ↑ | AP50 ↑ | AP25 ↑ | PSNR ↑ | SSIM ↑ | LPIPS ↓ |
|---|---|---:|---:|---:|---:|---:|---:|
| Per-scene optimization | Gaussian Grouping | 0.139 | 0.288 | 0.440 | 23.20 | 0.715 | 0.325 |
| Per-scene optimization | ObjectGS | 0.178 | 0.337 | 0.489 | **24.34** | **0.733** | **0.310** |
| Feed-forward + optimization | IGGT + LUDVIG | 0.122 | 0.265 | 0.442 | 22.75 | 0.712 | 0.323 |
| Feed-forward | Instok3D | **0.235** | **0.438** | **0.564** | 22.41 | 0.709 | 0.355 |

여기서도 trade-off는 분명하다. segmentation AP는 가장 높지만 reconstruction PSNR/SSIM/LPIPS는 ObjectGS가 더 좋다. 다만 ObjectGS는 per-scene optimization 계열이고, Instok3D는 single forward pass로 object grouping을 직접 뽑는다는 차이가 있다. 논문이 강조하는 “native instance structure가 post-hoc grouping보다 좋은 inductive bias가 될 수 있다”는 주장은 이 표에서 나온다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/instok3d-instance-segmentation.webp"
    alt="Class-agnostic instance segmentation comparisons"
    style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv Figure 5. class-agnostic novel-view instance segmentation qualitative 결과. 논문은 경쟁 방법들이 큰 표면이나 복잡한 장면에서 fragmented boundary를 보이는 반면, token group 기반 결과가 더 일관된 instance decomposition을 만든다고 설명한다.
  </figcaption>
</figure>

feature lifting qualitative 결과도 같은 방향이다. group-level embedding이 객체 단위 semantic carrier가 되고, anchor residual이 로컬 variation만 보완하므로 object boundary가 더 깔끔하게 유지된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/instok3d-open-vocab-segmentation.webp"
    alt="Open-vocabulary feature lifting and novel view segmentation with LSeg features"
    style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv Figure 4. LSeg feature를 token group 구조에 lifting한 open-vocabulary novel-view segmentation 예시. primitive마다 feature를 붙이는 대신 객체-level feature를 중심에 두는 설계가 핵심이다.
  </figcaption>
</figure>

Ablation도 설계 의도를 뒷받침한다. reconstruction을 먼저 학습하고 segmentation을 나중에 학습하는 sequential variant는 AP가 0.032까지 떨어진다. segmentation warm-up을 빼도 AP가 0.081로 낮아진다. 논문은 reconstruction과 grouping이 따로 최적화되는 문제가 아니라, geometry가 어느 정도 안정된 뒤 segmentation supervision이 들어와야 group structure가 제대로 생긴다고 해석한다.

| 학습 방식 | PSNR ↑ | SSIM ↑ | LPIPS ↓ | AP ↑ | AP50 ↑ | AP25 ↑ |
|---|---:|---:|---:|---:|---:|---:|
| Sequential | 23.65 | 0.737 | 0.348 | 0.032 | 0.097 | 0.315 |
| w/o warm-up | 23.09 | 0.732 | 0.329 | 0.081 | 0.186 | 0.415 |
| Joint + warm-up | **25.11** | **0.769** | **0.240** | **0.193** | **0.377** | **0.529** |

feature decomposition ablation도 간단하다. anchor residual만 쓰면 target mIoU 0.524, group feature만 쓰면 0.635, group + anchor를 같이 쓰면 0.657이다. 즉 객체-level shared feature만으로도 꽤 강하지만, local variation을 담는 residual이 조금 더 보탠다.

## 객체 단위 인터페이스가 생기면 무엇이 달라지나

Instok3D에서 가장 실용적으로 보이는 부분은 수치보다 interface다. group이 곧 객체라면, 편집은 group을 고르고 그 group에 속한 token/Gaussian을 조작하는 문제가 된다. 논문은 group-wise rendering, removal, insertion, rigid transformation을 예시로 보여 준다. 별도 mask를 그리거나, per-scene optimization을 돌리거나, 2D segmentation을 다시 3D로 merge하지 않는다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/instok3d-token-manipulation.webp"
    alt="Instance-level token manipulation results including rendering, transform, insertion, and removal"
    style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv Figure 6. token group 조작 예시. 객체별 group을 선택해 rendering, transform, insertion, removal을 수행한다. 논문은 주변 객체와 배경이 영향을 받지 않는 localized edit를 강조한다.
  </figcaption>
</figure>

검색도 마찬가지다. dense Gaussian 131,072개를 대상으로 text feature matching을 하는 대신, 100개 미만의 group embedding을 대상으로 retrieval을 하면 된다. “sofa”, “toilet” 같은 query가 들어오면 해당 group을 찾고, 그 group이 담당하는 Gaussians를 렌더링한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/instok3d-retrieval.webp"
    alt="Open-vocabulary 3D instance retrieval examples"
    style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv Figure 7. open-vocabulary 3D instance retrieval 예시. retrieval complexity가 primitive 수가 아니라 instance group 수에 비례한다는 점이 이 표현의 실용적 장점이다.
  </figcaption>
</figure>

부록 실험도 흥미롭다. RealEstate10K 2-view reconstruction에서는 SAM2 pseudo-label을 supervision으로 써서 C3G보다 높은 PSNR/SSIM/LPIPS를 보고한다. MipNeRF360 zero-shot transfer에서도 ScanNet으로 학습한 모델을 fine-tuning 없이 평가해 Uni3R보다 좋은 수치를 낸다.

| 평가 | 비교 | PSNR ↑ | SSIM ↑ | LPIPS ↓ |
|---|---|---:|---:|---:|
| RealEstate10K 2-view | C3G | 22.39 | 0.713 | 0.259 |
| RealEstate10K 2-view | Instok3D | **22.85** | **0.746** | **0.230** |
| MipNeRF360 zero-shot | Uni3R | 14.58 | 0.317 | 0.472 |
| MipNeRF360 zero-shot | Instok3D | **16.52** | **0.408** | **0.439** |

이 결과는 “객체 중심 구조가 항상 렌더링 성능을 이긴다”라기보다는, anchor-group 구조가 다른 scene distribution으로 넘어갈 때 더 transferable한 prior가 될 수 있다는 신호로 보는 편이 맞다.

## 실무 관점에서의 해석

나는 이 논문을 3D reconstruction 논문이면서 동시에 **3D 표현의 API를 바꾸는 논문**으로 읽는 편이 맞다고 본다. 지금까지 많은 3D representation은 렌더링 엔진에는 친절했지만, agent나 robot이 다루기에는 불친절했다. 사람이나 로봇이 원하는 조작은 “저 Gaussian 3,912번부터 4,120번까지 옮겨라”가 아니라 “왼쪽 의자를 옮겨라”에 가깝기 때문이다.

Instok3D식 token group은 3D scene을 LLM, robotics planner, generative model에 넘길 때 더 자연스러운 중간 표현이 될 수 있다. LLM은 수만 개의 primitive가 아니라 수십 개의 entity token을 보고 reasoning할 수 있고, 필요한 경우 anchor token을 통해 세부 geometry를 참조할 수 있다. 로봇 쪽에서는 “pick up the chair” 같은 instruction을 group embedding과 연결하고, planning 과정에서 객체 removal/translation 같은 mental simulation을 할 수 있다.

다만 아직은 연구 단계다.

- 평가가 주로 bounded indoor scene에 집중되어 있다.
- 최대 group 수가 100으로 고정되어 있어 large-scale/outdoor scene에서는 설계를 다시 봐야 한다.
- 현재 framework는 static scene을 가정한다.
- single group token 하나가 복잡한 객체의 semantic variation을 충분히 담을지는 더 봐야 한다.
- project page 기준 code가 아직 TBD라 재현성과 실제 사용성은 확인할 수 없다.

그래도 방향은 분명히 좋다. 3D representation의 다음 병목은 단순히 더 선명한 novel-view rendering만이 아니라, 장면을 **조작 가능한 객체 단위로 노출하는 것**일 가능성이 크다. Instok3D는 이 방향에서 “객체를 후처리 결과가 아니라 representation의 1차 단위로 만들면 무엇이 가능한가”를 꽤 설득력 있게 보여 준다.

Sources: https://arxiv.org/abs/2606.29513, https://arxiv.org/html/2606.29513v1, https://arxiv.org/pdf/2606.29513v1, https://yoomimi.github.io/instok3d
