import * as React from "react";

const IMAGE_EVIDENCE_PATTERN = /\.(avif|gif|jpe?g|png|webp)$/i;

const getEvidenceFrameSrc = (href) =>
  `${href}#toolbar=0&navpanes=0&scrollbar=1&view=Fit`;

const InlineEvidenceViewer = ({
  itemTitle,
  evidence,
  viewerId,
  isFullView,
  onToggleFullView,
}) => {
  const isImageEvidence = IMAGE_EVIDENCE_PATTERN.test(evidence.href);

  return (
    <div
      className={`paper-viewer-panel${isFullView ? " paper-viewer-panel-full" : ""}`}
    >
      <div className="paper-viewer" id={viewerId}>
        <div
          className="paper-viewer-toolbar"
          role="toolbar"
          aria-label={`${itemTitle} 증빙 뷰어 조작`}
        >
          <div className="paper-viewer-title">
            {itemTitle} · {evidence.label}
          </div>
          <div className="paper-viewer-controls">
            <button
              type="button"
              className="paper-viewer-control paper-viewer-control-text"
              onClick={onToggleFullView}
              aria-pressed={isFullView}
              aria-label={isFullView ? "증빙 전체 보기 닫기" : "증빙 전체 보기"}
              title={isFullView ? "전체 보기 닫기" : "전체 보기"}
            >
              {isFullView ? "복귀" : "전체"}
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
