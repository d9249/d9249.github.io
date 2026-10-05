import * as React from "react";
import { graphql } from "gatsby";
import CategoryNav from "../components/CategoryNav";
import Layout from "../components/Layout";
import PostRows from "../components/PostRows";
import { PageHeader } from "../components/ui";
import TagNav from "../components/TagNav";

const BlogTagTemplate = ({ data, pageContext }) => {
  const posts = data.posts.nodes;

  return (
    <Layout>
      <section className="shell section">
        <PageHeader
          slate={{ label: "Tag", count: posts.length, unit: "posts" }}
          title={`#${pageContext.tag}`}
        />
        <CategoryNav />
        <TagNav
          tagSummaries={pageContext.tagSummaries}
          activeTag={pageContext.tag}
        />
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

export default BlogTagTemplate;

export const Head = ({ pageContext }) => (
  <>
    <title>#{pageContext.tag}</title>
    <meta
      name="description"
      content={`${pageContext.tag} 태그가 붙은 블로그 글 목록입니다.`}
    />
  </>
);

export const query = graphql`
  query BlogTagPage($tag: String!) {
    posts: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "blog-post" } }
        frontmatter: { draft: { ne: true }, tags: { in: [$tag] } }
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
