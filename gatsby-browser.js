import "./src/styles/global.css";

const isProjectRoute = (pathname) =>
  pathname === "/projects/" || pathname?.startsWith("/projects/");

export const onRouteUpdate = ({ location }) => {
  if (typeof window === "undefined") {
    return;
  }

  if (isProjectRoute(location?.pathname) && !location?.hash) {
    window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
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
    return [0, 0];
  }

  return true;
};
