---
title: "Google DeepMind Science Skills는 과학 에이전트를 워크플로 검증 문제로 본다"
date: "2026-06-02T21:15:18"
description: "Google DeepMind의 Science Skills는 Antigravity 위에서 생명과학 데이터베이스, 스크립트, 도메인별 절차를 SKILL.md 단위로 묶어 과학 워크플로의 신뢰도와 토큰 효율을 높이려는 초기 번들이다."
author: "Sangmin Lee"
category: "agent-skills-workflows"
tags:
  - Science Skills
  - Google DeepMind
  - Antigravity
  - Gemini for Science
  - AI for Science
  - Agent Skills
image: "/images/blog/science-skills-workbench.svg"
draft: false
---

Google DeepMind의 `science-skills` 저장소는 “과학자를 대신해 논문을 쓰는 에이전트”보다 훨씬 더 실무적인 지점을 겨냥한다. 이 프로젝트의 핵심은 Antigravity 같은 agentic workbench에 생명과학 데이터베이스, API wrapper, 분석 절차, 검증 가능한 출력 조건을 `SKILL.md` 패키지로 장착하는 것이다. 즉 모델이 더 많은 과학 지식을 “알고 있다”가 아니라, 모델이 필요한 순간에 올바른 데이터 소스와 도구를 찾아 쓰고, 그 결과를 근거가 남는 artifact로 만들 수 있느냐의 문제다.

이번 글은 Google DeepMind의 GitHub 저장소, 공식 technical report, Antigravity science use case, Gemini for Science 발표 페이지를 함께 보고 정리한 것이다. 기존 Google I/O 2026 글이 Gemini와 Antigravity를 Google의 agentic platform 전략으로 다뤘다면, 이 글은 그중 **Science Skills라는 실제 skill bundle**에 초점을 맞춘다. 로컬로 확인한 저장소 snapshot에는 37개의 `SKILL.md`, 63개의 Python helper script, 100개 이상의 Markdown/reference 파일이 들어 있었다. 이 숫자만 봐도 Science Skills는 데모 프롬프트 모음이 아니라, 과학 업무를 실행 가능한 작은 런북들로 쪼개려는 시도에 가깝다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/science-skills-workbench.svg"
    alt="Architecture diagram showing Antigravity harness, Science Skills bundle, scientific resources, and verifiable artifacts"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    Science Skills의 운영적 위치. Antigravity agent harness가 일반적인 계획·실행 루프를 제공하고, Science Skills는 과학 데이터베이스 접근, 도메인 절차, helper script, 결과 검증 단위를 추가한다.
  </figcaption>
</figure>

## 무엇을 해결하려는가

과학 업무에서 LLM이 겪는 병목은 단순히 “지식이 부족하다”로 끝나지 않는다. 모델은 PubMed, UniProt, AlphaFold Database, ClinVar, gnomAD, PubChem 같은 리소스가 있다는 사실을 알 수 있지만, 특정 질문에서 어떤 API를 호출해야 하는지, 어떤 identifier를 먼저 resolve해야 하는지, rate limit이나 라이선스 조건은 무엇인지, 결과를 어떤 형식으로 검증해야 하는지까지 안정적으로 처리하기 어렵다. 논문이 지적하듯, 모델이 맞는 생물학적 문장을 생성하더라도 그 문장을 1차 데이터나 문헌 citation으로 grounding하지 못하면 과학 업무에서는 신뢰하기 어렵다.

Science Skills는 이 간극을 skill layer로 메우려 한다. 각 skill은 YAML frontmatter가 있는 `SKILL.md`를 중심으로, 사용 조건, 금지 조건, 도구 호출 방식, helper script, 참고 문서를 함께 담는다. 예를 들어 AlphaFold Database skill은 UniProt accession이 있을 때 구조 confidence, pLDDT, PAE, disorder, domain boundary 분석으로 진입한다. 반면 protein name이나 gene name만 있을 때는 먼저 UniProt ID를 요구하라고 명시한다. Foldseek skill은 사용자가 실제 3D coordinate file을 제공했을 때만 structural search에 쓰라고 제한한다. 이런 조건문은 사소해 보이지만, 과학 워크플로에서는 잘못된 입력 유형으로 잘못된 도구를 부르는 것을 막는 안전장치다.

따라서 이 프로젝트의 문제 정의는 “AI for Science 모델을 하나 더 만든다”가 아니다. 더 정확히는 **과학자의 반복적인 데이터 조회·분석·근거화 작업을 agent skill 단위로 패키징하고, 모델이 generic web search로 헤매지 않도록 경로를 좁힌다**에 가깝다.

## 번들의 실제 구성

공식 technical report는 Science Skills를 Google DeepMind, Literature, Scientific Databases, Workflows 네 그룹으로 제시한다. 로컬 저장소 구조를 기준으로 보면 다음처럼 다시 읽을 수 있다.

| 묶음 | 포함되는 대표 skill | 운영적 역할 |
|---|---|---|
| Genomics / variants | AlphaGenome, ClinVar, dbSNP, Ensembl, gnomAD, GTEx, ENCODE cCREs, UCSC conservation, JASPAR, UniBind | 변이, 조절 요소, 조직별 발현, 전사인자 결합, variant effect 해석 |
| Protein / structure | AlphaFold Database, UniProt, InterPro, PDB, Foldseek, MMseqs2/BLAST, MSA, PyMOL, STRING | sequence → domain → structure → interaction으로 이어지는 단백질 분석 경로 |
| Chemistry / clinical translation | ChEMBL, PubChem, OpenFDA, Open Targets, ClinicalTrials.gov | 화합물, 타깃, 약물 안전성, 임상시험, translation evidence 조회 |
| Literature / evidence | arXiv, bioRxiv/medRxiv, Europe PMC, OpenAlex, PubMed | 논문 검색, DOI/PMCID 기반 full text, citation, bibliometric evidence 회수 |
| Ontology / pathways | EMBL-EBI OLS, QuickGO, Reactome, NCBI sequence fetch | ontology term, GO annotation, pathway enrichment, sequence retrieval |
| Runtime / meta | `uv`, `scienceskillscommon`, workflow skill creator | dependency 설치, 공통 유틸, 완료된 workflow의 skill화 |

이 표에서 중요한 점은 데이터베이스 이름의 나열보다 **도메인별 I/O 계약**이다. 어떤 skill은 rsID, VCF coordinate, HGVS를 오가며 variant를 resolve한다. 어떤 skill은 UniProt accession이 있어야 동작한다. 어떤 skill은 FASTA sequence가 있을 때 homolog search로 들어가고, 다른 skill은 3D coordinate file이 있을 때 structural search를 수행한다. 인간 bioinformatician에게는 익숙한 구분이지만, 일반 agent에게는 자주 흐려지는 경계다. Science Skills는 이 경계를 문서와 script로 고정한다.

또 하나 흥미로운 부분은 `workflow-skill-creator`다. 이 skill은 새로운 과학 workflow를 처음부터 상상해 만들기보다, 이미 끝난 사용자 workflow를 되돌아보고 재사용 가능한 skill로 증류하는 역할을 한다. 이는 Science Skills를 고정된 bundle로만 보지 않고, 연구팀이 반복적으로 수행한 절차를 skill library로 축적하는 운영 모델까지 염두에 둔 설계로 읽힌다.

## Antigravity와 결합될 때 의미가 생기는 이유

Science Skills는 단독 CLI라기보다 Antigravity 위에서 더 강하게 의미를 갖는다. Antigravity science use case 페이지는 세 가지 메시지를 전면에 둔다. 첫째, 결과가 evidence에 grounded되고 각 단계가 읽을 수 있는 **verifiable scientific artifacts**가 되어야 한다. 둘째, AlphaGenome 같은 frontier model과 AlphaFold Database, UniProt, PubChem, ChEMBL 등 30개 이상의 주요 과학 데이터베이스를 agent가 다룰 수 있어야 한다. 셋째, 문헌 종합부터 wet-lab reagent generation까지 몇 시간 걸리던 수동 pipeline을 몇 분 단위로 줄이는 것이 목표다.

이 포지셔닝은 일반 coding agent의 “파일 수정 후 테스트 통과”와 다르다. 과학 workflow에서는 성공 조건이 코드 컴파일보다 복합적이다. 예를 들어 TERT locus 근처의 CTCF-associated cCRE를 찾는 작업은 특정 accession과 좌표가 맞아야 한다. 특정 InChI가 PubChem에 없다는 사실을 확인하고 가장 유사한 compound를 찾아야 하는 작업은 “뭔가 그럴듯한 화합물 설명”으로는 실패다. 논문은 이런 내부 capability task 67개를 만들고, 성공을 binary로 평가했다. Science Skills가 말하는 reliability는 대화 품질이 아니라, 이런 expert-validated task를 끝까지 맞히는 비율이다.

## 공개된 수치에서 확인되는 효과

공식 report의 가장 강한 결과는 내부 capability benchmark다. 67개 과학 task에서 Antigravity의 Gemini 3 Flash는 Science Skills 없이 33개 성공, reliability 49%를 기록했다. Science Skills를 붙이면 62개 성공, 93%로 올라간다. Gemini 3.1 Pro도 67%에서 91%로 올라간다. 특히 눈에 띄는 점은 **Science Skills를 붙인 Flash가 Science Skills 없는 Pro보다 높은 reliability를 보인다**는 것이다. 이는 skill layer가 단순 보조 설명이 아니라, 작은 모델이 과학 도구를 안정적으로 쓰게 만드는 operational scaffold 역할을 한다는 해석을 가능하게 한다.

| 평가 | Science Skills 없음 | Science Skills 있음 | 해석 |
|---|---:|---:|---|
| Gemini 3 Flash, 67 internal tasks | 33/67, 49% | 62/67, 93% | 작은/빠른 모델이 skill로 Pro급 reliability에 접근 |
| Gemini 3.1 Pro, 67 internal tasks | 45/67, 67% | 61/67, 91% | 강한 모델도 과학 도구 경로가 주어지면 안정화 |
| Flash 평균 token / task | 13,952 | 6,827 | 2.04× efficiency gain |
| Pro 평균 token / task | 5,828 | 3,588 | 1.62× efficiency gain |

토큰 효율도 같은 방향이다. Flash는 평균 13,952 token에서 6,827 token으로 줄어 2.04× efficiency gain을 보였고, Pro는 5,828에서 3,588로 줄어 1.62× gain을 보였다. 논문은 Science Skills가 없을 때 agent가 더 많은 step을 쓰고, 중간 오류를 내며, 특정 정보를 찾기 위해 generic web search로 돌아가는 경향이 있다고 설명한다. 반대로 skill이 있으면 필요한 데이터 소스로 바로 진입하고, 출력 형식과 검증 조건이 더 좁아져 전체 step 수와 오류가 줄어든다.

<figure style="margin: 1.8rem 0;">
  <img
    src="/images/blog/science-skills-evaluation-results.svg"
    alt="Bar charts summarizing Science Skills reliability, token efficiency, and BioReason results"
    style="width: 100%; max-width: 100%; height: auto; display: block;"
  />
  <figcaption style="margin-top: 0.6rem; font-size: 0.95rem; color: #666;">
    공식 technical report의 핵심 수치를 재구성한 그림. Science Skills는 내부 capability benchmark에서 reliability를 높이고, 평균 token 사용량을 줄이며, BioReason variant reasoning에서도 큰 폭의 정확도 개선을 보였다.
  </figcaption>
</figure>

외부 평가로는 BioReason이 사용됐다. BioReason은 variant effect에 대한 multi-step reasoning dataset이며, 논문은 licensing 제한 때문에 KEGG set을 제외하고 VEP-Coding과 VEP-Non-SNV subset만 평가했다. Gemini 3 Flash 기준 VEP-Coding은 41.4%에서 60.9%, VEP-Non-SNV는 46.6%에서 81.6%로 올라갔다.

| BioReason subset | 테스트 수 | Science Skills 없음 | Science Skills 있음 |
|---|---:|---:|---:|
| VEP-Coding | 1,233 | 41.4% | 60.9% |
| VEP-Non-SNV | 873 | 46.6% | 81.6% |

이 수치는 “skill이 있으면 모든 과학 문제가 자동으로 풀린다”는 증거가 아니다. 하지만 특정 생명과학 도메인에서, 모델이 올바른 데이터베이스와 분석 경로를 쓰도록 강제하는 것이 multi-step reasoning 정확도에 큰 영향을 줄 수 있음을 보여준다.

## Gemini for Science 안에서의 위치

Google의 Gemini for Science 발표는 Science Skills를 더 큰 제품 흐름 안에 둔다. Google Labs에는 Co-Scientist 기반 hypothesis generation, AlphaEvolve/ERA 기반 computational discovery, NotebookLM 기반 literature insights가 함께 제시됐다. 그중 Science Skills는 “desktop scientific workbench”에 가까운 축이다. Google은 Science Skills가 UniProt, AlphaFold Database, AlphaGenome API, InterPro 등 30개 이상의 life science database와 도구를 통합하고, structural bioinformatics와 genomic analysis 같은 수동 workflow를 minutes rather than hours로 줄인다고 설명한다.

특히 발표 글은 AK2 유전자 변이로 발생하는 rare genetic disease 사례를 언급한다. Google research team이 Science Skills를 사용해 보통 몇 시간 걸리는 복합 분석을 몇 분 안에 수행했고, AK2 loss-of-function이 에너지 대사, hematopoiesis, sensory hair cell development에 미치는 잠재 mechanism에 대한 insight로 이어졌다는 내용이다. 여기서 중요한 것은 “AI가 새로운 생물학을 발견했다”는 식의 과장보다, agent가 여러 데이터베이스와 구조 분석 단계를 하나의 workbench에서 엮었다는 점이다.

## 실무 관점에서의 해석

내가 보기에 Science Skills의 의미는 세 가지다.

첫째, 과학 에이전트의 경쟁력이 모델 크기만으로 결정되지 않는다는 점을 보여준다. Flash와 Pro 비교에서 보이듯, domain-specific skill layer는 smaller model의 reliability를 크게 끌어올릴 수 있다. 이는 비용·속도·quota가 중요한 실무 환경에서 중요하다. 모든 과학 query를 가장 비싼 모델에 보내는 대신, 검증된 skill과 wrapper가 붙은 더 효율적인 모델로도 상당한 작업을 처리할 수 있기 때문이다.

둘째, skill은 documentation의 다음 형태다. 인간용 문서는 “이 API는 이렇게 쓴다”를 설명하지만, agent용 skill은 “이런 입력이 들어오면 이 도구를 쓰고, 이런 입력이면 쓰지 말고, 이 script를 실행하고, 이 결과 필드를 확인하라”까지 담아야 한다. Science Skills의 각 `SKILL.md`는 바로 이 agent-operable documentation의 예시다.

셋째, 과학 자동화의 핵심은 autonomy보다 verification이다. 기존 블로그에서 다룬 AutoResearch AI 흐름과 연결해 보면, 과학 agent는 많이 실행하는 것보다 **무엇을 근거로 어떤 결론을 냈는지 남기는 것**이 더 중요하다. Science Skills가 Antigravity의 artifact, citation, coordinate, database ID, helper script와 결합되는 이유도 여기에 있다. 재현 가능한 과학 workflow는 답변 문장보다 실행 흔적과 근거 그래프가 중요하다.

## 한계와 리스크

물론 현재 공개물만으로 보면 한계도 분명하다.

첫째, 초기 bundle은 biology와 life sciences에 집중되어 있다. 물리, 화학 일부, 재료과학, 수학, 임상 workflow 전체를 포괄한다고 보기는 어렵다. 둘째, 저장소 README는 일부 skill이 API key를 요구하거나, API key가 있으면 rate limit이 개선된다고 설명한다. agent가 `.env`에 key를 쓰도록 안내하는 흐름은 편리하지만, 조직 환경에서는 secret handling, audit, permission boundary를 별도로 설계해야 한다. 셋째, 외부 데이터베이스의 라이선스와 terms of use는 skill별로 다르며, 저장소도 이에 대한 책임을 사용자에게 남긴다. 넷째, Agent Skills standard 자체의 한계도 있다. 논문은 robust execution과 재현 가능한 측정이 과학자의 다양한 하드웨어, 소프트웨어, task formulation 환경에 의존한다고 말한다.

또 하나의 운영 리스크는 skill drift다. 과학 데이터베이스 API는 바뀌고, ontology는 업데이트되며, model/tool behavior도 변한다. 오늘 잘 작동하는 wrapper가 6개월 뒤에도 같은 결과를 낸다고 가정하면 안 된다. 따라서 Science Skills 같은 번들을 실제 연구 조직에 들일 때는 skill registry, versioning, regression test, license review, secret management가 함께 따라와야 한다. 그렇지 않으면 skill은 신뢰 레이어가 아니라 오래된 자동화 지식의 저장소가 될 수 있다.

## 결론

Science Skills는 “AI가 과학을 자동으로 한다”는 구호보다 훨씬 구체적인 방향을 보여준다. 과학 업무는 질문 하나에 답하는 문제가 아니라, identifier를 resolve하고, 올바른 데이터베이스를 고르고, wrapper를 실행하고, 결과를 해석하고, 근거를 남기는 workflow다. Google DeepMind는 이 workflow를 `SKILL.md`와 helper script, reference, Antigravity artifact loop로 포장해 agent가 다룰 수 있는 단위로 만들고 있다.

그래서 이 프로젝트의 핵심 문장은 “Science Skills가 과학 지식을 추가한다”보다 **Science Skills가 과학 워크플로의 경계와 검증 조건을 추가한다**에 가깝다. 모델이 더 똑똑해지는 것만으로는 부족하다. 과학 에이전트가 실제 연구자의 도구가 되려면, 어떤 데이터에 접근했고, 어떤 절차를 따랐고, 어떤 근거로 결론을 냈는지가 남아야 한다. Science Skills는 그 운영 레이어를 공개 저장소 형태로 제시한 초기 사례다.

Sources: https://github.com/google-deepmind/science-skills, https://storage.googleapis.com/deepmind-media/papers/google_deepmind_science_skills_for_antigravity_towards_efficient_and_reliable_scientific_workflows.pdf, https://antigravity.google/use-cases/science, https://blog.google/innovation-and-ai/technology/research/gemini-for-science-io-2026/, https://ai.google/gemini-for-science, https://skills.sh/google-deepmind/science-skills, https://antigravity.google/docs/skills
