---
title: 12월 3주차 그래프 오마카세
layout: default
parent: News
nav_order: 4
has_children: true
permalink: /docs/News/News004
---

# 12월 3주차 그래프 오마카세

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

출처: https://tteon.notion.site/9b3c22dfd08a4039b24b281e111d4ef4?v=24efb037bd7440e7a0ca7cf26a973dd6

안녕하세요. 그래프 오마카세 주방장 입니다.

이번주 미리보기 및 키워드는 다음과 같습니다.

keyword: dynamic graph embedding, scalability graph with data engineering, spatial gating unit, homophily, graph embedding tutorial

- dynamic graph representation learning를 현업에서 어떻게 적용하면 될지에 대해 고민하고 계신분들.
- scalablity graph 를 어떻게 다뤄야할지 고민하고 계신분들.
- transformer 의 postional encoding 방식과 다른 spatial 를 반영한 encoding 방식에 대해 궁금하신 분들.
- 네트워크 데이터 특성이 그래프 임베딩에 어떤 영향을 끼치며, 부정적인 영향을 끼친다고 할 시 어떻게 해결하면 좋을지에 대해 고민 그리고 궁금하신 분들.

---

# 오늘의 네트워크 지식 (Connected components)

들어가기에 앞서, "subgraph 와 connected component 의 차이"에 대해 알고 계시나요?

- (본문)One standard way to categorize graphs is as connected or disconnected. A disconnected graph can be decomposed into a series of graphs that are not connected to each other. I would refer to one of those as a component. A subgraph on the other hand is a subset of vertices of the original graph along with a subset of edges. reference
- reachability 가 핵심이라고 볼 수 있겠습니다. 좀 더 나아가서, connected graph 는 그래프 내 노드들이 서로 엣지를 통해 도착할 수 있는지 없는지의 여부로 connected, disconnected graph 라고 볼 수 있겠구요. 허나 subgraph 는 특정 노드 부분집합 그리고 특정 엣지 부분집합 등으로 __속해있는지에 대한 조건__으로 추출된 그래프라고 보시면 될 것 같습니다.
- 간단히 말씀드리면 , '노드간의 연결으로 이어졌는지 여부에 따른 그래프 데이터 형태' , '부분집합에 속해있는지 여부에 따른 그래프 데이터 형태' 로 보시면 될 것 같습니다.
- 주방장 tmi) connected component 에서 또 week , strong 으로 나눠집니다. 이 때, 나눔의 기준은 "방향성의 유무" 인데요. 방향성이 있을 때 연결이 되는 형태는 strong connected component 반대로, 방향성이 없을 때 연결이 되는 형태는 weekly connected component 입니다.

---

# TGL: A General Framework for Temporal GNN Training on Billion-Scale Graphs 

[https://arxiv.org/pdf/2203.14883.pdf]

- 현업에 계신분들께서 좋아하실만한 논문입니다. billion-scale 을 가진 그래프들을 어떻게 학습하고 추론할지에 대해 많이 고민하실텐데요. 그 가이드라인 , 레퍼런스로써 좋은 참고서가 될 논문입니다.
- temporal graph inference 는 시간의 흐름에 따라 바뀌는 정보들을 edge 에 timestamp 형식으로 담아두며 message passing 을 통해 업데이트해주는게 핵심이라고 볼 수 있습니다. 이 때, node-edge 간의 정보교환을 통해 새로이 업데이트된 new information 을 historical 하게 잘 보관하는것 또한 중요한데요. 그 솔루션을 본 논문에서 random chunk scheduling 이라 표현하며 제안했습니다.
- node memory , attention aggregator , temporal sampler 그리고 multi-gpu (parallel-sampling) 을 어떻게 하는지등 현업에서 마주하실 많은 고민들을 본 논문에서 명쾌하게 풀어내고 있습니다. 논문을 읽다보시면, binary search , pointer 등의 데이터 자료구조 측면에서 접근하는 섹션이 간간이 있기에 디테일한 이해를 원하신다면 잠시 데이터 자료구조를 복습하고 오시는걸 추천드립니다.
- 또한 , DGL 프레임워크를 사용합니다. 그 중 MFG(Message Flow Graph) 라는 개념이 포함되어 있습니다. 다소 생소하실분들 계실텐데요. 심플하게 message passing 으로 부터 받은 정보들을 어떻게 sampling 할지에 대한 개념이라고 보시면 될 것 같습니다. (디테일한 내용이 궁금하신분들은 DGL 을 보시는걸 추천드립니다. 혹은 추가적인 설명이 필요하시면 주방장에게 메일 혹은 링크드인 메세지 주세요! 환영합니다 🙂)

** 이어서) Tutorial: Scaling GNNs in Production: A Tale of Challenges and Opportunities 

[https://www.youtube.com/watch?v=HRC4hZKiUWU&t=1609s]

LoG 컨퍼런스에서 발표된 영상입니다. production 에서 gnn 을 활용할 때 한계점을 영상에 담아놓았는데요. 시간되실때 꼭 보시는걸 추천드립니다. 양질의 콘텐츠 , 팁들이 한가득 담겨있습니다.

GDB 를 활용하는 부분도 등장하는데요, 관련해서 궁금하시거나 실습 튜토리얼 등 세미나가 궁금하신분들이 계시다면 메세지 남겨주세요. 수요가 어느정도 있다고 판단되면 주방장이 잘 준비해서 구현 및 공유 세션 준비해볼게요.

** 참고로, 논문 초반부에 pyg 한계점을 언급하며 시작합니다. DGL (aws) vs. PyG(intel, nvidia, stanford) vs. tensorflowGNN & jraph (google) 의 구도 때문이지 않을까 싶은데요. 흡사 삼국지를 보는것 같긴합니다. 각 프레임워크들의 철학 그리고 발전방향이 각각 다르기 때문에, 이를 비교하시면서 활용해보시는 것도 GNN의 또다른 재미라 생각되네요.

---

# APAN: Asynchronous Propagation Attention Network for Real-time Temporal Graph Embedding 

[https://arxiv.org/abs/2011.11545]

- MLops 관련 lecture 인 cs329S 공부 중 발견한 논문입니다. 저도 내년 사이드 프로젝트로 gnn with web deployment 해보는게 목표라 되게 반가웠고, 독자분들 절반가까이 현업에 계신분들이시기에 도움되실거라 생각되어 준비해보았습니다. 사실 gnn 의 inference 때, high latency 가 가장 큰 문제점으로 꼽히곤 하거든요. 잡설이 길었습니다. ‘since users cannot tolerate the high latency of neighbor query in a giant graph database, deploying a synchronous CTDG model in online payment platform is almost worthless’ 라는 어절을 논문에 명시해놓은만큼 산업 관점에서 잘 풀어낸 논문입니다.
- message passing 에 치중하여 어떻게 node 가 update 시키는지가 핵심인 논문입니다. gnn 을 처음 접할 때 주로 노드의 정보를 담는 공간을 mailbox(우체통)으로 비유하는데요. 그 mailbox 의 mechanism 을 변형한 아이디어입니다.
- 구체적으로는 , 기존 temporal embedding 시 이전 event , message 들을 querying(가져올 때) timestamp sorting 그리고 reading out 등의 과정이 발생하는데요. 이 때 cost 가 상당합니다. 이를 가장 최근의 이웃들의 history message 만을 가져오기 , aggregation 시 mean으로 정보 가공하기 , update 시 summarized , message decay 하기(FIFO queue 개념) 등으로 풀어놓았습니다.
- online deployment 를 위해 최적의 mailbox 청사진이지 않을까 싶습니다. 실험 섹션 결과 그리고 해석이 굉장히 흥미롭습니다. 그래프 정보를 모두 잘 반영하기 위해 설계된 타 모델들 대비 성능이 떨어지지 않으며, speed 또한 빠른걸 보니 되게 신기합니다.

---

# Residual Network and Embedding Usage: New Tricks of Node Classification with Graph Convolutional Networks 

[https://arxiv.org/abs/2105.08330]

- node-classification 에서의 Efficiency trick들을 모아놓은 논문입니다. baseline 을 구현 후 성능이 마음에 들지 않는다? 하실 때 참고하시면 좋을 논문입니다. 실제로 주방장도 주로 성능이 마음에 들지 않을 때 간단하게 correct & smooth 를 시작으로 성능향상을 시도하곤하는데 대부분 만족했습니다. 🙂
- Mini batch training , normalization and drop out , Adversarial training , Label propagation 등 이해하기 쉬우며 , 코드 구현도 간단한 methodology 들입니다. 이 방법론들을 조합하며 어떤 결과가 나오는지에 대해 유심히 지켜보며 실험결과와 독자분들이 기대했던 결과와 어떻게 다른지 비교해보신것 또한 본 논문의 묘미라 생각되네요.

---

# Pay Attention to MLPs 

[https://arxiv.org/abs/2105.08050]

- transformer 구조가 딥러닝 model에서 hegemony 를 가지고 있다.라고 표현해도 과언이 아닐만큼, 많은 산업에서 활용되고 있습니다.
- transformer 의 핵심 정보인 positional encoding 을 spatial gating unit 이라는 개념으로 대체한다는 아이디어가 주인 논문입니다. transformer 요소 중 하나인 self-attention 개념과 ‘연산량’,’projection’ 등 여러 부분에서 대조하며 아이디어를 흥미롭게 풀어나갑니다.
- spatial gating unit 은 gated linear unit 에서 파생된 개념입니다. 간단히 말씀드리면, gate 를 통해 도출된 정보가 유용한 정보인지 아닌지를 판단하는 개념이라고 보시면 되겠습니다. 여기에 spatial 정보를 반영하기 위해 tensor contraction (double inner dot operation) 을 활용해주는 개념이라고 보시면 되겠습니다.

---

# Large Scale Learning on Non-Homophilous Graphs: New Benchmarks and Strong Simple Methods 

[https://arxiv.org/pdf/2110.14446.pdf]

- 복잡계 네트워크에서 네트워크 데이터 분석할 때, 주로 활용되는 지표 중 하나인 homophily 를 large scale gnn 에 차용한 논문입니다. homophily 를 간단하게 말씀드리면, ‘유유상종’ 이라고 보시면 되겠습니다. 이를 네트워크 데이터에서 생각해보면 ‘비슷한 사람(노드)들 끼리는 연결(link)되어 있을것이다.’ 라고 가정하며 측정하는 지표입니다.
- 그럼 이 개념이 어떻게 임베딩이 활용되는지 궁금하실텐데요. 그래프 임베딩시 주로 연결된 노드들로부터 받은 정보를 활용하여 추론하곤 합니다. 추론할 시 해당 노드 혹은 링크의 고유 label을 잘 맞추는 weight를 학습할텐데요. 이 때, 연결된 노드들 즉 이웃들로부터 받는 정보들이 유사할수록 고유 label 을 더욱 잘 맞춘다는 가정을 기반으로 임베딩이 진행되곤 합니다(homophily) .
- 허나 반대로, 연결된 노드들이 ego node (해당 노드)와 비슷하지 않다면? 다시 말해, non-homophily 하다면 어떨까요? 다들 예상할 수 있듯이, degrade performance 현상을 겪게됩니다. 이는 곧, 노드 주변 이웃들이 어떤 이웃인가에 따라 성능이 좌지우지된다고도 볼 수 있습니다. 그렇다면 최종적으로 학습된 모델이 특정 상황에서만 잘 맞추고 특정 상황이 아닌 경우에는 성능이 많이 떨어진다면, 이 모델은 결국 가치가 매우 떨어지는 모델이라고 볼 수 있죠. (experiment setup 측면에서 이를 체크하기 위해 , transductive , inductive learning 으로 나누어 진행하곤 합니다.)
- 앞선 현상을 극복하기 위해, 본 논문에서는 LINKX 라는 모델을 제안합니다. 모델 구조는 굉장히 심플한데요. (micro) 노드 정보인 node feature 는 multi layer perception , (macro) 그래프 구조 정보인 graph topology 정보는 logistic regression 으로 학습해줍니다. 이 후, 두 결과물들을 concat 해주고 다시 한 번 multi layer perception 에 태워줍니다.
- 위의 과정인 2 sub-layer(MLP , logistic regression) 으로 나누어 준 이유에 대해 의아하신 분들이 계실텐데요. 논문의 핵심입니다. 쉽게 말해보면 , 동일한 데이터셋이긴 하나 MLP, logistic regression 으로 부터 도출된 값들이 각각 다른 context 를 지녔을거라는 이야기죠. 멀티모달 러닝의 핵심과도 비슷한 맥락입니다.
- 정리해서 말씀드려보자면, homophily 에 의존적인 데이터들은 주변 이웃의 정보로부터 많은 영향을 받는다는 문제를 해결하기위해, 노드의 정보와 그래프 구조적 정보를 각각 독립 적용한다는게 본 아이디어의 핵심이라고 보시면 될 것 같습니다.
- 참고로, 제안한 모델이 non-homophily 에서 효과적임을 증명하기 위해 데이터셋이 homophily 인지 아닌지를 판단해야 할 텐데요. 그 과정에서 기존 homophily measurement 의 방식인 null-model의 randomly wired을 활용한 방식이 아닌 degree 를 활용합니다. ‘The sensitivity of edge homophily to the number of classes and size of each class limits its utility.’ 를 극복하기 위해서 변형했다고 하네요.

---

# Link Prediction on Heterogeneous Graphs with PyG 

[https://medium.com/@pytorch_geometric/link-prediction-on-heterogeneous-graphs-with-pyg-6d5c29677c70]

- PyG 에서 본격적으로 튜토리얼 배포 , 블로그 게시 등 활동을 진행중인데요. 그 중 가장 깔끔하며 현업분들이 많이 적용할만한 코드 및 설명이 담겨있는 medium blog 를 가져왔습니다. 도움 되시길 바랍니다.