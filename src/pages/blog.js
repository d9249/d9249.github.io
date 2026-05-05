import * as React from "react";
import { graphql } from "gatsby";
import CategoryNav from "../components/CategoryNav";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import SectionHeading from "../components/SectionHeading";

const BlogPage = ({ data }) => {
  const posts = data.posts.nodes;
  const [featured, ...others] = posts;

  return (
    <Layout>
      <section className="shell section">
        <SectionHeading
          kicker="Blog"
          title="Mean Log 글 목록"
          description="Markdown으로 작성한 연구, 제품화, 운영형 AI 시스템 노트를 카테고리별로 모았습니다."
        />
        <CategoryNav />
        {featured && <PostCard post={featured} featured />}
        <div className="post-grid">
          {others.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;

export const Head = () => (
  <>
    <title>Blog | Mean Log</title>
    <meta
      name="description"
      content="Mean Log의 전체 기술 블로그 글 목록입니다."
    />
  </>
);

export const query = graphql`
  query BlogPage {
    posts: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "blog-post" } }
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
