import * as React from "react";
import { Link } from "gatsby";
import { SiteViewCounter } from "./ViewCounter";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Projects", to: "/projects/" },
      { label: "Research", to: "/research/" },
      { label: "Portfolio", to: "/portfolio/" },
    ],
  },
  {
    title: "Records",
    links: [
      { label: "Awards", to: "/awards/" },
      { label: "Competitions", to: "/competitions/" },
      { label: "Career", to: "/#career" },
    ],
  },
  {
    title: "Knowledge",
    links: [
      { label: "Blog", to: "/blog/" },
      { label: "Tips", to: "/tips/", reloadDocument: true },
      { label: "Newsroom", to: "/newsroom/" },
      { label: "Contact", to: "/contact/" },
    ],
  },
];

const Footer = () => (
  <footer className="site-footer">
    <div className="shell footer">
      <div className="footer-identity">
        <strong>Sangmin Lee</strong>
        <span>AI 연구를 신뢰할 수 있는 제품과 시스템으로 연결합니다.</span>
      </div>
      <nav className="footer-directory" aria-label="Footer navigation">
        {footerGroups.map((group) => (
          <section className="footer-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map((link) =>
              link.reloadDocument ? (
                <a href={link.to} key={link.to}>
                  {link.label}
                </a>
              ) : (
                <Link to={link.to} key={link.to}>
                  {link.label}
                </Link>
              ),
            )}
          </section>
        ))}
      </nav>
      <div className="footer-meta">
        <SiteViewCounter />
        <div className="footer-links">
          <a href="mailto:dodo9249@gmail.com">Email</a>
          <a href="https://github.com/d9249">GitHub</a>
          <a href="https://scholar.google.co.kr/citations?hl=ko&user=JcGG1pMAAAAJ">
            Google Scholar
          </a>
        </div>
      </div>
      <span className="footer-copyright">© 2026 Sangmin Lee</span>
    </div>
  </footer>
);

export default Footer;
