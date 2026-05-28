---
title: "SAM은 긴 에이전트 히스토리를 요약이 아니라 다시 열 수 있는 기억 페이지로 바꾼다"
date: "2026-05-28T14:30:04"
description: "arXiv 2605.24468의 SAM(State-Adaptive Memory)은 장기 에이전트 추론에서 과거 trajectory를 단일 요약으로 뭉개지 않고, compact cue와 원문 page store로 나눈 뒤 현재 recall intent에 맞춰 다시 읽게 하는 외부 메모리 프레임워크다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - SAM
  - State-Adaptive Memory
  - Agent Memory
  - Context Engineering
  - Long-Horizon Agents
  - Cabeza
  - arXiv
draft: false
---

긴 에이전트 작업에서 진짜 어려운 부분은 컨텍스트가 길어진다는 사실 자체가 아니다. 더 까다로운 문제는 20턴 전에 버린 가설, 50턴 전에 확인한 반례, 70턴 전에 찾은 출처가 지금의 다음 행동을 결정할 때 다시 필요해진다는 점이다. 단순히 context window를 키우면 한동안 버틸 수 있지만, 히스토리가 prefix처럼 계속 붙어 있으면 모델은 오래된 정보와 폐기된 중간 결론 사이에서 길을 잃기 쉽다.

`SAM: State-Adaptive Memory for Long-Horizon Reasoning Agent`는 이 문제를 **state-adaptive memory**로 다시 정의한다. SAM은 과거 상호작용을 하나의 rolling summary로 압축하지 않는다. 대신 오래된 trajectory를 page 단위로 외부에 보관하고, 각 page를 가리키는 compact memory cue만 active context에 남긴다. 이후 에이전트가 “지금 무엇을 다시 확인해야 하는가”라는 recall intent를 만들면, SAM은 관련 page를 다시 열어 현재 의사결정에 필요한 정보만 재구성한다.

내가 보기에 이 논문의 핵심은 “요약을 더 잘하자”가 아니다. **요약을 history의 대체물로 쓰지 말고, 원문 page를 다시 찾기 위한 handle로 쓰자**는 설계다. 이는 최근 agent context engineering에서 반복해서 보이는 방향과 맞닿아 있다. Arize Alyx 사례가 제품 관점에서 “큰 blob은 ID와 memory store로 빼고 필요할 때 다시 가져오라”고 말한다면, SAM은 그 패턴을 장기 웹 탐색/과학 QA 벤치마크에서 학습 가능한 외부 메모리 모듈로 만든다.

## 무엇을 해결하려는가

기존 장기 에이전트의 context management는 대체로 세 가지로 나뉜다.

첫째는 자르기다. 일정 window 밖의 tool response나 오래된 turn을 버린다. 구현은 쉽지만, 나중에 다시 필요한 early constraint가 사라진다.

둘째는 최근 k개 유지다. 최신 reasoning 흐름은 보존되지만, 장기 탐색에서 초기에 확인한 단서와 반례를 잃기 쉽다.

셋째는 rolling summary다. 오래된 prefix를 짧은 문단으로 압축한다. 단순 truncation보다 낫지만, 무엇이 나중에 중요해질지 요약 시점에는 알기 어렵다. 요약은 매끄러워 보여도, 실제로는 “왜 이 후보를 버렸는가”, “어떤 출처가 모순됐는가”, “다음에 다시 확인해야 할 blocker는 무엇인가” 같은 조작 가능한 상태를 잃을 수 있다.

SAM은 이 셋을 모두 완전히 부정하지 않는다. 다만 요약의 역할을 바꾼다. 요약은 과거 전체를 대체하는 surrogate가 아니라, 원문 trajectory page를 다시 열기 위한 cue다. 즉 context에는 작은 지도만 남기고, 실제 세부 기록은 외부 page store에 보존한다.

![SAM overview](/images/blog/sam-state-adaptive-memory-overview.webp)

*논문 공식 Figure 1. SAM은 page-based consolidation으로 오래된 trajectory를 compact memory cue와 raw page store로 나누고, 이후 recall intent에 맞춰 관련 page에서 decision-relevant information을 재구성한다. 하단은 expert trace 기반 SFT와 OAT-GRPO로 memory module을 학습하는 흐름이다.*

## 핵심 아이디어 / 구조 / 동작 방식

SAM의 write path는 비교적 단순하다. 에이전트가 생각, 도구 호출, 관찰, 중간 결론을 쌓아 가다가 live context가 정해진 budget에 닿으면, 최근 trajectory를 contiguous page로 묶는다. 논문 설정에서는 active context window가 128K이고, context management는 64K에서 trigger된다. page는 최대 32K token 정도의 연속 구간으로 기록된다.

각 page `p_k`에 대해 memory model은 `m_k`라는 compact memory cue를 만든다. 이 cue는 “이 page에서 무엇을 확정했는가”, “무엇을 배제했는가”, “무엇이 unresolved인가”, “나중에 다시 중요해질 수 있는 것은 무엇인가”를 continuation-oriented summary로 담는다. 이후 raw page는 active context에서 빠지고 외부 page store에 남는다. cue만 memory bank에 남아 에이전트가 볼 수 있다.

read path가 SAM의 차별점이다. 에이전트는 현재 상태에서 필요한 과거 정보를 설명하는 recall intent `q_t`를 만든다. 그리고 cue 목록을 보고 어떤 page를 다시 열지 고른다. 이 선택은 고정된 dense retrieval score가 아니라, 현재 추론 상태를 가진 에이전트의 판단에 맡긴다. 선택된 page에 대해 SAM은 raw trajectory를 다시 읽고, intent-conditioned recall summary를 만든다. 그래서 cue는 “압축된 답”이 아니라 “다시 열 수 있는 책갈피”에 가깝다.

이 구조는 일반 RAG와도 다르다. RAG가 보통 외부 지식 문서에서 query 관련 chunk를 찾는다면, SAM은 **에이전트 자기 자신의 과거 trajectory**를 다룬다. 검색 대상은 세상 지식이라기보다 “내가 방금까지 무엇을 시도했고, 무엇을 틀렸고, 어디서 막혔는가”다. 장기 에이전트에서는 이 차이가 크다. 틀린 가설을 잘 보존하는 것도 기억의 일부이기 때문이다.

## 학습: memory model만 따로 훈련한다

SAM은 main reasoning backbone을 다시 학습하지 않는다. 논문은 agent backbone과 memory model을 분리한다. 실험에서 agent backbone은 GLM-4.7과 Qwen3.5-35B-A3B이고, memory model은 Qwen3.5-9B에서 시작한다. 업데이트되는 것은 page consolidation과 intent-driven recall을 담당하는 memory model이다.

학습은 두 단계다.

첫째, expert-guided SFT다. 저자들은 OpenSeeker와 OpenResearcher 같은 공개 agent trajectory release에서 데이터를 만들고, Claude-4.5-Opus와 GPT-5.4를 expert memory model로 사용해 consolidation target과 recall target을 만든다. 단, 최종 답이 맞는 trajectory만 유지해 memory trace를 supervision으로 쓴다.

둘째, OAT-GRPO(Oracle-Anchored Tree GRPO)다. 일반 GRPO가 전체 trajectory의 sparse outcome만 보상으로 쓰기 쉽다면, SAM에서는 memory model이 agent loop 안의 tool처럼 여러 번 호출된다. 그래서 저자들은 memory call 지점마다 여러 sibling output을 branch로 만들고, 이후 reasoning 결과를 leaf outcome으로 평가한다. 또한 GPT-5.4, GLM-4.7, DeepSeek-V4-Flash 위원회가 만든 recall reference를 oracle proxy로 써서 recoverability reward를 densify한다.

이 부분은 실용적으로 중요한 caveat를 만든다. SAM은 작은 memory model을 붙이는 깔끔한 inference 구조를 제안하지만, 그 memory model을 학습하는 과정은 강한 frontier model committee와 꽤 무거운 rollout infrastructure에 의존한다. 논문 부록은 SFT에 8 GPUs, full-parameter Qwen3.5-9B, sequence length 100K, ZeRO-3/DeepSpeed를 사용하고, RL 단계도 외부 frozen reasoner와 memory-call tree rollout을 결합한다고 설명한다. 따라서 SAM을 “간단히 prompt로 흉내 낼 수 있는 규칙”으로 읽기보다는, 별도 memory model을 학습한 agent runtime으로 보는 편이 맞다.

## 공개된 근거에서 확인되는 점

평가는 BrowseComp, BrowseComp-ZH, HLE, WideSearch 네 가지 long-horizon agent benchmark에서 진행된다. BrowseComp와 HLE는 계산 제약 때문에 200개씩 sample하고, BrowseComp-ZH와 WideSearch는 전체 set을 사용한다. open-web 계열 benchmark에는 `search`, `visit`, `memory` tool을 쓰고, HLE의 scientific subset에는 `scholar`, `python`도 추가한다.

가장 통제된 비교는 같은 backbone에서 context management만 바꾼 표다. 아래는 Table 1의 핵심 행만 줄인 것이다.

| Backbone / Context management | BrowseComp | BrowseComp-ZH | HLE | WideSearch | Avg. |
|---|---:|---:|---:|---:|---:|
| GLM-4.7 / w/o CM | 43.5 | 52.5 | 37.2 | 65.4 | 49.4 |
| GLM-4.7 / summary | 53.5 | 59.0 | 37.5 | 68.3 | 54.6 |
| GLM-4.7 / SAM | 56.5 | 64.2 | 38.2 | 69.2 | 57.0 |
| Qwen3.5-35B-A3B / w/o CM | 36.0 | 42.2 | 34.0 | 65.6 | 44.5 |
| Qwen3.5-35B-A3B / summary | 39.5 | 43.0 | 35.2 | 66.8 | 46.1 |
| Qwen3.5-35B-A3B / SAM | 42.2 | 46.5 | 37.2 | 69.1 | 48.8 |

GLM-4.7에서는 SAM이 summary baseline보다 평균 2.4점, context management가 없는 설정보다 7.6점 높다. Qwen3.5-35B-A3B에서는 summary보다 2.7점, no-CM보다 4.3점 높다. 특히 BrowseComp와 BrowseComp-ZH처럼 긴 웹 탐색과 다중 단서 추적이 필요한 benchmark에서 차이가 더 잘 보인다.

![SAM ablation](/images/blog/sam-state-adaptive-memory-ablation.webp)

*공식 Figure 2의 ablation 시각화. SFT와 OAT-GRPO를 각각 제거하면 평균 점수가 내려가며, 27B memory backbone LoRA variant도 9B full-finetune SAM과 비슷한 범위에 놓인다. 오른쪽 recall ablation은 summary-only, recency, raw-content가 full SAM보다 낮다는 점을 보여 준다.*

흥미로운 점은 “raw page를 그대로 돌려주면 되지 않나?”라는 직관도 실험에서 약하다는 것이다. 논문은 write side는 유지하되 read side를 약화한 세 가지 변형을 비교한다. summary-only는 page recall 없이 global summary처럼 쓰고, recency는 intent와 무관하게 최근 page를 고르며, raw-content는 intent-conditioned snippet 대신 raw page 내용을 반환한다. 세 변형 모두 full SAM보다 낮다. 저자들은 이를 근거로, 손실 없는 원문 보존만으로는 부족하고 **현재 상태에 맞춘 recall formulation**이 중요하다고 해석한다.

## 장기 행동 분석: 메모리가 언제 켜지고, 긴 라운드에서 버티는가

논문의 Figure 3은 단순 평균 점수보다 더 실무적인 질문을 본다. context management가 trigger되는 순간 agent 상태가 어떤지, round 수가 길어질수록 성능 차이가 어떻게 벌어지는지, page size를 바꿔도 효과가 유지되는지를 나눠 본다.

![SAM trigger-time state](/images/blog/sam-state-adaptive-memory-trigger-state.webp)

*공식 Figure 3(a). Context management trigger 시점에서 SAM은 tool-call count, confidence, trigger-time accuracy에서 heuristic baseline보다 높은 상태를 보인다. 저자들은 intent-driven recall이 context를 더럽히는 것이 아니라, threshold에 닿은 시점의 결정을 더 생산적으로 만든다고 해석한다.*

![SAM accuracy by interaction rounds](/images/blog/sam-state-adaptive-memory-rounds.webp)

*공식 Figure 3(b). BrowseComp에서 interaction round bucket을 나누면, SAM은 21–40, 41–80, 80+ round 구간 모두에서 summary/recent-k/discard-tool보다 높다. 긴 trajectory일수록 단일 rolling summary보다 episodic recall의 이점이 남는다는 주장과 연결된다.*

![SAM page size sensitivity](/images/blog/sam-state-adaptive-memory-page-size.webp)

*공식 Figure 3(c). Page size를 32K–128K로 바꾼 ablation. 저자들은 32K–64K 근처가 의미 단위와 eager consolidation 사이의 균형이 좋고, 128K처럼 page가 너무 커지면 BrowseComp에서 intent signal이 희석된다고 해석한다.*

이 결과를 제품 관점으로 번역하면, SAM의 메시지는 “무조건 더 자주 요약하라”가 아니다. page가 너무 작으면 consolidation이 자주 일어나고, page가 너무 크면 cue가 너무 거칠어진다. 적당한 크기의 trajectory page를 만들고, 그 page를 현재 intent로 다시 읽는 인터페이스가 중요하다.

## 실패 사례가 더 중요한 이유

부록 E의 case study도 눈여겨볼 만하다. 성공 사례(id=567)에서는 agent가 65 rounds 동안 여러 후보를 검토하고 버린 뒤, SAM page가 “어떤 후보가 어떤 constraint를 위반했는가”와 “다음 blocker는 무엇인가”를 보존한다. 이후 새로운 lead가 나왔을 때 goal-conditioned recall이 과거 배제 기록을 다시 연결해 정답에 도달한다.

반대로 실패 사례(id=1058)는 SAM의 한계를 잘 보여 준다. agent가 초기에 잘못된 frame에 고정되면, SAM은 그 잘못된 frame도 충실하게 보존한다. 나중에 recall intent 자체가 “Home Game 가설을 완성하라”는 식으로 편향되면, memory module은 그 요청에 맞춰 증거를 재구성할 뿐, 자동으로 문제를 다시 넓히지 않는다.

이 실패는 agent memory 설계에서 매우 중요하다. 좋은 memory는 과거를 잘 보존하지만, 과거가 틀렸을 때는 틀린 가설도 잘 보존한다. 따라서 장기 에이전트에는 memory quality뿐 아니라 recall goal formulation, blocker tracking, confidence-gated final answer, frame reset 같은 상위 정책이 필요하다. SAM도 부록에서 이런 방향을 future work로 남긴다.

## 코드와 공개 artifact 상태

arXiv HTML은 “Our code is available at https://github.com/qhjqhj00/cabeza”라고 명시한다. 해당 저장소 `qhjqhj00/cabeza`는 MIT 라이선스의 Python package로, README는 Cabeza를 long-horizon agentic search용 configurable inference harness라고 소개한다. 확인 시점의 GitHub API 기준으로 stars 3, forks 0, default branch는 `main`, latest commit은 2026-05-26의 `update GISA & DeepSearchQA`다.

릴리스 표면은 아직 초기 단계로 보는 편이 안전하다. GitHub latest release는 없고 tag도 비어 있다. README에는 Qwen/GLM/Kimi/DeepSeek/GPT/GPT-OSS agent family, `summary`, `recent_k`, `discard_tool`, `discard_all`, `page_memory` 같은 context strategy, page memory, `naive`/`swarm`/`fugue` team mode, dataset/eval/scoring CLI가 정리되어 있다. 즉 placeholder는 아니고 실제 harness 형태의 코드가 있다.

다만 논문 부록이 언급하는 `scripts/run_task_with_mem_v2.sh`는 현재 저장소의 `scripts/` 목록에서는 확인되지 않았고, 공개된 script는 `example_bc.py`, `smoke_test.py` 중심이다. Hugging Face에서도 이 arXiv ID나 제목으로 명확한 공식 memory model weight/dataset release는 찾지 못했다. 따라서 현재 시점에서 이 글은 “논문 + 공식 Cabeza 코드 표면 + arXiv 공식 figure”에 근거한 분석이지, 완전히 패키징된 SAM 모델을 직접 재현한 리뷰는 아니다.

| 공개 표면 | 확인된 내용 | 실무 해석 |
|---|---|---|
| arXiv paper/html | 방법, benchmark table, official figures, limitations/case studies | 논문 주장과 실험 수치의 1차 근거 |
| GitHub `qhjqhj00/cabeza` | MIT, Python package, agentic search harness, page memory/context strategies, dataset/eval/scoring | 연구 코드 표면은 존재하지만 아직 작은 초기 저장소 |
| GitHub releases/tags | latest release 없음, tag 없음 | production dependency보다는 research artifact로 보는 편이 안전 |
| Hugging Face | 제목/ID 기준 명확한 공식 weight release 미확인 | SAM memory model을 바로 내려받아 붙이는 단계는 아직 아님 |

## 실무 관점에서의 해석

SAM이 던지는 가장 좋은 질문은 “agent memory를 retrieval problem으로만 볼 것인가”다. 일반적인 RAG는 query와 문서 chunk의 관련도를 계산한다. 하지만 장기 에이전트의 기억은 문서 검색보다 복잡하다. 과거 trajectory에는 시도, 실패, 가설, 반례, 출처, 도구 오류, 다음 blocker가 섞여 있다. 이 정보는 현재 agent state에 따라 의미가 바뀐다.

그래서 SAM의 page cue 방식은 제품 설계에도 꽤 유용한 비유를 준다. agent가 만든 모든 것을 active prompt에 계속 붙이지 말고, stable handle과 raw artifact를 분리하라. context에는 현재 판단에 필요한 index와 cue만 남기고, 원문은 다시 열 수 있게 저장하라. 그리고 recall은 단순 similarity가 아니라 “지금 어떤 결정을 위해 과거를 다시 보려는가”라는 intent에 묶어라.

이는 외부 파일 시스템을 쓰는 coding agent, trace ID를 보존하는 observability agent, 긴 research session을 관리하는 deep research agent에 모두 해당한다. 좋은 memory layer는 과거를 짧게 만드는 계층이 아니라, 과거를 **나중에 다시 조작 가능한 구조**로 바꾸는 계층이다.

동시에 SAM은 한계를 분명히 남긴다. 첫째, 공개 실험은 web/search/science QA 중심이고, software engineering agent나 embodied agent, long-form writing workflow까지 일반화된 것은 아니다. 둘째, memory model 학습은 frontier model committee와 상당한 compute에 기대고 있다. 셋째, memory는 잘못된 frame도 보존할 수 있으므로, agent의 recall intent가 편향되면 오히려 오류를 정교하게 강화할 수 있다.

그래도 이 논문은 long-horizon agent 설계에서 중요한 방향을 선명하게 보여 준다. 컨텍스트 관리의 목표는 토큰을 줄이는 것이 아니라, **에이전트가 자신의 과거 작업 상태를 다시 탐색할 수 있게 만드는 것**이다. SAM은 이 목표를 cue, page, intent-driven recall, memory-module training이라는 구체적인 형태로 묶어 제안한다. 장기 실행 에이전트를 만드는 팀이라면, 모델 점수보다도 이 구조적 메시지를 더 오래 기억할 만하다.

Sources: https://arxiv.org/abs/2605.24468, https://arxiv.org/html/2605.24468v1, https://github.com/qhjqhj00/cabeza
