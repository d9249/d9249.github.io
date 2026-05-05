import * as React from "react";
import ProjectDetailPage, {
  getProjectBySlug,
} from "../../components/ProjectDetailPage";

const slug = "booxtory-arti-ai-products";
const project = getProjectBySlug(slug);

const BooxtoryArtiAiProductsPage = () => <ProjectDetailPage slug={slug} />;

export default BooxtoryArtiAiProductsPage;

export const Head = () => (
  <>
    <title>{project.title} - 이상민 Portfolio</title>
    <meta name="description" content={project.summary} />
  </>
);
