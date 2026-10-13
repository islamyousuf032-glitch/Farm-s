class_name Hud
extends CanvasLayer
## All 2D UI: title, HUD, dialogue, shop, choices, journal and on-screen touch controls.
## Layout is designed for a 1280x720 landscape canvas (scaled to any phone screen).

const W: float = 1280.0
const H: float = 720.0
const GOLD: Color = Color(0.93, 0.74, 0.36)
const INK: Color = Color(0.99, 0.95, 0.86)

var main: Node = null
var root: Control = null
var info_label: Label = null
var energy_bar: ProgressBar = null
var hand_label: Label = null
var notice_label: Label = null
var notice_t: float = 0.0
var title_panel: Panel = null
var gender_panel: Panel = null
var dialog_panel: Panel = null
var dlg_name: Label = null
var dlg_text: Label = null
var dlg_portrait: TextureRect = null
var dlg_hint: Label = null
var shop_panel: Panel = null
var shop_title: Label = null
var shop_list: VBoxContainer = null
var choice_panel: Panel = null
var choice_text: Label = null
var choice_yes: Button = null
var choice_no: Button = null
var journal_panel: Panel = null
var journal_text: Label = null
var continue_btn: Button = null
var touch_root: Control = null
var skin_btn: Button = null
var skin_idx: int = 0
var _dlg_lines: Array = []
var _dlg_i: int = 0
var _dlg_close: Callable = Callable()
var _choice_yes_cb: Callable = Callable()
var _choice_no_cb: Callable = Callable()
var _shop_kind: String = ""


func setup(m: Node, th: Theme) -> void:
	main = m
	root = Control.new()
	root.position = Vector2.ZERO
	root.size = Vector2(W, H)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.theme = th
	add_child(root)
	_build_game_hud()
	_build_touch()
	_build_dialog()
	_build_shop()
	_build_choice()
	_build_journal()
	_build_title()
	show_game_hud(false)


# ---------------------------------------------------------------- helpers

func _style(bg: Color, border: bool = true) -> StyleBoxFlat:
	var sb: StyleBoxFlat = StyleBoxFlat.new()
	sb.bg_color = bg
	sb.set_corner_radius_all(14)
	if border:
		sb.border_color = GOLD
		sb.set_border_width_all(3)
	sb.content_margin_left = 16
	sb.content_margin_right = 16
	sb.content_margin_top = 10
	sb.content_margin_bottom = 10
	return sb


func _panel(r: Rect2, bg: Color = Color(0.13, 0.09, 0.06, 0.94)) -> Panel:
	var p: Panel = Panel.new()
	p.position = r.position
	p.size = r.size
	p.add_theme_stylebox_override("panel", _style(bg))
	p.mouse_filter = Control.MOUSE_FILTER_STOP
	root.add_child(p)
	return p


func _label(text: String, r: Rect2, fsize: int = 22, bold: bool = false, parent: Node = null) -> Label:
	var l: Label = Label.new()
	l.text = text
	l.position = r.position
	l.size = r.size
	l.add_theme_font_size_override("font_size", fsize)
	l.add_theme_color_override("font_color", INK)
	l.add_theme_color_override("font_outline_color", Color(0.12, 0.07, 0.03))
	l.add_theme_constant_override("outline_size", 4)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	if bold:
		l.add_theme_font_override("font", load("res://fonts/HindSiliguri-Bold.ttf"))
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	if parent == null:
		root.add_child(l)
	else:
		parent.add_child(l)
	return l


func _btn(text: String, r: Rect2, cb: Callable, parent: Node = null, fsize: int = 22) -> Button:
	var b: Button = Button.new()
	b.text = text
	b.position = r.position
	b.size = r.size
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_size_override("font_size", fsize)
	b.add_theme_stylebox_override("normal", _style(Color(0.32, 0.2, 0.1, 0.95)))
	b.add_theme_stylebox_override("hover", _style(Color(0.42, 0.28, 0.14, 0.98)))
	b.add_theme_stylebox_override("pressed", _style(Color(0.22, 0.14, 0.07, 1.0)))
	b.add_theme_stylebox_override("disabled", _style(Color(0.25, 0.25, 0.25, 0.7)))
	b.add_theme_color_override("font_color", INK)
	b.add_theme_color_override("font_disabled_color", Color(0.6, 0.6, 0.6))
	if cb.is_valid():
		b.pressed.connect(cb)
	if parent == null:
		root.add_child(b)
	else:
		parent.add_child(b)
	return b


func blocking() -> bool:
	return title_panel.visible or gender_panel.visible or dialog_panel.visible or shop_panel.visible or choice_panel.visible or journal_panel.visible


# ---------------------------------------------------------------- game HUD

func _build_game_hud() -> void:
	var bg: Panel = _panel(Rect2(12, 10, 300, 92), Color(0.10, 0.07, 0.05, 0.75))
	info_label = _label("", Rect2(24, 14, 290, 60), 20, false, bg)
	energy_bar = ProgressBar.new()
	energy_bar.position = Vector2(24, 70)
	energy_bar.size = Vector2(276, 16)
	energy_bar.show_percentage = false
	energy_bar.max_value = float(GameData.MAX_ENERGY)
	energy_bar.add_theme_stylebox_override("fill", _style(Color(0.45, 0.8, 0.35), false))
	energy_bar.add_theme_stylebox_override("background", _style(Color(0.2, 0.15, 0.1), false))
	bg.add_child(energy_bar)
	hand_label = _label("", Rect2(340, 672, 600, 36), 22, true)
	hand_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	notice_label = _label("", Rect2(240, 110, 800, 80), 24, true)
	notice_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	notice_label.visible = false


func show_game_hud(v: bool) -> void:
	info_label.get_parent().visible = v
	hand_label.visible = v
	touch_root.visible = v


func show_notice(text: String) -> void:
	notice_label.text = text
	notice_label.visible = true
	notice_t = 3.2


func update_status() -> void:
	if not Game.active:
		return
	info_label.text = "%s · দিন %d · %s\n%s · %d টাকা" % [Game.season_name(), Game.day, Game.clock_text(), Game.map_name(), Game.money]
	energy_bar.value = float(Game.energy)
	var held: String = Game.held_item()
	var extra: String = ""
	if held != "" and not GameData.is_tool(held):
		extra = "  x%d" % Game.count_item(held)
	hand_label.text = "হাতে: %s%s   (হাত বদল: Q)" % [GameData.item_name(held), extra] if held != "" else ""


func _process(_delta: float) -> void:
	if notice_t > 0.0:
		notice_t -= _delta
		if notice_t <= 0.0:
			notice_label.visible = false


# ---------------------------------------------------------------- touch controls

func _build_touch() -> void:
	touch_root = Control.new()
	touch_root.position = Vector2.ZERO
	touch_root.size = Vector2(W, H)
	touch_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(touch_root)
	var dirs: Array = [[Vector2(0, -1), Rect2(118, 500, 76, 76)], [Vector2(0, 1), Rect2(118, 644, 76, 64)], [Vector2(-1, 0), Rect2(30, 572, 76, 64)], [Vector2(1, 0), Rect2(206, 572, 76, 64)]]
	for d in dirs:
		var b: Button = _btn("", d[1], Callable(), touch_root)
		b.button_down.connect(_hold.bind(d[0], true))
		b.button_up.connect(_hold.bind(d[0], false))
		b.modulate = Color(1, 1, 1, 0.75)
	var act: Button = _btn("কাজ", Rect2(1112, 540, 140, 140), Callable(), touch_root, 30)
	act.pressed.connect(_press.bind("action"))
	act.modulate = Color(1, 1, 1, 0.85)
	var cyc: Button = _btn("হাত\nবদল", Rect2(996, 616, 100, 84), Callable(), touch_root, 18)
	cyc.pressed.connect(_press.bind("cycle"))
	cyc.modulate = Color(1, 1, 1, 0.85)
	var can: Button = _btn("বাতিল", Rect2(996, 532, 100, 72), Callable(), touch_root, 18)
	can.pressed.connect(_press.bind("cancel"))
	can.modulate = Color(1, 1, 1, 0.85)
	var jr: Button = _btn("খাতা", Rect2(1176, 12, 92, 48), Callable(), touch_root, 20)
	jr.pressed.connect(_press.bind("journal"))


func _hold(v: Vector2, down: bool) -> void:
	Game.touch_dir += (v if down else -v)


func _press(action_name: String) -> void:
	if main != null:
		main.do_action(action_name)


# ---------------------------------------------------------------- dialogue

func _build_dialog() -> void:
	dialog_panel = _panel(Rect2(120, 480, 1040, 220))
	dlg_portrait = TextureRect.new()
	dlg_portrait.position = Vector2(136, 492)
	dlg_portrait.size = Vector2(144, 180)
	dlg_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	dlg_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	dlg_portrait.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	dialog_panel.add_child(dlg_portrait)
	dlg_name = _label("", Rect2(300, 492, 840, 40), 28, true, dialog_panel)
	dlg_text = _label("", Rect2(300, 536, 840, 120), 24, false, dialog_panel)
	dlg_hint = _label("কাজ (Z / Space) চাপো", Rect2(980, 660, 160, 30), 16, false, dialog_panel)
	dlg_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	dialog_panel.visible = false


func open_dialog(who: String, portrait_id: String, lines: Array, on_close: Callable) -> void:
	_dlg_lines = lines
	_dlg_i = 0
	_dlg_close = on_close
	dlg_name.text = who
	dlg_portrait.texture = Art.texture("portraits/" + portrait_id) if portrait_id != "" else null
	dlg_portrait.visible = portrait_id != ""
	_show_dlg_line()
	dialog_panel.visible = true


func _show_dlg_line() -> void:
	dlg_text.text = str(_dlg_lines[_dlg_i]) if _dlg_i < _dlg_lines.size() else ""


func _dialog_action() -> void:
	_dlg_i += 1
	if _dlg_i < _dlg_lines.size():
		_show_dlg_line()
		return
	dialog_panel.visible = false
	if _dlg_close.is_valid():
		_dlg_close.call()


func open_talk(npc_id: String) -> void:
	var data: Dictionary = GameData.NPCS[npc_id]
	var lines: Array = []
	if Game.talk_to(npc_id):
		var ls: Array = data["lines"]
		lines.append(str(ls[Game.total_days % ls.size()]))
		for m in Game.check_quests():
			lines.append("• " + str(m))
	else:
		lines.append("আজ তো কথা হয়েছে। কাল আবার এসো।")
	open_dialog(str(data["name"]), npc_id, lines, Callable())


func open_gift(npc_id: String, kind: int) -> void:
	var data: Dictionary = GameData.NPCS[npc_id]
	var line: String = str(data["gift_neutral"])
	if kind == 1:
		line = str(data["gift_like"])
	elif kind == -1:
		line = str(data["gift_hate"])
	open_dialog(str(data["name"]), npc_id, [line], Callable())


# ---------------------------------------------------------------- choice

func _build_choice() -> void:
	choice_panel = _panel(Rect2(370, 250, 540, 220))
	choice_text = _label("", Rect2(394, 270, 492, 90), 26, true, choice_panel)
	choice_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	choice_yes = _btn("হ্যাঁ", Rect2(410, 378, 200, 60), Callable(), choice_panel, 24)
	choice_yes.pressed.connect(_on_choice_yes)
	choice_no = _btn("না", Rect2(650, 378, 200, 60), Callable(), choice_panel, 24)
	choice_no.pressed.connect(_on_choice_no)
	choice_panel.visible = false


func open_choice(question: String, yes_cb: Callable, no_cb: Callable) -> void:
	choice_text.text = question
	_choice_yes_cb = yes_cb
	_choice_no_cb = no_cb
	choice_panel.visible = true


func _on_choice_yes() -> void:
	choice_panel.visible = false
	if _choice_yes_cb.is_valid():
		_choice_yes_cb.call()


func _on_choice_no() -> void:
	choice_panel.visible = false
	if _choice_no_cb.is_valid():
		_choice_no_cb.call()


# ---------------------------------------------------------------- shop / bin

func _build_shop() -> void:
	shop_panel = _panel(Rect2(300, 60, 680, 600))
	shop_title = _label("", Rect2(324, 74, 630, 44), 30, true, shop_panel)
	var sc: ScrollContainer = ScrollContainer.new()
	sc.position = Vector2(324, 128)
	sc.size = Vector2(630, 460)
	shop_panel.add_child(sc)
	shop_list = VBoxContainer.new()
	shop_list.custom_minimum_size = Vector2(610, 0)
	shop_list.add_theme_constant_override("separation", 8)
	sc.add_child(shop_list)
	_btn("বন্ধ করো", Rect2(500, 606, 280, 42), Callable(self, "_close_shop"), shop_panel, 22)
	shop_panel.visible = false


func open_shop(kind: String) -> void:
	_shop_kind = kind
	shop_panel.visible = true
	_refresh_shop()


func _close_shop() -> void:
	shop_panel.visible = false


func _refresh_shop() -> void:
	for c in shop_list.get_children():
		shop_list.remove_child(c)
		c.queue_free()
	shop_title.text = "আমেনা খালার দোকান" if _shop_kind == "shop" else "বিক্রয়-বাক্স"
	var money_l: Label = _label("আছে: %d টাকা" % Game.money, Rect2(0, 0, 600, 30), 20, false)
	money_l.reparent(shop_list)
	money_l.custom_minimum_size = Vector2(600, 30)
	if _shop_kind == "shop":
		var head: Label = _label("— বীজ কিনুন (মৌসুম: %s) —" % Game.season_name(), Rect2(0, 0, 600, 30), 20, true)
		head.reparent(shop_list)
		for k in GameData.crops_for_season(Game.season):
			var c: Dictionary = GameData.CROPS[k]
			var b: Button = _btn("%s বীজ — %d টাকা" % [c["name"], int(c["seed"])], Rect2(0, 0, 600, 46), Callable(), shop_list, 22)
			b.pressed.connect(_buy.bind("seed_" + k))
	var sell_head: Label = _label("— বিক্রি করুন —", Rect2(0, 0, 600, 30), 20, true)
	sell_head.reparent(shop_list)
	var any: bool = false
	for id in Game.inventory.keys():
		if GameData.is_sellable(id) and Game.count_item(id) > 0:
			any = true
			var b2: Button = _btn("%s (আছে %d) — %d টাকা" % [GameData.item_name(id), Game.count_item(id), GameData.item_price(id)], Rect2(0, 0, 600, 46), Callable(), shop_list, 22)
			b2.pressed.connect(_sell.bind(id))
	if not any:
		var none: Label = _label("বিক্রির মতো কিছু নেই। ফসল বা মাছ নিয়ে এসো।", Rect2(0, 0, 600, 30), 20, false)
		none.reparent(shop_list)


func _buy(id: String) -> void:
	var price: int = GameData.item_price(id)
	if Game.money < price:
		show_notice("টাকা কম পড়েছে।")
		return
	Game.add_money(-price)
	Game.add_item(id, 1)
	_refresh_shop()


func _sell(id: String) -> void:
	if not Game.remove_item(id, 1):
		return
	Game.add_money(GameData.item_price(id))
	show_notice("%s বিক্রি হলো।" % GameData.item_name(id))
	_refresh_shop()


# ---------------------------------------------------------------- journal

func _build_journal() -> void:
	journal_panel = _panel(Rect2(250, 40, 780, 640))
	journal_text = _label("", Rect2(274, 56, 732, 500), 21, false, journal_panel)
	_btn("সেভ করো", Rect2(274, 596, 220, 56), Callable(self, "_save_now"), journal_panel, 22)
	_btn("বন্ধ করো", Rect2(786, 596, 220, 56), Callable(self, "_close_journal"), journal_panel, 22)
	journal_panel.visible = false


func open_journal() -> void:
	var lines: Array = []
	lines.append("%s · দিন %d · %s" % [Game.season_name(), Game.day, Game.map_name()])
	lines.append("টাকা: %d    শক্তি: %d/%d    আজ বৃষ্টি: %s" % [Game.money, Game.energy, GameData.MAX_ENERGY, "হ্যাঁ" if Game.rain else "না"])
	lines.append("")
	lines.append("বন্ধুত্ব:")
	var names: Array = []
	for k in GameData.NPCS.keys():
		names.append(k)
	for k in names:
		lines.append("  %s — %d/10 (%d পয়েন্ট)" % [GameData.NPCS[k]["name"], Game.hearts(k), Game.friend_points(k)])
	lines.append("")
	lines.append("কাজ:")
	for q in GameData.QUESTS:
		var done: bool = Game.quests_done.has(q["id"])
		lines.append("  [%s] %s — %s" % ["শেষ" if done else "বাকি", q["title"], q["text"]])
	lines.append("")
	lines.append("ব্যাগ:")
	var any: bool = false
	for id in Game.inventory.keys():
		if Game.count_item(id) > 0 and not GameData.is_tool(id):
			lines.append("  %s x%d" % [GameData.item_name(id), Game.count_item(id)])
			any = true
	if not any:
		lines.append("  (খালি)")
	journal_text.text = "\n".join(lines)
	journal_panel.visible = true


func _close_journal() -> void:
	journal_panel.visible = false


func _save_now() -> void:
	if Game.save_game():
		show_notice("খেলা সেভ হয়েছে।")


# ---------------------------------------------------------------- title & gender

func _build_title() -> void:
	title_panel = _panel(Rect2(0, 0, W, H), Color(0.16, 0.26, 0.12, 1.0))
	title_panel.add_theme_stylebox_override("panel", _style(Color(0.16, 0.26, 0.12, 1.0), false))
	var t: Label = _label("চালাবন ফার্ম", Rect2(0, 110, W, 90), 72, true, title_panel)
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var st: Label = _label("গাজীপুরের গ্রামের খামার জীবন", Rect2(0, 210, W, 40), 26, false, title_panel)
	st.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_btn("নতুন খেলা", Rect2(490, 320, 300, 64), Callable(self, "_show_gender"), title_panel, 26)
	continue_btn = _btn("চালিয়ে যাও", Rect2(490, 400, 300, 64), Callable(self, "_continue"), title_panel, 26)
	var ver: Label = _label("সংস্করণ 2.0 · Godot 4 + C++", Rect2(0, 670, W, 30), 18, false, title_panel)
	ver.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	gender_panel = _panel(Rect2(0, 0, W, H), Color(0.16, 0.26, 0.12, 1.0))
	gender_panel.add_theme_stylebox_override("panel", _style(Color(0.16, 0.26, 0.12, 1.0), false))
	var gq: Label = _label("তুমি কে?", Rect2(0, 120, W, 60), 48, true, gender_panel)
	gq.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_btn("ছেলে", Rect2(400, 260, 240, 70), Callable(self, "_pick_gender").bind("m"), gender_panel, 28)
	_btn("মেয়ে", Rect2(640, 260, 240, 70), Callable(self, "_pick_gender").bind("f"), gender_panel, 28)
	skin_btn = _btn("ত্বকের রং: ১", Rect2(490, 360, 300, 56), Callable(self, "_cycle_skin"), gender_panel, 24)
	_btn("পিছনে", Rect2(490, 440, 300, 56), Callable(self, "_back_title"), gender_panel, 24)
	gender_panel.visible = false


func show_title(has_save: bool) -> void:
	title_panel.visible = true
	gender_panel.visible = false
	continue_btn.disabled = not has_save
	show_game_hud(false)


func _show_gender() -> void:
	title_panel.visible = false
	gender_panel.visible = true


func _back_title() -> void:
	gender_panel.visible = false
	title_panel.visible = true


func _cycle_skin() -> void:
	skin_idx = (skin_idx + 1) % 4
	skin_btn.text = "ত্বকের রং: %d" % (skin_idx + 1)


func _pick_gender(g: String) -> void:
	gender_panel.visible = false
	title_panel.visible = false
	if main != null:
		main.start_new(g, skin_idx)


func _continue() -> void:
	title_panel.visible = false
	if main != null:
		main.continue_game()


func show_game() -> void:
	title_panel.visible = false
	gender_panel.visible = false
	show_game_hud(true)


# ---------------------------------------------------------------- input routing from main

func on_action(action_name: String) -> void:
	if dialog_panel.visible and action_name == "action":
		_dialog_action()
	elif dialog_panel.visible and action_name == "cancel":
		_dialog_action()
	elif shop_panel.visible and (action_name == "cancel"):
		_close_shop()
	elif journal_panel.visible and (action_name == "cancel" or action_name == "journal"):
		_close_journal()
	elif choice_panel.visible and action_name == "cancel":
		_on_choice_no()
