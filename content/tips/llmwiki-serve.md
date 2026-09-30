---
title: "llmwiki-serve: 로컬 Markdown·Obsidian 지식을 에이전트에 연결하는 읽기 전용 서버"
date: "2026-09-30T21:16:22+09:00"
description: "기존 Markdown·Obsidian 폴더를 바꾸지 않고 CLI·HTTP·MCP로 인용 가능한 문맥을 조회하는 로컬 지식 소스입니다."
author: "Sangmin Lee"
repository: "knowledge-bridge-labs/llmwiki-serve"
sourceUrl: "https://github.com/knowledge-bridge-labs/llmwiki-serve"
status: "Open source"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Knowledge Base"
  - "Markdown"
  - "Obsidian"
  - "MCP"
  - "Coding Agents"
highlights:
  - "기존 Markdown·Obsidian 위키를 변경하거나 업로드하지 않고 에이전트용 읽기 전용 문맥 소스로 제공합니다."
  - "CLI, HTTP API, MCP Streamable HTTP에서 동일한 인용·경로·관계 정보를 조회할 수 있습니다."
  - "기본 검색은 로컬 lexical 방식이며 모델이나 임베딩 없이 실행할 수 있습니다."
  - "2026년 9월 공개 버전은 0.2.14, Python 3.11 이상, Apache-2.0입니다."
draft: false
---

`llmwiki-serve`는 이미 보유한 Markdown, Obsidian 스타일 또는 LLMWiki 폴더를 에이전트가 검색하고 읽을 수 있는 로컬 지식 소스로 투영한다. 새로운 위키 작성기나 답변 생성기가 아니라, 기존 문서를 그대로 두고 필요한 출처를 찾아주는 읽기 전용 계층이다.

CLI·HTTP·MCP Streamable HTTP로 같은 자료를 노출하므로 Codex, Claude Code, IDE 에이전트, 자체 스크립트 등에 연결할 수 있다. 검색 결과는 페이지 제목과 경로, source reference, 문서 관계 힌트를 포함해 다음 단계의 에이전트가 근거를 확인하도록 돕는다.

![llmwiki-serve 공식 첫 실행 데모 포스터](https://knowledge-bridge-labs.github.io/llmwiki-docs/demo/first-run/first-run-poster.png)

## 왜 유용한가

프로젝트 문서는 README 하나로 끝나지 않는다. ADR, 기능 명세, 릴리스 체크리스트, 회의 기록, 개인 Obsidian 노트를 매번 프롬프트에 붙이는 대신, 에이전트가 관련 문서를 찾고 필요한 범위만 읽도록 연결할 수 있다.

- Markdown heading, front matter, 태그, Obsidian wikilink와 문서 간 링크를 처리한다.
- 기본 lexical 검색은 로컬에서 실행되며 모델 호출이나 임베딩 다운로드가 필요 없다.
- CLI·HTTP·MCP가 하나의 읽기 전용 projection을 공유한다.
- `draft`, `unpublished`, `confidential` 등 비공개 상태로 표시된 문서는 기본 검색에서 제외된다.
- 기본 서버는 웹 크롤링, 최종 답변 생성, 원본 문서 수정 또는 업로드를 하지 않는다.

2026년 9월 30일 확인한 최신 공개 버전은 `0.2.14`다. PyPI 배포판은 Python 3.11 이상을 요구하고, 저장소에 Apache-2.0 라이선스가 포함되어 있다. PyTorch Korea 게시물의 설치 예시인 0.2.13 이후 0.2.14에서는 CLI 버전 확인 옵션이 추가됐다. 선택 기능인 System-One/Jev 검색 행동 가이드는 기본 비활성화이며, 제공자 키를 설정해 명시적으로 켜야 한다.

## 설치와 첫 사용

공식 PyPI 패키지를 `uv` 도구로 설치한다.

```bash
uv tool install llmwiki-serve==0.2.14
llmwiki-serve --version
```

기존 폴더에서 문서 목록을 확인하고 질의할 수 있다.

```bash
llmwiki-serve manifest ./my-wiki
llmwiki-serve query ./my-wiki "release readiness"
```

HTTP 서버로 열려면 로컬 인터페이스에 바인딩한다.

```bash
llmwiki-serve serve ./my-wiki --host 127.0.0.1 --port 8765
```

다른 터미널에서 `/query`를 호출할 수 있고, MCP Streamable HTTP 클라이언트에는 다음 주소를 등록하면 된다.

```text
http://127.0.0.1:8765/mcp/stream
```

MCP 사용 시에는 우선 `llmwiki_context`로 관련 context pack을 찾고, 필요에 따라 `llmwiki_search`, `llmwiki_read`, `llmwiki_graph` 등으로 문서 범위를 좁히는 흐름이다.

## 활용 포인트

- 코드 변경 전 관련 설계 결정과 기능 명세를 찾아 읽게 하기
- 릴리스 준비 작업에서 로컬 체크리스트와 운영 문서를 근거로 삼기
- Obsidian의 프로젝트 노트를 IDE 에이전트가 검색하게 하기
- 내부 스크립트에서 검색·문서 읽기 API를 호출해 자료의 출처 경로를 보존하기

기본 기능만으로 검색 품질이 충분하지 않은 경우에만 `[vector]` extra와 FastEmbed provider를 검토하면 된다. 모델 다운로드와 의미 기반 검색은 선택 기능이므로, 기본 설치부터 벡터 데이터베이스를 운영할 필요가 없다.

## 주의할 점

읽기 전용이라는 점은 원본 파일 변조를 줄여주지만, 서버가 반환하는 문서 내용은 민감 정보를 포함할 수 있다. 네트워크 인터페이스를 넓게 노출하기 전에 방화벽·인증 구성을 확인하고, 외부 모델이나 선택형 판단 제공자에 어떤 쿼리 정보가 전달되는지 검토해야 한다. 저장소는 enterprise 인증 시스템이나 호스팅형 RAG를 표방하지 않는다.

또한 lexical 검색은 모델 없이 동작하는 대신 의미가 비슷하지만 단어가 다른 문서를 놓칠 수 있다. 문서 공개 상태 표시가 실제 접근 제어를 대체하지 않으므로, 비밀 자료가 섞인 vault를 공유하기 전에는 디렉터리와 문서 상태 필터를 직접 점검하는 편이 안전하다.

## 내 판단

프로젝트 지식이 Markdown이나 Obsidian에 이미 정리되어 있고, 코딩 에이전트가 변경 전에 그 문서를 근거로 읽게 하고 싶다면 작은 로컬 서버로 시험할 만하다. 반대로 문서 수집·정제·생성부터 관리하는 위키 플랫폼, 정교한 권한 제어가 필요한 다중 사용자 서비스, 완성된 답변을 반환하는 RAG 앱을 찾는다면 역할이 다르다.

## 참고한 공개 자료

- [공식 GitHub 저장소](https://github.com/knowledge-bridge-labs/llmwiki-serve)
- [PyPI 패키지](https://pypi.org/project/llmwiki-serve/)
- [공식 문서 포털](https://knowledge-bridge-labs.github.io/llmwiki-docs/)
- [PyTorch Korea 소개 글](https://discuss.pytorch.kr/t/llmwiki-serve-markdown-obsidian/12026)
