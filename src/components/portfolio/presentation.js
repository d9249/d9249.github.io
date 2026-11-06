const clampSlideIndex = (index, length) => {
  if (length === 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
};

const fullscreenEvents = [
  "fullscreenchange",
  "webkitfullscreenchange",
  "mozfullscreenchange",
  "MSFullscreenChange",
];

const getFullscreenElement = () => {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
};

const requestNativeFullscreen = (element) => {
  if (element.requestFullscreen) {
    return element.requestFullscreen({ navigationUI: "hide" });
  }

  if (element.webkitRequestFullscreen) {
    return element.webkitRequestFullscreen();
  }

  if (element.mozRequestFullScreen) {
    return element.mozRequestFullScreen();
  }

  if (element.msRequestFullscreen) {
    return element.msRequestFullscreen();
  }

  return Promise.reject(new Error("Fullscreen API is unavailable"));
};

const exitNativeFullscreen = () => {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }

  if (document.webkitExitFullscreen) {
    return document.webkitExitFullscreen();
  }

  if (document.mozCancelFullScreen) {
    return document.mozCancelFullScreen();
  }

  if (document.msExitFullscreen) {
    return document.msExitFullscreen();
  }

  return Promise.resolve();
};

const lockLandscapeOrientation = async () => {
  const orientation = window.screen?.orientation;

  if (!orientation?.lock) {
    return;
  }

  try {
    await orientation.lock("landscape");
  } catch {
    // Some mobile browsers only allow orientation locking in native fullscreen.
  }
};

const unlockOrientation = () => {
  const orientation = window.screen?.orientation;

  if (!orientation?.unlock) {
    return;
  }

  try {
    orientation.unlock();
  } catch {
    // Unsupported browsers simply keep the CSS landscape fallback.
  }
};

export {
  clampSlideIndex,
  fullscreenEvents,
  getFullscreenElement,
  requestNativeFullscreen,
  exitNativeFullscreen,
  lockLandscapeOrientation,
  unlockOrientation,
};
