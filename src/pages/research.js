import * as React from "react";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import { paperItems } from "../data/profile";

const PDF_ZOOM_MIN = 60;
const PDF_ZOOM_MAX = 180;
const PDF_ZOOM_STEP = 20;
const PDF_DEFAULT_ZOOM = 100;
const MOBILE_PAPER_VIEWER_QUERY = "(max-width: 760px)";
const PDF_WORKER_SRC = "/vendor/pdfjs/pdf.worker.min.mjs";

let pdfJsPromise;

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

const sortPapersByDate = (items) =>
  items
    .map((item, index) => ({ item, index }))
    .sort(
      (left, right) =>
        Number(right.item.year) - Number(left.item.year) ||
        left.index - right.index,
    )
    .map(({ item }) => item);

const getPapersByType = (type) =>
  sortPapersByDate(paperItems.filter((item) => item.type === type));

const mobilePaperFamilies = [
  {
    key: "thesis",
    label: "학위 논문",
    groups: [
      {
        key: "masters-thesis",
        label: null,
        items: getPapersByType("Master's Thesis"),
      },
    ],
  },
  {
    key: "journals",
    label: "저널",
    groups: [
      {
        key: "international-journals",
        label: "해외 저널",
        items: getPapersByType("SCIE Journal"),
      },
      {
        key: "domestic-journals",
        label: "국내 저널",
        items: getPapersByType("KCI Journal"),
      },
    ],
  },
  {
    key: "conferences",
    label: "컨퍼런스",
    groups: [
      {
        key: "international-conferences",
        label: "해외 컨퍼런스",
        items: getPapersByType("International Conference"),
      },
      {
        key: "domestic-conferences",
        label: "국내 컨퍼런스",
        items: getPapersByType("Domestic Conference"),
      },
    ],
  },
];

const getPdfSrc = (item, zoom, fitMode) => {
  const params = ["toolbar=0", "navpanes=0", "scrollbar=1"];

  if (fitMode === "fit") {
    params.push("view=Fit");
  } else {
    params.push(`zoom=${zoom}`);
  }

  return `${item.pdfHref}#${params.join("&")}`;
};

const loadPdfJs = () => {
  if (!pdfJsPromise) {
    pdfJsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then(
      (pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
        return pdfjsLib;
      },
    );
  }

  return pdfJsPromise;
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

const PdfCanvasPage = ({ containerWidth, pageNumber, pdfDocument, zoom }) => {
  const canvasRef = React.useRef(null);
  const [pageStatus, setPageStatus] = React.useState("loading");

  React.useEffect(() => {
    if (!containerWidth || !pdfDocument) {
      return undefined;
    }

    let isCancelled = false;
    let renderTask;
    const canvas = canvasRef.current;

    const renderPage = async () => {
      setPageStatus("loading");

      try {
        const page = await pdfDocument.getPage(pageNumber);

        if (isCancelled || !canvas) {
          return;
        }

        const context = canvas.getContext("2d");
        const baseViewport = page.getViewport({ scale: 1 });
        const displayWidth = Math.max(1, containerWidth - 28);
        const displayScale =
          (displayWidth / baseViewport.width) * (zoom / PDF_DEFAULT_ZOOM);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({
          scale: displayScale * pixelRatio,
        });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
        canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;

        renderTask = page.render({
          canvasContext: context,
          viewport,
        });

        await renderTask.promise;

        if (!isCancelled) {
          setPageStatus("ready");
        }
      } catch (error) {
        if (!isCancelled && error?.name !== "RenderingCancelledException") {
          setPageStatus("error");
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      renderTask?.cancel();
    };
  }, [containerWidth, pageNumber, pdfDocument, zoom]);

  return (
    <div className="paper-viewer-page">
      <canvas ref={canvasRef} aria-label={`PDF ${pageNumber}페이지`} />
      {pageStatus === "loading" ? (
        <div className="paper-viewer-page-status">
          {pageNumber}페이지 렌더링 중
        </div>
      ) : null}
      {pageStatus === "error" ? (
        <div className="paper-viewer-page-status">페이지 로드 실패</div>
      ) : null}
    </div>
  );
};

const PaperViewerToolbar = ({
  item,
  pdfZoom,
  pdfFitMode,
  isPdfFullView,
  onChangeZoom,
  onFitToView,
  onToggleFullView,
}) => (
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
      <span
        className="paper-viewer-zoom"
        aria-label={`현재 확대: ${pdfFitMode === "fit" ? "화면 맞춤" : `${pdfZoom}%`}`}
      >
        {pdfFitMode === "fit" ? "자동" : `${pdfZoom}%`}
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
);

const PaperIframePdfViewer = ({
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
      <PaperViewerToolbar
        item={item}
        pdfZoom={pdfZoom}
        pdfFitMode={pdfFitMode}
        isPdfFullView={isPdfFullView}
        onChangeZoom={onChangeZoom}
        onFitToView={onFitToView}
        onToggleFullView={onToggleFullView}
      />
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

const PaperCanvasPdfViewer = ({
  item,
  viewerId,
  pdfZoom,
  pdfFitMode,
  isPdfFullView,
  onChangeZoom,
  onFitToView,
  onToggleFullView,
}) => {
  const stageRef = React.useRef(null);
  const [stageWidth, setStageWidth] = React.useState(0);
  const [pdfDocument, setPdfDocument] = React.useState(null);
  const [pdfStatus, setPdfStatus] = React.useState("loading");

  React.useEffect(() => {
    const stageElement = stageRef.current;

    if (!stageElement) {
      return undefined;
    }

    const updateStageWidth = () => {
      setStageWidth(stageElement.clientWidth);
    };

    updateStageWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateStageWidth);

      return () => {
        window.removeEventListener("resize", updateStageWidth);
      };
    }

    const resizeObserver = new ResizeObserver(updateStageWidth);
    resizeObserver.observe(stageElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isPdfFullView]);

  React.useEffect(() => {
    let isCancelled = false;
    let loadingTask;

    setPdfStatus("loading");
    setPdfDocument(null);

    loadPdfJs()
      .then((pdfjsLib) => {
        if (isCancelled) {
          return null;
        }

        loadingTask = pdfjsLib.getDocument(item.pdfHref);
        return loadingTask.promise;
      })
      .then((loadedDocument) => {
        if (!loadedDocument || isCancelled) {
          loadedDocument?.destroy();
          return;
        }

        setPdfDocument(loadedDocument);
        setPdfStatus("ready");
      })
      .catch(() => {
        if (!isCancelled) {
          setPdfStatus("error");
        }
      });

    return () => {
      isCancelled = true;
      loadingTask?.destroy();
    };
  }, [item.pdfHref]);

  const pageNumbers = pdfDocument
    ? Array.from({ length: pdfDocument.numPages }, (_, index) => index + 1)
    : [];

  return (
    <div
      className={`paper-viewer-panel${isPdfFullView ? " paper-viewer-panel-full" : ""}`}
    >
      <div className="paper-viewer" id={viewerId}>
        <PaperViewerToolbar
          item={item}
          pdfZoom={pdfZoom}
          pdfFitMode={pdfFitMode}
          isPdfFullView={isPdfFullView}
          onChangeZoom={onChangeZoom}
          onFitToView={onFitToView}
          onToggleFullView={onToggleFullView}
        />
        <div className="paper-viewer-stage" ref={stageRef}>
          {pdfStatus === "loading" ? (
            <div className="paper-viewer-message">PDF 렌더링 중</div>
          ) : null}
          {pdfStatus === "error" ? (
            <div className="paper-viewer-message">
              PDF 미리보기를 불러오지 못했습니다.
            </div>
          ) : null}
          {pdfStatus === "ready" && stageWidth ? (
            <div className="paper-viewer-pages">
              {pageNumbers.map((pageNumber) => (
                <PdfCanvasPage
                  key={`${item.pdfHref}-${pageNumber}`}
                  containerWidth={stageWidth}
                  pageNumber={pageNumber}
                  pdfDocument={pdfDocument}
                  zoom={pdfZoom}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const PaperCard = ({ item, activeViewerId, isPdfOpen, onTogglePdf }) => {
  const links = getPaperLinks(item);
  const paperKey = getPaperKey(item);

  return (
    <article className="project-card paper-card research-project-card">
      <div className="project-card-header">
        <div className="paper-card-top">
          <div className="meta">{item.type}</div>
          <span>{item.year}</span>
        </div>
        <h3 className="project-title">
          <span className="project-title-name">{item.title}</span>
          <span className="project-title-tagline">{item.venue}</span>
        </h3>
      </div>
      <p>{item.description}</p>
      <div
        className="paper-authors research-project-authors"
        aria-label={item.authors?.length ? `${item.title} 저자` : undefined}
        aria-hidden={item.authors?.length ? undefined : true}
      >
        {item.authors?.length
          ? item.authors.map((author) => (
              <span className="paper-author-chip" key={author}>
                {author}
              </span>
            ))
          : null}
      </div>
      <div className="project-metrics">
        {item.facts.map((fact) => (
          <span className="metric-chip" key={fact}>
            {fact}
          </span>
        ))}
      </div>
      {item.pdfHref || links.length ? (
        <div
          className="project-card-actions project-inline-actions"
          aria-label={`${item.title} 논문 링크`}
        >
          {item.pdfHref ? (
            <button
              type="button"
              className="paper-viewer-toggle"
              aria-controls={activeViewerId}
              aria-expanded={isPdfOpen}
              onClick={() => onTogglePdf(paperKey)}
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
    </article>
  );
};

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

      <section
        className="shell section research-overview-section"
        aria-labelledby="research-overview-title"
      >
        <h2 className="visually-hidden" id="research-overview-title">
          연구 요약
        </h2>
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

      <section className="shell section research-publications-section">
        <SectionHeading kicker="Publications" title="전체 논문 리스트" />
        {isMobilePaperViewer ? (
          <div className="paper-grid paper-category-list">
            {mobilePaperFamilies.map((family) => (
              <section className="paper-category-family" key={family.key}>
                <div className="paper-category-family-heading">
                  <div className="meta">Publication type</div>
                  <h2>{family.label}</h2>
                </div>
                <div className="paper-category-groups">
                  {family.groups.map((group) => {
                    const activeItem = group.items.find(
                      (item) => activePdf === getPaperKey(item),
                    );
                    const viewerId = `paper-viewer-group-${group.key}`;

                    return (
                      <section className="paper-category-group" key={group.key}>
                        {group.label ? <h3>{group.label}</h3> : null}
                        <div className="paper-row-grid paper-category-rail">
                          {group.items.map((item) => {
                            const paperKey = getPaperKey(item);

                            return (
                              <PaperCard
                                key={paperKey}
                                item={item}
                                activeViewerId={viewerId}
                                isPdfOpen={activePdf === paperKey}
                                onTogglePdf={togglePdf}
                              />
                            );
                          })}
                        </div>
                        {activeItem?.pdfHref ? (
                          <PaperCanvasPdfViewer
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
                      </section>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="paper-grid">
            {paperRows.map((row, rowIndex) => {
              const activeItem = row.find(
                (item) => activePdf === getPaperKey(item),
              );
              const viewerId = `paper-viewer-row-${rowIndex}`;

              return (
                <React.Fragment key={row.map((item) => item.title).join("|")}>
                  <div className="paper-row-grid">
                    {row.map((item) => {
                      const paperKey = getPaperKey(item);

                      return (
                        <PaperCard
                          key={paperKey}
                          item={item}
                          activeViewerId={viewerId}
                          isPdfOpen={activePdf === paperKey}
                          onTogglePdf={togglePdf}
                        />
                      );
                    })}
                  </div>
                  {activeItem?.pdfHref ? (
                    <PaperIframePdfViewer
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
        )}
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
