import * as React from "react";
import { graphql, Link } from "gatsby";
import {
  siAiohttp,
  siApachekafka,
  siConfluence,
  siDjango,
  siDocker,
  siElasticsearch,
  siFastapi,
  siGit,
  siGithubactions,
  siJira,
  siJavascript,
  siKibana,
  siKubernetes,
  siLangchain,
  siLanggraph,
  siLinux,
  siLogstash,
  siMilvus,
  siMongodb,
  siMysql,
  siNestjs,
  siNotion,
  siNumpy,
  siOpencv,
  siPandas,
  siPostgresql,
  siPostman,
  siPytorch,
  siPytest,
  siPython,
  siQdrant,
  siReact,
  siRedis,
  siScikitlearn,
  siStreamlit,
  siTensorflow,
  siUbuntu,
  siVuedotjs,
  siWeightsandbiases,
} from "simple-icons";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import ProjectGrid from "../components/ProjectGrid";
import SectionHeading from "../components/SectionHeading";
import { navItems } from "../data/navigation";
import {
  awardItems,
  competitionItems,
  evidenceItems,
  heroLinks,
  paperItems,
  skillGroups,
  timelineItems,
} from "../data/profile";
import { getProjectProfileTags } from "../utils/projectProfileTags";

const CARD_DECK_SIZE = 4;
const PROJECT_DECK_SIZE = 2;
const POST_DECK_SIZE = 3;
const SKILL_LOGOS = new Map([
  ["Linux (Ubuntu)", siUbuntu],
  ["Linux", siLinux],
  ["Python", siPython],
  ["JavaScript", siJavascript],
  ["React.js", siReact],
  ["Vue.js", siVuedotjs],
  ["Django", siDjango],
  ["Nest.js", siNestjs],
  ["Langchain", siLangchain],
  ["Langgraph", siLanggraph],
  ["PyTorch", siPytorch],
  ["NumPy", siNumpy],
  ["Pandas", siPandas],
  ["OpenCV", siOpencv],
  ["Scikit-learn", siScikitlearn],
  ["TensorFlow", siTensorflow],
  ["FastAPI", siFastapi],
  ["aiohttp", siAiohttp],
  ["Streamlit", siStreamlit],
  ["MySQL", siMysql],
  ["PostgreSQL", siPostgresql],
  ["MongoDB", siMongodb],
  ["Qdrant", siQdrant],
  ["Milvus", siMilvus],
  ["Redis", siRedis],
  ["Kafka", siApachekafka],
  ["Docker", siDocker],
  ["Docker-Compose", siDocker],
  ["Kubernetes", siKubernetes],
  ["Elasticsearch", siElasticsearch],
  ["Logstash", siLogstash],
  ["Kibana", siKibana],
  ["wandb", siWeightsandbiases],
  ["Git", siGit],
  ["Jira", siJira],
  ["Confluence", siConfluence],
  ["Postman", siPostman],
  ["Notion", siNotion],
  ["pytest", siPytest],
  ["Github Actions", siGithubactions],
]);
const SKILL_MARKS = new Map([
  ["Linux (Ubuntu)", "LX"],
  ["Windows", "WIN"],
  ["UNIX", "UX"],
  ["JavaScript", "JS"],
  ["React.js", "R"],
  ["Vue.js", "V"],
  ["Django", "DJ"],
  ["Nest.js", "N"],
  ["MyBatis", "MB"],
  ["Langsmith", "LS"],
  ["Langchain", "LC"],
  ["Langgraph", "LG"],
  ["PyTorch", "PT"],
  ["NumPy", "NP"],
  ["Pandas", "PD"],
  ["OpenCV", "CV"],
  ["Scikit-learn", "SK"],
  ["TensorFlow", "TF"],
  ["FastAPI", "FA"],
  ["PostgreSQL", "PG"],
  ["MongoDB", "MDB"],
  ["Qdrant", "QD"],
  ["AWS SageMaker", "AWS"],
  ["AWS CLI", "CLI"],
  ["Docker-Compose", "DC"],
  ["Kubernetes", "K8S"],
  ["Elasticsearch", "ES"],
  ["Github Actions", "GHA"],
]);

const getCardDecks = (items, deckSize = CARD_DECK_SIZE) =>
  Array.from({ length: Math.ceil(items.length / deckSize) }, (_, index) =>
    items.slice(index * deckSize, (index + 1) * deckSize),
  );

const getDeckLabel = (index, total) =>
  `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

const getReadableLogoColor = (hex) => {
  const normalizedHex = hex.padEnd(6, "0").slice(0, 6);
  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 150 ? "#101820" : "#ffffff";
};

const getSkillLogoStyle = (icon) => ({
  "--skill-logo-color": `#${icon.hex}`,
  "--skill-logo-contrast": getReadableLogoColor(icon.hex),
});

const getSkillMark = (skill) => {
  const knownMark = SKILL_MARKS.get(skill);

  if (knownMark) {
    return knownMark;
  }

  const words = skill
    .replace(/\([^)]*\)/g, "")
    .replace(/[./_-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return skill.slice(0, 2).toUpperCase();
  }

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const SkillChip = ({ skill }) => {
  const skillLogo = SKILL_LOGOS.get(skill);

  return (
    <li className={skillLogo ? "has-skill-logo" : undefined}>
      <span
        className="skill-logo-mark"
        style={skillLogo ? getSkillLogoStyle(skillLogo) : undefined}
        aria-hidden="true"
      >
        {skillLogo ? (
          <svg viewBox="0 0 24 24" focusable="false">
            <path d={skillLogo.path} />
          </svg>
        ) : (
          getSkillMark(skill)
        )}
      </span>
      <span className="skill-logo-name">{skill}</span>
    </li>
  );
};

const IndexPage = ({ data }) => {
  const posts = data.posts.nodes;
  const projects = data.projects.nodes;
  const profileTags = getProjectProfileTags(projects);
  const totalBlogPostCount = data.blogPosts.totalCount;
  const heroNavItems = navItems.filter((item) => item.showInHero);
  const paperDecks = getCardDecks(paperItems);
  const awardDecks = getCardDecks(awardItems);
  const projectDecks = getCardDecks(projects, PROJECT_DECK_SIZE);
  const postDecks = getCardDecks(posts, POST_DECK_SIZE);
  const [paperDeckIndex, setPaperDeckIndex] = React.useState(0);
  const [awardDeckIndex, setAwardDeckIndex] = React.useState(0);
  const [projectDeckIndex, setProjectDeckIndex] = React.useState(0);
  const [postDeckIndex, setPostDeckIndex] = React.useState(0);
  const activePaperDeck = paperDecks[paperDeckIndex] || [];
  const activeAwardDeck = awardDecks[awardDeckIndex] || [];
  const activeProjectDeck = projectDecks[projectDeckIndex] || [];
  const activePostDeck = postDecks[postDeckIndex] || [];
  const hasMultiplePaperDecks = paperDecks.length > 1;
  const hasMultipleAwardDecks = awardDecks.length > 1;
  const hasMultipleProjectDecks = projectDecks.length > 1;
  const hasMultiplePostDecks = postDecks.length > 1;
  const paperDeckLabel = getDeckLabel(paperDeckIndex, paperDecks.length);
  const awardDeckLabel = getDeckLabel(awardDeckIndex, awardDecks.length);
  const projectDeckLabel = getDeckLabel(projectDeckIndex, projectDecks.length);
  const postDeckLabel = getDeckLabel(postDeckIndex, postDecks.length);
  const projectDeckStatus = `Deck ${projectDeckLabel} · 2개씩 보기`;
  const postDeckStatus = `${postDeckLabel} · 블로그 전체 글 ${totalBlogPostCount}개`;
  const goToPreviousPaperDeck = () => {
    setPaperDeckIndex((currentIndex) =>
      currentIndex === 0 ? paperDecks.length - 1 : currentIndex - 1,
    );
  };
  const goToNextPaperDeck = () => {
    setPaperDeckIndex((currentIndex) =>
      currentIndex === paperDecks.length - 1 ? 0 : currentIndex + 1,
    );
  };
  const goToPreviousAwardDeck = () => {
    setAwardDeckIndex((currentIndex) =>
      currentIndex === 0 ? awardDecks.length - 1 : currentIndex - 1,
    );
  };
  const goToNextAwardDeck = () => {
    setAwardDeckIndex((currentIndex) =>
      currentIndex === awardDecks.length - 1 ? 0 : currentIndex + 1,
    );
  };
  const goToPreviousProjectDeck = () => {
    setProjectDeckIndex((currentIndex) =>
      currentIndex === 0 ? projectDecks.length - 1 : currentIndex - 1,
    );
  };
  const goToNextProjectDeck = () => {
    setProjectDeckIndex((currentIndex) =>
      currentIndex === projectDecks.length - 1 ? 0 : currentIndex + 1,
    );
  };
  const goToPreviousPostDeck = () => {
    setPostDeckIndex((currentIndex) =>
      currentIndex === 0 ? postDecks.length - 1 : currentIndex - 1,
    );
  };
  const goToNextPostDeck = () => {
    setPostDeckIndex((currentIndex) =>
      currentIndex === postDecks.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <Layout>
      <section className="shell hero">
        <div>
          <p className="eyebrow">AI Engineer &amp; Researcher</p>
          <h1>AI 연구를 제품 가치로 연결하는 엔지니어</h1>
          <p className="hero-copy">
            연구의 깊이를 RAG, 멀티 에이전트, Document AI, 운영 가능한
            플랫폼으로 번역합니다.
          </p>
          <nav
            className="hero-actions hero-button-actions"
            aria-label="Shortcut navigation"
          >
            {heroNavItems.map((item) => {
              const className =
                item.heroVariant === "primary"
                  ? "button-primary"
                  : "button-secondary";

              return item.reloadDocument ? (
                <a className={className} key={item.to} href={item.to}>
                  {item.heroLabel}
                </a>
              ) : (
                <Link className={className} key={item.to} to={item.to}>
                  {item.heroLabel}
                </Link>
              );
            })}
          </nav>
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
                <strong>RAG / Agents / OCR / Market Intel</strong>
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
              연구의 언어를 제품·운영·비즈니스 가치의 언어로 번역합니다.
              문제 정의, AI 아키텍처 설계, 백엔드, 관찰성, 배포, 검증까지
              이어지는 실제 시스템을 만드는 데 집중합니다.
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
        <div className="card-deck project-card-deck">
          <div className="card-deck-toolbar" aria-live="polite">
            <span className="card-deck-status">{projectDeckStatus}</span>
            <div className="card-deck-controls">
              <button
                type="button"
                aria-label="이전 프로젝트 덱 보기"
                disabled={!hasMultipleProjectDecks}
                onClick={goToPreviousProjectDeck}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="다음 프로젝트 덱 보기"
                disabled={!hasMultipleProjectDecks}
                onClick={goToNextProjectDeck}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
          <ProjectGrid
            className="card-deck-grid"
            key={projectDeckIndex}
            projects={activeProjectDeck}
          />
        </div>
      </section>

      <section
        className="shell section"
        id="research"
        aria-labelledby="research-title"
      >
        <SectionHeading
          kicker="Research"
          title="연구 목록"
          action={<Link to="/research/">전체 연구 보기 →</Link>}
        />
        <div className="card-deck">
          <div className="card-deck-toolbar" aria-live="polite">
            <span className="card-deck-status">Deck {paperDeckLabel}</span>
            <div className="card-deck-controls">
              <button
                type="button"
                aria-label="이전 연구 덱 보기"
                disabled={!hasMultiplePaperDecks}
                onClick={goToPreviousPaperDeck}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="다음 연구 덱 보기"
                disabled={!hasMultiplePaperDecks}
                onClick={goToNextPaperDeck}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
          <div className="paper-grid card-deck-grid" key={paperDeckIndex}>
            {activePaperDeck.map((item) => (
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
        <div className="card-deck">
          <div className="card-deck-toolbar" aria-live="polite">
            <span className="card-deck-status">Deck {awardDeckLabel}</span>
            <div className="card-deck-controls">
              <button
                type="button"
                aria-label="이전 수상 덱 보기"
                disabled={!hasMultipleAwardDecks}
                onClick={goToPreviousAwardDeck}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="다음 수상 덱 보기"
                disabled={!hasMultipleAwardDecks}
                onClick={goToNextAwardDeck}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
          <div className="recognition-grid card-deck-grid" key={awardDeckIndex}>
            {activeAwardDeck.map((item) => (
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

      <section
        className="shell section"
        id="skills"
        aria-labelledby="skills-title"
      >
        <SectionHeading kicker="Skills" title="기술 스택" />
        <div className="skill-grid">
          {skillGroups.map((group) => (
            <article
              className="skill-card"
              key={group.title}
              aria-label={`${group.title}: ${group.summary}`}
            >
              <h3>{group.title}</h3>
              {group.skillClusters?.length ? (
                <div className="skill-cluster-list">
                  {group.skillClusters.map((cluster) => (
                    <section className="skill-cluster" key={cluster.title}>
                      <h4>{cluster.title}</h4>
                      <ul className="skill-list">
                        {cluster.skills.map((skill) => (
                          <SkillChip key={skill} skill={skill} />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ) : (
                <ul className="skill-list">
                  {group.skills.map((skill) => (
                    <SkillChip key={skill} skill={skill} />
                  ))}
                </ul>
              )}
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
          title="최근 지식"
          action={<Link to="/blog/">전체 지식 보기 →</Link>}
        />
        <div className="card-deck">
          <div className="card-deck-toolbar" aria-live="polite">
            <span className="card-deck-status">Deck {postDeckStatus}</span>
            <div className="card-deck-controls">
              <button
                type="button"
                aria-label="이전 최근 지식 덱 보기"
                disabled={!hasMultiplePostDecks}
                onClick={goToPreviousPostDeck}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="다음 최근 지식 덱 보기"
                disabled={!hasMultiplePostDecks}
                onClick={goToNextPostDeck}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
          <div
            className="post-grid compact-posts card-deck-grid"
            key={postDeckIndex}
          >
            {activePostDeck.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
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
    blogPosts: allMarkdownRemark(
      filter: {
        fields: { contentType: { eq: "blog-post" } }
        frontmatter: { draft: { ne: true } }
      }
    ) {
      totalCount
    }
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
