import * as React from "react";

// allow: SIZE_OK - Modal fit geometry, focus management, and rotation behavior are kept together because this path has prior viewport QA coverage.

const getImagePayload = (image) => ({
  alt: image.getAttribute("alt") || "",
  naturalHeight: image.naturalHeight || 0,
  naturalWidth: image.naturalWidth || 0,
  src: image.currentSrc || image.getAttribute("src") || "",
});

const MOBILE_ROTATED_FRAME_GUTTER = 88;
const DESKTOP_MIN_WIDTH = 761;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.5;

const getViewportSize = (container) => {
  const rect = container?.getBoundingClientRect();
  const visualViewport = window.visualViewport;
  const layoutHeight =
    window.innerHeight || rect?.height || visualViewport?.height || 0;
  const layoutWidth =
    window.innerWidth || rect?.width || visualViewport?.width || 0;
  const height = visualViewport?.height || layoutHeight;

  return {
    height: Math.round(height),
    layoutHeight: Math.round(layoutHeight),
    layoutWidth: Math.round(layoutWidth),
    screenWidth: Math.round(window.screen?.width || layoutWidth),
    offsetTop: Math.round(visualViewport?.offsetTop || 0),
    width: Math.round(layoutWidth),
  };
};

const getMobileAwareViewportWidth = (viewportSize) => {
  const widths = [
    viewportSize.width,
    viewportSize.layoutWidth,
    viewportSize.screenWidth,
  ].filter((width) => width > 0);

  if (!widths.length) {
    return 0;
  }

  const narrowWidth = Math.min(...widths);

  return narrowWidth <= 680 ? narrowWidth : viewportSize.width;
};

const getLightboxFitMetrics = (viewportWidth, rotation) => {
  const isMobile = viewportWidth <= 680;
  const isQuarterTurn = rotation % 180 !== 0;
  const hasMobileRotation = isMobile && isQuarterTurn;

  return {
    captionSpace: hasMobileRotation ? 48 : isMobile ? 48 : 54,
    framePaddingTotal: isMobile ? 16 : 24,
    horizontalGutterTotal: isMobile ? 32 : 64,
    verticalGutterTotal: hasMobileRotation ? 64 : isMobile ? 32 : 64,
    verticalOverflowAllowance: hasMobileRotation
      ? Math.min(144, Math.round(viewportWidth * 0.36))
      : 0,
  };
};

const getFittedImageStyles = (activeImage, rotation, viewportSize, zoom) => {
  if (
    !activeImage?.naturalHeight ||
    !activeImage?.naturalWidth ||
    !viewportSize.height ||
    !viewportSize.width
  ) {
    return {
      lightbox: undefined,
      frame: undefined,
      image: {
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      },
      stage: undefined,
    };
  }

  const viewportWidth = getMobileAwareViewportWidth(viewportSize);
  const metrics = getLightboxFitMetrics(viewportWidth, rotation);
  const availableWidth = Math.max(
    1,
    viewportWidth - metrics.horizontalGutterTotal - metrics.framePaddingTotal,
  );
  const availableHeight = Math.max(
    1,
    viewportSize.height -
      metrics.verticalGutterTotal -
      metrics.captionSpace -
      metrics.framePaddingTotal +
      metrics.verticalOverflowAllowance,
  );
  const isQuarterTurn = rotation % 180 !== 0;
  const hasMobileRotation = viewportWidth <= 680 && isQuarterTurn;
  const visibleNaturalWidth = isQuarterTurn
    ? activeImage.naturalHeight
    : activeImage.naturalWidth;
  const visibleNaturalHeight = isQuarterTurn
    ? activeImage.naturalWidth
    : activeImage.naturalHeight;
  const scaleLimit = viewportWidth > 680 ? 1.6 : 1;
  const baseScale = hasMobileRotation
    ? Math.min(availableWidth / visibleNaturalWidth, scaleLimit)
    : Math.min(
        availableWidth / visibleNaturalWidth,
        availableHeight / visibleNaturalHeight,
        scaleLimit,
      );
  const appliedZoom = viewportWidth >= DESKTOP_MIN_WIDTH ? zoom : MIN_ZOOM;
  const isZoomed = appliedZoom > MIN_ZOOM;
  const scale = baseScale * appliedZoom;
  const imageWidth = Math.round(activeImage.naturalWidth * scale);
  const imageHeight = Math.round(activeImage.naturalHeight * scale);
  const stageWidth = isQuarterTurn ? imageHeight : imageWidth;
  const stageHeight = isQuarterTurn ? imageWidth : imageHeight;
  const frameWidth =
    viewportWidth > 680
      ? Math.min(
          viewportWidth - metrics.horizontalGutterTotal,
          stageWidth + metrics.framePaddingTotal,
        )
      : undefined;
  const visualBottomGap = Math.max(
    hasMobileRotation ? 16 : 0,
    viewportSize.layoutHeight -
      viewportSize.offsetTop -
      viewportSize.height +
      (hasMobileRotation ? 16 : 0),
  );
  const visualTopGap = Math.max(
    hasMobileRotation ? 14 : 0,
    viewportSize.offsetTop + (hasMobileRotation ? 14 : 0),
  );

  return {
    lightbox: {
      "--project-lightbox-visual-bottom-gap": `${visualBottomGap}px`,
      "--project-lightbox-visual-top-gap": `${visualTopGap}px`,
    },
    frame: {
      "--project-lightbox-frame-max-height": hasMobileRotation
        ? `${Math.max(300, viewportSize.height - MOBILE_ROTATED_FRAME_GUTTER)}px`
        : undefined,
      "--project-lightbox-frame-width": frameWidth
        ? `${Math.round(frameWidth)}px`
        : undefined,
      "--project-lightbox-image-aspect": `${activeImage.naturalWidth / activeImage.naturalHeight}`,
      "--project-lightbox-stage-width": `${stageWidth}px`,
    },
    image: {
      height: `${imageHeight}px`,
      maxHeight: isQuarterTurn || isZoomed ? "none" : undefined,
      maxWidth: isQuarterTurn || isZoomed ? "none" : undefined,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      width: `${imageWidth}px`,
    },
    stage: {
      height: `${stageHeight}px`,
      justifySelf: isZoomed ? "start" : undefined,
      maxWidth: isZoomed ? "none" : undefined,
      width: `${stageWidth}px`,
    },
  };
};

const ProjectImageLightbox = ({
  bodyClassName = "article-body project-markdown-body",
  defaultAlt = "프로젝트 이미지",
  emptyLabel = "프로젝트 이미지 확대 보기",
  html,
  onImageReady,
  triggerClassName = "project-lightbox-trigger",
}) => {
  const articleRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);
  const captionId = React.useId();
  const imageViewportId = React.useId();
  const imageViewportRef = React.useRef(null);
  const lightboxRef = React.useRef(null);
  const [activeImage, setActiveImage] = React.useState(null);
  const [rotation, setRotation] = React.useState(0);
  const rotateButtonRef = React.useRef(null);
  const zoomInButtonRef = React.useRef(null);
  const zoomOutButtonRef = React.useRef(null);
  const [zoom, setZoom] = React.useState(MIN_ZOOM);
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

    const cleanups = images.map((image) => {
      const alt = image.getAttribute("alt") || defaultAlt;
      const handleImageReady = () => onImageReady?.(image);

      image.classList.add(triggerClassName);
      image.setAttribute("role", "button");
      image.setAttribute("tabindex", "0");
      image.setAttribute("aria-label", `${alt} 확대 보기`);

      if (onImageReady) {
        if (image.complete && image.naturalWidth) {
          handleImageReady();
        } else {
          image.addEventListener("load", handleImageReady, { once: true });
        }
      }

      return () => {
        image.classList.remove(triggerClassName);
        image.removeAttribute("role");
        image.removeAttribute("tabindex");
        image.removeAttribute("aria-label");
        image.removeEventListener("load", handleImageReady);
      };
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [defaultAlt, html, onImageReady, triggerClassName]);

  React.useEffect(() => {
    if (!activeImage) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActiveImage(null);
        setZoom(MIN_ZOOM);
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
    window.visualViewport?.addEventListener("scroll", updateViewportSize);
    window.addEventListener("orientationchange", updateViewportSize);
    window.addEventListener("resize", updateViewportSize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.visualViewport?.removeEventListener("resize", updateViewportSize);
      window.visualViewport?.removeEventListener("scroll", updateViewportSize);
      window.removeEventListener("orientationchange", updateViewportSize);
      window.removeEventListener("resize", updateViewportSize);
    };
  }, [activeImage]);

  const openImage = React.useCallback((image) => {
    const payload = getImagePayload(image);

    if (payload.src) {
      setRotation(0);
      setZoom(MIN_ZOOM);
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
    setZoom(MIN_ZOOM);
  }, []);

  const keepLightboxOpen = React.useCallback((event) => {
    event.stopPropagation();
  }, []);

  const keepLightboxTouch = React.useCallback((event) => {
    event.stopPropagation();
  }, []);

  const resetImageViewportScroll = React.useCallback(() => {
    const imageViewport = imageViewportRef.current;

    if (!imageViewport) {
      return;
    }

    imageViewport.scrollLeft = 0;
    imageViewport.scrollTop = 0;
  }, []);

  const desktopZoomEnabled =
    getMobileAwareViewportWidth(viewportSize) >= DESKTOP_MIN_WIDTH;

  const updateZoom = React.useCallback(
    (delta) => {
      if (!desktopZoomEnabled) {
        return;
      }

      setZoom((currentZoom) =>
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom + delta)),
      );
    },
    [desktopZoomEnabled],
  );

  const zoomIn = React.useCallback(() => {
    updateZoom(ZOOM_STEP);
  }, [updateZoom]);

  const zoomOut = React.useCallback(() => {
    updateZoom(-ZOOM_STEP);
  }, [updateZoom]);

  const toggleImageZoom = React.useCallback(
    (event) => {
      event.stopPropagation();

      if (!desktopZoomEnabled) {
        return;
      }

      setZoom((currentZoom) => (currentZoom > MIN_ZOOM ? MIN_ZOOM : MAX_ZOOM));
    },
    [desktopZoomEnabled],
  );

  const rotateImage = React.useCallback(() => {
    setRotation((currentRotation) => (currentRotation + 90) % 360);
  }, []);

  const syncActiveImageSize = React.useCallback((event) => {
    const { naturalHeight, naturalWidth } = event.currentTarget;

    if (!naturalHeight || !naturalWidth) {
      return;
    }

    setActiveImage((currentImage) => {
      if (
        !currentImage ||
        (currentImage.naturalHeight === naturalHeight &&
          currentImage.naturalWidth === naturalWidth)
      ) {
        return currentImage;
      }

      return {
        ...currentImage,
        naturalHeight,
        naturalWidth,
      };
    });
  }, []);

  const handleLightboxImageLoad = React.useCallback(
    (event) => {
      syncActiveImageSize(event);
      window.requestAnimationFrame(resetImageViewportScroll);
    },
    [resetImageViewportScroll, syncActiveImageSize],
  );

  React.useEffect(() => {
    if (!activeImage) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(resetImageViewportScroll);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeImage, resetImageViewportScroll, rotation, zoom]);

  React.useEffect(() => {
    if (activeImage && !desktopZoomEnabled && zoom !== MIN_ZOOM) {
      setZoom(MIN_ZOOM);
    }
  }, [activeImage, desktopZoomEnabled, zoom]);

  const trapLightboxFocus = React.useCallback((event) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusTargets = [
      closeButtonRef.current,
      zoomOutButtonRef.current,
      zoomInButtonRef.current,
      rotateButtonRef.current,
    ].filter((target) => target && !target.disabled);

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
    () => getFittedImageStyles(activeImage, rotation, viewportSize, zoom),
    [activeImage, rotation, viewportSize, zoom],
  );
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <>
      <div
        ref={articleRef}
        className={bodyClassName}
        onClick={handleArticleClick}
        onKeyDown={handleArticleKeyDown}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {activeImage ? (
        <div
          ref={lightboxRef}
          className="project-lightbox"
          style={fittedImageStyles.lightbox}
          data-project-lightbox-rotated={
            rotation % 180 !== 0 ? "true" : undefined
          }
          data-project-lightbox-can-zoom={
            desktopZoomEnabled ? "true" : undefined
          }
          data-project-lightbox-zoom={
            desktopZoomEnabled ? zoom.toFixed(1) : undefined
          }
          data-project-lightbox-zoomed={
            desktopZoomEnabled && zoom > MIN_ZOOM ? "true" : undefined
          }
          role="dialog"
          aria-modal="true"
          aria-label={
            activeImage.alt ? `${activeImage.alt} 확대 보기` : emptyLabel
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
          <figure
            className="project-lightbox-frame"
            style={fittedImageStyles.frame}
            onClick={keepLightboxOpen}
            onTouchStart={keepLightboxTouch}
            onTouchMove={keepLightboxTouch}
          >
            <span
              id={imageViewportId}
              ref={imageViewportRef}
              className="project-lightbox-image-viewport"
            >
              <span
                className="project-lightbox-image-stage"
                style={fittedImageStyles.stage}
              >
                <img
                  className={`project-lightbox-image project-lightbox-zoom-target${
                    desktopZoomEnabled && zoom > MIN_ZOOM ? " is-zoomed" : ""
                  }`}
                  src={activeImage.src}
                  alt={activeImage.alt}
                  style={fittedImageStyles.image}
                  onClick={toggleImageZoom}
                  onLoad={handleLightboxImageLoad}
                />
              </span>
            </span>
            <figcaption className="project-lightbox-footer">
              <span
                className="project-lightbox-caption-text"
                id={activeImage.alt ? captionId : undefined}
              >
                {activeImage.alt}
              </span>
              <span className="project-lightbox-actions">
                {desktopZoomEnabled ? (
                  <>
                    <button
                      ref={zoomOutButtonRef}
                      className="project-lightbox-zoom project-lightbox-zoom-out"
                      type="button"
                      aria-controls={imageViewportId}
                      aria-label={`이미지 축소, 현재 ${zoomPercentage}%`}
                      disabled={zoom <= MIN_ZOOM}
                      onClick={zoomOut}
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                    <output
                      className="project-lightbox-zoom-value"
                      aria-live="polite"
                    >
                      {zoomPercentage}%
                    </output>
                    <button
                      ref={zoomInButtonRef}
                      className="project-lightbox-zoom project-lightbox-zoom-in"
                      type="button"
                      aria-controls={imageViewportId}
                      aria-label={`이미지 확대, 현재 ${zoomPercentage}%`}
                      disabled={zoom >= MAX_ZOOM}
                      onClick={zoomIn}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </>
                ) : null}
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
              </span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
};

export default ProjectImageLightbox;
