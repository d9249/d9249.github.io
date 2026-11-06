import * as React from "react";
import PhotoSwipe from "photoswipe";

const dimensions = (image) => ({
  width: image.width || image.originRef?.current?.naturalWidth,
  height: image.height || image.originRef?.current?.naturalHeight,
});

export default function useImageViewer(dialogRef, { images, index, onClose }) {
  const engine = React.useRef(null);
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  const [view, setView] = React.useState({
    index,
    scale: 1,
    rotate: 0,
    ready: false,
    zoomable: false,
    overlayVisible: true,
  });

  React.useEffect(() => {
    let disposing = false;
    let pendingImage;
    let layoutObserver;
    const data = images.map((image) => {
      const size = dimensions(image);
      return {
        ...image,
        width: size.width || 1,
        height: size.height || 1,
        naturalWidth: size.width,
        naturalHeight: size.height,
        rotation: 0,
      };
    });
    const initialize = async () => {
      if (!data[index].naturalWidth) {
        await new Promise((resolve) => {
          pendingImage = new Image();
          pendingImage.onload = () => {
            Object.assign(data[index], {
              width: pendingImage.naturalWidth,
              height: pendingImage.naturalHeight,
              naturalWidth: pendingImage.naturalWidth,
              naturalHeight: pendingImage.naturalHeight,
            });
            resolve();
          };
          pendingImage.onerror = resolve;
          pendingImage.src = data[index].src;
        });
      }
      if (disposing) return;
      const dialog = dialogRef.current;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const toggleOverlay = () => {
        dialog
          .querySelector(".image-viewer-header button")
          ?.focus({ preventScroll: true });
        setView((current) => ({
          ...current,
          overlayVisible: !current.overlayVisible,
        }));
      };
      const swipe = new PhotoSwipe({
        dataSource: data,
        index,
        appendToEl: dialog,
        loop: false,
        arrowPrev: false,
        arrowNext: false,
        zoom: false,
        close: false,
        counter: false,
        escKey: false,
        trapFocus: false,
        returnFocus: false,
        wheelToZoom: true,
        initialZoomLevel: "fit",
        secondaryZoomLevel: (level) => level.fit * 2,
        maxZoomLevel: (level) => level.fit * 6,
        showHideAnimationType: "fade",
        showAnimationDuration: reduce ? 0 : 180,
        hideAnimationDuration: reduce ? 0 : 180,
        zoomAnimationDuration: reduce ? 0 : 180,
        imageClickAction: toggleOverlay,
        tapAction: toggleOverlay,
        doubleTapAction: "zoom",
        bgClickAction: false,
        errorMsg: "이미지를 불러오지 못했습니다. 원본 보기로 확인해 주세요.",
        paddingFn: () => ({
          top:
            (dialog
              .querySelector(".image-viewer-header")
              ?.getBoundingClientRect().height || 84) + 12,
          bottom:
            (dialog
              .querySelector(".image-viewer-bottom")
              ?.getBoundingClientRect().height || 72) + 12,
          left: images.length > 1 ? 56 : 16,
          right: images.length > 1 ? 56 : 16,
        }),
      });
      engine.current = swipe;
      swipe.on("keydown", (event) => {
        const original = event.originalEvent;
        // Native dialog and caption controls own their keyboard focus and scrolling.
        if (
          original.key === "Tab" ||
          original.target?.closest?.(".image-viewer-description")
        )
          event.preventDefault();
      });
      const sync = () => {
        const slide = swipe.currSlide;
        if (!slide) return;
        const scale = slide.currZoomLevel / slide.zoomLevels.initial;
        const rotate = data[swipe.currIndex].rotation;
        const zoomable = Boolean(
          data[swipe.currIndex].naturalWidth && slide.content.isZoomable(),
        );
        setView((current) =>
          current.index === swipe.currIndex &&
          Math.abs(current.scale - scale) < 0.001 &&
          current.rotate === rotate &&
          current.ready &&
          current.zoomable === zoomable
            ? current
            : {
                ...current,
                index: swipe.currIndex,
                scale,
                rotate,
                ready: true,
                zoomable,
              },
        );
      };
      swipe.on("change", sync);
      swipe.on("zoomPanUpdate", sync);
      swipe.on("resize", sync);
      swipe.on("imageSizeChange", ({ content, width, height }) => {
        const angle = data[content.index].rotation;
        const quarter = angle % 180 !== 0;
        if (!content.element) return;
        const imageWidth = quarter ? height : width;
        const imageHeight = quarter ? width : height;
        Object.assign(content.element.style, {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${(width - imageWidth) / 2}px, ${(height - imageHeight) / 2}px) rotate(${angle}deg)`,
        });
      });
      swipe.on("loadComplete", ({ content, isError }) => {
        const item = data[content.index];
        if (!isError && !item.naturalWidth && content.element?.naturalWidth) {
          item.naturalWidth = content.element.naturalWidth;
          item.naturalHeight = content.element.naturalHeight;
          const quarter = item.rotation % 180 !== 0;
          item.width = quarter ? item.naturalHeight : item.naturalWidth;
          item.height = quarter ? item.naturalWidth : item.naturalHeight;
          swipe.refreshSlideContent(content.index);
        }
        sync();
      });
      swipe.addFilter("contentErrorElement", (element) => {
        element.setAttribute("role", "alert");
        return element;
      });
      swipe.on("destroy", () => {
        if (!disposing) closeRef.current();
      });
      swipe.init();
      swipe.element.setAttribute("role", "presentation");
      swipe.element.removeAttribute("aria-modal");
      swipe.element.removeAttribute("aria-label");
      layoutObserver = new ResizeObserver(() => swipe.updateSize(true));
      layoutObserver.observe(dialog.querySelector(".image-viewer-header"));
      layoutObserver.observe(dialog.querySelector(".image-viewer-bottom"));
      sync();
    };
    initialize();
    return () => {
      disposing = true;
      layoutObserver?.disconnect();
      if (pendingImage) {
        pendingImage.onload = null;
        pendingImage.onerror = null;
        pendingImage.src = "";
      }
      engine.current?.destroy();
      engine.current = null;
    };
  }, [dialogRef, images, index]);

  const onScale = React.useCallback((scale) => {
    const swipe = engine.current;
    if (
      swipe?.currSlide?.data.naturalWidth &&
      swipe.currSlide.content.isZoomable()
    )
      swipe.currSlide.zoomTo(
        swipe.currSlide.zoomLevels.initial * scale,
        swipe.getViewportCenterPoint(),
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180,
      );
  }, []);
  const onRotate = React.useCallback((rotate) => {
    const swipe = engine.current;
    if (!swipe?.currSlide || swipe.currSlide.data.rotation === rotate) return;
    const item = swipe.options.dataSource[swipe.currIndex];
    if (
      !item.naturalWidth ||
      !item.naturalHeight ||
      swipe.currSlide.content.isError()
    )
      return;
    item.rotation = rotate;
    const quarter = rotate % 180 !== 0;
    item.width = quarter ? item.naturalHeight : item.naturalWidth;
    item.height = quarter ? item.naturalWidth : item.naturalHeight;
    swipe.refreshSlideContent(swipe.currIndex);
  }, []);
  const onIndexChange = React.useCallback(
    (next) => engine.current?.goTo(next),
    [],
  );
  const close = React.useCallback(
    () => (engine.current ? engine.current.close() : closeRef.current()),
    [],
  );
  return { ...view, images, onScale, onRotate, onIndexChange, onClose: close };
}
