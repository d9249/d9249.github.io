---
title: "Future Slide Skill은 슬라이드 생성을 4단계 파이프라인으로 묶는다"
date: "2026-05-10T02:47:43"
description: "bytonylee/future-slide-skill은 참조 슬라이드에서 DESIGN.md를 추출하고, 덱 계획과 페이지별 프롬프트, 순차 이미지 생성을 분리해 GPT 계열 모델의 흔한 슬라이드 생성 실패를 줄이려는 Codex 스킬 번들이다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agents
  - Codex
  - Presentation AI
  - Workflow Automation
  - Design Systems
draft: false
---

AI로 슬라이드를 만드는 작업은 겉보기보다 훨씬 불안정하다. "이 자료를 바탕으로 예쁜 발표자료를 만들어줘"라고 한 번에 요청하면, 모델은 초반에는 그럴듯한 결과를 내지만 곧 같은 실패를 반복한다. 참고 이미지의 디자인 시스템을 제대로 뽑기 전에 내용을 쓰기 시작하고, 자료 분석과 덱 전략을 섞으며, 본문 슬라이드마다 레이아웃과 밀도가 흔들린다. 결국 결과물은 하나의 덱이라기보다 서로 다른 템플릿을 이어 붙인 이미지 묶음처럼 보이기 쉽다.

`bytonylee/future-slide-skill`은 이 문제를 "더 긴 프롬프트"가 아니라 "단계 분리"로 푼다. 이 저장소는 참조 슬라이드 이미지, 사용자 파일, 덱 요청을 받아 슬라이드 생성을 네 개의 Codex 스킬로 나눈다. 먼저 디자인 언어를 `DESIGN.md`로 추출하고, 그 다음 덱의 논리와 근거 배치를 `slide_plan.json`으로 정리한 뒤, 페이지별 생성 프롬프트를 `slide_prompts.json`으로 만들고, 마지막에 슬라이드 이미지를 `page_1.png`부터 순서대로 생성한다.

중요한 점은 이 프로젝트가 슬라이드 제작을 단순한 이미지 생성 문제가 아니라, 에이전트가 지켜야 할 작업 계약의 문제로 본다는 것이다. 좋은 슬라이드 결과물은 모델의 미감만으로 나오지 않는다. 디자인 권한과 콘텐츠 권한을 분리하고, 계획이 끝나기 전에는 프롬프트를 쓰지 못하게 하며, 각 페이지가 같은 시각 언어를 공유하도록 강제해야 한다. Future Slide Skill의 의미는 바로 그 규율을 `SKILL.md` 패키지로 만든 데 있다.

![Future Slide Skill의 4단계 워크플로 다이어그램](/images/blog/future-slide-skill-flow-ko.png)

## 무엇을 해결하려는가

슬라이드 생성에서 가장 흔한 실패는 모델이 너무 빨리 최종 산출물로 뛰어든다는 점이다. 사용자가 참고 슬라이드와 보고서 PDF를 함께 주면, 모델은 디자인을 분석하는 동시에 내용을 요약하고, 요약한 내용을 다시 페이지 구성으로 바꾸고, 곧바로 이미지까지 만들려 한다. 이 과정에서 어느 단계가 근거이고 어느 단계가 추론인지 흐려진다.

Future Slide Skill의 README는 이 실패 패턴을 꽤 명확히 적고 있다. 단일 프롬프트는 테마 추출 전에 슬라이드를 쓰기 시작하고, 디자인 분석과 덱 전략을 섞으며, 서사 구조 없이 페이지 프롬프트를 만들고, 본문 슬라이드 간 레이아웃 일관성을 잃는다. 특히 참고 이미지에 보이는 텍스트 자체에 과적합하고, 정작 그 이미지가 가진 배치·색·타이포그래피·차트 언어를 재사용 가능한 규칙으로 분리하지 못하는 문제가 크다.

이 저장소의 접근은 반대 방향이다. 참조 이미지는 디자인 권한을 갖고, 사용자 파일과 요청은 콘텐츠 권한을 갖는다. 참조 이미지는 색상, 여백, 헤더/본문/푸터 리듬, 표와 차트의 처리 방식을 결정한다. 반면 사용자 파일은 슬라이드가 말해야 할 주장, 근거, 순서, 청중을 결정한다. 두 권한을 섞지 않는 것이 이 프로젝트의 핵심 설계 원리다.

## 핵심 아이디어 / 구조 / 동작 방식

저장소는 실제로 다섯 개의 스킬 폴더를 포함한다. `future-slide`는 오케스트레이터에 가깝고, 실제 작업은 `gpt-slide-design`, `gpt-slide-plan`, `gpt-slide-prompt`, `gpt-slide-generate` 네 단계가 나눠 맡는다. 이 네 단계는 단순한 파일명 구분이 아니라, 각 단계가 받아야 하는 입력과 내야 하는 출력, 그리고 절대로 해서는 안 되는 행동을 따로 정의한다.

첫 단계인 `gpt-slide-design`은 참조 슬라이드에서 `DESIGN.md`를 추출한다. 이 단계는 OCR이나 내용 요약이 아니다. `SKILL.md`는 색상 체계, 타이포그래피 위계, 헤더/본문/푸터 구조, 타이틀·본문·엔드 페이지 흐름, 표·차트·카드·아이콘 처리, 반복 가능한 레이아웃 패밀리와 금지 패턴을 관찰하도록 요구한다. 또한 직접 보이는 것과 합리적으로 추론한 것을 구분하라고 명시한다.

두 번째 `gpt-slide-plan`은 덱의 이야기 구조를 만든다. 여기서는 `DESIGN.md`가 시각적 제약이고, 사용자 파일과 요청이 사실과 목적의 근거가 된다. 핵심은 파일 업로드 순서대로 슬라이드를 나열하지 않는 것이다. 대신 맥락, 문제, 핵심 인사이트, 근거, 시사점, 선택지, 로드맵 같은 설득 흐름으로 페이지 순서를 설계한다. 표가 필요한지, 차트가 필요한지, 비교 매트릭스가 필요한지, 프로세스 다이어그램이 필요한지도 이 단계에서 먼저 결정한다.

세 번째 `gpt-slide-prompt`는 승인된 계획을 페이지별 생성 프롬프트 JSON으로 바꾼다. 이 단계는 덱을 새로 디자인하는 곳이 아니라, 이미 정해진 디자인 시스템과 서사 계획을 실제 생성기가 오해하지 않도록 명시화하는 곳이다. 각 슬라이드마다 page family, layout family, header/body/footer zoning, content blocks, chart/table/icon/diagram rules, anti-patterns를 적도록 요구한다. 즉 프롬프트를 "멋지게 만들어줘"가 아니라, 생성기가 따라야 할 상세한 렌더링 계약으로 바꾼다.

마지막 `gpt-slide-generate`는 `DESIGN.md`와 `slide_prompts.json`을 읽고 이미지를 한 장씩 생성한다. 이 스킬은 모든 페이지를 한꺼번에 뽑지 말고, 페이지 번호 순서대로 생성한 뒤 매번 검사하고, 최종 선택 이미지를 작업 폴더에 `page_1.png`, `page_2.png` 같은 안정된 이름으로 저장하라고 요구한다. 여기서도 핵심은 결과물이 캐시에 남는 것이 아니라 프로젝트 안의 명시적 파일로 남아야 한다는 점이다.

| 단계 | 입력 | 출력 | 역할 |
|---|---|---|---|
| `gpt-slide-design` | 참조 슬라이드 이미지 또는 참고 덱/PDF | `DESIGN.md` | 디자인 언어와 레이아웃 규칙 추출 |
| `gpt-slide-plan` | `DESIGN.md`, 사용자 파일, 덱 목표 | `slide_plan.json` | 이야기 흐름, 페이지 순서, 근거 배치 설계 |
| `gpt-slide-prompt` | `DESIGN.md`, `slide_plan.json` | `slide_prompts.json` | 페이지별 생성 프롬프트와 제약 조건 작성 |
| `gpt-slide-generate` | `DESIGN.md`, `slide_prompts.json` | `page_*.png` | 슬라이드 이미지를 순차 생성·검수·저장 |

## 공개된 근거에서 확인되는 점

GitHub API 기준으로 이 저장소는 TypeScript 중심 프로젝트이며, Apache-2.0 라이선스로 공개되어 있다. 조회 시점의 공개 지표는 약 69 stars, 11 forks, open issues 0개다. 기본 브랜치는 `main`이고, 최근 push는 2026년 5월 5일로 확인된다. 태그는 `0.0.1`, `0.0.2`가 있으며, 최신 릴리스는 `0.0.2 — Landing site, design system, and AI discovery`다.

루트 구조도 프로젝트의 성격을 잘 보여준다. 루트에는 영어/한국어 README, Apache 라이선스, `skills/`, `templates/`, `public/`, `site/`가 있다. `skills/`에는 실제 Codex 스킬들이 들어 있고, `templates/DESIGN_TEMPLATE.md`는 `DESIGN.md`가 어떤 세부 항목을 가져야 하는지 보여준다. `site/`는 Vite 6, React 19, TypeScript, Tailwind CSS v4, Bun 기반의 공식 랜딩 페이지다. 즉 이 저장소는 단순 스킬 파일 몇 개만 올린 것이 아니라, 설치 문서·랜딩 페이지·LLM용 컨텍스트 파일·시각 다이어그램까지 함께 관리하는 배포 패키지에 가깝다.

최신 릴리스 `0.0.2`의 본문도 흥미롭다. 릴리스 노트는 네 개 스킬의 동작 자체는 바뀌지 않았고, 공식 랜딩 페이지와 디자인 문서, SEO/AEO 표면이 추가된 릴리스라고 설명한다. 구체적으로 `future-slide.tonylee.im`, 영어/한국어 i18n, 라이트/다크 테마, `site/DESIGN.md`, `/llms.txt`, `/robots.txt`, `/sitemap.xml`, JSON-LD 구조화 데이터가 포함됐다. 스킬 자체뿐 아니라 AI 크롤러와 검색·인용 표면까지 고려한 패키징이라는 점이 드러난다.

공식 사이트 역시 이 방향을 강화한다. 페이지는 Future Slide를 "Disciplined slide generation, one stage at a time"으로 설명하고, 네 단계 흐름을 `DESIGN.md → slide_plan.json → slide_prompts.json → page_1.png … page_N.png`의 artifact chain으로 제시한다. 특히 `/llms.txt`는 이 프로젝트를 "workflow discipline layer for slide generation"이라고 못박고, hosted slide editor나 SaaS가 아니라고 선을 긋는다. 이 문장은 프로젝트를 해석할 때 중요하다. Future Slide는 슬라이드 앱이 아니라, 에이전트가 슬라이드 제작을 망치지 않도록 하는 실행 규율 레이어다.

다만 작은 포장상의 불일치도 보인다. 사용자가 접근하는 GitHub URL은 `bytonylee/future-slide-skill`이지만, README의 설치 예시와 사이트의 `/llms.txt`에는 `jyoung105/future-slide-skill`이 함께 등장한다. 이것이 계정명 변경, 미러, 문서 업데이트 지연 중 무엇인지는 공개 근거만으로 단정하기 어렵다. 다만 에이전트 스킬처럼 설치 명령이 중요한 저장소에서는 이런 owner 표기 차이가 실제 설치 경험에 영향을 줄 수 있으므로, 사용자는 현재 접근 가능한 canonical repo와 README의 설치 명령을 함께 확인하는 편이 안전하다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub API | TypeScript, Apache-2.0, 약 69 stars / 11 forks, 태그 `0.0.1`, `0.0.2` | 초기 단계지만 명시적 버전과 라이선스를 가진 공개 스킬 번들 |
| README / README.ko | 네 단계 스킬 흐름과 설치 방법 제시 | 단일 프롬프트 대신 단계별 강제 워크플로를 강조 |
| `skills/` | `future-slide`, `gpt-slide-design`, `gpt-slide-plan`, `gpt-slide-prompt`, `gpt-slide-generate` | 오케스트레이터와 실행 단계가 분리된 구조 |
| `templates/DESIGN_TEMPLATE.md` | 색상, 타이포그래피, 레이아웃, 컴포넌트, 데이터 시각화 규칙 템플릿 | `DESIGN.md`를 단순 스타일 메모가 아니라 재사용 가능한 설계 명세로 다룸 |
| `site/` / `/llms.txt` | 랜딩 페이지, i18n, AI 크롤러용 컨텍스트, artifact chain 명시 | 스킬 배포를 사람과 에이전트 양쪽에 맞춘 패키지로 설계 |

## 실무 관점에서의 해석

Future Slide Skill의 가장 큰 의미는 슬라이드 생성을 "한 번의 창의적 생성"에서 "검증 가능한 중간 산출물의 체인"으로 바꾼다는 데 있다. `DESIGN.md`, `slide_plan.json`, `slide_prompts.json`, `page_*.png`가 순서대로 남으면, 사용자는 실패한 결과를 더 잘 디버깅할 수 있다. 디자인 추출이 틀렸는지, 덱 계획이 약한지, 페이지 프롬프트가 모호한지, 이미지 생성 단계가 규칙을 어겼는지 분리해서 볼 수 있기 때문이다.

이 접근은 특히 리서치 리포트, 투자 분석, 컨설팅형 요약, 내부 전략 보고처럼 표·차트·각주·출처·근거 배치가 중요한 덱에서 가치가 크다. 단순 마케팅 슬라이드는 이미지 모델의 미감만으로 어느 정도 버틸 수 있지만, 분석형 슬라이드는 시각적 일관성과 정보 밀도, 근거 배치가 조금만 흔들려도 설득력이 떨어진다. Future Slide Skill은 이런 덱을 위해 "예쁘게"보다 "순서를 지키게" 만드는 쪽에 초점을 둔다.

동시에 이 프로젝트는 에이전트 시대의 디자인 자동화가 어디로 가야 하는지도 보여준다. 앞으로 슬라이드 제작 자동화의 핵심은 더 화려한 템플릿이 아니라, 디자인 시스템과 콘텐츠 시스템을 분리하고, 둘을 다시 페이지 단위 생성 계약으로 결합하는 능력일 가능성이 크다. 이 점에서 Future Slide Skill은 작은 개인 저장소처럼 보이지만, 사실은 에이전트 워크플로 설계의 꽤 실용적인 패턴을 담고 있다.

물론 한계도 분명하다. 현재 공개 저장소는 대규모 슬라이드 생성 플랫폼이라기보다 Codex 스킬 번들에 가깝다. 따라서 실제 결과 품질은 사용하는 이미지 생성 모델, Codex의 스킬 실행 품질, 입력 자료의 구조화 정도, 사용자가 제공하는 참조 슬라이드의 품질에 크게 좌우될 것이다. 또한 설치 명령의 owner 표기 차이처럼 패키징 문서가 조금이라도 어긋나면, 초심자에게는 마찰이 생길 수 있다.

그럼에도 이 저장소가 제시하는 방향은 선명하다. AI가 슬라이드를 잘 만들게 하려면, 모델에게 더 많은 자유를 주는 것보다 오히려 중간 산출물을 강제하고 책임을 나눠야 한다. Future Slide Skill은 그 원칙을 `SKILL.md` 기반의 재사용 가능한 작업 단위로 만든 사례다. 에이전트를 단순 생성기가 아니라, 디자인 추출자·전략가·프롬프트 엔지니어·생산 오퍼레이터로 역할 분리해 쓰려는 팀이라면 충분히 참고할 만하다.

Sources: https://github.com/bytonylee/future-slide-skill, https://future-slide.tonylee.im, https://github.com/bytonylee/future-slide-skill/releases/tag/0.0.2
