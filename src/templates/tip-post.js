import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import { PageViewCounter } from "../components/ViewCounter";
import tipCategories from "../data/tipCategories.json";
import { formatReadableArticleHtml } from "../utils/articleHtml";

const labelByPlatform = new Map(
  tipCategories.map((category) => [category.slug, category.label]),
);

const getTipCategoryPath = (slug) => `/tips/${slug}/`;

const sourceLinePattern = /\s*<p>Sources:\s*[\s\S]*?<\/p>\s*$/i;

const removeSourceParagraph = (html) => html.replace(sourceLinePattern, "");

const TipPostTemplate = ({ data, pageContext }) => {
  const tip = data.tip;
  const platforms = tip.frontmatter.platforms || [];
  const tipHtml = formatReadableArticleHtml(removeSourceParagraph(tip.html));

  return (
    <Layout>
      <section className="shell section">
        <div className="article-shell">
          <article className="article">
            <Link className="article-kicker" to="/tips/">
              Tips
            </Link>
            <h1>{tip.frontmatter.title}</h1>
            <p className="deck">{tip.frontmatter.description}</p>
            <div
              className="tip-post-platforms"
              aria-label="Supported platforms"
            >
              {platforms.map((platform) => (
                <a key={platform} href={getTipCategoryPath(platform)}>
                  {labelByPlatform.get(platform) || platform}
                </a>
              ))}
            </div>
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: tipHtml }}
            />
            <nav
              className="related-grid adjacent-posts"
              aria-label="Adjacent tips"
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
              <div className="meta">Tips</div>
              <a href="/tips/">all tips</a>
              {platforms.map((platform) => (
                <a key={platform} href={getTipCategoryPath(platform)}>
                  {labelByPlatform.get(platform) || platform}
                </a>
              ))}
            </div>
            <div className="source-card post-info-card">
              <div className="meta">Tip Info</div>
              <dl className="post-info-list">
                <div>
                  <dt>status</dt>
                  <dd>{tip.frontmatter.status}</dd>
                </div>
                <div>
                  <dt>license</dt>
                  <dd>{tip.frontmatter.license}</dd>
                </div>
                <div>
                  <dt>date</dt>
                  <dd>{tip.frontmatter.date}</dd>
                </div>
                <div>
                  <dt>views</dt>
                  <dd>
                    <PageViewCounter />
                  </dd>
                </div>
              </dl>
              {tip.frontmatter.tags?.length ? (
                <div className="post-info-tags" aria-label="Tip tags">
                  {tip.frontmatter.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="source-card post-sources-card">
              <div className="meta">Source</div>
              <div className="post-source-list">
                <a href={tip.frontmatter.sourceUrl}>
                  <span>01</span>
                  <strong>{tip.frontmatter.repository}</strong>
                  <code>{tip.frontmatter.sourceUrl}</code>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
};

export default TipPostTemplate;

export const Head = ({ data }) => (
  <>
    <title>{data.tip.frontmatter.title}</title>
    <meta name="description" content={data.tip.frontmatter.description} />
  </>
);

export const query = graphql`
  query TipPostById($id: String!) {
    tip: markdownRemark(id: { eq: $id }) {
      id
      html
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "YYYY.MM.DD")
        description
        repository
        sourceUrl
        status
        license
        platforms
        tags
      }
    }
  }
`;
