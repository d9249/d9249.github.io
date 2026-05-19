---
title: "AI Engineering from Scratch는 AI 시스템을 바닥부터 다시 쌓는 428개 레슨 커리큘럼이다"
date: "2026-05-20T00:50:48"
description: "rohitg00/ai-engineering-from-scratch는 수학·ML·딥러닝·LLM·MCP·에이전트·운영까지 20단계/428개 레슨으로 직접 구현해보는 MIT 오픈 커리큘럼이다."
author: "Sangmin Lee"
repository: "rohitg00/ai-engineering-from-scratch"
sourceUrl: "https://github.com/rohitg00/ai-engineering-from-scratch"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Education"
  - "AI Engineering"
  - "LLM"
  - "AI Agents"
  - "MCP"
  - "Curriculum"
highlights:
  - "README와 ROADMAP 기준 20개 phase, 428개 lesson, ROADMAP 총 학습량 약 314시간 규모의 무료 MIT 오픈 커리큘럼이다."
  - "수학·전통 ML·딥러닝·CV/NLP/음성·Transformer·GenAI·RL·LLM·MCP·agent engineering·운영·안전·capstone을 한 흐름으로 묶는다."
  - "각 레슨은 `docs/en.md`, 실행 코드, `outputs/` artifact를 두고 Build It → Use It → Ship It 흐름으로 prompt·skill·agent·MCP 산출물을 남기는 구조다."
  - "공식 시작법은 웹에서 읽거나 repo를 clone해 첫 레슨 코드를 실행하는 방식이며, SkillKit/Claude/Cursor/Codex/OpenClaw/Hermes용 `/find-your-level` 스킬도 포함한다."
  - "GitHub Releases와 tag가 아직 없으므로 팀 교육·사내 포크에 쓰려면 특정 commit을 pin하고, API key·GPU·cloud 과금이 필요한 레슨은 별도 sandbox에서 다루는 편이 안전하다."
draft: false
---

AI 학습 자료는 많지만, 대부분은 “API를 호출해서 데모를 만든다”와 “논문 수식을 읽는다” 사이 어딘가에서 끊긴다. `AI Engineering from Scratch`는 그 간극을 정면으로 겨냥한 오픈 커리큘럼이다. 선형대수와 확률에서 시작해 tokenizer, attention, agent loop, MCP server, multi-agent swarm, 배포와 안전까지 직접 구현해보게 만든다.

조사 시점의 저장소 `rohitg00/ai-engineering-from-scratch`는 MIT 라이선스 공개 repo이며, README와 ROADMAP 기준 20개 phase와 428개 lesson을 갖고 있다. ROADMAP의 총 추정 학습량은 약 314시간이고, README는 약 320시간 규모라고 설명한다. 웹사이트는 [aiengineeringfromscratch.com](https://aiengineeringfromscratch.com)에서 바로 읽을 수 있다.

![AI Engineering from Scratch banner](/images/tips/ai-engineering-from-scratch-banner.svg)

## 무엇을 담고 있나

이 저장소는 단일 라이브러리나 CLI가 아니라 **AI 엔지니어링 reference manual + runnable lesson repo**에 가깝다. 루트 README가 전체 흐름을 설명하고, 실제 수업은 `phases/<NN>-<phase-name>/<NN>-<lesson-name>/` 아래에 쌓인다.

레슨 하나의 기본 구조는 다음과 같다.

```text
phases/<NN>-<phase-name>/<NN>-<lesson-name>/
├── code/      runnable implementations
├── docs/
│   └── en.md  lesson narrative
└── outputs/   prompts, skills, agents, or MCP servers
```

핵심은 “프레임워크를 쓰기 전에 작은 버전을 직접 만든다”는 점이다. 예를 들어 Phase 14의 agent loop 레슨은 ReAct의 Thought/Action/Observation loop를 stdlib Python으로 구현한 뒤, Claude Agent SDK, OpenAI Agents SDK, LangGraph, AutoGen 같은 프레임워크가 결국 같은 loop 주변에 어떤 운영 장치를 더하는지 설명한다.

## 커리큘럼 흐름

20개 phase는 꽤 넓다.

- **기초층**: setup/tooling, math foundations, ML fundamentals, deep learning core
- **모달리티층**: computer vision, NLP, speech/audio, multimodal AI
- **생성·추론층**: transformers, generative AI, reinforcement learning, LLMs from scratch, LLM engineering
- **에이전트층**: tools/protocols, MCP, agent engineering, autonomous systems, multi-agent/swarms
- **운영층**: infrastructure/production, ethics/safety/alignment, capstone projects

README가 강조하는 방식은 `MOTTO → PROBLEM → CONCEPT → BUILD IT → USE IT → SHIP IT`이다. 단순히 개념을 읽고 끝내는 대신, 각 레슨이 prompt, `SKILL.md`, agent definition, MCP server 같은 재사용 가능한 artifact로 이어지도록 설계되어 있다.

## 시작 방법

가장 쉬운 사용법은 웹에서 읽는 것이다.

- [aiengineeringfromscratch.com](https://aiengineeringfromscratch.com)에서 phase와 lesson을 탐색한다.
- 이미 아는 영역이 많다면 README의 “Where to start” 표를 보고 Phase 3, 10, 14처럼 중간부터 들어간다.

로컬에서 코드를 실행하려면 README가 제시하는 clone-first 흐름이 기본이다.

```bash
git clone https://github.com/rohitg00/ai-engineering-from-scratch.git
cd ai-engineering-from-scratch
python phases/01-math-foundations/01-linear-algebra-intuition/code/vectors.py
```

Python 쪽 기본 의존성은 `requirements.txt`에 있다. `numpy`, `matplotlib`, `jupyter`, `torch`, `torchvision`, `torchaudio`, `transformers`, `datasets`, `tokenizers`, `accelerate`, `scikit-learn`, `pandas`, `librosa`, `tiktoken`, `anthropic`, `openai` 등이 포함된다. 즉 모든 레슨이 “브라우저만 있으면 끝”은 아니고, 로컬 실습을 하려면 Python/ML 환경을 갖춰야 한다.

에이전트 사용자라면 `.claude/skills`에 들어 있는 두 가지 내장 스킬도 눈여겨볼 만하다.

```text
/find-your-level
/check-understanding <phase>
```

README는 SkillKit을 통해 Claude, Cursor, Codex, OpenClaw, Hermes 또는 MCP-compatible agent에 lesson artifact를 연결하는 흐름을 소개한다. 다만 이 repo 자체는 SkillKit CLI가 아니라 **설치 대상 커리큘럼과 산출물 저장소**로 보는 편이 정확하다.

## 왜 유용한가

이 자료의 장점은 넓은 주제를 한 줄로 이어준다는 데 있다. “attention이 뭔지 안다”와 “agent가 tool call을 안정적으로 반복하게 만든다” 사이에는 tokenizer, serving, eval, memory, tracing, protocol, sandbox, safety 같은 많은 층이 있다. 이 repo는 그 층을 phase로 쪼개고, 각 단계에서 작은 구현물을 남기게 만든다.

특히 다음 경우에 잘 맞는다.

- AI API만 써왔지만 모델 내부와 학습 loop를 직접 이해하고 싶은 개발자
- LLM/agent stack을 운영하면서 tokenizer, context, eval, MCP, tool loop가 어떻게 연결되는지 정리하고 싶은 사람
- 팀 교육용으로 “읽을거리 + 실행 코드 + 산출물”이 함께 있는 커리큘럼이 필요한 경우
- Claude/Codex/Hermes 같은 coding agent에 넣을 `SKILL.md`나 prompt artifact를 직접 만들고 싶은 경우
- capstone이나 사내 study group을 phase 단위로 운영하고 싶은 경우

## 주의할 점

첫째, GitHub Releases와 tag가 없다. `/releases/latest`는 404였고 tags도 비어 있었다. 저장소는 활발히 갱신되는 커리큘럼에 가깝기 때문에, 팀에서 재현 가능한 교육 자료로 쓰려면 `main`을 그대로 따라가기보다 특정 commit을 기준으로 fork/pin하는 편이 안전하다.

둘째, 숫자 표기가 surface마다 조금 다르다. README 본문과 ROADMAP은 428개 lesson을 말하지만, 웹사이트 meta description이나 banner에는 과거 수치로 보이는 416 또는 280+ 표기가 남아 있다. 실제 학습 범위 판단은 현재 README와 ROADMAP을 기준으로 보는 편이 낫다.

셋째, agent skill과 MCP artifact는 “설치하면 자동으로 안전한 도구”가 아니다. `SKILL.md`, prompt, agent definition은 에이전트의 행동 지침이 되므로, 외부 카탈로그를 그대로 복사하기 전에 파일 내용을 읽고, shell/cloud/API 권한이 연결되는 부분은 따로 검토해야 한다.

넷째, 일부 레슨은 GPU, cloud, API key, paid provider를 전제로 할 수 있다. Phase 0에도 GPU setup, APIs & keys, Docker, Linux, debugging/profiling이 들어 있고, 뒤쪽 phase로 갈수록 LLM provider, MCP server, deployment, autonomous system 실험이 나온다. 개인 학습은 괜찮지만 회사 계정이나 실제 cloud 프로젝트에서 바로 돌리기보다는 sandbox를 먼저 쓰는 편이 좋다.

## 내 판단

`AI Engineering from Scratch`는 “AI를 배운다”보다 “AI 시스템을 구성하는 층을 직접 재구현해본다”에 가까운 자료다. 빠른 앱 개발 튜토리얼을 찾는 사람에게는 너무 크고 느릴 수 있다. 반대로 LLM/agent 시대의 엔지니어링 감각을 바닥부터 다시 정렬하고 싶은 사람에게는 매우 좋은 spine이 된다.

개인적으로는 처음부터 314시간을 전부 달리기보다, 현재 목적에 맞춰 들어가는 방식을 추천한다. ML 기초가 약하면 Phase 1~3, LLM 내부가 궁금하면 Phase 7~11, agent/MCP가 목적이면 Phase 13~16부터 보는 식이다. 이 repo의 가치는 모든 lesson을 완주하는 데만 있는 것이 아니라, 필요한 층을 찾아 코드와 artifact까지 같이 확인할 수 있다는 데 있다.

## 참고한 공개 자료

- [rohitg00/ai-engineering-from-scratch GitHub repository](https://github.com/rohitg00/ai-engineering-from-scratch)
- [AI Engineering from Scratch official website](https://aiengineeringfromscratch.com)
- [README.md](https://github.com/rohitg00/ai-engineering-from-scratch/blob/main/README.md)
- [ROADMAP.md](https://github.com/rohitg00/ai-engineering-from-scratch/blob/main/ROADMAP.md)
- [LICENSE](https://github.com/rohitg00/ai-engineering-from-scratch/blob/main/LICENSE)
