---
title: "Academic Research Skills는 연구–논문–리뷰 파이프라인을 Claude Code 스킬로 묶은 학술 Copilot이다"
date: "2026-05-29T15:01:29"
description: "Imbad0202/academic-research-skills는 Claude Code용 학술 연구 스킬 4종, 10단계 파이프라인, citation/integrity gate, peer-review workflow를 묶은 CC BY-NC 4.0 source-available suite다."
author: "Sangmin Lee"
repository: "Imbad0202/academic-research-skills"
sourceUrl: "https://github.com/Imbad0202/academic-research-skills"
status: "Source available"
license: "CC BY-NC 4.0"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Agent Skills"
  - "Claude Code"
  - "Academic Writing"
  - "Research Workflow"
  - "Peer Review"
highlights:
  - "`deep-research`, `academic-paper`, `academic-paper-reviewer`, `academic-pipeline` 4개 SKILL.md와 `/ars-*` slash command를 묶은 Claude Code 중심 학술 연구 suite다."
  - "10단계 파이프라인, Stage 2.5/4.5 integrity gate, Material Passport, citation/claim audit, temporal verification 같은 장치를 통해 연구자가 승인하는 human-in-the-loop 흐름을 강하게 둔다."
  - "README 기준 설치는 Claude Code plugin marketplace의 `/plugin marketplace add Imbad0202/academic-research-skills`와 `/plugin install academic-research-skills`가 가장 빠른 경로다."
  - "라이선스는 CC BY-NC 4.0이라 비상업 학술 사용에 맞춘 source-available 배포로 보는 편이 정확하며, 상업 SaaS나 유료 컨설팅 재포장은 별도 확인이 필요하다."
  - "긴 pipeline은 토큰·모델 비용과 API key, 문헌 corpus, 원고 데이터 경계를 동반하므로 개인/연구실 환경에서는 필요한 skill 또는 mode부터 좁게 시험하는 편이 안전하다."
draft: false
---

`Academic Research Skills`는 논문을 대신 써주는 자동화 도구라기보다, Claude Code 안에서 **연구–작성–검토–수정–최종화** 흐름을 구조화하는 학술 연구용 Agent Skills 묶음이다. 저장소 이름은 `Imbad0202/academic-research-skills`이고, README는 “AI is your copilot, not the pilot”이라는 문장으로 이 도구의 포지션을 분명히 한다.

핵심은 연구자가 계속 판단권을 갖는 human-in-the-loop다. 문헌 검색, citation check, style calibration, peer review, response-to-reviewer, AI disclosure 같은 반복 작업은 에이전트가 도와주되, 연구 질문·방법론·해석·최종 문장은 사람이 확인해야 한다는 설계다.

조사 시점 기준 GitHub API의 primary language는 Python, license 감지는 `Other`이고, checked-in `LICENSE`와 `POSITIONING.md`는 CC BY-NC 4.0을 명시한다. 그래서 일반적인 OSI식 “오픈소스 라이브러리”라기보다는 **비상업 학술 사용을 전제로 공개된 source-available workflow suite**로 보는 편이 정확하다.

![Academic Research Skills pipeline](/images/tips/academic-research-skills-hero.png)

## 무엇을 담고 있나

저장소의 사용자-facing 단위는 4개 `SKILL.md`다. 루트에는 Claude Code plugin metadata, slash command, agent prompt, reference 문서, schema/lint script, example showcase가 함께 들어 있다.

| 스킬 | README 기준 역할 | 대표 모드 |
|---|---|---|
| `deep-research` | 13-agent research team | full, quick, review, lit-review, fact-check, socratic, systematic-review |
| `academic-paper` | 12-agent paper writing pipeline | full, plan, outline-only, revision, abstract-only, citation-check, disclosure 등 |
| `academic-paper-reviewer` | 7-agent multi-perspective peer review | full, re-review, quick, methodology-focus, guided, calibration |
| `academic-pipeline` | 10-stage orchestrator | 연구부터 최종 산출물까지 단계별 checkpoint와 resume 흐름 |

`MODE_REGISTRY.md`는 전체 25개 mode를 single source of truth로 정리한다. 예를 들어 deep research는 빠른 brief부터 PRISMA systematic review까지, paper writing은 outline-only부터 LaTeX/DOCX/PDF 변환까지, reviewer는 EIC와 3명의 동적 reviewer, Devil’s Advocate를 포함한 다중 관점 평가까지 다룬다.

이 저장소가 흥미로운 이유는 “논문 써줘” 프롬프트가 아니라 **논문 작업 중 자주 실패하는 지점을 gate와 artifact로 고정**하려 한다는 점이다. Architecture 문서는 Stage 2.5와 Stage 4.5 integrity gate, R&R traceability matrix, Material Passport, corpus adapter, compliance agent, collaboration-depth observer 같은 장치를 한 파이프라인 안에 배치한다.

## 설치와 첫 시작

README가 권장하는 빠른 설치 경로는 Claude Code plugin이다.

```text
/plugin marketplace add Imbad0202/academic-research-skills
/plugin install academic-research-skills
```

설치 후에는 `/ars-plan`으로 논문 구조를 Socratic dialogue로 잡아 보거나, 단발성 테스트로 `/ars-lit-review "your topic"`을 실행하는 흐름을 안내한다. 전통적인 설치 경로도 있다. 저장소를 clone한 뒤 네 개 skill folder를 `~/.claude/skills/` 아래 symlink하거나 copy하는 방식이다.

```bash
git clone https://github.com/Imbad0202/academic-research-skills.git ~/academic-research-skills
mkdir -p ~/.claude/skills
ln -s ~/academic-research-skills/deep-research ~/.claude/skills/deep-research
ln -s ~/academic-research-skills/academic-paper ~/.claude/skills/academic-paper
ln -s ~/academic-research-skills/academic-paper-reviewer ~/.claude/skills/academic-paper-reviewer
ln -s ~/academic-research-skills/academic-pipeline ~/.claude/skills/academic-pipeline
```

선택 의존성도 있다. DOCX 출력은 Pandoc, APA 7.0 PDF 출력은 `tectonic`과 Source Han Serif TC가 있으면 좋다고 설명한다. Codex CLI 사용자는 같은 workflow content를 Codex-native packaging으로 옮긴 sibling repo `Imbad0202/academic-research-skills-codex`를 보라고 README가 별도로 안내한다.

## 왜 유용한가

학술 글쓰기에서 LLM을 쓸 때 가장 위험한 실패는 “그럴듯하지만 틀린” 작업이 조용히 통과하는 것이다. ARS는 이 문제를 몇 가지 레이어로 쪼갠다.

- **문헌·인용 검증**: Semantic Scholar verification, cite-time provenance, three-layer citation anchor, OpenAlex/Crossref triangulation 같은 흐름을 통해 citation surface를 계속 노출한다.
- **claim-faithfulness audit**: v3.8부터 `ARS_CLAIM_AUDIT=1` opt-in으로, 인용된 passage가 실제 claim을 지지하는지 Stage 4→5 사이에서 감사하는 장치를 둔다.
- **temporal verification**: v3.9.4 계열은 timeline extraction과 temporal integrity audit을 추가해 retrospective arithmetic, anachronistic citation, comparator unmaterialized, causal-date inversion 같은 시간 오류를 advisory로 잡는다.
- **Material Passport**: 긴 연구 세션을 한 번에 끌고 가기보다, checkpoint와 artifact ledger를 통해 resume하거나 corpus를 넘기는 방식을 갖춘다.
- **peer-review structure**: reviewer sprint contract, concession threshold, Devil’s Advocate, re-review, response matrix를 통해 “AI가 좋은 말만 해주는” 흐름을 늦춘다.

즉, ARS는 완전 자동 논문 생성기가 아니라 연구자의 판단을 늦추거나 대체하지 않도록 **검증·승인·재개 지점을 많이 만든 스킬 세트**에 가깝다.

## 실제로 쓰기 좋은 경우

개인 연구자나 대학원생이라면 처음부터 full pipeline을 돌리기보다, 작업 단계별로 좁게 쓰는 편이 현실적이다.

- 읽을 논문이 많을 때: `deep-research`의 quick, lit-review, fact-check 모드로 research brief나 annotated bibliography를 만든다.
- 논문 구조가 막힐 때: `/ars-plan` 또는 `academic-paper` plan mode로 연구 질문, chapter plan, evidence map을 대화형으로 정리한다.
- 이미 초안이 있을 때: `academic-paper-reviewer` quick/full/methodology-focus로 reviewer 시뮬레이션을 돌리고, `revision-coach`로 응답 전략을 만든다.
- systematic review처럼 산출물과 trace가 중요한 작업: `academic-pipeline`과 Material Passport, corpus adapter를 같이 검토한다.
- 투고 전 점검: citation-check, disclosure, format-convert, Stage 4.5 integrity gate를 별도 체크리스트처럼 쓴다.

연구실 단위로는 “우리 랩의 논문 작성 SOP를 Claude Code skill로 표준화할 수 있을까?”를 검토하는 출발점으로 좋다. 다만 그 경우에도 곧바로 전체 suite를 전역 설치하기보다, 프로젝트-local skill folder나 fork에서 필요한 mode만 고르는 편이 안전하다.

## 버전과 배포 표면

여기서는 버전 표면을 분리해서 봐야 한다. README badge와 `.claude-plugin/plugin.json`은 `3.9.4.2`를 가리키고, tag도 `v3.9.4.2`까지 올라와 있다. 반면 GitHub Releases의 `Latest` 표시는 조사 시점 기준 `v3.9.2`다. 즉 “최신 GitHub Release”, “최신 tag”, “README에 적힌 plugin version”, “현재 main branch”가 항상 같은 의미는 아니다.

팀에서 재현성을 중요하게 본다면 `main`을 그대로 따라가기보다 검토한 tag나 commit을 기록하고, 설치 후 `SKILL.md`, `commands/`, `agents/`, `hooks/`, `scripts/`가 실제 프로젝트에 어떤 지침과 실행 표면을 추가하는지 diff로 남기는 편이 좋다.

## 주의할 점

첫째, 라이선스다. `POSITIONING.md`는 ARS를 noncommercial scholarly use를 위한 source-available academic research copilot framework로 정의하고, CC BY-NC 4.0은 open source license가 아니라고 명시한다. 개인 연구·수업·비상업 연구실 협업에는 맞지만, commercial SaaS, 유료 컨설팅, enterprise deployment, API wrapper 재판매는 별도 라이선스 확인이 필요하다.

둘째, Claude Code 전용성이 강하다. 설치 문서는 claude.ai Project로 repo content를 읽히는 방법도 설명하지만, 실제 multi-agent orchestration, Task/subagent tooling, Material Passport handoff는 Claude Code/Cowork 쪽 assumptions가 강하다. 웹 Claude custom skill upload는 기계적으로 가능하더라도 이 suite에는 권장하지 않는다고 SETUP 문서가 길게 설명한다.

셋째, 비용과 권한이다. `docs/PERFORMANCE.md`는 15,000-word paper와 60 references 기준 full 10-stage pipeline이 200K+ input, 100K+ output token을 넘고, Opus 4.7 기준 대략 $4–6 범위가 될 수 있다고 적는다. `claude --dangerously-skip-permissions`처럼 편한 설정은 긴 파이프라인에는 유혹적이지만, 파일 읽기·쓰기·shell command 승인 안전망을 줄인다.

넷째, 연구 데이터 경계다. 논문 초안, reviewer comment, Zotero/Obsidian corpus, unpublished data, API key, institutional access context가 함께 움직일 수 있다. ARS 자체는 여러 검증 장치를 두지만, 어떤 자료를 에이전트에게 넘길지와 어떤 외부 모델/API를 쓸지는 연구자가 별도로 정해야 한다.

## 내 판단

Academic Research Skills는 “AI에게 논문을 맡기고 싶다”는 사람보다, **AI를 쓰되 연구 과정의 검증·승인·추적을 잃고 싶지 않은 사람**에게 더 잘 맞는다. 특히 literature review, peer review simulation, revision response, citation check처럼 반복되지만 품질 리스크가 큰 작업에서 가치가 크다.

반대로 가벼운 글쓰기 보조만 필요하다면 너무 무겁다. 4개 skill, 25개 mode, 수십 개 agent prompt, 100개가 넘는 Python script와 schema/lint가 붙어 있어 학습 비용이 있다. 개인 사용자는 `/ars-plan`이나 `academic-paper-reviewer quick`처럼 작게 시작하고, 연구실/팀은 license와 데이터 경계, version pinning을 먼저 정한 뒤 도입하는 쪽을 추천한다.

한 줄로 정리하면: ARS는 논문을 자동으로 써주는 버튼이 아니라, 연구자가 AI와 함께 논문을 만들 때 **어디서 멈추고, 무엇을 검증하고, 어떤 artifact를 남길지**를 강하게 제안하는 Claude Code 학술 workflow suite다.

## 참고한 공개 자료

- [Imbad0202/academic-research-skills GitHub repository](https://github.com/Imbad0202/academic-research-skills)
- [Academic Research Skills README](https://github.com/Imbad0202/academic-research-skills/blob/main/README.md)
- [POSITIONING.md](https://github.com/Imbad0202/academic-research-skills/blob/main/POSITIONING.md)
- [MODE_REGISTRY.md](https://github.com/Imbad0202/academic-research-skills/blob/main/MODE_REGISTRY.md)
- [docs/ARCHITECTURE.md](https://github.com/Imbad0202/academic-research-skills/blob/main/docs/ARCHITECTURE.md)
- [docs/SETUP.md](https://github.com/Imbad0202/academic-research-skills/blob/main/docs/SETUP.md)
- [docs/PERFORMANCE.md](https://github.com/Imbad0202/academic-research-skills/blob/main/docs/PERFORMANCE.md)
- [academic-pipeline/SKILL.md](https://github.com/Imbad0202/academic-research-skills/blob/main/academic-pipeline/SKILL.md)
- [Claude plugin metadata](https://github.com/Imbad0202/academic-research-skills/blob/main/.claude-plugin/plugin.json)
- [Academic Research Skills GitHub Releases](https://github.com/Imbad0202/academic-research-skills/releases)
