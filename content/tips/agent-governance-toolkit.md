---
title: "Agent Governance Toolkit은 AI 에이전트의 행동을 정책·감사·신뢰 계층으로 묶는 Microsoft 공개 프리뷰 런타임이다"
date: "2026-06-02T21:00:41"
description: "microsoft/agent-governance-toolkit은 에이전트의 도구 호출과 위임을 정책으로 허용·거부하고, 감사 로그·신뢰 ID·OWASP 검증 흐름까지 제공하는 MIT 공개 프리뷰 툴킷이다."
author: "Sangmin Lee"
repository: "microsoft/agent-governance-toolkit"
sourceUrl: "https://github.com/microsoft/agent-governance-toolkit"
status: "Open source public preview"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Governance"
  - "Security"
  - "Policy Engine"
  - "Developer Tools"
highlights:
  - "프롬프트에 ‘규칙을 지켜라’고 부탁하는 대신, tool call이 외부로 나가기 전에 YAML/OPA/Cedar 정책으로 allow·deny·approval 결정을 내리는 계층이다."
  - "Python 풀스택과 TypeScript, .NET, Rust, Go SDK를 제공하며, Claude Code·Copilot CLI·OpenCode 같은 agent 개발 표면도 별도 패키지로 연결한다."
  - "agt verify, policy lint, red-team scan, MCP Security Gateway, audit log, trust identity, SRE/kill switch를 한 저장소에 묶어 운영·감사 관점에서 읽기 좋다."
  - "작성 시점 최신 릴리스와 PyPI/npm 주요 패키지는 v4.0.0이고, 프로젝트는 Microsoft-signed public preview로 표시되어 GA 전 breaking change 가능성을 명시한다."
  - "모델의 추론·환각·지식 출처까지 해결하는 만능 안전장치는 아니다. 행동 거버넌스 한 계층으로 보고 컨테이너, IAM, 콘텐츠 안전, 결과 검증과 함께 써야 한다."
draft: false
---

`microsoft/agent-governance-toolkit`은 AI 에이전트가 실제 도구를 호출하기 시작한 뒤 생기는 운영 문제를 정면으로 다루는 공개 프리뷰 툴킷이다. 핵심 질문은 단순하다. “이 에이전트가 지금 이 tool call을 실행해도 되는가?”, “어떤 에이전트가 어떤 정책 아래에서 이 결정을 했는가?”, “나중에 감사할 수 있는 기록이 남는가?”

README의 메시지는 프롬프트 수준의 안전장치만으로는 충분하지 않다는 쪽에 가깝다. 모델에게 “삭제하지 마”라고 말하는 대신, 도구 호출이 실제 외부 시스템에 도달하기 전에 애플리케이션 코드에서 정책을 평가하고, 거부된 작업은 구조적으로 실행되지 않게 만들자는 접근이다.

![Agent Governance Toolkit 배너](/images/tips/agent-governance-toolkit-banner.svg)

## Agent Governance Toolkit 개요

AGT는 단일 CLI라기보다 **에이전트 행동 거버넌스 런타임/SDK 모음**에 가깝다. Python 쪽이 전체 스택의 기준 구현이고, TypeScript, .NET, Rust, Go 패키지가 핵심 primitive를 나눠 제공한다. README와 package matrix가 공통으로 강조하는 기본 축은 다음과 같다.

- **Policy enforcement**: YAML 규칙, OPA/Rego, Cedar, programmatic policy로 tool call 허용·거부·승인 요구를 평가한다.
- **Identity & trust**: 에이전트 ID, trust score, delegation chain, DID/JWK 같은 신뢰 자료를 다룬다.
- **Audit logging**: 누가 어떤 action을 시도했고 어떤 정책 판단이 내려졌는지 structured log로 남긴다.
- **MCP Security Gateway**: MCP tool poisoning, drift, typosquatting, hidden instruction 같은 agent-tool 표면의 위험을 스캔하는 영역을 포함한다.
- **Runtime/SRE 계층**: 실행 ring, kill switch, SLO, error budget, chaos testing, progressive delivery 같은 운영 개념을 agent 시스템에 붙인다.

공식 다이어그램도 이 구조를 잘 보여준다. LangChain, CrewAI, AutoGen, OpenAI Agents, LangGraph, Semantic Kernel, Google ADK 같은 프레임워크 위에 adapter/middleware를 얹고, 그 아래에 Agent OS, AgentMesh, Runtime, Hypervisor, SRE, Marketplace, Lightning, Observability 계층을 배치한다.

![Agent Governance Toolkit 아키텍처 개요](/images/tips/agent-governance-toolkit-architecture.png)

## 왜 유용한가

가장 실용적인 출발점은 `govern()` 래퍼다. 기존 tool function을 감싸고 policy 파일을 붙이면, 매 호출마다 정책을 평가하고 거부 시 `GovernanceDenied`를 발생시키는 흐름이다.

```bash
pip install agent-governance-toolkit[full]
```

```python
from agentmesh.governance import govern

safe_tool = govern(my_tool, policy="policy.yaml")
```

정책은 YAML로 시작할 수 있다.

```yaml
apiVersion: governance.toolkit/v1
name: production-policy
default_action: allow
rules:
  - name: block-destructive
    condition: "action.type in ['drop', 'delete', 'truncate']"
    action: deny
    description: "Destructive operations require human approval"

  - name: require-approval-for-send
    condition: "action.type == 'send_email'"
    action: require_approval
    approvers: ["security-team"]
```

이런 구조가 좋은 이유는 agent framework를 바꿔도 “고위험 행동을 어디서 막고, 어떤 로그를 남기고, 누가 승인해야 하는가”라는 운영 질문을 별도 계층으로 다룰 수 있기 때문이다. 특히 이메일 전송, DB 변경, 결제/환불, 코드 실행, 배포, 고객 데이터 조회처럼 실패 비용이 큰 도구를 agent에게 열어주는 팀이라면 AGT를 설계 참고자료로 읽을 만하다.

## 설치와 첫 사용법

공식 README 기준 quick start는 Python이다.

```bash
pip install agent-governance-toolkit[full]
agt doctor
agt verify
agt verify --evidence ./agt-evidence.json --strict
agt red-team scan ./prompts/ --min-grade B
agt lint-policy policies/
```

다른 언어/도구 표면도 제공된다.

```bash
# TypeScript SDK
npm install @microsoft/agent-governance-sdk

# .NET SDK
dotnet add package Microsoft.AgentGovernance

# Rust SDK
cargo add agentmesh

# Go module
go get github.com/microsoft/agent-governance-toolkit/agent-governance-golang
```

Claude Code에서는 README가 아래 plugin marketplace 흐름을 제시한다.

```text
/plugin marketplace add microsoft/agent-governance-toolkit
/plugin install agt-governance@agent-governance-toolkit
```

작성 시점에 GitHub 최신 릴리스, PyPI의 `agent-governance-toolkit`, npm의 `@microsoft/agent-governance-sdk`는 모두 v4.0.0 계열로 확인된다. v4.0.0 changelog는 Python 패키지를 45개에서 5개 top-level distribution으로 통합했고, TypeScript/.NET/Rust/Go 패키지도 monorepo-wide v4로 맞췄다고 설명한다. 다만 저장소 루트의 `VERSION` 파일은 아직 `3.7.0`으로 남아 있어, 실제 채택 시에는 GitHub Releases와 각 package registry를 함께 보는 편이 안전하다.

## 활용 포인트

AGT를 “agent framework 하나 더”로 보면 애매하다. LangGraph, CrewAI, AutoGen, OpenAI Agents SDK 같은 runtime을 대체하기보다, 그 위에서 **행동 정책과 감사 경계**를 세우는 계층으로 보는 편이 맞다.

실제로 써볼 만한 지점은 다음과 같다.

1. **고위험 tool call gate**  
   `delete_file`, `shell_exec`, `drop_table`, `send_email`, `refund_payment` 같은 tool call을 정책으로 나누고, 일부는 deny, 일부는 human approval로 돌린다.

2. **MCP 서버/도구 신뢰 점검**  
   MCP 도구를 붙이는 agent라면 hidden instruction, typosquatting, schema abuse, tool drift 같은 위험을 별도 checklist로 검토해야 한다. AGT의 MCP Security Gateway 문서는 이 관점에서 유용한 레퍼런스다.

3. **감사와 규제 대응 자료 정리**  
   README는 OWASP Agentic AI Top 10, NIST AI RMF, EU AI Act, SOC 2 mapping을 연결한다. 바로 “컴플라이언스 완료”라는 뜻은 아니지만, agent 운영에서 어떤 evidence를 남겨야 하는지 팀 내부 체크리스트를 만들 때 도움이 된다.

4. **운영/SRE 관점의 agent 관리**  
   kill switch, SLO, error budget, chaos testing, replay, dashboard 같은 단어가 README에 자연스럽게 나온다. 데모 agent가 아니라 배포된 agent fleet을 운영해야 하는 팀이라면 이 vocabulary 자체가 유용하다.

## 주의할 점

AGT는 흥미롭지만, README와 limitations 문서가 직접 적어둔 경계를 같이 읽어야 한다.

- **Public Preview다.** README는 Microsoft-signed, production-quality release라고 설명하면서도 GA 전 breaking change 가능성을 명시한다. 사내 표준으로 고정하려면 버전 pinning과 changelog 확인이 필요하다.
- **행동 거버넌스이지 추론 거버넌스가 아니다.** AGT는 “어떤 action을 실행할지”를 막을 수 있지만, 모델이 왜 그런 결론을 냈는지, 답변 내용이 환각인지, 검색된 지식의 출처가 올바른지는 별도 문제다.
- **개별 허용 action의 조합은 여전히 위험할 수 있다.** limitations 문서는 `read_database`와 `send_slack_message`가 각각 허용될 때 둘을 조합한 데이터 유출 흐름을 예로 든다. workflow-level policy나 data classification 계층이 필요할 수 있다.
- **OS 커널 격리가 아니다.** AGT는 application middleware layer에서 동작한다. README는 production deployment에서는 각 agent를 별도 컨테이너에서 실행하는 식의 OS-level isolation을 권장한다.
- **감사 로그는 시도와 판단을 기록한다.** 외부 API가 실제로 원하는 세계 상태를 만들었는지까지 보장하지 않는다. 결과 검증 hook, SRE 지표, saga/compensating action 같은 애플리케이션 레벨 보완이 필요하다.
- **언어별 성숙도가 완전히 같지는 않다.** Package matrix는 5개 언어의 core primitive를 강조하지만, unified CLI와 governance dashboard는 Python 중심이다. 팀의 주 언어가 Python이 아니라면 필요한 기능이 어느 패키지에 있는지 먼저 확인해야 한다.
- **외부 framework/provider와의 데이터 경계가 남는다.** README의 Important Notes도 third-party agent framework나 service와 함께 쓸 때 데이터 보존 위치와 공유 범위를 검토하라고 경고한다.

## 내 판단

`microsoft/agent-governance-toolkit`은 “에이전트를 더 똑똑하게 만드는 라이브러리”라기보다, 에이전트가 이미 똑똑한 척하며 실제 행동을 하기 시작했을 때 필요한 **운영 통제면**을 제공하는 프로젝트다. 그래서 연구 데모나 개인 자동화에는 다소 무겁지만, 고객 데이터·코드 실행·배포·결제·메일 같은 권한을 agent에게 넘기려는 팀에는 꽤 직접적인 체크리스트가 된다.

특히 마음에 드는 부분은 “모델이 안전하게 생각하게 만들자”가 아니라 “허용되지 않은 행동은 애초에 wire로 나가지 못하게 하자”는 구분이다. 이 구분은 agent 제품화에서 자주 흐려진다. 반대로 이 툴킷만 붙였다고 prompt injection, knowledge provenance, credential lifecycle, result validation 문제가 해결되는 것은 아니다. AGT는 방어층 하나다. 컨테이너 격리, IAM 최소권한, 콘텐츠 안전, 데이터 분류, human approval, 후처리 검증과 함께 설계할 때 가치가 가장 크다.

## 참고한 공개 자료

- [microsoft/agent-governance-toolkit GitHub repository](https://github.com/microsoft/agent-governance-toolkit)
- [Agent Governance Toolkit 공식 문서](https://microsoft.github.io/agent-governance-toolkit/)
- [Agent Governance Toolkit README](https://github.com/microsoft/agent-governance-toolkit/blob/main/README.md)
- [Quick Start](https://github.com/microsoft/agent-governance-toolkit/blob/main/docs/quickstart.md)
- [Known Limitations & Design Boundaries](https://github.com/microsoft/agent-governance-toolkit/blob/main/docs/LIMITATIONS.md)
- [Language Package Matrix](https://github.com/microsoft/agent-governance-toolkit/blob/main/docs/PACKAGE-FEATURE-MATRIX.md)
- [v4.0.0 release](https://github.com/microsoft/agent-governance-toolkit/releases/tag/v4.0.0)
- [agent-governance-toolkit on PyPI](https://pypi.org/project/agent-governance-toolkit/)
- [@microsoft/agent-governance-sdk on npm](https://www.npmjs.com/package/@microsoft/agent-governance-sdk)
- [Agent Governance Toolkit LICENSE](https://github.com/microsoft/agent-governance-toolkit/blob/main/LICENSE)
