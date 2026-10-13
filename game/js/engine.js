/* চালাবন ফার্ম — pure game rules (no DOM). Unit-tested in game/tests.
 * All state lives in one plain JSON-serialisable object (see newState).
 */
(function (root) {
  "use strict";
  var CF = (root.CF = root.CF || {});
  var D = CF.Data;

  var SAVE_VERSION = 1;
  var BLOCKED = { "#": 1, "B": 1, "R": 1, "W": 1 };
  var TILLABLE = { "S": 1 };

  // ---------- calendar ----------
  function seasonIndex(day) { return Math.floor((day - 1) / D.DAYS_PER_SEASON) % 6; }
  function dayInSeason(day) { return ((day - 1) % D.DAYS_PER_SEASON) + 1; }
  function yearOf(day) { return Math.floor((day - 1) / D.DAYS_PER_YEAR) + 1; }
  function weekOf(day) { return Math.floor((day - 1) / 7); }
  function hourOf(t) { return 6 + Math.floor(t / 60); }          // 6..26 (26 = 02:00)
  function clockText(t) {
    var h = (6 + Math.floor(t / 60)) % 24, m = t % 60;
    return pad2(h) + ":" + pad2(m);
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function dayPart(t) {
    var h = (6 + Math.floor(t / 60)) % 24;
    if (h < 11) return "সকাল";
    if (h < 15) return "দুপুর";
    if (h < 18) return "বিকেল";
    if (h < 20) return "সন্ধ্যা";
    return "রাত";
  }

  function newState(opts) {
    opts = opts || {};
    var startDay = 1 + D.DAYS_PER_SEASON * D.START_SEASON; // first day of the chosen season
    var state = {
      v: SAVE_VERSION,
      player: {
        name: (opts.name || "কৃষক").slice(0, 16),
        gender: opts.gender === "f" ? "f" : "m",
        farm: (opts.farm || "আমাদের খামার").slice(0, 20),
        coins: D.START_COINS,
        energy: D.MAX_ENERGY,
        map: "farm", x: 4.5, y: 6.5, dir: "down",
        held: "hoe"
      },
      clock: { day: startDay, t: 0 },
      weather: "sunny",
      inv: { seed_begun: 8, seed_chili: 4 },
      tiles: { farm: {}, village: {}, home: {} },
      friend: {},
      stats: { planted: 0, harvested: 0, fish: 0, earned: 0, talked: {} },
      quests: { claimed: {} },
      log: []
    };
    Object.keys(D.NPCS).forEach(function (id) { state.friend[id] = { pts: 0, talkDay: 0, giftWeek: -1 }; });
    state.weather = "sunny";
    return state;
  }

  function serialize(state) { return JSON.stringify(state); }
  function deserialize(text) {
    var s = JSON.parse(text);
    if (!s || typeof s !== "object") throw new Error("bad save");
    if (s.v !== SAVE_VERSION) throw new Error("unknown save version " + s.v);
    return s;
  }

  // ---------- map helpers ----------
  var occCache = {};
  function occupancy(mapId) {
    if (occCache[mapId]) return occCache[mapId];
    var map = CF.Maps[mapId], occ = {};
    (map.objects || []).forEach(function (o) {
      if (o.block === false) return;
      for (var y = o.y; y < o.y + o.h; y++) for (var x = o.x; x < o.x + o.w; x++) occ[x + "," + y] = o;
    });
    occCache[mapId] = occ;
    return occ;
  }
  function tileChar(mapId, x, y) {
    var map = CF.Maps[mapId];
    if (y < 0 || x < 0 || y >= map.h || x >= map.w) return "#";
    return map.rows[y].charAt(x);
  }
  function isWalkableTile(mapId, x, y) {
    var c = tileChar(mapId, x, y);
    if (BLOCKED[c]) return false;
    return !occupancy(mapId)[x + "," + y];
  }
  function objectAt(mapId, x, y) { return occupancy(mapId)[x + "," + y] || null; }
  function portalAt(mapId, x, y) {
    var ps = CF.Maps[mapId].portals || [];
    for (var i = 0; i < ps.length; i++) if (ps[i].x === x && ps[i].y === y) return ps[i];
    return null;
  }
  function tileState(state, mapId, x, y) {
    var m = state.tiles[mapId];
    return m ? m[x + "," + y] || null : null;
  }
  function ensureTile(state, mapId, x, y) {
    var m = state.tiles[mapId] || (state.tiles[mapId] = {});
    return m[x + "," + y] || (m[x + "," + y] = {});
  }

  // ---------- NPC ----------
  function npcPosition(npcId, t) {
    var npc = D.NPCS[npcId], h = hourOf(t);
    for (var i = 0; i < npc.schedule.length; i++) {
      var s = npc.schedule[i];
      if (h >= s.from && h < s.to) return { map: npc.home, x: s.x, y: s.y };
    }
    var last = npc.schedule[npc.schedule.length - 1];
    return { map: npc.home, x: last.x, y: last.y };
  }
  function hearts(pts) { return Math.min(8, Math.floor(pts / D.HEART_STEP)); }
  function friendLevel(state, npcId) { return hearts(state.friend[npcId].pts); }

  // ---------- time ----------
  // advance game clock by `minutes`. Returns true when the clock reaches the forced-sleep hour (02:00).
  function advanceTime(state, minutes) {
    state.clock.t += minutes;
    return state.clock.t >= D.DAY_END_MIN;
  }

  // ---------- actions ----------
  function spend(state, amount) { if (state.player.energy < amount) return false; state.player.energy -= amount; return true; }

  function canTill(state, mapId, x, y) {
    if (!TILLABLE[tileChar(mapId, x, y)]) return { ok: false, msg: "এখানে চাষ হবে না।" };
    if (objectAt(mapId, x, y)) return { ok: false, msg: "এখানে কিছু আছে।" };
    var ts = tileState(state, mapId, x, y);
    if (ts && ts.till) return { ok: false, msg: "এই জমি আগেই কোপানো হয়েছে।" };
    return { ok: true };
  }
  function till(state, mapId, x, y) {
    var c = canTill(state, mapId, x, y);
    if (!c.ok) return c;
    if (!spend(state, D.TOOLS.hoe.energy)) return { ok: false, msg: "শরীর ক্লান্ত। ঘুমাতে হবে।" };
    var ts = ensureTile(state, mapId, x, y);
    ts.till = true; ts.wet = false;
    return { ok: true, msg: "মাটি কোপানো হলো।" };
  }

  function water(state, mapId, x, y) {
    var ts = tileState(state, mapId, x, y);
    if (!ts || !ts.till) return { ok: false, msg: "শুধু কোপানো জমিতে পানি দেওয়া যায়।" };
    if (ts.wet) return { ok: false, msg: "আজ এখানে পানি দেওয়া হয়ে গেছে।" };
    if (!spend(state, D.TOOLS.can.energy)) return { ok: false, msg: "শরীর ক্লান্ত। ঘুমাতে হবে।" };
    ts.wet = true;
    return { ok: true, msg: "পানি দেওয়া হলো।" };
  }

  function cropSeasonOk(cropId, seasonIdx) { return D.CROPS[cropId].seasons.indexOf(seasonIdx) >= 0; }

  function plant(state, mapId, x, y, seedId) {
    var info = D.itemInfo(seedId);
    if (!info || info.kind !== "seed") return { ok: false, msg: "এটা বীজ না।" };
    var ts = tileState(state, mapId, x, y);
    if (!ts || !ts.till) return { ok: false, msg: "আগে জমি কোপাতে হবে।" };
    if (ts.crop) return { ok: false, msg: "এখানে আগে থেকেই ফসল আছে।" };
    if ((state.inv[seedId] || 0) <= 0) return { ok: false, msg: "এই বীজ নেই।" };
    if (!cropSeasonOk(info.crop, seasonIndex(state.clock.day))) return { ok: false, msg: "এখন এই বীজ বোনার সময় না।" };
    if (!spend(state, 2)) return { ok: false, msg: "শরীর ক্লান্ত। ঘুমাতে হবে।" };
    state.inv[seedId] -= 1;
    ts.crop = { id: info.crop, prog: 0 };
    state.stats.planted += 1;
    return { ok: true, msg: D.CROPS[info.crop].name + " বোনা হলো।" };
  }

  function harvest(state, mapId, x, y) {
    var ts = tileState(state, mapId, x, y);
    if (!ts || !ts.crop) return { ok: false, msg: "এখানে ফসল নেই।" };
    var crop = D.CROPS[ts.crop.id];
    if (ts.crop.prog < crop.grow) return { ok: false, msg: crop.name + " এখনো তৈরি হয়নি।" };
    var qty = Math.random() < 0.2 ? 2 : 1;
    var itemId = "crop_" + crop.id;
    state.inv[itemId] = (state.inv[itemId] || 0) + qty;
    state.stats.harvested += 1;
    if (crop.regrow > 0) ts.crop.prog = crop.grow - crop.regrow;
    else delete ts.crop;
    return { ok: true, item: itemId, qty: qty, msg: crop.name + " তোলা হলো" + (qty > 1 ? " (" + qty + "টি)" : "") + "।" };
  }

  // Weighted random fish for the current season. Returns fish id or null.
  function pickFish(seasonIdx, rnd) {
    rnd = rnd || Math.random;
    var keys = Object.keys(D.FISH).filter(function (k) { return D.FISH[k].seasons.indexOf(seasonIdx) >= 0; });
    if (!keys.length) return null;
    var total = 0;
    keys.forEach(function (k) { total += D.FISH[k].rarity; });
    var r = rnd() * total;
    for (var i = 0; i < keys.length; i++) {
      r -= D.FISH[keys[i]].rarity;
      if (r <= 0) return keys[i];
    }
    return keys[keys.length - 1];
  }
  function catchFish(state, fishId) {
    var id = "fish_" + fishId;
    state.inv[id] = (state.inv[id] || 0) + 1;
    state.stats.fish += 1;
    return { ok: true, item: id, msg: D.FISH[fishId].name + " ধরা পড়েছে!" };
  }
  function castCost(state) { return spend(state, D.TOOLS.rod.energy); }

  function sell(state, itemId, qty) {
    var info = D.itemInfo(itemId);
    qty = qty || 1;
    if (!info || (info.kind !== "crop" && info.kind !== "fish")) return { ok: false, msg: "এটা বিক্রি করা যাবে না।" };
    var have = state.inv[itemId] || 0;
    if (have <= 0) return { ok: false, msg: "তোমার কাছে এটা নেই।" };
    qty = Math.min(qty, have);
    var gain = info.price * qty;
    state.inv[itemId] -= qty;
    if (state.inv[itemId] === 0) delete state.inv[itemId];
    state.player.coins += gain;
    state.stats.earned += gain;
    return { ok: true, gain: gain, msg: info.name + " × " + qty + " বিক্রি হলো (+" + gain + " টাকা)" };
  }

  function buy(state, seedId, qty) {
    var info = D.itemInfo(seedId);
    qty = qty || 1;
    if (!info || info.kind !== "seed") return { ok: false, msg: "এটা বীজ না।" };
    if (!cropSeasonOk(info.crop, seasonIndex(state.clock.day))) return { ok: false, msg: "এই মৌসুমে এই বীজ পাওয়া যায় না।" };
    var cost = info.price * qty;
    if (state.player.coins < cost) return { ok: false, msg: "টাকা কম আছে।" };
    state.player.coins -= cost;
    state.inv[seedId] = (state.inv[seedId] || 0) + qty;
    return { ok: true, msg: info.name + " × " + qty + " কেনা হলো।" };
  }

  function seedsForSeason(seasonIdx) {
    return Object.keys(D.CROPS).filter(function (k) { return D.CROPS[k].seasons.indexOf(seasonIdx) >= 0; })
      .map(function (k) { return "seed_" + k; });
  }

  function talk(state, npcId) {
    var f = state.friend[npcId], day = state.clock.day;
    state.stats.talked[npcId] = true;
    var gained = 0;
    if (f.talkDay !== day) {
      f.talkDay = day;
      gained = D.TALK_POINTS;
      f.pts = Math.min(D.FRIEND_MAX, f.pts + gained);
    }
    var lines = D.NPCS[npcId].lines;
    var line = lines[(day + npcId.length) % lines.length];
    return { ok: true, line: line, gained: gained };
  }

  function giftKind(npc, itemId) {
    if (npc.likes.indexOf(itemId) >= 0) return "like";
    if (npc.hates.indexOf(itemId) >= 0) return "hate";
    return "neutral";
  }
  function gift(state, npcId, itemId) {
    var npc = D.NPCS[npcId], f = state.friend[npcId];
    if ((state.inv[itemId] || 0) <= 0) return { ok: false, msg: "তোমার কাছে এই জিনিস নেই।" };
    var info = D.itemInfo(itemId);
    if (!info || info.kind === "seed" || info.kind === "tool") return { ok: false, msg: "এটা উপহার হিসেবে দেওয়া যায় না।" };
    var week = weekOf(state.clock.day);
    if (f.giftWeek === week) return { ok: false, msg: "এই সপ্তাহে " + npc.name + "কে আর উপহার দেওয়া যাবে না।" };
    var kind = giftKind(npc, itemId);
    var delta = kind === "like" ? D.GIFT_LIKE : kind === "hate" ? D.GIFT_HATE : D.GIFT_NEUTRAL;
    f.pts = Math.max(0, Math.min(D.FRIEND_MAX, f.pts + delta));
    f.giftWeek = week;
    state.inv[itemId] -= 1;
    if (state.inv[itemId] === 0) delete state.inv[itemId];
    return { ok: true, kind: kind, delta: delta, line: npc.giftLines[kind], msg: npc.name + " উপহার পেলেন (" + (delta >= 0 ? "+" : "") + delta + ")" };
  }

  // ---------- day change ----------
  function rollWeather(seasonIdx, rnd) {
    rnd = rnd || Math.random;
    var r = rnd(), rain = D.SEASONS[seasonIdx].rain;
    if (r < rain) return "rain";
    if (r < rain + 0.25) return "cloudy";
    return "sunny";
  }

  // Called when the player sleeps (or passes out). Growth uses this day's watering.
  function sleepNight(state, opts) {
    opts = opts || {};
    var rnd = opts.rnd || Math.random;
    var report = { grown: 0, withered: [], messages: [], passedOut: !!opts.passedOut, newSeason: false, weather: null };
    var oldSeason = seasonIndex(state.clock.day);

    Object.keys(state.tiles).forEach(function (mapId) {
      var m = state.tiles[mapId];
      Object.keys(m).forEach(function (k) {
        var ts = m[k];
        if (!ts.crop) return;
        var crop = D.CROPS[ts.crop.id];
        if (ts.wet && ts.crop.prog < crop.grow) { ts.crop.prog += 1; report.grown += 1; }
        ts.wet = false;
      });
    });

    state.clock.day += 1;
    state.clock.t = 0;
    state.player.energy = D.MAX_ENERGY;
    var newSeason = seasonIndex(state.clock.day);
    report.newSeason = newSeason !== oldSeason;

    // crops of a season that ended wither (gentle but real pressure)
    if (report.newSeason) {
      Object.keys(state.tiles).forEach(function (mapId) {
        var m = state.tiles[mapId];
        Object.keys(m).forEach(function (k) {
          var ts = m[k];
          if (ts.crop && !cropSeasonOk(ts.crop.id, newSeason)) {
            report.withered.push(D.CROPS[ts.crop.id].name);
            delete ts.crop;
          }
        });
      });
    }

    state.weather = rollWeather(newSeason, rnd);
    if (state.weather === "rain") {
      Object.keys(state.tiles).forEach(function (mapId) {
        var m = state.tiles[mapId];
        Object.keys(m).forEach(function (k) { if (m[k].till) m[k].wet = true; });
      });
    }
    report.weather = state.weather;
    return report;
  }

  function checkQuests(state) {
    var done = [];
    D.QUESTS.forEach(function (q) {
      if (state.quests.claimed[q.id]) return;
      if (q.check(state)) {
        state.quests.claimed[q.id] = true;
        state.player.coins += q.reward;
        done.push(q);
      }
    });
    return done;
  }

  CF.Engine = {
    SAVE_VERSION: SAVE_VERSION,
    seasonIndex: seasonIndex, dayInSeason: dayInSeason, yearOf: yearOf, weekOf: weekOf,
    hourOf: hourOf, clockText: clockText, dayPart: dayPart,
    newState: newState, serialize: serialize, deserialize: deserialize,
    occupancy: occupancy, tileChar: tileChar, isWalkableTile: isWalkableTile,
    objectAt: objectAt, portalAt: portalAt, tileState: tileState, ensureTile: ensureTile,
    npcPosition: npcPosition, hearts: hearts, friendLevel: friendLevel,
    advanceTime: advanceTime,
    canTill: canTill, till: till, water: water, plant: plant, harvest: harvest,
    pickFish: pickFish, catchFish: catchFish,
    sell: sell, buy: buy, seedsForSeason: seedsForSeason,
    talk: talk, gift: gift, giftKind: giftKind,
    rollWeather: rollWeather, sleepNight: sleepNight, checkQuests: checkQuests,
    castCost: castCost
  };
})(typeof window !== "undefined" ? window : globalThis);
