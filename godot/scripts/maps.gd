class_name GameMaps
extends RefCounted
## Map layouts. Grid chars:
##  . grass   f flower grass   S red soil (tillable)   P mud path   T pond bank
##  W pond water (fishing, blocked)   # sal tree (blocked)   B bamboo (blocked)
##  R rock (blocked)   h wood floor   X interior wall (blocked)   r rug
## Objects: {type, x, y, w, h, spr?, interact?, block?}. Footprint blocks unless block == false.
## Portals: {x, y, to, tx, ty}.


static func build(id: String) -> Dictionary:
	if id == "village":
		return _village()
	if id == "home":
		return _home()
	return _farm()


static func _grid(w: int, h: int, ch: String) -> Array:
	var g: Array = []
	for y in range(h):
		var row: Array = []
		for x in range(w):
			row.append(ch)
		g.append(row)
	return g


static func _put(g: Array, x: int, y: int, ch: String) -> void:
	if y >= 0 and y < g.size() and x >= 0 and x < (g[y] as Array).size():
		g[y][x] = ch


static func _rect(g: Array, x1: int, y1: int, x2: int, y2: int, ch: String) -> void:
	for y in range(y1, y2 + 1):
		for x in range(x1, x2 + 1):
			_put(g, x, y, ch)


static func _scatter(g: Array, r: RandomNumberGenerator, ch: String, count: int, allowed: String) -> void:
	var placed: int = 0
	var tries: int = 0
	var w: int = (g[0] as Array).size()
	var h: int = g.size()
	while placed < count and tries < 5000:
		tries += 1
		var x: int = r.randi_range(0, w - 1)
		var y: int = r.randi_range(0, h - 1)
		if g[y][x] == allowed:
			g[y][x] = ch
			placed += 1


static func _rows(g: Array) -> Array:
	var out: Array = []
	for row in g:
		var s: String = ""
		for c in row:
			s += str(c)
		out.append(s)
	return out


static func _farm() -> Dictionary:
	var r := RandomNumberGenerator.new()
	r.seed = 20261013
	var g: Array = _grid(26, 16, ".")
	_rect(g, 0, 0, 25, 0, "#")
	_rect(g, 0, 15, 25, 15, "#")
	_rect(g, 0, 0, 0, 15, "#")
	_rect(g, 25, 0, 25, 15, "#")
	_rect(g, 25, 7, 25, 8, "P")
	_rect(g, 8, 3, 16, 11, "S")
	_rect(g, 3, 4, 3, 5, "P")
	_rect(g, 3, 6, 7, 6, "P")
	_rect(g, 7, 3, 7, 12, "P")
	_rect(g, 19, 9, 24, 14, "T")
	_rect(g, 20, 10, 23, 13, "W")
	_rect(g, 21, 1, 24, 2, "B")
	_rect(g, 2, 11, 3, 12, "#")
	_rect(g, 1, 13, 1, 14, "#")
	_put(g, 5, 13, "R")
	_put(g, 14, 14, "R")
	_scatter(g, r, "f", 26, ".")
	_scatter(g, r, "#", 2, ".")
	return {
		"id": "farm", "name": "লালমাটি ফার্ম", "w": 26, "h": 16,
		"rows": _rows(g),
		"objects": [
			{"type": "house", "spr": "house_farm", "x": 1, "y": 1, "w": 6, "h": 3, "label": "আমাদের চালা ঘর"},
			{"type": "bin", "spr": "bin", "x": 17, "y": 5, "w": 1, "h": 1, "interact": "bin", "label": "বিক্রয়-বাক্স"},
			{"type": "scarecrow", "spr": "scarecrow", "x": 12, "y": 2, "w": 1, "h": 1},
			{"type": "sign", "spr": "sign", "x": 24, "y": 9, "w": 1, "h": 1, "label": "চালাবন গ্রাম → পূর্ব দিকে"},
		],
		"portals": [
			{"x": 3, "y": 4, "to": "home", "tx": 4, "ty": 5},
			{"x": 25, "y": 7, "to": "village", "tx": 1, "ty": 7},
			{"x": 25, "y": 8, "to": "village", "tx": 1, "ty": 8},
		],
		"spawn": [4, 6],
		"npcs": [],
	}


static func _village() -> Dictionary:
	var r := RandomNumberGenerator.new()
	r.seed = 7310
	var g: Array = _grid(28, 16, ".")
	_rect(g, 0, 0, 27, 0, "#")
	_rect(g, 0, 15, 27, 15, "#")
	_rect(g, 0, 0, 0, 15, "#")
	_rect(g, 27, 0, 27, 15, "#")
	_rect(g, 0, 7, 0, 8, "P")
	_rect(g, 1, 6, 26, 8, "P")
	_rect(g, 4, 9, 24, 13, "P")
	_rect(g, 7, 11, 11, 14, "T")
	_rect(g, 8, 12, 10, 13, "W")
	_rect(g, 1, 12, 2, 14, "B")
	_put(g, 12, 13, "#")
	_put(g, 13, 13, "#")
	_put(g, 12, 14, "#")
	_put(g, 26, 14, "#")
	_rect(g, 20, 13, 21, 14, "R")
	_scatter(g, r, "f", 30, ".")
	_scatter(g, r, "#", 3, ".")
	return {
		"id": "village", "name": "চালাবন গ্রাম", "w": 28, "h": 16,
		"rows": _rows(g),
		"objects": [
			{"type": "house", "spr": "house_village", "x": 3, "y": 2, "w": 5, "h": 3, "label": "রফিকের ঘর"},
			{"type": "shop", "spr": "shop", "x": 14, "y": 2, "w": 4, "h": 3, "label": "আমেনা মুদি দোকান"},
			{"type": "counter", "spr": "", "x": 15, "y": 5, "w": 1, "h": 1, "interact": "shop", "label": "দোকান"},
			{"type": "house", "spr": "house_village", "x": 21, "y": 2, "w": 5, "h": 3, "label": "মজিদ চাচার ঘর"},
			{"type": "school", "spr": "school", "x": 21, "y": 10, "w": 6, "h": 3, "label": "প্রাথমিক বিদ্যালয়"},
			{"type": "well", "spr": "well", "x": 10, "y": 9, "w": 1, "h": 1, "label": "গ্রামের কুয়া"},
			{"type": "bench", "spr": "bench", "x": 18, "y": 9, "w": 2, "h": 1, "block": false},
			{"type": "rickshaw", "spr": "rickshaw", "x": 4, "y": 7, "w": 1, "h": 1, "block": false, "label": "রিকশা স্ট্যান্ড"},
		],
		"portals": [
			{"x": 0, "y": 7, "to": "farm", "tx": 24, "ty": 7},
			{"x": 0, "y": 8, "to": "farm", "tx": 24, "ty": 8},
		],
		"spawn": [2, 7],
		"npcs": ["ameena", "mojid", "rafiq", "shiuli"],
	}


static func _home() -> Dictionary:
	var g: Array = _grid(10, 7, "X")
	_rect(g, 1, 1, 8, 5, "h")
	_put(g, 4, 6, "P")
	return {
		"id": "home", "name": "আমাদের ঘর", "w": 10, "h": 7,
		"rows": _rows(g),
		"objects": [
			{"type": "bed", "spr": "bed", "x": 2, "y": 1, "w": 2, "h": 1, "interact": "bed", "label": "বিছানা"},
			{"type": "box", "spr": "box", "x": 7, "y": 1, "w": 1, "h": 1, "interact": "box", "label": "কাঠের বাক্স"},
			{"type": "table", "spr": "table", "x": 6, "y": 4, "w": 1, "h": 1, "label": "ছোট টেবিল"},
			{"type": "rug", "spr": "rug", "x": 3, "y": 3, "w": 2, "h": 1, "block": false},
		],
		"portals": [{"x": 4, "y": 6, "to": "farm", "tx": 3, "ty": 5}],
		"spawn": [4, 5],
		"npcs": [],
	}
