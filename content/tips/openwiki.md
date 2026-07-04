---
title: "OpenWiki는 GitHub 저장소를 소스 인용 위키로 바꿔주는 Vercel/eve 기반 웹 앱이다"
date: "2026-07-04T19:37:45"
description: "vercel-labs/openwiki는 공개 GitHub 저장소를 읽어 소스 경로와 citation이 붙은 문서형 wiki를 생성하고, Vercel·Neon·Blob 위에서 온디맨드 생성과 주기적 refresh를 운영하는 Next.js/eve 기반 웹 앱입니다."
author: "Sangmin Lee"
repository: "vercel-labs/openwiki"
sourceUrl: "https://github.com/vercel-labs/openwiki"
status: "Source available preview"
license: "Unknown"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "AI Agents"
  - "Documentation"
  - "GitHub"
  - "Next.js"
  - "Vercel"
  - "Knowledge Base"
highlights:
  - "공개 GitHub 저장소 URL을 넣으면 README·package metadata·docs·entrypoint 같은 high-signal 파일을 읽어 문서형 outline과 source-cited page를 만든다."
  - "Next.js 16 앱에 eve agent를 붙인 구조이며, 저장소 metadata/job/revision/chat state는 Neon Postgres, 생성된 wiki artifact는 Vercel Blob에 둔다."
  - "공식 배포 흐름은 Vercel one-click deploy이고, 로컬 개발은 Node 24 이상·pnpm·Vercel env pull을 전제로 한다."
  - "public deployment는 private repository를 의도적으로 거부하며, `GITHUB_TOKEN`은 공개 repo API rate limit 완화를 위해 private repo 권한 없이 쓰는 편이 안전하다."
  - "조사 시점 기준 release/tag와 LICENSE 파일이 없으므로, 실제 서비스/재배포에는 license 확인과 비용·rate-limit·공개 repo 범위 설정이 먼저 필요하다."
draft: false
---

코딩 에이전트가 큰 저장소에서 길을 잃는 이유는 코드가 없어서가 아니라, **어디를 어떤 순서로 읽어야 하는지**가 정리되어 있지 않기 때문이다. README 하나로는 부족하고, 모든 파일을 매번 훑기에는 context와 tool call 비용이 너무 크다.

`OpenWiki`는 이 문제를 “저장소마다 살아 있는 wiki를 하나 만들자”는 방식으로 푼다. 공식 사이트 `openwiki.sh`는 공개 GitHub 저장소 URL을 받아, 저장소 구조와 high-signal 파일을 읽고, 문서형 navigation과 source citation이 붙은 wiki page를 생성한다. 생성된 wiki는 `/owner/repo` 형태의 route에서 볼 수 있고, 같은 인덱스 위에서 repository chat도 제공한다.

조사 시점 기준 여기서 다루는 OpenWiki는 `vercel-labs/openwiki`다. 이름이 같은 `langchain-ai/openwiki` CLI도 별도로 존재하지만, `openwiki.sh`가 연결하는 프로젝트는 Vercel Labs의 Next.js/eve 기반 웹 앱이다. GitHub 저장소는 공개되어 있으나 GitHub API license는 `null`이고 checked-in `LICENSE` 파일도 보이지 않았다. 따라서 “오픈소스”라고 단정하기보다 **source available preview**로 보는 편이 안전하다.

![OpenWiki homepage showing the repository search box and generated wiki examples](/images/tips/openwiki-home.png)

## 무엇을 해주는 도구인가

OpenWiki는 문서 생성기라기보다 **repository wiki hosting app**에 가깝다. 사용자는 공개 GitHub 저장소를 입력하고, 앱은 해당 저장소를 하나의 wiki 대상으로 등록한 뒤 indexing job을 실행한다. README와 source code 기준 흐름은 다음과 같다.

```text
public GitHub repository
  → repository metadata / bounded file inventory 수집
  → README, package metadata, docs, configs, entrypoint 등 high-signal context 읽기
  → first-party docs index가 있으면 함께 발견
  → eve agent가 docs-style outline 계획
  → page별 markdown 생성 + source path / citation 검증
  → Postgres에 revision/job state 저장
  → Blob artifact로 wiki body 저장
  → /:owner/:repo 와 /:owner/:repo/:slug 에서 제공
```

핵심은 생성 결과가 단순 요약 한 장이 아니라는 점이다. OpenWiki는 작은 라이브러리는 compact하게, 중간 규모 프로젝트는 focused system coverage로, 문서가 많은 프레임워크·플랫폼은 더 많은 source-backed page로 확장하도록 설계되어 있다. source code의 `quality-targets.ts`는 파일 수와 documentation source count, official docs link count를 기준으로 outline/page target을 조정한다.

`openwiki.sh` 홈 화면에는 React, VS Code, Tailwind CSS, Supabase, Rust, Go, Vercel AI SDK, LangChain, Kubernetes 같은 예시 저장소가 카드로 노출된다. 즉 “내 저장소를 넣어보는 생성기”이면서 동시에 “이미 생성된 공개 저장소 wiki를 둘러보는 index” 역할도 한다.

## 구조를 어떻게 봐야 하나

공개 저장소를 보면 제품 경계가 꽤 명확하다.

| 표면 | 역할 |
|---|---|
| `app/` | Next.js App Router 기반 UI와 API route |
| `agent/` | eve agent, indexing channel, schedules, prompts, subagent 관련 코드 |
| `app/api/repositories` | GitHub repo URL을 받아 repository row를 만들고 indexing job을 예약 |
| `agent/lib/indexing/run-index-job.ts` | 저장소 context 수집, outline 생성, page 생성, validation, publish orchestration |
| `lib/storage.ts` | Postgres row와 Blob artifact read/write |
| `agent/schedules/refresh-repositories.ts` | 매일 stale repository를 refresh하는 eve schedule |
| `next.config.ts` | Next.js 앱을 `withEve`로 감싸고 `eve build`를 Vercel build에 연결 |

기술 스택은 TypeScript, Next.js 16, React 19, Tailwind 계열 UI, Vercel Analytics/Speed Insights, Neon serverless Postgres, Vercel Blob, Vercel OIDC, `ai` SDK, 그리고 `eve`다. `package.json`은 `private: true`이고 `engines.node`를 `>=24`로 둔다. npm package로 설치하는 CLI라기보다, 직접 deploy하거나 fork해서 운영하는 웹 앱에 가깝다.

## 설치와 첫 사용 흐름

가장 빠른 공식 경로는 README의 **Deploy with Vercel** 버튼이다. one-click deploy는 Neon Postgres와 Vercel Blob store를 함께 provision하는 흐름으로 설명된다. 배포 후에는 앱에서 GitHub repository URL을 붙여 넣거나, 직접 다음 같은 route를 열어 wiki 생성을 시작한다.

```text
/vercel/next.js
```

로컬에서 보려면 저장소 checkout 후 Node 24 이상과 pnpm을 전제로 한다.

```bash
git clone https://github.com/vercel-labs/openwiki
cd openwiki
pnpm install
vercel link
vercel env pull .env.local --yes
pnpm dev
```

그 다음 `http://127.0.0.1:3000`을 열고 GitHub repository URL을 입력한다. Vercel integration이 이미 연결되어 있지 않다면 README는 Neon과 Blob store를 따로 provision하라고 안내한다.

```bash
vercel integration add neon
vercel blob create-store openwiki-artifacts --access private --yes
vercel env pull .env.local --yes
```

로컬 smoke test에서는 `OPENWIKI_LOCAL_ARTIFACTS=1 pnpm dev`로 artifact를 로컬 디스크에 둘 수 있다. 다만 README도 경고하듯, 이 모드는 isolated local database와 함께 써야 한다. 공유 deployment가 내 로컬 파일을 읽을 수는 없기 때문이다.

## 운영할 때 중요한 설정

OpenWiki는 demo처럼 가볍게 보이지만, 실제로는 public-facing generation service다. 그래서 비용과 abuse control 설정을 먼저 봐야 한다.

필수 환경 변수는 `DATABASE_URL`과 `BLOB_STORE_ID`다. 로컬 개발에서는 `BLOB_READ_WRITE_TOKEN`이 필요할 수 있고, 공개 GitHub API limit을 올리려면 `GITHUB_TOKEN`이 권장된다. README는 이 토큰을 **private repository 권한 없이** 쓰라고 안내한다. public deployment가 private repository를 의도적으로 거부한다는 설명과도 맞다.

생성/채팅 rate limit도 기본 활성화되어 있다. README 기준 기본값은 repository generation client hourly 10, client daily 50, global hourly 120, repo cooldown 10분이다. chat은 client hourly 40, client daily 200, global hourly 600으로 분리되어 있다. 공개 인스턴스를 운영한다면 이 숫자가 곧 모델 비용·GitHub API 사용량·사용자 경험을 결정한다.

읽기 전용 공개 index처럼 쓰고 싶다면 `OPENWIKI_DISABLE_REPOSITORY_CREATION=1`도 중요하다. 이 값을 켜면 이미 indexed 된 wiki는 읽히지만, 모르는 repository route가 DB row를 만들거나 새 generation job을 시작하지 못한다. 사내 demo나 공개 showcase를 열어둘 때 유용한 안전장치다.

모델 설정도 분리되어 있다. README는 wiki outline/page generation용 `OPENWIKI_INDEX_MODEL` 기본값을 더 강한 모델로, lightweight app agent path용 `OPENWIKI_AGENT_MODEL`을 더 저렴하고 빠른 모델로 둔다. 긴 wiki 생성은 품질 민감도가 높고 비용도 커질 수 있으므로, 팀이 쓰는 provider·budget·latency 기준에 맞춰 override하는 편이 좋다.

## 어디에 쓰기 좋은가

OpenWiki가 특히 잘 맞는 상황은 다음과 같다.

- 새로 합류한 사람이 큰 오픈소스/내부 공개 저장소 구조를 빠르게 파악해야 한다.
- AI coding agent에게 `AGENTS.md` 하나 이상의 구조화된 repo context를 주고 싶다.
- README는 짧고 docs는 흩어져 있어서, “문서형 navigation”이 먼저 필요하다.
- 저장소의 README, package metadata, docs, entrypoint, config를 한꺼번에 읽어 초안 wiki를 만들고 싶다.
- 공개 프로젝트를 설명하는 lightweight docs portal을 빠르게 띄워보고 싶다.

단, 현재 형태는 private codebase용 사내 지식베이스라기보다 **공개 GitHub repository 중심의 wiki generator**다. public deployment는 private repository를 reject하도록 설계되어 있고, GitHub token도 public API rate limit 완화 용도에 가깝다. 내부 비공개 저장소를 다루려면 authentication, repository access, artifact storage, retention, prompt/data boundary를 별도 설계해야 한다.

## 주의할 점

첫째, license를 확인해야 한다. `vercel-labs/openwiki`는 공개 저장소이지만 조사 시점 기준 GitHub API license가 없고, root `LICENSE` 파일도 404였다. 코드를 읽고 fork하는 것은 가능해 보여도, 재배포·상업적 사용·내부 제품화는 upstream license가 명확해진 뒤 판단하는 편이 안전하다.

둘째, 이름 충돌이 있다. 검색하면 LangChain의 `langchain-ai/openwiki`가 더 많이 보일 수 있다. 그 프로젝트는 `npm install -g openwiki`로 쓰는 CLI이고 MIT license가 보이는 별도 artifact다. 반면 `openwiki.sh`의 OpenWiki는 Vercel Labs의 hosted/deployable Next.js 앱이다. 설치 명령, license, architecture를 섞어 쓰면 안 된다.

셋째, 생성 품질은 모델·비용·source boundary에 민감하다. OpenWiki는 citations와 source path validity를 강조하지만, 최종 문서는 여전히 agent-generated artifact다. 중요한 기술 판단이나 migration guide로 쓰려면 source citation을 클릭해 실제 파일과 맞는지 확인해야 한다.

넷째, 공개 generation service는 비용과 악용 방지가 제품의 일부다. rate limit을 끄거나 `GITHUB_TOKEN`에 넓은 권한을 주거나, repository creation을 무제한 열어두면 모델 비용·GitHub API quota·storage 사용량이 빠르게 늘 수 있다. 공개 인스턴스라면 read-only mode, global/client limit, repo cooldown, token scope를 먼저 정해야 한다.

다섯째, artifact와 chat state가 남는다. README 기준 repository metadata, jobs, revisions, chat state는 Postgres에, generated wiki body는 Blob에 저장된다. public repo라도 어떤 repository를 누가 생성했는지, 어떤 chat을 했는지, 어떤 model output이 남는지에 대한 retention 기준은 운영자가 정해야 한다.

## 내 판단

OpenWiki는 “문서를 자동으로 써주는 또 하나의 README generator”보다 **repo understanding surface를 웹으로 배포하는 도구**로 보는 편이 맞다. 특히 eve 기반 agent app이 Next.js/Vercel 안에 어떻게 들어가는지 보여주는 참고 구현으로도 흥미롭다. 저장소를 입력하면 source-cited wiki, navigation, repository chat, refresh schedule까지 한 제품 안에서 이어지는 구조가 명확하다.

바로 추천할 대상은 공개 오픈소스 프로젝트를 많이 읽는 개발자, developer relations 팀, AI coding workflow를 설계하는 팀이다. “이 저장소를 에이전트와 사람이 같이 이해할 수 있는 wiki로 빠르게 바꿔보자”는 실험에는 잘 맞는다.

반대로 license가 명확해야 하는 회사 adoption, private repo indexing, 장기 운영 비용이 민감한 public service에는 아직 조심스럽다. 현재는 release/tag도 없고 package가 private이며 LICENSE도 확인되지 않는다. 먼저 Vercel preview나 개인 fork에서 공개 repository 한두 개로 quality/cost/rate-limit을 확인한 뒤, license와 storage policy가 정리되는지 지켜보는 접근이 좋다.

## 참고한 공개 자료

- [OpenWiki official website](https://openwiki.sh/)
- [vercel-labs/openwiki GitHub repository](https://github.com/vercel-labs/openwiki)
- [OpenWiki README](https://github.com/vercel-labs/openwiki/blob/main/README.md)
- [OpenWiki package.json](https://github.com/vercel-labs/openwiki/blob/main/package.json)
- [OpenWiki `.env.example`](https://github.com/vercel-labs/openwiki/blob/main/.env.example)
- [repository API route](https://github.com/vercel-labs/openwiki/blob/main/app/api/repositories/route.ts)
- [indexing job runner](https://github.com/vercel-labs/openwiki/blob/main/agent/lib/indexing/run-index-job.ts)
- [repository refresh schedule](https://github.com/vercel-labs/openwiki/blob/main/agent/schedules/refresh-repositories.ts)
- [LangChain OpenWiki CLI repository for name-collision comparison](https://github.com/langchain-ai/openwiki)
