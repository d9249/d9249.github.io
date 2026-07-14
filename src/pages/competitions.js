import * as React from "react";
import { Link } from "gatsby";
import InlineEvidenceViewer from "../components/InlineEvidenceViewer";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import { competitionItems } from "../data/profile";

const COMPACT_COMPETITION_LAYOUT_QUERY = "(max-width: 980px)";

const getEvidenceKey = (item, link) => `${item.title}-${link.href}`;

const getEvidenceId = (item, link) =>
  `competition-evidence-${getEvidenceKey(item, link).replace(/[^a-zA-Z0-9_-]+/g, "-")}`;

const isInlineEvidenceLink = (link) => link.href?.startsWith("/evidence/");

const ActivityLink = ({ href, children }) =>
  href.startsWith("/") ? (
    <Link to={href}>{children}</Link>
  ) : (
    <a href={href}>{children}</a>
  );

const useMediaQuery = (query) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);

    updateMatches();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMatches);
    } else {
      mediaQuery.addListener(updateMatches);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateMatches);
      } else {
        mediaQuery.removeListener(updateMatches);
      }
    };
  }, [query]);

  return matches;
};

const competitionRows = competitionItems.reduce((rows, item, index) => {
  if (index % 2 === 0) {
    rows.push([item]);
  } else {
    rows[rows.length - 1].push(item);
  }

  return rows;
}, []);

const CompetitionCard = ({
  item,
  activeEvidence,
  isCompactLayout,
  isEvidenceFullView,
  onToggleEvidence,
  onToggleEvidenceFullView,
}) => {
  const inlineLinks = item.links?.filter(isInlineEvidenceLink) || [];
  const externalLinks =
    item.links?.filter((link) => !isInlineEvidenceLink(link)) || [];
  const activeLink = inlineLinks.find(
    (link) => activeEvidence === getEvidenceKey(item, link),
  );

  return (
    <article className="project-card competition-project-card">
      <div className="project-card-header">
        <div>
          <div className="meta">{item.period}</div>
          <h3 className="project-title">
            <span className="project-title-name">{item.title}</span>
            <span className="project-title-tagline">{item.result}</span>
          </h3>
        </div>
      </div>
      <p>{item.description}</p>
      <div className="project-metrics" aria-label={`${item.title} 주요 성과`}>
        {item.facts.map((fact) => (
          <span className="metric-chip" key={fact}>
            {fact}
          </span>
        ))}
      </div>
      {inlineLinks.length || externalLinks.length || item.href ? (
        <div
          className="project-card-actions competition-project-actions"
          aria-label={`${item.title} 관련 링크`}
        >
          {inlineLinks.map((link) => {
            const evidenceKey = getEvidenceKey(item, link);
            const isOpen = activeEvidence === evidenceKey;

            return (
              <button
                key={link.href}
                type="button"
                className="paper-viewer-toggle"
                aria-controls={getEvidenceId(item, link)}
                aria-expanded={isOpen}
                onClick={() => onToggleEvidence(evidenceKey)}
              >
                <span>{isOpen ? `${link.label} 닫기` : link.label} →</span>
              </button>
            );
          })}
          {externalLinks.map((link) => (
            <a key={link.href} href={link.href}>
              <span>{link.label} →</span>
            </a>
          ))}
          {item.href ? (
            <ActivityLink href={item.href}>
              <span>활동 보기 →</span>
            </ActivityLink>
          ) : null}
        </div>
      ) : null}
      {isCompactLayout && activeLink ? (
        <InlineEvidenceViewer
          itemTitle={item.title}
          evidence={activeLink}
          viewerId={getEvidenceId(item, activeLink)}
          isFullView={isEvidenceFullView}
          onToggleFullView={onToggleEvidenceFullView}
        />
      ) : null}
    </article>
  );
};

const CompetitionsPage = () => {
  const [activeEvidence, setActiveEvidence] = React.useState(null);
  const [isEvidenceFullView, setIsEvidenceFullView] = React.useState(false);
  const isCompactLayout = useMediaQuery(COMPACT_COMPETITION_LAYOUT_QUERY);

  React.useEffect(() => {
    document.body.classList.toggle(
      "paper-viewer-fullscreen-open",
      isEvidenceFullView,
    );

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsEvidenceFullView(false);
      }
    };

    if (isEvidenceFullView) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.classList.remove("paper-viewer-fullscreen-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEvidenceFullView]);

  const toggleEvidence = (evidenceKey) => {
    if (activeEvidence === evidenceKey) {
      setActiveEvidence(null);
      setIsEvidenceFullView(false);
      return;
    }

    setActiveEvidence(evidenceKey);
    setIsEvidenceFullView(false);
  };

  const toggleEvidenceFullView = () => {
    setIsEvidenceFullView((currentValue) => !currentValue);
  };

  return (
    <Layout>
      <section className="shell section recognition-page">
        <SectionHeading
          as="h1"
          kicker="Competitions"
          title="대회 및 외부 활동"
        />
        {isCompactLayout ? (
          <div className="project-grid">
            {competitionItems.map((item) => (
              <CompetitionCard
                key={item.title}
                item={item}
                activeEvidence={activeEvidence}
                isCompactLayout={isCompactLayout}
                isEvidenceFullView={isEvidenceFullView}
                onToggleEvidence={toggleEvidence}
                onToggleEvidenceFullView={toggleEvidenceFullView}
              />
            ))}
          </div>
        ) : (
          <div className="recognition-list">
            {competitionRows.map((row) => {
              const activeItem = row.find((item) =>
                item.links?.some(
                  (link) => activeEvidence === getEvidenceKey(item, link),
                ),
              );
              const activeLink = activeItem?.links?.find(
                (link) => activeEvidence === getEvidenceKey(activeItem, link),
              );

              return (
                <React.Fragment key={row.map((item) => item.title).join("|")}>
                  <div className="project-grid">
                    {row.map((item) => (
                      <CompetitionCard
                        key={item.title}
                        item={item}
                        activeEvidence={activeEvidence}
                        isCompactLayout={isCompactLayout}
                        isEvidenceFullView={isEvidenceFullView}
                        onToggleEvidence={toggleEvidence}
                        onToggleEvidenceFullView={toggleEvidenceFullView}
                      />
                    ))}
                  </div>
                  {activeItem && activeLink ? (
                    <InlineEvidenceViewer
                      itemTitle={activeItem.title}
                      evidence={activeLink}
                      viewerId={getEvidenceId(activeItem, activeLink)}
                      isFullView={isEvidenceFullView}
                      onToggleFullView={toggleEvidenceFullView}
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default CompetitionsPage;

export const Head = () => (
  <>
    <title>Competitions</title>
    <meta
      name="description"
      content="이상민의 HD현대 AI Challenge, LG Aimers, DACON, 가짜연구소, DIYA 등 대회와 외부 활동 기록입니다."
    />
  </>
);
