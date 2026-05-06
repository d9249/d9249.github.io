import "./src/styles/global.css";

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
