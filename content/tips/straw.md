---
title: "straw는 인프라 로그·메트릭·토폴로지 스트림을 LLM용 요약 Markdown으로 압축하는 작은 Go 프로토타입이다"
date: "2026-06-25T08:41:57"
description: "ilyesarf/straw는 SSE 형태의 logs·metrics·events 스트림을 읽어 트래픽 토폴로지, elevated 리소스, 로그 signature만 남긴 Markdown으로 줄이는 Go CLI 프로토타입입니다."
author: "Sangmin Lee"
repository: "ilyesarf/straw"
sourceUrl: "https://github.com/ilyesarf/straw"
status: "Source available prototype"
license: "Unknown"
platforms:
  - "macos-linux"
tags:
  - "Go"
  - "CLI"
  - "Observability"
  - "LLM Context"
  - "Infrastructure"
highlights:
  - "README는 raw 276k token짜리 인프라 스트림을 straw 출력 약 1.1k token으로 줄이는 99.5% token reduction 예시를 전면에 둔다."
  - "입력은 `event: logs|metrics|events`와 `data: {...}` 줄로 구성된 stream 파일이며, CLI는 topology·resource saturation·log signatures 섹션의 Markdown을 출력한다."
  - "현재는 Release, tag, 패키지 배포, LICENSE 파일이 없고 README도 `go run main.go stream.txt` 예시만 제공하는 초기 소스 실행형 프로젝트다."
  - "저장소 경로는 `ilyesarf/straw`지만 `go.mod` module path는 `github.com/ilyesrf/straw`로 달라서 `go install github.com/ilyesarf/straw@latest`는 바로 실패한다."
  - "운영 로그를 LLM에 넣기 전 IP·container ID·서비스명·오류 패턴이 얼마나 남는지 반드시 샘플 데이터로 확인해야 한다."
draft: false
---

LLM에게 장애 상황을 설명하려고 raw 로그, 컨테이너 메트릭, 서비스 간 호출 이벤트를 그대로 붙이면 context가 순식간에 터진다. 그런데 완전히 사람이 요약하면 “어떤 서비스가 누구에게 몇 번 호출했는지”, “어떤 리소스가 임계값을 넘었는지”, “반복 로그가 어떤 패턴인지” 같은 기계적인 신호를 놓치기 쉽다.

`straw`는 이 사이를 노린 아주 작은 Go CLI다. 관측 스트림 파일을 읽고, 트래픽 토폴로지·리소스 saturation·로그 signature만 남긴 Markdown으로 압축한다. README가 내세우는 숫자는 “276k raw token → straw 출력 1.1k token, 99.5% reduction”이다. 독립 벤치마크라기보다는 저장소에 포함된 `stream.txt` 샘플과 현재 reducer 설계를 설명하는 주장으로 읽는 편이 안전하다.

![straw GitHub repository](https://opengraph.githubassets.com/straw-tip-20260625/ilyesarf/straw)

## 무엇을 줄여주는가

소스 기준 `straw`가 기대하는 입력은 서버 전송 이벤트(SSE)처럼 보이는 텍스트 파일이다. 각 블록은 `event: metrics`, `event: logs`, `event: events` 같은 이벤트 타입과 `data: {...}` JSON 한 줄로 구성된다.

현재 parser가 직접 사용하는 주요 데이터는 다음 세 계열이다.

- **logs**: `entries[].service`, `entries[].message`를 읽고 반복 메시지를 signature로 묶는다.
- **metrics**: `hostMetrics[].cpuUsedPct`, `containerResources[].netRxBytes`를 보고 임계값 이상만 남긴다.
- **events**: `srcService`, `dstService`, `protocol`, `operation`, `count`를 모아 서비스 간 edge를 aggregate한다.

출력은 정교한 대시보드가 아니라 LLM prompt에 붙이기 쉬운 텍스트다.

```text
=== TRAFFIC TOPOLOGY ===
- nginx-gateway -> traffic-gen [http1, reqs:47]
- postgres-db -> backend-service [postgres, reqs:171]

=== RESOURCE SATURATION ===
- 3fa8e36e0c94 | net_rx_bytes: 610347222.00 [ELEVATED]

=== LOG SIGNATURES ===
- count:47 | W* *:*:* warnings.go:*] v* Endpoints is deprecated in v*+; use discovery.k8s.io/v* EndpointSlice
```

내 로컬 smoke test에서도 README의 기본 흐름은 실행됐다. `go run main.go --save /tmp/straw-output.md stream.txt`로 샘플을 돌리면 4,414줄짜리 `stream.txt`에서 69줄, 약 5.4KB Markdown이 생성됐다. `go test ./...`도 테스트 파일은 없지만 모든 패키지가 컴파일되는 상태였다.

## 설치와 첫 사용법

README가 공개한 공식 실행법은 아직 source checkout 안에서 `go run`을 호출하는 방식뿐이다.

```bash
git clone https://github.com/ilyesarf/straw.git
cd straw
go run main.go stream.txt
```

소스의 `main.go`에는 `--save` 옵션도 있다. 출력 파일을 바로 만들려면 다음처럼 쓸 수 있다.

```bash
go run main.go --save straw-summary.md stream.txt
```

다만 현재 저장소에는 GitHub Release, tag, Homebrew/npm/PyPI 같은 배포 표면이 없다. 또한 조사 시점의 `go.mod`는 `go 1.24.13`을 요구하고, module path가 저장소 URL의 `ilyesarf`가 아니라 `github.com/ilyesrf/straw`로 되어 있다. 그래서 일반적인 Go 설치 습관대로 다음을 실행하면 module path mismatch로 실패한다.

```bash
go install github.com/ilyesarf/straw@latest
```

따라서 지금은 “패키지 설치형 CLI”가 아니라 “저장소를 받아 샘플/소스를 직접 실행해보는 프로토타입”으로 보는 것이 맞다.

## 어디에 써볼 만한가

가장 자연스러운 사용처는 **인프라/관측 데이터의 LLM 전처리**다. 예를 들어 장애 triage에서 다음처럼 raw stream을 바로 모델에 넣기 전에 straw로 1차 압축할 수 있다.

```bash
go run main.go --save incident-context.md stream.txt
```

그 다음 LLM에는 “이 Markdown만 보고 장애 후보를 서비스 edge, elevated metric, 반복 로그 순서로 정리해줘”라고 시킬 수 있다. 장점은 사람이 수동으로 요약하기 전에 반복 가능한 rule-based pass를 한 번 거친다는 점이다.

현재 reducer의 방향도 명확하다.

- topology는 같은 `src -> dst, protocol` edge의 count를 합친다.
- metrics는 CPU 80%, network RX/TX 500MB 같은 hardcoded threshold 이상만 남긴다.
- logs는 IP, CIDR, 숫자, hex/container ID, 날짜, latency/size suffix가 붙은 숫자 등을 `*`로 mask해 같은 패턴을 묶는다.

이런 단순함은 장점이자 한계다. 포맷이 맞는 스트림에서는 빠르게 token을 줄일 수 있지만, 다른 observability stack의 JSON schema를 바로 먹는 범용 파서라고 보기는 어렵다.

## 주의할 점

첫째, 라이선스가 비어 있다. GitHub API 기준 license는 `null`이고, 저장소에도 `LICENSE` 파일이 없다. 코드를 회사 도구나 제품에 섞어 쓰려면 먼저 저자에게 라이선스를 확인하는 편이 안전하다.

둘째, 성숙도는 매우 초기다. 저장소는 2026년 6월 24일 생성·갱신된 상태이고, README는 12줄짜리 요약과 `go run main.go stream.txt` 테스트만 담고 있다. release/tag가 없기 때문에 재현 가능한 버전 pinning도 commit SHA 기준으로 해야 한다.

셋째, 입력 데이터의 민감도다. straw가 일부 숫자, IP, hex token을 mask하더라도 서비스명, namespace, operation, endpoint, deprecated API 로그, 컨테이너 단서 등은 출력에 남을 수 있다. LLM이나 외부 티켓 시스템에 붙이기 전에는 생성된 Markdown을 한 번 열어보고 secret, customer identifier, 내부 hostname이 남는지 확인해야 한다.

넷째, 현재 metric 처리는 선택적이다. `stream.txt`에는 request latency 계열의 `metrics` 배열도 있지만 parser는 `hostMetrics`와 `containerResources` 위주로 읽는다. 장애 분석에서 latency percentile, error rate, saturation type이 중요하다면 reducer를 직접 확장해야 한다.

## 내 판단

`straw`는 완성된 observability 제품이라기보다 “LLM context로 넣기 전에 인프라 dump를 얼마나 과감하게 줄일 수 있나”를 보여주는 작은 실험에 가깝다. 그래서 지금 추천 대상은 명확하다.

- Kubernetes/infra 로그와 이벤트를 LLM에 넣어 triage prompt를 만들고 싶은 사람
- raw JSON/SSE stream을 rule-based Markdown summary로 줄이는 아이디어를 빠르게 훑어보고 싶은 사람
- 자체 observability pipeline 앞단에 붙일 compressor/reducer 스케치를 찾는 사람

반대로 바로 설치해서 운영에 넣을 CLI를 기대한다면 아직 이르다. 최소한 license, module path, release/tag, 입력 schema 문서화, threshold 설정, secret redaction, latency/error metric 처리, 테스트 fixture가 더 필요하다. 그래도 300KB급 관측 스트림을 몇 KB Markdown으로 줄이는 방향 자체는 AI incident response workflow에서 꽤 실용적인 문제를 건드린다.

## 참고한 공개 자료

- [ilyesarf/straw GitHub repository](https://github.com/ilyesarf/straw)
- [straw README](https://github.com/ilyesarf/straw/blob/master/README.md)
- [main.go](https://github.com/ilyesarf/straw/blob/master/main.go)
- [stream parser](https://github.com/ilyesarf/straw/blob/master/reducer/parser/parser.go)
- [metric filter](https://github.com/ilyesarf/straw/blob/master/reducer/metric_filter.go)
- [log clustering reducer](https://github.com/ilyesarf/straw/blob/master/reducer/log_cluster.go)
- [Markdown renderer](https://github.com/ilyesarf/straw/blob/master/renderer/markdown.go)
