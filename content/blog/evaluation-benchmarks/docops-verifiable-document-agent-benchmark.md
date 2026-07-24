---
title: "DocOps는 문서 에이전트를 ‘파일이 열리는가’가 아니라 ‘원본 상태를 보존했는가’로 평가한다"
date: "2026-07-24T17:20:27"
description: "DocOps는 XLSX·DOCX·PPTX·PDF의 native state를 직접 검사하는 deterministic verifier와 210개 Harbor task로, 문서 에이전트의 장기 상태 추적·의미 검증·비파괴 편집 한계를 드러내는 평가 프레임워크다."
author: "Sangmin Lee"
category: "evaluation-benchmarks"
tags:
  - DocOps
  - Document Agents
  - Benchmark
  - Agent Evaluation
  - Document Intelligence
draft: false
---

문서 작업 agent가 “표에 열 하나를 추가해 달라”는 요청을 처리했다고 말하는 순간에도, 실제 파일은 여러 방식으로 망가질 수 있다. Excel 수식이 숫자 값으로 평탄화될 수 있고, PowerPoint 표 대신 텍스트 상자가 겹쳐질 수 있으며, PDF에서 수정하지 말아야 할 bookmark나 승인 페이지의 순서가 바뀔 수 있다. 파일을 열어 보고 문장이 그럴듯하다고 해서, 요청한 **native document state**가 제대로 도달했는지는 별개의 문제다.

`DocOps: A Verifiable Benchmark for Autonomous Agents in Complex Document Operations`는 바로 이 빈틈을 평가 대상으로 삼는다. 이 논문은 문서를 읽기 위한 텍스트 저장소나 여러 앱 사이에서 이동하는 payload가 아니라, content·format·structure와 숨은 의존성을 가진 **상태적 계산 객체**로 본다. 그리고 agent가 최종 산출물 파일을 제출하면, 사람이 답변을 읽거나 LLM judge가 인상을 채점하는 대신 document-native library로 결과물을 직접 검사한다.

핵심 결론도 만만치 않다. 논문에서 가장 높은 전체 pass rate를 보인 구성은 GPT-5.5 + Codex + skill의 **0.671**이다. 가장 강한 조합도 210개 task 중 거의 3분의 1에서 실패한 셈이다. 단일·국소 edit에서는 성능이 괜찮아 보여도, 한 문서 전체의 상태를 오래 유지하거나 여러 문서를 정합해야 하는 workflow 난이도에서 급격히 무너진다.

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/docops-overview.webp">
    <img
      src="/images/blog/docops-overview.webp"
      alt="실제 업무 요구에서 출발해 content·format·structure 작업 분류와 L1부터 L4까지 난이도 분류, agent harness, deterministic verifier로 이어지는 DocOps 전체 구조"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 overview. DocOps는 실무 seed를 task package로 만들고, operation/difficulty taxonomy 아래에서 여러 agent harness를 실행한 뒤 구조·언어·보존 predicate로 제출 파일을 검사한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

기존 document benchmark는 대체로 두 갈래였다. 하나는 PDF·문서에서 정보를 읽어 답하는 document understanding/QA이고, 다른 하나는 여러 앱을 오가며 업무 workflow를 끝냈는지 보는 office automation 평가다. 전자는 문서를 거의 읽기 전용 knowledge source로 취급하고, 후자는 문서를 application 사이에서 옮기는 payload로 다루기 쉽다.

하지만 실제 문서 업무에서 중요한 것은 “요청한 부분을 고쳤다”와 동시에 “고치지 말아야 할 나머지를 보존했다”는 것이다. 예를 들어 spreadsheet에서 새 합계를 넣었다면 그 값이 올바른 **formula**로 계산돼야 하고, Word/PPTX에서 표 구조를 바꾸라고 했으면 보이는 텍스트가 아니라 native table object가 바뀌어야 한다. 여러 파일을 합쳐 보고서 패키지를 만드는 경우에는 페이지·bookmark·참조·승인된 기존 자료의 전역 순서도 유지돼야 한다.

DocOps의 문제 정의는 이를 상태 전이로 바꾼다. agent는 문서의 요청 상태를 달성해야 하고, native format의 유효성과 task가 명시한 out-of-scope state까지 보존해야 한다. 이 프레임을 쓰면 “agent가 실패했다”를 한 점수로 끝내지 않고, local structure를 깨뜨렸는지, long-horizon state를 잃었는지, surface-level output만 확인했는지 진단할 수 있다.

| 기존 평가에서 빠지기 쉬운 것 | DocOps의 계약 | 의미 |
|---|---|---|
| 답변 텍스트나 렌더 화면만 확인 | native file을 직접 검사 | 열리지만 formula·outline·bookmark가 깨진 파일을 잡아냄 |
| 요청한 edit만 확인 | preservation predicate도 검사 | 건드리지 말아야 할 sheet·style·페이지가 유지됐는지 확인 |
| 한 앱 안의 짧은 작업 중심 | L1~L4의 workflow depth | 단일 edit부터 cross-document workflow까지 상태 관리 난이도를 분리 |
| task-level 성공/실패만 기록 | operation·format·harness별 분석 | 모델·도구·실행 환경 중 어디가 병목인지 해석 가능 |

## 핵심 아이디어: 두 축 taxonomy와 artifact-level verifier

DocOps의 operation axis는 문서 조작을 세 층으로 나눈다. **Content**는 extraction, editing, generation, computation, reasoning처럼 의미와 수치에 닿는 작업이다. **Format**은 style consistency, highlighting, layout, theme transfer처럼 표현 상태를 본다. **Structure**는 insert/delete, reorder, hierarchy, table/sheet operation처럼 문서의 native object organization을 다룬다.

여기에 difficulty axis를 직교로 둔다. **L1**은 한 개의 atomic edit, **L2**는 한 artifact 안에서 여러 atomic operation을 조합한 task다. **L3**는 하나의 복잡한 문서에서 장기 workflow를 수행해야 하고, **L4**는 여러 source document에서 최종 artifact를 만들어 정보와 상태를 맞춰야 한다. 따라서 “표 편집을 잘한다”와 “오래 걸리는 문서 workflow에서 전체 상태를 놓치지 않는다”를 구분해 볼 수 있다.

각 task는 Harbor package로 배포된다. source artifact, 자연어 instruction, 선택적인 document skill, deterministic verifier가 함께 들어 있으며, 전체 release는 **210개 task**로 구성된다. 분포는 L1 50개, L2 40개, L3 60개, L4 60개다. 대상 format은 Excel, Word, PowerPoint, PDF 네 종류다.

검증기는 whole-file byte match를 요구하지 않는다. 대신 유효한 여러 실행 경로를 허용하면서도 세 종류의 predicate를 조합한다.

| predicate | 확인하는 것 | 막으려는 거짓 성공 |
|---|---|---|
| Structural predicate | formula, outline hierarchy, native table/sheet 등 underlying state | 화면상 그럴듯하지만 실제 구조가 깨진 결과 |
| Linguistic anchor | task에 필요한 텍스트·진단 keyword | 내용이 누락되거나 엉뚱하게 바뀐 결과 |
| Preservation predicate | 보호된 style, 수정 대상 밖 sheet·페이지·요소 | 요청 범위를 넘는 destructive modification |

논문은 verifier fidelity도 따로 점검했다. 문서 작업 경험이 있는 CS PhD candidate가 128개 sampled decision을 artifact 단위로 판정한 human audit에서 verifier는 **122개(95.31%)**와 일치했다. 또 36개 verified output에 가한 180개 controlled mutation 중 **174개(96.67%)**의 위반을 탐지했다고 보고한다. 완전무결하다는 뜻은 아니지만, 단순 exact match나 LLM judge보다 document-state 검증에 가까운 contract를 제공하려는 근거다.

## 결과: 모델보다 harness, local edit보다 workflow가 더 크게 갈린다

프로젝트 페이지의 전체 결과는 document agent 성능이 base model 이름 하나로 설명되지 않는다는 점을 보여 준다. GPT-5.5는 DocTools에서 0.138이지만 Terminus-2에서 0.524, Codex + skill에서 0.671을 기록한다. GPT-5.4도 Codex + skill 0.662, Codex without skill 0.638이다. 같은 모델이라도 실행 loop, filesystem feedback, script execution, skill 제공 여부가 결과를 바꾼다.

| 모델 | DocTools | Terminus-2 | Codex + Skill | Codex | Claude Code + Skill | Claude Code |
|---|---:|---:|---:|---:|---:|---:|
| GPT-5.5 | 0.138 | 0.524 | **0.671** | 0.648 | – | – |
| GPT-5.4 | 0.119 | 0.452 | 0.662 | 0.638 | – | – |
| Claude Sonnet 4.6 | 0.119 | 0.419 | – | – | 0.519 | 0.552 |
| DeepSeek-V4-Pro | 0.057 | 0.467 | 0.424 | 0.400 | 0.400 | 0.433 |
| Qwen3.6-27B | 0.095 | 0.476 | 0.210 | 0.248 | 0.424 | 0.386 |

이 표는 skill의 효과를 단순화해서 읽으면 안 된다는 점도 보여 준다. 예를 들어 GPT-5.5와 GPT-5.4에서는 Codex skill이 각각 0.023, 0.024p 높지만, Claude Sonnet 4.6은 Claude Code without skill(0.552)이 with skill(0.519)보다 높다. 논문은 procedural guidance가 중간급 open model에는 큰 촉매가 될 수 있지만, 이미 zero-shot orchestration이 강한 frontier model에는 효과가 작거나 일관되지 않을 수 있다고 해석한다.

더 중요한 것은 difficulty cliff다. 논문에서 GPT-5.5는 available harness 평균 기준 L1에서 **0.725**, L4에서 **0.237**로 하락한다. 전체 설정의 평균 pass rate도 L1 0.610에서 L4 0.446으로 내려간다. local edit보다 document-wide dependency와 cross-document alignment가 병목이라는 뜻이다.

format별로는 Excel이 특히 취약하다. 평균 pass rate는 L1 0.671에서 L2 0.433, L3 0.058로 급락한다. formula reference, data validation boundary, sheet order, hidden state처럼 local error가 전체 workbook로 전파될 수 있는 의존성 때문이다. 반면 PDF는 L3에서 0.233으로 네 format 가운데 가장 높았다. 논문은 상대적으로 modular한 page-level state 변화가 복잡하게 결합된 spreadsheet state보다 agent에 덜 어렵다는 관찰을 제시한다.

## 세 가지 실패는 ‘모델이 문서를 읽지 못한다’보다 더 구체적이다

DocOps가 제시한 failure mode는 product팀이 바로 점검 항목으로 옮길 수 있을 만큼 구체적이다.

1. **Long-term state tracking failure**: agent가 국소 수정은 마쳤지만, packet 전체의 페이지 순서나 이미 승인된 기존 구성요소를 잃어버린다.
2. **Shallow semantic verification**: spreadsheet에 값과 formula처럼 보이는 것이 있어도, 실제로는 잘못된 formula이거나 static value여서 계산 의미가 맞지 않는다.
3. **Destructive editing**: PPT table에 column을 추가하라는 요청에 native table을 바꾸는 대신 텍스트 상자를 덧붙이는 식으로, 출력의 외관은 흉내 내지만 구조 metadata를 훼손한다.

이 구분은 왜 final screenshot 검사나 자연어 self-report만으로 부족한지를 잘 보여 준다. agent가 “완료했다”고 말하고 파일이 열려도, 다음 사람이나 다음 workflow가 그 native artifact를 다시 사용할 때 실패할 수 있다. 문서 agent의 신뢰성은 생성 텍스트 품질만이 아니라 **후속 작업자가 조작 가능한 구조를 남겼는가**에 달려 있다.

## 공개 범위와 재현성은 어디까지인가

공식 GitHub 저장소 `icip-cas/DocOps`는 논문과 같은 시기인 2026년 7월 22일 생성된 public repository다. checked-in `LICENSE`와 GitHub API는 모두 Apache-2.0으로 일치한다. README는 complete 210-task release, deterministic verifier, harness wrapper, document-operation skill, Docker base image를 포함한다고 명시한다.

실행은 Python 3.12 이상과 Docker를 전제로 하며, 제공된 base image는 Linux amd64/x86_64 profile이다. README는 ARM64 machine에 별도로 export한 image set이 필요하다고 안내한다. 또한 각 harness의 API credential 또는 OpenAI-compatible endpoint 설정이 필요하다. 즉 단순 Python package 설치 뒤 노트북에서 바로 돌리는 benchmark라기보다, containerized agent runtime까지 포함한 **research evaluation bundle**로 보는 편이 정확하다.

현재 release maturity도 차분히 읽을 필요가 있다. GitHub API 기준 repository는 public이고 Apache-2.0 license가 확인되지만, 확인 시점에 stars 3, forks 0이며 GitHub Releases latest endpoint는 404, tags 목록도 비어 있다. 이는 논문의 data/code/harness가 공개되지 않았다는 뜻은 아니다. README가 210 task package와 run script를 실제로 제공한다. 다만 versioned release artifact나 간편 설치형 framework로 다듬어진 단계라기보다, 새로 공개된 재현용 benchmark bundle에 가깝다는 신호다.

## 실무 관점에서의 해석

DocOps의 가장 중요한 기여는 문서 automation의 목표를 “요청한 text를 만들었는가”에서 “검증 가능한 상태 전이를 수행했는가”로 옮긴 데 있다. 이 변화는 특히 ERP export, 재무 workbook, 계약·감사 패키지, 법무 문서, 제안서와 같이 한 번의 구조 훼손이 이후 workflow에서 비용이 되는 영역에서 중요하다.

agent를 실제 업무에 연결하는 팀이라면, benchmark 점수보다 먼저 이 평가 철학을 운영 규칙으로 가져올 만하다. 요청 범위와 보존 범위를 명시하고, formula·style·outline·bookmark 같은 native invariant를 테스트하며, final rendering뿐 아니라 underlying structure를 검사해야 한다. 모델 교체나 prompt 개선만으로 신뢰도가 해결되리라 기대하기보다, harness의 filesystem feedback, skill, task-specific verifier, human review gate를 함께 설계해야 한다는 것이다.

다만 DocOps는 controlled task package이며, 210개 task가 모든 실제 조직 문서의 보안 정책·권한 모델·매크로·협업 conflict·proprietary template을 대표하지는 않는다. 그래서 이 benchmark는 일반 사무 자동화의 최종 리더보드라기보다, **비파괴적이고 state-aware한 document agent를 만들기 위해 무엇을 측정해야 하는지 제시하는 diagnostic contract**로 읽는 편이 가장 생산적이다.

Sources: https://arxiv.org/abs/2607.19865, https://arxiv.org/pdf/2607.19865, https://docopsbench.github.io, https://github.com/icip-cas/DocOps, https://raw.githubusercontent.com/icip-cas/DocOps/main/README.md, https://raw.githubusercontent.com/icip-cas/DocOps/main/LICENSE