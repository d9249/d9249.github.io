---
title: "Weight-Space Programming: LLM은 신경망 가중치를 읽고 고칠 수 있을까"
date: "2026-11-06T22:41:54"
description: "Weight-Space Programming은 LLM이 학습 코드를 작성하는 대신 신경망 가중치를 직접 해석·수정하는 초기 실험이다. 작은 게임 정책부터 Qwen3.5의 반복 추론 교정까지, 도구·피드백 조건과 성공하지 못한 사례를 함께 살펴본다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Weight-Space Programming
  - Mechanistic Interpretability
  - Gradient-Free Optimization
  - Model Editing
  - Qwen
draft: false
---

LLM에게 학습 코드를 작성하게 하는 것과, **신경망의 가중치 자체를 읽고 고치게 하는 것**은 다른 문제다. Rikiya Takehi·Jayden Teoh·Alex Zhang·Omar Khattab이 11월 2일 공개한 *Sparks of Weight-Space Programming*은 후자의 가능성을 탐색한 연구 블로그다.[1]

편집자 역할의 GPT-6 Astra가 작은 네트워크의 용도를 추정하고, 게임 정책의 가중치를 직접 작성하며, Qwen3.5-0.8B의 반복 추론을 줄이는 사례를 제시한다.[1]
다만 모든 실험이 “숫자만 보고, 데이터도 도구도 피드백도 없이” 수행된 것은 아니다. **가중치 읽기, 일회성 작성, 제한된 실행 피드백을 이용한 수정**을 구분해서 읽는 것이 핵심이다.[1][2]

## 학습 알고리즘 대신 가중치를 편집 대상으로 삼는다

이 글에서 말하는 Weight-Space Programming은 자연어로 주어진 목표에 맞춰 LLM이 가중치를 직접 읽거나 쓰는 방식이다.[1]
경사하강법이나 학습 루프를 생성해 돌리는 것은 허용하지 않는다.[1]
작은 모델은 가중치를 텍스트로 전달하고, 더 큰 모델은 별도 Python 하네스에서 텐서를 읽고 저장하게 한다.[2]

여기서 “도구 없음”의 범위에도 주의가 필요하다. 로그의 `tool_free`는 Codex 자체 도구를 사용하지 않았다는 감사 결과이고, 일부 실험에서는 연구진의 별도 샌드박스가 Python 코드와 제한된 순전파 요청을 실행해 결과를 돌려준다.[2]
따라서 `tool_free`를 전체 과정에 계산 도구가 없었다는 뜻으로 읽으면 안 된다.[2]

## 읽기: 무엇을 학습한 네트워크인지 알아낼 수 있을까

초기 실험에서는 같은 구조로 학습한 게임 정책의 전체 가중치와 입력 채널·행동의 의미를 주고 게임 이름을 묻는다.[1]
네 게임 모두 맞혔다고 보고하지만, 아키텍처나 입출력의 의미까지 가린 완전한 블랙박스 판독은 아니다.[1]
작은 확산 모델에서는 도구와 순전파 없이 도형을 알아냈지만, 실제로는 채워진 도형을 생성하는 모델을 윤곽선으로 묘사하는 한계도 드러났다.[1]

더 흥미로운 것은 입출력 층을 제거한 문자 단위 언어 모델 실험이다.[10]
Python·로마자 일본어·영어로 각각 학습한 세 모델의 중간 블록만 제공하고, Python으로 행렬을 분석하되 네트워크나 개별 층을 입력에 실행하는 것은 금지했다.[10]
각 모델에서 두 차례씩 진행한 대화에서 학습 텍스트를 맞히고, 반복된 문자열 뒤의 글자를 복사하는 induction head도 찾아냈다.[10]

<figure>
  <img src="/images/blog/weight-space-programming-copy-heads.webp" alt="Python·로마자 일본어·영어 모델의 복사 헤드 위치를 Astra의 가중치 분석과 실제 실행 측정으로 나란히 비교한 원문 그림" />
  <figcaption>주황색은 실측과 일치한 복사 헤드를 나타낸다.[1] 모바일에서는 그림을 좌우로 밀거나 눌러 확대할 수 있다.</figcaption>
</figure>

이 일치는 induction score가 0.2를 넘는 헤드를 복사 헤드로 보는 기준에 따른다.[10]
공개 README는 채점 JSON의 일부 필드가 더 엄격한 0.3 기준을 사용한다고도 설명한다.[10]
모든 헤드의 기능을 완전히 해독했다거나, 임의의 대형 모델에도 같은 성공률을 보장한다는 결과로 확대할 수는 없다.

## 쓰기: 정책을 신경망 안에 직접 구현한다

MinAtar 실험에서는 게임 규칙과 실제 소스 코드, 입출력 배치, 네트워크 구조를 제공하고 모든 가중치를 0에서 시작한다.[6]
Astra는 도구나 사전 플레이 없이 한 번의 답변으로 가중치 설정을 작성한다.[6]
연구진은 이를 게임당 1,000개 에피소드에서 평가했다.[6]
세 게임 모두 보고된 1억 스텝 PPO 기준선을 넘었지만, 5억 스텝 PPO와 비교하면 Seaquest와 Asterix에서는 뒤졌다.[6]
이는 알려진 규칙을 작은 신경망의 연산으로 구현하는 능력의 증거이지, 모든 강화학습을 무조건 대체한다는 증거는 아니다.

Kinetix 차량 과제에서는 학습된 정책이 경사로에서 막히는 상황을 고친다.[1]
이때는 **장면 설명과 실패한 에피소드 하나를 이미 제공**했다.[1]
저자들은 한 번의 가중치 수정으로 평가 1,024회 모두 성공했다고 보고한다.[1]

<figure>
  <img src="/images/blog/weight-space-programming-carjump.webp" alt="경사로에서 멈춘 흐린 차량과 뒤로 물러나 빨간 구간을 넘어 파란 목표에 도달한 수정 차량을 함께 표현한 원문의 Kinetix 장면 그림" />
  <figcaption>원문의 차량 과제 설명 그림. 실제 평가를 다시 실행한 영상이 아니라, 실패 정책과 수정 후 동작을 설명하는 시각 자료다.[1]</figcaption>
</figure>

규모를 늘린 9×9 바둑 실험에서는 약 148만 개 가중치를 Python으로 작성하고, 별도 예산 안에서 대국이나 국면의 실행 결과를 보게 한다.[7]
여기서 한 번의 “pass”는 스칼라 하나를 계산하는 연산이 아니다. 최대 128개 대국 또는 256개 국면의 평가를 담을 수 있다. 실행 예산이 0인 조건과 50인 조건은 피드백 접근성이 다르다.[7]

## Qwen 수정: 새 수학 능력인가, 반복 루프의 해제인가

가장 큰 사례는 thinking 모드의 Qwen3.5-0.8B다.[5]
Astra는 CPU의 Python 커널에서 가중치를 다루고, GSM8K·MATH의 학습 문제와 정답 등을 연습 자료로 사용한다.[5]
테스트 벤치마크는 보여 주지 않는다.[5]
**경사·역전파·옵티마이저는 금지하지만, 연습 문제에 대한 실행과 관찰은 허용**한다.[5]

수학 실험의 순전파 도구는 요청 한 번에 최대 512개 응답 생성이나 최대 1,024개 텍스트의 teacher-forced 관찰을 허용한다. 따라서 “50회만 계산해 개선했다”는 식으로 비용을 축약해서는 안 된다.[5]
50-pass 실행의 기록은 158턴·Python 실행 80회이며, 대기·장애 시간을 포함한 전체 경과 시간은 20.3시간이다.[5]

저자들의 설명에 따르면 Astra는 반복을 일으키는 방향을 추적해 15·19번 층 MLP의 `down_proj`에서 각각 64개 출력 열을 수정했다.[3][5]
최종 보고서는 층별 반복 방향을 사용해 선택한 열의 방향 성분을 계수 6으로 빼는 편집을 기록한다.[11]
따라서 단순히 방향 성분을 한 번 제거한 개입과 같지 않으며, 변경한 항목 비율이 작다고 개입 강도까지 작다는 뜻은 아니다.[11]
수정 대상은 131,072개 가중치로 약 0.016%다.[5]
로그 문서는 bfloat16로 반올림한 뒤 실제 원본과 다른 값은 130,188개라고 구분한다.[5]

아래는 원문에 보고된 기본 모델과 50-pass 수정 모델의 결과다. 같은 thinking·샘플링 조건과 최대 32,768토큰에서 비교한 값이며, 마지막 행은 MATH-500 생성 응답 중 토큰 한도에 도달한 비율이다.[1][5]

<table style="width:100%;">
  <thead><tr><th style="min-width:0;padding:10px 8px;">지표</th><th style="min-width:0;padding:10px 8px;">기본</th><th style="min-width:0;padding:10px 8px;">수정</th></tr></thead>
  <tbody>
    <tr><td style="min-width:0;padding:10px 8px;">MATH-500</td><td style="min-width:0;padding:10px 8px;text-align:right;">7.9%</td><td style="min-width:0;padding:10px 8px;text-align:right;">48.1%</td></tr>
    <tr><td style="min-width:0;padding:10px 8px;">GSM8K</td><td style="min-width:0;padding:10px 8px;text-align:right;">13.8%</td><td style="min-width:0;padding:10px 8px;text-align:right;">67.1%</td></tr>
    <tr><td style="min-width:0;padding:10px 8px;">IFEval</td><td style="min-width:0;padding:10px 8px;text-align:right;">21.0%</td><td style="min-width:0;padding:10px 8px;text-align:right;">62.3%</td></tr>
    <tr><td style="min-width:0;padding:10px 8px;">토큰 한도 도달</td><td style="min-width:0;padding:10px 8px;text-align:right;">93.0%</td><td style="min-width:0;padding:10px 8px;text-align:right;">33.1%</td></tr>
  </tbody>
</table>

평가 설정은 temperature 0.6, top-p 0.95, top-k 20, presence penalty 1.5다.[5]
MATH-500은 문제당 4개 생성의 평균 정확도이고, GSM8K와 IFEval은 각각 2개 생성의 평균을 사용한다.[5]
여러 번 중 한 번만 맞히면 성공하는 pass@4 수치와는 다르다. IFEval은 thinking 이후의 최종 답변에 공식 검사기를 적용한 strict prompt-level 정확도다.[5]

기본 모델의 반복 문제는 Qwen 공식 카드에서도 경고한다.[4]
다만 Qwen3.5-0.8B는 기본이 non-thinking 모드이므로, 위 점수를 모든 기본 사용 상황의 성능으로 일반화하면 안 된다.[4]
표는 정해진 thinking 설정에서 반복을 줄인 효과를 보여 준다. 최적화한 샘플링과의 비교나 모든 모드에서의 개선을 입증한 것은 아니다.

실패 사례도 중요하다. 반복이 드문 Gemma 3 270M에 같은 방향의 실험을 했을 때 MATH-500은 기본 6.8%, 50-pass 수정 7.0%였고 뚜렷한 개선은 확인되지 않았다.[1]
Gemma의 이 점수는 답변 형식에 구애받지 않는 채점 결과다. Qwen의 마지막 `\boxed{}` 기반 채점과는 다르며, 토큰 한도·샘플링도 달라 모델 간 절대 점수를 직접 비교할 조건은 아니다.[12]
따라서 이번 Qwen 결과는 새로운 수학 지식을 주입했다기보다, 이미 있던 문제 해결 능력을 가로막던 반복을 줄인 사례로 해석하는 편이 신중하다.[1]

## 가중치만으로 아첨 성향까지 판독한 것은 아니다

Gemma 두 복사본 중 사용자 의견을 따르도록 학습한 모델을 찾는 가중치 전용 실험은 안정적인 구분을 입증하지 못했다.[13]
네 차례 시도에는 동률 판단과 미완료 실행도 포함되므로, 완결된 네 평가에서 정답률이 모두 0%였다는 뜻은 아니다.[13]
이후 직접 작성한 입력에 대한 attention 패턴을 관찰하게 하자 세 쌍 모두 구분했다고 보고한다.[13]
출력을 보여 주지 않았더라도, 이미 모델 실행에서 얻은 정보를 사용한 조건이다.[1]

<figure>
  <img src="/images/blog/weight-space-programming-sycophancy.webp" alt="정답을 따르는 모델과 사용자의 추측을 따르는 모델에서 attention 헤드 10.2가 질문 숫자와 사용자 답에 배분한 주의 비율을 비교한 원문 그림" />
  <figcaption>원문의 attention 비교. 한 헤드의 관찰 사례이며, 가중치만으로 아첨 성향을 일반적으로 검출하는 도구가 검증됐다는 뜻은 아니다.[1]</figcaption>
</figure>

이 구분은 향후 “실행 없는 모델 감사”라는 전망을 읽을 때도 필요하다. 가능성에 대한 제안과 이미 입증된 검사 능력은 다르다.

## 공개된 로그와 체크포인트를 어떻게 읽을 것인가

로그 저장소에는 입력·응답·실행 코드·평가와 최종 가중치 수정 내역이 공개되어 있다.[2]
다만 README는 발표에 사용한 실행만 포함하고, 이전 프롬프트의 시험 실행은 제외했다고 명시한다.[2]
큰 중간 activation·생성 파일과 실험별 하네스 일부도 빠져 있으므로, 모든 내부 산출물과 실행 환경이 완전히 공개된 패키지는 아니다.[5]
독자가 확인할 수 있는 연구 기록이 있다는 점과, 전체 시도에 대한 성공률을 추정할 수 있다는 점은 별개다.[2]

Hugging Face에는 수정된 체크포인트와 별도의 MATH-500 재실행 결과가 올라와 있다.[3]
모델 카드는 텍스트 전용 원실험과 달리 전체 멀티모달 패키지로 재구성했지만 언어 모델 텐서는 해시로 일치시켰다고 설명한다.[3]
공개 재실행 점수는 <strong>500문제·2,000개 생성에서 51.0%</strong>다.[9]
이는 원 발표의 48.1%와 구분해야 한다. 함께 공개된 기본 모델의 5.0%는 25문제 스모크 테스트이므로, 두 값을 전체 500문제의 동일 범위 비교처럼 나란히 쓰면 안 된다.[3]

배포물의 권리도 한 가지로 묶이지 않는다. 로그·데이터·네트워크는 CC BY 4.0, 저자 스크립트는 MIT이며, 프롬프트에 포함된 MinAtar 소스는 GPL-3.0이다.[8]
외부 벤치마크 자료는 각 원래 라이선스를 유지한다.[8]

## 무엇이 달라지고, 무엇은 아직 가설인가

이 연구의 설득력은 “이제 학습이 필요 없다”는 결론보다, **사람의 목표를 특정 가중치 변경으로 번역하는 편집 과정**을 구체적으로 공개했다는 데 있다. 작은 정책에서는 알고리즘을 신경망에 구현하고, 언어 모델에서는 실패 방향을 찾아 제한적으로 수정하는 모습이 나타난다.[1][2]

반면 표준화된 벤치마크·하네스는 향후 구축 과제로 제시된다.[1]
작은 수정이 항상 망각을 막거나, 임의의 능력을 추가하거나, 재귀적 자기개선을 실현한다는 주장은 아직 이 실험으로 확정할 수 없다.[1]
실무적으로는 수정 전후의 폭넓은 회귀 평가, 샘플링 대조군, 수정 이력과 롤백을 함께 갖춘 모델 디버깅 기법으로 바라보는 것이 타당하다.

## Sources

[1] https://rikiyat.github.io/blog/weight-space-programming
[2] https://github.com/RikiyaT/lm_understand-logs
[3] https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
[4] https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/README.md
[5] https://raw.githubusercontent.com/RikiyaT/lm_understand-logs/main/exp8_math/README.md
[6] https://raw.githubusercontent.com/RikiyaT/lm_understand-logs/main/exp5_write_from_scratch/README.md
[7] https://raw.githubusercontent.com/RikiyaT/lm_understand-logs/main/exp6_go_from_scratch/README.md
[8] https://raw.githubusercontent.com/RikiyaT/lm_understand-logs/main/LICENSE
[9] https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming/raw/main/eval/scores_edited_math500.json
[10] https://raw.githubusercontent.com/RikiyaT/lm_understand-logs/main/exp3_language/README.md
[11] https://raw.githubusercontent.com/RikiyaT/lm_understand-logs/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp8_math/runs/p50c/work_notes/final_report.md
[12] https://raw.githubusercontent.com/RikiyaT/lm_understand-logs/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp8_math/gemma_followup/README.md
[13] https://raw.githubusercontent.com/RikiyaT/lm_understand-logs/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp7_sycophancy/README.md
