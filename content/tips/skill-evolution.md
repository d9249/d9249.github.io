---
title: "Skill Evolution: 에이전트 스킬을 ‘제안 → 평가 → 승인’ 흐름으로 개선하는 피드백 루프"
date: "2026-08-06T13:16:45"
description: "Carlo1911/skill-evolution은 Hermes·Claude Code의 과거 세션과 설치된 스킬을 비교해 개선 제안을 만들고, 평가 게이트와 사람의 승인 뒤에만 변경을 실행하도록 설계한 Python 기반 스킬 유지보수 도구입니다."
author: "Sangmin Lee"
repository: "Carlo1911/skill-evolution"
sourceUrl: "https://github.com/Carlo1911/skill-evolution"
status: "Open source preview"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "AI Agents"
  - "Agent Skills"
  - "Hermes"
  - "Claude Code"
  - "Python"
  - "Evaluation"
highlights:
  - "과거 세션과 설치된 스킬을 비교해 누락·중복·노후화·개선 후보를 사람이 읽을 수 있는 Markdown 제안으로 남긴다."
  - "기본 동작은 review-only다. 높은 confidence만으로는 부족하며 평가 게이트를 통과한 뒤 별도 사람/에이전트 단계가 변경을 실행한다."
  - "Hermes와 Claude Code용 HostAdapter를 제공하며, 다른 호스트도 세션·스킬 읽기와 쓰기 계약을 구현해 붙일 수 있다."
  - "기본 평가에는 구조·크기·증감 제한, LLM judge, 이전 통과 결과 대비 regression 검사가 포함된다."
  - "2026년 7월 말에 만들어진 초기 프로젝트이며 release/tag가 없으므로, 먼저 review-only로 작은 스킬 집합에서 검증하는 편이 좋다."
draft: false
---

에이전트 스킬은 작업이 반복될수록 누락·중복·노후화가 쌓이기 때문에, 작성만큼 유지보수의 설계가 중요해진다.

`Skill Evolution`은 이 문제를 **관찰 → 제안 → 평가 → 사람 승인 → 적용**으로 분리한다.[4]

공개 저장소는 Hermes와 Claude Code 어댑터를 제공하며, 세션 기록과 설치된 스킬을 비교해 구조화된 Markdown proposal을 만들도록 설계됐다.[1][2][4]

## 무엇을 해주는 도구인가

`fetch_sessions.py`는 아직 처리하지 않은 세션을 가져오고, `skill_index.py`는 설치된 스킬 목록을 만든다.[3][4]

호스트 에이전트는 이 입력을 바탕으로 개선안을 작성하며, 결과는 YAML frontmatter를 포함한 Markdown proposal로 `proposals/`에 남는다.[3][4]

제안은 기존 스킬 수정(`improve_existing`), 새 스킬 생성(`create_new`), 중복 스킬 통합(`merge_skills`), 노후 스킬 정리(`deprecate_skill`)의 네 유형을 지원한다.[4][7]

```text
과거 세션 + 설치된 스킬 인덱스
  → LLM 분석
  → 개선 제안 Markdown
  → 사람 검토·승인
  → 평가 게이트
  → 호스트별 적용 단계
```

## 왜 유용한가

- 분석 단계는 proposal만 만들고, 스킬 변경 도구를 직접 호출하지 않도록 설계됐다.[3][4]
- Hermes에서는 통과한 proposal이 별도 에이전트가 실행할 `skill_manage` instruction을 반환한다.[4][8]
- Claude Code 어댑터는 검증된 변경을 직접 파일에 쓸 수 있다.[4][8]
- 기본 평가 조합은 deterministic 검사, LLM judge, regression 검사이며 provider 오류나 evaluator 실패는 통과로 간주하지 않는다.[4][6]
- 평가 이력은 JSONL로 누적하고, 크기·증감·누적 drift 제한도 함께 적용한다.[4][6]

이런 분리는 “스킬을 자동으로 고친다”보다 **스킬 변경을 검토 가능한 change-management 작업으로 만든다**는 점에서 더 가치가 있다.

## 설치와 첫 사용법

공식 README와 `SKILL.md`는 Hermes에서 다음 설치·로딩 경로를 제시한다.[3][4]

```bash
hermes skills install https://raw.githubusercontent.com/Carlo1911/skill-evolution/main/SKILL.md
hermes -s skill-evolution
```

그 다음 세션에서 최근 기록 분석을 요청하면 proposal을 만드는 흐름이다.[3][4]

이 저장소는 완성된 cron prompt나 자동 적용 job을 함께 배포하지 않으므로, 스케줄·전달 채널·apply 담당자는 운영자가 정해야 한다.[3][4]

Claude Code에서는 저장소를 clone해 스킬 디렉터리로 불러오고 `SKILL_EVOLUTION_HOST=claude_code`를 설정한다.[3][4]

이 값을 생략하면 기본값인 Hermes 어댑터가 선택되므로, 다른 호스트에서 잘못된 세션 DB와 스킬 트리를 바라볼 수 있다.[4][8]

## 평가 게이트는 무엇을 막는가

`apply_proposal()`은 proposal 상태와 confidence를 확인하고, 쓰기 가능한 호스트인지 검사한 뒤 평가를 실행한다.[6][7]

평가가 실패하거나 provider 설정이 잘못되면 변경을 허용하지 않는 fail-closed 방식이다.[4][6][7]

| 보호 장치 | 의미 |
|---|---|
| 크기·증감 제한 | 새 스킬의 절대 크기와 기존 스킬의 한 번당 증가·감소 폭을 제한한다. |
| 누적 drift 검사 | 여러 번의 작은 변경이 합쳐져 원본에서 크게 벗어나는 문제를 막는다. |
| LLM judge | 정확성·절차 준수·간결성을 기준으로 평가한다. |
| regression 검사 | 이전에 통과한 결과보다 품질 점수가 떨어지지 않도록 확인한다. |
| 사람 검토 | 기본 흐름은 proposal을 사람이 읽고 승인하는 review-only 방식이다. |

LLM judge를 기본 구성으로 사용하려면 provider credential이 필요하다.[3][4]

자격 증명이 없으면 게이트가 실패한 채 proposal이 계속 남을 수 있다.[3][4][6]

## 주의할 점

저장소는 provider 호출 전 secret redaction과 PII masking을 수행한다고 설명한다.[4][6]

하지만 실제 세션·도구 결과·프로젝트 경로에 무엇이 남는지는 사용 환경에 따라 다르므로, 외부 LLM provider를 쓰기 전에는 샘플 proposal과 전송 경계를 직접 점검하는 편이 안전하다.[4][6]

GitHub API 기준 저장소 생성일은 2026년 7월 29일이고, 조사 시점에는 GitHub Release와 tag가 없다.[2]

MIT 라이선스와 Python 3.10+ 요구사항은 명확하지만, 대규모 스킬 트리와 장기 운영에서의 품질·비용·오탐률은 사용자가 검증해야 한다.[2][5]

`AUTO_APPLY`를 켠 뒤에도 사람 또는 별도 단계가 `apply_proposal()`을 호출하는 구조이며, Hermes의 최종 `skill_manage` 실행은 별개의 agent step이다.[4][7][8]

## 내 판단

`Skill Evolution`은 “자율 에이전트가 자기 자신을 고친다”는 과장보다, 스킬 유지보수에 필요한 통제면을 구체적으로 구현한 초기 도구다.

여러 스킬을 운영하면서 반복 작업과 오래된 지시를 정리하고 싶다면, 먼저 review-only로 작은 스킬 집합의 proposal 품질을 확인한 뒤 적용 범위를 넓히는 접근을 추천한다.

## Sources

[1] https://github.com/Carlo1911/skill-evolution — Carlo1911/skill-evolution
[2] https://api.github.com/repos/Carlo1911/skill-evolution — GitHub repository API metadata
[3] https://raw.githubusercontent.com/Carlo1911/skill-evolution/main/README.md — skill-evolution README
[4] https://raw.githubusercontent.com/Carlo1911/skill-evolution/main/SKILL.md — skill-evolution SKILL.md
[5] https://raw.githubusercontent.com/Carlo1911/skill-evolution/main/pyproject.toml — skill-evolution pyproject.toml
[6] https://raw.githubusercontent.com/Carlo1911/skill-evolution/main/scripts/evaluate.py — skill-evolution evaluation gate
[7] https://raw.githubusercontent.com/Carlo1911/skill-evolution/main/scripts/proposal.py — skill-evolution proposal application logic
[8] https://raw.githubusercontent.com/Carlo1911/skill-evolution/main/scripts/host.py — skill-evolution host adapters
