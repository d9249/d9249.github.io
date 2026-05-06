import * as React from "react";
import Layout from "../components/Layout";
import ProjectGrid from "../components/ProjectGrid";
import SectionHeading from "../components/SectionHeading";
import { projectItems } from "../data/profile";

const ProjectsPage = () => (
  <Layout>
    <section className="shell section projects-page">
      <SectionHeading
        kicker="Projects"
        title="프로젝트"
      />
      <ProjectGrid projects={projectItems} />
    </section>
  </Layout>
);

export default ProjectsPage;

export const Head = () => (
  <>
    <title>Projects</title>
    <meta
      name="description"
      content="이상민의 연구 프로젝트 목록입니다."
    />
  </>
);
