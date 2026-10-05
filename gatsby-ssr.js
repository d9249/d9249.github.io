import * as React from "react";

const themeScript = `
(function () {
  var storedTheme = null;
  try {
    storedTheme = window.localStorage.getItem("theme");
  } catch (error) {
    storedTheme = null;
  }
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : prefersDark
      ? "dark"
      : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
`;

export const onRenderBody = ({ setHeadComponents, setHtmlAttributes }) => {
  setHtmlAttributes({ lang: "ko" });
  setHeadComponents([
    // the site mark (i) — sources and the raster build in scripts/brand/
    <link key="favicon-ico" rel="icon" href="/favicon.ico" sizes="32x32" />,
    <link key="favicon" rel="icon" href="/favicon.svg" type="image/svg+xml" />,
    <link
      key="apple-touch-icon"
      rel="apple-touch-icon"
      href="/apple-touch-icon.png"
    />,
    <link key="manifest" rel="manifest" href="/site.webmanifest" />,
    <link
      key="fonts-pre"
      rel="preconnect"
      href="https://fonts.googleapis.com"
    />,
    <link
      key="fonts-pre-static"
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link
      key="fonts"
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
    />,
    <meta key="color-scheme" name="color-scheme" content="light dark" />,
    <script
      key="theme-init"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />,
  ]);
};

// Gatsby는 기본적으로 전역 CSS 전체를 모든 HTML에 <style>로 인라인한다.
// 페이지가 1,400개를 넘어가면서 168KB CSS × 전 페이지 = 240MB 이상이 되어
// Pages 배포 아티팩트가 300MB를 넘겼고, actions/deploy-pages의 최대 대기
// 시간(10분, 하드 캡)을 초과해 배포 단계가 항상 실패했다.
// 인라인 대신 외부 스타일시트 링크로 바꾸면 HTML당 168KB가 사라지고
// 브라우저가 styles.css를 페이지 간 캐시한다.
export const onPreRenderHTML = ({
  getHeadComponents,
  replaceHeadComponents,
}) => {
  const headComponents = getHeadComponents().map((node) => {
    if (
      node?.type === "style" &&
      node.props?.["data-identity"] === "gatsby-global-css" &&
      node.props?.["data-href"]
    ) {
      return (
        <link
          key={node.props["data-href"]}
          rel="stylesheet"
          href={node.props["data-href"]}
        />
      );
    }
    return node;
  });

  replaceHeadComponents(headComponents);
};
