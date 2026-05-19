import * as React from "react";
import ProjectDetailPage, {
  getProjectBySlug,
} from "../../components/ProjectDetailPage";

const slug = "harmony-multitenant-ai";
const project = getProjectBySlug(slug);

const HarmonyMultitenantAiPage = () => <ProjectDetailPage slug={slug} />;

export default HarmonyMultitenantAiPage;

export const Head = () => (
  <>
    <title>{project.title} - 이상민 Portfolio</title>
    <meta name="description" content={project.summary} />
  </>
);
