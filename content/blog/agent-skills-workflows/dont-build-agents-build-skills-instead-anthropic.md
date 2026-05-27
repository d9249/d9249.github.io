---
title: "Anthropic의 Agent Skills는 에이전트를 더 만들기보다 전문성 폴더를 만들라고 말한다"
date: "2026-05-19T07:09:04"
description: "Barry Zhang과 Mahesh Murag의 AI Engineer 발표는 Claude Code와 MCP 이후의 에이전트 병목이 연결성이 아니라 도메인 전문성이라고 보고, SKILL.md·스크립트·참조 파일을 묶은 Agent Skills를 런타임 옆의 지식 패키지로 제안한다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - Anthropic
  - Claude
  - Agent Skills
  - MCP
  - AI Engineer
  - YouTube
draft: false
---

에이전트가 실제 업무에 들어오기 시작하면서 질문의 중심이 조금 바뀌고 있다. 작년까지의 질문이 “언제 agent를 만들 것인가”였다면, 이제는 “모든 도메인마다 agent를 다시 만들어야 하는가”에 가깝다. Anthropic의 Barry Zhang과 Mahesh Murag가 AI Engineer에서 발표한 **`Don't Build Agents, Build Skills Instead`**는 이 변화를 매우 직접적으로 말한다. 더 많은 agent scaffolding을 만드는 대신, 재사용 가능한 **domain expertise**를 skill로 포장하자는 것이다.

이 발표는 앞선 Anthropic의 effective agent 논의와 이어진다. agent의 공통 골격은 점점 얇아지고 있다. 모델은 런타임 환경과 결합되고, 파일 시스템과 Bash, Python, API 호출 같은 코드 인터페이스를 통해 다양한 디지털 작업을 수행한다. 그런데 실제 업무에서 남는 병목은 “모델이 충분히 똑똑한가”보다 “처음부터 필요한 절차 지식과 조직 맥락을 갖고 있는가”다. Anthropic은 이 지점을 **Agent Skills**로 풀려고 한다.

내가 보기에 이 발표의 핵심은 다음 한 문장으로 요약된다. **에이전트 플랫폼의 차별점은 점점 모델 루프 자체가 아니라, 그 루프가 필요할 때 꺼내 쓸 수 있는 절차 지식의 품질과 배포 방식으로 이동하고 있다.** Skills는 그 절차 지식을 폴더, `SKILL.md`, 스크립트, 참조 파일, 자산으로 다루는 제안이다.

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/CEvIs9y1uog"
    title="Video: Don't Build Agents, Build Skills Instead — Barry Zhang & Mahesh Murag, Anthropic"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"
  ></iframe>
</div>

영상은 AI Engineer 채널에 2025-12-08 업로드된 약 16분짜리 발표다. YouTube metadata 기준 제목은 **`Don't Build Agents, Build Skills Instead – Barry Zhang & Mahesh Murag, Anthropic`**이고, 설명란은 Skills를 “procedural knowledge를 동적으로 로드할 수 있는 minimal form factor”로 소개한다. 공식 chapter는 제공되지 않아, 아래 타임라인은 transcript와 화면 전환을 기준으로 재구성했다.

| 구간 | 발표 내용 | 글에서 보는 포인트 |
|---|---|---|
| 00:21-00:50 | “우리는 agent를 만들기보다 skills를 만들기 시작했다”는 문제 제기 | agent intelligence와 domain expertise의 분리 |
| 00:51-02:10 | MCP, Claude Code, Claude Agent SDK 이후 agent runtime이 성숙했다는 배경 | code가 디지털 세계의 universal interface라는 주장 |
| 02:11-03:24 | tax professional 비유와 Agent Skills 정의 | 모델 지능만으로는 일관된 전문 실행이 어렵다는 진단 |
| 03:33-04:58 | skill은 폴더이고, scripts as tools를 포함할 수 있음 | 도구 설명보다 수정 가능하고 실행 가능한 절차 패키지 |
| 04:59-07:25 | foundational, partner, enterprise/team skills 생태계 | skill이 개인 prompt가 아니라 조직 지식 배포 단위로 확장 |
| 07:28-09:04 | skill 복잡도 증가, MCP와의 보완 관계, non-technical builder | MCP는 연결성, skills는 전문성이라는 역할 분리 |
| 09:07-11:57 | general agent architecture와 skill lifecycle 과제 | testing, evaluation, versioning, dependency가 필요해짐 |
| 12:02-14:29 | 공유, 조직 지식베이스, Claude가 스스로 skill을 만드는 방향 | continuous learning의 구체적 저장 단위 |
| 14:33-16:01 | processor, OS, application 계층 비유 | agent runtime 위 애플리케이션 계층으로서 skills |

## 왜 “코드가 전부”라고 말하는가

발표 초반의 배경은 agent scaffolding의 수렴이다. Anthropic은 MCP가 agent connectivity의 표준으로 자리 잡았고, Claude Code와 Claude Agent SDK를 통해 production-ready agent를 더 쉽게 만들 수 있게 됐다고 설명한다. 이 흐름에서 agent는 점점 모델과 런타임 환경이 강하게 결합된 형태로 간다.

Barry는 이를 “code is all we need”라는 강한 문장으로 압축한다. 여기서 code는 단지 소프트웨어 개발이라는 use case가 아니다. 발표의 표현처럼 code는 **digital world의 universal interface**다. 금융 리포트를 만든다고 생각해 보면, 모델은 API로 데이터를 가져오고, 파일 시스템에 자료를 정리하고, Python으로 분석하고, 최종 리포트를 문서 파일로 합성할 수 있다. 이 모든 과정이 code를 통해 이어진다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/build-skills-code-universal-interface.webp"
    alt="Slide saying code is the universal interface, connecting coding agent to many use cases"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    01:45 전후 슬라이드. 발표는 coding agent를 좁은 코딩 도구가 아니라 API, 파일, 문서, 웹, 데이터 분석을 모두 다루는 범용 디지털 인터페이스로 본다. 이 관점에서는 agent scaffolding이 생각보다 얇아질 수 있다.
  </figcaption>
</figure>

이 관점은 중요한 전환이다. 예전에는 금융 agent, 법무 agent, 리서치 agent, 문서 agent가 각자 다른 tool과 scaffold를 가져야 한다고 생각하기 쉬웠다. 하지만 Anthropic이 Claude Code를 만들면서 얻은 결론은, underlying agent는 예상보다 universal하고, 차이는 대개 **어떤 전문 지식을 언제 로드하느냐**에 있다는 것이다.

즉 agent의 공통 운영면은 Bash, file system, code execution처럼 단순해질 수 있다. 문제는 그 다음이다. 얇은 runtime은 다양한 작업을 열어 주지만, domain expertise까지 자동으로 생기게 하지는 않는다.

## 병목은 지능이 아니라 전문성이다

발표에서 가장 좋은 비유는 세금 신고다. 누가 내 세금을 처리하길 원하는가. 300 IQ 수학 천재 Mahesh인가, 아니면 경험 많은 tax professional Barry인가. 발표자는 Barry를 고르겠다고 말한다. 이유는 간단하다. 2025년 세법을 매번 first principles로 다시 추론하는 사람이 아니라, 이미 절차와 예외와 관행을 알고 일관되게 실행하는 전문가가 필요하기 때문이다.

이 비유는 agent의 현재 한계를 잘 찌른다. 모델은 매우 똑똑하지만, real work에 필요한 중요 맥락을 처음부터 갖고 있지 않다. 사용자가 충분히 안내하면 놀라운 일을 할 수 있지만, 그 안내는 매번 반복되기 쉽다. 더 큰 문제는 지금의 agent가 사용자의 전문성을 잘 흡수하거나 시간이 지나며 자동으로 학습하지 못한다는 점이다.

Anthropic이 Skills를 꺼내는 지점이 여기다. Skills는 agent에게 새로운 model weight를 주입하는 방식이 아니라, **절차 지식을 파일 시스템에 정리해 두고 필요할 때 로드하게 하는 방식**이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/build-skills-introducing-agent-skills.webp"
    alt="Slide introducing Agent Skills as the missing expertise layer"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    02:56 전후 슬라이드. 발표는 Agent Skills를 “composable procedural knowledge”를 포장하는 방식으로 소개한다. 핵심은 새로운 agent를 도메인마다 만들기보다, 같은 agent가 꺼내 쓸 수 있는 전문 절차를 늘리는 것이다.
  </figcaption>
</figure>

공식 문서도 같은 정의를 쓴다. Claude의 Skills overview는 skills를 “특정 작업을 처리하기 위해 Claude가 동적으로 로드하는 instructions, scripts, resources가 들어 있는 directories”라고 설명한다. Agent Skills 표준 문서 역시 skill의 최소 단위를 `SKILL.md`가 들어 있는 folder로 정의하고, scripts, references, templates 같은 자원을 함께 묶을 수 있다고 말한다.

## Skills는 폴더라는 점이 중요하다

발표에서 반복되는 말은 의외로 단순하다. **Skills are folders.** 이 단순함은 우연이 아니다. Anthropic은 사람이든 agent든 컴퓨터만 있으면 만들고 읽고 수정하고 공유할 수 있는 최소 단위를 원한다. folder는 Git으로 versioning할 수 있고, Google Drive에 넣을 수 있고, zip으로 공유할 수 있다. 이미 수십 년 동안 사용해 온 primitive이기 때문에, 새 플랫폼을 강요하지 않는다.

하나의 skill은 대략 다음 구성으로 읽을 수 있다.

| 구성요소 | 역할 | 왜 중요한가 |
|---|---|---|
| `SKILL.md` frontmatter | name, description 같은 trigger metadata | agent가 “언제 이 skill을 쓸지” 판단하는 최소 표면 |
| `SKILL.md` body | 절차, 원칙, 작업 단계, 주의사항 | skill이 활성화됐을 때 agent가 따를 핵심 지침 |
| references | 긴 문서, 규정, 예시, 스타일 가이드 | 모든 내용을 context에 항상 넣지 않고 필요할 때만 탐색 |
| scripts | 반복적·결정론적 작업을 수행하는 실행 코드 | token generation보다 안정적이고 재현 가능한 처리 |
| templates/assets | 산출물 양식, 이미지, 샘플 파일 | 조직의 결과물 표준을 그대로 재사용 |

이 구조가 “prompt 모음”과 다른 점은 scripts를 일급 구성요소로 둔다는 것이다. 발표에서는 Claude가 슬라이드 스타일링을 위해 같은 Python script를 반복해서 작성하는 장면을 예로 든다. 그때마다 새로 쓰게 하지 말고 skill 폴더 안에 tool로 저장하면, 다음번에는 agent가 그 script를 실행하면 된다. 이는 더 일관되고 더 효율적이다.

기존 tool description은 종종 애매하고, model이 실패해도 tool 자체를 바꾸기 어렵다. 또한 tool 설명은 context window에 계속 남아 비용을 만든다. 반면 code는 self-documenting할 수 있고, 수정 가능하며, 실제로 필요할 때까지 파일 시스템에 머무를 수 있다. Skill은 이 차이를 적극적으로 활용한다.

## Progressive disclosure가 확장성을 만든다

Skills가 많은 정보를 품으려면 context window를 보호해야 한다. 이 때문에 발표와 공식 문서는 모두 **progressive disclosure**를 핵심 설계 원칙으로 둔다. agent는 모든 skill의 전체 내용을 항상 읽지 않는다. 시작 시에는 name과 description 같은 metadata만 보고, 관련 작업이 들어왔을 때 `SKILL.md`를 읽고, 더 필요한 경우에만 reference나 script를 탐색한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/build-skills-progressive-disclosure.webp"
    alt="Slide explaining that skills are progressively disclosed"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    04:31 전후 슬라이드. Skills의 metadata는 항상 보이지만, 본문과 보조 파일은 필요할 때만 열린다. Claude docs는 이 방식을 metadata loading, activation, resource loading의 세 단계로 설명한다.
  </figcaption>
</figure>

이 설계는 scale을 위해 중요하다. 수백 개나 수천 개의 skill을 한 agent에 붙인다고 해서 모든 문서가 context에 들어오면, 비용과 혼선이 폭발한다. 하지만 metadata만 얇게 유지하고 나머지를 파일 시스템에 둔다면, skill library는 훨씬 커질 수 있다. Anthropic engineering 글은 이를 “잘 정리된 매뉴얼”에 비유한다. 처음에는 목차만 보고, 필요한 장을 열고, 더 필요하면 부록을 보는 방식이다.

여기서 `description`의 품질은 매우 중요해진다. agent가 어떤 skill을 로드할지는 metadata에 크게 의존한다. 그래서 skill authoring은 단순한 문서 작성이 아니라 **trigger design**이기도 하다. 너무 넓게 쓰면 엉뚱한 skill이 자주 로드되고, 너무 좁게 쓰면 필요한 순간에 skill이 작동하지 않는다.

## Skills와 MCP는 경쟁 관계가 아니다

발표 중반의 중요한 정리는 Skills와 MCP의 역할 분리다. MCP는 agent가 외부 세계와 연결되는 표준 인터페이스를 제공한다. 데이터베이스, SaaS, browser, repository, internal tool 같은 것들이 MCP를 통해 들어올 수 있다. 반면 Skills는 그 연결을 **어떤 절차로 써야 하는지**를 알려준다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/build-skills-mcp-complement.webp"
    alt="Slide saying skills complement MCP servers in the skills ecosystem"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    08:08 전후 슬라이드. 발표자는 MCP가 outside world와의 connection을 제공하고, skills가 domain expertise를 제공한다고 구분한다. 복잡한 workflow에서는 skill이 여러 MCP tool을 엮는 절차 지식이 될 수 있다.
  </figcaption>
</figure>

| 계층 | 주로 푸는 문제 | 예시 |
|---|---|---|
| Runtime | agent가 코드를 실행하고 파일을 읽고 쓸 환경 | Bash, filesystem, Python, browser |
| MCP | 외부 서비스와 데이터에 접근하는 연결 표준 | Notion, Browserbase/Stagehand, internal SaaS, database |
| Skills | 어떤 순서와 기준으로 작업할지에 대한 전문 절차 | 리포트 작성 절차, 문서 스타일링, 생명과학 분석, 사내 코드 스타일 |
| Model loop | context를 보고 다음 행동을 결정하는 추론 엔진 | Claude가 skill을 읽고 tool/script를 호출 |

이 구분을 받아들이면 agent 제품을 새로 만들 때의 방식이 달라진다. 새 도메인에 들어갈 때 매번 완전히 다른 agent를 만들 필요가 줄어든다. 같은 general agent에 올바른 MCP server와 skill library를 장착하는 방식으로 수직 도메인에 진입할 수 있다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/build-skills-complete-picture.webp"
    alt="Slide showing the complete picture: an agent loop with skills"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    09:07 전후 슬라이드. 발표의 “complete picture”는 agent loop, runtime environment, MCP servers, 그리고 필요할 때 로드되는 skill library를 한 구조로 묶는다. 여기서 skill은 agent의 고정 prompt가 아니라 runtime 주변의 지식 패키지다.
  </figcaption>
</figure>

Anthropic은 이 패턴이 금융 서비스와 생명과학 같은 vertical offering에도 이미 쓰이고 있다고 말한다. 발표 시점 기준으로 Skills launch 이후 몇 주 만에 새로운 vertical 제품이 MCP server와 skill set을 함께 들고 나왔다는 설명이다. 이 대목은 Skills가 단순 productivity feature가 아니라 Anthropic의 enterprise deployment 전략과 맞물려 있음을 보여준다.

## Skill은 점점 소프트웨어처럼 다뤄져야 한다

흥미로운 점은 Anthropic이 Skills의 미래 과제를 거의 소프트웨어 공학의 언어로 말한다는 것이다. 발표는 skill이 점점 복잡해지고 있다고 말한다. 초기 skill은 prompt와 간단한 instruction을 담은 `SKILL.md` 파일 하나일 수 있다. 하지만 점점 executables, binaries, code, scripts, assets, dependencies를 포함하게 된다. 어떤 skill은 몇 분 만에 만들 수 있지만, 앞으로는 몇 주나 몇 달 동안 유지보수되는 skill도 생길 수 있다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/build-skills-evolution-versioning-composability.webp"
    alt="Slide exploring how skills evolve, with evaluation, versioning, and composability columns"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    10:37 전후 슬라이드. Anthropic은 skill lifecycle의 다음 과제로 evaluation, versioning, composability를 든다. skill이 업무 자산이 되려면 “잘 썼다”가 아니라 성능 측정, 변경 이력, 의존성 관리가 필요하다.
  </figcaption>
</figure>

이 관점에서 필요한 것은 세 가지다.

| 과제 | 왜 필요한가 | 실무에서 생기는 질문 |
|---|---|---|
| Testing / evaluation | skill이 실제로 output quality를 높이는지 확인해야 함 | skill 적용 전후 성공률, 오류 유형, task score를 어떻게 측정할 것인가 |
| Versioning | skill 변경이 agent behavior를 바꿀 수 있음 | 어떤 버전의 skill이 어떤 산출물과 사고를 만들었는지 추적 가능한가 |
| Dependencies / composability | skill이 다른 skill, MCP server, package에 의존할 수 있음 | 환경이 바뀌어도 같은 skill이 예측 가능하게 작동하는가 |

이 지점이 특히 중요하다. 많은 조직에서 “좋은 프롬프트를 모아 두자”는 시도는 쉽게 시작되지만, 시간이 지나면 어느 문서가 최신인지, 어떤 업무에서 쓰이는지, 결과 품질이 실제로 좋아졌는지 알기 어려워진다. Anthropic의 Skills 논의는 이 문제를 처음부터 lifecycle 문제로 본다. skill은 prompt snippet이 아니라 작은 software artifact이기 때문이다.

## 공유와 continuous learning의 단위가 된다

발표 후반은 Skills의 네트워크 효과를 말한다. 조직 안에서 사람과 agent가 함께 curated knowledge base를 만들고, 새로 들어온 사람이 Claude를 처음 써도 팀이 중요하게 여기는 방식과 절차를 이미 알게 되는 상태를 상상한다. 이때 skill은 단순한 memory가 아니다. 특정 task에서 실행 가능한 procedural knowledge다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/build-skills-sharing-distribution.webp"
    alt="Slide showing skills shared across users as an evolving knowledge base"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    12:02 전후 슬라이드. 발표는 skill을 조직 안에서 축적되고 공유되는 capability의 단위로 본다. 사용자와 agent가 피드백을 주며 skill을 개선하면, 같은 조직의 다른 agent도 그 지식을 재사용할 수 있다.
  </figcaption>
</figure>

이 관점은 Claude가 스스로 skill을 만들 수 있다는 방향과도 연결된다. 발표자는 standardized format이 중요한 이유를 “Claude가 적어 둔 것을 미래의 Claude가 효율적으로 사용할 수 있다”는 보장으로 설명한다. 즉 skill은 continuous learning을 위한 구체적 저장 단위다. 모든 대화와 기억을 다 저장하는 것이 아니라, 특정 작업에 재사용 가능한 절차 지식을 뽑아 skill로 만든다.

이것은 현재 많은 AI agent 시스템이 겪는 memory 문제를 현실적으로 좁힌다. “모든 것을 기억하는 agent”는 매력적인 표현이지만, 실제로 중요한 것은 무엇을 어떤 구조로 저장할지다. Skills는 이 범위를 절차 지식으로 제한한다. 그 덕분에 유지보수, 검색, 평가, 폐기까지 논의할 수 있다.

## processor, OS, application 비유

마지막 비유는 computing stack이다. 모델은 processor와 비슷하다. 막대한 투자가 들어가고 엄청난 잠재력을 갖지만, 그 자체만으로는 제한적이다. OS는 processor 주변의 process, resource, data를 조율해서 훨씬 유용하게 만든다. Anthropic은 agent runtime이 AI에서 이 OS 같은 역할을 하기 시작했다고 본다.

그 위에 진짜 가치가 생기는 층이 application이다. 소수의 회사가 processor와 OS를 만들지만, 수많은 개발자가 domain expertise와 관점을 담은 software를 만든다. Skills는 이 application layer를 agent 시대에 열어 주려는 시도다. 발표의 결론인 “Stop building agents, build skills instead”는 agent runtime 위에서 무엇을 만들어야 하는지에 대한 답이다.

내 해석은 조금 더 실무적이다. 앞으로 agent 조직의 경쟁력은 “어떤 모델을 쓰는가”와 함께 “어떤 skill library를 축적했는가”로 갈 가능성이 크다. 법무팀, 재무팀, 연구팀, 개발팀이 자기 업무 절차를 skill로 만들고, 그것이 MCP와 internal system에 연결되면, agent는 단순 채팅창이 아니라 조직의 운영 절차를 실행하는 인터페이스가 된다.

## 실무적으로 조심해야 할 점

물론 Skills가 마법은 아니다. 오히려 powerful하기 때문에 위험도 명확하다. Anthropic engineering 글은 skills가 instructions와 code를 통해 Claude에 새로운 capability를 주기 때문에, 악성 skill은 환경 취약점, 데이터 유출, 의도치 않은 행동을 유발할 수 있다고 경고한다. 신뢰할 수 없는 skill은 설치 전에 파일 내용, code dependency, 외부 네트워크 접근 지시를 반드시 검토해야 한다.

또 하나의 한계는 activation 품질이다. progressive disclosure는 context efficiency를 주지만, agent가 적절한 skill을 적절한 순간에 찾지 못하면 효과가 약해진다. 따라서 좋은 skill 운영은 다음 루프를 필요로 한다.

1. 실제 task에서 agent가 어디서 반복적으로 실패하는지 관찰한다.
2. 그 실패를 줄이는 절차와 scripts를 skill로 만든다.
3. description과 trigger 조건을 조정한다.
4. 적용 전후 결과를 평가한다.
5. skill version을 관리하고 낡은 절차를 폐기한다.

즉 Skills는 “한 번 써 두는 프롬프트”가 아니라 **계속 다듬는 운영 자산**이다. 발표가 “skills를 software처럼 다루자”고 말하는 이유도 여기에 있다.

## 결론: 에이전트의 다음 병목은 작업 지식의 supply chain이다

이 영상은 Anthropic이 agent를 포기하자는 이야기가 아니다. 오히려 general agent architecture가 어느 정도 수렴하고 있으니, 다음 병목은 agent를 도메인마다 새로 만드는 것이 아니라 전문성을 공급하는 방식이라고 말한다. MCP가 연결성을, runtime이 실행 환경을, 모델이 추론을 담당한다면, Skills는 **업무 절차와 조직 지식을 재사용 가능한 패키지로 공급하는 레이어**다.

그래서 “Don’t build agents, build skills instead”는 과장이지만 유용한 과장이다. 모든 팀이 새 agent framework를 만드는 것보다, 이미 있는 agent가 더 잘 일하게 만드는 절차 지식을 쌓는 편이 더 빠르고 확장 가능할 때가 많다. 특히 조직 내부의 규정, 스타일, 툴 사용법, 검증 절차, 보고서 양식, domain workflow는 모델 weight에 넣는 것보다 skill 폴더로 관리하는 편이 훨씬 현실적이다.

앞으로 agent 제품을 볼 때는 모델 성능표만 보면 부족하다. 그 제품이 어떤 skill discovery를 지원하는지, skill을 어떻게 versioning하고 평가하는지, MCP와 어떻게 결합하는지, 그리고 사용자가 성공한 절차를 미래의 agent가 재사용할 수 있게 저장하는지 봐야 한다. 이 발표는 바로 그 관점 전환을 보여준다.

Sources: https://www.youtube.com/watch?v=CEvIs9y1uog, https://claude.com/blog/skills, https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills, https://claude.com/docs/skills/overview, https://agentskills.io/, https://github.com/anthropics/skills, https://twitter.com/barry_zyj, https://twitter.com/MaheshMurag
