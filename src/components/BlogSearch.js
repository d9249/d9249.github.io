import * as React from "react";
import { graphql, Link, useStaticQuery } from "gatsby";
import categories from "../data/categories.json";

const MAX_RESULTS = 12;
const RECENT_POST_LIMIT = 8;

const labelByCategory = new Map(
  categories.map((category) => [category.slug, category.label]),
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
            description
            author
            category
            tags
          }
        }
      }
    }
  `);
  const posts = data.posts.nodes;
  const titleId = React.useId();
  const inputId = React.useId();
  const inputRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const indexedPosts = React.useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        categoryLabel:
          labelByCategory.get(post.fields.category) ||
          post.frontmatter.category,
        searchText: getPostSearchText(post),
      })),
    [posts],
  );

  const tokens = React.useMemo(() => getSearchTokens(query), [query]);
  const results = React.useMemo(() => {
    if (!tokens.length) {
      return indexedPosts.slice(0, RECENT_POST_LIMIT);
    }

    return indexedPosts
      .filter((post) =>
        tokens.every((token) => post.searchText.includes(token)),
      )
      .slice(0, MAX_RESULTS);
  }, [indexedPosts, tokens]);
  const isSearching = tokens.length > 0;

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("search-is-open");
    window.setTimeout(() => inputRef.current?.focus(), 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("search-is-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        className="search-toggle"
        type="button"
        aria-label="블로그 검색 열기"
        title="Search posts"
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
            className="search-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="search-dialog-head">
              <div>
                <h2 id={titleId}>Blog Search</h2>
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
              {isSearching ? `${results.length} results` : "Recent posts"}
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
                      {post.categoryLabel} / {post.frontmatter.date}
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
