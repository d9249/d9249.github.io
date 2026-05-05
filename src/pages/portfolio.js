import * as React from "react";
import Layout from "../components/Layout";
import deck from "../data/portfolioSlides.json";

const MAX_PORTFOLIO_SLIDES = 36;

const clampSlideIndex = (index, length) => {
  if (length === 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
};

const PortfolioPage = () => {
  const slides = (deck.slides || []).slice(0, MAX_PORTFOLIO_SLIDES);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const stageRef = React.useRef(null);
  const activeThumbRef = React.useRef(null);
  const hideControlsTimerRef = React.useRef(null);
  const activeSlide = slides[activeIndex];

  const goToSlide = React.useCallback(
    (nextIndex) => {
      setActiveIndex(clampSlideIndex(nextIndex, slides.length));
    },
    [slides.length],
  );

  const goFirst = React.useCallback(() => {
    goToSlide(0);
  }, [goToSlide]);

  const goNext = React.useCallback(() => {
    setActiveIndex((current) => clampSlideIndex(current + 1, slides.length));
  }, [slides.length]);

  const goPrevious = React.useCallback(() => {
    setActiveIndex((current) => clampSlideIndex(current - 1, slides.length));
  }, [slides.length]);

  const toggleFullscreen = React.useCallback(async () => {
    if (typeof document === "undefined" || !stageRef.current) {
      return;
    }

    document.activeElement?.blur?.();

    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }

    await stageRef.current.requestFullscreen?.();
  }, []);

  const showFullscreenControls = React.useCallback(() => {
    if (!isFullscreen) {
      return;
    }

    window.clearTimeout(hideControlsTimerRef.current);
    setControlsVisible(true);
    hideControlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 1600);
  }, [isFullscreen]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    if (!isFullscreen) {
      window.clearTimeout(hideControlsTimerRef.current);
      setControlsVisible(true);
      return undefined;
    }

    showFullscreenControls();
    document.addEventListener("mousemove", showFullscreenControls);
    document.addEventListener("touchstart", showFullscreenControls);

    return () => {
      window.clearTimeout(hideControlsTimerRef.current);
      document.removeEventListener("mousemove", showFullscreenControls);
      document.removeEventListener("touchstart", showFullscreenControls);
    };
  }, [isFullscreen, showFullscreenControls]);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      showFullscreenControls();

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goPrevious();
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        goToSlide(slides.length - 1);
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    goNext,
    goPrevious,
    goToSlide,
    showFullscreenControls,
    slides.length,
    toggleFullscreen,
  ]);

  React.useEffect(() => {
    setActiveIndex((current) => clampSlideIndex(current, slides.length));
  }, [slides.length]);

  React.useEffect(() => {
    activeThumbRef.current?.scrollIntoView({
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  return (
    <Layout>
      <section className="portfolio-shell">
        <div className="shell portfolio-hero">
          <div>
            <p className="eyebrow">Portfolio Deck</p>
            <h2>이상민 포트폴리오</h2>
            <p className="portfolio-copy">
              AI 연구, 제품 개발 프로젝트들을 발표용 슬라이드로 정리했습니다.
            </p>
          </div>
        </div>

        <section className="presentation-shell" aria-label="Portfolio slides">
          <div
            className={`deck-stage ${isFullscreen && controlsVisible ? "is-controls-visible" : ""
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
                className="deck-button deck-button-strong"
                type="button"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? "나가기" : "전체화면"}
              </button>
            </div>
          </div>

          <div className="slide-strip" aria-label="Slide thumbnails">
            {slides.map((slide, index) => (
              <button
                className={`slide-thumb ${index === activeIndex ? "is-active" : ""
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
    </Layout>
  );
};

export default PortfolioPage;

export const Head = () => (
  <>
    <title>Portfolio Deck - 이상민</title>
    <meta
      name="description"
      content="이상민의 AI 연구와 제품 개발 경험을 발표용 슬라이드로 정리한 포트폴리오 페이지입니다."
    />
  </>
);
