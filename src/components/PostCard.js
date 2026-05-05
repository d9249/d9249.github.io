import * as React from "react";
import { Link } from "gatsby";
import categories from "../data/categories.json";

const labelByCategory = new Map(
  categories.map((category) => [category.slug, category.label]),
);

const PostCard = ({ post, featured = false }) => {
  const { frontmatter, fields, excerpt } = post;
  const categoryLabel =
    labelByCategory.get(fields.category) || frontmatter.category;

  return (
    <article className={`post-card ${featured ? "is-featured" : ""}`}>
      <Link
        className="post-thumb"
        to={fields.slug}
        aria-label={frontmatter.title}
      >
        <span>{categoryLabel}</span>
      </Link>
      <div className="post-card-body">
        <div className="meta">{categoryLabel}</div>
        <h3>
          <Link to={fields.slug}>{frontmatter.title}</Link>
        </h3>
        <p>{frontmatter.description || excerpt}</p>
        <div className="post-card-meta">
          <span>{frontmatter.author}</span>
          <time>{frontmatter.date}</time>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
