---
title: "HarnessRouter는 여러 에이전트 하네스를 하나의 실행 API로 묶는다"
date: "2026-10-05T17:38:12"
description: "HarnessRouter Community Edition은 여러 CLI 하네스를 세션별 workspace에서 실행하고, UHP·Responses 호환 API로 task와 실행 상태를 통합하는 self-hosted 런타임이다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agent Harnesses
  - Agent Infrastructure
  - UHP
  - Self-hosted AI
draft: false
---

모델 endpoint를 통일해도 에이전트 시스템 통합이 끝나는 것은 아니다.[1] Codex, Claude Code, Hermes처럼 서로 다른 harness는 도구 실행, 세션 이어가기, 파일 회수, streaming과 오류 표현이 각자 다르다.[1] HarnessRouter Community Edition(CE)은 모델보다 한 단계 위의 실행 표면, 즉 **에이전트 하네스 자체를 공통 API 뒤에서 실행하는 것**을 목표로 한다.[1]

그래서 이 프로젝트는 단순한 LLM 모델 라우터라기보다 self-hosted agent runtime에 가깝다.[1] 한 인스턴스에서 여러 CLI harness를 설정하고, task를 실행하고, 세션과 산출물을 다루는 API와 콘솔을 함께 제공한다.[1]

<figure style="margin: 1.8rem 0;">
  <img src="/images/blog/harnessrouter-agent-harness-runtime-console.webp" alt="HarnessRouter 콘솔의 Agent harnesses 화면. Codex, Claude Code, Hermes, Pi, OpenCode 등 여러 실행 기반이 목록으로 표시되어 있다." style="display: block; width: 100%; max-width: 100%; min-width: 0; height: auto;" />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 콘솔 화면은 HarnessRouter가 모델 목록만이 아니라 실행할 harness를 관리하는 제품임을 보여준다.[14] 세부 UI는 이미지를 눌러 확대할 수 있다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

일반적인 모델 API가 주로 입력과 출력을 주고받는다면, agent harness는 shell과 파일시스템을 쓰고 여러 차례 도구를 호출하며 세션 상태를 이어 간다.[1] 제품에 서로 다른 harness를 붙일수록 provider 연결, 작업 시작·취소, 진행 이벤트, 파일 수집을 각각 통합해야 한다.[1] HarnessRouter는 이 반복되는 접착 코드를 공통 task·session 표면으로 끌어올리려 한다.[1]

프로젝트가 정의하는 harness는 모델을 감싸는 runtime이고, API에서 만드는 harness 객체는 실행 기반과 모델, 지시문, 제한을 묶은 설정이다.[1] 따라서 “어떤 모델을 호출할까”와 “어떤 에이전트 런타임으로 작업을 수행할까”를 별도 선택지로 다룬다.[1]

## 핵심 아이디어 / 구조 / 동작 방식

CE는 Docker 컨테이너 안에 Console, Gateway, Runner를 둔다.[2] 외부에서 접근하는 기본 포트는 콘솔 `:3000`이고, Gateway `:8080`은 task와 세션 API를, Runner `:8081`은 실제 harness 실행을 담당한다.[2] `/data` 볼륨에는 SQLite 상태와 파일·작업공간이 남으므로 컨테이너를 재시작해도 인스턴스 데이터를 유지할 수 있다.[2]

<figure style="margin: 1.8rem 0;">
  <img src="/images/blog/harnessrouter-agent-harness-runtime.svg" alt="클라이언트 요청이 Console, Gateway, Runner를 거쳐 세션별 Codex 또는 Claude Code 작업공간에서 실행되고, /data 볼륨과 외부 모델 제공자를 사용하는 HarnessRouter 구조도." style="display: block; width: 100%; max-width: 100%; min-width: 0; height: auto;" />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Console은 진입점이고 Gateway와 Runner는 컨테이너 내부에서 연결된다.[2] 세션마다 OS 사용자와 workspace를 나누지만, 세션별로 별도 Docker 컨테이너를 만드는 구조는 아니다.[2]
  </figcaption>
</figure>

- **Console `:3000`** — UI와 API 진입점이며 기본 구성에서 외부에 공개하는 포트다.[2]
- **Gateway `:8080`** — Responses 호환 task·session API로 실행 요청, 스트리밍, 취소와 상태를 관리한다.[2]
- **Runner `:8081`** — harness CLI를 실행하고 세션별 프로세스와 작업공간을 관리한다.[2]
- **`/data`** — SQLite 상태, 파일, 세션 데이터와 작업공간을 보존하는 로컬 영속 영역이다.[2]

UHP(Unified Harness Protocol)는 이 실행 표면을 버전이 있는 공개 계약으로 분리한다.[10] CE는 Responses 호환 API로 harness와 model을 발견하고, 작업을 시작하거나 이어 가고, 이벤트 스트림과 파일 산출물을 다루도록 설계됐다.[1] 콘솔은 같은 API를 쓰는 클라이언트이므로 자동화도 UI 조작에만 묶이지 않는다.[2]

설치형 제품이라는 점도 중요하다. 기본 이미지에 모델이나 체험용 provider key가 포함되지 않으며, 사용자는 Docker와 모델 제공자 키를 준비해야 한다.[2] agent CLI들은 첫 실행 때 설치되고 각각의 upstream license와 약관을 따른다.[2] 저장소의 Apache-2.0 라이선스가 그 CLI들의 별도 조건까지 대체하지는 않는다.[1]

## 공개된 근거에서 확인되는 점

배포 태그는 빠르게 움직인다.[4] 2026년 10월 5일 확인 시 GitHub의 최신 비-prerelease는 `v0.29.2`였고, `v0.30.0-rc.6` 같은 후보 릴리스도 공개돼 있었다.[4] Docker Hub의 `latest`와 `0.29.2`는 같은 이미지 digest를 가리켰다.[5] 재현 가능한 배포가 필요하면 움직이는 `latest` 대신 검증한 버전 태그나 digest를 고정하는 편이 낫다.

프로젝트는 서로 다른 질문을 별도 평가로 다룬다.[8] 지원 매트릭스는 첫 요청, 같은 세션의 후속 대화, 모델 전환, artifact 산출, sandbox 재생성 후 상태 회수 여부를 확인하고, benchmark suite는 harness×model 조합의 과제 성능을 측정한다.[15] 이 구분은 “연결된다”는 사실과 “잘 수행한다”는 결과를 혼동하지 않게 한다.

공개 benchmark는 SpreadsheetBench Verified의 첫 50개 과제를 네 harness에 실행한 자체 실험이다.[6] 같은 `deepseek-v4.1-flash`와 custom OpenAI-format 연결을 사용했지만, harness 버전은 `0.18.0`과 `0.18.4`로 달랐다.[8] 점수는 프로젝트가 게시한 작업 기록에서 집계됐다.[7]

| Harness | 해결 과제 · 중앙 시간 |
|---|---|
| Pi | 40/47 (85%) · 48초 |
| OpenCode | 39/48 (81%) · 75초 |
| DeepSeek Harness | 36/46 (78%) · 100초 |
| Cline | 36/47 (77%) · 108초 |

이 표는 특정 설정에서 harness 선택이 성공률과 비용·시간을 바꿀 수 있음을 보여주는 실험 기록이지, 모든 모델과 작업에 적용되는 순위표는 아니다.[6] 전체 400개 중 첫 50개만 사용했고, 과제 자체 채점기가 처리하지 못한 두 항목은 제외됐다.[6] 더 중요한 제한은 Cline과 DeepSeek Harness의 50회 모두에서 실제 제공 모델 ID가 기록되지 않아 요청한 모델과 실제 실행 모델이 일치했는지 검증할 수 없었다는 점이다.[7]

실행 흔적을 제외하지 않고 공개한 점은 장점이지만, 동시에 안전한 평가가 어렵다는 것도 드러난다.[6] 보고서에는 점수에서 뺀 네 건의 finding—한 번의 네트워크 접근과 세 번의 작업공간 밖 탐색—이 별도 기록돼 있다.[7] 따라서 이 benchmark의 수치는 단순 성공률보다 어떤 실행을 유효한 점수로 인정했는지와 함께 읽어야 한다.

프로토콜 적합성도 별도의 검증 대상으로 둔다. UHP conformance suite는 스키마 검사만이 아니라 인증, task 실행, 이벤트 스트림, 취소, artifact 다운로드와 경로 탐색 방지 등을 실제 서버에 요청해 확인한다.[9] 다만 README에 실린 reference 결과는 CE `0.17.3`을 2026-09-12 suite로 측정한 74/74 기록이므로, 현재 안정 릴리스 `0.29.2`의 적합성을 입증하는 최신 증명으로 읽어서는 안 된다.[4][9]

프로토콜 문서의 버전도 확인할 필요가 있다. 저장소에는 `2026-10-04` 사양이 있지만 공개 UHP 사양 페이지는 `2026-08-11`을 표시하고 있다.[10][11] 따라서 UHP를 클라이언트나 서버에 구현할 때는 단순히 “최신”이라고 가정하기보다, 연결 대상이 실제로 제공하는 프로토콜 버전을 고정하는 편이 안전하다.

호환성은 API 이름만으로 보장되지 않는다. CE `0.17.3`에서 Codex를 custom Responses endpoint에 연결한 사례는 일부 tool 형식이 endpoint에서 거부되고 스트림에 `output_text.delta`가 오지 않는 문제를 기록했다.[12] 후속 논의에서 maintainer는 `apply_patch` 관련 항목이 `0.26.16`에서 정리됐다고 밝혔지만, tool·stream 경계는 9월 30일 마지막 논의에서도 별도 검증이 필요한 항목으로 남아 있었다.[13] 현재 설정 안내는 custom Responses 연결에서 `namespace`와 `web_search` tool을 기본 비활성화하고 필요한 경우 명시적으로 켜도록 설명한다.[2] 이는 “Responses 호환”이라는 표기만으로 모든 endpoint와 harness가 같은 tool schema와 이벤트를 주고받는다고 가정할 수 없다는 뜻이다.

## 실무 관점에서의 해석

HarnessRouter의 차별점은 백엔드 이름을 많이 나열하는 데 있지 않다. 여러 harness를 제품 코드에서 직접 실행할 때마다 달라지는 프로세스, 세션, 이벤트, 파일 수집을 **하나의 작업 API와 운영 경계**로 묶으려는 데 있다.[1] 특히 이미 CLI 기반 agent를 여러 개 평가하고 있고, 모델 호출과 agent runtime의 선택을 분리하고 싶다면 실험·내부 도구용 self-hosted 계층으로 검토할 만하다.

반면 CE는 다중 테넌트용 관리형 sandbox와 같지 않다.[2] 세션은 OS 사용자와 workspace로 나뉘지만 하나의 컨테이너를 공유하고, agent는 bash·git·파일시스템을 사용해 실제 작업을 한다.[2] 보안 정책도 인스턴스를 제공자 자격 증명으로 코드를 실행할 수 있는 시스템으로 취급하고, 공개 네트워크에 내놓으려면 비밀번호와 TLS를 갖추라고 명시한다.[3]

실제로 시험한다면 아래 세 가지를 우선 확인할 필요가 있다.

- 기본 Docker 구성이 loopback에만 바인딩되는지 확인하고, 외부 공개 전 기본 콘솔 비밀번호를 바꾸고 TLS를 적용한다.[2][3]
- 운영에 사용할 harness·provider·model 조합을 고정한 뒤, 실제 task·취소·streaming·artifact 흐름을 conformance 및 smoke test로 확인한다.[8] UHP 적합성만으로 모든 모델·CLI 조합의 품질까지 보장되지는 않는다.[9]
- 버전 태그나 image digest, `/data` 백업 절차를 배포 단위로 관리한다.[4][5] CE는 로컬 머신의 자원에 묶이고, Cloud처럼 실행 sandbox를 수요에 따라 확장하지 않는다.[2]

결국 HarnessRouter는 모델 API를 바꾸는 프록시보다, **에이전트 실행 환경을 애플리케이션에 API로 제공하는 런타임**으로 이해하는 편이 정확하다.[1] 그 접근은 harness를 바꿔 끼우기 쉽게 만들지만, 결과의 재현성과 보안은 고정된 버전, 특정 provider·CLI 조합의 검증, 그리고 단일 컨테이너 경계에 대한 이해에 달려 있다.[2][8]

## Sources

[1] https://raw.githubusercontent.com/HarnessRouter/harnessrouter/main/README.md — HarnessRouter README

[2] https://raw.githubusercontent.com/HarnessRouter/harnessrouter/main/docs/self-hosting-guide.md — Community Edition setup guide

[3] https://raw.githubusercontent.com/HarnessRouter/harnessrouter/main/SECURITY.md — Security policy

[4] https://api.github.com/repos/HarnessRouter/harnessrouter/releases — GitHub releases

[5] https://hub.docker.com/v2/repositories/harnessrouter/harnessrouter/tags?page_size=20 — Docker Hub image tags

[6] https://raw.githubusercontent.com/HarnessRouter/harnessrouter/main/docs/benchmark.md — SpreadsheetBench benchmark results

[7] https://raw.githubusercontent.com/HarnessRouter/harnessrouter/main/docs/benchmark-results.json — Benchmark raw records

[8] https://raw.githubusercontent.com/HarnessRouter/harnessrouter/main/scripts/benchmark/README.md — Benchmark methodology

[9] https://raw.githubusercontent.com/HarnessRouter/harnessrouter/main/protocol/conformance/README.md — UHP conformance suite

[10] https://raw.githubusercontent.com/HarnessRouter/harnessrouter/main/protocol/versions/2026-10-04/index.md — UHP repository specification 2026-10-04

[11] https://unifiedharnessprotocol.org/spec — Published UHP specification

[12] https://api.github.com/repos/HarnessRouter/harnessrouter/issues/202 — Custom Responses endpoint issue

[13] https://api.github.com/repos/HarnessRouter/harnessrouter/issues/202/comments — Custom Responses endpoint issue discussion

[14] https://raw.githubusercontent.com/HarnessRouter/harnessrouter/main/docs/images/02-first-screen-v2.png — Official HarnessRouter console screenshot

[15] https://raw.githubusercontent.com/HarnessRouter/harnessrouter/main/docs/support-matrix.md — Harness support matrix
