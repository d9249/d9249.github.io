---
title: "SkillZip은 에이전트 스킬 라이브러리를 ‘텍스트’가 아니라 실행 계약으로 압축한다"
date: "2026-08-14T23:51:24+09:00"
description: "SkillZip은 커지는 agent skill library에서 반복되는 절차를 section-level graph와 reversible macro로 압축하되, 입력·출력·의존성·verifier·source expansion을 함께 보존해 작은 context도 실행 가능하게 만들려는 프레임워크다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - SkillZip
  - Agent Skills
  - Procedural Memory
  - Context Engineering
  - Graph Compression
draft: false
---

에이전트 skill library가 커질수록 병목은 “관련 skill을 찾을 수 있는가”에서 “실행에 필요한 절차만 빠뜨리지 않고 얼마나 작게 보여 줄 수 있는가”로 옮겨간다. skill 하나에는 instruction, script, schema, test, resource, warning이 섞여 있고, 비슷한 data ingestion·validation·failure handling이 여러 package에 중복된다. package 전체를 읽히면 context가 부풀고, 문장 압축만 하면 실행 전제나 검증 단계를 잃을 수 있다.

`SkillZip: Contract-Preserving Graph Compression for Scalable Agent Skill Libraries`는 이 문제를 retrieval이나 summarization의 문제가 아니라 **절차 계약을 보존하는 graph compression**으로 재정의한다.[1][2] 논문의 출발점은 단위 불일치다. 기존 시스템은 skill을 package 단위로 retrieve하고, text 단위로 compress한 다음, retrieve가 끝난 뒤에야 execution graph로 바꾼다. SkillZip은 그 중간에 있는 section-level procedural unit을 먼저 그래프로 만들고, 반복되는 subgraph만 reversible macro로 바꾼다.

따라서 목표는 가장 짧은 prompt가 아니다. 현재 task가 요구하는 input, dependency, guard, verifier, output을 닫힌 형태로 포함하면서도 필요할 때 원본 section까지 되돌아갈 수 있는 **작고 실행 가능한 context**다. 이 글에서 언급하는 성능은 모두 논문 저자의 benchmark 결과이며, 실서비스 skill ecosystem에서의 독립 재현과는 구분해야 한다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/skillzip-contract-graph-compression-overview.png">
    <img
      src="/images/blog/skillzip-contract-graph-compression-overview.png"
      alt="SkillZip 공식 구조도. Sec2Graph가 skill package를 절차 section graph로 바꾸고, MotifZip이 계약을 지키는 반복 subgraph를 macro로 압축하며, PathHydrate가 task별 실행 context를 만들고, ReZip이 새 skill과 실행 trace로 library를 갱신한다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2. package를 section graph로 열고, contract-valid motif만 reversible macro로 압축한 뒤, task별 dependency-closed context를 hydrate하고 execution evidence로 유지보수하는 전체 흐름.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

skill package 전체를 가져오는 방식은 안전해 보이지만 같은 boilerplate와 주변 작업을 반복 노출한다. 반대로 generic text compression은 token 수를 크게 줄여도 “delimiter를 추론한 뒤 row count가 보존됐는지 확인한다”처럼 operation과 verifier를 묶는 구조를 깨뜨릴 수 있다. 실제로 논문은 text compression이 SkillZip과 같은 3.46× compression ratio와 1,941 rendered token까지 줄일 수 있어도, dependency preservation(DPR)은 65.0%, verifier reachability(VR)는 60.0%로 내려가고 45.0%의 query에서 원본 section recovery가 필요했다고 보고한다.[2]

SkillZip이 보존하려는 계약은 세 층이다.

| 계약 층 | section graph에 명시하는 것 | 압축 시 잃으면 생기는 실패 |
|---|---|---|
| Interface | typed input·output, resource binding | macro가 주변 절차와 연결되지 않음 |
| Execution | precondition, dependency, guard, effect, failure handling | 필요한 준비·복구 단계가 사라짐 |
| Verification | success condition, verifier hook, source pointer | 실행 결과를 확인할 수 없거나 원본으로 되돌릴 수 없음 |

여기서 핵심은 **의미가 비슷한 문장**과 **교체 가능한 절차**를 구분하는 것이다. 예를 들어 CSV와 XLSX 모두 “header를 normalize한다”는 표현을 쓸 수 있지만, CSV는 delimiter·row identity를, formula-safe workbook은 formula preservation을 계약으로 가질 수 있다. SkillZip은 이 차이를 input/output port, resource family, verifier boundary까지 비교한 뒤에만 같은 macro에 넣겠다고 주장한다.[2]

## 핵심 아이디어 / 구조 / 동작 방식

### 1. Sec2Graph: skill을 실행 section으로 연다

먼저 package를 heading, list, code block, warning, argument, tool reference, test 같은 경계로 나누고, 각 section에 `Intent`, `Trigger`, `Input`, `Precondition`, `Operation`, `Resource`, `Failure`, `Verifier`, `Output`의 9개 operational role을 붙인다. 각 node는 내용만 저장하지 않는다. typed I/O, 사용 resource, guard·verifier condition, 원본 source pointer를 함께 가진다.[2]

그 뒤 dependency·weak-order·resource·repair·verifier edge를 연결해 한 skill 안에서 “무엇으로 시작해 어떤 검증된 output에 도달하는가”를 subgraph로 만든다. 서로 다른 skill에 나타나는 비슷한 section은 곧바로 하나로 합치지 않고, occurrence는 남겨 둔 채 compatible canonical prototype에만 연결한다. source membership과 local edge를 보존해야 나중에 발생별 맥락으로 확장할 수 있기 때문이다.

### 2. MotifZip: 반복되는 절차를 port가 있는 macro로 바꾼다

MotifZip은 unrestricted frequent-subgraph mining 대신 role signature, I/O shape, resource family가 호환되는 주변에서 후보를 키운다. candidate motif는 반복 횟수만으로 채택되지 않는다. 외부 graph로 나가는 boundary port, dependency closure, verifier reachability, source-level expansion이 모두 valid해야 한다.[2]

통과한 motif는 `input ports → output ports`를 가진 macro가 되며, 내부 subgraph와 계약 정보를 저장한다. 즉 macro는 원문을 짧게 paraphrase한 alias가 아니라, 필요하면 원래 node와 edge로 다시 풀 수 있는 **reversible execution unit**이다. 이 제약 때문에 SkillZip without checks는 더 높은 3.78× 압축을 보이지만, DPR 88.9%, VR 84.6%, reward 27.8로 full SkillZip보다 낮았다고 보고된다.[2]

### 3. PathHydrate와 ReZip: task마다 닫힌 경로를 꺼내고, 실행으로 갱신한다

PathHydrate는 query, executor profile, context budget을 받아 operation·verifier anchor를 함께 찾고, 해당 node 주변의 required dependency를 닫는다. 작은 section만 가져와도 되는 경우에는 macro 상태로 render하고, 위험·모호성·missing evidence가 있으면 original source section을 rescue한다. 결과물에는 hydrated context뿐 아니라 왜 어떤 macro를 expand했는지 기록하는 log도 남는다.[2]

ReZip은 library가 정적이라는 가정을 버린다. 새 skill이 오면 기존 macro에 맞는 부분은 reuse하고 나머지는 explicit residual로 남긴다. 이후 compatible residual이 반복되면 promote하고, 특정 resource나 verifier에서 expansion·failure가 반복되면 macro를 split하거나 demote한다. 즉 library maintenance는 주기적 full recompression만 하는 일이 아니라, **실행 trace를 계약 위험 신호로 쓰는 incremental update**가 된다.[2]

## 공개된 근거에서 확인되는 점

논문은 SkillsBench와 ALFWorld에서 whole-skill loading, Vector Skills, Graph-of-Skills(GoS), SkillDAG와 비교했다. 다음 수치는 MiniMax-M2.7의 SkillsBench 기본 1K-skill setting에서 section graph를 얼마나 작게 만들면서도 실행 구조를 유지했는지 보여 준다.[2]

| Representation | Rendered token | DPR · VR | Task reward |
|---|---:|---:|---:|
| Raw section graph | 6,716 | 100.0% · 100.0% | 31.0 |
| Text compression | 1,941 | 65.0% · 60.0% | 25.5 |
| SkillZip w/o checks | 1,777 | 88.9% · 84.6% | 27.8 |
| SkillZip | 1,941 | <strong>99.2% · 98.7%</strong> | <strong>33.3</strong> |

숫자가 가리키는 패턴은 단순하다. 더 aggressive한 compression 자체가 좋은 것이 아니다. 동일한 token budget에 가깝더라도 verifier와 dependency를 잃으면 원본 fallback이 늘고 reward가 떨어진다. full SkillZip은 raw section graph보다 reward가 31.0에서 33.3으로 높고, text compression 대비 recovery를 45.0%에서 14.8%로 낮췄다고 보고한다.[2]

end-to-end 비교에서도 저자 보고치는 일관된 방향이다. MiniMax-M2.7에서 SkillZip은 SkillsBench reward 33.3, ALFWorld success 79.3으로 SkillDAG의 27.3, 67.1보다 각각 6.0·12.2 point 높았다. gpt-5.2-codex 조건에서는 43.0, 96.4를 보고했다. 같은 MiniMax-M2.7 SkillsBench run에서 cumulative prompt processing은 SkillDAG 대비 47.0%, tool call은 21.7%, task time은 21.1% 줄었다는 결과도 제시한다.[2]

scaling claim도 구체적이다. 저자들은 고정된 evaluation query에 candidate library만 200개에서 100K skill까지 늘렸을 때, 100K에서 SkillZip Ret@1 65.1, similar-skill confusion 9.8%, online retrieval·hydration 248.3ms, compression ratio 4.29×를 기록했다고 보고한다. cached contract extraction 이후 4.77M section node를 갖는 100K-skill graph의 local graph construction과 MotifZip은 178초로 제시된다.[2]

한편 release maturity는 과장하면 안 된다. 논문 arXiv HTML은 별도 `Code`·project·model link를 제공하지 않으며, GitHub repository search에서도 저자·논문 제목과 연결되는 명백한 공식 implementation을 확인하지 못했다.[2][3] 현재 공개 근거는 논문과 arXiv HTML의 알고리즘·표·case study가 중심이다. 따라서 이 작업은 곧바로 install 가능한 library보다 **section-level skill compression의 방법 제안과 benchmark evidence**로 읽는 편이 정확하다.

## 실무 관점에서의 해석

SkillZip이 주는 가장 실용적인 메시지는 skill registry의 기본 unit을 다시 생각하라는 것이다. `SKILL.md`를 검색 가능한 문서로만 취급하면, top-k selection 뒤에는 package 전체를 읽히거나 사람이 중요 부분을 추측해 잘라야 한다. 반면 operation, input/output, resource, verifier, failure path를 registry metadata로 올리면, “어떤 skill이 관련 있는가”를 넘어 **어떤 최소 절차 경로가 이 task를 안전하게 끝내는가**를 묻기 시작할 수 있다.

그렇다고 모든 skill을 graph로 변환해야 한다는 뜻은 아니다. 경량 문서 skill이나 한 번 읽고 끝나는 prompt template은 contract extraction·maintenance 비용을 정당화하기 어렵다. SkillZip의 장점은 data wrangling, scientific computing, software/web처럼 반복되는 procedure와 확인 가능한 output이 많은 library에서 커진다. 논문 자체도 domain별 compression ratio가 ALFWorld에서는 1.62×, SkillsBench의 data wrangling에서는 4.21×로 다르다고 보고한다.[2]

도입하려는 팀은 먼저 자산을 압축하기보다 contract를 적는 데 투자해야 한다. 각 skill에 최소한 input/output type, required tool·resource, side effect, precondition, success verifier, fallback을 남기고, repeated routine이 실제로 여러 skill에서 같은 boundary behavior를 보이는지 측정해야 한다. 그 후에도 macro promotion은 human-reviewed change로 두는 편이 안전하다. 논문의 ReZip처럼 failure trace를 demotion signal로 쓰더라도, 잘못된 contract extractor가 공유 macro를 오염시키면 오류가 library 전체로 퍼질 수 있기 때문이다.

정리하면 SkillZip은 context window를 더 크게 쓰는 방향의 반대편에 있다. 긴 context에 모든 skill package를 밀어 넣는 대신, 실행에 필요한 절차만 작은 graph path로 hydrate하고, 누락된 safety contract는 source expansion으로 회복한다. large skill library의 다음 경쟁은 검색 임베딩 하나보다, 이처럼 **압축·실행·검증·원본 복구를 같은 procedural representation에 묶는가**에서 갈릴 가능성이 크다.

## Sources

[1] [arXiv abstract](https://arxiv.org/abs/2608.05604) — 논문 서지·초록·제출 정보
[2] [arXiv HTML](https://arxiv.org/html/2608.05604v1) — 방법, 공식 Figure 2, benchmark 표와 case study
[3] [GitHub repository search API](https://api.github.com/search/repositories?q=SkillZip+in%3Aname%2Cdescription%2Creadme&per_page=20) — 공개 implementation 탐색의 시간 한정 근거
