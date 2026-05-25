---
title: "Claude Plugins는 Agent Skills를 검색·설치하는 공개 레지스트리다"
date: "2026-05-25T16:52:32"
description: "claude-plugins.dev는 GitHub의 공개 Claude Code plugin과 Agent Skills를 색인하고, skills-installer CLI와 meta skill로 Claude Code·Codex·Cursor·OpenCode 같은 에이전트에 설치 흐름을 연결하는 커뮤니티 레지스트리다."
author: "Sangmin Lee"
repository: "Kamalnrf/claude-plugins"
sourceUrl: "https://claude-plugins.dev/skills"
status: "Source available registry"
license: "MIT metadata; no root LICENSE"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Agent Skills"
  - "Claude Code"
  - "AI Agents"
  - "CLI"
  - "Registry"
  - "Developer Tools"
highlights:
  - "claude-plugins.dev는 조사 시점 live API 기준 49,089개 Agent Skills와 38,171개 Claude Code plugin을 검색·정렬·설치 링크로 보여준다."
  - "`skills-installer` npm 최신 버전은 0.3.1이며, `search`, `install/add`, `list`로 공개 GitHub skill을 찾아 로컬 agent skill 폴더에 내려받는다."
  - "Claude Code는 `~/.claude/skills`, Codex·Cursor·OpenCode·Gemini CLI 등은 shared `.agents/skills` alias, OpenClaw/Pi는 별도 경로를 쓰는 구조다."
  - "`skills-discovery` meta skill을 설치하면 에이전트가 registry API를 검색하고 후보를 비교한 뒤 확인을 받아 설치하는 워크플로를 배울 수 있다."
  - "외부 SKILL.md는 에이전트 행동 지침이므로, 자동 색인된 public repo 품질·라이선스·설치 analytics·GitHub token pool 참여 범위를 확인해야 한다."
draft: false
---

AI 에이전트의 `SKILL.md` 생태계가 커지면서, 문제는 “스킬을 어떻게 쓰나”보다 “어디서 찾고, 어떤 에이전트에 안전하게 넣나”에 가까워지고 있다. Anthropic 공식 skill, 개인 GitHub 저장소, 팀 내부 runbook, Claude Code plugin이 섞이기 시작하면 수동 복사만으로는 금방 한계가 온다.

`Claude Plugins`는 이 빈틈을 노리는 커뮤니티 레지스트리다. 웹에서는 `claude-plugins.dev`가 공개 GitHub 저장소의 Claude Code plugin과 Agent Skills를 색인하고, 터미널에서는 `claude-plugins`와 `skills-installer` CLI가 검색·설치 흐름을 담당한다. 이름은 Claude 중심이지만, Agent Skills 쪽은 Claude Code뿐 아니라 Codex, Cursor, OpenCode, Gemini CLI, VS Code 계열처럼 `.agents/skills` 또는 개별 skill directory를 읽는 클라이언트까지 겨냥한다.

조사 시점 기준 저장소 `Kamalnrf/claude-plugins`는 TypeScript 중심의 source-available 프로젝트다. GitHub API는 루트 license를 `null`로 보고했고 루트 `LICENSE` 파일도 확인되지 않았지만, README와 npm package metadata는 MIT를 표기한다. 따라서 개인 사용에는 바로 참고할 수 있지만, 팀 표준 도구로 재배포하거나 fork할 때는 라이선스 파일 상태를 다시 확인하는 편이 안전하다.

![Claude Plugins Agent Skills registry](/images/tips/claude-plugins-skills-registry.png)

## 무엇을 제공하나

제품은 크게 세 층으로 나뉜다.

1. **웹 레지스트리**: `https://claude-plugins.dev/skills`에서 Agent Skills를 검색하고, 별도 탭에서 Claude Code plugin도 둘러본다.
2. **설치 CLI**: `skills-installer`는 Agent Skills용, `claude-plugins`는 Claude Code plugin용 CLI다.
3. **meta skill**: `skills-discovery`는 에이전트가 직접 registry API를 검색하고, 후보를 비교하고, 사용자의 확인을 받아 설치하도록 가르치는 `SKILL.md`다.

웹 페이지의 live API는 조사 시점에 Agent Skills 49,089개, Claude Code plugin 38,171개를 반환했다. README에는 더 큰 수치가 적혀 있었는데, 자동 색인 레지스트리 특성상 문서·메타 태그·실시간 API 숫자가 서로 조금씩 어긋날 수 있다. 글을 쓰거나 팀 문서에 인용할 때는 페이지 배지보다 API 응답을 한 번 확인하는 쪽이 낫다.

Agent Skills 화면은 검색창, relevance/downloads/stars 정렬, install 버튼, stars·installs 지표를 가진 카드 목록으로 구성된다. 상단에는 `skills-discovery` meta skill이 따로 강조되어 있어, “웹에서 사람이 찾는 registry”와 “에이전트가 터미널에서 찾는 registry”를 연결하려는 의도가 분명하다.

## 설치와 첫 사용법

Agent Skills 쪽의 기본 흐름은 `skills-installer`다. npm 최신 버전은 조사 시점 기준 `0.3.1`이고, package description은 “agentskills.io를 지원하는 여러 client에 agent skills를 설치한다”는 쪽이다.

```bash
npx skills-installer search frontend
npx skills-installer install @anthropics/claude-code/frontend-design --client claude-code
npx skills-installer install @Kamalnrf/claude-plugins/skills-discovery --client claude-code
```

프로젝트 단위로만 넣고 싶다면 최신 CLI help 기준 `--project` 또는 `-p`를 쓰는 흐름이 더 자연스럽다. README와 meta skill에는 아직 `--local` 예시가 남아 있는데, 소스의 CLI entrypoint는 `--local`을 deprecated alias로 안내하고 `--project`를 우선한다.

```bash
npx skills-installer install anthropics/claude-code/frontend-design --project
npx skills-installer add anthropics/claude-code --all --project
npx skills-installer list
```

Claude Code plugin 자체를 설치하는 별도 CLI도 있다.

```bash
npm install -g claude-plugins
claude-plugins install @EveryInc/every-marketplace/compound-engineering
```

여기서 plugin과 skill은 구분해서 봐야 한다. Claude Code plugin은 `~/.claude/plugins/marketplaces/` 쪽에 들어가는 marketplace/plugin 구조이고, Agent Skill은 `SKILL.md`를 가진 skill directory를 각 에이전트가 읽는 구조다. `claude-plugins.dev`는 둘을 같은 사이트에서 보여주지만 설치 대상과 실행 의미는 다르다.

## 어떤 경로에 설치되나

`skills-installer`의 흥미로운 점은 여러 에이전트를 “하나의 shared skill 폴더”와 “개별 client 폴더”로 나눠 다룬다는 점이다. 소스 기준 primary config는 다음 네 가지다.

- `shared`: 전역 `~/.agents/skills`, 프로젝트 `./.agents/skills`
- `claude-code`: 전역 `~/.claude/skills`, 프로젝트 `./.claude/skills`
- `openclaw`: 전역 `~/.openclaw/skills`, `~/.clawdbot/skills`, `~/.moltbot/skills` 중 존재하는 경로, 프로젝트 `./skills`
- `pi`: 전역 `~/.pi/agent/skills`, 프로젝트 `./.pi/skills`

Codex, Cursor, OpenCode, Gemini CLI, VS Code, GitHub Copilot, Amp, Warp, Cline, Antigravity 같은 이름은 대부분 `shared` alias로 매핑된다. 즉 “Codex 전용 설치 경로를 모든 환경에서 자동으로 찾는다”기보다는, 여러 client가 읽을 수 있는 `.agents/skills` convention에 넣는 방식에 가깝다. 이미 각 도구가 다른 skill path를 쓰도록 커스터마이즈한 환경이라면 설치 후 실제 파일 위치를 확인해야 한다.

다운로드는 registry가 반환한 GitHub skill URL을 `giget`으로 내려받고, 대상 폴더에 `SKILL.md`가 있는지 검증한다. 설치가 성공하면 registry 쪽 install count를 올리는 fire-and-forget analytics POST도 보낸다. 민감한 조직 환경에서는 이 정도의 네트워크 호출도 policy에 맞는지 확인하는 편이 좋다.

## skills-discovery meta skill

이 프로젝트가 단순 웹 카탈로그와 다른 부분은 `skills-discovery` 자체도 하나의 skill로 제공한다는 점이다.

```bash
npx skills-installer install @Kamalnrf/claude-plugins/skills-discovery
```

이 skill은 에이전트에게 다음 workflow를 가르친다.

- 현재 설치된 skill로 충분한지 먼저 판단한다.
- 부족하면 `https://claude-plugins.dev/api/skills?q=QUERY&limit=20&offset=0` 형태의 API를 검색한다.
- 후보를 3~5개 정도로 압축해서 name, namespace, description, stars, installs를 보여준다.
- 설치 전에는 사용자 확인을 받는다.
- 설치 후에도 skill이 실제로 작동하려면 client 재시작이나 경로 확인이 필요할 수 있음을 안내한다.

이건 꽤 실용적인 방향이다. 사람에게 “좋은 skill을 검색해봐”라고 매번 말하는 대신, 에이전트가 작업 전에 “이 분야에 이미 특화 skill이 있지 않을까?”를 점검하게 만들 수 있기 때문이다. 다만 meta skill 역시 외부 instruction이다. 그대로 설치하기 전에 본문을 읽고, 현재 사용하는 에이전트의 tool permission 정책과 충돌하지 않는지 보는 것이 좋다.

## 왜 유용한가

개인적으로 이 도구의 가치는 세 가지다.

첫째, **발견 비용을 낮춘다.** `SKILL.md` 저장소는 GitHub 검색만으로 찾기 애매하다. 어떤 저장소는 `.claude/skills`, 어떤 저장소는 `plugins/.../skills`, 어떤 저장소는 루트나 하위 domain 폴더에 넣는다. registry가 이를 한 번 색인해 주면 “PDF 처리”, “frontend”, “Cloud Run”, “pytest” 같은 작업 단위로 찾기 쉬워진다.

둘째, **설치 명령을 표준화한다.** skill URL을 직접 clone하고 폴더를 복사하는 대신, namespace나 GitHub URL을 넘겨 설치할 수 있다. 팀에서 “이 스킬은 Claude Code와 shared `.agents/skills`에 넣어라” 같은 규칙을 만들 때도 명령어로 정리하기 좋다.

셋째, **에이전트가 스스로 도구를 고르는 루프를 만든다.** `skills-discovery`를 통해 search → compare → confirm → install 흐름을 agent instruction으로 만들면, 일반 지식으로 처리하기 어려운 작업에서 specialized skill을 찾는 습관을 강제할 수 있다. Hermes나 Claude Code처럼 skill을 작업 전에 로드하는 agent runtime과 궁합이 좋은 부분이다.

## 주의할 점

첫째, 자동 색인된 public registry라는 점을 잊으면 안 된다. “검색 결과에 나온다”는 것은 “검증된 skill”이라는 뜻이 아니다. 외부 `SKILL.md`는 에이전트에게 절차, 명령어, API 호출, 파일 조작 습관을 주입한다. 설치 전에는 최소한 frontmatter, 본문 명령, references/scripts/assets 포함 여부를 읽어야 한다.

둘째, 라이선스가 정리되어 있지 않다. README와 npm package metadata는 MIT를 말하지만, GitHub API는 license를 감지하지 못했고 루트 `LICENSE` 파일도 없었다. 이 글의 frontmatter를 `Source available registry`로 둔 이유다. 사내 배포나 fork, 패키징을 전제로 한다면 upstream에 라이선스 파일이 추가되었는지 확인하자.

셋째, release surface가 조금 흩어져 있다. GitHub 최신 Release는 `skills-installer@0.2.0`으로 보였지만, npm 최신 `skills-installer`는 `0.3.1`이고 저장소의 `packages/skills-installer/package.json`도 `0.3.1`이었다. 반면 `claude-plugins` npm 패키지는 `0.2.0`이다. CLI를 문서화할 때는 GitHub Release만 보지 말고 npm 버전과 소스 package.json을 같이 확인하는 편이 안전하다.

넷째, GitHub token pool 참여는 별도 판단이 필요하다. README는 registry가 GitHub API rate limit에 가까워지고 있어 OAuth application을 통해 public-read token pool에 참여할 수 있다고 설명한다. 설명상 private repo나 사용자 대신 action을 수행하지 않는 public data read-only 흐름이지만, 개인·회사 계정 토큰을 외부 서비스 pool에 넣는 행위이므로 보안 정책을 먼저 확인해야 한다.

다섯째, client support 표현을 너무 넓게 해석하지 않는 편이 좋다. 사이트와 README는 Claude, Cursor, OpenCode, Codex 등 많은 이름을 언급하지만, 현재 installer source에서는 다수 client가 shared `.agents/skills` alias로 묶인다. 각 에이전트가 그 경로를 실제로 읽는지, global/project scope를 어떻게 우선하는지는 client별 문서를 따로 확인해야 한다.

## 내 판단

`Claude Plugins`는 Agent Skills가 “개별 markdown 파일”에서 “찾고 설치하고 업데이트하는 패키지 생태계”로 넘어가는 중간 단계의 도구다. 지금 당장 완벽한 package manager라기보다는, 공개 GitHub skill을 발견하고 빠르게 시험해보는 registry와 installer에 가깝다.

Claude Code, Codex, Cursor, OpenCode를 번갈아 쓰면서 `SKILL.md`를 적극적으로 모으는 사람에게는 꽤 유용하다. 특히 어떤 작업을 시작하기 전에 “이미 잘 정리된 skill이 있나?”를 검색하는 루틴을 만들고 싶다면 `skills-discovery` meta skill이 좋은 출발점이다.

반대로 보안이 중요한 회사 환경에서는 바로 auto-install 흐름을 켜기보다, registry에서 후보를 찾고 GitHub에서 내용을 읽은 뒤, 검토된 commit 또는 내부 skill catalog로 복사하는 방식이 더 안전하다. 외부 skill은 코드를 실행하지 않더라도 agent의 판단과 명령 제안에 영향을 준다. 이 점을 이해하고 쓰면, `claude-plugins.dev`는 AI 에이전트 도구함을 넓히는 꽤 실용적인 입구가 된다.

## 참고한 공개 자료

- [Claude Plugins Agent Skills registry](https://claude-plugins.dev/skills)
- [Kamalnrf/claude-plugins GitHub repository](https://github.com/Kamalnrf/claude-plugins)
- [claude-plugins README](https://github.com/Kamalnrf/claude-plugins/blob/main/README.md)
- [skills-installer npm package](https://www.npmjs.com/package/skills-installer)
- [claude-plugins npm package](https://www.npmjs.com/package/claude-plugins)
- [skills-discovery SKILL.md](https://github.com/Kamalnrf/claude-plugins/blob/main/skills/skills-discovery/SKILL.md)
- [Agent Skills overview](https://agentskills.io/home)
- [Claude Plugins Val Town registry](https://www.val.town/x/kamalnrf/claude-plugins-registry)
