---
title: 12월 2주차 그래프 오마카세
layout: default
parent: News
nav_order: 3
has_children: true
permalink: /docs/News/News003
---

# 12월 2주차 그래프 오마카세

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

출처: https://tteon.notion.site/9b3c22dfd08a4039b24b281e111d4ef4?v=24efb037bd7440e7a0ca7cf26a973dd6

안녕하세요. 그래프 오마카세 주방장 입니다.

이번주 미리보기 및 키워드는 다음과 같습니다.

keyword ; hypergraph with recommender system, dynamic graph representation learning , graph conference best award paper

- hyper graph 이 어떻게 추천시스템에 접목되는지에 관심있는분들 추천드립니다.
- dynamic graph representation learning 의 핵심인 context 를 어떻게 hypergraph 로 capture 하는지에 대해 관심있는분들 추천드립니다.
- LOG , graph machine learning conference best awards

---

# Motifs-based Recommender System via Hypergraph Convolution and Contrastive Learning 

[https://arxiv.org/pdf/2109.00676.pdf]

- 기존엔 node-node(pair-wise) pattern mining 이 아닌, node-(mutli)node pattern mining 의 장점을 recommender system 에서 활용해보고자 시도한 논문입니다. 구체적으로는 purchase(특정 아이템을 동시에 구매하였으나, 교류가 없는 유저) , joint(특정 아이템을 동시에 구매하였으며, 교류가 있는 유저), social(평소 교류가 있는 유저들 모임) 3가지 종류의 모티프에서 발생하는 정보를 활용해서 추천시스템에 적용해보는 것입니다.
- 별개의 정보였던, 소셜 정보와 구매 정보를 모티프 형태로 추출합니다. 이 때, 하이퍼그래프를 접목함으로써, 잠재적인 정보를 추출할 수 있다는 가정입니다. 앞서 말씀드린바와 같이 multi-node pattern 을 통해 잠재적인 정보를 추출할 수 있다고 합니다. 추가로 채널들(모티프)을 임베딩 해줄 때, 준지도학습(self-supervised learning)을 적용해서 정보량을 더욱 극대화하고자 시도합니다.
- 준지도학습 , 모티프 , 하이퍼그래프, 추천시스템 그리고 gnn 에 대해 관심있으신분들은 본 논문을 통해 컴팩트하게 이해하실 수 있을거라 생각되어 추천드립니다.

# Mining Social-Network Graphs 

[http://infolab.stanford.edu/~ullman/mmds/ch10n.pdf]

- original link, Mining of Massive Datasets : http://www.mmds.org/
- practical graph mining , 복잡계 네트워크 혹은 그래프마이닝의 원론적인 테크닉으로부터 발생한 수치들이 어떻게 해석되는지에 대해 이해하고 싶으신 분들. (특히, 커뮤니티 디텍션 알고리즘 및 spectral clustering , lapalcian matrix 가 어떻게 활용되는지 궁금하신분들)
- 양이 상당합니다. 마지막 부분의 conclusion 요약 버전을 읽어보신후, 관심있는 부분을 골라보시는걸 추천드립니다.(이해가 가지 않는 부분은 주방장에게 문의주세요 :) 같이 고민해보면 좋지 않을까 싶네요. )

# Session-based Recommendation with Hypergraph Attention Networks 

[https://arxiv.org/abs/2112.14266]

- 세션마다의 정보들을 하이퍼그래프 형태로 만들어 준 뒤, 추천시스템에 활용해보는 논문입니다. Session-based task 는 유저가 다음 세션에 어떤 행동 (구매 , 찜 등) 을 할지 이전 세션에서의 유저 행동을 분석해서 추론하는 문제입니다. ** 이 때 세션에서 발생하는 정보를 (contextual information)이라 부릅니다.
- 그렇기에 “이전” 이라는 것을 어떻게 정의할 문제, 세션들의 decay (시간이 경과할 수록 가중치를 적게 주는 방식)를 어떻게 설정할지 , 세션 정보가 전무한 cold-start 유저들을 어떻게 추천해줄지 등과 같은 여러 파라미터 및 외생변수들의 셋업에 만전을 기해야 하는 어려운 문제라고 볼 수 있습니다.
- 본 논문에선 “이전” 을 정의하기 위한 파라미터인 window size 개념과 hypergraph 개념을 혼용합니다. 예로 들면, 이전의 두 세션 내역을 기반으로 추론을 한다 하면 window size 는 2가 되며, 그 내에서 교류가 이루어진 상호작용 들을 하이퍼그래프 형태로 변형해줍니다.
- 이 때, hypergraph는 유저-아이템1 , 유저 아이템2 등의 여러 엣지를 관찰해야하는 기존 그래프 관점과는 다르게, 유저-다수아이템 교류 정보를 동시에 활용함으로써 유저의 의도를 더욱 디테일하게 이해할 수 있다는 장점이 있습니다.
- Session-based 과 hypergraph combinatioin, dynamic graph vs. hypergraph 관점에 대해 호기심이 있으신 분들에게 추천드립니다.

---

# Sequential Recommendation System 카카오 서비스 적용기 

[https://if.kakao.com/2022/session/8]

- 웹툰(만화) , 브런치(글) 플랫폼에서 ‘sequential한 정보를 바탕으로 유저에게 추천을 해준다’라는 관점을 다룬 이야기 입니다.
- 웹툰, 브런치 각각의 도메인에 따라 time window 파라미터에 따라 모델의 성능이 좋아지고, 나빠지는지에 대한 이야기를 합니다. real-time 에서 추천을 해줄때, 유저의 행동 이력을 어떤 (시간)기준으로 나눠주는게 필요한지에 대한 도메인의 중요성을 쉽고 재밌게 잘 풀어놓은 발표라고 생각되네요.
- 쉽고 성능 좋은 모델을 찾다보니 결국 MLP를 활용했다 라는 맥락에서 발표가 마무리됩니다. 유저의 interaction data 인 최근 아이템 1,2,5,20과의 관계를 각각의 emb 를 concat 해주어 FF layer 에 태우는거죠. 한줄로 설명할 수 있듯이, 굉장히 심플하기에 가볍습니다.
- 허나, 심플한 측면으로는 좋으나 유저의 디테일한 정보를 파악하기 위해서는 여러 요소들이 더욱 필요합니다. future work 에서 언급하듯이 interaction 이 적은 유저(cold start 측면) 과 popularity bias 를 극복하려는 (diversity 측면) 두 가지 문제를 해결하기 위해서는 디테일한 prediction model 기획이 추가적으로 필요한거죠.
- 저는 이 점들을 그래프로 접근해보면 어떨까 싶습니다. 구체적으로는, ‘edge’ 에 weight를 설정(weighted graph) 해주어 아이템이 해당 추천시점과 멀어질수록 역가중치를 주는 방식 , 혹은 ‘edge’에 방향성(directed graph) 을 설정해주어 message passing 을 통한 정보 전달을 핸들링해주는 방식[AWS]등 과 같이 그래프 모델링을 어떻게 해주느냐에 따라 효용성이 다르며, 뛰어납니다.
- 허나, 그 모델링의 당위성의 근거들을 도출해야 하는 그래프 분석기획이 수반되어야 하기에, 부가적인 cost가 들수도 있을거라 생각됩니다.
- 아래 GNN 을 접목한 추천시스템 레포가 있어 추가 전달드립니다. 도움되셨으면 합니다.
** GNN with recsys [https://github.com/wusw14/GNN-in-RS]

---

# You Can Have Better Graph Neural Networks by Not Training Weights at All: Finding Untrained GNNs Tickets 

[https://openreview.net/forum?id=dF6aEW3_62O]

** LOG conference best award paper

- untrained subnetwork 를 efficient 하게 추출하는 방법을 제안한 논문입니다. untrained subnetwork ? 라는 의문을 가지실 분들이 계실텐데요. AI 산업에서 좋은 모델이라 함은 곧 정답을 잘 맞추는 모델이라고 볼 수 있습니다. 정답을 잘 맞추기 위해 모델은 정답지와 오답지 여럿을 학습하는 일련의 과정을 거칩니다. 이 때, 학습되는 것은 모델의 weight 입니다. input 이 들어왔을 때 그 input 이 어떤 weight를 갖느냐에 따라 정답인지 아닌지를 구별하게 되는거죠.
- 그렇다면 AI 모델의 핵심은 Weight임을 눈치채셨을 텐데요. 그 weight는 초기에 랜덤 난수의 값으로 주어지게 됩니다. 이 때 랜덤 난수의 값이 초기에 잘 지정되면 앞서 언급드린 학습의 과정이 적겠죠? 그렇다면 최종적으로 학습에 발생되는 연산량 또한 적어질 것이므로, 저희는 좀 더 효율적인 솔루션을 만들 수 있습니다.
- 서론이 길어졌습니다, 본 논문에서는 앞서 언급드린 weight 가 잘 학습된 subnetwork 를 찾는 방식에 대해 언급합니다. ‘잘 학습된 subnetwork의 weight를 기반으로 초기에 잘 지정된 subnetwork 찾는다 ’ 이 문제를 해결하기 위해선 ‘ 잘 학습된 subnetwork ’ 를 찾는게 우선이겠죠? 그러기 위해 학습하고 그 학습된 네트워크와 비슷한것을 찾기 위해 mask 를 주고 , 학습되지 않은 네트워크에 masking 을 해주었을 때 비슷한 weight 값이 나온다면 좋은 subnetwork 라고 생각하고 활용을 하는 형식입니다.
- 굉장히 간단해보이겠지만, 실제 논문을 보면 graph 데이터 측면에서의 한계점인 sparsity 을 극복하면서 어떻게 성능을 유지하는지에 대한 방법 또한 언급합니다. sparsity 는 곧 over-smoothing (노드-주변이웃 들간의 교류를 통해 노드의 정보가 업데이트 될 수록 본연의 노드 정보를 잃어버리는 문제) 와도 이어지는데요. 그 점도 염두하여 실험도 진행했습니다.
- 굉장히 흥미로운 논문인지라 관심사 불문하고 한 번 읽어보시는 것을 추천드립니다.
- 현업에서 GNN 을 적용하기 위해 최적의 network 만을 추출하는 것에 관심있으신분들 , over-smoothing 문제 때문에 골머리를 앓고 계시는 분들 에게 추천 드립니다.

motive paper ; [EdgePopup, https://arxiv.org/pdf/1911.13299.pdf]

---

# Neighborhood-aware Scalable Temporal Network Representation Learning 

[https://openreview.net/pdf?id=EPUtNe7a9ta]

** LOG conference best award paper

- link prediction 에서 고질적인 문제죠. temporary, time-wise 등 시간에 따라 변형되는 그래프의 structural information 을 어떻게 다룰것인지에 대해 다룬 논문입니다.
- 대게 manner of static graph 에서는 고유 structural 정보를 반영하기 위해 각 그래프 노드 엣지에 거리정보(위치정보) 를 추가적으로 반영해주곤 합니다. dynamic graph 에서 앞서 structural 정보를 반영해주기 위해 random-walk 방식를 적용해주는데요. 이 때, parallel 하게 적용할 수 없다는 한계(OOM)가 있어 sequential 하게 학습을 하기 때문에 학습 속도가 느리다. 라는 점을 단점으로 언급합니다.
- 허나, 본 논문에서는 dictionary 자료구조를 활용한 N-cache 방식이 앞서 언급한 parallelized training 을 available 하게 해줍니다. 그러기 때문에, 속도가 비교적 빠르다. 또한 성능도 우수하다 라는 점을 실험으로 입증해냅니다.
- dynamic graph representation learning 그리고 link prediction task 에 대해 관심있으신분들에게 추천드립니다.