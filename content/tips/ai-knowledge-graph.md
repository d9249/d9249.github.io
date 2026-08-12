---
title: "ai-knowledge-graph는 문서 더미를 탐색 가능한 관계도로 바꾼다"
date: "2026-08-13T02:31:43"
description: "ai-knowledge-graph는 OpenAI 호환 LLM으로 비정형 텍스트에서 SPO 트리플을 추출하고, 엔티티 표준화·관계 추론·PyVis 시각화를 거쳐 대화형 HTML 지식 그래프와 JSON을 만드는 Python 도구입니다."
author: "Sangmin Lee"
repository: "robert-mcdermott/ai-knowledge-graph"
sourceUrl: "https://github.com/robert-mcdermott/ai-knowledge-graph"
status: "Open source"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Python"
  - "Knowledge Graph"
  - "LLM"
  - "Visualization"
  - "Local AI"
highlights:
  - "텍스트를 청크로 나눈 뒤 LLM이 Subject-Predicate-Object 트리플을 추출해 대화형 HTML 그래프와 JSON으로 저장합니다."
  - "엔티티 표준화와 관계 추론은 각각 끌 수 있어, 원문 근거만 보려는 작업과 탐색용 관계 확장을 분리할 수 있습니다."
  - "Ollama·LM Studio·vLLM·LiteLLM 등 OpenAI 호환 endpoint를 지원하므로 로컬 LLM이나 사내 gateway에 붙일 수 있습니다."
  - "공식 `--test` 모드를 실행해 19개 노드·21개 edge·3개 community를 가진 HTML 예제가 실제로 생성됨을 확인했습니다."
  - "현재 package metadata는 Python 3.12+를 요구하므로 README의 3.11+ 표기보다 3.12 이상 환경을 준비하는 편이 안전합니다."
draft: false
---

회의록, 조사 보고서, 내부 위키처럼 문서는 쌓이는데 “누가 무엇과 어떤 관계인가”를 훑기는 점점 어려워진다. LLM 요약은 읽기 좋지만, 주체·관계·대상을 계속 넘겨가며 따라가기는 어렵다. **ai-knowledge-graph**는 이 사이에 놓이는 Python 도구다. 텍스트를 Subject-Predicate-Object(SPO) 트리플로 뽑고, 그 결과를 브라우저에서 움직여 볼 수 있는 네트워크 그래프와 JSON으로 만든다.

핵심은 단순한 1회 추출이 아니라, 청크 경계에서 생기는 중복 이름과 끊어진 관계를 후처리로 다룬다는 점이다. 다만 관계 추론을 켠 결과에는 원문에 없던 추정 edge도 섞일 수 있다. 이 도구는 사실을 자동 확정하는 지식 베이스라기보다, **문서 속 관계를 탐색하고 사람이 검토할 후보를 만드는 지도**에 더 가깝다.

![ai-knowledge-graph 공식 예시 화면](/images/tips/ai-knowledge-graph-example.png)

## ai-knowledge-graph 개요

처리는 네 단계다. 먼저 긴 문서를 overlap이 있는 word chunk로 나눈다. 다음으로 LLM이 chunk마다 SPO 트리플을 JSON 형태로 추출한다. 이후 같은 대상을 가리키는 표기를 정리하고, 마지막으로 NetworkX와 PyVis 기반 HTML 그래프를 만든다. 노드 색은 Louvain community, 노드 크기는 degree·betweenness·eigenvector centrality를 반영하며, 원문에서 나온 관계는 실선, 추론된 관계는 점선으로 표현한다.

| 단계 | 하는 일 | 결과를 읽는 방법 |
|---|---|---|
| 1. 트리플 추출 | 문서 chunk마다 SPO 관계 추출 | 원문 근거에 가장 가까운 초안 그래프 |
| 2. 엔티티 표준화 | `AI`, `artificial intelligence` 같은 표기를 정렬 | 동일 대상을 여러 노드로 세는 문제 완화 |
| 3. 관계 추론 | 분리된 community·전이 규칙·어휘 유사도로 edge 추가 | 탐색성은 좋아지지만 사실 검증은 별도로 필요 |
| 4. 시각화·저장 | interactive HTML과 raw JSON 출력 | 브라우저 탐색과 후속 파이프라인 분리 가능 |

공식 README의 산업혁명 예시는 이 구분을 잘 보여 준다. 13개 chunk에서 216개 트리플을 추출한 뒤, 표준화는 관계 수를 유지한 채 unique entity를 201개에서 160개로 줄였다. 반면 추론 단계는 최종 그래프를 564개 트리플로 확장했고 그중 355개가 inferred relationship으로 기록됐다. 따라서 “그래프가 더 촘촘해졌다”는 사실과 “원문에서 확인된 사실이 늘었다”는 말은 다르다.

## 설치와 첫 실행

공식 README에는 Python 3.11+라고 적혀 있지만, 현재 `pyproject.toml`의 `requires-python`은 `>=3.12`다. 새 환경에서는 Python 3.12 이상을 준비하는 편이 안전하다. `uv`를 쓴다면 격리 환경 구성과 실행을 한 번에 처리할 수 있다.

```bash
git clone https://github.com/robert-mcdermott/ai-knowledge-graph.git
cd ai-knowledge-graph
uv sync
uv run generate-graph --input your_text_file.txt --output knowledge_graph.html
```

`pip` 경로도 공식적으로 제공된다.

```bash
pip install -r requirements.txt
python generate-graph.py --input your_text_file.txt --output knowledge_graph.html
```

처음에는 LLM 연결 없이 sample graph를 만드는 `--test`가 좋다.

```bash
uv run generate-graph --test --output sample-graph.html
```

직접 실행한 이 모드는 19개 node, 21개 edge, 3개 community를 가진 HTML 파일을 생성했다. 생성 결과를 먼저 브라우저에서 열어 node hover, zoom, physics control, label/filter control이 필요한 흐름인지 확인한 뒤 실제 문서를 넣는 편이 좋다.

## LLM endpoint를 바꾸는 법

모델 연결은 `config.toml` 한 파일에서 한다. OpenAI-compatible chat completion endpoint라면 Ollama, LM Studio, OpenAI, vLLM, LiteLLM 등을 연결할 수 있다. 민감한 사내 문서라면 외부 API 키를 넣기 전에 endpoint와 데이터 경로를 먼저 확인하고, 가능하면 로컬 Ollama나 조직 내 gateway를 쓰는 편이 낫다.

```toml
[llm]
model = "gemma3"
api_key = "<your-key>"
base_url = "http://localhost:11434/v1/chat/completions"
max_tokens = 8192
temperature = 0.8

[chunking]
chunk_size = 100
overlap = 20

[standardization]
enabled = true
use_llm_for_entities = true

[inference]
enabled = true
use_llm_for_inference = true
apply_transitive = true
```

비용·지연·환각 위험을 통제하려면 처음에는 추론을 끄는 편이 합리적이다. `--no-standardize`와 `--no-inference`는 각각 두 번째·세 번째 pass를 막는다. 특히 법무, 정책, 계약, 의사결정 기록처럼 “원문에 명시됐는가”가 중요한 문서라면 `--no-inference`를 기본값으로 두고, 그래프의 빈 공간을 사람이 추가 검토할 후보로 쓰는 접근이 안전하다.

```bash
uv run generate-graph \
  --input meeting-notes.txt \
  --output meeting-graph.html \
  --no-inference
```

## 어떤 상황에서 유용한가

이 도구는 아래처럼 먼저 관계의 지형을 보는 일이 필요할 때 잘 맞는다.

- 길고 서로 중복되는 회의록에서 프로젝트·담당자·결정·의존성을 빠르게 훑을 때
- 조사 문서에서 조직·제품·기술·사건의 연결 후보를 탐색할 때
- RAG 전처리 전에 entity naming이 얼마나 흔들리는지 진단할 때
- 로컬 LLM으로 장비 밖으로 내보내기 어려운 문서의 관계도를 시험할 때
- JSON을 별도 graph database·검색·human-review pipeline으로 넘기기 전 시각 검토할 때

반대로 증분 update, provenance가 완전한 graph store, 권한 모델, graph query API까지 갖춘 운영형 knowledge platform을 찾는다면 범위가 다르다. 이 저장소의 직접 산출물은 HTML과 JSON이며, Neo4j 같은 graph database 연동이나 지속 동기화는 제공하지 않는다.

## 주의할 점

가장 중요한 주의점은 **inferred edge를 원문 사실과 혼동하지 않는 것**이다. 이 프로젝트는 시각화에서 inferred relationship을 점선으로 구분하지만, 그래프가 촘촘해질수록 독자가 점선을 사실처럼 받아들이기 쉬워진다. 최종 보고서나 의사결정 근거에는 추론 edge의 출처·검토자·승인 상태를 별도로 남기는 편이 좋다.

또한 LLM endpoint가 외부 서비스라면 문서 내용과 prompt가 그 endpoint로 전달된다. API 키를 `config.toml`에 평문으로 둘지, 환경변수·secret manager·로컬 gateway를 쓸지도 팀 정책에 맞춰 결정해야 한다. `--debug`는 raw LLM response와 추출 JSON을 출력하므로 민감 문서에서는 로그 보관 위치도 확인해야 한다.

프로젝트는 Apache-2.0 라이선스의 public Python repository이며, GitHub API 기준 최신 release/tag는 `v0.6.3`(2025-12-28)이다. 가중치나 hosted service가 아니라 LLM endpoint를 사용자가 연결하는 source-first 도구이므로, 실제 결과 품질은 문서 형식·prompt·선택한 모델·추론 pass 설정에 크게 달려 있다.

## 내 판단

ai-knowledge-graph는 “문서를 graph RAG로 완성해 주는 플랫폼”으로 기대하면 부족할 수 있지만, **문서 더미의 관계를 빠르게 가시화하는 가벼운 실험 도구**로는 구조가 명확하다. extraction, standardization, inference, visualization이 나뉘어 있고 각 후처리 pass를 끌 수 있어, 결과가 왜 달라졌는지 추적하기도 쉽다.

추천 대상은 사내 문서나 조사 자료를 먼저 시각적으로 탐색하고 싶은 개발자·리서처, 로컬 LLM 기반 knowledge extraction을 시험하려는 팀이다. 반대로 정밀한 사실 추출이 핵심이라면 inference를 끄고, entity/relation precision·recall·근거 span을 별도 gold set으로 측정하는 검증 단계를 반드시 붙이는 편을 권한다.

## 참고한 공개 자료

- [PyTorch Korea 소개 글](https://discuss.pytorch.kr/t/ai-knowledge-graph/11583)
- [robert-mcdermott/ai-knowledge-graph GitHub repository](https://github.com/robert-mcdermott/ai-knowledge-graph)
- [공식 README](https://github.com/robert-mcdermott/ai-knowledge-graph/blob/main/README.md)
- [v0.6.3 release](https://github.com/robert-mcdermott/ai-knowledge-graph/releases/tag/0.6.3)
- [Industrial Revolution interactive demo](https://robert-mcdermott.github.io/ai-knowledge-graph/)
