---
title: "SkillsMP는 흩어진 SKILL.md 생태계를 검색 가능한 마켓플레이스로 바꾼다"
date: "2026-05-06"
description: "SkillsMP는 GitHub 전역에 흩어진 SKILL.md 기반 에이전트 스킬을 수집해 의미 검색, 직군 분류, 카테고리 탐색, API 접근, 설치 가이드까지 한 화면으로 묶어 Claude Code·Codex·ChatGPT 시대의 스킬 발견 레이어를 만들고 있다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agents
  - SKILL.md
  - Claude Code
  - Codex
  - Developer Tools
draft: false
---

에이전트가 점점 더 많은 작업을 자동으로 수행하게 되면서, 병목은 모델 성능만이 아니라 어떤 작업 지식을 어디서 어떻게 발견하느냐로 이동하고 있다. 이미 SKILL.md 형식의 스킬은 Claude Code, Codex, ChatGPT 주변에서 빠르게 퍼지고 있지만, 정작 좋은 스킬을 찾는 일은 여전히 어렵다. GitHub 여기저기에 흩어진 저장소를 직접 뒤져야 하고, 어떤 스킬이 실제로 유지되는지, 어떤 직무나 문제에 맞는지, 설치 경로가 무엇인지 일일이 읽어야 한다.

`SkillsMP`는 바로 이 탐색 비용을 줄이려는 서비스다. 첫 화면은 이를 `Agent Skills Marketplace`라고 부르고, "open SKILL.md ecosystem"을 위한 검색/탐색 레이어라고 설명한다. 이 사이트는 GitHub에 공개된 에이전트 스킬을 모아 AI semantic search, 직군별 분류, 카테고리별 탐색, 공개 API, 설치 가이드까지 붙인다. 즉 새로운 스킬 표준을 만드는 프로젝트라기보다, 이미 등장한 스킬 생태계 위에 discovery layer를 얹는 프로젝트에 가깝다.

내가 보기에 SkillsMP의 핵심 가치는 단순한 디렉터리 이상의 것이다. 스킬이 늘어날수록 중요한 것은 "형식이 있느냐"보다 "찾을 수 있느냐"다. 누군가 좋은 SKILL.md를 공개해도 발견되지 않으면 조직 지식으로 이어지지 않는다. 그런 점에서 SkillsMP는 에이전트 시대의 GitHub 검색을 다시 설계하려는 시도처럼 읽힌다. 특히 스킬을 코드가 아니라 업무 노하우의 패키지로 보고, 이를 직군과 사용 맥락까지 포함해 정리하려 한다는 점이 흥미롭다.

![SkillsMP OG image](https://skillsmp.com/og-image.png)

## 무엇을 해결하려는가

SkillsMP가 푸는 문제는 아주 명확하다. 공개 스킬이 많아질수록, 사용자 입장에서 "어떤 스킬이 내 문제에 맞는가"를 찾는 비용이 급격히 커진다. About 페이지는 이 문제를 세 가지로 요약한다. 90만 개가 넘는 스킬이 GitHub 전역에 흩어져 있고, 사람들이 AI coding agent로 무엇을 만들고 있는지 파악하기 어렵고, 어떤 스킬이 전문가가 다듬은 것인지 아니면 대충 생성된 것인지 구분하기 어렵다는 것이다.

여기서 중요한 것은 이 서비스가 스킬을 단순한 자동화 스니펫이 아니라 전문 지식의 운반체로 본다는 점이다. About 페이지는 법률 검토 워크플로우, 세무 기준, 진단 프레임워크, 시니어 운영자의 성장 플레이북 같은 예를 들며, 숙련자의 암묵지가 퇴사와 함께 사라지지 않으려면 skill 형태로 명시화되어야 한다고 주장한다. 즉 SkillsMP는 "Claude용 플러그인 모음"보다 넓은 관점에서, 에이전트에 주입 가능한 업무 지식의 유통망을 만들려는 프로젝트다.

또 하나의 문제는 설치와 활용 맥락의 단절이다. FAQ는 많은 사용자가 skills와 slash commands의 차이, 설치 위치, 안전성, 여러 스킬의 조합 가능 여부조차 아직 헷갈려 한다는 점을 전제한다. SkillsMP는 단순 목록만 보여주는 것이 아니라, 문서 페이지에서 Skills vs MCP 차이, token efficiency, 언제 skills를 쓰고 언제 굳이 쓰지 않아도 되는지까지 설명한다. 이 점은 플랫폼이 검색엔진이면서 동시에 onboarding layer 역할도 한다는 뜻이다.

## 핵심 아이디어 / 구조 / 동작 방식

SkillsMP의 구조는 크게 다섯 층으로 읽을 수 있다. 첫째는 대규모 인덱싱 계층이다. 홈 화면과 timeline 페이지는 현재 스킬 수를 1,240,717개로 제시하고, timeline은 이 숫자가 GitHub 저장소의 last push time 기준으로 집계된다고 설명한다. 즉 단순 static 목록이 아니라, GitHub 변화를 따라가며 지속적으로 갱신되는 인덱스를 전제로 한다.

둘째는 검색 및 발견 계층이다. 홈 화면은 keyword search뿐 아니라 `AI semantics`를 전면에 내세우고, 검색 페이지는 인기순/최신순 정렬, occupation filter, author/source 표기를 제공한다. 이는 스킬을 단순 파일 이름으로 찾게 하지 않고, 사용 목적과 맥락 중심으로 재정렬하려는 설계다. 특히 skill card에 원본 GitHub 저장소, 간단한 설명, 최근 업데이트 날짜를 같이 노출하는 방식은 "발견"과 "품질 추정"을 동시에 처리하려는 의도가 보인다.

셋째는 분류 계층이다. 이 사이트는 두 가지 분류 축을 함께 운영한다. 하나는 23 major groups와 867 SOC occupations 기반의 직군 분류이고, 다른 하나는 Tools, Business, Development, Data & AI, DevOps 같은 카테고리 분류다. 직군 분류는 스킬을 "누가 쓰는가" 기준으로, 카테고리 분류는 "무엇을 하는가" 기준으로 조직한다. 이 이중 축 덕분에 예를 들어 같은 git automation 스킬도 개발자 관점과 업무 기능 관점에서 각각 접근할 수 있다.

넷째는 문서/교육 계층이다. docs 페이지는 skills의 핵심 장점을 token efficiency, domain expertise, progressive loading으로 설명하고, Skills와 MCP가 서로 다른 문제를 푼다고 분리해서 소개한다. FAQ는 설치 경로를 `~/.claude/skills/`, `.claude/skills/`, `~/.codex/skills/`처럼 구체적으로 적고, skill은 model-invoked이며 slash command는 user-invoked라는 차이도 정리한다. 즉 SkillsMP는 스킬을 모아 보여주는 것에서 끝나지 않고, 스킬이라는 개념 자체를 사용자에게 학습시키는 역할까지 맡는다.

다섯째는 배포/API 계층이다. 홈 화면은 `GET /api/v1/skills 200 OK`와 함께 1200k+ skills에 대한 REST API 접근을 홍보한다. 또한 docs/about/footer 영역에서 Claude Skills 문서, Anthropic 공식 skills 저장소, Codex skills 문서, Agent Skills Spec으로 연결한다. 이 구조는 SkillsMP가 폐쇄형 마켓플레이스가 아니라, 오픈 SKILL.md 생태계의 index + guide + API provider가 되려 한다는 점을 보여준다.

| 계층 | 공개 자료에서 확인되는 구성요소 | 역할 |
|---|---|---|
| Indexing | 1,240,717 skills, GitHub last push time 기반 집계 | 분산된 public skill 생태계를 지속 수집 |
| Search | AI semantic search, keyword search, sort, author/source 노출 | 원하는 스킬을 더 빨리 찾도록 지원 |
| Classification | 23 major groups, 867 occupations, 12 top-level categories | 직무와 기능 두 축으로 스킬을 정리 |
| Docs & Education | Skills vs MCP, install guides, FAQ, official links | 초심자 onboarding과 개념 정리 |
| API & Integration | `/api/v1/skills`, public docs, external spec links | 외부 서비스와 개발자 통합 표면 제공 |

## 공개된 근거에서 확인되는 점

가장 먼저 눈에 띄는 것은 규모다. 라이브 홈 화면과 timeline 페이지는 총 스킬 수를 1,240,717개로 보여 준다. occupation 분류는 23개 major group, 867개 SOC occupations를 제시하고, 홈 화면에서는 분류 완료율이 69%라고 나온다. 카테고리 축은 12개 도메인으로 구성되며, timeline 페이지 기준 Tools 295,223개(22.9%), Business 219,501개(17.0%), Development 181,461개(14.0%), Testing & Security 128,718개(10.0%), Data & AI 116,647개(9.0%) 순으로 크다.

흥미로운 점은 사이트 안에서도 숫자 표면이 완전히 같지는 않다는 것이다. meta description과 About 페이지 일부 문구는 여전히 `900000+` skills라고 설명하는 반면, 홈과 timeline의 라이브 카운터는 1,240,717을 가리킨다. 이는 플랫폼이 빠르게 확장되는 동안 고정 카피가 실시간 집계를 따라가지 못하고 있다는 신호로 읽힌다. 오히려 이런 불일치는 이 서비스가 실제로 지속 갱신되는 인덱스를 갖고 있다는 간접 증거이기도 하다.

문서 측면에서도 메시지가 분명하다. docs 페이지는 skill의 장점으로 lazy loading 기반 token efficiency를 전면에 세우고, FAQ는 Anthropic이 2025년 12월 Agent Skills specification을 공개했고 OpenAI도 Codex CLI와 ChatGPT에서 같은 형식을 채택했다고 설명한다. 또 안전성 문답에서는 최소 2 stars 이상의 저장소만 기본 필터링하고 기본 quality indicator를 확인한다고 적으면서도, 실제 설치 전에는 사용자가 코드를 검토해야 한다고 못 박는다. 과장보다 현실적인 경계선을 그으려는 태도가 보인다.

About 페이지는 제품 포지셔닝도 명확히 말한다. SkillsMP는 Anthropic이나 OpenAI의 공식 제품이 아니라 독립 커뮤니티 프로젝트이며, 9개 언어 지원, AI semantic search, occupation classification, one-click installation command, public API를 제공한다고 적혀 있다. 홈 상단의 Manus 연동 배너는 별도의 상업/배포 채널을 실험하는 표면처럼 보이지만, 코어 사이트 자체는 SKILL.md 생태계의 검색 허브 역할에 집중한다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| 홈 / timeline | 총 1,240,717 skills, timeline 기반 활동 집계 | 대규모 live index를 운영 중 |
| occupations / categories | 23 major groups, 867 occupations, 12 categories, 69% classified | 단순 검색을 넘는 분류 체계 구축 |
| docs | Skills vs MCP, token efficiency, install/use guidance | discovery뿐 아니라 교육 레이어까지 제공 |
| FAQ | `~/.claude/skills/`, `.claude/skills/`, `~/.codex/skills/`, 안전성 주의 | 실제 설치/운영 흐름에 맞춘 실용 문서 |
| about | independent community project, 9 languages, API, one-click install | 공식 벤더가 아닌 생태계 인프라 포지션 |

## 실무 관점에서의 해석

내가 보기에 SkillsMP의 가장 큰 의미는 에이전트 도구 생태계에 "발견 인프라"가 필요하다는 사실을 보여준다는 점이다. 좋은 모델, 좋은 스킬 포맷, 좋은 런타임이 모두 있어도, 사용자가 적절한 스킬을 찾지 못하면 네트워크 효과는 생기지 않는다. SkillsMP는 이 병목을 풀기 위해 GitHub의 비정형 skill 저장소를 검색 가능한 product surface로 바꾸고 있다.

특히 직군 분류를 붙인 점이 인상적이다. 대부분의 개발자 도구는 기능별 taxonomy에는 익숙하지만, occupation-based discovery까지 가는 경우는 드물다. 그런데 skill의 본질이 "업무 방식의 패키징"이라면, 직군별 탐색은 생각보다 훨씬 자연스럽다. 이는 스킬 생태계가 개발자 취미용 프롬프트를 넘어, 실제 산업별 workflow asset으로 이동할 가능성을 보여준다.

동시에 한계도 분명하다. 첫째, 수집 기반 마켓플레이스인 만큼 품질의 핵심은 결국 원본 저장소에 있다. SkillsMP 스스로도 최소 필터링만 제공하고, 사용자가 코드를 검토해야 한다고 말한다. 둘째, 현재는 스킬의 발견과 설명에는 강하지만, 실행 결과 품질이나 유지보수 수준을 얼마나 정교하게 랭킹할 수 있는지는 별도 문제다. 셋째, 숫자 카피가 900k와 1.24M 사이에서 섞여 보이는 점은 제품이 빠르게 성장하는 단계의 흔한 흔적이지만, 신뢰성 측면에서는 더 정제된 통계 표면이 필요해 보인다.

그럼에도 방향성은 분명하다. SKILL.md 생태계가 커질수록 승자는 가장 많은 스킬을 가진 쪽이 아니라, 가장 잘 찾고, 가장 잘 분류하고, 가장 잘 설치하게 도와주는 쪽일 가능성이 높다. 그런 의미에서 SkillsMP는 또 하나의 skill repo가 아니라, agent skills 시대의 검색엔진이자 카탈로그 인프라로 보는 편이 맞다.

Sources: https://skillsmp.com/, https://skillsmp.com/docs, https://skillsmp.com/categories, https://skillsmp.com/timeline, https://skillsmp.com/about, https://github.com/anthropics/skills, https://github.com/openai/codex/blob/main/docs/skills.md, https://agentskills.io/
