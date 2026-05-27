import * as React from "react";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import { paperItems } from "../data/profile";

const PDF_ZOOM_MIN = 60;
const PDF_ZOOM_MAX = 180;
const PDF_ZOOM_STEP = 20;
const PDF_DEFAULT_ZOOM = 100;
const MOBILE_PAPER_VIEWER_QUERY = "(max-width: 680px)";

const researchStats = [
  {
    label: "SCIE",
    value: paperItems.filter((item) => item.type === "SCIE Journal").length,
    description:
      "추천 시스템과 의료영상 딥러닝을 중심으로 SCIE 저널 논문을 발표했습니다.",
  },
  {
    label: "KCI",
    value: paperItems.filter((item) => item.type === "KCI Journal").length,
    description: "국내 저널에서 추천 시스템과 의료영상 분할 연구를 다뤘습니다.",
  },
  {
    label: "Conference",
    value: paperItems.filter((item) => item.type.includes("Conference")).length,
    description:
      "국제/국내 학회에서 추천, 의료영상, 이상탐지, 교통 예측 연구를 발표했습니다.",
  },
];

const getPaperLinks = (item) => [
  ...(item.href
    ? [{ label: item.linkLabel || "논문 보기", href: item.href }]
    : []),
];

const getPaperKey = (item) => `${item.year}-${item.title}`;

const getPdfSrc = (item, zoom, fitMode) => {
  const params = ["toolbar=0", "navpanes=0", "scrollbar=1"];

  if (fitMode === "fit") {
    params.push("view=Fit");
  } else {
    params.push(`zoom=${zoom}`);
  }

  return `${item.pdfHref}#${params.join("&")}`;
};

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

const PaperPdfViewer = ({
  item,
  viewerId,
  pdfZoom,
  pdfFitMode,
  isPdfFullView,
  onChangeZoom,
  onFitToView,
  onToggleFullView,
}) => (
  <div
    className={`paper-viewer-panel${isPdfFullView ? " paper-viewer-panel-full" : ""}`}
  >
    <div className="paper-viewer" id={viewerId}>
      <div
        className="paper-viewer-toolbar"
        role="toolbar"
        aria-label={`${item.title} PDF 뷰어 조작`}
      >
        <div className="paper-viewer-title">{item.title}</div>
        <div className="paper-viewer-controls">
          <button
            type="button"
            className="paper-viewer-control"
            onClick={() => onChangeZoom(-1)}
            disabled={pdfZoom <= PDF_ZOOM_MIN}
            aria-label="PDF 축소"
            title="축소"
          >
            -
          </button>
          <span className="paper-viewer-zoom">
            {pdfFitMode === "fit" ? "맞춤" : `${pdfZoom}%`}
          </span>
          <button
            type="button"
            className="paper-viewer-control"
            onClick={() => onChangeZoom(1)}
            disabled={pdfZoom >= PDF_ZOOM_MAX}
            aria-label="PDF 확대"
            title="확대"
          >
            +
          </button>
          <button
            type="button"
            className={`paper-viewer-control paper-viewer-control-text${pdfFitMode === "fit" ? " is-active" : ""}`}
            onClick={onFitToView}
            aria-pressed={pdfFitMode === "fit"}
            aria-label="PDF 화면에 맞추기"
            title="화면에 맞추기"
          >
            맞춤
          </button>
          <button
            type="button"
            className="paper-viewer-control paper-viewer-control-text"
            onClick={onToggleFullView}
            aria-pressed={isPdfFullView}
            aria-label={isPdfFullView ? "PDF 전체 보기 닫기" : "PDF 전체 보기"}
            title={isPdfFullView ? "전체 보기 닫기" : "전체 보기"}
          >
            {isPdfFullView ? "복귀" : "전체"}
          </button>
        </div>
      </div>
      <div className="paper-viewer-stage">
        <iframe
          key={`${item.pdfHref}-${pdfZoom}-${pdfFitMode}`}
          title={`${item.title} PDF 미리보기`}
          src={getPdfSrc(item, pdfZoom, pdfFitMode)}
          loading="lazy"
          scrolling="yes"
        />
      </div>
    </div>
  </div>
);

const paperRows = paperItems.reduce((rows, item, index) => {
  if (index % 2 === 0) {
    rows.push([item]);
  } else {
    rows[rows.length - 1].push(item);
  }

  return rows;
}, []);

const ResearchPage = () => {
  const [activePdf, setActivePdf] = React.useState(null);
  const [pdfZoom, setPdfZoom] = React.useState(PDF_DEFAULT_ZOOM);
  const [pdfFitMode, setPdfFitMode] = React.useState("fit");
  const [isPdfFullView, setIsPdfFullView] = React.useState(false);
  const isMobilePaperViewer = useMediaQuery(MOBILE_PAPER_VIEWER_QUERY);

  React.useEffect(() => {
    document.body.classList.toggle(
      "paper-viewer-fullscreen-open",
      isPdfFullView,
    );

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsPdfFullView(false);
      }
    };

    if (isPdfFullView) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.classList.remove("paper-viewer-fullscreen-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPdfFullView]);

  const togglePdf = (paperKey) => {
    if (activePdf === paperKey) {
      setActivePdf(null);
      setIsPdfFullView(false);
      return;
    }

    setActivePdf(paperKey);
    setPdfZoom(PDF_DEFAULT_ZOOM);
    setPdfFitMode("fit");
    setIsPdfFullView(false);
  };

  const changePdfZoom = (direction) => {
    setPdfFitMode("custom");
    setPdfZoom((currentZoom) =>
      Math.min(
        PDF_ZOOM_MAX,
        Math.max(PDF_ZOOM_MIN, currentZoom + direction * PDF_ZOOM_STEP),
      ),
    );
  };

  const fitPdfToView = () => {
    setPdfZoom(PDF_DEFAULT_ZOOM);
    setPdfFitMode("fit");
  };

  const togglePdfFullView = () => {
    setIsPdfFullView((currentValue) => !currentValue);
  };

  return (
    <Layout>
      <section className="shell project-detail-hero">
        <div className="project-detail-hero-grid">
          <div>
            <p className="eyebrow">Research</p>
            <h1>논문 및 연구 성과</h1>
            <p className="project-detail-copy">
              그래프 추천 시스템, 의료영상 딥러닝, 이상탐지와 응용 AI를 중심으로
              진행한 학위논문, 저널, 학회 논문 목록입니다.
            </p>
          </div>
          <aside className="project-detail-facts" aria-label="Research facts">
            <div>
              <span>total papers</span>
              <strong>{paperItems.length}</strong>
            </div>
            <div>
              <span>journal papers</span>
              <strong>
                {
                  paperItems.filter((item) => item.type.includes("Journal"))
                    .length
                }
              </strong>
            </div>
            <div>
              <span>primary areas</span>
              <strong>Recommendation / Medical Imaging / GNN</strong>
            </div>
          </aside>
        </div>
      </section>

      <section className="shell section">
        <SectionHeading kicker="Overview" title="연구 요약" />
        <div className="evidence-grid">
          {researchStats.map((item) => (
            <article className="evidence-card" key={item.label}>
              <div className="meta">{item.label}</div>
              <div className="value">{item.value}</div>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell section">
        <SectionHeading kicker="Publications" title="전체 논문 리스트" />
        <div className="paper-grid">
          {paperRows.map((row, rowIndex) => {
            const activeItem = row.find(
              (item) => activePdf === getPaperKey(item),
            );
            const viewerId = `paper-viewer-row-${rowIndex}`;

            return (
              <React.Fragment key={row.map((item) => item.title).join("|")}>
                <div className="paper-row-grid">
                  {row.map((item, itemIndex) => {
                    const links = getPaperLinks(item);
                    const paperKey = getPaperKey(item);
                    const isPdfOpen = activePdf === paperKey;
                    const mobileViewerId = `paper-viewer-card-${rowIndex}-${itemIndex}`;
                    const activeViewerId = isMobilePaperViewer
                      ? mobileViewerId
                      : viewerId;

                    return (
                      <article className="paper-card" key={item.title}>
                        <div className="paper-card-top">
                          <div className="meta">{item.type}</div>
                          <span>{item.year}</span>
                        </div>
                        <h3>{item.title}</h3>
                        <div className="paper-venue">{item.venue}</div>
                        <p>{item.description}</p>
                        {item.authors?.length ? (
                          <div
                            className="paper-authors"
                            aria-label={`${item.title} 저자`}
                          >
                            {item.authors.map((author) => (
                              <span className="paper-author-chip" key={author}>
                                {author}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="research-facts">
                          {item.facts.map((fact) => (
                            <span key={fact}>{fact}</span>
                          ))}
                        </div>
                        {item.pdfHref || links.length ? (
                          <div
                            className="research-links"
                            aria-label={`${item.title} 논문 링크`}
                          >
                            {item.pdfHref ? (
                              <button
                                type="button"
                                className="paper-viewer-toggle"
                                aria-controls={activeViewerId}
                                aria-expanded={isPdfOpen}
                                onClick={() => togglePdf(paperKey)}
                              >
                                {isPdfOpen ? "PDF 닫기" : "PDF 미리보기"} →
                              </button>
                            ) : null}
                            {links.map((link) => (
                              <a key={link.href} href={link.href}>
                                {link.label} →
                              </a>
                            ))}
                          </div>
                        ) : null}
                        {isMobilePaperViewer && isPdfOpen && item.pdfHref ? (
                          <PaperPdfViewer
                            item={item}
                            viewerId={mobileViewerId}
                            pdfZoom={pdfZoom}
                            pdfFitMode={pdfFitMode}
                            isPdfFullView={isPdfFullView}
                            onChangeZoom={changePdfZoom}
                            onFitToView={fitPdfToView}
                            onToggleFullView={togglePdfFullView}
                          />
                        ) : null}
                      </article>
                    );
                  })}
                </div>
                {!isMobilePaperViewer && activeItem?.pdfHref ? (
                  <PaperPdfViewer
                    item={activeItem}
                    viewerId={viewerId}
                    pdfZoom={pdfZoom}
                    pdfFitMode={pdfFitMode}
                    isPdfFullView={isPdfFullView}
                    onChangeZoom={changePdfZoom}
                    onFitToView={fitPdfToView}
                    onToggleFullView={togglePdfFullView}
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

export default ResearchPage;

export const Head = () => (
  <>
    <title>Research</title>
    <meta
      name="description"
      content="이상민의 학위논문, SCIE, KCI, 국제/국내 학회 논문과 연구 성과 목록입니다."
    />
  </>
);
