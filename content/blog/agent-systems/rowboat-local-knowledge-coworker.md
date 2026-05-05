---
title: "Rowboat은 개인 업무 맥락을 로컬 지식 그래프로 축적한다"
date: "2026-05-06"
description: "rowboatlabs/rowboat는 이메일·캘린더·미팅노트·웹 검색 결과를 로컬 마크다운 볼트와 지식 그래프로 축적한 뒤, 그 위에서 회의 준비, 이메일 초안, 문서 작성, PDF 덱 생성, 라이브 노트 업데이트를 수행하는 로컬 퍼스트 AI 동료(co-worker)를 지향한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agents
  - Knowledge Graph
  - Local-First
  - Obsidian
  - Productivity
draft: false
---

생성형 AI가 업무 생산성을 높여 준다고 할 때, 많은 제품은 여전히 “채팅창에 질문하면 답을 돌려주는 도우미” 수준에 머문다. 하지만 실제 업무에서는 답변 한 번보다 더 중요한 것이 있다. 내가 누구와 어떤 프로젝트를 진행 중인지, 지난 회의에서 무엇을 약속했는지, 어떤 이메일 스레드가 아직 열려 있는지, 어떤 문맥이 다음 산출물에 연결되어야 하는지를 지속적으로 기억하는 일이다.

`rowboatlabs/rowboat`는 바로 이 문제를 정면으로 겨냥한다. 이 프로젝트는 자신을 “Open-source AI coworker that turns work into a knowledge graph and acts on it”라고 정의한다. 핵심은 단순하다. 이메일, 캘린더, 미팅 노트, 음성 메모, 웹 검색 결과를 일회성 컨텍스트로 쓰고 버리는 대신, 로컬의 Markdown 기반 지식 그래프에 계속 축적한 뒤 그 위에서 회의 브리프, 이메일 초안, 문서, PDF 슬라이드, 추적 노트를 만들어 내겠다는 것이다.

내가 보기엔 Rowboat의 차별점은 “메모리가 있는 챗봇”보다 “업무 기록을 계속 편집하는 로컬 AI 동료”에 가깝다는 점이다. 검색으로 문맥을 매번 재구성하는 대신, 시간이 지날수록 더 촘촘해지는 작업 메모리를 직접 운영하겠다는 발상이기 때문이다.

![Rowboat repository](https://opengraph.githubassets.com/68d62ed0afe90b680be69fab0d6521fd68831a6bb31440d5492e138b197e5c12/rowboatlabs/rowboat)

## 무엇을 해결하려는가

Rowboat가 푸는 핵심 문제는 “업무 맥락의 휘발성”이다. 사용자는 회의 직전마다 예전 결론을 다시 뒤지고, 이메일 답장을 쓸 때 지난 약속과 열린 이슈를 다시 정리해야 하며, 분기 로드맵 자료를 만들 때도 여러 문서와 대화 기록을 수동으로 엮어야 한다. 기존 AI 비서는 이때 문서를 검색해 답을 만들어 줄 수는 있지만, 그 검색 결과 자체가 장기 자산으로 축적되지는 않는 경우가 많다.

README가 강조하듯 Rowboat는 이를 retrieval 문제가 아니라 long-lived knowledge 문제로 본다. 즉 중요한 사람, 프로젝트, 결정, 약속을 한 번 찾아 쓰고 버리는 것이 아니라, 시간이 지날수록 더 풍부해지는 지식 그래프로 유지한다. 그래서 “Alex와의 미팅 준비해줘” 같은 요청은 단순 요약이 아니라 과거 결정, 미해결 질문, 관련 스레드, 후속 액션을 종합한 briefing 작업으로 바뀐다.

또한 이 프로젝트는 생산성 도구가 실제 업무를 끊어서 보지 않도록 하려 한다. Gmail, Google Calendar, Drive, 미팅 노트, Fireflies, 웹 검색, 음성 메모, MCP 도구 연결까지 묶는 이유도 여기에 있다. 사용자에게 필요한 것은 또 하나의 별도 AI 창이 아니라, 이미 하고 있는 업무 흐름을 하나의 기억 구조로 통합하는 계층이기 때문이다.

## 핵심 아이디어 / 구조 / 동작 방식

Rowboat의 중심 아이디어는 “작업 기억을 사용자가 직접 열어볼 수 있는 파일 형태로 둔다”는 데 있다. README는 Rowboat가 Obsidian-compatible vault of plain Markdown notes with backlinks를 유지한다고 설명한다. 즉 메모리는 벡터 DB 안에만 숨겨진 추상 계층이 아니라, 사용자가 직접 열어보고 수정하고 백업할 수 있는 Markdown 노트 집합이다. 이 점은 단순히 투명성 문제를 넘어, 팀이나 개인이 AI 메모리를 장기 자산으로 운영할 수 있게 해 준다.

공개 문서와 저장소 구조를 종합하면 시스템은 크게 세 층으로 이해할 수 있다. 첫째는 데이터 흡수 계층이다. Gmail, Calendar, Drive, Rowboat meeting notes, Fireflies, Exa 검색, 음성 입출력, 외부 MCP/Composio 도구가 여기 속한다. 둘째는 기억/해석 계층이다. 이 레이어에서 메일·미팅·메모·웹 정보가 Markdown 노트와 관계 구조로 정리되고, 필요하면 knowledge graph, track block, note tagging, meeting summarization, agent notes 같은 파이프라인을 거친다. 셋째는 행동 계층이다. 여기서 사용자는 회의 준비, 이메일 작성, 문서/덱 생성, 라이브 노트 갱신, 로컬 도구 실행 같은 실제 업무 액션을 요청한다.

`CLAUDE.md`를 보면 이 저장소는 단일 앱이 아니라 꽤 큰 모노레포다. `apps/x`의 Electron 데스크톱 앱이 사용자-facing 핵심이고, 여기에 Next.js 기반 웹 대시보드, CLI, Python SDK, 문서 사이트가 함께 존재한다. 특히 `apps/x`는 shared/core/preload/renderer/main으로 분리된 pnpm workspace 구조를 가지며, Electron main과 React renderer, preload bridge, core 비즈니스 로직이 명확히 분리돼 있다. 즉 겉으로는 “AI 비서 앱”처럼 보이지만, 내부적으로는 데스크톱 제품과 지식 처리 파이프라인, 툴 실행 레이어를 꽤 진지하게 분리한 구조다.

또 하나 흥미로운 부분은 분석 문서(`apps/x/ANALYTICS.md`)에서 드러나는 실제 사용 흐름이다. 여기에는 `meeting_note`, `knowledge_sync`, `track_block`, `copilot_chat` 같은 use case가 구분되어 있고, `build_graph`, `tag_notes`, `label_emails`, `inline_task_run` 같은 하위 동작이 명시돼 있다. 이는 Rowboat가 단순 챗 인터페이스가 아니라, 백그라운드에서 업무 기록을 지속적으로 구조화하는 파이프라인을 실제 제품 기능으로 다루고 있음을 보여준다.

![Rowboat demo](https://github.com/user-attachments/assets/8b9a859b-d4f1-47ca-9d1d-9d26d982e15d)

| 레이어 | 공개 자료에서 확인되는 구성요소 | 역할 |
|---|---|---|
| Intake | Gmail, Google Calendar, Drive, Rowboat notes, Fireflies, Exa, Deepgram, ElevenLabs, MCP, Composio | 업무 흔적과 외부 도구를 메모리 시스템으로 끌어옴 |
| Memory | Obsidian-compatible Markdown vault, backlinks, knowledge graph, tagging/sync 파이프라인 | 문맥을 숨겨진 상태가 아니라 편집 가능한 작업 메모리로 유지 |
| Action | meeting prep, email drafting, docs & decks, follow-up capture, live notes, local tool runs | 축적된 기억을 실제 산출물과 행동으로 연결 |

| 배포/구조 관점 | 저장소에서 확인되는 내용 | 의미 |
|---|---|---|
| Desktop app | `apps/x` Electron 앱 + React renderer + preload + core | 로컬 퍼스트 사용자 경험의 중심 |
| Monorepo | web dashboard, CLI, Python SDK, docs 포함 | 앱 하나보다 넓은 제품/생태계 지향 |
| Bring-your-own model | Ollama, LM Studio, hosted provider, provider swap | 모델은 교체 가능하고 데이터는 로컬에 고정 |
| Tool extensibility | MCP, Composio, Exa, Slack/Linear/Jira/GitHub 예시 | AI 동료를 실제 업무 자동화 계층으로 확장 |

## 공개된 근거에서 확인되는 점

저장소 메타데이터만 봐도 프로젝트의 반응 속도는 상당하다. 조회 시점 기준 GitHub 저장소는 약 13.2k stars, 1.3k forks, 1,555 commits, 169 branches, 114 tags를 보이고 있다. 기본 브랜치는 `main`이고, 최신 공개 릴리스는 `v0.3.5`다. 릴리스 자산도 macOS arm64/x64, Linux zip/deb/rpm 등 여러 패키지로 제공되고 있어, 단순 소스 공개가 아니라 실제 데스크톱 배포를 강하게 의식한 프로젝트임을 알 수 있다.

README에서 확인되는 제품 포지셔닝도 분명하다. 이 프로젝트는 “memory that compounds”를 핵심 메시지로 내세운다. 즉 대부분의 AI가 검색으로 문맥을 다시 조립하는 데 비해, Rowboat는 관계와 노트를 지속적으로 누적하는 장기 기억 구조를 만든다는 것이다. 이 메시지는 단순 마케팅 문구가 아니라, Markdown vault·backlink·live notes·knowledge graph·meeting prep·follow-up capture 같은 기능 설명 전체와 일관되게 연결되어 있다.

설정 문서들도 꽤 현실적이다. `google-setup.md`는 Gmail/Calendar/Drive 연결을 위해 Google Cloud 프로젝트 생성, OAuth consent screen, test user, Web application 타입, `http://localhost:8080/oauth/callback` 리다이렉트 URI, client id/secret 입력까지 단계별로 안내한다. 이는 단순히 “Google 연동 지원”이라고 말하는 수준이 아니라, 실제 사용자 온보딩 마찰을 줄이기 위해 운영 문서를 꼼꼼히 다듬고 있다는 뜻이다.

한편 `docker-compose.yml`과 `.env.example`는 이 저장소의 역사도 드러낸다. 오늘의 README는 로컬 퍼스트 Electron AI 동료를 전면에 내세우지만, compose 파일에는 MongoDB, Redis, Qdrant, rag-worker, jobs-worker, Auth0, billing, scraping, S3 uploads 같은 더 무거운 서버형 구성의 흔적이 남아 있다. 즉 Rowboat는 단순한 로컬 앱 하나로 출발했다기보다, RAG/백엔드/호스티드 운영 경험을 거쳐 현재의 “local-first coworker” 방향으로 재정리되고 있는 프로젝트로 읽힌다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub 메타데이터 | 13.2k stars, 1.3k forks, 1,555 commits, Apache-2.0 | 빠르게 주목받는 오픈소스 AI coworker 프로젝트 |
| README | knowledge graph, Markdown vault, live notes, docs/decks, BYOM, MCP | 단순 챗봇이 아니라 기억 기반 업무 동료 포지셔닝 |
| Releases | `v0.3.5` + macOS/Linux 배포 자산 다수 | 실제 설치형 제품으로 운영 중 |
| `google-setup.md` | OAuth client id/secret, callback, test users 설정 문서 | 현실적인 사용자 온보딩과 계정 연동을 지원 |
| `ANALYTICS.md` | meeting_note / track_block / knowledge_sync / graph build use case 명시 | 내부적으로도 기억 갱신과 업무 행동이 분리된 제품 구조 |
| `docker-compose.yml` | MongoDB, Redis, Qdrant, workers, scraping, billing 구성 흔적 | 로컬 앱 뒤에 더 큰 지식 처리/백엔드 실험의 축적이 존재 |

## 실무 관점에서의 해석

내가 보기엔 Rowboat의 가장 큰 의미는 “AI 메모리”를 사용자 통제 가능한 작업 파일로 되돌려 놓았다는 점이다. 많은 생산성 AI는 기억을 모델 내부 상태처럼 다루거나, SaaS 백엔드 속 검색 인덱스로 감춘다. 반면 Rowboat는 Obsidian-compatible Markdown vault를 전면에 내세운다. 이 구조는 투명성, 이식성, 백업 가능성, 수동 수정 가능성, 다른 툴과의 상호운용성 면에서 훨씬 강하다.

또한 이 프로젝트는 회의 준비, 이메일 답장, 문서/덱 생성 같은 “실제 일”을 메모리와 직접 연결한다는 점에서 흥미롭다. 단순히 잘 대답하는 챗봇이 아니라, 기억이 누적될수록 더 좋은 briefing, drafting, tracking이 가능해지는 구조다. 최근 에이전트 툴들이 실행(action)에 집중하는 흐름과, 개인 지식 관리 도구들이 장기 기억(compounding memory)에 집중하는 흐름이 여기서 만난다.

물론 한계도 있다. 첫째, Google OAuth, 음성 API, 외부 툴, 모델 설정까지 엮는 순간 온보딩 복잡도는 낮지 않다. 둘째, 로컬 퍼스트라는 장점은 곧 사용자가 자신의 파일 구조와 키 관리, 동기화 방식을 스스로 책임져야 한다는 뜻이기도 하다. 셋째, 현재 저장소에는 Electron 데스크톱 경험과 함께 과거/병행 서버형 구성의 흔적도 남아 있어, 제품 경계가 완전히 단순하다고 보긴 어렵다.

그럼에도 방향성은 매우 설득력 있다. 앞으로 AI 비서의 경쟁력은 “한 번 잘 답하는가”보다 “내 업무 맥락을 얼마나 오래, 투명하게, 재사용 가능하게 유지하는가”에 달려 있을 가능성이 크다. 그런 관점에서 Rowboat는 메모리 있는 챗봇이 아니라, 로컬 지식 그래프를 기반으로 작동하는 오픈소스 AI 동료라는 표현이 더 정확하다.

Sources: https://github.com/rowboatlabs/rowboat, https://github.com/rowboatlabs/rowboat/blob/main/README.md, https://github.com/rowboatlabs/rowboat/blob/main/CLAUDE.md, https://github.com/rowboatlabs/rowboat/blob/main/google-setup.md, https://github.com/rowboatlabs/rowboat/blob/main/apps/x/ANALYTICS.md