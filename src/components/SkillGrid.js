import * as React from "react";
import MobileCardCarousel from "./MobileCardCarousel";
import SkillIcon from "./SkillIcon";

const createSkillPanels = (groups) =>
  groups.flatMap((group, groupIndex) => {
    if (group.skillClusters?.length) {
      return group.skillClusters.map((cluster, clusterIndex) => ({
        id: `${group.title}-${cluster.title}`,
        label: `AI ${String(clusterIndex + 1).padStart(2, "0")}`,
        title: cluster.title,
        summary: `${group.summary}: ${cluster.title}`,
        skills: cluster.skills,
      }));
    }

    return [
      {
        id: group.title,
        label: `CORE ${String(groupIndex + 1).padStart(2, "0")}`,
        title: group.title,
        summary: group.summary,
        skills: group.skills,
      },
    ];
  });

const SkillPanel = ({ panel }) => (
  <article
    className="skill-card"
    aria-label={`${panel.title}: ${panel.summary}`}
  >
    <header className="skill-card-header">
      <div>
        <span className="skill-card-label">{panel.label}</span>
        <h3>{panel.title}</h3>
      </div>
      <span
        className="skill-card-count"
        aria-label={`${panel.skills.length}개 기술`}
      >
        {String(panel.skills.length).padStart(2, "0")}
      </span>
    </header>
    <ul className="skill-list">
      {panel.skills.map((skill) => (
        <li key={skill}>
          <SkillIcon name={skill} />
          <span className="skill-logo-name">{skill}</span>
        </li>
      ))}
    </ul>
  </article>
);

const getSkillPageSignature = (pages) =>
  pages.map((page) => page.map((panel) => panel.id).join("|")).join("||");

const packSkillPanels = (panels, cardHeights, maximumHeight, gap) => {
  const pages = [];
  let currentPage = [];
  let occupiedHeight = 0;

  panels.forEach((panel, index) => {
    const cardHeight = Math.min(cardHeights[index], maximumHeight);
    const nextHeight = currentPage.length
      ? occupiedHeight + gap + cardHeight
      : cardHeight;

    if (currentPage.length && nextHeight > maximumHeight) {
      pages.push(currentPage);
      currentPage = [];
      occupiedHeight = 0;
    }

    currentPage.push(panel);
    occupiedHeight = currentPage.length === 1 ? cardHeight : nextHeight;
  });

  if (currentPage.length) {
    pages.push(currentPage);
  }

  return pages;
};

const useGreedySkillPages = (panels) => {
  const trackRef = React.useRef(null);
  const [pages, setPages] = React.useState(() =>
    panels.map((panel) => [panel]),
  );
  const pageSignature = getSkillPageSignature(pages);

  React.useEffect(() => {
    const track = trackRef.current;

    if (!track || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    let frameId;
    const updatePages = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const cards = Array.from(track.querySelectorAll(".skill-card"));
        const firstPage = track.querySelector(".mobile-skill-page");

        if (cards.length !== panels.length || !firstPage) {
          return;
        }

        const maximumHeight = Number.parseFloat(
          window.getComputedStyle(firstPage).maxHeight,
        );
        const gap =
          Number.parseFloat(window.getComputedStyle(firstPage).rowGap) || 0;
        const cardHeights = cards.map(
          (card) => card.getBoundingClientRect().height,
        );

        if (
          !Number.isFinite(maximumHeight) ||
          maximumHeight <= 0 ||
          cardHeights.some((height) => height <= 0)
        ) {
          return;
        }

        const nextPages = packSkillPanels(
          panels,
          cardHeights,
          maximumHeight,
          gap,
        );
        const nextSignature = getSkillPageSignature(nextPages);

        setPages((currentPages) =>
          getSkillPageSignature(currentPages) === nextSignature
            ? currentPages
            : nextPages,
        );
      });
    };

    const resizeObserver = new ResizeObserver(updatePages);
    track
      .querySelectorAll(".skill-card")
      .forEach((card) => resizeObserver.observe(card));
    window.addEventListener("resize", updatePages);
    updatePages();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePages);
    };
  }, [pageSignature, panels]);

  return { pages, trackRef };
};

const MobileSkillBrowser = ({ panels }) => {
  const { pages, trackRef } = useGreedySkillPages(panels);

  if (!panels.length) {
    return null;
  }

  return (
    <div className="mobile-skill-browser">
      <MobileCardCarousel
        adaptiveHeight
        ariaLabel="모바일 기술 스택"
        itemSelector=".mobile-skill-page"
        statusLabel="기술 스택 묶음"
      >
        <div className="skill-grid mobile-carousel-track" ref={trackRef}>
          {pages.map((page) => (
            <div
              className="mobile-skill-page"
              key={page.map((panel) => panel.id).join("|")}
              role="group"
              aria-label={`${page.map((panel) => panel.title).join(", ")} 기술 스택`}
            >
              {page.map((panel) => (
                <SkillPanel key={panel.id} panel={panel} />
              ))}
            </div>
          ))}
        </div>
      </MobileCardCarousel>
    </div>
  );
};

const useDenseSkillGrid = () => {
  const gridRef = React.useRef(null);

  React.useEffect(() => {
    const grid = gridRef.current;

    if (!grid || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    let frameId;
    const cards = Array.from(grid.children);

    const updateSpans = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        grid.dataset.denseReady = "true";

        const styles = window.getComputedStyle(grid);
        const rowHeight = Number.parseFloat(styles.gridAutoRows) || 1;
        const panelGap = Number.parseFloat(styles.columnGap) || 12;

        cards.forEach((card) => {
          const span = Math.ceil(
            (card.getBoundingClientRect().height + panelGap) / rowHeight,
          );
          card.style.gridRowEnd = `span ${span}`;
        });
      });
    };

    const resizeObserver = new ResizeObserver(updateSpans);
    cards.forEach((card) => resizeObserver.observe(card));
    updateSpans();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, []);

  return gridRef;
};

const SkillGrid = ({ groups }) => {
  const gridRef = useDenseSkillGrid();
  const panels = React.useMemo(() => createSkillPanels(groups), [groups]);

  return (
    <>
      <div className="skill-grid skill-grid-desktop" ref={gridRef}>
        {panels.map((panel) => (
          <SkillPanel key={panel.id} panel={panel} />
        ))}
      </div>
      <MobileSkillBrowser panels={panels} />
    </>
  );
};

export default SkillGrid;
