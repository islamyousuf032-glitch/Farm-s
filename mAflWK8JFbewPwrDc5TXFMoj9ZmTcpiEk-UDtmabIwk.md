# পূর্ণ গেম ইঞ্জিন ছাড়া C++-এ উচ্চমানের 2D গেম
## গবেষণা, প্রযুক্তি নির্বাচন ও production guide

**গবেষণার snapshot:** ১২ অক্টোবর ২০২৬  
**নথির ধরন:** সংযুক্ত প্রকল্প-গবেষণা + বর্তমান প্রাথমিক প্রযুক্তিগত নথির synthesis  
**এই নথির রায়:** প্রকল্পটি সত্যিই C++-এ নেওয়া হলে, শুরু করুন **SDL3 + SDL_Renderer + ছোট project-specific C++ runtime** দিয়ে। `bgfx` হবে প্রমাণিত প্রয়োজনের পরের বিকল্প—প্রথম দিনের বাধ্যতামূলক dependency নয়।  
**গুরুত্বপূর্ণ:** এটি বর্তমান Unity সিদ্ধান্তকে নিজে থেকে বাতিল করে না।

---

## ১. এক পাতায় সিদ্ধান্ত

বাংলাদেশ-অনুপ্রাণিত top-down farming/life-sim RPG—হাতে আঁকা storybook art, Android-first landscape, পরে PC/console—এর জন্য “engine ছাড়া C++” পথটি সম্ভব, কিন্তু Unity-র বিকল্প হিসেবে এটি **কম কাজের পথ নয়**। এতে editor, scene system, asset importer, game UI, animation runtime, save system, platform packaging, profiling এবং বহু device-এ যাচাইয়ের দায় নিজের দলে নিতে হবে। C++ নিজে থেকেই 60 FPS, কম memory, console certification বা দ্রুত development নিশ্চিত করে না।

### C++ পথ বেছে নিলে আমার সুপারিশ

```text
C++20
+ CMake (CMakePresets.json)
+ SDL3 (window, events, touch/controller input, Android lifecycle)
+ SDL_Renderer (প্রথম 2D renderer)
+ SDL3_ttf, সঙ্গে FreeType + HarfBuzz সক্রিয় ও যাচাইকৃত
+ miniaudio (প্রাথমিক game audio)
+ Tiled JSON → নিজস্ব validator/importer → game data
+ CTest + একটি unit-test framework
+ Android NDK + Gradle packaging
+ ছোট, game-specific runtime; সাধারণ উদ্দেশ্যের “নিজস্ব engine” নয়
```

### Rendering-এর সিদ্ধান্ত

- **এখনকার art/gameplay scope-এর জন্য default:** SDL3 `SDL_Renderer`। 2D texture, geometry, blend/tint ও simple render-target কাজের জন্য এটি কম ঝুঁকির, কম plumbing-এর পথ। SDL-এর নথি এই API-কে সহজ 2D operation ত্বরান্বিত করার জন্যই বর্ণনা করে; আরও বিস্তৃত programmable GPU feature চাইলে অন্য graphics API ব্যবহারের কথা বলে। [1](https://wiki.libsdl.org/SDL3/CategoryRender)
- **শর্তসাপেক্ষ বিকল্প:** `bgfx`—যদি ছোট “painted farm + rain + water + lighting + UI” tech-spike দেখায় যে কাস্টম shader, একাধিক render pass, বা আরও নমনীয় GPU control সত্যিই প্রয়োজন। bgfx নিজেকে “Bring Your Own Engine/Framework” renderer বলে; এটি scene graph, map editor, UI, audio বা game rules দেয় না। [1](https://github.com/bkaradzic/bgfx)
- **Android-first একমাত্র renderer হিসেবে SDL_GPU দিয়ে শুরু করব না:** SDL-এর FAQ বলে SDL_GPU-এর backend-গুলো Vulkan, Metal, D3D12—OpenGL নয়—এবং Android-এ এর support/feature reach এখনও সীমিত হতে পারে। [1](https://wiki.libsdl.org/SDL3/FAQDevelopment)
- **শুরুতেই raw Vulkan/Metal/D3D12 নয়।** একটি 2D farming game-এর জন্য বহু native GPU backend নিজে লেখা ও রক্ষণাবেক্ষণ করা সাধারণত অতিরিক্ত ঝুঁকি।

### প্রকল্প-সিদ্ধান্ত আলাদা রাখুন

সংযুক্ত project plan-এ **Unity 6.3 LTS, Android-first, landscape, ৩–৪ বছরের mid-range Android baseline, hand-painted 2D storybook direction, এবং PC/console parity by design**-কে বর্তমান সিদ্ধান্ত হিসেবে লেখা আছে। তাই এই C++ guide-কে **বিকল্প architecture study** হিসেবে ধরতে হবে—project direction বদলের অনুমতি হিসেবে নয়। C++-এ স্থানান্তরের সিদ্ধান্ত নিলে সেটি তারিখ, কারণ, ঝুঁকি এবং প্রমাণসহ আলাদা decision log-এ লিখতে হবে।

---

## ২. সংযুক্ত গবেষণা থেকে যে project contract এখানে রাখা হয়েছে

আপলোড করা ১৮টি Markdown নথির মধ্যে বিশেষ করে project knowledge base, mobile-first plan, Unity PC/console foundation, Bangladesh game master plan, map production playbook, map-creation research, seasons/ecology, visual direction, asset/animation research এবং Stardew research/optimization report—এই guide-এর scope নির্ধারণ করেছে। সেগুলোর প্রাসঙ্গিক সিদ্ধান্তগুলো:

1. **গেমের পরিচয়:** বাংলাদেশ-অনুপ্রাণিত 2D farming + life simulation + light exploration RPG; কাল্পনিক Gazipur–Madhupur পরিবেশ, লাল চালা, বাইদ, শালবন, বাঁশঝাড়, পুকুর-ঘাট এবং ছয় ঋতুর অভিজ্ঞতা। ছয় ঋতু: গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত, বসন্ত।
2. **Visual direction:** hand-painted 2D storybook; mobile-এ readable, সুন্দর, স্থিতিশীল—visual effect-এর সংখ্যা বাড়ানোই quality নয়।
3. **Platform contract:** landscape touch-first Android; keyboard/mouse ও gamepad একই action model ব্যবহার করবে; content ও gameplay একই রেখে platform অনুযায়ী rendering/performance profile বদলাতে পারে।
4. **Production order:** অধিকার ও source audit → player feel → graybox → ছোট playable loop → playtest → art pass → optimization → expansion। পুরো final map বা final art দিয়ে শুরু নয়।
5. **Vertical-slice nucleus:** Farm-এ spawn → মাটি/seed/water interaction → Town-এ যাওয়া → NPC/shop interaction → ফিরে আসা → save/reload-এ state অক্ষত থাকা।
6. **Data contract:** map art মানেই collision বা farming rule নয়; soil, collision, portal, crop, NPC এবং quest data আলাদা ও যাচাইযোগ্য হবে। Map transition-এ raw coordinate-এর বদলে `mapId + entryId` ব্যবহার হবে।
7. **Scope discipline:** প্রথম playable version-এ ১–২টি ছোট map, ৩টি crop, অল্প NPC, basic day/calendar/weather এবং save/load; multiplayer, procedural infinite world, বড় dungeon বা একসঙ্গে সব console—পরে।
8. **আইনি শৃঙ্খলা:** code, font, sound, texture, plug-in—প্রতিটির source, license, version ও notice রেকর্ড করতে হবে। কোনো বিদ্যমান MMORPG source বা asset-এর reuse right নিশ্চিত না হলে প্রকাশযোগ্য game-এ ঢোকানো যাবে না।

সংযুক্ত নথিতে থাকা নির্দিষ্ট FPS, memory, price, studio pipeline বা legal assertion-কে এখানে স্বয়ংক্রিয়ভাবে প্রমাণিত সত্য ধরা হয়নি। সেগুলো implementation-এ ব্যবহার করতে হলে primary source, license review বা প্রকৃত device profile দিয়ে পুনরায় যাচাই করতে হবে।

---

## ৩. “Game engine ছাড়া” বলতে কী বোঝায়

**No full game engine ≠ কোনো framework/library নেই।** SDL3 একটি platform/media library; SDL_Renderer একটি simple 2D rendering API; bgfx একটি lower-level cross-platform renderer। এগুলোর কোনোটিই সম্পূর্ণ farming-RPG engine নয়।

C++ game team-কে নিচেরগুলো নিজে বানাতে বা ছোট library দিয়ে জোড়া লাগাতে হবে:

- game state, scene/map transitions, camera, sprite ordering ও culling;
- texture/animation asset catalogue, import/export ও content validation;
- collision/interaction, input mapping, UI, dialogue, inventory, NPC schedule;
- game clock, calendar, crops, weather, economy, save schema/migration;
- audio policy, localization/text layout, Android lifecycle, file path;
- debug tools, profiling, build/signing/package, crash reporting ও release QA।

**সঠিক লক্ষ্য “নিজস্ব engine” বানানো নয়; নিজের game-এর যতটুকু দরকার ততটুকু runtime বানানো।** Generic scripting language, visual scene editor, plugin system, universal ECS, general animation suite বা cross-platform renderer framework—প্রতিটিই scope, schedule ও maintenance বাড়ায়। Game content-এ বারবার দরকার না হলে এগুলো বানাবেন না।

---

## 4. Renderer: SDL_Renderer, bgfx, SDL_GPU—কোনটি কখন?

| পথ | কী দেয় | সুবিধা | মূল ঝুঁকি | এই প্রকল্পে সিদ্ধান্ত |
|---|---|---|---|---|
| **SDL3 + SDL_Renderer** | 2D texture/geometry, blend, tint, simple render target | সবচেয়ে সরল; SDL app/input/lifecycle-এর সঙ্গে একই stack; 2D-তে দ্রুত prototype | নিজস্ব programmable material/shader pipeline নয়; API call main thread-এ; platform driver বাস্তব device-এ পরীক্ষা করতে হবে | **প্রথম পছন্দ**; art ও gameplay-এর মান যদি এই API-তে ওঠে, এখানেই থাকুন |
| **SDL3 + bgfx** | multi-backend GPU renderer, shader/resource/draw submission | custom shader ও render pass; GLES/Vulkan/Metal/D3D ইত্যাদির জন্য এক API; native GPU API নিজে লিখতে হয় না | bgfx পূর্ণ engine নয়; নিজস্ব sprite batching/2D runtime লাগে; shader toolchain, build ও SDL native-window integration-এর আলাদা কাজ | শুধু feature spike-এ প্রয়োজন প্রমাণিত হলে নিন |
| **SDL3 SDL_GPU** | explicit modern GPU API (Vulkan/Metal/D3D12 backend) | নিচু স্তরের control | Android compatibility/required feature floor এবং OpenGL backend না থাকাটা Android-first coverage-এ ঝুঁকি | device matrix Vulkan-এ pass না করা পর্যন্ত primary renderer নয় |
| **Raw Vulkan/Metal/D3D12/OpenGL** | native graphics API | সর্বোচ্চ control | native backend, shader, swapchain ও resource lifetime নিজে তৈরি ও maintain করতে হবে | এই 2D project-এ শুরুতেই করবেন না |

### কেন SDL_Renderer-কে প্রথম default বলছি

গেমের বর্তমান art direction-এ perceived premium quality আসবে composition, palette, hand-painted props, character readability, animation timing, camera, sound, UI এবং frame pacing থেকে—প্রতি pixel-এ dynamic shader lighting থাকা বাধ্যতামূলক নয়। SDL3-এর 2D API textured image, 2D polygon, alpha/additive blend, tint ও scale-এর মতো operation লক্ষ্য করে; এর official docs আরও জটিল particle/3D/GPU effect-এর জন্য অন্য graphics interface নেওয়ার কথা বলে। [1](https://wiki.libsdl.org/SDL3/CategoryRender)

এই project-এর প্রথম renderer-এ তাই:

- shadow ও ambient mood-এর বেশির ভাগ হবে painted/baked art বা simple overlay;
- rain, leaf, firefly, splash হবে সীমিত sprite particle;
- lighting হবে অল্পসংখ্যক দৃশ্যমান effect—সব prop-এ real-time light নয়;
- painterly water/season look প্রথমে art layer + simple tint/particle দিয়ে পরীক্ষা হবে;
- UI text এবং sprite একই frame-এ render হবে; world, foreground canopy ও UI-এর order স্পষ্ট থাকবে।

### bgfx নেওয়ার trigger লিখে রাখুন

নিচের কোনো requirement vertical-slice test-এ সত্যি বাধা হলে bgfx spike নিন:

1. জল, wet-ground, day/night বা fog-এর জন্য repeatable custom fragment shader জরুরি;
2. বহু render target/pass বা বড় সংখ্যার custom material দরকার;
3. SDL_Renderer-এ acceptable device-এ লক্ষ্য visual/performance profile পাওয়া যাচ্ছে না;
4. team-এর অন্তত একজন bgfx shader/build integration-এর owner হতে পারবেন।

bgfx-এর public README-তে D3D11/12, Metal, OpenGL, OpenGL ES, Vulkan, WebGL/WebGPU-সহ backend তালিকা আছে, তবে তালিকা version অনুযায়ী বদলাতে পারে—প্রকৃত প্রকল্পে pinned revision-এর README/build/test-ই চূড়ান্ত কর্তৃত্ব। [1](https://github.com/bkaradzic/bgfx) Official build docs bgfx-এর `bx` ও `bimg` dependency, default GENie build path, Android prerequisite এবং alternative CMake routes বর্ণনা করে। Shader code-ও build time-এ `shaderc` দিয়ে target variant-এ compile করতে হয়। [1](https://bkaradzic.github.io/bgfx/build.html) [1](https://bkaradzic.github.io/bgfx/tools.html)

SDL3 window handle থেকে bgfx-এ platform data পাঠানোর কিছু public example আছে, কিন্তু পাওয়া SDL3 example unofficial এবং platform-specific; সেটি feasibility clue, production integration নির্দেশিকা নয়। Windows, Android ও অন্য প্রতিটি target-এ native handle, context/swapchain ownership, resize, pause/resume ও device reset আলাদা করে যাচাই করুন। [1](https://gist.github.com/ShogunateTM/87947e63ccb8ae273c85fbfc5f6f03b0)

### Renderer বদলের খরচ কমানোর seam

`GameCore`-কে `SDL_Renderer*`, `SDL_Texture*` বা bgfx handle-এর উপর নির্ভরশীল করবেন না। Game side থেকে stable `AssetId`, `SpriteCommand`, `Camera2D`, `BlendMode` এবং logical target size submit করুন। renderer নিজেই backend-specific texture/program handle রাখবে। তবু দুই renderer implementation আগে থেকে লিখবেন না—এটি abstraction contract রাখার উপায়, কাজ দ্বিগুণ করার অনুরোধ নয়।

---

## ৫. প্রস্তাবিত library/tooling stack

| কাজ | প্রস্তাব | নির্দেশনা |
|---|---|---|
| ভাষা | **C++20** | এক standard-এ lock করুন; অতিরিক্ত template/metaprogramming নয়; plain structs, value types, `std::vector`, `std::string`, RAII ব্যবহার করুন। |
| Platform/input/window | **SDL3** | event loop, Android lifecycle, touch, keyboard, controller, file/time/window abstraction; SDL3-এর CMake docs Android, Windows, macOS, iOS-সহ বহু target নিয়ে আলোচনা করে। [5](https://wiki.libsdl.org/SDL3/README-cmake/raw) |
| 2D rendering | **SDL_Renderer** | প্রথম renderer. Renderer operation main thread-এ রাখুন; worker-এ file read/decode করা যায়, কিন্তু texture upload/render call-এর thread rules মানুন। [1](https://wiki.libsdl.org/SDL3/CategoryRender) |
| Audio | **miniaudio** | low-level device-এর পাশাপাশি high-level sound/mix/resource API আছে; official repo desktop ও mobile platform support বর্ণনা করে। Short SFX preload, বড় music stream; audio callback-এ blocking I/O, allocation বা log নয়। [1](https://github.com/mackron/miniaudio) |
| Font/text | **SDL3_ttf + FreeType + HarfBuzz** | SDL_ttf FreeType/HarfBuzz wrapper; FreeType glyph rasterize করে, HarfBuzz Unicode text shape করে। chosen build/package-এ HarfBuzz সক্রিয় কিনা runtime/build summary দিয়ে নিশ্চিত করুন। [2](https://wiki.libsdl.org/SDL3_ttf) [1](http://freetype.org/) [3](https://harfbuzz.github.io/) |
| Map authoring | **Tiled → JSON** | orthogonal map, tile/object/layer data এবং typed custom property; C++-এ ছোট importer/validator লিখুন। [1](https://doc.mapeditor.org/en/stable/reference/json-map-format/) [4](https://doc.mapeditor.org/en/stable/manual/custom-properties/) |
| Physics/collision | **নিজস্ব tile/AABB interaction প্রথমে** | top-down cozy RPG-তে player vs solid cell, interaction radius, water/path query প্রায়ই যথেষ্ট; পরে dynamic rigid-body দরকার হলে Box2D বিবেচনা করুন। বর্তমান Box2D 3.x C17 API—C++ project থেকে ব্যবহার করা যায়, কিন্তু এটিকে আধুনিক C++ API ধরে নেবেন না। [1](https://box2d.org/documentation/md_faq.html) |
| Build | **CMake + CMakePresets.json** | Windows/Android config আলাদা preset/toolchain-এ; এক build tree-তে target platform মেশাবেন না। |
| Dependency manager | **vcpkg manifest mode** অথবা pinned vendored source | একটিই বাছুন; manifest/baseline/commit pin করুন; Android triplet ও port compatibility আগে যাচাই করুন। vcpkg-এর official docs Android build এবং version baseline বর্ণনা করে। [1](https://learn.microsoft.com/en-us/vcpkg/users/platforms/android) [2](https://learn.microsoft.com/en-us/vcpkg/get_started/overview) |
| Tests | **Catch2 + CTest** | CTest test চালানো/ফল report করার driver; CTest integration-এর বাইরে game logic framework নিজে দেয় না। [3](https://cmake.org/cmake/help/latest/guide/tutorial/Testing%20and%20CTest.html) |
| Debug UI | Dear ImGui বা নিজস্ব debug overlay (dev build only) | tool/debug UI; shipping game UI হিসেবে অন্ধভাবে ব্যবহার নয়। |
| Diagnostics | `SDL_Log`/structured project logger, `clang-format`, `clang-tidy`, desktop ASan/UBSan | diagnostic build/CI-তে; release build আলাদা করে profile করুন। |

**নির্ভরতা কম রাখুন।** শুরুতেই ২০টি library যোগ করে integration project বানাবেন না। First slice-এ SDL3, font/audio, JSON/map importer ও tests যথেষ্ট। HTTP/network, scripting, ECS, animation middleware, custom shader framework বা generic asset database—gameplay need তৈরি হলে সিদ্ধান্ত নিন।

---

## ৬. Game architecture: ছোট, পরিষ্কার, testable

### প্রস্তাবিত স্তর

```text
SDL3 / Android shell
  ├─ events, lifecycle, touch/controller/keyboard
  ├─ clock, window, file paths, application entry point
  └─ build/package boundary
           │ ActionFrame / elapsed time
           ▼
GameCore (SDL header ছাড়া)
  ├─ Player, map state, collision/interaction rules
  ├─ Calendar, crops, inventory, economy, quests, NPC rules
  ├─ stable IDs, game events, save/load model
  └─ deterministic tests
           │ render DTOs / audio events / save request
           ▼
Project services
  ├─ Renderer (first SDL_Renderer; optional future bgfx)
  ├─ Asset catalogue + animation playback
  ├─ miniaudio AudioService
  ├─ Tiled importer/content validator
  └─ SaveService + localization/UI
```

### Dependency direction

- `core/` SDL, OpenGL, Android Java/JNI, file dialog বা GPU header include করবে না।
- SDL events-কে `Move`, `Interact`, `UseTool`, `QuickSlot`, `OpenInventory`, `Pause`-এর মতো project action-এ normalize করুন।
- art sprite-এর নাম বা tile index দেখে game rule অনুমান করবেন না; `isTillable`, `solid`, `water`, `portalId` explicit data হবে।
- renderer-এর কাজ draw; crop growth, item sale, season transition বা quest completion-এর নিয়ম তার নয়।
- `Entity` দরকার হলে plain struct/generational ID দিয়ে শুরু করুন। প্রয়োজনের আগে generic ECS, reflection বা universal scripting system নয়।

### একটি বাস্তবসম্মত folder skeleton

```text
/CMakeLists.txt
/CMakePresets.json
/vcpkg.json                 # vcpkg নিলে; baseline commit-সহ
/src/app/                   # entry point, lifecycle, top-level state
/src/core/                  # pure game rules; SDL-free
/src/platform/sdl/          # SDL adapters, input, Android integration
/src/render/sdl2d/          # camera, sprite submit, render order
/src/audio/                 # miniaudio adapter + sound categories
/src/content/               # Tiled JSON importer, asset IDs, validators
/src/ui/                    # dialogue, inventory, menus, HUD
/tools/map_validate/        # headless content lint/compile command
/tests/core/                # calendar, crops, inventory, save migration tests
/assets/source/             # layered editable originals
/assets/maps/               # Tiled source maps + tilesets
/assets/runtime/             # generated runtime assets; source নয়
/docs/decisions/            # dated architecture and content decisions
/THIRD_PARTY_NOTICES.md
```

### C++ resource lifetime

SDL window/renderer/texture, file, audio device, mutex—যে resource acquire/release pair চায়—সেগুলো ছোট RAII wrapper-এর destructor-এ clean up করান। Ownership স্পষ্ট রাখুন: raw pointer/reference মানে non-owning; owning resource সাধারণত scope/`unique_ptr`-এর অধীনে। SDL texture যেন তার renderer-এর পরে destroy না হয়, সে destruction order test করুন। C++ Core Guidelines-ও resource handle/RAII ও ownership স্পষ্ট করার পরামর্শ দেয়। [1](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)

---

## ৭. Game loop ও simulation-এর contract

**Display frame, player movement, physics এবং in-game calendar—চারটি আলাদা clock.** 60 Hz render মানেই প্রতি render frame-এ season/crop state update নয়।

1. SDL event poll করে frame-এর `ActionFrame` বানান। Touch, keyboard ও gamepad একই action map-এ যাবে। SDL touch coordinate normalized (সাধারণত 0–1 range), তাই safe area, logical viewport এবং letterbox/scaling-এর সঙ্গে রূপান্তর করুন। [1](https://wiki.libsdl.org/SDL3/README-touch)
2. `std::chrono::steady_clock`-এর elapsed time দিয়ে render/update timing মাপুন; user-এর system date বদলালে in-game calendar বদলাবে না।
3. movement/collision-এ স্থির update interval (যেমন 1/60 s) ব্যবহার করে শুরু করা যায়; simple prototype-এ capped variable `dt`-ও মাপা যেতে পারে। কোনটি নেবেন player movement, wall sliding ও touch response test-এ প্রমাণ করুন। Render rate ও game update-কে আলাদা রাখুন; বড় pause/debugger stall-এর পরে অসীম catch-up step চলতে দেবেন না।
4. interpolation শুধু visual transform-এর জন্য; persistent state বা inventory update-এর জন্য নয়। UI animation আলাদা frame-time path-এ থাকতে পারে।
5. দিন শেষ/ঘুম/ফসল পরিবর্তনের মতো farming rule একটি domain event: `advance_day()` একবার চালান; crop logic-কে 60 বার/সেকেন্ড চালাবেন না। ছয় ঋতুর calendar ও local ecology data-driven হবে।
6. random event-এ testable seed রাখুন; save-এ versioned game state লিখুন—GPU texture, screen coordinate বা render handle নয়।

SDL_Renderer-এর rendering operation main thread-এ হওয়ার rule থাকায় worker thread-এ map/image/audio read বা CPU decode করলেও render API call আলাদা main-thread queue-তে পাঠান। [1](https://wiki.libsdl.org/SDL3/CategoryRender)

---

## ৮. Map, content ও hand-painted art pipeline

### Map authoring

Tiled JSON-কে authoring/source format করুন; runtime-এ editor-এর সব feature সমর্থন করার চেষ্টা নয়। প্রথম map preset-এ layer ও object contract স্থির করুন:

```text
Ground_Base          visual terrain
Ground_Detail        visual variation
Collision            solid/water/path-block metadata
Soil_Farming          tillable / planted-cell anchors
Interaction           door, tool target, sign, harvestable object
Actors                player entry, NPC placement, schedule tag
Above_Player          roof/canopy/foreground occlusion
Weather_FX            optional visual-only foreground effects
```

Object/custom property-তে stable value রাখুন, যেমন `mapId`, `entryId`, `targetMapId`, `targetEntryId`, `entityId`, `cropDefId`, `isTillable`, `collisionGroup`. Tiled-এর JSON format property type এবং map/layer/object metadata ধরে রাখতে পারে। [1](https://doc.mapeditor.org/en/stable/reference/json-map-format/) [4](https://doc.mapeditor.org/en/stable/manual/custom-properties/)

**Portal rule:** `portalId → targetMapId + targetEntryId`; coordinates hard-code করে বহু scene-এ ছড়াবেন না। **Save rule:** crop/soil runtime state `mapId + cellCoord` দিয়ে সংরক্ষণ; source map-এর static art file-এ player-এর পরিবর্তিত game state লিখবেন না।

### Content validator

Build/CI-তে headless `map_validate` command চালিয়ে অন্তত এগুলো পরীক্ষা করুন:

- required layer আছে; layer নাম/meaning project schema-র সঙ্গে মেলে;
- map, object, entry, NPC, crop ID duplicate নয়;
- portal-এর target map/entry আছে;
- collision/soil layer valid cell-এর সঙ্গে মেলে;
- referenced art, animation, text key, crop/item definition missing নয়;
- map boundary-তে player আটকে যায় না; object/pivot coordinate ভুল নয়।

Tiled source ছাড়াও normalized project map data-তে version ও importer version রাখুন। Developer build-এ source JSON parse করলেও shipping build-এর আগে validate/pack করলে malformed data-তে game crash কমে।

### Art/animation workflow

- layered editable source-কে canonical রাখুন; exported PNG/atlas runtime output.
- ছোট graybox → 1-screen “Gazipur farm micro-scene” → touch readability → rain/water/lighting test → art bible lock → content expansion.
- player/NPC/trees/houses-এ pivot, foot point, hitbox, shadow, occlusion rule art handoff-এ লিখুন.
- painted prop-এর image bounds collision bounds নয়; collision geometry আলাদা.
- atlas, transparent edge padding, frame pivot, animation clip, asset ID auto-generated manifest-এ validate করুন.
- camera view-এর বাইরে map পুরো draw করবেন না; current location এবং camera-visible tile/prop cull করুন. Static world, animated actors, foreground canopy ও UI draw order আলাদা রাখুন.
- huge uncompressed full-screen image-কে default content format করবেন না. Resolution variants/texture compression/atlas size device-এ memory ও quality profile মেপে ঠিক করুন. KTX2/Basis Universal GPU texture packaging-এর সম্ভাব্য option, কিন্তু SDL_Renderer-এ এটি direct/portable upload path ধরে নেবেন না—প্রথমে renderer ও driver-এ compatibility প্রমাণ চাই। [3](https://github.com/KhronosGroup/KTX-Specification)
- quality profile-এ same art direction রেখে rain density, fog/overlay layer, resolution ও map-memory আলাদা করা যায়; gameplay/data/save আলাদা করা যাবে না.

### Animation ও physics scope

First slice-এ 4/8-direction idle/walk, tool swing এবং interaction-এর ছোট frame-based clip যথেষ্ট। Art team skeletal/cutout rig বেছে নিলে runtime/export format ও license আগে স্থির করুন; SDL নিজে complete 2D animation authoring/runtime দেয় না।

Player-এর wall collision, crop cell targeting, trigger, portal ও interaction distance আগে grid/AABB/query দিয়ে করুন। সত্যিকারের joint/rigid-body simulation দরকার হলে Box2D 3.x evaluate করুন; current API C17। [1](https://box2d.org/documentation/md_faq.html)

---

## ৯. Save, Bengali text, input ও audio

### Save ও crash safety

Save data-তে stable ID ও domain state রাখুন:

```text
saveVersion, mapId, entryId, player position/inventory,
calendar day + six-season state, crop cells, unlocked portals,
quest/dialogue flags, settings, RNG seed (যদি প্রাসঙ্গিক)
```

- প্রতিটি save-এ `saveVersion`; schema বদলালে migration/test.
- save serialize করে temporary file-এ লিখুন; flush ও platform-appropriate atomic replace-এর পরে আগের valid backup রাখুন। Android suspend বা process kill-এ শুধু `onPause`/exit callback-এর উপর নির্ভর করবেন না; safe milestone-এ autosave, map/day transition-এ checkpoint, startup-এ corruption fallback দিন.
- save path, asset path ও packaged APK asset এক জিনিস নয়; SDL/Android-এর উপযুক্ত writable preference path ব্যবহার করুন.
- test: save → process বন্ধ → restart → load; পুরোনো save version migration; truncated/corrupt save; low-storage/write failure.

### বাংলা text rendering

বাংলা UI/dialogue-কে “Unicode codepoint একে একে font-এ আঁকা” পদ্ধতিতে করবেন না। Bengali যুক্তাক্ষর, কার/ফলা ও glyph placement-এর জন্য OpenType shaping দরকার; HarfBuzz shaped glyph sequence/position দেয়, FreeType glyph image rasterize করে। SDL_ttf FreeType/HarfBuzz wrapper, কিন্তু packaged SDL_ttf-তে HarfBuzz সত্যিই build হয়েছে কি না যাচাই করতে হবে। [2](https://wiki.libsdl.org/SDL3_ttf) [1](http://freetype.org/) [3](https://harfbuzz.github.io/)

Release gate-এ real font দিয়ে অন্তত এই screenshot/copy test রাখুন: `বাংলা`, `কৃষি`, `ক্ষেত`, `বৃষ্টি`, `শালবন`, `শ্রাবণ`, `গ্রীষ্ম`, যুক্তাক্ষর/কারের সংমিশ্রণ, line wrap, punctuation, Bengali + Latin/number, save/load-এর পর text। HarfBuzz shaping করলেও line-breaking, font fallback, grapheme handling ও complete UI layout পুরোপুরি স্বয়ংক্রিয় হয় না—এসব project text service-এ পরীক্ষা করুন। Font file-এর license/embedding rights notices-এ রাখুন।

### Input/UI

- `ActionFrame`: `Move`, `Interact`, `UseTool`, `QuickSlot1–N`, `OpenInventory`, `Pause` ইত্যাদি.
- SDL finger ID track করুন; multi-touch joystick + action button একসঙ্গে কাজ করে কি না test.
- interaction zone-এ object highlight/prompt দেখান; tool target visual ও hitbox আলাদা হলেও একই gameplay data থেকে আসুক.
- landscape safe area, ছোট phone aspect ratio, in-game readable font, thumb reach, accidental expensive-item tap confirmation পরীক্ষা করুন.
- input latency, camera response ও menu feedback—সবই quality gate; controller/keyboard/touch একই rule চালাবে.

### Audio

miniaudio high-level engine/resource manager দিয়ে ambient loop, music, SFX category, volume, fade/crossfade ও pause/resume layer করুন। Audio callback-এ lock/block বা filesystem read নয়; long music stream করুন, ছোট SFX preload করুন। ফোন background-এ গেলে game clock/ambience policy থামান এবং audio focus/lifecycle test করুন। Library version/license এবং decoder configuration release notice-এ লিখুন। [1](https://github.com/mackron/miniaudio)

---

## ১০. Android, PC ও console বাস্তবতা

### Android-first native build

SDL Android build-এ C/C++ code Java Activity shim/Gradle app-এর ভিতরে চলে; “C++ app” হলেও Android manifest, Gradle, NDK, signing, app bundle/APK assets ও store requirements থেকে মুক্তি নেই। SDL-এর current official Android README snapshot-এ SDK **35+**, NDK **r28c+**, এবং SDL minimum API level **21** বলা আছে; এটি framework-এর minimum, project-এর promised device floor বা current store target API নয়। প্রতিটি release-এ latest SDL README ও Google Play requirement আবার যাচাই করুন। [1](https://wiki.libsdl.org/SDL3/README-android)

SDL-এর lifecycle note-এ background/foreground, low-memory, render API বন্ধ রাখা এবং render device reset/resource recreation handle করার কথা আছে। App call/lock screen/background/return/low-memory/recreate test ছাড়া Android release gate pass নয়। Autosave policy আগে বানান; suspend event-এ expensive save শেষ হবে ধরে নেবেন না। [1](https://wiki.libsdl.org/SDL3/README-android)

**Device matrix এখনই লিখুন:**

| Tier | কে প্রতিনিধিত্ব করবে | কী মাপবেন |
|---|---|---|
| নিম্ন/পুরনো supported | actual minimum phone/OS/GPU | load, memory, touch input, low-memory, stable frame-time |
| project baseline | গত ৩–৪ বছরের mid-range reference Android | 60 FPS target scene, map transition, 20–30 মিনিট thermal run |
| high tier | recent higher-end phone | higher refresh-rate pacing, upscale art/profile, heat/battery |
| PC | প্রথম supported OS/controller/keyboard | input parity, save path, resolution/aspect, release packaging |
| console | licensed target + development kit থাকলে | SDK integration, native input/save/store/certification requirements |

Device model না ঠিক করে “mid-range” বা “60 FPS”কে testable target ধরা যায় না। Project plan-এ 60 FPS target থাকলেও frame-time distribution, long-play heat, battery ও low-tier profile দিয়ে তা প্রমাণ করুন। Android performance documentation average FPS-এর পাশাপাশি P90/P99 frame rate/frame time দেখার গুরুত্ব বোঝায়; Android Performance Analyzer-কে বর্তমান profiling flow-এর recommended tool হিসেবে নির্দেশ করা হয়েছে। [3](https://developer.android.com/games/optimize/framerate) [5](https://developer.android.com/android-performance-analyzer/analyze/frame-times)

Android Frame Pacing library (Swappy) OpenGL/Vulkan game-এর presentation synchronization, variable refresh rate ও pacing-এর জন্য; SDL_Renderer বা bgfx-এর সঙ্গে এটি drop-in ভাবে কাজ করবে ধরে নেবেন না। renderer/window-swap integration compatibility ও input latency বাস্তব device-এ spike করে নিন। [1](https://developer.android.com/games/sdk/frame-pacing)

### PC ও console

- Windows/PC release-এর জন্য CMake build, controller mapping, save path, high-DPI/logical resolution, install/update, crash log ও redistributable packaging আলাদা test করুন.
- `SDL3`-এর platform list-এ কিছু console port আছে, কিন্তু PlayStation/Switch port আলাদা NDA-only fork; Xbox GDK-এর জন্য licensed developer access প্রয়োজন। C++ বা bgfx README-তে platform নাম থাকা console shipping guarantee নয়। SDK access, platform-holder agreement, native services, certification/TRC/TCR, save/cloud/store, input, graphics integration—সব আলাদা plan ও budget। [1](https://wiki.libsdl.org/SDL3/README-platforms) [2](https://wiki.libsdl.org/SDL3/README-switch) [4](https://wiki.libsdl.org/SDL3/README-ps5) [5](https://wiki.libsdl.org/SDL3/README-gdk)
- এক codebase/world/content/save format রাখুন; controller mapping, compression, resolution, effect density ও platform boot/package আলাদা adapter/config-এ রাখুন.
- প্রথম production target Android + একটি PC platform; console access/target না থাকলে “console parity”কে architecture goal বলুন, shipping commitment নয়.

---

## ১১. Build, dependency pinning, license ও security

### Build/dependency workflow

1. `CMakeLists.txt`-এ targets ও component boundary; build flags target-local.
2. `CMakePresets.json`: desktop Debug/Release, Android arm64 Debug/Release, test/tool preset.
3. `vcpkg.json` manifest mode নিলে `builtin-baseline`/version pins source control-এ রাখুন; package upgrade আলাদা PR/decision. Android triplet/build support আগে confirm; সব console target-এ vcpkg আছে ধরে নেবেন না। [1](https://learn.microsoft.com/en-us/vcpkg/users/platforms/android) [3](https://learn.microsoft.com/en-us/vcpkg/users/examples/versioning.getting-started)
4. bgfx নিলে `bgfx`, `bx`, `bimg`, wrapper/tool versions hash/tag দিয়ে pin; `shaderc` build output/artifact-এর সঙ্গে ship, runtime compile নয়। SDL3/bgfx integration-এর exact window handle/graphics context ownership target device-এ prove করুন.
5. `CTest`-এ pure core, map validator, save migration ও integration test register করুন। Build/test system-এ test driver থাকাই test coverage-এর বিকল্প নয়। [3](https://cmake.org/cmake/help/latest/guide/tutorial/Testing%20and%20CTest.html)
6. desktop Debug-এ AddressSanitizer/UndefinedBehaviorSanitizer চালান; concurrency যোগ করলে race test; release build বাস্তব phone-এ profile.
7. CI clean clone থেকে অন্তত Windows build/test ও Android arm64 build; content validator, license manifest, third-party notices fail করলে release block করুন.

### License/ownership policy

`THIRD_PARTY_NOTICES.md`-এ library name, upstream URL, exact version/commit, license file, local patch এবং shipped binary list লিখুন। SDL, bgfx, SDL_ttf, miniaudio, fonts, art/audio, test fixture, shader compiler—সব আলাদা audit করুন; library permissive বলেই তার transitive library/asset automatically approved নয়। Dependency update-এর সঙ্গে security advisory ও license diff দেখুন।

Unknown MMORPG source/asset reuse বা license-এর ব্যাখ্যা game release-এর আইনি নিশ্চয়তা নয়; rights ambiguity থাকলে source audit ও qualified legal review ছাড়া ship করবেন না। Source/research document-এ থাকা legal conclusion-কে counsel-এর মতামত হিসেবে উপস্থাপন করবেন না।

---

## ১২. Quality gates (Definition of Done)

| Gate | pass-এর প্রমাণ |
|---|---|
| **G0 — rights & baseline** | clean Git baseline; code/art/font/audio license register; unknown source/asset নেই; supported target/Android phone list লেখা |
| **G1 — native integration spike** | clean checkout থেকে SDL3 desktop ও Android arm64 build; touch + gamepad/keyboard action map; landscape; pause/resume/low-memory; Bengali shaping screenshot; renderer নির্বাচন নথিবদ্ধ |
| **G2 — player feel lab** | graybox-এ player smooth, wall-slide/solid tile ঠিক, camera jitter নেই, tool target readable, UI touch miss কম |
| **G3 — map/data** | Farm + Town load; portal round trip; map validator dangling/duplicate ID ধরে; art/collision/soil আলাদা |
| **G4 — farming vertical slice** | till → plant → water → day advance → crop state → harvest → sell/shop; save/restart/load-এ state অক্ষত |
| **G5 — art/device slice** | micro-scene-এ hand-painted player/forest/pond/soil + rain/one seasonal change; reference/low device profile; long thermal run; frame-time distribution নথিবদ্ধ |
| **G6 — content scale** | source-art-to-runtime export reproducible; new map/NPC/crop add করতে code fork নয়; content lint CI-তে pass |
| **G7 — PC release candidate** | keyboard/mouse + controller parity; save/settings/input; packaged clean install/update; crash/symbols; content/legal notices |
| **G8 — console eligibility** | licensed SDK/dev kit in hand, platform port owner assigned, certification and platform services estimated; শুধু architecture-এর উপর ভিত্তি করে gate pass নয় |

### Test suite-এর ন্যূনতম স্তর

- **Unit:** six-season calendar, day transitions, crop growth, inventory capacity, sell price, quest flags, action map, save migration.
- **Integration:** load map → enter portal → change farm cell → sleep/day advance → return → save → process restart → load.
- **Content:** map/asset IDs, portal references, collision/soil layer, font glyph coverage, missing audio, invalid custom property.
- **Device:** orientation lock, touch safe area, Bluetooth controller, app background/foreground, phone call/lock, low memory, graphics reset, no-storage/write error.
- **Performance:** first launch, busiest farm scene, rain/effects, map transition, 20–30 minute continuous session, CPU/GPU/memory/thermal/battery; average FPS ছাড়াও P90/P99/present-time পরীক্ষা.
- **Visual:** ছোট/চওড়া landscape aspect ratio, UI readability, foreground overlap, Bangla glyph shaping, dark/rainy screen contrast.

শুধু unit test দিয়ে touch latency, driver bug, thermal throttle, Android packaging বা font backend-এর correctness প্রমাণ হয় না; অন্তত reference ও নিম্ন device-এ real-device pass দরকার।

---

## ১৩. ধাপে ধাপে production roadmap

### Phase A — সিদ্ধান্তের আগে spike

- বর্তমান Unity decision অপরিবর্তিত রেখে আলাদা branch/repo-তে C++ spike.
- SDL3 Android arm64 + desktop build, portrait নয়—landscape; touch controls এবং controller/keyboard action mapper.
- এক-screen Farm art mock: painted soil, sal/bamboo edge, pond/ghat, player, one foreground occluder, rain, one palette transition.
- Bangla dialogue/hud text real font-এ; build-এর HarfBuzz status verify.
- SDL_Renderer-এ visual/performance পরীক্ষা; shader requirement fail করলে একই scene bgfx prototype-এ তুলনা.
- decision note: কোন feature pass/fail হলো; build time, debugger/profile friction, asset memory, input feel; C++ route রাখা হবে কি না.

### Phase B — Player feel + graybox

- empty test map, 4/8-way movement, animation placeholder, collision, camera, interaction, tool-target feedback.
- map graph ও Farm/Town graybox; transition/save API.
- gameplay design-এর জন্য final art নয়; movement/camera/scale/door width আগে validate.

### Phase C — Complete first vertical slice

```text
Farm spawn
→ soil prepare + 3 crop seed/water interaction
→ day end/sleep + crop advance
→ Town portal + 1 NPC/shop
→ Farm return
→ save/load → exact state restore
```

- এক local calendar/season rule, basic weather, starter inventory/economy.
- map/content validation automated; crop/calendar state unit-tested.

### Phase D — Art & performance slice

- hand-painted micro-scene finish; atlas, pivots, animation, foreground sorting, simple audio, Bangla dialogue, rain/water/season palette.
- reference low/mid/high phone-এ performance + thermal + memory পরীক্ষা.
- renderer decision পুনরায় দেখা—SDL_Renderer যথেষ্ট হলে bgfx বাদ; না হলে version-pinned bgfx spike.

### Phase E — Production & platforms

- map/NPC/item pipeline, content docs, accessibility/UI scaling, save migration, settings.
- Android release workflow স্থির; PC port একই domain/content/save.
- console SDK access থাকলেই platform-specific implementation/certification phase খুলুন.

**প্রতিটি phase-এর শেষে “কাজ শেষ” নয়, pass/fail artifact, build, test, playable scene ও decision log থাকতে হবে।**

---

## ১৪. প্রধান trade-off ও ঝুঁকি

| ঝুঁকি | প্রভাব | mitigation |
|---|---|---|
| **নিজস্ব engine ধীরে বড় হয়ে যাওয়া** | gameplay/art pipeline-এর বদলে infrastructure-এ সময় | শুধু project-specific runtime; editor/tool দরকার হলে ছোট standalone tool; “generic engine” backlog lock |
| **C++ memory/lifetime error** | crash, leak, stale GPU handle, Android-only failure | RAII, ownership contract, sanitizer, low-memory/lifecycle test |
| **SDL_Renderer shader ceiling** | visual effect plan API-তে মেলে না | আগে effect feature list; micro-scene spike; baked/simple effects; প্রমাণ হলে bgfx |
| **SDL_GPU Android reach** | নির্বাচিত phone-এ renderer startup fail | primary path হিসেবে নয়, যতক্ষণ Vulkan feature/device matrix pass না করে; SDL FAQ-তে Android caveat আছে [1](https://wiki.libsdl.org/SDL3/FAQDevelopment) |
| **bgfx build/window/shader integration** | source link থাকলেও Android/window backend work | pinned `bgfx/bx/bimg`; build pipeline CI; `shaderc` offline; each platform’s native handle/resize/lifecycle spike [1](https://bkaradzic.github.io/bgfx/build.html) |
| **Bangla text গার্বল/ভুল shaping** | UI/dialogue quality ও localization failure | HarfBuzz explicitly verify; real Bengali font; golden screenshot/line-wrap tests |
| **Save corruption / schema drift** | player progress lost | versioned schema, atomic replace, backup, migration tests, safe-point autosave |
| **Mid-range thermal throttle** | প্রথম ১ মিনিট smooth, পরে stutter | device-specific 20–30 মিনিট run, power/thermal profile, Balanced graphics profile, P90/P99 |
| **একইসঙ্গে Android + PC + console** | test matrix ও platform-owner কাজ বহুগুণ | Android + একটি PC first; console gate-এ license/SDK সত্যিই হাতে থাকতে হবে |
| **C++ মানেই দ্রুত—এমন অনুমান** | premature optimization ও ভুল resource priority | art pipeline, fill-rate, overdraw, load, CPU/GPU actual profiler দিয়ে bottleneck নির্ণয় |
| **কোনো source/asset-এর rights অস্পষ্ট** | release legal/reputation risk | source audit, license ledger, clean-room replacement বা legal review |

---

## ১৫. Unity বনাম no-engine C++: project-এর সিদ্ধান্ত-সহায়িকা

| ক্ষেত্র | Unity 6.3 LTS (বর্তমান project plan) | SDL3 + custom C++ runtime |
|---|---|---|
| first playable | scene/editor/2D workflow প্রস্তুত; সাধারণত কম custom infrastructure | renderer, map loader, input, UI, save, audio glue আগে লিখতে হবে |
| control/performance | engine abstraction, profiler/asset pipeline; engine constraints | lower-level control; কিন্তু performance নিজে measure/maintain করতে হবে |
| Bengali/mobile lifecycle | plugins/platform profile দিয়ে integrate | Android NDK/Gradle lifecycle/text shaping/pacing team নিজে maintain করবে |
| PC/console | engine platform ecosystem সুবিধা; license/SDK/certification তবু লাগে | C++ হওয়া সত্ত্বেও SDK, port, packaging, certification নিজে/partner দিয়ে করতে হবে |
| art/content iteration | editor workflows আছে | Tiled + validator/importer + game-specific tools দলকে লিখতে হবে |
| দীর্ঘমেয়াদি প্রযুক্তিগত নিয়ন্ত্রণ | engine upgrades/vendor roadmap | code ownership বেশি, কিন্তু every dependency/platform issue দলের দায় |
| প্রাথমিক সিদ্ধান্ত | এই project-এর বর্তমান locked পথ | alternative study; proof ও formal decision ছাড়া replace নয় |

### C++ route গ্রহণের আগে চারটি শর্ত

1. team-এ C++20, CMake ও Android native packaging-এ দায়িত্ব নিতে পারবেন এমন একজন owner থাকবে;
2. first spike-এ Android/desktop build, Bengali text, touch, lifecycle ও target visual proof হবে;
3. project-এর 2D effect requirement SDL_Renderer-এ pass বা documented bgfx need হিসেবে থাকবে;
4. Unity decision বদলানো, console schedule/risk ও extra tool maintenance—সব লিখিতভাবে মেনে নেওয়া হবে।

এর কোনোটি না থাকলে **Unity 6.3 LTS-এ থাকা বর্তমান project plan-ই কম ঝুঁকির সিদ্ধান্ত**। Engine license বাঁচিয়ে নিজের renderer/pipeline/platform team বানানো “free” নয়; এটি cost-এর ধরন বদলায়।

---

## ১৬. চূড়ান্ত সুপারিশ

> **Project direction এখনই বদলাবেন না।** বর্তমান Unity 6.3 LTS locked plan-এর পাশে এই C++ route-কে alternative technical study হিসেবে রাখুন।
>
> **যদি no-engine C++ স্পষ্টভাবে বেছে নেওয়া হয়:** SDL3-কে platform/lifecycle/input layer, SDL_Renderer-কে প্রথম 2D renderer, আর game rules/map/save/calendar/UI-কে ছোট SDL-free C++ runtime-এ রাখুন। Tiled JSON, CMake, pinned dependencies, CTest, real Android phone profiling ও Bengali HarfBuzz text test শুরু থেকেই করুন।
>
> **bgfx বেছে নিন শুধু renderer spike-এর পরে:** custom shader/effect requirement-এর জন্য SDL_Renderer অপর্যাপ্ত প্রমাণিত হলে, Android OpenGL ES/device coverage এবং SDL3 native-window/lifecycle integration সব target-এ সফল হলে bgfx নিন। SDL_GPU-কে Android-only renderer করবেন না যতক্ষণ target device matrix তাতে সম্মত নয়।
>
> **Premium quality-এর প্রকৃত acceptance bar:** complete farming loop, tactile controls, readable Bengali, hand-painted cohesive world, no lost save, stable frame pacing, low-end device-এ thermal-safe profile, repeatable build এবং পরিষ্কার license trail।

এই guide-কে পরের project কাজের জন্য C++ বিকল্পের working context হিসেবে ব্যবহার করুন; Unity branch-এর সিদ্ধান্ত পরিবর্তনের ক্ষেত্রে আলাদা dated decision log যোগ করুন।

---

## ১৭. প্রধান প্রাথমিক/official references

নিচের links-এ SDL3/bgfx/Android/CMake/Tiled/C++ library documentation রাখা হয়েছে। Version ও backend details project pin/implementation-এর সময় আবার যাচাই করতে হবে।

### SDL3 ও Android

- SDL3 2D rendering API, thread note ও operation scope: [1](https://wiki.libsdl.org/SDL3/CategoryRender)
- SDL3 graphics FAQ; SDL_GPU backend ও Android caveat: [1](https://wiki.libsdl.org/SDL3/FAQDevelopment)
- SDL3 Android build, lifecycle, low-memory ও বর্তমান SDK/NDK note: [1](https://wiki.libsdl.org/SDL3/README-android)
- SDL3 touch event coordinates: [1](https://wiki.libsdl.org/SDL3/README-touch)
- SDL3 CMake platforms/build: [5](https://wiki.libsdl.org/SDL3/README-cmake/raw)
- SDL3 platform & NDA/console status: [1](https://wiki.libsdl.org/SDL3/README-platforms), [2](https://wiki.libsdl.org/SDL3/README-switch), [4](https://wiki.libsdl.org/SDL3/README-ps5), [5](https://wiki.libsdl.org/SDL3/README-gdk)

### bgfx

- bgfx upstream README/backends/platform list/license: [1](https://github.com/bkaradzic/bgfx)
- bgfx official docs/build/dependencies/GENie/CMake alternatives: [1](https://bkaradzic.github.io/bgfx/build.html)
- bgfx `shaderc` tools: [1](https://bkaradzic.github.io/bgfx/tools.html)
- SDL3 + bgfx community gist—feasibility clue only, not official setup: [1](https://gist.github.com/ShogunateTM/87947e63ccb8ae273c85fbfc5f6f03b0)

### Audio, fonts, Bengali text, physics

- miniaudio upstream repo/platforms/high-level API/license: [1](https://github.com/mackron/miniaudio)
- SDL3_ttf upstream wiki/repository: [2](https://wiki.libsdl.org/SDL3_ttf), [1](https://github.com/libsdl-org/SDL_ttf)
- FreeType upstream: [1](http://freetype.org/)
- HarfBuzz manual and text shaping: [3](https://harfbuzz.github.io/)
- Box2D current FAQ/API generation: [1](https://box2d.org/documentation/md_faq.html)

### Content, build, language and Android profiling

- Tiled JSON map format: [1](https://doc.mapeditor.org/en/stable/reference/json-map-format/)
- Tiled typed custom properties: [4](https://doc.mapeditor.org/en/stable/manual/custom-properties/)
- CMake/CTest official tutorial: [3](https://cmake.org/cmake/help/latest/guide/tutorial/Testing%20and%20CTest.html)
- C++ Core Guidelines, RAII/resource ownership: [1](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)
- vcpkg Android integration/version management: [1](https://learn.microsoft.com/en-us/vcpkg/users/platforms/android), [3](https://learn.microsoft.com/en-us/vcpkg/users/examples/versioning.getting-started)
- Android Frame Pacing library: [1](https://developer.android.com/games/sdk/frame-pacing)
- Android game FPS/P90/P99 guidance: [3](https://developer.android.com/games/optimize/framerate)
- Android Performance Analyzer frame-time analysis: [5](https://developer.android.com/android-performance-analyzer/analyze/frame-times)
- Khronos KTX file format specification: [3](https://github.com/KhronosGroup/KTX-Specification)

---

### Project files synthesized

`/home/user/uploads/`-এর ১৮টি সংযুক্ত Markdown research file-ই context হিসেবে reviewed হয়েছে। বিশেষ করে:

- `2d-game-project-knowledge-base.md`
- `mobile-first-premium-cross-platform-plan.md`
- `unity-premium-pc-console-foundation.md`
- `bangladesh-game-development-master-plan.md`
- `bangladesh-inspired-game-world-knowledge-base.md`
- `bangladesh-geography-for-game-world-research.md`
- `bangladesh-seasons-and-gazipur-ecology-research.md`
- `2d-game-map-creation-research.md`
- `2d-map-production-playbook.md`
- `2d-game-asset-creation-research.md`
- `2d-game-character-creation-research.md`
- `2d-game-character-animation-research.md`
- `2d-game-art-complete-easy-guide.md`
- `visual-direction-options-for-bangladesh-game.md`
- `bangladesh-native-flora-and-fruit-trees-research.md`
- `stardew-valley-research-bn.md`
- `stardew-rendering-optimization-report-bn.md`
- `mmorpg-to-other-genre-game-conversion-research.md`
