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
	npcs.clear()
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

	for o in map["objects"]:
		_place_object(o)

	for p in map["portals"]:
		portals[Vector2i(int(p["x"]), int(p["y"]))] = p

	if grid != null:
		for y in range(h):
			for x in range(w):
				if grid.get_crop(x, y) > 0:
					_refresh_crop(Vector2i(x, y))

	for nid in map["npcs"]:
		var n: Npc = Npc.new()
		n.setup(str(nid))
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

	if not Game.time_changed.is_connected(_on_time_changed):
		Game.time_changed.connect(_on_time_changed)
	_on_time_changed()


func _on_time_changed() -> void:
	for n in npcs:
		(n as Npc).place_for_hour(Game.hour())


func _on_water_tick() -> void:
	_water_phase = 1 - _water_phase
	var tname: String = "water_a" if _water_phase == 0 else "water_b"
	var atlas: Vector2i = Art.tile_atlas(tname)
	for c in water_cells:
		ground.set_cell(c, Art.tile_source(), atlas)


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
	var grass: Array = ["grass_a", "grass_b", "grass_c"]
	var tname: String = "grass_a"
	match ch:
		".", "B", "R":
			tname = grass[n]
		"#":
			tname = "grass_dark"
		"f":
			tname = "grass_flower"
		"S":
			tname = "soil_tilled" if (grid != null and grid.is_tilled(x, y)) else "soil_dry"
		"P":
			tname = "path"
		"T":
			tname = "bank"
		"W":
			tname = "water_a"
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
	var tname: String = "soil_dry"
	if grid != null and grid.is_tilled(c.x, c.y):
		tname = "wet_soil" if grid.is_watered(c.x, c.y) else "soil_tilled"
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
