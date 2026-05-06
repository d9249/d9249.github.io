import * as React from "react";
import { SiteViewCounter } from "./ViewCounter";

const Footer = () => (
  <footer className="shell footer">
    <span>© 2026 Sangmin Lee</span>
    <SiteViewCounter />
    <a href="mailto:dodo9249@gmail.com">Email</a>
    <a href="https://github.com/d9249">GitHub</a>
    <a href="https://scholar.google.co.kr/citations?hl=ko&user=JcGG1pMAAAAJ">
      Google Scholar
    </a>
  </footer>
);

export default Footer;
