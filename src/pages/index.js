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
import { Sentences } from "../utils/sentences";

/*
 * Home: the eight-shot showreel (research → projects → skills → awards → evidence → numbers → cases
 * → contact), then the career timeline (#career) and the latest posts (#latest). Projects, research,
 * awards and competitions each have their own page; the reel links into them.
 */

// the credits after the reel's end card: one role per line — dates, the organisation set like a
// project name with the role under it, then what was done. On a phone the list of what was done
// stops at three, with a button for the rest.
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
      <h3 className="career-row-org">
        {org}
        {role ? <span className="career-row-role">{role}</span> : null}
      </h3>
      <div className="career-row-main">
        <p className="career-row-desc">
          <Sentences>{item.description}</Sentences>
        </p>
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
            label: "Credits",
            count: timelineItems.length,
            unit: "roles",
          }}
          title="실무 및 연구 경력"
          titleId="career-title"
        />
        <ol className="career-rows">
          {timelineItems.map((item) => (
            <CareerRow key={`${item.date}-${item.title}`} item={item} />
          ))}
        </ol>
        <div className="career-keys">
          <p className="career-keys-h">요약</p>
          <dl className="career-facts">
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
