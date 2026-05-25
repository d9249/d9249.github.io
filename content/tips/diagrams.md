---
title: "Diagrams는 Python 코드로 클라우드 아키텍처 그림을 남기는 라이브러리다"
date: "2026-05-25T16:48:31"
description: "mingrammer/diagrams는 Graphviz 위에서 AWS·Azure·GCP·Kubernetes 등 인프라 구성도를 Python 코드로 생성하게 해주는 Diagram as Code 라이브러리입니다."
author: "Sangmin Lee"
repository: "mingrammer/diagrams"
sourceUrl: "https://github.com/mingrammer/diagrams"
status: "Open source"
license: "MIT"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Python"
  - "Architecture"
  - "Developer Tools"
  - "Diagram as Code"
  - "Graphviz"
highlights:
  - "Python의 `Diagram`, `Cluster`, `Edge` API로 클라우드 아키텍처 그림을 코드와 함께 버전 관리할 수 있다."
  - "AWS, Azure, GCP, Kubernetes, Alibaba Cloud, Oracle Cloud, On-Premises, SaaS, Programming, C4 등 다양한 node provider를 제공한다."
  - "Graphviz 설치 후 `pip install diagrams`로 시작하며, PNG·JPG·SVG·PDF·DOT 출력과 Jupyter notebook 렌더링을 지원한다."
  - "실제 cloud resource를 생성하거나 Terraform/CloudFormation을 만들어 주는 도구가 아니라, 설계·문서화용 렌더러라는 경계를 분명히 봐야 한다."
  - "diagram 파일은 Python 코드이므로 외부에서 받은 `.py`를 `diagrams` CLI로 실행할 때는 일반 스크립트와 같은 보안 검토가 필요하다."
draft: false
---

아키텍처 다이어그램은 처음 그릴 때보다 **바뀐 뒤에도 최신 상태를 유지하는 것**이 더 어렵다. 회의 중에 만든 그림이 이미지 파일이나 슬라이드에만 남으면, 실제 코드와 인프라가 바뀌어도 누가 언제 고쳐야 하는지 흐려진다.

`Diagrams`는 이 문제를 “그림도 코드로 남기자”는 쪽에서 푼다. Python 파일 안에서 AWS, GCP, Azure, Kubernetes, On-Premises, SaaS 같은 node를 배치하고, `>>`, `<<`, `-` 같은 edge 표현으로 연결한 뒤 Graphviz로 이미지를 렌더링한다. Git diff로 그림의 의도를 추적할 수 있고, 문서 빌드나 README 갱신 흐름에도 넣기 쉽다.

조사 시점 기준 저장소 `mingrammer/diagrams`는 Python 프로젝트이며 GitHub 최신 Release와 PyPI 패키지 모두 `0.25.1`이다. GitHub API와 checked-in `LICENSE`, PyPI metadata 모두 MIT 라이선스로 확인된다. README와 `pyproject.toml`/PyPI는 Python `~=3.9`를 요구하지만, 공식 docs의 installation 페이지 일부에는 아직 Python 3.7 이상이라고 남아 있어 실제 도입 기준은 패키지 metadata 쪽을 우선해서 보는 것이 안전하다.

![Diagrams event processing example](/images/tips/diagrams-event-processing.png)

## Diagrams 개요

Diagrams의 기본 사용감은 “Python으로 Graphviz를 직접 다루되, 클라우드 아이콘과 아키텍처 표현을 미리 준비해 둔 DSL”에 가깝다.

가장 작은 예시는 이런 형태다.

```python
from diagrams import Diagram
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import ELB

with Diagram("Web Service", show=False):
    ELB("lb") >> EC2("web") >> RDS("userdb")
```

이 파일을 실행하면 현재 작업 디렉터리에 `web_service.png` 같은 결과물이 만들어진다. 더 큰 그림에서는 `Cluster`로 영역을 묶고, `Edge`로 색상·라벨·스타일을 조절하며, custom node로 직접 준비한 이미지를 붙일 수도 있다. 공식 guide 기준 출력 형식은 `png`, `jpg`, `svg`, `pdf`, `dot`을 지원하고, Jupyter notebook 안에서 바로 렌더링하는 흐름도 제공한다.

중요한 점은 Diagrams가 클라우드 제어 도구가 아니라는 것이다. README가 명시하듯 실제 AWS 리소스를 만들거나, CloudFormation/Terraform 코드를 생성하지 않는다. 오직 아키텍처 그림을 그리는 라이브러리다.

## 왜 유용한가

Diagrams가 특히 잘 맞는 상황은 “정교한 디자인 툴 작업”보다 “개발 문서 안에서 계속 갱신되는 구조도”다.

- **버전 관리가 쉽다**: 다이어그램이 Python 코드이므로 PR에서 어떤 node와 연결이 바뀌었는지 diff로 남길 수 있다.
- **자동화에 넣기 쉽다**: 문서 빌드, release note, architecture decision record, onboarding 자료 생성 단계에서 스크립트로 이미지를 다시 만들 수 있다.
- **클라우드 아이콘을 바로 쓴다**: AWS, Azure, GCP, IBM, Kubernetes, Alibaba Cloud, Oracle Cloud, OpenStack, Firebase, DigitalOcean, Elastic, On-Premises, Generic, Programming, SaaS, C4 계열 provider가 준비되어 있다.
- **Python 표현력을 그대로 쓴다**: 반복문, 조건문, 함수, 데이터 파일 로딩 등을 이용해 비슷한 패턴의 다이어그램을 여러 개 생성할 수 있다.
- **설계 초안에 가볍다**: FigJam/Figma/Lucidchart를 열기 전, 코드 리뷰나 문서 초안에서 “대략 이런 연결”을 빠르게 공유하기 좋다.

Airflow 문서처럼 프로젝트 문서 안에서 아키텍처 그림을 재생성하는 용도에도 어울린다. 반대로 색감·레이아웃·브랜드 표현을 픽셀 단위로 다듬어야 하는 발표용 그림이라면 전용 디자인 도구가 더 맞을 수 있다.

## 설치와 첫 사용법

Diagrams는 Python 패키지지만 렌더링은 Graphviz에 의존한다. 먼저 OS에 Graphviz를 설치해야 한다.

```bash
# macOS / Homebrew
brew install graphviz

# Windows / Chocolatey
choco install graphviz

# Windows / Winget
winget install Graphviz.Graphviz -i
```

그 다음 Python 환경에 `diagrams`를 설치한다.

```bash
pip install diagrams

# 또는
pipenv install diagrams
poetry add diagrams
uv tool install diagrams
```

프로젝트 문서 안에 넣을 때는 보통 `docs/architecture/diagram.py`처럼 파일을 두고, 결과 이미지 경로를 명시하는 식이 관리하기 편하다.

```python
from diagrams import Cluster, Diagram
from diagrams.k8s.compute import Pod
from diagrams.k8s.network import Service
from diagrams.onprem.database import PostgreSQL

with Diagram("Service Overview", filename="service-overview", show=False, outformat="svg"):
    svc = Service("api-service")

    with Cluster("workers"):
        pods = [Pod("api-1"), Pod("api-2")]

    svc >> pods >> PostgreSQL("orders-db")
```

CLI도 제공된다. 공식 문서 기준 여러 diagram 파일을 한 번에 처리할 수 있다.

```bash
diagrams diagram1.py diagram2.py
```

다만 이 CLI는 diagram 파일을 Python 코드로 실행한다. 팀 내부에서 작성한 파일을 빌드하는 용도라면 자연스럽지만, 인터넷에서 받은 `.py` 파일을 검토 없이 실행하는 습관은 피해야 한다.

## 활용 포인트

내가 본 Diagrams의 좋은 사용처는 세 가지다.

첫째, **ADR과 설계 문서의 구조도**다. “이 서비스는 왜 queue를 사이에 두는가”, “public subnet과 private subnet 사이 흐름은 어떻게 되는가” 같은 결정을 코드와 함께 보관하면, 나중에 설계가 바뀌었을 때 그림도 같은 PR에서 수정할 수 있다.

둘째, **교육·온보딩 자료**다. 예제 페이지에는 grouped workers, clustered web services, event processing, stateful architecture, advanced web service 같은 패턴이 이미 준비되어 있다. 신입 팀원에게 “우리 시스템은 이 패턴을 이렇게 변형했다”라고 보여주기 좋다.

셋째, **문서 빌드 자동화**다. README나 docs site가 빌드될 때 `python diagram.py`를 실행해 이미지를 재생성하면, 오래된 스크린샷을 수동으로 교체하는 일을 줄일 수 있다. SVG나 PDF 출력도 가능하므로 웹 문서와 인쇄용 자료 양쪽에 맞출 수 있다.

## 주의할 점

첫째, Graphviz는 별도 시스템 의존성이다. Python 패키지만 설치하면 끝나는 라이브러리가 아니므로 CI, Docker image, Windows 개발 환경에서는 Graphviz binary 설치까지 같이 관리해야 한다.

둘째, README와 PyPI/`pyproject.toml` 기준 현재 패키지는 Python `~=3.9`를 요구한다. 설치 문서 일부의 Python 3.7 표기는 오래된 문서일 가능성이 있으니, 새 프로젝트에서는 Python 3.9 이상을 기준으로 잡는 편이 안전하다.

셋째, 자동 레이아웃은 편하지만 만능은 아니다. node가 많고 edge가 복잡해질수록 Graphviz 레이아웃이 사람이 원하는 순서와 다르게 나올 수 있다. 큰 시스템 전체를 한 장에 넣기보다 bounded context, data flow, deployment slice처럼 목적별로 쪼개는 편이 결과가 읽기 쉽다.

넷째, Diagrams는 IaC 도구가 아니다. 그림을 보고 실제 리소스 상태가 맞는지 검증해 주지 않고, Terraform이나 CloudFormation을 생성하지도 않는다. “설계 의도를 문서화하는 코드”와 “실제 인프라를 선언하는 코드”의 책임을 분리해서 봐야 한다.

다섯째, diagram 파일은 Python이다. 특히 `diagrams` CLI는 넘겨받은 파일을 실행하는 구조라서, 외부 예제나 생성형 AI가 만든 파일을 그대로 실행하기 전에 파일 읽기/네트워크 호출/쉘 실행 같은 부작용이 없는지 확인하는 것이 좋다.

## 내 판단

Diagrams는 “예쁜 아키텍처 그림을 한 번 만드는 도구”라기보다 **계속 변하는 시스템 구조도를 코드 리뷰와 문서 빌드 안에 넣는 도구**에 가깝다. 클라우드·Kubernetes·데이터 파이프라인 구조를 자주 설명하는 팀이라면, 몇 개의 대표 diagram script를 repo에 넣어두는 것만으로도 문서 신뢰도가 올라간다.

반대로 제품 소개용 hero image, 고객 제안서, 픽셀 단위 편집이 필요한 아키텍처 포스터에는 맞지 않는다. 그 경우에는 Diagrams로 초안을 만들고, 최종 편집은 디자인 도구에서 다듬는 혼합 흐름이 더 현실적이다. 내 기준 추천 대상은 “아키텍처가 바뀔 때 그림도 PR에서 같이 바꾸고 싶은” 백엔드·플랫폼·데이터 엔지니어 팀이다.

## 참고한 공개 자료

- [Diagrams official website](https://diagrams.mingrammer.com/)
- [mingrammer/diagrams GitHub repository](https://github.com/mingrammer/diagrams)
- [Diagrams installation guide](https://diagrams.mingrammer.com/docs/getting-started/installation)
- [Diagrams examples](https://diagrams.mingrammer.com/docs/getting-started/examples)
- [Diagrams guide](https://diagrams.mingrammer.com/docs/guides/diagram)
- [diagrams PyPI package](https://pypi.org/project/diagrams/)
- [v0.25.1 GitHub release](https://github.com/mingrammer/diagrams/releases/tag/v0.25.1)
