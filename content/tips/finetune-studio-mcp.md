---
title: "FineTune Studio MCP는 Claude 안에서 Hugging Face 파인튜닝을 실행하는 실험용 대시보드다"
date: "2026-05-13T03:45:53"
description: "patchy631/ai-engineering-hub의 finetune-studio-mcp-app은 Claude의 MCP App UI에서 Hugging Face 모델·데이터셋 선택, AutoTrain 학습 시작, Gradio inference Space 배포, 채팅 테스트까지 이어 주는 TypeScript 기반 오픈소스 예제다."
author: "Sangmin Lee"
repository: "patchy631/ai-engineering-hub"
sourceUrl: "https://github.com/patchy631/ai-engineering-hub/tree/main/finetune-studio-mcp-app"
status: "Open source demo app"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "MCP"
  - "Fine-tuning"
  - "Hugging Face"
  - "Claude"
  - "TypeScript"
highlights:
  - "Claude Connector에 붙는 MCP App widget으로 모델 선택, 데이터셋 선택, 하이퍼파라미터 설정, 학습 모니터링을 4단계 wizard로 묶는다."
  - "실제 학습은 사용자의 Hugging Face 계정에 복제한 AutoTrain Advanced Space에서 돌고, 완료 후 fine-tuned model과 Gradio inference Space를 만든다."
  - "Manufact MCP Cloud 배포를 전제로 안내하지만, Node/TypeScript 서버를 로컬에서 `HF_TOKEN=... npm start`로 띄워 `http://localhost:3002/mcp`에 연결할 수도 있다."
  - "`launch_studio`, `search_models`, `search_datasets`, `start_training`, `check_training_status`, `deploy_inference_space`, `chat_with_model` MCP tool을 제공한다."
  - "HF write token, GPU billing, 공개 inference Space 생성, 모델·데이터셋 라이선스가 얽히므로 장난감 예제처럼 보여도 권한과 비용 경계를 먼저 확인해야 한다."
draft: false
---

`FineTune Studio`는 “Claude 안에서 바로 Hugging Face 모델을 fine-tune해 보고 싶다”는 흐름을 MCP App으로 감싼 예제다. 별도 대시보드에 로그인해 여러 페이지를 오가는 대신, Claude Connector에 MCP 서버를 붙이고 conversation side panel에서 모델 선택, 데이터셋 선택, 학습 설정, 진행 로그, inference 테스트까지 이어 가는 구조다.

중요한 점은 이 프로젝트가 자체 학습 프레임워크가 아니라는 것이다. 실제 GPU 학습은 Hugging Face AutoTrain Advanced가 맡고, MCP 서버는 Claude UI와 Hugging Face API/Space 사이를 이어 주는 orchestrator 역할을 한다. 저장소도 독립 repo가 아니라 `patchy631/ai-engineering-hub` 안의 `finetune-studio-mcp-app/` 하위 디렉터리로 들어 있다.

조사 시점 기준 상위 저장소의 GitHub Release와 tag는 없고, 이 앱도 npm 패키지로 배포되는 형태가 아니다. 소스는 TypeScript, Express, `@modelcontextprotocol/sdk`, `@modelcontextprotocol/ext-apps`, Vite single-file widget, `@gradio/client` 조합이며, top-level `LICENSE`는 MIT다.

![FineTune Studio MCP widget](/images/tips/finetune-studio-mcp-studio.png)

## FineTune Studio MCP 개요

FineTune Studio의 제품 표면은 Claude 안에 뜨는 MCP App widget이다. README 기준 사용자는 “start fine-tuning studio”처럼 요청해 widget을 열고, 다음 네 단계를 순서대로 진행한다.

- **Select Model**: SmolLM2, Qwen 2.5, Gemma 3 1B, Phi-4 mini 같은 작은 instruction model 카드에서 고르거나 Hugging Face Hub 모델을 검색한다.
- **Dataset**: Hub의 공개 dataset을 검색하거나, `text` field를 가진 custom JSONL 예시를 직접 붙여 넣는다.
- **Configure**: SFT/DPO/ORPO, chat template, epoch, batch size, learning rate, block size, LoRA rank/alpha/dropout, quantization, target modules, hardware를 설정한다.
- **Training**: AutoTrain Space 상태를 polling하면서 progress, loss, learning rate, epoch, log stream을 보여준다.

학습이 끝나면 fine-tuned model ID를 보여 주고, 별도의 Gradio inference Space를 만들어 “View on Hub”, “Chat with model”, “Redeploy Space” 흐름으로 이어 준다. 즉 PoC 관점에서는 “Claude 대화 → MCP tool call → HF AutoTrain → HF model repo → Gradio inference app”까지 한 번에 연결한 사례로 볼 수 있다.

## 설치와 배포 흐름

공식 README의 기본 흐름은 Manufact MCP Cloud에 배포한 뒤 Claude Connector에 붙이는 방식이다. 입력 URL이 저장소 하위 디렉터리이므로, 실제로는 상위 저장소를 받은 뒤 해당 폴더로 들어가는 식으로 시작하는 편이 자연스럽다.

```bash
git clone https://github.com/patchy631/ai-engineering-hub
cd ai-engineering-hub/finetune-studio-mcp-app
npm install
npm run build
```

Manufact CLI 배포는 다음 흐름으로 안내된다.

```bash
npm install -g @mcp-use/cli
npx @mcp-use/cli login
npm run build
npx @mcp-use/cli deploy
```

배포 후 Manufact dashboard의 environment variables에 `HF_TOKEN`을 넣고, Claude의 Settings → Connectors에서 `https://your-server-name.manufact.app/mcp` 같은 서버 URL을 등록한다. 로컬 개발만 할 때는 서버를 직접 띄울 수 있다.

```bash
HF_TOKEN=hf_yourtoken npm start
# MCP endpoint: http://localhost:3002/mcp
```

서버 코드는 Express 위에 streamable HTTP MCP endpoint `/mcp`를 열고, 기본 port는 `3002`다. `npm run build`는 `INPUT=widget.html vite build`로 widget을 single-file HTML로 묶고, 서버가 이를 MCP App resource로 제공한다.

## Hugging Face 쪽에서 필요한 준비

FineTune Studio가 자동으로 다 해 주는 것처럼 보이지만, 실제로는 사용자의 Hugging Face 계정 준비가 핵심이다.

- **HF write token**: 모델 repo와 Space를 만들고 push하기 위해 write 권한 token이 필요하다.
- **Billing credits**: AutoTrain 학습은 GPU 시간 과금이므로 credits를 미리 넣어야 한다. README의 예시는 T4, A10G, A100 계열 hardware별 시간당 비용을 제시하지만, 실제 가격은 Hugging Face billing 화면에서 다시 확인해야 한다.
- **AutoTrain Advanced Space 복제**: `autotrain-projects/autotrain-advanced` Space를 자기 계정에 `autotrain-advanced` 이름으로 duplicate하고, Space secret에 `HF_TOKEN`을 넣는 one-time setup이 필요하다.
- **모델/데이터셋 권한**: gated model, private dataset, 라이선스 제한이 있는 dataset은 token 권한과 사용 조건을 별도로 맞춰야 한다.

이 구조는 장점도 있다. 학습 비용과 산출물이 모두 사용자의 Hugging Face 계정에 남기 때문에, demo server가 중앙에서 GPU 비용을 대신 들고 있지 않다. 반대로 말하면 Claude에서 누른 “Start Training”이 실제 유료 GPU 작업으로 이어진다는 뜻이므로, 연결 대상과 권한을 가볍게 보면 안 된다.

## MCP tool 표면

README와 `server.ts` 기준 MCP 서버가 제공하는 tool은 다음과 같다.

- `launch_studio`: Claude 안에서 FineTune Studio widget을 연다.
- `search_models`: Hugging Face Hub의 text-generation 모델을 검색한다.
- `search_datasets`: Hugging Face Hub dataset을 검색한다.
- `start_training`: AutoTrain Advanced Space의 API로 학습 job을 만든다.
- `check_training_status`: training Space runtime과 log stream을 polling하고, 완료 시 후속 publish/deploy 흐름을 처리한다.
- `deploy_inference_space`: fine-tuned model을 불러오는 Gradio inference Space를 수동으로 만들거나 다시 배포한다.
- `chat_with_model`: inference Space, HF Inference Router, HF Inference API 경로를 순차적으로 시도해 모델 응답을 받아 온다.

특히 흥미로운 부분은 단순히 AutoTrain job을 시작하는 데서 끝나지 않고, 완료 후 inference Space까지 만들어 대화 테스트로 이어 준다는 점이다. 작은 모델과 작은 JSONL dataset으로 “fine-tuning UX prototype”을 만들고 싶을 때는 배울 부분이 많다.

## 주의할 점

첫째, `HF_TOKEN`의 권한이 넓다. README도 write token을 요구한다고 설명하고, 서버 코드는 Hugging Face repo/Space 생성, secret 설정, model setting 변경, inference Space commit 같은 작업을 수행한다. 이 token은 Claude Connector에 붙는 MCP 서버의 환경변수로 들어가므로, 공개적으로 노출된 서버나 신뢰하지 않는 client에 붙이면 안 된다.

둘째, 비용이 실제로 발생한다. AutoTrain Space가 GPU hardware를 provisioning하고 학습 container를 실행한다. `Start Training` 버튼은 데모 클릭이 아니라 Hugging Face billing credit을 쓰는 행위다. 팀 환경에서는 누가 어떤 모델·dataset·hardware 조합으로 실행할 수 있는지 운영 규칙이 필요하다.

셋째, 산출물 공개 범위를 확인해야 한다. `server.ts`의 inference Space 생성 경로는 Space를 `private: false`로 만들고, 학습 완료 처리 중 fine-tuned model settings를 public으로 바꾸는 로직을 포함한다. 내부 데이터로 fine-tune한 모델이라면 이 기본 동작이 의도와 맞는지 반드시 확인해야 한다.

넷째, 데이터셋과 모델 라이선스는 자동 해결되지 않는다. Hub에서 검색해 고를 수 있다는 것과 상업적/내부 사용이 가능하다는 것은 다르다. gated model, benchmark dataset, 사용자 제공 JSONL에는 각각 별도 사용 조건과 개인정보·보안 검토가 필요하다.

다섯째, 아직 packaged product라기보다 빠르게 만든 demo app에 가깝다. 상위 저장소에는 release/tag가 없고, 설치는 source checkout + npm build + Manufact deploy 중심이다. 운영 서비스로 쓰려면 authentication, rate limit, audit log, error recovery, private artifact policy를 추가로 점검하는 편이 좋다.

## 내 판단

FineTune Studio MCP는 “fine-tuning을 누구나 쉽게 한다”는 완성형 제품이라기보다, **MCP App이 agent UX를 어디까지 넓힐 수 있는지 보여 주는 좋은 샘플**에 가깝다. Claude 안에서 interactive wizard를 띄우고, tool call로 외부 GPU 학습 job을 만들고, 완료 후 inference UI까지 연결하는 흐름은 MCP App 설계 사례로 꽤 유용하다.

개인 실험자라면 작은 SmolLM/Qwen 계열 모델과 공개 toy dataset으로 AutoTrain end-to-end를 확인해 보기 좋다. 반대로 회사 데이터나 민감한 instruction dataset을 넣으려면, 기본 공개 Space/model 동작과 HF token 범위부터 고쳐야 한다. 내 기준으로는 “파인튜닝 운영 도구”라기보다 **Claude 기반 fine-tuning control panel을 만들고 싶은 개발자가 읽고 fork할 만한 TypeScript/MCP 예제**다.

## 참고한 공개 자료

- [patchy631/ai-engineering-hub GitHub repository](https://github.com/patchy631/ai-engineering-hub)
- [finetune-studio-mcp-app source directory](https://github.com/patchy631/ai-engineering-hub/tree/main/finetune-studio-mcp-app)
- [FineTune Studio README](https://github.com/patchy631/ai-engineering-hub/blob/main/finetune-studio-mcp-app/README.md)
- [FineTune Studio server.ts](https://github.com/patchy631/ai-engineering-hub/blob/main/finetune-studio-mcp-app/server.ts)
- [Hugging Face AutoTrain Advanced Space](https://huggingface.co/spaces/autotrain-projects/autotrain-advanced)
- [Manufact MCP Cloud](https://manufact.com)
