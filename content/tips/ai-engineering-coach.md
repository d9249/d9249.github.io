---
title: "AI Engineer Coach는 AI 코딩 습관을 로컬 로그로 코칭하는 VS Code 대시보드다"
date: "2026-05-21T22:56:34"
description: "microsoft/AI-Engineering-Coach는 VS Code, Xcode, Claude, Codex, OpenCode, Copilot CLI의 로컬 AI 코딩 세션 로그를 읽어 생산량·안티패턴·컨텍스트 건강도·스킬 기회를 보여주는 MIT 라이선스 VS Code 확장이다."
author: "Sangmin Lee"
repository: "microsoft/AI-Engineering-Coach"
sourceUrl: "https://github.com/microsoft/AI-Engineering-Coach"
status: "Open source early preview"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "VS Code Extension"
  - "AI Coding"
  - "Developer Tools"
  - "Local Analytics"
  - "Prompt Engineering"
highlights:
  - "VS Code 확장으로 설치해 로컬 AI 코딩 세션 로그를 읽고, 요청·응답·모델·토큰·툴 호출·파일 참조·터미널 명령을 한 대시보드에서 분석한다."
  - "지원 harness는 VS Code/Insiders Local Agent, Claude, Codex, OpenCode, GitHub Copilot for Xcode, GitHub Copilot CLI이며 workspace/harness 필터가 있다."
  - "45개 내장 rule로 prompt quality, session hygiene, code review, tool mastery, context management 안티패턴을 점수화하고 editable DSL rule로 조정할 수 있다."
  - "Skill Finder와 Context Health는 반복 프롬프트를 재사용 스킬 후보로 묶고, instruction file·custom skill·agent·MCP·devcontainer 같은 agentic readiness를 점검한다."
  - "아직 VS Code Marketplace에 올라온 배포판이 아니라 source build로 VSIX를 만들어 설치해야 하며, GitHub Releases/tag도 없는 0.1.0 초기 공개 상태다."
draft: false
---

AI 코딩 도구를 오래 쓰면 “얼마나 썼는가”보다 “어떻게 쓰고 있는가”가 더 중요해진다. 큰 세션을 끝없이 끌고 가는지, 파일 컨텍스트 없이 질문하는지, AI가 만든 터미널 명령을 너무 쉽게 승인하는지, 같은 요청을 계속 반복하는지 같은 문제는 체감으로는 알기 어렵다.

`AI Engineer Coach`는 이 지점을 겨냥한 VS Code 확장이다. GitHub Copilot, Claude, Codex, OpenCode 같은 로컬 AI coding assistant의 세션 로그를 읽어 생산량, 모델/툴 사용, 안티패턴, 컨텍스트 건강도, 반복 프롬프트, 학습 과제를 하나의 대시보드로 묶는다. README는 “no data leaves your machine”과 read-only local analysis를 강조한다.

![AI Engineer Coach dashboard](/images/tips/ai-engineering-coach-dashboard.webp)

## 무엇을 하는 도구인가

저장소 `microsoft/AI-Engineering-Coach`는 TypeScript로 작성된 MIT 라이선스 VS Code extension이다. `package.json` 기준 확장 이름은 `ai-engineer-coach`, 현재 버전은 `0.1.0`, manifest의 VS Code engine 요구사항은 `^1.118.0`이다. README badge에는 VS Code 1.115+가 남아 있어 실제 설치 기준은 manifest를 보는 편이 안전하다.

핵심 흐름은 단순하다.

1. 로컬에 남아 있는 AI 코딩 세션 로그를 찾는다.
2. workspace와 harness별로 session/request를 파싱한다.
3. 모델, 토큰, 파일 참조, tool call, 편집 파일, 터미널 명령 같은 신호를 정규화한다.
4. 대시보드·rule engine·skill finder·context health·learning center에서 행동 개선 포인트로 보여준다.

공식 문서가 명시한 지원 대상은 다음과 같다.

- VS Code / VS Code Insiders의 Local Agent 로그
- Anthropic Claude CLI 세션 파일
- OpenAI Codex terminal agent 세션 기록
- OpenCode 세션 로그
- GitHub Copilot for Xcode SQLite conversation database
- GitHub Copilot CLI session state/history

즉 “Copilot 전용 사용량 차트”라기보다, 여러 AI coding harness의 로컬 흔적을 한곳에서 읽는 **AI 개발 습관 observability 도구**에 가깝다.

## 대시보드에서 보는 것

첫 화면은 practice score와 일별 활동, workspace/harness 분포를 보여준다. 점수는 다섯 축으로 나뉜다.

- **Prompt Quality**: 파일 참조, open editor, 구체성처럼 AI에게 충분한 context를 주고 있는지
- **Session Hygiene**: 너무 긴 세션, 버려진 세션, 주제 drift, 과로 패턴이 있는지
- **Code Review**: AI 산출물과 터미널 명령을 충분히 검토하고 sandbox/devcontainer를 쓰는지
- **Tool Mastery**: slash command, plan mode, skill, custom instruction, model 선택을 잘 활용하는지
- **Context Management**: context window가 과도하게 포화되거나 compaction storm이 나는지

Output 페이지는 AI-generated LoC, 언어별/모델별/workspace별/harness별 분포를 보여준다. README와 docs에 따르면 token usage tab은 존재하지만 billing data와 맞는지 검증 중이라 일시적으로 숨겨져 있다.

![AI Engineer Coach output metrics](/images/tips/ai-engineering-coach-output.webp)

## 안티패턴 rule engine

가장 흥미로운 부분은 Anti-Patterns 페이지다. 공식 문서는 내장 rule이 45개이며, prompt quality, session hygiene, code review, tool mastery, context management 영역을 커버한다고 설명한다.

예를 들면 다음 같은 신호를 잡는다.

- 파일 context 없이 너무 짧고 모호한 프롬프트를 반복하는 경우
- caps lock, profanity, frustration signal처럼 human-AI loop가 무너지는 패턴
- 너무 긴 mega session, abandoned session, 주제 drift
- auto-approved terminal, YOLO mode, no devcontainer처럼 review/sandbox가 약한 흐름
- slash command, plan mode, skill, custom instruction을 거의 쓰지 않는 흐름
- context window saturation, frequent compaction, runaway growth

Rule은 markdown frontmatter와 작은 DSL로 구성된다. UI에서 threshold를 바꾸고, 실제 로컬 세션 데이터에 live-test하고, 자연어로 새 rule을 생성하는 AI Builder도 제공한다. 이 방향은 단순한 통계 대시보드보다 “팀의 AI 사용 습관을 코드처럼 조정한다”는 쪽에 가깝다.

![AI Engineer Coach anti-pattern rules](/images/tips/ai-engineering-coach-antipatterns.webp)

## Skill Finder와 Context Health

Skill Finder는 반복 프롬프트를 묶어 “이건 custom skill로 빼도 되겠다”는 후보를 보여준다. 동시에 `awesome-copilot` 커뮤니티 카탈로그에서 관련 skill/agent를 매칭한다. 반복되는 packaging, test, review, migration 프롬프트를 개인 또는 팀의 재사용 instruction으로 끌어올리는 데 쓸 수 있다.

Context Health는 workspace가 agentic workflow에 얼마나 준비되어 있는지를 본다. 공식 문서 기준 체크 대상에는 instruction file, custom skill, custom agent, prompt template, pre/post hook, devcontainer, MCP server, context freshness가 포함된다. 또한 harness별 file reference 비율, instruction attachment rate, skill/tool usage, 평균 context량을 비교해 어떤 workspace가 “AI에게 매번 처음부터 설명하게 만드는지”를 보여준다.

![AI Engineer Coach skill finder](/images/tips/ai-engineering-coach-skill-finder.webp)

## 설치와 첫 실행

아직 VS Code Marketplace에 게시된 확장이 아니다. 공식 설치 문서는 source에서 `.vsix`를 빌드해 설치하라고 안내한다.

```bash
git clone https://github.com/microsoft/ai-engineering-coach.git
cd ai-engineering-coach
npm install
npm run package
code --install-extension ai-engineer-coach-*.vsix
```

Windows PowerShell에서는 README가 다음 형태를 제시한다.

```powershell
code --install-extension (Get-ChildItem . -Filter 'ai-engineer-coach-*.vsix' | Select-Object -First 1).FullName
```

설치 후에는 Command Palette에서 다음 명령을 실행한다.

```text
AI Engineer Coach: Open Dashboard
```

패키지 스크립트에는 `npm run build`, `npm run test`, `npm run lint`, `npm run package` 등이 있으며, 실제 확장 entry point는 `dist/extension.js`다. GitHub API 기준 현재 `/releases/latest`는 404이고 tag 목록도 비어 있었다. 따라서 팀에 배포하려면 `main` 최신을 그대로 신뢰하기보다 특정 commit을 pin하거나 내부 검증 후 VSIX를 보관하는 편이 좋다.

## 주의할 점

첫째, 이 도구가 읽는 데이터는 꽤 민감하다. 공식 문서는 read-only, local analysis, no proprietary telemetry를 강조하지만, 읽는 대상 자체에는 prompt, response, model, token count, tool call, file reference, terminal command, project path, edited file 정보가 들어갈 수 있다. 개인 로컬 대시보드로는 유용하지만, screenshot이나 share card를 외부에 올릴 때는 workspace 이름·프롬프트·코드 조각이 드러나지 않는지 확인해야 한다.

둘째, 일부 기능은 명시적으로 호출했을 때 VS Code built-in Copilot language model API를 쓴다. README는 rule compiler, skill finder, context review 같은 optional AI features를 예로 든다. “분석은 로컬”이라는 말과 “선택한 AI 기능은 Copilot LM API를 호출할 수 있다”는 경계를 구분해서 봐야 한다.

셋째, local rule/metric 파일은 신뢰 경계가 있다. 확장 entry point는 승인되지 않은 local rule/metric file이 있으면 “custom DSL expressions could be malicious”라는 경고와 함께 review/approve 흐름을 거치도록 되어 있다. 외부에서 받은 rule이나 AI Builder가 만든 rule은 바로 저장하기보다 DSL과 examples를 읽고 workspace 범위를 제한하는 편이 안전하다.

넷째, 아직 초기 공개 상태다. `package.json` 버전은 0.1.0이고, GitHub Releases/tag가 없으며, 설치도 Marketplace가 아니라 source-build VSIX다. README의 마지막 disclaimer도 이 프로젝트가 Microsoft employees의 open-source community effort이며 공식 Microsoft product나 support offering이 아니라고 밝힌다.

## 내 판단

`AI Engineer Coach`는 AI 코딩 도구를 많이 쓰는 개인 개발자나 팀에게 꽤 좋은 거울이 될 수 있다. 사용량을 과시하는 dashboard보다, “왜 세션이 지저분해지는가”, “왜 같은 프롬프트를 반복하는가”, “왜 context가 자주 터지는가”, “어떤 작업은 skill로 승격해야 하는가”를 보게 만든다는 점이 좋다.

다만 지금은 바로 marketplace에서 설치해 전사 배포할 성숙한 extension이라기보다, source에서 빌드해 자기 로컬 데이터로 실험해볼 early preview에 가깝다. AI coding session 로그를 이미 많이 쌓아둔 사람, team prompt/style guide를 다듬고 싶은 사람, agentic readiness를 점검하고 싶은 사람에게 특히 잘 맞는다. 반대로 단순히 Copilot 사용량 quota만 보고 싶은 목적이라면 더 가벼운 usage tracker가 나을 수 있다.

## 참고한 공개 자료

- [microsoft/AI-Engineering-Coach GitHub repository](https://github.com/microsoft/AI-Engineering-Coach)
- [README.md](https://github.com/microsoft/AI-Engineering-Coach/blob/main/README.md)
- [Installation docs](https://github.com/microsoft/AI-Engineering-Coach/blob/main/docs/content/getting-started/installation.md)
- [Supported Tools docs](https://github.com/microsoft/AI-Engineering-Coach/blob/main/docs/content/getting-started/supported-tools.md)
- [Anti-Patterns docs](https://github.com/microsoft/AI-Engineering-Coach/blob/main/docs/content/improve/anti-patterns.md)
- [Context Health docs](https://github.com/microsoft/AI-Engineering-Coach/blob/main/docs/content/improve/context-health.md)
- [Skill Finder docs](https://github.com/microsoft/AI-Engineering-Coach/blob/main/docs/content/improve/skill-finder.md)
- [package.json](https://github.com/microsoft/AI-Engineering-Coach/blob/main/package.json)
- [LICENSE](https://github.com/microsoft/AI-Engineering-Coach/blob/main/LICENSE)
