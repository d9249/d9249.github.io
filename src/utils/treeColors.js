import showreel from "../data/showreel.json";

/*
 * One colour, one meaning (DESIGN.md §2) — the same colours the home tree uses:
 *   a project's leaf colour, a paper's root (research) colour, mandarin for a result.
 * Cards take the colour as `--c`, which components.css draws as the card's top edge.
 */

const withSlash = (path) => (path.endsWith("/") ? path : `${path}/`);

const leafBySlug = new Map(
  showreel.stages
    .filter((stage) => stage.href && stage.leaf)
    .map((stage) => [withSlash(stage.href), stage.leaf]),
);

const root = Object.fromEntries(
  showreel.research.map((item) => [item.id, item.color]),
);

// research projects grow from the roots: they take the colour of the paper they came from
const researchProjects = {
  "/projects/lightgcn-wfgcn-recommender/": root.R2,
  "/projects/degenerative-arthritis-specialist-ensemble/": root.R4,
  "/projects/mcu-net-medical-imaging/": root.R6,
};

export const projectColor = (slug) =>
  slug
    ? leafBySlug.get(withSlash(slug)) ||
      researchProjects[withSlash(slug)] ||
      null
    : null;

const rootByHref = new Map(
  showreel.research
    .filter((item) => /^https?:\/\/(?!d9249\.github\.io)/.test(item.href))
    .map((item) => [item.href, item.color]),
);

const rootByType = {
  "International Conference": root.R5,
  "KCI Journal": root.R6,
};

export const paperColor = (paper) =>
  rootByHref.get(paper.href) || rootByType[paper.type] || null;

export const RESULT_COLOR = "var(--c-mandarin)";

/** style prop for a card that carries a colour */
export const colorStyle = (color) => (color ? { "--c": color } : undefined);
