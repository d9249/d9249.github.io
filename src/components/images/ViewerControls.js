import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  ExternalLink,
} from "lucide-react";

export default function ViewerControls({
  images,
  index,
  onIndexChange,
  scale,
  onScale,
  rotate,
  onRotate,
  overlayVisible,
  ready = true,
  zoomable = true,
}) {
  const activeThumb = React.useRef(null);
  React.useEffect(() => {
    activeThumb.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [index]);
  React.useEffect(() => {
    const handleKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      switch (event.key) {
        case "+":
        case "=":
          onScale(Math.min(6, scale + 0.5));
          break;
        case "-":
          onScale(Math.max(1, scale - 0.5));
          break;
        case "0":
          onScale(1);
          onRotate(0);
          break;
        case "r":
        case "R":
          onRotate(rotate + 90);
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onRotate, onScale, rotate, scale]);
  return (
    <>
      {images.length > 1 ? (
        <div className="image-viewer-navigation">
          <button
            type="button"
            aria-label="이전 이미지"
            title="이전 이미지 (←)"
            disabled={!ready || index === 0}
            onClick={() => onIndexChange(index - 1)}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="다음 이미지"
            title="다음 이미지 (→)"
            disabled={!ready || index === images.length - 1}
            onClick={() => onIndexChange(index + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      ) : null}
      <div
        className={`image-viewer-bottom${overlayVisible ? "" : " is-hidden"}`}
        inert={overlayVisible ? undefined : ""}
      >
        <div
          className="image-viewer-tools"
          role="group"
          aria-label="이미지 조작"
        >
          <button
            type="button"
            aria-label="이미지 축소"
            title="축소 (-)"
            disabled={!ready || !zoomable || scale <= 1}
            onClick={() => onScale(Math.max(1, scale - 0.5))}
          >
            <ZoomOut />
          </button>
          <output className="image-viewer-scale" aria-label="확대 배율">
            {Math.round(scale * 100)}%
          </output>
          <button
            type="button"
            aria-label="이미지 확대"
            title="확대 (+)"
            disabled={!ready || !zoomable || scale >= 6}
            onClick={() => onScale(Math.min(6, scale + 0.5))}
          >
            <ZoomIn />
          </button>
          <button
            type="button"
            aria-label="이미지 배율과 회전 초기화"
            disabled={!ready || !zoomable}
            title="기본 보기 (0)"
            onClick={() => {
              onScale(1);
              onRotate(0);
            }}
          >
            <Maximize />
          </button>
          <button
            type="button"
            aria-label="이미지 오른쪽으로 회전"
            disabled={!ready || !zoomable}
            title="오른쪽으로 회전 (R)"
            onClick={() => onRotate(rotate + 90)}
          >
            <RotateCw />
          </button>
          <a
            href={images[index].src}
            target="_blank"
            rel="noreferrer"
            aria-label="원본 이미지 새 탭에서 보기"
            title="원본 보기"
          >
            <ExternalLink />
          </a>
        </div>
        {images.length > 1 ? (
          <nav className="image-viewer-thumbnails" aria-label="이미지 목록">
            {images.map((image, imageIndex) => (
              <button
                key={image.key || image.src}
                type="button"
                ref={imageIndex === index ? activeThumb : null}
                aria-label={`${imageIndex + 1}번 이미지: ${image.alt || "이미지"}`}
                disabled={!ready}
                aria-current={imageIndex === index ? "true" : undefined}
                onClick={() => onIndexChange(imageIndex)}
              >
                <img src={image.src} alt="" loading="lazy" />
                <span>{imageIndex + 1}</span>
              </button>
            ))}
          </nav>
        ) : null}
      </div>
    </>
  );
}
