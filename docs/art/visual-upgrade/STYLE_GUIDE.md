# Visual Upgrade: Style Guide (Step 3, start)

Reference image: `character_design_sheet_concept.png` (chosen from two options).

## Direction
- Warm, cozy Bangladeshi village look (Gazipur countryside): terracotta soil, sal-forest greens, mustard, deep teal, cream.
- Readable silhouettes first. Each character must be identifiable by outline alone.
- Costume cues carry identity: checked shirt and cap (young farmer), green saree with straw hat (farmer woman), white headscarf (grandmother shopkeeper), blue gamchha and fishing rod or net basket (fisherman).

## Palette (anchor colours from the sheet)
- Cream background / paper: #F3E9D2
- Sal green: #3E6B4A, deep green: #2C4E38
- Terracotta: #B8603E
- Mustard: #D9A441
- Deep teal: #1F5F66
- Skin tones: warm browns, lit at #C98B5E, shadow at #7A4A2E

## Rules for in-game sprites
- Keep the existing pixel-art grid (tiles and sprites on integer pixels, no smoothing).
- Use a 1-pixel darker outline per sprite. Shadow ellipse under each character.
- Head is large relative to body for readability at 3x camera zoom.
- Four walk frames and one idle frame per direction; keep the costume colours fixed per NPC.

## Honest scope
- The concept sheet is painted, not pixel art. It is the target look and mood, not a sprite.
- Converting it to sprites is done in `tools/gen_art.py` (Pillow, scripted). Scripted pixel art will read clearly, but a human pixel artist will look more polished. A hand-finished pass is recommended before a public release.

## Next steps
1. Palette file (`godot/art/palette.json`) from the anchor colours above.
2. Redraw the four villager sprites from the costume rules, keeping their existing filenames.
3. Check each sprite at 3x zoom in `screenshot.gd` (shot 04).
