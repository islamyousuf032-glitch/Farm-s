#!/usr/bin/env python3
"""3x3 tiling seam test for ground fills.

Tiles a candidate 3x3, then measures brightness along each tile border against the interior.
A grid line shows up as a border brightness offset and as a jump at the seam.
Writes a 3x3 preview (nearest-neighbour, 6x) next to each candidate so it can be viewed.
"""
import os
import sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "docs", "art", "tilefix", "seam_tests")


def lum(p):
    return 0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2]


def score(tile):
    w, h = tile.size
    big = Image.new("RGBA", (w * 3, h * 3))
    for ty in range(3):
        for tx in range(3):
            big.paste(tile, (tx * w, ty * h))
    px = big.load()
    W, H = big.size
    L = [[lum(px[x, y]) for x in range(W)] for y in range(H)]
    interior = []
    border = []
    seam = []
    for y in range(H):
        for x in range(W):
            on_edge = x % w in (0, w - 1) or y % h in (0, h - 1)
            (border if on_edge else interior).append(L[y][x])
    for y in range(H):
        for x in range(W - 1):
            if (x + 1) % w == 0:
                seam.append(abs(L[y][x] - L[y][x + 1]))
    for y in range(H - 1):
        for x in range(W):
            if (y + 1) % h == 0:
                seam.append(abs(L[y][x] - L[y + 1][x]))
    inner = [abs(L[y][x] - L[y][x + 1]) for y in range(H) for x in range(W - 1) if (x + 1) % w != 0]
    mean_in = sum(interior) / len(interior)
    mean_b = sum(border) / len(border)
    mean_seam = sum(seam) / len(seam)
    mean_step = sum(inner) / len(inner)
    return {
        "border_offset": round(mean_b - mean_in, 2),
        "seam_jump": round(mean_seam, 2),
        "inner_step": round(mean_step, 2),
        "seam_ratio": round(mean_seam / max(mean_step, 0.01), 2),
        "big": big,
    }


def run(name, tile):
    s = score(tile)
    os.makedirs(OUT, exist_ok=True)
    big = s.pop("big").resize((tile.width * 3 * 6, tile.height * 3 * 6), Image.NEAREST)
    big.save(os.path.join(OUT, name + "_3x3.png"))
    ok = abs(s["border_offset"]) < 3.0 and s["seam_ratio"] < 1.25
    print(name, s, "PASS" if ok else "REJECT")
    return ok


if __name__ == "__main__":
    for path in sys.argv[1:]:
        run(os.path.basename(path).replace(".png", ""), Image.open(path).convert("RGBA"))
