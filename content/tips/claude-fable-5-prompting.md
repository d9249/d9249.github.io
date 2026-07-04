---
title: "Claude Fable 5 프롬프팅 가이드는 더 똑똑한 모델에 맞춰 하네스를 다시 설계하라는 체크리스트다"
date: "2026-07-04T16:29:09"
description: "Anthropic의 Prompting Claude Fable 5 문서는 장기 실행, effort, adaptive thinking, refusal/fallback, 메모리와 서브에이전트 설계를 모델 교체 체크리스트로 묶어준다."
author: "Sangmin Lee"
repository: "Anthropic Claude Platform Docs"
sourceUrl: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5"
status: "Official documentation"
license: "Proprietary / Anthropic Terms"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Claude"
  - "Prompt Engineering"
  - "AI Agents"
  - "LLM Integration"
  - "Anthropic"
highlights:
  - "Anthropic의 공식 Prompting Claude Fable 5 가이드는 모델 교체를 프롬프트 문구 변경이 아니라 장기 실행 하네스, 진행 표시, 비동기 확인, 메모리 전략까지 포함한 마이그레이션으로 본다."
  - "Fable 5는 긴 규칙과 방어적 가드레일을 더 쌓기보다, 충분히 알면 행동하고 결과를 먼저 말하며 불필요한 리팩터링을 피하라는 짧은 목적 지시에 더 잘 맞는다."
  - "`effort`를 high/xhigh/max/medium/low로 나눠 지능·지연 시간·비용을 조절하고, adaptive thinking이 기본인 모델 특성상 기존 extended thinking budget 전제를 다시 점검해야 한다."
  - "Claude Fable 5의 `stop_reason: \"refusal\"`은 HTTP 오류가 아니라 정상 응답으로 올 수 있으므로, API 통합에서는 refusal 감지와 Claude Opus 4.8 같은 fallback 경로를 별도 처리해야 한다."
  - "브라우저에서 읽는 공식 문서이므로 OS 네이티브 앱은 아니지만, macOS·Linux·Windows 어느 개발 환경에서도 Claude API/에이전트 하네스 설계 참고자료로 쓸 수 있다."
draft: false
---

Claude Fable 5를 쓰기 시작할 때 가장 쉬운 실수는 “기존 프롬프트는 그대로 두고 모델 이름만 바꾸는 것”이다. Anthropic의 공식 `Prompting Claude Fable 5` 문서는 오히려 반대로 말한다. 모델이 더 오래 생각하고, 더 긴 작업을 버티며, 더 많은 도구·서브에이전트를 다룰 수 있게 되었으니 **프롬프트와 실행 하네스를 함께 줄이고 다시 설계하라**는 쪽에 가깝다.

이 문서는 설치형 앱이나 오픈소스 저장소는 아니다. 하지만 Claude API, Claude Code류 에이전트, 사내 LLM 하네스, 장기 실행 자동화 시스템을 운영하는 팀이라면 체크리스트처럼 읽을 만하다. PyTorchKR의 소개 글은 이 가이드의 핵심을 한국어로 잘 요약하고 있고, 실제 적용 기준은 Anthropic의 공식 문서에서 확인하는 편이 안전하다.

조사 시점 기준 공식 모델 문서는 `claude-fable-5`를 Anthropic의 가장 강력한 일반 공개 모델로 설명하고, `claude-mythos-5`는 같은 능력을 공유하지만 Fable의 safety classifier가 없는 제한 공개 모델로 구분한다. 두 모델은 기본 1M token context window와 최대 128k output을 전제로 소개되며, Fable 5는 Claude API, Claude Platform on AWS, Amazon Bedrock, Google Cloud/Vertex AI, Microsoft Foundry에서 일반 제공되는 것으로 안내된다.

![Claude Fable 5 prompting migration map](/images/tips/claude-fable-5-prompting-map.svg)

## 무엇을 다루는 문서인가

`Prompting Claude Fable 5`는 전통적인 “좋은 프롬프트 문구 모음”이라기보다, Fable 5/ Mythos 5 세대에서 바뀐 운영 전제를 정리한 문서다. 핵심 축은 다음 네 가지다.

| 축 | 실제로 점검할 것 |
|---|---|
| 프롬프트 | 과하게 장황한 규칙, 이전 모델을 붙들기 위해 넣었던 반복 지시, 불필요한 방어 문구를 걷어낼 수 있는가 |
| 실행 하네스 | 요청 하나가 몇 분, 자율 실행이 몇 시간까지 이어져도 timeout·streaming·progress indicator·비동기 확인이 버티는가 |
| 비용/지연 시간 | 모든 작업을 높은 `effort`로 돌리는 대신, 작업 난이도별 effort 정책을 둘 수 있는가 |
| 안전/폴백 | `stop_reason: "refusal"`을 API 오류와 구분하고, fallback 모델 또는 재시도 정책을 구현했는가 |

즉 “Fable 5용 prompt template”을 하나 복사해 넣는 문서가 아니다. 기존 하네스가 Opus 4.x나 Sonnet 계열의 지연 시간, 사고 방식, 거부 응답 형태에 맞춰져 있다면 어디부터 바꿔야 하는지 짚어주는 문서다.

## 왜 유용한가

첫 번째 포인트는 **프롬프트를 더 짧게 만들 근거**를 준다는 점이다. Anthropic은 Fable 5가 instruction following이 더 좋아졌기 때문에, 원하는 행동을 세세하게 열거하기보다 목적 지향적인 짧은 지시가 효과적이라고 설명한다. 예를 들어 “충분한 정보가 있으면 행동하라”, “이미 확정된 사실을 다시 논쟁하지 말라”, “추천을 하라, 모든 선택지를 나열하지 말라” 같은 식이다.

두 번째는 **장기 실행을 기본값으로 보는 관점**이다. Fable 5는 높은 effort에서 컨텍스트 수집, 구현, 자체 검증까지 한 요청 안에서 오래 수행할 수 있다. 기존 클라이언트가 짧은 HTTP timeout, blocking UI, 중간 진행 표시 없음, 작업 완료 후에만 상태를 보는 구조라면 모델 성능을 제대로 쓰기 전에 운영 UX가 먼저 깨질 수 있다.

세 번째는 **effort가 하네스의 정책 변수가 된다는 점**이다. 공식 `Effort` 문서는 `effort`를 output_config 아래에서 설정하는 토큰 사용 성향 신호로 설명한다. 기본값은 `high`이고, `xhigh`는 긴 agentic/coding 작업, `max`는 최대 능력, `medium`/`low`는 빠른 반복과 비용 절감에 맞다. 중요한 건 effort가 텍스트뿐 아니라 tool call과 function argument까지 포함한 전체 응답 토큰 성향에 영향을 준다는 점이다.

## 적용할 때 볼 체크리스트

Fable 5로 기존 워크로드를 옮긴다면 나는 다음 순서로 보는 편이 좋다고 본다.

1. **기존 시스템 프롬프트를 먼저 청소한다.** 이전 모델이 자주 놓치던 행동을 막기 위해 덕지덕지 붙인 규칙이 지금도 필요한지 확인한다. Fable 5에서는 너무 많은 규칙이 오히려 과도한 계획, 필요 없는 리팩터링, 장황한 보고를 유도할 수 있다.
2. **작업 유형별 effort 정책을 둔다.** 코드베이스 전체 조사, 장기 디버깅, 며칠짜리 agent run은 `xhigh`나 `max` 후보지만, 단순 요약·분류·짧은 대화형 작업까지 같은 설정으로 돌릴 필요는 없다.
3. **장기 실행 UX를 설계한다.** streaming, progress indicator, background job, cron-style status check, user-visible checkpoint가 없으면 “모델이 똑똑한데 사용자는 멈춘 것처럼 보이는” 상황이 생긴다.
4. **메모리와 컨텍스트 갱신 방식을 정한다.** 장기 작업에서는 무엇을 transcript에 남기고, 무엇을 외부 memory/store에 쓰고, 언제 압축·요약할지 정해야 한다.
5. **서브에이전트 위임 규칙을 만든다.** Fable 5는 병렬 subagent dispatch와 장시간 협업에 강해졌다고 소개되지만, subagent에 어떤 context를 넘기고 언제 개입할지는 여전히 하네스 책임이다.
6. **거부 응답을 정상 응답 경로로 처리한다.** `stop_reason: "refusal"`은 HTTP 200으로 올 수 있으므로, content가 비었는지 같은 우회적 검사보다 stop_reason을 직접 보아야 한다.

## API 통합에서 특히 조심할 점

Claude Fable 5와 Mythos 5에는 기존 통합이 가정하던 것과 다른 부분이 있다. 공식 문서 기준 adaptive thinking은 Fable 5/Mythos 5에서 항상 켜져 있고, `thinking: {"type": "disabled"}`는 지원되지 않는다. 예전처럼 extended thinking budget을 직접 세팅하는 방식이 아니라 `effort`로 사고 깊이와 토큰 사용 성향을 조절하는 쪽으로 바뀐다.

거부 처리도 별도 구현 포인트다. Fable 5는 offensive cybersecurity, 생물학·생명과학, reasoning extraction 같은 영역에서 safety classifier가 요청을 거절할 수 있다. `Refusals and fallback` 문서는 거부를 API 오류가 아니라 정상 응답으로 다루며, `stop_reason: "refusal"`을 기준으로 감지하라고 안내한다. 일부 경우에는 Claude Opus 4.8 같은 fallback 모델로 재시도하는 서버 측/클라이언트 측/수동 fallback 패턴을 쓸 수 있다.

모델 문서의 데이터 보존 조건도 놓치면 안 된다. `Introducing Claude Fable 5 and Claude Mythos 5` 문서는 두 모델이 30일 data retention을 가지며 zero data retention 대상이 아니라고 설명한다. 조직이 ZDR, 규제, 고객 데이터 처리 조건을 엄격히 본다면 “Claude의 최신 고성능 모델”이라는 이유만으로 바로 production 경로에 넣지 말고 model-specific retention requirement를 먼저 확인해야 한다.

## 어떻게 읽으면 좋은가

이 문서는 한 번 읽고 끝낼 가이드보다, 기존 에이전트 하네스를 리뷰할 때 옆에 두는 점검표로 쓰기 좋다. 특히 다음 질문에 답해보면 실전 적용 포인트가 빨리 드러난다.

- 사용자에게 보이는 응답은 결과를 먼저 말하는가, 아니면 매번 계획과 선택지를 길게 늘어놓는가?
- 버그 수정 요청에서 모델이 주변 정리·추상화·미래 대비까지 해버리지 않도록 충분히 범위를 좁혔는가?
- 장기 작업이 진행 중일 때 사용자가 “멈췄다”고 느끼지 않도록 progress와 checkpoint를 제공하는가?
- refusal, partial output, fallback, billing을 일반 API error와 분리해 관측하는가?
- subagent가 독립 작업을 맡을 때 충분한 context와 검증 기준을 받고, 부모 agent가 중간 개입할 수 있는가?

브라우저에서 보는 공식 문서라서 이 tips 사이트의 `macos-linux`, `winos` 플랫폼 분류는 “OS 네이티브 앱 지원”이 아니라 “어느 데스크톱 개발 환경에서도 참고 가능한 Claude API 문서”라는 뜻으로 읽어야 한다.

## 내 판단

Claude Fable 5 프롬프팅 가이드는 프롬프트 엔지니어링 문서라기보다 **차세대 agent runtime 운영 문서**에 가깝다. 단순 챗봇 프롬프트를 다듬는 사람보다, Claude API 위에 장기 실행 도구, 코딩 에이전트, 백그라운드 작업, subagent orchestration, enterprise workflow를 얹는 팀에게 더 유용하다.

반대로 짧은 질의응답이나 단순 콘텐츠 생성만 한다면 문서 전체를 구현할 필요는 없다. 그 경우에는 `effort`를 낮춰 빠른 반복을 확보하고, “결과 먼저, 불필요한 확장 금지” 정도의 짧은 시스템 지시만 가져와도 충분하다. 하지만 기존 에이전트가 복잡해질수록 이 문서의 진짜 메시지는 선명하다. **모델이 더 똑똑해졌다면, 프롬프트를 더 무겁게 만드는 대신 실행 환경을 더 성숙하게 만들어야 한다.**

## 참고한 공개 자료

- [Prompting Claude Fable 5 — Anthropic Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5)
- [Introducing Claude Fable 5 and Claude Mythos 5 — Anthropic Claude Platform Docs](https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5)
- [Effort — Anthropic Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/effort)
- [Refusals and fallback — Anthropic Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback)
- [Adaptive thinking — Anthropic Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)
- [PyTorchKR 소개 글](https://discuss.pytorch.kr/t/anthropic-claude-fable-5/11062)
