---
title: "Spec Kit은 AI 코딩을 스펙 중심 워크플로로 묶어주는 GitHub의 실험적 도구다"
date: "2026-05-25T23:21:32"
description: "github/spec-kit은 스펙을 먼저 만들고 constitution, specification, plan, tasks, implement 단계로 AI 코딩 에이전트를 제어하게 해주는 Spec-Driven Development용 오픈소스 CLI와 템플릿 모음이다."
author: "Sangmin Lee"
repository: "github/spec-kit"
sourceUrl: "https://github.com/github/spec-kit"
status: "Open source experimental"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Developer Tools"
  - "CLI"
  - "Spec-Driven Development"
  - "GitHub"
highlights:
  - "GitHub의 `github/spec-kit`은 스펙을 실행 가능한 산출물처럼 다루며 `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement` 흐름으로 AI 코딩을 단계화한다."
  - "공식 설치 경로는 PyPI가 아니라 GitHub 저장소 기반 `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z`이며, 조사 시점 최신 릴리스는 `v0.8.13`이다."
  - "Copilot, Claude Code, Codex CLI, Gemini CLI, Cursor, Goose, opencode, Qwen Code 등 30개 이상 AI 코딩 에이전트 통합을 제공하고, 일부는 slash command 대신 agent skill 형태로 설치된다."
  - "Linux/macOS와 Windows PowerShell 스크립트를 모두 지원하지만, 기존 글이나 예전 안내에는 Windows WSL2 전제가 남아 있을 수 있어 현재 docs 기준으로 확인하는 편이 안전하다."
  - "커뮤니티 extension/preset은 maintainer가 코드 감사를 보장하지 않으므로, 설치 전 소스와 파일 쓰기 범위, GitHub issue 생성 같은 외부 연동 권한을 검토해야 한다."
draft: false
---

AI 코딩 에이전트가 강력해질수록 “코드를 잘 쓰느냐”보다 **무엇을 만들지 얼마나 명확히 전달하느냐**가 더 큰 차이를 만든다. vague prompt 하나로 바로 구현을 맡기면 그럴듯한 코드가 나오더라도, 요구사항·예외·검증 기준·아키텍처 선택이 뒤섞이기 쉽다.

`Spec Kit`은 GitHub가 이 문제를 스펙 기반 개발(Spec-Driven Development, SDD) 쪽에서 푼 오픈소스 툴킷이다. 핵심은 문서를 나중에 쓰는 것이 아니라, **스펙을 먼저 만들고 그 스펙에서 계획·작업·구현을 순서대로 생성하게 하는 것**이다. GitHub 블로그의 표현처럼 “code is the source of truth”에서 “intent is the source of truth”로 무게중심을 옮기는 실험에 가깝다.

조사 시점 기준 저장소 `github/spec-kit`은 Python 중심 프로젝트이고, CLI 패키지 이름은 `specify-cli`, 실행 명령은 `specify`다. GitHub API와 checked-in `LICENSE` 모두 MIT 라이선스로 확인되고, 최신 GitHub Release는 `v0.8.13`이다. README와 docs는 이 프로젝트를 “vibe coding을 줄이고 product scenario와 predictable outcome에 집중하게 하는 툴킷”으로 설명한다.

![Spec Kit Specify CLI 데모](/images/tips/spec-kit-specify-cli.gif)

## Spec Kit 개요

Spec Kit의 기본 산출물은 코드가 아니라 `.specify/` 아래의 스펙·계획·스크립트·에이전트 명령 파일이다. `specify init`으로 프로젝트를 부트스트랩하면 선택한 AI 코딩 에이전트에 맞게 slash command, prompt file, skill directory, context file 등을 설치한다.

대표 흐름은 다음과 같다.

| 단계 | 역할 |
|---|---|
| `/speckit.constitution` | 프로젝트의 원칙, 품질 기준, 테스트·UX·성능 같은 거버넌스 문서를 만든다. |
| `/speckit.specify` | 만들 기능의 “무엇”과 “왜”를 사용자 스토리·수용 기준이 있는 스펙으로 바꾼다. |
| `/speckit.plan` | 스펙을 기술 스택, 아키텍처, 데이터 모델, API 계약, quickstart 검증 시나리오로 번역한다. |
| `/speckit.tasks` | 스펙과 계획을 작고 검토 가능한 구현 작업으로 쪼갠다. |
| `/speckit.implement` | 작업 목록을 따라 실제 구현을 진행하게 한다. |

옵션 명령으로는 모호한 부분을 정리하는 `/speckit.clarify`, 산출물 간 일관성을 보는 `/speckit.analyze`, 품질 체크리스트를 만드는 `/speckit.checklist`, task를 GitHub issue로 바꾸는 `/speckit.taskstoissues` 등이 있다.

## 왜 유용한가

Spec Kit이 유용한 지점은 “프롬프트를 잘 쓰자”보다 더 구조적이다.

- **작업의 출발점을 코드가 아니라 의도에 둔다.** 먼저 사용자 시나리오와 성공 기준을 고정하고, 기술 스택은 그다음 단계에서 선택한다.
- **AI 출력물을 단계별로 검토한다.** 바로 코드를 받기보다 스펙, 계획, tasks를 각각 리뷰할 수 있어 실수의 위치를 앞단으로 당길 수 있다.
- **여러 에이전트에 같은 프로세스를 이식한다.** GitHub Copilot, Claude Code, Codex CLI, Gemini CLI, Cursor, Goose, opencode, Qwen Code 등 다양한 도구에서 같은 SDD 용어와 문서를 공유할 수 있다.
- **그린필드와 브라운필드 양쪽에 맞는다.** README는 0-to-1 생성, 병렬 아키텍처 탐색, 기존 시스템의 반복 개선을 주요 사용 단계로 제시한다.
- **팀 규칙을 constitution에 묶을 수 있다.** 테스트 기준, UX 일관성, 성능 원칙, 보안·컴플라이언스 제약을 코드 생성 전에 에이전트가 읽는 기준으로 만들 수 있다.

특히 “AI에게 한 번에 앱을 만들어 달라”는 흐름보다, 팀원이 스펙을 리뷰하고 plan/tasks를 나눈 뒤 에이전트에게 구현을 맡기는 흐름에 더 잘 맞는다.

## 설치와 첫 사용법

공식 문서는 `uv`를 권장한다. 중요한 점은 **공식 유지보수 패키지는 GitHub 저장소 기반 설치**라는 것이다. installation guide는 PyPI의 같은 이름 패키지는 Spec Kit maintainers가 관리하는 공식 배포물이 아니라고 명시한다.

```bash
# vX.Y.Z를 GitHub Releases의 최신 tag로 바꿔 pin한다.
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.8.13

# 새 프로젝트 생성
specify init my-project --integration copilot
cd my-project
```

한 번만 시험해볼 때는 `uvx`로 바로 실행할 수 있다.

```bash
uvx --from git+https://github.com/github/spec-kit.git@v0.8.13 specify init my-project --integration copilot
```

이미 있는 저장소에 넣을 때는 훨씬 조심해야 한다. 현재 디렉터리에 설치하려면 `--here`를 쓰고, 파일이 있는 디렉터리에 병합하려면 `--force`가 필요하다.

```bash
# 기존 repo 루트에서 초기화
specify init --here --integration copilot

# Codex CLI는 skill 방식으로 설치할 수 있다.
specify init --here --integration codex --integration-options="--skills"

# Windows/PowerShell 스크립트가 필요하면 script 타입을 명시한다.
specify init my-project --integration copilot --script ps
```

설치 후에는 에이전트 안에서 `/speckit.*` 명령이 보이는지 확인한다. Codex CLI처럼 skill 호출 방식을 쓰는 통합은 `$speckit-<command>` 형태로 호출될 수 있으므로, integration docs에서 자기 도구의 호출 규칙을 확인하는 편이 좋다.

## 지원 에이전트와 확장 구조

현재 docs는 Spec Kit이 30개 이상 AI coding agent 통합을 지원한다고 설명한다. 예를 들면 다음과 같다.

- `copilot` — GitHub Copilot / VS Code
- `claude` — Claude Code, `.claude/skills` 기반 skill 설치
- `codex` — Codex CLI, `.agents/skills` 기반 skill 설치와 `$speckit-<command>` 호출
- `gemini` — Gemini CLI
- `cursor-agent` — Cursor
- `opencode`, `goose`, `qwen`, `forge`, `tabnine`, `windsurf`, `devin`, `kiro-cli` 등
- `generic` — 직접 agent command directory를 지정하는 BYO agent 모드

또한 extension, preset, workflow 개념이 있다. extension은 명령·hook·외부 연동·quality gate를 추가하고, preset은 template이나 command wording을 조직 방식에 맞게 바꾼다. workflow는 여러 SDD 단계를 조건·반복·fan-out/fan-in·human checkpoint와 함께 자동화하는 레이어다.

이 구조는 강력하지만, 동시에 “에이전트에게 줄 명령 파일을 외부에서 가져와 설치한다”는 뜻이기도 하다. 팀 표준으로 쓰려면 어떤 extension/preset을 허용할지, 버전을 어떻게 pin할지, 외부 catalog를 쓸지부터 정해야 한다.

## 활용 포인트

Spec Kit은 다음 상황에서 특히 잘 맞는다.

1. **새 제품/기능의 0-to-1 초안**
   아이디어를 바로 코드로 보내지 말고 `/speckit.specify`로 사용자 여정, 수용 기준, 실패 조건을 먼저 만든다.
2. **여러 아키텍처 병렬 비교**
   같은 스펙에서 `plan`을 여러 방향으로 만들고, 구현 비용·운영 복잡도·팀 표준 적합성을 비교한다.
3. **레거시 코드 현대화**
   기존 동작을 스펙으로 재구성한 뒤 새 기능을 그 위에 추가하면 “AI가 기존 규칙을 몰라서 깨뜨리는” 위험을 줄일 수 있다.
4. **팀/조직 규칙 강제**
   constitution에 테스트, 접근성, 보안, 성능, 데이터 보존 같은 기준을 넣어 에이전트가 매 단계 참조하게 한다.
5. **검토 가능한 작업 분해**
   `/speckit.tasks` 결과를 PR 단위나 issue 단위로 쪼개면, 사람 리뷰어가 한 번에 너무 큰 AI PR을 받는 문제를 줄일 수 있다.

개인적으로는 바로 production repo에 넣기보다, 작은 side project나 throwaway branch에서 `specify init`, `specify check`, `specify version --features`까지 확인하고 팀에 맞는 constitution/template을 다듬은 뒤 도입하는 흐름을 추천한다.

## 주의할 점

첫째, 아직 실험적 성격이 강하다. GitHub Release는 꾸준히 나오고 있지만, main branch의 `pyproject.toml`은 다음 개발 버전(`0.8.14.dev0`)으로 이동해 있고, docs에는 향후 `v0.10.0`에서 git extension 기본 동작이 바뀔 예정이라는 노트도 있다. 재현성과 팀 배포가 중요하면 release tag를 pin해야 한다.

둘째, PyPI 이름을 믿고 설치하면 안 된다. 공식 installation guide는 `specify-cli`라는 PyPI 패키지가 있더라도 Spec Kit maintainers가 관리하는 공식 패키지가 아니라고 경고한다. 글이나 블로그에 있는 오래된 `uvx --from git+...` 명령도 최신 docs의 권장 설치 방식과 버전 pinning을 함께 확인해야 한다.

셋째, extension과 preset은 신뢰 경계다. README의 community extension 안내는 maintainer가 catalog entry의 형식만 확인할 뿐, extension code를 감사·보증·지원하지 않는다고 명시한다. 특히 Read+Write extension, GitHub issue 생성, shell step, 외부 API 연동은 설치 전 소스를 확인하는 편이 안전하다.

넷째, “스펙이 있다”는 것이 곧 품질 보장은 아니다. Spec Kit은 AI에게 더 좋은 구조를 주는 도구이지, 요구사항 자체의 정확성·보안성·윤리성·테스트 충분성을 자동으로 보증하지 않는다. 스펙과 plan/tasks를 사람이 리뷰하는 단계가 빠지면, 잘못된 요구사항을 더 그럴듯하게 자동화할 수도 있다.

다섯째, 기존 저장소에 `--here --force`를 쓰면 agent command files, scripts, `.specify/` artifacts가 추가·병합된다. 실험은 새 브랜치에서 하고, 생성된 파일을 리뷰한 뒤 커밋하는 습관이 필요하다.

## 내 판단

Spec Kit은 “AI 코딩을 더 많이 시키는 도구”라기보다 **AI 코딩을 덜 즉흥적으로 만들기 위한 프로세스 도구**에 가깝다. Copilot/Claude/Codex/Gemini 같은 도구를 팀에서 이미 쓰고 있고, AI PR이 커지면서 요구사항 불일치나 리뷰 난이도가 문제라면 시험해볼 가치가 있다.

반대로 아주 작은 스크립트, 혼자 쓰는 일회성 자동화, 빠르게 버리고 다시 만들 prototype이라면 Spec Kit의 constitution/spec/plan/tasks 구조가 과할 수 있다. 이 도구의 장점은 반복적으로 유지할 제품과 팀 워크플로에서 더 잘 드러난다.

## 참고한 공개 자료

- [GitHub Spec Kit repository](https://github.com/github/spec-kit)
- [Spec Kit documentation](https://github.github.io/spec-kit/)
- [GitHub Blog: Spec-driven development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Spec Kit installation guide](https://github.github.io/spec-kit/installation.html)
- [Spec Kit CLI reference](https://github.github.io/spec-kit/reference/overview.html)
- [Spec Kit integrations reference](https://github.github.io/spec-kit/reference/integrations.html)
- [PyTorchKR 소개 글](https://discuss.pytorch.kr/t/github-spec-driven-development-spec-kit/7675)
