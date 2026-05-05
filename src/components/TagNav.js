import * as React from "react";
import { Link } from "gatsby";
import { getTagPath, getTagSummaries } from "../utils/tags";

const TagNav = ({ posts, activeTag }) => {
  const tags = getTagSummaries(posts);

  if (!tags.length) {
    return null;
  }

  return (
    <nav className="tag-nav" aria-label="Blog tags">
      <span className="tag-nav-label">Tags</span>
      <div className="tag-nav-list">
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            to={getTagPath(tag.label)}
            className={tag.label === activeTag ? "is-active" : undefined}
          >
            <span>#{tag.label}</span>
            <strong>{tag.count}</strong>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default TagNav;
