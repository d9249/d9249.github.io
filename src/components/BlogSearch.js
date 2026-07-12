import * as React from "react";
import { graphql, Link, useStaticQuery } from "gatsby";
import categories from "../data/categories.json";
import tipCategories from "../data/tipCategories.json";

const MAX_RESULTS = 12;
const RECENT_ITEM_LIMIT = 8;

const labelByCategory = new Map(
  categories.map((category) => [category.slug, category.label]),
);

const labelByTipPlatform = new Map(
  tipCategories.map((category) => [category.slug, category.label]),
);

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase();

const getSearchTokens = (query) =>
  normalizeText(query)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

const getPostSearchText = (post) =>
  normalizeText(
    [
      post.frontmatter.title,
      "blog",
      post.frontmatter.description,
      post.frontmatter.author,
      post.frontmatter.category,
      post.fields.category,
      labelByCategory.get(post.fields.category),
      ...(post.frontmatter.tags || []),
      post.excerpt,
      post.rawMarkdownBody,
    ].join(" "),
  );

const getTipSearchText = (tip) =>
  normalizeText(
    [
      tip.frontmatter.title,
      "tips",
      tip.frontmatter.description,
      tip.frontmatter.repository,
      tip.frontmatter.status,
      tip.frontmatter.license,
      ...(tip.frontmatter.platforms || []),
      ...(tip.frontmatter.platforms || []).map((platform) =>
        labelByTipPlatform.get(platform),
      ),
      ...(tip.frontmatter.tags || []),
      ...(tip.frontmatter.highlights || []),
      tip.excerpt,
      tip.rawMarkdownBody,
    ].join(" "),
  );

const BlogSearch = () => {
  const data = useStaticQuery(graphql`
    query BlogSearchIndex {
      posts: allMarkdownRemark(
        filter: {
          fields: { contentType: { eq: "blog-post" } }
          frontmatter: { draft: { ne: true } }
        }
        sort: { frontmatter: { date: DESC } }
      ) {
        nodes {
          id
          excerpt(pruneLength: 180)
          rawMarkdownBody
          fields {
            slug
            category
          }
          frontmatter {
            title
            date(formatString: "YYYY.MM.DD")
            sortDate: date(formatString: "YYYY-MM-DDTHH:mm:ss")
            description
            author
            category
            tags
          }
        }
      }
      tips: allMarkdownRemark(
        filter: {
          fields: { contentType: { eq: "tip" } }
          frontmatter: { draft: { ne: true } }
        }
        sort: { frontmatter: { date: DESC } }
      ) {
        nodes {
          id
          excerpt(pruneLength: 180)
          rawMarkdownBody
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "YYYY.MM.DD")
            sortDate: date(formatString: "YYYY-MM-DDTHH:mm:ss")
            description
            repository
            status
            license
            platforms
            tags
            highlights
          }
        }
      }
    }
  `);
  const posts = data.posts.nodes;
  const tips = data.tips.nodes;
  const titleId = React.useId();
  const inputId = React.useId();
  const dialogRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const indexedItems = React.useMemo(() => {
    const blogItems = posts.map((post) => ({
      ...post,
      sectionLabel: "Blog",
      categoryLabel:
        labelByCategory.get(post.fields.category) || post.frontmatter.category,
      searchText: getPostSearchText(post),
    }));

    const tipItems = tips.map((tip) => {
      const platformLabels = (tip.frontmatter.platforms || [])
        .map((platform) => labelByTipPlatform.get(platform) || platform)
        .filter(Boolean);

      return {
        ...tip,
        sectionLabel: "Tips",
        categoryLabel: platformLabels.join(", "),
        searchText: getTipSearchText(tip),
      };
    });

    return [...blogItems, ...tipItems].sort((left, right) => {
      const leftDate = Date.parse(left.frontmatter.sortDate || "");
      const rightDate = Date.parse(right.frontmatter.sortDate || "");

      if (Number.isFinite(leftDate) && Number.isFinite(rightDate)) {
        return rightDate - leftDate;
      }

      if (Number.isFinite(rightDate)) return 1;
      if (Number.isFinite(leftDate)) return -1;

      return (left.frontmatter.title || "").localeCompare(
        right.frontmatter.title || "",
      );
    });
  }, [posts, tips]);

  const tokens = React.useMemo(() => getSearchTokens(query), [query]);
  const results = React.useMemo(() => {
    if (!tokens.length) {
      return indexedItems.slice(0, RECENT_ITEM_LIMIT);
    }

    return indexedItems
      .filter((post) =>
        tokens.every((token) => post.searchText.includes(token)),
      )
      .slice(0, MAX_RESULTS);
  }, [indexedItems, tokens]);
  const isSearching = tokens.length > 0;

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("search-is-open");
    const focusTimeout = window.setTimeout(() => inputRef.current?.focus(), 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimeout);
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("search-is-open");
      window.removeEventListener("keydown", handleKeyDown);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        className="search-toggle"
        type="button"
        aria-label="검색 열기"
        title="Search"
        onClick={() => setOpen(true)}
      >
        <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </svg>
      </button>
      {open ? (
        <div className="search-layer" role="presentation">
          <div
            className="search-backdrop"
            role="presentation"
            onClick={() => setOpen(false)}
          />
          <section
            ref={dialogRef}
            className="search-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="search-dialog-head">
              <div>
                <h2 id={titleId}>Site Search</h2>
                <div className="search-input-shell">
                  <svg
                    className="search-input-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="6" />
                    <path d="m16 16 4 4" />
                  </svg>
                  <input
                    id={inputId}
                    ref={inputRef}
                    type="search"
                    value={query}
                    placeholder="검색어"
                    aria-label="검색어"
                    autoComplete="off"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  {query ? (
                    <button
                      className="search-clear"
                      type="button"
                      aria-label="검색어 지우기"
                      title="Clear"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 7l10 10M17 7 7 17" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </div>
              <button
                className="search-close"
                type="button"
                aria-label="검색 닫기"
                title="Close"
                onClick={() => setOpen(false)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 7l10 10M17 7 7 17" />
                </svg>
              </button>
            </div>
            <div className="search-meta">
              {isSearching ? `${results.length} results` : "Recent entries"}
            </div>
            {results.length ? (
              <div className="search-results">
                {results.map((post) => (
                  <Link
                    className="search-result"
                    key={post.id}
                    to={post.fields.slug}
                    onClick={() => setOpen(false)}
                  >
                    <span className="search-result-meta">
                      {[
                        post.sectionLabel,
                        post.categoryLabel,
                        post.frontmatter.date,
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </span>
                    <strong>{post.frontmatter.title}</strong>
                    <span>{post.frontmatter.description || post.excerpt}</span>
                    {post.frontmatter.tags?.length ? (
                      <span className="search-result-tags">
                        {post.frontmatter.tags.slice(0, 4).map((tag) => (
                          <small key={tag}>#{tag}</small>
                        ))}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="search-empty">검색 결과가 없습니다.</div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
};

export default BlogSearch;
