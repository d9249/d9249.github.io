import * as React from "react";
import Layout from "../components/Layout";
import deck from "../../content/portfolio/deck.json";

const slideContext = require.context(
  "../../content/portfolio/slides",
  true,
  /slide\.json$/,
);
const assetContext = require.context(
  "../../content/portfolio/slides",
  true,
  /\.(gif|jpe?g|png|svg|webp)$/,
);

const unwrapModule = (module) => module.default || module;

const slides = slideContext
  .keys()
  .map((key) => unwrapModule(slideContext(key)))
  .sort((a, b) => a.index - b.index);

const resolveSlideAsset = (slide, assetPath) => {
  const normalized = assetPath.replace(/^\.\//, "");
  const key = `./${slide.slug}/${normalized}`;
  return unwrapModule(assetContext(key));
};

const clampSlideIndex = (index, length) => {
  if (length === 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
};

const renderTransform = (style) => {
  if (!style.rotation) {
    return undefined;
  }

  return `rotate(${style.rotation} ${style.x + style.width / 2} ${
    style.y + style.height / 2
  })`;
};

const CodeSlideObject = ({ object, slide }) => {
  const { style } = object;
  const transform = renderTransform(style);

  if (object.type === "image") {
    return (
      <image
        key={object.id}
        href={resolveSlideAsset(slide, object.src)}
        x={style.x}
        y={style.y}
        width={style.width}
        height={style.height}
        transform={transform}
        preserveAspectRatio="none"
      />
    );
  }

  if (object.type === "shape") {
    return (
      <rect
        key={object.id}
        x={style.x}
        y={style.y}
        width={style.width}
        height={style.height}
        rx={object.shape === "roundRect" ? 16 : 0}
        fill={style.fill}
        stroke={style.stroke}
        opacity={style.opacity}
        transform={transform}
      />
    );
  }

  if (object.type === "text") {
    return (
      <foreignObject
        key={object.id}
        x={style.x}
        y={style.y}
        width={style.width}
        height={style.height}
        transform={transform}
      >
        <div
          className="code-slide-text"
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            backgroundColor:
              style.backgroundColor === "transparent"
                ? undefined
                : style.backgroundColor,
            color: style.color,
            fontFamily: style.fontFamily,
            fontSize: `${style.fontSize}px`,
            fontStyle: style.fontStyle,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            textAlign: style.textAlign,
          }}
        >
          {object.text}
        </div>
      </foreignObject>
    );
  }

  return null;
};

const PortfolioPage = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const stageRef = React.useRef(null);
  const activeThumbRef = React.useRef(null);
  const activeSlide = slides[activeIndex];

  const goToSlide = React.useCallback(
    (nextIndex) => {
      setActiveIndex(clampSlideIndex(nextIndex, slides.length));
    },
    [slides.length],
  );

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

    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }

    await stageRef.current.requestFullscreen?.();
  }, []);

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
    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

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
  }, [goNext, goPrevious, goToSlide, slides.length, toggleFullscreen]);

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
            <h1>Keynote 원본을 웹 발표 화면으로 최신화합니다.</h1>
            <p className="portfolio-copy">
              원본 Keynote에서 export한 {deck.source.slideCount}장의 슬라이드를
              슬라이드별 content bundle로 관리합니다. 각 슬라이드는 텍스트,
              스타일, 이미지 asset을 가진 코드 데이터로 렌더링됩니다.
            </p>
          </div>
          <div className="portfolio-meta-card">
            <div className="meta">deck source</div>
            <strong>{deck.source.keynoteFile}</strong>
            <span>{deck.generatedAt.slice(0, 10)} export</span>
          </div>
        </div>

        <section className="presentation-shell" aria-label="Portfolio slides">
          <div className="deck-stage" ref={stageRef}>
            <div className="deck-frame">
              {activeSlide ? (
                <svg
                  className="code-slide-svg"
                  viewBox={`0 0 ${activeSlide.canvas.width} ${activeSlide.canvas.height}`}
                  role="img"
                  aria-label={`Portfolio slide ${activeSlide.index}: ${activeSlide.title}`}
                >
                  <rect
                    width={activeSlide.canvas.width}
                    height={activeSlide.canvas.height}
                    fill={activeSlide.canvas.background}
                  />
                  {activeSlide.objects.map((object) => (
                    <CodeSlideObject
                      key={object.id}
                      object={object}
                      slide={activeSlide}
                    />
                  ))}
                </svg>
              ) : (
                <div className="deck-placeholder">No portfolio slides</div>
              )}
            </div>

            <div className="deck-controls">
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
                className={`slide-thumb ${
                  index === activeIndex ? "is-active" : ""
                }`}
                key={slide.src}
                type="button"
                ref={index === activeIndex ? activeThumbRef : null}
                onClick={() => goToSlide(index)}
                aria-label={`${slide.index}번 슬라이드로 이동`}
              >
                <img
                  src={resolveSlideAsset(slide, slide.preview)}
                  alt=""
                  loading="lazy"
                />
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
      content="이상민의 Keynote 기반 포트폴리오 슬라이드를 웹에서 전체화면으로 발표할 수 있는 페이지입니다."
    />
  </>
);
