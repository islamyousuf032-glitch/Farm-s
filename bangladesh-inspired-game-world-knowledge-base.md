# বাংলাদেশ-অনুপ্রাণিত ফার্মিং/লাইফ-সিম: প্রকল্প জ্ঞানভিত্তি

> **এটি আমাদের কাজের বর্তমান source of truth।** Stardew Valley সম্পর্কিত দুইটি নথি, আগের 2D game research, এবং নতুন বাংলাদেশ–গাজীপুর গবেষণা মিলিয়ে এই সিদ্ধান্তগুলো দাঁড়িয়েছে। Map ও asset কাজ শুরু হলে নতুন সিদ্ধান্ত তারিখসহ এখানে যোগ হবে।
>
> **সর্বশেষ আপডেট:** ১০ অক্টোবর ২০২৬

---

## ১. গেমের পরিচয়

```text
Genre         : বাংলাদেশ-অনুপ্রাণিত 2D farming + life simulation + light exploration RPG
View          : top-down orthogonal pixel-art (প্রাথমিক প্রস্তাব)
Inspiration   : Stardew Valley-এর connected-location, daily-loop ও optimization principles
Identity      : Gazipur/Madhupur Sal-forest, red chala, wet baid, pond/khal/ghat, six Bengali seasons
World         : কাল্পনিক; বাস্তব বাংলাদেশের সরাসরি map বা কারও বাড়ি/গ্রামের অনুলিপি নয়
Core promise  : ছোট দৈনন্দিন পছন্দ, জীবন্ত গ্রাম, ঋতুর দৃশ্যমান প্রভাব, দেশজ প্রকৃতি
```

---

## ২. পড়া ও অন্তর্ভুক্ত নথি

| নথি | প্রকল্পে নেওয়া প্রধান শিক্ষা |
|---|---|
| `uploads/stardew-valley-research-bn.md` | ছোট connected map; প্রতিটি area-এর একটি কাজ; daily/long-term loop; farm→village→forest/mine/water structure; NPC routine; scope control |
| `uploads/stardew-rendering-optimization-report-bn.md` | crop real-time নয়, new-day batch update; all-location data update but visible-location render; camera culling; sparse data; atlas; Y-sort; season texture/state; performance-first design |
| `research/2d-game-map-creation-research.md` | verb→world graph→graybox→data/collision→art→playtest pipeline |
| `research/2d-map-production-playbook.md` | map layer contract, portal/entry IDs, validators, vertical slice, QA |
| `research/bangladesh-geography-for-game-world-research.md` | Delta/terrace geography; Gazipur’s chala–baid–sal forest–ghat map language |
| `research/bangladesh-native-flora-and-fruit-trees-research.md` | native বনাম endemic বনাম exotic; Gazipur-native flora register; introduced species exclusion |
| `research/bangladesh-seasons-and-gazipur-ecology-research.md` | six cultural seasons + three climate regimes; season-aware maps, trees, water and routines |
| আগের character/animation/asset/MMORPG research files | art pipeline, hybrid tile/modular method, source-code licensing, data-driven farming systems |

---

## ৩. Stardew থেকে আমরা যা নেব, যা নেব না

### নেব

```text
- ঘুম/দিন বদলকে simulation tick ও save point করা
- ফসলের state ছোট data হিসেবে রাখা; প্রতি frame simulation নয়
- world-কে ছোট purpose-driven location-এ ভাগ করা
- বর্তমান map/camera-র দৃশ্যমান জিনিস render করা
- NPC schedule, season, weather দিয়ে জায়গাকে জীবন্ত করা
- travel time-কে gameplay cost ধরা
- বড় feature-এর আগে ১টি মজার সম্পূর্ণ দিনের loop বানানো
```

### নেব না

```text
- Pelican Town-এর layout, নাম, চরিত্র বা গল্প কপি নয়
- চার season/28-day calendar হুবহু নয়
- আমেরিকান গ্রাম, mine, beach, bus-stop aesthetic নয়
- Stardew-এর code, art, data বা dialogue নয়
```

### আমাদের রূপান্তর

```text
Stardew's farm → আমাদের লালমাটি চালার farm
Town → চালাবন গ্রাম ও হাট-উঠান
Forest → ভাওয়াল-অনুপ্রাণিত শালবন
Waterfront → পুকুর, খাল, নদীঘাট
Season → গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত, বসন্ত
Travel → হাঁটা, আল, বাঁশের সাঁকো, ঘাট ও ছোট নৌকা
```

---

## ৪. World canon: geography

### Primary terrain equation

```text
উঁচু চালা (লাল মাটি, farm/ঘর/শাল) 
      ↓
নিচু বাইদ (ধান, বর্ষার জল, মাছ)
      ↓
খাল/পুকুর/নদীঘাট (যোগাযোগ, মাছ, বাজার)
      ↔
বন-edge (forage, wildlife, restoration, mystery)
```

### প্রথম six-location world graph

```text
                    [শালচূড়া বন]
                         │
[বাইদের ধানক্ষেত] ─ [চালাবন গ্রাম] ─ [নদীঘাট বাজার]
       │                   │                    │
 [লালমাটি ফার্ম]      [কমিউনিটি উঠান]       [নৌকা/দূরের বিল]
       │
 [বাঁশঝাড় পুকুরপাড়]
```

### Location purpose

| Location | Main purpose | Bangladesh identity |
|---|---|---|
| লালমাটি ফার্ম | grow, store, rest, home | উঁচু চালা, red soil, pond edge |
| চালাবন গ্রাম | shop, NPC, social hub | compact bazaar/uthan, not foreign town square |
| বাইদের ধানক্ষেত | rice/water/fish season system | seasonal lowland and embankments |
| শালচূড়া বন | forage, wood, nature quest | Sal coppice, leaf litter, native associate trees |
| বাঁশঝাড় পুকুরপাড় | fishing, water, calm social scene | bamboo, earthen ghat, pond ecology |
| নদীঘাট বাজার | trading, boat, future world travel | ghat, river craft, seasonal water level |

---

## ৫. Flora canon: কঠোর নিয়ম

### Definition rule

```text
Allowed by default: species native to Bangladesh and appropriate to the map habitat.
Not enough: simply common in Bangladesh.
Not required: species must occur only in Bangladesh.
Excluded from natural zones: foreign/exotic plantation and ornamental species.
```

### Gazipur Sal forest core assets

```text
Primary canopy      : শাল — Shorea robusta
Associate trees     : বনচালতা — Dillenia pentagyna
                      চালতা — Dillenia indica (moister edge)
                      কুম্ভী — Careya arborea
                      শিধা — Lagerstroemia parviflora
                      কুসুম — Schleichera oleosa
Fruit/forest trees  : জাম, আমলকী, বহেড়া, হরীতকী, করমচা, বাইচি
Season landmarks    : পলাশ, শিমুল, সোনালু (rare, not everywhere)
Ground structure    : sal leaf litter, local grass/shrub, bamboo clump, wet-edge reeds
```

### Explicitly excluded from natural Gazipur zone

```text
Eucalyptus • Akashmoni (Acacia auriculiformis) • Acacia mangium •
Mahogany • Rain tree (Samanea saman) • Rubber • Ipil-ipil •
Papaya • Guava • Pineapple • Litchi
```

### Habitat rule

- সুন্দরী/গেওয়া/গোলপাতা = সুন্দরবন/লোনা ম্যানগ্রোভ pack, গাজীপুরে নয়।
- হিজল/কাশ/শাপলা = bil/river/wetland pack, high chala forest-এ নয়।
- পাহাড়ি evergreen tree = future hill map, sal forest-এ নয়।
- cultural homestead tree-এর origin unclear হলে strict native forest pack-এ নয়; আলাদা verified orchard pack-এ পরে।

---

## ৬. Season canon

| Season | Map emotion | Main physical change | Key Gazipur cue |
|---|---|---|---|
| গ্রীষ্ম | heat, waiting, storm | dry red soil, pre-monsoon thunder | sal leaf exchange, dust/wind |
| বর্ষা | abundance, water, route change | wet ground, baid water, paddy | dark-green sal, khals/ponds full |
| শরৎ | relief, openness | rain recedes, clear sky | kash on water edge, still-green field |
| হেমন্ত | harvest, warmth | golden paddy, dew, dry paths | baid harvest, red soil returns |
| শীত | quiet, intimacy | fog, dry leaf, cool morning | thin sal canopy, muted green, no snow |
| বসন্ত | renewal, anticipation | new leaves, flowers, warm wind | copper sal leaves, palash/shimul accent |

### Prototype calendar proposal

```text
1 season = 12 game days
1 year    = 72 game days
Reason    = 6 seasons দৃশ্যমান হবে, কিন্তু first-game content scope নিয়ন্ত্রণে থাকবে
```

এটি playtest-এর পরে বদলানো যাবে।

---

## ৭. প্রযুক্তিগত সিদ্ধান্ত

### World / map

```text
Map model            : separate connected locations, not one giant open world
Map data             : map ID + named entry/portal + layers + entities + trigger data
Transition           : target_map_id + target_entry_id, never fragile hard-coded coordinate
Static visual        : tilemap/atlas/modular props
Dynamic content      : NPC, crop, doors, boats, interactive objects as entities/state data
Render ordering      : ground → buildings/props → Y-sorted player/NPC/crops → foreground → VFX/UI
```

### Simulation

```text
New day:
  update all locations' crop/soil/forage/tree/NPC seasonal state in controlled batch
During day:
  update only needed active systems; no all-world scan every frame
Rendering:
  current location + camera-visible tile/object only
Save:
  at sleep/new-day; map changes stored as diff/state, not duplicate static map
```

### Layer minimum

```text
terrain_visual
collision
soil_data
objects_static
interactables
entities
triggers
foreground
notes_dev (never ships)
```

---

## ৮. প্রথম playable vertical slice

```text
1. লালমাটি ফার্মে spawn
2. চাষযোগ্য soil শনাক্ত
3. till → seed → water
4. দিন শেষ/ঘুম → all-map update + save
5. চালাবন গ্রামে gate/portal দিয়ে যাওয়া
6. ১ NPC/দোকানের সঙ্গে interaction
7. farm-এ ফেরা
8. save/load-এর পরে crop ও map state থাকা
9. একই map বর্ষা/শীতের placeholder palette-এ দেখে test
```

এই slice শেষ না হওয়া পর্যন্ত বড় mine, marriage, ২০ NPC, multiplayer বা distant coast map নয়।

---

## ৯. পরবর্তী বাস্তব কাজের ক্রম

1. source code/engine/license audit
2. map tool ও data format confirm
3. player movement + camera metric test
4. six-season calendar skeleton + `OnNewDay()` interface
5. empty `ow_farm_chala` graybox
6. `ow_gram_uthan` graybox + portal round trip
7. soil/crop/save vertical slice
8. Gazipur starter tile kit: red soil, baid, pond edge, sal, bamboo
9. one-player playtest
10. তারপর প্রথম real map art design

---

## ১০. সিদ্ধান্ত log rule

নতুন সিদ্ধান্ত হলে এই format ব্যবহার হবে:

```markdown
### YYYY-MM-DD — সিদ্ধান্ত
- আগের অবস্থা:
- নতুন সিদ্ধান্ত:
- প্রমাণ/কেন:
- কোন code/map/art data বদলাবে:
- ঝুঁকি ও test:
```

---

## স্মরণীয় এক বাক্য

> **আমাদের গেমের বাংলাদেশি পরিচয় নামফলক থেকে নয়—লাল চালা, জলধরা বাইদ, শালপাতা, বাঁশঝাড়, ঘাট এবং ছয় ঋতুর বদলে যাওয়া দৈনন্দিন জীবন থেকে আসবে।**
