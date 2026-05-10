---
title: "showmd는 Finder 스페이스바에 Markdown 렌더링을 붙이는 macOS Quick Look 확장이다"
date: "2026-05-10T22:47:09"
description: "showmd는 macOS Finder Quick Look에서 `.md` 파일을 GitHub Flavored Markdown, YAML frontmatter, 코드 하이라이트, KaTeX, Mermaid, AI XML 태그까지 읽기 좋게 렌더링하는 네이티브 Markdown 미리보기 확장이다."
author: "Sangmin Lee"
repository: "johannesnagl/showmd"
sourceUrl: "https://github.com/johannesnagl/showmd"
status: "Source available macOS app"
license: "Unknown"
platforms:
  - "macos-linux"
tags:
  - "macOS"
  - "Markdown"
  - "Quick Look"
  - "Developer Tools"
  - "Swift"
  - "Productivity"
highlights:
  - "Finder에서 Markdown 파일을 선택하고 Space를 누르면 원문 텍스트 대신 렌더링된 Quick Look 미리보기를 보여준다."
  - "GFM, YAML frontmatter, 코드 하이라이트, KaTeX 수식, Mermaid 다이어그램, GitHub alert, AI agent용 XML 태그까지 지원한다."
  - "공식 웹사이트 기준 Homebrew tap cask와 GitHub Releases의 DMG/ZIP로 배포되며 최신 릴리스는 v1.0.1이다."
  - "앱을 한 번 열고 macOS System Settings의 Quick Look 확장을 활성화해야 실제 Finder 미리보기에 적용된다."
  - "README와 웹사이트는 MIT를 말하지만 저장소에 LICENSE 파일이 없으므로 재배포·상업적 도입 전 라이선스 확인이 필요하다."
draft: false
---

macOS Finder에서 `.md` 파일을 스페이스바로 미리 보면 기본 Quick Look은 Markdown을 거의 원문 텍스트처럼 보여준다. `#`, `-`, 백틱, frontmatter, Mermaid 코드 블록이 그대로 노출되기 때문에 README나 에이전트 설정 파일을 빠르게 훑기에는 불편하다.

`showmd`는 이 틈을 노린 macOS용 Quick Look Preview Extension이다. Finder에서 Markdown 파일을 선택하고 Space를 누르면 별도 편집기를 열지 않아도 GitHub Flavored Markdown에 가까운 렌더링 화면을 보여준다. 저장소는 Swift 중심이고, 호스트 앱은 설정 창을 담당하며 실제 미리보기는 `ShowMdExtension`이 처리한다.

작성 시점 기준 최신 GitHub Release는 `v1.0.1`이고, 배포 파일은 DMG와 ZIP이 함께 올라와 있다. 공식 웹사이트는 “free, native macOS Quick Look extension”, “no account, no cloud”를 핵심 메시지로 내세운다.

![showmd official hero image](/images/tips/showmd-hero.png)

## showmd 개요

showmd의 포지션은 Markdown 편집기가 아니라 “Finder용 Markdown 보기 레이어”다. README, CHANGELOG, AGENTS.md, CLAUDE.md, `.cursorrules`, 블로그 초안, Quarto/R Markdown 문서처럼 Markdown 파일을 자주 열어보는 사람에게 맞다.

특히 AI 코딩 도구를 많이 쓰는 개발자라면 작은 장점이 있다. 요즘 저장소에는 에이전트 지침, 프롬프트 예시, XML 태그가 들어간 Markdown이 많다. showmd는 `<example>`, `<instructions>`, `<thinking>`, `<context>` 같은 agentic AI XML 태그를 라벨이 붙은 블록으로 렌더링한다고 설명한다. 단순한 Markdown previewer보다 “AI가 남긴 Markdown 문서”를 염두에 둔 셈이다.

내부 구조는 단순하다.

- `ShowMd`: SwiftUI 기반 호스트 앱과 설정 창
- `ShowMdExtension`: macOS Quick Look preview extension
- `MarkdownRenderer`: Markdown → HTML 변환, 템플릿, 후처리, escape, frontmatter parser, bundled JS/CSS 리소스를 담은 Swift package
- `docs`: 공식 웹사이트와 Open Graph 이미지

## 설치와 활성화 흐름

공식 웹사이트의 설치 블록과 Homebrew tap 기준으로는 다음 명령을 쓰는 편이 가장 명확하다.

```bash
brew install --cask johannesnagl/tap/showmd
```

README에는 더 짧게 다음 명령도 적혀 있다.

```bash
brew install --cask showmd
```

다만 별도 `johannesnagl/homebrew-tap` 저장소의 cask가 실제 배포 메타데이터를 담고 있으므로, 처음 설치할 때는 tap을 명시한 명령이 덜 애매하다. Homebrew를 쓰지 않는다면 GitHub Releases에서 `showmd-1.0.1.dmg` 또는 ZIP을 받을 수 있다.

설치 후에는 한 번 더 macOS 쪽 설정이 필요하다.

1. `showmd` 앱을 한 번 연다.
2. `System Settings → Privacy & Security → Extensions → Quick Look`으로 간다.
3. showmd Quick Look 확장을 켠다.
4. 이후 Finder에서 Markdown 파일을 선택하고 Space를 누른다.

첫 실행 때 macOS가 “access data from other apps” 권한을 묻는다고 README가 안내한다. 이는 호스트 앱과 Quick Look 확장이 테마, 글꼴 크기 같은 설정을 App Groups로 공유하기 위한 흐름이라고 설명되어 있다.

## 무엇을 잘 렌더링하나

showmd가 내세우는 기능은 꽤 실용적이다.

- GitHub Flavored Markdown: table, task list, strikethrough, fenced code block
- syntax highlighting: highlight.js 기반 190개 이상 언어, 오프라인 번들
- 수식: KaTeX 기반 inline/block LaTeX
- Mermaid diagram: 설정에서 켤 수 있는 다이어그램 렌더링
- YAML frontmatter: 접을 수 있는 metadata table로 표시
- GitHub-style alerts: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`
- rendered/source toggle: 렌더링 화면과 원문 Markdown 전환
- Copy as HTML: 렌더링 결과를 HTML로 복사
- emoji shortcode, footnote, highlight, superscript/subscript, smart quote
- 여러 확장자: `.md`, `.markdown`, `.mdx`, `.mdc`, `.rmd`, `.qmd`, `.mdown`, `.mkd`, `.mkdn`, `.mdtext`, `.mdtxt`

여기서 가장 차별적인 부분은 frontmatter와 AI XML 태그다. 일반 Markdown previewer도 GFM이나 코드 하이라이트는 지원하지만, 블로그 글·정적 사이트·AI agent 지침 파일에 자주 붙는 YAML frontmatter를 접이식 표로 보여주는 기능은 실제 파일 탐색 흐름에서 꽤 편하다.

## 어떤 상황에 맞나

showmd는 “Markdown을 편집할 앱”을 찾을 때보다 “Finder에서 Markdown 파일을 빨리 확인할 방법”을 찾을 때 유용하다.

잘 맞는 경우는 다음이다.

- 저장소 안의 README, CHANGELOG, docs 파일을 Finder에서 자주 훑는다.
- Obsidian, VS Code, MarkEdit 같은 앱을 열기 전 내용만 빠르게 확인하고 싶다.
- Markdown 문서에 YAML frontmatter가 많다.
- AI coding agent가 만든 `AGENTS.md`, `CLAUDE.md`, `.cursorrules` 같은 파일을 자주 본다.
- Mermaid, 수식, 코드 블록이 섞인 문서를 Quick Look에서 바로 읽고 싶다.

반대로 Markdown을 직접 쓰고 고치는 시간이 길다면 showmd만으로는 부족하다. showmd는 viewer에 가깝고, 공식 FAQ도 editor가 아니며 read-only로 파일을 보여주는 도구라고 설명한다. 편집은 MarkEdit, VS Code, Obsidian, Typora 같은 앱과 조합하는 편이 맞다.

## 주의할 점

첫째, macOS 전용 도구로 봐야 한다. tips 사이트의 현재 분류상 `macos-linux` bucket에 넣었지만 실제로는 Linux CLI나 Windows 앱이 아니다. macOS Finder의 Quick Look Extension이라는 시스템 기능에 붙는 앱이다.

둘째, 요구 macOS 버전 표기가 소스와 배포면에서 완전히 한 줄로 정리되어 있지는 않다. 공식 웹사이트의 structured data에는 `macOS 13+`가 보이고, 별도 Homebrew tap cask는 `>= :sequoia`를 요구하며, `project.yml`과 CONTRIBUTING 문서는 `macOS 26.0` target을 가리킨다. 최신 Mac에서는 문제가 적겠지만, 오래된 macOS에서 설치하려면 Releases와 tap metadata를 먼저 확인하는 편이 좋다.

셋째, 라이선스는 확인이 필요하다. README와 웹사이트는 MIT를 말하지만 GitHub API 기준 저장소 라이선스가 감지되지 않았고, 루트에 `LICENSE` 파일도 없었다. 개인 사용이나 테스트에는 큰 문제가 아닐 수 있지만, 회사 배포·패키징·상업적 재배포 관점에서는 저장소에 명시 라이선스 파일이 추가되는지 확인해야 한다.

넷째, Quick Look 확장은 파일 내용을 읽어서 렌더링하는 도구다. 공식 설명은 모든 JS/CSS 의존성을 번들하고, no cloud/no telemetry를 강조한다. 그래도 민감한 Markdown을 다룰 때는 “Finder 미리보기 확장이 해당 파일 내용을 읽는다”는 권한 모델 자체는 이해하고 쓰는 편이 좋다.

## 내 판단

showmd는 macOS에서 Markdown을 많이 만지는 사람에게 “작지만 체감이 큰” 도구다. 파일을 열기 전 Finder에서 Space 한 번으로 README, agent 지침, 블로그 초안, frontmatter가 붙은 문서를 렌더링해 볼 수 있다는 점만으로도 충분히 쓸 이유가 있다.

특히 MarkEdit 같은 Markdown 편집기와 역할이 겹치지 않는 점이 좋다. MarkEdit은 쓰기 경험을 개선하고, showmd는 파일 탐색과 빠른 읽기를 개선한다. 개발자 폴더에 Markdown이 많고 기본 Quick Look의 원문 텍스트 미리보기가 답답했다면 `brew install --cask johannesnagl/tap/showmd` 후 한 번 켜볼 만하다.

다만 아직 저장소 규모와 릴리스 이력이 작은 초기 프로젝트이고, LICENSE 파일 부재와 macOS 요구사항 표기 차이는 확인 포인트다. 개인 Mac에서 쓰는 빠른 previewer로는 매력적이지만, 조직 표준 도구로 배포하려면 버전 요구사항과 라이선스 정리를 먼저 보는 것이 안전하다.

## 참고한 공개 자료

- [johannesnagl/showmd GitHub repository](https://github.com/johannesnagl/showmd)
- [showmd official website](https://showmd.yetanother.one)
- [showmd README](https://github.com/johannesnagl/showmd/blob/main/README.md)
- [showmd v1.0.1 release](https://github.com/johannesnagl/showmd/releases/tag/v1.0.1)
- [johannesnagl/homebrew-tap showmd cask](https://github.com/johannesnagl/homebrew-tap/blob/main/Casks/showmd.rb)
- [showmd project.yml](https://github.com/johannesnagl/showmd/blob/main/project.yml)
- [ShowMdExtension Info.plist](https://github.com/johannesnagl/showmd/blob/main/ShowMdExtension/Info.plist)
