/* চালাবন ফার্ম — procedural art. Everything is drawn in code (no copied or external art).
 * World units: 1 tile = T (48) px. Renderer applies camera + zoom transform.
 * Style: flat storybook colours, warm dark outline, soft highlight, season-aware palettes.
 */
(function (root) {
  "use strict";
  var CF = (root.CF = root.CF || {});
  var T = 48;
  var OUT = "#2b1d14";              // outline colour
  var cache = {};
  var cacheCount = 0;
  var CACHE_LIMIT = 900;

  function mk(w, h) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }
  function cached(key, w, h, draw) {
    if (cache[key]) return cache[key];
    if (cacheCount > CACHE_LIMIT) { cache = {}; cacheCount = 0; }
    var c = mk(w, h), g = c.getContext("2d");
    draw(g, w, h);
    cache[key] = c; cacheCount++;
    return c;
  }
  function hash(x, y, s) {
    var n = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0;
    n = (n ^ (n >>> 13)) * 1274126177 | 0;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function c(v) { return Math.max(0, Math.min(255, Math.round(v + amt))); }
    return "rgb(" + c(r) + "," + c(g) + "," + c(b) + ")";
  }
  function ellipse(g, x, y, rx, ry, fill, stroke) {
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    g.fillStyle = fill; g.fill();
    if (stroke) { g.lineWidth = 1.4; g.strokeStyle = stroke; g.stroke(); }
  }

  // ---------- ground tiles ----------
  function seasonPal(si) { return CF.Data.SEASONS[si].palette; }

  function groundTile(kind, si, variant, tilled, wet, frame) {
    var key = ["g", kind, si, variant, tilled ? 1 : 0, wet ? 1 : 0, frame].join("|");
    return cached(key, T, T, function (g) {
      var p = seasonPal(si);
      if (kind === "W") { waterTile(g, frame); return; }
      if (kind === "P" || kind === "h") { pathTile(g, kind, variant); return; }
      if (kind === "w") { wallTile(g, si, variant); return; }
      if (kind === "S") { soilTile(g, p, variant, tilled, wet); return; }
      if (kind === "T") { bankTile(g, p, variant); return; }
      grassTile(g, p, variant, kind === "f");
    });
  }

  function grassTile(g, p, v, flowers) {
    g.fillStyle = v % 2 ? p.grass : p.grass2;
    g.fillRect(0, 0, T, T);
    for (var i = 0; i < 14; i++) {
      var x = hash(i, v, 1) * T, y = hash(i, v, 2) * T;
      g.fillStyle = hash(i, v, 3) > 0.5 ? shade(p.grass, -22) : shade(p.grass, 18);
      g.fillRect(x, y, 2, 3 + hash(i, v, 4) * 3);
    }
    if (flowers) {
      var cols = ["#fff6c8", "#ffd23f", "#f49ac1", "#ffffff"];
      for (var k = 0; k < 4; k++) {
        var fx = 6 + hash(k, v, 5) * 36, fy = 6 + hash(k, v, 6) * 36;
        g.fillStyle = cols[(k + v) % cols.length];
        g.beginPath(); g.arc(fx, fy, 2.6, 0, 7); g.fill();
        g.fillStyle = "#d9a100"; g.beginPath(); g.arc(fx, fy, 0.9, 0, 7); g.fill();
      }
    }
  }

  function soilTile(g, p, v, tilled, wet) {
    g.fillStyle = p.soil; g.fillRect(0, 0, T, T);
    for (var i = 0; i < 18; i++) {
      g.fillStyle = hash(i, v, 11) > 0.5 ? shade(p.soil, -30) : shade(p.soil, 24);
      g.beginPath(); g.arc(hash(i, v, 12) * T, hash(i, v, 13) * T, 1 + hash(i, v, 14) * 1.6, 0, 7); g.fill();
    }
    if (tilled) {
      // raised furrows
      for (var r = 0; r < 3; r++) {
        var y = 8 + r * 15;
        g.fillStyle = shade(p.soil, -42); g.fillRect(4, y + 3, T - 8, 4);
        g.fillStyle = shade(p.soil, 22); g.fillRect(4, y, T - 8, 3);
      }
      if (wet) {
        g.fillStyle = "rgba(30,18,10,0.28)"; g.fillRect(0, 0, T, T);
        g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(6, 6, 14, 2); g.fillRect(28, 30, 10, 2);
      }
    } else {
      g.strokeStyle = shade(p.soil, -40); g.lineWidth = 1;
      g.beginPath(); g.moveTo(10 + v * 3, 10); g.lineTo(18 + v * 2, 22); g.lineTo(12, 30); g.stroke();
    }
  }

  function pathTile(g, kind, v) {
    var base = kind === "h" ? "#b07a4a" : "#c9a878";
    g.fillStyle = base; g.fillRect(0, 0, T, T);
    if (kind === "h") {
      g.strokeStyle = shade(base, -28); g.lineWidth = 1.2;
      for (var y = 0; y < T; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(T, y); g.stroke(); }
      g.beginPath(); g.moveTo(T * 0.5, 0); g.lineTo(T * 0.5, 12); g.stroke();
      return;
    }
    g.strokeStyle = shade(base, -30); g.lineWidth = 1.5;
    for (var r = 0; r < 4; r++) {
      var yy = r * 12;
      g.beginPath(); g.moveTo(0, yy); g.lineTo(T, yy); g.stroke();
      var off = (r % 2) * 12 + (v % 2) * 6;
      for (var x = off; x < T + 12; x += 24) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x, yy + 12); g.stroke(); }
    }
    for (var i = 0; i < 10; i++) {
      g.fillStyle = hash(i, v, 21) > 0.5 ? shade(base, 14) : shade(base, -12);
      g.fillRect(hash(i, v, 22) * T, hash(i, v, 23) * T, 2, 2);
    }
  }

  // interior wall: plaster with brick base (blocked tiles inside houses)
  function wallTile(g, si, v) {
    g.fillStyle = "#e9dcc0"; g.fillRect(0, 0, T, T);
    g.fillStyle = "#c9a878"; g.fillRect(0, T - 16, T, 16);
    g.strokeStyle = "rgba(90,60,35,0.35)"; g.lineWidth = 1;
    for (var y = T - 16; y < T; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(T, y); g.stroke(); }
    for (var i = 0; i < 6; i++) { g.fillStyle = hash(i, v, 51) > 0.5 ? "rgba(120,90,60,0.12)" : "rgba(255,255,255,0.25)"; g.fillRect(hash(i, v, 52) * T, hash(i, v, 53) * (T - 16), 6, 4); }
    g.fillStyle = "rgba(60,40,20,0.25)"; g.fillRect(0, 0, T, 3);
  }

  function bankTile(g, p, v) {
    g.fillStyle = "#b99867"; g.fillRect(0, 0, T, T);
    for (var i = 0; i < 12; i++) {
      g.fillStyle = hash(i, v, 31) > 0.5 ? "#a58256" : "#cdb084";
      g.beginPath(); g.arc(hash(i, v, 32) * T, hash(i, v, 33) * T, 2, 0, 7); g.fill();
    }
    g.fillStyle = shade(p.grass, -8);
    g.fillRect(0, 0, T, 5); g.fillRect(0, 0, 4, T);
  }

  function waterTile(g, frame) {
    var grd = g.createLinearGradient(0, 0, 0, T);
    grd.addColorStop(0, "#3b86a6"); grd.addColorStop(1, "#21566f");
    g.fillStyle = grd; g.fillRect(0, 0, T, T);
    g.strokeStyle = "rgba(220,245,255,0.45)"; g.lineWidth = 1.6;
    var off = frame ? 6 : 0;
    for (var r = 0; r < 3; r++) {
      var y = 10 + r * 14;
      g.beginPath();
      for (var x = 0; x <= T; x += 6) {
        var yy = y + Math.sin((x + off + r * 9) / 6) * 1.6;
        if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
      }
      g.stroke();
    }
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.beginPath(); g.arc(frame ? 34 : 14, frame ? 14 : 30, 1.8, 0, 7); g.fill();
  }

  // ---------- overlay tiles (drawn on top of ground) ----------
  // Sal tree canopy (blocked '#'): drawn Y-sorted at base of tile.
  function drawSalTree(g, cx, base, si, variant) {
    var p = seasonPal(si);
    var leaf = p.leaf;
    // trunk
    g.fillStyle = "#6b4a30";
    g.beginPath(); g.moveTo(cx - 4, base); g.lineTo(cx - 2.5, base - 26); g.lineTo(cx + 2.5, base - 26); g.lineTo(cx + 4, base); g.closePath(); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 1; g.stroke();
    // canopy lobes
    var lobes = [[0, -46, 25, 22], [-14, -36, 17, 16], [14, -36, 17, 16], [-6, -62, 16, 14], [10, -60, 14, 13]];
    lobes.forEach(function (l, i) {
      var tint = i % 2 ? shade(leaf, 8) : shade(leaf, -6);
      ellipse(g, cx + l[0], base + l[1] + (variant % 3), l[2], l[3], tint, OUT);
    });
    // light flecks
    for (var k = 0; k < 6; k++) {
      g.fillStyle = "rgba(255,240,170,0.22)";
      g.beginPath(); g.arc(cx + (hash(k, variant, 41) - 0.5) * 40, base - 40 - hash(k, variant, 42) * 42, 2.2, 0, 7); g.fill();
    }
    // season accent: sal blossoms/leaf change
    if (si === 5) { g.fillStyle = "#ffd6e6"; g.beginPath(); g.arc(cx - 8, base - 70, 2, 0, 7); g.fill(); }
    if (si === 2 || si === 3) { g.fillStyle = "#e0a040"; g.beginPath(); g.arc(cx + 12, base - 58, 2, 0, 7); g.fill(); }
  }

  function drawBamboo(g, cx, base, si) {
    var p = seasonPal(si);
    var stalks = [cx - 12, cx - 4, cx + 4, cx + 12];
    stalks.forEach(function (sx, i) {
      var top = base - 88 - (i % 2) * 8;
      g.fillStyle = i % 2 ? "#7fa24a" : "#6e9340";
      g.fillRect(sx - 3, top, 6, base - top);
      g.strokeStyle = OUT; g.lineWidth = 1; g.strokeRect(sx - 3, top, 6, base - top);
      g.fillStyle = "#4c6e2a";
      for (var n = top + 10; n < base; n += 16) g.fillRect(sx - 3, n, 6, 2);
      // leaves
      g.fillStyle = shade(p.leaf, 10);
      g.beginPath(); g.ellipse(sx + 7, top + 8, 9, 3, -0.5, 0, 7); g.fill();
      g.beginPath(); g.ellipse(sx - 7, top + 26, 9, 3, 0.5, 0, 7); g.fill();
    });
  }

  function drawRock(g, cx, base) {
    ellipse(g, cx, base - 10, 16, 10, "#9a9385", OUT);
    ellipse(g, cx - 4, base - 14, 6, 3, "#c4bdae");
  }

  // ---------- buildings & props ----------
  function roof(g, x, y, w, h, color) {
    // corrugated tin roof: trapezoid with ridge
    g.beginPath();
    g.moveTo(x - 6, y + h); g.lineTo(x + 8, y); g.lineTo(x + w - 8, y); g.lineTo(x + w + 6, y + h); g.closePath();
    g.fillStyle = color; g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = shade(color, -38); g.lineWidth = 1;
    for (var rx = x - 2; rx < x + w + 4; rx += 6) { g.beginPath(); g.moveTo(rx, y + h); g.lineTo(rx + (rx - (x + w / 2)) * 0.12, y + 2); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.22)"; g.fillRect(x + 8, y + 2, w - 16, 3);
  }

  function walls(g, x, y, w, h, color, trim) {
    g.fillStyle = color; g.fillRect(x, y, w, h);
    g.strokeStyle = OUT; g.lineWidth = 1.5; g.strokeRect(x, y, w, h);
    g.fillStyle = trim; g.fillRect(x, y + h - 10, w, 10);
    g.strokeStyle = shade(trim, -30); g.lineWidth = 1;
    for (var bx = x; bx < x + w; bx += 14) { g.beginPath(); g.moveTo(bx, y + h - 10); g.lineTo(bx, y + h); g.stroke(); }
  }

  function windowPane(g, x, y, w, h) {
    g.fillStyle = "#7fb7c9"; g.fillRect(x, y, w, h);
    g.strokeStyle = OUT; g.lineWidth = 1.2; g.strokeRect(x, y, w, h);
    g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h / 2); g.lineTo(x + w, y + h / 2); g.stroke();
  }

  function doorWood(g, x, y, w, h) {
    g.fillStyle = "#7a4a2a"; g.fillRect(x, y, w, h);
    g.strokeStyle = OUT; g.lineWidth = 1.2; g.strokeRect(x, y, w, h);
    g.strokeStyle = "#5a331b";
    g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.stroke();
    g.fillStyle = "#e2c26a"; g.beginPath(); g.arc(x + w - 4, y + h / 2, 1.6, 0, 7); g.fill();
  }

  function label(g, text, x, y, w, fill) {
    var fs = 13;
    g.font = "700 " + fs + "px 'Hind Siliguri', 'Noto Sans Bengali', sans-serif";
    var tw = g.measureText(text).width + 12;
    g.fillStyle = fill || "#f7e7bf";
    g.strokeStyle = OUT; g.lineWidth = 1.5;
    rr(g, x + w / 2 - tw / 2, y - 14, tw, 19, 5); g.fill(); g.stroke();
    g.fillStyle = "#3b2516"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, x + w / 2, y - 4);
    g.textAlign = "left"; g.textBaseline = "alphabetic";
  }

  function drawHouse(g, X, Y, W, H, o, si) {
    var wallY = Y + H * 0.42;
    walls(g, X + 6, wallY, W - 12, Y + H - wallY - 2, "#ecdcb8", "#c9a878");
    roof(g, X - 2, Y - 14 + H * 0.18, W + 4, H * 0.45, "#a84f2f");
    // windows
    windowPane(g, X + 14, wallY + 14, 16, 14);
    windowPane(g, X + W - 30, wallY + 14, 16, 14);
    doorWood(g, X + W / 2 - 11, Y + H - 44, 22, 42);
    // veranda step
    g.fillStyle = "#cbb48a"; g.fillRect(X + W / 2 - 16, Y + H - 4, 32, 6);
    g.strokeStyle = OUT; g.lineWidth = 1; g.strokeRect(X + W / 2 - 16, Y + H - 4, 32, 6);
    if (o.label) label(g, o.label, X, wallY - 2, W, "#f7e7bf");
  }

  function drawShop(g, X, Y, W, H, o) {
    var wallY = Y + H * 0.4;
    walls(g, X + 6, wallY, W - 12, Y + H - wallY - 2, "#f3e7cf", "#8cb88a");
    roof(g, X - 2, Y - 14 + H * 0.18, W + 4, H * 0.45, "#2f7d5a");
    // striped awning
    for (var i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? "#f6f1e6" : "#c8483a";
      g.beginPath(); g.moveTo(X + 6 + i * (W - 12) / 8, wallY + 2); g.lineTo(X + 6 + (i + 1) * (W - 12) / 8, wallY + 2);
      g.lineTo(X + 6 + (i + 1) * (W - 12) / 8 + 2, wallY + 16); g.lineTo(X + 6 + i * (W - 12) / 8 + 2, wallY + 16); g.closePath(); g.fill();
    }
    g.strokeStyle = OUT; g.lineWidth = 1; g.strokeRect(X + 6, wallY + 2, W - 12, 14);
    windowPane(g, X + 16, wallY + 26, 20, 16);
    doorWood(g, X + W - 40, Y + H - 40, 26, 38);
    label(g, o.label || "দোকান", X, wallY - 4, W, "#fff1c9");
  }

  function drawSchool(g, X, Y, W, H, o) {
    var wallY = Y + H * 0.42;
    walls(g, X + 6, wallY, W - 12, Y + H - wallY - 2, "#f2ead0", "#9fb8c9");
    roof(g, X - 2, Y - 14 + H * 0.18, W + 4, H * 0.45, "#7a3b2a");
    for (var i = 0; i < 3; i++) windowPane(g, X + 16 + i * 38, wallY + 14, 22, 16);
    doorWood(g, X + W / 2 - 10, Y + H - 42, 20, 40);
    // flagpole with the national flag colours (green field, red disc)
    g.strokeStyle = "#5a4a3a"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(X + W - 10, Y + H - 2); g.lineTo(X + W - 10, Y - 26); g.stroke();
    g.fillStyle = "#006a4e"; g.fillRect(X + W - 10, Y - 26, 16, 10);
    g.fillStyle = "#f42a41"; g.beginPath(); g.arc(X + W - 2, Y - 21, 3.2, 0, 7); g.fill();
    label(g, o.label || "বিদ্যালয়", X, wallY - 4, W, "#dff0ff");
  }

  function drawWell(g, cx, base) {
    ellipse(g, cx, base - 6, 15, 8, "#8e8a80", OUT);
    ellipse(g, cx, base - 9, 11, 5, "#2e5d6e", OUT);
    g.strokeStyle = "#6b4a30"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(cx - 13, base - 22); g.lineTo(cx - 13, base - 6); g.moveTo(cx + 13, base - 22); g.lineTo(cx + 13, base - 6); g.stroke();
    g.fillStyle = "#8c5d37"; g.fillRect(cx - 16, base - 30, 32, 6);
    g.strokeStyle = OUT; g.lineWidth = 1; g.strokeRect(cx - 16, base - 30, 32, 6);
  }

  function drawBin(g, X, Y) {
    g.fillStyle = "#9c6a3f"; g.fillRect(X + 6, Y + 14, 36, 30);
    g.strokeStyle = OUT; g.lineWidth = 1.5; g.strokeRect(X + 6, Y + 14, 36, 30);
    g.fillStyle = "#b98252";
    for (var i = 0; i < 3; i++) g.fillRect(X + 6, Y + 20 + i * 9, 36, 3);
    g.fillStyle = "#e9c46a"; g.fillRect(X + 10, Y + 6, 28, 8);
    g.strokeRect(X + 10, Y + 6, 28, 8);
    g.fillStyle = "#3b2516"; g.font = "700 9px 'Hind Siliguri', sans-serif"; g.textAlign = "center";
    g.fillText("বিক্রি", X + 24, Y + 36); g.textAlign = "left";
  }

  function drawScarecrow(g, X, Y) {
    var cx = X + 24, base = Y + 46;
    g.strokeStyle = "#6b4a30"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(cx, base); g.lineTo(cx, Y + 12); g.moveTo(cx - 14, Y + 20); g.lineTo(cx + 14, Y + 20); g.stroke();
    g.fillStyle = "#d8b25c"; g.fillRect(cx - 5, Y + 8, 10, 4);
    ellipse(g, cx, Y + 3, 14, 3.5, "#d9b76a", OUT);
    g.fillStyle = "#c7533c"; g.fillRect(cx - 9, Y + 22, 18, 16);
    g.strokeStyle = OUT; g.strokeRect(cx - 9, Y + 22, 18, 16);
    ellipse(g, cx, Y + 14, 5, 5, "#e7c99b", OUT);
  }

  function drawBench(g, X, Y, W) {
    g.fillStyle = "#8c5d37"; g.fillRect(X + 4, Y + 24, W - 8, 6);
    g.fillRect(X + 8, Y + 30, 4, 12); g.fillRect(X + W - 12, Y + 30, 4, 12);
    g.strokeStyle = OUT; g.lineWidth = 1; g.strokeRect(X + 4, Y + 24, W - 8, 6);
  }

  // Bangladeshi-style decorated rickshaw (colourful hood and wheel)
  function drawRickshaw(g, X, Y) {
    var cx = X + 24, base = Y + 44;
    ellipse(g, cx - 10, base - 2, 7, 4, "#333", OUT);
    ellipse(g, cx + 12, base - 2, 7, 4, "#333", OUT);
    g.fillStyle = "#3a6fb0"; g.fillRect(cx - 18, base - 22, 34, 12);
    g.strokeStyle = OUT; g.strokeRect(cx - 18, base - 22, 34, 12);
    g.fillStyle = "#f2c230"; g.fillRect(cx - 18, base - 13, 34, 3);
    g.fillStyle = "#c83a3a";
    g.beginPath(); g.moveTo(cx - 20, base - 22); g.lineTo(cx + 20, base - 22); g.lineTo(cx + 12, base - 36); g.lineTo(cx - 12, base - 36); g.closePath(); g.fill();
    g.stroke();
    g.fillStyle = "#f2c230"; for (var i = 0; i < 5; i++) g.fillRect(cx - 12 + i * 5, base - 34, 2, 10);
  }

  function drawBed(g, X, Y, W, H) {
    g.fillStyle = "#8c5d37"; g.fillRect(X + 2, Y + 6, W - 4, H - 6);
    g.strokeStyle = OUT; g.lineWidth = 1; g.strokeRect(X + 2, Y + 6, W - 4, H - 6);
    g.fillStyle = "#fbf4e6"; g.fillRect(X + 6, Y + 12, 14, 12); // pillow
    g.fillStyle = "#d46a4a"; g.fillRect(X + 22, Y + 10, W - 28, H - 12); // blanket
    g.fillStyle = "#f2d67a"; for (var i = 0; i < 4; i++) g.fillRect(X + 26 + i * 8, Y + 12, 3, H - 16);
  }
  function drawBox(g, X, Y) {
    g.fillStyle = "#7a4a2a"; g.fillRect(X + 6, Y + 14, 36, 26);
    g.strokeStyle = OUT; g.lineWidth = 1.5; g.strokeRect(X + 6, Y + 14, 36, 26);
    g.fillStyle = "#c59a5a"; g.fillRect(X + 6, Y + 14, 36, 6); g.fillRect(X + 22, Y + 22, 4, 6);
  }
  function drawTable(g, X, Y) {
    g.fillStyle = "#9c6a3f"; g.fillRect(X + 6, Y + 14, 36, 8);
    g.fillRect(X + 9, Y + 22, 4, 16); g.fillRect(X + 35, Y + 22, 4, 16);
    g.fillStyle = "#c7533c"; g.beginPath(); g.arc(X + 24, Y + 11, 5, 0, 7); g.fill();
  }
  function drawRug(g, X, Y, W, H) {
    g.fillStyle = "#b5503a"; rr(g, X + 4, Y + 6, W - 8, H - 12, 4); g.fill();
    g.strokeStyle = "#f2d67a"; g.lineWidth = 2; rr(g, X + 8, Y + 10, W - 16, H - 20, 3); g.stroke();
    g.fillStyle = "#2f7d5a";
    for (var i = 0; i < 6; i++) g.fillRect(X + 12 + i * 12, Y + H / 2 - 2, 6, 4);
  }

  // Draw a static object at its footprint (world coords = tile * T)
  function drawObject(g, o, si) {
    var X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T;
    switch (o.type) {
      case "house": drawHouse(g, X, Y, W, H, o, si); break;
      case "shop": drawShop(g, X, Y, W, H, o); break;
      case "school": drawSchool(g, X, Y, W, H, o); break;
      case "well": drawWell(g, X + T / 2, Y + T); break;
      case "bin": drawBin(g, X, Y); break;
      case "scarecrow": drawScarecrow(g, X, Y); break;
      case "bench": drawBench(g, X, Y, W); break;
      case "rickshaw": drawRickshaw(g, X, Y); break;
      case "sign": drawSign(g, X, Y, o.label); break;
      case "counter": drawCounter(g, X, Y); break;
      case "bed": drawBed(g, X, Y, W, H); break;
      case "box": drawBox(g, X, Y); break;
      case "table": drawTable(g, X, Y); break;
      case "rug": drawRug(g, X, Y, W, H); break;
    }
  }
  function drawSign(g, X, Y, text) {
    g.fillStyle = "#8c5d37"; g.fillRect(X + 22, Y + 22, 4, 24);
    g.fillStyle = "#e9c46a"; rr(g, X + 6, Y + 6, 36, 18, 3); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = "#3b2516"; g.font = "700 8px 'Hind Siliguri', sans-serif"; g.textAlign = "center";
    g.fillText("বাজার", X + 24, Y + 19); g.textAlign = "left";
  }
  function drawCounter(g, X, Y) {
    g.fillStyle = "#8c5d37"; g.fillRect(X + 2, Y + 12, T - 4, 30);
    g.strokeStyle = OUT; g.lineWidth = 1.2; g.strokeRect(X + 2, Y + 12, T - 4, 30);
    g.fillStyle = "#c59a5a"; g.fillRect(X, Y + 8, T, 8);
    g.fillStyle = "#c7533c"; g.fillRect(X + 8, Y + 2, 12, 8); g.fillStyle = "#6aa84f"; g.fillRect(X + 26, Y + 2, 12, 8);
  }

  // Object footprint top-left -> draw extents. Used for Y-sort base (bottom row).
  function objectTiles(objects) { return objects || []; }

  // ---------- characters ----------
  // spec: {gender:'m'|'f', skin, hair, top, bottom, accent, hat:bool, gamchha:bool, dupatta:bool,
  //        beard:bool, grey:bool, glasses:bool, braid:bool, bag:bool}
  function drawPerson(g, x, fy, spec, opt) {
    opt = opt || {};
    var dir = opt.dir || "down", f = opt.frame || 0, moving = !!opt.moving;
    var stride = moving ? [-2.5, 0, 2.5, 0][f % 4] : 0;
    var bob = moving && (f % 2 === 0) ? -0.8 : 0;
    var female = spec.gender === "f";
    var left = dir === "left", right = dir === "right", back = dir === "up";
    var fx = x;
    // shadow
    ellipse(g, x, fy - 1, 11, 4, "rgba(20,12,6,0.28)");
    // legs
    var legCol = female ? spec.bottom : spec.bottom;
    g.lineCap = "round";
    g.strokeStyle = OUT; g.lineWidth = 6.4;
    g.beginPath(); g.moveTo(fx - 3, fy - 14); g.lineTo(fx - 3 + stride, fy - 1); g.moveTo(fx + 3, fy - 14); g.lineTo(fx + 3 - stride, fy - 1); g.stroke();
    g.strokeStyle = legCol; g.lineWidth = 4.2;
    g.beginPath(); g.moveTo(fx - 3, fy - 14); g.lineTo(fx - 3 + stride, fy - 1); g.moveTo(fx + 3, fy - 14); g.lineTo(fx + 3 - stride, fy - 1); g.stroke();
    // feet
    g.fillStyle = "#3a2a1e";
    g.fillRect(fx - 5 + stride, fy - 2, 5, 2.4); g.fillRect(fx + 1 - stride, fy - 2, 5, 2.4);

    // arms (behind torso for back view)
    var armSwing = moving ? [2, 0, -2, 0][f % 4] : 0;
    g.lineCap = "round";
    g.strokeStyle = OUT; g.lineWidth = 5.4;
    g.beginPath(); g.moveTo(fx - 8, fy - 25 + bob); g.lineTo(fx - 9 - armSwing, fy - 14 + bob); g.moveTo(fx + 8, fy - 25 + bob); g.lineTo(fx + 9 + armSwing, fy - 14 + bob); g.stroke();
    g.strokeStyle = spec.top; g.lineWidth = 3.6;
    g.beginPath(); g.moveTo(fx - 8, fy - 25 + bob); g.lineTo(fx - 9 - armSwing, fy - 14 + bob); g.moveTo(fx + 8, fy - 25 + bob); g.lineTo(fx + 9 + armSwing, fy - 14 + bob); g.stroke();
    g.fillStyle = spec.skin;
    g.beginPath(); g.arc(fx - 9 - armSwing, fy - 13 + bob, 2.2, 0, 7); g.fill();
    g.beginPath(); g.arc(fx + 9 + armSwing, fy - 13 + bob, 2.2, 0, 7); g.fill();

    if (female) {
      // long dupatta/hair behind shoulders
      if (spec.dupatta && !back) {
        g.fillStyle = spec.accent;
        g.beginPath(); g.moveTo(fx - 9, fy - 26 + bob); g.lineTo(fx - 12, fy - 9); g.lineTo(fx - 4, fy - 9); g.lineTo(fx - 4, fy - 24); g.closePath(); g.fill();
      }
      // kameez/kurta (tunic) — trapezoid
      g.beginPath();
      g.moveTo(fx - 8, fy - 25 + bob); g.lineTo(fx + 8, fy - 25 + bob); g.lineTo(fx + 10, fy - 11); g.lineTo(fx - 10, fy - 11); g.closePath();
      g.fillStyle = spec.top; g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.3; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(fx - 6, fy - 23 + bob, 3, 9);
      if (spec.dupatta && !back) {
        g.fillStyle = spec.accent;
        g.beginPath(); g.moveTo(fx + 8, fy - 25 + bob); g.lineTo(fx + 11, fy - 9); g.lineTo(fx + 4, fy - 9); g.lineTo(fx + 4, fy - 24); g.closePath(); g.fill();
        g.strokeStyle = OUT; g.lineWidth = 1; g.stroke();
      }
      // salwar bottom colour already drawn as legs; add a short tunic hem
      g.fillStyle = shade(spec.top, -26); g.fillRect(fx - 10, fy - 13, 20, 2);
    } else {
      // shirt
      rr(g, fx - 8, fy - 26 + bob, 16, 14, 4);
      g.fillStyle = spec.top; g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.3; g.stroke();
      g.fillStyle = "rgba(255,255,255,0.16)"; g.fillRect(fx - 6, fy - 24 + bob, 3, 9);
      // lungi (checked sarong) or trousers
      if (spec.lungi) {
        g.fillStyle = spec.bottom;
        g.beginPath(); g.moveTo(fx - 9, fy - 13); g.lineTo(fx + 9, fy - 13); g.lineTo(fx + 10, fy - 1); g.lineTo(fx - 10, fy - 1); g.closePath(); g.fill();
        g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 1;
        for (var k = -8; k <= 8; k += 4) { g.beginPath(); g.moveTo(fx + k, fy - 13); g.lineTo(fx + k * 1.1, fy - 1); g.stroke(); }
        for (var j = -12; j <= -2; j += 5) { g.beginPath(); g.moveTo(fx - 10, fy + j); g.lineTo(fx + 10, fy + j); g.stroke(); }
        g.strokeStyle = OUT; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(fx - 9, fy - 13); g.lineTo(fx + 9, fy - 13); g.stroke();
      }
    }

    // gamchha (cotton towel) over shoulder
    if (spec.gamchha) {
      g.save();
      g.strokeStyle = "#c94a3a"; g.lineWidth = 3.2; g.lineCap = "round";
      g.beginPath(); g.moveTo(fx - 9, fy - 25 + bob); g.lineTo(fx + 3, fy - 12 + bob); g.stroke();
      g.strokeStyle = "#f7f1e3"; g.lineWidth = 1; g.beginPath(); g.moveTo(fx - 8, fy - 23 + bob); g.lineTo(fx + 2, fy - 13 + bob); g.stroke();
      g.restore();
    }
    // bag (school)
    if (spec.bag) { g.fillStyle = "#3a6fb0"; rr(g, fx + 7, fy - 22 + bob, 8, 10, 2); g.fill(); g.strokeStyle = OUT; g.lineWidth = 1; g.stroke(); }

    // neck
    g.fillStyle = spec.skin; g.fillRect(fx - 2.5, fy - 29 + bob, 5, 4);
    // head
    var hy = fy - 33 + bob;
    g.beginPath(); g.arc(fx, hy, 8.4, 0, 7);
    g.fillStyle = spec.skin; g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.3; g.stroke();
    // hair
    var hair = spec.grey ? "#dcd6cf" : spec.hair;
    g.fillStyle = hair;
    if (female && spec.braid) {
      g.beginPath(); g.moveTo(fx - 9, hy - 1); g.quadraticCurveTo(fx - 12, hy + 12, fx - 9, fy - 14); g.lineTo(fx - 6, fy - 14); g.quadraticCurveTo(fx - 7, hy + 10, fx - 6, hy); g.fill();
      g.strokeStyle = OUT; g.lineWidth = 0.8; g.stroke();
    }
    g.beginPath(); g.arc(fx, hy - 1, 8.6, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fill();
    if (female && !spec.braid) {
      g.beginPath(); g.arc(fx, hy - 1, 8.6, Math.PI * 0.95, Math.PI * 2.05); g.lineTo(fx + 9, hy + 6); g.lineTo(fx - 9, hy + 6); g.closePath(); g.fill();
    }
    if (female && spec.braid) {
      g.beginPath(); g.arc(fx, hy - 1, 8.6, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fill();
    }
    if (back) {
      // back of head: hair covers
      g.beginPath(); g.arc(fx, hy, 8.6, 0, 7); g.fill();
    } else {
      // face features
      var ex = left ? -2.6 : right ? 2.6 : 0;
      var eyeSpace = (left || right) ? 0 : 3.2;
      g.fillStyle = "#231510";
      g.beginPath(); g.arc(fx - eyeSpace + ex, hy + 0.8, 1.2, 0, 7); g.fill();
      if (!(left || right)) { g.beginPath(); g.arc(fx + eyeSpace, hy + 0.8, 1.2, 0, 7); g.fill(); }
      g.strokeStyle = "#6a2f1f"; g.lineWidth = 1;
      g.beginPath(); g.arc(fx + ex, hy + 3.6, 1.8, 0.2, Math.PI - 0.2); g.stroke();
      g.fillStyle = "rgba(220,90,80,0.28)";
      if (!(left || right)) { g.beginPath(); g.arc(fx - 5, hy + 3, 1.8, 0, 7); g.fill(); g.beginPath(); g.arc(fx + 5, hy + 3, 1.8, 0, 7); g.fill(); }
      if (spec.glasses) {
        g.strokeStyle = "#2a2a2a"; g.lineWidth = 1;
        g.beginPath(); g.arc(fx - 3, hy + 0.8, 2.5, 0, 7); g.stroke();
        if (!(left || right)) { g.beginPath(); g.arc(fx + 3, hy + 0.8, 2.5, 0, 7); g.stroke(); }
      }
      if (spec.beard) {
        g.fillStyle = "#ece9e2";
        g.beginPath(); g.arc(fx, hy + 6, 5.5, 0.1, Math.PI - 0.1); g.closePath(); g.fill();
        g.strokeStyle = OUT; g.lineWidth = 0.8; g.stroke();
      }
    }
    // hat (tokai / straw hat)
    if (spec.hat) {
      g.fillStyle = "#d9b76a";
      g.beginPath(); g.moveTo(fx - 15, hy - 3); g.lineTo(fx + 15, hy - 3); g.lineTo(fx + 7, hy - 9); g.lineTo(fx - 7, hy - 9); g.closePath();
      g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.2; g.stroke();
      g.strokeStyle = "#b08a3a"; g.lineWidth = 1;
      for (var s = -6; s <= 6; s += 4) { g.beginPath(); g.moveTo(fx + s * 0.9, hy - 8); g.lineTo(fx + s * 1.3, hy - 3); g.stroke(); }
      ellipse(g, fx, hy - 3, 15, 3, "#e6c77a", OUT);
    }
  }

  // Portrait canvas: bust of a character, used by dialogue box & journal.
  function portrait(spec, W, H) {
    var key = "p|" + JSON.stringify(spec) + "|" + W + "x" + H;
    return cached(key, W, H, function (g) {
      // background vignette in warm tones
      var grd = g.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#f6e3b4"); grd.addColorStop(1, "#c9a36a");
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(255,255,255,0.22)";
      g.beginPath(); g.arc(W * 0.5, H * 0.35, H * 0.46, 0, 7); g.fill();
      var s = (H * 0.8) / 34;
      g.save();
      g.setTransform(s, 0, 0, s, W / 2, H * 0.95 + 12 * s);
      drawPerson(g, 0, 0, spec, { dir: "down", frame: 0, moving: false });
      g.restore();
    });
  }

  // ---------- item icons (inventory / shop / HUD) ----------
  function itemIcon(id) {
    var info = CF.Data.itemInfo(id);
    return cached("icon|" + id, 48, 48, function (g) {
      g.fillStyle = "rgba(0,0,0,0)"; g.clearRect(0, 0, 48, 48);
      if (!info) return;
      if (info.kind === "tool") return toolIcon(g, id);
      if (info.kind === "seed") return seedIcon(g, info);
      if (info.kind === "crop") return cropIcon(g, info);
      if (info.kind === "fish") return fishIcon(g, info);
    });
  }
  function toolIcon(g, id) {
    if (id === "hoe") {
      g.strokeStyle = "#7a4a2a"; g.lineWidth = 4; g.beginPath(); g.moveTo(14, 42); g.lineTo(34, 10); g.stroke();
      g.fillStyle = "#9aa3a8"; g.beginPath(); g.moveTo(28, 6); g.lineTo(42, 10); g.lineTo(38, 22); g.lineTo(26, 16); g.closePath(); g.fill();
      g.strokeStyle = OUT; g.lineWidth = 1.2; g.stroke();
    } else if (id === "can") {
      g.fillStyle = "#3f8fb0"; rr(g, 10, 16, 26, 24, 4); g.fill(); g.strokeStyle = OUT; g.stroke();
      g.strokeStyle = "#3f8fb0"; g.lineWidth = 3; g.beginPath(); g.moveTo(36, 22); g.lineTo(44, 10); g.stroke();
      g.beginPath(); g.arc(20, 14, 6, Math.PI, 0); g.stroke();
    } else if (id === "rod") {
      g.strokeStyle = "#7a4a2a"; g.lineWidth = 3; g.beginPath(); g.moveTo(8, 42); g.quadraticCurveTo(30, 4, 42, 14); g.stroke();
      g.strokeStyle = "#fff"; g.lineWidth = 1; g.beginPath(); g.moveTo(42, 14); g.lineTo(38, 36); g.stroke();
      g.fillStyle = "#e0573a"; g.beginPath(); g.arc(38, 38, 3, 0, 7); g.fill();
    }
  }
  function seedIcon(g, info) {
    g.fillStyle = "#f6ecd2"; rr(g, 10, 8, 28, 34, 3); g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = info.color; rr(g, 10, 8, 28, 10, 3); g.fill();
    g.fillStyle = "#6b4a30"; g.font = "700 9px 'Hind Siliguri', sans-serif"; g.textAlign = "center";
    g.fillText("বীজ", 24, 34); g.textAlign = "left";
  }
  function cropIcon(g, info) {
    var c = CF.Data.CROPS[info.crop];
    g.fillStyle = info.color;
    if (info.crop === "dhan") { for (var i = 0; i < 5; i++) { g.beginPath(); g.ellipse(14 + i * 5, 24, 2.5, 8, 0.2, 0, 7); g.fill(); } return; }
    if (info.crop === "chili") { g.beginPath(); g.moveTo(14, 10); g.quadraticCurveTo(38, 16, 24, 42); g.quadraticCurveTo(18, 22, 14, 10); g.fill(); g.strokeStyle = OUT; g.stroke(); return; }
    if (info.crop === "dhendosh") { g.beginPath(); g.ellipse(24, 26, 6, 16, 0.3, 0, 7); g.fill(); g.strokeStyle = OUT; g.stroke(); return; }
    if (info.crop === "palong") { for (var k = -1; k <= 1; k++) { g.beginPath(); g.ellipse(24 + k * 8, 28, 6, 14, k * 0.4, 0, 7); g.fill(); } return; }
    if (info.crop === "sarisha") { for (var s = 0; s < 6; s++) { g.beginPath(); g.arc(12 + s * 5, 14 + (s % 2) * 8, 3.5, 0, 7); g.fill(); } return; }
    ellipse(g, 24, 28, 16, 14, info.color, OUT);
    if (info.crop === "lau") { g.fillStyle = "#4f8a3a"; g.fillRect(22, 6, 4, 8); }
    if (info.crop === "begun") { g.fillStyle = "#4f8a3a"; g.beginPath(); g.moveTo(16, 14); g.lineTo(32, 14); g.lineTo(24, 18); g.fill(); }
    if (info.crop === "alu") { g.fillStyle = "#c9a57a"; g.beginPath(); g.arc(18, 30, 3, 0, 7); g.fill(); }
    g.fillStyle = "rgba(255,255,255,0.25)"; g.beginPath(); g.arc(18, 22, 4, 0, 7); g.fill();
    if (c.name) { /* no text */ }
  }
  function fishIcon(g, info) {
    g.fillStyle = info.color;
    g.beginPath(); g.ellipse(22, 24, 16, 9, 0, 0, 7); g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.3; g.stroke();
    g.beginPath(); g.moveTo(36, 24); g.lineTo(46, 14); g.lineTo(46, 34); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(14, 22, 2, 0, 7); g.fill();
    g.fillStyle = "#231510"; g.beginPath(); g.arc(14, 22, 1, 0, 7); g.fill();
  }

  CF.Art = {
    T: T,
    groundTile: groundTile,
    drawSalTree: drawSalTree,
    drawBamboo: drawBamboo,
    drawRock: drawRock,
    drawObject: drawObject,
    drawPerson: drawPerson,
    portrait: portrait,
    itemIcon: itemIcon,
    drawCrop: function (g, cx, base, cropId, prog, grow, si) { drawCrop(g, cx, base, cropId, prog, grow, si); },
    seasonPal: seasonPal,
    shade: shade
  };

  // ---------- crops (drawn in tile, base = bottom centre) ----------
  function drawCrop(g, cx, base, cropId, prog, grow, si) {
    var c = CF.Data.CROPS[cropId];
    var r = Math.min(1, prog / grow);
    var stage = r < 0.34 ? 0 : r < 0.67 ? 1 : r < 1 ? 2 : 3;
    var leaf = shade(c.color, 0);
    // mound
    ellipse(g, cx, base - 2, 13, 4, "rgba(60,30,15,0.25)");
    if (stage === 0) {
      g.strokeStyle = "#5c9a3a"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(cx, base - 2); g.lineTo(cx, base - 10); g.stroke();
      g.fillStyle = "#7fbf4a";
      g.beginPath(); g.ellipse(cx - 4, base - 10, 4, 2, -0.5, 0, 7); g.fill();
      g.beginPath(); g.ellipse(cx + 4, base - 10, 4, 2, 0.5, 0, 7); g.fill();
      return;
    }
    if (cropId === "dhan") {
      for (var i = 0; i < 7; i++) {
        var sx = cx - 10 + i * 3.3, h = 18 + (i % 3) * 5 + stage * 4;
        g.strokeStyle = "#6fa04a"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(sx, base - 2); g.lineTo(sx + (i % 2 ? 2 : -2), base - h); g.stroke();
        if (stage >= 2) { g.fillStyle = "#e6c455"; g.beginPath(); g.ellipse(sx + (i % 2 ? 2 : -2), base - h, 1.6, 4, 0, 0, 7); g.fill(); }
      }
      return;
    }
    if (cropId === "sarisha") {
      for (var s = 0; s < 5; s++) {
        var px = cx - 8 + s * 4, ph = 14 + stage * 4 + (s % 2) * 3;
        g.strokeStyle = "#5c8f3a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px, base - 2); g.lineTo(px, base - ph); g.stroke();
        if (stage >= 2) { g.fillStyle = "#f2c81e"; g.beginPath(); g.arc(px, base - ph, 3, 0, 7); g.fill(); }
      }
      return;
    }
    // generic bushy plant
    var spread = 9 + stage * 3;
    g.fillStyle = shade(c.color, -8);
    ellipse(g, cx - 5, base - 12 - stage, spread * 0.6, spread * 0.5, shade(c.color, -8), OUT);
    ellipse(g, cx + 5, base - 13 - stage, spread * 0.6, spread * 0.5, shade(c.color, 6), OUT);
    ellipse(g, cx, base - 17 - stage * 1.5, spread * 0.55, spread * 0.5, c.color, OUT);
    if (stage >= 2 && cropId !== "palong") {
      var fruitCol = c.fruit;
      if (cropId === "chili") {
        for (var k = -1; k <= 1; k++) { g.fillStyle = fruitCol; g.beginPath(); g.ellipse(cx + k * 7, base - 6, 2, 5, k * 0.4, 0, 7); g.fill(); }
      } else if (cropId === "begun") {
        g.fillStyle = fruitCol; ellipse(g, cx - 6, base - 6, 4, 6, fruitCol, OUT); ellipse(g, cx + 5, base - 8, 3.5, 5, fruitCol, OUT);
      } else if (cropId === "lau") {
        ellipse(g, cx + 8, base - 7, 6, 4, c.fruit, OUT);
      } else if (cropId === "alu") {
        ellipse(g, cx - 4, base - 4, 3, 2, "#b98a55", OUT); ellipse(g, cx + 4, base - 3, 3, 2, "#b98a55", OUT);
      } else if (cropId === "dhendosh") {
        g.fillStyle = fruitCol; g.beginPath(); g.ellipse(cx + 2, base - 7, 2.2, 6, 0.3, 0, 7); g.fill();
      }
    }
    if (stage === 3 && (cropId === "palong" || cropId === "alu")) {
      g.fillStyle = "rgba(255,255,255,0.2)"; g.beginPath(); g.arc(cx - 3, base - 20, 2, 0, 7); g.fill();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
