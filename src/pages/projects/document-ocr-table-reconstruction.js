import * as React from "react";
import ProjectDetailPage, {
  getProjectBySlug,
} from "../../components/ProjectDetailPage";

const slug = "document-ocr-table-reconstruction";
const project = getProjectBySlug(slug);

const DocumentOcrTableReconstructionPage = () => (
  <ProjectDetailPage slug={slug} />
);

export default DocumentOcrTableReconstructionPage;

export const Head = () => (
  <>
    <title>{project.title} - 이상민 Portfolio</title>
    <meta name="description" content={project.summary} />
  </>
);
