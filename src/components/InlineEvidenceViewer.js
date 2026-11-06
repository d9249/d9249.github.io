import * as React from "react";
import ImageViewer from "./ImageViewer";
import useModalDialog from "./useModalDialog";

const IMAGE_EVIDENCE_PATTERN = /\.(avif|gif|jpe?g|png|webp)$/i;

const getEvidenceFrameSrc = (href) =>
  `${href}#toolbar=1&navpanes=0&scrollbar=1&view=Fit`;

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
  const dialogRef = React.useRef(null);
  const openerRef = React.useRef(null);
  const titleId = React.useId();
  const isExpandedView = isFullView || isModal;

  useModalDialog(
    dialogRef,
    isExpandedView && !isImageEvidence,
    openerRef.current,
  );
  const closeExpanded = onClose;
  const Panel = isExpandedView ? "dialog" : "div";
  const openFullView = () => {
    openerRef.current = document.querySelector(
      `button[aria-controls="${CSS.escape(viewerId)}"]`,
    );
    onToggleFullView();
  };

  if (isImageEvidence && isExpandedView) {
    return (
      <ImageViewer
        images={[
          {
            key: evidence.href,
            src: evidence.href,
            alt: `${itemTitle} · ${evidence.label}`,
          },
        ]}
        onClose={closeExpanded}
        returnFocus={openerRef.current}
      />
    );
  }

  const handleViewerClick = (event) => {
    if (isModal) {
      event.stopPropagation();
    }
  };

  return (
    <Panel
      ref={dialogRef}
      className={`paper-viewer-panel${isExpandedView ? " paper-viewer-panel-full" : ""}${isModal ? " paper-viewer-panel-modal" : ""}`}
      aria-labelledby={isExpandedView ? titleId : undefined}
      onCancel={
        isExpandedView
          ? (event) => {
              event.preventDefault();
              closeExpanded();
            }
          : undefined
      }
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
              onClick={isExpandedView ? closeExpanded : openFullView}
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
              autoFocus={isExpandedView}
            >
              {isModal ? "닫기" : isFullView ? "복귀" : "전체"}
            </button>
          </div>
        </div>
        <div
          className={`paper-viewer-stage${isImageEvidence ? " evidence-viewer-stage-image" : ""}`}
        >
          {isImageEvidence ? (
            <button
              type="button"
              className="evidence-image-open"
              aria-label={`${itemTitle} ${evidence.label} 확대 보기`}
              onClick={openFullView}
            >
              <img
                className="evidence-viewer-image"
                src={evidence.href}
                alt={`${itemTitle} ${evidence.label}`}
              />
            </button>
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
    </Panel>
  );
};

export default InlineEvidenceViewer;
