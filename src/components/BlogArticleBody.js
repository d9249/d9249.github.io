import * as React from "react";
import ProjectImageLightbox from "./ProjectImageLightbox";

const DARK_ANALYSIS_IMAGE_CLASS = "blog-readable-dark-image";
const DARK_ANALYSIS_FRAME_CLASS = "blog-readable-dark-frame";
const WIDE_ANALYSIS_IMAGE_CLASS = "blog-readable-wide-image";
const WIDE_ANALYSIS_FRAME_CLASS = "blog-readable-wide-frame";
const SAMPLE_MAX_SIDE = 96;
const MIN_ANALYSIS_ASPECT_RATIO = 2.2;

const getMediaFrame = (image) => image.closest("figure, p");

const getImageAspectRatio = (image) => {
  const { naturalWidth, naturalHeight } = image;
  return naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 0;
};

const getImageTone = (image) => {
  const { naturalWidth, naturalHeight } = image;

  if (!naturalWidth || !naturalHeight) {
    return "unknown";
  }

  const aspectRatio = getImageAspectRatio(image);

  if (aspectRatio < MIN_ANALYSIS_ASPECT_RATIO) {
    return "normal";
  }

  const scale = Math.min(
    1,
    SAMPLE_MAX_SIDE / Math.max(naturalWidth, naturalHeight),
  );
  const sampleWidth = Math.max(1, Math.round(naturalWidth * scale));
  const sampleHeight = Math.max(1, Math.round(naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return "unknown";
  }

  try {
    context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
    const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);
    let total = 0;
    let darkPixels = 0;
    let blackPixels = 0;
    let lightPixels = 0;
    let lumaSum = 0;

    for (let index = 0; index < data.length; index += 4) {
      const alpha = data[index + 3];
      if (alpha < 128) {
        continue;
      }

      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

      total += 1;
      lumaSum += luma;

      if (luma < 45) {
        darkPixels += 1;
      }
      if (luma < 22) {
        blackPixels += 1;
      }
      if (luma > 210) {
        lightPixels += 1;
      }
    }

    if (!total) {
      return "unknown";
    }

    const averageLuma = lumaSum / total;
    const darkRatio = darkPixels / total;
    const blackRatio = blackPixels / total;
    const lightRatio = lightPixels / total;

    if (
      averageLuma < 70 &&
      darkRatio > 0.68 &&
      blackRatio > 0.48 &&
      lightRatio < 0.12
    ) {
      return "dark-analysis";
    }
  } catch (error) {
    return "unknown";
  }

  return "normal";
};

const applyImageTone = (image) => {
  const frame = getMediaFrame(image);
  const aspectRatio = getImageAspectRatio(image);
  const tone = getImageTone(image);
  const isWideAnalysis = aspectRatio >= MIN_ANALYSIS_ASPECT_RATIO;
  const isDarkAnalysis = tone === "dark-analysis";

  image.classList.toggle(WIDE_ANALYSIS_IMAGE_CLASS, isWideAnalysis);
  image.classList.toggle(DARK_ANALYSIS_IMAGE_CLASS, isDarkAnalysis);
  image.dataset.blogImageTone = tone;

  if (frame) {
    frame.classList.toggle(WIDE_ANALYSIS_FRAME_CLASS, isWideAnalysis);
    frame.classList.toggle(DARK_ANALYSIS_FRAME_CLASS, isDarkAnalysis);
  }
};

const BlogArticleBody = ({
  bodyClassName = "article-body blog-markdown-body",
  defaultAlt = "블로그 이미지",
  emptyLabel = "블로그 이미지 확대 보기",
  html,
}) => {
  return (
    <ProjectImageLightbox
      bodyClassName={bodyClassName}
      defaultAlt={defaultAlt}
      emptyLabel={emptyLabel}
      html={html}
      onImageReady={applyImageTone}
    />
  );
};

export default BlogArticleBody;
