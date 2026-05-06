const DEFAULT_COUNTER_ENDPOINT = "https://bsz.saop.cc/api";
const DEFAULT_SITE_URL = "https://d9249.github.io";

export const counterEndpoint =
  process.env.GATSBY_VIEW_COUNTER_ENDPOINT || DEFAULT_COUNTER_ENDPOINT;

export const counterSiteUrl =
  process.env.GATSBY_COUNTER_SITE_URL || DEFAULT_SITE_URL;

const getSiteOrigin = () => {
  try {
    return new URL(counterSiteUrl).origin;
  } catch (error) {
    return DEFAULT_SITE_URL;
  }
};

const normalizePathname = (pathname) => {
  if (!pathname) {
    return "/";
  }

  const [pathWithoutHash] = pathname.split("#");
  const [pathWithoutQuery] = pathWithoutHash.split("?");
  const normalizedPath = pathWithoutQuery.startsWith("/")
    ? pathWithoutQuery
    : `/${pathWithoutQuery}`;

  return normalizedPath || "/";
};

export const getCanonicalCounterUrl = (pathname) => {
  if (/^https?:\/\//i.test(pathname)) {
    const url = new URL(pathname);
    url.hash = "";
    url.search = "";
    return url.toString();
  }

  return `${getSiteOrigin()}${normalizePathname(pathname)}`;
};

export const shouldRecordView = () => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.location.hostname === new URL(counterSiteUrl).hostname;
  } catch (error) {
    return false;
  }
};

export const formatCounterValue = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("ko-KR").format(value);
};

const parseCounterValue = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const fetchCounterStats = async ({
  pathname,
  record = false,
  signal,
}) => {
  const response = await fetch(counterEndpoint, {
    method: record ? "POST" : "GET",
    credentials: "include",
    headers: {
      "x-bsz-referer": getCanonicalCounterUrl(pathname),
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`View counter request failed: ${response.status}`);
  }

  const payload = await response.json();
  const data = payload.data || payload;

  return {
    pagePv: parseCounterValue(data.page_pv),
    sitePv: parseCounterValue(data.site_pv),
    siteUv: parseCounterValue(data.site_uv),
  };
};
