import * as React from "react";
import { Link } from "gatsby";

const GOLDEN_ANGLE = 137.508;
const LABEL_ZOOM_THRESHOLD = 0.85;
const HUB_LABEL_COUNT = 14;
const MAX_SEARCH_RESULTS = 8;

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

// Tips cluster labels already carry a "Tips · " prefix, so only blog
// entries need the type prefix added.
const typedClusterLabel = (type, clusterLabel) =>
  type === "tip" ? clusterLabel : `Blog · ${clusterLabel}`;

const getTheme = () =>
  typeof document !== "undefined" &&
  document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";

const THEME_COLORS = {
  light: {
    edge: "oklch(30% 0.02 245)",
    edgeAlpha: 0.09,
    label: "oklch(24% 0.02 245)",
    halo: "oklch(99% 0.003 250)",
    ring: "oklch(24% 0.02 245)",
  },
  dark: {
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
  const neighborsById = new Map();

  links.forEach((link) => {
    if (!neighborsById.has(link.source.id)) {
      neighborsById.set(link.source.id, new Set());
    }
    if (!neighborsById.has(link.target.id)) {
      neighborsById.set(link.target.id, new Set());
    }
    neighborsById.get(link.source.id).add(link.target.id);
    neighborsById.get(link.target.id).add(link.source.id);
  });

  const hubIds = new Set(
    [...nodes]
      .sort((left, right) => (right.degree || 0) - (left.degree || 0))
      .slice(0, HUB_LABEL_COUNT)
      .map((node) => node.id),
  );

  return {
    alpha: 1,
    hubIds,
    links,
    neighborsById,
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
  const searchBoxRef = React.useRef(null);
  const listId = React.useId();
  const [selectedId, setSelectedId] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [activeCluster, setActiveCluster] = React.useState(null);
  const [clustersExpanded, setClustersExpanded] = React.useState(false);
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

  const clusterLabelById = React.useMemo(
    () => new Map(graph.clusters.map((cluster) => [cluster.id, cluster.label])),
    [graph],
  );
  const searchResults = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    const scored = graph.nodes
      .map((node) => {
        const title = node.title.toLowerCase();
        const titleIndex = title.indexOf(normalized);
        const tagHit = node.tagLabels.some((tag) =>
          tag.toLowerCase().includes(normalized),
        );
        const clusterHit = (clusterLabelById.get(node.cluster) || "")
          .toLowerCase()
          .includes(normalized);

        if (titleIndex < 0 && !tagHit && !clusterHit) {
          return null;
        }

        return {
          node,
          score:
            (titleIndex === 0 ? 3 : titleIndex > 0 ? 2 : 0) +
            (tagHit ? 1 : 0) +
            (clusterHit ? 0.5 : 0),
        };
      })
      .filter(Boolean)
      .sort(
        (left, right) =>
          right.score - left.score ||
          (right.node.date || "").localeCompare(left.node.date || ""),
      );

    return scored.slice(0, MAX_SEARCH_RESULTS).map((entry) => entry.node);
  }, [clusterLabelById, graph, query]);

  // Keep view state (filters, selection) in a ref so pointer/draw handlers
  // never force a simulation rebuild.
  const viewRef = React.useRef({
    activeCluster: null,
    hoveredId: null,
    query: "",
    selectedId: null,
    theme: "light",
  });

  React.useEffect(() => {
    viewRef.current.activeCluster = activeCluster;
    viewRef.current.query = query.trim().toLowerCase();
    viewRef.current.selectedId = selectedId;

    if (stateRef.current) {
      stateRef.current.needsDraw = true;
    }
  }, [activeCluster, query, selectedId]);

  // Close the search dropdown when clicking outside of it.
  React.useEffect(() => {
    if (!searchOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!searchBoxRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [searchOpen]);

  const jumpToNode = React.useCallback((nodeId) => {
    setSelectedId(nodeId);
    stateRef.current?.centerOn?.(nodeId);
  }, []);

  const selectCluster = React.useCallback((clusterId) => {
    setActiveCluster(clusterId);
    setSelectedId(null);

    if (clusterId) {
      stateRef.current?.focusCluster?.(clusterId);
    } else {
      stateRef.current?.resetView?.();
    }
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;

    if (!canvas || !shell) {
      return undefined;
    }

    const sim = buildSimulation(graph);
    const state = {
      dragNode: null,
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

    const fitToNodes = (nodes, maxZoom) => {
      if (!nodes.length || !width || !height) {
        return;
      }

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      nodes.forEach((node) => {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x);
        maxY = Math.max(maxY, node.y);
      });

      const padding = 60;
      const contentWidth = Math.max(1, maxX - minX + padding * 2);
      const contentHeight = Math.max(1, maxY - minY + padding * 2);
      const k = Math.min(
        maxZoom,
        Math.min(width / contentWidth, height / contentHeight),
      );

      state.transform = {
        k,
        x: width / 2 - ((minX + maxX) / 2) * k,
        y: height / 2 - ((minY + maxY) / 2) * k,
      };
      state.needsDraw = true;
    };

    const fitToContent = () => fitToNodes(sim.nodes, 1.4);

    const resize = () => {
      const rect = shell.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      fitToContent();
    };

    const toWorld = (screenX, screenY) => ({
      x: (screenX - state.transform.x) / state.transform.k,
      y: (screenY - state.transform.y) / state.transform.k,
    });

    const inActiveCluster = (node) => {
      const { activeCluster: focused } = viewRef.current;

      return !focused || node.cluster === focused;
    };

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
      const hovered = view.hoveredId ? sim.nodeById.get(view.hoveredId) : null;
      const focusNode = hovered || selected;
      const focusNeighborIds = focusNode
        ? sim.neighborsById.get(focusNode.id) || new Set()
        : null;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.translate(state.transform.x, state.transform.y);
      context.scale(state.transform.k, state.transform.k);

      // Edges.
      sim.links.forEach((link) => {
        const clusterDim =
          !inActiveCluster(link.source) || !inActiveCluster(link.target);
        const touchesFocus =
          focusNode &&
          (link.source.id === focusNode.id || link.target.id === focusNode.id);

        context.beginPath();
        context.moveTo(link.source.x, link.source.y);
        context.lineTo(link.target.x, link.target.y);

        if (touchesFocus) {
          context.strokeStyle = clusterColor(focusNode.paletteIndex, dark);
          context.globalAlpha = hovered && !selected ? 0.55 : 0.75;
          context.lineWidth = (link.related ? 2.2 : 1.5) / state.transform.k;
        } else {
          context.strokeStyle = colors.edge;
          context.globalAlpha =
            focusNode || hasQuery || clusterDim
              ? colors.edgeAlpha * 0.45
              : colors.edgeAlpha;
          context.lineWidth = (link.related ? 1.6 : 1) / state.transform.k;
        }

        context.stroke();
        context.globalAlpha = 1;
      });

      // Nodes.
      sim.nodes.forEach((node) => {
        const isFocus = focusNode && node.id === focusNode.id;
        const isFocusNeighbor = focusNeighborIds?.has(node.id);
        const clusterDimmed = !inActiveCluster(node);
        const queryDimmed = hasQuery && !matchesQuery(node);
        const focusDimmed = focusNode && !isFocus && !isFocusNeighbor;
        let alpha = 0.95;

        if (clusterDimmed) {
          alpha = 0.12;
        } else if (queryDimmed) {
          alpha = 0.18;
        } else if (focusDimmed) {
          alpha = 0.3;
        }

        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fillStyle = clusterColor(node.paletteIndex, dark);
        context.globalAlpha = alpha;
        context.fill();

        if (node.type === "tip" && alpha > 0.4) {
          context.strokeStyle = colors.halo;
          context.lineWidth = 1.4 / state.transform.k;
          context.globalAlpha = 0.9;
          context.stroke();
        }

        if (isFocus || (selected && node.id === selected.id)) {
          context.strokeStyle = colors.ring;
          context.lineWidth = 1.8 / state.transform.k;
          context.globalAlpha = 1;
          context.stroke();
        }

        context.globalAlpha = 1;
      });

      // Labels: hubs, hovered/selected neighborhood, query matches.
      const labelZoomOk = state.transform.k >= LABEL_ZOOM_THRESHOLD;
      context.font = `600 ${11 / state.transform.k}px ui-sans-serif, system-ui, sans-serif`;
      context.textAlign = "center";

      sim.nodes.forEach((node) => {
        if (!inActiveCluster(node)) {
          return;
        }

        const isFocus = focusNode && node.id === focusNode.id;
        const isFocusNeighbor = focusNeighborIds?.has(node.id);
        const matched = hasQuery && matchesQuery(node);
        const isHub = sim.hubIds.has(node.id);
        const showLabel =
          isFocus ||
          (isFocusNeighbor && labelZoomOk) ||
          (matched && labelZoomOk) ||
          (!focusNode && !hasQuery && isHub && labelZoomOk);

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
              meta: `${typedClusterLabel(node.type, node.clusterLabel)}${node.date ? ` · ${node.date}` : ""}`,
              connections: node.degree || 0,
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

    // Camera controls used by the toolbar, cluster nav, and search results.
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
    };
    state.focusCluster = (clusterId) => {
      fitToNodes(
        sim.nodes.filter((node) => node.cluster === clusterId),
        1.6,
      );
    };
    state.centerOn = (nodeId) => {
      const node = sim.nodeById.get(nodeId);

      if (!node) {
        return;
      }

      const k = Math.max(state.transform.k, 1.1);

      state.transform = {
        k,
        x: width / 2 - node.x * k,
        y: height / 2 - node.y * k,
      };
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

  const dark = ready && themeName === "dark";
  const activeClusterLabel = activeCluster
    ? clusterLabelById.get(activeCluster) || activeCluster
    : "All";
  const clusterChipProps = (clusterId) => ({
    role: "button",
    tabIndex: 0,
    className: activeCluster === clusterId ? "is-active" : undefined,
    "aria-pressed": activeCluster === clusterId,
    onClick: () => selectCluster(clusterId),
    onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectCluster(clusterId);
      }
    },
  });

  return (
    <div className="newsroom-graph">
      <nav
        className="category-nav newsroom-cluster-nav"
        aria-label="Graph clusters"
        data-expanded={clustersExpanded ? "true" : "false"}
      >
        <div className="category-nav-mobile-header">
          <span className="tag-nav-label">Clusters</span>
          <button
            className="category-nav-toggle"
            type="button"
            aria-controls={listId}
            aria-expanded={clustersExpanded}
            aria-label={
              clustersExpanded
                ? "클러스터 접기"
                : `클러스터 더 보기 (${graph.clusters.length}개 숨김)`
            }
            onClick={() => setClustersExpanded((current) => !current)}
          >
            {clustersExpanded ? "접기" : "더 보기"}
          </button>
        </div>
        <div className="category-nav-list" id={listId}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a key="all" {...clusterChipProps(null)}>
            All
          </a>
          {graph.clusters.map((cluster) => (
            /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
            <a key={cluster.id} {...clusterChipProps(cluster.id)}>
              <span
                className="newsroom-cluster-dot"
                style={{
                  background: clusterColor(cluster.paletteIndex, dark),
                }}
                aria-hidden="true"
              />
              {cluster.label}
              <strong>{cluster.count}</strong>
            </a>
          ))}
        </div>
        <span className="visually-hidden" aria-live="polite">
          현재 클러스터 필터는 {activeClusterLabel}입니다.
        </span>
      </nav>
      <div className="newsroom-toolbar">
        <div className="newsroom-search-box" ref={searchBoxRef}>
          <input
            type="search"
            className="newsroom-search"
            placeholder="제목·태그·클러스터 검색"
            aria-label="Newsroom 그래프 검색"
            aria-expanded={searchOpen && searchResults.length > 0}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && searchResults.length > 0) {
                event.preventDefault();
                jumpToNode(searchResults[0].id);
                setSearchOpen(false);
              }
              if (event.key === "Escape") {
                setSearchOpen(false);
              }
            }}
          />
          {searchOpen && searchResults.length > 0 && (
            <div className="newsroom-search-results" role="listbox">
              {searchResults.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  role="option"
                  aria-selected={node.id === selectedId}
                  onClick={() => {
                    jumpToNode(node.id);
                    setSearchOpen(false);
                  }}
                >
                  <span>{truncate(node.title, 60)}</span>
                  <span className="newsroom-search-result-meta">
                    {typedClusterLabel(
                      node.type,
                      clusterLabelById.get(node.cluster) || node.cluster,
                    )}
                    {node.date ? ` · ${node.date}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
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
            onClick={() => {
              setActiveCluster(null);
              stateRef.current?.resetView?.();
            }}
            aria-label="화면 맞춤"
          >
            Fit
          </button>
        </div>
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
              <span>연결 {tooltip.connections}건 · 클릭해 살펴보기</span>
            </div>
          )}
        </div>
        <aside className="newsroom-panel" aria-live="polite">
          {selectedNode ? (
            <>
              <p className="newsroom-panel-kicker">
                {typedClusterLabel(
                  selectedNode.type,
                  clusterLabelById.get(selectedNode.cluster) ||
                    selectedNode.cluster,
                )}
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
                          onClick={() => jumpToNode(entry.node.id)}
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
                클러스터 칩을 누르면 해당 영역으로 화면이 이동하고, 검색 결과를
                고르면 그래프가 그 글을 중앙에 맞춥니다. 흰 테두리 노드는
                Tips입니다.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default NewsroomGraph;
