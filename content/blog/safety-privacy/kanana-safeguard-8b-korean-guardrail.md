---
title: "Kanana Safeguard 8B는 한국어 AI 서비스를 위한 공개 가드레일 모델이다"
date: "2026-05-26T00:25:06"
description: "카카오의 Kanana Safeguard 8B는 한국어 유해 콘텐츠 탐지를 단일 토큰 분류 문제로 만들고, 사용자 발화와 AI 응답을 함께 판정하도록 공개된 Apache-2.0 가드레일 모델이다."
author: "Sangmin Lee"
category: "safety-privacy"
tags:
  - AI Safety
  - Guardrail
  - Korean LLM
  - Content Moderation
  - Hugging Face
draft: false
---

LLM 서비스에서 안전성은 이제 별도 부가 기능이 아니라 제품 경계의 일부가 됐다. 사용자 입력을 사전에 막을지, 모델이 생성한 응답을 사후에 검사할지, 어떤 정책 위반을 어떤 코드로 기록할지에 따라 운영 비용과 사용자 경험이 크게 달라진다. 특히 한국어 서비스에서는 영어 중심 moderation 모델이 놓치는 높임말, 은어, 문화적 맥락, 로컬 정책 리스크가 남는다.

카카오가 공개한 **Kanana Safeguard 8B**는 이 빈틈을 한국어 가드레일 모델로 채우려는 시도다. Hugging Face 모델 카드 기준으로 이 모델은 카카오의 자체 언어모델 Kanana 8B를 기반으로 한 유해 콘텐츠 탐지 모델이며, 사용자 발화와 AI 어시스턴트 응답을 입력으로 받아 `<SAFE>` 또는 `<UNSAFE-S4>` 같은 단일 토큰 분류 결과를 생성한다. 모델은 `transformers` 기반 `LlamaForCausalLM`으로 배포되고, Apache-2.0 라이선스와 BF16 safetensors 가중치를 제공한다.

흥미로운 점은 이 공개가 모델 하나로 끝나지 않는다는 것이다. 공식 컬렉션에는 Kanana Safeguard 8B, 법적·정책적 리스크를 보는 Kanana Safeguard-Siren 8B, 프롬프트 공격을 탐지하는 Kanana Safeguard-Prompt 2.1B가 함께 묶여 있다. 즉 카카오의 설계는 “모든 위험을 하나의 moderation 모델에 넣자”가 아니라, 리스크 성격과 필요한 입력 범위에 따라 가드레일을 분리하는 쪽에 가깝다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kanana-safeguard-8b-series-overview.webp"
    alt="Kanana Safeguard series overview from Kakao Tech Blog"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    카카오 테크블로그의 공식 시각 자료. Kanana Safeguard는 단일 모델이 아니라 유해 콘텐츠, 법적·정책적 리스크, 프롬프트 공격을 나누어 다루는 가드레일 시리즈로 제시된다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

AI 가드레일 모델이 풀어야 하는 문제는 단순히 “나쁜 말 탐지”가 아니다. 실제 서비스에서는 사용자의 요청 자체가 위험할 수도 있고, 요청은 위험하지만 AI가 안전하게 거절하면 전체 대화는 안전할 수도 있다. 반대로 사용자 발화만 보면 애매하지만, AI 응답이 구체적인 실행 지침을 제공하면서 위험해지는 경우도 있다.

Kanana Safeguard 8B는 이 중 **유해 콘텐츠 출력 리스크**에 초점을 둔다. 모델 카드의 설명처럼 이 모델은 사용자 발화 또는 AI 어시스턴트의 답변이 정의된 안전 taxonomy를 위반하는지 분류한다. 이 taxonomy는 MLCommons AI Safety 분류체계를 바탕으로 하되, 한국 로컬 맥락에 맞춘 항목을 더해 7개 코드로 정리돼 있다.

| 코드 | 카테고리 | 판정 범위 |
|---|---|---|
| S1 | 증오 | 정체성 요인에 기반한 차별·공격 발화 |
| S2 | 괴롭힘 | 굴욕, 위협, 괴롭힘 조장 |
| S3 | 성적 콘텐츠 | 성적 행위·신체 묘사 또는 성적 수치심 유발 표현 |
| S4 | 범죄 | 불법 행위의 기획·준비·실행 조언 |
| S5 | 아동 성착취 | 아동 대상 성적 학대, grooming, CSAM 관련 텍스트 |
| S6 | 자살 및 자해 | 자살·자해 행위의 묘사 또는 유도 |
| S7 | 잘못된 정보 | 개인이나 집단에게 잘못된 정보를 전파할 수 있는 발화 |

이 구분은 운영 관점에서 중요하다. 단순 binary moderation만 있으면 “왜 막혔는지”가 흐려지고, 너무 세밀한 free-form 설명을 생성하게 하면 지연과 불안정성이 커진다. Kanana Safeguard의 선택은 그 중간이다. 모델은 안전 여부와 위험 카테고리를 압축된 코드로 내보내고, 제품은 그 코드를 기준으로 차단, 재작성, human review, 로그 분석 같은 후속 정책을 붙일 수 있다.

## 핵심 아이디어 / 구조 / 동작 방식

Kanana Safeguard 8B의 가장 실용적인 설계 포인트는 **단일 토큰 출력**이다. 모델 카드의 사용 예시는 `AutoModelForCausalLM`과 `AutoTokenizer`를 불러온 뒤, `tokenizer.apply_chat_template()`로 사용자 발화와 assistant 응답을 구성하고 `max_new_tokens=1`만 생성한다. 결과적으로 운영 시스템은 긴 설명문을 파싱하지 않고 첫 번째 생성 토큰만 보고 `<SAFE>` 또는 `<UNSAFE-S*>`를 판정할 수 있다.

토크나이저 설정도 이 의도와 맞게 구성돼 있다. `tokenizer_config.json`에는 `<SAFE>`, `<UNSAFE-S1>`부터 `<UNSAFE-S7>`까지의 label token이 추가되어 있고, chat template은 대화를 `<human>...</human>`과 `<ai>...</ai>` 형태로 감싼 뒤 “taxonomy code만 응답하라”고 지시한다. 겉보기에는 여러 글자처럼 보이지만, 모델이 내야 하는 운영 출력은 사실상 하나의 레이블 토큰이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kanana-safeguard-8b-example.webp"
    alt="Kanana Safeguard 8B classification example from the official model card"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Hugging Face 모델 카드의 공식 예시. 사용자 발화와 AI 응답을 함께 넣고, 모델은 정의된 taxonomy code에 해당하는 단일 레이블을 출력한다.
  </figcaption>
</figure>

아키텍처 표면은 익숙하다. Hugging Face API와 `config.json` 기준 모델은 `LlamaForCausalLM`, `model_type: llama`, 32 layers, hidden size 4096, 32 attention heads, 8 key-value heads, 8,192 max position embeddings, BF16 dtype으로 공개돼 있다. safetensors metadata에는 BF16 파라미터 수가 약 8.03B로 잡혀 있고, repository 파일은 4개 shard의 `model-0000*-of-00004.safetensors`, tokenizer, config, generation config로 구성된다.

다만 “8K context를 가진 생성 모델”이라는 사실과 “멀티턴 대화 맥락을 모두 이해하는 안전 모델”이라는 주장은 다르다. 모델 카드의 한계 섹션은 이전 대화 이력을 기반으로 문맥을 유지하거나 이어가는 기능을 제공하지 않는다고 명시한다. 토크나이저 template도 메시지를 순회하면서 마지막 user/assistant content를 분류 입력으로 쓰는 형태라, 실무에서는 현재 검사하려는 user-assistant pair를 명확히 구성해 넣는 모델로 보는 편이 안전하다.

| 공개 구성 | 확인되는 내용 | 실무적 의미 |
|---|---|---|
| 모델 형식 | `transformers`, `LlamaForCausalLM`, BF16 safetensors | 일반적인 Hugging Face 추론 파이프라인에 붙이기 쉽다 |
| 출력 방식 | `<SAFE>`, `<UNSAFE-S1>`~`<UNSAFE-S7>` label token | 결과 파싱이 단순하고 moderation policy engine과 연결하기 좋다 |
| 입력 방식 | user 발화와 assistant 응답을 chat template으로 묶어 분류 | user-only 필터와 response filter를 같은 taxonomy로 운용할 수 있다 |
| 라이선스 | Apache-2.0, gated false | 연구·제품 실험 접근성이 높다 |
| 한계 | 오탐 가능성, full context 미지원, 제한된 risk category | 단독 안전 보장 모델이 아니라 layered guardrail 중 한 층으로 써야 한다 |

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kanana-safeguard-8b-single-token.webp"
    alt="Single token output design for Kanana Safeguard series"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    카카오 테크블로그의 공식 단일 토큰 출력 설명. 가드레일 모델에서는 정확도뿐 아니라 지연, 비용, 출력 일관성이 운영 품질을 좌우한다.
  </figcaption>
</figure>

## 공개된 근거에서 확인되는 점

학습 데이터 측면에서 Kanana Safeguard 8B는 한국어 데이터로만 학습됐다고 모델 카드가 설명한다. 데이터는 내부 정책에 맞춰 전문 라벨러가 생성·라벨링한 수기 데이터와, LLM 기반 표현 변환 및 noise 삽입으로 만든 합성 데이터로 구성된다. 특히 false positive를 줄이기 위해 유해한 질문에 안전하게 응답한 AI assistant 대화도 포함했다는 점이 중요하다. 이는 사용자 질문이 위험하다는 사실만으로 전체 응답까지 unsafe로 처리하지 않기 위한 데이터 설계다.

카카오 테크블로그는 시리즈 전체의 데이터 규모도 공개한다. Kanana Safeguard는 약 36,000개, Kanana Safeguard-Siren은 약 11,000개, Kanana Safeguard-Prompt는 약 200,000개 데이터로 학습됐다고 설명한다. 세 모델의 데이터 규모가 크게 다른 것은 모델이 겨냥하는 위험 유형이 다르기 때문이다. 프롬프트 공격 탐지는 사용자 발화 단계에서 다양한 공격 패턴을 많이 보아야 하고, 유해 콘텐츠 탐지는 user와 assistant 응답의 조합을 더 조심스럽게 봐야 한다.

평가도 내부 한국어 테스트셋을 중심으로 이뤄졌다. 모델 카드는 SAFE/UNSAFE 이진 분류 기준으로 평가했고, 모든 평가는 UNSAFE를 positive class로 두며 모델이 출력한 첫 번째 토큰으로 분류했다고 설명한다. 외부 비교에서는 LlamaGuard3 8B는 SAFE/UNSAFE 토큰을 그대로 사용하고, ShieldGemma 9B는 threshold 0.5, GPT-4o는 zero-shot risk category prompt를 사용해 SAFE/UNSAFE로 변환했다.

| 모델 | F1 | Precision | Recall | 비고 |
|---|---:|---:|---:|---|
| Kanana Safeguard 8B | 0.946 | 0.944 | 0.948 | 내부 한국어 테스트셋 기준 |
| LlamaGuard3 8B | 0.540 | 0.893 | 0.387 | SAFE/UNSAFE token 판정 |
| ShieldGemma 9B | 0.477 | 0.640 | 0.380 | threshold 0.5 이진 분류 |
| GPT-4o zero-shot | 0.763 | 0.696 | 0.843 | category prompt 후 unsafe code를 양성 처리 |

이 표는 강한 신호지만, 해석에는 조건이 붙는다. 평가셋은 카카오가 자체 구축한 한국어 데이터셋이고, 각 모델의 원래 정책과 taxonomy가 다르기 때문에 숫자를 “보편적 안전성 순위”로 읽으면 곤란하다. 더 정확한 해석은, 카카오가 정의한 한국어 유해 콘텐츠 taxonomy와 내부 평가셋에서는 Kanana Safeguard 8B가 비교 모델보다 훨씬 안정적인 precision-recall 균형을 보였다는 것이다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/kanana-safeguard-8b-evaluation.webp"
    alt="Kanana Safeguard series evaluation overview from Kakao Tech Blog"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    카카오 테크블로그의 공식 평가 관련 시각 자료. 공개 수치는 내부 한국어 평가 데이터셋에서 SAFE/UNSAFE 이진 분류로 환산해 비교한 결과로 해석해야 한다.
  </figcaption>
</figure>

릴리스 표면도 비교적 명확하다. Hugging Face API 기준 Kanana Safeguard 8B는 gated가 아니며, repository에는 모델 카드, config, tokenizer, generation config, 4개 safetensors shard가 올라와 있다. 같은 컬렉션에는 8B급 Siren 모델과 2.1B Prompt 모델이 함께 있어, 서비스 팀은 유해 콘텐츠 moderation, 법적·정책적 risk pre-check, prompt injection/leaking 탐지를 분리해 조합할 수 있다.

| 모델 | 파라미터 | 탐지 대상 | 주요 역할 |
|---|---:|---|---|
| Kanana Safeguard 8B | 약 8.03B | 사용자 발화 및 AI 응답 | 유해 콘텐츠 출력 리스크 분류 |
| Kanana Safeguard-Siren 8B | 약 8.03B | 사용자 발화 | 성인인증, 전문 조언, 개인정보, 지식재산권 등 법적·정책적 리스크 |
| Kanana Safeguard-Prompt 2.1B | 약 2.09B | 사용자 발화 | Prompt Injection, Prompt Leaking 탐지 |

## 실무 관점에서의 해석

Kanana Safeguard 8B의 가장 큰 의미는 한국어 safety layer를 “규칙 몇 개”나 “영어 guard 모델의 번역 적용”이 아니라 공개 weight 모델로 다룬다는 데 있다. 제품 팀 입장에서는 moderation policy를 고정된 코드 체계로 남길 수 있고, 모델 운영팀 입장에서는 user prompt filter와 response filter를 같은 taxonomy 아래에서 연결할 수 있다. 특히 assistant 응답까지 함께 넣을 수 있다는 점은 단순 입력 차단보다 운영적으로 유연하다.

두 번째 의미는 지연 비용이다. 8B 모델 자체가 아주 가벼운 것은 아니지만, 출력이 단일 token으로 고정되어 있으면 decode 비용과 parsing 불확실성이 줄어든다. 가드레일 모델은 생성 품질을 뽐내는 모델이 아니라 매 요청마다 붙을 수 있는 인프라 구성요소다. 여기서는 “얼마나 긴 설명을 잘 쓰는가”보다 “한 번에 예측 가능한 코드를 안정적으로 내는가”가 더 중요하다.

반대로 이 모델을 절대적 안전 보장 장치로 읽으면 안 된다. 모델 카드가 직접 밝히듯 오탐은 가능하고, 이전 대화 맥락을 이어가는 기능은 제공하지 않으며, 정의된 7개 카테고리 밖의 리스크는 탐지하지 못한다. 또한 공개된 성능 수치는 내부 한국어 테스트셋 기준이므로, 도메인별 실제 서비스 로그, 조직별 정책 기준, 공격자가 적응한 jailbreak 패턴에서는 별도 검증이 필요하다.

따라서 실무 적용 형태는 layered guardrail이 되어야 한다. 예를 들어 사용자 입력 단계에서는 Prompt 모델로 injection/leaking을 먼저 보고, Siren으로 법적·정책적 리스크를 체크한 뒤, 최종 응답 단계에서 Kanana Safeguard로 유해 콘텐츠 출력을 검사하는 식이다. 여기에 rule-based blocklist, retrieval source policy, human review queue, abuse monitoring을 붙여야 실제 운영 안전성이 올라간다.

그럼에도 Kanana Safeguard 8B는 한국어 AI 서비스 생태계에서 중요한 공개 자산이다. 무엇을 위험으로 볼 것인지 taxonomy를 명시하고, 그 taxonomy를 단일 토큰 모델 출력으로 연결하며, Apache-2.0 오픈 모델로 배포했다. 앞으로 한국어 LLM 제품의 safety infra를 설계할 때, 이 모델은 최소한 강한 baseline이자 비교 기준으로 쓰일 가능성이 높다.

Sources: https://huggingface.co/kakaocorp/kanana-safeguard-8b, https://huggingface.co/api/models/kakaocorp/kanana-safeguard-8b, https://huggingface.co/collections/kakaocorp/kanana-safeguard-68215a02570de0e4d0c41eec, https://tech.kakao.com/posts/705, https://mlcommons.org/2024/04/mlc-aisafety-v0-5-poc/
