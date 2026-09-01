---
title: "WikiSkill은 에이전트 경험을 스킬에 덮어쓰지 않고 지속되는 Wiki로 컴파일한다"
date: "2026-09-01T13:26:06+09:00"
description: "WikiSkill은 실행 trace를 immutable raw layer에 남기고, 실패 패턴·변경 이력·검증 결과를 persistent wiki에 축적한 뒤, 검증을 통과한 skill update만 반영해 agent skill evolution을 장기 지식 축적으로 바꾸려는 프레임워크다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - WikiSkill
  - Agent Skills
  - Skill Evolution
  - Procedural Memory
  - Persistent Knowledge
draft: false
---

에이전트가 실패한 실행 기록을 바탕으로 `SKILL.md`를 고치는 방식은 빠르게 출발할 수 있다. 하지만 반복이 쌓이면 “왜 이 규칙이 추가됐는가”, “어떤 수정안이 이전에 거절됐는가”, “같은 실패가 다른 task에서 다시 나타났는가”가 trace와 diff 사이에 흩어진다. WikiSkill은 이 문제를 스킬 편집의 문제가 아니라, **실행 경험을 지속되는 지식으로 컴파일하는 문제**로 다시 정의한다.[1][2]

논문이 제안하는 구조는 raw execution trace, persistent wiki, executable skill을 서로 다른 계층으로 분리한다.[2] skill update는 검증 성능이 나빠지면 rollback할 수 있지만, 그 과정에서 발견한 패턴과 proposal의 수용·거절 이력은 wiki에 남아 다음 iteration의 근거가 된다.[2] 따라서 목표는 더 긴 스킬 문서를 만드는 것이 아니라, 과거의 실패를 다시 탐색·판단 가능한 상태로 남기면서 절차 지식만 작게 실행 계층으로 옮기는 데 있다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/wikiskill-three-layer-architecture.png">
    <img
      src="/images/blog/wikiskill-three-layer-architecture.png"
      alt="Raw Layer, Wiki Layer, Skills Layer와 Inference Agent, Wiki Maintainer, Skill Proposer, Gating and Rollback으로 구성된 WikiSkill의 공식 구조도"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2. trace는 immutable raw layer에, 정리된 패턴과 이력은 reset되지 않는 wiki layer에, 실제 실행 규칙은 rollback 가능한 skills layer에 둔다.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

기존 skill-evolution 방식은 rollout을 수행하고, 성공·실패를 분석한 뒤 스킬을 수정한다. 그러나 insight가 proposal history나 단발성 분석 산출물에만 남으면, 다음 iteration은 이미 실패했던 개입을 다시 제안하거나 서로 다른 trace에 흩어진 원인을 재발견해야 한다. WikiSkill은 raw trace와 skill 사이에 별도의 knowledge layer를 두어 이 정보를 누적한다.[1][2]

특히 논문은 “현재 실행에 필요한 절차”와 “절차를 개선하기 위해 장기 보존해야 하는 근거”를 분리한다. Inference Agent는 active skill만 주입받아 task를 수행하고, wiki는 Wiki Maintainer와 Skill Proposer가 trace를 분석하고 수정안을 만들 때 사용한다.[2] 학습 rollout 중 Inference Agent에 wiki 접근을 열어 주면, skill 자체가 아니라 wiki의 보조 지식으로 task를 풀 가능성이 생겨 skill 품질을 평가하는 signal이 흐려질 수 있다는 것이 저자들의 가설이다.[2]

| 계층 | 보존·갱신 방식 |
|---|---|
| `raw/` | reasoning, tool call, output, final answer를 포함한 실행 trace를 write-once·immutable로 보존 |
| `wiki/` | 실패·성공 pattern, evolution log, skill impact 이력을 iteration을 넘어 지속·누적 |
| `skills/` | Inference Agent가 읽는 절차 지식과 `PURPOSE.md`를 validation gate 통과 시에만 반영하고, 성능 저하 시 rollback |

이 계층화는 운영 기록을 늘리는 일과 다르다. raw는 원본 근거를 보존하고, wiki는 반복되는 실패와 개선 이력을 사람이거나 proposer가 다시 찾을 수 있는 형태로 정리하며, skill은 실행 시 필요한 rule만 담는다. 세 층을 섞지 않는 것이 WikiSkill의 핵심 설계 선택이다.[2]

## 핵심 아이디어 / 구조 / 동작 방식

한 iteration은 네 역할로 진행된다. Inference Agent가 현재 skills로 training task를 수행해 trace를 남기고, Wiki Maintainer가 선택된 성공·실패 trace를 분석해 `patterns/`, `logs.md`, `skill-impact.md`를 갱신한다.[2] 그다음 Skill Proposer는 wiki index, 이전 proposal의 결과, 필요한 raw trace를 읽어 하나의 skill을 새로 만들거나 제한적으로 수정하는 atomic proposal을 제안한다.[2]

마지막 Gating and Rollback 단계는 validation split에서 candidate skill set을 평가한다. 개선된 수정만 skills layer에 남기고, 성능을 떨어뜨린 변경은 되돌린다.[2] 여기서 중요한 비대칭은 skill은 되돌아가도 wiki는 남는다는 점이다. “이 제안은 왜 거절됐는가”가 다음 proposer의 탐색 공간을 줄이는 지식이 되므로, 실패가 단순히 버려지는 것이 아니라 이후 정책의 근거가 된다.

Wiki layer의 pattern은 단순 요약 노트가 아니다. 논문은 pattern page에 특정 failure mode 또는 successful strategy와 actionable workaround를 기록하고, `skill-impact.md`에는 outer-loop harness가 validation gate 뒤의 수용 이력을 남긴다고 설명한다.[2] 이 기록 덕분에 proposer는 반복되는 error, 이미 실패한 intervention, 이전에 성공한 변경의 범위를 함께 보고 다음 patch를 설계할 수 있다.[2]

## 공개된 근거에서 확인되는 점

저자들은 LiveMath, SealQA, SpreadSheetBench, OfficeQA, ALFWorld의 5개 benchmark와 Qwen·Gemma·Gemini 계열 5개 모델에서 평가했다고 보고한다.[1][2] Qwen 계열에서는 no-skill baseline 대비 평균 성능 개선이 4B에서 12.3%, 9B에서 17.5%, 27B에서 23.9%였다고 제시한다. 이 수치는 모델이 커질수록 evolved skill의 추가 이득도 커졌다는 논문의 관찰을 뒷받침하지만, 저자들이 선택한 benchmark·prompt·evolution budget 아래의 결과로 읽어야 한다.[1][2]

| 논문 결과 | 수치와 해석 범위 |
|---|---|
| model scale와 skill evolution | Qwen 4B·9B·27B의 평균 개선은 12.3%·17.5%·23.9%. 동일 model family와 논문 설정에서의 평균 변화 |
| 작은 모델의 보완 | Qwen-3.5-9B + WikiSkill은 47.4%, Qwen-3.6-27B no-skill은 39.4%. skill이 항상 model scale을 대체한다는 일반 법칙은 아님 |
| cross-model transfer | ALFWorld에서 9B 모델은 27B가 진화시킨 skill로 70.2%, 자체 진화 skill로 63.4%. source model·task별 검증이 필요한 transfer 결과 |

persistent wiki의 효과는 ablation에서도 확인된다. Gemini-3.5-Flash 설정에서 Inference Agent의 wiki access를 끄고 Skill Proposer에만 persistent wiki를 제공했을 때, 평균 성능은 48.7%에서 63.7%로 15.0 percentage point 올랐다고 보고된다.[2] 반대로 training rollout의 Inference Agent에도 wiki access를 주면 평균은 60.9%로 낮아졌다.[2] 즉 논문은 wiki를 모든 agent에게 항상 더 많이 제공하는 memory가 아니라, **스킬을 개선하는 역할에 선택적으로 제공해야 하는 optimizer memory**로 다룬다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/wikiskill-evolution-case-study.png">
    <img
      src="/images/blog/wikiskill-evolution-case-study.png"
      alt="거절된 goal-directed-action 수정의 이력과 반복 행동 패턴이 wiki에 남고, 이후 break-repetition-loop skill이 수용되는 WikiSkill의 ALFWorld 사례"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 3. ALFWorld 사례에서 거절된 proposal의 diff와 validation 결과가 wiki에 남고, 이후 pattern evidence를 반영한 더 구체적인 skill update가 수용된다.[2]
  </figcaption>
</figure>

공개 범위는 보수적으로 볼 필요가 있다. arXiv v1은 논문 HTML·PDF와 TeX source를 제공하지만, 논문 페이지에서 저자 공식 code repository나 checkpoint 링크는 확인되지 않는다.[1][2] GitHub 검색에는 논문을 언급하는 여러 독립 구현이 나타나지만, 이를 저자 공식 배포로 검증할 근거는 없었다.[3] 따라서 WikiSkill은 현재 바로 설치할 수 있는 표준 framework라기보다, 공개된 방법·prompt·benchmark 결과를 가진 연구 프레임워크로 분류하는 편이 정확하다.

## 실무 관점에서의 해석

WikiSkill이 던지는 실무 질문은 “memory를 얼마나 많이 저장할 것인가”가 아니다. 더 중요한 질문은 **어떤 기록이 실제 execution context에 들어가야 하고, 어떤 기록은 다음 개선안을 심사하는 optimizer context에 남아야 하는가**다. production incident, user feedback, agent trace를 전부 skill prompt에 넣으면 context가 커지는 것뿐 아니라, 실패 원인과 실행 규칙의 경계가 사라질 수 있다.

도입할 때는 raw → wiki → skills의 구분부터 작게 적용하는 편이 낫다. append-only trace와 artifact pointer를 먼저 남기고, 반복되는 failure에는 원인·근거·workaround·영향을 가진 pattern page를 만든다. 그다음 skill change를 atomic diff로 제한하고, validation score뿐 아니라 reference breakage, 권한 변화, 안전 규칙 삭제를 별도 gate로 검사해야 한다.

논문의 separation 원칙도 그대로 자동화 규칙으로 옮기기보다 실험해야 한다. Inference Agent에서 wiki access를 막는 선택은 training signal을 깨끗하게 만들려는 실험 설계이며, production runtime에서 retrieval된 운영 지식이 항상 해롭다는 뜻은 아니다.[2] 팀의 task에서 실행 중 wiki retrieval이 필요한지, 아니면 skill compiler에게만 충분한지를 ablation으로 분리해 측정하는 것이 더 안전하다.

결국 WikiSkill의 기여는 에이전트가 스스로 경험을 쌓는다는 주장보다, 그 경험이 **원본 trace, 검토 가능한 지식, 실행 가능한 절차**로 나뉘어야 한다는 운영 모델에 있다. skill을 살아 있는 자산으로 관리하려면 새로운 rule을 쓰는 능력만큼, 실패한 rule의 이유와 근거를 잃지 않는 구조가 필요하다.

## Sources

[1] https://arxiv.org/abs/2608.27454 — WikiSkill 논문 초록·서지·제출 정보
[2] https://arxiv.org/html/2608.27454v1 — 방법, 공식 Figure, ablation 및 benchmark 결과
[3] https://api.github.com/search/repositories?q=WikiSkill%20in%3Aname%2Cdescription%2Creadme&per_page=20 — 논문명 기반 GitHub repository 탐색 결과
