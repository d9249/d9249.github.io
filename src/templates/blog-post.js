import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import categories from "../data/categories.json";

const labelByCategory = new Map(
  categories.map((category) => [category.slug, category.label]),
);

const BlogPostTemplate = ({ data, pageContext }) => {
  const post = data.post;
  const categoryLabel =
    labelByCategory.get(post.fields.category) || post.frontmatter.category;

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
            <div className="byline">
              <span>{post.frontmatter.author}</span>
              <span>{post.frontmatter.date}</span>
              <span>{post.timeToRead} min read</span>
              {post.frontmatter.tags?.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
            <figure>
              <div className="hero-image" />
              <figcaption>{post.frontmatter.description}</figcaption>
            </figure>
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
            <nav className="related-grid" aria-label="Adjacent posts">
              {pageContext.previous ? (
                <Link
                  className="related-card"
                  to={pageContext.previous.fields.slug}
                >
                  <div className="meta">previous</div>
                  <h3>{pageContext.previous.frontmatter.title}</h3>
                  <p>{pageContext.previous.frontmatter.date}</p>
                </Link>
              ) : (
                <div />
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
            <div className="source-card">
              <div className="meta">Source MD</div>
              <code>{`content${post.fields.slug.slice(0, -1)}.md`}</code>
            </div>
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
