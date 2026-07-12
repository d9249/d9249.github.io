import * as React from "react";
import { graphql } from "gatsby";
import CategoryNav from "../components/CategoryNav";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import PostCard from "../components/PostCard";
import SectionHeading from "../components/SectionHeading";
import TagNav from "../components/TagNav";

const getBlogPagePath = (page) =>
  page <= 1 ? "/blog/" : `/blog/page/${page}/`;

const BlogIndexTemplate = ({ data, pageContext }) => {
  const posts = data.posts.nodes;
  const { currentPage, pageCount, tagSummaries, totalPosts } = pageContext;
  const shouldFeature = currentPage === 1;
  const featured = shouldFeature ? posts[0] : null;
  const listedPosts = shouldFeature ? posts.slice(1) : posts;
  const firstPostNumber = totalPosts === 0 ? 0 : pageContext.skip + 1;
  const lastPostNumber = Math.min(totalPosts, pageContext.skip + posts.length);

  return (
    <Layout>
      <section className="shell section">
        <SectionHeading as="h1" kicker="Blog" title="Knowledge WIKI" />
        <CategoryNav />
        <TagNav tagSummaries={tagSummaries} />
        <div className="blog-list-summary" aria-live="polite">
          <span className="blog-list-count">
            {totalPosts} posts
            {totalPosts > 0
              ? `, ${firstPostNumber}-${lastPostNumber} showing`
              : ""}
          </span>
          <div className="blog-list-meta">
            <strong>
              {currentPage} / {pageCount}
            </strong>
            <Pagination
              className="blog-top-pagination"
              compact
              currentPage={currentPage}
              getPagePath={getBlogPagePath}
              iconOnly
              pageCount={pageCount}
            />
          </div>
        </div>
        {featured && <PostCard post={featured} featured />}
        {listedPosts.length > 0 ? (
          <div className="post-grid">
            {listedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="empty-state">아직 공개된 글이 없습니다.</div>
        )}
        <Pagination
          currentPage={currentPage}
          getPagePath={getBlogPagePath}
          pageCount={pageCount}
        />
      </section>
    </Layout>
  );
};

export default BlogIndexTemplate;

export const Head = ({ pageContext }) => {
  const { currentPage, pageCount } = pageContext;
  const title = currentPage > 1 ? `Blog Page ${currentPage}` : "Blog";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content="전체 기술 블로그 글 목록입니다." />
      {currentPage > 1 ? (
        <link rel="prev" href={getBlogPagePath(currentPage - 1)} />
      ) : null}
      {currentPage < pageCount ? (
        <link rel="next" href={getBlogPagePath(currentPage + 1)} />
      ) : null}
    </>
  );
};

export const query = graphql`
  query BlogIndexPage($skip: Int!, $limit: Int!) {
    posts: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "blog-post" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
      skip: $skip
      limit: $limit
    ) {
      nodes {
        id
        excerpt(pruneLength: 120)
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
`;
