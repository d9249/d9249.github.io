import * as React from "react";
import { Link } from "gatsby";

const navItems = [
  { label: "career", to: "/#career" },
  { label: "blog", to: "/blog/" },
  { label: "latest.md", to: "/#latest" },
  { label: "contact", to: "/contact/" },
];

const Navbar = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="masthead">
      <div className="shell masthead-inner">
        <Link className="wordmark" to="/" aria-label="Mean Log home">
          <span className="prompt-dot" />
          <span>mean@log:~/research-to-product</span>
        </Link>
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-label="메뉴 열기"
          onClick={() => setOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          className={`nav ${open ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
