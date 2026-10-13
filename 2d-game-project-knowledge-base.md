# আমাদের 2D গেম প্রকল্প: জ্ঞানভিত্তি ও কাজের চুক্তি

> **উদ্দেশ্য:** এখন পর্যন্ত পড়া গবেষণা-ফাইলগুলোর সিদ্ধান্ত এক জায়গায় রাখা, যাতে গেম বানানোর সময় আমরা বারবার শূন্য থেকে ভাবতে না হয়। এটি living document—গেমের সিদ্ধান্ত বদলালে তারিখসহ আপডেট হবে।
>
> **সর্বশেষ সংকলন:** ১০ অক্টোবর ২০২৬

---

## ১. যে ফাইলগুলো পড়া ও অন্তর্ভুক্ত হয়েছে

| ফাইল | মূল শিক্ষা | প্রকল্পে ব্যবহার |
|---|---|---|
| `uploads/mmorpg-to-other-genre-game-conversion-research.md` | engine/generic system ও genre-specific rule আলাদা; লাইসেন্স আগে; ছোট complete farming loop আগে | বিদ্যমান source থাকলে audit, reusable system retain, farming rules data-driven করে লেখা |
| `uploads/2d-game-character-creation-research.md` | brief→silhouette→model sheet→production; art style project constraint | player/NPC visual design ও scale chart আগে |
| `uploads/2d-game-character-animation-research.md` | frame-by-frame/rig/hybrid style, scope ও gameplay readability অনুযায়ী | first prototype-এ idle/walk/interaction, পরে প্রয়োজনমতো expand |
| `uploads/2d-game-asset-creation-research.md` | tilemap + modular kit + unique props-এর hybrid; atlas, naming, versioning | terrain reusable, landmark/hero object unique, asset discipline |
| `uploads/2d-game-art-complete-easy-guide.md` | ছোট থেকে শুরু; pixel art / Godot / Tiled practical starter stack | প্রথম prototype ছোট pixel-art map ও minimal kit |
| `research/2d-game-map-creation-research.md` | verb→graph→graybox→data→art→playtest map pipeline | map system এবং level design-এর source of truth |
| `research/2d-map-production-playbook.md` | layer contract, schemas, vertical slice, seven-day sprint | বাস্তব কাজের checklist |

---

## ২. আমাদের সম্মত কাজের নীতি

```text
আইনি অধিকার → source-code audit → gameplay prototype → graybox map →
data/interaction → playtest → art pass → optimisation → expansion
```

### Non-negotiable rules

1. **লাইসেন্স আগে।** মালিকানা/লাইসেন্স অজানা source বা asset প্রকাশযোগ্য game-এ ঢুকবে না।
2. **ছোট সম্পূর্ণ slice আগে।** “৩টি crop + ১ map + ১ NPC + save/load” “পুরো Stardew-like world”-এর আগে।
3. **কোড ও content আলাদা।** item, crop, portal, map, NPC schedule table/file থেকে আসবে; logic code hard-code নয়।
4. **Visual truth এবং gameplay truth আলাদা।** grass sprite ≠ tillable soil; art বদলালেও rule ভাঙা যাবে না।
5. **সবকিছু testable।** নতুন map, entity, save state ও transition-এর test case থাকবে।
6. **version control বাধ্যতামূলক।** কাজ শুরুর আগে stable baseline tag/commit থাকবে।
7. **একসঙ্গে একটি পরিবর্তন।** feature ভেঙে গেলে কোন পরিবর্তন দায়ী বোঝা যাবে।

---

## ৩. বর্তমান প্রাথমিক প্রযুক্তিগত সিদ্ধান্ত

এগুলো default, চূড়ান্ত নয়। source code দেখা হলে পরিবর্তন হতে পারে।

| বিষয় | প্রাথমিক সিদ্ধান্ত | কারণ |
|---|---|---|
| গেমের দৃষ্টিভঙ্গি | top-down orthogonal | farming/life RPG-তে পরিষ্কার, সরল, proven |
| world authoring | হাতে পরিকল্পিত ছোট zone | pacing ও test নিয়ন্ত্রণযোগ্য |
| map foundation | tilemap + modular props + unique landmarks | পুনঃব্যবহার ও সৌন্দর্যের ভারসাম্য |
| map data | Tiled/LDtk/engine scene—codebase দেখে নির্বাচন | existing stack না দেখে tool চাপিয়ে দেওয়া ঠিক নয় |
| gameplay data | named object + tag/layer/property | portal/soil/trigger maintainable হবে |
| art | প্রথমে placeholder বা minimal pixel art | mechanics পরীক্ষার আগে final art নয় |
| multiplayer | single-player vertical slice আগে | complexity কম, core loop দ্রুত যাচাই |
| progression | Farm → Town → future Forest/Mine | ছোট connected world graph |

---

## ৪. গেমের প্রথম playable vertical slice

### Player journey

```text
Farm-এ spawn
→ জমির কাছে যাওয়া
→ tool দিয়ে soil change
→ seed লাগানো ও water করা
→ gate দিয়ে Town-এ যাওয়া
→ একজন NPC/Shop-এর সঙ্গে interaction
→ Farm-এ ফেরা
→ save/reload করে পরিবর্তিত state পাওয়া
```

### এই slice প্রমাণ করবে

- player controller/camera কাজ করে,
- map loader ও layer system কাজ করে,
- collision/gameplay tiles আলাদা,
- portal contract কাজ করে,
- entity/interaction model কাজ করে,
- farm state save/load হয়,
- game loop-এর nucleus মজার হওয়ার সুযোগ আছে।

### এই slice এখনও প্রমাণ করবে না

- full economy balance,
- final art quality,
- multiplayer synchronization,
- long-term quest/story,
- large-world streaming,
- procedural mine generation।

এসব পরে এবং আলাদা milestones।

---

## ৫. প্রথম world graph

```text
[ow_farm_start] ←→ [ow_town_square]
       │
       └── (পরের milestone) [ow_forest_edge] ←→ [mine_entrance]
```

প্রতিটি link-এ coordinate-এর বদলে `portal ID → target map ID + target entry ID` থাকবে।

---

## ৬. Map system-এর source-of-truth নিয়ম

| তথ্য | কোথায় থাকবে | কোথায় থাকবে না |
|---|---|---|
| terrain-র ছবি | tileset / art export | gameplay code-এ tile index দেখে অনুমান নয় |
| solid/water/tillable | collision/soil map layer বা explicit metadata | কেবল art layer-এ নয় |
| portal destination | map object properties | random script coordinate নয় |
| NPC identity/schedule | NPC data table + map placement | sprite filename-এ নয় |
| crop state | save data keyed by map+cell | static map asset-এ নয় |
| quest trigger | map object + quest ID | engine scene-এ অচিহ্নিত hard-coded area নয় |
| art source | source file / version control | শুধু exported PNG নয় |

---

## ৭. কাজ শুরু করার আগের প্রশ্নসমূহ

নিচের উত্তর পেলে আমরা implementation শুরু করব:

1. আমাদের কাছে কি সত্যিই কোন source code আছে? থাকলে তার **folder**, **engine/language**, এবং **LICENSE** কী?
2. প্রথম game-এর নাম/setting/genre কি farming-sim RPG-ই, নাকি পরিবর্তন হবে?
3. target platform PC প্রথম, নাকি Android/web?
4. art style pixel art হবে কি? 16×16 না 32×32 logical tile বেশি মানায়?
5. source code existing হলে তার current map format কী?
6. single-player-first সিদ্ধান্তে আপত্তি আছে কি?

> উত্তর না থাকলেও আমরা placeholder দিয়ে শুরু করতে পারি; তবে গুরুত্বপূর্ণ প্রযুক্তিগত সিদ্ধান্তকে অনুমান হিসেবে নথিভুক্ত করব, সত্য হিসেবে নয়।

---

## ৮. পরবর্তী কাজের অগ্রাধিকারের তালিকা

### Milestone 0 — Audit and setup

- [ ] source/license audit
- [ ] Git baseline
- [ ] toolchain confirmed
- [ ] project decision form completed
- [ ] folder/layer/naming convention committed

### Milestone 1 — Movement and map loading

- [ ] test scene
- [ ] player movement/camera/collision metrics
- [ ] empty Farm map load
- [ ] map entry point spawn

### Milestone 2 — Connected maps

- [ ] Town map
- [ ] portal round-trip
- [ ] transition UI/fade
- [ ] map validator basic tests

### Milestone 3 — Farming core

- [ ] tillable cell detection
- [ ] till/plant/water action
- [ ] runtime crop instance or state record
- [ ] save/load persistence

### Milestone 4 — Interaction and first playtest

- [ ] NPC/dialogue/shop stub
- [ ] first placeholder tileset/props
- [ ] external playtest
- [ ] P0/P1 issues fixed

---

## ৯. সিদ্ধান্ত বদলালে কীভাবে লিখব

প্রতি বড় change-এর জন্য নিচের log যোগ হবে:

```markdown
### YYYY-MM-DD — সিদ্ধান্তের নাম
- **আগের সিদ্ধান্ত:**
- **নতুন সিদ্ধান্ত:**
- **কারণ/প্রমাণ:**
- **কোন files/systems প্রভাবিত:**
- **ঝুঁকি:**
- **পরের যাচাই:**
```

এর ফলে আমরা কেন Godot/Tiled/টাইল size/architecture বেছে নিয়েছিলাম হারিয়ে যাবে না।

---

## ১০. মনে রাখার সংক্ষিপ্ত সংস্করণ

> **আমরা ছবি দিয়ে game শুরু করব না।**
>
> **আমরা এমন একটি ছোট world slice বানাব যেখানে player ঢুকতে, হাঁটতে, কাজ করতে, অন্য map-এ যেতে, state save করতে এবং আবার ফিরে আসতে পারে।**
>
> সেটি মজার ও স্থির হলে—তবেই character, animation, asset, map ও content-কে একই পদ্ধতিতে বড় করব।
