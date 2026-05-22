---
title: "NVIDIA/skills는 CUDA-X와 NeMo 작업 지식을 에이전트 스킬로 배포하는 공식 카탈로그다"
date: "2026-05-22T20:56:16"
description: "NVIDIA/skills는 CUDA-X, NeMo, TensorRT-LLM, cuOpt, RAG Blueprint 같은 NVIDIA 제품 작업 지식을 Agent Skills 형식으로 배포하는 공식 검증 스킬 카탈로그다."
author: "Sangmin Lee"
repository: "NVIDIA/skills"
sourceUrl: "https://github.com/NVIDIA/skills"
status: "Open source official skill catalog"
license: "Apache-2.0 + CC-BY-4.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Agent Skills"
  - "NVIDIA"
  - "CUDA-X"
  - "NeMo"
  - "AI Agents"
highlights:
  - "README 기준 16개 NVIDIA 제품 항목, 실제 SKILL.md 155개가 공개되어 있으며 각 제품 저장소에서 daily sync로 미러링된다."
  - "설치는 `npx skills add nvidia/skills` 흐름을 쓰며, `--list`, `--skill`, `--agent`, `--global`, `--yes`로 목록 확인·단일 스킬 설치·에이전트별 설치를 제어할 수 있다."
  - "cuOpt, TensorRT-LLM, Megatron, NeMo-RL, ModelOpt, RAG Blueprint처럼 GPU/LLM 인프라 작업에서 에이전트가 따라야 할 절차와 함정을 SKILL.md로 압축한다."
  - "보안 측면에서는 SkillSpector 스캔, skill card, OMS 서명 문서를 함께 제공하지만, 현재 서명은 제품별 opt-in에 가깝기 때문에 설치 전 스킬 본문과 커밋을 직접 확인하는 편이 안전하다."
draft: false
---

`NVIDIA/skills`는 NVIDIA가 공개한 **공식 Agent Skills 카탈로그**다. 일반적인 라이브러리나 CLI라기보다는, Claude Code·Codex·Cursor·Windsurf·Gemini CLI 같은 에이전트가 특정 NVIDIA 제품을 다룰 때 참고할 수 있는 `SKILL.md` 작업 지침 모음에 가깝다.

핵심은 “문서를 사람이 읽는 형태”에서 한 단계 더 나아가, 에이전트가 바로 읽고 실행 계획에 반영할 수 있는 형태로 제품별 운영 지식·API 사용법·디버깅 절차·주의사항을 패키징했다는 점이다. cuOpt 최적화 문제를 풀 때 상태값 이름을 어떻게 확인해야 하는지, TensorRT-LLM 성능 분석을 어떤 보고서 구조로 정리해야 하는지, NeMo-RL 작업을 Kubernetes/RayCluster에서 어떻게 띄우고 관찰해야 하는지 같은 세부 지식이 스킬 안에 들어간다.

![NVIDIA/skills repository](https://opengraph.githubassets.com/nvidia-skills-tips/NVIDIA/skills)

## 무엇을 담고 있나

README 기준 `NVIDIA/skills`는 16개 제품 항목을 공개하고 있고, 로컬 확인 시점에는 `SKILL.md` 파일 155개가 들어 있었다. 저장소 설명처럼 각 스킬은 중앙 카탈로그에서 직접 관리되기보다, 제품별 원본 저장소에서 유지보수된 뒤 자동 동기화로 이 저장소에 미러링된다.

대표 범주는 다음처럼 나뉜다.

| 범주 | 포함되는 제품 예시 | 성격 |
|---|---|---|
| GPU/최적화 기본기 | cuOpt, CUDA-Q, DALI, TileGym | 수식 모델링, GPU 데이터 처리, 타일 기반 커널 작성, 양자/CUDA 워크플로 |
| LLM 학습·추론 인프라 | TensorRT-LLM, Megatron-Core, Megatron-Bridge, NeMo-RL | 대규모 학습, RLHF/GRPO/DPO, 모델 변환, 추론 최적화, 성능 분석 |
| 모델 최적화·평가 | Model-Optimizer, NeMo Evaluator, NeMo Gym | PTQ/FP8/NVFP4/INT4 AWQ, 평가 런처, RL 환경 추가 |
| AI Blueprint·앱 | RAG Blueprint, DeepStream, Video Search and Summarization, Nemotron Voice Agent | RAG 배포, 비디오 분석, 음성 에이전트, DeepStream 개발 |
| 에이전트 운영·샌드박스 | NemoClaw | OpenClaw/NVIDIA OpenShell 기반 에이전트 샌드박싱, 정책, 원격 배포, 유지보수 워크플로 |

개별 스킬은 꽤 실전적이다. 예를 들어 `cuopt-numerical-optimization-api-python`은 LP/MILP/QP를 구분하는 기준, integer/continuous 변수 판단법, Python API 예제, 상태값이 `OPTIMAL`이 아니라 `Optimal` 같은 PascalCase라는 함정까지 적는다. `TensorRT-LLM`의 `perf-analysis`는 성능 수치를 만들지 말고 profiling tool output에서 가져오라고 못 박고, 병목을 compute/memory/launch/communication/sync로 분류한 뒤 보고서 구조를 맞추게 한다. `Model-Optimizer`의 `ptq`는 Blackwell/Hopper별 quantization format 선택, `trust_remote_code` 모델 의존성, calibration size, checkpoint 검증까지 연결한다.

즉 이 저장소는 “NVIDIA 제품 이름을 나열한 프롬프트 모음”이 아니라, 에이전트가 실수하기 쉬운 제품별 절차를 작은 runbook으로 잘라낸 카탈로그에 가깝다.

## 설치와 첫 사용 흐름

README가 제시하는 기본 설치 흐름은 `skills` CLI를 통한다.

```bash
npx skills add nvidia/skills
```

목록만 먼저 보고 싶다면 아래처럼 실행한다.

```bash
npx skills add nvidia/skills --list
```

이미 필요한 스킬 이름을 알고 있다면 단일 스킬을 바로 지정할 수 있다.

```bash
npx skills add nvidia/skills \
  --skill cuopt-numerical-optimization-api-python \
  --yes
```

특정 에이전트에 설치하려면 `--agent`를 붙인다. README 예시는 Claude Code, Codex, Cursor, Kiro를 직접 보여주고, advanced install 문서는 Claude Code, Codex, Cursor, OpenCode, Windsurf, Gemini CLI 등 Agent Skills 호환 에이전트를 언급한다.

```bash
npx skills add nvidia/skills \
  --skill cuopt-numerical-optimization-api-python \
  --agent codex
```

여러 에이전트에 동시에 설치하는 것도 가능하다.

```bash
npx skills add nvidia/skills \
  --skill cuopt-numerical-optimization-api-python \
  --agent claude-code \
  --agent codex \
  --agent cursor
```

프로젝트 단위 설치가 기본이고, 전역 설치가 필요하면 `--global`을 쓴다. CI나 bootstrap 스크립트처럼 비대화형 설치가 필요하면 `--yes`를 함께 쓰면 된다.

```bash
npx skills add nvidia/skills \
  --skill cuopt-numerical-optimization-api-python \
  --agent codex \
  --global \
  --yes
```

Node.js나 npm을 쓰기 어렵다면 수동 복사도 가능하지만, 공식 문서는 `npx skills add`를 우선 권한다. 에이전트별 설치 위치, 프로젝트/전역 scope, 업데이트 흐름을 CLI가 처리하기 때문이다.

## 자동 동기화 구조가 중요한 이유

이 저장소에서 흥미로운 부분은 카탈로그 운영 방식이다. `skills/` 아래의 제품 폴더를 사람이 직접 고치는 모델이 아니라, `components.d/<product>.yml`에 제품 원본 저장소와 스킬 경로를 등록하고 GitHub Actions가 이를 가져오는 구조다.

`sync-skills.yml` 기준 동기화는 하루 두 번, 06:00 UTC와 18:00 UTC에 돌도록 설정되어 있다. workflow는 각 제품 repo를 sparse checkout으로 가져와 `skills/<catalog_dir>/`로 `rsync`하고, README의 제품 표와 버전 column도 다시 생성한다. 동시에 원본 커밋 SHA와 날짜가 README에 남기 때문에 “이 카탈로그의 TensorRT-LLM 스킬은 어느 upstream commit에서 왔는가”를 추적할 수 있다.

이 구조는 팀 규모가 클수록 의미가 있다. 각 제품 팀은 자기 repo의 `.agents/skills/`, `.claude/skills/`, `skills/` 같은 경로에서 스킬을 유지하고, 중앙 카탈로그는 이를 배포·검색·설치하기 쉬운 한 곳으로 모은다. 사용자는 중앙 카탈로그만 보면 되지만, 실제 이슈나 기여는 제품별 source repo로 흘러간다.

## 신뢰·보안 모델

Agent Skills는 단순 문서처럼 보이지만, 실제로는 에이전트의 행동을 바꾸는 공급망 아티팩트다. 스킬은 명령 실행, 파일 읽기/쓰기, 외부 API 호출, 클러스터 배포, secret 참조 같은 결정을 유도할 수 있다. 그래서 `NVIDIA/skills`는 설치 문서뿐 아니라 trust pipeline 문서도 함께 둔다.

문서가 제시하는 기본 게이트는 세 단계다.

1. SkillSpector로 skill directory를 스캔한다.
2. skill card에 owner, license, use case, output, risks, references를 적는다.
3. OMS detached signature인 `skill.oms.sig`로 검토된 디렉터리와 설치된 디렉터리가 같은지 검증한다.

다만 현재 상태를 읽을 때는 약간의 구분이 필요하다. README roadmap에는 “Security scanning for all published skills”는 완료로 표시되어 있지만, “Skills signing”, “universal evaluation criteria”, “Skill Card”, “Compliance gates”, “Syndication”은 아직 계획 항목으로 남아 있다. 실제 workflow도 `skill.oms.sig` 누락을 추적하되 “signing is currently opt-in per product”라고 설명한다. 로컬 확인 시점에는 cuOpt 쪽 일부 스킬 9개에 `skill.oms.sig`가 있었고, `Skill Card` 파일은 발견되지 않았다.

따라서 `NVIDIA-verified`라는 표현을 “아무 검토 없이 설치해도 안전하다”로 해석하면 안 된다. 더 정확히는 NVIDIA가 공식적으로 공개·동기화하는 카탈로그이고, 스캔·서명·skill card 같은 기업용 신뢰 장치를 갖추는 방향으로 설계되어 있다고 보는 편이 맞다.

## 실제로 어떻게 쓰면 좋을까

개인이나 팀에서 쓸 때는 한 번에 전체 카탈로그를 설치하기보다, 작업 단위로 필요한 스킬만 고르는 방식이 낫다.

예를 들어 다음과 같은 흐름이 현실적이다.

1. `npx skills add nvidia/skills --list`로 필요한 제품 스킬을 확인한다.
2. GitHub에서 해당 `SKILL.md`와 `references/`, `scripts/`를 직접 읽는다.
3. 스킬이 요구하는 shell, network, file, cloud, Kubernetes, Docker 권한을 확인한다.
4. 재현성이 필요한 프로젝트라면 `main`이 아니라 특정 commit을 기준으로 기록한다.
5. 설치 후 에이전트가 제안하는 명령은 바로 실행하지 말고, 대상 GPU/클러스터/계정/비용/secret 범위를 확인한다.

특히 NeMo-RL, RAG Blueprint, VSS, TensorRT-LLM, ModelOpt 계열 스킬은 실제 인프라와 붙을 가능성이 크다. Docker Compose, Kubernetes, RayCluster, Helm, SLURM, NGC, Hugging Face cache, W&B secret, model checkpoint 경로 같은 운영 자원이 등장하므로, 스킬이 “무슨 명령을 유도하는지”를 먼저 읽어야 한다.

반대로 cuOpt 모델링, TensorRT-LLM 성능 분석, ModelOpt PTQ처럼 절차적 실수가 자주 나는 작업에서는 가치가 크다. 에이전트가 오래된 API 이름을 쓰거나, 잘못된 status string을 비교하거나, profile 숫자를 근거 없이 만들어내거나, quantization 결과 검증을 건너뛰는 문제를 줄여주기 때문이다.

## 주의할 점

첫째, 릴리스 태그와 GitHub Releases는 확인 시점에 없었다. GitHub API 기준 tags와 releases 모두 비어 있었고, 기본 브랜치는 `main`이다. daily sync 카탈로그라는 성격상 최신성이 장점이지만, 팀 환경에서 재현성을 원한다면 설치한 commit SHA를 따로 남겨야 한다.

둘째, 이 저장소의 라이선스는 단순히 GitHub API가 보여주는 `NOASSERTION`만 보면 놓칠 수 있다. checked-in `LICENSE`와 README는 코드·설정에는 Apache-2.0, 문서에는 CC-BY-4.0을 적용하는 dual license라고 설명한다.

셋째, 기여 경로가 제품별로 나뉜다. 중앙 카탈로그의 README·구조·listing 문제는 `NVIDIA/skills`에 이슈를 열 수 있지만, 특정 제품 스킬의 내용 수정이나 신규 스킬 제안은 해당 source repo의 issue/discussion/contributing 경로를 따라야 한다. CONTRIBUTING 문서도 신규 skill 위치로 agent-agnostic한 `.agents/skills/`를 권장하고, 기존 `.claude/skills/`, `.codex/skills/`, `.cursor/skills/` 같은 agent-specific 경로는 중복을 만들 수 있다고 설명한다.

넷째, “공식 스킬”과 “내 환경에서 안전한 실행”은 별개다. 스킬은 에이전트의 지식을 보강하지만, 실제 권한은 사용자의 로컬 credential, cloud account, cluster context, agent sandbox 정책에 달려 있다. 특히 비용이 큰 GPU 클러스터나 production namespace를 다룰 때는 project scope 설치, least privilege, dry-run, human review를 기본값으로 두는 편이 좋다.

## 내 판단

NVIDIA stack을 자주 다루는 에이전트 환경이라면 `NVIDIA/skills`는 꽤 중요한 신호다. Google이나 개인 개발자가 만든 Agent Skills 카탈로그와 달리, 이 저장소는 GPU/LLM 인프라의 깊은 운영 지식을 제품 팀 단위로 skill화하고 중앙에서 배포하려는 시도다. AI 에이전트가 “도구를 쓸 수 있다”에서 “해당 제품의 실전 함정을 알고 쓴다”로 넘어가는 데 필요한 중간 레이어라고 볼 수 있다.

다만 지금은 범용 marketplace라기보다 빠르게 자라는 공식 카탈로그에 가깝다. tags/releases가 없고, 서명과 skill card도 전 제품에 완전히 적용된 상태는 아니다. 개인 실험에서는 필요한 스킬을 골라 바로 테스트해볼 만하지만, 회사 워크플로에 넣을 때는 특정 commit pinning, SkillSpector 같은 사전 스캔, 서명 파일 확인, 내부 runbook과의 충돌 검토를 함께 두는 쪽을 추천한다.

한 줄로 정리하면: NVIDIA 제품을 에이전트에게 맡길 계획이 있다면 꼭 읽어볼 만한 공식 스킬 카탈로그지만, 설치 버튼을 누르기 전에 `SKILL.md`를 코드 리뷰하듯 읽어야 하는 종류의 도구다.

## 참고한 공개 자료

- [NVIDIA/skills GitHub repository](https://github.com/NVIDIA/skills)
- [NVIDIA/skills README](https://github.com/NVIDIA/skills/blob/main/README.md)
- [Advanced Installation](https://github.com/NVIDIA/skills/blob/main/docs/advanced-install.mdx)
- [A Trust Pipeline for Agent Skills](https://github.com/NVIDIA/skills/blob/main/docs/agent-skill-trust-pipeline.mdx)
- [Scan Agent Skills Before Installation](https://github.com/NVIDIA/skills/blob/main/docs/scanning-agent-skills.mdx)
- [Verify Signed Agent Skills](https://github.com/NVIDIA/skills/blob/main/docs/signing-agent-skills.mdx)
- [Write Skill Cards People Can Trust](https://github.com/NVIDIA/skills/blob/main/docs/skill-cards.mdx)
- [Release Checklist](https://github.com/NVIDIA/skills/blob/main/docs/release-checklist.mdx)
- [components.d schema](https://github.com/NVIDIA/skills/blob/main/components.d/README.md)
- [sync-skills workflow](https://github.com/NVIDIA/skills/blob/main/.github/workflows/sync-skills.yml)
- [Agent Skills specification](https://agentskills.io/specification)
- [skills CLI](https://github.com/vercel-labs/skills)
