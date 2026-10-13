/* Unit tests for pure game rules. Run: node game/tests/test.js */
"use strict";
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var base = path.join(__dirname, "..", "js");
var ctx = { console: console };
ctx.window = ctx; // modules attach to window (= sandbox global)
vm.createContext(ctx);
["data.js", "maps.js", "engine.js"].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(base, f), "utf8"), ctx, { filename: f });
});
var CF = ctx.CF, D = CF.Data, E = CF.Engine, M = CF.Maps;

var failures = 0, passes = 0;
function test(name, fn) {
  try { fn(); passes++; console.log("  ok  " + name); }
  catch (e) { failures++; console.log("  FAIL " + name + "\n       " + (e && e.message)); }
}
function eq(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((msg || "") + " expected " + JSON.stringify(b) + " got " + JSON.stringify(a));
}
function ok(c, msg) { if (!c) throw new Error(msg || "assertion failed"); }

console.log("Maps");
test("every map row has the declared width and height", function () {
  Object.keys(M).forEach(function (id) {
    var m = M[id];
    eq(m.rows.length, m.h, id + " height");
    m.rows.forEach(function (r, i) { eq(r.length, m.w, id + " row " + i); });
  });
});
test("objects stay inside the map", function () {
  Object.keys(M).forEach(function (id) {
    M[id].objects.forEach(function (o) {
      ok(o.x >= 0 && o.y >= 0 && o.x + o.w <= M[id].w && o.y + o.h <= M[id].h, id + " " + o.type);
    });
  });
});
test("spawn and portal arrival tiles are walkable", function () {
  Object.keys(M).forEach(function (id) {
    var m = M[id];
    ok(E.isWalkableTile(id, m.spawn.x, m.spawn.y), id + " spawn");
    m.portals.forEach(function (p) {
      ok(M[p.to], "portal target map exists " + p.to);
      ok(E.isWalkableTile(p.to, p.tx, p.ty), "arrival walkable " + id + "->" + p.to + " " + p.tx + "," + p.ty);
    });
  });
});
test("every NPC schedule position is walkable for every hour", function () {
  Object.keys(D.NPCS).forEach(function (id) {
    for (var h = 6; h < 26; h++) {
      var pos = E.npcPosition(id, (h - 6) * 60);
      ok(E.isWalkableTile(pos.map, pos.x, pos.y), id + " at hour " + h + " -> " + pos.x + "," + pos.y);
    }
  });
});

console.log("Calendar");
test("game starts in autumn on day 25", function () {
  var s = E.newState({ name: "x" });
  eq(s.clock.day, 25); eq(E.seasonIndex(s.clock.day), 2);
  eq(E.dayInSeason(s.clock.day), 1);
});
test("season and year rollover", function () {
  eq(E.seasonIndex(12), 0); eq(E.seasonIndex(13), 1); eq(E.seasonIndex(73), 0);
  eq(E.yearOf(72), 1); eq(E.yearOf(73), 2);
});
test("clock text and forced sleep at 02:00", function () {
  eq(E.clockText(0), "06:00"); eq(E.clockText(1200), "02:00");
  var s = E.newState({}); ok(!E.advanceTime(s, 1199)); ok(E.advanceTime(s, 1));
});

console.log("Farming");
test("till, water, plant, grow, harvest", function () {
  var s = E.newState({});
  // find a soil tile
  var x = 9, y = 4;
  eq(E.till(s, "farm", x, y).ok, true, "till");
  eq(E.till(s, "farm", x, y).ok, false, "double till");
  eq(E.water(s, "farm", x, y).ok, true, "water");
  eq(E.water(s, "farm", x, y).ok, false, "double water same day");
  eq(E.plant(s, "farm", x, y, "seed_begun").ok, true, "plant");
  eq(s.inv.seed_begun, 7);
  for (var d = 0; d < 5; d++) {
    E.sleepNight(s, { rnd: function () { return 0.99; } }); // sunny in autumn
    E.water(s, "farm", x, y);
  }
  eq(E.harvest(s, "farm", x, y).ok, true, "harvest after 5 watered days");
  ok((s.inv.crop_begun || 0) >= 1, "got crop");
  // brinjal regrows, so the tile still has a crop
  ok(E.tileState(s, "farm", x, y).crop, "regrow keeps plant");
});
test("unwatered crops do not grow", function () {
  var s = E.newState({});
  E.till(s, "farm", 9, 5); E.plant(s, "farm", 9, 5, "seed_begun");
  E.sleepNight(s, { rnd: function () { return 0.99; } });
  eq(E.tileState(s, "farm", 9, 5).crop.prog, 0);
});
test("cannot plant out of season", function () {
  var s = E.newState({});
  s.inv.seed_dhan = 1; // not a real item: must be rejected
  E.till(s, "farm", 9, 6);
  eq(E.plant(s, "farm", 9, 6, "seed_dhan").ok, false);
  s.inv.seed_alu = 1;
  eq(E.plant(s, "farm", 9, 6, "seed_alu").ok, false, "potato not in autumn");
});
test("crops wither when their season ends", function () {
  var s = E.newState({});
  s.clock.day = 36; // last day of autumn
  E.till(s, "farm", 9, 7); E.plant(s, "farm", 9, 7, "seed_begun");
  var rep = E.sleepNight(s, { rnd: function () { return 0.99; } });
  ok(rep.newSeason, "season changed");
  ok(!E.tileState(s, "farm", 9, 7).crop, "brinjal withered in late autumn");
  eq(rep.withered.length, 1);
});
test("rain waters every tilled tile", function () {
  var s = E.newState({});
  E.till(s, "farm", 10, 4);
  E.sleepNight(s, { rnd: function () { return 0.0; } }); // forces rain
  eq(s.weather, "rain");
  ok(E.tileState(s, "farm", 10, 4).wet, "rain wet");
});
test("pond fish is season-appropriate", function () {
  for (var i = 0; i < 50; i++) {
    var f = E.pickFish(1, function () { return Math.random(); });
    ok(D.FISH[f].seasons.indexOf(1) >= 0, "fish " + f + " in monsoon");
  }
});

console.log("Economy");
test("buy and sell update coins and stats", function () {
  var s = E.newState({});
  var before = s.player.coins;
  eq(E.buy(s, "seed_chili", 2).ok, true);
  eq(s.player.coins, before - 2 * D.CROPS.chili.seed);
  s.inv.crop_chili = 3;
  var r = E.sell(s, "crop_chili", 3);
  eq(r.gain, 3 * D.CROPS.chili.price);
  eq(s.stats.earned, 3 * D.CROPS.chili.price);
  eq(E.sell(s, "seed_chili", 1).ok, false, "cannot sell seeds");
});
test("cannot buy seeds out of season", function () {
  var s = E.newState({});
  eq(E.buy(s, "seed_sarisha", 1).ok, false);
});

console.log("Friendship & quests");
test("talking gives points once per day", function () {
  var s = E.newState({});
  eq(E.talk(s, "ameena").gained, D.TALK_POINTS);
  eq(E.talk(s, "ameena").gained, 0);
  eq(s.friend.ameena.pts, D.TALK_POINTS);
});
test("gift: liked gift gives more than disliked; one gift per week", function () {
  var s = E.newState({});
  s.inv.fish_magur = 2; s.inv.fish_puti = 2;
  var a = E.gift(s, "rafiq", "fish_magur");
  eq(a.kind, "like"); eq(s.friend.rafiq.pts, D.GIFT_LIKE);
  var b = E.gift(s, "rafiq", "fish_puti");
  eq(b.ok, false, "second gift same week");
  s.clock.day += 7;
  var c = E.gift(s, "ameena", "fish_puti");
  eq(c.kind, "hate");
});
test("hearts scale with points", function () {
  eq(E.hearts(0), 0); eq(E.hearts(249), 0); eq(E.hearts(250), 1); eq(E.hearts(9999), 8);
});
test("quests pay out once", function () {
  var s = E.newState({});
  s.stats.planted = 1;
  var first = E.checkQuests(s);
  eq(first.length, 1); eq(first[0].id, "q_seed");
  eq(E.checkQuests(s).length, 0);
});

console.log("Save");
test("serialize / deserialize round trip", function () {
  var s = E.newState({ name: "রাশেদ", gender: "m" });
  E.till(s, "farm", 9, 4);
  var copy = E.deserialize(E.serialize(s));
  eq(copy.player.name, "রাশেদ");
  ok(E.tileState(copy, "farm", 9, 4).till);
});
test("unknown save version is rejected", function () {
  var bad = true;
  try { E.deserialize('{"v":99}'); } catch (e) { bad = false; }
  ok(!bad, "should throw");
});

console.log("\n" + passes + " passed, " + failures + " failed");
process.exit(failures ? 1 : 0);
