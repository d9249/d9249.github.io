import * as React from "react";
import { Link } from "gatsby";
import categories from "../data/categories.json";
import { truncateText } from "../utils/text";

/*
 * Posts as lines in a notebook rather than cards: date and category in the margin, the title,
 * one line of what it is about. The first post of a page can be set larger (featured).
 * Styles: .post-row in src/styles/site.css.
 */

const labelByCategory = new Map(
  categories.map((category) => [category.slug, category.label]),
);

export const PostRow = ({ post, featured = false }) => {
  const { frontmatter, fields, excerpt } = post;
  const categoryLabel =
    labelByCategory.get(fields.category) || frontmatter.category;
  const description = frontmatter.description || excerpt;

  return (
    <article className={`post-row${featured ? " is-featured" : ""}`}>
      <p className="post-row-meta">
        <time>{frontmatter.date}</time>
        <span>{categoryLabel}</span>
      </p>
      <div className="post-row-main">
        <h3 className="post-row-title">
          <Link to={fields.slug} title={frontmatter.title}>
            {frontmatter.title}
          </Link>
        </h3>
        <p className="post-row-desc" title={description}>
          {truncateText(description, featured ? 200 : 140)}
        </p>
      </div>
    </article>
  );
};

const PostRows = ({ posts, featured }) => (
  <div className="post-rows">
    {featured ? <PostRow post={featured} featured /> : null}
    {posts.map((post) => (
      <PostRow key={post.id} post={post} />
    ))}
  </div>
);

export default PostRows;
