import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import ProjectImageLightbox from "../components/ProjectImageLightbox";
import SectionHeading from "../components/SectionHeading";
import { formatReadableArticleHtml } from "../utils/articleHtml";
import TreeCanvas from "../components/TreeCanvas";
import {
  caseOf,
  colorStyle,
  projectColor,
  skillPackage,
  stageOf,
  treeBranches,
} from "../utils/treeColors";

const getProjectTitleParts = (frontmatter) => {
  const name = frontmatter.projectName || frontmatter.title;
  const tagline = frontmatter.tagline;

  return {
    displayTitle: [name, tagline].filter(Boolean).join(" - "),
    name,
    tagline,
  };
};

const ProjectPostTemplate = ({ data }) => {
  const project = data.project;
  const relatedProjects = data.relatedProjects.nodes;
  const details = project.frontmatter.details || [];
  const metrics = project.frontmatter.metrics || [];
  const stack = project.frontmatter.stack || [];
  const titleParts = getProjectTitleParts(project.frontmatter);
  const slug = project.fields?.slug;
  const stage = stageOf(slug);
  const color = stage?.leaf || projectColor(slug);
  const growth = caseOf(slug);
  const projectHtml = React.useMemo(
    () => formatReadableArticleHtml(project.html),
    [project.html],
  );

  return (
    <Layout>
      <section className="shell project-hero" style={colorStyle(color)}>
        <span className="ui-marks" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <div className="project-hero-main">
          <Link className="project-backlink" to="/projects/">
            ← 프로젝트
          </Link>
          <p className="ui-slate">
            <b>Project</b>
            <span className="ui-slate-bars" aria-hidden="true">
              <i style={{ background: color || "var(--border-strong)" }} />
            </span>
            <span>{project.frontmatter.period}</span>
          </p>
          <h1 className="project-hero-title">
            <span className="project-hero-name">{titleParts.name}</span>
            {titleParts.tagline && (
              <span className="project-hero-tagline">{titleParts.tagline}</span>
            )}
          </h1>
          <p className="project-hero-copy">{project.frontmatter.description}</p>
          {metrics.length ? (
            <ul
              className="branch-row-metrics project-hero-metrics"
              aria-label={`${titleParts.displayTitle} 성과 지표`}
            >
              {metrics.map((metric) => (
                <li key={metric}>{metric}</li>
              ))}
            </ul>
          ) : null}
        </div>
        {stage ? (
          <div className="project-hero-tree">
            <TreeCanvas
              focus={stage.index}
              branches={treeBranches()}
              label={`이 프로젝트(${titleParts.name})의 가지만 밝힌 나무`}
            />
          </div>
        ) : null}
      </section>

      {growth ? (
        <section
          className="project-case"
          style={colorStyle(color)}
          aria-labelledby="project-case-title"
        >
          <div className="shell project-case-in">
            <div className="project-case-head">
              <p className="project-case-kicker">
                {growth.period} · {growth.role}
              </p>
              <h2 id="project-case-title" className="project-case-q">
                {growth.problem}
              </h2>
              {growth.result ? (
                <p className="project-case-result">{growth.result}</p>
              ) : null}
            </div>
            <div className="project-case-grew">
              <h3 className="project-case-h">
                이 프로젝트에서 키운 역량 <span>{growth.grew.length}</span>
              </h3>
              <ul>
                {growth.grew.map((g, i) => {
                  const pkg = skillPackage(g.pkg);
                  return (
                    <li key={g.skills} style={{ "--c": pkg?.c, "--d": i }}>
                      <code>{pkg ? pkg.kr : g.pkg}</code>
                      <b>{g.skills}</b>
                      <span>{g.how}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="shell project-detail-body">
        <article className="project-detail-main">
          <ProjectImageLightbox html={projectHtml} />

          {details.length ? (
            <section className="project-detail-section">
              <div className="meta">Execution Notes</div>
              <ul className="project-detail-list">
                {details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>

        <aside className="project-detail-sidebar">
          <div className="project-detail-panel">
            <h2>Stack</h2>
            <div
              className="project-stack"
              aria-label={`${titleParts.displayTitle} stack`}
            >
              {stack.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </div>
          <div className="project-detail-panel">
            <h2>Explore</h2>
            <Link to="/portfolio/">발표용 포트폴리오 보기 →</Link>
            <Link to="/research/">연구 성과로 이동 →</Link>
            <Link to="/contact/">연락처 보기 →</Link>
          </div>
        </aside>
      </section>

      <section
        className="shell section"
        aria-labelledby="related-projects-title"
      >
        <SectionHeading kicker="Related" title="다른 프로젝트도 이어서 보기" />
        <div className="related-grid">
          {relatedProjects.map((item) => {
            const relatedTitle = getProjectTitleParts(item.frontmatter);

            return (
              <Link
                className="related-card"
                key={item.id}
                to={item.fields.slug}
                style={colorStyle(projectColor(item.fields.slug))}
              >
                <div className="thumb" aria-hidden="true" />
                <h3 className="related-project-title">
                  <span className="related-project-title-name">
                    {relatedTitle.name}
                  </span>
                  {relatedTitle.tagline && (
                    <span className="related-project-title-tagline">
                      {relatedTitle.tagline}
                    </span>
                  )}
                </h3>
                <p>{item.frontmatter.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </Layout>
  );
};

export default ProjectPostTemplate;

export const Head = ({ data }) => (
  <>
    <title>{data.project.frontmatter.title} - 이상민 Portfolio</title>
    <meta name="description" content={data.project.frontmatter.description} />
  </>
);

export const query = graphql`
  query ProjectPostById($id: String!, $relatedProjectIds: [String!]!) {
    project: markdownRemark(id: { eq: $id }) {
      id
      html
      fields {
        slug
      }
      frontmatter {
        title
        projectName
        tagline
        period
        description
        metrics
        stack
        details
      }
    }
    relatedProjects: allMarkdownRemark(
      filter: { id: { in: $relatedProjectIds } }
      sort: { frontmatter: { periodOrder: DESC } }
    ) {
      nodes {
        id
        fields {
          slug
        }
        frontmatter {
          title
          projectName
          tagline
          description
        }
      }
    }
  }
`;
