import * as React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { ViewCounterProvider } from "./ViewCounter";

const Layout = ({ children }) => (
  <ViewCounterProvider>
    <div className="page">
      <Navbar />
      <main id="top">{children}</main>
      <Footer />
    </div>
  </ViewCounterProvider>
);

export default Layout;
