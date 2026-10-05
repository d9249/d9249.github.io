import * as React from "react";
import AwardSheet from "../components/AwardSheet";
import InlineEvidenceViewer from "../components/InlineEvidenceViewer";
import Layout from "../components/Layout";
import { PageHeader } from "../components/ui";
import { colorStyle, RESULT_COLOR } from "../utils/treeColors";
import { awardItems } from "../data/profile";
import { Sentences } from "../utils/sentences";

const getEvidenceKey = (item, link) => `${item.title}-${link.href}`;

const getEvidenceId = (item, link) =>
  `award-evidence-${getEvidenceKey(item, link).replace(/[^a-zA-Z0-9_-]+/g, "-")}`;

const isInlineEvidenceLink = (link) => link.href?.startsWith("/evidence/");

const getAwardDateValue = (period) => {
  const dateMatch = period.match(/^(\d{4})(?:\.(\d{1,2}))?/);

  if (!dateMatch) {
    return 0;
  }

  return Number(dateMatch[1]) * 100 + Number(dateMatch[2] || 0);
};

const sortAwardsByDate = (items) =>
  items
    .map((item, index) => ({ item, index }))
    .sort(
      (left, right) =>
        getAwardDateValue(right.item.period) -
          getAwardDateValue(left.item.period) || left.index - right.index,
    )
    .map(({ item }) => item);

const LedgerRow = ({ item, activeEvidence, onToggleEvidence }) => {
  const inlineLinks = item.links?.filter(isInlineEvidenceLink) || [];
  const externalLinks =
    item.links?.filter((link) => !isInlineEvidenceLink(link)) || [];

  return (
    <article className="ledger-row" style={colorStyle(RESULT_COLOR)}>
      <p className="ledger-date">
        <time>{item.period}</time>
        <span>{item.category === "research" ? "연구" : "제품"}</span>
      </p>
      <div className="ledger-main">
        <h2 className="ledger-title">{item.title}</h2>
        <p className="ledger-result">{item.result}</p>
        <p className="ledger-desc">
          <Sentences>{item.description}</Sentences>
        </p>
        {inlineLinks.length || externalLinks.length || item.href ? (
          <div
            className="project-inline-actions ledger-actions"
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

              return (
                <button
                  key={link.href}
                  type="button"
                  className="paper-viewer-toggle"
                  aria-controls={getEvidenceId(item, link)}
                  aria-expanded={isOpen}
                  onClick={() => onToggleEvidence(evidenceKey)}
                >
                  {isOpen ? `${link.label} 닫기` : link.label} →
                </button>
              );
            })}
            {item.href ? <a href={item.href}>증빙 보기 →</a> : null}
          </div>
        ) : null}
      </div>
      <span className="ledger-tick" aria-hidden="true" />
    </article>
  );
};

const ledgerItems = sortAwardsByDate(awardItems);

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
      <section className="shell recognition-page">
        <PageHeader
          size="hero"
          slate={{
            label: "Awards",
            colors: ledgerItems.map(() => "var(--c-mandarin)"),
            count: ledgerItems.length,
            unit: "awards",
          }}
          title="수상 기록"
          lead="정부, 산업계, 학회에서 받은 상입니다. 최근 것부터 적었고, 증빙은 각 줄에서 바로 열어 볼 수 있습니다."
          aside={<AwardSheet />}
        />
        <div className="ledger">
          {ledgerItems.map((item) => {
            const activeLink = item.links?.find(
              (link) => activeEvidence === getEvidenceKey(item, link),
            );

            return (
              <React.Fragment key={item.title}>
                <LedgerRow
                  item={item}
                  activeEvidence={activeEvidence}
                  onToggleEvidence={toggleEvidence}
                />
                {activeLink ? (
                  <InlineEvidenceViewer
                    itemTitle={item.title}
                    evidence={activeLink}
                    viewerId={getEvidenceId(item, activeLink)}
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
