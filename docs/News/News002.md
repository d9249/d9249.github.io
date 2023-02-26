---
title: 12월 1주차 그래프 오마카세
layout: default
parent: News
nav_order: 2
has_children: true
permalink: /docs/News/News002
---

# 12월 1주차 그래프 오마카세

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

출처: https://tteon.notion.site/9b3c22dfd08a4039b24b281e111d4ef4?v=24efb037bd7440e7a0ca7cf26a973dd6

안녕하세요. 그래프 오마카세 주방장 입니다.

이번주 미리보기 및 키워드는 다음과 같습니다.

keyword ; hypergraph, positiaon encoding , graph conference

- positional encoding 에 관심있는분들 추천드립니다.
- hyper graph application 에 관심있는분들 추천드립니다.
- diffusion model with graph 에 관심있는분들 추천드립니다.

---

# Fair Multi-Stakeholder News Recommender System with Hypergraph ranking 

[https://arxiv.org/pdf/2012.00387.pdf]

- 추천시스템의 고질병이죠 ? popularity bias 라는 문제를 hypergraph 형태의 관계에 치중한 데이터를 활용해서 해소해보고자 시도한 논문입니다.
- Popularity bias is a long-standing challenge in recommender systems: popular items are overly recommended at the expense of less popular items that users may be interested in being under-recommended. from [paper](https://dl.acm.org/doi/10.1145/3447548.3467376)
- 본 논문에선 여러 분야에서 popularity bias 가 중요하겠지만, news, 언론 도메인에 적용하여 그 우수성을 실험으로 입증했습니다. 문제점으로는 뉴스를 추천받을때, 유저의 성향에 걸맞게 추천을 해주다보면 그 유저 또한 해당 성향에 갇힐 위험이 있습니다. 이 때, multi-stakeholder(다중이해관계자) 라는 컨셉을 하이퍼그래프(다중관계 표현에 특화된 형태) 를 적용하여 해결해주고자 합니다.
- 모델은 심플합니다. 기존과 비슷하게 user - article - author 로 구성한 후 , 마지막에 hypergraph 를 통해 여러 다중관계로부터 추출된 weight 를 concat 해줍니다.
- 실험지표는 diveristy , fairness 등 저희가 친숙한 지표인 유저가 좋아할만한 콘텐츠를 추천해주는걸 맞추는 정확도에서 한층 더 나아가 combination 을 해줍니다.
- 추천시스템 그리고 AI-ethics 에 관심이 많으신분들이 보시면 좋을거라 생각됩니다. 또한, 하이퍼그래프가 어떤식으로 활용이 될지에 대해 궁금하셨던 분들 또한 재밌게 볼 수 있으실겁니다.

Social Recommendation System Based on Hypergraph Attention Network [https://downloads.hindawi.com/journals/cin/2021/7716214.pdf]

- social 분야에서 hypergraph 를 적용한 논문입니다. 기존 graph 는 user-item, user-user 와 같이 pair-wise 하게 관계를 설정하고 추론하기에 복잡한 관계에 대해서는 한계점이 있다고 지적을 합니다. 그를 극복하기 위해 hypergraph를 활용했습니다.
- 다중관계(논문에서는 triangular혹은 motif라 표현합니다.) 에서는 기존 그래프에서 부족한 semantic 정보를 hypergraph의 multi-complexity order(high-order)로 극복할 수 있다고 주장합니다. 예를 들어, 유저-유저 간의 관계를 넘어서, 유저가 사용하는 핸드폰종류 - 유저가 사용하는 핸드폰종류(co-occurrence ,동시발생 요소, 공통점) 를 기반으로 2-order , 3-order (해당 유저의 이웃들) 을 추론하게된다면 더욱 유사성에 대해 개런티 를 얻게 된다는거죠.
- 모델은 심플합니다. GAT 를 활용해서 해당 hypergraph의 정보를 정량화해주었고, 추론했습니다. 최종적으로 요새 산업에서 자주 활용되는 LightGCN의 성능을 능가했다고 주장합니다.
- 추천에 지식그래프 혹은 heterogeneous graph (이종그래프) 요소를 도입하려는 시도가 많이보입니다. 허나 그 전에, 공통 요소(co-occurrence) 를 잘 표현할 수 있는 요소인 hypergraph를 먼저 고려해보시는게 어떨까 싶습니다.(storage-efficient, proof of the results of recommendation etc..) [paper](https://www.osti.gov/biblio/1376791)

---

# Towards Better Link Prediction in Dynamic Graphs 

[https://medium.com/@shenyanghuang1996/towards-better-link-prediction-in-dynamic-graphs-cdb8bb1e24e9]

- viz → dynamic network 에서 엣지의 분포를 어떻게 시각화할지 고민하시던 분들에게 도움이 될 것 같습니다. TEA , TET plot 각각 2가지 시각화를 통해 dynamic network 의 edge distribution 을 파악할 수 있습니다. 이를 통해, sampling strategy 를 기획하는것도 좋아보입니다. (long-tail)
- edgeBank → evaluation 할 시에, 해당 엣지가 EdgeBank 에 있는지 없는지를 확인한 후, bool 형태로 나타냅니다. 구체적으로는 memorization table 에 저장하고 확인합니다. dynamic programming 관점으로 접근하시면 좋을것 같습니다. training 시 발견한 (src, tar, time) edge 를 edgebank 에 저장 후 활용이라는 관점입니다..
- negative sampling → 기존에는 edge 를 random uniform 측면으로 simple 하게 진행했다면, 이제는 train 에서의 분포도를 고려하여 특정 condition을 주는 방식으로 많이 접근하는것 같습니다. 그 관점을 블로그에서 잘 나타냈습니다.
- Dynamic network - link prediction 에 관심이 많으신 분들에게 도움이 되실것 같습니다.

---

# Weisfeiler and Leman Go Relational 

[https://arxiv.org/pdf/2211.17113.pdf]

- expressive-power , isomorphism checking 에 대해 들어보셨을까요? 그래프 데이터 특성상 모두 vertex 그리고 edge 로 표현되기에, 직관적으로 바라보면 vertex가 내가 분석하려는 vertex 인지, edge 가 내가 분석하려는 edge인지 구별하기가 어렵습니다. 이 때 , unique labeling , color 등 으로 판별을 할 수 있는 요소를 넣어줍니다. 그 요소들을 기반으로 구별을 해주는 Technique 을 isomorphsim 이라고 보시면 될 것 같습니다.
- 본 논문에서는 기존 동종그래프(노드, 엣지의 종류가 각각 1가지 종류인 그래프형태)에서 더 나아가 이종그래프(노드,엣지의 종류가 각각 1가지 이상의 종류 특성을 가진 그래프형태) 에서 expressive-power(isomorphism checking)을 활용합니다. 이 때 , 어떤식으로 expressive-power 를 활용했는지 이해하기 위한 목적성을 두고 보시는 걸 추천드립니다.
- Research question 또한 굉장히 재밌는 요소들이 많습니다. 예를 들어, R-GCN(다른 종류의 엣지 정보를sum iteration) , CompGCN(다른 종류의 엣지 정보를 edge feature) 로 활용하는 임베딩 방법론을 비교하는 것 , vertex feature가 추론 성능에 영향을 주는지 등 학산업계 구분없이 그래프에 관심이 많으신 분들이라면 한번쯤 궁금했던 질문들을 답변해줍니다.
- isomorphism 에 대해 궁금하셨으며 , heterogeneous(이종그래프) modeling 에 대해 기획하고 있으신 분들이면 도움이 될 거라 생각됩니다.

# Generalized Laplacian Positional Encoding for Graph Representation Learning 

[https://arxiv.org/pdf/2210.15956.pdf]

- 임베딩 공간 , 컴퓨터가 해당 데이터를 이해할 때, 정보손실없이 잘 이해하게끔 돕기 위해 고안된 여러 방법 중 하나인 positional-encoding 에 대해 이야기 나눕니다.
- 특히, graph 데이터는 non-euclidean geometry에 있음을 강조하기 위한 여러 연구들이 존재합니다. 즉, 기존 데이터(non-tabular)들은 sequence 혹은 grid 로 그 canonical order 정렬방식으로 해당 데이터의 위치를 파악할 수 있는 특성에 반해, 그래프는 그렇지 못하다는거죠.
- 그 대안으로 positional encoding 을 적용하고 그 내에서 기존에 distance 를 강조하기 위해 활용되던 norm 방식에서 한 층 더 나아가 p-norm 이라는 방식을 도입하여 실험합니다.
- 논문 저자는 conclusion에 다음과 같은 말을 conclusion에 적어뒀습니다.
- we were not able to demonstrate its effectiveness in the experiments that we conducted
- non-euclidean 정보를 잘 반영하기 위해 , Novelty method 인 positional encoding 을 적용했는데 오히려 그 encoding 시 발생한 cost 가 커지다보니 이게 과연 효율적인가?라는 의문을 저렇게 표현한거라 생각됩니다.(배가 배꼽보다 큰 경우인거죠.) 그래서 challenge (향후고도화) 에 해당 문제를 언급합니다.
- positional encoding 그리고 graph 에 대해 관심이 많으신 분들이 보면 좋을거라 생각됩니다.
- 추가적으로, appendix 에 positional encoding 의 파라미터별 결과와 그래프의 정보를 vector 로 대표하는 eigenvector 간의 비교대조 항목이 있으니 , 참조해서 보시면 좋을것 같습니다.

---

# A diffusion model for protein design 

[https://www.bakerlab.org/2022/11/30/diffusion-model-for-protein-design/]

- 60여장 가까이되는 백서를 통해 DDPM 즉 , diffusion model with Graph(protein)을 설명해주고 있습니다. 현재 DALL-E 기반으로 생성되는 이미지들에 대해 굉장히 관심들을 많이 가지고 있으시죠? 이미지 관련 분야에 종사하시거나 연구하시는 분들은 DALL-E 를 기반으로 생성모델을 스타트한다는 말씀들을 종종 전해듣는데요. 저는 이 디자인이 graph 생성모델 측면에서 DALL-E와 비슷한 영향력을 가지지 않을까 싶네요.
- Protein 관련해서 generated-model 에 관심있으신 분들은 본 레퍼런스를 참조하셔서 진행하시면 많은 도움이 될거라 생각됩니다.

# LOG conference 

[https://logconference.org/]

- log conference , machine learning on graph 에 특화된 컨퍼런스입니다. 그래프 오마카세 발송되는일 기점(22.12.10)으로 컨퍼런스가 시작됩니다.
- 특히, 튜토리얼들을 주목해보시면 좋을것 같습니다. scalable-gnn , TF-GNN , symbol reasoning gnn 등 굉장히 practical 한 튜토리얼들이 여러분들을 기다리고 있습니다 🙂
- 저는 graph-rewiring 튜토리얼이 굉장히 흥미롭더라구요. graph 특성상 over-smoothing , over-squashing 에 대한 문제가 끊임없이 제기되고 있는데 그 해결 방법 중 하나인 rewiring 에 대해 from scratch 로 구현 및 설명을 해주더군요 ..! 앞으로 real-time deployment 에서 비정상적인 degree 를 가진 노드들이라던지, information이 과다하게 message passing 하는 경우 등 graph event 들이 발생할텐데, 본 튜토리얼을 보고 숙지해놓으신다면 그 때 유용하게 활용하실수 있을거라 생각됩니다.