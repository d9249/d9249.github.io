---
title: "VideoCoCo는 물리 과정을 먼저 코드로 실행하고, 그 다음 영상을 만든다"
date: "2026-08-03T15:59:07"
description: "VideoCoCo는 Blender 코드로 물리 과정의 저해상도 초안을 먼저 실행한 뒤 비디오 편집 모델로 사실적 영상을 만드는 Code-as-CoT 이중 엔진 접근으로, 물리 일관성 비디오 생성의 제어 가능한 중간 표현을 제안한다."
author: "Sangmin Lee"
category: "video-generation"
tags:
  - VideoCoCo
  - Video Generation
  - Physical Consistency
  - Blender
  - Chain of Thought
draft: false
---

텍스트-비디오 모델은 짧은 장면을 그럴듯하게 만들 수 있지만, “얼음이 녹아 퍼진다”, “진공에서 병이 찌그러진다”, “물체가 충돌해 깨진다”처럼 **시간에 따라 원인과 결과가 이어져야 하는 과정**에서는 쉽게 흔들린다. 프롬프트 한 줄 안에 장면·물체·운동·물리 법칙·시간 순서를 모두 압축해야 하기 때문이다. 결과물은 아름다워도, 상태가 원인보다 먼저 나타나거나 물체의 변형과 운동이 서로 맞지 않는 경우가 생긴다.

`VideoCoCo: Code-as-CoT for Physically-Consistent Video Generation via an Agentic Dual-Engine System`은 이 문제를 영상 모델 하나가 암묵적으로 모두 추론해야 한다는 전제에서 풀어낸다. 먼저 coding agent가 **실행 가능한 Blender 프로그램**으로 장면과 시간 변화를 적고, sandbox에서 결정론적인 저해상도 draft video를 만든다. 이후 별도의 generative video engine이 이 draft를 운동·인과·공간 구조의 조건으로 받아 사실적인 영상으로 편집한다.

중간 계획이나 keyframe을 쓰는 기존 visual chain-of-thought와 다른 점은, 이 중간 표현이 **실행 가능하고 전체 시간축을 가진다**는 것이다. 코드는 검토·수정·재실행할 수 있고, render된 draft는 “무슨 일이 어떤 순서로 벌어져야 하는가”를 화면으로 검증하게 한다. VideoCoCo는 생성 모델을 더 강하게 만드는 방식보다, 생성 전에 물리적 과정을 외부화하는 쪽을 택한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/videococo-code-as-cot-paradigms.webp"
    alt="기획형 CoT, 테스트 시간 탐색 CoT, visual-state CoT와 VideoCoCo의 실행 가능한 코드 기반 CoT를 비교한 다이어그램"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv HTML Figure 1. VideoCoCo는 텍스트 계획·후보 탐색·희소한 중간 상태 대신, 코드 agent가 만든 실행 가능한 sandbox draft를 process-level CoT로 사용한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

물리 일관성은 object identity가 유지되는지보다 넓은 문제다. 물체가 녹고, 부력으로 떠오르고, 가열되며, 충격으로 부서질 때 모델은 각 frame을 예쁘게 만들 뿐 아니라 상태 변화가 맞는 방향으로 이어지게 해야 한다. 그러나 텍스트 prompt는 이런 과정을 완전한 시공간 specification으로 표현하기에는 너무 압축적이다.

기존 접근은 대체로 세 부류다. planning CoT는 텍스트 계획·keyframe·layout을 추가하고, test-time search는 여러 영상을 만든 후 후보를 고르거나 수정하며, visual-state CoT는 영상 안의 중간 상태를 단계적으로 생각한다. 이들은 모두 도움이 될 수 있지만, 과정 전체를 실제로 **실행·검증**하는 중간 표현은 아니다. keyframe은 시간적으로 성기고, 텍스트 계획은 simulator에 바로 넣을 수 없으며, 생성된 후보를 고르는 방식은 잘못된 물리 과정을 사후에 골라내는 데 머물 수 있다.

VideoCoCo의 질문은 간단하다. **모델에게 “물이 어떻게 퍼져야 하는가”를 잠재 공간에서만 상상하게 하지 말고, 먼저 물리 상태 전이를 코드로 적고 실행하게 하면 더 안정적인 영상을 만들 수 있는가?**

## 핵심 아이디어 / 구조 / 동작 방식

### 1. 실행 가능한 simulation draft를 만든다

첫 번째 엔진은 user prompt를 받아 coding agent가 self-contained Blender program을 작성하도록 한다. 코드는 scene setup, material, 물리 속성, animation, render를 명시한다. 결과는 최종 영상의 미관을 목표로 하지 않는 흰색·점토 질감의 저충실도 proxy다. 대신 물체의 shape, 투명도, deformation, coverage, motion이 시간에 따라 어떻게 바뀌어야 하는지를 명시적으로 담는다.

논문은 이 draft를 단순한 storyboard보다 강한 표현으로 본다. 예를 들어 “열로 녹는 버터”라면 object가 액체로 변해 바닥에 퍼지는 과정을 각 시간 단계에서 render할 수 있고, 특정 상태가 그 상태를 유발한 전이보다 먼저 보이지 않는지 확인할 수 있다. 코드가 실패하면 결과 영상이 나온 뒤 감상으로 판단하는 것이 아니라, scene parameter나 animation logic을 고쳐 다시 실행할 수 있다.

### 2. 생성 엔진은 물리가 아니라 사실성을 맡는다

두 번째 엔진은 stage 1의 원 prompt와 draft video를 보고 edit instruction을 만든 뒤, 비디오 편집 모델로 최종 영상을 생성한다. draft는 시간·운동·인과 관계를 고정하는 조건이고, generative engine은 재질·조명·배경·카메라 같은 photorealistic appearance를 복원하는 역할을 맡는다.

이 분리는 중요한 설계 선택이다. 물리 simulator에게 영화 같은 질감을 기대하지 않고, 비디오 생성 모델에게 정확한 역학을 처음부터 발명하라고도 하지 않는다. VideoCoCo는 전자를 **process engine**, 후자를 **appearance engine**으로 역할 분리한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/videococo-dual-engine-system.webp"
    alt="사용자 프롬프트에서 Blender 코드와 저충실도 시공간 draft를 만들고, 편집 지시와 함께 비디오 편집 모델로 사실적인 영상을 만드는 VideoCoCo 이중 엔진 구조"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv HTML Figure 2. 왼쪽 실행형 simulation engine은 Blender 코드와 proxy draft를, 오른쪽 generative video engine은 draft-conditioned editing을 통해 고충실도 결과를 만든다.
  </figcaption>
</figure>

### 3. draft-conditioned editing용 데이터와 adaptation

저자들은 simulation draft·instruction·target video의 triplet으로 구성한 `VideoCoCo-3K`를 만들어 editor를 draft 조건에 적응시킨다. 논문 표에서는 모든 variant가 같은 executable drafting pipeline을 공유하고, editor adaptation만 tuning-free, full fine-tuning, LoRA fine-tuning으로 달라진다.

이 비교는 두 기여를 분리한다. draft를 넣는 것 자체가 물리적 구조를 개선하는지, 그리고 editor를 그 draft의 시각 언어에 맞춰 적응시키는 것이 추가 이득을 주는지를 따로 본다. 즉 “Blender를 썼다”는 사실만이 아니라, simulator output을 video editor가 잘 읽게 만드는 학습 문제가 남는다는 점을 인정한 설계다.

## 공개된 근거에서 확인되는 점

논문은 OmniWeaving을 base video generator로 두고 PhyGenBench와 VBench-2.0에서 비교한다. 다음 값은 모두 논문 저자들이 보고한 결과다.

| 평가 | OmniWeaving | + VideoCoCo | 변화 | 해석 |
|---|---:|---:|---:|---|
| PhyGenBench 평균 물리 일관성 | 0.48 | **0.56** | +0.08 | mechanics·optics·thermal·material 네 축이 모두 개선 |
| PhyGenBench material | 0.39 | **0.53** | +0.14 | 재질 변화와 외관 중심 prior가 약한 과정에서 가장 큰 개선 |
| PhyGenBench thermal | 0.43 | **0.51** | +0.08 | 가열·상변화 같은 시간 의존 과정 개선 |
| VBench-2.0 평균 물리 타당성 | 52.18% | **77.88%** | +25.70%p | mechanics·thermotics에서 최고 보고 점수 |
| VBench-2.0 mechanics | 62.79% | **92.31%** | +29.52%p | 물리 운동의 명시적 draft가 특히 크게 기여한 축 |

Ablation은 executable draft의 독립 효과를 보여 준다. PhyGenBench에서 base OmniWeaving의 평균은 0.48이고, editor를 별도로 tuning하지 않은 VideoCoCo는 0.51까지 오른다. full fine-tuning은 0.54, LoRA adaptation은 0.56이다. 즉 논문 기준으로 draft 자체도 효과가 있지만, draft-to-video 변환을 적응시키는 과정이 최종 성능을 더 끌어올린다.

질적 예시도 같은 방향이다. sublimation, 진공에 의한 병의 붕괴, 충돌 뒤 파손, 부력 장면에서 baseline은 분위기와 object appearance는 그럴듯하지만 요청한 상태 변화가 빠지거나 다른 방식으로 전개될 수 있다. 반면 VideoCoCo는 draft의 시간 구조를 따르면서 해당 과정을 더 일관되게 유지한다고 저자들은 제시한다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/videococo-physical-qualitative.webp"
    alt="승화, 진공 붕괴, 충돌 파손, 부력 사례에서 물리 draft, OmniWeaving baseline, VideoCoCo 결과를 비교한 영상 프레임 시퀀스"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    arXiv HTML Figure 3. 네 가지 물리 과정의 정성 비교. VideoCoCo는 저해상도 draft의 사건 순서를 유지하면서 최종 결과의 외관을 복원하려 한다.
  </figcaption>
</figure>

## 공개 release는 무엇을 제공하는가

논문에는 공식 GitHub 저장소와 Hugging Face 모델 주소가 연결돼 있지만, release maturity는 보수적으로 읽을 필요가 있다. 조회 시점의 GitHub `micky-li-hd/VideoCoCo`는 2026-07-29에 생성된 public 저장소로, stars 77·forks 2·open issues 2였고, tags와 GitHub Releases는 없었다. GitHub API의 license 필드는 `null`이며 checked-in `LICENSE` 파일도 확인되지 않았다.

README는 다섯 개의 Agent Skill, 8개 사례의 toy video-to-video triplet, OmniWeaving용 inference script와 작은 upstream patch를 제공한다고 설명한다. toy set은 buoyancy, deformation, melting, surface tension, sublimation, elasticity, boiling을 포함하지만, README가 명시하듯 format inspection용 예시이지 training-scale 데이터가 아니다.

가장 중요한 제약은 tuned weight다. README는 “uploading”이라고 표기하고, Hugging Face `mickyhimself/VideoCoCo` API는 public·ungated 상태지만 조회 시점에 `.gitattributes` 외 repository sibling이 없고 다운로드도 0이었다. 따라서 지금 공개 상태를 **code·skill·toy artifact는 확인되지만 tuned checkpoint는 아직 실질적으로 배포되지 않은 초기 연구 release**로 보는 편이 정확하다.

재현 경로도 독립 패키지 설치가 아니다. 공식 OmniWeaving(HunyuanVideo-1.5)을 clone해 환경을 만들고, VideoCoCo patch와 inference script를 적용한 뒤, base pipeline의 transformer를 tuned weights로 교체하는 형태다. 문서에는 single-GPU edit inference와 8-GPU manifest shard runner가 모두 있지만, tuned weight가 실제로 올라오기 전에는 end-to-end 재현 명령으로 간주할 수 없다. README와 `inference/README.md`는 inference code 및 tuned weights가 Tencent HY Community License Agreement의 적용을 받는다고 명시한다.

| 공개 표면 | 확인된 내용 | 현재 해석 |
|---|---|---|
| arXiv | 3 figures, 3 tables, VideoCoCo-3K와 benchmark 결과 | 방법·근거의 기준 문서 |
| GitHub | skills, 8-case toy triplets, inference scripts, OmniWeaving patch | 연구용 실행 scaffold는 공개 |
| Hugging Face | public/ungated model repo지만 실질 파일 없음 | tuned weight 배포는 아직 완료되지 않음 |
| License | GitHub API는 `null`, repo LICENSE는 없음; README는 Tencent HY Community License를 언급 | 코드·weight 사용 조건은 upstream license까지 직접 확인 필요 |

## 실무 관점에서의 해석

VideoCoCo의 가치가 “Blender를 비디오 생성 앞에 붙였다”는 데만 있지는 않다. 더 일반적인 메시지는 **생성 모델의 내부 추론을 검증 가능한 외부 프로그램으로 일부 옮기자**는 것이다. 물리 과정, 공간적 제약, 작업 순서처럼 틀리면 즉시 비용이 큰 요소는 code·simulator·constraint solver가 맡고, 조명·재질·시각적 풍부함처럼 확률적 생성이 강한 요소는 generator가 맡는 분업이다.

이 구조는 product workflow에도 잘 맞는다. 광고나 영화의 완전한 물리 simulation이 아니더라도, 제품이 조립되는 순서, 액체가 채워지는 방향, 기계 부품의 충돌, 캐릭터와 object의 인과 관계처럼 “이 장면은 이렇게 흘러야 한다”는 요구가 있는 곳에서는 draft를 검토 지점으로 사용할 수 있다. 생성 결과가 틀렸을 때도 prompt를 다시 추측하는 대신 code와 simulation state를 고칠 수 있어 debug surface가 생긴다.

다만 비용과 표현 한계는 분명하다. Blender code synthesis와 rendering은 단순 text-to-video보다 느리고, 복잡한 fluid·cloth·soft-body simulation은 별도의 기술 지식과 계산 비용을 요구한다. simulator가 단순화한 동작이 반드시 사진처럼 자연스러운 영상으로 이어지는 것도 아니다. 그래서 이 접근은 모든 video generation을 대체하기보다, **물리적 사건의 제어 가능성과 검증 가능성이 시각적 즉흥성보다 중요한 구간**에 가장 적합하다.

또한 논문의 정량 이득은 OmniWeaving base와 저자 설정에서 나온 결과다. 다른 editor·simulator·prompt distribution으로 옮겼을 때 같은 크기의 개선이 보장되지는 않는다. 공개 checkpoint가 아직 비어 있다는 점도 실제 도입과 독립 재현을 막는 현재의 가장 큰 제약이다. 그럼에도 VideoCoCo는 다음 세대 비디오 agent가 단순히 더 긴 prompt를 읽는 방향이 아니라, **계획을 실행하고 결과를 생성하는 이중 엔진**으로 갈 수 있음을 선명하게 보여 준다.

Sources: https://arxiv.org/abs/2607.27380v1, https://arxiv.org/html/2607.27380v1, https://github.com/micky-li-hd/VideoCoCo, https://api.github.com/repos/micky-li-hd/VideoCoCo, https://huggingface.co/mickyhimself/VideoCoCo, https://huggingface.co/api/models/mickyhimself/VideoCoCo
