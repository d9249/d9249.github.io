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

const SkillPanel = ({ compact, panel }) => {
  const [expanded, setExpanded] = React.useState(false);
  const Header = compact ? "summary" : "header";
  const content = (
    <>
      <Header className="skill-card-header">
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
      </Header>
      <ul className="skill-list">
        {panel.skills.map((skill) => (
          <li key={skill}>
            <SkillIcon name={skill} />
            <span className="skill-logo-name">{skill}</span>
          </li>
        ))}
      </ul>
    </>
  );

  if (!compact) {
    return (
      <article
        className="skill-card"
        aria-label={`${panel.title}: ${panel.summary}`}
      >
        {content}
      </article>
    );
  }

  return (
    <article
      className="skill-card"
      aria-label={`${panel.title}: ${panel.summary}`}
    >
      <details
        className="skill-card-disclosure"
        open={expanded}
        onToggle={(event) => setExpanded(event.currentTarget.open)}
      >
        {content}
      </details>
    </article>
  );
};

const useCompactSkillPanels = () => {
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const updateCompact = () => setCompact(mediaQuery.matches);

    updateCompact();
    mediaQuery.addEventListener?.("change", updateCompact);

    return () => mediaQuery.removeEventListener?.("change", updateCompact);
  }, []);

  return compact;
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
        // Dense rows encode the resolved column gap into each card span so the
        // physical vertical and horizontal spacing stay equal.
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
  const compact = useCompactSkillPanels();
  const panels = createSkillPanels(groups);

  return (
    <div className="skill-grid" ref={gridRef}>
      {panels.map((panel) => (
        <SkillPanel compact={compact} key={panel.id} panel={panel} />
      ))}
    </div>
  );
};

export default SkillGrid;
