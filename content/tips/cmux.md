---
title: "cmux는 여러 AI 코딩 에이전트를 세로 탭과 알림으로 굴리는 macOS 터미널이다"
date: "2026-05-28T14:31:16"
description: "manaflow-ai/cmux는 Ghostty 렌더링 위에 세로 탭, 분할 패널, 알림 링, 내장 브라우저, CLI/소켓 자동화를 얹은 macOS용 AI 코딩 에이전트 터미널이다."
author: "Sangmin Lee"
repository: "manaflow-ai/cmux"
sourceUrl: "https://github.com/manaflow-ai/cmux"
status: "Open source"
license: "GPL-3.0-or-later / commercial"
platforms:
  - "macos-linux"
tags:
  - "AI Agents"
  - "Developer Tools"
  - "Terminal"
  - "macOS"
  - "Automation"
highlights:
  - "Claude Code, Codex, OpenCode 같은 CLI 에이전트를 여러 분할/워크스페이스로 띄워두고 알림이 온 패널로 바로 이동한다."
  - "Swift/AppKit 기반의 macOS 전용 앱이며 Ghostty 설정과 렌더링을 활용한다."
  - "내장 브라우저, SSH 워크스페이스, CLI/Unix socket API로 에이전트가 개발 서버와 터미널을 함께 다룰 수 있다."
  - "브라우저 세션 가져오기, 프로젝트 cmux.json, 에이전트 hook/restore, SSH 권한은 보안 경계를 확인하고 켜야 한다."
draft: false
---

`manaflow-ai/cmux`는 tmux 대체제라기보다 **AI 코딩 에이전트를 많이 띄우는 macOS 터미널**에 가깝다. Claude Code, Codex, OpenCode, Gemini CLI처럼 터미널에서 돌아가는 도구를 한꺼번에 돌리다 보면 “어느 에이전트가 멈춰서 내 입력을 기다리는지”를 놓치기 쉽다. cmux는 그 문제를 세로 탭, 패널별 알림 링, 알림 패널, 분할 브라우저, CLI/소켓 API로 풀려고 한다.

README 기준으로 앱은 Swift/AppKit 네이티브 macOS 앱이고, 터미널 렌더링은 `libghostty`를 사용한다. 그래서 기존 `~/.config/ghostty/config`의 테마, 폰트, 색상을 읽으면서도 Electron/Tauri 기반 오케스트레이터처럼 별도 GUI 워크플로에 갇히지 않는 쪽을 지향한다.

![cmux 메인 화면](/images/tips/cmux-main.webp)

## 무엇을 해주는가

cmux의 기본 단위는 워크스페이스, surface, split pane이다. 왼쪽 사이드바는 각 워크스페이스의 git 브랜치, PR 상태/번호, 작업 디렉터리, 열려 있는 포트, 마지막 알림 텍스트를 보여준다. 에이전트가 OSC 9/99/777 터미널 알림이나 `cmux notify`를 보내면 해당 패널에 파란 링이 생기고, 사이드바 탭이 읽지 않은 상태로 표시된다. `Cmd+Shift+U`로 가장 최근 unread 알림으로 점프할 수 있다는 점이 “여러 에이전트 병렬 실행”과 잘 맞는다.

내장 브라우저도 중요한 차이다. README는 cmux 브라우저가 `agent-browser`에서 이식한 scriptable API를 갖고 있으며, 접근성 트리 스냅샷, 요소 참조, 클릭, 폼 입력, JavaScript 평가를 CLI에서 다룰 수 있다고 설명한다. 즉 터미널 옆에 브라우저를 분할해 두고, 에이전트가 로컬 개발 서버를 직접 확인하는 흐름을 만들 수 있다.

## 설치와 첫 설정

공식 설치 경로는 GitHub Releases의 macOS DMG와 Homebrew cask다. 최신 stable release로 확인한 항목은 `v0.64.10`이며, release asset에는 `cmux-macos.dmg`, Sparkle `appcast.xml`, 원격 SSH용 `cmuxd-remote` 바이너리들이 포함되어 있다.

```bash
brew tap manaflow-ai/cmux
brew install --cask cmux
```

업데이트는 다음처럼 한다.

```bash
brew upgrade --cask cmux
```

DMG로 설치하면 `.dmg`를 열고 cmux를 Applications 폴더로 옮기는 방식이다. 공식 문서 기준으로 cmux는 Sparkle 자동 업데이트를 사용하고, 첫 실행 때 macOS가 확인된 개발자의 앱 열기 확인을 요구할 수 있다. 요구 사항은 macOS 14.0 이상, Apple Silicon 또는 Intel Mac이다. 이 사이트의 분류상 `macos-linux` 버킷에 넣었지만, 실제 GUI 앱은 현재 macOS 전용으로 봐야 한다.

cmux 안의 터미널에서는 CLI가 자동으로 동작한다. 앱 바깥의 셸에서도 쓰고 싶다면 공식 문서는 다음 symlink를 안내한다.

```bash
sudo ln -sf "/Applications/cmux.app/Contents/Resources/bin/cmux" /usr/local/bin/cmux
```

그 다음에는 워크스페이스 목록 확인이나 알림 전송 같은 명령을 쓸 수 있다.

```bash
cmux list-workspaces
cmux notify --title "Build Complete" --body "Your build finished"
```

## AI 코딩 에이전트와 맞물리는 지점

cmux는 특정 에이전트를 대체하지 않는다. 터미널에서 돌아가는 CLI 에이전트를 더 잘 배치하고, 알림과 복구 정보를 모으는 “작업대”에 가깝다.

공식 README와 docs가 강조하는 흐름은 네 가지다.

1. **알림 수집**  
   Claude Code, OpenCode 등의 hook에서 `cmux notify`를 호출하거나, 터미널 escape sequence를 보내면 cmux가 패널/워크스페이스별 unread 상태를 관리한다.

2. **세션 restore hook**  
   `cmux hooks setup`은 PATH에 있는 지원 에이전트를 찾아 resume 통합을 설치한다. 공식 문서의 지원 목록에는 Claude Code, Codex, Grok, OpenCode, Pi, Amp, Cursor CLI, Gemini, Rovo Dev, Copilot, CodeBuddy, Factory, Qoder 등이 포함된다.

   ```bash
   cmux hooks setup
   cmux hooks setup codex
   cmux hooks setup --agent opencode
   ```

3. **Claude Code Teams / tmux shim**  
   `cmux claude-teams`는 Claude Code의 teammate mode를 켜고, Claude가 tmux 안에 있다고 믿도록 shim을 만든다. Claude가 `split-window`, `send-keys`, `capture-pane` 같은 tmux 명령을 호출하면 shim이 cmux socket API 호출로 바꿔 native split을 만든다.

   ```bash
   cmux claude-teams
   cmux claude-teams --continue
   cmux claude-teams --model sonnet
   ```

4. **OpenCode/OMX/OMC류 orchestrator의 split 변환**  
   공식 docs에는 `cmux omo`, `cmux omx`, `cmux omc` 같은 통합도 보인다. 공통 패턴은 tmux 기반 멀티 에이전트 팬아웃을 cmux native split으로 바꾸고, 메인 세션은 primary pane에 남겨두는 것이다.

![cmux Claude Code Teams split](/images/tips/cmux-claude-teams.webp)

## 브라우저와 SSH가 주는 활용 포인트

내장 브라우저는 “에이전트에게 실제 UI를 보게 하는” 쪽에 유용하다. 문서의 `cmux browser` 명령군은 navigation, wait, DOM interaction, snapshot/screenshot, JavaScript eval, cookies/storage/state, tab/console/error 조작을 제공한다. 예를 들어 공식 예시는 이런 식이다.

```bash
cmux browser open https://example.com
cmux browser surface:2 snapshot --interactive --compact
cmux browser surface:2 click "button[type='submit']" --snapshot-after
```

SSH도 단순 터미널 접속을 넘어선다. README의 `cmux ssh user@remote`는 원격 머신용 워크스페이스를 만들고, 브라우저 패널의 HTTP/WebSocket 트래픽을 원격 네트워크로 라우팅한다. 그래서 원격 박스에서 뜬 `localhost:3000` 개발 서버를 cmux 브라우저에서 바로 볼 수 있다. 원격 세션으로 파일을 드래그하면 기존 SSH 연결을 통해 `scp` 업로드도 처리한다.

```bash
cmux ssh user@remote
```

공식 SSH 문서는 첫 연결 때 원격 호스트의 OS/아키텍처를 확인해 `~/.cmux/bin/cmuxd-remote/<version>/<os>-<arch>/cmuxd-remote`에 relay daemon을 올리고, manifest hash로 검증한다고 설명한다. 원격 브라우저 proxy, remote CLI relay, session reconnect를 이 daemon이 담당한다.

## 프로젝트별 자동화는 cmux.json으로 묶는다

cmux는 `.cmux/cmux.json` 또는 `~/.config/cmux/cmux.json`을 읽어 프로젝트/전역 command와 action을 정의한다. 예를 들어 특정 repo에서 “Codex worktree 열기”, “테스트 실행”, “브라우저 split 열기” 같은 동작을 command palette나 surface tab bar에 붙일 수 있다.

여기서 중요한 안전장치도 문서에 적혀 있다. 프로젝트 로컬 action은 command palette와 tab bar에 나타나지만, 첫 실행 때 trust prompt가 뜬다. 신뢰는 repo 전체가 아니라 action fingerprint 단위다. 또한 notification hook도 전역/프로젝트 config에서 상속될 수 있고, shell command를 실행할 수 있으므로 `.cmux/cmux.json`은 코드처럼 리뷰해야 한다.

## 주의할 점

- **macOS 전용 앱이다.** 릴리스에는 원격 relay용 Linux/macOS 바이너리가 보이지만, 사용자가 직접 쓰는 GUI 터미널 앱은 Swift/AppKit 기반 macOS 앱이다. Linux/Windows 터미널 대체제로 오해하면 안 된다.
- **브라우저 세션 import는 사실상 credential import다.** README는 Chrome, Firefox, Arc 등 20개 이상 브라우저에서 cookies/history/session을 가져올 수 있다고 설명한다. 로그인된 개발 서버 테스트에는 편하지만, 회사 SSO·관리자 콘솔·개인 계정 쿠키를 어느 워크스페이스에 넣는지 명확히 분리하는 편이 안전하다.
- **브라우저 automation과 socket API는 권한 경계다.** 공식 API 문서에는 socket access mode가 `Off`, `cmux processes only`, `allowAll`로 나뉜다. 공유 머신에서는 `Off`나 기본값인 `cmux processes only`를 유지하고, `allowAll`은 로컬 프로세스가 cmux를 조작할 수 있다는 뜻으로 봐야 한다.
- **SSH는 원격 파일/네트워크/키 정책을 같이 건드린다.** `cmux ssh`는 `~/.ssh/config`의 host alias, identity file, proxy 설정을 읽고, remote daemon과 scp 업로드, 원격 localhost 브라우징을 제공한다. 어느 호스트에 어떤 key와 workspace 권한을 주는지 확인해야 한다.
- **에이전트 세션에는 비밀이 섞인다.** cmux 문서는 resume binding 저장 전에 tokens/passwords/secrets/API keys 같은 민감한 환경 키를 버린다고 설명하지만, 터미널 scrollback, 브라우저 쿠키, agent prompt/output, 프로젝트 경로 자체가 민감할 수 있다. 화면 공유나 스크린샷 업로드 전에 워크스페이스 내용을 확인하자.
- **라이선스는 GPL-3.0-or-later + 상용 라이선스다.** 공개 소스는 GPL-3.0-or-later이고, GPL을 따르기 어려운 조직에는 commercial license 문의 경로가 적혀 있다. 사내 배포/수정본 배포 계획이 있으면 법무 검토가 필요하다.

## 내 판단

AI 코딩 에이전트를 하나만 가끔 쓰는 사람에게는 Ghostty, iTerm2, tmux 조합이 더 단순할 수 있다. 하지만 Claude Code, Codex, OpenCode, Gemini CLI를 여러 repo나 worktree에서 병렬로 돌리고, “어느 패널이 나를 기다리는지”를 놓치는 일이 잦다면 cmux의 세로 탭/알림/브라우저 split은 꽤 직접적인 해결책이다.

특히 좋은 점은 cmux가 “정답 워크플로”를 강요하기보다 terminal, browser, workspace, split, notification, CLI/socket API라는 primitive를 제공한다는 점이다. 반대로 그 primitive가 강력한 만큼, 브라우저 세션 import와 project config, SSH relay, agent resume hook은 처음부터 작은 테스트 repo에서 범위를 확인하고 켜는 쪽을 추천한다.

## 참고한 공개 자료

- [manaflow-ai/cmux GitHub repository](https://github.com/manaflow-ai/cmux)
- [cmux official docs](https://cmux.com/docs/getting-started)
- [cmux v0.64.10 release](https://github.com/manaflow-ai/cmux/releases/tag/v0.64.10)
- [cmux browser automation docs](https://cmux.com/docs/browser-automation)
- [cmux API docs](https://cmux.com/docs/api)
- [cmux SSH docs](https://cmux.com/docs/ssh)
- [cmux session restore docs](https://cmux.com/docs/session-restore)
