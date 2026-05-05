---
title: "Doc-to-LoRA는 문서를 LoRA 어댑터로 즉시 내재화한다"
date: "2026-05-06"
description: "Doc-to-LoRA는 긴 문맥을 매번 다시 읽지 않고도 답할 수 있도록, 문서에서 LoRA 어댑터를 한 번의 forward pass로 생성하는 hypernetwork를 메타학습해 context distillation의 지연과 메모리 비용을 크게 줄이려는 접근이다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - LoRA
  - Hypernetworks
  - Context Distillation
  - Long Context
  - Gemma
draft: false
---

긴 문맥을 잘 다루는 것은 이제 LLM의 핵심 경쟁력 중 하나다. 문서 QA, 멀티스텝 리즈닝, 에이전트 워크플로우, 개인화된 비서까지 거의 모든 고급 사용 사례가 결국 길고 자주 바뀌는 컨텍스트를 얼마나 효율적으로 읽고 유지하느냐에 걸려 있다. 문제는 Transformer가 긴 입력을 받을수록 attention과 KV-cache 비용이 급격히 커지고, 응답 latency와 메모리 사용량도 함께 불어난다는 점이다.

Doc-to-LoRA: Learning to Instantly Internalize Contexts는 이 병목을 꽤 흥미로운 방식으로 우회한다. 컨텍스트를 매 질의마다 다시 프롬프트에 넣는 대신, 문서를 한 번 읽고 그 정보를 담은 LoRA 어댑터를 즉석에서 생성하자는 것이다. 더 정확히 말하면, 기존 context distillation(CD)이 문서별로 별도 최적화를 돌려야 했던 과정을 hypernetwork 안에 메타학습해, 새로운 문서를 받더라도 한 번의 forward pass로 근사적인 distillation 결과를 만들어내겠다는 접근이다. 논문의 핵심 주장은 단순하다. "문맥을 읽는 비용"을 "문맥을 파라미터로 바꾸는 비용"으로 치환하되, 그 변환 자체도 충분히 빠르게 만들 수 있다는 것이다.

![Doc-to-LoRA overview](https://github.com/SakanaAI/doc-to-lora/raw/main/assets/overview_animation.gif)

## 무엇을 해결하려는가

이 논문이 겨냥하는 문제는 단순한 long-context optimization이 아니다. 더 정확히는 in-context learning의 편의성과 context distillation의 지속성을 동시에 얻고 싶다는 요구에 가깝다. 프롬프트에 문서를 직접 넣는 방식은 간단하지만, 문서가 길어질수록 latency와 KV-cache 비용이 커지고, 컨텍스트 창을 초과하면 성능 자체도 흔들린다. 반대로 context distillation은 정보를 모델 파라미터 안으로 옮겨 이후 질의를 훨씬 가볍게 처리하게 해주지만, 문서 하나 바뀔 때마다 다시 distillation 학습을 돌려야 해서 interactive한 사용에는 너무 느리다.

저자들은 여기서 "문서별 distillation 최적화"를 아예 amortize하려고 한다. 다양한 문서와 질의-응답 분포 위에서 meta-training을 해 둔 hypernetwork가, 새로운 문서를 받으면 그 문서에 맞는 LoRA 업데이트를 바로 생성하도록 만드는 것이다. 이렇게 되면 사용자 문서, 사내 위키, 장문 보고서, 개인 선호 정보처럼 계속 바뀌는 컨텍스트도 매번 SFT나 반복 SGD 없이 빠르게 internalize할 수 있다.

실무적으로 보면 이 문제는 개인화와 온디바이스 inference에 특히 중요하다. 문서를 계속 다시 넣지 않아도 되면 응답 때마다 긴 KV-cache를 유지할 필요가 없고, private document를 로컬에서 한 번 internalize한 뒤 더 가벼운 추론 경로를 유지할 수 있기 때문이다. 논문이 latency와 memory를 성능만큼 강조하는 이유도 여기에 있다.

## 핵심 아이디어 / 구조 / 동작 방식

Doc-to-LoRA(D2L)의 기본 틀은 context distillation을 hypernetwork로 근사하는 것이다. 기존 CD는 특정 컨텍스트 c와 여러 query-response 쌍을 바탕으로, "컨텍스트를 본 teacher"와 "컨텍스트 없이 답하는 student" 사이의 차이를 줄이도록 student 파라미터를 직접 업데이트한다. D2L은 이 반복 최적화 과정을 매번 새로 하지 않고, 컨텍스트 문자열 c를 입력받아 바로 LoRA 파라미터 ΔWc를 출력하는 함수 Hϕ(c)를 학습한다.

구조적으로는 frozen base LLM에서 문서를 읽은 뒤 얻은 layer별 token activation을 공유 hypernetwork에 넣고, 여기서 각 층에 적용할 LoRA 행렬을 생성한다. 논문은 이 hypernetwork를 Perceiver 기반으로 설계해 variable-length input을 고정된 형태의 adapter로 매핑할 수 있게 했고, 긴 문서를 처리하기 위해 chunking 메커니즘도 추가했다. 즉 입력 문서를 여러 chunk로 나누고, 각 chunk에서 얻은 정보를 조합해 더 높은 rank의 LoRA를 만들 수 있도록 했다. 이 덕분에 D2L은 학습 때 보지 못한 길이의 문서에도 zero-shot으로 일반화할 수 있다고 주장한다.

여기서 중요한 점은 D2L이 "문서를 요약해 프롬프트로 넣는" 방식이 아니라, 문서 정보를 직접 파라미터 업데이트로 바꾼다는 점이다. 이후 질의 시에는 원문 문서를 다시 context에 넣지 않고도, internalized된 LoRA가 붙은 base model이 답을 생성한다. 다시 말해 in-context knowledge를 in-parameter knowledge로 빠르게 변환하는 경량 런타임을 만드는 셈이다.

또한 논문은 두 가지 운용 모드를 제시한다. batched mode는 모든 layer의 adapter를 한 번에 생성해 속도를 우선하고, iterative mode는 layer별로 순차 생성해 메모리를 아낀다. 둘은 수학적으로 같은 목표를 수행하지만, 실제 배포 환경에서는 사용자가 latency와 VRAM 사이에서 trade-off를 선택할 수 있게 해준다.

| 방식 | 컨텍스트 처리 방식 | 장점 | 한계 |
|---|---|---|---|
| 직접 ICL | 문서를 매 질의마다 프롬프트로 다시 투입 | 구현이 단순하고 상한 성능이 높음 | 긴 입력에서 latency·KV-cache 비용이 큼 |
| 전통적 Context Distillation | 문서별로 별도 최적화를 돌려 파라미터에 내재화 | 이후 추론은 가벼워짐 | 업데이트 자체가 느리고 메모리 소모가 큼 |
| Doc-to-LoRA | hypernetwork가 한 번에 문서→LoRA 생성 | sub-second internalization 가능, 긴 문맥 비용을 크게 줄임 | 메타학습 비용이 크고 근사적 distillation이라는 한계가 있음 |

## 공개된 근거에서 확인되는 점

가장 먼저 눈에 띄는 결과는 synthetic long-context Needle-in-a-Haystack(NIAH) 실험이다. 논문에 따르면 D2L은 학습 시 최대 256 token 길이만 보았음에도, 1024-token chunk 단위로 입력을 쪼개 최대 40K token 수준까지 needle 정보를 거의 완벽하게 internalize한다. 이는 base model의 native context window를 4배 이상 넘는 길이에서 near-perfect zero-shot accuracy를 유지했다는 주장으로 이어진다. 더 인상적인 것은 메모리 차이다. 128K token haystack에서 base model은 응답 생성에 12GB 이상의 추가 메모리를 쓰는 반면, internalized knowledge를 사용한 모델은 길이에 거의 무관하게 50MB 미만의 추가 메모리만 사용했다고 보고한다.

실제 QA 벤치마크에서도 메시지는 일관적이다. SQuAD, DROP, ROPES 같은 reading comprehension 작업에서 D2L은 모든 in-parameter baseline을 앞섰고, SQuAD에서는 in-context upper bound 대비 82.5%의 상대 성능을 달성했다고 적고 있다. 동시에 internalization latency는 batched/iterative 모드 모두 1초 미만이며, oracle CD는 약 40초, 생성 질의를 쓰는 vanilla CD는 100초 이상 걸린다고 비교한다. 메모리 측면에서도 D2L과 oracle CD는 2GB 미만의 추가 VRAM으로 업데이트가 가능하지만, generated queries 기반 CD는 40GB 이상을 사용한다.

장문 문서 QA에서 수치 차이는 더 실용적으로 보인다. 2WikiMultihopQA 기준 표를 보면, normalized performance는 CD(oracle query) 0.901, D2L batched 0.857, D2L iterative 0.844다. 성능은 oracle CD보다 약간 낮지만, 평균 update latency는 각각 40.171초 대 0.209초/0.551초로 극적으로 줄어든다. 추가 update memory도 iterative D2L은 3.791GB로 oracle CD의 7.820GB보다 낮다. 반면 generated-query CD는 5개 query만 써도 79.371GB와 72.537초, 25개 query에서는 59.925GB와 465.454초가 필요해 현실적인 interactive workflow와는 거리가 멀다.

논문이 던지는 또 하나의 강한 신호는 modality bridging이다. VLM을 context encoder로 쓰고 text-only LLM에 LoRA를 주입하는 실험에서, D2L은 Imagenette 10-class 분류에서 75.03% 정확도를 기록한다. 랜덤이 10%라는 점을 생각하면, 텍스트만 학습한 target LLM이 internalized information만으로 시각 정보를 꽤 많이 전달받았다는 뜻이다. 텍스트 QA 성능은 일부 떨어지지만, hypernetwork가 "다른 모달리티의 activation을 텍스트 LLM용 adapter로 번역"할 수 있다는 가능성을 보여준다는 점에서 꽤 인상적이다.

| 방법 | 2WikiMultihopQA 정규화 성능 | 추가 업데이트 메모리(GB) | 평균 업데이트 지연(s) |
|---|---:|---:|---:|
| CD (oracle query) | 0.901 | 7.820 | 40.171 |
| D2L (batched) | 0.857 | 11.522 | 0.209 |
| D2L (iterative) | 0.844 | 3.791 | 0.551 |
| CD (25 generated queries) | 0.745 | 59.925 | 465.454 |
| CD (5 generated queries) | 0.704 | 79.371 | 72.537 |

## 실무 관점에서의 해석

내가 보기에 이 논문의 진짜 포인트는 long-context model을 더 효율적으로 만드는 것이 아니라, "문맥을 읽는 것"과 "문맥을 기억하는 것"을 분리해서 후자를 독립적인 시스템 레이어로 만들었다는 데 있다. D2L은 단순한 compression이나 retrieval 최적화가 아니라, 컨텍스트를 즉석에서 파라미터화하는 runtime adaptation layer에 가깝다. 이 관점은 개인화된 assistant, 자주 갱신되는 사내 문서 QA, private knowledge injection, agent memory 같은 문제에 꽤 잘 맞는다.

특히 반복적으로 같은 긴 문서를 참조하는 workload에서는 장점이 명확하다. 처음 한 번 internalize한 뒤에는 원문을 매 요청마다 다시 읽지 않아도 되므로 KV-cache 비용이 크게 줄고, latency도 안정화된다. 사용자가 업로드한 문서나 세션별 선호 정보를 즉석에서 adapter로 바꿔 쓰는 구조는, 향후 edge inference나 privacy-sensitive deployment에서 꽤 매력적일 수 있다. GitHub 저장소가 interactive web, demo, pretrained checkpoint, Python API까지 함께 제공하는 것도 이 아이디어를 단순 논문이 아니라 실제 실험 가능한 시스템으로 밀어붙이려는 의도로 보인다.

물론 한계도 분명하다. 우선 D2L은 CD를 근사하는 메타모델이기 때문에, 최고 성능 자체는 여전히 oracle CD나 직접 context를 읽는 ICL보다 낮을 수 있다. 또 메타학습 데이터 분포와 base model 구조에 영향을 많이 받을 가능성이 크고, 완전히 다른 도메인이나 고정밀 reasoning 작업에서 같은 이득이 유지되는지는 더 봐야 한다. 게다가 hypernetwork 자체의 학습 비용은 작지 않다. 논문 부록 기준으로 FineWeb-Edu와 QA 데이터셋을 합친 약 3.2M context, 약 9억 토큰 규모 데이터, H200 단일 GPU 평가 등 꽤 무거운 연구 세팅 위에서 나온 결과다.

그럼에도 불구하고 D2L은 앞으로 자주 보게 될 방향을 예고한다. 모든 적응을 프롬프트 길이 확장이나 full finetuning으로 해결하는 대신, "문서 → adapter" 변환을 빠른 inference primitive로 만들어 버리는 접근이다. 만약 이 흐름이 더 일반화된다면, 미래의 LLM 스택은 retrieval layer와 generation layer 사이에 internalization layer를 하나 더 갖게 될지도 모른다. Doc-to-LoRA는 그 가능성을 꽤 설득력 있게 보여주는 첫 사례 중 하나다.

Sources: https://arxiv.org/abs/2602.15902, https://arxiv.org/pdf/2602.15902, https://github.com/SakanaAI/doc-to-lora