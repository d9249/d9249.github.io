---
title: "Repo-To-Skill은 GitHub 저장소를 실행 가능한 연구 에이전트 지식으로 바꾼다"
date: "2026-09-04T14:20:00"
description: "Repo-To-Skill은 DisCo가 repository·paper·task 자료에서 절차·검증·복구 경로를 skill graph로 증류하고, AREX-Skill Library가 필요한 분기만 research agent에 로드하는 운영 지식 계층을 제안한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - AREX-Skill
  - DisCo
  - Agent Skills
  - Auto Research
  - Knowledge Distillation
draft: false
---

연구 에이전트의 성능을 설명할 때 흔히 모델과 harness를 먼저 본다. 더 좋은 backbone, 더 긴 context, 더 정교한 planner, 더 많은 tool call이 대표적인 개선 축이다. 하지만 실제 ML 연구·재현·실험에서는 “방법을 안다”와 “이 환경에서 방법을 끝까지 작동시킨다” 사이에 큰 간극이 남는다. repository와 paper에 흩어진 설치 순서, validation check, 실패 패턴, recovery 절차가 그 간극을 메운다.[1][2]

*Repo-To-Skill: Distilling GitHub Repositories Into AI4AI Skills*는 이 층을 **operational knowledge**라고 부른다. 핵심 주장은 단순 요약을 context에 더 넣자는 것이 아니다. source에서 언제 적용할지, 무엇을 실행할지, 무엇을 확인할지, 실패하면 어떻게 복구할지를 검증 가능한 skill graph로 묶고, 실제 research agent가 task에 필요한 분기만 읽게 하자는 것이다.[1][2]

논문의 시스템 이름은 `DisCo`, 공개 library와 repository 이름은 `AREX-Skill`이다. 논문은 이 구조를 1,000개 ML repository에서 5,000개 이상의 verified skill로 확장했다고 보고하며, 공개 README도 같은 규모·20개 area·178개 package family·router 구조를 제시한다.[1][6]

## 무엇을 해결하려는가

원시 source는 agent가 바로 실행할 operating context가 아니다. README는 API를 설명하지만 어떤 예제를 먼저 돌려야 할지 빠질 수 있고, paper는 방법의 이유를 설명하지만 dependency conflict나 평가 실패의 recovery path까지 담지 않는다. 매 task마다 agent가 source를 다시 탐색·조합·디버깅하면, 같은 execution budget이 새로운 실험보다 이미 알려진 운영 지식의 재구성에 쓰인다.[1][6]

DisCo는 이 문제를 model이나 control loop의 교체가 아니라 **지식 계층의 추가**로 정의한다. task-agnostic distillation은 널리 쓰이는 repository를 미리 reusable skill로 만들고, task-oriented distillation은 특정 research task의 source constraint·evaluation protocol·verification condition에 맞는 graph를 on-demand로 만든다. 두 흐름 모두 source만으로 skill을 통과시키지 않고 verification을 거친다는 것이 논문의 설계 원칙이다.[1][2][7]

## 핵심 아이디어 / 구조 / 동작 방식

DisCo에는 역할이 분명히 다른 두 모드가 있다. `Creator`는 source 또는 task anchor에서 capability를 범위화하고, 허용 가능한 evidence를 고르고, candidate skill graph를 만들고, check·trial·refinement를 거쳐 accepted graph와 construction record를 남긴다. `Researcher`는 반대로 이미 받아들여진 graph의 필요한 부분만 operating context로 읽고, code·tool·experiment를 사용해 최종 연구 task를 수행한다.[2][7][8]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/repo-to-skill-operating-knowledge-stack.svg"
    alt="소스 또는 과제가 Creator의 scope, evidence grounding, skill graph construction, verification을 거쳐 AREX-Skill Library와 router에 들어가고 Researcher가 필요한 skill 분기만 로드해 실행하는 세로 구조도"
    style="width: 100%; max-width: 660px; height: auto; display: block; margin: 0 auto;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문의 중심은 agent가 모든 지식을 처음부터 읽는 것이 아니라, Creator가 검증한 운영 지식을 library에 적재하고 Researcher가 task별로 선택해 쓰는 연결이다.[2][7][8]
  </figcaption>
</figure>

여기서 skill은 짧은 prompt 조각이 아니다. 공개 README 기준으로 `SKILL.md`에는 scope·routing·workflow·validation을 두고, 필요하면 `references/`에 집중 지침과 source provenance를, `scripts/`에 executable helper·diagnostic·check을 둔다. repository가 여러 capability를 가질 때는 skill을 graph로 연결하고, router가 area → family → repository → workflow 순서로 범위를 줄여 initial context를 과도하게 키우지 않는다.[6][8]

공개 runtime도 이 분업에 맞춰져 있다. Researcher가 기본 mode이고 Creator는 명시적으로 선택해야 하며, cross-mode request는 자동으로 역할을 바꾸지 않고 새 session 전환을 요구한다. 이는 skill을 작성하는 흐름과 skill을 사용해 실험을 수행하는 흐름을 같은 prompt 안에서 섞지 않으려는 운영 경계다.[7][8]

## 공개된 근거에서 확인되는 점

논문은 Codex harness, GPT-5.5 backbone, downstream execution budget을 고정하고 skill 유무만 바꿨다고 설명한다. 이 조건에서 보고된 결과는 네 benchmark 모두에서 skill-equipped agent가 baseline보다 높았다. 아래 숫자는 저자 측 평가 결과이며, 독립 재현이나 모든 agent stack에 대한 보편적 효과로 읽어서는 안 된다.[1][2]

| Benchmark | Codex → AREX-Skill (상대 향상) |
|---|---:|
| MLE-bench | 31.11 → 72.89 (+134.3%) |
| PaperBench | 29.45 → 39.59 (+34.4%) |
| FrontierCS | 70.63 → 77.14 (+9.2%) |
| PassNet | 1.343 → 1.531 (+14.0%) |

![Codex와 Codex plus AREX-Skill을 MLE-bench, PaperBench, FrontierCS, PassNet에서 비교한 AREX-Skill 공식 결과 차트](/images/blog/arex-skill-benchmark-results.png)

평가의 흥미로운 점은 “skill을 많이 넣었으니 성능이 올랐다”는 비교보다 controlled factor를 분리하려 했다는 데 있다. 논문은 MLE-bench 전체 75 competition, PaperBench 20 paper, FrontierCS 188 task, PassNet 200 sample에서 같은 harness·backbone·budget을 유지했다고 서술한다. 그래서 이 표가 직접 지지하는 결론은 **해당 Codex/GPT-5.5 setup에서 distilled operating context가 유효했다**는 것이지, 특정 foundation model 자체가 더 강해졌다는 뜻은 아니다.[2]

공개 artifact도 단순 paper supplement보다 넓다. 현재 `AREX-Skill` repository는 Apache-2.0으로 공개되어 있고, CLI package `@arex-skill/disco`의 최신 GitHub release는 v0.2.1(2026-09-02)이다. release에는 macOS/Linux용 shell installer, Windows PowerShell installer, checksum이 포함되며 README는 Node.js 22.19.0 이상과 npm 기반 설치 경로를 안내한다.[4][5][6]

다만 license는 한 겹이 아니다. repository-level 자료와 공개 runtime repository skill은 Apache-2.0으로 제시되지만, README는 library 내부 각 skill의 `SKILL.md` license metadata가 그 skill에 대해서는 authoritative하다고 명시한다. 즉 library 전체를 도입하거나 skill을 다른 runtime으로 export할 때는 repository license만 보고 상업적 재사용 조건을 단정하면 안 된다.[3][6]

## 실무 관점에서의 해석

Repo-To-Skill의 강점은 “agent에게 더 많은 문서를 주자”가 아니라 **반복해서 등장하는 운영 판단을 versioned interface로 만들자**는 데 있다. 좋은 skill graph는 command reference가 아니라 적용 조건, 최소 실행 경로, 성공 signal, 실패 시 확인 순서, source provenance를 함께 가져야 한다. 이 구조가 유지되면 팀은 같은 environment setup과 recovery trial을 매 project마다 새로 발명하지 않아도 된다.

특히 library router는 단순 검색 UI보다 context budget 정책에 가깝다. 5,000개 skill을 한 번에 모델에 넣는 대신 task를 area·family·repository·workflow로 좁혀 필요한 branch만 여는 방식은, retrieval 결과를 실제 execution order로 번역하는 계층이다. repository skill root를 model-visible 목록에서 숨기고 router만 앞에 두는 공개 architecture도 이 의도를 뒷받침한다.[6][8]

도입 시에는 benchmark headline보다 세 가지를 먼저 검증할 만하다. 첫째, 우리 team's recurring workflow에서 source provenance와 validation step이 실제로 유지되는가. 둘째, skill을 읽은 뒤 tool call·step·실패 재시도가 줄어드는가. 셋째, upstream version이 바뀌었을 때 refresh가 stale instruction을 찾아내고 local customization을 보존하는가. DisCo의 `repo-skills status`는 offline integrity를, `update`는 remote HEAD 확인을 맡도록 분리되어 있어 이런 운영 검증의 출발점으로 볼 수 있다.[7][8]

결국 이 논문은 autonomous research의 경쟁 단위를 model과 harness 둘만으로 보지 않는다. source-grounded operational knowledge를 세 번째 층으로 만들고, Creator가 그 층의 품질을 책임지며, Researcher가 task에서 소비하게 한다. 공개 code와 benchmark 결과가 아직 저자 주도 평가라는 한계는 남지만, agent skill을 “프롬프트 모음”이 아니라 **검증·복구·provenance를 포함한 실행 지식 artifact**로 다루는 프레임은 실무적으로 설득력이 있다.

## Sources

[1] https://arxiv.org/abs/2609.02749
[2] https://arxiv.org/html/2609.02749v1
[3] https://github.com/VectorSpaceLab/AREX-Skill
[4] https://api.github.com/repos/VectorSpaceLab/AREX-Skill
[5] https://api.github.com/repos/VectorSpaceLab/AREX-Skill/releases/latest
[6] https://raw.githubusercontent.com/VectorSpaceLab/AREX-Skill/main/README.md
[7] https://raw.githubusercontent.com/VectorSpaceLab/AREX-Skill/main/docs/disco-workflows.md
[8] https://raw.githubusercontent.com/VectorSpaceLab/AREX-Skill/main/docs/architecture.md
