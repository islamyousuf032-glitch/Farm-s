#!/usr/bin/env python3
"""Phase A: audit every ground/transition candidate and write tile_manifest.csv.

Samples 9 points per tile (4 corners, 4 edge midpoints, centre; 3x3 average each) and
classifies each as GRASS / DIRT / PATH / WATER / TRANS. Reports alpha coverage, internal
contrast, and a USE/REJECT decision with reason. Writes contact sheets for review.
Run: python3 tools/tile_audit.py   (needs Pillow)
"""
import csv
import glob
import os
import statistics
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PACKS = os.path.join(ROOT, "godot", "art", "packs")
ATLAS = os.path.join(ROOT, "godot", "art", "tiles", "tiles.png")
OUT = os.path.join(ROOT, "docs", "art", "tilefix")
SAMPLE_POINTS = {
    "TL": (1, 1), "TR": (30, 1), "BL": (1, 30), "BR": (30, 30),
    "TM": (16, 1), "BM": (16, 30), "LM": (1, 16), "RM": (30, 16), "C": (16, 16),
}


def classify(r, g, b, a):
    if a < 128:
        return "TRANS"
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    if b > r + 20 and b > g:
        return "WATER"
    if g > r + 12 and g > b + 12:
        return "GRASS"
    if r > g + 12 and lum < 150:
        return "DIRT"
    if r >= g - 4 and lum >= 150:
        return "PATH"
    return "DIRT" if r > g else "PATH"


def samples(im):
    px = im.load()
    w, h = im.size
    out = {}
    for name, (cx, cy) in SAMPLE_POINTS.items():
        acc = [0, 0, 0, 0]
        n = 0
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                x = min(max(cx + dx * (w // 32 or 1), 0), w - 1)
                y = min(max(cy + dy * (h // 32 or 1), 0), h - 1)
                p = px[x, y]
                for i in range(4):
                    acc[i] += p[i]
                n += 1
        out[name] = [v / n for v in acc]
    return out


def contrast(im):
    lum = []
    for r, g, b, a in im.getdata():
        if a >= 128:
            lum.append(0.3 * r + 0.59 * g + 0.11 * b)
    return statistics.pstdev(lum) if len(lum) > 1 else 0.0


def audit_one(path, source_group, px_size):
    im = Image.open(path).convert("RGBA")
    a = im.getchannel("A")
    cov = sum(1 for v in a.getdata() if v >= 128) / float(im.width * im.height)
    s = samples(im)
    labels = {k: classify(*v) for k, v in s.items()}
    corners = [labels[k] for k in ("TL", "TR", "BL", "BR")]
    centre = labels["C"]
    sides = {"TM": labels["TM"], "BM": labels["BM"], "LM": labels["LM"], "RM": labels["RM"]}
    uniform = len(set(labels.values())) == 1
    sd = contrast(im)
    if cov < 0.98:
        category, decision, reason = "partial", "REJECT", "alpha coverage %.0f%% < 98%% (decal/transition, not ground)" % (cov * 100)
    elif uniform and sd <= 14:
        category, decision, reason = "fill", "CANDIDATE", "plain fill: all 9 samples %s, low contrast %.1f" % (labels["C"], sd)
    elif uniform:
        category, decision, reason = "fill", "REJECT", "same terrain but busy (contrast %.1f): speckle/flower/pebble" % sd
    elif centre not in corners and all(c != centre for c in corners):
        category, decision, reason = "island", "REJECT", "centre %s differs from all corners: island/corner, never fill" % centre
    else:
        category, decision, reason = "edge", "CANDIDATE", "transition: corners %s, centre %s" % ("/".join(corners), centre)
    return {
        "file": os.path.relpath(path, ROOT), "group": source_group, "px": px_size,
        "coverage_pct": round(cov * 100, 1), "contrast": round(sd, 1),
        "TL": labels["TL"], "TR": labels["TR"], "BL": labels["BL"], "BR": labels["BR"],
        "TM": labels["TM"], "BM": labels["BM"], "LM": labels["LM"], "RM": labels["RM"],
        "centre": centre, "category": category, "decision": decision, "reason": reason,
    }


def collect():
    rows = []
    for path in sorted(glob.glob(os.path.join(PACKS, "*", "*.png"))):
        rows.append(audit_one(path, os.path.basename(os.path.dirname(path)), 32))
    if os.path.exists(ATLAS):
        import json
        names = json.load(open(os.path.join(ROOT, "godot", "art", "tiles", "tiles.json")))["names"]
        atlas = Image.open(ATLAS).convert("RGBA")
        for i, name in enumerate(names):
            if name.startswith(("edge_", "wd_", "gd_")):
                continue
            tile = atlas.crop(((i % 6) * 16, (i // 6) * 16, (i % 6) * 16 + 16, (i // 6) * 16 + 16))
            tmp = os.path.join(OUT, "_tmp_%s.png" % name)
            os.makedirs(OUT, exist_ok=True)
            tile.save(tmp)
            row = audit_one(tmp, "procedural_atlas", 16)
            row["file"] = "godot/art/tiles/tiles.png#%s" % name
            rows.append(row)
            os.remove(tmp)
    return rows


def contact_sheet(rows, title, path, per_row=16):
    cell = 48
    n = len(rows)
    cols = per_row
    rws = max(1, (n + cols - 1) // cols)
    sheet = Image.new("RGB", (cols * cell, rws * (cell + 14)), (30, 30, 30))
    d = ImageDraw.Draw(sheet)
    for i, row in enumerate(rows):
        x = (i % cols) * cell
        y = (i // cols) * (cell + 14)
        src_file = row["file"]
        if "#" in src_file:
            base, name = src_file.split("#")
            names = __import__("json").load(open(os.path.join(ROOT, "godot", "art", "tiles", "tiles.json")))["names"]
            idx = names.index(name)
            t = Image.open(os.path.join(ROOT, base)).convert("RGBA").crop(((idx % 6) * 16, (idx // 6) * 16, (idx % 6) * 16 + 16, (idx // 6) * 16 + 16))
        else:
            t = Image.open(os.path.join(ROOT, src_file)).convert("RGBA")
        t = t.resize((cell - 4, cell - 4), Image.NEAREST)
        bg = Image.new("RGBA", t.size, (255, 0, 255, 255))
        bg.alpha_composite(t)
        sheet.paste(bg.convert("RGB"), (x + 2, y + 2))
        label = os.path.basename(src_file).replace(".png", "")[:8] + (" " + row["decision"][:1])
        d.text((x + 2, y + cell), label, fill=(230, 230, 230))
    sheet.save(path)


def main():
    os.makedirs(OUT, exist_ok=True)
    rows = collect()
    fields = list(rows[0].keys())
    with open(os.path.join(OUT, "tile_manifest.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    rej = sum(1 for r in rows if r["decision"] == "REJECT")
    print("tiles audited:", len(rows), "candidates:", len(rows) - rej, "rejected:", rej)
    for cat in ("fill", "edge", "island", "partial"):
        print(cat, sum(1 for r in rows if r["category"] == cat))


if __name__ == "__main__":
    main()
