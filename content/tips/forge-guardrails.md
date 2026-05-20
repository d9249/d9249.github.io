---
title: "Forge는 로컬 LLM tool calling에 구조적 guardrails를 얹는다"
date: "2026-05-21T03:39:56"
description: "antoinezambelli/forge는 작은 self-hosted LLM이 multi-step tool-calling workflow에서 덜 흔들리도록 rescue parsing, retry nudges, step enforcement, context compaction, OpenAI-compatible proxy를 제공하는 Python guardrails framework다."
author: "Sangmin Lee"
repository: "antoinezambelli/forge"
sourceUrl: "https://github.com/antoinezambelli/forge"
status: "Open source beta"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Local LLM"
  - "Tool Calling"
  - "Guardrails"
  - "Python"
  - "Developer Tools"
highlights:
  - "PyPI 패키지는 `forge-guardrails` v0.6.0이고 Python 3.12+, MIT license, GitHub tag는 v0.6.0/v0.5.0이지만 GitHub Release 페이지는 비어 있다."
  - "WorkflowRunner, Guardrails middleware, OpenAI-compatible proxy 세 가지 방식으로 붙일 수 있어 새 agent loop와 기존 OpenAI-compatible client를 모두 겨냥한다."
  - "Ollama, llama-server, Llamafile, Anthropic backend를 지원하며 README와 Model Guide는 llama-server + Ministral-3 계열을 가장 강하게 추천한다."
  - "v0.6.0 eval 문서는 46 configs × 26 scenarios × 2 ablations × 50 runs, 총 119,600 rows 기준으로 sampling defaults와 backend/mode 차이를 강조한다."
  - "Proxy는 기본 127.0.0.1:8081이지만 inspected CLI에는 auth 옵션이 보이지 않으므로 0.0.0.0/LAN 노출, prompt/tool schema 유출, backend 비용 범위를 별도로 관리해야 한다."
draft: false
---

로컬 LLM으로 agent를 만들 때 가장 먼저 부딪히는 문제는 “모델이 답을 잘하느냐”보다 **도구 호출 형식을 끝까지 지키느냐**일 때가 많다. 작은 8B~14B급 모델은 함수 호출 JSON을 깨뜨리거나, 필요한 중간 단계를 건너뛰거나, tool call 대신 자연어 답변으로 빠지는 일이 자주 생긴다.

`Forge`는 이 지점을 겨냥한 Python framework다. 모델 자체를 새로 학습하는 프로젝트가 아니라, self-hosted LLM 위에 rescue parsing, retry nudge, step enforcement, context compaction, OpenAI-compatible proxy를 얹어 multi-step tool-calling workflow를 더 안정적으로 만들려는 레이어다.

조사 시점 기준 저장소 `antoinezambelli/forge`는 Python 중심의 MIT 오픈소스이며, PyPI 패키지 이름은 `forge-guardrails`다. `pyproject.toml`과 PyPI 최신 버전은 `0.6.0`, Python 요구사항은 3.12+, GitHub tag는 `v0.6.0`과 `v0.5.0`이 확인되지만 GitHub Releases 페이지는 비어 있다.

![Forge guardrails architecture](/images/tips/forge-guardrails-architecture.svg)

## Forge 개요

Forge를 한 문장으로 줄이면 **로컬 LLM용 tool-calling reliability layer**다. 기존 agent loop를 완전히 대체할 수도 있고, 이미 쓰는 OpenAI-compatible client 앞단에 proxy처럼 끼울 수도 있다.

핵심 구성은 다음과 같다.

- **WorkflowRunner**: Forge가 system prompt, LLM 호출, tool execution, required step, terminal tool, context compaction까지 agent loop 전체를 관리한다.
- **Guardrails middleware**: 사용자가 직접 만든 orchestration loop 안에 response validation, rescue parsing, retry nudge, step enforcement만 가져다 쓴다.
- **Proxy server**: `python -m forge.proxy`로 OpenAI-compatible proxy를 띄우고, opencode, Continue, aider 같은 client가 기존 로컬 model server 대신 Forge proxy를 바라보게 한다.
- **Context management**: VRAM-aware token budget, tiered compaction, context threshold를 다룬다. 소비자 GPU에서 KV cache가 모델 weights와 VRAM을 나눠 쓰는 현실을 반영한 설계다.
- **Backends**: Ollama, llama-server/llama.cpp, Llamafile, Anthropic API를 지원한다. Anthropic은 로컬 backend가 아니라 frontier baseline/hybrid path에 가깝다.

재미있는 점은 Forge가 “모델이 알아서 잘하겠지”를 믿지 않는다는 것이다. control-flow state는 message history 바깥에 두고, step completion은 `StepTracker`가 따로 관리한다. context compaction으로 과거 tool result가 요약되거나 사라져도, 어떤 required step을 끝냈는지는 runner가 별도로 기억한다.

## 세 가지 사용 방식

### 1. Forge 위에 새 workflow를 만든다

새 agent workflow를 Forge 중심으로 만들면 `WorkflowRunner`가 가장 직접적인 진입점이다. 사용자는 Python function과 Pydantic schema로 tool을 정의하고, 어떤 tool을 반드시 거쳐야 하는지, 어떤 tool이 workflow를 끝내는지 지정한다.

```python
from forge import WorkflowRunner

runner = WorkflowRunner(client=client, context_manager=ctx)
result = await runner.run(workflow, "What's the weather in Paris?")
```

이 방식은 Forge가 agent loop를 소유하기 때문에 step enforcement, prerequisites, max iterations, cancellation, callbacks, context threshold warning 같은 기능을 가장 넓게 쓸 수 있다.

### 2. 기존 OpenAI-compatible client 앞에 proxy를 세운다

이미 aider, Continue, OpenCode류 client나 자체 OpenAI-compatible 호출 코드를 갖고 있다면 proxy mode가 빠르다. 백엔드는 사용자가 직접 띄울 수도 있고, Forge가 llama-server를 함께 관리하게 할 수도 있다.

```bash
# 외부 llama-server를 사용자가 직접 관리하는 경우
python -m forge.proxy --backend-url http://localhost:8080 --port 8081

# Forge가 llama-server와 proxy를 같이 띄우는 경우
python -m forge.proxy --backend llamaserver --gguf path/to/model.gguf --port 8081
```

그 다음 client의 base URL을 Forge proxy로 바꾼다.

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8081/v1", api_key="not-needed")
```

Proxy의 핵심 트릭은 **synthetic `respond` tool**이다. request에 tool이 있으면 Forge가 내부적으로 `respond(message="...")`를 주입해 모델을 tool-calling mode 안에 계속 머물게 하고, 최종 응답에서는 이 호출을 제거한다. 문서에 따르면 작은 로컬 모델에서는 free-text intent를 믿는 접근이 workflow completion을 크게 떨어뜨려, “대답도 하나의 tool call로 유도”하는 쪽이 더 안정적이었다.

다만 proxy는 WorkflowRunner의 모든 기능을 가져오지는 않는다. OpenAI chat completions API에는 workflow 구조가 없기 때문에 step enforcement, prerequisites, true token-by-token streaming, context threshold callback은 제한된다. 기존 client를 크게 바꾸지 않고 reliability stack만 얹는 경로라고 보는 편이 맞다.

### 3. 내 loop에 guardrails만 이식한다

직접 agent framework를 만들고 있다면 middleware layer만 쓸 수 있다. 이 경우 Forge는 response validation, malformed tool-call rescue, retry nudge, step enforcement를 제공하고, iteration cap, cancellation, streaming, tool execution, context persistence는 사용자가 책임진다.

```python
from forge.guardrails import Guardrails

guardrails = Guardrails(
    tool_names=["search", "lookup", "answer"],
    required_steps=["search", "lookup"],
    terminal_tool="answer",
)

result = guardrails.check(response)
```

이 구조는 “전체 framework는 이미 있는데 작은 로컬 모델이 tool calling에서 자꾸 흔들린다”는 팀에게 특히 유용하다.

## 설치와 첫 사용법

공식 설치는 PyPI 패키지다.

```bash
pip install forge-guardrails

# Anthropic backend까지 쓰는 경우
pip install "forge-guardrails[anthropic]"
```

개발용 source checkout은 다음 흐름이다.

```bash
git clone https://github.com/antoinezambelli/forge.git
cd forge
pip install -e ".[dev]"
python -m pytest tests/ -v --tb=short
```

Forge만 설치한다고 모델 서버가 같이 생기는 것은 아니다. 로컬 self-hosted path에서는 Ollama, llama-server, Llamafile 중 하나를 먼저 준비해야 한다. README와 Model Guide는 특히 llama-server를 추천한다.

```bash
# llama.cpp의 llama-server 예시
llama-server \
  -m path/to/Ministral-3-8B-Instruct-2512-Q8_0.gguf \
  --jinja \
  -ngl 999 \
  --host 127.0.0.1 \
  --port 8080
```

여기서 `--jinja`는 중요하다. Forge 문서는 llama-server에서 native function calling을 쓰려면 Jinja template path가 필요하다고 설명한다. Llamafile은 single binary라는 장점이 있지만 native function calling이 없어서 Forge의 prompt-injected fallback을 쓰는 쪽으로 정리되어 있다.

## 모델과 backend 선택 감각

Forge의 README가 내세우는 headline은 “작은 self-hosted 모델을 multi-step agentic workflow에서 더 믿을 만하게 만든다”는 것이다. v0.6.0 Model Guide는 46 config × 26 scenario × 2 ablation × 50 run, 총 119,600 row의 consolidated eval dataset을 기준으로 결과를 정리한다.

그 문서 기준 가장 강하게 추천되는 조합은 llama-server 위의 Ministral-3 계열이다.

- **Best overall**: Ministral-3 8B Instruct Q8_0 + llama-server / prompt mode, 전체 86.5%, advanced_reasoning 76.0%
- **Most stable**: Ministral-3 14B Reasoning Q4_K_M + llama-server / native mode, 전체 81.5%, hard suite에서 0% scenario가 없는 쪽
- **OG-18 perfect tier**: 2~5 step tool chain에 가까운 workload에서는 여러 Ministral-3 native config가 100%에 도달

이 숫자는 독립 벤치마크라기보다 Forge 자체 eval harness의 결과로 읽어야 한다. 그래도 실전적으로 중요한 메시지는 분명하다.

첫째, **backend가 모델만큼 중요하다.** 같은 weights라도 llama-server, Ollama, native function calling, prompt-injected mode에 따라 결과가 크게 달라진다.

둘째, **sampling defaults가 중요하다.** Forge v0.6.0은 모델 카드에서 가져온 per-model sampling defaults map을 제공한다. 다만 `recommended_sampling=True`로 명시해야 켜지고, proxy mode에서는 proxy가 자동 적용하지 않는다. proxy를 쓸 때는 client가 `temperature`, `top_p`, `top_k`, `min_p`, `repeat_penalty`, `presence_penalty`, `seed` 같은 OpenAI-compatible body field를 직접 넣어야 한다.

셋째, **hard reasoning은 아직 어렵다.** 문서상 best self-hosted config도 advanced_reasoning suite에서 80%를 넘지 못했다. 기계적인 tool chain에는 충분해도, data-gap recovery나 grounded synthesis처럼 reasoning이 섞인 workflow에서는 frontier API 모델과의 차이가 남는다.

## 운영과 보안 caveat

Forge는 security sandbox가 아니라 reliability layer다. 이 차이를 분명히 해야 한다.

첫째, proxy는 기본 `127.0.0.1:8081`에 bind하지만, inspected CLI에는 API key나 auth 옵션이 보이지 않는다. 개인 노트북에서 loopback으로만 쓰는 경우와 `--host 0.0.0.0`, LAN, tunnel, reverse proxy로 노출하는 경우는 리스크가 완전히 다르다. 외부에 열면 prompt, tool schema, tool 결과, backend 비용/쿼터가 같이 노출될 수 있다.

둘째, Forge가 tool call을 검증해도 **도구 자체의 권한은 사용자 application이 정한다.** 파일 삭제, shell 실행, browser automation, private API 호출 같은 tool을 붙이면 Forge는 “형식이 맞는 호출인지”를 도울 뿐, 그 호출이 안전한지까지 자동 판단하지 않는다. 위험한 tool은 별도 allowlist, confirmation, sandbox, idempotency를 두는 편이 맞다.

셋째, 장기 세션에서는 transient message hygiene이 필요하다. `on_message` callback은 retry nudge, step nudge, prerequisite nudge, 실패한 bare text response까지 모두 내보낸다. 문서는 long-running CLI/chat/voice assistant에서 이런 transient message를 그대로 다음 turn history에 누적하면 모델이 과거 실패와 correction을 계속 보게 되어 coherence가 나빠질 수 있다고 설명한다. persistent conversation을 직접 관리한다면 `RETRY_NUDGE`, `STEP_NUDGE`, `PREREQUISITE_NUDGE`, `TEXT_RESPONSE` 같은 transient type을 필터링해야 한다.

넷째, 로컬 backend도 비용이 없지는 않다. GGUF model download, VRAM, KV cache, cold start, GPU memory pressure, model license를 확인해야 한다. Anthropic backend를 쓰면 로컬-only가 아니므로 prompt와 tool context가 외부 API로 나간다.

마지막으로 release surface가 단순한 편이다. GitHub Releases는 비어 있고 tag/PyPI/CHANGELOG가 버전 신호다. 재현 가능한 도입이 필요하면 `forge-guardrails==0.6.0`, 특정 Git tag, 모델 GGUF checksum, llama.cpp/Ollama version을 함께 pin하는 편이 좋다.

## 내 판단

Forge는 “로컬 LLM이 ChatGPT처럼 똑똑해지는 마법”이 아니라, **작은 모델에게 agent workflow의 레일을 깔아주는 도구**에 가깝다. structured tool call, required step, retry, compaction, proxy boundary를 잘 설계하면 8B~14B 모델도 꽤 많은 mechanical/mid-level tool chain을 처리할 수 있다는 thesis를 구현으로 보여준다.

내 기준으로는 다음 사람에게 특히 잘 맞는다.

- 로컬 LLM으로 coding agent, automation agent, internal tool runner를 만들고 싶은 개발자
- OpenAI-compatible local server는 이미 있는데 tool calling 안정성이 부족한 팀
- 모델 benchmark보다 실제 multi-step workflow completion을 보고 싶은 사람
- consumer GPU 환경에서 context budget과 compaction을 직접 관리해야 하는 사람

반대로 단순 chat UI, hosted SaaS agent, 보안 sandbox, multi-tenant production serving을 기대한다면 범위가 다르다. Forge는 backend server도, end-user app도, 권한 격리 시스템도 아니다. 이미 agent를 만들고 있거나 로컬 inference stack을 다루는 사람에게 “모델 위의 reliability shim”으로 붙여볼 만한 beta-stage Python library라고 보는 편이 정확하다.

## 참고한 공개 자료

- [antoinezambelli/forge GitHub repository](https://github.com/antoinezambelli/forge)
- [Forge README](https://github.com/antoinezambelli/forge/blob/main/README.md)
- [forge-guardrails PyPI package](https://pypi.org/project/forge-guardrails/)
- [Forge CHANGELOG](https://github.com/antoinezambelli/forge/blob/main/CHANGELOG.md)
- [Forge User Guide](https://github.com/antoinezambelli/forge/blob/main/docs/USER_GUIDE.md)
- [Forge Backend Setup Guide](https://github.com/antoinezambelli/forge/blob/main/docs/BACKEND_SETUP.md)
- [Forge Model Guide](https://github.com/antoinezambelli/forge/blob/main/docs/MODEL_GUIDE.md)
- [Forge Eval Guide](https://github.com/antoinezambelli/forge/blob/main/docs/EVAL_GUIDE.md)
- [Forge Architecture docs](https://github.com/antoinezambelli/forge/blob/main/docs/ARCHITECTURE.md)
- [Forge LICENSE](https://github.com/antoinezambelli/forge/blob/main/LICENSE)
