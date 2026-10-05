"""
Showreel tree — roots, trunk, and one branch per project.

The roots and trunk are there from the start: the research of the master's
course. Every project is one branch slot on that trunk; its leaves are
separate objects so the page can attach them one at a time. Fruits are the
results (awards, patents, contracts) hanging from a project's branch.

Everything is rendered as separate layers from one fixed orthographic
camera, in paper-white (leaves, fruit) and mid-grey (wood); the page tints
and composites them. Each layer is rendered with every layer drawn before
it as a holdout, so drawing the layers in order rebuilds the tree with the
right occlusion — and any prefix of the order is a valid partial tree.

Order: roots, trunk, then for each slot k: branch k, leaves k_0..k_n;
fruits last (they are drawn on top; they appear in time right after their
project). 12 slots are rendered, so new projects need no new render.

Usage (bpy as a module):
    python3 tree2.py preview [--n 8] [--pct 50] [--samples 12] [--floor]
    python3 tree2.py layers  [--n 8] [--samples 16]
Outputs: render/tree/*.png (cropped) and render/tree/layers.json next to this file;
then run build_atlas.py to pack them for the site.
"""
import bpy, bmesh, math, os, sys, json, argparse, random
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, "render", "tree")   # scripts/showreel/render/tree (git-ignored)
D = math.radians
UP = Vector((0, 0, 1))
RES = 1440

def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)

# ── trunk profile ───────────────────────────────────────────────────────────
TOP = 5.7
def trunk_c(z):   # centre line: a slow S so it doesn't read as a pole
    return Vector((0.14 * math.sin(z * 0.55) - 0.04, 0.04 * math.sin(z * 0.8), z))
def trunk_r(z):
    r = 0.52 - 0.058 * max(0.0, z)
    return r + 0.34 * math.exp(-max(0.0, z + 0.3) * 2.4)      # flare into the roots

# ── branch slots: (height on trunk, leaf-clump centre, clump radius) ────────
# x right, y away from the camera, z up. Order = order of projects; every prefix
# is a balanced crown (low left, low right, middle, top, front), slots 8–11 widen it.
SLOTS = [
    (2.55, (-2.55, -0.25, 3.95), 1.08),
    (2.75, (2.5, -0.35, 4.15), 1.08),
    (3.2, (-1.05, -1.05, 4.75), 1.0),
    (3.85, (1.65, 0.5, 5.6), 1.05),
    (3.6, (-1.55, 0.55, 5.45), 1.05),
    (3.45, (1.05, -1.1, 4.85), 1.0),
    (5.5, (0.05, 0.25, 6.6), 1.08),
    (2.95, (0.0, -1.35, 3.85), 0.98),
    (3.0, (-3.25, 0.75, 4.9), 0.95),
    (3.3, (3.2, 0.7, 5.05), 0.95),
    (4.6, (-0.85, 0.35, 6.75), 0.9),
    (4.8, (0.95, -0.6, 6.35), 0.9),
]

def bezier(p0, p1, p2, t):
    return p0 * (1 - t) ** 2 + p1 * 2 * t * (1 - t) + p2 * t * t

def fib_dirs(n, rnd):
    """Directions over the visible part of a clump: front, sides and top (not the back or underside)."""
    out, i, N = [], 0, n * 3
    while len(out) < n and i < N * 3:
        k = i + 0.5; z = 1 - 2 * k / N; r = math.sqrt(max(0, 1 - z * z)); a = math.pi * (1 + 5 ** 0.5) * k
        v = Vector((r * math.cos(a), r * math.sin(a), z)); i += 1
        if v.y > 0.55 or v.z < -0.45: continue
        out.append(v)
    return out[:n]

class Slot:
    pass

def plan(seed=7):
    """Positions of every branch, leaf and fruit."""
    rnd = random.Random(seed)
    slots = []
    for k, (h, cen, R) in enumerate(SLOTS):
        s = Slot(); s.k = k; C = Vector(cen)
        c = trunk_c(h); hd = Vector((C.x - c.x, C.y - c.y, 0))
        hd = hd.normalized() if hd.length > 1e-3 else Vector((0, 0, 0))
        p0 = c + hd * trunk_r(h) * 0.25
        p1 = p0 + hd * ((C - p0).length * 0.45) + UP * 0.15
        n = 10; r0 = trunk_r(h) * 0.56
        pts = [bezier(p0, p1, C, i / n) for i in range(n + 1)]
        s.stems = [(pts, [r0 * (1 - 0.7 * (i / n) ** 0.9) for i in range(n + 1)])]
        s.attach, s.tip, s.center, s.R = p0, C, C, R
        # leaves shingled over the clump, tips running down the surface
        dirs = fib_dirs(15, rnd)
        dirs.sort(key=lambda v: (-v.z * 0.6 + v.y * 0.4 + rnd.uniform(-0.15, 0.15)))   # attach top/back first, front last
        groups = [Vector(g).normalized() for g in ((-0.8, -0.3, 0.5), (0.8, -0.3, 0.5), (0.0, -0.9, 0.2), (0.0, 0.2, 1.0))]
        gtip = [C + g * R * 0.34 for g in groups]
        for g, gt in zip(groups, gtip):          # four short twigs out of the clump centre
            tp = [C.lerp(gt, i / 4) for i in range(5)]
            s.stems.append((tp, [r0 * 0.3 * (1 - 0.4 * i / 4) for i in range(5)]))
        s.leaves = []
        for v in dirs:
            v = (v + Vector((rnd.uniform(-.12, .12), rnd.uniform(-.12, .12), rnd.uniform(-.12, .12)))).normalized()
            down = -(UP - v * v.dot(UP)); down = down.normalized() if down.length > 1e-3 else Vector((0, -1, 0))
            ld = (down * 0.72 + v * 0.5).normalized()
            base = C + v * R * 0.6
            gi = max(range(4), key=lambda q: groups[q].dot(v)); gt = gtip[gi]
            mid = gt.lerp(base, 0.5) + v * 0.05
            tp = [bezier(gt, mid, base, i / 4) for i in range(5)]
            s.stems.append((tp, [r0 * 0.17 * (1 - 0.35 * i / 4) for i in range(5)]))   # petiole, part of the branch
            s.leaves.append((base, ld, 1.0 + rnd.uniform(-0.08, 0.1), rnd.uniform(-1, 1), v))
        s.fruit = C + Vector((0.3 * (1 if C.x >= 0 else -1), -R * 0.5, -R * 0.32))
        slots.append(s)
    return slots

# ── geometry ────────────────────────────────────────────────────────────────
def link(ob):
    bpy.context.scene.collection.objects.link(ob); return ob

def tube(bm, pts, radii, seg=16, tip=True):
    n = len(pts)
    t0 = (pts[1] - pts[0]).normalized()
    ref = UP if abs(t0.z) < 0.9 else Vector((1, 0, 0))
    nrm = t0.cross(ref).normalized()
    rings = []
    for i in range(n):
        t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
        nrm = (nrm - t * nrm.dot(t)).normalized(); bi = t.cross(nrm)
        rings.append([bm.verts.new(pts[i] + (nrm * math.cos(2 * math.pi * j / seg) + bi * math.sin(2 * math.pi * j / seg)) * radii[i]) for j in range(seg)])
    for i in range(n - 1):
        for j in range(seg):
            bm.faces.new((rings[i][j], rings[i][(j + 1) % seg], rings[i + 1][(j + 1) % seg], rings[i + 1][j]))
    for ring, p, sgn, r in ((rings[0], pts[0], -1, radii[0]), (rings[-1], pts[-1], 1, radii[-1])):
        tdir = ((pts[1] - pts[0]) if sgn < 0 else (pts[-1] - pts[-2])).normalized() * sgn
        c = bm.verts.new(p + tdir * r * (0.7 if tip else 0.1))
        for j in range(seg):
            bm.faces.new((ring[j], ring[(j + 1) % seg], c) if sgn > 0 else (ring[(j + 1) % seg], ring[j], c))

def finish(bm, name, mat, smooth=True, subsurf=0):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = link(bpy.data.objects.new(name, me)); ob.data.materials.append(mat)
    for p in ob.data.polygons: p.use_smooth = smooth
    if subsurf:
        m = ob.modifiers.new("ss", "SUBSURF"); m.levels = subsurf; m.render_levels = subsurf
    return ob

def leaf_object(name, base, ld, size, twist, nrm, mat):
    L, W = 1.22 * size, 0.64 * size
    bm = bmesh.new(); NU, NV = 14, 9; rows = []
    for i in range(NU + 1):
        u = i / NU
        w = W * 0.5 * max(0.05, math.sin(math.pi * min(0.985, u ** 0.75)) ** 0.8)
        row = []
        for j in range(NV):
            v = -1 + 2 * j / (NV - 1)
            row.append(bm.verts.new((v * w, u * L, 0.13 * W * abs(v) ** 1.5 - 0.1 * L * u * u + 0.05 * L * math.sin(math.pi * u))))
        rows.append(row)
    for i in range(NU):
        for j in range(NV - 1):
            bm.faces.new((rows[i][j], rows[i][j + 1], rows[i + 1][j + 1], rows[i + 1][j]))
    ob = finish(bm, name, mat)
    so = ob.modifiers.new("solid", "SOLIDIFY"); so.thickness = 0.04 * size; so.offset = 0
    ss = ob.modifiers.new("ss", "SUBSURF"); ss.levels = 1; ss.render_levels = 1
    # leaf runs along +Y and faces +Z: face it out of the clump, a little toward the camera
    nd = (nrm * 0.8 + Vector((0, -1, 0)) * 0.22 + UP * 0.15 + Vector((twist * 0.2, 0, 0))).normalized()
    Z = (nd - ld * nd.dot(ld)).normalized(); X = ld.cross(Z)
    M = Matrix((X, ld, Z)).transposed().to_4x4(); M.translation = base
    ob.matrix_world = M
    return ob

def make_fruit(tag, T, sx, fruit_mat, leaf_mat):
    """A chubby little mandarin: soft segments, a dimple where a short curved stem goes in, one leaf on the stem.
    Body and stem+leaf are separate layers so the page can colour them apart."""
    FT = T + Vector((sx * 0.06, -0.14, -0.62))          # top of the fruit, where the stem enters
    BC = FT - Vector((0, 0, 0.2))
    bm = bmesh.new(); res = bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=22, radius=1.0)
    for v in res["verts"]:
        x, y, z = v.co; rr = math.sqrt(x * x + y * y); phi = math.atan2(y, x)
        lobe = 1 + 0.03 * math.cos(8 * phi) * rr
        X, Y, Z = x * 0.27 * lobe, y * 0.27 * lobe, z * 0.225
        Z += -0.052 * math.exp(-(rr * rr) / 0.07) if z > 0 else 0.025 * math.exp(-(rr * rr) / 0.05)
        v.co = Vector((X, Y, Z)) + BC
    body = finish(bm, f"f{tag}", fruit_mat, subsurf=1)
    bm = bmesh.new()
    mid = T.lerp(FT, 0.5) + Vector((sx * 0.1, -0.04, 0.06))
    tube(bm, [bezier(T, mid, FT - Vector((0, 0, 0.05)), i / 8) for i in range(9)], [0.026 + 0.012 * i / 8 for i in range(9)], seg=10)
    stem = finish(bm, f"fs{tag}", leaf_mat)
    ld = Vector((sx * 0.85, -0.45, 0.5)).normalized()
    leaflet = leaf_object(f"fl{tag}", FT + Vector((sx * 0.02, -0.02, 0.04)), ld, 0.3, 0.0, Vector((sx * 0.25, -0.8, 0.55)).normalized(), leaf_mat)
    return body, [stem, leaflet], BC

def build(slots, mats):
    wood, leaf, fruit = mats
    objs = {"roots": [], "trunk": [], "slots": [], "fruits": [], "fruit_tops": []}
    rnd = random.Random(5); bm = bmesh.new(); root_tips = []
    for i in range(6):     # surface roots, spreading out of the flare
        az = i * 60 + 12 + rnd.uniform(-12, 12)
        dh = Vector((math.cos(D(az)), math.sin(D(az)), 0))
        R = 2.3 + rnd.uniform(0, 0.8); dep = 0.75 + rnd.uniform(0, 0.45)
        s0 = trunk_c(-0.25) + dh * trunk_r(-0.25) * 0.5
        pts = [s0 + dh * (R * t) - UP * (dep * (0.35 * t + 0.65 * t * t)) for t in [i_ / 12 for i_ in range(13)]]
        tube(bm, pts, [0.36 * (1 - 0.86 * (j / 12) ** 0.7) for j in range(13)], seg=14)
        root_tips.append(pts[-1])
        t, turn = 0.55, (36 if i % 2 else -36)
        j = int(t * 12); q = pts[j]
        dd = Vector((math.cos(D(az + turn)), math.sin(D(az + turn)), -0.45)).normalized()
        sp = [q + dd * (R * 0.42 * u_ / 6) - UP * (0.2 * (u_ / 6) ** 2) for u_ in range(7)]
        rr = 0.34 * (1 - 0.8 * t ** 0.75) * 0.75
        tube(bm, sp, [rr * (1 - 0.7 * u_ / 6) for u_ in range(7)], seg=10)
    objs["roots"].append(finish(bm, "roots", wood))
    # trunk + leader
    bm = bmesh.new(); zs = [-0.45 + (TOP + 0.45) * i / 40 for i in range(41)]
    tube(bm, [trunk_c(z) for z in zs], [trunk_r(z) for z in zs], seg=24, tip=True)
    objs["trunk"].append(finish(bm, "trunk", wood))
    # slots
    for s in slots:
        bm = bmesh.new()
        for pts, rad in s.stems: tube(bm, pts, rad, seg=14)
        br = finish(bm, f"b{s.k:02d}", wood)
        leaves = [leaf_object(f"l{s.k:02d}_{i:02d}", b, ld, sz, tw, nv, leaf) for i, (b, ld, sz, tw, nv) in enumerate(s.leaves)]
        objs["slots"].append({"branch": br, "leaves": leaves})
        body, tops, s.fruit_c = make_fruit(f"{s.k:02d}", s.fruit, 1 if s.tip.x >= 0 else -1, fruit, leaf)
        objs["fruits"].append(body); objs["fruit_tops"].append(tops)
    # one fruit on the crown itself, for results that are not one project's
    T = Vector((1.5, -1.45, 3.6))
    body, tops, c = make_fruit("crown", T, 1, fruit, leaf)
    objs["fruits"].append(body); objs["fruit_tops"].append(tops); objs["crown_fruit"] = c
    objs["root_tips"] = root_tips
    return objs

# ── studio ──────────────────────────────────────────────────────────────────
def look_at(ob, target, flip=False):
    d = (target - ob.location) if not flip else (ob.location - target)
    ob.rotation_euler = d.to_track_quat("-Z" if not flip else "Z", "Y").to_euler()

def emit(name, s):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); o = nt.nodes.new("ShaderNodeOutputMaterial")
    e.inputs["Strength"].default_value = s; nt.links.new(e.outputs[0], o.inputs[0]); return m

def vinyl(name, hexc, rough=0.26, coat=0.8):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(hexc); b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat; b.inputs["Coat Roughness"].default_value = 0.05
    return m

def studio():
    sc = bpy.context.scene
    w = bpy.data.worlds.new("paper"); sc.world = w; w.use_nodes = True
    nt = w.node_tree; bg = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = -1; mr.inputs["From Max"].default_value = 1
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.46; ramp.color_ramp.elements[0].color = lin("#2a2724")
    ramp.color_ramp.elements[1].position = 0.6; ramp.color_ramp.elements[1].color = lin("#e9e2d4")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0]); nt.links.new(sep.outputs["Z"], mr.inputs["Value"])
    nt.links.new(mr.outputs[0], ramp.inputs[0]); nt.links.new(ramp.outputs[0], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.65
    def area(name, loc, size, energy, color=(1, 1, 1), shadow=False):
        ld = bpy.data.lights.new(name, "AREA"); ld.energy = energy; ld.color = color; ld.size = size; ld.use_shadow = shadow
        ob = link(bpy.data.objects.new(name, ld)); ob.location = loc; look_at(ob, Vector((0, 0, 3.5))); return ob
    area("key", (-7, -11, 16), 7, 4600, shadow=True)
    area("fill", (10, -12, 4), 10, 1300, (1.0, 0.94, 0.86))
    area("rim_cyan", (8, 9, 10), 6, 2400, (0.55, 0.9, 1.0))
    area("rim_amber", (-10, 7, 3), 6, 1300, (1.0, 0.72, 0.35))
    area("under", (0, -10, -6), 10, 700, (1.0, 0.97, 0.92))       # lifts the roots out of black (off for floor shadows)
    def strip(name, loc, sx, sz, s):
        me = bpy.data.meshes.new(name); bm = bmesh.new()
        bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
        for v in bm.verts: v.co.x *= sx; v.co.y *= sz
        bm.to_mesh(me); bm.free()
        ob = link(bpy.data.objects.new(name, me)); ob.data.materials.append(emit(name, s))
        ob.location = loc; look_at(ob, Vector((0, 0, 3.5)), flip=True)
        ob.visible_camera = False; ob.visible_shadow = False; ob.visible_diffuse = False
    strip("strip_side", (-13, -9, 6), 1.2, 22, 5); strip("strip_top", (0, -6, 19), 22, 1.5, 4)
    me = bpy.data.meshes.new("floor"); bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=60); bm.to_mesh(me); bm.free()
    fl = link(bpy.data.objects.new("floor", me)); fl.is_shadow_catcher = True; fl.visible_glossy = False
    return fl

CAM_Z, SCALE, ELEV = 3.0, 11.2, 7
def camera():
    cd = bpy.data.cameras.new("cam"); cd.type = "ORTHO"; cd.ortho_scale = SCALE
    cam = link(bpy.data.objects.new("cam", cd)); bpy.context.scene.camera = cam
    cam.location = (0.0, -30, CAM_Z + 30 * math.tan(D(ELEV))); cam.rotation_euler = (D(90 - ELEV), 0, 0)
    return cam

def settings(samples):
    sc = bpy.context.scene; sc.render.engine = "CYCLES"
    cy = sc.cycles; cy.device = "CPU"; cy.samples = samples; cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.04; cy.use_denoising = True; cy.denoiser = "OPENIMAGEDENOISE"
    cy.max_bounces = 4; cy.glossy_bounces = 2; cy.diffuse_bounces = 1; cy.transmission_bounces = 0
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = RES; sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.compression = 30
    sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
    sc.view_settings.exposure = float(os.environ.get("EXPO", "-1.4"))

def proj(p):
    sc = bpy.context.scene; v = world_to_camera_view(sc, sc.camera, p)
    return [round(v.x, 5), round(1 - v.y, 5)]

def setup(n_shade, samples):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    settings(samples); floor = studio(); camera()
    mats = (vinyl("wood", "#9A9389", 0.34), vinyl("leaf", "#F4EFE6", 0.24), vinyl("fruit", "#F4EFE6", 0.12, 1.0))
    slots = plan(); objs = build(slots, mats)
    bpy.context.view_layer.update()
    return slots, objs, floor

# ── render passes ───────────────────────────────────────────────────────────
def state(ob, mode):
    """mode: 'show' (normal), 'hold' (holdout), 'cast' (invisible, still shades), 'off'."""
    ob.hide_render = mode == "off"
    ob.is_holdout = mode == "hold"
    ob.visible_camera = mode != "cast"

def bbox_of(obs, pad=8):
    dg = bpy.context.evaluated_depsgraph_get(); xs, ys = [], []
    for ob in obs:
        ev = ob.evaluated_get(dg); me = ev.to_mesh()
        for v in me.vertices:
            x, y = proj(ev.matrix_world @ v.co); xs.append(x); ys.append(y)
        ev.to_mesh_clear()
    p = pad / RES
    return [max(0, min(xs) - p), max(0, min(ys) - p), min(1, max(xs) + p), min(1, max(ys) + p)]

def render_region(path, box):
    sc = bpy.context.scene; r = sc.render
    r.use_border = True; r.use_crop_to_border = False
    r.border_min_x, r.border_max_x = box[0], box[2]
    r.border_min_y, r.border_max_y = 1 - box[3], 1 - box[1]
    r.filepath = path; bpy.ops.render.render(write_still=True)

def crop_png(path):
    """Crop a full-frame render to its alpha bbox; return [x, y, w, h] in pixels of the frame."""
    from PIL import Image
    im = Image.open(path); bb = im.getchannel("A").point(lambda a: 255 if a > 3 else 0).getbbox()
    if not bb: im.crop((0, 0, 1, 1)).save(path); return [0, 0, 1, 1]
    im.crop(bb).save(path, optimize=True)
    return [bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]]

def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument("mode", choices=["preview", "layers", "anchors"])
    ap.add_argument("--n", type=int, default=8); ap.add_argument("--samples", type=int, default=16)
    ap.add_argument("--pct", type=int, default=100); ap.add_argument("--floor", action="store_true")
    ap.add_argument("--only", default="")
    a = ap.parse_args(argv)
    slots, objs, floor = setup(a.n, a.samples)
    sc = bpy.context.scene; os.makedirs(OUT, exist_ok=True)
    every = objs["roots"] + objs["trunk"] + [o for s in objs["slots"] for o in [s["branch"]] + s["leaves"]] + objs["fruits"] + [o for t in objs["fruit_tops"] for o in t]

    if a.mode == "preview":
        sc.render.resolution_percentage = a.pct
        for ob in every: state(ob, "off")
        for ob in objs["trunk"] + objs["roots"]: state(ob, "show")
        for s in objs["slots"][:a.n]:
            for ob in [s["branch"]] + s["leaves"]: state(ob, "show")
        for f in list(range(a.n)) + [12]:
            for ob in [objs["fruits"][f]] + objs["fruit_tops"][f]: state(ob, "show")
        floor.hide_render = not a.floor
        sc.render.filepath = os.path.join(OUT, f"preview_{a.n:02d}{'_floor' if a.floor else ''}.png")
        bpy.ops.render.render(write_still=True); return

    # anchors: where things are on the frame (normalised, top-left origin)
    meta = {"res": RES, "ground": proj(trunk_c(0)), "trunk": {"mid": proj(trunk_c(1.4)), "top": proj(trunk_c(TOP))},
            "base": [proj(trunk_c(0) - Vector((trunk_r(0), 0, 0))), proj(trunk_c(0) + Vector((trunk_r(0), 0, 0)))], "root_tips": [proj(p) for p in objs["root_tips"]], "slots": [], "crown_fruit": proj(objs["crown_fruit"]),
            "scale": RES / SCALE}
    for s in slots:
        lv = [{"base": proj(b), "tip": proj(b + ld * sz * 1.22)} for (b, ld, sz, tw, nv) in s.leaves]
        cen = Vector((0, 0, 0))
        for (b, ld, sz, tw, nv) in s.leaves: cen += b + ld * sz * 0.5
        cen /= len(s.leaves)
        meta["slots"].append({"attach": proj(s.attach), "tip": proj(s.tip), "center": proj(cen), "fruit": proj(s.fruit_c),
                              "stalk": proj(s.fruit), "leaves": lv, "depth": round(cen.y, 3)})
    if a.mode == "anchors":
        json.dump(meta, open(os.path.join(OUT, "anchors.json"), "w"), indent=1); return

    floor.hide_render = True
    order = [("roots", objs["roots"]), ("trunk", objs["trunk"])]
    for s, so in zip(slots, objs["slots"]):
        order.append((f"b{s.k:02d}", [so["branch"]]))
        for i, lf in enumerate(so["leaves"]): order.append((f"l{s.k:02d}_{i:02d}", [lf]))
    order_ids = [oid for oid, _ in order]
    shade_set = set(o.name for oid, obs in order if not oid.startswith(("b", "l")) or int(oid[1:3]) < a.n for o in obs)
    layers = {}
    only = set(a.only.split(",")) if a.only else None
    def go(oid, cur, before):
        if only and oid not in only and oid[:3] not in only: return
        for ob in every:
            if ob in cur: state(ob, "show")
            elif ob in before: state(ob, "hold")
            elif ob.name in shade_set and ob.name not in [f.name for f in objs["fruits"]]: state(ob, "cast")
            else: state(ob, "off")
        if oid == "roots":                     # roots are underground: no canopy light-blocking games
            for ob in every:
                if ob not in cur and ob not in before: state(ob, "off")
        box = bbox_of(cur, pad=10)
        path = os.path.join(OUT, oid + ".png"); render_region(path, box)
        layers[oid] = crop_png(path); print("layer", oid, layers[oid], flush=True)
    before = []
    for oid, obs in order:
        go(oid, obs, list(before)); before += obs
    # fruits: drawn last, with everything of the shaded tree held out
    hold_f = [o for oid, obs in order for o in obs if o.name in shade_set]
    for fo, tops in zip(objs["fruits"], objs["fruit_tops"]):
        go(fo.name, [fo], hold_f)
        go("fl" + fo.name[1:], tops, hold_f + [fo])
    # floor shadows of the tree with n branches (crossfaded on the page)
    floor.hide_render = False; bpy.data.objects["under"].hide_render = True
    for n in range(len(slots) + 1):
        sid = f"s{n:02d}"
        if only and sid not in only and "s" not in only: continue
        cast = set(o.name for o in objs["trunk"]) | set(o.name for so in objs["slots"][:n] for o in [so["branch"]] + so["leaves"])
        for ob in every: state(ob, "cast" if ob.name in cast else "off")
        path = os.path.join(OUT, sid + ".png")
        render_region(path, [0.0, meta["ground"][1] - 0.1, 1.0, min(1, meta["ground"][1] + 0.06)])
        layers[sid] = crop_png(path); print("shadow", n, flush=True)
    old = {}
    lp = os.path.join(OUT, "layers.json")
    if only and os.path.exists(lp): old = json.load(open(lp)).get("layers", {})
    old.update(layers)
    meta["layers"] = old; meta["order"] = order_ids; meta["n_shade"] = a.n
    json.dump(meta, open(lp, "w"), separators=(",", ":"))

if __name__ == "__main__":
    main()
