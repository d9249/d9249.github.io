# d9249.github.io Design System

## 1. Identity — paper, ink and a tree

The site reads like an animator's movement sheet laid on warm paper: ink type, hairline
rules, mono labels and a slate in the corner. One picture carries the story: **a tree**.

- **Roots** are the research of the master's course (earth colours).
- **Branches** are projects. Each project has its own leaf colour, and its leaves attach one at a time.
- **Fruit** is what a project earned, such as an award, a patent or a contract (mandarin).

The home page tells that story as an eight-shot reel (§7), and the inner pages reuse its devices (§6). Every other page uses the same
paper, ink and colour meanings, so a project's colour on the home tree is the same colour on
its card and its page.

The emotion is **quiet confidence**: dense evidence and calm surfaces, with the motion kept in
one place (the reel). The old Apple-glass look (translucent cards, cool blue light) is retired.

## 2. Colour

All colours live in `src/styles/tokens.css`. No other stylesheet defines `:root` tokens.

### Palette (raw)

| Group             | Tokens                                                                                    | Meaning                       |
| ----------------- | ----------------------------------------------------------------------------------------- | ----------------------------- |
| Base              | `--paper #f2ede3` · `--sheet #fbf8f1` · `--ink #16171b`                                   | The page and its type         |
| Research (roots)  | `--c-rust` `--c-ochre` `--c-umber` `--c-brick` `--c-olive` `--c-clay`                     | One per paper / research line |
| Projects (leaves) | `--c-cyan` `--c-blue` `--c-green` `--c-violet` `--c-teal` `--c-sky` `--c-lime` `--c-navy` | One per project               |
| Results (fruit)   | `--c-mandarin`                                                                            | Awards, patents, contracts    |

### Semantic (what components use)

| Role           | Token                          | Light           | Dark         |
| -------------- | ------------------------------ | --------------- | ------------ |
| Canvas         | `--bg`                         | paper `#f2ede3` | `#121316`    |
| Sheet          | `--surface`                    | `#fbf8f1`       | `#1a1b1f`    |
| Text           | `--fg`                         | ink `#16171b`   | `#eee8dc`    |
| Secondary text | `--muted`                      | `#5c5850`       | `#a6a095`    |
| Hairline       | `--border` / `--border-strong` | fg 14% / 34%    | fg 13% / 36% |
| Link · focus   | `--accent`                     | `#2347c4`       | `#86a2ff`    |
| Evidence       | `--accent-2`                   | `#0e7487`       | `#4fc6d8`    |
| Recognition    | `--accent-3`                   | `#9a4b00`       | `#f5a050`    |
| Result fill    | `--result`                     | mandarin        | mandarin     |
| Primary fill   | `--control-primary-fill`       | ink             | `#eee8dc`    |
| Primary hover  | `--control-primary-hover`      | `--c-green`     | `#5fd3a0`    |

### Rules

- **One colour, one meaning.** Earth means research, a leaf colour means that project, and mandarin means a result. Don't use a palette colour for decoration.
- Pages outside the reel use the same colours. `src/utils/treeColors.js` maps a project slug to its leaf colour and a research id to its root colour, and results use mandarin. An element that carries a colour gets it as `--c` and shows it as a dot, a chip, a pin or the tree itself.
- **No colour stripes.** A card, row, panel or quote never gets a coloured (or ink) bar along one edge to set it apart: no `border-left: 3px`, no top edge, no `::before` tab. Rows are set apart by hairlines, spacing and type; a colour appears only where it names something.
- `--accent` is for links, focus and selection only. Primary actions are ink, not blue.
- Palette colours go on fills and swatches. Text uses `--fg`, `--muted` or the text-safe `--accent-*`.
- Colour never carries state alone. Pair it with a label, a weight or a shape.
- Mix colours **`in oklab`**, never `in oklch`. With near-grey inputs, oklch has no hue, and Chromium then tints the mix pink.
- Dark mode is a separate set of values, not an inversion. `gatsby-ssr.js` sets `html[data-theme]` before paint, so stylesheets use `html[data-theme="dark"]` and never `prefers-color-scheme`.

## 3. Typography

| Family                   | Token          | Use                                                           |
| ------------------------ | -------------- | ------------------------------------------------------------- |
| IBM Plex Sans KR 400–700 | `--font-body`  | Everything you read: body, headings (`--font-display` = body) |
| Archivo (width 62–125)   | `--font-brand` | Numerals and names set large: counters, scores, case names    |
| JetBrains Mono 400–700   | `--font-mono`  | Labels, meta, chips, timecodes                                |

- Scale: `--type-hero`, `--type-page-title`, `--type-section-title`, `--type-card-title`, `--type-label`.
- Korean text uses `word-break: keep-all`. Headings use `text-wrap: balance`.
- Labels are mono, uppercase, `0.1em` tracking and `--muted`. The kicker above a heading (`.eyebrow`) is ink and bold.

## 4. Space, radius, surface, motion

- Space: `--space-1 … --space-24` (a 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96).
- Radius: `--radius-xs` (swatches, code), `--radius-control` (inputs), `--radius-card`, `--radius-large` (media), `--radius-pill` (buttons, chips).
- Surface: flat paper. A card is `--surface` with a 1px `--border` and a 1px `--shadow-card`. Hover adds `--shadow-card-hover` and a 2px lift. There is no glass and no blur, except the floating masthead and the reel HUD (`--material-floating`).
- Paper details: `--ruled-paper` is ruled lines with a rust margin line, layered over a surface (post card headers, the reel's shot 02). `--term`, `--term-fg` and `--term-dim` set code blocks and the reel's terminal. `--stage*` is the slide deck's surround, which stays dark in both themes.
- Motion: `--motion-press` 100ms · `--motion-fast` 180ms · `--motion-material` 320ms · `--motion-reveal` 480ms, with `--ease-fluid`. Pages stay still; motion belongs to the reel.
- Z: `--z-sticky` masthead · `--z-hud` reel HUD · `--z-overlay` search · `--z-modal` lightbox · `--z-skip` · `--z-fullscreen` deck.
- Layout: `.shell` is `min(75rem, 100% − 3rem)` (`− 2rem` ≤ 760px). Breakpoints are 1120 · 980 · 760 · 420.

## 5. Components

Each primitive is defined **once** in `src/styles/components.css`. React wrappers live in
`src/components/ui/`. Markup that can't use React (markdown, the reel) uses the class directly.

| Primitive    | Class                                                              | React                                              | Notes                                                                                                                             |
| ------------ | ------------------------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Label        | `.ui-label`, `.ui-label--strong`, `.eyebrow`                       | `<Label>`, `<Label kicker>`                        | Mono uppercase meta; `kicker` is the label above a heading                                                                        |
| Button       | `.ui-button` + `--primary` / `--tonal` / `--compact`, `.is-active` | `<Button to / href / onClick variant>`             | Pill with a 1.5px border. Primary is an ink fill (one per view) with green hover                                                  |
| Chip         | `.ui-chip`, `.ui-chip--solid`                                      | `<Chip color solid>`                               | Metadata only. `color` shows a swatch; `solid` fills                                                                              |
| Filter chip  | `.ui-filter` + `.is-active` / `aria-current`                       | (CategoryNav, TagNav)                              | Category and tag filters; active is an ink fill                                                                                   |
| Card         | `.ui-card`, `.ui-card--interactive`                                | `<Card interactive color>`                         | For panels only (sidebars, filters, viewers). Lists are rows, not cards (§6)                                                      |
| Page header  | `.ui-page-header` (+ `--hero`, `.ui-slate`, `.ui-marks`)           | `<PageHeader slate title lead actions aside size>` | A shot from the reel: crop marks, a slate (page · colours of what it lists · count), a big title, the page's picture on the right |
| Section head | `.section-head`                                                    | `<SectionHeading kicker title action>`             | Every h2 section heading inside a page                                                                                            |
| Text action  | `.ui-actions a` (aliases `.project-inline-actions`, `.paper-link`) | —                                                  | "보기 →" links in a card. On touch screens the hit area grows to ~44px without moving anything                                    |
| Hidden text  | `.visually-hidden`                                                 | —                                                  | Screen-reader-only text, e.g. the h2 between a page's h1 and its card list                                                        |

**Legacy aliases.** The families also list the classes the pages already use. For example,
`.button-primary`, `.pagination-page` and `.section-action a` are buttons; `.tag`,
`.metric-chip` and `.project-stack span` are chips; `.post-card`, `.project-card` and
`.paper-card` are cards. Their look comes only from `components.css`. The page files keep
layout only, such as margins, grid placement and page-context variants (`.career-tags .ui-chip`).
When you touch a page, prefer the `ui-*` class or the React wrapper and drop the alias.

## 6. Pages — the reel's vocabulary

The inner pages reuse the reel's devices instead of a card grid. Each page puts its boldness into one
picture in its header; the lists below it are quiet rows on hairlines.

| Page            | Header picture                                                                | List                                                                 |
| --------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Projects        | The tree (`<TreeCanvas grow>`); a branch opens its row, hovering a row lights it | Branch rows: leaf dot, name in Archivo wide, KPI chip in leaf. Pressing a row opens what was done, the stack and "자세히 보기" (the project page) |
| Project page    | The tree with only this branch lit; the name set like the reel's case cut     | A cut (`--cut-*`): problem, capabilities grown, result (shot 07)     |
| Research        | The roots (`variant="roots"`) with R1–R6 pins; counts as condensed numerals   | Root rows R1–R6, then every paper by type                            |
| Awards          | The award sheet (`<AwardSheet>`): the reel's stamps land one by one           | Ledger: date, award, result in mandarin, evidence links, a tick      |
| Competitions    | A check sheet: ticks draw in, values with a mandarin highlighter              | Check rows: box, what, value, note                                   |
| DACON           | Stat tiles                                                                    | A bar per field, a ledger of entries with rank and percentile        |
| Blog, tag, tips | Slate with the count                                                          | Notebook rows: date and category in the margin, title, one line      |
| Contact         | The tree with an empty "next branch" (the reel's end card)                    | Channels as a ledger                                                 |
| Home, career    | Slate with the count                                                          | The profile beside a ledger of roles: date in the margin, the organisation in Archivo wide, role, what was done (three on a phone, the rest behind a button) |

- **Masthead** = the reel's top bar: a veil (`--material-floating`, blur on `.masthead::before` so the menu sheet is not trapped by the filter) and a hairline, `SANGMIN LEE` in Archivo 800 at 118%, the pages in mono capitals with the current one underlined like the reel's shot rail. It stays 45px (49px on a phone) with the hairline, because the reel measures it for `--hh`.
- **Menu** (≤1180px) = a full-height sheet under the bar: the slate (`MENU · 12 PAGES`), then two groups, 홈 (sections of the home page) and 페이지, as rows in the brand face with the Korean name on the right and an ink dot on the current page. Open, it locks the page's scroll and makes `main` and the footer `inert`; Esc or the button closes it and focus goes back to the button without scrolling.
- `src/components/TreeCanvas.js` draws the reel's tree with the compositor in `showreel/tree.js` (shared with the reel). It grows once (skipped for reduced motion), redraws on theme and size changes, and puts real links over branches and roots.
- Colours on the pages come from `src/utils/treeColors.js` (`stageOf`, `caseOf`, `onColor`, `solidOf`), so a project is the same colour on the tree, its row and its page.
- The projects index keeps the full card content one press away: a row is a disclosure (`button[aria-expanded]` over the summary, the panel `inert` while closed). Open rows put their id in the URL hash (`/projects/#harmony-multitenant-ai`), so a link or the back button reopens the row. The tree's branch links open the row on a plain click and still go to the project page on a modified click.
- Motion on the pages is limited to one moment per page header: the tree growing, the stamps landing, the ticks drawing.

## 7. The home reel

`src/pages/index.js` = `<Showreel/>` + career timeline (`#career`) + latest posts (`#latest`).

| Shot        | id        | What it shows                                                              |
| ----------- | --------- | -------------------------------------------------------------------------- |
| 01 Hook     | `#hook`   | The tree, with a title                                                     |
| 02 Grow     | `#run`    | Roots = research R1–R6 (pins + list), branches = projects, fruit = results |
| 03 Skills   | `#skills` | Six skill packages filling up (`/#skills` in the nav)                      |
| 04 Stamp    | `#stamp`  | Awards stamped onto a sheet                                                |
| 05 Mosaic   | `#mosaic` | Evidence tiles                                                             |
| 06 Check    | `#check`  | Numbers, checked off                                                       |
| 07 Cases    | `#flip`   | Five projects: the problem, the capabilities grown, the result             |
| 08 End card | `#end`    | Contact                                                                    |

- Files: `src/components/Showreel.js` mounts `showreel/markup.js` (static HTML, rendered at build time) and `showreel/engine.js`. The engine returns a teardown, so route changes leave no listeners behind.
- Content: `src/data/showreel.json`. A new project goes at the end of `stages`; no render is needed for up to 11 projects. The tree's sprites and anchors come from `scripts/showreel/` (see its README).
- Styles: `src/styles/showreel.css`, scoped under `.reel`. It aliases its old names onto the tokens (`--sub` → `--muted`, `--rule` → `--border`, and so on). Only reel-only inks stay local; the stamp inks, terminal and tree wood are tokens because the pages use them too.
- The reel slides under the sticky masthead (`margin-top: −var(--hh)`; the engine measures the masthead). Its gutters line up with `.shell`. The HUD hides once the reel is over.
- Scrolling is native, with sticky shots. After the wheel stops, the page settles to the nearest cut. ▶ plays the reel and pauses on any wheel, touch or key input.

## 8. Files and load order

`gatsby-browser.js` imports, in order:

1. `tokens.css` holds the single source of tokens: palette, semantic, type, space, radius, shadow, motion, z and dark theme.
2. `legacy.css` keeps the proven edge cases: article body, PDF viewer, lightbox, decks, newsroom and responsive fixes. It has no tokens and no primitive looks.
3. `components.css` sets the base element styles, then the primitives (§5).
4. `site.css` holds the page layouts: masthead, footer, list and detail pages.
5. `showreel.css` holds the home reel, scoped under `.reel`.

Rules of the road:

- Put a new colour or size in `tokens.css` first, then use the token.
- Never restyle a primitive in a page file. Add a variant in `components.css`, or a layout-only page rule.
- New page-level rules go in `site.css`. `legacy.css` only shrinks.

## 9. Accessibility & accepted debt

- Text and controls meet WCAG AA in both themes. Focus is always visible (`--focus-ring`). Icon-only controls keep Korean `aria-label`s. Touch targets are 44px where space allows.
- `prefers-reduced-motion`: the reel jumps between cuts instead of easing, and title and stamp animations are off. `prefers-contrast: more` strengthens borders and muted text.
- The reel's canvases have `role="img"` with a description. Each shot's content is also real text and links.

Accepted debt:

- `legacy.css` (~3.5k lines) and `site.css` (~3.4k lines) still mix page layouts with older one-off visuals.
- The legacy aliases in `components.css` should shrink as pages move to `ui-*` and the React wrappers.
- `legacy.css` still carries the article body, PDF viewer, lightbox and deck rules; new page styles go in `site.css` under "Pages in the reel's vocabulary".
