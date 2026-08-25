---
title: "Skill-Use는 에이전트가 스킬을 ‘갖고 있는가’가 아니라 ‘제때 찾아 끝까지 따르는가’를 묻는다"
date: "2026-08-26T00:21:41+09:00"
description: "Skill-Use는 점진적 공개 환경에서 에이전트의 스킬 인식·절차 이행·금지 행동 회피를 분리 측정하는 79개 실전 스킬·177개 sandbox task 기반 벤치마크로, 최강 조합도 SU 0.613에 머문다고 보고한다."
author: "Sangmin Lee"
category: "evaluation-benchmarks"
tags:
  - Skill-Use
  - Agent Skills
  - Agent Evaluation
  - Agent Harness
  - Progressive Disclosure
draft: false
---

에이전트 생태계에서 `SKILL.md`와 유사한 절차 문서는 빠르게 늘고 있다.[2]
 하지만 “스킬 파일을 설치했다”는 사실은 모델이 적절한 순간에 그 파일을 열고, 정해진 순서와 제약을 지키며, 필요하지 않을 때는 오히려 호출을 멈춘다는 뜻이 아니다.[2]
 **Skill-Use**는 바로 이 사용 단계의 빈틈을 독립된 평가 대상으로 만든 연구다.[1][2]

논문은 점진적 공개(progressive disclosure)를 실제 조건으로 둔다.[2]
 에이전트는 처음부터 전문을 받지 않고 스킬 이름·짧은 설명·파일 경로만 본다.[2]
 요청과 환경을 보고 관련 스킬을 찾는다고 판단해야 전문을 읽을 수 있다.[2]
 따라서 이 벤치마크는 “주어진 지시문을 잘 따르는가”가 아니라 **스킬을 인식하고, 불러오고, 실행 궤적 전체에서 따르는가**를 묻는다.[2]

저자들은 79개의 실제 스킬, 177개의 실행 가능한 task, 9개 도메인을 묶고, 모든 task를 실제 파일과 도구가 있는 격리 Docker sandbox에서 실행한다.[2]
 채점은 최종 답변만 보지 않고 tool call·파일 산출물·실행 순서를 포함한 trajectory rubric으로 이뤄진다.[2]
 가장 좋은 model–harness 조합도 종합 Skill-Use(SU)가 <strong>0.613</strong>에 그쳤다는 결과는, 스킬을 가진 에이전트의 신뢰성이 아직 설치·배포 관행보다 훨씬 어려운 문제임을 보여 준다.[1][2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/skill-use-benchmark-pipeline.png">
    <img
      src="/images/blog/skill-use-benchmark-pipeline.png"
      alt="Skill-Use 공식 데이터 구축 흐름. 왼쪽부터 실제 스킬 선별과 task 생성, 3계층 trajectory rubric 구성, 실행 가능성·일관성·rubric 신뢰성 검증을 거쳐 benchmark를 공개한다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 repository의 benchmark 구축 흐름.[2]
 105,586개 후보에서 실제 절차 제약이 관찰 가능한 스킬을 좁히고, task·rubric·sandbox를 함께 검증하는 구조다.[2][3]
  </figcaption>
</figure>

## 무엇을 해결하려는가

기존 skill 평가에는 두 가지 공백이 있다.[2]
 SkillsBench처럼 “스킬을 제공했을 때 task completion이 좋아지는가”를 보는 평가가 있고, SLBench처럼 전문이 이미 주어진 상태에서 절차·제약을 잘 지키는지 보는 평가가 있다.[2]
 전자는 소비 주체인 에이전트의 선택 과정을 잘 보지 못하고, 후자는 실제 하네스의 retrieval 단계를 건너뛴다.[2]
 Skill-Use는 이 둘 사이에서 **스킬을 찾아야만 절차를 볼 수 있는** 조건을 재현한다.[2]

평가 단위는 `(스킬, 사용자 요청, 실행 환경, 숨은 rubric)`이다.[2]
 agent에게는 요청, sandbox의 파일·도구, 그리고 스킬 metadata만 주어진다.[2]
 rubric은 평가자만 보며, agent가 전문을 실제로 열었는지와 이후 행동이 절차와 금지 규칙에 맞는지를 실행 기록과 결과물로 확인한다.[2]
 이는 모델이 “스킬을 읽었다”고 말하는 것과 정말로 그 지시를 실행한 것을 구분하기 위한 장치다.[2]

| 측정 축 | 평가하는 질문 | 놓쳤을 때의 실패 |
|---|---|---|
| Trigger | 관련 스킬을 인식하고 전문을 열었는가 | 필요한 procedure를 보지 못하고 일반 추론으로 진행 |
| Compliance | 스킬이 요구한 도구·순서·형식을 충실히 따랐는가 | 스킬을 열었지만 핵심 step을 생략하거나 다른 방식으로 우회 |
| Boundary | 스킬이 금한 행동을 피했는가 | 결과는 나왔지만 금지된 도구·shortcut·위험한 행동을 사용 |
| Skill-Use (SU) | Trigger 이후 Compliance와 Boundary를 합친 값 | 호출만 했거나, 규칙을 부분적으로만 따른 성공을 과대평가 |

SU는 Trigger가 0이면 실행 품질에 점수를 주지 않는 gated metric이다.[2]
 저자들은 Compliance에 더 큰 가중치 `α=0.7`을 둔다.[2]
 “금지 행동을 피했다”만으로는 충분하지 않고, 지정된 절차를 실제로 끝까지 수행하는 것이 이 benchmark의 중심이기 때문이다.[2]

## 핵심 아이디어: 결과물이 아니라 실행 궤적을 채점한다

Skill-Use의 강점은 skill 문서와 task를 느슨하게 연결하지 않는 데 있다.[2]
 retained skill은 task prompt나 일반적인 좋은 습관만으로는 알 수 없는 **skill-exclusive requirement**를 가져야 한다.[2]
 예컨대 특정 도구 선택, 작업 순서, 금지된 대안, 결과 파일 이름처럼 스킬 전문을 읽어야만 알 수 있는 조건이다.[2]
 그런 조건이 없는 문서는 prompt만으로도 만족될 수 있어 skill-use signal에서 제외된다.[2]

각 rubric은 세 계층으로 나뉜다.[2]
 evaluability gate는 run이 정상적으로 채점 가능한지 확인하지만 점수에는 들어가지 않는다.[2]
 Compliance와 Boundary는 스킬에서 온 requirement를 측정하며 SU를 만든다.[2]
 task-outcome 항목은 사용자가 원한 산출물이 나왔는지 기록하지만, 스킬을 잘 썼다는 점수와는 분리한다.[2]
 그래서 “답은 맞았지만 skill을 안 읽었다”와 “skill을 읽었지만 산출물을 망쳤다”를 다른 실패로 진단할 수 있다.[2]

이 구분은 실제 agent engineering에도 유용하다.[2]
 최종 artifact만 보면 prompt·모델·도구·하네스 중 어디가 실패했는지 알기 어렵다.[2]
 반면 Trigger, Compliance, Boundary를 분리하면 스킬 이름·설명·검색 인터페이스가 약한지, procedure 자체가 지나치게 길거나 모호한지, 위험한 shortcut을 막는 guardrail이 부족한지를 따로 고칠 수 있다.[2]

## 공개된 결과: ‘호출’과 ‘이행’은 별개의 병목이다

논문은 Claude Code와 Codex 두 harness에서 7개 model family의 8개 LLM을 평가한다.[2]
 Claude Code에서는 GPT-5.5가 Trigger 0.972, Compliance 0.611, Boundary 0.718, SU 0.613으로 가장 높았다.[2]
 Codex에서는 Claude Opus 4.8이 SU 0.559로 최고였다.[2]
 같은 model이라도 harness에 따라 순위와 절대 점수가 움직이므로, 저자들은 skill use를 고정된 model capability가 아니라 **model + harness configuration의 성질**로 해석한다.[2]

| Harness | 최고 SU 조합 | Trigger | Compliance | Boundary | SU |
|---|---|---:|---:|---:|---:|
| Claude Code | GPT-5.5 | 0.972 | 0.611 | 0.718 | <strong>0.613</strong> |
| Codex | Claude Opus 4.8 | 0.881 | 0.599 | 0.715 | <strong>0.559</strong> |

숫자에서 더 중요한 패턴은 Boundary가 거의 모든 조합에서 Compliance보다 높다는 점이다.[2]
 모델은 금지된 작업을 피하는 쪽보다, 요구한 tool·순서·검증을 모두 수행하는 쪽에서 더 자주 흔들렸다.[2]
 또 Trigger가 낮은 모델은 전문을 열기만 하면 상위 모델과 비슷한 conditional compliance를 보이는 경우도 있었다.[2]
 즉 “스킬을 못 따른다”는 한 문장은 recognition failure와 execution failure를 섞어 버린다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/skill-use-benchmark-results.png">
    <img
      src="/images/blog/skill-use-benchmark-results.png"
      alt="Skill-Use 논문 Figure 6. 스킬 라이브러리가 1개에서 10개로 늘 때 target-skill selection이 크게 떨어지고, 대규모 라이브러리에서 실패의 대부분은 잘못된 스킬 호출보다 스킬을 전혀 호출하지 않는 경우임을 보여 준다. 또한 낮은 SU에서는 task completion gain이 음수이고 높은 SU에서만 양수가 된다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 6.[2]
 영어 원본 그림이다.[2]
 라이브러리를 1개에서 10개로 늘릴 때 selection drop이 가장 크고, 실패의 주된 형태가 wrong-skill보다 no-skill임을 보여 준다.[2]
 낮은 SU 구간에서는 skill을 부분 적용한 run이 no-library baseline보다 task completion을 떨어뜨릴 수 있다.[2]
  </figcaption>
</figure>

### 라이브러리가 커지면 ‘잘못 고르기’보다 ‘아예 안 부르기’가 늘어난다

저자들은 Claude Code에서 target skill과 distractor를 합쳐 1·10·20·30개 라이브러리를 구성했다.[2]
 target skill은 항상 들어 있지만, 1개에서 10개로 늘어날 때 selection rate가 크게 떨어진다.[2]
 이후 더 늘려도 곡선 변화는 비교적 작다.[2]
 그리고 대규모 라이브러리의 실패는 대체로 다른 스킬을 잘못 호출한 경우가 아니라 **아무 스킬도 호출하지 않은 경우**였다.[2]

이 결과는 skill registry의 설계가 단순 검색 정확도만의 문제가 아님을 시사한다.[2]
 후보를 몇 개 보여 줄지, 이름·한 줄 설명이 적용 범위를 얼마나 선명하게 전달하는지, 모델이 “지금은 스킬을 읽어야 한다”고 판단하는 진입 비용이 모두 영향을 준다.[2]
 특히 `test-driven-development`나 `software-architecture`처럼 넓고 겹치는 이름은 wrong-skill selection을 만들 수 있지만, 전반적인 병목은 후보 사이 선택보다 skill 호출 결정을 내리지 않는 데 있었다.[2]

### 부분적으로 쓴 스킬은 없는 스킬보다 나쁠 수 있다

논문은 skill library를 끈 baseline과, target skill을 실제로 Trigger한 run을 같은 task·model 단위로 짝지어 비교한다.[2]
 그 결과 paired task-completion gain은 SU 약 0.5 부근에서 음수에서 양수로 바뀐다.[2]
 procedure를 일부만 적용하면 정해진 toolchain이나 output format에는 진입했지만 끝까지 수행하지 못해, 모델이 스스로 풀었을 때보다 결과가 나빠질 수 있다는 해석이다.[2]

이것은 실무에서 “관련 스킬을 찾았으니 자동 적용하자”가 위험할 수 있는 이유다.[2]
 스킬 적용을 효율화하려면 retrieval 성공뿐 아니라, 충분한 execution quality가 있는지 확인하는 validator·fallback·human gate가 필요하다.[2]
 skill이 strict한 파일 변환, 보안 점검, 배포처럼 부작용을 동반할수록, partial compliance를 성공으로 간주해서는 안 된다.[2]

## 공개 artifact는 재현용 연구 번들에 가깝다

공식 repository `JinyiHan99/Skill-Use-Bench`는 `benchmark/`에 스킬 문서·YAML task·trajectory rubric·sandbox asset을 두고, `evaluation/`에 Docker와 run/scoring script를 제공한다.[2]
 README의 기본 setup은 Docker image build, `pyyaml`과 `openai` 설치, Claude Code 또는 Codex용 API credential을 요구한다.[2]
 run 결과는 `trace.jsonl`, `answer.txt`, `meta.json`으로 저장되고, scorer는 Trigger·Compliance·Boundary·SU와 triggered-only metric을 계산한다.[3]

다만 이는 설치 한 번으로 바로 쓰는 일반 SDK보다 containerized evaluation bundle에 가깝다.[2]
 확인 시점에 GitHub API는 repository license를 비워 두고 있으며 root `LICENSE` 파일도 찾을 수 없었지만, README badge는 code를 MIT, data를 CC BY 4.0으로 표기한다.[2]
 GitHub Releases와 tags도 비어 있다.[2]
 즉 재사용이나 재배포를 고려한다면 README badge만으로 확정하지 말고, 저자 쪽의 명시적 LICENSE 추가나 후속 release를 확인하는 편이 안전하다.[3]

## 실무 관점에서의 해석

Skill-Use의 가장 중요한 메시지는 좋은 skill document 자체보다 **skill-use contract**다.[2]
 운영 환경에서는 적어도 다음 네 가지를 분리해 관찰할 필요가 있다.[2]

1.[2]
 **발견**: name·description·metadata만으로 필요한 skill을 찾을 수 있는가?
2.[2]
 **진입**: 현재 요청이 정말 full procedure를 불러올 만큼 relevant한가?
3.[2]
 **이행**: tool 선택·순서·artifact 검증을 실제 trajectory로 증명하는가?
4.[2]
 **절제**: scope 밖 요청에서 불필요한 skill call이나 금지 행동을 피하는가?

이 계약을 telemetry와 evaluator에 넣으면 skill system을 “prompt bundle의 개수”가 아니라 fault isolation 가능한 runtime으로 다룰 수 있다.[2]
 Trigger가 낮으면 catalog 설명·retrieval·load policy를, Compliance가 낮으면 스킬을 더 짧고 검증 가능한 step으로, Boundary가 낮으면 deterministic guard와 권한 경계를 우선 개선할 수 있다.[2]

반대로 이 benchmark의 점수를 production 안전성 인증으로 읽으면 안 된다.[2]
 논문은 공개 스킬과 open-source dataset을 sandbox에서 평가한 preprint이며, 실제 조직의 권한, 장기 상태, 민감 데이터, 승인 흐름, 비가역적 외부 효과까지 포괄하지 않는다.[2]
 그렇지만 agent skills가 보급 단계에서 신뢰성 단계로 넘어가려면, “스킬을 제공했더니 task가 끝났다”보다 **언제 읽었고, 어떻게 따랐고, 무엇을 하지 않았는가**를 기록해야 한다는 기준을 제시한다.[1][2]

## Sources

[1] https://arxiv.org/abs/2608.04828 — arXiv abstract: 2608.04828
[2] https://arxiv.org/html/2608.04828 — arXiv HTML: 2608.04828
[3] https://github.com/JinyiHan99/Skill-Use-Bench — Skill-Use-Bench GitHub repository
