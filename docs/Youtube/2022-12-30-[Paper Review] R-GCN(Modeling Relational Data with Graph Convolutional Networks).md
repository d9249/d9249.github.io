---


TITLE : [Paper Review] R-GCN(Modeling Relational Data with Graph Convolutional Networks)
YOUTUBE LINK : https://youtu.be/7XlKoSBsbNk
PRESENTER : 고려대학교 산업경영공학부 DSBA 연구실
DURATION : 00:23:47
PUBLISHED : 2022-12-30


---
# Notion AI Summary


# Notion AI conclusion


# FULL SCRIPT
 

안녕하세요.

DSBA 연구실 김도윤입니다.

오늘은 Knowledge Graph의 인베딩 방법론 중 하나인 RGCN 방법론을 소개한 논문에 대해 설명드리고자 합니다.

Knowledge Graph와 Relational Modeling 등에 대한 전반적인 내용을 시작으로 연관된 사전 연구들, 그리고 본 방법론의 핵심 내용과 실험 결과 등의 순서로 말씀드리도록 하겠습니다.

내용 설명에 앞서서 본 논문이 2018년에 등장한 점을 고려하여 이해를 해주시면 감사드리겠습니다.

가장 먼저 Knowledge Graph에 대한 내용을 살펴보겠습니다.

Knowledge Graph를 쉽게 요약하면 Knowledge Base 내의 정보들을 그래프화한 것입니다.

Knowledge Base는 우리가 흔히 잘 알고 있는 DBPedia, Wikipedia 등의 지식과 정보를 포함하고 있는 저장소를 의미하고 일종의 데이터베이스가 될 것입니다.

아시다시피 이러한 저장소에 있는 정보들이 사실 완벽하지 않고 또 시간의 흐름에 따라 바뀌는 경우도 존재하기 때문에 우리는 이 부족한 정보들을 유추해낼 수 있어야 할 것입니다.

이에 연구되어 온 분야가 바로 Statistical Relational Learning입니다.

기본적으로 세 가지의 요소, Subject, Relation, Object, 이렇게 세 가지 요소로 이루어지는 Triplets 혹은 Triples라는 것으로 우리가 알고 있는 지식을 표현하고 이를 그래프로 나타낸 것이 바로 Knowledge Graph가 되는 것입니다.

Subject와 Object가 되는 것을 각각 Entity라고 하는데, 우측 하단의 예시를 보시면 쉽게 이해하실 겁니다.

가령 Person 이라는 타입의 김도윤 이라는 Entity와 University라는 타입의 고려대학교 Entity는 교육의 객체와 장소를 나타내는 Educated at 이라는 Relation으로 연결되어 있습니다.

앞선 Statistical Relational Learning이라고 하면 크게 두 가지의 과업을 수행하는 것으로도 볼 수 있습니다.

첫 번째는 Link Prediction입니다.

이는 두 노드간 연결되어 있을 법한 엣지를 예측하는 과업으로 Triplet 데이터를 입력하여 해량 데이터의 조합의 존재에 대한 신뢰도를 구하는 것으로 이해하시면 되겠습니다.

Relation Prediction 혹은 부족한 그래프를 채운다 혹은 예측한다는 의미로 Graph Completion 등으로 불리곤 합니다.

두 번째는 Entry Classification입니다.

Node Classification의 일종으로 Entity의 타입이나 카테고리 등을 예측하는 과업입니다.

다들 잘 아시다시피 그래프 인베딩 혹은 노드 인베딩 등에 관한 연구가 하나의 큰 축으로 계속해서 발전되어 오고 있습니다.

그 중에 한 부분을 차지하는 것이 바로 Knowledge Graph Inverting입니다.

Relational Modeling이라고도 부르는데요.

이와 관련된 연구들을 잠시 살펴보도록 하겠습니다.

Triple Data는 앞서 보셨다시피 두 개의 객체와 둘을 연결하는 관계, Relation으로 표현되기 때문에 순서상을 표현하는 방법을 일컬어 Relational Modeling이라고 하고 이를 통해 Knowledge Graph를 표현하는 것을 Knowledge Graph Inverting이라고 하는 것입니다.

Triple Data에서 핵심이 되는 것은 바로 이 Relation이 될텐데요.

다른 Entity들은 그래프 상에서 모델링을 하는 것을 모델링이라고 하는 것입니다.

모델링 상에서 Node가 되며 Node Inverting으로 쉽게 다를 수 있지만 Relation은 Node 사이의 관계를 나타내 주는 것이기 때문에 Representation에 있어서 중요한 부분이 될 것입니다.

Knowledge Graph는 크게 세 가지로 구성되어 있는데 첫 번째 Entity 즉 Node의 집합, 두 번째 Relation의 Type의 집합, 그리고 마지막으로 두 Entity와 Relation으로 나타내는 Edge들의 집합이 됩니다.

Knowledge Graph Inverting 연구는 세 가지의 종류로 나눌 수 있습니다.

그 중에서 본 방법론에서 직접적으로 활용하고 있는 Tensor Factorization에 대해 살펴보고자 합니다.

Risk-Hard 이라는 방법론을 시작으로 본 방법론에서 다루고 있는 DistMult 이 두 가지를 대표적으로 살펴보겠습니다.

Tensor Factorization 류의 방법론은 Triple Data를 바로 Tensor로 표현하는 것에서부터 시작이 됩니다.

보시는 바와 같이 Entity i와 Entity j가 Relation k로 연결되어 있다면 1 아니면 0으로 표현되는 원소로 구성된 Tensor가 바로 Triple Data의 기본 표현이 되는 것이고 이후 해당 Tensor를 이용해서 여러 가지 과정들을 거치게 되는 것입니다.

Risk-Hard은 Tensor Factorization 계열의 첫 방법론으로 볼 수 있습니다.

Entity는 D차원의 벡터로 표시하고 Relation R은 D by D 차원의 매트릭스로 표현하여 해당 Triple Data의 순서성의 존재의 Confidence를 다음과 같이 Entity의 벡터와 Relation 매트릭스의 고부로 구하게 됩니다.

따라서 모든 형성 가능한 관계에 대해서 표현을 가능한 점이 특징인데 그렇다 보니 정말 큰 Knowledge Graph를 나타내기에는 계산량이 너무 많다는 단점이 있습니다.

앞서 살펴본 Risk-Hard의 계산량 문제를 제작하고 해결하고자 한 방법론이 바로 DistMult입니다.

Relation 매트릭스를 D by D 차원이지만 Diagonal Matrix로 제안하면서 실질적으로 학습을 해야 하는 파라미터의 수를 줄일 수 있게 하였습니다.

마찬가지로 Confidence Score를 구하는 과정은 Risk-Hard과 유사하지만 Relation 매트릭스가 대각 원소만을 갖고 있기 때문에 Triple Data에서 Head와 Tail을 구하는 과정에서 즉 Subject와 Object의 구분이 되지 않는다는 단점이 있습니다.

따라서 몇몇의 Data의 경우 기존 Relation의 역의 관계를 포함하기도 하지만 Symmetric하지 않은 관계에 대해서는 DistMult가 잘 파악하지 못한다는 점도 중요한 특징입니다.

지금까지 Knowledge Graph가 무엇인지 또 어떻게 표현되는지 또한 설명해 드렸습니다.

모델에 학습시키기 위한 Representation을 어떻게 구성하는지 등에 대해서 살펴보았습니다.

다음은 본 논문의 방법론인 RGCN에 대해서 살펴보도록 하겠습니다.

앞서 살펴보신 것처럼 주어진 Knowledge Graph의 기존 정보를 이용해서 Graph의 새로운 부분을 유추하거나 혹은 예측할 수 있어야 하는 것이 Knowledge Graph의 핵심이 될 것이라고 생각됩니다.

이에 본 논문에서 제시하는 RGCN은 바로 Knowledge Graph Embedding 방법론 중 하나로서 Knowledge Graph를 인코딩해주는 인코더의 역할을 하게 됩니다.

이를 통해 앞서 언급한 Entity Classification과 Link Prediction을 수행할 수 있게 됩니다.

Entity Classification의 경우는 인코딩된 벡터를 이용해서 기존의 Node Classification을 진행하듯이 활용이 되는 것이고 Link Prediction의 경우는 재미있는 아이디어가 활용되는데요.

전체적으로 Autoencoder의 구조를 통해서 RGCN을 연구의 역할로 그리고 DistMult를 decoder의 역할로 이용하여 트리플 데이터의 Edge Label을 예측하도록 하고 있습니다.

RGCN은 기본적으로 GCN, Graph Convolutional Network를 기반으로 하고 있습니다.

GCN에 대해서 잠시 살펴보자면 우선 모든 Node가 Self-Loop가 있다고 가정했을 때 일반적으로 Graph는 Node의 집합, Edge의 집합으로 표현이 될 것이고 보시는 바와 같이 Feature Matrix, Automatic Matrix, Degree Matrix 등을 구할 수 있을 것입니다.

이때 GCN 레이어가 이웃한 네이버들, 원혹에 있는 위치한 네이버들의 정보들만을 수입하게 됐을 때 다음과 같은 식에 의해서 정보들이 메시지 패싱이 이루어지는 것을 확인할 수 있습니다.

그래서 맨 아래 보시는 것 같이 GCN 레이어가 여러 개 있을 때는 이런 과정을 반복하게 되는 것입니다.

RGCN은 크게 두 가지 파트로 나눠 볼 수 있습니다.

첫 번째는 이 파란색 선으로 나타낸 부분인데요.

특정 Relation Type으로 연결된 다른 엔티티로부터 정보를 취합하고 이를 모든 Relation Type에 대해서 확장시켜 정보를 모으게 됩니다.

이때 Normalization이 적용이 되는데요.

일반적으로 특정 Relation Type의 집합의 크기, 즉 집합의 크기의 역수가 적용되는 것을 확인할 수 있습니다.

두 번째는 빨간색 선으로 표시된 부분인데요.

GCN처럼 모든 엔티티, 모든 노드에 Self-Loop가 있다고 가정하여 자신의 정보도 함께 취합할 수 있도록 합니다.

그래서 결과적으로 Relation의 Type과 방향, 성을 고려해서 정보를 취합하고 있음을 확인할 수 있고 또 Self-Loop를 통해서 현재 레이어의 정보를 다음 레이어에 좀 더 확실하게 전달할 수 있다는 점이 특징이라고 볼 수 있습니다.

앞서 살펴본 수식에서 각 레이어에서 정보를 취합하는 가중치 매트릭스 역할의 WR을 보셨을 텐데요.

이 WR의 Regularization의 특징은 WR의 Regularization을 적용해서 오버피팅이 될 가능성을 완화시켜주고 있습니다.

그래서 이에 두 가지 방식이 적용되는데 바로 Basis Decomposition과 Block Diagonal Decomposition입니다.

이 두 가지는 동시에 적용되는 것은 아니고 데이터셋의 특징에 따라 선택되는 것이라 생각해 주시면 됩니다.

다음은 Block Diagonal Decomposition입니다.

그림에서 보시는 바와 같이 WR를 모든 원소가 필요한 것이 아니라 다이아고나라는 위치의 저차원의 매트릭스들로 구성함으로써 학습해야 할 파라미터 수를 줄일 수 있게 되고 결과적으로 오버피팅을 완화할 수 있는 효과를 주게 됩니다.

이러한 RGCN을 이용해서 다음에 두 세 테스트 Entity Classification과 Link Prediction이 어떻게 진행되는지 그 과정을 한번 살펴보겠습니다.

Entity Classification은 여느 Node Classification과 비슷한 과정을 거치게 되는데요.

여러 RGCN 레이어를 거친 다음에 최종적으로 획득한 Hidden Representation 레이어를 가지고 Softmax 레이어에 입력을 하게 됩니다.

그 Softmax에 입력된 결과물에 따라서 다음과 같이 Cross Entropy Loss를 통해서 학습이 진행됩니다.

Link Prediction은 앞서 설명드렸던 바와 같이 Autoencoder 구조를 이용해서 진행됩니다.

먼저 Encoder인 RGCN을 통해서 각 Entity의 Representation을 획득하고 그 다음에 Decoder인 DistMult를 이용해서 Edge의 Score를 구하게 됩니다.

이때 특별히 Negative Sampling을 함께 적용하여 학습이 이루어지는데요.

실제 존재하는 Triple Data에서 무작위로 Subject나 Object를 바꿔서 여러 개의 Negative Sample를 만듭니다.

그 후에 다음 보시는 바와 같이 Negative Loss Likelihood를 이용해서 학습이 진행됩니다.

그럼 실험 결과를 한번 살펴보도록 하겠습니다.

실험 결과를 살펴보기에 앞서서 Link Prediction에서 자주 활용되는 Metric 두 가지에 대해서 간단히 알려드리고자 합니다.

먼저 MRR이라 불리는 Min Reciprocal Rank입니다.

Link Prediction이나 추천 시스템에서 많이 활용되는 지표 중 하나인데요.

바로 예시를 이용해서 설명드리겠습니다.

다음에 세 가지 Sample에 대한 예측 결과들과 각 Sample의 실제 정답, 그리고 실제 정답이 예측 스코어상에서 몇 번째 순위에 있는지를 나타낼 표입니다.

첫 번째 Sample을 보시면 Action, Drama, Comedy 이 순서대로 예측 결과가 나왔고 이에 대한 실제 정답은 Comedy라고 했을 때 Comedy는 예측 결과 중에서 세 번째, 3순위에 위치합니다.

이럴 시에 해당 Sample의 Reciprocal Rank는 3분의 1이 됩니다.

같은 방법으로 나머지 Sample들에 대해서도 Reciprocal Rank를 구하면 각각 1분의 1과 1이 되는 것을 확인할 수 있습니다.

따라서 이렇게 구한 Reciprocal의 평균값이 바로 최종 스코어가 되고, 따라서 이름이 Mean Reciprocal Rank가 되는 것입니다.

다음은 Hit Z K입니다.

어쩌면 Top N Accuracy라는 지표와도 유사한데요.

K계의 상위 예측 결과 중에서 실제 정답이 있으면 1 아니면 0으로 계산하는 방식입니다.

마찬가지로 예시를 이용해서 설명드리면 우선 K는 3으로 설정합니다.

첫 번째 Sample의 경우 상위 3개의 예측 결과가 다음과 같이 Action, Drama, Comedy일 때 실제 정답이 Comedy라고 하면 이는 1의 값을 얻게 됩니다.

두 번째 Sample을 보시면 상위 3개의 예측 결과가 스파이더맨, 어벤져스, 토르가 있을 때 실제 정답은 X-Man이라면 이는 0의 값을 얻게 됩니다.

따라서 이런 식으로 각 Sample에 대한 스코어의 평균을 구하는 방법이 Hit Z K입니다.

Hit Z 1은 결국 Top N Accuracy와 동일하게 됨을 알 수 있습니다.

두 가지 Task, Entity Classification과 Link Prediction 중에서 Entity Classification에 대한 결과를 먼저 살펴보겠습니다.

Entity Classification에서 활용된 데이터셋은 다음과 같이 네 가지 데이터셋이 활용되었고 여기서 말하는 RDF, Resource Description Framework Format이라고 하는 것은 앞서 계속해서 언급했던 Triple, Triple-Let 데이터 형태라고 생각해주시면 되겠습니다.

그래서 궁극적으로 이 데이터셋을 통해서 예측하고자 하는 대상은 이 Node로 표현되는 Entity Group의 특성이라고 보시면 되겠고 필요에 따라서 특정 Relation을 제외한 상태에서 데이터셋을 이용했다고 합니다.

아래 보신 바와 같이 데이터셋의 통계량이 나와 있습니다.

실험 설정의 경우는 다음과 같습니다.

먼저 전체 학습 데이터셋의 20%를 검증용 데이터셋으로 설정하였고 그 다음에 두 개의 레이어로 구성된 RGCM 모델을 활용하였으며 특히 이때 Hidden Representation의 Embedding Size는 16개의 유닛으로 설정하였다고 합니다.

그래서 Running Rate를 0.01로 갖는 Adam이 Optimizer로 활용되었고 재미있는 것은 에폭수가 이렇게 많습니다.

생각보다 많아서 50회인데요.

생각보다 많아서 좀 놀랐고 그리고 앞서 살펴본 것과 같이 Normalization 상수를 그냥 언급했던 것과 같이 Relation Type에 속한 Entity의 개수로 설정하였다고 합니다.

실험 결과를 살펴보시면 AIFB와 AM 데이터셋에 대해서는 당시에 State-of-the-art 성능을 기록하였는데 나머지 두 데이터셋, 무책과 BGS의 경우는 타 방법론에 비해서 성능이 좋지 않은 것을 확인할 수 있습니다.

무책 데이터셋은 분자 구조 그래프를 가지고 있는 데이터셋이고 BGS는 바이의 종류를 나타내는 그래프로 Hierarchical한 특성을 지냈다고 합니다.

이 두 데이터셋의 공통적인 특징으로 그래프 상에서 특정 노드들의 Degree가 굉장히 높다는 점이라고 합니다.

그래서 앞서 설명드린 Normalization Term으로 활용한 특정 Relation으로 연결된 이은 노드의 개수를 일괄적으로 적용한 점이 오히려 역효과를 냈을 것이라는 저자들의 판단이 있었습니다.

달리 얘기하면 이 데이터셋 별로 Normalization Term을 조금 다르게 설정한다면 오히려 좋은 성능을 내지 않을까 하는 생각이 있습니다.

다음은 Link Prediction입니다.

Link Prediction에 활용한 데이터셋은 크게 세 가지인데요.

첫 번째, FE15K입니다.

Relational Database인 Freebase의 일부라고 하고 WNH는 단어 간의 레시컬 관계를 나타내는 WorldNet의 일부입니다.

그리고 세 번째는 앞서 방금 말씀드린 FE15K의 특정한 조치를 취한 데이터셋인데요.

바로 이 FE15K에서 역의 관계를 나타내는 트리플 데이터를 제거한 데이터셋입니다.

Link Prediction의 실험 설정을 살펴보겠습니다.

우선 앞서 설명드린 MRR과 HET-SAT-K를 지표로 활용하였고 특히 K는 1, 3, 11대의 HET-SAT-K의 결과를 확인할 수 있었습니다.

그리고 Normalization Term의 경우에 마찬가지로 특정 Relation Type 내에서 이은 노드의 개수를 활용한 것을 확인할 수 있고 말씀드린 바와 같이 Regularization을 데이터셋마다 다르게 적용하였습니다.

먼저 FE15K와 WN18에는 Basis Decomposition을 적용하였고 이때 Basis의 개수는 두 개로 설정하였다고 합니다.

한 개의 레이어의 RGCN과 이때 Hidden Representation Vector의 사이즈를 200으로 설정하였다고 하고 그리고 FE15K의 237의 경우는 Block Decomposition을 적용하였다고 합니다.

500차원의 Hidden Representation을 갖는 두 개의 RGCN 레이어를 활용하였고 이때 Block Dimension을 OXO의 사이즈로 설정하였다고 합니다.

그래서 특별히 RGCN에 추가적으로 Dropout을 적용하였는데 이 점은 조금 새로운, 흥미로운 부분인 것 같습니다.

그리고 마지막 Decoder에서 L2 Regularization도 함께 고려하여 최종 스코어를 구했습니다.

그리고 앞서 살펴본 것과 같이 Negative Sampling도 함께 적용하였는데 이때 Negative Sampling의 개수는 한 개로 설정하였다고 합니다.

결과를 살펴보겠습니다.

결과를 보시면 RGCN 플러스는 RGCN과 DistMult 개별 모델을 앙상블한 결과라고 보시면 되겠습니다.

보시는 수식과 같이 말 그대로 스코어의 가중합을 구한 것이고 이때의 가중치를 0.4로 설정하였다고 합니다.

해당 표는 타 방방론의 결과를 해당 논문에서 명시된 값을 그대로 가져왔기 때문에 직접적으로 비교는 어렵다고 합니다.

하지만 RGCN과 RGCN 플러스 모두 DistMult보다 좋은 성능을 보이고 있음을 확인할 수 있었고 Complex는 DistMult의 시메트릭한 특징을 보완하기 위한 방법론인데요.

이때 Decoder로 Complex를 활용한다면 더 좋은 성능을 보일 것이라고 저자들은 언급하고 있습니다.

사실 링크 프레딕션의 메인 실험이라고 할 수 있는 것이 바로 FV15K237을 활용한 실험인데요.

다른 방법론들을 직접 재현해서 결과를 생성하였다고 합니다.

다만 맨 위에 있는 링크 피트의 경우는 코드 획득을 못해서 직접적인 비교는 어렵다고 하고 있습니다.

그럼에도 불구하고 RGCN이 다른 타 방법론들보다 월등히 좋은 성능을 보여주고 있음을 확인할 수 있고 특히 RGCN이 단일 DistMult보다 더 좋은 성능을 보이고 있음은 확실히 확인되었다고 볼 수 있습니다.

네 그러면 지금까지의 내용을 한번 정리해 보도록 하겠습니다.

이번 시간 저희는 Relational Modeling, Knowledge Graph Embedding의 한 방법론인 Relational Graph Convolutional Network, RGCN에 대해서 살펴보았습니다.

이 RGCN은 GCN 모델로 Relational Modeling의 시도와 첫 연구라는 점에서 기어점을 확인할 수 있었습니다.

특히 Basis Decomposition, Block Diagonal Decomposition을 활용하여 Parameter Sharing, Sparsity Constraints를 해결한 점에서 기어점을 확인할 수 있었고 특히 Entity Classification과 Link Prediction에서 좋은 성능을 보이는 것을 확인하였습니다.

Link Prediction 수행함에 있어서 Autoencoder 구조를 활용해서 RGCN을 그때의 encoder로 활용한 점은 매우 좋은 아이디어였다고 생각합니다.

그리고 또 Decoder를 다른 Relational Modeling 방법론을 활용한다면 더욱 성능 개선이 있을 것으로 예상이 됩니다.

개인적인 의견을 추가적으로 덧붙이자면, 먼저 Ablation Study를 좀 더 다양하게 시도하였으면 어렸을까 하는 아쉬움이 있습니다.

가령 GCN의 Layer의 개수에 따른 차이를 확인할 수 있었을 것 같고, 또 가령 Dimension, Size에 따른 차이도 확인할 수 있지 않을까 하는 생각이 있습니다.

그리고 방금 언급한 바와 같이 Decomposition 방법을 하나의 Regularization의 방법으로 활용한 점은 매우 인상적이었습니다.

그리고 또 이 Task에 따라서 Model 구조 혹은 여기서 제시하는 RGCN 방법론을 좀 다양하게 활용한 점도, 상의하게 설정한 점도 아주 좋은 아이디어라고 생각이 됩니다.

제가 지금까지 준비한 내용은 여기까지입니다.

다음에 더 재미있고 유익한 내용으로 찾아뵙도록 하겠습니다.

시청해주신 여러분 감사합니다.
