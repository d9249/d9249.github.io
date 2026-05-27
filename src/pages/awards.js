import * as React from "react";
import InlineEvidenceViewer from "../components/InlineEvidenceViewer";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import { awardItems } from "../data/profile";

const getEvidenceKey = (item, link) => `${item.title}-${link.href}`;

const getEvidenceId = (item, link) =>
  `award-evidence-${getEvidenceKey(item, link).replace(/[^a-zA-Z0-9_-]+/g, "-")}`;

const isInlineEvidenceLink = (link) => link.href?.startsWith("/evidence/");

const AwardsPage = () => {
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
        <SectionHeading kicker="Awards" title="수상 기록" />
        <div className="recognition-grid">
          {awardItems.map((item) => {
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
                    {item.href ? <a href={item.href}>증빙 보기 →</a> : null}
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
