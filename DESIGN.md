# d9249.github.io Design System

## 1. Atmosphere & Identity

`d9249.github.io` is a calm, high-craft technical portfolio: precise enough for
research evidence, warm enough to feel personal, and immediate enough to behave
like a native Apple surface. The emotion is **quiet confidence**.

The memorable moment is the home hero: a soft field of cool daylight behind a
floating profile console. It preserves the owner's engineering identity without
making the whole site look like a terminal. Information stays dense, while
hierarchy, translucency, and breathing room make the common path obvious.

The source of truth is `skills/apple-design/SKILL.md`, especially Purpose,
Familiarity, Simplicity, Craft, instant response, spatial consistency,
translucent hierarchy, optical typography, and reduced-motion equivalents.

## 2. Color

### Palette

| Role           | Token           | Light                         | Dark                          | Usage                                  |
| -------------- | --------------- | ----------------------------- | ----------------------------- | -------------------------------------- |
| Canvas         | `--bg`          | `oklch(97.8% 0.007 250)`      | `oklch(14.5% 0.012 255)`      | Page atmosphere                        |
| Elevated solid | `--surface`     | `oklch(100% 0 0)`             | `oklch(20.5% 0.014 255)`      | Opaque fallback and article canvas     |
| Primary text   | `--fg`          | `oklch(20% 0.016 255)`        | `oklch(96% 0.006 250)`        | Headings, body, icons                  |
| Secondary text | `--muted`       | `oklch(48% 0.018 255)`        | `oklch(72% 0.014 250)`        | Supporting text and metadata           |
| Separator      | `--border`      | `oklch(86% 0.012 250 / 0.78)` | `oklch(34% 0.014 255 / 0.78)` | Hairlines and surface rims             |
| System blue    | `--accent`      | `oklch(57% 0.19 252)`         | `oklch(70% 0.16 248)`         | Primary actions, links, focus          |
| On accent      | `--on-accent`   | `oklch(99% 0 0)`              | `oklch(99% 0 0)`              | Legible text on solid accent fills     |
| Sky light      | `--accent-soft` | `oklch(88% 0.07 240)`         | `oklch(39% 0.08 245)`         | Atmospheric light and selected fills   |
| Cyan signal    | `--accent-2`    | `oklch(68% 0.13 218)`         | `oklch(76% 0.12 218)`         | Technical/evidence accents             |
| Warm signal    | `--accent-3`    | `oklch(72% 0.14 55)`          | `oklch(76% 0.13 55)`          | Limited warning or recognition accents |
| Scrim          | `--overlay`     | `oklch(8% 0.012 255 / 0.58)`  | `oklch(2% 0.006 255 / 0.72)`  | Modal focus                            |

### Rules

- System blue carries agency: links, selected state, focus, and primary actions.
- Cool sky/cyan light creates atmosphere but never replaces semantic contrast.
- Color is applied on the solid/background layer, never as low-contrast text on
  translucent foregrounds.
- Dark mode is tuned independently, not produced by inverting light mode.
- Project diagrams and screenshots retain neutral backgrounds so evidence is not
  color-shifted.

## 3. Typography

### Font stacks

- Display: `--font-display`, `-apple-system`, `BlinkMacSystemFont`,
  `SF Pro Display`, system UI.
- Body: `--font-body`, `-apple-system`, `BlinkMacSystemFont`, `SF Pro Text`,
  system UI.
- Mono: `--font-mono`, `SFMono-Regular`, Menlo, Monaco, Consolas.

### Optical scale

| Level      | Size                             | Weight  | Leading | Tracking   | Usage                        |
| ---------- | -------------------------------- | ------- | ------- | ---------- | ---------------------------- |
| Display    | `clamp(3.2rem, 6.8vw, 6.7rem)`   | 760     | `0.96`  | `-0.055em` | Home hero                    |
| Page title | `clamp(2.7rem, 5vw, 5.2rem)`     | 740     | `1`     | `-0.045em` | Projects, research, articles |
| Section    | `clamp(2.15rem, 3.7vw, 3.7rem)`  | 720     | `1.04`  | `-0.035em` | Section headings             |
| Card title | `1.25rem-2rem`                   | 650-700 | `1.16`  | `-0.02em`  | Cards and panels             |
| Lead       | `clamp(1.12rem, 1.8vw, 1.42rem)` | 430     | `1.55`  | `-0.012em` | Hero and page summaries      |
| Body       | `1rem`                           | 400     | `1.68`  | `-0.006em` | Default copy                 |
| Small      | `0.84rem-0.92rem`                | 450     | `1.5`   | `0`        | Supporting copy              |
| Label      | `0.68rem-0.76rem`                | 650     | `1.25`  | `0.065em`  | Metadata and controls        |

### Rules

- Use optical sizing where available. Large headings tighten; small labels open.
- Korean copy uses `word-break: keep-all`, `text-wrap: pretty`, and enough line
  height for legibility. One-line locking is reserved for genuinely short labels.
- The root remains `100%`; spacing and type use `rem` so browser text scaling
  grows the layout instead of clipping it.
- Mono is a precise accent for code and metadata, not the site's primary voice.

## 4. Spacing & Layout

Layout spacing derives from a 4px base and is exposed as tokens. Optical type,
icon, and material values may use fractional units when rendered alignment
requires it.

| Token        | Value     | Usage             |
| ------------ | --------- | ----------------- |
| `--space-1`  | `0.25rem` | Optical nudges    |
| `--space-2`  | `0.5rem`  | Compact icon gaps |
| `--space-3`  | `0.75rem` | Labels and chips  |
| `--space-4`  | `1rem`    | Control padding   |
| `--space-5`  | `1.25rem` | Compact cards     |
| `--space-6`  | `1.5rem`  | Default cards     |
| `--space-8`  | `2rem`    | Groups            |
| `--space-10` | `2.5rem`  | Large groups      |
| `--space-12` | `3rem`    | Section internals |
| `--space-16` | `4rem`    | Mobile sections   |
| `--space-24` | `6rem`    | Desktop sections  |

- Reading shell: `min(1200px, calc(100% - 48px))`; article measure: 760px.
- Mobile shell: `min(100% - 32px, 1200px)`.
- The layout shifts at content pressure, not device names: 1060px navigation,
  980px detail grids, 760px multi-column cards, 680px compact mobile.
- Primary sections have no box around the whole section. Cards group meaningful
  sub-objects; white space groups the larger narrative.
- Rounded geometry follows scale: 12px controls, 18px cards, 24-30px large
  surfaces. Nested radii decrease inward.

## 5. Components

### Floating Navigation

- A centered translucent capsule floats above scrolling content with a soft
  scroll-edge shadow, bright rim, and 24px blur. It never becomes an opaque bar.
- Desktop navigation exposes every destination. The active destination is blue
  and receives a quiet filled capsule. Mobile uses an anchored sheet below the
  header and exits through the same path it entered.
- Search, theme, and menu controls are 44px or larger on touch layouts, show
  pointer-down scale immediately, and retain visible focus rings.

### Hero Profile Console

- The home hero is a two-column editorial composition: decisive statement and
  one elevated console. Atmospheric light belongs to the page layer; the console
  uses thick translucent material, a bright rim, and a deep diffuse shadow.
- The ASCII portrait remains a personal signature, but terminal chrome is
  secondary to the person's name, role, and direct paths.
- Primary and secondary actions are visually distinct and share identical hit
  geometry. External profile links use compact glass pills.

### Content Cards

- Evidence, project, research, recognition, post, tip, skill, and supporting
  cards share the `--material-card` recipe, 18-22px radius, and a top-light rim.
- Hover raises only interactive cards by 3px and strengthens the shadow. Press
  immediately scales them to `0.985`. Non-interactive cards do not animate.
- Cards avoid decorative nesting. Chips are metadata, not miniature cards.

### Section Heading

- The eyebrow establishes context; the title carries the story. Actions remain
  adjacent to the section they affect and use direct labels.
- Section dividers are atmospheric spacing or a short gradient hairline, never a
  full-width grid rule.

### Article & Evidence Media

- Articles use an opaque reading surface with generous measure and quiet chrome.
- Images and diagrams use neutral inspection frames. Wide analytical images pan
  horizontally on mobile rather than shrinking labels below readability.
- The shared lightbox preserves its existing fitted stage, rotation, keyboard
  activation, Escape dismissal, focus containment, and mobile visualViewport
  behavior. Its material is updated, not its proven geometry.

### Primitive states

Every interactive primitive implements default, hover, pointer-down, focus,
disabled, and reduced-motion states. Search additionally implements empty,
results, and dismiss states; deck controls expose unavailable navigation.

## 6. Motion & Interaction

| Behavior            | Token                      | Curve                      | Usage                               |
| ------------------- | -------------------------- | -------------------------- | ----------------------------------- |
| Immediate press     | `--motion-press: 100ms`    | `ease-out`                 | `scale(0.97-0.985)` on pointer-down |
| Micro response      | `--motion-fast: 180ms`     | `cubic-bezier(.2,.8,.2,1)` | Color, rim, small transforms        |
| Material arrival    | `--motion-material: 320ms` | `cubic-bezier(.16,1,.3,1)` | Search, mobile nav, dialog          |
| Page/section reveal | `--motion-reveal: 480ms`   | `cubic-bezier(.16,1,.3,1)` | First-view content only             |

- The interface responds on pointer-down; no artificial delay is introduced.
- Enter and exit paths are spatially symmetric and anchored to the trigger.
- Only `transform`, `opacity`, `filter`, and color/rim properties animate.
- No decorative perpetual motion. The old prompt-dot breathing loop is removed.
- `prefers-reduced-motion` replaces movement with a short cross-fade.
- `prefers-reduced-transparency` removes blur and raises material opacity.
- `prefers-contrast: more` uses solid surfaces and strong separators.

## 7. Depth & Surface

The page uses three distinct material weights.

| Level             | Token/recipe                                                        | Usage                       |
| ----------------- | ------------------------------------------------------------------- | --------------------------- |
| Canvas light      | radial sky and cyan glow over `--bg`                                | Atmosphere behind content   |
| Card material     | translucent surface + 18px blur + bright inset rim + diffuse shadow | Cards and controls          |
| Floating material | translucent surface + 28px blur + saturation + stronger rim/shadow  | Navigation, search, console |
| Opaque reading    | `--surface` + subtle border/shadow                                  | Long articles and evidence  |
| Modal             | `--overlay` + floating material                                     | Lightbox and focused tasks  |

- Translucency communicates hierarchy; it is not stacked on another translucent
  foreground surface.
- Larger surfaces read thicker through stronger blur and deeper shadow.
- Shadows stay cool and diffuse. There are no hard black drop shadows.
- Dark mode uses lighter rims and lower-opacity shadows to keep material edges
  legible without glowing every card.

## 8. Accessibility, Responsibility & Accepted Debt

### Constraints

- Text and controls target WCAG AA contrast in both themes.
- Keyboard focus is always visible. Icon-only controls keep explicit Korean
  `aria-label` text. Touch targets are at least 44px where space permits.
- Color never carries state alone. Current navigation, disabled deck controls,
  and errors retain a structural or textual cue.
- Browser zoom, text scaling, reduced motion, reduced transparency, and increased
  contrast are first-class states.
- The design adds no tracking, autoplay media, sound, vibration, or unexpected
  consent request. Existing view counting behavior is unchanged.

### Accepted debt

- The 5,000+ line legacy `global.css` remains because it contains proven article,
  PDF, lightbox, and responsive edge-case behavior. The Apple redesign is loaded
  afterward from `apple-design.css`, allowing a reversible visual migration
  without weakening those behaviors.
- The ASCII portrait remains fixed-width art and may become compact on very small
  screens; the adjacent semantic profile facts remain fully accessible.
- Gatsby's route transitions are not gesture-driven, so the current redesign uses
  interruptible CSS micro-interactions rather than introducing a large motion
  runtime solely for page navigation.
