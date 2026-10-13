# Unity Premium PC + Console Foundation

> **সিদ্ধান্ত:** নতুন project, Unity, PC এবং console-quality design একসঙ্গে মাথায় রেখে development।
>
> **লক্ষ্য:** একটি 2D game হলেও controls, performance, visuals, UI, audio এবং testing-এ যেন খেলোয়াড়ের কাছে premium PC/console experience লাগে।
>
> **স্থিতি:** Phase 0 শুরু হয়েছে। Workspace-এ Unity Editor নেই, তাই editor-verified scene/project তৈরি করার আগে Unity Hub-এ নির্ধারিত Unity version দিয়ে নতুন project initialise করতে হবে। এই নথি সেই কাজের production contract।

---

## ১. আমরা "console-level" বলতে কী বোঝাচ্ছি

Console-level মানে শুধু বেশি সুন্দর আলো বা বড় resolution নয়। আমাদের quality bar:

```text
দ্রুত ও নির্ভরযোগ্য loading
controller-এ সম্পূর্ণ খেলা যায়
60 FPS লক্ষ্য রেখে স্থির frame pacing
দূর থেকে পড়া যায় এমন UI/text
কোনো input lag বা camera jitter নেই
সুসংহত sound, rumble ও menu flow
crash/soft-lock/data loss নেই
প্রতিটি screen ও setting-এ polished feedback
```

**বাস্তব সীমা:** PlayStation/Xbox/Nintendo release-এর জন্য platform-holder developer approval, developer hardware/SDK, age rating, certification এবং platform-specific testing লাগে। এগুলো এখনই coding block করবে না; তবে architecture ও UI শুরু থেকেই সেই মান মেনে হবে।

---

## ২. Engine ও rendering সিদ্ধান্ত

| বিষয় | সিদ্ধান্ত | কারণ |
|---|---|---|
| Engine | **Unity 6.3 LTS** (project version lock করার সময় official current LTS যাচাই) | স্থিতিশীলতা, দীর্ঘ support, PC/console workflow |
| Rendering | **Universal Render Pipeline (URP), 2D Renderer** | stylised 2D lighting, scalability, PC/console-friendly approach |
| Art base | Pixel-art world, high-quality animation/light/depth | বাংলাদেশের নিজস্ব identity + controlled asset scope |
| Input | Unity Input System; gamepad first + keyboard/mouse full support | PC ও console একই control contract |
| Data | ScriptableObject/JSON-driven definitions, runtime save diff | crops/maps/NPCs expand করা সহজ |
| Build approach | PC build নিয়মিত; console constraints daily design-এ | PC feedback দ্রুত, পরে port risk কম |

### কেন HDRP নয়

আমাদের game 2D top-down farming/life-sim। HDRP-এর উচ্চ hardware cost/complexity এখানে visual quality বাড়ানোর সেরা পথ নয়। URP-তে strong art direction, intentional lighting, normal map-এর সীমিত ব্যবহার, particles, post-processing এবং excellent frame pacing বেশি মূল্য দেবে।

---

## ৩. Visual performance contract

### ৩.১ Render-quality tiers

| Tier | লক্ষ্য | কী থাকবে |
|---|---|---|
| **Premium** | capable PC / primary console profile | high-quality 2D lights, selected normal maps, rain/fog, subtle post effects, rich particles |
| **Balanced** | baseline PC / constrained console profile | main lights + simplified particles + fewer foreground effects |
| **Performance** | lower-spec PC | essential lighting and gameplay cues; reduced fog/rain/particles; no gameplay difference |

কোনো tier-এ player-এর collision, crop state, map layout বা NPC logic বদলাবে না—শুধু visual expense বদলাবে।

### ৩.২ Frame-time target

```text
Core target       : locked 60 FPS যেখানে platform/profile সম্ভব
60 FPS budget     : 16.67 ms প্রতি frame
Fallback policy   : performance পরীক্ষার পরে platform-specific সিদ্ধান্ত;
                    gameplay/UI responsiveness কখনও sacrifice নয়
```

প্রথম দিন থেকেই Profiler ব্যবহার হবে। "শেষে optimize করব" নয়।

### ৩.৩ Pixel-art presentation test

দুটি prototype compare করব, তারপর data দেখে lock করব:

```text
Profile A: 480 × 270 internal world resolution
Profile B: 640 × 360 internal world resolution
```

- World: pixel-perfect/integer-friendly render strategy
- UI/text: high-resolution Canvas, TV-distance readability
- Camera: pixel snap, no sub-pixel shimmer
- Test: 1080p, 1440p, 4K, different aspect ratio, couch-distance gamepad play

কোন resolution ভালো তা এখন অনুমান নয়—actual player art scale ও hardware profile দিয়ে test হবে।

---

## ৪. Premium visual ingredients: কী করব, কী করব না

### করব

- strong silhouette ও handcrafted environment composition
- day/night colour grading, কিন্তু gameplay readability নষ্ট নয়
- rain on roof/pond/leaf, restrained fog, water ripples
- selected tree/house/water-এ 2D light ও normal-map depth
- foreground leaf/roof occlusion fade
- layered parallax only যেখানে scene benefit পায়
- seasonal terrain/foliage variants
- quality animation: wind, water, crop, tool impact, NPC idle

### করব না

- প্রতিটি tile-এ expensive real-time light/shadow
- সব গাছে unique shader/material
- gameplay ঢেকে দেয় এমন heavy fog/particle/foreground
- texture size বাড়িয়ে false “premium” look
- asset count বাড়িয়ে frame-time নষ্ট করা
- AI concept art সরাসরি game asset হিসেবে নেওয়া

> Premium look-এর সূত্র: **art direction + clean motion + controlled light + fast response**, শুধু effect-এর সংখ্যা নয়।

---

## ৫. Controller-first interaction contract

### প্রতিটি gameplay action

| কাজ | Gamepad | Keyboard/mouse |
|---|---|---|
| চলা | left stick / D-pad | WASD / arrow keys |
| tool/use | face button | mouse/assigned key |
| interact | face button | key/left click context |
| inventory | menu button | I/tab |
| quick slot | shoulder buttons/D-pad | number/scroll |
| map/journal | view button | M/J |
| pause/settings | menu button | Esc |

### বাধ্যতামূলক quality rules

- [ ] সব menu gamepad দিয়ে সম্পূর্ণ চালানো যায়।
- [ ] focus কোথায় আছে সবসময় দৃশ্যমান।
- [ ] controller disconnect/reconnect safe।
- [ ] keyboard, mouse, controller rebind করা যায়।
- [ ] confirm/cancel platform convention layer দিয়ে map হবে—code-এ hard-code নয়।
- [ ] optional vibration/rumble setting থাকবে।
- [ ] TV-distance font size, safe area এবং contrast test হবে।

---

## ৬. Technical architecture: প্রথম থেকে console-conscious

```text
Assets/
  _Game/
    Art/
      Source/              # source PSD/Aseprite; build asset নয়
      Runtime/
    Audio/
    Data/
      Crops/
      Items/
      NPCs/
      Maps/
      Seasons/
    Prefabs/
    Scenes/
      Bootstrap/
      Test/
      Maps/
    Scripts/
      Core/
      Input/
      World/
      Farming/
      Map/
      UI/
      Save/
      Presentation/
    Settings/
  ThirdParty/

Docs/
  decisions/
  map-specs/
  art-bible/
  qa/
```

### System boundaries

```text
Input       → player intent; no farming/game economy logic
World       → day, season, weather, global flags
Map         → load/unload/portal/spawn/layer data
Farming     → soil/crop/harvest; data-driven
NPC         → schedule/dialogue/relationship
Presentation → camera, art, light, VFX, sound feedback
UI          → view/control; no hidden game-rule authority
Save        → serialises state/diff, not static art map
```

এটি পরে console port, input change, UI redesign বা world expansion হলে risk কমায়।

---

## ৭. Performance rules (non-negotiable)

```text
১. প্রতি frame-এ সব map/crop/NPC scan করা যাবে না।
২. নতুন দিনে world simulation batch update হবে।
৩. camera-visible tile/entity-ই render হবে।
৪. static terrain atlas/tilemap-এ, dynamic object prefab/entity-তে।
৫. GC allocation hot path-এ শূন্য/সর্বনিম্ন রাখার লক্ষ্য।
৬. scene/map load asynchronous ও fade-masked হবে।
৭. texture/material/shader count budget করা হবে।
৮. profiler ছাড়া visual feature approve হবে না।
৯. save/load/version migration শুরু থেকেই test হবে।
১০. development build-এ diagnostics; shipping build-এ player-safe error handling।
```

---

## ৮. Phase 0 deliverables — এখন শুরু হয়েছে

- [x] New-project সিদ্ধান্ত
- [x] Unity direction সিদ্ধান্ত
- [x] PC + console-conscious release strategy সিদ্ধান্ত
- [x] Bangladesh/Gazipur world research
- [x] Master production plan
- [x] Premium technical foundation document
- [ ] Unity Hub-এ Unity 6.3 LTS install/confirm
- [ ] 2D URP project create
- [ ] Git repository + Unity `.gitignore`
- [ ] Package/version lock file
- [ ] Input System + controller test scene
- [ ] Quality settings profiles
- [ ] target-device performance matrix

---

## ৯. বাস্তব development environment requirement

Unity official system requirements অনুযায়ী console build support-এর জন্য Windows-based console development environment এবং platform-holder-specific requirements প্রযোজ্য। আমরা এখন PC build এবং console-safe architecture করব; actual console build/certification শুরু হবে approved developer access ও appropriate hardware পাওয়ার পরে।

### আমাদের এখনকার practical path

```text
Unity project → Windows PC development builds → controller testing →
profiling / low-spec PC test → console developer access → platform builds → certification QA
```

---

## ১০. অফিসিয়াল সূত্র

1. Unity 6 releases — Unity 6.3 LTS support status।  
   https://unity.com/releases/unity-6
2. Unity 6 support model — LTS/Update release guidance।  
   https://unity.com/releases/unity-6/support
3. Unity system requirements — console builds and platform requirements।  
   https://docs.unity3d.com/6000.0/Documentation/Manual/system-requirements.html
4. Unity 6 rendering/Shader Graph notes।  
   https://docs.unity.com/en-us/engine/6000.6/manual/whats-new/unity6

---

## সিদ্ধান্তের সারকথা

> আমরা Unity + URP দিয়ে **premium stylised 2D** বানাব। শুরু থেকেই controller, performance, UI safety, save reliability ও console constraints মানব। কিন্তু আমরা visual effect দিয়ে নয়—responsive gameplay, strong Bangladeshi art direction এবং disciplined optimization দিয়ে console-level quality অর্জন করব.
