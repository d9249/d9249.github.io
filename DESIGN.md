# d9249.github.io Design System

## 1. Atmosphere & Identity

A quiet technical portfolio with an engineering-notebook feel. The signature is
thin-line structure: restrained panels, monospace metadata, soft grid texture,
and small accent flashes that make dense career/project evidence easy to scan.

## 2. Color

### Palette

| Role         | Token            | Light                                                         | Dark                   | Usage                                    |
| ------------ | ---------------- | ------------------------------------------------------------- | ---------------------- | ---------------------------------------- |
| Background   | `--bg`           | `oklch(98% 0.005 250)`                                        | `oklch(16% 0.018 250)` | Page canvas and grid base                |
| Surface      | `--surface`      | `oklch(100% 0 0)`                                             | `oklch(22% 0.018 250)` | Cards, panels, dialogs                   |
| Text primary | `--fg`           | `oklch(19% 0.018 245)`                                        | `oklch(94% 0.008 245)` | Body, headings, icons                    |
| Text muted   | `--muted`        | `oklch(48% 0.018 245)`                                        | `oklch(70% 0.018 245)` | Captions, metadata, secondary copy       |
| Border       | `--border`       | `oklch(88% 0.01 245)`                                         | `oklch(34% 0.018 250)` | Dividers, card outlines, controls        |
| Accent green | `--accent`       | `oklch(70% 0.18 145)`                                         | `oklch(74% 0.18 145)`  | Primary links, focus, active metadata    |
| Accent blue  | `--accent-2`     | `oklch(66% 0.18 245)`                                         | `oklch(72% 0.14 235)`  | Secondary bullets and technical emphasis |
| Accent warm  | `--accent-3`     | `oklch(72% 0.16 35)`                                          | `oklch(72% 0.15 30)`   | Small status dots and warm contrast      |
| Overlay      | `--overlay`      | `oklch(0% 0 0 / 0.72)`                                        | `oklch(0% 0 0 / 0.78)` | Modal backdrop                           |
| Modal shadow | `--shadow-modal` | `0 24px 90px color-mix(in oklch, var(--fg) 24%, transparent)` | Same                   | Dialog elevation                         |

### Rules

- Use the existing OKLCH tokens; extend this table before adding a new color.
- Accent colors are for interaction and evidence emphasis, not decoration.
- Project-page diagrams and screenshots sit on `--surface` with a 1px border.

## 3. Typography

### Scale

| Level           | Size                       | Weight  | Line Height | Tracking    | Usage                     |
| --------------- | -------------------------- | ------- | ----------- | ----------- | ------------------------- |
| Display         | `clamp(44px, 6vw, 82px)`   | 760-800 | 0.98-1.08   | 0           | Project and home heroes   |
| Section         | `clamp(34px, 3.6vw, 48px)` | 700-780 | 1.08        | 0           | Section headings          |
| Article heading | 28px                       | 700     | 1.2         | 0           | Markdown `h2`/`h3`        |
| Card heading    | 20-34px                    | 700     | 1.08-1.35   | 0           | Cards and panels          |
| Body large      | 18-23px                    | 400     | 1.5-1.82    | 0           | Lead and article text     |
| Body            | 16px                       | 400     | 1.6         | 0           | Default text              |
| Body small      | 14-15px                    | 400     | 1.5-1.65    | 0           | Supporting copy           |
| Mono label      | 11-12px                    | 700-800 | 1.2-1.45    | 0.04-0.08em | Metadata, chips, controls |

### Font Stack

- Display: `--font-display`, Apple/system sans.
- Body: `--font-body`, Apple/system sans.
- Mono: `--font-mono`, Menlo/Monaco/Consolas-compatible stack.

### Rules

- Keep letter spacing at `0` except uppercase metadata.
- Use `word-break: keep-all`, `text-wrap: pretty`, and balanced headings for Korean copy.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a 4px base.

| Token        | Value | Usage                                 |
| ------------ | ----- | ------------------------------------- |
| `--space-1`  | 4px   | Tight icon and caption adjustments    |
| `--space-2`  | 8px   | Compact chip and caption gaps         |
| `--space-3`  | 12px  | Inline groups and control padding     |
| `--space-4`  | 16px  | Mobile panel padding, small grid gaps |
| `--space-5`  | 20px  | Panel padding                         |
| `--space-6`  | 24px  | Default card padding                  |
| `--space-7`  | 28px  | Project body gaps                     |
| `--space-8`  | 32px  | Larger groups                         |
| `--space-10` | 40px  | Section rhythm                        |
| `--space-12` | 48px  | Major content breaks                  |
| `--space-18` | 72px  | Section vertical padding              |

### Grid

- Max shell width: `min(1180px, calc(100% - 40px))`.
- Project detail grid: `0.68fr / 0.32fr`, collapsing to one column below 980px.
- Mobile shell: `min(100% - 28px, 1180px)` below 680px.

### Rules

- Prefer grids with `minmax(0, 1fr)` so Korean/English mixed strings cannot overflow.
- Fixed-format controls use stable dimensions and 8px or smaller radii.

## 5. Components

### Project Article

- **Structure**: Markdown HTML rendered inside `.article-body.project-markdown-body`.
- **Variants**: lead panels, feature grids, fact grids, flow strips, diagrams, screenshot cards.
- **Spacing**: 14px diagram padding, 28-42px block rhythm, 6-8px image radius.
- **States**: links and controls have hover/focus; images expose zoom cursor and focus ring.
- **Accessibility**: image alt text is preserved; keyboard image activation uses Enter/Space.
- **Motion**: micro-interactions use 160ms transform/opacity transitions.

### Project Image Lightbox

- **Structure**: fixed modal backdrop, icon-only close button, figure, fitted image stage, caption footer, icon-only rotate control.
- **Variants**: light and dark theme inherit the same surface, border, overlay, and shadow tokens.
- **Spacing**: viewport gutters leave comfortable inspection space: 32px desktop, 16px mobile; rotated mobile images reserve close-button clearance, shrink the frame to the fitted image width, pin the footer control to the visual viewport, and may allow a short vertical scroll so dense diagrams stay readable under mobile browser chrome; image frame padding is 12px desktop and 8px mobile.
- **States**: backdrop click, close/rotate button hover/focus, Escape, 90-degree rotation steps, and focus containment.
- **Accessibility**: `role="dialog"`, `aria-modal="true"`, labelled by image alt text when present.
- **Motion**: opacity and transform-only entrance; disabled under reduced motion.

## 6. Motion & Interaction

| Type    | Duration | Easing                        | Usage                                |
| ------- | -------- | ----------------------------- | ------------------------------------ |
| Micro   | 160ms    | ease                          | Link, chip, image, and control hover |
| Dialog  | 180ms    | cubic-bezier(0.16, 1, 0.3, 1) | Modal entrance                       |
| Ambient | 1.8s     | ease-in-out                   | Prompt cursor pulse                  |

### Rules

- Animate `transform`, `opacity`, `filter`, or border/background color only.
- Respect `prefers-reduced-motion`.
- Interactive images must not shift layout on hover.

## 7. Depth & Surface

### Strategy

Mixed, but restrained: primary separation comes from 1px borders and tonal
surface shifts; shadows are reserved for overlays and selected hero materials.

| Level         | Value                                                   | Usage                             |
| ------------- | ------------------------------------------------------- | --------------------------------- |
| Border        | `1px solid var(--border)`                               | Cards, panels, diagrams, controls |
| Tonal surface | `color-mix(in oklch, var(--surface) 92-97%, var(--bg))` | Cards and article blocks          |
| Modal         | `--shadow-modal` plus `--overlay`                       | Project image lightbox            |

### Rules

- Keep card radius at 8px or less.
- Avoid nested decorative cards; framed tools, diagrams, and screenshots may use bordered containers.
