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
    <link key="favicon" rel="icon" href="/favicon.svg" type="image/svg+xml" />,
    <meta key="color-scheme" name="color-scheme" content="light dark" />,
    <script
      key="theme-init"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />,
  ]);
};
