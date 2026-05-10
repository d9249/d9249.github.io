const slugifyTag = (tag = "") =>
  String(tag)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getBlogTagPath = (tag) => `/blog/tags/${slugifyTag(tag)}/`;

const getTipTagPath = (tag) => `/tips/tags/${slugifyTag(tag)}/`;

const getTagPath = getBlogTagPath;

const getTagSummaries = (posts = []) => {
  const tagMap = new Map();

  posts.forEach((post) => {
    (post.frontmatter?.tags || []).forEach((tag) => {
      const slug = slugifyTag(tag);
      const current = tagMap.get(slug);

      tagMap.set(slug, {
        label: current?.label || tag,
        slug,
        count: (current?.count || 0) + 1,
      });
    });
  });

  return [...tagMap.values()].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    const aLabel = a.label.toLowerCase();
    const bLabel = b.label.toLowerCase();

    if (aLabel < bLabel) {
      return -1;
    }

    if (aLabel > bLabel) {
      return 1;
    }

    return 0;
  });
};

exports.getTagPath = getTagPath;
exports.getBlogTagPath = getBlogTagPath;
exports.getTagSummaries = getTagSummaries;
exports.getTipTagPath = getTipTagPath;
exports.slugifyTag = slugifyTag;
