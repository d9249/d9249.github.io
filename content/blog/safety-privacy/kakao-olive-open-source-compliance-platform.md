---
title: "카카오 OLIVE Platform은 오픈소스 컴플라이언스를 개발자 워크플로로 바꾼다"
date: "2026-06-10T22:06:36"
description: "if(kakao)2020의 OLIVE 발표와 현재 공개 문서를 함께 보면, OLIVE는 GitHub 연동·의존성 분석·컴포넌트 매핑·라이선스 의무 확인·리포트 생성을 통해 오픈소스 검증을 중앙 전담 업무에서 개발자 주도 워크플로로 옮기는 플랫폼이다."
author: "Sangmin Lee"
category: "safety-privacy"
tags:
  - Kakao
  - OLIVE Platform
  - Open Source Compliance
  - License Compliance
  - Supply Chain Security
  - YouTube
draft: false
---

AI 코딩 도구와 에이전트가 늘어날수록 팀이 실제로 관리해야 하는 것은 모델만이 아니다. 더 많은 샘플 코드, 더 빠른 프로토타입, 더 자주 바뀌는 의존성이 들어오면 오픈소스 라이선스와 취약점, 고지문, 배포 전 검증도 함께 빨라져야 한다.

카카오의 **OLIVE Platform** 발표는 이 문제를 2020년 시점의 오픈소스 컴플라이언스 관점에서 설명한다. 흥미로운 점은 시간이 지난 지금 봐도 메시지가 낡지 않았다는 것이다. 핵심은 “검증 담당 조직이 마지막에 한 번 확인한다”가 아니라, **개발자가 프로젝트를 만들고 스캔하고, 의존성을 매핑하고, 라이선스 의무와 리포트를 지속적으로 확인하는 작업면**을 만드는 데 있다.

이 글은 if(kakao)2020 발표 영상, YouTube 자동 한국어 자막, 영상에서 추출한 주요 슬라이드 프레임, 그리고 현재 공개된 OLIVE Platform 사이트·카카오 오픈소스 가이드·OLIVE CLI/GitHub Action 공개 저장소를 함께 확인해 정리했다.

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/vgNAfrygm4I"
    title="Video: OLIVE 카카오에서 제공하는 오픈소스 관리 서비스"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"
  ></iframe>
</div>

YouTube metadata 기준 영상 제목은 **`[ifkakao2020] OLIVE 카카오에서 제공하는 오픈소스 관리 서비스`**이고, 채널은 **kakao tech**다. 설명란은 연사를 황은경 Violet, 김영환 Sean으로 소개하고, OLIVE를 “쉽고, 빠르고, 정확한 오픈소스 검증”을 목표로 하는 서비스라고 설명한다.

업로드일은 YouTube metadata 기준 2026-06-10이지만, 세션 자체는 if(kakao)2020 발표다. 공식 chapter는 제공되지 않았고, transcript는 YouTube 자동 한국어 자막을 기준으로 사용했다. 자동 자막에는 “오픈소스”가 “오븐 소스”로 인식되는 식의 오류가 있어, 정확한 명칭과 기능 범위는 현재 공개 문서와 영상 슬라이드를 함께 대조했다.

## 핵심 아이디어: 검증을 마지막 관문에서 개발 과정으로 옮긴다

발표 초반의 문제의식은 단순하다. 카카오는 배포되는 프로젝트 300여 개를 대상으로 검증을 진행했고, 확인된 오픈소스가 2,500여 개라고 설명한다. 프로젝트와 오픈소스가 계속 늘어나면 중앙 조직이 배포 직전에만 검증하는 방식으로는 속도와 품질을 동시에 유지하기 어렵다.

오픈소스 라이선스는 권한, 제한, 조건을 갖는다. MIT나 BSD처럼 허용적인 라이선스도 라이선스와 저작권 고지를 요구한다. 따라서 배포 전에 “어떤 오픈소스를 썼는지”, “어떤 라이선스 의무가 있는지”, “고지문과 체크리스트를 어떻게 만들지”를 확인해야 한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-olive-realtime-verification.webp"
    alt="ifkakao2020 slide describing OLIVE as a real-time open-source verification service with scan, data sharing, and report"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    03:41 전후 슬라이드. OLIVE는 실시간 Scan, Data 공유, Report를 묶어 “쉽고, 빠르고, 정확한 오픈소스 검증”을 목표로 한다고 소개된다.
  </figcaption>
</figure>

OLIVE의 방향은 이 검증을 개발자에게 보이게 만드는 것이다. 발표자는 기존에는 오픈소스 기술 파트가 내부 시스템으로 검증을 전담했지만, OLIVE에서는 개발자가 직접 검증을 진행하고 리뷰를 요청하며, 개발 중에도 사용한 오픈소스와 리포트를 확인할 수 있다고 설명한다.

이 전환은 조직적으로 중요하다. 컴플라이언스가 배포 직전의 gate로만 남아 있으면 개발자는 라이선스 이슈를 늦게 발견한다. 반대로 프로젝트 생성, 스캔, 컴포넌트 매핑, 리포트 확인이 개발 흐름에 들어오면 라이선스 의무는 “나중에 법무/오픈소스 담당자가 보는 것”이 아니라 “개발자가 설계 중에 확인하는 신호”가 된다.

## OLIVE의 기본 루프: Analyze, Mapping, Verify, Report

발표가 제시하는 OLIVE의 핵심 루프는 네 단계로 정리된다.

먼저 프로젝트를 분석해 의존성 정보를 추출한다. 그다음 식별된 의존성을 OLIVE의 오픈소스 컴포넌트 데이터와 매핑한다. 매핑된 컴포넌트의 라이선스 의무와 이슈를 확인하고, 마지막으로 체크리스트·변경 내역·고지문 미리보기·리포트를 만든다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-olive-scan-flow.webp"
    alt="OLIVE Scan flow slide showing Analyze, Mapping, Verify Obligation, and Report"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    05:24 전후 슬라이드. OLIVE Scan은 프로젝트 분석, 의존성-컴포넌트 매핑, 라이선스 의무 확인, 리포트 생성이라는 네 단계로 설명된다.
  </figcaption>
</figure>

이 구조에서 가장 중요한 부분은 매핑이다. 단순히 `package.json`이나 `build.gradle`에서 문자열을 뽑는 것만으로는 부족하다. 실제 오픈소스 컴포넌트, 버전, 라이선스, 의무 사항, 고지문과 연결되어야 배포 의사결정에 쓸 수 있다.

발표는 자동 매핑되지 않은 컴포넌트가 있을 경우 사용자가 검색하거나 직접 등록할 수 있다고 설명한다. 등록된 컴포넌트는 리뷰 전까지 해당 프로젝트에서만 쓰이고, 검토 후에는 다른 프로젝트에서도 재사용 가능한 데이터가 된다. 즉 OLIVE는 스캐너인 동시에, 조직과 사용자들이 함께 쌓는 오픈소스 지식 베이스로 설계되어 있다.

현재 OLIVE 공식 사이트도 같은 메시지를 유지한다. 사이트는 프로젝트를 GitHub 연결, 파일 업로드, OLIVE CLI로 분석할 수 있다고 설명하고, 사용자가 직접 등록한 오픈소스 컴포넌트는 카카오 리뷰 후 모든 사용자에게 공개될 수 있다고 안내한다.

## 라이선스 의무를 UI와 리포트로 드러내는 방식

영상 중반의 데모는 라이선스 검증을 어떻게 사용자에게 보이게 할지 보여 준다. 프로젝트 Summary에서는 분석된 컴포넌트, 라이선스 수, 확인이 필요한 매핑 상태를 보여 준다. License 화면에서는 각 라이선스의 의무 사항과 이슈를 확인한다.

예시로 등장하는 Apache License 2.0은 고지 의무 외의 특별한 의무가 없는 경우로 설명되고, MPL 2.0을 가진 컴포넌트는 “코드 공개” 이슈가 있는 예시로 제시된다. 당시 발표 기준으로는 코드 공개 의무가 있는 경우를 라이선스 이슈로 제공한다고 설명한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-olive-license-obligation-ui.webp"
    alt="OLIVE License screen showing license obligations and an MPL 2.0 code disclosure issue"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    07:50 전후 슬라이드. OLIVE는 오픈소스 컴포넌트의 라이선스와 의무 사항을 보여 주고, 이슈가 있을 때 가이드에 따라 해결하도록 유도한다.
  </figcaption>
</figure>

리포트도 중요하다. 발표는 스캔이 진행 중이어도 확인된 컴포넌트에 대해서는 체크리스트와 고지문 미리보기가 생성된다고 설명한다. 이전 스캔과 비교해 새로 추가되거나 변경된 컴포넌트를 확인할 수 있고, 스캔 완료 후에는 고지문을 내려받을 수 있다.

다만 발표자는 고지문이 참고용이며 카카오가 보증하거나 책임지는 것은 아니라고 분명히 말한다. 이 caveat는 실무적으로 중요하다. 오픈소스 관리 도구는 법적 판단을 완전히 대체하지 않는다. 도구가 해야 할 일은 누락을 줄이고 검토 표면을 만드는 것이며, 최종 정책과 책임은 조직의 프로세스 안에서 다뤄야 한다.

## Analyzer: UI 뒤에는 의존성 분석 시스템이 있다

후반부는 OLIVE Analyzer의 구조를 설명한다. 사용자가 분석을 요청하면 OLIVE Front가 OLIVE API를 호출하고, API는 RabbitMQ에 검증 요청 메시지를 보낸다. OLIVE Scanner들이 큐에서 메시지를 꺼내 분석을 수행하고 데이터베이스에 저장한다.

슬라이드에 따르면 OLIVE Front와 API 서버는 클러스터 A에, Scanner는 클러스터 B에 배포된다. 스캐너는 Gradle 빌드 같은 무거운 작업을 수행할 수 있으므로 별도 클러스터로 분리했다는 설명이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-olive-system-architecture.webp"
    alt="OLIVE system architecture slide showing Front, API, RabbitMQ, Scanner cluster, DB, and Olive Analyzer"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    12:13 전후 슬라이드. OLIVE의 분석 요청은 Front/API, RabbitMQ, Scanner, Analyzer, DB로 이어지는 비동기 처리 구조로 설명된다.
  </figcaption>
</figure>

Analyzer는 빌드 스크립트 파일을 입력으로 받아 의존성 정보, 분석 위치, 스크립트 타입을 추출한다. 결과에는 artifact, version, 분석 라인 등이 포함된다.

발표 시점의 Analyzer는 파서 방식과 빌드 방식을 함께 지원한다고 설명된다. 파서 방식은 Java, Objective-C, JavaScript, Python, Ruby, Go, Native 환경의 약 20여 개 빌드 스크립트 분석을 지원하고, 빌드 방식은 당시 Gradle에 한정되어 있었다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-olive-analyzer-specs.webp"
    alt="OLIVE Analyzer supported specs slide showing parser-based build files and Gradle build mode"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    13:15 전후 슬라이드. 발표 당시 Analyzer는 여러 빌드 스크립트를 파서 방식으로 분석하고, Gradle에 대해서는 빌드 방식 분석을 제공한다고 설명한다.
  </figcaption>
</figure>

이 구분은 지금도 유효한 설계 포인트다. 파서 방식은 빠르지만 변수가 많거나 정의가 동적인 경우 실패할 수 있다. 빌드 방식은 실제 해석 결과에 가까워질 수 있지만 소스 빌드가 가능해야 하고 시간이 오래 걸린다. 오픈소스 의존성 분석은 “파일에서 이름을 읽는다”보다 훨씬 복잡한 문제다.

## 타임라인으로 보는 핵심 구간

| 구간 | 영상 흐름 | 관찰 포인트 |
|---|---|---|
| 00:10–00:54 | 세션 소개와 OLIVE 공개 배경 | if(kakao)2020에서 예고했던 카카오의 오픈소스 관리 시스템을 서비스로 오픈한다는 맥락을 제시한다. |
| 00:54–02:48 | 오픈소스 관리가 필요한 이유 | 프로젝트 300여 개, 확인된 오픈소스 2,500여 개라는 규모와 라이선스 의무, 고지 의무, 컴플라이언스 목적을 설명한다. |
| 02:51–04:20 | 내부 검증에서 개발자 주도 OLIVE로 전환 | 개발자가 직접 검증하고 리뷰를 요청하며, GitHub 연동·실시간 스캔·데이터 공유·리포트를 제공한다는 방향을 제시한다. |
| 04:25–05:50 | OLIVE 사용 방식과 스캔 루프 | 카카오 로그인, 기업 인증, 프로젝트 초대, Simple Check, Analyze→Mapping→Verify→Report 구조가 나온다. |
| 05:55–08:40 | 프로젝트 스캔, 매핑, 라이선스, 리포트 UI | 자동 매핑되지 않은 컴포넌트 처리, 로컬 컴포넌트 등록, Apache/MPL 예시, 체크리스트와 고지문 미리보기를 보여 준다. |
| 08:44–11:42 | 컴포넌트/라이선스 목록과 로드맵 | SPDX 기반 라이선스 목록, Simple Check, 베타 오픈, 저장소 연동·private 저장소·policy 적용·분석 정확도 향상 계획을 말한다. |
| 11:54–12:53 | OLIVE Analyzer와 시스템 구조 | Front/API/RabbitMQ/Scanner/DB 구조와 스캐너 클러스터 분리 이유를 설명한다. |
| 12:53–14:50 | Analyzer 입력과 지원 스펙 | 빌드 스크립트에서 artifact, version, line 정보를 추출하고 파서 방식과 Gradle 빌드 방식을 구분한다. |
| 14:50–16:11 | Analyzer의 한계와 계획 | 동적 정의는 파서 방식에서 실패할 수 있어 Gradle 빌드 방식을 지원하며, 오픈소스 라이브러리 제공, CI/CD 연동, 파서/빌드 시스템 확장을 계획한다. |

## 영상과 현재 공개 자료에서 확인되는 점

| 근거 | 확인되는 내용 | 이 글에서의 사용 |
|---|---|---|
| YouTube metadata | 제목은 `[ifkakao2020] OLIVE 카카오에서 제공하는 오픈소스 관리 서비스`, 채널은 kakao tech, 길이는 약 16분 19초 | 영상의 기본 식별, embed, 세션 맥락 확인 |
| YouTube description | OLIVE는 GitHub 프로젝트 분석, 오픈소스 데이터 관리, 라이선스 의무 확인, Report 생성 기능을 제공한다고 설명 | 발표의 제품 범위와 companion source인 OLIVE 사이트 확인 |
| Transcript/슬라이드 | 개발자 주도 검증, 실시간 스캔, 컴포넌트 매핑, 라이선스 이슈, 고지문, Analyzer 구조가 순서대로 등장 | 본문 구조와 타임라인의 1차 근거 |
| OLIVE 공식 사이트 | 프로젝트를 GitHub 연결·파일 업로드·CLI로 분석하고, 라이선스와 취약점 정보를 제공하며, 사용자 등록 컴포넌트를 리뷰 후 공유한다고 설명 | 2020년 발표 이후 현재 플랫폼이 유지하는 핵심 가치 확인 |
| 카카오 오픈소스 가이드 | OLIVE Platform Beta는 2020-11-18, 정식 서비스는 2021-06-30 오픈. 2022년 CLI, 2022년 코드스니펫 분석, 2023년 취약성 정보 추가가 기록됨 | 발표의 로드맵이 이후 공개 서비스와 문서로 이어졌는지 확인 |
| `kakao/olive-cli` | OLIVE CLI는 로컬 PC 환경에서 분석을 실행할 수 있게 하며, 특정 명령을 수행하지 않으면 클라이언트 측 데이터가 서버에 저장되지 않는다고 설명 | private 코드나 보안 우려가 있는 팀을 위한 배포 형태 확인 |
| `kakao/olive-action` | GitHub Actions에서 OLIVE CLI를 실행해 PR 생성·갱신 시 의존성 분석, PR comment, artifact 저장, OLIVE Platform 연동을 지원 | 발표의 CI/CD 연동 계획이 현재 공개 Action 형태로 확장된 흐름 확인 |

현재 공개 문서에서 가장 눈에 띄는 변화는 OLIVE가 더 넓은 공급망 관리 표면으로 확장되었다는 점이다. 영상은 주로 라이선스와 고지 의무를 중심으로 말하지만, 현재 OLIVE 사이트와 카카오 가이드는 취약점 정보, 코드스니펫 분석, CLI, GitHub Action까지 포함한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kakao-olive-analyzer-roadmap.webp"
    alt="OLIVE Analyzer future plan slide listing open-source project, CI/CD integration, more parser/build systems, and improved accuracy"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    15:24 전후 슬라이드. 발표 말미의 Analyzer 계획은 오픈소스 분석 라이브러리 제공, CI/CD 연동, 파서·빌드 시스템 확장, 분석 정확도 향상으로 정리된다.
  </figcaption>
</figure>

## 실무 관점에서의 해석

OLIVE 발표의 실무적 가치는 오픈소스 컴플라이언스를 “문서와 담당자”가 아니라 “반복 가능한 개발자 워크플로”로 다룬다는 데 있다.

첫째, 의존성 분석은 가능한 한 빨리 실행되어야 한다. 프로젝트가 커지고 배포가 가까워질수록 라이선스 이슈 수정 비용은 커진다. GitHub 연동, Simple Check, CLI, GitHub Action 같은 표면은 검증 시점을 앞으로 당기는 장치다.

둘째, 컴포넌트 데이터는 조직 자산이 된다. 자동 매핑되지 않은 항목을 사용자가 등록하고, 리뷰 후 재사용 가능한 데이터로 바꾸는 구조는 시간이 지날수록 자동 매핑률을 높인다. 이는 단순한 스캔 도구보다 지식 베이스에 가깝다.

셋째, 리포트는 사람이 판단할 수 있는 형태여야 한다. 라이선스 목록만 던져 주는 것으로는 부족하다. 어떤 의무가 있고, 어떤 이슈가 있고, 이전 스캔 대비 무엇이 바뀌었으며, 고지문 초안이 어떻게 보이는지까지 연결되어야 개발자가 행동할 수 있다.

넷째, Analyzer의 파서/빌드 방식 구분은 모든 SCA 도구가 겪는 현실적인 trade-off를 보여 준다. 빠른 정적 파싱은 많은 경우 충분하지만, Gradle처럼 동적 구성이 많은 생태계에서는 실제 빌드 해석이 필요할 수 있다. 대신 시간과 실행 환경 비용이 붙는다.

AI 팀에도 이 메시지는 그대로 적용된다. LLM이 코드를 제안하고 에이전트가 패키지를 추가하는 시대에는 의존성 변화가 더 자주, 더 넓게 발생한다. 따라서 “나중에 사람이 정리한다”보다, PR·CLI·프로젝트 스캔 단계에서 라이선스와 취약점 신호를 바로 보는 구조가 더 안전하다.

## 남는 질문

첫 번째 질문은 책임 경계다. OLIVE 같은 도구는 누락을 줄이고 검토 표면을 만들지만, 법적 판단과 조직 정책을 대신하지 않는다. 발표에서도 고지문은 참고용이며 카카오가 보증하거나 책임지는 것은 아니라고 말한다. 실무 도입 시에는 사내 정책, 배포 형태, 제품별 예외 처리, 법무/오픈소스 담당자의 최종 리뷰 흐름이 함께 설계되어야 한다.

두 번째 질문은 private code와 데이터 이동이다. 현재 OLIVE CLI 문서는 로컬 환경에서 분석을 수행할 수 있고, 특정 명령을 수행하지 않으면 클라이언트 측 데이터가 서버에 저장되지 않는다고 설명한다. 보안 요구가 높은 팀일수록 어떤 데이터가 언제 서버로 전송되는지, PR comment와 artifact에 무엇이 남는지를 명확히 해야 한다.

세 번째 질문은 정확도와 커버리지다. 파서 방식은 빠르지만 동적 정의에 약할 수 있고, 빌드 방식은 정확도를 높일 수 있지만 오래 걸린다. 다양한 언어와 패키지 매니저, monorepo, generated dependency, lockfile 정책까지 들어가면 도구 하나로 모든 상황을 완벽히 처리하기 어렵다.

그럼에도 OLIVE가 보여 주는 방향은 분명하다. 오픈소스 컴플라이언스는 더 이상 배포 직전 checklist가 아니다. 개발자가 매일 쓰는 저장소, PR, CLI, 리포트, 데이터베이스 안으로 들어와야 하는 운영 시스템이다. 이 점에서 OLIVE는 2020년의 오픈소스 관리 서비스 발표이면서, 지금의 AI-assisted 개발 환경에도 그대로 필요한 공급망 hygiene의 예시로 읽을 수 있다.

## 참고한 공개 자료

- [YouTube: [ifkakao2020] OLIVE 카카오에서 제공하는 오픈소스 관리 서비스](https://www.youtube.com/watch?v=vgNAfrygm4I)
- [OLIVE Platform](https://olive.kakao.com)
- [카카오 오픈소스 가이드: OLIVE Platform](https://kakao.github.io/docs/olive/)
- [GitHub: kakao/olive-cli](https://github.com/kakao/olive-cli)
- [GitHub: kakao/olive-action](https://github.com/kakao/olive-action)
