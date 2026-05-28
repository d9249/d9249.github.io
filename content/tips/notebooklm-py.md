---
title: "notebooklm-py는 NotebookLM을 Python·CLI·에이전트 워크플로에 붙이는 비공식 API다"
date: "2026-05-28T13:52:15"
description: "teng-lin/notebooklm-py는 Google NotebookLM의 노트북·소스·채팅·아티팩트 생성을 Python API, CLI, 에이전트 skill로 자동화하는 MIT 라이선스 비공식 라이브러리다."
author: "Sangmin Lee"
repository: "teng-lin/notebooklm-py"
sourceUrl: "https://github.com/teng-lin/notebooklm-py"
status: "Open source beta"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "NotebookLM"
  - "Python"
  - "CLI"
  - "AI Agents"
  - "Research Automation"
highlights:
  - "PyPI 패키지 `notebooklm-py`와 CLI 명령 `notebooklm`을 제공하며, 조사 시점 기준 PyPI·GitHub 최신 릴리스는 v0.5.0이다."
  - "노트북 생성, URL/PDF/YouTube/Drive 소스 추가, 채팅, 연구 자동화, 오디오·비디오·슬라이드·퀴즈·마인드맵 생성/다운로드를 스크립트로 묶을 수 있다."
  - "README가 명시하듯 Google의 문서화되지 않은 내부 API를 쓰는 비공식 프로젝트라서 API 변경, rate limit, 계정 제한 가능성을 전제로 써야 한다."
  - "인증은 Google 세션 쿠키 기반이며 `~/.notebooklm/profiles/<profile>/storage_state.json` 같은 로컬 파일이나 `NOTEBOOKLM_AUTH_JSON`으로 다뤄진다."
  - "macOS·Linux·Windows/WSL을 지원하지만, 로그인 경로는 Playwright/Chromium 다운로드와 브라우저 쿠키·Keychain/프로필 권한 이슈를 동반할 수 있다."
draft: false
---

NotebookLM을 연구 노트나 자료 요약용으로 자주 쓰다 보면 “브라우저에서 하나씩 누르는 일”이 병목이 된다. 소스를 대량으로 넣고, 같은 질문을 반복하고, 오디오 개요·슬라이드·퀴즈 같은 결과물을 여러 포맷으로 내려받는 흐름은 UI보다 스크립트가 더 잘 맞는다.

`notebooklm-py`는 이 지점을 겨냥한 Python 라이브러리이자 CLI다. 저장소 설명과 README 모두 **Google NotebookLM의 문서화되지 않은 API를 쓰는 비공식 프로젝트**라고 못박고 있으며, 공식 Google SDK나 안정 계약이 있는 API가 아니다. 대신 NotebookLM의 노트북, 소스, 채팅, 연구, 공유, 아티팩트 생성/다운로드를 Python 코드와 터미널 명령으로 묶을 수 있게 해준다.

조사 시점 기준 저장소 `teng-lin/notebooklm-py`는 Python 중심의 MIT 라이선스 오픈소스이고, PyPI 패키지와 GitHub 최신 릴리스 모두 `v0.5.0`이다. `pyproject.toml`은 Python `>=3.10`과 `httpx`, `click`, `rich`, `filelock`를 기본 의존성으로 두며, Playwright 브라우저 로그인은 `[browser]`, 브라우저 쿠키 재사용은 `[cookies]`, Markdown 변환은 `[markdown]` extra로 분리한다.

## notebooklm-py 개요

이 프로젝트는 세 가지 표면을 제공한다.

- **Python API**: `NotebookLMClient`를 열고 notebook, source, chat, artifact, research API를 async workflow에 붙인다.
- **CLI**: `notebooklm create`, `source add`, `ask`, `generate`, `download`, `auth check` 같은 명령으로 shell script나 자동화에 넣는다.
- **Agent integration**: 루트 `SKILL.md`, `AGENTS.md`, `notebooklm skill install`, `npx skills add teng-lin/notebooklm-py` 경로로 Claude Code, Codex, OpenClaw류 에이전트가 NotebookLM 작업을 호출하도록 문맥을 제공한다.

README가 강조하는 차별점은 단순히 “NotebookLM을 열어 질문한다”가 아니다. batch download, quiz/flashcard JSON·Markdown·HTML export, mind map JSON 추출, data table CSV, slide deck PPTX 다운로드, slide별 revision, source fulltext 접근, programmatic sharing, multi-account profile처럼 웹 UI에 없거나 반복 조작이 번거로운 기능을 API/CLI 표면으로 끌어온다.

## 설치와 첫 확인

CLI 사용자에게 README가 제시하는 가장 빠른 경로는 다음이다.

```bash
pip install "notebooklm-py[browser]"   # core + Playwright
playwright install chromium             # 약 170 MB, 진행 표시 없이 30~90초 걸릴 수 있음
notebooklm login                        # Google 로그인용 브라우저 열기
notebooklm auth check --test --json     # "status": "ok" 확인
```

앱 안에 라이브러리로 넣고, 별도 환경에서 미리 획득한 `storage_state.json`을 주입할 계획이라면 기본 패키지만 설치할 수 있다.

```bash
pip install notebooklm-py
```

공식 설치 문서는 사용자 유형을 AI agent, end user, library user, headless server/CI, contributor, power user로 나눈다. 서버나 CI에서는 Playwright를 설치하지 않고 워크스테이션에서 만든 `storage_state.json`을 옮기거나 `NOTEBOOKLM_AUTH_JSON` secret으로 넣는 흐름을 권한다.

## 어떤 자동화에 맞는가

반복 연구 파이프라인에 특히 잘 맞는다.

```bash
notebooklm create "My Research"
notebooklm use <notebook_id>
notebooklm source add "https://en.wikipedia.org/wiki/Artificial_intelligence"
notebooklm source add "./paper.pdf"
notebooklm ask "What are the key themes?"
notebooklm generate audio "make it engaging" --wait
notebooklm download audio ./podcast.mp3
notebooklm download quiz --format markdown ./quiz.md
```

Python 쪽은 `NotebookLMClient.from_storage()`로 인증 상태를 읽고, notebook 생성, URL/source 추가, chat ask, artifact generate/download를 하나의 async 함수 안에서 호출하는 식이다. 문서화된 public API 목록은 `docs/stability.md`에 따로 정리되어 있지만, 아직 0.x이므로 minor release에서 deprecated API가 제거될 수 있다는 점도 함께 명시되어 있다.

## 에이전트와 함께 쓸 때

에이전트용으로는 두 가지 설치 경로가 보인다.

```bash
notebooklm skill install
# 또는
npx skills add teng-lin/notebooklm-py
```

`notebooklm skill install`은 README 기준 `~/.claude/skills/notebooklm`와 `~/.agents/skills/notebooklm`에 skill을 설치한다. Codex용 지침은 저장소 루트 `AGENTS.md`에 들어 있다. 다만 이것은 에이전트가 사용자의 NotebookLM 세션을 대신 조작할 수 있게 하는 연결면이므로, 개인 연구 자료·Google 세션 쿠키·다운로드 결과물이 어떤 작업 디렉터리와 로그에 남는지 먼저 정해야 한다.

## 주의할 점

가장 큰 caveat는 공식성이다. README와 `docs/stability.md`는 이 라이브러리가 **undocumented Google APIs**에 의존한다고 반복해서 밝힌다. Google이 내부 endpoint나 RPC method id를 바꾸면 패치 릴리스가 필요하고, rate limit이나 계정 제한이 걸릴 수 있다. 개인 연구, prototype, 내부 자동화에는 매력적이지만, 고객용 제품의 핵심 경로에 바로 넣기 전에는 장애 시 fallback을 설계해야 한다.

인증 파일도 민감하다. `SECURITY.md`에 따르면 기본 위치는 `~/.notebooklm/profiles/<profile>/storage_state.json`이며, 이 파일에는 Google session cookie가 들어간다. 누구든 이 파일을 얻으면 NotebookLM에 사용자를 가장할 수 있으므로 저장소에 커밋하면 안 되고, CI에서는 secret 관리와 주기적 refresh가 필요하다. macOS에서 브라우저 쿠키를 가져오면 Keychain 접근 prompt가 뜰 수 있고, Linux는 Playwright system library와 특정 버전 이슈, Windows/WSL은 브라우저·encoding·profile 경로 차이를 확인해야 한다.

또 하나는 기능 범위다. NotebookLM 자체의 생성 작업은 시간이 걸리고, 계정별 한도·언어·아티팩트 지원 상태가 바뀔 수 있다. 긴 prompt는 `--prompt-file`, 대량 생성은 `--wait`, `--timeout`, `--json` 같은 옵션을 써서 재시도 가능하게 감싸는 편이 좋다. v0.5.0 릴리스는 retry, concurrency, strict decode, shell command 보안 기본값 등 breaking change도 포함하므로 기존 스크립트는 changelog를 보고 업그레이드해야 한다.

## 내 판단

NotebookLM을 “수동 요약 도구”가 아니라 연구 자동화 backend처럼 쓰고 싶은 사람에게는 바로 살펴볼 가치가 있다. 특히 여러 자료를 넣고 같은 질문·산출물 생성을 반복하는 리서처, 교육 콘텐츠 제작자, AI agent workflow를 NotebookLM에 연결하려는 개발자에게 적합하다.

반대로 안정적인 공식 API, 기업 SLA, 장기 호환성이 필요한 프로덕션 제품이라면 아직 조심스럽다. 이 경우에는 기능 실험과 내부 도구부터 시작하고, Google 내부 API 변경에 따른 실패를 감지·격리할 수 있는 구조를 먼저 두는 것이 맞다.

## 참고한 공개 자료

- [teng-lin/notebooklm-py GitHub repository](https://github.com/teng-lin/notebooklm-py)
- [notebooklm-py PyPI package](https://pypi.org/project/notebooklm-py/)
- [Installation guide](https://github.com/teng-lin/notebooklm-py/blob/main/docs/installation.md)
- [API stability and versioning](https://github.com/teng-lin/notebooklm-py/blob/main/docs/stability.md)
- [Security policy](https://github.com/teng-lin/notebooklm-py/blob/main/SECURITY.md)
- [v0.5.0 release notes](https://github.com/teng-lin/notebooklm-py/releases/tag/v0.5.0)
