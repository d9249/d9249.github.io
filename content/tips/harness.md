---
title: "Harness: Claude Code용 에이전트 팀 아키텍처 팩토리"
date: "2026-05-28T14:18:26"
description: "revfactory/harness는 한 문장 도메인 설명을 Claude Code용 .claude/agents와 .claude/skills로 바꿔 에이전트 팀 하네스를 설계하는 Apache-2.0 메타 스킬/플러그인입니다."
author: "Sangmin Lee"
repository: "revfactory/harness"
sourceUrl: "https://github.com/revfactory/harness"
status: "Open source Claude Code plugin"
license: "Apache-2.0"
platforms:
  - "macos-linux"
tags:
  - "Claude Code"
  - "Agent Teams"
  - "SKILL.md"
  - "Multi-Agent"
  - "Developer Tools"
highlights:
  - "도메인 한 문장을 받아 Claude Code 프로젝트의 .claude/agents와 .claude/skills 구조를 생성하는 메타 스킬입니다."
  - "Pipeline, Fan-out/Fan-in, Expert Pool, Producer-Reviewer, Supervisor, Hierarchical Delegation 여섯 가지 팀 패턴을 기본 선택지로 둡니다."
  - "Claude Code v2.x와 Agent Teams 실험 플래그가 전제이므로, 일반 CLI나 여러 에이전트 런타임용 범용 도구로 보면 안 됩니다."
  - "릴리스/태그가 아직 없어 팀 도입 시에는 저장소 커밋을 고정하고 생성되는 agent/skill diff를 리뷰하는 편이 안전합니다."
draft: false
---

`revfactory/harness`는 보통의 라이브러리라기보다 **Claude Code 안에서 에이전트 팀을 설계해 주는 메타 스킬**에 가깝다. “하네스 구성해줘” 또는 “build a harness for this project”처럼 도메인을 설명하면, 그 도메인에 맞는 전문 에이전트 정의와 각 에이전트가 사용할 `SKILL.md`를 프로젝트 안에 생성하는 흐름이다.

핵심은 “좋은 프롬프트 하나”가 아니라 **팀 구조를 파일로 남기는 것**이다. Harness가 목표로 하는 산출물은 `.claude/agents/`와 `.claude/skills/` 아래의 Markdown 파일이고, 스킬 본문은 필요하면 `CLAUDE.md`에 최소 포인터를 남겨 다음 세션에서도 같은 하네스를 다시 트리거하도록 설계한다.

![Harness 에이전트 팀 일러스트](/images/tips/harness-team.webp)

## 무엇을 담고 있나

저장소의 공개 자료를 보면 Harness는 자신을 “Team-Architecture Factory”로 정의한다. 입력은 도메인 문장이고, 출력은 Claude Code가 읽을 수 있는 에이전트 팀 구성이다.

구성은 작지만 명확하다.

- `.claude-plugin/plugin.json`: Claude Code 플러그인 메타데이터. 버전은 `1.2.0`, 라이선스는 `Apache-2.0`으로 명시되어 있다.
- `skills/harness/SKILL.md`: 실제 메타 스킬. 현황 감사, 도메인 분석, 팀 아키텍처 설계, 에이전트 정의 생성, 스킬 생성, 통합·검증까지 6단계 이상으로 흐름을 잡는다.
- `skills/harness/references/`: 에이전트 디자인 패턴, 오케스트레이터 템플릿, 팀 예시, 스킬 작성/테스트 가이드, QA 에이전트 가이드가 들어 있다.
- `docs/quickstart.md`: Claude Code 플러그인 설치와 첫 하네스 생성 흐름을 5분 튜토리얼로 정리한다.
- `docs/experimental-dependency.md`: Agent Teams 실험 플래그 의존성을 따로 설명한다.

여기서 중요한 점은 Harness가 독립 실행형 오케스트레이터 서버나 범용 agent framework가 아니라는 것이다. 공식 README와 FAQ 기준으로 현재 공식 런타임은 **Claude Code**다. Codex 쪽은 별도 포트인 `SaehwanPark/meta-harness`가 언급되지만, 이 저장소 자체를 Codex/Hermes/OpenCode용 범용 스킬 팩으로 일반화하면 안 된다.

## 여섯 가지 팀 패턴

Harness가 반복해서 강조하는 선택지는 여섯 가지다.

- **Pipeline**: 분석 → 설계 → 구현 → 검증처럼 순차 의존성이 강한 흐름
- **Fan-out/Fan-in**: 여러 전문가가 병렬 조사·생성 후 결과를 통합하는 흐름
- **Expert Pool**: 입력 유형에 따라 필요한 전문가만 선택 호출하는 흐름
- **Producer-Reviewer**: 생성자와 검토자가 짝을 이루어 품질을 올리는 흐름
- **Supervisor**: 중앙 감독자가 작업 상태를 보고 동적으로 분배하는 흐름
- **Hierarchical Delegation**: 상위 에이전트가 하위 역할로 문제를 분해하는 흐름

이 패턴 자체는 새롭다기보다, Claude Code의 agent/team 기능을 쓸 때 매번 즉흥적으로 팀을 만드는 비용을 줄이기 위한 체크리스트에 가깝다. 예를 들어 코드 리뷰 하네스라면 보안·성능·아키텍처·스타일 리뷰어를 병렬로 두고, 최종 통합자가 충돌을 병기하게 만드는 식이다. 리서치 하네스라면 공식 문서, 미디어, 커뮤니티, 배경 조사자를 분리하는 팬아웃/팬인 구조가 자연스럽다.

## 설치와 첫 사용 흐름

Quickstart 기준 전제는 Claude Code `v2.x` 이상, 셸 환경, `github.com`과 `api.anthropic.com` 네트워크 접근이다. Agent Teams를 쓰려면 현재 문서상 실험 플래그도 필요하다.

```bash
claude plugin marketplace add revfactory/harness
claude plugin install harness@harness
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

그다음 프로젝트 디렉터리에서 다음처럼 도메인을 넘긴다.

```bash
claude "build a harness for a fintech risk-assessment team"
```

README에는 Claude Code 내부 slash command 형태도 같이 나온다.

```text
/plugin marketplace add revfactory/harness
/plugin install harness@harness
```

플러그인 흐름을 쓰지 않고 저장소의 스킬만 직접 복사하는 경로도 문서화되어 있다.

```bash
cp -r skills/harness ~/.claude/skills/harness
```

다만 팀 단위로 운영할 생각이라면 “설치된다”보다 “내 프로젝트에 어떤 파일을 생성하는가”가 더 중요하다. Harness는 `.claude/agents/`, `.claude/skills/`, 경우에 따라 `CLAUDE.md` 포인터를 건드리는 도구다. 생성 직후에는 반드시 diff를 보고, 팀 역할·도구 권한·출력 위치·재시도 규칙이 실제 프로젝트 규칙과 맞는지 확인해야 한다.

## 왜 유용한가

첫째, 멀티 에이전트 구성을 **일회성 프롬프트에서 프로젝트 자산으로 끌어내린다.** 좋은 팀 구성을 매번 대화창에 설명하는 대신, 역할과 프로토콜을 Markdown 파일로 남기면 다음 세션이나 팀원도 같은 구조를 검토하고 수정할 수 있다.

둘째, 팀 패턴의 선택지를 미리 좁혀 준다. 에이전트가 여러 명 필요하다는 말만으로는 “병렬 조사”, “생성-검증”, “감독자-워커”, “전문가 풀” 중 무엇이 맞는지 애매하다. Harness는 이 결정을 명시적인 패턴 선택 문제로 바꾼다.

셋째, 스킬 작성 규칙까지 같이 묶는다. `SKILL.md`는 context를 잡아먹기 쉬운데, Harness는 Progressive Disclosure, references 분리, 에이전트와 스킬의 역할 분리, QA 에이전트 통합 같은 운영 규칙을 함께 제공한다. Claude Code를 매일 쓰면서 프로젝트별 runbook을 쌓는 팀이라면 이 부분이 특히 실용적이다.

## 주의할 점

가장 큰 전제는 **Claude Code Agent Teams 의존성**이다. 문서 기준 `TeamCreate`, `SendMessage`, `TaskCreate`가 실험 플래그에 묶여 있고, 플래그가 빠지면 팀 패턴이 단일 에이전트 실행처럼 무너질 수 있다고 설명한다. 프로덕션 워크플로에 넣기 전에는 현재 Claude Code 버전과 Agent Teams 동작을 작은 프로젝트에서 먼저 확인하는 편이 좋다.

둘째, 비용과 호출 수를 과소평가하면 안 된다. Quickstart도 멀티 에이전트 팀이 5개 이상의 병렬 Claude 호출로 번질 수 있고, 복잡한 티켓 하나가 50K~200K 토큰을 쓸 수 있다고 경고한다. 연구·리뷰·마이그레이션처럼 품질이 중요한 작업에는 값이 있을 수 있지만, 단순 작업에 항상 켜 둘 도구는 아니다.

셋째, 릴리스 표면은 아직 가볍다. GitHub Releases와 tags는 확인 시점에 없었고, README/플러그인 manifest는 `1.2.0`을 가리킨다. `CHANGELOG.md`에는 후속 항목도 보이지만, 팀 재현성을 원한다면 `main`을 그대로 따라가기보다 특정 commit을 고정해 내부 저장소나 dotfile 관리 체계로 가져오는 편이 안전하다.

넷째, 외부 agent skill은 신뢰 표면이다. Harness 자체의 privacy page는 플러그인이 별도 telemetry나 서버 전송을 하지 않고 로컬 Claude Code 환경에서 동작한다고 설명하지만, Claude Code로 보내는 프롬프트·파일 읽기·생성된 스킬의 명령 실행 가능성은 별개의 문제다. 민감한 저장소에서는 설치보다 먼저 `SKILL.md`와 references를 읽고, 생성된 agent/skill이 어떤 파일을 읽고 쓰는지 리뷰해야 한다.

## 내 판단

이미 Claude Code를 깊게 쓰고 있고, “이번 프로젝트에는 어떤 에이전트 팀을 두어야 하지?”라는 고민을 반복한다면 Harness는 꽤 흥미로운 출발점이다. 특히 리서치, 코드 리뷰, 문서화, 대규모 리팩터링처럼 역할 분리와 검증 루프가 품질을 좌우하는 작업에서 유용하다.

반대로 단일 에이전트에게 짧은 수정만 맡기는 환경이라면 무겁다. Agent Teams 플래그, 생성 파일 리뷰, 토큰 비용, 팀 프로토콜 조정까지 감수할 만큼 복잡한 작업이 있을 때 쓰는 편이 맞다. 내 기준으로는 “항상 켜 두는 생산성 앱”보다 **팀별 agent runbook을 빠르게 스캐폴딩하는 설계 도구**에 가깝다.

## 참고한 공개 자료

- [revfactory/harness GitHub repository](https://github.com/revfactory/harness)
- [Harness Quickstart](https://github.com/revfactory/harness/blob/main/docs/quickstart.md)
- [Experimental Flag Dependency](https://github.com/revfactory/harness/blob/main/docs/experimental-dependency.md)
- [Harness plugin manifest](https://github.com/revfactory/harness/blob/main/.claude-plugin/plugin.json)
- [Harness SKILL.md](https://github.com/revfactory/harness/blob/main/skills/harness/SKILL.md)
- [Agent Team Design Patterns](https://github.com/revfactory/harness/blob/main/skills/harness/references/agent-design-patterns.md)
- [Harness Privacy Policy](https://revfactory.github.io/harness/privacy.html)
