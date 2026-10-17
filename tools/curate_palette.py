#!/usr/bin/env python3
"""Phase A selection: export the curated ground palette as fixed 16px PNGs.

Grass: three plain, full-coverage pack tiles (audit: contrast 6.9-11.4, all 9 samples GRASS).
Dirt / path: audited plain atlas tiles, copied pixel for pixel (no re-rolling).
Run once after the audit; outputs godot/art/curated/. Requires Pillow.
"""
import json
import os
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
ART = os.path.join(ROOT, "godot", "art")
OUT = os.path.join(ART, "curated")
GRASS_SOURCES = ["grass_pack_026", "grass_pack_027", "grass_pack_035"]
ATLAS_PICKS = {
    "dirt_dry": "soil_dry_v02",
    "dirt_tilled_00": "soil_tilled_v00",
    "dirt_tilled_01": "soil_tilled_v01",
    "dirt_tilled_02": "soil_tilled_v02",
    "dirt_wet": "wet_soil_v03",
    "road_fill": "path",
}


def main():
    os.makedirs(OUT, exist_ok=True)
    for i, src in enumerate(GRASS_SOURCES):
        im = Image.open(os.path.join(ART, "packs", "grass_pack", src + ".png")).convert("RGBA")
        im.resize((16, 16), Image.BOX).save(os.path.join(OUT, "grass_%02d.png" % i))
    names = json.load(open(os.path.join(ART, "tiles", "tiles.json")))["names"]
    cols = json.load(open(os.path.join(ART, "tiles", "tiles.json")))["cols"]
    atlas = Image.open(os.path.join(ART, "tiles", "tiles.png")).convert("RGBA")
    for out_name, src_name in ATLAS_PICKS.items():
        i = names.index(src_name)
        tile = atlas.crop(((i % cols) * 16, (i // cols) * 16, (i % cols) * 16 + 16, (i // cols) * 16 + 16))
        tile.save(os.path.join(OUT, out_name + ".png"))
    print("curated:", sorted(os.listdir(OUT)))


if __name__ == "__main__":
    main()
