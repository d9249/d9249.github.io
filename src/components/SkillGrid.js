import * as React from "react";
import SkillIcon from "./SkillIcon";

const MOBILE_SKILL_PREVIEW_LIMIT = 3;

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

const MobileSkillPanel = ({ expanded, onToggle, panel }) => {
  const detailsId = React.useId();
  const hasMoreSkills = panel.skills.length > MOBILE_SKILL_PREVIEW_LIMIT;
  const visibleSkills = expanded
    ? panel.skills
    : panel.skills.slice(0, MOBILE_SKILL_PREVIEW_LIMIT);

  return (
    <article
      className={`skill-card mobile-skill-card${expanded ? " is-expanded" : ""}`}
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
      <ul className="skill-list" id={detailsId}>
        {visibleSkills.map((skill) => (
          <li key={skill}>
            <SkillIcon name={skill} />
            <span className="skill-logo-name">{skill}</span>
          </li>
        ))}
      </ul>
      {hasMoreSkills ? (
        <button
          className="mobile-skill-toggle"
          type="button"
          aria-controls={detailsId}
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <span>
            {expanded ? "접기" : `전체 ${panel.skills.length}개 보기`}
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : null}
    </article>
  );
};

const MobileSkillBrowser = ({ panels }) => {
  const [expandedPanelId, setExpandedPanelId] = React.useState(null);

  if (!panels.length) {
    return null;
  }

  return (
    <section className="mobile-skill-browser" aria-label="모바일 기술 스택">
      <div className="skill-grid mobile-skill-grid">
        {panels.map((panel) => (
          <MobileSkillPanel
            expanded={expandedPanelId === panel.id}
            key={panel.id}
            onToggle={() =>
              setExpandedPanelId((currentId) =>
                currentId === panel.id ? null : panel.id,
              )
            }
            panel={panel}
          />
        ))}
      </div>
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
