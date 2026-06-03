---
title: "Hermes Agent Self-Evolution은 에이전트 스킬을 자동으로 진화시키는 첫 실험이다"
date: "2026-06-04T01:57:52"
description: "NousResearch의 별도 저장소는 DSPy+GEPA로 Hermes Agent의 SKILL.md, 도구 설명, 시스템 프롬프트를 평가 가능한 변종으로 만들고, 작은 Phase 1 검증을 통해 자동 스킬 개선 루프의 가능성과 아직 남은 제품화 간극을 보여준다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - Hermes Agent
  - Agent Systems
  - DSPy
  - GEPA
  - Skill Evolution
draft: false
---

AI 에이전트가 오래 쓰일수록 실제로 좋아지려면, 모델 가중치만 바꾸는 것으로는 부족하다. 매일 쓰는 도구 설명, 시스템 프롬프트, `SKILL.md` 같은 절차 문서, 실패 후 남겨진 운영 지식이 계속 정리되고 개선되어야 한다. 문제는 이 레이어가 지금까지 대체로 사람이 직접 고치는 정적 문서였다는 점이다.

**Hermes Agent Self-Evolution**은 이 지점을 정면으로 겨냥한 NousResearch의 별도 저장소다. Hermes Agent 본체 안에 바로 들어간 기능이라기보다, Hermes Agent의 스킬·프롬프트·도구 설명·코드를 바깥에서 읽고, 평가 데이터셋을 만들고, DSPy와 GEPA 계열 최적화로 더 나은 변종을 찾은 뒤, 검증된 결과를 리뷰 가능한 변경으로 제안하려는 실험적 프레임워크에 가깝다.

핵심은 “자가 개선”을 추상적인 슬로건이 아니라 **측정 가능한 instruction-layer optimization loop**로 바꾸려는 데 있다. 모델을 다시 학습하지 않고, API 호출만으로 프롬프트와 스킬 텍스트를 변이·평가·선별한다. 공식 README는 일반적인 최적화 실행 비용을 약 `$2-10` 수준으로 설명하고, Phase 1 검증 보고서는 더 작은 BootstrapFewShot 실험을 `< $0.50`, `< 60초` 규모로 수행했다고 기록한다.

![Hermes Agent Self-Evolution이 스킬 문서를 평가 가능한 변이와 리뷰 산출물로 순환시키는 구조도](/images/blog/hermes-agent-self-evolution-loop.svg)

## 무엇을 해결하려는가

Hermes Agent의 큰 특징 중 하나는 스킬과 메모리, 세션 검색, 크론, 메시징 게이트웨이 같은 주변 시스템을 통해 “사용자와 함께 성장하는 에이전트”를 지향한다는 점이다. 하지만 스킬 생태계가 커질수록 좋은 스킬을 작성하고 유지하는 일은 점점 운영 부담이 된다. 실제 작업에서 실패한 패턴을 보고 `SKILL.md`를 고치고, 도구 설명을 더 명확하게 만들고, 시스템 프롬프트의 정책 문장을 다듬는 일은 반복적이지만 품질에 큰 영향을 준다.

Hermes Agent Self-Evolution이 노리는 병목은 바로 이 **instruction layer의 수동 유지보수**다. 에이전트가 한 작업을 더 잘하게 만들기 위해 매번 사람이 문서를 고치는 대신, 특정 스킬을 테스트 가능한 모듈로 감싸고, 평가 데이터셋에서 baseline과 evolved variant를 비교한 뒤, 더 좋은 후보만 남기는 구조를 만들자는 것이다.

중요한 점은 이 접근이 강화학습이나 파인튜닝과 다르다는 것이다. 공식 PLAN은 DSPy의 `BootstrapFinetune`처럼 가중치를 학습하는 컴포넌트는 이 계획에서 제외한다고 명시한다. 대신 스킬 본문, 도구 설명, 프롬프트 섹션, 코드 파일처럼 텍스트로 표현되는 자산을 변이 대상으로 삼는다. 따라서 실험의 단위는 모델이 아니라, 에이전트가 실행 전에 읽는 절차와 정책이다.

## 핵심 아이디어 / 구조 / 동작 방식

전체 구조는 비교적 명확하다. 먼저 개선할 대상을 고른다. Phase 1은 `SKILL.md` 스킬 파일이고, 이후 Phase 2는 도구 설명, Phase 3은 시스템 프롬프트 섹션, Phase 4는 도구 구현 코드, Phase 5는 지속적 개선 루프다. 각 단계는 앞 단계가 실제 개선을 만들었는지 검증한 뒤 넘어가도록 설계되어 있다.

공식 PLAN이 정의하는 실행 루프는 다음과 같이 요약할 수 있다.

| 단계 | 역할 | 구현 관점의 의미 |
|---|---|---|
| Target selection | 스킬, 프롬프트 섹션, 도구 설명 중 하나를 선택 | 현재 버전을 baseline으로 고정한다 |
| Evaluation dataset | 합성 데이터, 세션 기록, golden set에서 평가 입력을 만든다 | `task_input`과 `expected_behavior` rubric으로 쪼갠다 |
| DSPy module wrapper | 스킬 텍스트를 DSPy 모듈의 최적화 대상 파라미터처럼 감싼다 | `SkillModule`이 스킬 지침과 태스크 입력을 받아 응답을 만든다 |
| Optimizer | GEPA, MIPROv2, BootstrapFewShot 등으로 변종을 만든다 | 실행 trace와 점수를 바탕으로 더 나은 instruction을 찾는다 |
| Evaluation | baseline과 evolved variant를 holdout에서 비교한다 | correctness, procedure-following, conciseness 또는 빠른 proxy score를 쓴다 |
| Constraint gates | 크기, 성장률, 구조, 테스트, 캐싱 호환성을 확인한다 | “점수는 올랐지만 너무 비대해진 프롬프트”를 막는다 |
| Review output | diff, metrics, PR 리뷰 흐름으로 넘긴다 | 자동 변경과 사람의 의사결정을 분리한다 |

GEPA가 들어가는 지점은 optimizer 단계다. README는 GEPA를 “실행 trace를 읽고 왜 실패했는지 분석한 뒤 targeted mutation을 제안하는 reflective prompt evolution”으로 설명한다. 단순히 무작위 문장을 바꾸는 것이 아니라, 실패 원인을 해석해 다음 변이를 제안하는 방식이라는 점이 차별점이다. DSPy는 이 변이를 실제 모듈·평가·컴파일 과정에 연결하는 프레임워크 역할을 한다.

현재 코드 기준으로 가장 구체적으로 구현된 부분은 skill evolution이다. `evolution/skills/skill_module.py`는 `SKILL.md`를 frontmatter와 본문으로 분리하고, 본문을 `SkillModule`의 지침 텍스트로 감싼다. `evolution/core/dataset_builder.py`는 합성 평가 데이터셋을 만들거나 JSONL golden set을 읽고, train/validation/holdout split으로 나눈다. `evolution/skills/evolve_skill.py`는 스킬 로드, 데이터셋 생성, optimizer 실행, holdout 평가, 결과 저장까지 이어지는 엔드투엔드 명령을 제공한다.

또 하나 흥미로운 부분은 세션 기반 데이터 수집이다. `external_importers.py`는 Claude Code, GitHub Copilot, Hermes Agent의 세션 기록에서 스킬 관련 평가 예시를 만들려는 브리지를 갖고 있다. 이때 API key, GitHub token, Slack token, AWS key, bearer token, private key, `password=` 같은 패턴을 제외하는 secret detection도 포함되어 있다. 실제 사용자 기록을 평가 데이터로 쓰는 순간 privacy와 leakage 위험이 생기기 때문에, 이 레이어는 단순 편의 기능이 아니라 필수 안전장치에 가깝다.

## 공개된 근거에서 확인되는 점

공식 README는 다섯 단계 로드맵을 제시한다. 하지만 현재 저장소를 보면 구현 성숙도는 단계마다 차이가 크다.

| Phase | 진화 대상 | 엔진 | 공개 자료 기준 상태 |
|---|---|---|---|
| Phase 1 | 스킬 파일 `SKILL.md` | DSPy + GEPA | README는 구현됨으로 표시, 코드도 `evolve_skill.py` 중심 흐름을 제공 |
| Phase 2 | 도구 설명 | DSPy + GEPA | 계획 단계 |
| Phase 3 | 시스템 프롬프트 섹션 | DSPy + GEPA | 계획 단계 |
| Phase 4 | 도구 구현 코드 | Darwinian Evolver | 계획 단계, 외부 AGPL v3 CLI로 분리한다는 설계 |
| Phase 5 | 지속적 개선 루프 | 자동화 파이프라인 | 계획 단계 |

Phase 1 검증 보고서도 저장소에 들어 있다. PDF 자체와 함께 `generate_report.py`가 보고서 내용을 구성하고 있는데, 여기서 확인되는 실험은 생각보다 작고 구체적이다. 대상은 `arxiv` 스킬이고, MiniMax M2.5 via OpenRouter로 7개의 합성 테스트 케이스를 만들었다. optimizer는 GEPA가 아니라 DSPy `BootstrapFewShot`이고, 3개 training example, 2개 validation example, 1회 optimization round로 수행됐다.

결과는 다음과 같이 보고된다.

| 지표 | Baseline | Optimized | 변화 |
|---|---:|---:|---:|
| Validation Example 1 | 0.408 | 0.569 | +39.5% |
| Validation Example 2 | 0.374 | 0.374 | 0.0% |
| Average | 0.391 | 0.472 | +20.7% |

이 숫자는 가능성을 보여 주지만, 동시에 해석을 조심해야 한다. 보고서의 fitness function은 full LLM-as-judge가 아니라 `expected_behavior` rubric과 출력 사이의 keyword overlap proxy를 사용했다. 저장소의 `fitness.py`에는 correctness, procedure-following, conciseness를 보는 LLM-as-judge 구조도 있지만, Phase 1 검증에서는 비용을 줄이기 위해 빠른 휴리스틱을 쓴 셈이다. 따라서 이 결과는 “Hermes 스킬이 실제 프로덕션 사용에서 20% 좋아졌다”라기보다, **작은 폐쇄형 평가에서 instruction optimization loop가 작동하는 첫 증거**로 읽는 편이 안전하다.

가드레일은 비교적 분명하게 설계되어 있다. `EvolutionConfig`와 `ConstraintValidator`를 보면 스킬 크기 제한은 15,000자, 도구 설명은 500자, 파라미터 설명은 200자, baseline 대비 prompt growth는 20%로 잡혀 있다. 스킬은 YAML frontmatter에 `name`과 `description`을 가져야 하며, `run_test_suite()`는 Hermes Agent 저장소에서 `python -m pytest tests/ -q --tb=no`를 실행하도록 되어 있다.

다만 README와 PLAN이 말하는 “PR 생성”은 현재 main tree에서 완전히 제품화되어 보이지는 않는다. PLAN에는 `pr_builder.py`와 PR branch 생성을 언급하지만, 실제 클론한 파일 목록에는 해당 모듈이 보이지 않았고, `evolve_skill.py`의 현재 마지막 단계는 `output/<skill>/<timestamp>/` 아래에 `evolved_skill.md`, `baseline_skill.md`, `metrics.json`을 저장하고 diff를 보라고 안내하는 수준이다. 즉 정책적으로는 “사람 리뷰 후 PR”을 지향하지만, 저장소의 공개 구현은 아직 **검증 리포트와 로컬 산출물 생성 중심의 초기 단계**다.

릴리스 표면도 같은 방향을 가리킨다. GitHub API 조회 시점(2026년 6월 4일 KST) 기준 `NousResearch/hermes-agent-self-evolution`은 2026년 3월 9일 생성, 2026년 3월 29일 최근 push, 2026년 6월 3일 metadata update로 보였고, stars 3,824, forks 437, open issues 72였다. tags는 빈 배열이고 latest release도 404였다. 라이선스는 README와 `pyproject.toml`에는 MIT로 적혀 있지만, GitHub API의 `license` 필드는 `null`이고 저장소 루트에 별도 `LICENSE` 파일은 확인되지 않았다. 따라서 “MIT 의도로 공개된 초기 연구/실험 저장소”로 보되, 배포 패키지 수준의 정리도는 아직 제한적으로 보는 것이 맞다.

## 실무 관점에서의 해석

가장 중요한 해석은 Hermes Agent Self-Evolution이 에이전트의 “기억”을 단순 저장소가 아니라 **평가 가능한 개선 대상**으로 다룬다는 점이다. 많은 에이전트 시스템은 경험을 메모리나 스킬 문서로 저장한다. 하지만 저장된 절차가 실제로 더 좋은 행동을 만드는지, 어떤 문장이 실패를 줄였는지, 어느 정도 길이에서 성능 대비 비용이 나빠지는지는 별도로 측정하지 않는다. 이 저장소는 그 빈칸을 메우려 한다.

특히 스킬은 좋은 출발점이다. 스킬은 모델 가중치보다 싸게 바꿀 수 있고, 코드보다 위험이 낮으며, 특정 작업 성공률에 직접 영향을 준다. `github-code-review`, `systematic-debugging`, `arxiv`처럼 반복 사용되는 스킬은 평가 입력을 만들기도 비교적 쉽다. 잘 설계하면 “사람이 실패 사례를 보고 문서를 고친다”는 루프를 “실패 사례를 데이터셋으로 만들고 optimizer가 후보를 제안한다”는 루프로 바꿀 수 있다.

하지만 이 방식이 실무에서 안정적으로 작동하려면 세 가지가 더 필요하다.

첫째, **평가 데이터의 품질**이다. 합성 데이터는 빠르게 시작하기 좋지만, 합성 rubric에 과적합하면 실제 사용 품질과 어긋날 수 있다. 세션 DB mining은 더 현실적이지만 privacy, secret filtering, 사용자 동의, 조직 데이터 경계가 더 중요해진다. golden set은 품질이 높지만 만드는 비용이 든다. 결국 production self-evolution은 이 세 가지를 섞되, 어떤 데이터가 어떤 스킬을 대표하는지 계속 점검해야 한다.

둘째, **fitness function의 신뢰성**이다. keyword overlap은 빠르지만, 절차를 잘 따랐는지나 위험한 행동을 피했는지를 충분히 보지 못한다. LLM-as-judge는 더 풍부한 평가가 가능하지만 비용과 judge bias가 생긴다. 실제로는 자동 채점 가능한 태스크, LLM judge, 사람 리뷰, 회귀 테스트가 함께 들어가야 한다. 특히 도구 사용 스킬은 최종 문장 품질보다 파일 변경, 테스트 통과, API 호출 안전성 같은 외부 evidence가 더 중요하다.

셋째, **배포 경계**다. 자동 진화된 스킬을 곧바로 사용자 환경에 반영하면 회귀나 정책 드리프트가 생길 수 있다. 이 저장소가 크기 제한, 성장률 제한, full test suite, PR review를 강조하는 이유가 여기에 있다. 실무적으로는 evolved variant를 바로 머지하기보다, diff와 metric을 사람이 읽고, 필요하면 A/B 테스트나 canary skill로 운영하는 편이 안전하다.

이 관점에서 Hermes Agent Self-Evolution은 “에이전트가 스스로 코드를 고쳐 완전히 자율적으로 진화한다”는 과장된 그림보다는, **절차 문서를 실험 가능한 소프트웨어 아티팩트로 끌어올리는 시도**에 가깝다. 스킬은 더 이상 프롬프트 끝에 붙는 긴 설명서가 아니라, 데이터셋·optimizer·holdout·제약 조건을 가진 작은 제품 단위가 된다.

## 한계와 남은 질문

현재 공개 구현은 아직 초기다. README의 톤은 GEPA 중심이지만, 저장소 안 Phase 1 보고서의 실제 검증은 BootstrapFewShot 기반의 작은 실험이다. GEPA를 더 긴 실행 trace와 여러 스킬에 적용했을 때 어느 정도 일관된 개선이 나오는지, LLM-as-judge로 바꿨을 때 결과가 유지되는지, Hermes Agent 전체 benchmark에서 회귀가 없는지는 앞으로 더 봐야 한다.

또한 PLAN에 적힌 PR automation, benchmark gate, tool description evolution, prompt section evolution, code evolution은 아직 로드맵 성격이 강하다. 특히 Phase 4의 Darwinian Evolver는 AGPL v3 외부 CLI로 분리한다는 설계가 있지만, 코드 진화는 스킬 텍스트보다 훨씬 강한 테스트와 보안 경계가 필요하다. 파일 도구나 인증 흐름 같은 민감한 구현을 자동 변이하는 순간, 단순 점수 향상보다 regression containment가 더 중요해진다.

라이선스와 패키징도 작은 주의점이다. README와 `pyproject.toml`은 MIT를 명시하지만 GitHub API license는 비어 있고, 루트 `LICENSE` 파일은 없었다. 프로젝트를 내부 파이프라인에 도입하려는 팀이라면 이 부분은 확인하고, 실제 의존성인 DSPy, GEPA, Darwinian Evolver의 라이선스 경계도 함께 봐야 한다.

그럼에도 방향성은 분명하다. 에이전트 시스템이 장기적으로 좋아지려면 “더 좋은 모델”만으로는 부족하고, 작업 절차·도구 설명·평가 데이터·실패 기록이 함께 개선되어야 한다. Hermes Agent Self-Evolution은 그중에서도 가장 현실적인 첫 지점인 스킬 파일을 잡았다. 아직은 연구적이고 작은 검증 단계지만, agent skill 생태계가 커질수록 이런 **측정 가능한 skill evolution loop**는 점점 더 중요한 운영 인프라가 될 가능성이 크다.

Sources: https://discuss.pytorch.kr/t/hermes-agent-self-evolution-hermes-agent-nousresearch/10136, https://github.com/NousResearch/hermes-agent-self-evolution, https://api.github.com/repos/NousResearch/hermes-agent-self-evolution, https://raw.githubusercontent.com/NousResearch/hermes-agent-self-evolution/main/README.md, https://raw.githubusercontent.com/NousResearch/hermes-agent-self-evolution/main/PLAN.md, https://raw.githubusercontent.com/NousResearch/hermes-agent-self-evolution/main/generate_report.py, https://raw.githubusercontent.com/NousResearch/hermes-agent-self-evolution/main/pyproject.toml, https://github.com/NousResearch/hermes-agent, https://raw.githubusercontent.com/NousResearch/hermes-agent/main/README.md
