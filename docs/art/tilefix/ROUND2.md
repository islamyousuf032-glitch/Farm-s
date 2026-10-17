# Round 2: soil grid, path, pond

Backup before changes: `/home/user/backup_wt/Farm_Before_Round2/` (art, scripts, scenes, tools).

## Root causes found
- **Path gone:** `road_fill` was added to the curated list after the atlas was built, so the atlas had no such tile. `tile_atlas` silently fell back to tile 0, so the path was drawn as base grass and its edge pieces became hollow outlines. Fixed by rebuilding the atlas. `art.gd` now warns on a missing name.
- **Soil grid:** the dirt tile had a light 2px border (3×3 test: border +21 luminance) that repeated on every cell.
- **Pond stripes:** water tiles had wave bands, shore pieces were cliff/raised-coast edges, and lily decor sat on the water.

## Fills (derived, no new AI art; tools/derive_fills.py)
| Tile | Source | 3×3 test |
|---|---|---|
| dirt_fill | inner 8×8 of dry soil, mirror-tiled 2×2 | PASS (border offset −0.8, seam 0) |
| road_fill | inner 8×8 of the path tile, mirror-tiled | PASS (border −2.9, seam 0) |
| water_fill | solid dominant pond colour (24,102,115) | PASS, but plain colour: no ring-free water tile exists in the packs |
| mud_fill | dirt_fill darkened 30%, 1-cell pond ring | PASS |
| dirt_tilled_wet | dirt_tilled_00 darkened (watered, player-tilled only) | PASS |
Rejected: the old dirt_dry (border +21), dirt_wet (+6), old road_fill (−15, seam 2.9), pond_water_031 as tiled water (ring motif repeats on a grid).

## Rules
- Striped tilled tiles: removed from random use. Only the player-tilled state shows stripes (`dirt_tilled_00`).
- Pond: interior = `water_fill` only. Shore pieces removed. The 1-cell ring is `mud_fill` (fallback from the brief). Water decor disabled.
- Grass under trees (`#`) uses the same weighted grass pick as all other grass.

## Changed files
- tools/derive_fills.py, tools/seam_test.py (new); tools/gen_art.py
- godot/art/curated/: dirt_fill, dirt_tilled_wet, mud_fill, water_fill (new); road_fill (replaced); dirt_dry, dirt_wet, dirt_tilled_01/02 (removed from the atlas)
- godot/art/tiles/tiles.png, tiles.json (47 names)
- godot/scripts/world.gd, godot/scripts/art.gd
- docs/art/tilefix/seam_tests/*_3x3.png, ROUND2.md

## Not verified here
- Godot is not installed in this sandbox. The game was not run locally, so close-up screenshots and hoe/NPC checks depend on CI.
