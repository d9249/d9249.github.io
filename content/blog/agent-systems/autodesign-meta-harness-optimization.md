---
title: "AutoDesign은 산출물보다 ‘산출물을 만드는 하네스’를 최적화한다"
date: "2026-08-26T22:35:34+09:00"
description: "AutoDesign은 논문을 포스터로 만드는 개별 agent loop를 넘어, rollout 기록·평가·acceptance gate로 재사용 가능한 DesignHarness 자체를 반복 개선하는 meta-harness 프레임워크다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - AutoDesign
  - Agent Harness
  - Long-Horizon Agents
  - Meta-Harness Optimization
  - PosterBench
  - Agentic Design
draft: false
---

에이전트가 포스터·슬라이드·웹페이지처럼 사람이 읽는 산출물을 만들 때, 한 번의 결과를 비평하고 고치는 loop는 이미 익숙하다.[2]
더 어려운 문제는 그 수정 경험이 다음 작업에도 남는가다.[2]
같은 종류의 레이아웃 오류, 근거 누락, 텍스트 과밀, 렌더링 실패를 다음 작업에서 다시 발견한다면, agent는 매번 처음부터 시행착오를 반복하게 된다.[2]

`AutoDesign: Meta-Harness Optimization for Long-Horizon Agentic Design`은 최적화 대상을 개별 포스터에서 **포스터를 만드는 실행 시스템, 즉 DesignHarness**로 옮긴다.[2]
고정된 모델의 weight를 바꾸지 않고, source context·도구·실행 runtime·orchestration·평가/feedback으로 이루어진 하네스를 rollout 결과에 맞춰 갱신한다.[2]
논문은 이 구조를 학술 논문→포스터 작업으로 구현하고, 100편·5개 분야의 PosterBench Main Track과 제어용 10편 PosterBench-mini를 제안한다.[1][2]

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/autodesign-meta-harness-loop.svg"
    alt="AutoDesign의 산출물 개선 inner loop와 하네스 개선 outer loop가 실행 기록 및 acceptance gate로 연결되는 세로 흐름도"
    style="width: 100%; max-width: 640px; height: auto; display: block; margin: 0 auto;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    한 산출물을 고치는 inner loop와, 여러 실행 기록으로 다음 산출물의 제작 시스템을 바꾸는 outer loop를 분리한 구조다.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

논문→포스터 변환은 요약만 잘하면 끝나는 작업이 아니다.[2]
긴 텍스트·수식·그림·표를 압축하면서 출처를 보존해야 하고, 인쇄 가능한 정보 밀도와 읽을 수 있는 글자 크기, 시각 근거의 위치, 렌더링 무결성도 함께 관리해야 한다.[2]
AutoDesign은 이 과정을 한 번의 generation으로 보지 않고, 멀티모달 source를 사람용 artifact로 바꾸는 long-horizon agentic process로 다룬다.[2]

기존의 generate→critique→revise 방식은 현재 artifact를 더 좋게 만들 수 있다.[2]
하지만 feedback이 prompt의 임시 문장이나 한 번의 대화 기록에 머물면, 성공·실패의 원인이 다음 작업의 실행 환경으로 축적되지 않는다.[2]
AutoDesign의 출발점은 **좋은 포스터를 한 장 만드는 것과 좋은 포스터 제작 시스템을 학습하는 것은 다른 문제**라는 구분이다.[2]

| 관점 | 최적화 대상 | feedback이 남기는 것 | 다음 작업에 대한 효과 |
|---|---|---|---|
| Artifact refinement | 현재 포스터·슬라이드·페이지 | 현재 산출물의 수정 사항 | 같은 종류의 실패를 다시 탐색할 수 있다 |
| Meta-harness optimization | 산출물을 만드는 DesignHarness | 실행 기록, 평가 근거, 제한된 시스템 변경 | 통과한 변경을 versioned harness로 누적한다 |

## 핵심 아이디어 / 구조 / 동작 방식

### inner loop: 하나의 artifact를 만들고, 렌더링 결과를 고친다

DesignHarness는 source를 읽어 editable artifact를 생성하고, 렌더링·규칙 검사·critic feedback으로 결함을 찾아 국소 수정한다.[2]
논문은 하네스를 context/memory, tools/specifications, execution runtime, orchestration, evaluation/feedback의 다섯 기능 층으로 분해한다.[2]
즉 레이아웃을 바꾸는 prompt 하나뿐 아니라, source를 넣는 방식, 검증 도구, 재시도 예산, 종료 조건도 함께 설계 대상이다.[2]

이 inner loop의 중요한 산출물은 final poster만이 아니다.[2]
어떤 source를 사용했는지, 어떤 artifact가 생성됐는지, 어디서 clipping·근거 불일치·가독성 문제가 검출됐는지, 수정 뒤 점수가 어떻게 바뀌었는지를 execution trajectory로 남긴다.[2]
이 기록이 다음 단계에서 “이번 결과를 고치는 feedback”을 “시스템의 반복 실패를 찾는 evidence”로 바꾼다.[2]

### outer loop: 반복 실패를 하네스 변경 후보로 바꾼다

outer loop는 여러 task의 trajectory와 평가 점수를 모아 반복 실패를 찾고, meta-harness optimizer가 현재 DesignHarness의 한 구성 요소에 대한 bounded update를 제안하게 한다.[2]
update가 training task에서 좋아 보여도 바로 채택하지 않는다.[2]
논문은 development set 성능을 떨어뜨리지 않으면서 training 성능을 개선할 때만 acceptance gate가 후보를 통과시키도록 둔다.[2]

이 gate는 단순한 best-of-N 선택보다 중요한 운영 계약이다.[2]
하네스 변경이 특정 논문에만 맞는 prompt overfit인지, 다음 작업에도 쓸 수 있는 시스템 개선인지 최소한의 held-out 기준으로 가르는 장치이기 때문이다.[2]
다만 이 검증은 논문이 정의한 task distribution의 generalization 신호이며, 실제 조직의 출처·브랜드·보안·접근성 요구를 자동으로 보장하지는 않는다.[2]

![논문 Figure 1: Meta-harness iteration에 따른 대표 포스터 점수 변화와, 서로 다른 coding agent에 DesignHarness를 붙였을 때의 성능 상승을 보여 주는 공식 그림](/images/blog/autodesign-evolution-results.png)

*논문 Figure 1. 왼쪽은 대표 task에서 meta-harness iteration에 따라 poster score가 개선되는 과정을, 오른쪽은 DesignHarness가 여러 coding agent 구성에서 PosterBench 점수를 5.0~19.6점 높였다는 저자 보고를 보여 준다.[2]*

## PosterBench: “예쁘다”만으로는 부족한 평가

AutoDesign은 PosterBench를 최종 비교용으로 고정된 external evaluator로 둔다.[2]
이 점은 outer loop에서 candidate update를 고르는 optimization-time evaluator와 구분된다.[2]
PosterBench는 Faithfulness, Coverage, Density, Visual Evidence, Layout, Readability, Aesthetics의 일곱 차원을 묶고, OCR·공간·수치 근거·render integrity 같은 programmatic 검사와 rubric-guided VLM 판단을 결합한다.[2]

| 평가 축 | 확인하려는 실패 | 평가 방식의 예 |
|---|---|---|
| Faithfulness · Coverage | 논문의 주장·수치·핵심 내용이 왜곡·누락됐는가 | source grounding, compact source brief 기반 판단 |
| Density · Visual Evidence | 정보가 과소하거나 그림·표가 장식으로만 쓰였는가 | occupancy, OCR, figure relevance 검사 |
| Layout · Readability | clipping, overlap, 작은 글자, 비정상 여백이 있는가 | render·공간 분석과 가독성 판단 |
| Aesthetics | 위계·palette·구성이 학술 artifact로 일관적인가 | VLM 기반 시각 판단 |

이 분리는 실무적으로도 유용하다. 생산 시스템이 자기 평가 점수만 높이도록 바꾸면 evaluator에 맞춘 shortcut이 생길 수 있다. 따라서 harness를 업데이트하는 검증 신호와, 배포 직전 또는 비교 실험에서 쓰는 고정 평가 체계를 가능한 한 분리해야 한다는 것이 이 논문의 더 일반적인 교훈이다.[2]

## 공개된 근거에서 확인되는 점

논문 Main Track에서 AutoDesign + DesignHarness + Claude Code + Claude 4.8은 PosterBench Score 78.32를 기록했고, 같은 coding agent·model 조합의 Claude Design 70.87보다 7.45점 높았다. AutoDesign + Codex + GPT-5.5 구성은 77.97로 제시된다. 이 수치는 100편 Main Track과 논문의 고정 PosterBench protocol에서의 저자 보고 결과이지, 임의의 presentation tool 일반 성능 순위를 뜻하지는 않는다.[2]

10편 제어 subset에서 DesignHarness를 일곱 code-agent–model configuration에 붙였을 때 평균 PosterBench Score는 54.99에서 67.39로 상승했다고 보고된다. Figure 1의 agent별 개선 폭은 5.0~19.6점이며, 이는 “모델 하나를 교체하는 것”보다 harness가 실행 품질의 큰 변수가 될 수 있음을 뒷받침한다. 동시에 이 결과는 연구가 정한 poster task, evaluator, agent/model 조합에 한정된 transfer evidence다.[1][2]

system-blind human evaluation에서는 11명의 reviewer가 933개의 유효 pairwise judgment를 남겼고, AutoDesign의 Bradley–Terry preference estimate는 64.0%로 보고됐다. 저자들은 이 수치를 자동 PosterBench 결과를 보완하는 독립적인 선호 신호로 사용한다. 다만 confidence interval은 55.2~77.8%로 넓고, 참가자 수와 task distribution도 한정돼 있으므로 “사람이 항상 선호한다”는 보편 주장으로 읽을 근거는 아니다.[2][3]

## 공개 범위와 운영 성숙도

공식 GitHub 저장소는 2026년 8월 14일 공개됐고, README는 이후 poster canvas controls와 독립 설치형 Agent Skills 업데이트를 기록한다. repository metadata상 기본 branch는 `main`, 공개 repo이며 Python 프로젝트로 분류된다. 공식 project page는 논문→poster를 검증된 DesignHarness의 현재 범위로 설명하고, slides·research webpage·narrated video는 같은 meta-harness 프레임워크를 확장해 연구 중인 방향으로 구분한다.[4][5][3]

배포 표면도 단순한 paper code drop보다 넓다. 2026년 8월 19일 `agent-skills-v0.2.0` release에는 poster, PPT, webpage, video용 checksum-verified archive가 포함됐고, README는 각 Skill이 editable artifact·evidence·attempt·review state를 로컬 output directory에 남긴다고 설명한다. 동시에 이 portable Skills edition은 full AutoDesign Harness를 대체하지 않는다고 명시한다.[5][7]

라이선스 표기는 한 번 더 확인할 필요가 있다. GitHub repository API의 license field는 `Other` / `NOASSERTION`으로 보이지만, checked-in `LICENSE` 파일은 MIT License이며 bundled third-party components와 assets는 별도 라이선스를 유지한다고 적는다. 실제 도입·재배포 판단에서는 API badge가 아니라 저장소의 LICENSE와 `THIRD_PARTY_NOTICES.md`, 그리고 포함하려는 Skill/archive의 개별 의존성을 함께 검토하는 편이 안전하다.[4][6]

## 실무 관점에서의 해석

AutoDesign의 핵심을 “포스터를 잘 만드는 agent”로만 읽으면 절반만 보게 된다. 더 일반적인 패턴은 **모델의 출력 대신 모델을 둘러싼 실행 계약을 versioning하는 것**이다. 반복 작업에서 source ingestion, artifact schema, render QA, failure taxonomy, acceptance gate를 독립된 시스템 구성 요소로 만들면, 어떤 model을 쓰더라도 개선의 근거와 rollback 지점을 남길 수 있다.

이 패턴이 맞는 조건은 세 가지다.

1. **반복되는 artifact contract가 있다.** 포스터, 규격화된 보고서, product page, compliance 문서처럼 성공 조건을 일정 부분 명시할 수 있어야 한다.
2. **실행 기록이 남는다.** 최종 산출물만 저장하면 실패 원인을 학습할 수 없다. source 선택·검사 결과·수정 시도·render evidence가 남아야 한다.
3. **수정의 입구를 좁힌다.** 모든 prompt와 tool을 한 번에 바꾸기보다, 한 component의 bounded update를 held-out 검증 뒤 채택해야 rollback과 attribution이 가능하다.

반대로 디자인 품질은 쉽게 benchmark에 과적합될 수 있다. 글자 크기·여백·OCR 같은 자동 기준은 필요한 안전망이지만, 특정 audience의 취향, 발표 현장의 시선 흐름, brand constraint, 저작권·accessibility 요구는 별도의 human review가 필요하다. 따라서 production에서는 “agent가 스스로 고친 harness”를 즉시 전역 적용하기보다, diff review·canary task·version pin·rollback을 포함한 human-gated release로 다루는 것이 적절하다.

결국 AutoDesign이 제안하는 전환은 self-improving agent의 지능을 model weight나 prompt 한 장에 가두지 않는 데 있다. **한 번의 rollout이 만든 산출물, 점수, 진단, 수정 가설을 다음 rollout의 실행 환경으로 되돌리는 loop**가 핵심이다. poster는 그 loop를 측정하기 좋은 첫 번째 testbed이고, 진짜 경쟁력은 이 방식이 다른 artifact contract에서도 source fidelity와 실사용 품질을 함께 유지할 수 있는지에 달려 있다.[2][3]

## Sources

[1] https://arxiv.org/abs/2608.13560
[2] https://arxiv.org/html/2608.13560v1
[3] https://autodesign.designanything.ai
[4] https://api.github.com/repos/Yaxin9Luo/AutoDesign
[5] https://raw.githubusercontent.com/Yaxin9Luo/AutoDesign/main/README.md
[6] https://raw.githubusercontent.com/Yaxin9Luo/AutoDesign/main/LICENSE
[7] https://api.github.com/repos/Yaxin9Luo/AutoDesign/releases/latest
