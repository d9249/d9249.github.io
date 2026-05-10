---
title: "MarkEdit은 TextEdit처럼 가볍게 쓰는 macOS Markdown 편집기다"
date: "2026-05-10"
description: "MarkEdit은 TextEdit의 단순함을 Markdown에 맞춘 macOS 전용 오픈소스 편집기입니다. 4MB급 경량 앱, GFM 준수, CodeMirror 6 기반 편집, 목차·통계·멀티 커서·Writing Tools·Shortcuts/AppleScript 연동을 제공합니다."
author: "Sangmin Lee"
repository: "MarkEdit-app/MarkEdit"
sourceUrl: "https://github.com/MarkEdit-app/MarkEdit"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "macOS"
  - "Markdown"
  - "Editor"
  - "Writing Tools"
  - "Productivity"
  - "Swift"
  - "CodeMirror"
highlights:
  - "TextEdit처럼 단순한 macOS 네이티브 감각을 유지하면서 Markdown 작성에 필요한 기능만 얹은 편집기입니다."
  - "GitHub Flavored Markdown을 엄격히 따르고, CodeMirror 6 기반으로 대용량 문서·멀티 커서·코드 폴딩을 처리합니다."
  - "목차 이동, 선택/문서 통계, 단어 완성, macOS 인라인 예측, Apple Intelligence Writing Tools를 글쓰기 흐름에 붙입니다."
  - "Homebrew cask 또는 GitHub Releases DMG로 설치하며, 최신 릴리스는 macOS 15 이상을 요구합니다."
  - "전체 HTML 미리보기와 PDF/Word 내보내기는 기본 내장 대신 MarkEdit-preview, Pandoc 같은 외부 도구와 연결하는 철학을 택합니다."
draft: false
---

MarkEdit은 “Mac의 TextEdit처럼 단순하지만 Markdown 전용인 앱”을 목표로 만든 오픈소스 Markdown 편집기다. 노트 앱, 지식관리 시스템, 블로그 플랫폼까지 한 번에 하려는 도구가 아니라, 로컬의 `.md` 파일을 빠르고 정확하게 편집하는 데 집중한다.

공식 README의 표현이 꽤 명확하다. MarkEdit은 무료 오픈소스 macOS 앱이고, 4MB급 가벼운 설치 크기, 10MB 파일도 쉽게 다루는 성능, macOS 네이티브 통합, GitHub Flavored Markdown 준수를 핵심 가치로 둔다. 저장소 기준 라이선스는 MIT이고, 최신 릴리스는 `v1.32.1`이다.

![MarkEdit editor UI](/images/tips/markedit-editor.png)

## MarkEdit 개요

MarkEdit의 가장 큰 특징은 “Markdown 문법을 숨기지 않는 편집기”라는 점이다. WYSIWYG처럼 `#`, `**bold**`, `` `code` `` 같은 원문 기호를 감추기보다, Markdown 원문은 그대로 보여주고 색상·간격·강조로 읽기 좋게 만든다.

이 방향은 개발자 문서, README, 블로그 초안, 릴리스 노트처럼 Markdown 원문 자체가 중요한 글에 잘 맞는다. 예를 들어 GitHub에 올릴 README를 쓰거나, 정적 블로그용 Markdown을 고칠 때 렌더링 결과만 예쁘게 보이는 것보다 실제 소스가 어떻게 남는지 확인하는 편이 더 중요할 때가 많다.

공식 문서에서 강조하는 차별점은 다음과 같다.

- 사용자 데이터를 수집하지 않는 privacy-focused 앱이다.
- macOS UI 컨트롤과 키 바인딩을 존중하는 네이티브 감각을 유지한다.
- 10MB급 Markdown 파일도 빠르게 열고 편집하는 성능을 목표로 한다.
- 설치 파일이 약 4MB 수준으로 작다.
- Shortcuts, AppleScript, system services, MarkEdit-api를 통해 확장할 수 있다.
- GitHub Flavored Markdown 사양을 따르고, 독자 문법을 만들지 않는다.

내부적으로는 SwiftUI, AppKit, WebKit, CodeMirror 6을 조합한다. 즉 “완전 네이티브 텍스트 엔진”만 고집하기보다, Markdown 편집에서 필요한 멀티 커서, 코드 폴딩, 정확한 파싱 같은 부분은 CodeMirror 생태계를 활용하고, 앱 껍데기와 시스템 통합은 macOS 방식으로 가져가는 선택이다.

## 설치와 요구사항

가장 간단한 설치 방법은 Homebrew cask다.

```bash
brew install --cask markedit
```

또는 GitHub Releases에서 최신 DMG를 내려받아 `MarkEdit.app`을 `Applications`로 드래그하면 된다. 최신 릴리스 `v1.32.1`에는 범용 DMG와 Apple Silicon용 DMG가 함께 올라와 있다.

주의할 점은 최신 버전의 요구사항이다. README 배지와 Homebrew cask 기준 현재 MarkEdit 최신 라인은 `macOS 15.0+`를 요구한다. macOS 12, 13, 14 사용자를 위한 과거 릴리스 태그도 별도로 제공되지만, 최신 기능과 업데이트 흐름은 macOS 15 이상을 기준으로 보는 편이 맞다.

설치 후 Markdown 파일의 기본 앱으로 지정하고 싶다면 MarkEdit 안에서 자동으로 바꾸는 대신 Finder에서 수동으로 설정해야 한다. 공식 매뉴얼은 sandboxed app 특성상 다음 흐름을 안내한다.

1. Finder에서 Markdown 파일을 선택한다.
2. `⌘ I`로 정보 창을 연다.
3. `Open with:`에서 MarkEdit을 선택한다.
4. `Change All...`을 눌러 같은 파일 형식의 기본 앱으로 지정한다.

## 글쓰기 경험: 원문 Markdown을 유지하면서 보기 좋게 편집

MarkEdit의 편집 화면은 “미리보기 패널을 항상 옆에 띄우는 앱”과는 다르다. 제목, 굵게, 이탤릭, 인라인 코드, 목록, 인용문, HTML 태그 같은 Markdown 요소를 원문 기호와 함께 보여주되, 문법 하이라이트와 타이포그래피로 구조가 보이게 만든다.

특히 문서 작성 중 자주 쓰는 보조 기능이 macOS스럽게 붙어 있다.

- `⇧ ⌘ O`로 Table of Contents 메뉴를 열어 heading 사이를 이동한다.
- `⌥ ⌘ ↑`, `⌥ ⌘ ↓`로 이전/다음 섹션을 선택한다.
- 줄 번호 gutter 위에 마우스를 올려 heading이나 code block을 접는다.
- `⌘`을 누른 채 선택해 여러 커서/선택 영역을 만든다.
- `⌥` 드래그로 사각형 선택을 만든다.
- 우클릭으로 같은 단어의 모든 occurrence를 선택해 한 번에 고친다.

긴 README나 기술 문서를 고칠 때는 이 조합이 꽤 실용적이다. 단순 텍스트 편집기보다 구조 탐색이 좋고, 무거운 IDE보다 산만함이 적다.

## 통계와 완성 기능

![MarkEdit statistics and completion](/images/tips/markedit-statistics.png)

MarkEdit에는 선택 영역 또는 전체 문서의 통계를 보여주는 패널이 있다. 글자 수, 단어 수, 문장 수, 문단 수, 예상 읽기 시간을 확인할 수 있고, UI를 깨끗하게 유지하기 위해 기본으로 항상 노출되지는 않는다.

공식 매뉴얼 기준 통계 패널은 툴바를 커스터마이즈해 추가하거나 `⇧ ⌘ I`로 열 수 있다. 최신 릴리스 설명에는 `v1.32.0`에서 browser-style tab reopening, selection restoration, statistics rules가 들어갔고, `v1.32.1`은 그 이후의 버그 수정·성능 개선 릴리스라고 되어 있다.

통계 규칙을 직접 정의할 수 있다는 점도 눈에 띈다. 예를 들어 CJK 문자 수처럼 기본 word count만으로 부족한 값을 정규식 기반 custom rule로 추가할 수 있다.

```json
[
  {
    "title": "CJK Characters",
    "icon": "character.textbox.zh",
    "pattern": "[\\p{Han}\\u{3000}-\\u{303F}]"
  }
]
```

완성 기능도 macOS 기본 습관과 잘 맞춘다. `option-esc` 또는 `fn-F5`로 word completion 패널을 열 수 있고, 화살표 또는 `ctrl-n`, `ctrl-p`로 이동한 뒤 Enter/Tab으로 선택한다. 문서 내부 단어, 표준 단어, 추측 단어를 후보로 쓸 수 있으며, 링크 안에서는 내부 anchor, footnote, 파일 경로 완성도 지원한다.

macOS Sonoma의 inline predictive text, macOS Sequoia의 Apple Intelligence Writing Tools도 MarkEdit 안에서 자연스럽게 쓸 수 있다. 공식 스크린샷에는 proofread, rewrite, make friendly, make professional, summarize, create key points 같은 Writing Tools 메뉴가 MarkEdit 툴바 흐름에 붙어 있는 모습이 보인다.

## 설정에서 먼저 볼 만한 것

![MarkEdit settings](/images/tips/markedit-settings.png)

MarkEdit은 “설정을 최소화한다”는 철학을 갖고 있지만, Markdown 작성 환경에 필요한 기본값은 꽤 실용적으로 제공한다. 설치 후 먼저 볼 만한 항목은 다음이다.

- Editor font와 font size
- light/dark theme
- line numbers
- active line indicator
- selection status
- invisible character 표시 방식
- line wrapping
- line height
- tab key 동작과 기본 들여쓰기
- 저장 시 final newline 추가 여부
- 저장 시 trailing whitespace 제거 여부
- word completion 후보 범위
- inline predictions와 suggest while typing
- 새 파일 기본 확장자 `.md`
- 기본 인코딩 UTF-8
- 기본 line ending LF

기술 문서나 Git 저장소 안의 Markdown을 자주 만지는 사람이라면 `Line numbers`, `Trim trailing whitespace`, `Insert final newline`, `UTF-8`, `LF`, `2 spaces` 같은 설정을 본인 프로젝트 규칙에 맞춰두는 편이 좋다.

## macOS 통합이 좋은 지점

MarkEdit이 단순한 Markdown 전용 에디터를 넘어 macOS 앱답게 느껴지는 부분은 시스템 기능과의 결합이다.

첫째, Quick Look extension이 있다. 시스템 설정에서 MarkEdit의 Quick Look 확장을 켜면 Finder에서 Markdown 파일을 빠르게 미리 볼 때 syntax highlighting을 적용할 수 있다. 공식 문서도 이 확장은 intentionally simple하다고 설명하므로, 앱 본체와 같은 모든 기능을 기대하기보다는 Finder용 빠른 확인 도구로 보는 것이 맞다.

둘째, Finder extension으로 새 untitled text file을 빠르게 만들 수 있다. Finder 우클릭 메뉴나 툴바에서 새 텍스트 파일을 만드는 흐름이 필요한 사용자에게 유용하다.

셋째, AppleScript와 Shortcuts 연동이 가능하다. README는 MarkEdit이 Shortcuts와 AppleScript 통합을 통해 확장 가능하다고 설명하고, 위키는 macOS App Shortcuts를 활용해 메뉴 항목에 원하는 키 조합을 붙이는 방법도 안내한다.

넷째, 커맨드라인에서 파일을 열고 싶다면 별도 CLI를 설치하지 않아도 macOS의 `open`을 쓰면 된다.

```bash
open -a MarkEdit /file/path.md
```

자주 쓴다면 shell alias로 감싸면 된다.

```bash
alias markedit="open -a MarkEdit"
markedit README.md
```

## 하지 않는 것도 분명하다

MarkEdit은 “feature-rich”를 목표로 하지 않는다. 공식 Why MarkEdit 문서는 오히려 “Feature Poor”를 장점처럼 설명한다. 노트 데이터베이스, second brain, 독자 문법, 강한 lock-in을 만들지 않고, plain text Markdown 편집기로 남겠다는 입장이다.

그래서 몇 가지 기능은 기본 앱 안에 억지로 넣지 않는다.

- 전체 HTML side-by-side preview는 기본 내장이 아니라 `MarkEdit-preview` 확장으로 제공한다.
- PDF, Word, HTML 같은 내보내기는 직접 구현하기보다 Pandoc 사용을 권장한다.
- 고급 커스터마이징은 UI 안에 복잡한 설정을 늘리기보다 `editor.css`, `editor.js`, `settings.json`, MarkEdit-api 쪽으로 열어둔다.

이 점은 호불호가 갈린다. Typora처럼 렌더링된 문서 자체를 WYSIWYG로 쓰고 싶은 사용자, Obsidian처럼 노트 그래프와 플러그인 생태계를 기대하는 사용자, export 버튼 하나로 PDF/Word까지 뽑고 싶은 사용자에게는 부족하게 느껴질 수 있다.

반대로 “Markdown은 원문이 중요하고, 파일은 내 폴더와 Git에 두고, 편집기는 빠르고 조용하면 된다”는 사람에게는 이 제한이 장점이 된다.

## 어떤 사람에게 잘 맞나

MarkEdit은 다음 사용자에게 특히 잘 맞는다.

- macOS에서 README, changelog, 블로그 초안, 문서 Markdown을 자주 쓰는 사람
- TextEdit 수준의 단순함을 좋아하지만 Markdown 문법 하이라이트와 구조 탐색은 필요한 사람
- Markdown 원문 기호를 숨기는 WYSIWYG 방식보다 source-first 편집을 선호하는 사람
- Obsidian, VS Code, JetBrains IDE를 열기에는 과하고, 기본 텍스트 편집기는 부족하다고 느끼는 사람
- AppleScript, Shortcuts, Finder, Quick Look 같은 macOS 시스템 기능을 함께 쓰고 싶은 사람
- 큰 Markdown 파일을 빠르게 열고, 멀티 커서와 코드 폴딩 같은 코드 에디터식 기능도 가끔 필요한 사람

반대로 다음 경우에는 다른 도구가 더 맞을 수 있다.

- Windows/Linux에서도 같은 앱 경험이 필요하다.
- Markdown preview를 항상 나란히 보고 싶다.
- PDF/Word export를 앱 안에서 바로 처리하고 싶다.
- 플러그인 중심 지식관리/노트 그래프가 필요하다.
- macOS 15 미만 환경에서 최신 버전만 쓰고 싶다.

## 내 판단

MarkEdit은 “Markdown용 TextEdit”이라는 포지션을 잘 지킨다. 거창한 워크스페이스나 AI 글쓰기 플랫폼이라기보다, macOS에서 `.md` 파일을 열었을 때 가장 부담 없이 켜지는 작은 편집기에 가깝다.

특히 GitHub Flavored Markdown을 그대로 쓰는 개발자, 정적 블로그를 Markdown으로 관리하는 사람, README와 문서 초안을 자주 다듬는 사람에게 좋다. 원문 Markdown을 유지한 채 구조를 보기 좋게 보여주고, 통계·목차·완성·Writing Tools처럼 글쓰기 순간에 필요한 기능만 얹어두었기 때문이다.

다만 최신 라인이 macOS 15 이상이고, 앱 철학상 “모든 것을 내장”하지 않는다. 따라서 MarkEdit을 고를 때는 기능 목록의 길이보다 방향성이 맞는지를 먼저 보면 된다. 빠르고, 작고, 네이티브하고, Markdown 원문을 존중하는 macOS 편집기를 찾는다면 꽤 만족도가 높을 도구다.

## 참고한 공개 자료

- [MarkEdit-app/MarkEdit GitHub repository](https://github.com/MarkEdit-app/MarkEdit)
- [MarkEdit latest release](https://github.com/MarkEdit-app/MarkEdit/releases/latest)
- [MarkEdit README](https://github.com/MarkEdit-app/MarkEdit/blob/main/README.md)
- [MarkEdit Manual wiki](https://github.com/MarkEdit-app/MarkEdit/wiki/Manual)
- [Why MarkEdit wiki](https://github.com/MarkEdit-app/MarkEdit/wiki/Why-MarkEdit)
- [MarkEdit Philosophy wiki](https://github.com/MarkEdit-app/MarkEdit/wiki/Philosophy)
- [Homebrew Cask: markedit](https://formulae.brew.sh/cask/markedit)
