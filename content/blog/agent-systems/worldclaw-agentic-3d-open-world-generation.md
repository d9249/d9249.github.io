---
title: "WorldClaw는 3D 오픈 월드를 한 번에 만들지 않고 agentic build graph로 조립한다"
date: "2026-08-10T03:15:41+09:00"
description: "WorldClaw는 자연어 장면 요청을 구조화된 계획, 전역 지형, 지역별 편집 가능한 3D 객체로 분해하고 render-guided refinement로 다시 검증하는 agentic 3D 오픈 월드 생성 프레임워크다."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - WorldClaw
  - Agentic 3D Generation
  - Open-world Generation
  - Hunyuan3D
  - Blender
draft: false
---

텍스트 한 문장으로 넓은 3D 세계를 만든다는 말은 멋지지만, 실제 요구사항은 이미지 한 장을 그리는 일과 다르다. 산·강·마을의 관계가 멀리서도 이어져야 하고, 가까이 다가갔을 때는 지역마다 충분한 밀도의 물체가 있어야 하며, 결과물은 카메라 고정 영상이 아니라 탐색·수정·재사용할 수 있는 장면이어야 한다.[2][3]

`WorldClaw: Agentic 3D Open-World Generation at Scale`은 이 문제를 거대한 단일 생성 모델로 풀지 않는다.[2][3] Tencent Hunyuan3D Research가 공개한 이 프레임워크는 자연어 요청을 **구조화된 장면 명세 → 전역 지형 → 지역별 객체 생성·배치**라는 세 단계의 build graph로 분해한다. 핵심은 지역의 의미와 지형을 먼저 고정한 뒤, 정말 상세도가 필요한 구역에만 instance-level 3D 자산을 얹고 render–inspect–refine loop로 다시 검증하는 데 있다.[3][4]

공개 프로젝트 페이지는 눈·산·호수·마을이 섞인 하나의 장면을 입력 예시로 삼아, 계획과 자산·지형 생성, 선택 지역의 객체 배치, 최종 scene refinement가 어떻게 연결되는지 보여 준다.[4] Hugging Face Papers에는 2026년 8월 5일 공개된 논문으로 등록되어 있으며, 저자는 Chunchao Guo, Jinpeng Li, Yang Li, Zilong Huang이다.[1][2]

<figure style="margin: 1.8rem 0;">
  <a href="/images/blog/worldclaw-agentic-3d-pipeline.jpg">
    <img
      src="/images/blog/worldclaw-agentic-3d-pipeline.jpg"
      alt="사용자 입력을 intent analysis와 planning, 전역 지형 생성, 지역별 객체 생성과 배치, 장면 refinement를 거쳐 편집 가능한 3D scene으로 만드는 WorldClaw의 공식 파이프라인"
      style="width: 100%; max-width: 100%; height: auto; display: block; background: #fff;"
    />
  </a>
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 Figure 1. WorldClaw는 전체 공간의 의미·지형을 먼저 정한 다음 지역별 객체를 독립적인 3D 자산으로 생성·배치하고, 렌더 결과를 보며 수정한다.[3][4]
  </figcaption>
</figure>

## 무엇을 해결하려는가

기존의 3D 장면 생성은 대체로 네 갈래 사이에서 trade-off를 겪는다. 규칙 기반 procedural generation은 규모와 통제에는 강하지만 하드코딩된 표현력에 묶이기 쉽다. image/video lifting은 보이는 화면의 품질은 높일 수 있어도 장거리 공간 일관성과 기하 fidelity가 약해질 수 있다. native 3D 생성은 구조적 표현을 직접 다루지만 공간 범위가 고정되기 쉽고, LLM agent 방식은 계획을 만들 수 있어도 지역의 세부 자산과 지형을 함께 안정적으로 완성하기 어렵다.[3]

WorldClaw가 겨냥하는 계약은 그래서 더 엄격하다. 최종 결과는 보기 좋은 뷰가 아니라, 전역적으로 연결된 terrain과 독립적으로 수정 가능한 textured mesh instance를 함께 가져야 한다. 논문은 이를 통해 자유 시점 탐색, object-level editing·reuse, 기존 rendering·animation·game-engine workflow와의 연결을 목표로 든다.[2][3]

## 핵심 아이디어 / 구조 / 동작 방식

### 1. 자유 텍스트를 공용 장면 명세로 바꾼다

첫 단계의 intent analysis agent는 사용자가 명시한 장면 유형, 핵심 지역·객체, 공간 관계, 시각적 선호를 추출하되 비어 있는 내용을 임의로 채우지 않는다. 이어 scene planning agent가 downstream module이 필요로 하는 region, terrain constraint, object constraint를 정해진 schema로 완성한다.[3][4]

이 명세는 단순한 중간 요약이 아니다. 이후 지형·객체·refinement agent가 같은 방식으로 읽는 **semantic interface**다. 즉 “산 뒤편에 호수가 있고 호숫가에는 마을이 있다”는 문장은 이미지 프롬프트로 소모되지 않고, 지역 관계·지형 조건·객체 분포를 묶는 실행 계약으로 남는다.[3][4]

### 2. 지형을 배경이 아니라 전역 제약으로 만든다

두 번째 단계는 semantic layout map, 재사용 가능한 terrain-asset prototype, surface material을 만들고 region-aware height field로 결합한다.[3][4] 논문 설명대로 각 지역의 base elevation, multi-frequency noise, peak·dune·terrace·erosion 같은 geomorphic operator를 부드러운 region weight로 섞어, 서로 다른 지형이 끊기지 않으면서도 의미상 구분되는 경계를 만들려 한다.[3]

여기서 render–inspect–edit loop는 장식이 아니다. regional transition, material scale, asset scattering, lighting을 렌더링으로 확인한 뒤 지역별로 고친다. 따라서 global terrain은 뒤에 객체를 놓기 위한 평면 바닥이 아니라, 지역 객체가 어디에 어떻게 놓일 수 있는지를 결정하는 shared geometry가 된다.[3][4]

| 단계 | 고정하는 산출물 | 뒤 단계가 얻는 제약 |
|---|---|---|
| Intent analysis · planning | 지역, terrain, object constraint를 담은 장면 명세 | 모든 agent가 공유하는 semantic contract |
| Global terrain generation | semantic layout, asset prototype, material, region-aware terrain | 연속된 지형과 지역별 위치·표면 조건 |
| Regional object generation · placement | textured mesh instance와 terrain-aligned transform | 개별 객체의 편집성·재사용성 |
| Scene refinement | pose, scale, mesh quality, object–terrain contact 수정 | 장면 graph가 아니라 렌더된 결과에 기반한 품질 확인 |

### 3. 모든 곳을 같은 해상도로 만들지 않는다

세 번째 단계는 모든 지역을 세밀하게 재생성하지 않는다. regional planning agent가 전역 명세와 terrain을 함께 보고, 해당 terrain이 요청된 기능을 지탱할 수 있는 지역만 고른다.[3][4] 선택 지역은 recorded camera에서 렌더링한 terrain view를 바탕으로 composition image를 만들고, instance를 분할한 뒤 textured mesh로 재구성한다. 이후 object와 terrain camera의 대응 관계를 이용해 terrain-aligned position, scale, orientation을 회복한다.[3]

마지막 refinement에서는 object agent가 pose·mesh quality·scale을 점검하고, terrain agent가 떠 있거나 충돌한 object–terrain contact를 고친다. 중요한 차이는 시스템이 scene graph의 값만 믿지 않고 **매 edit 뒤에 다시 렌더링해** 실패를 이미지에서 찾는다는 점이다.[3][4]

## 공개된 근거에서 확인되는 점

WorldClaw의 실험은 공통된 medieval village 테마를 조건으로 SynCity, Marble, MajutsuCity, WorldGen, GPT-5.6 Sol과 qualitative comparison을 수행한다.[3] 논문이 주장하는 우위는 단일 점수 leaderboard가 아니라, semantic layout으로부터 나온 연속적 terrain, 지역 간 공간 조직, 다양한 object category, instance·depth·normal render로 확인 가능한 explicit scene representation의 조합이다.[3]

구현 표면도 범용 단일 모델과는 거리가 있다. 저자들은 planning과 procedural design에 Claude Opus 4.8, 이미지·3D 처리의 task-specific skill에 GPT-Image-2, SAM3, SAM3D, Hunyuan3D를 사용했다고 적는다. 실험은 4장의 NVIDIA H20 GPU를 장착한 서버에서 수행했고, terrain 생성·객체 배치·refinement·rendering에는 Blender 5.1.1을 사용했다.[3]

따라서 이 결과를 “한 번의 text-to-3D 호출로 대규모 게임 월드가 완성된다”라고 읽으면 안 된다. 공개 근거는 다양한 prompt의 qualitative scene과 명시적 rendering channel을 제시하지만, 비용·생성 시간·성공률을 포함한 대규모 정량 benchmark는 논문의 중심 증거가 아니다.[3] 공식 project page도 현재 ArXiv와 world exploration을 중심으로 제공하며, 코드·가중치·배포용 package를 직접 연결하는 공개 surface는 확인되지 않는다.[4]

## 실무 관점에서의 해석

WorldClaw의 가장 흥미로운 기여는 3D 생성 품질 자체보다, **world generation을 agentic build system으로 모델링한 방식**이다. 큰 공간의 coherence와 가까운 물체의 richness를 한 모델·한 표현에 동시에 맡기지 않는다. 먼저 전역 constraint를 명시적 intermediate representation으로 고정하고, 그 제약 아래에서 지역별 generation을 선택적으로 수행하며, 최종 판단은 render 기반 verifier가 내린다.

이 설계는 agent system에도 익숙한 패턴이다. 자연어 request를 바로 최종 artifact로 밀어 넣지 않고, typed plan, shared state, bounded worker, observable verification loop를 둔다. 3D 도메인에서는 그 state가 region map·height field·mesh·placement transform으로 나타날 뿐이다. 대규모 agent workflow를 설계할 때도 “planning output이 다음 단계가 실제로 검증 가능한 constraint인가”라는 질문이 중요해지는 이유다.

다만 production pipeline으로 채택하려면 먼저 비용과 release maturity를 확인해야 한다. WorldClaw는 강력한 proprietary model과 여러 3D foundation model, 4×H20, Blender 기반 toolchain에 의존한다고 명시한다.[3] 또한 현재 공개 표면에서 코드·모델·installation 문서가 확인되지 않으므로, 지금은 즉시 재현 가능한 SDK보다는 **3D world build graph의 연구 prototype**으로 보는 편이 정확하다.[4]

그럼에도 이 방향은 유효하다. 앞으로의 open-world generation은 “한 컷이 그럴듯한가”를 넘어, 전역 지형이 계속 일관되는가, 지역 자산을 편집·재배치할 수 있는가, verifier가 object–terrain interaction을 찾아 고칠 수 있는가를 함께 묻게 될 가능성이 크다. WorldClaw는 그 질문을 한 개의 거대한 generator가 아니라 계획·생성·검증이 이어지는 조립 공정으로 답한다.

## Sources

[1] https://huggingface.co/papers/2608.05248 — Hugging Face Papers: WorldClaw
[2] https://arxiv.org/abs/2608.05248 — WorldClaw arXiv abstract
[3] https://arxiv.org/html/2608.05248 — WorldClaw arXiv HTML
[4] https://tencent-hunyuan.github.io/Hunyuan3D-WorldClaw — WorldClaw official project page
