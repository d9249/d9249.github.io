---
title: "kordoc은 HWP·PDF·Office 문서를 Markdown과 MCP 도구로 바꾸는 한국 문서 파서다"
date: "2026-07-24T17:01:56"
description: "kordoc은 HWP/HWPX·PDF·XLS/XLSX·DOCX·이미지를 Markdown으로 파싱하고, 서식 보존 패치·양식 채우기·HWPX 생성·MCP 연동까지 제공하는 Node.js 기반 한국 문서 처리 CLI다."
author: "Sangmin Lee"
repository: "chrisryugj/kordoc"
sourceUrl: "https://github.com/chrisryugj/kordoc"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Document Parser"
  - "HWP"
  - "MCP"
  - "OCR"
  - "RAG"
highlights:
  - "HWP 3.x/5.x·HWPX·HWPML·PDF·XLS/XLSX·DOCX·PNG/JPG/WebP를 Markdown과 구조화된 block으로 변환하는 Node.js CLI다."
  - "OCR·표 복원·RAG용 breadcrumb chunk·문서 비교·양식 채우기·서식 보존 patch·HWPX 생성과 렌더링을 한 도구 표면에 둔다."
  - "`npx -y kordoc setup`으로 Claude Desktop·Cursor·Claude Code·Codex 등 설치된 AI 클라이언트의 MCP 설정을 감지·등록할 수 있다."
  - "npm과 GitHub의 최신 배포는 v4.2.7이며, Node.js 18 이상에서 macOS·Linux·Windows 공용으로 실행한다."
  - "MCP 서버에는 기본 directory restriction이 없으므로, 민감 문서가 있는 환경에서는 agent 권한과 MCP 연결 범위를 먼저 점검해야 한다."
draft: false
---

한국어 업무 문서를 AI workflow에 넣을 때 가장 먼저 부딪히는 문제는 모델이 아니라 파일 형식이다. HWP/HWPX는 구조가 복잡하고, PDF에는 표·스캔·깨진 text layer가 섞이며, Word·Excel까지 함께 오면 단순한 텍스트 추출기로는 RAG나 agent 작업에 쓰기 좋은 입력을 만들기 어렵다.

`kordoc`은 이 앞단을 겨냥한 Node.js CLI 겸 MCP 서버다. HWP 3.x/5.x, HWPX, HWPML, PDF, XLS/XLSX, DOCX와 PNG/JPG/WebP 이미지를 Markdown으로 바꾸고, 필요하면 문서 구조를 보존한 chunk JSON으로 내보낸다. 여기서 끝나지 않고, 편집한 Markdown을 원본 HWPX/HWP에 반영하거나, Markdown에서 공문서 HWPX를 생성하고, 양식 필드를 채우고, 결과를 렌더링해 확인하는 흐름까지 다룬다.

![kordoc 문서 처리 흐름](/images/tips/kordoc-document-flow.webp)

## kordoc은 어떤 문제에 맞나

이 도구의 강점은 “문서를 텍스트로 읽는다”보다 **한국 문서를 AI가 다시 다룰 수 있는 구조로 바꾼다**는 데 있다. README와 npm package metadata 기준으로 `kordoc`은 다음 범위를 하나의 CLI/API/MCP 표면으로 묶는다.

| 작업 | 실무에서의 의미 |
|---|---|
| 문서 파싱 | HWP/HWPX/PDF/Office/이미지를 Markdown과 block metadata로 변환 |
| 표·수식·OCR | PDF 선 기반 표, 병합 셀, 이미지·스캔 문서의 한국어 OCR을 보조 |
| RAG chunk | `--format chunks`로 heading·개조식 위계를 breadcrumb으로 보존하고 표를 독립 chunk로 분리 |
| 문서 비교 | 서로 다른 포맷을 포함한 문서 간 변경점을 비교 |
| 양식·서식 처리 | field 추출·값 채우기·원본 HWPX/HWP 서식 보존 patch |
| 문서 생성 | Markdown의 표·수식·차트를 포함해 HWPX를 생성하고 공문서 preset 적용 |
| agent 연동 | MCP를 통해 AI client가 parse, patch, generate, render 같은 문서 도구를 호출 |

특히 HWP/HWPX 문서를 “한 번 변환해 읽는” 업무보다, **원본 서식을 유지한 채 일부 텍스트·표 셀을 고치고 다시 돌려주는** workflow에서 포지션이 뚜렷하다. 공개 README는 `patchHwpx`와 `patchHwp`가 변경된 문단·표 셀만 치환하고 나머지 원본 구조를 보존하는 방식을 설명한다. 새 문서가 아니라 기존 기관 양식에 내용을 채워야 하는 공문·신청서·보고서 흐름에 맞는 설계다.

## 설치와 첫 사용법

npm registry와 GitHub latest release 기준 최신 버전은 **v4.2.7**이며, package가 요구하는 Node.js 버전은 **18 이상**이다. 별도 global install 없이 CLI를 바로 실행할 수 있다.

```bash
# HWPX를 Markdown 파일로 변환
npx kordoc 사업계획서.hwpx -o 사업계획서.md

# 여러 PDF를 지정한 폴더에 일괄 변환
npx kordoc *.pdf -d ./변환결과/

# RAG용 구조 chunk JSON으로 출력
npx kordoc 검토서.hwpx --format chunks

# Markdown에서 HWPX 보고서 생성
npx kordoc generate 보고서.md -o 보고서.hwpx --preset 보고서

# 편집된 Markdown을 원본 문서에 서식 보존 반영
npx kordoc patch 원본.hwpx 편집.md -o 반영.hwpx
```

AI client와 함께 쓸 때는 대화형 MCP setup이 가장 짧은 경로다.

```bash
npx -y kordoc setup
```

README 기준 이 마법사는 Claude Desktop, Cursor, Claude Code, Windsurf, VS Code, Gemini CLI, Zed, Antigravity, Codex 같은 설치된 client를 감지해 설정을 반영한다. Codex에서는 설정 JSON을 직접 고치기보다 다음 등록 명령을 공식 안내로 제시한다.

```bash
codex mcp add kordoc -- npx -y kordoc mcp
```

MCP tool surface에는 `parse_document`, `parse_table`, `compare_documents`, `parse_form`, `fill_form`, `patch_document`, `generate_document`, `render_document`, `redact_document`, `parse_chunks` 등이 포함된다. 즉 agent가 “문서를 읽어 요약”하는 수준에서 나아가, 양식을 채우고 결과 HWPX를 렌더링해 보며 수정하는 loop까지 설계할 수 있다.

## 왜 유용한가

첫째, **HWP 형식의 세대 차이를 함께 다룬다.** HWP 5.x뿐 아니라 HWP3, HWPX, HWPML을 나눠 처리하고, HWP 5.x에는 OLE2/CFB 기반 parser와 배포용 문서 복호화 경로를 둔다. 한국 공공·교육·기업 문서에서는 오래된 HWP가 섞일 수 있어 이 범위가 현실적이다.

둘째, **스캔 문서를 무조건 cloud OCR로 보내지 않는다.** v4.2부터 한국어 PP-OCRv5 모델을 첫 사용 시 내려받아 로컬 추론하는 path를 제공하며, README는 약 18MB 모델과 SHA 검증을 안내한다. text layer가 없는 PDF·이미지를 다룰 때 API key 없이 시작할 수 있다는 점은 민감한 문서 환경에서 장점이다. 단, OCR 품질과 실행 시간은 실제 스캔 상태·표 복잡도·실행 환경에 따라 별도로 확인해야 한다.

셋째, **RAG 전처리가 문서의 위계를 유지한다.** PDF나 HWP에서 단순히 문장을 일정 길이로 자르면, 항목번호·heading·표의 관계가 사라지기 쉽다. `--format chunks`는 heading과 개조식 항목의 breadcrumb path를 유지하고 표를 독립 chunk로 만든다. 법령 개정안, 공문, 보고서처럼 목록·표가 많은 문서를 retrieval index에 넣을 때 특히 유용하다.

넷째, **배포·테스트 신호가 비교적 또렷하다.** GitHub API 기준 저장소는 public MIT repository이며, 확인 시점에 stars 1,546개, forks 289개, latest GitHub release와 npm 모두 `v4.2.7`을 가리킨다. 해당 release note는 빈 표 셀에 값을 넣을 때 원래 공백이 손실될 수 있던 patch bug를 수정했고, 1,316개 테스트와 roundtrip corpus gate를 통과했다고 적는다. 작은 단위의 HWP patch correctness가 중요한 도구라는 점에서 좋은 maintenance signal이다.

## 문서 agent에 연결하기 전에 볼 점

문서 처리 도구는 기능이 강할수록 권한 범위도 중요하다. `kordoc`의 SECURITY.md는 ZIP bomb, XXE/Billion Laughs, PDF JavaScript, path traversal, resource limit에 대한 방어를 설명한다. CLI/MCP file size limit은 500MB이며, PDF page·텍스트·table dimension에도 상한이 있다.

다만 이것이 sandbox를 의미하지는 않는다. 공개 security policy는 MCP server에 **default directory restriction이 없으며**, 지원 확장자의 파일이라면 filesystem 어디에서나 읽을 수 있다고 명시한다. agent client에 MCP를 붙일 때는 다음을 권장한다.

- 업무용 agent에는 필요한 문서 폴더만 열어 두고, home 전체나 비밀 관리 폴더를 문서 작업 범위에 섞지 않기
- 외부 prompt가 들어오는 문서·email attachment를 무심코 `parse_document`로 넘기지 않기
- 개인정보 마스킹 기능은 자동 탐지 보조로 보고, 최종 외부 배포 전에는 사람이 결과 HWPX/PDF를 확인하기
- 패키지·MCP를 설치하기 전에 조직의 Node/npm 공급망 정책과 문서 반출 정책을 확인하기

라이선스는 GitHub API, checked-in `LICENSE`, npm metadata가 모두 **MIT**로 일치한다. 다만 NOTICE에는 OpenDataLoader PDF, pdfjs-dist, PaddleOCR/PP-OCRv5, Pix2Text 계열 등 별도 조건을 가진 구성요소와 runtime model download 관련 고지가 있다. 도구 자체를 상용 workflow에 넣을 수 있다는 것과, 특정 OCR/model output을 포함한 재배포 조건이 자동으로 같다는 뜻은 아니므로 NOTICE도 함께 보는 편이 좋다.

## 내 판단

`kordoc`은 “HWP를 Markdown으로 바꿔 보자”보다 더 넓은 도구다. 한국형 문서를 RAG 입력으로 정리하고, AI agent가 양식을 읽고 채우고, 원본 서식을 최대한 보존하며 수정본을 만들고, 결과를 렌더링해 검토하는 workflow를 하나의 TypeScript package와 MCP server로 연결한다.

그래서 HWP/HWPX가 많은 공공·교육·행정·백오피스 환경, 또는 한국어 문서 RAG를 구축하는 팀이라면 먼저 작은 corpus로 parser·table·OCR·patch accuracy를 시험해 볼 가치가 있다. 반대로 단순 PDF text extraction만 필요하거나, agent에 filesystem-wide document access를 줄 수 없는 환경이라면 더 좁은 parser를 선택하는 편이 안전할 수 있다. 핵심은 설치 편의성보다 **문서 접근 권한, 산출물 검수, 실제 기관 양식에서의 roundtrip 품질**을 먼저 확인하는 것이다.

## 참고한 공개 자료

- [chrisryugj/kordoc GitHub repository](https://github.com/chrisryugj/kordoc)
- [kordoc README](https://raw.githubusercontent.com/chrisryugj/kordoc/main/README.md)
- [kordoc v4.2.7 GitHub release](https://github.com/chrisryugj/kordoc/releases/tag/v4.2.7)
- [kordoc npm package](https://www.npmjs.com/package/kordoc)
- [npm registry metadata for kordoc 4.2.7](https://registry.npmjs.org/kordoc/latest)
- [kordoc security policy](https://raw.githubusercontent.com/chrisryugj/kordoc/main/SECURITY.md)
- [kordoc NOTICE](https://raw.githubusercontent.com/chrisryugj/kordoc/main/NOTICE)
- [PyTorchKR 소개 글](https://discuss.pytorch.kr/t/kordoc-hwp-pdf-mcp/11342)
