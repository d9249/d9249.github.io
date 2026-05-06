---
title: "paper2code는 논문 구현의 애매함을 코드 옆에 드러낸다"
date: "2026-05-06T04:33:15"
description: "paper2code는 arXiv 논문을 구현할 때 LLM이 빈칸을 자신 있게 메워버리는 문제를 막기 위해, 구현 결과를 citation-anchored code·ambiguity audit·walkthrough notebook 형태로 출력하고 각 선택을 SPECIFIED, PARTIALLY_SPECIFIED, UNSPECIFIED로 분류하는 에이전트 스킬 프로젝트다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agents
  - Paper Reproduction
  - Code Generation
  - ArXiv
  - Research Engineering
draft: false
---

연구 논문을 코드로 옮기는 일은 생각보다 생성 문제가 아니라 판독 문제에 가깝다. 모델 구조 자체보다 더 자주 발목을 잡는 것은 빠진 하이퍼파라미터, 애매한 문장, 본문과 그림 사이의 불일치, 그리고 “standard setting” 같은 모호한 표현이다. 그래서 많은 구현 시도는 코드가 돌아가느냐와 논문을 제대로 재현했느냐 사이에 큰 간극을 남긴다.

`PrathamLearnsToCode/paper2code`는 이 간극을 정면으로 다룬다. 이 저장소는 arXiv 논문 URL이나 ID를 입력으로 받아, 단순한 “작동하는 코드”가 아니라 citation-anchored implementation을 만들겠다는 목표를 전면에 내세운다. README와 실제 `skills/paper2code/SKILL.md`를 보면 핵심은 LLM이 논문의 빈칸을 조용히 상상해서 채우지 못하게 만드는 것이다. 코드 각 줄을 논문 섹션·방정식과 연결하고, 애매하거나 빠진 부분은 `[UNSPECIFIED]`, `[PARTIALLY_SPECIFIED]`, `[ASSUMPTION]` 같은 태그로 노출한다.

이 프로젝트가 흥미로운 이유는 paper-to-code를 “한 번에 구현 생성” 문제가 아니라 “불확실성을 감사 가능한 형태로 남기는 연구 엔지니어링 워크플로우”로 재정의하기 때문이다. 다시 말해 paper2code의 산출물은 코드 자체만이 아니라, 어떤 구현 결정이 논문에 직접 근거하고 어떤 결정이 추정인지 추적할 수 있는 설명 계층까지 포함한다.

![paper2code repository](https://opengraph.githubassets.com/4d9fdf246d4e0436f053fac7f080af1fcc82aa15e46cb095e015efd5777c7751/PrathamLearnsToCode/paper2code)

## 무엇을 해결하려는가

paper2code가 푸는 문제는 논문 구현 과정의 “조용한 환각”이다. 보통 LLM으로 논문 구현을 시키면, 모델은 빠진 하이퍼파라미터나 불명확한 설계를 자신 있게 메워 넣는다. 사용자는 코드를 얻지만, 그 코드가 논문을 따른 결과인지 모델이 임의로 보간한 결과인지 구분하기 어렵다. 특히 reproduction 단계에서는 이 차이가 치명적이다.

README가 지적하듯, 실제 논문 구현의 어려움은 코딩보다 detective work에 가깝다. 중요한 값이 appendix나 footnote에 숨겨져 있거나, 그림과 본문이 서로 미묘하게 다르거나, 실험 섹션이 본 구현보다 더 많은 단서를 주는 경우가 많다. paper2code는 바로 이 조사 과정을 파이프라인의 일부로 끌어들인다. 먼저 논문을 파싱하고 구조를 추출한 뒤, contribution identification과 ambiguity audit를 수행하고, 그 다음에야 코드를 생성한다.

즉 이 프로젝트의 문제의식은 “논문을 코드로 바꿔라”가 아니라 “논문에서 실제로 명시된 것과 모델이 추정한 것을 분리해라”에 가깝다. 구현물을 만드는 동시에 provenance를 남기려는 시도라고 볼 수 있다.

## 핵심 아이디어 / 구조 / 동작 방식

paper2code의 중심 아이디어는 구현 결정마다 근거를 붙이는 citation anchoring이다. README 예시처럼 `model.py` 안의 비단순 코드에는 `§3.2`, `Eq. 4` 같은 주석이 달리고, `base.yaml`의 하이퍼파라미터는 논문이 명시했는지 아닌지가 표시된다. 이것은 “코드가 논문을 재현한다”는 주장보다 “이 줄이 논문의 어느 문장을 구현한 것인지 역추적 가능하다”는 보증에 더 가깝다.

실제 skill orchestration을 보면 흐름은 꽤 엄격하다. `SKILL.md` 기준 파이프라인은 5단계다. 먼저 `fetch_paper.py`와 `extract_structure.py`로 논문을 가져와 텍스트와 섹션 구조를 뽑는다. 그다음 contribution identification 단계에서 단일 핵심 기여를 정리하고, ambiguity audit 단계에서 모든 구현 관련 세부 사항을 `SPECIFIED`, `PARTIALLY_SPECIFIED`, `UNSPECIFIED`로 분류한다. 이후에야 code generation이 진행되며, 마지막으로 walkthrough notebook이 생성된다. 즉 구현은 항상 논문 획득 → 구조 파악 → 모호성 감사 이후에 온다.

산출물 구조도 이 철학을 잘 반영한다. README에 따르면 결과 디렉터리에는 `README.md`, `REPRODUCTION_NOTES.md`, `requirements.txt`, `src/`, `configs/base.yaml`, `notebooks/walkthrough.ipynb`가 들어간다. 여기서 핵심은 `REPRODUCTION_NOTES.md`와 `base.yaml`이다. 전자는 어떤 부분이 논문에서 명시됐고 무엇이 불명확했는지 정리하는 audit 문서이고, 후자는 모든 하이퍼파라미터를 한곳에 모으면서 출처를 표시하는 single source of truth 역할을 한다.

또 하나 중요한 점은 이 프로젝트가 “무엇을 하지 않을지”를 명시적으로 제한한다는 것이다. README는 dataset 다운로드를 하지 않고, 분산 학습 인프라를 꾸리지 않으며, baseline 전체를 구현하지 않고, 논문이 말한 core contribution만 구현한다고 못 박는다. 이는 범위를 제한해 LLM의 과잉 자신감을 줄이려는 설계다. 논문 reproduction 스킬이 만능 scaffold generator가 아니라, 핵심 기여 구현과 불확실성 표시에 집중한다는 뜻이다.

```
/paper2code <arxiv-url-or-id>
        ↓
paper fetch + structure extraction
        ↓
core contribution identification
        ↓
ambiguity audit
        ↓
citation-anchored code generation
        ↓
walkthrough notebook + reproduction notes
```

| 단계 | paper2code에서 하는 일 | 왜 중요한가 |
|---|---|---|
| Paper acquisition | arXiv 논문 텍스트와 구조를 가져오고 공식 코드 링크도 탐색 | 구현 전에 source of truth를 확보 |
| Contribution identification | 논문의 단일 핵심 기여를 정의 | 구현 범위를 좁혀 과잉 생성 방지 |
| Ambiguity audit | 세부 구현 요소를 SPECIFIED / PARTIALLY_SPECIFIED / UNSPECIFIED로 분류 | 모델의 추정과 논문 사실을 분리 |
| Code generation | citation-anchored 주석이 붙은 코드와 config 생성 | 코드 provenance를 남김 |
| Walkthrough notebook | 논문 구절 ↔ 코드 ↔ sanity check를 연결 | 교육용·검증용 해설 레이어 제공 |

| 출력 파일 | 역할 | 신뢰성 측면의 의미 |
|---|---|---|
| `src/model.py`, `loss.py`, `train.py` | 핵심 기여 구현 | 각 구현 라인에 논문 근거를 연결 |
| `REPRODUCTION_NOTES.md` | ambiguity audit, known deviations 정리 | 어디부터가 paper fact가 아닌지 추적 가능 |
| `configs/base.yaml` | 하이퍼파라미터 집약 | 값의 출처와 미지정 항목을 한곳에 표시 |
| `walkthrough.ipynb` | 이론-코드 연결형 notebook | 구현을 읽고 검증하는 진입점 제공 |

## 공개된 근거에서 확인되는 점

공개 저장소 메타데이터도 이 프로젝트의 성격을 잘 보여준다. 조회 시점 기준 저장소는 약 1.2k stars, 155 forks를 기록하고 있고, 생성 시점은 2026년 4월 초로 매우 최근이다. 커밋 수는 5개 수준으로 아직 작은 저장소지만, “논문 구현의 신뢰성”이라는 뚜렷한 문제 설정 때문에 빠르게 주목을 받은 것으로 보인다. 라이선스는 MIT다.

저장소 구조는 매우 얇지만 의도가 분명하다. 루트에는 `README.md`, `LICENSE`, `skills/`만 있고, 실질적인 내용은 `skills/paper2code/` 아래에 들어 있다. 여기에는 `SKILL.md`, `guardrails/`, `knowledge/`, `worked/`가 있다. 즉 paper2code는 완성된 라이브러리라기보다, 에이전트가 따를 orchestrated skill 패키지로 보는 편이 맞다. README 자체도 설치 명령을 `npx skills add ...` 형태로 제시하며, 범용 소프트웨어보다 agent skill distribution 패턴에 맞춰져 있다.

구체적인 guardrail도 공개돼 있다. `SKILL.md`는 `hallucination_prevention.md`, `scope_enforcement.md`, `badly_written_papers.md`를 항상 읽도록 강제하고, `knowledge/` 아래에는 transformer components, training recipes, loss functions, paper-to-code mistakes 같은 도메인 지식 파일이 있다. 이는 단순 프롬프트보다 더 구조화된 reasoning stack을 만들려는 의도다. 또한 worked examples로 `Attention Is All You Need`와 `DDPM` 두 사례를 제공해, 산출물 품질을 사람이 직접 검토할 수 있게 했다.

중요한 사실 하나는 이 저장소가 “정답을 보장한다”고 주장하지 않는다는 점이다. README는 명시적으로 correctness guarantee가 없고, 논문이 틀리면 코드도 틀릴 수 있으며, 명시되지 않은 내용은 common default를 쓰되 `[UNSPECIFIED]`로 표시한다고 적는다. 이 정직함은 약점처럼 보일 수 있지만, 사실 reproduction tooling으로서는 강점이다. 과장된 자동화보다 provenance와 limitation disclosure를 택했기 때문이다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub 메타데이터 | 1.2k+ stars, 155 forks, MIT License, 2026년 4월 생성 | 초기 프로젝트지만 빠르게 관심을 모은 에이전트 skill 저장소 |
| README | citation anchoring, ambiguity audit, appendix mining 강조 | paper-to-code를 생성보다 감사 가능한 구현으로 정의 |
| `skills/paper2code/SKILL.md` | 5단계 파이프라인과 guardrail 강제 | 단일 프롬프트가 아니라 절차형 orchestration |
| `guardrails/`, `knowledge/`, `worked/` | 환각 방지 규칙, 도메인 지식, 검증 예시 포함 | 신뢰성 확보를 위한 보조 계층이 핵심 자산 |

## 실무 관점에서의 해석

내가 보기에 paper2code의 가장 중요한 기여는 “모델이 모르는 것을 코드 옆에 남기게 만든다”는 점이다. 많은 자동 구현 시스템은 코드가 일단 실행되면 성공으로 간주한다. 하지만 논문 구현에서 진짜 중요한 것은 어떤 선택이 논문에서 온 것이고 어떤 선택이 구현자의 관행에서 온 것인지 밝히는 일이다. paper2code는 이 구분을 코드 주석, audit 문서, config 파일, notebook까지 확장해서 남긴다.

이 접근은 특히 연구 엔지니어링 팀이나 reproduction-heavy 조직에서 유용하다. 예를 들어 새로운 모델 구조를 빨리 프로토타이핑해야 하지만, 이후 사람이 그 코드를 검토·수정·재실험해야 하는 환경이라면, “그럴듯한 구현”보다 “근거가 적힌 구현”이 훨씬 가치 있다. paper2code는 바로 그 handoff 비용을 줄이려는 도구로 읽힌다.

반대로 한계도 분명하다. 첫째, 저장소 자체는 아직 매우 초기 단계이고, 실제 대규모 worked example이 풍부하게 쌓인 상태는 아니다. 둘째, ambiguity를 정직하게 표시하는 것과 실제 재현 성공률이 높은 것은 다른 문제다. 논문이 지나치게 부실하면, audit는 훌륭해도 결과 코드는 여전히 실용성이 낮을 수 있다. 셋째, 현재는 arXiv 중심이며, 학습 인프라나 데이터 파이프라인을 적극적으로 만들어 주는 도구는 아니다.

그럼에도 방향성은 설득력 있다. 앞으로 paper-to-code 분야에서 차별점은 “얼마나 많이 구현하느냐”보다 “얼마나 적게 환각하느냐”가 될 가능성이 크다. paper2code는 그 점에서 단순 코드 생성기보다, 논문 구현을 위한 provenance-aware agent skill이라는 정체성이 더 선명하다. 연구 자동화가 진짜로 신뢰를 얻으려면, 정답을 가장하는 시스템보다 모르는 부분을 표시하는 시스템이 먼저 필요하다는 사실을 잘 보여주는 사례다.

Sources: https://github.com/PrathamLearnsToCode/paper2code, https://github.com/PrathamLearnsToCode/paper2code/blob/main/skills/paper2code/SKILL.md