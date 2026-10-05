import * as React from "react";
import Layout from "../components/Layout";
import TreeCanvas from "../components/TreeCanvas";
import { PageHeader } from "../components/ui";
import showreel from "../data/showreel.json";
import { colorStyle, paperColor, rootColors } from "../utils/treeColors";
import { paperItems } from "../data/profile";

const PDF_ZOOM_MIN = 60;
const PDF_ZOOM_MAX = 180;
const PDF_ZOOM_STEP = 20;
const PDF_DEFAULT_ZOOM = 100;
const MOBILE_PAPER_VIEWER_QUERY = "(max-width: 760px)";
const PDF_WORKER_SRC = "/vendor/pdfjs/pdf.worker.min.mjs";

let pdfJsPromise;

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

const PaperRow = ({ item, activeViewerId, isPdfOpen, onTogglePdf }) => {
  const links = getPaperLinks(item);
  const paperKey = getPaperKey(item);

  return (
    <article className="paper-row" style={colorStyle(paperColor(item))}>
      <p className="paper-row-year">
        <time>{item.year}</time>
      </p>
      <div className="paper-row-main">
        <h3 className="paper-row-title">{item.title}</h3>
        <p className="paper-row-venue">{item.venue}</p>
        <p className="paper-row-authors">
          {item.authors?.length ? item.authors.join(", ") : null}
        </p>
        <ul className="paper-row-facts">
          {item.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        {item.pdfHref || links.length ? (
          <div
            className="project-inline-actions paper-row-actions"
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
      </div>
    </article>
  );
};

const paperGroups = [
  { key: "thesis", label: "학위 논문", type: "Master's Thesis" },
  { key: "scie", label: "SCIE 저널", type: "SCIE Journal" },
  { key: "kci", label: "KCI 저널", type: "KCI Journal" },
  { key: "intl", label: "국제 학회", type: "International Conference" },
  { key: "domestic", label: "국내 학회", type: "Domestic Conference" },
].map((group) => ({ ...group, items: getPapersByType(group.type) }));

const roots = showreel.research;

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

  const counts = [
    ["SCIE", paperItems.filter((item) => item.type === "SCIE Journal").length],
    ["KCI", paperItems.filter((item) => item.type === "KCI Journal").length],
    [
      "학회",
      paperItems.filter((item) => item.type.includes("Conference")).length,
    ],
  ];

  return (
    <Layout>
      <div className="shell">
        <PageHeader
          size="hero"
          slate={{
            label: "Research",
            colors: rootColors(),
            count: paperItems.length,
            unit: "papers",
          }}
          title="논문 및 연구 성과"
          lead="그래프 추천 시스템, 의료영상 딥러닝, 이상탐지와 응용 AI를 중심으로 진행한 학위논문, 저널, 학회 논문입니다. 홈의 나무에서 뿌리였던 여섯 갈래가 아래 R1–R6입니다."
          actions={
            <dl className="count-strip">
              {counts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          }
          aside={
            <TreeCanvas
              variant="roots"
              pins={roots.map((r) => ({
                href: `#${r.id}`,
                short: r.id,
                label: `${r.id} ${r.short}`,
                color: r.color,
              }))}
              label="연구 여섯 갈래가 뿌리로 뻗은 나무의 아랫부분"
            />
          }
        />
      </div>

      <section
        className="shell research-roots"
        aria-labelledby="research-roots-title"
      >
        <h2 id="research-roots-title" className="research-h">
          뿌리가 된 연구 <span>{roots.length}</span>
        </h2>
        <ol className="root-rows">
          {roots.map((r) => (
            <li key={r.id} id={r.id} style={colorStyle(r.color)}>
              <span className="root-rows-id">{r.id}</span>
              <div>
                <p className="root-rows-short">
                  {r.short}{" "}
                  <small>
                    {r.venue} · {r.year}
                  </small>
                </p>
                <p className="root-rows-title">{r.title}</p>
                {r.note ? <p className="root-rows-note">{r.note}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="shell research-papers"
        aria-labelledby="research-papers-title"
      >
        <h2 id="research-papers-title" className="research-h">
          전체 논문 <span>{paperItems.length}</span>
        </h2>
        {paperGroups.map((group) => {
          const activeItem = group.items.find(
            (item) => activePdf === getPaperKey(item),
          );
          const viewerId = `paper-viewer-${group.key}`;
          const Viewer = isMobilePaperViewer
            ? PaperCanvasPdfViewer
            : PaperIframePdfViewer;

          return (
            <section className="paper-group" key={group.key}>
              <h3 className="paper-group-h">
                {group.label} <span>{group.items.length}</span>
              </h3>
              <div className="paper-rows">
                {group.items.map((item) => {
                  const paperKey = getPaperKey(item);
                  return (
                    <PaperRow
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
                <Viewer
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
