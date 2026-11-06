import * as React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { navItems } from "../data/navigation";
import { createSearchIndex } from "../utils/siteSearch";

export default function useSiteSearch() {
  const data = useStaticQuery(graphql`
    query SiteSearchIndex {
      allMarkdownRemark(
        filter: {
          fields: { contentType: { in: ["blog-post", "tip", "project"] } }
          frontmatter: { draft: { ne: true } }
        }
        sort: { frontmatter: { date: DESC } }
      ) {
        nodes {
          id
          excerpt(pruneLength: 180)
          rawMarkdownBody
          fields {
            slug
            contentType
            category
          }
          frontmatter {
            title
            projectName
            date(formatString: "YYYY.MM.DD")
            description
            author
            category
            tags
            platforms
            repository
            status
            license
            highlights
          }
        }
      }
    }
  `);
  return React.useMemo(
    () => createSearchIndex(data.allMarkdownRemark.nodes, navItems),
    [data],
  );
}
