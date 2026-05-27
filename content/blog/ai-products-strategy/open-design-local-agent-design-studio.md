---
title: "Open Design은 Claude Design을 로컬 에이전트 스튜디오로 다시 만든다"
date: "2026-05-06T04:53:39"
description: "nexu-io/open-design은 Claude Design의 artifact-first 디자인 경험을 오픈소스로 재구성하면서, 여러 코딩 에이전트 CLI와 로컬 데몬, 디자인 시스템, 스킬 카탈로그, 샌드박스 프리뷰, HTML·PDF·PPTX·MP4 내보내기를 하나의 로컬 퍼스트 디자인 스튜디오로 묶으려는 프로젝트다."
author: "Sangmin Lee"
category: "ai-products-strategy"
tags:
  - Agents
  - Design Tools
  - Local-First
  - Design Systems
  - MCP
draft: false
---

생성형 AI가 디자인 영역에 들어오면서 중요한 변화는 단순히 “이미지를 더 잘 만든다”가 아니다. 진짜 변화는 모델이 텍스트를 답하는 대신, 실제 산출물(artifact)을 만들고 고치고 내보내는 작업 루프 안으로 들어왔다는 점이다. Claude Design이 주목받았던 이유도 여기에 있다. 프롬프트 한 줄이 채팅 답변으로 끝나는 것이 아니라, 프레젠테이션, 랜딩 페이지, 모바일 화면, 포스터 같은 결과물로 이어졌기 때문이다.

하지만 그 경험은 동시에 강한 잠금(lock-in)을 갖고 있었다. 특정 모델, 특정 클라우드, 특정 제품 UX에 묶여 있고, 로컬 파일시스템이나 기존 코드 에이전트 CLI를 직접 활용하기 어렵다. `nexu-io/open-design`은 바로 이 지점을 겨냥한다. 이 프로젝트는 자신을 “Anthropic Claude Design의 오픈소스 대안”이라고 직접 설명하면서, Claude Code·Codex·Cursor·Gemini·Hermes 같은 이미 설치된 에이전트 CLI를 디자인 엔진으로 삼고, 그 위에 디자인 시스템·스킬·프리뷰·익스포트·BYOK 프록시를 얹어 로컬 퍼스트 디자인 스튜디오를 만들겠다는 방향을 분명히 한다.

내가 보기엔 Open Design의 핵심은 단순한 “AI 디자인 앱”이 아니라, 디자인 작업을 에이전트 오케스트레이션 문제로 재정의한다는 데 있다. 좋은 산출물을 만드는 비결을 하나의 폐쇄형 모델에 숨기기보다, 질문 폼·스킬·디자인 시스템·체크리스트·프리뷰 런타임을 파일과 데몬으로 분해해서 조합 가능한 운영체제로 만들려는 것이다.

![Open Design banner](https://github.com/nexu-io/open-design/raw/main/docs/assets/banner.png)

## 무엇을 해결하려는가

Open Design이 푸는 문제는 “AI가 그럴듯한 시안을 만드는 것”보다 한 단계 더 아래에 있다. 실제 디자인 생산성의 병목은 모델 한 번 호출보다도, 어떤 산출물 모드로 시작할지, 어떤 시각 언어를 적용할지, 사용자가 원하는 톤과 제약이 무엇인지 먼저 고정하고, 생성 결과를 다시 미세 조정하며, 최종적으로 HTML·PDF·PPTX·MP4 같은 실사용 포맷으로 뽑아내는 작업 흐름에 있다.

README가 강조하듯 Open Design은 이 흐름을 artifact-first로 본다. 사용자가 “seed round용 매거진 스타일 pitch deck 만들어줘”라고 입력하면, 시스템은 바로 픽셀을 뿌리지 않는다. 먼저 discovery form으로 surface, audience, tone, brand context, scale, constraints를 고정하고, 이후 방향성(direction) 선택, live todo progress, sandboxed preview, self-critique까지 이어지는 루프를 설계한다. 즉 문제의식은 “모델이 예쁜 결과를 만들게 하자”가 아니라 “디자인 리디렉션 비용이 큰 작업을 구조화된 인터랙션으로 낮추자”에 가깝다.

또 다른 병목은 에이전트 종속성이다. 어떤 팀은 Claude Code를 쓰고, 어떤 팀은 Codex나 Gemini CLI, 어떤 팀은 아예 BYOK API 모드만 쓴다. Open Design은 이를 한 제품 안에서 흡수하려 한다. README와 architecture 문서를 보면, 특정 에이전트를 번들로 내장하는 대신 로컬 데몬이 PATH를 스캔해 설치된 CLI를 감지하고, 없으면 OpenAI-compatible/Azure/Anthropic/Gemini API 프록시로 같은 루프를 대체한다. 즉 에이전트 선택을 제품의 고정값이 아니라 교체 가능한 실행 레이어로 다룬다.

## 핵심 아이디어 / 구조 / 동작 방식

Open Design의 첫 번째 핵심은 “에이전트를 내장하지 않는다”는 점이다. README 표현 그대로, 이미 사용자의 노트북 위에 있는 강한 코딩 에이전트 CLI를 디자인 엔진으로 재사용한다. 현재 공개 문서 기준 감지 대상은 Claude Code, Codex CLI, Devin for Terminal, Cursor Agent, Gemini CLI, OpenCode, Qwen Code, GitHub Copilot CLI, Hermes, Kimi CLI, Pi, Kiro CLI, Kilo, Mistral Vibe, DeepSeek TUI 등 15개다. 이들은 로컬 데몬이 spawn하고, 각 CLI 특성에 맞는 adapter와 스트리밍 parser를 거쳐 동일한 디자인 대화 루프 안으로 들어온다.

두 번째 핵심은 스킬과 디자인 시스템을 “파일 기반 조립 부품”으로 다룬다는 점이다. `skills/`는 Claude Code의 `SKILL.md` 관례를 확장해 모드, 시나리오, 플랫폼을 가진 디자인 skill 카탈로그를 제공하고, `design-systems/`는 `DESIGN.md` 스키마를 따라 시각 언어를 캡슐화한다. README와 quickstart를 종합하면 현재 디자인 시스템 수는 129개, 스킬 수는 31개 수준이며, 랜딩 페이지·대시보드·모바일 앱·소셜 캐러셀·PPT·재무 보고서·온보딩 문서 등 꽤 넓은 artifact surface를 커버한다. 흥미로운 점은 README 헤드라인 배지의 71/72 design systems 숫자와 본문 `At a glance` 표의 129개 숫자가 다르다는 점인데, 이는 카탈로그가 빠르게 확장되는 중이며 상단 요약 문구 일부가 최신 상태를 완전히 반영하지 못했음을 시사한다.

세 번째 핵심은 로컬 데몬 중심 아키텍처다. `docs/architecture.md` 기준 기본 토폴로지는 브라우저의 Next.js 앱과 로컬 `od daemon`이 분리되고, 데몬이 프로젝트 폴더를 CWD로 잡아 실제 파일시스템에서 에이전트를 실행하는 구조다. 이 방식 덕분에 에이전트는 단순 채팅 답변이 아니라 실제 `Read`, `Write`, `Bash`, `WebFetch`를 통해 프로젝트를 수정하고, 생성물은 `.od/projects/<id>/`나 artifact 디렉터리에 실파일로 남는다. 여기에 sandboxed iframe preview와 export pipeline이 붙어 HTML/PDF/PPTX/ZIP/Markdown으로 결과물을 바로 전달한다.

네 번째 핵심은 prompt stack이 곧 제품이라는 발상이다. quickstart와 README는 매 요청이 단순 system+user가 아니라 BASE_SYSTEM_PROMPT + active DESIGN.md + active SKILL.md + discovery directives + project metadata + side files 조합으로 만들어진다고 설명한다. 즉 디자인 품질은 모델 하나의 감각보다, 어떤 질문을 먼저 띄우고 어떤 디자인 시스템을 주입하며 어떤 체크리스트를 따라가게 하느냐에 더 크게 좌우된다는 판단이다.

![Discovery form](https://github.com/nexu-io/open-design/raw/main/docs/screenshots/02-question-form.png)

![Sandboxed preview](https://github.com/nexu-io/open-design/raw/main/docs/screenshots/05-preview-iframe.png)

![Design systems library](https://github.com/nexu-io/open-design/raw/main/docs/screenshots/06-design-systems-library.png)

| 레이어 | Open Design이 제공하는 것 | 실무적 의미 |
|---|---|---|
| Agent runtime | 15개 로컬 CLI auto-detect + BYOK 프록시 fallback | 특정 모델 벤더에 덜 종속적인 디자인 워크플로우 |
| Skill catalog | prototype/deck 중심 31개 스킬 | 결과물 형식 자체를 재사용 가능한 절차로 고정 |
| Design systems | 129개 수준의 `DESIGN.md` 기반 시각 언어 카탈로그 | 브랜드/미감 레이어를 프롬프트 밖 자산으로 분리 |
| Local daemon | 파일시스템·세션·프리뷰·익스포트를 담당 | 채팅이 아니라 실제 작업환경을 제공 |
| Prompt stack | discovery form, critique, directions, side files | 초기 브리프 누락과 리디렉션 비용을 줄임 |

| 모드/기능 | README/Quickstart에서 확인되는 내용 | 의미 |
|---|---|---|
| Prototype mode | web-prototype, saas-landing, dashboard, mobile-app 등 | HTML 기반 제품/마케팅/모바일 시안 생성 |
| Deck mode | guizang-ppt, simple-deck, replit-deck, weekly-update | 프레젠테이션·보고서류 산출물 지원 |
| Media generation | gpt-image-2, Seedance 2.0, HyperFrames surfaces | 정적 디자인을 넘어 이미지/영상까지 확장 |
| Import / export | Claude Design ZIP import, HTML/PDF/PPTX/MP4/ZIP/Markdown export | 닫힌 생성 경험을 실제 워크플로우로 연결 |

## 공개된 근거에서 확인되는 점

공개 저장소 지표만 봐도 반응은 매우 빠르다. 조회 시점 기준 GitHub 저장소는 약 27.1k stars, 3k forks, 264 commits, 78 branches, 16 tags를 보이고 있고, 최신 릴리스는 `Open Design 0.4.0`이다. 생성 시점이 2026년 4월 말~5월 초 수준의 매우 초기 프로젝트라는 점을 생각하면, 오픈소스 디자인 에이전트 분야에서 상당한 흡인력을 얻고 있는 셈이다.

특히 `CHANGELOG.md`는 이 저장소가 단순 README 실험을 넘어 빠르게 제품화되고 있음을 보여준다. 0.4.0 릴리스 하나만 봐도 MCP 서버화(`od mcp`), Critique Theater Phase 4, live-reload preview iframe, Tweaks mode, live artifacts, Kilo/DeepSeek adapter, Linux AppImage tooling, Skills & Design Systems management page, 다국어 확장 같은 변화가 한꺼번에 들어가 있다. 릴리스 노트에 2일간 71개 PR과 40+ contributors라는 표현이 있을 정도로 변화 속도가 높다.

또 하나 중요한 공개 근거는 실제 아키텍처 문서의 존재다. `docs/architecture.md`는 fully local / Vercel + local daemon / direct API라는 세 가지 배포 토폴로지를 분명히 설명한다. 이는 Open Design이 단순 데모 앱이 아니라 로컬 개발, 터널링, 서버리스 fallback까지 포함하는 운영 모델을 의식하고 설계되었다는 뜻이다. `QUICKSTART.md`도 Node 24, pnpm 10.33.x, `pnpm tools-dev` 중심 라이프사이클, `OD_*` 환경변수, nginx SSE 주의사항까지 적고 있어 “돌아가는 데모”를 넘어 실제 사용을 염두에 두고 있다.

흥미로운 점은 이 프로젝트가 디자인 결과물뿐 아니라 critique와 tweaks까지 제품으로 다룬다는 것이다. changelog상 Critique Theater는 다중 패널리스트 scoring pipeline으로 설명되고, preview pane은 live reload와 element picker 기반 tweaks mode를 지원한다. 즉 산출물을 한 번 뽑는 것보다, 뽑은 뒤 어떻게 평가하고 다시 손보게 할지가 제품의 중요한 일부로 올라와 있다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub 메타데이터 | 27.1k+ stars, 3k+ forks, 264 commits, Apache-2.0 | 초기지만 폭발적으로 확산 중인 오픈소스 디자인 에이전트 플랫폼 |
| README | 15개 CLI, 31 skills, 129 design systems, BYOK proxy, export surfaces | 단일 앱이 아니라 로컬 디자인 작업 운영체제 지향 |
| `CHANGELOG.md` 0.4.0 | MCP server, Critique Theater, live preview, Tweaks, 추가 adapter, packaging | 빠른 제품화와 에이전트 생태계 확장 신호 |
| `docs/architecture.md` / `QUICKSTART.md` | local daemon, Vercel 연동, direct API fallback, `pnpm tools-dev` 운영 | 실제 도입과 배포를 고려한 설계 |

## 실무 관점에서의 해석

내가 보기에 Open Design의 가장 큰 의미는 “디자인 생성기”를 만드는 데 있지 않다. 더 중요한 의미는 Claude Design 같은 폐쇄형 경험을, 파일 기반 스킬·디자인 시스템·로컬 에이전트·프리뷰 런타임으로 분해해 재조립했다는 점이다. 즉 사용자는 결과물만 받는 것이 아니라, 그 결과를 만드는 질문 폼, 시각 언어, 산출물 스킬, 실행 에이전트, 익스포트 형식까지 모두 바꿀 수 있다.

이 구조는 특히 디자인과 개발이 섞여 있는 팀에 강하다. 웹 프로토타입, deck, mobile mockup, dashboard, 문서형 산출물, 심지어 이미지/영상까지 같은 프레임 안에서 다룰 수 있고, 결과물이 실제 파일로 남으므로 Git·리뷰·핸드오프에 연결하기 좋다. MCP 서버화도 같은 맥락이다. Open Design 자체를 하나의 앱으로 끝내지 않고, 다른 코딩 에이전트나 레포에서 디자인 자산을 읽는 외부 도구로도 쓰려는 시도이기 때문이다.

물론 한계도 있다. 첫째, 기능 확장 속도가 너무 빠른 만큼 README의 상단 배지 숫자와 본문 catalog 수치가 엇갈리듯 문서 일관성이 따라가기 어려울 수 있다. 둘째, 15개 이상의 다양한 CLI와 여러 프로토콜을 한 제품에서 지원하면 어댑터 유지보수 복잡도가 높아진다. 셋째, “로컬 퍼스트 + BYOK + 데몬 + 프리뷰 + export”라는 강점은 반대로 초기 설정과 운영 난도를 올릴 수도 있다. 디자인 전용 SaaS보다 단순하지는 않다.

그럼에도 방향성은 상당히 설득력 있다. 앞으로 디자인 도구의 경쟁력은 단순한 이미지 품질보다, 얼마나 좋은 질문을 먼저 던지고, 얼마나 다양한 산출물 표면(surface)을 같은 루프 안에서 다루며, 얼마나 폐쇄형 모델 종속성 없이 팀 자산으로 축적되느냐에 달려 있을 가능성이 크다. Open Design은 그 점에서 단순한 Claude Design 클론이 아니라, “에이전트 시대의 오픈 디자인 워크스테이션”을 만들려는 프로젝트로 읽는 편이 정확하다.

Sources: https://github.com/nexu-io/open-design, https://github.com/nexu-io/open-design/blob/main/CHANGELOG.md, https://github.com/nexu-io/open-design/blob/main/QUICKSTART.md, https://github.com/nexu-io/open-design/blob/main/docs/architecture.md