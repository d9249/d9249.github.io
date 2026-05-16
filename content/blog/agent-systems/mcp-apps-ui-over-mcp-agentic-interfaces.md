---
title: "MCP Apps는 채팅창을 앱 런타임으로 바꾼다: UI over MCP의 의미"
date: "2026-05-16T20:47:49"
description: "AI Engineer의 MCP UI 발표는 MCP Apps가 tool result를 단순 텍스트가 아니라 sandboxed iframe, ui:// resource, bidirectional communication을 갖춘 interactive app으로 바꾸며, 채팅 인터페이스를 앱 배포 표면으로 확장하는 흐름을 보여준다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - MCP Apps
  - MCP
  - Agent UI
  - UI over MCP
  - AI Engineer
  - YouTube
draft: false
---

에이전트 제품을 만들다 보면 곧 같은 벽에 부딪힌다. 모델은 도구를 잘 호출하지만, 도구가 돌려주는 결과는 여전히 긴 텍스트와 JSON 덩어리인 경우가 많다. 사용자는 차트, 폼, 지도, 캘린더, 결제 UI, 분석 대시보드를 원하지만 채팅창은 자주 “설명문”으로 모든 것을 환원한다.

AI Engineer의 **`MCP UI: Extending the frontier`** 발표는 이 병목을 정면으로 다룬다. Liad Yosef와 Ido Salomon은 MCP Apps를 “MCP 서버가 UI를 채팅 호스트 안으로 전달하는 표준”으로 설명한다. 핵심은 단순하다. tool result가 텍스트만 반환하는 대신, 서버가 `ui://` resource와 HTML app을 제공하고, 호스트가 이를 sandboxed iframe으로 렌더링한다.

이 변화는 작은 UI 편의 기능이 아니다. 채팅창이 검색창이나 콘솔이 아니라 **앱이 실행되는 배포 표면**이 되는 변화다.

## 무엇을 다루는 영상인가

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0;">
  <iframe
    src="https://www.youtube.com/embed/o-zkvb0iFDQ"
    title="MCP UI: Extending the frontier — Liad Yosef and Ido Salomon, MCP Apps"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

이 영상은 AI Engineer 채널에 2026-05-06 업로드된 약 22분 길이의 컨퍼런스 발표다. YouTube 제목은 **`MCP UI: Extending the frontier — Liad Yosef and Ido Salomon, MCP Apps`**이고, 설명란은 ChatGPT, Claude, VS Code, Cursor, Copilot 같은 host 안에서 tool이 branded, functional app experience를 보낼 수 있다는 점을 강조한다.

공식 chapter가 잘 정리되어 있어 흐름도 명확하다. 발표는 텍스트 기반 tool response의 한계에서 시작해, MCP-UI와 MCP Apps 표준화 배경, PostHog/Claude 데모, host/server architecture, interaction message spectrum, reusable views, generative UI와 “write once, run everywhere” 주장으로 이어진다.

이 글은 YouTube metadata와 transcript, 영상에서 추출한 주요 프레임, 그리고 `modelcontextprotocol/ext-apps` 공식 repo와 specification, `MCP-UI-Org/mcp-ui` SDK README, 관련 ecosystem 자료를 함께 확인해 정리했다.

## 핵심 아이디어: 텍스트 응답이 아니라 앱 조각을 돌려준다

발표의 출발점은 “우리는 지금까지 text에 익숙했다”는 문제 제기다. MCP tool은 어떤 일을 실행하고, 호스트는 그 결과를 채팅창에 보여준다. 그런데 많은 회사 입장에서 이것은 너무 손실이 큰 표현 방식이다. Shopify, Booking, Expedia, Hugging Face 같은 서비스가 갖고 있는 정체성, 인터랙션, 시각적 구조가 모두 한 덩어리 텍스트로 줄어든다.

MCP Apps의 제안은 이 손실을 줄이는 것이다. tool이 text만 돌려주는 대신, UI resource를 함께 제공한다. 호스트는 해당 resource를 읽고, chat transcript 안에 interactive app으로 렌더링한다. 사용자는 결과를 읽는 것이 아니라 조작한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/mcp-apps-adoption-logos.webp"
    alt="Slide showing companies and projects adopting MCP Apps, including TheFork, monday.com, ElevenLabs, Postman, Shopify and obot"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    03:35 전후 장면. 발표는 MCP Apps가 특정 데모 프로젝트가 아니라 여러 host와 tool provider가 맞물리는 ecosystem layer가 되고 있다는 점을 강조한다.
  </figcaption>
</figure>

공식 `ext-apps` README도 같은 방향으로 MCP Apps를 정의한다. MCP tool이 charts, forms, dashboards 같은 interactive UI를 Claude, ChatGPT, 그리고 compliant chat client 안에 inline으로 렌더링할 수 있게 하는 extension이라는 설명이다.

따라서 여기서 중요한 단어는 “UI”보다 “standard”다. 각 host가 제각각 widget protocol을 만들면 개발자는 ChatGPT용, Claude용, VS Code용 UI를 따로 관리해야 한다. MCP Apps는 이 단편화를 줄이고, 서버가 한 번 선언한 UI resource를 여러 host가 같은 방식으로 이해하도록 만들려는 시도다.

## UI over MCP는 어떻게 동작하나

발표의 core concept 구간은 구조가 비교적 단순하다.

먼저 사용자가 host에서 intent를 말한다. host의 모델은 MCP server의 tool을 호출한다. 예전 방식이라면 server는 text나 structured data를 돌려준다. MCP Apps에서는 tool metadata가 UI resource를 가리키고, host는 `resources/read`로 해당 resource를 가져와 sandboxed iframe 안에 렌더링한다.

공식 specification은 이 resource가 `ui://` URI scheme을 쓰고, 초기 HTML content type으로 `text/html;profile=mcp-app`을 사용한다고 설명한다. tool과 UI는 `_meta.ui.resourceUri`로 연결된다. 즉 “이 tool의 결과는 이 UI resource로 보여 달라”는 계약이 tool definition 안에 들어가는 셈이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/mcp-apps-ui-communication.webp"
    alt="Slide titled Communication explaining that UI sends an action to the host on every user interaction"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    06:05 전후 장면. MCP Apps의 UI는 단순 presentation이 아니라, 사용자 interaction을 host로 되돌려 보내는 communication channel을 가진다.
  </figcaption>
</figure>

중요한 점은 이 UI가 서버가 보낸 static screenshot이 아니라는 것이다. 발표자는 “interactive means interactive”라고 강조한다. 사용자가 버튼을 누르거나 form을 채우면, 그 action은 host로 전달된다. host는 그 action을 user intent나 instruction으로 해석하고, 필요하면 다시 tool을 호출한다.

이 설계는 앱의 권한 모델도 바꾼다. 전통적인 웹 앱에서는 클릭이 서비스 backend로 바로 간다. MCP Apps에서는 interaction이 우선 host를 거친다. 즉 host, model, tool server, embedded UI 사이의 통제권 분배가 제품 설계의 핵심 문제가 된다.

## PostHog 데모: “show me”가 텍스트를 대시보드로 바꾼다

발표에서 가장 직관적인 장면은 PostHog와 Claude 데모다. 사용자가 Claude에게 funnel 분석을 요청하면, 예전 방식에서는 textual response가 나온다. 정확한 설명일 수는 있지만, funnel drop-off를 이해하려면 사용자가 긴 문장을 읽고 머릿속에서 구조를 다시 만들어야 한다.

MCP Apps 방식에서는 사용자가 “show me”라고 말했을 때 PostHog가 만든 funnel visualization이 Claude 안에 나타난다. 발표자는 이 UI가 PostHog가 제어하는 component이며, PostHog 웹사이트에서 보던 경험과 정체성을 chat host 안으로 가져온다고 설명한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/mcp-apps-posthog-claude-demo.webp"
    alt="Claude demo showing a PostHog funnel chart and textual interpretation inside the chat interface"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    07:35 전후 장면. funnel result가 텍스트 요약만이 아니라 chart와 함께 렌더링되면서, 사용자는 drop-off 구조를 한눈에 볼 수 있다.
  </figcaption>
</figure>

이 데모가 보여 주는 변화는 “예쁜 차트”보다 크다. 에이전트가 앱 데이터를 가져와 설명하는 수준에서 멈추지 않고, 해당 앱이 정의한 domain-specific interaction을 그대로 host 안에 가져온다. 분석 도구라면 chart, 커머스라면 cart, 여행 서비스라면 itinerary, 디자인 도구라면 canvas가 들어올 수 있다.

물론 이때 좋은 UX는 자동으로 생기지 않는다. 어떤 interaction을 host로 넘기고, 어떤 interaction은 embedded UI 내부에서 처리할지 정해야 한다. 예를 들어 장바구니 수량 변경은 UI가 직접 처리하고 host에는 notification만 보낼 수 있다. 반대로 “예약 확정”처럼 모델과 사용자의 추가 확인이 필요한 action은 host를 거쳐야 할 수 있다.

## 아키텍처: host, sandbox, MCP server 사이의 새 계약

기술적으로 MCP Apps는 host와 server 사이에 UI delivery contract를 추가한다. 영상의 architecture slide는 사용자, host sandbox, model, client SDK, MCP server, server SDK를 한 장에 배치한다.

서버 쪽은 UI resource를 만들고 tool metadata에 연결한다. 호스트 쪽은 이 resource를 fetch하고 sandbox 안에서 렌더링한다. `@mcp-ui/client`의 `AppRenderer` 같은 client component는 host가 받은 UI resource를 실제 React host 안에 붙이는 역할을 한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/mcp-apps-architecture-overview.webp"
    alt="MCP-UI Architecture slide showing user, host sandbox, client SDK, MCP server and server SDK"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    09:00 전후 architecture slide. MCP Apps의 핵심 경계는 host sandbox와 MCP server 사이의 UI resource contract다.
  </figcaption>
</figure>

여기서 sandbox는 부가 기능이 아니라 핵심 안전 장치다. 공식 specification은 host가 iframe sandboxing과 CSP를 강제해야 한다고 설명한다. UI resource는 필요한 `connectDomains`, `resourceDomains`, `frameDomains`, permissions 등을 선언하고, host는 선언되지 않은 domain을 허용하지 않아야 한다.

이 말은 MCP Apps가 “임의 웹사이트를 채팅창에 마음대로 꽂는다”는 뜻이 아니라는 점을 분명히 한다. 오히려 agent host 안에 앱을 넣기 위해 필요한 audit trail, CSP, permission boundary, fallback behavior를 표준화하려는 시도에 가깝다.

## 타임라인으로 보는 핵심 구간

| 구간 | 핵심 장면 | 의미 |
|---|---|---|
| 00:14~01:02 | Liad와 Ido 소개, ChatGPT·Claude 안의 interactive app 언급 | MCP Apps를 이미 여러 host에서 보이는 앱 경험의 표준화 흐름으로 제시 |
| 01:02~02:06 | text wall 문제와 branded UI 필요성 | tool output이 텍스트로 환원될 때 product identity와 UX가 사라진다는 문제 정의 |
| 02:06~03:25 | MCP-UI에서 MCP Apps extension으로 이동 | 커뮤니티 실험이 공식 extension/spec 논의로 들어가는 배경 |
| 03:25~05:14 | host와 provider adoption 사례 | 단일 demo가 아니라 ecosystem coordination 문제임을 강조 |
| 05:14~06:49 | UI resource와 communication 개념 | tool response가 HTML resource와 user action channel을 가질 수 있다는 핵심 메커니즘 |
| 06:49~08:54 | PostHog funnel을 Claude 안에서 시각화 | 텍스트 요약과 domain UI의 차이를 실제 데모로 보여 줌 |
| 08:54~10:23 | MCP-UI architecture | host sandbox, client SDK, server SDK, resource fetch, callback 구조를 설명 |
| 10:23~12:32 | “new web” 논의 | 웹사이트 중심 UX가 agent host 안의 app chunks로 재구성될 수 있다는 제품적 주장 |
| 12:32~14:56 | notification/tool/prompt spectrum | UI action이 host와 app 사이에서 어느 정도 통제권을 갖는지 분해 |
| 14:56~18:18 | reusable views, model-UI interaction, generative UI | 매번 새 UI를 렌더링하는 방식의 한계와 향후 표준화 영역을 제시 |
| 18:18~22:00 | run everywhere, skills, community 참여 | 같은 MCP App codebase가 여러 host에서 동작하는 배포 표면으로 확장된다는 결론 |

## 영상과 연결 자료에서 확인되는 점

확인 가능한 사실을 나누면 다음과 같다.

| 근거 | 확인되는 내용 | 해석 |
|---|---|---|
| YouTube metadata | 제목은 `MCP UI: Extending the frontier`, 채널은 AI Engineer, 업로드일은 2026-05-06 | MCP Apps/UI over MCP를 다루는 22분 컨퍼런스 발표 |
| Transcript/chapters | text response 한계, MCP-UI history, PostHog/Claude demo, architecture, interaction spectrum, generative UI 순서로 진행 | 단순 product pitch보다 표준/UX/분배 모델을 함께 다루는 talk |
| `modelcontextprotocol/ext-apps` README | MCP Apps는 charts, forms, dashboards 같은 UI를 Claude, ChatGPT 등 compliant client에 inline rendering하는 extension | agent host가 앱 배포 표면이 되는 방향을 공식 repo가 뒷받침 |
| MCP Apps specification | `ui://` resource, `text/html;profile=mcp-app`, `_meta.ui.resourceUri`, sandboxed iframe, CSP, bidirectional communication을 정의 | “UI over MCP”가 프론트엔드 편의 기능이 아니라 wire format과 security model을 포함한 protocol layer임을 보여 줌 |
| `MCP-UI-Org/mcp-ui` README | `@mcp-ui/server`, `@mcp-ui/client`, Ruby/Python server SDK가 있고, hosts는 `resources/read`로 UI를 fetch해 `AppRenderer`로 렌더링 | spec을 실제 host/server SDK로 구현하는 developer surface가 이미 존재 |
| Ecosystem repos | `mcp-use`, MCPJam 등은 MCP Apps/MCP server debugging/building 흐름을 제품화 | 표준이 안정되면 app builder, inspector, eval, CI가 주변 생태계로 붙을 가능성이 큼 |

주의할 점도 있다. 영상의 “웹사이트가 필요 없어질 수 있다”는 표현은 강한 제품적 비유다. 모든 웹사이트가 곧 사라진다는 뜻으로 읽기보다는, 사용자의 intent가 agent host에서 시작될 때 기존 웹 앱의 기능이 더 작은 UI chunk로 분해되어 호출될 수 있다는 뜻으로 보는 편이 안전하다.

또한 host support는 여전히 중요하다. 공식 README도 MCP Apps가 core MCP specification의 optional extension이며 host support가 다를 수 있다고 설명한다. 따라서 “write once, run everywhere”는 방향성으로는 강하지만, 실제 도입에서는 각 host의 rendering, permission, OAuth, domain, CSP, fallback 차이를 점검해야 한다.

## 실무 관점에서의 해석

MCP Apps의 가장 큰 의미는 에이전트 앱의 프론트엔드를 다시 생각하게 만든다는 데 있다. 지금까지 많은 agent workflow는 “chat + tool call + text answer” 조합으로 설계되었다. 하지만 실제 업무는 텍스트만으로 끝나지 않는다. 사용자는 결과를 확인하고, 필터를 바꾸고, form을 제출하고, chart를 drill down하고, 특정 action을 승인한다.

이 interaction을 모두 자연어 turn으로만 처리하면 UX가 느려지고 모호해진다. 반대로 domain UI를 host 안으로 가져오면 사용자는 익숙한 app interaction을 유지하면서, 모델은 그 interaction을 context로 받아 다음 action을 이어갈 수 있다.

둘째, 앱 배포 전략이 바뀐다. 지금까지 회사는 사용자를 자기 웹사이트나 모바일 앱으로 데려오려 했다. MCP Apps식 세계에서는 ChatGPT, Claude, VS Code, Cursor 같은 host가 사용자의 작업 시작점이 되고, 서비스는 그 안에 필요한 UI fragment를 공급한다. 이는 SEO나 app store와는 다른 형태의 distribution channel이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/mcp-apps-run-everywhere.webp"
    alt="Slide saying An MCP App can run everywhere, showing the same calculator app across two hosts"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    18:25 전후 장면. 발표의 결론은 같은 MCP App이 LibreChat과 ChatGPT 같은 서로 다른 host에서 동작할 수 있다는 “write once, run everywhere” 방향성이다.
  </figcaption>
</figure>

셋째, agent product 팀은 backend tool만이 아니라 **interaction contract**를 설계해야 한다. tool schema, UI resource, action message, host callback, app-only tool, model-visible tool, permission, CSP가 함께 제품 표면이 된다. 단순히 “API를 MCP server로 감싼다”로는 충분하지 않다.

넷째, 디버깅과 평가도 바뀐다. UI가 host 안에서 렌더링되고 action이 host를 거쳐 다시 tool로 이어진다면, 테스트는 tool response만 검증해서는 부족하다. iframe rendering, message passing, OAuth, CSP, fallback text, host별 차이를 함께 봐야 한다. MCPJam 같은 inspector류 도구가 중요해지는 이유도 여기에 있다.

## 남는 질문

첫 번째 질문은 보안과 권한이다. 채팅 host 안에 third-party UI가 들어오면 사용자는 그것을 host의 일부로 느낄 수 있다. 따라서 시각적 boundary, provider identity, permission prompt, data flow transparency가 중요하다. MCP Apps spec이 CSP와 sandbox를 강조하는 것은 이 문제를 피할 수 없기 때문이다.

두 번째 질문은 UX 일관성이다. 발표는 predefined UI, declarative UI, fully generative UI를 spectrum으로 설명한다. 서비스가 완전히 자기 UI를 가져오면 브랜드와 기능은 보존되지만, 한 대화 안에 Booking, Airbnb, Expedia UI가 모두 섞일 수 있다. 반대로 host가 declarative UI를 재렌더링하면 일관성은 좋아지지만 provider의 identity와 세밀한 UX는 줄어든다.

세 번째 질문은 모델과 UI의 관계다. 지금의 많은 UI는 사람 click을 전제로 설계되어 있다. 그러나 발표 후반에서 말하듯, 앞으로는 모델이 view를 읽고, 버튼을 누르고, form을 채우는 방식도 중요해진다. 이 경우 UI는 사람을 위한 화면이면서 동시에 모델이 조작 가능한 action surface가 된다.

그래서 MCP Apps는 “채팅창에 예쁜 위젯을 넣는 기술”보다 넓다. 에이전트 시대의 애플리케이션이 어디에 배포되고, 누가 interaction을 소유하며, 어떤 권한 경계 안에서 UI와 모델이 협업할 것인가를 묻는 표준화 시도다.

아직 Jarvis는 아니지만, 방향은 분명하다. 앱은 더 이상 독립된 웹사이트 하나로만 존재하지 않는다. 에이전트 host 안에서 호출되고, 렌더링되고, 조작되고, 다시 tool call로 이어지는 **작은 실행 가능한 UI 조각**으로 재구성되고 있다.

Sources: https://www.youtube.com/watch?v=o-zkvb0iFDQ, https://github.com/modelcontextprotocol/ext-apps, https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx, https://github.com/MCP-UI-Org/mcp-ui, https://github.com/mcp-use/mcp-use, https://github.com/MCPJam/inspector
