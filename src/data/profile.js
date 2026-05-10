export const heroLinks = [
  {
    label: "Email",
    href: "mailto:dodo9249@gmail.com",
  },
  {
    label: "GitHub",
    href: "https://github.com/d9249",
  },
  {
    label: "Google Scholar",
    href: "https://scholar.google.co.kr/citations?hl=ko&user=JcGG1pMAAAAJ",
  },
  {
    label: "ORCID",
    href: "https://orcid.org/0000-0002-7720-8622",
  },
];

export const evidenceItems = [
  {
    label: "enterprise ai",
    value: "Hybrid RAG",
    description:
      "Knowledge Graph와 Vector retrieval, plugin chunking, XML parsing, LLM observability를 결합해 사내 지식 관리 시스템을 제품화했습니다.",
  },
  {
    label: "document ai",
    value: "TEDS 0.9188",
    description:
      "OCR bbox, line segment, parser-driven reconstruction, benchmark router를 묶어 테이블 구조 복원 품질과 운영 검증 체계를 만들었습니다.",
  },
  {
    label: "minister awards",
    value: "장관상 2회",
    description:
      "WIS 2025 혁신상과 Plan2Do 산업안전 플랫폼 성과에서 장관상급 수상으로 AI 제품화와 현장 적용성을 인정받았습니다.",
  },
  {
    label: "product ai",
    value: "CES 2025",
    description:
      "booxTory Best of Innovation, arti Honoree에 기여하며 생성, 편집, 추천 AI를 실제 제품 경험으로 연결했습니다.",
  },
  {
    label: "research",
    value: "SCIE 3 / KCI 2",
    description:
      "LightGCN, WF-GCN, 의료영상 딥러닝을 중심으로 추천 시스템과 의료 AI 연구 성과를 논문으로 축적했습니다.",
  },
  {
    label: "modeling",
    value: "Top 1% 7회",
    description:
      "DACON 39개 대회, 상위 1% 7회, HD현대 AI Challenge 4위로 실전 문제 정의와 모델링 역량을 검증했습니다.",
  },
];

export const profileTags = [
  "Advanced RAG",
  "Knowledge Graph",
  "Multi-Agent Orchestration",
  "Document OCR",
  "Table Reconstruction",
  "Recommendation Systems",
  "Medical Imaging",
  "LLM Observability",
];

export const timelineItems = [
  {
    date: "2025.07 - now",
    title: "AsianaIDT, AI/ML Engineer & Researcher",
    description:
      "엔터프라이즈 규정, 법령, 문서 도메인을 대상으로 RAG, 에이전트, OCR 플랫폼을 제품 수준으로 설계하고 운영합니다.",
    bullets: [
      "Enterprise AI 지식 관리 시스템에서 Knowledge Graph와 Vector를 결합한 hybrid RAG, plugin chunking, XML parsing, LLM observability를 구축했습니다.",
      "문서 OCR 및 테이블 복원 플랫폼에서 parser-driven reconstruction, benchmark router, Next.js console, secure build 흐름을 고도화했습니다.",
      "Market Intelligence 시스템에서 4-Layer architecture와 25-agent orchestration으로 시장 조사 자동화 파이프라인을 설계했습니다.",
    ],
  },
  {
    date: "2024.07 - 2025.07",
    title: "ArtygenSpace, AI/ML Engineer",
    description:
      "AI 기반 콘텐츠 제품의 모델 설계, 추천, 생성, 편집 워크플로를 담당하며 CES 2025 수상 제품의 AI 기능 개발을 주도했습니다.",
    bullets: [
      "booxTory와 arti의 AI 기능을 설계해 CES 2025 AI Innovation Awards 성과에 기여했습니다.",
      "StoryMate, Booxedit, KOCCA AI 콘텐츠 지원 사업, AI 바우처 공급기업 프로젝트를 수행했습니다.",
      "콘텐츠 생성, 사용자 선호 기반 추천, 편집 자동화 기능을 제품 요구사항에 맞춰 연결했습니다.",
    ],
  },
  {
    date: "2022 - 2024",
    title: "Kyonggi University, Computer Science M.S.",
    description:
      "추천 시스템에서 그래프 컨볼루션 네트워크 최적화 방법을 연구하고 LightGCN, WF-GCN, 의료영상 딥러닝 논문을 발표했습니다.",
    bullets: [
      "석사 논문: 추천 시스템에서 그래프 컨볼루션 네트워크 최적화 방법.",
      "석사 GPA 4.25/4.5, 학부 GPA 3.62/4.5, ABEEK 공학인증.",
      "APIC-IST 2022 Best Paper Award, KIIT Best Paper Award를 수상했습니다.",
    ],
  },
];

export const projectItems = [
  {
    slug: "enterprise-ai-knowledge",
    title: "Enterprise AI 지식 관리 시스템",
    period: "AsianaIDT / 2025.09 - 2026.01",
    summary:
      "기업 내부 지식, 규정, 문서 자료를 검색 가능한 AI 지식 체계로 전환한 hybrid RAG 플랫폼입니다.",
    metrics: ["Graph + Vector RAG", "Multi-Agent", "LLM Observability"],
    stack: ["LangGraph", "FastAPI", "Milvus", "Neo4j", "Langfuse"],
    details: [
      "Knowledge Graph 기반 관계 탐색과 Vector retrieval을 함께 사용해 구조적 지식과 의미 검색을 결합했습니다.",
      "Multi-Layer 비동기 처리 구조, plugin chunking, XML parsing으로 문서 수집부터 답변 생성까지의 흐름을 운영 관점에서 정리했습니다.",
      "LLM 호출, 검색 근거, fallback, latency를 추적하는 관찰성 구성을 통해 엔터프라이즈 환경의 검증 가능성을 높였습니다.",
    ],
    sections: [
      {
        title: "Problem",
        body: "사내 규정, 법령, 제안서, 기술 문서처럼 출처와 버전이 중요한 자료는 단순 벡터 검색만으로는 답변 근거를 설명하기 어렵습니다. 사용자는 빠른 답변을 원하지만 운영자는 어떤 문서와 관계를 따라 답변이 만들어졌는지 확인할 수 있어야 했습니다.",
      },
      {
        title: "Approach",
        body: "문서 chunking, XML parsing, metadata enrichment를 수집 단계에 배치하고, Knowledge Graph 탐색과 Vector retrieval을 함께 사용하는 hybrid RAG 구조로 설계했습니다. LangGraph 기반 흐름에서 검색, 재순위화, 답변 생성, fallback을 분리하고 Langfuse로 호출 근거와 latency를 추적했습니다.",
      },
      {
        title: "Impact",
        body: "질문-문서-관계-답변 흐름을 추적 가능한 단위로 정리해 엔터프라이즈 환경에서 설명 가능한 AI 지식 관리 기반을 만들었습니다. 이후 OCR, 시장조사 에이전트, 내부 지식 검색 프로젝트로 확장 가능한 공통 운영 패턴도 확보했습니다.",
      },
    ],
  },
  {
    slug: "document-ocr-table-reconstruction",
    title: "문서 OCR / 테이블 구조 복원 플랫폼",
    period: "AsianaIDT / 2026.02 - now",
    summary:
      "문서 이미지에서 OCR 결과와 선분 정보를 결합해 표 구조를 복원하고, 벤치마크와 운영 콘솔까지 연결한 Document AI 플랫폼입니다.",
    metrics: ["TEDS 0.9188", "TEDS-S 0.9506", "Cell F1 0.9702"],
    stack: ["Python", "FastAPI", "Next.js", "Prometheus", "Grafana"],
    details: [
      "row/column grouping, spanned cell 복원, parser-driven reconstruction으로 복잡한 표의 구조적 일관성을 개선했습니다.",
      "hf_korean_table 100 기준 TEDS 0.9174, Cell F1 0.9934, row accuracy 1.00, column accuracy 0.96을 기록했습니다.",
      "hf_finance_legal_mrc 480 최신 실행에서 TEDS 0.9188을 기록하고, benchmark router와 콘솔로 반복 검증 흐름을 만들었습니다.",
    ],
    sections: [
      {
        title: "Problem",
        body: "표 문서는 텍스트 인식만으로는 셀 병합, 행/열 경계, header/body 관계가 사라지기 쉽습니다. 실제 업무 문서에서는 OCR 결과를 사람이 재정리해야 하는 비용이 커서 구조 복원 품질과 반복 검증 체계가 함께 필요했습니다.",
      },
      {
        title: "Approach",
        body: "OCR bbox, line segment, parser output을 결합해 row/column grouping과 spanned cell 복원을 수행했습니다. benchmark router와 Next.js console을 연결해 데이터셋별 지표를 비교하고, Prometheus/Grafana 기반 관찰성으로 실행 상태를 확인할 수 있게 구성했습니다.",
      },
      {
        title: "Impact",
        body: "hf_finance_legal_mrc 480 기준 TEDS 0.9188, TEDS-S 0.9506, Cell F1 0.9702를 기록했고, hf_korean_table 100 기준 Cell F1 0.9934까지 검증했습니다. 모델 개선뿐 아니라 운영 콘솔과 벤치마크 흐름까지 묶은 Document AI 플랫폼 형태로 정리했습니다.",
      },
    ],
  },
  {
    slug: "market-intelligence-agents",
    title: "Market Intelligence Multi-Agent System",
    period: "AsianaIDT / 2025.07 - 2025.11",
    summary:
      "시장 조사, 내부 자산 검색, 외부 검색, 검증을 분리한 4-Layer 기반 엔터프라이즈 GenAI orchestrator입니다.",
    metrics: ["25 agents", "4-Layer", "Dual Knowledge Base"],
    stack: ["AWS Lambda", "DynamoDB", "EventBridge", "Brave Search"],
    details: [
      "Internal Asset과 Brave Search를 결합한 Dual Knowledge Base로 사내 자료와 공개 웹 근거를 함께 사용했습니다.",
      "25개 전문 에이전트가 조사, 요약, 검증, 보고 흐름을 분담하도록 custom orchestrator를 구성했습니다.",
      "self-reflection과 단계별 상태 관리를 포함해 장시간 시장 조사 태스크를 추적 가능한 작업 단위로 분해했습니다.",
    ],
    sections: [
      {
        title: "Problem",
        body: "시장 조사 업무는 내부 레퍼런스, 공개 웹 자료, 경쟁사 동향, 검증 가능한 출처가 동시에 필요합니다. 단일 챗봇 방식으로는 긴 조사 과정을 유지하기 어렵고, 어느 단계에서 어떤 근거가 사용됐는지 추적하기도 어렵습니다.",
      },
      {
        title: "Approach",
        body: "조사, 검색, 검증, 보고 생성을 분리한 4-Layer 구조를 만들고 25개 전문 에이전트가 역할별로 협업하도록 설계했습니다. Internal Asset과 Brave Search를 결합한 Dual Knowledge Base를 두어 사내 자산과 외부 근거를 함께 활용했습니다.",
      },
      {
        title: "Impact",
        body: "긴 시장 조사 태스크를 상태 기반 작업 단위로 나누고 self-reflection을 붙여 반복 가능한 GenAI 업무 파이프라인으로 만들었습니다. 결과적으로 조사 자동화뿐 아니라 내부 자료 활용성과 출처 검증성을 함께 강화했습니다.",
      },
    ],
  },
  {
    slug: "booxtory-arti-ai-products",
    title: "booxTory / arti AI Products",
    period: "ArtygenSpace / 2024.07 - 2025.07",
    summary:
      "AI 콘텐츠 생성과 편집, 사용자 경험을 제품 기능으로 연결한 CES 2025 수상 제품군입니다.",
    metrics: ["CES 2025", "Best of Innovation", "Honoree"],
    stack: ["Python", "LLM", "Recommendation", "Content AI"],
    details: [
      "booxTory는 CES 2025 AI 부문 Best of Innovation, arti는 CES 2025 Honoree 성과를 기록했습니다.",
      "콘텐츠 생성, 편집 보조, 사용자 행동 기반 추천 흐름을 실제 서비스 요구사항에 맞게 설계했습니다.",
      "KOCCA AI 콘텐츠 지원 사업과 AI 바우처 공급기업 프로젝트에서 제품형 AI 기능을 확장했습니다.",
    ],
    sections: [
      {
        title: "Problem",
        body: "AI 콘텐츠 제품은 모델 성능만으로 완성되지 않고, 사용자가 실제 창작 과정에서 반복적으로 쓰는 생성, 편집, 추천 흐름이 함께 설계되어야 합니다. 제품 목표와 연구형 기능 사이의 간극을 줄이는 것이 핵심이었습니다.",
      },
      {
        title: "Approach",
        body: "booxTory와 arti에서 콘텐츠 생성, 편집 보조, 사용자 선호 기반 추천 흐름을 제품 기능으로 연결했습니다. StoryMate, Booxedit, KOCCA AI 콘텐츠 지원 사업, AI 바우처 공급기업 프로젝트를 수행하며 서비스 요구사항에 맞는 AI 기능을 확장했습니다.",
      },
      {
        title: "Impact",
        body: "booxTory는 CES 2025 AI 부문 Best of Innovation, arti는 CES 2025 Honoree 성과를 기록했습니다. AI 모델링을 사용자 경험과 제품 지표로 연결하는 제품형 개발 경험을 축적했습니다.",
      },
    ],
  },
  {
    slug: "lightgcn-wfgcn-recommender",
    title: "LightGCN / WF-GCN / OptGCN 추천 시스템 연구",
    period: "Kyonggi University / M.S. Research",
    summary:
      "사용자-아이템 그래프에서 임베딩 전파와 가중 전달을 개선해 추천 정확도를 높인 그래프 추천 시스템 연구입니다.",
    metrics: ["LightGCN", "WF-GCN", "SCIE"],
    stack: ["PyTorch", "Graph Neural Network", "MovieLens", "Yelp"],
    details: [
      "LightGCN embedding enhancement와 Weighted Forwarding Graph Convolution Network 연구를 SCIE 논문으로 확장했습니다.",
      "MovieLens, FilmTrust, Yelp 등 공개 데이터셋에서 Recall, NDCG 기반 추천 품질을 비교했습니다.",
      "석사 논문에서는 추천 시스템에서 그래프 컨볼루션 네트워크 최적화 방법을 정리했습니다.",
    ],
    sections: [
      {
        title: "Problem",
        body: "사용자-아이템 상호작용 그래프에서는 이웃 노드 정보를 전파하는 과정에서 embedding 표현력이 약해지거나, 모든 연결을 동일하게 취급해 추천 품질이 제한될 수 있습니다. 연구의 초점은 그래프 전파를 더 효율적으로 최적화하는 것이었습니다.",
      },
      {
        title: "Approach",
        body: "LightGCN 계열의 단순화된 그래프 전파 구조를 기반으로 embedding enhancement, weighted forwarding, graph convolution optimization을 실험했습니다. MovieLens, FilmTrust, Yelp 같은 공개 데이터셋에서 Recall과 NDCG를 중심으로 비교했습니다.",
      },
      {
        title: "Impact",
        body: "LightGCN, WF-GCN, OptGCN 관련 연구를 석사 논문과 SCIE 논문으로 확장했습니다. 추천 시스템 연구에서 모델 구조, 데이터셋 실험, 지표 검증을 연결한 연구 기반을 만들었습니다.",
      },
    ],
  },
  {
    slug: "mcu-net-medical-imaging",
    title: "MCU-Net / 의료 영상 딥러닝",
    period: "Kyonggi University / Research Projects",
    summary:
      "췌장 CT segmentation과 퇴행성 관절염 분류를 다룬 의료영상 딥러닝 연구입니다.",
    metrics: ["MCU-Net", "CMC 2023", "77.05% ensemble"],
    stack: ["CNN", "U-Net", "OpenCV", "Medical Imaging"],
    details: [
      "다중 연쇄 U-Net 구조를 활용해 췌장 영역 분할 탐지 성능을 개선했습니다.",
      "퇴행성 관절염 분류에서는 딥러닝 모델 앙상블로 전문의 앙상블 77.05% 기준과 비교한 연구를 수행했습니다.",
      "의료 영상 연구 결과는 CMC 2023 SCIE 논문과 KCI 논문으로 발표했습니다.",
    ],
    sections: [
      {
        title: "Problem",
        body: "의료영상은 관심 영역이 작고 형태 변화가 크며, 데이터 특성상 모델의 안정적인 일반화가 중요합니다. 췌장 영역 분할과 퇴행성 관절염 분류 모두 영상 전처리, 모델 구조, 평가 기준을 신중하게 설계해야 했습니다.",
      },
      {
        title: "Approach",
        body: "췌장 CT segmentation에서는 다중 연쇄 U-Net 기반 MCU-Net 구조를 활용했고, 관절염 분류에서는 딥러닝 모델 앙상블을 구성했습니다. 영상 처리와 CNN 계열 모델을 조합해 병변 또는 관심 영역의 표현을 개선했습니다.",
      },
      {
        title: "Impact",
        body: "의료영상 연구 결과를 CMC 2023 SCIE 논문과 KCI 논문으로 발표했습니다. 제품 프로젝트와는 다른 고위험 도메인에서 데이터 품질, 평가, 모델 설명 가능성을 다루는 연구 경험을 확보했습니다.",
      },
    ],
  },
];

export const paperItems = [
  {
    type: "Master's Thesis",
    title: "추천 시스템에서 그래프 컨볼루션 네트워크 최적화 방법",
    venue: "Kyonggi University dCollection",
    year: "2024",
    description:
      "Optimization methods of Graph Convolution Networks for Recommendation Systems.",
    facts: ["M.S. Thesis", "UCI I804:41002-000000057783", "1st author"],
    href: "http://www.dcollection.net/handler/kyonggi/000000057783",
    linkLabel: "dCollection",
  },
  {
    type: "SCIE Journal",
    title:
      "Embedding Enhancement method for LightGCN in Recommendation Information Systems",
    venue: "Electronics, vol. 13, no. 12",
    year: "2024",
    description:
      "LightGCN 기반 추천 시스템에서 embedding 표현을 강화하는 방법을 제안했습니다.",
    facts: ["SCIE(Q2)", "MDPI Electronics", "1st author"],
    href: "https://doi.org/10.3390/electronics13122282",
    linkLabel: "DOI",
  },
  {
    type: "SCIE Journal",
    title:
      "Weighted Forwarding in Graph Convolution Networks for Recommendation Information System",
    venue: "Computers, Materials & Continua, vol. 78, no. 2",
    year: "2024",
    description:
      "그래프 컨볼루션 네트워크의 가중 전달 전략으로 추천 품질을 개선한 연구입니다.",
    facts: ["SCIE(Q2)", "CMC", "1st author"],
    href: "https://doi.org/10.32604/cmc.2023.046346",
    linkLabel: "DOI",
  },
  {
    type: "SCIE Journal",
    title:
      "Deep Learning Model Ensemble for the Accuracy of Classification Degenerative Arthritis",
    venue: "Computers, Materials & Continua, vol. 75, no. 1",
    year: "2023",
    description:
      "퇴행성 관절염 분류 정확도를 높이기 위한 딥러닝 모델 앙상블 연구입니다.",
    facts: ["SCIE(Q2)", "CMC", "1st author"],
    href: "https://doi.org/10.32604/cmc.2023.035245",
    linkLabel: "DOI",
  },
  {
    type: "KCI Journal",
    title:
      "Graph Neural Network 기반 추천시스템 성능 향상을 위한 유저 행동 시간 기반 데이터 사용 방안 분석",
    venue: "The Journal of Korean Institute of Information Technology",
    year: "2023",
    description:
      "추천 시스템 성능 향상을 위해 사용자 행동 시간 기반 데이터를 분석한 연구입니다.",
    facts: ["KCI", "JKIIT 21(5)", "1st author"],
    href: "https://doi.org/10.14801/jkiit.2023.21.5.21",
    linkLabel: "DOI",
  },
  {
    type: "KCI Journal",
    title:
      "의료 영상 시스템에서 다중 연쇄 U-Net 모델을 이용한 개선된 췌장 영역 분할 탐지",
    venue: "The Journal of Korean Institute of Information Technology",
    year: "2022",
    description:
      "다중 연쇄 U-Net 모델로 의료 영상의 췌장 영역 분할 탐지 성능을 개선한 연구입니다.",
    facts: ["KCI", "JKIIT 20(5)", "1st author"],
    href: "https://doi.org/10.14801/jkiit.2022.20.5.81",
    linkLabel: "DOI",
  },
  {
    type: "International Conference",
    title:
      "Egress Initialization for Graph Convolution Network in Recommendation Systems",
    venue: "The 15th International Conference on Internet (ICONI 2023)",
    year: "2023",
    description:
      "추천 시스템에서 그래프 컨볼루션 네트워크의 egress initialization을 다룬 국제학회 논문입니다.",
    facts: ["ICONI 2023", "Recommendation", "1st author"],
  },
  {
    type: "International Conference",
    title: "Thin Graph Convolution Network in Recommendation Systems",
    venue: "The 15th International Conference on Internet (ICONI 2023)",
    year: "2023",
    description:
      "추천 시스템을 위한 경량 그래프 컨볼루션 네트워크 구조를 다룬 국제학회 논문입니다.",
    facts: ["ICONI 2023", "GNN", "1st author"],
  },
  {
    type: "International Conference",
    title: "Over-smoothing in LightGCN doesn't happen much",
    venue: "The 15th International Conference on Internet (ICONI 2023)",
    year: "2023",
    description:
      "LightGCN에서 over-smoothing 현상을 분석한 추천 시스템 국제학회 논문입니다.",
    facts: ["ICONI 2023", "LightGCN", "1st author"],
  },
  {
    type: "International Conference",
    title: "Leverage time-based data to improve recommendation system accuracy",
    venue:
      "The 18th Asia Pacific International Conference on Information Science and Technology",
    year: "2023",
    description:
      "시간 기반 데이터를 활용해 추천 시스템 정확도를 개선하는 방법을 발표했습니다.",
    facts: ["APIC-IST", "Recommendation", "1st author"],
  },
  {
    type: "International Conference",
    title:
      "Using Deep Learning for Medical Automation in Diagnosis of Degenerative Arthritis",
    venue:
      "The 8th international Conference for Small and Medium Business 2023",
    year: "2023",
    description:
      "퇴행성 관절염 진단 자동화를 위한 딥러닝 기반 의료영상 연구입니다.",
    facts: ["ICSMB 2023", "Medical Imaging", "1st author"],
  },
  {
    type: "International Conference",
    title:
      "Classification of degenerative arthritis using Xception model in radiographic images",
    venue:
      "The 17th Asia Pacific International Conference on Information Science and Technology",
    year: "2022",
    description:
      "Xception 기반 방사선 이미지 퇴행성 관절염 분류 연구로 APIC-IST Best Paper에 선정되었습니다.",
    facts: ["APIC-IST", "Best Paper", "1st author"],
  },
  {
    type: "Domestic Conference",
    title:
      "이상 점수 임계값 선택 기준에 따른 비지도 이상치 탐지 방법의 성능 분석",
    venue: "KSII Summer Conference",
    year: "2023",
    description:
      "비지도 이상치 탐지에서 이상 점수 임계값 선택 기준에 따른 성능 변화를 분석했습니다.",
    facts: ["KSII", "Anomaly Detection", "2nd author"],
  },
  {
    type: "Domestic Conference",
    title:
      "GNN 기반 딥러닝 모델에서 시간-공간 Attention 모듈 구조에 따른 교통 흐름 예측 성능 분석",
    venue: "KSII Spring Conference",
    year: "2023",
    description:
      "시간-공간 Attention 구조가 교통 흐름 예측 성능에 미치는 영향을 분석했습니다.",
    facts: ["KSII", "Traffic Forecasting", "2nd author"],
  },
  {
    type: "Domestic Conference",
    title: "추천 시스템 성능 개선을 위한 시간 기반 데이터 분석",
    venue: "KSII Spring Conference",
    year: "2023",
    description:
      "추천 시스템의 시간 기반 사용자 행동 데이터를 분석한 국내학회 논문입니다.",
    facts: ["KSII", "Recommendation", "1st author"],
  },
  {
    type: "Domestic Conference",
    title: "SDN 환경에서 오토 인코더 모델을 활용한 플로우 분류 기법",
    venue: "KICS Winter Conference, vol. 80",
    year: "2023",
    description:
      "SDN 환경에서 오토 인코더 기반 플로우 분류 기법을 제안했습니다.",
    facts: ["KICS", "Autoencoder", "3rd author"],
  },
  {
    type: "Domestic Conference",
    title: "추천 시스템을 활용한 캐싱 서버 최적화",
    venue: "SEBS Fall Conference",
    year: "2022",
    description:
      "추천 시스템을 활용해 정보 중심 네트워크의 캐싱 서버 최적화를 다룬 논문입니다.",
    facts: ["SEBS", "Recommendation", "1st author"],
  },
  {
    type: "Domestic Conference",
    title: "RFID 태그를 통한 출결 확인 시스템 구현",
    venue: "KSII Spring Conference",
    year: "2022",
    description: "RFID 태그 기반 출결 확인 시스템 구현 내용을 발표했습니다.",
    facts: ["KSII", "RFID", "3rd author"],
  },
  {
    type: "Domestic Conference",
    title: "겹친 문자 이미지 분류를 위한 합성곱 신경망 모델의 정확도 분석",
    venue: "KSII Fall Conference",
    year: "2021",
    description:
      "겹친 문자 이미지 분류를 위한 CNN 모델의 정확도를 분석했습니다.",
    facts: ["KSII", "CNN", "1st author"],
  },
  {
    type: "Domestic Conference",
    title: "PoseNet을 활용한 헬스 트레이너 웹 서비스",
    venue: "KIIT Conference, pp. 729-733",
    year: "2021",
    description:
      "PoseNet 기반 헬스 트레이너 웹 서비스 논문으로 KIIT Best Paper Award를 수상했습니다.",
    facts: ["KIIT", "Best Paper", "1st author"],
  },
];

export const awardItems = [
  {
    title: "Plan2Do 수상",
    result: "안전산업진흥 유공 행정안전부 장관상, 한국건설기술연구원 원장상",
    period: "2025.12",
    description:
      "Plan2Do에 탑재되는 AI 안전도우미와 위험성평가 지원 시스템을 고도화해 AI 산업안전보건 플랫폼의 수상 성과에 기여했습니다.",
    facts: ["Plan2Do", "AI Safety", "Minister Award"],
    links: [
      {
        label: "아시아나IDT 뉴스",
        href: "https://www.asianaidt.com/idthome/pages/ko/company/news_view?mid=2&postid=5109&menu1=1000&menu2=1200",
      },
      {
        label: "아시아나IDT 연혁",
        href: "https://www.asianaidt.com/idthome/pages/ko/company/history?menu1=1000&menu2=1100",
      },
    ],
  },
  {
    title: "CES 2025 AI Innovation Awards",
    result: "booxTory Best of Innovation / arti Honoree",
    period: "2025",
    description:
      "AI 콘텐츠 제품의 AI 엔진 개발과 기술 리더십으로 CES 2025 혁신상 성과에 기여했습니다.",
    facts: ["AI Products", "booxTory", "arti"],
    links: [
      {
        label: "booxTory CES",
        href: "https://www.ces.tech/ces-innovation-awards/2025/booxtory/",
      },
      {
        label: "arti CES",
        href: "https://www.ces.tech/ces-innovation-awards/2025/arti/",
      },
    ],
  },
  {
    title: "WIS 2025 혁신상",
    result: "과학기술정보통신부 장관상",
    period: "2025",
    description:
      "AI 제품화 성과와 기술 경쟁력을 인정받아 월드IT쇼 혁신상 장관상을 수상했습니다.",
    facts: ["Minister Award", "WIS 2025", "Product AI"],
    links: [
      {
        label: "WIS 2025 결과보고서",
        href: "/evidence/wis-2025-result-report.pdf",
      },
    ],
  },
  {
    title: "APIC-IST 2022 Best Paper Award",
    result: "Best Paper Award",
    period: "2022",
    description:
      "Xception 기반 퇴행성 관절염 분류 연구가 APIC-IST Best Paper에 선정되었습니다.",
    facts: ["Medical Imaging", "Xception", "1st author"],
  },
  {
    title: "KIIT Best Paper Award",
    result: "Best Paper Award",
    period: "2021",
    description:
      "PoseNet을 활용한 헬스 트레이너 웹 서비스 논문으로 한국정보기술학회 우수 논문 성과를 기록했습니다.",
    facts: ["PoseNet", "KIIT", "1st author"],
  },
  {
    title: "한국정보기술학회 대학생논문경진대회",
    result: "우수논문상 동상",
    period: "2021",
    description:
      "PoseNet을 활용한 헬스 트레이너 웹 서비스 논문으로 대학생논문경진대회 우수논문상을 수상했습니다.",
    facts: ["No. 21-222", "Bronze", "Paper Contest"],
    href: "https://drive.google.com/file/d/1NvvLVTjTTT6Acwp4czgx7laKNU4t-VCY",
  },
  {
    title: "경기대학교 AI컴퓨터공학부 캡스톤디자인전시회",
    result: "장려상",
    period: "2021",
    description: "핏-시방 프로젝트로 캡스톤디자인전시회 장려상을 수상했습니다.",
    facts: ["No. 2021-0005", "Capstone", "Team Project"],
    href: "https://drive.google.com/file/d/1MivqEeTIQ2nKBn3zSvbrzofHuiUbT1yL",
  },
];

export const competitionItems = [
  {
    title: "LG Aimers 4기",
    result: "팀리더",
    period: "2024.01 - 2024.02",
    description:
      "MQL 데이터 기반 B2B 영업 기회 창출 예측 모델을 개발했습니다. 데이터 정규화, 비즈니스 영역 매핑, XGBoost 모델, 임계값 최적화를 통해 F1-score를 개선했습니다.",
    facts: ["MQL Prediction", "F1-score 0.75154", "Team Leader"],
    href: "https://github.com/d9249/LG_Aimers",
  },
  {
    title: "HD현대 AI Challenge",
    result: "4위",
    period: "2023",
    description:
      "건설기계 센서데이터를 활용한 작업 중량 예측 모델을 개발하고, 시계열 Transformer와 맞춤형 손실 함수로 성능을 끌어올렸습니다.",
    facts: ["4th Place", "Public Score 98.21432", "Time Series Transformer"],
    href: "https://github.com/d9249/HDAIChallenge",
  },
  {
    title: "DACON 경진대회",
    result: "39개 대회 참여",
    period: "2021 - 2024",
    description:
      "컴퓨터 비전, 정형 데이터 분류, 시계열, 추천 시스템 등 다양한 AI 경진대회에 참여하며 데이터 분석과 모델링 경험을 축적했습니다.",
    facts: ["Top 1% 7", "Top 5% 10", "Top 10% 15"],
    href: "/competitions/dacon/",
  },
  {
    title: "가짜연구소 6기",
    result: "그래프로 설득하기 팀원",
    period: "2022.09 - 2022.11",
    description:
      "Graph Neural Network를 주제로 한 비영리 AI 연구 활동에 참여했습니다. GraphGym 기반 실험 환경을 구축하고 GCN, GIN, Virtual Node, Aggregation 방식별 성능을 비교했습니다.",
    facts: ["GNN", "GraphGym", "Team 8"],
    href: "https://www.notion.so/chanrankim/ac12010e21af4431a5f3e8ae2bdc4ee3?pvs=4",
  },
  {
    title: "DIYA",
    result: "AI 연구 및 대회 참여 커뮤니티",
    period: "2021.03 - 2023.02",
    description:
      "Computer Vision Team과 ML/GNN Team에서 논문 리뷰, PyTorch 기반 모델 구현, DACON 대회 참여, 학술발표대회 논문 발표를 수행했습니다.",
    facts: ["Computer Vision", "GNN", "Paper Review"],
    href: "https://doityourselfai.github.io/",
  },
];

export const daconStats = [
  { label: "총 참가 대회", value: "39" },
  { label: "현재 / 최고 랭킹", value: "26 / 10" },
  { label: "전체 인원", value: "128,371명" },
  { label: "상위 1% 성과", value: "7" },
  { label: "상위 5% 성과", value: "10" },
  { label: "상위 10% 성과", value: "15" },
];

export const daconDomainSummary = [
  {
    title: "컴퓨터 비전",
    count: "15개 대회",
    description:
      "이미지 분류, 객체 탐지, 이상치 탐지, 손동작 인식까지 다양한 비전 문제를 다뤘습니다.",
  },
  {
    title: "정형 데이터 분류",
    count: "8개 대회",
    description:
      "전화 해지, 항공편 지연, 법원 판결 예측처럼 피처 해석과 분류 성능이 중요한 문제를 풀었습니다.",
  },
  {
    title: "정형 데이터 회귀",
    count: "6개 대회",
    description:
      "전력 사용량, 제주 특산물 가격, 조선해양 작업 중량처럼 수치 예측 과제를 수행했습니다.",
  },
  {
    title: "자연어 처리",
    count: "4개 대회",
    description:
      "뉴스 기사, 법원 판결, 생성형 AI 활용 과제에서 텍스트 이해와 프롬프트 전략을 실험했습니다.",
  },
  {
    title: "시계열 분석",
    count: "4개 대회",
    description:
      "시간 흐름이 있는 데이터에서 패턴 추출, 검증 전략, 모델 안정성을 함께 다뤘습니다.",
  },
  {
    title: "추천 시스템",
    count: "2개 대회",
    description:
      "웹 기사와 도서 추천 과제에서 사용자-아이템 관계와 랭킹 품질을 모델링했습니다.",
  },
];

export const daconCompetitionItems = [
  {
    title:
      "HAI(하이)! - Hecto AI Challenge : 2025 상반기 헥토 채용 AI 경진대회",
    result: "101 / 748",
    period: "2025",
    description: "비전 기반 분류 문제를 다룬 채용형 AI 경진대회입니다.",
    facts: ["채용", "비전", "분류"],
    href: "https://dacon.io/competitions/official/236493/overview/",
  },
  {
    title: "웹 기사 추천 AI 경진대회",
    result: "62 / 186",
    period: "2024",
    description:
      "웹 로그와 기사 데이터를 활용해 사용자에게 적합한 기사를 추천하는 문제를 풀었습니다.",
    facts: ["정형", "언어", "추천시스템"],
    href: "https://dacon.io/competitions/official/236290/overview/",
  },
  {
    title: "저해상도 조류 이미지 분류 AI 경진대회",
    result: "170 / 385",
    period: "2024",
    description:
      "저해상도 이미지 환경에서 조류 클래스를 분류하는 비전 모델링을 수행했습니다.",
    facts: ["Vision", "분류", "Macro F1"],
    href: "https://dacon.io/competitions/official/236251/overview/",
  },
  {
    title: "모델 튜닝 챌린지 : 월간 데이콘 파일럿",
    result: "175 / 332",
    period: "2024",
    description:
      "노코딩 모델 튜닝 환경에서 하이퍼파라미터 탐색과 AUC 최적화를 경험했습니다.",
    facts: ["정형", "하이퍼파라미터", "AUC"],
    href: "https://dacon.io/competitions/official/236229/overview/",
  },
  {
    title: "반도체 소자 이상 탐지 AI 경진대회",
    result: "75 / 385",
    period: "2024",
    description:
      "반도체 이미지 기반 비지도 이상 탐지 과제에서 결함 패턴을 모델링했습니다.",
    facts: ["비전", "비지도학습", "이상 탐지"],
    href: "https://dacon.io/competitions/official/236224/overview/",
  },
  {
    title: "도배 하자 질의 응답 처리 : 한솔데코 시즌2 생성 AI 경진대회",
    result: "100 / 557",
    period: "2024",
    description:
      "도배 하자 도메인의 질의응답 데이터를 활용해 생성형 AI 응답 품질을 개선했습니다.",
    facts: ["LLM", "QA", "MLOps"],
    href: "https://dacon.io/competitions/official/236216/overview/",
  },
  {
    title: "대학 대항전 : 퍼즐 이미지 AI 경진대회",
    result: "126 / 369",
    period: "2024",
    description:
      "퍼즐 이미지 분류 문제에서 자기지도학습과 비전 모델링을 실험했습니다.",
    facts: ["비전", "자기지도학습", "분류"],
    href: "https://dacon.io/competitions/official/236207/overview/",
  },
  {
    title: "대구 교통사고 피해 예측 AI 경진대회",
    result: "80 / 942",
    period: "2023",
    description:
      "교통사고 피해 규모를 예측하는 정형 회귀 문제에서 지역·시간 피처를 다뤘습니다.",
    facts: ["정형", "회귀", "교통"],
    href: "https://dacon.io/competitions/official/236193/overview/",
  },
  {
    title: "제주 특산물 가격 예측 AI 경진대회",
    result: "213 / 1093",
    period: "2023",
    description: "농산물 가격 변동을 예측하는 시계열 회귀 문제를 수행했습니다.",
    facts: ["정형", "시계열", "농업"],
    href: "https://dacon.io/competitions/official/236176/overview/",
  },
  {
    title: "HD현대 AI Challenge",
    result: "4 / 330",
    period: "2023",
    description:
      "건설기계 센서 데이터를 활용해 작업 중량을 예측하고 예선 4위를 기록했습니다.",
    facts: ["조선해양", "회귀", "MAE"],
    href: "https://dacon.io/competitions/official/236158/overview/",
  },
  {
    title: "월간 데이콘 쇼츠 - 뉴스 기사 레이블 복구 해커톤",
    result: "52 / 129",
    period: "2023",
    description:
      "뉴스 기사 레이블 복구 문제에서 텍스트 분류와 클러스터링 관점을 결합했습니다.",
    facts: ["언어", "분류", "클러스터링"],
    href: "https://dacon.io/competitions/official/236159/overview/",
  },
  {
    title: "제1회 신약개발 AI 경진대회",
    result: "124 / 764",
    period: "2023",
    description:
      "분자 구조 데이터를 활용해 신약 개발 관련 회귀 문제를 수행했습니다.",
    facts: ["분자 구조", "정형", "바이오"],
    href: "https://dacon.io/competitions/official/236127/overview/",
  },
  {
    title: "2023 전력사용량 예측 AI 경진대회",
    result: "306 / 1233",
    period: "2023",
    description: "전력 사용량 변화를 예측하는 에너지 시계열 문제를 다뤘습니다.",
    facts: ["정형", "시계열", "에너지"],
    href: "https://dacon.io/competitions/official/236125/overview/",
  },
  {
    title: "월간 데이콘 법원 판결 예측 AI 경진대회",
    result: "46 / 506",
    period: "2023",
    description:
      "법원 판결 텍스트를 기반으로 결과를 예측하는 자연어 분류 문제를 수행했습니다.",
    facts: ["언어", "분류", "Accuracy"],
    href: "https://dacon.io/competitions/official/236112/overview/",
  },
  {
    title: "합성데이터 기반 객체 탐지 AI 경진대회",
    result: "95 / 855",
    period: "2023",
    description:
      "합성 이미지 데이터에서 객체 탐지 모델의 일반화 성능을 실험했습니다.",
    facts: ["비전", "객체 탐지", "mAP"],
    href: "https://dacon.io/competitions/official/236107/overview/",
  },
  {
    title: "음성 감정 인식 AI 경진대회 월간 데이콘",
    result: "73 / 431",
    period: "2023",
    description:
      "음성 데이터에서 감정 클래스를 분류하는 음향 모델링 과제를 수행했습니다.",
    facts: ["음향", "감정인식", "분류"],
    href: "https://dacon.io/competitions/official/236105/overview/",
  },
  {
    title: "제2회 코스포 x 데이콘 도서 추천 알고리즘 AI경진대회 채용",
    result: "61 / 679",
    period: "2023",
    description:
      "도서 추천 문제에서 사용자-아이템 관계와 평점 예측을 모델링했습니다.",
    facts: ["추천시스템", "정형", "RMSE"],
    href: "https://dacon.io/competitions/official/236093/overview/",
  },
  {
    title: "도배 하자 유형 분류 AI 경진대회",
    result: "37 / 1025",
    period: "2023",
    description:
      "도배 이미지에서 하자 유형을 분류하며 데이터 품질과 MLOps 제출 흐름을 다뤘습니다.",
    facts: ["비전", "분류", "MLOps"],
    href: "https://dacon.io/competitions/official/236082/overview/",
  },
  {
    title: "월간 데이콘 항공편 지연 예측 AI 경진대회",
    result: "16 / 499",
    period: "2023",
    description:
      "항공편 지연 여부를 예측하는 정형 분류 문제에서 상위권 성과를 기록했습니다.",
    facts: ["정형", "항공", "LogLoss"],
    href: "https://dacon.io/competitions/official/236094/overview/",
  },
  {
    title: "생성 AI ChatGPT 활용 AI 경진대회 월간 데이콘",
    result: "20 / 556",
    period: "2023",
    description:
      "ChatGPT 기반 프롬프트 엔지니어링으로 생성형 AI 활용 문제를 풀었습니다.",
    facts: ["ChatGPT", "언어", "분류"],
    href: "https://dacon.io/competitions/official/236071/overview/",
  },
  {
    title: "코스포 x 데이콘 자동차 충돌 분석 AI경진대회 채용",
    result: "83 / 449",
    period: "2023",
    description:
      "동영상 기반 자동차 충돌 분석 문제에서 시각 정보를 분류했습니다.",
    facts: ["동영상", "비전", "분류"],
    href: "https://dacon.io/competitions/official/236064/overview/",
  },
  {
    title: "포디블록 구조 추출 AI 경진대회",
    result: "27 / 461",
    period: "2023",
    description:
      "포디블록 구조를 이미지에서 추출하는 비전 분류 문제를 수행했습니다.",
    facts: ["비전", "분류", "Accuracy"],
    href: "https://dacon.io/competitions/official/236046/overview/",
  },
  {
    title: "유전체 정보 품종 분류 AI 경진대회",
    result: "223 / 716",
    period: "2023",
    description:
      "유전체 정보를 활용해 품종 클래스를 예측하는 분류 문제를 수행했습니다.",
    facts: ["유전체", "분류", "Macro F1"],
    href: "https://dacon.io/competitions/official/236035/overview/",
  },
  {
    title: "월간 데이콘 기계 고장 진단 AI 경진대회",
    result: "61 / 291",
    period: "2023",
    description:
      "음향 데이터를 바탕으로 기계 고장 여부를 탐지하는 문제를 다뤘습니다.",
    facts: ["음향", "이상치 탐지", "Macro F1"],
    href: "https://dacon.io/competitions/official/236036/overview/",
  },
  {
    title: "2022 Samsung AI Challenge (3D Metrology)",
    result: "55 / 139",
    period: "2022",
    description:
      "SEM 기반 3D metrology 데이터를 활용한 회귀 문제를 수행했습니다.",
    facts: ["CV", "회귀", "SEM"],
    href: "https://dacon.io/competitions/official/235954/overview/",
  },
  {
    title: "월간 데이콘 숫자 3D 이미지 분류 AI 경진대회",
    result: "59 / 165",
    period: "2022",
    description:
      "3D 숫자 이미지 데이터를 분류하며 입체 데이터 표현을 실험했습니다.",
    facts: ["CV", "3D", "Accuracy"],
    href: "https://dacon.io/competitions/official/235951/overview/",
  },
  {
    title: "월간 데이콘 Computer Vision 이상치 탐지 알고리즘 경진대회",
    result: "28 / 481",
    period: "2022",
    description:
      "이미지 기반 이상치 탐지 문제에서 분류 모델의 오류 탐지 성능을 다뤘습니다.",
    facts: ["CV", "이상탐지", "Macro F1"],
    href: "https://dacon.io/competitions/official/235894/overview/",
  },
  {
    title: "작물 병해 분류 AI 경진대회",
    result: "37 / 170",
    period: "2021",
    description: "작물 이미지에서 병해 유형을 분류하는 농산물 비전 과제입니다.",
    facts: ["CV", "객체탐지", "농산물"],
    href: "https://dacon.io/competitions/official/235842/overview/",
  },
  {
    title: "2021 교통 수(手)신호 동작 인식 AI 경진대회",
    result: "147 / 227",
    period: "2021",
    description:
      "교통 수신호 동작을 인식하는 제어·비전 기반 분류 문제를 수행했습니다.",
    facts: ["CV", "객체탐지", "제어"],
    href: "https://dacon.io/competitions/official/235806/overview/",
  },
  {
    title: "2021 Ego-Vision 손동작 인식 AI 경진대회",
    result: "5 / 290",
    period: "2021",
    description:
      "Ego-Vision 기반 손동작 인식 문제에서 crop 전처리와 모델 아키텍처 실험으로 5위를 기록했습니다.",
    facts: ["CV", "분류", "제어"],
    href: "https://dacon.io/competitions/official/235805/overview/",
  },
  {
    title: "월간 데이콘 컴퓨터 비전 학습 경진대회",
    result: "1 / 1327",
    period: "2020",
    description: "컴퓨터 비전 학습 경진대회에서 1위를 기록한 대표 성과입니다.",
    facts: ["CV", "분류", "Top 1%"],
    href: "https://dacon.io/competitions/official/235626/overview/",
  },
  {
    title: "서울 랜드마크 이미지 분류 AI 해커톤",
    result: "3 / 420",
    period: "2022",
    description:
      "랜드마크 이미지 분류 문제에서 데이터 전처리와 앙상블 전략으로 3위를 기록했습니다.",
    facts: ["CV", "랜드마크", "Top 1%"],
    href: "https://dacon.io/competitions/official/235957/overview/",
  },
  {
    title: "전화 해지 여부 분류 AI 해커톤",
    result: "5 / 771",
    period: "2023",
    description:
      "전화 해지 여부를 예측하는 정형 분류 문제에서 피처 분석과 AutoML 실험으로 5위를 기록했습니다.",
    facts: ["정형", "분류", "Top 1%"],
    href: "https://dacon.io/competitions/official/236075/overview/",
  },
  {
    title: "구형 DACON 참가 기록 - 컴퓨터 비전 분류",
    result: "참가",
    period: "구형 기록",
    description:
      "이미지 분류 계열 과제에서 데이터 증강, CNN 계열 모델 비교, 검증 전략을 실험한 기록입니다.",
    facts: ["CV", "분류", "집계"],
  },
  {
    title: "구형 DACON 참가 기록 - 컴퓨터 비전 탐지",
    result: "참가",
    period: "구형 기록",
    description:
      "객체 탐지와 이상 탐지 문제에서 전처리, 후처리, 평가 지표 최적화를 다룬 기록입니다.",
    facts: ["CV", "Detection", "집계"],
  },
  {
    title: "구형 DACON 참가 기록 - 정형 데이터 분류",
    result: "참가",
    period: "구형 기록",
    description:
      "정형 분류 과제에서 피처 엔지니어링, 모델 앙상블, 임계값 조정을 수행한 기록입니다.",
    facts: ["Tabular", "Classification", "집계"],
  },
  {
    title: "구형 DACON 참가 기록 - 정형 데이터 회귀",
    result: "참가",
    period: "구형 기록",
    description:
      "수치 예측 과제에서 이상치 처리, 검증 분할, 회귀 모델 비교를 수행한 기록입니다.",
    facts: ["Tabular", "Regression", "집계"],
  },
  {
    title: "구형 DACON 참가 기록 - 자연어 처리",
    result: "참가",
    period: "구형 기록",
    description:
      "텍스트 분류와 라벨 복구 과제에서 임베딩, 토큰화, 모델 선택을 실험한 기록입니다.",
    facts: ["NLP", "Text", "집계"],
  },
  {
    title: "구형 DACON 참가 기록 - 시계열 분석",
    result: "참가",
    period: "구형 기록",
    description:
      "시간 흐름이 있는 데이터에서 lag feature, rolling statistic, 검증 구간 설계를 다룬 기록입니다.",
    facts: ["Time Series", "Forecasting", "집계"],
  },
];

export const skillGroups = [
  {
    title: "O/S",
    summary: "운영체제 및 서버 운영 환경",
    skills: ["Linux (Ubuntu)", "Windows", "UNIX"],
  },
  {
    title: "언어 (Language)",
    summary: "주요 개발 언어",
    skills: ["Python", "JavaScript"],
  },
  {
    title: "프레임워크 (Framework)",
    summary: "웹, AI, 데이터 처리 프레임워크와 라이브러리",
    skills: [
      "React.js",
      "Vue.js",
      "Django",
      "Nest.js",
      "MyBatis",
      "Langsmith",
      "Langchain",
      "Langgraph",
      "PyTorch",
      "NumPy",
      "Pandas",
      "OpenCV",
      "Scikit-learn",
      "TensorFlow",
      "FastAPI",
      "aiohttp",
      "Streamlit",
    ],
  },
  {
    title: "DBMS",
    summary: "관계형, 문서형, 벡터 데이터베이스",
    skills: ["MySQL", "PostgreSQL", "Oracle", "MongoDB", "Qdrant", "Milvus"],
  },
  {
    title: "클라우드 및 미들웨어",
    summary: "클라우드, 메시징, 검색, 컨테이너 운영 스택",
    skills: [
      "AWS SageMaker",
      "AWS CLI",
      "NCP",
      "Redis",
      "Kafka",
      "Docker",
      "Docker-Compose",
      "Kubernetes",
      "Elasticsearch",
      "Logstash",
      "Kibana",
      "wandb",
    ],
  },
  {
    title: "업무도구 (Work Tools)",
    summary: "협업, API 테스트, 품질 검증, 자동화 도구",
    skills: [
      "Git",
      "Jira",
      "Confluence",
      "Postman",
      "Notion",
      "pytest",
      "Github Actions",
    ],
  },
  {
    title: "AI Skill",
    summary: "AI 모델 개발, 최적화, 검색, 비전, 추천, MLOps 역량",
    skillClusters: [
      {
        title: "LLM / Serving",
        skills: [
          "SLM",
          "LLM",
          "Embedding Models",
          "Prompt Engineering",
          "Model Optimization",
          "Model Serving",
        ],
      },
      {
        title: "RAG / Agent",
        skills: [
          "Vector-based RAG",
          "Graph-based RAG",
          "Single Agent",
          "Multi Agent",
          "Vector Database",
        ],
      },
      {
        title: "Computer Vision",
        skills: [
          "Object Detection",
          "Prompt-based Detection",
          "Open-world Detection",
          "Image Segmentation",
          "Image Classification",
          "Pose Estimation",
        ],
      },
      {
        title: "Recommendation / GNN",
        skills: [
          "Recommendation Systems",
          "GNN",
          "GCN",
          "GIN",
          "GNN Optimization",
        ],
      },
      {
        title: "Prediction / Optimization",
        skills: [
          "Prediction",
          "Regression",
          "Classification",
          "Structured Data",
          "Unstructured Data",
          "Time Series",
          "Ensemble",
          "Parameter Optimization",
        ],
      },
      {
        title: "NLP / Data / MLOps",
        skills: [
          "NLP",
          "Multilingual Processing",
          "Document Layout Analysis",
          "OCR",
          "Augmentation",
          "Pre Processing",
          "Post Processing",
          "MLOps",
        ],
      },
    ],
  },
];
