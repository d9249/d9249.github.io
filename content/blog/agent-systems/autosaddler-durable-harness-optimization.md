---
title: "AutoSaddler는 실패 trace를 읽고 agent harness를 지속적으로 고친다"
date: "2026-08-29T23:18:00+09:00"
description: "AutoSaddler는 long-horizon agent의 실패 trace를 진단해 prompt·tool·middleware·loop에 구조화된 patch를 적용하고, dev-set generalization gate와 EvoDAG로 일회성 hot-fix가 아닌 durable harness update를 선택하는 최적화 프레임워크다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agent Harness
  - Long-Horizon Agents
  - Harness Optimization
  - Agent Evaluation
  - EvoDAG
draft: false
---

긴 작업에서 agent가 실패하는 이유를 모델의 추론 부족 하나로 환원하기는 어렵다. 잘못된 tool description, 누락된 action, 검증 없이 끝내는 loop, 상황에 맞지 않는 prompt rule처럼 **model 바깥 harness**의 작은 결함도 trace를 따라 누적될 수 있다.[1][2]

`AutoSaddler`는 이 문제를 사람의 prompt tuning 작업으로 남겨 두지 않고, 실패 trace에서 harness를 고치는 offline mini-batch learning 문제로 만든다.[1][2] 핵심은 실패 하나에 맞춘 hot-fix가 아니라, sampled training batch에서 효용을 확인하고 dev set에서 generalization을 통과한 변경만 남기는 **durable update**다.[2][3]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/autosaddler-harness-optimization.png"
    alt="AutoSaddler가 mini-batch 실행, diagnosis-patch, verification, reflection, EvoDAG evolution을 반복해 agent harness를 개선하는 공식 프레임워크"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 프레임워크 그림. 현재 harness를 mini-batch에서 실행한 뒤, 진단·patch·검증·reflection을 거쳐 EvoDAG가 다음 harness 후보를 만드는 반복 구조다.[3]
  </figcaption>
</figure>

## 무엇을 해결하려는가

일반적인 agent 개선은 system prompt를 덧붙이거나, 특정 실패 사례를 보고 tool과 loop를 손으로 수정하는 흐름에 가깝다. 그러나 수정 가능한 표면은 prompt만이 아니라 tool의 argument·implementation·description, middleware hook, infrastructure setting, agent loop logic까지 넓다.[2][3]

문제는 이 넓은 search space보다도 update의 내구성이다. 한 trace를 고친 patch가 다른 task에서 regression을 만들 수 있고, 같은 mini-batch 안에서 좋아 보인 결과가 task distribution 전체에 일반화된다는 보장도 없다.[1][2] AutoSaddler는 그래서 “어떻게 고칠까”와 “그 고침을 언제 채택할까”를 분리한다.[2]

## 핵심 아이디어 / 구조 / 동작 방식

한 iteration은 세 session으로 구성된다. **Diagnosis-Patch**는 실패 trace와 harness codebase를 깊게 조사해 root-cause hypothesis를 세우고, Prompt·Tool·Middleware 중 해당하는 범위에 targeted patch를 만든다.[2][3]

그 뒤 **Reflection**은 patch 전후의 scenario를 fixed, regressed, still-failing, still-passing으로 분류하고, 성공과 실패에서 재사용 가능한 lesson을 구조화한다.[2][4] 마지막 **Evolution**은 이전 후보의 patch·metric·reflection을 보관한 EvoDAG를 보고 다음 harness candidate를 합성한다.[2][3]

| 단계 | 하는 일 | 선택 기준 |
|---|---|---|
| Diagnosis-Patch | trace·code를 읽고 root cause와 patch를 제안 | 무제한 편집 대신 patch taxonomy 사용 |
| Verify | 같은 mini-batch에서 patch 전후 결과를 재평가 | 단일 failure를 실제로 고쳤는지 확인 |
| Dev gate | candidate를 development split에서 평가 | trajectory-specific repair와 general update 분리 |
| Reflection | fix·regression·원인·다음 방지책 기록 | 다음 iteration의 evidence와 lesson 생성 |
| Evolution | EvoDAG의 lineage·lesson·candidate를 조합 | 최고 dev candidate를 향해 harness를 갱신 |

Patch taxonomy도 중요한 제약이다. Capability patch는 새 tool, argument 변경, implementation fix, infrastructure change, loop logic처럼 code/logic을 바꾸고, Steering patch는 prompt rule·tool description·PreToolUse reminder처럼 text behavior를 바꾼다.[2][3] AutoSaddler는 Capability를 먼저 탐색하고 Steering으로 refinement하는 phase schedule을 둔다.[3]

## 공개된 근거에서 확인되는 점

논문과 프로젝트 페이지의 test Pass@1 기준, AutoSaddler는 GAIA2에서 default ReAct harness 53.0에서 62.0으로, SWE-Bench Pro에서 SWE-agent 37.3에서 46.9로, Terminal-Bench 2.0에서 Terminus 2 40.0에서 50.0으로 상승했다고 보고한다.[1][3][4]

| Benchmark | Base harness | Base Pass@1 | AutoSaddler Pass@1 | 보고된 변화 |
|---|---|---:|---:|---:|
| GAIA2 | Default ReAct agent | 53.0 | 62.0 | +9.0 pp |
| SWE-Bench Pro | SWE-agent | 37.3 | 46.9 | +9.6 pp |
| Terminal-Bench 2.0 | Terminus 2 | 40.0 | 50.0 | +10.0 pp |

Ablation의 메시지는 성능 수치만큼 분명하다.[2][3]
GAIA2 평균 62.0에서 in-depth diagnosis를 빼면 57.8, structured intervention을 빼면 56.9, generalization-aware selection을 빼면 50.6으로 낮아진다.[2][3]
특히 마지막 항목의 11.4 point 하락은, 좋은 patch를 많이 만드는 것보다 regression을 막는 selection policy가 harness evolution의 중심이라는 저자들의 주장을 뒷받침한다.[3]

공개 release는 논문 artifact에만 머물지 않는다. GitHub repository는 MIT license이고 Python 3.12–3.14와 `uv`를 요구하며, 현재 README는 V1을 논문 재현용 legacy implementation, V2를 durable plugin-based current implementation으로 구분한다.[4] V2에는 credential-free deterministic local template, GAIA2/Meta-ARE smoke integration, event log·manifest·snapshot·EvoDAG·candidate·evaluation을 남기는 run artifact 구조가 문서화되어 있다.[4]

다만 release maturity는 조심해서 읽을 필요가 있다. GitHub API 조회 시 repository는 2026년 5월 생성됐고 MIT LICENSE와 tests, docs, `uv.lock`을 포함하지만 tags와 GitHub Releases는 아직 없다.[4] 또한 full smoke run은 외부 repository·dataset provisioning·provider credential을 요구하고 여러 시간과 비용이 들 수 있다고 README가 명시한다.[4] 즉 바로 production plugin처럼 설치하는 패키지라기보다, deterministic template부터 검증하며 integration boundary를 넓혀 가는 연구·개발 framework에 가깝다.

## 실무 관점에서의 해석

AutoSaddler의 가장 실용적인 기여는 harness를 “프롬프트 텍스트”가 아니라 versioned, testable, mutable program으로 본다는 점이다. agent의 tool call 실패가 반복될 때 prompt를 더 길게 쓰는 대신, 필요한 tool이 없는지, implementation이 틀렸는지, middleware reminder가 필요한지, loop의 verifier가 빠졌는지를 다른 patch type으로 구분할 수 있다.[2][3]

이 관점에서 dev gate는 safeguard 이상의 역할을 한다. harness optimizer가 training trace의 단기 reward만 따라가면 과적합된 policy patch를 쌓을 가능성이 높다. AutoSaddler가 disjoint group 기반 split을 사용하고 candidate를 dev score로 선택하는 것은, patch 자체보다 **채택 규칙을 optimizer state로 취급하는 설계**다.[2][4]

도입한다면 가장 먼저 full autonomous evolution을 켜기보다 좁은 scope의 deterministic harness와 external verifier에서 시작하는 편이 맞다.[4]
V2 local template로 event store·candidate evolution·resumption을 먼저 확인하고, 그 다음 source revision·dataset manifest·working directory를 immutable input으로 고정한 smoke run을 운영하는 순서가 공개 문서의 의도와도 맞는다.[4]

결국 AutoSaddler는 agent를 더 똑똑하게 만드는 비법보다, failure trace를 **debugging evidence → structured intervention → dev-set selection → reusable lesson**으로 바꾸는 운영 loop를 제안한다. long-horizon agent가 늘어날수록 성능 개선은 model choice뿐 아니라 이 loop를 얼마나 검증 가능하게 만들었는지에서 갈릴 가능성이 크다.[1][2]

## Sources

[1] https://arxiv.org/abs/2608.23041 — AutoSaddler arXiv abstract
[2] https://arxiv.org/html/2608.23041v1 — AutoSaddler arXiv HTML
[3] https://autosaddler-projectpage.github.io — AutoSaddler project page
[4] https://github.com/microsoft/AutoSaddler — AutoSaddler GitHub repository
