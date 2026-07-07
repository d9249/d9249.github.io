---
title: "SkillComposer는 에이전트 스킬 선택을 검색이 아니라 순서 있는 생성 문제로 바꾼다"
date: "2026-07-07T15:46:25"
description: "arXiv 2606.32025는 LLM 에이전트가 어떤 스킬을 몇 개, 어떤 순서로 불러올지를 하나의 시퀀스 생성 문제로 정식화하고, 3.9M 학습 파라미터의 작은 컴포저가 검색·전체 SFT 방식보다 안정적인 스킬 조합을 만든다는 점을 보여준다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - SkillComposer
  - Agent Skills
  - Skill Composition
  - Coding Agents
  - Retrieval
image: "/images/blog/skillcomposer-structured-composition.webp"
draft: false
---

에이전트 스킬 생태계에서 다음 병목은 “스킬을 얼마나 많이 만들었는가”가 아니라, **현재 작업에 맞는 스킬을 어떤 순서로 얼마나 노출할 것인가**다. 작은 스킬 라이브러리에서는 모델에게 목록을 보여 주고 알아서 고르게 해도 그럭저럭 동작한다. 하지만 스킬이 수백 개 이상으로 커지면 모든 스킬을 컨텍스트에 넣는 방식은 비용이 커지고, 단순 검색은 “무엇이 관련 있는가”만 말할 뿐 “몇 개를 어떤 실행 순서로 써야 하는가”를 답하지 못한다.

`Generative Skill Composition for LLM Agents`는 이 문제를 **structured skill composition**으로 다시 정의한다. 핵심 시스템인 **SkillComposer**는 196개 스킬로 구성된 닫힌 라이브러리에서 작업 설명과 환경 문맥을 보고, 스킬 ID의 가변 길이 시퀀스를 생성한다. `STOP` 토큰이 나오기 전까지의 길이가 스킬 개수이고, 생성된 순서가 실행 순서다. 즉 subset selection, cardinality prediction, ordering을 별도 단계가 아니라 하나의 생성 문제로 묶는다.

흥미로운 점은 규모다. 논문과 프로젝트 페이지 기준 SkillComposer는 약 **3.9M trainable parameters**만 학습한다. 그럼에도 600M 파라미터 전체 SFT 베이스라인과 같은 라이브러리·학습 데이터 조건에서 synthetic test에서는 더 높은 Set F1을 보이고, real-task holdout에서는 SFT보다 **+19.3 pp** 높은 Set F1을 기록한다. downstream SkillsBench에서도 GPT-5.2-Codex와 Gemini-3-Pro 조건에서 no-skill baseline 대비 각각 **+23.1 pp**, **+18.2 pp** pass-rate 개선을 보고한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/skillcomposer-structured-composition.webp"
    alt="SkillComposer structured skill composition overview"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 프로젝트 페이지의 구조화된 스킬 조합 그림. Direct reasoning은 전체 라이브러리를 보고 암묵적으로 선택하고, retrieval은 unordered subset을 반환하지만, SkillComposer는 선택·개수·순서를 하나의 ordered plan으로 예측한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

스킬은 단순한 도구 호출 목록이 아니다. 논문은 스킬을 이름과 설명, 적용 조건, 절차적 정책, 종료 조건, 선택적 호출 인터페이스나 리소스를 가진 모듈형 절차 지식으로 본다. 예를 들어 샌드박스 환경 구성, 테스트 스위트 실행, 여러 파일에 걸친 리팩토링, PDF 처리, 데이터 다운로드 같은 작업은 각각 별도의 스킬 패키지가 될 수 있다.

기존 방식은 크게 두 갈래다. 첫째, 전체 스킬 컬렉션을 에이전트에게 보여 주고 직접 reasoning하게 하는 방식이다. 이 경우 모델의 실행 trace 안에 스킬 선택이 묻히고, 어떤 스킬이 왜 선택되었는지 검증하기 어렵다. 또한 196개 스킬 전체를 프롬프트에 넣는 것은 토큰 비용과 context pollution을 만든다.

둘째, BM25, TF-IDF, dense embedding, LLM reranker 같은 retrieval 방식이다. 검색은 작업과 의미적으로 관련 있는 스킬 후보를 찾는 데 강하다. 그러나 top-k retrieval은 보통 **정해진 k**를 전제로 하고, 반환 결과는 ranked list일 뿐 실행 계획은 아니다. 실제 작업에서는 “검색 → 편집 → 테스트”처럼 순서가 중요한데, 검색 점수만으로는 이 구조가 드러나지 않는다.

SkillComposer가 겨냥하는 병목은 바로 이 세 질문의 결합이다.

| 결정 | 일반 retrieval에서 빠지기 쉬운 부분 | SkillComposer의 표현 |
|---|---|---|
| 어떤 스킬을 쓸 것인가 | 관련 후보를 찾을 수는 있지만 최종 subset은 별도 판단이 필요 | 생성된 스킬 ID |
| 몇 개를 쓸 것인가 | top-k를 사람이 고정하거나 oracle k가 필요 | `STOP` 전까지의 길이 |
| 어떤 순서로 쓸 것인가 | ranked list와 실행 순서는 다름 | 생성 순서 자체가 실행 순서 |

이 관점에서 SkillComposer는 스킬 검색기를 대체한다기보다, 검색을 포함한 **스킬 오케스트레이션의 출력 형식**을 바꾼다. 검색은 “관련성 prior”로 들어가고, 최종 출력은 실행 가능한 ordered skill plan이 된다.

## 핵심 아이디어 / 구조 / 동작 방식

SkillComposer의 입력은 작업 `x`, 환경 문맥 `c`, 그리고 고정된 스킬 라이브러리 `S`다. 실험 라이브러리에는 196개 스킬이 있으며, 각 스킬은 전체 본문이 아니라 이름과 한 줄 설명 같은 compact metadata로 먼저 노출된다. 전체 스킬 지침과 리소스는 예측된 시퀀스가 확정된 뒤에만 실제 에이전트 컨텍스트로 로드된다. 이는 에이전트 스킬 시스템에서 자주 쓰이는 progressive disclosure와 잘 맞는 구조다.

모델은 크게 세 부분으로 읽을 수 있다.

1. **동결된 task encoder** — Qwen3-Embedding-0.6B를 retrieval-tuned encoder로 사용하고, 작업 설명·환경 문맥·스킬 메타데이터를 1024차원 표현으로 풀링한 뒤 256차원으로 투영한다. 인코더는 동결되고, 작은 projection과 decoder 쪽이 학습된다.

2. **작은 autoregressive decoder** — 3-layer, hidden width 256, 4 attention heads의 Transformer decoder가 스킬 인덱스 시퀀스를 생성한다. 출력 vocabulary는 `{1, ..., K} ∪ {STOP}`처럼 닫혀 있으므로, 생성된 항목은 항상 라이브러리 안의 유효한 스킬이다.

3. **보조 head와 retrieval-augmented decoding** — cardinality head는 몇 개의 스킬이 필요할지, set-membership head는 어떤 스킬이 plan에 포함될 가능성이 큰지를 보조 신호로 준다. 추론 시점에는 decoder logit에 TF-IDF relevance prior와 set-head score를 결합한다. 논문 표현으로는 contextual logit, lexical relevance, learned membership prior를 합친 fused logit으로 다음 스킬을 고른다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/skillcomposer-method-overview.webp"
    alt="SkillComposer method overview with task encoder, autoregressive decoder, auxiliary heads, and retrieval-augmented decoding"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 프로젝트 페이지의 method overview. 작업·환경·스킬 메타데이터를 인코딩하고, 작은 decoder가 스킬 시퀀스를 생성하며, TF-IDF prior와 set-membership prior가 decoding logit에 결합된다.
  </figcaption>
</figure>

논문의 예시는 이 구조를 직관적으로 보여 준다. “2025년 4월 1일부터 7일까지 미시간주 USGS 관측소 중 홍수를 겪은 곳을 찾아 CSV로 저장하라”는 작업이 들어오면, 모델은 `(104, 184, 55, STOP)` 같은 시퀀스를 출력한다. 이는 `nws-flood-thresholds → usgs-data-download → flood-detection`으로 복원된다. 먼저 홍수 기준선을 가져오고, 그다음 USGS 데이터를 내려받고, 마지막으로 홍수 탐지를 수행하는 순서다.

여기서 중요한 것은 “가장 비슷한 스킬 세 개”가 아니라는 점이다. 결과는 작업에 필요한 dependency order를 가진 plan이다. 스킬 라이브러리가 커질수록 이 차이가 커진다. 특히 한 작업에 필요한 스킬 수가 1개인지 4개인지 모르는 상황에서는 top-3 같은 고정 절단이 좋은 기본값이 되기 어렵다.

## 공개된 근거에서 확인되는 점

학습 데이터는 SkillsBench에 연결된 196개 스킬 라이브러리와 9,872개 task–skill-sequence record로 구성된다. 논문은 이를 세 그룹으로 나눈다. 65개 real anchor task는 human-authored software-engineering task와 gold skill annotation을 제공한다. 2,880개 single-skill synthetic task는 196개 스킬을 균등하게 커버하며, 단순 작업에서 한 스킬 뒤에 멈추는 감각을 학습시킨다. 6,927개 multi-skill synthetic task는 2–5개 스킬 조합을 다루며, dependency edge와 workflow edge를 이용해 순서 근거를 만든다.

스킬 dependency graph도 흥미롭다. 논문 부록 기준 graph는 196개 노드와 924개 edge를 가진다. 이 중 658개는 입력·출력 타입이 맞물리는 dependency edge이고, 266개는 real-task agent trajectory에서 함께 등장한 workflow edge다. 즉 synthetic composition도 완전히 임의 생성이 아니라, 데이터 흐름과 실제 co-occurrence를 섞어 만든다.

스킬 예측 품질에서는 두 가지 결과가 눈에 띈다. In-distribution synthetic test에서 SkillComposer는 Set F1 **73.9**를 기록해 Qwen3-0.6B-Base SFT의 **71.1**보다 높다. 차이는 +2.8 pp지만, 학습 파라미터는 3.9M 대 600M으로 약 154배 작다. Real-task holdout에서는 격차가 더 커진다. SFT는 synthetic에서 real task로 넘어갈 때 27.5 pp 하락해 Set F1 43.6이 되지만, SkillComposer는 62.9로 유지되어 **+19.3 pp** 차이를 만든다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/skillcomposer-cardinality-robustness.webp"
    alt="SkillComposer Set F1 by gold cardinality"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 프로젝트 페이지의 cardinality robustness 그림. SkillComposer의 이점은 특히 gold cardinality가 1인 구간, 즉 불필요한 스킬 과잉 로딩이 크게 벌점이 되는 상황에서 두드러진다.
  </figcaption>
</figure>

Downstream task performance도 같은 방향이다. 논문은 SkillsBench 88개 중 PDF, xlsx, pptx, docx 같은 파일 확장자 기반 format skill이 지배적인 13개 task를 제외하고 75개 task를 평가한다. 각 조건은 deterministic pytest verifier가 붙은 Harbor evaluation framework에서 3회 시도된다.

| Skill condition | GPT-5.2-Codex Pass | GPT-5.2-Codex Tok. | Gemini-3-Pro Pass | Gemini-3-Pro Tok. |
|---|---:|---:|---:|---:|
| Gold Skills | 51.1% | 1.12M | 48.4% | 1.18M |
| No Skills | 22.2% | 0.94M | 25.8% | 0.99M |
| All Skills | 29.3% | 1.27M | 38.7% | 1.33M |
| Retrieval top-3 | 44.0% | 1.09M | 41.8% | 1.14M |
| SkillComposer | 45.3% | 1.03M | 44.0% | 1.08M |

이 표에서 가장 단순하지만 중요한 결론은 “모든 스킬을 넣으면 된다”가 아니라는 것이다. All Skills는 no-skill보다는 낫지만, prompt token을 크게 늘리면서도 Gold Skills headroom의 작은 일부만 회수한다. Retrieval top-3는 훨씬 강하지만, 여전히 고정 k와 ordered plan 부재의 한계를 가진다. SkillComposer는 non-oracle 조건에서 가장 높은 pass rate를 보이면서 skill-loaded 조건 중 가장 낮은 prompt token budget을 쓴다.

Ablation도 설계의 방향을 뒷받침한다. AR-only decoder는 Set F1 69.3이고, set head만 추가하면 71.8, 최종 SkillComposer는 73.9다. 반대로 decode-time set-fusion을 제거하면 65.0, retrieval prior를 제거하면 67.5로 떨어진다. 즉 작은 decoder 하나만으로 끝나는 구조가 아니라, autoregressive sequence prediction, set-level supervision, lexical retrieval prior가 함께 작동한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/skillcomposer-compute-frontier.webp"
    alt="SkillComposer compute-accuracy frontier"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 프로젝트 페이지의 compute–accuracy frontier. 논문은 SkillComposer가 predicted-k 방법 중 파레토 최적에 가깝고, SFT 대비 약 154배 적은 학습 파라미터와 약 25배 적은 training compute로 더 나은 Set F1을 보인다고 해석한다.
  </figcaption>
</figure>

릴리스 표면은 조금 조심해서 봐야 한다. 공식 프로젝트 페이지는 paper PDF와 arXiv 페이지를 제공하고, `Code` 버튼도 있지만 HTML에는 “code repository URL once released”로 교체하라는 TODO 주석이 남아 있으며 버튼 href가 프로젝트 페이지 자체를 가리킨다. 즉 확인 시점의 공개 근거는 논문, arXiv HTML/PDF, 프로젝트 페이지, 공식 그림과 결과표가 중심이고, 별도 GitHub 구현 저장소가 공개되어 있다고 보기는 어렵다.

## 실무 관점에서의 해석

SkillComposer의 실무적 메시지는 꽤 명확하다. agent skill registry가 커지면 retrieval만으로는 충분하지 않다. 운영 시스템은 최소한 다음 세 가지 정보를 함께 다뤄야 한다.

| 운영 질문 | 단순 검색의 답 | SkillComposer식 해석 |
|---|---|---|
| 현재 작업에 관련 있는 스킬은? | similarity score가 높은 후보 | plan에 포함될 스킬 subset |
| 컨텍스트에 몇 개까지 넣을 것인가? | top-k hyperparameter | STOP으로 예측되는 작업별 cardinality |
| 어떤 순서로 읽고 실행할 것인가? | ranked list 또는 사람이 후처리 | autoregressive generation 순서 |

이 차이는 특히 production coding agent에서 중요하다. 예를 들어 “코드베이스 전체에서 deprecated API를 찾아 migration하고 regression test를 돌리라”는 작업은 검색 스킬, 편집 스킬, 테스트 스킬이 모두 관련 있다. 하지만 테스트 스킬이 먼저 오거나, 편집 스킬만 로드되고 검색·검증이 빠지면 성공률은 떨어진다. 스킬은 문서 조각이 아니라 실행 절차이기 때문에, RAG처럼 “관련 문서 top-k”를 붙이는 것만으로는 충분하지 않다.

또 하나의 메시지는 **작은 routing specialist의 가치**다. 많은 시스템은 스킬 선택을 주 모델의 프롬프트 추론에 맡긴다. 하지만 SkillComposer 결과는 닫힌 라이브러리에서는 작은 모델이 라이브러리 구조와 task–composition pair를 직접 학습하는 편이 더 안정적일 수 있음을 보여 준다. 모든 reasoning을 거대한 generalist LM에게 맡기는 대신, “어떤 외부 절차 지식을 노출할지”를 작은 specialist가 먼저 결정하는 구조다.

내가 보기에는 이 논문이 SRA, SkillsVote, Local Harness 같은 최근 흐름과 연결되는 지점도 중요하다. SRA는 스킬 검색과 로딩 판단을 분리해 평가해야 한다고 말하고, SkillsVote는 스킬 추천·귀속·진화를 lifecycle governance로 본다. SkillComposer는 그 가운데 **추천/로딩 직전의 plan construction**을 더 구조화한다. 즉 스킬 생태계의 다음 층은 단순 marketplace나 vector search가 아니라, 스킬의 의존성·개수·순서를 다루는 orchestration layer가 될 가능성이 크다.

다만 현재 결과를 곧바로 “일반 agent skill 문제의 해결”로 읽으면 안 된다. 논문도 한계를 명시한다. 실험은 주로 text-only task description과 code-oriented skill library에 집중한다. 실제 기업 환경에서는 권한, 상태, 네트워크, 파일 시스템, 외부 API, 비동기 승인, 보안 정책이 스킬 선택에 영향을 준다. 또한 라이브러리가 온라인으로 계속 업데이트되는 장기 실행 환경이나, 스크린샷·음성·로봇 상태가 섞인 multimodal task specification까지 다루지는 않는다.

그럼에도 방향성은 강하다. 스킬 라이브러리를 운영하는 팀이라면 “스킬 설명을 잘 쓰자”에서 멈추지 말고, 스킬 간 dependency, task별 cardinality, 실행 순서, 로딩 비용, 실패 시 attribution을 모두 registry metadata와 evaluation loop로 끌어올려야 한다. SkillComposer는 그중 skill composition을 닫힌 vocabulary generation 문제로 정식화한 깔끔한 사례다.

결론적으로 이 작업은 에이전트 스킬 시스템을 프롬프트 engineering에서 **library-aware planning problem**으로 이동시킨다. 커지는 스킬 라이브러리를 brute-force context로 밀어 넣는 대신, 작은 composer가 어떤 절차 지식만 노출할지 먼저 정한다. 스킬이 많아지는 시대에는 더 긴 컨텍스트보다, 더 좋은 컴포저가 에이전트 품질의 차이를 만들 수 있다.

Sources: https://discuss.pytorch.kr/t/skillcomposer-llm/11090, https://arxiv.org/abs/2606.32025, https://arxiv.org/html/2606.32025v1, https://skill-composer.github.io/, https://skill-composer.github.io/static/pdfs/paper.pdf
