# Mean Log

`d9249.github.io` is now a Gatsby-based personal technical blog for AI research,
product engineering notes, and career evidence.

## Structure

```text
content/blog/<category>/<post>.md   Markdown posts
static/portfolio/slides/            Exported portfolio slide images
src/data/portfolioSlides.json       Portfolio presentation manifest
scripts/portfolio/export-keynote.js Local Keynote-to-web export script
src/pages/                          Gatsby pages
src/templates/                      Blog post/category templates
src/components/                     Shared UI components
src/styles/global.css               Site-wide visual system
```

## Commands

```bash
npm install
npm run develop
npm run build
npm run portfolio:export
```

Posts use frontmatter fields such as `title`, `date`, `description`, `author`,
`category`, `tags`, and `draft`. Set `draft: true` to keep a post out of
generated blog pages.

## Portfolio Deck

`npm run portfolio:export` reads the local Keynote file, exports every slide as
static JPEG assets, and refreshes `src/data/portfolioSlides.json`. Commit the
generated files with code changes so GitHub Pages can deploy the latest deck
without needing Keynote in GitHub Actions.

Use `PORTFOLIO_KEYNOTE_PATH=/path/to/file.key npm run portfolio:export` when the
Keynote source moves.
