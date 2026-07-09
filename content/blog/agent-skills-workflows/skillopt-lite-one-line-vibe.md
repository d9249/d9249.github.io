---
title: "SkillOpt-Lite는 에이전트 자기진화를 파일 디버깅 루프로 되돌린다"
date: "2026-07-09T16:56:05"
description: "arXiv 2607.03451은 에이전트 스킬 최적화를 복잡한 tree merge와 update damping이 아니라, 실패 trace 파일을 읽고 최소 패치를 만든 뒤 독립 validation gate로 keep-or-rollback하는 루프로 단순화할 수 있다고 주장한다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - SkillOpt-Lite
  - HarnessOpt
  - Agent Skills
  - Coding Agents
  - Self-Evolution
  - Validation Gate
image: "/images/blog/skillopt-lite-one-line-vibe-cover.webp"
draft: false
---

Hugging Face Papers에 올라온 `SkillOpt-Lite: Better and Faster Agent Self-evolution via One Line of Vibe`는 에이전트 스킬 최적화 논문이지만, 메시지는 꽤 실무적이다. 좋은 에이전트는 모델 하나로 결정되지 않는다. 같은 base LLM이라도 어떤 skill 문서를 읽는지, 실패 trace를 어떻게 남기는지, 검증을 어디에서 끊는지, harness가 어떤 파일과 도구를 허용하는지에 따라 성능이 크게 달라진다.

이 논문이 던지는 질문은 “스킬도 neural network처럼 train할 수 있는가”에서 한 단계 더 간다. 이미 SkillOpt 같은 기존 작업은 skill 문서를 trainable text artifact처럼 다루고, rollout → reflection → bounded edit → validation gate 루프를 만든다. 그런데 저자들은 그 파이프라인이 너무 복잡해졌다고 본다. mini-batch reflection pooling, tree reduction, textual learning-rate schedule, slow update damping, rejected-edit buffer 같은 장치가 정말 필요한가? 아니면 coding agent에게 실패 로그 파일을 직접 읽히고, 공통 실패 패턴만 찾아서 작은 patch를 만들게 해도 충분한가?

논문의 답은 후자에 가깝다. **SkillOpt-Lite**는 agent self-evolution을 “파일 시스템 위의 디버깅 루프”로 다시 만든다. rollout trace를 파일로 저장하고, coding agent가 그 파일들을 탐색해 consensus failure pattern을 찾고, `skill.md`를 최소 수정한 뒤, 독립 validation split에서 성능이 좋아졌을 때만 keep한다. 이 루프를 skill 파일을 넘어 agent harness 코드까지 확장한 버전이 **HarnessOpt**다.

## 무엇을 해결하려는가

에이전트 스킬은 일반 prompt와 조금 다르다. 단순히 “친절하게 답하라” 같은 지시가 아니라, 특정 환경에서 어떤 절차를 따라야 하는지, 어떤 실패를 피해야 하는지, 어떤 tool이나 파일을 어떤 순서로 확인해야 하는지를 담은 외부 절차 지식이다. 그래서 같은 모델이라도 skill 문서가 바뀌면 행동이 달라지고, 그 차이는 종종 비선형적이다.

기존 self-reflection 계열 방법은 실패한 한 번의 실행을 보고 모델이 교훈을 적는 방식에 가까웠다. 하지만 한 trace에만 과적합하면 다른 task에서는 오히려 성능이 나빠질 수 있다. 반대로 SkillOpt처럼 validation gate를 둔 최적화 파이프라인은 더 안전하지만, 여러 batch를 merge하고, update 속도를 늦추고, reject history를 관리하는 구조가 무거워진다.

SkillOpt-Lite의 문제의식은 이 중간 지점이다.

| 질문 | 복잡한 skill optimizer의 답 | SkillOpt-Lite의 답 |
|---|---|---|
| 실패 신호를 어디에서 얻는가 | batch reflection, tree merge, rejected buffer | rollout trace를 독립 파일로 저장 |
| 모델이 무엇을 읽는가 | 요약된 reflection 또는 merged critique | 실제 실패 로그와 score 파일 |
| 업데이트는 어떻게 만드는가 | 여러 단계의 text-space optimization | coding agent가 공통 실패 패턴을 보고 최소 patch |
| 안전장치는 무엇인가 | learning rate, trust region, reject memory, validation | 독립 validation gate와 rollback |
| 최종 artifact는 무엇인가 | optimized skill 또는 best skill | `skill.md`, 더 넓게는 skill + harness snapshot |

핵심은 “스킬 최적화는 black-box zeroth-order optimization인가, 아니면 읽을 수 있는 실행 trace를 가진 프로그램 디버깅인가”라는 관점 차이다. 논문은 후자에 무게를 둔다. 에이전트 실행은 숫자 하나만 반환하는 black box가 아니라, planning, tool call, error, intermediate state, score가 담긴 trace를 남긴다. 그렇다면 굳이 blind perturbation처럼 다루지 말고, coding agent가 파일을 읽고 디버깅하게 만들자는 것이다.

## 핵심 아이디어: 모든 것을 파일로 만들고, validation gate로 되돌린다

SkillOpt-Lite의 루프는 네 단계로 읽으면 쉽다.

1. **Trajectory staging** — frozen agent harness를 train batch에서 실행하고, 각 task의 실행 trace와 score를 독립 텍스트 파일로 저장한다.
2. **Trajectory exploration** — optimizer 역할의 coding agent가 파일 시스템 도구로 sample directory를 탐색한다. 전체 로그를 한 번에 context에 넣는 대신, 실패 cluster와 대표 파일을 골라 읽는다.
3. **Consensus mining and minimal edit** — 단일 실패 사례의 특이한 증상이 아니라 여러 trace에 반복되는 실패 패턴을 찾고, `skill.md` 또는 허용된 harness 파일에 작은 patch를 만든다.
4. **Validation gating** — 독립 validation split에서 후보를 평가한다. 좋아지면 keep, 나빠지면 rollback한다. best artifact는 `workspace/.skillopt/history/` 같은 history 경로에 남긴다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/skillopt-lite-pipeline.webp"
    alt="SkillOpt-Lite and HarnessOpt pipeline with trajectory files, coding-agent exploration, validation gate, and rollback"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 저장소와 논문에 공개된 SkillOpt-Lite / HarnessOpt pipeline. 중요한 차이는 trace를 파일로 두고 coding agent가 직접 읽는다는 점, 그리고 validation gate가 keep-or-rollback 경계를 만든다는 점이다.
  </figcaption>
</figure>

공식 프로젝트 페이지는 이 루프를 두 개의 slash command로 포장한다. `/skillopt-loop`는 benchmark environment 안에서 `skill.md`만 최적화하는 흐름이고, `/harnessopt-loop`는 더 넓은 allowlist 안에서 agent harness 코드까지 다룬다. README 기준 예시는 다음과 같다.

```text
/skillopt-loop rounds=10 batch=40 target=gpt-5.4-nano
/harnessopt-loop rounds=2 batch=40 target=gpt-5.4-nano skill=skill_best_nano.md
```

여기서 “one line of vibe”라는 표현은 과장처럼 보이지만, 실무적으로는 꽤 분명한 포지셔닝이다. 사용자는 coding agent chat에 한 줄 명령을 넣고, loop policy는 `.github/prompts/*.prompt.md` 파일로 관리한다. 즉 새로운 optimizer server를 띄우기보다, 이미 쓰는 coding agent가 읽을 수 있는 prompt file과 workspace layout으로 자기진화 루프를 구성하는 방식이다.

## 공개된 근거에서 확인되는 점

arXiv API와 abstract page 기준 이 논문은 `2607.03451v1`로 2026년 7월 3일 제출되었고, primary category는 `cs.SE`, 추가 category는 `cs.AI`, `cs.LG`다. 저자는 Yifei Shen, Bo Li, Xinjie Zhang이며 소속은 LMMs-Lab, NTU MMLab, Microsoft로 표기되어 있다.

공식 companion source도 비교적 풍부하다.

| 표면 | 확인한 내용 | 실무적 의미 |
|---|---|---|
| arXiv / HF Papers | 논문 본문, abstract, figure, benchmark 수치 확인 가능 | 논문 claim과 section 구조의 canonical source |
| Project page | `v0.1 · one line of vibe · val-gated rollback` 포지셔닝, slash command 예시, 결과 요약 제공 | 독자가 빠르게 사용 흐름을 이해하기 좋은 landing page |
| GitHub repo | `EvolvingLMMs-Lab/SkillOpt-Lite`, MIT license, Python 중심 repo, `copilot_example`, `harness_example`, `skillopt_lite_ckpt`, `harnessopt_ckpt` 포함 | 단순 paper-only가 아니라 실행 예시와 checkpoint를 같이 공개 |
| Hugging Face dataset | `yshenaw/SkillOpt_Lite_Benchmarks`, Apache-2.0, public/non-gated, 6개 config, 총 3,831 rows, 약 419 MB | benchmark split과 데이터 materialization을 재현할 수 있는 표면 |
| Release state | 확인 시점에는 GitHub tags/releases가 없음 | installable product라기보다 repo 기반 research release로 읽는 편이 안전 |

결과 수치는 논문과 프로젝트 페이지가 같은 방향을 말한다. 논문 abstract는 SkillOpt-Lite가 GPT-5.5 조건 LiveMath에서 SkillOpt 대비 **+8.8 points**, GPT-5.4-nano 조건 LiveMath에서 **+25.4 points** 개선한다고 요약한다. Project page는 여기에 HarnessOpt headline을 더한다. SpreadsheetBench에서 GPT-5.4-nano + HarnessOpt가 **0.7758**을 기록해, 더 큰 GPT-5.5가 standard harness + full SkillOpt로 기록한 **0.7620**보다 높다는 주장이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/skillopt-lite-performance.webp"
    alt="SkillOpt-Lite performance radar plot and convergence curves across SearchQA, Spreadsheet, ALFWorld, LiveMath, OfficeQA, and DocVQA"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 성능 그림. 왼쪽은 평균 성능 profile이고, 오른쪽은 validation convergence trajectory다. 저자들은 SkillOpt-Lite가 특히 LiveMath와 Spreadsheet처럼 reasoning과 deterministic code execution이 중요한 영역에서 빠르게 올라간다고 해석한다.
  </figcaption>
</figure>

본문에서 특히 눈에 띄는 비교는 다음과 같다. 수치는 저자들이 공개한 논문/프로젝트 페이지 기준이며, 이 글에서 독립 재현한 benchmark 결과는 아니다.

| 비교 | 공개 수치 | 읽는 법 |
|---|---:|---|
| LiveMath · GPT-5.5 · SkillOpt-Lite vs SkillOpt | +8.8 points | 복잡한 SkillOpt보다 단순한 file-exploration loop가 더 높았다는 주장 |
| LiveMath · GPT-5.4-nano · SkillOpt-Lite vs SkillOpt | +25.4 points | 작은 모델에서 early plateau를 더 잘 뚫는다는 주장 |
| ALFWorld · GPT-5.4-nano · SkillOpt-Lite | 81.3, SkillOpt 대비 +9.5 | text/embodied benchmark에서도 일정 개선 |
| Spreadsheet 평균 · SkillOpt-Lite vs SkillOpt | +12.6 points | reasoning + spreadsheet execution에서 이점이 큼 |
| SpreadsheetBench · GPT-5.4-nano + HarnessOpt | 0.7758 | skill뿐 아니라 harness를 같이 고치면 작은 모델이 큰 모델 baseline을 넘는 사례 |

이 수치의 핵심은 “항상 더 복잡한 optimizer가 낫다”가 아니라는 점이다. 논문은 mini-batch reflection pooling이 서로 다른 textual update를 평균내면서 discrete language-space의 gradient signal을 흐릴 수 있다고 설명한다. 반대로 파일 시스템을 직접 탐색하는 coding agent는 특정 실패 파일을 읽고, 구조적 결함을 더 국소적으로 고칠 수 있다.

다만 benchmark 해석에는 주의가 필요하다. project page는 shipped checkpoints로 `scripts/eval_only.py` 재현이 가능하다고 말하지만, 이 글에서는 실제 benchmark를 돌리지 않았다. 또한 LiveMath와 OfficeQA의 validation instance 수가 작아 variance가 커서 split을 조정했다는 설명도 본문에 있다. 즉 숫자는 강한 방향성을 보여 주지만, production agent에 바로 일반화하려면 자기 환경의 validation split과 regression suite를 따로 만들어야 한다.

## HarnessOpt가 더 흥미로운 이유

SkillOpt-Lite만 보면 “좋은 skill 문서를 자동으로 고친다”는 이야기다. 하지만 논문 후반의 HarnessOpt가 더 중요한 함의를 갖는다. 어느 지점부터는 skill 문서만 고쳐서는 성능이 더 오르지 않는다. 모델이 보는 파일 preview가 부족하거나, tool failure 후 reasoning loop에 빠지거나, final answer verification이 약한 경우에는 prompt가 아니라 harness code가 병목이다.

논문은 SpreadsheetBench에서 모델 tier별 병목이 달랐다고 설명한다.

| 모델군 | 관찰된 병목 | HarnessOpt식 수정 방향 |
|---|---|---|
| GPT-5.4-mini / GPT-5.4 | spreadsheet preview 부족, final answer verification 약함 | 더 넓은 관찰 범위와 final output introspection 추가 |
| GPT-5.5 / GPT-5.4-nano | tool execution 실패 후 반복 reasoning loop | 반복 상태를 감지하고 fallback policy로 회복 |

이 대목은 실무적으로 중요하다. 많은 팀이 agent 개선을 prompt 수정으로만 생각한다. 하지만 실제 failure는 prompt에 적힌 전략보다 훨씬 낮은 층에서 생긴다. 파일을 충분히 보여 주지 않는 adapter, timeout이 짧은 executor, 실패를 잘못 요약하는 observation formatter, retry loop가 없는 controller, final answer checker 부재가 모두 agent 성능을 깎는다.

HarnessOpt는 “스킬이 trainable artifact라면 harness도 trainable artifact”라는 생각으로 확장한다. 다만 위험도도 커진다. `skill.md`를 고치는 것과 `executor.py`, `react_agent.py`, `adapter.py`를 고치는 것은 다르다. 실행 코드가 바뀌면 syntax error, infinite loop, unsafe action, hidden regression이 생길 수 있다. 그래서 논문은 allowlist, smoke validation, rollback tag, human-in-the-loop gate를 함께 둔다.

## 실무 관점에서의 해석

SkillOpt-Lite의 실무 메시지는 “자동 자기수정”보다 “검증 가능한 자기수정”에 있다. agent에게 실패 로그를 읽히고 스스로 고치게 하는 것은 이미 가능하다. 어려운 것은 그 수정을 언제 받아들일지, 무엇을 되돌릴지, 어떤 dataset이 overfitting을 막는지, 어떤 파일을 절대 건드리면 안 되는지 정하는 일이다.

팀이 비슷한 루프를 도입하려면 먼저 다음 조건을 갖추는 편이 좋다.

| 조건 | 이유 |
|---|---|
| task별 deterministic 또는 semi-deterministic score | validation gate가 없으면 self-edit은 그냥 self-confidence가 된다 |
| train / val / test 분리 | 같은 실패 샘플에 맞춘 patch를 바로 production skill로 올리면 과적합한다 |
| trace 파일화 | 모델 context에 모든 로그를 밀어 넣는 대신, agent가 필요한 파일을 골라 읽게 해야 한다 |
| editable allowlist | skill만 고칠지, harness code도 고칠지, config와 credential은 read-only인지 분리해야 한다 |
| rollback 가능한 git state | 나쁜 patch를 빠르게 되돌리고, best artifact를 추적해야 한다 |
| 작은 smoke gate | 긴 benchmark 전에 import error, missing file, crash를 먼저 잡아야 한다 |

특히 validation gate는 단순한 품질 체크가 아니라 governance boundary다. “모델이 좋은 설명을 했다”가 아니라 “독립 split에서 점수가 좋아졌다”가 accept 조건이 된다. 이 차이가 self-reflection과 self-evolution을 가른다.

또 하나의 시사점은 long-horizon agent 운영에서 **trace format**이 중요해진다는 점이다. SkillOpt-Lite는 raw rollout을 파일로 만들고, coding agent가 `list/read/replace`류의 원시 파일 도구로 탐색하게 한다. 이는 agent memory나 observability stack을 만들 때도 참고할 만하다. 멋진 dashboard보다 먼저 필요한 것은, 실패를 재현하고 clustering하고 patch 근거로 삼을 수 있는 일관된 trace 파일이다.

## 조심해서 봐야 할 부분

첫째, 공개 repo는 연구 release에 가깝다. README는 coding agent가 환경 설정, auth, data download를 처리한다고 설명하지만, 실제 사용에는 Azure/OpenAI 또는 OpenAI-compatible endpoint 설정과 수백 MB benchmark data가 필요하다. 확인 시점에는 별도 GitHub release/tag가 없으므로, 특정 버전 고정이나 package registry 기반 배포를 기대하기보다는 commit 기반으로 고정하는 편이 안전하다.

둘째, HarnessOpt는 powerful하지만 위험하다. skill 파일은 자연어 artifact라 실패해도 대체로 rollback이 쉽다. 반면 harness code를 자동 수정하면 실행 경계 자체가 바뀐다. 따라서 production repo에서 바로 돌리기보다, forked workspace, sandbox subprocess, small smoke set, diff allowlist, human approval step을 둬야 한다.

셋째, benchmark victory를 “모든 agent에서 작은 모델이 큰 모델을 이긴다”로 읽으면 안 된다. 논문의 headline은 특정 SpreadsheetBench setup에서의 결과다. 정확한 결론은 더 좁다. **좋지 않은 harness에 갇힌 큰 모델보다, 해당 작업에 맞게 harness와 skill이 co-optimized된 작은 모델이 더 나을 수 있다**는 것이다. 이 해석이 훨씬 실무적이고 안전하다.

넷째, roadmap을 보면 Codex CLI와 Claude Code plugin은 planned 상태로 적혀 있다. 현재 repo의 가장 직접적인 실행 표면은 VS Code Copilot Chat과 `.github/prompts/*.prompt.md`를 읽는 coding-agent 환경이다. 다른 CLI agent로 옮기려면 prompt packaging과 workspace policy를 직접 맞춰야 한다.

## 정리

SkillOpt-Lite는 에이전트 자기진화를 “더 복잡한 optimizer를 만들자”가 아니라 “실패 trace를 파일로 남기고, coding agent가 읽고, validation gate가 승인하게 하자”로 단순화한다. 이 단순화가 중요한 이유는 inference-time overhead를 늘리지 않고도 agent skill과 harness를 개선할 수 있기 때문이다. 최종 artifact는 거대한 runtime이 아니라 `skill.md`와 필요한 harness diff다.

내가 보기에는 이 논문의 가장 좋은 문장은 “everything is a file”에 가깝다. 에이전트가 실패한 이유도 파일이고, 고쳐야 할 스킬도 파일이고, harness도 파일이고, accept/reject history도 파일이다. 그러면 coding agent는 특별한 optimizer API 없이도 평소 하던 디버깅 루프로 자기 자신을 개선할 수 있다.

물론 이 방향이 production-ready 자동 자기수정으로 바로 이어지는 것은 아니다. 오히려 반대다. 실제 운영에서는 더 엄격한 validation split, allowlist, rollback, human gate가 필요하다. 하지만 이 논문은 좋은 기준선을 준다. agent self-evolution을 신뢰하려면 “스스로 고쳤다”가 아니라, **무엇을 읽고, 무엇을 고쳤고, 어떤 독립 검증에서 좋아졌으며, 언제 되돌릴 수 있는가**를 파일과 git history로 남겨야 한다.

Sources: https://huggingface.co/papers/2607.03451, https://arxiv.org/abs/2607.03451, https://arxiv.org/html/2607.03451v1, https://github.com/EvolvingLMMs-Lab/SkillOpt-Lite, https://evolvinglmms-lab.github.io/SkillOpt-Lite/, https://huggingface.co/datasets/yshenaw/SkillOpt_Lite_Benchmarks
