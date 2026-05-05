import * as React from "react";
import { graphql } from "gatsby";
import CategoryNav from "../components/CategoryNav";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import SectionHeading from "../components/SectionHeading";

const BlogCategoryTemplate = ({ data, pageContext }) => {
  const posts = data.posts.nodes;

  return (
    <Layout>
      <section className="shell section">
        <SectionHeading
          kicker="Category"
          title={pageContext.label}
          description={pageContext.description}
        />
        <CategoryNav />
        {posts.length > 0 ? (
          <div className="post-grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="empty-state">아직 공개된 글이 없습니다.</div>
        )}
      </section>
    </Layout>
  );
};

export default BlogCategoryTemplate;

export const Head = ({ pageContext }) => (
  <>
    <title>{pageContext.label} | Mean Log</title>
    <meta name="description" content={pageContext.description} />
  </>
);

export const query = graphql`
  query BlogCategoryPage($category: String!) {
    posts: allMarkdownRemark(
      filter: {
        fields: {
          contentType: { eq: "blog-post" }
          category: { eq: $category }
        }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
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
