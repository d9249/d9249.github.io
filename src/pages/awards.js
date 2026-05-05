import * as React from "react";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import { awardItems } from "../data/profile";

const AwardsPage = () => (
  <Layout>
    <section className="shell section recognition-page">
      <SectionHeading kicker="Awards" title="수상 기록" />
      <div className="recognition-grid">
        {awardItems.map((item) => (
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
                aria-label={`${item.title} 증빙 링크`}
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
                증빙 보기 →
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  </Layout>
);

export default AwardsPage;

export const Head = () => (
  <>
    <title>Awards | Mean Log</title>
    <meta
      name="description"
      content="이상민의 CES, 장관상, 학회 Best Paper, 논문경진대회 수상 기록입니다."
    />
  </>
);
