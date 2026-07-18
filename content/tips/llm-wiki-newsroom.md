---
title: "LLM Wiki Newsroom은 문서를 검토 가능한 로컬 지식 위키로 바꾼다"
date: "2026-07-18T20:42:40"
description: "LLM Wiki Newsroom은 문서·PDF를 plain Markdown 지식 위키로 흡수하고, 작성자와 검토자를 분리한 5역할 newsroom, contradiction tracking, 지식 그래프, Memex식 발견 흐름을 제공하는 로컬 우선 오픈소스 템플릿입니다."
author: "Sangmin Lee"
repository: "alfadur7/llm-wiki-newsroom"
sourceUrl: "https://github.com/alfadur7/llm-wiki-newsroom"
status: "Open source beta"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Knowledge Base"
  - "Obsidian"
  - "AI Agents"
  - "Multi-Agent"
  - "RAG Alternative"
  - "Python"
  - "Local-first"
highlights:
  - "문서·PDF를 raw/에 넣으면 source, entity, concept, overview, contradiction 분석으로 연결된 Markdown 위키를 만듭니다."
  - "reporter·columnist·desk·copy editor·editor-in-chief를 분리해 작성자가 자신의 글을 검토하지 않도록 설계했습니다."
  - "새 자료가 들어올 때 연관 페이지를 갱신하고, 상충 주장·backlink·broken link를 별도 관리합니다."
  - "Leiden cluster 기반 그래프와 query·discover·trail·timeline 흐름으로 검색어 밖의 연결도 탐색합니다."
  - "v0.2.0의 초기 단계 템플릿이며, 전체 기능은 Claude Code 중심이고 Codex/Gemini는 기본 workflow만 지원합니다."
draft: false
---

문서를 모으는 일과 그 문서를 나중에 다시 찾아 연결하는 일은 다르다. 폴더에 PDF와 웹 클리핑을 쌓고 RAG 검색을 붙이면 질문에는 답할 수 있다. 하지만 어떤 출처가 어떤 개념을 뒷받침하는지, 새 문서가 기존 판단을 바꾸는지, 상충되는 주장이 무엇인지까지 지속적으로 관리하려면 단순 retrieval보다 **지식 편집 workflow**가 필요하다.

LLM Wiki Newsroom은 그 workflow를 Git repository와 plain Markdown으로 구현하려는 템플릿이다. `raw/`에 기사·문서·PDF를 넣고 agent에게 ingest를 시키면, source page·entity·concept·timeline·cluster overview·contradiction analysis가 연결된 wiki를 만든다. Obsidian vault로 열 수 있고 Git으로 버전 관리할 수 있으며, graph·lint·search용 Python 도구는 로컬에서 실행한다.

이 프로젝트를 단순 “LLM이 노트를 정리하는 도구”와 구분하는 핵심은 **작성과 검토를 같은 agent에게 맡기지 않는 newsroom 구조**다. 잘 쓰는 것만큼, 누가 어떤 기준으로 수정안을 승인하는지가 지식 베이스의 장기 품질을 결정한다는 관점이다.

![LLM Wiki Newsroom knowledge graph](/images/tips/llm-wiki-newsroom-knowledge-graph.webp)

*공식 README의 interactive graph 예시. 노드·관계·클러스터·검색 패널을 한 화면에서 보여 준다. 이미지는 약 2,300개 노드 규모의 private deployment 예시이며, 저장소가 제공하는 sample corpus 자체는 15개 노드다.*

## 어떤 도구인가

LLM Wiki Newsroom은 Karpathy의 LLM Wiki 아이디어와 `SamurAIGPT/llm-wiki-agent`를 출발점으로 한다. 구조는 세 층이다.

| 층 | 저장 위치 | 역할 |
|---|---|---|
| Layer 1: 원문 | `raw/` | 기사, 클리핑, PDF, 대화 노트처럼 사람이 모은 원본. 원칙적으로 변경하지 않는다. |
| Layer 2: 지식 위키 | `wiki/` | source reflection, entity, concept, timeline, overview, contradiction, synthesis, trail을 agent가 관리한다. |
| Layer 3: 운영 규칙 | `CLAUDE.md`, `.claude/` | page schema, 역할별 editorial rule, lint와 publish gate를 둔다. |

한 문서를 ingest하면 단순 요약 파일 하나를 만드는 데서 끝나지 않는다. 저자가 설명하는 흐름은 원문을 source page로 바꾸고, 등장한 entity·concept을 갱신하고, wikilink 후보를 풍부하게 만든 뒤, graph·cluster·catalog·overview·contradiction DB를 다시 계산하는 방식이다. README는 새 문서 하나가 관련 기존 페이지 약 10~15개를 갱신할 수 있다고 설명한다.

## 왜 newsroom인가

이 프로젝트는 역할을 다섯 개로 분리한다.

- **Reporter**: source page와 entity/concept stub을 초안으로 만든다.
- **Columnist**: 여러 source를 엮은 심층 분석을 쓴다.
- **Desk editor**: 새로운 관점에서 prose와 attribution을 검토한다.
- **Copy editor**: broken link, citation, schema 같은 결정적 검사를 실행한다.
- **Editor-in-chief**: 결과를 모아 publication을 통과시키거나 되돌린다.

핵심 규칙은 writer와 reviewer가 같지 않아야 한다는 것이다. 특히 publish는 qualitative review와 deterministic lint가 모두 통과해야 한다. 단일 agent가 답변을 쓰고 스스로 “좋다”고 평가하는 구조보다, 역할을 분리해 자기선호 편향을 줄이려는 설계다.

또한 반복되는 review failure가 발견되면, authoring guideline 자체의 수정안을 만들고 blind A/B 및 regression check가 실제 개선을 보일 때만 채택하는 self-evolving guideline loop도 둔다. README와 v0.2.0 release note 모두 이 경로를 **experimental**로 명시한다. 흥미로운 구조이지만 자동 개선을 이미 해결된 문제처럼 받아들이면 안 되는 이유다.

## 설치와 첫 시작

공식 시작점은 repository를 clone하거나 GitHub의 template 기능으로 자기 wiki repository를 만드는 것이다.

```bash
git clone https://github.com/alfadur7/llm-wiki-newsroom.git
cd llm-wiki-newsroom
```

clean slate로 시작하려면 `wiki/`의 example page를 비우되 디렉터리와 `graph/cluster_labels.json`은 유지하라고 안내한다. 이후 source file을 `raw/`에 넣어 Claude Code에서 다음과 같이 실행한다.

```text
/wiki-ingest raw/NewsScrap/article.md
/wiki-query open source AI definition
/wiki-lint --fix
/wiki-graph
```

Python 도구 의존성에는 `networkx`, `requests`, `beautifulsoup4`, Leiden cluster 계산을 위한 `igraph`·`leidenalg`, 그리고 test용 `pytest`가 포함된다. local semantic search까지 쓰려면 별도로 QMD를 설치하고 `wiki/` collection을 index해야 한다.

```bash
npm install -g @tobilu/qmd
qmd collection add "$(pwd)/wiki" --name wiki
qmd embed
```

QMD의 embedding과 reranking model은 온디바이스에서 실행된다고 설명되어 있지만, 첫 `qmd embed`는 모델을 내려받는다. 오프라인·저장공간·초기 indexing 시간을 별도로 고려해야 한다.

## 실제로 유용한 흐름

### 1. 문서 보관함이 아니라 evidence graph로 쓰기

`/wiki-ingest`는 원문을 source reflection으로 만들고 entity·concept pages와 연결한다. 새 source를 추가할 때 “이전 문서와 무엇이 연결되는가”를 계속 갱신해야 하는 시장 조사, 기술 동향, 정책 자료, 경쟁사 리서치에 맞는다.

### 2. 상충 주장과 출처를 나중이 아니라 ingest 시점에 다루기

프로젝트는 contradiction tracking을 query 단계가 아니라 ingest 단계에서 flag한다고 설명한다. 무조건 하나의 결론을 생성하기보다, 서로 다른 claim을 conflict axis로 남겨 두는 방식이다. 여러 이해관계자의 문서가 쌓이는 주제라면 이 특성이 특히 유용하다.

### 3. 검색어 밖의 연결을 탐색하기

`/wiki-discover`, `/wiki-trail`, `/wiki-timeline`은 단순 keyword search를 보완한다. seed에서 두 hop 이내의 예상 밖 관계를 찾거나, 하나의 topic을 따라 5~10단계 reading trail을 남기거나, entity별 연대표를 만들 수 있다. 저장된 query answer는 `wiki/syntheses/`에 재사용 가능한 지식으로 남는다.

### 4. Obsidian과 Git을 사람이 보는 표면으로 유지하기

출력은 vendor database가 아니라 Markdown이다. Obsidian에서 wikilink와 graph view를 탐색하고, Git에서 source-to-page 변경을 diff로 검토할 수 있다. 이 선택은 “AI가 만든 지식”을 사람이 검토·수정할 경로를 남긴다는 점에서 중요하다.

## 지원 범위와 주의할 점

저장소의 “no API keys”는 **graph, lint, search 같은 Python tooling**이 로컬에서 돌아간다는 뜻이다. 문서를 읽고 작성·검토 workflow를 수행할 agent runtime까지 무료·무계정이라는 뜻은 아니다. README는 Claude Code를 primary/full support로 두고, Codex와 Gemini CLI에는 natural-language 기반 **basic workflow only**를 표시한다. cascading update, backlink index, contradiction tracking, associative discovery 등 advanced feature는 Claude Code 중심으로 설명된다.

또한 이것은 이제 막 공개된 작은 규모의 템플릿이다. repository는 2026년 6월에 만들어졌고, 현재 release는 **v0.2.0**이다. v0.2.0 release note는 151개 pytest와 전체 lint 통과를 보고하지만, 이는 저자가 공개한 해당 release의 결과이지 독립적으로 재실행한 결과는 아니다. 실제 corpus에 적용할 때는 작은 folder로 먼저 시험하고, raw source와 생성된 wiki를 둘 다 version control·backup하는 편이 안전하다.

개인·업무 문서를 넣을 때의 데이터 경계도 확인해야 한다.

- Python 도구와 QMD는 local-first를 목표로 하지만, agent runtime이 파일을 읽고 편집하는 권한은 별도 문제다.
- `raw/`에는 개인 정보, 고객 문서, 계약 자료, 접근 토큰이 포함될 수 있다. 외부 agent/provider의 data policy와 workspace 권한을 확인해야 한다.
- generated Markdown도 검증된 사실 저장소가 아니다. source URL, quote, evidence grade, contradiction flag를 사람이 표본 검토해야 한다.
- `graph.html`은 file URL에서 바로 열기보다 README가 안내한 것처럼 HTTP server로 제공해야 fetch 기반 graph shell이 정상 동작한다.

## 내 판단

LLM Wiki Newsroom은 “RAG를 대체하는 만능 지식 엔진”보다, **긴 시간에 걸쳐 쌓이는 자료를 편집 가능한 지식으로 관리하는 운영 프레임워크**에 가깝다. 개인 Obsidian vault, 연구팀의 literature map, 정책/시장 리서치처럼 source 간 연결과 상충을 남겨야 하는 작업에 특히 잘 맞는다.

추천 대상은 문서가 계속 늘어나고, source·claim·관계·수정 이력을 Markdown과 Git으로 직접 보유하고 싶은 사람이다. 반대로 바로 답을 얻는 가벼운 RAG chat이나 SaaS knowledge base가 필요할 뿐이라면, five-role gate와 규칙 layer는 과할 수 있다.

내 기준에서 가장 좋은 아이디어는 fancy graph가 아니라 “writer ≠ reviewer”다. 지식 베이스가 자라면 품질은 생성량이 아니라 검토와 갱신 규칙에서 무너진다. 이 프로젝트는 그 규칙을 versioned artifact로 만들고, 반복 실패에 따라 규칙도 검증하며 개선하려고 한다. 초기 release라는 한계를 전제로, local-first LLM wiki를 진지하게 운영해 보고 싶은 사람에게는 충분히 살펴볼 만한 템플릿이다.

## 참고한 공개 자료

- [alfadur7/llm-wiki-newsroom GitHub repository](https://github.com/alfadur7/llm-wiki-newsroom)
- [LLM Wiki Newsroom README](https://github.com/alfadur7/llm-wiki-newsroom/blob/main/README.md)
- [LLM Wiki Newsroom v0.2.0 release](https://github.com/alfadur7/llm-wiki-newsroom/releases/tag/v0.2.0)
- [Official sample wiki](https://github.com/alfadur7/llm-wiki-newsroom/wiki)
- [Official knowledge graph image](https://raw.githubusercontent.com/alfadur7/llm-wiki-newsroom/main/docs/knowledge-graph.png)
- [MIT License](https://github.com/alfadur7/llm-wiki-newsroom/blob/main/LICENSE)
