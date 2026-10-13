extends Node2D
## Entry point. Owns the World, HUD and day/night tint. Routes all player actions.

const HOME_SPAWN: Vector2 = Vector2(4 * 16 + 8, 5 * 16 + 16)
const TINT_HOURS: Array = [6.0, 9.0, 16.0, 18.0, 19.5, 22.0, 26.0]
const TINT_COLORS: Array = [
	Color(1.0, 0.9, 0.78), Color(1.0, 1.0, 1.0), Color(1.0, 0.98, 0.93),
	Color(1.0, 0.7, 0.5), Color(0.55, 0.55, 0.8), Color(0.36, 0.4, 0.62), Color(0.3, 0.33, 0.55),
]

var world: World = null
var hud: Hud = null
var tint: CanvasModulate = null
var theme_ref: Theme = null


func _ready() -> void:
	theme_ref = Theme.new()
	theme_ref.default_font = load("res://fonts/HindSiliguri-Regular.ttf")
	theme_ref.default_font_size = 22
	tint = CanvasModulate.new()
	add_child(tint)
	hud = Hud.new()
	add_child(hud)
	hud.setup(self, theme_ref)
	hud.show_title(Game.has_save())
	Game.paused = true
	Game.forced_sleep.connect(_on_forced_sleep)
	Game.time_changed.connect(_on_time_changed)
	Game.notice.connect(hud.show_notice)


func start_new(g: String, s: int) -> void:
	Game.new_game(g, s)
	_enter_world()
	hud.open_dialog("", "", [
		"স্বাগতম! তোমার নতুন খামার অপেক্ষা করছে।",
		"মাটি কোপাতে কোদাল, বীজ বুনতে বীজ, পানি দিতে ঝারি হাতে নাও। কাজ বাটন বা Z / Space চাপো।",
		"গ্রামে মানুষের সাথে কথা বলো, উপহার দাও, বন্ধু হও। দিন শেষে ঘরের বিছানায় ঘুমাও।",
	], Callable())


func continue_game() -> void:
	if Game.load_game():
		_enter_world()


func _enter_world() -> void:
	if world != null:
		remove_child(world)
		world.queue_free()
	world = World.new()
	world.main = self
	world.hud = hud
	add_child(world)
	world.load_map(Game.map_id, Vector2(float(Game.player_pos[0]), float(Game.player_pos[1])))
	hud.show_game()
	Game.paused = false
	_on_time_changed()


func do_action(action_name: String) -> void:
	if world == null or not Game.active:
		return
	if hud.blocking():
		hud.on_action(action_name)
		return
	match action_name:
		"action":
			world.act()
		"cycle":
			Game.cycle_hand()
			hud.show_notice("হাতে এখন: " + GameData.item_name(Game.held_item()))
		"journal":
			hud.open_journal()
		_:
			pass


func sleep_now() -> void:
	if world == null:
		return
	var msg: String = Game.end_of_day()
	Game.save_game()
	Game.player_pos = [HOME_SPAWN.x, HOME_SPAWN.y]
	world.load_map("home", HOME_SPAWN)
	hud.open_dialog("", "", [msg], Callable())
	_on_time_changed()


func _on_forced_sleep() -> void:
	hud.show_notice("রাত দুইটা! তুমি ক্লান্ত হয়ে ঘুমিয়ে পড়েছ।")
	sleep_now()


func _on_time_changed() -> void:
	tint.color = daylight(Game.minute)


static func daylight(minute: float) -> Color:
	var h: float = 6.0 + minute / 60.0
	var c: Color = TINT_COLORS[TINT_COLORS.size() - 1]
	for i in range(TINT_HOURS.size() - 1):
		var a: float = TINT_HOURS[i]
		var b: float = TINT_HOURS[i + 1]
		if h >= a and h <= b:
			c = (TINT_COLORS[i] as Color).lerp(TINT_COLORS[i + 1], (h - a) / (b - a))
			break
	if Game.rain:
		c = c * Color(0.82, 0.86, 0.92)
	return c


func _process(_delta: float) -> void:
	if world == null or not Game.active:
		return
	Game.paused = hud.blocking()
	hud.update_status()
	if world.rain_fx != null:
		world.rain_fx.emitting = Game.rain
	if world.leaf_fx != null:
		world.leaf_fx.emitting = Game.season == 2 or Game.season == 3


func _unhandled_input(event: InputEvent) -> void:
	if not (event is InputEventKey):
		return
	var ke: InputEventKey = event
	if not ke.pressed or ke.echo:
		return
	var k: int = ke.keycode
	if k == KEY_Z or k == KEY_SPACE or k == KEY_ENTER or k == KEY_KP_ENTER:
		do_action("action")
	elif k == KEY_X or k == KEY_ESCAPE:
		do_action("cancel")
	elif k == KEY_Q or k == KEY_TAB:
		do_action("cycle")
	elif k == KEY_J or k == KEY_E:
		do_action("journal")
