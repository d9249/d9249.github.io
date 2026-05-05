import * as React from "react";
import ProjectDetailPage, {
  getProjectBySlug,
} from "../../components/ProjectDetailPage";

const slug = "enterprise-ai-knowledge";
const project = getProjectBySlug(slug);

const EnterpriseAiKnowledgePage = () => <ProjectDetailPage slug={slug} />;

export default EnterpriseAiKnowledgePage;

export const Head = () => (
  <>
    <title>{project.title} - 이상민 Portfolio</title>
    <meta name="description" content={project.summary} />
  </>
);
