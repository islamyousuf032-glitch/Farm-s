class_name World
extends Node2D
## One map at a time: ground tiles, props, crops, villagers, player, camera and weather FX.

const T: int = 16

var main: Node = null
var hud: Hud = null
var map_id: String = ""
var map: Dictionary = {}
var ground: TileMapLayer = null
var terrain: Dictionary = {}          # Vector2i -> map char
var blocked: Dictionary = {}          # Vector2i -> true
var interact_at: Dictionary = {}      # Vector2i -> interact kind
var portals: Dictionary = {}          # Vector2i -> portal dict
var grid: FarmGrid = null
var crop_sprites: Dictionary = {}     # Vector2i -> Sprite2D
var water_cells: Array = []
var npcs: Array = []
var player: Player = null
var camera: Camera2D = null
var rain_fx: CPUParticles2D = null
var leaf_fx: CPUParticles2D = null
var _water_phase: int = 0
var _changing: bool = false
var astar: AStarGrid2D = null         # navigation grid for villagers (solid = blocked)
var shelter_rects: Array = []         # Rect2i footprints of buildings (indoors)
var shelter_doors: Array = []         # Vector2i door cell per building


static func cell_of(p: Vector2) -> Vector2i:
	return Vector2i(floori(p.x / 16.0), floori((p.y - 2.0) / 16.0))


func _ready() -> void:
	y_sort_enabled = true


func notice(text: String) -> void:
	Game.notice.emit(text)


func load_map(id: String, pos: Vector2) -> void:
	for c in get_children():
		remove_child(c)
		c.queue_free()
	_changing = false
	map_id = id
	map = GameMaps.build(id)
	Game.map_id = id
	terrain.clear()
	blocked.clear()
	interact_at.clear()
	portals.clear()
	crop_sprites.clear()
	water_cells.clear()
	_edge_layers.clear()
	npcs.clear()
	shelter_rects.clear()
	shelter_doors.clear()
	var w: int = int(map["w"])
	var h: int = int(map["h"])
	grid = null
	if id == "farm":
		grid = Game.get_grid("farm", w, h)
	y_sort_enabled = true

	ground = TileMapLayer.new()
	ground.tile_set = Art.tileset()
	ground.z_index = -10
	add_child(ground)
	var rows: Array = map["rows"]
	for y in range(h):
		for x in range(w):
			_paint(x, y, str(rows[y][x]))
	_paint_edges(w, h)
	_paint_water_decor()
	_paint_grass_decor(w, h)

	for o in map["objects"]:
		_place_object(o)

	for p in map["portals"]:
		portals[Vector2i(int(p["x"]), int(p["y"]))] = p

	if grid != null:
		for y in range(h):
			for x in range(w):
				if grid.get_crop(x, y) > 0:
					_refresh_crop(Vector2i(x, y))

	_build_nav(w, h)
	for o in map["objects"]:
		if str(o["type"]) in ["house", "shop", "school"]:
			var ox: int = int(o["x"])
			var oy: int = int(o["y"])
			var ow: int = int(o["w"])
			var oh: int = int(o["h"])
			shelter_rects.append(Rect2i(ox, oy, ow, oh))
			shelter_doors.append(Vector2i(ox + ow / 2, oy + oh))
	for nid in map["npcs"]:
		var n: Npc = Npc.new()
		n.setup(str(nid), self)
		add_child(n)
		npcs.append(n)

	player = Player.new()
	add_child(player)
	player.setup(self, Game.gender, Game.skin)
	player.position = pos

	camera = Camera2D.new()
	camera.zoom = Vector2(3.0, 3.0)
	camera.position_smoothing_enabled = true
	camera.position_smoothing_speed = 9.0
	camera.limit_left = 0
	camera.limit_top = 0
	camera.limit_right = w * T
	camera.limit_bottom = h * T
	player.add_child(camera)
	camera.make_current()

	rain_fx = CPUParticles2D.new()
	rain_fx.emitting = Game.rain
	rain_fx.amount = 180
	rain_fx.lifetime = 0.7
	rain_fx.position = Vector2(0, -120)
	rain_fx.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	rain_fx.emission_rect_extents = Vector2(230, 4)
	rain_fx.direction = Vector2(0.15, 1.0)
	rain_fx.spread = 4.0
	rain_fx.initial_velocity_min = 420.0
	rain_fx.initial_velocity_max = 480.0
	rain_fx.scale_amount_min = 1.0
	rain_fx.scale_amount_max = 2.0
	rain_fx.color = Color(0.7, 0.85, 1.0, 0.45)
	rain_fx.z_index = 50
	camera.add_child(rain_fx)

	leaf_fx = CPUParticles2D.new()
	leaf_fx.emitting = Game.season == 2 or Game.season == 3
	leaf_fx.amount = 14
	leaf_fx.lifetime = 6.0
	leaf_fx.position = Vector2(0, -120)
	leaf_fx.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	leaf_fx.emission_rect_extents = Vector2(230, 4)
	leaf_fx.direction = Vector2(0.3, 1.0)
	leaf_fx.spread = 30.0
	leaf_fx.gravity = Vector2(10, 22)
	leaf_fx.initial_velocity_min = 8.0
	leaf_fx.initial_velocity_max = 18.0
	leaf_fx.scale_amount_min = 1.5
	leaf_fx.scale_amount_max = 2.5
	leaf_fx.color = Color(0.85, 0.55, 0.2, 0.9)
	leaf_fx.z_index = 49
	camera.add_child(leaf_fx)

	var wt: Timer = Timer.new()
	wt.wait_time = 0.55
	wt.autostart = true
	wt.timeout.connect(_on_water_tick)
	add_child(wt)
	var ct: Timer = Timer.new()
	ct.wait_time = 0.5
	ct.autostart = true
	ct.timeout.connect(_chat_tick)
	add_child(ct)

	if not Game.time_changed.is_connected(_on_time_changed):
		Game.time_changed.connect(_on_time_changed)
	_on_time_changed()


# ---------------------------------------------------------------- villager navigation

func _build_nav(w: int, h: int) -> void:
	astar = AStarGrid2D.new()
	astar.region = Rect2i(0, 0, w, h)
	astar.cell_size = Vector2(16, 16)
	astar.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_NEVER
	astar.update()
	for c in blocked.keys():
		if _in_nav(c):
			astar.set_point_solid(c, true)


func _in_nav(c: Vector2i) -> bool:
	return astar != null and c.x >= 0 and c.y >= 0 and c.x < astar.region.size.x and c.y < astar.region.size.y


func walkable(c: Vector2i) -> bool:
	return _in_nav(c) and not astar.is_point_solid(c)


## Shortest path from a to b as cells, excluding the start cell. Empty if none.
func find_path(a: Vector2i, b: Vector2i) -> Array:
	if astar == null or not _in_nav(a) or not _in_nav(b):
		return []
	var goal: Vector2i = b if walkable(b) else nearest_walkable(b)
	if goal == Vector2i(-1, -1) or goal == a:
		return []
	var ids: Array = astar.get_id_path(a, goal)
	if not ids.is_empty() and ids[0] == a:
		ids.remove_at(0)
	return ids


func nearest_walkable(c: Vector2i) -> Vector2i:
	for r in range(1, 7):
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var n: Vector2i = c + Vector2i(dx, dy)
				if walkable(n):
					return n
	return Vector2i(-1, -1)


func random_walkable_near(c: Vector2i, radius: int) -> Vector2i:
	for i in range(20):
		var n: Vector2i = c + Vector2i(randi_range(-radius, radius), randi_range(-radius, radius))
		if walkable(n):
			return n
	return c


func is_shelter_cell(c: Vector2i) -> bool:
	for r in shelter_rects:
		if (r as Rect2i).has_point(c):
			return true
	return false


## Nearest building door, used as the shelter target when it rains.
func shelter_for(c: Vector2i) -> Vector2i:
	var best: Vector2i = c
	var best_d: int = 1 << 30
	for d in shelter_doors:
		var dd: int = absi(d.x - c.x) + absi(d.y - c.y)
		if dd < best_d:
			best_d = dd
			best = d
	return best


func nearest_free_npc(me: Npc, max_dist: int) -> Npc:
	var best: Npc = null
	var best_d: int = max_dist + 1
	for o in npcs:
		var n: Npc = o as Npc
		if n == me or n.is_busy():
			continue
		var d: int = absi(n.cell().x - me.cell().x) + absi(n.cell().y - me.cell().y)
		if d < best_d:
			best_d = d
			best = n
	return best


## Two idle villagers close together start a conversation.
func _chat_tick() -> void:
	for i in range(npcs.size()):
		var a: Npc = npcs[i]
		if a.is_busy():
			continue
		var b: Npc = nearest_free_npc(a, 2)
		if b == null:
			continue
		if a.brain.social > 0.55 or b.brain.social > 0.55:
			a.begin_chat(b, true)
			b.begin_chat(a, false)
			return


func _on_time_changed() -> void:
	for n in npcs:
		(n as Npc).place_for_hour(Game.hour())


func _on_water_tick() -> void:
	# Round 2: no swapping. The banded water_a/water_b tiles caused the stripes, and the
	# pond must stay 100% the single plain water_fill tile.
	return


func _tex(path: String) -> Texture2D:
	return Art.texture("props/" + path)


func _prop(pname: String, feet: Vector2) -> Sprite2D:
	var s: Sprite2D = Sprite2D.new()
	var t: Texture2D = _tex(pname)
	s.texture = t
	s.centered = false
	s.position = feet
	s.offset = Vector2(-t.get_width() / 2.0, -t.get_height())
	add_child(s)
	return s


func _paint(x: int, y: int, ch: String) -> void:
	var cell: Vector2i = Vector2i(x, y)
	terrain[cell] = ch
	var n: int = (x * 7 + y * 13) % 3
	var tname: String = "grass_a"
	match ch:
		".", "B", "R":
			tname = "grass_%02d" % _pick_w(x, y, 1, GRASS_WEIGHTS)
		"#":
			# ground under a tree uses the same grass as everywhere else (no darker per-zone patch)
			tname = "grass_%02d" % _pick_w(x, y, 1, GRASS_WEIGHTS)
		"f":
			tname = "grass_%02d" % _pick_w(x, y, 1, GRASS_WEIGHTS)
		"S":
			# plain seamless fill; striped tilled look only for cells the player tilled (never random)
			tname = "dirt_tilled_00" if (grid != null and grid.is_tilled(x, y)) else "dirt_fill"
		"P":
			tname = "road_fill"
		"T":
			tname = "mud_fill"
		"W":
			tname = "water_fill"
			water_cells.append(cell)
		"h":
			tname = "floor_wood"
		"X":
			tname = "wall_wood"
		"r":
			tname = "rug"
		_:
			tname = "grass_a"
	ground.set_cell(cell, Art.tile_source(), Art.tile_atlas(tname))
	if ch in ["#", "B", "R", "W", "X"]:
		blocked[cell] = true
	var feet: Vector2 = Vector2(x * T + 8.0, y * T + 16.0)
	if ch == "#":
		_prop("tree_sal", feet)
	elif ch == "B":
		_prop("bamboo", feet)
	elif ch == "R":
		_prop("rock", feet)


# ---------------------------------------------------------------- transitions and pond decor
# Edge layers: a grass cell beside a path, soil or bank, or a bank beside water, gets a
# transition piece on the side that faces that neighbour. Each side has its own layer so
# one cell can carry several edges.
const GRASS_WEIGHTS: Array = [70, 20, 10]  # grass_00 / grass_01 / grass_02 (curated plain grass)
const WD_COUNT := 6  # pond decor sprites (wd_00..wd_05)
const GD_COUNT := 6  # grass decor sprites (gd_00..gd_05)
const EDGE_SIDES := {"N": Vector2i(0, -1), "E": Vector2i(1, 0), "S": Vector2i(0, 1), "W": Vector2i(-1, 0)}
var _edge_layers: Dictionary = {}


func _kind(ch: String) -> String:
	match ch:
		".", "f", "B", "R", "#":
			return "grass"
		"S":
			return "soil"
		"P":
			return "path"
		"T":
			return "bank"
		"W":
			return "water"
	return "other"


func _edge_group(kind: String, nb: String) -> String:
	if kind == "grass":
		if nb == "path":
			return "road"
		# grass beside soil/bank: no complete transition set exists in the packs, so a clean hard edge is used
	elif kind == "bank" and nb == "water":
		return ""  # no shore set: the 1-cell mud ring is a fill tile, not an edge
	return ""


func _edge_layer(key: String) -> TileMapLayer:
	if not _edge_layers.has(key):
		var layer: TileMapLayer = TileMapLayer.new()
		layer.tile_set = Art.tileset()
		layer.z_index = -9
		add_child(layer)
		_edge_layers[key] = layer
	return _edge_layers[key]


func _paint_edges(w: int, h: int) -> void:
	for y in range(h):
		for x in range(w):
			var c: Vector2i = Vector2i(x, y)
			var kind: String = _kind(str(terrain.get(c, "")))
			if kind == "other":
				continue
			for side in EDGE_SIDES:
				var n: Vector2i = c + EDGE_SIDES[side]
				if n.x < 0 or n.y < 0 or n.x >= w or n.y >= h:
					continue
				var nb: String = _kind(str(terrain.get(n, "")))
				var grp: String = _edge_group(kind, nb)
				if grp == "":
					continue
				var k: int = (x + y) % 2 if grp == "road" else 0  # alternate, so no piece repeats along a straight border
				_edge_layer(grp + "_" + side).set_cell(c, Art.tile_source(), Art.tile_atlas("edge_%s_%s_%02d" % [grp, side, k]))


## Sparse lily and ripple pieces on pond cells, on their own layer so the water animation is untouched.
func _paint_water_decor() -> void:
	# Disabled in round 2: the pond interior must be 100% the plain water fill.
	return
	var layer: TileMapLayer = TileMapLayer.new()
	layer.tile_set = Art.tileset()
	layer.z_index = -9
	add_child(layer)
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = 7
	for c in water_cells:
		if rng.randf() < 0.05:
			var i: int = rng.randi() % WD_COUNT
			layer.set_cell(c, Art.tile_source(), Art.tile_atlas("wd_%02d" % i))


## Sparse grass decor (flowers, tufts, small weeds) on open grass only, never under trees or rocks.
func _paint_grass_decor(w: int, h: int) -> void:
	var layer: TileMapLayer = TileMapLayer.new()
	layer.tile_set = Art.tileset()
	layer.z_index = -9
	add_child(layer)
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = 11
	var placed_decor: Array = []
	for y in range(h):
		for x in range(w):
			var c: Vector2i = Vector2i(x, y)
			var ch: String = str(terrain.get(c, ""))
			if ch != "." and ch != "f":
				continue
			# exclusion zone: keep one free grass cell around paths, soil, water, banks, trees and buildings
			var clear: bool = true
			for dy in range(-1, 2):
				for dx in range(-1, 2):
					var nch: String = str(terrain.get(c + Vector2i(dx, dy), "#"))
					if nch != "." and nch != "f":
						clear = false
			if not clear:
				continue
			if rng.randf() < 0.03 and _decor_gap_ok(c, placed_decor):
				placed_decor.append(c)
				layer.set_cell(c, Art.tile_source(), Art.tile_atlas("gd_%02d" % (rng.randi() % GD_COUNT)))


## Weighted pick over n = weights.size() options, deterministic per cell.
func _pick_w(x: int, y: int, salt: int, weights: Array) -> int:
	var r: int = _pick(x, y, salt, 100)
	var acc: int = 0
	for i in range(weights.size()):
		acc += int(weights[i])
		if r < acc:
			return i
	return weights.size() - 1


## Decor must sit at least 2 cells apart (Chebyshev distance).
func _decor_gap_ok(c: Vector2i, placed: Array) -> bool:
	for p in placed:
		if absi(p.x - c.x) < 2 and absi(p.y - c.y) < 2:
			return false
	return true


## Stable pseudo-random pick in 0..n-1 for a cell, so the same map always looks the same.
func _pick(x: int, y: int, salt: int, n: int) -> int:
	var hsh: int = (x * 73856093) ^ (y * 19349663) ^ (salt * 83492791)
	return absi(hsh) % n


func _place_object(o: Dictionary) -> void:
	var ox: int = int(o["x"])
	var oy: int = int(o["y"])
	var ow: int = int(o["w"])
	var oh: int = int(o["h"])
	var feet: Vector2 = Vector2((ox + ow / 2.0) * T, (oy + oh) * T)
	var spr: String = str(o.get("spr", o["type"]))
	if spr != "":
		_prop(spr, feet)
	var block: bool = bool(o.get("block", true))
	for yy in range(oy, oy + oh):
		for xx in range(ox, ox + ow):
			var c: Vector2i = Vector2i(xx, yy)
			if block:
				blocked[c] = true
			if o.has("interact"):
				interact_at[c] = str(o["interact"])


# ---------------------------------------------------------------- queries

func blocked_at(p: Vector2) -> bool:
	var x0: int = floori((p.x - 5.0) / 16.0)
	var x1: int = floori((p.x + 4.0) / 16.0)
	var y0: int = floori((p.y - 4.0) / 16.0)
	var y1: int = floori((p.y - 1.0) / 16.0)
	for y in range(y0, y1 + 1):
		for x in range(x0, x1 + 1):
			if blocked.has(Vector2i(x, y)):
				return true
	return false


func check_portal(p: Player) -> void:
	if _changing:
		return
	var c: Vector2i = cell_of(p.position)
	if portals.has(c):
		_changing = true
		var d: Dictionary = portals[c]
		call_deferred("_enter_portal", str(d["to"]), int(d["tx"]), int(d["ty"]))


func _enter_portal(to: String, tx: int, ty: int) -> void:
	var pos: Vector2 = Vector2(tx * T + 8.0, ty * T + 16.0)
	Game.player_pos = [pos.x, pos.y]
	load_map(to, pos)


func facing_cell() -> Vector2i:
	return cell_of(player.position) + player.facing


func npc_at(c: Vector2i) -> Npc:
	for n in npcs:
		if (n as Npc).cell() == c:
			return n
	return null


func hand_is_fishing() -> bool:
	return player != null and player.fish_state > 0


# ---------------------------------------------------------------- actions

func act() -> void:
	if player == null:
		return
	if player.fishing_action():
		return
	var fc: Vector2i = facing_cell()
	var npc: Npc = npc_at(fc)
	if npc == null:
		npc = npc_at(cell_of(player.position) + player.facing)
	if npc != null:
		var held: String = Game.held_item()
		if GameData.is_giftable(held) and Game.can_gift(npc.id):
			var kind: int = Game.gift(npc.id, held)
			hud.open_gift(npc.id, kind)
			Game.check_quests()
		else:
			hud.open_talk(npc.id)
		return
	if interact_at.has(fc):
		_interact(str(interact_at[fc]))
		return
	if grid != null and grid.get_stage(fc.x, fc.y) == 4:
		_harvest(fc)
		return
	_use_held(Game.held_item(), fc)


func _interact(kind: String) -> void:
	if kind == "shop":
		hud.open_shop("shop")
	elif kind == "bin":
		hud.open_shop("bin")
	elif kind == "bed":
		hud.open_choice("ঘুমাতে যাবে? দিন শেষ হবে।", main.sleep_now, Callable())
	elif kind == "box":
		hud.open_dialog("", "", ["কাঠের বাক্সে এখন তেমন কিছু নেই।"], Callable())


func _harvest(c: Vector2i) -> void:
	var idx: int = grid.harvest(c.x, c.y)
	if idx <= 0:
		return
	var key: String = GameData.CROP_ORDER[idx - 1]
	Game.add_item("crop_" + key, 1)
	Game.stat_add("harvested")
	_refresh_crop(c)
	notice("%s তোলা হলো!" % GameData.CROPS[key]["name"])
	for m in Game.check_quests():
		notice(str(m))


func _use_held(id: String, fc: Vector2i) -> void:
	if id == "" :
		return
	if id == "hoe":
		if grid == null or terrain.get(fc, "") != "S" or grid.is_tilled(fc.x, fc.y) or grid.get_crop(fc.x, fc.y) > 0:
			notice("এখানে কোদাল দিয়ে কাজ হবে না। লাল মাটিতে কুপাও।")
			return
		if not Game.spend_energy(int(GameData.TOOLS["hoe"]["energy"])):
			return
		grid.till(fc.x, fc.y)
		_refresh_soil(fc)
	elif id == "can":
		if grid == null or not grid.is_tilled(fc.x, fc.y) or grid.is_watered(fc.x, fc.y):
			notice("এখানে পানি দেওয়ার কিছু নেই।")
			return
		if not Game.spend_energy(int(GameData.TOOLS["can"]["energy"])):
			return
		grid.water(fc.x, fc.y)
		_refresh_soil(fc)
	elif id == "rod":
		if terrain.get(fc, "") != "W":
			notice("পুকুরের জলের দিকে মুখ করে ছিপ ফেলো।")
			return
		if not Game.spend_energy(int(GameData.TOOLS["rod"]["energy"])):
			return
		player.start_fishing()
	elif id.begins_with("seed_"):
		_plant(id, fc)
	else:
		notice("%s দিয়ে এখানে কিছু করা যায় না।" % GameData.item_name(id))


func _plant(id: String, fc: Vector2i) -> void:
	var key: String = id.substr(5)
	if not GameData.CROPS.has(key):
		return
	if grid == null or not grid.is_tilled(fc.x, fc.y) or grid.get_crop(fc.x, fc.y) > 0:
		notice("বীজ বোনার জন্য লাল মাটি কুপিয়ে নাও।")
		return
	var c: Dictionary = GameData.CROPS[key]
	if not (c["seasons"] as Array).has(Game.season):
		notice("এখন %s-এর মৌসুম নয়।" % GameData.SEASON_NAMES[Game.season])
		return
	if not Game.remove_item(id, 1):
		return
	grid.plant(fc.x, fc.y, GameData.crop_index(key), int(c["grow"]), int(c["regrow"]))
	Game.stat_add("planted")
	_refresh_crop(fc)
	for m in Game.check_quests():
		notice(str(m))


func catch_fish() -> void:
	var pool: Array = GameData.fish_for_season(Game.season)
	var total: int = 0
	for k in pool:
		total += int(GameData.FISH[k]["weight"])
	var roll: int = Game.rng.randi_range(1, total)
	var pick: String = str(pool[0])
	for k in pool:
		roll -= int(GameData.FISH[k]["weight"])
		if roll <= 0:
			pick = str(k)
			break
	Game.add_item("fish_" + pick, 1)
	Game.stat_add("fish")
	notice("%s ধরা পড়েছে!" % GameData.FISH[pick]["name"])
	for m in Game.check_quests():
		notice(str(m))


# ---------------------------------------------------------------- visuals for soil & crops

func _refresh_soil(c: Vector2i) -> void:
	var tname: String = "dirt_fill"
	if grid != null and grid.is_tilled(c.x, c.y):
		tname = "dirt_tilled_wet" if grid.is_watered(c.x, c.y) else "dirt_tilled_00"
	ground.set_cell(c, Art.tile_source(), Art.tile_atlas(tname))


func _refresh_crop(c: Vector2i) -> void:
	var idx: int = grid.get_crop(c.x, c.y)
	var sp: Sprite2D = null
	if crop_sprites.has(c):
		sp = crop_sprites[c]
	if idx == 0:
		if sp != null:
			remove_child(sp)
			sp.queue_free()
			crop_sprites.erase(c)
		return
	if sp == null:
		sp = Sprite2D.new()
		sp.centered = false
		sp.offset = Vector2(-8, -16)
		sp.position = Vector2(c.x * T + 8.0, c.y * T + 14.0)
		add_child(sp)
		crop_sprites[c] = sp
	var key: String = GameData.CROP_ORDER[idx - 1]
	sp.texture = Art.texture("crops/" + key)
	sp.region_enabled = true
	var stage: int = clampi(grid.get_stage(c.x, c.y), 1, 4)
	sp.region_rect = Rect2(stage * 16, 0, 16, 16)
