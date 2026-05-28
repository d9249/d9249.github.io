---
title: "MUSE-Autoskill은 에이전트 스킬을 생성·기억·검증·진화하는 생명주기로 묶는다"
date: "2026-05-28T14:19:22"
description: "ByteDance와 RIT의 MUSE-Autoskill은 SKILL.md를 단발성 프롬프트가 아니라 생성, 메모리, 관리, 평가, 정제의 생명주기를 갖는 장기 실행 자산으로 다루며, SkillsBench에서 스킬 사용·자가 생성·교차 에이전트 전이를 함께 평가한 스킬 중심 에이전트 프레임워크다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - AI Agents
  - Agent Skills
  - Skill Memory
  - Self-Evolving Agents
  - ByteDance
image: "/images/blog/muse-autoskill-architecture.webp"
draft: false
---

에이전트 스킬 논의는 점점 세 층으로 나뉘고 있다. 첫째는 좋은 `SKILL.md`를 어떻게 쓰느냐다. 둘째는 수많은 스킬 중 지금 작업에 맞는 것을 어떻게 찾느냐다. 셋째는 에이전트가 한 번 성공하거나 실패한 경험을 어떤 기준으로 다시 스킬에 반영할 것이냐다. 앞의 두 질문만으로는 장기 운영이 어렵다. 스킬이 많아질수록 중복, 낡은 명령, 검증되지 않은 팁, 특정 환경에만 맞는 우연한 절차가 함께 쌓이기 때문이다.

`MUSE-Autoskill: Self-Evolving Agents via Skill Creation, Memory, Management, and Evaluation`은 이 세 번째 질문을 정면으로 다룬다. 논문의 핵심은 스킬을 “한 번 만들어 넣는 도움말 파일”이 아니라 **생성, 메모리, 관리, 평가, 정제의 생명주기를 갖는 실행 자산**으로 보자는 것이다. 새 스킬은 필요할 때 만들어지고, 테스트를 통과해야 Skill Bank에 등록되며, 사용 경험은 skill-level memory에 쌓이고, 실패하거나 중복되는 스킬은 수정·병합·정리된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/muse-autoskill-architecture.webp"
    alt="MUSE-Autoskill architecture showing skill creation, memory, management, evaluation, refinement, and Skill Bank"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 Figure 2. MUSE-Autoskill은 스킬을 생성하고, 메모리에 저장하며, 관리·평가·정제하는 닫힌 생명주기로 묶는다.
  </figcaption>
</figure>

공개 표면을 먼저 확인하면, HF Papers의 `2605.27366`은 arXiv `2605.27366v1`로 연결된다. 저자는 Huawei Lin, Peng Li, Jie Song, Fuxin Jiang, Tieying Zhang이며, 소속은 ByteDance Inc.와 Rochester Institute of Technology로 표기되어 있다. arXiv HTML/PDF/TeX는 공개되어 있지만, 조회 시점 기준 논문 본문에는 MUSE-Autoskill 자체의 공식 GitHub 저장소나 프로젝트 페이지 링크가 보이지 않는다. 외부 URL은 Anthropic Agent Skills 글과 `anthropics/skills` 인용 정도다. 따라서 이 글은 **논문과 arXiv HTML의 공식 figure/table**를 기준으로 정리한다.

## 무엇을 해결하려는가

기존 AutoSkill류 접근은 대체로 “성공한 궤적에서 스킬을 하나 만들자”에 가깝다. 이 자체도 유용하지만, 스킬을 장기적으로 재사용하는 순간 문제가 생긴다. 스킬이 정말 안정적인지, 언제 다시 불러야 하는지, 실패 로그를 어떻게 반영해야 하는지, 비슷한 스킬이 여럿 생겼을 때 어떤 것을 남겨야 하는지 같은 운영 문제가 남는다.

MUSE-Autoskill은 이 문제를 agent loop 내부로 끌어들인다. 에이전트는 기본적으로 `skill_create` 같은 작은 built-in skill만 갖고 시작한다. 나머지 기능은 필요할 때 만들어지는 스킬 패키지다. 패키지는 `SKILL.md`를 중심으로 하고, 필요하면 `scripts/`, `resources/`, `tests/`를 포함한다. 중요한 점은 새 스킬이 만들어졌다고 바로 쓰이는 것이 아니라, sandbox에서 테스트를 통과해야 Skill Bank에 등록된다는 점이다.

이 구조는 에이전트의 자기개선을 “모델 가중치 업데이트”가 아니라 **외부 절차 자산의 품질 관리**로 바꾼다. 모델은 그대로 두고, 실행 가능한 절차 문서와 테스트, 사용 경험, 메모리 파일을 계속 다듬는다. 그래서 MUSE-Autoskill은 SkillOpt처럼 단일 스킬 문서를 validation-gated edit으로 최적화하는 흐름과도 닿아 있지만, 더 큰 차원에서는 스킬 저장소 전체의 lifecycle runtime에 가깝다.

## 핵심 아이디어 / 구조 / 동작 방식

논문이 제시하는 end-to-end flow는 ReAct loop와 Skill Bank를 결합한 형태다. Master Agent가 작업을 수행하다가 기존 스킬로 충분하지 않다고 판단하면 Skill Creator를 호출한다. Creator는 `SKILL.md`와 부속 파일을 만들고, Evaluator가 bundled test를 실행한다. 테스트가 통과하면 스킬이 Skill Bank와 memory에 등록되고, 실패하면 Refiner가 패키지를 패치한 뒤 다시 평가한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/muse-autoskill-end-to-end-flow.webp"
    alt="End-to-end MUSE-Autoskill flow from Master Agent ReAct loop to Skill Bank, Skill Creator, Evaluator, Refiner, and Memory"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 Figure 3. 작업 중 스킬이 필요하면 검색하거나 생성하고, 생성된 스킬은 평가·정제를 거친 뒤 재사용 가능한 자산으로 들어간다.
  </figcaption>
</figure>

이 생명주기는 다섯 단계로 요약할 수 있다.

| 단계 | MUSE-Autoskill에서 하는 일 | 실무적 의미 |
|---|---|---|
| Creation | 기존 스킬이 부족하면 `skill_create`가 `SKILL.md`, optional `scripts/`, `resources/`, `tests/`를 생성 | 절차 지식이 대화 로그에 흩어지지 않고 파일 패키지로 남음 |
| Evaluation | 생성 직후 `tests/`를 sandbox에서 실행하고 통과한 스킬만 등록 | 자기개선이 “그럴듯한 문서 추가”가 아니라 검증 게이트를 통과해야 함 |
| Execution | agent가 catalog를 보고 스킬을 선택한 뒤 `SKILL.md` 절차에 따라 파일 읽기·스크립트 실행·sandbox 도구를 조합 | 별도 실행 엔진이 아니라 기존 ReAct 도구 루프 안에서 스킬이 실행됨 |
| Memory | skill-level memory가 스킬별 사용 이력과 관찰을 축적하고, short/long-term memory가 작업 맥락을 보존 | 스킬이 정적 문서가 아니라 경험을 가진 장기 자산이 됨 |
| Management | 실패 스킬은 refine, 중복 스킬은 merge, 오래 안 쓰거나 계속 실패하는 스킬은 prune | 스킬 라이브러리의 비대화와 오염을 줄이는 운영 규칙 |

여기서 눈여겨볼 부분은 “스킬 실행”을 별도의 복잡한 runtime으로 만들지 않았다는 점이다. 논문은 스킬 실행이 agent의 일반 도구 호출 안에서 일어난다고 설명한다. 에이전트는 `SKILL.md`를 읽고, 필요하면 `resources/`를 참조하고, `scripts/`를 sandbox에서 실행한다. 즉 스킬은 tool의 대체물이 아니라, **도구를 어떤 순서와 기준으로 사용할지 알려 주는 절차 패키지**에 가깝다.

## skill-level memory와 context compression

MUSE-Autoskill의 차별점은 스킬을 만든 뒤 끝내지 않고, 각 스킬에 붙은 memory scope를 둔다는 데 있다. 논문은 short-term memory, long-term memory에 더해 per-skill memory를 별도로 둔다. 이 memory에는 스킬 설명, 입력/출력, 사용 이력, 관찰이 쌓인다. 덕분에 에이전트는 같은 문제를 만났을 때 스킬을 새로 만들지 않고, 이전 사용 경험까지 참고해 재사용할 수 있다.

또 하나 중요한 장치는 context management다. 장기 작업에서는 대화 노드, 도구 출력, 관찰 로그가 계속 늘어나 context budget을 압박한다. MUSE는 각 ReAct turn을 `plan/action/observation` 노드로 보고, 이 노드들을 DAG로 관리한다. 첫 부분과 마지막 부분은 고정하고, 중간 노드만 압축 대상으로 삼는다. 큰 단일 관찰은 Level-1로 개별 요약하고, 그래도 budget을 넘으면 Level-2로 여러 중간 turn을 하나의 synthetic node로 합친다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/muse-autoskill-adaptive-context-compression.webp"
    alt="Adaptive context compression over a DAG of ReAct turns with Level-1 node compression and Level-2 chain compression"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 Figure 4. MUSE는 ReAct turn을 DAG로 보존하면서, active chain만 adaptive compression으로 줄인다. 원본 history pointer는 남기기 때문에 replay 가능성을 유지한다.
  </figcaption>
</figure>

이 설계는 스킬 생명주기와 직접 연결된다. 긴 작업에서 context를 무작정 잘라내면 어떤 스킬이 왜 만들어졌는지, 어떤 실패가 refinement를 유발했는지, 어떤 관찰이 memory에 들어가야 하는지 흐려진다. MUSE는 active context를 압축하되 원본 노드는 history에 남겨 audit trail을 유지하려 한다. 스킬이 장기 자산이 되려면, 그것을 만든 증거도 함께 관리되어야 한다는 관점이다.

## 공개된 근거에서 확인되는 점

평가는 SkillsBench의 51개 task를 중심으로 한다. 원래 SkillsBench에는 94개 task가 있지만, 논문은 그중 51개를 사용한다. 작업은 Science & Engineering, Data Analysis, Document Processing, Ops & Planning의 네 super-domain으로 묶였다. 비교 대상은 GPT-5.5 기반의 Codex, Hermes, MUSE-Autoskill 세 agent이며, 각 task는 Docker verifier 환경에서 5회씩 평가된다.

첫 번째 결과는 human-authored skill을 주입했을 때다. 세 agent 모두 스킬을 쓰면 13~15 percentage points 수준으로 성능이 오른다.

| Agent | Without Skills | With Human Skills | Lift |
|---|---:|---:|---:|
| Codex | 52.11% | 67.28% | +15.17 pp |
| Hermes | 47.89% | 61.21% | +13.33 pp |
| MUSE-Autoskill | 53.19% | 68.40% | +15.21 pp |

MUSE-Autoskill은 전체 68.40%로 with-skills 기준 최고 점수를 보인다. domain별로 보면 Data Analysis, Document Processing, Ops & Planning에서는 MUSE-Autoskill이 가장 높고, Science & Engineering에서는 Codex가 앞선다. 논문은 S&E의 일부 boundary failure를 방법론 선택이 verifier 요구와 어긋난 사례로 설명한다.

더 흥미로운 결과는 self-created skill이다. MUSE-Autoskill은 Phase 1에서 스킬 없이 task를 풀고, 성공한 task의 최선 trajectory를 바탕으로 스킬을 만든다. 51개 task 중 35개에서 스킬 생성에 성공했고, 전체 51개 기준 self-created skill 정확도는 60.35%다. 이 숫자만 보면 human skill 68.40%보다 낮지만, 성공적으로 스킬이 만들어진 35개 task만 보면 Phase 2 정확도는 87.94%까지 올라간다.

| 설정 | 51개 task 기준 정확도 | 해석 |
|---|---:|---|
| MUSE-Autoskill without skills | 53.19% | 스킬 없는 baseline |
| MUSE-Autoskill with human skills | 68.40% | 사람이 만든 reference skill |
| MUSE-Autoskill self-created skills | 60.35% | 생성 실패 16개 task를 0으로 포함한 전체 평균 |
| Self-created skills on covered 35 tasks | 87.94% | Phase 1 성공 궤적이 있는 task에서는 매우 강한 절차 압축 효과 |

이 결과의 해석은 명확하다. MUSE의 병목은 생성된 스킬의 품질보다 **coverage**다. 한 번이라도 성공 궤적을 만들 수 있으면 꽤 강한 스킬을 뽑아낼 수 있지만, 처음부터 전혀 못 푸는 task에서는 distillation할 재료가 없다. 논문이 밝힌 16개 실패 task도 geospatial hydrology, MILP scheduling, power-grid optimization, corrupted Excel recovery, long-form regulatory parsing처럼 specialized tooling이나 비텍스트 수치 추론이 필요한 쪽에 몰려 있다.

## 교차 에이전트 전이와 비용

MUSE-Autoskill의 좋은 점은 생성된 스킬이 MUSE 내부 동작에만 묶여 있지 않다는 실험을 넣었다는 것이다. 논문은 MUSE가 만든 스킬을 수정 없이 Hermes에 주입한다. 그 결과 Hermes는 47.89%에서 58.40%로 오른다. Hermes의 human skill reference가 61.21%이므로, MUSE-generated skill은 그 격차의 79%를 닫는다. 같은 generated skill을 쓸 때 MUSE-Autoskill은 60.35%, Hermes는 58.40%로 약 1.95점 차이에 그친다.

| 설정 | Hermes | MUSE-Autoskill |
|---|---:|---:|
| Without skills | 47.89% | 53.19% |
| With MUSE-generated skills | 58.40% | 60.35% |
| With human skills | 61.21% | 68.40% |

이건 스킬을 모델 내부 잠재상태가 아니라 **외부화된 지식 자산**으로 볼 수 있다는 주장에 힘을 준다. 사람이 읽을 수 있는 문서와 optional script/test로 떨어진다면, 한 agent가 만든 절차가 다른 agent에 그대로 이전될 수 있다.

비용 결과도 직관과 조금 다르다. MUSE가 생성한 skill은 human skill보다 길다. median `SKILL.md` line 수가 human 146 lines, MUSE 326 lines로 약 2.2배다. 그런데 generated skill을 사용할 때는 오히려 token과 latency가 줄어든다. 논문은 더 자세한 절차가 agent의 장황한 탐색을 줄여 전체 turn 수를 낮추기 때문이라고 해석한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/muse-autoskill-skill-anatomy.webp"
    alt="Human-authored versus MUSE-generated skill anatomy comparing SKILL.md line counts and subdirectory composition"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 Figure 6. MUSE-generated skill은 더 길고 절차적이며, 일부는 `tests/`를 포함한다. 논문은 이를 “더 verbose”가 아니라 입출력·실패 모드·절차가 더 명시적인 구조로 해석한다.
  </figcaption>
</figure>

35개 covered task 기준 비용 표를 보면 이 차이가 더 분명하다.

| Agent | 설정 | Tokens | Latency | Turns |
|---|---|---:|---:|---:|
| MUSE-Autoskill | With human skills | 615K | 656s | 19 |
| MUSE-Autoskill | With generated skill | 493K | 411s | 15 |
| Hermes | With human skills | 186K | 369s | 14 |
| Hermes | With generated skill | 97K | 257s | 13 |

물론 스킬 생성 자체에는 한 번의 비용이 든다. 논문 기준 Phase 2 skill creation은 task당 median 383K tokens, 164초다. 하지만 MUSE-Autoskill에서는 generated skill 사용 시 human skill 대비 122K tokens를 절약하므로 약 3회 재사용이면 token 기준 생성 비용을 회수할 수 있다고 설명한다. latency는 첫 재사용에서도 생성 비용을 넘는 절약이 나타난다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/muse-autoskill-pareto-skills.webp"
    alt="Pareto plots showing MUSE-generated skills with higher reward, lower latency, and fewer tokens than human skills"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 Figure 5. 생성된 스킬은 covered task 평균에서 reward를 올리면서 latency와 token을 낮추는 Pareto 이동을 보인다.
  </figcaption>
</figure>

전체 51개 task 분포에서는 human skill만 추가해도 모든 agent의 latency upper tail이 줄어든다. Codex의 p75 latency는 1297초에서 1067초로 내려가고, MUSE-Autoskill도 median latency가 635초에서 604초로 내려간다. token 관점에서는 skill text가 prompt에 들어가므로 항상 공짜는 아니다. 하지만 prompt caching과 turn 감소가 일부 비용을 흡수한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/muse-autoskill-skill-tradeoffs.webp"
    alt="Skill-induced latency-token reward tradeoffs for Codex, Hermes, and MUSE-Autoskill"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 Figure 7. 스킬은 latency-reward 축에서는 대체로 up-left로, token-reward 축에서는 up-right로 움직인다. 즉 시간은 줄지만 입력 토큰 비용은 늘 수 있다.
  </figcaption>
</figure>

## 실무 관점에서의 해석

MUSE-Autoskill의 가장 큰 메시지는 “에이전트가 경험을 쌓는다”는 말을 꽤 엔지니어링 가능한 구조로 낮춘다는 점이다. 막연한 장기기억이 아니라, 스킬 패키지, 테스트, 사용 이력, per-skill memory, compression history, prune/merge/refine 정책으로 쪼갠다. 이 구조는 실제 agent 운영에서 바로 만나는 문제와 잘 맞는다.

개인용 코딩 에이전트나 연구 에이전트에서도 비슷한 패턴이 필요하다. 특정 저장소에서 테스트를 어떻게 돌리는지, 어떤 warning은 무시해도 되는지, 어떤 API 문서가 canonical source인지, 어떤 실패 로그를 먼저 볼지 같은 지식은 매번 대화로 설명하기보다 스킬로 남기는 편이 낫다. 하지만 아무 성공 사례나 스킬로 저장하면 오염이 생긴다. MUSE의 교훈은 **기억하라**가 아니라 **테스트와 사용 이력으로 통제하면서 기억하라**에 가깝다.

조직 환경에서는 세 가지 질문을 던질 수 있다.

| 질문 | MUSE-Autoskill 관점의 답 |
|---|---|
| 새 스킬은 언제 만들 것인가 | 기존 Skill Bank로 부족하고, 목적·입력·출력·검증 기준을 정의할 수 있을 때 |
| 스킬을 어떻게 믿을 것인가 | `tests/`나 verifier 같은 실행 가능한 gate를 통과한 뒤 등록 |
| 스킬 라이브러리가 커지면 어떻게 할 것인가 | metadata catalog, progressive disclosure, merge/prune/refine 정책으로 관리 |

다만 이 논문을 그대로 제품 성숙도로 읽으면 곤란하다. 공개 코드 링크가 없는 연구 논문이고, 평가도 SkillsBench 94개 중 51개 task에 한정된다. self-created skill은 35/51 task에서만 생성됐고, cross-agent transfer도 MUSE-Autoskill에서 Hermes로 가는 한 방향만 검증됐다. 또한 각 generated skill은 한 successful trajectory에서 증류되어 같은 task에서 다시 평가된다. 논문도 이 protocol이 within-task gain을 과대평가할 수 있다고 인정한다.

그래도 방향성은 중요하다. SkillOpt가 “개별 skill 문서를 어떻게 validation-gated로 최적화할 것인가”를 보여 줬고, SkillsVote가 “스킬 추천·귀속·진화를 어떻게 거버넌스할 것인가”를 다뤘다면, MUSE-Autoskill은 그 사이에서 **실행 중인 에이전트가 스킬을 만들고, 테스트하고, 기억하고, 다시 쓰는 runtime architecture**를 제시한다. 에이전트의 실력은 모델 하나의 능력이 아니라, 외부 절차 자산을 얼마나 잘 만들고 운영하느냐에 의해 크게 달라진다는 흐름이 더 선명해지고 있다.

결국 이 논문이 던지는 질문은 단순하다. 에이전트가 일을 하며 배운다면, 그 배움은 어디에 저장되어야 하는가. MUSE-Autoskill의 답은 모델 가중치가 아니라, 테스트 가능한 `SKILL.md` 패키지와 그 주변의 memory·management·evaluation loop다. 모든 문제를 풀지는 못하지만, “스킬을 쓰는 에이전트”에서 “스킬을 운영하는 에이전트”로 넘어가는 꽤 좋은 청사진이다.

## 한 줄로 요약하면

MUSE-Autoskill은 에이전트 스킬을 단발성 프롬프트 자산이 아니라 **생성 → 테스트 → 등록 → 사용 경험 축적 → 수정·병합·정리**를 거치는 장기 운영 자산으로 바꾸려는 프레임워크다.

Sources: https://huggingface.co/papers/2605.27366, https://arxiv.org/abs/2605.27366, https://arxiv.org/html/2605.27366v1, https://arxiv.org/pdf/2605.27366v1.pdf
