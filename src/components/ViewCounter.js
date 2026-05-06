import * as React from "react";
import {
  fetchCounterStats,
  formatCounterValue,
  getCanonicalCounterUrl,
  shouldRecordView,
} from "../utils/viewCounter";

const ViewCounterContext = React.createContext({
  status: "idle",
  stats: null,
});

const recentHits = new Map();
const duplicateHitWindowMs = 1500;

const getCurrentPathname = () => {
  if (typeof window === "undefined") {
    return "/";
  }

  return window.location.pathname || "/";
};

const shouldSuppressDuplicateHit = (counterUrl) => {
  const now = Date.now();
  const lastHitAt = recentHits.get(counterUrl) || 0;
  recentHits.set(counterUrl, now);
  return now - lastHitAt < duplicateHitWindowMs;
};

export const ViewCounterProvider = ({ children }) => {
  const [pathname, setPathname] = React.useState(getCurrentPathname);
  const [state, setState] = React.useState({
    status: "idle",
    stats: null,
  });

  React.useEffect(() => {
    const handleRouteUpdate = (event) => {
      setPathname(event.detail?.pathname || getCurrentPathname());
    };

    window.addEventListener("view-counter-route-update", handleRouteUpdate);

    return () => {
      window.removeEventListener(
        "view-counter-route-update",
        handleRouteUpdate,
      );
    };
  }, []);

  React.useEffect(() => {
    const counterUrl = getCanonicalCounterUrl(pathname);
    const controller = new AbortController();
    const record =
      shouldRecordView() && !shouldSuppressDuplicateHit(counterUrl);

    setState((currentState) => ({
      ...currentState,
      status: "loading",
    }));

    fetchCounterStats({
      pathname,
      record,
      signal: controller.signal,
    })
      .then((stats) => {
        setState({
          status: "ready",
          stats,
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }

        setState((currentState) => ({
          ...currentState,
          status: "error",
        }));
      });

    return () => controller.abort();
  }, [pathname]);

  return (
    <ViewCounterContext.Provider value={state}>
      {children}
    </ViewCounterContext.Provider>
  );
};

export const useViewCounter = () => React.useContext(ViewCounterContext);

export const SiteViewCounter = () => {
  const { stats, status } = useViewCounter();

  return (
    <span
      className="site-view-counter"
      data-counter-status={status}
      aria-label="Site view counter"
    >
      <span>
        visitors <strong>{formatCounterValue(stats?.siteUv)}</strong>
      </span>
      <span>
        views <strong>{formatCounterValue(stats?.sitePv)}</strong>
      </span>
    </span>
  );
};

export const PageViewCounter = () => {
  const { stats, status } = useViewCounter();

  return (
    <span className="page-view-counter" data-counter-status={status}>
      {formatCounterValue(stats?.pagePv)}
    </span>
  );
};
