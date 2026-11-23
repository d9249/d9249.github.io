---
title: "AVM: 3D 모델을 만들지 않고도 같은 장소로 돌아오는 비디오 모델"
date: "2026-11-23T19:11:02"
description: "Meta와 옥스퍼드의 Autoregressive View Model은 카메라 자세와 시각으로 관측을 찾고, 생성한 화면까지 다시 참조한다. 재방문 일관성의 이득과 3D 복원·실시간 서빙의 한계를 구분한다."
author: "Sangmin Lee"
category: "video-generation"
tags:
  - AVM
  - World Models
  - Novel View Synthesis
  - Video Diffusion
  - Context Retrieval
draft: false
---

카메라가 거실을 한 바퀴 돌아왔을 때, 아까 본 소파와 탁자는 그대로 있어야 한다. <strong>Autoregressive View Model(AVM)</strong>은 방의 메시를 만드는 대신, 이미 봤거나 생성한 화면을 찾아 다음 클립의 조건으로 쓴다.[1][2]

Meta와 옥스퍼드대 연구진은 같은 인터페이스로 새 시점 생성, 동작의 다른 시점 재현, 장면 재방문을 시도했다.[2]
다만 **비슷한 화면으로 돌아왔다**는 결과와 **실제 3D 구조를 정확히 복원했다**는 결과는 다르다. 아래 수치는 11월 20일 개정된 기술 보고서 v2를 기준으로 한다.[3]

<figure>
  <div class="blog-figure-media" style="overflow-x:auto;overflow-y:hidden;">
    <img src="/images/blog/avm-view-stream-overview.webp" alt="입력 영상과 생성 이력을 참고해 새 시점을 만들고, 그 결과를 다시 이력에 추가하는 AVM" style="min-width:760px;max-width:none;width:100%;" />
  </div>
  <figcaption>논문 그림 1. 입력과 생성 이력이 다음 클립의 문맥이 된다.[2] 좁은 화면에서는 좌우로 밀거나 눌러 확대할 수 있다.</figcaption>
</figure>

## 이미 본 곳은 재현하고, 보지 못한 곳은 생성한다

AVM이 받는 조건은 **이미지나 비디오, 카메라 자세, 장면 시각**이다.[2]
장면 시각을 고정하면 카메라가 이동해도 같은 순간을 그린다.[2]
시각을 진행시키면 인물이나 물체의 동작도 이어진다.[1][2]
참조와 목표 시야가 겹치는 부분은 관측에 맞춰 재현하고 나머지는 그럴듯하게 채운다.[2]
둘을 가르는 별도의 모드 전환은 없다.[1]

참조 슬롯 N개가 목표 클립 하나의 조건이 된다. 저자들은 이를 **N-in-1-out**이라고 부른다.[2]
같은 장면의 일반 이미지·클립에서는 시각을 지우고, 동기화 클립은 목표 시각에 맞춘다.[2]
참조와 목표의 잠재 토큰을 한 시퀀스에 놓고, flow matching으로 노이즈에서 영상을 복원하는 방향을 학습한다.[2]
미터 스케일 카메라의 이동은 RoPE, 회전은 픽셀에 맞춘 카메라 광선 임베딩, 시각은 사인 위치 임베딩으로 구분해 전달한다.[2]
따라서 명시적 3D 자산을 만들지 않는다는 말이 **카메라 보정이나 기하 정보 없이 동작한다**는 뜻은 아니다.[2]

<figure>
  <div class="blog-figure-media" style="overflow-x:auto;overflow-y:hidden;">
    <img src="/images/blog/avm-view-stream-modeling.webp" alt="시각이 없는 이미지·클립과 목표 시각에 맞춘 동기화 클립을 받아 목표 클립 하나를 만드는 N-in-1-out 구조" style="min-width:760px;max-width:none;width:100%;" />
  </div>
  <figcaption>그림 3. 동기화 입력은 목표 시각에 맞춘다.[2] 좁은 화면에서는 좌우로 밀거나 눌러 확대할 수 있다.</figcaption>
</figure>

## 전체 이력은 저장하되 이번 블록에 쓸 화면만 고른다

입력은 **prefill**, 생성 결과는 **history**로 저장한다.[2]
매 블록은 여기서 다음 세 종류의 문맥을 쓴다.[2]

- **고정 참조(sink):** 처음에 주어진 화면 일부를 남겨 장면의 외형을 붙든다.[2]
- **검색 참조(retrieved):** 시야가 겹치거나 시각이 맞는 뷰를 검색한다.[2]
- **움직임 문맥(motion):** 직전 잠재 블록으로 새 클립과의 경계를 잇는다.[2]

위치가 가까운 카메라만 고르면 앞으로 보이는 화면은 잘 가져와도, 시점을 돌렸을 때 반대 방향의 화면은 놓칠 수 있다. 기본 검색은 목표 카메라 시야 안에 놓은 3D 표본이 후보 카메라에 얼마나 들어오는지 보고, 부족한 방향의 뷰를 보충한다.[2]
이 3D 표본은 **검색에 쓰는 기하 프록시**이지 복원한 장면 표면이 아니다.[2]
부록 E의 선택 장면에서 시야 표본 커버리지는 최근접 방식 <strong>73.0%</strong>, 방향 보충 방식 <strong>84.4%</strong>였다.[2]
이는 영상 정확도가 아니라 검색 범위의 지표다.[2]

<figure>
  <div class="blog-figure-media" style="overflow-x:auto;overflow-y:hidden;">
    <img src="/images/blog/avm-view-stream-retrieval.webp" alt="전체 관측 저장소에서 고정 참조, 검색 참조, 직전 움직임만 골라 새 뷰를 생성하는 문맥 관리도" style="min-width:540px;max-width:none;width:100%;" />
  </div>
  <figcaption>논문 그림 4. 전체 이력과 한 번에 참조하는 문맥은 다르다.[2] 좁은 화면에서는 좌우로 밀거나 눌러 확대할 수 있다.</figcaption>
</figure>

인과 모델은 선택한 과거 블록의 KV를 복원 단계마다 재사용한다.[2]
새 블록을 완성한 뒤에는 **추가 순전파 1회**로 그 블록의 KV를 캐시에 넣는다.[2]
오래된 KV는 CPU로 옮겼다가 선택될 때 GPU로 가져올 수 있다.[2]
이 설계가 제한하는 것은 **한 블록이 보는 문맥의 길이**다. 전체 이력 저장량, 검색 비용, CPU↔GPU 전송 시간까지 일정해지는 것은 아니다.[2]

## 50단계에서 4단계로: 실시간 실측과는 다르다

저자들은 사전학습된 **140억 파라미터 이미지→비디오 확산 트랜스포머**를 미세조정했다.[2]
학습 데이터는 카메라 자세와 텍스트가 있는 장면 약 **600만 개**, 카메라 조건 없이 쓰는 비라벨 클립 약 **200만 개**다.[2]
초판의 기반 모델 설명은 Wan2.1-I2V-14B를 인용했다.[5]
v2에서는 이 인용이 빠졌지만 모델이 바뀌었다고 확인된 것은 아니다.[2]

먼저 양방향 기반 모델을 학습하고, 깨끗한 이전 블록을 보여 주는 teacher forcing과 노이즈가 있는 이전 블록을 쓰는 diffusion forcing을 섞어 인과 모델을 초기화한다.[2]
이후 길이를 늘려 가며 모델이 직접 생성한 롤아웃에 분포 매칭 증류와 적대적 손실을 적용한다.[2]
이때 증류에 쓰는 두 점수 모델에도 추론과 같은 종류의 고정·검색·움직임 문맥을 준다.[2]

기반 모델은 **50회 Euler 단계**를 쓰고, 인과 모델은 CFG를 모델에 접어 넣은 **4회 복원 단계**를 쓴다.[2]
두 모델은 블록 길이와 문맥 계산 방식도 다르므로 단계 수의 비율이 실제 가속률은 아니다.[2]
보고서에는 대화형 서빙을 판정할 종단 지연이나 FPS가 제시되지 않았다.[2]

## ‘같은 장소’는 무엇과 비교했나

논문은 출력 해상도가 다른 모델의 영상과 참조를 448×448로 리사이즈·중앙 크롭해 채점했다.[2]
원본 해상도는 모델마다 달랐다.[1]
추론 예산은 통일하지 않았다.[2]
핵심은 **앞의 두 행은 실제 참조와, 마지막 행은 모델이 앞서 생성한 화면과** 비교한다는 점이다.[2]

<table style="width:100%;min-width:0;table-layout:fixed;">
  <thead>
    <tr><th scope="col" style="width:39%;min-width:0;padding:8px 6px;overflow-wrap:anywhere;">평가</th><th scope="col" style="width:23%;min-width:0;padding:8px 6px;">AVM</th><th scope="col" style="width:38%;min-width:0;padding:8px 6px;overflow-wrap:anywhere;">비교 모델</th></tr>
  </thead>
  <tbody>
    <tr><td style="min-width:0;padding:8px 6px;">희소 이미지 복원</td><td style="min-width:0;padding:8px 6px;">24.14</td><td style="min-width:0;padding:8px 6px;overflow-wrap:anywhere;">SEVA 23.91</td></tr>
    <tr><td style="min-width:0;padding:8px 6px;">동기화 영상 복원</td><td style="min-width:0;padding:8px 6px;">21.16</td><td style="min-width:0;padding:8px 6px;overflow-wrap:anywhere;">ReCamMaster 13.53</td></tr>
    <tr><td style="min-width:0;padding:8px 6px;">생성 장면 재방문</td><td style="min-width:0;padding:8px 6px;">28.04</td><td style="min-width:0;padding:8px 6px;overflow-wrap:anywhere;">DreamX-World 12.29</td></tr>
  </tbody>
</table>

단위는 PSNR(dB), 출처는 표 3~5다. 희소 복원에는 DL3DV 141장면에서 카메라 자세가 주어진 이미지 7장을 사용한다.[2]
MultiCam 24장면에서는 한 카메라의 영상으로 다른 카메라의 동기화 프레임 81장을 예측한다.[2]
재방문은 WorldScore 정적 장면 26개에서 721프레임 경로를 돌며 위치와 좌우 방향이 가까운 **생성 프레임끼리** 비교한다.[2]

검색을 끄면 재방문 PSNR은 **28.04에서 11.13**으로 떨어졌다(표 6).[2]
양방향 기반 모델은 **28.53**이다. 인과 모델은 초기 **10.12**에서 롤아웃 후학습으로 **28.04**를 회복했다.[2]
인과 구조 자체가 기반 모델보다 재방문에 유리해졌다는 증거는 아니다.[2]
같은 표에서 최종 인과 모델이 기반 모델보다 앞선 지표는 다섯 개 중 FID 하나다(18.69 대 19.86, 낮을수록 좋음).[2]
또한 같은 재방문 표에서 연속 프레임의 재투영 오차를 쓰는 3D 일관성 점수는 **AVM 53.13, LingBot-World 57.00**이다. 픽셀 재현이 좋아진 것과 기하 지표 전체에서 앞선 것은 별개다.[2]

<figure>
  <img src="/images/blog/avm-view-stream-persistence.webp" alt="희소 이미지 복원, 동기화 영상 재현, 장기 재방문을 각각 다른 비교 모델과 나란히 놓은 AVM 예시" style="width:100%;max-width:560px;height:auto;display:block;margin:auto;" />
  <figcaption>논문 그림 6. 위부터 희소 복원, 동기화 영상, 재방문 예시다.[2] 그림을 누르면 확대된다.</figcaption>
</figure>

## 카메라 제어는 강하지만 텍스트 지시와 움직임에는 손해가 있다

시작 이미지 1장으로 생성할 때 WorldScore 정적 장면의 카메라 제어는 **AVM 70.67, LingBot-World 3.91**이었다.[2]
월드 모델 간 비교에서는 앞섰지만, 뷰 합성 모델 GEN3C의 **83.74**보다는 낮았다.[2]
반면 별도 20장면에서의 텍스트 정렬은 **39.65 대 LingBot-World 54.07**로, AVM이 비교한 세 월드 모델보다 낮았다.[2]
동적 장면에서도 움직임 정확도는 네 모델 중 두 번째였다.[2]
그러나 움직임이 있다고 분류된 영상 비율은 <strong>24.88%</strong>로 가장 낮았다.[2]

AVM에서 눈여겨볼 부분은 ‘3D가 필요 없다’가 아니라 **방금 보고 있는 화면뿐 아니라 예전에 본 화면을 다시 불러오는 인터페이스**다. 카메라 경로가 중요하고 참조 영상이 있는 작업에는 유용한 설계다. 반대로 편집 가능한 3D 자산, 물리적으로 정확한 상태, 또는 보지 못한 영역의 사실성을 요구하는 작업에서는 이 평가로 충분하지 않다.[2]

[공식 카메라 경로 예시](https://autoregressive-view-model.github.io/main.html#camera-control)와 [장거리 재방문 예시](https://autoregressive-view-model.github.io/main.html#long-rollouts)를 비교해 볼 수 있다.[1]
공개 저장소에는 프로젝트 페이지의 코드와 미디어가 있다.[4]
이 경로들에서 모델 구현이나 가중치 다운로드는 확인되지 않았다.[1][2][4]

그림 1·3·4·6은 Zhou 등의 *Autoregressive View Model* v2에 실렸다.[2]
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)에 따라 그림을 추출해 WebP로 변환했다.[3]

## Sources

[1] https://autoregressive-view-model.github.io/main.html — AVM: official project page and media demos
[2] https://arxiv.org/html/2611.23417v2 — Autoregressive View Model v2: technical report
[3] https://arxiv.org/abs/2611.23417 — arXiv version and metadata
[4] https://github.com/autoregressive-view-model/autoregressive-view-model.github.io/blob/119312c9dd36a826ac3602563dc02f421635bd56/README.md — Pinned official website repository README
[5] https://arxiv.org/html/2611.23417v1 — Technical report v1 (historical backbone citation)
