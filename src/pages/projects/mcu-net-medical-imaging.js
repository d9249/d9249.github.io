import * as React from "react";
import ProjectDetailPage, {
  getProjectBySlug,
} from "../../components/ProjectDetailPage";

const slug = "mcu-net-medical-imaging";
const project = getProjectBySlug(slug);

const McuNetMedicalImagingPage = () => <ProjectDetailPage slug={slug} />;

export default McuNetMedicalImagingPage;

export const Head = () => (
  <>
    <title>{project.title} - 이상민 Portfolio</title>
    <meta name="description" content={project.summary} />
  </>
);
