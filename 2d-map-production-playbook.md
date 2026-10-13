# 2D গেম ম্যাপ প্রোডাকশন প্লেবুক

> **কাজের উদ্দেশ্য:** গবেষণাকে বাস্তব কাজের ধাপে নামিয়ে আনা। এই playbook ধরে আমরা শূন্য থেকে একটি ছোট, খেলাযোগ্য 2D map বানাব—তারপর সেটিকেই বড় গেমের ভিত্তি করব।
>
> **এটি কী নয়:** এটি final world-map-এর কল্পকাহিনি নয়; এটি map বানানো, version করা, test করা এবং নিরাপদে বাড়ানোর কর্মপদ্ধতি।
>
> **প্রস্তাবিত প্রথম লক্ষ্য:** একটি ছোট top-down farming/RPG vertical slice। পরে প্রকল্পের genre বদলালে একই কাঠামোর genre-specific অংশ বদলাব।
>
> **তারিখ:** ১০ অক্টোবর ২০২৬

---

## ১. আমাদের কাজের অটল নীতি

1. **গেমপ্লে আগে, ছবি পরে।** সুন্দর tree sprite-এর আগে player চলা, collision, portal, tool action ঠিক হবে।
2. **একটি map = data + visual + rules।** একই ঘাসের টাইল দেখালেই চাষযোগ্য হয়ে যায় না।
3. **একটি নতুন feature একবারে।** map load ঠিক হলে portal; portal ঠিক হলে soil; soil ঠিক হলে crop।
4. **প্রতিটি পরিবর্তন খেলেই পরীক্ষা।** editor-এ সুন্দর দেখালেই কাজ শেষ নয়।
5. **সোর্স art এবং exported art আলাদা।** Aseprite/Krita source file সংরক্ষণ; exported PNG regenerate করা যাবে।
6. **কোনো গুরুত্বপূর্ণ coordinate code-এ গোপন নয়।** spawn, portal, shop, quest trigger map data-তে থাকবে।
7. **ছোট সম্পূর্ণ loop, বড় অসম্পূর্ণ স্বপ্নের চেয়ে ভালো।**

---

## ২. প্রথম playable map-এর সংজ্ঞা (Definition of Done)

প্রথম map **শেষ** বলা যাবে যখন নিচের সব সত্যি হবে:

```text
[ ] Game launch → map load → player দৃশ্যমান ও নিয়ন্ত্রণযোগ্য
[ ] Solid wall/obstacle পার হওয়া যায় না
[ ] Walkable ground দিয়ে স্বাভাবিক চলা যায়
[ ] একটি named spawn point থেকে শুরু হয়
[ ] একটি portal দিয়ে দ্বিতীয় ছোট zone-এ যাওয়া ও ফিরে আসা যায়
[ ] অন্তত একটি NPC/interactive object আছে
[ ] একটি tool action একটি map cell-এর state বদলায়
[ ] Soil → tilled → planted → watered-এর অন্তত প্রথম কয়েকটি state দেখা যায়
[ ] save → quit/reload → পরিবর্তিত state থাকে
[ ] map-এর ID, layers, portal ও entity data documented
[ ] আরেকজন মানুষ ৫ মিনিট খেলে কোনো soft-lock পায় না
```

**যা প্রথম slice-এ লাগবে না:** ২০টি zone, final seasonal art, online sync, procedural cave, minimap, ৫০টি NPC, cinematic। এগুলো পরে।

---

## ৩. প্রথম দিনের সিদ্ধান্ত ফর্ম

গেম coding শুরুর আগে নিচের ফাঁকগুলো পূরণ করব। এখনও অজানা থাকলে `TBD` লিখব—কিন্তু নীরবে অনুমান করব না।

```yaml
project_name: TBD
project_genre: farming-sim RPG / TBD
target_platform: PC first / TBD
engine_or_existing_codebase: TBD
camera: top-down orthogonal / TBD
logical_tile_size: 16 or 32 / TBD
art_style: pixel art / TBD
map_editor: Tiled | LDtk | engine-native / TBD
map_data_format: TMX | LDtk JSON | engine scene / TBD
save_format: JSON | database | existing save system / TBD
singleplayer_or_coop: singleplayer first / TBD
source_code_license_verified: false
```

> **লাইসেন্স gate:** যদি আমরা কোনও পুরনো MMORPG source code ব্যবহার করি, আগে LICENSE/ownership যাচাই হবে। আগের research-এর নিয়ম: “লাইসেন্স আগে, কোড পরে।”

---

## ৪. প্রস্তাবিত ফোল্ডার কাঠামো

এটি engine-neutral নামকরণ। বর্তমান codebase-এর রীতি থাকলে তার সঙ্গে মেলাব; একই জিনিস দুইভাবে রাখব না।

```text
project/
├── art/
│   ├── source/
│   │   ├── tilesets/
│   │   ├── props/
│   │   └── backgrounds/
│   └── export/
│       ├── tilesets/
│       ├── props/
│       └── backgrounds/
├── maps/
│   ├── source/                 # .tmx / .ldtk / native scene
│   │   ├── overworld/
│   │   └── interiors/
│   ├── data/                   # optional generated/processed map data
│   └── docs/
├── prefabs_or_scenes/
│   ├── entities/
│   ├── interactables/
│   └── props/
├── data/
│   ├── crops/
│   ├── items/
│   ├── npcs/
│   └── map_catalog.json
├── scripts/
│   ├── map/
│   ├── interaction/
│   └── save/
├── tests/
│   └── map_validation/
└── docs/
    ├── game-design/
    └── map-specs/
```

### Naming rules

```text
map:       ow_farm_start.tmx, ow_town_square.tmx, in_seed_shop.tmx
layer:     terrain_visual, collision, soil_data, entities, triggers
entity:    npc_mira, portal_to_town, chest_intro_tools
asset:     ts_temperate_terrain.png, prop_fence_wood_01.png
prefab:    pf_portal, pf_crop, pf_npc_shopkeeper
```

নামের মধ্যে space, `final`, `new`, `copy`, `v2_really_final` রাখব না। Git history সংস্করণ ধরে রাখবে।

---

## ৫. Map layer contract

### ৫.১ Top-down farm/RPG-এর layer preset

| ক্রম | Layer ID | ধরন | কাজ | Game runtime-এ দরকার? |
|---:|---|---|---|---|
| 00 | `background` | image/tile | দূরের sky/void/parallax | হ্যাঁ |
| 01 | `terrain_visual` | tile | grass, dirt, road, water | হ্যাঁ |
| 02 | `deco_ground` | tile | grass tuft, shadow, pebble | হ্যাঁ |
| 03 | `collision` | invisible tile/int-grid | wall, water, cliff block | হ্যাঁ |
| 04 | `soil_data` | invisible tile/int-grid | farmable/tilled/water behavior basis | হ্যাঁ |
| 05 | `objects_static` | object/tile | fence, tree, building, sign | হ্যাঁ |
| 06 | `interactables` | object | chest, crop node, door, resource | হ্যাঁ |
| 07 | `entities` | object | NPC, enemy, animal, player spawn | হ্যাঁ |
| 08 | `triggers` | object | portal, quest, camera, audio | হ্যাঁ |
| 09 | `foreground` | tile/image | roof, leaf canopy, front grass | হ্যাঁ |
| 10 | `notes_dev` | object | designer notes only | **না** |

### ৫.২ অপরিবর্তনীয় rule

- `collision` layer-এ কোনও দৃশ্যমান art রাখব না।
- `terrain_visual` দেখে code “চাষযোগ্য কি না” সিদ্ধান্ত নেবে না।
- `notes_dev` release export-এ যাবে না।
- `entities` ও `triggers`-এর প্রতিটি object-এর **unique ID** থাকবে।
- portal কেবল coordinate নয়; target map + target entry ID ব্যবহার করবে।

---

## ৬. Map entity schema: portal, spawn, NPC ও trigger

নিচের ধারণাগুলো Tiled custom properties, LDtk entity fields, Godot exported variables বা current codebase-এর data table-এ রূপ নেবে।

### ৬.১ Portal

```yaml
id: portal_farm_to_town
class: portal
rect: [736, 0, 80, 16]
target_map: ow_town_square
target_entry: entry_from_farm
transition: fade_black
required_flag: null
one_way: false
```

### ৬.২ Spawn / entry point

```yaml
id: entry_from_farm
class: spawn_point
position: [128, 608]
facing: south
safe_radius: 24
```

### ৬.৩ NPC

```yaml
id: npc_mira
class: npc
npc_id: mira
schedule_id: mira_spring_morning
home_map: ow_town_square
interaction_radius: 20
facing: south
```

### ৬.৪ Farmable cell (runtime state)

```yaml
map_id: ow_farm_start
cell: [17, 22]
base_type: soil
state: tilled
crop_id: turnip
crop_stage: 1
watered_today: true
fertilizer_id: null
```

**সেভে এটি থাকবে; base map-এ প্রতিটি cell-এর duplicate state থাকবে না।**

---

## ৭. Map তৈরির আট ধাপের কাজের তালিকা

### ধাপ A — Gameplay metric scene

**সময়:** প্রথমে; যত ছোটই হোক।

- [ ] একখানা flat test room তৈরি।
- [ ] player movement সঠিক।
- [ ] tile size ও camera zoom যাচাই।
- [ ] player 1 second-এ কত tile হাঁটে লিখে রাখা।
- [ ] tool range/interaction radius দেখা।
- [ ] collider ও sliding ঠিক করা।

**ফল:** `docs/map-specs/movement-metrics.md`।

### ধাপ B — World graph

- [ ] ৩–৫টি node-এর বেশি নয়।
- [ ] প্রতিটি edge-এর travel purpose লিখুন।
- [ ] critical path, optional branch, locked path আলাদা রঙে।
- [ ] প্রত্যেক zone-এ একটি landmark/identity।
- [ ] কখন player backtrack করবে লিখুন।

**ফল:** `docs/map-specs/world-graph-v01.md` বা `.svg/.png`।

### ধাপ C — Graybox map

- [ ] tile palette: floor, wall, water, hazard, interaction marker—মাত্র পাঁচ রঙ।
- [ ] শুরু থেকে লক্ষ্য পর্যন্ত পথ খেলে দেখুন।
- [ ] artificial decoration যোগ করবেন না।
- [ ] travel time stopwatch দিয়ে মাপুন।
- [ ] blockout-এর screenshot/recording commit-এ রাখুন।

### ধাপ D — Whitebox/data

- [ ] collision layer।
- [ ] soil/water/navigation data।
- [ ] spawn, portal, NPC, interaction object।
- [ ] camera, audio, quest triggers।
- [ ] portal target validator চালান।

### ধাপ E — Tileset & art kit

- [ ] palette, lighting direction, outline rule লেখা।
- [ ] terrain/autotile test map।
- [ ] 3×3, 10×10, long strip, edge/corner test।
- [ ] ৩–৫টি ground variant।
- [ ] ১টি landmark prop; ২–৩টি small prop।

### ধাপ F — Art pass

- [ ] main path পড়তে সহজ।
- [ ] player background থেকে আলাদা।
- [ ] object pivot/Y-sort সঠিক।
- [ ] roof/canopy player ঢাকলে fade/hide rule।
- [ ] parallax/foreground খেলায় বাধা দিচ্ছে না।

### ধাপ G — Playtest pass

- [ ] কাউকে কিছু না বলে খেলতে দিন।
- [ ] সে কোথায় আটকে যায় লিখুন।
- [ ] “আমার ভালো লাগেনি” feedback থেকে আচরণ বের করুন।
- [ ] একবারে ১–৩টি পরিবর্তন।
- [ ] পুনরায় test।

### ধাপ H — Release/lock pass

- [ ] missing asset নেই।
- [ ] invalid portal নেই।
- [ ] save/reload test।
- [ ] low-spec performance test।
- [ ] map version notes update।

---

## ৮. প্রথম vertical-slice map: একটি বাস্তব build plan

### ৮.১ Scope

```text
Map A: ow_farm_start
- ছোট farm plot
- player house exterior
- pond/water edge
- exit gate → town
- 1 NPC বা sign
- 3 plantable crop cells (শুরুতে যথেষ্ট)

Map B: ow_town_square
- ফিরে আসার portal
- 1 shop/NPC interaction
- sign/landmark
- exit back → farm
```

### ৮.২ এর মধ্যে যে পূর্ণ game loop প্রমাণ হবে

```text
spawn at farm
  → tool দিয়ে soil till
  → seed লাগানো
  → water করা
  → save
  → town portal দিয়ে যাওয়া
  → shop/NPC interaction
  → farm-এ ফেরা
  → reload করে crop/soil state দেখা
```

### ৮.৩ প্রথম pass-এ map layout (শুধু ধারণা)

```text
Farm start
┌──────────────────────────────────┐
│  trees / boundary       pond      │
│                                  │
│       [house]                    │
│                                  │
│       plantable field             │
│                                  │
│                         gate →   │
└──────────────────────────────────┘

Town square
┌──────────────────────────────────┐
│ ← gate          notice board     │
│                                  │
│        [shop / NPC]              │
│                                  │
│       landmark: fountain/tree    │
└──────────────────────────────────┘
```

এটি final art direction নয়। কেবল এমন একটি slice যাতে map system-এর সব গুরুত্বপূর্ণ link পরীক্ষা হয়।

---

## ৯. তিনটি authoring profile

### Profile A — Tiled (engine-neutral / পুরনো source-code friendly)

**নেব যখন:** আমাদের MMORPG codebase custom engine/unknown format-এ; map data importer লিখতে রাজি; designer-friendly separate map files চাই।

**Tiled project setup:**

1. নতুন project → orthogonal orientation → logical tile size ঠিক করুন।
2. `ts_temperate_terrain.tsx` external tileset করুন।
3. উপরের layer contract মেনে map template তৈরি করুন।
4. object templates বানান: `portal`, `spawn_point`, `npc`, `quest_trigger`, `shop`।
5. map metadata দিন: `map_id`, `biome`, `music`, `version`।
6. TMX/JSON importer শুধু approved layer/object class পড়বে।
7. build-time validator: duplicate ID, nonexistent target map/entry, invalid tile, unknown entity class ধরবে।

**মূল লাভ:** map পরিবর্তন code rebuild ছাড়া data edit হিসেবে review করা যায়।

### Profile B — LDtk (data-driven map)

**নেব যখন:** tile-এর চেয়ে gameplay cell/entity data বেশি গুরুত্বপূর্ণ; IntGrid/auto-layer চাই।

**Layer design:**

```text
Collision      : IntGrid (0 empty, 1 solid, 2 water, 3 cliff)
Soil           : IntGrid (0 none, 1 tillable, 2 blocked)
TerrainVisual  : Auto-layer, Collision/Soil rules থেকে visual edge
Decoration     : Tile layer
Entities       : Entity layer (Portal, Spawn, NPC, Shop)
Foreground     : Tile layer
```

এখানে `Collision` বা `Soil` paint করলেই auto-layer rule দৃশ্য সাজাতে পারে। ফলে gameplay truth আগে; art consistency পরে স্বয়ংক্রিয়।

### Profile C — Godot 4.x native TileMapLayer

**নেব যখন:** আমরা Godot 4-এ নতুন game শুরু করছি এবং external map editor-এর extra pipeline দরকার নেই।

```text
World (Node2D)
├── Background (Parallax/CanvasLayer as needed)
├── TerrainVisual (TileMapLayer)
├── Decoration (TileMapLayer)
├── CollisionData (TileMapLayer or data node)
├── Objects (Node2D)
├── Entities (Node2D)
├── Triggers (Node2D)
└── Foreground (TileMapLayer)
```

- shared TileSet `.tres` external resource করুন।
- collision, navigation, occlusion TileSet metadata-তে রাখুন যেখানে স্থির terrain-এর জন্য যথাযথ।
- dynamic crop/door/NPC scene/prefab হিসেবে রাখুন।
- new Godot project-এ `TileMapLayer` ব্যবহার করুন; পুরনো `TileMap` workflow কপি করবেন না।

---

## ১০. Tool-agnostic import contract (developer checklist)

Map importer/loader যেই লিখুক, এই API-সদৃশ দায়িত্বগুলো পরিষ্কার থাকুক:

```text
load_map(map_id)
  → map file/scene read
  → visual layers spawn
  → static collision/nav register
  → entities instantiate
  → triggers register
  → saved dynamic-state apply
  → requested entry point resolve
  → player safely position
  → map-loaded signal emit

unload_map(map_id)
  → save dirty map state
  → unregister triggers
  → free entities/visuals no longer needed
  → release map references
```

### Portal transition contract

```text
request_transition(target_map_id, target_entry_id)
  1. input lock
  2. fade out
  3. save current map dirty state
  4. load/activate target map
  5. find target entry by ID
  6. validate safe tile/collision-free placement
  7. position player + set facing
  8. fade in
  9. input unlock
```

Coordinate-to-coordinate warp-এর বদলে `entry_id` নেওয়া জরুরি: map edit হলে target coordinate বদলালেও link ভাঙবে না।

---

## ১১. Map validator: ছোট automation, বড় লাভ

প্রথমে একটি script/manual command হলেও নিচেরগুলো পরীক্ষা করব:

```text
MAP-001  map_id unique কি?
MAP-002  required layers আছে কি?
MAP-003  dev-only layer runtime export-এ নেই তো?
MAP-004  object ID unique কি?
MAP-005  portal target_map exists কি?
MAP-006  portal target_entry exists কি?
MAP-007  target entry blocked/collision-এর ভিতর নয় তো?
MAP-008  referenced entity/prefab/data ID exists কি?
MAP-009  invalid/missing tile reference আছে কি?
MAP-010  map boundary/camera bounds valid কি?
```

### Simple manual validation table

| Test | Farm map | Town map | Result/date |
|---|---|---|---|
| Spawn safe | ☐ | ☐ | |
| Outgoing portal | ☐ | ☐ | |
| Return portal | ☐ | ☐ | |
| NPC interact | ☐ | ☐ | |
| Collision | ☐ | ☐ | |
| Save/load state | ☐ | ☐ | |
| 60fps/target frame | ☐ | ☐ | |

---

## ১২. Playtest script

Tester-কে আগে map বুঝিয়ে দেব না। শুধু বলব:

> “তুমি নতুন খেলোয়াড়। ইচ্ছেমতো খেলো এবং কী ভাবছ জোরে বলো। আটকে গেলে আমাকে জিজ্ঞেস করার আগে অন্তত ২০ সেকেন্ড নিজে চেষ্টা করো।”

পর্যবেক্ষকের form:

```text
Tester: __________________   Build: ___________   Date: __________

1. প্রথমে কোথায় যেতে চেয়েছে?
2. gate/portal বুঝতে পেরেছে?
3. plantable field চিনেছে?
4. NPC/interaction বুঝেছে?
5. ভুল পথে/অদৃশ্য collision-এ আটকে গেছে?
6. camera/foreground player ঢেকেছে?
7. বোরিং travel কতক্ষণ ছিল?
8. bug/soft-lock:
9. quote নয়, দেখা আচরণ:
10. অগ্রাধিকার পরিবর্তন (P0/P1/P2):
```

**Priority rule:**

- `P0` = crash, soft-lock, data loss, map transition fail
- `P1` = core objective বোঝা যায় না, unfair collision/camera, save state broken
- `P2` = decoration, color, extra prop, cosmetic polish

P0/P1 থাকা অবস্থায় নতুন tree/flower বানানো যাবে না।

---

## ১৩. Art-pass checklist

### Readability

- [ ] player ও walkable path background থেকে আলাদা।
- [ ] wall, water, cliff, blocked object-এর visual language এক।
- [ ] interactable object স্থির decoration থেকে আলাদা cue পায়।
- [ ] gate/door/portal কোথায় বোঝা যায়।
- [ ] large prop player বা path পুরো ঢাকে না।

### Consistency

- [ ] আলো একই দিক থেকে।
- [ ] palette art bible অনুযায়ী।
- [ ] tile edge-এ seam নেই।
- [ ] ground variation অতিরিক্ত noisy নয়।
- [ ] house/tree/character scale একই বিশ্বে মানায়।

### Performance

- [ ] prop atlas/texture discipline ঠিক।
- [ ] useless off-screen particle/animation নেই।
- [ ] large foreground transparency profile করা।
- [ ] tile collider অপ্রয়োজনীয়ভাবে অসংখ্য নয়।

---

## ১৪. সাধারণ ভুল ও তার প্রতিরোধ

| ভুল | কেন ক্ষতি | প্রতিরোধ |
|---|---|---|
| final art দিয়ে শুরু | layout বদলালে art নষ্ট | graybox first |
| visual tile থেকে gameplay অনুমান | reskin/season পরিবর্তনে logic ভাঙে | data layer/tag |
| portal coordinate hard-code | map edit-এ transition ভাঙে | target entry ID |
| এক layer-এ সব রাখা | debug/iteration অসম্ভব | layer contract |
| dynamic crop-কে static tile করা | save/state/animation জটিল | runtime entity/state table |
| সব map load করে রাখা | memory/frame সমস্যা | zone/chunk activation |
| procedural generation আগে | fun/pacing control হারায় | curated template + validation |
| ১টি ground tile ১০০ বার | wallpaper effect | variations/decal/props |
| art দিয়ে wall দেখালেও collider নেই | player world ভেঙে ফেলে | QA collision pass |
| too much foreground | player হারিয়ে যায় | occlusion/fade/readability test |

---

## ১৫. সাত দিনের mini-sprint

এটি কেবল প্রথম playable map system-এর sprint; full game-এর নয়। প্রতিদিন ১–৩ ঘণ্টা হলেও চলবে।

| দিন | লক্ষ্য | গ্রহণযোগ্য ফল |
|---:|---|---|
| ১ | Codebase/license audit + project decision form | engine, map format, tile size, repo baseline জানা |
| ২ | Movement metric test scene | player/camera/collision কাজ করে; metric লেখা |
| ৩ | World graph + map template/layer contract | দুই map-এর graph ও empty map files |
| ৪ | Farm graybox + collision + spawn | farm-এ হাঁটা/আটকানো যায় |
| ৫ | Town graybox + named portals | দুইদিকে transition কাজ করে |
| ৬ | Soil/tool/save state + ১ NPC | একটি সম্পূর্ণ farm action loop |
| ৭ | Tileset placeholder + playtest + bug list | অন্য একজন খেলেছে; P0/P1 list আছে |

**Sprint শেষে প্রশ্ন:** “সম্পূর্ণ খেলা যাবে?”—না। কিন্তু “আমরা map-based game বানাতে পারব কি?”—এর বাস্তব প্রমাণ থাকবে।

---

## ১৬. আমরা কাজ শুরু করলে প্রথমে কী করব

1. বর্তমান source code/engine/folder structure দেখা।
2. LICENSE ও third-party asset license যাচাই।
3. এই playbook-এর decision form পূরণ।
4. repo-তে `maps/`, `data/`, `docs/` কোথায় বসবে ঠিক করা।
5. movement metric test scene চালানো।
6. তারপর `ow_farm_start` নামে empty graybox map বানানো।

> **কাজের আদেশ:** পুরো game map বানানোর কোনও চেষ্টা নয়। আগে এমন একটি map বানাব যেটিতে ঢোকা, হাঁটা, কাজ করা, save করা এবং বের হওয়া সত্যি সত্যি সম্ভব। তারপর সেই পদ্ধতিকে বড় করব।
