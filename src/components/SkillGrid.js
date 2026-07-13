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

const MobileSkillBrowser = ({ panels }) => {
  if (!panels.length) {
    return null;
  }

  return (
    <div className="mobile-skill-browser">
      <MobileCardCarousel
        ariaLabel="모바일 기술 스택"
        itemSelector=".skill-card"
        statusLabel="기술 스택 카드"
      >
        <div className="skill-grid mobile-carousel-track">
          {panels.map((panel) => (
            <SkillPanel key={panel.id} panel={panel} />
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
  const panels = createSkillPanels(groups);

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
