import * as React from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "./ui";
import { colorStyle, projectColor, stageOf } from "../utils/treeColors";
import { Sentences } from "../utils/sentences";

/*
 * The projects index: one row per project. A row shows the name, tagline, summary and metrics;
 * pressing it opens the rest in place (what was done, the stack) with a link to the project page.
 * Hovering, focusing or opening a row lights its branch on the tree above.
 *
 *   open      Set of open project ids (the slug's last segment, also the row's anchor)
 *   onToggle  (id) => void
 *   focus / onFocus  the lit branch index, shared with <TreeCanvas>
 *
 * Styles: .branch-row in src/styles/site.css.
 */

export const projectId = (slug) =>
  (slug || "").replace(/\/$/, "").split("/").pop();

const normalize = (project) => {
  const fm = project.frontmatter || project;
  const slug = project.fields?.slug || `/projects/${project.slug}/`;
  return {
    key: project.id || slug,
    id: projectId(slug),
    slug,
    name: fm.projectName || fm.title,
    tagline: fm.tagline,
    period: fm.period,
    summary: fm.description || fm.summary,
    metrics: fm.metrics || [],
    details: fm.details || [],
    stack: fm.stack || [],
  };
};

const ProjectRow = ({ project, focus, onFocus, open, onToggle }) => {
  const p = normalize(project);
  const stage = stageOf(p.slug);
  const color = stage?.leaf || projectColor(p.slug);
  const on = stage && focus === stage.index;
  const enter = () => onFocus(stage ? stage.index : -1);
  const leave = () => onFocus(-1);
  const buttonId = `${p.id}-toggle`;
  const panelId = `${p.id}-more`;

  return (
    <article
      id={p.id}
      className={[
        "branch-row",
        on && "is-on",
        open && "is-open",
        !color && "is-plain",
      ]
        .filter(Boolean)
        .join(" ")}
      style={colorStyle(color)}
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <div className="branch-row-top">
        <div className="branch-row-head">
          <p className="branch-row-meta">
            <span>{p.period}</span>
            {stage?.fruit ? (
              <span className="branch-row-fruit">{stage.fruit}</span>
            ) : null}
          </p>
          <h2 className="branch-row-name">
            <button
              type="button"
              id={buttonId}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => onToggle(p.id)}
              onFocus={enter}
              onBlur={leave}
            >
              {p.name}
            </button>
          </h2>
          {p.tagline && <p className="branch-row-tagline">{p.tagline}</p>}
        </div>
        <div className="branch-row-body">
          <p className="branch-row-summary">
            <Sentences>{p.summary}</Sentences>
          </p>
          {p.metrics.length > 0 && (
            <ul
              className="branch-row-metrics"
              aria-label={`${p.name} 성과 지표`}
            >
              {p.metrics.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>
        <span className="branch-row-toggle" aria-hidden="true">
          <ChevronDown />
        </span>
      </div>

      <div
        className="branch-row-panel"
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={open ? undefined : ""}
      >
        <div className="branch-row-panel-in">
          <div className="branch-row-more">
            {p.details.length > 0 && (
              <div className="branch-row-work">
                <h3 className="branch-row-h">
                  주요 작업 <span>{p.details.length}</span>
                </h3>
                <ul className="branch-row-details">
                  {p.details.map((d) => (
                    <li key={d}>
                      <Sentences>{d}</Sentences>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="branch-row-side">
              {p.stack.length > 0 && (
                <>
                  <h3 className="branch-row-h">스택</h3>
                  <ul
                    className="branch-row-stack"
                    aria-label={`${p.name} 기술 스택`}
                  >
                    {p.stack.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </>
              )}
              <Button variant="primary" to={p.slug} className="branch-row-cta">
                <span>자세히 보기</span>
                <span className="visually-hidden">: {p.name}</span>
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

const ProjectRows = ({
  projects,
  focus = -1,
  onFocus = () => {},
  open = new Set(),
  onToggle = () => {},
}) => (
  <div className="branch-rows">
    {projects.map((project) => (
      <ProjectRow
        key={project.id || project.fields?.slug}
        project={project}
        focus={focus}
        onFocus={onFocus}
        open={open.has(projectId(project.fields?.slug))}
        onToggle={onToggle}
      />
    ))}
  </div>
);

export default ProjectRows;
