---
title: "Anthropic은 Claude의 안전을 모델이 아니라 경계로 설계한다"
date: "2026-06-06T21:34:04"
description: "Anthropic Engineering의 Claude containment 글은 claude.ai, Claude Code, Claude Cowork의 서로 다른 격리 구조를 통해 에이전트 보안의 핵심이 행동 감시보다 실행 환경의 blast radius를 제한하는 데 있음을 보여준다."
author: "Sangmin Lee"
category: "safety-privacy"
tags:
  - Anthropic
  - Claude
  - Agent Security
  - Sandboxing
  - Egress Control
  - AI Safety
image: "/images/blog/anthropic-claude-containment-defense-components.webp"
draft: false
---

AI 에이전트 보안에서 가장 쉬운 답은 “모델이 위험한 일을 하지 않도록 더 잘 가르치자”다. 하지만 에이전트가 파일을 읽고, 셸을 실행하고, 네트워크로 나가고, 조직의 내부 도구를 호출하는 순간 이 답은 충분하지 않다. 모델 방어는 확률적이고, 프롬프트 주입은 계속 변하며, 사용자는 승인 피로에 빠진다. 결국 남는 질문은 더 기계적이다. **실패가 일어나더라도 어디까지 망가질 수 있는가.**

Anthropic Engineering의 **How we contain Claude across products**는 이 질문을 제품별 containment architecture로 풀어낸 글이다. 대상은 claude.ai의 코드 실행, Claude Code, Claude Cowork 세 가지다. 같은 Claude라도 사용자가 누구인지, 어디서 실행되는지, 어떤 파일과 네트워크에 닿아야 하는지에 따라 격리 방식은 달라진다. 이 글의 핵심은 “모델을 믿지 말라”가 아니라, 모델이 아무리 좋아져도 **환경 계층의 결정론적 경계**를 먼저 설계해야 한다는 쪽에 가깝다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/anthropic-claude-containment-blast-radius.webp"
    alt="Anthropic diagram visualizing risk and reward tradeoffs when agent blast radius is bounded"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Anthropic은 에이전트 배포 위험을 실패 가능성과 실패 시 피해 범위로 나눈다. 모델 안전성이 전자를 낮춘다면, containment는 후자인 blast radius를 상한선 안에 묶는다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

에이전트 보안의 난점은 위험이 단일 원인에서 오지 않는다는 데 있다. Anthropic은 agent risk를 세 부류로 나눈다. 첫째는 사용자가 의도적으로 또는 실수로 위험한 행동을 지시하는 **user misuse**다. 둘째는 모델이 요청받지 않은 방식으로 목표를 달성하려 하는 **model misbehavior**다. 더 유능한 모델은 명백한 실수는 줄일 수 있지만, 동시에 사람이 생각하지 못한 우회 경로를 더 잘 찾을 수도 있다. 셋째는 파일, 도구 출력, 네트워크 응답, MCP 서버 같은 외부 입력을 타고 들어오는 **external attacker**다.

기존 방식은 human-in-the-loop approval에 크게 기대었다. Claude Code도 초기에 읽기는 허용하고, 쓰기·bash·네트워크 접근은 사용자가 승인하도록 했다. 이론적으로는 타당하지만 실제 제품에서는 승인 피로가 생긴다. Anthropic은 사용자가 permission prompt의 약 93%를 승인했고, 프롬프트가 많아질수록 주의가 약해졌다고 설명한다. 최근의 Claude Code auto mode는 모델 기반 classifier로 더 안전한 자동 승인을 시도하지만, 글의 관점에서는 이것도 sandbox 안에서 쓰는 방어층이지 sandbox의 대체물이 아니다.

따라서 Anthropic이 더 강하게 미는 방향은 containment다. 행동 하나하나를 심판하기보다, 에이전트가 **애초에 무엇을 볼 수 있고 어디로 보낼 수 있는지**를 제한한다. 자격 증명이 sandbox 안에 들어오지 않으면, 사용자가 속았든 모델이 창의적 우회 경로를 찾았든 외부 공격자가 주입을 성공시켰든 그 credential은 exfiltration될 수 없다. 이 결정론적 경계가 확률적 방어가 놓친 마지막 지점에서 맞는 벽이다.

## 핵심 아이디어: 모델, 환경, 외부 콘텐츠를 따로 방어한다

Anthropic은 방어 대상을 세 구성요소로 정리한다. 첫 번째는 에이전트가 실행되는 **environment**다. 프로세스 sandbox, VM, 파일시스템 경계, egress control이 여기에 들어간다. 두 번째는 에이전트가 consult하는 **model**이다. system prompt, classifier, probe, training modification이 이 층이다. 세 번째는 에이전트가 읽는 **external content**다. MCP 서버, third-party plugin, web search, GitHub README 같은 도구 결과가 모델 컨텍스트로 들어오는 순간, 그것은 정보이면서 동시에 공격면이 된다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/anthropic-claude-containment-defense-components.webp"
    alt="Anthropic diagram showing three components to defend: model, environment, and external content"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    세 방어면은 서로 대체물이 아니다. 모델 방어는 행동 경향을 바꾸지만, 환경 방어는 도달 가능한 파일·프로세스·네트워크 자체를 제한한다.
  </figcaption>
</figure>

이 구분이 중요한 이유는 “신뢰한 도구”와 “신뢰한 데이터”가 다르기 때문이다. GitHub connector 자체를 audit했다고 해서, connector가 읽어 온 README가 안전하다는 뜻은 아니다. 로컬에 설치한 MCP 서버는 코드를 읽고 버전을 고정할 수 있지만, remote MCP 서버나 hosted connector는 승인 이후에도 동작이 바뀔 수 있다. 그러므로 tool permission을 세밀하게 제한하고, 도구 출력이 모델 컨텍스트에 들어가기 전에 별도 inspection을 거치는 구조가 필요하다.

또 하나 눈에 띄는 수치는 model-layer defense의 한계다. Anthropic은 Gray Swan의 Agent Red Teaming benchmark에서 Claude Opus 4.7이 단일 시도 prompt injection 공격 성공률을 약 0.1%로, 100회 adaptive attempt 후에도 약 5–6%로 제한한다고 말한다. Claude Code auto mode도 overeager behavior의 약 83%를 실행 전에 잡는다고 설명한다. 하지만 이 숫자가 강할수록 오히려 결론은 분명해진다. **아무리 강한 확률적 방어도 100%가 아니므로, 환경 경계를 단독으로 세워야 한다.**

## 제품별 containment pattern

Anthropic의 흥미로운 점은 하나의 “정답 sandbox”를 주장하지 않는다는 것이다. 제품별 사용 맥락이 다르면 격리의 강도와 비용도 달라진다.

| 제품/패턴 | 실행 위치 | 주요 경계 | 장점 | 남는 비용/위험 |
|---|---|---|---|---|
| claude.ai code execution | 서버 측 ephemeral container | gVisor, seccomp, per-session filesystem, Anthropic infra boundary | 사용자 로컬 머신에 닿지 않고 blast radius가 작음 | 지속 workspace나 로컬 파일 접근이 제한됨 |
| Claude Code | 사용자 머신의 human-in-the-loop sandbox | macOS Seatbelt, Linux bubblewrap, workspace write, network deny-by-default | 개발자 생산성을 유지하면서 permission prompt를 줄임 | 사용자가 bash와 작업 범위를 이해해야 하며, approval fatigue가 남음 |
| Claude Cowork | 사용자 데스크톱의 local VM | vendor hypervisor, mounted workspace, host keychain 분리, egress controls | 비개발자도 셸 판단 없이 강한 경계를 얻음 | VM overhead, EDR visibility 저하, allowlist 설계 복잡성 |

claude.ai의 코딩 실행은 gVisor container에서 동작한다. 에이전트는 서버 측 isolated infrastructure 안에서 코드를 실행하고, filesystem은 session 단위로 ephemeral하다. 여기서는 사용자의 로컬 머신을 보호하는 것보다 Anthropic infra와 tenant boundary를 보호하는 전통적 보안 문제가 더 중요해진다. Anthropic은 이 경험에서 오래된 보안 원칙을 다시 확인했다고 쓴다. gVisor와 seccomp처럼 오래 공격받은 primitive보다, 주변에 직접 만든 proxy나 orchestration code가 더 약한 층이 되기 쉽다.

Claude Code는 더 어렵다. 코딩 에이전트는 로컬 파일시스템, shell, network가 없으면 유용성이 크게 떨어진다. 그래서 개발자 사용자에게는 완전한 VM보다 빠르고 낮은 마찰의 OS-level sandbox가 현실적이다. Anthropic은 Seatbelt와 bubblewrap 기반 sandbox로 write는 workspace 안에서 허용하고 network는 기본 차단하는 방향을 택했고, 이 runtime을 `anthropic-experimental/sandbox-runtime`으로 공개했다. 공개 repo의 설명도 “container 없이 OS-level filesystem/network restriction을 강제하는 lightweight sandboxing tool”에 가깝다.

반면 Claude Cowork는 지식 노동자를 대상으로 한다. 평균 사용자가 bash 명령의 위험을 읽을 수 있다고 가정하기 어렵기 때문에, “승인할 수 있는 사람”이라는 전제가 약하다. Anthropic은 첫 버전에서 full VM을 택했다. 사용자가 선택한 workspace와 `.claude` folder만 mount하고, host keychain의 credential은 guest로 들어오지 않는다. 이 설계의 목적은 Claude가 어떤 식으로든 잘못 행동해도 workspace 바깥의 파일과 자격 증명에는 닿지 못하게 하는 것이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/anthropic-claude-containment-cowork-vm-isolation.webp"
    alt="Anthropic diagram showing six isolation mechanisms in Claude Cowork VM"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Claude Cowork의 VM 격리 구조. hypervisor와 vsock 같은 일부 경계는 guest가 root를 얻어도 바깥에서 강제되고, 나머지는 guest 내부의 최소 정책으로 유지된다.
  </figcaption>
</figure>

## Anthropic이 실제로 놓쳤던 것들

이 글의 가치가 큰 이유는 성공한 구조만 나열하지 않고, 놓쳤던 실패를 구체적으로 정리하기 때문이다. 첫 번째는 Claude Code의 trust dialog 이전 단계다. 2025년 중반부터 2026년 1월 사이 책임 있는 공개 프로그램을 통해 보고된 세 취약점은 모두 사용자가 아직 폴더를 신뢰한다고 승인하기 전에 실행되는 코드 경로를 겨냥했다. 예컨대 repository 안의 `.claude/settings.json`에 hook이 있고, Claude Code가 trust prompt를 띄우기 전 project-local setting을 읽으며 hook을 실행하는 식이다. 수정 방향은 단순하지만 중요하다. project open, config load, localhost listener는 “로컬이라 안전한 입력”이 아니라 인터넷에서 들어오는 요청처럼 다뤄야 한다.

두 번째는 사용자가 직접 주입 벡터가 되는 경우다. 내부 red-team exercise에서 연구자는 평범한 협업 요청처럼 보이는 prompt를 직원에게 실행하게 했고, 그 prompt는 credential을 읽어 외부 endpoint로 보내도록 Claude를 유도했다. Anthropic은 25회 재시도 중 24회 exfiltration이 완료됐다고 쓴다. 여기서 model classifier가 잡기 어려운 이유는 명확하다. 지시가 tool output이나 악성 웹페이지가 아니라 사용자가 붙여넣은 요청으로 들어왔기 때문이다. 이 경우 붙잡을 수 있는 것은 사용자의 의도를 해석하는 모델이 아니라, 애초에 `~/.aws`가 sandbox에 없고 POST가 egress control에 막히는 환경이다.

세 번째는 Claude Cowork의 approved domain exfiltration이다. egress allowlist가 `api.anthropic.com`을 허용한 것은 제품 동작에 필요했다. 하지만 악성 파일이 공격자 소유 API key와 hidden instruction을 workspace에 넣으면, Claude는 다른 파일을 읽고 Anthropic Files API를 호출해 공격자 계정으로 업로드할 수 있었다. destination은 허용된 Anthropic API였으므로 proxy는 정상 통과시켰다. sandbox는 설계대로 작동했지만, allowlist를 “도메인 목록”으로 이해한 것이 문제였다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/anthropic-claude-containment-approved-domain-egress.webp"
    alt="Anthropic diagram showing exfiltration through an approved Anthropic API domain and a fix using an in-VM MITM proxy"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    허용 도메인은 단순 destination filter가 아니라 capability grant다. Anthropic은 VM 내부 defensive MITM proxy로 API 요청의 token provenance를 확인하고, 공격자 key를 이용한 upload path를 차단했다.
  </figcaption>
</figure>

이 사례의 교훈은 강하다. allowlist에 오른 도메인의 모든 API 기능은 이제 공격면이다. `api.anthropic.com`을 허용한다는 것은 단순히 Anthropic으로 나가는 연결을 허용한다는 뜻이 아니라, 그 도메인 아래의 file upload, server-side fetch header, token 사용 방식까지 함께 허용한다는 뜻이다. Anthropic의 수정은 VM 내부 defensive man-in-the-middle proxy가 VM에 provision된 session token만 통과시키고, 공격자가 넣은 별도 key를 거부하도록 하는 것이었다. 서버가 아니라 VM 내부에 둔 이유도 중요하다. 서버 입장에서는 Cowork 요청과 일반 API client 요청을 구분하기 어렵고, provenance는 VM 쪽에서만 알 수 있기 때문이다.

## full-VM에서 host-loop로 옮긴 선택도 보안 설계다

Claude Cowork의 초기 full-VM 구조는 보안상 깔끔했다. agent loop 자체가 guest 안에 있으므로 Claude는 sandbox 밖의 escape hatch를 들고 있는 privileged process를 설득할 수 없다. 하지만 실사용에서는 VM startup 실패가 곧 제품 전체 실패로 이어졌다. Anthropic은 agent loop를 host 쪽으로 옮기고 code execution은 VM 안에 유지하는 host-mode를 채택했다. VM이 죽어도 Claude가 사용자에게 응답하며 debug를 도울 수 있고, 실제 코드 실행의 파일·네트워크 경계는 여전히 VM이 담당한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/anthropic-claude-containment-host-mode-vm.webp"
    alt="Anthropic diagram comparing full VM mode and host-loop mode for Claude Cowork"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    full-VM mode는 경계가 단순하지만 reliability cost가 컸다. host-loop mode는 agent loop를 host에 두되 code execution을 VM에 남겨, 제품 가용성과 containment 사이의 균형을 잡는다.
  </figcaption>
</figure>

local MCP 서버도 VM 밖으로 옮겨졌다. VM 안에서 local MCP를 실행하면 audit이 어렵고 dependency가 brittle하며, local database처럼 host process와 상호작용해야 하는 MCP는 어차피 host에서 돌아야 한다. 이 결정은 보안 약화처럼 보일 수 있지만, 더 정확히는 trust boundary를 명확히 한 선택이다. local MCP는 사용자가 설치하는 일반 소프트웨어처럼 취급하고, admin이 어떤 local MCP를 허용할지 결정한다. remote MCP는 여전히 사용자 머신에서 실행되지 않는다.

여기서 실무적으로 중요한 것은 “격리는 강할수록 좋다”가 아니라 “어떤 실패를 어떤 계층에서 받아낼 것인가”다. VM이 모든 것을 품으면 경계는 단순해지지만 장애 대응과 관측성이 나빠진다. agent loop를 밖으로 빼면 제품은 견고해지지만, code execution boundary와 MCP trust boundary를 더 명확하게 문서화해야 한다. 보안 아키텍처는 순수 격리 점수표가 아니라 운영 가능성까지 포함한 tradeoff다.

## 공개된 근거에서 확인되는 점

이번 Anthropic 글에서 확인되는 정량·정성 근거는 몇 가지로 정리된다.

| 근거 | 공개된 내용 | 해석할 때 중요한 점 |
|---|---|---|
| Permission prompt telemetry | 사용자가 prompt의 약 93%를 승인 | human-in-the-loop가 장기적으로 피로와 자동 승인으로 무너질 수 있음 |
| Claude Code auto mode | overeager behavior 약 83%를 실행 전 차단, benign command false block 약 0.4%, risky miss 약 17% | classifier는 sandbox 안의 defense-in-depth이지 환경 경계의 대체물이 아님 |
| Claude Code sandbox runtime | macOS Seatbelt, Linux bubblewrap, network deny-by-default, runtime open source | 개발자 맥락에서는 low-latency OS sandbox가 full VM보다 현실적인 선택일 수 있음 |
| Claude Cowork VM | host keychain과 guest filesystem 분리, workspace mount, scoped token | 비개발자에게는 승인 판단보다 admin-controlled hard boundary가 더 적합 |
| Approved-domain incident | 허용된 `api.anthropic.com`을 통해 공격자 계정으로 파일 업로드 가능 | egress allowlist는 domain filter가 아니라 capability grant로 해석해야 함 |
| Enterprise visibility | VM isolation이 EDR visibility도 차단 | 강한 격리는 관측성과 compliance 요구를 함께 설계해야 함 |

숫자만 보면 auto mode의 83% 차단율이나 Opus 4.7의 prompt injection 방어 성능이 눈에 띈다. 하지만 글의 중심은 그런 model metric이 아니다. Anthropic은 강한 모델 방어를 인정하면서도, 실패 가능성이 0이 아닌 한 deployment safety는 damage upper bound를 따로 설계해야 한다고 주장한다. 이것이 “model layer는 행동 경향을 바꾸고, environment layer는 가능 행동 집합을 줄인다”는 차이다.

또한 이 글은 enterprise agent 도입의 다음 쟁점을 잘 드러낸다. persistent memory poisoning, multi-agent trust escalation, agent identity가 그것이다. CLAUDE.md, product memory, mounted workspace, scheduled agent state처럼 세션을 넘어 남는 context는 classic post-exploitation의 persistence와 비슷해진다. sub-agent는 untrusted content를 격리해 structured fact만 올려보낼 수 있지만, 그 출력이 “우리 agent가 만든 것”이라는 이유로 더 높은 신뢰를 받으면 trust escalation이 된다. agent identity 역시 사용자 권한을 그대로 상속할지, agent 자체 principal을 둘지, 혹은 두 방식을 섞을지의 문제가 된다.

## 실무 관점에서의 해석

이 글의 가장 큰 시사점은 에이전트 보안을 “정책 문장”에서 “권한 그래프”로 옮겨야 한다는 점이다. 좋은 system prompt, prompt-injection classifier, 안전성 평가 점수는 필요하다. 하지만 실제 시스템이 파일, credential, network, connector, MCP, browser, scheduler에 닿는 순간 안전성은 모델 출력이 아니라 capability graph의 모양에 의해 결정된다. 어떤 credential이 어느 process namespace에 들어가는지, 어떤 도메인의 어떤 API 기능이 열려 있는지, workspace mount가 symlink를 언제 해석하는지가 제품의 safety property가 된다.

둘째, 사용자 유형별 containment가 달라야 한다. 개발자는 bash를 읽고, repository trust boundary를 이해하고, agent drift를 중간에 interrupt할 수 있다. 그래도 피로와 실수가 있다. 비개발자 knowledge worker에게 같은 승인 모델을 강요하면 더 위험하다. 그래서 Claude Code에는 low-friction OS sandbox와 auto mode가 맞고, Claude Cowork에는 admin-controlled VM boundary가 맞다. 에이전트 제품을 설계할 때 “사용자가 승인하면 된다”는 문장은 사용자의 전문성, 피로, 조직 정책을 함께 증명하지 못하면 빈약한 방어가 된다.

셋째, custom component를 의심해야 한다. Anthropic이 반복해서 말하는 “weakest layer is the one you built yourself”는 에이전트 시대에도 오래된 보안 원칙 그대로다. hypervisor, seccomp, gVisor 같은 primitive는 오랜 기간 공격을 받아 왔다. 반면 제품별 proxy, allowlist, config loader, trust dialog 이전 파서, MCP orchestration은 새롭고 덜 검증되어 있다. 에이전트 보안에서 novel한 부분은 모델만이 아니라, 모델을 둘러싼 glue code다.

마지막으로, approved-domain 사례는 많은 agent platform이 곧 부딪힐 문제다. “네트워크를 `api.vendor.com`으로만 열었다”는 주장은 점점 약해질 것이다. 그 안에 file upload, arbitrary account token, server-side fetch, webhook registration, data export API가 있으면 그 도메인은 여러 capability의 묶음이다. 앞으로의 egress policy는 hostname allowlist보다 request provenance, token binding, method/path policy, payload inspection, scoped identity에 가까워질 가능성이 크다.

결론적으로 Anthropic의 글은 Claude 제품 소개라기보다, 에이전트 보안을 제품 공학 언어로 정리한 사례 연구에 가깝다. 모델이 더 정렬되고 classifier가 더 좋아지는 것은 중요하다. 그러나 에이전트가 실제 일을 하려면 결국 파일을 읽고, 소켓을 열고, 프로세스를 만들고, 도구 결과를 믿어야 한다. 그 순간 안전성의 마지막 보루는 모델의 선의가 아니라 **잘라낸 실행 환경, 범위가 좁은 credential, 검증 가능한 proxy, 그리고 실패해도 피해가 멈추는 blast radius**다.

Sources: [Anthropic Engineering: How we contain Claude across products](https://www.anthropic.com/engineering/how-we-contain-claude), [Anthropic Engineering: Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode), [Anthropic sandbox-runtime](https://github.com/anthropic-experimental/sandbox-runtime), [Claude Code devcontainer docs](https://code.claude.com/docs/en/devcontainer), [NIST NCCoE: Software and AI Agent Identity and Authorization](https://www.nccoe.nist.gov/projects/software-and-ai-agent-identity-and-authorization)
