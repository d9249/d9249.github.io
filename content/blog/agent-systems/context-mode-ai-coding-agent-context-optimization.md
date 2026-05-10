---
title: "Context Mode는 AI 코딩 에이전트의 컨텍스트 병목을 운영체제처럼 다룬다"
date: "2026-05-11T01:35:43"
description: "mksglu/context-mode는 MCP 도구 출력, 세션 압축, 상태 복구, 검색 기반 재주입을 하나의 실행 레이어로 묶어 Claude Code·Gemini CLI·Cursor·Copilot·OpenCode 같은 코딩 에이전트의 컨텍스트 낭비를 인프라 문제로 재정의한다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agents
  - MCP
  - Claude Code
  - Context Engineering
  - Developer Tools
draft: false
---

코딩 에이전트를 오래 써 본 팀이라면 결국 비슷한 지점에서 막힌다. 모델이 코드를 잘 쓰는지보다, 도구가 뿜어내는 방대한 출력과 중간 상태를 얼마나 오래 보존할 수 있는지가 더 큰 병목이 된다. Playwright 스냅샷 한 번, GitHub 이슈 목록 한 번, 빌드 로그 몇 번만 오가도 대화창의 상당 부분이 원시 데이터로 채워지고, 세션이 compact되면 모델은 방금 하던 파일 편집 맥락이나 작업 순서를 잃어버리기 쉽다.

`mksglu/context-mode`는 바로 이 문제를 "모델이 더 똑똑해지면 해결된다"가 아니라, 런타임이 관리해야 할 인프라 계층이라고 본다. 저장소 설명과 README가 반복해서 강조하는 것도 이 지점이다. 이 프로젝트는 단순한 MCP 툴 하나가 아니라, 샌드박스 실행·세션 연속성·검색 기반 재주입·후크 기반 라우팅 정책을 묶어서 컨텍스트 창을 운영 자원처럼 아끼는 실행 레이어를 만들려 한다.

흥미로운 점은 범위가 꽤 넓다는 것이다. 공개 README와 설정 문서 기준으로 context-mode는 Claude Code, Gemini CLI, VS Code Copilot, JetBrains Copilot, Cursor, OpenCode, KiloCode, Codex CLI, Qwen Code, Zed, Pi/OMP 등 15개 플랫폼을 겨냥한다. 즉 특정 벤더의 기능 확장이 아니라, "AI 코딩 에이전트가 컨텍스트를 다루는 공통 방식"을 만들려는 시도에 가깝다.

![context-mode repository OG image](https://opengraph.githubassets.com/e97db40f2f109362ac58084ef999bca03a92da598ac6daae9c7e8120445f1ba2/mksglu/context-mode)

## 무엇을 해결하려는가

context-mode가 겨냥하는 문제는 단순히 토큰 절약이 아니다. README의 문제 정의를 보면 네 가지가 함께 묶여 있다. 첫째, MCP 도구 호출이 원시 출력을 그대로 컨텍스트 창에 밀어 넣는 문제다. 둘째, 세션 compact 이후 에이전트가 편집 중인 파일, 최근 사용자 결정, 작업 흐름 같은 상태를 잃는 문제다. 셋째, 모델이 직접 계산과 분류를 수행하려고 하면서 쓸데없이 많은 데이터를 읽는 문제다. 넷째, 출력 토큰 낭비도 병목이 될 수 있지만, 최신 README는 이를 별도의 말투 강제 규칙으로 해결하려 하지 않고 데이터 라우팅 경계에 집중한다고 선을 긋는다.

이 네 문제는 서로 연결돼 있다. 원시 출력이 많이 들어오면 compact가 빨라지고, compact가 오면 상태를 잃고, 상태를 잃으면 같은 파일과 로그를 다시 읽게 되고, 그러면 다시 더 많은 출력을 태운다. context-mode는 이 악순환을 끊기 위해 "도구 출력의 샌드박싱"과 "이벤트 수준의 상태 기록"을 함께 가져간다.

실무적으로 보면 이는 긴 디버깅 세션이나 멀티 스텝 구현에서 특히 중요하다. 모델이 똑똑해도, 직전 세션의 에러 원인과 작업 중이던 파일 목록을 잊으면 반복 작업이 생긴다. context-mode는 이를 기억력 문제가 아니라 state management 문제로 재정의한다는 점에서 꽤 명확한 문제의식을 갖고 있다.

## 핵심 아이디어 / 구조 / 동작 방식

context-mode의 구조는 크게 네 층으로 읽을 수 있다.

첫 번째는 **sandboxed processing**이다. README와 `CLAUDE.md`는 분석·카운팅·필터링·비교·파싱 같은 작업을 직접 대화 맥락에서 하지 말고 `ctx_execute`, `ctx_execute_file`, `ctx_batch_execute` 같은 도구에 넘겨 코드로 처리하라고 강하게 요구한다. 핵심 철학은 "Think in Code"다. 데이터를 모델이 읽는 대신, 모델이 짧은 프로그램을 작성해 결과만 `console.log()` 하게 만들자는 것이다.

두 번째는 **searchable session continuity**다. README에 따르면 파일 편집, git 작업, task, error, user decision 같은 이벤트가 SQLite에 기록되고, 세션이 compact된 뒤에는 그 기록을 FTS5/BM25 검색으로 다시 불러온다. 중요한 점은 전체 이력을 다시 대화에 밀어 넣는 것이 아니라, 필요한 부분만 검색 기반으로 복원한다는 것이다. 즉 단순한 세션 로그 덤프가 아니라 retrieval layer를 붙인 상태 저장소에 가깝다.

세 번째는 **platform-specific hook injection**이다. 이 프로젝트는 단일 MCP 서버로 끝나지 않는다. `.claude-plugin`, `.openclaw-plugin`, 각종 `configs/` 디렉터리, adapter별 문서가 함께 들어 있고, README는 플랫폼마다 hook과 routing instruction 주입 방식을 다르게 설명한다. Claude Code는 plugin marketplace와 SessionStart hook, Cursor는 hooks + `.mdc` rule 파일, OpenCode/KiloCode는 TypeScript plugin, JetBrains Copilot은 `.github/hooks/context-mode.json`과 MCP 설정 UI를 조합한다. 즉 동일한 아이디어를 여러 하네스의 제약에 맞춰 이식하는 구조다.

네 번째는 **routing-only discipline**이다. 초기 설명에서는 응답을 짧게 만드는 규율이 더 강하게 보였지만, 최신 README는 "No prose-style enforcement"를 명시한다. 즉 context-mode는 모델의 최종 답변 말투나 분량을 대신 결정하지 않고, 원시 데이터가 어디로 흘러가는지, 어떤 대용량 도구 호출을 샌드박스로 우회할지, 언제 검색 가능한 지식 저장소로 넘길지를 관리하는 쪽에 초점을 맞춘다.

| 레이어 | 공개 자료에서 확인되는 구성요소 | 역할 |
|---|---|---|
| Sandboxed execution | `ctx_execute`, `ctx_execute_file`, `ctx_batch_execute`, `ctx_fetch_and_index` | 원시 출력 대신 계산 결과만 컨텍스트에 올림 |
| Session continuity | SQLite, FTS5, BM25, compact 이후 검색 기반 복원 | 긴 세션에서 상태 손실을 줄임 |
| Multi-platform routing | Claude plugin, OpenCode/KiloCode plugin, Cursor hooks, Copilot/Gemini 설정 파일 | 하네스별로 자동 라우팅과 정책 주입 |
| Routing-only discipline | no prose-style enforcement, hook-based routing block | 말투 강제가 아니라 대용량 데이터 흐름 제어에 집중 |

지원 범위도 꽤 공격적이다. README는 15개 플랫폼을 언급하고, 루트 구조에는 Claude Code용 `.claude-plugin`, Cursor plugin 경로, OpenClaw용 `openclaw.plugin.json`, PI/OMP extension 경로, Qwen Code와 Codex CLI를 포함한 여러 adapter별 config와 docs가 들어 있다. `package.json`도 이 프로젝트가 단순 로컬 스크립트가 아니라 CLI, plugin export, OpenClaw extension, skills 디렉터리까지 함께 배포하는 패키지라는 점을 보여준다.

## 공개된 근거에서 확인되는 점

가장 눈에 띄는 근거는 수치다. GitHub API 기준 조회 시점의 저장소는 약 14.2k stars, 993 forks, 7 open issues를 보이고, 최신 릴리스는 `v1.0.117`이다. 태그는 146개, GitHub Releases는 143개까지 쌓여 있으며, `stats.json`에는 `users 151.7k+`, `npm 121.5k+`, `marketplace 30.2k+`라는 별도 설치/사용 지표가 들어 있다. star 수와 설치 수는 직접 비교할 수 있는 같은 단위는 아니지만, 적어도 저장소 반응보다 실제 배포 채널 지표를 더 강조하려는 프로젝트라는 점은 분명하다.

벤치마크 문서도 꽤 구체적이다. `BENCHMARK.md`는 총 21개 시나리오, 376KB 원시 데이터, 16.5KB 컨텍스트 소비, 전체 96% 절감이라는 숫자를 제시한다. 특히 `ctx_execute_file` 파트에서는 315KB를 5.5KB로 줄여 98% 절감했다고 적고, `ctx_index + ctx_search` 파트에서는 60.3KB를 11.0KB로 줄여 82% 절감을 제시한다. 중요한 건 이 둘을 같은 방식으로 보지 않는다는 점이다. 요약이 적합한 로그/빌드 출력은 압축하고, 정확한 코드 블록이 중요한 문서/레퍼런스는 FTS5 검색으로 원문 chunk를 되돌려주는 식으로 역할을 나눈다.

또 다른 신호는 테스트와 배포 구조다. `BENCHMARK.md`는 Executor 55개, ContentStore 34개, MCP Integration 22개, Ecosystem Benchmark 14개로 총 125개 테스트가 모두 통과한다고 적는다. `package.json`에는 `test`, `benchmark`, `test:ecosystem`, `doctor`, `setup`, `install:openclaw` 같은 스크립트가 분명히 나뉘어 있고, 선택적 의존성으로 `better-sqlite3`를 둬 로컬 DB를 활용한다. 이는 단순 프롬프트 모음이 아니라 런타임/도구 체인을 포함한 실제 소프트웨어라는 의미다.

라이선스는 특히 주의해서 볼 필요가 있다. GitHub API의 `license` 필드는 `Other / NOASSERTION`으로 보이지만, README badge, `package.json`, `.claude-plugin/plugin.json`, `openclaw.plugin.json`은 모두 Elastic License 2.0을 가리킨다. 게다가 커밋 히스토리 링크 중에는 "MIT에서 ELv2로 전환"한 흔적도 노출된다. 따라서 이 저장소를 단순한 permissive 오픈소스처럼 보는 것은 부정확하다. 사용이나 재배포 문맥에서 라이선스 해석이 중요할 수 있다.

![context-mode demo thumbnail](https://img.youtube.com/vi/QUHrntlfPo4/maxresdefault.jpg)

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub API / repo page | 14.2k stars, 993 forks, 146 tags, 143 releases, latest release `v1.0.117` | 빠르게 릴리스되는 툴체인 성격 |
| `stats.json` | `users 151.7k+`, `npm 121.5k+`, `marketplace 30.2k+` | GitHub 지표 외에 설치/유통 지표를 별도로 운영 |
| `BENCHMARK.md` | 21 scenarios, 376KB raw → 16.5KB context, overall 96% saving | 단순 슬로건이 아니라 벤치마크 서사를 갖춤 |
| `package.json` / plugin manifests | CLI, plugin exports, skills, OpenClaw/PI integration, Elastic-2.0 | 멀티 하네스 배포용 제품 구조 |
| 라이선스 표기 비교 | GitHub API는 `NOASSERTION`, 공식 파일은 ELv2 | 배포·상용 활용 시 해석 주의 필요 |

## 실무 관점에서의 해석

내가 보기에 context-mode의 진짜 의미는 "컨텍스트 엔지니어링"을 프롬프트 기교에서 운영 계층으로 끌어내린 데 있다. 많은 팀이 지금까지는 긴 시스템 프롬프트, 요약 습관, 수동 메모 같은 방식으로 문제를 버텨 왔다. 하지만 context-mode는 그보다 한 단계 아래로 내려가, 어떤 도구를 언제 우회하고 어떤 상태를 DB에 남기며 어떤 검색 계층으로 다시 끌어올릴지를 실행 환경이 책임져야 한다고 주장한다.

이 해석은 멀티 하네스 지원과도 연결된다. Claude Code, Cursor, Gemini CLI, Copilot, OpenCode, Codex CLI처럼 각 환경의 hook 체계와 MCP 연결 방식은 다르지만, 컨텍스트 낭비라는 문제 자체는 공통이다. context-mode는 이 공통 병목을 겨냥해 "라우팅 규칙 + 로컬 지식 저장소 + 샌드박스 계산 + 세션 복구"라는 공통 해법을 이식하려 한다. 즉 특정 모델 최적화라기보다, 에이전트 런타임 운영 원칙을 패키징한 프로젝트에 가깝다.

물론 한계도 있다. 첫째, 벤치마크 수치는 설득력 있지만 대부분 프로젝트가 정의한 사용 시나리오 위에서 나온다. 실제 팀 환경에서는 어떤 도구를 얼마나 자주 쓰는지, raw output을 반드시 봐야 하는 순간이 얼마나 많은지에 따라 체감 절감 폭이 달라질 수 있다. 둘째, hook과 rules file, plugin, adapter 문서가 많다는 것은 곧 설치/운영 복잡도가 높다는 뜻이기도 하다. README가 플랫폼별로 상세 설치법을 따로 설명하는 이유도 바로 이것이다. 셋째, 라이선스가 ELv2라는 점은 개인 사용과 별개로 조직 도입 시 검토 포인트가 될 수 있다.

그럼에도 방향은 매우 설득력 있다. 코딩 에이전트 경쟁이 단순 모델 품질을 넘어 실제 장시간 작업 완주율로 이동한다면, 승부는 더 큰 컨텍스트 창보다 "컨텍스트를 덜 태우는 운영 레이어"에서 날 가능성이 크다. 그런 점에서 context-mode는 MCP 도구 하나라기보다, AI 코딩 에이전트 시대의 메모리 관리·상태 복구·도구 라우팅 정책을 한 묶음으로 제품화한 사례로 보는 편이 맞다.

Sources: https://github.com/mksglu/context-mode, https://context-mode.com, https://api.github.com/repos/mksglu/context-mode, https://api.github.com/repos/mksglu/context-mode/releases/latest, https://registry.npmjs.org/context-mode/latest, https://raw.githubusercontent.com/mksglu/context-mode/main/README.md, https://raw.githubusercontent.com/mksglu/context-mode/main/BENCHMARK.md, https://raw.githubusercontent.com/mksglu/context-mode/main/package.json, https://raw.githubusercontent.com/mksglu/context-mode/main/.claude-plugin/plugin.json, https://raw.githubusercontent.com/mksglu/context-mode/main/.claude-plugin/marketplace.json, https://raw.githubusercontent.com/mksglu/context-mode/main/openclaw.plugin.json, https://raw.githubusercontent.com/mksglu/context-mode/main/stats.json, https://raw.githubusercontent.com/mksglu/context-mode/main/docs/jetbrains-copilot.md, https://www.youtube.com/watch?v=QUHrntlfPo4