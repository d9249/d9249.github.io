import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import categories from "../data/categories.json";
import { getTagPath } from "../utils/tags";

const labelByCategory = new Map(
  categories.map((category) => [category.slug, category.label]),
);

const sourceLinePattern = /(?:^|\n)Sources:\s*(.+?)\s*$/i;

const getSourceLabel = (href) => {
  try {
    const url = new URL(href);
    return url.hostname.replace(/^www\./, "");
  } catch (error) {
    return href;
  }
};

const getPostSources = (rawMarkdownBody) => {
  const match = rawMarkdownBody?.match(sourceLinePattern);
  if (!match) {
    return [];
  }

  return match[1]
    .split(/\s*,\s*/)
    .map((source) => source.trim())
    .filter(Boolean)
    .map((source) => {
      const markdownLink = source.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = markdownLink ? markdownLink[2] : source;
      const label = markdownLink ? markdownLink[1] : getSourceLabel(href);

      return { href, label };
    });
};

const removeSourceParagraph = (html) =>
  html.replace(/\s*<p>Sources:\s*[\s\S]*?<\/p>\s*$/i, "");

const wrapArticleTables = (html) =>
  html
    .replace(/<table(\s[^>]*)?>/g, '<div class="article-table-wrap"><table$1>')
    .replace(/<\/table>/g, "</table></div>");

const BlogPostTemplate = ({ data, pageContext }) => {
  const post = data.post;
  const categoryLabel =
    labelByCategory.get(post.fields.category) || post.frontmatter.category;
  const postSources = getPostSources(post.rawMarkdownBody);
  const postHtml = wrapArticleTables(removeSourceParagraph(post.html));

  return (
    <Layout>
      <section className="shell section">
        <div className="article-shell">
          <article className="article">
            <Link
              className="article-kicker"
              to={`/blog/${post.fields.category}/`}
            >
              {categoryLabel}
            </Link>
            <h1>{post.frontmatter.title}</h1>
            <p className="deck">{post.frontmatter.description}</p>
            <figure>
              <div className="hero-image" />
              <figcaption>{post.frontmatter.description}</figcaption>
            </figure>
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: postHtml }}
            />
            <nav
              className="related-grid adjacent-posts"
              aria-label="Adjacent posts"
            >
              {pageContext.previous && (
                <Link
                  className="related-card"
                  to={pageContext.previous.fields.slug}
                >
                  <div className="meta">previous</div>
                  <h3>{pageContext.previous.frontmatter.title}</h3>
                  <p>{pageContext.previous.frontmatter.date}</p>
                </Link>
              )}
              {pageContext.next && (
                <Link
                  className="related-card"
                  to={pageContext.next.fields.slug}
                >
                  <div className="meta">next</div>
                  <h3>{pageContext.next.frontmatter.title}</h3>
                  <p>{pageContext.next.frontmatter.date}</p>
                </Link>
              )}
            </nav>
          </article>

          <aside className="aside">
            <div className="toc">
              <div className="meta">Post</div>
              <Link to="/blog/">all posts</Link>
              <Link to={`/blog/${post.fields.category}/`}>{categoryLabel}</Link>
              <Link to="/#career">career proof</Link>
            </div>
            <div className="source-card post-info-card">
              <div className="meta">Post Info</div>
              <dl className="post-info-list">
                <div>
                  <dt>author</dt>
                  <dd>{post.frontmatter.author}</dd>
                </div>
                <div>
                  <dt>date</dt>
                  <dd>{post.frontmatter.date}</dd>
                </div>
                <div>
                  <dt>read</dt>
                  <dd>{post.timeToRead} min read</dd>
                </div>
              </dl>
              {post.frontmatter.tags?.length ? (
                <div className="post-info-tags" aria-label="Post tags">
                  {post.frontmatter.tags.map((tag) => (
                    <Link key={tag} to={getTagPath(tag)}>
                      #{tag}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            {postSources.length ? (
              <div className="source-card post-sources-card">
                <div className="meta">Sources</div>
                <div className="post-source-list">
                  {postSources.map((source, index) => (
                    <a key={source.href} href={source.href}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{source.label}</strong>
                      <code>{source.href}</code>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPostTemplate;

export const Head = ({ data }) => (
  <>
    <title>{data.post.frontmatter.title} | Mean Log</title>
    <meta name="description" content={data.post.frontmatter.description} />
  </>
);

export const query = graphql`
  query BlogPostById($id: String!) {
    post: markdownRemark(id: { eq: $id }) {
      id
      html
      rawMarkdownBody
      timeToRead
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
`;
