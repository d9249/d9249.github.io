import * as React from "react";
import { Link } from "gatsby";

const normalizeProject = (project) => {
  const frontmatter = project.frontmatter || project;
  const slug = project.fields?.slug || `/projects/${project.slug}/`;

  return {
    details: frontmatter.details || [],
    key: project.id || slug || frontmatter.title,
    metrics: frontmatter.metrics || [],
    period: frontmatter.period,
    slug,
    stack: frontmatter.stack || [],
    summary: frontmatter.description || frontmatter.summary,
    title: frontmatter.title,
  };
};

const ProjectGrid = ({ projects }) => (
  <div className="project-grid">
    {projects.map((rawProject) => {
      const project = normalizeProject(rawProject);

      return (
        <article className="project-card" key={project.key}>
          <div className="project-card-header">
            <div>
              <div className="meta">{project.period}</div>
              <h3>
                <Link to={project.slug}>{project.title}</Link>
              </h3>
            </div>
            <div className="project-metrics">
              {project.metrics.map((metric) => (
                <span className="metric-chip" key={metric}>
                  {metric}
                </span>
              ))}
            </div>
          </div>
          <p>{project.summary}</p>
          <ul className="project-details">
            {project.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          <div className="project-stack" aria-label={`${project.title} stack`}>
            {project.stack.map((tool) => (
              <span key={tool}>{tool}</span>
            ))}
          </div>
          <div className="project-card-actions">
            <Link to={project.slug}>상세 내용 보기 →</Link>
          </div>
        </article>
      );
    })}
  </div>
);

export default ProjectGrid;
