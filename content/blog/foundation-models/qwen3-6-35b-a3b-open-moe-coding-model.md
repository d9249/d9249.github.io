---
title: "Qwen3.6-35B-A3B는 3B 활성 파라미터로 에이전트 코딩 성능을 밀어 올린다"
date: "2026-05-06T10:58:56"
description: "Qwen3.6-35B-A3B는 총 35B·활성 3B의 멀티모달 MoE 구조 위에 agentic coding, preserve_thinking, 초장문 컨텍스트 확장, 오픈 배포 경로를 결합해 작은 활성 비용으로 실전형 코딩 에이전트 성능을 노리는 Qwen의 공개 모델이다."
author: "Sangmin Lee"
category: "foundation-models"
tags:
  - Qwen
  - MoE
  - Agentic Coding
  - Open Weights
  - Multimodal
draft: false
---

최근 오픈모델 경쟁에서 흥미로운 축은 "총 파라미터가 얼마나 큰가"보다 "실제로 활성화되는 계산량으로 어디까지 도달하느냐"로 이동하고 있다. 특히 코딩 에이전트, 터미널 기반 작업, 리포지토리 단위 추론처럼 긴 실행 루프가 필요한 환경에서는 모델의 절대 규모보다도 응답 안정성, 도구 호출 적합성, 긴 문맥 유지, 그리고 실제 운영 비용이 더 중요해진다.

Qwen3.6-35B-A3B는 이 지점을 꽤 정교하게 겨냥한 릴리스다. Hugging Face 모델 카드와 Qwen 공식 블로그에 따르면 이 모델은 총 35B 파라미터이지만 매 토큰당 실제로는 3B만 활성화되는 mixture-of-experts(MoE) 구조를 사용한다. 그 위에 agentic coding 성능, multimodal thinking/non-thinking 모드, 262K native context, 최대 약 101만 토큰까지의 확장 경로, 그리고 `preserve_thinking` 같은 에이전트 친화 기능을 얹었다.

내가 보기에 이 모델의 핵심은 단순히 "작은 계산으로 큰 모델을 흉내 낸다"가 아니다. 오히려 Qwen이 코딩 에이전트용 오픈모델을 어떤 형태로 제품화하려 하는지 보여 주는 사례에 가깝다. 즉, 모델 하나만 잘 내놓는 것이 아니라 Qwen Studio, Alibaba Cloud Model Studio API, Hugging Face 오픈 웨이트, Qwen-Agent, Qwen Code 같은 실행 표면을 함께 맞물리게 하면서, 실전형 코딩 워크플로우에서 바로 쓰일 수 있는 모델 계층을 제시하고 있다.

![Qwen3.6-35B-A3B banner](https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.6/Figures/3.6_35b_a3b_banner.png)

## 무엇을 해결하려는가

Qwen3.6-35B-A3B가 풀려는 문제는 오픈 코딩 모델이 종종 맞닥뜨리는 두 가지 긴장이다. 하나는 더 강한 코딩 성능을 위해 모델을 계속 키우면 배포 비용과 지연이 빠르게 증가한다는 점이고, 다른 하나는 반대로 계산량을 아끼면 리포지토리 수준 추론, 프런트엔드 워크플로우, 도구 호출이 섞인 긴 작업에서 성능이 쉽게 무너진다는 점이다.

Qwen은 이 문제에 대해 "작은 활성 비용으로도 충분히 강한 에이전트 코딩 모델을 만들 수 있는가"라는 답을 내놓는다. 공식 블로그는 Qwen3.6-35B-A3B가 predecessor인 Qwen3.5-35B-A3B보다 agentic coding에서 큰 폭으로 개선됐고, 더 큰 dense 모델과도 경쟁할 수 있다고 설명한다. Hugging Face 카드 역시 이 릴리스의 핵심 업그레이드로 frontend workflow 처리와 repository-level reasoning 향상을 가장 앞에 둔다.

또 하나 중요한 문제는 다단계 작업에서 추론 문맥이 자주 단절된다는 점이다. Qwen3.6은 이를 위해 과거 메시지의 reasoning context를 유지하는 `preserve_thinking` 옵션을 도입했다고 명시한다. 이는 단순한 부가 기능이 아니라, 여러 차례 수정과 재계획을 거치는 에이전트 루프에서 모델이 이전 사고 흔적을 더 일관되게 이어받도록 하려는 설계로 읽힌다.

## 핵심 아이디어 / 구조 / 동작 방식

구조적으로 보면 Qwen3.6-35B-A3B는 매우 전형적인 "작은 활성량의 큰 MoE"처럼 보이면서도, 내부 구성은 꽤 공격적이다. 공식 모델 카드 기준으로 총 파라미터는 35B, 활성 파라미터는 3B이고, 40개 레이어 위에 256개의 expert를 두며 매 스텝에서 8개 routed expert와 1개 shared expert를 활성화한다. 이 모델은 Causal Language Model with Vision Encoder로 분류되며, 텍스트뿐 아니라 이미지 입력도 다룬다.

흥미로운 점은 attention 설계다. 카드에는 hidden layout이 `10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))`로 적혀 있다. 즉 일반적인 dense Transformer 블록 반복이라기보다, Gated DeltaNet과 Gated Attention을 섞은 하이브리드 구조 위에 MoE를 배치한 형태다. 이 덕분에 모델은 계산 효율을 챙기면서도 긴 문맥과 agentic workload를 견디도록 설계된 것으로 보인다.

운영 측면에서는 세 가지 표면이 눈에 띈다. 첫째, multimodal thinking / non-thinking 모드를 모두 유지한다. 둘째, `preserve_thinking`을 통해 이전 reasoning trace를 후속 턴에 보존할 수 있다. 셋째, context length는 262,144 토큰을 기본으로 제공하고, YaRN 기반 설정을 통해 약 1,010,000 토큰까지 확장하는 방법을 공식 문서에 적어 두었다. 즉 이 모델은 단순히 한 번 길게 읽는 모델이 아니라, 반복적이고 장기적인 실행 루프를 염두에 두고 인터페이스가 설계돼 있다.

또한 배포 경로도 명확하다. 공식 자료는 Hugging Face, ModelScope, Qwen Studio, Alibaba Cloud Model Studio API, 그리고 Qwen-Agent / Qwen Code / OpenClaw 같은 에이전트 도구 연동을 함께 제시한다. 이는 Qwen이 이 모델을 연구 데모가 아니라, 실제 코딩 에이전트 생태계에 바로 꽂아 넣을 수 있는 범용 백엔드로 포지셔닝하고 있음을 보여 준다.

| 레이어 | 공개 자료에서 확인되는 구성 | 의미 |
|---|---|---|
| Core architecture | 35B total / 3B active, 256 experts, 8 routed + 1 shared experts, vision encoder 포함 | 작은 활성 계산량으로 큰 모델 용량을 활용하려는 MoE 전략 |
| Sequence design | 262,144 native context, YaRN으로 약 1,010,000 토큰 확장 | 장문 문서·리포지토리·장시간 에이전트 실행 대응 |
| Agent interface | thinking/non-thinking, `preserve_thinking`, tool calling, coding assistant 연동 | 반복적 코딩 작업에서 추론 연속성과 실행 효율 강화 |
| Deployment surface | Hugging Face, ModelScope, Qwen Studio, Model Studio API, Qwen-Agent/Qwen Code | 오픈 웨이트와 상용 API를 동시에 아우르는 배포 전략 |

![Qwen3.6-35B-A3B benchmark chart](https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3.6/Figures/qwen3.6_35b_a3b_score.png)

## 공개된 근거에서 확인되는 점

공식 수치만 보면 Qwen3.6-35B-A3B의 가장 강한 메시지는 agentic coding 쪽에 있다. Qwen 공식 블로그와 README 표에 따르면 이 모델은 SWE-bench Verified 73.4, SWE-bench Multilingual 67.2, SWE-bench Pro 49.5, Terminal-Bench 2.0 51.5를 기록한다. 전 세대 Qwen3.5-35B-A3B와 비교하면 각각 70.0→73.4, 60.3→67.2, 44.6→49.5, 40.5→51.5로 개선된다. 특히 Terminal-Bench와 NL2Repo, QwenWebBench처럼 실제 작업 루프에 더 가까운 항목에서 상승폭이 눈에 띈다.

다만 이 모델을 "모든 영역에서 절대 우위"로 읽기는 어렵다. 같은 표에서 dense 27B인 Qwen3.5-27B는 SWE-bench Verified 75.0으로 Qwen3.6-35B-A3B의 73.4보다 높다. TAU3-Bench나 WideSearch 같은 general agent 계열에서는 전작이나 다른 비교군 대비 압도적 우세라고 보긴 어렵고, Knowledge 축에서는 MMLU-Pro 85.2, MMLU-Redux 93.3, C-Eval 90.0 수준으로 강하지만 최고점만 찍는 형태는 아니다. 즉 이 모델의 공개 근거는 전방위 SOTA라기보다, agentic coding과 multimodal utility에 자원을 집중한 균형형 설계에 가깝다.

비전-언어 성능도 흥미롭다. 공식 표에서 Qwen은 Qwen3.6-35B-A3B가 Claude Sonnet 4.5와 대체로 비슷하거나 일부 항목에서 앞선다고 주장한다. 실제 표를 보면 MMMU 81.7, RealWorldQA 85.3, OmniDocBench1.5 89.9, CC-OCR 81.9, RefCOCO 92.0, ODInW13 50.8 같은 수치가 제시된다. 특히 spatial intelligence 항목에서 RefCOCO 92.0, ODInW13 50.8을 별도로 강조하는데, 이는 단순 텍스트 코딩 모델이 아니라 멀티모달 에이전트 백본으로도 쓰려는 의도를 보여 준다.

라이선스는 Apache 2.0이다. 이는 최근 일부 공개 모델이 별도 상업 제한이나 사용 조건을 두는 것과 달리, 배포와 재사용 측면에서 훨씬 단순한 선택이다. 기업 입장에서는 성능 수치 못지않게 이 지점이 중요하다. 같은 공개 웨이트라도 법무 검토 비용과 도입 마찰이 크게 달라지기 때문이다.

| 비교 축 | Qwen3.5-35B-A3B | Qwen3.6-35B-A3B | 읽을 수 있는 변화 |
|---|---:|---:|---|
| SWE-bench Verified | 70.0 | 73.4 | 코딩 에이전트 핵심 벤치마크 개선 |
| SWE-bench Multilingual | 60.3 | 67.2 | 다국어 코드 작업에서 개선 폭 큼 |
| SWE-bench Pro | 44.6 | 49.5 | 더 어려운 코드 수정 태스크에서도 상승 |
| Terminal-Bench 2.0 | 40.5 | 51.5 | 터미널 기반 장기 실행 성능이 크게 상승 |
| NL2Repo | 20.5 | 29.4 | 리포지토리 단위 추론 개선이 수치로 드러남 |
| QwenWebBench | 978 | 1397 | 프런트엔드·웹 생성 계열에서 강한 상승 |

## 실무 관점에서의 해석

내가 보기에 Qwen3.6-35B-A3B의 가장 큰 장점은 "계산 예산 대비 코딩 에이전트 특화도가 높다"는 점이다. 총 35B 규모를 유지하면서도 활성은 3B만 쓰는 구조라면, dense 27B나 30B대 모델과 비교할 때 단순 FLOPs 효율뿐 아니라 배치 처리, 병렬 세션, self-hosted 운영 단가 측면에서 실질적인 이점이 생길 수 있다. Qwen이 굳이 repository-level reasoning, frontend workflows, preserve_thinking을 전면에 내세운 것도 이런 실전 운영 맥락 때문일 가능성이 크다.

또한 이 릴리스는 오픈모델이 더 이상 "API의 저렴한 대체재"에 머물지 않는다는 점을 보여 준다. 공식 문서가 Qwen-Agent, Qwen Code, OpenClaw 같은 도구 연동을 함께 다루는 것은, 모델이 곧바로 에이전트 런타임 안으로 들어가야 한다는 가정 위에서 작성됐다는 뜻이다. 즉 이제 중요한 것은 모델 하나의 정적 점수보다, 그 모델이 긴 작업을 얼마나 일관되게 수행하고 도구 사용 문맥을 얼마나 잘 이어받는가다.

물론 한계도 있다. 공개 표는 대부분 Qwen 측 내부 혹은 지정된 harness 조건에서 측정된 수치이므로, 실제 팀 환경에서 같은 결과가 곧바로 재현된다고 보기는 어렵다. 또 general agent나 broad knowledge 축에서는 압도적 우위를 보이지 않는 항목도 많다. 따라서 이 모델은 "모든 작업에 최고의 오픈모델"이라기보다, 멀티모달 입력과 코딩 에이전트 워크로드가 함께 있는 환경에서 특히 매력적인 선택지로 보는 편이 더 정확하다.

그럼에도 메시지는 분명하다. Qwen3.6-35B-A3B는 오픈 웨이트 MoE 모델이 단순히 싸고 가벼운 대안이 아니라, 코딩 에이전트·장문 문맥·멀티모달 워크플로우를 동시에 감당할 수 있는 실전 백엔드가 될 수 있다는 주장을 꽤 설득력 있게 밀고 있다. 특히 Apache 2.0 라이선스, 3B 활성 구조, preserve_thinking, 에이전트 툴 연동까지 묶어 보면, 이 릴리스는 오픈 코딩 모델의 다음 경쟁 포인트가 어디인지 잘 보여 주는 사례다.

Sources: https://huggingface.co/Qwen/Qwen3.6-35B-A3B, https://huggingface.co/Qwen/Qwen3.6-35B-A3B/raw/main/README.md, https://huggingface.co/Qwen/Qwen3.6-35B-A3B/raw/main/LICENSE, https://qwen.ai/blog?id=qwen3.6-35b-a3b
