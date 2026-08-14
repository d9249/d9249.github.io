---
title: "Spark-to-Paper는 논문 생성보다 ‘근거가 없으면 멈추는’ 연구 워크플로를 만든다"
date: "2026-08-14T23:35:06+09:00"
description: "Spark-to-Paper는 코딩 어시스턴트 안에서 13개 스킬을 조합해 아이디어·문헌·실험·그림·LaTeX 조립을 연결하고, 관측되지 않은 결과를 비워 두며 실패한 가설을 종료하는 연구 논문 생성 워크플로를 제안한다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - Spark-to-Paper
  - Research Agents
  - Agent Skills
  - Scientific Writing
  - Research Integrity
draft: false
---

연구용 AI가 논문 초안을 쓰는 일은 더 이상 낯설지 않다. 그러나 문단을 빠르게 생성하는 것과, 문헌을 확인하고 실험을 설계·실행한 뒤 그 결과 때문에 기존 주장을 약화하거나 포기하는 것은 전혀 다른 문제다. 긴 작업 흐름에서는 citation이 끊기고, 그림과 표가 본문에서 분리되고, 실험이 기대와 다를 때도 초안의 결론만 살아남기 쉽다.

`Spark-to-Paper: End-to-End Research Paper Generation as a Composable Skill`은 이 간극을 별도 자율 연구 플랫폼이 아니라 **기존 코딩 어시스턴트 안의 조합 가능한 스킬 묶음**으로 다룬다.[1][2] 논문이 강조하는 산출물은 그럴듯한 PDF 한 장이 아니다. 어떤 근거가 어떤 claim을 지지하는지, 어떤 수치가 실제 결과에서 왔는지, 그리고 가설이 계속 기각될 때 언제 해당 trajectory를 실패 보고서로 종료할지를 함께 관리하는 프로젝트 artifact다.

이 방향은 연구 자동화를 “논문 생성 모델”보다 **근거 중심의 작업 계약**으로 보게 한다. 모델은 문헌의 관련성, claim의 적절성, 문장 구성처럼 판단이 필요한 일을 맡고, citation 확인·LaTeX compilation·결과 수치 추적·파일 존재 여부처럼 규칙을 명시할 수 있는 일은 deterministic script가 맡는다. 중요한 것은 모델이 더 많은 단계를 수행한다는 사실보다, 모델 판단만으로 통과시키지 않는 경계가 있다는 점이다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/spark-to-paper-pipeline.png">
    <img
      src="/images/blog/spark-to-paper-pipeline.png"
      alt="Spark-to-Paper의 공식 pipeline. 입력을 proposal mode 또는 data-aware mode로 분기한 뒤, 계획·인용·작성·정제·검토·그림·조립의 일곱 단계를 거쳐 최종 원고를 만든다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 2. Input routing과 7단계 core pipeline, 단계별 deterministic gate, 조건부 보조 스킬을 함께 보여 주는 공식 구조도.[2]
  </figcaption>
</figure>

## 무엇을 해결하려는가

일반적인 paper-writing assistant는 이미 있는 proposal과 reference를 더 빠르게 문장화하는 데는 유용하지만, 결과가 없는 상태에서 숫자를 채우거나, 실험 실패 뒤에도 원래의 강한 claim을 유지할 위험이 있다. Spark-to-Paper는 이를 입력 단계에서부터 두 가지 결과 무결성 모드로 나눈다.

| 입력 상태 | 시스템 규칙 | 원고에 허용되는 것 |
|---|---|---|
| Proposal Mode | 실험 결과가 없으면 수치 칸을 비워 둔다 | 연구 질문·실험 설계·아직 확인되지 않은 기대 |
| Data-Aware Mode | 정량 claim은 제공된 data 또는 experiment output으로 추적돼야 한다 | 측정값과 그 값에 맞춰 수정된 결과·결론 |

이 분기는 단순한 prompt 지시가 아니다. planning 단계가 dataset, baseline, metric, ablation, 결과 table의 **빈 구조**를 먼저 확정하고, experiment 단계는 manuscript claim마다 어떤 evidence가 부족한지 계산한다.[2] 실험 가능한 code와 data가 있으면 필요한 최소 실험을 실행하고 log·metric file·plot을 남긴다. 없다면 값을 추정해 채우지 않고 해당 결과를 unspecified로 유지한다.

그 뒤 claim은 `supported`, `partially-supported`, `unsupported`, `contradicted`, `needs-confirmation`으로 분류된다. support가 약하면 표현을 좁히거나 limitation으로 옮기고, 반박되면 제거한다. 즉 “실험을 논문에 덧붙이는” pipeline이 아니라, **실험 결과가 abstract·introduction·conclusion을 다시 쓸 권한을 갖는** pipeline이다.[2]

## 핵심 아이디어 / 구조 / 동작 방식

논문 속 Spark-to-Paper는 13개 composable skill을 7개 core stage와 조건부 experiment stage로 배열한다. skill의 수와 pipeline stage의 수가 일대일 대응하지 않는 이유는, figure optimization이나 data processing 같은 보조 작업이 필요할 때만 개입하기 때문이다.[2]

| 단계 | 남기는 핵심 artifact | 역할 |
|---|---|---|
| Plan | `blueprint.json` | 연구 질문, contribution, notation, 실험 설계와 venue 제약을 고정 |
| Cite | `refs.bib` | metadata로 검증한 bibliography를 만든 뒤 재사용 |
| Write | `sections/*.tex` | 동일 project context에서 원고를 작성 |
| Refine·Review | 수정 원고·review 기록 | 문서 전체 일관성을 고치고, 독립 review pass가 문제 제기를 검증 |
| Figure | vector/raster figure와 생성 기록 | 측정 결과는 plotting으로, 설명 그림은 reconstruction 가능한 형태로 처리 |
| Assembly | `main.tex`, `main.pdf` | template에 맞춰 조립·compile하고 unresolved citation과 오류를 확인 |
| Experiment | log·metric·table·figure | claim에 필요한 evidence를 실행 결과로 채우고 원고에 전파 |

품질 제어는 두 층으로 나뉜다. deterministic gate는 blueprint, citation, manuscript, figure, LaTeX project의 기계적으로 확인 가능한 조건을 막는다. 반면 self-review와 adversarial review는 문단의 논증, evidence와 claim의 적합성, 원고 전체의 drift처럼 해석이 필요한 문제를 반복 검토한다. 각 review issue는 문제가 된 원문 passage를 가리켜야 하며, 실제 문제인지·다른 곳에서 이미 해소됐는지·scope 밖인지를 다시 확인한다.[2]

특히 흥미로운 장치는 **Self-Refutation Loop**다. 실험이 가설을 지지하지 않을 때 agent가 방법·실험·서술을 계속 바꾸며 같은 방향을 무한 재시도하는 실패를 별도 유형으로 정의한다. Spark-to-Paper는 experiment–critique–revision cycle을 최대 7회로 제한하고, 끝내 지지되지 않으면 성공 논문으로 미화하지 않고 시도·결과·부족한 근거를 failure report로 남긴 뒤 새 방향으로 이동한다.[2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/spark-to-paper-role-aware-figures.png">
    <img
      src="/images/blog/spark-to-paper-role-aware-figures.png"
      alt="Spark-to-Paper의 role-aware figure generation. 측정 결과 그림은 기록된 측정값에서 plotting code와 native vector PDF로 이어지고, 설명 그림은 initial raster를 HTML로 재구성해 검증되면 editable vector PDF로 만들고 아니면 원본 raster를 보존한다."
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    논문 Figure 4. 결과 그림과 설명 그림을 같은 방식으로 다루지 않고, 전자는 측정값과 묶고 후자는 재구성 신뢰도에 따라 vector 또는 원본 raster를 선택한다.[2]
  </figcaption>
</figure>

## 공개된 근거에서 확인되는 점

저자들은 사전에 고정한 8개 research topic에서 full stack을 평가했다고 보고한다. citation validity는 384개 reference 중 해결된 비율로, figure editability는 의도적으로 raster인 경우를 제외한 약 1,900개 figure element를 대상으로 계산했다. 결과는 모두 저자 instrumented run 또는 공개 artifact의 retrospective audit에 기반하며, 같은 model backbone·topic·가격 조건으로 재실행한 통제 비교는 아니라는 범위를 유지해야 한다.[2]

| 저자 보고 지표 | Spark-to-Paper full stack | 비교·해석 시 주의점 |
|---|---:|---|
| Citation validity | <strong>99.5%</strong> | 8개 campaign paper의 384 reference 기준 |
| Figure editability | <strong>96.4%</strong> | 약 1,900개 요소 기준이며 의도적 raster는 제외 |
| Fabrication detection | <strong>14% → 92%</strong> | 동일한 36개 seeded probe에서 quality stack을 ablation한 결과 |
| Adversarial review precision | <strong>74%</strong> | blinded rater가 확인한 57개 review issue 기준 |
| 평균 생성 자원 | <strong>11.9M token / $8.1 / 3.2시간</strong> | 8 topic 평균의 저자 측정치 |

이 수치가 보여 주는 것은 “논문을 $8.1에 쓴다”는 일반 가격표가 아니다. full integrity·review stack은 single-pass draft보다 훨씬 많은 token과 시간을 쓰는 대신, seeded fabrication probe를 잡아내는 비율을 높였다는 **quality–cost 교환**이다. 또한 citation validity와 figure editability는 연구 품질 전부를 대변하지 않는다. novelty, 방법의 타당성, 실험의 external validity는 여전히 domain expert와 독립 재현이 필요한 층이다.

공개 구현도 함께 확인할 수 있다. GitHub repository는 MIT license로 공개되어 있고, 조회 시점 기준 592 stars, v1.2 release와 tag를 제공한다.[3][4][5] 다만 paper는 13개 skill이라고 설명하는 반면, 현재 repository의 `skills/`에는 orchestrator를 포함한 14개 directory가 있고 plugin manifest도 14개 composable skill이라고 적는다. 같은 manifest는 version `1.2.0`이지만 루트 `VERSION` 파일은 `1.1.0`, homepage/repository metadata는 이전 `Albus-White` 경로를 가리킨다.[3][6] 이는 방법의 핵심을 부정하는 문제는 아니지만, 설치·fork·업데이트 자동화를 맡을 팀이라면 **논문 설명과 현재 배포 metadata를 분리해 검증해야 한다**는 release-maturity 신호다.

## 실무 관점에서의 해석

Spark-to-Paper의 가장 강한 기여는 “13개의 스킬” 자체보다 **연구 자동화에서 무엇을 model 판단에 맡기고 무엇을 artifact·gate로 고정할지**를 분리한 데 있다. 실험 전에 required evidence와 table structure를 약속하고, 그 뒤 나온 결과만 claim에 넣게 하면, agent가 깔끔한 narrative를 만들기 위해 evaluation protocol을 사후 조정할 여지를 줄일 수 있다.

이 구조는 논문 생성 밖에도 옮길 수 있다. 예컨대 data product의 launch report라면 blueprint는 성공 기준과 metric owner를, citation gate는 source freshness를, experiment artifact는 dashboard snapshot과 query를, claim admission은 publishable statement의 승인 상태를 맡을 수 있다. 핵심은 “한 번 검토했다”가 아니라 **각 claim이 어떤 재현 가능한 evidence에 의해 통과·축소·폐기됐는지**를 남기는 것이다.

그러나 이를 완전 자율 연구자로 과장해서도 안 된다. 저자 결과는 8개 topic, 제한된 controlled evaluation, self-reported execution log에 기반한다. 공개 프로젝트가 runnable skill suite와 release를 제공하는 것은 긍정적이지만, 독립 팀이 다른 연구 domain·다른 coding assistant·실제 고비용 실험 환경에서 같은 citation quality와 claim discipline을 얻는지는 별도 질문이다. 더구나 “언제 새 가설로 넘어갈지”, 어떤 experiment budget을 허용할지, failure report를 외부에 공개할지는 자동화 규칙만으로 해결되지 않는 연구 governance 문제다.

그럼에도 이 논문은 유용한 기준을 남긴다. 연구 agent를 도입할 때는 “PDF를 만들 수 있는가”보다 다음을 먼저 물어야 한다. 관측되지 않은 수치가 원고에 들어가지 않는가, 실험 결과가 앞선 claim을 실제로 되돌릴 수 있는가, 실패한 trajectory가 조용히 사라지지 않는가. Spark-to-Paper는 이 세 질문을 skill, artifact, deterministic gate의 형태로 구현하려는 비교적 구체적인 답이다.

## Sources

[1] [arXiv abstract](https://arxiv.org/abs/2608.11924) — 논문 서지·초록·제출 정보
[2] [arXiv HTML](https://arxiv.org/html/2608.11924v1) — 방법, evaluation protocol, 표와 공식 그림
[3] [Spark-to-Paper Skills GitHub](https://github.com/Spark-To-Paper-Skills/spark-to-paper-skills) — 공개 구현과 README
[4] [GitHub repository API](https://api.github.com/repos/Spark-To-Paper-Skills/spark-to-paper-skills) — license, stars, 생성·갱신 시점
[5] [GitHub latest release API](https://api.github.com/repos/Spark-To-Paper-Skills/spark-to-paper-skills/releases/latest) — v1.2 release metadata
[6] [GitHub repository tree API](https://api.github.com/repos/Spark-To-Paper-Skills/spark-to-paper-skills/contents) — current plugin, VERSION, skills tree
