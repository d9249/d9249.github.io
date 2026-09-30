---
title: "Qwen-Planner-Agent는 모델 훈련과 실행 하네스를 함께 개선한다"
date: "2026-09-30T21:16:22+09:00"
description: "모바일 에이전트를 데이터 생성·강화학습·실행 하네스의 폐루프로 개발하는 Qwen-Planner-Agent의 구조와 MobilePA-Bench 결과, 비용 비교의 범위를 살펴본다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Qwen
  - Mobile Agents
  - Agent Harness
  - Reinforcement Learning
draft: false
---

모바일 에이전트는 화면이나 도구를 한 번 조작하는 것보다, 여러 앱에 걸친 목표를 끝까지 수행하고 실패를 복구하며 완료 여부를 확인해야 한다. `Qwen-Planner-Agent: A Closed-Loop AI-for-AI Framework for Real-World Mobile Planner Agents`는 이 문제를 모델 성능 하나로 다루지 않는다. 데이터 생산, planner 훈련, 실행 시점의 harness를 상호 피드백하는 개발 체계로 제안한다.

저자들은 planner 모델과 Skills·Memory·도구를 제공하는 통합 Harness를 묶고, 실행 기록에서 발견한 실패를 다음 데이터 생성과 훈련, harness 수정으로 되돌린다. 다만 모델 파라미터는 서비스 중 계속 바뀌는 것이 아니라, 오프라인에서 변경·검증·버전 관리되며 모호하거나 릴리스에 중요한 판단에는 사람 검토를 남긴다고 논문은 설명한다.

![Qwen-Planner-Agent의 AI-for-AI 개발 루프를 나타내는 공식 도식](https://arxiv.org/html/2609.29892v1/ai_for_ai_lifecycle_rename.png)

## 무엇을 해결하려는가

현실 기기에서 상호작용 데이터를 모으는 일은 비용이 크고 병렬화하기 어렵다. 반면 샌드박스나 시뮬레이터는 대량 상호작용을 지원하지만, 실제 기기의 예외 동작과 충실도를 완전히 대체하지 못한다. 연구는 확장 가능한 상호작용과 실제 실행의 신뢰성 사이의 간극을 모바일 계획 문제로 다룬다.

시스템은 텍스트·구조화 도구 호출을 중심으로 행동하고, 관찰된 상태 변화나 도구 오류를 다음 계획에 반영한다. 작업별 verifier는 실행 이력과 사용 가능한 근거를 바탕으로 완료 여부를 확인한다. 따라서 성공 판정이 단순히 모델이 “끝났다”고 선언하는 것과 같지 않도록 구성한다.

## 핵심 구조: 데이터, 학습, 하네스의 연결

**AI for Data** 단계는 전문 에이전트가 과제를 만들고, 상호작용 궤적을 수집·정리하며, 실패 진단과 개발 세트 결과를 다음 샘플링에 반영한다. **AI for Training**은 계획 중심의 supervised cold start 뒤에 혼합 환경의 online agentic RL을 진행한다. 여기에는 reasoning과 도구 사용 비용을 줄이면서 성능을 유지하려는 Competence-Aware Reward-and-Advantage Engineering(CARE)이 들어간다.

**AI for Harness**는 실행 시점에 필요한 기술(Skills), 영속 메모리, 도구, 실행 피드백을 결합한다. 모델 실행에서 얻은 실패 흔적은 이후 데이터와 하네스 개선에 활용되며, 변경 사항은 오프라인 검토를 거친다. 논문에서 말하는 폐루프는 자율적으로 운영 중 자기 코드를 무제한 변경하는 시스템이 아니라, AI가 개선 후보를 만들고 검증 가능한 개발 과정을 지원하는 반복 구조에 가깝다.

## 공개된 근거에서 확인되는 점

MobilePA-Bench 비교에서 Qwen-Planner-Agent 27B는 Overall 77.05%를 기록해 논문에 포함된 모델·시스템 가운데 1위를 차지했다. Qwen 27B 기준 모델의 67.22%보다 높고, GPT 6 Astra(76.84%)와 Claude Opus 5(75.71%)보다도 근소하게 앞선다. 35B-A3B 구성도 기준 모델 54.90%에서 69.91%로 향상했다고 보고한다.

| 설정 | MobilePA-Bench Overall | 논문 내 비교 |
|---|---:|---|
| Qwen Baseline 27B | 67.22% | 기준 모델 |
| Qwen-Planner-Model 27B | 71.90% | Harness 없는 planner |
| Qwen-Planner-Agent 27B | 77.05% | Harness 포함 전체 시스템 |
| GPT 6 Astra | 76.84% | 비교 상용 모델 |
| Claude Opus 5 | 75.71% | 비교 상용 모델 |

세부 능력에서도 27B Agent가 Tool Use 77.79%, Memory 74.76%, Skills 86.25%를 기록했다고 보고한다. 이 수치는 모델 단독 성능과 Harness 지원을 구분하는 비교와 함께 읽어야 한다. 논문은 비용 또한 1,000개 작업당 출력 토큰 비용 2.41달러로 추정하지만, 입력 토큰, 외부 도구 요금, 기기 실행 비용, 추가 Harness 처리 비용은 제외한다고 명시한다. 따라서 전체 운영비가 아니라 논문의 가격·출력량 가정 아래 계산한 출력 비용 비교다.

## 실무 관점에서의 해석

이 연구의 중요한 설계 신호는 모델과 Harness를 따로 평가하면서도 별도 최적화 대상으로만 보지 않는다는 점이다. 같은 planner라도 메모리 검색, 도구 인터페이스, 검증기와 오류 복구가 달라지면 결과가 달라지고, 반대로 실제 실행에서 반복되는 실패는 학습 데이터와 모델 업데이트의 우선순위를 알려준다.

다만 benchmark 순위와 출력 토큰 비용은 평가 환경·가격표·작업 분포에 종속된다. 모바일 도구 생태계에 배포하려면 실제 앱 커버리지, 개인정보 취급, verifier 품질, 기기별 실패율, 추론뿐 아니라 전체 상호작용 비용을 별도로 측정해야 한다. 저자들의 성능 주장은 흥미롭지만, “AI가 스스로 AI를 개선한다”는 넓은 주장보다 평가 가능한 data–training–harness 반복 구조를 중심으로 읽는 편이 정확하다.

## 참고 자료

- [논문](https://arxiv.org/abs/2609.29892)
- [공식 프로젝트 페이지 및 기술 보고서](https://tongyi-mai.github.io/Qwen-Planner-Agent/)
- [Hugging Face 논문 소개](https://huggingface.co/papers/2609.29892)
