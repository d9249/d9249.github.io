// The site's pages. `to` with "/#…" is a section of the home page (the "홈" group in the mobile menu).
// `ko` is the Korean name shown beside each link in the mobile menu.
export const navItems = [
  { label: "home", ko: "홈", to: "/" },
  { label: "career", ko: "경력", to: "/#career" },
  { label: "tech stack", ko: "기술 스택", to: "/#skills" },
  { label: "projects", ko: "프로젝트", to: "/projects/" },
  { label: "research", ko: "연구", to: "/research/" },
  { label: "awards", ko: "수상", to: "/awards/" },
  { label: "competitions", ko: "대회", to: "/competitions/" },
  { label: "portfolio", ko: "포트폴리오", to: "/portfolio/" },
  { label: "blog", ko: "블로그", to: "/blog/" },
  {
    label: "tips",
    ko: "팁",
    to: "/tips/",
    reloadDocument: true,
  },
  { label: "newsroom", ko: "뉴스룸", to: "/newsroom/" },
  { label: "contact", ko: "연락처", to: "/contact/" },
];

export const isHomeItem = (item) => item.to === "/" || item.to.startsWith("/#");
