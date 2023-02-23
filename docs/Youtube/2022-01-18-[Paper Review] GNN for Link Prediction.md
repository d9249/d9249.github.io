---


TITLE : [Paper Review] GNN for Link Prediction
YOUTUBE LINK : https://youtu.be/yv99r-Bo890
PRESENTER : 고려대학교 산업경영공학부 DSBA 연구실
DURATION : 00:25:51
PUBLISHED : 2022-01-18


---
# Notion AI Summary


# Notion AI conclusion


# FULL SCRIPT
 

안녕하세요.

저는 오늘 GNN for Link Prediction 이라는 주제로 발표를 진행하게 될 고려대학교 DSPA 연구실의 이종호 입니다.

오늘 논문은 NeoGNN 이라는 URIPS 2021 거의 최신 학회에서 발표된 논문을 주제로 소개를 드릴 건데요.

해당 내용 자체가 링크 프레딕션에 관련된 심오한 얘기를 많이 다루고 있어서 관련된 얘기들을 같이 보면서 링크 프레딕션에 대한 이해와 그리고 링크 프레딕션이 왜 GNN에서 테스트 중에서 왜 잘 안되는지에 대한 정보 그리고 이걸 어떻게 해결하고자 했는지 저자의 생각과 방향을 함께 같이 확인하는 시간을 가지도록 하겠습니다.

우선 목차는 링크 프레딕션에 대한 가약한 정보를 함께 다루도록 하구요.

그리고 퓨리스틱한 방법들 그리고 CR 이라는 다른 베이스라인 방법들을 한번 비교해 보면서 해당 문제점이 가지는 것을 NeoGNN에서는 어떻게 해결하고자 했는지를 함께 보도록 하겠습니다.

그래프 앤 서크 테스트 같은 경우에는 노드 클래식케이션, 링크 프레딕션, 그래프 클래식케이션 같은 세가지 모드로 나눌 수가 있는데 링크 프레딕션에 대해서 오늘 좀 집중을 하려고 합니다.

링크 프레딕션 같은 경우에는 노드 간의 미싱 엣지를 만들어서 미싱 엣지를 예측하는 테스트를 진행하게 되는데요.

예를 들어서 우리가 소셜레터워크 같은 경우에 이 그림과 같이 어떤 사람과 연결이 실제로 없지만 해당 엣지가 실제로 연결될 것인지 안 될 것인지 즉, 친인구를 추천할 것인지 말 것인지에 대한 테스트를 진행한다고 보시면 될 것 같구요.

그래가지고 이런 링크 프레딕션 같은 경우에는 사실 이제 노드 리프레젠테이션 자체가 중요한데 이 노드 자체가 중요하기보다는 노드의 페어가 중요하다고 생각하시면 될 것 같습니다.

그리고 일반적으로 라지 그래프에서 진행되기 때문에 라지 그래프에서 적용할 수 있는 방법들을 위주로 시행이 되는데 해당하는 부분에 대해서는 제가 이전 영상에 그래프모라는 부분에서 설명을 했는데 그래프 클래식케이션과 좀 다른 부분이 라지 그래프모를 사용하는 분들이 사용하기가 그렇게 쉽지가 않다라는 차이점이 있습니다.

그리고 최근에는 이런 식으로 날리지 그래프에서도 사용이 많이 되는데 날리지 그래프에서 퀘스천 앤서링 같은 주제로 많이 다루어지고 있습니다.

그리고 또 이런 엣지 부분에서 사실 왼쪽에 있었던 예시는 바이너리 엣지라고 해서 실제로 연결 여부에 대한 바이너리를 예측하는데 최근에는 멀티플 엣지라고 해서 해당 엣지가 어떤 타입을 가지는지 자체도 진행합니다.

KDD 2021 컵에서 그래프 컴퓨테이션 관련된 테스트들이 이번에 나왔었는데 그림을 보시면 알겠지만 이 노드 클래식케이션 링크 플래틱션 두 가지 경우에는 라지 그래프 한 개에 대해서 그 노드가 많은 드리퍼 세트에서 사용이 되는 것이고요.

그렇기 때문에 이렇게 많은 노드에 제곱이 계산되는 컴플렉시티 가지는 트랜스포너 관계로는 최적화 조정하는 게 굉장히 힘들다 라는 것을 확인할 수 있습니다.

그리고 최근 동향을 보실 수 있는데요.

이 노드 클래식케이션 같은 경우에는 GCN 같은 알고리즘이 굉장히 우수한 결과를 낸다 라는 것을 확인할 수 있었고 그래프 랩의 클래식케이션 같은 경우에는 노드 자체가 수가 적기 때문에 트랜스포머 계열의 방법론이 많이 적용이 되고 있는 것 같다

라는 것을 느낄 수 있었습니다.

반대로 이 컴퓨테이션에서 링크 플래틱션 같은 경우에는 GCN 기반의 방법론 보다는 트리플렛 임베링이 강세를 가지고 있는 것 같다 라는 것을 확인할 수 있었고요.

실제로 컴퓨테이션 결과에서 트랜스 E, 트랜스 R, 로테이트 E 같은 방법론이 더 많이 강점을 가지게 됐는데 해당 방법론이 왜 강세를 가지는 지는 뒤에서 다시 보도록 하겠습니다.

그래프 포머 같은 경우가 그래프 클래식케이션에서 가장 우수한 성능을 내는 방법론 중의 한 개인데요.

제가 잠깐 간략하게 이걸 설명하려고 한 이유는 그래프 네트워크가 가지는 파워가 사실 WL 테스트로 하면 WL1에 해당하는 Upper Bound가 그 정도 밖에 안되거든요.

그래서 실제로 표현력이 그렇게 강하지 않는데 그래프가 가지는 특징은 사실 원 노드, 원호 이웃을 통한 정보만으로는 모든 걸 표현할 수가 없습니다.

그 예시는 그래프 포머 같은 경우에서 제가 설명을 했으니까 해당 그래프 포머 세미나에서 설명했던 것을 조금 한번 확인해 보시길 바라고요.

그래서 이런 구조적인 정보라는 것을 결국은 더 나타내야 되는데 구조적인 정보가 대표적으로 우리가 설명할 수 있는 게 Shortest Path, Central Routing 이런 것들이 있습니다.

근데 오늘 설명한 방법 중의 한 가지인 구조적인 정보를 어떤 것을 활용하냐고 하면 이건 뒤에서도 다시 설명하겠지만 Common IoT에 대한 방법을 설명하려고 합니다.

그래서 이런 구조적인 정보를 최근에는 많이 활용을 하려고 한다는 게 GCN의 트렌드다.

어떤 것은 Head, Relation, Tail을 따로 학습하는 게 아닌 서로 간의 관계를 학습해야 된다는 것이고요.

즉, Pair가 들어갔을 때 그 Pair의 특징을 Embedding을 해야 된다는 것을 강조하고 일단 넘어가도록 하겠습니다.

그리고 Link Prediction 같은 경우에서 왜 잘 안되는지에 대한 수많은 연구들이 이루어졌는데 그 중에서 Link Prediction이 왜 안되냐는 이유 중에 최근에 Homophily라는 개념이 많이 정립이 됐는데요.

Homophily라는 것은 자기 자신을 중심으로 이웃의 노드의 라벨이 어느 정도 유사한가에 대한 정보를 나타내게 됩니다.

우리가 이때까지는 일반적으로 Degree라는 것에 대한 집중을 많이 했는데 노드의 라벨에 관련이 없는 몇 개가 달렸는지에 대한 Degree를 좀 많이 중요하게 생각을 했고 Degree에 가중치를 둔 것이 우리가 대표적으로 설명하는 GCN입니다.

그런데 Homophily라는 개념은 자기가 연결된 애들에 공유하는 똑같은 라벨이 얼만큼 있느냐는 정보인데 Homophily 자체가 높을 때는 되게 쉬운 테스크라서 Link Prediction이든, 노드 클래식케이션이든 상관없이 잘 됩니다.

그런데 Homophily가 낮아질 경우에는 Graphic Classification 같은 경우는 그렇게 크게 영향을 받지 않아요.

아니, Node Classification 같은 경우에는.

그런데 Link Prediction 같은 경우에는 Node에 결국은 Pair을 측정해야 되다 보니까 굉장히 어려워집니다.

그래서 Homophily에 대한 부분을 어느 정도의 Homophily를 가지고 있냐에 따라서 Link Prediction을 수행하는 방법놈들이 어느 방법을 사용하는지에 따라서 두 번째로 Link Prediction 자체가 어떤 특징을 가지는지를 좀 보겠습니다.

여기에서 Node 2번과 3번은 사실 이렇게 우리가 그래프에 동형사상이라고 하죠.

이런 구조적인 정보가 똑같은 Node 두 개입니다.

이걸 돌리고 처리해봐도 두 개가 공간적으로 똑같은 특징을 가지고 있는데 우리가 일반적으로 이걸 GCN으로 인베딩을 하게 되면 받는 이웃에 대한 정보가 똑같습니다.

Node 2번, Node 3번은 똑같은 인베딩 값을 가지게 됩니다.

그러면 우리가 Node 1번과 Node 2번, Node 1번과 Node 3번의 Pair을 가지고 두 개의 Link Prediction 스코어를 계산한다고 했을 때 똑같은 값이 나오겠죠.

그런데 우리는 Node 1번과 Node 2번, Node 1번과 Node 3번이 두 개의 상대적인 거리를 눈으로 봤을 때 Node 2번이 더 가까운 것을 알 수 있습니다.

이 말이 결국은 똑같은 값으로 인베딩이 되면 안된다는 겁니다.

구조적인 정보가 똑같다고 해서 우리가 앵커가 되는 기준이 되는 게 V1이기 때문에 Node 1의 기준으로 두 개가 인베딩이 다른 값을 가져야 된다는 것을 시사하고 있습니다.

우리가 이런 특징을 반영하기 위해서 휴리스틱한 방법론이 이전부터 연구가 많이 됐었구요.

그 중에서 대표적으로 First Order 휴리스틱 방법론으로 Common 이웃을 정의할 수 있습니다.

Common 네이버 같은 경우에는 두 Node Pair 사이에 얼만큼 많은 공유하는 이웃을 가진다.

즉 우리가 소셜네트워크라고 하면 A라는 사람과 B라는 사람이 실제로는 친구가 아니지만 같은 학교, 아니면 같은 지역 출신이라고 해서 자기와 공유하는 친구가 많으면 두 사람도 실제로는 아니지만 아예 할 수 있는 친한 관계가 될 수도 있겠다.

이런 것을 추천해 줄 수 있겠죠.

실제로 일반적으로 소셜네트워크에서 이러한 방법론이 적용이 잘 된다고 알려져 있지만 우리가 PPI 같은 단백질의 구조적인 정보 데이터 이런 것에서는 꼭 Common 이웃이 많다고 해서 두 링크가 연결된다는 것은 보장할 수 없습니다.

그래서 반례 사례들이 다 존재하는 방법론이구요.

Preferential Attachment라고 하는 PA라는 방법은 그냥 디드리가 높은 것을 두 개 연결하면 연결될 확률이 높다는 것입니다.

인스타에 파워 블로거나 인스타에 팔로워가 많은 사람들 같은 경우에는 사실상 두 사람이 연결이 꼭 안되어 있다 하더라도 인기 있는 사람들이니까 당연히 연결될 확률이 높다는 것을 입시로 들 수 있구요.

근데 이러한 방법론에서 각각의 방금 같은 경우에는 이웃들 같은 경우가 똑같은 가정치를 가지게 되잖아요.

근데 사실 예를 들어서 똑같은 이웃이라고 하지만 내가 공유하고 있는 그 이웃이 A란 친구와 B란 친구가 있는데 인스타에서 가장 팔로워가 많은 사람이 호날두거든요.

호날두를 공유를 하고 있어요.

근데 사실 호날두는 모든 사람이 많이 팔로워를 하고 있는 사람이잖아요.

그래서 실제로 우리 둘 사이의 관계에 호날두가 있다고 해서 호날두가 영향을 우리의 관계에 대한 어떤 정보를 주는 데는 굉장히 미약한 정보예요.

왜냐하면 많은 사람들이 팔로워를 많이 하고 있는 사람이니까.

그러한 정보를 바탕으로 링크가 많으면 연결이 많이 되어 있는 그리고 인기 있는 사람이 있으로 가중치를 낮춰야 된다는 관점에서 Second Order를 봐야 된다고 가정을 해서 Second Order에 대한 가중치를 낮추는 것을 우리는 방법론을 Second Order Heuristic 방법론이라고 설명할 수 있습니다.

마지막으로 High Order에 대한 Heuristic 방법론을 비교하려고 하는데요.

왼쪽에 있는 그래프에 Advanced Matrix를 제가 이렇게 그려놨는데, Advanced Matrix 특징 중에 하나가 이런 식으로 제곱하고 세제곱하고 이런 식으로 하면은 Second Order, Third Order 이런 식으로 해서 우리가 High Order에 대한 이웃을 High Order로 봤을 때 연결이 된다 안된다를 확인할 수 있는 게 있습니다.

이러한 방법을 이용해서 Advanced Matrix의 가중치를 가지고 오면은 예를 들어서 S1과 S4가 연결이 된다 안된다를 계산을 할 때 A1, A2, A3, A4의 가중치를 가지고 온다고 할 때 계산을 하게 되면은 1곱하기 0, 그리고 1과 4에 대한 연결정보로 연결이 안되어 있었죠.

그래서 Second Order에서도 연결이 안되어 있습니다.

그리고 Third Order에서는 이제야 연결이 되는군요.

그래서 가중치를 계산해서 이런 식으로 스코어를 계산할 수 있습니다.

실제로 이 두 개의 스코어를 계산했을 때, 1과 4는 사실상 멀리 떨어져 있으니까 연결될 가능성이 굉장히 낮겠죠.

그렇지만 2번과 3번 같은 경우에는 실제로 연결되어 있고 두 개가 가운데에서 가까운 위치에 있으니까 연결될 확률이 높다고 해서 스코어가 높아지는 것을 확인할 수 있습니다.

이 방법론의 단점은 보시는 것처럼 node의 제곱에 대한 어덴시 매트릭스 값을 가지고 있는데, 이것을 계속해서 곱하기 2를 가지고 있죠.

이러한 휴리스틱 방법론의 한계점들을 보완하고, 그래프 네트워크를 통해서 end-to-end 방법을 처음으로 적용시킨 방법론이 이 CR이라는 방법론입니다.

해당 방법론 같은 경우에는 Learning from Sub-Left Embedding and Attributes for Link Prediction 이라는 방법론인데요.

휴리스틱한 방법론의 구조적인 정보, 특히 링크 프레딕션에 필요한 정보들을 가지고 오는 것은 굉장히 유용하다.

이런 정보를 어떻게 우리가 계산의 영역이 아닌 효율적으로 다룰 수 있는지에 대해서 아이디어를 제시하는데, 그 중 하나가 서브 그래프를 이용한 방법론입니다.

사실 그래프의 구조적인 정보를 이용하는 방법론 중에서 최근에 서브 그래프를 이용한 방법론이 굉장히 많이 나오고 있는데요.

우선 해당 논문에서는 이것에 대한 증명과 정의를 하고 넘어갑니다.

하이오더의 영역, 즉 하이오더가 3 이상의 값의 서브 그래프를 뽑아오는 것은 큰 의미가 없다.

즉 서브 그래프를 뽑을 때 하이오더가 최대 3까지만 뽑아도 이 정보들의 앙상블 같은 느낌이긴 한데 이런 여러 개의 서브 그래프에서 오는 정보를 취합을 하면 결국은 하이오더에 대한 정보를 가지고 오는 것과 유사하다는 것을 우선적으로 정의하고 넘어가구요.

해당하는 증명 부분은 오늘 이 논문이 주제가 아니기 때문에 생략을 하도록 하구요.

이 두 가지에서 상대적인 거리를 측정하는 계산 과정이 복잡하다고 했죠.

결국에는 해당하는 노드들이 내가 기준이 되는 페어를 기준으로 했을 때 계속해서 바뀐다는 겁니다.

실제로 2번 노드 같은 경우에는 XY 기준으로는 2번이지만 또 다른 두 개의 노드를 기준으로는 또 다른 노드 페어가 되잖아요.

이게 의사는 다이나믹하게 계속 변해야 된다는 겁니다.

값 자체가 가지는게.

우리는 이 특징을 어떻게 살릴까를 굉장히 고민을 많이 했는데 우리 NeoGNN을 오늘 소개할 NeoGNN에서는 해당 방법론에 대해서 굉장히 센스티브한 방법론을 제안을 해서 제가 오늘 해당 논문을 설명을 하려고 합니다.

해당 논문을 보시게 되면, 물론 저작 코드에서는 실제로 이런 식으로 활용하고 있지 않다고 얘기를 하지만 장표에 있는 것을 쉽게 설명하기 위해서 예시를 이런 식으로 가지고 왔는데요.

예를 들어서 해당하는 그림에 대한 어댄스 매트릭스가 이렇게 있을 때 우리가 노드 4번을 기준으로 했을 때 노드 4번을 표현할 때 노드 4번과 연결된 엣지인 노드 1과 노드 5를 가지고 오겠죠.

이 가지고 오는 플리커넥티드 레이어를 통해서 노드 1번과 노드 5번을 표현한 후에 두 개의 값을 레그리게이트를 하는 방식을 취하하고 노드 리플레인테이션으로 나타내서 하나의 스칼라 값을 가지게 됩니다.

이 스칼라 값을 가지는게 여기 보이시는 노란색 값이 되구요.

이런 식으로 해서 모든 이웃에 대한 정보를 취합을 하는 스칼라 값을 가지는 벡터를 하나 가질 수 있구요.

이 벡터를 다시 다이아고널 매트릭스를 통해서 만들게 됩니다.

아래의 그림과 같이.

이렇게 만들어진 값을 우리가 가지고 있던 오리지널 어댄스 매트릭스와 계산을 하게 되면 오른쪽 그림, 여기 위에 보시는 Z에 있는 그림과 같이 해당하는 스칼라 값을 가지는 매트릭스가 계산이 되겠죠.

이 값을 로우 단위로 끊어서 보시게 되면 결국은 내가 가지고 있는 이웃에 대한 정보들이 인베딩이 된다고 보시면 될 것 같습니다.

그랬을 때 여기서 가장 큰 특징이 뭐냐.

1번과 5번 노드의 값을 만약에 로우를 빼와서 두 개를 만약에 계산했다고 쳐볼게요.

그러면 사실 이 두 개의 내적 값을 계산하면 계산에 영향을 끼치는 것은 빨간색과 노란색이 되겠죠.

나머지 값은 계산하면 어차피 0이기 때문에 영향을 안 준다는 게 굉장히 큽니다.

즉 빨간색과 노란색이 의미하는 것은 빨간색은 노드 2번을 뜻하고요.

노란색은 노드 4번을 뜻합니다.

1번과 5번을 계산을 할 때 2번과 4번의 영향력으로 인해서 스코어가 계산된다.

무슨 말입니까?

2번과 4번, 1번과 5번의 커먼 이웃이죠.

두 개가 가지는 커먼 이웃의 영향으로 스코어가 계산된다는 뜻입니다.

아까 전에 처음에 설명을 할 때, CR에서 이 두 개가 있으면 사실 2번과 4번이 다이나믹하게 바뀐다고 했잖아요.

그리고 다이나믹하게 바뀐다는 것은 1번과 5번을 기준으로 할 때는 그렇게 계산이 되지만 1번과 7번을 했을 때는 또 다른 값으로 인베링해서 계산을 해야 된다는 뜻이었잖아요.

반대로 제가 1번과 만약에, 이렇게 해볼게요.

1번과 예시가 좀 어울리지가 않아서 제가 만약에 7번을 그냥 했다고 하면은 두 개는 커먼 이웃이 없기 때문에 영향을 끼치지 않습니다.

빨간색, 파란색, 노란색과 초록색.

그렇기 때문에 스코어가 만약에 0으로 나오게 되겠죠.

즉 커먼 이웃이 없다는 뜻이 되고요.

결국은 만약에 여기에서는 빨간색과 노란색이 영향을 끼쳤지만 나중에 커먼 이웃이 아니게 되는 경우에는 어떤 특정한 예시에서는 빨간색만 영향을 줄 수도 있고 노란색만 영향을 줄 수도 있고 이런 식의 영향을 주는 게 다이나믹하게 바뀐다는 게 앞서 말했던 스페어가 달라질 때 다이나믹하게 변하는 특징을 가지고 있다는 것과 일치하게 됩니다.

그러한 아이디어를 이런 식으로 가지고 왔는데 제가 알기로는 이러한 방법론이 처음부터 없었던 건 아니고 디서탱글 리플레젠테이션 관련된 방법론이 이런 특징을 좀 내포하고 있거든요.

해당하는 아이디어와 굉장히 유사하다고.

여기에서 말하는 이 베타고요.

이 베타의 정보를 얼만큼 쓸까?

라는 얘기는 결국 멀티홉에 대한 정보를 얼마큼 쓸까?

라는

건데 결국은 여기서 저자들이 설명할 때는 베타의 값은 수렴에 대한 속도의 문제이지 성능의 영향은 그렇게 크게 미치지 않는다.

그래서 하이퍼파라멘타 베타에 대해서는 그렇게 큰 영향을 받지 않는 로버스트한 특징을 가진다.

몇가지 더 설명을 드리려고 하는데 우리가 이 Z라는 생성된 이 Z라는 리플레젠테이션이 커먼이웃에 대한 특징을 가진다고 했잖아요.

근데 우리가 커먼이웃에 대한 값은 처음에 휴리스틱에서 뽑아낼 수도 있잖아요.

그러면 이게 과연 커먼이웃을 뜻한다고 계속했는데 우리는 사실상 이게 딥러닝을 통한 연산을 통해서 계산된 값이지 커먼이웃에 대한 직접적인 정보를 주입한 것이 아니기 때문에 얘를 정말 커먼이웃으로 할 수 있냐는 질문에 대해서 답할 필요가 있습니다.

그렇기 때문에 이것을 코릴레이션을 통해서 실제로 얼마나 유사한지를 직접적으로 실험을 하는데 오른쪽 첫번째 그림 같은 경우에는 휴리스틱한 라벨을 학습하게 했을 때 얘가 정말 그 능력을 가지냐에 대한 지표인데 실제로 보시게 되면 상당히 강한 코릴레이션 값을 가지는 것을 확인할 수 있습니다.

즉 모방을 할 수 있는 능력이 있다는 것이 첫번째고요.

두번째는 테스트 엣지를 우리가 실제로 값을 냈을 때 스코어 자체를 비교하는 건데 휴리스틱한 방법으로 냈을 때 가지는 스코어와 우리가 이런 식으로 계산했을 때 가지는 값의 스코어를 비교해서 두 개의 값의 코릴레이션을 비교한 건데 그 동안 코릴레이션이 상당히 높은 것을 확인할 수 있습니다.

그래서 CR과의 차이점이 뭐냐라고 직접적으로 물어본다면 우리가 CR에서는 사실 이렇게 노드 값이 앞서 설명했지만 다이나믹하게 변한다는 특징 첫번째 그리고 두 개의 페어가 있을 때 상대적으로 원하드 인코딩을 진행하는 과정을 디스턴스를 통해서 했지만 여기 네오GNN에서는 디스턴스보다는 커먼이웃을 통한 그래서 저는 좀 궁금했던 게 다이나믹 메트릭스를 생성하는 이유가 왜 있었을까 하는 궁금한 점이 있었는데 결국은 여기 ZTZ라는 연산을 통해서 이 시뮬러리티를 빠르게 계산할 수 있는 장점이 있었고 그리고 진짜 커먼이웃에 대한 영향력을 비교하는 실험도 추가적으로 했다고 하는데 메트릭스의 A와 전체 Summarization A3 이런 식으로 했을 때 메트릭스의 코릴레이션을 비교해서 A와 이 두 개의 코릴레이션을 비교해서 영향력이 있는지도 실제로 비교를 해봤다고 합니다.

그리고 다른 실험 장표, 시얼에서 진행했던 방법론과 방법론을 실제로 적용했을 때 추가적인 실험에 대한 정보를 공유하려고 하는데 시얼에서 사용했던 방법론 대비 당연히 더 우수한 성능을 보여줄 수 있었다고 하고 재미있는 게 카네지 인덱스 페이지랭크, 심 랭크 이런 멀티홉에 대한 하이오더 휴리스틱 방법론과 비교했을 때는 아직까지는 하이오더에 대한 소파가 되는 데이터셋도 몇 개 존재했었고 사실 하이오더에 대한 정보를 어느 정도 반영한다고 하지만 실제로 이 하이오더에서 가지고 있는 특징을 완전히 아직까지는 다 가지고 있지는 못한 것 같다는 게 제가 여기서 확인할 수 있었던 것 같고요 그리고 우리가 여기서 계속 커먼이웃을 강조했잖아요.

네오GNN에서

실제로 커먼이웃을 이용하는 커먼이웃, 자카드 시뮬러리티 이런 것을 봤을 때 그러면 이 두 개랑 성능이 비슷해야 하는 거 아닌가 라고 생각할 수 있지만 자카드 시뮬러리티 커먼 네이버가 좋지 않은 성능을 보이는 케이스가 파워 데이터셋에서 존재하지만 해당하는 파워 데이터셋에서도 네오GNN이 소타의 성능을 보이고 있습니다.

즉 단순한 커먼 네이버, 자카드 시뮬러리티와 똑같은 성능에 어...뭔가를 기대한다기 보다는 조금 더 가중치가 고려가 되지 않나 라는 생각을 저는 할 수 있다고 볼 수 있을 것 같습니다.

네 오늘 발표는 여기까지 하고요.

제가 유튜브 영상을 많이 올렸는데 사실 영상에 질문을 많이 해주시는 분들이 있더라고요.

제가 연구실 계정을 올리다 보니까 항상 답변이 조금 늦은 감이 있는데 제 영상을 보시고 혹시라도 질문이 있고 추가적으로 요청하는 자료가 있다라고 하면은 제 첫번째 페이지에 있는 제 메일로 연락을 주시면은 빠른 답변할 수 있을 것 같습니다.

네 오늘 세미나 발표 들어주셔서 감사합니다.