---
title: "AI4AI는 강한 모델의 추론을 약한 모델의 테스트 타임 하네스로 컴파일한다"
date: "2026-08-15T00:39:17+09:00"
description: "AI4AI는 강한 builder model이 5% validation set에서 약한 target model용 inference-time harness를 반복 제작·검증하게 해, parameter update 없이 Theory-of-Mind 과제의 성능을 0.488에서 최고 0.912까지 끌어올렸다고 보고한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - AI4AI
  - Agent Harness
  - Test-Time Scaling
  - Strong-to-Weak Transfer
  - Theory of Mind
draft: false
---

작은 모델의 능력을 키우는 가장 익숙한 방식은 fine-tuning, distillation, RL처럼 parameter를 바꾸는 것이다. `AI4AI at Test-Time: Strong-to-Weak Capability Transfer via Harnesses`는 다른 질문을 던진다. 더 강한 모델이 약한 모델에게 답을 직접 가르치거나 weight를 업데이트하지 않고, **약한 모델이 이미 가진 능력을 더 안정적으로 꺼내는 실행 하네스**를 한 번 만들어 줄 수는 없을까?[1][2]

논문의 strong-to-weak scaffolding은 강한 *builder model*이 작은 validation set을 보고 prompt, routing, preprocessing, deterministic rule, answer-format guard, verifier를 조합한 executable scaffold를 반복적으로 만든 뒤, 약한 *target model*은 그 scaffold 안에서 hidden test를 푼다는 설정이다. builder의 긴 reasoning은 offline 설계 비용으로 한 번 쓰고, target은 이후 test-time마다 더 작고 규칙적인 실행 경로를 따른다. 저자들의 해석대로라면 이는 training-time distillation이 아니라 **cognitive structure의 test-time transfer**다.[2]

중요한 범위도 분명하다. 결과는 네 Theory-of-Mind(ToM) benchmark의 구조화된 문제와 저자 protocol에 대한 것이다. 따라서 “모든 약한 모델이 큰 모델처럼 된다”는 주장이 아니라, **반복되는 task structure를 코드·routing·format contract로 외재화할 수 있을 때** 강한 builder가 약한 target의 실패 부담을 줄일 수 있다는 실험적 주장으로 읽어야 한다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/ai4ai-strong-to-weak-harness-workflow.png">
    <img
      src="/images/blog/ai4ai-strong-to-weak-harness-workflow.png"
      alt="AI4AI 공식 workflow. builder model이 rule file, target model demo, validation set을 바탕으로 scaffold를 build·revise하고 validation error를 진단한다. 최종 scaffold는 builder가 볼 수 없는 hidden test set에서 human evaluator가 target model에 적용한다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. builder는 rule·demo·5% validation set만 보고 scaffold를 반복 수정하고, final entry point는 builder가 접근하지 못한 hidden test에서 별도로 평가된다.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

강한 모델을 매 요청에 쓰는 방식은 일반적이지만, 반복 업무에서는 같은 reasoning을 계속 재계산한다. 반대로 약한 모델을 direct call하면 instruction을 놓치거나, 문제 유형을 잘못 분류하거나, 답 형식을 지키지 못하거나, 규칙적으로 처리할 수 있는 논리를 매번 언어적 추론으로 다시 수행할 수 있다.

AI4AI가 겨냥하는 지점은 여기다. target model을 “더 오래 생각하게” 하거나 multi-sample vote를 크게 늘리는 대신, builder가 task의 규칙성과 failure pattern을 찾아 **target이 직접 부담질 필요 없는 부분을 scaffold로 옮긴다.** 논문에서 builder가 최종적으로 낼 수 있는 구성 요소는 prompt template, benchmark routing, deterministic pre/post-processing, answer-format enforcement, verification pass, few-shot retrieval, symbolic solver 등이며, 고정된 architecture를 강제하지 않는다.[2]

builder는 validation의 정답·오답·실행 기록을 보고 scaffold를 고치지만 hidden test에는 접근하지 못한다. 이 분리는 validation에서 우연히 맞춘 prompt가 아니라, scaffold가 unseen instance에도 전이되는지 보려는 최소한의 실험 계약이다. 최종적으로 human evaluator가 exported entry point를 target model과 함께 full test에 적용한다.[2]

## 핵심 아이디어 / 구조 / 동작 방식

### 1. 강한 builder가 약한 target의 실행 환경을 만든다

각 benchmark에서 builder는 rule file, target 호출 demo, label이 있는 validation split을 작업 공간으로 받는다. 초기 scaffold는 비어 있고, builder는 자료를 읽어 scaffold를 구현한 뒤 validation set에 target을 실행한다. 실패 example과 validation accuracy는 다음 수정의 근거가 된다.[2]

이 루프에서 builder가 최적화하는 대상은 답변이 아니라 `f_scaffold(x, target)`이라는 **inference-time entry point**다. 즉 같은 target model이라도 entry point가 문제를 먼저 route하고, deterministic code로 일부 결정을 내리고, 남은 부분만 target에게 묻게 만들 수 있다. parameter는 전혀 바꾸지 않는다.

### 2. validation은 짧고, test는 builder에게 숨긴다

실험은 BigToM 1,200개, Hi-ToM 1,200개, MMToM-QA 600개, MuMA-ToM 900개를 묶어 hidden test 3,900개로 평가한다. builder가 보는 validation은 benchmark별 5%, 합계 195개이며 primary metric은 네 benchmark full-set accuracy의 unweighted macro average다.[2]

builder model, builder가 동작하는 platform, target model, repeat을 분리했다는 점도 중요하다. Cursor·Claude Code·GPT Codex라는 platform은 builder의 작업 환경이고, GPT-5.5·Opus-4.7·Gemini 계열 등은 실제 scaffold를 만드는 builder다. 논문은 이 둘을 섞어 “어느 coding agent가 좋다”가 아니라 **어떤 builder capability와 reasoning effort가 더 좋은 harness를 만드는가**를 보려 한다.[2]

### 3. 핵심은 모델 reasoning을 deterministic path로 덜어 내는 일이다

저자들이 57개 scaffolded run을 분석했을 때, 거의 모든 run에 format enforcement(57/57), greedy/temperature control(56/57), benchmark routing(54/57)이 들어갔다. Forced CoT와 polarity/negation logic은 각각 45/57, deterministic solver는 31/57이었다.[2]

이 prevalence 자체가 인과관계는 아니다. 그러나 per-run 분석에서 accuracy는 deterministic code·rule로 답한 item 비율과 `r = 0.72`의 강한 양의 상관을 보였다고 저자들은 보고한다. 더 좋은 scaffold는 target에게 더 긴 사고를 요구한 것이 아니라, format 오류를 막고 문제 유형을 분리하며, polarity·negation·구조화된 추출처럼 규칙화 가능한 부분을 code path로 밀어낸 경우가 많았다는 해석이 가능하다.[2]

## 공개된 근거에서 확인되는 점

GPT-5.4-mini를 target으로 둔 main setting에서 vanilla direct-call baseline은 0.488이다. 57개 scaffolded run 평균은 0.763으로 +0.275 point 높고, 모든 builder–platform configuration이 baseline을 넘었다고 보고된다. 가장 좋은 single run은 GPT-5.5가 GPT Codex 환경에서 만든 scaffold로 0.912, baseline 대비 +0.423 point(상대 +86.7%)다.[2]

| GPT-5.4-mini target 기준 | Macro accuracy · baseline 대비 |
|---|---:|
| Vanilla direct call | 0.488 · – |
| 모든 scaffolded run 평균 | 0.763 · +0.275 |
| GPT-5.5 builder 평균 | 0.875 ± 0.036 · +0.387 |
| Opus-4.7 x-high builder 평균 | 0.856 ± 0.022 · +0.368 |
| Best single scaffold | <strong>0.912 · +0.423</strong> |
| Human-inspired UserHarness | 0.939 · +0.451 |

자동 scaffold가 human-designed UserHarness를 이미 일반적으로 이겼다는 뜻은 아니다. best automated run은 0.912로 human-inspired 0.939보다 낮다. benchmark별로는 BigToM에서 자동 scaffold가 1.00 대 UserHarness 0.95로 더 높았지만, Hi-ToM·MMToM-QA·MuMA-ToM에서는 인간 하네스가 여전히 앞선다고 논문은 설명한다.[2]

builder의 identity가 platform보다 더 큰 변수라는 주장도 Figure 2가 보여 준다. 같은 builder의 Cursor·Claude Code·GPT Codex 결과는 대체로 가까운 반면 builder 간 세로 순위는 더 분명하다. Opus-4.7 effort sweep에서는 Cursor의 평균이 low 0.728에서 extra-high 0.840으로, Claude Code에서는 0.694에서 0.872로 올라갔다. 저자들은 effort와 scaffold quality의 Spearman `ρ = 0.77`을 보고하며, platform 효과는 조건부·2차적이고 builder capability와 reasoning budget이 더 중요하다고 해석한다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/ai4ai-builder-platform-heatmap.png">
    <img
      src="/images/blog/ai4ai-builder-platform-heatmap.png"
      alt="GPT-5.4-mini target에서 Cursor, Claude Code, GPT Codex platform별 builder 평균 full-set accuracy를 보여 주는 AI4AI 공식 heatmap. GPT-5.5와 Opus-4.7 x-high가 상위권이고 Grok-0.1은 낮은 점수를 보인다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2a. GPT-5.4-mini target에서 builder×platform의 평균 hidden-test accuracy. 빈 칸은 미실행 configuration이며, 색과 숫자는 test-time target의 full-set 성능이다.[2]
  </figcaption>
</figure>

효과는 target의 headroom에 따라 달라진다. GPT-5.4-mini의 vanilla baseline 0.488은 여러 builder에게 큰 개선 여지를 남겼지만, Gemini-3.5-flash는 baseline이 0.761이라 uplift가 더 작거나 benchmark에 따라 음수가 될 수 있었다. 논문의 표현대로 harness는 이미 맞는 행동을 무심코 깨뜨릴 수도 있으므로, 강한 base model에는 task별 적용·fallback·validation gate가 더 중요하다.[2]

공개 범위도 제한적이다. arXiv HTML에는 별도 code·project link가 없고, 논문 제목과 strong-to-weak transfer 표현으로 GitHub repository를 탐색했지만 저자와 연결되는 공식 implementation을 확인하지 못했다.[2][3] 따라서 현 시점에는 installable framework나 benchmark release라기보다, **특정 ToM setup에서 test-time capability transfer를 측정한 연구 결과**로 읽는 것이 맞다.

## 실무 관점에서의 해석

AI4AI는 “큰 모델 하나가 작은 모델에게 지능을 준다”보다, **강한 모델을 offline compiler로 쓰고 약한 모델을 runtime executor로 쓴다**는 운영 패턴으로 보는 편이 유용하다. builder가 반복 업무의 rule·routing·verifier를 한 번 찾아 code와 harness artifact에 고정하면, target은 매 요청에서 그 구조를 다시 발견할 필요가 없다.

이 패턴이 맞는 곳은 명확하다. 처리 흐름이 반복되고, 성공을 자동 판정할 수 있으며, 일부 판단을 explicit rule·schema·deterministic program으로 옮길 수 있는 업무다. 예를 들어 문서 형식 검사, 상태 전이, policy routing, structured extraction, code generation 뒤 test 실행처럼 “모델이 해야 할 핵심 판단”과 “매번 다시 추론할 필요 없는 규칙”을 나눌 수 있어야 한다.

반대로 high-stakes policy를 builder가 validation 5%만 보고 code로 굳히게 하면 위험하다. benchmark-specific routing은 hidden test generalization을 보이더라도, 실제 업무의 data drift·예외·권한·보안 제약을 자동으로 포괄하지 않는다. 특히 deterministic solver가 큰 성능 차이를 만들 수 있는 만큼, 오류 하나가 전체 benchmark item에 전파될 수도 있다. 논문도 deterministic-solver strategy에서 run-to-run spread가 가장 넓어지는 경우를 관찰했다.[2]

실무 도입에서는 완전 자동화보다 human-gated loop가 적절하다.

```text
반복 업무와 evaluator 고정
  → target failure 수집
  → route·format·code 후보 제안
  → sandbox / held-out 검증
  → 승인한 harness만 runtime 반영
  → drift면 fallback·rollback
```

결국 이 논문은 test-time scaling의 대상을 token 수에서 **실행 환경의 구조**로 넓힌다. 더 많은 reasoning token이 필요한 부분도 있지만, 일부 실패는 좋은 model output이 아니라 좋은 compiler, route, parser, guard, verifier가 없어서 생긴다. AI4AI는 그 경계를 강한 builder가 찾고 약한 target이 재사용하게 만들 수 있는지를 보여 준 초기 증거다.

## Sources

[1] [arXiv abstract](https://arxiv.org/abs/2608.12307) — 논문 서지·초록·제출 정보
[2] [arXiv HTML](https://arxiv.org/html/2608.12307v1) — 방법, 공식 Figure 1·2, benchmark protocol과 결과표
[3] [GitHub repository search API](https://api.github.com/search/repositories?q=%22AI4AI+at+Test-Time%22+OR+%22Strong-to-Weak+Capability+Transfer%22&per_page=20) — 공식 implementation 탐색의 시간 한정 근거
