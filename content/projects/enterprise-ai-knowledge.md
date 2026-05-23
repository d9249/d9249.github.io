---
title: "Enterprise AI 지식 관리 시스템"
period: "AsianaIDT / 2025.09 - 2026.01"
description: "기업 내부 지식, 규정, 문서 자료를 검색 가능한 AI 지식 체계로 전환한 hybrid RAG 플랫폼입니다."
metrics:
  - "Graph + Vector RAG"
  - "Multi-Agent"
  - "LLM Observability"
stack:
  - "LangGraph"
  - "FastAPI"
  - "Milvus"
  - "Neo4j"
  - "Langfuse"
details:
  - "Knowledge Graph 기반 관계 탐색과 Vector retrieval을 함께 사용해 구조적 지식과 의미 검색을 결합했습니다."
  - "Multi-Layer 비동기 처리 구조, plugin chunking, XML parsing으로 문서 수집부터 답변 생성까지의 흐름을 운영 관점에서 정리했습니다."
  - "LLM 호출, 검색 근거, fallback, latency를 추적하는 관찰성 구성을 통해 엔터프라이즈 환경의 검증 가능성을 높였습니다."
order: 20
draft: false
---

## Problem

사내 규정, 법령, 제안서, 기술 문서처럼 출처와 버전이 중요한 자료는 단순 벡터 검색만으로는 답변 근거를 설명하기 어렵습니다. 사용자는 빠른 답변을 원하지만 운영자는 어떤 문서와 관계를 따라 답변이 만들어졌는지 확인할 수 있어야 했습니다.

## Approach

문서 chunking, XML parsing, metadata enrichment를 수집 단계에 배치하고, Knowledge Graph 탐색과 Vector retrieval을 함께 사용하는 hybrid RAG 구조로 설계했습니다. LangGraph 기반 흐름에서 검색, 재순위화, 답변 생성, fallback을 분리하고 Langfuse로 호출 근거와 latency를 추적했습니다.

## Impact

질문-문서-관계-답변 흐름을 추적 가능한 단위로 정리해 엔터프라이즈 환경에서 설명 가능한 AI 지식 관리 기반을 만들었습니다. 이후 OCR, 시장조사 에이전트, 내부 지식 검색 프로젝트로 확장 가능한 공통 운영 패턴도 확보했습니다.
