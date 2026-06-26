---
title: "CtxGov는 에이전트가 행동하기 전 컨텍스트 권한 변화를 읽는 로컬 거버넌스 CLI다"
date: "2026-06-26T13:52:27"
description: "ctxgov/ctxgov는 에이전트가 다음 세션·메모리·AGENTS류 지시·로컬 trace를 실제 권한처럼 쓰기 전에, authority·capability·scope 변화를 read-only로 점검하는 Python 기반 로컬 거버넌스 평가 도구입니다."
author: "Sangmin Lee"
repository: "ctxgov/ctxgov"
sourceUrl: "https://github.com/ctxgov/ctxgov"
status: "Open source alpha"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Governance"
  - "Context Engineering"
  - "CLI"
  - "Python"
  - "Evaluation"
highlights:
  - "`ctxgov change-gate-check --root . --format summary`로 AGENTS/README/agent-facing surface를 읽고 authority·capability·scope·sensitivity 변화 신호를 요약한다."
  - "세션 연속성 sidecar, Memory X-Ray shape validation, governance replay, forensics fixture trace처럼 ‘다음 에이전트가 물려받는 상태’를 검토하는 데 초점이 있다."
  - "v0.9.0 public surface는 네트워크/API/model 호출, daemon, scheduler, target repo write, public write를 제외한다고 명시한다."
  - "README·pyproject·release note는 0.9.0을 public package version으로 고정하지만, GitHub tag 목록에는 더 높은 v0.12.0 태그도 보여 release/tag 표면을 구분해야 한다."
  - "GitHub API license는 Other/NOASSERTION으로 보이지만 checked-in LICENSE와 pyproject는 Apache-2.0이다."
draft: false
---

AI 에이전트가 실패하는 방식은 늘 “코드를 잘못 짰다”로만 끝나지 않는다. 이전 세션 요약이 오래됐거나, `AGENTS.md`가 더 넓은 권한처럼 해석되거나, 메모리와 handoff가 섞이면서 다음 에이전트가 실제로는 검토되지 않은 상태를 authority처럼 받아들이는 경우가 있다.

`CtxGov`는 이 지점을 겨냥한 로컬 우선 CLI다. 저장소 설명 그대로, 에이전트가 행동하기 전에 **context와 memory-state influence를 진단하고 거버넌스 평가**하는 도구다. 실행 중인 에이전트를 대신 통제하는 완전한 sandbox라기보다, agent-facing file, saved trace, public-safe evidence fixture를 읽어 “이 상태가 다음 행동에 어떤 권한·범위·민감도 신호를 줄 수 있는가”를 사람에게 보여주는 쪽에 가깝다.

조사 시점 기준 GitHub 저장소 `ctxgov/ctxgov`는 Python 프로젝트이고, README·`pyproject.toml`·v0.9.0 release note는 public product/package version을 `0.9.0`으로 둔다. `pyproject.toml`은 Python 3.11 이상, console script `ctxgov = ctxgov.cli:main`, classifier `Development Status :: 3 - Alpha`를 명시한다. GitHub 최신 Release는 `CtxGov v0.9.0`이지만 tag 목록에는 `v0.12.0`도 보여서, 공개 제품 표면과 태그 실험 표면을 구분해서 읽는 편이 안전하다.

![CtxGov repository](https://opengraph.githubassets.com/d9249-ctxgov/ctxgov/ctxgov)

## CtxGov 개요

CtxGov의 중심 질문은 “에이전트가 다음에 무엇을 하도록 허용받았다고 믿게 되는가”다. 예를 들어 프로젝트 루트의 `AGENTS.md`, README, saved trace, session continuity packet, memory report shape, governance replay trace 같은 파일은 단순 문서처럼 보이지만, 실제 에이전트에게는 행동 지시·권한·범위·제약으로 해석될 수 있다.

공개 CLI가 다루는 대표 표면은 다음과 같다.

| 표면 | 용도 |
|---|---|
| Session Continuity | saved trace를 다음 세션에 넘길 sidecar/packet으로 컴파일하거나 렌더링한다 |
| Memory X-Ray | memory report shape 예시가 기대한 구조를 만족하는지 검증한다 |
| Change Gate | agent-facing local files에서 authority, capability, scope, lifecycle, sensitivity 변화를 읽는다 |
| Federation | 여러 로컬 repo 또는 base path를 대상으로 Change Gate inventory를 묶는다 |
| OSS Case Study Preview | 저장된 public-source excerpt와 pinned ref로 case-study decision preview를 만든다 |
| Governance Replay | 저장된 local trace를 model/provider 호출 없이 replay해 coverage receipt를 만든다 |
| Forensics preview | fixture에서 timeline, trace, evidence gap JSON을 출력한다 |

이 도구가 흥미로운 이유는 “에이전트 보안”을 runtime sandbox만의 문제로 보지 않는다는 점이다. 많은 사고는 shell 권한 이전에 context가 권한처럼 해석되는 순간 시작된다. CtxGov는 그 context surface를 먼저 읽어보자는 도구다.

## 첫 사용 흐름

README에서 가장 앞에 놓인 명령은 Change Gate다. 현재 repo의 agent-facing surface를 읽고 summary report를 출력한다.

```bash
ctxgov change-gate-check --root . --format summary
```

두 로컬 tree를 비교해 semantic Change Gate report를 만들 수도 있다.

```bash
ctxgov change-gate-check \
  --baseline-root examples/change-gate-public-preview/baseline \
  --head-root examples/change-gate-public-preview/head \
  --format summary
```

세션 연속성 쪽은 synthetic saved trace 예시를 대상으로 compile/render/apply dry-run을 제공한다.

```bash
ctxgov continuity compile examples/session-continuity-public-preview/saved-goal-trace.synthetic.json
ctxgov continuity render examples/session-continuity-public-preview/saved-goal-trace.synthetic.json
ctxgov continuity apply --mode dry-run examples/session-continuity-public-preview/saved-goal-trace.synthetic.json
```

로컬 public package gate는 다음 명령이다.

```bash
python3 scripts/run_public_package_checks.py
```

이 gate는 syntax check, Evidence Core smoke, semantic Change Gate smoke, public CLI smoke test를 돌린다. README와 release note 기준 이 gate는 네트워크 호출, provider/model 호출, public write, target repository write를 하지 않는다. 단, Evidence Core smoke는 명시적 temporary evidence store에 CAS/SQLite write를 만들 수 있고, `continuity apply --mode sandbox`는 local sandbox file 하나를 쓸 수 있다.

## 설치와 배포 표면

여기서는 과장하지 않는 것이 중요하다. README는 “public package version 0.9.0”이라고 말하지만, 조사 시점에 PyPI `ctxgov` JSON API는 404를 반환했고, v0.9.0 release note도 package-registry publishing을 public boundary 밖으로 둔다. 즉 일반 사용자에게 “`pip install ctxgov`로 설치하세요”라고 권하기에는 아직 registry 표면이 확인되지 않는다.

실험하려면 현재로서는 GitHub 소스 checkout 또는 release tarball을 기준으로 보는 편이 안전하다. `pyproject.toml`에는 setuptools build backend와 console script가 정의되어 있으므로, 로컬 venv에서 source install을 검토할 수 있다.

```bash
git clone https://github.com/ctxgov/ctxgov
cd ctxgov
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e .
ctxgov --version
ctxgov change-gate-check --root . --format summary
```

이 흐름은 `pyproject.toml`에 근거한 source checkout 사용법이지, PyPI 배포가 확인됐다는 뜻은 아니다. 팀에 넣을 때는 `v0.9.0` release/tag나 특정 commit SHA를 pin하는 편이 낫다.

## 어디에 쓰기 좋은가

CtxGov가 잘 맞는 곳은 “에이전트가 읽는 상태”가 팀 운영상 중요해진 환경이다.

예를 들면 이런 상황이다.

- repo마다 `AGENTS.md`, `.cursorrules`, Claude/Codex/Hermes skill, MCP 설정이 늘어나고 있다.
- session summary나 handoff packet이 다음 작업의 사실상 task authority가 된다.
- memory, trace, evidence receipt를 장기간 쌓지만 어떤 항목이 실제 행동에 영향을 주는지 불명확하다.
- 여러 agent framework나 public OSS agent repo가 어떤 context surface를 갖는지 inventory로 비교하고 싶다.

v0.9.0의 `release/v0.9.0/state-of-agent-context/REPORT.md`는 이 방향을 잘 보여준다. mem0, cline, langgraph, graphiti, smolagents, continue, aider, autogen 등 8개 public OSS repo의 agent-facing context surface를 pinned commit 기준으로 pathless semantic inventory로 정리한다. 이 보고서는 benchmark나 security review가 아니라, “어떤 종류의 지시·권한·민감도 표면이 보였는가”를 기록한 read-only inventory다.

## 주의할 점

첫째, CtxGov는 policy enforcement runtime이나 OS sandbox가 아니다. Change Gate report가 authority escalation이나 capability expansion을 보여준다고 해서 자동으로 막아주는 것은 아니다. README도 이 결과를 human review evidence로 보는 쪽에 가깝게 제한한다.

둘째, 공개 경계가 매우 좁게 선언되어 있다. v0.9.0 public release boundary는 network/API calls, provider/model calls, daemon, scheduler, runtime adapter execution, target repo writes, public writes, publication automation, hosted runtime, stable external Python API, autonomous remediation을 제외한다. 이 점은 단점이면서 장점이다. 장점은 public CLI가 로컬 fixture와 explicit path 중심이라 평가하기 쉽다는 것, 단점은 실제 agent runtime에 곧바로 끼우는 제품형 게이트웨이는 아니라는 것이다.

셋째, 로그와 trace를 다루는 도구라는 점을 잊으면 안 된다. CtxGov 자체가 공개 CLI에서 network/model 호출을 하지 않는다고 해도, 입력으로 넣는 saved trace, memory report, AGENTS류 파일에는 내부 프로젝트명, 정책, 권한 모델, 민감한 운영 맥락이 들어갈 수 있다. 결과 receipt나 report를 공유하기 전에 raw path/source omission, retention, redaction 기준을 정해야 한다.

넷째, license 표면을 두 번 확인해야 한다. GitHub API는 license를 `Other`/`NOASSERTION`으로 반환했지만, checked-in `LICENSE`는 Apache License 2.0이고 `pyproject.toml`도 `Apache-2.0`을 명시한다. 실무 adoption 문서에는 “GitHub API 자동 감지는 Other로 보일 수 있으나, 저장소 파일 기준 Apache-2.0”처럼 써두는 편이 정확하다.

## 내 판단

CtxGov는 아직 일반적인 “설치해서 쓰는 보안 제품”이라기보다, 에이전트 운영팀이 context governance를 어떻게 측정할지 실험하는 research/developer tool에 가깝다. 특히 `AGENTS.md`, memory, saved trace, handoff summary, MCP/skill instruction이 늘어나는 팀이라면, 코드 변경 diff만 보지 말고 **에이전트가 권한으로 해석할 수 있는 context diff**도 따로 봐야 한다는 문제의식이 좋다.

내가 추천하는 첫 사용법은 작게 시작하는 것이다. 운영 repo 전체에 바로 넣기보다, toy baseline/head 폴더나 내부 agent instruction repo 하나를 대상으로 `change-gate-check --format summary`를 돌려보고, 보고서가 실제 리뷰 회의에서 쓸 만한 언어를 주는지 확인하는 편이 좋다. 그 다음에 session continuity나 governance replay를 붙여도 늦지 않다.

반대로 “agent tool call을 runtime에서 차단해주는 완성형 policy gateway”를 기대한다면 아직 맞지 않는다. CtxGov는 현재 공개 표면 기준으로는 read-only local evaluation, evidence receipt, semantic inventory에 강점이 있다. 자동 차단과 배포 enforcement는 별도 sandbox, approval workflow, MCP gateway, CI policy와 함께 설계해야 한다.

## 참고한 공개 자료

- [ctxgov/ctxgov GitHub repository](https://github.com/ctxgov/ctxgov)
- [CtxGov README](https://github.com/ctxgov/ctxgov/blob/main/README.md)
- [CtxGov v0.9.0 release](https://github.com/ctxgov/ctxgov/releases/tag/v0.9.0)
- [Public release boundary](https://github.com/ctxgov/ctxgov/blob/main/docs/public-release-boundary.md)
- [Change Gate guide](https://github.com/ctxgov/ctxgov/blob/main/docs/change-gate-guide.md)
- [Forensics guide](https://github.com/ctxgov/ctxgov/blob/main/docs/forensics-guide.md)
- [Version policy](https://github.com/ctxgov/ctxgov/blob/main/docs/version-policy.md)
- [State Of Agent Context report](https://github.com/ctxgov/ctxgov/blob/main/release/v0.9.0/state-of-agent-context/REPORT.md)
