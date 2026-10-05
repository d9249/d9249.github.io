import * as React from "react";
import DATA from "../data/showreel.json";
import TREE from "../data/showreel-tree.json";
import { mountShowreel } from "./showreel/engine";
import markup from "./showreel/markup";

/**
 * The home page's eight-shot reel. The markup is static HTML rendered at build time (so the first
 * shot paints before any JS); engine.js then draws the tree, wires scroll + ▶ playback and fills the
 * lists from src/data/showreel.json. Styles: src/styles/showreel.css.
 */
const Showreel = () => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    // a second mount on the same element (fast refresh, strict mode) starts from clean markup
    if (root.dataset.mounted) root.innerHTML = markup;
    root.dataset.mounted = "1";
    return mountShowreel(root, DATA, TREE);
  }, []);

  return (
    <div
      className="reel"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
};

export default React.memo(Showreel);
