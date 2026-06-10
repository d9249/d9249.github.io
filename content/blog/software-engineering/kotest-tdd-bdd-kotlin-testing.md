---
title: "Kotest로 보는 BDD: 테스트 코드를 기획서와 다시 연결하는 방법"
date: "2026-06-10T22:12:07"
description: "if(kakao)2020 세션 ‘kotest가 있다면 TDD 묻고 BDD로 가!’는 TDD와 BDD를 경쟁 관계가 아니라 서로 다른 검증 층위로 설명하고, Kotlin 프로젝트에서 Kotest와 MockK로 그 흐름을 구현하는 방법을 보여준다."
author: "Sangmin Lee"
category: "software-engineering"
tags:
  - YouTube
  - Kotlin
  - Kotest
  - BDD
  - TDD
  - MockK
  - ifkakao
  - Software Engineering
draft: false
---

테스트 이야기는 자주 “작성할 것인가, 말 것인가”의 문제로 소비된다. 하지만 실제 개발 현장에서 더 어려운 질문은 조금 다르다. **무엇을 테스트로 옮길 것인가**, 그리고 **그 테스트가 코드 내부 구현만 검증할 것인가, 사용자의 행위와 기획 의도까지 검증할 것인가**다.

if(kakao)2020 세션 **「kotest가 있다면 TDD 묻고 BDD로 가!」**는 이 질문을 꽤 실용적인 방식으로 다룬다. 발표는 TDD를 부정하고 BDD로 갈아타자는 이야기가 아니다. 오히려 TDD와 BDD가 맡는 검증 범위가 다르며, Kotlin 프로젝트에서는 Kotest와 MockK를 조합해 두 흐름을 함께 가져갈 수 있다는 점을 설명한다.

이 글은 kakao tech YouTube 영상, KakaoTV의 같은 세션 설명, YouTube 자동 한국어 자막, Kotest 공식 문서, MockK 공식 문서를 함께 확인해 정리했다. YouTube 영상에는 공식 챕터가 없어, 아래 타임라인은 발표 내용과 자막 흐름을 기준으로 재구성했다.

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/uGwnawMeDfQ"
    title="[ifkakao2020] kotest가 있다면 TDD 묻고 BDD로 가!"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

영상은 카카오 Backend engineer 이원제 Wade, 강진혁 Harry가 진행한 약 23분 길이의 if(kakao)2020 발표다. KakaoTV의 원본 설명도 같은 제목과 연사를 제시하며, BDD와 TDD의 비교, BDD 적용 예제, Kotlin 프로젝트에서 이를 쉽게 적용하게 돕는 Kotest와 주변 라이브러리를 다룬다고 소개한다.

흥미로운 점은 발표가 테스트 프레임워크 소개로 바로 들어가지 않는다는 것이다. 초반 절반은 TDD와 BDD의 관계를 정리하는 데 쓴다. 즉 “Kotest가 좋다”보다 먼저 “왜 테스트 케이스를 사용자 시나리오와 기획서에서 끌어와야 하는가”를 설명한다.

## 핵심 아이디어: TDD는 모듈을, BDD는 시나리오를 본다

발표가 먼저 짚는 것은 TDD의 기본 사이클이다. 테스트를 먼저 작성하고, 그 테스트가 실패하는 상태에서 출발해, 코드를 작성하고, 다시 테스트를 통과시키는 반복이다.

여기서 중요한 구분이 나온다. 이미 작성된 코드가 정상 동작하는지 사후에 검증하는 테스트가 모두 TDD는 아니다. 발표자들은 요구사항을 먼저 테스트 케이스로 쓰고, 그 테스트에 맞춰 코드를 설계하는 흐름을 TDD의 핵심으로 본다. 이 방식은 테스트 가능한 구조를 유도하고, 모듈 역할을 작게 만들며, 결합도를 낮추는 효과를 낸다.

그런데 TDD만으로는 사용자가 실제로 경험하는 행위의 흐름을 충분히 표현하기 어렵다. 계산기 예시로 보면, TDD는 `Calculator.add` 함수가 입력 두 개를 받아 올바른 합을 반환하는지 확인한다. 반면 BDD는 사용자가 숫자를 누르고, 더하기 버튼을 누르고, 다시 숫자를 입력하고, 등호를 눌렀을 때 화면에 결과가 표시되는지를 본다.

같은 코드가 최종적으로 호출되더라도 테스트 케이스의 관점이 다르다. TDD는 모듈 기능의 정확성을 확인하고, BDD는 사용자 행위와 시나리오의 완결성을 확인한다. 그래서 둘은 대체재가 아니라 보완재에 가깝다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kotest-bdd-tdd-cycle.webp"
    alt="ifkakao2020 발표 화면: BDD cycle 안에 TDD cycle이 함께 배치된 구조"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    09:08 전후 장면. 발표는 BDD와 TDD를 둘 중 하나만 고르는 선택지가 아니라, 시나리오 검증과 모듈 검증이 겹쳐지는 구조로 설명한다.
  </figcaption>
</figure>

## BDD의 실무적 가치는 “테스트 작성 비용”을 줄이는 데 있다

발표에서 BDD가 등장하는 맥락은 현실적이다. TDD의 장점을 알아도 테스트 케이스를 계속 만들고 유지보수하는 것은 비용이다. 일정 압박이 생기면 테스트 없이 위험하게 배포하고, 그 결과 기술 부채가 쌓이는 악순환이 생긴다.

BDD는 이 비용을 줄이는 한 가지 방법으로 제시된다. 개발자가 테스트 케이스를 허공에서 상상하는 대신, 이미 기획서나 요구사항에 들어 있는 사용자 행위를 테스트 시나리오로 옮기는 방식이다.

발표는 이 과정을 `Given / When / Then` 구조로 설명한다. `Given`은 사용자의 현재 조건, `When`은 사용자가 수행하는 행위, `Then`은 기대 결과다. 예를 들어 이모티콘 스튜디오의 검수 등록 기능을 생각하면, 로그인 상태와 본인 인증 상태가 `Given`, 검수 등록 버튼 클릭이 `When`, 등록한 검수 사항이 화면에 표시되는 것이 `Then`이 된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kotest-bdd-given-when-then.webp"
    alt="ifkakao2020 발표 화면: 이모티콘 스튜디오 검수 등록 예제를 Given When Then 구조로 나누는 슬라이드"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    05:34 전후 장면. 발표는 기획서의 조건, 사용자 행위, 기대 결과를 Given / When / Then 테스트 구조로 옮기는 방식을 예제로 보여준다.
  </figcaption>
</figure>

이 관점에서 BDD 테스트는 단순한 자동화 스크립트가 아니다. 기획서와 코드 사이의 동기화 장치가 된다. 테스트 코드를 읽었을 때 사용자 조건과 행위, 기대 결과가 드러나면, 개발자뿐 아니라 기획자와의 커뮤니케이션에도 도움이 된다.

## 시나리오의 빈틈을 코드 작성 전에 발견한다

BDD의 또 다른 장점은 설계 누락을 앞당겨 발견한다는 점이다. 발표자들은 입력값 예외 케이스를 테스트하다 보면 함수 설계에서 놓친 부분을 나중에 발견하듯, BDD에서는 사용자 시나리오를 테스트 케이스로 옮기는 과정에서 기획의 빈틈을 발견할 수 있다고 설명한다.

예를 들어 “본인 인증된 사용자가 검수 등록을 한다”는 조건을 테스트로 쓰다 보면, 본인 인증이 안 된 사용자는 어떻게 되는지, 인증 방식이 여러 개일 때 어떤 분기가 필요한지 같은 질문이 자연스럽게 나온다. 이런 질문이 배포 직전이나 배포 후에 나오면 코드 변경 범위가 커지고, 일정 압박 속에서 누더기 코드가 만들어지기 쉽다.

BDD의 강점은 바로 그 질문을 코드 작성 전에 앞으로 끌어오는 데 있다. 테스트 작성이 단지 품질 보증 단계가 아니라, 설계 검토 단계가 되는 셈이다.

## Kotest는 여러 테스트 스타일을 한 프레임워크 안에 둔다

발표 후반부는 Kotlin 프로젝트에서 이 흐름을 어떻게 구현할지로 넘어간다. 여기서 등장하는 도구가 Kotest다.

Kotest 공식 문서에 따르면 Kotest는 Kotlin용 테스트 프레임워크로, 여러 테스트 definition style을 제공한다. 문서 기준으로 Behavior Spec, Feature Spec, Expect Spec 같은 스타일은 기능 차이라기보다 테스트를 어떤 문법과 구조로 표현할지의 선택지에 가깝다. 모든 스타일은 기본적으로 같은 종류의 설정과 테스트 기능을 공유하고, 팀이 선호하는 표현 방식에 맞춰 고르면 된다.

발표가 소개하는 스타일은 네 가지다.

| 스타일 | 발표에서의 위치 | 실무적으로 어울리는 용도 |
|---|---|---|
| `BehaviorSpec` | BDD의 Given / When / Then 구조를 코드로 표현 | 사용자 조건, 행위, 기대 결과가 분명한 시나리오 |
| `FeatureSpec` | Feature / Scenario 구조로 BDD를 표현 | 행위자보다 기능 중심으로 쓰인 기획 |
| `AnnotationSpec` | JUnit에 익숙한 annotation 기반 테스트 | 기존 JVM 테스트 문화와 비슷한 TDD 스타일 |
| `ExpectSpec` | DSL로 TDD 테스트를 표현 | `expect`와 `context`로 테스트를 그룹화하고 싶을 때 |

공식 문서도 `BehaviorSpec`을 BDD 스타일 테스트에 적합한 스타일로 설명하며, `given`, `when`, `then`을 사용한다. Kotlin에서 `when`은 키워드이므로 백틱으로 감싸거나 `When`처럼 대문자 버전을 쓰는 점도 문서에 명시되어 있다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kotest-behavior-spec-style.webp"
    alt="ifkakao2020 발표 화면: Kotest BehaviorSpec 코드 예시"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    13:33 전후 장면. Kotest의 BehaviorSpec은 BDD 시나리오를 코드 안에서 Given / When / Then 블록으로 드러내는 방식이다.
  </figcaption>
</figure>

이 지점에서 Kotest의 장점은 단순히 “Kotlin스러운 테스트 문법”만이 아니다. 팀이 TDD와 BDD를 둘 다 쓰고 싶을 때, 서로 다른 도구를 무리하게 섞지 않고 하나의 테스트 프레임워크 안에서 표현 방식을 나눌 수 있다는 점이다.

## MockK는 의존성 오염을 막고 상호작용을 검증한다

발표의 마지막 도구는 MockK다. 테스트 대상 모듈이 외부 라이브러리나 저장소, 다른 서비스에 의존하면 테스트 결과가 그 의존성의 상태에 오염될 수 있다. MockK는 Kotlin에 맞춘 mocking library로, `mockk`, `every`, `verify`, `spyk` 같은 DSL을 제공한다.

공식 문서 기준으로 MockK는 기본 mock, spy, object/static/constructor mock, coroutine mocking, annotation 기반 mock 생성 등을 지원한다. 또한 별도 BDD alias를 쓰면 `every`를 `given`, `verify`를 `then`처럼 표현할 수도 있다.

발표에서 특히 강조되는 부분은 `every`와 `verify`다. `every`는 특정 입력에 대한 mock의 응답을 미리 정의하고, `verify`는 테스트 실행 후 특정 함수가 기대한 횟수와 인자로 호출되었는지 확인한다. 예를 들어 `verify(exactly = 1)`은 블록 안의 호출이 정확히 한 번 일어나야 한다는 뜻으로 쓰인다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kotest-mockk-verify.webp"
    alt="ifkakao2020 발표 화면: MockK verify 블록으로 호출 횟수와 인자를 검증하는 예시"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    19:31 전후 장면. MockK의 verify 블록은 결과값뿐 아니라 의존 객체와의 상호작용이 기대대로 일어났는지 확인하는 표면을 만든다.
  </figcaption>
</figure>

이 부분은 BDD와도 잘 맞는다. 사용자 시나리오를 검증하다 보면 “화면에 값이 나온다”뿐 아니라, 그 과정에서 저장소 저장, 외부 호출, 이벤트 발행 같은 상호작용이 기대대로 일어났는지도 확인해야 한다. MockK는 이 상호작용을 통제하고 검증하는 레이어로 들어간다.

## 타임라인으로 보는 핵심 구간

| 구간 | 핵심 내용 | 글에서의 해석 |
|---|---|---|
| 00:10–03:40 | TDD 정의, 테스트를 먼저 작성하는 이유, 테스트 가능한 코드의 장점 | TDD는 모듈 설계를 테스트 가능하게 만드는 압력이다. |
| 03:40–06:40 | 테스트 작성 비용과 BDD 도입, Given / When / Then 예제 | BDD는 테스트 케이스 작성 비용을 기획서와 사용자 행위에서 줄인다. |
| 06:40–09:20 | TDD와 BDD의 차이, 계산기 예시, 상호 보완 관계 | TDD는 함수·모듈, BDD는 사용자 흐름을 검증한다. |
| 09:20–12:10 | 시나리오 빈틈, 설계 누락, 커뮤니케이션 개선 | BDD는 테스트 작성이 곧 기획 검토가 되는 지점이 있다. |
| 12:10–17:40 | Kotest의 BehaviorSpec, FeatureSpec, AnnotationSpec, ExpectSpec | Kotlin 테스트에서 BDD/TDD 스타일을 한 프레임워크 안에 둘 수 있다. |
| 17:40–20:40 | MockK의 mock, every, verify, spyk | 의존성을 통제하고 상호작용을 검증하는 보조 레이어다. |
| 20:40–23:00 | MSA, 테스트 자동화, BDD 도입 효과 정리 | 복잡한 서버 시스템일수록 넓은 테스트 커버리지와 시나리오 검증이 중요해진다. |

## 영상과 연결 자료에서 확인되는 점

확인된 사실만 놓고 보면 이 세션은 “BDD 도입 홍보”라기보다 Kotlin 테스트 스택을 중심으로 한 테스트 설계 입문에 가깝다. KakaoTV 설명은 발표의 범위를 BDD/TDD 비교, BDD 예제, Kotest와 주변 라이브러리 소개로 정리하고 있고, 실제 영상 흐름도 그 순서를 따른다.

Kotest 공식 문서는 발표의 도구 설명을 뒷받침한다. Kotest는 여러 스타일을 제공하며, Behavior Spec은 BDD framework 스타일, Feature Spec은 Cucumber에 익숙한 `feature` / `scenario` 구조, Expect Spec은 `expect` 중심 DSL을 제공한다. 즉 발표에서 말한 “스타일”은 별도 테스트 엔진이라기보다 같은 프레임워크 안에서 테스트를 읽히는 방식의 선택지로 보는 편이 정확하다.

MockK 공식 문서 역시 발표의 후반부를 보강한다. MockK는 Kotlin에 맞춘 mock/spy/verify DSL을 제공하며, BDD alias까지 따로 제공한다. 다만 문서에는 spies와 suspending function 관련 known issue, JDK 16+에서 일부 mock 기능이 제약될 수 있는 이슈도 언급된다. 발표 영상은 입문 흐름에 집중하기 때문에 이런 제약까지 깊게 다루지는 않는다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kotest-bdd-summary.webp"
    alt="ifkakao2020 발표 화면: BDD와 Kotest 도입 효과를 정리하는 마무리 슬라이드"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    21:37 전후 장면. 발표의 결론은 BDD가 테스트 작성 비용, 커버리지, 설계 리스크, 서비스 이해도에 영향을 줄 수 있다는 정리로 모인다.
  </figcaption>
</figure>

## 실무 관점에서의 해석

이 발표에서 지금도 유효한 메시지는 “BDD를 쓰면 테스트가 좋아진다”가 아니다. 더 정확히는 **테스트의 언어를 구현 언어에서 제품 언어 쪽으로 조금 끌어올리라**는 메시지다.

TDD는 여전히 필요하다. 모듈의 경계, 입력과 출력, 예외 케이스를 빠르게 검증하려면 작은 단위의 테스트가 강하다. 하지만 그것만으로는 사용자가 실제로 어떤 조건에서 어떤 행위를 하고, 어떤 결과를 기대하는지 전체 흐름을 보장하기 어렵다. BDD는 그 빈틈을 채우는 상위 레이어다.

반대로 BDD만으로도 충분하지 않다. 사용자 시나리오가 통과한다고 해서 내부 모듈의 모든 경계 조건이 안전하다는 뜻은 아니다. 영상에서 말하듯 BDD와 TDD는 함께 써야 기대하는 테스트 커버리지에 가까워진다.

Kotest와 MockK의 조합은 이 구분을 Kotlin 문법 안에서 비교적 자연스럽게 표현하게 해 준다. BehaviorSpec과 FeatureSpec으로 시나리오를 쓰고, AnnotationSpec이나 ExpectSpec으로 단위 테스트 스타일을 가져가며, MockK로 의존성과 호출 검증을 보강하는 식이다.

다만 도구보다 먼저 필요한 것은 팀의 합의다. 어떤 테스트를 BDD로 쓸지, 어떤 테스트를 TDD 단위 테스트로 둘지, 기획서의 어떤 표현을 Given / When / Then으로 옮길지 정하지 않으면 Kotest의 다양한 스타일은 오히려 혼란이 될 수 있다. 공식 문서도 스타일 선택에 정답은 없고 팀 선호에 맞추면 된다고 말한다.

그래서 이 세션의 좋은 사용법은 “Kotest를 당장 도입하자”보다, 다음 질문을 팀에 던지는 것이다.

- 우리 테스트는 코드 내부 함수명만 설명하고 있는가, 아니면 사용자 행위도 설명하고 있는가?
- 기획서의 조건·행위·기대 결과가 테스트 코드 어디에 남아 있는가?
- 기능이 실패했을 때 모듈 실패인지, 시나리오 실패인지 구분할 수 있는가?
- mock과 verify는 결과값 검증을 보완하는 상호작용 검증으로 쓰이고 있는가?

이 질문에 답할 수 있다면 BDD는 유행어가 아니라 설계 도구가 된다. 그리고 Kotest는 그 설계 도구를 Kotlin 코드 안에 읽히는 형태로 남기는 하나의 실용적인 선택지가 된다.

Sources: https://www.youtube.com/watch?v=uGwnawMeDfQ, https://tv.kakao.com/channel/3693125/cliplink/414004682, https://kotest.io/docs/framework/testing-styles.html, https://mockk.io/
