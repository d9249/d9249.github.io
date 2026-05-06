import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import ProjectGrid from "../components/ProjectGrid";
import SectionHeading from "../components/SectionHeading";
import {
  awardItems,
  competitionItems,
  evidenceItems,
  heroLinks,
  paperItems,
  profileTags,
  projectItems,
  skillGroups,
  timelineItems,
} from "../data/profile";

const IndexPage = ({ data }) => {
  const posts = data.posts.nodes;

  return (
    <Layout>
      <section className="shell hero">
        <div>
          <p className="eyebrow">Sangmin Lee</p>
          <h1>이상향을 추구하는 엔지니어</h1>
          <p className="hero-copy">
            인공지능 연구 결과와 기술을 제품으로 연결하는 AI 연구원입니다.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" to="/projects/">
              프로젝트 보기
            </Link>
            <Link className="button-secondary" to="/blog/">
              블로그 글 읽기
            </Link>
          </div>
          <div className="link-row" aria-label="Profile links">
            {heroLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <aside className="terminal-card" aria-label="Profile summary">
          <div className="terminal-top">
            <div className="traffic">
              <span />
              <span />
              <span />
            </div>
            <span>portfolio/profile.js</span>
          </div>
          <div className="terminal-body">
            <p>
              <span className="cmd">$</span> whoami
            </p>
            <p>
              Sangmin Lee
              <br />
              AI Engineer &amp; Researcher
            </p>
            <div className="terminal-output">
              <div className="terminal-row">
                <span>current</span>
                <strong>AsianaIDT AI/ML</strong>
              </div>
              <div className="terminal-row">
                <span>focus</span>
                <strong>RAG / Agents / OCR / Recommender</strong>
              </div>
              <div className="terminal-row">
                <span>recognition</span>
                <strong>CES 2025 / Minister Award</strong>
              </div>
              <div className="terminal-row">
                <span>research</span>
                <strong>SCIE 3 / KCI 2</strong>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="shell section" aria-labelledby="proof-title">
        <SectionHeading kicker="Highlights" title="주요 성과" />
        <div className="evidence-grid">
          {evidenceItems.map((item) => (
            <article className="evidence-card" key={item.label}>
              <div className="meta">{item.label}</div>
              <div className="value">{item.value}</div>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="shell section"
        id="career"
        aria-labelledby="career-title"
      >
        <SectionHeading kicker="Experience" title="실무 및 연구 경력" />
        <div className="career-layout">
          <aside className="profile-panel">
            <div className="avatar-large">SM</div>
            <h3>
              이상민
              <br />
              AI Engineer &amp; Researcher
            </h3>
            <p>
              AI 연구와 제품 개발의 접점을 다룹니다. 논문, 벤치마크, 모델링,
              백엔드, 관찰성, 배포까지 이어지는 실제 시스템을 만드는 데
              집중합니다.
            </p>
            <dl className="profile-facts">
              <div>
                <dt>email</dt>
                <dd>dodo9249@gmail.com</dd>
              </div>
              <div>
                <dt>research</dt>
                <dd>SCIE 3 / KCI 2</dd>
              </div>
              <div>
                <dt>domain</dt>
                <dd>Enterprise AI / Document AI / Recommender</dd>
              </div>
            </dl>
            <div className="tag-cloud">
              {profileTags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </aside>
          <div className="timeline">
            {timelineItems.map((item) => (
              <article
                className="timeline-item"
                key={`${item.date}-${item.title}`}
              >
                <div className="timeline-date">{item.date}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <ul className="timeline-bullets">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="shell section"
        id="projects"
        aria-labelledby="projects-title"
      >
        <SectionHeading
          kicker="Projects"
          title="프로젝트"
          action={<Link to="/projects/">전체 프로젝트 보기 →</Link>}
        />
        <ProjectGrid projects={projectItems} />
      </section>

      <section
        className="shell section"
        id="research"
        aria-labelledby="research-title"
      >
        <SectionHeading
          kicker="Research"
          title="논문 리스트"
          action={<Link to="/research/">전체 논문 보기 →</Link>}
        />
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

      <section
        className="shell section"
        id="awards"
        aria-labelledby="awards-title"
      >
        <SectionHeading
          kicker="Awards"
          title="수상 기록"
          action={<Link to="/awards/">전체 수상 보기 →</Link>}
        />
        <div className="recognition-grid">
          {awardItems.slice(0, 4).map((item) => (
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
            </article>
          ))}
        </div>
      </section>

      <section
        className="shell section"
        id="competitions"
        aria-labelledby="competitions-title"
      >
        <SectionHeading
          kicker="Competitions"
          title="대회 및 외부 활동"
          action={<Link to="/competitions/">전체 대회 보기 →</Link>}
        />
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
              {item.href ? (
                <a className="paper-link" href={item.href}>
                  활동 보기 →
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section
        className="shell section"
        id="skills"
        aria-labelledby="skills-title"
      >
        <SectionHeading kicker="Skills" title="기술 스택" />
        <div className="skill-grid">
          {skillGroups.map((group) => (
            <article className="skill-card" key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.summary}</p>
              <ul className="skill-list">
                {group.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
              {group.contexts?.length ? (
                <ul className="skill-context-list">
                  {group.contexts.map((context) => (
                    <li key={context}>{context}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section
        className="shell section"
        id="latest"
        aria-labelledby="latest-title"
      >
        <SectionHeading
          kicker="Blog"
          title="최근 글"
          action={<Link to="/blog/">전체 글 보기 →</Link>}
        />
        <div className="post-grid compact-posts">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default IndexPage;

export const Head = () => (
  <>
    <title>이상민</title>
    <meta
      name="description"
      content="이상민의 AI 연구, 엔터프라이즈 RAG, 문서 OCR, 추천 시스템, 의료영상 연구, CES 수상 제품 개발 경험을 정리한 포트폴리오입니다."
    />
  </>
);

export const query = graphql`
  query HomePage {
    posts: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "blog-post" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
      limit: 6
    ) {
      nodes {
        id
        excerpt(pruneLength: 240)
        timeToRead
        fields {
          slug
          category
        }
        frontmatter {
          title
          date(formatString: "YYYY.MM.DD")
          description
          author
          category
          tags
        }
      }
    }
  }
`;
