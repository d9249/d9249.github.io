import * as React from "react";
import { Link } from "gatsby";
import Layout from "../components/Layout";

const NotFoundPage = () => (
  <Layout>
    <section className="shell section">
      <div className="empty-state">
        <p className="eyebrow">404</p>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <p>주소가 바뀌었거나 아직 공개되지 않은 글일 수 있습니다.</p>
        <p>
          <Link className="button-primary" to="/blog/">
            글 목록으로 이동
          </Link>
        </p>
      </div>
    </section>
  </Layout>
);

export default NotFoundPage;

export const Head = () => <title>404</title>;
