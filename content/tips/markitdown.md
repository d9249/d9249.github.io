---
title: "MarkItDown은 문서·Office·웹 자료를 LLM 친화적 Markdown으로 바꾸는 Microsoft 변환기다"
date: "2026-05-29T15:09:12"
description: "microsoft/markitdown은 PDF, Office 문서, HTML, 이미지, 오디오, YouTube URL 등을 Markdown으로 변환해 검색·요약·RAG 전처리에 넣기 쉽게 만드는 MIT 라이선스 Python CLI/library다."
author: "Sangmin Lee"
repository: "microsoft/markitdown"
sourceUrl: "https://github.com/microsoft/markitdown"
status: "Open source beta"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Python"
  - "CLI"
  - "Document Extraction"
  - "Markdown"
  - "RAG"
  - "LLM Tools"
highlights:
  - "PDF, PowerPoint, Word, Excel, 이미지 EXIF/OCR, 오디오 transcription, HTML, CSV/JSON/XML, ZIP, YouTube URL, EPUB 등을 Markdown으로 변환하는 Python 3.10+ CLI/library다."
  - "기본은 로컬 변환이고, Azure Document Intelligence·Azure Content Understanding·LLM Vision 기반 OCR plugin은 명시적으로 켜는 선택 경로다."
  - "CLI는 `markitdown input.pdf -o output.md`, Python API는 `MarkItDown().convert(...)`처럼 단순해서 batch ingestion이나 RAG 전처리 파이프라인에 붙이기 쉽다."
  - "PyPI `markitdown` 최신 버전은 0.1.6이고 GitHub release/tag도 v0.1.6까지 공개되어 있지만, classifier는 Beta라 장기 운영 전 output 품질 regression test가 필요하다."
  - "`convert()`는 local path, URL, file/data URI를 모두 다룰 수 있으므로 서버 환경에서는 `convert_local()`, `convert_stream()`, allowlist, sandbox로 입력 범위를 좁혀야 한다."
draft: false
---

`microsoft/markitdown`은 Microsoft AutoGen 팀 쪽에서 만든 **문서 → Markdown 변환기**다. PDF, Word, PowerPoint, Excel, HTML, 이미지, 오디오, JSON/CSV/XML, EPUB, ZIP, YouTube transcript 같은 여러 입력을 LLM과 검색 파이프라인이 다루기 쉬운 Markdown 텍스트로 바꾸는 데 초점을 맞춘다.

중요한 관점은 “보기 좋은 문서 변환기”가 아니라는 점이다. README도 high-fidelity human consumption용 변환보다 **LLM, indexing, text analysis, RAG 전처리**에 맞춘 구조 보존을 강조한다. heading, list, table, link 같은 문서 구조를 최대한 Markdown으로 남겨서 이후 요약, 임베딩, 검색, agent context 구성에 바로 넣기 좋게 만드는 도구라고 보면 된다.

![MarkItDown document conversion pipeline](/images/tips/markitdown-pipeline.svg)

## MarkItDown 개요

MarkItDown은 Python package이면서 동시에 CLI다. PyPI 패키지 이름은 `markitdown`, 명령어도 `markitdown`이다. 저장소의 `packages/markitdown/pyproject.toml` 기준으로 Python 3.10 이상을 요구하고, GitHub release와 PyPI 모두 `0.1.6`이 최신 stable 버전으로 올라와 있다. GitHub API와 체크인된 `LICENSE`, pyproject 모두 MIT 라이선스로 확인된다.

지원 형식은 넓다.

- PDF
- PowerPoint, Word, Excel, 구형 Excel
- 이미지의 EXIF metadata와 OCR 경로
- 오디오 metadata와 speech transcription
- HTML, RSS/Wikipedia/Bing SERP류 웹 문서
- CSV, JSON, XML 같은 text-based format
- Outlook `.msg`
- Jupyter Notebook, EPUB
- ZIP 내부 파일 순회
- YouTube URL transcript

내부적으로는 파일 확장자, MIME type, Magika 기반 추론, converter registry를 이용해 적절한 converter를 고른다. 기본 built-in converter는 켜져 있고, 3rd-party plugin은 명시적으로 `--use-plugins` 또는 `enable_plugins=True`를 줘야 켜진다.

## 설치와 첫 사용법

가장 단순한 설치는 PyPI에서 optional dependency를 모두 포함해 설치하는 것이다.

```bash
python -m venv .venv
source .venv/bin/activate
pip install 'markitdown[all]'
```

`uv`를 쓰면 README가 제안하는 흐름은 다음과 같다.

```bash
uv venv --python=3.12 .venv
source .venv/bin/activate
uv pip install 'markitdown[all]'
```

CLI는 아주 직접적이다.

```bash
markitdown path-to-file.pdf -o document.md
markitdown path-to-file.pptx > slides.md
cat path-to-file.pdf | markitdown > document.md
```

stdin으로 받을 때는 `--extension`, `--mime-type`, `--charset`로 힌트를 줄 수 있고, base64 data URI를 output에 남길지 여부는 `--keep-data-uris`로 조절한다.

Python API도 batch ingestion에 붙이기 쉽다.

```python
from markitdown import MarkItDown

md = MarkItDown(enable_plugins=False)
result = md.convert("report.xlsx")
print(result.text_content)
```

서버나 agent tool 안에 넣을 때는 아무 입력이나 `convert()`로 넘기기보다, 용도별로 더 좁은 API를 고르는 편이 안전하다.

```python
from markitdown import MarkItDown

md = MarkItDown()

# 로컬 파일만 허용하는 서버라면 convert_local()처럼 의도를 좁힌다.
result = md.convert_local("/safe/uploads/report.pdf")
print(result.text_content)
```

## optional dependency를 좁혀 설치하기

`[all]`은 편하지만 PDF, Office, Azure, audio, YouTube transcription까지 한 번에 설치한다. 운영 환경에서는 필요한 format만 설치하는 편이 dependency surface와 container size를 줄이기 좋다.

```bash
pip install 'markitdown[pdf,docx,pptx]'
```

README와 pyproject가 노출하는 extra는 대략 다음과 같다.

- `[pptx]`: PowerPoint
- `[docx]`: Word
- `[xlsx]`, `[xls]`: Excel
- `[pdf]`: PDF, pdfminer/pdfplumber 계열
- `[outlook]`: Outlook message
- `[audio-transcription]`: wav/mp3 transcription
- `[youtube-transcription]`: YouTube transcript
- `[az-doc-intel]`: Azure Document Intelligence
- `[az-content-understanding]`: Azure Content Understanding
- `[all]`: 위 optional dependency 전체

즉 “회사 자료를 전부 Markdown으로 바꿔보자”보다, 먼저 실제 ingestion 대상이 PDF인지, Office인지, HTML인지, 오디오인지 나누고 필요한 extra만 넣는 방식이 낫다.

## Azure·LLM Vision 경로는 별도 경계로 봐야 한다

MarkItDown의 기본 경로는 로컬 변환이지만, README는 더 높은 품질이나 구조화 추출이 필요할 때 Azure 계열 경로도 제공한다.

```bash
markitdown path-to-file.pdf -o document.md -d -e "<document_intelligence_endpoint>"
markitdown path-to-file.pdf --use-cu --cu-endpoint "<content_understanding_endpoint>"
```

Azure Content Understanding 경로는 문서, 이미지, 오디오, 비디오에 대해 analyzer를 고르고, field extraction 결과를 YAML front matter로 붙이는 식의 고급 흐름을 지원한다. 대신 각 변환 호출이 Azure API 비용과 데이터 전송을 동반한다. 민감한 계약서, 고객 문서, 내부 회의 녹취를 다룰 때는 “Markdown 변환” 문제가 아니라 **클라우드 문서 분석 서비스에 어떤 원문을 보내는가**의 문제로 봐야 한다.

이미지나 문서 안 embedded image OCR이 중요하면 `markitdown-ocr` plugin도 있다.

```bash
pip install markitdown-ocr
pip install openai
markitdown document.pdf --use-plugins --llm-client openai --llm-model gpt-4o
```

Python에서는 기존 image description과 같은 `llm_client` / `llm_model` 패턴을 쓴다.

```python
from markitdown import MarkItDown
from openai import OpenAI

md = MarkItDown(
    enable_plugins=True,
    llm_client=OpenAI(),
    llm_model="gpt-4o",
)
result = md.convert("document_with_images.pdf")
print(result.text_content)
```

이 plugin은 LLM Vision으로 PDF, DOCX, PPTX, XLSX 안의 이미지를 읽어 OCR block을 삽입한다. 편하지만 이미지가 외부 LLM provider로 나갈 수 있고, 키·쿼터·vision model 지원 여부가 모두 품질과 비용에 영향을 준다.

## MCP 서버로 agent에게 붙일 수도 있다

별도 패키지 `markitdown-mcp`는 MarkItDown을 MCP server로 노출한다. 제공 tool은 `convert_to_markdown(uri)` 하나이며, URI는 `http:`, `https:`, `file:`, `data:`를 받을 수 있다.

```bash
pip install markitdown-mcp
markitdown-mcp
```

HTTP/SSE 모드도 있다.

```bash
markitdown-mcp --http --host 127.0.0.1 --port 3001
```

다만 이 경로는 특히 조심해야 한다. `markitdown-mcp` README는 HTTP/SSE 서버가 기본적으로 localhost에 bind되지만 인증을 제공하지 않고, 같은 로컬 머신의 다른 프로세스가 접근할 수 있으며, server user가 읽을 수 있는 local file이나 network data를 tool이 읽을 수 있다고 경고한다. Claude Desktop 같은 agent에 붙일 때도 Docker container와 volume mount 범위를 좁히는 방식이 안전하다.

## 어디에 잘 맞는가

MarkItDown이 잘 맞는 곳은 “원문 파일을 사람이 예쁘게 다시 편집할 최종 Markdown”보다 **LLM에게 넘길 중간 representation**이다.

- 사내 PDF/Office 자료를 임베딩하기 전 Markdown으로 정규화하기
- 웹 페이지, CSV/JSON/XML, notebook, EPUB을 같은 텍스트 파이프라인에 넣기
- agent가 첨부 문서에서 제목, 표, 목록, 링크를 최대한 잃지 않고 읽게 하기
- ingestion worker에서 형식별 converter를 직접 조합하지 않고 하나의 CLI/API로 통일하기
- Azure Document Intelligence나 Content Understanding을 필요한 format에만 선택적으로 붙이기
- MCP tool로 로컬 agent에게 “문서를 Markdown으로 바꿔 읽기” 기능을 주기

특히 `markitdown input -o output.md` 형태가 단순해서 cron, batch job, CI artifact 변환, RAG indexing job에 넣기 좋다. 반대로 OCR quality, table fidelity, layout reconstruction이 비즈니스 품질을 좌우하는 경우에는 MarkItDown output을 그대로 믿기보다 샘플셋 regression test와 수작업 QA 기준을 같이 만들어야 한다.

## 주의할 점

- **Beta로 보는 편이 맞다.** PyPI classifier는 `Development Status :: 4 - Beta`이고, 문서 변환 품질은 format·파일 생성 도구·언어·스캔 상태에 크게 좌우된다. 운영 ingestion에는 golden document set으로 output diff를 보는 테스트가 필요하다.
- **Markdown export가 RAG 완성은 아니다.** heading과 table이 보존되어도 chunking, metadata, page anchor, 이미지 reference, 중복 header/footer 제거, 개인정보 마스킹은 별도 단계로 설계해야 한다.
- **`convert()`는 넓은 입력을 받는다.** 문자열 입력이 local path인지, `http(s)`, `file:`, `data:` URI인지에 따라 로컬 파일과 네트워크를 모두 읽을 수 있다. untrusted upload나 multi-tenant 서버에서는 URI scheme, 경로, 네트워크 목적지, file size를 제한하고 `convert_local()`/`convert_stream()`처럼 좁은 API를 쓰는 편이 안전하다.
- **Azure/LLM 경로는 데이터 반출 경계다.** Document Intelligence, Content Understanding, LLM Vision OCR은 원문이나 이미지가 외부 provider로 갈 수 있고 비용도 발생한다. 민감 문서에는 provider policy와 region, logging, retention을 먼저 확인해야 한다.
- **MCP 서버는 인증이 없다.** HTTP/SSE로 열 때 기본은 localhost지만, port를 외부 interface에 bind하면 파일 읽기·네트워크 fetch tool을 노출하는 것과 비슷해진다. agent에게 붙일 때는 container, volume mount, OS user 권한을 좁혀야 한다.
- **optional dependency는 무겁다.** `[all]`은 편하지만 PDF/Office/audio/Azure 계열 dependency를 한꺼번에 끌어온다. production image에서는 필요한 extra만 설치하는 편이 낫다.

## 내 판단

MarkItDown은 “문서를 LLM에게 먹이기 전에 일단 Markdown으로 평탄화하자”는 문제에 대해, 직접 converter zoo를 조립하지 않아도 되는 실용적인 기본값을 준다. Microsoft repo이고 MIT 라이선스이며 PyPI 배포와 GitHub release가 맞물려 있어, 실험용 스크립트나 내부 RAG prototype의 첫 ingestion layer로 시도하기 좋다.

다만 이 도구 하나가 문서 이해 품질을 보장하지는 않는다. 내가 추천하는 도입 순서는 `pip install 'markitdown[pdf,docx,pptx]'`처럼 필요한 format만 좁혀 설치하고, 실제 팀 문서 20~50개를 골라 Markdown output을 diff 가능한 baseline으로 만든 뒤, OCR·Azure·MCP는 필요할 때만 별도 보안 검토를 거쳐 켜는 방식이다. 그렇게 쓰면 MarkItDown은 RAG 파이프라인의 “최종 답변 품질”이 아니라, **입력 형식을 통일하는 얇고 유용한 전처리 계층**으로 꽤 좋은 선택이다.

## 참고한 공개 자료

- [microsoft/markitdown GitHub repository](https://github.com/microsoft/markitdown)
- [MarkItDown README](https://github.com/microsoft/markitdown/blob/main/README.md)
- [MarkItDown package README](https://github.com/microsoft/markitdown/blob/main/packages/markitdown/README.md)
- [MarkItDown PyPI package](https://pypi.org/project/markitdown/)
- [MarkItDown v0.1.6 release](https://github.com/microsoft/markitdown/releases/tag/v0.1.6)
- [markitdown-mcp README](https://github.com/microsoft/markitdown/blob/main/packages/markitdown-mcp/README.md)
- [markitdown-ocr README](https://github.com/microsoft/markitdown/blob/main/packages/markitdown-ocr/README.md)
- [MarkItDown LICENSE](https://github.com/microsoft/markitdown/blob/main/LICENSE)
