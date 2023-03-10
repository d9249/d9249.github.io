---
title: 문제 3-4 (최대합 부분배열)
layout: default
parent: University
grand_parent: Algorithm
nav_order: 14
description: "2021년 4학년 DD772_Algorithms 수업 과제"
permalink: /docs/Algorithm/University/algorithm014/
---

**문제** <br>
길이가 n 인 정수의 배열 A[0..n-1]가 있다. <br>
A[a] + A[a+1] + ... + A[b]의 값을 최대화하는 구간 (a, b)를 <br>
O(n) 시간 안에 찾는 방법을 설계하고 분석하라.<br>
예를 들어, 배열 A가 아래와 같이 주어졌을 경우 <br>

  (n = 10), 31 -41 59 26 -53 58 97 -93 -23 84 <br>

답은 a = 2, b = 6 인 경우의 59+26-53+58+97=187가 된다. <br>

**구하고자하는 배열 A** <br>
A = [31, -41, 59, 26, -53, 58, 97, -93, -23, 84] <br>

**Test case** <br>
A = [-7, 4, -3, 6, 3, -8, 3, 4] <br>
A = [-6, 12, -7, 0, 0, 14, -7, 5] <br>
A = [31, -41, 59, 26, -53, -158, 97, -93, 23, 84] <br>

```
def MaxSumArray(A):          
    if len(A) <= 0:                         # 배열의 길이가 0이하일 경우 -1 리턴하여 예외 처리.
        return -1
    Temp = [None] * len(A)                  # 구하고자하는 배열 A의 길이 만큼 새로운 배열을 생성.
    Temp[0] = A[0]                          # 새로운 배열의 첫번째 원소는 배열 A의 원소를 복사.
    for i in range(1, len(A)):              # 배열의 인덱스 번호 1부터 입력한 배열의 끝까지 반복.
        Temp[i] = max(0, Temp[i-1]) + A[i]  # Temp 배열의 A의 원소를 더해가면서 진행. Temp의 이전 원소가 음수라면 0으로 초기화하고 A의 원소를 더한다.
        if (Temp[i-1] < 0):                 # 
            a = i                           # Temp의 원소가 -가 나오면 해당 인덱스의 다음 인덱스 정보가 시작 인덱스 번호.
    print("a:",a)                           # 구간 a 출력.
    print("b:",Temp.index(max(Temp)))       # 구간 b 출력. 최대값이 존재하는 원소의 인덱스 번호 
    return max(Temp)                        # 
                                            # 
print(MaxSumArray(A))                       # 
```

**점화식**

| -1                       | if 배열의 길이 <= 0 |
|max(0, Temp[i-1]) + A[i] | if 배열의 길이 > 1 |

요약 <br>
해당 알고리즘을 요약하자면, 문제에 주어진 배열을 탐색하면서 <br>
이전의 배열의 원소와 이후의 배열의 원소를 더하여 새로운 배열에 저장을 하는 과정을 반복하고 <br>
이전의 결과물을 다음의 결과에 사용하면서 최대 합의 구간을 찾아내는 알고리즘입니다. <br>
시간 복잡도 : O(n)

