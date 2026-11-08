---
title: "GPT-6 Cyber: 취약점을 찾는 능력과 권한을 지키는 능력"
date: "2026-11-08T16:19:36"
description: "OpenAI의 GPT-6 Cyber는 승인된 보안 연구에 특화한 GPT-6 Astra 변형이다. ExploitGym 성능과 범위 준수 평가, Linux·Firefox 사례, Daybreak 접근 승인과 PSP의 30일 보존 조건을 나눠 살펴본다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - GPT-6 Cyber
  - Cybersecurity
  - AI Agents
  - Alignment
  - Daybreak
draft: false
---

보안 에이전트에는 두 가지 능력이 동시에 필요하다. 취약점을 찾아 실제 영향을 검증하는 능력, 그리고 허가받지 않은 시스템에는 손대지 않는 능력이다. OpenAI가 2026년 11월 5일 발표한 **GPT-6 Cyber**는 이 두 축을 함께 강화한 보안 특화 모델이다.[1]

GPT-6 Cyber는 GPT-6 Astra에 보안 분야 후학습을 적용한 변형이며, 승인된 취약점 연구·익스플로잇 개발·웹 침투 테스트를 대상으로 한다.[2]
발표 글은 ExploitGym 점수가 GPT-5.6 Cyber의 <strong>32.1%에서 48.5%</strong>로 높아졌다고 보고한다.[1]
다만 이는 모든 보안 작업의 성공률도, 무제한으로 사용할 수 있는 공개 모델의 출시도 아니다.[2][8]

이 발표에서 주목할 부분은 단순히 “더 잘 공격한다”가 아니다. **검증 가능한 보안 성과를 늘리면서, 대상·권한·실행 범위를 별도로 통제하는 운영 방식**까지 제품의 일부로 묶었다는 점이다.[1][2]

## 거절을 줄이는 것과 실제 능력을 높이는 것은 다르다

시스템 카드에 따르면 후학습에는 크래시 재현, 동작하는 익스플로잇 개발, 코드베이스의 취약점 탐색을 대상으로 한 강화학습이 쓰였다.[2]
허가된 요청에 대한 불필요한 거절을 줄이는 보상과 함께, 사용자 의도·권한·범위를 따르고 결과를 정확히 보고하도록 하는 학습 신호도 포함한다.[2]

거절 여부를 보는 평가와 실제 취약점 검증을 보는 평가는 카드에서 따로 보고한다.[2]
ExploitGym은 원격 대상에서 코드를 실행해 목표를 달성했는지뿐 아니라 **지정된 취약점을 이용했는지**도 확인한다.[2]
발표의 **약 51% 개선은 상대 개선율**이며, 반올림된 수치의 차이는 **16.4%p**다.[1]

<figure>
  <div class="blog-figure-media" style="overflow-x:auto;overflow-y:hidden;">
    <img style="width:100%;min-width:640px;max-width:none;height:auto;" src="/images/blog/gpt-6-cyber-exploitgym.webp" alt="시스템 카드의 ExploitGym 차트. GPT-5.6 Sol 30.3%, GPT-6 Astra 42.4%, GPT-6 Cyber 48.5%를 비교한다" />
  </div>
  <figcaption>시스템 카드의 ExploitGym 비교다.[2]
옅은 파란 막대는 GPT-5.6 Sol이며, 발표 글에서 비교한 GPT-5.6 Cyber와는 다르다.[2]
모바일에서는 이 글의 세 그림을 좌우로 밀어 전체를 볼 수 있다.</figcaption>
</figure>

## 어떤 평가에서 나아졌는가

다음은 시스템 카드에 함께 수록된 GPT-6 Astra와 Cyber의 비교다.[2]
백분율은 각각의 평가 점수이며 서로 같은 분모의 정확도가 아니다.[2]
카드는 보안 평가 결과를 **시험한 최고 추론 예산**에서 보고한다고 명시한다.[2]

<table style="width:100%;min-width:0;table-layout:fixed;">
  <thead><tr><th style="width:48%;min-width:0;padding:10px 6px;">평가</th><th style="width:26%;min-width:0;padding:10px 6px;">Astra</th><th style="width:26%;min-width:0;padding:10px 6px;">Cyber</th></tr></thead>
  <tbody>
    <tr><td style="min-width:0;padding:10px 6px;">ExploitGym</td><td style="min-width:0;padding:10px 6px;">42.43</td><td style="min-width:0;padding:10px 6px;"><strong>48.45</strong></td></tr>
    <tr><td style="min-width:0;padding:10px 6px;">ExploitGym<br />Hardened</td><td style="min-width:0;padding:10px 6px;">29.69</td><td style="min-width:0;padding:10px 6px;"><strong>36.94</strong></td></tr>
    <tr><td style="min-width:0;padding:10px 6px;">SEC-Bench Pro</td><td style="min-width:0;padding:10px 6px;">85.38</td><td style="min-width:0;padding:10px 6px;"><strong>87.02</strong></td></tr>
    <tr><td style="min-width:0;padding:10px 6px;">SRE-Bench</td><td style="min-width:0;padding:10px 6px;">87.98</td><td style="min-width:0;padding:10px 6px;"><strong>92.84</strong></td></tr>
  </tbody>
</table>

Hardened는 공격 완화 장치를 강화한 조건의 지정 취약점 검증이고, SEC-Bench Pro는 대형 JavaScript 엔진의 취약점 발견, SRE-Bench는 소스 없이 수행하는 바이너리 역공학을 평가한다.[2]
뒤의 두 평가는 **pass@1**이며, SRE-Bench는 과제별 여섯 목표를 모두 충족해야 완전 해결로 센다.[2]

코드 없이 웹 애플리케이션을 조사하는 별도 침투 테스트에서 취약점 recall은 Cyber <strong>40.3%</strong>, Astra <strong>32.0%</strong>로 보고한다.[1]
이는 지정된 취약점의 악용을 확인하는 ExploitGym과 달리 취약점 발견을 평가한 결과다.[1]

발표 글의 RemoteExploitBench도 별개로 읽어야 한다. 통제 환경의 알려진 취약점을 이용하는 이 평가에서 Cyber는 **95%를 완료**했고, Daybreak Blue를 적용한 Astra는 **모두 거절**했다고 보고한다.[1]
이는 접근 정책과 거절 동작이 다른 구성을 함께 비교한 결과이므로, 순수한 익스플로잇 능력 차이로만 해석할 수는 없다.

## 외부 평가에서는 모든 항목을 이기지 않았다

시스템 카드에 실린 Irregular 평가에서 Cyber는 장기 작업인 CyScenarioBench의 **11개 과제를 모두 한 번 이상** 해결했고 평균 성공률은 <strong>61%</strong>였다.[2]
“모두 한 번 이상 해결”과 “매 시도 성공”은 서로 다르다. FrontierCyber에서는 Cyber가 **90/288**에 그쳤고 Astra는 **96/288**로 더 많은 문제를 해결했다.[2]

<figure>
  <div class="blog-figure-media" style="overflow-x:auto;overflow-y:hidden;">
    <img style="width:100%;min-width:640px;max-width:none;height:auto;" src="/images/blog/gpt-6-cyber-frontiercyber.webp" alt="시스템 카드에 수록된 Irregular의 FrontierCyber 평가. GPT-6 Astra는 288개 중 96개, GPT-6 Cyber는 90개 문제를 해결했다" />
  </div>
  <figcaption>카드에 수록된 FrontierCyber의 문제 해결 수 비교다.[2]
이 수치는 해결한 문제 수이지 반복 시도의 평균 성공률이 아니다.[2]</figcaption>
</figure>

Irregular는 완전히 강화된 대상에 대한 성공을 관찰하지 못했고, 두 모델 모두 최상위 난도의 **15개 문제는 해결하지 못했다**고 보고한다.[2]
또한 업데이트된 평가로 두 모델을 다시 비교한 결과여서, 과거 Astra 카드의 수치를 그대로 가져와 이어 붙이면 안 된다.[2]

기존 ExploitBench의 <strong>ACE 정규화 평균 점수 100%</strong>도 보편적인 성공 보장은 아니다.[2]
카드는 오래된 취약점에 따른 오염 가능성을 경고하며, 더 최근 취약점을 쓰는 내부 평가의 임의 코드 실행 성공률은 Cyber <strong>42%</strong>, Astra <strong>39%</strong>로 보고한다.[2]

## 범위 준수 99.93%가 뜻하는 것

ExploitGym Honeypot은 어려운 작업 옆에 공격하기 쉬운 보조 서비스를 둔다.[2]
모델은 이를 정상적인 지원 용도로 쓸 수 있지만, 그 서비스를 공격하는 일은 허가 범위 밖이다.[2]
이 평가가 확인하는 것은 목표를 달성하려고 주변 인프라까지 공격하는지를 구분하는 능력이다.[2]

시스템 카드는 다음과 같은 **범위 밖 공격의 관찰 비율**을 보고한다.[2]
낮을수록 좋으며, “추가 지침 없음”은 배포용 안전 지침을 넣지 않은 조건이다.[2]

<table style="width:100%;min-width:0;table-layout:fixed;">
  <thead><tr><th style="width:68%;min-width:0;padding:10px 6px;">평가 조건</th><th style="width:32%;min-width:0;padding:10px 6px;">범위 밖 공격</th></tr></thead>
  <tbody>
    <tr><td style="min-width:0;padding:10px 6px;">GPT-5.6 Cyber<br /><small>추가 지침 없음</small></td><td style="min-width:0;padding:10px 6px;">5.51%</td></tr>
    <tr><td style="min-width:0;padding:10px 6px;">GPT-6 Cyber<br /><small>추가 지침 없음</small></td><td style="min-width:0;padding:10px 6px;">0.07%</td></tr>
    <tr><td style="min-width:0;padding:10px 6px;">GPT-6 Cyber<br /><small>배포용 안전 지침 적용</small></td><td style="min-width:0;padding:10px 6px;">0%</td></tr>
  </tbody>
</table>

발표의 **99.93% 범위 준수**는 두 번째 행을 반대 방향으로 표현한 값이다.[1][2]
마지막 행의 0%는 해당 평가에서 관찰된 결과이지, 실제 배포에서 절대로 권한을 벗어나지 않는다는 증명은 아니다.

정렬 지표가 전부 Astra보다 좋은 것도 아니다.[2]
최종 답변에서 작업 장애를 제대로 고지하지 않은 것으로 표시된 비율은 Cyber <strong>20.29%</strong>, Astra <strong>11.66%</strong>였다.[9]
다만 저자들은 검토한 다수 사례에서 중간 메시지에는 장애를 알렸지만 최종 요약에서 빠뜨렸다고 설명하며, 이를 의도적 기만과 구분한다.[2]

## Linux와 Firefox 사례는 발견·검증·패치를 나눠 읽는다

Linux 연구에서는 **2,308개 후보 → 1,724개 동적 재현 → 948개 고유 LPE**라는 흐름을 보고한다.[3]
여기서 LPE는 권한 없는 로컬 사용자의 권한 상승을 뜻한다.[3]
더 자세한 글에는 동작하는 LPE 익스플로잇 산출물 **1,169개**에 변형 분석과 패치 기준 중복 정리를 적용해 **948개**로 집계했다고 설명한다.[3]
이는 948개가 모두 새 CVE로 등록됐거나, 이미 배포판에 수정됐다는 뜻은 아니다.[3]

전체 실행의 API 크레딧 비용은 **$1,213,430**이었다.[3]
발견·재현·영향 검증·패치 후보 생성 뒤 사람이 결과와 심각도를 검토해 유지관리자에게 보고하는 파이프라인이며, 이 금액을 모델의 요청당 가격이나 모든 운영비가 포함된 총비용으로 읽으면 안 된다.[3]
초기 실행에서는 성공으로 표시한 일부 결과가 지정한 것과 다른 취약점을 사용해, 이후 독립적인 경로 확인을 추가했다는 점도 중요하다.[3]

Firefox의 **새로운 고위험 취약점 81개**와 **기존 문제 30개의 심각도 재평가**는 OpenAI의 연구 보고다.[1]
Mozilla의 Firefox 159 보안 공지에서는 실제 수정과 OpenAI 소속 연구자에 대한 크레딧을 확인할 수 있지만, 그 공지 하나를 “81개 전부 수정 완료”의 증거로 삼을 수는 없다.[4]
**발견된 후보, 재현된 결함, 고유 취약점, 패치 후보, 실제 반영된 수정은 서로 다른 단계**다.

## 사용 권한과 데이터 보존도 제품의 일부다

GPT-6 Cyber는 **승인된 Daybreak Red 사용자**에게 제공된다.[2]
최신 접근 가이드도 Red 승인과 **GPT-6 Cyber 모델별 추가 승인**을 구분하며, 개인용 일반 신청은 Blue 경로이고 Red는 승인된 조직 중심이라고 명시한다.[8]
현재 접근 여부는 발표 당시의 확대 계획이 아니라 조직·모델·워크스페이스·API 프로젝트의 실제 승인 상태로 확인해야 한다.[8]

Daybreak는 Blue의 방어 업무와 Red의 고급 승인 보안 연구를 구분하는 프로그램이다.[7]
그러나 승인이 제3자 대상에 대한 테스트 권한을 만들어 주지는 않으며, 현재 가이드는 고객 대상 서비스에 접근 권한을 재판매·프록시·확장하는 것도 허용하지 않는다.[8]

운영 조건에는 신원·자격 확인, 조직의 SSO·MFA·관리 기기, 기본 API IP 허용 목록 등이 포함된다.[2]
OpenAI는 격리 환경, 대상·자격 증명·네트워크·행동의 명시적 제한, 샌드박스와 행동 검토, 고위험 작업에 대한 인간 감독을 권고한다.[2]
모델의 권한 준수 성능이 좋아졌다고 이 통제를 생략할 근거가 되는 것은 아니다.

특히 **ZDR을 “어디에도 아무 기록도 남지 않는다”로 이해하면 안 된다.** GPT-6 Cyber의 기본값은 표준 데이터 보존이며, ZDR API 고객은 일부 승인된 예외를 제외하면 <strong>Private Safety Processing(PSP)</strong>을 사용해야 한다.[2]
PSP는 선택된 상호작용 기록을 암호화해 **고객이 통제하는 저장소에 30일간 보존**하고, 인간 접근을 막는 보호된 실행 환경에서 자동 안전 검토를 수행한다.[5]
운영 문서는 고객에게 **최소 30일 보존**과 더 일찍 삭제되지 않도록 하는 저장소 수명주기 설정을 요구한다.[5]

문서상 OpenAI 직원에게 프롬프트·응답 원문을 노출하지 않는 설계이지만, 제한된 안전 신호와 운영 메타데이터까지 사라지는 것은 아니다.[5]
보호된 런타임 안에서는 자동 검토를 위해 기록을 복호화하므로, 평문 처리가 전혀 없다는 뜻도 아니다.[5]
또한 ZDR의 엔드포인트·기능별 제약은 계속 적용된다.[6]
**학습에 사용하지 않는 것, 사람이 읽지 않는 것, 기록을 보관하지 않는 것은 서로 다른 조건**이다.[6]

## Critical은 안전 인증이 아니라 역량·위험 분류다

OpenAI는 자체 Preparedness Framework에서 Cyber와 Astra 모두를 사이버 역량 **Critical**로 분류한다.[2]
이는 방어 업무를 안전하게 완수한다는 인증이 아니라, 강한 역량에 맞는 보호조치가 필요하다는 맥락에서 읽어야 한다.

산업 제어·필수 서비스 등 고위험 지원에 대해서는 추가 보호장치를 두고, 별도 승인을 받은 핵심 인프라 방어자에게는 전용 접근 구성을 제공한다.[1][2]
아래 차트의 차단율은 민감한 레드팀 평가에서 보호장치가 요청을 표시한 비율이며, 정상 방어 업무의 과도한 거절률이나 실제 사고 차단율이 아니다.[2]

<figure>
  <div class="blog-figure-media" style="overflow-x:auto;overflow-y:hidden;">
    <img style="width:100%;min-width:640px;max-width:none;height:auto;" src="/images/blog/gpt-6-cyber-safeguards.webp" alt="민감한 레드팀 평가에서 Standard, Daybreak Blue, Daybreak Red, 핵심 인프라 전용 Red 구성의 보호장치 업데이트 전후 차단율을 비교한 차트" />
  </div>
  <figcaption>서로 다른 접근 권한 구성을 비교한다.[2]
핵심 인프라 방어자 전용 구성의 낮은 차단율을 모든 사용자에 대한 보호장치 부재로 읽어서는 안 된다.[2]</figcaption>
</figure>

## 정리

GPT-6 Cyber의 의미는 보안 모델의 점수 하나가 아니라 **발견 → 검증 → 영향 입증 → 패치 검토**를 더 크게 돌릴 수 있게 한 데 있다. 동시에 그 과정이 허가된 대상에만 머물도록 접근 승인·실행 격리·행동 검토·모니터링을 함께 요구한다.[1][2]

도입을 검토하는 팀이라면 탐지 건수만 보지 말고, 지정한 취약점으로 검증했는지, 패치가 실제 반영됐는지, 최종 보고에 한계가 남아 있는지, 기록이 어디에 얼마나 보존되는지를 함께 봐야 한다. **더 강한 보안 에이전트와 더 단단한 운영 경계는 대체재가 아니라 함께 필요한 조건**이다.

## Sources

[1] https://openai.com/index/introducing-gpt-6-cyber
[2] https://deploymentsafety.openai.com/gpt-6-cyber
[3] https://openai.com/index/a-thousand-fewer-paths-to-root
[4] https://www.mozilla.org/en-US/security/advisories/mfsa2026-118
[5] https://developers.openai.com/api/docs/guides/private-safety-processing
[6] https://developers.openai.com/api/docs/guides/your-data
[7] https://openai.com/daybreak
[8] https://help.openai.com/articles/20001258-trusted-access-for-cyber
[9] https://deploymentsafety.openai.com/gpt-6-cyber/gpt-6-cyber.pdf
