import * as React from "react";

const IMAGE_EVIDENCE_PATTERN = /\.(avif|gif|jpe?g|png|webp)$/i;

const getEvidenceFrameSrc = (href) =>
  `${href}#toolbar=0&navpanes=0&scrollbar=1&view=Fit`;

const InlineEvidenceViewer = ({
  itemTitle,
  evidence,
  viewerId,
  isFullView,
  isModal = false,
  onClose,
  onToggleFullView,
}) => {
  const isImageEvidence = IMAGE_EVIDENCE_PATTERN.test(evidence.href);
  const closeButtonRef = React.useRef(null);
  const titleId = React.useId();
  const isExpandedView = isFullView || isModal;

  React.useEffect(() => {
    if (!isModal) {
      return undefined;
    }

    const focusId = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => window.clearTimeout(focusId);
  }, [isModal]);

  const handleViewerClick = (event) => {
    if (isModal) {
      event.stopPropagation();
    }
  };

  return (
    <div
      className={`paper-viewer-panel${isExpandedView ? " paper-viewer-panel-full" : ""}${isModal ? " paper-viewer-panel-modal" : ""}`}
      role={isModal ? "dialog" : undefined}
      aria-modal={isModal ? "true" : undefined}
      aria-labelledby={isModal ? titleId : undefined}
      onClick={isModal ? onClose : undefined}
    >
      <div className="paper-viewer" id={viewerId} onClick={handleViewerClick}>
        <div
          className="paper-viewer-toolbar"
          role="toolbar"
          aria-label={`${itemTitle} 증빙 뷰어 조작`}
        >
          <div className="paper-viewer-title" id={titleId}>
            {itemTitle} · {evidence.label}
          </div>
          <div className="paper-viewer-controls">
            <button
              type="button"
              className="paper-viewer-control paper-viewer-control-text"
              onClick={isModal ? onClose : onToggleFullView}
              aria-pressed={isModal ? undefined : isFullView}
              aria-label={
                isModal
                  ? "증빙 팝업 닫기"
                  : isFullView
                    ? "증빙 전체 보기 닫기"
                    : "증빙 전체 보기"
              }
              title={
                isModal ? "닫기" : isFullView ? "전체 보기 닫기" : "전체 보기"
              }
              ref={closeButtonRef}
            >
              {isModal ? "닫기" : isFullView ? "복귀" : "전체"}
            </button>
          </div>
        </div>
        <div
          className={`paper-viewer-stage${isImageEvidence ? " evidence-viewer-stage-image" : ""}`}
        >
          {isImageEvidence ? (
            <img
              className="evidence-viewer-image"
              src={evidence.href}
              alt={`${itemTitle} ${evidence.label}`}
            />
          ) : (
            <iframe
              title={`${itemTitle} ${evidence.label}`}
              src={getEvidenceFrameSrc(evidence.href)}
              loading="lazy"
              scrolling="yes"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InlineEvidenceViewer;
