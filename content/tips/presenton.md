---
title: "Presenton은 AI 슬라이드 생성을 내 서버와 API로 가져온다"
date: "2026-05-25T03:30:56"
description: "presenton/presenton은 Docker self-hosting, Electron desktop app, HTTP API, MCP, BYOK·local LLM 경로를 함께 제공하는 Apache-2.0 AI presentation generator다."
author: "Sangmin Lee"
repository: "presenton/presenton"
sourceUrl: "https://github.com/presenton/presenton"
status: "Open source beta"
license: "Apache-2.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Presentation"
  - "Self-hosted"
  - "Docker"
  - "Desktop App"
  - "API"
  - "MCP"
highlights:
  - "Apache-2.0 공개 저장소이며 TypeScript/Next.js UI, Python FastAPI backend, Electron desktop shell, Docker runtime을 한 repo에서 묶는다."
  - "GitHub 최신 Release는 Docker v0.8.5-beta이고, download page에는 0.7.3-beta desktop installer(.dmg/.exe/.deb) 링크가 노출된다."
  - "OpenAI, Gemini, Vertex AI, Azure OpenAI, Bedrock, Anthropic, Fireworks, Together, LM Studio, Ollama, custom OpenAI-compatible backend를 선택할 수 있다."
  - "프롬프트·문서 기반 슬라이드 생성, custom template/theme, 편집 가능한 PPTX/PDF export, HTTP API, Streamable HTTP MCP endpoint를 제공한다."
  - "팀이나 외부 접속 환경에서는 app_data의 API keys·admin credentials·exports, 5000번 포트와 /mcp 노출, anonymous telemetry 설정을 먼저 점검해야 한다."
draft: false
---

Gamma, Beautiful.ai, Decktopus류의 AI 슬라이드 도구는 빠르지만 대개 SaaS 계정, 요금제, 데이터 경계에 묶인다. `Presenton`은 그 반대쪽에 가까운 선택지다. 생성 UI, export backend, Docker 배포, desktop app, API, MCP server를 모두 공개 저장소 안에 두고 “슬라이드 생성기를 내 컴퓨터나 내 서버에서 돌린다”는 방향을 잡고 있다.

조사 시점 기준 `presenton/presenton`은 Apache-2.0 라이선스의 공개 저장소이며, GitHub 설명은 “Open-Source AI Presentation Generator and API”다. README는 Docker self-hosting, macOS/Windows/Linux desktop app, BYOK model provider, Ollama/LM Studio 같은 local model path, 편집 가능한 PPTX export를 핵심 차별점으로 내세운다.

![Presenton desktop editor](/images/tips/presenton-desktop.png)

## Presenton 개요

Presenton을 단순한 “프롬프트로 PPT 만드는 앱”으로만 보면 조금 좁다. 실제 구조는 다음 네 가지 표면을 동시에 가진다.

- **Self-hosted web app**: `ghcr.io/presenton/presenton:latest` Docker image를 띄우고 브라우저에서 `localhost:5000`으로 접속한다.
- **Desktop app**: README와 download page는 macOS `.dmg`, Windows `.exe`, Linux `.deb` 배포를 안내한다.
- **API server**: `/api/v1/ppt/presentation/generate` 같은 endpoint로 슬라이드 생성·편집·export workflow를 자동화한다.
- **MCP server**: Streamable HTTP 방식의 `/mcp` endpoint를 제공해 agent나 AI chat tool에서 `generate_presentation` 도구처럼 붙일 수 있다.

Stack도 이 방향을 반영한다. UI 쪽은 Next.js/React, backend는 Python 3.11 + FastAPI, desktop shell은 Electron, 배포는 Dockerfile과 docker-compose가 중심이다. 문서 변환·OCR·export에는 LiteParse, Tesseract, LibreOffice, presentation-export runtime 등이 얽혀 있어 “가벼운 프론트엔드 앱”이라기보다는 슬라이드 생성/변환 파이프라인에 가깝다.

![Presenton features overview](/images/tips/presenton-features.png)

## 왜 유용한가

첫 번째 장점은 **데이터와 모델 선택권**이다. OpenAI, Google Gemini, Vertex AI, Azure OpenAI, Amazon Bedrock, Anthropic, Fireworks, Together, LM Studio, Ollama, custom OpenAI-compatible endpoint를 선택할 수 있다. 완전 local-only를 원하면 Ollama/LM Studio 쪽으로, 품질과 속도를 원하면 cloud provider 쪽으로 붙이는 식이다.

두 번째는 **결과물이 편집 가능한 문서**라는 점이다. README는 PPTX/PDF export와 custom template/theme를 강조한다. AI가 만든 초안을 그대로 쓰기보다, 조직 template에 맞춰 초안을 만들고 PowerPoint에서 마지막 수정을 하는 workflow에 잘 맞는다.

세 번째는 **자동화 표면**이다. UI에서 한 번씩 만드는 앱으로도 쓸 수 있지만, API와 MCP가 있으므로 다음 같은 흐름을 만들 수 있다.

- CSV나 문서 파일을 올려 반복 보고서 slide deck 생성
- 내부 agent가 pitch deck, sales report, 교육 자료 초안을 생성
- 특정 template을 고정하고 topic/instructions만 바꿔 batch 생성
- self-hosted endpoint 뒤에 팀용 workflow나 dashboard를 얹기

## 설치와 첫 사용법

가장 빠른 공식 경로는 Docker quickstart다.

```bash
# Linux / macOS
docker run -it --name presenton \
  -p 5000:80 \
  -v "./app_data:/app_data" \
  ghcr.io/presenton/presenton:latest
```

Windows PowerShell에서는 volume path가 다르다.

```powershell
docker run -it --name presenton `
  -p 5000:80 `
  -v "${PWD}\app_data:/app_data" `
  ghcr.io/presenton/presenton:latest
```

실행 후 브라우저에서 `http://localhost:5000`을 열면 된다. 다만 팀 환경이나 장기 실행 서버라면 처음부터 admin credential을 명시하는 편이 낫다.

```bash
docker run -it --name presenton \
  -p 127.0.0.1:5000:80 \
  -e AUTH_USERNAME="admin" \
  -e AUTH_PASSWORD="<strong-password>" \
  -e CAN_CHANGE_KEYS="false" \
  -e DISABLE_ANONYMOUS_TRACKING="true" \
  -v "./app_data:/app_data" \
  ghcr.io/presenton/presenton:latest
```

README의 기본 예시는 `-p 5000:80`이지만, 개인 노트북에서 먼저 평가할 때는 위처럼 `127.0.0.1:5000:80`으로 loopback에 묶는 쪽이 안전하다. `app_data`에는 생성물, 업로드, 설정, credential 관련 파일이 쌓이므로 backup/sync 대상과 권한을 같이 정해야 한다.

Desktop app은 `https://presenton.ai/download`에서 받는 흐름이다. 여기서는 macOS, Windows, Linux installer를 제공하지만, 조사 시점에는 GitHub Release 최신 태그가 `v0.8.5-beta`인 반면 download page의 직접 installer 링크는 `0.7.3-beta`로 보였다. Docker와 desktop release train이 완전히 같은 속도로 움직이지 않을 수 있으니, 팀 배포 전에는 실제 installer version과 changelog를 다시 확인하는 편이 좋다.

## API와 MCP로 붙일 때

Self-hosted API는 발표 자료 생성 endpoint를 바로 노출한다. README 예시는 HTTP Basic auth를 사용한다.

```bash
curl -u username:password \
  -X POST http://localhost:5000/api/v1/ppt/presentation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Introduction to Machine Learning",
    "n_slides": 5,
    "language": "English",
    "template": "general",
    "export_as": "pptx"
  }'
```

응답은 `presentation_id`, 다운로드용 `path`, 편집 UI로 이어지는 `edit_path`를 반환하는 구조다. README는 `/api/v1/` route 대부분이 web UI admin username/password와 같은 credential의 Basic auth를 요구한다고 설명한다.

MCP는 `stdio`가 아니라 **Streamable HTTP**만 지원한다. Local self-hosted instance라면 `http://localhost:5000/mcp`, cloud endpoint라면 `https://api.presenton.ai/mcp` 형태로 연결한다. 현재 문서상 도구는 `generate_presentation` 하나이고, 주요 입력은 `content`와 `instructions`다. Agent가 회의록, CSV 요약, product brief를 받아 곧바로 deck 초안을 만들게 하는 용도로 흥미롭다.

## 운영할 때 주의할 점

가장 중요한 caveat는 **self-hosted라고 해서 자동으로 안전한 것은 아니라는 점**이다.

- **포트 노출**: Docker의 `-p 5000:80`은 환경에 따라 LAN에서 접근 가능하게 열릴 수 있다. 먼저 `127.0.0.1:5000:80`으로 평가하고, 외부 공개가 필요하면 reverse proxy, TLS, 인증, 방화벽을 별도로 둬야 한다.
- **Credential 저장**: provider API key, admin login, exports, uploads, SQLite database가 `app_data`에 모인다. `.env`와 volume backup 정책에 secrets가 섞이지 않게 관리해야 한다.
- **키 수정 권한**: 팀용 instance에서는 `CAN_CHANGE_KEYS=false`로 UI에서 API key를 바꾸거나 보는 동선을 잠그는 것이 안전하다.
- **Telemetry**: README와 environment docs는 `DISABLE_ANONYMOUS_TRACKING=true`를 제공한다. 민감한 조직 환경이면 기본 설정을 확인하고 명시적으로 끄는 편이 좋다.
- **데이터 경계**: Ollama/LM Studio/local endpoint를 쓰면 외부 model API 호출을 줄일 수 있지만, OpenAI/Gemini/Anthropic/Azure/Bedrock 등을 선택하면 prompt와 generation context가 해당 provider로 간다. 업로드 문서를 어떤 단계에서 어떻게 처리하는지, 팀 정책에 맞는 provider인지 확인해야 한다.
- **MCP/API 노출**: `/mcp`와 `/api/v1`은 자동화에 유용하지만, 잘못 열리면 presentation 생성 비용, 내부 문서 prompt, export 결과가 함께 노출될 수 있다.

Release maturity도 아직 beta로 보는 편이 맞다. GitHub 최신 release 이름은 `Docker v0.8.5-beta`이고 asset은 별도로 붙어 있지 않았다. Electron package 내부 version은 `0.8.3-beta`, download page installer 링크는 `0.7.3-beta`로 확인되어 표면별 version drift가 있다. 운영에 넣기 전에는 Docker image tag, desktop installer, docs version을 함께 pin하는 것이 좋다.

## 내 판단

Presenton은 “한 번 멋진 발표 자료를 빨리 만들고 싶다”는 개인 사용자보다, **AI slide generation을 내부 workflow나 agent에 붙이고 싶은 팀**에게 더 흥미롭다. Docker로 띄울 수 있고, API/MCP가 있고, BYOK/local model/provider 선택권이 있으며, 결과물이 PPTX/PDF로 빠진다는 조합은 자동화하기 좋다.

특히 다음 경우에 먼저 평가해볼 만하다.

- SaaS slide generator에 문서와 prompt를 계속 올리기 부담스러운 팀
- 매주 반복되는 보고서, pitch deck, 교육 자료 초안을 자동 생성하고 싶은 사람
- Ollama/LM Studio/custom OpenAI-compatible backend로 local-ish workflow를 만들고 싶은 개발자
- Agent가 “보고서 요약 → deck 초안 생성 → 사람이 편집” 흐름을 수행하게 만들고 싶은 경우

반대로 완성된 design polish, enterprise permissioning, multi-user governance, desktop app의 안정적인 release cadence가 최우선이면 아직 beta 표면을 감안해야 한다. 내 기준으로는 “최종 발표 디자인 도구”라기보다 **슬라이드 초안 생성 파이프라인을 self-host/API-first로 가져오는 오픈소스 기반**으로 보는 것이 정확하다.

## 참고한 공개 자료

- [presenton/presenton GitHub repository](https://github.com/presenton/presenton)
- [Presenton README](https://github.com/presenton/presenton/blob/main/README.md)
- [Presenton Apache-2.0 LICENSE](https://github.com/presenton/presenton/blob/main/LICENSE)
- [Docker v0.8.5-beta GitHub Release](https://github.com/presenton/presenton/releases/tag/v0.8.5-beta)
- [Presenton download page](https://presenton.ai/download)
- [Presenton Docker quickstart](https://docs.presenton.ai/v3/get-started/quickstart)
- [Presenton environment variables](https://docs.presenton.ai/v3/configurations/environment-variables)
- [Presenton API documentation](https://docs.presenton.ai/using-presenton-api)
- [Generate Presentation over MCP](https://docs.presenton.ai/v3/guide/generate-presentation-over-mcp)
