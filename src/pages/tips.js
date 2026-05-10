import * as React from "react";
import TipsIndex from "../components/TipsIndex";

const TipsPage = () => <TipsIndex />;

export default TipsPage;

export const Head = () => (
  <>
    <title>Tips</title>
    <meta
      name="description"
      content="새로 등장하는 응용프로그램과 로컬 도구를 플랫폼별로 정리합니다."
    />
  </>
);
