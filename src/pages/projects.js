import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import ProjectRows from "../components/ProjectRows";
import TreeCanvas from "../components/TreeCanvas";
import { PageHeader } from "../components/ui";
import { leafColors, treeBranches } from "../utils/treeColors";

const ProjectsPage = ({ data }) => {
  const projects = data.projects.nodes;
  const [focus, setFocus] = React.useState(-1);

  return (
    <Layout>
      <section className="shell projects-page">
        <PageHeader
          size="hero"
          slate={{
            label: "Projects",
            colors: leafColors(),
            count: projects.length,
            unit: "projects",
          }}
          title="프로젝트"
          lead="현업과 연구실에서 직접 설계하고 운영한 AI 시스템입니다. 나무의 가지 하나가 프로젝트 하나이고, 열매는 그 프로젝트가 낸 성과입니다."
          aside={
            <TreeCanvas
              grow
              focus={focus}
              branches={treeBranches()}
              onFocusBranch={setFocus}
              label="프로젝트마다 가지가 하나씩 난 나무. 가지를 누르면 그 프로젝트로 갑니다."
            />
          }
        />
        <ProjectRows projects={projects} focus={focus} onFocus={setFocus} />
      </section>
    </Layout>
  );
};

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
      sort: { frontmatter: { periodOrder: DESC } }
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
