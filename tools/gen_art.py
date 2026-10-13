#!/usr/bin/env python3
"""Procedural pixel-art generator for চালাবন ফার্ম (Godot 4 project in godot/).

Original art, generated from code so every asset is reproducible and license-free.
Run: python3 tools/gen_art.py  -> writes godot/art/**
"""
import json
import math
import os
import random

from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "godot", "art")


def out(path):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    return full


def hx(c, a=255):
    c = c.lstrip("#")
    return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16), a)


def shade(c, k):
    r, g, b, a = c
    f = lambda v: max(0, min(255, int(v * k)))
    return (f(r), f(g), f(b), a)


def noisy(base, rnd, amt=12):
    j = rnd.randint(-amt, amt)
    return (max(0, min(255, base[0] + j)), max(0, min(255, base[1] + j)), max(0, min(255, base[2] + j)), 255)


# ---------------------------------------------------------------- tiles (16x16)
TILE_ORDER = [
    "grass_a", "grass_b", "grass_c", "grass_flower", "soil_dry", "soil_tilled",
    "path", "water_a", "water_b", "bank", "bush", "floor_wood", "wall_wood",
    "rug", "sand", "wet_soil", "grass_dark", "stone_path",
]


def make_tile(name, rnd):
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if name.startswith("grass"):
        base = {"grass_a": "#6f9e45", "grass_b": "#649440", "grass_c": "#7aa84e", "grass_flower": "#6f9e45", "grass_dark": "#4f7d36"}[name]
        base = hx(base)
        for y in range(16):
            for x in range(16):
                d.point((x, y), fill=noisy(base, rnd, 9))
        for _ in range(9):
            x, y = rnd.randrange(16), rnd.randrange(16)
            d.point((x, y), fill=shade(base, 0.78))
            d.point((x, min(15, y + 1)), fill=shade(base, 1.15))
        if name == "grass_flower":
            for _ in range(4):
                x, y = rnd.randrange(1, 15), rnd.randrange(1, 15)
                col = rnd.choice([hx("#fff3b0"), hx("#ffffff"), hx("#f4a6c0"), hx("#ffd23f")])
                d.point((x, y), fill=col)
                d.point((x + 1, y), fill=col)
    elif name in ("soil_dry", "soil_tilled", "wet_soil"):
        base = {"soil_dry": "#b9643f", "soil_tilled": "#8f4a30", "wet_soil": "#6e3a27"}[name]
        base = hx(base)
        for y in range(16):
            for x in range(16):
                d.point((x, y), fill=noisy(base, rnd, 10))
        if name == "soil_dry":
            for _ in range(6):
                x, y = rnd.randrange(16), rnd.randrange(16)
                d.line([(x, y), (x + rnd.randint(-2, 2), y + 1)], fill=shade(base, 0.6))
        else:
            for y in (3, 8, 13):
                d.line([(0, y), (15, y)], fill=shade(base, 0.7))
                d.line([(0, y + 1), (15, y + 1)], fill=shade(base, 1.2))
    elif name == "path" or name == "stone_path":
        base = hx("#c9a878") if name == "path" else hx("#b8a58a")
        for y in range(16):
            for x in range(16):
                d.point((x, y), fill=noisy(base, rnd, 10))
        for _ in range(7):
            x, y = rnd.randrange(1, 15), rnd.randrange(1, 15)
            col = shade(base, 0.8)
            d.ellipse([x, y, x + 1, y + 1], fill=col)
        if name == "stone_path":
            for x in (0, 8):
                d.line([(x, 0), (x, 15)], fill=shade(base, 0.7))
            d.line([(0, 8), (15, 8)], fill=shade(base, 0.7))
    elif name.startswith("water"):
        base = hx("#3f8fb5")
        for y in range(16):
            for x in range(16):
                d.point((x, y), fill=noisy(base, rnd, 8))
        off = 0 if name == "water_a" else 4
        for x in range(16):
            y = (4 + int(1.2 * math.sin((x + off) * 0.8))) % 16
            d.point((x, y), fill=hx("#9fd8ea"))
            d.point((x, (y + 9) % 16), fill=hx("#2c6f94"))
    elif name == "bank":
        base = hx("#8a7450")
        for y in range(16):
            for x in range(16):
                d.point((x, y), fill=noisy(base, rnd, 10))
        for _ in range(12):
            d.point((rnd.randrange(16), rnd.randrange(16)), fill=hx("#5d7a3a"))
    elif name == "bush":
        d.rectangle([0, 0, 15, 15], fill=hx("#3e6b2e"))
        for _ in range(40):
            x, y = rnd.randrange(16), rnd.randrange(16)
            d.point((x, y), fill=noisy(hx("#4f8a3a"), rnd, 14))
        for _ in range(16):
            x, y = rnd.randrange(16), rnd.randrange(16)
            d.point((x, y), fill=hx("#2a4d20"))
    elif name == "floor_wood":
        base = hx("#a8723f")
        for y in range(16):
            for x in range(16):
                d.point((x, y), fill=noisy(base, rnd, 6))
        for y in (3, 7, 11, 15):
            d.line([(0, y), (15, y)], fill=shade(base, 0.7))
    elif name == "wall_wood":
        base = hx("#e6d3b0")
        d.rectangle([0, 0, 15, 15], fill=base)
        for y in (0, 15):
            d.line([(0, y), (15, y)], fill=shade(base, 0.6))
        for x in (0, 15):
            d.line([(x, 0), (x, 15)], fill=shade(base, 0.6))
        for x in (4, 9):
            d.line([(x, 0), (x, 15)], fill=shade(base, 0.85))
    elif name == "rug":
        d.rectangle([0, 0, 15, 15], fill=hx("#b5452f"))
        d.rectangle([2, 2, 13, 13], outline=hx("#f2c14e"))
        d.point((7, 7), fill=hx("#f2c14e"))
        d.point((8, 8), fill=hx("#f2c14e"))
    elif name == "sand":
        base = hx("#e2cc8f")
        for y in range(16):
            for x in range(16):
                d.point((x, y), fill=noisy(base, rnd, 8))
    return im


# ---------------------------------------------------------------- props
def tree_sal(rnd):
    im = Image.new("RGBA", (32, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([7, 33, 25, 39], fill=(0, 0, 0, 70))
    d.rectangle([14, 22, 18, 36], fill=hx("#6b4a2b"))
    d.line([(15, 22), (15, 36)], fill=hx("#8a6038"))
    canopy = [hx("#2f6b35"), hx("#3d7f3f"), hx("#4f9a4a")]
    for i, (cx, cy, r) in enumerate([(16, 14, 12), (9, 18, 8), (23, 18, 8), (16, 8, 8), (12, 12, 6), (20, 11, 6)]):
        col = canopy[min(2, i % 3)]
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
    for _ in range(14):
        x, y = rnd.randrange(6, 26), rnd.randrange(3, 22)
        d.point((x, y), fill=hx("#8fd17a"))
    return im


def bamboo(rnd):
    im = Image.new("RGBA", (16, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for x in (4, 9, 13):
        d.rectangle([x, 0, x + 1, 39], fill=hx("#7aa04a"))
        for y in range(0, 40, 9):
            d.line([(x, y), (x + 1, y)], fill=hx("#4d6b2a"))
        d.point((x, 2), fill=hx("#b8dc84"))
    d.ellipse([0, 2, 7, 9], fill=hx("#5e8f3a"))
    d.ellipse([8, 0, 15, 6], fill=hx("#5e8f3a"))
    return im


def house(w, h, wall, roof, door, rnd, label):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([3, h - 6, w - 3, h - 1], fill=(0, 0, 0, 60))
    walls_top = int(h * 0.42)
    d.rectangle([4, walls_top, w - 5, h - 4], fill=hx(wall))
    d.rectangle([4, walls_top, w - 5, walls_top + 2], fill=shade(hx(wall), 0.85))
    for x in range(6, w - 6, 6):
        d.line([(x, walls_top + 3), (x, h - 5)], fill=shade(hx(wall), 0.92))
    # corrugated tin roof (chala) with slight overhang
    d.polygon([(0, walls_top + 2), (w // 2, 2), (w - 1, walls_top + 2)], fill=hx(roof))
    for i in range(0, w, 4):
        x0 = min(w - 1, max(0, i))
        d.line([(x0, walls_top + 1), (w // 2 + (x0 - w // 2) // 2, 4)], fill=shade(hx(roof), 0.75))
    d.line([(0, walls_top + 2), (w - 1, walls_top + 2)], fill=shade(hx(roof), 0.6))
    # door & window
    dw = max(8, w // 8)
    dx = w // 2 - dw // 2
    d.rectangle([dx, h - 4 - int(h * 0.3), dx + dw, h - 4], fill=hx(door))
    wx = 8
    d.rectangle([wx, walls_top + 6, wx + 8, walls_top + 14], fill=hx("#2b3e4f"))
    d.line([(wx + 4, walls_top + 6), (wx + 4, walls_top + 14)], fill=hx("#e6d3b0"))
    d.rectangle([w - 17, walls_top + 6, w - 9, walls_top + 14], fill=hx("#2b3e4f"))
    d.line([(w - 13, walls_top + 6), (w - 13, walls_top + 14)], fill=hx("#e6d3b0"))
    return im


def shop_sprite(rnd):
    im = house(72, 56, "#e8c98e", "#b5452f", "#5a3b22", rnd, "shop")
    d = ImageDraw.Draw(im)
    d.rectangle([10, 26, 62, 30], fill=hx("#f2c14e"))
    for x in range(10, 62, 6):
        d.rectangle([x, 26, x + 2, 30], fill=hx("#d9534f"))
    return im


def school_sprite(rnd):
    im = house(96, 60, "#f0e6d2", "#8a4a2c", "#5a3b22", rnd, "school")
    d = ImageDraw.Draw(im)
    d.rectangle([44, 8, 46, 20], fill=hx("#5a3b22"))
    d.rectangle([40, 12, 50, 12], fill=hx("#5a3b22"))
    return im


def well(rnd):
    im = Image.new("RGBA", (16, 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([1, 12, 14, 19], fill=hx("#8a8a8a"))
    d.ellipse([3, 13, 12, 17], fill=hx("#2c5a7a"))
    d.rectangle([2, 2, 3, 13], fill=hx("#6b4a2b"))
    d.rectangle([12, 2, 13, 13], fill=hx("#6b4a2b"))
    d.polygon([(0, 3), (8, 0), (15, 3)], fill=hx("#b5452f"))
    return im


def bin_sprite(rnd):
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([3, 5, 12, 15], fill=hx("#6b4a2b"))
    for x in (5, 8, 11):
        d.line([(x, 6), (x, 14)], fill=hx("#4a301a"))
    d.rectangle([2, 3, 13, 5], fill=hx("#8a6038"))
    d.rectangle([6, 7, 9, 10], fill=hx("#f2c14e"))
    return im


def scarecrow(rnd):
    im = Image.new("RGBA", (16, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([7, 6, 8, 31], fill=hx("#6b4a2b"))
    d.rectangle([2, 10, 13, 11], fill=hx("#6b4a2b"))
    d.rectangle([5, 5, 10, 11], fill=hx("#e6d3b0"))
    d.rectangle([3, 1, 12, 3], fill=hx("#8a6038"))
    d.rectangle([4, 12, 11, 20], fill=hx("#c94a3a"))
    d.point((6, 8), fill=hx("#2a1a10"))
    d.point((9, 8), fill=hx("#2a1a10"))
    return im


def sign(rnd):
    im = Image.new("RGBA", (16, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([7, 10, 8, 23], fill=hx("#6b4a2b"))
    d.rectangle([1, 2, 14, 11], fill=hx("#c99a5b"))
    d.rectangle([1, 2, 14, 2], fill=hx("#8a6038"))
    d.line([(3, 6), (12, 6)], fill=hx("#3a2a1a"))
    d.line([(3, 9), (9, 9)], fill=hx("#3a2a1a"))
    return im


def rickshaw(rnd):
    im = Image.new("RGBA", (32, 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([3, 14, 11, 20], fill=hx("#222222"))
    d.ellipse([22, 14, 30, 20], fill=hx("#222222"))
    d.rectangle([6, 8, 24, 13], fill=hx("#2e7bc4"))
    d.polygon([(4, 8), (20, 1), (28, 8)], fill=hx("#e0703a"))
    d.rectangle([24, 5, 26, 12], fill=hx("#5a3b22"))
    d.rectangle([9, 5, 19, 7], fill=hx("#f2c14e"))
    return im


def bench(rnd):
    im = Image.new("RGBA", (32, 12), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([2, 3, 29, 5], fill=hx("#a8723f"))
    d.rectangle([2, 6, 29, 7], fill=hx("#8a5a30"))
    d.rectangle([4, 8, 6, 11], fill=hx("#5a3b22"))
    d.rectangle([25, 8, 27, 11], fill=hx("#5a3b22"))
    return im


def rock(rnd):
    im = Image.new("RGBA", (16, 12), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([0, 2, 15, 11], fill=hx("#8a8580"))
    d.ellipse([3, 3, 9, 6], fill=hx("#a8a39c"))
    return im


def bed(rnd):
    im = Image.new("RGBA", (32, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 2, 31, 15], fill=hx("#6b4a2b"))
    d.rectangle([2, 4, 29, 13], fill=hx("#f2e3c6"))
    d.rectangle([2, 4, 11, 13], fill=hx("#e0708a"))
    d.rectangle([4, 5, 9, 7], fill=hx("#ffffff"))
    return im


def box_sprite(rnd):
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([1, 4, 14, 15], fill=hx("#8a5a30"))
    d.rectangle([1, 4, 14, 6], fill=hx("#a8723f"))
    d.rectangle([7, 9, 8, 11], fill=hx("#f2c14e"))
    return im


def table_sprite(rnd):
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([1, 4, 14, 6], fill=hx("#a8723f"))
    d.rectangle([2, 7, 3, 14], fill=hx("#6b4a2b"))
    d.rectangle([12, 7, 13, 14], fill=hx("#6b4a2b"))
    d.rectangle([6, 1, 9, 3], fill=hx("#d9534f"))
    return im


def rug_sprite(rnd):
    im = Image.new("RGBA", (32, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 31, 15], fill=hx("#b5452f"))
    d.rectangle([2, 2, 29, 13], outline=hx("#f2c14e"))
    return im


# ---------------------------------------------------------------- characters (16x24 frames)
def draw_char(spec, direction, frame, rnd):
    """direction: 0 down, 1 left, 2 right, 3 up. frame: 0..3 (walk cycle)."""
    im = Image.new("RGBA", (16, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    skin = hx(spec["skin"])
    hair = hx(spec["hair"])
    top = hx(spec["top"])
    bottom = hx(spec["bottom"])
    side = direction in (1, 2)
    cx = 8
    bob = 1 if frame in (1, 3) else 0
    # shadow
    d.ellipse([3, 21, 12, 23], fill=(0, 0, 0, 60))
    # legs / feet
    lstep = {0: 0, 1: -1, 2: 0, 3: 1}[frame]
    if side:
        d.rectangle([6, 17, 8, 21 + lstep], fill=bottom)
        d.rectangle([8, 17, 10, 21 - lstep], fill=shade(bottom, 0.85))
        d.rectangle([6, 21 + lstep, 8, 22 + lstep], fill=hx("#2a1d14"))
        d.rectangle([8, 21 - lstep, 10, 22 - lstep], fill=hx("#2a1d14"))
    else:
        d.rectangle([5, 17, 7, 21 + lstep], fill=bottom)
        d.rectangle([9, 17, 11, 21 - lstep], fill=bottom)
        d.rectangle([5, 21 + lstep, 7, 22 + lstep], fill=hx("#2a1d14"))
        d.rectangle([9, 21 - lstep, 11, 22 - lstep], fill=hx("#2a1d14"))
    if spec.get("lungi"):
        d.rectangle([4, 15 + bob, 12, 18], fill=bottom)
        for y in range(16 + bob, 18, 2):
            d.line([(4, y), (12, y)], fill=shade(bottom, 1.25))
    # torso
    tw = 3 if side else 6
    d.rectangle([cx - tw + (0 if side else 0), 10 + bob, cx + tw - 1, 16 + bob], fill=top)
    if spec.get("accent") and not spec.get("dupatta"):
        d.line([(cx - 1, 10 + bob), (cx - 1, 16 + bob)], fill=hx(spec["accent"]))
    # arms
    arm_swing = lstep
    if side:
        d.rectangle([cx - 1, 11 + bob + arm_swing, cx + 1, 15 + bob + arm_swing], fill=top)
        d.rectangle([cx - 1, 15 + bob + arm_swing, cx + 1, 16 + bob + arm_swing], fill=skin)
    else:
        d.rectangle([2, 11 + bob, 4, 15 + bob + arm_swing], fill=top)
        d.rectangle([11, 11 + bob, 13, 15 + bob - arm_swing], fill=top)
        d.rectangle([2, 15 + bob + arm_swing, 4, 16 + bob + arm_swing], fill=skin)
        d.rectangle([11, 15 + bob - arm_swing, 13, 16 + bob - arm_swing], fill=skin)
    if spec.get("dupatta"):
        scarf = hx(spec.get("accent", "#f2e3c6"))
        if direction == 0:
            d.line([(4, 11 + bob), (12, 11 + bob)], fill=scarf)
            d.line([(5, 12 + bob), (11, 16 + bob)], fill=scarf)
        elif direction == 3:
            d.rectangle([4, 10 + bob, 12, 16 + bob], fill=scarf)
        else:
            d.rectangle([cx - 2, 10 + bob, cx + 1, 15 + bob], fill=scarf)
    if spec.get("gamchha") and direction in (0, 2, 1):
        d.line([(3, 12 + bob), (7, 16 + bob)], fill=hx(spec.get("accent", "#c94a3a")))
    # head
    hy = 2 + bob
    d.ellipse([cx - 4, hy, cx + 4, hy + 8], fill=skin)
    if spec.get("grey") or spec.get("braid") is None:
        pass
    # hair
    if direction == 3:
        d.ellipse([cx - 4, hy - 1, cx + 4, hy + 5], fill=hair)
        d.rectangle([cx - 4, hy + 2, cx + 4, hy + 7], fill=hair)
    else:
        d.chord([cx - 4, hy - 1, cx + 4, hy + 6], 180, 360, fill=hair)
        if side:
            d.rectangle([cx - 4 if direction == 1 else cx + 1, hy + 2, cx - 1 if direction == 1 else cx + 4, hy + 7], fill=hair)
    if spec.get("braid") and direction in (0, 3):
        d.line([(cx + 3 if direction == 0 else cx - 3, hy + 4), (cx + 3 if direction == 0 else cx - 3, hy + 11)], fill=hair)
    if spec.get("hat"):
        d.rectangle([cx - 5, hy - 1, cx + 5, hy], fill=hx("#e0c58a"))
        d.line([(cx - 4, hy - 2), (cx + 4, hy - 2)], fill=hx("#c9a86a"))
    # face
    if direction == 0:
        d.point((cx - 2, hy + 4), fill=hx("#1a120e"))
        d.point((cx + 2, hy + 4), fill=hx("#1a120e"))
        d.point((cx - 2, hy + 3), fill=hx("#ffffff"))
        d.point((cx + 2, hy + 3), fill=hx("#ffffff"))
        d.point((cx, hy + 6), fill=shade(skin, 0.7))
        if spec.get("beard"):
            d.rectangle([cx - 2, hy + 6, cx + 2, hy + 7], fill=hair)
        if spec.get("glasses"):
            d.rectangle([cx - 4, hy + 3, cx - 1, hy + 4], outline=hx("#2a2a2a"))
            d.rectangle([cx + 1, hy + 3, cx + 4, hy + 4], outline=hx("#2a2a2a"))
    elif side:
        ex = cx + 2 if direction == 2 else cx - 2
        d.point((ex, hy + 4), fill=hx("#1a120e"))
        d.point((ex - 1 if direction == 2 else ex + 1, hy + 4), fill=shade(skin, 0.8))
        if spec.get("beard"):
            d.rectangle([cx - 1, hy + 6, cx + 2, hy + 7], fill=hair)
        if spec.get("glasses"):
            d.rectangle([ex - 1, hy + 3, ex + 1, hy + 4], outline=hx("#2a2a2a"))
    return im


def char_sheet(spec, rnd):
    sheet = Image.new("RGBA", (64, 96), (0, 0, 0, 0))
    for dr in range(4):
        for fr in range(4):
            sheet.paste(draw_char(spec, dr, fr, rnd), (fr * 16, dr * 24))
    return sheet


# ---------------------------------------------------------------- crops
CROPS = {
    "lau": ("#6aa84f", "#a9d86e", "vine"), "begun": ("#5a3f7a", "#6c3c8f", "bush"),
    "chili": ("#3f7a3a", "#d8322a", "bush"), "dhan": ("#7aa84a", "#e6c455", "grass"),
    "alu": ("#6f8a3c", "#b98a55", "bush"), "sarisha": ("#5c8f3a", "#f2c81e", "flower"),
    "palong": ("#2f8a3a", "#3fae4a", "leafy"), "dhendosh": ("#4a8a3a", "#7fbf4a", "bush"),
}


def crop_frame(kind, stage, rnd):
    stem, fruit, style = CROPS[kind]
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    s = hx(stem)
    f = hx(fruit)
    if stage == 0:
        return im
    if stage == 1:
        d.rectangle([7, 12, 8, 14], fill=s)
        d.ellipse([4, 9, 7, 12], fill=s)
        d.ellipse([9, 9, 12, 12], fill=s)
        return im
    h = 3 + stage * 3
    d.rectangle([7, 16 - h, 8, 15], fill=shade(s, 0.8))
    for i in range(stage + 1):
        y = 15 - i * 3
        d.ellipse([3 + (i % 2), y - 2, 7, y + 1], fill=s)
        d.ellipse([9, y - 3 + (i % 2), 13 - (i % 2), y], fill=shade(s, 1.15))
    if stage >= 3:
        for _ in range(3 if style != "leafy" else 0):
            x, y = rnd.randint(3, 12), rnd.randint(2, 9)
            d.ellipse([x, y, x + 2, y + 2], fill=f)
        if style == "flower" and stage == 4:
            for x, y in [(5, 3), (10, 2), (8, 6)]:
                d.ellipse([x - 1, y - 1, x + 1, y + 1], fill=f)
        if style == "leafy" and stage == 4:
            d.ellipse([3, 6, 13, 13], fill=shade(s, 1.25))
    return im


# ---------------------------------------------------------------- items
ITEMS = {
    "tool_hoe": ("hoe",), "tool_can": ("can",), "tool_rod": ("rod",),
}


def item_icon(kind, name, rnd):
    im = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if kind == "hoe":
        d.line([(4, 2), (11, 13)], fill=hx("#8a5a30"), width=1)
        d.rectangle([9, 11, 14, 14], fill=hx("#9a9a9a"))
    elif kind == "can":
        d.rectangle([3, 6, 11, 13], fill=hx("#3a7fc1"))
        d.line([(11, 8), (14, 4)], fill=hx("#3a7fc1"))
        d.line([(3, 6), (1, 3)], fill=hx("#3a7fc1"))
        d.rectangle([5, 4, 9, 5], fill=hx("#2a5f91"))
    elif kind == "rod":
        d.line([(2, 14), (13, 2)], fill=hx("#8a5a30"))
        d.line([(13, 2), (13, 9)], fill=hx("#dddddd"))
        d.ellipse([11, 9, 15, 13], fill=hx("#d9534f"))
    elif kind == "seed":
        stem = hx(CROPS[name][0])
        d.ellipse([5, 5, 10, 11], fill=stem)
        d.point((7, 4), fill=hx("#ffffff"))
    elif kind == "crop":
        fruit = hx(CROPS[name][1])
        d.ellipse([3, 4, 12, 13], fill=fruit)
        d.line([(7, 2), (7, 4)], fill=hx("#3f7a3a"))
        d.point((5, 7), fill=hx("#ffffff"))
    elif kind == "fish":
        col = hx({"puti": "#c9d4d8", "tengra": "#8a7a5a", "rui": "#c98a4a", "shing": "#6a6a4a", "magur": "#5a5a6a"}[name])
        d.ellipse([2, 5, 12, 11], fill=col)
        d.polygon([(11, 8), (15, 4), (15, 12)], fill=col)
        d.point((4, 7), fill=hx("#111111"))
    elif kind == "coin":
        d.ellipse([3, 3, 12, 12], fill=hx("#f2c14e"))
        d.ellipse([5, 5, 10, 10], outline=hx("#b8860b"))
    return im


def portrait(char_front, rnd):
    """Dialogue portrait: upscaled front frame on a warm card background."""
    bg = Image.new("RGBA", (96, 120), hx("#f4e2b8"))
    d = ImageDraw.Draw(bg)
    for y in range(120):
        d.line([(0, y), (95, y)], fill=(244 - y // 12, 226 - y // 14, 184 - y // 10, 255))
    d.ellipse([-20, 84, 116, 150], fill=hx("#d9b87c"))
    figure = char_front.resize((64, 96), Image.NEAREST)
    bg.alpha_composite(figure, (16, 12))
    return bg


def main():
    rnd = random.Random(20261013)
    manifest = {"tiles": TILE_ORDER}
    # tiles atlas: 6 columns x 3 rows
    cols = 6
    atlas = Image.new("RGBA", (cols * 16, ((len(TILE_ORDER) + cols - 1) // cols) * 16), (0, 0, 0, 0))
    for i, name in enumerate(TILE_ORDER):
        atlas.paste(make_tile(name, rnd), ((i % cols) * 16, (i // cols) * 16))
    atlas.save(out("tiles/tiles.png"))
    with open(out("tiles/tiles.json"), "w", encoding="utf-8") as f:
        json.dump({"names": TILE_ORDER, "cols": cols}, f, indent=1)

    props = {
        "tree_sal": tree_sal(rnd), "bamboo": bamboo(rnd),
        "house_farm": house(80, 56, "#e8c98e", "#b5452f", "#5a3b22", rnd, "farm"),
        "house_village": house(80, 56, "#e6d3b0", "#8f9aa3", "#3f5a6b", rnd, "village"),
        "shop": shop_sprite(rnd), "school": school_sprite(rnd), "well": well(rnd),
        "bin": bin_sprite(rnd), "scarecrow": scarecrow(rnd), "sign": sign(rnd),
        "rickshaw": rickshaw(rnd), "bench": bench(rnd), "rock": rock(rnd),
        "bed": bed(rnd), "box": box_sprite(rnd), "table": table_sprite(rnd), "rug": rug_sprite(rnd),
    }
    for k, im in props.items():
        im.save(out("props/%s.png" % k))

    specs = {
        "ameena": {"skin": "#9a6443", "hair": "#e5e0da", "top": "#2e7d5b", "bottom": "#2e7d5b", "accent": "#b23a3a", "dupatta": True},
        "mojid": {"skin": "#7e5235", "hair": "#e5e0da", "top": "#f1efe7", "bottom": "#5b4a86", "lungi": True, "beard": True, "gamchha": True, "accent": "#c94a3a", "hat": True},
        "rafiq": {"skin": "#9c6843", "hair": "#1d1612", "top": "#e0703a", "bottom": "#34476b"},
        "shiuli": {"skin": "#c08a60", "hair": "#1a1412", "braid": True, "top": "#7a4fb0", "bottom": "#2f4f6f", "dupatta": True, "accent": "#f4c542", "glasses": True},
    }
    for k, spec in specs.items():
        sheet = char_sheet(spec, rnd)
        sheet.save(out("chars/%s.png" % k))
        portrait(draw_char(spec, 0, 0, rnd), rnd).save(out("portraits/%s.png" % k))
    skins = ["#a8714a", "#c28a5f", "#8d5a3b", "#d59a6b"]
    for g, base in (("m", {"hair": "#1f1714", "top": "#4f9bd6", "bottom": "#2f6f5a", "lungi": True, "gamchha": True, "hat": True, "accent": "#c94a3a"}),
                    ("f", {"hair": "#1f1714", "braid": True, "top": "#e0708a", "bottom": "#4a4f9e", "dupatta": True, "accent": "#f2e3c6", "hat": True})):
        for i, sk in enumerate(skins):
            spec = dict(base)
            spec["skin"] = sk
            char_sheet(spec, rnd).save(out("chars/player_%s_%d.png" % (g, i)))
        portrait(draw_char(dict(base, skin=skins[0]), 0, 0, rnd), rnd).save(out("portraits/player_%s.png" % g))

    for kind, (stem, fruit, style) in CROPS.items():
        sheet = Image.new("RGBA", (64, 16), (0, 0, 0, 0))
        for st in range(5):
            sheet.paste(crop_frame(kind, st, rnd), (st * 16, 0))
        sheet.save(out("crops/%s.png" % kind))

    for name in ("hoe", "can", "rod"):
        item_icon(name, name, rnd).save(out("items/tool_%s.png" % name))
    for c in CROPS:
        item_icon("seed", c, rnd).save(out("items/seed_%s.png" % c))
        item_icon("crop", c, rnd).save(out("items/crop_%s.png" % c))
    for fsh in ("puti", "tengra", "rui", "shing", "magur"):
        item_icon("fish", fsh, rnd).save(out("items/fish_%s.png" % fsh))
    item_icon("coin", "", rnd).save(out("items/coin.png"))

    # launcher icon 512x512 (Godot scales it for Android)
    ic = Image.new("RGBA", (512, 512), hx("#2f6b35"))
    d = ImageDraw.Draw(ic)
    for y in range(512):
        d.line([(0, y), (511, y)], fill=(47 - y // 40, 107 - y // 25, 53 - y // 40, 255))
    d.rounded_rectangle([64, 64, 448, 448], radius=72, fill=hx("#f4e2b8"))
    d.polygon([(96, 230), (256, 120), (416, 230)], fill=hx("#b5452f"))
    d.rectangle([128, 230, 384, 400], fill=hx("#e8c98e"))
    d.rectangle([228, 310, 284, 400], fill=hx("#5a3b22"))
    d.rectangle([150, 280, 200, 320], fill=hx("#2b3e4f"))
    d.ellipse([60, 370, 452, 470], fill=hx("#8a6a3a"))
    for x in range(120, 400, 40):
        d.rectangle([x, 390, x + 20, 410], fill=hx("#3f8fb5"))
    ic.save(out("../icon.png"))
    print("art written to", os.path.abspath(ROOT))


if __name__ == "__main__":
    main()
