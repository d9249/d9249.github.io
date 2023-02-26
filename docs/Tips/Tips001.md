---
layout: default
title: Deep Learning seed = 42란?
parent: Tips
grand_parent: Tips
nav_order: 1
has_children: true
permalink: /docs/Tips/Tips/Tips001/
---

# Deep Learning seed = 42란?

Deep Learning model의 학습 코드들을 보면 항상 `seed = 42`로 고정되어 있는 것을 보았다.

학습된 모델의 결과를 동일하게 Reproduction 하는 것은 여러가지 상황에서 필요합니다.

수상자가 되어 코드의 정합성을 검증 받게 될 경우, 경진대회 참가 도중 팀을 이루어 결과를 공유해야 되는 경우,

논문을 작성하여 그 결과를 Reproduction 해야하는 경우 등

학습한 모델을 Reproduction 하기 위해 Seed 를 고정하는 법에 대해 알아 보도록 하겠습니다.

출처 : https://dacon.io/codeshare/2363

위와 같이 처음에는 그냥 대수롭지않게 실험의 재현성을 위해서 설정해둔다는 것으로만 알고있었는데, 

왜 `42`인지는 한번도 생각해보지않았어서 구글링을 통해서 알게되었다. 그 답은 생각해도 어이가 없네,,,?

은하수 어쩌고에 나오는 슈퍼컴퓨터(이름은 Deep Thought)가 

"삶, 우주, 그리고 모든 것에 대한 궁극적인 질문의 해답"

이라는 질문에 대답하기 위해서 750년간 계산을 했다는데.. 그 대답으로 내놓은 결과가 "42"랍니다.

출처 : https://rchoi-19-4-2.tistory.com/159

위의 글을 읽으면서 이게 뭐지,,,?라고 생각하게 되었다,,,,

가끔 딥러닝을 학습시키는 과정중에도 그렇고 논문을 보면서도 그렇고 이런게 `insight`인가? 싶다,,,

항상 왜?를 생각하면서 살아야겠습니다,,,