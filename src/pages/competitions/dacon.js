import * as React from "react";
import Layout from "../../components/Layout";
import { PageHeader } from "../../components/ui";
import {
  daconCompetitionItems,
  daconDomainSummary,
  daconStats,
} from "../../data/profile";

const domainMax = Math.max(
  ...daconDomainSummary.map((item) => parseInt(item.count, 10) || 0),
);

// "101 / 748" → 13.5 (the share of entrants placed above, in %)
const percentile = (result) => {
  const m = String(result).match(/(\d[\d,]*)\s*\/\s*(\d[\d,]*)/);
  if (!m) return null;
  const rank = Number(m[1].replace(/,/g, "")),
    total = Number(m[2].replace(/,/g, ""));
  return total ? Math.max(0.1, Math.round((rank / total) * 1000) / 10) : null;
};

const DaconCompetitionsPage = () => (
  <Layout>
    <section className="shell dacon-page">
      <PageHeader
        slate={{
          label: "DACON",
          count: daconCompetitionItems.length,
          unit: "competitions",
        }}
        title="DACON 경진대회"
        lead="컴퓨터 비전, 정형 데이터, 자연어 처리, 시계열, 추천 시스템을 넘나들며 쌓은 39개 대회 참가 이력입니다."
        actions={
          <a className="paper-link" href="https://dacon.io/myprofile/423689">
            DACON 프로필 보기 →
          </a>
        }
        aside={
          <dl className="stat-tiles">
            {daconStats.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        }
      />

      <section className="dacon-domains" aria-labelledby="dacon-domains-title">
        <h2 id="dacon-domains-title" className="research-h">
          분야별 대회 수
        </h2>
        <ul className="bar-rows">
          {daconDomainSummary.map((item) => {
            const n = parseInt(item.count, 10) || 0;
            return (
              <li key={item.title} style={{ "--k": n / domainMax }}>
                <b>{item.title}</b>
                <span className="bar-rows-bar" aria-hidden="true">
                  <i />
                </span>
                <span className="bar-rows-n">{n}</span>
                <p>{item.description}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="dacon-records" aria-labelledby="dacon-records-title">
        <h2 id="dacon-records-title" className="research-h">
          참가 이력 <span>{daconCompetitionItems.length}</span>
        </h2>
        <div className="dacon-rows">
          {daconCompetitionItems.map((item, index) => {
            const pct = percentile(item.result);
            return (
              <article className="dacon-row" key={`${item.title}-${index}`}>
                <p className="dacon-row-period">{item.period}</p>
                <div className="dacon-row-main">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <ul className="paper-row-facts">
                    {item.facts.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                  {item.href ? (
                    <a className="paper-link" href={item.href}>
                      대회 보기 →
                    </a>
                  ) : null}
                </div>
                <p className="dacon-row-rank">
                  <b>{item.result}</b>
                  {pct != null ? <small>상위 {pct}%</small> : null}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  </Layout>
);

export default DaconCompetitionsPage;

export const Head = () => (
  <>
    <title>DACON Competitions</title>
    <meta
      name="description"
      content="이상민의 DACON 경진대회 39개 참가 이력과 주요 성과입니다."
    />
  </>
);
