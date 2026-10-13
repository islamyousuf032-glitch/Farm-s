/* চালাবন ফার্ম — character appearance specs (original designs; see docs/character-design-sheet-bn.md) */
(function (root) {
  "use strict";
  var CF = (root.CF = root.CF || {});

  var NPC_SPECS = {
    ameena: { gender: "f", skin: "#9a6443", hair: "#e5e0da", grey: true, top: "#2e7d5b", bottom: "#2e7d5b", accent: "#b23a3a", dupatta: true },
    mojid:  { gender: "m", skin: "#7e5235", hair: "#e5e0da", grey: true, top: "#f1efe7", bottom: "#5b4a86", lungi: true, beard: true, gamchha: true, accent: "#c94a3a", hat: true },
    rafiq:  { gender: "m", skin: "#9c6843", hair: "#1d1612", top: "#e0703a", bottom: "#34476b", gamchha: false },
    shiuli: { gender: "f", skin: "#c08a60", hair: "#1a1412", braid: true, top: "#7a4fb0", bottom: "#2f4f6f", dupatta: true, accent: "#f4c542", glasses: true, bag: true }
  };

  var PLAYER_SPECS = {
    m: { gender: "m", hair: "#1f1714", top: "#4f9bd6", bottom: "#2f6f5a", lungi: true, gamchha: true, hat: true, accent: "#c94a3a" },
    f: { gender: "f", hair: "#1f1714", braid: true, top: "#e0708a", bottom: "#4a4f9e", dupatta: true, accent: "#f2e3c6", hat: true }
  };
  var PLAYER_SKINS = ["#a8714a", "#c28a5f", "#8d5a3b", "#d59a6b"];

  function spec(id) { return NPC_SPECS[id]; }
  function playerSpec(p) {
    var base = PLAYER_SPECS[p.gender === "f" ? "f" : "m"];
    var s = {};
    Object.keys(base).forEach(function (k) { s[k] = base[k]; });
    s.skin = PLAYER_SKINS[(p.skin || 0) % PLAYER_SKINS.length];
    return s;
  }

  CF.Characters = {
    NPC_SPECS: NPC_SPECS,
    PLAYER_SPECS: PLAYER_SPECS,
    PLAYER_SKINS: PLAYER_SKINS,
    spec: spec,
    playerSpec: playerSpec,
    portrait: function (id, playerGender, w, h) {
      var s = id === "player" ? playerSpec({ gender: playerGender }) : spec(id);
      return CF.Art.portrait(s, w, h);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
