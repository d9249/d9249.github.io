import * as React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

const Layout = ({ children }) => (
  <div className="page">
    <Navbar />
    <main id="top">{children}</main>
    <Footer />
  </div>
);

export default Layout;
