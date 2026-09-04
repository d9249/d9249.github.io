---
title: "Pangolin은 VPN·리버스 프록시를 리소스 단위 제로 트러스트 접근으로 묶는다"
date: "2026-09-04T14:43:58"
description: "fosrl/pangolin은 WireGuard 기반 터널, identity-aware reverse proxy, SSO·RBAC를 한 제어면에 묶어 사설 SSH·DB와 공개 웹 앱을 리소스별로 연결하는 self-hosted SASE 플랫폼이다."
author: "Sangmin Lee"
repository: "fosrl/pangolin"
sourceUrl: "https://github.com/fosrl/pangolin"
status: "Open-core self-hosted platform"
license: "AGPL-3.0 / Fossorial Commercial License"
platforms:
  - "macos-linux"
  - "winos"
tags:
  - "Zero Trust"
  - "WireGuard"
  - "Reverse Proxy"
  - "Self-Hosted"
  - "Remote Access"
  - "SASE"
highlights:
  - "WireGuard 터널, 브라우저 기반 reverse proxy, private resource client access를 하나의 identity·policy 모델로 관리한다."
  - "Site connector가 private network에서 outbound connection을 시작하므로, 원격 LAN에 public IP나 inbound port를 직접 열지 않는 배치를 지향한다."
  - "Community Edition은 AGPL-3, Enterprise 기능은 Fossorial Commercial License가 적용되는 dual-license/open-core 구조다."
  - "self-host는 public IP·도메인·TLS·Docker·방화벽 포트 운영이 전제라서 단순 VPN 클라이언트보다 관리 책임이 크다."
  - "공식 최신 릴리스는 1.22.1이며, upgrade 전 config app-data backup이 공식 절차에 포함된다."
draft: false
---

`Pangolin`은 “VPN 하나”나 “리버스 프록시 하나”보다, **사용자·역할·리소스·접속 경로를 같은 정책으로 관리하는 원격 접근 제어면**에 가깝다. 공개 웹 앱은 브라우저에서 인증 후 열고, SSH·DB·사설 IP/CIDR 같은 private resource는 Pangolin client가 WireGuard 터널을 붙여 접근한다.[1][3]

중요한 점은 접속 권한의 단위다. 전통적인 VPN처럼 사용자를 네트워크 전체에 넣는 대신, 관리자가 정의한 resource와 role에만 연결하도록 설계되어 있다.[1][3] 집·소규모 팀의 self-hosted 앱, 분리된 원격 서버, 외부 협력자에게 일부 내부 서비스만 열어야 하는 상황에서 특히 이해하기 쉽다.

![Pangolin public-resource dashboard](/images/tips/pangolin-hero.png)

*공식 Pangolin 대시보드 예시. public resource, health, access, authentication을 한 화면에서 관리한다.[1]*

## 무엇을 한데 묶는가

Pangolin의 control plane은 identity, policy, resource 정의와 구성을 관리한다.[3] Node는 public ingress와 WireGuard tunnel을 담당하고, remote network 안의 Site connector는 control plane과 node로 **outbound** 연결을 유지한다.[3] 그래서 site를 설치했다고 private LAN 전체가 자동 노출되는 것이 아니라, 별도로 만든 resource만 connector를 통해 전달된다.[3]

실무 관점에서 구분하면 다음과 같다.

- **Public resource**: HTTPS 앱, SSH·RDP·VNC처럼 인터넷에서 들어오는 연결을 node ingress에서 인증하고 backend로 보낸다.[3]
- **Private resource**: 사용자의 client가 인증된 뒤 IP, CIDR, FQDN 등의 destination으로 터널을 만든다. 가능하면 client와 site 간 직접 peer path를 쓰고, NAT 환경에서 실패하면 node relay로 fallback한다.[3]
- **Identity와 권한**: 같은 control plane에서 사용자, role, client, machine, access rule을 관리한다. SSO/RBAC와 audit log를 access 경계에 함께 둔다는 뜻이다.[1][3]

그래서 “Nginx Proxy Manager에 로그인만 붙이고 싶다”는 요구에는 다소 크고, 반대로 reverse proxy·VPN·site-to-site 터널·remote client를 따로 운영하던 환경에는 구조를 단순화할 여지가 있다.

## 설치와 첫 진입

가장 가벼운 진입은 관리형 Pangolin Cloud이고, 직접 운영하려면 Community Edition quick installer 또는 수동 Docker Compose 경로를 따른다.[1][2] self-host quick install은 root 권한이 있는 Linux server, public IP, dashboard용 domain, Let's Encrypt용 email, 그리고 TCP `80`/`443`, UDP `51820`/`21820` 방화벽 규칙을 전제로 한다.[2]

공식 명령은 긴 URL 때문에 모바일 code block에서 잘리기 쉬워, 아래에는 같은 다운로드 경로를 짧은 shell 변수로 분리해 적었다.

```bash
p=https://static.pangolin.net
curl -fsSL "$p/get-installer.sh" \
  | bash
sudo ./installer
```

installer는 AMD64와 ARM64를 지원하고, Pangolin·Gerbil·Traefik Docker image를 가져와 stack을 시작한다. 초기 setup은 dashboard URL과 container log에 표시되는 setup token으로 first admin을 만드는 흐름이다.[2]

처음에는 **새 VPS + 테스트 domain + 최소한의 resource 하나**로 시작하는 편이 좋다. 서버를 public edge로 두고 local network 또는 홈 서버에는 Site connector만 붙인 뒤, private SSH 또는 작은 web service 하나에만 role을 부여해 경로를 검증하면 정책 모델과 NAT behavior를 이해하기 쉽다.

## 왜 유용한가

Pangolin의 좋은 점은 네트워크 장비나 cloud VPN product를 바꾸는 것이 아니라, 애플리케이션 접근의 정책 표면을 정리한다는 데 있다.

- public dashboard와 client tunnel이 **같은 사용자·role 체계**를 사용한다.[1][3]
- Site connector는 remote network에서 outbound connection을 만들고, connector 자체는 deny-by-default로 정의한 resource만 전달한다.[3]
- direct hole punching이 안 되는 NAT 환경에서는 encrypted relay path로 전환할 수 있다.[3]
- macOS·Windows·Linux·iOS·Android client download를 제공해, 운영자뿐 아니라 endpoint 사용자까지 같은 access plane에 넣을 수 있다.[1]
- 최신 stable release `1.22.1`은 2026-09-03에 공개됐으며, release note에는 AI Gateway, IdP mapping, API key 등 access-control 관련 변경과 업데이트 주의사항이 함께 기록돼 있다.[4]

## 주의할 점

**“설치 한 번이면 끝나는 VPN”은 아니다.** self-host는 public ingress를 직접 운영한다.[2][3] domain/DNS, TLS certificate, four listener ports, Docker image update, first-admin credential, backup과 rollback을 책임져야 한다.[2]

공식 update 문서는 config directory를 먼저 복사하고, major version jump 대신 단계적 update를 권장한다.[2][4]

**권한 설계가 보안의 중심이다.** UI에서 resource를 만드는 일보다 “누가 어떤 SSH·DB·internal app에 접근할 수 있는가”를 좁게 잡는 일이 중요하다. 특히 private resource에 CIDR이나 broad port range를 넣기 전, user role과 machine/client 범위를 작게 시작하는 편이 낫다.

**라이선스는 단순 MIT가 아니다.** 저장소 최상단 `LICENSE`는 기본적으로 AGPL-3 적용 파일과 Fossorial Commercial License header 적용 파일을 구분하며, 헤더가 없는 파일은 AGPL-3로 본다고 명시한다.[1] Community Edition을 수정·서비스 운영하거나 Enterprise 기능을 도입할 계획이면 파일별 조건과 상용 조건을 별도로 검토해야 한다.

## 내 판단

Pangolin은 Tailscale을 대체하는 가벼운 mesh VPN만 찾는 사람보다, **“self-hosted service를 공개/비공개 resource로 나누고 identity 기반으로 통제하고 싶다”**는 운영자에게 더 잘 맞는다. WireGuard와 reverse proxy를 조합하는 것은 가능하지만, SSO/RBAC·access policy·health·site connector 운영을 각각 연결하는 비용이 빠르게 커지기 때문이다.

반대로 public IP와 domain을 운영하기 어렵거나, private network 전체를 단순히 mesh VPN에 붙이는 목적이라면 더 단순한 도구가 낫다. Pangolin은 편한 자동화 레이어를 제공하지만, Internet edge와 권한 모델을 책임지는 플랫폼이라는 전제를 받아들일 때 가치가 가장 크다.

## Sources

[1] https://github.com/fosrl/pangolin — fosrl/pangolin GitHub repository
[2] https://docs.pangolin.net/self-host/quick-install — Pangolin Quick Install Guide
[3] https://docs.pangolin.net/development/system-architecture — Pangolin system architecture documentation
[4] https://github.com/fosrl/pangolin/releases/tag/1.22.1 — Pangolin 1.22.1 release
