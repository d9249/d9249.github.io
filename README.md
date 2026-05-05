# Mean Log

`d9249.github.io` is now a Gatsby-based personal technical blog for AI research,
product engineering notes, and career evidence.

## Structure

```text
content/blog/<category>/<post>.md   Markdown posts
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
```

Posts use frontmatter fields such as `title`, `date`, `description`, `author`,
`category`, `tags`, and `draft`. Set `draft: true` to keep a post out of
generated blog pages.
