import * as React from "react";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import { profileTags } from "../data/profile";

const ContactPage = () => (
  <Layout>
    <section className="shell section">
      <SectionHeading
        kicker="Contact"
        title="연구와 제품 사이의 긴 글을 남기는 사람"
        description="RAG, 멀티 에이전트, 문서 OCR, 운영형 AI 시스템, 연구 벤치마크를 제품 언어로 번역하는 일을 합니다."
      />
      <div className="career-layout">
        <aside className="profile-panel">
          <div className="avatar-large">SM</div>
          <h3>
            Sangmin Lee
            <br />
            AI Engineer &amp; Researcher
          </h3>
          <p>dodo9249@gmail.com</p>
          <div className="tag-cloud">
            {profileTags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </aside>
        <div className="timeline">
          <article className="timeline-item">
            <div className="timeline-date">focus</div>
            <div>
              <h3>Research to Product</h3>
              <p>
                논문, 벤치마크, 실험 코드를 실제 사용자가 신뢰할 수 있는 업무
                흐름과 운영 지표로 연결합니다.
              </p>
            </div>
          </article>
          <article className="timeline-item">
            <div className="timeline-date">writing</div>
            <div>
              <h3>Public Notes</h3>
              <p>
                최신 기술 뉴스 요약보다 한 단계 더 들어가서, 실제 제품과 연구
                플랫폼에 적용할 때 무엇이 바뀌는지 기록합니다.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </Layout>
);

export default ContactPage;

export const Head = () => (
  <>
    <title>Contact | Mean Log</title>
    <meta
      name="description"
      content="Mean Log 작성자 Sangmin Lee 연락 및 소개 페이지입니다."
    />
  </>
);
