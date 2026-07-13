import * as React from "react";
import { graphql } from "gatsby";
import TipsIndex from "../components/TipsIndex";
import { getTipTagPath } from "../utils/tags";

const getTipsPagePath = ({ category, page, tag }) => {
  const basePath = tag
    ? getTipTagPath(tag)
    : category
      ? `/tips/${category}/`
      : "/tips/";

  return page <= 1 ? basePath : `${basePath}page/${page}/`;
};

const TipsIndexTemplate = ({ data, pageContext }) => (
  <TipsIndex
    activeCategory={pageContext.activeCategory}
    activeTag={pageContext.activeTag}
    currentPage={pageContext.currentPage}
    label={pageContext.label}
    pageCount={pageContext.pageCount}
    skip={pageContext.skip}
    tagSummaries={pageContext.tagSummaries}
    tips={data.tips.nodes}
    totalTips={pageContext.totalTips}
  />
);

export default TipsIndexTemplate;

export const Head = ({ pageContext }) => {
  const currentPage = pageContext.currentPage || 1;
  const pageCount = pageContext.pageCount || 1;
  const baseTitle = pageContext.activeTag
    ? `#${pageContext.activeTag} Tips`
    : pageContext.label
      ? `${pageContext.label} Tips`
      : "Tips";
  const title =
    currentPage > 1 ? `${baseTitle} Page ${currentPage}` : baseTitle;
  const description =
    pageContext.description ||
    "새로 등장하는 응용프로그램과 로컬 도구를 플랫폼별로 정리합니다.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {currentPage > 1 ? (
        <link
          rel="prev"
          href={getTipsPagePath({
            category: pageContext.activeCategory,
            page: currentPage - 1,
            tag: pageContext.activeTag,
          })}
        />
      ) : null}
      {currentPage < pageCount ? (
        <link
          rel="next"
          href={getTipsPagePath({
            category: pageContext.activeCategory,
            page: currentPage + 1,
            tag: pageContext.activeTag,
          })}
        />
      ) : null}
    </>
  );
};

export const query = graphql`
  query TipsIndexPage($tipIds: [String!]!) {
    tips: allMarkdownRemark(
      filter: {
        id: { in: $tipIds }
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
