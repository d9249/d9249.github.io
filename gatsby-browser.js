import "./src/styles/global.css";

const isProjectRoute = (pathname) =>
  pathname === "/projects/" || pathname?.startsWith("/projects/");

const scrollToTop = () => {
  window.scrollTo({
    behavior: "auto",
    left: 0,
    top: 0,
  });
};

const resetProjectScroll = () => {
  scrollToTop();
  window.requestAnimationFrame(scrollToTop);
  window.setTimeout(scrollToTop, 80);
  window.setTimeout(scrollToTop, 240);
};

export const onRouteUpdate = ({ location }) => {
  if (typeof window === "undefined") {
    return;
  }

  if (isProjectRoute(location?.pathname) && !location?.hash) {
    resetProjectScroll();
  }

  window.dispatchEvent(
    new CustomEvent("view-counter-route-update", {
      detail: {
        pathname: location?.pathname || "/",
      },
    }),
  );
};

export const shouldUpdateScroll = ({ routerProps }) => {
  const pathname = routerProps?.location?.pathname;

  if (isProjectRoute(pathname) && !routerProps?.location?.hash) {
    return false;
  }

  return true;
};
