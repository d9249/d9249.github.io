---
title: "nb-cli는 Jupyter 노트북을 AI 에이전트가 다루기 쉬운 CLI로 바꾼다"
date: "2026-05-27T20:01:36"
description: "jupyter-ai-contrib/nb-cli는 Rust 기반 nb 명령으로 Jupyter 노트북을 읽고, 편집하고, 실행하며, AI-Optimized Markdown/JSON으로 내보내는 실험적 CLI입니다."
author: "Sangmin Lee"
repository: "jupyter-ai-contrib/nb-cli"
sourceUrl: "https://github.com/jupyter-ai-contrib/nb-cli"
status: "Open source beta"
license: "BSD-3-Clause"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Jupyter"
  - "CLI"
  - "AI Agents"
  - "Notebook Automation"
  - "Rust"
  - "Developer Tools"
highlights:
  - "`nb read`는 `.ipynb` 원시 JSON 대신 `@@notebook`, `@@cell`, `@@output` sentinel이 붙은 AI-Optimized Markdown을 기본 출력으로 제공한다."
  - "`nb create/read/search/execute`, `nb cell add/update/delete`, `nb output clear` 같은 명령으로 노트북을 파일 기반으로 직접 조작한다."
  - "`nb connect`로 Jupyter 서버에 붙으면 Y.js 기반 collaborative editing 흐름을 사용해 JupyterLab에 열린 노트북과 실시간 동기화한다."
  - "crates.io `nb-cli`와 GitHub Release `v0.0.9` 기준 macOS·Linux·Windows용 바이너리/설치 경로가 있고, 로컬 실행에는 Jupyter kernel이 필요하다."
  - "Jupyter token, `.jupyter/cli.json`, agent skill 설치, Codex allow rule처럼 자동화 환경에서 노출될 수 있는 권한·설정 파일을 먼저 점검해야 한다."
draft: false
---

Jupyter 노트북은 사람에게는 편하지만 AI 코딩 에이전트에게는 까다롭다. `.ipynb`는 큰 JSON 파일이고, source와 output, metadata, base64 blob이 한데 섞인다. 에이전트가 “5번째 셀의 에러를 고쳐줘” 같은 요청을 받았을 때 raw JSON을 통째로 읽고 수정하면 토큰도 낭비되고 구조도 쉽게 깨진다.

`nb-cli`는 이 문제를 **노트북을 CLI-first 객체로 다루자**는 방향으로 푼다. `nb` 명령으로 노트북을 만들고, 셀을 추가·수정·삭제하고, 검색하고, 실행하고, 출력까지 읽는다. 기본 출력은 사람이 읽을 수 있으면서도 에이전트가 deterministic하게 파싱하기 쉬운 AI-Optimized Markdown이고, 필요하면 JSON 출력도 쓸 수 있다.

조사 시점 기준 저장소 `jupyter-ai-contrib/nb-cli`는 Project Jupyter 쪽의 공개 Rust 프로젝트다. GitHub API와 `Cargo.toml`, checked-in `LICENSE` 기준 라이선스는 BSD-3-Clause이고, GitHub 최신 Release와 crates.io 패키지는 모두 `0.0.9` 계열이다. Jupyter Blog 글은 이 도구를 “experimental open-source CLI”로 소개하므로, 안정된 Jupyter core 기능이라기보다는 빠르게 발전 중인 agent/notebook automation 도구로 보는 편이 맞다.

![nb-cli repository](https://opengraph.githubassets.com/nb-cli-tip/jupyter-ai-contrib/nb-cli)

## nb-cli 개요

`nb-cli`의 binary 이름은 `nb`다. README 기준 핵심 명령은 다음처럼 나뉜다.

```text
nb create <path>                         # 새 노트북 생성
nb read <path>                           # 셀과 metadata 읽기
nb execute <path>                        # 노트북 또는 특정 셀 실행
nb search <path> <pattern>               # 셀/에러 검색
nb cell add/update/delete <path>         # 셀 추가·수정·삭제
nb output clear <path>                   # 출력 제거
nb connect / status / disconnect         # Jupyter 서버 연결 상태 관리
```

중요한 점은 “노트북을 Markdown 문서로 변환하는 도구”가 아니라는 것이다. 내부적으로는 `nbformat` 계열 구조를 존중하면서, 에이전트나 스크립트가 다루기 쉬운 입출력 표면을 CLI로 만든다. 사람은 터미널에서 빠르게 셀 단위 작업을 하고, 에이전트는 `.ipynb` JSON을 직접 편집하는 대신 `nb` 명령을 호출해 구조를 보존할 수 있다.

## AI-Optimized Markdown이 왜 다른가

`nb read`의 기본 출력은 일반 Markdown과 다르다. 셀 경계와 출력 경계를 명확히 하기 위해 line-oriented sentinel을 쓴다.

````markdown
@@notebook {"format":"ai-notebook","metadata":{"kernelspec":{...}}}

@@cell {"index":0,"id":"cell-id","cell_type":"code","execution_count":1}
```python
import pandas as pd
```
@@output {"output_type":"stream","name":"stdout"}
```text
Hello, world!
```
````

이 형식의 장점은 애매함을 줄인다는 데 있다.

- `@@cell` header에 index, id, cell type, execution count 같은 metadata가 붙는다.
- code cell은 fenced block으로, markdown cell은 raw markdown으로 구분된다.
- `@@output` header로 stdout, execute result, display data 같은 output 경계를 읽을 수 있다.
- 큰 출력은 별도 파일로 externalize할 수 있고, README 기준 content-based SHA256 hashing과 absolute path를 사용한다.
- 프로그램이 필요하면 `nb read --json`으로 구조화 출력을 받을 수 있다.

즉 AI 에이전트에게 “이 노트북을 보고 문제를 고쳐라”라고 맡길 때, raw `.ipynb`보다 훨씬 안정적인 중간 표현을 제공하는 셈이다.

## 설치와 첫 사용법

가장 단순한 Rust 경로는 crates.io 패키지를 설치하는 것이다.

```bash
cargo install nb-cli
```

README가 제시하는 quick installer는 GitHub 최신 Release에서 현재 OS/architecture에 맞는 바이너리를 내려받아 `~/.nb-cli/bin/nb`에 설치한다.

```bash
curl -fsSL https://raw.githubusercontent.com/jupyter-ai-contrib/nb-cli/main/install.sh | bash
```

조사 시점 기준 `install.sh`는 macOS arm64/x86_64, Linux x86_64/aarch64를 판별하고, unsupported platform이면 `cargo install nb-cli` 또는 source build를 안내한다. GitHub Release `v0.0.9`에는 `nb-linux-amd64`, `nb-linux-arm64`, `nb-macos-amd64`, `nb-macos-arm64`, `nb-windows-amd64.exe`, `SHA256SUMS`가 올라와 있다. Windows 사용자는 release asset 또는 Rust/Cargo 경로를 확인하는 쪽이 자연스럽다.

source build는 표준 Rust workflow다.

```bash
git clone https://github.com/jupyter-ai-contrib/nb-cli.git
cd nb-cli
cargo build --release

# binary: target/release/nb
```

첫 사용은 다음 정도로 충분하다.

```bash
nb create analysis.ipynb
nb cell add analysis.ipynb --source "import pandas as pd"
nb cell add analysis.ipynb --source "# Analysis" --type markdown
nb execute analysis.ipynb
nb read analysis.ipynb --limit 8000 --output-dir ./outputs
```

로컬 실행은 브라우저나 JupyterLab 서버 없이도 가능하지만, 실제 code cell 실행에는 Jupyter kernel이 필요하다. Python 노트북이라면 예를 들어 `pip install ipykernel` 같은 준비가 필요하다.

## 로컬 모드와 원격 모드

기본은 로컬 모드다. `nb create`, `nb cell add`, `nb cell update`, `nb execute`, `nb search` 같은 명령은 디스크의 `.ipynb` 파일을 직접 읽고 쓴다. CI에서 노트북을 실행해 에러 셀을 찾거나, 에이전트가 notebook refactor를 셀 단위로 수행할 때 이 모드가 가장 단순하다.

원격 모드는 JupyterLab/Jupyter 서버가 이미 떠 있을 때 유용하다.

```bash
nb connect
nb cell add experiment.ipynb --source "df.describe()"
nb execute experiment.ipynb --cell-index 0
nb status
nb disconnect
```

README 기준 `nb connect`는 local Jupyter server를 자동 탐지하고, `--uv`, `--pixi` 옵션으로 project environment 안의 서버 탐지도 지원한다. 연결되면 CLI는 Y.js를 사용해 collaborative editing 흐름에 붙고, JupyterLab에 열려 있는 노트북에도 변경이 실시간으로 반영된다. 연결 정보는 현재 디렉터리의 `.jupyter/cli.json`에 저장된다.

이 구조는 “에이전트가 터미널에서 셀을 추가했는데 사람이 브라우저의 JupyterLab에서 바로 본다”는 workflow를 가능하게 한다. 반대로 말하면, 프로젝트별 연결 상태와 token이 어디에 저장되는지 확인해야 한다.

## 에이전트에 붙이는 방식

`nb-cli`는 단순 CLI만이 아니라 agent skill 사용도 염두에 둔다. README는 Vercel Skills Tool 경로를 권장한다.

```bash
npx skills install jupyter-ai-contrib/nb-cli
```

수동으로는 `skills/notebook-cli/` 디렉터리를 Claude Code나 Cline 등의 skill 위치에 복사하고, `CLAUDE.md`, `AGENTS.md`, `.cursorrules` 같은 프로젝트 instruction에 다음 원칙을 넣는 방식이다.

```markdown
## Working with Notebooks (.ipynb files)

When the user asks to read, edit, execute, or work with .ipynb files, use the notebook-cli skill, which provides the `nb` command-line tool. Do not use the built-in Read/Write tools for `.ipynb` files.
```

Codex 쪽은 sandbox/command rule 때문에 `nb` 호출을 허용해야 할 수 있다. README는 보통 `~/.codex/rules/default.rules`에 `prefix_rule(pattern=["nb"], decision="allow")`를 추가하는 예를 든다.

## 활용 포인트

내가 보는 좋은 사용처는 세 가지다.

첫째, **노트북 리뷰와 디버깅**이다. `nb search notebook.ipynb --with-errors`로 실패 셀을 찾고, `nb read --cell-index 5`로 해당 셀과 output을 본 뒤, `nb cell update`와 `nb execute --cell-index 5`로 고치는 흐름은 에이전트에게 꽤 자연스럽다.

둘째, **CI/재현성 체크**다. 노트북을 headless 환경에서 실행하고 output 포함 여부, 에러 여부, markdown/code cell만 추출하는 식의 검증을 script로 묶기 쉽다. README에는 `nb read --only-code`, `nb read --only-markdown`, `nb output clear` 같은 명령도 정리되어 있다.

셋째, **분석 리포트 자동 생성**이다. 에이전트가 raw JSON을 직접 조작하지 않고 `nb cell add`로 분석 셀과 설명 셀을 쌓고, 마지막에 `nb execute`로 결과를 채우면 “notebook as report” 흐름을 자동화하기 좋다.

## 주의할 점

아직은 실험적 성격이 강하다. 최신 Release가 `0.0.9`이고, Jupyter Blog에서도 “we’re just getting started”에 가까운 톤으로 소개한다. 중요한 production notebook pipeline에 바로 넣기보다는 작은 repo나 샘플 노트북에서 output diff, execution behavior, kernel 선택, large output externalization을 먼저 확인하는 편이 안전하다.

권한과 token도 조심해야 한다. `nb connect --server ... --token ...` 같은 manual 연결 정보는 prompt, log, issue comment에 남기지 않는 것이 좋다. 연결 정보가 `.jupyter/cli.json`에 저장될 수 있으므로 repo에 커밋되지 않도록 `.gitignore`도 확인해야 한다. agent skill 설치는 agent instruction과 command allowlist를 바꾸는 작업이라, 설치 전후 diff를 보는 습관이 필요하다.

마지막으로 quick installer는 `curl | bash` 패턴이다. 민감한 환경에서는 스크립트를 먼저 열어보고, SHA256SUMS가 있는 release asset을 직접 내려받거나 `cargo install nb-cli` 경로를 택하는 것이 낫다.

## 내 판단

Jupyter 노트북을 많이 다루는 팀이 AI 코딩 에이전트를 쓰기 시작했다면 `nb-cli`는 꽤 흥미로운 접착제다. 특히 “노트북은 브라우저에서만 고치는 파일”이라는 전제를 깨고, 에이전트·CI·스크립트가 셀 단위로 접근할 수 있는 command surface를 제공한다는 점이 좋다.

다만 지금 당장 모든 노트북 작업을 맡기기보다는, 실패한 셀 찾기, output 정리, 작은 분석 노트북 생성, agent에게 읽히는 중간 표현 만들기부터 시도하는 것을 추천한다. 성공하면 JupyterLab remote sync까지 확장하고, 실패하면 적어도 raw `.ipynb` JSON을 에이전트가 직접 만지는 사고는 줄일 수 있다.

## 참고한 공개 자료

- [jupyter-ai-contrib/nb-cli GitHub repository](https://github.com/jupyter-ai-contrib/nb-cli)
- [nb-cli: A Command-Line Interface for AI Agents and Notebook Automation — Jupyter Blog](https://blog.jupyter.org/nb-cli-a-command-line-interface-for-ai-agents-and-notebook-automation-996ad7edacd9)
- [nb-cli crates.io package](https://crates.io/crates/nb-cli)
- [nb-cli lib.rs package summary](https://lib.rs/crates/nb-cli)
