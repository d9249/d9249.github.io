---
title: "카카오톡 메시징 서버 테스트 자동화: 레거시를 바꾸기 전에 검증망부터 만들기"
date: "2026-06-10T22:27:38"
description: "if(kakao)2020 세션 ‘카카오톡 시스템의 진화 - 테스트 자동화로 자신감 갖기’를 바탕으로, 카카오톡 메시징 서버가 로컬 테스트 환경, Cucumber BDD, Jenkins CI, JaCoCo 커버리지 리포트로 배포 부담을 줄인 과정을 정리한다."
author: "Sangmin Lee"
category: "software-engineering"
tags:
  - YouTube
  - ifkakao2020
  - KakaoTalk
  - Test Automation
  - BDD
  - Cucumber
  - Jenkins
  - JaCoCo
  - Legacy Systems
image: "/images/blog/kakaotalk-test-automation-hero.webp"
draft: false
---

레거시 시스템을 고치는 가장 위험한 순간은 코드를 바꾸는 순간이 아니다. **바꾼 뒤에도 같은 동작을 한다고 말할 수 있는 근거가 없을 때**다.

if(kakao)2020 세션 **「카카오톡 시스템의 진화 - 테스트 자동화로 자신감 갖기」**는 이 문제를 카카오톡 메시징 서버라는 꽤 무거운 사례로 설명한다. 발표자는 카카오톡 메시지를 중계하는 서버가 오랫동안 CI와 자동화 테스트 없이 운영되었고, 그 결과 작은 수정과 배포도 큰 스트레스로 이어졌다고 말한다.

이 글의 핵심은 “BDD가 좋다”나 “Jenkins를 쓰자”가 아니다. 오래된 핵심 서버를 바로 리팩터링하지 않고, 먼저 **로컬에서 재현 가능한 테스트 실험실을 만들고, 행위 기반 시나리오를 쌓고, CI에서 매일 검증되는 구조를 만든 다음에야 리팩터링을 이야기할 수 있었다**는 점이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakaotalk-test-automation-hero.webp"
    alt="카카오톡 메시징 서버 테스트 자동화 흐름 요약: 레거시 부담, 로컬 테스트랩, BDD 시나리오, Jenkins CI, 배포 자신감"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    발표의 구조는 레거시 서버를 직접 고치기 전에 검증망을 먼저 세우는 여정으로 읽을 수 있다. 3,000줄 클래스와 테스트 부재에서 출발해 Docker Compose, Cucumber, Jenkins, JaCoCo로 이어진다.
  </figcaption>
</figure>

## 무엇을 다루는 영상인가

영상은 kakao tech 채널에 올라온 if(kakao)2020 발표다. YouTube 설명 기준 제목은 `카카오톡 시스템의 진화 - 테스트 자동화로 자신감 갖기`, 연사는 신성열 Tomo / 카카오 Software developer다.

YouTube 설명에는 별도 GitHub 저장소나 슬라이드 링크가 제공되어 있지 않았다. 따라서 아래 정리는 YouTube 메타데이터, 자동 한국어 자막, 그리고 영상에서 확인되는 발표 화면에 근거한다. 자동 자막에는 `CI`, `Cucumber`, `Gherkin`, `JaCoCo`, `Zookeeper` 같은 기술 용어가 일부 다르게 인식되는 구간이 있어, 문맥과 화면에 맞춰 기술 용어를 바로잡았다.

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/IU7ZMtJkeWM"
    title="Video: [ifkakao2020] 카카오톡 시스템의 진화 - 테스트 자동화로 자신감 갖기"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"
  ></iframe>
</div>

발표의 배경은 카카오톡 메시징 파트가 운영하는 메시징 서버다. 발표자는 당시 맥락에서 카카오톡이 5천만 명이 넘는 이용자를 보유하고, 하루 20억 개가 넘는 메시지를 처리하며, 낮 시간 트래픽이 20만 TPS 수준까지 올라간다고 설명한다. 이 수치는 현재 상태를 말한다기보다, 발표가 다루는 서버가 어떤 부담을 가진 핵심 시스템이었는지 보여주는 배경이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakaotalk-test-automation-messaging-server.webp"
    alt="카카오톡 메시징 서버가 사용자 메시지를 처리하고 DB, Zookeeper, 다른 서버와 통신하는 구조와 20만 TPS 그래프"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    발표 초반의 문제 설정. 메시징 서버는 발신자가 보낸 메시지를 처리하고 저장하며, 다른 사용자에게 전달하기 위해 여러 서버와 통신한다. 발표자는 낮 시간 트래픽이 20만 TPS 수준까지 오른다고 설명한다. 출처: kakao tech YouTube, 03:20 전후.
  </figcaption>
</figure>

## 문제의 핵심: 장애 대응보다 배포 자신감이 먼저 무너졌다

발표에서 흥미로운 점은 장애의 원인을 단순히 “트래픽이 많았다”로 정리하지 않는다는 것이다. 월드컵이나 새해처럼 트래픽이 급증하는 이벤트가 직접적인 계기가 될 수는 있지만, 발표자가 짚는 근본 원인은 더 내부적이다.

핵심은 **코드를 수정하고 배포할 자신감이 충분하지 않았다**는 점이다. 급증하는 트래픽에 대응하려면 서버를 개선해야 하지만, 잘못된 코드가 전체 서비스에 영향을 줄 수 있다는 부담 때문에 실서비스 서버를 쉽게 건드릴 수 없었다. 코드 리뷰와 QA만으로는 모든 오류를 잡기 어렵고, 실제로 잘못된 코드가 장애로 이어진 경험도 있었다고 발표자는 말한다.

구조적 배경은 오래된 서비스에서 흔히 보이는 패턴이다. 초기에는 요구사항을 빠르게 만족시키는 기능 개발이 우선이었고, 새로운 프로토콜이 추가될 때마다 같은 클래스에 구현이 쌓였다. 시간이 지나면서 하나의 클래스가 3,000줄 규모가 되었고, 중복 코드도 늘어났다.

동시에 테스트가 없었다. 카카오톡의 핵심 기능을 담당하는 서버인데도 코드 무결성을 자동으로 검증할 테스트가 없었기 때문에, 수정 속도는 느려지고 배포 스트레스는 커졌다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakaotalk-test-automation-root-cause.webp"
    alt="장애의 근본 원인을 기능 개발 집중, 클래스 세분화 실패, 테스트 부재, 개발 및 배포 부담 증가로 설명하는 다이어그램"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    발표가 제시한 근본 원인은 트래픽 자체보다 검증 가능한 구조의 부재에 가깝다. 기능 개발에 집중한 결과 클래스 세분화가 실패했고, 테스트 부재가 개발·배포 부담을 키웠다. 출처: kakao tech YouTube, 04:45 전후.
  </figcaption>
</figure>

## 리팩터링보다 먼저 필요한 것은 “동작 보존”의 증거다

발표팀의 최종 목표는 메시징 서버를 더 간결하고 읽기 쉬운 코드로 리팩터링하는 것이었다. 하지만 레거시 코드를 바로 고치는 것은 위험했다. 리팩터링이 안전하려면 변경 전후의 동작이 같다는 증거가 필요하다.

그래서 우선순위가 바뀐다. 리팩터링 전에 단위 테스트와 통합 테스트를 추가하고, 특히 메시징 서버의 비즈니스 동작을 시나리오로 검증할 수 있는 테스트 체계를 만드는 것이 먼저였다.

여기서 선택한 도구가 Cucumber다. Cucumber는 BDD, 즉 행위 주도 개발에 기반한 테스트 도구다. `Given / When / Then` 형태의 자연어 시나리오를 쓰고, 각 문장을 step definition 코드와 연결해 실제 테스트를 실행한다.

이 선택은 메시징 서버와 잘 맞는다. 메시징 서버의 핵심 로직은 단일 함수의 반환값보다 사용자 행위의 연쇄에 가깝다. 사용자가 채팅방을 만들고, 메시지를 보내고, 상대를 차단하고, 다시 채팅방에 들어왔을 때 마지막 메시지가 무엇인지 같은 흐름을 검증해야 한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakaotalk-test-automation-bdd-cucumber.webp"
    alt="Cucumber BDD 시나리오와 step definition 코드 예시: 차단 이후 메시지가 마지막 메시지로 반영되지 않아야 하는 채팅 테스트"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Cucumber를 이용한 BDD 예시. 사용자가 채팅방을 만들고, 메시지를 보내고, 상대방을 차단한 뒤, 차단 이후의 메시지가 마지막 메시지로 반영되지 않아야 한다는 비즈니스 규칙을 시나리오로 표현한다. 출처: kakao tech YouTube, 08:20 전후.
  </figcaption>
</figure>

## 첫 번째 병목: 테스트하려면 먼저 배포해야 했다

Cucumber를 고른 뒤에도 바로 테스트가 가능했던 것은 아니다. 당시 메시징 서버는 로컬 개발 환경 자체가 충분히 마련되어 있지 않았다. 기능을 확인하려면 알파나 샌드박스 같은 테스트 스테이지에 서버를 배포하고, Python 스크립트나 실제 클라이언트로 확인해야 했다.

이 방식은 테스트 자동화와 맞지 않는다. 단지 동작을 확인하고 싶을 뿐인데 서버와 의존 컴포넌트를 테스트 스테이지에 올려야 한다면, 테스트 시간은 길어지고 개발자는 테스트보다 배포 준비에 시간을 쓰게 된다.

처음에는 메시징 서버만 로컬에 띄우고, DB나 다른 서버는 샌드박스 환경을 바라보게 했다. Python 스크립트 대신 메시징 서버에 붙을 수 있는 테스트 라이브러리도 만들었다. 가입, 친구 추가 같은 초기 설정을 다른 서버 통신 없이 처리해 의존성을 줄이는 방향이었다.

하지만 이 방식도 느렸다. 한 feature를 돌릴 때 30초 이상 걸리는 경우가 있었고, 병목은 테스트 실행 전 background 단계에 있었다. 로컬 테스트 라이브러리가 샌드박스 DB와 연결을 맺고 끊으면서 시간이 많이 소비된 것이다.

해결책은 외부 요소까지 모두 로컬로 가져오는 것이었다. DB, Zookeeper, 기타 의존 요소를 Docker 이미지로 만들고 Docker Compose 파일에 등록했다. DB 이미지는 컨테이너가 뜰 때 메시징 서버가 필요로 하는 데이터베이스와 테이블을 생성하도록 구성했다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakaotalk-test-automation-local-docker.webp"
    alt="Docker Compose로 DB, Zookeeper, 기타 의존 요소를 로컬에 띄운 뒤 Cucumber 테스트를 메시징 서버에 실행하는 구조"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    로컬 테스트 환경의 핵심은 메시징 서버만 띄우는 것이 아니라, DB와 Zookeeper 같은 의존 요소까지 Docker Compose로 재현하는 것이었다. 발표자는 모든 컴포넌트를 로컬에 띄운 뒤 테스트 수행 시간이 기존의 10% 수준으로 줄었다고 설명한다. 출처: kakao tech YouTube, 12:50 전후.
  </figcaption>
</figure>

이 대목은 테스트 자동화에서 자주 과소평가된다. 테스트 도구 자체보다 중요한 것은 **테스트가 매번 같은 조건에서 빨리 실행될 수 있는 환경**이다. 테스트가 느리고 준비 과정이 번거로우면, 팀은 결국 테스트를 우회한다.

## 두 번째 병목: 자발적 참여만으로는 테스트가 쌓이지 않았다

로컬 환경을 만들고 Cucumber 테스트를 작성할 수 있게 되었지만, 프로젝트는 한 번 더 막힌다. 파트원들이 프로토콜별로 feature를 자율적으로 가져가고, 테스트를 많이 작성한 사람이 좋은 평가를 받도록 유도했지만 참여율은 기대만큼 높지 않았다.

이유는 현실적이다. Cucumber의 러닝 커브가 높았고, 기존 시스템에 테스트만 추가하는 일은 재미가 없었다. 운영 중인 서버를 소수 인원이 개발하고 관리하다 보니 중간에 생기는 운영 과제가 테스트 작성보다 우선되는 일도 잦았다.

발표팀은 접근을 바꿨다. 자발적 참여에만 기대지 않고, 소수 정예 TF를 만들고 목표와 일정을 명확히 잡았다. 목표는 테스트의 라인 커버리지를 60% 이상으로 끌어올리고, PR 반영 시점과 주기적 배치 작업에서 테스트가 자동으로 수행되게 만드는 것이었다.

즉 테스트 자동화는 도구 도입이 아니라 운영 우선순위의 재조정이었다. “언젠가 시간이 나면 테스트를 쓰자”가 아니라, 측정 가능한 목표와 CI 게이트를 가진 프로젝트가 되어야 했다.

## Jenkins CI: 로컬 실험실을 정기 검증 체계로 바꾸다

CI 구축 단계에서는 Gradle과 Jenkins가 등장한다. 먼저 로컬 실행 과정을 단순화했다. 이전에는 개발자가 Docker Compose를 실행하고, IDE나 Gradle wrapper로 서버를 띄우고, VM 옵션과 디렉터리 구조를 수동으로 맞춰야 했다.

발표팀은 `runLocal`이라는 JavaExec 타입의 Gradle task를 만들었다. 이 task는 Compose up task에 의존하게 구성되어, 한 번 실행하면 필요한 컨테이너가 뜨고 메시징 서버가 실행되며 Cucumber 테스트를 작성하고 돌릴 수 있는 환경이 만들어졌다. 동시에 Cucumber step 작성 스타일도 표준화해 Gherkin 파라미터 처리나 메소드·변수명 혼용 문제를 줄였다.

Jenkins에서는 빌드와 테스트 과정을 더 세분화했다. Gradle assemble로 빌드하고, Compose up으로 메시징 서버 환경을 구성하고, 스크립트로 서버를 띄운 뒤, unit test와 integration test task를 실행한다. 테스트가 끝나면 다시 스크립트로 서버를 내린다.

자동화 트리거도 두 갈래였다. 매일 오전 한 번 정기적으로 실행하고, GitHub 소스 변경이 생겼을 때도 빌드가 일어나도록 했다. 이 구조가 만들어지면서 테스트는 개발자 개인이 기억해서 돌리는 작업이 아니라, 코드 변경과 시간에 의해 자동으로 수행되는 검증 레이어가 되었다.

## 리포트의 역할: 실패를 보이게 만들고, 커버리지를 추적한다

CI가 돌기 시작하면 다음 문제는 결과를 어떻게 볼 것인가다. Cucumber는 테스트 결과를 JSON 파일로 만들지만, JSON만으로는 팀이 상태를 빠르게 파악하기 어렵다. 발표팀은 Jenkins의 Cucumber report plugin을 사용해 feature, scenario, step 단위의 성공·실패 통계를 확인할 수 있게 했다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakaotalk-test-automation-cucumber-report.webp"
    alt="Jenkins Cucumber report plugin 화면: feature, scenario, step 단위 테스트 성공 통계"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Cucumber report plugin은 JSON 결과를 사람이 읽을 수 있는 리포트로 바꿔준다. 세부 수치보다 중요한 것은 feature와 scenario 단위로 어떤 테스트가 통과했는지 팀이 빠르게 볼 수 있다는 점이다. 출처: kakao tech YouTube, 18:25 전후.
  </figcaption>
</figure>

하지만 Cucumber 리포트만으로는 코드 커버리지를 알 수 없다. 그래서 JaCoCo를 함께 사용했다. Gradle의 JaCoCo plugin을 통해 unit test와 integration test가 실행될 때마다 JaCoCo 리포트를 생성하고, Jenkins JaCoCo plugin으로 전체 커버리지 현황을 볼 수 있게 했다.

발표에서 제시된 결과는 instruction coverage 55%, line coverage 59%다. 목표였던 60%에 거의 도달한 수치다. 여기서 중요한 것은 숫자 자체가 완벽하다는 뜻이 아니다. 처음에는 테스트가 전무했기 때문에 0%에 가까웠던 시스템이, 이제 변경 때마다 자동으로 측정되고 추적되는 상태가 되었다는 점이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakaotalk-test-automation-jacoco-coverage.webp"
    alt="JaCoCo coverage report 화면: instruction coverage 55%, line coverage 59% 등 전체 커버리지 요약과 패키지별 커버리지"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    JaCoCo 리포트는 Cucumber 시나리오가 실제 코드의 어느 정도를 지나가는지 추적하게 해준다. 발표에서 제시된 수치는 instruction 55%, line 59%로, 목표였던 60%에 근접했다. 출처: kakao tech YouTube, 19:55 전후.
  </figcaption>
</figure>

## 타임라인으로 보는 핵심 구간

| 구간 | 발표 흐름 | 핵심 메시지 |
| --- | --- | --- |
| 00:10–02:00 | 발표자와 문제 소개 | 카카오톡 메시징 서버는 오래된 핵심 시스템이었고, CI·테스트 자동화 부재가 개발과 운영의 스트레스를 키웠다. |
| 02:00–04:30 | 메시징 서버의 역할과 트래픽 규모 | 메시징 서버는 사용자 메시지를 처리·중계하고, 발표 당시 낮 시간 20만 TPS 수준까지 처리하는 핵심 서버로 설명된다. |
| 04:30–06:30 | 장애의 근본 원인 | 기능 중심 개발, 3,000줄 클래스, 테스트 부재가 수정·배포 자신감 부족으로 이어졌다. |
| 06:30–09:00 | Cucumber BDD 도입 | 리팩터링 전에 동작 보존을 검증하기 위해 사용자 행위 기반 시나리오 테스트를 선택했다. |
| 09:00–13:30 | 로컬 테스트 환경 구축 | 알파·샌드박스 배포 없이 테스트하려고 Docker Compose로 DB, Zookeeper, 기타 의존 요소를 로컬에 재현했다. |
| 13:30–15:30 | 자율 참여의 한계와 TF 전환 | 테스트 작성은 재미없고 밀리기 쉬운 일이므로, 목표 커버리지와 일정을 가진 TF 프로젝트로 바꿨다. |
| 15:30–18:20 | Gradle과 Jenkins CI 구성 | `runLocal` task, Compose up, 서버 실행/종료 스크립트, unit/integration test task를 엮어 CI에서 자동 검증하게 했다. |
| 18:20–20:25 | Cucumber·JaCoCo 리포트 | 테스트 결과와 커버리지를 Jenkins에서 볼 수 있게 만들고 line coverage 59% 수준까지 끌어올렸다. |
| 20:25–22:20 | 성과와 다음 과제 | 코드 변경·정기 실행마다 테스트가 돌고, BDD 시나리오가 신규 멤버의 업무 이해에도 도움을 줬다. 다음 목표는 단위 테스트 보강과 리팩터링이다. |

## 영상에서 확인되는 실무적 교훈

첫 번째 교훈은 **레거시 개선의 출발점이 리팩터링이 아닐 수 있다**는 것이다. 코드가 크고 오래되었을수록 바로 구조를 고치고 싶지만, 검증망 없이 하는 리팩터링은 또 다른 위험이다. 발표팀은 먼저 현재 동작을 보존하는 테스트를 쌓는 쪽을 택했다.

두 번째 교훈은 **통합 테스트는 환경 구축 프로젝트와 분리되지 않는다**는 것이다. 메시징 서버만 로컬에 띄워서는 충분하지 않았다. DB와 Zookeeper 등 의존 요소가 멀리 있으면 테스트는 느려지고 불안정해진다. 결국 테스트 자동화의 핵심 작업 중 하나는 의존 환경을 로컬에서 반복 가능하게 만드는 일이었다.

세 번째 교훈은 **BDD가 문서 역할도 할 수 있다**는 점이다. 발표자는 BDD 시나리오 덕분에 신규 멤버가 코드를 보기 전에 프로토콜과 메시징 서버의 역할을 더 쉽게 이해할 수 있었다고 말한다. 테스트가 단순한 회귀 방지 장치가 아니라, 시스템 행위를 설명하는 살아 있는 문서가 된 것이다.

네 번째 교훈은 **커버리지 숫자보다 자동 실행 여부가 더 중요하다**는 것이다. line coverage 59%는 완성형 수치가 아니다. 하지만 코드가 바뀔 때마다, 그리고 매일 한 번씩 Jenkins가 자동으로 테스트를 수행한다면 팀은 최소한 변화의 위험을 지속적으로 관찰할 수 있다. 이 상태가 되어야 배포 자신감과 리팩터링 여지가 생긴다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakaotalk-test-automation-outcomes.webp"
    alt="테스트 자동화 성과 다이어그램: 목표 커버리지 달성, CI 정기 검증, BDD 적용이 배포 부담 감소와 업무 파악 난이도 감소로 이어짐"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    발표자가 정리한 성과는 커버리지 달성만이 아니다. CI로 정기 검증이 가능해지고, BDD 시나리오가 업무 이해를 돕고, 같은 시스템을 새로운 프로젝트에도 적용할 수 있다는 확신이 생겼다. 출처: kakao tech YouTube, 20:25 이후.
  </figcaption>
</figure>

## 남은 과제: BDD만으로 모든 코드를 덮을 수는 없다

발표는 성공담으로만 끝나지 않는다. BDD는 메시징 서버의 사용자 행위와 프로토콜 흐름을 표현하는 데 유용했지만, 모든 코드를 테스트하기에 적합한 도구는 아니었다.

예를 들어 DB에 직접 접근해 데이터를 얻어오거나, Zookeeper 설정을 바꾸는 코드처럼 Cucumber 시나리오로 표현하기 어려운 영역이 있다. 발표팀은 이런 부분은 단위 테스트로 보강하고, 이후 리팩터링을 통해 더 읽기 쉽고 고치기 쉬운 코드로 만들겠다고 설명한다.

이 균형이 중요하다. BDD는 비즈니스 행위를 설명하고 통합 흐름을 검증하는 데 강하지만, 내부 분기와 낮은 수준의 유틸리티까지 모두 담당하기에는 무겁다. 레거시 개선에서는 BDD로 시스템의 외부 행위를 고정하고, 단위 테스트로 내부 변경의 안전망을 촘촘히 만드는 조합이 더 현실적이다.

## 왜 지금도 읽을 만한 사례인가

이 발표는 2020년의 카카오 사례지만, 지금도 낡지 않았다. 많은 팀이 여전히 “테스트를 해야 한다”는 사실은 알지만, 실제로는 로컬 환경이 복잡하고, 테스트 데이터가 멀리 있고, CI가 느리고, 운영 이슈가 우선되어 테스트 작성이 뒤로 밀린다.

카카오톡 메시징 서버 사례가 보여주는 것은 거창한 신기술이 아니다. 오히려 이미 잘 알려진 도구들—Docker Compose, Cucumber, Gradle, Jenkins, JaCoCo—을 오래된 핵심 시스템의 운영 흐름에 맞게 연결한 것이다.

그래서 실무적으로 더 가치가 있다. 레거시 시스템을 바꾸는 첫 단계는 “완벽한 아키텍처”가 아니라, 팀이 매일 믿고 돌릴 수 있는 검증 루프를 만드는 일일 수 있다. 그 검증 루프가 생긴 뒤에야 팀은 배포 부담에서 조금씩 벗어나고, 신규 멤버는 시스템 행위를 이해하며, 리팩터링은 추측이 아니라 증거 위에서 시작된다.

발표자가 마지막에 정리한 문장이 이 사례를 잘 요약한다. 낡고 오래된 시스템의 변화는 고된 일이지만, 테스트와 CI가 만들어내는 열매는 달콤하다. 이 말은 레거시를 다루는 거의 모든 팀에 여전히 유효하다.
