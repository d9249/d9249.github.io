---
title: Graph Neural Network(GNN)의 정의부터 응용까지
layout: default
parent: Youtube
grand_parent: Lecture
nav_order: 3
permalink: /docs/Lecture/Youtube/Youtube003/
---

# Graph Neural Network(GNN)의 정의부터 응용까지 (한국원자력연구원 인공지능응용전략실 최희선 선임연구원)

YOUTUBE LINK : https://www.youtube.com/live/rUmRlZzD_Uk?feature=share

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

# FULL SCRIPT
 
안녕하세요 AI Friends 세미나를 시작하겠습니다.

오늘 모신 분은요 원자력연구원의 인공지능 응용 전략실 최희선 선임연구원님을 모시고 그래프 뇨룰레토크의 기초에 대한 강의를 준비해 보았습니다.

최희선 박사님 잠깐 소개를 드리면요 최희선 박사님은 수학과에서 박사학위를 받으시고 다양한 분야의 시뮬레이션 AI를 접목한 연구를 많이 진행하셨고요.

최근에 이제 저희실에서 조금 주력으로 하고 있는 주제 중에 하나가 메쉬 기반의 시뮬레이션에 인공지능 적용하기 위해서 그래프 뇨룰레토크 적용하는 연구를 진행하고 있습니다.

그래서 이 기술에 근간이 되는 GNN에 대해서 먼저 한번 배워보도록 하겠습니다.

박수 한번 주시겠습니다.

감사합니다.

그러면 자료 공유 부탁드립니다.

네 공유를 해드리겠습니다.

자, 끄고.

띄워드릴게요.

네, 잘 보입니다.

네, 잘 보이시나요?

네, 안녕하세요.

다시 소개를 드리겠습니다.

한국원자력연구원 인공지능 응용 전략실의 최희선 선임연구원이고요.

오늘은 이제 GNN에 대한 설명을 좀 드리려고 하는데 저도 사실 GNN 전문가가 아니고 GNN을 접한지 한 몇 개월밖에 안 됐어요.

한 3개월, 4개월 정도밖에 안 돼서 저도 아직 기초 단계에 있는 것 같고 오늘 세미나를 좀 진행하고자 하는 이유는 제가 기초적인 내용들을 좀 공유를 하면서 혹시 제가 잘못 알고 있는 내용들은 좀 바로 잡아주셨으면 좋겠고 여러분들과 이제 어쩌면 이제 공학 쪽에 더 많이 계실 것 같아서 조금 더 수학적인 내용으로 한번 꾸며보려고 합니다.

그럼 시작하겠습니다.

제가 오늘 말씀드리고 싶은 내용은 크게 이제 네 가지로 구성이 됐는데요.

첫 번째는 이제 GNN을 좀 쉽게 이해를 할 수 있는 여러 가지 이그젠플들이 있어요.

아주 대표적인 이그젠플들이 있는데 그걸 조금 소개를 해드리고 GNN이 기본적으로 어떤 건지 그리고 GNN을 구성하는 요소들에는 어떤 것들이 있는지 무엇을 우리가 GNN을 볼 때 이제 생각하면서 봐야 되는지 같은 것들을 이제 좀 살펴볼 수 있는 예제들이고요.

또 두 번째로는 이제 백그라운드 시어리라고 제가 써놨는데 GNN은 수학적인 부분들이 상당히 많아요.

여러분들이 만약에 GNN을 기반으로 해서 새로운 알고리즘을 만들거나 하시려고 하면 기본적인 딥뉴럴 네트워크나 아니면 CNN 같은 것들보다 좀 더 복잡하고 신경 써야 될 부분들이 많다고 생각해요.

그래서 그런 것들 중에서 이제 꼭 알고 가야 되는 어떤 키워드들 혹은 이해해야 되는 것들 그런 시어리를 조금 더 설명을 드리려고 합니다.

그리고 이제 그 GNN 하면 가장 많이 언급되는 것들 중에 하나가 3,4번에 관련된 것들인데요.

그래프 컨볼루셔널 뉴럴 네트워크 그래서 줄여서 보통 GCN이라고 부르고 그 다음에 이제 포인트 클라우드에 대한 러닝이 있어요.

그래서 포인트 클라우드를 기존에 포인트 넷 기법을 많이 썼었는데 그래프 기반으로 포인트 클라우드를 어떻게 이해하고 또 적용을 할 건지에 관한 내용입니다.

그럼 시작하겠습니다.

일단 우리가 이제 그래프라고 해서 떠올리면 보통 이런 점들이 잔뜩 찍혀있는 모습들을 생각하기 마련인데요.

그래프를 구성하는 거에는 크게 두 가지가 있다고 생각할 수 있습니다.

버텍스 혹은 노드라고 불리는 이런 동그라미들 그리고 이 동그라미들을 하나씩 있는 엣지 이렇게 두 가지로 구성이 되어 있어서 우리가 그래프를 정의를 할 때는 G라고 쓴다면 이 G라는 펑션은 V와의 E, 그러니까 버텍스와 엣지로 구성이 되어 있다고 할 수 있어요.

근데 이제 이 버텍스라고 하는 거는 하나하나 우리가 관심 있어 하는 어떤 요소들이나 인풋을 의미를 하고 이 인풋들은 각각 어떤 피처를 가지고 있습니다.

이게 어떤 종류의 피처가 되어야 되는지는 제가 뒤에서 좀 더 말씀을 드릴게요.

그리고 엣지는 이 인풋들을 혹은 버텍스를 이어주는 역할을 하는데 방향이 있을 수도 있고 제가 오늘 다룰 내용들은 대부분 방향이 없는 것들입니다.

그래서 링크만 존재를 하는데 내가 저 사람을 알고 있다 최희선이라는 사람이 어떤 다른 사람을 알고 있다고 할 때 우리가 링크로 표현을 할 수가 있겠죠.

그래서 어떤 정보를 이 두 인풋이나 어떤 버텍스가 얼마나 가까운지 뭔지를 표현하는데 이 엣지가 사용이 됩니다.

그래서 제가 여기서 강조드리고 싶은 것은 그래프를 구성을 하는데 크게 세 가지가 있다고 생각을 해야 될 것 같아요.

버텍스, 엣지 그리고 버텍스를 표현하는 피처입니다.

대표적으로 보통 표현을 이제 우리가 그래프를 얘기를 할 때 가장 먼저 튀어나오는 애가 보통 소셜 그래프인데요.

이제 사람 버텍스 하나가 사람을 의미하거나 그룹, 오거니제이션 같은 것을 의미를 할 수가 있죠.

사람이라고 친다면 이 사람이 저 사람을 알고 있는지, 어떤 경로를 통해서 알고 있는지, 여기서 이제 그림에서 보시는 것처럼 페이스북을 통해서 알고 있는지 아니면 뭐 다른 것들을 통해서 알고 있는지 이런 것들을 이제 카테고리화 시킬 수 있고요.

이 friend라고 할 수 있는 사람들은 엣지로 얼마나 가까워야 하는지 같은 것도 정의를 할 수가 있습니다.

그리고 이제 GNN 혹은 그래프 레프레젠테이션이 가장 크게 환영받고 있는 분야라고 하면 제 생각에는 이제 케미스트리나 바이올로지 쪽이라고 생각을 하는데요.

왜냐하면 그 전에는 이 케미스트리 같은 이런 구조를 화학물질의 구조를 DNN이나 컨볼루셔널 뉴럴 네트워크 어떤 이미지화 시켜서 표현을 하기가 굉장히 어려웠어요.

왜냐하면 이 그래프라는 것들이 가지고 있는 특성 때문인데 예를 들어 얘가 트위스트가 되거나 뭐 약간 링크가 찌그러지거나 해도 결국은 다 똑같은 어떤 화학물질인데 그 동일한 걸 어떻게 표현할 것이냐를 생각을 해보면 일반적인 우리가 CNN을 할 때 떠올리는 그런 이미지로는 그리드 기반의 이미지로는 표현을 하기가 매우 어렵죠.

그래서 링크가 연결이 되어있는지 안 되어있는지 그리고 퍼뮤테이션에 의해서 인베리언스 한지 안한지 등의 프로퍼티가 훨씬 더 중요하기 때문에 이 케미스트리 쪽에서는 그래프를 이용을 해서 이런 아텀이나 아니면 어떤 분자 구조 같은 것들을 표현을 하는 게 굉장히 유용하게 쓰이고 있습니다.

그래서 많이 쓰이는 애플리케이션은 보통 이렇게 분자 구조에서 지금 여기에서 다시 말씀드리면 이 노드 이 그래프의 노드는 결국 하나의 분자나 원자가 되고요.

그 다음에 링크는 이 분자 혹은 원자들 사이간에 어떤 본디지가 됩니다.

그 다음에 이 피처는 여러 가지가 될 수 있는데 이 분자 구조의 어떤 타입이 될 수도 있고 아니면 이 분자 구조가 가지고 있는 어떤 다른 특성들 예를 들어 독성이 있는 물질인지 없는 물질인지 이런 것들이 피처가 될 수 있습니다.

그래서 이걸 구조화 시켜서 그래프로 표현을 해서 GNN을 통해서 우리가 아웃풋으로 얻고 싶은 것은 예를 들면 이런 식으로 바이너리 클래시피케이션 같은 것을 얻고 싶은 건데요.

우리가 학습을 통해서 어떤 분자 구조를 가지고 있으면 독성이 있다 혹은 독성이 없다 이런 식으로 나눠서 우리가 학습을 시킬 수 있는데 이렇게 되면 우리가 몰랐던 혹은 새로운 물질에 대한 분자 구조가 인풋으로 들어갔을 때 그게 독성이 있을지 없을지 혹은 다른 어떤 성질을 가지고 있는지 아닌지 등을 판단할 수가 있죠.

그래서 클래시피케이션 쪽으로도 아주 많이 쓰이고 있는 걸로 알고 있습니다.

바이올로지 쪽에서도 마찬가지로 쓰이는데요.

이제 케미스트리와 바이올로지 굉장히 유사한 방식으로 많이 쓰이는데 유전자의 단백질 구조를 그래프로 표현을 한다거나 혹은 모레클, 어떤 분자 구조를 그래프로 표현을 한다거나 혹은 더 나아가서 셀들, 셀들의 링크를 표현한다거나 이런 식으로 이제 점점 더 큰 어떤 카테고리 속에서 어떻게 서로 상호작용을 하고 또 연결되어 있는지 이런 것들을 표현할 때 그래프가 아주 효과적으로 쓰이고 있습니다.

최근에 나온 어떤 다른 논문에서는 이런 지금 오른쪽에서 볼 수 있는 이런 아주 나노스케일의 작은 티슈 조각들 그리고 이 티슈 안에 들어있는 물질의 어떤 구조들을 어떻게 표현할 것이냐 이걸 표현하는 일반적이고 그러니까 제너릭하고 그리고 통합된 그런 방법이 없다고 판단을 하고 있더라고요.

그래서 그게 그 어떤 대안이 될 수 있는 게 그래프 뉴럴 네트워크다라고 해서 제안을 했고요.

그래프 뉴럴 네트워크로 표현을 하면 이제 어떤 절점 같은 것들이 노드로 표현이 되고 그리고 이 혈관 같은 것들이 갈라지는 그 인터섹션 부분이 노드가 되고 혈관 하나하나 혹은 뭐 조직이 나아가는 길은 엣지로 표현이 돼서 이 전체적인 조직이 어떻게 구성이 되어 있는지 이런 것들을 표현하는데 효과적으로 쓰이고 있습니다.

그 다음으로 또 많이 각광받고 있는 이제 분야가 트래픽인데요.

이제 딥마인드에서도 많이 관심을 가지고 있는 것 같은데 트래픽은 정말 표현하기 나름인 것 같아요.

아주 다양한 방식의 이제 표현법이 있는 것 같은데 여기에서 제가 지금 오늘 그림으로 가지고 온 거는 이 노드 하나하나가 어떤 로케이션을 나타내는 경우입니다.

어떤 특정, 죄송합니다.

인터섹션, 아까 여기에서 보셨던 이렇게 길이 갈라지는 이 지점을 표현하는 게 하나하나의 노드가 되고 이 노드들을 연결하는 실제 길이 엣지로 연결이 되면서 여기에 이렇게 방향성이 생길 수도 있고 아니면 방향성 없이 그냥 양방향으로 움직인다고 평가를 할 수도 있어요.

그럼 이 노드와 엣지에서 이 노드가 가지고 있는 피처는 보통 뭐가 되냐면 이 절점에서의 순간적인 차량의 평균 이동 속도가 될 수도 있고 아니면 다른 종류의 어떤 트래픽 상황이 될 수 있습니다.

빨간 불이 어떤 순간에 들어온다, 파란 불이 얼마나 길게 들어온다 이런 식의 어떤 특성을 노드 피처로 가지고 있게 되고요.

그렇게 표현을 했을 때 우리가 목표로 이제 할 수 있는 거는 이 그래프 레프레젠테이션을 통해서 이제 어디 어떤 노드에서 다른 노드까지 그러니까 한 로케이션에서 다른 로케이션까지 우리가 진행을 할 때 얼만큼의 시간이 걸릴 거라고 예상을 하는지 이런 것들을 이제 우리가 평가를 하는데 그래프 뉴럴 네트워크가 쓰일 수 있습니다.

또 다른 애플리케이션은 이거는 나름대로 그래프 뉴럴 네트워크를 적용하는 거는 이제 나름 최신의 분야인 것 같은데요.

프로그램 어널리시스라고 해서 코딩을 하거나 혹은 코딩을 평가를 하는 시스템이에요.

그래서 예를 들면 여기서 뭐 def 어떤 함수를 정의하는 명령어가 쓰이고 함수의 이름이 쓰이고 그 함수에 들어가는 배리어불들이 이렇게 나열이 됩니다.

이거 하나하나가 그 어떤 그래프의 노드 절점이라고 생각을 하는 거죠.

그리고 이 노드 절점들이 어떤 식의 플로우로 연결이 되어 있는지 어떤 방향성을 가지고 플로우를 연결을 해주고 그래서 로직을 이 코드 내에 들어가 있는 로직을 엣지의 플로우로 설명을 해주는 거죠.

이렇게 학습을 했을 때 어떤 게 문제가 되면 에러가 혹은 버그가 발생한다라는 것을 학습을 시키고 나면 얘가 배울 수 있는 건 예를 들어서 이제 어떤 배리어블 그 c 같은 경우에는 우리가 배리어블을 선언을 해야 되는데 그 선언이 잘못되었을 때 그걸 어떻게 그런 종류의 버그를 골라내는 것 이런 일들을 할 수 있고 또 우리가 이제 랭기지 어떤 특정 랭기지 파이썬 같은 것을 치다 보면 그 에디터에서 자동으로 어떤 오토메이션 서제션을 주잖아요 그 서제션에 무엇이 어떤 서제션이 들어가야지 가장 이 사람에게 적합할지 가장 효과적인 코딩이 될지 이런 것들을 제안을 해주는 그런 식으로 이 그래프 뉴럴 네트워크가 프로그램 언렐리시스에 사용이 되고 있습니다.

그래서 이제 백그라운드 시오리를 좀 설명을 해드릴게요 제가 키워드를 중심으로 설명을 해드리려고 하는데 이 키워드들은 그래프 뉴럴 네트워크에 관련된 이제 논문을 보거나 어떤 자료를 보실 때 거의 빠지지 않고 나오는 내용들이라고 생각을 하고요 아주 기본적으로 이해를 하고 있어야 되는 부분이라고도 생각합니다 그래서 제 강의가 다 끝나고 나서 이 키워드를 다시 돌이켜 보셨을 때 기억이 나시는지 한번 상기시켜 보시면 좋을 것 같아서 제가 적어 봤습니다 그래프 레프레젠테이션 러닝이라는 게 뭔지 사실 그래프 레프레젠테이션 러닝이랑 GNN이랑은 다른 거거든요 그래프 레프레젠테이션 러닝이 먼저 시작이 됐고 좀 더 원론적인 얘기가 될 거고 거기에 이제 뉴럴 네트워크를 접목시킨 것이 GNN이라고 할 수 있습니다 그 다음에 GNN은 보통 unstructured 데이터에 많이 사용된다고 늘 얘기를 하죠 이게 무슨 뜻인지 제가 뒷부분에서 조금 더 자세하게 설명을 드리겠습니다 그 다음에 GNN 뿐만이 아니라 사실 이건 대부분의 빅데이터를 핸들링 할 때 반드시 나오는 개념이기는 한데요 인베딩이라는 거죠 우리가 적은 차수의 어떤 스페이스로 프로젝션을 시키는 것을 말을 하는데 이 GNN 같은 경우에는 노드를 기반으로 인베딩이 이루어집니다 주로요 뭐 앞으로는 뭐 엣지를 기반으로 이루어질 수도 있겠지만 지금 현재는 보통 노드 인베딩을 의미를 합니다 그 다음에 이렇게 인베딩이 된 스페이스에서 스페이스로 가려면 우리가 지금 이렇게 흩뿌려져 있는 데이터들을 잘 합쳐서 인포메이션을 잘 조합을 해서 인베딩이 되도록 해야 돼요 그렇게 어떤 메시지들 인포메이션들을 합치는 것을 aggregation이라고 합니다 그래서 뒷부분에서 다시 제가 더 자세하게 설명을 드릴게요 그 다음에 GNN에서 제 생각에 가장 중요하다고 생각하는 것 중에 하나는 네이버 후드인데요 왜냐하면 네이버 후드를 네이버 후드가 일반적으로 생각했을 땐 그냥 어떤 노드 가까이에 있는 영역이라고만 생각할 수 있지만 사실 그렇게 단순하지는 않아요 네이버 후드를 어떻게 정의를 하고 그거에 따른 adjacency matrix를 어떻게 만들 것인지가 이 GNN의 어떤 성능이나 목표하는 어떤 태스크를 수행하는 성능을 좌지우지하는 중요한 어떤 팩터라고 생각을 합니다 네이버 후드가 중요하다고 생각하고

그리고 이 네이버 후드에 또 attention을 넣어서 우리가 계산을 할 수 있는데 이거는 이제 간단하게만 설명을 하고 제가 넘어가도록 할게요 그래프 레프레젠테이션 러닝은 생각을 해보면 우리가 가지고 있는 데이터들이 이런 식으로 아주 많이 수천 수만 개의 데이터들이 흩뿌려져 있어요 이렇게 노드와 엣지로 다 연결이 되어 있는 것처럼 보이지만 이걸 어떻게 잘 레프레젠테이션 할 것이냐 어떻게 표현할 것이냐 그리고 어떻게 표현하도록 가르칠 것이냐 배우게 할 것이냐 라는 질문인데요 이거를 데이터가 지금 무작정 이렇게 산재되어 있는 이런 데이터들을 우리가 레프레젠테이션을 한다는 말은 결국은 어떤 식으로든 표현을 한다는 말입니다 이렇게 표현을 한다 레프레젠테이션을 만든다라고 하는 거는 결국은 지금 이렇게 칼라로 표현이 되어 있는 것처럼 여기에서는 수천 개의 점이었지만 이 그림을 보면 마치 몇 개 안 되는 카테고리로 나누어져 있는 것처럼 보이죠 사실은 어떤 애들은 되게 비슷한 성질을 가지고 있었고 또 다른 성질을 가진 또 다른 카테고리가 있고 이런 식으로 분류를 해서 생각을 하는 거예요 지금 이게 몇 개의 칼라인지는 모르겠지만 예를 들어 10개의 칼라라고 하면 수천 개의 어떤 인포메이션을 10개로 적게 카테고라이즈 하는 거죠 이걸 레프레젠테이션이라고 할 수 있고 이걸 다른 말로 하면 원래 우리가 가지고 있었던 아주 복잡했던 그래프의 스트럭처를 로우 디멘저널 스페이스로 우리가 써머라이즈를 하는 거라고 말을 할 수 있습니다 이 로우 디멘저널 스페이스를 다른 말로 하면 임베딩 스페이스가 돼요 그래서 이런 과정을 우리가 가지고 있는 원래 가지고 있었던 아주 복잡했던 그래프를 적은 차원의 어떤 스페이스로 프로젝션을 시키거나 혹은 임베딩 사실은 프로젝션은 아니죠 우리가 그 과거에서 클래식하게 말했던 프로젝션은 아니지만 임베딩을 하는 것 적은 차수로 보내는 것을 우리가 임베딩 여기 그래프 뉴럴 레터에서는 노드 임베딩이라고 불립니다 그리고 또 다른 말로는 엔코딩이라고 불리기도 하죠 엔코딩, 임베딩 결국은 사실은 다 같은 목적을 가지고 있는 말이고요 적은 차원의 스페이스로 보낸다는 뜻입니다 그래서 이 그래프 뉴럴 네트워크는 보통 넌 유클리드한 스페이스에서 존재한다 라고 표현을 하는데요 이게 무슨 말이냐면 예를 들어서 우리가 그래프를 이렇게 유클리드한 스페이스에서 그릴 수는 있겠지만 아까 보여드렸던 소셜 그래프 같은 경우를 생각을 해보면 이 사람과 저 사람의 노드를 제가 이렇게 두개를 어떤 종이 같은 데다가 그렸다고 해도 이 관계도를 그렸다고 해도 사실 이 사람이 진짜 이 로케이션과 정말 이 로케이션에 존재하는 것은 아니죠 그래서 어떤 두 점이 그냥 존재하는 것 뿐이지 유클리드한 스페이스의 어떤 코디웨이트를 의미 있게 가지고서 움직이는 것은 아니다 라는 의미에서 넌 유클리드한 스페이스에서 존재한다고 표현을 하죠 그리고 그렇지만 우리가 임베딩을 할 때는 이 넌 유클리드한 스페이스에서 존재했던 이 인포메이션들을 결국 유클리드한 스페이스로 바꿔줘요 그래서 우리가 이 점들의 디스턴스나 관계 같은 것을 계산을 할 수 있도록 이 과정을 엔코딩 혹은 엔베딩이라고 부른다는 거 기억해 주셨으면 좋겠습니다 그래서 우리가 궁극적으로 바라는 것은 이렇게 그래프에 대한 트레이닝을 했을 때 이 파란색 링크들이 우리가 가지고 있는 트레이닝 데이터라고 생각하시면 되고요 이 빨간색은 테스트 데이터들이에요 그래서 우리가 얘와 얘 관계도 과연 이 트레이닝된 결과를 가지고 유출할 수 있겠냐 그래프 러닝이 된 그래프 레프레젠테이션을 가지고 얘네들의 관계 혹은 얼마나 친밀한지 정도를 표현할 수가 있겠느냐가 우리가 궁극적으로 궁금한 관심사입니다 그래서 이 노드 임베딩 방법에는 크게 두 가지가 있는데요 쉘로 임베딩 메소드는 사실 지금은 더 이상 거의 쓰이지 않는 것 같아요 아직도 연구를 하시는 분들이 많지만 여러가지 좀 문제점들이 있기 때문에 많이 쓰지는 않는 것 같고요 그 다음에 최신 기법으로 나름 최신 기법으로 각광을 받고 있는게 이제 뉴럴 네트워크 기반의 임베딩 기법입니다 그래서 근데 이제 쉘로 임베딩 메소드도 설명을 한번 해야 될 것 같아서 왜냐하면 의미가 있는 작업들이 이루어졌거든요 그래서 이걸 설명을 드리고 뉴럴 네트워크는 뉴럴 네트워크 기반으로 하는 메소드는 어떤 차이가 있는지를 말씀을 드리겠습니다 그 쉘로 임베딩 메소드는 아주 간단한데요 예를 들어서 우리가 노드가 이렇게 딱 세 개만 있다고 쳤을 때 a b c 그리고 a b c는 전부 다 링크로 연결되어 있어요 그랬을 때 이거를 b에 대한 우리가 임베딩을 만약에 하려고 한다면 이 b를 익숙하실 것 같은데 원 핫 인코디드 벡터로 만들어요 그래서 a b c 라고 하면 a 는 0 b 를 나타내야 되기 때문에 1 그리고 c는 0이니까 0102라는 벡터가 되죠 그리고 이 벡터에다가 우리가 임베더라고 부르기도 하고 임베딩 매트릭스라고 부르기도 하는데 인코더라고 부르기도 해요 이 인코더나 임베더 이 매트릭스를 구성을 하는 거예요 그리고 이 매트릭스는 여기가 딱 이 b 노드를 표현하는 로케이션만 지금 딱 1로 되어 있고 나머지는 다 올 제로기 때문에 요 칼럼 벡터 하나만 요 1에 대응되는 어떤 임베딩 벡터가 되는 거죠 그래서 이 특정한 칼럼 칼럼 하나하나가 각각의 노드를 표현을 하는 임베딩 벡터로서 역할을 하게 됩니다 그래서 우리가 여기에서 트레이닝을 하고 싶은 건 결국 이 임베딩 매트릭스의 컴포넌트들이에요 한가지 제가 말씀드리고 싶은 건 제가 여기에서는 예제를 아주 단순하게 들려고 노드를 세 개만 했고 또 이 노드의 개수와 임베딩 디멘전의 개수가 다르다는 걸 표현하기 위해서 이렇게 길게 그렸지만 사실은 이 정반대로 생겼습니다 임베딩 디멘전이 작고 노드의 개수가 훨씬 많아요 그래야지 우리가 더 적은 차원의 또 다른 스페이스로 인코딩을 하는 셈이 되기 때문에 사실은 다르게 생겼다는 걸 좀 기억을 해주셨으면 좋겠습니다 이 임베딩 결과를 생각을 해보시기 원핫 벡터를 생각을 해보시면 이거 사실 nlp랑 굉장히 유사하게 닮은 점이 있거든요 nlp에서 우리가 단어 하나하나를 표현할 때도 사실은 다 이 원핫 인코디드 벡터로 표현을 하잖아요 트레이닝 데이터 안에 들어가 있는 단어들이라면 그래서 여기에서 말하는 노드 하나가 이 nlp에서는 워드가 되고요 이 워드들의 적당한 잘 조합이 이루어져서 새로운 단어를 표현을 한다면 이게 이제 로컬 레프레젠테이션이라고 보통 부르고 왜냐면 원핫 벡터이기 때문에 이 로컬한 레프레젠테이션을 커널 메소드처럼 쭈루룩 서메이션을 해서 표현을 하는게 디스트리뷰티드 레프레젠테이션인데 이 디스트리뷰티드 레프레젠테이션이 이루어지려면 여러 개의 조합, 아주 다양한 것들의 조합이 이 중간 과정에서 이루어져서 얘가 완성이 되는 거죠 그래서 그 다양한 조합을 우리가 보통 랜덤 웍 조합의 결과를 랜덤 웍이라고 부르는데 이 랜덤 웍은 이제 센텐스, 우리가 nlp에서 말하는 센텐스의 대응이 될 수 있습니다 그래서 이 노드와 랜덤 웍은 그래프 레프레젠테이션에서도 동일하게 쓰이기 때문에 이 nlp와 그래프 레프레젠테이션 러닝이 사실은 각자 다르게 발전을 했지만 지금은 nlp를 그래프 뉴럴 네트워크 기법을 이용해서 표현을 하거나 연구를 하시는 분들도 상당히 많습니다 이제 서로 서로가 도와주는 역할을 하게 되는 거죠 그래서 이 인베이더 매트릭스, 인베이딩 매트릭스를 어떻게 학습을 시키냐면 시뮬러리티 메저를 이용을 해서 학습을 시키는데요 이 인베이딩을 시킬 때 가장 중요한 질문 중에 하나는 어떤 것이 좋은 인베이딩이냐 이 원래 가지고 있었던 노드를 도대체 어떤 식으로 바꾸거나 적은 차원으로 이제 축소를 시켜야 이것이 좋다고 말을 할 수가 있겠느냐 라는 그 기준이 필요해요 그 기준을 제공하는 게 굉장히 여러 가지 방법이 있을 수 있는데 이 쉘로 인베이딩 메소드, 가장 기본적인 쉘로 인베이딩 메소드에서는 보통 시뮬러리티를 프리저브 한다라고 표현을 하는데요 이 원래 가지고 있었던 a와 b 사이에서의 거리가 만약에 가깝다면 거리가 가깝다고 하는 것은 적은 수의 엣지를 통해서 연결되어 있다는 뜻입니다 예를 들어서 이 작은 그림에서 이 노트, 죄송합니다 이 노드와 이 노드가 몇 칸이 떨어져 있냐고 할 땐 한 번 두 번에 따라서 가니까 두 칸 떨어져 있죠 이거 distance 2라고 말을 할 수 있고 얘와 얘 사이는 distance 1이라고 말할 수 있죠 물론 여기에 또 다른 복잡한 디테일을 넣을 수도 있지만 일단은 엣지 개수로만 저희가 디그리로만 표현을 해볼게요 얘는 두 칸, 얘는 한 칸이 떨어져 있는데 이렇게 distance를 표현할 수 있는데 노드들 간에 만약에 이 노드와 이 노드가 원래 그래프에서 가까웠다면 인베이딩 된 스페이스에서도 이 둘 사이에 거리는 충분히 가까워야 한다 라는 게 시뮬러리티 프리저베이션입니다 그래서 수식으로 표현을 하면 s라는 애가 어떤 시뮬러리티, 이 시뮬러리티라고 표현하지만 사실 디스턴스라고도 표현할 수 있고요 시뮬러리티라고 표현한다면 좀 더 제너럴한 표현이 되겠죠 이 둘 사이에 어떤 유사성, 관계성, 거리 등이 각각의 노드를 인베이딩을 시키고 나서도 어느 정도는 유지가 돼야 된다 가깝다면 가깝게, 멀었다면 멀도록 이런 성질이 저희가 시뮬러리티를 보존한다고 하는데 이걸 기준으로 저희가 옵티마이즈를 시켜요 어떻게 시키는지 감이 오시겠죠?

그래서 a와 c가 있을 때 얘네들의 인베이딩 메이트릭스를 통해서 이제 새로운 스페이스로 가게 되고 그 스페이스들 간에 어떤 거리를 측정을 해서 이 둘 사이의 거리가 가까운 방향으로 옵티마이즈가 되도록 학습을 시킬 수 있습니다 그래서 대표적인 방법이 노드투백, 딥워크 이런 유명한 방법들이 있죠 그런데 정말 치명적인 문제가 있는데요 스케일러빌리티 이슈가 있습니다 다른 것들은 다 그렇다고 쳐도 이게 정말로 치명적인데 일단 첫 번째는 이게 이 한쪽의 차원이 노드의 개수랑 동일하잖아요 그래서 노드의 개수가 이 그래프 뉴럴 네트워크가 정말로 크면 정말 엄청나게 커집니다 리뉴어하게 커지기, 아예 동일한 사이즈로 커지기 때문에 노드의 개수가 만약에 100만 개다 하면 이 한쪽 행의 개수가 칼럼의 개수가 100만 개가 돼야 되는 거예요 이런 이슈가 있고 더 큰 문제는 만약에 100만 개의 노드를 가지고 있는 어떤 세팅에서 우리가 학습을, 임베이딩 메이트릭스를 학습을 시켰다면 이게 다른 200만 개, 300만 개의 노드를 가지고 있는 그래프 뉴럴 네트워크에는 적용, 아니 그래프에는 적용이 안 되는 거예요 그래서 이런 스케일러빌리티 이슈가 있고, 제너럴리제이션 이슈도 있습니다 그리고 또 다른 건 우리가 예를 들어 사과 그리고 피자와 같은 어떤 두 개의 단어 이걸 nlp라고 생각했을 때 두 개의 단어가 얼마나 가까운지 뭔지를 평가를 한다고 하면 이걸 어떻게 해야지 얼마나 가깝다고 말을 할 수 있지?

라는 질문이 들잖아요 이 시뮬러리티 매트릭스를 도대체 어떻게 정확히 규정을 해야 되냐 라는 것도 상당히 복잡할 수 있기 때문에 문제에 따라서 이게 애플리케이션이 좀 어려워지면 적용하기가 매우 어려울 수 있습니다 이런 단점들이 있어서 셀로우 임베이딩 메소드는 최근에는 잘 사용을 하진 않고 이제 대부분은 뉴럴 네트워크 쪽으로 간 것 같아요

그런데 이제 여기 앞에서 소개를 해드렸던 디버크나 노드투백 같은 경우에는 사실 퍼포먼스 차원으로는 이런 큰 단점을 우리가 생각을 하지 않는다면 퍼포먼스에서는 상당히 좋은 결과들을 보이고 있다고 해요 지금 최신에 나오는 어떤 다른 뉴럴 네트워크 기반의 그래프 뉴럴 네트워크 그래프랑 비교를 해봐도 되게 좋은 성능을 보이고 있다고 합니다 마냥 버리거나 포기해야 되는 종류의 어떤 메소드들은 아닌 것 같고 애플리케이션에 잘 맞춰서 사용을 하면 될 것 같습니다 뉴럴 네트워크 기반의 메소드는 크게 이제 메시지 패싱 GNN이랑 바이스펠러 레만 GNN이라는 기법이 있는데요 이 WLGNN이라고 보통 불리는 이 기법은 사실 제가 오늘 다루지는 않을 거예요 스케일러빌리티 이슈가 동일하게 있기 때문에 안 다룰 거지만 사실 이 GNN 혹은 그래프 레프레젠테이션 러닝에 있어서 아주 큰 기반을 닦은 메소드라고 알고 있어서 관심 있으신 분들은 한번 보셔도 좋을 것 같습니다 그래서 제가 오늘 설명을 드릴 그 지금부터 설명을 드릴 내용들은 전부 다 메시지 패싱 GNN에 관련된 내용들이에요 이 메시지 패싱은 말 그대로 메시지 어떤 인포메이션을 전달을 한다 어떻게 전달을 하게 할 것이냐를 고민을 한 방법이라고 생각하시면 되는데요 우리가 가지고 있는 어떤 인풋 그래프가 있을 때 이 인풋 그래프 중에 어떤 하나의 노드를 표현을 하려면 이 노드가 주변의 노드로부터 정보를 받아서 이 노드의 어떤 피처가 결정이 된다고 생각을 하는 거예요 그렇기 때문에 메시지 패싱이라고 불리는 거거든요 그래서 이 A라는 노드를 A라는 노드의 어떤 성질 혹은 피처는 B, C, D 이 주변부에 있는 바로 링크로 연결되어 있는 B, C, D에 의해서 결정이 된다라고 판단하는 겁니다 그래서 이거는 한 칸만 건너서 생각을 한 거기 때문에 뉴럴 네트워크 차원에서 보면 원 레이어 케이스에요 그래서 보시면 이제 HU라고 불리는 게 여기 노테이션이 좀 다른데 이 U가 이미 어떤 노드를 픽스된 노드를 의미하는 거고요 H는 이 노드가 가지고 있는 피처를 의미합니다 그리고 여기 올라가 있는 K, Super Script K는 레이어로 생각을 하시면 돼요 그래서 첫 번째 레이어, 완전히 처음 레이어는 인풋 레이어겠죠?

인풋 레이어는 이제 인풋 피처를 가지고 있습니다 그래서 이 인풋 피처들이 적당히 잘 모여서 이 메시지들이 합쳐지고 합쳐지면 원래의 자기 자신이 가지고 있는 어떤 성질과 결합이 돼서 새로운 성질을 보인다라고 평가를 한다고 생각하시면 돼요 그래서 여기서 가장 중요한 세 가지를 제가 박스를 쳐놨는데요 첫 번째는 Aggregate입니다 이 주변의 정보들을 가지고 정보를 합쳐야 되는데 이 정보를 어떤 식으로 합칠 거냐를 결정하는 게 이 Aggregation Function이에요 그리고 이 Aggregate 된 애와 자기 원래, 원래 자기 자신의 정보를 적당히 어떤 식으로 합쳐서 새로운 정보로 이제 업데이트를 할 것이냐라는 이 두 가지 업데이트와 Aggregation Function이 있고요 이거는 문제에 따라 다르겠지만 일단은 보통 우리가 이 두 개를 다 학습을 시키거든요 그래서 Differential Function이면 되고 이게 보통 Neural Network로 표현이 됩니다 그리고 이 Aggregate 할 때 우리가 가지고 오게 되는 정보 H 얘는 V죠 H, V라는 이 V의 노드들은 U의 네이버 후드에서 가지고 옵니다 여기서 U는 이 그림에서는 A이기 때문에 A의 네이버 후드, 첫 번째 네이버 후드에서 가지고 오는 애들이 B, C, B예요 GNN에서 보통 네이버 후드라고 하면 자기 자신은 제외를 하고 얘기를 하는 거고요 네이버 후드에 자기 자신이 포함되어 있는 경우에는 따로 명시를 하거나 노테이션을 다르게 써줍니다 이 두 번째 경우에는 이제 투 레이어 케이스예요 마찬가지로 이루어지는데 이제 B 같은 경우에는 아까 여기에서는 우리가 B, C, D만 바라보고 이제 A를 어떻게 맞출 거냐를 생각을 했잖아요 근데 그럼 B는 어디서 왔을 거냐를 생각을 해보면 B는 자신을, 자신의 근접한 또 다른 노드들 A와 C에 의해서 영향을 받아서 메시지가 전달이 됐을 것이다 그렇게 업데이트가 됐을 것이다

라고 생각을 하는 거고요 이 C 같은 경우는 C에서 B, A, E, F로 연결이 되어 있죠 그래서 A, B, E, F, 이 네 가지 노드에 의해서도 결정이 되고 D는 A에 의해서 결정될 것이다 라고 하는 게 동일한 방식으로 우리가 한 층 더 깊게 생각을 하는 거죠 그래서 이거는 투 레이어 케이스입니다 마찬가지로 정보의 에그리게이션과 업데이트를 통해서 새로운 노드들, 노드 자체가 바뀌지는 않아요 그래프의 구성이 바뀌는 건 아니고 그 동일한 그래프의 어떤 피처가 달라진다고 생각하시면 됩니다 그래서 이 앞에 것과 뒤에 거는 똑같은데 이게 가장 제너럴한 폼이라면 좀 더 구체적인 그 중에서 가장 단순한 GNN의 폼을 생각해 본다면 그렇게 생각해 볼 수 있습니다 HU의 K는 그 전 타임 스텝의, 그 전 이터레이션의 정보 그러니까 전 레이어의 정보를 가지고 자기 자신의 전 레이어 정보를 가지고 업데이트가 되고 또 주변부의 정보들을 가지고 잘 합쳐서 에그리게이션을 해서 이제 새로운 정보로 업데이트가 되는데요 여기 보시면 어떻게 정보를 합칠 것이냐라는 질문이 나온다고 했잖아요 여기서는 정말 단순히 더한 거예요 그래서 이 써메이션이라는 오퍼레이터는 에그리게이션을 위해서 아주 다양하게 많이 쓰이는 방식입니다 사실 이게 너무 단순한 거 아니냐 그냥 정보를 단지 더한 거잖아요 라고 생각할 수 있지만 그래프 레프레젠테이션 차원에서는 좀 중요한 의미를 가지고 있는 거이기도 해요 왜냐하면 제가 뒷부분에서 간단하게 설명을 드리겠지만 이 그래프의 가장 중요한 특성 중에 하나는 퍼미테이션 인베리언스라는 게 있어요 이 수설을 섞어도 상관이 없다 그러니까 이거를 제가 막 이게 만약에 철사와 공으로 이루어진 어떤 구조물이라고 하면 이걸 막 구겨놔도 사실 상관없잖아요 이런 걸 퍼미테이션 인베리언스라고 하는데 모든 그래프가 퍼미테이션 인베리언스 한 건 아니지만 만약에 어떤 그래프가 퍼미테이션 인베리언스 하다면 이 에그리게이션 오퍼레이터도 퍼미테이션에 대해서 인베리언스, 인베리언트 해야만 해요 근데 써메이션 같은 경우에는 이게 어떤 a를 구성하는 네이버 후드들이 어떤 식으로, 어떤 식으로 배열이 되어 있었다고 해도 그냥 다 더하는 거잖아요 순서에 상관없이, 몽땅 다 더하는 거기 때문에 퍼미테이션에 대해서 인베리언트한 오퍼레이터라고 볼 수 있습니다 그래서 써메이션이 선택이 된 거고요 퍼미테이션이 굉장히 중요한 어떤 프로퍼티인 경우에는 이걸 꼭 체크를 하더라고요 대부분의 논문에서 그리고 지금 이 표현법은 이제 u, 어떤 특정 u에 대해서만 표현을 한 건데 사실 이게 모든 u에 대해, 각각의 u에 대해서 이런 식으로 표현을 할 수 있고 그 말은 다르게 말하면 여기서 우리가 weight과 bias로 표현한 이 세 가지 트레인, 트레인 업을 파라미터들이 각 노드들에 의해서 쉐어가 된다는 점입니다 그래서 a를 표현을 하든 b의 노드를 표현을 하든 결국 얘네들을 업데이트 시키는, 업데이트 시킬 때 우리가 사용하는 이 파라미터들은 다 공유되어 있습니다 그래서 좀 더 제너럴하게 표현하면 이거는 u 하나에 대해서 각 노드에 대해서만 표현을 한 표현법이잖아요 그래서 이걸 우리가 좀 더 제너럴하게 일반적인 여기에 존재하는 모든 노드들에 대해서 매트릭스로 표현을 하면 이런 식으로 표현을 할 수 있는데 이 네이버 후드를 결정을 하는 걸 보통 우리가 adjacency matrix라고 부르는 또 다른 매트릭스를 이용을 해서 표현을 합니다 굉장히 간단한데요 이 오른쪽 그림부터 한번 보시면 connected 그래프예요 그래프에 edge가 있지만 이것과 다르게 edge의 방향성이 없는 경우인데 우리가 이 그래프의 어떤 연결성, 커넥티비티를 표현을 하려는 게 이 adjacency 매트릭스입니다 v1, v2, v3, v4 이렇게 배열이 되어 있는데 v1, v2, v3, v4 이렇게 되어 있죠 그래서 v1과 v1이 만나는지 v1과 v2가 만나는지 v1과 v3가 만나는지를 0과 1만 가지고 표현을 한 거예요 그러면 우리가 v1의 로우를 봤을 때 v1은 v2와 v4하고만 연결이 되어 있구나 라는 걸 알 수 있어요 v1은 v2와 v4와 연결되어 있기 때문에 다르게 말하면 v1의 네이버 후드가 v2와 v4죠 그래서 네이버 후드를 표현, 그러니까 adjacency 매트릭스를 표현한다는 말은 네이버 후드를 표현을 한다는 말이랑 완전히 동일합니다 여기에서는 그냥 링크로 연결이 되어 있으면 1, 연결이 안 되어 있으면 0이라고 표현을 했지만 사실은 이게 좀 더 복잡해질 수 있어요 예를 들어 두 칸 건너서 연결이 되어 있으면 1이라고 한다 라고도 정의할 수 있거든요 그러면 두 칸 이내로 들어오는 k-realist 네이버 후드를 정의를 하는 데 쓰이는 방법인데 k번째의 디그리를 건너서 우리가 만날 수만 있으면 이 두 개의 노드는 만나는 거라고 한다 라고 하는 게 k-realist 네이버 후드 기법이죠 그렇게 정의를 하면 이렇게 한 칸만 떨어져 있지 않더라도 더 폭넓은 표현을 할 수 있습니다 어쨌든 그게 또 네이버 후드를 정의하는 하나의 방법이 되는 거고 그걸 대표하는 매트릭스가 adjacency 매트릭스입니다 이제 반면에 이제 디렉티드 그래프 같은 경우에는 제가 오늘 이거는 깊게 다루지 않을 거지만 어떤 방향, 그러니까 시작점과 끝점이 있기 때문에 v1에서 v4로 갈 수 있으면 우리가 1이라고 하고 이 반대 방향으로는 갈 수가 없기 때문에 v4에서 v1으로 가는 이 코디네이트는 이제 제로로 표현이 되어 있죠 이런 식으로 조금 더 다르게 표현이 됩니다 그 다음에 만약에 이 업데이트를 우리가 조금 더 다양하게 폭넓게 표현을 하고 싶다면 attention 기법을 쓰는데요 이 attention도 결국은 네이버 후드 attention입니다 이 네이버 후드에 가지고 있는 이 컴포넌트들을 우리가 aggregation을 할 때 정보들, 메시지를 우리가 합칠 때 어떤 weight을 줘서 어떤 종류의 가중치를 줘서 우리가 합칠 것이냐를 질문을 하는 방법이고요 보통 우리가 attention을 고려하지 않은 기법보다 퍼포먼스가 더 좋다고 알려져 있습니다 그래서 가장 대표적인 게 그래프 attention 네트워크죠 이 경우에는 이제 우리가 알파라고 부르는 이 weight을 이런 식으로 정의를 합니다 그 다음으로 넘어가서 제가 그래프 컨볼루셔널 네트워크를 좀 설명을 드릴게요 그래프 컨볼루셔널 네트워크를 설명하기 전에 CNN, 아주 기존에 우리가 알고 있었던 컨볼루셔널 네트워크 먼저 말씀을 드리면 우리가 CNN을 떠올릴 때 가장 대표적으로 보통 나오는 그림이죠 이제 커널이 있고 원래 우리가 가지고 있었던 feature, 매트릭스를 이 커널을 찍어가면서 우리가 새로운 feature를 계산을 하고 결국은 우리가 원하는 어떤 테스크를 수행할 수 있는지를 여부를 판단을 해서 이제 우리가 트레이닝을 시키는데요 이 방법이 동일하게 CNN에서도 쓰여요 근데 CNN과 다른 점, CNN과 이 GNN이 다른 점은 바로 여기는 이제 스페이셜 로케이션 기반이라고 한다면 여기는 노드 기반입니다 그러니까 우리가 똑같이 이렇게 커널을 곱해서 컨볼루션을 하는데 얘는 이 유클리디언 스페이스에서 가까운 애들끼리 우리가 묶어서 컨볼루션을 시키고 업데이트를 하잖아요 근데 여기에서는 스페이셜 로케이션이 중요한 게 아니고 엣지로 연결이 되어 있는, 그러니까 쉽게 말해서 네이버 후드에 있는 애들끼리만 우리가 컨볼루션을 해서 업데이트가 되는 거예요 그래서 여기서 보시면 이렇게 노드로 연결되어 있는 같은 종류의 같은 패밀리라고 여겨지는 어떤 덩어리들이 스페이셜 유클리디언 스페이스에서 가깝던 멀던 간에 얘네들 정보를 가지고 와서 컨볼루션을 시켜서 우리가 업데이트를 하는 거죠 이거 빼고는 나머지 점들은 전부 다 동일하다고 생각하시면 됩니다 그래서 이 네이버 후드는 말씀드린대로 이 엣지에 의해서 결정이 되고 정해져 있습니다 이 GCN이라고 하는 걸 그래프 컨볼루셔널 뉴럴 네트워크를 수학적으로 좀 보자면 이건 결국 네이버 후드 노멀리제이션인데요 우리가 원래 가지고 있었던 이 그래프 뉴럴 네트워크도 아주 기본적인 폼이지만 생각보다 많은 태스크들에 의해서 좋은 퍼포먼스를 보여줬었어요 그런데 이제 문제는 뭐냐면 예를 들어서 이 네이버 후드 사이즈가 노드마다 너무너무 차이가 많이 나는 거예요 어떤 노드는 네이버 후드가 예를 들어 링크라고 한다면 링크가 5개밖에 없고 그래서 네이버 후드를 구성하는 이제 엘리먼트들이 5개밖에 없고 또 바로 옆에 있는 노드는 한 천 개 만 개가 되는 거예요 그럼 이렇게 너무나 다른 애들이 피처들이 자꾸 더해지는데 노멀라이즈는 안 되면 이 값이 어떤 애는 굉장히 작고 어떤 애는 굉장히 커지기 때문에 이 스케일이 맞지 않아서 아주 언스테이블해지고 노드 디그리에 따라서 되게 센시티브해질 수 있습니다 그래서 그걸 이제 수식으로 표현한 게 이렇게 되겠죠 노드 u에 대한 어떤 네이버 후드에 피처를 다 더한 그 값이 노드 u 프라임에 대한 값보다 훨씬 더 크다 이게 훨씬 더 크기 때문에 만약에 우리가 이걸 바탕으로 뭐 로스를 계산한다고 하면 이 값이 더 커질 수가 있고 스케일 자체가 크니까요 그러면 얘에 대한 로스는 거의 무시가 될 수가 있겠죠 그래서 학습이 잘 안 되거나 아니면 정확하지 않거나 이런 결과를 가져올 수 있습니다 그래서 이 부분을 이제 노멀라이즈를 하는 건데요 노멀라이즈를 할 때 시메트릭 노멀라이저 방법을 쓰면 이게 바로 그대로 gcn이 됩니다 이제 노드의 개수로 나눠주는 거예요 노드 u 그리고 노드 v v라고 하는 거는 이제 u를 둘러싸고 있는 네이버 후드 엘리먼트거든요 그래서 걔네들의 네이버 후드 사이즈까지 고려를 해서 시메트릭하게 노멀라이즈를 한 경우입니다 그래서 이걸 우리가 수식으로 그냥 정리를 하면

이게 바로 gcn을 표현하는 어떤 업데이트 시기라고 할 수 있습니다 그래서 이 사람들이 이 페이퍼에서 똑같이 gcn을 사용을 했는데 설명을 하기를 이제 cnn은 이 유클리디언 스페이스에서의 어떤 컨솔루션이 이루어진다는 거예요 하지만 gcn은 그럴 필요가 없죠 왜냐하면 엣지로 연결이 되어만 있으면 그 엣지로 연결되어 있는 노드들을 끌어와서 컨솔루션을 하기 때문에 사실은 우리가 유클리디언 스페이스에서 보기에는 이렇게 멀리 떨어져 있지만 사실 피처 스페이스에서는 매우 가까운 애들이라는 거죠 우리가 결국 표현하고자 하는 피처 스페이스에서는 그래서 이 사람들이 gcn을 학습을 시킬 때 이 피처 스페이스에서 가까워야만 할 것 같은 애들 즉 오간이 얼마나 비슷한지를 가지고 컨솔루션을 결정해서 gcn을 학습을 시켜요 그래서 제가 이걸 보면서 들었던 의문은 혹시 우리가 위상 최적 설계를 할 때 네이버 후드를 정의를 하는 것도 이와 같이 어떤 예를 들어 센시티브, 토폴로지 센시티비티를 기준으로 네이버 후드를 결정을 해야 되는 걸까 이런 고민들을 조금 하고 있습니다 네이버 후드의 정의가 gcn을 설명을 하는 gnn의 그래프 레프레젠테이션을 설명을 하는 가장 중요한 부분 중에 하나이기 때문에 좀 깊은 생각을 해봐야 될 것 같다고 믿고 있습니다 그래서 좀 정리를 하자면 결국 gnn에서의 가장 중요한 팩터라고 한다면 네이버 후드의 정의, 네이버 후드를 정의한다는 건 결국 디스턴스를 어떻게 정의할 것이냐 그리고 다른 말로 하면 어제이센시 매트릭스를 어떻게 정의할 것이냐 전부 다 같은 말입니다 이 부분이 하나가 있고 그 다음에 두 번째는 네이버 후드가 정해졌을 때 어떻게 이걸 합칠 것이냐가 있는 것 같아요 그래서 합칠 때 우리가 attention을 사용할 수도 있고 attention이나 edge, weight을 사용할 수도 있고 결국 같은 말이죠 그리고 네이버 후드의 노멀라이제이션을 할 수도 있고 노멀라이제이션을 한다는 건 말씀드렸듯이 g 컨볼루셔널 그래프 컨볼루셔널 네트워크를 말합니다 그리고 노드의 오더링을 생각을 할 수도 있습니다 이 노드의 오더링이라는 게 노드의 순서가 있다는 뜻인데요 노드의 순서가 중요할 때가 있어요 지금 저희가 다루고 있는 이런 예제들은 노드의 순서가 중요하지 않지만 중요한 경우에는 이걸 어떻게 잘 적용을 시킬 건지를 생각을 해야 되고 오더가 중요하지 않은 경우에는 이제 퍼미테이션 인베리언스나 이퀴발런스가 이 애그리게이션 펑션에서 잘 이루어지고 있는지를 확인을 해보고 정의를 해야 한다고 생각합니다 네 그리고 마지막으로 제가 드리고 싶은 말씀은 이제 포인트 클라우드에 대한 건데요 이건 이제 간단하게 설명을 드리도록 하겠습니다 어떤 우리가 가지고 있었던 데이터에 대한 인식이 최근 몇 년간 많이 달라졌다고 생각해요 그 전에 이제 클래시컬한 시뮬레이터를 사용을 하는 기법에서는 우리가 데이터는 어떤 그리드 위에 그리드나 메쉬 위에 올라가 있는 하나하나의 피처들이고 그 그리드와 메쉬 위에서 데이터를 분석하고 해석하고 해서 대표적으로 이미지 같은 게 있는데 지금은 메쉬나 그리드가 없고 그냥 포인트들만 있는 거예요 그래서 포인트들이 어떤 공간에 뿌려져 있고 그 각 포인트들은 어떤 각각의 피처를 갖는다라고 말을 하는데 이제 대표적으로 라이다 같은 게 있죠 라이다를 혹시 모르실 분들을 위해서 간단하게 설명을 드리면 Light Detection and Ranging이라고 부르는데요 제 센싱 기법이에요 멀리서 항공사진 같은 걸 찍기 위해서 어떤 센서를 통해서 라이트를 쬐면 그 라이트가 반사되어서 올라오는 시간이나 여러 특성들을 판단을 해서 지면에 높이라던가 특성 이런 것들을 평가를 하는 게 라이다입니다 대표적으로 이런 그림 보시면 등대가 서있는 어떤 해변가에 그림을 그린 것 같은데요 흑백으로 표현되어 있지만 집이라던가 어떤 건물 그리고 집안이 무너지진 않았는지 집안의 이런 높이들이 어떻게 되는지 평가를 할 수가 있죠 또 다른 각도에서 찍은 동일한 모습입니다 또 다른 그림은 이런 식의 그림도 그릴 수 있는데요 이제 칼라로 각 노트 포인트들이 가지고 있는 피처들이 표현이 된 거죠 그래서 이 라이다가 보여주는 그림은 그리드가 없고 퍼뮤테이션 인베리언트하고 그리고 각 포인트들은 피처를 표현을 하고 있습니다 이런 특징들이 있죠 그래서 그 전에는 옛날에는 클래식 클라우드 이렇게 포인트들이 잔뜩 쌓여있는 어떤 데이터를 어떻게 해석할 것이냐를 고민을 할 때 아주 클래식한 방법은 정말 옛날 방법인데 복셀라이즈를 시킵니다 그러니까 이 주변에 아주 아주 파인한 메시들을 다 쳐서 얘는 여기 안에 이 메시 안에는 포인트가 들어가 있다 이 메시 안에는 포인트가 없다 이걸 0,1 같은 걸로 표현을 해서 혹은 이 피처로 표현을 해서 복셀라이즈를 시키는 거죠 그래서 이제 컨볼루셔널 뉴럴 레토크를 쓰거나 하는 방법인데 보시면 아시겠지만 굉장히 복셀라이즈된 결과가 스팟스합니다 이 의자 그림만 봐도 저희가 만약 이 주변 테두리에 이렇게 큰 끝박스를 친다고 하면 이 발과 엉덩이가 앉는 부분 등받이 이런 부분을 제외하면 전부 다 제로로 가득 차야 되거든요 그리고 포인트들이 어떤 일정 부분에서 아주 촘촘하면 메시를 굉장히 파인하게 쳐야 되기 때문에 매우 매우 데이터를 표현하는 게 비효율적이 될 수 있습니다 그래서 나온 게 가장 유명한 게 포인트넷이죠 포인트넷 같은 경우에는 클래시피케이션, 세그멘테이션 전부 다 잘 된다고 하지만 결국은 어떤 거냐면 이 포인트들이 가지고 있는 피처를 받아서 그 피처를 이제 멀티레이어 퍼셉트럼을 가지고 MLP를 가지고 해석을 한 다음에 적당히 풀링하고 글로벌 피처와 로컬 피처를 합쳐서 파이널 아웃풋을 표현할 수 있는 스코어를 매겨서 그걸 바탕으로 학습을 시키는 그런 방법인데요 가장 제가 중요하다고 생각하는 파트들은 제가 빨간색으로 표현한 부분들인 것 같아요 일단 피처가 N은 포인트의 개수를 의미하고 3은 피처의 개수를 의미합니다 이 포인트넷에서는 이 데이터의 피처를 유클리디언 코디네이트로 결정을 했어요 XYZ의 자표이기 때문에 이제 3개만 들어간 거고 사람에 따라서는 이거를 코디네이트가 아닌 다른 어떤 정보를 이용을 할 수도 있겠죠 이렇게 피처가 들어가면 MLP 레이어를 여러 번 통과해서 풀링을 통해서 글로벌 피처를 뽑아내는데 제가 여기서 강조를 해서 말씀드리고 싶은 건 피처 넷에서도 포인트의 정보를 잘 학습을 시키기 위해서는 로컬한 것과 글로벌한 것이 적당히 잘 섞여야 된다는 걸 이해를 했던 것 같아요 그러니까 만약에 세그멘테이션을 하고 싶다면 로컬하게 얘네들이 같은 덩어리라는 것을 포인트들이 인식을 할 수 있어야 되고 글로벌하게는 얘가 이 의자이기 때문에 의자의 발, 의자의 앉는 부분, 의자의 등받이 이런 식으로 몇 개의 구성으로 이루어져야 한다는 것을 이렇게 글로벌하게도 이해를 할 수가 있어야 되잖아요 그래서 이 로컬한 피처와 글로벌한 피처를 합쳐야 되기 때문에 이 사람들이 여기에서 얻었던 이 로컬 피처를 가지고 오고 이 맥스 풀링을 통해서 얻었던 글로벌 피처를 가지고 와서 이걸 합쳐서 그러니까 그냥 단순히 붙여서 몇 번의 MLP를 더 통과시킨 다음에 새로운 포인트, 그러니까 로컬 피처를 또 뽑아 냅니다 그래서 로컬 피처를 업데이트를 시키는 거죠 그래서 이제 로컬 피처와 글로벌 피처를 같이 고려를 할 수 있는 그런 네트워크를 만들었다라고 표현을 하고 있어요 그래서 로컬 지오메트리와 글로벌 시멘틱을 같이 가지고 왔다라고 말을 하지만 그래프 뉴럴 네트워크를 포인트 클라우드에 적용하는 입장에서는 많이 부족한 것처럼 보일 것 같아요 그 포인트 클라우드는 이미 그래프의 스트럭처를 가지고 있다고 봐야 합니다 사실 이 사람들도 그걸 이해는 하고 있었어요 여기에 적용을 좀 더 적극적으로 시키지는 못했지만 무슨 말이냐면 이런 그래프를 인플리틱 그래프 아니면 레이턴트 그래프라고 보통 표현을 하는데 우리가 이렇게 포인트들의 구성으로만 보지만 사실 사람이 딱 보면 이건 사람이다 라고

알 수 있잖아요 그 이유는 이거를 아주 로컬하게 포인트들의 집합으로만 보지 않고 전체적인 모양을 보기 때문이에요 아 여긴 머리구나, 여기는 팔이구나, 여기는 다리구나, 여기는 복부구나 이런 거를 아는 건데 그래서 사람은 자연스럽게 이 그래프의 연결성에 대해서 생각을 하고 있는 거죠 그래서 이 포인트 클라우드, 포인트들의 집합이 있지만 사실은 여러 개의 노드와 그래프를 이용을 해서 이미 인식을 하고 있다는 거예요 이 시멘틱에 대한 이해를 하고 있다는 거죠 그래서 포인트 클라우드는 이미 그래프 스트럭처를 내재하고 있고 이거를 바탕으로 우리가 생각을 하는 게 GNN입니다 GNN을 이용해서 포인트 클라우드를 해석을 하는 거죠 그래서 포인트넷은 GNN에 비하면 조금 더 훨씬 더 로컬한 정보에 집중을 하고 있다고 볼 수 있어요 그래서 포인트넷과 기존의 포인트넷과 그래프 러닝을 적용시킨 포인트 클라우드 기법을 생각을 해봤을 때는 차이점은 이거 하나밖에 없습니다 그래프를 이용을 하면 포인트 클라우드를 산재되어 있는 포인트 클라우드를 그래프로 먼저 합치고 거기에서 이제 GNN 같은 걸 써서 동일한 포인트넷과 동일한 어떤 태스크를 하도록 학습을 시키는 건데요 이 포인트 클라우드를 그래프로 바꾸겠다라고 하는 거는 사실은 매니폴드 러닝이랑 거의 개념이 유사합니다 그러니까 더 적은 차원의 스페이스로 리덕션을 시키는 거죠 그래서 디멘션 리덕션이랑도 관련이 깊고 왜냐하면 이게 원래는 다 하나하나 각각이 다 다른 점들이었는데 그거를 크게 5차원의, 6차원인가요?

6차원의 어떤 스페이스로 일종의 임베딩을 이미 시킨 거예요 그래서 디멘션 리덕션이 이루어지고 그 리덕션을 바탕으로 GNN이 이루어진 거죠 그리고 반면에 이제 포인트 넷은 네이버나 어떤 커넥션, 엣지 같은 정보들은 고려를 하지 않습니다 여기서 제가 완전히 이그노어라는 표현을 써도 되는지는 잘 모르겠어요 왜냐하면 포인트 클라우드에서도 앞서 말씀드린 것처럼 이제 글로벌 피처를 고려하려고 노력을, 아니 로컬 피처를 고려하려고 노력을 했기 때문에 어떤 로컬한 네이버 후드를 생각하지 않았다고 말을 할 수는 없겠지만 이 네이버 후드들 간의 커넥션과 엣지를 통한 어떤 교류를 고려하지는 않았죠 그래서 이제 포인트 클라우드를 바탕으로 우리가 그래프를 구성하는 방법을 좀 생각을 해볼 건데요 방금 말씀드린 것을 이제 그림으로 좀 표현한다면 포인트 클라우드 같은 경우에는 아주 정교화된 격자 무늬 위에서 정보를 해석을 하는 거고 포인트 넷은 각각의 포인트들을 전부 다 따로따로 그냥 셋의 어떤 덩어리들로만 생각을 합니다 반면에 그래프 뉴럴 네트워크는 그러니까 포인트 넷을 위한 그래프 뉴럴 네트워크 말고 그냥 일반적인 그래프 뉴럴 네트워크는 점과 점 사이의 엣지를 통해서 얘네들이 연결되어 있는지 안 되어 있는지를 평가하는 모델이죠 그래서 이 포인트 클라우드와 GNN을 엮는다면 저는 이 그림이 되게 좋아서 가지고 온 건데 예를 들면 이런 식이 되는 거예요 이렇게 포인트 넷처럼 포인트들의 디스트리비션이 있고 이 포인트들을 네이버 후드를 통해서 엮으면 이 각각이 하나하나의 노드로 연결이 되는 거죠 앞에서 보여드린 이런 것처럼 머리 부분에 있는 포인트들은 머리를 의미하는 노드로 리덕션이 되고 복부에 존재하는 포인트들은 복부를 대표하는 노드로 리덕션이 되고 그래서 리덕션 과정이 하나씩 더 생기는 거예요 일반적인 포인트 넷이랑 비교를 해봤을 때 그래서 우리가 원래 최종적으로 원하는 태스크를 할 때 그냥 벌크로 존재하는 포인트를 가지고 하는 게 아니라 한번 리덕션을 시킨 다음에 리덕션 된 스페이스에서 해석을 하겠다라고 하는 게 저는 포인트 GNN이라고 생각합니다 또 다른 기법이 있어서 가지고 왔는데요 이거는 그래프 포인트 클라우드를 위한 GNN 기법인데 엣지 컨볼루션을 쓰는 것 때문에 각광을 많이 받았기 때문에 제가 가지고 왔습니다 앞서 말씀드렸듯이 그 GN, GCN 그러니까 그래프 컨볼루션을 뉴럴 네트워크는 노드를 바탕으로 컨볼루션을 하는 걸 말씀을 드렸어요 유클리디언 스페이스에서 가까이 있는 노드들을 가지고 오는 게 아니라 엣지로 연결되어 있는 노드들을 끌어다가 컨볼루션을 한다 그래서 이걸 노드 컨볼루션이라고 제가 부르고 있는데요 이거 말고 이거 대비되는 게 엣지 컨볼루션입니다 그래서 여기에서는 노드에 대한 컨볼루션을 했다면 이번에 엣지에 대한 컨볼루션을 하겠다는 거죠 그래서 여기 마찬가지로 이렇게 노드들이 존재를 하고 이 사이에 엣지들이 있었는데 이 논문에서 같은 경우에는 엣지는 다른 별다른 뭔가를 하진 않았어요 트리트먼트를 들어가진 않았는데 여기에서는 이 엣지를, 엣지의 어떤 피처를 따로 주고 엣지의 피처들끼리도 컨볼루션이 가능하도록 구성을 했습니다 그래서 노드의 피처는 그 포인트넷과 마찬가지로 이 x, y로 표현되는 노드의 피처는 x, y, z의 좌표, 코디네이트가 되고요 이 엣지의 피처는 e, i, j라고 하는데 뭔지는 모르겠지만 이 노드의 피처, 코디네이트 정보 i라는 코디네이트와 j라는 네이버 후드의 정보를 가지고 와서 뭔가를 하겠다 라고 설명을 하고 있습니다 그래서 앞서 말씀드린 것처럼 이제 에그리게이션이 중요하다고 했는데 어떻게 그럼 이 노드를 업데이트를 시킬 건가를 가장 제너럴하게 써보자면 이런 식으로 쓸 수 있다고 이 논문에서는 설명하고 있어요 이 엣지 컨볼루션을, 엣지들의 피처들을 h 세타가 e거든요, 엣지의 피처인데 이 엣지의 피처들을 잘 모아서 노드에 적용을 하겠다는 거죠, 이 엣지들이 가지고 있는 어떤 피처들이 노드에 영향을 주는 거예요 그래서 이게 만약에 포인트넷이 된다면 이 엣지의 피처들이 뭔지는 모르겠지만 이 x, i에 의해서만 결정이 됩니다 이게 무슨 말이냐면 x, j는 네이버 후드들의 포인트들이고요 x, i는 이 센터 포인트를 의미하거든요 여기에서 보이는 것처럼, 이 센터 포인트와 이 주변부 네이버 후드들의 정보를 같이 가지고 원래 엣지 피처를 하려고 했는데 포인트넷 같은 경우에는 이 엣지들은 생각을 안 하는 거예요 왜냐면 포인트넷은 엣지 자체가 없거든요 사실 그래서 이 링크가 전혀 연결되어 있지 않은 거기 때문에 자기 자신만을 가지고 어떤 성질을 결정을 하고 그 성질이 이제 그 다음 스텝으로 업데이트가 되는 거죠 근데 반면에 dgCNN, 이 다이나믹 그래프 CNN이라고 부르는데 이 dgCNN 같은 경우에는 뭔지는 모르겠지만 어떤 펑션을 가지고 올 건데 이 펑션은 x, i 이 센터에 있는 자기 자신과 그리고 주변부의 영향을 받을 건데 이 주변부의 영향을 이제 마이너스라는 오퍼레이터를 통해서 받습니다 그거는 무슨 말이냐면 x, i가 이제 코디네이트였잖아요 코디네이트의 거리를 가지고 하겠다는 거예요 얘가 얼마나 가까운지, 먼지 예를 들어 멀리 있는 애들은 별로 중요하지 않을 수도 있죠 가까운 애들을 더 중요하게 생각할 수도 있기 때문에 그런 예를 들어 아까 말씀드렸던 이 시티 영상 같은 경우에는 스페이셜 로케이션이 유클리디언 스페이셜 로케이션이 정말 중요하지 않아요 하지만 너무 앞으로 돌아가야 되겠네요 아까처럼 의자의 구성 성분을 파악해야 되거나 하면 가까이 있는 애들이 더 중요할 가능성이 높죠 특히 세그멘테이션 문제 같은 경우에는요 그래서 주변부에 있는 네이버 후드 포인트들의 거리를 측정해서 그 거리에도 영향을 받도록 이 h 펑션, 그 edge 피처를 결정할 수 있습니다 그래서 구체적으로는 자기들이 최종적으로 선택한 이 edge 피처는 이런 식으로 결정이 되는데요 렐루 펑션이 들어가고 이 디스턴스의 어떤 값을 곱하고 자기 자신에도 어떤 값을 곱해서 이 세타와 피 같은 경우는 전부 다 우리가 학습을 해야 되는 파라미터들입니다 그리고 나면 얘를 어떤 식의 오퍼레이터를 써서 업데이트를 시켜야 되는데 말씀드린 것처럼 에그리게이션 펑션은 퍼뮈테이션 인베리언트 해야 되기 때문에 이 문제 같은 포인트 클라우드 같은 경우에는 퍼뮈테이션 인베리언트 해야 되기 때문에 보통 맥스 아니면 에버리지, 서메이션 이런 오퍼레이터들을 써요 근데 여기에서는 맥스라는 오퍼레이터를 썼습니다 이렇게 정의가 되고요 제가 여기에서 그림을 가져오진 않았지만 이 다이나믹 그래프 CNN이 다이나믹하다라고 불리는 이유는 레이어를 통과를 하면서 이 노드의 피처가 달라지잖아요 이 노드의 피처를 바탕으로 그래프를 다시 짜요 그래서 원래 연결되어 있던 엣지들을 무시하고 새로 엣지를 구성을 하는 거죠 레이어를 통과할 때마다 그렇기 때문에 엣지의 연결, 노드 간의 연결성이 레이어를 통과할 때 계속 달라지기 때문에 이걸 다이나믹하다고 표현해서 다이나믹 그래프 CNN이라고 표현합니다 그래서 DGCNN 이라고 불리고요 굉장히 많이 주목을 받고 있는, 주목을 받아온 그런 메소드입니다 그래서 결과만 간단히 보여드리면 보시면 포인트 클라우드를 가지고 엣지 컨볼루션을 통해서 레이어 1, 또 다른 레이어 2, 또 다른 레이어 3 이렇게 해서 최종 결과가, 세그멘테이션 결과가 나오는 그림들인데 이 빨간 점이 우리가 지금 관심 있어 하는 어떤 포인트라면 이 포인트들 주변으로 세그멘테이션이 이루어지는 게 보이시죠 그래서 얘가 날개에 있기 때문에 날개의 포인트들을 이렇게 가지고 와서 학습이 되는 그런 모습입니다 이 윗부분 같은 경우에는 엔진 쪽에 이 빨간 포인트가 있는데 그 엔진 주변으로 이렇게 노란색 점들이 모이는 게 보이고 이 위에는 본체를 주변으로, 가운데 중심부 본체를 중심으로 포인트들이 모이는 걸 보실 수 있습니다 그래서 이 사람들의 DGCNN 기법과 포인트넷을 그라운드 트로스랑 비교를 해보면 이런 정도의 차이가 있는데요 예를 들어 이 그림 같은 경우에는 이게 무슨 그림인지 정확히 모르겠지만 이렇게 얘는 초록색으로 아예 다른 세그멘테이션을 보여주는 것들이 있어요 이게 사실 인간의 입장에서 봤을 때는 되게 이상한 분류기는 하죠 왜냐면 얘네들은 위치상으로도 굉장히 가깝고 이 갈색 포인트들과 위치상으로도 가깝고 동일한 클래시피케이션을 보여줘야 될 것 같은데 얘가 다른 결과를 보여주고 있죠 그래서 제 생각에는 이 포인트넷은 확실히 DGCNN이나 그래프 기반으로 한 메소드들에 비해서는 훨씬 더 로컬한 성향이 강합니다 밑에서도 마찬가지고 이런 그림에서도 보실 수 있죠 여기에서 초록색 포인트들 사이로 완전히 다른 종류의 갈색 포인트들이 보이는 걸 보실 수 있죠 밑바닥은 그렇다고 쳐도 여기 중간에 생뚱맞게 이렇게 갈색 포인트들이 나온 거는 로컬한 성질이 너무 강조돼서 그런 게 아닐까 싶습니다

그래서 제가 준비한 내용은 여기까지고요 열심히 들어주셔서 감사합니다 질문이 있다면 얼마든지 주세요 수고 많으셨습니다 감사합니다 역시 약간 설명하시는 게 일타 강사 같아요 무슨 말씀?

설명을 굉장히 잘해주셨고 포인트 클라우드, DGCNN 쪽이 저도 잘 모르지만 같이 삽질을 하면서 배워가면서 하고 있는데 되게 이론적으로 정리를 잘 해주신 것 같습니다 감사합니다 질문 같은 거 앞에 들으시는 분들 질문 올려주시면 감사하겠고요 오늘 보니까 이렇게 공부하겠다고 하니까 많이 들어오시네요 동적 기준으로 50명 넘게 들어왔는데 역시 이론 중심으로 강의를 다시 재편해야 하나 일단은 질문들 먼저 올려드리겠습니다 질문 보이시나요?

아니요, 안 보입니다 뮤트가 오신 것 같은데 안 들리죠?

잠깐만요 들리시나요?

실제 문제일까?

휘서님 들리세요?

저는 들립니다 답변 가능할까요?

네 어떤 구조가 들어가서 열 효율 수치가 나오는...

사실 그렇지 않습니다 이게 어떤 구조가 들어가서 열 효율 수치가 나오는 계산 과정을 만약에 딥러닝으로 짠다면 열 효율 수치를 얻기 위한 서러게 모델링을 하는 것 같거든요 그거는 아니고 이거는 사실 목표로 하는 문제에 따라 많이 다를 것 같은데요 저희는 열 효율 수치를 최소화할 수 있는 토폴로지를 만들려고 하는 게 아니라 이미 토폴로지는 기존의 솔버로 계산이 결과가 다 되어 있고 최종 토폴로지에 대한 레퍼런스 데이터를 레퍼런스 덴시티를 가지고 있습니다 그 덴시티와 딥러닝을 통해서 나온 덴시티가 얼마나 유사한지를 비교를 해서 저희가 옵티마이즈를 했습니다 답변이 되실까요?

저는 약간 제가 생각할 때는 저도 예전에 제가 생각한 게 맞다 보면 궁금한 게 뭐냐면 저런 어떤 구조들이 되게 잘 모르는 대로 복잡하잖아요 복잡하고 중간에서 그냥 우리 옛날에 CNN 했던 것보다 더 복잡하고 오프라이션도 많이 들어가는데 그런 것들이 그냥 파이썬에서 우리가 뭐 그냥 기본적인 오프라이트 쓰듯이 쓰면 안 되잖아요 안 되고 텐서플로우 안에 있는 연산자 텐서 연산하던 것 쓰든지 아니면 파이토치를 쓰면 조금 자유로운 것 같은데 저도 잘 모를 때는 이런 게 좀 궁금하더라고요 복잡하게 생겨 있는데 이게 다 텐서플로우 그래프 안에서 이제 돼야 되는 건지 이게 일부는 그래프에서 돌아가고 일부는 CPU에서 돌아가고 왔다 갔다 하면서 계산되는 건지 그런 질문이 아니었나 라는 생각이 듭니다 아...

아닌가?

아 그럴 수도 있겠네요 저희가 일단은 이렇게 하지는 않았지만 이렇게 하면 그래프가 너무 복잡해져서 사실 학습이 잘 안 될 것 같긴 합니다 제가 사실은 이렇게 해보기는 했었거든요 이 열 효율 수치 자체를 딥러닝을 통해서 나오도록 텐서플로우, 그러니까 텐서들의 그래프를 이용을 해서 제가 코딩을 해본 적이 있었는데 안에가 이제 내부가 너무 복잡해서 그런 건지는 모르겠지만 학습이 거의 이루어지질 않더라고요 사실 코딩하는 것 자체는 만약에 그 토폴로즈 옵티미세이션을 잘 이해를 하고 있다면 그냥 FAM이거든요 그래서 그 어떤 프로세스 자체는 그렇게까지 복잡하지는 않아요 근데 학습이 잘 되느냐가 오히려 문제인 것 같습니다 경험적으로 봤을 때는 파이토 칩을 쓰면 이런 게 조금 크게 고민 안 해도 되는 것 같아요 지금 되게 이런 거 뭔가 좀 자유로운 것 같고 텐서로 쓰면 뭔가 새로운 거 중간에 뭔가 커스터마이징해서 뭔가 만들려고 했을 때 좀 막힌다?

네 그런 느낌이 좀 드는 것 같습니다 맞아요 지금 남윤덕 님이시죠 GNN의 장점이 뭘까요?

답변 가능하실까요?

잠시만요 어느 부분이 비슷한가를 이건 죄송한데 제가 트랜스포머를 잘 이해를 못하고 있어서 답변이 어려울 것 같습니다 트랜스포머 대비해서 GCNN의 장점을 여쭤보시는 것 같은데요 네 죄송합니다 이거는 제가 답변을 못 드릴 것 같아요 근데 어느 부분이 비슷한가를 미리 알기는 해야 합니다 트랜스포머는 그걸 몰라도 할 수가 있나요?

트랜스포머는 그거 자체를 배워보자고 하는 개념이니까 이게 예를 들어서 우리가 노드를 뿌려놓고 엣지를 안 준 상태에서 어떤 데이터의 관계를 가지고 엣지를 찾아본다든지 아니면 그런게 어테이션 형태로 나올 수도 있겠죠 그래서 글쎄요 근데 트랜스포머는 데이터가 아주 많으면 가능하겠죠 많으면 가능한데 이게 일종의 우리가 어떤 프라이언 알리지를 이용하는 거잖아요 그러니까 이런 데이터들은 관계가 있다 내가 이 사람하고 저 사람하고 친한 거는 예를 들어서 페이스북 친구다 그러면 그게 일촌이다 이런게 친한 거잖아요 그런 것처럼 예를 들어서 어떤 관계를 정의할 때 우리의 가정이 들어가는 거죠 사전에 가정이 들어가면 가정이 많이 들어가면 많이 들어갈수록 좀 적은 데이터라도 모델링을 할 수 있는 거고 우리가 전혀 그런 가정을 모른다고 가정을 넣지 않고 그걸 가능한 데이터를 많이 집어넣어서 그 관계를 찾는다 그러면 그런 것들이 트랜스포머류의 방법이 될 것 같습니다

그래서 아마 모르겠어요 저도 이게 완전히 GNN을 트랜스포머로 완전히 대체할 수 있는지는 잘 모르겠는데 아마 데이터가 많으면 가능할 것 같습니다 가능할 것도 같고요 이렇게 컴퓨터에서 인베리언스가 보존되어야 하는 그래프가 아닌 그래프 예를 좀 들어주실 수 있으신가요?

사실 이거는 디파인하기 나름이긴 한데요 예를 들어서 소셜 네트워킹 같은 경우에는 인베리언스가 보통은 보존된다고 가정을 하고 있습니다

그러니까 순서는 상관없죠 제가 알고 있는 사람이 ABC가 있다고 했을 때 ABC를 알고 있다 혹은 CBA를 알고 있다 BCA를 알고 있다라는 게 상관이 없잖아요 이런 식으로 링크가 링크의 순서가 상관이 없을 때 우리가 퍼미테이션 인베리언스가 보존된다고 말을 하거든요 저와 연결되어 있는 링크가 다시 말씀드리면 ABC를 알고 있는데 ABC를 알고 있다 혹은 CAB를 알고 있다 BCA를 알고 있다 라고 하는 게 전부 다 같은 말이죠 그러니까 안다 모른다만 중요한 거니까요 근데 예를 들어 우리가 바이올로지 같은 경우에는 직계를 따질 때가 있거든요 할아버지 밑에 아버지가 있고 밑에 또 다른 자손이 있고 할 때는 순서가 오더링이 중요하죠 그럴 때는 어떤 순서 다음에 그 다음 순서가 나오고 그러니까 엣지에 방향성이 있다고 생각하시면 될 것 같습니다 그럴 때는 오더가 매우 중요해지기 때문에 퍼미테이션 인베리언스가 인베리언트 하면 안 되죠 예를 들어서 페이스북 신고를 누구를 먼저 맺었느냐, 누가 먼저 신고가 됐느냐 이런 거를 정리할 수 있을까요?

네, 그럴 수 있습니다.

그게 똑같은 소셜 그래프이긴 하지만 관심 있는 분야가 다르기 때문에 순서가 중요해지니까 오더링을 줄 수 있죠 순서로 하거나 아니면 피쳐로도 줄 수 있을 것 같은데 가능할 것 같네요 이거는 제가 어떤 거기 끝에 말씀해 주신 것 같은데 이게 어떤 장표에 대해서 질문하신 건지 잠깐 놓쳤거든요 혹시 답변 가능하실까요?

제가 질문이 무슨 말씀인지 모르겠어요 코난 쌤님 어느 부분에 대해서 코멘트해 주신 건지 설명해 주시면 감사하겠습니다 일단 넘어가고요 포인트 클라우드 이용한 GNN 컨토 파일 조회감이 잘 되나요?

보통 기존의 포인트 넷이나 다른 기법들이랑 비교했을 때 사실 포인트 넷도 잘 되거든요 예를 들면 이런 식입니다.

포인트 넷이 89% 정도의 에크로시를 보인다면 GNN은 거기서 한 4, 5% 정도 더 향상되는 그런 경우들이 많아요 제가 수치 결과도 가져올 걸 그랬네요 보통은 향상되긴 하고 하는데 떨어지는 경우도 있긴 합니다.

논문들에서도 그런 경우도 같이 보여주고 있고요 근데 최소한 GNN이 더 안 된다는 경우는 많이 못 본 것 같아요 그래프를 적용시켰을 때는 일반적으로는 향상이 되는 것처럼 보입니다 보면 이제 포인트 클라우드 쪽에서 사실 딥러닝 제대로 적용 시작한 게 포인트 넷이잖아요.

이게 벌써 2016년, 2017년 이때 나온 거고 그거 이후에 중간에 포인트 넷 뿔뿔이라는 게 있어요 플러스 플러스 포인트 넷 플러스 플러스는 거기다가 약간 CNN 개념이 들어가서 이거 GNN은 아닌데 전체를 가지고 계산하는 게 아니라 가까이 있는 것끼리 그룹핑해서 CNN 개념처럼 우리가 포인트 클라우드를 그룹핑해서 거기서 피쳐를 뽑아서 다시 서브로 어떤 피쳐맵을 만들고 또 한다 이렇게 하는 방식인데 그거 하면서 성능이 좋아지고 그래서 페이퍼 위드 코드 이런 데 들어가서 포인트 클라우드로 크리스티케이션이나 커멘테이션 성능들 벤치마크 보면 이렇게 GNN 기반으로 하는 것들이 다 소타를 쓰고 있더라고요 저도 이게 왜 굳이 잘 있는 포인트 클라우드를 가지고 억지로 그래프로 만들어서 문제를 풀면 잘 풀리는지는 잘 모르겠어요 왜 잘 풀리는지는 모르겠고, 이게 이런 것들이 저도 포인트 클라우드뿐만 아니라 어디더라 약간 다른 분들, 화학 쪽에 세미나 하는 경우에서도 이렇게 푸는 거를 봤었는데 처음에는 억지로 그래프 만들어서 GNN 써서 푸는 게 좀 이상하다고 생각했거든요.

왜냐하면 이 데이터 자체는 그냥 이게 셋이잖아요.

셋.

요소에 관련 없는 데이터의 셋이기 때문에 이걸 그대로 놓고 푸는 게 뭔가 더 아름다운 거가 아닐까 생각했는데 이제 하여튼 성능은 지금 이걸 그래프를 만들어가지고 GNN 적용하는 게 성능이 좋고 이걸 가지고 세그메이테이션도 잘 되는 것 같습니다.

그래서 저희도 이거를 세그메이테이션, 일종의 저희가 푸는 문제가 세그메이테이션 문제가 비슷하거든요.

그걸 기존에 GCN 이런 거 적용했을 때는 거의 문제가 풀리지 않았었는데 잘 풀리는 것 같습니다.

어느 정도 네 또 부연 설명 또 하시는 거 아니겠습니까?

아닙니다.

방향성과 오더링 네 같은 말입니다.

보통 같은 말로 쓰인다고 저는 생각합니다.

그리고 디지 CNN에서 거리 함수 사실 이 사람들이 아주 일반적으로 표현해 놓은 시계는 방향성이 고려가 될 수도 있을 것처럼 써놓기는 했는데요.

최종적으로 쓴 시계는 여기에다 절대값을 씌우거든요.

그래서 XI-XJ의 절대값을 씌우기 때문에 방향성이 고려가 안 되도록 되어 있습니다.

네.

그 디지 CNN 저희가 조금 가져와 쓰는 이유 중에 하나가 저희가 처음에 그래프 컴포를루션 네트워크 같은 경우는 노드에 물리적인 좌표 정보를 쓰지 않잖아요.

공간적인 정보를 전혀 사용하지 않고 커넥티비티 정보만 사용하고 있고 저희가 생각할 때 그 반대편에 있는 게 포인트 클라우드라고 생각해요.

포인트 클라우드는 반대로 노드 사이의 연결과 관계는 없는데 공간성의 좌표 정보만 있죠.

그런데 그거를 두 개를 같이 연계해서 쓰는 그게 저희가 필요한 분야였고 왜냐하면 메시지 정보라는 것은 연결성도 있고 노드 사이의 좌표도 주어지기 때문에 그 두 개의 정보를 다 이용해야 되는 거고 그때 그런 거를 푸는 문제들이 디지 CNN 같은 애체 컴포를루션 루에 네트워크 드린 것 같습니다.

그래서 이런 걸 쓰면 이런 그래프 문제에서도 세븐 메니테이션 이런 문제들이 잘 풀리는 것 같아요.

저희도 가져와 쓰는 정도라 잘 모릅니다.

야, 외르데시 수가 더 됐죠.

저는 잘 모릅니다.

이런 거.

수학 전공자이시니까.

외르데시 수가 뭐예요?

그러면 넘어가도록 하겠습니다.

에어디시에서 말씀하시는 건가요?

저는 몰라요.

빨리 넘어가야죠.

자, 그리고 이제 호거님 감사합니다.

이 얘기 쉽게 설명해 주셔서 감사합니다.

호거님도 지금 또 여기 원자력에서 포인트 클라우드 잘 다루고 계시죠?

다루고 있고, 그래서 이런 좀 사실 겹치네요.

겹친 부분이 있고 같이 이제 회사님하고 코옥해서 좋은 연구... 호거님께서 훨씬 잘하십니다.

포인트 넷이 같잖아.

그래프, 제니 써서 하는 게 다 잘 되고 있으니까.

좀 그런 것 같긴 합니다.

그 다음에 DGCN에 적용하면 요거 보자.

DGCN에는 그런 문제는 아닌 거 아닌가요?

네.

Adjacency Matrix가 달라지지는 않고요.

Edge, 그니까 기존에 그냥 GCNN의 경우에는 Edge에 대한 컨볼루션을 하지는 않아요.

DGCN 같은 경우에는 Edge에도 피처를 주고 그 피처들끼리도 컨볼루션이 가능하도록 노드 컨볼루션을 하죠.

그래서 그 피처들끼리도 컨볼루션을 하죠.

그 피처들끼리도 컨볼루션이 가능하도록 노드 컨볼루션과 Edge 컨볼루션이 같이 이루어지는 거죠.

저희도 제가 이야기로 그래프 컨볼루셔널 네트워크가 예를 들어서 Adjacency Network로 연결된 어떤 노드에서 정보들은 똑같은 네트워크를 통해서 우리가 계산을 어그리게이션 하잖아요.

계산한 다음에.

그렇게 되기 때문에 그래서 엄밀히 얘기해서 우리가 CNN하고 그래프 컨볼루셔널 네트워크하고는 사실은 동치가 아니다.

동치가 될 수가 없는 거죠.

우리가 이제 CNN하고 GCN하고가 동치가 되려면 GCN이 내가 어느 데이터에서 오느냐에 따라서 웨이트를 다 다르게 줄 수가 있어야지 이게 CNN을 그대로 대체할 수 있는 건데 현재 GCN 같은 경우는 그런 구조가 아니거든요.

그래서 이게 약간 그런 것 자체도 또 웨이트로 학습하고 배울 수 있는 형태가 이제 뭐 DCN의 Edge Convolution류의 방목론인 것 같습니다.

이런 얘기 하다가 틀리면 안 되는데 하하하하하 음 어 아닙니다.

Edge가 바뀐다는 게 Edge가 노드와 노드의 커넥션이거든요.

그래서 Edge가 바뀐다는 건 노드와 노드의 커넥션이 아 Edge의 피처가 바뀌는 것 아 아 아 음 아까 예를 들어 FEM Mesh로 생각을 해보시면 FEM Mesh는 동일하게 이렇게 뭐 예를 들어 Edge 그 엘리먼트들 간에 커넥티비티가 바뀌지는 않잖아요.

계속 고정이 되어 있는데 네이버 후드를 정의를 하는 게 달라질 수 있어요.

근데 그 네이버 후드의 정의가 달라진다는 의미로 생각하시면 됩니다.

제가 그래프를 바꾼다고 하는 게.

그러면 예를 들어 네이버 후드 1만큼 네이버 후드 1 사이즈 안에 들어오는 것만 네이버 후드라고 생각하겠다라고 하면 되게 그래프들이 작게 작게만 이렇게 연결이 되어 있겠죠.

근데 예를 들어서 만약에 네이버 후드 사이즈가 2만큼 2 안에 들어오는 애들까지 전부 다 네이버 후드로 생각을 하겠다라고 한다면 노드들 간의 커넥션이 훨씬 더 복잡해지거든요.

그래서 또 다른 종류의 그래프가 되는 거죠.

이해가 되셨을까요?

단지 Edge의 피처가 바뀌는 것은 아니고요.

네이버 후드의 개념이, 네이버 후드의 정의가 달라지는 겁니다.

아까 저도 잠깐 약간 놓쳤다는 것 같은데 아까 이런 Edge 그래프 자체를 매번 새로 배운다?

그게 어떤 네트워크였죠? DGCNN입니다

.

그래프 어두워진 네트릭스 자체가 계속 달라지는 게 있었잖아요.

그게 DGCNN인가요?

그렇죠.

그런가요?

나도 헷갈리는데.

그러니까 DGCNN이 레이어를 통과할 때 그 그래프의 연결성이 달라지거든요.

그러니까 레이어 한층 통과하면 달라지고 저희가 맨 처음에 인풋에서 넣어주는 어제슨시 메이트릭스는 똑같은데 내부적으로 그래프를 다시 구성해서 그 다음 레이어로 넘기고 넘기고 해서 다이나믹하다고 이름을 붙였더라고요.

그렇죠.

알겠습니다.

감사합니다.

페르미님 복소공간으로 확정 그래프 복소공간으로 확정이 가능하다는 복소공간으로 정의를 할 수는 있을 것 같은데요.

죄송하지만 질문이 어떤 말씀이신지 다시 좀 더 구체적으로 말씀해 주실 수 있을까요?

네.

그러면 질문 다시 올려드리면 제가 다시 올려드리겠습니다.

예전에 보니까 뉴럴 네트워크인데 우리가 이게 웨이트 자체를 복소수로 정의해가지고 보는 것도 본 적이 있는 것 같아요.

복소수를 네트워크 자체가 복소수에 대해 알 수 있게 그런 것도 본 적이 있는 것 같은데요.

이게 GNN에서도 뭔가 복소수로 문제를 정의해서 이점을 얻을 수 있는 분야가 있을 수도 있겠다는 생각이 드네요.

어떻게 될지 모르겠지만 확장이라고 하십니다.

복소공간으로 확장 선형 벡터 공간을 복소공간으로 확장이 가능한가요?

선형 벡터 공간을 복소공간으로 웨이트과 바이어스들을 복소수로 정의를 할 수 있냐는 질문이시라면 안 될 건 없을 것 같거든요.

수학적으로 증명이 필요한 상황이겠지만 그 질문이실까요?

아니면은 우리가 GNN을 가지고 레프레젠테이션을 한 어떤 인베이팅 스페이스를 복소수 공간으로 정의할 수 있나요?

인베이팅 스페이스도 만약에 원한다면 복소수 공간으로 정의를 하는 것은 문제는 안 될 것 같습니다.

그런데 그렇게 했을 때 어떤 이점이 있을지는 생각을 해봐야 될 것 같아요.

왜냐하면 복소공간에서는 디스턴스를 정의하는 게 그 디스턴스를 가지고 저희가 학습을 해야 되는데 그게 그렇게 유클리디한 스페이스 그냥 일반 스페이스만큼 편안할지 잘 모르겠습니다.

이건 제가 진짜 모르겠네요.

그 다음 질문입니다.

라이다죠?

라이다에서 나오는 데이터가 포인트 클라우드 일종이죠.

그냥 데이터들이 하나하나의 예를 들어 높이가 3m, 4m, 5m, 6m, 7m, 8m, 10m, 하나의 예를 들어 높이가 색깔로 표현된다고 하면 컬러라는 게 피처고 각 로케이션마다 저희가 센싱을 하잖아요.

그 센싱된 포인트들에서 얻어지는 각 점들이 전부 다 하나하나의 데이터를 보일 텐데 그럼 데이터들의 세시 있으면 그걸 저희가 다 포인트 클라우드라고 하거든요.

라이다에서 나왔든 다른 데서 나왔든요.

그런데 라이다가 대표적인 예제이다 보니까 보통 포인트 클라우드 말을 할 때 라이다를 예시로 많이 드는 거고요.

꼭 라이다일 필요는 없습니다.

그리고 GNN을 이용한 영상분할 세그멘테이션은 가능하고요.

DGCNN이 세그멘테이션을 매우 잘 하고 있습니다.

DGCNN이 사실 아니어도 기존 포인트 넷이나 다른 그래프 뉴럴 네트워크를 사용한 사실 포인트 GNN이라는 것도 있거든요.

그 기법도 세그멘테이션을 어느 정도 수준까지 잘 한다고 알고 있습니다.

포인트 GNN이고 포인트 넷보다는 결과가 더 좋았다고 본인들 논문에서는 설명을 하고 있거든요.

아닌 경우도 있겠지만 일단 논문에 따르면 그렇긴 합니다.

잠깐만요.

제가 세그멘테이션 찾아볼게요.

포인트 클라우드 세그멘테이션 자 이걸 한번 볼게요.

세그멘테이션 저도 공유가 가능하니까 공유 드리겠습니다.

슬라이드 쇼, 쉐어스크린 크롬 어디갔지?

페이크 화이트 코드 이런거 보면 잘 나와 있잖아요.

포인트 클라우드 세그멘테이션 데이터셋 자체는 어떤 데이터셋인지 잘 모르겠는데 벤치마크 보면 예전에 포인트 넷, 포인트 넷 뿔뿔 포인트 트랜스포머 이런거 이후로 다른 방법들이 많이 나와있네요.

디지 CNN 이거 이후로도 더 좋은게 많이 나와있는 것 같습니다.

역시 뭔가 새로운 것들이 계속 많이 나오고 있는 것 같습니다.

그래서 이제 세그멘테이션은 포인트 클라우드에서 일반적으로 많이 하는 테스트니까 이런것들 참고하시면 좋을 것 같습니다.

그렇게 하시면 될 것 같고 아까 포인트 클라우드 처음에 인트로덕션 설명해 주실 때 관심있게 보기 중의 하나가 그림을 가지고 그래프를 뽑아내는 일을 꼭 얘기하셨잖아요.

아까 그림이 무슨 바이올로지 쪽이었는데 그 사진을 가지고 사진에서 그래프를 뽑아내서 어떤 특정을 뽑아내게 된거죠.

아 그 조직사진 말씀하시는거군요.

예.

그거가 사실 재료에서도 똑같은 문제로 가지고 고민을 많이 해요.

아 네 맞습니다.

사실 이게 재료 저널이에요.

근데 나노스케일의 재료를 원래 얘기를 하고 싶었던 것 같은데 그 어떤 특정한 예로 조직 그 그림을 사진들을 가지고 온 것 같아요.

그러니까 뭐 원자력 쪽 얘기지만 금속이 방사화되어가지고 뭔가 크랙이나 뭐라 그러지 취하된다고 그러나 아무튼간에 저렇게 뭔가 단면에 어떤 저런 형상이 단면에 어떤 저런 정보들이 바뀌는데 이거 영상에서 그래프를 뽑아내고 그 그래프의 형태를 가지고 물성치의 변화를 예측해보라고 하는 것들이 많이 하거든요.

그래서 기존에는 인공지능으로 하는게 아니라 이거는 이제 비전 컴퓨터 컴퓨터 비전 기술을 이용해가지고 포인트를 찾아가지고 선을 그리고 해가지고 많이 만들더라고.

그래서 그런 주제도 지금 어떤 세그메이테이션이나 아니면 이런 그래프 뉴럴에 또 써서 해볼 수 있는 좋은 주제인 것 같습니다.

비슷한 연구들.

재료 쪽에도 많이 해볼 수 있는 것 같고요.

그리고 약간 이제 아까 개념적으로 설명을 되게 잘 해주셨는데 저는 한 가지만 더 얘기를 하면 좋을 것 같아요.

우리가 이제 그 레프레젠테이션 일을 한다는게 우리가 압축된 공간으로 정보를 바꾸는 거 맞는데 그 공간에 이제 우리가 중요한 건 거리를 정의할 수 있는 그래서 우리가 연산이 가능한 스페이스로 데이터를 변환시켜서 보낸다.

사실 거리를 정의한다는게 가장 중요한, 당연하지만 너무 중요한 얘기인 것 같습니다.

그렇기 때문에 우리가 여러가지 일을 할 수 있는 거고요.

네, 그렇습니다.

아무튼 오늘 긴 시간 영광입니다.

감사합니다.

역시 강의체질이신 것 같아요.

감사합니다.

아닙니다.

오늘 좋은 강의 해주셔서 감사하고요.

잠시만요.

노래를 좀 틀어야지.

노래를 틀겠습니다.

아무튼 오늘 좋은 강의 해주셔서 감사합니다.

감사하고, 희선님이 오늘은 이제 이론 중심으로 개념적으로 설명을 해주시고 저희가 한 9월 말 정도에 조금 더 어려운 코드를 가지고 직접 실습을 해보거나 아니면 조금 더 어플리케이션 위주로 설명하는 시간을 좀 더 가져보려고 합니다.

아직 날짜는 잡히지 않았는데 준비가 되는 대로 한 9월 말 정도 진행을 하도록 하겠습니다.

그리고 이제 저희 일정에 대해서 잠깐 안내를 드리면 저희가 다음 주하고 다다음 주에 모임을 하지 못할 것 같아요.

일단은 다음 주가 저희 딸 생일이고 또 그 다음 주 다른 이벤트가 있어서 저희가 출장 가느라 모임을 못할 것 같고 또 그 다음 주도 뭔가 일이 있어요.

그래서 한 2주나 3주 정도는 저희가 모임을 못할 것 같고 9월 중순에 인공지능 반도체 주제로 세미나를 가지도록 하겠습니다.

그러면 참석해주신 여러분들 모두 다 감사합니다.

감사합니다.