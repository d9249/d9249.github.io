---
title: "Stet은 GPT-5.5와 Opus 4.7의 차이를 테스트 통과율 너머에서 드러낸다"
date: "2026-05-06T12:55:12"
description: "Stet의 56개 실전 리포지토리 태스크 비교는 GPT-5.5가 Codex CLI에서 더 자주 ‘출하 가능한 패치’를 만들고, Opus 4.7은 Claude Code에서 더 작은 패치를 만들지만 통합 작업을 덜 마무리하는 경향이 있음을 보여 준다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - GPT-5.5
  - Claude Opus
  - Codex CLI
  - Benchmark
  - Agents
draft: false
---

코딩 에이전트 평가에서 가장 흔한 착시는 “테스트만 통과하면 좋은 모델”이라고 믿는 것이다. 실제 팀이 체감하는 품질은 그보다 훨씬 복잡하다. 패치가 테스트를 통과하더라도 리뷰에서 막힐 수 있고, 로컬 수정은 맞지만 리포 전체의 companion surface를 놓칠 수 있으며, 반대로 약간 더 큰 패치가 실제로는 더 안전하고 유지보수 가능한 변경일 수도 있다.

사용자가 보낸 Reddit 글은 바로 이 문제의식을 요약한 2차 소스다. 하지만 핵심 내용의 실체는 Reddit 자체보다, 글 작성자가 연결한 `Stet`의 공식 비교 포스트와 methodology 페이지에 있다. 그래서 이 글은 Reddit 반응을 중심으로 보기보다, Stet이 공개한 56개 실전 코딩 태스크 비교를 1차 소스로 다시 읽는 쪽에 초점을 맞춘다.

Stet의 메시지는 간단하지만 중요하다. `GPT-5.5`는 더 자주 출하 가능한 패치를 만들고, `Opus 4.7`은 더 작은 패치를 만든다. 문제는 작은 패치가 항상 더 disciplined하다는 뜻은 아니라는 점이다. Zod 같은 로컬 수정 중심 리포에서는 작은 패치가 매력적일 수 있지만, `graphql-go-tools`처럼 planner·datasource·runtime이 함께 물린 리포에서는 작은 패치가 곧 under-implementation으로 이어질 수 있다.

![Stet GPT-5.5 vs Opus 4.7 OG image](https://www.stet.sh/og/gpt-55-vs-opus-47.png)

## 무엇을 해결하려는가

Stet이 풀려는 문제는 “어떤 모델이 더 똑똑한가”보다 “어떤 모델이 내 코드베이스에서 더 출하 가능한 패치를 만드는가”에 가깝다. methodology 페이지가 반복해서 강조하듯, 공개 리더보드는 점점 덜 신뢰할 수 있다. 모델이 오픈소스 벤치마크를 학습했을 가능성도 있고, 단일 pass rate는 쉬운 문제와 어려운 문제를 한 숫자로 뭉개 버린다.

이 프로젝트가 문제 삼는 핵심은 바로 그 flattening이다. 두 모델이 비슷한 테스트 통과율을 보여도, 실제로는 인간 PR과의 behavioral equivalence, reviewer acceptance, footprint risk, maintainability에서 2배 이상 차이날 수 있다는 것이다. 즉 “테스트를 통과했는가”는 출발점이지, 팀이 원하는 패치를 냈는지의 종점이 아니다.

이 문제의식은 코딩 에이전트가 실무로 들어올수록 더 중요해진다. 모델 교체, harness 변경, AGENTS.md 수정, plan-before-code 같은 운영 규칙 변경이 있을 때, 팀이 궁금한 것은 리더보드 순위가 아니라 자기 리포에서 partial implementation이 줄었는지, 코드 리뷰 통과율이 올라갔는지, 비용 대비 결과가 나아졌는지다. Stet은 그 질문을 측정 가능하게 만들려는 도구로 읽힌다.

## 핵심 아이디어 / 구조 / 동작 방식

Stet의 방법론은 merged PR에서 태스크를 뽑아오는 방식으로 출발한다. methodology 페이지 기준으로 절차는 다음과 같다. 먼저 추적 중인 공개 저장소에서 실제로 merge된 PR을 고르고, 여기서 issue와 변경된 테스트를 바탕으로 태스크를 추출한다. 그다음 리포를 pre-merge 상태로 되돌린 뒤, 에이전트에게 해당 변경을 구현하게 하고, 마지막으로 인간이 원래 통과시켰던 테스트를 같은 방식으로 다시 돌린다.

중요한 점은 테스트가 “gate”라는 것이다. Stet은 테스트를 버리지 않는다. 오히려 테스트를 기본 정답 검증 계층으로 유지하되, 그 위에 equivalence, code review, footprint risk, cost, craft/discipline rubric을 얹는다. methodology 문서가 말하듯, differentiation은 gate 위에서 생긴다. 즉 같은 테스트를 통과한 패치들 사이에서도 semantic intent와 리뷰 품질 차이가 크다는 전제가 깔려 있다.

이번 비교 포스트에서 실행 구성은 비교적 단순하다. `Opus 4.7`은 `Claude Code`, `GPT-5.4`와 `GPT-5.5`는 `Codex CLI`에서 모두 default/high 설정으로 돌았다. 태스크 수는 총 56개, 리포는 `Zod` 27개와 `graphql-go-tools` 29개다. Stet은 여기서 단순 pass/fail 외에도 equivalence judge와 rubric judge를 사용해 인간 패치와의 정합성을 본다. 이 글의 caveat에서도 명시되듯 equivalence/rubric judge는 `GPT-5.4`이며, dual-rater calibration은 없기 때문에 절대 점수보다 cross-arm delta를 보는 게 더 중요하다고 밝힌다.

| 레이어 | 공개 자료에서 확인되는 구성 | 역할 |
|---|---|---|
| Task extraction | merged PR 기반 태스크 생성, pre-merge snapshot 복원 | 실제 코드베이스 작업을 재현 |
| Correctness gate | 원래 PR이 통과한 테스트 재실행 | “작동하는가”를 기본 검증 |
| Quality grading | equivalence, code review, footprint, craft/discipline | 테스트만으로 안 보이는 품질 차이를 측정 |
| Harness comparison | Opus 4.7 in Claude Code, GPT-5.4/5.5 in Codex CLI | 현실적인 사용 환경 그대로 비교 |
| Longitudinal eval | leaderboard, weekly runs, repo별 slice | 모델/설정/지침 변경을 지속 추적 |

Stet 홈페이지와 methodology를 같이 보면 이 프로젝트는 단일 블로그 포스트용 실험이 아니라, “내 코드베이스를 기준으로 모델·하네스·AGENTS.md를 비교하는 agent-native eval layer”를 지향한다는 점도 분명하다. 홈페이지의 문구도 이를 잘 보여 준다. “Tests pass. That’s all you know.”라는 문장은, 테스트 통과만으로는 팀이 궁금한 운영 질문에 답이 안 된다는 제품 포지셔닝 자체다.

## 공개된 근거에서 확인되는 점

가장 먼저 볼 수 있는 것은 총괄 성적표다. Stet 공식 포스트 기준 56개 태스크에서 `GPT-5.5`는 테스트 통과 `38/56`, 인간 패치와의 equivalence `40/56`, clean pass(테스트 + 리뷰) `28/56`로 가장 높다. `Opus 4.7`은 각각 `33/56`, `19/56`, `10/56`이고, 대신 footprint risk는 `0.20`으로 가장 낮다. `GPT-5.4`는 테스트 `31/56`, equivalence `35/56`, clean pass `11/56`, cost/task `$2.39`로 가장 저렴한 축에 위치한다.

리포별 분해가 더 중요하다. `Zod`에서는 `Opus 4.7`과 `GPT-5.5`가 둘 다 테스트 `12/27`로 묶인다. 하지만 reviewer acceptance는 `Opus 6/27`, `GPT-5.5 14/27`, clean pass는 각각 `5/27`과 `10/27`이다. 즉 “테스트 동률”이 곧 “실무 동률”이 아니라는 게 이 리포에서 드러난다. 반대로 `graphql-go-tools`에서는 격차가 훨씬 크다. `GPT-5.5`는 테스트 `26/29`, equivalence `22/29`, review pass `19/29`, clean pass `18/29`이고, `Opus 4.7`은 `21/29`, `8/29`, `5/29`, `5/29`다.

full scorecard는 왜 이런 차이가 나는지를 더 구체적으로 보여 준다. `GPT-5.5`는 correctness `3.16`, introduced-bug safety `3.04`, GraphQL maintainability `3.03`, rubric average `2.62`, discipline `2.36`으로 전반적으로 가장 높다. 반면 `Opus 4.7`은 footprint risk에서는 가장 좋지만 equivalence와 code review에서 크게 밀린다. 이 구도는 “작은 패치”와 “적절히 완결된 패치”가 서로 다른 개념이라는 Stet의 주장을 뒷받침한다.

비용과 시간도 흥미롭다. 전체 평균으로는 `GPT-5.5`가 mean time/task `6m56s`로 가장 빠르고, total input/output tokens도 가장 적다. 하지만 cost/task는 `GPT-5.4`가 `$2.39`로 가장 저렴하다. 리포별 세부 수치를 보면 Zod에서는 `Opus 4.7`과 `GPT-5.5`가 비용/시간 면에서 비슷하지만, GraphQL에서는 `Opus 4.7`이 더 오래 돌고 더 많은 토큰을 쓰면서도 더 작은, 그러나 덜 완결된 패치로 끝나는 모습이 보인다.

또 하나 꼭 짚어야 할 것은 caveat다. 이 결과는 모델 단독 비교가 아니라 **모델 + 네이티브 하네스** 비교다. Stet 공식 글도 이 점을 분명히 적는다. `Opus 4.7`은 `Claude Code`, `GPT-5.5`는 `Codex CLI` 안에서 평가되었고, 서로를 반대 하네스에 넣으면 결과가 달라질 수 있다. 즉 이 포스트는 “순수 모델 IQ”보다 “현실적인 에이전트 사용 조합”을 비교한 결과다.

| 비교 축 | Opus 4.7 | GPT-5.4 | GPT-5.5 |
|---|---:|---:|---:|
| Tests pass | 33/56 | 31/56 | **38/56** |
| Equivalent to human patch | 19/56 | 35/56 | **40/56** |
| Clean pass | 10/56 | 11/56 | **28/56** |
| Footprint risk | **0.20** | 0.34 | 0.32 |
| Mean time / task | 11m18s | 8m24s | **6m56s** |
| Cost / task | $3.43 | **$2.39** | $2.86 |

| Repo | 핵심 해석 |
|---|---|
| Zod (27 tasks) | Opus와 GPT-5.5가 테스트는 동률이지만, 리뷰와 clean pass에서 GPT-5.5가 우세 |
| graphql-go-tools (29 tasks) | GPT-5.5가 테스트·equivalence·review·clean pass 모두 크게 앞서며 작은 패치 전략의 한계를 드러냄 |

## 실무 관점에서의 해석

내가 보기에 이 비교의 핵심은 “GPT-5.5가 더 좋다”보다 “무엇을 좋다고 부를 것인가”를 다시 정의한다는 데 있다. 만약 팀의 기준이 diff footprint 최소화라면, `Opus 4.7`의 보수적 성향은 여전히 장점일 수 있다. 하지만 팀이 원하는 결과가 “테스트를 넘고, 인간 패치와 의도가 맞고, 리뷰어가 바로 merge할 수 있는 패치”라면, Stet의 데이터는 `GPT-5.5`가 더 자주 그 바를 넘었다고 말한다.

특히 `graphql-go-tools` 사례는 코딩 에이전트 평가가 왜 리포별이어야 하는지를 잘 보여 준다. planner, datasource, validation, runtime처럼 여러 surface가 묶인 리포에서는 local optimum이 곧 global optimum이 아니다. 작은 패치가 효율적으로 보일 수 있지만, 실제론 companion surface를 덜 건드려 under-implementation으로 끝날 수 있다. 이 경우 작은 패치는 disciplined diff가 아니라 incomplete diff다.

반대로 `Zod`처럼 로컬 수정 비중이 큰 리포에서는 trade-off가 더 진짜처럼 보인다. 테스트 pass 수만 보면 Opus와 GPT-5.5가 같기 때문이다. 이런 경우 팀은 “리뷰 마찰을 줄이는 게 더 중요한가, 아니면 patch footprint를 줄이는 게 더 중요한가”를 스스로 결정해야 한다. Stet이 말하는 repo-specific eval의 진짜 의미도 바로 여기 있다. 정답 모델 하나가 있는 게 아니라, 리포의 구조와 팀의 배포 문화에 따라 최적점이 달라진다는 것이다.

또 하나 흥미로운 포인트는 `GPT-5.4`의 위치다. 이 모델은 “저렴한 대안” 이상으로, 방향은 맞지만 execution이 덜 안정적인 모델처럼 그려진다. Stet 포스트가 지적하듯 equivalence 숫자는 꽤 괜찮지만, 실제 테스트 통과와 clean pass로 이어지지 못하는 경우가 많다. 이는 비용 최적화 선택지로는 의미가 있지만, default shipping model로 쓰기엔 품질 갭이 크다는 해석으로 이어진다.

마지막으로 이 글은 Reddit 커뮤니티 반응과도 흥미롭게 맞물린다. 댓글 다수는 Claude/Opus의 overthinking, context burn, planning churn을 체감적으로 이야기한다. 물론 이는 통제된 실험이 아니므로 증거 수준은 낮다. 하지만 Stet이 GraphQL 리포에서 관찰한 “Opus는 더 오래 생각하고 더 많은 토큰을 쓰면서도 더 작은, 덜 완결된 패치에 수렴했다”는 서술과 방향은 꽤 유사하다. 즉 커뮤니티 정서는 잡음이 많지만, 공식 비교 포스트의 정량 결과와 완전히 동떨어져 있지는 않다.

결국 이 비교가 남기는 가장 중요한 메시지는 하나다. 앞으로의 코딩 에이전트 평가는 “정답을 맞혔는가”보다 “우리 팀이 실제로 merge하고 싶은 패치를 얼마나 자주 내는가”로 이동할 가능성이 크다. Stet은 그 이동을 비교적 설득력 있게 제품화한 사례다.

Sources: https://www.reddit.com/r/codex/comments/1t0xt5m/gpt55_vs_gpt54_vs_opus_47_on_56_real_coding_tasks/.json?raw_json=1, https://www.stet.sh/blog/gpt-55-vs-opus-47, https://r.jina.ai/http://www.stet.sh/blog/gpt-55-vs-opus-47, https://www.stet.sh/methodology, https://r.jina.ai/http://www.stet.sh/methodology, https://www.stet.sh/leaderboard, https://r.jina.ai/http://www.stet.sh/leaderboard, https://www.stet.sh/