# Lalmati Farm ground repair: status report (partial)

## Engine and tile size
- Godot 4.7.2 (GDScript). Project tile size is 16 px. Source pack tiles are 32 px and are box-downscaled to 16 px. Rendering is nearest-neighbour.

## Backup
- Pre-change art, scripts and tools: `/home/user/backup_wt/Farm_Before_TileFix/` (copy of the v2.0.57 state).
- Git: commit `4749b14` (v2.0.57) is on the remote branch.

## Phase A: audit
- `tools/tile_audit.py` writes `docs/art/tilefix/tile_manifest.csv` (505 tiles: 9 samples each, alpha, contrast, decision).
- Result: 38 candidates, 467 rejected.
- Packs have only 3 plain full-coverage grass tiles. They have no plain dirt, path or water fill.
- No complete corner (Wang) set exists for grass↔dirt, grass↔path or grass↔water.

## Selected tiles (Phase B, `godot/art/curated/`)
| Use | Tiles | Source |
|---|---|---|
| Grass fill (70/20/10) | grass_00, grass_01, grass_02 | grass_pack_026, 027, 035 |
| Dry dirt | dirt_dry | procedural soil_dry_v02 |
| Tilled dirt (3) | dirt_tilled_00..02 | procedural soil_tilled_v00..02 (furrow lines, busier than "plain") |
| Wet dirt | dirt_wet | procedural wet_soil_v03 |
| Path fill | road_fill | procedural path (reads as pale sand, see Open issues) |
| Water fill | water_a / water_b | procedural (not seamless: wave bands) |
| Grass↔path edge | edge_road_* (2 per side) | grass_to_road 4 pieces |
| Bank↔water edge | edge_shore_* (1 per side) | pond_shore |
| Grass↔dirt edge | none | no complete set: clean hard edge |
| Decor | wd_00..05, gd_00..05 (12 total) | pond_water / grass packs |

## Rules applied
- Ragged (blob) edge set removed from the pipeline.
- Road edges alternate between 2 pieces per side, so the same piece never repeats along a straight border.
- Grass decor: 3% density, min 2 cells apart, at least 1 free cell from path, soil, water, bank, trees, rocks and bamboo.
- Pond decor: 5% density.
- Seed: the game's existing deterministic hash (`_pick`). Not seed 12345.

## Acceptance (CI screenshot, run 39031574303)
- Grass: calm and even. Pass.
- Path: continuous, no square grid. Pass.
- Farm plot: no green blobs or framed squares. Pass.
- Pond: horizontal brown bands still visible inside the water. FAIL (not fixed).
- Decor: 12 max. Pass.
- Game runs: CI build passed. In-game play test not done.

## Changed files
- tools/tile_audit.py, tools/curate_palette.py (new); tools/gen_art.py
- godot/scripts/world.gd
- godot/art/curated/*.png (new); godot/art/tiles/tiles.png and tiles.json (51 names)
- docs/art/tilefix/ (manifest, before/after screenshots, this report)

## Open issues / decisions needed
1. No complete Wang sets for grass↔dirt, grass↔path, grass↔water. Missing: new art or a pack with full sets.
2. No plain seamless water or packed-earth path tile in the packs.
3. Pond bands: source of the stripes not yet isolated.
4. Tilled-dirt furrow lines are busier than the "plain dirt" rule.
5. Godot editor not run here: the terrain peering setup is unverified.

## Tuning knobs
- Grass variant weights: `godot/scripts/world.gd`, `const GRASS_WEIGHTS` (70/20/10).
- Decor density: `godot/scripts/world.gd`, `_paint_grass_decor` (`rng.randf() < 0.03`) and `_paint_water_decor` (`< 0.05`).
