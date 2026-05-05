const path = require("path");
const categories = require("./src/data/categories.json");

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
            date
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild("Failed to load Markdown pages", result.errors);
    return;
  }

  const postTemplate = path.resolve("./src/templates/blog-post.js");
  const categoryTemplate = path.resolve("./src/templates/blog-category.js");
  const posts = result.data.posts.nodes.filter(
    (post) => !post.frontmatter.draft,
  );

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
      },
    });
  });
};
