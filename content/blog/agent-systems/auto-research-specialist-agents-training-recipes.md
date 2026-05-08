---
title: "Auto Research는 논문을 쓰지 않고 실험 궤적을 쌓는다"
date: "2026-05-08T19:03:44"
description: "Auto Research는 specialist agent가 코드 수정, 실험 제출, 외부 evaluator 피드백 반영을 반복하는 closed-loop 연구 하네스를 제안한다. 핵심 산출물은 논문 초안이 아니라 auditable trial trajectory이며, Parameter Golf·NanoChat-D12·CIFAR-10에서 실제 training recipe를 비평범하게 개선했다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - Agents
  - Auto Research
  - Research Engineering
  - Training Recipes
  - Claude
  - MLOps
draft: false
---

요즘 "AI가 논문을 쓴다"는 이야기는 많지만, 실제 연구 생산성에서 더 중요한 것은 문장을 잘 쓰는 능력보다 **가설을 코드로 바꾸고, 실험을 제출하고, 실패를 다음 실험 설계로 환원하는 루프**다. `Auto Research with Specialist Agents Develops Effective and Non-Trivial Training Recipes`는 바로 그 지점을 겨냥한다. 이 논문에서 auto research의 산출물은 polished paper나 단일 체크포인트가 아니라, 제안·코드 diff·실험 점수·실패 라벨·후속 수정이 이어진 audit 가능한 trajectory다.

핵심 주장도 꽤 명확하다. 인간이 search 도중 proposal을 고르거나, 코드를 직접 수정하거나, 실패 실험을 수습하지 않아도 specialist agent 집합이 training recipe surface를 나눠 탐색하면서 실제 성능 개선을 만들어 낼 수 있다는 것이다. 더 흥미로운 점은 이 시스템이 "새로운 모델 아이디어를 발명했다"고 과장하지 않는다는 데 있다. 논문과 공개 저장소가 보여주는 그림은 오히려 반대다. 좋은 auto research란 완전히 생소한 이론을 즉석에서 발명하는 기계가 아니라, **측정 가능한 제약 아래에서 이미 알려진 기법과 코드 경로를 집요하게 재조합·수정·검증하는 실험 시스템**에 가깝다.

![Closed-loop auto research trajectory](https://arxiv.org/html/2605.05724v1/figures/overview_specialist_swarm_v5.png)

## 무엇을 해결하려는가

이 논문이 푸는 문제는 "에이전트가 연구를 대신할 수 있는가" 같은 추상적 질문이 아니다. 더 구체적으로는, 실제 ML 연구의 핵심 병목인 propose-measure-revise loop를 어떻게 자동화할 것인가다. 많은 agent 논문은 최종 보고서 생성이나 코드 패치 성공률에 초점을 맞추지만, 연구 실무에서 중요한 것은 패치 한 번이 아니라 **실패한 실험도 다음 hypothesis의 입력으로 누적되는지**다.

저자들이 강조하는 lineage 개념이 바로 여기서 나온다. 각 trial은 단발성 아이디어가 아니라, 이전 실험의 점수·런타임·사이즈 제한·크래시 요약·parent experiment를 읽고 나온 후속 분기다. 즉 이 시스템은 단순한 멀티에이전트 병렬화라기보다, 실패를 포함한 실험 기록을 shared memory로 삼아 점진적으로 recipe를 바꾸는 연구 하네스에 가깝다.

세 개의 실험 환경 선택도 의도적이다. Parameter Golf는 모델 성능과 함께 artifact size 제약을 강하게 걸고, NanoChat-D12는 제한된 wallclock 안에서 pretraining throughput과 quality를 함께 보게 만들며, CIFAR-10 Airbench96은 speed를 높이더라도 정확도 gate를 넘지 못하면 탈락시키는 구조다. 즉 이 논문은 "성능만 높이면 된다"는 느슨한 설정 대신, **현실적인 연구 제약이 있는 환경에서 agent loop가 버틸 수 있는지**를 본다.

## 핵심 아이디어 / 구조 / 동작 방식

구조는 surprisingly simple하다. 상단의 supervisor가 trial slot을 돌리고, 각 specialist agent는 자기 역할에 맞는 preamble과 lineage context를 읽은 뒤 editable recipe를 수정한다. 수정이 끝나면 `submit_trial` 같은 도구를 통해 실제 실험을 제출하고, 하네스는 로컬 preflight와 외부 evaluator 결과를 붙여 `results.tsv`, `best.json`, `LEADERBOARD.md`, snapshot 디렉터리로 남긴다. 다음 세션은 이 기록을 다시 읽고 후속 수정안을 만든다.

공개된 `docs/architecture.md`를 보면 구조는 크게 네 층으로 정리된다.

- `agent_core/`: blackboard, event log, result tracker, supervisor loop 같은 task-agnostic core
- task package: `multi_agent_pg`, `multi_agent_nc`, `multi_agent_cifar`처럼 각 환경별 adapter와 editable recipe
- specialist preamble: 아키텍처, 최적화, 스케줄, 시스템 등 역할 분리
- tool layer: `submit_trial`, `syntax_check`, `size_project`, `param_count`, `read_snapshot` 같은 MCP 도구

이 설계에서 중요한 것은 agent가 텍스트만 생성하는 것이 아니라는 점이다. 실제 루프는 아래에 더 가깝다.

```
lineage 읽기
  → hypothesis 선택
  → 코드 수정
  → preflight 검사
  → 실제 실험 제출
  → external evaluator가 score/status 기록
  → 다음 agent가 그 결과를 읽고 수정
```

여기서 논문의 차별점은 specialist decomposition과 shared lineage를 함께 쓴다는 데 있다. Figure 10과 Table 7을 보면, Parameter Golf에서는 10개 역할이 넓게 기여하고, NanoChat-D12는 systems 역할에 개선이 집중되며, CIFAR는 accuracy gate 때문에 optimization/augmentation/regulation 쪽만 상대적으로 살아남는다. 즉 역할 분할은 단순 장식이 아니라, **문제의 제약 구조에 따라 어떤 탐색이 살아남는지 드러내는 search prior**로 작동한다.

![Specialist role partitioning](https://arxiv.org/html/2605.05724v1/figures/specialist_swarm_decomposition_v3.png)

논문은 또 하나의 중요한 선을 긋는다. 이 시스템의 evaluator는 agent 소유가 아니다. score, legality check, timing source는 외부 측정 환경이 소유한다. 다시 말해 agent는 보고서를 예쁘게 꾸며 성공을 주장할 수 없고, 항상 외부 환경이 반환한 metric과 status로만 다음 행동을 정당화해야 한다. 이 점 때문에 auto research가 단순한 story generation이 아니라 experiment harness로 읽힌다.

## 공개된 근거에서 확인되는 점

가장 중요한 요약은 Table 1이다. 세 개의 headline run에서 specialist role swarm은 모두 시작점 대비 개선을 만든다.

| 환경 | 시작점 | 최종 결과 | 상대 변화 | 제출 trial 수 | valid improvement |
|---|---:|---:|---:|---:|---:|
| Parameter Golf (`val_bpb`, lower better) | 1.0810 | 1.0722 | -0.81% | 900 | 36 |
| NanoChat-D12 (`CORE`, higher better) | 0.1618 | 0.2244 | +38.7% | 200 | 5 |
| CIFAR-10 Airbench96 (`train_s`, lower better) | 26.3560s | 25.1464s | -4.59% | 97 | 4 |

이 수치가 흥미로운 이유는 절대적으로 모든 환경에서 수십 번의 대형 breakthrough가 터졌기 때문이 아니다. 오히려 valid improvement의 개수는 많지 않다. 대신 중요한 것은 **실패와 무효 trial이 훨씬 많은 현실적인 search 환경에서도, lineage를 읽는 specialist loop가 끝내 legal improvement를 누적했다**는 사실이다.

Table 3의 control도 인상적이다. Parameter Golf 200-trial control에서 role swarm + lineage는 best score 1.0731까지 내려가고 effective cluster 수는 134.8이다. 반면 10 generic agent는 1.0745에 머물고 effective cluster는 41.1, top cluster 비중은 12.0%까지 커진다. single generalist도 1.0754 수준이다. 논문이 말하는 포인트는 분명하다. **에이전트를 많이 띄운다고 탐색이 넓어지는 것이 아니라, 역할 분리와 lineage 공유가 있어야 아이디어 중복이 덜하고 search entropy가 유지된다**는 것이다.

![Best-so-far over submitted trials](https://arxiv.org/html/2605.05724v1/x1.png)

Table 2와 Table 9는 "무엇이 실제로 바뀌었는가"를 더 구체적으로 보여준다. 예를 들어 NanoChat-D12에서는 attention path를 SSSL에서 L 경로로 바꿔 Flash SDPA를 전 층에서 쓰게 만들고, 그로부터 절약한 wallclock을 더 많은 training tokens로 환원한다. Parameter Golf에서는 recurrent residual scaling, separate RoPE/NoPE query gains, attention-output gating, GPTQ/Hessian calibration 같은 꽤 비평범한 수정이 등장한다. CIFAR에서는 대부분의 architecture speedup이 accuracy gate를 넘지 못하고, 결국 logging/validation overhead 제거와 warmup 재설계 같은 gate-aware speed recipe가 살아남는다.

이 대목이 중요하다. 이 시스템은 "엉뚱하지만 그럴듯한 아이디어"를 대량 생성하는 것이 아니라, **제약을 건드리지 않는 합법적인 program transformation을 끝까지 남기는 방향으로 수렴**한다. 블로그나 데모에서 보기 좋은 flashy novelty보다, 실제 연구 엔지니어링에서 더 유용한 성질이다.

![Parameter Golf controls and lineage effect](https://arxiv.org/html/2605.05724v1/x2.png)

공개 저장소 상태도 체크할 만하다. `cxcscmu/Auto-Research-Recipes`는 2026-05-07 생성, Apache-2.0 라이선스, 기본 브랜치 `main` 기준으로 공개돼 있고, 조회 시점 기준 GitHub release와 tags는 없다. 대신 `docs/architecture.md`, `docs/task_adapter.md`, `release_artifacts/`와 환경별 blackboard snapshot이 포함돼 있어, 논문 주장의 핵심인 experimental trace와 final recipe 근거를 독자가 다시 확인할 수 있게 해 둔다. 특히 `release_artifacts/README.md`는 각 run의 최종 best score와 어떤 파일이 보존되고 어떤 로그는 제외됐는지까지 명시한다. 즉 현재 이 프로젝트는 polished framework라기보다, **논문 결과를 뒷받침하는 공개형 research artifact bundle**에 더 가깝다.

## 실무 관점에서의 해석

내가 보기에 이 논문의 진짜 기여는 "AI scientist"라는 거대한 서사를 조금 더 현실적인 단위로 잘라냈다는 데 있다. 이 시스템은 논문을 읽고 혁신적인 아이디어를 혼자 발명하는 scientist persona를 증명하려 하지 않는다. 대신 editable codebase, evaluator-owned metric, search budget, legality gate, lineage memory가 주어졌을 때, **에이전트가 연구 실험의 운영체제처럼 일할 수 있는가**를 묻는다.

이 관점은 실제 팀에 더 중요하다. 많은 연구 조직에서 병목은 완전한 새로운 이론의 부재가 아니라, 이미 plausible한 hypothesis가 수십 개 있는데 그걸 끝까지 실행·비교·기록·후속 수정하는 루프가 사람 시간을 너무 많이 먹는다는 점이다. Auto Research는 바로 그 반복부를 자동화 대상으로 본다. 그래서 이 논문은 "agent가 과학을 대체했다"보다 "agent가 constrained empirical search를 상당 부분 운영할 수 있다"는 쪽에 더 가까운 메시지를 준다.

동시에 한계도 분명하다.

- 세 환경 모두 training recipe optimization이라는 비교적 구조화된 영역이다.
- 외부 evaluator와 실행 하네스가 잘 정의돼 있어야 한다.
- 개선 폭은 분명하지만, 엄청난 SOTA jump라기보다 budget 안에서의 non-trivial refinement에 가깝다.
- 공개 저장소는 신선한 research artifact이지만 아직 releases/tags가 없고 운영 프레임워크로 다듬어진 상태는 아니다.

그럼에도 신호는 강하다. 특히 이 논문은 agent 평가를 PR patch 정확도나 benchmark QA 점수에서 한 단계 밀고 나가, **실패를 포함한 실험 궤적을 얼마나 잘 운영하느냐**로 옮긴다. 앞으로 agentic ML systems를 볼 때도, 최종 정답 하나보다 lineage, evaluator ownership, legality gate, replay 가능한 trace가 있는지 먼저 보게 될 가능성이 크다. 그런 기준에서 보면 Auto Research는 꽤 중요한 방향 전환점이다.

Sources: https://arxiv.org/abs/2605.05724, https://arxiv.org/html/2605.05724, https://github.com/cxcscmu/Auto-Research-Recipes, https://raw.githubusercontent.com/cxcscmu/Auto-Research-Recipes/main/docs/architecture.md, https://raw.githubusercontent.com/cxcscmu/Auto-Research-Recipes/main/release_artifacts/README.md, https://api.github.com/repos/cxcscmu/Auto-Research-Recipes