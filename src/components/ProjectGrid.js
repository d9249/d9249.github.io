import * as React from "react";
import { Link } from "gatsby";

const normalizeProject = (project) => {
  const frontmatter = project.frontmatter || project;
  const slug = project.fields?.slug || `/projects/${project.slug}/`;
  const name = frontmatter.projectName || frontmatter.title;
  const tagline = frontmatter.tagline;

  return {
    details: frontmatter.details || [],
    key: project.id || slug || frontmatter.title,
    metrics: frontmatter.metrics || [],
    name,
    period: frontmatter.period,
    slug,
    stack: frontmatter.stack || [],
    summary: frontmatter.description || frontmatter.summary,
    tagline,
    title: frontmatter.title,
  };
};

const ProjectGrid = ({ className, projects, variant = "full" }) => (
  <div className={["project-grid", className].filter(Boolean).join(" ")}>
    {projects.map((rawProject) => {
      const project = normalizeProject(rawProject);
      const isCompact = variant === "compact";
      const visibleMetrics = isCompact
        ? project.metrics.slice(0, 1)
        : project.metrics;
      const visibleStack = isCompact
        ? project.stack.slice(0, 2)
        : project.stack;

      return (
        <article
          className={`project-card${isCompact ? " is-compact" : ""}`}
          key={project.key}
        >
          <div className="project-card-header">
            <div>
              <div className="meta">{project.period}</div>
              <h3 className="project-title">
                <span className="project-title-name">{project.name}</span>
                {project.tagline && (
                  <span className="project-title-tagline">
                    {project.tagline}
                  </span>
                )}
              </h3>
            </div>
          </div>
          {isCompact ? null : <p>{project.summary}</p>}
          {!isCompact ? (
            <ul className="project-details">
              {project.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
          {visibleMetrics.length > 0 && (
            <div className="project-metrics">
              {visibleMetrics.map((metric) => (
                <span className="metric-chip" key={metric}>
                  {metric}
                </span>
              ))}
            </div>
          )}
          <div className="project-stack" aria-label={`${project.title} stack`}>
            {visibleStack.map((tool) => (
              <span key={tool}>{tool}</span>
            ))}
          </div>
          <div className="project-card-actions">
            <Link className="project-card-link" to={project.slug}>
              <span className="visually-hidden">{project.name}: </span>
              <span>상세 내용 보기 →</span>
            </Link>
          </div>
        </article>
      );
    })}
  </div>
);

export default ProjectGrid;
