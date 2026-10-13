# গাজীপুর-অনুপ্রাণিত বাংলাদেশি Farming/Life-Sim RPG
## পূর্ণ গেম পরিকল্পনা ও ধাপে ধাপে Development Roadmap

**পরিকল্পনা সংস্করণ:** ১.১  
**তারিখ:** ১২ অক্টোবর ২০২৬  
**পরিকল্পনার অবস্থা:** ব্যবহারকারী নিশ্চিত করেছেন—নতুন করে শুরু, Android/mobile-first এবং PC/console-মানের gameplay ও visual লক্ষ্য। বর্তমানে তার কাছে শুধু Samsung Galaxy F23 Android phone আছে; কোনো computer access নেই। Unity Editor-এ final project author/build শুরু করার আগে PC/remote workstation লাগবে, অথবা engine সিদ্ধান্ত আনুষ্ঠানিকভাবে বদলাতে হবে।  
**গুরুত্বপূর্ণ:** Stardew Valley হলো genre ও অনুভূতির অনুপ্রেরণা; এই গেমের নাম, গল্প, চরিত্র, map, art, music, code ও dialogue হবে নিজস্ব ও বাংলাদেশ-অনুপ্রাণিত।

---

## ০. আগে সৎ উত্তর: আমি কি গেমটি তৈরি করতে পারব?

**হ্যাঁ—আমি তোমার সঙ্গে পরিকল্পনা থেকে playable game বানানো পর্যন্ত ধাপে ধাপে কাজ করতে পারি।** তুমি গেমের স্বপ্ন, পছন্দ-অপছন্দ ও চূড়ান্ত সিদ্ধান্ত দেবে; আমি সেগুলোকে design, task, data structure, Unity C# code, test plan, asset brief, documentation ও iteration-এ রূপ দিতে সাহায্য করব। তুমি project file, build log, screenshot বা playtest feedback দিলে সেগুলো দেখে পরের পরিবর্তন সাজাব।

তবে একটি বাস্তব সীমা পরিষ্কার রাখা দরকার: আমি তোমার কম্পিউটারে Unity Editor নিজে চালাতে, তোমার ফোন হাতে নিয়ে পরীক্ষা করতে, publisher account খুলতে বা তোমার হয়ে game store-এ release করতে পারি না। Unity-তে project চালানো, real device-এ test করা এবং final publish করার জন্য তোমার বা তোমার দলের অংশগ্রহণ লাগবে। তুমি project দিলে আমি file/code নিয়ে কাজ করতে পারি; আমি কোনো পরিবর্তন দিলে তোমাকে Unity-তে run করে ফল জানাতে হবে।

এটি বড় indie game-এর কাজ, তাই একবারে “পুরো Stardew-সমান” বানানোর প্রতিশ্রুতি দেব না। আমরা আগে **ছোট, সম্পূর্ণ, testable playable slice** বানাব; সেটি মজার ও স্থিতিশীল প্রমাণিত হলে ধীরে ধীরে বড় করব। এতে সুন্দর পরিকল্পনাও থাকবে, বাস্তব কাজও থাকবে—কিন্তু না-পরীক্ষা করা feature-এ মাসের পর মাস নষ্ট হবে না।

---

## ১. Project-এর এক-বাক্যের পরিচয়

> **গাজীপুর–মধুপুর অঞ্চলের লালমাটির চালা, বর্ষার বাইদ, শালবন, বাঁশঝাড়, পুকুর-ঘাট ও ছয় ঋতুর আবহে—একটি কাল্পনিক বাংলাদেশের গ্রামে নিজের খামার গড়া, মানুষের সঙ্গে সম্পর্ক তৈরি, প্রকৃতি দেখা এবং ছোট ছোট দৈনন্দিন লক্ষ্য পূরণের একটি original 2D farming/life-simulation RPG।**

**Working title:** আপাতত নাম ঠিক করা হয়নি। আগের নথিতে “চালাবন উপত্যকা” প্রস্তাব ছিল; এটি কেবল placeholder, final title নয়।

---

## ২. ইতিমধ্যে স্থির সিদ্ধান্ত ও যা এখনো খোলা

### বর্তমান source of truth — বদলানো হচ্ছে না

সাম্প্রতিক mobile-first plan অনুযায়ী আপাতত এগুলোই project-এর ভিত্তি:

- **Engine:** Unity 6.3 LTS।
- **প্রথম platform:** Android; **landscape** screen ও touch-first controls।
- **শুরু:** কোনো existing Unity project/codebase নেই; clean project from scratch হবে।
- **বর্তমান hardware:** Samsung Galaxy F23 Android phone আছে; Android version/variant পরে device profile-এ record করব।
- **Unity workstation:** এই মুহূর্তে কোনো PC/Mac/remote workstation access নেই; শুধু Android phone আছে। Unity Editor চালানো ও APK build করতে computer access লাগবে।
- **Performance target class:** গত ৩–৪ বছরের mid-range Android device; কোন নির্দিষ্ট phone-এ target lock হবে, তা Phase 0-তে ঠিক হবে।
- **Art:** original hand-painted 2D storybook style; mobile-এ readable ও memory-aware।
- **Quality promise:** mobile-এ PC/console-সুলভ polished gameplay ও visual quality লক্ষ্য; premium composition, animation, sound, UI ও responsiveness।
- **Cross-platform লক্ষ্য:** একই game, world, gameplay rules, story/content ও save model; PC/console-এ পরে উপযুক্ত visual profile ও input adapter।
- **Visual parity-এর বাস্তব সংজ্ঞা:** একই art direction ও content থাকবে; mobile-এ hardware অনুযায়ী resolution, texture compression, particle density ও lighting scale করা যাবে। প্রতিটি phone-এ 4K বা pixel-by-pixel console parity প্রতিশ্রুতি নয়—stable frame pacing ও সুন্দর readability আগে।
- **প্রথম gameplay nucleus:** Farm → চাষ/বীজ/পানি → Town/গ্রামে যাওয়া → NPC/দোকান → Farm-এ ফেরা → save/load।
- **প্রথম game:** single-player; multiplayer, বিশাল procedural world ও সব console একসঙ্গে নয়।

> পুরোনো research-এ PC-first বা pixel-art-এর কিছু প্রাথমিক প্রস্তাব আছে; সেগুলোকে বর্তমান সিদ্ধান্ত ধরা হবে না। আগের C++-without-engine guide-টিও বিকল্প প্রযুক্তি-গবেষণা মাত্র—এই plan-এর Unity direction বদলায় না। কোনো দিক বদলালে তারিখ, কারণ ও প্রমাণসহ decision log-এ লিখব।

### পরে তোমার সঙ্গে স্থির করতে হবে — এখন prototype থামায় না

1. Game-এর নাম।
2. খেলোয়াড় কে—নিজের character তৈরি করবে, নাকি নির্দিষ্ট protagonist থাকবে?
3. গল্পের শুরু: কেন সে এই গ্রামে/খামারে আসে?
4. মূল ভাষা: বাংলা, ইংরেজি, নাকি শুরু থেকেই দুটো?
5. প্রথম পূর্ণ release কত বড় হবে, আনুমানিক playtime, price/free model এবং release target।
6. প্রথম support করা Android phone/OS-এর নির্দিষ্ট তালিকা।
7. final NPC roster, crop list, map সংখ্যা, festival ও ending।

এই সিদ্ধান্তগুলো না হওয়া পর্যন্ত নথিতে সেগুলোকে **TBD** রাখব; অনুমানকে final fact বলব না।

---

## ৩. গেমের design pillars

নতুন feature, map, চরিত্র বা art-এর আগে জিজ্ঞেস করব—এটি নিচের কোন pillar-কে শক্তিশালী করছে?

1. **বাংলার জীবন্ত ভূদৃশ্য:** জায়গা শুধু দেখতে সুন্দর নয়; মাটি, জল, গাছ, আবহাওয়া ও ঋতুতে বদলায়।
2. **শান্ত কিন্তু অর্থপূর্ণ দৈনন্দিনতা:** আজ চাষ, মাছ, হাট, বন, NPC, না বিশ্রাম—খেলোয়াড় নিজের মতো বেছে নেয়।
3. **স্থান ও মানুষের সম্পর্ক:** গ্রামের মানুষ, তাদের কাজ, বাড়ি, চলার পথ ও ঋতু একে অপরের সঙ্গে যুক্ত।
4. **ন্যায্য চাপ, নির্মম শাস্তি নয়:** দিন/energy/অর্থ সিদ্ধান্তকে আকর্ষণীয় করবে; ভুল সিদ্ধান্তে খেলোয়াড় আটকে যাবে না বা save হারাবে না।
5. **দেশজ ও সম্মানজনক পরিচয়:** বাংলাদেশি প্রকৃতি, ঋতু, খাদ্য, ভাষা ও দৈনন্দিনতার নিজস্বতা গবেষণা ও সংবেদনশীলতার সঙ্গে দেখানো হবে।
6. **মোবাইলে আরামদায়ক premium feel:** পড়তে সহজ UI, দ্রুত সাড়া দেওয়া controls, স্থির frame pacing, ভালো sound/animation—শুধু অনেক effect নয়।
7. **Original IP:** Stardew Valley-এর genre convention থেকে অনুপ্রেরণা নেওয়া যেতে পারে; তার নাম/চরিত্র/গল্প/ম্যাপ/art/music/code copy বা বিভ্রান্তিকর নকল করা যাবে না।

---

## ৪. Core game loop ও প্রথম scope

### এক দিনের সম্ভাব্য loop

```text
ঘুম থেকে ওঠা
→ আজকের সময়/ঋতু/আবহাওয়া দেখা
→ খামার বা গ্রামের কাজ বেছে নেওয়া
→ বীজ বোনা/পানি/ফসল/মাছ/বন/হাট/NPC
→ জিনিস বিক্রি বা প্রয়োজনীয় জিনিস কেনা
→ পরের দিনের জন্য ছোট লক্ষ্য
→ বাড়ি ফেরা, save, ঘুম
→ নতুন দিন/আবহাওয়া/ফসলের state update
```

### প্রথম playable vertical slice — ছোট কিন্তু সম্পূর্ণ

এই অংশে অন্তত থাকবে:

- Landscape Android-এ চলা player controller; placeholder art চলবে।
- হাঁটা, collision, camera follow, interaction prompt এবং tool action।
- একটি ছোট **Farm** ও একটি ছোট **Village/Town** graybox; portal দিয়ে যাওয়া-আসা।
- মাটি চাষ → ২–৩টি crop seed → পানি → নতুন দিন → growth stage → harvest।
- game clock/day advance-এর প্রথম সংস্করণ; ঋতুর data structure থাকবে, কিন্তু ছয় ঋতুর সব content তখনো লাগবে না।
- inventory, কয়েন, একটি shop, অন্তত একজন NPC ও ছোট dialogue।
- crop/soil/player/location state save → app বন্ধ → আবার চালু → load।
- touch UI; একই game actions-এ keyboard ও gamepad mapping-এর ভিত্তি।
- একটি ছোট original Gazipur-inspired hand-painted scene test।
- বাংলা font/UI-এর যুক্তাক্ষর, কার-ফলা, wrapping ও fallback পরীক্ষা।
- অন্তত একটি reference এবং একটি দুর্বল Android device-এ install/run/profile।

**এই slice-এর বাইরে থাকবে:** multiplayer/co-op, marriage/children, ২০+ NPC, শতাধিক crop/recipe, বিশাল mine/dungeon, procedural infinite map, full voice acting, সব console launch, বহু অঞ্চলের পূর্ণ map। এগুলো core loop প্রমাণের পরে বিবেচনা হবে।

### প্রথম পূর্ণ release-এর পরিধি

Final commercial scope এখনই সংখ্যায় lock করব না। Vertical slice-এর পরে একটি map, crop, NPC, quest ও art asset বানাতে বাস্তব সময় কত লাগে—তা মেপে content budget ঠিক করব। পরিকল্পিত world-এর সম্ভাব্য ক্রম:

1. Home Farm ও গ্রামের কেন্দ্র/হাট।
2. Baid/ধানক্ষেত ও বর্ষার জলপথ।
3. শালবনের প্রান্ত ও foraging/restoration কাজ।
4. পুকুর, বাঁশঝাড়, ঘাট ও fishing/relaxation।
5. প্রয়োজনে অতিরিক্ত forest/market/নদীপথ—শুধু core game তা সমর্থন করলে।

প্রতিটি map-এ নতুন visual identity-এর পাশাপাশি অন্তত একটি gameplay কারণ, একটি seasonal change এবং ফিরে আসার কারণ থাকতে হবে।

---

## ৫. Development-এর মূল নিয়ম

- **আগে কাজের প্রমাণ, পরে বড় content:** final map বা শত asset দিয়ে শুরু নয়।
- **Graybox আগে:** চলাচল, মাপ, camera, collision, gameplay না মেলা পর্যন্ত final art নয়।
- **একটি codebase, একটি ruleset:** platform অনুযায়ী art quality কমবেশি হতে পারে; core gameplay/content/save ভাঙা যাবে না।
- **Art layer ≠ gameplay rule:** সুন্দর ঘাস নিজে থেকেই চাষযোগ্য হবে না; soil/collision/water/portal আলাদা data।
- **Static definition ও player state আলাদা:** crop কীভাবে বাড়ে তা data; ওই player-এর ক্ষেতে crop-এর বর্তমান অবস্থা save data।
- **এক task, এক ফল:** ছোট feature বানিয়ে run/test করে তারপর পরের কাজ।
- **Version control বাধ্যতামূলক:** বড় পরিবর্তনের আগে clean commit/backup; ভুল হলে ফিরতে পারব।
- **License ও provenance:** code, package, font, sound, image, generated/commissioned art—সব কিছুর source ও usage rights নথিভুক্ত।
- **Scope cut order:** schedule/effort চাপলে optional content আগে কাটবে; save safety, controls, Bengali readability, core farming loop ও Bangladesh identity নয়।

---

## ৬. ধাপে ধাপে সম্পূর্ণ Roadmap

প্রতিটি phase-এর gate pass না হলে পরের বড় production phase শুরু হবে না। কিছু documentation ও ছোট prototype পাশাপাশি হতে পারে; তবে final art/content production-এর আগে core loop test করা হবে।

### Phase 0 — Project charter, scope ও source audit

**লক্ষ্য:** নতুন Unity project-এ কী বানাব ও কোন নিয়মে এগোব তা লিখিতভাবে lock করা। ব্যবহারকারী নিশ্চিত করেছেন যে কোনো পুরোনো project/code নেই।

**কাজ:**
- [x] Existing Unity project/codebase নেই—নতুন project হবে।
- [ ] license/source/assets/fonts/audio/plug-ins-এর ownership ও restrictions নথিভুক্ত; অনুমতি ছাড়া third-party game assets/code নয়।
- [ ] one-page game brief, design pillars, core loop, current locked decisions, open decisions তৈরি।
- [ ] MVP/vertical-slice scope freeze; `Now / Next / Later` backlog।
- [ ] project name placeholder, Git repository, backup policy, decision log, issue/bug template।
- [x] Initial Android test device: Samsung Galaxy F23; Android version ও variant record করতে হবে।
- [ ] অতিরিক্ত weaker/reference/high-tier device-এর সুযোগ হলে list; একটি phone-এ test করলেই পুরো device matrix pass নয়।

**Deliverables:** approved brief, current decision list, initial backlog, asset/license register, নতুন project-এর clean Git baseline.  
**Pass gate:** Unity/mobile-first direction ও first slice পরিষ্কার; project নতুনভাবে build হয়; code/asset-এর baseline ফেরত নেওয়া যায়।

### Phase 1 — Unity foundation ও Android build

**লক্ষ্য:** feature বানানোর আগে project যেন clean অবস্থায় build/run হয়।

**কাজ:**
- [ ] Unity 6.3 LTS-এ একদম নতুন project তৈরি; project version ও required packages source control-এ নথিভুক্ত।
- [ ] Unity Editor চালানোর জন্য compatible PC/Mac বা remote workstation access নিশ্চিত; mobile phone হবে test device, development computer নয়।
- [ ] 2D URP/mobile rendering setup, landscape orientation, safe-area handling।
- [ ] Unity Input System-এ shared action map: touch, keyboard/mouse, gamepad।
- [ ] Git ignore/large file policy, folder/naming convention, package/version pin।
- [ ] test scene, basic logger, build profile, development build symbols/logs।
- [ ] Android ARM64 development build; ফোনে install/run; pause/resume ও orientation test।
- [ ] map authoring tool সিদ্ধান্তের জন্য ছোট test: Unity Tilemap বনাম Tiled/LDtk—যে workflow কম friction ও data validation দেয় সেটি নথিবদ্ধ; একই source data দুই জায়গায় manually edit করব না।

**Deliverables:** clean-clone project build, Android test APK/build, scene/folder convention, input action map.  
**Pass gate:** project নতুন করে open/build করে Android device-এ scene চালানো যায়; pause/resume crash বা state loss ছাড়া কাজ করে।

### Phase 2 — Mobile Player Feel Lab

**লক্ষ্য:** গল্প, final map ও art-এর আগে হাঁটা/ক্যামেরা/control মজার কি না প্রমাণ।

**কাজ:**
- [ ] একদম সরল test room ও placeholder player।
- [ ] 4/8-direction movement, acceleration/stop tuning, animation placeholder।
- [ ] collision, wall slide, obstacle/prop blocking।
- [ ] camera follow, boundary, aspect ratio, resolution scaling test।
- [ ] landscape touch: বামে adjustable movement zone; ডানে contextual Interact/Tool/Quick Slot।
- [ ] keyboard/controller একই gameplay action trigger করে কি না।
- [ ] interaction prompt, target highlight, tool swing/impact feedback।
- [ ] pause/resume/phone call/lock screen return test।

**Deliverables:** playable Player Feel Lab scene, control mapping, short test recording/screenshots, tuning notes.  
**Pass gate:** player responsive; camera jitter নেই; ছোট screen-এ UI thumb-এর নিচে নয়; touch action miss করে না; ১০–১৫ মিনিটে গুরুতর heat/stutter/input সমস্যা নেই। 60 FPS target reference device-এ measure হবে—অনুমান করে সবার জন্য guarantee নয়।

### Phase 3 — World graph ও Farm/Village graybox

**লক্ষ্য:** জায়গার scale, path, map transition ও gameplay route পরীক্ষা।

**কাজ:**
- [ ] world graph: Farm ↔ Village; পরে Baid/Forest edge।
- [ ] প্রথম Farm ও Village/Town blockout—দেয়াল, পথ, field, water, shop, exits।
- [ ] layer/object contract: visual ground, collision, tillable soil, water, interaction, NPC, portals, foreground।
- [ ] portals-এ coordinate নয়, stable `mapId + entryId`/named exit।
- [ ] safe spawn, camera bounds, collision geometry, interaction reach।
- [ ] ১–২ মিনিটের travel target test; map size হাঁটতে বিরক্তিকর কি না playtest।

**Deliverables:** connected Farm + Village graybox, map graph/card, entry/exit data, map validation checklist.  
**Pass gate:** Farm → Village → Farm round-trip নির্ভরযোগ্য; player আটকে যায় না; visual layer পাল্টালেও collision/portal rule অক্ষত থাকে।

### Phase 4 — Core Farming Simulation ও Save/Load

**লক্ষ্য:** “এক দিন খেলা কি আনন্দদায়ক?”—এ প্রশ্নের উত্তর।

**কাজ:**
- [ ] game clock ও player action; ঘুম/দিন শেষের পরিষ্কার নিয়ম।
- [ ] soil cell state: tillable, tilled, planted, watered, crop instance।
- [ ] data দিয়ে ২–৩টি starter crop; growth stage ও harvest output।
- [ ] tool target selection, action feedback, invalid tile feedback।
- [ ] day advance-এ crop growth একবার; প্রতি render frame-এ নয়।
- [ ] প্রাথমিক inventory, stack, item ID, money, seed buy/crop sell।
- [ ] বৃষ্টি হলে outdoor soil-এ পানি লাগবে কি না—প্রথম rule ও test।
- [ ] versioned save model: player, map/cell changes, crop, inventory, day, settings।
- [ ] temporary write/backup/corrupt-save fallback; migration tests।
- [ ] edit/play mode tests: crop growth, inventory, day rollover, save/load।

**Deliverables:** complete local farming loop, save schema v1, automated tests, gameplay tuning notes.  
**Pass gate:** খেলোয়াড় একদিন জমি প্রস্তুত, বীজ, পানি, দিনের অগ্রগতি, crop state, harvest করতে পারে; app বন্ধ/আবার চালালে সেই state ঠিক থাকে।

### Phase 5 — First Vertical Slice ও original Art Proof

**লক্ষ্য:** ছোট কিন্তু আমাদের game-এর আসল পরিচয় আছে এমন playable build।

**Vertical slice journey:**

```text
Farm-এ spawn
→ জমি চাষ/seed/water
→ নতুন দিন ও crop update
→ Village-এ portal
→ একজন NPC/shop/dialogue বা ছোট delivery goal
→ Farm-এ ফেরা
→ save/restart/load করে একই অবস্থা ফিরে পাওয়া
```

**কাজ:**
- [ ] এক-screen hand-painted Farm micro-scene: লাল মাটি, শাল/বাঁশের প্রান্ত, পুকুর/ঘাট, বাড়ি, foreground occlusion, player।
- [ ] art bible v1: palette, scale, lighting direction, texture density, asset naming/export, pivot/feet/hitbox, Y-sort।
- [ ] 1 NPC portrait/sprite, 1 shop/UI theme, minimal original dialogue।
- [ ] day/season/weather HUD; Bengali text real font-এ: যুক্তাক্ষর, কার-ফলা, punctuation, mixed Bengali/Latin, line wrap ও fallback।
- [ ] rain/water/one seasonal palette change-এর light version; visual budget।
- [ ] sound placeholders/first ambience, farm ambience, tool feedback।
- [ ] external playtest: কাউকে controls না বুঝিয়ে 10–20 মিনিট খেলতে দিন; confusion, fun, frustration লিখুন।
- [ ] Android reference + weaker device-এ scene profile; PC editor test শুধু convenience, Android pass-এর বিকল্প নয়।

**Deliverables:** installable first vertical slice, art bible v1, playtest report, performance snapshot.  
**Pass gate:** নতুন player core loop বুঝতে পারে; save loss/crash/soft-lock নেই; Bangladesh identity স্পষ্ট; touch control গ্রহণযোগ্য; scene device-এ profile pass করে। এই gate পাসের আগে full map/asset production নয়।

### Phase 6 — ছয় ঋতু, আবহাওয়া ও Gazipur ecology

**লক্ষ্য:** ঋতুকে কেবল background color নয়, gameplay ও জায়গার স্বতন্ত্র অভিজ্ঞতা করা।

**কাজ:**
- [ ] calendar-এ ছয় ঋতু: গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত, বসন্ত; দৈর্ঘ্য পরে balance-test-এ স্থির।
- [ ] দিন/ঋতু advance-এর data rules; save migrationসহ।
- [ ] weather types ও season weighting: রোদ/মেঘ/বৃষ্টি/ভারী বৃষ্টি/কুয়াশা/গরম—প্রথমে সংযত set।
- [ ] rain/soil/water, baid water-level, crop season eligibility, NPC schedule-এর ছোট প্রভাব।
- [ ] Farm/Baid/Forest visual seasonal variants—প্রথমে 2–3টি স্পষ্ট season test, পরে ছয়টিতে বিস্তার।
- [ ] native flora/fruit/land use নিয়ে source review; বাস্তব ecology থেকে নকল না করে stylized fiction স্পষ্ট রাখা।
- [ ] rain/fog/particles-এর intensity/accessibility control।
- [ ] frame-time, overdraw, heat ও memory regression test।

**Deliverables:** calendar/weather model, season content rules, seasonal art set, tested save transition.  
**Pass gate:** একই map-এ season বদল visually ও gameplay-তে বোঝা যায়; save, crop, collision ও frame pacing ভাঙে না।

### Phase 7 — World, NPC, story ও content production

**লক্ষ্য:** প্রমাণিত core loop-কে content দিয়ে বড় করা; ফাঁপা map বা feature নয়।

**কাজ ও ক্রম:**
1. **World bible:** fictional Gazipur-inspired অঞ্চল, স্থাননাম, মানচিত্রের graph, পরিবেশ, নদী/পুকুর/বাইদ/চালা, সাল বন ও বসতির সম্পর্ক।
2. **Character bible:** protagonist, পরিবার/গ্রামের মানুষ, প্রত্যেকের goal, দৈনন্দিন schedule, season/weather variation ও সংলাপের voice। প্রথমে অল্প কয়েকজন গভীর চরিত্র।
3. **Story outline:** শুরু, প্রথম বড় লক্ষ্য, community project, মধ্যবর্তী turning point, ending/credits; scene-by-scene dialogue এখনই নয়।
4. **Map cards:** প্রতিটি zone-এর উদ্দেশ্য, exits, landmarks, gameplay verbs, season changes, NPC, content budget, playtest question।
5. **Content data:** CropDef, ItemDef, ToolDef, RecipeDef, NPCDef, QuestDef, WeatherDef, MapDef—stable IDs ও validatorsসহ।
6. **Economy/progression:** seed/tool price, crop value, energy/time, upgrade materials; grind বাধ্যতামূলক না করে balance spreadsheet।
7. **NPC/social:** dialogue flags, small friendship system, weather-aware routine; relationship depth core loop pass করার পর।
8. **Exploration:** forage/fishing/market/forest goals; প্রতিটি নতুন map-এ gameplay reason, seasonal change ও return path।
9. **Events/festivals/food/crafting/animals:** optional backlog—প্রথম release scope review-এ সময়/মান অনুযায়ী অন্তর্ভুক্ত হবে, আগে থেকে প্রতিশ্রুতি নয়।
10. **Audio:** local ambience, instruments/score brief, farm/weather/shop/NPC feedback; প্রতিটি audio asset-এর rights register।

**Deliverables:** approved story/world bible, data catalog, maps/content backlog, complete asset production brief.  
**Pass gate:** feature/content budget টিমের বাস্তব উৎপাদন ক্ষমতার সঙ্গে মেলে; প্রতিটি system-এর test/owner আছে; map ও dialogue repeatable pipeline দিয়ে ঢোকে।

### Phase 8 — Full Content, Integration ও Alpha

**লক্ষ্য:** ঘোষিত v1 scope-এর সব feature/content playable করা; নতুন feature যোগ বন্ধের কাছাকাছি পৌঁছানো।

**কাজ:**
- [ ] সব planned maps/portals, crop/item/shop, NPC/quest/event integrate।
- [ ] main story progression, onboarding/tutorial, objectives, ending/credits।
- [ ] UI screens: title, save slots/continue, inventory, map, journal/quests, settings, shop, pause।
- [ ] save version migration ও multiple device aspect ratios; corrupt/low-storage recovery।
- [ ] content validator: missing asset, duplicate ID, broken portal, invalid crop/item, blocked spawn, missing translation।
- [ ] data/content scale test: নতুন crop বা map যোগ করতে core code rewrite লাগে কি না।
- [ ] audio mix, localization pass, accessibility settings, controller remap।
- [ ] feature freeze: এই পর্যায় থেকে শুধু critical feature gap, bug ও balance; স্বপ্নের নতুন system নয়।

**Deliverables:** internal Alpha build, feature-complete checklist, known-issues list, full content/language review.  
**Pass gate:** শুরু থেকে ending পর্যন্ত খেলা যায়; কোনো P0/P1 crash, soft-lock বা save-loss নেই; content feature list complete; known bugs নথিভুক্ত।

### Phase 9 — Polish, Balance ও Device Quality

**লক্ষ্য:** content শুধু আছে নয়—বোঝা যায়, অনুভব ভালো, গরম phone-এও ব্যবহারযোগ্য।

**কাজ:**
- [ ] new-player playtest; tutorial text ও first 3 in-game days যাচাই।
- [ ] movement, tool timing, collision, hit target, animation/camera feel polish।
- [ ] economy/crop/day/time balance; idle grind বা unwinnable state test।
- [ ] hand-painted art consistency, silhouette/readability, occlusion, UI scale।
- [ ] audio mix, pause/resume, background/foreground behavior।
- [ ] crash/performance profiling; busiest farm/town/rain scene; load time ও memory।
- [ ] low/reference/high Android tier; 20–30 মিনিট thermal session; P90/P99 frame time; battery/heat observation।
- [ ] text size, safe areas, effect reduction, color contrast, controller/keyboard equivalence।
- [ ] PC profile test; console target শুধু অনুমোদিত SDK, hardware ও owner থাকলে খোলা হবে।

**Deliverables:** polish build, device matrix results, resolved P0/P1 issues, performance budgets based on measurements.  
**Pass gate:** target phones-এ stable and readable; known crash/save defects নেই; heat/performance issues-এর documented solution আছে।

### Phase 10 — Closed Beta ও Release প্রস্তুতি

**লক্ষ্য:** বাইরের খেলোয়াড়ের হাতে যাওয়ার মতো নির্ভরযোগ্য ও আইনসম্মত build।

**কাজ:**
- [ ] closed Android testing; build/signing/store track/user feedback flow।
- [ ] release candidate ও clean install/update test; save backup/migration।
- [ ] crash logs, build version, privacy/data collection disclosure।
- [ ] third-party notices, font/audio/art rights, attribution, privacy policy, age/content rating।
- [ ] store icon, screenshot, original trailer, description, supported device/OS।
- [ ] pricing/business model, support email/channel, refund/issue triage policy স্থির।
- [ ] PC port packaging আলাদা plan; console release date/availability developer program ও certification ছাড়া promise নয়।
- [ ] critical issue হলে rollout pause/rollback/patch process লিখিত।

**Deliverables:** signed release candidate, store package, legal/notice bundle, support/patch plan.  
**Pass gate:** clean install, update ও save restore pass; store/legal checklist complete; crash/save risk গ্রহণযোগ্য; release owner ও support path নির্দিষ্ট।

### Phase 11 — Launch ও post-launch

- Launch-এর পর প্রথম priority: crash, save corruption, device-specific blocker, payment/store issue (যদি থাকে)।
- Player feedback category করুন: blocker, usability, balance, content wish; সব suggestion-কে feature বানাব না।
- Patch notes/versioned builds ও save compatibility policy বজায় রাখুন।
- নতুন content/PC/console/multiplayer roadmap কেবল v1-এর বাস্তব feedback, team capacity ও business plan দেখে সিদ্ধান্ত হবে।

---

## ৭. গেমের data ও Unity architecture-এর প্রাথমিক রূপরেখা

### Code-কে ছোট ও বদলানো সহজ রাখা

প্রথমে custom “universal engine” বা generic ECS বানাব না। Unity project-এর মধ্যে game-specific modules ও পরিষ্কার ownership রাখব:

```text
_Project/
  Art/             source/export, sprites, atlases, portraits
  Audio/           music, ambience, SFX
  Data/            crops, items, NPC, quests, seasons, maps
  Scenes/          Boot, Farm, Village, tests
  Scripts/
    App/           boot, scene flow, save/settings entry
    Core/          IDs, time/calendar, shared domain state
    Gameplay/      movement, farming, inventory, interaction
    World/         map transitions, portals, NPC schedule
    UI/            HUD, dialogue, inventory, shop, settings
    Platform/      input, Android/PC adapters
    Editor/        validators/import/build helpers
  Tests/           EditMode + PlayMode tests
  Docs/            decisions, schemas, test notes
```

এটি starter structure; existing project থাকলে সেটার বাস্তবতার সঙ্গে মিলিয়ে নেব।

### Data rules

- Static definition (যেমন একটি crop কতদিনে বড় হবে): Unity `ScriptableObject` বা validated data asset।
- Player-specific runtime state (যেমন কোন cell-এ কোন crop আছে): versioned save data।
- Stable string/integer IDs; asset filename বা array order-কে save key বানানো নয়।
- Map-এর visual tile, collision, tillable soil, water, portal, interaction আলাদা layer/property।
- NPC schedule, price, season rule, dialogue key data-driven; testable logic code।
- Save schema version, migration tests, safe write/backup; static art-কে game state file বানাব না।
- Unity scene/prefab references, Addressables/streaming ইত্যাদি কেবল প্রয়োজন ও build profile মেপে বাছব; আগে থেকে complexity নয়।

---

## ৮. Art ও map pipeline

### Map তৈরির ৭টি pass

```text
1. Purpose card        : খেলোয়াড় এখানে কেন আসবে?
2. World connection    : কোথা থেকে ঢুকবে/বেরোবে?
3. Graybox             : path, scale, collision, camera, travel time
4. Gameplay data       : soil, water, NPC, portal, spawn, trigger
5. Whitebox playtest   : art ছাড়াই map পুরো খেলাযোগ্য কি?
6. Art pass            : ground → silhouette → props → foreground → VFX
7. Device/playtest     : readability, load, frame time, player confusion
```

### প্রথম art kit — পুরো world নয়

```text
Player idle/walk/tool-use
লাল soil: dry/wet/tilled/path
Grass/field edge/shallow water
শালগাছ ও bamboo clump
পুকুর edge + earthen ghat
একটি বাড়ি/খামার উঠান + একটি দোকান
২–৩ crop × কয়েক growth stage
একটি foreground canopy/roof occlusion test
```

Editable source art রেখে runtime export reproducible করব। Pivot/feet/hitbox/scale, transparent padding, atlas size, import settings ও platform texture compression লিখে রাখব। এক বিশাল full-screen bitmap-কে পুরো map pipeline বানাব না; modular painted kits, layered background ও hero illustration-এর মিশ্রণ ব্যবহার করব।

---

## ৯. Quality gates — কখন বলব phase pass করেছে?

| Gate | প্রমাণ ছাড়া pass নয় |
|---|---|
| **G0 — project/scope** | current Unity/project state, license/source list, game brief, MVP ও decision log |
| **G1 — build** | clean project open/build, Android install/run, landscape, pause/resume |
| **G2 — player feel** | touch + keyboard/gamepad action, movement/camera/collision/interaction pass |
| **G3 — map** | Farm/Village graybox, portal round trip, safe spawn, map validation |
| **G4 — farming/save** | till/seed/water/day/growth/harvest/shop/save/restart/load automated + manual test |
| **G5 — vertical slice** | new player loop বোঝে; art proof, Bengali screen test, Android device profile |
| **G6 — season/world** | six-season rules/visuals, ecology review, save transition ও performance pass |
| **G7 — Alpha** | start-to-ending playthrough, declared content complete, no blocker |
| **G8 — Beta** | outside test, update/save compatibility, store/privacy/license checklist |
| **G9 — Release** | signed package, support/rollback owner, target device and release-candidate acceptance |

### সর্বনিম্ন manual test list

- New game → Farm → Town → Farm → save → app বন্ধ → relaunch → load।
- Crop state: dry/watered/rained/grown/harvested; season পরিবর্তন; old save migration।
- Android pause/resume, lock screen, incoming call, low memory, rotation/safe area, low storage।
- Touch movement + action button একসঙ্গে; Bluetooth controller connect/disconnect; keyboard/mouse parity।
- Bangla যুক্তাক্ষর, কার-ফলা, line wrap, mixed Bangla/Latin/numbers, small screen text readability।
- Rain/effects-এর সঙ্গে busiest scene-এ দীর্ঘ play; frame time, heat, memory ও load time।
- Portal target missing, corrupted save, missing asset, repeated tap, low battery shutdown edge case।

---

## ১০. প্রধান ঝুঁকি ও কীভাবে সামলাব

| ঝুঁকি | প্রতিরোধ/প্রতিকার |
|---|---|
| Scope “Stardew-এর সব feature” হয়ে যাওয়া | MVP freeze; optional feature Later; vertical slice pass না হওয়া পর্যন্ত নতুন system নয় |
| সুন্দর art কিন্তু gameplay মজার নয় | graybox, playtest, touch feel আগে; art pass পরে |
| Android-এ heat/stutter/memory | reference + weak device profiling; camera-bound effects; mobile quality profile; measured budgets |
| বাংলা text ভুল/ভাঙা | Unity version ও chosen font-এ early proof; glyph/shaping screenshot; প্রয়োজন হলে tested solution/license |
| save নষ্ট/format বদল | schema version, migration/backup/corruption tests, safe milestones |
| culturally/geographically ভুল depiction | source audit, local reference, flora/season review, stylized fictionalization স্পষ্ট |
| asset/IP rights অস্পষ্ট | original assets, rights register, notices; Stardew files/assets/code/music ব্যবহার নয় |
| source project অজানা বা build fail | Phase 0 audit, clean baseline, one subsystem at a time |
| console scope/permission | Android-first; console dev access/SDK/owner না থাকলে date/launch promise নয় |
| Unity/editor ও code friction | ছোট changes, exact errors/logs/screenshots, reproducible test steps |

---

## ১১. কাজের চুক্তি — আমরা দুজন কীভাবে এগোব

### তোমার দায়িত্ব

- Game-এর creative direction, কোনটা ভালো/খারাপ লাগে, final approval।
- Unity project থাকলে প্রাসঙ্গিক file/share; না থাকলে new-project setup-এ সম্মতি।
- তুমি/তোমার team Unity Editor-এ build/run করে result, error log, screenshot/video দেবে।
- Real phone-এ feel, heat, text, art readability পরীক্ষা করবে।
- Purchases, licenses, team/budget/store/identity সম্পর্কে সিদ্ধান্ত দেবে।

### আমার দায়িত্ব

- Plan, scope, design specification, task order, data schemas ও acceptance criteria।
- Unity C# scripts/config/code review/test scaffolding; project files থাকলে change suggestions/patches।
- Original art direction/asset brief, map cards, UI flow, dialogue/content draft।
- তোমার report অনুযায়ী bug triage, fix proposal, iteration; সিদ্ধান্তের record update।
- অনিশ্চিত technical claim-কে test/spike দিয়ে যাচাই করার পরিকল্পনা।

### প্রতিটি কাজের ছোট cycle

```text
একটি ছোট লক্ষ্য স্থির
→ আমি task/spec/code বা asset brief দেব
→ তুমি Unity-তে run/test করবে
→ screenshot/log/কী অনুভব হয়েছে জানাবে
→ আমরা bug/feedback ঠিক করব
→ pass criteria হলে Git commit/decision log
→ পরের task
```

আমরা একবারে পুরো game generate করে ঠিক হয়ে যাবে ধরে নেব না। ছোট playable progress হবে, এবং প্রতিটি build-এ আগের কাজ ভাঙেনি তা পরীক্ষা করব।

---

## ১২. Kickoff: এখন প্রথমে কী করতে হবে?

**Confirmed:** কোনো পুরোনো Unity project/code নেই—একদম নতুন করে শুরু হবে। গেমটি Android/mobile-first; mobile-এও PC/console-এর মতো polished gameplay ও visual quality লক্ষ্য। একই game/content/art direction থাকবে, কিন্তু mobile hardware অনুযায়ী rendering scale হবে—কোনো phone-এ pixel-by-pixel 4K/console parity-এর অবাস্তব প্রতিশ্রুতি নয়।

**Available test device:** Samsung Galaxy F23; Android version ও variant পরে record করব।

**গুরুত্বপূর্ণ tool limit:** তোমার কাছে এখন শুধু Android phone। Unity Editor Android-এ চলে না, তাই Unity project বানানো/build করার জন্য PC/Mac/Linux বা remote workstation access লাগবে। Galaxy F23 হবে APK test করার device—development computer নয়। এটা গেম বাতিল করে না; শুধু workable development route ঠিক করতে হবে।

**তোমার উত্তর অনুযায়ী এখন computer/remote workstation access নেই।** তাই Unity project এখনই build করা যাবে না। গেমের direction ঠিক আছে; সামনে তিনটি বাস্তব পথ:

1. **প্রস্তাবিত — Unity-ই রাখি:** বন্ধু/পরিবার/স্কুল/কাজের shared PC-তে access খুঁজি। এর মধ্যে আমি Galaxy F23-এ browser থেকে চালানো যায় এমন ছোট touch-control prototype বানাতে পারি—এটি temporary gameplay test, final Unity game নয়।
2. **Cloud/remote PC:** স্থির internet ও keyboard/mouse-সহ remote workstation ব্যবহার; খরচ ও phone-এ editor চালানোর অসুবিধা বিবেচনা করতে হবে।
3. **Phone-editable workflow/engine নিয়ে নতুন সিদ্ধান্ত:** এটি বর্তমান Unity plan বদলাবে; সুবিধা-অসুবিধা বিচার করে আলাদা করে অনুমোদন নিতে হবে।

আমার সুপারিশ **১ নম্বর পথ**: Unity-কে final engine রেখেই আগে phone-testable prototype দিয়ে touch feel যাচাই করা, একইসঙ্গে PC access-এর ব্যবস্থা করা। শুধু phone দিয়ে design, story, UI plan ও prototype করা যাবে; কিন্তু Unity project build/APK তৈরির ধাপ computer access না পাওয়া পর্যন্ত অপেক্ষা করবে।

**তুমি কোন পথে এগোতে চাও?**

---

## ১৩. সংশ্লিষ্ট working documents

- `uploads/mobile-first-premium-cross-platform-plan.md` — বর্তমান locked Unity/Android-first/landscape/hand-painted direction-এর source of truth।
- `uploads/2d-game-project-knowledge-base.md` — project-এর vertical slice, কাজের নিয়ম ও current game context।
- `uploads/bangladesh-game-development-master-plan.md` — বাংলাদেশের world, maps, seasons, scope; পুরোনো platform/art assumption থাকলে mobile-first plan প্রাধান্য পাবে।
- `cpp-game-without-engine-premium-production-guide-bn.md` — C++ বিকল্পের technical research; Unity decision বদলায় না।
