---
title: "AGENTS.md는 AI 코딩 에이전트에게 프로젝트 규칙을 전달하는 공용 README다"
date: "2026-05-25T23:18:33"
description: "AGENTS.md는 README 옆에 두는 표준 Markdown 규칙 파일로, 여러 AI 코딩 에이전트가 빌드·테스트·코딩 규칙을 같은 위치에서 읽게 해준다."
author: "Sangmin Lee"
repository: "agentsmd/agents.md"
sourceUrl: "https://agents.md/"
status: "Open source format"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Developer Tools"
  - "Markdown"
  - "Documentation"
highlights:
  - "AGENTS.md는 README.md를 대체하는 문서가 아니라, AI 코딩 에이전트가 읽을 빌드·테스트·코딩 규칙을 별도 Markdown 파일로 분리하는 관례다."
  - "공식 사이트는 60k개 이상 공개 프로젝트 사용 사례를 연결하고, 저장소는 MIT 라이선스의 `agentsmd/agents.md`로 공개되어 있다."
  - "정해진 YAML 스키마가 아니라 일반 Markdown이므로 팀이 실제로 쓰는 명령, 검증 순서, 보안 주의사항, PR 규칙을 짧고 실행 가능하게 적는 것이 핵심이다."
  - "루트 파일 하나로 시작하되, 모노레포에서는 하위 패키지별 `AGENTS.md`를 둘 수 있고 충돌 시 사용자 지시와 가장 가까운 파일의 우선순위를 의식해야 한다."
  - "외부에서 가져온 AGENTS.md는 곧 에이전트 행동 지침이 되므로, 숨은 명령·토큰 요구·파괴적 명령·불필요한 권한 상승을 검토한 뒤 커밋해야 한다."
draft: false
---

AI 코딩 에이전트를 여러 번 돌려보면, 모델 성능보다 “프로젝트의 암묵지”가 더 큰 병목이 될 때가 많다. 어떤 패키지 매니저를 쓰는지, 테스트는 어느 순서로 돌리는지, 생성 파일은 건드리면 안 되는지, PR 제목은 어떤 형식인지 같은 정보가 README·위키·Slack·이전 PR에 흩어져 있으면 에이전트는 매번 추측한다.

`AGENTS.md`는 이 문제를 아주 단순한 파일명으로 푸는 공개 관례다. 공식 설명처럼 README가 사람을 위한 빠른 시작 문서라면, AGENTS.md는 에이전트를 위한 README다. 프로젝트 루트나 하위 패키지에 Markdown 파일을 두고, 코딩 에이전트가 작업 전에 읽어야 할 빌드·테스트·코드 스타일·보안·PR 규칙을 적는다.

중요한 점은 “새 설정 언어”가 아니라는 것이다. 정해진 필드도, 전용 CLI도 필수는 아니다. 그래서 도입 비용은 낮지만, 내용을 대충 쓰면 그냥 또 하나의 긴 프롬프트 파일이 된다. 좋은 AGENTS.md는 사람에게도 읽히고, 에이전트에게도 바로 실행 가능한 체크리스트가 된다.

![AGENTS.md 공식 소개 이미지](/images/tips/agents-md-og.png)

## AGENTS.md 개요

공식 저장소 `agentsmd/agents.md`는 AGENTS.md를 “AI coding agents를 안내하는 단순하고 열린 형식”이라고 설명한다. 사이트는 60k개 이상 공개 프로젝트의 `AGENTS.md` 검색 결과를 예시로 연결하고, `openai/codex`, `apache/airflow`, `temporalio/sdk-java` 같은 실제 저장소의 사례를 보여준다.

저장소 자체는 MIT 라이선스이며, 별도 릴리스나 패키지로 배포되는 앱은 아니다. `package.json`은 `private: true`인 Next.js 웹사이트용 설정이고, 실제 채택 대상은 패키지가 아니라 프로젝트에 커밋하는 `AGENTS.md` 파일이다.

공식 사이트의 About 섹션은 AGENTS.md가 OpenAI Codex, Amp, Google Jules, Cursor, Factory 등 AI 소프트웨어 개발 생태계의 협업에서 나왔고, 현재는 Linux Foundation 산하 Agentic AI Foundation(AAIF)이 steward한다고 설명한다. OpenAI의 AAIF 발표도 AGENTS.md를 “README.md 옆에 두는 lightweight Markdown file”로 소개하며, 여러 도구와 저장소에서 일관된 프로젝트 지침을 제공하는 포맷으로 설명한다.

## 왜 유용한가

AGENTS.md의 장점은 거창한 기능보다 **예측 가능한 위치**에 있다.

- 사람용 README를 길게 만들지 않고, 에이전트에게 필요한 운영 지침만 따로 둘 수 있다.
- Codex, Cursor, Gemini CLI, Zed, OpenCode, Aider처럼 서로 다른 도구가 같은 파일을 재사용하거나 쉽게 연결할 수 있다.
- 테스트 명령, lint 명령, 빌드 순서, 생성 파일 금지, API 키 취급 규칙 같은 반복 지시를 매번 채팅에 붙이지 않아도 된다.
- 코드베이스와 함께 버전 관리되므로, 규칙 변경을 PR 리뷰 대상으로 만들 수 있다.
- 모노레포에서는 루트 규칙과 패키지별 규칙을 분리해 “이 디렉터리에서는 이 명령을 써라”를 더 정확히 전달할 수 있다.

특히 에이전트가 “알아서 테스트까지 돌리고 고쳐줘” 같은 일을 맡을수록, 어떤 테스트가 권위 있는지 적어둔 파일의 가치가 커진다. 에이전트가 임의로 `npm test`를 추측하는 것보다, `pnpm turbo run test --filter <package>`처럼 실제 팀이 쓰는 명령을 읽는 편이 훨씬 낫다.

## 기본 작성 패턴

가장 작은 시작은 프로젝트 루트에 `AGENTS.md`를 하나 추가하는 것이다.

```markdown
# AGENTS.md

## 프로젝트 개요
- 이 저장소는 Next.js 앱과 API 서버를 함께 가진 모노레포다.
- 패키지 매니저는 pnpm을 사용한다.

## 개발 명령
- 의존성 설치: `pnpm install`
- 개발 서버: `pnpm dev`
- 타입 체크: `pnpm typecheck`
- 테스트: `pnpm test`

## 코드 스타일
- TypeScript strict mode를 유지한다.
- 새 UI 컴포넌트는 `src/components` 아래에 둔다.
- 자동 생성 파일은 직접 수정하지 않는다.

## PR 체크리스트
- 변경한 패키지의 테스트를 먼저 실행한다.
- 사용자에게 보이는 동작이 바뀌면 문서나 스크린샷도 갱신한다.
```

핵심은 “좋은 말”보다 **검증 가능한 명령과 경계**다. `코드를 깔끔하게 작성하라`보다 `pnpm lint`, `pnpm test --filter web`, `database/migrations는 수동 편집하지 말 것`처럼 행동으로 이어지는 문장이 좋다.

## 모노레포와 우선순위

공식 FAQ는 충돌이 있을 때 명시적인 사용자 채팅 지시가 최우선이고, 그다음은 작업 파일에 가장 가까운 `AGENTS.md`가 이긴다고 설명한다. 이 규칙은 모노레포에서 특히 중요하다.

```text
repo/
  AGENTS.md                 # 공통 규칙
  apps/web/AGENTS.md         # 웹 앱 규칙
  packages/sdk/AGENTS.md     # SDK 규칙
```

이 구조에서는 루트 파일에 공통 보안·커밋·테스트 철학을 두고, 하위 파일에는 각 패키지의 실제 명령을 적는 편이 좋다. 예를 들어 웹 앱은 Playwright를 돌리고, SDK는 언어별 unit test를 돌리는 식으로 분리한다.

반대로 모든 내용을 루트 파일 하나에 몰아넣으면 에이전트가 매번 너무 많은 지시를 읽게 된다. AGENTS.md는 “컨텍스트를 늘리는 파일”이기도 하므로, 가까운 파일일수록 짧고 구체적이어야 한다.

## 다른 규칙 파일과 함께 쓸 때

이미 `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `GEMINI.md` 같은 파일을 쓰고 있다면 한 번에 모두 버릴 필요는 없다. 공식 FAQ는 기존 파일을 `AGENTS.md`로 옮기고 호환용 심볼릭 링크를 남기는 방식을 제안한다.

```bash
mv AGENT.md AGENTS.md && ln -s AGENTS.md AGENT.md
```

도구별 현실은 조금씩 다르다. OpenCode는 프로젝트 루트의 `AGENTS.md`를 주 규칙 파일로 쓰고, 없으면 `CLAUDE.md` 같은 호환 파일을 찾는 흐름을 문서화한다. Zed도 `.rules`, `.cursorrules`, `.github/copilot-instructions.md`, `AGENT.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` 등 여러 파일명을 호환 목록으로 둔다. Gemini CLI나 Aider는 설정 파일에서 읽을 파일명을 지정하는 방식으로 연결할 수 있다.

그래서 팀 표준을 만들 때는 “AGENTS.md를 canonical source로 두고, 필요한 도구에는 링크나 설정으로 연결한다”는 전략이 가장 단순하다. 도구별 파일을 모두 따로 관리하면 같은 규칙이 조금씩 갈라지고, 에이전트마다 다른 지시를 받는 문제가 생긴다.

## 무엇을 넣으면 좋은가

실무용 AGENTS.md에는 보통 다음 항목이 쓸모 있다.

- **검증 명령**: 전체 테스트, 빠른 테스트, 타입 체크, lint, 포맷 명령
- **변경 금지 영역**: 생성 코드, lockfile 정책, 마이그레이션 파일, vendored code
- **작업 순서**: 수정 전 재현, 테스트 추가, 구현, 빌드, 스크린샷 확인
- **보안 규칙**: 비밀키 출력 금지, 실제 고객 데이터 사용 금지, 외부 API 호출 전 확인
- **리뷰 기준**: PR 제목 형식, changelog 필요 조건, 스냅샷 갱신 조건
- **모노레포 팁**: 패키지 이름 찾는 법, 특정 앱만 테스트하는 명령, 공통 라이브러리 위치

가능하면 “항상/먼저/절대”를 섞어 경계를 분명히 하는 것이 좋다. 예를 들어 `절대 production DB에 연결하지 말 것`, `먼저 failing test를 재현할 것`, `변경 후 pnpm typecheck를 실행할 것` 같은 문장은 에이전트가 행동 우선순위를 잡는 데 도움이 된다.

## 주의할 점

AGENTS.md는 편하지만, 에이전트에게 읽히는 **프롬프트 표면**이기도 하다. 외부 프로젝트에서 복사한 파일, 자동 생성된 파일, 블로그에서 가져온 템플릿을 그대로 넣으면 숨은 지시나 위험한 명령도 같이 들어갈 수 있다.

특히 다음은 피하는 편이 좋다.

- 토큰, 계정명, 내부 URL 같은 민감 정보를 직접 적기
- `rm -rf`, 배포, 데이터 삭제처럼 되돌리기 어려운 명령을 기본 검증 명령처럼 적기
- “테스트 실패는 무시해도 된다”처럼 품질 게이트를 약화하는 문장
- 오래된 패키지 명령이나 사라진 디렉터리 구조를 방치하기
- 여러 도구별 규칙 파일에 서로 다른 정책을 중복 관리하기

또 하나의 함정은 너무 장황한 AGENTS.md다. 에이전트가 매번 읽는 파일이라면, 핵심 규칙은 짧게 유지하고 세부 문서는 링크로 분리하는 편이 낫다. 장기적으로는 README처럼 소유자를 정하고, 빌드·테스트·배포 방식이 바뀌는 PR에서 함께 갱신하는 문서로 취급해야 한다.

## 내 판단

이미 AI 코딩 에이전트를 팀이나 개인 프로젝트에 쓰고 있다면 AGENTS.md는 거의 비용 없이 추가할 수 있는 기본 장치다. 새 도구를 설치하는 것이 아니라, 프로젝트가 에이전트에게 매번 설명해야 하는 말을 파일로 고정하는 작업에 가깝다.

다만 “AGENTS.md가 있으면 에이전트가 안전해진다”는 식으로 과신하면 안 된다. 파일 내용이 부정확하거나 위험하면 오히려 에이전트가 그 지시를 더 열심히 따른다. 좋은 도입 순서는 간단하다. 루트에 짧은 파일을 만들고, 실제로 자주 반복하는 검증 명령과 금지 사항만 적은 뒤, 에이전트 사용 중 빠진 규칙이 보일 때마다 PR로 업데이트하자.

## 참고한 공개 자료

- [AGENTS.md 공식 사이트](https://agents.md/)
- [agentsmd/agents.md GitHub repository](https://github.com/agentsmd/agents.md)
- [OpenAI: Agentic AI Foundation announcement](https://openai.com/index/agentic-ai-foundation/)
- [OpenCode rules documentation](https://opencode.ai/docs/rules/)
- [Zed AI rules documentation](https://zed.dev/docs/ai/rules)
