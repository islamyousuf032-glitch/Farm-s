extends SceneTree
## Headless smoke test: godot --headless --path godot --script res://tests/smoke_test.gd
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
	var grid = ClassDB.instantiate("FarmGrid")
	check(grid != null, "native class FarmGrid is registered")
	if grid == null:
		print("SMOKE_FAILED")
		quit(1)
		return
	grid.setup(4, 4)
	check(grid.till(1, 1), "FarmGrid till")
	check(grid.plant(1, 1, 2, 2, 0), "FarmGrid plant")
	check(grid.water(1, 1), "FarmGrid water")
	grid.end_of_day()
	grid.end_of_day()
	check(grid.get_stage(1, 1) == 4, "FarmGrid grows to ready stage")
	check(grid.harvest(1, 1) == 2, "FarmGrid harvest returns crop")
	check(grid.get_crop(1, 1) == 0, "FarmGrid clears single-harvest crop")
	var st: Dictionary = grid.export_state()
	var g2 = ClassDB.instantiate("FarmGrid")
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
	w._plant("seed_chili", soil)
	check(w.grid.get_crop(soil.x, soil.y) == 1, "planting seed on tilled soil")

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

	# UI paths
	main.hud.open_shop("shop")
	main.hud.open_journal()
	main.hud.on_action("cancel")
	check(not main.hud.journal_panel.visible, "journal closes")

	var c: Color = main.daylight(900.0)
	check(c.r > 0.0 and c.r <= 1.5, "daylight colour")

	print("RESULT failures=%d" % failures)
	if failures == 0:
		print("SMOKE_OK")
		quit(0)
	else:
		print("SMOKE_FAILED")
		quit(1)
