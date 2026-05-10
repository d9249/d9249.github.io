---
title: "Hermes WebUI는 Hermes Agent를 브라우저에서 다루는 self-hosted 관제면이다"
date: "2026-05-10T23:33:23"
description: "Hermes WebUI는 Hermes Agent의 대화, 세션, 작업공간 파일, 스킬, 메모리, 크론, 프로필을 브라우저와 모바일에서 다루게 해주는 Python·Vanilla JS 기반 self-hosted 웹 UI입니다."
author: "Sangmin Lee"
repository: "nesquena/hermes-webui"
sourceUrl: "https://github.com/nesquena/hermes-webui"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Web UI"
  - "Hermes Agent"
  - "Self-hosted"
  - "Developer Tools"
  - "Python"
highlights:
  - "Hermes Agent의 CLI 경험을 세션 목록, 채팅, 작업공간 파일 브라우저가 있는 3패널 웹 UI로 옮깁니다."
  - "브라우저에서 모델·프로필·워크스페이스를 바꾸고, 스킬·메모리·크론·Todo·Spaces 같은 Hermes 기능을 패널로 관리할 수 있습니다."
  - "기본은 127.0.0.1 바인딩과 SSH 터널 접근이며, 외부 네트워크에 열 때는 HERMES_WEBUI_PASSWORD나 Settings의 비밀번호 설정이 사실상 필수입니다."
  - "Linux/macOS/WSL2와 Docker를 중심으로 쓰는 도구이며, native Windows bootstrap은 아직 지원 대상이 아닙니다."
  - "2컨테이너 구성에서는 WebUI가 실행한 도구가 WebUI 컨테이너 안에서 돌아가므로 git/node 같은 개발 도구가 없을 수 있습니다."
draft: false
---

Hermes WebUI는 Hermes Agent를 터미널이 아니라 브라우저에서 쓰기 위한 self-hosted 웹 인터페이스다. 저장소 설명처럼 “web 또는 phone에서 Hermes Agent를 쓰는 방법”에 가깝고, 기존 Hermes 설정·모델·메모리·스킬을 별도 SaaS로 옮기지 않고 그대로 바라본다.

중요한 점은 WebUI가 별도의 AI 제품이 아니라 **Hermes Agent의 control surface**라는 것이다. 대화만 하는 화면이 아니라 세션, 작업공간 파일, 프로필, 스킬, 메모리, 크론 작업, Todo, Spaces까지 한 화면에서 다루도록 설계되어 있다. 조사 시점 기준 저장소는 MIT 라이선스의 Python 중심 오픈소스이며, 최신 GitHub Release는 `v0.51.34`다.

![Hermes WebUI three-panel layout](/images/tips/hermes-webui-hero.png)

## Hermes WebUI 개요

README가 강조하는 기본 레이아웃은 3패널이다.

- 왼쪽: 세션 목록, 검색, 프로젝트/태그 필터, 고정 세션, 하단 Control Center
- 가운데: Hermes Agent와 대화하는 채팅 영역
- 오른쪽: 작업공간 파일 브라우저와 미리보기
- 입력창 하단: 모델, 프로필, 워크스페이스, 첨부, 음성 입력, 전송 버튼

이 구조 덕분에 “질문을 던지는 웹챗”보다 “로컬/서버의 Hermes 작업장을 원격으로 조작하는 UI”에 가깝다. 예를 들어 채팅 중 파일을 열어보고, 같은 화면에서 모델을 바꾸고, 스킬 목록이나 메모리를 확인하고, 크론 작업을 실행하거나 일시정지하는 흐름을 만들 수 있다.

## 왜 유용한가

Hermes Agent를 이미 쓰는 사람에게 가장 큰 장점은 접근 표면이 넓어진다는 점이다. SSH로 서버에 들어가 TUI를 띄우지 않아도, 브라우저 또는 모바일 브라우저에서 같은 Agent 상태를 볼 수 있다. README는 CLI와 거의 1:1 parity를 목표로 한다고 설명한다.

기능 표면도 꽤 넓다.

- SSE 기반 스트리밍 응답과 네트워크 끊김 후 자동 재연결
- 모델 dropdown, 프로필 전환, 워크스페이스 전환
- 과거 사용자 메시지 수정 후 재생성, 마지막 응답 retry, 실행 중 작업 stop
- tool call card, subagent delegation card, reasoning/thinking card
- Mermaid diagram 렌더링, 코드 하이라이트, 코드블록 copy 버튼
- 파일 첨부와 Web Speech API 기반 음성 입력
- 세션 pin/archive/project/tag, Markdown transcript·JSON export/import
- Hermes CLI 세션을 sidebar로 가져오는 bridge
- Skills, Memory, Profiles, Tasks, Todos, Spaces 패널

특히 tool call card와 작업공간 패널은 Hermes의 “도구를 실행하는 에이전트” 성격을 잘 보여준다. 터미널 출력이나 파일 조작이 단순 텍스트로 묻히지 않고 접을 수 있는 카드와 파일 브라우저로 드러난다.

![Hermes WebUI tool cards and sessions](/images/tips/hermes-webui-sessions.png)

## 작업공간 파일 브라우저

오른쪽 Workspace 패널은 이 WebUI가 일반 챗 UI와 갈라지는 지점이다. 디렉터리 트리, breadcrumb, 파일 미리보기, 텍스트/코드/Markdown/image preview, 파일 생성·수정·삭제·이름 변경, binary download, git branch와 dirty count badge를 제공한다.

웹에서 Agent에게 “이 파일 열어봐”, “이 폴더 구조 설명해줘”라고 시키는 동시에 사람이 직접 파일 트리를 확인할 수 있으므로, 서버에 붙어 있는 원격 코딩/문서화 환경으로 쓰기 좋다. 다만 이 편의성은 곧 권한 문제이기도 하다. WebUI가 보는 workspace와 Hermes home에는 세션, 설정, 메모리, 자격증명 관련 파일이 있을 수 있으므로 노출 범위를 좁혀야 한다.

![Hermes WebUI workspace browser](/images/tips/hermes-webui-workspace.png)

## 설치와 첫 실행

소스 기반 quick start는 단순하다.

```bash
git clone https://github.com/nesquena/hermes-webui.git hermes-webui
cd hermes-webui
python3 bootstrap.py
```

기존 shell launcher도 유지된다.

```bash
./start.sh
```

self-hosted VM이나 homelab에서는 `ctl.sh`가 daemon lifecycle을 감싼다.

```bash
./ctl.sh start
./ctl.sh status
./ctl.sh logs --lines 100
./ctl.sh restart
./ctl.sh stop
```

bootstrap은 Hermes Agent를 찾고, 없으면 공식 installer 실행을 시도하며, WebUI 의존성을 위한 Python 환경을 찾거나 만들고, `/health`가 뜰 때까지 서버를 시작한 뒤 브라우저를 연다. 시스템 Python만으로 직접 `server.py`를 띄우면 `openai`, `httpx` 등 Hermes Agent 의존성이 빠질 수 있으므로 README는 Agent venv Python을 쓰라고 안내한다.

직접 실행 시 기본 포트는 `8787`이다.

```bash
curl http://127.0.0.1:8787/health
```

## Docker로 띄우기

Docker의 기본 추천 경로는 단일 컨테이너다. 이 구성은 WebUI와 Agent 실행이 같은 컨테이너 안에 있어 가장 단순하고, “도구가 어디에서 실행되는가”를 이해하기 쉽다.

```bash
git clone https://github.com/nesquena/hermes-webui
cd hermes-webui
cp .env.docker.example .env
# macOS라면 id -u / id -g 값에 맞게 UID, GID를 확인하는 것이 좋다.
docker compose up -d
# Open http://localhost:8787
```

compose 예시는 기본적으로 `127.0.0.1:8787:8787`에 바인딩한다. README는 포트를 외부 네트워크에 노출할 경우 `HERMES_WEBUI_PASSWORD`를 설정하라고 명확히 경고한다.

```bash
echo "HERMES_WEBUI_PASSWORD=change-me-to-something-strong" >> .env
docker compose up -d --force-recreate
```

두 컨테이너 또는 세 컨테이너 구성도 있다. Agent와 WebUI를 분리하거나 Dashboard까지 붙이고 싶을 때 쓰는 방식이다.

```bash
docker compose -f docker-compose.two-container.yml up -d
docker compose -f docker-compose.three-container.yml up -d
```

단, README가 적은 known limitation이 중요하다. 2컨테이너 구성에서 WebUI가 트리거한 도구는 Agent 컨테이너가 아니라 **WebUI 컨테이너 안에서 실행**된다. 따라서 `git`, `node` 같은 도구가 WebUI 이미지에 없으면 채팅에서 실행한 명령이 실패할 수 있다. 이 경우 단일 컨테이너를 쓰거나 WebUI Dockerfile을 확장해야 한다.

## 설정과 보안 포인트

주요 환경 변수는 다음 정도만 기억해도 된다.

- `HERMES_WEBUI_AGENT_DIR`: Hermes Agent source 위치
- `HERMES_WEBUI_PYTHON`: 사용할 Python executable
- `HERMES_WEBUI_HOST`: 기본 `127.0.0.1`
- `HERMES_WEBUI_PORT`: 기본 `8787`
- `HERMES_WEBUI_STATE_DIR`: 세션과 상태 저장 위치
- `HERMES_WEBUI_DEFAULT_WORKSPACE`: 기본 작업공간
- `HERMES_WEBUI_PASSWORD`: password authentication 활성화

기본 설계는 “localhost에 띄우고 SSH tunnel로 접근”이다.

```bash
ssh -N -L 8787:127.0.0.1:8787 user@your.server.com
```

그 다음 로컬 브라우저에서 `http://localhost:8787`을 열면 된다. WireGuard/Tailscale 같은 사설망 위에서 `0.0.0.0` 바인딩을 쓰는 선택지도 README에 나오지만, 이때도 password auth를 켜는 쪽이 안전하다.

WebUI의 auth는 선택 사항이고 기본은 꺼져 있다. 비밀번호를 설정하면 signed HMAC HTTP-only cookie, 24시간 TTL, `/login` 페이지, API endpoint 보호가 켜진다. 서버 코드도 non-loopback host에 password가 없으면 “누구나 파일시스템과 agent에 접근할 수 있다”는 경고를 출력한다.

![Hermes WebUI settings and password](/images/tips/hermes-webui-settings.png)

## 주의할 점

첫째, 이 UI는 Agent에게 일을 시키는 표면이다. 읽기 전용 dashboard가 아니라 terminal/file/browser 같은 Hermes 도구 실행과 연결될 수 있으므로, 공개 인터넷에 그대로 노출하면 안 된다. SSH 터널, VPN, reverse proxy auth, `HERMES_WEBUI_PASSWORD`, 방화벽을 함께 생각해야 한다.

둘째, native Windows bootstrap은 아직 지원 대상이 아니다. Windows 사용자는 WSL2를 기본 경로로 보는 편이 안전하다. Docker Desktop이나 WSL2에서 쓰면 플랫폼 범위는 넓어지지만, 실제 파일 권한과 경로 매핑은 별도로 확인해야 한다.

셋째, Docker bind mount 권한 문제가 자주 나올 수 있다. macOS는 UID가 보통 501부터 시작하므로 `.env.docker.example`의 `UID`, `GID`를 실제 `id -u`, `id -g` 값으로 맞추는 것이 좋다. 기존 `~/.hermes`를 mount할 때 `.env`, `auth.json` 같은 credential file mode를 WebUI가 0600으로 고치려다 충돌하는 경우에는 README와 Docker guide의 `HERMES_SKIP_CHMOD=1` 또는 `HERMES_HOME_MODE=0640` caveat를 확인해야 한다.

넷째, WebUI가 workspace 파일을 보여주는 만큼 workspace 선택이 중요하다. 홈 전체나 비밀이 많은 디렉터리를 기본 workspace로 열기보다, Agent 작업에 필요한 프로젝트 디렉터리를 좁혀서 mount하는 편이 낫다.

## 내 판단

Hermes Agent를 이미 서버나 개인 머신에 띄워 쓰고 있다면 Hermes WebUI는 “있으면 편한 옵션”이 아니라 거의 필수에 가까운 보조 관제면이다. 특히 모바일에서 상태를 확인하거나, 세션과 파일을 동시에 보거나, 크론/스킬/메모리를 눈으로 관리하고 싶은 경우 가치가 크다.

반대로 Hermes Agent 자체를 아직 쓰지 않는 사람에게는 WebUI만 먼저 설치할 이유가 크지 않다. 이 도구의 가치는 Hermes의 지속 메모리, 스킬, 도구 실행, Gateway, cron과 결합될 때 나온다. 따라서 추천 순서는 Hermes Agent를 먼저 안정적으로 구성하고, 그 다음 WebUI를 localhost/SSH tunnel 또는 Docker 단일 컨테이너로 붙여보는 것이다.

## 참고한 공개 자료

- [nesquena/hermes-webui GitHub repository](https://github.com/nesquena/hermes-webui)
- [Hermes WebUI README](https://github.com/nesquena/hermes-webui/blob/master/README.md)
- [Hermes WebUI Docker guide](https://github.com/nesquena/hermes-webui/blob/master/docs/docker.md)
- [Hermes WebUI latest release](https://github.com/nesquena/hermes-webui/releases/tag/v0.51.34)
- [Hermes Agent documentation](https://hermes-agent.nousresearch.com/)
