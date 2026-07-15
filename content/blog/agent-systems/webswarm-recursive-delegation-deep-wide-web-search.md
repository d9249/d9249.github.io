---
title: "WebSwarm은 웹 검색을 고정 분업이 아니라 재귀적 위임 트리로 푼다"
date: "2026-07-15T22:56:25+09:00"
description: "WebSwarm은 검색 중 발견한 증거에 따라 agent node와 search mode를 계속 생성·수정하는 재귀적 orchestration으로, 깊은 추론과 넓은 정보 수집을 같은 실행 흐름에서 결합하려는 웹 검색 framework다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - WebSwarm
  - Multi-Agent
  - Web Search
  - Agent Orchestration
  - Information Seeking
image: "/images/blog/webswarm-repo-overview.webp"
draft: false
---

복잡한 웹 검색은 두 가지를 동시에 요구한다. 하나는 여러 단서를 순서대로 풀어야 하는 **깊이**이고, 다른 하나는 많은 후보·속성·출처를 빠짐없이 모아야 하는 **너비**다. ReAct처럼 한 agent가 긴 trajectory 하나를 이어 가는 방식은 깊이를 만들 수 있지만 context와 탐색 방향이 쉽게 포화된다. 반대로 여러 subagent를 병렬로 투입하면 coverage는 넓어지지만, 새 증거가 나타났을 때 분업 구조를 다시 설계하기 어렵다.

2026년 7월 공개된 *WebSwarm: Recursive Multi-Agent Orchestration for Deep-and-Wide Web Search*는 이 문제를 “처음에 완성된 task graph를 만들지 말자”로 푼다. root agent가 고정된 subtask 목록을 나누는 대신, 각 search node가 현재의 local objective와 search mode를 받고, 충분한 근거가 없으면 자식을 다시 만들며, 해결한 결과와 evidence를 부모에게 돌려준다. 결과는 top-down delegation과 bottom-up feedback이 번갈아 자라는 **재귀적 검색 트리**다.

이 논문에서 중요한 것은 agent 수를 늘리는 일이 아니다. 검색 결과가 다음 분기를 결정하도록 만들어, 같은 task 안에서 deep reasoning·parallel collection·entity gathering·verification을 섞는 orchestration 규칙을 제안한다는 점이다. 다만 현 시점의 공개 GitHub 저장소는 runnable code가 아니라 method overview·MIT LICENSE·짧은 README만 둔 상태다. 저자들은 code가 internal review 중이며 source·setup·benchmark configuration·reproduction script를 곧 추가하겠다고 안내한다.

## 무엇을 해결하려는가

복잡한 information-seeking task는 시작 문장만 읽고 decomposition을 확정하기 어렵다. 예를 들어 특정 인물의 조건을 여러 간접 단서로 찾아야 한다면 먼저 후보를 식별하는 deep search가 필요하다. 이후 그 사람과 관련된 여러 시점·속성·출처를 표로 수집하려면 wide search가 필요하다. 중간에 발견한 정보가 “어느 entity를 더 찾을지”, “어느 page가 hub인지”, “어떤 attribute가 빠졌는지”를 바꾼다.

논문은 기존 multi-agent orchestration을 세 가지 한계로 본다.

| 방식 | 장점 | 복잡한 deep-and-wide search에서의 제약 |
|---|---|---|
| 단일 ReAct trajectory | 단순하고 일관된 tool-use loop | 한 context 안에서 깊이와 coverage를 함께 키우기 어려움 |
| root-level 병렬 multi-agent | 여러 source·candidate를 동시에 탐색 | root에서만 분기해 재귀 깊이가 얕고, 새 증거에 맞춘 재구성이 약함 |
| plan-then-orchestrate | dependency를 먼저 명시하고 병렬 실행 가능 | 초기 plan이 web evidence보다 앞서 결정되어, 잘못된 분해를 뒤집기 어려움 |
| WebSwarm | 증거에 따라 node·mode·위임 구조를 계속 갱신 | 실행 비용과 복잡도가 커지며, code release 전에는 재현 가능성을 별도로 판단해야 함 |

WebSwarm의 출발점은 고정 plan의 반대다. 검색이 진행되며 evidence가 쌓일수록 task decomposition도 늦게 확정한다. parent node는 child의 답을 단순한 answer fragment가 아니라 다음 expansion·revision·aggregation을 결정하는 control signal로 쓴다.

## 핵심 아이디어 / 구조 / 동작 방식

논문은 실행 중 만들어지는 트리를 \(\mathcal{T}=(\mathcal{V},\mathcal{E})\)로 둔다. root node는 원래 질문을 받고, 각 non-root node는 local objective \(q_v\)와 mode \(m_v\)를 받는다. edge는 하나의 delegation이며, node는 local task를 직접 해결하거나 child node를 만들어 더 세분화할 수 있다. child 결과 집합 \(R_v\)가 돌아오면 parent는 근거가 충분한지 판단해 answer를 올리거나, 방향을 고치거나, 추가 delegation을 만든다.

공식 repository가 제공하는 method overview는 이 흐름을 한 사례로 보여준다. 먼저 deep node가 인물의 간접 단서를 푼다. 그 답을 받은 뒤 wide node가 transfer-history table을 만들고, entity collection과 parallel atom node가 brand·object·attribute별 정보를 채운다. 오른쪽의 mode palette와 아래쪽의 guidance blocks는, 같은 트리 안에서 “무엇을 찾을지”와 “어떻게 협업할지”를 분리하려는 의도를 보여 준다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/webswarm-repo-overview.webp"
    alt="WebSwarm의 재귀적 위임 구조: root node가 deep와 wide node를 만들고, entity collect와 atom node가 병렬 정보를 수집하며, Web-Probing과 sibling-node experience가 위임을 안내하는 공식 구조도"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    WebSwarm 공식 GitHub 저장소의 method overview. deep·wide·atom·entity_collect mode, evidence feedback, Web-Probing, sibling-node experience가 한 실행 트리에서 연결되는 방식을 보여 준다.
  </figcaption>
</figure>

### 네 가지 search mode

| Mode | 맡는 일 | 협업 형태 |
|---|---|---|
| `atom` | 좁고 명확한 사실 하나를 source evidence로 확인 | node가 직접 iterative search 수행 |
| `wide` | 여러 entity·dimension에 같은 유형의 정보를 모음 | 독립 child를 병렬로 보내고 structured result를 merge |
| `deep` | multi-hop dependency와 제약을 순차적으로 풂 | searcher·verifier를 포함한 sequential search-and-verification |
| `entity_collect` | 이후 wide expansion에 필요한 entity set을 먼저 수집 | 여러 node 결과를 모아 candidate list를 정리 |

중요한 것은 이 mode가 전역 system profile이 아니라 node의 local property라는 점이다. `wide` node의 child가 다시 `deep` 또는 `entity_collect`가 될 수 있고, `deep` node도 검증을 위해 여러 sibling path를 만들 수 있다. 따라서 “깊은 검색용 agent”와 “넓은 검색용 agent”를 고정 역할로 나누는 대신, evidence state에 따라 협업 문법을 선택한다.

### Web-Probing과 sibling-node experience

논문은 재귀 확장을 무작정 fan-out하지 않도록 두 가지 guidance를 추가한다.

- **Web-Probing:** 가벼운 probe로 task 관련 evidence가 web에서 hub page 중심인지, entity별로 흩어졌는지, dimension별로 정리됐는지를 먼저 파악한다. 이를 바탕으로 expansion axis를 정한다. 예를 들어 연도보다 tour가 공식 record의 organizing unit이면, concert를 연도별로 훑는 대신 tour → show로 분기한다.
- **Sibling-node experience reuse:** homogeneous child가 같은 query pattern, reliable source, page structure, failure path를 공유할 수 있다는 점을 이용한다. scout node가 full trace를 탐색해 “무엇을 하고 피할지”를 요약하면, 형제 node가 반복 실패를 줄일 수 있다.

이 둘은 성능에 다르게 작용한다. Table 3에서 Web-Probing을 빼면 WideSearch Item-F1은 74.37에서 74.90으로 큰 변화가 없지만 평균 web-tool call은 **137.03에서 239.90**으로 증가한다. DeepWideSearch도 203.73에서 331.39 calls로 늘어난다. 반면 experience reuse를 제거하면 WideSearch Item-F1은 71.20, DeepWideSearch Item-F1은 55.48로 내려간다. 저자들의 해석대로 probing은 redundant expansion을 줄이는 efficiency signal에, experience reuse는 sibling node의 solving quality에 더 가깝다.

## 공개된 근거에서 확인되는 점

평가는 BrowseComp-Plus, WideSearch, DeepWideSearch, GISA 네 benchmark에서 이뤄졌다. BrowseComp-Plus는 deep factual search, WideSearch는 wide structured collection, DeepWideSearch는 둘의 결합, GISA는 item·set·list·table 형식을 포괄하는 general information seeking으로 역할을 나눈다. 비용을 줄이기 위해 BrowseComp-Plus 200개 random sample, WideSearch 영어 100개, DeepWideSearch 영어 76개, GISA 전체 373개를 사용했다고 밝힌다.

아래 표는 같은 `GLM-4.5` backbone에서 논문 Table 1의 ReAct와 WebSwarm을 직접 비교한 것이다. WideSearch·DeepWideSearch의 full-table Success Rate는 매우 낮은 난도 높은 metric이라, Row/Item F1과 함께 봐야 한다.

| Benchmark | Metric | ReAct (GLM-4.5) | WebSwarm (GLM-4.5) | WebSwarm의 변화 |
|---|---|---:|---:|---:|
| BrowseComp-Plus | ACC | 50.50 | **68.00** | +17.50 |
| WideSearch-EN | Row F1 / Item F1 | 33.23 / 64.61 | **44.14 / 74.37** | +10.91 / +9.76 |
| WideSearch-EN | Success Rate | 4.00 | **7.00** | +3.00 |
| DeepWideSearch-EN | Row F1 / Item F1 | 20.08 / 46.63 | **29.64 / 58.40** | +9.56 / +11.77 |
| DeepWideSearch-EN | Success Rate | 3.95 | **6.58** | +2.63 |
| GISA | Overall | 55.54 | **62.30** | +6.76 |

비교 대상은 ReAct뿐이 아니다. 논문은 GLM-4.5 환경에서 Swarm-Agent, Flash-Searcher, Table-as-Search, ROMA, InfoSeeker도 넣는다. WebSwarm은 네 benchmark 전체에서 best 또는 competitive result를 보고한다. 특히 논문 Figure 3 설명에 따르면 hard sample에서 BrowseComp-Plus accuracy는 ReAct의 0.0에서 35.7로, WideSearch-EN Item F1은 24.5에서 55.8로 벌어진다. 반면 easy sample에서는 다른 multi-agent baseline과 격차가 작다. 이는 recursive orchestration의 이득이 모든 질문에 균일하게 나타난다기보다, **고정 decomposition이 부서지는 long-tail task에서 더 커진다**는 주장이다.

### Ablation이 말하는 범위

| Variant | BrowseComp-Plus ACC | WideSearch Item F1 | DeepWideSearch Item F1 | 해석 |
|---|---:|---:|---:|---|
| WebSwarm | **68.00** | **74.37** | **58.40** | recursive delegation과 mode selection을 모두 사용 |
| w/o recursive | 63.50 | 68.38 | 55.79 | 진행 중인 evidence로 tree를 재정교화하는 효과가 사라짐 |
| all-to-`wide` | 63.00 | 72.01 | 55.87 | coverage에는 덜 해롭지만 deep factual search가 약해짐 |
| all-to-`deep` | 67.50 | 69.94 | 54.51 | deep query에는 가깝지만 wide/hybrid structured collection이 약해짐 |

이 결과는 mode가 장식적인 routing label이 아니라는 근거다. 모든 node를 deep로 몰면 BrowseComp-Plus에는 가깝게 남지만 table collection 계열이 떨어지고, 모두 wide로 몰면 반대 현상이 나타난다. 다만 이 결과는 논문이 정한 task·tool·model configuration 아래의 ablation이다. 다른 search API, 다른 context limit, 다른 verifier quality에서 같은 크기의 효과가 난다는 뜻은 아니다.

논문은 backbone generalization도 별도로 보고한다. Qwen3-32B에서 BrowseComp-Plus ACC는 12.00 → 19.50, WideSearch Item F1은 29.11 → 34.47, DeepWideSearch Item F1은 20.53 → 25.54로 증가한다. Qwen3.5-35B에서도 각각 56.50 → 61.00, 64.82 → 75.91, 52.46 → 58.34로 제시된다. orchestration gain이 GLM-4.5 하나에만 묶이지 않을 가능성을 보이지만, 논문은 live web 대신 일부 benchmark에서 fixed local corpus를 쓰고, web search에는 Serper top-5와 Jina Reader를 사용한다. 즉 model 자체의 reasoning score와 framework score를 혼동하지 않는 것이 좋다.

## 실무 관점에서의 해석

WebSwarm이 제시하는 유용한 설계 원칙은 “더 많은 subagent”가 아니라 **delegation을 evidence-driven state transition으로 다루라**는 것이다. 실제 deep-research product에서 잘못된 일괄 분해는 흔하다. 처음에는 열 개의 parallel task가 그럴듯해도, 다섯 번째 source에서 핵심 entity나 organizing axis가 뒤집히면 나머지 작업이 모두 redundant해진다. Web-Probing으로 page organization을 먼저 보고, child result를 parent의 다음 control input으로 쓰는 구조는 이 낭비를 줄이려는 장치다.

실무에 바로 가져갈 수 있는 것은 mode 이름보다 운영 조건이다.

| 도입 질문 | WebSwarm식 체크 |
|---|---|
| 언제 분기할 것인가? | 현재 answer가 아니라, 아직 해소되지 않은 evidence gap가 있는가 |
| 무엇을 병렬화할 것인가? | 같은 schema로 채울 수 있는 independent entity·attribute인가 |
| 언제 순차 탐색할 것인가? | 다음 query가 이전 검증 결과에 의존하는 multi-hop constraint인가 |
| 형제 agent가 무엇을 공유할 것인가? | 성공 source·page pattern·실패 path를 압축한 process-level experience인가 |
| 비용을 어떻게 제어할 것인가? | easy task에서는 tool budget을 억제하고 hard task에서만 tree를 넓히는가 |
| 최종 답을 어떻게 신뢰할 것인가? | leaf observation을 그대로 합치지 말고 parent-level evidence aggregation·verification을 두는가 |

가장 큰 제한은 release maturity다. 확인 시점의 `songxiaoshuai/WebSwarm` repo는 2026년 7월 9일 생성됐고, 7 stars·0 forks·MIT license·empty tags·latest release 없음이라는 초기 상태다. root에는 `README.md`, `LICENSE`, `method_overall.png`만 있으며, README는 runnable implementation이 internal review and approval 중이라고 말한다. 따라서 지금은 paper의 architecture와 reported results를 읽을 수 있는 단계이지, benchmark configuration을 내려받아 같은 run을 검증하거나 production search stack에 바로 붙일 수 있는 단계는 아니다.

그럼에도 연구적으로는 좋은 분리다. deep search와 wide search를 서로 다른 product feature로 포장하지 않고, **동적으로 구성되는 node의 local objective + collaboration mode**로 통일했다. 향후 code가 공개되면 확인할 우선순위는 세 가지다. 첫째, node expansion과 stop policy가 어떤 prompt·heuristic·budget rule로 구현됐는가. 둘째, sibling experience가 raw trace·summary·retrieval store 중 무엇으로 표현되며 leakage를 어떻게 피하는가. 셋째, live web의 time variance와 Serper/Jina 의존성을 제거하거나 통제한 재현 script가 실제로 제공되는가. 그 답이 공개되어야 WebSwarm은 설득력 있는 orchestration paper에서 재사용 가능한 search-agent framework로 넘어갈 수 있다.

Sources: https://arxiv.org/abs/2607.08662, https://arxiv.org/html/2607.08662v1, https://arxiv.org/pdf/2607.08662, https://github.com/songxiaoshuai/WebSwarm, https://api.github.com/repos/songxiaoshuai/WebSwarm, https://api.github.com/repos/songxiaoshuai/WebSwarm/readme, https://api.github.com/repos/songxiaoshuai/WebSwarm/tags
