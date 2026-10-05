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

/** the project's branch on the home tree: { index, leaf, fruit, name } or null */
const stageBySlug = new Map(
  showreel.stages.map((stage, index) => [
    withSlash(stage.href || ""),
    { index, leaf: stage.leaf, fruit: stage.fruit || null, name: stage.name },
  ]),
);
export const stageOf = (slug) =>
  (slug && stageBySlug.get(withSlash(slug))) || null;

/** branch links for the tree index: one per project on the tree, in branch order */
export const treeBranches = () =>
  showreel.stages.map((stage) => ({
    href: withSlash(stage.href),
    label: stage.name,
  }));

/** the reel's case for a project (shot 07): problem, capabilities grown, result — or null */
export const caseOf = (slug) => {
  const stage = stageOf(slug);
  return (stage && showreel.cases.find((c) => c.name === stage.name)) || null;
};

/** a skill package from the reel's shot 03: { pkg, kr, c, items } */
export const skillPackage = (pkg) =>
  showreel.skills.find((s) => s.pkg === pkg) || null;

export const leafColors = () => showreel.stages.map((stage) => stage.leaf);
export const rootColors = () => showreel.research.map((item) => item.color);

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

// ink or paper text on a colour: whichever has the higher contrast
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const INK = "#16171B",
  PAPER = "#F7F3EA";
export const onColor = (hex) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex || "")) return PAPER;
  const L = luminance(hex);
  const onInk = (L + 0.05) / (luminance(INK) + 0.05),
    onPaper = (luminance(PAPER) + 0.05) / (L + 0.05);
  return onInk >= onPaper ? INK : PAPER;
};

// a fill that carries text: the colour itself if ink or paper reads on it at 4.5:1, else darkened
// step by step until paper text does
const contrast = (a, b) => {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const darken = (hex, f) =>
  "#" +
  [1, 3, 5]
    .map((i) =>
      Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - f))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
export const solidOf = (hex) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex || "")) return hex;
  if (Math.max(contrast(hex, INK), contrast(hex, PAPER)) >= 4.5) return hex;
  let f = 0.05;
  while (f < 0.6 && contrast(darken(hex, f), PAPER) < 4.5) f += 0.05;
  return darken(hex, f);
};

/**
 * style prop for an element that carries a colour: --c (edges, tabs, swatches), --c-solid (a fill
 * with text on it, contrast-safe) and --on-c (the text on that fill)
 */
export const colorStyle = (color) => {
  if (!color) return undefined;
  const solid = solidOf(color);
  return { "--c": color, "--c-solid": solid, "--on-c": onColor(solid) };
};
