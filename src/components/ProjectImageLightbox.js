import * as React from "react";

const getImagePayload = (image) => ({
  alt: image.getAttribute("alt") || "",
  naturalHeight: image.naturalHeight || 0,
  naturalWidth: image.naturalWidth || 0,
  src: image.currentSrc || image.getAttribute("src") || "",
});

const getViewportSize = (container) => {
  const rect = container?.getBoundingClientRect();
  const visualViewport = window.visualViewport;

  return {
    height: Math.round(
      rect?.height || visualViewport?.height || window.innerHeight,
    ),
    width: Math.round(
      rect?.width || visualViewport?.width || window.innerWidth,
    ),
  };
};

const getLightboxFitMetrics = (viewportWidth, rotation) => {
  const isMobile = viewportWidth <= 680;
  const isQuarterTurn = rotation % 180 !== 0;
  const hasMobileRotation = isMobile && isQuarterTurn;

  return {
    captionSpace: isMobile ? 48 : 54,
    framePaddingTotal: isMobile ? 16 : 24,
    horizontalGutterTotal: isMobile ? 32 : 64,
    verticalGutterTotal: hasMobileRotation ? 88 : isMobile ? 32 : 64,
  };
};

const getFittedImageStyles = (activeImage, rotation, viewportSize) => {
  if (
    !activeImage?.naturalHeight ||
    !activeImage?.naturalWidth ||
    !viewportSize.height ||
    !viewportSize.width
  ) {
    return {
      image: {
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      },
      stage: undefined,
    };
  }

  const metrics = getLightboxFitMetrics(viewportSize.width, rotation);
  const availableWidth = Math.max(
    1,
    viewportSize.width -
      metrics.horizontalGutterTotal -
      metrics.framePaddingTotal,
  );
  const availableHeight = Math.max(
    1,
    viewportSize.height -
      metrics.verticalGutterTotal -
      metrics.captionSpace -
      metrics.framePaddingTotal,
  );
  const isQuarterTurn = rotation % 180 !== 0;
  const visibleNaturalWidth = isQuarterTurn
    ? activeImage.naturalHeight
    : activeImage.naturalWidth;
  const visibleNaturalHeight = isQuarterTurn
    ? activeImage.naturalWidth
    : activeImage.naturalHeight;
  const scale = Math.min(
    availableWidth / visibleNaturalWidth,
    availableHeight / visibleNaturalHeight,
    1,
  );
  const imageWidth = Math.round(activeImage.naturalWidth * scale);
  const imageHeight = Math.round(activeImage.naturalHeight * scale);
  const stageWidth = isQuarterTurn ? imageHeight : imageWidth;
  const stageHeight = isQuarterTurn ? imageWidth : imageHeight;

  return {
    image: {
      height: `${imageHeight}px`,
      maxHeight: isQuarterTurn ? "none" : undefined,
      maxWidth: isQuarterTurn ? "none" : undefined,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      width: `${imageWidth}px`,
    },
    stage: {
      height: `${stageHeight}px`,
      width: `${stageWidth}px`,
    },
  };
};

const ProjectImageLightbox = ({ html }) => {
  const articleRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);
  const captionId = React.useId();
  const lightboxRef = React.useRef(null);
  const [activeImage, setActiveImage] = React.useState(null);
  const [rotation, setRotation] = React.useState(0);
  const rotateButtonRef = React.useRef(null);
  const [viewportSize, setViewportSize] = React.useState({
    height: 0,
    width: 0,
  });

  React.useEffect(() => {
    const article = articleRef.current;

    if (!article) {
      return undefined;
    }

    const images = Array.from(article.querySelectorAll("img"));

    images.forEach((image) => {
      const alt = image.getAttribute("alt") || "프로젝트 이미지";

      image.classList.add("project-lightbox-trigger");
      image.setAttribute("role", "button");
      image.setAttribute("tabindex", "0");
      image.setAttribute("aria-label", `${alt} 확대 보기`);
    });

    return () => {
      images.forEach((image) => {
        image.classList.remove("project-lightbox-trigger");
        image.removeAttribute("role");
        image.removeAttribute("tabindex");
        image.removeAttribute("aria-label");
      });
    };
  }, [html]);

  React.useEffect(() => {
    if (!activeImage) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    };

    document.body.classList.add("project-lightbox-open");
    window.addEventListener("keydown", handleEscape);

    const focusId = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      document.body.classList.remove("project-lightbox-open");
      window.clearTimeout(focusId);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeImage]);

  React.useEffect(() => {
    if (!activeImage) {
      return undefined;
    }

    const updateViewportSize = () => {
      setViewportSize(getViewportSize(lightboxRef.current));
    };

    updateViewportSize();
    const frameId = window.requestAnimationFrame(updateViewportSize);
    window.visualViewport?.addEventListener("resize", updateViewportSize);
    window.addEventListener("orientationchange", updateViewportSize);
    window.addEventListener("resize", updateViewportSize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.visualViewport?.removeEventListener("resize", updateViewportSize);
      window.removeEventListener("orientationchange", updateViewportSize);
      window.removeEventListener("resize", updateViewportSize);
    };
  }, [activeImage]);

  const openImage = React.useCallback((image) => {
    const payload = getImagePayload(image);

    if (payload.src) {
      setRotation(0);
      setViewportSize(getViewportSize(lightboxRef.current));
      setActiveImage(payload);
    }
  }, []);

  const getEventImage = React.useCallback((event) => {
    if (!(event.target instanceof Element)) {
      return null;
    }

    const image = event.target.closest("img");

    return image && articleRef.current?.contains(image) ? image : null;
  }, []);

  const handleArticleClick = React.useCallback(
    (event) => {
      const image = getEventImage(event);

      if (!image) {
        return;
      }

      event.preventDefault();
      openImage(image);
    },
    [getEventImage, openImage],
  );

  const handleArticleKeyDown = React.useCallback(
    (event) => {
      const image = getEventImage(event);

      if (!image || (event.key !== "Enter" && event.key !== " ")) {
        return;
      }

      event.preventDefault();
      openImage(image);
    },
    [getEventImage, openImage],
  );

  const closeLightbox = React.useCallback(() => {
    setActiveImage(null);
  }, []);

  const keepLightboxOpen = React.useCallback((event) => {
    event.stopPropagation();
  }, []);

  const rotateImage = React.useCallback(() => {
    setRotation((currentRotation) => (currentRotation + 90) % 360);
  }, []);

  const trapLightboxFocus = React.useCallback((event) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusTargets = [
      closeButtonRef.current,
      rotateButtonRef.current,
    ].filter(Boolean);

    if (!focusTargets.length) {
      return;
    }

    event.preventDefault();
    const activeIndex = focusTargets.indexOf(document.activeElement);
    const currentIndex = activeIndex >= 0 ? activeIndex : 0;
    const nextIndex = event.shiftKey
      ? (currentIndex - 1 + focusTargets.length) % focusTargets.length
      : (currentIndex + 1) % focusTargets.length;

    focusTargets[nextIndex]?.focus();
  }, []);

  const fittedImageStyles = React.useMemo(
    () => getFittedImageStyles(activeImage, rotation, viewportSize),
    [activeImage, rotation, viewportSize],
  );

  return (
    <>
      <div
        ref={articleRef}
        className="article-body project-markdown-body"
        onClick={handleArticleClick}
        onKeyDown={handleArticleKeyDown}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {activeImage ? (
        <div
          ref={lightboxRef}
          className="project-lightbox"
          data-project-lightbox-rotated={
            rotation % 180 !== 0 ? "true" : undefined
          }
          role="dialog"
          aria-modal="true"
          aria-label={
            activeImage.alt
              ? `${activeImage.alt} 확대 보기`
              : "프로젝트 이미지 확대 보기"
          }
          aria-describedby={activeImage.alt ? captionId : undefined}
          onClick={closeLightbox}
          onKeyDown={trapLightboxFocus}
        >
          <button
            ref={closeButtonRef}
            className="project-lightbox-close"
            type="button"
            aria-label="이미지 팝업 닫기"
            onClick={closeLightbox}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <figure className="project-lightbox-frame" onClick={keepLightboxOpen}>
            <span
              className="project-lightbox-image-stage"
              style={fittedImageStyles.stage}
            >
              <img
                className="project-lightbox-image"
                src={activeImage.src}
                alt={activeImage.alt}
                style={fittedImageStyles.image}
              />
            </span>
            <figcaption className="project-lightbox-footer">
              <span
                className="project-lightbox-caption-text"
                id={activeImage.alt ? captionId : undefined}
              >
                {activeImage.alt}
              </span>
              <button
                ref={rotateButtonRef}
                className="project-lightbox-rotate"
                type="button"
                aria-label={`이미지 90도 회전, 현재 ${rotation}도`}
                onClick={rotateImage}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M4 12a8 8 0 0 1 13.66-5.66L20 8.68" />
                  <path d="M20 4v4.68h-4.68" />
                  <path d="M20 12a8 8 0 0 1-13.66 5.66L4 15.32" />
                  <path d="M4 20v-4.68h4.68" />
                </svg>
              </button>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
};

export default ProjectImageLightbox;
