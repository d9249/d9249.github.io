---
title: "WYN360 CLI는 PyPI로 설치하는 실험적인 에이전트형 AI 코딩 터미널이다"
date: "2026-05-26T00:19:05"
description: "wyn360-cli는 Claude·Bedrock·Gemini·OpenAI를 고르는 Python CLI 코딩 에이전트다. 메모리, 스킬, 플랜, 서브 에이전트, 크론, 플러그인, LSP 진단까지 한 터미널 안에 묶지만 설치 의존성과 라이선스 메타데이터는 확인이 필요하다."
author: "Sangmin Lee"
repository: "yiqiao-yin/wyn360-cli"
sourceUrl: "https://pypi.org/project/wyn360-cli/"
status: "PyPI package / experimental AI coding CLI"
license: "README badge: MIT / PyPI and GitHub metadata: not declared"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "CLI"
  - "Python"
  - "Coding Assistant"
  - "pydantic-ai"
highlights:
  - "PyPI 최신 버전은 0.5.3이며 Python 3.10 이상, 4.0 미만을 요구한다. 콘솔 엔트리포인트는 `wyn360`이다."
  - "Claude 직접 API, AWS Bedrock, Google Gemini, OpenAI를 `CHOOSE_CLIENT`와 각 provider API key로 선택하는 구조다."
  - "v0.4.0 이후에는 로컬 `~/.wyn360/memory/` 메모리와 `~/.wyn360/skills/` 스킬, 플랜 모드, 서브 에이전트 워커가 붙었다."
  - "v0.5.0 계열 문서는 드림/컴팩션, vim/voice/buddy, 크론 에이전트, 플러그인, LSP diagnostics, rewind까지 확장된다고 설명한다."
  - "명령 실행은 확인 프롬프트를 띄우지만 내부 구현은 `shell=True`로 사용자 권한에서 실행된다. `WYN360_SKIP_CONFIRM=1`은 테스트 외에는 조심해야 한다."
draft: false
---

`wyn360-cli`는 PyPI에 올라온 Python 기반 AI 코딩 터미널이다. 기본 메시지는 “Anthropic Claude로 구동되는 지능형 AI 코딩 어시스턴트”지만, 현재 문서와 소스 기준으로는 Claude 전용 도구라기보다 여러 provider를 고를 수 있는 터미널 에이전트 프레임워크에 가깝다.

한 줄로 요약하면, `pip install wyn360-cli`로 설치한 뒤 `wyn360` 명령을 실행해 자연어로 파일 수정, 코드 생성, 명령 실행, 웹/문서 읽기, GitHub/HuggingFace 작업까지 맡기는 도구다. 최근 버전 문서는 여기에 persistent memory, custom skills, plan mode, sub-agent workers, cron agents, plugins, LSP diagnostics, rewind 같은 “에이전트 런타임” 기능을 계속 붙이고 있다.

![WYN360 CLI agent stack overview](/images/tips/wyn360-cli-agent-stack.svg)

## 기본 정보

조사 시점의 PyPI JSON과 GitHub 저장소 기준 핵심 정보는 다음과 같다.

| 항목 | 내용 |
| --- | --- |
| PyPI 패키지 | `wyn360-cli` |
| 최신 버전 | `0.5.3` |
| 업로드 시각 | 2026-04-01T07:39:59Z wheel, 2026-04-01T07:40:00Z sdist |
| Python 요구사항 | `>=3.10,<4.0` |
| 콘솔 명령 | `wyn360` → `wyn360_cli.cli:main` |
| 저장소 | `yiqiao-yin/wyn360-cli` |
| 주요 프레임워크 | `click`, `prompt-toolkit`, `rich`, `pydantic-ai` |
| 주요 provider 의존성 | `anthropic[bedrock]`, `google-genai`, OpenAI 설정 지원 |
| 브라우저/문서 의존성 | `playwright`, `crawl4ai`, `pymupdf4llm`, `pytesseract`, `sentence-transformers`, `torch` |

PyPI 설명은 “WYN360 - An intelligent AI coding assistant CLI tool powered by Anthropic Claude”라고 되어 있다. 하지만 README와 문서의 Quick Start는 `CHOOSE_CLIENT` 값으로 Anthropic, AWS Bedrock, Gemini, OpenAI를 고르는 흐름을 설명한다.

```bash
pip install wyn360-cli
wyn360
```

브라우저로 특정 URL을 직접 읽는 기능을 쓰려면 Playwright 브라우저 바이너리 설치가 별도로 필요하다고 README가 안내한다.

```bash
playwright install chromium
```

여기서 중요한 실무 포인트는 “패키지 자체는 작아 보여도 의존성은 가볍지 않다”는 점이다. PyPI metadata의 wheel 크기는 약 263KB지만, 의존성에는 `torch`, `sentence-transformers`, `playwright`, OCR/PDF 계열 패키지가 포함된다. 깨끗한 전역 Python에 바로 설치하기보다는 프로젝트별 가상환경에서 먼저 확인하는 편이 안전하다.

## provider 선택 방식

README는 provider를 네 가지로 나눠 설명한다.

```bash
# Anthropic Claude
export CHOOSE_CLIENT=1
export ANTHROPIC_API_KEY="..."

# AWS Bedrock
export CHOOSE_CLIENT=2
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-west-2"

# Google Gemini
export CHOOSE_CLIENT=3
export GEMINI_API_KEY="..."

# OpenAI
export CHOOSE_CLIENT=4
export OPENAI_API_KEY="..."
```

`CHOOSE_CLIENT`를 지정하지 않으면 사용 가능한 credential을 기준으로 자동 감지한다는 설명도 있다. 우선순위는 Anthropic API key, AWS credentials, Gemini API key, OpenAI API key 순서로 문서화되어 있다.

이 설계는 장점과 단점이 분명하다. 장점은 Claude만 고정하지 않고 비용·컨텍스트·조직 정책에 맞춰 provider를 바꿀 수 있다는 점이다. 문서의 feature overview는 Gemini를 큰 컨텍스트와 낮은 비용 쪽으로, Claude/Bedrock을 고급 reasoning과 enterprise 용도로 배치한다. 단점은 설정 표면이 넓어진다는 점이다. `.env`, shell 환경변수, 프로젝트 설정이 섞이면 “지금 어떤 모델로 돈을 쓰고 있는지”를 자주 확인해야 한다.

## 에이전트 기능: 메모리, 스킬, 플랜, 워커

WYN360 CLI의 흥미로운 부분은 단순한 “코드 생성 챗봇”을 넘어 로컬 에이전트 런타임처럼 확장하려는 방향이다. 공식 문서는 v0.4.0부터 다음 기능을 강조한다.

- persistent memory: `~/.wyn360/memory/` 아래 Markdown + YAML frontmatter 파일로 사용자 선호, 프로젝트 결정, 피드백, 참고 자료를 저장한다.
- skills: `~/.wyn360/skills/` 또는 프로젝트 `.wyn360/skills/`에 YAML prompt template을 두고 `/review`, `/cr` 같은 slash command로 호출한다.
- plan mode: 복잡한 작업을 단계별 plan으로 만들고 approve/reject/skip 흐름을 제공한다.
- sub-agent workers: 별도 pydantic-ai agent를 병렬로 띄워 research와 verification 같은 작업을 나눠 처리한다.
- hook system: pre/post hook, safety hook, token budget auto-continue를 둔다.

이 방향은 Claude Code의 `CLAUDE.md`, OpenAI Codex 계열의 `AGENTS.md`, Cursor rules, aider conventions와 같은 “프로젝트별 에이전트 지침 파일” 흐름과 맞닿아 있다. 다만 WYN360은 그 지침 파일만 읽는 수준을 넘어, 자체 메모리·스킬·플러그인 저장소를 `~/.wyn360/` 아래에 만드는 쪽이다.

## v0.5.0 계열: cron, plugin, LSP, rewind

공식 `Cron Agents, Plugins & LSP` 문서는 v0.5.0의 고급 기능으로 다음을 설명한다.

```text
/cron add 5m Check CI | Run gh run list
/plugins create my-tool
/diagnostics src/
/rewind undo
```

크론 에이전트는 5분마다 CI를 확인하거나 주기적으로 health check를 돌리는 식의 반복 작업을 목표로 한다. 플러그인은 `~/.wyn360/plugins/` 아래 `plugin.yaml`과 Python entry point를 두고 tool, hook, skill 타입으로 등록하는 구조다. LSP diagnostics는 `pyright`, `ruff`, `typescript-language-server` 같은 도구를 감지해 `/diagnostics` 또는 `/lint` 명령으로 실행하는 흐름을 문서화한다. rewind는 대화 상태 스냅샷으로 이전 상태로 돌아가는 기능이다.

이 기능 묶음은 방향성만 보면 “작은 로컬 Hermes/Claude Code 스타일 런타임”에 가깝다. 특히 매번 터미널에서 CLI를 실행해 일회성 코드를 받는 사용법보다, 로컬 상태를 쌓고 주기 작업과 플러그인을 붙이는 사용법을 염두에 둔 것으로 보인다.

## 개발 작업 기능

README의 feature list는 다음 개발 작업을 지원한다고 설명한다.

- 자연어 기반 코드 생성과 기존 파일 수정
- 파일 읽기/쓰기와 프로젝트 분석
- Python script, shell script, npm, Docker 등 명령 실행
- 웹 검색과 특정 URL fetch
- Word/PDF/Excel 등 문서 읽기와 vision mode
- GitHub 인증, commit/push, PR 생성
- HuggingFace Spaces 생성과 업로드
- pytest test generation
- token/cost tracking, session save/load, model switching

실제로 소스의 `agent.py`에는 파일 작업, 명령 실행, git 상태/diff/log, GitHub/HuggingFace 관련 도구 등록이 모여 있다. 패키지 엔트리 흐름은 `wyn360` CLI → `wyn360_cli/cli.py:main()` → config load → `WYN360Agent` 초기화 → async chat loop + slash command 처리 구조다.

## 보안 관점에서 볼 점

이런 도구를 설치할 때 가장 먼저 봐야 할 것은 “AI가 내 컴퓨터에서 무엇을 실행할 수 있는가”다. WYN360 README와 소스는 명령 실행 전에 확인 프롬프트를 띄우는 흐름을 설명한다.

```text
COMMAND EXECUTION CONFIRMATION
Command: python analysis.py
Directory: /current/working/directory
Permissions: Full user permissions
Execute this command? (y/N):
```

이 프롬프트는 좋은 기본값이다. 다만 구현상 `execute_command_safe()`는 `subprocess.run(..., shell=True)`로 명령을 실행하고, README도 “사용자의 전체 권한으로 현재 디렉터리에서 실행된다”고 안내한다. 즉 확인 프롬프트가 마지막 방어선이다.

특히 다음 환경변수는 테스트 외에는 조심해야 한다.

```bash
WYN360_SKIP_CONFIRM=1
```

소스 기준으로 이 값이 `1`이면 interactive TTY에서도 명령 실행 확인을 건너뛸 수 있다. 자동 테스트에는 편하지만, 실제 프로젝트에서 켜 둔 채로 에이전트에게 광범위한 요청을 맡기면 위험하다.

credential 저장도 확인할 부분이다. `credential_manager.py`는 `~/.wyn360/credentials/` 아래 `.keyfile`과 `vault.enc`를 만들고, Fernet 기반 암호화와 `0600` 권한을 사용한다고 구현되어 있다. 감사 로그는 `~/.wyn360/logs/auth_audit.log`에 민감정보 없이 남기는 방향이다. 설계 의도는 괜찮지만, 브라우저 로그인·GitHub/HuggingFace token·cloud API key가 얽히는 도구인 만큼, 처음에는 별도 테스트 계정과 sandbox repo에서 검증하는 편이 좋다.

## 설정 파일 구조

`config.yaml.example`와 `config.py`를 보면 설정은 대략 세 층으로 나뉜다.

```text
~/.wyn360/config.yaml   # user-wide settings
.wyn360.yaml            # project-specific settings
environment variables   # provider keys, browser timeout, etc.
```

예시 설정에는 모델, `max_tokens`, temperature, custom instructions, project context, aliases, browser cache, document reader 옵션이 들어간다. 프로젝트마다 `.wyn360.yaml`을 둘 수 있다는 점은 편리하지만, 동시에 “이 저장소를 열면 에이전트가 어떤 instruction을 읽는가”를 code review 대상에 포함해야 한다는 뜻이기도 하다.

AI 코딩 도구를 여러 개 쓰는 팀이라면 `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.wyn360.yaml`, `.wyn360/skills/`가 서로 충돌하지 않도록 관리하는 것이 중요하다. 특히 외부 저장소에서 가져온 설정 파일은 실행 가능한 명령이나 credential 처리 지시가 없는지 먼저 읽어야 한다.

## 라이선스 메타데이터는 애매하다

README 상단에는 MIT license badge가 있다. 그러나 조사 시점에 GitHub API의 `license` 값은 `None`이었고, 저장소 루트에서 `LICENSE`, `LICENSE.md` 파일도 확인되지 않았다. PyPI metadata의 `License` 필드도 비어 있었다.

따라서 이 글에서는 라이선스를 “README badge: MIT / PyPI and GitHub metadata: not declared”로 적었다. 단순히 설치해서 개인 실험을 하는 정도라면 큰 문제가 아닐 수 있지만, 사내 배포, fork 후 재배포, 제품에 내장하는 용도라면 먼저 upstream에 license file을 확인하거나 이슈로 명확히 하는 편이 좋다.

## 설치 전 체크리스트

내가 이 도구를 실제로 써본다면 다음 순서로 볼 것 같다.

1. 새 Python 3.10+ 가상환경에서 설치한다.
2. `pip install wyn360-cli` 후 dependency tree와 설치 용량을 확인한다.
3. 전역 API key 대신 테스트용 key 또는 제한된 provider key를 사용한다.
4. 개인 프로젝트가 아니라 throwaway repo에서 `wyn360`을 실행한다.
5. 명령 실행 프롬프트가 잘 뜨는지 확인하고, `WYN360_SKIP_CONFIRM`이 켜져 있지 않은지 본다.
6. `~/.wyn360/` 아래 생기는 파일을 확인한다.
7. GitHub/HuggingFace 자동화는 test repo와 test Space에서만 먼저 검증한다.
8. `.wyn360.yaml`, `.wyn360/skills/`, `~/.wyn360/memory/`에 저장되는 내용을 주기적으로 review한다.

설치 예시는 다음 정도가 안전하다.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install wyn360-cli

# provider key는 실제 값 대신 제한된 테스트 key로 시작
export CHOOSE_CLIENT=3
export GEMINI_API_KEY="..."

wyn360
```

## 어떤 사람에게 맞나

WYN360 CLI는 “가벼운 한 방짜리 코드 생성기”를 찾는 사람에게는 다소 무거울 수 있다. 의존성도 많고, 기능도 메모리·스킬·브라우저·크론·플러그인까지 넓게 퍼져 있다. 반대로 터미널 안에서 여러 provider를 바꾸며 로컬 에이전트 런타임을 실험하고 싶은 사람에게는 흥미로운 재료가 많다.

특히 다음 경우에는 한 번 살펴볼 만하다.

- pydantic-ai 기반 CLI agent 구조를 보고 싶은 경우
- Claude, Bedrock, Gemini, OpenAI를 한 도구에서 바꿔 쓰는 패턴을 실험하고 싶은 경우
- local memory와 custom skills를 파일 기반으로 구현하는 방식을 참고하고 싶은 경우
- cron agent, plugin manifest, LSP diagnostics, rewind 같은 기능을 작은 Python CLI에 붙이는 구조가 궁금한 경우
- HuggingFace Spaces나 GitHub workflow 자동화를 agent tool로 묶는 예제를 찾는 경우

다만 실무 기본 도구로 바로 채택하기에는 성숙도 점검이 필요하다. README가 가리키는 일부 문서 경로나 license metadata가 정리되지 않은 흔적이 있고, 의존성이 넓으며, shell 명령 실행과 credential 저장 기능을 포함한다. 개인 실험 → sandbox repo → 제한된 실제 프로젝트 순서로 단계적으로 검증하는 편이 맞다.

## 내 판단

`wyn360-cli`는 완성도 높은 대중용 CLI라기보다, “AI 코딩 CLI에 붙일 수 있는 기능을 빠르게 한데 모아가는 실험장”에 가깝다. 그래서 장점도 명확하고 위험도 명확하다.

장점은 provider 선택, 메모리, 스킬, 플랜, 서브 에이전트, 브라우저, 문서 처리, GitHub/HuggingFace 배포, 크론, 플러그인, LSP까지 기능 범위가 넓다는 것이다. 소스 구조를 뜯어보면 나만의 agent CLI를 만들 때 어떤 모듈을 어떻게 나눌지 참고할 부분도 많다.

위험은 그 넓은 범위가 그대로 로컬 권한, credential, 외부 배포 권한과 연결된다는 것이다. 특히 AI 코딩 도구는 “좋은 에이전트 경험”과 “너무 많은 권한” 사이의 경계가 얇다. WYN360을 쓸 때는 자동화 편의보다 실행 권한과 저장되는 상태를 먼저 통제하는 쪽이 안전하다.

그래서 추천 포지션은 이렇다. 당장 업무용 main agent로 쓰기보다는, 격리된 가상환경과 테스트 repo에서 기능 아이디어를 확인하고, 마음에 드는 패턴을 자신의 기존 워크플로에 가져오는 참고 도구로 보는 편이 좋다.

## 참고한 공개 자료

- [wyn360-cli on PyPI](https://pypi.org/project/wyn360-cli/)
- [yiqiao-yin/wyn360-cli GitHub repository](https://github.com/yiqiao-yin/wyn360-cli)
- [WYN360 CLI Documentation](https://yiqiao-yin.github.io/wyn360-cli/)
- [Features Overview](https://yiqiao-yin.github.io/wyn360-cli/docs/features/overview/)
- [Memory & Skills System](https://yiqiao-yin.github.io/wyn360-cli/docs/features/agentic-memory/)
- [Cron Agents, Plugins & LSP](https://yiqiao-yin.github.io/wyn360-cli/docs/features/cron-plugins-lsp/)
- [`pyproject.toml`](https://github.com/yiqiao-yin/wyn360-cli/blob/main/pyproject.toml)
- [`config.yaml.example`](https://github.com/yiqiao-yin/wyn360-cli/blob/main/config.yaml.example)
- [`credential_manager.py`](https://github.com/yiqiao-yin/wyn360-cli/blob/main/wyn360_cli/credential_manager.py)
- [`agent.py`](https://github.com/yiqiao-yin/wyn360-cli/blob/main/wyn360_cli/agent.py)
