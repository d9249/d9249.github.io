---
title: 배열의 원소의 총합 계산하기
layout: default
parent: University
grand_parent: Algorithm
nav_order: 3
description: "2021년 4학년 DD772_Algorithms 수업 과제"
---

# 배열의 원소의 총합 계산하기

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

def selection_sort(array, count=0):
    #array의 길이 만큼, count가 진행되었다면,
    if count == len(array):                     
        #array를 리턴.
        return array                            

    #min함수를 사용하여서 배열의 가장 최솟값을 찾아 mini에 저장
    mini = min(array[count:], array[count])     
    #최솟값 mini의 index번호를 찾는다.
    index = array.index(mini)                  
    array[index] = array[count]                 
    #단계(count)의 맞게 찾은 최솟값을 대상의 array와 위치를 바꾼다.
    array[count] = mini                         
    #다음 최소값을 찾기 위해서, count를 1증가 시켜 다음 단계를 진행.
    count += 1                                  
    return selection_sort(array, count)         

print(selection_sort(n))

```

'데이터의 개수가 n개라고 했을 때,
첫 번째 회전에서의 비교횟수 :1~(n-1)=>n-1
두 번째 회전에서의 비교횟수 :2~(n-1)=>n-2 ...
(n-1) + (n-2) + .... + 2 + 1 => n(n-1)/2 이므로 선택 정렬의 시간복잡도는 $O(n^2)$이다.