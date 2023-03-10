---
title: Pancake Sorting
layout: default
parent: University
grand_parent: Algorithm
nav_order: 4
description: "2021년 4학년 DD772_Algorithms 수업 과제"
permalink: /docs/Algorithm/University/algorithm004/
---

# Pancake Sorting

```
n = [56,324,23,24,54,83,34] 

def filp(array, count=0):
    #배열의 길이
    l = len(array)
    #배열의 길이와 count의 횟수가 같아진다면, 종료
    if count == l:
        return array

    #배열의 0~(l-count)까지의 최대값
    maxi = max(array[:l-count])
    #최대값의 배열에서의 위치.
    index = array.index(maxi)
    #찾은 maxi를 배열의 첫번째로 위치하게 하고,
    array = array[0:index+1][::-1] + array[index+1:]
    #그리고 찾은 maxi가 l-count의 위치로 전체 배열을 역전한다. 
    array = list(reversed(array[0:l-count])) + array[l-count:]
    #단계를 구분하여 진행하기 위해 count에 1증가
    count += 1      
    
    #count가 배열의 길이와 같아질때까지 반복
    return filp(array, count)

print(filp(n))
```

해당 함수의 시간복잡도는 1~n 까지 탐색해서 가장 큰 팬케이크를 찾아 제일 위로 올리고 뒤집은 다음
1~n-1 까지에서 위와 같은 과정을 반복하기 때문에 2 번의 과정이 계속 반복해서 진행되기 때문에 시간복잡도는 O(n)이다.
최악의 경우는(n 번째가 가장 하단)
n 번째에 가장 큰 수를 놓기 위해 2 회 뒤집기 (총 2 회)
n-1 번째에 그 다음 큰 수를 놓기 위해 2 회 뒤집기 (총 4 회)
... <br>
n-k번째에 그 다음 큰 수를 놓기 위해 2회 뒤집기 (총2k+2회) ... <br>
4 번째에 그 다음 큰 수를 놓기 위해 2 회 뒤집기 (총 2n-6 회) <br>
3 번째에 그 다음 큰 수를 놓기 위해 2 회 뒤집기 (총 2n-4 회) <br>
3번째까지 정렬되었고 1,2번째를 정렬하는 경우 무조건 뒤집는다고 하면(최악의 경우이기 때문에) <br>
최악의 경우의 수는 $2n-4 + 1$(1,2 번을 무조건 바꾼다는 가정) = $2n-3$

**9.(b)**
베스트 케이스의 경우, 이미 팬케이크가 정렬이 되어있고, <br>
뒤집기가 필요하지 않은 경우이기 때문에 시간복잡도는 $O(n)$이다.

**9.(c)**
최악의 경우는(n 번째가 가장 하단) <br>
n 번째에 가장 큰 수를 놓기 위해 3 회 뒤집기 (총 3 회) <br>
n-1 번째에 그 다음 큰 수를 놓기 위해 3 회 뒤집기 (총 6 회) <br>
... <br>
n-k번째에 그 다음 큰 수를 놓기 위해 3회 뒤집기 (총3k+3회) ... <br>
4 번째에 그 다음 큰 수를 놓기 위해 3 회 뒤집기 (총 3n-9 회) <br>
3 번째에 그 다음 큰 수를 놓기 위해 3 회 뒤집기 (총 3n-6 회) <br>
마지막에 1,2 번째의 윗면이 모두 탄 경우가 최악의 경우이기 때문에 <br>
이를 뒤집기 위해서 4 번의 과정이 필요하므로 $3n-6+4 = 3n-2$ 가 최악의 경우가 되고, <br>
위와 과정으로 인해서 시간복잡도는 $O(n)$이다.