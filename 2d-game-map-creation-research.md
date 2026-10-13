# 2D গেম ম্যাপ/লেভেল তৈরি: গভীর গবেষণামূলক প্রতিবেদন

> **বিষয়:** 2D গেমের map, world, room ও level কীভাবে পরিকল্পনা, তৈরি, পরীক্ষা ও অপ্টিমাইজ করা হয়; কোন পদ্ধতি কখন সেরা; এবং পেশাদার স্টুডিওর পুনরাবৃত্তিযোগ্য পাইপলাইন।
>
> **প্রসঙ্গ:** এই ফাইলটি আগের চরিত্র, অ্যানিমেশন, অ্যাসেট ও MMORPG→ফার্মিং-সিম গবেষণার সঙ্গে মিলিয়ে পড়ার জন্য লেখা। ম্যাপকে এখানে শুধু ছবি হিসেবে নয়—**খেলাযোগ্য নিয়ম + ডেটা + দৃশ্য** হিসেবে ধরা হয়েছে।
>
> **গবেষণা-আপডেট:** ১০ অক্টোবর ২০২৬

---

## সূচিপত্র

1. [প্রথম সত্য: ম্যাপ আসলে কী](#১-প্রথম-সত্য-ম্যাপ-আসলে-কী)
2. [ম্যাপের ধরন ও কোনটি কখন নেবেন](#২-ম্যাপের-ধরন-ও-কোনটি-কখন-নেবেন)
3. [সেরা পদ্ধতি: একক উত্তর নয়, কিন্তু একটি শক্তিশালী ডিফল্ট আছে](#৩-সেরা-পদ্ধতি-একক-উত্তর-নয়-কিন্তু-একটি-শক্তিশালী-ডিফল্ট-আছে)
4. [পেশাদার মানচিত্র-নকশা পাইপলাইন](#৪-পেশাদার-মানচিত্র-নকশা-পাইপলাইন)
5. [টাইলসেট, অটোটাইলিং ও মডুলার কিট](#৫-টাইলসেট-অটোটাইলিং-ও-মডুলার-কিট)
6. [ডেটা, লেয়ার ও ইন্টারঅ্যাকশন আর্কিটেকচার](#৬-ডেটা-লেয়ার-ও-ইন্টারঅ্যাকশন-আর্কিটেকচার)
7. [জঁরভেদে ম্যাপ ডিজাইনের সূত্র](#৭-জঁরভেদে-ম্যাপ-ডিজাইনের-সূত্র)
8. [হাতে-বানানো, প্রসিডিউরাল ও হাইব্রিড—তুলনা](#৮-হাতে-বানানো-প্রসিডিউরাল-ও-হাইব্রিডতুলনা)
9. [স্টুডিও-ধাঁচের কেস স্টাডি ও শিক্ষণ](#৯-স্টুডিওধাঁচের-কেস-স্টাডি-ও-শিক্ষণ)
10. [টুল নির্বাচন](#১০-টুল-নির্বাচন)
11. [পারফরম্যান্স, প্রবেশযোগ্যতা ও QA](#১১-পারফরম্যান্স-প্রবেশযোগ্যতা-ও-qa)
12. [আমাদের প্রকল্পের জন্য প্রাথমিক রায়](#১২-আমাদের-প্রকল্পের-জন্য-প্রাথমিক-রায়)
13. [সূত্র ও যাচাইযোগ্য পাঠ](#১৩-সূত্র-ও-যাচাইযোগ্য-পাঠ)

---

## ১. প্রথম সত্য: ম্যাপ আসলে কী

**ম্যাপ/লেভেল** কোনো সুন্দর ব্যাকগ্রাউন্ডের নাম নয়। এটি এমন একটি খেলার স্থান যেখানে খেলোয়াড়ের—

- **কোথায় যেতে পারবে** (collision, wall, water, gate),
- **কী করতে পারবে** (চাষ, কথা, সংগ্রহ, যুদ্ধ, লাফ, বানানো),
- **কেন সেখানে যাবে** (লক্ষ্য, পুরস্কার, রহস্য, শর্টকাট),
- **কী শিখবে** (নতুন নিয়মের নিরাপদ অনুশীলন), এবং
- **কী অনুভব করবে** (দৃশ্য, আলো, শব্দ, গতি, গল্প)

—সব একসাথে নির্ধারণ করে।

একটি কাজের 2D ম্যাপকে পাঁচটি আলাদা কিন্তু সংযুক্ত স্তরে ভাবতে হবে:

```text
১. বিশ্ব-স্তর (Macro)      : অঞ্চল, রাস্তা, প্রবেশদ্বার, অগ্রগতির গ্রাফ
২. খেলার-স্তর (Gameplay) : চলার পথ, বাধা, encounter, resource, puzzle
৩. ডেটা-স্তর (Data)       : spawn, portal, quest trigger, crop soil, tags
৪. দৃশ্য-স্তর (Visual)    : ground, wall, prop, foreground, light, parallax
৫. প্রযুক্তি-স্তর (Tech)  : tilemap, collider, navigation, chunk, save/load
```

> **মূল নীতি:** `দৃশ্যমান টাইল ≠ খেলার সত্য`। ঘাস দেখতে একই হলেও এক ঘাসে ফসল রোপণ করা যাবে, আর অন্যটি শুধু সাজসজ্জা—এই পার্থক্যটি visual layer-এ নয়, gameplay/data layer-এ রাখা নিরাপদ।

আগের গবেষণাগুলোর সঙ্গে সংযোগ:

| আগের গবেষণার সিদ্ধান্ত | ম্যাপ-নকশায় তার প্রয়োগ |
|---|---|
| একই প্যালেট, আলোর দিক ও আউটলাইন | প্রতিটি biome/zone-এও সেই art bible মানতে হবে |
| টাইলসেট + মডুলার সাজসজ্জা সেরা হাইব্রিড | ম্যাপের কাঠামো grid-এ, স্বাতন্ত্র্য props/landmark-এ |
| আগে ছোট vertical slice | পুরো বিশ্ব নয়—একটি ছোট playable area আগে |
| generic engine বনাম genre-specific rules আলাদা | map loader/portal/save রাখুন; farming soil/season/quest rules নতুন করুন |
| data-driven design | crop, spawn, transition, portal, loot ও NPC schedule কোডে hard-code করবেন না |

---

## ২. ম্যাপের ধরন ও কোনটি কখন নেবেন

### ২.১ ক্যামেরা ও জ্যামিতি অনুযায়ী

| ধরন | দেখতে কেমন | ভালো ব্যবহার | প্রধান সতর্কতা |
|---|---|---|---|
| **Side-view / platformer** | পাশ থেকে; উচ্চতা গুরুত্বপূর্ণ | platformer, action, metroidvania | লাফের দূরত্ব, মাথা ঠোকার উচ্চতা, camera reveal মাপতে হবে |
| **Top-down orthogonal** | ওপর থেকে; চার/আট দিকে চলা | farming sim, RPG, survival, town | ঘর/গাছের আড়াল, Y-sort, পথের প্রস্থ পরিকল্পনা করুন |
| **Isometric** | তির্যক 2.5D | tactics, city-builder, ARPG | tile alignment, depth sorting, screen↔grid conversion জটিল |
| **Hex grid** | ষড়ভুজ সেল | turn-based strategy, board tactics | distance, neighbor ও pathfinding আলাদা গণিত চায় |
| **Room graph / screen rooms** | একাধিক সংযুক্ত room | roguelike, dungeon, metroidvania | দরজার অবস্থান ও room-exit সামঞ্জস্য আগে ঠিক করুন |

### ২.২ উৎপাদন-পদ্ধতি অনুযায়ী

| পদ্ধতি | কী | কখন উপযুক্ত | শক্তি | সীমা |
|---|---|---|---|---|
| **সম্পূর্ণ হাতে-বানানো** | প্রতিটি পথ/room মানুষ সাজায় | গল্প, puzzle, tutorial, set-piece | pacing ও আবেগের পূর্ণ নিয়ন্ত্রণ | বেশি কনটেন্ট-খরচ |
| **Tilemap-কেন্দ্রিক** | পুনঃব্যবহারযোগ্য grid tile দিয়ে layout | অধিকাংশ 2D RPG/platformer/sim | দ্রুত বদল, ছোট ফাইল, designer-friendly | একঘেয়ে দেখাতে পারে |
| **Modular kit** | বড় reusable pieces/chunks/props | হাতে-আঁকা, HD, organic environment | tile-এর চেয়ে স্বাভাবিক; দ্রুত সাজানো | kit design-এ শুরুতে বেশি শ্রম |
| **Room-template assembly** | হাতে বানানো room graph অনুযায়ী জোড়া | roguelite, dungeon | random replay + curated rooms | doorway rules কঠোর চাই |
| **পূর্ণ procedural** | algorithm পুরো terrain/layout বানায় | sandbox, survival, endless world | বড়/নতুন বিশ্ব | pacing ও readability কঠিন |
| **Hybrid** | designer rules + template + random detail | বাস্তব জগতের সবচেয়ে কার্যকর পথ | নিয়ন্ত্রণ ও বৈচিত্র্য দুটোই | ভাল tools/data discipline চাই |

---

## ৩. সেরা পদ্ধতি: একক উত্তর নয়, কিন্তু একটি শক্তিশালী ডিফল্ট আছে

### সংক্ষিপ্ত রায়

**নতুন বা ছোট দলের 2D গেমে শক্তিশালী ডিফল্ট হলো:**

> **হাতে পরিকল্পিত world graph → graybox tilemap → reusable tileset/modular kit → object/data layer → হাতে-বসানো landmark ও decoration → বারবার playtest**

এটিই আগের অ্যাসেট গবেষণার “টাইলসেট/মডুলার কাঠামোর উপর হাইব্রিড” সিদ্ধান্তকে ম্যাপের স্তরে প্রয়োগ করে।

### কেন এই পথ বাস্তবসম্মত

1. **Game feel আগে যাচাই করা যায়।** final art ছাড়াই blockout-এ হাঁটা, লাফ, চাষ, combat পরীক্ষা করা যায়।
2. **পরিবর্তনের খরচ কম।** tile repaint করা, room সরানো, portal বদলানো—পূর্ণ আঁকা background নতুন করার চেয়ে সহজ।
3. **একই asset বহুবার কাজ করে।** মাটি, পথ, দেয়াল, বেড়া, গাছের module শত জায়গায় বদলে ব্যবহার হয়।
4. **ডিজাইনার এবং আর্টিস্টের কাজ আলাদা করা যায়।** layout বদলালেও source art নষ্ট হয় না।
5. **প্রযুক্তিগতভাবে নিরাপদ।** collision, navigation, occlusion ও metadata tile/object-এর সঙ্গে রাখা যায়।

### কখন এই ডিফল্ট বদলাবেন

- **Cuphead-ধাঁচের দৃশ্যনির্ভর গেম**: tile কম; hand-painted scene ও bespoke collision বেশি।
- **Roguelite**: macro graph + curated room template + seeded randomization নিন।
- **Terraria-ধাঁচের sandbox**: simulation/world-generation core হবে; editability ও chunk streaming আগে ভাবুন।
- **Tactics/strategy**: movement-cost, cover, height, line-of-sight data visual tile থেকে আলাদা রাখুন।
- **Mobile endless runner**: segment template pool + rules + difficulty curve বেশি কার্যকর।

---

## ৪. পেশাদার মানচিত্র-নকশা পাইপলাইন

বড় স্টুডিওর পার্থক্য “তারা সুন্দর আঁকে” এতে নয়; তারা **অজানা সিদ্ধান্তগুলো সঠিক ক্রমে ছোট করে পরীক্ষা করে**। নিচের pipeline ছোট দলও ব্যবহার করতে পারে।

### ধাপ ০ — Design contract: খেলার প্রতিশ্রুতি লিখুন

এক পাতায় উত্তর দিন:

```text
খেলোয়াড়ের মূল কাজ (verbs): ______________________________
ম্যাপের উদ্দেশ্য: exploration / farming / combat / puzzle / story
ক্যামেরা ও দৃষ্টিভঙ্গি: ___________________________________
খেলোয়াড়ের movement set: হাঁটা, দৌড়, dash, jump, tool...
১টি zone-এ অনুভূতি: _______________________________________
এই zone-এ শেখানো/পরীক্ষা করা নতুন জিনিস: __________________
প্রবেশ শর্ত / বেরোনোর পুরস্কার: ___________________________
```

**কারণ:** খেলোয়াড় যদি লাফাতে না পারে, platformer-এর মতো উঁচু-নিচু দৃশ্য বানিয়ে লাভ নেই। farming sim-এ field→shed→shop-এর দূরত্ব “মিনিট” ও stamina economy বদলে দেয়। আগে verb, পরে geography।

### ধাপ ১ — Movement budget বানান

এটি একটি ছোট পরীক্ষামূলক scene। final art নেই—রঙিন rectangle যথেষ্ট। মাপুন:

- player-এর গতি (tiles/second),
- jump-এর horizontal/vertical দূরত্ব,
- dash distance ও cooldown,
- tool reach,
- NPC collision radius,
- camera-এর visible tile area।

তারপর একটি **metric sheet** লিখুন। উদাহরণ (নিজের গেমে test করে সংখ্যা বসাতে হবে):

```text
সাধারণ হাঁটা: ____ tiles/sec
নিরাপদ jump gap: ____ tiles
সর্বোচ্চ jump gap: ____ tiles
পূর্ণ-স্ক্রিনে দৃশ্যমান: ____ × ____ tiles
বেড়া/দেয়ালের ন্যূনতম gap: ____ tiles
একটি farm plot-এর cell size: ____ × ____ tiles
```

> পেশাদাররা সংখ্যাকে সৃজনশীলতার শত্রু মনে করেন না; এটি designer-এর ভাষা। “কঠিন লাফ” কথার বদলে “সর্বোচ্চ jump-এর ৭৫%” বলা যায়।

### ধাপ ২ — Macro map: অঞ্চল নয়, সংযোগের graph আঁকুন

প্রথমে সুন্দর geography নয়; node ও connection। প্রতিটি node হলো একটি zone/room cluster, প্রতিটি line হলো travel route।

```text
[Farm]──পথ──[Town]──খনির দরজা──[Mine 1]
   │                 │
 নদীর ঘাট          [Forest]
   │                 │
[Beach]────────শর্টকাট────────┘
```

প্রতিটি সংযোগে লিখুন:

- একমুখী না দুইমুখী?
- শুরুতেই খোলা, নাকি ability/item/quest gate?
- কতক্ষণ চলতে হয়?
- খেলোয়াড় ফেরার শর্টকাট পায় কি?
- checkpoint/bed/save কোথায়?
- কী landmark দেখে পথ চিনবে?

একে **critical path** (প্রধান অগ্রগতির পথ), **optional branch** (ঐচ্ছিক আবিষ্কার), এবং **return loop** (আগের জায়গায় নতুন শর্টকাটে ফেরা) দিয়ে চিহ্নিত করুন।

### ধাপ ৩ — Paper map / low-cost layout

graph থেকে প্রতিটি zone-এর ব্লক আকার বানান: কাগজে, Excalidraw-তে, spreadsheet-এ, বা সরাসরি level editor-এ এক রঙে। এই সময়ে প্রশ্ন:

- কোথায় খেলোয়াড় থামবে, কোথায় দ্রুত যাবে?
- কোন মোড়ে নতুন landmark দেখাবে?
- কোন জায়গায় নিরাপদ বিশ্রাম, কোন জায়গায় চাপ?
- exit দেখতে পাওয়া যাবে, না খুঁজে পেতে হবে?
- একই ধরনের ৩০ সেকেন্ডের বেশি হাঁটা হচ্ছে কি?

### ধাপ ৪ — Graybox / blockout: কেবল gameplay-এর জন্য তৈরি করুন

Graybox মানে কুৎসিত প্রথম সংস্করণ নয়—এটি **সঠিক প্রথম সংস্করণ**।

- solid floor/wall: একটি রঙ
- hazard: একটি রঙ
- interactable: অন্য রঙ
- portal/spawn/checkpoint: label বা icon
- art, particle, foliage: আপাতত বাদ

**প্রথম সম্পূর্ণ পরীক্ষা:** player spawn থেকে লক্ষ্য পর্যন্ত যেতে পারে? soft-lock হয়? camera গুরুত্বপূর্ণ জায়গা ঢাকে? কোনও jump/bottleneck unfair? farming tile-এ tool ঠিক প্রভাব ফেলছে?

### ধাপ ৫ — Whitebox: নিয়ম ও ডেটা সম্পূর্ণ করুন

Art-এর আগে gameplay truth সম্পূর্ণ করুন:

- collider ও one-way platform,
- nav/pathfinding data,
- interactable/harvestable/farmable tags,
- spawn volumes ও respawn,
- portal target + entrance direction,
- trigger volume ও quest condition,
- sound region/light region,
- minimap discovery mask।

### ধাপ ৬ — Art pass: macro থেকে micro

সঠিক ক্রম:

```text
base terrain → silhouette/wall → primary path → landmark →
large prop → medium prop → small decoration → lighting/VFX → polish
```

আগে সব ছোট ফুল আঁকলে পরে পথ সরালে সব কাজ নষ্ট। আগে player-এর পথ ও reading hierarchy ঠিক করুন।

### ধাপ ৭ — Playtest → observation → change log

খেলোয়াড়কে বলে দেবেন না কোথায় যেতে হবে। শুধু দেখুন:

- সে কোথায় থামে/ফিরে আসে,
- ভুল রাস্তা নেয় কি,
- camera বা foreground তাকে ঢাকে কি,
- কোন object interaction বোঝে না,
- travel সময় বিরক্তিকর কি না,
- difficulty spike কোথায়।

প্রতিটি সমস্যা লিখুন: `সমস্যা → প্রমাণ → সম্ভাব্য কারণ → পরিবর্তন → retest ফল`। মতামত (“ভালো লাগেনি”) নয়, আচরণ (“৩ জনের ২ জন gate-এর পাশ দিয়ে চলে গেছে”) সিদ্ধান্তের ভিত্তি।

### ধাপ ৮ — Content lock ও production

যখন navigation/interaction মজবুত, তখন final props, parallax, audio, VFX, lore decoration যোগ করুন। আর্ট সুন্দর হলেও playtest বন্ধ হবে না।

---

## ৫. টাইলসেট, অটোটাইলিং ও মডুলার কিট

### ৫.১ Tile size কীভাবে ঠিক করবেন

Tile size হলো পৃথিবীর মৌলিক মাপ। একবার project শুরু হলে খুব কারণ ছাড়া বদলাবেন না। সিদ্ধান্তের ভিত্তি:

| প্রশ্ন | প্রভাব |
|---|---|
| character কত pixel উঁচু? | দরজা, গাছ, ঘর ও prop-এর scale |
| camera-এ কতটা পৃথিবী দেখা চাই? | tile size ও zoom |
| pixel art নাকি HD? | nearest filtering বনাম texture density |
| চারদিকে চলা নাকি platformer? | collision/ground shape |
| target mobile/web? | texture memory ও readability |

**Pixel-art শুরুর বাস্তব নিয়ম:** 16×16 বা 32×32 logical tile, integer scaling, nearest/point filter। তবে 16×16 বাধ্যতামূলক নয়; consistency বাধ্যতামূলক।

### ৫.২ একটি production-ready tileset-এ কী থাকে

```text
Terrain:
  - fill / center
  - edge / corner / inner-corner
  - transition (grass↔dirt, dirt↔water)
  - slope / one-way / cliff (প্রয়োজন হলে)
Variation:
  - ৩–৫টি subtle alternate fill
  - decal: crack, pebble, flower, grass tuft
Animation:
  - water/lava/torch frames (যেখানে দরকার)
Metadata:
  - collision shape
  - navigation / movement cost
  - occlusion / light-block
  - gameplay class: soil, water, wall, hazard...
```

আগের asset guide-এর নিয়ম এখানেও অপরিবর্তিত: **tile-এর middle আগে, edge পরে; 3×3 এবং লম্বা strip test করুন; repeated pattern ভাঙতে variation যোগ করুন।**

### ৫.৩ অটোটাইলিং কী, কী নয়

Autotiling হলো প্রতিবেশী cell দেখে ঠিক edge/corner sprite বসানোর নিয়ম। এতে designer মাটি বা দেয়াল আঁকেন; টুল ঠিক variant বেছে দেয়।

- **Godot Terrains:** terrain peering bits দিয়ে পাশ/কোণ মিলিয়ে tile বসায়।
- **Unity Rule Tile:** 3×3 neighbor rule থেকে sprite, collider, random বা animation output নির্ধারণ করা যায়।
- **Tiled Wang sets / automapping:** terrain transition ও pattern-based automation করা যায়।
- **LDtk Auto-layers:** IntGrid data থেকে rule-ভিত্তিক visual tile আঁকা যায়।

**সতর্কতা:** autotile শুধুই speed tool। কোনও অনুপস্থিত corner, overhang বা বিশেষ hero-shot-এ manual override-এর রাস্তা রাখতে হবে।

### ৫.৪ Tile layer ও object layer আলাদা রাখুন

| Tile layer-এ রাখুন | Object/entity layer-এ রাখুন |
|---|---|
| পুনরাবৃত্ত মাটি, দেয়াল, রাস্তা | NPC, chest, door, portal, enemy spawn |
| স্থির collision terrain | movable crate, breakable rock, crop instance |
| small repeated decoration | বড় গাছ, bridge, sign, house, unique prop |
| base visual fill | quest trigger, camera zone, sound zone |

এতে বড় গাছের pivot/Y-sort বা door-এর state tile sheet-এর মধ্যে আটকে যায় না।

### ৫.৫ Modular kit-এর সূত্র

Tile-এর বাইরে যেসব জিনিস—ঘর, বড় root, cliff face, fence, bridge—module বানান। একটি kit-এ সাধারণত:

```text
start / middle / end
straight / inside corner / outside corner
small / medium / large silhouette
mirrorable variation
clean + damaged + decorated version
```

সর্বদা grid-এ বাঁধা থাকা বাধ্যতামূলক নয়; কিন্তু snap point, pivot, scale, shadow convention লিখিত রাখুন।

---

## ৬. ডেটা, লেয়ার ও ইন্টারঅ্যাকশন আর্কিটেকচার

### ৬.১ সুপারিশকৃত layer stack

Top-down farming/RPG-এর একটি পরিষ্কার উদাহরণ:

```text
07_ForegroundCanopy       সামনে পাতা/ছাদ; transparency or hide rule
06_AbovePlayerProps       lamp top, roof edge, upper detail
05_Entities               player, NPC, animals, enemies, doors
04_Interactables          crop, chest, resource node, bridge state
03_CollisionAndNav        invisible: blocked, one-way, nav, movement cost
02_Decoration             grass tuft, pebble, shadow, decal
01_TerrainVisual          ground, road, water, cliff, walls
00_Background             sky, far parallax, void
Meta_Triggers             portal, camera, audio, quest, spawn
```

Platformer-এ এটি বদলাবে: Background → Back decoration → Collision terrain → Actor → Front decoration → Foreground mask → Trigger/entity data।

### ৬.২ Map contract / schema

Map file-এ নামহীন coordinate ছড়িয়ে রাখবেন না। একটি map-এর metadata/contract থাকুক:

```yaml
id: farm_start
version: 1
kind: overworld
biome: temperate_farm
tile_size: 16
music: calm_morning
entry_points:
  - id: from_town
    position: [42, 8]
    facing: south
exits:
  - target_map: town_square
    target_entry: from_farm
    area: [40, 0, 5, 1]
spawn_groups: [morning_birds, forage_spring]
flags_required: []
flags_set_on_first_enter: [visited_farm]
```

Format YAML/JSON/TMX/LDtk যাই হোক, ভাবনাটি একই: **map data-কে project-এর public interface ভাবুন**।

### ৬.৩ Naming discipline

```text
maps/overworld/farm_start.tmx
maps/overworld/town_square.tmx
tilesets/temperate_terrain.tsx
prefabs/props/bridge_wood_small.tscn
prefabs/entities/portal.tscn
source/map_docs/farm_start_map-spec.md
```

নাম থেকে location ও role বোঝা উচিত। `final_map_NEW_2.tmx` চলবে না।

### ৬.৪ Save/load-এর জন্য কী সেভ হবে

Static art/terrain সাধারণত map file থেকেই আসবে; সেভে কেবল পরিবর্তিত state রাখুন:

- ভাঙা পাথর / খোলা chest,
- রোপিত crop: crop ID, growth stage, watered state,
- কাটা গাছ/সংগ্রহ করা forage,
- door/gate state,
- quest trigger fired কি না,
- player position/map/entry direction,
- procedural map হলে seed + diff।

এটি আগের MMORPG conversion guide-এর “database save রেখে farm-tile state যোগ করুন” সিদ্ধান্তের সরাসরি প্রয়োগ।

---

## ৭. জঁরভেদে ম্যাপ ডিজাইনের সূত্র

### ৭.১ Top-down farming simulation / life RPG

**লক্ষ্য:** সুবিধা, দৈনন্দিন রুটিন, পরিচিতি এবং ধীরে ধীরে খোলা আবিষ্কার।

- farm, house, storage, water, shop—এই দৈনন্দিন loop-কে খুব দূরে রাখবেন না।
- জমি readable grid-এ; decoration যেন plantable cell বোঝায় বাধা না দেয়।
- প্রতিটি zone-এর landmark: mill, giant tree, mine entrance, shore, clock tower।
- NPC-এর path/collision/interaction spot আগে test করুন।
- season হলে palette variant + forage/spawn + crop compatibility data-driven রাখুন।
- ছোট shortcut খুলে দেওয়া player-এর সময়কে পুরস্কৃত করে।

### ৭.২ Platformer

**লক্ষ্য:** movement mastery, rhythm, surprise, clear landing target।

- safe space-এ নতুন mechanic শেখান → চাপ ছাড়া পুনরাবৃত্তি → combination → পরীক্ষা/পরিণতি।
- landing surface স্পষ্ট; lethal pit-এর সামনে silhouette ও contrast ব্যবহার করুন।
- camera jump-এর destination hide করছে কি না test করুন।
- respawn/checkpoint কঠিনতার সঙ্গে মাপুন।
- decoration hitbox-এর সঙ্গে conflict করছে কি না দেখুন।

### ৭.৩ Metroidvania

**লক্ষ্য:** interconnected discovery, স্মরণীয় place, পরে নতুন ক্ষমতায় ফিরে আসা।

- world graph আগে; rooms পরে।
- gate-এর পেছনের reward সম্পর্কে hint দিন, কিন্তু এখনই পৌঁছাতে দেবেন না।
- loop/shortcut দিয়ে ফিরে আসা দ্রুত করুন।
- প্রতি biome-এ আলাদা silhouette, color, sound ও landmark দিন।
- map screen নিজেই UX: unexplored boundary, room shape, door status, current objective।

### ৭.৪ Roguelite / dungeon crawler

**লক্ষ্য:** প্রতি run-এ নতুন composition, কিন্তু ন্যায্য progression।

- আগে macro graph: start → choice → elite/shop → boss।
- তারপর door-compatible room template choose করুন।
- room tags রাখুন: combat_small, combat_elite, reward, shop, transition, boss।
- generator-এর পরে reachability/path validation বাধ্যতামূলক।
- randomness aesthetics-এ নয়, অর্থবহ choice-এ ব্যবহার করুন।

### ৭.৫ Tactics / turn-based strategy

প্রতি cell-এর visual sprite-এর বাইরেও লাগতে পারে:

```text
walk_cost, blocked, cover, height, climbable,
line_of_sight_block, deployable, hazard, objective_zone
```

এগুলো art sheet-এর নাম দেখে অনুমান করা যাবে না; map data-তে explicit হওয়া চাই।

---

## ৮. হাতে-বানানো, প্রসিডিউরাল ও হাইব্রিড—তুলনা

| মানদণ্ড | হাতে-বানানো | সম্পূর্ণ procedural | Hybrid |
|---|---:|---:|---:|
| গল্পের pacing | সর্বোচ্চ | কম/অনিশ্চিত | উচ্চ |
| replayability | কম–মাঝারি | সর্বোচ্চ | উচ্চ |
| শুরু করা | সহজ | কঠিন | মাঝারি |
| bug/soft-lock ঝুঁকি | কম | বেশি | মাঝারি |
| art consistency | উচ্চ | rules-এর উপর | উচ্চ |
| designer control | সর্বোচ্চ | সীমিত | উচ্চ |
| ছোট দলের জন্য | ভালো | algorithm দক্ষতা চাই | **সাধারণত সেরা** |

### Procedural generation ব্যবহার করলে ন্যূনতম নিরাপত্তা

```text
seed তৈরি
  → macro graph/rooms choose
  → entrances/exits connect
  → traversable path আছে কি পরীক্ষা
  → objective, key, lock-এর dependency পরীক্ষা
  → player spawn ও boss/exit reachable কি পরীক্ষা
  → collision/nav rebuild
  → content placement (distance/biome/tag rules)
  → deterministic test seed suite
```

**ভুল পদ্ধতি:** আগে random সুন্দর cave বানিয়ে পরে ভাবা player বেরোতে পারবে কি না।

**ভালো পদ্ধতি:** goal/critical path/exit আগে constrain করুন, তারপর detail random করুন। Curated room template + graph assembly এই জন্য জনপ্রিয়।

---

## ৯. স্টুডিও-ধাঁচের কেস স্টাডি ও শিক্ষণ

### Team Cherry — *Hollow Knight*: বিশ্ব-গ্রাফ, blockout, discovery

প্রকাশিত সাক্ষাৎকারে Team Cherry বলেছেন, শুরুতে তারা চারটি area এবং মাঝখানে Crossroads ধরে পরিকল্পনা করেছিলেন; প্রথম দিকের world black-block mode-এ tile করে চলেও দেখা যেত। পরে critical path-কে কম কড়া করে exploration বাড়ানো হয়।

**শিক্ষা:**
- final art-এর আগে playable world layout পরীক্ষা করা যায় এবং করা উচিত।
- “বড় interconnected world” মানে সব পথ একসঙ্গে খোলা নয়; discovery ও return shortcut পরিকল্পিত।
- map-এর ভৌগোলিক সততা (room position ও connection) খেলোয়াড়ের বিশ্বাস তৈরি করে।

### Motion Twin / *Dead Cells*: curated chunk + generation rules

*Dead Cells*-ধাঁচের roguelite pipeline-এর বহুল ব্যবহৃত ধারণা: designer বানানো room/template ও level graph থেকে generator stage তৈরি করে। অর্থাৎ procedural মানে শিল্পীহীন random নয়—মানুষের তৈরি খণ্ডকে নিয়মমতো সাজানো।

**শিক্ষা:**
- room tag, entrance/exit, difficulty, reward ও biome metadata না থাকলে good generation সম্ভব নয়।
- replayability-এর জন্য “পুরো level নতুন” দরকার নেই; meaningful recombination যথেষ্ট।

### Maddy Makes Games / *Celeste*: room-কেন্দ্রিক হাতে-বানানো challenge

*Celeste* ও *TowerFall*-এর নির্মাতাদের Ogmo Editor 2D level authoring-এর সঙ্গে সম্পর্কিত। গেমটি ছোট room-এ movement mechanic শেখানো, variation, combination ও mastery-র গতি দেখায়।

**শিক্ষা:**
- একটি room-এর একটি স্পষ্ট idea থাকলে playtest করা সহজ।
- কঠিনতা বাড়ানোর আগে “শেখানো” room দরকার।
- level editor-এর দ্রুত iteration ক্ষমতা সরাসরি level quality বাড়ায়।

### সাধারণ পেশাদার pattern

বড় স্টুডিও হোক বা দক্ষ indie দল—সবাই সাধারণত এইগুলো করে:

1. **Graybox আগে, final art পরে।**
2. **Reusable kit ও prefab/template।**
3. **একটি source of truth:** tileset metadata, entity template, shared style guide।
4. **Data-driven placement:** spawn/portal/quest/loot map data-তে।
5. **Version control ও review।** map change-ও code change-এর মতো reviewযোগ্য।
6. **Playtest-ভিত্তিক iteration।** designer-এর ধারণা নয়, player behavior সিদ্ধান্ত চালায়।
7. **Automated validation।** broken portal, overlap, unreachable goal, invalid tile ID ধরার tool।

> স্টুডিওর “গোপন অস্ত্র” proprietary editor নয়; দ্রুত বদলানো যায় এমন **অভিন্ন pipeline**। ছোট দল Tiled/LDtk/Godot দিয়েও একই নীতি পেতে পারে।

---

## ১০. টুল নির্বাচন

### ১০.১ Tool decision table

| পরিস্থিতি | উপযুক্ত টুল | কারণ |
|---|---|---|
| Godot-কেন্দ্রিক ছোট 2D game | **Godot TileMapLayer + external TileSet** | engine-native, collision/nav/terrain সরাসরি, দ্রুত prototype |
| Engine-agnostic বা custom/MMORPG codebase | **Tiled** | TMX/JSON, object layer, custom properties, infinite map, বহু engine integration |
| Data-heavy level, auto-layer, entity schema | **LDtk** | IntGrid, entities, field, auto-layer rules, world layout |
| Celeste-ধাঁচের simple room editor | Ogmo Editor | ছোট, room/entity workflow; ecosystem সীমিত |
| Unity project | Unity Tilemap + Rule Tile/Custom Brushes | native workflow ও collider integration |
| Designer-built procedural rooms | Tiled/LDtk + own validator/generator | source map data + template metadata আলাদা রাখা সহজ |

### ১০.২ Tiled কখন সেরা

Tiled নিন যদি:

- বর্তমান game codebase Godot/Unity নয় বা নিশ্চিত নয়,
- map data আলাদা file হিসেবে version control করতে চান,
- object layer-এ portal/spawn/trigger রাখতে চান,
- একই map format থেকে একাধিক tool/use case চালাতে চান,
- infinite map/chunk ব্যবহার হতে পারে।

Tiled-এর TMX format tile layer, object layer, image layer, custom property, templates এবং infinite-map chunk সমর্থন করে।

### ১০.৩ LDtk কখন সেরা

LDtk নিন যদি designer চান visual tile-এর পাশাপাশি **IntGrid gameplay data**, entity field এবং auto-layer rule। একটি invisible `Collision/Soil/Water` IntGrid থেকে আলাদা visual layer auto-generate করা যায়।

### ১০.৪ Godot 4.x note

নতুন Godot project-এ পুরনো multi-layer `TileMap` ধারণার বদলে **এক layer প্রতি `TileMapLayer`** ব্যবহার করা আধুনিক পথ। Shared TileSet external resource হিসেবে save করলে বহু map-এ একই rules/collision পুনঃব্যবহার করা যায়।

---

## ১১. পারফরম্যান্স, প্রবেশযোগ্যতা ও QA

### ১১.১ পারফরম্যান্স checklist

- [ ] একই tileset/atlas পুনঃব্যবহার; অপ্রয়োজনীয় বহু texture কমান।
- [ ] static terrain tilemap-এ; dynamic object entity/prefab-এ।
- [ ] অদৃশ্য দূরের zone load/activate না রাখুন; chunk/scene streaming বিবেচনা করুন।
- [ ] প্রতি decorative tile-এ আলাদা collider দেবেন না; physics shape/composite/optimized collider ব্যবহার করুন।
- [ ] animated tile কম এবং উদ্দেশ্যমূলক রাখুন।
- [ ] overdraw: full-screen transparent foreground ও বহু parallax layer profile করুন।
- [ ] map বদলালে পুরনো texture/entity reference মুক্ত হচ্ছে কি না পরীক্ষা করুন।

### ১১.২ Accessibility ও readability

- পথ, hazard, interactable কেবল রঙে বোঝাবেন না—shape, outline, animation, sound cue দিন।
- player sprite foreground/particle-এর আড়ালে যাচ্ছে কি না পরীক্ষা করুন।
- colorblind-safe contrast ও high-contrast mode বিবেচনা করুন।
- text/sign player-এর কাছে readable scale-এ রাখুন।
- camera shake, flashing, dense particles option দিয়ে কমানো যায় কি না দেখুন।
- objective জানা না থাকলেও “কোথায় যাওয়া যায়” visual language-এ বোঝা উচিত।

### ১১.৩ Map QA test cases

```text
[ ] প্রতিটি entry point থেকে player solid ground-এ spawn করে
[ ] প্রতিটি portal-এর target map ও target entry আছে
[ ] destination blocked/void নয়
[ ] সব critical objective reachable
[ ] key পাওয়ার আগে lock bypass করা যায় না (যদি ইচ্ছাকৃত না হয়)
[ ] player কোনো collision-এর ভিতরে আটকে যায় না
[ ] camera boundary-তে black/void/secret leak হয় না
[ ] NPC path ও interaction point valid
[ ] save→load-এর পর পরিবর্তিত crop/chest/door state ঠিক থাকে
[ ] minimap/world map coordinate সঠিক
[ ] low-spec target-এ frame time পরীক্ষা করা হয়েছে
```

---

## ১২. আমাদের প্রকল্পের জন্য প্রাথমিক রায়

আগের ফাইলগুলোর সিদ্ধান্ত মিলিয়ে—বিশেষত MMORPG codebase থেকে farming-sim RPG বানানোর সম্ভাব্য দিক ধরে—**প্রথম playable map-এর জন্য নিচের পথই সবচেয়ে নিরাপদ:**

```text
Perspective      : top-down orthogonal
World structure  : হাতে পরিকল্পিত ছোট connected zones
Authoring        : Tiled বা LDtk (codebase/engine-agnostic) অথবা Godot native TileMapLayer
Visual structure : shared tileset + modular props + unique landmarks
Gameplay data    : আলাদা collision / soil / water / object / trigger layers
Progression      : Farm → Town edge → ছোট Forest/Mine entrance
Scope            : ১টি ছোট map, ১টি portal, ১টি NPC, ১টি shop/goal,
                   ৩টি crop এবং save/load—তারপর বিস্তার
```

### কেন পুরো বড় world দিয়ে শুরু নয়

আগের conversion guide-এর সেরা নীতি: **১০×১০ জমি + ৩টি ফসল + ১ দিনের পূর্ণ চক্র**। ম্যাপেও একই: একটি ছোট world slice-এ হাঁটা, tool use, soil state, crop placement, NPC, portal, save, reload—সব সত্যি কাজ করলে তবেই নতুন zone বানাব।

### এখনই যে সিদ্ধান্তগুলো ফ্রিজ করা দরকার নেই

- final biome count,
- পুরো world map-এর আকার,
- final art style-এর সকল detail,
- online multiplayer থাকবে কি না,
- procedural mine হবে কি না।

### কিন্তু যে সিদ্ধান্তগুলো শুরুতেই লিখে রাখা দরকার

1. camera perspective,
2. logical tile size,
3. map data format,
4. layer naming convention,
5. collision/interaction-এর source of truth,
6. map ID ও portal contract,
7. save state-এর প্রাথমিক schema।

---

## ১৩. সূত্র ও যাচাইযোগ্য পাঠ

### Official / primary documentation

1. **Godot — Using TileSets:** TileMapLayer, atlas, collision/navigation/occlusion, terrain connection।  
   https://docs.godotengine.org/en/stable/tutorials/2d/using_tilesets.html
2. **Godot — Using TileMaps:** external shared TileSet, pattern, multi-layer workflow, terrain paint modes।  
   https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html
3. **Godot — TileMapLayer API:** নতুন node model; `set_cells_terrain_connect` ও tile API।  
   https://docs.godotengine.org/en/stable/classes/class_tilemaplayer.html
4. **Unity — Rule Tile:** 3×3 neighbor rules, rotation/mirror, collider/output।  
   https://docs.unity3d.com/Packages/com.unity.2d.tilemap.extras@6.0/manual/RuleTile.html
5. **Tiled — TMX map format:** tile/object/image layers, custom property, Wang set, infinite chunks।  
   https://doc.mapeditor.org/en/stable/reference/tmx-map-format/
6. **LDtk — Auto layers:** IntGrid থেকে rule-driven visual tile generation।  
   https://ldtk.io/docs/general/auto-layers/

### প্রকাশিত কেস/বিশ্লেষণ

7. **PC Gamer — Team Cherry interview: Hollow Knight map design:** blockout, area structure, discovery।  
   https://www.pcgamer.com/how-to-design-a-great-metroidvania-map/
8. **Game Developer — Hollow Knight map discussion:** exploration ও world-first thinking।  
   https://www.gamedeveloper.com/design/how-the-i-hollow-knight-i-devs-mapped-out-their-metroidvania-
9. **Ogmo / Celeste context:** level editor ecosystem ও room-authoring history।  
   https://ogmo-editor-3.github.io/  
   (প্রজেক্টে ব্যবহারের আগে বর্তমান integration যাচাই করবেন।)

### এই workspace-এর পূর্ববর্তী ভিত্তি

- `uploads/2d-game-art-complete-easy-guide.md`
- `uploads/2d-game-asset-creation-research.md`
- `uploads/2d-game-character-creation-research.md`
- `uploads/2d-game-character-animation-research.md`
- `uploads/mmorpg-to-other-genre-game-conversion-research.md`

---

## শেষ কথা

> **ভালো map হলো খেলোয়াড়ের সিদ্ধান্তের মেশিন।** Tile সুন্দর হওয়া জরুরি, কিন্তু তার চেয়েও জরুরি—খেলোয়াড় কোথায় যাবে, কেন যাবে, কী বুঝবে, কোথায় অবাক হবে, এবং ভুল করলে কীভাবে আবার চেষ্টা করতে পারবে।
>
> তাই আমাদের ক্রম হবে: **verb → graph → graybox → playtest → data/collision → art → polish**। উল্টো ক্রমে গেলে সুন্দর অথচ বিরক্তিকর world তৈরি হয়; এই ক্রমে গেলে ছোট হলেও সত্যিকারের গেম তৈরি হয়।
