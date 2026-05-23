import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import ProjectGrid from "../components/ProjectGrid";
import SectionHeading from "../components/SectionHeading";

const ProjectsPage = ({ data }) => (
  <Layout>
    <section className="shell section projects-page">
      <SectionHeading kicker="Projects" title="프로젝트" />
      <ProjectGrid projects={data.projects.nodes} />
    </section>
  </Layout>
);

export default ProjectsPage;

export const Head = () => (
  <>
    <title>Projects</title>
    <meta name="description" content="이상민의 연구 프로젝트 목록입니다." />
  </>
);

export const query = graphql`
  query ProjectsPage {
    projects: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "project" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { order: ASC } }
    ) {
      nodes {
        id
        fields {
          slug
        }
        frontmatter {
          title
          projectName
          tagline
          period
          description
          metrics
          stack
          details
        }
      }
    }
  }
`;
