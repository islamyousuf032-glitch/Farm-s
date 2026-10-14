class_name Npc
extends Node2D
## A villager. Movement and speech are driven by NpcBrain (utility AI); this node
## owns the body: A* path following on the world grid, sprite animation, speech
## bubbles and the chat state used when two villagers talk to each other.

const SPEED: float = 30.0
const BUBBLE_FONT: Font = preload("res://fonts/HindSiliguri-Regular.ttf")

var id: String = ""
var world: World = null
var brain: NpcBrain = null
var sprite: Sprite2D = null
var bubble: PanelContainer = null
var bubble_label: Label = null

var routine_cell: Vector2i = Vector2i.ZERO
var goal_cell: Vector2i = Vector2i.ZERO
var has_goal: bool = false
var path: Array = []                 # remaining Vector2i cells to walk
var _dir: Vector2i = Vector2i(0, 1)
var _anim_t: float = 0.0
var _anim_i: int = 0

var _think_t: float = 0.0
var _idle_t: float = 0.0
var _busy_t: float = 0.0             # greeting / chat / bubble timer
var _ambient_t: float = 0.0
var chat_partner: Npc = null
var chat_leader: bool = false        # the leader drives the conversation beats
var _chat_t: float = 0.0
var _chat_beat: int = 0
var _chat_total: float = 0.0
var _bubble_hide_t: float = 0.0
var face_target: Vector2 = Vector2.ZERO
var _placed: bool = false


func setup(npc_id: String, w: World) -> void:
	id = npc_id
	world = w
	brain = NpcBrain.new(id)
	sprite = Sprite2D.new()
	sprite.centered = false
	sprite.offset = Vector2(-8, -22)
	sprite.texture = Art.texture("chars/%s" % id)
	sprite.region_enabled = true
	sprite.region_rect = Rect2(0, 0, 16, 24)
	add_child(sprite)
	_make_bubble()
	place_for_hour(Game.hour())
	position = center_of(routine_cell)
	_placed = true
	_think_t = randf_range(0.1, 1.0)
	_ambient_t = randf_range(8.0, 20.0)


static func center_of(c: Vector2i) -> Vector2:
	return Vector2(c.x * 16.0 + 8.0, c.y * 16.0 + 16.0)


func _make_bubble() -> void:
	bubble = PanelContainer.new()
	var sb: StyleBoxFlat = StyleBoxFlat.new()
	sb.bg_color = Color(0.99, 0.96, 0.88, 0.96)
	sb.border_color = Color(0.45, 0.3, 0.14)
	sb.set_border_width_all(2)
	sb.set_corner_radius_all(8)
	sb.content_margin_left = 6
	sb.content_margin_right = 6
	sb.content_margin_top = 3
	sb.content_margin_bottom = 3
	bubble.add_theme_stylebox_override("panel", sb)
	bubble.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bubble_label = Label.new()
	bubble_label.add_theme_font_override("font", BUBBLE_FONT)
	bubble_label.add_theme_font_size_override("font_size", 6)
	bubble_label.add_theme_color_override("font_color", Color(0.18, 0.1, 0.04))
	bubble_label.custom_minimum_size = Vector2(52, 0)
	bubble_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	bubble_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bubble.add_child(bubble_label)
	bubble.visible = false
	add_child(bubble)


## Called when the clock moves: the routine spot for this hour becomes the baseline goal.
func place_for_hour(hour: float) -> void:
	var sch: Array = GameData.NPCS[id]["schedule"]
	for s in sch:
		if hour >= float(s[0]) and hour < float(s[1]):
			routine_cell = Vector2i(int(s[2]), int(s[3]))
			return


func cell() -> Vector2i:
	return World.cell_of(position)


func is_busy() -> bool:
	return _busy_t > 0.0 or chat_partner != null


func say(text: String, seconds: float) -> void:
	bubble_label.text = text
	bubble.visible = true
	bubble.reset_size()
	bubble.position = Vector2(-bubble.size.x * 0.5, -26.0 - bubble.size.y)
	_busy_t = maxf(_busy_t, seconds)
	_bubble_hide_t = seconds


## Two villagers talk. The leader drives the beats; both bubbles alternate.
func begin_chat(partner: Npc, leader: bool) -> void:
	chat_partner = partner
	chat_leader = leader
	_chat_beat = 0
	_chat_t = 0.0
	_chat_total = 9.0
	path.clear()
	has_goal = false
	brain.action = NpcBrain.ACT_SOCIAL


func say_own_line() -> void:
	say(_pick_ambient_line(), 2.6)


func _chat_step(delta: float) -> void:
	_face(chat_partner.position)
	if not chat_leader:
		return
	_chat_total -= delta
	_chat_t -= delta
	if _chat_t <= 0.0:
		_chat_t = 2.6
		if _chat_beat % 2 == 0:
			say_own_line()
		else:
			chat_partner.say_own_line()
		_chat_beat += 1
	if _chat_total <= 0.0:
		var p: Npc = chat_partner
		chat_partner = null
		p.end_chat()
		end_chat()


func end_chat() -> void:
	chat_partner = null
	chat_leader = false
	brain.after_chat()
	brain.action = NpcBrain.ACT_WANDER
	_idle_t = randf_range(1.0, 3.0)


func _process(delta: float) -> void:
	if world == null or not _placed:
		return
	if Game.paused:
		return
	_update_timers(delta)
	brain.tick_needs(delta)
	if chat_partner != null:
		_chat_step(delta)
		_animate(delta, false)
		return
	_think_t -= delta
	if _think_t <= 0.0 and _busy_t <= 0.0:
		_think_t = randf_range(0.6, 1.0)
		_think()
	_act(delta)


func _update_timers(delta: float) -> void:
	if _bubble_hide_t > 0.0:
		_bubble_hide_t -= delta
		if _bubble_hide_t <= 0.0:
			bubble.visible = false
	if _busy_t > 0.0:
		_busy_t -= delta
	if _idle_t > 0.0:
		_idle_t -= delta
	# Occasional ambient remark when idle, so villagers feel alive.
	_ambient_t -= delta
	if _ambient_t <= 0.0:
		_ambient_t = randf_range(25.0, 45.0)
		if not bubble.visible and not is_busy() and randf() < 0.6:
			say(_pick_ambient_line(), 3.0)


func _pick_ambient_line() -> String:
	var pool: Array = GameData.CHATTER_LINES.duplicate()
	pool.append_array(GameData.NPCS[id]["lines"])
	return str(pool[randi() % pool.size()])


func _think() -> void:
	var pcell: Vector2i = World.cell_of(world.player.position)
	var partner: Npc = world.nearest_free_npc(self, 6)
	var ctx: Dictionary = {
		"hour": Game.hour(),
		"day": Game.total_days,
		"rain": Game.rain,
		"outdoors": not world.is_shelter_cell(cell()),
		"routine": routine_cell,
		"player_dist": _manhattan(cell(), pcell),
		"social_partner_dist": (_manhattan(cell(), partner.cell()) if partner != null else -1),
		"friendship": Game.friend_points(id),
	}
	var d: Dictionary = brain.decide(ctx)
	var act: String = str(d["action"])
	if act == NpcBrain.ACT_GREET:
		if _manhattan(cell(), pcell) > 3:
			_set_goal(pcell)
		else:
			path.clear()
			has_goal = false
			_face(world.player.position)
			brain.register_greet(Game.hour(), Game.total_days)
			var friendly: bool = NpcBrain.mood_from_friendship(Game.friend_points(id)) > 0.5
			var pool: Array = GameData.GREET_FRIEND_LINES if friendly else GameData.GREET_LINES
			say(str(pool[randi() % pool.size()]), 2.5)
	elif act == NpcBrain.ACT_SOCIAL:
		if partner != null:
			_set_goal(partner.cell())
	elif act == NpcBrain.ACT_SHELTER:
		_set_goal(world.shelter_for(cell()))
	elif act == NpcBrain.ACT_WANDER:
		if (not has_goal or path.is_empty()) and _idle_t <= 0.0:
			_set_goal(world.random_walkable_near(routine_cell, 4))
	else:
		if cell() != routine_cell:
			_set_goal(routine_cell)
		else:
			has_goal = false
			path.clear()


func _set_goal(c: Vector2i) -> void:
	goal_cell = c
	path = world.find_path(cell(), c)
	has_goal = true


func _act(delta: float) -> void:
	if not path.is_empty():
		var next: Vector2 = center_of(path[0])
		var dp: Vector2 = next - position
		if dp.length() <= 0.6:
			position = next
			path.pop_front()
			if path.is_empty():
				has_goal = false
				_idle_t = randf_range(1.5, 4.0)
		else:
			var step: Vector2 = dp.normalized() * SPEED * delta
			if step.length() > dp.length():
				step = dp
			position += step
			_set_facing(dp)
		_animate(delta, true)
		return
	_animate(delta, false)


func _set_facing(dp: Vector2) -> void:
	if absf(dp.x) >= absf(dp.y):
		_dir = Vector2i(int(signf(dp.x)), 0)
	else:
		_dir = Vector2i(0, int(signf(dp.y)))


func _face(target: Vector2) -> void:
	var dp: Vector2 = target - position
	if dp.length() > 0.5:
		_set_facing(dp)


func _animate(delta: float, moving: bool) -> void:
	if moving:
		_anim_t += delta
		if _anim_t > 0.2:
			_anim_t = 0.0
			_anim_i = (_anim_i + 1) % 4
	else:
		_anim_i = 0
	var row: int = 0
	if _dir.x < 0:
		row = 1
	elif _dir.x > 0:
		row = 2
	elif _dir.y > 0:
		row = 0
	else:
		row = 3
	var col: int = [0, 1, 0, 3][_anim_i]
	sprite.region_rect = Rect2(col * 16, row * 24, 16, 24)


static func _manhattan(a: Vector2i, b: Vector2i) -> int:
	return absi(a.x - b.x) + absi(a.y - b.y)
