---
title: "Carbone Skill은 AI에게 Carbone 템플릿 문법을 정확히 가르치는 공식 Agent Skill이다"
date: "2026-06-05T18:43:10"
description: "Carbone Skill은 Claude, ChatGPT, Cursor, Copilot, Gemini CLI, Codex 등 Agent Skills 호환 도구에 Carbone 태그·포매터·루프·조건 문법을 주입해 문서 템플릿 생성 시행착오를 줄이는 공식 스킬이다."
author: "Sangmin Lee"
repository: "carboneio/carbone-skill"
sourceUrl: "https://carbone.io/documentation/developer/ai/skills.html"
status: "Open source Agent Skill"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Agent Skills"
  - "Carbone"
  - "Document Automation"
  - "MCP"
  - "Developer Tools"
highlights:
  - "v1.3.3 기준 `carbone.skill` 릴리스 자산과 Claude Code plugin marketplace 설정을 제공한다."
  - "`SKILL.md`와 `references/`가 Carbone v5.6.1의 태그, formatter, loop, condition, `:set` 패턴, HTML/Markdown 템플릿 체크리스트를 담는다."
  - "Claude, ChatGPT, Cursor, VS Code Copilot, Gemini CLI, Codex처럼 Agent Skills 경로를 읽는 도구에 설치할 수 있다."
  - "Carbone MCP와 함께 쓰면 AI가 템플릿을 설계하고 MCP 도구로 업로드·렌더링까지 이어갈 수 있지만 API key와 문서 데이터 경계를 확인해야 한다."
  - "외부 skill은 에이전트 판단을 바꾸므로 팀에서는 릴리스/커밋을 고정하고 `SKILL.md` 내용을 먼저 검토하는 편이 안전하다."
draft: false
---

Carbone은 JSON 데이터를 DOCX, XLSX, PPTX, ODT, HTML 같은 템플릿 파일과 합쳐 문서를 생성하는 템플릿 엔진이다. 문제는 Carbone 태그가 Mustache, Handlebars, Jinja2, JSONPath와 비슷해 보이지만 실제로는 별도 문법이라는 점이다. AI에게 “이 JSON으로 견적서 템플릿 만들어줘”라고 시키면, 다른 템플릿 언어의 습관을 섞어 잘못된 태그를 만들기 쉽다.

`carboneio/carbone-skill`은 이 시행착오를 줄이기 위해 Carbone이 직접 배포하는 **Agent Skill**이다. 에이전트가 렌더링을 직접 하는 도구가 아니라, Claude·ChatGPT·Cursor·Copilot·Gemini CLI·Codex 같은 Agent Skills 호환 환경에 Carbone의 태그, 포매터, 반복, 조건, 검증 체크리스트를 넣어주는 지식 패키지에 가깝다.

![carboneio/carbone-skill repository](https://opengraph.githubassets.com/carbone-skill-tips/carboneio/carbone-skill)

## 무엇을 담고 있나

저장소의 핵심은 `carbone/SKILL.md`와 `carbone/references/*.md`다. 확인 시점 최신 릴리스는 `v1.3.3`이고, 스킬 metadata에는 Carbone 버전 `5.6.1` 기준이라고 적혀 있다. GitHub Release에는 약 52KB 크기의 `carbone.skill` 파일이 올라가며, `.claude-plugin/plugin.json`과 `marketplace.json`은 Claude Code plugin marketplace 설치 흐름을 지원한다.

스킬이 다루는 범위는 꽤 실무적이다.

- `{d.path}`, `{c.path}`, `{#alias}`, `{$alias}`, `{t(key)}`, `{o.option=value}` 같은 Carbone 태그 prefix
- 날짜, 숫자, 문자열, 통화, 배열, formatter chaining
- `showBegin/showEnd`, `hideBegin/hideEnd`, ternary, `drop/keep` 같은 조건부 표시
- 배열 반복, 중첩 loop, grouping, aggregation, `:set` 기반 계산 패턴
- HTML/Markdown 템플릿, DOCX/XLSX/PPTX 안에 Carbone tag를 심는 방식
- 렌더링 전 “이 문법이 실제 Carbone 문법인가?”를 확인하는 validation checklist

특히 `SKILL.md` 앞부분의 “Carbone은 JSONPath도 Mustache도 Handlebars도 Jinja2도 아니다. 문서화되지 않은 문법을 만들지 말라”는 경고가 핵심이다. AI가 익숙한 템플릿 언어로 추측하지 못하게 막는 장치다.

## 설치와 첫 사용 흐름

공식 문서는 최신 릴리스의 `carbone.skill` 파일을 내려받아 각 에이전트의 skill 경로에 넣는 방식을 안내한다.

```bash
curl -L -o carbone.skill \
  https://github.com/carboneio/carbone-skill/releases/latest/download/carbone.skill
```

Claude Code에서는 plugin marketplace로 등록해 설치할 수 있다.

```text
/plugin marketplace add carboneio/carbone-skill
/plugin install carbone@carbone-skill
```

수동 설치는 사용하는 에이전트의 skill 디렉터리에 압축을 푸는 방식이다.

```bash
# Claude Code 개인 skill
unzip carbone.skill -d ~/.claude/skills/carbone

# Cursor 개인 skill
unzip carbone.skill -d ~/.cursor/skills/carbone

# VS Code / GitHub Copilot 개인 skill
unzip carbone.skill -d ~/.copilot/skills/carbone

# OpenAI Codex 개인 skill
unzip carbone.skill -d ~/.agents/skills/carbone
```

Gemini CLI는 skill installer를 지원한다.

```bash
gemini skills install carbone.skill
gemini skills install https://github.com/carboneio/carbone-skill.git
```

실무에서는 설치 후 곧바로 실제 고객 문서를 맡기기보다, 먼저 작은 JSON 샘플과 간단한 invoice/report 템플릿으로 “태그 생성 → 사람이 검토 → 테스트 렌더링” 흐름을 확인하는 편이 좋다.

## Carbone MCP와 같이 쓸 때

Carbone 문서는 Skill과 MCP를 같이 쓰는 흐름을 권한다. 역할을 나누면 이해하기 쉽다.

- **Carbone Skill**: AI가 올바른 Carbone 문법으로 템플릿을 설계하도록 돕는 지식 패키지
- **Carbone MCP**: 템플릿 업로드, 문서 렌더링, 변환, 템플릿 관리 같은 실제 API 액션을 제공하는 도구 서버

예를 들어 `data.json`으로 청구서 PDF를 만들고 싶다면, AI가 Skill을 참고해 DOCX/HTML 템플릿의 Carbone tag를 작성하고, MCP의 `upload_template`·`render_document` 같은 도구로 테스트 렌더링까지 이어갈 수 있다. Skill만 설치하면 문법 품질이 좋아지고, MCP까지 붙이면 대화 안에서 생성·변환 작업을 실행할 수 있는 셈이다.

다만 MCP 설정은 Carbone Cloud API key를 쓰거나 self-hosted Carbone URL을 지정하는 흐름이다. 문서 데이터, 고객명, 금액, 계약 조건 같은 민감 정보가 템플릿과 JSON에 들어갈 수 있으므로, 어떤 환경에서 렌더링되는지와 API key 보관 방식을 먼저 확인해야 한다.

## 활용 포인트

이 스킬은 이런 작업에서 특히 유용하다.

- 계약서, 견적서, 청구서, 리포트 템플릿을 AI와 함께 빠르게 초안화할 때
- XLSX/PPTX/DOCX 안에 반복 행, 조건부 섹션, 계산 필드가 많은 Carbone tag를 넣어야 할 때
- 기존 템플릿을 보고 “이 tag가 실제 Carbone 문법인가?”를 검토하고 싶을 때
- Carbone MCP와 연결해 템플릿 설계부터 테스트 렌더링까지 한 대화에서 처리하고 싶을 때
- 팀 내부 문서 자동화 runbook에 Carbone 문법 체크리스트를 고정해두고 싶을 때

일반 개발 라이브러리처럼 import해서 쓰는 패키지는 아니므로, “설치 후 어떤 API가 생기나?”보다 “에이전트가 어떤 문법 지식을 근거로 답하는가?”에 초점을 두고 평가하는 편이 맞다.

## 주의할 점

첫째, Skill은 렌더러가 아니다. `carbone.skill`을 설치한다고 문서가 자동으로 생성되지는 않는다. 실제 렌더링에는 Carbone API, Carbone MCP, 또는 별도 Carbone 실행 환경이 필요하다.

둘째, 외부 skill은 에이전트의 판단과 출력 방식을 바꾼다. 이 저장소는 Apache-2.0으로 공개되어 있고, 확인한 파일 구성은 `SKILL.md`와 reference 문서 중심이지만, 그래도 설치 전에는 `carbone/SKILL.md`와 `references/`를 직접 읽어보는 편이 안전하다. 팀 환경에서는 `latest` 다운로드만 믿기보다 릴리스 버전이나 커밋 SHA를 고정해 재현성을 확보하는 것이 좋다.

셋째, Carbone MCP까지 붙이면 데이터 경계가 더 중요해진다. Carbone Cloud API를 기본으로 쓰는 설정은 API key와 문서 데이터가 외부 서비스로 이동할 수 있다는 뜻이다. 고객 문서, 계약서, 재무 데이터, 내부 보고서처럼 민감한 자료를 다룬다면 self-hosted 옵션, 권한 범위, 로그 보관, 템플릿 저장 정책을 먼저 확인해야 한다.

넷째, 이 tips 사이트의 platform 분류는 OS-native 앱 기준으로 거칠게 나뉘어 있다. Carbone Skill 자체는 특정 OS용 앱이 아니라 Agent Skills 표준을 읽는 도구에서 쓰는 지식 패키지다. macOS/Linux/Windows 어디서든 해당 에이전트가 skill 경로를 지원하면 사용할 수 있지만, 실제 설치 경로와 활성화 방식은 Claude, ChatGPT, Cursor, Copilot, Gemini CLI, Codex마다 다르다.

## 내 판단

Carbone으로 문서 자동화를 이미 하고 있거나, AI에게 DOCX/XLSX/PPTX 템플릿 초안을 맡기려는 팀이라면 `carboneio/carbone-skill`은 바로 확인할 가치가 있다. 장점은 “AI가 Carbone을 더 잘 안다”보다 더 구체적이다. 잘못된 템플릿 언어 습관을 막고, 반복·조건·formatter·검증 체크리스트를 한 번에 주입해 첫 렌더링 실패율을 줄이는 쪽에 가깝다.

반대로 Carbone을 쓰지 않는 팀이라면 범용 문서 생성 도구로 기대할 필요는 없다. 이 스킬은 Carbone 생태계 안에서 가치가 크다. 나는 Carbone MCP와 함께 쓰되, 처음에는 테스트 데이터로 템플릿 품질을 검증하고, 운영 문서에는 릴리스 버전을 고정해 가져가는 방식을 추천한다.

## 참고한 공개 자료

- [Carbone Skill 공식 문서](https://carbone.io/documentation/developer/ai/skills.html)
- [carboneio/carbone-skill GitHub repository](https://github.com/carboneio/carbone-skill)
- [carbone.skill 최신 릴리스 다운로드](https://github.com/carboneio/carbone-skill/releases/latest/download/carbone.skill)
- [Carbone MCP 공식 문서](https://carbone.io/documentation/developer/ai/mcp.html)
- [Agent Skills overview](https://agentskills.io/)
