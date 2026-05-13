---
title: "SRA는 에이전트 스킬을 프롬프트 목록에서 검색 가능한 능력 코퍼스로 바꾼다"
date: "2026-05-11T12:50:25"
description: "arXiv 2604.24594는 Skill Retrieval Augmentation과 SRA-Bench를 통해 에이전트 스킬 검색·로딩·적용을 분리 평가하고, 병목이 검색 품질만이 아니라 모델의 스킬 로딩 판단에 있음을 보여준다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agents
  - Skill Retrieval
  - SRA-Bench
  - Agent Evaluation
  - RAG
draft: false
---

에이전트가 실제 작업을 맡기 시작하면, 모델 자체의 지식만으로는 충분하지 않다. 코딩 에이전트에는 `SKILL.md` 같은 작업 지침이 붙고, 데이터 분석 에이전트에는 라이브러리별 사용법이 필요하며, 운영 자동화 에이전트에는 조직 내부 절차와 검증 규칙이 필요하다. 문제는 이 스킬들이 늘어날수록 “모든 스킬을 프롬프트에 나열하고 모델에게 고르게 하자”는 방식이 빠르게 무너진다는 데 있다.

**Skill Retrieval Augmentation for Agentic AI**는 이 병목을 정면으로 다룬다. 논문은 에이전트 스킬을 단순 문서나 도구 목록이 아니라, 필요할 때 검색해 불러오는 **외부 능력 코퍼스**로 재정의한다. 그리고 이를 **Skill Retrieval Augmentation, SRA**라는 문제로 공식화한 뒤, 5,400개 테스트 인스턴스와 26,262개 스킬 코퍼스로 구성된 **SRA-Bench**를 제안한다.

흥미로운 점은 결론이 단순히 “검색을 더 잘하자”가 아니라는 것이다. 실험 결과는 외부 스킬이 성능을 올릴 수 있음을 보여 주지만, 동시에 현재 LLM 에이전트가 **검색된 스킬을 언제 로드해야 하는지, 검색 결과에 실제 gold skill이 있는지, 자기 파라메트릭 능력만으로 풀 수 있는지**를 충분히 잘 구분하지 못한다는 점도 드러낸다. 즉 에이전트 스킬 생태계의 다음 병목은 skill discovery뿐 아니라 **skill incorporation policy**에 있다.

![SRA paradigm overview](/images/blog/sra-skill-retrieval-overview.webp)

## 무엇을 해결하려는가

오늘날의 에이전트 스킬 시스템은 보통 작은 레지스트리를 전제로 설계된다. 사용 가능한 스킬의 이름, 설명, 호출 조건, 짧은 요약을 프롬프트에 넣고, 모델에게 현재 요청에 맞는 스킬을 고르게 한다. 이 방식은 스킬이 수십 개일 때는 직관적이다. 하지만 스킬이 수천, 수만 개로 늘어나면 상황이 달라진다. 컨텍스트 예산은 금방 소모되고, 비슷해 보이는 스킬이 서로 간섭하며, 모델은 긴 후보 목록 속에서 실제로 필요한 능력을 찾지 못한다.

논문은 이 문제를 RAG와 닮았지만 다른 문제로 본다. 일반적인 RAG가 검색하는 것은 주로 **선언적 지식**이다. 문서, 근거 문장, 사실 조각을 가져와 답변을 grounded하게 만드는 것이 핵심이다. 반면 SRA가 검색하는 것은 **실행 가능한 능력**이다. 스킬은 이름, 설명, 사용 지침, 제약, 절차, 코드나 도구 같은 payload를 함께 가진다. 따라서 좋은 검색 결과란 단순히 주제적으로 비슷한 문서가 아니라, 실제 태스크를 더 잘 풀게 만드는 능력이어야 한다.

이 차이 때문에 평가 기준도 달라진다. SRA 시스템은 세 질문을 모두 통과해야 한다.

| 단계 | 질문 | 실패 양상 |
|---|---|---|
| Skill Retrieval | 큰 스킬 코퍼스에서 관련 후보를 찾았는가 | gold skill이 검색 결과 밖에 있음 |
| Skill Incorporation | 검색된 후보 중 어떤 스킬을 로드할지 판단했는가 | 관련 스킬이 있어도 안 불러오거나, 불필요한 스킬을 불러옴 |
| Skill Application | 로드한 스킬을 실제 추론·행동에 사용했는가 | 스킬을 읽고도 최종 태스크 성능이 오르지 않음 |

여기서 논문의 핵심 기여가 나온다. SRA-Bench는 단순히 최종 정답률만 보는 벤치마크가 아니라, 검색과 로딩, 적용을 분리해서 볼 수 있게 만든다. 그래서 “에이전트가 틀렸다”에서 멈추지 않고, **못 찾은 것인지, 찾았지만 안 쓴 것인지, 썼지만 적용을 못 한 것인지**를 나눠 볼 수 있다.

## 핵심 아이디어 / 구조 / 동작 방식

논문이 정의하는 스킬은 대략 네 요소로 구성된다. 이름은 compact semantic identifier이고, 짧은 설명은 의도와 사용 범위를 요약한다. 본문은 자연어 지침, 제약, 절차를 담고, payload는 코드·도구·외부 리소스처럼 실제 능력을 구현하는 부분이다. 실무적으로는 `SKILL.md`, scripts, static assets, tool binding이 함께 묶인 패키지에 가깝다.

SRA 파이프라인은 세 단계로 움직인다.

첫째, **retrieval** 단계는 사용자 질의와 스킬 코퍼스를 입력받아 상위 k개의 후보 스킬을 만든다. 여기서는 BM25, TF-IDF, dense retriever, hybrid retriever, LLM reranker 같은 방식이 비교된다.

둘째, **incorporation** 단계는 검색된 후보를 그대로 다 넣지 않는다. 에이전트는 이 작업에 외부 스킬이 필요한지, 어떤 후보가 실제로 유용한지, 어떤 형태로 컨텍스트에 넣을지 판단해야 한다. 이 단계가 비어 있을 수도 있다. 모델이 “지금은 스킬이 필요 없다”고 판단하거나, 후보가 모두 부적절하다고 판단할 수 있기 때문이다.

셋째, **application** 단계는 로드된 스킬을 조건으로 실제 답을 만든다. 중요한 것은 SRA의 성공이 retrieval score 하나로 결정되지 않는다는 점이다. 검색이 좋아도 모델이 로드를 안 하면 실패하고, 로드가 되어도 절차를 잘못 적용하면 실패한다.

실험에서 비교한 skill-use 방식도 이 구조를 잘 보여 준다.

| 방식 | 공개 자료에서 확인되는 의미 | 실무적 해석 |
|---|---|---|
| LLM Direct | 외부 스킬 없이 모델 자체로 풀이 | parametric-only baseline |
| Oracle Skill | 정답 gold skill을 직접 제공 | 올바른 스킬 접근의 upper bound |
| Full-Skill Injection | BM25 top-1 스킬 전문을 프롬프트에 삽입 | 가장 단순한 retrieval-injection 방식 |
| LLM Selection | BM25 top-50 후보 중 모델이 하나 선택 | 후보 검색과 모델 선택을 분리 |
| Progressive Disclosure | compact catalog를 보고 필요 시 스킬 로드 | OpenClaw식 점진적 노출 프로토콜에 가까움 |

SRA-Bench 자체는 여섯 종류의 capability-intensive 태스크에서 만들어졌다. TheoremQA, LogicBench, ToolQA, MedCalc-Bench, CHAMP, BigCodeBench를 바탕으로 5,400개 인스턴스를 구성하고, 636개 gold skill을 수작업으로 만든 뒤, 웹에서 수집한 25,626개 distractor skill과 섞어 26,262개 스킬 코퍼스를 만든다. gold skill 비율은 2.4%에 불과하므로, 시스템은 큰 잡음 속에서 실제 능력을 찾아야 한다.

| 데이터셋 | 능력 유형 | 인스턴스 | 스킬 수 | 매핑 | 평가 |
|---|---:|---:|---:|---|---|
| TheoremQA | Theorem Application | 747 | 320 | Single | Rule-Based |
| LogicBench | Logical Reasoning Patterns | 760 | 19 | Single | Rule-Based |
| ToolQA | Tool-Use Workflows | 1,430 | 14 | Single | Rule-Based |
| MedCalc-Bench | Medical Calculators | 1,100 | 55 | Single | Rule-Based |
| CHAMP | Mathematical Concepts | 223 | 89 | Multi | Rule-Based |
| BigCodeBench | Software Libraries | 1,140 | 139 | Multi | Execution |

이 구성이 좋은 이유는 스킬을 단순 지식 문서가 아니라 **반복 가능한 문제 해결 절차**로 본다는 점이다. 예컨대 medical calculator 스킬은 어떤 수식을 언제 쓰고 어떤 값을 추출해야 하는지 알려 주며, BigCodeBench 쪽 스킬은 특정 라이브러리나 프로그래밍 패턴을 적용하는 능력에 가깝다. 따라서 SRA-Bench는 “무엇을 아는가”보다 **어떤 재사용 가능한 절차를 찾아 쓰는가**를 묻는다.

![Noise robustness in SRA-Bench](/images/blog/sra-noise-robustness.webp)

## 공개된 근거에서 확인되는 점

첫 번째 결과는 긍정적이다. 외부 스킬을 제대로 가져오면 대부분의 모델에서 skill-free baseline보다 성능이 오른다. 특히 LLM Selection은 여러 모델에서 평균 성능을 크게 끌어올린다. 예를 들어 Qwen3-32B는 LLM Direct 평균 50.8에서 LLM Selection 62.4로 올라가고, Qwen3-235B는 53.3에서 62.8로 오른다. Oracle Skill은 각각 67.2, 67.5까지 올라가므로, 올바른 스킬 접근 자체에는 여전히 상당한 headroom이 있다.

| 모델 | LLM Direct | Full-Skill Injection | LLM Selection | Progressive Disclosure | Oracle Skill |
|---|---:|---:|---:|---:|---:|
| Llama-3.1-8B | 29.8 | 32.7 | 37.0 | 36.3 | 44.5 |
| Llama-3.3-70B | 47.8 | 52.7 | 59.2 | 48.5 | 64.4 |
| Mistral3.1-24B | 43.4 | 48.5 | 56.6 | 46.7 | 63.2 |
| Qwen3-235B | 53.3 | 56.2 | 62.8 | 59.9 | 67.5 |
| Qwen3-32B | 50.8 | 54.3 | 62.4 | 55.3 | 67.2 |
| Qwen3-4B | 38.8 | 45.5 | 53.3 | 43.2 | 61.6 |

다만 여기서 “스킬을 많이 넣으면 된다”는 결론으로 가면 안 된다. Figure 2의 hard-negative 실험은 gold skill이 항상 후보 안에 있어도 distractor가 늘어날수록 Full-Skill Injection이 더 취약해지는 반면, Progressive Disclosure가 상대적으로 더 안정적인 모습을 보인다고 설명한다. 즉 스킬 후보를 노출하는 방식 자체가 robustness를 좌우한다. 스킬이 많아질수록 raw injection보다 **후보 목록, 요약, 선택 정책, 점진적 로딩 UX**가 중요해진다.

두 번째 결과는 retrieval 품질이 end-to-end 성능에 영향을 준다는 점이다. BM25만 쓴 경우보다 BM25 top-50에 LLM rerank를 붙이면 평균 성능이 일관되게 좋아진다.

| 모델 | BM25 평균 | BM25 + Rerank 평균 |
|---|---:|---:|
| Llama-3.1-8B | 32.7 | 39.4 |
| Llama-3.3-70B | 52.7 | 58.3 |
| Mistral3.1-24B | 48.5 | 55.4 |
| Qwen3-235B | 56.2 | 62.6 |
| Qwen3-32B | 54.3 | 61.8 |
| Qwen3-4B | 45.5 | 53.8 |

하지만 세 번째 결과가 더 중요하다. 검색이 좋아도 모델이 그 스킬을 **로드할 줄 모르면** 성능으로 이어지지 않는다. 논문은 skill loading rate를 별도로 측정하는데, 이 값이 모델마다 매우 불안정하다. Llama-8B는 전체 72.1%의 높은 로딩률을 보이지만 Llama-70B는 11.1%에 그친다. Qwen3-32B는 20.1%, Qwen3-235B는 54.1%다. 크기가 커진다고 더 합리적으로 로드하는 단조 경향도 보이지 않는다.

| 모델 | 전체 Skill Loading Rate |
|---|---:|
| Qwen3-4B | 21.0% |
| Llama-8B | 72.1% |
| Mistral-24B | 28.3% |
| Qwen3-32B | 20.1% |
| Llama-70B | 11.1% |
| Qwen3-235B | 54.1% |
| GLM-5.1 | 37.8% |
| GPT-5.4 | 31.2% |

더 날카로운 진단은 relevance-aware와 need-aware 분석에서 나온다. gold skill이 BM25 top-50 안에 있는 경우와 없는 경우를 비교해도 모델의 로딩률 차이는 충분히 크지 않다. 일부 모델은 gold skill이 없을 때도 꽤 자주 로드하고, Llama-70B는 오히려 gold skill이 없을 때 로딩률이 더 높게 나온다. need-aware 분석에서도 전체적으로 Skill-Free Correct와 Skill-Free Wrong 사이의 로딩률이 거의 같다. 논문의 Table 8은 전체 Load Rate가 양쪽 모두 36.9%이고, 차이는 +0.1pp에 불과하다고 보고한다.

이 결과는 SRA의 병목이 단순 검색 문제가 아니라는 강한 증거다. 좋은 retriever를 붙여도 에이전트가 “지금 외부 능력이 필요한가”, “이 후보는 진짜 관련 있는가”, “로드 비용을 감수할 가치가 있는가”를 판단하지 못하면 skill augmentation은 안정적인 시스템이 되기 어렵다.

릴리스 표면도 확인할 만하다. 논문은 GitHub `oneal2000/SR-Agents`와 Hugging Face `WeihangSu/SRA-Bench`를 연결한다. GitHub 저장소는 MIT 라이선스, Python 중심 코드베이스이며, 조회 시점 기준 55 stars, 5 forks, open issues 0으로 보인다. README는 SRA-Bench와 SR-Agents baseline을 제공한다고 설명하고, BM25·TF-IDF·BGE·Contriever·Hybrid·BM25+LLM rerank 재현 파이프라인을 안내한다.

이전에는 release와 tag가 비어 있었지만, 현재는 `v1.0.0` 태그와 GitHub release가 올라와 있다. release note는 “Initial release of SRA-Bench and SR-Agents”로, 5,400개 테스트 인스턴스, 636개 gold skill, 26,262개 스킬 코퍼스, SR-Agent baseline 구현, retrieval/incorporation/end-task 평가 스크립트, 주요 실험 재현 안내를 포함한다고 명시한다. 즉 공개 표면은 단순 코드 덤프보다 한 단계 정리된 연구 아티팩트에 가까워졌다.

Hugging Face 데이터셋은 non-gated 공개 상태이며, card metadata 기준 MIT 라이선스, `instances`와 `corpus` 두 config를 제공한다. 파일은 `corpus/corpus.json`과 여섯 개 `instances/{dataset}.json`으로 구성되어 있고, API 기준 현재 downloads 302, likes 2로 보인다. 따라서 이 작업은 단순 논문 아이디어가 아니라 **benchmark dataset + baseline toolkit + v1.0 release**까지 갖춘 공개 연구 번들로 보는 편이 정확하다. 다만 여전히 초기 공개 직후의 연구 코드이므로, 장기 유지보수나 패키지 안정성을 성숙한 제품 수준으로 가정해서는 안 된다.

## 실무 관점에서의 해석

내가 보기에 이 논문의 가장 중요한 메시지는 “스킬 레지스트리는 프롬프트 목록이 아니라 검색·검증·로딩 정책을 가진 시스템이어야 한다”는 것이다. 지금까지 많은 agent skill 논의는 좋은 `SKILL.md`를 어떻게 쓰고, 어디에 설치하고, 어떤 포맷으로 배포할지에 집중했다. SRA는 그 다음 질문을 던진다. 스킬이 수만 개가 되면, 에이전트는 그것을 어떻게 찾고, 언제 불러오고, 어떤 근거로 무시할 것인가?

이 관점에서 SRA는 agentic RAG의 자연스러운 확장처럼 보이지만, 운영 난이도는 더 높다. RAG에서 잘못된 문서를 가져오면 답변이 흔들린다. SRA에서 잘못된 스킬을 가져오면 에이전트의 행동 절차 자체가 틀어질 수 있다. 검색 대상이 지식 조각이 아니라 능력 패키지이기 때문에, retriever는 semantic similarity뿐 아니라 **utility, precondition, side effect, execution cost, compatibility**까지 고려해야 한다.

실무적으로는 세 가지 레이어가 필요해 보인다.

첫째, **skill library layer**다. 스킬을 단순 폴더 목록으로 두지 말고, 이름·설명·의존성·입출력·위험 범위·최근 검증 결과를 구조화해야 한다. 논문 7장은 앞으로의 SRA가 unstructured skill collection에서 graph, hierarchy, dependency structure를 가진 structured skill library로 가야 한다고 제안한다. 이는 기존 skill marketplace나 내부 skill repo가 결국 metadata 품질 경쟁으로 갈 수 있음을 시사한다.

둘째, **utility-aware retrieval layer**다. 주제적으로 비슷한 스킬이 아니라 실제 성능을 올리는 스킬을 찾아야 한다. BM25+rerank가 강한 출발점이지만, 장기적으로는 offline eval, 실행 로그, 실패 사례, task distribution을 반영한 retriever가 필요하다. 스킬 검색은 문서 검색보다 더 “결과 중심”이어야 한다.

셋째, **load-gating layer**다. 이번 논문의 가장 큰 경고는 현재 모델들이 relevance-aware도, need-aware도 충분하지 않다는 점이다. 따라서 production 에이전트는 모델에게 “알아서 필요한 스킬을 불러와”라고 맡기기보다, confidence threshold, abstention rule, explicit comparison, cheap probe, verifier 같은 보조 장치를 둬야 한다. 특히 스킬 로딩에는 토큰 비용과 실행 위험이 함께 따르므로, 로딩 여부 자체가 정책의 대상이 되어야 한다.

이 논문은 에이전트 스킬 생태계의 방향을 꽤 분명하게 보여 준다. 스킬은 더 이상 프롬프트 끝에 붙는 긴 부록이 아니라, 검색되고 평가되고 개선되는 capability corpus가 된다. 그리고 에이전트 품질은 “좋은 모델을 썼는가”뿐 아니라, **좋은 스킬을 찾고, 필요한 순간에만 로드하고, 실제 행동으로 바꾸는 하네스를 갖췄는가**로 평가받게 될 가능성이 크다.

## 한계와 남은 질문

물론 SRA-Bench가 모든 스킬 시스템을 대표한다고 보기는 어렵다. 여섯 source dataset은 다양한 capability type을 포함하지만, 실제 기업 내부 스킬은 더 지저분하고, 권한·상태·파일 시스템·외부 API 같은 부작용이 더 강하다. 또한 benchmark의 gold skill은 수작업으로 구성된 통제된 자산인 반면, 현실의 public skill ecosystem은 중복, outdated instruction, 보안 문제, 품질 편차를 훨씬 많이 포함한다.

또한 현재 실험은 “스킬을 검색해 컨텍스트에 넣는” 문제를 잘 분해하지만, 장기 실행 에이전트가 스킬을 부분적으로 실행하고, 실패 후 다시 검색하고, 여러 스킬을 합성하는 환경까지 완전히 포괄하지는 않는다. 논문이 future agenda로 structured skill libraries, offline refinement, skill evolution, parametric skill augmentation을 제시한 것도 그래서 자연스럽다.

그럼에도 이 작업의 가치는 크다. 지금까지 agent skills 논의가 포맷과 생태계의 성장에 집중했다면, SRA-Bench는 그 다음 단계인 **대규모 스킬 검색과 로딩 판단을 어떻게 측정할 것인가**를 구체적인 벤치마크로 만든다. 스킬이 많아질수록 경쟁력은 더 긴 컨텍스트가 아니라, 더 좋은 검색·로딩·검증 루프에서 나온다는 점을 잘 보여주는 논문이다.

Sources: https://arxiv.org/abs/2604.24594, https://arxiv.org/html/2604.24594, https://github.com/oneal2000/SR-Agents, https://api.github.com/repos/oneal2000/SR-Agents, https://github.com/oneal2000/SR-Agents/releases/tag/v1.0.0, https://raw.githubusercontent.com/oneal2000/SR-Agents/main/README.md, https://huggingface.co/datasets/WeihangSu/SRA-Bench, https://huggingface.co/api/datasets/WeihangSu/SRA-Bench, https://huggingface.co/datasets/WeihangSu/SRA-Bench/raw/main/README.md
