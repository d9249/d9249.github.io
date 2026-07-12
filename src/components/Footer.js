import * as React from "react";
import { SiteViewCounter } from "./ViewCounter";

const Footer = () => (
  <footer className="shell footer">
    <div className="footer-identity">
      <strong>Sangmin Lee</strong>
      <span>AI 연구를 신뢰할 수 있는 제품과 시스템으로 연결합니다.</span>
    </div>
    <div className="footer-links">
      <SiteViewCounter />
      <a href="mailto:dodo9249@gmail.com">Email</a>
      <a href="https://github.com/d9249">GitHub</a>
      <a href="https://scholar.google.co.kr/citations?hl=ko&user=JcGG1pMAAAAJ">
        Google Scholar
      </a>
    </div>
    <span className="footer-copyright">© 2026 Sangmin Lee</span>
  </footer>
);

export default Footer;
