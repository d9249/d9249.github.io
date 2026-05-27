import * as React from "react";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import { competitionItems } from "../data/profile";

const CompetitionsPage = () => (
  <Layout>
    <section className="shell section recognition-page">
      <SectionHeading kicker="Competitions" title="대회 및 외부 활동" />
      <div className="recognition-grid">
        {competitionItems.map((item) => (
          <article className="recognition-card" key={item.title}>
            <div className="meta">{item.period}</div>
            <h3>{item.title}</h3>
            <strong>{item.result}</strong>
            <p>{item.description}</p>
            <div className="research-facts">
              {item.facts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>
            {item.links?.length ? (
              <div
                className="research-links"
                aria-label={`${item.title} 관련 링크`}
              >
                {item.links.map((link) => (
                  <a key={link.href} href={link.href}>
                    {link.label} →
                  </a>
                ))}
              </div>
            ) : null}
            {item.href ? (
              <a className="paper-link" href={item.href}>
                활동 보기 →
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  </Layout>
);

export default CompetitionsPage;

export const Head = () => (
  <>
    <title>Competitions</title>
    <meta
      name="description"
      content="이상민의 HD현대 AI Challenge, LG Aimers, DACON, 가짜연구소, DIYA 등 대회와 외부 활동 기록입니다."
    />
  </>
);
