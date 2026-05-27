---
title: "getdesign.md는 DESIGN.md를 에이전트용 디자인 시스템 마켓플레이스로 만든다"
date: "2026-05-07T15:11:03"
description: "getdesign.md는 Google Stitch의 DESIGN.md 포맷을 70여 개 브랜드 레퍼런스, 웹 프리뷰, 설치 명령, 저장/북마크 지표, 프라이빗 요청 흐름까지 갖춘 카탈로그로 감싸면서 '디자인 감각을 파일로 배포하는 시장'이 실제 제품 카테고리가 될 수 있음을 보여준다."
author: "Sangmin Lee"
category: "ai-products-strategy"
tags:
  - Agents
  - Design Systems
  - Developer Tools
  - UI Engineering
  - DESIGN.md
draft: false
---

생성형 코딩 에이전트가 점점 더 많은 UI를 만들게 되면서 병목은 모델의 순수 생성 능력보다 **어떤 시각 언어를 얼마나 일관되게 주입할 수 있느냐**로 이동하고 있다. 아무 지시 없이 랜딩 페이지를 만들라고 하면 비슷한 그라디언트, 둥근 카드, 익숙한 CTA 조합으로 수렴하는 이유도 여기에 있다. 에이전트가 “좋은 디자인”을 평균치로만 학습했지, 특정 브랜드의 리듬과 제약을 작업 전 맥락으로 고정받지 못했기 때문이다.

`getdesign.md`는 이 문제를 꽤 직설적으로 푼다. Google Stitch가 제안한 `DESIGN.md` 포맷을 중심에 두고, Vercel·Stripe·Figma·Claude·Linear 같은 브랜드에서 추출한 시각 언어를 바로 복사·설치·미리보기 할 수 있는 카탈로그를 만든다. 단순 레퍼런스 모음이 아니라, **에이전트가 읽을 수 있는 디자인 시스템 문서를 웹 제품으로 유통하는 표준화된 배포면**에 가깝다.

내가 보기엔 이 사이트의 핵심은 “예쁜 디자인 예시를 모아놨다”가 아니다. 더 중요한 점은 디자인 레퍼런스를 이미지나 피그마 파일이 아니라, 에이전트가 바로 읽는 텍스트 자산으로 취급한다는 데 있다. 즉 사람을 위한 inspiration gallery가 아니라, **코딩 에이전트의 입력 컨텍스트를 거래 가능한 파일 단위로 패키징한 marketplace**라는 해석이 더 정확하다.

![getdesign.md og image](https://getdesign.md/api/og/default)

## 무엇을 해결하려는가

`getdesign.md`가 겨냥하는 문제는 “AI가 UI를 만들긴 하지만 늘 비슷해 보인다”는 지점이다. 공식 소개 페이지인 `What is DESIGN.md?`는 이 문제를 매우 노골적으로 설명한다. 에이전트는 대개 평균적인 SaaS 미감으로 수렴하고, 특정 브랜드가 왜 그림자보다 보더를 선호하는지, 왜 타이포의 자간을 그 정도로 조이는지, 왜 어떤 회사는 강한 그라디언트를 피하는지 같은 맥락을 기본적으로 갖고 있지 않다. 이 때문에 사용자는 매번 프롬프트 안에서 스타일을 길게 설명하거나, 결과물을 반복 수정하는 비용을 치르게 된다.

여기서 `DESIGN.md`는 단순한 토큰 파일이 아니라 디자인 의도를 담은 텍스트 문서로 제시된다. 색상, 타이포, spacing, 컴포넌트 규칙뿐 아니라 “왜 이런 선택을 하는가”까지 한 파일에 담아 에이전트가 읽게 한다. `getdesign.md`는 바로 이 파일을 브랜드별 starting point로 공급한다. 홈페이지와 README 기준으로 사용자는 카탈로그에서 원하는 스타일을 고르고, `npx getdesign@latest add <site>`로 프로젝트 루트에 가져온 뒤, 에이전트에게 `DESIGN.md`를 기준으로 UI를 만들라고 지시하면 된다.

즉 문제 정의는 단순히 디자인 자산 부족이 아니다. 더 정확히는 **에이전트에게 전달되는 디자인 문맥이 구조화돼 있지 않다**는 것이다. `getdesign.md`는 이 문맥을 설치 가능한 텍스트 포맷으로 고정하고, 여기에 프리뷰·저장·북마크·프라이빗 요청 흐름을 붙여 배포 가능한 제품으로 만든다.

## 핵심 아이디어 / 구조 / 동작 방식

`getdesign.md`의 구조는 세 층으로 읽을 수 있다.

첫째는 **포맷 층**이다. 이 프로젝트의 기반은 Google Stitch가 소개한 `DESIGN.md` 사양이다. 사이트의 설명대로 이 파일은 YAML front matter와 canonical markdown sections를 결합해, 토큰 값과 디자인 rationale을 한 문서 안에 담는다. 즉 JSON 디자인 토큰만 주는 것도 아니고, Figma 캡처를 던지는 것도 아니다. 에이전트가 바로 읽고 추론할 수 있는 자연어+구조화 토큰 문서가 핵심 인터페이스다.

둘째는 **카탈로그 층**이다. 홈페이지와 `awesome-design-md` 공개 저장소는 이를 8개 카테고리의 브랜드 레퍼런스로 정리한다. AI/LLM, Developer Tools, Backend/DevOps, Productivity, Design/Creative, Fintech, E-commerce, Media/Consumer Tech, Automotive 등으로 분류된 70여 개 디자인 시스템이 있고, 각 항목은 `DESIGN.md`, preview, 요약 설명, 설치 명령으로 연결된다. README는 각 사이트 폴더에 `DESIGN.md`, `preview.html`, `preview-dark.html`가 들어 있다고 설명하고, 실제 공개 저장소의 각 서브디렉터리도 이런 파일 구조를 따른다.

셋째는 **제품화 층**이다. 개별 항목 페이지를 열어 보면 단순 다운로드 링크가 아니라 사용량 인터페이스가 붙는다. 예를 들어 Claude 항목 페이지는 `npx getdesign@latest add claude` 설치 명령, 저장 버튼, installs/bookmarked 수치, live preview, light/dark 전환, 그리고 “official design system이 아니라 curated starting point”라는 경고 문구를 함께 제공한다. 즉 `getdesign.md`는 레퍼런스를 그냥 보여주는 게 아니라, **바로 설치하고 에이전트 워크플로우에 넣게 만드는 실행 표면**을 제공한다.

![Sample design entry og image](https://getdesign.md/api/og/claude/design-md)

| 레이어        | 공개 자료에서 확인되는 구성                                             | 역할                                           |
| ------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| Format layer  | Google Stitch `DESIGN.md` spec, YAML + markdown rationale               | 에이전트가 읽는 디자인 언어 자체를 정의        |
| Catalog layer | 70~71개 수준의 브랜드별 `DESIGN.md` 모음, 카테고리 분류                 | 특정 미감을 빠르게 선택하는 탐색면 제공        |
| Product layer | `npx getdesign@latest add <site>`, save/bookmark, preview, request flow | 탐색을 설치·반복 사용 가능한 워크플로우로 전환 |

좀 더 흥미로운 부분은 이 사이트가 “브랜드 스타일을 복제한다”는 표현을 피하면서도, 실질적으로는 매우 정교한 imitation infrastructure를 만든다는 점이다. Claude 샘플 `DESIGN.md`를 보면 색상 팔레트, typography hierarchy, rounded scale, spacing scale, 버튼/네비게이션/hero band 같은 컴포넌트 레벨 규칙이 꽤 세밀하게 정의돼 있다. 즉 추상적인 “클로드 느낌”이 아니라, **에이전트가 구체적 UI 결정을 내릴 수 있을 정도로 분해된 디자인 문맥**을 제공한다.

## 공개된 근거에서 확인되는 점

가장 직접적인 근거는 `VoltAgent/awesome-design-md` 저장소다. 조회 시점 기준 이 저장소는 약 72.3k stars, 8.8k forks를 보이고 있고, MIT 라이선스를 단다. README는 `DESIGN.md count 71`을 전면 배지로 내세우며, `getdesign.md`를 이 저장소의 웹앱 버전이라고 설명한다. 실제 루트 구조에는 `design-md/` 디렉터리가 있고, 그 하위에 브랜드별 폴더가 정리돼 있으며, 각 항목은 `DESIGN.md`와 보조 파일을 가진다.

다만 카탈로그 수치는 완전히 단일하지 않다. 홈페이지와 README는 모두 71개를 강조하지만, GitHub contents API로 `design-md/` 하위 공개 디렉터리를 조회했을 때는 70개가 잡혔다. 이는 카탈로그가 빠르게 갱신 중이거나, 웹앱의 노출 상태와 저장소 공개 트리가 완전히 동일하지 않을 수 있음을 시사한다. 숫자 차이는 작지만, 이 프로젝트가 고정 문서보다는 **운영 중인 카탈로그 제품**이라는 신호로 읽힌다.

개별 상세 페이지는 단순 문서 호스팅을 넘어선다. Claude 예시 페이지에는 `INSTALLS 9.2K`, `BOOKMARKED 1K`, `SAVE` 버튼, light/dark preview 토글, 라이브 프리뷰 iframe, 그리고 “official design system이 아니다”라는 면책 문구가 함께 붙는다. 즉 이 사이트는 단순 README 미러가 아니라, **어떤 디자인 레퍼런스가 실제로 얼마나 소비되는지 계량 가능한 distribution surface**를 만들고 있다.

또 하나 중요한 점은 공개 범위의 비대칭성이다. 사이트의 structured data에는 `VoltAgent/design-md-web` 저장소가 `sameAs`로 언급되지만, 공개 GitHub API로 해당 저장소를 조회하면 404가 반환됐다. 반면 카탈로그 데이터 저장소인 `awesome-design-md`는 공개돼 있다. 즉 사용자는 디자인 파일 컬렉션 자체는 볼 수 있지만, **웹앱 구현이나 생성/운영 파이프라인은 완전히 공개되지 않은 상태**로 보인다. 오픈 카탈로그와 비공개 제품 레이어를 분리하는 전형적인 productized open-core 패턴에 가깝다.

마지막으로 리드 생성 흐름도 명확하다. 홈페이지 상단에는 `Request private DESIGN.md`, `Sign in`, `Feature your brand`, `5.5M+ monthly views` 문구가 전면 배치돼 있다. 이것은 사이트가 단순 오픈소스 showcase를 넘어, 맞춤 추출·브랜드 노출·유입 전환까지 포함한 **디자인 시스템 리드젠 비즈니스**를 의식하고 있음을 보여준다. 물론 `5.5M+ monthly views`는 페이지 자체가 제시하는 마케팅 수치일 뿐, 별도 공개 근거로 검증된 수치는 아니다.

| 공개 근거                            | 확인된 내용                                             | 해석                                                      |
| ------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------- |
| 홈페이지 / `What is DESIGN.md?`      | `DESIGN.md`를 에이전트가 읽는 디자인 문서로 설명        | 프롬프트가 아니라 파일 기반 문맥 주입을 표준화하려는 시도 |
| `awesome-design-md` GitHub 메타      | 72.3k stars, 8.8k forks, MIT                            | 초기 실험을 넘어 강한 유통력을 가진 카탈로그              |
| README + contents API                | README/홈페이지는 71개, 공개 디렉터리 조회는 70개       | 고정 아카이브보다 빠르게 갱신되는 운영형 catalog 신호     |
| 상세 항목 페이지                     | 설치 명령, preview, installs/bookmarks, curated warning | 문서 저장소가 아니라 distribution/usage surface           |
| 사이트 structured data + GitHub 조회 | `design-md-web` 참조는 있으나 public repo 조회 404      | 데이터는 공개, 제품 구현은 비공개인 open-core 성격        |

## 실무 관점에서의 해석

내가 보기에 `getdesign.md`의 가장 큰 의미는 디자인 시스템 자체보다도 **디자인 문맥의 배포 방식**을 바꾼다는 점이다. 예전에는 “Vercel 느낌으로 만들어줘”, “Linear처럼 보이게 해줘”가 구두 지시나 moodboard 수준에 머물렀다. 이제는 그런 레퍼런스가 `DESIGN.md`라는 파일로 굳어지고, 패키지처럼 설치되며, 에이전트 입력 컨텍스트의 일부로 반복 재사용된다. 즉 디자인 감각이 에셋이 아니라 **프로그래머블한 텍스트 자산**으로 바뀌는 것이다.

이 접근은 AI 네이티브 제품 팀에 특히 강하다. 프론트엔드 엔지니어, PM, 프로토타이핑 에이전트가 같은 파일을 공유할 수 있고, 새로운 프로젝트를 시작할 때 프롬프트를 다시 길게 작성하지 않아도 된다. 또한 `preview.html`과 항목별 샘플 페이지가 있다는 것은 단지 파일을 배포하는 데서 멈추지 않고, 사람이 검수할 수 있는 시각적 확인 루프도 같이 제공한다는 뜻이다.

반면 한계도 분명하다. 첫째, 이 카탈로그는 어디까지나 “공식 디자인 시스템”이 아니라 curated starting point다. 상세 페이지가 이를 분명히 경고하는 이유도 여기에 있다. 둘째, 실제 웹앱 구현과 추출 파이프라인이 공개되지 않았기 때문에, 사용자는 결과 파일은 검토할 수 있어도 **어떤 수집/정제 기준으로 이 디자인 문서를 만들었는지**를 완전히 투명하게 보긴 어렵다. 셋째, 브랜드 스타일을 텍스트 문서로 요약하는 과정은 필연적으로 해석을 동반하므로, 미세한 상호작용이나 motion language까지 충실히 보존한다고 보기는 어렵다.

그럼에도 방향성은 매우 설득력 있다. 앞으로 에이전트 시대의 UI 경쟁력은 단순히 더 많은 컴포넌트를 갖는 것보다, **어떤 미감을 얼마나 재현 가능하게 컨텍스트화할 수 있느냐**에 달려 있을 가능성이 크다. 그런 의미에서 `getdesign.md`는 디자인 inspiration 사이트가 아니라, 에이전트용 디자인 시스템의 설치형 마켓플레이스이자 배포 인프라로 보는 편이 맞다.

Sources: https://getdesign.md/, https://getdesign.md/what-is-design-md, https://getdesign.md/claude/design-md, https://github.com/VoltAgent/awesome-design-md, https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/README.md, https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/claude/DESIGN.md
