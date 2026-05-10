const path = require("path");
const fs = require("fs");
const categories = require("./src/data/categories.json");
const legacyRedirects = require("./src/data/legacy-redirects.json");
const tipCategories = require("./src/data/tipCategories.json");
const { getTagSummaries } = require("./src/utils/tags");

const POSTS_PER_BLOG_PAGE = 12;
const POSTS_ON_FIRST_BLOG_PAGE = 13;
const TIPS_PER_PAGE = 4;

const getTipsIndexPath = (categorySlug, page) => {
  const basePath = categorySlug ? `/tips/${categorySlug}/` : "/tips/";

  return page <= 1 ? basePath : `${basePath}page/${page}/`;
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type !== "MarkdownRemark") {
    return;
  }

  const fileNode = getNode(node.parent);
  if (!fileNode) {
    return;
  }

  const pathParts = fileNode.relativeDirectory.split(path.sep).filter(Boolean);
  const slugParts = [...pathParts, fileNode.name].filter(Boolean);

  if (fileNode.sourceInstanceName === "blog") {
    const category = pathParts[0] || "notes";

    createNodeField({
      name: "contentType",
      node,
      value: "blog-post",
    });

    createNodeField({
      name: "category",
      node,
      value: category,
    });

    createNodeField({
      name: "slug",
      node,
      value: `/blog/${slugParts.join("/")}/`,
    });

    return;
  }

  if (fileNode.sourceInstanceName !== "tips") {
    return;
  }

  createNodeField({
    name: "contentType",
    node,
    value: "tip",
  });

  createNodeField({
    name: "slug",
    node,
    value: `/tips/${slugParts.join("/")}/`,
  });
};

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;
  const result = await graphql(`
    {
      posts: allMarkdownRemark(
        filter: { fields: { contentType: { eq: "blog-post" } } }
        sort: { frontmatter: { date: DESC } }
      ) {
        nodes {
          id
          fields {
            slug
            category
          }
          frontmatter {
            title
            draft
            date(formatString: "YYYY.MM.DD")
            tags
          }
        }
      }
      tips: allMarkdownRemark(
        filter: { fields: { contentType: { eq: "tip" } } }
        sort: { frontmatter: { date: DESC } }
      ) {
        nodes {
          id
          fields {
            slug
          }
          frontmatter {
            title
            draft
            date(formatString: "YYYY.MM.DD")
            platforms
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild("Failed to load Markdown pages", result.errors);
    return;
  }

  const blogIndexTemplate = path.resolve("./src/templates/blog-index.js");
  const postTemplate = path.resolve("./src/templates/blog-post.js");
  const categoryTemplate = path.resolve("./src/templates/blog-category.js");
  const redirectTemplate = path.resolve("./src/templates/redirect.js");
  const tagTemplate = path.resolve("./src/templates/blog-tag.js");
  const tipsIndexTemplate = path.resolve("./src/templates/tips-index.js");
  const tipTemplate = path.resolve("./src/templates/tip-post.js");
  const posts = result.data.posts.nodes.filter(
    (post) => !post.frontmatter.draft,
  );
  const tips = result.data.tips.nodes.filter((tip) => !tip.frontmatter.draft);
  const tagSummaries = getTagSummaries(posts);
  const blogPageCount =
    posts.length <= POSTS_ON_FIRST_BLOG_PAGE
      ? 1
      : 1 +
        Math.ceil(
          (posts.length - POSTS_ON_FIRST_BLOG_PAGE) / POSTS_PER_BLOG_PAGE,
        );

  Array.from({ length: blogPageCount }).forEach((_, index) => {
    const currentPage = index + 1;
    const isFirstPage = currentPage === 1;
    const limit = isFirstPage ? POSTS_ON_FIRST_BLOG_PAGE : POSTS_PER_BLOG_PAGE;
    const skip = isFirstPage
      ? 0
      : POSTS_ON_FIRST_BLOG_PAGE + (currentPage - 2) * POSTS_PER_BLOG_PAGE;

    createPage({
      path: currentPage === 1 ? "/blog/" : `/blog/page/${currentPage}/`,
      component: blogIndexTemplate,
      context: {
        currentPage,
        limit,
        pageCount: blogPageCount,
        skip,
        tagSummaries,
        totalPosts: posts.length,
      },
    });
  });

  posts.forEach((post, index) => {
    createPage({
      path: post.fields.slug,
      component: postTemplate,
      context: {
        id: post.id,
        previous: index === posts.length - 1 ? null : posts[index + 1],
        next: index === 0 ? null : posts[index - 1],
      },
    });
  });

  categories.forEach((category) => {
    createPage({
      path: `/blog/${category.slug}/`,
      component: categoryTemplate,
      context: {
        category: category.slug,
        label: category.label,
        description: category.description,
        tagSummaries,
      },
    });
  });

  legacyRedirects.forEach((redirect) => {
    createPage({
      path: redirect.from,
      component: redirectTemplate,
      context: {
        to: redirect.to,
      },
    });
  });

  tagSummaries.forEach((tag) => {
    createPage({
      path: `/blog/tags/${tag.slug}/`,
      component: tagTemplate,
      context: {
        tag: tag.label,
        tagSummaries,
      },
    });
  });

  const createTipIndexPages = ({
    activeCategory,
    description,
    label,
    tipsForIndex,
  }) => {
    const pageCount = Math.max(
      1,
      Math.ceil(tipsForIndex.length / TIPS_PER_PAGE),
    );

    Array.from({ length: pageCount }).forEach((_, index) => {
      const currentPage = index + 1;
      const skip = index * TIPS_PER_PAGE;
      const pageTips = tipsForIndex.slice(skip, skip + TIPS_PER_PAGE);

      createPage({
        path: getTipsIndexPath(activeCategory, currentPage),
        component: tipsIndexTemplate,
        context: {
          activeCategory,
          currentPage,
          description,
          label,
          pageCount,
          skip,
          tipIds: pageTips.map((tip) => tip.id),
          totalTips: tipsForIndex.length,
        },
      });
    });
  };

  createTipIndexPages({
    activeCategory: null,
    description:
      "새로 등장하는 응용프로그램과 로컬 도구를 플랫폼별로 빠르게 훑어볼 수 있게 정리합니다.",
    label: "Application Tips",
    tipsForIndex: tips,
  });

  tipCategories.forEach((category) => {
    createTipIndexPages({
      activeCategory: category.slug,
      description: category.description,
      label: category.label,
      tipsForIndex: tips.filter((tip) =>
        tip.frontmatter.platforms?.includes(category.slug),
      ),
    });
  });

  tips.forEach((tip, index) => {
    createPage({
      path: tip.fields.slug,
      component: tipTemplate,
      context: {
        id: tip.id,
        previous: index === tips.length - 1 ? null : tips[index + 1],
        next: index === 0 ? null : tips[index - 1],
      },
    });
  });
};

const removeNullBytesFromHtml = (directory, sanitizedFiles) => {
  if (!fs.existsSync(directory)) {
    return;
  }

  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      removeNullBytesFromHtml(entryPath, sanitizedFiles);
      return;
    }

    if (!entry.isFile() || !entry.name.endsWith(".html")) {
      return;
    }

    const html = fs.readFileSync(entryPath, "utf8");
    if (!html.includes("\u0000")) {
      return;
    }

    fs.writeFileSync(entryPath, html.replace(/\u0000/g, ""), "utf8");
    sanitizedFiles.push(entryPath);
  });
};

exports.onPostBuild = ({ reporter }) => {
  const sanitizedFiles = [];
  removeNullBytesFromHtml(path.resolve("./public"), sanitizedFiles);

  if (sanitizedFiles.length > 0) {
    reporter.info(
      `Removed null bytes from ${sanitizedFiles.length} generated HTML files.`,
    );
  }
};
