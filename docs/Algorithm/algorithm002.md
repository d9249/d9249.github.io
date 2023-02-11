---
title: 배열의 원소의 총합 계산하기
layout: default
parent: Algorithm
nav_order: 1
---

# 배열의 원소의 총합 계산하기

description: 2021년 4학년 DD772_Algorithms 수업 과제
keywords: Algorithm

```
n = [13,6,9,8,12]

def total(array, sum=0):
    #array의 비교할 것이 남아있지 않다면,
    if not array:                   
        #sum을 넘기면서 프로그램을 종료한다.
        return sum                  
    #sum에 첫번째 원소를 더한다.
    sum += array[0]                 
    #이미 더한 원소를 빼기위해서 0번째 원소를 뺀 배열과 더해져있는 sum을 리턴한다.
    return total(array[1:], sum)

print(total(n))
```

{% include important.html content='해당 함수의 시간복잡도는 배열의 길이의 비례만큼 실행되기 때문에 시간복잡도는 $O(n)$이다.' %}