import * as React from "react";
import { graphql } from "gatsby";
import CategoryNav from "../components/CategoryNav";
import Layout from "../components/Layout";
import PostRows from "../components/PostRows";
import { PageHeader } from "../components/ui";
import TagNav from "../components/TagNav";

const BlogCategoryTemplate = ({ data, pageContext }) => {
  const posts = data.posts.nodes;

  return (
    <Layout>
      <section className="shell section">
        <PageHeader
          slate={{ label: "Category", count: posts.length, unit: "posts" }}
          title={pageContext.label}
          lead={pageContext.description}
        />
        <CategoryNav activeCategory={pageContext.category} />
        <TagNav tagSummaries={pageContext.tagSummaries} />
        <h2 className="visually-hidden">글 목록</h2>
        {posts.length > 0 ? (
          <PostRows posts={posts} />
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
    <title>{pageContext.label}</title>
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
