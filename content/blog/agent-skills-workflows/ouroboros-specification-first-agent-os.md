---
title: "Ouroboros는 코딩 에이전트를 명세·검증·런타임 교체 가능한 Agent OS로 묶는다"
date: "2026-06-08T03:31:12"
description: "Q00/ouroboros는 막연한 아이디어를 바로 코드로 보내지 않고, 소크라테스식 인터뷰·불변 Seed·3단계 평가·런타임 어댑터를 통해 AI 코딩 작업을 replayable한 실행 계약으로 바꾸려는 specification-first Agent OS다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - Ouroboros
  - Agent OS
  - Specification First
  - Agent Runtime
  - MCP
image: "/images/blog/ouroboros-agent-os-hero.webp"
draft: false
---

AI 코딩 도구의 경쟁은 대체로 모델 성능, 컨텍스트 길이, 도구 호출 능력, 자율 실행 시간으로 설명된다. 하지만 실제 실패는 종종 그보다 앞에서 시작된다. 목표가 모호한데도 바로 구현에 들어가고, 중간에 요구사항이 바뀌고, 마지막에는 “대충 돌아가는 것 같다”는 감각적 QA로 끝나는 흐름이 반복된다. 이 경우 문제는 모델이 약해서라기보다 **실행 전에 무엇을 만들지 충분히 명세하지 않았기 때문**인 경우가 많다.

`Q00/ouroboros`는 이 병목을 정면으로 겨냥한다. 저장소의 한 줄 설명은 `Agent OS: Stop prompting. Start specifying.`이고, 현재 README는 이를 “replayable, specification-first AI coding workflow를 위한 Agent OS”로 설명한다. 중요한 점은 이 프로젝트가 단순 프롬프트 템플릿 모음이나 Claude Code 전용 플러그인이 아니라는 점이다. 인터뷰, Seed 생성, 실행, 평가, 진화, 이벤트 기록, 런타임 어댑터를 하나의 **실행 계약(control contract)** 으로 묶으려 한다.

내가 보기엔 Ouroboros의 핵심은 “AI에게 더 잘 시키는 법”이 아니라 “AI가 코드를 쓰기 전에 무엇을 만들지 먼저 고정하고, 그 고정된 계약을 여러 코딩 런타임 위에서 재생 가능하게 만드는 법”에 있다. 프롬프트를 잘 쓰는 개인기 대신, **질문 → 명세 → 실행 → 검증 → 다음 세대 반영**이라는 절차를 로컬 중심의 event-sourced 시스템으로 바꾸려는 시도다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/ouroboros-agent-os-hero.webp"
    alt="Ouroboros official hero image"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Ouroboros 공식 README의 hero 이미지. 프로젝트가 말하는 “뱀이 꼬리를 먹으며 다음 세대로 진화하는 루프”를 시각적으로 상징한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

Ouroboros가 풀려는 문제는 “에이전트가 코드를 얼마나 잘 짜느냐”보다 **애초에 무엇을 짜야 하는지 얼마나 명확히 만들 수 있느냐**에 가깝다. README는 대부분의 AI 코딩 실패가 출력이 아니라 입력에서 시작된다고 본다. 막연한 요구를 곧바로 실행하면 모델은 숨겨진 가정을 임의로 채우고, 사용자는 그 가정을 PR 리뷰나 QA 단계에서 뒤늦게 발견한다.

이 프로젝트는 그 비용을 앞단으로 당긴다. `ooo interview`는 소크라테스식 질문으로 목표, 제약, 성공 기준, 기존 코드베이스 맥락을 끌어내고, ambiguity score가 일정 수준 이하로 내려간 뒤에야 Seed를 만든다. README 기준 greenfield 예시는 목표 명확도, 제약 명확도, 성공 기준을 가중합해 `Ambiguity <= 0.2`가 되었을 때 “Seed로 넘어갈 수 있다”고 설명한다. 즉 “느낌상 충분히 명확하다”가 아니라, 적어도 명시적인 gate를 통과해야 한다.

그 다음에도 Ouroboros는 결과물을 단순히 “실행됐다”로 끝내지 않는다. 핵심 루프는 `Interview -> Seed -> Execute -> Evaluate`이고, 평가 결과는 다시 다음 세대 Seed의 입력으로 들어간다. README는 convergence 조건으로 ontology similarity `>= 0.95`를 제시하고, `ooo ralph`는 이 진화 루프를 세션 경계를 넘어 지속적으로 이어 가는 명령으로 설명된다. 목표는 코드를 더 빨리 찍어내는 것이 아니라, **잘못된 가정이 뒤늦게 수십 파일로 확산되는 일을 줄이는 것**이다.

## 핵심 아이디어 / 구조 / 동작 방식

현재 README와 `docs/architecture.md`를 합쳐 보면, Ouroboros는 “코딩 에이전트 하나”라기보다 **에이전트용 제어면(control plane)** 에 가깝다. 상위 철학은 specification-first이고, 구체적인 실행 파이프라인은 6단계로 분해된다.

| 단계 | 이름 | 역할 |
|---|---|---|
| Phase 0 | Big Bang | 인터뷰와 ambiguity scoring으로 요구를 Seed로 결정화 |
| Phase 1 | PAL Router | 작업 복잡도에 따라 frugal / standard / frontier 모델 계층 선택 |
| Phase 2 | Double Diamond | Discover → Define → Design → Deliver로 실행 분해 |
| Phase 3 | Resilience | 정체, 반복, oscillation을 감지하고 lateral thinking persona 투입 |
| Phase 4 | Evaluation | Mechanical → Semantic → Multi-Model Consensus 검증 |
| Phase 5 | Secondary Loop | TODO와 후속 과제를 다시 루프에 연결 |

핵심 데이터 구조는 `Seed`다. 아키텍처 문서는 Seed를 immutable data model로 설명하고, acceptance criteria tree, ontology schema, ambiguity scoring, version tracking과 연결한다. 즉 사용자가 “task CLI 하나 만들어줘”라고 말하면 바로 코드 생성을 시작하는 대신, 먼저 질문을 통해 goal, constraints, acceptance criteria, ontology를 채우고 그 결과를 실행 가능한 명세 객체로 고정한다.

구현 구조도 꽤 넓다. 루트에는 `src`, `skills`, `commands`, `docs`, `.claude-plugin`, `.mcp.json`, `.ouroboros`, `tests`, `crates/ouroboros-tui`가 함께 존재한다. `docs/architecture.md`는 core layer, execution layer, state layer, orchestration layer, presentation layer를 구분하고, state layer에는 SQLite event store와 checkpoint store를 둔다. 이 점은 Ouroboros를 단순 “명령어 모음”이 아니라 **기록·재생·관측 가능한 실행 시스템**으로 읽게 만든다.

| 계층 | 공개 자료에서 확인되는 구성 | 의미 |
|---|---|---|
| Core layer | Seed, acceptance criteria tree, ontology, ambiguity scoring | 요구를 실행 가능한 명세 객체로 고정 |
| Execution layer | Double Diamond, hierarchical decomposition, model router | 명세를 실행 단위로 분해하고 런타임에 넘김 |
| State layer | SQLite event store, checkpoint, replay | 세션 경계를 넘어 lineage와 상태를 복원 |
| Orchestration layer | 6-phase pipeline, PAL Router, runtime adapters | 어떤 단계에 어떤 모델·런타임을 쓸지 제어 |
| Presentation layer | Typer CLI, Textual TUI, status/drift views | 사용자가 진행 상황과 드리프트를 관측 |
| Plugin/runtime surface | `.claude-plugin`, `.mcp.json`, `skills/`, runtime guides | 여러 AI 코딩 호스트에 같은 workflow contract를 이식 |

최근 README에서 흥미로운 변화는 “Ouroboros Agent OS Stack”이라는 표현이다. 공식 문서는 이제 세 레이어를 나란히 둔다. `Q00/ourocode`는 터미널 shell, `Q00/ouroboros-plugins`는 UserLevel plugin layer, `Q00/ouroboros`는 Seed·Ledger·Runtime·MCP·safety boundary를 담당하는 OS core다. 아직 sibling repo들은 본체보다 훨씬 젊고 작지만, 방향성은 분명하다. Ouroboros는 하나의 CLI 패키지를 넘어, **커널·플러그인·셸로 나뉜 agent workflow stack**을 지향한다.

또 하나 중요한 축은 런타임 추상화다. `docs/runtime-capability-matrix.md`는 `orchestrator.runtime_backend` 설정값으로 Claude Code, Codex CLI, OpenCode, Hermes, Gemini CLI, Kiro CLI, GitHub Copilot CLI, Pi CLI를 비교한다. Seed parsing, acceptance criteria, evaluation principles, event sourcing은 core workflow layer에 속하므로 런타임과 무관하게 동일하고, authentication, tool surface, sandbox/permission, session resume 같은 부분은 각 런타임의 native 특성에 따라 달라진다. 문서가 강조하는 핵심은 “same workflow, different UX surfaces”다.

이 분리는 특히 `ooo auto` 설명에서 잘 드러난다. runtime 옵션이 붙더라도 interview authoring, seed generation, seed repair는 Ouroboros MCP server 안에서 in-process로 수행되고, 마지막 Seed → 실행 handoff만 선택한 runtime adapter가 처리한다. 즉 `ooo auto --runtime codex`는 “Codex가 전체 파이프라인을 수행한다”가 아니라, **Ouroboros가 명세를 만들고 Codex는 그 명세의 실행 런타임으로 쓰인다**는 뜻에 가깝다.

## 공개된 근거에서 확인되는 점

GitHub API 조회 시점 기준으로 `Q00/ouroboros`는 2026년 1월 14일 생성된 MIT 라이선스 저장소이며, 기본 브랜치는 `main`이다. stars 4,457, forks 441, open issues 29, 총 커밋 수는 API `Link` header 기준 1,528개로 확인됐다. 최신 커밋은 `916b92e` 계열의 `feat(orchestrator): plan delivery fan-out within backend concurrency limits (#1361)`이고, 주 언어는 Python이다. GitHub Languages API는 Python 약 15.7MB 외에 Rust 163KB, TypeScript 56KB, Shell 33KB를 잡는다. Rust TUI와 TypeScript/OpenCode bridge 성격의 코드가 Python 패키지 바깥으로 뻗어 있음을 보여 주는 신호다.

릴리스 표면은 더 강하다. `releases/latest`는 최신 릴리스 `v0.41.0`을 반환하고, 이 릴리스는 2026년 6월 7일 게시됐다. 자산에는 `ouroboros_ai-0.41.0` wheel/source tarball뿐 아니라 macOS aarch64/x86_64, Linux x86_64, Windows x86_64용 `ouroboros-tui` 바이너리가 포함되어 있다. PyPI의 `ouroboros-ai` 최신 버전도 0.41.0이고, Python 요구 버전은 `>=3.12`다. 즉 이 프로젝트는 “흥미로운 README” 수준을 넘어, **PyPI 패키지와 별도 TUI 바이너리 배포 체계**를 같이 운영한다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub repo API | stars 4,457, forks 441, 1,528 commits, MIT license | 빠르게 성장 중인 agent infrastructure 프로젝트 |
| Latest release | `v0.41.0`, 2026-06-07, wheel/sdist/TUI binaries | 패키지와 TUI를 함께 배포하는 실제 릴리스 운영 |
| Plugin manifest | `.claude-plugin/plugin.json` version `0.41.0`, license MIT, keywords `workflow`, `requirements`, `socratic`, `seed`, `evaluation` | Claude Code 생태계에 노출되는 workflow plugin 정체성 |
| MCP manifest | `.mcp.json`이 `uvx --from ouroboros-ai[mcp,claude] ouroboros mcp serve`를 등록 | 설치형 MCP server surface 제공 |
| Runtime matrix | Claude/Codex/OpenCode/Hermes/Gemini/Kiro/Copilot/Pi 비교 | 특정 모델 종속보다 runtime adapter contract를 강조 |
| PyPI metadata | `ouroboros-ai` 0.41.0, Python `>=3.12` | Python 패키지로 설치·업데이트 가능한 배포 단위 |

`v0.41.0` 릴리스 노트의 헤드라인은 “Run it anywhere, and trust what it ships”다. 이 버전에서 Pi가 first-class runtime으로 추가됐고, setup이 stale binary를 참조하지 않도록 고쳐졌으며, Claude 모델 default pin을 `_model_defaults.py`로 중앙화했다고 설명한다. 입력 쪽에서는 Socratic interview가 ambiguity milestone마다 researcher, contrarian, simplifier 같은 lateral review를 호출하고, `ooo auto`가 low-ambiguity Seed와 QA를 통과하기 전에는 build를 시작하지 않도록 강화됐다. 출력 쪽에서는 verifier verdict를 typed/audited/admission-policy 기반으로 정리해, 실제로 실행된 테스트의 evidence shape가 어긋난 경우와 가짜 clean run을 더 잘 구분하려 한다.

이 흐름은 Ouroboros의 방향을 잘 보여 준다. 단순히 지원 런타임 목록을 늘리는 것이 아니라, **입력 명세의 ambiguity gate와 출력 검증의 evidence gate를 동시에 단단하게 만드는 것**이 릴리스의 중심이다. “goal in, product out”에 가까운 자동 실행을 하려면, 더 많은 자율성보다 먼저 “언제 시작해도 되는가”와 “무엇을 완료로 인정할 것인가”가 엄격해야 한다는 태도다.

다만 문서 동기화는 완전히 매끈하지 않다. 영문 README는 Claude Code, Codex CLI, OpenCode, Hermes, Gemini, Kiro, Copilot, Pi를 폭넓게 언급하지만, 같은 저장소의 한국어 README quick start는 여전히 “Claude Code, Codex CLI, Kiro CLI” 중심으로 남아 있다. `pyproject.toml`의 description도 “Works with Claude Code and Codex CLI”에 머문다. 또한 README 일부는 Goose를 언급하지만 runtime capability matrix의 설정값 표에는 Claude, Codex, OpenCode, Hermes, Gemini, Kiro, Copilot, Pi가 정리되어 있다. 이 불일치는 결함이라기보다, 프로젝트가 매우 빠르게 런타임 표면을 확장하는 중이라는 신호에 가깝다.

## 실무 관점에서의 해석

Ouroboros의 가장 흥미로운 점은 “에이전트를 더 똑똑하게 만들겠다”보다 **에이전트가 일하는 계약을 더 엄격하게 만들겠다**는 태도다. 최근 AI 코딩 제품 상당수는 더 긴 컨텍스트, 더 많은 툴, 더 강한 자율성으로 경쟁한다. Ouroboros는 여기에 한 단계 앞선 질문을 붙인다. “그 자율성이 무엇을 향해야 하는지 먼저 명세했는가?”라는 질문이다.

이 접근은 특히 팀 개발이나 고비용 작업에서 설득력이 있다. 실무에서는 한 번 잘못 잡힌 요구를 기반으로 생성된 코드가 수십 파일로 퍼진 뒤에야 문제가 보이는 경우가 많다. 이때 인터뷰, Seed, ambiguity gate, evaluation gate는 속도를 늦추는 절차가 아니라 **잘못된 가설을 초기에 싸게 깨는 장치**가 될 수 있다. 다시 말해 Ouroboros의 가치는 모델을 더 빨리 돌리는 데 있지 않고, 재작업과 요구 drift를 구조적으로 줄이는 데 있다.

또한 이 프로젝트는 agent stack의 계층을 꽤 명확히 분리한다. 모델 제공자나 코딩 런타임은 교체 가능하고, 그 위에 올라가는 것은 specification layer, routing policy, evaluation policy, persistence, observability다. 조직이 Claude Code를 쓰든 Codex를 쓰든, 나중에 Copilot이나 Pi 같은 다른 런타임을 붙이든, **같은 개발 워크플로우 계약을 유지하고 싶은 상황**과 잘 맞는다. 이런 점에서 Ouroboros는 “에이전트 자체”보다 “에이전트용 OS/control plane”에 더 가깝다.

물론 한계도 분명하다. 첫째, 구조가 큰 만큼 학습 비용이 높다. 간단한 스크립트 하나 만드는 수준에서는 인터뷰·Seed·평가·진화가 과한 절차로 느껴질 수 있다. 둘째, 런타임마다 permission, resume, structured output, tool surface가 다르기 때문에 같은 Seed가 항상 같은 사용자 경험을 보장한다고 보기는 어렵다. runtime matrix도 “no implied parity”를 명시한다. 셋째, UserLevel plugin layer와 `ourocode` shell은 README에서 이미 큰 그림에 들어왔지만, 별도 저장소의 성숙도는 본체보다 훨씬 초기다. 즉 Agent OS 비전은 선명하지만, 전체 stack이 같은 속도로 성숙했다고 보기는 어렵다.

그럼에도 방향성은 분명하다. 앞으로 agent tooling의 차별화는 단순히 “누가 더 잘 코딩하나”보다 **누가 더 좋은 실행 계약과 검증 루프를 제공하나**로 이동할 가능성이 크다. 그런 관점에서 Ouroboros는 프롬프트 엔지니어링의 연장선이라기보다, 명세·평가·진화·런타임 추상화를 중심에 둔 **specification-first Agent OS 실험**으로 보는 편이 더 정확하다.

Sources: https://github.com/Q00/ouroboros, https://github.com/Q00/ouroboros/releases/tag/v0.41.0, https://github.com/Q00/ouroboros/tags, https://github.com/Q00/ouroboros/blob/main/.claude-plugin/plugin.json, https://github.com/Q00/ouroboros/blob/main/.claude-plugin/marketplace.json, https://github.com/Q00/ouroboros/blob/main/.mcp.json, https://raw.githubusercontent.com/Q00/ouroboros/main/README.md, https://raw.githubusercontent.com/Q00/ouroboros/main/README.ko.md, https://raw.githubusercontent.com/Q00/ouroboros/main/docs/architecture.md, https://raw.githubusercontent.com/Q00/ouroboros/main/docs/runtime-capability-matrix.md, https://raw.githubusercontent.com/Q00/ouroboros/main/pyproject.toml, https://pypi.org/project/ouroboros-ai/, https://github.com/Q00/ourocode, https://github.com/Q00/ouroboros-plugins
