---
title: "LiteParse는 로컬에서 빠르게 PDF를 텍스트·좌표로 바꾸는 경량 문서 파서다"
date: "2026-06-04T01:57:54"
description: "run-llama/liteparse는 PDF·Office·이미지를 로컬에서 파싱해 텍스트, JSON bounding box, 페이지 스크린샷을 내보내는 Rust 기반 문서 파서/CLI입니다."
author: "Sangmin Lee"
repository: "run-llama/liteparse"
sourceUrl: "https://github.com/run-llama/liteparse"
status: "Open source beta"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Document Parsing"
  - "OCR"
  - "CLI"
  - "RAG"
  - "Rust"
  - "Developer Tools"
highlights:
  - "PDFium 기반 Rust core로 PDF 텍스트를 빠르게 뽑고, 선택적으로 Tesseract 또는 HTTP OCR 서버 결과를 병합합니다."
  - "npm, pip, cargo 설치 경로가 모두 같은 `lit` CLI를 제공하며, Node.js/TypeScript·Python·Rust·Browser WASM 바인딩을 함께 제공합니다."
  - "텍스트뿐 아니라 JSON bounding box와 페이지 스크린샷을 내보내므로 RAG 근거 표시, visual citation, 에이전트 문서 읽기에 맞습니다."
  - "Office 문서와 이미지는 LibreOffice/ImageMagick 변환 의존성이 필요하고, WASM 빌드는 브라우저 제약 때문에 기능 범위가 다릅니다."
  - "로컬 우선 도구지만 untrusted upload 서비스로 감싸면 파일 검증, sandbox, timeout, resource limit을 별도로 설계해야 합니다."
draft: false
---

LLM/RAG 파이프라인에서 PDF를 다루다 보면 “텍스트만 뽑으면 끝”이 아닌 경우가 많다. 문장이 어느 페이지, 어느 좌표에서 왔는지 남겨야 하고, 표나 레이아웃이 깨지는지 확인하려면 페이지 스크린샷도 필요하다. 클라우드 문서 파서를 붙이면 편하지만, 비용·지연·보안 때문에 로컬에서 먼저 가볍게 처리하고 싶은 상황도 많다.

`LiteParse`는 LlamaIndex 쪽에서 공개한 Rust 기반 오픈소스 문서 파서다. 저장소 설명처럼 목표는 **fast and light**에 가깝다. PDFium으로 PDF 텍스트와 좌표를 추출하고, 필요한 페이지에는 Tesseract 또는 외부 HTTP OCR 서버를 붙인 뒤, 텍스트·JSON·스크린샷을 `lit` CLI와 언어별 바인딩으로 제공한다. README는 “proprietary LLM features나 cloud dependencies 없이 로컬에서 돈다”고 명시한다.

조사 시점 기준 GitHub 저장소의 기본 브랜치는 `main`, 주 구현 언어는 Rust, checked-in `LICENSE`와 GitHub API는 Apache-2.0이다. npm `@llamaindex/liteparse`, npm `@llamaindex/liteparse-wasm`, PyPI `liteparse`, crates.io `liteparse` 모두 최신 버전 표면은 `2.0.5`로 맞춰져 있었다. 다만 Python `pyproject.toml`/PyPI classifier는 MIT로 표시되어 있어, 회사 제품에 넣을 때는 저장소 라이선스와 패키지 메타데이터 불일치를 한 번 더 확인하는 편이 안전하다.

![LiteParse local parsing pipeline](/images/tips/liteparse-pipeline.svg)

## LiteParse 개요

LiteParse를 “PDF 텍스트 추출기”라고만 부르면 조금 아쉽다. 더 정확히는 **로컬 문서 파싱 core + CLI + 다국어 바인딩 + visual citation 보조 도구**에 가깝다.

공식 README와 문서 기준 핵심 흐름은 다음과 같다.

1. PDF는 PDFium으로 직접 텍스트와 위치 정보를 추출한다.
2. DOCX/XLSX/PPTX 같은 Office 문서와 이미지는 LibreOffice 또는 ImageMagick으로 PDF 쪽으로 변환한 뒤 처리한다.
3. 텍스트가 부족한 페이지에는 내장 Tesseract OCR 또는 `POST /ocr` 규격을 구현한 외부 OCR 서버를 붙일 수 있다.
4. 결과는 plain text, JSON page data, text item bounding box, 페이지 스크린샷으로 나온다.
5. 같은 core를 CLI, Python, Node.js/TypeScript, Rust, Browser WASM에서 쓴다.

즉 “문서를 LLM에 넣기 전 전처리”뿐 아니라, 추출 결과가 문서의 어느 위치에서 왔는지 다시 보여주는 RAG/agent UI에도 맞는 도구다.

## 설치와 첫 사용법

공식 문서는 설치 경로를 여러 개로 나눈다. CLI만 빠르게 써볼 때는 Python이나 npm global 설치가 가장 단순하다.

```bash
# Node.js / TypeScript: lit CLI를 전역으로 쓰고 싶을 때
npm i -g @llamaindex/liteparse

# Python: Python 바인딩 + lit CLI
pip install liteparse

# Rust CLI
cargo install liteparse

# Rust library
cargo add liteparse

# Browser WASM: lit CLI는 없고 JS API로 사용
npm i @llamaindex/liteparse-wasm
```

CLI 명령은 설치 경로가 달라도 `lit`으로 통일된다. 기본 사용은 다음처럼 시작한다.

```bash
# PDF를 파싱해 텍스트를 stdout으로 출력
lit parse document.pdf

# JSON과 bounding box까지 저장
lit parse document.pdf --format json -o output.json

# 특정 페이지만 처리
lit parse document.pdf --target-pages "1-5,10,15-20"

# OCR 없이 빠르게 텍스트만 추출
lit parse document.pdf --no-ocr

# 전체 폴더 batch parse
lit batch-parse ./input-directory ./output-directory

# LLM/검수용 페이지 스크린샷 생성
lit screenshot document.pdf -o ./screenshots
```

패키지 표면은 다음처럼 나뉜다.

| 표면 | 패키지 / 명령 | 조사 시점 버전·요구사항 |
| --- | --- | --- |
| CLI / Node.js | `@llamaindex/liteparse`, `lit` | npm latest `2.0.5`, Node.js `>=18.0.0` |
| Python | `liteparse`, `lit` | PyPI latest `2.0.5`, Python `>=3.10` |
| Rust | `liteparse`, `cargo install liteparse` | crates.io latest `2.0.5` |
| Browser | `@llamaindex/liteparse-wasm` | npm latest `2.0.5`, 브라우저 API 중심 |

## RAG에서 특히 쓸 만한 지점

첫째, **bounding box가 기본 산출물**이라는 점이 좋다. `lit parse document.pdf --format json`을 쓰면 page 단위 텍스트와 함께 각 text item의 위치가 들어온다. 공식 visual citations 문서는 이 좌표를 페이지 스크린샷 픽셀 좌표로 변환해, 검색한 문구가 실제 PDF 어디에 있었는지 노란 박스로 표시하는 예시를 제공한다.

![LiteParse visual citation example](/images/tips/liteparse-visual-citation.png)

둘째, **텍스트와 스크린샷을 같은 도구로 만든다.** RAG chunk에는 텍스트를 넣고, 답변 검증 UI에는 해당 페이지 이미지를 띄우는 식의 흐름을 만들 때 CLI가 둘 다 해주는 점이 편하다. 텍스트만 보고 애매한 표·도면·제품 스펙은 스크린샷을 함께 넘겨서 visual model이나 사람 검수자가 확인하게 만들 수 있다.

셋째, **OCR 교체 지점이 단순하다.** 기본 Tesseract가 맞지 않는 언어·도메인에서는 EasyOCR, PaddleOCR, 사내 OCR 서버, 클라우드 OCR 등을 `POST /ocr` 형태로 감싸면 된다. LiteParse가 기대하는 응답은 `{ results: [{ text, bbox, confidence }] }`처럼 단순한 JSON 구조다. 다만 이 경우 OCR 서버의 정확도, 처리량, 개인정보 경계는 LiteParse가 아니라 운영자가 책임져야 한다.

넷째, **바인딩 선택지가 넓다.** Python 데이터 파이프라인, Node.js 서비스, Rust CLI, 브라우저 데모가 같은 프로젝트 안에 있다. 특히 npm 패키지는 macOS/Linux/Windows native optional dependency를 나눠 배포하고, WASM 패키지는 서버 없이 브라우저에서 PDF parsing을 시도할 수 있게 한다.

## 주의할 점

첫째, LiteParse가 로컬 우선이라고 해서 모든 문서를 그대로 넣어도 안전하다는 뜻은 아니다. `SECURITY.md`는 악성 입력 파일, zip bomb, malformed PDF, 경로 조작 filename, 대용량/복잡 문서로 인한 DoS를 사용자의 책임 범위로 둔다. 웹 업로드 API로 감쌀 때는 파일 타입·크기 검증, sandbox/container 격리, timeout, concurrency limit을 별도로 설계해야 한다.

둘째, Office 문서와 이미지는 “지원한다”와 “아무 준비 없이 된다”가 다르다. DOCX/XLSX/PPTX/ODT/ODS/ODP 쪽은 LibreOffice가 필요하고, 이미지 변환에는 ImageMagick이 필요하다. Windows에서는 LibreOffice program directory를 PATH에 넣어야 할 수 있다는 주석도 있다. 운영 환경에 넣을 때는 PDF-only 모드인지, 변환 의존성까지 포함할지 먼저 정해야 한다.

셋째, WASM 빌드는 기능 범위가 다르다. 브라우저에서는 file path 입력, LibreOffice/ImageMagick 기반 변환, 내장 Tesseract/HTTP OCR, screenshot 기능이 제한된다. 대신 `Uint8Array` 입력과 custom JS OCR engine을 넘기는 방식으로 PDF parsing을 붙이는 쪽에 가깝다.

넷째, output은 Markdown이 아니라 text/JSON 중심이다. README의 LlamaParse 안내도 암시하듯, dense table, 복잡한 multi-column layout, chart, handwritten text, scanned PDF처럼 어려운 문서에서는 클라우드 LlamaParse 같은 더 무거운 파서가 나은 경우가 있다. LiteParse는 “가볍고 빠른 로컬 1차 파서”로 보는 편이 현실적이다.

다섯째, 라이선스 메타데이터가 완전히 매끈하지 않다. 저장소 루트 LICENSE와 Rust/Node/WASM 패키지는 Apache-2.0로 보이지만, Python `pyproject.toml`과 PyPI classifier는 MIT로 표시되어 있었다. 실제 재배포·상용 제품 내장 시에는 사용하려는 패키지 표면의 license file과 배포 metadata를 다시 확인하자.

## 내 판단

LiteParse는 “문서 파싱 SaaS를 대체하는 완전한 플랫폼”이라기보다, 로컬 개발 환경과 에이전트/RAG 실험에서 **먼저 돌려볼 수 있는 빠른 parser primitive**에 가깝다. PDF에서 텍스트와 좌표를 얻고, 필요하면 OCR과 screenshot을 붙여 근거 표시까지 만들 수 있다는 점이 장점이다.

개인적으로는 세 가지 상황에 잘 맞는다고 본다. 첫째, 논문·매뉴얼·스펙 문서를 로컬에서 대량 전처리해 LLM에게 넘기고 싶을 때. 둘째, 답변의 출처 위치를 페이지 이미지 위에 다시 표시하는 visual citation UX를 만들 때. 셋째, 클라우드 문서 파서를 쓰기 전 내부 문서에 대해 “로컬 도구로 어디까지 되는지” 빠르게 baseline을 잡을 때다.

반대로 손글씨, 스캔 품질이 낮은 문서, 복잡한 표·차트가 많은 업무 문서, 외부 사용자가 업로드하는 production 서비스라면 LiteParse만 믿고 끝내기보다 OCR 서버 품질, 실패 케이스 fallback, sandboxing, human review를 함께 설계하는 쪽이 낫다.

## 참고한 공개 자료

- [run-llama/liteparse GitHub repository](https://github.com/run-llama/liteparse)
- [LiteParse official docs](https://developers.llamaindex.ai/liteparse/)
- [LiteParse Getting Started](https://developers.llamaindex.ai/liteparse/getting_started/)
- [LiteParse CLI reference](https://developers.llamaindex.ai/liteparse/cli-reference/)
- [LiteParse visual citations guide](https://developers.llamaindex.ai/liteparse/guides/visual-citations/)
- [LiteParse browser WASM guide](https://developers.llamaindex.ai/liteparse/guides/browser-usage/)
- [LiteParse server usage guide](https://developers.llamaindex.ai/liteparse/guides/server-usage/)
- [LiteParse SECURITY.md](https://github.com/run-llama/liteparse/blob/main/SECURITY.md)
- [LiteParse PyPI package](https://pypi.org/project/liteparse/)
- [@llamaindex/liteparse npm package](https://www.npmjs.com/package/@llamaindex/liteparse)
- [@llamaindex/liteparse-wasm npm package](https://www.npmjs.com/package/@llamaindex/liteparse-wasm)
- [liteparse crates.io package](https://crates.io/crates/liteparse)
