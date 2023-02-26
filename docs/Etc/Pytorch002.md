---
layout: default
title: Jupyterlab setting
parent: Pytorch
grand_parent: Etc
nav_order: 2
has_children: true
permalink: /docs/Etc/Docker/Pytorch002/
---

# Pytorch 

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

# Jupyterlab setting

Jupyterlab는 다음 명령어로 가능하며, 공식문서를 참조하면 다양한 설치 방법을 알 수 있다.
: [Jupyterlab Docs Link](https://jupyterlab.readthedocs.io/en/stable/index.html)

```
pip install jupyterlab
```

Jupyter notebook이 설치된 후

```
jupyter lab --generate-config
```

명령어를 실행하면 config 파일이 /root/.jupyter/ 에 생성된다.

그리고 비밀번호를 설정하기 위해서 Ipython을 입력 후

```
>>> from notebook.auth import passwd

>>> passwd()
```

을 실행하여 본인이 사용하는 비밀번호를 설정한다.
실행하게되면 암호화된 문자열이 나오는데 이를 복붙하여서 설정에 사용한다.

그리고 config file을 열어 아래와 같은 코드를 추가한다.

```
c = get_config()
c.NotebookApp.password = '이곳에는 위에서 암호화된 비밀번호 입력'
c.NotebookApp.allow_origin = '*'
c.NotebookApp.ip = '0.0.0.0'
c.NotebookApp.notebook_dir = '/'
# 자신이 사용할 포트 설정. 나의 경우 외부접속을 위해서 포트번호를 설정하였다.
c.NotebookApp.port = 8080
c.NotebookApp.open_browser = False
```

그리고 주피터노트북을 실행하면 앞서 설정한 비밀번호를 통해서 접속이 가능하다.

jupyterlab을 실행하는 명령어는 다음과 같다.

```
jupyterlab --allow-root --ip=0.0.0.0 --port=8080
```

해당 명령어가 치기 귀찮다면 .sh 파일을 생성하거나, 우분투 서비스에 등록하는 방식을 적용하여도 좋습니다!

추후에는 Docker을 활용한 Jupyter notebook 설정하는 방법과 Docker에 대해서 알아보겠습니다.