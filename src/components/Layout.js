import * as React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { ViewCounterProvider } from "./ViewCounter";

const Layout = ({ children }) => (
  <ViewCounterProvider>
    <div className="page">
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  </ViewCounterProvider>
);

export default Layout;
