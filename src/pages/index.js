import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import ProjectGrid from "../components/ProjectGrid";
import SectionHeading from "../components/SectionHeading";
import SkillGrid from "../components/SkillGrid";
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
const PROFILE_ASCII = String.raw`               ..:.
           .=*###%##=.
          -%@%%###%%%#*+:
         :%@@@%@@@%%%%@@%*
        =%@@@@%%@@@@@@@@@@#
       :%%@%%%%%@@@@@@@@@%@*
       *%%%%%%%@@@%@@@@@%@@@:
      .%@@%#%%@@%%%@%%@@@@@@=
      .%@@%%#######%#*%@@@@@-
       #@@@@%%%%%###**%%@@@@:
       =%%@@%%%##++*##%@@@@#
        %%+=--==-..-=+++*#@+
        =#..--*=: .--*++=+#-.
       =:+:  .:.  .::::--+*=-
       .:+:       .-:...:++-
        ..:    .. .=-...-++.
         .-:.   :-=+-..:==:
           ::..  .:--::-+.
           ::..:===++--==
            -::..::---==.
            :=:....::-+=
            .==:..::-++-
            .:---=++++=-
            :..:--===--=
          .::...:::--::---:
        .+%:... ...::::-=*@*:
      =#%@@+  . ...:::::-#@@@*:
   -*%%%%%%%+    ......-#@@@@@@#=
-*%%%%%%%%%%@#=:....:-+%@@@@@%%@@%+:
%%%%%%%%%%%%@@@%%###%%@@@@@@@@@@@@@%
%%%%%%%%%%%@@@@@@@@@@@@@@@@@@@@@@@@@
%%%%@%%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@`;
const PROFILE_FACT_GROUPS = [
  {
    title: "Profile",
    items: [
      { label: "Name", value: "Sangmin Lee" },
      { label: "Role", value: "AI Engineer & Researcher" },
      { label: "Current", value: "AsianaIDT · AI/ML" },
      { label: "Focus", value: "RAG · Agents · OCR · Vision" },
    ],
  },
  {
    title: "Stack",
    items: [
      { label: "Languages", value: "Python · JavaScript" },
      { label: "AI / Data", value: "PyTorch · LangGraph · FastAPI" },
      { label: "Infra", value: "AWS · Docker · Kubernetes" },
    ],
  },
  {
    title: "Highlights",
    items: [
      { label: "Products", value: "AI products ×8" },
      { label: "Research", value: "SCIE Q2 ×3 · KCI ×2" },
      { label: "Awards", value: "CES 2025 · Minister ×2" },
    ],
  },
  {
    title: "Contact",
    items: [
      {
        label: "Email",
        value: "dodo9249@gmail.com",
        href: "mailto:dodo9249@gmail.com",
      },
      {
        label: "GitHub",
        value: "github.com/d9249",
        href: "https://github.com/d9249",
      },
    ],
  },
];
const getCardDecks = (items, deckSize = CARD_DECK_SIZE) =>
  Array.from({ length: Math.ceil(items.length / deckSize) }, (_, index) =>
    items.slice(index * deckSize, (index + 1) * deckSize),
  );

const getDeckLabel = (index, total) =>
  `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

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
        <aside className="terminal-card" aria-labelledby="whoami-title">
          <div className="terminal-top">
            <div className="traffic" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span>~/portfolio/whoami</span>
          </div>
          <div className="terminal-body whoami-body">
            <figure
              className="ascii-portrait"
              role="img"
              aria-label="이상민의 프로필 사진을 표현한 ASCII 아트"
            >
              <pre aria-hidden="true">{PROFILE_ASCII}</pre>
            </figure>
            <div className="whoami-profile">
              <p className="whoami-command">
                <span className="cmd">$</span> whoami
              </p>
              <p className="whoami-host" id="whoami-title">
                <strong>sangmin</strong>@d9249
                <span aria-hidden="true" />
              </p>
              {PROFILE_FACT_GROUPS.map((group) => (
                <section className="whoami-group" key={group.title}>
                  <h2>{group.title}</h2>
                  <dl className="whoami-facts">
                    {group.items.map((item) => (
                      <div className="whoami-fact" key={item.label}>
                        <dt>{item.label}</dt>
                        <span className="whoami-leader" aria-hidden="true" />
                        <dd>
                          {item.href ? (
                            <a href={item.href}>{item.value}</a>
                          ) : (
                            item.value
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
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
        <SectionHeading
          kicker="Skills"
          title="기술 스택"
          titleId="skills-title"
        />
        <SkillGrid groups={skillGroups} />
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
