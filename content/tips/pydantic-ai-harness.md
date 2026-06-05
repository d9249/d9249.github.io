---
title: "Pydantic AI Harness: 에이전트에 기능 배터리 붙이기"
date: "2026-06-05T18:40:21"
description: "CodeMode, 파일시스템, 셸, 프롬프트/컨텍스트 관리 등 Pydantic AI 에이전트용 capability를 골라 붙이는 공식 Python 라이브러리."
author: "Sangmin Lee"
repository: "pydantic/pydantic-ai-harness"
sourceUrl: "https://github.com/pydantic/pydantic-ai-harness"
status: "Open source alpha"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Python"
  - "Pydantic AI"
  - "Agent Framework"
  - "Developer Tools"
highlights:
  - "Pydantic AI 팀이 관리하는 공식 capability 라이브러리로, 핵심 런타임 밖의 선택형 기능을 모듈처럼 붙인다."
  - "CodeMode는 여러 도구 호출을 Monty 샌드박스의 단일 Python 실행으로 접어 왕복과 컨텍스트 사용량을 줄인다."
  - "FileSystem·Shell capability는 루트 디렉터리, glob 필터, 명령 allow/deny list로 에이전트 도구 실행을 기본 가드한다."
  - "0.x alpha라 minor release의 breaking change와 PyPI/main branch drift를 감안해 버전 pinning이 필요하다."
draft: false
---

Pydantic AI를 써서 에이전트를 만들다 보면 금방 같은 질문에 부딪힌다. “파일을 읽고 고치게 할까?”, “셸 명령을 어디까지 허용할까?”, “MCP나 웹 검색을 여러 번 호출해야 할 때 왕복 비용을 어떻게 줄일까?”, “프롬프트나 컨텍스트 관리는 매번 직접 구현해야 하나?” 같은 문제다.

**Pydantic AI Harness**는 이런 기능을 Pydantic AI의 `capabilities`/`hooks` API 위에 올린 공식 capability 라이브러리다. Pydantic AI core가 에이전트 루프와 모델/도구 실행의 기본 런타임을 맡는다면, Harness는 코딩 에이전트·리서치 에이전트·운영용 에이전트에 필요한 선택형 배터리를 패키지처럼 붙이는 쪽에 가깝다.

![Pydantic AI Harness CodeMode trace](/images/tips/pydantic-ai-harness-code-mode-trace.png)

## 무엇이 들어 있나

조사 시점의 GitHub main branch와 README 기준으로 눈에 띄는 축은 네 가지다.

| 영역 | 대표 capability | 요약 |
|---|---|---|
| 도구 실행 | `CodeMode` | 여러 도구 호출을 하나의 `run_code` 호출 안에서 Python 코드로 묶어 실행한다. |
| 로컬 작업 | `FileSystem`, `Shell` | 파일 읽기/쓰기/검색과 명령 실행을 루트 디렉터리, glob 규칙, 명령 allow/deny list로 제한한다. |
| 운영/관측 | `ManagedPrompt` | Logfire managed prompt를 에이전트 instruction으로 연결해 프롬프트 버전과 rollout을 관리한다. |
| 컨텍스트 관리 | `SlidingWindow`, `ClearToolResults`, `TieredCompaction` 등 | 오래된 메시지·툴 결과를 자르거나 요약해 context window를 관리한다. 현재는 experimental 경로에 있다. |

핵심은 “Pydantic AI를 대체하는 새 프레임워크”가 아니라는 점이다. 이미 Pydantic AI의 `Agent`를 쓰고 있다면 `capabilities=[...]`에 필요한 조각만 추가하는 방식으로 접근한다.

## CodeMode가 특히 흥미로운 이유

README의 Quick start는 Hacker News MCP 서버와 웹 검색을 붙인 에이전트가 여러 피드, 댓글, 사용자 정보, 웹 검색을 엮는 예시를 보여준다. 일반적인 tool calling에서는 도구 호출마다 모델 왕복이 늘어나지만, `CodeMode`는 선택된 도구를 Monty 샌드박스 안의 단일 `run_code` 도구로 감싼다. 모델은 `asyncio.gather`, 루프, 조건문, 로컬 필터링을 써서 여러 도구 호출을 한 번의 코드 실행으로 묶을 수 있다.

![Pydantic AI Harness quick start trace](/images/tips/pydantic-ai-harness-quick-start-trace.png)

첫 시도는 이렇게 작게 시작할 수 있다.

```bash
uv add "pydantic-ai-slim[anthropic,mcp,duckduckgo,logfire]" "pydantic-ai-harness[code-mode]"
```

```python
import logfire
from pydantic_ai import Agent
from pydantic_ai.capabilities import MCP, WebSearch
from pydantic_ai_harness import CodeMode

logfire.configure()
logfire.instrument_pydantic_ai()

agent = Agent(
    'anthropic:claude-opus-4-7',
    capabilities=[
        CodeMode(),
        MCP('https://hn.caseyjhand.com/mcp', native=False),
        WebSearch(native=False),
    ],
)
```

이 패턴은 “검색 10번 → 결과 정리 → 추가 조회”처럼 도구 호출이 많은 리서치/코딩 에이전트에서 유용하다. 단, Monty 샌드박스에는 제약이 있다. 클래스 정의, 임의의 서드파티 import, wall-clock/timing primitive 등은 막혀 있고, approval이 필요한 도구나 deferred execution 도구는 샌드박스에서 제외된다. 즉 “더 빠른 도구 orchestration”이지, 무제한 Python 런타임을 에이전트에게 주는 것은 아니다.

## 파일·셸 capability는 기본 가드로 보기

`FileSystem`은 `root_dir` 아래로 경로를 제한하고, symlink까지 resolve한 뒤 containment check를 한다. `.env`, `.git`, `*.pem`, `*.key`, `**/secrets*` 같은 보호 패턴은 기본적으로 read-only/차단 쪽으로 다룬다. 파일 읽기에는 line number와 hash가 붙고, 쓰기/편집에는 `expected_hash`를 걸어 stale write를 막을 수 있다.

`Shell`은 `run_command`, `start_command`, `check_command`, `stop_command` 같은 도구를 제공한다. command allowlist/denylist, shell operator 차단, timeout, background process cleanup 같은 기본기를 포함한다. 빌드·테스트·lint를 돌리는 코딩 에이전트에는 꽤 실용적인 출발점이다.

다만 README도 명시하듯 이런 제어는 **hard security boundary가 아니라 best-effort guard**다. `bash -c`, 환경변수 우회, 허용된 명령의 부작용까지 완벽히 막는 샌드박스는 아니다. 실제 고객 데이터나 프로덕션 서버에 연결할 에이전트라면 OS-level sandbox, 컨테이너, 별도 권한 계정, approval workflow를 함께 설계해야 한다.

## 설치와 버전 감각

기본 설치는 PyPI 패키지로 가능하다.

```bash
uv add pydantic-ai-harness
```

CodeMode는 Monty 샌드박스가 필요하므로 extra를 붙인다.

```bash
uv add "pydantic-ai-harness[codemode]"
```

공개 PyPI 기준 최신 버전은 `0.3.0`이고, `requires-python`은 `>=3.10`, 기본 의존성은 `pydantic-ai-slim>=1.95.1`이다. GitHub 릴리스도 `v0.3.0`까지 공개되어 있으며 MIT 라이선스다.

주의할 점은 README의 version policy다. Harness는 아직 **0.x alpha**이고, minor release에서 파라미터명·기본값·API 구조가 바뀔 수 있다고 밝힌다. GitHub main branch의 capability 문서와 PyPI release metadata도 빠르게 움직일 수 있으므로, 팀 프로젝트에서는 `pydantic-ai-harness==0.3.0`처럼 버전을 고정하고 릴리스 노트를 같이 확인하는 편이 안전하다.

## 어디에 써볼 만한가

- Pydantic AI 기반 에이전트에 파일/셸/웹/MCP 도구를 붙이되, 매번 보안 가드와 도구 래핑을 새로 만들고 싶지 않을 때
- 다수의 도구 호출을 모델 왕복 없이 한 번의 sandboxed Python 실행으로 묶고 싶을 때
- Logfire를 이미 쓰고 있고, 운영 중 프롬프트 버전·rollout·trace correlation을 관리하고 싶을 때
- context compaction, tool-output clearing, limit warning 같은 기능을 Pydantic AI capability 형태로 실험하고 싶을 때

반대로 “완성된 코딩 에이전트 앱”을 기대하면 결이 다르다. Harness는 앱이나 CLI 제품이 아니라 Pydantic AI 앱을 만드는 개발자가 import해서 조립하는 라이브러리다. 실행 환경, 모델 provider 키, MCP 서버, 로컬 권한 정책은 여전히 애플리케이션 쪽에서 책임져야 한다.

## 내 판단

Pydantic AI를 이미 실험 중이라면 Harness는 꽤 먼저 살펴볼 만하다. 특히 `CodeMode`는 도구 호출이 많은 에이전트에서 latency와 context noise를 줄이는 방향이 명확하고, Logfire trace까지 같이 보면 “모델이 어떤 도구를 어떤 코드로 묶었는지”를 운영 관점에서 설명하기 쉽다.

다만 지금은 안정된 엔터프라이즈 패키지라기보다 빠르게 정리 중인 공식 capability incubator에 가깝다. 개인/팀의 에이전트 프로토타입에는 적극적으로 써볼 만하지만, 프로덕션 도입은 버전 pinning, sandbox/권한 분리, 모델 비용/컨텍스트 예산, Logfire나 MCP 연결 범위를 함께 점검한 뒤 진행하는 편이 좋다.

## 참고한 공개 자료

- [pydantic/pydantic-ai-harness GitHub repository](https://github.com/pydantic/pydantic-ai-harness)
- [Pydantic AI Harness README](https://github.com/pydantic/pydantic-ai-harness/blob/main/README.md)
- [PyPI: pydantic-ai-harness](https://pypi.org/project/pydantic-ai-harness/)
- [Pydantic AI capabilities documentation](https://ai.pydantic.dev/capabilities/)
- [Pydantic AI Harness v0.3.0 release](https://github.com/pydantic/pydantic-ai-harness/releases/tag/v0.3.0)
