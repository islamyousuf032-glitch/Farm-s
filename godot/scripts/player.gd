class_name Player
extends Node2D
## The farmer. Position is the feet point (bottom centre of the sprite).

var world: World = null
var facing: Vector2i = Vector2i(0, 1)
var speed: float = 74.0
var sprite: Sprite2D = null
var moving: bool = false
var _frame_t: float = 0.0
var _anim_i: int = 0
var fish_state: int = 0   # 0 idle, 1 waiting for bite, 2 bite (press action now)
var _fish_t: float = 0.0


func setup(w: World, g: String, s: int) -> void:
	world = w
	sprite = Sprite2D.new()
	sprite.centered = false
	sprite.offset = Vector2(-8, -22)
	sprite.texture = Art.texture("chars/player_%s_%d" % [g, s])
	sprite.region_enabled = true
	sprite.region_rect = Rect2(0, 0, 16, 24)
	add_child(sprite)


func _physics_process(delta: float) -> void:
	if world == null or Game.paused or fish_state > 0:
		_update_anim(delta, false)
		return
	var dir: Vector2 = Vector2.ZERO
	if Input.is_key_pressed(KEY_LEFT) or Input.is_key_pressed(KEY_A):
		dir.x -= 1.0
	if Input.is_key_pressed(KEY_RIGHT) or Input.is_key_pressed(KEY_D):
		dir.x += 1.0
	if Input.is_key_pressed(KEY_UP) or Input.is_key_pressed(KEY_W):
		dir.y -= 1.0
	if Input.is_key_pressed(KEY_DOWN) or Input.is_key_pressed(KEY_S):
		dir.y += 1.0
	dir += Game.touch_dir
	if dir.length() > 1.0:
		dir = dir.normalized()
	moving = dir.length() > 0.1
	if moving:
		if absf(dir.x) >= absf(dir.y):
			facing = Vector2i(int(signf(dir.x)), 0)
		else:
			facing = Vector2i(0, int(signf(dir.y)))
		var step: Vector2 = dir * speed * delta
		var nx: Vector2 = position + Vector2(step.x, 0.0)
		if not world.blocked_at(nx):
			position = nx
		var ny: Vector2 = position + Vector2(0.0, step.y)
		if not world.blocked_at(ny):
			position = ny
		z_index = 0
	_update_anim(delta, moving)
	world.check_portal(self)


func _update_anim(delta: float, walking: bool) -> void:
	if sprite == null:
		return
	var row: int = 0
	if facing.x < 0:
		row = 1
	elif facing.x > 0:
		row = 2
	elif facing.y > 0:
		row = 0
	else:
		row = 3
	var col: int = 0
	if walking:
		_frame_t += delta
		if _frame_t > 0.13:
			_frame_t = 0.0
			_anim_i = (_anim_i + 1) % 4
		col = [0, 1, 0, 3][_anim_i]
	else:
		_frame_t = 0.0
		_anim_i = 0
	sprite.region_rect = Rect2(col * 16, row * 24, 16, 24)


func _process(delta: float) -> void:
	if fish_state == 1:
		_fish_t -= delta
		if _fish_t <= 0.0:
			fish_state = 2
			_fish_t = 0.9
			world.notice("মাছ! এখনই কাজ বাটন চাপো!")
	elif fish_state == 2:
		_fish_t -= delta
		if _fish_t <= 0.0:
			fish_state = 0
			world.notice("মাছটা সুতো ছিঁড়ে পালিয়ে গেল।")


func start_fishing() -> void:
	fish_state = 1
	_fish_t = Game.rng.randf_range(1.5, 4.0)
	world.notice("ছিপ ফেলা হয়েছে... অপেক্ষা করো।")


## Returns true when the action press was consumed by fishing.
func fishing_action() -> bool:
	if fish_state == 1:
		fish_state = 0
		world.notice("খুব তাড়াতাড়ি! মাছ টের পেয়ে গেছে।")
		return true
	if fish_state == 2:
		fish_state = 0
		world.catch_fish()
		return true
	return false
