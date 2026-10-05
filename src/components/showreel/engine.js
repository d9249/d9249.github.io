/*
 * Showreel engine — the home page's eight shots (hook, grow, skills, stamp, mosaic,
 * check, cases, end card), their tree compositor, scroll engine and ▶ playback.
 *
 * mountShowreel(root, DATA, TREE) wires everything under `root` (the .reel element
 * rendered by <Showreel/>) and returns a teardown that removes every window
 * listener, observer, timer and animation frame, so Gatsby route changes leave
 * nothing behind.
 *
 * DATA: src/data/showreel.json (research, trunk, stages, skills, cases, fruits)
 * TREE: src/data/showreel-tree.json (layer anchors + sprite atlas map; atlases in
 *       static/showreel/tree/, built by scripts/showreel/build_atlas.py)
 */
export function mountShowreel(root, DATA, TREE) {
  let alive = true,
    rafId = 0;
  const disposers = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    disposers.push(() => target.removeEventListener(type, fn, opts));
  };

  /* ─────────── data (inlined at build) ─────────── */
  const SITE = ""; // same-origin links

  const $ = (s, r = root) => r.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const backOut = (x) => {
    const c1 = 1.9,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FPS = 24,
    REEL_SEC = 60;
  const tcStr = (sec) => {
    const f = Math.floor(sec * FPS),
      p = (n) => String(n).padStart(2, "0");
    return `${p(Math.floor(f / (3600 * FPS)))}:${p(Math.floor(f / (60 * FPS)) % 60)}:${p(Math.floor(f / FPS) % 60)}:${p(f % FPS)}`;
  };
  const pad2 = (n) => String(n).padStart(2, "0");
  // the site sets html { scroll-behavior: smooth }; the reel drives the scroll position itself, frame by frame
  const jumpTo = (y) =>
    window.scrollTo({ top: y, left: 0, behavior: "instant" });
  const cssVar = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const tintMe = () => cssVar("--tint-me") || "#2A2C33";

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
    FX.forEach((_, i) => {
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

  /* ─────────── 01 HOOK ─────────── */
  const hookSec = $("#hook"),
    hookCanvas = $("#hookCanvas"),
    hctx = hookCanvas.getContext("2d"),
    hookPanel = $(".panel--hook");
  const hookStore = {};
  function fitTree(b, x0, y0, x1, y1, ax = 0.5) {
    // place the frame so tree bounds b fill the box (x0,y0)-(x1,y1)
    const F = Math.min((y1 - y0) / (b[3] - b[1]), (x1 - x0) / (b[2] - b[0]));
    const ox = x0 + (x1 - x0 - (b[2] - b[0]) * F) * ax - b[0] * F,
      oy = y1 - b[3] * F;
    return { F, ox, oy, yG: oy + G0[1] * F };
  }
  function hookLayout(W, H) {
    const mob = W < 760;
    const top = mob
      ? hookPanel.getBoundingClientRect().bottom -
        hookSec.getBoundingClientRect().top +
        10
      : 92;
    return mob
      ? fitTree(TB, 12, top, W - 12, H - 46 - 16)
      : fitTree(TB, W * 0.47, top, W - 40, H - 46 - 20);
  }
  function drawHook(now) {
    const r = hookCanvas.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || !r.width) return false;
    const dpr = Math.min(devicePixelRatio || 1, 2),
      W = r.width,
      H = r.height;
    if (
      hookCanvas.width !== Math.round(W * dpr) ||
      hookCanvas.height !== Math.round(H * dpr)
    ) {
      hookCanvas.width = Math.round(W * dpr);
      hookCanvas.height = Math.round(H * dpr);
    }
    hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hctx.clearRect(0, 0, W, H);
    const G = hookLayout(W, H);
    drawShadow(hctx, G, N, 1);
    const st = treeCache(hookStore, G, dpr, {}, "hook");
    drawSwayed(hctx, st, G.yG, swayK(now, 0.016));
    return !rm;
  }

  /* ─────────── 02 GROW: roots → trunk → a branch per project, leaves one by one → fruit ─────────── */
  const runSec = $("#run"),
    runStage = $("#run .stage--run"),
    canvas = $("#runCanvas"),
    ctx = canvas.getContext("2d");
  const detail = $("#pDetail"),
    pCount = $("#pCount"),
    pList = $("#pList"),
    dock = $("#runDock"),
    runPanel = $(".run-panel");
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const runStore = {};
  let L = null,
    sel = null,
    hover = null; // sel / hover: { k: "p", j } | { k: "r", i }

  const RS = DATA.research || [],
    TIPS = TREE.root_tips || [];
  // research i sits on the i-th root counted from the left
  const tipOf = TIPS.map((p, k) => k).sort((a, b) => TIPS[a][0] - TIPS[b][0]);
  const RSN = Math.min(RS.length, TIPS.length);
  const resStart = (i) => TL.roots + 0.12 + i * 0.1;
  $("#rpLede").textContent =
    `석사 과정에서 쓴 논문들이 뿌리와 기둥이 됐고, 현업의 AI 프로젝트 ${N}개가 가지마다 잎으로 붙었습니다. 열매는 그 프로젝트가 낸 성과입니다.`;
  $("#rCount").textContent = String(RS.length);
  $("#bCount").textContent = String(N);
  const rRows = RS.map((r, i) => {
    const li = document.createElement("li"),
      a = document.createElement("a");
    a.href = /^https?:/.test(r.href) ? r.href : SITE + r.href;
    a.style.setProperty("--c", r.color || "var(--fg)");
    a.innerHTML = `<span>${r.id}</span><i class="sq"></i><b>${r.short}<small>${r.year}</small></b><span class="rv">${r.venue}</span>`;
    bindSel(a, { k: "q", i });
    li.append(a);
    $("#rList").append(li);
    return li;
  });
  const rPins = RS.slice(0, RSN).map((r, i) => {
    const e = document.createElement("a");
    e.className = "pin pin-r";
    e.textContent = r.id;
    if (r.color) e.style.setProperty("--c", r.color);
    e.href = rRows[i].firstChild.href;
    bindSel(e, { k: "q", i });
    $("#pins").append(e);
    return e;
  });
  const rLabs = RS.slice(0, RSN).map((r, i) => {
    const e = document.createElement("a");
    e.className = "root-lab";
    e.href = rRows[i].firstChild.href;
    const v = r.venue.split(" · "),
      tag = v[0] === r.short ? v[1] || "" : v[0];
    e.innerHTML = `<b>${r.short}</b>${tag} · ${r.year}`;
    bindSel(e, { k: "q", i });
    $("#rootTags").append(e);
    return e;
  });
  const rows = P.map((s, j) => {
    const li = document.createElement("li"),
      a = document.createElement("a");
    a.href = SITE + s.href;
    a.style.setProperty("--c", leafHex(j));
    a.innerHTML = `<span>${pad2(j + 1)}</span><i></i><b>${s.name}<small>${s.year}</small></b>${s.fruit ? `<span class="fr">${s.fruit}</span>` : "<span></span>"}`;
    bindSel(a, { k: "p", j });
    li.append(a);
    pList.append(li);
    return li;
  });
  const pins = P.map((s, j) => {
    const e = document.createElement("span");
    e.className = "pin";
    e.textContent = pad2(j + 1);
    $("#pins").append(e);
    return e;
  });
  const hits = P.map((s, j) => {
    const a = document.createElement("a");
    a.className = "hit";
    a.href = SITE + s.href;
    a.innerHTML = `<span class="sr">${pad2(j + 1)} ${s.kr || s.name}</span>`;
    bindSel(a, { k: "p", j });
    $("#hits").append(a);
    return a;
  });
  const fruitHits = P.map((s, j) => {
    if (!s.fruit) return null;
    const a = document.createElement("a");
    a.className = "hit";
    a.href = SITE + s.href;
    a.innerHTML = `<span class="sr">${s.fruit}</span>`;
    bindSel(a, { k: "p", j });
    $("#hits").append(a);
    return a;
  });
  const trunkTag = $("#trunkTag");
  trunkTag.innerHTML = `<b>${DATA.trunk.name}</b>${DATA.trunk.year} · 뿌리와 기둥`;
  const rootHit = document.createElement("a");
  rootHit.className = "hit hit-root";
  rootHit.href = SITE + "/research/";
  rootHit.innerHTML = `<span class="sr">뿌리와 기둥: ${DATA.trunk.name}, 연구 ${RT.length}갈래</span>`;
  $("#hits").prepend(rootHit);
  [rootHit, trunkTag].forEach((e) => bindSel(e, { k: "r" }));
  function bindSel(a, s) {
    a.addEventListener("pointerenter", () => {
      if (fine) {
        hover = s;
        select(s);
      }
    });
    a.addEventListener("pointerleave", () => {
      if (hover && same(hover, s)) {
        hover = null;
        queue();
      }
    });
    a.addEventListener("focus", () => select(s));
    a.addEventListener("click", (e) => {
      if (!fine && !(sel && same(sel, s))) {
        e.preventDefault();
        select(s);
      }
    }); // touch: first tap previews
  }
  const same = (a, b) => a && b && a.k === b.k && a.j === b.j && a.i === b.i;
  const hintHTML = `<p class="d-hint">${fine ? "가지 · 뿌리 · 목록에 마우스를 올리면 내용이 보입니다." : "가지나 뿌리의 R 핀을 누르면 내용이 보입니다."}</p>`;
  function select(s) {
    sel = s;
    if (s.k === "p") {
      const p = P[s.j];
      detail.innerHTML = `<p class="d-meta">BRANCH ${pad2(s.j + 1)} · ${p.year} · ${p.org}</p><p class="d-name">${p.name}${p.kr ? ` <small>${p.kr}</small>` : ""}</p>
      <p class="d-line">${p.line}</p><div class="d-foot">${p.fruit ? `<span class="d-fruit">● ${p.fruit}</span>` : ""}<a class="d-link" href="${SITE + p.href}">상세 보기 →</a></div>`;
      pCount.textContent = `${pad2(s.j + 1)} / ${pad2(N)}`;
    } else if (s.k === "q") {
      const r = RS[s.i],
        href = /^https?:/.test(r.href) ? r.href : SITE + r.href;
      detail.innerHTML = `<p class="d-meta">ROOT ${r.id} · ${r.year} · ${r.venue}</p><p class="d-name">${r.title}</p>
      <p class="d-line">${r.note}</p><div class="d-foot"><a class="d-link" href="${href}">${/doi\.org|dcollection/.test(href) ? "논문 보기 →" : "연구 목록 →"}</a></div>`;
    } else {
      const tr = DATA.trunk;
      detail.innerHTML = `<p class="d-meta">ROOTS · TRUNK · ${tr.years || tr.year}</p><p class="d-name">${tr.name}</p>
      <p class="d-line">${RT.map((r) => r.name).join(" · ")}</p><div class="d-foot">${tr.out ? `<span class="d-fruit" style="background:var(--fg);color:var(--bg)">${tr.out}</span>` : ""}<a class="d-link" href="${SITE}/research/">연구 목록 →</a></div>`;
    }
    rows.forEach((li, j) =>
      li.firstChild.classList.toggle("sel", s.k === "p" && s.j === j),
    );
    pins.forEach((e, j) => e.classList.toggle("sel", s.k === "p" && s.j === j));
    rRows.forEach((li, i) =>
      li.firstChild.classList.toggle("sel", s.k === "q" && s.i === i),
    );
    rPins.forEach((e, i) =>
      e.classList.toggle("sel", s.k === "q" && s.i === i),
    );
    rLabs.forEach((e, i) =>
      e.classList.toggle("sel", s.k === "q" && s.i === i),
    );
    queue();
  }
  detail.innerHTML = hintHTML;
  $("#prevP").addEventListener("click", () =>
    select({ k: "p", j: !sel || sel.k !== "p" ? N - 1 : (sel.j + N - 1) % N }),
  );
  $("#nextP").addEventListener("click", () =>
    select({ k: "p", j: !sel || sel.k !== "p" ? 0 : (sel.j + 1) % N }),
  );
  pCount.textContent = `— / ${pad2(N)}`;

  function runLayout() {
    const W = runStage.clientWidth,
      H = runStage.clientHeight,
      mob = W < 760,
      gut = clamp(W * 0.04, 16, 56);
    if (mob) {
      if (dock.parentNode !== runStage) runStage.append(dock);
    } else if (dock.parentNode !== runPanel) runPanel.append(dock);
    const sr = runStage.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio || 1, 2);
    let G;
    if (mob) {
      const top = runPanel.getBoundingClientRect().bottom - sr.top + 8,
        bot = dock.getBoundingClientRect().top - sr.top - 10;
      G = fitTree(TB, gut - 4, top, W - gut + 4, bot);
    } else {
      const left = runPanel.getBoundingClientRect().right - sr.left + 40;
      G = fitTree(TB, left, 104, W - gut, H - 46 - 18 - 50);
    }
    return { W, H, mob, gut, dpr, ...G };
  }
  function sizeCanvas() {
    L = runLayout();
    canvas.width = Math.round(L.W * L.dpr);
    canvas.height = Math.round(L.H * L.dpr);
    P.forEach((s, j) => {
      // hit areas over each leaf clump and fruit
      const c = SL[j].center,
        r = clusterR(j) * L.F,
        hs = hits[j].style;
      hs.left = L.ox + c[0] * L.F - r + "px";
      hs.top = L.oy + c[1] * L.F - r + "px";
      hs.width = hs.height = 2 * r + "px";
      const ps = pins[j].style;
      ps.left = L.ox + c[0] * L.F + "px";
      ps.top = L.oy + c[1] * L.F + "px";
      if (fruitHits[j]) {
        const f = SL[j].fruit,
          fs = fruitHits[j].style,
          fr = Math.max(14, 0.03 * L.F);
        fs.left = L.ox + f[0] * L.F - fr + "px";
        fs.top = L.oy + f[1] * L.F - fr + "px";
        fs.width = fs.height = 2 * fr + "px";
      }
    });
    // research: a pin on each root tip; on wide screens a label row under the roots, joined by leader lines
    const rsp = TREE.sprites.roots,
      rb = (rsp[6] + rsp[8]) / RES,
      rx0 = rsp[5] / RES - 0.05,
      rx1 = (rsp[5] + rsp[7]) / RES + 0.05;
    L.rpins = rPins.map((e, i) => {
      const p = TIPS[tipOf[i]],
        x = L.ox + p[0] * L.F,
        y = L.oy + p[1] * L.F;
      e.style.left = x + "px";
      e.style.top = y + "px";
      return [x, y];
    });
    const leftB = L.mob
      ? 8
      : runPanel.getBoundingClientRect().right -
        runStage.getBoundingClientRect().left +
        24;
    const lx0 = L.mob ? Math.max(L.ox + rx0 * L.F, 8) : leftB,
      lx1 = L.mob ? Math.min(L.ox + rx1 * L.F, L.W - 8) : L.W - L.gut,
      ly = L.oy + rb * L.F + 22;
    L.rlabs = rLabs.map((e, i) => {
      const x =
        RSN > 1 ? lx0 + ((lx1 - lx0) * (i + 0.5)) / RSN : (lx0 + lx1) / 2;
      e.style.left = x + "px";
      e.style.top = ly + "px";
      e.style.width = Math.max(60, (lx1 - lx0) / RSN - 8) + "px";
      return [x, ly];
    });
    const tm = TREE.trunk.mid,
      tr = TREE.base[1][0],
      ty = G0[1] - (G0[1] - tm[1]) * 0.5;
    trunkTag.style.left = L.ox + (tr + 0.004) * L.F + "px";
    trunkTag.style.top = L.oy + ty * L.F + "px";
    const rs = TREE.sprites.roots,
      k = L.F / RES,
      rh = rootHit.style; // roots + trunk as one hover target
    rh.left = L.ox + TREE.base[0][0] * L.F - 8 + "px";
    rh.width = (TREE.base[1][0] - TREE.base[0][0]) * L.F + 16 + "px";
    rh.top = L.oy + ty * L.F - 40 + "px";
    rh.height = L.oy + (rs[6] + rs[8]) * k - (L.oy + ty * L.F - 40) + "px";
    rh.borderRadius = "8px";
  }

  // playback: starts when the shot fills the screen, like the other shots; resets once it's gone
  const grow = { t0: null };
  const growT = (now) =>
    rm ? Infinity : grow.t0 == null ? -1 : (now - grow.t0) / 1000;
  function drawRun(now) {
    if (!L) return false;
    const { W, H, dpr, F, yG } = L,
      t = growT(now),
      G = { ox: L.ox, oy: L.oy, F };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const focusSel = hover || sel,
      focus = focusSel && focusSel.k === "p" && t >= T_END ? focusSel.j : -1;
    if (t >= 0) {
      if (t < T_END) drawTree(ctx, G, { t, shadow: true });
      else {
        drawShadow(ctx, G, N, 1);
        const st = treeCache(runStore, G, dpr, { focus }, "run" + focus);
        drawSwayed(ctx, st, yG, swayK(now, 0.012) * clamp((t - T_END) / 1.6));
      }
    }
    // research: leader lines from each root tip down to its label
    if (!L.mob && t >= 0) {
      const fg = cssVar("--fg"),
        qs = focusSel && focusSel.k === "q" ? focusSel.i : -1;
      ctx.save();
      ctx.strokeStyle = fg;
      ctx.lineWidth = 1;
      L.rpins.forEach((p, i) => {
        const k = clamp((t - resStart(i) - 0.3) / 0.4);
        if (k <= 0) return;
        const q = L.rlabs[i];
        ctx.globalAlpha = (qs < 0 ? 0.4 : qs === i ? 0.9 : 0.16) * k;
        ctx.setLineDash(qs === i ? [] : [2, 3]);
        ctx.beginPath();
        ctx.moveTo(p[0], p[1] + 9);
        ctx.bezierCurveTo(
          p[0],
          p[1] + 9 + (q[1] - p[1]) * 0.45,
          q[0],
          q[1] - (q[1] - p[1]) * 0.45,
          q[0],
          q[1] - 2,
        );
        ctx.stroke();
      });
      ctx.restore();
    }
    // overlays follow the timeline
    rRows.forEach((li, i) =>
      li.style.setProperty("--on", t >= resStart(i) ? 1 : 0),
    );
    rPins.forEach((e, i) => {
      const p = clamp((t - resStart(i) - 0.15) / 0.3);
      e.style.setProperty("--s", (p < 1 ? backOut(p) : 1).toFixed(3));
      e.style.pointerEvents = p > 0 ? "auto" : "none";
    });
    rLabs.forEach((e, i) =>
      e.style.setProperty("--on", t >= resStart(i) + 0.45 ? 1 : 0),
    );
    rows.forEach((li, j) =>
      li.style.setProperty("--on", t >= projStart(j) + 0.1 ? 1 : 0),
    );
    pins.forEach((e, j) => {
      const p = clamp((t - projStart(j) - 0.25) / 0.3);
      e.style.setProperty("--s", (p < 1 ? backOut(p) : 1).toFixed(3));
      e.style.opacity = focus >= 0 && focus !== j ? 0.35 : 1;
    });
    hits.forEach((a, j) => {
      const on = t >= projStart(j);
      a.style.pointerEvents = on ? "auto" : "none";
      a.tabIndex = on ? 0 : -1;
    });
    fruitHits.forEach((a, j) => {
      if (!a) return;
      const on = t >= fruitStart(j);
      a.style.pointerEvents = on ? "auto" : "none";
      a.tabIndex = on ? 0 : -1;
    });
    trunkTag.style.setProperty(
      "--on",
      t >= TL.trunk + TL.trunkDur * 0.8 ? 1 : 0,
    );
    rootHit.style.pointerEvents = t >= TL.trunk ? "auto" : "none";
    return !rm && t >= 0;
  }

  /* ─────────── 03 DOWNLOAD: the skill set, installed package by package ─────────── */
  const PKC = {
    amber: ["#F0A030", "#16171B"],
    blue: ["#2B59E8", "#F2EDE3"],
    cyan: ["#2EC4D6", "#16171B"],
    ink: ["#16171B", "#F2EDE3"],
  };
  const STACK = DATA.skills || [];
  const SK_TOTAL = STACK.reduce((n, g) => n + g.items.length, 0);
  $("#dlTotal").textContent = SK_TOTAL;
  const pkgEls = STACK.map((g) => {
    const [c, oc] = /^#/.test(g.c || "")
        ? [g.c, onColor(g.c)]
        : PKC[g.c] || PKC.ink,
      a = document.createElement("a");
    a.className = "pkg";
    a.href = SITE + "/projects/";
    a.style.setProperty("--c", c);
    a.style.setProperty("--oc", oc);
    a.innerHTML = `<div class="pkg-top"><code>${g.pkg}</code><span><b>00</b> / ${pad2(g.items.length)}</span></div>
    <h3 class="pkg-kr"><i></i>${g.kr}</h3><ul class="pkg-skills">${g.items.map((x) => `<li>${x}</li>`).join("")}</ul>
    ${g.used ? `<p class="pkg-used"><span>쓰인 곳</span>${g.used}</p>` : ""}`;
    $("#pkgs").append(a);
    return {
      a,
      n: a.querySelector(".pkg-top b"),
      lis: [...a.querySelectorAll(".pkg-skills li")],
      total: g.items.length,
      pkg: g.pkg,
    };
  });
  let skLast = "";
  function drawDownload(k) {
    let inst = 0,
      cur = null;
    pkgEls.forEach((p, i) => {
      const t = clamp((k - i * 0.12) / 0.3),
        n = Math.round(t * p.total);
      p.a.style.setProperty("--k", t.toFixed(3));
      p.n.textContent = pad2(n);
      inst += n;
      p.lis.forEach((li, j) => li.classList.toggle("on", j < n));
      if (t > 0 && t < 1 && !cur) cur = p.pkg;
    });
    $("#dlCount").textContent = inst;
    const log =
      inst >= SK_TOTAL
        ? `<span class="ok">✓</span> Successfully installed ${SK_TOTAL} capabilities`
        : cur
          ? `<span class="dim">Installing</span> ${cur} <span class="dim">…</span>`
          : `<span class="dim">Collecting sangmin-lee from d9249.github.io</span>`;
    if (log !== skLast) {
      $("#skLog").innerHTML = log;
      skLast = log;
    }
  }
  /* ─────────── 04 STAMP ─────────── */
  const stamps = [...root.querySelectorAll(".stamp")],
    ledgerRows = [...root.querySelectorAll("#ledger li")];
  let landed = 0;
  function drawStamp(k) {
    let n = 0;
    stamps.forEach((s, i) => {
      const on = k > 0.04 + i * 0.15;
      s.classList.toggle("on", on);
      ledgerRows[i].classList.toggle("on", on);
      if (on) n++;
    });
    if (n > landed && !rm) {
      const sh = $("#sheet");
      sh.classList.remove("shake");
      void sh.offsetWidth;
      sh.classList.add("shake");
    }
    landed = n;
  }
  /* ─────────── 05 MOSAIC / 06 CHECK ─────────── */
  const tiles = [...root.querySelectorAll(".tile")];
  const drawMosaic = (k) =>
    tiles.forEach((t, i) =>
      t.style.setProperty("--k", ease(clamp((k - i * 0.06) / 0.5)).toFixed(4)),
    );
  const qaRows = [...root.querySelectorAll("#qa li:not(.qa-h)")];
  function drawCheck(k) {
    let pass = 0;
    qaRows.forEach((li, i) => {
      const t = clamp((k - 0.05 - i * 0.14) / 0.1);
      li.style.setProperty("--k", t.toFixed(3));
      li.classList.toggle("on", t >= 1);
      if (t >= 1) pass++;
    });
    $("#pass").textContent = pass;
  }

  /* time-based players: each 2D shot plays through once it fills the screen, resets once it's gone */
  const players = [
    { sec: $("#skills"), dur: 2600, draw: drawDownload },
    { sec: $("#stamp"), dur: 2300, draw: drawStamp },
    { sec: $("#mosaic"), dur: 1500, draw: drawMosaic },
    { sec: $("#check"), dur: 2000, draw: drawCheck },
  ].map((p) => ({ ...p, t0: null, k: 0 }));
  players.forEach((p) => p.draw(0));
  function tickPlayers(now) {
    let busy = false;
    for (const p of players) {
      const r = p.sec.getBoundingClientRect(),
        vh = innerHeight;
      if (p.t0 == null && r.top <= vh * 0.35 && r.bottom >= vh * 0.65)
        p.t0 = now;
      if (p.t0 != null && (r.top >= vh || r.bottom <= 0)) {
        p.t0 = null;
        p.k = 0;
        p.draw(0);
      }
      if (p.t0 != null && p.k < 1) {
        p.k = rm ? 1 : clamp((now - p.t0) / p.dur);
        p.draw(p.k);
        busy = busy || p.k < 1;
      }
    }
    return busy;
  }

  /* ─────────── 07 CASES: a few projects — the problem, what I did, which capabilities it grew ─────────── */
  const flipSec = $("#flip"),
    cutsEl = $("#cuts");
  const CASES = (DATA.cases || [])
    .map((cs) => ({ ...cs, j: P.findIndex((p) => p.name === cs.name) }))
    .filter((cs) => cs.j >= 0);
  const NC = Math.max(1, CASES.length);
  const PKG = Object.fromEntries((DATA.skills || []).map((g) => [g.pkg, g]));
  const pkgHex = (pkg) => {
    const c = (PKG[pkg] || {}).c || "";
    return /^#/.test(c) ? c : (PKC[c] || PKC.ink)[0];
  };
  const cuts = CASES.map((cs, n) => {
    const p = P[cs.j],
      dark = n % 2 === 0,
      leaf = leafHex(cs.j),
      touched = new Set(cs.grew.map((g) => g.pkg));
    const bgc = dark ? mix(leaf, "#0D0E11", 0.8) : mix(leaf, "#F4EFE6", 0.87);
    const f = document.createElement("figure");
    f.className = "cut case " + (dark ? "b-ink" : "b-paper");
    f.dataset.bg = dark ? "ink" : "paper";
    f.style.setProperty("--bgc", bgc);
    f.style.setProperty("--leaf", leaf);
    f.innerHTML = `<div class="case-in">
    <div class="case-head">
      <div>
        <p class="ci">CASE ${pad2(n + 1)} / ${pad2(NC)} · ${cs.period} · ${p.org}</p>
        <h3 class="case-name"><i style="background:${leaf}"></i>${p.name}${p.kr ? `<small>${p.kr}</small>` : ""}</h3>
        <p class="case-role"><b>역할</b>${cs.role}</p>
      </div>
      <div class="case-qbox">
        <p class="case-q">${cs.problem}</p>
        <div class="case-foot"><span class="case-res">● ${cs.result}</span><a href="${SITE + p.href}" tabindex="-1">상세 보기 →</a></div>
      </div>
    </div>
    <div class="case-vis"><img class="case-img" alt="" width="720" height="720"></div>
    <div class="case-r">
      <p class="case-h">키운 역량 <span>${cs.grew.length}</span></p>
      <ol class="case-grew">${cs.grew.map((g, k) => `<li style="--c:${pkgHex(g.pkg)};--d:${k}"><code>${g.pkg}</code><b>${g.skills}</b><span>${g.how}</span></li>`).join("")}</ol>
      <div class="case-pk" aria-label="닿은 역량 묶음">${(DATA.skills || []).map((g) => `<span class="${touched.has(g.pkg) ? "on" : ""}" style="--c:${pkgHex(g.pkg)};--on:${onColor(pkgHex(g.pkg))}">${g.kr}</span>`).join("")}</div>
    </div>
  </div>`;
    cutsEl.append(f);
    return f;
  });
  let flipPainted = false;
  function paintFlip() {
    if (flipPainted || !ready()) return;
    cuts.forEach((c, n) => {
      const bgc = c.style.getPropertyValue("--bgc").trim(),
        dark = c.dataset.bg === "ink";
      const pal = dark
        ? {
            wood: mix(bgc, "#F2EDE3", 0.55),
            mute: mix(bgc, "#F2EDE3", 0.16),
            fruit: mix(bgc, "#F2EDE3", 0.3),
          }
        : {
            wood: "#2A2C33",
            mute: mix(bgc, "#16171B", 0.14),
            fruit: mix(bgc, "#16171B", 0.22),
          };
      const t = branchCut(CASES[n].j, 720, pal, 0.4);
      if (t) c.querySelector(".case-img").src = t.toDataURL("image/webp", 0.9);
    });
    flipPainted = true;
  }
  // the whole tree in muted tones, cropped around one clump that keeps its colour (and its fruit)
  function branchCut(j, px, pal, side = 0.5) {
    const c = SL[j].center,
      F = px / side;
    const G = {
      F,
      ox: -(c[0] - side * 0.5) * F,
      oy: -(c[1] - side * 0.46) * F,
    };
    const cv = document.createElement("canvas");
    cv.width = cv.height = px;
    const x = cv.getContext("2d");
    x.imageSmoothingQuality = "high";
    drawTree(x, G, {
      t: Infinity,
      wood: pal.wood,
      leafOf: (k, i) => (k === j ? leafVar(k, i) : pal.mute),
      fruitOf: (k) => (k === j ? AMBER : pal.fruit),
    });
    x.globalCompositeOperation = "destination-in"; // soft crop
    const g = x.createRadialGradient(
      px / 2,
      px * 0.48,
      px * 0.3,
      px / 2,
      px * 0.48,
      px * 0.52,
    );
    g.addColorStop(0, "#000");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, px, px);
    return cv;
  }
  function drawFlip(x) {
    // x: continuous cut index
    paintFlip();
    const i = Math.floor(x),
      t = x - i,
      cur = Math.round(x);
    cuts.forEach((c, j) => {
      const wipe = j <= i ? 0 : j === i + 1 ? (1 - ease(t)) * 100 : 100;
      c.style.setProperty("--wipe", wipe.toFixed(2) + "%");
      c.style.setProperty(
        "--par",
        (j === i ? t : j === i + 1 ? t - 1 : 0).toFixed(3),
      );
      c.style.visibility = wipe >= 100 || j < i - 1 ? "hidden" : "visible";
      c.classList.toggle("on", j === cur || (j === i + 1 && t > 0.35));
      c.querySelectorAll("a").forEach((a) => (a.tabIndex = j === cur ? 0 : -1));
    });
    $("#flipNo").textContent = `CASE ${pad2(cur + 1)} / ${pad2(NC)}`;
  }

  /* ─────────── 08 END: room for the next branch ─────────── */
  const endCanvas = $("#endCanvas"),
    ectx = endCanvas.getContext("2d"),
    endSec = $("#end"),
    endCap = $("#endCap"),
    endStore = {};
  endCap.querySelector("em").textContent = `${pad2(N + 1)} · 다음 프로젝트`;
  function drawEnd(now) {
    const r = endCanvas.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || !r.width) return false;
    const dpr = Math.min(devicePixelRatio || 1, 2),
      W = r.width,
      H = r.height;
    if (
      endCanvas.width !== Math.round(W * dpr) ||
      endCanvas.height !== Math.round(H * dpr)
    ) {
      endCanvas.width = Math.round(W * dpr);
      endCanvas.height = Math.round(H * dpr);
    }
    ectx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ectx.clearRect(0, 0, W, H);
    const G = fitTree(TBN, 4, 6, W - 4, H - 6),
      F = G.F,
      yG = G.yG;
    drawShadow(ectx, G, N, 1);
    const st = treeCache(endStore, G, dpr, { next: true }, "end");
    drawSwayed(ectx, st, yG, swayK(now, 0.014));
    if (N < SL.length) {
      // where the next branch will carry its leaves
      const c = SL[N].center,
        rr = clusterR(N) * F * 0.8,
        cx = G.ox + c[0] * F,
        cy = G.oy + c[1] * F;
      ectx.save();
      ectx.setLineDash([3, 5]);
      ectx.lineWidth = 1.4;
      ectx.strokeStyle = cssVar("--fg");
      ectx.globalAlpha = 0.55;
      ectx.beginPath();
      ectx.arc(cx, cy, rr, 0, 7);
      ectx.stroke();
      ectx.restore();
      endCap.style.left = cx + "px";
      endCap.style.top = cy - rr - 6 + "px";
      endCap.style.transform = "translate(-50%,-100%)";
    }
    return !rm;
  }
  $("#copyMail").addEventListener("click", () => {
    const txt = $("#mailAddr").textContent,
      note = $("#copyNote");
    const fallback = () => {
      const rg = document.createRange();
      rg.selectNodeContents($("#mailAddr"));
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(rg);
      note.textContent = "주소를 선택했습니다. 복사해 주세요.";
    };
    try {
      navigator.clipboard
        .writeText(txt)
        .then(() => (note.textContent = "복사했습니다"), fallback);
    } catch (e) {
      fallback();
    }
  });

  /* ─────────── scroll engine: section lengths, rests, settle, reel playback ─────────── */
  const PF = 0.3,
    QF = 0.3; // cases: rest / transition lengths in viewport heights
  const SHOTS = [
    "HOOK",
    "GROW",
    "DOWNLOAD",
    "STAMP",
    "MOSAIC",
    "CHECK",
    "CASES",
    "END CARD",
  ];
  const sticky2D = [
    runSec,
    $("#skills"),
    $("#stamp"),
    $("#mosaic"),
    $("#check"),
  ];
  let vh = innerHeight,
    rests = [],
    targets = [],
    maxScroll = 1,
    reelEnd = 1,
    geo = {};
  const hud = $(".hud"),
    mast = document.querySelector(".masthead");
  function measure() {
    vh = innerHeight;
    root.style.setProperty("--hh", (mast ? mast.offsetHeight : 0) + "px"); // the site header sits above every shot
    flipSec.style.height = (NC * PF + (NC - 1) * QF) * vh + vh + "px";
    sticky2D.forEach((s) => (s.style.height = 1.55 * vh + "px"));
    const top = (el) => el.getBoundingClientRect().top + scrollY;
    geo = {
      hook: top(hookSec),
      run: top(runSec),
      flip: top(flipSec),
      end: top(endSec),
    };
    maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    rests = [[geo.hook, geo.hook]];
    sticky2D.forEach((s) => {
      const a = top(s);
      rests.push([a, a + s.offsetHeight - vh]);
    });
    for (let i = 0; i < NC; i++) {
      const a = geo.flip + i * (PF + QF) * vh;
      rests.push([a, a + PF * vh]);
    }
    reelEnd = Math.min(
      maxScroll,
      Math.max(geo.end, geo.end + endSec.offsetHeight - vh),
    ); // the reel ends with the end card; career, posts and footer follow
    rests.push([Math.min(geo.end, maxScroll), reelEnd]);
    rests.sort((a, b) => a[0] - b[0]);
    targets = [
      geo.hook,
      ...sticky2D.map(top),
      geo.flip,
      Math.min(geo.end, maxScroll),
    ];
    root.querySelectorAll("[data-in]").forEach((el) => {
      const s = top(el.closest("[data-shot]"));
      el.textContent =
        "TC " + tcStr((Math.min(s, reelEnd) / reelEnd) * REEL_SEC);
    });
    sizeCanvas();
  }
  function uFrom(local, P_, Q_, count) {
    const unit = (P_ + Q_) * vh,
      i = Math.floor(local / unit),
      r = local - i * unit;
    if (i >= count - 1) return count - 1;
    return r <= P_ * vh ? i : i + (r - P_ * vh) / (Q_ * vh);
  }

  /* moves: one smooth scroll at a time; any input from the reader cancels it */
  const sine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  let anim = null,
    endT = 0,
    touching = false;
  function animateTo(y, dur, curve = sine) {
    stopAnim(true);
    y = clamp(Math.round(y), 0, maxScroll);
    const y0 = scrollY,
      dist = y - y0;
    if (Math.abs(dist) < 2 || rm) {
      if (rm) jumpTo(y);
      return Promise.resolve(true);
    }
    dur = dur ?? clamp(520 + (Math.abs(dist) / vh) * 640, 600, 1900);
    return new Promise((done) => {
      const a = (anim = { cancel: false, done }),
        t0 = performance.now();
      const step = (now) => {
        if (a.cancel || !alive) return;
        const k = clamp((now - t0) / dur);
        jumpTo(y0 + dist * curve(k));
        if (k < 1) requestAnimationFrame(step);
        else {
          if (anim === a) anim = null;
          done(true);
        }
      };
      requestAnimationFrame(step);
    });
  }
  function stopAnim(quiet) {
    if (anim) {
      anim.cancel = true;
      anim.done(false);
      anim = null;
    }
    if (!quiet) pausePlay();
  }
  const fromReader = (e) =>
    !(e.target && e.target.closest && e.target.closest(".hud"));
  ["wheel", "touchstart", "pointerdown"].forEach((ev) =>
    on(
      window,
      ev,
      (e) => {
        if (fromReader(e)) stopAnim();
      },
      { passive: true },
    ),
  );
  on(window, "keydown", (e) => {
    if (fromReader(e) && /^(Arrow|Page|Home|End| )/.test(e.key)) stopAnim();
  });
  on(window, "touchstart", () => (touching = true), { passive: true });
  on(
    window,
    "touchend",
    () => {
      touching = false;
      scheduleSettle();
    },
    { passive: true },
  );

  /* settle: the page is only eased into a composed state when it comes to rest close to one;
   anywhere else it stays exactly where the reader left it — no jumps */
  function settle() {
    if (rm || anim || touching || play.on) return;
    const y = scrollY;
    if (y > reelEnd + 2) return; // past the reel: ordinary page, no settling
    if (rests.some(([a, b]) => y >= a - 2 && y <= b + 2)) return;
    let to = null,
      d = Infinity;
    for (const [a, b] of rests)
      for (const e of [a, b])
        if (Math.abs(e - y) < d) {
          d = Math.abs(e - y);
          to = e;
        }
    const fl = y - geo.flip,
      inFlip = fl > 0 && fl < flipSec.offsetHeight - vh;
    if (d <= (inFlip ? QF * vh * 0.5 + 4 : vh * 0.16))
      animateTo(
        to + (to > y ? 1 : -1),
        clamp(240 + d * 1.6, 260, 520),
        easeOut,
      );
  }
  function scheduleSettle(ms = 260) {
    clearTimeout(endT);
    endT = setTimeout(settle, ms);
  }
  if ("onscrollend" in window)
    on(window, "scrollend", () => scheduleSettle(140));

  /* ▶ reel playback: each shot is brought up, allowed to finish, held, then the next one comes in */
  const play = { on: false, token: 0 },
    playBtn = $("#playBtn");
  const shotNow = () => {
    const y = scrollY;
    let c = 0;
    targets.forEach((t, i) => {
      if (y >= t - vh * 0.45) c = i;
    });
    return c;
  };
  let playKey = "";
  function playUI() {
    const atEnd = !play.on && scrollY >= reelEnd - 4,
      key = play.on + "|" + atEnd;
    if (key === playKey) return;
    playKey = key;
    playBtn.setAttribute("aria-pressed", String(play.on));
    hud.classList.toggle("playing", play.on);
    playBtn.querySelector("span").textContent = play.on
      ? "일시정지"
      : atEnd
        ? "처음부터"
        : "재생";
    playBtn.dataset.icon = play.on ? "pause" : atEnd ? "again" : "play";
  }
  function pausePlay() {
    if (play.on) {
      play.on = false;
      play.token++;
      playUI();
    }
  }
  async function runPlay() {
    const tok = ++play.token;
    play.on = true;
    playUI();
    const live = () => alive && play.on && play.token === tok;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const until = async (cond, max) => {
      const t0 = performance.now();
      while (live() && !cond() && performance.now() - t0 < max) await wait(60);
    };
    const go = async (y) => live() && (await animateTo(y));
    let i = scrollY >= reelEnd - 4 ? 0 : shotNow();
    if (i === 0 && scrollY > 2) await go(0);
    for (; i < SHOTS.length && live(); i++) {
      if (i === 6) {
        // cases: one cut after another, long enough to read
        const c0 =
          scrollY > geo.flip
            ? Math.round(uFrom(scrollY - geo.flip, PF, QF, NC))
            : 0;
        for (let c = c0; c < NC && live(); c++) {
          await go(geo.flip + c * (PF + QF) * vh + 2);
          await wait(c === NC - 1 ? 2600 : 3200);
        }
        continue;
      }
      await go(i === 7 ? targets[7] : targets[i] + (i ? 2 : 0));
      if (!live()) break;
      if (i === 0) await wait(2400);
      else if (i === 1) {
        await until(() => growT(performance.now()) >= T_END + 1.2, 16000);
      } else if (i <= 5) {
        const p = players[i - 2];
        await until(() => p.k >= 1, 6000);
        await wait(1300);
      } else await wait(600);
    }
    if (live()) {
      play.on = false;
      playUI();
    }
  }
  playBtn.addEventListener("click", () => {
    if (play.on) {
      stopAnim(true);
      pausePlay();
    } else runPlay();
  });

  /* ─────────── frame loop ─────────── */
  const rail = $("#rail");
  const railBtns = SHOTS.map((s, i) => {
    const li = document.createElement("li"),
      b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<span>${pad2(i + 1)}</span><em>${s}</em>`;
    b.setAttribute("aria-label", `샷 ${i + 1} ${s}로 이동`);
    b.addEventListener("click", () => {
      pausePlay();
      animateTo(i === 7 ? targets[7] : targets[i] + (i ? 2 : 0));
    });
    li.append(b);
    rail.append(li);
    return b;
  });

  let ticking = false;
  function onScroll() {
    if (!anim) scheduleSettle();
    queue();
  }
  function queue() {
    if (alive && !ticking) {
      ticking = true;
      rafId = requestAnimationFrame(frame);
    }
  }
  onFrame = queue;
  function frame(now) {
    ticking = false;
    const y = scrollY;
    $("#tc").textContent = tcStr((Math.min(y, reelEnd) / reelEnd) * REEL_SEC);
    hud.classList.toggle("is-away", y > reelEnd + vh * 0.25);
    const cur = shotNow();
    railBtns.forEach((b, i) =>
      i === cur
        ? b.setAttribute("aria-current", "step")
        : b.removeAttribute("aria-current"),
    );
    if (!play.on) playUI();

    // grow: plays once the shot fills the screen, resets when it has left
    const rr = runSec.getBoundingClientRect();
    if (grow.t0 == null && rr.top <= vh * 0.35 && rr.bottom >= vh * 0.65)
      grow.t0 = now;
    if (grow.t0 != null && (rr.top >= vh || rr.bottom <= 0)) {
      grow.t0 = null;
      hover = null;
    }
    const runVisible = rr.bottom > 0 && rr.top < vh;
    const runLive = runVisible ? drawRun(now) : false;
    const hookLive = y < vh * 1.2 ? drawHook(now) : false;

    // montage
    const fl = y - geo.flip;
    if (fl > -vh && fl < flipSec.offsetHeight)
      drawFlip(uFrom(Math.max(0, fl), PF, QF, NC));

    const busy = tickPlayers(now);
    const endLive = drawEnd(now);
    if (runLive || hookLive || busy || endLive) queue();
  }
  on(window, "scroll", onScroll, { passive: true });
  on(window, "resize", () => {
    measure();
    queue();
  });
  if (document.fonts)
    document.fonts.ready.then(() => {
      if (alive) {
        measure();
        queue();
      }
    });
  measure();
  drawFlip(0);
  playUI();
  queue();

  // theme: the site toggles html[data-theme]; redraw with the new tints
  const themeObserver = new MutationObserver(() => queue());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  disposers.push(() => themeObserver.disconnect());

  return function destroy() {
    alive = false;
    cancelAnimationFrame(rafId);
    clearTimeout(endT);
    stopAnim(true);
    play.on = false;
    play.token++;
    disposers.forEach((d) => d());
  };
}
