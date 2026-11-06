---
title: "Palette: 작은 모델에 슬라이드 설계·코딩·검수를 가르치는 방법"
date: "2026-11-06T20:52:43"
description: "IBM Research의 Palette는 20B 모델과 하나의 LoRA 어댑터로 덱 설계와 슬라이드 코딩을 나누고, 합성 데이터와 검사·수정 하네스로 품질을 높인다. PresentBench 결과와 평가에 동원된 보조 모델, 공개 배포의 범위를 함께 살펴본다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Palette
  - IBM Research
  - Presentation Generation
  - LoRA
  - Synthetic Data
  - Agent Harness
draft: false
---

슬라이드 생성에서 필요한 것은 보기 좋은 한 장만이 아니다. 같은 색상·서체·레이아웃을 덱 전체에 유지하면서, 원문에 없는 사실을 보태지 않고, 글자가 겹치거나 화면 밖으로 나가지 않게 해야 한다. IBM Research가 11월 3일 소개한 **Palette**는 이 문제를 작은 모델의 학습 데이터와 제작 파이프라인을 함께 바꾸는 방식으로 다룬다.[1]

Palette는 20B 모델을 LoRA로 조정해 **덱을 설계하는 역할과 슬라이드 코드를 작성하는 역할**을 맡긴다.[1]
완성된 코드는 곧바로 반환하지 않고 렌더링·검사·수정을 거친다.[1]
중요한 점은 “20B 모델 혼자 문서부터 발표자료까지 모두 처리한다”는 이야기는 아니라는 것이다. 발표된 평가에는 원문에서 계획을 만드는 별도 프런티어 모델과, 오류를 고치는 별도 편집 모델도 등장한다.[1]

## 덱의 이야기와 좌표 계산을 분리한다

Palette의 출발점은 편집 판단과 배치 계산이 서로 다른 작업이라는 데 있다.[1]
어떤 주장을 앞에 놓고 표 대신 차트를 쓸지 결정하는 일과, 제목·도형·본문을 정확한 좌표에 배치하는 일을 한 번에 처리하면 작은 모델이 쉽게 실패한다는 설명이다.[1]

이를 위해 **하나의 LoRA 어댑터가 두 역할을 수행**하도록 학습한다.[1]
설계자는 계획을 읽어 색상·서체 체계와 슬라이드별 레이아웃·정확한 내용·설계 근거를 JSON 브리프로 만든다.[1]
코더는 그중 한 장의 명세를 받아 PptxGenJS 코드와 배치 근거를 작성한다.[1]
PptxGenJS는 텍스트·표·도형·이미지·차트 등을 JavaScript로 구성해 PowerPoint 파일로 내보내는 라이브러리다.[4]

<figure>
  <img src="/images/blog/palette-deck-building-pipeline.webp" alt="Palette가 계획을 JSON 브리프로 바꾸고 슬라이드별 코드를 병렬 작성한 뒤 규칙 수정과 렌더링 검사를 거쳐 발표자료를 만드는 공식 구조도" />
  <figcaption>설계와 코딩은 같은 어댑터의 두 역할이고, 출력 뒤에는 별도의 검사·수정 하네스가 있다. 모바일에서는 그림을 좌우로 밀거나 눌러 확대해 읽을 수 있다.[1]</figcaption>
</figure>

브리프는 사람이 읽고 고칠 수 있는 중간 산출물이다.[1]
슬라이드별 내용이 코딩 전에 고정되므로 코더 호출을 장마다 병렬 실행할 수 있고, 저자들은 **코딩 단계가 약 6–7배 빨라진다**고 보고한다.[1]
이는 덱 제작 전체의 지연 시간이나 다른 서비스 대비 속도 향상으로 확대해서 읽을 수치는 아니다.[1]

## 합성 데이터에는 결과뿐 아니라 선택의 이유를 넣는다

학습 데이터는 큰 오픈 모델을 교사로 사용해 합성한 약 1,000개 덱, 약 10,000장 슬라이드다.[1]
덱의 종류·길이·레이아웃·사용자 지시를 레시피로 정하고, 깔끔한 개요부터 정리되지 않은 원문까지 서로 다른 입력 형태를 넣었다.[1]
시각 언어는 IBM Design Language를 따른다.[1]
이 디자인 체계는 서체와 색상뿐 아니라 그리드·아이콘·데이터 시각화 등 여러 요소를 다룬다.[3]

각 예시에는 다른 선택지를 검토하고 버린 이유도 담긴다.[1]
예를 들어 “정확한 개별 값보다 추세를 보여 주는 것이 목적이라 표 대신 차트를 선택했다”거나, “제목이 본문을 침범하므로 글자 크기를 줄였다”는 식이다.[1]
생성된 덱을 렌더링해 겹침·넘침을 검사하고, 깨진 슬라이드를 수정한 뒤 수정 이유도 다시 작성한다.[1]

학습 비율도 중요했다. 코더 예시가 설계자 예시보다 약 5배 길어 단순히 섞으면 설계자 학습이 부족했고, 설계자 예시를 5배 오버샘플링했다고 설명한다.[1]

충실성 문제에서는 프롬프트 규칙을 늘리는 것보다 **참조 덱을 바로잡는 편이 효과적이었다**는 관찰이 눈에 띈다.[1]
입력은 세 항목뿐인데 브리프가 큰 표를 요구하면 코더가 빈칸을 지어내게 된다.[1]
저자들은 교사가 지시문보다 참조 예시를 강하게 모방했다고 보고한다.[1]
다만 이는 발표에 실린 개발 경험이지, 효과 크기를 통제 실험으로 수치화한 결과는 아니다.[1]

## 사용자의 짧은 지시를 브리프에 반영한다

사용자는 계획 안에 `[[make this a timeline]]`처럼 짧은 지시를 넣을 수 있다.[1]
설계자가 이를 브리프에 반영하고 코더가 실제 배치에 적용한다.[1]
학습 레시피에는 레이아웃·어조·청중·순서·생략·강조 등을 포함한 12개 지시 범주가 들어간다.[1]

<figure>
  <img src="/images/blog/palette-deck-building-directive.webp" alt="같은 일정 계획을 별도 지시 없이 표로 표현한 왼쪽 슬라이드와 타임라인 지시를 반영한 오른쪽 슬라이드의 공식 비교 예시" />
  <figcaption>같은 계획을 표와 타임라인으로 표현한 공식 예시다. 지시는 문장에 머물지 않고 중간 브리프와 슬라이드 구조로 이어진다.[1]</figcaption>
</figure>

이 기능을 기존 회사 템플릿을 곧바로 불러오는 기능과 혼동해서는 안 된다. 한두 개의 기존 `.pptx` 파일로 출력을 다시 입히는 방식은 발표의 향후 탐색 항목이다.[1]

## 수정은 검사 결과가 나아질 때만 채택한다

하네스는 먼저 잘못된 색상 코드 같은 알려진 오류를 규칙으로 고친다.[1]
이어 슬라이드를 렌더링하고 텍스트 겹침·잘림·화면 밖 넘침을 측정한다.[1]
문제가 있는 장은 별도 편집 모델에 보내 코드를 다시 작성하게 한다.[1]

수정본은 검사기가 개선을 확인한 경우에만 채택하고, 그렇지 않으면 원본을 유지한다.[1]
여기서 “더 나빠지지 않는 수정”은 **검사기가 측정하는 조건에 대한 채택 규칙**으로 읽어야 한다. 도형 겹침이 줄었다고 사실 정확성·서사·브랜드 일관성까지 모두 좋아졌다는 보장이 되지는 않는다.[1]

<figure>
  <img src="/images/blog/palette-deck-building-repair.webp" alt="제목과 설명이 겹친 네 개의 가로 카드를 하네스가 두 행 두 열로 재배치해 겹침을 줄인 공식 수정 전후 예시" />
  <figcaption>공식 수정 예시. 카드의 제목과 설명이 겹치는 배치를 2×2 그리드로 재구성한다. 정성적 예시와 전체 평가의 평균 개선은 구분해야 한다.[1]</figcaption>
</figure>

저자들은 PresentBench 덱을 한 번씩 생성한 뒤 하네스 적용 전후를 평가했고, **131개 덱에서 평균 3.5점 개선**을 보고한다. 이는 모든 덱이나 모든 평가 항목이 각각 3.5점씩 좋아졌다는 뜻은 아니다.[1]

## PresentBench 결과: 세 분야 평균 2위라는 범위

PresentBench의 데이터 카드는 원본 전체에 238개 평가 사례와 다섯 분야가 있다고 설명한다.[2]
사례마다 평균 54.1개의 이진 체크리스트 항목을 제공한다.[6]
Palette 발표는 기본 요건·시각 디자인·완전성·정확성·충실성의 다섯 평가 기준을 설명한다.[1]
원 논문은 축별 이진 항목의 통과율을 구한 뒤 다섯 축을 동일 가중 평균한다.[10]
원 논문의 판정 모델은 `gemini-3-flash-preview`이며, 이 설정이 Palette 실험에도 그대로 사용됐다고 확인된 것은 아니다.[10]

아래는 IBM의 공식 결과 그래프에서 옮긴 점수다.[5]
**경제·교육·발표 세 분야만의 비교**이며, NotebookLM 수치는 PresentBench 논문의 기존 결과를 가져온 것이다.[1]

<table style="width:100%;">
  <thead><tr><th style="min-width:0;padding:10px 8px;">분야</th><th style="min-width:0;padding:10px 8px;">Palette</th><th style="min-width:0;padding:10px 8px;">NotebookLM</th></tr></thead>
  <tbody>
    <tr><td style="min-width:0;padding:10px 8px;">경제</td><td style="min-width:0;padding:10px 8px;text-align:right;">59.1</td><td style="min-width:0;padding:10px 8px;text-align:right;">58.2</td></tr>
    <tr><td style="min-width:0;padding:10px 8px;">교육</td><td style="min-width:0;padding:10px 8px;text-align:right;">59.0</td><td style="min-width:0;padding:10px 8px;text-align:right;">55.0</td></tr>
    <tr><td style="min-width:0;padding:10px 8px;">발표</td><td style="min-width:0;padding:10px 8px;text-align:right;">60.9</td><td style="min-width:0;padding:10px 8px;text-align:right;">69.2</td></tr>
    <tr><td style="min-width:0;padding:10px 8px;">세 분야 평균</td><td style="min-width:0;padding:10px 8px;text-align:right;">59.7</td><td style="min-width:0;padding:10px 8px;text-align:right;">60.8</td></tr>
  </tbody>
</table>

Palette는 보고된 비교에서 경제·교육 1위, 발표 3위이며 세 분야 평균으로는 2위다.[1]
원본 데이터 카드의 NotebookLM 전체 점수 62.5와 위 표의 60.8은 집계 범위가 다르므로 직접 바꿔 쓰면 안 된다.[5][6]

평가 입력도 짚어야 한다. PresentBench는 원문 자료를 주므로, 이 실험에서는 **별도 프런티어 모델이 원문을 계획으로 변환**하고 Palette가 그 계획으로 덱을 만들었다.[1]
따라서 이를 동일한 원문 입력을 받은 20B 단독 모델의 완전한 종단간 비교로 해석하기는 어렵다. 또한 PresentBench가 특정 디자인 언어를 얼마나 잘 따르는지까지 측정하는 것은 아니라고 저자들도 명시한다. 높은 점수가 곧 회사 브랜드 준수의 검증은 아니다.[1]

## 코드는 공개됐지만, 현행 기본값과 발표 실험은 다르다

발표 본문에 직접 코드 링크가 없다고 해서 구현이 비공개인 것은 아니다.[1][7]
IBM의 공식 **`project-palette` 저장소에는 앱·CLI·렌더러·검사·수정 하네스가 공개**되어 있다.[7]
코드의 라이선스는 Apache-2.0이다.[9]

읽은 `main`은 발표의 20B 설정과 다르다.[8]
README는 `gpt-oss-20b-palette-lora`를 소개하지만, 확인한 커밋 `41ecc09`의 `config.py`는 Qwen2.5-Coder-32B 기반 어댑터를 기본값으로 두고 기존 20B 어댑터를 별도 선택지로 유지한다.[7][8]
현재 기본값으로 실행하는 것과 발표 실험 재현은 구분해야 한다.[8]

공개 코드와 가중치 접근성도 다르다. 이번에 읽은 공식 저장소와 공개 모델 검색에서는 어댑터 가중치의 공개 다운로드 경로를 확인하지 못했다.
README의 실행 구성은 자체 호스팅 Code Engine 엔드포인트·watsonx 또는 IBM VPN이 필요한 RITS 자격증명을 안내한다.[7]
따라서 저장소를 받는 것만으로 누구나 오프라인 실행할 수 있다고 보기는 어렵다.[7]

저장소의 `benchmark/`도 발표의 평가 패키지와 혼동해서는 안 된다. 해당 문서는 세 호스트에서 스킬을 검증하는 33개 대화를 설명하며, 입력 문서는 내부 자료라 저장소에 넣지 않았다고 명시한다.[11]
이 스킬 검증은 발표의 PresentBench 평가와 다른 실험이다.[11]

자가 호스팅 역시 설계 목표와 실제 운영 구성을 나눠 봐야 한다. 기밀 문서를 내부에 두려면 설계자·코더뿐 아니라 원문 계획기와 편집 모델까지 어디서 실행되는지 확인해야 한다. 발표된 평가 경로만으로 전체 흐름이 로컬 또는 사내망에서 끝난다고 단정할 수는 없다.[1]
README는 사용자 입력·계획을 기록하고 생성 덱을 보관한다고 안내하므로, 사내 도입 시에는 추론 경로뿐 아니라 로그·파일 보관 정책도 점검해야 한다.[7]

향후 방향으로 제시한 것은 검사 신호를 보상으로 사용하는 강화학습, 원문 그림을 추출해 배치하는 기능, 기존 덱을 이용한 재스타일링이다.[1]
GRPO식 학습도 이 항목에 속한다.[1]
현재 소개된 LoRA 학습을 이미 강화학습으로 완성한 시스템처럼 설명해서는 안 된다.[1]

## 실무적으로 남는 교훈

Palette에서 가져올 만한 아이디어는 모델 크기만이 아니다. **편집 가능한 브리프를 먼저 만들고, 장별 생성을 분리하고, 결과를 검사한 뒤 통과한 수정만 채택하는 구조**다. 저자들이 강조하는 “검사기를 먼저 만들라”는 결론도 이 흐름에 있다.[1]

실제 업무에 적용한다면 레이아웃 검사와 별도로 원문 대조·브랜드 준수·사람의 최종 검토를 두는 편이 타당하다. Palette의 결과는 이 구조가 작은 모델의 슬라이드 제작을 개선할 가능성을 보여 주지만, 공개 재현성과 완전한 내부 운영 여부까지 입증한 결과로 읽어서는 안 된다.

## Sources

[1] https://huggingface.co/blog/ibm-research/palette-deck-building
[2] https://huggingface.co/datasets/PresentBench/PresentBench
[3] https://www.ibm.com/design/language/resources
[4] https://gitbrent.github.io/PptxGenJS
[5] https://cdn-uploads.huggingface.co/production/uploads/63890e3843d8b0797a0ad606/QiWVeHtadoTFYsfdPjkDr.png
[6] https://huggingface.co/datasets/PresentBench/PresentBench/raw/main/README.md
[7] https://github.com/IBM/project-palette
[8] https://raw.githubusercontent.com/IBM/project-palette/41ecc0926aeef77722156cc5832ac71955285927/config.py
[9] https://raw.githubusercontent.com/IBM/project-palette/41ecc0926aeef77722156cc5832ac71955285927/LICENSE
[10] https://arxiv.org/html/2603.07244v1
[11] https://raw.githubusercontent.com/IBM/project-palette/41ecc0926aeef77722156cc5832ac71955285927/benchmark/BENCHMARK.md
