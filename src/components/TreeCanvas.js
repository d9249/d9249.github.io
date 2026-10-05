import * as React from "react";
import DATA from "../data/showreel.json";
import TREE from "../data/showreel-tree.json";
import { createTreeKit } from "./showreel/tree";
import { colorStyle } from "../utils/treeColors";

/*
 * The home reel's tree, drawn once on a page: the projects index (every branch, one per
 * project), a project page (its branch lit, the rest dimmed) and the research page (the roots).
 *
 *   variant  "tree" — roots, trunk, branches, leaves, fruit · "roots" — roots and the foot of the trunk
 *   focus    index of the branch to light (-1: none)
 *   grow     grow the tree in once, the first time it is drawn (skipped for reduced motion)
 *   branches [{ href, label }] per branch → a link over each leaf cluster (keyboard + screen readers)
 *   pins     [{ href, label, short, color }] per root, left to right → a pin at each root tip
 *   onFocusBranch(k) hover / focus on a branch link (-1 on leave)
 *   onSelectBranch(k) a plain click on a branch link; given, it replaces following the link (the
 *            projects index opens that row instead). Modified clicks still open the project page.
 */

let kit = null;
const listeners = new Set();
const getKit = () => {
  if (kit) return kit;
  kit = createTreeKit({
    DATA,
    TREE,
    tintMe: () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--tint-me")
        .trim() || "#2A2C33",
    rm: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  });
  kit.setOnFrame(() => listeners.forEach((fn) => fn()));
  return kit;
};

// the roots and the foot of the trunk; the trunk runs out of the top of the frame
const rootBounds = () => {
  const s = TREE.sprites.roots,
    r = TREE.res;
  const x0 = s[5] / r,
    x1 = (s[5] + s[7]) / r,
    y1 = (s[6] + s[8]) / r;
  return [x0, TREE.ground[1] - 0.16, x1, y1];
};

// research i sits on the i-th root counted from the left (as in the reel)
const tipsLeftToRight = () =>
  (TREE.root_tips || []).slice().sort((a, b) => a[0] - b[0]);

const TreeCanvas = ({
  variant = "tree",
  focus = -1,
  grow = false,
  branches = [],
  pins = [],
  onFocusBranch,
  onSelectBranch,
  next = false,
  nextLabel,
  className,
  label,
}) => {
  const wrapRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [geo, setGeo] = React.useState(null);
  const state = React.useRef({ t: grow ? 0 : Infinity, focus, raf: 0 });
  state.current.focus = focus;

  const draw = React.useCallback(() => {
    const k = getKit(),
      canvas = canvasRef.current;
    if (!canvas || !k.ready()) return;
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = r.width,
      H = r.height;
    if (canvas.width !== Math.round(W * dpr))
      canvas.width = Math.round(W * dpr);
    if (canvas.height !== Math.round(H * dpr))
      canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingQuality = "high";
    const roots = variant === "roots";
    const G = roots
      ? k.fitTree(rootBounds(), 8, 0, W - 8, H - 8)
      : k.fitTree(next ? k.TBN : k.TB, 6, 6, W - 6, H - 6);
    const { t, focus: f } = state.current;
    if (!roots) {
      // the floor shadow, faded to an ellipse under the tree (the reel's band runs edge to edge)
      k.drawShadow(ctx, G, Math.min(k.N, k.SL.length), 0.85);
      const gx = G.ox + k.G0[0] * G.F,
        gy = G.oy + k.G0[1] * G.F,
        rx = G.F * 0.34;
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.translate(gx, gy);
      ctx.scale(1, 0.32);
      const fade = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      fade.addColorStop(0, "rgba(0,0,0,1)");
      fade.addColorStop(0.55, "rgba(0,0,0,.55)");
      fade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fade;
      ctx.fillRect(-rx * 1.2, -rx * 3.2, rx * 2.4, rx * 6.4);
      ctx.restore();
    }
    k.drawTree(ctx, G, {
      t,
      focus: f,
      dimA: 0.16,
      n: roots ? 0 : k.N,
      noExtra: roots,
      next: next && !roots,
    });
    setGeo((prev) =>
      prev && prev.F === G.F && prev.ox === G.ox && prev.oy === G.oy
        ? prev
        : { F: G.F, ox: G.ox, oy: G.oy, W, H },
    );
  }, [variant, next]);

  // grow once, then hold still
  React.useEffect(() => {
    const k = getKit();
    const s = state.current;
    let start = 0;
    const speed = 2.2; // the reel's timeline, played a little faster
    const tick = (now) => {
      if (!start) start = now;
      s.t = ((now - start) / 1000) * speed;
      draw();
      if (s.t < k.T_END) s.raf = requestAnimationFrame(tick);
      else {
        s.t = Infinity;
        draw();
      }
    };
    const begin = () => {
      if (!k.ready()) return;
      listeners.delete(begin);
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (grow && !reduce && s.t !== Infinity)
        s.raf = requestAnimationFrame(tick);
      else {
        s.t = Infinity;
        draw();
      }
    };
    listeners.add(begin);
    begin();
    return () => {
      listeners.delete(begin);
      cancelAnimationFrame(s.raf);
    };
  }, [draw, grow]);

  // redraw on focus, size and theme changes
  React.useEffect(() => {
    if (state.current.t === Infinity) draw();
  }, [focus, draw]);
  React.useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (state.current.t === Infinity) draw();
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    const mo = new MutationObserver(() => draw());
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [draw]);

  const k = typeof window === "undefined" ? null : geo && getKit();
  const place = (p) => ({
    left: geo.ox + p[0] * geo.F,
    top: geo.oy + p[1] * geo.F,
  });

  return (
    <div
      className={["tree-canvas", `tree-canvas--${variant}`, className]
        .filter(Boolean)
        .join(" ")}
      ref={wrapRef}
    >
      <canvas ref={canvasRef} role="img" aria-label={label} />
      {k && variant === "tree"
        ? branches.map((b, i) => {
            if (!b || i >= k.SL.length) return null;
            const c = k.SL[i].center,
              d = k.clusterR(i) * geo.F * 2;
            return (
              <a
                key={b.href}
                className={`tree-canvas-hit${focus === i ? " is-on" : ""}`}
                href={b.href}
                style={{ ...place(c), width: d, height: d }}
                onMouseEnter={() => onFocusBranch && onFocusBranch(i)}
                onMouseLeave={() => onFocusBranch && onFocusBranch(-1)}
                onFocus={() => onFocusBranch && onFocusBranch(i)}
                onBlur={() => onFocusBranch && onFocusBranch(-1)}
                onClick={(e) => {
                  if (
                    !onSelectBranch ||
                    e.button !== 0 ||
                    e.metaKey ||
                    e.ctrlKey ||
                    e.shiftKey ||
                    e.altKey
                  )
                    return;
                  e.preventDefault();
                  onSelectBranch(i);
                }}
              >
                <span className="tree-canvas-tag">{b.label}</span>
              </a>
            );
          })
        : null}
      {k && next && nextLabel && k.N < k.SL.length ? (
        <span
          className="tree-canvas-next"
          style={place(k.SL[k.N].center)}
          aria-hidden="true"
        >
          {nextLabel}
        </span>
      ) : null}
      {k && variant === "roots"
        ? tipsLeftToRight().map((tip, i) => {
            const p = pins[i];
            if (!p) return null;
            return (
              <a
                key={p.href}
                className="tree-canvas-pin"
                href={p.href}
                style={{ ...place(tip), ...colorStyle(p.color) }}
                aria-label={p.label}
              >
                {p.short}
              </a>
            );
          })
        : null}
    </div>
  );
};

export default TreeCanvas;
