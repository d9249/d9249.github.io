---
title: "Prompt-Level Distillation은 추론을 가중치가 아니라 프롬프트로 증류한다"
date: "2026-05-06"
description: "Prompt-Level Distillation은 교사 모델의 추론 규칙을 학생 모델의 시스템 프롬프트로 옮겨, 파인튜닝 없이도 작은 모델이 복잡한 분류 추론을 더 빠르고 투명하게 수행하도록 만든다."
author: "Sangmin Lee"
category: "ai-systems"
tags:
  - Reasoning
  - Prompt Engineering
  - Distillation
  - Gemma
  - LLM Systems
draft: false
---

추론 성능을 높이는 가장 익숙한 방법은 여전히 두 가지다. 하나는 Chain-of-Thought(CoT)처럼 긴 중간 추론을 생성하게 만들어 정확도를 끌어올리는 것이고, 다른 하나는 더 작은 모델을 별도로 파인튜닝해 그 능력을 옮기는 것이다. 문제는 전자는 느리고 비싸며, 후자는 운영 부담이 크다는 점이다. 특히 실시간 응답, 고처리량 분류, 엣지 배포처럼 latency와 cost가 민감한 환경에서는 둘 다 쉽게 병목이 된다.

이번 논문 "Prompt-Level Distillation: A Non-Parametric Alternative to Model Fine-Tuning for Efficient Reasoning"은 이 사이의 흥미로운 대안을 제안한다. 추론 능력을 모델 가중치에 압축하지 말고, 더 작은 학생 모델의 시스템 프롬프트 안에 규칙 형태로 컴파일하자는 접근이다. 즉 교사 모델이 데이터별로 어떻게 판단하는지에서 추론 규칙을 추출한 뒤, 이를 충돌 없는 instruction set으로 정리해 학생 모델이 zero-shot에 가깝게 실행하게 만든다. 핵심은 reasoning을 runtime generation에서 offline compilation으로 옮긴다는 점이다.

![Prompt-Level Distillation overview](https://arxiv.org/html/2602.21103v1/x1.png)

## 무엇을 해결하려는가

논문이 겨냥하는 문제는 단순히 "작은 모델도 잘하게 만들자"가 아니다. 더 정확히 말하면, 복잡한 추론이 필요한 분류 작업에서 CoT의 정확도는 유지하면서도 test-time compute와 파인튜닝 운영비를 줄이려는 시도다. 저자들은 법률, 금융, 콘텐츠 모더레이션처럼 판단 근거를 검증해야 하는 도메인에서 특히 이 문제가 더 심각하다고 본다. 긴 추론 토큰을 매 요청마다 생성하는 방식은 느리고, 파인튜닝 기반 knowledge distillation은 teacher가 바뀔 때마다 다시 학습해야 하며, reasoning이 왜 그런 판단으로 이어졌는지도 불투명해지기 쉽다.

PLD는 여기서 추론 규칙을 외부화한다. 학생 모델이 내부 가중치에 reasoning을 학습하도록 강제하는 대신, teacher가 예시별로 드러낸 논리를 자연어 규칙으로 추출해 시스템 프롬프트에 넣는다. 그 결과 파라미터 업데이트 없이도 고정된 작은 모델이 더 복잡한 논리를 수행할 수 있고, 무엇보다 사람이 그 규칙을 직접 읽고 검증할 수 있다. 논문이 반복해서 강조하는 "regulated industries"라는 표현도 바로 이 투명성 때문이다.

## 핵심 아이디어 / 구조 / 동작 방식

PLD 파이프라인은 네 단계로 구성된다.

첫째는 Supervised Instruction Extraction이다. 라벨이 있는 학습 샘플을 teacher 모델에 넣고, 정답을 설명하는 reasoning trace를 생성하게 한 뒤, 그 reasoning을 일반화된 자연어 instruction으로 추상화한다. 여기서 중요한 점은 개별 예시의 구체적 엔티티를 걷어내고도 정답을 이끌어낸 인과 규칙은 남긴다는 것이다. 논문은 이 과정을 reasoning trace 생성과 instruction 추출을 한 번의 inference step으로 처리해 데이터 생성 비용도 줄이려 한다.

둘째는 Clustering Logic Synthesis다. 예시별로 뽑아낸 instruction은 중복도 많고 지나치게 로컬한 규칙일 수 있기 때문에, 저자들은 Gemini Embedding 벡터 위에서 DBSCAN을 사용해 의미적으로 유사한 instruction을 군집화한다. 그런 다음 각 군집을 다시 상위 모델이 읽고 하나의 통합된 heuristic으로 합친다. 이 단계는 reasoning 규칙을 단순 요약하는 것이 아니라, 실제로 학생 모델이 사용할 수 있는 compact prompt program으로 재구성하는 과정에 가깝다.

셋째는 Conflict Resolution이다. 단일 예시 기반으로 뽑힌 규칙은 서로 모순될 수 있다. 논문 부록에 실린 Contract-NLI 예시를 보면, 같은 "upon request" 문장을 두고 어떤 instruction은 Entailment를, 다른 instruction은 NotMentioned를 유도하는 식의 충돌이 발생한다. 그래서 저자들은 현재 instruction set을 학생 모델에 적용해 학습 데이터에서 다시 추론을 돌리고, 실패 사례와 성공 사례를 함께 teacher에게 넣어 규칙을 수정하는 closed-loop refinement를 수행한다. 이 단계가 PLD의 품질을 좌우하는 핵심 장치다.

넷째는 Inference다. 최종적으로 정제된 instruction set 전체를 학생 모델의 시스템 프롬프트에 주입하고, 이후에는 별도 CoT 생성 없이 zero-shot처럼 실행한다. 즉 reasoning 자체를 없앤 것이 아니라, reasoning의 계산 위치를 online decoding에서 offline prompt compilation으로 이동시킨 셈이다.

| 방식 | reasoning이 저장되는 위치 | 장점 | 비용/한계 |
|---|---|---|---|
| CoT prompting | 매 요청의 생성 토큰 | 높은 정확도, 유연한 추론 | latency와 test-time cost가 큼 |
| 파인튜닝 기반 distillation | 학생 모델 가중치 | 런타임은 가볍고 배포가 단순함 | 재학습·아티팩트 관리·설명 가능성 문제 |
| Prompt-Level Distillation | 시스템 프롬프트의 규칙 집합 | 파라미터 업데이트 없음, 규칙 검증 가능, 작은 모델에 유리 | 규칙 충돌 해결 필요, prompt 길이 한계 존재 |

## 공개된 근거에서 확인되는 점

실험은 두 개의 reasoning-heavy classification 데이터셋에서 수행됐다. 하나는 계약 문서와 가설의 관계를 분류하는 Contract-NLI이고, 다른 하나는 편향 관련 분류 작업인 StereoSet이다. 학생 모델로는 Gemma-3 4B와 Gemini 2 Flash를, teacher 추론/추출 쪽에는 Gemini 3 Flash와 Gemini 3 Pro 계열을 사용했다. 데이터 크기는 Contract-NLI가 총 10,319개, StereoSet이 총 2,106개로 제시된다.

논문에서 가장 강조하는 수치는 Gemma-3 4B 결과다. StereoSet에서는 zero-shot Macro-F1 0.57에서 PLD 적용 후 0.90으로 상승했고, few-shot 0.75보다도 높다. Contract-NLI에서는 zero-shot 0.67에서 0.83으로 상승했다. 즉 작은 모델이 긴 추론 토큰을 매번 생성하지 않고도, 미리 증류된 규칙만으로 복잡한 분류 작업에서 훨씬 강해졌다는 주장이다.

| 모델 / 설정 | StereoSet Macro-F1 | Contract-NLI Macro-F1 |
|---|---:|---:|
| Gemma-3 4B Zero-shot | 0.57 | 0.67 |
| Gemma-3 4B Few-shot | 0.75 | 0.70 |
| Gemma-3 4B PLD (clustered / final) | 0.90 / 0.90 | 0.81 / 0.83 |
| Gemini 3 Flash Zero-shot | 0.92 | 0.77 |
| Gemini 3 Flash PLD final | 0.93 | 0.86 |

흥미로운 것은 PLD가 학생 모델뿐 아니라 teacher급 모델에도 도움을 줬다는 점이다. Gemini 3 Flash도 Contract-NLI에서 zero-shot 0.77에서 final PLD 0.86으로 올라간다. 저자들의 해석은 단순하다. 강한 모델도 reasoning을 명시적 규칙으로 정리해주면, 특히 복잡한 분류 경계에서 더 안정적인 판단을 할 수 있다는 것이다.

또한 논문은 비용과 속도 측면에서도 강한 메시지를 준다. 결과 분석 섹션에서 Gemma-3 4B는 Gemini 3 Flash보다 약 25배 저렴하고 약 80배 빠르다고 주장한다. 즉 PLD의 가치는 단순 정확도 향상이 아니라, frontier reasoning에 가까운 판단을 훨씬 싼 추론 경로로 끌어오는 데 있다. 특히 conflict resolution은 Contract-NLI처럼 구조적으로 복잡한 데이터셋에서 약 2.5%p 추가 개선을 만들었고, StereoSet에서는 거의 바로 수렴했다는 점도 보고된다.

## 실무 관점에서의 해석

내가 보기에 이 논문의 진짜 포인트는 "reasoning을 모델 내부 능력으로만 보지 않는다"는 데 있다. PLD는 reasoning을 일부는 모델 안에, 일부는 시스템 프롬프트 안에 두는 hybrid operational layer로 해석한다. 그래서 이 접근은 작은 모델을 더 똑똑하게 만든다기보다, 복잡한 판단 과정을 더 저렴하고 통제 가능한 형식으로 재배치한다고 보는 편이 맞다.

특히 규칙 검증이 중요한 산업 도메인에서는 꽤 설득력이 있다. 파인튜닝된 작은 모델은 왜 그런 판단을 했는지 설명하기 어렵지만, PLD는 consolidated instruction set을 사람이 직접 검토할 수 있다. 법률·컴플라이언스·정책 심사처럼 "정확도"와 함께 "감사 가능성"이 요구되는 환경에서는 이 차이가 크다. 학생 모델이 따르는 reasoning rulebook이 자연어로 드러나 있기 때문이다.

물론 한계도 분명하다. 논문 스스로도 지적하듯이 이 방식은 정적 decision boundary가 강한 분류 작업에 더 잘 맞는다. 복잡한 산술 계산이나 긴 symbolic proof처럼 intermediate computation 자체가 본질인 작업에서는 reasoning을 완전히 prompt summary로 외부화하기 어렵다. 또 과제가 복잡해질수록 시스템 프롬프트가 비대해져 context window를 압박하거나 prompt processing overhead를 다시 키울 수 있다.

그럼에도 불구하고 PLD는 앞으로 더 자주 보게 될 패턴을 보여준다. 모든 성능 향상을 파라미터 업데이트로 해결하는 대신, teacher의 판단 로직을 추출·정리·검증 가능한 artifact로 만들고 이를 inference stack에 재사용하는 방식이다. 작은 모델을 쓰고 싶지만 CoT 비용은 감당하기 어렵고, 파인튜닝 운영도 부담스러운 팀이라면 이 논문은 꽤 현실적인 설계 힌트를 준다. reasoning을 학습시키는 대신 컴파일하는 발상은, 앞으로 agent system과 enterprise LLM pipeline에서 더 중요해질 가능성이 높다.

Sources: https://arxiv.org/abs/2602.21103, https://arxiv.org/html/2602.21103v1, https://arxiv.org/pdf/2602.21103