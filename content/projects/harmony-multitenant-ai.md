---
title: "Harmony — 안전한 사내 AI 지식 시스템"
period: "AsianaIDT / 2026.05.11 - 2026.05.22"
description: "자동으로 문서를 넣고 답하는 RAG를, 승인·권한·페르소나가 끝까지 추적되는 멀티테넌트 AI 지식 시스템으로 재설계했습니다."
metrics:
  - "승인 전 비노출"
  - "Every-hop 권한 필터"
  - "4+N+M Persona"
stack:
  - "AI Safety Design"
  - "Access Control"
  - "Human-in-the-loop"
  - "Evaluation Design"
details:
  - "자동 등록형 RAG에 사람이 최종 승인하는 review queue를 넣어, AI는 제안하고 사람은 책임지는 지식 편입 흐름을 만들었습니다."
  - "에이전트가 여러 번 사내 자료를 다시 검색해도 최초 질문자의 권한 범위가 모든 검색 단계에 유지되도록 retrieval boundary를 정리했습니다."
  - "16개 고정 페르소나를 직접 관리하지 않고 직급 base, 팀 overlay, 직무 overlay, 연차 보정으로 조립하는 평가 구조를 설계했습니다."
order: 10
draft: false
---

## Before -> After

기존 RAG는 문서가 들어오면 곧바로 검색 대상이 되는 구조에 가깝습니다. Harmony에서는 이 흐름을 승인 전에는 보이지 않는 구조로 바꿨습니다. AI가 권한, 분류, 만료일을 추천하더라도 최종 출판은 사람이 승인해야만 일어나도록 설계해 권한 누수와 잘못된 자동 합의를 동시에 막는 방향으로 전환했습니다.

## My Role

저는 프로젝트에서 세 가지 핵심 축을 맡았습니다. 첫째, 자료가 위키에 들어가기 전 review queue를 거치도록 하는 human-gated compiler 흐름을 정리했습니다. 둘째, 에이전트가 multi-hop으로 검색해도 사용자 권한이 검색 체인 끝까지 따라가는 permission-propagating retrieval 구조를 구체화했습니다. 셋째, 팀·직급·연차에 따라 답변의 깊이와 강조점이 달라지는지 검증하는 persona overlay 평가 축을 설계했습니다.

## Design Decisions

핵심 결정은 "AI가 결정하지 않고 제안하게 한다"는 원칙이었습니다. 문서 편입 단계에서는 AI의 분류 결과를 곧바로 공식 지식으로 만들지 않았고, 검색 단계에서는 모든 hop에서 같은 사용자 권한 기준을 적용하도록 했습니다. 답변 단계에서는 페르소나를 16개씩 복제하지 않고 작은 overlay 조각을 합성해 확장 가능한 방식으로 만들었습니다.

## Portfolio Impact

Harmony는 단순 검색 정확도 프로젝트가 아니라, 사내 AI가 실제 업무 지식과 만날 때 필요한 책임 경계를 설계한 프로젝트입니다. 공개 가능한 수준에서 보자면 저는 "들어올 때는 승인으로 막고, 흐를 때는 권한으로 제한하고, 나갈 때는 사용자 맥락에 맞춘다"는 end-to-end safety architecture를 포트폴리오에 남길 수 있는 형태로 만들었습니다.
