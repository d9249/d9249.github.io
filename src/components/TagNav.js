import * as React from "react";
import { Link } from "gatsby";
import { getTagPath, getTagSummaries } from "../utils/tags";

const COLLAPSED_TAG_LIMIT = 18;
const EXPANDED_TAG_PAGE_SIZE = 72;
const TAG_ROW_GAP = 7;
const FALLBACK_LIST_WIDTH = 420;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const estimateTagWidth = (tag) => {
  const labelWidth = tag.label.length * 7.4;
  const countWidth = String(tag.count).length * 8;

  return Math.ceil(Math.min(220, Math.max(76, labelWidth + countWidth + 46)));
};

const getCollapsedTags = (tags, activeTag) => {
  const active = activeTag
    ? tags.find((tag) => tag.label === activeTag)
    : undefined;

  if (!active) {
    return tags.slice(0, COLLAPSED_TAG_LIMIT);
  }

  return [active, ...tags.filter((tag) => tag.label !== activeTag)].slice(
    0,
    COLLAPSED_TAG_LIMIT,
  );
};

const getTagPageForActiveTag = (tags, activeTag) => {
  if (!activeTag) {
    return 0;
  }

  const activeTagIndex = tags.findIndex((tag) => tag.label === activeTag);

  return activeTagIndex < 0
    ? 0
    : Math.floor(activeTagIndex / EXPANDED_TAG_PAGE_SIZE);
};

const getTetrisRows = (tags, listWidth, measuredWidths) => {
  const widthLimit = Math.max(
    240,
    Math.floor(listWidth || FALLBACK_LIST_WIDTH),
  );
  const items = tags.map((tag, index) => ({
    tag,
    index,
    width: Math.min(
      widthLimit,
      Math.ceil(measuredWidths[index] || estimateTagWidth(tag)),
    ),
  }));
  const packedRows = [];

  [...items]
    .sort((a, b) => b.width - a.width || a.index - b.index)
    .forEach((item) => {
      let bestRow = null;
      let bestRemaining = Infinity;

      packedRows.forEach((row) => {
        const nextWidth =
          row.width + (row.items.length ? TAG_ROW_GAP : 0) + item.width;

        if (nextWidth > widthLimit) {
          return;
        }

        const remaining = widthLimit - nextWidth;

        if (
          remaining < bestRemaining ||
          (remaining === bestRemaining && row.minIndex < bestRow?.minIndex)
        ) {
          bestRow = row;
          bestRemaining = remaining;
        }
      });

      if (!bestRow) {
        packedRows.push({
          width: item.width,
          minIndex: item.index,
          items: [item],
        });
        return;
      }

      bestRow.width += (bestRow.items.length ? TAG_ROW_GAP : 0) + item.width;
      bestRow.minIndex = Math.min(bestRow.minIndex, item.index);
      bestRow.items.push(item);
    });

  return packedRows
    .map((row) => ({
      ...row,
      items: row.items.sort((a, b) => a.index - b.index),
    }))
    .sort((a, b) => a.minIndex - b.minIndex)
    .map((row) => row.items);
};

const TagChip = ({
  activeTag,
  getTagPathForTag,
  linkedTags,
  nativeNavigation,
  tag,
  width,
}) => {
  const className = `tag-nav-link${tag.label === activeTag ? " is-active" : ""}`;
  const style = Number.isFinite(width)
    ? {
        "--tag-item-basis": `${width}px`,
      }
    : undefined;
  const content = (
    <>
      <span>#{tag.label}</span>
      <strong>{tag.count}</strong>
    </>
  );

  if (!linkedTags) {
    return (
      <span className={`${className} tag-nav-chip`} style={style}>
        {content}
      </span>
    );
  }

  const tagPath = getTagPathForTag(tag.label);

  if (nativeNavigation) {
    return (
      <a href={tagPath} className={className} style={style}>
        {content}
      </a>
    );
  }

  return (
    <Link to={tagPath} className={className} style={style}>
      {content}
    </Link>
  );
};

const TagNav = ({
  activeTag,
  ariaLabel = "Blog tags",
  getTagPathForTag = getTagPath,
  linkedTags = true,
  posts,
  tagSummaries,
}) => {
  const tags = React.useMemo(
    () => tagSummaries || getTagSummaries(posts),
    [posts, tagSummaries],
  );
  const listId = React.useId();
  const listRef = React.useRef(null);
  const measureRef = React.useRef(null);
  const shouldCollapse = tags.length > COLLAPSED_TAG_LIMIT;
  const initialTagPage = React.useMemo(
    () => getTagPageForActiveTag(tags, activeTag),
    [activeTag, tags],
  );
  const tagPageCount = Math.max(
    1,
    Math.ceil(tags.length / EXPANDED_TAG_PAGE_SIZE),
  );
  const [expanded, setExpanded] = React.useState(false);
  const [tagPage, setTagPage] = React.useState(initialTagPage);
  const [listWidth, setListWidth] = React.useState(FALLBACK_LIST_WIDTH);
  const [measuredWidths, setMeasuredWidths] = React.useState([]);
  const currentTagPage = Math.min(tagPage, tagPageCount - 1);
  const tagPageStart = currentTagPage * EXPANDED_TAG_PAGE_SIZE;
  const tagPageEnd = Math.min(
    tags.length,
    tagPageStart + EXPANDED_TAG_PAGE_SIZE,
  );

  const toggleTags = () => {
    if (!expanded) {
      setTagPage(initialTagPage);
    }

    setExpanded((current) => !current);
  };

  const showPreviousTagPage = () => {
    setTagPage((current) => Math.max(0, current - 1));
  };

  const showNextTagPage = () => {
    setTagPage((current) => Math.min(tagPageCount - 1, current + 1));
  };

  const visibleTags = React.useMemo(() => {
    if (shouldCollapse && !expanded) {
      return getCollapsedTags(tags, activeTag);
    }

    if (expanded) {
      return tags.slice(tagPageStart, tagPageEnd);
    }

    return tags;
  }, [activeTag, expanded, shouldCollapse, tagPageEnd, tagPageStart, tags]);
  const hiddenTagCount = Math.max(0, tags.length - COLLAPSED_TAG_LIMIT);
  const tagRows = React.useMemo(
    () =>
      expanded ? [] : getTetrisRows(visibleTags, listWidth, measuredWidths),
    [expanded, listWidth, measuredWidths, visibleTags],
  );

  useIsomorphicLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollLeft = 0;
      listRef.current.scrollTop = 0;
    }
  }, [visibleTags]);

  useIsomorphicLayoutEffect(() => {
    if (!listRef.current) {
      return undefined;
    }

    const updateListWidth = () => {
      setListWidth(listRef.current?.clientWidth || FALLBACK_LIST_WIDTH);
    };

    updateListWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateListWidth);
      return () => window.removeEventListener("resize", updateListWidth);
    }

    const observer = new ResizeObserver(updateListWidth);
    observer.observe(listRef.current);

    return () => observer.disconnect();
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (expanded || !measureRef.current) {
      return;
    }

    const nextWidths = [...measureRef.current.children].map((node) =>
      Math.ceil(node.getBoundingClientRect().width),
    );

    setMeasuredWidths((currentWidths) => {
      const hasSameWidths =
        currentWidths.length === nextWidths.length &&
        currentWidths.every((width, index) => width === nextWidths[index]);

      return hasSameWidths ? currentWidths : nextWidths;
    });
  }, [expanded, visibleTags]);

  if (!tags.length) {
    return null;
  }

  return (
    <nav
      className="tag-nav"
      aria-label={ariaLabel}
      data-expanded={expanded ? "true" : "false"}
      data-tag-count={visibleTags.length}
      data-total-tag-count={tags.length}
    >
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
      <div className="tag-nav-list" id={listId} ref={listRef}>
        {expanded
          ? visibleTags.map((tag) => (
              <TagChip
                activeTag={activeTag}
                getTagPathForTag={getTagPathForTag}
                key={tag.slug}
                linkedTags={linkedTags}
                nativeNavigation
                tag={tag}
              />
            ))
          : tagRows.map((row, rowIndex) => (
              <div className="tag-nav-row" key={`tag-row-${rowIndex}`}>
                {row.map(({ tag, width }) => (
                  <TagChip
                    activeTag={activeTag}
                    getTagPathForTag={getTagPathForTag}
                    key={tag.slug}
                    linkedTags={linkedTags}
                    tag={tag}
                    width={width}
                  />
                ))}
              </div>
            ))}
      </div>
      {expanded && tagPageCount > 1 ? (
        <div className="tag-nav-pagination">
          <span className="tag-nav-page-summary">
            {tagPageStart + 1}–{tagPageEnd} / {tags.length}
          </span>
          <div className="tag-nav-page-actions">
            <button
              className="tag-nav-page-button"
              type="button"
              aria-controls={listId}
              aria-label="이전 태그 페이지"
              disabled={currentTagPage === 0}
              onClick={showPreviousTagPage}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <strong>
              {currentTagPage + 1} / {tagPageCount}
            </strong>
            <button
              className="tag-nav-page-button"
              type="button"
              aria-controls={listId}
              aria-label="다음 태그 페이지"
              disabled={currentTagPage === tagPageCount - 1}
              onClick={showNextTagPage}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      ) : null}
      <span className="visually-hidden" aria-live="polite">
        {expanded
          ? `전체 ${tags.length}개 중 ${tagPageStart + 1}번째부터 ${tagPageEnd}번째 태그가 표시되었습니다. 태그 목록 안에서 세로로 스크롤할 수 있습니다.`
          : `주요 태그 ${visibleTags.length}개가 표시되었습니다.`}
      </span>
      <div className="tag-nav-measurer" ref={measureRef} aria-hidden="true">
        {expanded
          ? null
          : visibleTags.map((tag) => (
              <span className="tag-nav-measure-chip" key={tag.slug}>
                <span>#{tag.label}</span>
                <strong>{tag.count}</strong>
              </span>
            ))}
      </div>
    </nav>
  );
};

export default TagNav;
