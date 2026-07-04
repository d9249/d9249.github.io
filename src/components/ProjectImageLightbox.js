import * as React from "react";

const getImagePayload = (image) => ({
  alt: image.getAttribute("alt") || "",
  src: image.currentSrc || image.getAttribute("src") || "",
});

const ProjectImageLightbox = ({ html }) => {
  const articleRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);
  const captionId = React.useId();
  const [activeImage, setActiveImage] = React.useState(null);

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

  const openImage = React.useCallback((image) => {
    const payload = getImagePayload(image);

    if (payload.src) {
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

  const trapLightboxFocus = React.useCallback((event) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    closeButtonRef.current?.focus();
  }, []);

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
          className="project-lightbox"
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
            <img
              className="project-lightbox-image"
              src={activeImage.src}
              alt={activeImage.alt}
            />
            {activeImage.alt ? (
              <figcaption id={captionId}>{activeImage.alt}</figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </>
  );
};

export default ProjectImageLightbox;
