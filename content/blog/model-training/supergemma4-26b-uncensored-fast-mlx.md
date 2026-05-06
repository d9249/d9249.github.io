---
title: "SuperGemma4는 Apple Silicon에서 Gemma 4를 더 빠르고 덜 검열된 로컬 에이전트 모델로 바꾼다"
date: "2026-05-06T09:36:56"
description: "Jiunsong의 SuperGemma4-26B-Uncensored-Fast v2는 Google Gemma 4 26B IT를 MLX 4bit 형식으로 재가공해, Apple Silicon 로컬 환경에서 속도와 실사용 에이전트 성능을 함께 끌어올리려는 비공식 커뮤니티 릴리스다."
author: "Sangmin Lee"
category: "model-training"
tags:
  - Gemma
  - MLX
  - Apple Silicon
  - Quantization
  - Local Agents
draft: false
---

요즘 오픈 모델을 실제로 써보는 팀들이 부딪히는 문제는 단순히 “좋은 base model이 있는가”가 아니다. 같은 20B~30B급 모델이라도 어떤 양자화 포맷으로, 어떤 서빙 스택 위에서, 어느 정도 속도와 안정성으로 돌아가느냐에 따라 체감 성능이 크게 달라진다. 특히 Apple Silicon 기반 로컬 워크플로에서는 Hugging Face 점수표보다도 MLX 호환성, chat template 안정성, 그리고 코드·브라우저·한국어 같은 실전 프롬프트에서 얼마나 덜 무너지는지가 훨씬 중요하다.

Jiunsong이 공개한 SuperGemma4-26B-Uncensored-Fast v2는 정확히 그 사용 맥락을 겨냥한 릴리스다. Hugging Face 모델 카드 기준으로 이 모델은 Google의 `gemma-4-26B-A4B-it`를 기반으로 한 MLX 4bit 텍스트 전용 모델이며, Apple Silicon에서 더 빠르고, 더 실전적인 로컬 agent workload를 지향한다고 스스로 포지셔닝한다. 즉 새로운 foundation model을 처음부터 학습한 프로젝트라기보다, 이미 강한 Gemma 4 계열을 로컬 실행과 에이전트형 사용성 중심으로 다시 다듬은 커뮤니티 파생 모델에 가깝다.

흥미로운 점은 이 모델이 단순히 “uncensored”라는 감성적 라벨만 내세우지 않는다는 것이다. README와 함께 공개된 quick bench JSON, serving notes를 보면 작성자는 검열 완화 자체보다도 code, browser, logic, Korean 같은 실제 사용 범주에서 원본 Gemma 4 26B IT 4bit 로컬 베이스라인보다 더 낫고 더 빠르다는 점을 전면에 내세운다. 이 글은 SuperGemma4가 무엇을 약속하고, 어떤 근거를 같이 공개했으며, 실무적으로 어떤 가치와 한계를 가지는지 정리한다.

## 무엇을 해결하려는가

SuperGemma4가 겨냥하는 문제는 거창한 frontier benchmark 경쟁이라기보다, 로컬에서 쓸 만한 중대형 오픈 모델이 의외로 자주 겪는 실전 마찰이다. 원본 instruct 모델이 강하더라도, MLX 4bit로 옮겨 놓으면 속도는 확보되지만 출력이 지나치게 보수적이거나, 코드·브라우저 자동화·한국어 프롬프트에서 답변 밀도가 떨어지거나, 서빙 템플릿 문제로 품질이 흔들리는 일이 흔하다.

이 모델 카드는 그 문제를 꽤 노골적으로 요약한다. 목표는 “stock Gemma 4 26B IT보다 더 똑똑하고, 같은 머신에서 더 빠르며, uncensored 성향을 유지하되 코드와 툴 사용 능력이 무너지지 않는 것”이다. 즉 이 릴리스가 풀려는 핵심 과제는 open-weight base model의 순수 점수를 더 높이는 일이 아니라, Apple Silicon 로컬 환경에서 바로 체감되는 에이전트형 사용성을 개선하는 것이다.

여기서 중요한 것은 target environment가 아주 구체적이라는 점이다. 이 모델은 범용 GPU 서빙 전체를 겨냥한 릴리스가 아니라 MLX 기반 Apple Silicon 워크로드를 전제로 한다. 다시 말해 SuperGemma4의 가치는 클라우드 대규모 추론보다는 개인 개발 장비나 Mac 기반 로컬 agent stack에서 “조금 더 빠르고, 조금 더 자유롭고, 조금 더 실전적인 Gemma 4”를 원하는 사용자에게 있다.

## 핵심 아이디어 / 구조 / 동작 방식

구조적으로 보면 SuperGemma4는 완전히 새로운 아키텍처 제안이 아니다. Hugging Face API와 모델 카드 기준으로, 기반 모델은 `google/gemma-4-26B-A4B-it`이고 배포 형식은 MLX 라이브러리를 위한 4bit 양자화다. 저장소 태그에는 `reasoning`, `tool-use`, `coding`, `browser-automation`, `korean`, `apple-silicon`, `uncensored`가 함께 붙어 있어, 작성자가 이 모델을 텍스트 전용 로컬 에이전트 모델로 패키징하려는 의도가 분명히 드러난다.

핵심 메시지는 세 가지다. 첫째, 이 릴리스는 multimodal line이 아니라 fast text-only line이라는 점을 명확히 한다. 둘째, 단순히 검열을 약하게 푸는 것이 아니라 practical capability를 같이 올렸다고 주장한다. 셋째, 그 근거를 README의 요약표만이 아니라 `benchmark_quick_bench_20260412.json`, 응답 샘플 JSONL, `SERVING_NOTES.md`, 그리고 번들된 chat template 파일까지 함께 공개하는 방식으로 제시한다. 즉 “가중치만 던져두는 업로드”보다는, 작성자가 실제 로컬 실행과 재현 경로를 함께 보여주려는 형태다.

서빙 계층도 이 모델의 중요한 일부다. 권장 실행 명령은 `mlx_lm.server --model Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2 --port 8080`이며, serving notes는 번들된 `chat_template.jinja`를 자동 감지하게 두라고 권고한다. 특히 `--chat-template` 인자에 템플릿 경로 문자열을 그대로 넘기면 응답이 깨질 수 있다고 경고하는데, 이는 초기 “reasoning이 망가졌다”는 문제를 가중치 손상이 아니라 launch/template issue로 재현했다는 설명과 연결된다. 결국 이 릴리스는 모델 그 자체뿐 아니라, 로컬 서빙 시 어떤 템플릿 경로를 밟느냐까지 성능의 일부로 본다.

또 하나 실무적으로 눈에 띄는 점은 벤치마크의 성격이다. 공개된 quick bench는 거대 공개 벤치마크가 아니라 작성자 로컬 환경의 20개 프롬프트 묶음으로 보이며, Code, Browser, Logic, System Design, Korean 다섯 범주 평균과 지연 시간, generation speed를 함께 기록한다. 즉 이 모델은 학술 벤치마크에서의 절대 순위보다, “Mac에서 로컬 에이전트처럼 쓸 때 어떤 체감 개선이 있느냐”를 보여주는 운영형 측정에 더 가깝다.

| 구성 축 | 공개 자료에서 확인되는 내용 | 의미 |
|---|---|---|
| Base model | `google/gemma-4-26B-A4B-it` | Google Gemma 4 instruct 계열을 바탕으로 한 파생 릴리스 |
| Deployment format | MLX 4bit, 약 13GB | Apple Silicon 로컬 실행을 강하게 의식한 패키징 |
| Release identity | Fast + Uncensored + text-only | 멀티모달보다 속도·자유도·실사용성을 우선한 포지셔닝 |
| Evidence bundle | README, quick bench JSON, responses JSONL, serving notes, chat templates | 성능 주장과 실행 주의사항을 함께 공개 |
| Target tasks | code, browser, logic, system design, Korean | 일반 채팅보다 로컬 agent workload를 평가 축으로 삼음 |

## 공개된 근거에서 확인되는 점

Hugging Face API 기준으로 이 저장소는 비공개가 아닌 공개 모델이며, pipeline tag는 `text-generation`, library name은 `mlx`다. 마지막 수정 시각은 2026-04-12T13:34:53Z, 다운로드 수는 31,996, likes는 213으로 표시된다. 라이선스는 Gemma 라이선스를 따른다. 저장소에는 3개 safetensors shard 외에도 `SERVING_NOTES.md`, `benchmark_quick_bench_20260412.json`, `benchmark_quick_bench_20260412_responses.jsonl`, `chat_template.jinja`, `tool_chat_template.jinja`가 포함되어 있어, 단순 양자화본이라기보다 사용 지침까지 갖춘 배포물에 가깝다.

모델 카드가 가장 앞세우는 수치는 원본 Gemma 4 26B IT original 4bit 대비 quick bench overall 91.4 → 95.8, 평균 생성 속도 42.5 tok/s → 46.2 tok/s, 전체 점수 +4.4, 속도 +8.7%다. 같은 표에서 카테고리별 향상은 Code 92.3 → 98.6, Browser 87.5 → 89.6, Logic 86.9 → 95.2, System Design 97.8 → 98.9, Korean 90.7 → 95.0으로 제시된다. 공개된 JSON도 overall 95.8, avg generation 46.2 tok/s, avg latency 35.3초, errors 0을 다시 확인해 준다.

bench JSON을 더 보면 이 평가는 20개 프롬프트로 구성돼 있고, category는 Code, Browser, Logic, System Design, Korean 다섯 축이다. scoring은 length, keyword, completeness, code quality 같은 휴리스틱 합산형이며, 예를 들어 Browser 범주에서는 `robots.txt`, `wait_for` 누락 같은 세부 코멘트가 붙는다. 따라서 이 수치는 대형 외부 공개 벤치마크처럼 해석하기보다, 작성자가 로컬 사용성을 직접 측정하기 위해 만든 task-oriented quick regression suite로 읽는 편이 정확하다.

서빙 관련 caveat도 분명하다. `SERVING_NOTES.md`는 잘못된 `--chat-template` 전달 방식이 응답 손상을 일으킬 수 있다고 명시하며, quick bench 95.8과 46.2 tok/s는 이 문제를 바로잡은 뒤 검증했다고 적는다. 이는 이 릴리스의 차별점 일부가 단순한 weight tuning뿐 아니라 template/serving hygiene까지 포함한다는 뜻이다. 반대로 말하면, 사용자가 권장 launch path를 따르지 않으면 카드에서 제시한 체감 품질을 그대로 재현하지 못할 가능성도 있다.

| 항목 | 확인된 내용 | 해석 |
|---|---|---|
| 공개 범위 | 모델 가중치 + bench JSON + 응답 샘플 + serving notes + chat templates | 단순 업로드보다 재현 가능한 로컬 사용 시나리오를 함께 공개 |
| 핵심 성능 주장 | overall 95.8 vs 91.4, 46.2 tok/s vs 42.5 tok/s | 품질과 속도를 동시에 올렸다는 메시지 |
| 범주별 개선 | Code +6.3, Logic +8.3, Korean +4.3, Browser +2.1 | 에이전트형 실제 작업에서의 체감 향상을 강조 |
| 벤치 성격 | 20개 prompt 기반 quick bench, 휴리스틱 점수 합산 | 외부 표준 평가라기보다 로컬 regression/usage benchmark에 가까움 |
| 운영 주의사항 | chat template 전달 방식에 따라 응답 손상 가능 | 모델 품질만큼 서빙 경로가 중요함 |

## 실무 관점에서의 해석

내가 보기에 SuperGemma4의 진짜 의미는 “Gemma 4를 더 자유롭게 만들었다”보다도, 로컬 오픈 모델 사용성의 평가 기준이 어떻게 바뀌고 있는지를 보여준다는 데 있다. 이제 많은 사용자는 MMLU 몇 점보다도, Mac에서 바로 띄웠을 때 코드 작성이 덜 무너지는지, 브라우저 자동화 프롬프트를 잘 따라가는지, 한국어 응답이 더 자연스러운지를 먼저 본다. SuperGemma4는 그 요구를 정확히 겨냥한 커뮤니티 최적화 사례다.

특히 흥미로운 부분은 속도와 비검열성을 함께 묶는 방식이다. 보통 uncensored 계열 파생 모델은 표현 자유를 얻는 대신 코드 품질이나 안정성이 흔들리는 경우가 있는데, 이 릴리스는 오히려 “uncensored인데 더 실용적이고 더 빠르다”는 조합을 전면에 내세운다. 이는 로컬 모델 사용자층이 단순 roleplay보다 coding, tool-use, browser task 같은 생산성 워크플로로 이동하고 있다는 신호로도 읽힌다.

물론 한계도 분명하다. 첫째, 이 모델은 공식 Google 릴리스가 아니라 커뮤니티 파생판이므로, 성능·안정성 평가는 결국 작성자 제공 자료에 상당 부분 의존한다. 둘째, 공개된 quick bench는 로컬 사용성 판단에는 유용하지만, 범용 공개 벤치마크처럼 비교 가능한 표준 점수로 받아들이기는 어렵다. 셋째, target environment가 Apple Silicon MLX로 강하게 제한돼 있어, CUDA/vLLM 중심 환경의 팀에게는 직접적인 레퍼런스가 아닐 수 있다.

그럼에도 이 모델은 분명한 방향성을 갖는다. SuperGemma4는 오픈 모델 생태계에서 점점 더 중요한 층위가 “새 base model의 발표”가 아니라, 기존 강력한 base를 특정 하드웨어와 작업 패턴에 맞게 재패키징하는 실전형 릴리스라는 점을 잘 보여준다. 특히 Mac 기반 로컬 에이전트 스택을 쓰는 개발자라면, 이런 모델은 연구용 curiosity보다 훨씬 현실적인 가치가 있을 수 있다. 결국 이 프로젝트의 핵심 질문은 frontier 성능이 아니라, “내 머신에서 지금 당장 더 쓸 만한가”이고, SuperGemma4는 그 질문에 꽤 영리하게 답하려는 모델이다.

Sources: https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2, https://huggingface.co/api/models/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2, https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2/raw/main/README.md, https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2/raw/main/SERVING_NOTES.md, https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-mlx-4bit-v2/raw/main/benchmark_quick_bench_20260412.json