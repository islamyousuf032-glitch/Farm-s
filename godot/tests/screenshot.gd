extends SceneTree
## Renders real UI frames for visual checks (run under xvfb in CI).
## Writes PNGs into $GITHUB_WORKSPACE/ci-screens/ (or /tmp when run locally).

var out_dir: String = ""


func _initialize() -> void:
	var ws: String = OS.get_environment("GITHUB_WORKSPACE")
	out_dir = (ws if ws != "" else "/tmp") + "/ci-screens"
	DirAccess.make_dir_recursive_absolute(out_dir)
	call_deferred("_run")


func _frames(n: int) -> void:
	for i in range(n):
		await process_frame


func _shot(name: String) -> void:
	await _frames(3)
	var img: Image = root.get_texture().get_image()
	img.save_png(out_dir + "/" + name + ".png")
	print("SHOT " + name)


func _run() -> void:
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	await _frames(3)
	main.start_new("m", 0)
	await _frames(5)
	await _shot("01_intro_dialogue")
	main.hud.dialog_panel.visible = false
	main.world.load_map("village", Vector2(2 * 16 + 8, 7 * 16 + 16))
	await _frames(5)
	main.hud.open_talk("ameena")
	await _shot("02_talk_ameena")
	main.hud.dialog_panel.visible = false
	main.hud.open_shop("shop")
	await _shot("03_shop")
	main.hud._close_shop()
	# Villagers walk on their own: capture after a few seconds of AI time
	main.world.player.position = main.world.npcs[0].position + Vector2(0, 20)
	Game.paused = false
	await _frames(240)
	await _shot("04_village_walking")
	# Two villagers chat: bubbles alternate above their heads
	var a = main.world.npcs[0]
	var b = main.world.npcs[1]
	a.begin_chat(b, true)
	b.begin_chat(a, false)
	await _frames(20)
	await _shot("05_village_chat")
	quit(0)
