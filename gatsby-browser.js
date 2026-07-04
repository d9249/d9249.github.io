import "./src/styles/global.css";

const isProjectRoute = (pathname) =>
  pathname === "/projects/" || pathname?.startsWith("/projects/");

let projectScrollFrameId = null;
let projectScrollTimeoutIds = [];
let projectPopNavigation = false;

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    projectPopNavigation = true;
  });
}

const clearProjectScrollReset = () => {
  if (projectScrollFrameId !== null) {
    window.cancelAnimationFrame(projectScrollFrameId);
    projectScrollFrameId = null;
  }

  projectScrollTimeoutIds.forEach((timeoutId) => {
    window.clearTimeout(timeoutId);
  });
  projectScrollTimeoutIds = [];
};

const scheduleProjectScroll = ([left, top]) => {
  clearProjectScrollReset();
  window.scrollTo({
    behavior: "auto",
    left,
    top,
  });

  projectScrollFrameId = window.requestAnimationFrame(() => {
    projectScrollFrameId = null;
    window.scrollTo({
      behavior: "auto",
      left,
      top,
    });
  });
  projectScrollTimeoutIds = [
    window.setTimeout(() => {
      window.scrollTo({
        behavior: "auto",
        left,
        top,
      });
    }, 80),
    window.setTimeout(() => {
      window.scrollTo({
        behavior: "auto",
        left,
        top,
      });
    }, 240),
  ];
};

const resetProjectScroll = () => {
  scheduleProjectScroll([0, 0]);
};

const normalizeScrollPosition = (position) => {
  if (
    Array.isArray(position) &&
    Number.isFinite(position[0]) &&
    Number.isFinite(position[1])
  ) {
    return position;
  }

  return [0, 0];
};

const getProjectScrollKey = (location) =>
  `project-scroll:${location?.pathname || "/"}${location?.search || ""}`;

const readProjectScrollPosition = (location) => {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }

  try {
    const storedPosition = JSON.parse(
      window.sessionStorage.getItem(getProjectScrollKey(location)),
    );

    if (
      Array.isArray(storedPosition) &&
      Number.isFinite(storedPosition[0]) &&
      Number.isFinite(storedPosition[1])
    ) {
      return storedPosition;
    }
  } catch (error) {
    return null;
  }

  return null;
};

const saveProjectScrollPosition = (location) => {
  if (
    typeof window === "undefined" ||
    !window.sessionStorage ||
    !isProjectRoute(location?.pathname) ||
    location?.hash
  ) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getProjectScrollKey(location),
      JSON.stringify([window.scrollX, window.scrollY]),
    );
  } catch (error) {
    return;
  }
};

export const onPreRouteUpdate = ({ prevLocation }) => {
  saveProjectScrollPosition(prevLocation);
};

export const onRouteUpdate = ({ location }) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("view-counter-route-update", {
      detail: {
        pathname: location?.pathname || "/",
      },
    }),
  );
};

export const shouldUpdateScroll = ({ routerProps, getSavedScrollPosition }) => {
  const location = routerProps?.location;
  const pathname = location?.pathname;

  if (isProjectRoute(pathname) && !location?.hash) {
    if (location?.action === "POP" || projectPopNavigation) {
      projectPopNavigation = false;
      clearProjectScrollReset();
      const position =
        readProjectScrollPosition(location) ||
        normalizeScrollPosition(getSavedScrollPosition(location));

      scheduleProjectScroll(position);
      return position;
    }

    projectPopNavigation = false;
    resetProjectScroll();
    return [0, 0];
  }

  projectPopNavigation = false;
  clearProjectScrollReset();
  return true;
};
