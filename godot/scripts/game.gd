extends Node
## Global game state (autoload "Game"): time, money, energy, inventory, friendship, crops, save/load.

signal time_changed
signal wallet_changed
signal inventory_changed
signal notice(text: String)
signal forced_sleep

const SAVE_PATH: String = "user://save.json"
const SAVE_VERSION: int = 2

var active: bool = false
var paused: bool = false
var day: int = 1
var season: int = GameData.START_SEASON
var total_days: int = 1
var minute: float = 0.0
var money: int = GameData.START_COINS
var energy: int = GameData.MAX_ENERGY
var inventory: Dictionary = {}
var friend: Dictionary = {}
var talked: Dictionary = {}
var gifted: Dictionary = {}
var stats: Dictionary = {}
var quests_done: Dictionary = {}
var grids: Dictionary = {}
var map_id: String = "farm"
var player_pos: Array = [72.0, 112.0]
var gender: String = "m"
var skin: int = 0
var rain: bool = false
var touch_dir: Vector2 = Vector2.ZERO
var hand_index: int = 0
var rng: RandomNumberGenerator = RandomNumberGenerator.new()
var _forced_emitted: bool = false
var _last_minute_int: int = -1


func _ready() -> void:
	rng.randomize()
	_reset_stats()


func _reset_stats() -> void:
	stats = {"planted": 0, "harvested": 0, "fish": 0, "earned": 0, "talked": {}, "talked_count": 0}


func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)


func new_game(g: String, s: int) -> void:
	gender = g
	skin = s
	day = 1
	season = GameData.START_SEASON
	total_days = 1
	minute = 0.0
	money = GameData.START_COINS
	energy = GameData.MAX_ENERGY
	inventory = {"hoe": 1, "can": 1, "rod": 1, "seed_begun": 3, "seed_chili": 3}
	friend = {}
	talked = {}
	gifted = {}
	_reset_stats()
	quests_done = {}
	grids = {}
	map_id = "farm"
	player_pos = [72.0, 112.0]
	rain = false
	hand_index = 0
	_forced_emitted = false
	_last_minute_int = -1
	active = true


func _process(delta: float) -> void:
	if not active or paused:
		return
	minute += delta / GameData.SECONDS_PER_GAME_MIN
	if int(minute) != _last_minute_int:
		_last_minute_int = int(minute)
		time_changed.emit()
	if minute >= GameData.DAY_END_MIN and not _forced_emitted:
		_forced_emitted = true
		forced_sleep.emit()


func hour() -> float:
	return 6.0 + minute / 60.0


func clock_text() -> String:
	var m: int = int(minute)
	var hh: int = 6 + m / 60
	var mm: int = m % 60
	if hh >= 24:
		hh -= 24
	return "%02d:%02d" % [hh, mm]


func map_name() -> String:
	var names: Dictionary = {"farm": "লালমাটি ফার্ম", "village": "চালাবন গ্রাম", "home": "আমাদের ঘর"}
	return str(names.get(map_id, map_id))


func season_name() -> String:
	return GameData.SEASON_NAMES[season]


func get_grid(id: String, w: int, h: int) -> FarmGrid:
	if not grids.has(id):
		var g: FarmGrid = FarmGrid.new()
		g.setup(w, h)
		grids[id] = g
	return grids[id]


func count_item(id: String) -> int:
	return int(inventory.get(id, 0))


func add_item(id: String, n: int = 1) -> void:
	inventory[id] = count_item(id) + n
	inventory_changed.emit()


func remove_item(id: String, n: int = 1) -> bool:
	if count_item(id) < n:
		return false
	var left: int = count_item(id) - n
	if left <= 0 and not GameData.is_tool_item(id):
		inventory.erase(id)
	else:
		inventory[id] = left
	inventory_changed.emit()
	return true


func add_money(n: int) -> void:
	money = max(0, money + n)
	if n > 0:
		stats["earned"] = int(stats["earned"]) + n
	wallet_changed.emit()


func spend_energy(n: int) -> bool:
	if energy < n:
		notice.emit("খুব ক্লান্ত লাগছে। ঘুমিয়ে শক্তি ফেরাও।")
		return false
	energy -= n
	return true


func stat_add(key: String, n: int = 1) -> void:
	stats[key] = int(stats.get(key, 0)) + n


func held_list() -> Array:
	var out: Array = []
	for t in GameData.TOOL_ORDER:
		out.append(t)
	var extra: Array = []
	for k in inventory.keys():
		if not GameData.is_tool_item(k) and count_item(k) > 0:
			extra.append(k)
	extra.sort()
	out.append_array(extra)
	return out


func held_item() -> String:
	var l: Array = held_list()
	if l.is_empty():
		return ""
	hand_index = posmod(hand_index, l.size())
	return l[hand_index]


func cycle_hand() -> void:
	hand_index += 1
	inventory_changed.emit()


func friend_points(npc: String) -> int:
	return int(friend.get(npc, 0))


func hearts(npc: String) -> int:
	return mini(10, friend_points(npc) / GameData.HEART_STEP)


func add_friend(npc: String, pts: int) -> void:
	friend[npc] = clampi(friend_points(npc) + pts, 0, GameData.FRIEND_MAX)


func talk_to(npc: String) -> bool:
	if int(talked.get(npc, -1)) == total_days:
		return false
	talked[npc] = total_days
	add_friend(npc, GameData.TALK_POINTS)
	var t: Dictionary = stats["talked"]
	if not t.has(npc):
		t[npc] = true
		stats["talked"] = t
		stat_add("talked_count")
	return true


func can_gift(npc: String) -> bool:
	return int(gifted.get(npc, -1)) != total_days


## Returns 1 like, 0 neutral, -1 hate.
func gift(npc: String, item: String) -> int:
	var data: Dictionary = GameData.NPCS[npc]
	var kind: int = 0
	if (data["likes"] as Array).has(item):
		kind = 1
	elif (data["hates"] as Array).has(item):
		kind = -1
	var pts: int = GameData.GIFT_NEUTRAL
	if kind == 1:
		pts = GameData.GIFT_LIKE
	elif kind == -1:
		pts = GameData.GIFT_HATE
	add_friend(npc, pts)
	gifted[npc] = total_days
	remove_item(item, 1)
	return kind


func check_quests() -> Array:
	var msgs: Array = []
	for q in GameData.QUESTS:
		var qid: String = q["id"]
		if quests_done.has(qid):
			continue
		var value: int = 0
		if q["stat"] == "talked_count":
			value = (stats["talked"] as Dictionary).size()
		else:
			value = int(stats.get(q["stat"], 0))
		if value >= int(q["target"]):
			quests_done[qid] = true
			add_money(int(q["reward"]))
			msgs.append("কাজ শেষ: %s (+%d টাকা)" % [q["title"], int(q["reward"])])
	return msgs


## Advance to the next morning. Returns a summary message.
func end_of_day() -> String:
	var msg_parts: Array = []
	for k in grids.keys():
		var g: FarmGrid = grids[k]
		if rain:
			for y in range(g.get_height()):
				for x in range(g.get_width()):
					if g.is_tilled(x, y):
						g.water(x, y)
		g.end_of_day()
	total_days += 1
	day += 1
	if day > GameData.DAYS_PER_SEASON:
		day = 1
		season = (season + 1) % GameData.SEASON_NAMES.size()
		msg_parts.append("ঋতু বদলে গেল: %s" % season_name())
	rain = rng.randf() < float(GameData.SEASON_RAIN[season])
	energy = GameData.MAX_ENERGY
	minute = 0.0
	_forced_emitted = false
	_last_minute_int = -1
	talked = {}
	gifted = {}
	msg_parts.append_array(check_quests())
	wallet_changed.emit()
	inventory_changed.emit()
	time_changed.emit()
	var head := "নতুন দিন: %s, দিন %d" % [season_name(), day]
	msg_parts.push_front(head)
	if rain:
		msg_parts.append("আজ বৃষ্টি হবে, মাঠে পানি লাগবে না।")
	return "\n".join(msg_parts)


# ---------------------------------------------------------------- save / load

func _pack_to_array(p: PackedInt32Array) -> Array:
	var out: Array = []
	for v in p:
		out.append(int(v))
	return out


func _array_to_pack(a: Array) -> PackedInt32Array:
	var out: PackedInt32Array = PackedInt32Array()
	for v in a:
		out.append(int(v))
	return out


func save_game() -> bool:
	var grid_data: Dictionary = {}
	for k in grids.keys():
		var st: Dictionary = (grids[k] as FarmGrid).export_state()
		grid_data[k] = {
			"w": int(st["w"]), "h": int(st["h"]),
			"crop": _pack_to_array(st["crop"]), "grown": _pack_to_array(st["grown"]),
			"required": _pack_to_array(st["required"]), "regrow": _pack_to_array(st["regrow"]),
			"watered": _pack_to_array(st["watered"]), "tilled": _pack_to_array(st["tilled"]),
		}
	var data: Dictionary = {
		"version": SAVE_VERSION, "day": day, "season": season, "total_days": total_days,
		"minute": minute, "money": money, "energy": energy, "inventory": inventory,
		"friend": friend, "talked": talked, "gifted": gifted, "stats": stats,
		"quests_done": quests_done, "grids": grid_data, "map_id": map_id,
		"player_pos": player_pos, "gender": gender, "skin": skin, "rain": rain,
		"hand_index": hand_index,
	}
	var f: FileAccess = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if f == null:
		notice.emit("সেভ করা যায়নি।")
		return false
	f.store_string(JSON.stringify(data))
	f.close()
	return true


func load_game() -> bool:
	if not has_save():
		return false
	var f: FileAccess = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if f == null:
		return false
	var parsed: Variant = JSON.parse_string(f.get_as_text())
	f.close()
	if typeof(parsed) != TYPE_DICTIONARY:
		return false
	var d: Dictionary = parsed
	if int(d.get("version", 0)) != SAVE_VERSION:
		return false
	day = int(d["day"])
	season = int(d["season"])
	total_days = int(d["total_days"])
	minute = float(d["minute"])
	money = int(d["money"])
	energy = int(d["energy"])
	inventory = {}
	for k in (d["inventory"] as Dictionary).keys():
		inventory[k] = int(d["inventory"][k])
	friend = {}
	for k in (d["friend"] as Dictionary).keys():
		friend[k] = int(d["friend"][k])
	talked = d["talked"]
	gifted = {}
	for k in (d["gifted"] as Dictionary).keys():
		gifted[k] = int(d["gifted"][k])
	stats = d["stats"]
	quests_done = d["quests_done"]
	grids = {}
	for k in (d["grids"] as Dictionary).keys():
		var gd: Dictionary = d["grids"][k]
		var g: FarmGrid = FarmGrid.new()
		g.import_state({
			"w": int(gd["w"]), "h": int(gd["h"]),
			"crop": _array_to_pack(gd["crop"]), "grown": _array_to_pack(gd["grown"]),
			"required": _array_to_pack(gd["required"]), "regrow": _array_to_pack(gd["regrow"]),
			"watered": _array_to_pack(gd["watered"]), "tilled": _array_to_pack(gd["tilled"]),
		})
		grids[k] = g
	map_id = str(d["map_id"])
	player_pos = d["player_pos"]
	gender = str(d["gender"])
	skin = int(d["skin"])
	rain = bool(d["rain"])
	hand_index = int(d["hand_index"])
	_forced_emitted = false
	_last_minute_int = -1
	active = true
	return true
