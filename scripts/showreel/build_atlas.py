"""Pack the rendered tree layers into the WebP atlases the home showreel draws from.

    python3 scripts/showreel/build_atlas.py path/to/render/tree

Reads <render/tree>/layers.json and one cropped PNG per layer (written by tree2.py) and writes
    static/showreel/tree/t0.webp, t1.webp …   tree sprites at frame scale
    static/showreel/tree/shadow.webp          floor shadows at half scale (soft)
    src/data/showreel-tree.json               anchors + sprite map, read by src/components/Showreel.js

Content (projects, research, skills, cases) lives in src/data/showreel.json and needs no render:
12 branch slots are rendered, so adding a project only means adding it to "stages".
"""
import glob, json, os, sys
import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, "static", "showreel", "tree")
URL = "/showreel/tree/"
MAXW = 2048


def pack(items, maxw=MAXW, pad=2):
    """Shelf-pack (id, w, h) into atlases no wider than maxw. Returns {id: (atlas, x, y)}, [(w, h)]."""
    items = sorted(items, key=lambda t: (-t[2], -t[1]))
    out, sizes = {}, []
    x = y = shelf = 0; ai = 0; used_w = 0
    for iid, w, h in items:
        if x + w > maxw:
            x, y, shelf = 0, y + shelf + pad, 0
        if y + h > maxw:
            sizes.append((used_w, y + shelf)); ai += 1; x = y = shelf = used_w = 0
        out[iid] = (ai, x, y); x += w + pad; shelf = max(shelf, h); used_w = max(used_w, x)
    sizes.append((used_w, y + shelf))
    return out, sizes


def soft_shadow(im, fx, fy, ground, res):
    """Keep a soft pool around the foot of the trunk: elliptical falloff from the ground point."""
    a = np.asarray(im).astype(np.float32); h, w = a.shape[:2]
    X = (np.arange(w) + fx) / res; Y = (np.arange(h) + fy) / res
    gx, gy = ground
    dx = (X[None, :] - gx - 0.03) / 0.3; dy = (Y[:, None] - gy) / 0.06
    a[..., 3] *= np.exp(-(dx ** 2 + np.where(dy < 0, dy, dy * 1.6) ** 2) * 1.1)
    return Image.fromarray(a.clip(0, 255).astype("uint8"), "RGBA")


def main(tree_dir):
    meta = json.load(open(os.path.join(tree_dir, "layers.json")))
    layers = meta.pop("layers")
    data = json.load(open(os.path.join(REPO, "src", "data", "showreel.json"), encoding="utf-8"))
    nslots = len(meta["slots"])
    assert len(data["stages"]) <= nslots - 1, f"{len(data['stages'])} projects; {nslots} branch slots rendered (one kept free) — add SLOTS in tree2.py"
    os.makedirs(OUT, exist_ok=True)
    for f in glob.glob(os.path.join(OUT, "*.webp")): os.remove(f)

    sprites = {k: v for k, v in layers.items() if not k.startswith("s")}
    shadows = {k: v for k, v in layers.items() if k.startswith("s")}
    place, sizes = pack([(k, v[2], v[3]) for k, v in sprites.items()])
    atlases = [Image.new("RGBA", s, (0, 0, 0, 0)) for s in sizes]
    S = {}
    for k, (ai, x, y) in place.items():
        atlases[ai].paste(Image.open(os.path.join(tree_dir, k + ".png")).convert("RGBA"), (x, y))
        fx, fy, w, h = layers[k]
        S[k] = [ai, x, y, w, h, fx, fy, w, h]          # atlas, ax, ay, aw, ah, frame x, y, w, h
    names = []
    for i, a in enumerate(atlases):
        a.save(os.path.join(OUT, f"t{i}.webp"), "WEBP", quality=88, alpha_quality=92, method=6); names.append(f"{URL}t{i}")
    col, yy = [], 0
    for k in sorted(shadows):
        fx, fy, w, h = layers[k]
        im = soft_shadow(Image.open(os.path.join(tree_dir, k + ".png")).convert("RGBA"), fx, fy, meta["ground"], meta["res"])
        im = im.resize((max(1, w // 2), max(1, h // 2)), Image.LANCZOS)
        col.append((k, im, yy)); yy += im.height + 2
    sa = Image.new("RGBA", (max(im.width for _, im, _ in col), yy), (0, 0, 0, 0))
    for k, im, y0 in col:
        sa.paste(im, (0, y0)); fx, fy, w, h = layers[k]
        S[k] = [len(names), 0, y0, im.width, im.height, fx, fy, w, h]
    sa.save(os.path.join(OUT, "shadow.webp"), "WEBP", quality=80, alpha_quality=80, method=6); names.append(f"{URL}shadow")

    meta["sprites"] = S; meta["atlases"] = names
    with open(os.path.join(REPO, "src", "data", "showreel-tree.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, separators=(",", ":"))
    total = sum(os.path.getsize(p) for p in glob.glob(os.path.join(OUT, "*.webp")))
    print(f"sprites={len(sprites)} shadows={len(shadows)} atlases={[a.size for a in atlases]} shadow={sa.size} "
          f"projects={len(data['stages'])}/{nslots - 1} webp={total / 1e6:.2f}MB")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO, "scripts", "showreel", "render", "tree"))
