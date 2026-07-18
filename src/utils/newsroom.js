const categories = require("../data/categories.json");
const tipCategories = require("../data/tipCategories.json");
const { slugifyTag } = require("./tags");

// Newsroom knowledge-graph builder.
// Nodes come straight from published blog posts and tips, so newly added
// markdown files join the graph automatically at build time.
// Edge sources, strongest first:
//   1. explicit `related` frontmatter slugs (optional, editorial)
//   2. shared tags, weighted by inverse tag frequency so rare shared tags
//      bind pages more strongly than ubiquitous ones.
// Per-node edges are capped so the graph stays readable as the corpus grows.

const MAX_LINKS_PER_NODE = 5;
const MAX_TAG_BUCKET = 80;
const RELATED_LINK_WEIGHT = 3;

const getClusterDefs = () => [
  ...categories.map((category) => ({
    id: category.slug,
    label: category.label,
    type: "blog",
  })),
  ...tipCategories.map((category) => ({
    id: `tips-${category.slug}`,
    label: `Tips · ${category.label}`,
    type: "tip",
  })),
];

const normalizeSlug = (value = "") => {
  const trimmed = String(value).trim();

  if (!trimmed) {
    return "";
  }

  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
};

const buildNode = ({ cluster, node, type }) => ({
  id: node.fields.slug,
  title: node.frontmatter.title || node.fields.slug,
  description: node.frontmatter.description || "",
  date: node.frontmatter.date || "",
  type,
  cluster,
  tags: (node.frontmatter.tags || []).map(slugifyTag).filter(Boolean),
  tagLabels: (node.frontmatter.tags || []).filter(Boolean),
  related: (node.frontmatter.related || []).map(normalizeSlug).filter(Boolean),
});

const buildNewsroomGraph = ({ posts = [], tips = [] }) => {
  const nodes = [
    ...posts.map((node) =>
      buildNode({
        cluster: node.fields.category || "notes",
        node,
        type: "blog",
      }),
    ),
    ...tips.map((node) =>
      buildNode({
        cluster: `tips-${(node.frontmatter.platforms || [])[0] || "macos-linux"}`,
        node,
        type: "tip",
      }),
    ),
  ];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  // Stable cluster palette order: curated definitions first, unknown
  // clusters appended alphabetically so existing colors never shift.
  const clusterDefs = getClusterDefs();
  const knownClusterIds = new Set(clusterDefs.map((cluster) => cluster.id));
  const unknownClusterIds = [
    ...new Set(
      nodes
        .map((node) => node.cluster)
        .filter((cluster) => !knownClusterIds.has(cluster)),
    ),
  ].sort();

  unknownClusterIds.forEach((clusterId) => {
    clusterDefs.push({
      id: clusterId,
      label: clusterId,
      type: clusterId.startsWith("tips-") ? "tip" : "blog",
    });
  });

  const clusterCounts = new Map();
  nodes.forEach((node) => {
    clusterCounts.set(node.cluster, (clusterCounts.get(node.cluster) || 0) + 1);
  });

  const clusters = clusterDefs
    .map((cluster, index) => ({
      ...cluster,
      count: clusterCounts.get(cluster.id) || 0,
      paletteIndex: index,
    }))
    .filter((cluster) => cluster.count > 0);

  // Tag buckets → weighted pair candidates.
  const tagBuckets = new Map();
  nodes.forEach((node) => {
    node.tags.forEach((tag) => {
      if (!tagBuckets.has(tag)) {
        tagBuckets.set(tag, []);
      }
      tagBuckets.get(tag).push(node.id);
    });
  });

  const pairWeights = new Map();
  const pairKey = (a, b) => (a < b ? `${a}\n${b}` : `${b}\n${a}`);

  tagBuckets.forEach((members) => {
    if (members.length < 2 || members.length > MAX_TAG_BUCKET) {
      return;
    }

    const idf = 1 / Math.log2(2 + members.length);

    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        const key = pairKey(members[i], members[j]);
        pairWeights.set(key, (pairWeights.get(key) || 0) + idf);
      }
    }
  });

  // Explicit editorial links always win.
  const relatedPairs = new Set();
  nodes.forEach((node) => {
    node.related.forEach((slug) => {
      if (slug !== node.id && nodeById.has(slug)) {
        const key = pairKey(node.id, slug);
        relatedPairs.add(key);
        pairWeights.set(key, (pairWeights.get(key) || 0) + RELATED_LINK_WEIGHT);
      }
    });
  });

  // Keep only each node's strongest edges (union of both endpoints' picks).
  const candidatesByNode = new Map();
  pairWeights.forEach((weight, key) => {
    const [a, b] = key.split("\n");
    [a, b].forEach((id) => {
      if (!candidatesByNode.has(id)) {
        candidatesByNode.set(id, []);
      }
      candidatesByNode.get(id).push({ key, weight });
    });
  });

  const keptKeys = new Set(relatedPairs);
  candidatesByNode.forEach((candidates) => {
    candidates
      .sort((left, right) => right.weight - left.weight)
      .slice(0, MAX_LINKS_PER_NODE)
      .forEach((candidate) => keptKeys.add(candidate.key));
  });

  const links = [...keptKeys]
    .map((key) => {
      const [source, target] = key.split("\n");

      return {
        source,
        target,
        weight: pairWeights.get(key) || RELATED_LINK_WEIGHT,
        related: relatedPairs.has(key),
      };
    })
    .sort((left, right) => right.weight - left.weight);

  const degree = new Map();
  links.forEach((link) => {
    degree.set(link.source, (degree.get(link.source) || 0) + 1);
    degree.set(link.target, (degree.get(link.target) || 0) + 1);
  });
  nodes.forEach((node) => {
    node.degree = degree.get(node.id) || 0;
  });

  return { clusters, links, nodes };
};

exports.buildNewsroomGraph = buildNewsroomGraph;
exports.MAX_LINKS_PER_NODE = MAX_LINKS_PER_NODE;
