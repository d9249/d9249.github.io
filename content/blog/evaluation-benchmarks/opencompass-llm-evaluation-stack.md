---
title: "OpenCompass는 LLM 평가를 실행 엔진·벤치마크 카탈로그·리더보드로 묶는다"
date: "2026-05-06T06:36:13"
description: "open-compass/opencompass는 모델 하나의 점수를 계산하는 스크립트를 넘어서, 방대한 데이터셋 카탈로그·분산 실행·가속 추론·LLM-as-a-judge·공개 리더보드를 한 스택으로 엮어 LLM 평가를 반복 가능한 운영 파이프라인으로 바꾸려는 오픈소스 플랫폼이다."
author: "Sangmin Lee"
category: "evaluation-benchmarks"
tags:
  - LLM Evaluation
  - Benchmark
  - Leaderboard
  - vLLM
  - OpenCompass
draft: false
---

모델 성능이 빠르게 올라가는 지금, 팀들이 실제로 부딪히는 병목은 “어떤 모델이 더 좋은가” 자체보다 “그 판단을 어떤 절차로 반복 가능하게 만들 것인가”에 가깝다. 리더보드 한 장은 보기 쉽지만, 실무에서는 동일한 프롬프트 체계로 여러 모델을 돌리고, 서로 다른 벤치마크를 묶고, API 모델과 오픈웨이트 모델을 같은 파이프라인에서 비교하고, 결과를 다시 표와 리포트로 남겨야 한다. 평가가 곧 운영 문제가 되는 이유다.

`open-compass/opencompass`는 바로 이 문제를 겨냥한 프로젝트다. GitHub 설명은 OpenCompass를 “100+ datasets 위에서 Llama3, Mistral, InternLM2, GPT-4, Qwen, GLM, Claude 등을 지원하는 LLM evaluation platform”으로 소개한다. 하지만 README와 문서를 따라가 보면, 이 저장소의 목표는 단순한 벤치마크 실행기가 아니다. 모델/데이터셋 설정, 분산 추론, 가속 백엔드 전환, LLM judge, 결과 시각화, 공개 리더보드, 데이터셋 브라우저까지 이어지는 평가 스택 전체를 하나로 묶으려는 시도에 가깝다.

내가 보기엔 OpenCompass의 핵심은 “평가 스크립트의 모음”이 아니라 “평가를 재현 가능한 제품 표면으로 만들려는 인프라”라는 점이다. 단일 정확도 수치보다 중요한 것은 어떤 모델 설정과 어떤 데이터셋 조합, 어떤 평가자, 어떤 백엔드, 어떤 결과 집계 규칙을 거쳤는지가 명확히 남는 것이다. OpenCompass는 바로 그 레이어를 오픈소스로 표준화하려고 한다.

![OpenCompass logo](https://github.com/open-compass/opencompass/raw/main/docs/en/_static/image/logo.svg)

## 무엇을 해결하려는가

OpenCompass가 푸는 문제는 LLM 평가의 파편화다. 연구팀이나 제품팀이 모델을 비교하려고 하면 보통 세 가지 어려움이 생긴다. 첫째, 벤치마크와 모델 포맷이 너무 다양해 평가 설정을 매번 다시 짜야 한다. 둘째, Hugging Face 모델, API 모델, 장문맥 모델, 추론 모델, 코드 모델처럼 대상이 달라질수록 실행 경로가 갈라진다. 셋째, 최종적으로는 리더보드나 보고서 한 장이 필요하지만, 그 앞단의 실험 구성이 재현 가능하게 정리되지 않으면 결과가 쉽게 흔들린다.

README는 OpenCompass를 one-stop platform, fair/open/reproducible benchmark라고 설명한다. 이 표현이 과장만은 아닌 이유는 저장소의 구조가 실제로 평가의 전 과정을 염두에 두고 설계되어 있기 때문이다. 루트에는 `examples`, `docs`, `tools`, `dataset-index.yml`, `run.py`가 있고, 문서에는 설치-설정-추론-평가-시각화 흐름이 명시되어 있다. 즉 “점수만 계산하는 스크립트”가 아니라 “평가 작업을 구성하고 반복하는 운영 프레임”을 제공하려는 것이다.

또 하나 중요한 문제의식은 공개 리더보드와 로컬 재현 사이의 간극이다. 많은 평가 프로젝트가 공개 점수판은 제공하지만, 사용자가 자기 모델과 자기 데이터 조합으로 동일한 방식의 실험을 재현하기는 어렵다. OpenCompass는 `CompassRank`, `CompassHub`, `CompassKit`이라는 2.0 구성요소를 통해 이 간극을 메우려 한다. 공개 랭킹 표면과 로컬 실행 툴킷을 분리하지 않고 하나의 생태계로 묶으려는 접근이다.

## 핵심 아이디어 / 구조 / 동작 방식

문서와 README를 종합하면 OpenCompass의 흐름은 대체로 네 단계로 요약된다. 첫째는 구성(Configure)이다. 사용자는 CLI에서 `--models`, `--datasets`를 직접 지정하거나, Python 기반 설정 파일에서 모델과 데이터셋 구성을 조합할 수 있다. 둘째는 추론(Inference)이다. Hugging Face 기본 백엔드로 실행할 수도 있고, 문서에 나온 것처럼 `-a vllm` 또는 `-a lmdeploy` 옵션으로 가속 백엔드로 전환할 수도 있다. 셋째는 평가(Evaluation)다. 규칙 기반 점수 계산뿐 아니라 `GenericLLMEvaluator`를 통해 LLM-as-a-judge 평가를 구성할 수 있다. 넷째는 시각화/집계(Visualization)다. 결과는 표 형태로 정리되어 CSV/TXT로 저장되고, 필요하면 외부 보고 채널과도 연결된다.

이 구조에서 특히 중요한 것은 “모델과 데이터셋을 설정 파일로 다루는 방식”이다. Quick Start 문서를 보면 OpenCompass는 실험을 ad-hoc 셸 명령보다 설정 가능한 객체로 보려 한다. 모델 설정과 데이터셋 설정을 별도 파일로 유지하고, 이를 조합해 하나의 평가 실험을 만들게 하는 방식이다. 그래서 동일한 벤치마크를 여러 모델에 반복하거나, 동일한 모델을 다양한 데이터셋 컬렉션에 붙이는 작업이 비교적 체계적으로 이루어진다.

두 번째 핵심은 백엔드 추상화다. `accelerator_intro.md`는 기본 Hugging Face 추론 경로 외에 vLLM과 LMDeploy를 사용해 동일한 평가 작업을 가속하는 방법을 문서화한다. 이때 OpenCompass는 단순히 “더 빨라진다”는 수준을 넘어서, 같은 평가 구성 위에서 백엔드만 바꾸는 인터페이스를 제공한다. 문서 예시에서는 Llama-3-8B-Instruct의 GSM8k 평가에서 Hugging Face 대비 LMDeploy 2.2배, vLLM 3.1배 속도 향상을 제시한다. 즉 이 프로젝트는 평가의 공정성만이 아니라 운영 효율까지 제품 설계에 포함시킨다.

세 번째는 평가자 자체의 확장이다. `llm_judge.md`는 규칙 기반 채점으로 해결하기 어려운 태스크를 위해 `GenericLLMEvaluator`를 제공한다. 모델 답안, 기준 답안, 문제를 judge 모델 프롬프트로 묶어 정답 여부를 판정하는 구조다. 이는 최근 LLM 평가가 객관식 정답 비교에서 벗어나, 개방형 응답·사실성·복합 품질 평가 쪽으로 이동하고 있음을 반영한다. OpenCompass는 이 흐름을 별도 실험이 아니라 플랫폼의 기본 기능으로 흡수하고 있다.

네 번째는 카탈로그와 공개 표면이다. README와 `dataset-index.yml`을 보면 OpenCompass는 단일 벤치마크 프로젝트가 아니라, Reasoning, Long Context, Code, Medicine, Safety, Tool Utilization, Subjective Evaluation 등 매우 다양한 평가 범주를 하나의 인덱스로 유지한다. 여기에 `CompassRank`는 공개 리더보드, `CompassHub`는 벤치마크 브라우저, `CompassKit`은 실행 툴킷 역할을 맡는다. 결국 OpenCompass는 “실험 도구 + 카탈로그 + 랭킹 표면”을 통합하는 방향으로 진화하고 있다.

| 레이어 | 공개 자료에서 확인되는 구성요소 | 역할 |
|---|---|---|
| Experiment config | `run.py`, `--models`, `--datasets`, Python config inheritance | 평가 작업을 재현 가능한 설정 단위로 조합 |
| Inference backend | Hugging Face 기본 경로, `-a vllm`, `-a lmdeploy`, OpenAI-compatible API path | 동일한 평가를 여러 추론 엔진에서 실행 |
| Evaluation logic | 규칙 기반 평가, `GenericLLMEvaluator`, dataset-specific configs | 태스크별 채점 로직과 LLM judge 확장 |
| Result surfaces | CSV/TXT 결과, CompassRank, CompassHub, CompassKit | 로컬 실행 결과와 공개 리더보드/브라우저 연결 |

| 공개 문서에서 드러나는 대표 사용 방식 | 확인된 동작 | 의미 |
|---|---|---|
| CLI 빠른 실행 | `opencompass --models ... --datasets ...` | 소규모 재현이나 빠른 비교에 적합 |
| 설정 파일 기반 실험 | Python config에서 모델·데이터셋 조합 | 반복 실험과 팀 단위 재현성 강화 |
| 가속 평가 | `-a vllm`, `-a lmdeploy` | 대형 모델 평가의 운영 비용 절감 |
| Judge 모델 평가 | `GenericLLMEvaluator`, `OC_JUDGE_*` 환경변수 | 규칙 기반 채점이 어려운 태스크 지원 |

## 공개된 근거에서 확인되는 점

저장소 메타데이터 기준으로 OpenCompass는 이미 꽤 큰 규모의 평가 프로젝트다. 조회 시점 기준 GitHub 저장소는 약 7k stars, 774 forks, 1,109 commits, 15 branches, 39 tags를 보이고 있고, 라이선스는 Apache-2.0이다. 최신 릴리스는 `0.5.2`이며 2026-02-14에 배포되었다. 릴리스 노트는 SciReasoner, Biology Instructions, Mol Instructions, CMPhysBench, IFBench, LCB_pro 같은 신규 벤치마크 추가와 Intern-S1-Pro, TeleChat API 지원, 멀티 차원 평가 메트릭 모니터링, 파이프라인 버그 수정 등을 강조한다. 즉 이 프로젝트는 “초기 프레임워크” 단계를 넘어 지속적으로 벤치마크와 실행 계층을 확장하는 운영형 저장소다.

다만 수치와 범위는 문서 위치에 따라 조금씩 다르게 보인다. GitHub 저장소 설명은 100+ datasets를 말하지만, README의 소개 섹션은 70+ datasets와 약 400,000 questions를 언급한다. 이런 차이는 어느 한쪽이 틀렸다기보다, 저장소 설명·README 본문·세부 인덱스가 서로 다른 업데이트 시점을 반영하고 있음을 시사한다. 실제로 `dataset-index.yml`에는 Long Context, Code, Math, Medicine, Safety, Subjective, Tool Use 등 매우 넓은 범주가 계속 추가되고 있어, 카탈로그가 빠르게 변하는 프로젝트라는 해석이 더 적절하다.

가속 실행 관련 문서도 실무적으로 흥미롭다. `accelerator_intro.md`는 OpenCompass가 단지 벤치마크 정의를 모아둔 저장소가 아니라, 실제로 평가 작업의 비용과 처리 시간을 줄이는 운영 전략을 함께 제공한다는 점을 보여준다. 문서 예시에서는 단일 A800 GPU에서 Llama-3-8B-Instruct의 GSM8k 평가 시 Hugging Face 24분 26초, LMDeploy 11분 15초, vLLM 7분 52초라는 비교표를 제시한다. 절대 수치보다 중요한 것은 “평가 백엔드 전환”이 정식 기능으로 취급된다는 점이다.

LLM judge 지원도 눈에 띈다. `llm_judge.md`는 정규표현식 기반 규칙 채점이 어려운 개방형 응답 태스크를 위해 `GenericLLMEvaluator`를 제공하고, judge API를 `OC_JUDGE_MODEL`, `OC_JUDGE_API_KEY`, `OC_JUDGE_API_BASE` 환경변수로 연결하는 방식을 문서화한다. 이는 OpenCompass가 전통적 객관식 벤치마크만 보는 것이 아니라, 최근 평가 패러다임 변화까지 흡수하고 있다는 근거다.

| 공개 근거 | 확인된 내용 | 해석 |
|---|---|---|
| GitHub 저장소 메타데이터 | 약 7k stars, 774 forks, 1,109 commits, Apache-2.0 | 이미 널리 사용되는 대형 평가 오픈소스 |
| README | 100+ dataset 지원, OpenCompass 2.0, CompassHub/Rank/Kit, 가속 백엔드 안내 | 단일 실행기보다 넓은 평가 생태계 지향 |
| `dataset-index.yml` | Reasoning, Long Context, Code, Safety, Medicine, Tool Use 등 광범위한 범주 | 카탈로그 중심 평가 인프라로 확장 중 |
| `accelerator_intro.md` | Hugging Face 대비 vLLM/LMDeploy 가속 경로와 예시 수치 제공 | 평가 운영 비용 최적화까지 플랫폼 범위에 포함 |
| `llm_judge.md` | `GenericLLMEvaluator`, judge API 연동, 개방형 응답 평가 | LLM-as-a-judge를 기본 확장축으로 수용 |
| Release `0.5.2` | 신규 벤치마크/모델/API 지원과 파이프라인 개선 | 활발한 기능 확장과 유지보수 진행 중 |

## 실무 관점에서의 해석

내가 보기엔 OpenCompass의 가장 큰 장점은 리더보드와 로컬 실험, 그리고 추론 인프라를 하나의 언어로 연결한다는 점이다. 많은 팀이 공개 벤치마크 점수를 참고하지만, 막상 자기 모델이나 사내 API를 넣어 동일한 방식으로 비교하려고 하면 설정 파편화가 시작된다. OpenCompass는 그 부분을 설정 파일, 카탈로그, 실행기, judge, 가속 백엔드라는 공통 인터페이스로 정리하려 한다.

또한 이 프로젝트는 “평가도 결국 제품”이라는 관점을 강하게 드러낸다. CompassRank는 결과 소비 표면이고, CompassHub는 벤치마크 탐색 표면이며, OpenCompass 자체는 실행 엔진이다. 이 셋을 함께 보면 OpenCompass는 연구용 코드 저장소라기보다, 평가 데이터를 생산하고 탐색하고 공개하는 전체 스택에 가깝다. 모델 회사, 오픈소스 커뮤니티, 응용팀 모두가 같은 기반 위에서 결과를 비교할 수 있게 하려는 방향이다.

물론 한계도 있다. 첫째, 문서와 설명 사이에서 데이터셋 수치가 완전히 일치하지 않듯, 빠르게 성장하는 카탈로그는 문서 일관성 부담을 만든다. 둘째, 지원 범위가 넓을수록 각 벤치마크의 세부 품질과 유지보수 강도를 사용자가 별도로 확인해야 한다. 셋째, LLM judge 방식은 유연하지만 judge 모델 자체의 편향과 비용 문제를 함께 가져온다. 즉 OpenCompass는 평가 자동화를 강하게 밀어주지만, 최종 해석의 책임까지 없애 주는 것은 아니다.

그럼에도 방향성은 매우 설득력 있다. 앞으로 모델 경쟁은 단순히 “누가 더 높은 점수를 냈는가”보다, “누가 더 재현 가능하고 확장 가능한 방식으로 평가를 운영하는가”로 이동할 가능성이 크다. 그런 점에서 OpenCompass는 또 하나의 벤치마크 저장소가 아니라, LLM 평가를 하나의 운영 가능한 시스템으로 만들려는 오픈소스 스택으로 보는 편이 정확하다.

Sources: https://github.com/open-compass/opencompass, https://github.com/open-compass/opencompass/blob/main/README.md, https://github.com/open-compass/opencompass/blob/main/dataset-index.yml, https://github.com/open-compass/opencompass/blob/main/docs/en/get_started/quick_start.md, https://github.com/open-compass/opencompass/blob/main/docs/en/advanced_guides/accelerator_intro.md, https://github.com/open-compass/opencompass/blob/main/docs/en/advanced_guides/llm_judge.md, https://github.com/open-compass/opencompass/releases/tag/0.5.2