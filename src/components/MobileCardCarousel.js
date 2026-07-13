import * as React from "react";

const MAX_VISIBLE_PAGES = 7;

const getScrollContainer = (viewport) => viewport?.firstElementChild || null;

const getVisiblePageIndexes = (itemCount, activeIndex) => {
  const visiblePageCount = Math.min(itemCount, MAX_VISIBLE_PAGES);
  const maxStartIndex = Math.max(itemCount - visiblePageCount, 0);
  const startIndex = Math.min(
    Math.max(activeIndex - Math.floor(visiblePageCount / 2), 0),
    maxStartIndex,
  );

  return Array.from(
    { length: visiblePageCount },
    (_, index) => startIndex + index,
  );
};

const MobileCardCarousel = ({
  adaptiveHeight = false,
  ariaLabel,
  children,
  itemSelector,
  statusLabel = "카드",
}) => {
  const viewportRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState(null);

  const getItems = React.useCallback(() => {
    const scrollContainer = getScrollContainer(viewportRef.current);

    return scrollContainer
      ? Array.from(scrollContainer.querySelectorAll(itemSelector))
      : [];
  }, [itemSelector]);

  React.useEffect(() => {
    const scrollContainer = getScrollContainer(viewportRef.current);

    if (!scrollContainer) {
      return undefined;
    }

    const syncActiveIndex = () => {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = window.requestAnimationFrame(() => {
        const items = getItems();
        setItemCount(items.length);

        if (!items.length) {
          setActiveIndex(0);
          return;
        }

        const containerRect = scrollContainer.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        items.forEach((item, index) => {
          const rect = item.getBoundingClientRect();
          const distance = Math.abs(
            rect.left + rect.width / 2 - containerCenter,
          );

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveIndex(closestIndex);

        if (adaptiveHeight) {
          const activeItem = items[closestIndex];
          const styles = window.getComputedStyle(scrollContainer);
          const verticalPadding =
            (Number.parseFloat(styles.paddingTop) || 0) +
            (Number.parseFloat(styles.paddingBottom) || 0);

          setViewportHeight(
            Math.ceil(
              activeItem.getBoundingClientRect().height + verticalPadding,
            ),
          );
        }
      });
    };

    syncActiveIndex();
    scrollContainer.addEventListener("scroll", syncActiveIndex, {
      passive: true,
    });
    window.addEventListener("resize", syncActiveIndex);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      scrollContainer.removeEventListener("scroll", syncActiveIndex);
      window.removeEventListener("resize", syncActiveIndex);
    };
  }, [adaptiveHeight, children, getItems]);

  const moveTo = React.useCallback(
    (nextIndex) => {
      const scrollContainer = getScrollContainer(viewportRef.current);
      const items = getItems();
      const target = items[nextIndex];

      if (!scrollContainer || !target) {
        return;
      }

      const containerRect = scrollContainer.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetCenter =
        targetRect.left -
        containerRect.left +
        scrollContainer.scrollLeft +
        targetRect.width / 2;

      scrollContainer.scrollTo({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        left: Math.max(0, targetCenter - scrollContainer.clientWidth / 2),
      });
      setActiveIndex(nextIndex);
    },
    [getItems],
  );

  const visibleCount = Math.max(itemCount, React.Children.count(children));
  const visibleIndex = Math.min(activeIndex + 1, Math.max(visibleCount, 1));
  const visiblePageIndexes = getVisiblePageIndexes(
    Math.max(visibleCount, 1),
    visibleIndex - 1,
  );
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < visibleCount - 1;

  return (
    <section className="mobile-card-carousel" aria-label={ariaLabel}>
      <div className="mobile-card-carousel-stage">
        <button
          className="mobile-card-carousel-arrow is-previous"
          type="button"
          aria-label={`이전 ${statusLabel}`}
          disabled={!hasPrevious}
          onClick={() => moveTo(activeIndex - 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div
          className="mobile-card-carousel-viewport"
          ref={viewportRef}
          style={
            adaptiveHeight && viewportHeight
              ? { height: `${viewportHeight}px` }
              : undefined
          }
        >
          {children}
        </div>
        <button
          className="mobile-card-carousel-arrow is-next"
          type="button"
          aria-label={`다음 ${statusLabel}`}
          disabled={!hasNext}
          onClick={() => moveTo(activeIndex + 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>
      <div className="mobile-card-carousel-status" aria-live="polite">
        <span className="mobile-card-carousel-pagination" aria-hidden="true">
          {visiblePageIndexes.map((index) => (
            <span
              className={`mobile-card-carousel-page${
                index === visibleIndex - 1 ? " is-active" : ""
              }`}
              key={`page-${index}`}
            />
          ))}
        </span>
        <span className="visually-hidden">
          {statusLabel} {visibleIndex} / {Math.max(visibleCount, 1)}
        </span>
      </div>
    </section>
  );
};

export default MobileCardCarousel;
