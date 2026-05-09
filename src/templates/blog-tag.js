import * as React from "react";
import { graphql } from "gatsby";
import CategoryNav from "../components/CategoryNav";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import SectionHeading from "../components/SectionHeading";
import TagNav from "../components/TagNav";

const BlogTagTemplate = ({ data, pageContext }) => {
  const posts = data.posts.nodes;

  return (
    <Layout>
      <section className="shell section">
        <SectionHeading
          kicker="Tag"
          title={`#${pageContext.tag}`}
          description={`${pageContext.tag} 태그가 붙은 글입니다.`}
        />
        <CategoryNav />
        <TagNav
          tagSummaries={pageContext.tagSummaries}
          activeTag={pageContext.tag}
        />
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
