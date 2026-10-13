class_name Npc
extends Node2D
## A villager that follows a daily schedule within the village.

var id: String = ""
var target: Vector2 = Vector2.ZERO
var sprite: Sprite2D = null
var _dir: Vector2i = Vector2i(0, 1)
var _t: float = 0.0
var _i: int = 0


func setup(npc_id: String) -> void:
	id = npc_id
	sprite = Sprite2D.new()
	sprite.centered = false
	sprite.offset = Vector2(-8, -22)
	sprite.texture = Art.texture("chars/%s" % id)
	sprite.region_enabled = true
	sprite.region_rect = Rect2(0, 0, 16, 24)
	add_child(sprite)
	place_for_hour(Game.hour())
	position = target


func place_for_hour(hour: float) -> void:
	var sch: Array = GameData.NPCS[id]["schedule"]
	for s in sch:
		if hour >= float(s[0]) and hour < float(s[1]):
			target = Vector2(float(s[2]) * 16.0 + 8.0, float(s[3]) * 16.0 + 16.0)
			return


func cell() -> Vector2i:
	return World.cell_of(position)


func _process(delta: float) -> void:
	var delta_pos: Vector2 = target - position
	if delta_pos.length() > 0.5:
		var step: Vector2 = delta_pos.normalized() * 30.0 * delta
		if step.length() > delta_pos.length():
			step = delta_pos
		position += step
		if absf(delta_pos.x) >= absf(delta_pos.y):
			_dir = Vector2i(int(signf(delta_pos.x)), 0)
		else:
			_dir = Vector2i(0, int(signf(delta_pos.y)))
		_t += delta
		if _t > 0.2:
			_t = 0.0
			_i = (_i + 1) % 4
	else:
		_i = 0
	var row: int = 0
	if _dir.x < 0:
		row = 1
	elif _dir.x > 0:
		row = 2
	elif _dir.y > 0:
		row = 0
	else:
		row = 3
	var col: int = [0, 1, 0, 3][_i]
	sprite.region_rect = Rect2(col * 16, row * 24, 16, 24)
