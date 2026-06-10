---
title: "공통 UI 컴포넌트 테스트 여정: 스냅샷에서 시각적 회귀까지"
date: "2026-06-10T22:18:00"
description: "if(kakao)2020 발표 ‘UI 테스트를 위한 여정’을 바탕으로, 카카오의 사내 어드민 UI 컴포넌트가 Storybook 스냅샷 테스트에서 시각적 회귀 테스트와 Jenkins 기반 PR 자동화로 확장된 과정을 정리한다."
author: "Sangmin Lee"
category: "evaluation-benchmarks"
tags:
  - YouTube
  - if(kakao)2020
  - UI Testing
  - Storybook
  - Visual Regression
  - Jenkins
image: "/images/blog/kakao-ui-testing-journey-hero.webp"
draft: false
---

공통 UI 컴포넌트를 운영할 때 가장 곤란한 버그는 “기능은 그대로인데 화면이 조금 깨진” 경우다. 로직 버그는 유닛 테스트나 코드 리뷰에서 잡힐 수 있지만, CSS·마크업·상태 조합이 만드는 미세한 화면 변화는 사람이 매번 Storybook을 열어 확인하지 않는 한 놓치기 쉽다.

카카오의 if(kakao)2020 세션 `UI 테스트를 위한 여정`은 이 문제를 꽤 현실적으로 다룬다. 발표자는 사내 어드민 페이지 개발을 쉽게 만들기 위한 Admin UI 컴포넌트에서 출발해, Storybook 기반 스냅샷 테스트와 시각적 회귀 테스트를 붙이고, 마지막에는 Jenkins와 GitHub PR 라벨을 이용해 자동화 파이프라인으로 묶는 과정을 보여준다.

흥미로운 점은 “테스트를 붙이면 끝”이 아니라는 것이다. 발표의 대부분은 도입 자체보다 도입 뒤에 나온 실패 조건들—React hook, ref, monorepo alias, 랜덤 데이터, Puppeteer in Docker, 한글 폰트, 로컬 이미지 신뢰도—을 어떻게 처리했는지에 할애된다. 그래서 이 발표는 프론트엔드 테스트 도구 소개라기보다, **공통 컴포넌트의 변경을 제품 운영 프로세스 안에서 어떻게 추적할 것인가**에 대한 사례로 읽는 편이 더 유익하다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-ui-testing-journey-hero.webp"
    alt="UI 테스트를 위한 여정 hero graphic showing Storybook, snapshot, visual regression, and Jenkins CI workflow"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    이 글의 핵심 흐름은 단순하다. Storybook으로 컴포넌트 상태를 모으고, 스냅샷으로 DOM 변화를 잡고, 시각적 회귀 테스트로 실제 화면 차이를 비교한 뒤, CI에서 PR 단위로 자동화한다.
  </figcaption>
</figure>

## 무엇을 다루는 영상인가

영상은 kakao tech 채널에 올라온 if(kakao)2020 발표이며, YouTube 설명 기준 제목은 `UI 테스트를 위한 여정`, 발표자는 권태민 Tamm / 카카오 Kakao front-end developer다. 설명에는 “공통 UI 컴포넌트의 변경을 추적하기 위해 UI 테스트를 적용하면서 경험한 다양한 이슈”를 소개한다고 되어 있다.

YouTube에는 별도의 GitHub 저장소나 슬라이드 링크가 붙어 있지 않았다. 카카오TV에도 같은 세션의 메타데이터가 검색되지만, 공개적으로 확인 가능한 상세 자료는 제한적이다. 따라서 아래 정리는 YouTube 메타데이터, 자동 자막, 영상 화면의 슬라이드에 근거한다. 자동 자막에는 일부 용어 오인식이 있으므로, 도구명과 구조는 슬라이드 맥락과 일반적인 프론트엔드 생태계 용어를 함께 대조했다.

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/zRsQck8uP-s"
    title="Video: [ifkakao2020] UI 테스트를 위한 여정"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"
  ></iframe>
</div>

발표의 배경은 카카오 내부의 사내 어드민 페이지다. 외부 사용자에게 직접 노출되지 않는 어드민은 상대적으로 UI 품질 관리가 후순위로 밀리기 쉽고, 팀마다 프론트엔드 숙련도나 디자인 지원 수준도 다를 수 있다. 발표팀은 이런 상황에서 사내 디자인 시스템 IDS를 기반으로 React/Vue 환경에서 쉽게 쓸 수 있는 Admin UI 컴포넌트를 만들고 있었다.

문제는 공통 컴포넌트의 성격에서 나온다. 한 컴포넌트가 여러 사내 서비스에 퍼져 있으면, 작은 변경 하나가 다른 파트의 화면을 깨뜨릴 수 있다. 코드 로직은 테스트할 수 있지만, “화면이 깨졌는가”는 단순 유닛 테스트만으로는 잘 드러나지 않는다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-ui-testing-admin-component.webp"
    alt="Slide showing Kakao internal admin UI component example for solving admin page development concerns"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    발표 초반의 Admin UI 컴포넌트 예시. 핵심 문제는 컴포넌트를 한 번 잘 만드는 것이 아니라, 계속 바뀌는 공통 컴포넌트가 다른 서비스 화면을 깨뜨리지 않도록 추적하는 것이다. 출처: kakao tech YouTube, 01:20 부근.
  </figcaption>
</figure>

## 첫 번째 선택: Storybook 위에 스냅샷 테스트를 얹다

발표팀의 첫 선택은 스냅샷 테스트였다. 스냅샷 테스트는 이전 렌더링 결과와 현재 렌더링 결과를 비교해 의도하지 않은 변경을 감지한다. React 기준으로는 `react-test-renderer`가 컴포넌트를 실제 DOM에 마운트하지 않고 순수 JavaScript 객체 형태로 렌더링하고, Jest가 그 결과를 스냅샷으로 저장·비교한다.

Admin UI 컴포넌트에는 이미 Storybook이 적용되어 있었다. 따라서 발표팀은 개별 테스트를 일일이 작성하기보다, Storybook에 등록된 story들을 테스트 대상으로 재사용하려 했다. 여기서 선택한 도구가 Storyshots다. Storybook에 존재하는 story를 읽어 Jest 스냅샷 테스트로 돌려주는 방식이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-ui-testing-snapshot-test.webp"
    alt="Slide titled snapshot test showing Jest snapshot output for UI components"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    스냅샷 테스트는 컴포넌트의 렌더링 결과를 저장하고 이후 변경과 비교한다. 설정 자체는 간단하지만, 실제 컴포넌트 구조와 Storybook 설정을 만나면 여러 예외가 나온다. 출처: kakao tech YouTube, 02:35 부근.
  </figcaption>
</figure>

처음에는 설정이 매우 쉬워 보였다. Storyshots addon과 `react-test-renderer`를 설치하고, Jest가 인식할 테스트 파일을 몇 줄 작성하면 Storybook story가 자동으로 스냅샷 대상이 된다. 하지만 발표자가 강조하듯, 진짜 여정은 여기서 시작된다.

첫 번째 문제는 React hook이었다. 당시 Storyshots가 story를 읽어올 때 `React.createElement`로 감싸지 않아 hook을 쓰는 story에서 오류가 났다. 발표에서는 Storybook 쪽에는 이미 반영된 수정이 Storyshots 쪽에는 빠져 있었고, `preview.js`에서 decorator로 story를 감싸 해결했다고 설명한다. 이후 Storybook 6.x 계열에서는 내부적으로 처리되어 별도 작업이 줄었다고 덧붙인다.

두 번째 문제는 `ref`였다. checkbox나 input처럼 내부에서 `ref`를 쓰는 컴포넌트가 `react-test-renderer`에서 깨졌다. 이유는 명확하다. `react-test-renderer`는 실제 React DOM을 마운트하지 않으므로 연결된 `ref`를 읽을 수 없다. React 문서의 `createNodeMock` 같은 우회도 있지만, Storyshots를 통해 간접적으로 renderer를 쓰는 구조에서는 적용이 쉽지 않았다.

발표팀은 결국 renderer를 교체했다. 마크업을 최대한 건드리지 않는 내부 개발 방향을 유지하기 위해, Storyshots의 renderer 교체 옵션을 이용해 Enzyme 기반으로 바꿨고 정상 동작을 확인했다.

## 설정의 어려움은 도구보다 프로젝트 구조에서 나온다

스냅샷 테스트의 다음 장애물은 프로젝트 구조였다. Admin UI 컴포넌트는 여러 프레임워크를 지원하기 위한 monorepo 형태였고, core package가 date picker나 time picker 같은 공통 로직을 제공했다. React package는 이 core package와 상위 계층의 스타일/alias를 참조하고 있었다.

문제는 Jest가 webpack alias를 자동으로 알지 못한다는 점이다. 별도 alias 설정을 해주어야 하는데, `rootDir`이 설정 파일 위치 기준으로 잡히면 상위 디렉터리의 core package나 style alias에 접근하기가 까다로워진다.

발표팀은 세 가지 선택지를 검토했다. core package를 사내 npm에 배포하는 방법, 최상위 디렉터리에서 모든 테스트를 관리하는 방법, 그리고 `rootDir`을 최상위 디렉터리로 바꿔 alias를 잡는 방법이다. 결론은 세 번째였다. 발표자는 “깔끔한 방법은 아니지만 먼저 동작하게 만들고 나중에 리팩터링하는 편이 낫다”고 말한다.

이 대목은 실무적으로 중요하다. 테스트 도구 도입은 종종 “무슨 라이브러리를 쓸 것인가”의 문제처럼 보이지만, 실제 비용은 monorepo 구조, alias, package boundary, 기존 CSS/markup 유지 전략에서 나온다. 도구는 설정 몇 줄로 시작할 수 있지만, 기존 코드베이스는 설정 몇 줄로 정리되지 않는다.

작은 이슈들도 있었다. Storyshots는 story title을 기반으로 스냅샷 이름을 만들기 때문에 중복 title이 있으면 충돌이 날 수 있다. 또한 예제 story를 더 그럴듯하게 보이게 하려고 랜덤 데이터를 넣으면, 과거와 현재 결과가 매번 달라져 스냅샷 테스트가 실패한다. 결국 테스트 가능한 UI story는 “보기 좋은 데모”와 “재현 가능한 fixture” 사이에서 균형을 잡아야 한다.

## 스냅샷 테스트가 놓치는 것: CSS와 실제 화면

스냅샷 테스트를 어렵게 구축했지만, 발표팀은 곧 한계를 깨닫는다. 스냅샷 테스트는 DOM 구조 변화를 추적할 수 있을 뿐, plain CSS로 인한 시각적 변화는 직접 잡지 못한다.

CSS-in-JS나 특정 라이브러리를 도입하면 스타일 변화까지 스냅샷화할 수 있지만, 기존 plain CSS를 단기간에 마이그레이션하기는 어렵다. 그래서 발표팀은 두 번째 축으로 시각적 회귀 테스트를 도입한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-ui-testing-snapshot-limit.webp"
    alt="Slide explaining that snapshot tests can only track DOM changes and not plain CSS visual changes"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    발표의 전환점. 스냅샷 테스트는 DOM 변경 추적에는 유용하지만, plain CSS 기반의 실제 화면 변화까지 보장하지는 못한다. 출처: kakao tech YouTube, 09:35 부근.
  </figcaption>
</figure>

시각적 회귀 테스트는 컴포넌트가 렌더링된 화면을 이미지로 캡처하고, 이전 이미지와 현재 이미지를 비교한다. 발표에서는 Storybook과 함께 쓰기 위해 `storyshots-puppeteer` addon을 적용했다. Chromatic이나 Percy 같은 상용 서비스도 있지만, 사내망 접근 문제가 있어 내부에서 직접 구성했다고 설명한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-ui-testing-storybook-puppeteer.webp"
    alt="Slide describing storyshots-puppeteer addon setup for visual regression testing"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    시각적 회귀 테스트는 실제 렌더링 이미지를 비교한다. 이 발표에서는 사내망 제약 때문에 외부 SaaS 대신 Storybook/Puppeteer 기반 addon을 직접 구성했다. 출처: kakao tech YouTube, 10:25 부근.
  </figcaption>
</figure>

흥미롭게도 기본 설정 자체는 큰 문제 없이 동작했다. 그러나 여러 번 돌려보자 다른 종류의 불안정성이 드러났다.

첫째, GIF나 로딩 이미지처럼 시간에 따라 상태가 달라지는 요소는 동일한 이미지를 안정적으로 캡처하기 어렵다. 발표팀은 처음에는 해당 로딩을 제거했고, 이후에는 이미지 차이를 어느 정도 허용하는 failure threshold를 적절히 조정해 사용했다고 설명한다.

둘째, date picker나 select처럼 사용자의 interaction 이후에 의미 있는 상태가 열리는 컴포넌트가 있다. 닫힌 상태만 찍으면 테스트의 가치가 작다. 일부 컴포넌트는 외부에서 active state를 주입받도록 설계되어 문제가 덜했지만, CSS hover나 DOM interaction이 필요한 경우에는 Puppeteer 기반 `beforeScreenshot` 옵션으로 캡처 전 동작을 시뮬레이션했다.

셋째, 로컬에서 돌리는 시각적 회귀 테스트는 느리고 신뢰하기 어렵다. 발표 기준 88개 story에 약 3분이 걸렸고, story는 앞으로 더 늘어날 예정이었다. 더 큰 문제는 개발자 로컬 환경마다 브라우저·폰트·렌더링 조건이 달라 이미지가 완전히 같을 보장이 없다는 점이었다.

## 로컬 테스트에서 CI 파이프라인으로

발표팀은 결국 시각적 회귀 테스트를 Jenkins에서 돌리기로 한다. 이미 PR이 올라오면 preview Storybook을 생성하고 댓글로 알려주는 트리거가 있었기 때문에, 그 preview Storybook을 테스트 대상으로 삼을 수 있었다. Docker 컨테이너 안에서 빌드·배포하기 때문에 환경 일관성도 확보할 수 있었다.

초기 시나리오는 간단하다. 새 PR이 올라오면 preview Storybook을 생성하고, 그 URL을 대상으로 스냅샷 테스트와 시각적 회귀 테스트를 수행한다. 성공하면 성공 댓글을 남기고, 실패하면 diff image를 CDN에 올린 뒤 실패 댓글과 URL을 PR에 남긴다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-ui-testing-jenkins-flow.webp"
    alt="Slide describing Jenkins integration scenario for preview Storybook snapshot and visual regression tests"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Jenkins 연동의 목표는 테스트 실행 자체보다 결과를 PR 운영 흐름 안으로 넣는 것이다. 성공/실패 댓글과 diff image 링크가 있어야 개발자가 다음 행동을 할 수 있다. 출처: kakao tech YouTube, 13:35 부근.
  </figcaption>
</figure>

여기서도 환경 문제가 나왔다. 발표자는 Docker base image로 Alpine Linux를 주로 사용한다고 설명한다. Puppeteer를 Alpine에서 실행하려면 Chromium과 관련 라이브러리를 직접 설치해야 하고, Puppeteer가 자체 Chrome을 받지 않고 사전 설치된 Chromium을 쓰도록 설정해야 한다. 이 설정을 추가하자 headless browser 실행 문제는 해결됐다.

하지만 한 번 더 돌리자 이번에는 한글이 깨졌다. Alpine Linux에는 기본 한글 폰트가 없기 때문이다. 시각적 회귀 테스트는 픽셀을 비교하므로 폰트 렌더링은 핵심 의존성이다. 발표팀은 Dockerfile에 한글 폰트 설치를 추가해 해결했다.

마지막 고민은 Jenkins job chain의 주체였다. preview 생성이 끝난 뒤 다음 job을 Jenkins plugin으로 parameter 전달해 트리거할 수도 있지만, 이렇게 하면 트리거의 주체가 특정 Jenkins job이 된다. 발표팀은 PR이 흐름의 중심이 되기를 원했고, 그래서 GitHub label 기반 운영을 선택했다.

흐름은 다음과 같다. PR이 생성되거나 새 commit이 올라오면 공통 Docker base image를 빌드한다. 이어 preview label을 추가하면 해당 label에 매칭되는 job이 preview Storybook을 빌드·배포한다. preview 배포가 끝나면 각 테스트 label을 추가하고, label 기반 job이 스냅샷/시각적 회귀 테스트를 수행한다. 마지막으로 테스트 결과를 PR 댓글로 남긴다.

## 타임라인으로 보는 핵심 구간

| 구간 | 내용 | 블로그에서 볼 포인트 |
|---|---|---|
| 00:13-02:24 | Admin UI 컴포넌트와 UI 깨짐 문제 소개 | 공통 컴포넌트는 여러 서비스에 영향을 주기 때문에 변경 추적이 필요하다 |
| 02:24-03:45 | Storybook 기반 스냅샷 테스트 도입 | story를 테스트 fixture로 재사용하면 시작은 빠르다 |
| 03:45-06:20 | React hook과 ref 이슈 | renderer가 실제 DOM을 마운트하지 않는다는 제약을 이해해야 한다 |
| 06:20-08:20 | monorepo alias와 `rootDir` 문제 | 테스트 설정은 프로젝트 구조와 강하게 결합된다 |
| 08:20-09:18 | 중복 story title, 랜덤 데이터 문제 | 데모 story도 재현 가능한 fixture로 관리해야 한다 |
| 09:18-10:45 | 스냅샷의 CSS 한계와 시각적 회귀 테스트 도입 | DOM 비교와 화면 비교는 서로 다른 신호를 준다 |
| 10:45-12:25 | GIF, active state, `beforeScreenshot` | 시각적 테스트는 deterministic rendering을 설계해야 한다 |
| 12:25-13:30 | 로컬 테스트의 속도·환경 신뢰도 한계 | 이미지 비교는 CI의 고정 환경에서 돌리는 편이 안전하다 |
| 13:30-15:16 | Docker/Puppeteer/Alpine/한글 폰트 이슈 | 브라우저와 폰트도 테스트 인프라의 일부다 |
| 15:16-16:30 | Jenkins와 GitHub label 기반 orchestration | PR을 중심으로 preview, test, result comment를 연결한다 |
| 16:30-18:00 | 운영 후 결론과 도입 조건 | 자동화 가이드, 컴포넌트 분리, 비용 대비 효과를 먼저 따져야 한다 |

이 타임라인에서 중요한 것은 테스트 종류의 순서가 아니라 신뢰도의 층위다. 스냅샷 테스트는 빠르고 구조 변화를 잘 잡는다. 시각적 회귀 테스트는 느리고 민감하지만 실제 화면 변화를 잡는다. CI 파이프라인은 이 둘을 사람이 반복 실행하지 않아도 되는 운영 흐름으로 만든다.

## 실무 관점에서의 해석

첫째, Storybook은 문서화 도구이면서 테스트 fixture 저장소가 될 수 있다. 이미 컴포넌트 상태를 story로 잘 쪼개 두었다면, 스냅샷 테스트나 시각적 회귀 테스트를 붙이는 비용이 크게 줄어든다. 반대로 story가 데모용으로만 구성되어 있고 랜덤 데이터나 중복 title이 섞여 있다면, 테스트 도입 과정에서 story 구조 자체를 정리해야 한다.

둘째, 스냅샷 테스트와 시각적 회귀 테스트는 경쟁 관계가 아니다. 스냅샷은 빠르고 코드 리뷰에 가까운 신호를 준다. 시각적 회귀 테스트는 실제 브라우저 렌더링 결과를 보기 때문에 CSS와 layout 문제를 잡을 수 있지만, 느리고 flaky해지기 쉽다. 두 테스트는 서로의 빈틈을 메우는 관계로 설계해야 한다.

셋째, 시각적 회귀 테스트에서 가장 중요한 것은 “비교 알고리즘”보다 “같은 환경에서 같은 화면을 찍는가”다. 브라우저 버전, OS font, headless 설정, animation/GIF, active state, viewport, network timing이 조금만 달라도 이미지 diff가 생긴다. 발표에서 Alpine Linux에 Chromium과 한글 폰트를 명시적으로 설치한 이유도 여기에 있다.

넷째, 테스트 실패 후 행동 경로를 먼저 정해야 한다. 의도적인 UI 변경이라면 새 snapshot이나 baseline image를 어떻게 승인하고 업데이트할 것인가? 실패 이미지와 diff는 어디에 저장하고, PR에서는 어떤 링크를 보여줄 것인가? 이 절차가 없으면 테스트는 품질 안전망이 아니라 “빨간 CI를 만드는 장치”가 된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-ui-testing-adoption-checklist.webp"
    alt="Slide listing considerations before adopting snapshot and visual regression tests"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    발표의 결론은 “테스트를 붙이면 좋다”가 아니라 “실패 가이드, 자동화 프로세스, 컴포넌트 분리 가능성, 비용 대비 효과를 먼저 보라”에 가깝다. 출처: kakao tech YouTube, 17:20 부근.
  </figcaption>
</figure>

## 남는 질문과 현재적 의미

공개 영상만으로는 몇 가지가 남는다. 실제 false positive 비율, baseline image 승인 정책, 테스트별 실패 빈도, PR당 평균 대기 시간, 이후 Storybook/Chromatic/Percy/Cypress 생태계 변화에 따른 재설계 여부는 확인할 수 없다. 또한 발표는 2020년 당시의 사내 환경을 기준으로 하므로, 지금 같은 Playwright component testing, Storybook test runner, cloud visual testing 서비스와 그대로 비교하기는 어렵다.

그럼에도 이 발표가 여전히 유효한 이유는 도구명이 아니라 운영 원칙 때문이다. 공통 UI 컴포넌트는 “잘 만들기”보다 “바뀔 때 안전하게 바뀌기”가 어렵다. 특히 내부 어드민이나 디자인 시스템처럼 여러 팀이 재사용하는 표면에서는 한 팀의 작은 변경이 다른 팀의 화면 품질 문제로 번질 수 있다.

발표자는 마지막에 스냅샷 테스트, 시각적 회귀 테스트, 그리고 Cypress 기반 E2E 테스트까지 포함해 총 네 가지 테스트를 운영하고 있다고 말한다. 중요한 것은 테스트 개수가 아니라 역할 분담이다. 빠른 테스트는 구조적 회귀를 잡고, 느린 테스트는 실제 화면과 사용자 흐름을 잡으며, CI는 이 신호를 PR에서 바로 해석 가능한 형태로 되돌려준다.

결론적으로 `UI 테스트를 위한 여정`의 메시지는 꽤 실무적이다. **UI 테스트는 라이브러리를 설치하는 일이 아니라, 변경을 발견하고 승인하고 공유하는 운영 체계를 만드는 일이다.** 공통 컴포넌트가 다른 서비스의 품질에 즉시 영향을 주는 조직이라면, 이 여정은 지금도 충분히 다시 볼 가치가 있다.

Sources: [YouTube - kakao tech, `[ifkakao2020] UI 테스트를 위한 여정`](https://www.youtube.com/watch?v=zRsQck8uP-s), [kakaoTV - UI 테스트를 위한 여정](https://tv.kakao.com/channel/3693125/cliplink/414129351)
