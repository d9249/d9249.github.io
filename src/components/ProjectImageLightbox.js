import * as React from "react";
import ImageViewer from "./ImageViewer";

export default function ProjectImageLightbox({
  bodyClassName = "article-body project-markdown-body",
  defaultAlt = "프로젝트 이미지",
  emptyLabel = "프로젝트 이미지 확대 보기",
  html,
  onImageReady,
  triggerClassName = "project-lightbox-trigger",
}) {
  const articleRef = React.useRef(null);
  const [gallery, setGallery] = React.useState(null);
  React.useEffect(() => {
    const images = [...articleRef.current.querySelectorAll("img")];
    const cleanups = images.map((image) => {
      const alt = image.getAttribute("alt") || defaultAlt;
      const previous = {
        role: image.getAttribute("role"),
        tabindex: image.getAttribute("tabindex"),
        label: image.getAttribute("aria-label"),
      };
      let feedback;
      const loaded = () => {
        image.hidden = false;
        image.classList.add(triggerClassName);
        image.setAttribute("role", "button");
        image.setAttribute("tabindex", "0");
        image.setAttribute("aria-label", `${alt} 확대 보기`);
        feedback?.remove();
        feedback = undefined;
        onImageReady?.(image);
      };
      const failed = () => {
        image.hidden = true;
        image.classList.remove(triggerClassName);
        if (feedback) return;
        feedback = document.createElement("span");
        feedback.className = "article-image-error";
        feedback.setAttribute("role", "status");
        feedback.append(
          document.createTextNode(`${alt} — 그림을 불러오지 못했습니다. `),
        );
        const link = document.createElement("a");
        link.href = image.currentSrc || image.src;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "원본 주소 확인 ↗";
        feedback.append(link);
        image.insertAdjacentElement("afterend", feedback);
      };
      image.addEventListener("load", loaded);
      image.addEventListener("error", failed);
      if (image.complete) {
        if (image.naturalWidth) loaded();
        else failed();
      }
      return () => {
        image.removeEventListener("load", loaded);
        image.removeEventListener("error", failed);
        image.classList.remove(triggerClassName);
        for (const [attribute, value] of [
          ["role", previous.role],
          ["tabindex", previous.tabindex],
          ["aria-label", previous.label],
        ]) {
          if (value === null) image.removeAttribute(attribute);
          else image.setAttribute(attribute, value);
        }
        image.hidden = false;
        feedback?.remove();
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [defaultAlt, html, onImageReady, triggerClassName]);
  const openImage = (event) => {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ")
      return;
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
      return;
    const image =
      event.target instanceof Element ? event.target.closest("img") : null;
    if (!image || !articleRef.current.contains(image) || !image.naturalWidth)
      return;
    event.preventDefault();
    image.focus({ preventScroll: true });
    const images = [...articleRef.current.querySelectorAll("img")].filter(
      (item) => (item.currentSrc || item.getAttribute("src")) && !item.hidden,
    );
    setGallery({
      index: images.indexOf(image),
      images: images.map((item, index) => ({
        key: index,
        src: item.currentSrc || item.src,
        alt: item.alt || defaultAlt,
        width: item.naturalWidth || undefined,
        height: item.naturalHeight || undefined,
        originRef: { current: item },
      })),
    });
  };
  return (
    <>
      <div
        ref={articleRef}
        className={bodyClassName}
        onClick={openImage}
        onKeyDown={openImage}
        aria-label={emptyLabel}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {gallery ? (
        <ImageViewer {...gallery} onClose={() => setGallery(null)} />
      ) : null}
    </>
  );
}
