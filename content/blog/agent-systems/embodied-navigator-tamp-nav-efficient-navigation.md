---
title: "Embodied-Navigator는 VLM에게 3D 좌표 대신 ‘가리키기’를 시킨다"
date: "2026-08-20T23:30:19+09:00"
description: "Embodied-Navigator는 VLM이 2D 픽셀 waypoint만 고르게 하고, 선택적 추론·압축 메모리·Two-Level GRPO로 장기 시각 언어 내비게이션을 정렬하는 7B 정책이다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Embodied-Navigator
  - Vision-Language Navigation
  - Embodied AI
  - GRPO
  - Robotics
draft: false
---

로봇이 “복도를 지나 오른쪽 첫 문에서 멈춰라”라는 지시를 수행하려면, 언어를 장면 속 위치와 연결하고, 긴 이동 이력을 유지하며, 충돌 없이 실제 이동 명령으로 바꿔야 한다. 대형 Vision-Language Model(VLM)은 이미지와 언어의 대응에는 강하지만, 그 모델에게 바로 `30도 회전` 같은 원자 행동 열이나 정밀 3D 좌표 회귀를 시키면 사전학습에서 얻은 2D 시각 grounding과 실행 공간 사이에 틈이 생긴다.[1]

`Embodied-Navigator: Point, Think, Memorize, and Align for Efficient Navigation`은 이 틈을 **역할 분리**로 푼다. 정책은 네 개의 RGB 카메라 뷰 중 하나를 고르고 그 안의 2D 픽셀을 가리킨다. 깊이와 카메라 보정은 그 다음 단계에서 해당 픽셀을 3D waypoint로 투영하고, 저수준 SLAM controller가 이동을 실행한다. VLM은 자신이 익숙한 시각 선택과 언어-장면 정합에 집중하고, 기하·이동 제어는 결정론적 모듈에 남긴다.[1][2]

논문에서 이 시스템의 내부 이름은 **TAMP-Nav**(Think, Align, Memorize, Point)이며, 공개 저장소와 Qwen2.5-VL-7B 기반 BF16 checkpoint도 함께 나왔다. 다만 이는 일반 `transformers` pipeline에 이미 완결된 로봇 제품이 아니라, multi-view prompt·메모리·pixel-to-3D 투영·Habitat-Lab·Matterport3D 자산·controller를 함께 요구하는 연구용 navigation stack이다.[2][3]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/embodied-navigator-tamp-nav-architecture.webp">
    <img
      src="/images/blog/embodied-navigator-tamp-nav-architecture.webp"
      alt="Embodied-Navigator의 공식 구조도. 언어 지시와 다중 시점 이미지, 장기 토폴로지 메모리가 언어 모델에 입력되고, 모델은 필요할 때만 추론한 뒤 카메라 뷰와 2D 픽셀을 선택한다. 이 선택은 2D-3D registration을 거쳐 로봇 이동으로 실행된다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. 정책은 2D visual pointer로 행동을 출력하고, 기하 투영과 SLAM 실행을 별도 계층에 둔다.[1]
  </figcaption>
</figure>

## 무엇을 해결하려는가

기존 VLM 내비게이터가 겪는 첫 번째 문제는 행동 표현이다. 예컨대 저수준 turn/move action을 순서대로 내거나, 3D 좌표를 직접 회귀하려면 모델이 이미지에서 본 단서와 metric geometry 사이의 변환까지 암묵적으로 배워야 한다. 저자들은 이를 2D image-text 쌍 중심의 VLM 사전학습과 embodied action space의 불일치로 본다.[1]

두 번째는 언제 생각할지다. 모든 step에서 Chain-of-Thought(CoT)를 생성하면 복잡한 교차로나 문 앞에서는 도움이 될 수 있지만, 곧게 난 복도에서도 같은 비용을 낸다. 반대로 매 세 번째 step처럼 고정 주기로 추론하면 실제 의사결정 난이도와 계산량이 어긋난다. 긴 trajectory 전체의 visual feature를 보관하는 메모리 역시 attention을 희석하고 runtime 부담을 키운다.[1]

TAMP-Nav의 문제 정의는 그래서 “더 긴 reasoning을 어떻게 만들까”보다 **어떤 상태에서 reasoning·정밀 시각 정보·기하 실행을 남길 것인가**에 가깝다. 정책이 처리할 정보와 controller가 처리할 정보를 분리하고, critical node에는 풍부한 메모리를, 그 사이 구간에는 압축된 위치·방향·시간 단서를 남긴다.

## 핵심 아이디어 / 구조 / 동작 방식

### 1. Point: pixel waypoint를 선택하고, 3D 이동은 controller에 맡긴다

한 navigation step에서 정책은 360도를 덮는 네 개의 egocentric RGB view를 받는다. 먼저 가장 관련 있는 카메라 view를 택하고, 그 이미지 안에서 목표 waypoint를 나타내는 `(u, v)` 픽셀을 출력한다. depth map과 camera intrinsic은 이 선택 뒤에 3D local point로 투영되며, world coordinate 변환과 실제 주행은 SLAM controller가 맡는다.[1][2]

여기서 중요한 것은 “RGB-only robot”이라는 표현을 과대해석하지 않는 일이다. VLM의 입력은 RGB이지만, complete system은 pixel projection과 memory coordinate에 depth와 odometry를 쓴다. 즉 학습 정책이 직접 depth image를 읽지 않는다는 뜻이지, 시스템 전체가 metric sensor 없이 움직인다는 뜻은 아니다.[1][3]

### 2. Think + Memorize: 어려운 node를 anchor로, 평범한 이동은 STI로 압축한다

저자들은 9만 개 trajectory로 구성한 MultiNav-CoT를 만들었다. trajectory의 semantic relevance와 scene transition을 점수화하고, 공간 거리 기반 filtering과 temporal padding을 거쳐 약 30%의 key node만 CoT supervision 대상으로 고른다. CoT는 Gemini 2.5 Flash로 task phase localization, 현재 관측 분석, 미래 행동 reasoning을 나눠 생성한 뒤 하나의 서술로 합친다.[1]

실행 중 critical node는 visual evidence·reasoning summary·state를 포함한 high-fidelity **anchor**로 저장한다. 그 사이의 routine path는 모든 frame을 보존하는 대신 position·orientation·time을 부호화한 lightweight **Space-Time Indicator(STI)**로 남긴다. 이 alternating anchor–trajectory sequence가 landmark의 의미와 이동 경로의 연결성을 함께 보존하려는 Anchor-Trajectory Memory다.[1][2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/embodied-navigator-tamp-nav-selective-reasoning.webp">
    <img
      src="/images/blog/embodied-navigator-tamp-nav-selective-reasoning.webp"
      alt="SFT 모델과 RL 정렬 뒤 TAMP-Nav의 CoT trigger 밀도를 비교한 공식 heatmap. RL 정렬 뒤에는 복도 전체보다 교차로·문·목표 인접 영역에 reasoning trigger가 더 집중된다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 3. 저자들은 RL 뒤 reasoning trigger가 평범한 직선 구간보다 topology상 중요한 지점에 집중된다고 분석한다.[1]
  </figcaption>
</figure>

### 3. Align: 한 step의 안전·진행과 전체 경로의 성공을 같이 학습한다

SFT cold start 뒤에는 Qwen2.5-VL-7B 기반 정책을 Group Relative Policy Optimization(GRPO)으로 추가 정렬한다. local reward는 목표 접근, 충돌 회피, 정지 행동, reasoning의 실제 가치, 출력 format 준수를 반영한다. global reward는 task success, SPL 기반 경로 효율, reasoning density를 함께 본다.[1]

두 계층의 reward가 필요한 이유는 credit assignment 때문이다. 최종 성공만 보상하면 어느 중간 픽셀 선택과 어느 reasoning event가 유용했는지 흐려진다. 반대로 step reward만 보면 목적지에 도달하는 긴 계획을 놓칠 수 있다. TAMP-Nav는 complete trajectory 8개와 각 decision step의 candidate action 4개를 sample해 global advantage와 local advantage를 합치는 방식으로 둘을 연결한다.[1]

## 공개된 근거에서 확인되는 점

논문의 validation-unseen 결과에서 full TAMP-Nav는 R2R-CE에서 Success Rate(SR) 66.2, SPL 58.8, Navigation Error(NE) 3.85를 보고했다. RxR-CE에서는 SR 65.7, SPL 56.9, nDTW 72.4다. 아래는 TAMP-Nav의 핵심 지표를 압축해 정리한 것이다. 같은 표에서 R2R-CE SR·SPL의 직전 최고 비교값은 DualVLN의 64.3·58.5였고, RxR-CE SR은 NavFoM 64.4, nDTW는 DualVLN 70.0이었다. 저자 보고 기준의 benchmark 결과이므로, 실제 센서·지도·instruction 분포에 대한 일반 성능으로 바로 읽어서는 안 된다.[1][2]

| Val-Unseen 지표 | TAMP-Nav |
|---|---:|
| R2R-CE SR | <strong>66.2</strong> |
| R2R-CE SPL | <strong>58.8</strong> |
| RxR-CE SR | <strong>65.7</strong> |
| RxR-CE nDTW | <strong>72.4</strong> |

구성 요소별 통제 실험도 논문의 중심 근거다. SFT-only 조건에서 NavFoM-style metric waypoint 출력을 Pixel-to-3D로 바꾸면 SR이 R2R-CE에서 30.9→55.7, RxR-CE에서 20.6→46.2로 바뀐다. 같은 예산의 GRPO block에서는 trajectory-level advantage만 쓸 때보다 local advantage를 더한 full objective가 각각 59.3→66.2, 49.7→56.9를 기록했다. 이는 각 모듈이 전체 성능에 기여했다는 저자 내 통제 결과이지, 다른 dataset·controller에도 같은 폭으로 재현된다는 증명은 아니다.[1]

선택적 reasoning은 efficiency 주장도 갖고 있다. R2R-CE에서 dense CoT는 SR 66.8에 reasoning ratio 100%였고, adaptive trigger는 SR 66.2에 26.3%였다. 직선 corridor에 배정된 reasoning step 비율은 SFT의 38%에서 RL 후 11%로 줄었다고 저자들은 보고한다. 고정 1/3 주기 trigger는 CoT ratio 36.2%인데 SR 60.1로 더 낮았다.[1][2]

| R2R-CE reasoning 전략 | CoT ratio | SR |
|---|---:|---:|
| Dense CoT | 100.0% | 66.8 |
| Fixed interval (1/3) | 36.2% | 60.1 |
| Adaptive trigger | <strong>26.3%</strong> | 66.2 |

장기 경로용 memory 결과도 눈여겨볼 부분이다. expert path가 12.5m를 넘는 5,927개 trajectory subset에서 Anchor-Trajectory Memory는 SR 49.8을 기록했고, full history는 42.4, STI를 뺀 variant는 45.6이었다. 정보량을 무조건 늘리기보다 **의미 있는 anchor와 경로의 최소 geometry를 함께 보존하는 방식**이 이 benchmark에서는 더 낫다는 결과다.[1][2]

공개 범위는 초기 연구 릴리스에 가깝다. GitHub 저장소는 2026년 7월 26일 생성됐고, 8월 20일 기준 4 stars·0 forks이며 latest release와 tag는 없다. 저장소는 source/config/data/docs/script tree를 제공하고, Hugging Face에는 약 17GB BF16 safetensors 4 shard로 나뉜 `Embodied-Navigator-7B-GRPO` checkpoint가 있다. 그러나 GitHub API의 license는 `null`이고 model card도 checkpoint license가 아직 지정되지 않았다고 적는다. full MultiNav-CoT corpus와 licensed Habitat-Matterport3D asset도 checkpoint에 포함되지 않는다.[2][3]

## 실무 관점에서의 해석

Embodied-Navigator의 핵심은 로봇에 “더 큰 VLM”을 붙이는 방식보다, **VLM을 어느 abstraction에서 멈출지**를 정했다는 데 있다. 픽셀 pointing은 모델이 잘하는 visual grounding을 직접 쓰고, calibrated projection·collision handling·motion execution을 검증 가능한 controller로 넘긴다. 이는 VLM이 책임질 판단과 고전적인 robotics stack이 책임질 제약을 섞지 않는 설계다.

선택적 CoT와 anchor memory도 같은 원칙을 따른다. reasoning을 줄이는 것이 목표라기보다, reasoning이 의사결정을 바꿀 수 있는 순간에만 비용을 지불하고 그 결과를 나중에 재사용하는 구조다. 문·교차로·목표 탐색처럼 state transition이 큰 지점에는 detail을 남기고, 단순 이동에는 compact state만 남긴다는 생각은 warehouse·indoor delivery·UI navigation처럼 긴 horizon과 반복 동작이 공존하는 agent에도 옮길 수 있다.

다만 실제 배포의 위험은 7B checkpoint 자체보다 외부 의존성에서 나온다. 논문은 깊이 오차 `σ=0.2`에서 SR이 2.8 point 떨어졌다고 보고하고, 더 심한 depth error, odometry·SLAM drift, localization failure, dynamic environment에서는 손실이 더 커질 수 있다고 명시한다. GRPO reward도 simulator의 privileged progress·success·collision signal에 의존하며, 물리 로봇 online RL은 지원하지 않는다.[1]

따라서 이 프로젝트를 평가할 때는 benchmark SR만 보지 말고 다음 계약을 분리해야 한다.

| 점검 축 | 실제로 확인할 질문 |
|---|---|
| Perception·geometry | RGB view, depth, calibration, odometry가 현장 센서 조건에서 얼마나 안정적인가 |
| Controller boundary | pixel projection 이후의 collision avoidance·recovery·stop 판정은 누가 보장하는가 |
| Reasoning policy | trigger가 놓치는 visually non-salient한 critical state를 사람이 어떻게 감시·수정하는가 |
| Reproducibility | checkpoint 외에 Matterport3D 권한, benchmark episode, custom model class와 evaluation stack을 확보했는가 |
| License·release | code와 weight의 사용 조건이 명시되었고 release/tagged revision이 고정됐는가 |

요약하면 Embodied-Navigator는 embodied AI에서 유용한 interface 제안이다. VLM에게 3D world를 통째로 내재화하라고 요구하기보다, “무엇을 가리킬지·언제 생각할지·무엇을 기억할지”를 맡기고, metric execution과 안전 제약은 별도 계층에 둔다. 이 분리가 simulation leaderboard를 넘어 실제 navigation system에서도 유지되는지가 다음 검증 과제다.

## Sources

- [Embodied-Navigator arXiv abstract](https://arxiv.org/abs/2608.17512) — 논문 서지·초록·제출 정보
- [Embodied-Navigator arXiv HTML](https://arxiv.org/html/2608.17512v1) — 방법, Figure 1·3, benchmark·ablation·limitation
- [ZJU-OmniAI/Embodied-Navigator](https://github.com/ZJU-OmniAI/Embodied-Navigator) — 공개 code tree, 실행 경로, repository metadata
- [UnderTides/Embodied-Navigator-7B-GRPO](https://huggingface.co/UnderTides/Embodied-Navigator-7B-GRPO) — checkpoint 구성, intended use, 설치·평가 전제, license 상태
