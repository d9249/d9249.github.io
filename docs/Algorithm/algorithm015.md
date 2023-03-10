---
title: 문제 3-5 (최대곱 부분배열)
layout: default
parent: University
grand_parent: Algorithm
nav_order: 15
description: "2021년 4학년 DD772_Algorithms 수업 과제"
permalink: /docs/Algorithm/University/algorithm015/
---

**문제** <br>
길이가 n 인 정수의 배열 A[0..n-1]가 있다. <br>
A[a]*A[a+1] * ... * A[b]의 값을 최대화하는 구간 (a, b)를 찾는 방법을 설계하고 분석하라. <br>
배열 A 의 원소는 양수, 음수,0 모두 가능하다. <br>
예를 들어, 배열 A가 아래와 같이 주어졌을 경우 (n=7), -6 12 -7 0 14 -7 5 <br>
답은 a=0, b=2 인 경우의 (-6)*12*(-7)=504 가 된다. <br>

```
A = [-6, 12, -7, 0, 14, -7, 5]                              # 대상이 되는 배열
X = [0 for i in range(len(A))]                              # 배열 A의 길이만큼 배열 X를 0으로 채워 생성.
X[-1] = A[-1]                                               # 배열 X의 끝을 배열 A의 끝으로 선언.
def MaxProdArray(A):                                        # 
  MinT = [0 for i in range(len(A))]                         # 배열 A의 길이만큼 배열 MinT를 0으로 채워 생성.
  MaxT = [0 for i in range(len(A))]                         # 배열 A의 길이만큼 배열 MaxT를 0으로 채워 생성.
  MinT[0] = A[0]                                            # MinT, MaxT의 첫 원소를 A[0]으로 초기화.
  MaxT[0] = A[0]                                            # 
  a, b = 0, 0                                               # 최대곱 구간을 저장하기 위한 변수 선언.
  for j in range(1,len(A)):                                 # A[0]의 값을 이미 넣어두었기 때문에 A[1]을 제외한 반복.
    MinT[j] = min(MinT[j-1]*A[j], MaxT[j-1]*A[j], A[j])     # MinT의 이전 원소와 대상이 되는 A 원소의 곱의 결과, MaxT의 이전 원소와 대상이 되는 A 원소의 곱의 결과,
    MaxT[j] = max(MinT[j-1]*A[j], MaxT[j-1]*A[j], A[j])     # 대상이 되는 A원소의 값, 세 가지를 비교하여서 가장 큰 값과 가장 작은 값을 저장하여 다음 인덱스를 사용하여 반복을 진행.
  if (max(MaxT) < max(MinT)):                               # 가장 큰 값이 MinT에 있는 경우.
    b = MinT.index(max(MinT))                               # 최대 값의 구간의 끝을 구하기 위해 MinT에서 가장 큰 값의 인덱스 번호를 b로 넘긴다. 
  else:                                                     # 가장 큰 값이 MaxT에 있는 경우.
    b = MaxT.index(max(MaxT))                               # 최대 값의 구간의 끝이 MaxT에 존재하여 MaxT에서 가장 큰 값의 인덱스 번호를 b로 넘긴다.
  for j in range(len(A)-1,0,-1):                            # 최대 곱의 시작 구간을 찾기 위한 반복
    X[j-1] = X[j]*A[j-1]                                    # A 배열의 끝부터 시작하여 인덱스 번호 0까지 반복하며, 배열의 길이의 -1 만큼 반복.
    if (X[j] == max(MaxT)):                                 # X에 저장된 최대 값의 값과 MaxT의 존재하는 최대 값과 일치한다면
      a = j                                                 # X에 해당하는 인덱스 번호를 시작점으로 선언.
  print("a:", a, "b:", b)                                   # 최대 곱의 구간 출력
  return max(MinT,MaxT)                                     
print(max(MaxProdArray(A)))         
```                        

**점화식**

| -1                                                   |  if 배열의 길이 <= 0 |
| MinT[j] = min(MinT[j-1]*A[j], MaxT[j-1]*A[j], A[j]) <br>  MaxT[j] = max(MinT[j-1]*A[j], MaxT[j-1]*A[j], A[j]) | if 배열의 길이 > 1 |

요약 <br>
배열 하나를 입력으로 받아 최대 곱을 저장하는 배열, <br>
최소 값을 저장하는 배열 두개를 생성 후 두 개의 배열 결과를 가지고 비교하여 <br>
새로운 배열에 최대 값을 넣어 최대 곱의 구간의 범위를 알아내는 알고리즘입니다. <br>
시간 복잡도 : O(n) <br>
정확성 : 100% (모든 테스트 케이스 해결 가능)

**DD772 Algorithms Kyonggi univ.**

[2018 중간](https://www.notion.so/2018-e0a670c1e1944f9e81e2815950a8ce54)

[2018 기말](https://www.notion.so/2018-c1eec3f6b1b54baead15be7aa9f7bfca)

[2020 기말](https://www.notion.so/2020-b9ee3ad48914452dbf021adc2cc2ab8a)

[2021 중간](https://www.notion.so/2021-87a4f52e1c9f4d9e88c121e67b0cbfbf)