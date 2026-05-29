---
title: "Claude-BugHunter는 Claude Code를 버그헌팅·외부 레드팀 워크플로로 바꾸는 51개 스킬 번들이다"
date: "2026-05-29T14:34:07"
description: "elementalsouls/Claude-BugHunter는 Claude Code에 51개 보안 스킬, 15개 slash command, hunt/cbh CLI를 설치해 버그헌팅·외부 레드팀의 범위 확인, 정찰, 취약점 탐색, 검증, 보고서 작성을 단계화하는 MIT 오픈소스 번들이다."
author: "Sangmin Lee"
repository: "elementalsouls/Claude-BugHunter"
sourceUrl: "https://github.com/elementalsouls/Claude-BugHunter"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
tags:
  - "Claude Code"
  - "AI Security"
  - "Bug Bounty"
  - "Red Team"
  - "Agent Skills"
  - "CLI"
highlights:
  - "Claude Code의 ~/.claude/skills와 ~/.claude/commands에 51개 보안 스킬과 15개 slash command를 복사해, 프롬프트 주제에 맞는 hunt-* 스킬이 자동으로 잡히도록 만든다."
  - "Scope → Recon → Hunt → Validate → Capture → Report의 6단계 흐름, 7-Question Gate, 증거 위생, Bugcrowd/HackerOne류 보고서 템플릿을 한 번에 묶는다."
  - "hunt 셸 함수는 ~/Targets/<target>/에 scope.md, findings, evidence, submissions.txt, notes.md, CLAUDE.md를 만들어 단일 타깃 조사 폴더를 표준화한다."
  - "cbh Python CLI는 recon, classify, triage, report를 터미널에서 deterministic하게 실행하는 보조 인터페이스이며 Burp proxy 옵션도 제공한다."
  - "공격 지식과 로컬 Claude 설정을 함께 설치하는 번들이므로 허가된 자산, 프로그램 scope, ~/.claude 변경 범위, Burp/API 키, 보고서 증거의 PII·쿠키 redaction을 먼저 확인해야 한다."
draft: false
---

`elementalsouls/Claude-BugHunter`는 Claude Code를 위한 **버그헌팅·외부 레드팀 스킬 번들**이다. 일반적인 스캐너나 자동 공격 도구라기보다, Claude Code가 보안 리서처처럼 범위를 확인하고, 정찰하고, 취약점 후보를 좁히고, 제출 전 검증 게이트를 통과시키고, 보고서 초안을 만드는 데 필요한 지식 파일과 명령 흐름을 묶어 둔 패키지에 가깝다.

저장소가 내세우는 현재 구성은 51개 스킬, 15개 slash command, 681개 공개 리포트 패턴, 24개 취약점 클래스, 그리고 M365/Entra, Okta, vCenter, VPN, SharePoint 같은 엔터프라이즈 외부 표면 공격 매트릭스다. 핵심 전제는 분명하다. **소유하거나 서면 허가를 받은 자산, bug bounty in-scope 자산, CTF/lab 환경에서만** 쓰라는 것이다.

![Claude-BugHunter banner](/images/tips/claude-bughunter-banner.svg)

## Claude-BugHunter 개요

Claude-BugHunter는 Claude Code의 skill system 위에 올라간다. 설치 스크립트는 저장소의 `skills/*/SKILL.md`를 `~/.claude/skills/`로, `commands/*.md`를 `~/.claude/commands/`로, `scripts/hunt.sh`를 `~/.claude/scripts/`로 복사한다. 이후 Claude Code 안에서 `/hunt`, `/recon`, `/triage`, `/validate`, `/report`, `/chain`, `/autopilot` 같은 명령을 쓰거나, 취약점 유형을 평문으로 설명하면 관련 스킬이 자동으로 로드되는 식이다.

공식 architecture 문서는 전체 흐름을 6단계로 잡는다.

![Claude-BugHunter architecture overview](/images/tips/claude-bughunter-architecture-overview.svg)

이 구조에서 중요한 점은 “공격 페이로드 모음”만 있는 것이 아니라는 점이다.

- **Scope / Recon**: 프로그램 범위, out-of-scope 조항, 서브도메인·OSINT·identity fabric을 정리한다.
- **Hunt**: XSS, SSRF, IDOR, GraphQL, OAuth, SAML, race condition, cache poisoning, file upload, SharePoint, NTLM info disclosure 등 `hunt-*` 스킬로 취약점 클래스를 좁힌다.
- **Validate**: `triage-validation`의 7-Question Gate로 “지금 제출해도 되는 finding인가”를 먼저 걸러낸다.
- **Capture / Report**: cookie, HAR, PII redaction과 HackerOne/Bugcrowd/Intigriti/Immunefi 스타일 보고서 작성을 지원한다.

v2.0 릴리스는 일부 `hunt-*` 스킬의 공개 리포트 backfill, 누락된 표면 추가, CVE chain, engagement 문서 보강을 업데이트 포인트로 적고 있다. 다만 문서 안에는 아직 “574+”처럼 이전 수치가 남아 있는 곳도 있어, 정확한 카운트는 README와 최신 릴리스 노트를 함께 보는 편이 좋다.

## 설치와 첫 사용법

공식 설치 흐름은 GitHub checkout에서 스크립트를 실행하는 방식이다.

```bash
mkdir -p ~/security-research
cd ~/security-research
git clone https://github.com/elementalsouls/Claude-BugHunter.git
cd Claude-BugHunter

chmod +x scripts/install.sh
./scripts/install.sh
```

이 스크립트는 같은 이름의 기존 Claude skill/command가 있으면 timestamp가 붙은 backup 디렉터리로 옮긴 뒤 새 파일을 복사한다. `hunt` 셸 함수도 `~/.zshrc` 또는 `~/.bashrc`에 `source ~/.claude/scripts/hunt.sh`를 추가한다. 즉 “그냥 문서만 내려받는” 설치가 아니라 Claude Code의 사용자 설정 영역과 shell rc 파일을 실제로 바꾸는 설치다.

설치 후에는 새 터미널에서 다음처럼 engagement 폴더를 만든다.

```bash
hunt acme-test
```

기본 위치는 `~/Targets/acme-test/`이고, 그 아래에 `CLAUDE.md`, `scope.md`, `findings/`, `evidence/`, `submissions.txt`, `notes.md`, `.gitignore`가 만들어진다. 특히 `evidence/`는 screenshots, HAR, raw transcript처럼 쿠키나 PII가 섞이기 쉬운 파일을 두는 위치이며 `.gitignore`에 들어간다.

Claude Code 안에서는 새 폴더에서 `claude`를 열고 프로그램 페이지를 `scope.md`로 정리하거나, 특정 URL을 보고 “IDOR가 의심된다”, “OAuth callback을 테스트 중이다”처럼 말하면 관련 스킬이 로드되는 흐름을 기대하면 된다.

## `cbh` CLI는 무엇을 해 주나

저장소에는 보조 인터페이스로 `scripts/cbh.py`도 들어 있다. 공식 문서는 slash command가 Claude Code 안의 주 인터페이스이고, `cbh`는 CI, scripted run, deterministic verification, Claude Code 밖에서 읽고 검증할 때 쓰는 터미널 runner라고 설명한다.

설치 예시는 다음과 같다.

```bash
chmod +x scripts/cbh.py
ln -sf "$(pwd)/scripts/cbh.py" /usr/local/bin/cbh
cbh --help
```

현재 `cbh`의 subcommand는 네 가지다.

- `cbh recon <target>`: crt.sh와 선택적 `subfinder`로 passive subdomain enumeration을 하고, DNS resolution과 HTTP probe 결과를 `recon/<target>/` 아래에 쓴다.
- `cbh classify <url>`: URL 패턴을 보고 `hunt-idor`, `hunt-ssrf`, `hunt-graphql`, `hunt-oauth` 같은 후보 스킬을 추천한다.
- `cbh triage <finding.md>`: finding 문서를 7-Question Gate로 검사해 PASS, DOWNGRADE, KILL을 반환한다.
- `cbh report <finding.md>`: HackerOne, Bugcrowd, Intigriti, Immunefi용 보고서 초안 구조를 만든다.

Burp Suite를 쓰는 팀이라면 `--burp` 또는 `--proxy http://127.0.0.1:8080`으로 `cbh`의 HTTP 요청을 Burp proxy에 남길 수 있다. 별도로 Burp MCP Server를 Claude Code에 등록하면 Claude가 Burp proxy history를 읽고 Repeater 흐름을 대화형으로 도와주는 구성이 된다. Burp가 없으면 curl-only/stdlib HTTP 모드로도 동작하도록 설계되어 있다.

## 어디에 잘 맞는가

Claude-BugHunter가 잘 맞는 사용자는 “보안 테스트를 Claude에게 통째로 맡기고 싶다”보다 “이미 허가된 테스트를 하고 있는데, 방법론·검증·보고의 누락을 줄이고 싶다”에 가깝다.

좋은 사용처는 다음과 같다.

- bug bounty 프로그램을 시작할 때 scope, focus area, bounty band, OOS 조항을 먼저 정리하는 경우
- OWASP Juice Shop, Hacker101, testphp.vulnweb.com 같은 lab에서 junior researcher 교육 루프를 만들고 싶은 경우
- Burp와 Claude Code를 함께 쓰면서 request/response, evidence, report draft를 일관된 폴더 구조로 남기고 싶은 경우
- IDOR, SSRF, OAuth, GraphQL, SAML, file upload처럼 반복적으로 놓치는 취약점 클래스별 checklist가 필요한 경우
- finding 초안을 쓰기 전 7-Question Gate로 “제출 가능한 impact인가, scope 안인가, privileged-only가 아닌가, never-submit 유형은 아닌가”를 강제로 확인하고 싶은 경우

반대로 일반 웹 취약점 자동 스캐너나 내부 AD/post-exploit 툴을 기대한다면 방향이 맞지 않는다. SECURITY와 architecture 문서는 내부 Active Directory 공격, C2, persistence, lateral movement, evasion, iOS pentest, binary/kernel/browser exploitation을 의도적으로 제외한다고 적고 있다.

## 도입 전 주의할 점

Claude-BugHunter는 유용하지만 권한과 책임 범위가 큰 도구다. 특히 아래는 설치 전에 확인해야 한다.

- **반드시 허가된 범위에서만 사용해야 한다.** SECURITY.md는 소유 자산, 서면 허가된 pentest, bug bounty in-scope, CTF/lab, synthetic target을 사용처로 제한한다. unauthorized scanning, 0-day weaponization, credential stuffing, supply-chain compromise, DoS류 사용은 명시적으로 제외된다.
- **`~/.claude`와 shell rc를 바꾼다.** `scripts/install.sh`는 skills, commands, scripts를 복사하고 `~/.zshrc` 또는 `~/.bashrc`에 source line을 추가한다. 외부 agent instruction을 들여오는 행위이므로 diff를 보고, 기존 skill backup이 생기는 위치를 확인하는 편이 안전하다.
- **스킬 자체가 Claude의 행동 정책이 된다.** `SKILL.md`와 slash command는 Claude Code가 어떤 절차를 따를지 지시한다. 보안 실무용 instruction bundle인 만큼, 팀 환경에서는 버전 pinning과 리뷰 절차가 필요하다.
- **`cbh recon`은 네트워크 관측을 수행한다.** passive CT 조회와 HTTP probe를 포함하므로 scope, rate limit, 프로그램 rules of engagement를 먼저 확인해야 한다. 예시 target을 실제 제3자 도메인으로 바꿀 때 특히 조심해야 한다.
- **Burp/API 연동은 로컬 프록시와 키를 다룬다.** Burp proxy, Burp MCP, `public-skills-builder`의 Anthropic/HackerOne API key 설정은 편하지만, 프록시 로그·API 키·비용·scope가 섞인다. `.env`와 Burp project file을 public repo나 screenshot에 흘리지 않아야 한다.
- **증거 폴더에도 민감 데이터가 쌓인다.** 저장소는 `evidence-hygiene`을 따르라고 강조하지만, 실제 screenshot, HAR, raw response에는 쿠키, bearer token, 다른 사용자 PII가 들어갈 수 있다. 제출 전 redaction과 post-submission credential rotation을 workflow에 넣어야 한다.
- **라이선스 표시는 약간의 표면 차이가 있다.** 체크인된 `LICENSE`는 MIT이며 추가 note에서 원저작물은 MIT, upstream community skill 설치 recipe는 각 원 라이선스를 따른다고 설명한다. GitHub API는 license를 `Other/NOASSERTION`으로 잡으므로, 재배포나 사내 배포 전에는 LICENSE와 `docs/credits.md`를 같이 확인하는 것이 좋다.

## 내 판단

Claude-BugHunter는 “Claude가 보안 전문가가 된다”는 식의 과장된 자동화보다, **Claude Code 세션에 보안 방법론과 제출 전 discipline을 주입하는 스킬 팩**으로 볼 때 가치가 크다. 버그헌팅 초보자에게는 scope 확인, 두 계정 검증, impact 증명, evidence redaction 같은 기본기를 강제하는 가드레일이 되고, 숙련자에게는 반복적인 report scaffolding과 취약점 클래스별 checklist를 줄여 주는 생산성 도구가 된다.

나는 바로 실전 bounty 프로그램에 붙이기보다는, 먼저 OWASP Juice Shop이나 Hacker101 같은 연습 환경에서 설치 스크립트가 `~/.claude`에 무엇을 복사하는지 확인하고, `hunt <target>` 폴더 구조와 `/triage` 흐름을 익힌 뒤 쓰는 쪽을 추천한다. 특히 팀 장비나 회사 계정에서는 agent skill 설치, Burp MCP, API key, evidence 저장소가 모두 보안 정책의 일부가 되므로 “도구 설치”가 아니라 “보안 워크플로 정책 도입”으로 취급해야 한다.

## 참고한 공개 자료

- [elementalsouls/Claude-BugHunter GitHub repository](https://github.com/elementalsouls/Claude-BugHunter)
- [Claude-BugHunter README](https://github.com/elementalsouls/Claude-BugHunter/blob/main/README.md)
- [Claude-BugHunter Installation Guide](https://github.com/elementalsouls/Claude-BugHunter/blob/main/INSTALL.md)
- [Claude-BugHunter Usage Guide](https://github.com/elementalsouls/Claude-BugHunter/blob/main/USAGE.md)
- [Claude-BugHunter Security Policy](https://github.com/elementalsouls/Claude-BugHunter/blob/main/SECURITY.md)
- [Claude-BugHunter Architecture](https://github.com/elementalsouls/Claude-BugHunter/blob/main/docs/architecture.md)
- [cbh CLI documentation](https://github.com/elementalsouls/Claude-BugHunter/blob/main/docs/cbh-cli.md)
- [Claude-BugHunter v2.0 release](https://github.com/elementalsouls/Claude-BugHunter/releases/tag/v2.0)
