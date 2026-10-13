# বাংলাদেশ-অনুপ্রাণিত 2D ফার্মিং/লাইফ-সিম গেম: শুরু থেকে শেষ পর্যন্ত মাস্টার প্ল্যান

> **এই পরিকল্পনার উদ্দেশ্য:** বড় স্বপ্নকে ছোট, পরীক্ষাযোগ্য এবং শেষ করা যায় এমন ধাপে ভাগ করা।
>
> **মূল নীতি:** আমরা আগে “পুরো গেম” বানাব না। আগে এমন একটি ছোট অংশ বানাব যেখানে খেলোয়াড় ঢুকতে, হাঁটতে, চাষ করতে, ঘুমাতে, সেভ করতে ও গ্রামে যেতে পারে। সেটি মজার ও স্থির হলে তবেই বিশ্ব বড় করব।
>
> **বর্তমান পরিচয়:** বাংলাদেশ-অনুপ্রাণিত top-down 2D farming + life simulation + light exploration RPG; গাজীপুর–মধুপুরের লাল চালা, বাইদ, শালবন, বাঁশঝাড়, পুকুর-ঘাট ও ছয় ঋতুর ভিত্তিতে।
>
> **স্থিতি:** পরিকল্পনা v1 — source code/engine audit-এর পরে প্রযুক্তিগত অংশ আরও নির্দিষ্ট হবে।

---

## ১. প্রথম প্রশ্নের সরাসরি উত্তর: শুরুতে কি পুরো ম্যাপ বানানো ভালো?

**না—পুরো final map প্রথমে বানানো ভালো নয়।**

তবে **ছোট graybox map খুব তাড়াতাড়ি বানানো জরুরি।** পার্থক্যটি মনে রাখুন:

```text
❌ আগে final map বানানো
   → সুন্দর tileset, গাছ, বাড়ি, বিশাল গ্রাম
   → পরে বোঝা গেল player-এর গতি/camera/tool/collision বদলাতে হবে
   → অনেক art ও map কাজ নষ্ট

✅ আগে map graph + movement test + graybox map
   → player হাঁটে, tool চালায়, portal দিয়ে যায়
   → distance ও fun পরীক্ষা হয়
   → তারপর একই map-এ আসল Bangladeshi art বসে
```

### আমাদের সঠিক map order

```text
Game vision
  → player movement/camera prototype
  → world graph
  → Farm graybox
  → Village graybox + portal
  → farming/save loop
  → playtest
  → first tileset/asset kit
  → final-art pass
  → new maps/zones
```

অর্থাৎ map শুরু হবে early stage-এ, কিন্তু **final art map** শুরু হবে vertical slice কাজ করার পরে।

---

## ২. গেমের এক-বাক্যের পরিচয়

> **চালাবন উপত্যকা** একটি কাল্পনিক, বাংলাদেশ-অনুপ্রাণিত 2D life-sim—যেখানে খেলোয়াড় গাজীপুরের লালমাটির চালায় ফার্ম গড়ে, বর্ষায় জলধরা বাইদ ও শালবনের বদল দেখে, গ্রাম-হাটের মানুষের সঙ্গে সম্পর্ক বানায় এবং ছয় ঋতুর সঙ্গে নিজের জীবন সাজায়।

এটি নাম ও দিকনির্দেশনা মাত্র; চূড়ান্ত নাম পরে বদলাতে পারে।

---

## ৩. গেমের Design Pillars: সব সিদ্ধান্তের পরীক্ষা

নতুন কোনো feature, map বা asset যোগ করার আগে এই পাঁচ প্রশ্নে মাপব।

| Pillar | অর্থ | উদাহরণ |
|---|---|---|
| **বাংলার জীবন্ত ভূদৃশ্য** | জায়গা শুধু সুন্দর নয়, জল-মাটি-ঋতুতে বদলায় | চালা শুকনো, বাইদ বর্ষায় জলে ভরে |
| **শান্ত কিন্তু অর্থপূর্ণ দৈনন্দিনতা** | player-এর প্রতিদিন ছোট সিদ্ধান্ত থাকবে | আজ field, মাছ, হাট, না বন? |
| **স্থান ও মানুষের সম্পর্ক** | NPC তাদের কাজ/ঘর/পথের সঙ্গে যুক্ত | বর্ষায় ঘাটের কাজ বদলায়, হেমন্তে harvest routine |
| **ন্যায্য চাপ, নির্মম শাস্তি নয়** | সময়/energy সিদ্ধান্ত দেবে, soft-lock নয় | বৃষ্টিতে পথ বদলায়, নৌকা shortcut খোলে |
| **দেশজ প্রকৃতির প্রতি যত্ন** | native flora habitat অনুযায়ী | শালবনে শাল; ম্যানগ্রোভ গাজীপুরে নয়; exotic plantation core nature নয় |

যে feature এই পাঁচটির কোনোটিকে শক্তিশালী করে না, তা এখন backlog-এ থাকবে।

---

## ৪. Success definition: প্রথমে কোন গেম বানাচ্ছি

### ৪.১ MVP — Minimum Viable Playable Game

প্রথম release-যোগ্য ছোট game-এর জন্য **অবশ্যই লাগবে**:

```text
Player movement + collision + camera
Farm map + Village map (দুই map-এর portal round-trip)
দিন-রাতের ছোট clock + ঘুম + save/load
ছয় ঋতুর basic calendar ও অন্তত palette/state change
মাটি চাষ → বীজ → পানি → নতুন দিনে ফসলের ধাপ বদল → harvest
Inventory + ১টি দোকান/বিক্রি
১–৩ NPC, basic dialogue ও সহজ routine
বর্ষা/রোদ/কুয়াশা/গরমের basic weather
দেশজ Gazipur starter art kit: red soil, sal, bamboo, pond, baid
১টি ছোট লক্ষ্য: village/community repair বা starter delivery quest
```

### ৪.২ MVP-তে থাকবে না

```text
Multiplayer
Marriage/children
২০+ NPC
বড় mining dungeon
Procedural infinite world
Mobile + PC + console একসঙ্গে
দূরের mangrove/hill/coast expansion
Hundreds of crops/recipes
Full voice acting
```

এগুলো খারাপ নয়—শুধু **প্রথম গেম শেষ হওয়ার আগের কাজ নয়**।

---

## ৫. পুরো development roadmap: Phase 0 → Release

প্রতিটি phase-এ “কাজ” নয়, “শেষ হওয়ার প্রমাণ” আছে। আগের phase-এর gate পাশ না করলে পরের বড় phase শুরু হবে না।

---

### Phase 0 — অধিকার, source audit ও প্রকল্পের ভিত্তি

**উদ্দেশ্য:** ভুল source/লাইসেন্স/engine ধারণা নিয়ে কাজ শুরু না করা।

**কাজ**
- [ ] source code থাকলে engine, language, folder layout ও build process দেখা
- [ ] `LICENSE`, third-party asset, sound, font, plugin অধিকার যাচাই
- [ ] Git repository/private backup ও baseline tag তৈরি
- [ ] target platform ঠিক করা: PC-first (প্রাথমিক সুপারিশ)
- [ ] engine/map format choose করা: existing engine অনুযায়ী Tiled/LDtk/native
- [ ] project decision form পূরণ
- [ ] issue board/backlog তৈরি: `Now`, `Next`, `Later`, `Bugs`

**Gate / শেষ হওয়ার প্রমাণ**

```text
এক ক্লিকে project build/run হয়
লাইসেন্স-ঝুঁকি জানা আছে
কোড/asset কোথায় যাবে জানা আছে
পিছনে ফেরার জন্য Git baseline আছে
```

---

### Phase 1 — Player feel laboratory

**উদ্দেশ্য:** গাছ, map ও story-এর আগে player-এর চলা আরামদায়ক করা।

**কাজ**
- [ ] empty test room
- [ ] player walk/run, 4/8-direction animation placeholder
- [ ] collision ও wall sliding
- [ ] camera follow, camera boundary, pixel-perfect positioning
- [ ] one interaction button
- [ ] one tool swing + target tile highlight
- [ ] movement/camera metrics লিখে রাখা

**Gate**

```text
Player চালানো মসৃণ ও আনন্দদায়ক
দেয়ালে আটকে যায় না
camera কাঁপে না
কোন tile-এ tool কাজ করবে তা পরিষ্কার
```

> এই phase ছাড়া final map বানালে door width, path width, tree scale, field size—সব অনুমান হয়ে যাবে।

---

### Phase 2 — World graph ও graybox maps

**উদ্দেশ্য:** গেমের দূরত্ব ও জায়গার উদ্দেশ্য পরীক্ষা করা। এখনও final art নয়।

**কাজ**
- [ ] first world graph freeze: Farm ↔ Village ↔ Baid/Forest edge
- [ ] map layer contract ও naming convention চালু
- [ ] `ow_farm_chala` graybox: বাড়ি, field, pond, exit
- [ ] `ow_gram_uthan` graybox: shop/NPC, landmark, return exit
- [ ] portal target map + named entry ID
- [ ] collision, spawn, camera boundary
- [ ] 1–2 মিনিটের travel time মাপা

**Graybox palette**

```text
লাল rectangle = solid wall/tree
সবুজ rectangle = walkable field
নীল rectangle = water
হলুদ marker = interactable
বেগুনি marker = portal/spawn/trigger
```

**Gate**

```text
Farm → Village → Farm round trip কাজ করে
player spawn নিরাপদ
কোনও portal hard-coded coordinate-এ ভাঙে না
কেউ ৫ মিনিট খেলে পথ বুঝতে পারে
```

---

### Phase 3 — প্রথম সম্পূর্ণ দৈনিক farming loop

**উদ্দেশ্য:** “এটি কি খেলা হিসেবে মজার?”—এই সবচেয়ে জরুরি প্রশ্নের উত্তর।

**কাজ**
- [ ] game clock: সকাল → রাত → ঘুম
- [ ] new-day batch update
- [ ] soil data layer: tillable/blocked/water
- [ ] till → seed → water → grow → harvest
- [ ] 2–3 crop definition (data file থেকে)
- [ ] inventory stack
- [ ] seed buy / crop sell
- [ ] energy (soft constraint)
- [ ] save/load: crop, soil, player position, day/season
- [ ] rain হলে outdoor soil watered

**Technical rule**

```text
ফসল প্রতি frame-এ বাড়বে না।
ঘুম/নতুন দিনে সব location-এর crop state একবার update হবে।
দেখা যায় শুধু সেই crop-ই render হবে।
```

**Gate**

```text
Player একটি পূর্ণ দিন খেলতে পারে:
farm → পানি → village → seed কেনা/কথা → farm → ঘুম → crop change/save persists
```

এটি আমাদের **First Playable**। এই phase পার না হলে নতুন map, mine বা marriage নয়।

---

### Phase 4 — বাংলাদেশি starter art vertical slice

**উদ্দেশ্য:** কাজ করা graybox-কে প্রথমবার আমাদের নিজস্ব পৃথিবীর মতো দেখানো।

**কাজ**
- [ ] art bible: logical tile size, palette, light direction, outline, scale
- [ ] red chala soil tiles: dry/wet/path/edge
- [ ] baid/paddy/water edge placeholder-to-final kit
- [ ] sal: mature, coppice, stump, leaf litter
- [ ] bamboo clump, pond edge, earthen ghat
- [ ] 1–2 native fruit tree: jam/chalta
- [ ] simple home/shop kit
- [ ] player idle/walk/tool animation final v1
- [ ] Y-sort, foreground/roof/leaf occlusion rule

**Gate**

```text
একটি screenshot দেখেই বোঝা যায়:
এটি generic foreign farming game নয়;
এটি বাংলাদেশ-অনুপ্রাণিত লালমাটি–শালবন–পুকুরের জায়গা।
```

---

### Phase 5 — ঋতু, weather ও জীবন্ত world

**উদ্দেশ্য:** ছয় ঋতুকে gameplay ও mood-এ সত্যি করা।

**কাজ**
- [ ] 6-season calendar skeleton: প্রথমে 12 দিন × 6 season test
- [ ] weather weights: clear/cloud/rain/heavy rain/fog/hot day
- [ ] terrain seasonal palette/decal
- [ ] baid water-level / paddy state
- [ ] Sal leaf-litter, wet canopy, new-leaf, sparse variants
- [ ] crop season-valid rule ও UI information
- [ ] seasonal forage/fish table
- [ ] 1 weather-aware NPC schedule
- [ ] accessibility: rain/fog/particle intensity setting

**Gate**

```text
একই Farm/Baid/Forest map গ্রীষ্ম, বর্ষা, হেমন্ত ও শীতে স্পষ্ট আলাদা লাগে;
কিন্তু collision, portal ও save system ভাঙে না।
```

---

### Phase 6 — গ্রাম, NPC ও অর্থনীতির গভীরতা

**উদ্দেশ্য:** player-এর “আরেক দিন খেলি” ইচ্ছার social ও economic ভিত্তি।

**কাজ**
- [ ] 3–5 well-written NPC (২০ জন ফাঁপা চরিত্র নয়)
- [ ] NPC home, job, schedule, weather/season variations
- [ ] dialogue flags ও simple friendship points
- [ ] shop economy: seeds, basic tool upgrade/materials
- [ ] one community objective / restoration project
- [ ] notice board: simple delivery/forage quest
- [ ] cooking/crafting-এর ছোট first version (ঐচ্ছিক, crop loop স্থির হলে)

**Gate**

```text
NPC-দের map-এ থাকার কারণ আছে
player জানে পরের সপ্তাহে/season-এ কী লক্ষ্য
money-এর ব্যবহার আছে, কিন্তু grind বাধ্যতামূলক নয়
```

---

### Phase 7 — World expansion, exploration ও light RPG

**উদ্দেশ্য:** মূল loop ভালো প্রমাণিত হওয়ার পরে নতুন জায়গা দিয়ে variety বাড়ানো।

**ক্রম**

```text
১. Baid rice-field / wetland map
২. Sal forest deep area + foraging/restoration quest
৩. River ghat market + boat travel
৪. Fishing system deepen
৫. Small mine/cave prototype (শুধু তখনই যখন core game স্থির)
৬. Future: mangrove/hill region expansion
```

**Rule:** প্রতিটি নতুন zone-এ থাকবে 1 নতুন activity, 1 new visual identity, 1 seasonal change, 1 reason to return।

---

### Phase 8 — Content complete, balance ও playtesting

**উদ্দেশ্য:** শুধু feature আছে নয়—খেলতে ভালো লাগে, বোঝা যায়, শেষ করা যায়।

**কাজ**
- [ ] new player onboarding: প্রথম 3 game day নরম tutorial
- [ ] crop/day/energy/economy spreadsheet balance
- [ ] playtest sessions: কাউকে কিছু না বুঝিয়ে খেলতে দেওয়া
- [ ] funnel observation: কোথায় player আটকে যায়
- [ ] P0/P1/P2 bug triage
- [ ] map validator: invalid portal, duplicate ID, blocked spawn, missing entity
- [ ] save compatibility tests
- [ ] low-spec performance profiling
- [ ] accessibility: input remap, text readability, effect slider, colour contrast

**Gate**

```text
নতুন player core loop বুঝতে পারে
কোনও crash/soft-lock/data loss নেই
লক্ষ্য platform-এ frame rate গ্রহণযোগ্য
```

---

### Phase 9 — Polish, beta ও release

**কাজ**
- [ ] audio/music/SFX pass
- [ ] UI/UX polish
- [ ] achievements/credits/licences
- [ ] trailer/screenshots/store description
- [ ] closed beta feedback
- [ ] save migration + backup plan
- [ ] release checklist
- [ ] post-release bug patch plan

**Release gate**

```text
শুরু → core loop → short-term goal → save/load → ending/first completion loop
সব আছে এবং নির্ভরযোগ্য।
```

---

## ৬. Map তৈরির বিস্তারিত roadmap

### ৬.১ Map design passes

প্রতিটি map এই ৭ pass-এ হবে:

```text
1. Purpose card      : player এখানে কেন আসবে?
2. Connection graph  : কোথা থেকে ঢুকবে/বেরোবে?
3. Graybox           : চলাচল, collision, camera, distance
4. Gameplay data     : soil, water, NPC, portal, trigger, spawn
5. Whitebox test     : art ছাড়া সম্পূর্ণ খেলাযোগ্য কিনা
6. Art pass          : terrain → silhouette → props → foreground → VFX
7. Playtest/polish   : player behavior অনুযায়ী পরিবর্তন
```

### ৬.২ প্রথম map-গুলোর priority

| ক্রম | Map | কেন আগে | Minimum content |
|---:|---|---|---|
| 1 | **লালমাটি Farm / `ow_farm_chala`** | core loop-এর ঘর | house, field, pond, soil, exit |
| 2 | **চালাবন Village / `ow_gram_uthan`** | shop/NPC/portal test | store, one NPC, landmark, return route |
| 3 | **Baid Field / `ow_baid_fields`** | season-water identity | paddy/water state, embankment, forage |
| 4 | **Sal Forest Edge / `ow_sal_edge`** | native flora/forage | sal, bamboo, path, 1 quest/shortcut |
| 5 | **Pond/Bamboo/Ghat / `ow_bamboo_pukur`** | fishing/relaxation | fish spot, ghat, water transition |
| 6 | **River Ghat Market / `ow_nodi_ghat`** | trade & future travel | market, boat, seasonal water level |

### ৬.৩ Full map বানানোর আগে Map Card

```yaml
map_id: ow_farm_chala
purpose: farming home and first tutorial
player_actions: till, plant, water, harvest, rest, store
entry_points: [start_new_game, from_village]
exits: [to_village]
seasonal_change: soil wetness, baid edge water, sal leaf/colour
landmark: pond + large sal / house courtyard
native_flora: sal, bamboo, jam, chalta
must_not_include: eucalyptus, acacia, mahogany, rain tree
playtest_question: does player understand where to plant and how to leave?
```

---

## ৭. Asset তৈরির সঠিক ক্রম

### প্রথমে যা নয়

- ১০০টি ফলের গাছ
- ৬ ঋতুর সব NPC dress
- পূর্ণ village house set
- distant mangrove/hill asset
- detailed VFX

### প্রথমে যা

```text
Player: idle, walk, tool-use
Terrain: red soil, wet soil, grass, path, field edge, shallow water
Nature: sal, bamboo, pond edge, leaf litter, 1–2 native fruit trees
World: house exterior, shop exterior, gate, ghat, bridge/fence
UI: energy, time, season, inventory, interaction prompt
Crop: 2–3 crops × growth stages
```

### Asset production workflow

```text
reference board → silhouette/thumbnail → source file → export → atlas → engine import
→ in-map test → fix scale/readability → approve → version-control
```

প্রতিটি asset final করার আগে native-flora, season, palette ও lighting rule যাচাই হবে।

---

## ৮. Data ও code architecture-এর priority

### Data-driven definitions

```text
CropDef       : growth, season, sell price, sprite row
ItemDef       : name, stack, price, use
NPCDef        : home, schedule, dialogue set
MapDef        : ID, entry, exit, music, biome
TreeDef       : species, habitat, seasonal variants
WeatherDef    : season weight, water/visual/NPC effects
```

### Runtime state

```text
PlayerState   : position, inventory, energy, money, relationship
WorldState    : day, season, weather, flags
MapState      : changed tiles, planted crops, opened chests, object state
CropState     : crop type, growth stage, watered, flags
```

**নীতি:** static map file-এ একই crop state বারবার লিখব না; save file-এ কেবল change/diff থাকবে।

---

## ৯. কাজের পদ্ধতি: আমরা দুজন কীভাবে এগোব

| আপনার ভূমিকা | আমার ভূমিকা |
|---|---|
| গেমের অনুভূতি, গল্প, পছন্দ/অপছন্দ, চূড়ান্ত সিদ্ধান্ত | গবেষণা, পরিকল্পনা, code structure, map/data design, asset brief, implementation support |
| কোন feature আপনার কাছে জরুরি বলবেন | feature-কে phase/priority-তে বসাব, scope/risk বলব |
| visual concept পছন্দ/অপছন্দ বলবেন | original art bible, prompt/reference brief, asset pipeline তৈরি করব |
| playtest feedback/idea দেবেন | issue log, iteration plan, fix checklist বানাব |

### Weekly rhythm (ছোট দলের জন্য)

```text
দিন ১: লক্ষ্য lock
দিন ২–৪: একটি ছোট feature/map pass
দিন ৫: নিজের test
দিন ৬: playtest/feedback
দিন ৭: bug fix + decision log + next task
```

এক সপ্তাহে একটি সম্পূর্ণ ছোট ফল দরকার—যেমন “portal round trip works”, “crop grows overnight”, “rain waters soil”।

---

## ১০. Priority language: Now / Next / Later

### NOW — শুরুতে

```text
License/source audit
Player movement & camera
Farm/Village graybox
Portal
Soil/crop/day/save vertical slice
```

### NEXT — vertical slice মজার হলে

```text
Gazipur starter art kit
Six season visual state
Weather
3–5 NPC
Baid + Sal Forest maps
```

### LATER — core validated হলে

```text
Fishing depth
Crafting/cooking
Animals
Mine/cave
Festivals
Mangrove/hill expansion
Relationship depth
Co-op/multiplayer
```

---

## ১১. সবচেয়ে বড় ঝুঁকি ও প্রতিরোধ

| ঝুঁকি | প্রতিরোধ |
|---|---|
| feature scope বেড়ে যাওয়া | MVP list না পেরোনো পর্যন্ত Later feature নয় |
| সুন্দর art, কিন্তু মজার gameplay নয় | graybox/playtest আগে |
| map too large, walking boring | movement metric + travel-time test |
| Bangladeshi feel generic/foreign হয়ে যাওয়া | geography/flora/season knowledge base reference |
| ভুল/বিদেশি গাছ natural forest-এ ঢুকে যাওয়া | native asset registry approval |
| old source code ভেঙে যাওয়া | audit, Git baseline, one system at a time |
| performance issue | day-tick simulation, culling, atlas, profiler early |
| save corruption | versioned save schema + backup/migration test |
| multiplayer complexity | single-player first |

---

## ১২. প্রথম 10টি বাস্তব task

কোড/প্রকল্প হাতে পেলে এই ক্রমেই শুরু করব:

1. source code, engine ও license audit
2. Git baseline + build instructions লিখে রাখা
3. project decision form পূরণ
4. empty movement/camera/collision test scene
5. map folder, layer contract ও map data format
6. `ow_farm_chala` empty graybox
7. player spawn + Farm collision + camera bounds
8. `ow_gram_uthan` graybox + named portal round-trip
9. till/plant/water/new-day/save loop
10. প্রথম Gazipur starter tile/prop kit দিয়ে Farm art pass

---

## ১৩. আজকের সিদ্ধান্ত

> **আমরা ম্যাপ দিয়ে শুরু করব, কিন্তু final সুন্দর ম্যাপ দিয়ে নয়।**
>
> প্রথমে Player Feel Lab → Farm/Village Graybox → Farming Day Loop। তারপর সেই কাজ করা পৃথিবীর ওপর দেশজ গাজীপুরের শাল, লালমাটি, বাইদ, বাঁশঝাড় ও ছয় ঋতুর art বসাব।

এভাবে এগোলে আমাদের গেম কেবল দেখতে সুন্দর নয়—খেলতেও ভালো, বড় করতেও সহজ এবং শেষ করাও সম্ভব হবে।
