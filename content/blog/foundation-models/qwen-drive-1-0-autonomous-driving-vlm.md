---
title: "Qwen-Drive-1.0은 자율주행을 위한 VLM을 어떻게 하나의 시스템으로 묶었나"
date: "2026-09-08T16:21:32"
description: "Qwen-Drive-1.0은 Qwen3.5-4B의 시각·언어 경로는 유지한 채 외부 BEV 인지 헤드와 궤적 생성 Planning Expert를 붙여, 3D 인지·주행 VQA·모션 플래닝을 하나의 공개 패키지로 제공하는 자율주행 VLM이다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - Qwen-Drive-1.0
  - Autonomous Driving
  - Vision-Language Models
  - Motion Planning
  - 3D Perception
draft: false
---

자율주행 모델은 보통 3D 인지, 장면 이해, 경로 계획을 서로 다른 모델과 인터페이스로 나눈다.[1] Qwen-Drive-1.0은 사전학습된 Qwen3.5-4B를 공통 시각·언어 백본으로 두고, 그 위에 3D 공간을 명시적으로 읽는 BEV 인지 헤드와 미래 ego 궤적을 생성하는 Planning Expert를 외부 모듈로 결합한다.[1][2]

중요한 것은 “주행용 VLM”이라는 이름보다 결합 방식이다.[2]
언어 디코더와 기본 VLM 경로를 크게 바꾸지 않고, 인지와 계획을 각자 검증 가능한 출력 표면으로 분리했다.[2][4]
따라서 자연어 장면 질의, 3D 물체·점유·지도 예측, 실제 차량의 미래 경로가 하나의 공유 표현에서 나오되, 어느 단계가 틀렸는지는 각 모듈의 결과에서 따로 관찰할 수 있다.[2]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/qwen-drive-1-0-unified-architecture.png"
    alt="공유 비전 인코더와 VLM에서 텍스트 응답, 외부 BEV 인지 헤드, Planning Expert가 각각 3D 인지와 미래 자차 궤적을 생성하는 Qwen-Drive-1.0 공식 구조도"
    style="width: 100%; max-width: 900px; height: auto; display: block; margin: 0 auto;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Qwen-Drive-1.0은 공통 VLM 표현을 언어 응답·BEV 인지·미래 궤적이라는 세 출력 표면으로 연결한다.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

카메라 입력에서 “무엇이 보이는가”와 “어떻게 운전해야 하는가”는 연결돼 있지만, 모델 설계에서는 종종 분리된다. 텍스트 기반 공간 추론만으로는 3D 장면을 충분히 검증하기 어렵고, 반대로 전용 계획 모델만으로는 그 판단을 사람에게 설명하거나 일반 시각·언어 질의에 답하기 어렵다.[1]

논문은 이 간극을 세 가지 과제로 구체화한다. BEV Perception Head는 3D 객체 탐지, semantic occupancy, BEV map segmentation을 함께 출력하고, 기본 VLM은 일반 VQA와 Driving VQA를 처리하며, Planning Expert는 미래 ego trajectory를 생성한다.[2][4] 인지 헤드는 단순히 성능을 위한 별도 백엔드가 아니라 공유 표현 안에 3D 정보가 실제로 접근 가능한지 확인하는 명시적 probe라는 위치를 가진다.[2]

이 선택은 실차 배포에서 특히 의미가 있다.[2] 하나의 생성형 설명만으로 계획의 안전성을 판단하기보다, 3D 공간 출력·언어 근거·궤적을 서로 대조할 수 있기 때문이다.[2] 다만 이 논문이 제시하는 것은 통합 모델의 유망한 공개 기준점이지, 공도 주행 안전을 독립적으로 입증한 인증 결과는 아니다.[1]

## 핵심 아이디어 / 구조 / 동작 방식

입력은 다중 카메라·다중 프레임 장면으로 시작한다.[2] 공통 비전 인코더와 VLM은 장면 문맥을 만들고, 외부 BEV 헤드는 voxelized vision feature와 VLM feature pyramid를 융합해 ego-frame 3D 표현을 만든다.[2] 이 표현에서 탐지·점유·지도 분할의 세 가지 인지 출력을 낸다.[2]

Planning Expert는 또 다른 거대한 언어 모델을 추가하는 대신, 공유 VLM에서 cache된 key와 value를 조건으로 사용한다.[2] noisy trajectory token을 flow matching으로 복원해 5초 구간의 `(x, y, heading)` waypoint 50개를 생성하며, 공개 추론 예시는 여섯 후보 궤적을 만들 수 있도록 구성돼 있다.[2][3]

훈련도 네 단계로 나뉜다.[2] 첫 단계에서 BEV head를 초기화하고, 둘째 단계에서 perception과 Driving VQA를 함께 학습해 vision encoder와 VLM을 적응시킨다.[2] 이후 고정된 공유 표현 위에서 Planning Expert를 flow matching으로 학습하고, 마지막 단계에서 benchmark 목적함수를 보상으로 쓰는 reinforcement learning을 적용한다.[2]

## 공개된 근거에서 확인되는 점

주행 VQA에서 Qwen-Drive-1.0-SFT는 LingoQA 77.8, Ego3D RMSE 7.78, WaymoQA 전체 74.5, PAI-AV Chain-of-Causation 전체 41.3, 사내 중국 도시 주행 결정 벤치마크 71.0을 보고한다.[1][4] 논문 표의 동일 프로토콜 비교에서 base Qwen3.5-4B는 각각 70.4, 13.17, 67.1, 2.6, 59.0이어서, 특히 물리적 크기와 인과적 운전 판단을 겨냥한 지표에서 큰 차이가 난다는 것이 저자들의 주장이다.[2]

| 평가 표면 | Qwen3.5-4B → SFT |
| --- | ---: |
| LingoQA | 70.4 → 77.8 |
| Ego3D RMSE ↓ | 13.17 → 7.78 |
| WaymoQA 전체 | 67.1 → 74.5 |
| PAI-AV CoC 전체 | 2.6 → 41.3 |
| 사내 도시 주행 결정 | 59.0 → 71.0 |

계획 결과는 지표마다 다른 트레이드오프를 보인다.[2]
WOD-E2E test에서 RL 모델은 RFS 7.91을 기록했지만 5초 ADE는 2.67m이고, SFT reasoning 모델은 RFS 7.78과 5초 ADE 2.65m를 보고한다.[2]
NAVSIM에서는 SFT reasoning의 PDMS 88.2가 RL 후 90.7로, six-sample best-of-6 선택에서는 89.3에서 91.4로 올라간다.[2][4]

공개 범위는 논문만이 아니다.
GitHub 저장소는 Apache-2.0 라이선스의 코드·데모·문서를 공개한다.[3]
Hugging Face 가중치는 root VLM, `planner-sft`, `planner-rl`, perception head로 나뉜다.[4]
root VLM은 9.1GB이고 두 planner는 각 2.1GB, perception head는 0.5GB다.[4]
저장소는 24GB 이상 GPU를 권장하며, `planner-rl`은 reasoning-conditioned rollout으로만 보상 최적화됐으므로 reasoning planning 모드에서 쓰도록 명시한다.[3][4]

그렇다고 재현성이 완전히 해결된 것은 아니다.
arXiv 초록의 “Code will be available” 문구와 달리 현재 저장소는 이미 공개됐지만, 2026년 8월 말 생성된 초기 릴리스이며 GitHub release와 tag는 아직 없다.[1][3]
실행 가능한 demo와 평가 문서는 갖췄지만, 안전·일반화 주장을 수용하려면 독립적인 closed-loop 재현과 다른 차량 센서 구성에서의 검증이 더 필요하다.[2][3]

## 실무 관점에서의 해석

Qwen-Drive-1.0의 핵심 기여는 하나의 VLM이 모든 것을 “말할 수 있다”는 주장보다, **주행용 표현을 세 개의 검증 가능한 인터페이스로 나눈 것**에 있다.[2] VQA는 운전 장면과 이유를 질의하는 표면, BEV head는 공간 구조를 확인하는 표면, Planning Expert는 제어 후보를 만드는 표면이다.[2] 이 구분이 있으면 연구팀은 성능 하락을 언어 이해·3D 정합·궤적 생성 중 어디에서 왔는지 분해해 측정할 수 있다.[2]

동시에 계획 성능은 단일 숫자로 읽기 어렵다. RL은 NAVSIM의 PDMS처럼 상호작용형 평가를 끌어올리지만, PAI-AV의 open-loop 변위에서는 SFT가 더 낮은 수치를 보이는 경우가 있다.[2][4] 따라서 도입 평가는 인지 정확도, 개방루프 ADE, 폐루프 안전·진행도, reasoning의 충실도, 카메라 rig가 바뀐 경우의 안정성을 한 장의 scorecard로 함께 관리해야 한다.

운영상으로는 “4B”라는 이름만 보고 가벼운 VLM으로 판단하면 안 된다. VLM과 두 planner, perception head를 함께 받는 배포 형태이고 24GB 이상 GPU가 권장되므로, 로봇·차량 실시간 시스템에서는 메모리, 샘플 수, planning latency, 실패 시 fallback을 별도 설계해야 한다.[3][4] Qwen-Drive-1.0은 자율주행 파운데이션 모델의 완성 선언이라기보다, 공통 VLM을 유지하면서도 3D 인지와 계획을 검사 가능한 모듈로 외부화하는 구현 가능한 설계안을 공개했다는 데 가장 큰 가치가 있다.

## Sources

[1] https://arxiv.org/abs/2609.00111 — Qwen-Drive-1.0 arXiv abstract
[2] https://arxiv.org/html/2609.00111v1 — Qwen-Drive-1.0 arXiv HTML technical report
[3] https://github.com/QwenLM/Qwen-Drive-1.0 — Qwen-Drive-1.0 official GitHub repository
[4] https://huggingface.co/Qwen/Qwen-Drive-1.0-4B — Qwen-Drive-1.0-4B official Hugging Face model card
