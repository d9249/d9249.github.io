const categories = require("../data/categories.json");
const platforms = require("../data/tipCategories.json");

const normalize = (value) =>
  String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase();
const categoryLabels = new Map(
  categories.map((item) => [item.slug, item.label]),
);
const platformLabels = new Map(
  platforms.map((item) => [item.slug, item.label]),
);
const sectionLabels = { "blog-post": "블로그", tip: "팁", project: "프로젝트" };

const createSearchIndex = (nodes, pages) => {
  const entries = nodes.map((post) => {
    const frontmatter = post.frontmatter;
    const title = frontmatter.projectName || frontmatter.title;
    const categoryLabel =
      post.fields.contentType === "tip"
        ? (frontmatter.platforms || [])
            .map((name) => platformLabels.get(name) || name)
            .join(", ")
        : categoryLabels.get(post.fields.category) || frontmatter.category;
    const sectionLabel = sectionLabels[post.fields.contentType];
    return {
      ...post,
      frontmatter: { ...frontmatter, title },
      sectionLabel,
      categoryLabel,
      searchText: normalize(
        [
          title,
          frontmatter.title,
          sectionLabel,
          categoryLabel,
          frontmatter.description,
          frontmatter.author,
          frontmatter.repository,
          frontmatter.status,
          frontmatter.license,
          ...(frontmatter.tags || []),
          ...(frontmatter.highlights || []),
          post.excerpt,
          post.rawMarkdownBody,
        ].join(" "),
      ),
    };
  });
  return entries.concat(
    pages.map((page) => ({
      id: `page:${page.to}`,
      fields: { slug: page.to },
      frontmatter: { title: page.ko, description: `${page.ko} 페이지로 이동` },
      sectionLabel: "페이지",
      searchText: normalize([page.ko, page.label, page.to].join(" ")),
    })),
  );
};

const searchSite = (items, query) => {
  const normalized = normalize(query).trim();
  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (!tokens.length) return items;
  return items
    .filter((item) => tokens.every((token) => item.searchText.includes(token)))
    .sort(
      (left, right) =>
        Number(normalize(right.frontmatter.title).includes(normalized)) -
        Number(normalize(left.frontmatter.title).includes(normalized)),
    );
};

module.exports = { createSearchIndex, searchSite };
