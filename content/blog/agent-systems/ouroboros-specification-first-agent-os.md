---
title: "Ouroboros는 프롬프트 엔지니어링을 명세·평가·진화의 Agent OS로 재구성한다"
date: "2026-05-06T21:30:29"
description: "Q00/ouroboros는 막연한 아이디어를 곧바로 코드로 보내지 않고, 소크라테스식 인터뷰·불변 Seed 명세·다단계 평가·진화 루프로 감싸 replayable한 실행 계약으로 바꾸는 specification-first Agent OS 프로젝트다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Ouroboros
  - Agent OS
  - Specification First
  - Claude Code
  - MCP
draft: false
---

AI 코딩 도구의 경쟁은 보통 모델 성능이나 에이전트 자율성으로 설명된다. 하지만 실제 실패는 종종 훨씬 앞단에서 시작된다. 목표가 모호한데도 바로 코드를 쓰게 만들고, 중간에 요구사항이 바뀌고, 마지막에는 “대충 돌아가는 것 같다”는 감각적 QA로 끝나는 흐름이 반복된다. 이 경우 문제는 모델이 약해서라기보다 **실행 전에 명세가 충분히 굳지 않았기 때문**인 경우가 많다.

`Q00/ouroboros`는 이 병목을 꽤 정면으로 겨냥한다. 저장소의 한 줄 설명은 `Agent OS: Stop prompting. Start specifying.`인데, 실제 구조를 보면 단순 프롬프트 템플릿 모음이나 IDE 보조 플러그인이 아니다. 이 프로젝트는 인터뷰, Seed 생성, 실행, 평가, 진화라는 단계를 하나의 **specification-first 실행 계약**으로 묶고, 이를 Claude Code·Codex CLI·OpenCode·Hermes·Kiro·GitHub Copilot CLI 같은 여러 런타임 위에 얹으려 한다.

내가 보기엔 Ouroboros의 핵심은 “AI에게 더 잘 시키는 법”보다 “AI가 코드를 쓰기 전에 무엇을 만들지 먼저 고정하는 운영체제 계층”에 있다. 즉 프롬프트를 잘 쓰는 사람의 개인기 대신, **질문 → 명세 → 실행 → 검증 → 다음 세대 반영**이라는 절차를 로컬 중심의 event-sourced 시스템으로 바꾸려는 시도다.

![Ouroboros hero image](https://github.com/Q00/ouroboros/raw/main/docs/images/ouroboros.png)

## 무엇을 해결하려는가

Ouroboros가 풀려는 문제는 “에이전트가 코드를 얼마나 잘 짜느냐”보다 **애초에 무엇을 짜야 하는지 얼마나 명확히 만들 수 있느냐**에 가깝다. README는 대부분의 AI 코딩 실패가 출력보다 입력에서 시작된다고 주장한다. 막연한 요구를 곧바로 실행하면, 모델은 숨겨진 가정을 임의로 채우고 사용자는 뒤늦게 그 가정을 PR 리뷰 단계에서 발견하게 된다.

이 프로젝트는 그 비용을 초기에 당겨온다. `Interview` 단계에서 소크라테스식 질문으로 전제를 끄집어내고, `Seed` 단계에서 이를 불변 명세로 고정한 뒤, `Execute`와 `Evaluate`를 거쳐 `Evolve`로 다시 되먹임한다. 결국 목표는 코드를 더 빨리 찍어내는 것이 아니라, **재작업이 적은 실행 경로를 만들기 위해 요구사항 자체를 계산 가능한 객체로 바꾸는 것**이다.

특히 이 문제 정의는 최근의 agent tooling 흐름과 잘 맞는다. 많은 도구가 실행 능력, 툴 호출, 멀티에이전트 orchestration에는 투자하지만, 정작 요구 명세가 drift 되는 문제는 사용자의 몫으로 남겨 둔다. Ouroboros는 이 공백을 메우기 위해 명세 작성과 평가를 실행만큼 중요한 1급 컴포넌트로 올려놓는다.

## 핵심 아이디어 / 구조 / 동작 방식

공식 README와 `docs/architecture.md`를 합쳐 보면, Ouroboros는 일종의 **에이전트용 제어면(control plane)** 으로 읽힌다. 상위 철학은 specification-first이고, 구체적 파이프라인은 6단계로 분해된다.

- **Phase 0: Big Bang** — 인터뷰와 ambiguity scoring으로 요구를 결정화
- **Phase 1: PAL Router** — 작업 복잡도에 따라 모델 비용 계층을 선택
- **Phase 2: Double Diamond** — Discover → Define → Design → Deliver
- **Phase 3: Resilience** — 정체 상태 감지와 lateral thinking 페르소나 전환
- **Phase 4: Evaluation** — Mechanical → Semantic → Consensus 검증
- **Phase 5: Secondary Loop** — TODO와 후속 과제를 다시 루프에 연결

핵심 데이터 구조는 `Seed`다. README와 아키텍처 문서는 이를 immutable specification으로 설명한다. 즉 사용자가 “task CLI 하나 만들어줘”라고 말하면 바로 코드 생성을 시작하는 대신, 먼저 질문을 통해 acceptance criteria, ontology, constraints, ambiguity score 같은 요소를 채우고, 일정 임계값 아래로 ambiguity가 내려간 뒤에야 실행한다. 이 점은 일반적인 “대화형 코딩 비서”와 분명히 다르다.

구현 구조도 꽤 크다. 루트 트리를 보면 `src`, `skills`, `commands`, `docs`, `.claude-plugin`, `.ouroboros`, `tests`, `crates/ouroboros-tui`가 분리돼 있고, `docs/architecture.md`는 코어를 plugin layer, core layer, execution layer, state layer, orchestration layer, presentation layer로 나눈다. 특히 state layer를 SQLite event store와 checkpoint store 위에 얹고, presentation layer로 별도 TUI까지 제공하는 점은 이 프로젝트를 단순 프롬프트 워크플로우가 아니라 **관측 가능한 실행 시스템** 쪽으로 밀어준다.

또 하나 중요한 축은 런타임 추상화다. 최상위 README는 Claude Code, Codex CLI, OpenCode, Hermes, Gemini, Kiro CLI, GitHub Copilot CLI까지 언급하고, `docs/runtime-capability-matrix.md`는 적어도 Claude Code·Codex CLI·OpenCode·Hermes·Kiro·Copilot을 나란히 비교한다. 즉 Ouroboros는 특정 모델 제공자에 종속된 agent product라기보다, 여러 코딩 에이전트 위에서 공통 워크플로우 계층을 제공하려는 adapter framework에 가깝다.

| 계층 | 공개 자료에서 확인되는 구성 | 역할 |
|---|---|---|
| Plugin layer | `.claude-plugin/plugin.json`, `skills/`, `commands/` | `ooo` 스킬과 플러그인 배포 메타데이터 제공 |
| Core layer | Seed, ontology, acceptance criteria, ambiguity scoring | 요구를 실행 가능한 명세 객체로 고정 |
| Orchestration layer | 6-phase pipeline, PAL Router, Double Diamond | 어떤 모델·어떤 단계로 작업을 진행할지 제어 |
| State layer | Event Store(SQLite), checkpoint, replay | 세션 경계를 넘어 lineage와 상태를 복원 |
| Presentation layer | CLI + `crates/ouroboros-tui` | 진행 상황·드리프트·상태를 시각화 |
| Runtime abstraction | Claude/Codex/OpenCode/Hermes/Kiro/Copilot 가이드 | 특정 에이전트가 아니라 워크플로우 계약을 이식 |

입출력 관점에서 보면 구조는 더 선명해진다.

| 관점 | 공개 자료에서 확인되는 내용 | 의미 |
|---|---|---|
| 입력 | 자연어 아이디어, 제약, 기존 코드베이스, 인터뷰 응답 | 막연한 요구를 바로 실행하지 않고 먼저 조사 대상으로 취급 |
| 중간 산출물 | ambiguity score, Seed spec, acceptance criteria, ontology | 사람이 나중에 다시 검토 가능한 명세 레이어 형성 |
| 실행 | runtime backend별 `ooo`/CLI 경로, MCP 등록, model routing | 특정 에이전트의 순간 능력보다 실행 절차의 일관성을 중시 |
| 평가 | Mechanical → Semantic → Consensus | “돌아간다”와 “맞게 만들었다”를 분리해서 다룸 |
| 진화 | Ralph loop, reflect, lineage, convergence | 한 번의 실행보다 반복적 개선을 시스템 기능으로 승격 |

## 공개된 근거에서 확인되는 점

GitHub 메타데이터 기준으로 저장소는 2026-01-14 생성, 기본 브랜치 `main`, stars 3,489, forks 342, 최신 커밋은 `fedd0c7`이며 총 커밋 수는 GitHub UI 기준 1,001개다. 주 언어는 Python이지만, GitHub Languages API에는 Python 9.48M bytes 외에도 Rust 163k, TypeScript 48k, Shell 28k가 잡힌다. 이 조합은 TUI 바이너리와 플러그인/브리지 레이어가 단일 Python 패키지 바깥으로 뻗어 있음을 시사한다.

버전 관리 신호도 꽤 뚜렷하다. 이 저장소는 `releases/latest`가 404가 아니라 실제 최신 릴리스 `v0.34.0`을 제공하며, 최근 태그도 `v0.34.0`, `v0.33.0`, `v0.32.0`처럼 촘촘하다. 게다가 최신 릴리스 자산에는 Python wheel / source tarball뿐 아니라 macOS, Linux, Windows용 `ouroboros-tui` 바이너리가 함께 올라가 있다. 즉 단순 연구용 코드 스냅샷이 아니라 **패키지 + TUI 배포 체계를 함께 운영하는 프로젝트**라는 신호다.

플러그인 메타데이터도 분명하다. `.claude-plugin/plugin.json`은 버전 `0.34.0`, MIT 라이선스, keywords에 `workflow`, `requirements`, `socratic`, `evaluation`, `drift-detection`을 넣고 있다. `marketplace.json`은 이를 development 카테고리로 배치한다. 즉 스스로를 IDE assistant라기보다 요구사항 결정화와 평가를 담당하는 개발 워크플로우 플러그인으로 포지셔닝한다.

문서 구성은 오히려 더 흥미롭다. README와 `docs/getting-started.md`, `docs/architecture.md`, `docs/runtime-capability-matrix.md`, `docs/config-reference.md`, `docs/cli-reference.md`가 분리되어 있고, `llms.txt`와 `llms-full.txt`까지 별도로 둔다. 이건 단순 사용 설명서가 아니라 **설치 경로, 아키텍처, 런타임별 차이, 기여용 용어 체계**를 명시적으로 관리하는 문서 시스템에 가깝다.

다만 문서 동기화는 완벽하지 않다. 영문 README는 Claude Code·Codex CLI·GitHub Copilot CLI·OpenCode·Hermes·Gemini·Kiro CLI까지 폭넓게 언급하지만, 같은 시점의 한국어 README는 상대적으로 적은 런타임만 예시로 들고 있다. 또 `pyproject.toml`의 설명문은 “Works with Claude Code and Codex CLI”에 머무르는데, 실제 최신 릴리스 노트 `v0.34.0`은 Copilot CLI와 Kiro runtime을 주요 기능으로 내세운다. 즉 빠르게 확장되는 런타임 표면을 문서가 완전히 같은 속도로 따라가진 못하는 상태다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub 메타데이터 | stars 3,489, forks 342, 1,001 commits, 기본 브랜치 `main` | 초기 아이디어 저장소를 넘어 빠르게 성장 중인 agent infrastructure 프로젝트 |
| Releases / tags | `v0.34.0` 최신 릴리스, 촘촘한 버전 태그, TUI 바이너리 자산 포함 | 실제 배포 운영과 버전 관리가 돌아가고 있음 |
| Plugin metadata | `.claude-plugin/plugin.json` 버전 `0.34.0`, MIT, development 카테고리 | Claude Code 생태계에 배포되는 workflow plugin 정체성 명확 |
| Architecture docs | 6-phase pipeline, Event Store, PAL Router, TUI 분리 | 프롬프트 모음이 아니라 제어면과 관측면을 갖춘 시스템 설계 |
| Runtime matrix | Claude/Codex/OpenCode/Hermes/Kiro/Copilot 비교 문서 존재 | 특정 모델 종속보다 cross-runtime orchestration을 지향 |
| Release notes vs docs | `v0.34.0`는 Copilot/Kiro를 강조하지만 일부 로컬라이즈드 문서는 덜 반영 | 빠른 확장에 따른 문서 드리프트 신호 |

## 실무 관점에서의 해석

내가 보기에 Ouroboros의 가장 흥미로운 점은 “에이전트를 더 똑똑하게 만들겠다”보다 **에이전트가 일하는 계약을 더 엄격하게 만들겠다**는 태도다. 최근 AI 코딩 제품 상당수는 결국 더 긴 컨텍스트, 더 많은 툴, 더 강한 자율성으로 경쟁한다. Ouroboros는 여기에 한 단계 앞선 질문을 붙인다. “그 자율성이 무엇을 향해야 하는지 먼저 명세했는가?”라는 질문이다.

이 접근은 특히 팀 개발이나 고비용 작업에서 설득력이 있다. 실무에서는 한 번 잘못 잡힌 요구를 기반으로 생성된 코드가 수십 파일로 퍼진 뒤에야 문제가 보이는 경우가 많다. 이때 인터뷰와 Seed, ambiguity gate, evaluation gate는 속도를 늦추는 절차가 아니라 **잘못된 가설을 초기에 비싸지 않게 깨는 장치**가 될 수 있다. 다시 말해 Ouroboros의 가치는 모델을 더 빨리 돌리는 데 있지 않고, 재작업을 구조적으로 줄이는 데 있다.

또한 이 프로젝트는 agent stack의 계층을 꽤 잘 분리한다. 모델 제공자나 코딩 런타임은 교체 가능하고, 그 위에 올라가는 것은 specification layer, routing policy, evaluation policy, persistence, observability다. 이런 구조는 조직이 Claude Code를 쓰든 Codex를 쓰든, 또는 나중에 다른 에이전트로 옮기든 **같은 개발 워크플로우 계약을 유지하고 싶은 상황**과 잘 맞는다. 이런 점에서 Ouroboros는 “에이전트 자체”보다 “에이전트용 OS/Control Plane”에 더 가깝다.

물론 한계도 분명하다. 첫째, 구조가 큰 만큼 학습 비용이 높다. 간단한 스크립트 하나 만드는 수준에서는 오히려 과한 절차로 느껴질 수 있다. 둘째, 문서와 런타임 표면이 빠르게 커지면서 일부 설명이 최신 기능을 완전히 따라가지 못하는 흔적이 보인다. 셋째, 결국 품질의 상당 부분은 인터뷰와 평가 체인이 실제 사용자 환경에서 얼마나 일관되게 작동하느냐에 달려 있다. 즉 이 프로젝트는 좋은 철학을 갖고 있지만, 그 철학이 모든 runtime/backend에서 같은 사용자 경험으로 수렴하는지는 더 지켜봐야 한다.

그럼에도 방향성은 분명하다. 앞으로 agent tooling의 차별화는 단순히 “누가 더 잘 코딩하나”보다 **누가 더 좋은 실행 계약과 검증 루프를 제공하나**로 이동할 가능성이 크다. 그런 관점에서 Ouroboros는 프롬프트 엔지니어링의 연장선이 아니라, **명세·평가·진화를 중심에 둔 Agent OS 실험**으로 보는 편이 더 정확하다.

Sources: https://github.com/Q00/ouroboros, https://api.github.com/repos/Q00/ouroboros, https://api.github.com/repos/Q00/ouroboros/readme, https://api.github.com/repos/Q00/ouroboros/releases/latest, https://api.github.com/repos/Q00/ouroboros/tags, https://api.github.com/repos/Q00/ouroboros/contents/.claude-plugin/plugin.json, https://api.github.com/repos/Q00/ouroboros/contents/.claude-plugin/marketplace.json, https://raw.githubusercontent.com/Q00/ouroboros/main/docs/architecture.md, https://raw.githubusercontent.com/Q00/ouroboros/main/docs/runtime-capability-matrix.md, https://raw.githubusercontent.com/Q00/ouroboros/main/docs/getting-started.md, https://raw.githubusercontent.com/Q00/ouroboros/main/pyproject.toml