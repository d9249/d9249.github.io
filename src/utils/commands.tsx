import React from 'react';

export interface CommandResult {
  output: string | JSX.Element | JSX.Element[];
  isError?: boolean;
}

export interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => CommandResult;
}

// 색상 적용 헬퍼 함수
const colorize = (text: string, colorClass: string) => {
  return <span className={colorClass}>{text}</span>;
};

// 현재 날짜를 한국 형식으로 포매팅
const formattedDate = () => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short',
    month: 'short', 
    day: '2-digit',
    year: 'numeric'
  };
  return date.toLocaleDateString('ko-KR');
};

// 기본 정보
const terminalBanner = `
███╗   ███╗███████╗ █████╗ ███╗   ██╗
████╗ ████║██╔════╝██╔══██╗████╗  ██║
██╔████╔██║█████╗  ███████║██╔██╗ ██║
██║╚██╔╝██║██╔══╝  ██╔══██║██║╚██╗██║
██║ ╚═╝ ██║███████╗██║  ██║██║ ╚████║
╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝
                                                                        
`;

const welcomeMessage = `${terminalBanner}
터미널 포트폴리오 v1.0.0 ( 환영합니다! )

  * GitHub: https://github.com/d9249
  * LinkedIn: https://linkedin.com/in/meanl

마지막 로그인: ${formattedDate()} (한국 표준시)
사용법을 보려면 'help'를 입력하세요.
`;

const helpInfo = (
  <div>
    <h2 className="section-header">도움말</h2>
    <p>터미널 포트폴리오에 오신 것을 환영합니다! 다음 명령어를 사용할 수 있습니다:</p>
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '120px' }}>career</div>
        <div>- 경력 정보 보기</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '120px' }}>projects</div>
        <div>- 프로젝트 목록 보기</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '120px' }}>contact</div>
        <div>- 연락처 정보 보기</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '120px' }}>about</div>
        <div>- 소개 정보 보기</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '120px' }}>skills</div>
        <div>- 기술 스택 보기</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '120px' }}>research</div>
        <div>- 연구 경험 보기 (서브명령어: thesis, international-journal, international-conference, domestic-journal, domestic-conference, all)</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '120px' }}>education</div>
        <div>- 학력 정보 보기</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '120px' }}>whoami</div>
        <div>- 이상민 정보 확인</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '120px' }}>clear</div>
        <div>- 터미널 화면 지우기</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '120px' }}>help</div>
        <div>- 도움말 보기</div>
      </div>
    </div>
    <p style={{ marginTop: '15px' }}>아래에 명령어를 입력하여 시작하세요!</p>
  </div>
);

const skillsInfo = (
  <div>
    <h2 className="section-header">기술 스택</h2>
    <p>다음은 제가 가진 주요 기술 스택입니다:</p>
    
    <div style={{ marginTop: '15px' }}>
      <div style={{ display: 'flex', marginTop: '5px' }}>
        <div style={{ width: '120px' }}>Collaboration:</div>
        <div>
          {colorize('Postman', 'color-postman')}, {colorize('Notion', 'color-notion')}
        </div>
      </div>

      <div style={{ display: 'flex', marginTop: '5px' }}>
        <div style={{ width: '120px' }}>Back-end:</div>
        <div>
          {colorize('Python', 'color-python')}, {colorize('FastAPI', 'color-fastapi')}, 
          {colorize('Uvicorn', 'color-uvicorn')}, {colorize('AIOHTTP', 'color-aiohttp')},
          {colorize('Kafka', 'color-kafka')}, {colorize('Streamlit', 'color-streamlit')},
          {colorize('starlette', 'color-starlette')}
        </div>
      </div>
      
      <div style={{ display: 'flex', marginTop: '5px' }}>
        <div style={{ width: '120px' }}>Data:</div>
        <div>
          {colorize('MySQL', 'color-mysql')}, {colorize('Elasticsearch', 'color-elasticsearch')}, 
          {colorize('LogStash', 'color-logstash')}, {colorize('Kibana', 'color-kibana')},
          {colorize('Qdrant', 'color-qdrant')}
        </div>
      </div>
      
      <div style={{ display: 'flex', marginTop: '5px' }}>
        <div style={{ width: '120px' }}>Analytics/ML:</div>
        <div>
          {colorize('NumPy', 'color-numpy')}, {colorize('Pandas', 'color-pandas')}, 
          {colorize('BeautifulSoup4', 'color-bs4')}, {colorize('PyTorch', 'color-pytorch')},
          {colorize('openCV', 'color-opencv')}, {colorize('Pillow', 'color-pillow')},
          {colorize('scikit-learn', 'color-sklearn')}, {colorize('imagehash', 'color-imagehash')}
        </div>
      </div>
      
      <div style={{ display: 'flex', marginTop: '5px' }}>
        <div style={{ width: '120px' }}>Infrastructure:</div>
        <div>
          {colorize('AWS', 'color-aws')}, {colorize('Naver Cloud', 'color-ncp')}, 
          {colorize('Docker', 'color-docker')}, {colorize('Docker-Compose', 'color-docker-compose')},
          {colorize('Kubernetes', 'color-k8s')}, {colorize('Linux (Ubuntu)', 'color-linux')}
        </div>
      </div>
      
      <div style={{ display: 'flex', marginTop: '5px' }}>
        <div style={{ width: '120px' }}>CI/CD:</div>
        <div>
          {colorize('GitHub Actions', 'color-github-actions')}
        </div>
      </div>

      <div style={{ display: 'flex', marginTop: '5px' }}>
        <div style={{ width: '120px' }}>Monitoring:</div>
        <div>
          {colorize('Kafka ui', 'color-kafka-ui')}
        </div>
      </div>

      <div style={{ display: 'flex', marginTop: '5px' }}>
        <div style={{ width: '120px' }}>Dev Utils:</div>
        <div>
          {colorize('python-dotenv', 'color-dotenv')}, {colorize('Tenacity', 'color-tenacity')}, 
          {colorize('CacheTools', 'color-cachetools')}, {colorize('Requests', 'color-requests')},
          {colorize('pytest', 'color-pytest')}
        </div>
      </div>
    </div>
    
    <p style={{ marginTop: '15px' }}>주요 관심 분야: 웹 개발, 인공지능, 자연어처리, 그래프 신경망, 추천 시스템</p>
  </div>
);

const aboutInfo = `안녕하세요! 저는 웹 기술과 인공지능에 관심이 많은 개발자입니다. 프론트엔드에서 백엔드까지 전체 스택을 다루고 있으며, 최근에는 LLM 기반 AI 시스템과 그래프 신경망 연구에 집중하고 있습니다.

저는 사용자 경험을 향상시키고 효율적인 웹 애플리케이션을 개발하는 데 열정을 가지고 있습니다. 문제 해결을 위한 창의적인 접근 방식과 지속적인 학습을 중요시합니다.

학부에서는 코드15 팀의 일원으로 AI 기반 홈트레이닝 플랫폼 "핏-시방"을 개발했으며, 해당 프로젝트로 학술대회 우수논문상을 수상했습니다. 석사과정에서는 그래프 컨볼루션 네트워크 최적화 연구로 SCIE 저널에 논문을 게재하였습니다.

외주 프로젝트로는 건물 손상 점검 자동화 시스템 "Crack-Automation"을 개발했으며, 연구실 프로젝트로는 Smart IoT 연구실 홈페이지를 개편했습니다.

최근에는 가짜연구소 6기 "그래프로 설득하기" 팀에서 GNN 연구 프로젝트를 수행하고, "쌤모아" 프로젝트에서 AI 엔지니어링 및 API 개발을 담당했습니다.
`;

const educationInfo = `
# 학력 정보

## [2022 - 2024] 경기대학교 컴퓨터공학과 석사
- 논문: "추천 시스템에서 그래프 컨볼루션 네트워크 최적화 방법"
- GPA: **4.3/4.5**
- SCIE 논문 3편 게재 (인용 13회)

## [2017 - 2022] 경기대학교 컴퓨터공학부 학사
- GPA: **3.9/4.5**
- 캡스톤디자인 프로젝트 장려상 수상
- KIIT 학술대회 우수논문상(동상) 수상
`;

const contactInfo = `
다음 방법으로 연락하실 수 있습니다:

이메일: dodo9249@gmail.com
GitHub: https://github.com/d9249
LinkedIn: https://linkedin.com/in/meanl

협업 또는 그냥 인사를 나누고 싶으시면 언제든지 연락해주세요!
`;

const researchInfo = `
# 연구 출판물 (2021-2024): 총 16편

## 국제 저널 (SCIE): 3편
- Computers Materials & Continua (CMC): 2편
- MDPI in Electronics: 1편

## 국내 저널 (KCI): 2편
- JKIIT: 2편

## 국제 학회: 6편
- APIC-IST, ICONI, ICSMB 등 발표

## 국내 학회: 4편
- KIIT, KSII, SEBS 등 발표

## 주요 연구 분야:
1. **추천 시스템 / GNN**: SCIE 2편, KCI 1편, 인용 5회
   - GCN 최적화, 추천 시스템 성능 향상

2. **의료 영상 / 딥러닝**: SCIE 1편, KCI 1편, 인용 7회
   - 관절염 진단, 의료 영상 분할

## 주요 성과:
- **KIIT Best Paper Award**
- **APIC-IST Best Paper 선정**
- 최다 인용 논문: 7회 (SCIE)
- 석사 학위 취득 (2024)
`;

const projectsInfo = `
다음은 제가 진행한 주요 프로젝트들입니다:

1. 쌤모아 (현재) - AI 엔지니어링 및 API 개발
   - LLM 기반 교육 플랫폼 개발, LangGraph 활용 상태 기반 에이전트 구현
   - Next.js, FastAPI, LangChain, Docker 기술 스택 활용

2. 연구실 홈페이지 개편 (2023) - 프론트 개발, 유지관리
   - 경기대학교 Smart IoT 연구실 웹사이트 아키텍처 현대화
   - Vue.js, Node.js, Express, MySQL, Nginx 기술 스택 활용

3. 가짜연구소 GNN 연구 (2022) - Docker 기반 통합 학습 환경 구축
   - GraphGym 라이브러리 기반 실험 환경 셋업
   - HIV 억제 분자 탐색을 위한 프로젝트 실험 구현

4. Crack-Automation 외주 (2021-2022) - 팀리더, 프론트 개발
   - 건물 손상 점검 및 보고 자동화 시스템 개발
   - Python, Django, OpenCV, OpenPyXL 기술 스택 활용

5. 핏-시방 캡스톤 디자인 (2021) - 팀리더, 프론트 개발
   - AI 기반 홈트레이닝 플랫폼 개발, PoseNet 활용 자세 추정
   - React, Node.js, MongoDB, PoseNet 기술 스택 활용
   - 한국정보기술학회 논문 게재 및 우수논문상(동상) 수상

Type 'projects <번호>'를 입력하면 각 프로젝트에 대한 자세한 정보를 볼 수 있습니다.
`;

const projectDetails = [
  {
    id: 1,
    name: "쌤모아",
    description: "AI 시스템 설계와 API 개발에 전문성을 갖춘 엔지니어로서, LLM을 활용한 고급 AI 워크플로우 개발을 진행했습니다. 사용자 학습 데이터를 분석하여 개인화된 학습 계획과 자료를 제공하는 AI 기반 교육 플랫폼을 개발했습니다. LangGraph를 활용한 상태 기반 에이전트가 사용자의 학습 진행 상황에 맞춤형 피드백을 제공합니다.",
    technologies: "Next.js, FastAPI, LangChain, LangGraph, PostgreSQL, Docker",
    role: "AI 엔지니어링 & API 개발",
    achievements: "고성능 API 게이트웨이 구축, LLM 추론 시간 단축, 인프라 비용 절감",
    link: "https://github.com/username/teachme-ai"
  },
  {
    id: 2,
    name: "연구실 홈페이지",
    description: "경기대학교 Smart IoT 연구실 홍보 웹사이트의 전면적인 개편 및 시스템 아키텍처 현대화를 담당했습니다. 프론트엔드는 Vue CLI 기반 SPA로 개발하고, 백엔드는 Express 기반 API 서버로 구축했습니다. TipTap 에디터 기반 콘텐츠 관리, 연구실 Publication 및 연구 성과 관리, 연구원 및 졸업생 정보 관리 기능을 구현했습니다.",
    technologies: "Vue.js, Node.js, Express, MySQL, Nginx, Let's Encrypt, CentOS 7",
    role: "프론트 개발, 유지관리",
    achievements: "정적 SPA 구조 도입, HTTPS 보안 통신 적용, PM2 무중단 서비스 구현",
    link: "https://github.com/Smart-IoT-Lab/Lab-Homepage"
  },
  {
    id: 3,
    name: "가짜연구소 GNN 연구",
    description: "가짜연구소 6기 '그래프로 설득하기' 팀의 일원으로 Graph Neural Network(GNN)에 대한 4개월 간의 집중 연구를 수행했습니다. 다양한 GNN 아키텍처와 Aggregation 방식에 따른 성능 차이를 비교하고, 분자 구조를 효과적으로 모델링하는 최적의 GNN 구조를 탐색했습니다. Docker를 활용한 통합 학습 환경을 구축하고, GraphGym 라이브러리 기반 실험 환경을 셋업했습니다.",
    technologies: "Python, PyTorch, GraphGym, Docker, ogbg-molpcba 데이터셋",
    role: "학습 환경 구축, 프로젝트 실험 구현",
    achievements: "최적 GNN 모델 아키텍처 도출, 팀 시너지 창출, HIV 억제 분자 연구",
    link: "https://github.com/username/graph-persuade"
  },
  {
    id: 4,
    name: "Crack-Automation",
    description: "시설물 안전점검 업무에서 건물 균열 이미지 평탄화, 길이 측정, 보고서 생성을 자동화하여 건물 유지관리 회사의 작업 효율성을 개선하는 시스템을 개발했습니다. OpenCV 기반 균열 이미지 평탄화 알고리즘을 구현하고, 이미지 내 균열 길이 및 면적 측정 기능을 개발했습니다. OpenPyXL을 활용한 Excel 보고서 자동 생성 기능도 구현했습니다.",
    technologies: "Python, Django, OpenCV, OpenPyXL, JavaScript, 윤고딕 폰트",
    role: "팀리더, 프론트 개발",
    achievements: "건물 유지 관리 작업 효율성 50% 향상, 데이터 처리 시간 75% 단축",
    link: "https://github.com/HHFEHH/crack-automation"
  },
  {
    id: 5,
    name: "핏-시방 (Fit-sibang)",
    description: "코로나19 범유행으로 인한 외부 활동 제약 환경에서 AI 자세 추정을 통해 모든 기기로 접속 가능한 홈트레이닝 플랫폼을 개발했습니다. Google의 PoseNet과 Teachable Machine을 활용해 17개 신체 부위 키포인트를 실시간 추적하고 분석하는 시스템을 구현했습니다. 스쿼트, 런지, 플랭크 등 다양한 운동 자세 학습 모델을 구현하고, 자세별 정확도 판정 및 카운트 시스템 알고리즘을 개발했습니다.",
    technologies: "React, Node.js, MongoDB, PoseNet, Teachable Machine",
    role: "팀리더, 프론트 개발",
    achievements: "한국정보기술학회 논문 게재 및 우수논문상(동상) 수상, 경기대학교 캡스톤디자인전시회 장려상 수상",
    link: "https://github.com/KGU-Code-15/fit-sibang"
  }
];

// 경력 정보
const careerInfo = `
# 인공지능연구소: Deep Learning

## 핵심 기술 역량

* **언어 모델 & RAG 기술**
   * 거대/소형 언어 모델 활용 시스템 개발 (Agent, RAG, Prompt Engineering)
   * 멀티모달, 임베딩 모델 활용 시스템 개발

* **컴퓨터 비전 & 멀티모달 기술**
   * 영상처리 알고리즘 개발 (OpenCV, imagehash)
   * 특정 객체 인식 멀티모달 모델 및 개방형 객체 탐지 시스템 개발

* **MLOps & 인프라 구축**
   * 머신러닝 모델 서빙 및 API 구축 (Docker, FastAPI, Apache Kafka, OAuth2)
   * 컨테이너 기반 배포 자동화 및 모니터링 (Kubernetes, ELK Stack)
   * CI/CD 및 클라우드 인프라 관리 (GitHub Actions, NCP, AWS, GCP)
   * 벡터 데이터베이스 구축 및 활용 (Qdrant)

## 주요 성과

* **혁신 제품 개발 및 기술 리더십**
   * 'Booxedit' 사업 기획 및 시스템 개발
   * 'arti': CES 2025 인공지능 부문 Best of Innovation - Honoree 수상 (기술 자문/개발 주도)
   * 'booxTory': CES 2025 인공지능 부문 Best of Innovation 수상 (AI 엔진 개발 총괄)

* **R&D 및 정부 사업 수행**
   * 인공지능 과제 수주 및 기술 Lead 수행, 사업계획서 작성 및 PoC 제안
   * 문화체육관광부 한국콘텐츠진흥원 인공지능 콘텐츠 제작지원 사업 협약 수행 (2024년, 2025년)
   * 2025 월드IT쇼(WIS 2025) 혁신상 과학기술정보통신부 장관상 수상
   * 2025년 AI바우처 운영지원 사업 공급기업 선정 - AI 기술 Lead 수행

* **프로젝트 총괄**
   * CLEAR, MAVIS, MERGE, NEXIS 프로젝트 총괄
`;

// 연구 정보 - 세분화
const thesisInfo = `
# Master's thesis (학위 논문)

**추천 시스템에서 그래프 컨볼루션 네트워크 최적화 방법** : Optimization methods of Graph Convolution Networks for Recommendation Systems
* Master's thesis, UCI: I804:41002-000000057783, 22 February 2024.
* dCollection: http://www.dcollection.net/handler/kyonggi/000000057783, 1st author.
`;

const internationalJournalInfo = `
# International journal (국제 논문)

## Deep Learning Model Ensemble for the Accuracy of Classification Degenerative Arthritis
* **SCIE(Q2)**-Computers Materials & Continua (CMC), vol. 75, no. 1, pp. 1981-1994, 06 February 2023. 
* Citation 7회, DOI: https://doi.org/10.32604/cmc.2023.035245, 1st author.

## Weighted Forwarding in Graph Convolution Networks for Recommendation Information System
* **SCIE(Q2)**-Computers Materials & Continua (CMC), vol. 78, no.2, pp. 1897–1914, 31 January 2024. 
* DOI: https://doi.org/10.32604/cmc.2023.046346, 1st author.

## Embedding Enhancement method for LightGCN in Recommendation Information Systems
* **SCIE(Q2)**-Multidisciplinary Digital Publishing Institute(MDPI) in Electronics, vol. 13 no. 12, 11 June 2024. 
* Citation 4회, DOI: https://doi.org/10.3390/electronics13122282, 1st author
`;

const internationalConferenceInfo = `
# International conference (국제 학회)

## Egress Initialization for Graph Convolution Network in Recommendation Systems
* The 15th International Conference on Internet (ICONI 2023), 1st author.

## Thin Graph Convolution Network in Recommendation Systems
* The 15th International Conference on Internet (ICONI 2023), 1st author.

## Over-smoothing in LightGCN doesn't happen much
* The 15th International Conference on Internet (ICONI 2023), 1st author.

## Leverage time-based data to improve recommendation system accuracy
* The 18th Asia Pacific International Conference on Information Science and Technology(APIC-IST), 1st author

## Using Deep Learning for Medical Automation in Diagnosis of Degenerative Arthritis
* The 8th international Conference for Small and Medium Business 2023(ICSMB), 1st author

## Classification of degenerative arthritis using Xception model in radiographic images
* The 17th Asia Pacific International Conference on Information Science and Technology(APIC-IST), 1st author
* This paper was selected as one of the best papers of APIC-IST 2022 and recommended for publication in CMC-Computers, Materials & Continua (CMC).
`;

const domesticJournalInfo = `
# Domestic journal (국내 논문)

## Graph Neural Network 기반 추천시스템 성능 향상을 위한 유저 행동 시간 기반 데이터 사용 방안 분석
* **KCI**-The Journal of Korean Institute of Information Technology(JKIIT), 
* vol. 21, No. 5, pp. 21-28, 2023, ISSN: 1598-8619 (Print) 2093-7571 (Online),
* DOI : https://doi.org/10.14801/jkiit.2023.21.5.21, 1st author

## 의료 영상 시스템에서 다중 연쇄 U-Net 모델을 이용한 개선된 췌장 영역 분할 탐지
* **KCI**-The Journal of Korean Institute of Information Technology(JKIIT), 
* vol. 20, No. 5, pp. 81-87, 2022, ISSN: 1598-8619 (Print), 2093-7571 (Online),
* DOI: https://doi.org/10.14801/jkiit.2022.20.5.81, 1st author
`;

const domesticConferenceInfo = `
# Domestic conference (국내 학회)

## 이상 점수 임계값 선택 기준에 따른 비지도 이상치 탐지 방법의 성능 분석
* KSII Summer Conference, 2023, 2st author

## GNN 기반 딥러닝 모델에서 시간-공간 Attention 모듈 구조에 따른 교통 흐름 예측 성능 분석
* KSII SPRING Conference, 2023, 2st author

## 추천 시스템 성능 개선을 위한 시간 기반 데이터 분석
* KSII SPRING Conference, 2023, 1st author

## SDN 환경에서 오토 인코더 모델을 활용한 플로우 분류 기법
* KICS Winter Conference, vol.80, 2023, ISSN 2383-8302, 2023, 3st author

## 추천 시스템을 활용한 캐싱 서버 최적화
* SEBS Fall Conference, 2022, 1st author

## RFID 태그를 통한 출결 확인 시스템 구현
* KSII SPRING Conference, 2022, 3st author

## 겹친 문자 이미지 분류를 위한 합성곱 신경망 모델의 정확도 분석
* KSII Fall Conference, 2021, 1st author

## PoseNet을 활용한 헬스 트레이너 웹 서비스
* KIIT Conference, pp. 729 - 733. 2021.06, 1st author
* Citation 1회, **KIIT Best Paper Award**
`;

const allResearchInfo = `
# Master's thesis (학위 논문)

**추천 시스템에서 그래프 컨볼루션 네트워크 최적화 방법** : Optimization methods of Graph Convolution Networks for Recommendation Systems
* Master's thesis, UCI: I804:41002-000000057783, 22 February 2024.
* dCollection: http://www.dcollection.net/handler/kyonggi/000000057783, 1st author.

# International journal (국제 논문)

## Deep Learning Model Ensemble for the Accuracy of Classification Degenerative Arthritis
* **SCIE(Q2)**-Computers Materials & Continua (CMC), vol. 75, no. 1, pp. 1981-1994, 06 February 2023. 
* Citation 7회, DOI: https://doi.org/10.32604/cmc.2023.035245, 1st author.

## Weighted Forwarding in Graph Convolution Networks for Recommendation Information System
* **SCIE(Q2)**-Computers Materials & Continua (CMC), vol. 78, no.2, pp. 1897–1914, 31 January 2024. 
* DOI: https://doi.org/10.32604/cmc.2023.046346, 1st author.

## Embedding Enhancement method for LightGCN in Recommendation Information Systems
* **SCIE(Q2)**-Multidisciplinary Digital Publishing Institute(MDPI) in Electronics, vol. 13 no. 12, 11 June 2024. 
* Citation 4회, DOI: https://doi.org/10.3390/electronics13122282, 1st author

[더 많은 연구 실적을 보려면 특정 카테고리 명령어를 사용하세요: /research international-conference, /research domestic-journal, /research domestic-conference]
`;

// 명령어 실행 함수
export const executeCommand = (input: string): CommandResult => {
  const parts = input.trim().split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case 'help':
      return { output: helpInfo };
    
    case 'about':
      return { output: aboutInfo };
    
    case 'skills':
      return { output: skillsInfo };
    
    case 'education':
      return { output: educationInfo };
      
    case 'career':
      return { output: careerInfo };
    
    case 'research':
      if (args.length === 0) {
        return { output: researchInfo };
      }
      
      const researchType = args[0].toLowerCase();
      switch (researchType) {
        case 'thesis':
          return { output: thesisInfo };
        case 'international-journal':
          return { output: internationalJournalInfo };
        case 'international-conference':
          return { output: internationalConferenceInfo };
        case 'domestic-journal':
          return { output: domesticJournalInfo };
        case 'domestic-conference':
          return { output: domesticConferenceInfo };
        case 'all':
          return { output: allResearchInfo };
        default:
          return { output: `유효하지 않은 연구 카테고리입니다. 다음 카테고리 중 하나를 선택하세요: thesis, international-journal, international-conference, domestic-journal, domestic-conference, all`, isError: true };
      }
    
    case 'projects':
      if (args.length === 0) {
        return { output: projectsInfo };
      }
      
      const projectId = parseInt(args[0]);
      if (isNaN(projectId) || projectId < 1 || projectId > projectDetails.length) {
        return { output: `유효하지 않은 프로젝트 번호입니다. 1부터 ${projectDetails.length}까지의 번호를 입력하세요.`, isError: true };
      }
      
      const project = projectDetails[projectId - 1];
      return {
        output: `
프로젝트 이름: ${project.name}
역할: ${project.role}

설명:
${project.description}

사용 기술:
${project.technologies}

주요 성과:
${project.achievements}

링크: ${project.link}
        `
      };
    
    case 'contact':
      return { output: contactInfo };
    
    case 'whoami':
      return { output: "당신은 제 이력을 탐색하는 호기심 많은 방문자입니다. 환영합니다!" };
    
    case '':
      return { output: '' };
    
    default:
      return {
        output: `'${command}': 명령어를 찾을 수 없습니다. 사용 가능한 명령어 목록을 보려면 'help'를 입력하세요!`,
        isError: true
      };
  }
};

export const getWelcomeMessage = (): string => {
  return welcomeMessage;
};