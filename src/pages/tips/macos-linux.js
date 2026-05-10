import * as React from "react";
import TipsIndex from "../../components/TipsIndex";

const MacOSLinuxTipsPage = () => <TipsIndex activeCategory="macos-linux" />;

export default MacOSLinuxTipsPage;

export const Head = () => (
  <>
    <title>macOS / Linux Tips</title>
    <meta
      name="description"
      content="macOS와 Linux에서 활용할 수 있는 응용프로그램과 로컬 도구를 정리합니다."
    />
  </>
);
