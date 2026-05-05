import * as React from "react";
import { Link } from "gatsby";
import Layout from "./Layout";
import SectionHeading from "./SectionHeading";
import { projectItems } from "../data/profile";

export const getProjectBySlug = (slug) =>
  projectItems.find((project) => project.slug === slug);

const ProjectDetailPage = ({ slug }) => {
  const project = getProjectBySlug(slug);

  if (!project) {
    return (
      <Layout>
        <section className="shell section">
          <SectionHeading
            kicker="Project"
            title="프로젝트를 찾을 수 없습니다"
            action={<Link to="/projects/">프로젝트 목록으로 돌아가기 →</Link>}
          />
        </section>
      </Layout>
    );
  }

  const relatedProjects = projectItems
    .filter((item) => item.slug !== project.slug)
    .slice(0, 3);

  return (
    <Layout>
      <section className="shell project-detail-hero">
        <Link className="project-backlink" to="/projects/">
          ← projects
        </Link>
        <div className="project-detail-hero-grid">
          <div>
            <p className="eyebrow">Project Detail</p>
            <h1>{project.title}</h1>
            <p className="project-detail-copy">{project.summary}</p>
            <div
              className="project-metrics"
              aria-label={`${project.title} metrics`}
            >
              {project.metrics.map((metric) => (
                <span className="metric-chip" key={metric}>
                  {metric}
                </span>
              ))}
            </div>
          </div>
          <aside className="project-detail-facts" aria-label="Project facts">
            <div>
              <span>period</span>
              <strong>{project.period}</strong>
            </div>
            <div>
              <span>focus</span>
              <strong>{project.stack.slice(0, 3).join(" / ")}</strong>
            </div>
            <div>
              <span>evidence</span>
              <strong>{project.metrics.join(" / ")}</strong>
            </div>
          </aside>
        </div>
      </section>

      <section className="shell project-detail-body">
        <article className="project-detail-main">
          {project.sections.map((section) => (
            <section className="project-detail-section" key={section.title}>
              <div className="meta">{section.title}</div>
              <p>{section.body}</p>
            </section>
          ))}

          <section className="project-detail-section">
            <div className="meta">Execution Notes</div>
            <ul className="project-detail-list">
              {project.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="project-detail-sidebar">
          <div className="project-detail-panel">
            <h2>Stack</h2>
            <div
              className="project-stack"
              aria-label={`${project.title} stack`}
            >
              {project.stack.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </div>
          <div className="project-detail-panel">
            <h2>Explore</h2>
            <Link to="/portfolio/">발표용 포트폴리오 보기 →</Link>
            <Link to="/#research">연구 성과로 이동 →</Link>
            <Link to="/contact/">연락처 보기 →</Link>
          </div>
        </aside>
      </section>

      <section
        className="shell section"
        aria-labelledby="related-projects-title"
      >
        <SectionHeading
          kicker="Related"
          title="다른 프로젝트도 이어서 보기"
        />
        <div className="related-grid">
          {relatedProjects.map((item) => (
            <Link
              className="related-card"
              key={item.slug}
              to={`/projects/${item.slug}/`}
            >
              <div className="thumb" aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default ProjectDetailPage;
