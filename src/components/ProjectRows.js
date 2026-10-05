import * as React from "react";
import { Link } from "gatsby";
import { colorStyle, projectColor, stageOf } from "../utils/treeColors";

/*
 * The projects index: one row per project, its leaf colour as a tab on the left (the same colour
 * as its branch on the tree above). Hovering or focusing a row lights that branch.
 * Styles: .branch-row in src/styles/site.css.
 */

const normalize = (project) => {
  const fm = project.frontmatter || project;
  const slug = project.fields?.slug || `/projects/${project.slug}/`;
  return {
    key: project.id || slug,
    slug,
    name: fm.projectName || fm.title,
    tagline: fm.tagline,
    period: fm.period,
    summary: fm.description || fm.summary,
    metrics: fm.metrics || [],
  };
};

const ProjectRow = ({ project, focus, onFocus }) => {
  const p = normalize(project);
  const stage = stageOf(p.slug);
  const color = stage?.leaf || projectColor(p.slug);
  const on = stage && focus === stage.index;
  const enter = () => onFocus(stage ? stage.index : -1);
  const leave = () => onFocus(-1);

  return (
    <article
      className={["branch-row", on && "is-on", !color && "is-plain"]
        .filter(Boolean)
        .join(" ")}
      style={colorStyle(color)}
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <div className="branch-row-head">
        <p className="branch-row-meta">
          <span>{p.period}</span>
          {stage?.fruit ? (
            <span className="branch-row-fruit">{stage.fruit}</span>
          ) : null}
        </p>
        <h2 className="branch-row-name">
          <Link to={p.slug} onFocus={enter} onBlur={leave}>
            {p.name}
          </Link>
        </h2>
        {p.tagline && <p className="branch-row-tagline">{p.tagline}</p>}
      </div>
      <div className="branch-row-body">
        <p className="branch-row-summary">{p.summary}</p>
        {p.metrics.length > 0 && (
          <ul className="branch-row-metrics" aria-label={`${p.name} 성과 지표`}>
            {p.metrics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
};

const ProjectRows = ({ projects, focus = -1, onFocus = () => {} }) => (
  <div className="branch-rows">
    {projects.map((project) => (
      <ProjectRow
        key={project.id || project.fields?.slug}
        project={project}
        focus={focus}
        onFocus={onFocus}
      />
    ))}
  </div>
);

export default ProjectRows;
