---
title: "HASTE는 에이전트 스킬을 계층으로 쌓아 ML 엔지니어링 반복을 줄인다"
date: "2026-07-06T13:52:57"
description: "arXiv 2606.30911은 ML 엔지니어링 에이전트가 과거 Kaggle 경험을 global·domain·competition 스킬로 나눠 재사용할 때, 단순한 flat memory보다 전이 효율이 좋아진다는 HASTE 실험을 제시한다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - HASTE
  - Agent Skills
  - ML Engineering Agents
  - Hierarchical Memory
  - MLE-Bench
  - Skill Governance
image: "/images/blog/haste-architecture.webp"
draft: false
---

ML 엔지니어링 에이전트의 낭비는 꽤 단순한 곳에서 시작된다. Kaggle 스타일 문제를 하나 풀고 나서 좋은 데이터 전처리, 모델 선택, 검증 전략, 실패 패턴을 배웠더라도 다음 competition에서는 다시 처음부터 찾는다. MLE-Bench류 평가는 보통 competition을 독립 사건으로 다루기 때문에, 에이전트도 매번 cold start가 된다.

`Why Solve It Twice? Hierarchical Accumulation of Skills for Transfer-Efficient ML Engineering`는 이 문제를 “더 강한 모델을 쓰자”가 아니라 “배운 스킬을 어떻게 저장하고 노출할 것인가”로 바꾼다. 논문이 제안하는 HASTE는 Hierarchical Accumulation of Skills for Transfer-Efficient ML Engineering의 약자다. 핵심은 과거 경험을 하나의 거대한 메모리 풀에 넣는 대신, 적용 범위에 따라 global, domain, competition-specific 스킬로 나누고, 현재 작업에 맞는 범위만 불러오는 것이다.

이 논문은 2026년 7월 1일 기준 arXiv v2로 공개됐고, DL4C at ICML 2026 워크숍에 accepted 상태로 올라와 있다. 공개 페이지 기준으로 HASTE 전용 companion repository 링크는 명확히 제시되어 있지 않으므로, 이 글의 구현·재현성 평가는 논문 본문과 arXiv HTML/PDF에 보고된 수치에 한정해서 읽는 편이 안전하다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/haste-architecture.webp"
    alt="HASTE architecture diagram showing an orchestrator, domain specialists, a five-stage ML engineering pipeline, and a three-tier skill hierarchy"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv Figure 1. HASTE는 orchestrator가 competition을 domain specialist에게 배정하고, specialist는 scope에 맞는 스킬만 불러와 task profiling, prototype screen, adaptive refinement, ensemble, learning production을 반복하는 구조다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

에이전트 스킬 시스템에서 흔히 나오는 직관은 “좋은 경험을 많이 저장하면 다음 작업도 좋아질 것”이다. 하지만 HASTE 논문은 저장량보다 **노출 정책**이 더 중요하다고 본다. 같은 159개의 스킬이 있어도, 전부를 한 번에 flat하게 넣으면 context budget을 많이 쓰고 신호가 흐려질 수 있다. 반대로 현재 competition의 domain과 scope에 맞는 스킬만 넣으면, 모델이 다음 code change를 제안할 때 더 좁고 유효한 prior를 얻게 된다.

이 문제는 일반적인 agent skill registry에도 그대로 연결된다. 스킬이 10개일 때는 사람이 대충 고를 수 있지만, 100개, 1,000개, 조직 단위의 사내 skill library로 커지면 “어떤 스킬을 보여 줄 것인가”가 성능과 비용을 동시에 좌우한다. HASTE가 흥미로운 이유는 이 질문을 ML 엔지니어링 benchmark 위에서 실험으로 분해했다는 점이다.

| 문제 | flat memory에서 생기는 위험 | HASTE의 대응 |
|---|---|---|
| 매 competition cold start | 과거에 발견한 모델·전처리·검증 전략을 다시 탐색한다 | competition이 끝날 때 plain-text skill로 학습 내용을 남긴다 |
| context pollution | 관련 없는 스킬까지 들어가 토큰과 attention을 소모한다 | global + matching domain + 필요한 competition tier만 불러온다 |
| 부정확한 일반화 | 특정 dataset에서만 맞는 팁이 다른 문제로 새어 나간다 | competition-specific 스킬은 cross-competition transfer에서 제외한다 |
| 경험 축적의 불투명성 | 성공/실패가 왜 다음 작업에 반영되는지 추적하기 어렵다 | 스킬을 파일 시스템과 YAML frontmatter 기반 plain text로 유지한다 |

## 핵심 아이디어 / 구조 / 동작 방식

HASTE의 스킬 저장소는 세 개 tier로 나뉜다.

| Tier | 적용 범위 | 논문 기준 규모 | 언제 로드되는가 |
|---|---:|---:|---|
| Global | 여러 ML task에 넓게 적용되는 일반 원칙 | 5 entries | 모든 specialist가 로드 |
| Domain | tabular, NLP, vision 같은 domain별 전략 | 46 entries: NLP 12, tabular 19, vision 15 | matching domain specialist만 로드 |
| Competition | 특정 Kaggle competition에 묶인 경험 | 108 entries across 21 directories | 같은 competition 재시도에서만 로드 |

스킬 자체도 한 종류가 아니다. HASTE는 technique, commitment prior, refinement hint를 구분한다. Technique은 “무엇이 통했거나 실패했는가”를 저장한다. Commitment prior는 초기에 크게 갈리는 설계 선택을 검증 없이 고정하지 않도록 알려 준다. Refinement hint는 특정 모델 family에서 먼저 튜닝할 knob를 알려 준다. 이 셋을 한 문장짜리 “lesson”으로 뭉개지 않고, 실행 loop의 서로 다른 단계에 넣는 것이 설계상의 차이다.

실행 쪽은 orchestrator와 domain specialist로 나뉜다. Orchestrator는 competition의 domain을 분류하고, round를 스케줄링하며, 새 learning을 어느 tier로 승격할지 판단한다. Promotion 단계에서는 LLM이 각 learning을 `skip`, `competition`, `domain`, `global`, `conflict` 중 하나로 판정한다. 충돌이 생기면 한쪽을 지우기보다 조건을 붙여 둘 다 보존한다. 예컨대 ensemble이 도움이 되는 조건과 오히려 강한 모델을 끌어내리는 조건을 함께 기록하는 방식이다.

Specialist는 다섯 단계 pipeline을 돈다. 먼저 metadata, CV strategy, resource probe를 포함해 task를 profile한다. 그다음 prototype screen에서 세 가지 서로 다른 접근을 실행하고, best candidate를 adaptive refinement로 다듬는다. refinement는 Exploring, Optimizing, Fine-tuning의 세 상태를 오가며, 두 번 연속 개선이 없으면 다음 모드로 넘어가고, score가 나빠진 변경은 되돌린다. 마지막으로 top checkpoint를 rank-average ensemble하고, competition이 끝나면 2–5개의 plain-text learning을 만든다.

흥미로운 점은 retrieval이 아직 복잡하지 않다는 것이다. 논문은 현재 규모인 159개 entry에서는 embedding index 없이 관련 directory를 읽어 concatenate한다고 설명한다. agent마다 보통 10–60개의 스킬을 로드하고, prototype prompt에는 2,000자, refinement prompt에는 4,000자 cap을 둬 dilution을 제한한다. 즉 HASTE의 핵심은 고급 벡터 검색이라기보다, 먼저 스킬의 scope와 lifecycle을 제대로 나누는 데 있다.

## 공개된 근거에서 확인되는 점

메인 결과는 MLE-Bench Lite 22개 competition에서 보고된다. HASTE는 Claude Sonnet 4.6을 CLI backend로 쓰고, competition당 12시간 예산에서 77.3% medal rate를 기록했다고 보고한다. 세부적으로는 17 / 22 medals, 그중 gold 10, silver 2, bronze 5이며, above-median rate는 86.4%다. 논문은 같은 leaderboard의 상위권 시스템들이 대체로 Gemini-3-Pro, Claude Opus 4.6, model ensemble, 또는 24시간 예산을 쓰는 것과 비교해, HASTE가 non-frontier model과 12시간 budget으로 같은 performance band에 들어갔다고 해석한다.

다만 이 수치는 곧바로 “새 SOTA”로 읽기보다, skill accumulation의 방향성을 보여 주는 campaign result로 읽어야 한다. 논문도 MLE-Bench Lite의 per-task statistical noise를 언급하며, 5점 미만 차이는 noise 범위에 들어갈 수 있고, multi-seed confidence interval은 아직 pending이라고 명시한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/haste-tiered-flat-ablation.webp"
    alt="HASTE controlled ablation comparing tiered, flat, and empty skill loading across MLE-Bench Lite competitions"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv Figure 2. 같은 159개 스킬 inventory를 써도 tiered loading은 8개 ablation competition에서 100% medal rate를 보인 반면, flat loading은 empty condition과 같은 62.5%에 머물렀고 output token은 더 많이 썼다.
  </figcaption>
</figure>

가장 중요한 비교는 cold start와 warm start다. Cold run은 prior competition experience 없이 시작하고, warm run은 이전 competition에서 배운 global/domain skill을 다시 로드한다. 논문은 cross-competition transfer 평가에서 competition-specific skill을 로드하지 않았다고 밝힌다. 즉 같은 dataset을 다시 푸는 leakage보다는 재사용 가능한 지식의 전이 효과를 보려는 설계다.

| 비교 축 | Cold / baseline | Warm / tiered skill 사용 | 해석 |
|---|---:|---:|---|
| MLE-Bench Lite medal rate | 40.9% | 77.3% | 같은 시스템에서 +36.4 percentage points |
| Medals | 9 / 22 | 17 / 22 | cold에서 실패한 13개 중 8개가 medal로 전환 |
| Best score까지 평균 refinement iterations | 16.3 | 7.8 | 52% fewer iterations |
| Proposed change가 keep되는 비율 | 42% at low inventory | 85% once 50+ skills available | skill inventory가 커질수록 더 유효한 변경을 제안 |

고정 inventory ablation은 더 직접적이다. 159개 스킬을 유지한 채, 8개 competition에서 tiered, flat, empty loading을 비교한다.

| 조건 | Medal rate | Mean score | Total output tokens | Mean loaded skills |
|---|---:|---:|---:|---:|
| Tiered / scoped | 100% (8 / 8) | 0.949 | 2.27M | 36.9 |
| Flat / all skills | 62.5% (5 / 8) | 0.910 | 3.78M | 159 |
| Empty / no skills | 62.5% (5 / 8) | 0.893 | 1.86M | 0 |

이 표의 메시지는 꽤 날카롭다. “스킬을 모두 넣는 것”은 “스킬이 없는 것”보다 medal rate를 높이지 못했고, output token은 거의 두 배로 썼다. 반면 tiered loading은 더 적은 skill context로 8개 competition 전부에서 medal을 얻었다. 논문이 말하는 “hierarchy matters beyond skill volume”은 이 지점에서 나온다.

## 실무 관점에서의 해석

HASTE를 agent skill ecosystem 관점에서 읽으면, 핵심은 스킬 생성보다 **스킬 노출 통제**다. 좋은 `SKILL.md`를 많이 만드는 것만으로는 부족하다. 어떤 스킬이 global policy인지, domain runbook인지, 특정 고객/프로젝트/데이터셋에만 묶인 local lesson인지 구분하지 않으면, skill library는 지식 자산이 아니라 context pollution source가 될 수 있다.

이 관점은 실제 팀 운영에 바로 들어맞는다. 에이전트가 반복적으로 데이터 분석, 코드 수정, 리서치, 배포 작업을 하다 보면 성공한 절차와 실패한 절차가 계속 쌓인다. 이때 모든 교훈을 같은 memory bucket에 넣으면 retrieval 문제와 governance 문제가 동시에 생긴다. HASTE식으로 보면 최소한 다음 네 가지 policy가 필요하다.

| 운영 질문 | 왜 중요한가 |
|---|---|
| 이 learning은 어느 scope까지 일반화되는가 | global로 잘못 올린 local hack은 negative transfer를 만든다 |
| 어떤 agent role이 이 스킬을 봐야 하는가 | domain specialist가 아닌 agent에게는 noise가 될 수 있다 |
| 실패한 실험도 어떤 형태로 남길 것인가 | 실패는 금지 규칙, commitment prior, refinement hint가 될 수 있다 |
| 충돌하는 스킬은 삭제할 것인가, 조건부로 보존할 것인가 | 실무에서는 “항상 ensemble하라”보다 “언제 ensemble이 해로운가”가 더 유용하다 |

나는 이 논문을 “ML engineering agent 논문”인 동시에 “skill registry governance 논문”으로 보는 편이 맞다고 생각한다. HASTE의 plain-text skill store, tiered loading, LLM-driven promotion은 결국 agent가 어떤 외부 경험을 context에 들여보내고, 어떤 실행 evidence를 장기 지식으로 승격할지 정하는 control plane이다.

물론 한계도 분명하다. 첫째, headline 77.3%는 single-seed campaign result다. 둘째, 8개 competition ablation도 방향성은 일관되지만 N이 작고 single seed라 통계적으로 강하게 닫힌 결론은 아니다. 셋째, prototype screen, runner-up branch, rank-average ensemble, failure taxonomy, auto-escalation, revert-on-regression 같은 다른 engineering component의 기여는 아직 component-wise로 분리되지 않았다. 넷째, LLM-driven promotion은 핵심 메커니즘이지만, 실제로 tier를 얼마나 정확히 배정하는지, genuine conflict를 얼마나 잘 감지하는지에 대한 별도 정량 평가는 future work로 남아 있다.

그래도 실용적 메시지는 강하다. 에이전트가 반복 업무에서 좋아지려면 memory를 “많이 저장하는 것”보다 “맞는 순간에 맞는 범위만 보여 주는 것”이 중요하다. HASTE의 결과는 더 큰 context window나 더 긴 skill list가 항상 답이 아니라는 점을 보여 준다. 장기적으로 agent 플랫폼의 차별점은 모델 호출 루프만이 아니라, 경험을 파일·scope·promotion rule·검증 evidence로 관리하는 skill operations 계층에서 나올 가능성이 크다.

Sources: https://arxiv.org/abs/2606.30911, https://arxiv.org/html/2606.30911v2, https://arxiv.org/pdf/2606.30911v2, https://github.com/openai/mle-bench
