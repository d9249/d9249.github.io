import * as React from "react";
import TipsIndex from "../../components/TipsIndex";

const WinOSTipsPage = () => <TipsIndex activeCategory="winos" />;

export default WinOSTipsPage;

export const Head = () => (
  <>
    <title>WinOS Tips</title>
    <meta
      name="description"
      content="Windows 환경에서 활용할 수 있는 응용프로그램과 로컬 도구를 정리합니다."
    />
  </>
);
