import * as React from "react";

const getScrollContainer = (viewport) => viewport?.firstElementChild || null;

const MobileCardCarousel = ({
  ariaLabel,
  children,
  itemSelector,
  statusLabel = "카드",
}) => {
  const viewportRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(0);

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
  }, [children, getItems]);

  const moveTo = React.useCallback(
    (nextIndex) => {
      const items = getItems();
      const target = items[nextIndex];

      if (!target) {
        return;
      }

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveIndex(nextIndex);
    },
    [getItems],
  );

  const visibleCount = Math.max(itemCount, React.Children.count(children));
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
        <div className="mobile-card-carousel-viewport" ref={viewportRef}>
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
      <span className="mobile-card-carousel-status" aria-live="polite">
        {String(Math.min(activeIndex + 1, Math.max(visibleCount, 1))).padStart(
          2,
          "0",
        )}{" "}
        / {String(Math.max(visibleCount, 1)).padStart(2, "0")}
      </span>
    </section>
  );
};

export default MobileCardCarousel;
