---
title: "Rubric4Setwise는 ‘관련 문서’를 고르는 대신 ‘좋은 문서 묶음’을 채점한다"
date: "2026-07-26T01:32:35+09:00"
description: "SetwiseEvalKit은 relevance·authenticity·quality부터 complementarity·redundancy·conflict, completeness·density·reachability까지 3단계 9차원 rubric으로 RAG 문서 집합을 진단하고, Rubric4Setwise는 그 평가 기준 자체를 training-free 선택 신호로 바꾼다."
author: "Sangmin Lee"
category: "evaluation-benchmarks"
tags:
  - RAG
  - Retrieval Evaluation
  - SetwiseEvalKit
  - Rubric4Setwise
  - Reranking
  - Benchmark
  - Document Selection
draft: false
---

RAG에서 retrieval은 오랫동안 문서 하나씩의 relevance를 판정하고, 이를 nDCG 같은 지표로 합산하는 문제였다. 하지만 답을 만드는 주체가 사람이 아니라 LLM이라면, 높은 점수의 상위 5개 문서가 곧 좋은 context는 아니다. 같은 사실을 반복해 token budget을 잠식하거나, 서로 충돌하는 주장을 섞거나, 추론 사슬의 핵심 고리가 빠질 수 있다. 개별 문서가 모두 관련 있어도 **문서 묶음**은 나쁠 수 있다는 문제다.

`Beyond Relevance-Centric Retrieval: Rubric-Oriented Document Set Selection and Ranking`은 이 차이를 평가 대상으로 만든다. 저자들은 short-form QA와 multi-round long-form research 두 장면에 걸친 `SetwiseEvalKit`을 만들고, 문서 집합을 3개 level·9개 dimension의 query-specific rubric으로 채점한다. 이어 `Rubric4Setwise`는 rubric을 평가표에만 두지 않고, 어떤 문서 조합을 선택할지 정하는 신호로 사용한다.

논문의 중심 주장은 단순히 “새 reranker가 이겼다”가 아니다. **무엇이 더 나은 context set인지 설명할 수 있는 evaluation을 만들고, 그 evaluation을 selection loop에 되돌려 넣을 수 있는가**다. 논문 보고치에서는 rubric coverage와 downstream 답변 품질의 Pearson 상관이 **r=0.92**(p=0.0013)였고, 이 연결이 성립할 때만 set-level evaluation이 실제 optimization signal이 될 수 있다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/setwiseevalkit-taxonomy.webp">
    <img
      src="/images/blog/setwiseevalkit-taxonomy.webp"
      alt="문서 수준·집합 수준·전역 수준의 9개 rubric 차원과 candidate documents에서 reranker·selected documents·judge로 이어지는 SetwiseEvalKit 평가 흐름"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 framework figure. SetwiseEvalKit은 문서 하나의 품질뿐 아니라 문서 사이의 보완성·중복·충돌, 그리고 전체 추론 경로의 완결성까지 rubric coverage로 본다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

전통적인 retrieval metric은 문서의 relevance를 독립적으로 채점한 뒤 합친다. 이 방식은 빠르고 명료하지만, “문서 A가 좋고 문서 B도 좋으니 A+B도 좋다”는 가정을 깔고 있다. LLM context에서는 이 가정이 자주 깨진다. 중복 문서 두 개는 같은 정보를 두 번 넣어 context window를 낭비하고, 상충하는 문서는 generator를 흔들며, 필요한 한 조각이 빠지면 agent가 불필요한 추가 검색 round를 돌게 된다.

논문의 motivation example은 이를 선명하게 보여 준다. 상위 5개 문서가 모두 query와 관련돼 nDCG@5가 100%여도, 일부 문서는 같은 내용을 반복하고 일부는 사실과 충돌하며 핵심 정보는 빠질 수 있다. 사람이라면 읽으면서 걸러낼 수 있지만, retrieval output이 곧바로 model context가 되는 RAG에서는 selection 단계가 이 조정을 대신해야 한다.

따라서 이 논문은 retrieval quality를 “관련 문서의 순위”가 아니라 “downstream generation에 충분하고, 서로 잘 맞으며, 불필요한 부분이 적은 evidence package”의 품질로 재정의한다. 평가·진단·최적화를 분리하지 않고 하나의 loop로 연결하려는 이유다.

| relevance-only 평가가 놓치기 쉬운 것 | SetwiseEvalKit이 묻는 질문 | RAG에서의 영향 |
|---|---|---|
| 문서별 relevance만 높음 | 문서들이 서로 보완적인가? | 같은 token budget에서 evidence coverage를 높임 |
| top-k를 고정해 반환 | 중복을 빼도 필요한 근거가 남는가? | 불필요한 context와 distraction을 줄임 |
| 충돌을 독립 relevance로 처리 | 동일 사실에 모순된 주장들이 있는가? | generator가 잘못된 사실을 섞을 위험을 낮춤 |
| 한 round의 rank만 봄 | 전체 document set이 추론 경로를 완성하는가? | multi-round agent의 다음 검색 필요성을 진단 |

## 핵심 구조: 3단계, 9차원의 query-specific rubric

SetwiseEvalKit은 약 **2.8만 개**의 고품질 rubric을 short-form과 long-form 두 scenario에 배치한다. rubric은 모든 query에 같은 checklist를 적용하는 방식이 아니다. query와 예상 답을 바탕으로, 해당 query의 문서 집합이 어떤 근거를 갖춰야 하는지 평가 기준을 생성한다.

taxonomy는 세 level로 나뉜다.

| level | dimension | 보는 대상 |
|---|---|---|
| Document-level | Relevance, Authenticity, Quality | 각 문서가 질문과 맞고, 믿을 수 있으며, 정보 자체의 품질이 충분한가 |
| Set-level | Complementarity, Redundancy, Conflict | 문서들이 서로 다른 근거를 보완하는지, 반복되는지, 같은 사실에 충돌하는지 |
| Global-level | Completeness, Density, Reachability | 묶음 전체가 필요한 정보를 빠짐없이·압축적으로 제공하고, 답의 reasoning chain까지 도달 가능한지 |

judge는 문서 집합과 rubric을 함께 받아 각 항목을 0~4로 채점한다. 문서가 전부 relevance 0이면 나머지 8차원은 아예 skip하는 relevance gate를 두고, 비교 가능한 동일 사실이 둘 이상 없을 때 conflict는 “실패”가 아니라 not-applicable로 다룬다. 무의미한 set-level 점수를 만들어 내지 않기 위한 설계다.

평가 결과를 보면 기존 12개 reranker는 단순한 leader board로 정리되지 않는다. short-form에서 setwise method는 set composition을 직접 다루는 장점으로 높게 나오지만, multi-turn long-form에서는 reasoning-enhanced reranker가 더 강하다. 저자들이 보고한 overall coverage 최고치는 short-form의 SetR **45.85%**, long-form의 ReasonRank **33.05%**다. 강한 방법도 cross-document coordination을 안정적으로 풀지 못했다는 해석이 가능하다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/setwiseevalkit-coverage-correlation.webp">
    <img
      src="/images/blog/setwiseevalkit-coverage-correlation.webp"
      alt="여러 reranker의 overall rubric coverage score와 downstream answer average 사이에 Pearson r 0.92의 양의 상관이 있음을 보여 주는 산점도"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 correlation figure. 이 benchmark의 핵심 검증은 rubric coverage가 더 높은 context set이 실제 downstream generation에서도 더 좋은 결과를 내는지다. 논문은 r=0.92, p=0.0013을 보고한다.
  </figcaption>
</figure>

## Rubric4Setwise: 평가 기준을 선택 함수로 돌려보내기

`Rubric4Setwise`는 별도 fine-tuning 없이 query `q`, query-specific rubric `R`, candidate pool `C`에서 rubric-based set utility가 가장 높은 subset을 고른다. 목표는 고정된 top-k가 아니라 `S* = argmax f(S; q, R)`이며, subset의 크기도 rubric 충족 상태에 따라 적응적으로 정한다. 논문 구현에서는 Qwen3-8B가 chain-of-thought prompting으로 이 utility를 추론한다.

이 framing의 요점은 “더 높은 ranking score의 문서”를 찾는 데 있지 않다. 예를 들어 이미 선택된 문서가 정의와 배경을 충분히 제공했다면 다음 문서는 비슷한 설명이 아니라, 빠진 비교 근거나 reasoning chain의 연결 고리를 채워야 한다. 반대로 후보 문서가 맞는 말이더라도 이미 있는 내용의 반복이면 selection value가 낮아진다.

논문이 보고한 downstream 결과는 다음과 같다. 모두 저자 실험의 reported result이며 independent reproduction은 아니다.

| scenario | Rubric4Setwise | 비교 지점 | 해석 |
|---|---:|---:|---|
| Short-form EM | **26.10** | SetR 25.13 | 2.66개 문서만으로 EM +0.97 |
| Short-form F1 | **29.32** | SetR 28.70 | fixed top-5보다 compact subset이 충분할 수 있음을 시사 |
| Long-form LLM-judge | **70.57** | SetR 70.54, MonoT5 70.33 | 최고 점수지만 상위권 간 격차는 작음 |
| Long-form unique passages | **20.52** | SetR 29.23 | 더 적은 누적 문서로 유사하거나 더 높은 답 품질을 보고 |
| Long-form 평균 search rounds | **4.52** | SetR 4.73 | query별 rubric이 추가 검색 필요성을 줄일 가능성 |

여기에는 중요한 한계가 있다. 논문이 명시하듯 Rubric4Setwise는 **reference answer로 생성한 rubric을 쓰는 oracle setting**에서 동작한다. 이는 “rubric이 selection signal로 유효한가”를 보이는 empirical upper bound로는 의미가 있지만, 실제 open-web retrieval에서 answer를 모르는 상태에 그대로 배치할 수 있다는 뜻은 아니다. 다음 단계로 저자들이 제시한 것도 rubric preference를 trainable reward로 distill해 reference answer 없이 multi-dimensional quality를 내재화하는 방향이다.

## 공개 범위와 재현성: data와 실험 pipeline은 열렸지만 packaging은 거칠다

공식 bundle은 논문, project page, public GitHub repository, Hugging Face dataset으로 구성된다. Hugging Face의 `kailinjiang/SetwiseEvalKit`에는 short·long JSONL과 공식 figures가 있고, API 기준 public·ungated 상태다. GitHub README는 `run.sh` 기반의 `rank → merge shards → generate → summarize` pipeline, baseline reranker 설정, rubric LLM-as-judge scoring CLI를 제공한다. 즉 benchmark data와 평가·비교 harness는 실제로 공개된 상태다.

다만 release maturity는 조심해서 읽어야 한다. 확인 시점 GitHub repository는 2026-07-21에 생성된 새 public repo이며, tags 목록은 비어 있고 `releases/latest` endpoint는 404다. GitHub API의 license field도 null이며 root `LICENSE`와 `COPYING`은 404였다. 더구나 root `pyproject.toml`은 package name을 `rankify`로 두고 `license = {file = "LICENSE"}`를 가리키지만 실제 해당 파일은 repository에 없다. 이는 코드가 없다는 뜻은 아니지만, 재사용·배포 관점에서 **license와 package identity를 정리하기 전의 research repository**라는 신호다.

실행 비용도 가볍지 않다. README의 single-reranker 예시는 CUDA GPU 0~3을 지정하고, Rubric4Setwise 입력에는 `hybrid_rubrics`가 포함된 JSONL이 필요하다. 일부 baseline은 외부 LoRA adapter·base model을 내려받으며, judge scorer는 별도의 LLM application credential을 요구한다. 따라서 “dataset을 download해 바로 benchmark를 돌리는” 형태보다, 여러 model backend와 GPU·judge endpoint를 정합해야 하는 experimental pipeline에 가깝다.

## 실무 관점에서의 해석

이 논문의 생산적인 메시지는 RAG 평가의 output을 answer correctness 하나로만 보지 말라는 데 있다. answer가 맞았더라도 운 좋게 중복·충돌·불완전한 context를 넘어섰을 수 있고, 다음 query에서는 같은 retrieval policy가 무너질 수 있다. 반대로 set-level rubric은 어떤 정보가 빠졌는지, 어느 문서가 불필요한지, 왜 더 검색해야 하는지를 product team이 검토할 수 있는 진단 단위로 만든다.

실무 적용은 논문의 oracle setting을 그대로 복제하기보다 세 단계로 시작하는 편이 현실적이다. 첫째, domain별로 **complementarity·redundancy·conflict·completeness**의 operational definition을 적는다. 둘째, offline gold query에서 set-level audit을 수행해 top-k가 실제로 반복·충돌을 늘리는지 확인한다. 셋째, online에서는 reference answer 대신 query plan, user-approved rubric, retrieval trace, human review queue 등 관측 가능한 신호로 rubric의 일부를 채운다.

SetwiseEvalKit은 아직 일반 목적 RAG의 최종 표준이나 production-ready selector는 아니다. long-form 결과의 최고점 차이는 작고, evaluation도 LLM judge에 의존하며, Rubric4Setwise의 핵심 selection result는 answer-aware oracle 조건이다. 그럼에도 context를 “순위가 매겨진 문서 목록”이 아니라 **제약을 만족해야 하는 evidence set**으로 보는 관점은, agentic search와 long-context RAG가 커질수록 더 중요해질 것이다.

Sources: https://arxiv.org/abs/2607.19747, https://arxiv.org/html/2607.19747, https://rubric4setwise.github.io/, https://github.com/Rubric4Setwise/Rubric4Setwise, https://huggingface.co/datasets/kailinjiang/SetwiseEvalKit
