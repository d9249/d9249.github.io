import * as React from "react";
import Layout from "../components/Layout";
import { Button, Card, Label } from "../components/ui";

const NotFoundPage = () => (
  <Layout>
    <section className="shell section">
      <Card className="empty-state">
        <Label kicker>404</Label>
        <h1>
          페이지를 <span className="phrase-nowrap">찾을 수 없습니다.</span>
        </h1>
        <p>주소가 바뀌었거나 아직 공개되지 않은 글일 수 있습니다.</p>
        <p>
          <Button variant="primary" to="/blog/">
            글 목록으로 이동
          </Button>
        </p>
      </Card>
    </section>
  </Layout>
);

export default NotFoundPage;

export const Head = () => <title>404</title>;
