const path = require("path");
const fs = require("fs");
const categories = require("./src/data/categories.json");
const legacyRedirects = require("./src/data/legacy-redirects.json");
const { getTagSummaries } = require("./src/utils/tags");

const POSTS_PER_BLOG_PAGE = 12;

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type !== "MarkdownRemark") {
    return;
  }

  const fileNode = getNode(node.parent);
  if (!fileNode || fileNode.sourceInstanceName !== "blog") {
    return;
  }

  const pathParts = fileNode.relativeDirectory.split(path.sep).filter(Boolean);
  const category = pathParts[0] || "notes";
  const slugParts = [...pathParts, fileNode.name].filter(Boolean);

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
  const posts = result.data.posts.nodes.filter(
    (post) => !post.frontmatter.draft,
  );
  const tagSummaries = getTagSummaries(posts);
  const blogPageCount = Math.max(
    1,
    Math.ceil(posts.length / POSTS_PER_BLOG_PAGE),
  );

  Array.from({ length: blogPageCount }).forEach((_, index) => {
    const currentPage = index + 1;

    createPage({
      path: currentPage === 1 ? "/blog/" : `/blog/page/${currentPage}/`,
      component: blogIndexTemplate,
      context: {
        currentPage,
        limit: POSTS_PER_BLOG_PAGE,
        pageCount: blogPageCount,
        skip: index * POSTS_PER_BLOG_PAGE,
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
