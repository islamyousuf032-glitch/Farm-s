/* চালাবন ফার্ম — map definitions.
 * Legend (grid chars):
 *   .  grass           f  flower grass (walkable)     S  red soil (tillable)
 *   P  mud path        T  pond bank (walkable)        W  pond water (fish, not walkable)
 *   #  sal tree (blocked)  B  bamboo (blocked)        R  rock (blocked)
 * Objects: {type, x, y, w, h, interact?, block?} — footprint blocks unless block === false.
 * Portals: {x, y, to, tx, ty} — stepping on (x,y) moves to map `to` at (tx,ty).
 */
(function (root) {
  "use strict";
  var CF = (root.CF = root.CF || {});

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeGrid(w, h, ch) {
    var g = [];
    for (var y = 0; y < h; y++) { var r = []; for (var x = 0; x < w; x++) r.push(ch); g.push(r); }
    return g;
  }
  function rect(g, x1, y1, x2, y2, ch) {
    for (var y = y1; y <= y2; y++) for (var x = x1; x <= x2; x++) g[y][x] = ch;
  }
  function toRows(g) { return g.map(function (r) { return r.join(""); }); }
  function scatter(g, rnd, ch, count, allowed) {
    var placed = 0, tries = 0;
    while (placed < count && tries < 5000) {
      tries++;
      var x = Math.floor(rnd() * g[0].length), y = Math.floor(rnd() * g.length);
      if (allowed.indexOf(g[y][x]) >= 0) { g[y][x] = ch; placed++; }
    }
  }

  // ---------- Farm: লালমাটি ফার্ম ----------
  function buildFarm() {
    var rnd = mulberry32(20261013);
    var g = makeGrid(26, 16, ".");
    rect(g, 0, 0, 25, 0, "#");
    rect(g, 0, 15, 25, 15, "#");
    rect(g, 0, 0, 0, 15, "#");
    rect(g, 25, 0, 25, 15, "#");
    rect(g, 25, 7, 25, 8, "P");           // exit to village
    rect(g, 8, 3, 16, 11, "S");           // red soil field
    rect(g, 3, 4, 3, 5, "P");             // door path
    rect(g, 3, 6, 7, 6, "P");             // path to field
    rect(g, 7, 3, 7, 12, "P");            // field edge path
    rect(g, 19, 9, 24, 14, "T");          // pond bank
    rect(g, 20, 10, 23, 13, "W");         // pond water
    rect(g, 21, 1, 24, 2, "B");           // bamboo grove
    rect(g, 2, 11, 3, 12, "#");           // sal clump
    rect(g, 1, 13, 1, 14, "#");
    set(g, 5, 13, "R"); set(g, 14, 14, "R");
    scatter(g, rnd, "f", 26, ["."]);
    scatter(g, rnd, "#", 2, ["."]);

    return {
      id: "farm", name: "লালমাটি ফার্ম", w: 26, h: 16, ambient: "farm",
      rows: toRows(g),
      objects: [
        { type: "house", x: 1, y: 1, w: 6, h: 3, label: "আমাদের চালা ঘর" },
        { type: "bin", x: 17, y: 5, w: 1, h: 1, interact: "bin", label: "বিক্রয়-বাক্স" },
        { type: "scarecrow", x: 12, y: 2, w: 1, h: 1 },
        { type: "sign", x: 24, y: 9, w: 1, h: 1, label: "চালাবন গ্রাম → পূর্ব দিকে" }
      ],
      portals: [
        { x: 3, y: 4, to: "home", tx: 4, ty: 5 },
        { x: 25, y: 7, to: "village", tx: 1, ty: 7 },
        { x: 25, y: 8, to: "village", tx: 1, ty: 8 }
      ],
      spawn: { x: 4, y: 6 },
      npcs: []
    };
  }

  // ---------- Village: চালাবন গ্রাম ----------
  function buildVillage() {
    var rnd = mulberry32(7310);
    var g = makeGrid(28, 16, ".");
    rect(g, 0, 0, 27, 0, "#");
    rect(g, 0, 15, 27, 15, "#");
    rect(g, 0, 0, 0, 15, "#");
    rect(g, 27, 0, 27, 15, "#");
    rect(g, 0, 7, 0, 8, "P");              // exit to farm (west)
    rect(g, 1, 6, 26, 8, "P");             // main road
    rect(g, 4, 9, 24, 13, "P");            // uthan (courtyard)
    rect(g, 7, 11, 11, 14, "T");           // pond bank
    rect(g, 8, 12, 10, 13, "W");           // pond
    rect(g, 1, 12, 2, 14, "B");            // bamboo grove
    set(g, 12, 13, "#"); set(g, 13, 13, "#"); set(g, 12, 14, "#");
    set(g, 26, 14, "#");
    rect(g, 20, 13, 21, 14, "R");
    scatter(g, rnd, "f", 30, ["."]);
    scatter(g, rnd, "#", 3, ["."]);

    return {
      id: "village", name: "চালাবন গ্রাম", w: 28, h: 16, ambient: "village",
      rows: toRows(g),
      objects: [
        { type: "house", x: 3, y: 2, w: 5, h: 3, label: "রফিকের ঘর" },
        { type: "shop", x: 14, y: 2, w: 4, h: 3, label: "আমেনা মুদি দোকান" },
        { type: "counter", x: 15, y: 5, w: 1, h: 1, interact: "shop", label: "দোকান" },
        { type: "house", x: 21, y: 2, w: 5, h: 3, label: "মজিদ চাচার ঘর" },
        { type: "school", x: 21, y: 10, w: 6, h: 3, label: "প্রাথমিক বিদ্যালয়" },
        { type: "well", x: 10, y: 9, w: 1, h: 1, label: "গ্রামের কুয়া" },
        { type: "bench", x: 18, y: 9, w: 2, h: 1, block: false },
        { type: "rickshaw", x: 4, y: 7, w: 1, h: 1, block: false, label: "রিকশা স্ট্যান্ড" }
      ],
      portals: [
        { x: 0, y: 7, to: "farm", tx: 24, ty: 7 },
        { x: 0, y: 8, to: "farm", tx: 24, ty: 8 }
      ],
      spawn: { x: 2, y: 7 },
      npcs: ["ameena", "mojid", "rafiq", "shiuli"]
    };
  }

  // ---------- Home interior: ঘর ----------
  function buildHome() {
    var g = makeGrid(10, 7, "#");
    rect(g, 1, 1, 8, 5, "h");       // wood floor
    set(g, 4, 6, "P");              // door
    return {
      id: "home", name: "আমাদের ঘর", w: 10, h: 7, ambient: "home",
      rows: toRows(g),
      objects: [
        { type: "bed", x: 2, y: 1, w: 2, h: 1, interact: "bed", label: "বিছানা" },
        { type: "box", x: 7, y: 1, w: 1, h: 1, interact: "box", label: "কাঠের বাক্স" },
        { type: "table", x: 6, y: 4, w: 1, h: 1, label: "ছোট টেবিল" },
        { type: "rug", x: 3, y: 3, w: 2, h: 1, block: false }
      ],
      portals: [{ x: 4, y: 6, to: "farm", tx: 3, ty: 5 }],
      spawn: { x: 4, y: 5 },
      npcs: []
    };
  }

  function set(g, x, y, ch) { if (g[y] && x >= 0 && x < g[y].length) g[y][x] = ch; }

  CF.Maps = {
    farm: buildFarm(),
    village: buildVillage(),
    home: buildHome()
  };
  CF.mulberry32 = mulberry32;
})(typeof window !== "undefined" ? window : globalThis);
