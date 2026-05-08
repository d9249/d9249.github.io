---
title: "LoPE는 왜 의미 없는 문장으로 GRPO의 막힌 탐색을 푸는가"
date: "2026-05-08T19:01:11"
description: "LoPE는 hard question에서 실패한 롤아웃에 Lorem Ipsum 기반 프롬프트 교란을 추가해 GRPO의 zero-advantage 병목을 깨고, prompt-space exploration이 단순 추가 샘플링보다 더 넓은 reasoning 경로를 열 수 있음을 보여준다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Reinforcement Learning
  - GRPO
  - Reasoning
  - RLVR
  - Qwen
draft: false
---

GRPO 계열 RLVR이 reasoning 모델 학습의 표준처럼 자리 잡으면서, 이제 병목은 “정답을 맞힌 샘플을 어떻게 더 잘 강화할까”보다 “애초에 정답 샘플이 하나도 안 나오는 질문을 어떻게 살릴까”로 옮겨가고 있다. 어려운 문제에서 롤아웃 전체가 실패하면 relative advantage가 0으로 붕괴하고, 그 질문은 학습에 거의 기여하지 못한다. 논문이 말하는 zero-advantage problem은 단순한 구현 디테일이 아니라, 계산을 많이 써도 학습 신호가 생기지 않는 구조적 낭비다.

`Nonsense Helps: Prompt Space Perturbation Broadens Reasoning Exploration`은 이 병목을 surprisingly low-tech한 방식으로 건드린다. 더 높은 temperature나 더 많은 resampling으로 logit-space를 밀어붙이는 대신, 프롬프트 앞에 Lorem Ipsum 계열의 무의미한 라틴어 시퀀스를 붙여 prompt-space 자체를 살짝 흔든 뒤 다시 샘플링한다. 저자들은 이 방식을 LoPE(Lorem Perturbation for Exploration)라고 부른다.

흥미로운 점은 이 아이디어가 단순한 트릭 소개에 머물지 않는다는 것이다. 논문은 왜 이런 교란이 orthogonal reasoning path를 열 수 있는지 설명하고, off-policy 문제를 보정하는 training signal shaping까지 더해 1.7B·4B·7B 수학 추론 모델에서 일관된 개선을 보고한다. 동시에 공식 GitHub 저장소도 공개돼 있어, 지금 시점의 LoPE는 “아이디어만 있는 논문”이 아니라 최소한의 재현용 코드와 예시를 갖춘 연구 아티팩트로 볼 수 있다.

![LoPE overview](https://arxiv.org/html/2605.05566v1/x1.png)

## 무엇을 해결하려는가

이 논문이 겨냥하는 문제는 단순히 hard question에서 정답률이 낮다는 사실이 아니다. 더 정확히 말하면, **GRPO가 실패한 질문을 다시 활용하는 방식이 생각보다 빈약하다**는 점이다. 같은 질문에서 `G`개의 응답이 모두 실패하면 그룹 내부 상대 비교로 계산되는 advantage가 모두 0에 가까워지고, 해당 샘플은 사실상 학습 손실에서 사라진다. 계산은 썼는데 policy update에는 별 신호가 남지 않는 셈이다.

기존 대응은 대개 같은 프롬프트로 더 많이 뽑아보는 resampling, 혹은 temperature를 높여 확률 분포를 넓히는 식의 logit-space exploration이다. 하지만 저자들의 관찰은 여기서 한 걸음 더 나간다. 어려운 문제는 현재 policy가 이미 특정 reasoning basin에 갇혀 있기 때문에, 같은 프롬프트를 더 오래 샘플링해도 질문 단위 성공률이 크게 오르지 않을 수 있다는 것이다.

LoPE는 그래서 “더 많이 뽑자”가 아니라 “질문은 그대로 두되 입력 문맥을 semantically neutral하게 흔들자”는 가설을 세운다. 즉 정답 힌트를 추가하지 않으면서도, 모델이 다른 reasoning trajectory로 들어가게 만들 수 있다면 zero-advantage 문제를 더 자주 회복할 수 있다는 주장이다.

## 핵심 아이디어 / 구조 / 동작 방식

LoPE의 기본 루프는 의외로 단순하다.

첫째, 원래 프롬프트로 `G`개의 응답을 샘플링한다. 이 중 하나라도 맞으면 일반적인 GRPO 업데이트로 가면 된다. LoPE가 개입하는 시점은 **모든 응답이 실패한 질문**뿐이다.

둘째, 그런 질문에만 100~300 토큰 길이의 Lorem Ipsum 기반 랜덤 시퀀스를 프롬프트 앞에 prepend한 뒤, 추가로 `G' = 24`개의 응답을 재샘플링한다. 중요한 것은 이 시퀀스가 task-relevant hint가 아니라는 점이다. 논문은 자연어처럼 보이지만 의미는 비어 있는 pseudo-Latin 텍스트를 사용해, 문제 자체를 바꾸지 않으면서도 모델의 출력 분포를 이동시키는 데 집중한다.

셋째, policy update 단계에서는 원래 실패한 응답들과 재샘플링에서 나온 성공 응답 일부를 섞어 다시 `G`개 그룹을 만든다. 여기서 최소 하나의 실패 응답은 남겨 두어 relative advantage가 0이 되지 않게 설계한다. 즉 LoPE는 무한정 많은 positive sample을 모으는 방식이 아니라, **실패 그룹을 학습 가능한 mixed group으로 재구성**하는 방식에 가깝다.

넷째, 재샘플링 응답은 실제로는 교란된 프롬프트에서 생성됐지만, 학습 시에는 원래 프롬프트와 짝지은 pseudo rollout으로 사용한다. 이 때문에 off-policy discrepancy가 생기는데, 논문은 importance sampling ratio로 이를 보정한다. 또한 KL regularization은 제거한다. 저자들의 해석은 분명하다. LoPE의 목적 자체가 distributional shift를 이용해 새로운 reasoning path를 여는 것인데, KL이 그 변화를 눌러버리면 오히려 핵심 메커니즘과 충돌한다는 것이다.

여기서 끝나지 않는다. 논문은 LoPE 위에 **training signal shaping**을 추가한다. 하나는 policy shaping으로, 원래 policy 아래에서 확률이 낮은 토큰들이 off-policy 학습에서 지나치게 약하게 업데이트되는 문제를 완화한다. 다른 하나는 advantage shaping으로, 선택된 `G`개 응답만이 아니라 `G + G'` 전체 보상 통계로 난이도를 추정해 rare success의 positive advantage를 더 크게 복원한다. 부록 설명까지 포함하면, 이 shaping은 positive advantage를 대략 2.1배에서 5.0배까지 키우는 역할을 한다.

| 구성 요소 | 논문에서의 역할 | 실무적으로 읽히는 의미 |
|---|---|---|
| Prompt-space perturbation | Lorem Ipsum 시퀀스를 prepend해 재샘플링 | 같은 질문에서도 다른 reasoning basin으로 진입 시도 |
| Response regrouping | 실패 응답과 재샘플 성공 응답을 섞어 새 그룹 구성 | zero-advantage로 죽은 샘플을 다시 학습 가능 상태로 복구 |
| Pseudo rollout + importance sampling | 교란 프롬프트에서 생성한 응답을 원래 프롬프트 기준으로 학습 | off-policy 업데이트를 정당화하는 보정 장치 |
| Policy shaping | 낮은 확률 토큰의 gradient 억눌림 완화 | rare-but-useful reasoning step을 더 강하게 학습 |
| Advantage shaping | `G+G'` 전체 보상으로 난이도 재평가 | 드문 성공 샘플의 보상 신호를 과소평가하지 않음 |

![Hard-question overlap](https://arxiv.org/html/2605.05566v1/x3.png)

## 공개된 근거에서 확인되는 점

가장 직접적인 정량 근거는 Table 1이다. LoPE는 세 모델 스케일 모두에서 평균 성능을 끌어올린다. 특히 training signal shaping까지 포함한 최종 설정 기준 평균 점수는 Qwen3-1.7B-Base에서 39.82, Qwen3-4B-Base에서 53.99, Qwen2.5-Math-7B에서 53.88이다. 같은 표에서 GRPO 평균은 각각 37.03, 49.37, 47.68이므로 개선 폭은 대략 +2.79, +4.62, +6.20이다.

| 모델 | GRPO 평균 | LoPE 최종 평균 | 차이 |
|---|---:|---:|---:|
| Qwen3-1.7B-Base | 37.03 | 39.82 | +2.79 |
| Qwen3-4B-Base | 49.37 | 53.99 | +4.62 |
| Qwen2.5-Math-7B | 47.68 | 53.88 | +6.20 |

단순 resampling과의 차이도 중요하다. Qwen3-4B-Base에서 naive prompt resampling은 평균 48.95로 오히려 GRPO(49.37)보다 낮다. 반면 같은 조건에서 LoPE 최종 설정은 53.99까지 올라간다. 논문이 말하고 싶은 바는 분명하다. **추가 compute 자체가 아니라 어떤 방향으로 exploration을 넓히느냐가 더 중요하다**는 것이다.

또 하나의 핵심 증거는 hard subset overlap 그림이다. 352개 hard question subset에서 LoPE가 해결한 질문들은 naive prompting이나 high-temperature sampling이 해결한 질문과 완전히 겹치지 않는다. 즉 LoPE의 이득은 단순히 “같은 문제를 조금 더 자주 맞힌다”가 아니라, 다른 방법이 못 여는 질문 단위 탐색 경로를 추가로 연다는 해석이 가능하다.

![Training-time resample success](https://arxiv.org/html/2605.05566v1/x5.png)

훈련 중 동작도 흥미롭다. Figure 4 설명에 따르면 LoPE와 LoPE+training signal shaping은 response-level accuracy는 비슷하지만, question-level success rate(pass@24)에선 naive resampling보다 일관되게 높다. 이는 어떤 질문 몇 개에만 반복적으로 맞히는 것이 아니라, 성공 질문의 coverage 자체를 넓힌다는 의미다. RL 관점에서는 단순 정답률보다 더 중요한 신호일 수 있다. 더 넓은 질문 집합에서 positive trajectory를 확보해야 학습 데이터 활용률이 올라가기 때문이다.

논문은 왜 Lorem Ipsum이 특히 잘 먹히는지도 분석한다. 500개 perturbation 시퀀스 기준 perplexity 분석에서 Question Text는 4.82, Lorem Ipsum은 25.12, Filtered Latin Natural Language는 46.09, Latin Unigram Model은 51.32였다. 반면 Random ASCII는 492.93, Random Fake English는 2429.9, Random Token은 `4.6×10^5`까지 치솟는다. Table 2에서도 낮은 perplexity를 보인 near-natural perturbation 계열이 가장 좋은 성능을 내고, Random Token은 오히려 학습을 해친다.

![Perturbation perplexity regimes](https://arxiv.org/html/2605.05566v1/x6.png)

공개 범위도 체크할 만하다. GitHub 저장소 `shrango/LoPE`는 2026-04-23 생성, 기본 브랜치는 `main`, 라이선스는 Apache-2.0이며 조회 시점 기준 GitHub releases와 tags는 없다. 다만 README, 예시 config, `case_examples.jsonl`, baseline 예시 디렉터리, 그리고 논문 핵심 figures용 asset은 공개돼 있다. 즉 현재 패키징은 초기 연구 코드에 가깝고, 버전 릴리스가 정교하게 붙은 production-ready toolkit과는 거리가 있다.

## 실무 관점에서의 해석

내가 보기에 이 논문의 진짜 포인트는 “더 강한 exploration은 더 높은 temperature에서 나오지 않을 수 있다”는 점이다. 지금까지 reasoning RL에서는 exploration을 거의 logit-space 문제로 보는 경향이 강했다. 샘플 수를 늘리거나 temperature를 올리거나 budget allocation을 바꾸는 식이다. 그런데 LoPE는 **입력 문맥의 미세한 구조 변화만으로도 완전히 다른 reasoning trajectory가 열린다**는 사실을 보여준다.

이 관점은 단지 수학 벤치마크에만 갇히지 않는다. 향후 tool-using agent나 long-horizon reasoning policy를 학습할 때도, 막힌 질문에 대해 더 많은 rollout만 던질 것이 아니라 prompt pattern 자체를 controlled하게 흔드는 방식이 하나의 표준 장치가 될 수 있다. 특히 hard case recovery가 중요하고, 실패 질문이 대량으로 버려지는 RL 파이프라인이라면 꽤 현실적인 설계 힌트다.

동시에 한계도 선명하다. 첫째, 실험은 OpenR1-Math-46k 기반 수학 추론 세팅에 집중돼 있어 일반 agent 환경으로의 외삽은 아직 조심스럽다. 둘째, LoPE는 결국 off-policy 학습과 shaped objective에 크게 의존하므로, perturbation 아이디어 하나만 따로 떼어 써서 같은 효과가 날지는 별개 문제다. 셋째, 공개 저장소는 존재하지만 releases/tags가 없고 프로젝트가 막 공개된 초기 상태라, 재현성 경험은 앞으로 더 검증돼야 한다.

그럼에도 불구하고 LoPE는 요즘 RL for reasoning 연구에서 꽤 중요한 메시지를 던진다. **정답 경로를 더 많이 샘플링하는 것과, 더 다양한 질문에서 정답 경로를 처음 발견하게 만드는 것은 다른 문제**라는 점이다. 이 논문은 후자에 대한 surprisingly cheap한 해법 하나를 제시한다. 그리고 그 해법이 무의미한 라틴어라는 점이, 오히려 prompt-space exploration이라는 관점을 더 또렷하게 만든다.

Sources: https://arxiv.org/abs/2605.05566, https://arxiv.org/html/2605.05566v1, https://github.com/shrango/LoPE, https://api.github.com/repos/shrango/LoPE, https://api.github.com/repos/shrango/LoPE/readme