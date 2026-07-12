import * as React from "react";
import { Link } from "gatsby";
import { navItems } from "../data/navigation";
import BlogSearch from "./BlogSearch";

const getPreferredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }
  } catch (error) {
    // Ignore storage access errors and fall back to the system preference.
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
};

const applyTheme = (theme) => {
  document.documentElement.classList.add("theme-is-transitioning");
  document.documentElement.dataset.theme = theme;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.documentElement.classList.remove("theme-is-transitioning");
    });
  });
  try {
    window.localStorage.setItem("theme", theme);
  } catch (error) {
    // The visual state can still update even when persistence is unavailable.
  }
};

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const [theme, setTheme] = React.useState("light");
  const menuButtonRef = React.useRef(null);
  const navRef = React.useRef(null);

  React.useEffect(() => {
    const initialTheme =
      document.documentElement.dataset.theme || getPreferredTheme();
    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);
  }, []);

  React.useEffect(() => {
    if (!open) return undefined;

    const focusFrame = window.requestAnimationFrame(() => {
      navRef.current?.querySelector("a")?.focus();
    });
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };
    const handlePointerDown = (event) => {
      if (
        navRef.current?.contains(event.target) ||
        menuButtonRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      return nextTheme;
    });
  };

  return (
    <header className="masthead">
      <div className="shell masthead-inner">
        <Link className="wordmark" to="/" aria-label="이상민 홈">
          <span className="prompt-dot" />
          <span className="wordmark-copy">
            <strong className="wordmark-name">Sangmin Lee</strong>
            <small className="wordmark-role">
              AI Engineer &amp; Researcher
            </small>
          </span>
        </Link>
        <nav
          id="primary-navigation"
          ref={navRef}
          className={`nav ${open ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          {navItems.map((item) =>
            item.reloadDocument ? (
              <a key={item.to} href={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ) : (
              <Link
                activeClassName="is-active"
                key={item.to}
                partiallyActive={item.to !== "/" && !item.to.includes("#")}
                to={item.to}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="header-actions">
          <BlogSearch />
          <button
            className="theme-toggle"
            type="button"
            aria-label={
              theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            data-theme-state={theme}
            onClick={toggleTheme}
          >
            <svg
              className="theme-icon theme-icon-sun"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            <svg
              className="theme-icon theme-icon-moon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20.2 14.2A8.4 8.4 0 0 1 9.8 3.8 8.6 8.6 0 1 0 20.2 14.2Z" />
            </svg>
          </button>
          <button
            ref={menuButtonRef}
            className="menu-button"
            type="button"
            aria-controls="primary-navigation"
            aria-expanded={open}
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            title={open ? "Close menu" : "Open menu"}
            data-menu-state={open ? "open" : "closed"}
            onClick={() => setOpen((current) => !current)}
          >
            <svg
              className="menu-icon menu-icon-lines"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 7h14M5 12h14M5 17h14" />
            </svg>
            <svg
              className="menu-icon menu-icon-close"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M7 7l10 10M17 7 7 17" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
