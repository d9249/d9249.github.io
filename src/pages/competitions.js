import * as React from "react";
import { Link } from "gatsby";
import InlineEvidenceViewer from "../components/InlineEvidenceViewer";
import Layout from "../components/Layout";
import { PageHeader } from "../components/ui";
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

const CheckRow = ({ item, activeEvidence, onToggleEvidence }) => {
  const inlineLinks = item.links?.filter(isInlineEvidenceLink) || [];

  return (
    <article className="check-row">
      <span className="check-box" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 12.5l4.2 4.2L19 7" />
        </svg>
      </span>
      <div className="check-what">
        <p className="check-period">{item.period}</p>
        <h2 className="check-title">{item.title}</h2>
        <p className="check-role">{item.result}</p>
      </div>
      {item.score ? (
        <p className="check-val">
          <b>{item.score.value}</b>
          <small>{item.score.label}</small>
        </p>
      ) : (
        <span />
      )}
      <div className="check-note">
        <p>{item.description}</p>
        <div
          className="project-inline-actions competition-project-actions"
          aria-label={`${item.title} 증빙과 활동 링크`}
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
                onClick={(event) =>
                  onToggleEvidence(evidenceKey, event.currentTarget)
                }
              >
                {isOpen ? `${link.label} 닫기` : link.label} →
              </button>
            );
          })}
          {item.href ? (
            <ActivityLink href={item.href}>활동 보기 →</ActivityLink>
          ) : null}
        </div>
      </div>
    </article>
  );
};

const CompetitionsPage = () => {
  const [activeEvidence, setActiveEvidence] = React.useState(null);
  const [isEvidenceFullView, setIsEvidenceFullView] = React.useState(false);
  const isCompactLayout = useMediaQuery(COMPACT_COMPETITION_LAYOUT_QUERY);
  const evidenceTriggerRef = React.useRef(null);
  const activeItem = competitionItems.find((item) =>
    item.links?.some((link) => activeEvidence === getEvidenceKey(item, link)),
  );
  const activeLink = activeItem?.links?.find(
    (link) => activeEvidence === getEvidenceKey(activeItem, link),
  );

  const closeEvidence = React.useCallback(() => {
    setActiveEvidence(null);
    setIsEvidenceFullView(false);
    window.requestAnimationFrame(() => evidenceTriggerRef.current?.focus());
  }, []);

  React.useEffect(() => {
    const isModalOpen = isCompactLayout && Boolean(activeLink);

    document.body.classList.toggle(
      "paper-viewer-fullscreen-open",
      isEvidenceFullView || isModalOpen,
    );

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (isModalOpen) {
          closeEvidence();
        } else {
          setIsEvidenceFullView(false);
        }
      }
    };

    if (isEvidenceFullView || isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.classList.remove("paper-viewer-fullscreen-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeLink, closeEvidence, isCompactLayout, isEvidenceFullView]);

  const toggleEvidence = (evidenceKey, trigger) => {
    if (activeEvidence === evidenceKey) {
      closeEvidence();
      return;
    }

    evidenceTriggerRef.current = trigger;
    setActiveEvidence(evidenceKey);
    setIsEvidenceFullView(false);
  };

  const toggleEvidenceFullView = () => {
    setIsEvidenceFullView((currentValue) => !currentValue);
  };

  const ranked = competitionItems.filter((item) => item.score);

  return (
    <Layout>
      <section className="shell recognition-page">
        <PageHeader
          slate={{
            label: "Competitions",
            count: competitionItems.length,
            unit: "activities",
          }}
          title="대회 및 외부 활동"
          lead="데이터 경진대회와 연구 모임, 교육 과정입니다. 순위나 점수가 있는 것은 숫자로 먼저 보이게 했습니다."
          aside={
            <ol className="check-sheet" aria-label="숫자로 남은 결과">
              {ranked.map((item, i) => (
                <li key={item.title} style={{ "--d": i }}>
                  <span className="check-box" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 12.5l4.2 4.2L19 7" />
                    </svg>
                  </span>
                  <span className="check-sheet-what">
                    <b>{item.title}</b>
                    <small>{item.score.label}</small>
                  </span>
                  <span className="check-sheet-val">{item.score.value}</span>
                </li>
              ))}
            </ol>
          }
        />
        <div className="check-rows">
          {competitionItems.map((item) => {
            const rowLink = item.links?.find(
              (link) => activeEvidence === getEvidenceKey(item, link),
            );

            return (
              <React.Fragment key={item.title}>
                <CheckRow
                  item={item}
                  activeEvidence={activeEvidence}
                  onToggleEvidence={toggleEvidence}
                />
                {!isCompactLayout && rowLink ? (
                  <InlineEvidenceViewer
                    itemTitle={item.title}
                    evidence={rowLink}
                    viewerId={getEvidenceId(item, rowLink)}
                    isFullView={isEvidenceFullView}
                    onToggleFullView={toggleEvidenceFullView}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
        {isCompactLayout && activeItem && activeLink ? (
          <InlineEvidenceViewer
            itemTitle={activeItem.title}
            evidence={activeLink}
            viewerId={getEvidenceId(activeItem, activeLink)}
            isFullView
            isModal
            onClose={closeEvidence}
          />
        ) : null}
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
