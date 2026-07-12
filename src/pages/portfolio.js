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

const fullscreenEvents = [
  "fullscreenchange",
  "webkitfullscreenchange",
  "mozfullscreenchange",
  "MSFullscreenChange",
];

const getFullscreenElement = () => {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
};

const requestNativeFullscreen = (element) => {
  if (element.requestFullscreen) {
    return element.requestFullscreen({ navigationUI: "hide" });
  }

  if (element.webkitRequestFullscreen) {
    return element.webkitRequestFullscreen();
  }

  if (element.mozRequestFullScreen) {
    return element.mozRequestFullScreen();
  }

  if (element.msRequestFullscreen) {
    return element.msRequestFullscreen();
  }

  return Promise.reject(new Error("Fullscreen API is unavailable"));
};

const exitNativeFullscreen = () => {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }

  if (document.webkitExitFullscreen) {
    return document.webkitExitFullscreen();
  }

  if (document.mozCancelFullScreen) {
    return document.mozCancelFullScreen();
  }

  if (document.msExitFullscreen) {
    return document.msExitFullscreen();
  }

  return Promise.resolve();
};

const lockLandscapeOrientation = async () => {
  const orientation = window.screen?.orientation;

  if (!orientation?.lock) {
    return;
  }

  try {
    await orientation.lock("landscape");
  } catch {
    // Some mobile browsers only allow orientation locking in native fullscreen.
  }
};

const unlockOrientation = () => {
  const orientation = window.screen?.orientation;

  if (!orientation?.unlock) {
    return;
  }

  try {
    orientation.unlock();
  } catch {
    // Unsupported browsers simply keep the CSS landscape fallback.
  }
};

const PortfolioPage = () => {
  const slides = (deck.slides || []).slice(0, MAX_PORTFOLIO_SLIDES);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isNativeFullscreen, setIsNativeFullscreen] = React.useState(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = React.useState(false);
  const [isLandscapeMode, setIsLandscapeMode] = React.useState(false);
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const stageRef = React.useRef(null);
  const slideStripRef = React.useRef(null);
  const activeThumbRef = React.useRef(null);
  const hideControlsTimerRef = React.useRef(null);
  const activeSlide = slides[activeIndex];
  const isPresentationMode = isNativeFullscreen || isFallbackFullscreen;

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

  const enterPresentationMode = React.useCallback(async (landscape = false) => {
    if (typeof document === "undefined" || !stageRef.current) {
      return;
    }

    document.activeElement?.blur?.();
    setControlsVisible(true);
    setIsLandscapeMode(landscape);

    try {
      await requestNativeFullscreen(stageRef.current);
      setIsFallbackFullscreen(false);
      setIsNativeFullscreen(true);

      if (landscape) {
        await lockLandscapeOrientation();
      }

      return;
    } catch {
      setIsFallbackFullscreen(true);
      setIsNativeFullscreen(false);
    }
  }, []);

  const leavePresentationMode = React.useCallback(async () => {
    unlockOrientation();
    setIsLandscapeMode(false);
    setIsFallbackFullscreen(false);

    if (getFullscreenElement()) {
      try {
        await exitNativeFullscreen();
      } catch {
        // Browser-level fullscreen exit can reject if the state changed first.
      }
    }

    setIsNativeFullscreen(false);
  }, []);

  const toggleFullscreen = React.useCallback(async () => {
    if (isPresentationMode) {
      await leavePresentationMode();
      return;
    }

    await enterPresentationMode(false);
  }, [enterPresentationMode, isPresentationMode, leavePresentationMode]);

  const toggleLandscapeMode = React.useCallback(async () => {
    if (isLandscapeMode) {
      unlockOrientation();
      setIsLandscapeMode(false);
      return;
    }

    if (!isPresentationMode) {
      await enterPresentationMode(true);
      return;
    }

    setIsLandscapeMode(true);
    await lockLandscapeOrientation();
  }, [enterPresentationMode, isLandscapeMode, isPresentationMode]);

  const showFullscreenControls = React.useCallback(() => {
    if (!isPresentationMode) {
      return;
    }

    window.clearTimeout(hideControlsTimerRef.current);
    setControlsVisible(true);
    hideControlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 1600);
  }, [isPresentationMode]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isStageFullscreen = getFullscreenElement() === stageRef.current;
      setIsNativeFullscreen(isStageFullscreen);

      if (!isStageFullscreen) {
        unlockOrientation();
        setIsLandscapeMode(false);
      }
    };

    fullscreenEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleFullscreenChange);
    });
    return () => {
      fullscreenEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handleFullscreenChange);
      });
    };
  }, []);

  React.useEffect(() => {
    if (!isPresentationMode) {
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
  }, [isPresentationMode, showFullscreenControls]);

  React.useEffect(() => {
    if (!isFallbackFullscreen) {
      return undefined;
    }

    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
    };
  }, [isFallbackFullscreen]);

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

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        toggleLandscapeMode();
      }

      if (event.key === "Escape" && isFallbackFullscreen) {
        event.preventDefault();
        leavePresentationMode();
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
    isFallbackFullscreen,
    leavePresentationMode,
    slides.length,
    toggleFullscreen,
    toggleLandscapeMode,
  ]);

  React.useEffect(() => {
    setActiveIndex((current) => clampSlideIndex(current, slides.length));
  }, [slides.length]);

  React.useEffect(() => {
    const strip = slideStripRef.current;
    const thumbnail = activeThumbRef.current;
    if (!strip || !thumbnail) return;

    const targetLeft =
      thumbnail.offsetLeft - (strip.clientWidth - thumbnail.offsetWidth) / 2;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    strip.scrollTo({
      behavior: reduceMotion ? "auto" : "smooth",
      left: Math.max(0, targetLeft),
    });
  }, [activeIndex]);

  return (
    <Layout>
      <section className="portfolio-shell">
        <div className="shell portfolio-hero">
          <div>
            <p className="eyebrow">Portfolio Deck</p>
            <h1>이상민 포트폴리오</h1>
            <p className="portfolio-copy">
              AI 연구, 제품 개발 프로젝트들을 발표용 슬라이드로 정리했습니다.
            </p>
          </div>
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
