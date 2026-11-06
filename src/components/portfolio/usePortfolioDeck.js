import * as React from "react";
import {
  clampSlideIndex,
  fullscreenEvents,
  getFullscreenElement,
  requestNativeFullscreen,
  exitNativeFullscreen,
  lockLandscapeOrientation,
  unlockOrientation,
} from "./presentation";

export default function usePortfolioDeck(slides) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isNativeFullscreen, setIsNativeFullscreen] = React.useState(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = React.useState(false);
  const [isLandscapeMode, setIsLandscapeMode] = React.useState(false);
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const stageRef = React.useRef(null);
  const slideStripRef = React.useRef(null);
  const activeThumbRef = React.useRef(null);
  const hideControlsTimerRef = React.useRef(null);
  const activeSlide = slides[activeIndex];
  const isPresentationMode = isNativeFullscreen || isFallbackFullscreen;

  const goToSlide = React.useCallback(
    (nextIndex) => {
      setActiveIndex(clampSlideIndex(nextIndex, slides.length));
    },
    [slides.length],
  );

  const goFirst = React.useCallback(() => {
    goToSlide(0);
  }, [goToSlide]);

  const goNext = React.useCallback(() => {
    setActiveIndex((current) => clampSlideIndex(current + 1, slides.length));
  }, [slides.length]);

  const goPrevious = React.useCallback(() => {
    setActiveIndex((current) => clampSlideIndex(current - 1, slides.length));
  }, [slides.length]);

  const enterPresentationMode = React.useCallback(async (landscape = false) => {
    if (typeof document === "undefined" || !stageRef.current) {
      return;
    }

    document.activeElement?.blur?.();
    setControlsVisible(true);
    setIsLandscapeMode(landscape);

    try {
      await requestNativeFullscreen(stageRef.current);
      setIsFallbackFullscreen(false);
      setIsNativeFullscreen(true);

      if (landscape) {
        await lockLandscapeOrientation();
      }

      return;
    } catch {
      setIsFallbackFullscreen(true);
      setIsNativeFullscreen(false);
    }
  }, []);

  const leavePresentationMode = React.useCallback(async () => {
    unlockOrientation();
    setIsLandscapeMode(false);
    setIsFallbackFullscreen(false);

    if (getFullscreenElement()) {
      try {
        await exitNativeFullscreen();
      } catch {
        // Browser-level fullscreen exit can reject if the state changed first.
      }
    }

    setIsNativeFullscreen(false);
  }, []);

  const toggleFullscreen = React.useCallback(async () => {
    if (isPresentationMode) {
      await leavePresentationMode();
      return;
    }

    await enterPresentationMode(false);
  }, [enterPresentationMode, isPresentationMode, leavePresentationMode]);

  const toggleLandscapeMode = React.useCallback(async () => {
    if (isLandscapeMode) {
      unlockOrientation();
      setIsLandscapeMode(false);
      return;
    }

    if (!isPresentationMode) {
      await enterPresentationMode(true);
      return;
    }

    setIsLandscapeMode(true);
    await lockLandscapeOrientation();
  }, [enterPresentationMode, isLandscapeMode, isPresentationMode]);

  const showFullscreenControls = React.useCallback(() => {
    if (!isPresentationMode) {
      return;
    }

    window.clearTimeout(hideControlsTimerRef.current);
    setControlsVisible(true);
    hideControlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 1600);
  }, [isPresentationMode]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isStageFullscreen = getFullscreenElement() === stageRef.current;
      setIsNativeFullscreen(isStageFullscreen);

      if (!isStageFullscreen) {
        unlockOrientation();
        setIsLandscapeMode(false);
      }
    };

    fullscreenEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleFullscreenChange);
    });
    return () => {
      fullscreenEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handleFullscreenChange);
      });
    };
  }, []);

  React.useEffect(() => {
    if (!isPresentationMode) {
      window.clearTimeout(hideControlsTimerRef.current);
      setControlsVisible(true);
      return undefined;
    }

    showFullscreenControls();
    document.addEventListener("mousemove", showFullscreenControls);
    document.addEventListener("touchstart", showFullscreenControls);

    return () => {
      window.clearTimeout(hideControlsTimerRef.current);
      document.removeEventListener("mousemove", showFullscreenControls);
      document.removeEventListener("touchstart", showFullscreenControls);
    };
  }, [isPresentationMode, showFullscreenControls]);

  React.useEffect(() => {
    if (!isFallbackFullscreen) {
      return undefined;
    }

    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
    };
  }, [isFallbackFullscreen]);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.defaultPrevented ||
        document.querySelector("dialog[open], .search-dialog") ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      showFullscreenControls();

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goPrevious();
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        goToSlide(slides.length - 1);
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        toggleLandscapeMode();
      }

      if (event.key === "Escape" && isFallbackFullscreen) {
        event.preventDefault();
        leavePresentationMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    goNext,
    goPrevious,
    goToSlide,
    showFullscreenControls,
    isFallbackFullscreen,
    leavePresentationMode,
    slides.length,
    toggleFullscreen,
    toggleLandscapeMode,
  ]);

  React.useEffect(() => {
    setActiveIndex((current) => clampSlideIndex(current, slides.length));
  }, [slides.length]);

  React.useEffect(() => {
    const strip = slideStripRef.current;
    const thumbnail = activeThumbRef.current;
    if (!strip || !thumbnail) return;

    const targetLeft =
      thumbnail.offsetLeft - (strip.clientWidth - thumbnail.offsetWidth) / 2;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    strip.scrollTo({
      behavior: reduceMotion ? "auto" : "smooth",
      left: Math.max(0, targetLeft),
    });
  }, [activeIndex]);

  return {
    activeIndex,
    activeSlide,
    controlsVisible,
    isFallbackFullscreen,
    isLandscapeMode,
    isPresentationMode,
    stageRef,
    slideStripRef,
    activeThumbRef,
    goFirst,
    goNext,
    goPrevious,
    goToSlide,
    toggleFullscreen,
    toggleLandscapeMode,
    leavePresentationMode,
  };
}
