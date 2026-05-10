export const tipCategories = [
  {
    slug: "macos-linux",
    label: "macOS / Linux",
    description:
      "macOS와 Linux에서 바로 써볼 만한 로컬 앱, 개발 도구, 생산성 유틸리티를 정리합니다.",
  },
  {
    slug: "winos",
    label: "WinOS",
    description:
      "Windows 환경에서 활용할 수 있는 데스크톱 앱과 워크플로 도구를 정리합니다.",
  },
];

export const tips = [
  {
    slug: "tolaria",
    title: "Tolaria",
    repository: "refactoringhq/tolaria",
    sourceUrl: "https://github.com/refactoringhq/tolaria",
    status: "Open source",
    license: "AGPL-3.0",
    platforms: ["macos-linux", "winos"],
    tags: ["Markdown KB", "Git-first", "Offline-first", "Tauri"],
    summary:
      "마크다운 지식베이스를 로컬 파일과 Git 중심으로 관리하는 데스크톱 앱입니다. 개인 노트, 회사 문서, AI 에이전트용 메모리와 절차를 한 vault 안에서 다루는 흐름에 잘 맞습니다.",
    notes: [
      "macOS, Windows, Linux용 데스크톱 앱으로 배포됩니다.",
      "노트는 표준 Markdown과 YAML frontmatter를 사용합니다.",
      "계정, 구독, 클라우드 의존 없이 오프라인 중심으로 동작하는 방향을 표방합니다.",
    ],
    checkedAt: "2026.05.10",
  },
];
