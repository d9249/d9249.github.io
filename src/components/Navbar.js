import * as React from "react";
import { useLocation } from "@gatsbyjs/reach-router";
import { Link } from "gatsby";
import { isHomeItem, navItems } from "../data/navigation";
import BlogSearch from "./BlogSearch";

const SECTION_ACTIVATION_RATIO = 0.3;
// below this width the links move into the menu sheet (keep in step with site.css)
const MENU_QUERY = "(max-width: 1180px)";
const navGroups = [
  { key: "home", label: "홈", items: navItems.filter(isHomeItem) },
  {
    key: "pages",
    label: "페이지",
    items: navItems.filter((item) => !isHomeItem(item)),
  },
];
const SECTION_NAVIGATION_TIMEOUT = 1600;

const getHomeSectionId = (to) => {
  const match = to.match(/^\/#([^/?#]+)$/);
  return match ? match[1] : null;
};

const homeSectionIds = navItems
  .map((item) => getHomeSectionId(item.to))
  .filter(Boolean);

const getSectionActivationLine = () =>
  Math.round(window.innerHeight * SECTION_ACTIVATION_RATIO);

const getActiveHomeSection = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const activationLine = getSectionActivationLine();

  // the section under the activation line, in document order (the reel's #skills shot sits above
  // #career, so "last passed" would light the wrong item)
  const current = homeSectionIds
    .map((sectionId) => ({
      sectionId,
      rect: document.getElementById(sectionId)?.getBoundingClientRect(),
    }))
    .filter(({ rect }) => rect && rect.top <= activationLine)
    .sort((a, b) => b.rect.top - a.rect.top)[0];

  return current && current.rect.bottom > activationLine
    ? current.sectionId
    : null;
};

const getStoredTheme = () => {
  try {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }
  } catch (error) {
    return null;
  }

  return null;
};

const storeTheme = (theme) => {
  try {
    window.localStorage.setItem("theme", theme);
    return true;
  } catch (error) {
    return false;
  }
};

const getPreferredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = getStoredTheme();
  if (storedTheme) return storedTheme;

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
};

const applyTheme = (theme, { persist = true } = {}) => {
  document.documentElement.classList.add("theme-is-transitioning");
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.documentElement.classList.remove("theme-is-transitioning");
    });
  });
  if (persist) {
    storeTheme(theme);
  }
};

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [activeSection, setActiveSection] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [theme, setTheme] = React.useState("light");
  const menuButtonRef = React.useRef(null);
  const navRef = React.useRef(null);
  const pendingSectionRef = React.useRef(null);
  const pendingSectionTimerRef = React.useRef(null);

  const clearPendingSection = React.useCallback(() => {
    pendingSectionRef.current = null;

    if (pendingSectionTimerRef.current !== null) {
      window.clearTimeout(pendingSectionTimerRef.current);
      pendingSectionTimerRef.current = null;
    }
  }, []);

  const selectHomeSection = React.useCallback(
    (sectionId) => {
      clearPendingSection();
      pendingSectionRef.current = sectionId;
      setActiveSection(sectionId);
      pendingSectionTimerRef.current = window.setTimeout(() => {
        pendingSectionRef.current = null;
        pendingSectionTimerRef.current = null;
        setActiveSection(getActiveHomeSection());
      }, SECTION_NAVIGATION_TIMEOUT);
    },
    [clearPendingSection],
  );

  React.useEffect(() => {
    const initialTheme =
      document.documentElement.dataset.theme || getPreferredTheme();
    document.documentElement.dataset.theme = initialTheme;
    document.documentElement.style.colorScheme = initialTheme;
    setTheme(initialTheme);
  }, []);

  React.useEffect(() => {
    if (!isHome) {
      clearPendingSection();
      setActiveSection(null);
      return undefined;
    }

    const hashSection = location.hash.replace(/^#/, "");
    if (homeSectionIds.includes(hashSection)) {
      selectHomeSection(hashSection);
    } else {
      clearPendingSection();
      setActiveSection(getActiveHomeSection());
    }

    const sections = homeSectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter(Boolean);

    if (!sections.length || typeof IntersectionObserver === "undefined") {
      return clearPendingSection;
    }

    const syncActiveSection = () => {
      const pendingSection = pendingSectionRef.current;

      if (pendingSection) {
        const pendingElement = document.getElementById(pendingSection);
        const pendingRect = pendingElement?.getBoundingClientRect();
        const activationLine = getSectionActivationLine();

        if (
          pendingRect &&
          pendingRect.top <= activationLine &&
          pendingRect.bottom > activationLine
        ) {
          clearPendingSection();
        } else {
          return;
        }
      }

      setActiveSection(getActiveHomeSection());
    };
    const observer = new IntersectionObserver(syncActiveSection, {
      rootMargin: "-30% 0px -69% 0px",
      threshold: 0,
    });

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      clearPendingSection();
    };
  }, [clearPendingSection, isHome, location.hash, selectHomeSection]);

  React.useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const syncThemeState = () => {
      const nextTheme = root.dataset.theme || getPreferredTheme();
      root.style.colorScheme = nextTheme;
      setTheme(nextTheme);
    };
    const syncStoredTheme = (event) => {
      if (event.key !== "theme") return;
      applyTheme(getPreferredTheme(), { persist: false });
    };
    const syncSystemTheme = () => {
      if (getStoredTheme()) return;
      applyTheme(systemTheme.matches ? "dark" : "light", { persist: false });
    };
    const observer = new MutationObserver(syncThemeState);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    window.addEventListener("storage", syncStoredTheme);
    systemTheme.addEventListener?.("change", syncSystemTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", syncStoredTheme);
      systemTheme.removeEventListener?.("change", syncSystemTheme);
    };
  }, []);

  // the open sheet covers the page: lock its scroll, take it out of the tab order, and close the
  // sheet if the window grows past the menu breakpoint
  React.useEffect(() => {
    const root = document.documentElement;
    const page = [
      document.getElementById("main-content"),
      document.querySelector(".site-footer"),
    ].filter(Boolean);
    root.classList.toggle("nav-is-open", open);
    page.forEach((el) => {
      if (open) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
    if (!open) return undefined;
    const menu = window.matchMedia(MENU_QUERY);
    const closeOnWide = () => {
      if (!menu.matches) setOpen(false);
    };
    menu.addEventListener?.("change", closeOnWide);
    return () => {
      menu.removeEventListener?.("change", closeOnWide);
      root.classList.remove("nav-is-open");
      page.forEach((el) => el.removeAttribute("inert"));
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return undefined;

    const focusFrame = window.requestAnimationFrame(() => {
      navRef.current?.querySelector("a")?.focus({ preventScroll: true });
    });
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      window.requestAnimationFrame(() =>
        menuButtonRef.current?.focus({ preventScroll: true }),
      );
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
      const activeTheme =
        document.documentElement.dataset.theme || currentTheme;
      const nextTheme = activeTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      return nextTheme;
    });
  };

  const handleNavigation = (item) => {
    setOpen(false);

    const sectionId = getHomeSectionId(item.to);
    if (sectionId) {
      selectHomeSection(sectionId);
      return;
    }

    clearPendingSection();
    if (item.to === "/") {
      setActiveSection(null);
    }
  };

  const linkLabel = (item) => (
    <>
      <span className="nav-label">{item.label}</span>
      <span className="nav-ko" aria-hidden="true">
        {item.ko}
      </span>
    </>
  );

  const renderLink = (item) => {
    const sectionId = getHomeSectionId(item.to);
    const isReloadActive =
      item.reloadDocument && location.pathname.startsWith(item.to);

    if (item.reloadDocument) {
      return (
        <a
          key={item.to}
          href={item.to}
          className={isReloadActive ? "is-active" : undefined}
          aria-current={isReloadActive ? "page" : undefined}
          onClick={() => handleNavigation(item)}
        >
          {linkLabel(item)}
        </a>
      );
    }

    return (
      <Link
        getProps={({ isPartiallyCurrent }) => {
          const isActive = sectionId
            ? isHome && activeSection === sectionId
            : item.to === "/"
              ? isHome && !activeSection
              : item.to !== "/" && isPartiallyCurrent;

          return {
            className: isActive ? "is-active" : undefined,
            "aria-current": isActive
              ? sectionId
                ? "location"
                : "page"
              : undefined,
          };
        }}
        key={item.to}
        partiallyActive={item.to !== "/" && !sectionId}
        to={item.to}
        onClick={() => handleNavigation(item)}
      >
        {linkLabel(item)}
      </Link>
    );
  };

  return (
    <header className="masthead">
      <div className="shell masthead-inner">
        <Link className="wordmark" to="/">
          <span className="wordmark-copy">
            <strong className="wordmark-name">Sangmin Lee</strong>
            <small className="wordmark-role">
              AI Engineer &amp; Researcher
            </small>
          </span>
          <span className="visually-hidden"> 홈</span>
        </Link>
        <nav
          id="primary-navigation"
          ref={navRef}
          className={`nav ${open ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          <p className="ui-slate nav-slate" aria-hidden="true">
            <b>Menu</b>
            <span className="ui-slate-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>
              <em>{navItems.length}</em> pages
            </span>
          </p>
          {navGroups.map((group) => (
            <div
              className="nav-group"
              key={group.key}
              role="group"
              aria-labelledby={`nav-group-${group.key}`}
            >
              <p className="nav-group-h" id={`nav-group-${group.key}`}>
                {group.label} <span>{group.items.length}</span>
              </p>
              {group.items.map(renderLink)}
            </div>
          ))}
        </nav>
        <div className="header-actions">
          <BlogSearch />
          <button
            className="theme-toggle"
            type="button"
            aria-label="다크 모드"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            data-theme-state={theme}
            aria-pressed={theme === "dark"}
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
