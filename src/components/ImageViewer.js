import * as React from "react";
import useModalDialog from "./useModalDialog";

class ViewerBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ViewerStatus({ onClose, opener, image, failed = false }) {
  const ref = React.useRef(null);
  useModalDialog(ref, true, opener);
  return (
    <dialog
      ref={ref}
      className="image-viewer-dialog image-viewer-loading"
      aria-label="이미지 뷰어"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <p role={failed ? "alert" : "status"}>
        {failed
          ? "이미지 뷰어를 불러오지 못했습니다. 원본을 열거나 닫은 뒤 다시 시도해 주세요."
          : "이미지 뷰어를 여는 중…"}
      </p>
      {failed ? (
        <a href={image.src} target="_blank" rel="noreferrer">
          원본 이미지 보기
        </a>
      ) : null}
      <button type="button" onClick={onClose} autoFocus>
        {failed ? "닫기" : "취소"}
      </button>
    </dialog>
  );
}

export default function ImageViewer(props) {
  const [Viewer] = React.useState(() =>
    React.lazy(() => import("./images/ImageViewerDialog")),
  );
  const [opener] = React.useState(
    () => props.returnFocus || document.activeElement,
  );
  return (
    <ViewerBoundary
      fallback={
        <ViewerStatus
          failed
          image={props.images[props.index || 0]}
          onClose={props.onClose}
          opener={opener}
        />
      }
    >
      <React.Suspense
        fallback={<ViewerStatus onClose={props.onClose} opener={opener} />}
      >
        <Viewer {...props} opener={opener} />
      </React.Suspense>
    </ViewerBoundary>
  );
}
