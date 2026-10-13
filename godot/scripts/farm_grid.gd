class_name FarmGrid
extends RefCounted
## Farm plot simulation: tilling, planting, watering, growth and harvest.
## Pure GDScript port of the C++ core in native/src/farm_grid.cpp (same API and rules),
## so the game builds without a GDExtension binary.

var width: int = 0
var height: int = 0
var crop: PackedInt32Array = PackedInt32Array()      # 0 = none, else crop index (1-based)
var grown: PackedInt32Array = PackedInt32Array()     # days grown
var required: PackedInt32Array = PackedInt32Array()  # days to mature
var regrow: PackedInt32Array = PackedInt32Array()    # days between harvests (0 = single harvest)
var watered: PackedInt32Array = PackedInt32Array()   # 0/1, cleared at end of day
var tilled: PackedInt32Array = PackedInt32Array()    # 0/1


func setup(w: int, h: int) -> void:
	width = maxi(w, 0)
	height = maxi(h, 0)
	var n: int = width * height
	crop = PackedInt32Array(); crop.resize(n); crop.fill(0)
	grown = PackedInt32Array(); grown.resize(n); grown.fill(0)
	required = PackedInt32Array(); required.resize(n); required.fill(0)
	regrow = PackedInt32Array(); regrow.resize(n); regrow.fill(0)
	watered = PackedInt32Array(); watered.resize(n); watered.fill(0)
	tilled = PackedInt32Array(); tilled.resize(n); tilled.fill(0)


func get_width() -> int:
	return width


func get_height() -> int:
	return height


func valid(x: int, y: int) -> bool:
	return x >= 0 and y >= 0 and x < width and y < height


func idx(x: int, y: int) -> int:
	return y * width + x


func till(x: int, y: int) -> bool:
	if not valid(x, y):
		return false
	var i: int = idx(x, y)
	if tilled[i] != 0 or crop[i] != 0:
		return false
	tilled[i] = 1
	return true


func plant(x: int, y: int, crop_index: int, days_to_mature: int, regrow_days: int) -> bool:
	if not valid(x, y) or crop_index <= 0 or days_to_mature <= 0:
		return false
	var i: int = idx(x, y)
	if tilled[i] == 0 or crop[i] != 0:
		return false
	crop[i] = crop_index
	grown[i] = 0
	required[i] = days_to_mature
	regrow[i] = maxi(regrow_days, 0)
	return true


func water(x: int, y: int) -> bool:
	if not valid(x, y):
		return false
	var i: int = idx(x, y)
	if tilled[i] == 0 or watered[i] != 0:
		return false
	watered[i] = 1
	return true


## Returns the crop index harvested, or 0 if nothing is ready.
func harvest(x: int, y: int) -> int:
	if not valid(x, y):
		return 0
	var i: int = idx(x, y)
	if crop[i] == 0 or grown[i] < required[i]:
		return 0
	var got: int = crop[i]
	if regrow[i] > 0:
		# Plant keeps producing: next harvest after regrow days.
		grown[i] = required[i] - regrow[i]
	else:
		crop[i] = 0; grown[i] = 0; required[i] = 0; regrow[i] = 0
		tilled[i] = 0
	return got


func get_crop(x: int, y: int) -> int:
	return crop[idx(x, y)] if valid(x, y) else 0


## 0 none, 1 sprout, 2-3 growing, 4 ready.
func get_stage(x: int, y: int) -> int:
	if not valid(x, y):
		return 0
	var i: int = idx(x, y)
	if crop[i] == 0:
		return 0
	if grown[i] >= required[i]:
		return 4
	var stage: int = 1 + (grown[i] * 3) / required[i]
	return mini(stage, 3)


func is_tilled(x: int, y: int) -> bool:
	return valid(x, y) and tilled[idx(x, y)] != 0


func is_watered(x: int, y: int) -> bool:
	return valid(x, y) and watered[idx(x, y)] != 0


## Watered crops grow one day; water evaporates.
func end_of_day() -> void:
	var n: int = width * height
	for i in range(n):
		if crop[i] != 0 and watered[i] != 0 and grown[i] < required[i]:
			grown[i] += 1
		watered[i] = 0


func export_state() -> Dictionary:
	return {
		"w": width, "h": height,
		"crop": crop, "grown": grown, "required": required,
		"regrow": regrow, "watered": watered, "tilled": tilled,
	}


func import_state(state: Dictionary) -> void:
	setup(int(state.get("w", 0)), int(state.get("h", 0)))
	var n: int = width * height
	for key in ["crop", "grown", "required", "regrow", "watered", "tilled"]:
		var src: PackedInt32Array = state.get(key, PackedInt32Array())
		if src.size() == n:
			set(key, src)
