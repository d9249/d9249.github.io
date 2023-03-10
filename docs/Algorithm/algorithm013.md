---
title: 문제 3-3 (동전)
layout: default
parent: University
grand_parent: Algorithm
nav_order: 13
description: "2021년 4학년 DD772_Algorithms 수업 과제"
permalink: /docs/Algorithm/University/algorithm013/
---

**문제** <br>
Nadiria 라는 (상상의) 나라에서는 다음과 같은 액면가의 동전(화폐)을 사용한다고 한다. <br>
$1, $4, $7, $13, $28, $52, $91, $365 <br>
어떤 곳이든 사람들은 돈을 주고 받을 때, 가능한 적은 개수의 동전을 사용하기를 원한다. <br>
입력으로 자연수 K가 주어지면 Nadiria 화폐를 이용하여 <br>
$K 를 만들 수 있는 최소 동전 개수를 출력하는 알고리즘을 설계하고 분석하시오. <br>

```
Coins = [1,4,7,13,28,52,91,365]
Coins = [1,7,10]
def Nadiria(Coins, Money):
    arr = [0] * (Money + 1)                     # 0의 배열을 Money의 개수만큼 생성.
    for i in range(1, Money + 1):               # 1부터 Money까지 탐색.
        Temp = 9999                             # 첫번째 원소를 무조건 반환하기 위해서 사용하지 않을만한 큰 값을 설정.
        j = 0                                   # 화폐 종류를 모두 보기 위해서 0으로 초기화.
        while j < len(Coins) and i >= Coins[j]: # 화폐의 종류만큼 반복하고, Money의 값이 화폐보다 크면 값을 비교한다.
            Temp = min(arr[i-Coins[j]], Temp)   # 현재의 Money에서 화폐의 단위를 뺀 최소의 화폐 개수를 저장
            j += 1                              # 화폐의 종류 만큼 반복하기 위해서 j를 1씩 증가.
        arr[i] = Temp + 1                       # 현재의 머니에서 화폐 단위를 뺀 최소 개수에 +1하여 저장.
    return arr[Money]                           

print(Nadiria(Coins,14))
```

**점화식**

| 0                            | if Money <= 0|
| min(arr[i-Coins[j]], Temp)   |  if Money > 0 |

요약 <br>
화폐의 크기만큼 배열을 선언 후 최종 목표하는 금액을 0부터 시작하여 계산된 최소 동전의 수를 이용하여서 <br>
목표하고자하는 금액의 최소 화폐의 개수를 구하는 알고리즘입니다. <br>
시간 복잡도 : O(n)
