import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import NewsroomGraph from "../components/NewsroomGraph";
import SectionHeading from "../components/SectionHeading";
import { buildNewsroomGraph } from "../utils/newsroom";

const NewsroomPage = ({ data }) => {
  const graph = React.useMemo(
    () =>
      buildNewsroomGraph({
        posts: data.posts.nodes,
        tips: data.tips.nodes,
      }),
    [data],
  );
  const latestDate =
    [...data.posts.nodes, ...data.tips.nodes]
      .map((node) => node.frontmatter.date)
      .filter(Boolean)
      .sort()
      .at(-1) || null;

  return (
    <Layout>
      <section className="shell section newsroom-page">
        <SectionHeading as="h1" kicker="Newsroom" title="지식 그래프" />
        <div className="blog-list-summary">
          <span className="blog-list-count">
            {graph.nodes.length} pages, {graph.links.length} links,{" "}
            {graph.clusters.length} clusters
          </span>
          {latestDate && (
            <div className="blog-list-meta">
              <strong>latest {latestDate}</strong>
            </div>
          )}
        </div>
        <NewsroomGraph graph={graph} />
      </section>
    </Layout>
  );
};

export default NewsroomPage;

export const Head = () => (
  <>
    <title>Newsroom</title>
    <meta
      name="description"
      content="블로그와 팁 전체 글을 태그 관계로 이은 인터랙티브 지식 그래프입니다."
    />
  </>
);

export const query = graphql`
  query NewsroomPage {
    posts: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "blog-post" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        id
        fields {
          slug
          category
        }
        frontmatter {
          title
          description
          date(formatString: "YYYY.MM.DD")
          tags
          related
        }
      }
    }
    tips: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "tip" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        id
        fields {
          slug
        }
        frontmatter {
          title
          description
          date(formatString: "YYYY.MM.DD")
          platforms
          tags
          related
        }
      }
    }
  }
`;
