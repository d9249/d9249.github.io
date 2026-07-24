---
title: "TimeLens2는 비디오 temporal grounding을 ‘근거 구간 집합’의 학습 문제로 다시 푼다"
date: "2026-07-24T16:57:43"
description: "TimeLens2는 long video의 단일·반복·질문형·egocentric 근거 구간을 하나의 generative interface로 찾고, 검증된 93K supervision과 temporal Wasserstein reward로 시간적 근거를 set-level로 최적화하는 공개 video MLLM 릴리스다."
author: "Sangmin Lee"
category: "evaluation-benchmarks"
tags:
  - TimeLens2
  - Video Temporal Grounding
  - Video MLLM
  - GRPO
  - Multimodal Evaluation
draft: false
---

비디오 MLLM이 영상 내용을 잘 요약한다고 해서, 그 답을 검증하기 쉬운 것은 아니다. “요리사가 치즈를 사용한 순간은 언제인가”, “문 앞에 무엇을 놓았는가”, “드론 장면이 나온 모든 구간은 어디인가” 같은 질문에는 무엇(what)뿐 아니라 **어느 시간대(when)**가 답의 일부가 된다. 특히 긴 영상에서는 비슷한 장면이 반복되고, 근거가 한 번이 아니라 여러 구간에 흩어질 수 있다. 그때 자연어 답만 내놓는 모델은 검색·감사·후속 agent action의 출발점으로 부족하다.

`TimeLens2: Generalist Video Temporal Grounding with Multimodal LLMs`는 이 문제를 video temporal grounding의 일반화 문제로 정의한다. 핵심은 한 모델이 짧은 action clip, 긴 영상의 반복 evidence, question-form query, first-person footage까지 다루며, 답을 하나 이상의 시간 구간으로 반환하게 만드는 것이다. 논문은 temporal evidence를 timestamp 두 개가 아니라 **variable-cardinality interval set**으로 끝까지 취급한다. 데이터 구축, SFT, GRPO reward, 평가가 모두 이 표현을 공유한다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/timelens2-benchmarks.webp">
    <img
      src="/images/blog/timelens2-benchmarks.webp"
      alt="TimeLens2의 일곱 temporal grounding benchmark 성능과 대표 질의 유형"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. TimeLens2는 short action, event-level, highlights, long-video multi-span·user-style·question-form, egocentric grounding의 일곱 설정을 하나의 모델 계열로 다룬다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

기존 temporal grounding 학습에는 두 가지 구조적 문제가 있다. 첫째, long video 라벨은 전역 영상을 한 번 보고 만든 annotation에 의존하기 쉽다. 긴 타임라인에는 시각적으로 비슷한 distractor가 많고, 동일 이벤트가 여러 번 반복된다. 그래서 실제 근거와 다른 발생을 잡거나, 반복된 근거를 하나 놓치거나, 시작·끝 경계를 거칠게 잡는 문제가 생긴다. 이것은 단순히 더 긴 video를 annotation하는 비용 문제가 아니라, **evidence verification** 문제다.

둘째, 예측 대상은 여러 interval의 집합인데, 학습 reward가 그 구조를 충분히 반영하지 못한다. temporal IoU(tIoU)는 예측과 정답이 겹친 뒤에는 유용하지만, 겹치지 않는 near miss와 아주 먼 오답에 모두 0을 줄 수 있다. 또한 multi-span 정답을 one-to-one segment matching으로 비교하면, 같은 시간 support를 더 잘게 쪼개서 출력했는지 여부나 예측·정답 interval 수가 다른 경우에 민감해진다.

TimeLens2의 관점은 명확하다. temporal grounding은 “한 timestamp를 회귀하는 문제”가 아니라, 질문을 뒷받침하는 **시간적 support의 union**을 찾는 문제다. 따라서 모델은 단일 구간뿐 아니라 disjoint interval을 반환해야 하고, reward도 여러 구간의 위치·길이·분할 방식까지 일관되게 다뤄야 한다.

| 기존 병목 | TimeLens2의 선택 | 기대 효과 |
|---|---|---|
| 긴 영상의 one-pass annotation | proposal → 독립 grounding → consensus → semantic verification → local refinement | 반복 evidence와 잘못된 occurrence를 줄이는 검증형 label 생성 |
| tIoU의 zero-overlap plateau | merged interval support 위의 temporal Wasserstein reward | near miss와 distant error를 구분하는 dense reward |
| segment별 one-to-one matching | interval set의 merged support를 직접 비교 | 불필요한 fragmentation과 unequal cardinality에 덜 민감 |
| task별 별도 interface | one or more interval을 반환하는 unified generative output | short/long, declarative/question, third-person/egocentric을 하나의 모델로 처리 |

## 핵심 아이디어 / 구조 / 동작 방식

### 1. TimeLens2-93K: 큰 데이터를 만들기보다 검증 가능한 근거를 만든다

TimeLens2-93K의 출발점은 34,867개 YouTube video다. 저자들은 1분 미만부터 1시간 초과까지 다섯 duration bucket으로 source pool을 나누고, 15개 domain을 섞었다. 여기서 최종적으로 남은 것은 **23,793개 video, 93,232개 grounding instance, 12,091개 multi-span instance**다. 프로젝트 페이지가 제시한 평균 video duration은 10.2분이다.

중요한 것은 filtering보다 annotation cascade다. 먼저 PySceneDetect로 영상을 의미적으로 이어지는 20–60초 clip으로 자르고, Qwen3-VL-235B-A22B가 global caption과 timestamped segment caption을 만든다. Kimi-K2.5는 이 caption hierarchy에서 query와 coarse temporal proposal을 함께 만든다. 이 proposal은 정답이 아니라 “어디를 더 봐야 하는가”라는 prior다.

그 뒤 Qwen3-VL-30B-A3B와 TimeLens-8B가 해당 clip을 독립적으로 다시 보고 one or more interval 혹은 empty set을 낸다. 두 annotator의 merged interval support가 set IoU **0.9 초과**일 때만 temporal consensus를 통과시키고, Qwen3-VL-Embedding의 query–clip cosine similarity가 **0.5 이상**일 때 semantic alignment도 통과시킨다. 마지막으로 더 큰 Qwen3-VL-235B-A22B가 각 boundary의 ±3초 local window를 보고 경계를 다듬는다. 서로 1초 이하로 떨어진 인접 span은 annotation jitter나 짧은 occlusion으로 보고 병합한다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/timelens2-data-pipeline.webp">
    <img
      src="/images/blog/timelens2-data-pipeline.webp"
      alt="TimeLens2-93K의 여섯 단계 temporal grounding 데이터 구축과 corpus 분포"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2. caption에서 candidate를 만들고, 두 grounding agent의 시간 합의와 semantic check를 거친 뒤, 남은 boundary만 국소적으로 정밀화한다.
  </figcaption>
</figure>

이 순서는 긴 video 전체에 비싼 annotation을 반복하는 대신, global context로 후보를 만들고 local video evidence로 후보를 검증하는 방식이다. 한 agent의 self-consistency만 보는 것이 아니라 서로 다른 두 grounder를 통과시킨다는 점이 특징이다. 물론 이것이 사람이 만든 gold label과 동치라는 뜻은 아니다. 다만 long-video supervision에서 흔한 “caption이 말한 사건”과 “실제 영상에서 그 사건이 일어난 시간”의 혼동을 분리하려는 설계다.

### 2. SFT로 evidence search를 익히고, GRPO로 interval geometry를 맞춘다

모델 학습은 capability acquisition과 geometric calibration을 나눈다. long-context SFT는 TimeLens2-93K, TimeLens-100K, Ego4D-NLQ training split을 사용해, distractor가 많은 전체 video에서 evidence를 찾아 variable-cardinality interval set을 출력하도록 만든다. 학습 중에는 instruction 문구, answer syntax, timestamp encoding을 독립적으로 바꿔 JSON·자연어·key-value·range format에 덜 묶이게 한다.

이후 GRPO는 SFT checkpoint가 어려워하는 sample을 더 자주 뽑는다. 각 예제에 대한 off-policy rollout의 평균 tIoU를 현재 정책의 competence 추정치로 쓰고, 낮은 점수 example에 높은 sampling weight를 준다. dataset의 정적 difficulty가 아니라 모델의 실제 실패 분포를 curriculum으로 쓰는 방식이다.

여기서 핵심 reward가 **temporal Wasserstein**이다. 예측 interval과 정답 interval을 각각 merge한 support 위의 uniform distribution으로 보고, 정확한 1차원 $W_1$ transport cost를 계산한다. tIoU가 “겹치는 면적”을 평가한다면, 이 reward는 겹치지 않아도 “얼마나 옮기면 정답 근처로 갈 수 있는가”를 본다. 따라서 disjoint near miss는 distant error보다 더 좋은 reward를 받고, 동일한 merged support를 여러 조각으로 나눈 redundant fragmentation은 같은 의미로 취급한다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/timelens2-wasserstein-reward.webp">
    <img
      src="/images/blog/timelens2-wasserstein-reward.webp"
      alt="Temporal Wasserstein reward가 zero-overlap과 fragmented interval matching 문제를 해결하는 예시"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 3. tIoU가 모두 0인 near miss와 distant error를 구분하고, 서로 같은 시간 support를 다른 조각으로 나눈 출력에 불필요한 차이를 주지 않는 것이 temporal Wasserstein reward의 목적이다.
  </figcaption>
</figure>

논문은 tIoU와 Wasserstein을 대체 관계가 아니라 보완 관계로 둔다. tIoU는 정확히 겹친 support를 보상하고, temporal Wasserstein은 아직 겹치지 않은 prediction에도 이동 방향을 준다. 프로젝트 페이지 기준 이 조합은 all-zero-tIoU GRPO group의 **75.8%**에서 informative ordering을 복원했고, constant-reward group 비율을 **13.8%에서 3.6%**로 낮췄으며, within-group reward variance를 **4배** 높였다.

## 공개된 근거에서 확인되는 점

TimeLens2는 2B·4B·8B model family로 보고됐다. 논문은 일곱 benchmark의 average mIoU를 각각 **44.5**, **47.7**, **48.0**으로 제시한다. 같은 Qwen3-VL backbone 대비 개선은 2B **+14.2**, 4B **+13.0**, 8B **+18.1 mIoU points**다. 특히 4B variant는 논문 표에서 Qwen3.5-397B-A17B보다 일곱 benchmark 평균 **7.5 points** 높았다고 보고한다. 이는 parameter count가 큰 generalist VLM보다 temporal grounding에 맞춘 data·reward·long-context recipe가 더 중요할 수 있음을 시사한다.

| Benchmark | 평가 성격 | TimeLens2-4B | TimeLens2-8B | Qwen3-VL-235B-A22B | Qwen3.5-397B-A17B |
|---|---|---:|---:|---:|---:|
| Charades-TimeLens | short indoor action | 57.7 | 58.6 | 47.8 | 47.5 |
| ActivityNet-TimeLens | event-level | 59.0 | 58.6 | 52.2 | 53.8 |
| QVHighlights-TimeLens | moment / highlight | 69.3 | 70.2 | 64.6 | 65.8 |
| VUE-TR | long-video multi-span | 53.2 | 53.5 | 43.1 | 42.2 |
| VUE-TR-V2 | long-video user-style | 48.1 | 47.7 | 34.1 | 34.5 |
| MomentSeeker | question-form long video | 27.9 | 28.5 | 23.7 | 23.3 |
| Ego4D-NLQ | first-person grounding | 18.6 | 19.0 | 12.7 | 14.5 |

점수는 모두 mIoU(%)이며, benchmark마다 output format도 다르다. Charades·ActivityNet·QVHighlights는 하나의 interval을, VUE-TR·VUE-TR-V2·MomentSeeker는 모든 relevant interval을, Ego4D-NLQ는 하나의 natural-language query span을 요구한다. 저자들은 visual frames만 입력으로 쓰고 audio와 subtitle을 제공하지 않았다고 명시한다. 즉 이 결과는 멀티모달 전체 문서 검색 성능이 아니라, visual temporal evidence localization 성능으로 읽어야 한다.

공개 artifact도 넓다. 공식 GitHub에는 XTuner 기반 `sft/`, off-policy rollout과 GRPO를 위한 `grpo/`, VLMEvalKit 기반 `evaluation/`이 분리되어 있고, 4B/8B SFT·GRPO script와 bundled rollout 파일을 제공한다. Hugging Face collection에는 2B·4B·8B checkpoint와 TimeLens2-93K dataset이 있다. API 기준 4B는 2개 safetensors shard로 약 **9.67GB** storage를 사용하고, 8B·4B·2B model과 dataset 모두 gated 상태가 아니다. 다만 full training에는 TimeLens2-93K뿐 아니라 TimeLens-100K, Ego4D-NLQ video를 따로 준비해야 한다. GitHub 저장소에는 SFT/GRPO annotation과 rollout data가 있어도, video file은 별도 dataset에서 내려받아야 한다.

release maturity에는 주의할 부분도 있다. GitHub API 기준 repo는 2026-07-16 생성, stars 40, forks 1, tags 없음, latest release endpoint는 404였다. 더 중요한 것은 license surface의 불일치다. README는 project를 Apache-2.0이라고 설명하고 Hugging Face 4B model card도 `apache-2.0` tag를 달고 있지만, repository의 checked-in `LICENSE` 파일은 Tencent TimeLens의 비상업·academic-only 조건과 EU 사용 제한을 포함한 다른 license text다. GitHub API도 repository license를 `Other/NOASSERTION`으로 표시한다. 실제 사용·재배포 전에는 README/HF tag만 따르지 말고, 해당 commit의 `LICENSE`, model card, upstream component 조건을 각각 검토해야 한다.

## 실무 관점에서의 해석

TimeLens2의 가장 큰 의미는 video agent가 “설명”에서 “근거를 인용하는 검색기”로 넘어갈 수 있는 인터페이스를 제시했다는 데 있다. 긴 회의·교육·현장 영상에서 agent가 어떤 결론을 냈다면, 사용자는 답을 믿는 대신 해당 결론을 지지하는 구간으로 바로 이동하고 싶다. multi-span output은 검색 결과에 맞는 하나의 장면만 고르는 것이 아니라, 반복된 evidence와 분산된 사건까지 반환할 수 있게 한다.

그 관점에서 interval set을 reward의 중심 표현으로 둔 선택은 꽤 실용적이다. 현실 query는 “소스를 넣고 저은 모든 순간”, “같은 사람이 다시 등장한 구간”, “문에 물건을 두기 전후”처럼 반복·누락·부분 근거를 동시에 낳는다. segment별 matching을 잘 설계하는 것보다, 모델이 실제로 cover한 시간 support를 비교하는 방식이 output serialization의 우연에 덜 흔들릴 수 있다. tIoU를 버리지 않고 Wasserstein으로 zero-overlap plateau를 보완한 점도 training signal 관점에서 설득력이 있다.

다만 이 성과를 완전한 long-video reasoning의 해결로 읽어서는 안 된다. mIoU는 interval overlap을 측정하지, video의 복잡한 causal relation을 전부 검증하지 않는다. TimeLens2-93K의 label quality도 multi-agent consensus와 embedding threshold에 의존한다. 두 agent가 같은 visually plausible distractor에 동의하거나, caption-generated query가 source video의 편향을 이어받을 가능성은 남아 있다. train–test source-ID audit에서 recoverable identifier의 직접 intersection은 없었다고 했지만, 이름이 바뀐 영상의 content duplicate까지 완전히 배제할 수 없다는 한계도 논문이 인정한다.

그럼에도 공개 데이터·가중치·SFT·GRPO·evaluation code를 함께 낸 것은 좋은 출발점이다. 실제 팀이 이 계열을 적용한다면, 첫째 answer text와 interval citation을 함께 product contract로 만들고, 둘째 repeated evidence를 놓치지 않는 multi-span metric을 따로 운영하며, 셋째 video source·license·개인정보 정책에 맞는 retrieval index를 추가로 설계해야 한다. TimeLens2는 temporal grounding을 비디오 QA의 부속 기능이 아니라, **검증 가능한 video intelligence의 핵심 계층**으로 올려놓은 작업으로 읽을 만하다.

Sources: [arXiv](https://arxiv.org/abs/2607.17423), [arXiv HTML](https://arxiv.org/html/2607.17423v1), [공식 프로젝트 페이지](https://mcg-nju.github.io/TimeLens2), [GitHub](https://github.com/MCG-NJU/TimeLens2), [GitHub LICENSE](https://raw.githubusercontent.com/MCG-NJU/TimeLens2/main/LICENSE), [Hugging Face Collection](https://huggingface.co/collections/MCG-NJU/timelens2), [TimeLens2-4B API](https://huggingface.co/api/models/MCG-NJU/TimeLens2-4B)
