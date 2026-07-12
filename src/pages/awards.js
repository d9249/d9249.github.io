import * as React from "react";
import InlineEvidenceViewer from "../components/InlineEvidenceViewer";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import { awardItems } from "../data/profile";

const RECOGNITION_VIEWER_QUERY = "(max-width: 680px)";

const getEvidenceKey = (item, link) => `${item.title}-${link.href}`;

const getEvidenceId = (item, link) =>
  `award-evidence-${getEvidenceKey(item, link).replace(/[^a-zA-Z0-9_-]+/g, "-")}`;

const isInlineEvidenceLink = (link) => link.href?.startsWith("/evidence/");

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

const awardRows = awardItems.reduce((rows, item, index) => {
  if (index % 2 === 0) {
    rows.push([item]);
  } else {
    rows[rows.length - 1].push(item);
  }

  return rows;
}, []);

const AwardsPage = () => {
  const [activeEvidence, setActiveEvidence] = React.useState(null);
  const [isEvidenceFullView, setIsEvidenceFullView] = React.useState(false);
  const isMobileEvidenceViewer = useMediaQuery(RECOGNITION_VIEWER_QUERY);

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
        <SectionHeading as="h1" kicker="Awards" title="수상 기록" />
        <div className="recognition-list">
          {awardRows.map((row) => {
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
                <div className="recognition-row-grid">
                  {row.map((item) => {
                    const inlineLinks =
                      item.links?.filter(isInlineEvidenceLink) || [];
                    const externalLinks =
                      item.links?.filter(
                        (link) => !isInlineEvidenceLink(link),
                      ) || [];
                    const cardActiveLink = inlineLinks.find(
                      (link) => activeEvidence === getEvidenceKey(item, link),
                    );

                    return (
                      <article className="recognition-card" key={item.title}>
                        <div className="meta">{item.period}</div>
                        <h3>{item.title}</h3>
                        <strong>{item.result}</strong>
                        <p>{item.description}</p>
                        <div className="research-facts">
                          {item.facts.map((fact) => (
                            <span key={fact}>{fact}</span>
                          ))}
                        </div>
                        {inlineLinks.length ||
                        externalLinks.length ||
                        item.href ? (
                          <div
                            className="research-links"
                            aria-label={`${item.title} 증빙 링크`}
                          >
                            {externalLinks.map((link) => (
                              <a key={link.href} href={link.href}>
                                {link.label} →
                              </a>
                            ))}
                            {inlineLinks.map((link) => {
                              const evidenceKey = getEvidenceKey(item, link);
                              const isOpen = activeEvidence === evidenceKey;
                              const viewerId = getEvidenceId(item, link);

                              return (
                                <button
                                  key={link.href}
                                  type="button"
                                  className="paper-viewer-toggle"
                                  aria-controls={viewerId}
                                  aria-expanded={isOpen}
                                  onClick={() => toggleEvidence(evidenceKey)}
                                >
                                  {isOpen ? `${link.label} 닫기` : link.label} →
                                </button>
                              );
                            })}
                            {item.href ? (
                              <a href={item.href}>증빙 보기 →</a>
                            ) : null}
                          </div>
                        ) : null}
                        {isMobileEvidenceViewer && cardActiveLink ? (
                          <InlineEvidenceViewer
                            itemTitle={item.title}
                            evidence={cardActiveLink}
                            viewerId={getEvidenceId(item, cardActiveLink)}
                            isFullView={isEvidenceFullView}
                            onToggleFullView={toggleEvidenceFullView}
                          />
                        ) : null}
                      </article>
                    );
                  })}
                </div>
                {!isMobileEvidenceViewer && activeItem && activeLink ? (
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
      </section>
    </Layout>
  );
};

export default AwardsPage;

export const Head = () => (
  <>
    <title>Awards</title>
    <meta
      name="description"
      content="이상민의 CES, 장관상, 학회 Best Paper, 논문경진대회 수상 기록입니다."
    />
  </>
);
