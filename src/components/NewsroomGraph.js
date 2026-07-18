import * as React from "react";
import { Link } from "gatsby";

const GOLDEN_ANGLE = 137.508;
const LABEL_ZOOM_THRESHOLD = 0.85;
const HUB_LABEL_COUNT = 14;

const hashString = (value) => {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const clusterHue = (paletteIndex) => (paletteIndex * GOLDEN_ANGLE) % 360;

const clusterColor = (paletteIndex, dark) =>
  dark
    ? `oklch(74% 0.13 ${clusterHue(paletteIndex).toFixed(1)})`
    : `oklch(56% 0.15 ${clusterHue(paletteIndex).toFixed(1)})`;

const truncate = (value, max) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

const getTheme = () =>
  typeof document !== "undefined" &&
  document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";

const THEME_COLORS = {
  light: {
    background: "oklch(99% 0.003 250)",
    edge: "oklch(30% 0.02 245)",
    edgeAlpha: 0.09,
    label: "oklch(24% 0.02 245)",
    halo: "oklch(99% 0.003 250)",
    ring: "oklch(24% 0.02 245)",
  },
  dark: {
    background: "oklch(17% 0.018 250)",
    edge: "oklch(90% 0.01 245)",
    edgeAlpha: 0.1,
    label: "oklch(92% 0.01 245)",
    halo: "oklch(17% 0.018 250)",
    ring: "oklch(94% 0.008 245)",
  },
};

const buildSimulation = (graph) => {
  const clusterByCluster = new Map(
    graph.clusters.map((cluster) => [cluster.id, cluster]),
  );
  const clusterAnchors = new Map();
  const clusterCount = Math.max(1, graph.clusters.length);

  graph.clusters.forEach((cluster, index) => {
    const angle = ((index * GOLDEN_ANGLE) % 360) * (Math.PI / 180);
    const radius = 250 + (index % 3) * 90;

    clusterAnchors.set(cluster.id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.78,
    });
  });

  const nodes = graph.nodes.map((node) => {
    const anchor = clusterAnchors.get(node.cluster) || { x: 0, y: 0 };
    const seed = hashString(node.id);
    const jitterAngle = ((seed % 3600) / 3600) * Math.PI * 2;
    const jitterRadius = 40 + ((seed >>> 12) % 1000) / 12;

    return {
      ...node,
      paletteIndex: clusterByCluster.get(node.cluster)?.paletteIndex || 0,
      clusterLabel: clusterByCluster.get(node.cluster)?.label || node.cluster,
      anchor,
      x: anchor.x + Math.cos(jitterAngle) * jitterRadius,
      y: anchor.y + Math.sin(jitterAngle) * jitterRadius,
      vx: 0,
      vy: 0,
      radius: Math.min(11, 3.6 + Math.sqrt(node.degree || 0) * 1.15),
    };
  });
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const links = graph.links
    .map((link) => ({
      ...link,
      source: nodeById.get(link.source),
      target: nodeById.get(link.target),
    }))
    .filter((link) => link.source && link.target);
  const hubIds = new Set(
    [...nodes]
      .sort((left, right) => (right.degree || 0) - (left.degree || 0))
      .slice(0, HUB_LABEL_COUNT)
      .map((node) => node.id),
  );

  return {
    alpha: 1,
    clusterCount,
    hubIds,
    links,
    nodeById,
    nodes,
  };
};

const tickSimulation = (sim) => {
  const { links, nodes } = sim;
  const alpha = sim.alpha;
  const repulsion = 560;
  const maxRepelDistance = 170;

  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];

    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;

      if (Math.abs(dx) > maxRepelDistance || Math.abs(dy) > maxRepelDistance) {
        continue;
      }

      const distanceSq = Math.max(64, dx * dx + dy * dy);

      if (distanceSq > maxRepelDistance * maxRepelDistance) {
        continue;
      }

      const force = (repulsion / distanceSq) * alpha;
      const distance = Math.sqrt(distanceSq);
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }
  }

  links.forEach((link) => {
    const restLength = link.related ? 44 : 58;
    const strength = Math.min(0.09, 0.028 + link.weight * 0.014);
    const dx = link.target.x - link.source.x;
    const dy = link.target.y - link.source.y;
    const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const displacement = (distance - restLength) * strength * alpha;
    const fx = (dx / distance) * displacement;
    const fy = (dy / distance) * displacement;

    link.source.vx += fx;
    link.source.vy += fy;
    link.target.vx -= fx;
    link.target.vy -= fy;
  });

  nodes.forEach((node) => {
    node.vx += (node.anchor.x - node.x) * 0.012 * alpha;
    node.vy += (node.anchor.y - node.y) * 0.012 * alpha;
    node.vx -= node.x * 0.002 * alpha;
    node.vy -= node.y * 0.002 * alpha;

    if (node.fixed) {
      node.vx = 0;
      node.vy = 0;
      return;
    }

    node.vx *= 0.82;
    node.vy *= 0.82;
    node.x += node.vx;
    node.y += node.vy;
  });

  sim.alpha *= 0.986;
};

const NewsroomGraph = ({ graph }) => {
  const canvasRef = React.useRef(null);
  const shellRef = React.useRef(null);
  const stateRef = React.useRef(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [hiddenClusters, setHiddenClusters] = React.useState(() => new Set());
  const [tooltip, setTooltip] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const [themeName, setThemeName] = React.useState("light");

  React.useEffect(() => {
    setThemeName(getTheme());

    const observer = new MutationObserver(() => setThemeName(getTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const selectedNode = React.useMemo(
    () => graph.nodes.find((node) => node.id === selectedId) || null,
    [graph, selectedId],
  );
  const selectedNeighbors = React.useMemo(() => {
    if (!selectedNode) {
      return [];
    }

    const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));

    return graph.links
      .filter(
        (link) =>
          link.source === selectedNode.id || link.target === selectedNode.id,
      )
      .map((link) => ({
        node: nodeById.get(
          link.source === selectedNode.id ? link.target : link.source,
        ),
        weight: link.weight,
        related: link.related,
      }))
      .filter((entry) => entry.node)
      .sort((left, right) => right.weight - left.weight);
  }, [graph, selectedNode]);

  // Keep view state (filters, selection) in a ref so pointer/draw handlers
  // never force a simulation rebuild.
  const viewRef = React.useRef({
    hiddenClusters,
    hoveredId: null,
    query: "",
    selectedId: null,
    theme: "light",
  });

  const reheat = React.useCallback((amount = 0.3) => {
    const state = stateRef.current;

    if (state) {
      state.sim.alpha = Math.max(state.sim.alpha, amount);
      state.needsDraw = true;
    }
  }, []);

  React.useEffect(() => {
    viewRef.current.hiddenClusters = hiddenClusters;
    viewRef.current.query = query.trim().toLowerCase();
    viewRef.current.selectedId = selectedId;

    if (stateRef.current) {
      stateRef.current.needsDraw = true;
    }
  }, [hiddenClusters, query, selectedId]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;

    if (!canvas || !shell) {
      return undefined;
    }

    const sim = buildSimulation(graph);
    const state = {
      dragNode: null,
      dragging: false,
      moved: false,
      needsDraw: true,
      panStart: null,
      pointerDown: null,
      sim,
      transform: { k: 1, x: 0, y: 0 },
    };
    stateRef.current = state;
    viewRef.current.theme = getTheme();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Settle most of the layout up front; reduced-motion users get a fully
    // settled static layout instead of an animated one.
    const warmupTicks = prefersReducedMotion ? 320 : 90;
    for (let i = 0; i < warmupTicks; i += 1) {
      tickSimulation(sim);
    }
    if (prefersReducedMotion) {
      sim.alpha = 0;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = shell.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      fitToContent();
      state.needsDraw = true;
    };

    const fitToContent = () => {
      if (!sim.nodes.length || !width || !height) {
        return;
      }

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      sim.nodes.forEach((node) => {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x);
        maxY = Math.max(maxY, node.y);
      });

      const padding = 60;
      const contentWidth = Math.max(1, maxX - minX + padding * 2);
      const contentHeight = Math.max(1, maxY - minY + padding * 2);
      const k = Math.min(
        1.4,
        Math.min(width / contentWidth, height / contentHeight),
      );

      state.transform = {
        k,
        x: width / 2 - ((minX + maxX) / 2) * k,
        y: height / 2 - ((minY + maxY) / 2) * k,
      };
    };

    const toWorld = (screenX, screenY) => ({
      x: (screenX - state.transform.x) / state.transform.k,
      y: (screenY - state.transform.y) / state.transform.k,
    });

    const isClusterVisible = (clusterId) =>
      !viewRef.current.hiddenClusters.has(clusterId);

    const matchesQuery = (node) => {
      const { query: activeQuery } = viewRef.current;

      if (!activeQuery) {
        return true;
      }

      return (
        node.title.toLowerCase().includes(activeQuery) ||
        node.clusterLabel.toLowerCase().includes(activeQuery) ||
        node.tagLabels.some((tag) => tag.toLowerCase().includes(activeQuery))
      );
    };

    const findNodeAt = (screenX, screenY) => {
      const world = toWorld(screenX, screenY);
      const threshold = 14 / state.transform.k;
      let best = null;
      let bestDistance = Infinity;

      sim.nodes.forEach((node) => {
        if (!isClusterVisible(node.cluster)) {
          return;
        }

        const dx = node.x - world.x;
        const dy = node.y - world.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (
          distance < Math.max(node.radius + 4, threshold) &&
          distance < bestDistance
        ) {
          best = node;
          bestDistance = distance;
        }
      });

      return best;
    };

    const draw = () => {
      const context = canvas.getContext("2d");

      if (!context || !width || !height) {
        return;
      }

      const view = viewRef.current;
      const dark = view.theme === "dark";
      const colors = THEME_COLORS[view.theme] || THEME_COLORS.light;
      const hasQuery = Boolean(view.query);
      const selected = view.selectedId
        ? sim.nodeById.get(view.selectedId)
        : null;
      const neighborIds = new Set();

      if (selected) {
        sim.links.forEach((link) => {
          if (link.source.id === selected.id) {
            neighborIds.add(link.target.id);
          } else if (link.target.id === selected.id) {
            neighborIds.add(link.source.id);
          }
        });
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.translate(state.transform.x, state.transform.y);
      context.scale(state.transform.k, state.transform.k);

      // Edges.
      sim.links.forEach((link) => {
        if (
          !isClusterVisible(link.source.cluster) ||
          !isClusterVisible(link.target.cluster)
        ) {
          return;
        }

        const touchesSelection =
          selected &&
          (link.source.id === selected.id || link.target.id === selected.id);

        context.beginPath();
        context.moveTo(link.source.x, link.source.y);
        context.lineTo(link.target.x, link.target.y);

        if (touchesSelection) {
          context.strokeStyle = clusterColor(selected.paletteIndex, dark);
          context.globalAlpha = 0.75;
          context.lineWidth = (link.related ? 2.2 : 1.5) / state.transform.k;
        } else {
          context.strokeStyle = colors.edge;
          context.globalAlpha =
            selected || hasQuery ? colors.edgeAlpha * 0.5 : colors.edgeAlpha;
          context.lineWidth = (link.related ? 1.6 : 1) / state.transform.k;
        }

        context.stroke();
        context.globalAlpha = 1;
      });

      // Nodes.
      sim.nodes.forEach((node) => {
        if (!isClusterVisible(node.cluster)) {
          return;
        }

        const isSelected = selected && node.id === selected.id;
        const isNeighbor = neighborIds.has(node.id);
        const matched = matchesQuery(node);
        const dimmed =
          (hasQuery && !matched) ||
          (selected && !isSelected && !isNeighbor && !hasQuery);

        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fillStyle = clusterColor(node.paletteIndex, dark);
        context.globalAlpha = dimmed ? 0.16 : 0.95;
        context.fill();

        if (node.type === "tip" && !dimmed) {
          context.strokeStyle = colors.halo;
          context.lineWidth = 1.4 / state.transform.k;
          context.globalAlpha = 0.9;
          context.stroke();
        }

        if (isSelected || node.id === view.hoveredId) {
          context.strokeStyle = colors.ring;
          context.lineWidth = 1.8 / state.transform.k;
          context.globalAlpha = 1;
          context.stroke();
        }

        context.globalAlpha = 1;
      });

      // Labels: hubs, hovered, selection neighborhood, query matches.
      const labelZoomOk = state.transform.k >= LABEL_ZOOM_THRESHOLD;
      context.font = `600 ${11 / state.transform.k}px ui-sans-serif, system-ui, sans-serif`;
      context.textAlign = "center";

      sim.nodes.forEach((node) => {
        if (!isClusterVisible(node.cluster)) {
          return;
        }

        const isSelected = selected && node.id === selected.id;
        const isNeighbor = neighborIds.has(node.id);
        const matched = hasQuery && matchesQuery(node);
        const isHub = sim.hubIds.has(node.id);
        const showLabel =
          isSelected ||
          node.id === view.hoveredId ||
          (isNeighbor && labelZoomOk) ||
          (matched && labelZoomOk) ||
          (!selected && !hasQuery && isHub && labelZoomOk);

        if (!showLabel) {
          return;
        }

        const label = truncate(node.title, 30);
        const labelY = node.y - node.radius - 5 / state.transform.k;

        context.lineWidth = 3 / state.transform.k;
        context.strokeStyle = colors.halo;
        context.globalAlpha = 0.85;
        context.strokeText(label, node.x, labelY);
        context.globalAlpha = 1;
        context.fillStyle = colors.label;
        context.fillText(label, node.x, labelY);
      });

      context.setTransform(1, 0, 0, 1, 0, 0);
    };

    let frameId = null;

    const loop = () => {
      if (sim.alpha > 0.02) {
        tickSimulation(sim);
        state.needsDraw = true;
      }

      if (state.needsDraw) {
        state.needsDraw = false;
        draw();
      }

      frameId = window.requestAnimationFrame(loop);
    };

    const handlePointerDown = (event) => {
      canvas.setPointerCapture(event.pointerId);
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const node = findNodeAt(x, y);

      state.pointerDown = { x, y };
      state.moved = false;

      if (node) {
        state.dragNode = node;
        node.fixed = true;
      } else {
        state.panStart = {
          x: x - state.transform.x,
          y: y - state.transform.y,
        };
      }
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (state.pointerDown) {
        const totalDx = x - state.pointerDown.x;
        const totalDy = y - state.pointerDown.y;

        if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) > 4) {
          state.moved = true;
        }
      }

      if (state.dragNode) {
        const world = toWorld(x, y);
        state.dragNode.x = world.x;
        state.dragNode.y = world.y;
        sim.alpha = Math.max(sim.alpha, 0.16);
        state.needsDraw = true;
        setTooltip(null);
        return;
      }

      if (state.panStart) {
        state.transform.x = x - state.panStart.x;
        state.transform.y = y - state.panStart.y;
        state.needsDraw = true;
        setTooltip(null);
        return;
      }

      const node = findNodeAt(x, y);
      const hoveredId = node ? node.id : null;

      if (viewRef.current.hoveredId !== hoveredId) {
        viewRef.current.hoveredId = hoveredId;
        state.needsDraw = true;
      }

      canvas.style.cursor = node ? "pointer" : "grab";
      setTooltip(
        node
          ? {
              title: node.title,
              meta: `${node.type === "tip" ? "Tips" : "Blog"} · ${node.clusterLabel}${node.date ? ` · ${node.date}` : ""}`,
              x,
              y,
            }
          : null,
      );
    };

    const handlePointerUp = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (state.dragNode) {
        state.dragNode.fixed = false;
        if (!state.moved) {
          setSelectedId(state.dragNode.id);
        }
      } else if (!state.moved && state.pointerDown) {
        const node = findNodeAt(x, y);
        setSelectedId(node ? node.id : null);
      }

      state.dragNode = null;
      state.panStart = null;
      state.pointerDown = null;
    };

    const handlePointerLeave = () => {
      viewRef.current.hoveredId = null;
      state.needsDraw = true;
      setTooltip(null);
    };

    const handleWheel = (event) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      const nextK = Math.min(3.4, Math.max(0.25, state.transform.k * factor));
      const appliedFactor = nextK / state.transform.k;

      state.transform.x = x - (x - state.transform.x) * appliedFactor;
      state.transform.y = y - (y - state.transform.y) * appliedFactor;
      state.transform.k = nextK;
      state.needsDraw = true;
    };

    const themeObserver = new MutationObserver(() => {
      viewRef.current.theme = getTheme();
      state.needsDraw = true;
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(shell);
    resize();
    setReady(true);

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    frameId = window.requestAnimationFrame(loop);

    // Expose zoom controls to the toolbar buttons.
    state.zoomBy = (factor) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const nextK = Math.min(3.4, Math.max(0.25, state.transform.k * factor));
      const appliedFactor = nextK / state.transform.k;

      state.transform.x =
        centerX - (centerX - state.transform.x) * appliedFactor;
      state.transform.y =
        centerY - (centerY - state.transform.y) * appliedFactor;
      state.transform.k = nextK;
      state.needsDraw = true;
    };
    state.resetView = () => {
      fitToContent();
      state.needsDraw = true;
    };

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      themeObserver.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("wheel", handleWheel);
      stateRef.current = null;
    };
  }, [graph]);

  const toggleCluster = (clusterId) => {
    setHiddenClusters((previous) => {
      const next = new Set(previous);

      if (next.has(clusterId)) {
        next.delete(clusterId);
      } else {
        next.add(clusterId);
      }

      return next;
    });
    reheat(0.08);
  };

  const dark = ready && themeName === "dark";

  return (
    <div className="newsroom-graph">
      <div className="newsroom-toolbar">
        <input
          type="search"
          className="newsroom-search"
          placeholder="제목·태그·클러스터 검색"
          aria-label="Newsroom 그래프 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div
          className="newsroom-zoom"
          role="group"
          aria-label="그래프 확대 조절"
        >
          <button
            type="button"
            onClick={() => stateRef.current?.zoomBy?.(1.25)}
            aria-label="확대"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => stateRef.current?.zoomBy?.(1 / 1.25)}
            aria-label="축소"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => stateRef.current?.resetView?.()}
            aria-label="화면 맞춤"
          >
            Fit
          </button>
        </div>
      </div>
      <div className="newsroom-legend" aria-label="클러스터 범례">
        {graph.clusters.map((cluster) => (
          <button
            key={cluster.id}
            type="button"
            className={`newsroom-legend-chip${hiddenClusters.has(cluster.id) ? " is-muted" : ""}`}
            onClick={() => toggleCluster(cluster.id)}
            aria-pressed={!hiddenClusters.has(cluster.id)}
          >
            <span
              className="newsroom-legend-dot"
              style={{
                background: clusterColor(cluster.paletteIndex, dark),
              }}
              aria-hidden="true"
            />
            {cluster.label}
            <span className="newsroom-legend-count">{cluster.count}</span>
          </button>
        ))}
      </div>
      <div className="newsroom-stage">
        <div
          className="newsroom-canvas-shell"
          ref={shellRef}
          role="application"
          aria-label="블로그·팁 지식 그래프. 노드를 클릭하면 글 정보가 표시됩니다."
        >
          <canvas ref={canvasRef} className="newsroom-canvas" />
          {tooltip && (
            <div
              className="newsroom-tooltip"
              style={{ left: tooltip.x + 14, top: tooltip.y + 12 }}
            >
              <strong>{tooltip.title}</strong>
              <span>{tooltip.meta}</span>
            </div>
          )}
        </div>
        <aside className="newsroom-panel" aria-live="polite">
          {selectedNode ? (
            <>
              <p className="newsroom-panel-kicker">
                {selectedNode.type === "tip" ? "Tips" : "Blog"} ·{" "}
                {graph.clusters.find(
                  (cluster) => cluster.id === selectedNode.cluster,
                )?.label || selectedNode.cluster}
                {selectedNode.date ? ` · ${selectedNode.date}` : ""}
              </p>
              <h3 className="newsroom-panel-title">{selectedNode.title}</h3>
              {selectedNode.description && (
                <p className="newsroom-panel-description">
                  {truncate(selectedNode.description, 180)}
                </p>
              )}
              {selectedNode.tagLabels.length > 0 && (
                <p className="newsroom-panel-tags">
                  {selectedNode.tagLabels.slice(0, 6).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </p>
              )}
              <Link className="newsroom-panel-link" to={selectedNode.id}>
                글 읽기 →
              </Link>
              {selectedNeighbors.length > 0 && (
                <div className="newsroom-panel-related">
                  <h4>연결된 글 {selectedNeighbors.length}건</h4>
                  <ul>
                    {selectedNeighbors.slice(0, 8).map((entry) => (
                      <li key={entry.node.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(entry.node.id)}
                        >
                          {truncate(entry.node.title, 44)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="newsroom-panel-empty">
              <h3>지식 그래프</h3>
              <p>
                노드 하나가 글 하나입니다. 색은 카테고리 클러스터, 연결선은
                태그·related로 이어진 관계입니다. 노드를 클릭하면 여기에서 바로
                글로 이동할 수 있습니다.
              </p>
              <p className="newsroom-panel-hint">
                드래그로 이동, 스크롤로 확대, 흰 테두리 노드는 Tips입니다.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default NewsroomGraph;
