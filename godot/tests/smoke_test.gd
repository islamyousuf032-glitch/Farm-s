extends SceneTree
## Headless smoke test: run with `godot --headless --path godot --script res://tests/smoke_test.gd`.
## Prints SMOKE_OK on success; exits non-zero on failure.

var failures: int = 0


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
	var main_scene: PackedScene = load("res://scenes/main.tscn")
	var main: Node = main_scene.instantiate()
	root.add_child(main)
	await _frames(2)

	# Native core
	var g: FarmGrid = FarmGrid.new()
	g.setup(4, 4)
	check(g.till(1, 1), "FarmGrid till")
	check(g.plant(1, 1, 2, 2, 0), "FarmGrid plant")
	check(g.water(1, 1), "FarmGrid water")
	g.end_of_day()
	g.end_of_day()
	check(g.get_stage(1, 1) == 4, "FarmGrid grows to ready stage")
	check(g.harvest(1, 1) == 2, "FarmGrid harvest returns crop")
	check(g.get_crop(1, 1) == 0, "FarmGrid clears single-harvest crop")
	var st: Dictionary = g.export_state()
	var g2: FarmGrid = FarmGrid.new()
	g2.import_state(st)
	check(g2.get_width() == 4 and g2.get_height() == 4, "FarmGrid export/import")

	# New game and world
	main.start_new("m", 0)
	await _frames(3)
	check(main.world != null and main.world.map_id == "farm", "new game loads farm")
	check(Game.active and Game.money == GameData.START_COINS, "new game state")
	var w: World = main.world
	var fc: Vector2i = w.facing_cell()
	check(w.grid != null, "farm has a crop grid")

	# Till a red-soil cell and plant a seed in the next season-appropriate crop
	var soil: Vector2i = Vector2i(10, 6)
	w.grid.till(soil.x, soil.y)
	check(w.grid.is_tilled(soil.x, soil.y), "tilled soil cell")
	w._plant("seed_chili", soil)
	check(w.grid.get_crop(soil.x, soil.y) == 1, "planting seed on tilled soil")

	# Inventory / money helpers
	Game.add_item("crop_lau", 2)
	check(Game.count_item("crop_lau") == 2, "add item")
	check(Game.remove_item("crop_lau", 1), "remove item")
	Game.add_money(50)
	check(Game.money >= 50, "money add")

	# Friendship via talking to an NPC (village)
	main.world.load_map("village", Vector2(2 * 16 + 8, 7 * 16 + 16))
	await _frames(2)
	check(main.world.npcs.size() == 4, "village spawns 4 villagers")
	check(Game.talk_to("ameena"), "talk gives friendship")
	check(not Game.talk_to("ameena"), "talk once per day")
	check(Game.friend_points("ameena") == GameData.TALK_POINTS, "talk points")

	# Save then load round trip
	check(Game.save_game(), "save game")
	var money_before: int = Game.money
	Game.money = 0
	check(Game.load_game(), "load game")
	check(Game.money == money_before, "load restores money")
	check(Game.grids.has("farm"), "load restores farm grid")

	# Day end
	var day_before: int = Game.total_days
	var msg: String = Game.end_of_day()
	check(Game.total_days == day_before + 1, "end of day advances day")
	check(msg.length() > 0, "end of day message")

	# Dialogue / shop open without errors
	main.hud.open_shop("shop")
	main.hud.open_journal()
	main.hud.on_action("cancel")
	check(not main.hud.journal_panel.visible, "journal closes")

	# Daylight tint is a valid colour
	var c: Color = main.daylight(900.0)
	check(c.r > 0.0 and c.r <= 1.5, "daylight colour")

	print("RESULT failures=%d" % failures)
	if failures == 0:
		print("SMOKE_OK")
		quit(0)
	else:
		quit(1)
