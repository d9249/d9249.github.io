---
title: "Anthropic Knowledge Work Plugins는 Claude를 업무별 전문가로 세팅하는 공식 플러그인 모음이다"
date: "2026-05-28T17:13:57"
description: "anthropics/knowledge-work-plugins는 Claude Cowork와 Claude Code에서 영업·지원·데이터·법무·재무 같은 지식노동 워크플로를 빠르게 시작하도록 만든 Apache-2.0 플러그인 카탈로그다."
author: "Sangmin Lee"
repository: "anthropics/knowledge-work-plugins"
sourceUrl: "https://github.com/anthropics/knowledge-work-plugins"
status: "Open source plugin catalog"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Claude Cowork"
  - "Claude Code"
  - "Agent Plugins"
  - "MCP"
  - "Knowledge Work"
  - "Productivity"
highlights:
  - "Anthropic이 공개한 Apache-2.0 저장소로, README는 Claude Cowork용 업무별 플러그인이며 Claude Code에도 호환된다고 설명한다."
  - "GitHub API 조사 시점 기준 stars 17,499, forks 2,039, open issues 135이며, releases와 tags는 아직 반환되지 않았다."
  - "README 표는 11개 플러그인을 소개하지만, 현재 main 브랜치에는 manifest가 있는 최상위 플러그인 디렉터리 17개가 확인된다."
  - "각 플러그인은 `.claude-plugin/plugin.json`, `.mcp.json`, `skills/`, 선택적 `commands/`로 구성되는 파일 기반 번들이라 fork·수정·사내 표준화가 쉽다."
  - "Slack, Notion, Jira, HubSpot, BigQuery, Snowflake 같은 MCP connector를 전제로 하므로 설치 전 권한·데이터 범위·회사별 커스터마이징 정책을 먼저 정해야 한다."
draft: false
---

Claude를 업무용으로 쓰기 시작하면 곧 “모델이 똑똑한가”보다 “우리 팀의 맥락, 도구, 산출물 형식을 얼마나 일관되게 알고 있는가”가 더 중요해진다. 영업 콜 준비, 고객지원 escalation, 월마감, 제품 스펙, 데이터 질의처럼 반복되지만 도메인 규칙이 많은 업무에서는 매번 긴 프롬프트를 붙이는 방식이 금방 한계에 부딪힌다.

`anthropics/knowledge-work-plugins`는 이 문제를 Claude plugin 형태로 풀려는 Anthropic 공식 오픈소스 카탈로그다. README는 “Claude를 역할·팀·회사에 맞는 specialist로 바꾸는 플러그인”이라고 설명하고, Claude Cowork용으로 만들어졌지만 Claude Code와도 호환된다고 밝힌다. 저장소 라이선스는 Apache-2.0이고, GitHub API 조사 시점에는 stars 17,499, forks 2,039, open issues 135, 기본 브랜치 `main`, 릴리스·태그 없음으로 확인됐다.

흥미로운 점은 README와 실제 트리 사이에 약간의 시차가 있다는 점이다. README 표는 productivity, sales, customer-support, product-management, marketing, legal, finance, data, enterprise-search, bio-research, cowork-plugin-management 등 11개 플러그인을 소개한다. 반면 현재 `main` 브랜치에서 `.claude-plugin/plugin.json`이 있는 최상위 디렉터리를 세면 17개가 나온다. 추가로 design, engineering, human-resources, operations, pdf-viewer, small-business 같은 번들도 이미 들어와 있다. 빠르게 변하는 카탈로그이므로 팀 문서에 인용할 때는 README 숫자만 보지 말고 실제 트리도 같이 확인하는 편이 좋다.

## 어떤 문제를 푸는가

이 저장소의 핵심은 “Claude에게 특정 직무의 기본 operating manual을 주입하는 파일 묶음”이다. 각 plugin은 대체로 다음 구조를 따른다.

```text
plugin-name/
├── .claude-plugin/plugin.json   # plugin manifest
├── .mcp.json                    # 외부 도구 connector 설정
├── commands/                    # 사용자가 명시적으로 부르는 slash command
└── skills/                      # Claude가 상황에 맞춰 참고하는 업무 지식과 절차
```

`skills/`에는 call prep, write spec, reconciliation, ticket triage, research synthesis 같은 업무별 절차가 Markdown으로 들어간다. `.mcp.json`은 Slack, Notion, Jira, HubSpot, BigQuery, Snowflake, Figma, Intercom, Microsoft 365, Google Calendar/Gmail 같은 외부 도구와 연결되는 MCP 서버를 정의한다. 즉 이 repo 자체가 CRM이나 데이터웨어하우스 API를 구현하는 것이 아니라, Claude가 어떤 connector를 통해 어떤 절차로 일해야 하는지를 묶어 놓은 starting point에 가깝다.

README는 slash command 예시로 `/sales:call-prep`, `/data:write-query`를 들지만, 현재 트리에서 `commands/` 디렉터리가 모든 plugin에 고르게 들어 있는 것은 아니다. 다수 workflow는 `skills/` 쪽에 들어 있고, `product-management`나 `pdf-viewer`처럼 별도 command 파일이 확인되는 plugin도 있다. 따라서 “모든 업무가 완성된 command palette로 제공된다”기보다, skill·connector·일부 command를 조합해 Claude Cowork/Claude Code 안에서 업무별 기본값을 만드는 방식으로 보는 편이 정확하다.

## 현재 들어 있는 플러그인 감각

README가 강조하는 11개는 지식노동 팀에서 바로 떠올릴 만한 직무형 묶음이다.

- **sales**: prospect research, call prep, outreach, pipeline review, competitive battlecard.
- **customer-support**: ticket triage, response draft, escalation package, knowledge base article.
- **product-management**: spec 작성, roadmap, user research synthesis, stakeholder update.
- **marketing**: content/campaign planning, brand voice, competitor brief, performance report.
- **legal / finance / data**: 계약·NDA·compliance, 회계 close·reconciliation·audit, SQL·dashboard·statistical analysis.
- **enterprise-search / productivity / bio-research**: 회사 도구 전체 검색, 개인 업무·일정·메모, early-stage life sciences R&D.
- **cowork-plugin-management**: 기존 plugin을 회사 도구와 프로세스에 맞게 수정하거나 새 plugin을 만드는 관리용 plugin.

실제 저장소 트리에는 여기에 더해 engineering, design, human-resources, operations, pdf-viewer, small-business가 보인다. 예를 들어 engineering은 standup, code review, architecture decision, incident response 쪽을 다루고, small-business는 QuickBooks, PayPal, HubSpot, DocuSign, Stripe, Square 같은 도구를 엮은 SMB workflow를 상당히 많이 포함한다. 다만 README에 아직 전부 반영되어 있지는 않으므로, “공식으로 안정화된 제품 목록”이라기보다 활발히 갱신되는 예제·출발점 카탈로그로 이해하는 편이 안전하다.

## 설치와 첫 사용법

Claude Cowork에서는 README가 `claude.com/plugins`에서 설치한다고 안내한다. Claude Code에서는 marketplace를 먼저 추가하고, 필요한 plugin을 하나씩 설치하는 흐름이다.

```bash
claude plugin marketplace add anthropics/knowledge-work-plugins
claude plugin install sales@knowledge-work-plugins
```

설치 후에는 plugin이 자동으로 활성화되고, 관련 skill은 상황에 맞춰 참조되며, 사용 가능한 slash command는 세션에서 호출할 수 있다는 것이 README의 설명이다. 실제 사용에서는 먼저 한 직무 plugin만 설치해 보는 편이 좋다. 예를 들어 sales 팀이라면 `sales`, 데이터 분석가라면 `data`, 사내 검색 실험이라면 `enterprise-search`부터 시작하고, `.mcp.json`에 적힌 connector 중 실제 조직에서 허용되는 것만 남겨 검증한다.

## 커스터마이징 포인트

이 repo의 장점은 “코드를 빌드하는 제품”이 아니라 “Markdown과 JSON으로 된 업무 절차 bundle”이라는 데 있다. 회사에 맞게 바꾸는 지점이 명확하다.

1. **Connector 교체**: `.mcp.json`에서 Slack/Jira/HubSpot 같은 기본 MCP 서버를 사내 표준 서버나 프록시로 바꾼다.
2. **회사 용어 주입**: `skills/`에 제품명, 고객 세그먼트, 정책, escalation rule, 문서 템플릿을 추가한다.
3. **산출물 형식 고정**: PRD, QBR, audit packet, ticket response, legal memo 같은 출력 형식을 팀 템플릿에 맞춘다.
4. **새 plugin 생성**: `cowork-plugin-management`나 기존 디렉터리 구조를 복사해 특정 팀 전용 plugin을 만든다.

특히 조직 단위에서는 “좋은 프롬프트 모음”보다 “검토된 plugin bundle”이 운영하기 쉽다. 어떤 connector를 허용하는지, 어떤 데이터에 접근하는지, 어떤 문서 템플릿을 기본값으로 쓰는지를 파일로 남길 수 있기 때문이다.

## 운영·보안에서 주의할 점

첫째, connector 권한을 plugin 설치와 분리해서 봐야 한다. 이 저장소의 plugin은 MCP 서버 이름과 workflow를 정의하지만, 실제 Slack, Notion, Jira, CRM, data warehouse 권한은 사용자의 Claude/Cowork/Code 환경과 조직 MCP 설정에서 결정된다. `enterprise-search`, `finance`, `legal`, `data`, `small-business`처럼 민감한 저장소·문서·재무·고객 데이터에 닿는 plugin은 least privilege, 감사 로그, 읽기/쓰기 권한 분리, 샌드박스 데이터셋으로 먼저 검증하는 것이 좋다.

둘째, 외부 skill instruction은 에이전트의 행동을 바꾼다. Anthropic 공식 repo라고 해도, fork해서 사내에 배포하거나 외부 PR을 받아 수정했다면 `skills/` 본문이 어떤 명령을 유도하는지 읽어야 한다. 특히 “고객에게 이메일 보내기”, “돈이 움직이는 작업 승인”, “법무 리스크 판단”, “데이터 쿼리 실행” 같은 workflow는 사람 승인 단계를 plugin 안에 명시적으로 남기는 편이 안전하다.

셋째, Claude Cowork와 Claude Code 호환성을 과하게 일반화하면 안 된다. README는 둘을 명시하지만, 실제 실행 경험은 Claude 제품의 plugin 지원 상태, 조직 계정 설정, MCP 서버 가용성, 로컬 Claude Code 환경에 좌우된다. 이 글의 platform 태그는 사이트 분류용이다. 실제 OS 지원은 이 repo보다 Claude Cowork 웹 환경, Claude Code 설치 가능 환경, 그리고 각 MCP connector가 돌아가는 환경을 기준으로 판단해야 한다.

넷째, releases와 tags가 아직 없다는 점도 adoption signal로 봐야 한다. Apache-2.0이고 stars가 많다고 해서 버전 고정이 자동으로 해결되는 것은 아니다. 팀 표준으로 쓴다면 Git submodule, internal mirror, 특정 commit SHA pinning처럼 재현 가능한 배포 방식을 정해 두는 편이 낫다.

## 내 판단

`knowledge-work-plugins`는 Claude를 업무용 agent로 굴릴 때 필요한 “직무별 기본 맥락”을 빠르게 잡아 주는 좋은 출발점이다. 혼자 쓰는 사람에게는 sales, data, productivity 같은 plugin을 설치해 어떤 skill이 자동으로 도움이 되는지 보는 실험용으로 좋고, 팀에는 “우리 회사 버전의 Claude 업무 매뉴얼”을 만들기 위한 템플릿 repo로 더 가치가 크다.

다만 바로 전사 배포할 물건이라기보다는, connector 권한과 업무 승인선을 정리하면서 fork·수정해야 하는 재료에 가깝다. 공식 repo라서 신뢰 출발점은 좋지만, 실제 보안 경계는 사내 MCP 서버, OAuth scope, 데이터 거버넌스, 사람이 승인해야 하는 workflow 설계에서 결정된다. 그 점을 이해하고 쓰면, 이 repo는 Claude Cowork/Claude Code를 단순 채팅창이 아니라 직무별 작업 환경으로 바꾸는 꽤 실용적인 catalog가 된다.

## 참고한 공개 자료

- [anthropics/knowledge-work-plugins GitHub repository](https://github.com/anthropics/knowledge-work-plugins)
- [GitHub REST API: anthropics/knowledge-work-plugins](https://api.github.com/repos/anthropics/knowledge-work-plugins)
- [Knowledge Work Plugins README](https://github.com/anthropics/knowledge-work-plugins/blob/main/README.md)
- [Claude Cowork](https://claude.com/product/cowork)
- [Claude Code](https://claude.com/product/claude-code)
- [Model Context Protocol](https://modelcontextprotocol.io/)
