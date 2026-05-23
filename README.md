# ideal

`d9249.github.io`는 이상민의 AI 연구, 제품 개발 경험, 프로젝트 증거를
정리하는 Gatsby 기반 개인 기술 블로그이자 포트폴리오 사이트입니다.

배포 주소: https://d9249.github.io

## What This Site Contains

- AI Engineer & Researcher 프로필 홈
- RAG, Document AI, multi-agent, 추천 시스템 중심 프로젝트 아카이브
- 논문, 수상, 대회, 기술 스택, 경력 타임라인
- Markdown 기반 기술 블로그와 프로젝트 사례
- Keynote에서 export한 발표용 포트폴리오 슬라이드 뷰어

주요 화면은 `src/pages/` 아래에 있으며 홈, 프로젝트, 연구, 수상, 대회,
포트폴리오, 블로그, 연락처 페이지로 구성됩니다.

## Tech Stack

- Gatsby 5
- React 18
- MarkdownRemark 기반 블로그/프로젝트 사례
- Busuanzi 호환 카운터 API 기반 방문자/글 조회수 표시
- GitHub Pages 배포
- Prettier formatting

## Project Structure

```text
content/blog/<category>/<post>.md        Markdown blog posts
content/projects/<project>.md            Markdown project case studies
src/components/                          Shared React components
src/data/profile.js                      Profile, awards, papers, competitions data
src/data/categories.json                 Blog category navigation and generated category pages
src/data/portfolioSlides.json            Generated portfolio slide manifest
src/pages/                               Gatsby page routes
src/templates/                           Blog and project templates
src/styles/global.css                    Site-wide design system
src/utils/tags.js                        Blog tag slug helpers
static/portfolio/slides/                 Exported portfolio slide images
static/evidence/                         Public evidence files
scripts/portfolio/export-keynote.js      Local Keynote-to-web export script
.github/workflows/github-pages.yml       GitHub Pages deployment workflow
```

## Setup

Node.js 20 is used in the GitHub Actions build.

```bash
npm ci
npm run develop
```

Local development runs on Gatsby's default development server, usually
`http://localhost:8000`.

## Commands

```bash
npm run develop          # Start local Gatsby development server
npm run build            # Build static site into public/
npm run serve            # Serve the built Gatsby site locally
npm run clean            # Clear Gatsby cache and generated artifacts
npm run format           # Format JS, JSON, Markdown, CSS, and YAML files
npm run portfolio:export # Export local Keynote portfolio slides
```

## View Counter

사이트 하단에는 전체 방문자 수와 전체 페이지뷰가 표시되고, 각 블로그 글의
`Post Info`에는 해당 글의 조회수가 표시됩니다.

정적 GitHub Pages는 런타임에 자체적으로 카운트를 저장할 수 없으므로
Busuanzi 호환 API를 사용합니다. 기본 엔드포인트는
`https://bsz.saop.cc/api`이며, 프로덕션 도메인(`d9249.github.io`)에서만
실제 카운트가 증가합니다. 로컬 개발 서버에서는 기존 값을 읽기만 해서 테스트
중 조회수가 오염되지 않습니다.

필요하면 빌드 환경 변수로 교체할 수 있습니다.

```bash
GATSBY_VIEW_COUNTER_ENDPOINT=https://your-counter.example/api npm run build
GATSBY_COUNTER_SITE_URL=https://your-domain.example npm run build
```

## Content Editing

Most profile-style content lives in `src/data/profile.js`.

Update this file when changing:

- hero links and profile highlights
- career timeline
- papers and research records
- awards and competitions
- skill groups

Project summary cards and detailed project pages are generated from Markdown
files in `content/projects/`.

## Blog Posts

Blog posts are Markdown files under `content/blog/<category>/`.

The route is derived from the directory and filename:

```text
content/blog/agent-systems/example-post.md
-> /blog/agent-systems/example-post/
```

Use this frontmatter shape:

```md
---
title: "Post title"
date: "2026-03-30"
description: "Short summary for cards and metadata."
author: "Sangmin Lee"
category: "agent-systems"
tags:
  - RAG
  - Agents
draft: false
---
```

Set `draft: true` to keep a post out of generated blog pages. When adding a new
top-level blog category that should appear in navigation and receive a category
page, also add it to `src/data/categories.json`.

## Project Case Studies

Project pages are Markdown files under `content/projects/`.

The route is derived from the filename:

```text
content/projects/harmony-multitenant-ai.md
-> /projects/harmony-multitenant-ai/
```

Use this frontmatter shape:

```md
---
title: "Project title"
period: "Organization / 2026.01 - 2026.03"
description: "Short summary for cards and metadata."
metrics:
  - "Metric"
stack:
  - "Python"
details:
  - "Execution note for cards and the detail page."
order: 10
draft: false
---
```

Set `draft: true` to keep a project out of generated project pages. Lower
`order` values appear earlier in the project list.

## Portfolio Slides

`src/pages/portfolio.js` reads `src/data/portfolioSlides.json` and renders the
slide images in `static/portfolio/slides/`.

To regenerate the portfolio deck on macOS:

```bash
npm run portfolio:export
```

The export script opens the local Keynote file, exports slide images as JPEG,
extracts slide text through a temporary PPTX, and refreshes the manifest.

Supported environment variables:

```bash
PORTFOLIO_KEYNOTE_PATH=/path/to/Portfolio.key npm run portfolio:export
PORTFOLIO_IMAGE_QUALITY=0.92 npm run portfolio:export
PORTFOLIO_SLIDE_LIMIT=36 npm run portfolio:export
```

Commit both `static/portfolio/slides/` and `src/data/portfolioSlides.json` after
exporting. GitHub Actions does not run Keynote, so the generated assets must be
present in the repository before deployment.

## Deployment

Pushes to `main` trigger `.github/workflows/github-pages.yml`.

The workflow:

1. installs dependencies with `npm ci`
2. builds Gatsby with `npm run build`
3. creates `public/.nojekyll`
4. uploads `public/` as a GitHub Pages artifact
5. deploys to GitHub Pages

Manual deployment is also available through the workflow dispatch button in
GitHub Actions.

## Verification

Before merging content or UI changes, run:

```bash
npm run build
```

For formatting-only checks or broad content edits, run:

```bash
npm run format
```

There is no separate test suite in this repository yet; the production build is
the main verification gate.
