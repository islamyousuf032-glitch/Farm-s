# বাংলাদেশের ভূগোল থেকে 2D ফার্মিং/লাইফ-সিম গেম-ওয়ার্ল্ড

> **উদ্দেশ্য:** বাংলাদেশের সত্যিকারের ভূগোল, নদী, মাটি, বন ও মানুষের বসতির ধরন থেকে অনুপ্রাণিত একটি কাল্পনিক কিন্তু বিশ্বাসযোগ্য game world তৈরি করা। এটি বাস্তব বাংলাদেশের হুবহু মানচিত্র নয়; এটি game design-এর জন্য একটি **ভূগোল-বাইবেল**।
>
> **বিশেষ ফোকাস:** গাজীপুর, ভাওয়াল–মধুপুর শালবন, লাল মাটি, চালা–বাইদ ভূদৃশ্য এবং মধ্য-বাংলার গ্রাম–বন–জলাভূমির সংযোগ।
>
> **গবেষণা-তারিখ:** ১০ অক্টোবর ২০২৬

---

## ১. প্রথম সিদ্ধান্ত: আমাদের game-world কেমন হবে

আমাদের গেমটি Stardew Valley-র মতো **ছোট ছোট connected location**-এর মাধ্যমে বড় পৃথিবীর অনুভূতি দেবে, কিন্তু তার প্রাণ হবে বাংলাদেশি ভূদৃশ্য।

```text
বাস্তব ভূগোল থেকে নেব:
নদী ও খাল • বর্ষার জল • উঁচু লাল-মাটির চালা • নিচু বাইদ/ধানক্ষেত •
শালবন • বাঁশঝাড় • পুকুর • বাজার • ঘাট • ফলের বাগান • কুয়াশা • ছয় ঋতু

সরাসরি কপি করব না:
কোনও বাস্তব গ্রামের নাম/মানচিত্র • ধর্মীয়/ঐতিহাসিক স্থানের হুবহু নকশা •
মানুষের বাস্তব বাড়িঘরের অনুকরণ

তৈরি করব:
বাংলাদেশ-অনুপ্রাণিত, নিজের গল্পের জন্য নির্মিত কাল্পনিক "চালাবন উপত্যকা"
```

### Design thesis

> **বাংলাদেশি world-এর প্রধান নাটক পাহাড় নয়—জল, ঋতু, উঁচু-নিচু জমি ও মানুষের অভিযোজন।**
>
> একই পথ গ্রীষ্মে ধুলোমাখা লাল মাটি, বর্ষায় কাদা ও অগভীর জল, শরতে কাশফুলের ধারে রাস্তা, হেমন্তে সোনালি ধানের পাশ দিয়ে হাঁটার অভিজ্ঞতা দেবে। এই বদলই আমাদের map-এর পরিচয়।

---

## ২. বাংলাদেশের ভূগোল: গেমের জন্য জরুরি সত্য

বাংলাদেশ গঙ্গা–ব্রহ্মপুত্র–মেঘনা নদীব্যবস্থার বৃহৎ বদ্বীপের উপর অবস্থিত। দেশটি মূলত নিম্ন, পললভূমি; তবে মধ্য ও উত্তর-পশ্চিমে মধুপুর ও বরেন্দ্র নামে উঁচু প্রাচীন terrace আছে এবং উত্তর-পূর্ব/দক্ষিণ-পূর্বে পাহাড়ি অঞ্চল আছে। Banglapedia অনুযায়ী দেশের বড় অংশ খুব নিম্ন উচ্চতায়; তাই পানি, বন্যা, নদীভাঙন, পলি এবং বর্ষা কেবল background নয়—ভূদৃশ্য গঠনের শক্তি।

### ২.১ Game-relevant landform palette

| বাস্তব landform | চেনার বৈশিষ্ট্য | game map-এ ব্যবহার | gameplay সুযোগ |
|---|---|---|---|
| **নদীবিধৌত পলল সমভূমি** | সমতল, উর্বর, খাল-নদী, মৌসুমি জল | গ্রাম, ধানক্ষেত, ঘাট, মাছধরা | নৌকা, মাছ, মৌসুমি পথ, পলি/ফসল |
| **মধুপুর terrace** | লাল/লালচে-বাদামি মাটি, উঁচু-নিচু চালা, শালবন | মূল farm ও forest zone | শুকনো বনপথ, ফল/কাঠ/forage, ছোট উঁচু ঢাল |
| **বাইদ / depression** | terrace-এর নিচু basin; বর্ষায় জল ধরে, চাষ হয় | ধানক্ষেত, পদ্ম/শাপলা জল, বর্ষার seasonal zone | রোপা ধান, জলজ forage, শুকনো মৌসুমে shortcut |
| **হাওর/বিল** | বর্ষায় বিশাল জলরাশি, শীতে খোলা জমি | দূরের wetland zone | মাছ, পাখি, মৌসুমি access |
| **চর** | নদীর পলি-জমা নতুন ভূমি, পরিবর্তনশীল | late-game river island বা event map | ঝুঁকি/নতুন জমি/ফেরিঘাট |
| **উপকূল ও ম্যানগ্রোভ** | লোনা জল, জোয়ার–ভাটা, গোলপাতা/সুন্দরী | দূরের expansion zone | crab, salt-tolerant plants, boat/fishing |
| **পাহাড়ি বন** | ঢাল, stream, evergreen vegetation | optional late-game biome | rare forage/ore, vertical travel |

এই গেমের **প্রথম map set-এ সব biome ঢোকানো হবে না**। প্রথমে গাজীপুর-মধ্যবাংলার terrace + wet lowland + river corridor-ই যথেষ্ট।

---

## ৩. গাজীপুর ও মধুপুর tract: আমাদের প্রধান visual foundation

### ৩.১ কেন গাজীপুর সবচেয়ে ভালো starting biome

গাজীপুরের ভাওয়াল অঞ্চল মধুপুর tract-এর অংশ—বাংলাদেশের একটি Pleistocene উঁচু terrace। এর মাটি লাল/মটলড clay; ভূভাগ সমতল বদ্বীপের মতো নয়, বরং ছোট plateau-like উঁচু জমি ও নিচু depression-এ ভাগ। Banglapedia মধুপুর tract-কে প্রায় ৪,১০৫ বর্গকিমির central Bangladesh upland বলে বর্ণনা করে, যেখানে plateau-like hillock প্রায় ৯–১৮.৫ মিটার পর্যন্ত এবং dendritic drainage আছে।

এই বৈপরীত্য game design-এ দারুণ:

```text
উঁচু চালা: শালবন, বাড়ি, শুকনো পথ, ফলগাছ, উঠান
        ↓ ছোট ঢাল
নিচু বাইদ: ধানখেত, বর্ষার জল, মাছ, কচুরিপানা/জলজ ঘাস
        ↓ খাল
নদীর ঘাট: নৌকা, বাজারের পথ, অন্য map transition
```

### ৩.২ চালা ও বাইদ: map-এর দুই মৌলিক cell-type

| স্থানীয় রূপ | বাস্তব অর্থ | game art | gameplay rule |
|---|---|---|---|
| **চালা** | উঁচু, অপেক্ষাকৃত শুকনো terrace land | red-brown soil, leaf litter, sal, raised homestead | ঘর/বাগান/বনপথ; বর্ষাতেও সাধারণত পুরো ডোবে না |
| **বাইদ** | নিচু depression/valley; জল ধরে | সবুজ ধান, shallow water, muddy edges | বর্ষায় ধান/মাছ; শীতে চাষ/হাঁটার অন্য পথ |
| **খাল/ডোবা** | জল চলাচল/জমার রেখা | reeds, bamboo bridge, ghats | মাছ, পানির উৎস, seasonal crossing |
| **বন-edge** | শালবনের সঙ্গে গ্রামের সীমা | coppice sal, shrubs, leaf litter | forage, wood, wildlife, story gate |

> **Art rule:** পুরো map-কে সমতল ঘাসে ভরাব না। 2–4 tile-এর ছোট height transition, drainage line, বাঁশের সাঁকো ও জমির আল থাকবে। এতে বাংলাদেশের terrace landscape বোঝা যাবে।

### ৩.৩ গাজীপুরের শালবন বাস্তবতা

ভাওয়াল National Park/গাজীপুরের পরিচায়ক ecosystem হলো tropical moist deciduous **শালবন**; প্রধান প্রজাতি শাল (*Shorea robusta*)। Forest sources অনুযায়ী বর্তমান বন বড় অংশে degraded coppice—অর্থাৎ কাটা গাছের গোড়া থেকে বহু নতুন কান্ড ওঠা—এবং বসতি/ক্ষেতের মধ্যে বন patch patch হয়ে আছে।

এটি game-এর জন্য আরও জীবন্ত বাস্তবতা দেয়:

- একটানা অন্ধকার “fantasy forest” নয়;
- শালগাছের দল, মাঝখানে পাতলা ঝোপ, খোলা লালমাটির পথ;
- পাশেই ধানক্ষেত বা বসতি দেখা যায়;
- পুরোনো বড় গাছ বিরল landmark; নবগজানো বহু-কাণ্ডের coppice সাধারণ;
- মানুষের জ্বালানি, কাঠ, চাষ ও বনরক্ষার tension গল্পে ব্যবহার করা যায়—কিন্তু কোনও বাস্তব জনগোষ্ঠীকে নেতিবাচক caricature করা যাবে না।

### ৩.৪ গাজীপুর environment reference sheet

```text
ভূমি      : উঁচু লালচে terrace + নিচু water-holding depression
মাটি      : red/brown, acidic tendency, পলি-মাটির চেয়ে আলাদা texture
মূল গাছ   : শাল; সাথে হরগোজা/বনচালতা, কুম্ভী, পিতরাজ, বহেড়া ইত্যাদি
বন-চেহারা : dry-season leaf litter; বর্ষায় ঘন সবুজ; patchy coppice
মানব চিহ্ন : কাঁচা রাস্তা, বাঁশের বেড়া, পুকুর, ফলগাছ, ধানখেত, ছোট বাজার
জল        : খাল, ডোবা, seasonal wet field; দূরের বড় নদী/ঘাট
```

---

## ৪. বাংলাদেশের ভূগোলকে location graph-এ রূপ দেওয়া

Stardew-এর শিক্ষা: এক বিশাল map নয়—প্রতিটি location-এর স্পষ্ট কাজ থাকবে। আমাদের কাল্পনিক world-এর প্রথম macro graph:

```text
                    [শালচূড়া বন]
                         │
[বাইদের ধানক্ষেত] ─ [চালাবন গ্রাম] ─ [নদীঘাট বাজার]
       │                   │                    │
 [ফার্মবাড়ি]          [কমিউনিটি উঠান]       [নৌকা/দূরের বিল]
       │
  [বাঁশঝাড়-পুকুর]
```

### ৪.১ প্রথম ছয়টি location-এর design brief

| Map ID (working) | কাল্পনিক নাম | ভূগোলের অনুপ্রেরণা | Player-এর কারণ | Seasonal change |
|---|---|---|---|---|
| `ow_farm_chala` | **লালমাটি ফার্মবাড়ি** | উঁচু চালা | চাষ, বাড়ি, storage, পুকুর | গ্রীষ্মে শুকনো মাটি; বর্ষায় কাদা; শীতে কুয়াশা |
| `ow_gram_uthan` | **চালাবন গ্রাম** | উঁচু village cluster | দোকান, NPC, হাট, উৎসব | আম/জাম, নবান্ন, পিঠা, বর্ষার ছাউনি |
| `ow_baid_fields` | **বাইদের ধানক্ষেত** | নিচু seasonal basin | ধান, মাছ, জলজ forage | বর্ষায় জল ও নৌকা; হেমন্তে সোনালি ধান |
| `ow_sal_edge` | **শালছায়া বন** | ভাওয়াল sal forest | wood/forage, quest, wildlife | বসন্তে পাতা বদল; বর্ষায় ঘন সবুজ; শীতে শুকনো পাতা |
| `ow_bamboo_pukur` | **বাঁশঝাড় পুকুরপাড়** | homestead wet edge | মাছ, পানি, social event | বর্ষায় উপচে জল; শীতে কুয়াশা ও রসের হাঁড়ি |
| `ow_nodi_ghat` | **নদীঘাট বাজার** | riverine Bangladesh | নৌকা, বিক্রি, trader, future travel | বর্ষায় উঁচু জল; শরতে কাশ; শীতে কম জল/চর |

### ৪.২ এই graph কেন Stardew-এর নকল নয়

- Stardew-এর forest/mountain/beach functional split ব্যবহার করা হবে, কিন্তু আমাদের areas বাংলাদেশের **চালা–বাইদ–ঘাট–শালবন** সম্পর্ক থেকে তৈরি।
- Town-এর বদলে থাকবে compact **গ্রাম–হাট–উঠান**।
- গেমের travel theme হবে বাস/রেল নয়, **হাঁটা, বাঁশের সাঁকো, ঘাট ও ছোট নৌকা**।
- ঋতু কেবল palette swap নয়: কোনো পথ ডোবে, কোনো মাছ আসে, ধান পাকে, বাজার/উৎসব বদলায়।

---

## ৫. বাস্তব ভূগোল → gameplay system

### ৫.১ পানি একটি system, শুধু animated tile নয়

| অবস্থা | Map-এ দৃশ্য | Gameplay effect |
|---|---|---|
| গ্রীষ্মের কম জল | খালে ছোট জলধারা, শুকনো পাড় | কিছু area হেঁটে যাওয়া যায়, watering গুরুত্বপূর্ণ |
| প্রথম বর্ষা | কাদামাটি, ছোট puddle, কালবৈশাখীর ভাঙা ডাল | muddy slow tile, repair/cleanup quest |
| পূর্ণ বর্ষা | বাইদে অগভীর জল, ভাসমান পাতা, নৌকা | মাছ বেশি, কিছু পথ বন্ধ, boat shortcut খোলে |
| শরৎ | পানি নামছে, পরিষ্কার আকাশ, কাশ | নতুন foraging, field access ধীরে ফিরে |
| শীত | ডোবা ছোট, সকালের কুয়াশা | অন্য fish/forage, হাঁটার shortcut |

### ৫.২ জমির আল ও পথ

বাংলাদেশি কৃষিভূদৃশ্যে জমির আল শুধু decoration নয়। গেমে এটি হতে পারে:

- narrow walkable route,
- পানি/ধানক্ষেতের boundary,
- বর্ষায় slippery/slow route,
- grass/flower/forage spawn line,
- NPC shortcut,
- ছোট সাঁকোর সঙ্গে puzzle/path choice।

### ৫.৩ ঘাট

প্রতিটি জলাশয়ে কাঠের dock বসালে তা বিদেশি দেখাতে পারে। স্থানীয় ভাষায় design করুন:

```text
ঢালু মাটির পাড় → কয়েক ধাপ ইট/কাঠের সিঁড়ি → বাঁশের খুঁটি → নৌকা বাঁধার দড়ি
```

ঘাটে থাকবে: কলস ধোয়া/পানি তোলা (নন-স্টেরিওটাইপিক ও সম্মানজনক দূরত্বে), মাছের ঝুড়ি, নৌকার বৈঠা, জাল মেরামত, হাটের মাল নামানো। এগুলো NPC routine ও interaction দিতে পারে।

---

## ৬. Map scale ও চলাচলের নিয়ম

### ৬.১ বাস্তব দূরত্ব নয়, অনুভূতির দূরত্ব

বাংলাদেশের গ্রাম বাস্তবে বড় হতে পারে; game-এ প্রতিদিন farm, বাজার ও forest-এ যাতায়াত সম্ভব রাখতে হবে। তাই:

| Route | প্রথম version-এর লক্ষ্য | Design rule |
|---|---|---|
| Farm → village hub | ছোট/মাঝারি | দৈনিক কাজের জন্য ক্লান্তিকর নয় |
| Village → sal forest | মাঝারি | foraging/quest-এর “বেরিয়ে যাওয়া” অনুভূতি |
| Village → river ghat | মাঝারি | market/boat/fishing destination |
| Farm → baid | ছোট | ধান/মাছ/seasonal change সহজে দেখা |
| Deep forest / distant wetland | gate বা পরে খোলে | নতুন gameplay unlock-এর পুরস্কার |

**অপরিবর্তনীয় নিয়ম:** Map সুন্দর করার জন্য হাঁটার সময় বাড়াব না। হাঁটার সময়ও game economy-এর খরচ।

### ৬.২ Screen/room design

প্রতিটি location-এ থাকবে:

1. ১টি **primary silhouette** — শালগাছের দল, বড় বট, ঘাটের ছাউনি, বাজারের গেট।
2. ১টি **primary activity** — চাষ, কেনাবেচা, মাছ, forage, quest।
3. ১টি **seasonal reveal** — বর্ষার boat, হেমন্তের ধান, বসন্তের নতুন পাতার রঙ।
4. ১টি **future gate** — ভাঙা সাঁকো, বাঁশের বেড়া, জলাবদ্ধ পথ, বন্ধ বনপথ।

---

## ৭. বাংলাদেশি visual language: generic "Asian village" এড়ানোর নিয়ম

### নেব

- লাল terrace soil ও নিচু সবুজ বাইদ-এর contrast
- বাঁশঝাড়ের সরু vertical silhouette
- শালবনের সোজা কাণ্ড + উপরের canopy
- পুকুরের ঢালু পাড় ও ঘাট
- টিন/মাটির/ইটের বিভিন্ন texture—একই village-এ সব ঘর এক নয়
- ধানক্ষেতের আল, কাঁচা পথ, ছোট culvert/সাঁকো
- বাজারের অস্থায়ী ছাউনি, ঝুড়ি, মাটির কলস, বৈঠা
- বর্ষার ছাতা, rain drip, কুয়াশা, দূরের আজান/পাখির ambience (সংবেদনশীল ও সম্মানজনক ব্যবহার)

### এড়াব

- প্রতিটি ঘরে একই উজ্জ্বল রঙের “cartoon hut”
- সব জায়গায় নারকেলগাছ/বিদেশি palm বসানো (মধ্য গাজীপুরের শালবনের মূল পরিচয় নয়)
- Japan/China/Thailand-ধাঁচের lantern, torii, pagoda বা roof language
- সব বাংলাকে একই ভূদৃশ্য দেখানো
- exotic plantation tree-কে “native forest” হিসেবে দেখানো—বিশেষত eucalyptus, Australian acacia, mahogany, rain tree

---

## ৮. গাজীপুর biome-এর art production rules

### ৮.১ Palette direction

| Season/state | Dominant colour | Accent | Avoid |
|---|---|---|---|
| বসন্ত–গ্রীষ্ম | dusty red-brown soil, olive green | sal new-leaf copper/red-green | neon green সবখানে |
| বর্ষা | deep wet green, blue-grey sky, dark mud | fresh leaf lime, water reflection | একরঙা cyan rain |
| শরৎ | clear blue, soft green | white kash, bright cloud | অতিরিক্ত autumn-orange (বাংলার শরৎ পশ্চিমা fall নয়) |
| হেমন্ত | golden rice, dry straw | warm brown, late green | পুরো forest dead দেখানো |
| শীত | muted green, pale grey-white mist | date-palm sap pot/fire warmth | snow বা frost |

### ৮.২ Tile/prop starter kit

```text
Terrain tiles:
  red dry soil / wet red mud / paddy embankment / shallow water / pond edge / path

Vegetation:
  sal trunk + canopy modules / sal coppice clump / bamboo clump / grass / fern / shrub
  selected native fruit trees (separate research file দেখুন)

Water props:
  earthen ghat / bamboo pole / small country boat / fishing net / water pot / algae patch

Village props:
  mud-brick/brick/tin wall variants / roof variants / woven fence / paddy stack / jute/bamboo basket
  hand pump or well only if setting supports it; no generic foreign props
```

### ৮.৩ Culling ও performance—Stardew research থেকে প্রযোজ্য সিদ্ধান্ত

- World আলাদা **location/map**-এ ভাগ হবে; একবারে এক map visible।
- Camera-এর বাইরে tile, crop, prop render হবে না।
- static terrain tilemap/atlas-এ; dynamic crop/NPC/boat আলাদা entities।
- seasonal art variant shared atlas/resource হবে, প্রতি tile-এ আলাদা texture নয়।
- day-end update সব map-এর crop/forage/state update করবে; প্রতি frame নয়।
- বর্ষার particle, fog ও ripples camera-bound এবং capped থাকবে।

---

## ৯. বাস্তবতা, নিরাপত্তা ও সম্মান

### ৯.১ বাস্তব মানুষকে scenery বানাব না

বাংলাদেশি touch মানে দরিদ্রতা, দুর্যোগ বা গ্রামীণ মানুষকে সাজসজ্জা বানানো নয়। আমাদের world-এ থাকবে শ্রম, আনন্দ, বাজার, উৎসব, প্রকৃতি, দক্ষতা, সম্পর্ক এবং পরিবর্তনের agency।

### ৯.২ বাস্তব দুর্যোগ ব্যবহারের সতর্কতা

বন্যা/ঝড় game mechanic হতে পারে, কিন্তু:

- তা শাস্তিমূলক random destruction না হয়ে forecast, preparation, community help ও recovery-এর system হবে;
- বাস্তব বিপর্যয়ের ছবি/খবরকে aesthetic asset বানানো যাবে না;
- player-এর ভুলে পুরো ফার্ম ধ্বংস—এমন brutal rule MVP-তে নয়।

### ৯.৩ বন সংরক্ষণ narrative

গাজীপুরের শালবন fragmentation, encroachment ও exotic plantation-এর চাপের মধ্যে আছে। তাই game-এর বন-quest হতে পারে native sapling nursery, invasive/exotic নয় এমন planting, illegal cutting report, forest-edge restoration—কিন্তু বাস্তব কোনো গোষ্ঠীকে দোষারোপ না করে কাল্পনিক চরিত্র ও সমাধান ব্যবহার করতে হবে।

---

## ১০. ম্যাপ তৈরির আগে যে সিদ্ধান্তগুলো এখন স্থির

```yaml
world_identity: মধ্য-বাংলা / গাজীপুর-মধুপুর terrace inspired
primary_biome: sal forest edge + red chala + wet baid
water_identity: pond, khal, river ghat, seasonal inundation
first_settlement: compact village market, not city
first_farm: raised chala land beside seasonal lowland
season_system: six Bengali seasons visualised; three climate regimes simulated
map_structure: small connected locations, not one continuous giant map
flora_rule: native-to-Bangladesh species only; introduced/exotic excluded from natural zones
```

---

## ১১. গবেষণা-সীমা ও পরের নথির সংযোগ

এই নথি ভূগোলের framework। কোন গাছ/ফল strict native, কোনটি planted exotic, কোনটি গাজীপুরের শালবনের associate—এসব আলাদা করে যাচাই করা হয়েছে:

- `research/bangladesh-native-flora-and-fruit-trees-research.md`
- `research/bangladesh-seasons-and-gazipur-ecology-research.md`

Map art তৈরির সময় এই তিনটি নথি একসাথে reference হবে।

---

## ১২. প্রধান সূত্র

1. **Banglapedia — Physiography:** Bangladesh landform, Madhupur Tract-এর Pleistocene terrace, red/mottled clay, height ও drainage।  
   https://en.banglapedia.org/index.php?title=Physiography
2. **Banglapedia — Bangladesh:** বৃহৎ বদ্বীপ, নিম্ন ভূমি, Barind/Madhupur ও forest context।  
   https://en.banglapedia.org/index.php/Bangladesh
3. **Banglapedia — Seven Soil Tracts:** Madhupur red soil tract, baid/depression context।  
   https://en.banglapedia.org/index.php/Seven_Soil_Tracts
4. **Banglapedia — Forest and Forestry / Sal Forest:** গাজীপুরসহ শালবনের distribution, degraded coppice ও ecological pressure।  
   https://en.banglapedia.org/index.php/Forest_and_Forestry  
   https://en.banglapedia.org/index.php/Sal_Forest
5. **FAO — Forest genetic resources in Bangladesh:** Bhawal National Park-এর sal-dominated associated flora।  
   https://www.fao.org/4/ad870e/ad870e04.htm
6. **Bangladesh National Herbarium bulletin:** মধুপুর-clay জাতীয় habitat ও sal-forest floral records-এর উদাহরণ।  
   https://bnh.portal.gov.bd/

> **নকশার সারকথা:** আমাদের প্রথম game-world-এর কেন্দ্র হবে `চালা → বাইদ → খাল/ঘাট → শালবন`। এই চারটি সম্পর্ক ঠিকভাবে দেখাতে পারলে খেলোয়াড় বাংলাদেশি আবহ অনুভব করবে—নাম লিখে বোঝাতে হবে না।
