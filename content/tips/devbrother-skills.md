---
title: "개발동생 Skills는 모호한 요청을 먼저 인터뷰하게 만드는 AI 에이전트 스킬 묶음이다"
date: "2026-05-11T02:01:01"
description: "devbrother2024/skills는 Codex와 Claude Code에 설치할 수 있는 MIT 라이선스 SKILL.md 저장소로, 첫 스킬 deep-interview는 실행 전에 목표·범위·제약·완료 기준을 한 질문씩 명확히 만든다."
author: "Sangmin Lee"
repository: "devbrother2024/skills"
sourceUrl: "https://github.com/devbrother2024/skills"
status: "Open source skill catalog"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Skills"
  - "Codex"
  - "Claude Code"
  - "Prompting"
highlights:
  - "현재 공개된 핵심 스킬은 `deep-interview` 하나이며, 모호한 요구사항을 바로 실행하지 않고 목표·범위·제약·완료 기준으로 정리하게 만든다."
  - "`npx skills@latest add devbrother2024/skills`로 설치하거나 Codex plugin marketplace에 `devbrother2024/skills`를 추가해 설치할 수 있다."
  - "Claude Code용 `.claude-plugin/plugin.json`, Codex용 `.codex-plugin/plugin.json`, Codex marketplace metadata를 함께 제공한다."
  - "저장소와 checked-in LICENSE 모두 MIT지만 릴리스와 태그는 아직 없어, 초기 개인 스킬 카탈로그로 보는 편이 안전하다."
draft: false
---

AI 코딩 에이전트가 일을 잘하는지의 차이는 모델 성능만으로 결정되지 않는다. 실제 작업에서는 “무엇을 만들 것인가”, “어디까지 할 것인가”, “무엇을 하면 완료인가”가 흐릿한 상태로 바로 구현에 들어가면서 결과물이 흔들리는 경우가 많다.

`devbrother2024/skills`는 이 문제를 작게 겨냥한 AI 에이전트용 스킬 저장소다. 현재 공개된 핵심 스킬은 `deep-interview` 하나이며, 러프한 요청을 바로 계획·구현하지 않고 먼저 사용자를 인터뷰해 목표, 범위, 제약, 완료 기준을 정리하도록 만든다.

저장소는 MIT 라이선스이고, Codex와 Claude Code가 읽을 수 있는 plugin/skill metadata를 함께 둔다. 다만 GitHub Releases와 tag는 아직 없고, 저장소도 2026년 5월 초에 만들어진 초기 카탈로그다. 완성형 스킬 마켓플레이스라기보다 “한 가지 좋은 작업 습관을 SKILL.md로 패키징한 작은 시작점”에 가깝다.

![개발동생 Skills repository](https://opengraph.githubassets.com/d9249-devbrother-skills/devbrother2024/skills)

## 개발동생 Skills 개요

이 저장소의 구조는 아주 단순하다.

```text
.
├── .agents/plugins/marketplace.json
├── .claude-plugin/plugin.json
├── .codex-plugin/plugin.json
└── deep-interview/SKILL.md
```

`.claude-plugin/plugin.json`은 `./deep-interview`를 Claude Code 호환 skill로 노출하고, `.codex-plugin/plugin.json`은 `devbrother-skills`라는 Codex plugin manifest를 제공한다. Codex marketplace용 `.agents/plugins/marketplace.json`도 들어 있어, Codex에서는 marketplace를 추가한 뒤 `/plugins`에서 설치하는 흐름을 쓸 수 있다.

실제 내용은 `deep-interview/SKILL.md`에 있다. 이 스킬은 사용자의 요청이 흐릿할 때 에이전트가 바로 실행하지 말고, 가장 큰 불확실성 하나를 골라 한 번에 한 질문씩 묻도록 한다.

## deep-interview가 바꾸는 작업 흐름

`deep-interview`의 핵심은 “질문을 많이 하라”가 아니다. 목표, 범위와 제외 범위, 제약, 완료 기준, 기존 맥락과 영향 범위 중 지금 가장 불명확한 축 하나를 고르고, 그 하나를 풀기 위한 질문을 던지는 방식이다.

스킬이 요구하는 질문 포맷은 다음처럼 구조화되어 있다.

```md
현재 이해: {요청을 한 문장으로 요약}
막힌 결정: {가장 중요한 불확실성}
추천 답안: {있으면 제시}
질문: {한 가지 질문}
```

이 형식이 유용한 이유는 두 가지다. 첫째, 에이전트가 “무엇을 모르는지”를 먼저 드러낸다. 둘째, 사용자는 빈칸에서 답을 만드는 대신 현재 이해와 추천 답안을 보며 빠르게 결정을 내릴 수 있다.

코딩 작업뿐 아니라 제품 기획, 콘텐츠 기획, 자동화 설계처럼 성공 기준을 먼저 맞춰야 하는 일에도 잘 맞는다. 반대로 단순 오타 수정, 작은 설정 변경, 테스트 보강처럼 이미 범위가 분명한 작업에는 굳이 인터뷰를 켤 필요가 없다는 조건도 스킬 안에 명시되어 있다.

## 설치와 첫 사용법

README 기준 가장 쉬운 설치 경로는 `skills` CLI다.

```bash
npx skills@latest add devbrother2024/skills
```

설치 화면에서 `deep-interview`를 선택하고, 사용할 에이전트를 고르면 된다. 특정 에이전트에 전역 설치하려면 아래처럼 바로 지정할 수 있다.

```bash
# Codex 전역 설치
npx skills@latest add devbrother2024/skills --skill deep-interview --agent codex --global --yes

# Claude Code 전역 설치
npx skills@latest add devbrother2024/skills --skill deep-interview --agent claude-code --global --yes

# 설치하지 않고 사용 가능한 스킬만 확인
npx skills@latest add devbrother2024/skills --list
```

Codex plugin marketplace를 쓰는 경우에는 저장소를 marketplace로 추가한 뒤 Codex 안에서 `/plugins`를 연다.

```bash
codex plugin marketplace add devbrother2024/skills
codex
/plugins
```

업데이트는 README 기준 다음 명령을 쓴다.

```bash
codex plugin marketplace upgrade devbrother-skills
```

`npx`를 쓰지 않고 직접 복사하는 수동 설치도 가능하다. README는 Codex 전역 설치 경로로 `~/.agents/skills`, Claude Code 전역 설치 경로로 `~/.claude/skills`를 안내한다.

## 활용 포인트

이 스킬은 “Plan Mode 전에 한 번 멈추는 장치”로 쓰면 가장 잘 맞는다.

예를 들어 이런 요청은 바로 구현에 들어가면 결과가 흔들리기 쉽다.

- “우리 서비스 온보딩을 개선해줘”
- “블로그 자동화 파이프라인을 만들어줘”
- “이 앱을 좀 더 예쁘게 바꿔줘”
- “팀 회의록을 자동으로 정리하고 싶어”

이때 `deep-interview`는 에이전트가 먼저 범위와 완료 기준을 좁히게 만든다. 무엇을 만들지, 어디까지 제외할지, 기존 코드·문서·운영 흐름에 어떤 영향을 주는지, 완료 판단을 어떤 증거로 할지 정리한 뒤 계획이나 실행으로 넘어가게 하는 식이다.

개인적으로는 장기 자동화, 제품 스펙, 리팩터링, UI 개편처럼 “요구사항이 곧 품질”인 작업에 붙이기 좋다고 본다. 반면 단순 명령형 작업에는 마찰만 늘 수 있으므로, 스킬 설명처럼 모호성이 실제로 클 때만 켜는 편이 낫다.

## 주의할 점

첫째, 현재는 작은 초기 카탈로그다. 공개 저장소 기준 스킬은 `deep-interview` 하나이고, GitHub Releases나 tag도 없다. README와 manifest의 설치 경로는 명확하지만, 버전 고정이나 changelog 기반 업데이트를 기대하기보다는 저장소 상태를 보고 쓰는 편이 안전하다.

둘째, 스킬은 에이전트의 행동 지침이다. `deep-interview` 자체는 명령 실행형 스킬이 아니라 질문 흐름을 바꾸는 문서에 가깝지만, 외부 스킬 저장소를 설치할 때는 항상 `SKILL.md`를 먼저 읽어야 한다. 앞으로 이 저장소에 다른 스킬이 추가되면 파일 복사, 명령 실행, 외부 API 사용 같은 더 강한 지침이 들어갈 수도 있다.

셋째, `npx skills@latest`는 별도 npm CLI를 통해 설치한다. 조사 시점 기준 npm의 `skills` 패키지는 Vercel Labs의 “open agent skills ecosystem” CLI로, Node.js `>=18`을 요구한다. 실험용 프로젝트에서는 편하지만, 회사 환경에서는 npm 패키지 실행 정책과 agent skill 설치 위치를 먼저 확인하는 것이 좋다.

넷째, agent별 경로가 조금씩 다르다. README는 Codex 전역 수동 설치를 `~/.agents/skills`, Claude Code 전역 수동 설치를 `~/.claude/skills`로 안내한다. 이미 다른 스킬 관리자나 프로젝트별 `.agents/skills`, `.claude/skills` 구성을 쓰고 있다면 중복 설치와 우선순위를 확인해야 한다.

## 내 판단

`devbrother2024/skills`는 거대한 도구라기보다, AI 에이전트 작업에서 자주 실패하는 한 지점을 정확히 짚은 작은 스킬 저장소다. “모호한 요청을 그대로 실행하지 말고, 먼저 한 질문씩 요구사항을 선명하게 만들라”는 규칙은 단순하지만 효과가 크다.

이미 Codex나 Claude Code를 쓰고 있고, 에이전트가 너무 빨리 구현으로 달려가서 수정 비용이 커지는 경험이 있다면 `deep-interview`는 가볍게 설치해볼 만하다. 다만 현재는 단일 스킬 중심의 초기 저장소이므로, production workflow에 넣기 전에는 스킬 본문을 읽고 팀의 질문 방식·계획 방식에 맞게 fork하거나 수정하는 쪽이 더 좋다.

## 참고한 공개 자료

- [devbrother2024/skills GitHub repository](https://github.com/devbrother2024/skills)
- [README.md](https://github.com/devbrother2024/skills/blob/main/README.md)
- [deep-interview/SKILL.md](https://github.com/devbrother2024/skills/blob/main/deep-interview/SKILL.md)
- [Codex plugin manifest](https://github.com/devbrother2024/skills/blob/main/.codex-plugin/plugin.json)
- [Claude Code plugin metadata](https://github.com/devbrother2024/skills/blob/main/.claude-plugin/plugin.json)
- [Codex marketplace metadata](https://github.com/devbrother2024/skills/blob/main/.agents/plugins/marketplace.json)
- [skills npm package](https://www.npmjs.com/package/skills)
