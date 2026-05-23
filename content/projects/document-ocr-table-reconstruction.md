---
title: "문서 OCR / 테이블 구조 복원 플랫폼"
period: "AsianaIDT / 2026.02 - now"
description: "문서 이미지에서 OCR 결과와 선분 정보를 결합해 표 구조를 복원하고, 벤치마크와 운영 콘솔까지 연결한 Document AI 플랫폼입니다."
metrics:
  - "TEDS 0.9188"
  - "TEDS-S 0.9506"
  - "Cell F1 0.9702"
stack:
  - "Python"
  - "FastAPI"
  - "Next.js"
  - "Prometheus"
  - "Grafana"
details:
  - "row/column grouping, spanned cell 복원, parser-driven reconstruction으로 복잡한 표의 구조적 일관성을 개선했습니다."
  - "hf_korean_table 100 기준 TEDS 0.9174, Cell F1 0.9934, row accuracy 1.00, column accuracy 0.96을 기록했습니다."
  - "hf_finance_legal_mrc 480 최신 실행에서 TEDS 0.9188을 기록하고, benchmark router와 콘솔로 반복 검증 흐름을 만들었습니다."
order: 30
draft: false
---

## Problem

표 문서는 텍스트 인식만으로는 셀 병합, 행/열 경계, header/body 관계가 사라지기 쉽습니다. 실제 업무 문서에서는 OCR 결과를 사람이 재정리해야 하는 비용이 커서 구조 복원 품질과 반복 검증 체계가 함께 필요했습니다.

## Approach

OCR bbox, line segment, parser output을 결합해 row/column grouping과 spanned cell 복원을 수행했습니다. benchmark router와 Next.js console을 연결해 데이터셋별 지표를 비교하고, Prometheus/Grafana 기반 관찰성으로 실행 상태를 확인할 수 있게 구성했습니다.

## Impact

hf_finance_legal_mrc 480 기준 TEDS 0.9188, TEDS-S 0.9506, Cell F1 0.9702를 기록했고, hf_korean_table 100 기준 Cell F1 0.9934까지 검증했습니다. 모델 개선뿐 아니라 운영 콘솔과 벤치마크 흐름까지 묶은 Document AI 플랫폼 형태로 정리했습니다.
