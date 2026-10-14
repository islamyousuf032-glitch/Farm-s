extends SceneTree
## Headless smoke test: godot --headless --path godot --script res://tests/smoke_test.gd
## No static types for World/Npc here: typed refs would compile world.gd before autoloads exist.
## Everything that is only available after startup (autoload, native class, class_name types)
## is looked up at runtime, so this script parses no matter when the engine registers them.
## Prints SMOKE_OK on success; exits non-zero on failure.

const GD = preload("res://scripts/data.gd")

var failures: int = 0
var G: Node = null


func check(cond: bool, label: String) -> void:
	if cond:
		print("ok   - " + label)
	else:
		print("FAIL - " + label)
		failures += 1


func _initialize() -> void:
	call_deferred("_run")


func _frames(n: int) -> void:
	for i in range(n):
		await process_frame


func _run() -> void:
	G = root.get_node_or_null("/root/Game")
	check(G != null, "autoload Game present")
	if G == null:
		print("SMOKE_FAILED")
		quit(1)
		return

	# Native core (C++ GDExtension)
	var grid = load("res://scripts/farm_grid.gd").new()
	check(grid != null, "FarmGrid script loads")
	if grid == null:
		print("SMOKE_FAILED")
		quit(1)
		return
	grid.setup(4, 4)
	check(grid.till(1, 1), "FarmGrid till")
	check(grid.plant(1, 1, 2, 2, 0), "FarmGrid plant")
	check(grid.water(1, 1), "FarmGrid water")
	grid.end_of_day()
	grid.water(1, 1)
	grid.end_of_day()
	check(grid.get_stage(1, 1) == 4, "FarmGrid grows to ready stage")
	check(grid.harvest(1, 1) == 2, "FarmGrid harvest returns crop")
	check(grid.get_crop(1, 1) == 0, "FarmGrid clears single-harvest crop")
	var st: Dictionary = grid.export_state()
	var g2 = load("res://scripts/farm_grid.gd").new()
	g2.import_state(st)
	check(g2.get_width() == 4 and g2.get_height() == 4, "FarmGrid export/import")

	# Main scene and a new game
	var main_scene: PackedScene = load("res://scenes/main.tscn")
	var main: Node = main_scene.instantiate()
	root.add_child(main)
	await _frames(2)
	main.start_new("m", 0)
	await _frames(3)
	var w = main.world
	check(w != null and w.map_id == "farm", "new game loads farm")
	check(G.active and G.money == GD.START_COINS, "new game state")
	check(w.grid != null, "farm has a crop grid")

	var soil: Vector2i = Vector2i(10, 6)
	w.grid.till(soil.x, soil.y)
	check(w.grid.is_tilled(soil.x, soil.y), "tilled soil cell")
	w._plant("seed_begun", soil)
	check(w.grid.get_crop(soil.x, soil.y) > 0, "planting seed on tilled soil")

	G.add_item("crop_lau", 2)
	check(G.count_item("crop_lau") == 2, "add item")
	check(G.remove_item("crop_lau", 1), "remove item")
	G.add_money(50)
	check(G.money >= 50, "money add")

	# Village and friendship
	w.load_map("village", Vector2(2 * 16 + 8, 7 * 16 + 16))
	await _frames(2)
	check(w.npcs.size() == 4, "village spawns 4 villagers")
	check(G.talk_to("ameena"), "talk gives friendship")
	check(not G.talk_to("ameena"), "talk once per day")
	check(G.friend_points("ameena") == GD.TALK_POINTS, "talk points")

	# Save and load round trip
	check(G.save_game(), "save game")
	var money_before: int = G.money
	G.money = 0
	check(G.load_game(), "load game")
	check(G.money == money_before, "load restores money")
	check(G.grids.has("farm"), "load restores farm grid")

	# Day end
	var day_before: int = G.total_days
	var msg: String = G.end_of_day()
	check(G.total_days == day_before + 1, "end of day advances day")
	check(msg.length() > 0, "end of day message")

	# UI paths (the talk above may have left a dialog open; close it first)
	main.hud.dialog_panel.visible = false
	main.hud.open_shop("shop")
	main.hud.on_action("cancel")
	main.hud.open_journal()
	main.hud.on_action("cancel")
	check(not main.hud.journal_panel.visible, "journal closes")

	var c: Color = main.daylight(900.0)
	check(c.r > 0.0 and c.r <= 1.5, "daylight colour")

	# Bengali font coverage: every character used in NPC / crop text must exist in the font
	var fnt: Font = load("res://fonts/HindSiliguri-Regular.ttf")
	var missing: String = ""
	var texts: Array = []
	for k in GD.NPCS.keys():
		texts.append_array(GD.NPCS[k]["lines"])
		texts.append(str(GD.NPCS[k]["name"]))
	for k in GD.CROPS.keys():
		texts.append(str(GD.CROPS[k]["name"]))
	texts.append_array(GD.GREET_LINES)
	texts.append_array(GD.GREET_FRIEND_LINES)
	texts.append_array(GD.CHATTER_LINES)
	for t in texts:
		for i in range(str(t).length()):
			var code: int = str(t).unicode_at(i)
			if code > 32 and not fnt.has_char(code) and missing.find(char(code)) < 0:
				missing += char(code)
	print("FONT missing chars: [" + missing + "]")
	check(missing == "", "Bengali font covers all NPC and crop text")
	main.hud.open_dialog("T", "", ["কথা বলার পরীক্ষা।"], Callable())
	await _frames(2)
	print("DLG text size=%s visible=%s" % [str(main.hud.dlg_text.size), str(main.hud.dialog_panel.visible)])
	check(main.hud.dlg_text.get_theme_font("font") != null, "dialog label has a font")
	main.hud.dialog_panel.visible = false

	# Villager AI: utility decisions (pure logic)
	var NB = load("res://scripts/npc_brain.gd")
	var b = NB.new("t")
	var base: Dictionary = {"hour": 10.0, "day": 1, "rain": false, "outdoors": true, "routine": Vector2i(3, 3), "shelter": Vector2i(3, 3), "player_dist": 99, "social_partner_dist": -1, "friendship": 0}
	var d1: Dictionary = b.decide(base.merged({"player_dist": 1}, true))
	check(d1["action"] == "greet", "AI greets a player who is close")
	b.register_greet(10.0, 1)
	var d2: Dictionary = b.decide(base.merged({"player_dist": 1}, true))
	check(d2["action"] != "greet", "AI does not repeat greeting inside cooldown")
	var d3: Dictionary = b.decide(base.merged({"rain": true}, true))
	check(d3["action"] == "shelter", "AI seeks shelter in rain")
	var b2 = NB.new("u")
	b2.social = 0.9
	var d4: Dictionary = b2.decide(base.merged({"social_partner_dist": 2}, true))
	check(d4["action"] == "socialize", "AI socialises when lonely and a villager is near")
	var d5: Dictionary = b2.decide(base)
	check(d5["action"] == "routine" or d5["action"] == "wander", "AI returns to routine without company")
	var b3 = NB.new("h")
	b3.action = "socialize"
	b3.social = 0.6
	var d6: Dictionary = b3.decide(base.merged({"social_partner_dist": 2}, true))
	check(d6["action"] == "socialize", "AI hysteresis keeps current action when close in score")
	check(NB.mood_from_friendship(300) == 1.0 and NB.mood_from_friendship(0) == 0.0, "friendship mood maps to 0..1")

	# Villager navigation: A* path on the village grid avoids blocked cells
	var vw = main.world
	check(vw.map_id == "village" or vw.map_id == "farm", "world map loaded for navigation test")
	var p1: Array = vw.find_path(Vector2i(2, 7), Vector2i(20, 7))
	var clear_path: bool = not p1.is_empty()
	for cc in p1:
		if not vw.walkable(cc):
			clear_path = false
	check(clear_path, "villager path exists and never crosses blocked cells")
	check(vw.find_path(Vector2i(2, 7), Vector2i(2, 7)).is_empty(), "no path needed when already there")

	# Villager chat: two villagers beside each other start talking
	var va = vw.npcs[0]
	var vb = vw.npcs[1]
	va.begin_chat(vb, true)
	vb.begin_chat(va, false)
	await _frames(3)
	check(va.chat_partner == vb and vb.chat_partner == va, "villagers enter a chat")
	check(va.bubble.visible or vb.bubble.visible, "a chat line is shown in a speech bubble")
	va.end_chat()
	vb.end_chat()

	print("RESULT failures=%d" % failures)
	if failures == 0:
		print("SMOKE_OK")
		quit(0)
	else:
		print("SMOKE_FAILED")
		quit(1)
