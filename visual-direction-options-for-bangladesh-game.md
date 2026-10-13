# বাংলাদেশের farming/life-sim গেম: Premium Visual Direction-এর ৩টি পথ

> **উদ্দেশ্য:** game asset production শুরু করার আগে আমরা কোন visual language বেছে নেব তা পরিষ্কার করা। তিনটি direction-ই original হবে; কোনও existing game-এর art, asset, character বা map কপি করা হবে না।
>
> **Shared world:** Gazipur/Madhupur inspired red chala, wet baid, sal forest, bamboo, pond/ghat, village market, six Bengali seasons.

---

## ১. Decision criteria

| মানদণ্ড | কেন জরুরি |
|---|---|
| বাংলাদেশি পরিচয় | generic foreign farming game হওয়া যাবে না |
| PC/console readability | TV-distance, controller camera, action clarity |
| Production scope | ছোট দলেও শেষ করা সম্ভব হতে হবে |
| Seasonal range | ছয় ঋতুতে একই map বিশ্বাসযোগ্যভাবে বদলাবে |
| Animation cost | player/NPC/tool/trees/weather-এর কাজ বাস্তবসম্মত রাখতে হবে |
| Performance | rain, fog, lighting সুন্দর হলেও stable frame rate চাই |

---

## Direction A — Cinematic HD Pixel Art

### এক বাক্যে

**Classic pixel grammar, কিন্তু modern light, deep environment layering ও premium animation।**

### Visual recipe

```text
World resolution   : low-resolution pixel grid, integer-friendly presentation
Environment        : deliberate pixel clusters, rich tile variation
Lighting           : warm/cool 2D lights, wet-surface highlights, selective normal maps
Animation          : expressive key-pose pixel animation; water/rain/wind loops
Camera             : top-down, stable, cinematic framing at important locations
UI                 : clean high-resolution text/UI over pixel-art world
```

### বাংলাদেশের রূপ

- গাজীপুরের লাল মাটি ছোট textured clusters-এ;
- শালবন: straight trunks, dense but readable canopy, dry leaf litter;
- বর্ষা: layer-based rain, wet mud, pond ripple, roof drip;
- শরৎ: blue sky/white cloud/কাশের light silhouette;
- শীত: subtle fog, muted green, no snow;
- NPC ও tools: compact but highly readable silhouettes।

### সুবিধা

- সবচেয়ে দ্রুত original world identity তৈরি করা যায়।
- tile, crop stage, inventory icon ও gameplay read করা সহজ।
- seasonal variants তুলনামূলক manageable।
- lower texture memory; console performance-friendly।

### ঝুঁকি

- খারাপ pixel art খুব দ্রুত cheap দেখায়।
- wrong camera scale/blur/sub-pixel movement premium feel নষ্ট করে।
- strict palette, animation এবং lighting discipline লাগবে।

### Best for

যদি আমরা চাই concept image-এর আবহ, কিন্তু বাস্তব gameplay grid, strong farm system এবং নিয়ন্ত্রিত production scope।

---

## Direction B — Hand-Painted 2D Storybook World

### এক বাক্যে

**উচ্চ-resolution হাতে আঁকা পরিবেশ, painterly foliage, এবং cinematic illustration।**

### Visual recipe

```text
World resolution   : HD 2D raster art, less grid-visible
Environment        : brush texture, painted sky, organic foliage
Lighting           : painted light + post-processing + selective dynamic light
Animation          : skeletal rigs + frame-by-frame hero moments
Camera             : slower/cinematic, detailed close-up friendly
UI                 : illustrated panels, typography-heavy presentation
```

### বাংলাদেশের রূপ

- বর্ষার ভারী আকাশ ও জলরঙের মতো rice field;
- শালপাতার ভেজা texture;
- কুয়াশাচ্ছন্ন শীতের পুকুরপাড়;
- ঘরের টিন, বাঁশ ও কাদার rich material detail;
- portraits ও story moment খুব শক্তিশালী।

### সুবিধা

- সবচেয়ে cinematic এবং emotionally rich হতে পারে।
- character portrait, festival, cutscene, story scene খুব সুন্দর হয়।
- console screenshot/marketing-এ আকর্ষণীয়।

### ঝুঁকি

- পরিবেশ, animation ও seasonal redraw-এর খরচ অনেক বেশি।
- map edit বা new content যোগ করা ধীর।
- visual clutter হলে top-down gameplay readability কমে।
- ছোট দল হলে production timeline দ্রুত বড় হয়ে যায়।

### Best for

বড় dedicated art team/budget, কম map কিন্তু গভীর গল্প, এবং painting-first game হলে।

---

## Direction C — Hybrid Premium 2D (**আমার সুপারিশ**)

### এক বাক্যে

**HD pixel-art gameplay world + refined hand-painted portraits, UI, key art ও selective story illustrations।**

### Visual recipe

```text
Gameplay world     : Direction A-এর disciplined HD pixel art
Characters in play : pixel-art sprites, expressive idle/walk/tool animations
Portraits          : hand-painted/illustrated, original character art
UI                 : high-resolution vector/painted panels with pixel-aware motifs
Key scenes         : illustrated scene/card, not every location fully painted
Lighting           : URP 2D lights, weather overlays, restrained post-process
```

### বাংলাদেশের রূপ

- Farm, sal forest, baid ও ghat: pixel-art tile/module ভিত্তি—দ্রুত map build ও clear gameplay।
- NPC portrait: শাড়ি/লুঙ্গি/কর্মপোশাককে stereotype না করে চরিত্রের পেশা, বয়স, ব্যক্তিত্ব ও region-এর সাথে original design।
- Journal, calendar, community board: hand-painted Bengali texture, কিন্তু readable modern UI।
- বিশেষ season event: 1–2টি original illustration বা cinematic composition।

### সুবিধা

- console-quality personality, কিন্তু map/crop/NPC production realistic।
- gameplay readability ও narrative emotion দুটোই পাওয়া যায়।
- six-season art workload নিয়ন্ত্রণে থাকে।
- marketing art/portraits world sprite-এর চেয়ে বেশি detail দিতে পারে।

### ঝুঁকি

- দুই medium-এর palette, line/shape language ও character proportion মিলিয়ে art bible বানাতে হবে।
- portrait এবং sprite যেন একই মানুষ মনে হয়—model sheet প্রয়োজন।

### Best for

আমাদের বর্তমান লক্ষ্য: premium PC/console feel, বাংলাদেশি world identity, ছোট থেকে মাঝারি production team এবং game-first development।

---

## ২. Side-by-side comparison

| মানদণ্ড | A: HD Pixel | B: Hand-Painted | C: Hybrid Premium |
|---|---:|---:|---:|
| gameplay clarity | ★★★★★ | ★★★ | ★★★★★ |
| cinematic emotion | ★★★ | ★★★★★ | ★★★★★ |
| small-team feasibility | ★★★★ | ★★ | ★★★★ |
| seasonal production | ★★★★ | ★★ | ★★★★ |
| map iteration speed | ★★★★★ | ★★ | ★★★★★ |
| controller/TV readability | ★★★★★ | ★★★★ | ★★★★★ |
| distinct marketing art | ★★★ | ★★★★★ | ★★★★★ |
| recommended now | strong option | later only | **best balance** |

---

## ৩. Direction C-এর preliminary art bible

এটি এখনই final lock নয়; তবে prototype-এর জন্য সবচেয়ে উপযোগী baseline।

### World

```text
Perspective      : top-down, 3/4 readability without fake isometric complexity
Tile language     : crisp HD pixel art; visible grid only where gameplay benefits
Palette           : red-brown Madhupur soil, deep monsoon green, muted winter grey-green,
                    golden hemanta rice, clean sharot blue-white
Lighting          : upper-left sun convention; time-of-day tint; limited 2D lights at night
Depth             : Y-sort + foreground canopy/roof fade; no obscuring player
Weather           : layered, capped and optional intensity settings
```

### Character

```text
In-world sprite  : readable 4/8-direction pixel silhouette
Portrait         : original polished illustration built from same model sheet
Animation        : strong poses, anticipation, impact feedback; not unnecessary smoothness
Costume          : culturally grounded but individual and non-stereotyped
```

### UI

```text
Text             : large, high contrast, Bangla-ready font test
Navigation       : gamepad first, clear focus state
Texture          : subtle jute/bamboo/clay motif only where it does not hurt readability
Information      : modern clean layout; no ornamental clutter in gameplay HUD
```

---

## ৪. Prototype test before committing

একটি ছোট Farm screen তিনভাবে test করব—final art নয়, deliberate mini prototypes:

```text
Test 1: HD pixel-art tile, sal, bamboo, crop, rain and 2D light
Test 2: painterly environment equivalent
Test 3: pixel world + painted NPC portrait/UI mock
```

তারপর বিচার হবে:

- controller/TV-তে player ও harvestable object পড়া যায় কি?
- বর্ষার effect gameplay ঢাকে কি?
- Gazipur identity বোঝা যায় কি?
- এক season variant বানাতে কত সময় লাগে?
- performance budget কত?
- user-এর emotional preference কী?

**এই test-এর আগে শত শত asset উৎপাদন করা হবে না।**

---

## ৫. আজকের পরের visual decision

আপনি পরে তিনটির একটি নির্বাচন করবেন:

```text
A — Cinematic HD Pixel Art
B — Hand-Painted 2D Storybook
C — Hybrid Premium 2D (আমার সুপারিশ)
```

নির্বাচনের পরে আমরা:

```text
visual reference board → palette → character scale chart → tile size test →
Farm micro-scene → performance/readability test → official art bible
```

---

## ৬. সিদ্ধান্ত log — ১০ অক্টোবর ২০২৬

**নির্বাচিত direction: B — Hand-Painted 2D Storybook World।**

পরবর্তী clarification অনুযায়ী game-টি mobile-first: Android landscape-এ আগে release-ready হবে, কিন্তু একই content ও art direction নিয়ে PC ও console-এও যাবে। তাই Direction B-কে unlimited painted bitmap হিসেবে নয়, **mobile-optimised painted modular environment + layered animation + selective premium effects** হিসেবে বাস্তবায়ন করা হবে।

এই সিদ্ধান্তের revised technical production contract:
`research/mobile-first-premium-cross-platform-plan.md`

---

## সারকথা

> আমাদের game হবে **mobile-first hand-painted 2D world**—বাংলাদেশের মাটি, জল, গাছ ও ছয় ঋতুকে কেন্দ্র করে। PC ও console version একই পৃথিবী ও gameplay বহন করবে; কেবল hardware অনুযায়ী rendering profile বদলাবে।
