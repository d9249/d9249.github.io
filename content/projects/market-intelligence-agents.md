---
title: "Market Intelligence Multi-Agent System"
period: "AsianaIDT / 2025.07 - 2025.11"
description: "시장 조사, 내부 자산 검색, 외부 검색, 검증을 분리한 4-Layer 기반 엔터프라이즈 GenAI orchestrator입니다."
metrics:
  - "25 agents"
  - "4-Layer"
  - "Dual Knowledge Base"
stack:
  - "AWS Lambda"
  - "DynamoDB"
  - "EventBridge"
  - "Brave Search"
details:
  - "Internal Asset과 Brave Search를 결합한 Dual Knowledge Base로 사내 자료와 공개 웹 근거를 함께 사용했습니다."
  - "25개 전문 에이전트가 조사, 요약, 검증, 보고 흐름을 분담하도록 custom orchestrator를 구성했습니다."
  - "self-reflection과 단계별 상태 관리를 포함해 장시간 시장 조사 태스크를 추적 가능한 작업 단위로 분해했습니다."
order: 40
draft: false
---

## Problem

시장 조사 업무는 내부 레퍼런스, 공개 웹 자료, 경쟁사 동향, 검증 가능한 출처가 동시에 필요합니다. 단일 챗봇 방식으로는 긴 조사 과정을 유지하기 어렵고, 어느 단계에서 어떤 근거가 사용됐는지 추적하기도 어렵습니다.

## Approach

조사, 검색, 검증, 보고 생성을 분리한 4-Layer 구조를 만들고 25개 전문 에이전트가 역할별로 협업하도록 설계했습니다. Internal Asset과 Brave Search를 결합한 Dual Knowledge Base를 두어 사내 자산과 외부 근거를 함께 활용했습니다.

## Impact

긴 시장 조사 태스크를 상태 기반 작업 단위로 나누고 self-reflection을 붙여 반복 가능한 GenAI 업무 파이프라인으로 만들었습니다. 결과적으로 조사 자동화뿐 아니라 내부 자료 활용성과 출처 검증성을 함께 강화했습니다.
