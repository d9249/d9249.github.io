const DEFAULT_PROFILE_TAG_LIMIT = 8;

const getFrontmatter = (project) => project?.frontmatter || project || {};

const toTags = (value) => (Array.isArray(value) ? value : []);

const normalizeTag = (tag) => (typeof tag === "string" ? tag.trim() : "");

const addUniqueTags = (target, tags, seen, limit) => {
  for (const tag of tags) {
    const normalizedTag = normalizeTag(tag);

    if (!normalizedTag || seen.has(normalizedTag)) {
      continue;
    }

    seen.add(normalizedTag);
    target.push(normalizedTag);

    if (target.length >= limit) {
      return true;
    }
  }

  return false;
};

export const getProjectProfileTags = (
  projects,
  limit = DEFAULT_PROFILE_TAG_LIMIT,
) => {
  const frontmatters = toTags(projects).map(getFrontmatter);
  const selectedTags = [];
  const seenTags = new Set();

  const tagRounds = [
    (frontmatter) => toTags(frontmatter.metrics).slice(0, 1),
    (frontmatter) => toTags(frontmatter.metrics).slice(1, 2),
    (frontmatter) => toTags(frontmatter.metrics).slice(2, 3),
    (frontmatter) => toTags(frontmatter.stack).slice(0, 1),
    (frontmatter) => toTags(frontmatter.stack).slice(1, 2),
  ];

  for (const getTags of tagRounds) {
    for (const frontmatter of frontmatters) {
      if (addUniqueTags(selectedTags, getTags(frontmatter), seenTags, limit)) {
        return selectedTags;
      }
    }
  }

  return selectedTags;
};
