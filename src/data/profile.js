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
    label: "awards",
    value: "CES 2025",
    description:
      "booxTory Best of Innovation, arti Honoree로 AI 제품 개발과 기술 리더십을 입증했습니다.",
  },
  {
    label: "minister award",
    value: "장관상",
    description:
      "WIS 2025 혁신상에서 과학기술정보통신부 장관상을 수상하며 제품화 성과를 인정받았습니다.",
  },
  {
    label: "challenge",
    value: "HD현대 4위",
    description:
      "HD현대 AI Challenge 4위로 산업 AI 문제 해결과 실전형 모델링 역량을 검증했습니다.",
  },
  {
    label: "research",
    value: "SCIE 3",
    description:
      "LightGCN, WF-GCN, 의료영상 앙상블을 중심으로 SCIE 3편과 KCI 2편의 연구 실적을 보유했습니다.",
  },
  {
    label: "table OCR",
    value: "TEDS 0.9188",
    description:
      "hf_finance_legal_mrc 480 샘플 기준 TEDS-S 0.9506, Cell F1 0.9702까지 구조 복원 품질을 끌어올렸습니다.",
  },
  {
    label: "systems",
    value: "25 agents",
    description:
      "Market Intelligence 시스템에서 4-Layer 기반 25개 전문 에이전트 협업 구조를 설계했습니다.",
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

export const researchItems = [
  {
    category: "Thesis",
    title: "추천 시스템에서 그래프 컨볼루션 네트워크 최적화 방법",
    description:
      "그래프 기반 추천에서 LightGCN 계열 모델의 임베딩 전파, 가중 전달, 성능 비교를 다룬 석사 학위논문입니다.",
    facts: ["M.S. Thesis", "Kyonggi University", "2024.02"],
  },
  {
    category: "SCIE Journals",
    title: "LightGCN, WF-GCN, Medical Imaging Ensemble",
    description:
      "MDPI Electronics 2024, CMC 2024, CMC 2023에 추천 시스템과 의료영상 딥러닝 연구 3편을 발표했습니다.",
    facts: ["SCIE 3", "LightGCN", "WF-GCN", "CMC"],
  },
  {
    category: "KCI Journals",
    title: "사용자 행동 시간 분석과 MCU-Net 의료영상 연구",
    description:
      "Graph Neural Network 기반 추천시스템 개선 연구와 다중 연쇄 U-Net 기반 췌장 영역 분할 연구를 KCI 논문으로 발표했습니다.",
    facts: ["KCI 2", "JKIIT", "Recommendation", "Segmentation"],
  },
  {
    category: "Conferences & Awards",
    title: "APIC-IST Best Paper, KIIT Best Paper",
    description:
      "국제학회 6편, 국내학회 4편의 발표 경험과 APIC-IST 2022 Best Paper Award, KIIT Best Paper Award 수상 기록이 있습니다.",
    facts: ["International 6", "Domestic 4", "Best Paper"],
  },
];

export const skillGroups = [
  {
    title: "AI / ML",
    skills: [
      "LLM",
      "RAG",
      "Multi-Agent",
      "Prompt Engineering",
      "PyTorch",
      "CNN / RNN / GCN",
      "OpenCV",
      "Pandas",
    ],
  },
  {
    title: "RAG / Agent Systems",
    skills: [
      "LangGraph",
      "LangSmith",
      "Langfuse",
      "Knowledge Graph",
      "Vector Search",
      "Hybrid Retrieval",
      "LLM Observability",
    ],
  },
  {
    title: "Backend / Product",
    skills: [
      "FastAPI",
      "Python",
      "Next.js 14",
      "React",
      "Tailwind",
      "Streamlit",
      "AWS Lambda",
      "EventBridge",
    ],
  },
  {
    title: "Data / DB",
    skills: [
      "Milvus",
      "Neo4j",
      "Qdrant",
      "Elasticsearch",
      "PostgreSQL",
      "Redis",
      "DynamoDB",
      "MySQL",
    ],
  },
  {
    title: "MLOps / Infra",
    skills: [
      "Docker",
      "Docker Compose",
      "Kubernetes",
      "Prometheus",
      "Grafana",
      "Loki",
      "wandb",
      "GitHub Actions",
    ],
  },
];
