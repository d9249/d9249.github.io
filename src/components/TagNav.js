import * as React from "react";
import { Link } from "gatsby";
import { getTagPath, getTagSummaries } from "../utils/tags";

const COLLAPSED_TAG_LIMIT = 18;

const TagNav = ({ posts, activeTag }) => {
  const tags = React.useMemo(() => getTagSummaries(posts), [posts]);
  const listId = React.useId();
  const shouldCollapse = tags.length > COLLAPSED_TAG_LIMIT;
  const [expanded, setExpanded] = React.useState(Boolean(activeTag));

  if (!tags.length) {
    return null;
  }

  const toggleTags = () => {
    setExpanded((current) => !current);
  };

  const visibleTags =
    shouldCollapse && !expanded ? tags.slice(0, COLLAPSED_TAG_LIMIT) : tags;
  const hiddenTagCount = tags.length - visibleTags.length;

  return (
    <nav className="tag-nav" aria-label="Blog tags">
      <div className="tag-nav-header">
        <span className="tag-nav-label">Tags</span>
        {shouldCollapse ? (
          <button
            className="tag-nav-toggle"
            type="button"
            aria-controls={listId}
            aria-expanded={expanded}
            aria-label={
              expanded ? "태그 접기" : `태그 더 보기 (${hiddenTagCount}개 숨김)`
            }
            onClick={toggleTags}
          >
            {expanded ? "접기" : "더 보기"}
          </button>
        ) : null}
      </div>
      <div className="tag-nav-list" id={listId}>
        {visibleTags.map((tag) => (
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
