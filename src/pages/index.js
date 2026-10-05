import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import MobileCardCarousel from "../components/MobileCardCarousel";
import PostRows from "../components/PostRows";
import SectionHeading from "../components/SectionHeading";
import Showreel from "../components/Showreel";
import { Chip } from "../components/ui";
import { timelineItems } from "../data/profile";
import { getProjectProfileTags } from "../utils/projectProfileTags";

/*
 * Home: the eight-shot showreel (research → projects → skills → awards → evidence → numbers → cases
 * → contact), then the career timeline (#career) and the latest posts (#latest). Projects, research,
 * awards and competitions each have their own page; the reel links into them.
 */

const TimelineCard = ({ item, compact = false }) => {
  const [expanded, setExpanded] = React.useState(false);
  const detailsId = React.useId();
  const hasMoreDetails = compact && item.bullets.length > 3;
  const visibleBullets =
    hasMoreDetails && !expanded ? item.bullets.slice(0, 3) : item.bullets;

  return (
    <article
      className={`timeline-item${compact ? " is-compact" : ""}${
        expanded ? " is-expanded" : ""
      }`}
    >
      <div className="timeline-date">{item.date}</div>
      <div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <ul className="timeline-bullets" id={detailsId}>
          {visibleBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        {hasMoreDetails ? (
          <button
            className="timeline-detail-toggle"
            type="button"
            aria-controls={detailsId}
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
          >
            <span>
              {expanded
                ? "간략히 보기"
                : `전체 ${item.bullets.length}개 항목 보기`}
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        ) : null}
      </div>
    </article>
  );
};

const IndexPage = ({ data }) => {
  const posts = data.posts.nodes;
  const projects = data.projects.nodes;
  const profileTags = getProjectProfileTags(projects);

  return (
    <Layout>
      <Showreel />

      <section
        className="shell section"
        id="career"
        aria-labelledby="career-title"
      >
        <SectionHeading
          kicker="Experience"
          title="실무 및 연구 경력"
          titleId="career-title"
        />
        <div className="career-layout responsive-desktop-only">
          <aside className="profile-panel">
            <div className="avatar-large">SM</div>
            <h3>
              이상민
              <br />
              AI Engineer &amp; Researcher
            </h3>
            <p>
              연구의 언어를 제품·운영·비즈니스 가치의 언어로 번역합니다. 문제
              정의, AI 아키텍처 설계, 백엔드, 관찰성, 배포, 검증까지 이어지는
              실제 시스템을 만드는 데 집중합니다.
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
                <dd>Knowledge AI / Safety RAG / OCR / Market Intel</dd>
              </div>
            </dl>
            <div className="tag-cloud">
              {profileTags.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
          </aside>
          <div className="timeline">
            {timelineItems.map((item) => (
              <TimelineCard key={`${item.date}-${item.title}`} item={item} />
            ))}
          </div>
        </div>
        <div className="mobile-career-layout">
          <MobileCardCarousel
            ariaLabel="모바일 실무 및 연구 경력"
            beforeCards={
              <div className="mobile-career-summary">
                <span className="avatar-large" aria-hidden="true">
                  SM
                </span>
                <div>
                  <strong>이상민</strong>
                  <span>AI Engineer &amp; Researcher</span>
                </div>
                <a href="mailto:dodo9249@gmail.com">Email</a>
              </div>
            }
            itemSelector=".timeline-item"
            statusLabel="경력 카드"
          >
            <div className="timeline mobile-carousel-track">
              {timelineItems.map((item) => (
                <TimelineCard
                  compact
                  key={`${item.date}-${item.title}`}
                  item={item}
                />
              ))}
            </div>
          </MobileCardCarousel>
        </div>
      </section>

      <section
        className="shell section"
        id="latest"
        aria-labelledby="latest-title"
      >
        <SectionHeading
          kicker="Blog"
          title="최근 지식"
          titleId="latest-title"
          action={<Link to="/blog/">전체 지식 보기 →</Link>}
        />
        <PostRows posts={posts} />
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
    projects: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "project" } }
        frontmatter: { draft: { ne: true } }
      }
      sort: { frontmatter: { periodOrder: DESC } }
    ) {
      nodes {
        id
        fields {
          slug
        }
        frontmatter {
          title
          projectName
          tagline
          period
          description
          metrics
          stack
          details
        }
      }
    }
  }
`;
