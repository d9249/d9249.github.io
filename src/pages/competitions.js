import * as React from "react";
import InlineEvidenceViewer from "../components/InlineEvidenceViewer";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import { competitionItems } from "../data/profile";

const getEvidenceKey = (item, link) => `${item.title}-${link.href}`;

const getEvidenceId = (item, link) =>
  `competition-evidence-${getEvidenceKey(item, link).replace(/[^a-zA-Z0-9_-]+/g, "-")}`;

const isInlineEvidenceLink = (link) => link.href?.startsWith("/evidence/");

const CompetitionsPage = () => {
  const [activeEvidence, setActiveEvidence] = React.useState(null);
  const [isEvidenceFullView, setIsEvidenceFullView] = React.useState(false);

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
        <SectionHeading kicker="Competitions" title="대회 및 외부 활동" />
        <div className="recognition-grid">
          {competitionItems.map((item) => {
            const inlineLinks = item.links?.filter(isInlineEvidenceLink) || [];
            const externalLinks =
              item.links?.filter((link) => !isInlineEvidenceLink(link)) || [];
            const activeLink = inlineLinks.find(
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
                {inlineLinks.length || externalLinks.length || item.href ? (
                  <div
                    className="research-links"
                    aria-label={`${item.title} 관련 링크`}
                  >
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
                    {externalLinks.map((link) => (
                      <a key={link.href} href={link.href}>
                        {link.label} →
                      </a>
                    ))}
                    {item.href ? <a href={item.href}>활동 보기 →</a> : null}
                  </div>
                ) : null}
                {activeLink ? (
                  <InlineEvidenceViewer
                    itemTitle={item.title}
                    evidence={activeLink}
                    viewerId={getEvidenceId(item, activeLink)}
                    isFullView={isEvidenceFullView}
                    onToggleFullView={toggleEvidenceFullView}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
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
