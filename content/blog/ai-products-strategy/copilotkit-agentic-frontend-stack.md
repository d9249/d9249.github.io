---
title: "CopilotKit은 에이전트를 앱 안의 UX로 끌어오는 프론트엔드 런타임이다"
date: "2026-05-10T03:05:29"
description: "CopilotKit/CopilotKit은 단순 채팅 위젯보다 넓은 문제를 겨냥한다. 사용자-facing UI, Runtime, AG-UI, 에이전트, 도구, MCP 서버를 하나의 상호작용 루프로 묶어 실제 애플리케이션 안에서 에이전트가 상태를 읽고, UI를 렌더링하고, 사람에게 확인을 요청하게 만드는 agentic frontend stack이다."
author: "Sangmin Lee"
category: "ai-products-strategy"
tags:
  - CopilotKit
  - AG-UI
  - Generative UI
  - Agents
  - Frontend AI
  - React
  - Open Source
draft: false
---

AI 에이전트를 제품 안에 넣는다고 할 때, 가장 먼저 떠오르는 형태는 보통 채팅창이다. 앱 오른쪽 아래에 사이드바를 붙이고, 사용자가 자연어로 질문하면 모델이 답하는 구조다. 하지만 실제 제품에서 필요한 것은 단순한 채팅창보다 훨씬 복잡하다. 에이전트는 현재 화면의 상태를 알아야 하고, 사용자가 수정 중인 객체를 읽어야 하며, 필요하면 버튼·카드·폼 같은 UI를 직접 렌더링해야 한다. 장기 작업에서는 세션을 이어 가야 하고, 위험한 액션은 사람에게 확인을 받아야 한다.

`CopilotKit/CopilotKit`이 흥미로운 이유는 이 문제를 "챗봇 컴포넌트"가 아니라 **agentic frontend stack**으로 다룬다는 점이다. GitHub 설명도 이 저장소를 "The Frontend Stack for Agents & Generative UI. React + Angular. Makers of the AG-UI Protocol"이라고 소개한다. 즉 초점은 모델 자체가 아니라, **사용자-facing 앱과 에이전트 백엔드 사이의 상호작용 표면**에 있다.

핵심은 프론트엔드와 에이전트를 별도 세계로 두지 않는 것이다. 사용자는 앱 UI에서 작업하고, CopilotKit은 그 UI와 Runtime을 통해 상태·스레드·생성형 UI·에이전트 제어를 관리한다. 그 뒤쪽에서는 AG-UI를 통해 LangGraph, CrewAI, Mastra, Google ADK, Microsoft Agent Framework 같은 에이전트 런타임 또는 커스텀 에이전트와 연결된다. 이 구도에서는 AI 기능이 앱 옆에 붙은 부가 위젯이 아니라, 앱 내부 상태와 함께 움직이는 실행 레이어가 된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/copilotkit-how-it-works-frame-20.png"
    alt="CopilotKit agent interaction flow"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    CopilotKit README의 공식 동작 흐름 이미지에서 추출한 프레임. 사용자, CopilotKit UI/Runtime, AG-UI, Agent, Tools, MCP Servers가 하나의 상호작용 루프로 배치된다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

에이전트를 실제 SaaS나 내부 도구에 붙일 때 흔한 실패는 "모델은 똑똑한데 제품 경험은 분리되어 있다"는 점이다. 모델은 답을 만들 수 있지만, 현재 사용자가 보고 있는 테이블의 선택 행을 모르거나, 폼 값을 바꾸지 못하거나, 작업 중간에 확인 UI를 띄우지 못한다. 반대로 앱은 상태를 갖고 있지만, 그 상태를 에이전트가 읽고 쓸 수 있는 이벤트 프로토콜로 내보내지 못한다.

CopilotKit은 이 간극을 줄이려 한다. README는 CopilotKit을 full-stack agentic applications, Generative UI, chat applications를 만들기 위한 SDK라고 설명하고, 기능 목록으로 Chat UI, Backend Tool Rendering, Generative UI, Shared State, Human-in-the-Loop를 제시한다. 이 목록이 중요한 이유는, 모두 "에이전트가 앱 안에서 실제 사용자와 함께 작업하기 위해 필요한 표면"이기 때문이다.

특히 Generative UI는 단순한 장식이 아니다. CopilotKit 문서의 표현대로, LLM이 호출한 tool을 커스텀 컴포넌트로 UI에 렌더링할 수 있고, 에이전트 상태를 앱 안에 표시할 수 있다. 그러면 에이전트 응답은 긴 텍스트 대신 카드, 차트, 선택지, 확인 버튼, 상태 패널로 바뀐다. 사용자는 모델이 한 일을 읽는 것이 아니라, **모델이 만들어 낸 조작 가능한 UI와 상호작용**한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/copilotkit-generative-ui-weather-card.webp"
    alt="CopilotKit generative UI weather card example"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 홈페이지의 Generative UI 예시. AI 응답이 단순 텍스트가 아니라 날씨 카드 같은 UI 컴포넌트로 렌더링되는 패턴을 보여 준다.
  </figcaption>
</figure>

## 핵심 아이디어 / 구조 / 동작 방식

CopilotKit의 구조는 크게 세 층으로 읽을 수 있다. 첫째는 사용자와 만나는 프론트엔드 SDK다. React 기준으로는 `@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/react-textarea`가 있고, 최근 릴리스에서는 `@copilotkit/react-native`도 추가됐다. Angular용 패키지도 별도로 존재한다. 즉 CopilotKit은 "웹 앱에 챗 UI 하나 붙이기"보다 넓게, 여러 UI 환경에서 에이전트 상호작용을 표준화하려는 방향이다.

둘째는 Runtime이다. 문서의 Copilot Runtime 설명은 이를 "frontend를 AI agents에 연결하고 authentication, middleware, routing 등을 제공하는 backend"라고 정의한다. 이 Runtime 계층이 중요하다. 프론트엔드가 직접 모델이나 에이전트 프레임워크와 얽히면 인증, 도구 호출, 스트리밍, 상태 동기화, 멀티 에이전트 라우팅이 금방 복잡해진다. CopilotKit은 이 지점을 Runtime으로 분리해 앱 UI와 에이전트 실행을 중재한다.

셋째는 AG-UI다. README는 CopilotKit이 AG-UI Protocol의 회사라고 소개하고, AG-UI를 LangGraph, CrewAI 등 여러 agentic stack과의 1st-party integration 맥락에서 제시한다. 여기서 AG-UI는 단순한 UI 컴포넌트 라이브러리가 아니라, 에이전트 workflow가 사용자-facing application과 주고받는 이벤트·상태·액션의 계약에 가깝다. CopilotKit의 전략은 이 프로토콜을 중심에 놓고, 다양한 에이전트 프레임워크를 프론트엔드 앱으로 끌어오는 것이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/copilotkit-agent-connect-diagram.png"
    alt="CopilotKit connects user interfaces to agentic backends"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 홈페이지의 agent connection 다이어그램. CopilotKit은 사용자 UI와 Agentic Backend, Tools, Agent Frameworks, LLM 사이의 연결 계층으로 배치된다.
  </figcaption>
</figure>

| 레이어 | 공개 자료에서 확인되는 구성 | 의미 |
|---|---|---|
| Frontend SDK | `@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/react-textarea`, Angular package, React Native package | 앱 안에 copilot UI, hooks, headless/generative UI를 붙이는 표면 |
| Runtime | `@copilotkit/runtime`, `@copilotkit/core`, `@copilotkit/runtime-client-gql` | 인증, middleware, routing, agent 연결, tool/context 처리를 담당하는 중간 계층 |
| Protocol / interaction | AG-UI, A2UI renderer, MCP Apps 관련 문서 | 에이전트 이벤트와 사용자-facing UI를 연결하는 계약 |
| Agent integrations | LangGraph, CrewAI, Mastra, LlamaIndex, PydanticAI, Microsoft Agent Framework, Google ADK 등 예제 | 특정 에이전트 프레임워크에 갇히지 않는 통합 전략 |
| Ops / product surface | threads, persistence, observability, cloud/self-hosted 서비스, showcase platform | 단발 데모보다 제품 운영 흐름을 겨냥 |

이 구조가 설득력 있는 이유는, 에이전트 앱의 난점이 모델 호출 자체보다 **상태와 UI의 경계**에 있기 때문이다. 예를 들어 사용자가 분석 대시보드에서 "이탈률이 높은 세그먼트만 봐줘"라고 요청한다고 하자. 단순 챗봇은 텍스트로 분석을 설명한다. CopilotKit식 접근에서는 에이전트가 현재 필터 상태를 읽고, 필요한 tool을 호출하고, 결과를 카드나 테이블로 렌더링하며, 사용자가 확인해야 할 액션은 버튼으로 다시 앱에 노출할 수 있다.

## 공개된 근거에서 확인되는 점

GitHub API 기준 `CopilotKit/CopilotKit`은 TypeScript 중심의 MIT 라이선스 저장소다. 조회 시점 기준 stars는 약 31.2k, forks는 약 4.0k이며, 기본 브랜치는 `main`이다. 루트는 Nx 기반 모노레포이고, `packages/` 아래에는 core, runtime, react 계열, angular, react-native, sqlite-runner, voice, web-inspector, a2ui-renderer 등 19개 패키지 디렉터리가 있다. Python SDK도 `sdk-python` 아래 별도로 존재하며, `copilotkit` 패키지 버전은 `0.1.88`로 표시된다.

README의 Quick Start는 새 프로젝트에서는 `npx copilotkit@latest create -f <framework>`, 기존 프로젝트에서는 `npx copilotkit@latest init`을 안내한다. 이 흐름은 CopilotKit이 라이브러리 한두 개를 수동 조립하는 방식보다, 앱 초기화와 provider 설정, agent/UI 연결을 빠르게 세팅하는 개발자 경험을 지향한다는 점을 보여 준다.

최신 GitHub release는 `v1.57.1`이며 2026년 5월 7일에 발행됐다. 릴리스 노트에서 가장 눈에 띄는 변화는 네 가지다. `@copilotkit/react-native`가 추가됐고, `registerProxiedAgent`가 도입되어 frontend-side agent를 server-defined runtime agent에 연결할 수 있게 됐다. 또한 `BuiltInAgent`의 MCP server config에 per-call `getHeaders` resolver가 추가됐고, runtime intelligence 설정 시 `IntelligenceIndicator` pill을 자동 mount하는 변화도 들어갔다.

이 릴리스 내용은 CopilotKit의 방향을 잘 보여 준다. 단순 React 웹 위젯에서 끝나는 것이 아니라 React Native까지 확장하고, MCP server 인증 헤더, runtime agent proxy, intelligence indicator처럼 **실제 앱 운영에서 필요한 연결·상태·표시 문제**를 계속 다듬고 있다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub repo metadata | TypeScript, MIT, 약 31.2k stars / 4.0k forks, homepage는 docs.copilotkit.ai | 성숙한 관심도를 가진 공개 agentic frontend 저장소 |
| README | agent-native applications, Generative UI, shared state, human-in-the-loop workflows 강조 | 채팅 UI를 넘어 앱 상태와 사용자 조작을 에이전트 루프에 포함 |
| AGENTS.md / CLAUDE.md | Frontend → Runtime → Agent, AG-UI protocol, event-based SSE 구조로 설명 | 프로젝트 내부 문맥도 CopilotKit을 3계층 에이전트 프레임워크로 정의 |
| packages | React, Runtime, Core, Angular, React Native, Voice, Web Inspector, A2UI renderer 등 | 단일 컴포넌트보다 넓은 모노레포 플랫폼 구조 |
| examples README | 47개 consolidated demo, 17개 integration starter, canvas/showcase 예제 | 여러 프레임워크와 interaction pattern을 실제 예제로 유지 |
| release v1.57.1 | React Native, `registerProxiedAgent`, MCP `getHeaders`, IntelligenceIndicator | 모바일·runtime proxy·MCP 인증·상태 표시 쪽으로 표면 확장 |

## 실무 관점에서의 해석

CopilotKit의 가장 큰 장점은 에이전트를 "앱 밖의 대화 상대"가 아니라 **앱 안의 실행 주체**로 다루게 해 준다는 점이다. 이를 위해 필요한 구성요소가 꽤 선명하게 나뉘어 있다. React/Angular/React Native 쪽은 사용자 경험과 컴포넌트 렌더링을 맡고, Runtime은 인증과 routing, agent 연결을 맡고, AG-UI는 에이전트 이벤트와 UI 상태 사이의 프로토콜 역할을 한다.

이 구분은 팀 단위 도입에서 특히 중요하다. 프론트엔드 팀은 CopilotSidebar, CopilotChat, hook, headless UI, custom component rendering 같은 표면을 다루고, 백엔드/agent 팀은 LangGraph, CrewAI, Mastra, Python SDK, MCP server, custom runtime agent를 다룰 수 있다. 양쪽이 직접 강하게 결합되는 대신, CopilotKit Runtime과 AG-UI라는 공통 경계가 생긴다.

Threads와 persistence도 제품 관점에서는 작지 않은 기능이다. 실제 업무형 copilot은 한 번의 질문으로 끝나지 않는다. 사용자는 어제 하던 분석을 오늘 이어 하고, 이전 세션의 선택지나 승인 흐름을 다시 불러오며, 여러 작업 thread를 오간다. CopilotKit 홈페이지는 이를 이전 세션 목록과 "Welcome back" 형태의 UI로 보여 준다. 이는 에이전트 UX가 채팅 로그가 아니라 **작업 상태의 복원** 문제로 넘어가고 있음을 잘 드러낸다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/copilotkit-threads-persistence.png"
    alt="CopilotKit threads and persistence example"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 홈페이지의 Threads + Persistence 예시. 이전 세션 목록과 복원된 Copilot 제안은 agent UX가 단발 대화가 아니라 장기 작업 상태 관리로 이동하고 있음을 보여 준다.
  </figcaption>
</figure>

물론 비용도 있다. CopilotKit은 작은 위젯 하나보다 훨씬 넓은 스택이다. AG-UI, A2UI, Runtime, MCP Apps, Cloud/self-hosted, showcase platform, premium intelligence 같은 용어와 표면이 많다. 단순히 "웹사이트에 AI 챗봇 하나 붙이기"가 목표라면 오히려 무겁게 느껴질 수 있다. 반대로 앱 상태, tool rendering, human-in-the-loop, thread persistence, 여러 에이전트 프레임워크 연결이 필요하다면 이 복잡도는 기능 분해의 대가로 볼 수 있다.

또 하나의 관찰점은 CopilotKit이 "에이전트 프레임워크"라기보다 **에이전트 프레임워크들을 사용자 경험으로 번역하는 프론트엔드/런타임 계층**에 가깝다는 점이다. LangGraph나 CrewAI가 agent workflow 자체를 만드는 쪽에 가깝다면, CopilotKit은 그 workflow가 실제 사용자 앱 안에서 어떻게 보이고, 멈추고, 확인받고, 상태를 공유하고, 다시 시작되는지를 다룬다. 이 역할은 앞으로 에이전트 앱에서 점점 더 중요해질 가능성이 크다.

## 어디에 잘 맞고, 어디에는 과한가

CopilotKit은 다음과 같은 제품에 특히 잘 맞는다.

- SaaS 대시보드 안에 분석·설정·작업 자동화 copilot을 넣어야 하는 경우
- 에이전트가 앱 상태를 읽고 쓰며, 결과를 카드·테이블·폼으로 렌더링해야 하는 경우
- LangGraph, CrewAI, Mastra, LlamaIndex, PydanticAI, Google ADK 같은 백엔드 agent stack을 이미 쓰고 있는 경우
- 장기 작업, 세션 복원, human-in-the-loop 확인, 도구 호출 표시가 중요한 경우
- 단순 챗봇보다 앱 고유 UI와 결합된 Generative UI가 필요한 경우

반대로 다음 상황에서는 과할 수 있다.

- FAQ 챗봇이나 단순 문서 검색 UI만 필요한 경우
- 앱 상태와 에이전트 상태를 깊게 연결할 계획이 없는 경우
- AG-UI나 Runtime 같은 중간 계층을 운영할 여력이 없는 경우
- 빠르게 한 페이지 데모만 만들고 장기 유지보수는 고려하지 않는 경우

결국 CopilotKit의 본질은 "AI 채팅 컴포넌트"가 아니라 **사용자-facing agentic application을 만들기 위한 상호작용 인프라**다. 이 관점으로 보면 CopilotKit이 왜 React UI, Runtime, protocol, examples, showcase, cloud, self-hosted, React Native까지 한 저장소에서 다루는지 이해하기 쉽다. 에이전트가 제품 안으로 들어오면 문제는 모델이 아니라 UX, 상태, 이벤트, 권한, 복원, 사람 승인으로 이동하기 때문이다.

## 한 줄로 요약하면

`CopilotKit/CopilotKit`은 AI 에이전트를 앱 옆의 채팅창으로 붙이는 도구가 아니라, **사용자 UI와 Runtime, AG-UI, 에이전트, 도구, MCP 서버를 하나의 상호작용 루프로 묶어 agentic application을 제품 수준의 UX로 만들기 위한 프론트엔드 런타임 스택**으로 보는 편이 더 정확하다.

Sources: https://github.com/CopilotKit/CopilotKit, https://www.copilotkit.ai/, https://docs.copilotkit.ai/, https://api.github.com/repos/CopilotKit/CopilotKit, https://api.github.com/repos/CopilotKit/CopilotKit/contents, https://api.github.com/repos/CopilotKit/CopilotKit/commits?per_page=12, https://api.github.com/repos/CopilotKit/CopilotKit/tags?per_page=20, https://api.github.com/repos/CopilotKit/CopilotKit/releases/latest, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/README.md, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/AGENTS.md, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/CLAUDE.md, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/package.json, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/pnpm-workspace.yaml, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/examples/README.md, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/showcase/README.md, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/packages/core/package.json, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/packages/runtime/package.json, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/packages/react-native/package.json, https://raw.githubusercontent.com/CopilotKit/CopilotKit/main/sdk-python/pyproject.toml
