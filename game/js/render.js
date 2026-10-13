/* চালাবন ফার্ম — world renderer (canvas). Reads state; never mutates game rules. */
(function (root) {
  "use strict";
  var CF = (root.CF = root.CF || {});
  var T = 48;

  var Render = {
    canvas: null, g: null,
    zoom: 1, camX: 0, camY: 0,
    cssW: 0, cssH: 0,
    rain: [],
    frame: 0,
    ripple: 0,

    init: function (canvas) {
      this.canvas = canvas;
      this.g = canvas.getContext("2d");
      this.resize();
    },
    resize: function () {
      var dpr = Math.min(root.devicePixelRatio || 1, 2);
      var w = root.innerWidth, h = root.innerHeight;
      this.cssW = w; this.cssH = h;
      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      this.canvas.style.width = w + "px";
      this.canvas.style.height = h + "px";
      this.dpr = dpr;
      // about 9 tiles tall on screen, clamped for phones and large monitors
      this.zoom = Math.max(0.55, Math.min(2.2, h / (9 * T)));
    },
    viewTilesW: function () { return this.cssW / (T * this.zoom); },
    viewTilesH: function () { return this.cssH / (T * this.zoom); },

    // camera follows target (world tile units), clamped to map bounds
    follow: function (map, px, py) {
      var vw = this.viewTilesW(), vh = this.viewTilesH();
      var cx = px - vw / 2, cy = py - vh / 2;
      cx = map.w <= vw ? (map.w - vw) / 2 : Math.max(0, Math.min(map.w - vw, cx));
      cy = map.h <= vh ? (map.h - vh) / 2 : Math.max(0, Math.min(map.h - vh, cy));
      this.camX += (cx - this.camX) * 0.25;
      this.camY += (cy - this.camY) * 0.25;
      if (Math.abs(cx - this.camX) < 0.01) this.camX = cx;
      if (Math.abs(cy - this.camY) < 0.01) this.camY = cy;
    },
    snapCamera: function (map, px, py) {
      var vw = this.viewTilesW(), vh = this.viewTilesH();
      var cx = map.w <= vw ? (map.w - vw) / 2 : Math.max(0, Math.min(map.w - vw, px - vw / 2));
      var cy = map.h <= vh ? (map.h - vh) / 2 : Math.max(0, Math.min(map.h - vh, py - vh / 2));
      this.camX = cx; this.camY = cy;
    },

    // draw one frame. ctxData: {state, map, npcs:[{id,x,y,dir,moving,frame}], fishing, prompt, time}
    draw: function (d) {
      var g = this.g, state = d.state, map = d.map, si = CF.Engine.seasonIndex(state.clock.day);
      this.frame++;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = "#1d2a1a";
      g.fillRect(0, 0, this.canvas.width, this.canvas.height);
      // world px (tile * T) -> device px
      g.setTransform(this.dpr * this.zoom, 0, 0, this.dpr * this.zoom, -this.camX * T * this.dpr * this.zoom, -this.camY * T * this.dpr * this.zoom);

      var x0 = Math.max(0, Math.floor(this.camX) - 1), y0 = Math.max(0, Math.floor(this.camY) - 1);
      var x1 = Math.min(map.w - 1, Math.ceil(this.camX + this.viewTilesW()) + 1);
      var y1 = Math.min(map.h - 1, Math.ceil(this.camY + this.viewTilesH()) + 1);
      var water = (this.frame >> 5) & 1;
      var homeMap = map.id === "home";

      // 1) ground layer
      for (var ty = y0; ty <= y1; ty++) {
        for (var tx = x0; tx <= x1; tx++) {
          var ch = CF.Engine.tileChar(map.id, tx, ty);
          var ts = CF.Engine.tileState(state, map.id, tx, ty);
          var kind = ch;
          if (ch === "#" || ch === "B" || ch === "R") kind = homeMap ? "w" : ".";
          var variant = (tx * 7 + ty * 13) & 3;
          var img = CF.Art.groundTile(kind, si, variant, ts && ts.till, ts && ts.wet, ch === "W" ? water : 0);
          g.drawImage(img, tx * T, ty * T, T, T);
        }
      }

      // 2) Y-sorted drawables
      var items = [];
      for (ty = y0; ty <= y1; ty++) {
        for (tx = x0; tx <= x1; tx++) {
          ch = CF.Engine.tileChar(map.id, tx, ty);
          if (ch === "#" && !homeMap) items.push({ b: ty + 0.98, draw: this.treeDraw(tx, ty, si) });
          else if (ch === "B" && !homeMap) items.push({ b: ty + 0.98, draw: this.bambooDraw(tx, ty, si) });
          else if (ch === "R" && !homeMap) items.push({ b: ty + 0.9, draw: this.rockDraw(tx, ty) });
          var ts = CF.Engine.tileState(state, map.id, tx, ty);
          if (ts && ts.crop) items.push({ b: ty + 0.9, draw: this.cropDraw(tx, ty, ts.crop, si) });
        }
      }
      map.objects.forEach(function (o) {
        if (o.x + o.w < x0 || o.x > x1 || o.y + o.h < y0 || o.y > y1) return;
        items.push({ b: o.y + o.h - 0.02, draw: function (gg) { CF.Art.drawObject(gg, o, si); } });
      });
      d.npcs.forEach(function (n) {
        if (n.x < x0 - 1 || n.x > x1 + 1 || n.y < y0 - 1 || n.y > y1 + 1) return;
        items.push({ b: n.y + 0.4, draw: this.npcDraw(n) });
      }, this);
      items.push({ b: state.player.y + 0.4, draw: this.playerDraw(state.player, d) });

      // ground-level objects (rugs, benches) drawn before sorted items
      items.sort(function (a, b) { return a.b - b.b; });
      items.forEach(function (it) {
        it.draw(g);
      });

      // 3) fishing bobber
      if (d.fishing && d.fishing.tx !== undefined) this.bobber(g, d.fishing, this.frame);

      // 4) prompt above interactable
      if (d.prompt) this.prompt(g, d.prompt);

      // reset transform for screen-space effects
      g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.screenEffects(d, si);
    },

    treeDraw: function (tx, ty, si) {
      return function (g) {
        var cx = tx * T + T / 2, base = ty * T + T;
        CF.Art.drawSalTree(g, cx, base, si, tx * 3 + ty);
      };
    },
    bambooDraw: function (tx, ty, si) {
      return function (g) { CF.Art.drawBamboo(g, tx * T + T / 2, ty * T + T, si); };
    },
    rockDraw: function (tx, ty) {
      return function (g) { CF.Art.drawRock(g, tx * T + T / 2, ty * T + T); };
    },
    cropDraw: function (tx, ty, crop, si) {
      return function (g) {
        CF.Art.drawCrop(g, tx * T + T / 2, ty * T + T - 4, crop.id, crop.prog, CF.Data.CROPS[crop.id].grow, si);
      };
    },
    npcDraw: function (n) {
      var spec = CF.Characters.spec(n.id);
      return function (g) {
        CF.Art.drawPerson(g, n.x * T + T / 2, (n.y + 0.4) * T, spec, { dir: n.dir, frame: n.frame, moving: n.moving });
        if (n.nameTag) {
          g.save();
          g.font = "700 13px 'Hind Siliguri', sans-serif"; g.textAlign = "center";
          var tw = g.measureText(n.name).width + 12;
          g.fillStyle = "rgba(255,248,224,0.92)"; g.strokeStyle = "#2b1d14"; g.lineWidth = 1.3;
          var by = (n.y + 0.4) * T - 60;
          g.beginPath(); g.roundRect ? g.roundRect(n.x * T + T / 2 - tw / 2, by - 13, tw, 18, 5) : g.rect(n.x * T + T / 2 - tw / 2, by - 13, tw, 18);
          g.fill(); g.stroke();
          g.fillStyle = "#3b2516"; g.fillText(n.name, n.x * T + T / 2, by);
          g.restore();
        }
      };
    },
    playerDraw: function (p, d) {
      var spec = CF.Characters.playerSpec(p);
      return function (g) {
        CF.Art.drawPerson(g, p.x * T, (p.y + 0.4) * T, spec, { dir: p.dir, frame: d.playerFrame, moving: d.moving });
      };
    },
    bobber: function (g, f, frame) {
      var x = f.tx * T + T / 2, y = f.ty * T + T / 2 + Math.sin(frame / 10) * 1.2;
      g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 1;
      g.beginPath(); g.ellipse(x, y + 4, 9, 3, 0, 0, 7); g.stroke();
      g.fillStyle = f.phase === "bite" ? "#e53935" : "#fff";
      g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
      g.strokeStyle = "#2b1d14"; g.lineWidth = 1.2; g.stroke();
      if (f.phase === "bite") {
        g.fillStyle = "#ffd23f"; g.strokeStyle = "#2b1d14";
        g.beginPath(); g.arc(x + 14, y - 16, 9, 0, 7); g.fill(); g.stroke();
        g.fillStyle = "#2b1d14"; g.font = "900 13px sans-serif"; g.textAlign = "center"; g.fillText("!", x + 14, y - 11); g.textAlign = "left";
      }
    },
    prompt: function (g, p) {
      var x = p.x * T + T / 2, y = p.y * T - 18;
      g.save();
      g.font = "700 13px 'Hind Siliguri', sans-serif"; g.textAlign = "center";
      var tw = g.measureText(p.text).width + 18;
      g.fillStyle = "rgba(43,29,20,0.86)";
      g.beginPath(); g.roundRect ? g.roundRect(x - tw / 2, y - 16, tw, 22, 8) : g.rect(x - tw / 2, y - 16, tw, 22); g.fill();
      g.fillStyle = "#fff4d6"; g.fillText(p.text, x, y);
      g.restore();
    },

    screenEffects: function (d, si) {
      var g = this.g, w = this.cssW, h = this.cssH;
      var t = d.state.clock.t;
      // season tint
      g.fillStyle = CF.Data.SEASONS[si].tint; g.fillRect(0, 0, w, h);
      // night darkness 18:00 -> 02:00
      var hour = 6 + t / 60;
      var dark = 0;
      if (hour > 18) dark = Math.min(0.62, (hour - 18) / 5);
      if (d.map.ambient === "home") dark = Math.min(dark, 0.25);
      if (dark > 0) { g.fillStyle = "rgba(12,22,58," + dark.toFixed(3) + ")"; g.fillRect(0, 0, w, h); }
      // cloudy grey wash
      if (d.state.weather === "cloudy") { g.fillStyle = "rgba(80,90,100,0.12)"; g.fillRect(0, 0, w, h); }
      // rain
      if (d.state.weather === "rain" && d.map.ambient !== "home") {
        if (this.rain.length < 160) for (var i = 0; i < 4; i++) this.rain.push({ x: Math.random() * (w + 80), y: Math.random() * h, s: 10 + Math.random() * 8 });
        g.strokeStyle = "rgba(200,225,255,0.55)"; g.lineWidth = 1.4; g.beginPath();
        this.rain.forEach(function (r) { g.moveTo(r.x, r.y); g.lineTo(r.x - 4, r.y + r.s); r.y += 12 + r.s * 0.4; r.x -= 1.4; if (r.y > h) { r.y = -10; r.x = Math.random() * (w + 80); } });
        g.stroke();
        g.fillStyle = "rgba(60,80,110,0.10)"; g.fillRect(0, 0, w, h);
      } else this.rain.length = 0;
    },

    // draws the sky/background shown in screen space at the top (not used in tiles)
    toScreen: function (tx, ty) {
      return { x: (tx - this.camX) * T * this.zoom, y: (ty - this.camY) * T * this.zoom };
    }
  };

  // Converts tile coordinates to CSS pixels for DOM hit-tests (touch).
  CF.Render = Render;
})(typeof window !== "undefined" ? window : globalThis);
