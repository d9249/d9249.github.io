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

const SkillPanel = ({ id, labelledBy, panel }) => (
  <article
    className="skill-card"
    id={id}
    aria-label={labelledBy ? undefined : `${panel.title}: ${panel.summary}`}
    aria-labelledby={labelledBy}
    role={labelledBy ? "tabpanel" : undefined}
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

const getPanelDomId = (index) => `mobile-skill-panel-${index}`;
const getTabDomId = (index) => `mobile-skill-tab-${index}`;

const MobileSkillBrowser = ({ panels }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activePanel = panels[activeIndex] || panels[0];

  if (!activePanel) {
    return null;
  }

  return (
    <section className="mobile-skill-browser" aria-label="기술 스택 탐색">
      <div className="mobile-skill-tabs" role="tablist" aria-label="기술 분야">
        {panels.map((panel, index) => (
          <button
            className={index === activeIndex ? "is-active" : undefined}
            id={getTabDomId(index)}
            key={panel.id}
            type="button"
            role="tab"
            aria-controls={getPanelDomId(index)}
            aria-selected={index === activeIndex}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
          >
            {panel.title}
          </button>
        ))}
      </div>
      <SkillPanel
        id={getPanelDomId(activeIndex)}
        labelledBy={getTabDomId(activeIndex)}
        panel={activePanel}
      />
    </section>
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
