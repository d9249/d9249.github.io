import * as React from "react";
import ProjectDetailPage, {
  getProjectBySlug,
} from "../../components/ProjectDetailPage";

const slug = "lightgcn-wfgcn-recommender";
const project = getProjectBySlug(slug);

const LightgcnWfgcnRecommenderPage = () => <ProjectDetailPage slug={slug} />;

export default LightgcnWfgcnRecommenderPage;

export const Head = () => (
  <>
    <title>{project.title} - 이상민 Portfolio</title>
    <meta name="description" content={project.summary} />
  </>
);
