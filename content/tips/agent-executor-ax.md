---
title: "Agent Executor(AX)는 장기 실행 AI 에이전트를 위한 Google의 분산 런타임이다"
date: "2026-06-05T18:37:54"
description: "google/ax는 에이전트 실행, 이벤트 로그, 재개, 원격 에이전트·스킬·도구 호출, Kubernetes 배포를 하나의 self-hosted 런타임으로 묶는 Google의 오픈소스 Agent Executor 프로젝트다."
author: "Sangmin Lee"
repository: "google/ax"
sourceUrl: "https://github.com/google/ax"
status: "Open source early preview"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Runtime"
  - "Kubernetes"
  - "Go"
  - "Agent Infrastructure"
highlights:
  - "Agent Executor(AX)는 controller, event log, registry를 중심으로 에이전트·스킬·MCP 도구·sandbox actor를 조율하는 분산 에이전트 런타임이다."
  - "긴 작업의 중단 복구를 위해 event log, single-writer architecture, `--last-seq` replay, `ax fork` 기반 trajectory branching을 제공한다."
  - "공식 첫 설치는 `go install github.com/google/ax/cmd/ax@latest`이며, 조사 시점 GitHub Release와 Go module version은 `v0.1.0`이다."
  - "프로덕션 지향 경로는 Agent Substrate 위의 Kubernetes 배포이며, manifests는 `GEMINI_API_KEY`, GCS bucket, `kubectl port-forward` 흐름을 요구한다."
  - "README가 active early development와 breaking change 가능성을 명시하고, 기본 gRPC server·remote agent·skill script·Gemini credential은 별도 보안 검토가 필요하다."
draft: false
---

AI 에이전트가 몇 초짜리 답변을 넘어 몇 시간 또는 며칠 동안 코드를 실행하고, 도구를 호출하고, 사람 승인을 기다리는 흐름으로 가면 “모델이 똑똑한가”보다 **실행 상태를 어떻게 보존하고 다시 이어갈 것인가**가 더 중요해진다. 브라우저 탭이나 단일 CLI 프로세스에 모든 상태를 맡기면 네트워크 끊김, 서버 재시작, 사람 승인 대기, 원격 도구 실패 같은 상황에서 금방 취약해진다.

`Agent Executor`, 줄여서 `AX`는 Google이 공개한 이 실행 계층용 오픈소스 프로젝트다. 저장소 설명 그대로 “distributed agent runtime”이며, 에이전트를 만드는 프레임워크 자체라기보다 **에이전트 harness, skill, tool, sandbox, remote actor를 안정적으로 실행·기록·재개하기 위한 런타임**에 가깝다.

조사 시점 기준 저장소 `google/ax`는 Go 중심 프로젝트이고, GitHub API와 checked-in `LICENSE` 모두 Apache-2.0으로 확인된다. GitHub Release는 `v0.1.0`이 첫 릴리스이며, README 상단은 “active early development”, stable release 전 breaking change 가능성, 외부 PR 접수 일시 중단을 명확히 경고한다.

![Agent Executor 개요](/images/tips/agent-executor-ax-overview.jpg)

## AX 개요

AX의 핵심 구성은 단순하다. **Controller**가 실행을 조율하고, **Event Log**가 대화와 실행 이벤트를 저장하며, 실제 작업은 agent, harness, skill, tool, sandbox 같은 **Actor**가 수행한다. README의 Mermaid 다이어그램은 client가 router를 거쳐 controller에 붙고, controller가 remote agent, MCP tool, skills/built-in tools가 들어 있는 environment와 통신하는 흐름을 보여준다.

중요한 포인트는 AX가 “또 하나의 챗봇”이 아니라는 점이다. README의 “What AX is NOT?” 섹션은 AX를 managed service, agentic framework, 특정 coding agent harness, 특정 모델 controller가 아니라고 설명한다. 즉 LangGraph, ADK, A2A agent, MCP tool, Google Antigravity 같은 여러 harness와 protocol을 한 런타임 아래에서 조율하려는 레이어로 보는 편이 맞다.

기본 기능은 다음 축으로 정리할 수 있다.

- **분산 실행**: controller, agent, tool, skill, sandbox를 격리된 actor로 나누어 실행한다.
- **내구성 있는 실행 상태**: SQLite event log와 sequence 기반 응답 replay로 연결이 끊긴 client가 다시 따라붙을 수 있게 한다.
- **재개와 분기**: `--resume`, `--last-seq`, `ax fork`로 같은 conversation의 상태를 이어가거나 checkpoint에서 다른 trajectory를 만들 수 있다.
- **감사와 정책 제어**: 모든 user/agent/tool call이 controller를 통과하므로 실행 기록과 승인 흐름을 한 곳에서 다루기 쉽다.
- **Kubernetes 지향 배포**: compute-agnostic을 표방하지만, README와 공식 사이트는 Agent Substrate 위의 Kubernetes 경험을 가장 강하게 밀고 있다.

## 왜 유용한가

AX가 노리는 문제는 “에이전트에게 도구 몇 개를 붙인다”보다 운영 쪽에 더 가깝다. 장기 실행 에이전트는 중간에 사람 확인을 기다릴 수 있고, 원격 agent가 실패할 수 있고, client가 끊길 수 있고, 같은 세션 상태를 여러 actor가 동시에 만지려 할 수 있다. AX는 이 지점에 event log, single-writer architecture, confirmation state, conversation replay를 배치한다.

예를 들어 `ax exec`는 새 conversation ID를 만들거나 기존 conversation을 이어갈 수 있고, client가 sequence 12까지만 본 상태에서 끊겼다면 `--last-seq 12 --resume`으로 그 이후 이벤트를 다시 받을 수 있다. `ax fork`는 특정 sequence에서 별도 conversation을 만들어 같은 상태에서 다른 경로를 실험하는 데 쓸 수 있다.

Google Cloud 공식 블로그도 Agent Executor를 “agent execution, resumption, distributed deployment”를 위한 open-source runtime standard로 소개하면서 durable execution, secure isolation, session consistency, connection recovery, trajectory branching을 핵심 기능으로 정리한다. 이 표현만 보면 제품 홍보처럼 들리지만, 저장소의 CLI와 event log 구조를 보면 실제로 그 방향의 최소 런타임을 먼저 공개한 상태에 가깝다.

## 설치와 첫 사용법

공식 README의 첫 설치 경로는 Go source install이다. 조사 시점 `go.mod`는 `go 1.26.1`을 선언하고 있고, Go module version은 `v0.1.0`만 노출된다.

```bash
go install github.com/google/ax/cmd/ax@latest
ax --help
```

재현성이 중요하면 `@latest` 대신 현재 release tag를 pin하는 편이 낫다.

```bash
go install github.com/google/ax/cmd/ax@v0.1.0
```

가장 작은 실행은 기본 `ax.yaml` 또는 default config로 내장 controller를 띄워 한 번 실행하는 것이다.

```bash
ax exec --input "Can you list me this directory?"
```

원격 controller server에 붙을 수도 있다.

```bash
ax serve --config ax.yaml
ax exec --server localhost:8494 --input "Can you list me this directory?"
```

conversation을 이어가거나 끊긴 client를 따라잡는 흐름은 다음처럼 생겼다.

```bash
ax exec \
  --conversation d85a4b4e-c53b-4c84-b879-f10d905bce40 \
  --input "Show me the contents of README.md"

ax exec \
  --conversation d85a4b4e-c53b-4c84-b879-f10d905bce40 \
  --last-seq 12 \
  --resume
```

checkpoint에서 다른 실행 경로를 만들고 싶으면 `fork`를 쓴다.

```bash
ax fork \
  --src-conversation 38460323-9a78-41cb-8991-022b0ff2c19c \
  --dest-conversation e5e26e38-53a2-4f22-b1cb-ae867357df83 \
  --src-seq 12
```

## 에이전트와 도구를 어떻게 붙이나

기본 설정 파일 `ax.yaml`은 controller server 주소, SQLite event log 위치, Gemini planner, remote agent registry를 담는다. default server address는 `:8494`, event log는 `eventlog/log.sqlite`, planner type은 `gemini`이다. Gemini planner는 API key를 YAML에 넣지 않고 `GEMINI_API_KEY` 또는 Vertex AI 관련 환경변수로 받도록 되어 있다.

remote agent는 크게 세 종류로 볼 수 있다.

| 방식 | 의미 |
|---|---|
| AX-native remote agent | `proto/ax.proto`의 `AgentService.Connect`를 구현한 gRPC server를 `registry.remote_agents`에 등록한다. |
| A2A agent | A2A protocol agent를 HTTP/JSON-RPC/gRPC surface로 띄우고, AX registry에서 `protocol: "a2a"`로 붙인다. |
| Colab agent | Python script나 notebook을 Google Colab session에서 돌리는 experimental 예제가 있다. |

스킬도 별도 표면이다. AX는 agentskills.io 호환 `SKILL.md` 디렉터리를 discovery하고, `skills_dir`가 없으면 `SKILLS_DIR` 환경변수, 그다음 `~/.agents/skills`를 본다. 스킬은 instruction을 활성화할 뿐 아니라 `scripts/` 아래 executable script를 실행할 수 있으므로, 외부 skill catalog를 그대로 가져오는 것은 일반 README를 읽는 것보다 훨씬 높은 신뢰 경계를 요구한다.

## Kubernetes와 Agent Substrate 경로

AX는 로컬 CLI로도 실행되지만, README가 추천하는 production 지향 배포는 Agent Substrate 위의 Kubernetes다. `manifests/README.md`의 흐름은 다음과 같다.

```bash
export GEMINI_API_KEY="your-api-key"
export BUCKET_NAME="your-gcs-bucket"
./hack/install-ax.sh --deploy-ax-server

kubectl wait --for=condition=Ready actortemplate/ax-template -n ax --timeout=5m
kubectl port-forward -n ax svc/ax-router 8001:443

ax exec --server=localhost:8001 --input="hello"
```

여기서 Agent Substrate는 별도 오픈소스 프로젝트로, 많은 stateful actor를 더 적은 Kubernetes worker pod에 multiplex하고 suspend/resume하는 agent-first compute layer다. Google Cloud 블로그는 표준 Kubernetes control plane이 “수백만 개의 짧은 tool call chatter”에 맞춰져 있지 않다는 문제의식에서 AX와 Agent Substrate를 함께 소개한다.

따라서 AX를 제대로 평가하려면 단순히 로컬 CLI 한 번 실행보다 다음 질문을 같이 봐야 한다.

- 내 에이전트는 long-running session, human approval, 재접속 replay가 필요한가?
- remote agent와 tool이 실패했을 때 event log를 기준으로 어디서 재개해야 하는가?
- AX controller server를 어디에 노출하고 어떤 auth/TLS/proxy를 둘 것인가?
- Kubernetes/Agent Substrate까지 올릴 만큼 session density와 운영 복잡도가 있는가?

## 주의할 점

첫째, 프로젝트가 매우 이르다. README는 core, resumption protocol, runtime specification이 stable release 전 크게 바뀔 수 있다고 경고한다. 릴리스도 `v0.1.0` 하나이고 바이너리 asset 없이 source install 중심이다. 팀 표준 런타임으로 도입하기보다 작은 실험과 architecture review에 먼저 쓰는 편이 맞다.

둘째, remote server 보안을 직접 챙겨야 한다. 기본 config의 `server.address`는 `:8494`이고, Go의 TCP listen에서 이런 주소는 모든 interface에 bind될 수 있다. CLI의 server connection도 현재 source 기준 insecure gRPC credential을 사용한다. 로컬 테스트는 괜찮지만 외부 네트워크에 그대로 열기보다 `127.0.0.1`, port-forward, VPN, mTLS proxy, firewall 같은 통제부터 정해야 한다.

셋째, Gemini credential과 event log가 민감 정보 표면이다. 기본 planner는 Gemini를 사용하고, local execution은 `GEMINI_API_KEY` 또는 Vertex AI ADC를 요구한다. event log와 trace에는 사용자의 prompt, tool output, agent trajectory, file path, 승인 질문 같은 운영 정보가 남을 수 있으므로 이슈 첨부나 데모 공유 전에 반드시 redaction을 고려해야 한다.

넷째, tool과 skill은 실제 side effect를 가진다. README의 built-in bash tool은 사용자 approval flow를 거치도록 설명하지만, 스킬 script와 remote agent는 결국 파일 쓰기, shell 실행, 외부 API 호출 같은 동작을 수행할 수 있다. agent runtime을 평가할 때는 “모델이 안전하게 답하는가”뿐 아니라 “어떤 actor가 어떤 권한으로 실행되는가”를 봐야 한다.

다섯째, Agent Substrate 배포는 실험용 로컬 유틸리티 수준이 아니다. GCS bucket, Kubernetes namespace, WorkerPool, ActorTemplate, router port-forward, API key injection이 엮인다. 조직 환경에서는 cluster 권한, secret 관리, image build, 네트워크 경계, 로그 보존 정책을 함께 검토해야 한다.

## 내 판단

AX는 지금 당장 일반 개발자가 매일 쓰는 “AI 코딩 CLI”라기보다, **장기 실행·분산 실행·재개 가능한 에이전트 런타임을 어떻게 설계할지 보여주는 Google의 초기 공개 기준점**에 가깝다. agent framework를 이미 만들고 있거나, A2A/MCP/skills/remote harness/Kubernetes sandbox를 한 execution plane에서 묶어야 하는 팀이라면 읽어볼 가치가 크다.

반대로 단순히 개인용 챗봇, 작은 coding assistant, 로컬 자동화 몇 개를 원한다면 AX는 아직 무겁고 빠르게 바뀔 가능성이 높다. 이 경우에는 저장소를 바로 production에 올리기보다 README, Google Cloud 글, manifests, proto를 보면서 “우리 에이전트 운영에 event log·replay·fork·actor isolation이 정말 필요한가”를 판단하는 참고 자료로 쓰는 쪽이 더 현실적이다.

## 참고한 공개 자료

- [google/ax GitHub repository](https://github.com/google/ax)
- [Agent Executor official site](https://agentexecutor.io)
- [Google Cloud Blog: Agent Executor, Google’s distributed Agent Runtime](https://cloud.google.com/blog/products/ai-machine-learning/agent-executor-googles-distributed-agent-runtime)
- [AX Kubernetes deployment guide](https://github.com/google/ax/blob/main/manifests/README.md)
- [Agent Substrate GitHub repository](https://github.com/agent-substrate/substrate)
- [Google Cloud Blog: Agent Sandbox on GKE and Agent Substrate](https://cloud.google.com/blog/products/containers-kubernetes/bringing-you-agent-sandbox-on-gke-and-agent-substrate)
- [Agent Executor demo video](https://www.youtube.com/watch?v=L5Iw1IrZ6Nc)
