import * as React from "react";
import { Link } from "gatsby";
import { getTagPath, getTagSummaries } from "../utils/tags";

const COLLAPSED_TAG_LIMIT = 18;
const TAG_ROW_GAP = 7;
const FALLBACK_LIST_WIDTH = 420;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const estimateTagWidth = (tag) => {
  const labelWidth = tag.label.length * 7.4;
  const countWidth = String(tag.count).length * 8;

  return Math.ceil(Math.min(220, Math.max(76, labelWidth + countWidth + 46)));
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

const TagNav = ({ posts, tagSummaries, activeTag }) => {
  const tags = React.useMemo(
    () => tagSummaries || getTagSummaries(posts),
    [posts, tagSummaries],
  );
  const listId = React.useId();
  const listRef = React.useRef(null);
  const measureRef = React.useRef(null);
  const shouldCollapse = tags.length > COLLAPSED_TAG_LIMIT;
  const [expanded, setExpanded] = React.useState(Boolean(activeTag));
  const [listWidth, setListWidth] = React.useState(FALLBACK_LIST_WIDTH);
  const [measuredWidths, setMeasuredWidths] = React.useState([]);

  const toggleTags = () => {
    setExpanded((current) => !current);
  };

  const visibleTags = React.useMemo(
    () =>
      shouldCollapse && !expanded ? tags.slice(0, COLLAPSED_TAG_LIMIT) : tags,
    [expanded, shouldCollapse, tags],
  );
  const hiddenTagCount = tags.length - visibleTags.length;
  const tetrisRows = React.useMemo(
    () => getTetrisRows(visibleTags, listWidth, measuredWidths),
    [listWidth, measuredWidths, visibleTags],
  );

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
    if (!measureRef.current) {
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
  }, [visibleTags]);

  if (!tags.length) {
    return null;
  }

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
      <div className="tag-nav-list" id={listId} ref={listRef}>
        {tetrisRows.map((row, rowIndex) => (
          <div className="tag-nav-row" key={`tag-row-${rowIndex}`}>
            {row.map(({ tag, width }) => (
              <Link
                key={tag.slug}
                to={getTagPath(tag.label)}
                className={`tag-nav-link${
                  tag.label === activeTag ? " is-active" : ""
                }`}
                style={{
                  "--tag-item-basis": `${width}px`,
                }}
              >
                <span>#{tag.label}</span>
                <strong>{tag.count}</strong>
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="tag-nav-measurer" ref={measureRef} aria-hidden="true">
        {visibleTags.map((tag) => (
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
