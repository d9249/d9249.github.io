---
title: "더 작은 모델로 에이전트 비용을 줄이려면, 모델보다 하네스를 먼저 최적화해야 한다"
date: "2026-08-12T23:15:51+09:00"
description: "Better Harnesses, Smaller Models는 작은 언어 모델의 실패 trajectory를 진단해 context·tools·agent loop를 자동 적응시키고, 반복 업무에서 frontier LLM 수준의 성능에 가까운 비용-품질 균형을 찾는 하네스 최적화 연구다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agent Harness
  - Small Language Models
  - Harness Optimization
  - Agent Evaluation
  - Cost Efficiency
draft: false
---

작은 언어 모델(SLM)을 에이전트에 붙이면 비용은 내려가지만, 기존 frontier LLM용 하네스를 그대로 물려받는 순간 성능이 무너지는 경우가 많다. 도구를 잘못 고르고, 긴 지시를 일부 놓치고, 환경의 암묵적 규칙을 찾지 못하고, 실패한 경로를 반복한다. 이 문제를 단순히 “작은 모델의 추론 능력이 부족하다”로만 보면 선택지가 좁아진다. 더 큰 모델로 되돌아가거나, 사람이 프롬프트를 끝없이 다듬는 일뿐이다.

CMU의 Chenyang Yang, Xinran Zhao, Tongshuang Wu, Christian Kästner가 공개한 **Better Harnesses, Smaller Models: Building 90% Cheaper Agents via Automated Harness Adaptation**은 다른 질문을 던진다. 여러 task instance에서 반복되는 난이도라면, 그 부담 일부를 모델 안에 남겨 둘 필요가 있을까? 명시적 workflow, 좁힌 tool surface, domain knowledge, deterministic hook처럼 **하네스 바깥 구조**로 옮길 수 있다면 작은 모델도 훨씬 안정적으로 일할 수 있다는 가설이다.[1]

논문은 이를 수동 best practice 목록으로 끝내지 않는다. 실패 trajectory와 평가 신호를 읽는 meta-agent가 하네스를 바꾸고, 검증을 통과한 후보만 다음 탐색 pool에 넣는 optimizer를 구성한다. 7개 business-oriented agent task와 3개 SLM family의 21개 조합에서, optimized harness는 16개 조합을 유의미하게 개선했고 7개 조합은 frontier LLM과의 성능 격차를 닫았다고 보고한다.[1]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/better-harnesses-small-models-figure1.png"
    alt="예산 승인 에이전트에서 일반 하네스의 작은 모델을 prescribed plan, filtered tools, monitoring hooks를 넣은 적응 하네스로 바꿔 저비용·고성능 영역으로 옮기는 논문 Figure 1"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 1. 예산 승인 업무에서 일반 하네스의 SLM에 계획·도구 필터·반복 방지 hook을 넣어, 저비용과 높은 성능을 함께 노리는 사례를 보여 준다. 영어 원본 그림이다.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

에이전트의 품질은 모델 파라미터만의 함수가 아니다. 같은 SLM이어도 어떤 system instruction을 주는지, 어떤 도구를 노출하는지, 관측 결과를 어떻게 압축하는지, 완료 전에 무엇을 검사하는지에 따라 전혀 다른 행동을 한다. 논문은 이 모델 외부의 실행 환경을 **agent harness**로 보고, 반복 업무에서 하네스를 task·model에 맞게 적응시키는 일을 최적화 문제로 다룬다.[1]

출발점은 일반 하네스다. 예를 들어 예산 승인 agent가 파일 편집·terminal·여러 MCP 도구를 쓰도록 두고 “정확히 처리하라”는 짧은 prompt만 주면, frontier LLM은 전체 계획을 세우고 tool을 선택할 수 있다. 그러나 작은 모델은 필요한 문서 발견, 정책 적용, 중복 메시지 방지 같은 subtask에서 흔들릴 수 있다. 이때 일반 하네스를 그대로 둔 채 모델만 바꾸면 비용은 낮아져도 배포 가능한 신뢰도에 도달하지 못한다.[1]

논문의 대안은 작업 부담을 세 가지 하네스 표면으로 옮기는 것이다.

| 하네스 표면 | 바꾸는 것 | 실패를 줄이는 예 |
|---|---|---|
| Context | system prompt, example, skill, dynamic context, memory | 명시적 step-by-step plan, 환경 규칙 외재화, 필요한 정보만 점진 노출 |
| Tools | tool interface, custom tool, MCP surface, schema | 반복 절차를 wrapper로 만들기, 관련 없는 tool 숨기기, schema 단순화 |
| Agent loop | hook, context condenser, sub-agent, 검증 절차 | 중복 action 차단, stop 전 artifact 검사, 관측 압축, 역할 분리 |

핵심은 “더 긴 prompt”가 아니다. context를 무작정 추가하면 긴 문맥과 instruction-following 문제가 다시 생기고, tool을 많이 만들면 tool-use 선택 부담도 커질 수 있다. 논문은 관찰된 실패 원인에 맞춰 수정면을 고르는 것이 중요하다고 본다.[1]

## 핵심 아이디어 / 구조 / 동작 방식

논문은 agent trajectory의 local failure를 다섯 capability gap으로 정리한다. **tool-use**, **instruction-following**, **knowledge**, **long-context**, **planning/reasoning**이다. 각 failure는 하네스 적응 전략과 연결된다. 예컨대 tool schema를 잘못 쓰면 tool wrapper 또는 filtering을, 암묵적 규칙을 모르면 context/skill을, 반복·제약 위반은 hook 같은 programmatic check를 우선 검토하는 식이다.[1]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/better-harnesses-small-models-adaptation-map.svg"
    alt="작은 언어 모델의 업무 실행에서 나온 실패 trajectory를 메타 에이전트가 도구 사용, 지시 이행, 지식, 긴 컨텍스트, 계획 범주로 진단하고 컨텍스트·도구·실행 루프 수정안을 검증해 하네스 pool을 갱신하는 흐름도"
    style="width: 100%; max-width: 100%; height: auto; display: block; background: #f8fafc;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문의 failure taxonomy와 optimizer loop를 한국어로 재구성한 흐름도. 16/21과 7개 조합 수치는 논문의 실험 결과에 근거한다.[1]
  </figcaption>
</figure>

### meta-agent가 하네스 후보를 탐색한다

optimizer는 SLM, target task의 train/validation data, 초기 harness를 입력으로 받는다. 그 뒤 다음 순환을 반복한다.[1]

1. **후보 실행·평가**: pool에서 harness를 골라 training batch에 실행한다. tool call, intermediate observation, final output, evaluation feedback을 포함한 trajectory를 남긴다.
2. **실패 진단·수정 제안**: meta-agent가 현재 harness, 실패 trajectory, 과거 제안의 효과를 기록한 search memory, 편집 가능한 SDK design-space 문서를 함께 보고 수정안을 만든다.
3. **sanity check와 validation**: 문법 오류나 명백히 깨진 harness를 먼저 걸러내고, 통과한 후보를 같은 batch 및 validation set에서 평가한다. 기존 후보보다 좋을 때 pool에 추가한다.

논문 구현은 `software-agent-sdk`의 context, tool, hook, context management, sub-agent component를 탐색 공간으로 사용하고, outer loop의 후보 선택에는 GEPA-style genetic search를 쓴다. 즉 meta-agent가 자유로운 자연어 조언만 쓰는 것이 아니라, 실제 편집 가능한 runtime component 집합 안에서 후보를 만들도록 제한한다.[1]

### 예산 승인 사례: 계획·도구 필터·hook을 함께 바꾼다

논문이 보여 주는 budget-approval 예시에서는 일반 하네스가 넓은 MCP tool set과 간단한 system prompt를 노출한다. optimizer가 찾은 adapted harness는 세 가지를 결합한다.[1]

| 관찰된 부담 | 자동 적응 예 | 역할 |
|---|---|---|
| 전체 업무 흐름을 세우기 어려움 | explicit step-by-step workflow | 계획 부담을 model output 밖으로 이동 |
| 넓은 tool surface에서 잘못 선택 | `filter_tools_regex`로 tool set 축소 | action space를 축소 |
| 같은 메시지를 반복 전송 | `anti_loop_hook.py` | runtime에서 중복 행동을 결정적으로 차단 |

이 사례에서 중요한 것은 어느 한 prompt 문장이 아니다. 하네스는 사람이 손으로 만든 “정답 prompt”가 아니라, trajectory를 읽은 meta-agent가 failure와 적응 전략의 연결을 통해 찾은 code·prompt·filter 조합이다. 논문은 이 budget task에서 23회 iteration 뒤 해당 구성을 찾았다고 설명한다.[1]

## 공개된 근거에서 확인되는 점

### 7개 업무형 task와 3개 SLM을 평가했다

평가 task는 attendance/payroll audit, budget approval, stock alert, IoT anomaly detection, Playwright test generation, shopping-site administration, code refactoring이다. 각 task는 public benchmark를 바탕으로 만들거나 재사용했고, ground truth, executable check, runnable test, AST check처럼 검증 가능한 기준을 둔다. 일반적으로 100개 instance를 쓰며 website-management는 50개다. optimizer는 train/validation/test를 20/20/60으로 나눠 사용했고, 각 configuration은 세 번 실행해 평균을 보고한다.[1]

| 비교 대상 | 모델 | 평균 정확도 | 평균 instance 비용 | 평균 end-to-end latency |
|---|---|---:|---:|---:|
| Frontier baseline | `gemini-3.1-pro-preview` | 89.7% | $1.735 | 181초 |
| SLM baseline | `gemma-4-26b-a4b` | 31.4% | $0.043 | 328초 |
| + optimized harness | `gemma-4-26b-a4b` | 80.2% | $0.071 | 135초 |
| SLM baseline | `qwen3-coder-30b-a3b` | 26.9% | $0.085 | 107초 |
| + optimized harness | `qwen3-coder-30b-a3b` | 76.3% | $0.061 | 84초 |
| SLM baseline | `ministral-3-8b` | 9.5% | $0.110 | 194초 |
| + optimized harness | `ministral-3-8b` | 25.0% | $0.099 | 172초 |

*Table II의 task 평균을 옮긴 것이다. 비용은 논문이 추적한 token usage와 각 API의 공시 가격을 사용한 instance당 USD이며, 동일 모델에서 optimized harness가 항상 비용이나 latency를 낮춘다는 뜻은 아니다.[1][3]*

headline인 “90% cheaper”는 모든 조합의 고정 보장이 아니다. 논문 abstract는 최선의 adapted SLM이 frontier LLM 성능의 89.7%를 4% 비용으로 회수했다고 표현한다. 본문 RQ1은 best adapted SLM을 89% performance, 96% cost reduction, 25% latency reduction으로 기술한다. 이 수치는 **7개 curated task, 선택된 모델/API, 하네스 optimizer, 논문의 평가 protocol** 안에서 해석해야 한다.[1]

### 무엇이 잘 작동했고, 무엇은 잘 안 됐는가

저자들은 optimized harness가 21 task–SLM 조합 중 16개에서 유의미한 performance boost를 보였고, 7개가 LLM–SLM gap을 닫았다고 보고한다. 효과가 특히 좋았던 조건은 instance 간 workflow가 반복되는 task와 기본 capability가 상대적으로 강한 SLM이다.[1]

- **task diversity**: tool-call sequence의 normalized Levenshtein distance로 workflow 다양성을 측정했으며, 7개 task에서는 diversity와 optimized performance 간 Spearman `ρ = −0.96`을 보고한다. controlled variant에서는 가장 낮은 diversity에서 89.1%, 가장 높은 diversity에서 68.0%로 떨어졌다.[1]
- **model capability**: Artificial Analysis intelligence index를 proxy로 쓰며, 기본 능력이 높은 SLM이 더 잘 개선되는 추세를 보였다. 하네스가 부담을 외부화할 수는 있어도, coding·tool execution·core reasoning을 완전히 대체하지는 못한다.[1]
- **자주 다룬 failure**: optimized harness 분석에서 instruction-following과 knowledge가 각각 81%로 가장 흔했고, tool-use는 62%, long-context는 33%였다. 주된 적응은 context 추가 86%, tool 생성 43%, tool 관리 29%였다.[1]
- **sub-agent orchestration**: 논문은 성공한 적응에서 sub-agent 생성이 보이지 않았다고 적는다. 현재 SLM이 sub-agent progress 관리·조율에 약한 점, 또는 optimizer가 쉬운 delegation harness를 충분히 만들지 못한 점을 가능한 원인으로 든다.[1]

### 코드와 복제 자료의 공개 범위

저자들은 `malusamayo/migration-analysis` 저장소를 논문 코드로 연결한다. 저장소에는 task data, Docker-based task config, OpenHands SDK submodule, optimizer runner, `replication_package`가 들어 있다. README는 Figshare의 compact archive를 내려받으면 논문 표·figure를 intermediate data에서 다시 렌더링할 수 있고, 별도 run/eval archive를 쓰면 curated `run.json`/`eval_results.yaml`에서 summary를 재계산할 수 있다고 설명한다.[3]

다만 raw trace는 복제 archive에 포함되지 않는다. 따라서 task diversity figure는 제공된 `task_diversity_metrics.json`을 사용한다. 새 API key·task Docker image·모델 접근 권한 없이도 표/figure 재생성 경로는 남아 있지만, 처음부터 paper-scale agent run을 완전히 재실행하는 것은 별도 인프라와 credential을 요구한다. 또한 2026-08-12 확인 시 저장소는 release/tag와 checked-in `LICENSE`가 없었으며, README가 대형 artifact를 Figshare로 분리한다. 이는 바로 설치해 production agent를 만드는 SDK라기보다 **연구 재현과 실험 harness를 함께 공개한 artifact**로 읽는 편이 정확하다.[3]

## 실무 관점에서의 해석

이 논문의 가장 실용적인 메시지는 “작은 모델이면 긴 프롬프트를 더 넣어야 한다”가 아니다. **실패가 관찰 가능하고, task가 충분히 반복 가능하며, 완료 판정이 검증 가능할 때 하네스 적응은 모델 교체의 비용을 상쇄할 수 있다**는 것이다.

도입 전에 다음 질문부터 고정해야 한다.

| 확인할 질문 | 하네스 최적화에 필요한 이유 |
|---|---|
| 성공을 자동으로 판정할 수 있는가 | optimizer는 validation signal 없이는 좋은 수정과 우연한 수정을 구분하기 어렵다 |
| instance들이 같은 workflow를 반복하는가 | diverse task일수록 하나의 adapted harness를 재사용하기 어렵다 |
| trajectory를 남기는가 | tool call, observation, intermediate artifact가 없으면 meta-agent의 진단 근거가 약해진다 |
| model별 failure profile을 따로 보는가 | 논문에서도 같은 적응이 모든 SLM에 이식되지 않았다 |
| hook이 막는 행동을 운영 정책으로 설명할 수 있는가 | deterministic guardrail은 품질을 올릴 수 있지만 business rule을 code로 고정한다 |
| offline search 비용을 회수할 반복 호출량이 있는가 | 논문은 task–model optimization에 $20 budget을 사용했고 평균 13회 실행 뒤 비용을 회수했다고 추정한다 |

특히 “하네스가 모델을 대체한다”는 결론은 피해야 한다. 논문도 기본 capability가 약한 SLM은 intrinsic task difficulty를 넘지 못한다고 보고한다. `ministral-3-8b`의 optimized 평균은 baseline보다 오르지만 25.0%에 머문다. 반대로 복잡한 code refactoring처럼 repository와 사용자 요구가 매번 달라지는 task는 정적 workflow를 하네스에 외부화하기 어렵다.[1]

그래서 실제 적용은 model migration의 마지막 단계가 아니라, 다음의 짧은 loop로 시작하는 편이 낫다.

```text
반복 업무 1개 선택
  → executable evaluator 정의
  → 현재 SLM trajectory 수집
  → failure taxonomy로 분류
  → context / tool / hook 중 하나만 수정
  → held-out instance에서 품질·비용·latency를 함께 비교
  → 통과한 수정만 versioned harness에 반영
```

이 흐름은 automated optimizer 없이도 유효하다. 중요한 것은 좋은 prompt를 우연히 찾는 것이 아니라, **실패 로그·수정 가설·검증 신호·하네스 버전**을 하나의 engineering loop로 만드는 일이다. 논문이 보여 주는 비용 절감은 작은 모델 자체의 마법이 아니라, 반복 업무의 구조를 하네스에 옮기고 그 구조를 평가로 계속 교정했을 때 얻어지는 결과다.

## Sources

[1] Yang et al., *Better Harnesses, Smaller Models: Building 90% Cheaper Agents via Automated Harness Adaptation*, arXiv:2607.08938v1 (2026-07-09). https://arxiv.org/abs/2607.08938 · https://arxiv.org/html/2607.08938

[2] 논문 Figure 1 원본 이미지. https://arxiv.org/html/2607.08938v1/motivating-example-crop.png

[3] 저자 공개 복제 저장소와 재현 안내. https://github.com/malusamayo/migration-analysis
