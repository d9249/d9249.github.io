---
title: "Qwen-UI-Agent는 GUI 에이전트를 모델이 아니라 현실 실행 스택으로 확장한다"
date: "2026-08-03T14:54:11"
description: "Qwen-UI-Agent는 실제 기기 런타임, GUI·CLI 혼합 행동, 100턴 이상 온라인 RL, 능동형 harness를 하나의 폐루프로 묶어 모바일·컴퓨터·웹을 넘나드는 GUI 에이전트를 제안한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Qwen-UI-Agent
  - GUI Agents
  - Computer Use
  - Reinforcement Learning
  - Agent Systems
draft: false
---

GUI 에이전트의 다음 병목은 화면을 보고 클릭할 수 있는가가 아니다. 실제 기기에서는 앱과 계정 상태가 매번 다르고, 로그인·결제·권한처럼 사람이 꼭 개입해야 하는 구간이 있으며, 긴 작업은 모바일과 데스크톱을 오가고, 중간 환경 오류와 팝업이 행동 흐름을 끊는다. 따라서 단일 벤치마크의 클릭 성공률만으로는 현실 배포 능력을 설명하기 어렵다.

`Qwen-UI-Agent Technical Report: Toward Next-Generation Real-World Centric Foundation GUI Agents`는 이 문제를 개별 모델 능력보다 **실행 시스템의 폐루프**로 다룬다. 논문은 모바일·컴퓨터·브라우저·DeepSearch 환경, 대규모 실제 모바일 기기 런타임, GUI와 CLI를 섞는 행동 공간, 100턴을 넘는 online RL, 그리고 알림에서 일을 먼저 시작하는 harness를 한 시스템으로 제안한다.

핵심 주장은 강하다. 27B 모델은 저자들의 평가에서 MobileWorld 82.1%, MobileWorld-Real 92.2%, AndroidDaily 97.5%, OSWorld-Verified 79.5%, WebArena 73.6%, ScreenSpot-Pro 81.5%를 기록했다. 다만 이 수치는 논문 저자 환경에서 나온 비교 결과이므로, 서로 다른 agent harness·fallback·평가 설정을 하나의 절대 순위로 읽기보다 이 시스템이 무엇을 통합했는지와 함께 봐야 한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/qwen-ui-agent-benchmark-overview.webp"
    alt="Qwen-UI-Agent와 여러 모델의 모바일, 컴퓨터, 웹 GUI 벤치마크 성능을 비교한 공식 막대 그래프"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv HTML Figure 1. 논문은 모바일 GUI 과제에서 선도적 결과를, 컴퓨터·브라우저 과제에서는 frontier 모델과 경쟁적인 결과를 제시한다. 비교 수치는 각 평가 설정의 차이를 함께 감안해야 한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

논문이 겨냥하는 것은 “GUI를 조작하는 VLM”보다 넓다. 목표는 기존 디지털 기기 위에서 실제로 일을 수행하는 범용 실행자다. 여기에는 네 가지 요구가 묶인다.

- **현실 기기 적응:** 시뮬레이터가 아닌 실제 앱·네트워크·계정 상태에서 움직여야 한다.
- **긴 horizon:** 한 번의 클릭이 아니라 100턴 이상 이어지는 목표를 유지해야 한다.
- **도구 혼합:** 시각적 조작만 고집하지 않고, 가능한 곳에서는 CLI나 API로 더 정확하고 빠르게 처리해야 한다.
- **능동성:** 사용자가 매 단계 명령하기 전에 알림과 맥락을 보고, 승인 가능한 실행 계획을 먼저 제시해야 한다.

이 네 조건은 서로 독립적이지 않다. 예를 들어 항공편 취소 알림을 받으면 에이전트는 모바일 알림을 읽고, 대체 항공편과 철도편을 찾고, 회의 충돌을 확인한 뒤, 결제나 최종 예약처럼 민감한 단계에서는 사용자 승인을 받아야 한다. 이 과정에서 모바일 앱, 검색, API, 데스크톱 캘린더가 하나의 상태 흐름으로 연결된다.

## 핵심 아이디어 / 구조 / 동작 방식

### 1. 시뮬레이션과 실제 기기를 잇는 환경 계층

Qwen-UI-Agent는 모바일·컴퓨터·브라우저·DeepSearch용 sandbox를 대규모 데이터 합성과 반복 평가의 기반으로 둔다. 여기에 실제 앱, 실제 네트워크, 실제 계정 상태를 가진 모바일 런타임을 붙여 sim-to-real 간극을 줄이려 한다. 로그인, 권한, 결제, 최종 확인처럼 자동화해서는 안 되는 단계는 사용자 takeover로 넘긴다.

실제 기기 운영 자체도 모델의 부수 요소가 아니다. 논문은 기기·앱·계정·화면 상태가 가능한지 확인하는 health-aware scheduler, 장애 환경을 격리하는 blacklist, 기기 하나에서 여러 앱을 병렬로 돌리는 virtual display, 그리고 성공·모델 실패·환경 실패를 trajectory 증거로 분리하는 review loop를 제시한다. 현실 사용에서 관측되는 실패를 모델 능력 부족으로 오진하지 않으려는 설계다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/qwen-ui-agent-environment-infra.webp"
    alt="sandbox 환경, 실제 기기, GUI와 CLI 행동 공간, 통합 행동-관측 인터페이스를 연결한 Qwen-UI-Agent 환경 인프라 구조도"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv HTML Figure 3. 반복 가능한 sandbox와 실제 기기 런타임을 연결하고, GUI·CLI·API 행동을 같은 thinking–action–observation 인터페이스로 다루는 구조다.
  </figcaption>
</figure>

### 2. GUI만이 아닌 혼합 행동 공간

행동 공간은 `click`, `type`, `drag`, `open` 같은 GUI 조작뿐 아니라 `cli_command`, `api_call`, `ask_user`, `terminate`를 포함한다. 이는 “화면으로 모든 것을 한다”는 접근보다 실무적이다. 대량 파일을 비교하거나 구조화된 결과를 검증할 때는 CLI가 훨씬 빠르고 정확할 수 있고, 반대로 최종 화면 상태 확인과 사용자-facing 상호작용은 GUI가 필요하다.

논문은 한 번의 모델 턴에서 여러 원시 행동을 묶어 내보내는 batched action도 사용한다. OSWorld-Verified와 OSWorld-v2 분석에서 CLI 행동이 포함된 task 비율은 각각 92.0%, 98.2%였고, batched action을 활용한 task 비율은 62.1%, 88.9%였다. 더 긴 OSWorld-v2에서는 혼합 GUI+CLI batch 비중도 11.0%에서 20.3%로 늘었다. 즉 long-horizon 환경일수록 화면 조작과 명령 실행을 오가는 능력이 예외가 아니라 일반적인 작업 방식이 된다는 해석이 가능하다.

### 3. 데이터 flywheel과 긴 trajectory용 online RL

학습 측면에서는 agent가 약한 능력을 분석하고, 목표 과제를 생성하며, sandbox와 실제 기기 환경을 보완하고, 다음 학습 반복을 계획하는 data flywheel을 둔다. 온라인 RL은 100턴 이상 trajectory를 지원하고, 논문은 10,000개가 넘는 동시 환경으로 rollout을 가속했다고 설명한다.

행동 단위 RL의 효과를 보기 위한 저자 분석도 흥미롭다. 다섯 종류의 오류 특화 시험에서 action RL 전후 정확도는 각각 72.8→79.1, 72.8→80.4, 76.6→84.4, 80.0→86.2, 72.9→82.4%로 올랐다. 특히 long-tail 행동은 reward가 71.5%에서 77.9%로 개선됐다. 이는 RL이 단순히 전체 성공률을 올리는 것뿐 아니라, 반복 클릭·조기 종료·잘못된 요소 선택처럼 GUI 실행의 구체적 failure pattern을 수정하려는 수단으로 쓰였음을 보여 준다.

## 공개된 근거에서 확인되는 점

논문 안의 주요 비교를 압축하면 다음과 같다. `Qwen-UI-Agent 27B`의 값이며, 비교 모델의 수치도 논문 표에 실린 저자 평가 결과다.

| 평가 표면 | Qwen-UI-Agent 27B | 가까운 비교 지점 | 읽을 점 |
|---|---:|---:|---|
| MobileWorld GUI-only | **82.1%** | Seed 2.1 Pro 73.2%, GPT-5.6 Sol 70.1% | 모바일 GUI subset에서 가장 높은 보고 점수 |
| MobileWorld-Real | **92.2%** | Seed 2.1 Pro 88.7%, GPT-5.6 Sol 85.4% | 저자가 제안한 실제 기기 모바일 benchmark |
| AndroidDaily | **97.5%** | Seed 2.1 Pro 95.2%, Gemini 3.1 Pro 93.8% | 고빈도 Android 일상 시나리오 |
| OSWorld-Verified | **79.5%** | Claude Opus 4.8 83.4%, Seed 2.1 Pro 78.8% | 컴퓨터 사용에서는 선두와 경쟁적이지만 최고점은 아님 |
| OSWorld-v2 | **40.0%** partial / 13.9% binary | Claude Opus 4.8 54.8% / 20.6% | 긴 컴퓨터 작업에서는 여전히 큰 난도가 남음 |
| WebArena | **73.6%** | Claude Opus 4.8 71.9%, 인간 78.2% | 브라우저 과제에서 인간 기준에는 아직 미달 |
| ScreenSpot-Pro | **81.5%** (zoom) | Seed 2.1 Pro 80.7%, GUI-Owl-1.5-32B 80.3% | 화면 grounding과 zoom 활용의 강한 결과 |

MobileWorld-Real의 설계도 결과만큼 중요하다. 이 benchmark는 409개 task, 104개 앱, 7개 domain, 35개 intent를 포함하며 AndroidDaily보다 task 수가 1.7배, 앱 수가 2.0배, long-tail 앱이 1.9배 많다고 보고한다. 같은 Qwen 3.7 Plus의 성공률은 AndroidDaily 79.8%에서 MobileWorld-Real 72.7%로 내려가고, 평균 completion step은 13.9에서 18.5로 늘어난다. 연구팀은 이것을 실제 기기 상호작용이 기존 일상 모바일 benchmark보다 더 긴 trajectory와 넓은 앱 분포를 요구한다는 근거로 든다.

실제 실패 분포도 현실적이다. Qwen 3.7 Plus의 실패 trajectory에서 실행 능력 한계는 40.3%였고, 실제 환경 문제는 52.0%였다. 후자에는 UI 상태 오독 24.7%, 팝업·광고·CAPTCHA·빈 화면 같은 간섭 18.2%, 물리적 위젯 제어 실패 9.1%가 포함됐다. 다시 말해 모델이 UI를 “인식”하는 것과 현실 앱에서 작업을 끝내는 것은 다른 문제다.

## Harness가 바꾸는 것: 반응형 조작에서 승인 가능한 계획으로

논문의 harness layer는 알림 stream을 보고 관련 일정·기억·도구를 연결한 뒤, 실행 가능한 선택지를 만들도록 설계됐다. 항공편 취소 예시에서는 대체 항공편, 철도 대안, 회의 충돌을 병렬로 확인하고 사용자가 승인할 수 있는 요약을 제시한다. 모바일에서 후보를 찾고 데스크톱에서 스프레드시트로 정리한 뒤, 다시 모바일에서 승인받는 식의 cross-platform stateful workflow도 포함한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/qwen-ui-agent-proactive-harness.webp"
    alt="항공편 취소 알림을 계기로 대체 이동수단과 일정 충돌을 확인하고 사용자 승인용 계획을 만드는 능동형 harness 및 모바일-데스크톱 교차 실행 흐름"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv HTML Figure 6. harness는 알림을 시작 신호로 쓰되, 예약·결제처럼 중요한 결정은 자동 완료가 아니라 사용자에게 선택 가능한 계획으로 올리는 human-in-the-loop 구조를 취한다.
  </figcaption>
</figure>

여기서 중요한 것은 능동성이 곧 무단 실행을 뜻하지 않는다는 점이다. 이 보고서가 제시하는 유용한 경계는 자동화의 목표를 “사람을 빼는 것”이 아니라 **사람의 판단이 필요한 순간을 좁히고 더 좋은 입력을 제공하는 것**으로 바꾼다는 데 있다. 로그인·권한·결제·확인 단계의 takeover와 계획 승인 흐름은 제품화에서 필요한 권한 경계의 최소 형태로 볼 수 있다.

## 실무 관점에서의 해석

Qwen-UI-Agent를 단지 새 GUI 모델로 보면 논문의 강점을 놓치기 쉽다. 더 정확한 해석은 **현실 GUI agent를 위한 운영 스택의 청사진**이다. 모델, 환경 운영, trajectory review, 데이터 생성, RL, 사용자 승인, cross-device state가 따로따로 존재하면 성능 개선의 원인과 책임 경계가 흐려진다. 이 보고서는 그 층들을 하나의 loop로 연결하려 한다.

다만 현 시점에서는 두 가지를 분리해야 한다. 첫째, 논문의 benchmark 결과는 강하지만 OSWorld-v2의 13.9% binary completion처럼 긴 컴퓨터 작업의 신뢰성은 아직 제한적이다. 둘째, arXiv HTML에서 이 기술 보고서와 직접 연결된 공식 코드 저장소·모델 배포 페이지는 확인하지 못했다. 따라서 당장 재현 가능한 완성형 product release라기보다, 저자들이 제시한 시스템 설계와 평가 결과를 중심으로 읽는 것이 안전하다.

그럼에도 방향은 분명하다. GUI agent가 실제 업무의 실행자가 되려면 화면 이해 점수만 높아서는 부족하다. 실제 기기 관리, 환경 실패의 분리, GUI·CLI의 적절한 전환, 긴 행동의 검증, 그리고 사용자 승인 경계까지 함께 설계되어야 한다. Qwen-UI-Agent는 그 요구를 비교적 구체적인 시스템 언어로 옮긴 사례다.

Sources: https://arxiv.org/abs/2607.28227v1, https://arxiv.org/html/2607.28227v1
