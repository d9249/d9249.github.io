import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import ProjectImageLightbox from "../components/ProjectImageLightbox";
import SectionHeading from "../components/SectionHeading";
import { formatReadableArticleHtml } from "../utils/articleHtml";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

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
  const projectHtml = React.useMemo(
    () => formatReadableArticleHtml(project.html),
    [project.html],
  );

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined" || window.location.hash) {
      return undefined;
    }

    const scrollToTop = () => {
      window.scrollTo({
        behavior: "auto",
        left: 0,
        top: 0,
      });
    };
    const frameId = window.requestAnimationFrame(scrollToTop);
    const timeoutId = window.setTimeout(scrollToTop, 120);

    scrollToTop();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [project.fields.slug]);

  return (
    <Layout>
      <section className="shell project-detail-hero">
        <Link className="project-backlink" to="/projects/">
          ← projects
        </Link>
        <div className="project-detail-hero-grid">
          <div>
            <p className="eyebrow">Project Detail</p>
            <h1 className="project-detail-title">
              <span className="project-detail-title-name">
                {titleParts.name}
              </span>
              {titleParts.tagline && (
                <span className="project-detail-title-tagline">
                  {titleParts.tagline}
                </span>
              )}
            </h1>
            <p className="project-detail-copy">
              {project.frontmatter.description}
            </p>
            <div
              className="project-metrics"
              aria-label={`${titleParts.displayTitle} metrics`}
            >
              {metrics.map((metric) => (
                <span className="metric-chip" key={metric}>
                  {metric}
                </span>
              ))}
            </div>
          </div>
          <aside className="project-detail-facts" aria-label="Project facts">
            <div>
              <span>period</span>
              <strong>{project.frontmatter.period}</strong>
            </div>
            <div>
              <span>focus</span>
              <strong>{stack.slice(0, 3).join(" / ")}</strong>
            </div>
            <div>
              <span>evidence</span>
              <strong>{metrics.join(" / ")}</strong>
            </div>
          </aside>
        </div>
      </section>

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
