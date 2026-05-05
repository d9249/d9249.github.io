import * as React from "react";

const themeScript = `
(function () {
  try {
    var storedTheme = window.localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : prefersDark
        ? "dark"
        : "light";
    document.documentElement.dataset.theme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <script
      key="theme-init"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />,
  ]);
};
