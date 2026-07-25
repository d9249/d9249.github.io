---
title: "NOOA는 agent framework를 새 DSL이 아니라 Python object로 만든다"
date: "2026-07-25T23:47:39+09:00"
description: "NVIDIA-labs Object-Oriented Agents(NOOA)는 field를 state, method를 capability, docstring을 prompt, type annotation을 contract로 삼아 agent를 하나의 Python class로 표현하고, `...` body만 LLM-driven loop로 실행하는 연구용 agent framework다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - NOOA
  - Agent Framework
  - Python
  - CodeAct
  - Long-Term Memory
image: "/images/blog/nooa-memory-system.webp"
draft: false
---

AI agent를 만들 때 prompt, tool schema, callback, memory, workflow graph, trace viewer가 서로 다른 설정 표면으로 흩어지는 일은 흔하다. 기능을 하나 더 넣을수록 Python application의 control flow와 agent framework의 별도 DSL 사이를 오가게 되고, agent 자신이 무엇을 보고 어떤 state를 바꿨는지 추적하기도 어려워진다.

`NVIDIA-labs Object-Oriented Agents`(NOOA)는 이 문제를 “agent는 Python object”라는 한 문장으로 압축한다. field는 state, method는 model이 호출할 capability, docstring은 prompt, type annotation은 input/output contract다. method body가 일반 Python이면 그대로 deterministic하게 실행되고, body가 `...`이면 runtime이 LLM-driven agent loop로 구현한다. application 입장에서는 둘 다 평범한 method call이다.

논문은 typed I/O, live object pass-by-reference, code as action, programmable loop engineering, explicit object state, model-callable harness API의 여섯 interface capability를 한 표면에 결합했다고 주장한다. 이는 “새 agent language를 배운다”기보다 Python class design을 agent runtime으로 확장하는 접근이다. 동시에 NOOA는 LLM-generated Python code를 실행할 수 있는 **research software**이며, repository도 production use가 아니라 sandboxed environment에서 사용할 것을 명시한다.

## 무엇을 해결하려는가

기존 agent SDK도 tool·memory·handoff·trace·code execution을 제공한다. NOOA의 비판점은 기능의 유무가 아니라, 인간 개발자와 model이 만지는 **interface가 분리돼 있다는 것**이다.

예를 들어 application code에는 `Order` object와 `is_refund_eligible()` helper가 있지만, model에게는 이를 다시 JSON schema·prompt·callback 형태로 노출해야 하는 구조가 많다. control flow도 framework graph나 orchestration config로 외부화되기 쉽다. 이때 type, exception, async, object lifetime처럼 Python이 이미 잘 정의한 abstraction이 agent layer에서 다시 발명된다.

NOOA는 Python이 이미 가진 것을 가능한 한 그대로 쓴다.

| Python abstraction | NOOA에서의 의미 | model-facing 효과 |
|---|---|---|
| class | agent | state·capability·prompt surface를 한 단위로 묶음 |
| typed field | durable object state | typed live object를 reference로 전달 |
| ordinary method | deterministic helper/action | model도 `self`를 통해 호출 가능 |
| `...` body가 있는 async method | agentic generation method | signature가 contract, docstring이 prompt가 됨 |
| type annotation | input/output contract | return value 검증과 실패 시 retry의 기준 |
| `asyncio`, exception, control flow | loop/orchestration | developer와 model이 같은 Python model을 공유 |

핵심은 `...`가 “이 부분은 prompt로 구현한다”는 표시라는 점이다. 예를 들어 `async def triage(...) -> Ticket: ...`는 runtime이 LLM loop로 실행하지만, `def is_refund_eligible(...) -> bool:`처럼 실제 body가 있는 method는 기존 Python처럼 실행된다. agentic behavior와 deterministic business logic을 같은 object 안에서 구분하면서 연결한다.

## 핵심 구조: method call을 agent loop로 다시 해석한다

### 1. Predict와 CodeAct를 method별 strategy로 고른다

NOOA의 agentic method는 strategy decorator를 통해 실행 방식이 정해진다.

- **PredictStrategy**: context를 한 번 render하고, typed value를 생성한 뒤 return type에 맞는지 validate한다. 분류·추출처럼 단발 작업에 맞는다.
- **CodeActStrategy**: model이 Jupyter-style Python REPL에서 `self`, import, helper를 이용해 code를 실행한다. harness는 output·error·state를 event로 기록하고, 다음 turn에 update된 context를 다시 보여 준다. model이 `return_result(...)`를 호출하면 type validation을 통과한 값만 caller에게 반환된다.

이 설계에서 tool은 별도로 선언한 function catalog만을 뜻하지 않는다. model이 실행 환경의 Python method와 live object를 사용할 수 있으므로, 이미 존재하는 class interface 자체가 action surface가 된다. 논문이 말하는 **code as action**과 **pass-by-reference**는 긴 object를 계속 prompt text로 serialize하지 않고, model이 REPL에서 실제 object를 inspect·modify·helper-call하게 하는 방식이다.

### 2. context·event·state를 object API로 다룬다

CodeAct turn은 `context render → LLM call → Python execution → event/state update → validation` 순서로 반복된다. context는 세 층으로 나뉜다.

1. **static block**: system instruction처럼 한 method call 동안 안정적인 정보
2. **typed event history**: tool call, Python output, return value처럼 누적되는 실행 기록
3. **dynamic block**: TODO 상태나 `self`의 선택된 field처럼 매 turn 다시 계산되는 정보

agent는 flat transcript를 훑는 대신 typed event를 query할 수 있고, developer와 agent 모두 context/event API에 접근한다. model call 사이의 state도 agent object에 명시적으로 남는다. 이는 “prompt engineering을 software engineering으로 되돌린다”는 NOOA의 실제 구현적 의미다.

### 3. memory는 하나의 inspectable SQLite file에서 작동한다

NOOA의 `MemoryManager`는 기존 agent class를 수정하지 않고 attach할 수 있다. agent는 write, recall, search, update, forget 같은 도구로 memory store를 관리하고, `BeforeTurn` hook은 관련 memory를 dynamic context block에 주입한다. reflection 단계는 기록을 merge·abstract·forget하며, 모든 access는 log로 남는다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/nooa-memory-system.webp">
    <img
      src="/images/blog/nooa-memory-system.webp"
      alt="NOOA memory system 구조. Agent가 context block과 memory tool로 memory manager에 접근하고, retrieval·reflection·SQLite store·observability가 write, deliberate recall, spontaneous recall, consolidation 흐름으로 연결된다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 5를 로컬 최적화한 공식 memory architecture. primary state는 사람이 inspect할 수 있는 단일 SQLite file에 있고, vector index는 derived·pluggable component로 둔다.
  </figcaption>
</figure>

논문은 memory를 “vector DB를 붙인다”는 기능으로 축소하지 않는다. write policy, deliberate recall, spontaneous injection, reflection, access trace를 각각 다른 channel로 둔다. public repository의 `nooa-memory` package 설명도 ARC-AGI-3 example과 함께 제공되는 long-term memory subsystem이며 아직 PyPI publish 전이라고 명시한다.

## 공개된 근거에서 확인되는 점

### capability test에서는 interface 사용 가능성을 먼저 검증했다

저자들은 88개 capability test를 model당 5회씩 실행해 440 record를 만들었다. 전체 4,400 record 중 4,309개가 통과해 **97.9%** pass rate를 보고한다. GPT-5.5는 440/440, Claude Opus 4.8과 Gemini 3.1 Pro preview는 각각 99.5%, Nemotron 3 Nano 30B는 91.6%였다.

이 점검은 benchmark 점수보다 먼저 읽을 필요가 있다. NOOA의 claim은 model이 type annotation, `...` method, live object, context/event API 같은 interface를 실제로 이해하고 사용할 수 있다는 것이므로, 단순 task success뿐 아니라 interface comprehension을 별도로 시험한 것이다. 다만 저자 설계의 capability suite이므로, 이 수치를 framework-neutral usability 평가로 일반화해서는 안 된다.

### SWE-bench와 Terminal-Bench에서는 같은 backend로 open harness를 비교했다

논문은 253 lines의 benchmark-agnostic `BenchAgent`를 사용해 NOOA, OpenCode, PI를 같은 GPT-5.5·Claude Opus 4.6 backend에서 비교했다고 설명한다. 아래는 paper-reported task pass rate이며, 서로 다른 model·reasoning effort·harness의 leaderboard를 한 줄 ranking으로 읽으면 안 된다.

| benchmark / backend | NOOA | OpenCode | PI | 논문에서 보이는 비교 |
|---|---:|---:|---:|---|
| SWE-bench Verified, GPT-5.5 off | **67.2** | 59.2 | 60.8 | NOOA가 낮은 reasoning setting에서 앞섬 |
| SWE-bench Verified, GPT-5.5 high | **78.8** | 75.0 | 73.6 | 같은 backend·effort 비교 |
| SWE-bench Verified, GPT-5.5 xhigh | **82.2** | 78.6 | 78.2 | 논문 main result 중 가장 높은 GPT-5.5 row |
| SWE-bench Verified, Opus 4.6 high | **79.8** | 75.2 | 75.8 | 같은 Opus setting 비교 |
| Terminal-Bench 2.0, GPT-5.5 off | **46.1** | 34.8 | 37.1 | low-effort margin이 큼 |
| Terminal-Bench 2.0, GPT-5.5 high | **73.0** | 60.7 | 68.5 | NOOA +12.3 vs OpenCode |
| Terminal-Bench 2.0, GPT-5.5 xhigh | 73.0 | 52.8 | **75.3** | PI가 이 specific setting에서 더 높음 |
| Terminal-Bench 2.0, Opus 4.6 high | **65.2** | 43.8 | 58.4 | NOOA가 해당 row에서 앞섬 |

저자들은 GPT-5.5 xhigh SWE-bench에서 NOOA가 약 28 model call·110만 token/task으로 82.2%를 기록했고, PI는 66 call·220만 token/task으로 78.2%였다고 보고한다. 여기서 해석의 중심은 “Python object가 magic하게 benchmark를 푼다”가 아니다. typed termination, persistent live object, bounded context preview가 **긴 transcript 재직렬화와 근거 없는 완료 선언을 줄인다**는 harness-level hypothesis다.

실제로 논문은 NOOA가 `TaskResult`의 root cause, supporting evidence, verification command를 type-validated return으로 요구한다고 설명한다. 이에 비해 비교 대상의 한 종료 규칙은 model이 tool call 없이 응답하면 끝나는 방식이며, Terminal-Bench에서 OpenCode의 실패 GPT-5.5 run 중 77%가 10 step 안에 종료됐다고 저자들은 분석한다. 이 결과는 모델 quality뿐 아니라 “언제 끝났다고 허용하는가”가 agent score를 크게 바꾼다는 사례다.

### memory가 포함된 one-agent ARC-AGI-3 fleet의 주장

NOOA 논문은 더 큰 multi-agent world-model system을 one NOOA agent + one 50-line skill로 단순화했다고 제시한다. competition의 2시간 cap 아래 25-game fleet으로 실행한 paper-reported 결과는 다음과 같다.

| 설정 | backend | fleet-mean RHAE | levels | 해석 범위 |
|---|---|---:|---:|---|
| baseline skill + memory | GPT-5.5 | 41.7% | – | hypothesis-driven baseline |
| world-model skill + markdown files | GPT-5.5 | 38.4% | – | memory subsystem ablation |
| **world-model skill + NOOA memory** | GPT-5.5 | **50.2%** | 118 | baseline 대비 +8.5, markdown ablation 대비 +11.8 |
| **world-model skill + NOOA memory** | GPT-5.6-sol | **85.1%** | 170 | 같은 methodology, 다른 backend |

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/nooa-arc-agi3-results.webp">
    <img
      src="/images/blog/nooa-arc-agi3-results.webp"
      alt="NOOA ARC-AGI-3 결과 그래프. 두 시간 fleet wall-clock 동안 baseline skill, markdown file memory, world-model plus memory GPT-5.5, world-model plus memory GPT-5.6-sol의 fleet-mean RHAE 변화를 비교한다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 7을 로컬 최적화한 공식 결과. 25 games/fleet과 2시간 cap이라는 설정에서, memory subsystem을 둔 world-model skill이 markdown-file ablation보다 높았다고 보고한다.
  </figcaption>
</figure>

저자들은 GPT-5.5 world-model + memory fleet의 per-game cost를 $17.85, GPT-5.6-sol fleet을 $13.28로 보고하며 둘 다 $20/game 미만이라고 쓴다. raw GPT-5.6-sol의 ARC Prize evaluation 13.3%와 85.1%를 나란히 두지만, 논문 스스로 evaluation budget이 다르므로 그 비교는 indicative라고 단서를 단다. 따라서 이 figure는 “base model 대비 6.4배”라는 일반 성능 claim보다, **memory·skill·harness가 interactive reasoning outcome을 크게 바꿀 수 있다**는 controlled example으로 읽는 편이 안전하다.

CyberGym L1에서는 network-blocked GPT-5.5 NOOA agent가 86.8% solve rate를 보고해 listed open-source agent 가운데 가장 높은 row였다. 이 역시 model, network policy, validation protocol이 함께 정의한 benchmark result다.

## 실제 release 형태와 안전 경계

NOOA는 paper-only proposal이 아니다. `NVIDIA-NeMo/labs-OO-Agents` repository에는 core framework, CLI(beta), memory, eval pipeline, quickstart·MCP·tracing·ARC-AGI-3 examples가 들어 있다. core는 `uv add "nooa @ git+https://github.com/NVIDIA-NeMo/labs-OO-Agents.git@main"` 형태로 GitHub main branch에서 설치하도록 안내하며, package는 Python **3.12 이상 3.14 미만**을 요구한다. LiteLLM-compatible hosted/local model을 선택할 수 있고, trace viewer는 optional CLI dependency다.

release maturity는 초기다. repository는 2026년 7월 20일 생성됐고 tag `v0.0.6`은 있지만 GitHub release endpoint는 아직 없다. `CHANGELOG.md`도 `[Unreleased] Initial public release`만 적고 있다. GitHub API license field는 generic `Other/NOASSERTION`로 보이지만, checked-in `LICENSE`, README badge, `pyproject.toml`은 모두 **Apache-2.0**을 명시한다. 실제 파일을 기준으로 license를 판단하는 편이 맞다.

또한 repository의 warning은 product documentation의 작은 각주가 아니다. CodeAct는 LLM-generated Python을 실행할 수 있으므로 private data exfiltration, file deletion, environment modification 같은 위험한 행동이 가능하다고 직접 경고한다. README는 primary filesystem에서 격리된 sandbox environment를 요구하고, NOOA를 production이 아닌 research software라고 분류한다. typed output과 trace는 검증·감사 surface를 넓히지만, model이 실행 가능한 code를 작성한다는 fact 자체를 안전하게 만들지는 않는다.

## 실무 관점에서의 해석

NOOA의 흥미로운 부분은 object orientation 자체보다 **agent boundary를 Python type boundary로 만든 것**이다. `...` method는 “여기서 LLM이 판단한다”는 명확한 seam이고, ordinary method는 deterministic helper다. 이 구분이 있으면 agent source를 unit test·type check·refactor·code review의 기존 workflow 안에 놓기 쉬워진다. 특히 agent가 종료할 때 evidence와 verification command를 typed result로 강제하는 패턴은 prompt-only completion보다 재사용 가치가 크다.

다만 code-as-action은 tool schema maintenance를 줄이는 대신 execution environment를 새로운 attack surface로 만든다. live object pass-by-reference도 긴 JSON serialization을 피하는 장점이 있지만, model에게 어떤 object·filesystem·network capability를 실제로 넘길지 boundary design이 더 중요해진다. sandbox, least privilege, resource limit, network policy, approval gate, audit log는 optional convenience가 아니라 runtime architecture여야 한다.

long-term memory도 마찬가지다. NOOA가 보여 주는 단일 SQLite store와 typed graph·access log는 human-inspectable state라는 장점이 있다. 하지만 memory write·retrieval policy가 나쁘면 오래된 추론, 민감 정보, hallucinated note가 더 오래 살아남는다. 자동 injection과 deliberate recall을 분리하고, reflection·forget·explain surface를 둔 이유를 운영 정책으로 연결해야 한다.

결론적으로 NOOA는 당장 모든 agent application을 바꿀 “production SDK”라기보다, **agent를 Python class로 표현하고 LLM loop를 type-validated method call로 다룬다**는 설계 실험이면서 공개 research framework다. Python-native interface를 선호하는 팀이라면 API의 우아함만 보기보다, typed termination·live object scope·sandboxed CodeAct·memory auditability를 하나의 adoption checklist로 검토할 가치가 있다.

Sources: https://arxiv.org/abs/2607.20709, https://arxiv.org/html/2607.20709v1, https://github.com/NVIDIA-NeMo/labs-OO-Agents, https://api.github.com/repos/NVIDIA-NeMo/labs-OO-Agents, https://api.github.com/repos/NVIDIA-NeMo/labs-OO-Agents/contents, https://api.github.com/repos/NVIDIA-NeMo/labs-OO-Agents/tags, https://api.github.com/repos/NVIDIA-NeMo/labs-OO-Agents/releases/latest, https://raw.githubusercontent.com/NVIDIA-NeMo/labs-OO-Agents/main/README.md, https://raw.githubusercontent.com/NVIDIA-NeMo/labs-OO-Agents/main/pyproject.toml, https://raw.githubusercontent.com/NVIDIA-NeMo/labs-OO-Agents/main/LICENSE, https://raw.githubusercontent.com/NVIDIA-NeMo/labs-OO-Agents/main/CHANGELOG.md
