---
title: "System Prompts Leaks는 주요 AI 제품의 시스템 프롬프트를 추적하는 공개 카탈로그다"
date: "2026-05-25T16:47:38"
description: "asgeirtj/system_prompts_leaks는 Claude, ChatGPT, Gemini, Grok, Perplexity, Copilot 등 여러 AI 제품의 시스템 프롬프트와 도구 지시문을 Markdown으로 모아 둔 연구·분석용 공개 카탈로그입니다."
author: "Sangmin Lee"
repository: "asgeirtj/system_prompts_leaks"
sourceUrl: "https://github.com/asgeirtj/system_prompts_leaks"
status: "Open source prompt catalog"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Prompt Engineering"
  - "LLM"
  - "Reference"
  - "Security"
highlights:
  - "Anthropic, OpenAI, Google, xAI, Perplexity, Misc 폴더로 나누어 모델·제품별 시스템 프롬프트 문서를 찾아볼 수 있다."
  - "README는 최근 업데이트 표와 벤더별 인덱스를 제공하고, CONTRIBUTING은 원문 프롬프트를 요약 없이 추가하는 방식을 안내한다."
  - "조사 시점 기준 212개의 Markdown 문서와 1개의 JSON 도구 문서가 들어 있는 문서형 저장소이며, 별도 패키지나 실행 바이너리는 없다."
  - "Release/tag가 아니라 main 브랜치 커밋 단위로 계속 갱신되는 카탈로그라서, 연구·비교에 쓰려면 반드시 커밋 해시를 고정해야 한다."
  - "MIT 저장소지만 포함된 프롬프트의 출처·권리·최신성은 제품별로 다를 수 있어, 재배포·상업 활용·평가 데이터셋화에는 별도 주의가 필요하다."
draft: false
---

AI 제품을 오래 쓰다 보면 “모델이 똑똑해서 그런가, 아니면 뒤에 붙은 시스템 지시문이 그렇게 설계돼 있어서 그런가?”라는 질문이 자주 생긴다. 답은 보통 둘 다다. 같은 모델이라도 ChatGPT, Claude.ai, Codex, Gemini CLI, Copilot, Perplexity 같은 제품 표면에서는 도구 사용 규칙, 안전 정책, UI별 역할, 말투, 메모리, 브라우징 제한이 서로 다르게 주입된다.

`System Prompts Leaks`는 이런 제품별 시스템 프롬프트를 한 저장소에 모아 둔 **문서형 카탈로그**다. 설치해서 실행하는 앱이라기보다, 연구자·프롬프트 엔지니어·AI 제품 기획자·에이전트 개발자가 “실제 제품 프롬프트는 어떤 구조로 길어지고 있는가”를 빠르게 훑어볼 수 있는 참고 자료에 가깝다.

조사 시점 기준 저장소 `asgeirtj/system_prompts_leaks`는 GitHub API와 checked-in `LICENSE` 모두 MIT로 표시된다. 다만 이 라이선스가 저장소 기여물의 라이선스라는 점과, 각 파일 안의 프롬프트가 여러 상용 제품에서 온 텍스트일 수 있다는 점은 분리해서 봐야 한다. “읽고 구조를 배우는 참고 자료”와 “그대로 복제해 제품에 넣는 재사용 자료”는 위험 수준이 다르다.

![System Prompts Leaks repository](https://opengraph.githubassets.com/system-prompts-leaks/asgeirtj/system_prompts_leaks)

## 무엇이 들어 있나

README는 저장소를 벤더·제품군별 인덱스로 구성한다. 상위 폴더는 `Anthropic/`, `OpenAI/`, `Google/`, `xAI/`, `Perplexity/`, `Misc/`로 나뉘고, 각 폴더 아래에 모델명·제품명 단위의 Markdown 파일이 들어 있다.

조사 시점에 얕은 클론으로 확인한 문서 수는 다음과 같다.

- `Anthropic/`: 65개 Markdown 문서
- `OpenAI/`: 82개 Markdown 문서
- `Google/`: 22개 Markdown 문서와 1개 JSON 도구 문서
- `xAI/`: 11개 Markdown 문서
- `Perplexity/`: 3개 Markdown 문서
- `Misc/`: 27개 Markdown 문서

README의 “Recently Updated” 표는 GPT-5.5, Perplexity Computer, VS Code Copilot Agent, Docker Gordon AI, Gemini 3.5 Flash, Antigravity CLI, Zed AI, Grok Expert 같은 최근 추가 항목을 링크한다. 하단에는 Claude, ChatGPT/OpenAI, Gemini, Grok, Perplexity, 기타 제품 인덱스가 이어진다.

특이한 점은 `Anthropic/Official/` 같은 공식 문서 기반 항목과, 제품에서 추출됐다고 설명되는 raw/human-readable 항목이 같은 저장소 안에 공존한다는 점이다. 그래서 파일을 읽을 때는 “공식 문서의 공개 시스템 카드인지”, “사용자 관찰·추출본인지”, “도구 정의 JSON인지”를 구분하는 편이 좋다.

## 왜 유용한가

이 저장소의 가치는 특정 프롬프트 하나를 복사하는 데 있지 않다. 더 유용한 지점은 여러 제품의 시스템 메시지를 나란히 보며 **제품화된 AI의 설계 패턴**을 읽는 것이다.

예를 들어 이런 질문에 답을 찾기 좋다.

- ChatGPT, Claude, Gemini 계열은 도구 호출 규칙을 어떤 식으로 설명하는가?
- 코딩 에이전트는 파일 시스템, 터미널, 리뷰, 계획 모드를 어떻게 분리하는가?
- “말투/personality”와 “정책/safety”와 “도구 schema”가 실제 프롬프트 안에서 어떤 순서로 놓이는가?
- 같은 벤더라도 웹 앱, API, CLI, IDE 통합, 모바일 앱의 시스템 지시문은 어떻게 달라지는가?
- 긴 시스템 프롬프트가 모델 행동을 제약하는 방식과, 오래된 프롬프트가 빠르게 낡는 지점은 무엇인가?

프롬프트 엔지니어링 관점에서는 제목, 역할 정의, 우선순위 규칙, 도구 사용 전제, 금지사항, 사용자 맥락 삽입 위치를 비교하는 레퍼런스로 쓸 수 있다. AI 에이전트 개발 관점에서는 Codex, Claude Code, Gemini CLI, Copilot 계열 항목을 보며 “에이전트 런타임이 모델에게 어떤 운영 규칙을 주입하는가”를 관찰할 수 있다.

## 읽는 방법

별도 패키지는 없다. 웹에서 바로 보거나, 특정 시점의 내용을 고정하고 싶다면 Git으로 클론해서 커밋 해시를 기록하면 된다.

```bash
git clone --depth=1 https://github.com/asgeirtj/system_prompts_leaks
cd system_prompts_leaks
git rev-parse HEAD
```

관심 제품을 찾을 때는 README 인덱스에서 시작하는 편이 가장 빠르다.

```bash
# 예: 코딩 에이전트 관련 항목 찾기
rg "Codex|Claude Code|Gemini CLI|Copilot|Cursor|OpenCode" README.md Anthropic OpenAI Google Misc

# 예: 도구 정의나 JSON 항목 확인
find . -name '*.json' -o -name '*tool*' -o -name '*tools*'
```

논문, 내부 리서치 노트, 벤치마크 데이터셋에 인용할 때는 반드시 다음 정보를 함께 남기는 게 좋다.

- 저장소 URL
- 파일 경로
- 커밋 해시
- 조회 날짜
- 해당 파일이 official 공개 문서인지, 비공식 추출본인지에 대한 구분

Release나 tag가 없는 저장소라서 `main` 브랜치의 내용은 언제든 바뀔 수 있다. 실제로 GitHub API 기준 최근 push도 매우 활발하다. “현재 프롬프트”가 아니라 “이 커밋에서 관찰한 프롬프트”로 다루는 게 안전하다.

## 활용 포인트

내가 볼 때 이 저장소는 다음 네 가지 용도로 특히 좋다.

첫째, **AI 제품 UX 연구**다. 시스템 프롬프트는 제품팀이 모델에게 기대하는 역할 정의서다. 어떤 제품은 안전·정책을 길게 쓰고, 어떤 제품은 도구 사용 절차와 실패 처리에 더 많은 토큰을 쓴다. 이를 비교하면 제품의 우선순위가 보인다.

둘째, **에이전트 설계 참고**다. 코딩 에이전트나 브라우저 에이전트를 만들 때 “계획 먼저 세우기”, “사용자 승인 없이 위험한 명령 금지”, “도구 결과를 근거로 답하기”, “파일 변경 후 테스트하기” 같은 운영 규칙을 어떻게 문서화하는지 볼 수 있다.

셋째, **평가·레드팀 컨텍스트**다. 모델이 특정 환경에서 왜 특정 방식으로 거절하거나 우회하거나 도구를 호출하는지 분석할 때, 앱 레이어 프롬프트를 함께 보면 원인 분해가 쉬워진다. 단, 이때도 프롬프트 자체를 공격 도구처럼 재사용하기보다 행동 분석의 배경 자료로 쓰는 편이 좋다.

넷째, **프롬프트 유지보수 사례집**이다. 긴 시스템 프롬프트는 빠르게 낡는다. 오래된 모델명, 폐기된 도구, UI별 예외, 안전 정책 업데이트, personality 변형이 어떻게 누적되는지 보면, 자체 에이전트 프롬프트도 버전 관리와 changelog가 필요하다는 점을 체감할 수 있다.

## 주의할 점

가장 중요한 caveat는 **출처와 권리**다. 저장소 라이선스는 MIT로 확인되지만, 각 프롬프트 텍스트가 어떤 경로로 확보됐는지, 원 제품 약관상 재사용이 허용되는지, 최신 버전과 일치하는지는 파일마다 다를 수 있다. 공개 블로그나 오픈소스 프로젝트에 긴 프롬프트 전문을 그대로 재배포하는 용도라면 법무·정책 검토가 필요하다.

둘째, 이 저장소는 공식 벤더 문서가 아니다. README에 The Washington Post 언급과 많은 GitHub star가 있어도, 개별 파일의 진위·완전성·최신성을 보증하지는 않는다. 특히 상용 AI 제품은 UI, 계정 등급, 지역, 실험 플래그, 날짜에 따라 시스템 메시지가 달라질 수 있다.

셋째, 프롬프트를 그대로 따라 쓰면 제품 설계가 아니라 **프롬프트 카고 컬트**가 되기 쉽다. 다른 회사의 시스템 지시문은 그 제품의 도구, 정책, UX, 리스크 모델에 맞춰진 것이다. 자체 에이전트에 가져올 때는 구조와 원칙만 추출하고, 권한 모델·데이터 경계·사용자 승인 흐름은 직접 설계해야 한다.

넷째, prompt leak 자료는 보안 연구와 악용의 경계에 놓인다. 방어적 분석, 투명성, 비교 연구에는 도움이 되지만, 특정 제품의 정책 우회나 모방 서비스를 만들기 위한 원문 복제에는 적합하지 않다. 내부 문서화나 데이터셋화에서는 접근 권한과 배포 범위를 좁히는 편이 안전하다.

다섯째, 저장소에는 실행 코드나 검증 도구가 거의 없다. Markdown 카탈로그이므로 “설치해서 자동으로 검증한다”는 기대보다는, 사람이 읽고 비교하고 출처를 확인하는 참고 문헌으로 접근하는 게 맞다.

## 내 판단

`System Prompts Leaks`는 일반 사용자에게 추천할 “앱”은 아니지만, AI 제품을 만들거나 에이전트 런타임을 설계하는 사람에게는 꽤 흥미로운 레퍼런스다. 특히 여러 벤더의 시스템 프롬프트를 한 화면에서 비교하면, 최근 AI 제품이 모델 성능만이 아니라 **시스템 메시지, 도구 권한, 정책, UI 맥락**의 조합으로 작동한다는 점이 분명해진다.

다만 활용 방식은 조심스러워야 한다. 내 기준 좋은 사용법은 “프롬프트 전문을 복사한다”가 아니라 “구조를 읽고, 패턴을 분해하고, 내 제품의 권한·보안·사용자 경험에 맞게 다시 설계한다”다. 연구 노트나 팀 내부 리뷰에서는 커밋 해시를 고정하고, 공개 글에서는 필요한 짧은 인용과 링크 중심으로 다루는 편을 권한다.

## 참고한 공개 자료

- [asgeirtj/system_prompts_leaks GitHub repository](https://github.com/asgeirtj/system_prompts_leaks)
- [System Prompts Leaks README](https://github.com/asgeirtj/system_prompts_leaks/blob/main/README.md)
- [CONTRIBUTING.md](https://github.com/asgeirtj/system_prompts_leaks/blob/main/CONTRIBUTING.md)
- [MIT LICENSE](https://github.com/asgeirtj/system_prompts_leaks/blob/main/LICENSE)
