---
title: "mckinsey-pptx는 컨설팅 덱 작성을 Claude Code 에이전트 작업으로 바꾼다"
date: "2026-05-06"
description: "seulee26/mckinsey-pptx는 맥킨지 스타일 슬라이드 40종을 Python PPTX 엔진으로 구현하고, 그 위에 Claude Code 플러그인·서브에이전트·슬래시 커맨드를 얹어 사용자의 짧은 브리프를 실제 .pptx 파일로 변환하는 로컬 실행형 프레젠테이션 에이전트 프로젝트다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agents
  - Presentation Tools
  - Claude Code
  - PowerPoint
  - Consulting
draft: false
---

생성형 AI가 업무 문서를 바꾸고 있다고 말할 때, 많은 사람은 아직도 텍스트 초안이나 요약 자동화를 먼저 떠올린다. 하지만 실무에서 더 많은 시간을 잡아먹는 산출물은 보고서 본문보다도 발표 덱이다. 특히 경영진 보고, 사업 리뷰, 전략 제안처럼 "스토리라인 + 숫자 시각화 + 정돈된 레이아웃"이 동시에 필요한 작업은 단순 복붙 자동화로 해결되지 않는다.

`seulee26/mckinsey-pptx`가 흥미로운 이유는 바로 이 지점을 겨냥하기 때문이다. 이 저장소는 자신을 "McKinsey-style PPTX generator"라고 소개하지만, 실제 구조를 뜯어보면 단순 슬라이드 템플릿 모음이 아니다. Claude Code 플러그인, `mckinsey-slide-agent` 서브에이전트, `/mckinsey-deck` 커맨드, 그리고 `python-pptx` 기반 생성 엔진을 결합해, 사용자가 한국어 한 줄로 말한 브리프를 실제 `.pptx` 파일 생성 작업으로 연결하는 작은 에이전트 시스템에 가깝다.

내가 보기엔 이 프로젝트의 핵심은 "AI가 PPT를 예쁘게 그려준다"보다 "프레젠테이션 제작을 템플릿 선택 + 스토리 설계 + 파일 생성이라는 에이전트 워크플로우로 쪼갠다"는 데 있다. 즉 결과물은 슬라이드 이미지가 아니라 수정 가능한 PowerPoint 파일이고, 중간 계층은 채팅 UI가 아니라 플러그인/서브에이전트/카탈로그/빌더 코드로 구성돼 있다.

![mckinsey-pptx repository](https://opengraph.githubassets.com/ddf1145b2f10cc36570d0bacb62add184583163e9a0a518ee66cfbcf09e9607e/seulee26/mckinsey-pptx)

## 무엇을 해결하려는가

이 프로젝트가 푸는 문제는 단순한 "PPT 자동 생성"이 아니다. 더 정확히는, 짧은 브리프만 있는 상태에서 어떤 슬라이드 타입을 골라야 하고, 어떤 숫자는 차트로, 어떤 메시지는 executive summary로, 어떤 비교는 매트릭스로 풀어야 하는지를 사람이 매번 직접 판단해야 하는 부담을 줄이려 한다. 컨설팅 스타일 덱이 어려운 이유는 디자인 도구를 다루는 기술보다도, 상황에 맞는 구조를 빠르게 고르는 판단 비용이 크기 때문이다.

README는 이를 매우 사용자 친화적으로 포장한다. 예를 들어 "Q4 사업 리뷰 데크 만들어줘"라고 입력하면 40개 템플릿 중 적절한 것을 골라 6~8장짜리 `.pptx`를 만든다고 설명한다. 하지만 저장소 내부를 보면 진짜 문제 설정은 더 구체적이다. 사용자가 준 입력이 엑셀인지, 워드 문서인지, PDF인지, 메모인지에 따라 읽어들일 수 있는 자료를 정리하고, 슬라이드 종류를 카탈로그 기반으로 고르고, 그 결과를 실제 PowerPoint 파일로 저장하는 전체 절차를 자동화하려는 것이다.

특히 이 프로젝트는 보고서 작성보다 프레젠테이션 "형식 선택"을 중간 추론 단계로 올려놓는다. 예를 들어 성장률이 단일 시계열이면 `column_simple_growth`, 실제값과 전망치를 나눠 보여줘야 하면 `column_historic_forecast`, 2x2 포트폴리오 분석이면 `growth_share`, 프로젝트 일정이면 `gantt_timeline`을 쓰라는 식이다. 즉 문제의식은 "문장을 슬라이드로 바꾸자"가 아니라 "브리프를 받아 적절한 시각 표현 문법을 선택하자"에 가깝다.

## 핵심 아이디어 / 구조 / 동작 방식

구조를 보면 이 프로젝트는 세 층으로 나뉜다. 첫째는 Claude Code 플러그인 계층이다. `.claude-plugin/plugin.json`은 플러그인 메타데이터를 제공하고, `agents/mckinsey-slide-agent.md`는 서브에이전트의 역할과 워크플로우를 정의하며, `commands/mckinsey-deck.md`는 사용자의 브리프를 그 서브에이전트에게 위임하는 슬래시 커맨드를 만든다. 즉 사용자는 채팅으로 요청하지만, 내부적으로는 plugin → command → subagent delegation 흐름을 탄다.

둘째는 템플릿 의사결정 계층이다. `mckinsey_pptx/agent/CATALOG.md`는 단순한 예제 문서가 아니라 거의 룰북에 가깝다. 각 템플릿마다 언제 써야 하는지, 언제 쓰면 안 되는지, 어떤 인자를 요구하는지, 어떤 인접 템플릿과 구별되는지를 자세히 설명한다. 서브에이전트 문서도 이 카탈로그를 "source of truth"라고 명시하며, 매 슬라이드마다 왜 그 템플릿을 골랐는지 설명하도록 강제한다. 즉 템플릿 선택이 암묵적 감각이 아니라 공개된 결정 규칙으로 드러나 있다.

셋째는 실제 렌더링 계층이다. `mckinsey_pptx/builder.py`를 보면 `PresentationBuilder`가 `cover_slide`, `executive_summary_takeaways`, `prioritization_matrix`, `comparison_table`, `gantt_timeline`, `kpi_dashboard` 같은 여러 타입을 라우팅하고, 필요한 경우 payload shape를 보고 슬라이드 타입을 추론하는 `infer_slide_type`도 제공한다. 즉 이 프로젝트는 완전한 WYSIWYG 에디터가 아니라, 구조화된 spec을 받아 `.pptx`를 조립하는 생성 엔진을 가진다.

README와 CATALOG를 합쳐 보면 제공 범위도 꽤 넓다. executive summary, BCG 매트릭스, 우선순위 매트릭스, KPI 대시보드, 조직도, 이슈 트리, phased roadmap, gantt, stacked/grouped column chart, before/after 비교, Harvey ball 기반 option comparison 등 전형적인 전략/컨설팅 슬라이드 문법이 거의 한 벌로 들어 있다. 특히 `mckinsey-slide-agent`는 단순 생성이 아니라 "왜 이 템플릿이 맞는지 방어(defend)"하라고 적혀 있는데, 이 부분이 에이전트형 도구로서의 정체성을 잘 보여준다.

![Author badge](https://camo.githubusercontent.com/57f046099e29e26eb45e30549fa0875d698f5234aec013bf41584eb841ba3216/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f617574686f722d41582532304c6162732d306231663361)
![Templates badge](https://camo.githubusercontent.com/0e8198df02ebae8e4f76ea3af8416ad52ceb1d1c416ab720565e41818424d772/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f74656d706c617465732d34302d627269676874677265656e)
![Platform badge](https://camo.githubusercontent.com/1ab9bfe3ac732beacfaa95910d71339c9fbed8b658bd5c3493866472513e52f7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f706c6174666f726d2d436c61756465253230436f64652d366234626666)

| 계층 | 저장소에서 확인되는 구성요소 | 역할 |
|---|---|---|
| Plugin layer | `.claude-plugin/plugin.json`, `/plugin install` 경로 | Claude Code 안에 기능을 배포하고 로드 |
| Agent layer | `agents/mckinsey-slide-agent.md`, `commands/mckinsey-deck.md` | 브리프 해석, 템플릿 선택, 빌드/검증 절차 수행 |
| Template logic | `mckinsey_pptx/agent/CATALOG.md` | 40개 템플릿의 사용 조건과 인자 규칙 정의 |
| Rendering engine | `mckinsey_pptx/builder.py` + slides 모듈 | 실제 `.pptx` 파일 조립 및 슬라이드 타입 라우팅 |
| Example / ops | `examples/`, `requirements.txt` | 데모 실행, 의존성 설치, 개발자 진입점 제공 |

| 입력/산출 관점 | 공개 문서에서 확인되는 내용 | 의미 |
|---|---|---|
| 입력 | 자유 텍스트 브리프, 엑셀/CSV, DOCX, PDF, MD/TXT, 로고 이미지 | 문서형·데이터형 업무 입력을 모두 슬라이드 원천으로 활용 |
| 중간 추론 | 템플릿 선택, 슬라이드 스토리 구조 설계, 선택 근거 설명 | 사람의 컨설팅식 편집 판단을 에이전트 단계로 끌어올림 |
| 출력 | 실제 `.pptx` 파일, 필요시 PDF/PNG preview 검증 | 스크린샷이 아니라 편집 가능한 업무 산출물 생성 |

## 공개된 근거에서 확인되는 점

저장소 메타데이터를 보면 프로젝트는 아직 매우 초기다. 조회 시점 기준 약 367 stars, 73 forks, 11 commits 수준이며 기본 브랜치는 `main`이다. GitHub UI에는 tag가 1개 있고 최신 커밋 메시지는 `Fix slide layout overflow and polish template rendering (v0.2.0)`로 보인다. 반면 GitHub Releases API에서는 latest release가 404를 반환했기 때문에, 태그는 있지만 정식 릴리스 노트가 관리되는 형태는 아직 아닌 것으로 보인다.

또 하나 흥미로운 점은 메타데이터와 문서 사이의 약간의 불일치다. README와 `plugin.json`은 모두 MIT를 명시하고 LICENSE 파일도 존재하지만, GitHub REST 메타데이터의 `license` 필드는 `NOASSERTION`으로 노출된다. 실질적으로는 MIT 사용을 의도한 것으로 읽히지만, 저장소 메타데이터 정합성은 아직 다듬을 여지가 있다. 초기 프로젝트에서 흔히 보이는 종류의 운영 디테일이다.

서브에이전트 정의 문서는 꽤 인상적이다. `mckinsey-slide-agent.md`는 첫 실행 시 import 확인, `PYTHONPATH` 처리, LibreOffice/Poppler 기반 preview 렌더링, 슬라이드 길이 제한, 한국어일 때 Apple SD Gothic Neo 테마 강제, placeholder 금지, chart 설명 필드 강제 등 매우 구체적인 가드레일을 적어 둔다. 즉 이 프로젝트는 단순히 "슬라이드 템플릿 40개"가 아니라, 그 템플릿을 제대로 사용하게 만드는 운영 규칙까지 함께 패키징하고 있다.

README의 사용성 측면도 분명하다. `/plugin marketplace add seulee26/mckinsey-pptx`와 `/plugin install axlabs-mckinsey-pptx@axlabs`로 설치하고, Claude Code 재시작 후 `/agents`에서 `mckinsey-slide-agent`를 확인하라고 안내한다. 이후에는 사용자가 폴더 안 자료를 바탕으로 "사업 리뷰 데크 만들어줘", "영문 10슬라이드 킥오프 덱 만들어줘"처럼 자연어로 요청하면 된다고 설명한다. 즉 이 프로젝트는 Python 라이브러리이면서 동시에 비개발자 친화적인 agentized distribution 패턴을 취한다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub 메타데이터 | 367 stars, 73 forks, 11 commits, Python 중심 저장소 | 초기지만 반응이 빠른 니치한 프레젠테이션 에이전트 프로젝트 |
| README | 40개 템플릿, Claude Code 플러그인 설치, 자연어 기반 사용 흐름 | 단순 라이브러리보다 사용자-facing agent product에 가까움 |
| `CATALOG.md` | 템플릿별 use when / don't use when / required inputs 정의 | 템플릿 선택을 공개된 의사결정 규칙으로 외부화 |
| `mckinsey-slide-agent.md` | 빌드, 검증, preview, 한국어 테마, overflow 가드레일 명시 | 생성 품질을 높이기 위한 운영 SOP가 핵심 자산 |
| Releases API | latest release 404, GitHub UI에는 tag 1개 | 태그는 있으나 릴리스 운영은 아직 초기 단계 |

## 실무 관점에서의 해석

내가 보기에 `mckinsey-pptx`의 가장 큰 장점은 PowerPoint 생성을 "에이전트가 판단 가능한 프레젠테이션 문법"으로 바꿨다는 점이다. 많은 슬라이드 생성 도구는 이미지 결과를 보여주거나, 단순한 프롬프트 기반 HTML/캔버스 시안을 만드는 데 그친다. 반면 이 프로젝트는 결과물을 `.pptx`로 남기고, 어떤 슬라이드를 왜 골랐는지까지 서브에이전트가 설명하게 만든다. 이건 특히 컨설팅, 전략, 운영 리뷰처럼 재편집·검토·사내 공유가 필수인 환경에서 의미가 크다.

또한 이 저장소는 프레젠테이션을 단순한 디자인 문제가 아니라 구조화된 reasoning 문제로 본다. 브리프를 읽고, 데이터 타입을 파악하고, 적절한 슬라이드 문법을 고르고, 렌더 후 오버플로를 다시 확인하는 흐름은 사실상 작은 문서 생산 파이프라인이다. 최근 에이전트 도구들이 코딩뿐 아니라 문서/디자인/리서치 산출물 생성으로 확장되는 흐름과도 잘 맞는다.

물론 한계도 있다. 첫째, 현재 배포 타깃이 사실상 Claude Code 플러그인 생태계에 강하게 묶여 있다. 둘째, README의 사용자 친화적 설명에 비해 실제 품질은 템플릿 카탈로그와 입력 구조화 수준에 크게 좌우될 가능성이 높다. 셋째, GitHub 메타데이터 정리나 release 운영 같은 저장소 성숙도는 아직 초기 단계다. 넷째, "맥킨지 스타일"이라는 강한 미학적 제약은 범용 deck generator라기보다 특정 장르에 최적화된 도구임을 뜻한다.

그럼에도 방향성은 꽤 선명하다. 앞으로 업무용 문서 자동화에서 중요한 것은 모델이 글을 잘 쓰는가보다, 조직이 반복적으로 쓰는 산출물 형식을 얼마나 잘 캡슐화하고, 그 형식 선택을 얼마나 에이전트 절차로 전환할 수 있느냐일 가능성이 크다. `mckinsey-pptx`는 그 점에서 단순 슬라이드 템플릿 저장소가 아니라, "컨설팅 덱 제작을 위한 로컬 실행형 프레젠테이션 에이전트"라는 정체성이 더 정확해 보인다.

Sources: https://github.com/seulee26/mckinsey-pptx, https://github.com/seulee26/mckinsey-pptx/blob/main/README.md, https://github.com/seulee26/mckinsey-pptx/blob/main/mckinsey_pptx/agent/CATALOG.md, https://github.com/seulee26/mckinsey-pptx/blob/main/agents/mckinsey-slide-agent.md, https://github.com/seulee26/mckinsey-pptx/blob/main/commands/mckinsey-deck.md