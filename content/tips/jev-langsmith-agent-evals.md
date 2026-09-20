---
title: "Jev-as-a-Judge: LangSmith에서 agent eval 비용·분산을 분리해 보는 작은 실험"
date: "2026-09-21T07:42:13"
description: "LangChain의 Jev-as-a-Judge 실험은 고정한 agent trace를 반복 평가해, typed decision model이 LLM judge의 비용·지연·반복성 문제에 어떤 선택지를 주는지 보여 주는 재현용 예제입니다."
author: "Sangmin Lee"
repository: "danielgshea/jev-as-a-judge"
sourceUrl: "https://www.langchain.com/blog/jev-agent-evals-langsmith"
status: "Experimental"
license: "Commercial / experiment repo unlicensed"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Agent Evals"
  - "LangSmith"
  - "Jev"
  - "LLM-as-a-Judge"
highlights:
  - "고정한 agent trace를 반복 평가해 judge 분산을 따로 측정"
  - "Jev의 typed Noul·Choice·Score 신호를 evaluator로 연결"
  - "작은 5-case 실험이라 production 일반화 전 인간 검증이 필수"
draft: false
---

## 한 줄 요약

**Jev-as-a-Judge는 “judge가 맞는가”와 “judge가 같은 trace에 매번 같은 말을 하는가”를 분리해 보는 LangSmith 예제**다.[1] LangChain은 고정한 날씨 agent의 run을 Jev와 세 autoregressive LLM judge에 반복 재생해, binary verdict·continuous quality score·비용·latency를 함께 비교했다.[1][5]

이 tip의 핵심은 Jev의 수치 자체보다 실험의 framing이다.[7] agent eval은 단 한 번의 그럴듯한 판정이 아니라, 같은 trace를 입력했을 때 score가 얼마나 흔들리는지와 인간 rubric에 얼마나 맞는지를 따로 관리해야 한다.[1][2]

<figure style="margin: 1.5rem 0;">
  <img
    src="/images/tips/jev-langsmith-quality-variance.png"
    alt="Jev, GPT-5.6 Luna, GPT-5.6 Terra, Claude Sonnet 4.6의 동일 agent trace 반복 quality score 분산을 비교한 LangChain 공식 표"
    style="width: 100%; min-width: 0; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666; line-height: 1.6;">
    LangChain의 고정 weather-agent trace 반복 평가 결과. Jev의 mean per-case quality variance는 0.0000149로 보고됐지만, 이는 다섯 case의 좁은 experiment에서 관측된 값이다.[1][5][7]
  </figcaption>
</figure>

## 무엇을 시험했나

실험은 Deep Agents와 Tavily search를 쓰는 weather agent에 다섯 요청을 실행하고, final answer·evidence·tool call·expected behavior를 LangSmith dataset의 고정 example으로 저장하는 방식이다.[7] 이후 각 judge가 같은 다섯 run을 100회씩 평가하므로, 반복 사이의 variation은 weather agent가 아니라 evaluator에서 나온다는 설계다.[1][5]

각 run에는 `quality`와 `does_pass` 두 signal이 붙는다.[1] `quality`는 groundedness·expected search behavior·usefulness를 묶은 0–1 continuous score이고, `does_pass`는 binary verdict다.[5][7]

LangSmith의 evaluation model과도 잘 맞는다.[2] offline eval은 curated dataset과 reference output으로 pre-deployment regression을 보고, online eval은 production tracing의 run·thread를 대상으로 quality pattern과 anomaly를 본다. 이 예제는 고정 dataset replay에 가까운 offline judge benchmark다.[2]

## 왜 Jev를 judge 후보로 보나

Jev는 text를 autoregressively 생성하는 LLM이 아니라, state에 대한 typed answer와 probability를 반환하는 TypeSafe의 System One model이다.[3] 문장을 생성한 뒤 JSON을 parsing하는 방식 대신, 가능한 answer shape를 미리 정의한 Score·Noul·Choice 같은 primitive로 판단을 받는 것이 차이다.[3][4]

이 예제에서 그 차이는 agent evaluator에 자연스럽게 대응한다.

- **Noul**: “최종 답변이 evidence에 근거하는가”처럼 yes/no 확률을 받는다.[3][7]
- **Score**: usefulness처럼 순서 있는 rubric score를 받는다.[3][7]
- **Choice**: `answered`·`clarification-needed`·`poor`처럼 next action에 필요한 outcome class를 받는다.[1][3][7]

여러 atomic question을 같은 state에 병렬로 던질 수 있어, code는 output을 threshold·segment·review queue에 조합할 수 있다.[3] 하지만 typed output은 format failure를 줄이는 장치이지, evaluator의 rubric이 올바르다는 보증은 아니다.[3][7]

## 공개 결과를 읽는 법

LangChain post는 Jev가 binary `does_pass`에서 human oracle과 500개 반복 decision 모두 일치했다고 보고한다.[1] continuous quality score의 mean per-case variance는 Jev 0.0000149, GPT-5.6 Luna 0.00647, Terra 0.01364, Claude Sonnet 4.6 0.00137로 제시됐다.[1]

같은 post의 call-level 수치는 Jev 평균 0.44초·$0.00035, Luna $0.00039, Terra $0.00289, Claude $0.02811이다.[1] 그래서 이 setup에서는 “모든 production trace를 여러 rubric으로 반복 평가할 예산이 있는가”라는 운영 제약이 작아질 수 있다.[1]

다만 이 숫자를 일반 judge leaderboard로 읽으면 안 된다.[1] 실험 corpus는 다섯 fixed weather-agent run이고, LLM judge에는 temperature·top-p·seed·max token을 별도 설정하지 않아 provider/gateway default가 적용됐으며, hosted Jev service version도 experiment metadata에 없었다.[1][7]

재현 repository의 README에는 더 직접적인 경고도 있다.[5] 같은 README는 benchmark가 repeatability를 측정하고 human alignment는 측정하지 않는다고 서술하는 한편, 뒤에서는 human-defined expected behavior와 oracle label을 언급한다. article과 repository 안에서도 alignment framing이 완전히 일치하지 않으므로, 이 실험의 strongest claim은 **동일 trace에서의 repeatability 관측**으로 제한하는 편이 안전하다.[5][7]

## 설치와 재현의 최소 경로

repository는 Python 3.13+, Tavily API key, TypeSafe API key, Gateway access가 있는 workspace-scoped LangSmith API key를 요구한다.[5] `.env`에는 trace·dataset·model gateway 관련 credential이 함께 들어가므로, public issue나 샘플 로그에 올리지 않는 것이 전제다.[7]

```bash
cp .env.example .env
# 필요한 API key를 로컬 .env에만 입력
uv sync

# LangSmith experiment를 올리지 않는 local run
uv run python main.py

# 같은 judge를 반복해 분산을 계산
uv run python src/evals/judge_reliability.py --local
```

dataset을 LangSmith에 upload하고 experiment를 기록하려면 `uv run python src/evals/offline_evals.py`를 사용한다.[5] source repository는 2026년 9월 17일 생성된 작은 Python experiment이며, GitHub Releases·tags·checked-in license가 없으므로 production package가 아니라 reproducibility artifact로 취급하는 것이 맞다.[6][7]

## 언제 유용한가

- **agent regression test**: 동일 trace를 여러 judge로 돌려 score drift와 verdict flip을 따로 확인할 때[1][2]
- **human review queue**: Choice confidence나 Noul probability가 경계인 run만 annotation으로 보낼 때[3][7]
- **online eval pilot**: 비용 때문에 sample rate를 낮췄던 quality check를 더 넓은 trace set에서 시험할 때[1][2]
- **judge 자체의 eval**: agent output만 평가하지 않고, evaluator가 human rubric과 얼마나 일치하고 얼마나 안정적인지 다시 평가할 때[1][2][7]

## 도입 전에 확인할 점

- **Jev는 early access다.** TypeSafe는 Jev를 early-access public model로 소개하며, 일반적인 natural-language 답변·code generation model이 아니라 text-only structured decision surface로 설명한다.[3][4]
- **낮은 variance는 correctness가 아니다.** 언제나 같은 판정을 내리는 judge도 동일하게 틀릴 수 있다. representative sample을 human annotation으로 먼저 맞추고, rubric·threshold·failure category를 version control해야 한다.[1][2][7]
- **이 repo는 서비스 SDK가 아니다.** tags/release/license가 없는 개인 experiment repo이므로, 그대로 production template로 vendoring하기보다 dataset freeze·oracle labeling·repeatability analysis라는 방법만 가져오는 편이 낫다.[5][6]
- **비용은 input과 provider 조건에 종속된다.** 여기의 $0.00035/call은 해당 experiment의 prompt·trace·pricing 조건에서 나온 관측값이지, 모든 Jev evaluator의 고정 가격표가 아니다.[1][7]

## 내 판단

이 예제의 가장 좋은 부분은 Jev를 “LLM judge 대체재”로 선언하는 데 있지 않다. **모든 judge는 정확도, 반복성, 비용, latency를 분해해 평가해야 한다**는 운영 습관을 코드와 archive data로 보여 준다는 데 있다.

LangSmith를 이미 쓰는 팀이라면 작은 고정 trace dataset부터 시작해, human label·judge variance·cost를 같은 dashboard에서 보자. Jev는 typed decision이 잘 맞는 rubric에 한해 비교 후보로 넣되, human review와 independent outcome check를 없애는 근거로 사용하지 않는 편이 좋다.[1][2][3]

## 참고한 공개 자료

- [LangChain — Can Jev Be a Better Agent Evaluator?](https://www.langchain.com/blog/jev-agent-evals-langsmith)
- [LangSmith Evaluation concepts](https://docs.smith.langchain.com/evaluation)
- [TypeSafe System One documentation](https://docs.typesafe.ai/concepts/system-one)
- [TypeSafe — Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [Jev-as-a-Judge reproducibility repository](https://github.com/danielgshea/jev-as-a-judge)

## Sources

[1] https://www.langchain.com/blog/jev-agent-evals-langsmith — LangChain Jev-as-a-Judge evaluation report
[2] https://docs.smith.langchain.com/evaluation — LangSmith evaluation concepts
[3] https://docs.typesafe.ai/concepts/system-one — TypeSafe System One documentation
[4] https://typesafe.ai/blog/introducing-system-one-models-and-jev — TypeSafe Jev announcement
[5] https://github.com/danielgshea/jev-as-a-judge — Jev-as-a-Judge reproducibility repository
[6] https://api.github.com/repos/danielgshea/jev-as-a-judge — Jev-as-a-Judge repository metadata
[7] https://raw.githubusercontent.com/danielgshea/jev-as-a-judge/main/README.md — Jev-as-a-Judge README
