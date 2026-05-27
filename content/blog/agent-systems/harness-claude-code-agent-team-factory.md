---
title: "Harness는 Claude Code 에이전트 팀을 찍어내는 메타 스킬이다"
date: "2026-05-27T20:22:54"
description: "revfactory/harness는 도메인 한 문장을 Claude Code용 에이전트 팀, 역할 정의, 스킬 세트로 변환하는 팀 아키텍처 팩토리이며, Agent Teams의 실험적 협업 모델을 재사용 가능한 하네스 설계 자산으로 끌어올리려는 프로젝트다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agents
  - Claude Code
  - Multi-Agent
  - Developer Tools
  - Skills
draft: false
---

Claude Code가 단일 세션의 코딩 도구에서 점점 더 복잡한 작업 환경으로 확장되면서, 병목은 모델이 코드를 잘 쓰느냐에서 “어떤 팀 구조로 일하게 만들 것인가”로 이동하고 있다. Anthropic의 Agent Teams 문서도 이 전환을 분명히 보여 준다. Agent Teams는 여러 개의 독립 Claude Code 세션을 팀처럼 묶고, 리드 세션이 작업을 만들고, 팀원이 메시지를 주고받으며, 공유 태스크 목록을 통해 협업하게 만드는 실험적 기능이다. 대신 이 기능은 기본적으로 비활성화되어 있고, 토큰과 조율 비용도 단일 세션보다 크다.

`revfactory/harness`는 바로 이 지점에 올라탄다. 이 프로젝트는 자신을 단순한 프롬프트 모음이 아니라 “team-architecture factory for Claude Code”라고 설명한다. 사용자가 “이 프로젝트용 하네스를 만들어줘”라고 말하면, 도메인 분석을 거쳐 에이전트 역할 정의와 그들이 사용할 스킬을 `.claude/agents/`, `.claude/skills/` 구조로 생성하는 메타 스킬이다. 즉 Claude Code의 Agent Teams 기능을 직접 잘 다루는 법을 알려주는 것이 아니라, 반복 가능한 팀 설계 패턴으로 포장해 주는 상위 레이어에 가깝다.

![Harness 공식 배너](/images/blog/harness-claude-code-agent-team-factory-banner.webp)

흥미로운 점은 이 프로젝트가 “멀티 에이전트를 쓰자”라는 추상적 주장에 머물지 않는다는 것이다. README, 한국어 소개글, Claude 플러그인 매니페스트, 부속 실험 저장소, 그리고 `harness-100` 사례 저장소를 함께 보면 Harness는 Claude Code 생태계 안에서 에이전트 팀을 설계·배포·검증·확장하는 하나의 운영 단위를 만들려는 시도로 읽힌다.

## 무엇을 해결하려는가

긴 작업에서 코딩 에이전트가 실패하는 이유는 대개 모델의 순수 지능 부족만이 아니다. 문제를 잘게 나누지 못하고, 한 세션 안에서 컨텍스트가 오염되고, 검증자가 생성자와 분리되지 않고, 도메인 지식이 즉흥 프롬프트로 흩어지는 것이 더 자주 병목이 된다. Anthropic의 장기 작업 하네스 글도 비슷한 문제를 짚는다. 장기 앱 개발에서는 플래너, 생성자, 평가자/QA를 분리하고, Playwright 기반 검증처럼 구체적인 평가 루프를 별도 에이전트에 맡기는 구조가 품질을 끌어올리는 주요 레버였다는 것이다.

Claude Code의 Agent Teams는 이런 구조를 가능하게 하는 실행 기반을 제공한다. 팀 리드가 팀원을 만들고, 작업을 나누고, 결과를 통합하며, 개별 팀원과 직접 상호작용할 수 있다. 하지만 공식 문서가 말하듯 Agent Teams는 모든 작업에 적합하지 않다. 순차적 작업, 같은 파일을 동시에 고치는 작업, 의존성이 촘촘한 작업, 단일 세션으로 충분한 루틴 작업에는 오히려 조율 오버헤드가 더 클 수 있다.

Harness가 해결하려는 문제는 이 선택 자체를 구조화하는 것이다. 언제 Agent Teams를 쓰고, 언제 Subagents로 충분한지, 어떤 역할을 만들고, 어떤 스킬을 붙이고, 어떤 검증 루프를 둬야 하는지를 매번 새로 프롬프트로 설계하는 대신, 도메인 입력에서 팀 아키텍처와 스킬 파일을 자동 생성한다. 말하자면 “멀티 에이전트 실행”이 아니라 “멀티 에이전트 조직 설계”를 제품화하려는 프로젝트다.

## 핵심 아이디어 / 구조 / 동작 방식

Harness의 기본 단위는 여섯 가지 팀 아키텍처 패턴이다. PyTorchKR 소개글과 플러그인 매니페스트가 공통으로 언급하는 패턴은 Pipeline, Fan-out/Fan-in, Expert Pool, Producer-Reviewer, Supervisor, Hierarchical Delegation이다. 이 목록은 단순한 분류표가 아니라, 도메인을 분석한 뒤 실제 `.claude/` 구조로 구체화할 때 선택되는 설계 템플릿에 가깝다.

| 패턴 | Harness에서의 의미 | 잘 맞는 작업 |
|---|---|---|
| Pipeline | 순서 의존성이 있는 단계를 차례대로 통과시킨다 | 문서화, 데이터 처리, 릴리스 절차 |
| Fan-out / Fan-in | 병렬 조사·작성·분석 후 리드가 취합한다 | 리서치, 후보 비교, 대안 탐색 |
| Expert Pool | 필요한 전문가만 선택적으로 호출한다 | 넓은 도메인 지식이 필요한 프로젝트 |
| Producer-Reviewer | 생성자와 검토자를 분리한다 | 코드 리뷰, QA, 디자인 평가 |
| Supervisor | 중앙 조율자가 동적으로 작업을 배분한다 | 요구사항이 변하는 복합 작업 |
| Hierarchical Delegation | 상위 에이전트가 하위 에이전트에 재귀적으로 위임한다 | 큰 프로젝트의 계층적 분해 |

생성 흐름도 비교적 명확하다. Harness는 도메인 분석에서 시작해 팀 아키텍처를 고르고, 에이전트 정의를 만들고, 에이전트가 사용할 스킬을 생성한 뒤, 오케스트레이션과 검증 단계로 이어지는 6단계 워크플로우를 제시한다. 저장소의 `skills/harness/SKILL.md`는 이 과정을 더 세밀하게 풀어 쓰며, Agent Teams 모드와 Subagents 모드, 하이브리드 실행 모드, 변경 이력 관리, 후속 유지보수 흐름까지 포함한다.

![Harness 아키텍처 도식](/images/blog/harness-claude-code-agent-team-factory-architecture.webp)

결과물은 Claude Code 프로젝트에서 익숙한 파일 구조로 떨어진다. 에이전트 정의는 `.claude/agents/`에, 스킬은 `.claude/skills/`에 생성된다. 중요한 것은 스킬을 단순 배경지식으로 보지 않는다는 점이다. Harness는 Progressive Disclosure 원칙을 따라 필요한 시점에 필요한 참조를 펼치는 구조를 강조한다. 모든 정보를 CLAUDE.md에 몰아넣는 대신, 역할·절차·참조 문서를 나누어 팀원이 각자 필요한 도메인 지식을 꺼내 쓰게 만드는 방향이다.

플러그인 매니페스트도 이 포지셔닝을 뒷받침한다. `.claude-plugin/plugin.json` 기준 현재 버전은 `1.2.0`이고, 설명에는 “도메인 설명을 에이전트 팀과 스킬로 변환하는 메타 스킬”이라는 문구가 영어와 한국어로 함께 들어 있다. 키워드 역시 `harness-factory`, `team-architecture-factory`, `agent-team`, `skill-architect`, `multi-agent`, 여섯 패턴 이름으로 구성되어 있다. 즉 이 프로젝트의 중심은 특정 도메인 에이전트 하나가 아니라, 도메인별 에이전트 팀을 찍어내는 공장이다.

## 공개된 근거에서 확인되는 점

현재 공개 자료에서 확인되는 Harness의 첫 번째 근거는 배포 형태다. `revfactory/harness` 저장소는 Apache-2.0 라이선스로 공개되어 있고, Claude 플러그인 마켓플레이스 메타데이터도 함께 포함한다. PyTorchKR 소개글이 안내하는 설치 흐름은 Claude Code 안에서 마켓플레이스를 추가한 뒤 `harness@harness` 플러그인을 설치하는 방식이며, 직접 설치할 경우 `skills/harness`를 `~/.claude/skills/harness`에 복사하는 방식도 제시한다.

두 번째 근거는 Claude Code Agent Teams와의 의존 관계다. 프로젝트 문서와 CONTRIBUTING 문서는 Agent Teams API가 필요한 Claude Code v2 계열과 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 플래그를 명시한다. 이는 Harness가 아직 안정화된 일반 기능 위에만 올라탄 것이 아니라, Claude Code의 실험적 팀 기능을 전제로 하는 메타 레이어라는 뜻이다. 따라서 도입할 때는 “잘 만든 스킬”뿐 아니라 “실험 기능 의존성”도 함께 평가해야 한다.

세 번째 근거는 자체 A/B 실험이다. 부속 저장소 `revfactory/claude-code-harness`에는 15개 소프트웨어 엔지니어링 케이스에서 baseline과 harness 적용 결과를 비교한 보고서가 들어 있다. 보고서에 따르면 평균 품질 점수는 49.5점에서 79.3점으로 올라가고, 15개 케이스 모두에서 harness 적용 쪽이 이겼다. 난이도별 개선 폭도 basic +23.8, advanced +29.6, expert +36.2로, 복잡한 과제일수록 효과가 커졌다는 해석을 제시한다.

![Harness 자체 실험 점수 비교](/images/blog/harness-claude-code-agent-team-factory-scores.webp)

다만 이 수치는 그대로 받아들이기보다 “저자 측정 n=15의 초기 신호”로 보는 편이 안전하다. 제3자 재현이나 조직별 실제 업무 파일럿은 별개의 문제다. 그럼에도 어떤 차원에서 개선이 컸는지는 흥미롭다. 보고서의 차원별 분석은 test coverage, architecture, error handling, extensibility에서 큰 격차를 보인다. 이는 Harness의 가치가 Claude의 기본 구현 능력을 대체하는 데 있지 않고, 테스트·구조·역할 분리·참조 문서 같은 소프트웨어 공학적 장치를 강제하는 데 있음을 시사한다.

![차원별 개선 분석](/images/blog/harness-claude-code-agent-team-factory-dimensions.webp)

네 번째 근거는 확장 사례다. 별도 저장소 `revfactory/harness-100`은 100개의 실전 하네스 사례를 한국어와 영어로 제공한다. 루트 README 기준 양쪽 언어를 합치면 200개 하네스 디렉터리, 978개 에이전트 정의, 630개 스킬, 1,808개 마크다운 파일 규모로 구성되어 있다. 콘텐츠 제작, 소프트웨어 개발, 데이터·AI/ML, 비즈니스, 교육, 법률, 라이프스타일, 문서, 운영, 전문 도메인까지 10개 범주를 나누어 “팀 아키텍처 팩토리”라는 주장이 단지 추상 개념이 아니라 대량 템플릿 컬렉션으로도 이어지고 있음을 보여 준다.

| 공개 표면 | 확인되는 내용 | 해석 |
|---|---|---|
| `revfactory/harness` | Apache-2.0, plugin.json v1.2.0, Claude 플러그인 메타데이터 | Claude Code 생태계용 공식 배포 단위로 정리 중 |
| PyTorchKR 소개글 | 6개 패턴, 6단계 워크플로우, 설치 명령, A/B 실험 요약 | 한국어 사용자에게 프로젝트의 의도와 사용법을 압축 전달 |
| Claude Agent Teams 문서 | 실험 기능, v2.1.32+, 팀 리드·팀원·공유 태스크·직접 메시징 | Harness의 핵심 실행 기반이 아직 실험 기능임을 확인 |
| `claude-code-harness` | 15개 케이스 자체 A/B 보고서, 49.5 → 79.3 | 품질 개선 신호는 있으나 조직별 재현 검증 필요 |
| `harness-100` | 100개 사례, 10개 도메인, 에이전트·스킬 대량 템플릿 | 메타 스킬이 실제 도메인 팩토리로 확장되는 방향 |

## 실무 관점에서의 해석

Harness를 가장 잘 설명하는 문장은 “Claude Code를 더 똑똑하게 만드는 도구”가 아니라 “Claude Code가 팀처럼 일하도록 조직도를 생성하는 도구”에 가깝다. 단일 에이전트에게 긴 지시문을 주는 방식은 빠르지만, 역할 분리와 검증 책임이 약하다. 반대로 Agent Teams는 협업 구조를 만들 수 있지만, 매번 팀을 설계하고 역할을 설명하고 스킬을 붙이는 일이 번거롭다. Harness는 이 사이의 반복 비용을 줄인다.

실무적으로는 세 가지 쓰임새가 보인다. 첫째, 신규 프로젝트 온보딩이다. “이 코드베이스에 맞는 리뷰팀/마이그레이션팀/문서화팀을 만들어 달라”는 식으로 도메인별 에이전트 구성을 빠르게 스캐폴딩할 수 있다. 둘째, 반복 업무의 표준화다. 코드 리뷰, 릴리스 노트, 데이터 파이프라인 설계처럼 매번 비슷한 역할 구성이 필요한 업무를 팀 템플릿으로 굳힐 수 있다. 셋째, 조직 지식의 물질화다. 좋은 프롬프트가 개인 노트에 머무는 대신 `.claude/agents/`와 `.claude/skills/`라는 파일 자산으로 남는다.

반대로 한계도 분명하다. Agent Teams 자체가 실험 기능이고, 협업형 세션은 토큰 비용과 조율 비용이 크다. 작은 버그 수정이나 선형적인 파일 편집에는 과하다. 또한 생성된 팀 구조가 실제 프로젝트의 권한·테스트·배포 환경과 맞지 않으면, “그럴듯한 조직도”만 생기고 운영 품질은 오르지 않을 수 있다. 특히 자체 A/B 결과는 좋은 출발점이지만, 팀마다 코드베이스 크기, 테스트 문화, CI 환경, 리뷰 기준이 다르기 때문에 도입 전 내부 파일럿이 필요하다.

Anthropic의 Managed Agents 글이 말하듯 하네스는 모델의 현재 한계를 보완하기 위해 생기지만, 모델이 바뀌면 그 가정도 낡는다. 따라서 Harness 같은 프로젝트의 장기 가치는 특정 버전의 Claude를 위한 꼼수에 있지 않다. 더 오래 남는 가치는 팀 설계, 역할 분리, 스킬 참조, 검증 루프, 변경 이력 같은 에이전트 운영의 인터페이스를 파일과 패턴으로 정착시키는 데 있다.

결국 Harness는 Claude Code 플러그인 하나라기보다, 에이전트 시대의 “조직 설계 템플릿”에 가깝다. 좋은 모델을 하나 더 붙이는 경쟁이 아니라, 좋은 팀 구조를 얼마나 재사용 가능하게 만들 수 있느냐가 다음 병목이라면, Harness는 그 문제를 꽤 직접적으로 겨냥한 사례다. 당장 모든 팀이 Agent Teams를 기본값으로 써야 한다는 뜻은 아니지만, 복잡한 작업에서 에이전트를 단일 작업자보다 작은 팀으로 다루려는 흐름은 점점 더 강해질 가능성이 높다.

Sources: https://discuss.pytorch.kr/t/harness-claude-code/10372, https://github.com/revfactory/harness, https://github.com/revfactory/claude-code-harness, https://github.com/revfactory/harness-100, https://code.claude.com/docs/en/agent-teams, https://www.anthropic.com/engineering/harness-design-long-running-apps, https://www.anthropic.com/engineering/managed-agents
