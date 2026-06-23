---
title: "OpenCodeReview: 결정적 파이프라인을 붙인 AI 코드 리뷰 CLI"
date: "2026-06-24T01:10:29"
description: "Alibaba가 공개한 AI 코드 리뷰 CLI로, Git diff를 결정적 파이프라인과 LLM 에이전트로 나눠 라인 단위 리뷰 코멘트를 만든다."
author: "Sangmin Lee"
repository: "alibaba/open-code-review"
sourceUrl: "https://github.com/alibaba/open-code-review"
status: "Open source"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "CLI"
  - "AI Code Review"
  - "Developer Tools"
  - "GitHub Actions"
highlights:
  - "Git diff를 파일 선택·번들링·룰 매칭·라인 위치 지정 같은 결정적 단계와 LLM 에이전트 단계로 나눠 리뷰한다."
  - "NPM 패키지와 GitHub Release 바이너리를 제공하며 macOS, Linux, Windows를 모두 지원한다."
  - "`ocr review --preview`, `--from/--to`, `--commit`, `--format json`으로 로컬 점검과 CI 자동화를 함께 다룰 수 있다."
  - "Claude Code, Codex, agent skill 통합을 제공하지만 OCR 자체의 LLM 설정과 API 키 관리는 별도로 필요하다."
  - "리뷰 세션 JSONL, 로컬 viewer, telemetry content logging 설정은 코드·프롬프트 노출 위험을 함께 검토해야 한다."
draft: false
---

OpenCodeReview는 Alibaba가 공개한 AI 코드 리뷰 CLI다. 단순히 “LLM에게 diff를 던져보는” 도구라기보다, 코드 리뷰에서 꼭 고정되어야 하는 부분은 Go 기반 파이프라인으로 묶고, 의미 판단이 필요한 부분만 LLM agent에게 맡기는 쪽에 가깝다.

README 기준으로 이 프로젝트는 Alibaba 내부의 공식 AI 코드 리뷰 어시스턴트에서 출발했고, 공개 버전은 Git diff를 읽어 변경 파일을 리뷰 단위로 나누고, 파일 내용 읽기·코드베이스 검색·관련 변경 파일 확인 같은 tool-use를 통해 라인 단위 리뷰 코멘트를 생성한다. 조사 시점에는 `@alibaba-group/open-code-review` NPM 패키지와 GitHub Release 바이너리 모두 `1.5.0` 버전까지 올라와 있었다.

![OpenCodeReview highlights](/images/tips/open-code-review-highlights.png)

## 어떤 도구인가

OpenCodeReview의 핵심은 **결정적 엔지니어링 + LLM agent** 조합이다. 프로젝트가 문제로 보는 지점은 범용 coding agent가 큰 changeset에서 일부 파일만 보거나, 코멘트 위치가 어긋나거나, prompt/skill 변화에 따라 리뷰 품질이 흔들리는 상황이다.

이를 줄이기 위해 OCR은 다음 단계를 모델 바깥에서 강하게 제약한다.

- 리뷰 대상 파일을 고르고 필터링한다.
- 관련 파일을 하나의 번들로 묶어 sub-agent 단위로 병렬 리뷰한다.
- 파일 경로나 타입에 맞는 review rule을 선택한다.
- AI가 만든 코멘트를 별도 positioning/reflection 단계로 다시 보정한다.

LLM agent는 이 위에서 full file 읽기, code search, 변경 파일 간 cross-reference, semantic issue 판단을 담당한다. 그래서 “범용 agent에게 코드 리뷰 스킬을 넣는 방식”보다 더 좁고 반복 가능한 리뷰 루프를 지향한다.

## 설치와 첫 실행

가장 간단한 설치 경로는 NPM이다.

```bash
npm install -g @alibaba-group/open-code-review
```

설치 후 전역 명령은 `ocr`이다. GitHub Release 바이너리도 제공되며, macOS/Linux에서는 설치 스크립트가 현재 OS·아키텍처에 맞는 바이너리를 받고 `sha256sum.txt`로 체크섬을 검증한다.

```bash
curl -fsSL https://raw.githubusercontent.com/alibaba/open-code-review/main/install.sh | sh
```

Windows 사용자는 Release 페이지에서 `opencodereview-windows-amd64.exe` 또는 `opencodereview-windows-arm64.exe`를 직접 내려받아 PATH 안의 디렉터리에 두는 방식이 안내되어 있다. 소스 빌드는 `make build`로 가능하다.

OCR은 자체 LLM 설정이 먼저 필요하다. 대화형 설정은 다음 흐름이다.

```bash
ocr config provider
ocr config model
ocr llm test
```

환경 변수 기반으로도 설정할 수 있다.

```bash
export OCR_LLM_URL=https://api.anthropic.com/v1/messages
export OCR_LLM_TOKEN=your-api-key-here
export OCR_LLM_MODEL=claude-opus-4-6
export OCR_USE_ANTHROPIC=true
```

설정 파일은 기본적으로 `~/.opencodereview/config.json`에 저장된다. Anthropic Messages API와 OpenAI Chat Completions 호환 API를 모두 다루고, README에는 Anthropic, OpenAI, DashScope, DeepSeek, Z.AI와 custom provider 흐름이 언급되어 있다.

![OpenCodeReview provider setup](/images/tips/open-code-review-providers.jpg)

## 실제 사용 흐름

로컬 작업 트리 전체를 리뷰하려면 Git repository 안에서 실행한다.

```bash
ocr review
```

리뷰 범위를 좁히는 명령도 있다.

```bash
# 두 ref 비교
ocr review --from main --to feature-branch

# 단일 commit 리뷰
ocr review --commit abc123

# LLM 호출 없이 리뷰 대상 파일 미리보기
ocr review --preview

# CI에서 파싱하기 쉬운 JSON 출력
ocr review --from origin/main --to origin/feature-branch --format json
```

`--background`로 PR 목적이나 요구사항을 넣어 리뷰 맥락을 보강할 수 있고, `--concurrency`로 파일별 병렬 처리 수를 조절할 수 있다. 기본 명령이 staged/unstaged/untracked 변경을 모두 포함하는 workspace mode라는 점은 특히 기억할 만하다. 특정 범위만 보고 싶으면 `--from/--to`, `--commit`, 또는 preview를 먼저 쓰는 편이 안전하다.

## 에이전트와 CI에 붙이는 방식

OpenCodeReview는 단독 CLI뿐 아니라 agent workflow에 넣는 경로도 제공한다.

```bash
npx skills add alibaba/open-code-review --skill open-code-review
```

Claude Code 쪽은 plugin marketplace 명령을 제공하고, Codex 쪽은 repository를 plugin marketplace로 추가한 뒤 `@Open Code Review review my current changes`처럼 호출하는 흐름을 문서화해 두었다. 다만 이 통합은 Codex나 Claude의 내부 모델 설정을 대신 쓰는 구조가 아니다. 결국 로컬 `ocr` CLI가 실행되고, OCR 자체의 LLM endpoint/API key/model 설정이 먼저 되어 있어야 한다.

CI 예시는 GitHub Actions와 GitLab CI 디렉터리에 들어 있다. GitHub Actions 예시는 PR 생성/업데이트 또는 PR 코멘트 트리거에서 OCR을 설치하고, `ocr review --from origin/<base> --to <head_sha> --format json` 결과를 GitHub Pull Request Review API로 inline comment에 올리는 구조다.

## 벤치마크는 어떻게 읽어야 하나

프로젝트 README는 50개 인기 오픈소스 저장소의 200개 실제 PR, 10개 언어, 80명 이상 시니어 엔지니어 교차 검증으로 구성한 benchmark를 제시한다. 핵심 메시지는 OpenCodeReview가 같은 기반 모델을 쓰는 범용 agent 대비 precision/F1과 토큰 효율을 끌어올렸다는 것이다.

![OpenCodeReview benchmark](/images/tips/open-code-review-benchmark.png)

다만 README도 recall은 범용 agent보다 낮을 수 있다고 설명한다. 이건 “모든 결함을 최대한 많이 찾는 도구”라기보다, CI나 PR 리뷰에서 사람이 확인할 만한 **고신뢰 코멘트**를 줄이는 방향에 가까운 설계다. 그래서 도입 판단도 benchmark 숫자를 절대값으로 보기보다, 실제 팀 repo에서 preview → 제한된 PR → 사람 리뷰와 비교하는 순서가 좋다.

## 주의할 점

첫째, 코드와 diff가 외부 LLM endpoint로 나갈 수 있다. OpenCodeReview는 model endpoint를 사용자가 고르는 구조이므로 사내 gateway, private deployment, self-hosted OpenAI-compatible API를 붙일 수 있지만, 실제 데이터 경로는 설정한 endpoint와 provider 정책에 좌우된다.

둘째, 인증 정보와 세션 로그의 위치를 알아야 한다. `~/.opencodereview/config.json`에는 provider API key나 legacy `llm.auth_token`이 들어갈 수 있고, 리뷰 실행 기록은 `$HOME/.opencodereview/sessions/<encoded-repo-path>/<session-id>.jsonl` 형태로 저장된다. 이 세션 JSONL에는 LLM request/response와 코드 리뷰 맥락이 들어갈 수 있으므로, 프로젝트 경로·코드·프롬프트가 로컬 로그에 남는다고 보는 편이 안전하다.

셋째, `ocr viewer`는 세션 JSONL을 HTTP로 보여준다. 소스에는 DNS rebinding 방지를 위한 Host header allowlist가 들어 있고 README도 wildcard bind나 non-loopback hostname을 쓸 때 `OCR_VIEWER_ALLOWED_HOSTS`를 설정하라고 안내한다. 사내 네트워크에서 열어둘 때는 bind address와 허용 host를 보수적으로 잡아야 한다.

넷째, telemetry는 기본값이 disabled지만, 켜면 console 또는 OTLP export를 사용할 수 있다. 특히 `telemetry.content_logging` 또는 `OCR_CONTENT_LOGGING=1`은 prompt/response 내용을 telemetry에 포함할 수 있으므로, 운영 환경에서는 별도로 리뷰해야 한다.

다섯째, CI 예시는 편리하지만 권한 설계를 그대로 복사하면 위험할 수 있다. GitHub Actions 예시는 fork PR secret 접근을 위해 `pull_request_target`을 설명하므로, 실제 적용 전에는 checkout 대상, token 권한, comment posting 권한, LLM secret 노출 가능성을 팀 보안 기준으로 점검해야 한다.

## 내 판단

OpenCodeReview는 “AI가 코드 리뷰를 완전히 대신한다”는 식으로 쓰기보다, 사람이 보기 전에 반복적인 위험 신호를 정리해 주는 **pre-review layer**로 볼 때 가장 설득력이 있다. 큰 PR에서 파일 선택, rule routing, line positioning을 모두 prompt에 맡기고 싶지 않은 팀이라면 특히 맞다.

개인 개발자는 `ocr review --preview`와 `ocr review --commit ... --audience agent`로 좁게 써보는 정도가 좋고, 플랫폼 팀은 JSON 출력과 CI 예시를 바탕으로 사내 LLM gateway·룰 파일·PR 코멘트 정책을 함께 설계하는 편이 좋다. 반대로 LLM endpoint, 로컬 로그, CI secret 모델을 아직 정리하지 않은 팀이라면 바로 merge gate로 넣기보다는 실험 job부터 시작하는 쪽을 권한다.

## 참고한 공개 자료

- [alibaba/open-code-review Korean README](https://github.com/alibaba/open-code-review/blob/main/README.ko-KR.md)
- [alibaba/open-code-review GitHub repository](https://github.com/alibaba/open-code-review)
- [Open Code Review official site](https://alibaba.github.io/open-code-review/)
- [@alibaba-group/open-code-review on npm](https://www.npmjs.com/package/@alibaba-group/open-code-review)
- [OpenCodeReview v1.5.0 GitHub Release](https://github.com/alibaba/open-code-review/releases/tag/v1.5.0)
- [OpenCodeReview Security Policy](https://github.com/alibaba/open-code-review/blob/main/SECURITY.md)
- [GitHub Actions integration example](https://github.com/alibaba/open-code-review/tree/main/examples/github_actions)
