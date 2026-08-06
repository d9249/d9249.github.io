---
title: "Video-DeepResearch는 ‘검색’ 전에 비디오 근거를 강제한다"
date: "2026-08-06T14:24:18+09:00"
description: "Video-DeepResearch는 프레임 선택과 객체 crop 검색을 먼저 수행하게 한 뒤 웹 탐색을 풀어 주는 단계적 tool policy, SFT+GRPO 학습, 그리고 실제 시각 근거를 요구하는 VideoDR-Bench를 제안한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Video-DeepResearch
  - Multimodal Agents
  - Deep Research
  - Video Understanding
  - GRPO
draft: false
---

멀티모달 deep research agent가 이미지를 다룬다고 해서, 비디오 속 사실을 실제로 찾아냈다는 뜻은 아니다.[3] 연속된 화면에서 중요한 시점을 고르고, 인물·로고·장소처럼 식별 단서가 있는 영역을 잘라 검색한 뒤, 외부 웹 근거를 엮어 답해야 한다.[3] 이 과정이 빠지면 agent는 텍스트 검색 결과나 모델 내부 지식만으로 그럴듯한 답을 내놓을 수 있다.[3]

`Video-DeepResearch: Towards the Next-Generation Multimodal Deepresearch Agent`는 이 빈틈을 **행동 순서의 문제**로 다룬다.[3] 저자들은 현재 모델이 시각 도구를 피하고 텍스트 검색으로 우회하는 *modality bias*, 그리고 도구를 거의 쓰지 않아도 기존 지식으로 답을 맞히는 *parametric knowledge leakage*를 핵심 병목으로 제시한다.[1][2]

논문은 Video-DeepResearch-35B-A3B가 저자 평가에서 평균 정확도 64.0%를 기록해 Claude-4.5-Sonnet의 59.0%보다 5.0%p 높았다고 보고한다.[3] 다만 이 숫자는 논문이 구성한 benchmark·도구 환경·평가 protocol 안의 결과이므로, 일반적인 비디오 이해 능력의 절대 순위라기보다 **시각 grounding을 강제하는 agent training recipe의 효과**로 읽는 편이 안전하다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/video-deepresearch-paradigm.png">
    <img
      src="/images/blog/video-deepresearch-paradigm.png"
      alt="기존 텍스트 우회 및 전체 이미지 검색과 달리 Video-DeepResearch가 비디오 프레임 선택, 객체 crop 검색, 텍스트 검색, 웹 탐색을 순서대로 연결하는 공식 구조도"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. 핵심은 비디오를 한 장의 이미지처럼 검색하지 않고, 프레임과 객체를 먼저 고정한 다음 텍스트·웹 근거를 연결하는 순서에 있다.[8]
  </figcaption>
</figure>

## 무엇을 해결하려는가

비디오 기반 질문에는 서로 다른 두 실패가 섞여 있다.[3] 첫째는 “무엇을 봐야 하는가”의 실패다.[3] 영상 전체를 image search에 넣으면 검색 엔진은 비슷한 장면이나 주변 메타데이터를 돌려줄 수 있지만, 질문에 필요한 배우·상품·표지판·점수판을 특정하지 못한다.[3]

둘째는 “정말 보았는가”의 실패다.[3] 기존 VideoDR 평가에서 논문이 측정한 Qwen3.5-397B-A17B는 task당 시각 도구 호출이 평균 0.10회, 텍스트 도구 호출은 1.27회였다.[3] GPT-5는 57점의 정확도와 함께 시각 도구 0.00회·텍스트 도구 0.12회로 나타났으며, 저자들은 이를 tool-grounded execution 없이도 풀리는 평가의 신호로 해석한다.[3]

Video-DeepResearch의 목표는 정답만 맞히는 모델이 아니라, **비디오 안의 식별 가능한 근거를 먼저 확보하고 그 근거로 웹 조사를 확장하는 정책**이다.[3] 그래서 tool call 자체도 성능의 부수 지표가 아니라, 답의 provenance를 만드는 행동으로 취급한다.[3]

## 핵심 아이디어: perception을 먼저 잠그고 exploration을 나중에 연다

### 1. 비디오를 시간·공간 검색 문제로 분해한다

논문은 비디오를 시간에 따라 달라지는 entity trajectory의 집합으로 본다.[3] agent는 `Select_Keyframe`으로 정보량이 높은 시점을 고르고, `Crop_Search`로 해당 프레임의 객체 영역을 잘라 visual search를 수행한다.[3] 그 뒤에야 `Search`, `Visit` 같은 텍스트·웹 도구를 이용해 이름, 맥락, 관계를 검증하고 최종 답을 만든다.[3]

이 순서가 중요한 이유는 전체 frame 검색이 아니라 **어떤 entity를 어떤 frame에서 잡았는지**가 이후 웹 탐색의 query quality를 결정하기 때문이다.[3] 프레임 선택은 시간적 grounding, crop은 공간적 grounding, 웹 탐색은 외부 지식 검증이라는 서로 다른 역할을 맡는다.[3]

### 2. data pipeline도 같은 순서를 학습시킨다

데이터 생성은 세 단계다.[3] 먼저 rule-based filter와 agent-based filter로 영상의 길이·품질·정보 밀도를 거르고, keyframe 선택과 entity extraction·image search를 거쳐 VQA를 만든다.[3] 이후 tool 없이 맞힐 수 있는 질문은 여러 tool-free rollout으로 제거해 내부 지식 누수를 줄이려 한다.[9]

그 결과 논문은 30K video-grounded VQA와 7K의 정답 trajectory를 만들었다고 설명한다.[3] trajectory 단계에서는 처음에 `Select_Keyframe`과 `Crop_Search`만 허용하고, 충분한 visual context가 쌓인 뒤에야 `Search`와 `Visit`을 열어 준다.[3] 성공적으로 답한 기록만 rejection sampling으로 남기는 방식이다.[3]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/video-deepresearch-data-pipeline.png">
    <img
      src="/images/blog/video-deepresearch-data-pipeline.png"
      alt="비디오 필터링, keyframe 선택, 객체 추출과 이미지 검색, VQA 검증, 시각 인식과 웹 탐색을 분리한 trajectory 생성, 사람 검수 benchmark 구축을 보여 주는 Video-DeepResearch 공식 파이프라인"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 3. 데이터 생성, tool policy, benchmark 구축이 따로 노는 대신 모두 “시각 근거를 먼저 확보한다”는 계약을 공유한다.[9]
  </figcaption>
</figure>

### 3. imitation 이후 GRPO로 탐색을 밀어 준다

학습은 SFT와 GRPO의 두 단계로 구성된다.[3] SFT는 7K visual trajectory와 7K text-only QA를 함께 사용해 perception–exploration의 기본 문법을 학습하고, GRPO는 2K의 중간 난도 instance에서 rollout reward로 policy를 더 조정한다. 저자들은 format violation이나 반복 loop가 update를 과도하게 지배하지 않도록 negative advantage를 20% 확률로 down-sampling했다고 적었다.[3][6]

이 구성은 “tool call을 많이 하게 한다”보다 더 구체적이다.[3] 먼저 visual action만 가능한 구간을 두면 agent는 답을 서둘러 생성하거나 텍스트 검색으로 도망갈 수 없다.[3] 이후 웹 도구를 열어 주면, 앞 단계에서 확보한 entity와 crop 결과가 exploration의 출발점이 된다.[3]

## VideoDR-Bench는 정답률보다 실행의 진위를 묻는다

VideoDR-Bench는 human–AI collaborative annotation으로 만든 200개의 multi-hop VQA instance로 구성되며,[3] 논문은 각 문제가 visual search와 external knowledge reasoning을 함께 요구하도록 설계됐다고 설명한다. 여섯 video domain은 Knowledge 29.5%, Entertainment 22.0%, Daily Life 18.5%, Game & Sports 14.5%, News 12.0%, Others 3.5%로 분포한다.[2][3]

| 비교 축 | 논문이 겨냥하는 실패 | Video-DeepResearch의 대응 |
|---|---|---|
| 시간 | video 전체에서 중요한 순간을 놓침 | `Select_Keyframe`으로 후보 시점 선택 |
| 공간 | 전체 frame 검색이 약한 단서를 희석 | `Crop_Search`로 entity 단위 visual query 생성 |
| 지식 | 시각 단서만으로 관계·사실을 완성하기 어려움 | `Search`·`Visit`으로 외부 web evidence 확장 |
| 평가 | 내부 지식만으로 정답을 맞혀 tool use를 검증하지 못함 | tool-free solvable question을 걸러 benchmark 구성 |

저자 표에서는 35B-A3B가 Video-DR 68.0, VideoDR-Bench overall 60.0, 평균 64.0을 보고했고,[3] 30B-A3B는 평균 59.3으로 Claude-4.5-Sonnet의 59.0과 비슷한 값이었다. base model 대비 향상도 함께 보고되지만, 아직 단일 논문의 저자 평가이므로 재현 환경과 tool backend가 달라지면 결과도 달라질 수 있다.[3]

## 공개 범위와 실행 난도는 별개로 봐야 한다

공식 저장소는 2026년 8월 5일 Video-DeepResearch 논문 공개와 함께 코드가 `Video-DeepResearch/` 아래에 있다고 알렸다.[4][5] 현재 하위 디렉터리는 preprocessing, evaluation, SFT, RL로 나뉘어 있어, 논문의 전체 training·evaluation 흐름을 코드 구조에서 추적할 수 있다.[6]

하지만 “코드가 있다”와 “바로 재현된다”는 다른 말이다.[6] 코드 README의 evaluation은 VLM inference server, judge server, web page를 구조화해 주는 extract server라는 세 서비스를 요구한다.[6] SFT·GRPO 경로도 여러 GPU, keyframe 추출, model endpoint, tool API 설정을 전제하며 설정 파일의 credential은 placeholder로 제공된다.[6]

저장소 API 기준으로 이 프로젝트는 2026년 1월 29일 생성됐고 8월 5일에 갱신됐으며, 당시 669 stars·56 forks와 MIT license를 표시했다.[7] 릴리스와 tag endpoint는 비어 있었고, VideoDR-Bench500은 README에서 “coming soon”으로 표기된다.[5] 따라서 현 공개물을 완성된 원클릭 제품보다 **논문과 함께 공개된 연구용 training·evaluation harness**로 읽는 것이 적절하다.[6]

## 실무 관점에서의 해석

이 논문의 가장 유용한 메시지는 멀티모달 agent의 신뢰성을 final answer 하나로 측정하면 안 된다는 데 있다.[3] “정답을 냈는가”와 “그 정답에 필요한 시각 근거를 실제로 찾았는가”는 다르며, 후자를 보려면 tool policy·training data·benchmark가 같은 행동 계약을 공유해야 한다.[3]

반대로 비용도 분명하다. 저자들은 대형 모델 배포와 동적 web search 때문에 data synthesis와 training의 GPU 비용이 크고, benchmark의 신뢰도를 확보하려는 human annotation이 빠른 확장을 제한한다고 밝힌다. 더 가벼운 architecture와 자동 LLM evaluation으로 사람 의존도를 줄이는 일은 앞으로의 과제다.[1][3]

그래서 Video-DeepResearch는 비디오 agent를 위한 완성 답이라기보다, **vision-first constraint를 어떻게 학습·평가·운영 경로 전체에 심을 것인가**에 대한 강한 설계안으로 읽힌다.[3] 영상의 모든 frame을 더 많이 보는 것보다, 언제 어떤 부분을 확인했고 그것이 다음 검색을 어떻게 바꿨는지 추적 가능하게 만드는 편이 더 중요한 경우가 많다.[3]

## Sources

[1] https://arxiv.org/pdf/2608.03979 — Video-DeepResearch arXiv PDF
[2] https://arxiv.org/abs/2608.03979 — Video-DeepResearch arXiv abstract
[3] https://arxiv.org/html/2608.03979v1 — Video-DeepResearch paper HTML
[4] https://github.com/Osilly/Vision-DeepResearch — Official Video-DeepResearch repository
[5] https://raw.githubusercontent.com/Osilly/Vision-DeepResearch/main/README.md — Official repository README
[6] https://raw.githubusercontent.com/Osilly/Vision-DeepResearch/main/Video-DeepResearch/README.md — Video-DeepResearch code README
[7] https://api.github.com/repos/Osilly/Vision-DeepResearch — Official repository metadata API
[8] https://arxiv.org/html/2608.03979v1/x3.png — Video-DeepResearch paradigm figure
[9] https://arxiv.org/html/2608.03979v1/x5.png — Video-DeepResearch pipeline figure
