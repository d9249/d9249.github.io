import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import { ChevronDown } from "lucide-react";
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

// one role: date in the margin, the organisation set like a project name, then what was done.
// On a phone the list of what was done stops at three, with a button for the rest.
const VISIBLE_ON_PHONE = 3;

const CareerRow = ({ item }) => {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();
  const [org, ...rest] = item.title.split(", ");
  const role = rest.join(", ");
  const more = item.bullets.length - VISIBLE_ON_PHONE;

  return (
    <li className={`career-row${open ? " is-open" : ""}`}>
      <p className="career-row-date">{item.date}</p>
      <div className="career-row-main">
        <h3 className="career-row-org">
          {org}
          {role ? <span className="career-row-role">{role}</span> : null}
        </h3>
        <p className="career-row-desc">{item.description}</p>
        <ul className="career-row-work" id={listId}>
          {item.bullets.map((bullet, i) => (
            <li
              key={bullet}
              className={i >= VISIBLE_ON_PHONE ? "is-more" : undefined}
            >
              {bullet}
            </li>
          ))}
        </ul>
        {more > 0 ? (
          <button
            className="career-row-toggle"
            type="button"
            aria-controls={listId}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <span>{open ? "접기" : `${more}개 더 보기`}</span>
            <ChevronDown aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </li>
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
        className="shell section career"
        id="career"
        aria-labelledby="career-title"
      >
        <SectionHeading
          slate={{
            label: "Career",
            count: timelineItems.length,
            unit: "roles",
          }}
          title="실무 및 연구 경력"
          titleId="career-title"
        />
        <div className="career-grid">
          <aside className="career-profile" aria-label="프로필">
            <p className="career-name">
              이상민<span>Sangmin Lee</span>
            </p>
            <p className="career-role">AI Engineer &amp; Researcher</p>
            <p className="career-bio">
              연구의 언어를 제품·운영·비즈니스 가치의 언어로 번역합니다. 문제
              정의, AI 아키텍처 설계, 백엔드, 관찰성, 배포, 검증까지 이어지는
              실제 시스템을 만드는 데 집중합니다.
            </p>
            <dl className="career-facts">
              <div>
                <dt>email</dt>
                <dd>
                  <a href="mailto:dodo9249@gmail.com">dodo9249@gmail.com</a>
                </dd>
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
            <div className="career-tags">
              {profileTags.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
          </aside>
          <ol className="career-rows">
            {timelineItems.map((item) => (
              <CareerRow key={`${item.date}-${item.title}`} item={item} />
            ))}
          </ol>
        </div>
      </section>

      <section
        className="shell section"
        id="latest"
        aria-labelledby="latest-title"
      >
        <SectionHeading
          slate={{ label: "Blog", count: posts.length, unit: "latest" }}
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
