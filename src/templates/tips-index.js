import * as React from "react";
import { graphql } from "gatsby";
import TipsIndex from "../components/TipsIndex";

const TipsIndexTemplate = ({ data, pageContext }) => (
  <TipsIndex
    activeCategory={pageContext.activeCategory}
    description={pageContext.description}
    label={pageContext.label}
    tips={data.tips.nodes}
  />
);

export default TipsIndexTemplate;

export const Head = ({ pageContext }) => {
  const title = pageContext.label ? `${pageContext.label} Tips` : "Tips";
  const description =
    pageContext.description ||
    "새로 등장하는 응용프로그램과 로컬 도구를 플랫폼별로 정리합니다.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
    </>
  );
};

export const query = graphql`
  query TipsIndexPage {
    tips: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "tip" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        id
        excerpt(pruneLength: 140)
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
          highlights
        }
      }
    }
  }
`;
