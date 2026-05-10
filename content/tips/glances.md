---
title: "Glances는 터미널·웹·API로 시스템 상태를 한눈에 보여준다"
date: "2026-05-10T19:52:46"
description: "Glances는 CPU, 메모리, 디스크, 네트워크, 센서, 컨테이너, 프로세스 상태를 TUI, Web UI, REST API, stdout/CSV/JSON, MCP 서버로 보여주는 cross-platform 오픈소스 시스템 모니터링 도구입니다."
author: "Sangmin Lee"
repository: "nicolargo/glances"
sourceUrl: "https://github.com/nicolargo/glances"
status: "Open source stable"
license: "LGPL-3.0-only"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "CLI"
  - "Monitoring"
  - "System"
  - "Web UI"
  - "Docker"
  - "REST API"
  - "MCP"
  - "Python"
highlights:
  - "top/htop처럼 터미널에서 바로 실행하지만 CPU, 메모리, 디스크, 네트워크, 센서, 컨테이너, 프로세스를 한 화면에 모아 보여줍니다."
  - "`glances -w`로 Web UI와 REST API를 열 수 있고, `--stdout`, `--stdout-csv`, `--stdout-json`으로 스크립트 출력도 받을 수 있습니다."
  - "PyPI, uvx, pipx, Homebrew, Docker, Linux 패키지, Windows Python 환경까지 설치 경로가 넓습니다."
  - "Glances 4.5.1 이상은 MCP 서버를 제공해 Claude, Cursor, Copilot 같은 AI 도구가 실시간 시스템 메트릭을 읽게 할 수 있습니다."
  - "Web/API/MCP 모드는 기본 노출 범위와 인증 설정이 중요하므로 외부망에서는 `--password`, `--bind`, reverse proxy, allowed hosts 설정을 확인해야 합니다."
draft: false
---

Glances는 `top`이나 `htop`처럼 터미널에서 시스템 상태를 보는 도구지만, 범위는 훨씬 넓다. CPU와 메모리뿐 아니라 디스크 I/O, 파일시스템, 네트워크, 센서, 배터리, GPU/NPU, 컨테이너, 프로세스, 경고 이벤트까지 한 화면에 모아 보여준다.

더 흥미로운 점은 같은 데이터를 여러 표면으로 꺼낼 수 있다는 것이다. 로컬 TUI로 볼 수도 있고, `glances -w`로 Web UI와 REST API를 열 수도 있고, stdout/CSV/JSON 출력으로 스크립트에 붙일 수도 있다. 최신 4.x 라인에서는 MCP 서버까지 제공해 AI assistant가 현재 시스템 상태를 직접 질의하는 흐름도 가능해졌다.

저장소 기준 Glances는 Python으로 작성된 오래된 오픈소스 프로젝트이며, 최신 릴리스는 `v4.5.4`다. PyPI 메타데이터는 Python `>=3.10`을 요구하고, 라이선스는 `LGPL-3.0-only`로 표시된다. 공식 README도 LGPL v3 배포라고 설명한다.

![Glances TUI](/images/tips/glances-tui.png)

## Glances 개요

Glances의 기본 사용법은 아주 단순하다.

```bash
glances
```

이 한 줄로 CPU, memory, swap, load, network, disk I/O, filesystem, sensors, containers, process list 같은 주요 지표를 한 화면에서 볼 수 있다. 터미널 기반이라 SSH로 접속한 서버에서도 바로 쓸 수 있고, 로컬 개발 머신의 이상 상태를 빠르게 훑는 데도 좋다.

일반적인 `top`류 도구와 비교하면 Glances는 “프로세스 목록”보다 “시스템 전체 상태판”에 가깝다. 예를 들어 메모리와 스왑이 임계치에 가까워지면 하단 alert로 보여주고, Docker/Podman/LXC/LXD 같은 컨테이너 정보도 옵션 의존성을 설치하면 같은 화면에 올라온다.

공식 문서는 Glances가 다음 모드를 제공한다고 정리한다.

- Standalone: 로컬 머신을 TUI로 모니터링한다.
- Client/Server: 한 머신에서 `glances -s`, 다른 머신에서 `glances -c <host>`로 원격 모니터링한다.
- Web server: `glances -w`로 Web UI와 REST API를 연다.
- Browser: 여러 Glances 서버를 중앙 목록으로 탐색한다.
- Fetch: `glances --fetch`로 시스템 요약을 한 번에 출력한다.

## 설치와 첫 실행

가장 표준적인 설치 경로는 PyPI다. 공식 README는 가상환경을 만든 뒤 설치하는 예를 든다.

```bash
python3 -m venv ~/.venv
source ~/.venv/bin/activate
pip install glances
```

Web UI까지 쓰려면 web extra를 설치한다.

```bash
pip install 'glances[web]'
```

전체 기능을 한 번에 설치하려면 all extra를 쓸 수 있다.

```bash
pip install 'glances[all]'
```

요즘 Python CLI를 임시 실행하는 방식이 익숙하다면 `uvx`도 간단하다.

```bash
uvx glances
```

격리된 CLI로 설치하고 싶다면 `pipx`가 편하다.

```bash
pipx install 'glances[all]'
```

macOS와 Linux에서는 Homebrew formula도 제공된다.

```bash
brew install glances
```

컨테이너로 서버 상태와 컨테이너 상태를 같이 보고 싶다면 Docker 이미지도 있다. README 기준 console mode 예시는 다음처럼 host PID/network와 Docker/Podman socket을 연결한다.

```bash
docker run --rm \
  -e TZ="${TZ}" \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --pid host --network host \
  -it nicolargo/glances:latest-full
```

Web UI로 띄우는 컨테이너 예시는 다음에 가깝다.

```bash
docker run -d --restart="always" \
  -p 61208-61209:61208-61209 \
  -e GLANCES_OPT="-w" \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --pid host \
  nicolargo/glances:latest-full
```

Windows는 Python for Windows와 pip 설치 절차를 따른다. `pyproject.toml`에는 `windows-curses`가 Windows 전용 의존성으로 잡혀 있고, PyPI classifier는 `Operating System :: OS Independent`를 사용한다.

## Web UI와 REST API

![Glances Web UI](/images/tips/glances-web.png)

Glances를 웹 대시보드처럼 쓰려면 web server mode를 실행한다.

```bash
glances -w
```

그 다음 브라우저에서 다음 주소로 접속한다.

```text
http://<server-ip>:61208
```

Web UI는 TUI와 비슷한 정보를 브라우저에서 보여준다. 서버에 직접 SSH로 붙지 않아도 CPU, 메모리, 스왑, 네트워크, 디스크, 센서, 컨테이너, 프로세스 목록을 볼 수 있으므로 홈서버나 내부 개발 서버 상태판으로 쓰기 좋다.

`-w` 모드에서는 REST/JSON API도 함께 열린다. 기본 API root는 다음이다.

```text
http://localhost:61208/api/4
```

예를 들어 CPU 정보만 JSON으로 가져오거나, 별도 대시보드가 Glances API를 읽는 식의 구성이 가능하다. 문서에 따르면 API 문서는 서버 안의 `/docs#/`에서도 볼 수 있고, OpenAPI specification도 제공된다.

스크립트에서 웹 서버 없이 한 줄 출력만 필요하면 stdout 계열 옵션이 더 가볍다.

```bash
glances --stdout cpu.user,mem.used,load
glances --stdout-csv now,cpu.user,mem.used,load
glances --stdout-json cpu,mem
```

이 조합은 cron, shell script, 간단한 health check, 로그 수집에 붙이기 좋다.

## Fetch 모드와 빠른 상태 공유

![Glances fetch mode](/images/tips/glances-fetch.png)

`glances --fetch`는 `neofetch`나 `fastfetch`처럼 시스템 요약을 보기 좋게 출력하되, 현재 CPU/메모리/디스크/네트워크 사용량과 상위 프로세스까지 함께 보여준다.

```bash
glances --fetch
```

SSH 접속 직후 “이 서버가 대략 어떤 상태인가?”를 빠르게 확인하거나, 장애 상황에서 동료에게 현재 상태 요약을 공유할 때 유용하다. 전체 TUI를 오래 띄워둘 필요가 없고, 한 번 실행해 현재 상태만 확인하면 되는 상황에 잘 맞는다.

## 컨테이너, export, MCP까지 이어지는 확장성

Glances는 단순한 TUI 앱에 그치지 않고 plugin/export 구조를 갖는다. README와 `pyproject.toml` 기준 optional extra가 꽤 많다.

- `containers`: Docker, Podman, LXC/LXD 컨테이너 모니터링
- `gpu`: NVIDIA GPU 계열 메트릭
- `sensors`: 배터리/센서류 일부 Linux 의존성
- `smart`, `raid`, `wifi`, `snmp`: 하드웨어·네트워크 확장
- `export`: InfluxDB, Elasticsearch, PostgreSQL/TimeScale, ClickHouse, Prometheus, Kafka, MQTT, NATS, Graphite 등 외부 저장소/브로커로 export
- `web`: FastAPI/Uvicorn 기반 Web UI와 API
- `mcp`: AI assistant 연동용 MCP 서버

특히 MCP 서버는 Glances 4.5.1 이상에서 README에 명시된 기능이다. `glances[mcp]` extra를 설치한 뒤 Web server mode에 `--enable-mcp`를 붙인다.

```bash
pip install 'glances[mcp]'
glances -w --enable-mcp
```

기본 SSE endpoint는 다음이다.

```text
http://localhost:61208/mcp/sse
```

문서에 따르면 MCP resources는 `glances://plugins`, `glances://stats`, `glances://limits`, `glances://stats/{plugin}` 같은 읽기 전용 데이터를 제공하고, `system_health_summary`, `alert_analysis`, `top_processes_report`, `storage_health` 같은 prompt도 제공한다.

즉 Claude Desktop, Cursor, VS Code Copilot 같은 MCP-compatible client가 Glances를 통해 현재 머신의 CPU, 메모리, 디스크, 네트워크, alert를 읽고 “무엇이 병목인지” 분석하는 구성을 만들 수 있다. 다만 이건 시스템 메트릭과 프로세스 command line을 외부 도구가 읽는 구조이므로, 로컬에서만 조심스럽게 쓰거나 인증·네트워크 범위를 강하게 제한하는 편이 좋다.

## 보안과 운영 주의점

Glances를 로컬 TUI로만 쓰면 위험면은 작다. 하지만 `-w` Web/API/MCP 모드를 켜는 순간 이야기가 달라진다. 공식 REST API 문서는 기본 Web server가 인증 없이 실행되고, 기본 bind가 `0.0.0.0`이라고 설명한다. 네트워크에서 접근 가능한 누구나 프로세스 command line 같은 민감한 시스템 정보를 볼 수 있다는 뜻이다.

따라서 외부망이나 신뢰하지 않는 네트워크에서는 최소한 다음을 확인해야 한다.

```bash
# 인증 켜기
glances -w --password

# 원격 접근이 필요 없으면 localhost에만 bind
glances -w --bind 127.0.0.1
```

반공개/공개 배포라면 Glances를 직접 인터넷에 노출하기보다 nginx, Caddy, Apache 같은 reverse proxy 뒤에 두고 TLS와 인증을 붙이는 편이 낫다. `webui_allowed_hosts`, `cors_origins`, `cors_credentials` 같은 설정도 함께 확인해야 한다.

최근 릴리스 노트도 이 점을 강하게 뒷받침한다. `v4.5.2`, `v4.5.3`, `v4.5.4`에는 REST/WebUI, CORS, DNS rebinding, secrets redaction, unauthenticated API exposure, SSRF, command injection, SQL/CQL injection 관련 보안 패치가 여럿 포함됐다. Web/API 모드를 쓰는 운영자는 최신 4.x 버전을 유지하고 릴리스 노트를 읽는 편이 좋다.

컨테이너로 실행할 때도 `--pid host`, `--network host`, Docker socket mount는 강력한 권한이다. 서버 전체 상태와 컨테이너 정보를 보기 위해 필요한 선택일 수 있지만, 이 컨테이너가 침해되면 호스트 관측면이 넓어진다. 개인 홈랩에서는 편리하지만 회사 환경에서는 보안 정책을 먼저 확인해야 한다.

## 어떤 상황에서 유용한가

Glances는 다음 상황에 잘 맞는다.

- SSH로 서버에 들어가자마자 전체 상태를 빠르게 훑고 싶다.
- `top`, `htop`, `iotop`, `df`, `ifstat`, `sensors`, `docker stats` 사이를 왔다 갔다 하기 싫다.
- 개발 머신에서 메모리/스왑, Docker container, 디스크 I/O를 한 화면에서 보고 싶다.
- 홈서버나 내부 서버에 가벼운 Web UI 대시보드를 올리고 싶다.
- REST API나 stdout JSON으로 간단한 health check를 만들고 싶다.
- Prometheus, InfluxDB, ClickHouse, Kafka 같은 외부 시스템으로 메트릭을 export하고 싶다.
- AI assistant에게 현재 머신 상태를 읽게 하는 MCP 실험을 해보고 싶다.

반대로 장기간 보관, 알림 라우팅, 대규모 인프라 observability가 필요하다면 Glances만으로는 부족하다. Prometheus/Grafana, Datadog, Netdata, Zabbix, OpenTelemetry 같은 체계와 역할이 다르다. Glances는 “지금 이 머신이 어떤 상태인지 빠르게 보는 도구”로 가장 빛난다.

## 내 판단

Glances는 오랫동안 유지되어 온 cross-platform 시스템 모니터링 도구답게, 설치 경로와 사용 모드가 매우 넓다. 로컬 TUI는 `top`/`htop`의 현실적인 대안이고, Web UI와 REST API는 작은 서버 대시보드로 쓰기 좋다. `--fetch`, stdout CSV/JSON, Docker image, MCP 서버까지 붙어 있어 단순한 터미널 앱 이상으로 확장할 수 있다.

추천 대상은 서버를 자주 만지는 개발자, 홈랩 운영자, Docker/Podman 컨테이너 상태를 같이 보고 싶은 사람, macOS/Linux/Windows를 오가며 비슷한 시스템 모니터링 경험을 원하는 사람이다.

다만 Web/API/MCP 모드는 반드시 보안 설정을 같이 봐야 한다. 특히 기본값만 믿고 `glances -w`를 공용 네트워크에 열어두는 것은 피해야 한다. 최신 릴리스의 보안 패치 이력까지 고려하면, Glances는 “편해서 켜는 도구”이면서 동시에 “어디까지 노출되는지 확인해야 하는 도구”다.

## 참고한 공개 자료

- [nicolargo/glances GitHub repository](https://github.com/nicolargo/glances)
- [Glances official documentation](https://glances.readthedocs.io/)
- [Glances latest release](https://github.com/nicolargo/glances/releases/latest)
- [Glances README](https://github.com/nicolargo/glances/blob/develop/README.rst)
- [Glances install docs](https://glances.readthedocs.io/en/develop/install.html)
- [Glances quickstart docs](https://glances.readthedocs.io/en/develop/quickstart.html)
- [Glances REST API docs](https://glances.readthedocs.io/en/develop/api/restful.html)
- [Glances MCP API docs](https://glances.readthedocs.io/en/develop/api/mcp.html)
- [PyPI: Glances](https://pypi.org/project/Glances/)
- [Homebrew Formula: glances](https://formulae.brew.sh/formula/glances)
- [Docker Hub: nicolargo/glances](https://hub.docker.com/r/nicolargo/glances/)
