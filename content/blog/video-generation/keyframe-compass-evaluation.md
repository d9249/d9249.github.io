---
title: "KeyFrame-Compass는 ‘키프레임을 지켰는가’를 비디오 생성의 독립 평가 축으로 만든다"
date: "2026-07-20T13:16:43"
description: "KeyFrame-Compass는 386개 기본 샘플과 키프레임 실행·전체 비디오 품질을 분리한 진단 지표로, 멀티 키프레임 비디오 생성이 자연스러움과 제어 충실도 사이에서 어떤 trade-off를 보이는지 측정하는 공개 벤치마크다."
author: "Sangmin Lee"
category: "video-generation"
tags:
  - KeyFrame-Compass
  - Video Generation
  - Benchmark
  - Controllable Generation
  - Evaluation
draft: false
---

비디오 생성의 제어 방식은 점점 텍스트 프롬프트 한 줄에서 벗어나고 있다. 제작자는 장면의 시작·중간·끝을 나타내는 여러 장의 keyframe을 놓고, 모델이 그 사이를 자연스러운 움직임과 전환으로 연결하기를 기대한다. 이 workflow에서 좋은 결과란 단순히 영상이 그럴듯한 것이 아니다. 지정한 인물과 제품, 구도와 사건이 **정해진 순서와 시점에 실제로 나타나야** 한다.

하지만 기존 video-generation benchmark는 대체로 visual quality, temporal consistency, text instruction following을 본다. 단일 reference image를 얼마나 보존했는지 평가하는 경우도 있지만, 여러 keyframe이 빠지지 않았는지, 순서가 뒤집히지 않았는지, 원하는 구간에 놓였는지까지 분해해 보기는 어려웠다. KeyFrame-Compass는 이 공백을 겨냥한 공개 benchmark다. 논문은 멀티 keyframe 조건부 생성에서 “좋은 영상”과 “계획을 충실히 실행한 영상”을 같은 점수로 뭉개지 말아야 한다고 주장한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/keyframe-compass-teaser.webp"
    alt="KeyFrame-Compass의 일상 기록, 제품 시각화, 시네마틱 서사 세 도메인 키프레임 예시"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 저장소의 benchmark 예시. 일상 기록·제품 시각화·시네마틱 서사에서, 순서가 있는 keyframe을 영상의 시간축 위에서 실현하는 과제를 다룬다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

멀티 keyframe video generation은 image-to-video를 여러 번 반복하는 문제보다 어렵다. 모델은 각 anchor image의 외형을 보존해야 할 뿐 아니라, 첫 번째와 마지막 frame 사이에 자연스러운 motion을 합성하고, 여러 shot으로 이루어진 서사에서는 장면 전환과 객체 identity까지 관리해야 한다. keyframe 하나가 누락되거나, 맞는 장면이지만 순서가 바뀌거나, 이미지를 그대로 슬라이드처럼 넘기면 실제 제작 workflow에서는 실패다.

KeyFrame-Compass는 이 실패를 진단 가능한 항목으로 바꾼다. benchmark는 **386개 기본 샘플**을 세 application domain으로 구성한다. `daily capture`는 일상 행동과 상태 변화, `product visualization`은 제품 시연, `cinematic narrative`는 캐릭터 상호작용과 shot 간 서사를 다룬다. 61개 one-take와 325개 multi-shot case가 있으며, 짧은 5–10초 구간 227개와 10–45초 long-video 구간 159개로 나뉜다.

각 기본 샘플은 조건을 다섯 축으로 바꿔 볼 수 있게 설계됐다. 입력은 순서대로 전달되는 multi-image list 또는 한 장의 storyboard grid이며, 프롬프트는 핵심 정보만 주는 minimal mode와 shot별 시간·카메라·사건을 지정하는 segment-specific mode가 있다. keyframe 수는 3·6·9·12개이고, 영상 구조는 끊김 없는 one-take와 multi-shot을 모두 포함한다. 즉 모델이 input interface를 이해하지 못하는 문제와, 시각 조건이 조밀해질수록 제어가 무너지는 문제를 따로 볼 수 있다.

| 설계 축 | 공개된 구성 | 평가에서 분리되는 질문 |
|---|---|---|
| 기본 샘플 | 386개, short 227개 / long 159개 | 어떤 상황에서 일반화가 무너지는가 |
| 시각 입력 | multi-image list / storyboard grid | 모델이 순서 있는 여러 이미지를 실제 시간 계획으로 읽는가 |
| 텍스트 제어 | minimal / segment-specific | 약한 안내와 구체적 shot 지시에서 모두 작동하는가 |
| 영상 구조 | one-take / multi-shot | 연속 motion과 장면 전환을 모두 다룰 수 있는가 |
| keyframe 밀도 | 3 / 6 / 9 / 12 | 조건이 촘촘해질수록 얼마나 안정적으로 실행하는가 |

## 핵심 아이디어 / 구조 / 동작 방식

이 benchmark의 핵심은 평가를 **keyframe execution**과 **general video quality**라는 두 층으로 나누는 데 있다. 전자는 계획을 지켰는지, 후자는 결과물이 좋은 영상인지 묻는다. 전자는 `presence`, `fidelity`, `temporal ordering`, `localization`, `persistence`, `uniqueness` 여섯 측면을 측정한다. 다시 말해 해당 keyframe이 나타났는지, 외형이 비슷한지, 순서가 맞는지, 목표 시간대에 위치하는지, 필요한 동안 유지되는지, 다른 keyframe과 혼동되지 않는지를 본다.

후자는 MLLM judge의 자유로운 인상평에만 의존하지 않는다. 논문은 evidence checklist를 기반으로 한 MLLM 판단에 shot segmentation, pixel-level PSNR·SSIM, semantic DINOv3 matching, specialized perception model의 신호를 결합한다. visual quality, spatiotemporal coherence, instruction adherence, audio-visual coordination을 별도로 평가해, “keyframe은 닮았지만 중간 motion이 무너진” 결과와 “영상은 자연스럽지만 reference를 새로 연출해 버린” 결과를 구분한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/keyframe-compass-framework.webp"
    alt="KeyFrame-Compass의 benchmark 축과 staged keyframe matching 및 전체 비디오 품질 평가 구조"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 저장소의 평가 구조. keyframe response는 후보 frame을 찾고 시간 구간 안의 최종 match를 고르는 staged pipeline으로, 전체 품질은 specialized perception model과 evidence-grounded MLLM judge로 평가한다.
  </figcaption>
</figure>

평가 규칙도 실제 조건의 차이를 반영한다. multi-shot에서는 각 keyframe을 shot의 첫 frame, 마지막 frame, 또는 shot 내부의 representative anchor로 지정한다. one-take에서는 연속 trajectory 위의 target timestamp를 부여한다. minimal prompt는 시간 위치와 audio 요구를 명시하지 않으므로 keyframe position accuracy와 audio modality adherence를 점수에 억지로 넣지 않고, segment-specific prompt에서만 해당 항목을 보고한다.

이 구조는 benchmark를 단순한 leaderboard보다 **failure analysis 도구**에 가깝게 만든다. 예를 들어 grid input을 그대로 한 장의 정적 collage처럼 출력하는 실패와, 각 keyframe은 잘 복원하지만 사이 전환이 melt·dissolve처럼 무너지는 실패는 최종 영상의 평균 품질만 보면 비슷하게 보일 수 있다. KeyFrame-Compass는 어느 단계의 능력이 부족했는지 드러내는 쪽을 택한다.

## 공개된 근거에서 확인되는 점

논문은 10초 이하 short-video에서 proprietary 4개와 open-source 5개, 총 9개 대표 시스템을 평가한다. proprietary group에는 Gemini-Omni-Flash, Kling-3.0-Omni, Seedance 2.0, Wan2.7-I2V가 들어가며, open-source group에는 daVinci-MagiHuman-1080p-I2V, HunyuanVideo1.5-I2V, LTX-2.3, SkyReels-V2-I2V, Wan2.2-I2V-A14B가 포함된다. 10초를 넘는 long-video에서는 평가 환경에서 agent-mode multi-pass workflow를 제공한 Seedance 2.0과 Kling-3.0-Omni만 비교했다. 따라서 long-video 표를 모든 모델의 동일 조건 leaderboard로 읽으면 안 된다.

공통 audio-video leaderboard의 115개 기본 샘플에서 Seedance 2.0은 overall **0.807**로 1위였다. keyframe fidelity와 temporal organization만 보면 LTX-2.3이 각각 **0.855**, **0.899**로 가장 높았지만, video quality가 **0.557**에 그쳐 overall은 **0.659**로 4위였다. 반대로 Gemini-Omni-Flash는 video quality **0.861**, audio-visual coordination **0.640**으로 강했지만 keyframe fidelity는 **0.483**이었다. 어떤 단일 점수도 전체 사용 경험을 대표하지 못한다는 것이 이 benchmark의 가장 직접적인 실험 결과다.

| 모델 | Keyframe fidelity | Temporal organization | Video quality | Overall | 읽는 방법 |
|---|---:|---:|---:|---:|---|
| Seedance 2.0 | 0.807 | 0.859 | 0.850 | **0.807** | 시각 anchor·시간 구조·일반 품질의 균형형 |
| Gemini-Omni-Flash | 0.483 | 0.807 | **0.861** | 0.744 | 자연스러운 완성도는 높지만 입력 외형을 느슨하게 재구성하는 경향 |
| Kling-3.0-Omni | 0.665 | 0.805 | 0.813 | 0.738 | 중간 수준의 keyframe 보존과 narrative flow |
| LTX-2.3 | **0.855** | **0.899** | 0.557 | 0.659 | anchor 실행은 강하지만 자연스러운 중간 transition이 병목 |
| Wan2.7-I2V | 0.490 | 0.667 | 0.734 | 0.628 | 전반적 품질과 keyframe 실행에 모두 개선 여지 |

질적 분석은 표의 trade-off를 더 선명하게 만든다. LTX-2.3은 입력 keyframe을 높은 충실도로, 정해진 순서에 가깝게 재현하지만 큰 scene 변화나 camera viewpoint 변화 사이에서 slide-like cut, implausible morphing이 나타날 수 있다. 반대로 Gemini-Omni-Flash는 keyframe을 strict visual anchor보다 shot의 의미·조명·구도에 관한 semantic reference처럼 사용해, 장면 layout이나 개별 object를 다시 구성하는 사례가 관찰됐다. Seedance 2.0은 강한 appearance anchor와 세부 instruction을 따르는 대신, 너무 엄격한 anchoring이 주어진 입력의 문맥적 refinement를 제한할 가능성도 논의된다.

제약 밀도도 중요한 변수다. 논문은 keyframe 수가 늘어날수록 proprietary 모델 전반에서 instruction adherence가 일관되게 낮아지는 경향을 보고한다. 특히 많은 open-source 모델은 storyboard grid를 temporally ordered sequence가 아니라 하나의 grid image로 처리해, grid 자체가 정적으로 남거나 필요한 shot이 나오지 않는 실패를 보였다. “이미지를 여러 장 넣을 수 있는가”와 “그 여러 장을 시간 계획으로 해석하는가”는 별개 능력이라는 뜻이다.

공개 artifact는 비교적 실용적인 형태다. GitHub `cactusqq/KeyFrame-Compass`에는 Apache-2.0 코드, evaluator, prompt/checklist, 실행 script가 있다. Hugging Face dataset에는 386개 base sample과 함께 선택된 keyframe, storyboard grid, minimal/specific prompt, sample manifest가 공개되어 있으며, viewer 기준 3,341 rows와 총 5.05GB 규모다. 다만 formal evaluation은 Linux, NVIDIA GPU, 지원되는 VLM API 접근을 요구하고, SAM3.1·ElasticFace·InceptionNeXt·MonST3R RAFT용 checkpoint 네 개는 upstream에서 별도 내려받아야 한다. 확인 시점 기준 저장소는 2026-07-05 생성, stars 8개, tags 없음, latest release endpoint도 없었다. 따라서 재현 가능한 research artifact로는 구체적이지만, 바로 설치되는 완성형 benchmark appliance로 보기는 이르다.

## 실무 관점에서의 해석

KeyFrame-Compass가 던지는 가장 중요한 질문은 “모델이 영상을 잘 만들었는가”가 아니라 **“사용자의 visual plan을 실제로 실행했는가”**다. 광고 storyboard, 제품 데모, 콘텐츠 제작, 게임 컷신처럼 keyframe이 계약에 가까운 workflow에서는 자연스러운 영상 하나보다, 어떤 anchor가 어느 시점에 재현됐는지 확인할 수 있는 평가가 더 중요할 수 있다. 이 benchmark는 controllability를 text alignment의 하위 항목으로 취급하지 않고, 독립적인 제품 품질 축으로 끌어올린다.

특히 leaderboard의 rank reversal은 배포팀이 평가 목표를 먼저 명시해야 한다는 신호다. reference identity와 composition을 엄격하게 보존해야 한다면 fidelity·ordering 중심 지표가 중요하고, 최종 결과의 cinematography와 audio-video coherence가 더 중요하다면 quality 축의 비중이 달라진다. Seedance 2.0이 joint score에서 앞섰다는 사실은 유용하지만, 그것이 모든 제작 조건에서 최선이라는 뜻은 아니다. benchmark의 가치는 단일 champion을 선언하는 데보다, 그 선택의 비용을 보이게 하는 데 있다.

또 하나의 교훈은 interface design이다. storyboard grid는 한 장의 이미지 입력만 받는 모델에 multi-keyframe task를 전달하는 현실적인 우회로지만, 많은 모델이 이를 시간 순서로 분해하지 못했다. 모델 API가 multi-image input을 지원하는지, 순서를 명시적으로 보존하는지, shot별 temporal slot을 표현할 수 있는지까지 평가 계약에 넣어야 한다. 더 많은 visual condition을 넣는 것만으로 제어성이 자동으로 커지지는 않는다.

한계도 명확하다. MLLM judge와 specialized scorer를 결합했어도 video quality의 일부는 여전히 평가 모델과 checklist design의 영향을 받는다. 또한 장기 영상 비교는 agent-mode workflow가 공개된 두 시스템에 한정됐고, 서로 다른 모델의 input interface와 권장 inference setting을 맞추는 과정 자체가 완벽히 동일한 조건을 만들 수는 없다. 그럼에도 KeyFrame-Compass는 핵심 failure mode를 잘 짚는다. keyframe을 보존하는 능력, 그 사이를 자연스럽게 합성하는 능력, storyboard를 시간 계획으로 읽는 능력은 서로 다른 능력이며, 다음 세대 video generator는 이 셋을 함께 개선해야 한다.

Sources: [arXiv](https://arxiv.org/abs/2607.14202), [PDF](https://arxiv.org/pdf/2607.14202), [GitHub](https://github.com/cactusqq/KeyFrame-Compass), [Hugging Face Dataset](https://huggingface.co/datasets/Vickyinmyheart824/KeyFrame-Compass), [GitHub API](https://api.github.com/repos/cactusqq/KeyFrame-Compass)
