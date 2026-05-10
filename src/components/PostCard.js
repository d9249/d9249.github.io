import * as React from "react";
import { Link } from "gatsby";
import categories from "../data/categories.json";
import { truncateText } from "../utils/text";

const labelByCategory = new Map(
  categories.map((category) => [category.slug, category.label]),
);

const PostCard = ({ post, featured = false }) => {
  const { frontmatter, fields, excerpt } = post;
  const categoryLabel =
    labelByCategory.get(fields.category) || frontmatter.category;
  const description = frontmatter.description || excerpt;
  const titleLimit = featured ? 72 : 44;
  const descriptionLimit = featured ? 150 : 118;

  return (
    <article className={`post-card ${featured ? "is-featured" : ""}`}>
      <Link
        className="post-thumb"
        to={fields.slug}
        aria-label={frontmatter.title}
        title={frontmatter.title}
      >
        <span>{categoryLabel}</span>
      </Link>
      <div className="post-card-body">
        <div className="meta">{categoryLabel}</div>
        <h3>
          <Link
            to={fields.slug}
            aria-label={frontmatter.title}
            title={frontmatter.title}
          >
            {truncateText(frontmatter.title, titleLimit)}
          </Link>
        </h3>
        <p title={description}>{truncateText(description, descriptionLimit)}</p>
        <div className="post-card-meta">
          <span>{frontmatter.author}</span>
          <time>{frontmatter.date}</time>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
