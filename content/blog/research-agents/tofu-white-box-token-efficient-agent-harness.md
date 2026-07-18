---
title: "ToFu는 에이전트 성능을 모델이 아니라 harness까지 연구 대상으로 만든다"
date: "2026-07-18T20:24:06+09:00"
description: "arXiv 2607.11423의 ToFu는 3단 context compaction, 검색형 메모리, 다국어 번역 계층, 의존성 인식 swarm을 공개 harness에 묶고 SWE-bench Verified에서 Claude Code보다 적은 토큰으로 더 높은 Pass@1을 보고한다."
author: "Sangmin Lee"
category: "research-agents"
tags:
  - ToFu
  - Agent Harness
  - Context Engineering
  - SWE-bench
  - Research Agents
image: "/images/blog/tofu-harness-overview.webp"
draft: false
---

에이전트 코딩 시스템을 비교할 때 흔히 모델 이름부터 본다. 하지만 같은 모델이라도 어떤 도구를 노출하는지, 긴 tool output을 어떻게 보존하는지, 실패 뒤에 무엇을 다시 시도하는지, 기억을 어떤 시점에 불러오는지에 따라 실제 행동은 크게 달라진다. 이 모델 바깥의 제어 코드가 바로 **agent harness**다.

`ToFu: A White-Box, Token-Efficient Agent Harness for Researchers`는 harness를 단순한 제품 구현이 아니라, 성능·비용·재현성을 함께 연구할 수 있는 공개 실험 대상으로 놓는다. 논문이 제안하는 ToFu는 코드와 문서를 읽고, 파일을 고치고, 명령을 실행하며, MCP를 통해 외부 도구를 연결하는 self-hosted 연구 보조 시스템이다. 핵심 주장은 “더 많은 token을 쓰는 agent”가 아니라 **문맥을 더 잘 정리하고 복구하는 harness**가 같은 backbone model에서도 더 나은 정확도–비용 균형을 만들 수 있다는 것이다.

이 글에서 흥미로운 부분은 ToFu의 기능 목록 자체보다, product-like UI와 white-box orchestration을 함께 내세우는 방식이다. 연구 전용 agent는 재현 가능하지만 사용성이 약하고, 상용 agent는 다듬어진 UX를 갖지만 제어 로직과 모델 변화가 불투명한 경우가 많다. ToFu는 이 사이에 공개 가능한 orchestration core, 메모리·context 관리, tool runtime, UI를 한 묶음으로 제시한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/tofu-harness-overview.webp"
    alt="사용자 인터페이스, agent orchestration core, 모델 추상화 계층, 장기·단기 메모리, 도구 확장이 연결된 ToFu harness 구조"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2. ToFu는 사용자 인터페이스와 모델 사이에 orchestration core, memory, tool runtime을 별도 계층으로 둔다. 모델 교체보다 이 제어면을 관찰·변형할 수 있게 하는 것이 white-box 주장에 가깝다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

논문은 agent harness의 병목을 네 가지로 정리한다. 첫째, 간단한 요청에도 tool schema·대화 이력·대형 실행 결과가 누적되면서 token 비용이 커진다. 둘째, backbone model의 언어 편차가 그대로 agent 경험의 편차가 된다. 셋째, privacy-sensitive 환경에서는 모델뿐 아니라 orchestration과 데이터 경로도 로컬에서 통제할 수 있어야 한다. 넷째, 연구자가 agent의 행동을 비교·개선하려면 단순 benchmark script가 아니라 실제로 사용할 수 있는 공개 제품 표면이 필요하다.

ToFu의 답은 “모델을 하나 더 얹는” 방식이 아니다. context, state, tool call, retry, 병렬 작업을 model abstraction layer 바깥으로 분리하고, 이 레이어를 바꿔 가며 평가할 수 있게 한다. 따라서 이 논문은 새로운 foundation model 소개보다, **agent behavior를 만드는 운영 규칙을 연구 artifact로 만들려는 논문**에 가깝다.

## 핵심 아이디어 / 구조 / 동작 방식

논문은 ToFu를 여섯 모듈로 나눈다. UI는 Web UI·소셜 플랫폼 bot에서 입력과 승인, 중단·재개를 다룬다. orchestration core는 planner–worker–critic 스타일의 작업 분해와 tool call, checkpoint, fallback을 조정한다. model abstraction layer는 provider·streaming·rate limit을 통일하고, capability runtime은 shell·프로젝트·검색·브라우저·문서·이미지 생성과 MCP adapter를 실제 실행으로 연결한다. State & Knowledge와 Context Management는 각각 장기 상태와 매 turn 모델에 보낼 작업 문맥을 맡는다.

| 계층 | 논문에서 확인되는 구성 | 실무적으로 읽는 역할 |
|---|---|---|
| User Interface | Web UI, 플랫폼 bot, model/mode 설정, approval·interrupt·resume | agent가 무엇을 할 수 있는지와 사람이 어디에서 멈출 수 있는지를 드러내는 조작면 |
| Agent Orchestration Core | task 분해, planner–worker–critic, tool call, checkpoint, fallback, swarm scheduler | 단일 모델 출력을 실제 multi-step 작업으로 바꾸는 제어면 |
| Model Abstraction Layer | provider·API key·streaming 정규화, usage parsing, retry·routing | 모델과 공급자 변경을 orchestration logic에서 분리 |
| Capability Runtime | project/shell/search/browser/desktop/docs/image/scheduler, MCP·외부 agent adapter | 도구 실행과 효과를 agent loop에 연결 |
| State & Knowledge | 실행 기록, long-term memory, reusable skills | 이전 작업의 결정을 전체 대화를 다시 넣지 않고 재사용 |
| Context Management | context selection, compaction, cache-aware layout, multilingual enhancement | context window와 token 비용을 직접 관리 |

### 3단 context compaction

ToFu의 중심은 오래된 문맥을 무작정 자르는 방식이 아니라 세 종류의 compaction을 나누는 데 있다. 첫 단계는 search·command처럼 큰 tool result를 외부화하고 짧은 preview와 다시 열 수 있는 reference를 남기는 size-aware budgeting이다. 단, 코드 file read는 과도하게 줄이면 다시 읽는 호출이 늘 수 있으므로 더 보수적으로 취급한다.

둘째는 cold history를 대상으로 하는 deterministic micro-compaction이다. 최근 결과와 reasoning trace는 그대로 두고, 오래된 대형 결과·이미지 중심 결과·낡은 reasoning block만 placeholder로 바꾼다. 논문은 이때 cached prefix를 바꾸지 않도록 설계해 prompt-cache를 불필요하게 깨지 않으려 한다. 셋째는 context 한계에 가까워졌을 때만 실행하는 query-aware semantic compaction이다. 가벼운 모델이 현재 질문에 대해 이전 turn을 critical·useful·tangential·irrelevant로 나눠 요약하고, 진행 중인 현재 turn은 유지한다.

이 구분은 agent 제품에서 꽤 현실적인 선택이다. 대형 tool output은 줄여도 되지만, source file을 너무 공격적으로 자르면 재독과 오류가 늘 수 있다. 또 압축을 위해 매 turn LLM을 호출하면 오히려 비용 절감 논리가 약해진다. ToFu는 먼저 deterministic한 정리로 버티고 정말 필요한 때에만 의미 기반 요약을 쓰려 한다.

### 메모리, 다국어, swarm을 context의 연장으로 다루다

메모리는 raw chat replay가 아니라 metadata를 가진 Markdown record로 저장하고, 프로젝트별·전역 범위를 나눈다. retrieval은 dense embedding이 아니라 BM25 keyword ranking을 사용한다. 논문은 library name, error message, API, file pattern처럼 정확한 문자열이 중요한 기술 작업에서 비용·지연을 줄이는 선택이라고 설명한다.

다국어 모드는 사용자 언어를 영어로 번역해 주 reasoning model에 보내고, 결과를 원래 언어로 되돌리는 translate-then-reason 흐름이다. 원문을 보존하고 code block이나 명시적 non-translatable span을 보호한다. 복잡한 작업은 DAG 형태의 sub-task와 dependency를 swarm scheduler에 등록한다. 독립 작업은 병렬로 실행하고, 완료 결과는 dependent agent의 문맥으로 주입한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/tofu-research-ui.webp"
    alt="ToFu의 논문 읽기와 에이전트 작업 인터페이스를 보여 주는 화면"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 4. 왼쪽은 대화·도구·모드 설정을 포함한 ToFu UI, 오른쪽은 논문 PDF와 grounded Q&A를 함께 배치한 paper reader 예시다. 논문은 이 제품 표면을 white-box harness를 실제 연구 workflow에서 시험하기 위한 조건으로 본다.
  </figcaption>
</figure>

## 공개된 근거에서 확인되는 점

논문은 full SWE-bench Verified 500개 문제에서 Claude Opus 4.6, GLM 5.1, DeepSeek-v4-pro라는 세 backbone model로 ToFu·Claude Code·OpenCode를 비교했다고 보고한다. 모든 patch는 udocker 안의 공식 SWE-bench harness로 채점했다고 명시한다. 아래 수치는 논문 저자의 보고값이며, 이 글에서 독립 재실행으로 검증한 결과는 아니다.

| Backbone model | ToFu Pass@1 | Claude Code Pass@1 | ToFu tokens / Claude Code tokens | 논문에서 보이는 패턴 |
|---|---:|---:|---:|---|
| Claude Opus 4.6 | **83.2%** (416/500) | 79.6% (398/500) | 663,881 / 837,764 | ToFu가 +3.6%p, token은 약 20.8% 적음 |
| GLM 5.1 | **80.4%** (402/500) | 77.6% (388/500) | 575,255 / 1,020,453 | ToFu가 +2.8%p, token은 약 43.6% 적음 |
| DeepSeek-v4-pro | **80.2%** (401/500) | 75.2% (376/500) | 1,110,192 / 1,401,574 | ToFu가 +5.0%p, token은 약 20.8% 적음 |

세 모델 평균으로 논문은 ToFu가 Claude Code보다 Pass@1에서 3.8%p 높고 token 사용량은 28.4% 낮다고 계산한다. 다만 token이 적다고 항상 달러 비용이 낮지는 않다. 예를 들어 Opus 설정에서는 ToFu의 평균 비용이 $5.13, Claude Code가 $4.97로 표기된다. output token 가격과 provider pricing이 달라질 수 있기 때문에, 이 결과는 “무조건 싸다”보다 **정확도와 total token을 동시에 개선했다고 보고한 비교**로 읽는 편이 정확하다.

다국어 평가에서는 MAPS:SWE-bench의 10개 언어에서 auxiliary translation을 켠 방식이 source language를 직접 넣는 방식보다 평균 2.5 accuracy point 높았고, 7개 언어에서 개선됐다고 보고한다. 반면 한계도 명시한다. broader research-assistant scenario의 human preference study는 참여자 3명 규모이고, token efficiency와 성능 사이 trade-off의 체계적 정량 분석은 아직 남은 과제라고 쓴다.

### 공개 저장소의 성숙도는 논문보다 더 빠르게 변한다

논문 HTML은 공식 저장소 `NiuTrans/ToFu`를 연결한다. 조회 시점 GitHub API 기준 저장소는 2026년 3월 30일 생성됐고, 7월 18일에도 commit이 들어왔으며, 기본 브랜치는 `main`, 약 130 stars·14 forks다. `VERSION` 파일과 가장 최신 tag는 모두 `0.15.0`을 가리킨다. 단일 실험 script가 아니라 Python/TypeScript clients, browser extension, desktop, docs, routes, 테스트, installer를 포함한 넓은 제품 bundle이다.

| 공개 신호 | 확인 결과 | 해석 |
|---|---|---|
| Repository shape | `docs/`, `clients/`, `browser_extension/`, `desktop/`, `tests/`, `Dockerfile`, `pyproject.toml`, `package.json` | 논문 재현 코드만이 아니라 self-hosted product surface를 함께 만들고 있음 |
| 버전 신호 | `VERSION` 및 최신 tag `v0.15.0` | 버전 표기는 있으나 GitHub `releases/latest` API는 응답하지 않음 |
| 최근 활동 | 2026-07-18 최신 commit 확인 | 논문 공개 직후에도 빠르게 수정되는 코드베이스 |
| 라이선스 표기 | 논문·README는 MIT를 주장하지만 GitHub API `license`는 `null`, root `/LICENSE` endpoint는 404 | 현재 저장소의 체크인 라이선스 증거가 불일치하므로, 배포·도입 전 실제 branch의 LICENSE를 다시 확인할 필요가 있음 |

특히 마지막 행은 사소하지 않다. 논문과 README의 “MIT-licensed” 문구는 분명하지만, repository metadata와 root LICENSE endpoint가 그 주장을 바로 뒷받침하지 않는다. 또 README의 일부 install·release URL은 `rangehow/ToFu`를 가리킨다. ToFu를 연구용 reference뿐 아니라 로컬 운영 도구로 검토한다면, 이처럼 빠르게 바뀌는 repository identity·release·license 경계를 실제 설치 직전에 다시 확인하는 편이 안전하다.

## 실무 관점에서의 해석

ToFu의 가장 좋은 질문은 “누가 최고의 coding agent인가”가 아니다. **모델 외부의 제어 로직을 얼마나 측정·교체·검증 가능한 artifact로 만들 수 있는가**다. tool output compaction, cache 안정성, memory retrieval, retry, approval, multilingual translation, sub-agent dependency는 모두 모델 카드에 드러나지 않지만, 실제 현장에서 비용과 실패율을 좌우한다.

이 관점에서 3단 compaction은 특히 재사용할 만하다. 팀이 context cost를 줄이려 할 때 모든 과거 대화를 요약하거나 tool output을 일괄 truncate하는 것은 쉽지만, 다음 행동에 필요한 source code·최근 오류·cache prefix까지 같이 훼손할 수 있다. ToFu가 제시한 것처럼 **대형 결과의 reference화, cold history의 결정적 축약, 한계 근처에서만 query-aware 요약**을 분리하면 비용 절감과 작업 연속성을 조금 더 명시적으로 trade-off할 수 있다.

다만 benchmark 결과가 곧 일반 연구 자동화의 검증은 아니다. SWE-bench Verified는 coding harness를 비교하기에 강한 기준이지만, 논문 작성·문헌 조사·실험 설계·다중 서비스 권한이 얽힌 실제 연구 workflow 전체를 대표하지는 않는다. human preference evidence도 아직 작다. 또한 공개 저장소가 활발히 바뀌는 단계이므로, 논문의 실험 버전·현재 `v0.15.0` tag·사용자가 실제 설치하는 branch가 같은 동작을 보장한다고 가정할 수는 없다.

그래도 ToFu는 중요한 baseline을 만든다. 좋은 agent harness는 모델 호출을 감싼 검은 상자가 아니라, context와 실행을 어떤 규칙으로 관리하는지 공개하고, 그 규칙을 benchmark와 제품 workflow 양쪽에서 시험할 수 있어야 한다. 앞으로 agent 연구에서 비교해야 할 대상은 모델 하나가 아니라, **모델·문맥·도구·복구·인간 승인으로 구성된 전체 실행 시스템**일 가능성이 크다.

Sources: https://arxiv.org/abs/2607.11423, https://arxiv.org/html/2607.11423v1, https://github.com/NiuTrans/ToFu, https://api.github.com/repos/NiuTrans/ToFu, https://api.github.com/repos/NiuTrans/ToFu/tags, https://api.github.com/repos/NiuTrans/ToFu/contents/VERSION, https://api.github.com/repos/NiuTrans/ToFu/contents/LICENSE
