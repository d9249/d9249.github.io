---
title: "autoresearch-skill은 스킬 프롬프트를 keep-or-discard 실험 대상으로 만든다"
date: "2026-07-15T22:04:35+09:00"
description: "olelehmann1337/autoresearch-skill은 Claude Code skill을 여러 번 실행하고 binary eval로 점수화한 뒤, 한 번에 하나의 prompt mutation만 keep-or-discard하는 자율 최적화 절차를 SKILL.md 형태로 정리한다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - Autoresearch
  - Agent Skills
  - Prompt Optimization
  - Binary Evals
  - Claude Code
image: "/images/blog/autoresearch-skill-binary-eval-loop.svg"
draft: false
---

에이전트 skill은 보통 문서처럼 보이지만, 실제로는 실행 결과를 바꾸는 절차적 인터페이스다. 같은 모델이라도 `SKILL.md`에 어떤 순서, 금지 조건, 예시, 검증 절차가 들어가느냐에 따라 도구 사용과 산출물 품질이 달라진다. 문제는 대부분의 skill 개선이 감상에 머문다는 점이다. 실패한 출력 하나를 보고 지시를 길게 덧붙이고, 다음 실행이 우연히 좋아 보이면 “개선됐다”고 결론 내리기 쉽다.

`olelehmann1337/autoresearch-skill`은 이 문제를 prompt 품질의 반복 실험으로 바꾼다. 저장소의 중심은 실행 라이브러리나 agent runtime이 아니라 Claude Code용 `SKILL.md`다. 대상 skill을 정하고, 서로 다른 3–5개 test input과 3–6개 binary eval을 고정한 뒤, baseline을 측정한다. 이후에는 한 번에 하나의 prompt mutation만 적용하고 같은 평가를 다시 돌려 점수가 좋아졌을 때만 유지한다.

이 구조는 Andrej Karpathy의 autoresearch 방법론에서 가져온 keep-or-discard 감각을 **스킬 문서 최적화**로 옮긴 것이다. 다만 “에이전트가 스스로 계속 좋아진다”는 표현보다 더 정확한 설명은 이렇다. **좋은 스킬을 정의하는 관찰 가능한 조건을 먼저 만들고, 그 조건 아래에서만 스킬을 수정하게 만든다.**

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/autoresearch-skill-binary-eval-loop.svg"
    alt="Autoresearch for Skills의 실험 계약, baseline, 단일 mutation, binary eval, keep 또는 discard와 기록 artifact를 보여 주는 흐름도"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 `SKILL.md`와 `eval-guide.md`를 바탕으로 재구성한 개선 루프. 핵심은 prompt를 무작정 고치는 것이 아니라 baseline, binary eval, keep-or-discard 기록을 먼저 고정하는 데 있다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

이 저장소가 겨냥하는 실패는 “대부분은 괜찮지만 특정 조건에서 자주 무너지는” skill이다. 공식 문서는 많은 skill이 약 70%는 작동하지만 나머지 상황에서 품질이 급격히 흔들린다고 출발한다. 해결책을 skill 전체 재작성으로 두지 않고, 여러 실행 결과를 모아 실패 패턴을 찾고 prompt를 조금씩 좁히는 방식으로 둔다.

여기서 가장 중요한 전제는 평가가 **binary**여야 한다는 것이다. `eval-guide.md`는 “글이 좋은가”, “전문적으로 보이는가”, “사람처럼 들리는가” 같은 1–7점 감상 평가를 피하라고 권한다. 대신 서로 다른 evaluator가 비교적 일관되게 판정할 수 있는 yes/no 질문을 요구한다.

| 약한 평가 기준 | binary eval로 바꾼 예 |
|---|---|
| 글이 읽기 좋은가? | 금지된 표현 목록이 0개인가? |
| 디자인이 전문적인가? | 잘리거나 겹친 텍스트가 하나도 없는가? |
| 코드가 깔끔한가? | 실제 실행에서 오류가 없는가? TODO/placeholder가 0개인가? |
| 보고서가 포괄적인가? | 필수 섹션과 근거 출처가 모두 포함됐는가? |

이 변화는 사소해 보이지만, autoresearch loop의 성패를 결정한다. metric이 모호하면 agent는 실제 품질 대신 점수화하기 쉬운 proxy를 과최적화한다. 반대로 binary condition이 지나치게 좁으면 자연스러운 결과보다 체크리스트 문구를 반복하는 skill이 된다. 문서는 eval을 3–6개 정도로 제한하고, 각 항목이 서로 중복되지 않으며 사용자가 실제로 신경 쓰는 품질을 측정해야 한다고 제안한다.

## 핵심 아이디어 / 구조 / 동작 방식

공식 `SKILL.md`의 순서는 독특하게도 실험 시작 전에 멈추는 것부터 시작한다. target skill 경로, test input, eval criteria, mutation당 실행 횟수, 반복 주기, budget cap이 사용자와 확인되기 전에는 실험을 돌리지 말라고 명시한다. 즉 이 artifact가 말하는 자율성은 목표와 평가를 임의로 발명하는 자율성이 아니라, **인간이 정한 평가 계약 안에서의 반복 자율성**이다.

그 뒤의 루프는 다섯 단계로 압축할 수 있다.

| 단계 | 저장소가 요구하는 행동 | 왜 필요한가 |
|---|---|---|
| 실험 계약 | 대상 `SKILL.md`, 입력, binary eval, run 수, budget을 확정 | 무엇을 최적화하는지와 비용 상한을 명확히 함 |
| Baseline | 원본 skill을 여러 번 실행해 experiment 0 점수를 기록 | 우연한 좋아 보임이 아니라 비교 가능한 기준선을 만듦 |
| 실패 분석 | 실패 output을 읽고 반복 패턴을 찾음 | 한 사례에 과적합하지 않고 실제 결함을 겨냥 |
| 단일 mutation | 지시 한 개를 추가·재배치·정교화·삭제 | 어떤 변경이 효과를 냈는지 추적 가능하게 함 |
| Eval과 결정 | 같은 입력·기준으로 재실행하고 keep 또는 discard | 점수 개선이 없으면 복잡도만 늘리지 않음 |

문서가 권하는 좋은 mutation도 꽤 보수적이다. 가장 자주 실패하는 패턴을 겨냥한 구체 지시를 추가하거나, 모호한 문장을 고치거나, 반복되는 금지 패턴을 명시하거나, 묻힌 핵심 지시를 위로 올리거나, 짧은 정답 예시를 넣는 방식이다. 반대로 skill 전체를 한 번에 다시 쓰거나, 이유 없이 규칙 10개를 넣거나, “더 잘해라” 같은 추상 지시를 추가하는 것은 나쁜 mutation으로 분류한다.

Baseline 이후에는 점수가 이미 90% 이상이면 계속 최적화할 필요가 있는지 사용자에게 다시 확인하도록 한다. 실험 중에도 점수가 개선될 때만 새 baseline으로 채택한다. 같거나 나빠지면 원래 `SKILL.md`로 되돌려야 한다. 이 원칙은 self-improvement를 긴 prompt 누적이 아니라 **검증된 최소 수정의 계보**로 바꾼다.

## 결과물은 개선된 skill 하나가 아니다

저장소가 명시하는 산출물은 다섯 가지다.

| 파일 | 역할 |
|---|---|
| `SKILL.md` | keep된 mutation이 반영된 현재 최선의 skill |
| `SKILL.md.baseline` | 실험 전 원본 보관본 |
| `results.tsv` | experiment 번호, 점수, pass rate, keep/discard를 남기는 간단한 로그 |
| `results.json` | live dashboard가 읽는 구조화된 상태 데이터 |
| `changelog.md` | 각 mutation의 가설, 변경, 결과, 남은 실패 패턴을 기록하는 연구 노트 |
| `dashboard.html` | `results.json`을 10초 간격으로 읽어 score progression과 eval breakdown을 보여 주는 화면 |

특히 `changelog.md`를 강조하는 점이 좋다. 개선된 최종 prompt만 남기면 “무엇이 왜 실패했는지”가 사라진다. 반면 keep과 discard를 모두 기록하면 다음 모델이나 다음 사람이 같은 실패 실험을 반복하지 않고, 평가 기준이 바뀌었을 때 왜 예전 mutation을 되돌렸는지도 판단할 수 있다.

이런 설계는 잘 다듬어진 agent 운영 원칙과 닮아 있다. baseline이 있어야 개선을 말할 수 있고, one-change-at-a-time이어야 원인을 분리할 수 있으며, independent eval이 있어야 자기평가의 낙관성을 줄일 수 있다. dashboard는 보기 좋은 부속물이지만, 진짜 핵심 artifact는 결과 표와 변경 이력이다.

## 공개된 근거에서 확인되는 점

공개 GitHub API 기준 `olelehmann1337/autoresearch-skill`은 `SKILL.md`와 `eval-guide.md` 두 파일을 루트에 둔 매우 작은 저장소다. 기본 브랜치는 `main`이고, API가 반환한 저장소 크기는 8KB 수준이다. 기본 README, checked-in `LICENSE`, GitHub release, tag는 확인되지 않는다.

실제 commit history도 이 해석을 강화한다. 기본 브랜치의 유일한 commit은 2026년 3월 18일 `Add autoresearch skill and eval guide`이며, API상 latest push도 같은 시점이다. 조회 시점 stars는 963, forks는 118이지만, 별도 패키지 배포나 계속된 release history가 있는 프로젝트로 읽기보다는 **공유 가능한 방법론 prompt와 eval 작성 가이드**로 보는 편이 정확하다.

| 표면 | 확인되는 내용 | 해석 |
|---|---|---|
| `SKILL.md` | Claude Code skill 최적화 절차, baseline·mutation·keep/discard·dashboard 요구사항 | 실행 엔진보다 운영 프로토콜을 담은 artifact |
| `eval-guide.md` | binary eval의 작성 규칙과 좋은/나쁜 예시 | 평가 설계가 method의 중심이라는 근거 |
| GitHub tree | 루트에 두 Markdown 문서만 존재 | 별도 CLI, package manifest, test runner는 포함하지 않음 |
| Release·tag·license | latest release 404, tags 빈 배열, license endpoint 404 | 재현 가능한 버전 배포물이나 라이선스 명시가 없는 초기 공개 상태 |

이 점은 도입 판단에 중요하다. 이 repo를 설치하면 곧바로 background experiment runner가 생기는 것이 아니다. 실제 반복 실행, output 수집, scoring, file backup, dashboard hosting, mutation 적용을 어떤 Claude Code environment와 shell workflow로 수행할지는 사용자가 구현하거나 agent에게 맡겨야 한다. 문서는 그 과정의 정책을 상세히 제시하지만, 그 정책을 강제하는 runnable harness는 제공하지 않는다.

## 실무 관점에서의 해석

이 저장소의 가장 가치 있는 문장은 “skill도 최적화 가능한 artifact다”가 아니라, **skill 최적화에는 eval 설계가 먼저다**에 가깝다. skill을 더 길게 만들기 전에, 좋은 출력과 실패 출력을 어떻게 기계적으로 가를지 정의해야 한다. 특히 tool call, 문서 생성, 코드 수정, 이미지·슬라이드 제작처럼 반복 실행이 가능한 skill에는 이 원칙이 잘 맞는다.

도입할 때는 scope를 작게 잡는 편이 좋다. 예를 들어 “코드 리뷰 skill의 보안 finding 재현율”, “블로그 skill의 frontmatter·source·build 통과율”, “다이어그램 skill의 텍스트 잘림 0건”처럼 관찰 가능한 조건을 고른다. 반대로 “더 창의적인 기획”, “더 설득력 있는 전략”, “더 좋은 문체”만을 목표로 두면 binary eval을 신뢰성 있게 만들기 어렵다. 이런 과제는 human review를 eval set에 포함하거나, 자율 mutation보다 보조적 draft/review loop로 다루는 편이 안전하다.

또 하나의 제약은 비용과 drift다. source는 기본적으로 mutation마다 여러 run을 권하고, experiment cycle의 기본 간격도 2분으로 둔다. 대상 skill이 외부 API를 쓰거나 이미지·코드 생성 비용이 크다면 5회 반복과 무제한 budget은 금방 비싸진다. budget cap, rate limit, isolated workspace, test/validation 분리, mutation allowlist가 필요하다.

마지막으로 이 방법은 production skill을 바로 바꾸는 데 쓰기보다 fork 또는 branch에서 먼저 검증해야 한다. source에는 반복 시작 뒤 95% 이상 pass rate가 3회 연속되거나 사용자가 중지할 때까지 멈추지 말라는 지시가 있다. 실제 팀 환경에서는 여기보다 더 보수적인 경계가 필요하다. 실험 branch, 원본 백업, 작은 regression suite, 사람이 승인하는 merge gate를 두고, credential·deployment·외부 발송 같은 권한은 mutation 범위에서 제외해야 한다.

정리하면 `autoresearch-skill`은 완성된 자동개선 제품이 아니라, agent skill을 관리하는 데 쓸 만한 **실험 설계 템플릿**이다. 작은 prompt patch, baseline, binary eval, keep-or-discard, changelog라는 구성은 단순하지만 강력하다. 좋은 점수는 prompt가 길어져서가 아니라, 무엇을 성공으로 볼지 먼저 합의했을 때 나온다는 사실을 잘 드러낸다.

Sources: https://github.com/olelehmann1337/autoresearch-skill, https://raw.githubusercontent.com/olelehmann1337/autoresearch-skill/main/SKILL.md, https://raw.githubusercontent.com/olelehmann1337/autoresearch-skill/main/eval-guide.md, https://api.github.com/repos/olelehmann1337/autoresearch-skill, https://api.github.com/repos/olelehmann1337/autoresearch-skill/contents, https://api.github.com/repos/olelehmann1337/autoresearch-skill/commits?per_page=5, https://api.github.com/repos/olelehmann1337/autoresearch-skill/tags
