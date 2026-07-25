---
title: "ReferTrack은 ‘누구’를 먼저 가리킨 뒤 ‘어디로’ 갈지 결정한다"
date: "2026-07-25T22:50:59+09:00"
description: "ReferTrack은 자연어로 지정된 보행자를 indexed bounding box 중 하나로 먼저 고르는 Refer-CoT와, 선택한 box의 시간적 궤적을 보존하는 TVBI memory를 결합해 단일 전방 카메라 embodied visual tracking을 다루는 4B VLA 정책이다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - ReferTrack
  - Embodied AI
  - Vision-Language-Action
  - Visual Tracking
  - Robotics
image: "/images/blog/refertrack-architecture.webp"
draft: false
---

사람을 따라가는 로봇에게 “검은 티셔츠를 입은 사람을 따라가”라고 지시하는 일은, 단순한 사람 검출이나 경로 계획만으로 끝나지 않는다. 혼잡한 장면에서는 비슷한 옷차림의 사람이 여러 명일 수 있고, 목표가 잠시 가려지거나 전방 카메라의 좁은 시야 밖으로 벗어날 수 있다. 잘못된 사람을 한 번 따라가기 시작하면 이후의 trajectory가 아무리 매끄러워도 작업 자체는 실패한다.

`ReferTrack: Referring Then Tracking for Embodied Visual Tracking`은 이 문제를 **대상을 먼저 명시적으로 지목한 뒤 추적한다**는 두 단계로 나눈다. 기존 vision-language-action(VLA) policy가 target identification과 waypoint prediction을 하나의 latent reasoning 흐름에 묶는 경우가 많았다면, ReferTrack은 현재 화면의 보행자 bounding box에 index를 붙이고 model이 그중 하나를 단일 `Refer-CoT` token으로 선택하게 한다. 그 선택을 근거로 waypoint를 생성하며, 이전에 고른 target box는 temporal memory로 보존한다.

논문은 단일 전방 RGB camera만 쓰는 EVT-Bench에서 single-target, distracted, ambiguity split의 success rate를 각각 **89.4%, 73.3%, 74.1%**로 보고한다. Unitree Go2 사족보행 로봇과 Unitree G1 humanoid robot에서의 real-world qualitative deployment도 함께 보인다. 다만 코드 링크가 있는 것과 실행 가능한 release가 있는 것은 다르다. 공개 GitHub repository는 현재 model checkpoint·evaluation code·dataset·training code·data engine을 모두 TODO로 남긴 초기 project surface다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/refertrack-architecture.webp">
    <img
      src="/images/blog/refertrack-architecture.webp"
      alt="ReferTrack 구조도. 자연어 instruction과 전방 RGB 입력에서 candidate pedestrian bounding box catalog를 만들고, Refer-CoT가 한 target box를 선택한 뒤 TVBI 기반 history와 action head가 추적 waypoint를 예측한다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2를 로컬 최적화한 공식 구조도. ReferTrack은 현재 frame의 후보 중 목표를 먼저 고르고, 그 target의 과거 bbox를 시각 history에 다시 넣어 다음 행동을 조건화한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

Embodied Visual Tracking(EVT)의 입력은 자연어 target description과 시간이 흐르며 들어오는 egocentric RGB observation이다. 로봇은 target을 1~3m 거리에서 시야 안에 유지하도록 이동해야 한다. 이 task는 두 능력이 결합돼야 한다.

1. **Target identification**: “검은 티셔츠와 긴 바지를 입은 사람”이 현재 detection 가운데 어느 사람인지 식별한다.
2. **Trajectory planning**: 목표와 거리·시야를 유지하면서 충돌 없이 어디로 움직일지 결정한다.

기존 pipeline은 detection/grounding model로 사람을 찾고 별도 planner가 뒤따르는 식으로 역할을 나누거나, 반대로 VLA가 identification과 planning을 모두 latent token 안에서 처리하게 했다. 후자는 end-to-end라는 장점이 있지만, model이 왜 특정 사람을 목표로 골랐는지와 그 선택을 어떻게 supervision할지가 모호해질 수 있다.

ReferTrack의 선택은 target identification을 화면 공간의 **제한된 객관식 문제**로 바꾸는 것이다. detector가 현재 보행자를 찾으면 `<ped_1>`, `<ped_2>`처럼 index가 붙은 candidate catalog를 만들고, model은 instruction과 image history를 보고 그중 하나 또는 `<NO_EXIST>`를 출력한다. 즉 “누구를 따라가야 하는가”가 bbox와 직접 연결된 one-token decision이 된다.

| latent reasoning에만 의존할 때 | ReferTrack의 image-grounded interface | 실무적 의미 |
|---|---|---|
| target 선택의 근거가 내부 spatial token에 머물 수 있음 | `Refer-CoT`가 indexed bbox 하나를 명시적으로 선택 | target selection을 직접 annotation·audit할 수 있음 |
| target이 안 보이는 경우가 ambiguity로 남기 쉬움 | 항상 `<NO_EXIST>` 후보를 포함 | 보이지 않는 target을 임의의 사람으로 오인하는 경로를 줄임 |
| 이전 frame의 target identity가 행동 history에 묻힘 | bbox queue를 TVBI token으로 history에 주입 | 가림·partial view 뒤에도 같은 사람의 motion cue를 보존 |
| action loss가 identification 오류를 충분히 드러내지 못함 | trajectory·refer·text loss를 분리 | “잘 움직였지만 다른 사람을 따른” 실패를 분해할 수 있음 |

## 핵심 구조: Refer-CoT 뒤에 TVBI memory를 붙인다

### 1. indexed bbox catalog에서 target을 고른다

현재 frame에서 YOLO11 + ByteTrack detector/tracker가 보행자 bbox를 만들고, candidate는 area 기준 top-K로 정렬된다. 각 항목은 special identifier token과 normalized bbox feature로 model에 들어간다. 언어 instruction, visual history, candidate catalog를 받은 LLM은 첫 번째 forward pass에서 `<ped_k>` 또는 `<NO_EXIST>` 중 하나를 `Refer-CoT`로 출력한다.

이 결정은 자유 형식 chain-of-thought가 아니다. **현재 scene의 image-space entity를 하나 선택하는 단일 token classification**이라서 ground-truth bbox index로 직접 학습할 수 있다. target이 camera에서 사라졌다면 all-zero box와 함께 `<NO_EXIST>`를 예측하도록 설계한 점도 중요하다.

선택 뒤 두 번째 pass는 Refer-CoT를 conditioning prefix로 받고 action token을 만들며, 별도의 MLP action head가 여러 waypoint로 해석한다. 즉 policy 안에서 “누구”와 “어디로”는 연결돼 있지만, 확인 가능한 경계가 있다.

### 2. 선택한 bbox를 시간적 target memory로 만든다

현재 frame의 target을 맞혔다고 해서 다음 frame에도 target identity가 유지되는 것은 아니다. ReferTrack은 선택된 bbox를 FIFO queue에 저장하고, 과거 visual frame 사이에 **Temporal-Viewpoint-Bbox Indicator(TVBI)** token을 삽입한다. TVBI는 기존 temporal-viewpoint indicator에 target geometry embedding을 더한 형태다.

여기에는 의도적인 비대칭이 있다. 과거 history에는 Refer-CoT가 선택한 bbox를 넣되, **현재 frame의 fine token에는 bbox를 직접 주입하지 않는다.** model이 현재 화면에서 target을 다시 spatially ground하도록 강제하면서도, 과거의 target motion과 visibility 상태는 memory로 활용하게 하려는 설계다. 과거 frame에서 target이 보이지 않으면 `[0, 0, 0, 0]` absence sentinel을 넣어 “좌표가 없는 것” 자체도 구분한다.

### 3. Refer-QA로 target choice를 별도 강화한다

navigation trajectory만으로 target grounding을 충분히 가르치기 어려울 수 있다. 저자들은 SYNTH-PEDES person ReID dataset을 바탕으로 2~3명의 보행자 crop을 background에 합성하고, query description에 맞는 catalog index 또는 `<NO_EXIST>`를 고르게 하는 **Refer-QA** data를 만들었다.

학습 data는 EVT-Bench/Habitat 3.0에서 curated한 navigation trajectory 130만 개와 Refer-QA 130만 개로, 1:1 mix로 supervised fine-tuning한다. Stage 1에서는 general multimodal QA로 vision projector만 맞추고, Stage 2에서는 vision encoder를 고정한 채 LLM·projector·action head를 함께 업데이트한다. 같은 catalog interface를 쓰기 때문에 static referring supervision이 online tracking의 identity selection에 전달된다는 것이 논문의 핵심 가설이다.

## 공개된 근거에서 확인되는 점

### 단일 camera EVT-Bench 결과

논문은 forward-facing camera 하나만 쓰는 single-view protocol을 main comparison으로 둔다. 각 cell은 Success Rate(SR) / Tracking Rate(TR) / Collision Rate(CR)이며, reported multi-camera result는 외부 참고로만 제시돼 single-view 순위와 섞어 읽으면 안 된다.

| 방법 | Single-Target (SR / TR / CR) | Distracted (SR / TR / CR) | Ambiguity (SR / TR / CR) |
|---|---:|---:|---:|
| TrackVLA | 85.1 / 78.6 / 1.7 | 57.6 / 63.2 / 5.8 | 50.2 / 63.7 / 17.1 |
| TrackVLA++ | 86.0 / 81.0 / 2.10 | 66.5 / 68.8 / 4.71 | 51.2 / 63.4 / 15.9 |
| VLingNav | 88.4 / 81.2 / 2.1 | 67.7 / 73.5 / 5.5 | – |
| **ReferTrack** | **89.4 / 92.5 / 1.6** | **73.3 / 81.8 / 7.6** | **74.1 / 85.7 / 7.7** |

ReferTrack은 특히 identification이 까다로운 distracted와 ambiguity split에서 SR이 크게 오른다고 보고한다. 다만 CR은 모든 split에서 항상 최저가 아니다. 예를 들어 distracted split에서 ReferTrack CR 7.6은 TrackVLA++의 4.71보다 높다. 따라서 headline을 “완전히 더 안전한 robot policy”로 읽기보다, **제시된 single-view benchmark에서 target을 맞히고 유지하는 성능을 크게 끌어올린 방법**으로 한정하는 것이 정확하다.

### ablation은 bottleneck이 target selection임을 보여 준다

Distracted Tracking single-view ablation은 method의 역할 분리를 수치로 드러낸다.

| Variant | SR | TR | CR | full model 대비 |
|---|---:|---:|---:|---|
| ReferTrack (YOLO11-X) | 73.3 | 81.8 | 7.6 | 기준 |
| TVBI + oracle ground-truth bbox | 81.5 | 84.7 | 3.6 | SR +8.2, 완벽한 identification의 상한 |
| TVBI 제거 | 70.4 | 80.8 | 7.5 | SR -2.9 |
| Refer-CoT와 TVBI 모두 제거 | 55.7 | 71.4 | 9.4 | SR -17.6 |

oracle bbox variant와 full model의 8.2 point SR 차이는 trajectory planning보다 **target identification**에 더 큰 여지가 남았다는 저자들의 해석을 뒷받침한다. TVBI만 빼도 SR이 2.9 point 떨어지지만, Refer-CoT와 TVBI를 같이 빼면 17.6 point가 빠진다. 다시 말해 explicit target selection이 주된 신호이고, temporal bbox memory는 그 선택을 시간축에서 안정화하는 보강 장치다.

## 실제 robot deployment에서 보이는 운영 형태

저자들은 Unitree Go2와 Unitree G1에 Intel RealSense D455 단일 전방 camera와 portable Wi-Fi를 장착하고, ReferTrack을 remote high-performance GPU server에서 WebSocket service로 실행했다고 설명한다. robot은 JPEG-compressed RGB frame과 instruction을 stream하고, server는 detector/tracker와 candidate catalog를 갱신해 selected target slot 및 predicted trajectory를 돌려준다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/refertrack-robot-platform.webp">
    <img
      src="/images/blog/refertrack-robot-platform.webp"
      alt="Unitree G1 humanoid와 Unitree Go2 quadruped에 Intel RealSense D455 단일 전방 카메라와 Wi-Fi를 연결하고, remote server의 ReferTrack이 observation과 trajectory를 주고받는 배포 구조"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 6을 로컬 최적화한 공식 deployment 구조. 실험은 on-robot end-to-end model이 아니라 camera stream과 remote GPU server를 연결한 networked control loop다.
  </figcaption>
</figure>

논문이 보고한 complete perception-control loop 평균은 **10.6Hz**, target detection은 step당 **12ms**다. 또한 network jitter로 stale command가 쌓이지 않도록 inference 중에는 최신 pending frame만 보존하고 superseded request를 버린다고 쓴다. DINO와 SigLIP feature extraction을 별도 CUDA stream/Python thread로 병렬화하고, robot 측 pure-pursuit controller가 trajectory를 linear·angular velocity로 바꾼다.

이 세부는 sim-to-real을 과장하지 않게 해 준다. real-world 결과는 Go2가 obstacle 주변으로 돌아가는 pedestrian을 따라가고, G1이 여러 사람의 interference 아래 correct target을 유지한 **qualitative rollout**이다. 공개 본문에서 실환경 success-rate benchmark, hardware cost, network failure rate는 확인되지 않는다. 동시에 cloud/server 의존성과 Wi-Fi latency는 product deployment에서 별도 safety gate·fallback control을 요구하는 요소다.

## 공개 범위: code link가 있지만 runnable release는 아직 아니다

논문과 project page는 GitHub `MedlarTea/referTrack`를 code로 연결한다. 그러나 확인 시점 repository는 `README.md`, `assets/method.png`, `method.pdf` 중심의 806KB project repository이며, GitHub API의 `license` field는 null이다. 2026년 7월 22일 생성된 repo에는 tag가 없고 latest release endpoint는 404다.

더 직접적인 근거는 README의 TODO list다. 다음 네 항목이 모두 미공개 상태로 남아 있다.

- model checkpoints와 evaluation code
- dataset
- training code
- data engine

그러므로 지금 ReferTrack은 논문·project page·방법 figure·demo video를 통해 아이디어와 reported result를 검토할 수 있는 **research release**다. 현 시점에서 checkpoint를 내려받아 EVT-Bench나 실제 Go2/G1 환경을 재현하는 code bundle로 취급해서는 안 된다.

## 실무 관점에서의 해석

ReferTrack의 좋은 설계 포인트는 VLA reasoning을 길고 추상적인 text CoT로 만들지 않고, **화면 위 entity index 선택**으로 내리는 데 있다. target selection을 explicit interface로 만들면 supervision도 간단해지고, failure logging도 “경로 planner가 틀렸는지”와 “애초에 다른 사람을 골랐는지”로 나눌 수 있다. crowded tracking처럼 identification error가 치명적인 task에서는 이 분리가 특히 유용하다.

TVBI memory도 일반화 가능한 패턴이다. raw visual history만 길게 붙이는 대신, 이전 단계의 discrete decision을 geometric state로 보존해 다음 observation 해석에 다시 쓴다. 이는 visual tracking뿐 아니라 object handoff, warehouse picking, shopper assistance처럼 “같은 대상을 시간에 걸쳐 계속 유지해야 하는” embodied workflow에 적용할 수 있다.

다만 실제 adoption의 우선순위는 논문 점수가 아니라 release와 안전성이다. 현재 weights·evaluation code·dataset이 공개되지 않았고, remote GPU server와 single-camera/Wi-Fi control loop는 occlusion, detector miss, network degradation, 사람 주변 robot safety 같은 risk를 함께 낳는다. ReferTrack은 즉시 도입할 library라기보다, **누구를 따라갈지를 bbox-index로 먼저 검증하고 그 선택을 temporal state로 남긴다**는 VLA design pattern으로 읽는 편이 가장 생산적이다.

Sources: https://arxiv.org/abs/2607.20061, https://arxiv.org/html/2607.20061v1, https://medlartea.github.io/referTrack/, https://github.com/MedlarTea/referTrack, https://api.github.com/repos/MedlarTea/referTrack, https://api.github.com/repos/MedlarTea/referTrack/contents, https://api.github.com/repos/MedlarTea/referTrack/tags, https://api.github.com/repos/MedlarTea/referTrack/releases/latest, https://raw.githubusercontent.com/MedlarTea/referTrack/main/README.md
