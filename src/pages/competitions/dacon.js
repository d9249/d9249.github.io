import * as React from "react";
import Layout from "../../components/Layout";
import SectionHeading from "../../components/SectionHeading";
import {
  daconCompetitionItems,
  daconDomainSummary,
  daconStats,
} from "../../data/profile";

const DaconCompetitionsPage = () => (
  <Layout>
    <section className="shell section dacon-page">
      <SectionHeading kicker="DACON" title="DACON 경진대회" />

      <div className="dacon-hero">
        <div>
          <p className="dacon-lead">
            컴퓨터 비전, 정형 데이터, 자연어 처리, 시계열, 추천 시스템을
            넘나들며 쌓은 39개 대회 참가 이력입니다.
          </p>
          <a className="paper-link" href="https://dacon.io/myprofile/423689">
            DACON 프로필 보기 →
          </a>
        </div>
        <div className="dacon-stat-grid">
          {daconStats.map((item) => (
            <div className="dacon-stat-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="dacon-domain-grid" aria-label="DACON domain summary">
        {daconDomainSummary.map((item) => (
          <article className="dacon-domain-card" key={item.title}>
            <div className="meta">{item.title}</div>
            <strong>{item.count}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <div className="dacon-record-head">
        <div>
          <span className="section-kicker">Participation</span>
          <h2>39개 대회 참가이력</h2>
        </div>
      </div>

      <div className="dacon-record-list">
        {daconCompetitionItems.map((item, index) => (
          <article className="dacon-record" key={`${item.title}-${index}`}>
            <span className="dacon-record-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="dacon-record-body">
              <div className="dacon-record-meta">
                <span>{item.period}</span>
                <strong>{item.result}</strong>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="research-facts dacon-record-facts">
                {item.facts.map((fact) => (
                  <span key={fact}>{fact}</span>
                ))}
              </div>
              {item.href ? (
                <a className="paper-link" href={item.href}>
                  대회 보기 →
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  </Layout>
);

export default DaconCompetitionsPage;

export const Head = () => (
  <>
    <title>DACON Competitions | Mean Log</title>
    <meta
      name="description"
      content="이상민의 DACON 경진대회 39개 참가 이력과 주요 성과입니다."
    />
  </>
);
