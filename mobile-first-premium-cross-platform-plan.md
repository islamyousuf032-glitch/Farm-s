# Mobile-First Premium Cross-Platform Plan

> **Correction / updated source of truth:** এটি একটি **mobile-first game**। লক্ষ্য হলো mobile-এ PC/console-level অনুভূতি দেওয়া; পরে একই game, একই world, একই gameplay এবং একই art direction নিয়ে PC ও console-এ প্রকাশ করা।
>
> **Locked decisions (10 October 2026):** Unity • Android-first • landscape • গত ৩–৪ বছরের mid-range Android baseline • Direction B: Hand-Painted 2D Storybook World • PC/console parity by design.

---

## ১. “তিন platform-এ একই visual” বাস্তবে কীভাবে হবে

আমরা তিনটি আলাদা game বানাব না। থাকবে:

```text
একটি codebase
একটি world/map/data set
একটি story/content set
একটি original hand-painted art direction
একটি save format
একটি gameplay ruleset
```

কিন্তু একই art direction বজায় রাখতে platform অনুযায়ী **rendering quality profile** আলাদা হতে পারে:

| জিনিস | Android | PC/Console | একই থাকবে কি? |
|---|---|---|---|
| map composition, tree, house, character design | same source art | same source art | ✅ |
| story/gameplay/content/save | same | same | ✅ |
| camera/game feel/input response | same design target | same design target | ✅ |
| texture compression/resolution | mobile-optimised | higher memory budget | perception একই, file setting আলাদা |
| rain/fog/particle density | capped/adaptive | fuller density | visual language একই |
| render resolution / AA | device-adaptive | higher quality profile | art style একই |
| 2D lights/shadow details | selective/baked | more layers allowed | lighting direction একই |

> **অর্থ:** Android screen ও console screen pixel-by-pixel এক হবে না; কিন্তু খেলোয়াড় একই পৃথিবী, একই painting, একই mood এবং একই gameplay অনুভব করবে। এই পথেই premium cross-platform game বাস্তবসম্মত হয়।

---

## ২. Mobile-first quality promise

```text
Landscape mobile game
→ দুই আঙুলে আরামদায়ক control
→ 60 FPS লক্ষ্য (বাস্তব mid-range device profiling-এ যাচাই)
→ no input lag, no camera jitter
→ readable under sunlight and on small screens
→ short map-load / clean fade transition
→ battery/thermal-aware visual scaling
→ touch, gamepad, keyboard/mouse একই Input abstraction-এ
→ PC/console port-এর সময় gameplay বা content rewrite লাগবে না
```

### Quality bar, not visual excess

Premium mobile experience মানে 4K texture বা অসংখ্য effect নয়। মানে:

- responsive movement ও tool action,
- high-quality art composition,
- deliberate animation,
- clear UI,
- stable frame pacing,
- fast loading,
- careful audio/haptics,
- zero soft-lock/data-loss।

---

## ৩. Direction B selected: Hand-Painted 2D Storybook World

### আমরা কী বানাব

```text
Environment  : high-quality hand-painted 2D layers; Gazipur red soil, sal forest, baid, pond, ghat
Characters   : painted/layered character parts + expressive key-pose animation
NPC portraits: detailed original illustrations from the same character model sheets
UI           : clean, modern, landscape-friendly, subtle Bengali material motifs
Lighting     : painted value first; selective dynamic 2D light second
Weather      : layered rain, puddle/ripple, wind and fog—strict visual budgetে
```

### Painterly mobile rule

> “প্রতিটি map একটি 4K painting” করা যাবে না। আমরা environment-কে **painted modular kit + layered background + reusable props + selective hero illustration** হিসেবে বানাব।

এতে B direction-এর সৌন্দর্য থাকবে, কিন্তু mobile memory ও map iteration নিয়ন্ত্রণে থাকবে।

### Animation pipeline

| Asset | পদ্ধতি | কারণ |
|---|---|---|
| Player/NPC normal movement | layered parts + skeletal/cutout animation | কম memory, easy iteration, smooth movement |
| Tool impact/emotion/major action | limited frame-by-frame enhancement | strong game feel |
| Water/rain/leaf/wind | shader/scrolling texture/short loops | cheap, reusable atmosphere |
| Major story moment | hand-painted illustration / special animation | premium emotion; every scene-এ নয় |
| Trees/buildings | mostly static layered props + subtle motion | mobile-safe |

---

## ৪. Mobile input: PC/console feel-এর ভিত্তি

### Landscape touch layout

```text
┌──────────────────────────────────────────────────────────────┐
│  optional mini HUD            time / season / weather         │
│                                                              │
│                                                              │
│  [left thumb movement zone]                  [interact/use] │
│                                              [tool/quickslot]│
│                                              [inventory/map] │
└──────────────────────────────────────────────────────────────┘
```

### Input contract

- left thumb: 8-direction movement, adjustable size/opacity;
- right side: context-sensitive **Interact**, **Use Tool**, **Quick Slot**;
- one-tap contextual prompt যখন player object-এর কাছে;
- long-press/drag শুধুমাত্র যেখানে সত্যিই দরকার—gesture overload নয়;
- optional touch feedback/haptic;
- Android gamepad support প্রথম থেকেই, যেন Bluetooth controller-এ console-style play সম্ভব হয়;
- PC-তে keyboard/mouse এবং console-এ native gamepad একই command system চালাবে।

### Touch UX rules

```text
কখনও tiny button নয়
thumb-এর নিচে objective/hot UI নয়
UI art-কে tool hitbox বানানো নয়
accidental tap-এ expensive item destroy নয়
সব important action undo/confirmation-friendly
```

---

## ৫. Android-first technical target

### Device baseline

**Target class:** গত ৩–৪ বছরের mid-range Android device। নির্দিষ্ট reference phone list Phase 0.1-এ lock হবে; অন্তত একটি baseline, একটি weaker real device এবং একটি higher-end device-এ নিয়মিত test হবে।

### Performance profiles

| Profile | Platform/device | Goal |
|---|---|---|
| Mobile Premium | tested mid-range+ Android | 60 FPS target, full intended painterly mood |
| Mobile Balanced | warmer/older device | same gameplay, reduced particles/light layers/render scale |
| PC/Console Quality | capable hardware | same art, cleaner sampling, more effect density/resolution |

### Android technical rules

```text
- Unity URP 2D Renderer; mobile-first shader count
- IL2CPP + ARM64 release path (actual build config Unity project-এ সেট হবে)
- texture atlas এবং platform-specific compression
- no per-frame full-world scans
- active map only loaded/rendered; async transition
- pooled VFX; rain/fog camera-bound
- profiler + real-device thermal session mandatory
- battery/temperature দীর্ঘ সময় খেলার পরে test
- app pause/resume, phone call, low-memory, orientation lock tests
```

### প্রথম performance budgets (test করে refine হবে)

```text
Frame budget               : 16.67 ms 60 FPS target
Visible dynamic actors     : budgeted, unlimited নয়
Rain particles             : camera-bound, quality-profile capped
2D lights                  : few meaningful lights, not every prop
Texture memory             : measured per active location/device
Map transition             : fade-এর মধ্যে asynchronous load
```

সংখ্যাগুলো profiling না করে অনুমান করে lock করা হবে না।

---

## ৬. Hand-painted art-এর mobile production rules

### Asset rules

1. **Source art বড় ও layered থাকবে**, runtime export platform-specific হবে।
2. Background হবে 3–5 depth layer; one enormous uncompressed bitmap নয়।
3. বাড়ি, শালগাছ, বাঁশ, ঘাট, ক্ষেত—modular painted prop kit হিসেবে তৈরি হবে।
4. একই art texture বারবার atlas থেকে ব্যবহার হবে।
5. transparent full-screen layers কম রাখব—mobile overdraw ব্যয়বহুল।
6. shadow/light যতটা সম্ভব painted/baked; dynamic light শুধু meaningful moment-এ।
7. rain/fog/water shader সব screen জুড়ে excessive হলে quality profile কমাবে।
8. সব art source file version-controlled ও re-exportable হবে।

### প্রথম art test scene

```text
একটি ছোট Farm screen:
red chala soil + painted sal forest edge + bamboo + pond/earthen ghat + one house + rain
```

এতে আমরা test করব:

- mobile screen-এ player/object পড়া যায় কি না,
- painterly detail UI/collision ঢাকে কি না,
- rain ও fog-এ FPS/temperature কেমন,
- একই scene PC profile-এ কেমন লাগে,
- বাংলাদেশি identity স্পষ্ট কি না।

---

## ৭. Revised development order

```text
PHASE 0A  Unity/mobile project setup + real Android reference device plan
PHASE 0B  Input prototype: touch + controller + keyboard command abstraction
PHASE 1   Player movement, camera, collision, landscape UI readability
PHASE 2   Farm/Village graybox with touch controls
PHASE 3   Farming day loop, save/load, Android device profiling
PHASE 4   Hand-painted Farm micro-scene test and art bible lock
PHASE 5   Six-season/weather rendering with mobile performance profiles
PHASE 6   NPC/economy/connected Bangladesh maps
PHASE 7   PC + console build profiles, certification-readiness preparation
PHASE 8   Closed Android testing → PC/console test → beta/release
```

### গুরুত্বপূর্ণ পরিবর্তন

আগের পরিকল্পনায় PC/console was primary quality reference ছিল। এখন:

> **Android is the first real device and first performance gate.** PC ও console version Android-এর feature কাটছাঁট করা copy নয়; একই content-এর higher hardware profile।

---

## ৮. প্রথম implementation milestone: Mobile Player Feel Lab

Unity project পাওয়া মাত্র আমরা প্রথমে শুধু এটি বানাব:

```text
Landscape 2D test scene
→ touch movement
→ keyboard movement
→ controller movement
→ camera follow
→ one interaction prompt
→ one tool swing/haptic feedback
→ pause/resume safe
→ run on Android reference device
```

### এটি পাশ করার শর্ত

- [ ] landscape-এ thumbs UI ঢাকে না
- [ ] movement responsive
- [ ] player/camera smooth
- [ ] tool target বোঝা যায়
- [ ] 10–15 মিনিট খেলার পরে performance/heat সমস্যা নেই
- [ ] same scene keyboard ও controller-এও চলে

তারপরই Farm Graybox map হবে।

---

## ৯. Console/PC পরে কীভাবে যুক্ত হবে

```text
Shared game core + Input abstraction + scalable visual profiles
               ↓
Android first build and feedback
               ↓
PC build: keyboard/mouse/gamepad, higher profile
               ↓
approved console program + dev hardware
               ↓
platform build, certification QA, store release
```

Console release-এর exact schedule platform developer approval, hardware, age rating, publishing plan ও certification test-এর উপর নির্ভর করবে। তাই আমরা এখন সঠিক technical debt এড়াব—কিন্তু কোনও platform approval পাওয়ার আগে console launch date প্রতিশ্রুতি দেব না।

---

## ১০. পরের user-facing decision

Direction B নির্বাচিত হয়েছে। এখন আমরা আর style বাছাইয়ে আটকে থাকব না। পরের সিদ্ধান্ত হবে:

```text
Unity project ready হলে:
- First playable character কে হবে?
- Farm owner-এর বয়স/ব্যক্তিত্ব/গল্পের শুরু কী?
- আমাদের game-এর final নাম কী হবে?
```

কিন্তু code কাজ থামবে না; Player Feel Lab এগুলো ছাড়াও শুরু করা যাবে।

---

## সারকথা

> **আমরা mobile-এর জন্য গেম বানাচ্ছি, কিন্তু mobile-কে ছোট ভাবছি না।** Hand-painted Bangladesh world, smooth controller-like touch controls, disciplined mobile optimisation এবং shared cross-platform architecture—এই চারটি একসাথে আমাদের game-কে mobile-এ PC/console-quality অনুভূতি দেবে।
