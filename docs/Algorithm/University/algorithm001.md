---
title: 배열에서 최솟값 찾기
layout: default
parent: University
nav_order: 1
description: "2021년 4학년 DD772_Algorithms 수업 과제"
---

# 배열에서 최솟값 찾기

```
n = [13,6,9,8,12]

def min(array, com):
    #array의 비교할 것이 남아있지 않다면,
    if not array:
        #com을 넘기면서 프로그램을 종료한다.
        return com                      
    #배열의 첫번째를 now로 선언.
    now = array[0]                      
    #now가 com보다 작다면,
    if now < com:                       
        #배열의 첫번째수가 비교하는 수보다 작으면, now를 com로 대체한다.
        return min(array[1:], now)      
    #now가 com보다 작지 않다면,
    else:                               
        #배열의 첫번째가 비교하는 수보다 작지 않다면, com을 유지한다.
        return min(array[1:], com)      

print(min(n, n[0]))
```

해당 함수의 시간복잡도는 배열의 길이의 비례만큼 실행되기 때문에 시간복잡도는 $O(n)$이다.