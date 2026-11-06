import * as React from "react";
import ImageViewer from "../components/ImageViewer";
import usePortfolioDeck from "../components/portfolio/usePortfolioDeck";
import Layout from "../components/Layout";
import { PageHeader } from "../components/ui";
import deck from "../data/portfolioSlides.json";

const MAX_PORTFOLIO_SLIDES = 36;

const PortfolioPage = () => {
  const slides = React.useMemo(
    () => (deck.slides || []).slice(0, MAX_PORTFOLIO_SLIDES),
    [],
  );
  const galleryImages = React.useMemo(
    () => slides.map((slide) => ({ ...slide, key: slide.src })),
    [slides],
  );
  const {
    activeIndex,
    activeSlide,
    controlsVisible,
    isFallbackFullscreen,
    isLandscapeMode,
    isPresentationMode,
    stageRef,
    slideStripRef,
    activeThumbRef,
    goFirst,
    goNext,
    goPrevious,
    goToSlide,
    toggleFullscreen,
    toggleLandscapeMode,
    leavePresentationMode,
  } = usePortfolioDeck(slides);
  const [readerOpen, setReaderOpen] = React.useState(false);
  const readerOpenerRef = React.useRef(null);
  const openReader = async (event) => {
    readerOpenerRef.current = event?.currentTarget || document.activeElement;
    if (isPresentationMode) await leavePresentationMode();
    setReaderOpen(true);
  };

  return (
    <Layout>
      <section className="portfolio-shell">
        <div className="shell">
          <PageHeader
            slate={{
              label: "Portfolio",
              count: deck.slides.length,
              unit: "slides",
            }}
            title="이상민 포트폴리오"
            lead="AI 연구, 제품 개발 프로젝트들을 발표용 슬라이드로 정리했습니다."
          />
        </div>

        <section className="presentation-shell" aria-label="Portfolio slides">
          <div
            className={`deck-stage ${
              isPresentationMode && controlsVisible ? "is-controls-visible" : ""
            } ${isFallbackFullscreen ? "is-fallback-fullscreen" : ""} ${
              isLandscapeMode ? "is-landscape-mode" : ""
            }`}
            ref={stageRef}
          >
            <div className="deck-frame">
              {activeSlide ? (
                <img
                  className="deck-image"
                  src={activeSlide.src}
                  alt={activeSlide.alt}
                  width={activeSlide.width}
                  height={activeSlide.height}
                  draggable="false"
                  role="button"
                  tabIndex={0}
                  aria-label={`${activeSlide.alt} 확대해서 읽기`}
                  onClick={openReader}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openReader();
                    }
                  }}
                />
              ) : (
                <div className="deck-placeholder">No portfolio slides</div>
              )}
            </div>

            <div className="deck-controls">
              <button
                className="deck-button"
                type="button"
                onClick={goFirst}
                disabled={activeIndex === 0}
              >
                첫 화면
              </button>
              <button
                className="deck-button"
                type="button"
                onClick={goPrevious}
                disabled={activeIndex === 0}
              >
                이전
              </button>
              <div className="deck-counter" aria-live="polite">
                {String(activeIndex + 1).padStart(3, "0")} /{" "}
                {String(slides.length).padStart(3, "0")}
              </div>
              <button
                className="deck-button"
                type="button"
                onClick={goNext}
                disabled={activeIndex === slides.length - 1}
              >
                다음
              </button>
              <button
                className="deck-button"
                type="button"
                onClick={openReader}
              >
                확대해서 읽기
              </button>
              <button
                className="deck-button"
                type="button"
                onClick={toggleLandscapeMode}
                aria-pressed={isLandscapeMode}
              >
                {isLandscapeMode ? "세로보기" : "가로보기"}
              </button>
              <button
                className="deck-button deck-button-strong"
                type="button"
                onClick={toggleFullscreen}
              >
                {isPresentationMode ? "나가기" : "전체화면"}
              </button>
            </div>
          </div>

          <div
            className="slide-strip"
            ref={slideStripRef}
            aria-label="Slide thumbnails"
          >
            {slides.map((slide, index) => (
              <button
                className={`slide-thumb ${
                  index === activeIndex ? "is-active" : ""
                }`}
                key={slide.src}
                type="button"
                ref={index === activeIndex ? activeThumbRef : null}
                onClick={() => goToSlide(index)}
                aria-label={`${slide.index}번 슬라이드로 이동`}
              >
                <img src={slide.src} alt="" loading="lazy" />
                <span>{String(slide.index).padStart(3, "0")}</span>
              </button>
            ))}
          </div>
        </section>
      </section>
      {readerOpen ? (
        <ImageViewer
          images={galleryImages}
          index={activeIndex}
          returnFocus={readerOpenerRef.current}
          onClose={() => setReaderOpen(false)}
        />
      ) : null}
    </Layout>
  );
};

export default PortfolioPage;

export const Head = () => (
  <>
    <title>Portfolio Deck</title>
    <meta
      name="description"
      content="이상민의 AI 연구와 제품 개발 경험을 발표용 슬라이드로 정리한 포트폴리오 페이지입니다."
    />
  </>
);
