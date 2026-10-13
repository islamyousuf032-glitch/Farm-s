# বাংলাদেশের ছয় ঋতু ও গাজীপুরের গাছপালা: গেম-সিজন গবেষণা

> **উদ্দেশ্য:** বাংলাদেশি farming/life-sim game-এর ঋতু এমনভাবে বানানো যাতে তা কেবল রঙ বদল না হয়—জল, মাটি, গাছের পাতা, ফসল, মাছ, পথ, বাজার, NPC routine এবং পরিবেশের নিয়ম বদলায়।
>
> **বিশেষ ফোকাস:** গাজীপুর–ভাওয়াল–মধুপুর শালবনের লাল মাটি, seasonal wet lowland এবং Sal (*Shorea robusta*)-কেন্দ্রিক উদ্ভিদগত পরিবর্তন।
>
> **গবেষণা-তারিখ:** ১০ অক্টোবর ২০২৬

---

## ১. দুটি সত্য একসাথে মানতে হবে

বাংলাদেশকে সাংস্কৃতিকভাবে **ছয় ঋতুর দেশ** বলা হয়:

```text
গ্রীষ্ম → বর্ষা → শরৎ → হেমন্ত → শীত → বসন্ত
```

কিন্তু meteorological/climatological বিশ্লেষণে সাধারণত তিনটি বড় regime দেখা হয়:

```text
গরম pre-monsoon (প্রায় মার্চ–মে/জুন)
→ ভেজা monsoon (প্রায় জুন–সেপ্টেম্বর/অক্টোবর)
→ ঠান্ডা-শুষ্ক সময় (প্রায় অক্টোবর/নভেম্বর–ফেব্রুয়ারি)
```

এ দুটি পরস্পর বিরোধী নয়। **আমাদের game-এ ছয় ঋতুর সাংস্কৃতিক পরিচয় থাকবে, কিন্তু জলবায়ুর transition বাস্তবসম্মত ও overlap-সহ হবে।**

> ভুল হবে যদি শরৎকে উত্তর আমেরিকার orange-leaf autumn, শীতকে snow, বা বসন্তকে ইউরোপীয় tulip season বানানো হয়। বাংলাদেশের ঋতুর নিজস্ব জল, মাটি ও পাতা-চক্র আছে।

---

## ২. ছয় ঋতুর calendar reference

| ঋতু | বাংলা মাস | আনুমানিক Gregorian সময় | মূল environment signal |
|---|---|---|---|
| **গ্রীষ্ম** | বৈশাখ–জ্যৈষ্ঠ | মধ্য এপ্রিল–মধ্য জুন | গরম, শুষ্কতা, কালবৈশাখী, পাকা ফল |
| **বর্ষা** | আষাঢ়–শ্রাবণ | মধ্য জুন–মধ্য আগস্ট | বৃষ্টি, আর্দ্রতা, জল ভরা, প্রবল সবুজ |
| **শরৎ** | ভাদ্র–আশ্বিন | মধ্য আগস্ট–মধ্য অক্টোবর | বৃষ্টি কমার শুরু, নীল আকাশ, কাশফুল, জল এখনও থাকে |
| **হেমন্ত** | কার্তিক–অগ্রহায়ণ | মধ্য অক্টোবর–মধ্য ডিসেম্বর | ধান পাকা/কাটা, শিশির, উষ্ণতা কমা |
| **শীত** | পৌষ–মাঘ | মধ্য ডিসেম্বর–মধ্য ফেব্রুয়ারি | কুয়াশা, শুষ্কতা, ঠান্ডা রাত, পরিষ্কার/ফ্যাকাশে সকাল |
| **বসন্ত** | ফাল্গুন–চৈত্র | মধ্য ফেব্রুয়ারি–মধ্য এপ্রিল | পাতা বদল/নতুন পাতা, ফুল, গরমের আগমন, ঝড়ের পূর্বাভাস |

ঋতুর calendar boundary সাংস্কৃতিক। বাস্তব আবহাওয়ায় বর্ষা আগে/পরে শুরু, অতিবৃষ্টি, খরা বা দেরি করে শীত আসা হতে পারে। Game-এ random weather থাকবে, কিন্তু season identity ভাঙবে না।

---

## ৩. বাংলাদেশব্যাপী climate logic: গেমে কী model করব

Bangladesh Water Development Board এবং climate references অনুযায়ী বর্ষার সময় দেশের বৃষ্টির বড় অংশ হয়; pre-monsoon-এ গরম ও বজ্রঝড় গুরুত্বপূর্ণ; শীত তুলনামূলক শুষ্ক। Bangladesh-এ climate-change-এর কারণে তাপমাত্রা ও heavy-rainfall intensity বাড়ার ঝুঁকিও নথিবদ্ধ।

### ৩.১ Game weather state

প্রতি দিন random “রোদ/বৃষ্টি” না দিয়ে weather system হবে season-weighted:

```yaml
weather:
  clear:       sky/temperature/lighting বদলায়
  cloudy:      light কম, NPC routine সামান্য বদলায়
  rain:        soil water, fish, soundscape, path mud বদলায়
  heavy_rain:  visual/route change, কিন্তু MVP-তে crop destruction নয়
  storm:       rare; debris/quest/event, forecast থাকবে
  fog:         শীতের সকাল; visibility/ambience, player punishment নয়
  hot_day:     গ্রীষ্মে energy/watering pressure সামান্য বাড়ে
```

### ৩.২ গুরুত্বপূর্ণ প্রযুক্তিগত নিয়ম

Stardew-related research থেকে নেওয়া আমাদের নিয়ম:

- weather, crop, forage ও tree-state **প্রতি frame update হবে না**;
- নতুন দিনের সময় world-level batch update হবে;
- map-এ দৃশ্যমান অংশই render হবে;
- season change-এর পরে shared tile/atlas variant বদলানো হবে;
- ভারী বর্ষার particle/fog camera-bounded এবং capped থাকবে;
- গাছের seasonal state `tree_type + season + weather + variant seed` দিয়ে নির্ধারিত হবে—প্রতি tree-তে expensive animation নয়।

---

## ৪. গাজীপুর: season design-এর local anchor

### ৪.১ কেন Gazipur-এর calendar আলাদা ভাবে অনুভব হবে

গাজীপুর মধুপুর terrace-এর লাল clay ও Sal forest mosaic অঞ্চলে। এখানে উঁচু **চালা** এবং নিচু **বাইদ** পাশাপাশি; ফলে একই বর্ষায় দুই বিপরীত অভিজ্ঞতা হয়:

```text
চালা: বনের পাতা ভেজে, পথ কাদা হয়, কিন্তু তুলনামূলক উঁচু ও চলাচলযোগ্য
বাইদ: জল ধরে, ধান/জলজ উদ্ভিদ/মাছের world হয়, কিছু পথ বদলে যায়
```

এই `high dry terrace ↔ low wet depression` contrast-ই আমাদের game-এর সবচেয়ে শক্তিশালী seasonal mechanic।

### ৪.২ গাজীপুর Sal forest-এর phenotype

- শালবন moist deciduous ecosystem; Bangladesh-এ শাল forest-এর canopy সাধারণত 10–20 মিটার হতে পারে এবং Sal প্রধান species।
- শাল dry period-এ leaf exchange করে; Bangladesh/nearby regional observationsে leaf fall ও new flush location/microsite অনুযায়ী overlapping হতে পারে। একে পুরোপুরি leafless বা পুরোপুরি evergreen—দুটোর কোনও একটাই নিয়ম ধরে আঁকা ঠিক নয়।
- Sal-এর সঙ্গে বনচালতা, কুম্ভী, শিধা, বহেড়া, হরীতকী, আমলকী, পলাশ, শিমুল ইত্যাদি একই ecosystem-এ দেখা যায়।
- ভাওয়াল/central sal forest আজ fragmented এবং coppice regeneration-এ ভরা; তাই seasonal art-এ mature giant tree ও young multi-stem clump দুটোই থাকবে।

---

## ৫. ঋতুভিত্তিক পরিবেশ ও গাছপালার বিস্তারিত

নিচে “বাস্তব প্রবণতা” ও “আমাদের game implementation”—দুইটি আলাদা রাখা হয়েছে। সব individual tree একই দিনে একই আচরণ করবে না; শিল্পে সেটিকে variation হিসেবে ব্যবহার করব।

---

### ৫.১ গ্রীষ্ম — বৈশাখ ও জ্যৈষ্ঠ

**বাস্তব অনুভূতি**

- তাপ, উজ্জ্বল সূর্য, শুকনো মাটি ও আর্দ্রতার টান।
- pre-monsoon বজ্রঝড়/কালবৈশাখী হঠাৎ আসে; ধুলো, গাঢ় মেঘ, দমকা বাতাস, অল্প/প্রবল বৃষ্টি হতে পারে।
- বহু ফলের season এই সময়ের সঙ্গে যুক্ত; তবে fruit timing species ও অঞ্চলে বদলায়।
- পুকুর/খাল ছোট হতে পারে, কিন্তু গাজীপুরে সব জলাশয় শুকিয়ে মরুভূমি হবে না।

**গাজীপুর visual state**

```text
চালা মাটি: লালচে-বাদামি, ফাটল নয় কিন্তু ধুলোমাখা/শুকনো
শালবন: পুরনো পাতার স্তর, কিছু new leaf, canopy তুলনামূলক খোলা
বাইদ: প্রস্তুত জমি, সীমিত জল, আগের মৌসুমের শুকনো ঘাস
আকাশ: উজ্জ্বল ফ্যাকাশে নীল থেকে বজ্রঝড়ের আগে সবুজাভ-ধূসর
```

**গাছপালার effect**

| উদ্ভিদ/স্তর | গ্রীষ্মের art/action |
|---|---|
| শাল | leaf exchange/new flush variant; একই screen-এ ২–৩টি variation |
| পলাশ | বসন্তের শেষ/গ্রীষ্মের শুরুতে ফুলের কিছু landmark থাকতে পারে; সব tree নয় |
| শিমুল | leafless/flowering-এর পর ফল/তুলা state-এ যেতে পারে |
| জাম/চালতা | species-specific fruit-ready variant; harvest balance আলাদা table-এ |
| ঘাস/ঝোপ | কম saturated, patchy; path edge-এ ধুলা |

**Gameplay**

- পানি দেওয়া গুরুত্বপূর্ণ; কিন্তু player-কে নিষ্ঠুর energy tax দেব না।
- দুপুরে কিছু NPC ছায়া/ঘরের routine নিতে পারে।
- ঝড়ের পরে 1–3টি fallen twig/debris, rare seed, ভাঙা বেড়া repair—ছোট event; farm wipe নয়।
- “বজ্রঝড় আসছে” আকাশ/শব্দ দিয়ে পূর্বাভাস থাকবে।

---

### ৫.২ বর্ষা — আষাঢ় ও শ্রাবণ

**বাস্তব অনুভূতি**

- high humidity, ঘন মেঘ, ঘন/দীর্ঘ বৃষ্টি, জলাশয় ভরা।
- monsoon Bangladesh-এর অধিকাংশ বার্ষিক বৃষ্টির মূল সময়; flooding একটি recurring reality।
- কৃষিজমিতে ধান রোপণ, জলজ উদ্ভিদ, ব্যাঙ-পোকা-পাখির soundscape বদলায়।

**গাজীপুর visual state**

```text
চালা: dark wet-red soil, puddle, slippery narrow path, deep-green sal canopy
বাইদ: অগভীর জল/ধানের চারা, আলগুলো সরু পথ, ছোট মাছের ripple
পুকুর/খাল: পূর্ণ জল, ঘাটের নিচের ধাপ ডোবা, নৌকা/ভেলা বেশি কার্যকর
আকাশ: blue-grey, low cloud, দূরের গাছ atmospheric haze
```

**গাছপালার effect**

| উদ্ভিদ/স্তর | বর্ষার art/action |
|---|---|
| শাল ও associate trees | full, saturated foliage; bark dark/wet; leaf drip |
| বাঁশঝাড় | ঘন dark-green mass; বাতাসে sway সামান্য |
| বাইদের ধান | seedling→green paddy state; growth stage daily update |
| হিজল/জল-edge | water-reflection/partly inundated roots—wetland map-এ |
| শাপলা/জলজ ঘাস | pond/bil-এ controlled patch; পুরো জল ঢাকবে না |
| mushroom/fern/ground herb | forest floor-এ limited seasonal forage, species safety check সহ |

**Gameplay**

- outdoor crop/soil স্বয়ংক্রিয়ভাবে watered হতে পারে—দিন-টিক system-এ rule।
- বর্ষার মাছ, ব্যাঙের ডাক, জলজ forage/নৌকা-ভিত্তিক short route।
- কিছু lowland path হাঁটতে slow বা বন্ধ; অন্যদিকে নৌকা shortcut খোলে।
- rain audio volume ও particle density settings-এ কমানো যাবে।
- heavy rain/flood-like event হবে optional scripted event; core loop নষ্ট করবে না।

---

### ৫.৩ শরৎ — ভাদ্র ও আশ্বিন

**বাস্তব অনুভূতি**

- monsoon এক দিনে শেষ হয় না; বৃষ্টি কমে, আকাশ পরিষ্কার হওয়ার দিন বাড়ে।
- শরতের সবচেয়ে গুরুত্বপূর্ণ visual cue: **নীল আকাশ, সাদা মেঘ, কাশফুল**, কিন্তু মাঠে তখনও পানি/সবুজ থাকতে পারে।
- এটিকে পশ্চিমা autumn-এর মতো লাল-কমলা leaf-fall season বানানো যাবে না।

**গাজীপুর visual state**

```text
চালা: কাদা কমছে, পথ আবার পরিষ্কার; green এখনও শক্তিশালী
বাইদ: পানি ও growing paddy পাশাপাশি
খাল/নদীপাড়: কাশফুলের সাদা plume, পরিষ্কার নীল আকাশের contrast
শালবন: healthy green canopy; বর্ষার পরের আলো বেশি উজ্জ্বল
```

**Gameplay**

- নতুন কিছু dry path খুলবে; boat এখনও ব্যবহারযোগ্য।
- village seasonal celebration/market event হতে পারে।
- নদীপাড় ও বাইদ-edge-এ kash grass collectible নয়, decorative landmark বেশি।
- clear day fishing/festival bonus দেওয়া যায়, কিন্তু বাধ্যতামূলক নয়।

---

### ৫.৪ হেমন্ত — কার্তিক ও অগ্রহায়ণ

**বাস্তব অনুভূতি**

- বর্ষার জল নেমে আসছে; দিন উষ্ণ হলেও রাত/ভোর ঠান্ডা হতে শুরু।
- শিশির বাড়ে; ধান পাকে ও harvest landscape-কে বদলে দেয়।
- নবান্নের সঙ্গে নতুন ধান/খাদ্য/বাজারের সাংস্কৃতিক সম্পর্ক আছে।

**গাজীপুর visual state**

```text
বাইদ: green paddy → golden paddy → harvested stubble (তিন state)
চালা: dry-path ফিরে আসে, মাটির warm red tone দেখা যায়
সকাল: dew sparkle limited; fog নয়, হালকা crisp haze
শালবন: green থেকে muted olive-এর দিকে; ground-এ শুকনো পাতা বাড়ে
```

**Gameplay**

- rice harvest quest/collective village event; player চাইলে সাহায্য করতে পারবে, বাধ্যতামূলক নয়।
- paddy field কাটার পর নতুন হাঁটার পথ/forage spot খুলতে পারে।
- store/market-এ নতুন rice-based recipe ingredients।
- season-end economics: one “harvest income” system থাকলে তা player farm-এর crop economy থেকে আলাদা করে design করতে হবে।

---

### ৫.৫ শীত — পৌষ ও মাঘ

**বাস্তব অনুভূতি**

- বাংলাদেশের শীত তুলনামূলক শুষ্ক; উত্তর ও ভেতরের অঞ্চলে ঠান্ডা বেশি, গাজীপুরে ভোরের কুয়াশা ও ঠান্ডা রাত গুরুত্বপূর্ণ।
- snow নেই। Grass একেবারে মৃত ধূসরও নয়; crop/vegetation palette muted হয়।
- কুয়াশা, পিঠা, খেজুরের রস, সবজি, আগুনের উষ্ণতা—সাংস্কৃতিক cues। তবে strict native-flora rule অনুযায়ী খেজুর asset নিয়ে আলাদা verification প্রয়োজন।

**গাজীপুর visual state**

```text
সকাল: pale grey fog layer, দূরের sal canopy fade
দুপুর: পরিষ্কার হালকা সূর্য, muted green ও dry leaf litter
বাইদ: কাটা ধানের খড়/শুকনো জমি, কিছু সবজি/শীতকালীন চাষের plot
পুকুর: জল কম কিন্তু বরফ নয়
```

**গাছপালার effect**

| উপাদান | শীতের rule |
|---|---|
| শাল | কিছু leaf loss/old leaf colour; individual variation; “dead forest” নয় |
| deciduous associates | canopy পাতলা, branch silhouette বেশি দৃশ্যমান |
| evergreen/native fruit trees | পাতার রঙ একটু muted; সম্পূর্ণ leafless নয় |
| ground | শুকনো পাতার layer, কম saturated grass, morning dew/fog |

**Gameplay**

- fog কেবল visual/ambience নয়: দূরের object একটু soft হবে, কিন্তু minimap/interaction unfair হবে না।
- winter vegetable/craft/food loop যোগ করা যেতে পারে পরে।
- ভোরে কিছু NPC late start করতে পারে; বাজার সকাল একটু দেরিতে জমে।
- পিঠা/নবান্ন-পরবর্তী social event—খাদ্য, বন্ধুত্ব ও recipe system-এর সুযোগ।

---

### ৫.৬ বসন্ত — ফাল্গুন ও চৈত্র

**বাস্তব অনুভূতি**

- শীত থেকে গরমে transition; বাতাস বদলাতে থাকে, আকাশে ধুলা/ঝড়ের ইঙ্গিত আসে।
- নতুন পাতা, কিছু ফুল, গাছের leaf exchange, প্রকৃতির দ্রুত রঙ বদল।
- বাস্তবে বসন্ত ছোট; game-এ একে দীর্ঘ পশ্চিমা spring বানানো উচিত নয়।

**গাজীপুর visual state**

```text
শাল: leaf-litter ও copper/red-green new leaf-এর মিশ্রণ
পলাশ/শিমুল: selected flowering landmarks
চালা: dry red soil আবার স্পষ্ট; ঘাস কম saturated
বাইদ: dry/transition field; পরের কৃষিচক্রের প্রস্তুতি
আকাশ: warm clear day + দূরে pre-monsoon cloud possibility
```

**Gameplay**

- new-year/festival-like village event হতে পারে, কিন্তু real festival নাম/ritual ব্যবহার করলে সাংস্কৃতিক পরামর্শ প্রয়োজন।
- native sapling/forest restoration quest-এর ভালো সময়।
- year-end inventory/planning/seed catalogue event।
- বসন্ত শেষে গ্রীষ্মের heat system ধীরে ঢুকবে—একদিনে palette flip নয়।

---

## ৬. গাছের season state machine

### ৬.১ প্রতিটি গাছ একই নিয়মে বদলাবে না

বাস্তব ecosystem-এ একই species-এর গাছও জল, ছায়া, বয়স, মাটির গভীরতা ও microsite অনুযায়ী ভিন্ন হতে পারে। তাই art-এর জন্য fixed “সব শাল ১ তারিখে leafless” rule খারাপ।

```text
TreeVisualState =
  SpeciesProfile
  + Season
  + Microhabitat (chala / baid-edge / pond-edge / deep forest)
  + StableVariantSeed
  + WeatherOverlay (wet / wind / fog)
```

### ৬.২ Sal tree example

```yaml
species: Shorea robusta
spring:
  variants: [old_leaf, leaf_exchange, copper_new_leaf, early_green]
summer:
  variants: [mature_green, post_storm_wet]
monsoon:
  variants: [deep_green_wet, dense_canopy]
autumn:
  variants: [clear_green, muted_green]
late_autumn:
  variants: [olive_green, sparse_litter]
winter:
  variants: [partial_leaf_drop, dry_leaf_litter, thin_canopy]
```

**Performance:** tree-এর সম্পূর্ণ sprite sheet প্রতি দিন বদলাতে হবে না। season শুরুতে বা specific event-এ variant choose করে save করা যাবে। Weather overlay আলাদা tint/decal/particle দিয়ে হবে।

---

## ৭. ছয় ঋতুকে game calendar-এ কীভাবে ধরব

### Option A — ১২ দিন × ৬ ঋতু = ৭২ দিনের বছর (**প্রথম prototype-এর জন্য সুপারিশ**)

| সুবিধা | কারণ |
|---|---|
| দ্রুত feedback | player এক playthrough-তে সব seasonal system দেখে |
| Stardew-like daily loop রাখা যায় | season যথেষ্ট দীর্ঘ, কিন্তু overly long নয় |
| content scope নিয়ন্ত্রিত | প্রতি season-এ ১–২টি main crop/forage/event দিয়েই শুরু সম্ভব |

### Option B — ১৪ দিন × ৬ ঋতু = ৮৪ দিনের বছর

আরও ধীর life-sim চাইলে ভালো, কিন্তু NPC dialogue, crop balance, event ও art variation বেশি লাগবে।

### Option C — ২৮ দিন × ৬ ঋতু = ১৬৮ দিনের বছর

প্রথম game-এর জন্য নয়। Content production ও player waiting দুইই বেশি।

### Recommended calendar design

```text
প্রথম prototype:
  1 season = 12 game days
  1 year = 72 game days
  প্রতিটি season = 1 visual transition day + 9 normal days + 1 event/rare-weather window + 1 preparation day

পরের version:
  player feedback অনুযায়ী 14 days/season করা যাবে
```

> Calendar length balance test ছাড়া lock করা যাবে না। এটি design proposal, বাস্তব Bangla calendar-এর replacement নয়।

---

## ৮. Crop, forage, fish ও NPC-এর seasonal rules

### ৮.১ প্রথম version-এ কম কিন্তু অর্থপূর্ণ content

প্রতি ঋতুতে ১০টি crop দেওয়া বাধ্যতামূলক নয়। প্রথমে:

```text
প্রতি season:
  2 field crop
  1 forage item
  1 fish/pond change
  1 visual landmark
  1 NPC routine/event change
```

এরপর economy মজবুত হলে বাড়াব।

### ৮.২ Season interaction matrix

| System | গ্রীষ্ম | বর্ষা | শরৎ | হেমন্ত | শীত | বসন্ত |
|---|---|---|---|---|---|---|
| Soil watering | বেশি দরকার | rain auto-water | মাঝারি | কমে | কম | বাড়ে |
| Lowland access | খোলা/শুকনো | জল/নৌকা | mixed | খুলে | খোলা | শুকনো |
| Forest floor | dry litter | wet herb/mushroom | green | dry-gold | leaf/fog | new leaf/flower |
| Fish | warm-water pool | rain/flood pool | receding-water pool | harvest canal pool | clear/cool pool | pre-monsoon pool |
| NPC routine | shade/noon rest | umbrella/indoor | outdoor fair | harvest work | late morning/fog | planting/festival prep |
| Main emotion | heat & waiting rain | abundance & movement change | relief & open sky | harvest & warmth | intimacy & mist | renewal & anticipation |

### ৮.৩ Daily update pseudocode concept

```text
OnNewDay(world):
  advance day/season
  choose weather weighted by season + scripted event
  for each location:
    update soil/crops (watered, season-valid, growth)
    update forage spawn table for season/weather
    update tree seasonal visual only if transition threshold reached
    update lowland water-state / path availability
    update NPC schedule selector
  save world state
```

**নিয়ম:** `update tree seasonal visual` প্রতি frame নয়; `forage spawn` সব map প্রতি second নয়।

---

## ৯. গাজীপুর seasonal map transformation plan

একই `ow_baid_fields` map ৬ রূপে:

| ঋতু | Tile/art swap | Route | Activity |
|---|---|---|---|
| গ্রীষ্ম | dry bank, shallow ditch | আল ধরে হাঁটা | soil prep, collecting water |
| বর্ষা | shallow inundation, paddy seedlings | boat/raised embankment | fishing, paddy care |
| শরৎ | water + mature green field | mixed | bird/fish/clear-sky event |
| হেমন্ত | golden paddy | full paths mostly | harvest/social market |
| শীত | stubble, fog/dew | shortcut open | winter crop/forage |
| বসন্ত | cleared plot, dry edge | open | seed prep, restoration |

একই `ow_sal_edge` map ৬ রূপে:

| ঋতু | Canopy/floor | Sound/light |
|---|---|---|
| গ্রীষ্ম | leaf litter + leaf exchange | cicada/heat/harsh light |
| বর্ষা | deep wet foliage + lush ground | rain/drip/frog |
| শরৎ | fresh green + clear shafts | bird/clear sky |
| হেমন্ত | muted green + increasing dry floor | harvest-distance ambience |
| শীত | thin canopy + fog + dry leaf | soft morning, dry twig |
| বসন্ত | copper new leaves + palash/shimul accent | wind/new insects |

---

## ১০. Art, animation ও audio budget

### Art budget rule

Seasonality মানে প্রতিটি sprite নতুন করে ৬ বার আঁকা নয়। অগ্রাধিকার:

```text
A. terrain palette/decals            (সবচেয়ে চোখে পড়ে)
B. main tree states                 (sal, bamboo, fruit tree)
C. field/water level                (gameplay বদলায়)
D. sky/light/fog/rain overlays      (মুড)
E. props/events                     (পরে)
```

### Efficient seasonal asset strategy

| Asset type | পূর্ণ নতুন sprite? | ভাল পদ্ধতি |
|---|---|---|
| Ground tile | আংশিক | base tile + seasonal variant/decal |
| Sal tree | 2–4 key variant | new leaves, wet overlay, sparse state |
| Fruit tree | 2–3 key variant | normal + fruit-ready + sparse/flower state |
| Bamboo | না | tint + rain overlay + occasional leaf decal |
| Paddy field | হ্যাঁ, growth-critical | dry/seedling/green/golden/stubble states |
| Water | না | colour + ripple + level-edge tile |
| Building | না | roof wetness, shade, festival prop overlay |
| NPC clothing | পরে | MVP-তে minimal accessory/palette, ৬টি full costume নয় |

### Audio priority

- গ্রীষ্ম: dry insects, distant thunder, wind
- বর্ষা: roof/rain/leaves/water/frog—volume slider প্রয়োজন
- শরৎ: open birds, breeze
- হেমন্ত: harvest/field ambience
- শীত: quiet morning, distant activity, optional fire
- বসন্ত: breeze, birds/insects, distant storm build-up

কোনও ধর্মীয় sound বা বাস্তব লোকসঙ্গীত অনুমতি/প্রাসঙ্গিকতা ছাড়া ambient loop-এ ব্যবহার করা হবে না।

---

## ১১. Climate risk-কে fair gameplay-এ রূপ দেওয়া

বাংলাদেশে ভারী বৃষ্টি/বন্যা বাস্তব জীবনকে কঠিন করে। Game-এ তা ব্যবহার করতে হলে player-কে agency দিতে হবে:

| ভুল design | ভালো design |
|---|---|
| random flood সব crop মেরে দিল | weather forecast + raised bed/drain/harvest choice + recovery help |
| কুয়াশায় player পথ হারিয়ে soft-lock | fog visual only; map/landmark কাজ করে |
| বর্ষায় সব পথ বন্ধ | কিছু path বন্ধ, কিন্তু boat/raised path/shortcut খোলা |
| heat-এ দ্রুত energy শেষ, কাজ অসম্ভব | heat-এ small modifier; shade/water/rest meaningful |
| disaster শুধু aesthetic | community quest, preparation, repair, solidarity—কিন্তু forced misery নয় |

MVP-তে weather system হবে আনন্দ ও সিদ্ধান্তের উৎস, destruction simulator নয়।

---

## ১২. প্রথম implementation backlog

### Phase 1 — core season engine

- [ ] 6-season enum + 12-day/season test calendar
- [ ] `OnNewDay()` batch update
- [ ] weather weights by season
- [ ] crop validity/soil-water rules
- [ ] season/sky/ambient palette switch

### Phase 2 — Gazipur map transformation

- [ ] Farm chala: dry/wet/mist palette
- [ ] Baid field: five crop/water visual states
- [ ] Sal forest: leaf-litter, wet, new-leaf, sparse variants
- [ ] River/pond: water-level edge tiles
- [ ] first forage tables

### Phase 3 — life and content

- [ ] NPC weather routines
- [ ] one event each for বর্ষা, হেমন্ত, শীত, বসন্ত
- [ ] fish/forage differences
- [ ] forecast UI
- [ ] accessibility options for rain/fog/screen effects

---

## ১৩. QA checklist

```text
[ ] ছয় ঋতুতে map একই সঙ্গে চেনা যায়, আবার আলাদা লাগে
[ ] শরৎ ভুল করে পশ্চিমা orange fall দেখাচ্ছে না
[ ] শীতে snow/frost নেই
[ ] বর্ষায় lowland আর raised land আলাদা আচরণ করে
[ ] শাল সব screen-এ একই দিনে একইভাবে leafless নয়
[ ] seasonal tile বদলালে collision/soil/portal ভাঙে না
[ ] বর্ষার particles FPS কমায় না
[ ] rain/fog visual কমানোর setting আছে
[ ] seasonal crop dead/paused/harvest rules player-কে UI-তে জানানো হয়
[ ] weather কখনও soft-lock বা unavoidable total-loss করে না
[ ] সব tree/flower native-flora register-এর habitat rule মেনে বসানো
```

---

## ১৪. প্রধান সূত্র

1. **Banglapedia / traditional Bangladesh seasons:** Bengali calendar, seasonal climate description, rainfall/temperature pattern।  
   https://en.banglapedia.org/  
   (ঋতু বিষয়ে বিভিন্ন reference-এ সময়সীমায় সামান্য পার্থক্য আছে; calendar dates-কে rigid weather boundary ধরা হয়নি।)
2. **Bangladesh Water Development Board — Rainfall in Bangladesh:** monsoon, winter, summer climate framing এবং Gazipurসহ station data।  
   https://www.bwdb.gov.bd/archive/pdf/6487.pdf
3. **Red Cross Red Crescent Climate Centre — Bangladesh climate fact sheet (2024):** 3 climate regimes, rainfall concentration, heat/heavy-rain risk।  
   https://www.climatecentre.org/wp-content/uploads/RCCC-Country-profiles-Bangladesh_2024_final.pdf
4. **Banglapedia — Deciduous Forest / Sal Forest:** Sal forest ecology, leaf-loss character, associated vegetation।  
   https://en.banglapedia.org/index.php/Deciduous_Forest  
   https://en.banglapedia.org/index.php/Sal_Forest
5. **Kew POWO — *Shorea robusta*:** accepted status and Bangladesh native distribution।  
   https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:321425-1
6. **FAO — Forest genetic resources in Bangladesh:** Bhawal National Park Sal-associate flora।  
   https://www.fao.org/4/ad870e/ad870e04.htm
7. **Bangladesh Forest/Herbarium literature:** Madhupur/central Sal forest seasonal and floristic studies; exact visual timing should remain flexible by microhabitat.  
   https://bnh.portal.gov.bd/

---

## সারকথা

> আমাদের game-এর ঋতু হবে **জীবনের rhythm**: গ্রীষ্মে অপেক্ষা ও ঝড়, বর্ষায় জল ও প্রাচুর্য, শরতে আলো ও খোলা আকাশ, হেমন্তে ফসল, শীতে কুয়াশা ও ঘনিষ্ঠতা, বসন্তে পাতা বদল ও নতুন পরিকল্পনা।
>
> গাজীপুরের জন্য সবচেয়ে গুরুত্বপূর্ণ visual equation হলো: **লাল চালা + জলধরা বাইদ + শালবনের leaf-cycle + ছয় ঋতুর আলো।**
