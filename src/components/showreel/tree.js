/*
 * The tree compositor shared by the home reel and the pages (the projects index, the research
 * roots): loads the sprite atlases, tints each layer (gradient map: shade → colour → gloss), and
 * draws the tree as it stands at time t — roots, trunk, a branch per project with its leaves,
 * fruit for results. `focus` dims every branch but one.
 *
 * DATA: src/data/showreel.json · TREE: src/data/showreel-tree.json (atlases in static/showreel/tree/)
 */
export function createTreeKit({
  DATA,
  TREE,
  tintMe = () => "#2A2C33",
  rm = false,
}) {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const backOut = (x) => {
    const c1 = 1.9,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };
  const pad2 = (n) => String(n).padStart(2, "0");

  const P = DATA.stages,
    N = P.length,
    RT = DATA.roots || [],
    FX = (DATA.fruits_extra || []).slice(0, 1);
  const RES = TREE.res,
    SL = TREE.slots,
    G0 = TREE.ground;
  const AMBER = "#F08A24"; // results: mandarin
  const LEAF = [
    "#2EC4D6",
    "#2B59E8",
    "#33B07E",
    "#6A5BDB",
    "#1690A6",
    "#4C93F5",
    "#7CC46A",
    "#283A9E",
    "#3FA9C9",
    "#5B6FE0",
    "#52B79A",
    "#4058C8",
  ];
  const leafHex = (j) =>
    (P[j] && P[j].leaf) ||
    LEAF[((j % LEAF.length) + LEAF.length) % LEAF.length]; // one leaf colour per project
  const hex2rgb = (h) => {
    h = h.replace("#", "");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  };
  const rgb2hex = (c) =>
    "#" +
    c
      .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
      .join("");
  const shade = (hex, f) =>
    rgb2hex(hex2rgb(hex).map((v) => (f > 0 ? v + (255 - v) * f : v * (1 + f))));
  const lumi = (hex) => {
    const [r, g, b] = hex2rgb(hex).map((v) => {
      v /= 255;
      return v <= 0.04 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const onColor = (hex) => (lumi(hex) > 0.36 ? "#16171B" : "#F7F3EA");
  const mix = (h1, h2, t) => {
    const a = hex2rgb(h1),
      b = hex2rgb(h2);
    return rgb2hex(a.map((v, i) => v + (b[i] - v) * t));
  };
  const leafVar = (j, i) =>
    shade(leafHex(j), (((i * 37 + j * 11) % 7) - 3) * 0.028); // no two leaves quite the same

  /* ─────────── sprites: one atlas of cropped layers, tinted per use ─────────── */
  const atl = [];
  let onFrame = () => {};
  const setOnFrame = (fn) => {
    onFrame = fn;
  };
  TREE.atlases.forEach((n, i) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => {
      atl[i] = im;
      onFrame();
    };
    im.src = n + ".webp";
  });
  const ready = () => TREE.atlases.every((_, i) => atl[i]);
  const scache = new Map();
  let canRead = true;
  function spr(id, hex) {
    const s = TREE.sprites[id];
    if (!s || !atl[s[0]]) return null;
    const key = id + "|" + (hex || "-");
    let c = scache.get(key);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = s[3];
    c.height = s[4];
    const x = c.getContext("2d", { willReadFrequently: !!hex });
    x.drawImage(atl[s[0]], s[1], s[2], s[3], s[4], 0, 0, s[3], s[4]);
    if (hex && canRead) {
      try {
        // gradient map: shade → colour → gloss, so the render's lighting survives the recolour
        const T = hex2rgb(hex),
          S = T.map((v) => v * 0.36),
          Hh = T.map((v) => v + (255 - v) * 0.62);
        const d = x.getImageData(0, 0, c.width, c.height),
          p = d.data;
        for (let i = 0; i < p.length; i += 4) {
          if (!p[i + 3]) continue;
          const L = (0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2]) / 255;
          let t = clamp((L - 0.4) / 0.42);
          t = t * t * (3 - 2 * t);
          const sp = clamp((L - 0.86) / 0.12);
          for (let ch = 0; ch < 3; ch++) {
            const b = S[ch] + (T[ch] - S[ch]) * t;
            p[i + ch] = b + (Hh[ch] - b) * sp;
          }
        }
        x.putImageData(d, 0, 0);
      } catch (e) {
        canRead = false;
      }
    }
    scache.set(key, c);
    return c;
  }
  // G = { ox, oy, F }: where the 1440 render frame sits on a canvas (CSS px), F = frame size
  function drawSpr(c2d, G, id, hex, alpha = 1, scale = 1, pivot = null) {
    if (alpha <= 0.003) return;
    const s = TREE.sprites[id],
      c = s && spr(id, hex);
    if (!c) return;
    const k = G.F / RES,
      dx = G.ox + s[5] * k,
      dy = G.oy + s[6] * k,
      dw = s[7] * k,
      dh = s[8] * k;
    c2d.globalAlpha = alpha;
    if (scale !== 1 && pivot) {
      const px = G.ox + pivot[0] * G.F,
        py = G.oy + pivot[1] * G.F;
      c2d.save();
      c2d.translate(px, py);
      c2d.scale(scale, scale);
      c2d.translate(-px, -py);
      c2d.drawImage(c, dx, dy, dw, dh);
      c2d.restore();
    } else c2d.drawImage(c, dx, dy, dw, dh);
    c2d.globalAlpha = 1;
  }
  // the tree's extent on the frame (normalised), for fitting it to a canvas
  function treeBounds(n, next) {
    let b = [1, 1, 0, 0];
    const add = (id) => {
      const s = TREE.sprites[id];
      if (!s) return;
      b = [
        Math.min(b[0], s[5] / RES),
        Math.min(b[1], s[6] / RES),
        Math.max(b[2], (s[5] + s[7]) / RES),
        Math.max(b[3], (s[6] + s[8]) / RES),
      ];
    };
    add("roots");
    add("trunk");
    for (let k = 0; k < n + (next ? 1 : 0) && k < SL.length; k++) {
      add("b" + pad2(k));
      if (k < n) SL[k].leaves.forEach((_, i) => add(`l${pad2(k)}_${pad2(i)}`));
    }
    P.forEach((s, k) => {
      if (s.fruit && k < n) {
        add("f" + pad2(k));
        add("fl" + pad2(k));
      }
    });
    if (FX.length) {
      add("fcrown");
      add("flcrown");
    }
    if (next && n < SL.length) {
      const c = SL[n].center,
        r =
          Math.max(
            ...SL[n].leaves.map((l) =>
              Math.hypot(l.tip[0] - c[0], l.tip[1] - c[1]),
            ),
          ) *
            0.8 +
          0.02;
      b = [
        Math.min(b[0], c[0] - r),
        Math.min(b[1], c[1] - r),
        Math.max(b[2], c[0] + r),
        Math.max(b[3], c[1] + r + 0.04),
      ];
    }
    return b;
  }
  const TB = treeBounds(N, false),
    TBN = treeBounds(N, true);
  const clusterR = (k) =>
    Math.max(
      ...SL[k].leaves.map((l) =>
        Math.hypot(l.tip[0] - SL[k].center[0], l.tip[1] - SL[k].center[1]),
      ),
    ) * 0.82;

  /* ─────────── timeline: roots → trunk → a branch per project, leaves one by one → fruit ─────────── */
  const TL = {
    roots: 0.15,
    rootDur: 0.8,
    trunk: 0.75,
    trunkDur: 0.8,
    p0: 1.8,
    gap: 0.52,
    br: 0.3,
    lgap: 0.027,
    ldur: 0.34,
    fdur: 0.45,
  };
  const projStart = (j) => TL.p0 + j * TL.gap;
  const leafStart = (j, i) => projStart(j) + 0.2 + i * TL.lgap;
  const fruitStart = (j) => leafStart(j, SL[j].leaves.length - 1) + 0.14;
  const extraStart = (i) =>
    projStart(N - 1) + 0.2 + SL[N - 1].leaves.length * TL.lgap + 0.55 + i * 0.2;
  const T_END = extraStart(FX.length) + 0.3;

  // floor shadow of the tree with ne branches (fractional: crossfade), clipped at the ground line
  function drawShadow(c2d, G, ne, a) {
    if (a <= 0) return;
    const i = Math.min(Math.floor(ne), SL.length),
      f = ne - i;
    drawSpr(c2d, G, "s" + pad2(i), null, a * (1 - f));
    if (f > 0 && i < SL.length) drawSpr(c2d, G, "s" + pad2(i + 1), null, a * f);
  }
  // draw the tree as it stands at time t (Infinity = complete); o tunes colours, focus and the NEXT ghost
  function drawTree(c2d, G, o = {}) {
    const t = o.t ?? Infinity,
      n = o.n ?? N,
      focus = o.focus ?? -1,
      wood = o.wood || tintMe();
    const dimA = o.dimA ?? 0.2,
      dim = (k) => (focus >= 0 && k !== focus ? dimA : 1);
    if (o.shadow) {
      let ne = 0;
      for (let j = 0; j < n; j++)
        ne += clamp((t - projStart(j)) / (TL.gap + 0.25));
      drawShadow(
        c2d,
        G,
        ne,
        clamp((t - TL.trunk) / TL.trunkDur) * (o.shadowA ?? 1),
      );
    }
    const rp = clamp((t - TL.roots) / TL.rootDur);
    if (rp > 0) {
      if (rp < 1) {
        // the roots spread out from the foot of the trunk
        const s = TREE.sprites.roots,
          k = G.F / RES,
          cx = G.ox + G0[0] * G.F,
          cy = G.oy + G0[1] * G.F;
        const far =
          Math.max(
            Math.abs(G.ox + s[5] * k - cx),
            Math.abs(G.ox + (s[5] + s[7]) * k - cx),
          ) + 10;
        c2d.save();
        c2d.beginPath();
        c2d.ellipse(
          cx,
          cy,
          far * easeOut(rp),
          far * 0.5 * easeOut(rp),
          0,
          0,
          7,
        );
        c2d.clip();
        drawSpr(c2d, G, "roots", wood, 1);
        c2d.restore();
      } else drawSpr(c2d, G, "roots", wood, 1);
    }
    const tp = clamp((t - TL.trunk) / TL.trunkDur);
    if (tp > 0) {
      if (tp < 1) {
        // the trunk rises out of the ground
        const s = TREE.sprites.trunk,
          k = G.F / RES,
          yb = G.oy + (s[6] + s[8]) * k + 2,
          h = s[8] * k * easeOut(tp);
        c2d.save();
        c2d.beginPath();
        c2d.rect(G.ox + s[5] * k - 40, yb - h - 2, s[7] * k + 80, h + 6);
        c2d.clip();
        drawSpr(c2d, G, "trunk", wood, o.trunkA ?? 1);
        c2d.restore();
      } else drawSpr(c2d, G, "trunk", wood, o.trunkA ?? 1);
    }
    for (let k = 0; k < n; k++) {
      const S = SL[k],
        a = dim(k),
        bp = clamp((t - projStart(k)) / TL.br),
        bid = "b" + pad2(k),
        bw = o.woodOf ? o.woodOf(k) : wood;
      if (bp <= 0) continue;
      if (bp < 1) {
        // the branch grows out of the trunk: a widening circle from where it joins
        const s = TREE.sprites[bid],
          kk = G.F / RES,
          ax = G.ox + S.attach[0] * G.F,
          ay = G.oy + S.attach[1] * G.F;
        let far = 0;
        for (const [x, y] of [
          [s[5], s[6]],
          [s[5] + s[7], s[6]],
          [s[5], s[6] + s[8]],
          [s[5] + s[7], s[6] + s[8]],
        ])
          far = Math.max(
            far,
            Math.hypot(G.ox + x * kk - ax, G.oy + y * kk - ay),
          );
        c2d.save();
        c2d.beginPath();
        c2d.arc(ax, ay, far * easeOut(bp) + 1, 0, 7);
        c2d.clip();
        drawSpr(c2d, G, bid, bw, a);
        c2d.restore();
      } else drawSpr(c2d, G, bid, bw, a);
      for (let i = 0; i < S.leaves.length; i++) {
        const lp = clamp((t - leafStart(k, i)) / TL.ldur);
        if (lp <= 0) break;
        drawSpr(
          c2d,
          G,
          `l${pad2(k)}_${pad2(i)}`,
          o.leafOf ? o.leafOf(k, i) : leafVar(k, i),
          a * clamp(lp * 4),
          lp < 1 ? Math.max(0.001, backOut(lp)) : 1,
          S.leaves[i].base,
        );
      }
    }
    if (o.next && n < SL.length) drawSpr(c2d, G, "b" + pad2(n), wood, 0.26);
    // fruit: a little mandarin, then its stem and leaf, both growing out of the stalk
    const fruit = (k, body, top, pivot, a, fp, leafHex) => {
      const sc = fp < 1 ? Math.max(0.001, backOut(fp)) : 1,
        al = a * clamp(fp * 4);
      drawSpr(c2d, G, body, o.fruitOf ? o.fruitOf(k) : AMBER, al, sc, pivot);
      drawSpr(c2d, G, top, leafHex, al, sc, pivot);
    };
    for (let k = 0; k < n; k++) {
      if (!P[k] || !P[k].fruit) continue;
      const fp = clamp((t - fruitStart(k)) / TL.fdur);
      if (fp <= 0) continue;
      fruit(
        k,
        "f" + pad2(k),
        "fl" + pad2(k),
        SL[k].stalk,
        dim(k),
        fp,
        o.leafOf ? o.leafOf(k, 0) : leafVar(k, 3),
      );
    }
    (o.noExtra ? [] : FX).forEach((_, i) => {
      const fp = clamp((t - extraStart(i)) / TL.fdur);
      if (fp <= 0) return;
      const c = TREE.crown_fruit;
      fruit(
        -1,
        "fcrown",
        "flcrown",
        [c[0] - 0.004, c[1] - 0.07],
        focus >= 0 && focus !== 99 ? dimA : 1,
        fp,
        o.leafOf ? o.leafOf(-1, 0) : leafVar(0, 2),
      );
    });
  }
  // a finished tree, drawn once into an offscreen canvas and then only swayed
  function treeCache(store, G, dpr, o, key) {
    key = [key, G.F.toFixed(1), dpr, tintMe(), ready()].join("|");
    if (store.key === key && store.c) return store;
    const b = o.next ? TBN : TB,
      x0 = G.ox + b[0] * G.F - 4,
      y0 = G.oy + b[1] * G.F - 4,
      w = (b[2] - b[0]) * G.F + 8,
      h = (b[3] - b[1]) * G.F + 8;
    const c = store.c || document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * dpr));
    c.height = Math.max(1, Math.round(h * dpr));
    const x = c.getContext("2d");
    x.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr);
    x.imageSmoothingQuality = "high";
    drawTree(x, G, o);
    Object.assign(store, { key, c, x0, y0, w, h });
    return store;
  }
  // wind: a gentle skew about the ground line, so the trunk stays planted and the crown moves
  const swayK = (now, amp) =>
    rm
      ? 0
      : amp *
        (Math.sin((now / 1000) * 1.05) * 0.72 +
          Math.sin((now / 1000) * 2.4 + 1.3) * 0.28);
  function drawSwayed(c2d, st, groundY, k) {
    c2d.save();
    c2d.translate(0, groundY);
    c2d.transform(1, 0, -k, 1, 0, 0);
    c2d.translate(0, -groundY);
    c2d.drawImage(st.c, st.x0, st.y0, st.w, st.h);
    c2d.restore();
  }

  function fitTree(b, x0, y0, x1, y1, ax = 0.5) {
    // place the frame so tree bounds b fill the box (x0,y0)-(x1,y1)
    const F = Math.min((y1 - y0) / (b[3] - b[1]), (x1 - x0) / (b[2] - b[0]));
    const ox = x0 + (x1 - x0 - (b[2] - b[0]) * F) * ax - b[0] * F,
      oy = y1 - b[3] * F;
    return { F, ox, oy, yG: oy + G0[1] * F };
  }

  return {
    P,
    N,
    RT,
    FX,
    RES,
    SL,
    G0,
    AMBER,
    leafHex,
    hex2rgb,
    rgb2hex,
    shade,
    lumi,
    onColor,
    mix,
    leafVar,
    ready,
    spr,
    drawSpr,
    treeBounds,
    TB,
    TBN,
    clusterR,
    TL,
    projStart,
    leafStart,
    fruitStart,
    extraStart,
    T_END,
    drawShadow,
    drawTree,
    treeCache,
    swayK,
    drawSwayed,
    fitTree,
    setOnFrame,
  };
}
