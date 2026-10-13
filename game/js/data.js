/* চালাবন ফার্ম — static game data (crops, fish, items, NPCs, quests).
 * Original content. No copied art, names, dialogue or layouts from any other game.
 * Pure data: no DOM access, so it can be unit-tested in Node.
 */
(function (root) {
  "use strict";
  var CF = (root.CF = root.CF || {});

  var SEASONS = [
    { id: "summer", name: "গ্রীষ্ম", rain: 0.15, tint: "rgba(255,200,90,0.05)", palette: { grass: "#9aab4a", grass2: "#86993e", soil: "#b8553a", path: "#c9a878", leaf: "#4f7d3a" } },
    { id: "monsoon", name: "বর্ষা", rain: 0.6, tint: "rgba(40,90,120,0.08)", palette: { grass: "#4a9a3e", grass2: "#3c8534", soil: "#8c4a33", path: "#a88558", leaf: "#2f6a2c" } },
    { id: "autumn", name: "শরৎ", rain: 0.15, tint: "rgba(255,230,160,0.04)", palette: { grass: "#a6b84f", grass2: "#93a841", soil: "#b56a45", path: "#c9a878", leaf: "#5e8a3a" } },
    { id: "late_autumn", name: "হেমন্ত", rain: 0.05, tint: "rgba(255,190,80,0.09)", palette: { grass: "#c7a64c", grass2: "#b5923c", soil: "#a95f3c", path: "#c9a878", leaf: "#7a8f3a" } },
    { id: "winter", name: "শীত", rain: 0.03, tint: "rgba(120,150,190,0.07)", palette: { grass: "#8a9a5b", grass2: "#7a8a4e", soil: "#9c5a3e", path: "#b9a078", leaf: "#5f7a40" } },
    { id: "spring", name: "বসন্ত", rain: 0.2, tint: "rgba(255,170,200,0.04)", palette: { grass: "#72b85a", grass2: "#63a84c", soil: "#c06a48", path: "#c9a878", leaf: "#3f8a3a" } }
  ];

  // Crops. season = indices into SEASONS. grow = days to mature. regrow = days to next harvest (0 = single harvest).
  var CROPS = {
    lau:      { id: "lau",      name: "লাউ",        seasons: [0, 1], grow: 6, regrow: 3, seed: 40, price: 70,  color: "#6aa84f", fruit: "#a9d86e", desc: "মাচায় উঠে লতা, বারবার ফলন দেয়।" },
    begun:    { id: "begun",    name: "বেগুন",      seasons: [0, 2], grow: 5, regrow: 3, seed: 20, price: 40,  color: "#5a3f7a", fruit: "#6c3c8f", desc: "গ্রীষ্ম ও শরতের প্রিয় সবজি।" },
    chili:    { id: "chili",    name: "কাঁচা মরিচ", seasons: [2, 3], grow: 6, regrow: 4, seed: 30, price: 55,  color: "#3f7a3a", fruit: "#d8322a", desc: "ঝাল ছাড়া ভাত অচল।" },
    dhan:     { id: "dhan",     name: "ধান",        seasons: [1],    grow: 8, regrow: 0, seed: 25, price: 60,  color: "#7aa84a", fruit: "#e6c455", desc: "বর্ষার জলে বাইদের ধান।" },
    alu:      { id: "alu",      name: "আলু",        seasons: [3, 4], grow: 7, regrow: 0, seed: 35, price: 80,  color: "#6f8a3c", fruit: "#b98a55", desc: "হেমন্ত-শীতের মাটির নিচের সোনা।" },
    sarisha:  { id: "sarisha",  name: "সরিষা",      seasons: [4, 5], grow: 5, regrow: 0, seed: 20, price: 45,  color: "#5c8f3a", fruit: "#f2c81e", desc: "শীতে হলুদ ফুলে ভরে যায় মাঠ।" },
    palong:   { id: "palong",   name: "পালং শাক",   seasons: [4, 5], grow: 3, regrow: 2, seed: 15, price: 25,  color: "#2f8a3a", fruit: "#3fae4a", desc: "দ্রুত বাড়ে, রোজকার শাক।" },
    dhendosh: { id: "dhendosh", name: "ঢেঁড়স",     seasons: [0, 1], grow: 4, regrow: 2, seed: 15, price: 30,  color: "#4a8a3a", fruit: "#7fbf4a", desc: "গ্রীষ্ম-বর্ষার সস্তা ফসল।" }
  };

  // Fish. season = list of season indices where it bites. Lakes/ponds only.
  var FISH = {
    puti:   { id: "puti",   name: "পুঁটি",  price: 10, seasons: [0, 1, 2, 3, 4, 5], color: "#c9d4d8", rarity: 1.0 },
    tengra: { id: "tengra", name: "টেংরা",  price: 30, seasons: [1, 2, 5],          color: "#8a7a5a", rarity: 0.7 },
    rui:    { id: "rui",    name: "রুই",    price: 45, seasons: [1, 2, 3],          color: "#c98a4a", rarity: 0.6 },
    shing:  { id: "shing",  name: "শিং",    price: 85, seasons: [1, 5],             color: "#6a6a4a", rarity: 0.35 },
    magur:  { id: "magur",  name: "মাগুর",  price: 90, seasons: [1, 3, 4],          color: "#5a5a6a", rarity: 0.3 }
  };

  var TOOLS = {
    hoe:  { id: "hoe",  name: "কোদাল",    kind: "tool", energy: 5, desc: "শুকনো লালমাটি কুপিয়ে চাষ উপযোগী করো।" },
    can:  { id: "can",  name: "জলের ঝারি", kind: "tool", energy: 3, desc: "ফসলে পানি দাও। প্রতিদিন একবার কাজ করে।" },
    rod:  { id: "rod",  name: "ছিপ",      kind: "tool", energy: 4, desc: "পুকুরে ছিপ ফেলে মাছ ধরো।" }
  };

  var TOOL_ORDER = ["hoe", "can", "rod"];

  // Item id helpers: "seed_<crop>", "crop_<crop>", "fish_<fish>", tool ids.
  function itemInfo(id) {
    if (!id) return null;
    if (TOOLS[id]) return { id: id, name: TOOLS[id].name, kind: "tool", price: 0 };
    var parts = id.split("_");
    var key = parts.slice(1).join("_");
    if (parts[0] === "seed" && CROPS[key]) return { id: id, name: CROPS[key].name + " বীজ", kind: "seed", crop: key, price: CROPS[key].seed, color: CROPS[key].color };
    if (parts[0] === "crop" && CROPS[key]) return { id: id, name: CROPS[key].name, kind: "crop", crop: key, price: CROPS[key].price, color: CROPS[key].fruit };
    if (parts[0] === "fish" && FISH[key]) return { id: id, name: FISH[key].name, kind: "fish", fish: key, price: FISH[key].price, color: FISH[key].color };
    return null;
  }

  var NPCS = {
    ameena: {
      id: "ameena", name: "আমেনা খালা", role: "মুদি দোকানি", gender: "f", age: 52,
      likes: ["crop_chili", "crop_lau"], hates: ["fish_puti"],
      home: "village",
      schedule: [{ from: 6, to: 26, x: 15, y: 6 }],
      lines: [
        "আসো বাবা, কী লাগবে? আজকের বীজ সব এখানে পাবে।",
        "মাটি ভালো হলে ফসল ভালো হয়। লালমাটিতে ধৈর্য লাগে।",
        "বৃষ্টির দিনে বাইরে কাজ করো না, শরীর খারাপ হবে।",
        "আমার স্বামী এই দোকান দিয়েছিল। এখন আমি চালাই।"
      ],
      giftLines: { like: "আহা! এটা তো আমার খুব পছন্দ। ধন্যবাদ বাবা।", neutral: "আচ্ছা, রেখে দিলাম।", hate: "এটা আমি খাই না বাবা, নিয়ে যাও।" }
    },
    mojid: {
      id: "mojid", name: "মজিদ চাচা", role: "অবসরপ্রাপ্ত জেলে", gender: "m", age: 68,
      likes: ["fish_rui", "fish_shing"], hates: ["crop_begun"],
      home: "village",
      schedule: [
        { from: 6, to: 9, x: 7, y: 11 },
        { from: 9, to: 17, x: 11, y: 11 },
        { from: 17, to: 26, x: 12, y: 10 }
      ],
      lines: [
        "পুকুরের মাছ দেখে বুঝি বর্ষা কেমন যাবে।",
        "ছিপ ফেলতে ধৈর্য লাগে, তাড়াহুড়ো করলে মাছ পালায়।",
        "আমার বাপ-দাদা এই পুকুরের পাড়ে বসেই জীবন কাটিয়েছে।",
        "শালবনের পাতা ঝরলে বুঝি শীত আসছে।"
      ],
      giftLines: { like: "বাহ্, এমন মাছ! বহুদিন পর এমন মাছ পেলাম।", neutral: "ভালো জিনিস, রাখলাম।", hate: "এটা নিয়ে যাও, আমার পছন্দ না।" }
    },
    rafiq: {
      id: "rafiq", name: "রফিক", role: "রিকশাচালক ও কৃষক", gender: "m", age: 24,
      likes: ["fish_magur", "crop_sarisha"], hates: ["crop_palong"],
      home: "village",
      schedule: [
        { from: 6, to: 12, x: 2, y: 8 },
        { from: 12, to: 18, x: 13, y: 7 },
        { from: 18, to: 26, x: 2, y: 8 }
      ],
      lines: [
        "আজ ঢাকা-গাজীপুর রোড এ জ্যাম ছিল ভাই। গ্রামেই ভালো।",
        "বাইদের ধান উঠলে সবার মুখে হাসি ফোটে।",
        "তুমি নতুন এসেছ, না? চালাবনে মন বসবে, দেখো।",
        "রিকশা টানি, আর বিকেলে মাঠে যাই। দুটো কাজই ভালো লাগে।"
      ],
      giftLines: { like: "ওরে বাপ! মাগুর! তুমি তো আমার মনের কথা বুঝো।", neutral: "থ্যাংকস ভাই!", hate: "এইটা আমার পছন্দ না ভাই, তবু নিলাম।" }
    },
    shiuli: {
      id: "shiuli", name: "শিউলি আপা", role: "প্রাথমিক বিদ্যালয়ের শিক্ষক", gender: "f", age: 29,
      likes: ["crop_alu", "crop_chili"], hates: ["fish_tengra"],
      home: "village",
      schedule: [
        { from: 8, to: 14, x: 23, y: 9 },
        { from: 14, to: 18, x: 17, y: 13 },
        { from: 18, to: 26, x: 7, y: 9 }
      ],
      lines: [
        "আমার ক্লাসের ছাত্ররা প্রশ্ন করে — ফসল কেন বাড়ে? আমি বলি, যত্ন নিলে।",
        "শালবনে শালপাতা ঝরে, সেটাই আমাদের গ্রামের সৌন্দর্য।",
        "পড়াশোনার সাথে মাটির সম্পর্ক ভুলে যেও না।",
        "গ্রামের সবাইকে চেনো তো? আস্তে আস্তে চিনে যাবে।"
      ],
      giftLines: { like: "কী সুন্দর! তুমি সত্যিই যত্ন নিয়ে চাষ করো বোঝা যায়।", neutral: "ধন্যবাদ, এটা খুব কাজে লাগবে।", hate: "আমার এটা ভালো লাগে না, ক্ষমা করো।" }
    }
  };

  // Shop items that are always available. Seeds are filtered by season in the engine.
  var QUESTS = [
    { id: "q_seed", title: "প্রথম বীজ", text: "একটি বীজ মাটিতে বোনো", reward: 100, check: function (s) { return s.stats.planted >= 1; } },
    { id: "q_harvest", title: "প্রথম ফসল", text: "মোট ৩টি ফসল তোলো", reward: 200, check: function (s) { return s.stats.harvested >= 3; } },
    { id: "q_fish", title: "জেলের হাতেখড়ি", text: "মোট ৩টি মাছ ধরো", reward: 150, check: function (s) { return s.stats.fish >= 3; } },
    { id: "q_village", title: "চালাবনের বন্ধু", text: "গ্রামের সব মানুষের সাথে কথা বলো", reward: 250, check: function (s) { return Object.keys(s.stats.talked || {}).length >= 4; } },
    { id: "q_money", title: "হাটের খ্যাতি", text: "মোট ১৫০০ টাকা আয় করো", reward: 400, check: function (s) { return s.stats.earned >= 1500; } }
  ];

  CF.Data = {
    SEASONS: SEASONS,
    CROPS: CROPS,
    FISH: FISH,
    TOOLS: TOOLS,
    TOOL_ORDER: TOOL_ORDER,
    NPCS: NPCS,
    QUESTS: QUESTS,
    itemInfo: itemInfo,
    // Time: 1 game minute = 0.7 real seconds (Stardew-like pace, ~14 real minutes per day).
    DAY_START_MIN: 0,        // 06:00
    DAY_END_MIN: 1200,       // 02:00 next morning — forced sleep
    SECONDS_PER_GAME_MIN: 0.7,
    MAX_ENERGY: 270,
    START_COINS: 500,
    DAYS_PER_SEASON: 12,
    DAYS_PER_YEAR: 72,
    FRIEND_MAX: 2500,
    HEART_STEP: 250,
    TALK_POINTS: 20,
    GIFT_LIKE: 80,
    GIFT_NEUTRAL: 20,
    GIFT_HATE: -40,
    START_SEASON: 2 // শরৎ
  };
})(typeof window !== "undefined" ? window : globalThis);
