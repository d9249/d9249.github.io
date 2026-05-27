---
title: "Ctx2Skill은 긴 문맥을 읽는 능력을 파라미터가 아니라 스킬 문서로 끌어올린다"
date: "2026-05-06T19:11:44"
description: "Ctx2Skill은 복잡한 문맥에서 규칙과 절차를 자연어 스킬로 추출해 언어모델의 context learning을 강화하는 self-play 프레임워크로, 인간 주석과 외부 실행 피드백 없이도 closed-source 모델에 꽂아 넣을 수 있는 해석 가능한 skill layer를 제안한다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - Ctx2Skill
  - Context Learning
  - Agent Skills
  - Self-Play
  - Prompt Engineering
draft: false
---

언어모델이 강해졌다고 해도, 그 강함의 대부분은 여전히 사전학습 안에 있던 지식에서 나온다. 반대로 실제 업무는 종종 모델이 원래 모르던 긴 문서, 사내 규정, 실험 로그, 제품 매뉴얼, 복잡한 룰북을 읽고 그 안에서 필요한 절차를 새로 배워야 풀린다. 검색으로 관련 단락을 찾아 붙여 넣는 것만으로는 충분하지 않고, 문맥 전체에서 규칙을 추상화하고 절차를 재구성해야 하는 경우가 많다.

`From Context to Skills: Can Language Models Learn from Context Skillfully?`는 바로 이 **context learning** 문제를 정면에서 다룬다. 핵심 질문은 단순하다. 모델이 긴 문맥을 잘 읽게 만들려면 파라미터를 다시 학습해야 할까, 아니면 그 문맥에서 뽑아낸 규칙과 절차를 별도의 스킬 층으로 정리해 inference-time에 붙이는 편이 더 현실적일까.

저자들은 후자를 택한다. 그리고 그 선택을 단순한 프롬프트 요령이 아니라, **Challenger–Reasoner–Judge self-play를 통해 문맥 전용 스킬을 자동으로 발굴·정제·선별하는 프레임워크**로 밀어붙인다. 이 논문의 흥미로운 지점은 “더 긴 context window” 경쟁에 서는 대신, 긴 문맥을 읽어 생기는 절차적 지식을 **자연어 skill artifact**로 외재화했다는 데 있다.

![Ctx2Skill intro](https://arxiv.org/html/2604.27660v2/x1.png)

## 무엇을 해결하려는가

Ctx2Skill이 겨냥하는 병목은 retrieval 자체가 아니라 **문맥으로부터 새로운 능력을 학습하는 과정**이다. 예를 들어 처음 보는 제품 문서를 읽고 운영 절차를 복원하거나, 낯선 과학 문헌에서 실험 규칙을 정리하거나, 긴 규정집에서 예외 처리 로직을 찾아내야 할 때 모델은 단순 복사보다 한 단계 높은 추상화를 해야 한다.

여기서 기존 접근은 두 갈래로 나뉜다. 하나는 사람이 직접 스킬 문서를 써주는 방식이다. 하지만 문맥이 길고 기술적으로 조밀할수록, 사람이 모든 규칙과 절차를 빠짐없이 추출해 skill library로 정리하는 비용이 너무 크다. 다른 하나는 에이전트가 자동으로 스킬을 만들되, 실행 결과나 정답 비교 같은 외부 피드백으로 품질을 검증하는 방식이다. 문제는 context learning 시나리오에는 이런 피드백이 아예 없거나 매우 약한 경우가 많다는 점이다.

논문은 이 두 한계를 동시에 겨냥한다. 즉 **사람 주석 없이**, 그리고 **코드 실행/정답 대조 같은 외부 피드백 없이**, 문맥 내부에서만 스킬을 진화시킬 수 있는가가 핵심 문제 설정이다. 이 질문은 closed-source API 모델을 그대로 써야 하는 실무 환경과도 잘 맞는다. 모델 파라미터를 열 수 없어도, 문맥별 스킬 레이어를 앞단에 꽂는 방식은 적용 가능하기 때문이다.

## 핵심 아이디어 / 구조 / 동작 방식

Ctx2Skill의 중심은 `skill-optimized self-play`다. 파라미터를 업데이트하지 않고, 대신 두 개의 스킬 집합을 경쟁적으로 진화시킨다.

- **Challenger**: 주어진 context를 바탕으로 probing task와 rubric을 만든다.
- **Reasoner**: context와 현재 skill set을 참고해 문제를 푼다.
- **Judge**: Reasoner의 답을 rubric 기준으로 통과/실패로 판정한다.
- **Proposer / Generator**: 실패하거나 너무 쉽게 풀린 사례를 분석해 각 진영의 스킬을 갱신한다.

구조적으로 보면 Ctx2Skill은 모델 자체를 더 똑똑하게 만드는 것이 아니라, **문맥을 읽고 생기는 reusable procedure를 자연어 스킬로 점진적으로 축적하는 시스템**이다. Reasoner 쪽은 자주 실패한 케이스를 분석해 빠진 규칙과 절차를 skill로 보강하고, Challenger 쪽은 너무 쉬운 문제를 더 까다롭게 만들 수 있도록 task/rubric 생성 전략을 강화한다. 이 덕분에 둘은 같은 context 위에서 경쟁적으로 co-evolve한다.

논문이 추가로 짚는 중요한 리스크는 **adversarial collapse**다. self-play를 돌리면 Challenger가 점점 병적인 문제를 만들고, Reasoner는 거기에만 최적화된 과잉 특수화 스킬을 쌓을 수 있다. 이를 막기 위해 들어간 것이 **Cross-time Replay**다. 과거 여러 시점의 Reasoner skill candidate를 대표 probe set 위에서 다시 평가해, hard case와 easy case 사이의 균형이 가장 좋은 skill set을 최종 선택한다.

![Ctx2Skill framework](https://arxiv.org/html/2604.27660v2/x2.png)

이 설계가 실무적으로 중요한 이유는 최종 산출물이 **readable skill document**라는 점이다. 즉 Ctx2Skill은 fine-tuned checkpoint를 내놓는 것이 아니라, 어떤 LM 앞에 prepend해서 붙일 수 있는 문맥 전용 skill layer를 만든다. 논문 버전의 장점은 세 가지다.

| 구성 요소 | 공개 자료에서 확인되는 역할 | 실무적 의미 |
|---|---|---|
| Challenger | context 기반 probing task + rubric 생성 | 문맥 이해가 약한 지점을 적극적으로 드러냄 |
| Reasoner | context + skill을 활용한 문제 해결 | downstream inference에 실제로 붙는 쪽은 이 skill set |
| Judge | binary per-rubric verdict | 외부 실행 없이도 최소한의 판정 신호를 형성 |
| Proposer / Generator | 실패·성공 패턴을 스킬 갱신 제안으로 변환 | trajectory가 아니라 재사용 가능한 자연어 skill artifact를 축적 |
| Cross-time Replay | 과거 skill candidate 재평가 | self-play가 pathological case에 과적합되는 것을 완화 |

GitHub 공개 코드도 이 구조를 비교적 직접 반영한다. `selfplay_loop.py`가 전체 루프를 담당하고, `challenger.py`, `infer.py`, `eval.py`, `eval_ignore_none.py`, `prompts/` 디렉터리가 분리돼 있다. 즉 "개념 소개" 수준에 머물지 않고 최소한 self-play, inference, evaluation이 분리된 실험 패키지 형태까지는 제공한다.

## 공개된 근거에서 확인되는 점

가장 직관적인 메시지는 CL-bench의 네 가지 context learning task에서 solve rate가 실제로 오른다는 점이다. 논문과 README가 공통으로 제시하는 대표 수치는 다음과 같다.

| 백본 모델 | 스킬 없이 | Ctx2Skill 적용 후 | 변화 |
|---|---:|---:|---:|
| GPT-4.1 | 11.1% | 16.5% | +5.4%p |
| GPT-5.1 | 21.2% | 25.8% | +4.6%p |
| GPT-5.2 | 18.2% | 21.4% | +3.2%p |

숫자 자체만 보면 절대치가 아주 높다고 보긴 어렵다. 하지만 이 논문의 포인트는 SOTA 점수 과시보다, **closed-source 모델에도 붙일 수 있는 skill layer가 context learning에서 일관된 추가 이득을 줄 수 있느냐**에 있다. 그런 기준에서는 improvement pattern이 비교적 분명하다.

벤치마크 범위도 해석할 만하다. 논문은 CL-bench의 네 범주를 사용한다.

- Domain Knowledge Reasoning
- Rule System Application
- Procedural Task Execution
- Empirical Discovery & Simulation

즉 단순 QA보다, 길고 복잡한 context에서 규칙을 추상화하거나 절차를 조합해야 하는 문제들이 중심이다. 이 점은 Ctx2Skill이 retrieval booster가 아니라 **context-conditioned procedure distillation**에 가깝다는 해석을 뒷받침한다.

코드 공개 범위도 체크할 만하다. GitHub API 기준 저장소 `S1s-Z/Ctx2Skill`은 2026-04-28 생성, stars 32, forks 3, 기본 브랜치 `main`이다. `releases/latest`는 404이고 tags도 비어 있어, 아직 전통적인 릴리스 관리 신호는 약하다. 반면 README에는 quick start, CL-Bench 데이터 위치, self-play/infer/eval 커맨드, 프롬프트 파일 구조가 명시돼 있어 **연구 코드 패키지로서는 비교적 빠르게 정리된 초기 공개 상태**로 보는 편이 맞다.

흥미로운 세부 사항 하나는 GitHub API repo 메타의 `license` 필드는 `null`인데, README 본문에는 **MIT License**라고 적혀 있다는 점이다. 즉 라이선스 표기가 메타데이터와 README 사이에서 아직 완전히 정리되지 않았을 가능성이 있다. 실무 도입 시에는 이 부분을 그대로 신뢰하지 말고 실제 LICENSE 파일 유무를 추가 확인하는 편이 안전하다.

## 실무 관점에서의 해석

내가 보기에 Ctx2Skill의 핵심 가치는 “문맥을 잘 읽는 모델”을 새로 학습했다는 데 있지 않다. 오히려 **문맥으로부터 생기는 절차적 지식을, 모델 파라미터 바깥의 해석 가능한 skill layer로 분리했다**는 점이 더 중요하다. 이 관점은 여러 실전 함의를 갖는다.

첫째, 긴 문맥 처리 문제를 전부 context window 확장이나 retrieval 품질 문제로만 보지 않게 만든다. 실제로 많은 실패는 필요한 문장을 못 찾는 데서보다, 찾은 문장들 사이에서 규칙과 절차를 안정적으로 추상화하지 못하는 데서 온다. Ctx2Skill은 이 간극을 메우기 위한 중간층을 제안한다.

둘째, closed-source 모델 운영과 잘 맞는다. 많은 팀은 GPT 계열이나 상용 API를 그대로 쓴다. 이때 파라미터 튜닝은 어렵지만, 문맥별 skill file을 별도로 관리하는 방식은 충분히 가능하다. 다시 말해 Ctx2Skill은 fine-tuning budget이 없는 조직에도 비교적 현실적인 adaptation 경로를 보여준다.

셋째, agent system 설계와도 연결된다. 최근 에이전트 연구는 memory, tools, workflow orchestration에 주목하지만, Ctx2Skill은 그 앞단에 **context-specific skill compilation** 단계를 둘 수 있음을 보여준다. 긴 제품 문서나 내부 정책 문서를 그냥 통째로 넣기보다, 먼저 self-play로 문맥 전용 skill set을 만든 뒤 downstream agent가 그 스킬을 참조하게 하는 구조가 더 안정적일 수 있다.

물론 한계도 분명하다. 우선 Judge의 binary rubric 판정 자체가 또 다른 LM 의존적 절차라서, 완전히 "피드백이 없다"기보다 **외부 실행 피드백이 없는 상태에서 내부 LM 기반 판정 루프를 만든 것**에 가깝다. 또한 CL-bench 중심 검증이라 실제 사내 문서, API 문서, 규정집, 코드베이스 같은 비정형 enterprise context에서 같은 이득이 얼마나 유지되는지는 더 봐야 한다. self-play 특성상 비용과 latency도 결코 싸지 않을 가능성이 크다.

그럼에도 불구하고 이 논문은 중요한 방향을 제시한다. 앞으로 context engineering의 경쟁은 단순히 더 많은 문서를 집어넣는 쪽만이 아니라, **그 문맥을 어떤 skill artifact로 압축해 다시 모델 앞단에 배치할 것인가**로 이동할 가능성이 있다. 그런 의미에서 Ctx2Skill은 retrieval 다음 단계의 문제, 즉 "읽은 문맥을 어떻게 능력으로 바꿀 것인가"에 대한 꽤 설득력 있는 초안을 내놓은 작업이다.

Sources: https://arxiv.org/abs/2604.27660, https://arxiv.org/html/2604.27660v2, https://github.com/S1s-Z/Ctx2Skill, https://raw.githubusercontent.com/S1s-Z/Ctx2Skill/main/README.md