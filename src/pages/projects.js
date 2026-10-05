import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import ProjectRows, { projectId } from "../components/ProjectRows";
import TreeCanvas from "../components/TreeCanvas";
import { PageHeader } from "../components/ui";
import { leafColors, stageOf, treeBranches } from "../utils/treeColors";

const setHash = (id) => {
  try {
    const { pathname, search } = window.location;
    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}${search}${id ? `#${id}` : ""}`,
    );
  } catch (e) {
    // the URL is a convenience; the row opens either way
  }
};

const ProjectsPage = ({ data }) => {
  const projects = data.projects.nodes;
  const [hover, setHover] = React.useState(-1);
  const [open, setOpen] = React.useState(() => new Set());
  const [last, setLast] = React.useState(null);

  // project id ↔ branch index on the tree
  const { branchOf, idOfBranch } = React.useMemo(() => {
    const branchOf = new Map(),
      idOfBranch = new Map();
    projects.forEach((project) => {
      const stage = stageOf(project.fields.slug);
      if (!stage) return;
      const id = projectId(project.fields.slug);
      branchOf.set(id, stage.index);
      idOfBranch.set(stage.index, id);
    });
    return { branchOf, idOfBranch };
  }, [projects]);

  // the lit branch: the row under the pointer or keyboard, else the row opened last
  const focus =
    hover >= 0
      ? hover
      : last && open.has(last)
        ? (branchOf.get(last) ?? -1)
        : -1;

  const toggle = (id) => {
    const opening = !open.has(id);
    setOpen((prev) => {
      const next = new Set(prev);
      if (opening) next.add(id);
      else next.delete(id);
      return next;
    });
    if (opening) {
      setLast(id);
      setHash(id);
    } else if (window.location.hash === `#${id}`) setHash(null);
  };

  // open a row from outside the list (a branch on the tree, a #link) and bring it into view
  const reveal = React.useCallback((id, smooth = true) => {
    setOpen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    setLast(id);
    setHash(id);
    const row = document.getElementById(id);
    if (!row) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    row.scrollIntoView({
      behavior: smooth && !reduce ? "smooth" : "auto",
      block: "start",
    });
    row
      .querySelector(".branch-row-name button")
      ?.focus({ preventScroll: true });
  }, []);

  React.useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && projects.some((p) => projectId(p.fields.slug) === id))
      reveal(id, false);
  }, [projects, reveal]);

  return (
    <Layout>
      <section className="shell projects-page">
        <PageHeader
          size="hero"
          slate={{
            label: "Projects",
            colors: leafColors(),
            count: projects.length,
            unit: "projects",
          }}
          title="프로젝트"
          lead="현업과 연구실에서 직접 설계하고 운영한 AI 시스템입니다. 나무의 가지 하나가 프로젝트 하나이고, 열매는 그 프로젝트가 낸 성과입니다. 줄을 누르면 한 일과 스택이 펼쳐집니다."
          aside={
            <TreeCanvas
              grow
              focus={focus}
              branches={treeBranches()}
              onFocusBranch={setHover}
              onSelectBranch={(i) =>
                idOfBranch.has(i) && reveal(idOfBranch.get(i))
              }
              label="프로젝트마다 가지가 하나씩 난 나무. 가지를 누르면 아래 목록에서 그 프로젝트가 펼쳐집니다."
            />
          }
        />
        <ProjectRows
          projects={projects}
          focus={focus}
          onFocus={setHover}
          open={open}
          onToggle={toggle}
        />
      </section>
    </Layout>
  );
};

export default ProjectsPage;

export const Head = () => (
  <>
    <title>Projects</title>
    <meta name="description" content="이상민의 연구 프로젝트 목록입니다." />
  </>
);

export const query = graphql`
  query ProjectsPage {
    projects: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "project" } }
        frontmatter: { draft: { ne: true } }
      }
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
          period
          description
          metrics
          stack
          details
        }
      }
    }
  }
`;
