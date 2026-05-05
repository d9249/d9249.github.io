import * as React from "react";
import ProjectDetailPage, {
  getProjectBySlug,
} from "../../components/ProjectDetailPage";

const slug = "market-intelligence-agents";
const project = getProjectBySlug(slug);

const MarketIntelligenceAgentsPage = () => <ProjectDetailPage slug={slug} />;

export default MarketIntelligenceAgentsPage;

export const Head = () => (
  <>
    <title>{project.title} - 이상민 Portfolio</title>
    <meta name="description" content={project.summary} />
  </>
);
