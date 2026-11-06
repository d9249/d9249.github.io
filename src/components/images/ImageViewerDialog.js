import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import useModalDialog from "../useModalDialog";
import useImageViewer from "./useImageViewer";
import ViewerControls from "./ViewerControls";

export default function ImageViewerDialog({
  images,
  index = 0,
  onClose,
  opener,
}) {
  const dialogRef = React.useRef(null);
  const captionId = React.useId();
  useModalDialog(dialogRef, true, opener);
  const controls = useImageViewer(dialogRef, { images, index, onClose });
  const caption = images[controls.index].alt || "이미지";
  return (
    <dialog
      ref={dialogRef}
      className="image-viewer-dialog"
      aria-label="이미지 뷰어"
      aria-describedby={captionId}
      onCancel={(event) => {
        event.preventDefault();
        controls.onClose();
      }}
    >
      <header className="image-viewer-header">
        <div>
          <span className="image-viewer-count" aria-live="polite">
            {controls.index + 1} / {images.length}
          </span>
          <details className="image-viewer-description" key={controls.index}>
            <summary aria-label="이미지 설명" title="설명 펼치기/접기">
              <span
                id={captionId}
                className="image-viewer-caption"
                aria-live="polite"
              >
                {caption}
              </span>
              <ChevronDown aria-hidden="true" />
            </summary>
          </details>
        </div>
        <button
          type="button"
          aria-label="이미지 뷰어 닫기"
          title="닫기 (Esc)"
          onClick={controls.onClose}
          autoFocus
        >
          <X />
        </button>
      </header>
      <ViewerControls {...controls} />
      {!controls.ready ? (
        <div className="image-viewer-pending" role="status">
          이미지를 불러오는 중…
        </div>
      ) : null}
    </dialog>
  );
}
