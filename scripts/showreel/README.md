# Showreel pipeline

The home page (`src/pages/index.js`) opens with an eight-shot reel: a tree whose roots are the
research of the master's course, whose branches are projects (leaves attach one at a time) and whose
fruits are results. The tree is a set of Blender layers composited and tinted in the browser.

| What                                        | Where                                                                |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Content — projects, research, skills, cases | `src/data/showreel.json` (edit freely, no render needed)             |
| Tree anchors + sprite map                   | `src/data/showreel-tree.json` (generated)                            |
| Sprite atlases                              | `static/showreel/tree/*.webp` (generated)                            |
| Markup / engine                             | `src/components/showreel/markup.js`, `engine.js`                     |
| Styles                                      | `src/styles/showreel.css` (scoped under `.reel`, reads `tokens.css`) |

## Adding a project

Append it to `stages` in `src/data/showreel.json` (`name, leaf, year, org, verb, line, kpi, href`,
optional `fruit`). Twelve branch slots are rendered, so up to eleven projects need no new render.
Add a `cases` entry too if it should appear in shot 07.

## Re-rendering the tree

Only needed when the tree's shape changes. Blender 4.2+ as a Python module (`pip install bpy`):

```sh
python3 scripts/showreel/tree2.py layers --samples 128   # → scripts/showreel/render/tree/ (git-ignored)
python3 scripts/showreel/build_atlas.py                  # → static/showreel/tree/*.webp, src/data/showreel-tree.json
```

`tree2.py preview` renders a single still for checking the shape; `tree2.py anchors` re-projects the
anchor points without rendering.
