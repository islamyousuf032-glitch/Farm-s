#!/usr/bin/env python3
"""Derive seamless fill tiles from existing art (no new AI art).

dirt_fill: inner 8x8 of the flattest dry-soil tile (drops the 4px light border), mirror-tiled 2x2.
  Mirror tiling is seamless at every edge (checked by tools/seam_test.py).
water_fill: solid dominant colour of the pond water interior. The ring/lily motifs in the
  packs repeat on a grid when tiled, so no pattern is used. This is a plain colour fill.
"""
import collections
import os
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
CUR = os.path.join(ROOT, "godot", "art", "curated")
PACKS = os.path.join(ROOT, "godot", "art", "packs")


def pingpong(block):
    w, h = block.size
    out = Image.new("RGBA", (w * 2, h * 2))
    out.paste(block, (0, 0))
    out.paste(ImageOps.mirror(block), (w, 0))
    out.paste(ImageOps.flip(block), (0, h))
    out.paste(ImageOps.flip(ImageOps.mirror(block)), (w, h))
    return out


def main():
    dirt = Image.open(os.path.join(CUR, "dirt_dry.png")).convert("RGBA")
    pingpong(dirt.crop((4, 4, 12, 12))).save(os.path.join(CUR, "dirt_fill.png"))
    water = Image.open(os.path.join(PACKS, "pond_water", "pond_water_031.png")).convert("RGBA")
    water16 = water.resize((16, 16), Image.BOX)
    px = [water16.getpixel((x, y))[:3] for x in range(4, 12) for y in range(4, 12)]
    px = [p for p in px if p[2] > p[0] + 20 and p[2] > p[1]]
    dominant = collections.Counter(px).most_common(1)[0][0]
    Image.new("RGBA", (16, 16), dominant + (255,)).save(os.path.join(CUR, "water_fill.png"))
    print("dirt_fill.png, water_fill.png written; water colour", dominant)
    derive_more()



def derive_more():
    """Path fill, watered tilled soil and mud ring, all derived from the tiles above."""
    from PIL import ImageEnhance
    road = Image.open(os.path.join(CUR, "road_fill.png")).convert("RGBA")
    pingpong(road.crop((4, 4, 12, 12))).save(os.path.join(CUR, "road_fill.png"))
    tilled = Image.open(os.path.join(CUR, "dirt_tilled_00.png")).convert("RGBA")
    dark = ImageEnhance.Brightness(tilled).enhance(0.72)
    dark.save(os.path.join(CUR, "dirt_tilled_wet.png"))
    dirt = Image.open(os.path.join(CUR, "dirt_fill.png")).convert("RGBA")
    ImageEnhance.Brightness(dirt).enhance(0.7).save(os.path.join(CUR, "mud_fill.png"))

if __name__ == "__main__":
    main()
