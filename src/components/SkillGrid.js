import * as React from "react";
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

const SkillPanel = ({ density, panel }) => (
  <article
    className="skill-card"
    data-skill-density={density}
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
        const cardHeights = cards.map(
          (card) => card.getBoundingClientRect().height,
        );

        if (cardHeights.some((height) => height <= 0)) {
          delete grid.dataset.denseReady;
          cards.forEach((card) => card.style.removeProperty("grid-row-end"));
          return;
        }

        grid.dataset.denseReady = "true";

        const styles = window.getComputedStyle(grid);
        const rowHeight = Number.parseFloat(styles.gridAutoRows) || 1;
        const panelGap = Number.parseFloat(styles.columnGap) || 12;

        cards.forEach((card, index) => {
          const span = Math.ceil((cardHeights[index] + panelGap) / rowHeight);
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

const getTitleWidthScore = (title) =>
  Array.from(title).reduce(
    (score, character) =>
      score + (/[^\u0000-\u00ff]/.test(character) ? 1.7 : 1),
    0,
  );

const getMobileSkillDensity = (panel) =>
  panel.skills.length > 8 || getTitleWidthScore(panel.title) > 18
    ? "wide"
    : "compact";

const MobileSkillBrowser = ({ panels }) => {
  const gridRef = useDenseSkillGrid();

  if (!panels.length) {
    return null;
  }

  return (
    <section className="mobile-skill-browser" aria-label="모바일 기술 스택">
      <div className="skill-grid mobile-skill-grid" ref={gridRef}>
        {panels.map((panel) => (
          <SkillPanel
            density={getMobileSkillDensity(panel)}
            key={panel.id}
            panel={panel}
          />
        ))}
      </div>
    </section>
  );
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
