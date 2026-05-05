import * as React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import SectionHeading from "../components/SectionHeading";
import {
  evidenceItems,
  profileTags,
  relatedNotes,
  timelineItems,
} from "../data/profile";

const IndexPage = ({ data }) => {
  const posts = data.posts.nodes;
  const latest = posts[0];

  return (
    <Layout>
      <section className="shell hero">
        <div>
          <p className="eyebrow">AI engineer and researcher</p>
          <h1>연구의 깊이를 제품 가치로 연결하는 AI 시스템 기록.</h1>
          <p className="hero-copy">
            이상민의 커리어, 연구, 엔터프라이즈 AI 구축 경험을 긴 글과 기술
            노트로 정리하는 개인 블로그입니다. Markdown 글을 올리면 목록,
            카테고리, 상세 페이지가 같은 시각 체계로 이어집니다.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" to="/blog/">
              블로그 글 읽기
            </Link>
            <Link className="button-secondary" to="/#career">
              커리어 증거 보기
            </Link>
          </div>
        </div>
        <aside className="terminal-card" aria-label="Profile summary">
          <div className="terminal-top">
            <div className="traffic">
              <span />
              <span />
              <span />
            </div>
            <span>profile/readme.md</span>
          </div>
          <div className="terminal-body">
            <p>
              <span className="cmd">$</span> whoami
            </p>
            <p>
              AI Engineer &amp; Researcher
              <br />
              Building Bridge between AI Research and Real-World Value
            </p>
            <div className="terminal-output">
              <div className="terminal-row">
                <span>focus</span>
                <strong>RAG / Multi-Agent / OCR</strong>
              </div>
              <div className="terminal-row">
                <span>recognition</span>
                <strong>CES 2025 Innovation</strong>
              </div>
              <div className="terminal-row">
                <span>current</span>
                <strong>AsianaIDT AI/ML</strong>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="shell section" aria-labelledby="proof-title">
        <SectionHeading
          kicker="Proof blocks"
          title="README를 이력서가 아니라 증거 패널로 재구성"
          description="방문자가 한 번에 스캔할 수 있도록 수상, 연구, 제품화, 벤치마크를 분리했습니다. 숫자는 기존 정적 페이지에 있던 내용만 사용했습니다."
        />
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
        <SectionHeading
          kicker="Career architecture"
          title="연구자와 제품 엔지니어 사이의 궤적"
          description="직무 특성은 연구 논문보다 넓고, 일반 백엔드보다 깊습니다. 그래서 경력 소개는 회사명 나열보다 문제 정의, AI 아키텍처, 운영 증거가 먼저 보이도록 구성했습니다."
        />
        <div className="career-layout">
          <aside className="profile-panel">
            <div className="avatar-large">SM</div>
            <h3>
              이상민
              <br />
              AI Engineer &amp; Researcher
            </h3>
            <p>
              연구의 깊이를 실제 제품 가치로 연결하는 AI 시스템 엔지니어. RAG,
              지식 그래프, 멀티 에이전트, 문서 OCR 복원 플랫폼을 중심으로 복잡한
              도메인 문제를 구조화합니다.
            </p>
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="shell section"
        id="trends"
        aria-labelledby="trend-title"
      >
        <SectionHeading
          kicker="Trend notes"
          title="트렌드 MD가 글이 되는 블로그 구조"
          description="`content/blog/<category>/<post>.md`에 글을 추가하면 Gatsby가 목록, 카테고리, 상세 글을 자동으로 생성합니다."
        />
        <div className="trend-grid">
          <div className="post-list">
            {posts.slice(0, 3).map((post) => (
              <article className="post-row" key={post.id}>
                <div>
                  <div className="meta">
                    content{post.fields.slug.slice(0, -1)}.md
                  </div>
                  <h3>
                    <Link to={post.fields.slug}>{post.frontmatter.title}</Link>
                  </h3>
                  <p>{post.frontmatter.description}</p>
                </div>
                <time className="post-date">{post.frontmatter.date}</time>
              </article>
            ))}
          </div>
          <aside className="markdown-panel">
            <div className="meta">Publishing model</div>
            <h3>MD 업로드 상태</h3>
            <p>
              글 작성자는 Markdown만 올리고, 블로그는 frontmatter와 본문을 읽어
              카드와 상세 화면으로 보여줍니다.
            </p>
            <div className="file-stack">
              <div className="file-item">
                <span>title</span>
                <span>Agentic RAG 운영</span>
              </div>
              <div className="file-item">
                <span>tags</span>
                <span>rag, agents, ops</span>
              </div>
              <div className="file-item">
                <span>render</span>
                <span className="status">ready</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {latest && (
        <section
          className="shell section"
          id="latest"
          aria-labelledby="latest-title"
        >
          <div className="article-shell">
            <article className="article">
              <div className="article-kicker">Latest article</div>
              <h2 id="latest-title">{latest.frontmatter.title}</h2>
              <p className="deck">{latest.frontmatter.description}</p>
              <div className="byline">
                <span>By {latest.frontmatter.author}</span>
                <span>AI Engineer &amp; Researcher</span>
                <span>{latest.frontmatter.date}</span>
                <span>{latest.timeToRead} min read</span>
              </div>
              <figure>
                <div className="hero-image" />
                <figcaption>
                  Markdown 원문이 기술 아티클로 렌더링되는 상세 화면의 시각
                  방향.
                </figcaption>
              </figure>
              <div className="article-body">
                <p>{latest.excerpt}</p>
                <p>
                  <Link className="button-primary" to={latest.fields.slug}>
                    전체 글 읽기
                  </Link>
                </p>
              </div>
              <div className="author-box" id="contact">
                <div className="avatar-large">SM</div>
                <div>
                  <div className="meta">Author</div>
                  <p>
                    Sangmin Lee는 RAG, 멀티 에이전트, 문서 OCR, 연구 벤치마크,
                    AI 제품 운영을 연결하는 AI Engineer &amp; Researcher입니다.
                    연락: dodo9249@gmail.com
                  </p>
                </div>
              </div>
            </article>

            <aside className="aside">
              <div className="toc">
                <div className="meta">On this site</div>
                <Link to="/#latest">00. latest article</Link>
                <Link to="/#career">01. career proof</Link>
                <Link to="/#trends">02. markdown flow</Link>
                <Link to="/contact/">03. author</Link>
              </div>
              <div className="source-card">
                <div className="meta">Source MD preview</div>
                <code>{`---
title: ${latest.frontmatter.title}
tags: [rag, agents, observability]
---`}</code>
              </div>
            </aside>
          </div>

          <div className="related-grid">
            {relatedNotes.map((note) => (
              <article className="related-card" key={note.title}>
                <div className="thumb" />
                <div className="meta">{note.category}</div>
                <h3>{note.title}</h3>
                <p>{note.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="shell section">
        <SectionHeading
          kicker="Posts"
          title="최근 글"
          description="AI 시스템을 실제 제품으로 옮길 때 생기는 판단, 운영, 보안, 벤치마크의 흔적을 남깁니다."
          action={<Link to="/blog/">전체 글 보기 -&gt;</Link>}
        />
        <div className="post-grid">
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
    <title>Mean Log - AI Research to Product Notes</title>
    <meta
      name="description"
      content="이상민의 AI 연구, 제품화, RAG, 문서 OCR, 운영형 AI 시스템 기록을 모으는 개인 기술 블로그입니다."
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
