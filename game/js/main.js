/* চালাবন ফার্ম — game controller: loop, input, interactions, menus, save, audio. */
(function (root) {
  "use strict";
  var CF = root.CF;
  var D = CF.Data, E = CF.Engine, R = CF.Render, A = CF.Art;
  var T = 48;
  var SAVE_KEY = "chalabon-farm.save.v1";
  var SET_KEY = "chalabon-farm.settings.v1";
  var VERSION = root.CHALABON_VERSION || "dev";
  var doc = root.document;

  var G = {
    state: null,         // current save state (null on title without save)
    map: null,
    npcs: [],            // runtime NPC positions (not saved)
    modal: null,         // currently open modal name
    busy: false,         // fade transition
    fishing: null,       // {tx,ty,phase,timer,biteWindow}
    moving: false, playerFrame: 0, walkT: 0,
    keys: {}, joy: { active: false, x: 0, y: 0, id: null },
    settings: { sound: true },
    lastT: 0, saveAcc: 0, shownSleepSummary: false,
    toastTimer: 0,
    audioCtx: null
  };

  function $(sel) { return doc.querySelector(sel); }
  function bn(n) { return String(n).replace(/[0-9]/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---------- save / settings ----------
  function saveGame(reason) {
    if (!G.state) return;
    try { root.localStorage.setItem(SAVE_KEY, E.serialize(G.state)); }
    catch (e) { toast("সেভ করা যায়নি (স্টোরেজ সমস্যা)।"); }
  }
  function loadSave() {
    try {
      var txt = root.localStorage.getItem(SAVE_KEY);
      if (!txt) return null;
      return E.deserialize(txt);
    } catch (e) { return null; }
  }
  function loadSettings() {
    try { var s = JSON.parse(root.localStorage.getItem(SET_KEY) || "{}"); if (typeof s.sound === "boolean") G.settings.sound = s.sound; } catch (e) { /* ignore */ }
  }
  function saveSettings() { try { root.localStorage.setItem(SET_KEY, JSON.stringify(G.settings)); } catch (e) { /* ignore */ } }

  // ---------- sound (synthesised, no files) ----------
  function audio() {
    if (!G.settings.sound) return null;
    if (!G.audioCtx) {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      G.audioCtx = new AC();
    }
    if (G.audioCtx.state === "suspended") G.audioCtx.resume();
    return G.audioCtx;
  }
  function tone(freq, dur, type, vol, slide) {
    var ac = audio(); if (!ac) return;
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    if (slide) o.frequency.linearRampToValueAtTime(freq * slide, ac.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.12, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
  }
  function noise(dur, freq, vol) {
    var ac = audio(); if (!ac) return;
    var len = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = buf; f.type = "bandpass"; f.frequency.value = freq || 900; g.gain.value = vol || 0.4;
    s.connect(f); f.connect(g); g.connect(ac.destination); s.start();
  }
  var SFX = {
    till: function () { noise(0.12, 600, 0.5); },
    water: function () { noise(0.5, 2200, 0.25); },
    plant: function () { tone(520, 0.08, "triangle", 0.15, 1.4); },
    harvest: function () { tone(660, 0.12, "triangle", 0.14, 1.6); setTimeout(function () { tone(880, 0.14, "triangle", 0.12, 1.3); }, 90); },
    coin: function () { tone(988, 0.1, "square", 0.06); setTimeout(function () { tone(1318, 0.16, "square", 0.06); }, 80); },
    ui: function () { tone(440, 0.05, "triangle", 0.08); },
    bite: function () { tone(740, 0.15, "sine", 0.18, 0.7); },
    splash: function () { noise(0.3, 1400, 0.35); },
    sleep: function () { tone(330, 0.5, "sine", 0.12, 0.6); }
  };

  // ---------- toast ----------
  function toast(msg) {
    var box = $("#toasts");
    var el = doc.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.classList.add("out"); setTimeout(function () { el.remove(); }, 400); }, 2400);
    while (box.children.length > 3) box.firstChild.remove();
  }

  // ---------- world helpers ----------
  function setMap(id) {
    G.map = CF.Maps[id];
    G.state.player.map = id;
    G.npcs = [];
    if (id === "village") {
      Object.keys(D.NPCS).forEach(function (nid) {
        var p = E.npcPosition(nid, G.state.clock.t);
        G.npcs.push({ id: nid, name: D.NPCS[nid].name, x: p.x, y: p.y, tx: p.x, ty: p.y, dir: "down", frame: 0, moving: false, nameTag: false });
      });
    }
  }

  function enterMap(mapId, x, y, done) {
    if (G.busy) return;
    G.busy = true;
    var fade = $("#fade");
    fade.classList.add("on");
    setTimeout(function () {
      setMap(mapId);
      G.state.player.x = x; G.state.player.y = y;
      R.snapCamera(G.map, x, y);
      G.fishing = null;
      fade.classList.remove("on");
      setTimeout(function () { G.busy = false; if (done) done(); }, 260);
      saveGame("map");
    }, 280);
  }

  function npcAt(tx, ty) {
    for (var i = 0; i < G.npcs.length; i++) if (Math.round(G.npcs[i].x) === tx && Math.round(G.npcs[i].y) === ty) return G.npcs[i];
    return null;
  }

  function frontTile() {
    var p = G.state.player, dx = 0, dy = 0;
    if (p.dir === "up") dy = -1; else if (p.dir === "down") dy = 1; else if (p.dir === "left") dx = -1; else dx = 1;
    return { x: Math.floor(p.x) + dx, y: Math.floor(p.y) + dy };
  }

  // Interaction target for the current frame (prompt + action).
  function currentTarget() {
    var p = G.state.player, f = frontTile(), ptx = Math.floor(p.x), pty = Math.floor(p.y);
    // NPC: in front or adjacent
    var cand = null;
    G.npcs.forEach(function (n) {
      if (G.map.id !== "village") return;
      var nx = Math.round(n.x), ny = Math.round(n.y);
      var d = Math.abs(nx - ptx) + Math.abs(ny - pty);
      if ((nx === f.x && ny === f.y) || d === 1) { if (!cand || d < cand.d) cand = { kind: "npc", npc: n, d: d }; }
    });
    if (cand) return { kind: "npc", npc: cand.npc, tx: Math.round(cand.npc.x), ty: Math.round(cand.npc.y) };
    var obj = E.objectAt(G.map.id, f.x, f.y);
    if (obj && obj.interact) return { kind: "object", obj: obj, tx: f.x, ty: f.y };
    return { kind: "tile", tx: f.x, ty: f.y };
  }

  function promptFor(target) {
    if (!target) return null;
    if (target.kind === "npc") {
      var held = D.itemInfo(G.state.player.held);
      var giftable = held && (held.kind === "crop" || held.kind === "fish");
      return { x: target.tx, y: target.ty, text: giftable ? "উপহার দাও (A)" : "কথা বলো (A)" };
    }
    if (target.kind === "object") {
      var t = { bed: "ঘুমাও (A)", shop: "দোকান (A)", bin: "বিক্রি করো (A)", box: "খোলো (A)" }[target.obj.interact];
      return { x: target.obj.x + (target.obj.w / 2), y: target.obj.y, text: t || "দেখো (A)" };
    }
    return null;
  }

  // ---------- movement & update ----------
  function walkable(x, y) {
    var r = 0.28, b = 0.22;
    var pts = [[x - r, y - b], [x + r, y - b], [x - r, y + b], [x + r, y + b]];
    for (var i = 0; i < pts.length; i++) {
      if (!E.isWalkableTile(G.map.id, Math.floor(pts[i][0]), Math.floor(pts[i][1]))) return false;
    }
    return true;
  }

  function update(dt) {
    var st = G.state, p = st.player;
    // time
    var passOut = E.advanceTime(st, dt / D.SECONDS_PER_GAME_MIN);
    // input vector
    var vx = 0, vy = 0;
    if (G.keys.left) vx -= 1; if (G.keys.right) vx += 1;
    if (G.keys.up) vy -= 1; if (G.keys.down) vy += 1;
    if (G.joy.active) { vx += G.joy.x; vy += G.joy.y; }
    vx = Math.max(-1, Math.min(1, vx)); vy = Math.max(-1, Math.min(1, vy));
    var len = Math.sqrt(vx * vx + vy * vy);
    var speed = 3.6;
    G.moving = len > 0.15 && !G.busy;
    if (G.moving) {
      vx /= Math.max(1, len); vy /= Math.max(1, len);
      if (Math.abs(vx) > Math.abs(vy)) p.dir = vx < 0 ? "left" : "right";
      else p.dir = vy < 0 ? "up" : "down";
      var step = speed * dt;
      var nx = p.x + vx * step, ny = p.y + vy * step;
      if (walkable(nx, p.y)) p.x = nx;
      if (walkable(p.x, ny)) p.y = ny;
      G.walkT += dt * 9;
      G.playerFrame = Math.floor(G.walkT) % 4;
      if (G.fishing) cancelFishing();
    }
    // portals
    if (!G.busy && G.map) {
      var portal = E.portalAt(G.map.id, Math.floor(p.x), Math.floor(p.y));
      if (portal && !G.modal) { enterMap(portal.to, portal.tx + 0.5, portal.ty + 0.5); }
    }
    // NPC movement (walk towards schedule target)
    if (G.map && G.map.id === "village") {
      G.npcs.forEach(function (n) {
        var target = E.npcPosition(n.id, st.clock.t);
        if (target.x !== n.tx || target.y !== n.ty) {
          n.tx = target.x; n.ty = target.y;
        }
        var dx = n.tx - n.x, dy = n.ty - n.y, dist = Math.sqrt(dx * dx + dy * dy);
        n.moving = dist > 0.05;
        if (n.moving) {
          var s = Math.min(dist, 2.0 * dt);
          n.x += dx / dist * s; n.y += dy / dist * s;
          if (Math.abs(dx) > Math.abs(dy)) n.dir = dx < 0 ? "left" : "right"; else n.dir = dy < 0 ? "up" : "down";
          n.frame = Math.floor(performance.now() / 160) % 4;
        } else { n.frame = 0; n.x = n.tx; n.y = n.ty; }
      });
    }
    // fishing timers
    if (G.fishing) updateFishing(dt);
    // auto-save
    G.saveAcc += dt;
    if (G.saveAcc > 30) { G.saveAcc = 0; saveGame("auto"); }
    if (passOut && !G.modal && !G.busy) passOutNow();
  }

  function updateFishing(dt) {
    var f = G.fishing;
    f.timer -= dt;
    if (f.phase === "wait" && f.timer <= 0) { f.phase = "bite"; f.timer = 1.3; SFX.bite(); }
    else if (f.phase === "bite" && f.timer <= 0) { f.phase = "missed"; f.timer = 0.8; toast("মাছ পালিয়ে গেল।"); }
    else if (f.phase === "missed" && f.timer <= 0) { G.fishing = null; }
  }
  function cancelFishing() { G.fishing = null; }

  // ---------- actions ----------
  function doAction() {
    if (G.modal || G.busy || !G.state) return;
    var st = G.state, p = st.player;
    if (G.fishing && G.fishing.phase === "bite") {
      var fid = E.pickFish(E.seasonIndex(st.clock.day));
      var r = E.catchFish(st, fid);
      SFX.harvest();
      toast(r.msg);
      G.fishing = null;
      afterAction();
      return;
    }
    if (G.fishing) { cancelFishing(); return; }
    var tgt = currentTarget();
    if (tgt.kind === "npc") return talkOrGift(tgt.npc);
    if (tgt.kind === "object") return useObject(tgt.obj);
    // tile action with held item
    var held = p.held, info = D.itemInfo(held), res = null;
    var f = { x: tgt.tx, y: tgt.ty };
    var ts = E.tileState(st, G.map.id, f.x, f.y);
    var mapId = G.map.id;
    if (ts && ts.crop && D.CROPS[ts.crop.id].grow <= ts.crop.prog) {
      res = E.harvest(st, mapId, f.x, f.y);
      if (res.ok) { SFX.harvest(); toast(res.msg); afterAction(); return; }
    }
    if (held === "hoe") { res = E.till(st, mapId, f.x, f.y); if (res.ok) SFX.till(); }
    else if (held === "can") { res = E.water(st, mapId, f.x, f.y); if (res.ok) SFX.water(); }
    else if (held === "rod") {
      if (E.tileChar(mapId, f.x, f.y) !== "W") res = { ok: false, msg: "পুকুরের পাড়ে দাঁড়িয়ে ছিপ ফেলো।" };
      else if (!E.castCost(st)) res = { ok: false, msg: "শরীর ক্লান্ত। ঘুমাতে হবে।" };
      else { G.fishing = { tx: f.x, ty: f.y, phase: "wait", timer: 2 + Math.random() * 3 }; SFX.splash(); return; }
    }
    else if (info && info.kind === "seed") { res = E.plant(st, mapId, f.x, f.y, held); if (res.ok) SFX.plant(); }
    else if (info && (info.kind === "crop" || info.kind === "fish")) res = { ok: false, msg: "এটা বিক্রি বা উপহার দেওয়ার জিনিস। বাক্সে বিক্রি করো বা বন্ধুকে দাও।" };
    else res = { ok: false, msg: "এখানে কিছু করা যাবে না।" };
    if (res && res.msg) toast(res.msg);
    if (res && res.ok) afterAction();
    if (!res || !res.ok) { if (p.energy <= 0) toast("শরীর ক্লান্ত। ঘুমিয়ে নাও।"); }
  }

  function afterAction() {
    var done = E.checkQuests(G.state);
    done.forEach(function (q) { toast("কাজ শেষ: " + q.title + " (+" + q.reward + " টাকা)"); });
    if (done.length) SFX.coin();
    updateHud();
    saveGame("action");
  }

  function talkOrGift(npc) {
    var st = G.state, held = D.itemInfo(st.player.held);
    var faceNpc = npc.x, faceY = npc.y;
    // face the NPC
    var p = st.player, dx = Math.round(npc.x) - Math.floor(p.x), dy = Math.round(npc.y) - Math.floor(p.y);
    if (Math.abs(dx) > Math.abs(dy)) p.dir = dx < 0 ? "left" : "right"; else p.dir = dy < 0 ? "up" : "down";
    npc.dir = { up: "down", down: "up", left: "right", right: "left" }[p.dir];
    if (held && (held.kind === "crop" || held.kind === "fish") && (st.inv[st.player.held] || 0) > 0) {
      var r = E.gift(st, npc.id, st.player.held);
      if (!r.ok) { toast(r.msg); return; }
      SFX.coin();
      showDialog({ speaker: npc.id, lines: [r.line], title: npc.name + " — উপহার" });
      toast(r.msg);
      afterAction();
      return;
    }
    var t = E.talk(st, npc.id);
    var lines = [t.line];
    if (!t.gained) lines = [t.line];
    showDialog({ speaker: npc.id, lines: lines, title: npc.name, afterClose: function () { var done = E.checkQuests(st); done.forEach(function (q) { toast("কাজ শেষ: " + q.title + " (+" + q.reward + " টাকা)"); }); updateHud(); saveGame("talk"); } });
    if (t.gained) toast(npc.name + " — বন্ধুত্ব +" + t.gained);
    saveGame("talk");
  }

  function useObject(obj) {
    if (obj.interact === "bed") {
      showDialog({ lines: ["ঘুমাতে যাবে? দিন শেষ হবে এবং সকালে ফসল বাড়বে।"], choices: [
        { label: "হ্যাঁ, ঘুমাই", fn: function () { closeModal(); sleepFlow(false); } },
        { label: "এখন না", fn: function () { closeModal(); } }
      ] });
    } else if (obj.interact === "shop") openShop("shop");
    else if (obj.interact === "bin") openShop("bin");
    else if (obj.interact === "box") toast("কাঠের বাক্সে পুরোনো কাপড় আর একটা গল্পের বই আছে।");
  }

  function passOutNow() {
    toast("রাত ২টা হয়ে গেছে! তুমি ক্লান্ত হয়ে ঘুমিয়ে পড়েছ।");
    sleepFlow(true);
  }

  function sleepFlow(passedOut) {
    if (G.busy) return;
    G.busy = true;
    SFX.sleep();
    var fade = $("#fade");
    fade.classList.add("on");
    setTimeout(function () {
      var st = G.state;
      var rep = E.sleepNight(st, { passedOut: passedOut });
      if (passedOut) st.player.energy = Math.floor(D.MAX_ENERGY * 0.6);
      setMap("home");
      st.player.x = 4.5; st.player.y = 4.5; st.player.dir = "down";
      R.snapCamera(G.map, st.player.x, st.player.y);
      G.fishing = null;
      saveGame("sleep");
      fade.classList.remove("on");
      setTimeout(function () { G.busy = false; showSleepSummary(rep); SFX.coin(); }, 260);
    }, 500);
  }

  function showSleepSummary(rep) {
    var st = G.state, si = E.seasonIndex(st.clock.day);
    var lines = [];
    lines.push((rep.passedOut ? "তুমি রাত ২টায় ঘুমিয়ে পড়েছিলে। " : "") + "নতুন দিন শুরু হলো।");
    lines.push("আজ " + D.SEASONS[si].name + " মৌসুম, " + bn(E.dayInSeason(st.clock.day)) + " তারিখ। আবহাওয়া: " + weatherName(st.weather) + ".");
    if (rep.grown) lines.push("গতকালের পানির কারণে " + bn(rep.grown) + "টি ফসল বাড়ল।");
    if (rep.newSeason) lines.push("মৌসুম বদলেছে — এখন " + D.SEASONS[si].name + "।");
    if (rep.withered.length) lines.push("মৌসুম শেষ হওয়ায় ফসল নষ্ট হলো: " + rep.withered.join(", ") + "।");
    showDialog({ title: "সকাল", lines: lines, speaker: null });
  }
  function weatherName(w) { return w === "rain" ? "বৃষ্টি" : w === "cloudy" ? "মেঘলা" : "রোদ"; }

  // ---------- held item cycle ----------
  function heldList() {
    var list = D.TOOL_ORDER.slice();
    Object.keys(G.state.inv).forEach(function (id) {
      var info = D.itemInfo(id);
      if (info && info.kind === "seed" && G.state.inv[id] > 0) list.push(id);
    });
    return list;
  }
  function cycleHeld(dir) {
    var list = heldList(), cur = list.indexOf(G.state.player.held);
    var next = list[((cur < 0 ? 0 : cur) + dir + list.length * 4) % list.length];
    G.state.player.held = next;
    SFX.ui();
    updateHud();
  }

  // ---------- HUD ----------
  function updateHud() {
    if (!G.state) return;
    var st = G.state, si = E.seasonIndex(st.clock.day);
    $("#hud-date").textContent = D.SEASONS[si].name + " • " + bn(E.dayInSeason(st.clock.day)) + " তারিখ • " + bn(E.yearOf(st.clock.day)) + " বছর";
    $("#hud-time").textContent = E.dayPart(st.clock.t) + " " + bn(E.clockText(st.clock.t));
    $("#hud-weather").textContent = weatherName(st.weather);
    $("#hud-coins").textContent = bn(st.player.coins) + " টাকা";
    var pct = Math.max(0, Math.min(1, st.player.energy / D.MAX_ENERGY));
    $("#hud-energy-bar").style.width = (pct * 100).toFixed(1) + "%";
    $("#hud-place").textContent = G.map ? G.map.name : "";
    var info = D.itemInfo(st.player.held);
    var name = info ? info.name : "";
    $("#held-name").textContent = name + (st.inv[st.player.held] ? " × " + bn(st.inv[st.player.held]) : "");
    var icon = $("#held-icon");
    var canvasIcon = A.itemIcon(st.player.held);
    if (icon.dataset.id !== st.player.held) { icon.src = canvasIcon.toDataURL(); icon.dataset.id = st.player.held; }
  }

  // ---------- modals ----------
  function openModal(name, html, cls) {
    G.modal = name;
    var m = $("#modal");
    m.className = "open " + (cls || "");
    m.innerHTML = html;
    m.dataset.name = name;
    SFX.ui();
    return m;
  }
  function closeModal() {
    var m = $("#modal");
    var was = G.modal;
    G.modal = null;
    m.className = "";
    m.innerHTML = "";
    if (was === "dialog" && G.dialogAfter) { var fn = G.dialogAfter; G.dialogAfter = null; fn(); }
    updateHud();
  }
  function panel(title, body, extra) {
    return '<div class="panel ' + (extra || "") + '"><div class="panel-head"><h2>' + esc(title) + '</h2><button class="x" data-close>✕</button></div>' + body + "</div>";
  }

  // Dialog: typewriter text, tap to advance, optional choices after the last line.
  function showDialog(opt) {
    var speaker = opt.speaker ? D.NPCS[opt.speaker] : null;
    var lines = opt.lines.slice(), idx = 0, typing = null, full = "";
    G.dialogAfter = opt.afterClose || null;
    var hasChoices = !!(opt.choices && opt.choices.length);
    var html = '<div class="dialog">' +
      '<div class="portrait"><canvas id="pcanvas" width="220" height="240"></canvas></div>' +
      '<div class="dialog-body"><div class="name" id="dname"></div>' +
      '<div class="text" id="dtext"></div>' +
      '<div class="choices" id="dchoices"></div>' +
      '<div class="hint" id="dhint">▶ চাপুন</div></div></div>';
    var m = openModal("dialog", html, "dlg");
    var nameEl = m.querySelector("#dname"), textEl = m.querySelector("#dtext");
    var hint = m.querySelector("#dhint"), choicesEl = m.querySelector("#dchoices");
    nameEl.textContent = opt.title || (speaker ? speaker.name : "");
    if (!opt.speaker && !opt.portrait) m.querySelector(".portrait").style.display = "none";
    else {
      var pid = opt.speaker || "player";
      var pc = m.querySelector("#pcanvas").getContext("2d");
      pc.drawImage(CF.Characters.portrait(pid, (G.state && G.state.player.gender) || "m", 220, 240), 0, 0);
    }
    function finishTyping() {
      clearInterval(typing); typing = null;
      textEl.textContent = full;
      afterTyped();
    }
    function typeLine(s) {
      full = s; textEl.textContent = "";
      hint.style.visibility = "hidden";
      clearInterval(typing);
      var i = 0;
      typing = setInterval(function () {
        i += 2; textEl.textContent = s.slice(0, i);
        if (i >= s.length) finishTyping();
      }, 22);
    }
    function afterTyped() {
      var last = idx >= lines.length - 1;
      if (!last) { hint.style.visibility = "visible"; return; }
      hint.style.visibility = "hidden";
      if (hasChoices) {
        choicesEl.innerHTML = opt.choices.map(function (c, i) { return '<button data-choice="' + i + '">' + esc(c.label) + "</button>"; }).join("");
      } else {
        hint.style.visibility = "visible";
        hint.textContent = "▶ চলো (চাপুন)";
      }
    }
    function advance() {
      if (typing) { finishTyping(); return; }
      if (idx < lines.length - 1) { idx++; typeLine(lines[idx]); return; }
      if (!hasChoices) closeModal();
    }
    G.dialogAdvance = advance;
    m.querySelector(".dialog-body").onclick = function (e) {
      var b = e.target.closest("[data-choice]");
      if (b) { var c = opt.choices[+b.dataset.choice]; G.dialogAfter = null; c.fn(); return; }
      advance();
    };
    typeLine(lines[0]);
  }

  function openShop(mode, tab) {
    var st = G.state, si = E.seasonIndex(st.clock.day);
    tab = tab || (mode === "shop" ? "buy" : "sell");
    var body = "";
    if (mode === "shop") {
      body += '<div class="tabs"><button data-tab="buy" class="' + (tab === "buy" ? "on" : "") + '">বীজ কিনুন</button><button data-tab="sell" class="' + (tab === "sell" ? "on" : "") + '">বিক্রি করুন</button></div>';
    }
    body += '<div class="coins">তোমার টাকা: ' + bn(st.player.coins) + '</div><div class="list">';
    if (tab === "buy") {
      E.seedsForSeason(si).forEach(function (sid) {
        var info = D.itemInfo(sid);
        body += row(sid, info.name, "মূল্য " + bn(info.price) + " টাকা", '<button data-buy="' + sid + '" data-q="1">১টি</button><button data-buy="' + sid + '" data-q="5">৫টি</button>');
      });
      body += '</div><p class="note">' + D.SEASONS[si].name + " মৌসুমে যে বীজ বোনা যায়, শুধু সেগুলোই এখানে পাওয়া যায়।</p>";
    } else {
      var sellable = Object.keys(st.inv).filter(function (id) { var i = D.itemInfo(id); return i && (i.kind === "crop" || i.kind === "fish"); });
      if (!sellable.length) body += '<p class="note">বিক্রির মতো কিছু নেই। ফসল বা মাছ তুলে আনো।</p>';
      sellable.forEach(function (id) {
        var info = D.itemInfo(id);
        body += row(id, info.name + " × " + bn(st.inv[id]), "দাম " + bn(info.price) + " টাকা", '<button data-sell="' + id + '" data-q="1">১টি</button><button data-sell="' + id + '" data-q="999">সব</button>');
      });
      body += "</div>";
    }
    var m = openModal("shop", panel(mode === "shop" ? "আমেনা মুদি দোকান" : "বিক্রয়-বাক্স", body, "wide"));
    m.onclick = function (e) {
      var t = e.target;
      if (t.closest("[data-close]")) return closeModal();
      var tb = t.closest("[data-tab]");
      if (tb) return openShop(mode, tb.dataset.tab);
      var bb = t.closest("[data-buy]");
      if (bb) {
        var r = E.buy(G.state, bb.dataset.buy, +bb.dataset.q);
        if (r.ok) SFX.coin(); toast(r.msg); saveGame("buy");
        return openShop(mode, "buy");
      }
      var sb = t.closest("[data-sell]");
      if (sb) {
        var have = G.state.inv[sb.dataset.sell] || 0;
        var rs = E.sell(G.state, sb.dataset.sell, Math.min(+sb.dataset.q, have));
        if (rs.ok) { SFX.coin(); toast(rs.msg); afterAction(); } else toast(rs.msg);
        return openShop(mode, "sell");
      }
    };
  }
  function row(id, title, sub, buttons) {
    return '<div class="row"><img src="' + A.itemIcon(id).toDataURL() + '" alt=""><div class="meta"><b>' + esc(title) + "</b><span>" + esc(sub) + '</span></div><div class="btns">' + buttons + "</div></div>";
  }

  function openInventory() {
    var st = G.state;
    var body = '<div class="grid">';
    var ids = D.TOOL_ORDER.concat(Object.keys(st.inv).sort());
    var seen = {};
    ids.forEach(function (id) {
      if (seen[id]) return; seen[id] = 1;
      var info = D.itemInfo(id);
      if (!info) return;
      var count = info.kind === "tool" ? 1 : (st.inv[id] || 0);
      if (count <= 0) return;
      body += '<button class="slot' + (st.player.held === id ? " on" : "") + '" data-hold="' + id + '"><img src="' + A.itemIcon(id).toDataURL() + '" alt=""><span>' + esc(info.name) + '</span><em>' + (info.kind === "tool" ? "" : bn(count)) + "</em></button>";
    });
    body += "</div><p class=\"note\">একটি জিনিস চাপলে সেটি হাতে নেওয়া হবে। ফসল বা মাছ থাকলে বন্ধুকে উপহার দেওয়া যায়।</p>";
    var m = openModal("inv", panel("ঝোলা", body, "wide"));
    m.onclick = function (e) {
      if (e.target.closest("[data-close]")) return closeModal();
      var b = e.target.closest("[data-hold]"); if (!b) return;
      G.state.player.held = b.dataset.hold; SFX.ui(); closeModal();
    };
  }

  function openJournal(tab) {
    tab = tab || "quests";
    var st = G.state, si = E.seasonIndex(st.clock.day);
    var tabs = '<div class="tabs"><button data-tab="quests" class="' + (tab === "quests" ? "on" : "") + '">কাজ</button><button data-tab="friends" class="' + (tab === "friends" ? "on" : "") + '">বন্ধু</button><button data-tab="farm" class="' + (tab === "farm" ? "on" : "") + '">খামার</button></div>';
    var body = "";
    if (tab === "quests") {
      body += '<div class="list">';
      D.QUESTS.forEach(function (q) {
        var done = !!st.quests.claimed[q.id];
        body += '<div class="row q ' + (done ? "done" : "") + '"><div class="check">' + (done ? "✔" : "○") + '</div><div class="meta"><b>' + esc(q.title) + '</b><span>' + esc(q.text) + '</span></div><div class="btns"><em>+' + bn(q.reward) + '</em></div></div>';
      });
      body += '</div><p class="note">আজ: ' + D.SEASONS[si].name + " মৌসুম • আবহাওয়া: " + weatherName(st.weather) + ". ফসলে প্রতিদিন পানি না দিলে বাড়বে না। মৌসুম বদলালে বেমানান ফসল নষ্ট হয়।</p>";
    } else if (tab === "friends") {
      body += '<div class="list">';
      Object.keys(D.NPCS).forEach(function (id) {
        var n = D.NPCS[id], f = st.friend[id], h = E.hearts(f.pts);
        var hearts = "";
        for (var i = 0; i < 8; i++) hearts += '<i class="' + (i < h ? "f" : "") + '">♥</i>';
        var talked = f.talkDay === st.clock.day ? "আজ কথা হয়েছে" : "আজ কথা হয়নি";
        var gifted = f.giftWeek === E.weekOf(st.clock.day) ? "এই সপ্তাহে উপহার দেওয়া হয়েছে" : "এই সপ্তাহে উপহার দেওয়া যাবে";
        body += '<div class="row friend"><img class="pt" src="' + CF.Characters.portrait(id, "m", 72, 72).toDataURL() + '" alt=""><div class="meta"><b>' + esc(n.name) + " <small>" + esc(n.role) + '</small></b><div class="hearts">' + hearts + "</div><span>" + talked + " • " + gifted + "</span></div></div>";
      });
      body += '</div><p class="note">প্রতিদিন একবার কথা বললে +' + bn(D.TALK_POINTS) + '। সপ্তাহে একবার উপহার দিলে ভালো লাগলে +' + bn(D.GIFT_LIKE) + '।</p>';
    } else {
      var s = st.stats;
      body += '<div class="stats">' +
        stat("বোনা বীজ", bn(s.planted)) + stat("তোলা ফসল", bn(s.harvested)) + stat("ধরা মাছ", bn(s.fish)) +
        stat("মোট আয়", bn(s.earned) + " টাকা") + stat("বছর", bn(E.yearOf(st.clock.day)) + " বছর") +
        stat("দিন", bn(st.clock.day) + " (মৌসুমের " + bn(E.dayInSeason(st.clock.day)) + " নং দিন)") +
        "</div>";
      body += '<p class="note">' + esc(st.player.farm) + " — " + esc(st.player.name) + "। প্রতি মৌসুম ১২ দিন, বছরে ৬ মৌসুম।</p>";
    }
    var m = openModal("journal", panel("ডায়েরি", tabs + body, "wide"));
    m.onclick = function (e) {
      if (e.target.closest("[data-close]")) return closeModal();
      var t = e.target.closest("[data-tab]"); if (t) openJournal(t.dataset.tab);
    };
  }
  function stat(k, v) { return '<div class="stat"><span>' + esc(k) + "</span><b>" + esc(v) + "</b></div>"; }

  function openMenu() {
    var body = '<div class="menu">' +
      '<button data-m="resume">চালিয়ে যাও</button>' +
      '<button data-m="save">খেলা সেভ করো</button>' +
      '<button data-m="sound">সাউন্ড: ' + (G.settings.sound ? "চালু" : "বন্ধ") + '</button>' +
      '<button data-m="help">কীভাবে খেলবে</button>' +
      '<button data-m="title">মূল মেনুতে যাও</button>' +
      '</div><p class="note">সংস্করণ ' + esc(VERSION) + '। খেলার অবস্থা ফোনে নিজে থেকে সেভ হয়।</p>';
    var m = openModal("menu", panel("মেনু", body, ""));
    m.onclick = function (e) {
      if (e.target.closest("[data-close]")) return closeModal();
      var b = e.target.closest("[data-m]"); if (!b) return;
      var k = b.dataset.m;
      if (k === "resume") closeModal();
      if (k === "save") { saveGame("manual"); toast("খেলা সেভ হলো।"); }
      if (k === "sound") { G.settings.sound = !G.settings.sound; saveSettings(); openMenu(); }
      if (k === "help") showDialog({ title: "কীভাবে খেলবে", lines: HELP_LINES });
      if (k === "title") { saveGame("title"); showTitle(); }
    };
  }
  var HELP_LINES = [
    "বাম দিকের বৃত্ত টেনে বা কি-বোর্ডের তীর দিয়ে হাঁটো।",
    "A বোতামে কথা বলো, বাড়ি/দোকান/বিক্রয়-বাক্সে কাজ করো।",
    "হাতের জিনিস (নিচে) পাল্টাতে ঘুরাও বোতাম চাপো। কোদাল দিয়ে মাটি কোপাও, ঝারি দিয়ে পানি দাও, বীজ বোনো।",
    "ছিপ নিয়ে পুকুরের পাড়ে দাঁড়াও। '!' দেখলে তাড়াতাড়ি A চাপো।",
    "ফসল পাকলে A দিয়ে তোলো। ফসল বা মাছ বিক্রয়-বাক্সে বিক্রি করো।",
    "দিন শেষে বাড়িতে বিছানায় ঘুমাও। রাত ২টায় জোর করে ঘুম আসে।"
  ];

  function showTitle() {
    G.state = G.state || E.newState({ name: "কৃষক" });
    var saved = loadSave();
    var body = '<div class="title"><h1>চালাবন ফার্ম</h1><p class="sub">গাজীপুরের লালমাটি, বাইদ আর শালবনের গল্প</p>' +
      '<div class="menu">' +
      (saved ? '<button data-t="continue">চালিয়ে যাও</button>' : "") +
      '<button data-t="new">' + (saved ? "নতুন খেলা (পুরোনো সেভ মুছবে)" : "নতুন খেলা শুরু করো") + '</button>' +
      '<button data-t="sound">সাউন্ড: ' + (G.settings.sound ? "চালু" : "বন্ধ") + '</button>' +
      "</div><p class=\"note\">সংস্করণ " + esc(VERSION) + "</p></div>";
    var m = openModal("title", body, "fullscreen");
    m.onclick = function (e) {
      var b = e.target.closest("[data-t]"); if (!b) return;
      var k = b.dataset.t;
      if (k === "continue") { G.state = saved; closeModal(); startPlay(); }
      if (k === "new") {
        if (!saved) return showNewGame();
        showDialog({ title: "সতর্কতা", lines: ["নতুন খেলা শুরু করলে আগের সেভ মুছে যাবে। তুমি কি নিশ্চিত?"], choices: [
          { label: "হ্যাঁ, নতুন শুরু", fn: function () { root.localStorage.removeItem(SAVE_KEY); showNewGame(); } },
          { label: "না, ফিরে যাও", fn: function () { showTitle(); } }
        ] });
      }
      if (k === "sound") { G.settings.sound = !G.settings.sound; saveSettings(); showTitle(); }
    };
  }

  function showNewGame() {
    var body = '<div class="newgame">' +
      '<h2>তোমার চরিত্র</h2>' +
      '<label>নাম<input id="ng-name" maxlength="16" value="রাশেদ" placeholder="তোমার নাম"></label>' +
      '<label>খামারের নাম<input id="ng-farm" maxlength="20" value="আমাদের খামার"></label>' +
      '<div class="genders"><button data-g="m" class="on"><canvas width="120" height="140" data-pc="m"></canvas>ছেলে কৃষক</button><button data-g="f"><canvas width="120" height="140" data-pc="f"></canvas>মেয়ে কৃষক</button></div>' +
      '<div class="menu"><button data-start>খেলা শুরু করো</button><button data-back>পেছনে</button></div>' +
      '<p class="note">নাম ও খামারের নাম পরে বদলানো যাবে না, তাই ভেবে লিখো।</p></div>';
    var m = openModal("newgame", panel("নতুন খেলা", body, "wide"));
    var gender = "m";
    function drawPC() {
      m.querySelectorAll("canvas[data-pc]").forEach(function (c) {
        var p = CF.Characters.portrait("player", c.dataset.pc, 120, 140);
        c.getContext("2d").clearRect(0, 0, 120, 140); c.getContext("2d").drawImage(p, 0, 0);
      });
    }
    drawPC();
    m.onclick = function (e) {
      if (e.target.closest("[data-close]") || e.target.closest("[data-back]")) return showTitle();
      var g = e.target.closest("[data-g]");
      if (g) { gender = g.dataset.g; m.querySelectorAll("[data-g]").forEach(function (b) { b.classList.toggle("on", b === g); }); return; }
      if (e.target.closest("[data-start]")) {
        var name = ($("#ng-name").value || "").trim() || "কৃষক";
        var farm = ($("#ng-farm").value || "").trim() || "আমাদের খামার";
        G.state = E.newState({ name: name, farm: farm, gender: gender });
        G.state.player.skin = Math.floor(Math.random() * 4);
        closeModal();
        setMap("farm");
        G.state.player.x = CF.Maps.farm.spawn.x + 0.5;
        G.state.player.y = CF.Maps.farm.spawn.y + 0.5;
        R.snapCamera(G.map, G.state.player.x, G.state.player.y);
        saveGame("new");
        startPlay();
        showDialog({ title: "স্বাগতম", lines: [
          "তোমার " + farm + " আজ থেকে শুরু। এটি শরৎকাল, মাঠে ধান কাটা শেষ। সামনে সবজির সময়।",
          "প্রথমে কোদাল নিয়ে লাল মাটি কোপাও, তারপর বেগুন বা মরিচের বীজ বোনো।",
          "চালাবন গ্রামে আমেনা খালার দোকানে বীজ পাবে। সব কাজের তালিকা ডায়েরিতে দেখো।"
        ] });
      }
    };
  }

  function startPlay() {
    setMap(G.state.player.map || "farm");
    if (G.map.id === "farm" || G.map.id === "village" || G.map.id === "home") {
      R.snapCamera(G.map, G.state.player.x, G.state.player.y);
    }
    updateHud();
    G.lastT = 0;
  }

  // ---------- input ----------
  function bindInput() {
    var keymap = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" };
    doc.addEventListener("keydown", function (e) {
      var k = keymap[e.code];
      if (k) { G.keys[k] = true; e.preventDefault(); return; }
      if (G.modal === "dialog") { if (e.code === "Space" || e.code === "Enter" || e.code === "KeyE") { G.dialogAdvance && G.dialogAdvance(); } return; }
      if (G.modal) { if (e.code === "Escape") closeModal(); return; }
      if (e.code === "KeyE" || e.code === "Space" || e.code === "Enter") { doAction(); e.preventDefault(); }
      else if (e.code === "KeyQ") cycleHeld(-1);
      else if (e.code === "KeyR" || e.code === "Tab") cycleHeld(1);
      else if (e.code === "KeyI") openInventory();
      else if (e.code === "KeyJ") openJournal("quests");
      else if (e.code === "Escape") openMenu();
    });
    doc.addEventListener("keyup", function (e) { var k = keymap[e.code]; if (k) G.keys[k] = false; });
    root.addEventListener("blur", function () { G.keys = {}; G.joy.active = false; saveGame("blur"); });
    doc.addEventListener("visibilitychange", function () { if (doc.hidden) saveGame("hidden"); });

    // on-screen buttons
    doc.getElementById("btn-act").addEventListener("pointerdown", function (e) { e.preventDefault(); if (G.modal === "dialog") { G.dialogAdvance && G.dialogAdvance(); return; } doAction(); SFX.ui(); });
    doc.getElementById("btn-held").addEventListener("pointerdown", function (e) { e.preventDefault(); if (!G.modal) cycleHeld(1); });
    doc.getElementById("btn-bag").addEventListener("pointerdown", function (e) { e.preventDefault(); if (!G.modal && G.state) openInventory(); });
    doc.getElementById("btn-book").addEventListener("pointerdown", function (e) { e.preventDefault(); if (!G.modal && G.state) openJournal("quests"); });
    doc.getElementById("btn-menu").addEventListener("pointerdown", function (e) { e.preventDefault(); if (!G.modal && G.state) openMenu(); });

    // virtual joystick
    var joy = doc.getElementById("joy"), knob = doc.getElementById("joy-knob");
    function joyMove(e) {
      var r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy, max = r.width * 0.36;
      var d = Math.sqrt(dx * dx + dy * dy), k = d > max ? max / d : 1;
      dx *= k; dy *= k;
      knob.style.transform = "translate(" + dx + "px," + dy + "px)";
      G.joy.x = dx / max; G.joy.y = dy / max;
      var dead = 0.18;
      if (Math.abs(G.joy.x) < dead) G.joy.x = 0; if (Math.abs(G.joy.y) < dead) G.joy.y = 0;
    }
    joy.addEventListener("pointerdown", function (e) {
      e.preventDefault(); G.joy.active = true; G.joy.id = e.pointerId; joy.setPointerCapture(e.pointerId); joyMove(e);
    });
    joy.addEventListener("pointermove", function (e) { if (G.joy.active && e.pointerId === G.joy.id) joyMove(e); });
    function joyEnd(e) {
      if (e.pointerId !== G.joy.id) return;
      G.joy.active = false; G.joy.x = 0; G.joy.y = 0; G.joy.id = null; knob.style.transform = "translate(0,0)";
    }
    joy.addEventListener("pointerup", joyEnd); joy.addEventListener("pointercancel", joyEnd);

    // tap on the world: interact with the tile in front (keeps phone players happy)
    doc.getElementById("world").addEventListener("pointerdown", function (e) {
      if (G.modal || G.busy) return;
      if (e.pointerType === "mouse") doAction();
    });
    root.addEventListener("resize", function () { R.resize(); });
    root.addEventListener("orientationchange", function () { R.resize(); });
    // do not let the browser scroll/zoom the game
    doc.addEventListener("gesturestart", function (e) { e.preventDefault(); });
  }

  // ---------- main loop ----------
  function frame(now) {
    var dt = G.lastT ? Math.min(0.05, (now - G.lastT) / 1000) : 0;
    G.lastT = now;
    var st = G.state;
    if (st && G.map && !G.modal && !G.busy) update(dt);
    if (st && G.map) {
      if (!G.modal && !G.busy) R.follow(G.map, st.player.x, st.player.y);
      var tgt = (!G.modal && !G.busy) ? currentTarget() : null;
      R.draw({
        state: st, map: G.map, npcs: G.npcs,
        fishing: G.fishing, prompt: promptFor(tgt),
        moving: G.moving, playerFrame: G.playerFrame
      });
    } else {
      // title: draw farm backdrop with a demo state
      if (!G.demo) { G.demo = E.newState({ name: "কৃষক" }); G.demo.player.map = "farm"; G.demo.player.skin = 1; }
      setMapTemp();
      R.draw({ state: G.demo, map: CF.Maps.farm, npcs: [], fishing: null, prompt: null, moving: true, playerFrame: G.playerFrame });
    }
    root.requestAnimationFrame(frame);
  }
  // title backdrop: a slowly walking farmer on the farm map (demo state, never saved)
  function setMapTemp() {
    var t = performance.now() / 1000, p = G.demo.player;
    p.x = 12.5 + Math.sin(t / 4) * 4; p.y = 8.5;
    p.dir = Math.cos(t / 4) > 0 ? "right" : "left";
    R.follow(CF.Maps.farm, p.x, p.y);
    G.moving = true; G.walkT += 0.25; G.playerFrame = Math.floor(G.walkT) % 4;
  }

  // ---------- boot ----------
  function boot() {
    loadSettings();
    R.init($("#world"));
    bindInput();
    var start = function () { showTitle(); updateHud(); root.requestAnimationFrame(frame); };
    if (doc.fonts && doc.fonts.load) {
      Promise.all([doc.fonts.load("700 14px 'Hind Siliguri'"), doc.fonts.load("400 14px 'Hind Siliguri'")]).then(start, start);
    } else start();
    setInterval(function () { if (G.state && !G.modal) updateHud(); }, 1000);
  }

  CF.Game = { boot: boot, G: G, saveGame: saveGame };
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot); else boot();
})(typeof window !== "undefined" ? window : globalThis);
