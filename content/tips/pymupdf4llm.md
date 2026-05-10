---
title: "PyMuPDF4LLM은 PDF를 RAG용 Markdown·JSON으로 바꾸는 가벼운 Python 도구다"
date: "2026-05-11T00:42:01"
description: "PyMuPDF4LLM은 PyMuPDF 위에서 PDF와 문서를 Markdown, JSON, plain text로 변환해 RAG·임베딩·LLM ingest 파이프라인의 첫 단계를 빠르게 만드는 Python 라이브러리다."
author: "Sangmin Lee"
repository: "pymupdf/pymupdf4llm"
sourceUrl: "https://github.com/pymupdf/pymupdf4llm"
status: "Open source Python library"
license: "AGPL-3.0 / commercial"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "PDF"
  - "RAG"
  - "Document AI"
  - "Python"
  - "OCR"
  - "PyMuPDF"
highlights:
  - "한 줄의 `pymupdf4llm.to_markdown()` 호출로 PDF를 LLM prompt, vector store, chunker에 넣기 쉬운 Markdown으로 바꾼다."
  - "Markdown뿐 아니라 JSON과 plain text를 지원하고, `page_chunks=True`로 페이지별 metadata가 붙은 chunk를 바로 만들 수 있다."
  - "multi-column layout, table, image reference, header/footer 처리, 선택적 OCR, LlamaIndex·LangChain 연동을 PyMuPDF 계열 도구 안에 묶는다."
  - "Python 3.10 이상에서 `pip install pymupdf4llm`로 설치하며 PyMuPDF와 pymupdf-layout을 함께 맞춰 설치한다."
  - "라이선스는 AGPL-3.0 또는 Artifex commercial license 구조라 proprietary RAG 제품에 넣기 전 라이선스 검토가 필요하다."
draft: false
---

PDF를 RAG 파이프라인에 넣을 때 가장 먼저 부딪히는 문제는 “모델이 답할 수 있느냐”가 아니라 “문서를 어떤 텍스트 구조로 꺼낼 것이냐”다. 단순 `pdfplumber`나 OCR 결과를 그대로 넣으면 multi-column 문서의 읽기 순서, 표, 헤더/푸터, 페이지 경계, 이미지 reference가 쉽게 무너진다.

`PyMuPDF4LLM`은 이 앞단을 가볍게 처리하려는 PyMuPDF 계열 Python 라이브러리다. 목표는 PDF와 문서를 **Markdown, JSON, plain text**로 바꿔 LLM prompt, vector embedding, chunker, RAG pipeline에 바로 넣기 쉬운 형태로 만드는 것이다. README의 핵심 예시는 아주 짧다.

```python
import pymupdf4llm

md = pymupdf4llm.to_markdown("research-paper.pdf")
```

![PyMuPDF4LLM repository](https://opengraph.githubassets.com/d9249-pymupdf4llm/pymupdf/pymupdf4llm)

## PyMuPDF4LLM 개요

PyMuPDF4LLM은 독립적인 RAG 프레임워크라기보다 **문서 → LLM-ready text** 변환 레이어에 가깝다. 내부적으로 MuPDF/PyMuPDF 기반의 문서 처리 능력을 쓰고, 최근 버전에서는 `pymupdf-layout`을 자동 설치·초기화해 layout-aware extraction을 기본 경로로 사용한다.

공식 README와 문서 기준 주요 출력은 다음이다.

- `to_markdown(path)`: GitHub-compatible Markdown 출력
- `to_json(path)`: bbox, layout element, font metadata가 포함된 구조화 JSON 출력
- `to_text(path)`: 검색 인덱싱이나 단순 NLP용 plain text 출력
- `to_markdown(path, page_chunks=True)`: 페이지별 metadata와 text가 들어간 chunk dict 목록 출력
- `LlamaMarkdownReader().load_data(path)`: LlamaIndex용 문서 객체 로딩

지원 문서 범위도 PDF에만 닫혀 있지는 않다. README는 PDF, XPS/OXPS, EPUB/MOBI/FB2, 이미지 파일을 기본 범위로 설명하고, Office 문서(DOCX/XLSX/PPTX/HWP/HWPX)는 별도 **PyMuPDF Pro**와 조합할 때 확장된다고 안내한다.

## 왜 유용한가

가장 큰 장점은 “문서 추출용 대형 OCR/vision pipeline을 매번 돌리기 전”에 쓸 수 있는 빠른 기본값이라는 점이다. PyMuPDF4LLM은 GPU, cloud, token 사용 없이 로컬 Python 코드로 문서를 Markdown화한다. 텍스트 기반 PDF에서는 native text extraction을 활용하고, 스캔되었거나 깨진 영역은 OCR이 필요한지 판단해 선택적으로 처리하는 방향이다.

특히 RAG 전처리에서는 Markdown 출력이 편하다. heading, list, table, code block, image reference 같은 구조가 유지되면 chunker가 무작정 고정 길이 문자열을 자르는 것보다 문서 의미 단위를 잡기 쉬워진다. JSON 출력은 더 세밀한 pipeline을 만들 때 유용하다. bbox와 layout data를 보존하므로 “이 문장이 어느 위치에서 왔는가”를 추적하거나, 표·그림 주변 문맥을 별도로 다루는 후처리를 붙이기 좋다.

실무적으로는 이런 상황에 잘 맞는다.

- 논문 PDF, 매뉴얼, 보고서를 Markdown으로 빠르게 변환해 LLM에게 넣고 싶다.
- RAG indexing 전에 PDF의 heading/table/list 구조를 어느 정도 살리고 싶다.
- 페이지별 metadata가 있는 chunk를 만들어 vector store에 넣고 싶다.
- 완전한 OCR 시스템을 깔기 전에 text-based PDF 처리부터 가볍게 시작하고 싶다.
- LlamaIndex나 LangChain 기반 문서 로딩 흐름에 PyMuPDF 계열 extractor를 붙이고 싶다.

## 설치와 첫 사용법

공식 설치 명령은 PyPI 패키지 하나로 시작한다.

```bash
pip install pymupdf4llm
```

PyPI metadata 기준 현재 패키지는 Python `>=3.10`을 요구하고, `pymupdf`, `pymupdf_layout`, `tabulate`, `markdown`, `pymdown-extensions`를 의존성으로 둔다. `setup.py`는 PyMuPDF와 pymupdf-layout을 PyMuPDF4LLM 버전과 맞춰 설치하도록 exact version을 지정한다. 이미 다른 프로젝트에서 PyMuPDF 버전을 고정해 쓰고 있다면 가상환경을 분리하는 편이 안전하다.

가장 기본적인 변환 흐름은 다음이다.

```python
from pathlib import Path
import pymupdf4llm

md = pymupdf4llm.to_markdown("document.pdf")
Path("document.md").write_bytes(md.encode("utf-8"))
```

JSON이 필요하면 API만 바꾸면 된다.

```python
import pymupdf4llm

data = pymupdf4llm.to_json("document.pdf")
```

RAG indexing용으로 페이지별 chunk를 받고 싶다면 `page_chunks=True`가 핵심이다.

```python
import pymupdf4llm

chunks = pymupdf4llm.to_markdown("document.pdf", page_chunks=True)

for chunk in chunks:
    print(chunk["metadata"]["page"])
    print(chunk["text"])
```

이미지 추출을 함께 하고 싶을 때는 `write_images=True`와 저장 경로를 지정한다.

```python
import pymupdf4llm

md = pymupdf4llm.to_markdown(
    "document.pdf",
    write_images=True,
    image_path="./images",
    image_format="png",
    dpi=150,
)
```

## OCR과 layout 처리에서 봐야 할 점

README가 강조하는 기능 중 하나는 hybrid OCR이다. 모든 페이지를 무조건 OCR하는 대신, 페이지의 텍스트 레이어와 이미지/그래픽 상태를 보고 OCR이 필요한 영역을 판단한다. 문서에 선택 가능한 텍스트가 깨끗하면 native extraction을 쓰고, 텍스트가 없거나 깨진 영역이 많으면 OCR을 붙이는 방식이다.

OCR 관련 옵션은 다음처럼 조절할 수 있다.

```python
import pymupdf4llm

# OCR을 강제로 켜기
md = pymupdf4llm.to_markdown("scanned.pdf", force_ocr=True)

# OCR을 끄기
md = pymupdf4llm.to_markdown("document.pdf", use_ocr=False)

# OCR 언어와 해상도 조정
md = pymupdf4llm.to_markdown(
    "document.pdf",
    ocr_language="eng+kor",
    ocr_dpi=150,
)
```

다만 OCR은 자동으로 마법처럼 해결되는 기능이 아니다. README와 changelog를 함께 보면 PyMuPDF4LLM은 Tesseract와 `rapidocr_onnxruntime` 중 사용 가능한 엔진을 런타임에 고르는 구조로 이동했다. 둘 다 없으면 기본적으로 OCR이 비활성화되거나 경고가 나고, 강제 OCR 상황에서는 사용할 수 있는 OCR plugin이 없을 때 예외가 날 수 있다. 스캔 문서가 핵심이라면 Tesseract 언어팩이나 RapidOCR 설치까지 함께 검증해야 한다.

## 주의할 점

첫째, 라이선스가 중요하다. GitHub API와 저장소 `LICENSE`는 AGPL-3.0을 가리키고, PyPI metadata와 README는 “GNU Affero GPL 3.0 또는 Artifex commercial license”라는 dual-license 구조를 설명한다. 개인 실험이나 AGPL-compatible 오픈소스 프로젝트에는 접근성이 좋지만, proprietary RAG 제품이나 SaaS backend에 포함하려면 Artifex commercial license를 검토해야 한다.

둘째, PyMuPDF4LLM은 “문서 추출기”이지 완성된 검색 시스템이 아니다. vector store, embedding model, retrieval evaluation, chunk overlap 정책, 개인정보 마스킹, source citation UI는 별도로 설계해야 한다. Markdown이 잘 나와도 그대로 index에 넣는 것이 항상 최선은 아니므로 문서 종류별 샘플 평가가 필요하다.

셋째, 버전 표면이 조금 헷갈릴 수 있다. 조사 시점 기준 GitHub 최신 Release는 `v0.3.4`였지만, PyPI 최신 버전과 `setup.py` 버전은 `1.27.2.3`이다. changelog에는 PyMuPDF family와 맞추기 위해 release numbering scheme을 바꿨다는 설명이 있다. 설치·업데이트 판단은 GitHub Releases만 보지 말고 PyPI, `CHANGES.md`, 문서를 함께 보는 편이 안전하다.

넷째, OCR과 layout 의존성은 가벼운 pure-text extractor보다 무거울 수 있다. PyMuPDF4LLM 자체는 one-line install이지만, layout/OCR 경로에는 `pymupdf-layout`, OCR engine, 언어 데이터, onnxruntime 계열 의존성이 관여할 수 있다. CI나 서버리스 환경에서는 cold start, wheel availability, 시스템 패키지(Tesseract) 설치 여부를 먼저 확인하는 것이 좋다.

다섯째, 로컬에서 추출하는 것과 데이터가 안전하게 남는 것은 별개다. PyMuPDF4LLM 호출 자체는 클라우드 LLM을 쓰지 않지만, 추출된 Markdown을 OpenAI/Claude/Gemini API, 외부 vector DB, 로그 수집 시스템에 넘기는 순간 문서 내용은 그 downstream 정책을 따른다. 사내 문서나 고객 PDF를 다룰 때는 extractor보다 이후 파이프라인의 데이터 경계를 먼저 정해야 한다.

## 내 판단

PyMuPDF4LLM은 RAG나 문서 QA를 만들 때 “일단 PDF를 LLM이 읽기 좋은 텍스트로 꺼내는 기본 도구”로 평가할 만하다. 특히 논문, 매뉴얼, 보고서처럼 텍스트 레이어가 살아 있는 PDF가 많고, Markdown 구조를 살려 chunking하고 싶은 팀에게는 빠르게 붙여볼 수 있는 선택지다.

반대로 scanned-only 문서, 복잡한 양식, 품질 보증이 중요한 표 추출, 대규모 ingestion pipeline이라면 이 도구 하나로 끝난다고 보면 안 된다. OCR 엔진, 샘플 기반 품질 평가, 실패 문서 fallback, 라이선스, downstream privacy까지 함께 봐야 한다. 그래도 `pip install pymupdf4llm`과 `to_markdown()` 한 줄로 시작할 수 있다는 점은 문서 AI 실험의 진입 비용을 꽤 낮춘다.

## 참고한 공개 자료

- [pymupdf/pymupdf4llm GitHub repository](https://github.com/pymupdf/pymupdf4llm)
- [PyMuPDF4LLM README](https://github.com/pymupdf/pymupdf4llm/blob/main/README.md)
- [PyMuPDF4LLM documentation](https://pymupdf.readthedocs.io/en/latest/pymupdf4llm/)
- [PyMuPDF, LLM & RAG documentation](https://pymupdf.readthedocs.io/en/latest/rag.html)
- [PyMuPDF4LLM PyPI package](https://pypi.org/project/pymupdf4llm/)
- [CHANGES.md](https://github.com/pymupdf/pymupdf4llm/blob/main/CHANGES.md)
- [AGPL-3.0 LICENSE file](https://github.com/pymupdf/pymupdf4llm/blob/main/LICENSE)
