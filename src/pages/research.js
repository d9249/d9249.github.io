import * as React from "react";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import { paperItems } from "../data/profile";

const researchStats = [
  {
    label: "SCIE",
    value: paperItems.filter((item) => item.type === "SCIE Journal").length,
    description:
      "추천 시스템과 의료영상 딥러닝을 중심으로 SCIE 저널 논문을 발표했습니다.",
  },
  {
    label: "KCI",
    value: paperItems.filter((item) => item.type === "KCI Journal").length,
    description: "국내 저널에서 추천 시스템과 의료영상 분할 연구를 다뤘습니다.",
  },
  {
    label: "Conference",
    value: paperItems.filter((item) => item.type.includes("Conference")).length,
    description:
      "국제/국내 학회에서 추천, 의료영상, 이상탐지, 교통 예측 연구를 발표했습니다.",
  },
];

const ResearchPage = () => (
  <Layout>
    <section className="shell project-detail-hero">
      <div className="project-detail-hero-grid">
        <div>
          <p className="eyebrow">Research</p>
          <h1>논문 및 연구 성과</h1>
          <p className="project-detail-copy">
            그래프 추천 시스템, 의료영상 딥러닝, 이상탐지와 응용 AI를 중심으로
            진행한 학위논문, 저널, 학회 논문 목록입니다.
          </p>
        </div>
        <aside className="project-detail-facts" aria-label="Research facts">
          <div>
            <span>total papers</span>
            <strong>{paperItems.length}</strong>
          </div>
          <div>
            <span>journal papers</span>
            <strong>
              {
                paperItems.filter((item) => item.type.includes("Journal"))
                  .length
              }
            </strong>
          </div>
          <div>
            <span>primary areas</span>
            <strong>Recommendation / Medical Imaging / GNN</strong>
          </div>
        </aside>
      </div>
    </section>

    <section className="shell section">
      <SectionHeading kicker="Overview" title="연구 요약" />
      <div className="evidence-grid">
        {researchStats.map((item) => (
          <article className="evidence-card" key={item.label}>
            <div className="meta">{item.label}</div>
            <div className="value">{item.value}</div>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="shell section">
      <SectionHeading kicker="Publications" title="전체 논문 리스트" />
      <div className="paper-grid">
        {paperItems.map((item) => (
          <article className="paper-card" key={item.title}>
            <div className="paper-card-top">
              <div className="meta">{item.type}</div>
              <span>{item.year}</span>
            </div>
            <h3>{item.title}</h3>
            <div className="paper-venue">{item.venue}</div>
            <p>{item.description}</p>
            <div className="research-facts">
              {item.facts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>
            {item.href ? (
              <a className="paper-link" href={item.href}>
                {item.linkLabel || "논문 보기"} →
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  </Layout>
);

export default ResearchPage;

export const Head = () => (
  <>
    <title>Research</title>
    <meta
      name="description"
      content="이상민의 학위논문, SCIE, KCI, 국제/국내 학회 논문과 연구 성과 목록입니다."
    />
  </>
);
