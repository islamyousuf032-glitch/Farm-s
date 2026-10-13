class_name GameData
extends RefCounted
## Static game content: seasons, crops, fish, tools, villagers, quests.
## Original content for চালাবন ফার্ম (Gazipur farm life sim). No third-party text or art.

const SEASON_NAMES: Array = ["গ্রীষ্ম", "বর্ষা", "শরৎ", "হেমন্ত", "শীত", "বসন্ত"]
const SEASON_RAIN: Array = [0.15, 0.6, 0.15, 0.05, 0.03, 0.2]
const DAYS_PER_SEASON: int = 12
const START_SEASON: int = 2
const START_COINS: int = 500
const MAX_ENERGY: int = 270
const DAY_END_MIN: float = 1200.0   # 26:00 = 02:00 next morning, forced sleep
const SECONDS_PER_GAME_MIN: float = 0.7
const FRIEND_MAX: int = 2500
const HEART_STEP: int = 250
const TALK_POINTS: int = 20
const GIFT_LIKE: int = 80
const GIFT_NEUTRAL: int = 20
const GIFT_HATE: int = -40

const CROP_ORDER: Array = ["lau", "begun", "chili", "dhan", "alu", "sarisha", "palong", "dhendosh"]
const CROPS: Dictionary = {
	"lau": {"name": "লাউ", "seasons": [0, 1], "grow": 6, "regrow": 3, "seed": 40, "price": 70, "desc": "মাচায় উঠে লতা, বারবার ফলন দেয়।"},
	"begun": {"name": "বেগুন", "seasons": [0, 2], "grow": 5, "regrow": 3, "seed": 20, "price": 40, "desc": "গ্রীষ্ম ও শরতের প্রিয় সবজি।"},
	"chili": {"name": "কাঁচা মরিচ", "seasons": [2, 3], "grow": 6, "regrow": 4, "seed": 30, "price": 55, "desc": "ঝাল ছাড়া ভাত অচল।"},
	"dhan": {"name": "ধান", "seasons": [1], "grow": 8, "regrow": 0, "seed": 25, "price": 60, "desc": "বর্ষার জলে বাইদের ধান।"},
	"alu": {"name": "আলু", "seasons": [3, 4], "grow": 7, "regrow": 0, "seed": 35, "price": 80, "desc": "হেমন্ত-শীতের মাটির নিচের সোনা।"},
	"sarisha": {"name": "সরিষা", "seasons": [4, 5], "grow": 5, "regrow": 0, "seed": 20, "price": 45, "desc": "শীতে হলুদ ফুলে ভরে যায় মাঠ।"},
	"palong": {"name": "পালং শাক", "seasons": [4, 5], "grow": 3, "regrow": 2, "seed": 15, "price": 25, "desc": "দ্রুত বাড়ে, রোজকার শাক।"},
	"dhendosh": {"name": "ঢেঁড়স", "seasons": [0, 1], "grow": 4, "regrow": 2, "seed": 15, "price": 30, "desc": "গ্রীষ্ম-বর্ষার সস্তা ফসল।"},
}

const FISH_ORDER: Array = ["puti", "tengra", "rui", "shing", "magur"]
const FISH: Dictionary = {
	"puti": {"name": "পুঁটি", "price": 10, "seasons": [0, 1, 2, 3, 4, 5], "weight": 10},
	"tengra": {"name": "টেংরা", "price": 30, "seasons": [1, 2, 5], "weight": 6},
	"rui": {"name": "রুই", "price": 45, "seasons": [1, 2, 3], "weight": 4},
	"shing": {"name": "শিং", "price": 85, "seasons": [1, 5], "weight": 2},
	"magur": {"name": "মাগুর", "price": 90, "seasons": [1, 3, 4], "weight": 2},
}

const TOOLS: Dictionary = {
	"hoe": {"name": "কোদাল", "energy": 5, "desc": "শুকনো লালমাটি কুপিয়ে চাষ উপযোগী করো।"},
	"can": {"name": "জলের ঝারি", "energy": 3, "desc": "ফসলে পানি দাও।"},
	"rod": {"name": "ছিপ", "energy": 4, "desc": "পুকুরের পাড়ে দাঁড়িয়ে ছিপ ফেলো।"},
}
const TOOL_ORDER: Array = ["hoe", "can", "rod"]

const NPCS: Dictionary = {
	"ameena": {
		"name": "আমেনা খালা", "role": "মুদি দোকানি", "likes": ["crop_chili", "crop_lau"], "hates": ["fish_puti"],
		"schedule": [[6, 26, 15, 6]],
		"lines": ["আসো বাবা, কী লাগবে? আজকের বীজ সব এখানে পাবে।", "মাটি ভালো হলে ফসল ভালো হয়। লালমাটিতে ধৈর্য লাগে।", "বৃষ্টির দিনে বাইরে কাজ করো না, শরীর খারাপ হবে।", "আমার স্বামী এই দোকান দিয়েছিল। এখন আমি চালাই।"],
		"gift_like": "আহা! এটা তো আমার খুব পছন্দ। ধন্যবাদ বাবা।", "gift_neutral": "আচ্ছা, রেখে দিলাম।", "gift_hate": "এটা আমি খাই না বাবা, নিয়ে যাও।",
	},
	"mojid": {
		"name": "মজিদ চাচা", "role": "অবসরপ্রাপ্ত জেলে", "likes": ["fish_rui", "fish_shing"], "hates": ["crop_begun"],
		"schedule": [[6, 9, 7, 11], [9, 17, 11, 11], [17, 26, 12, 10]],
		"lines": ["পুকুরের মাছ দেখে বুঝি বর্ষা কেমন যাবে।", "ছিপ ফেলতে ধৈর্য লাগে, তাড়াহুড়ো করলে মাছ পালায়।", "আমার বাপ-দাদা এই পুকুরের পাড়ে বসেই জীবন কাটিয়েছে।", "শালবনের পাতা ঝরলে বুঝি শীত আসছে।"],
		"gift_like": "বাহ্, এমন মাছ! বহুদিন পর এমন মাছ পেলাম।", "gift_neutral": "ভালো জিনিস, রাখলাম।", "gift_hate": "এটা নিয়ে যাও, আমার পছন্দ না।",
	},
	"rafiq": {
		"name": "রফিক", "role": "রিকশাচালক ও কৃষক", "likes": ["fish_magur", "crop_sarisha"], "hates": ["crop_palong"],
		"schedule": [[6, 12, 2, 8], [12, 18, 13, 7], [18, 26, 2, 8]],
		"lines": ["আজ ঢাকা-গাজীপুর রোড এ জ্যাম ছিল ভাই। গ্রামেই ভালো।", "বাইদের ধান উঠলে সবার মুখে হাসি ফোটে।", "তুমি নতুন এসেছ, না? চালাবনে মন বসবে, দেখো।", "রিকশা টানি, আর বিকেলে মাঠে যাই। দুটো কাজই ভালো লাগে।"],
		"gift_like": "ওরে বাপ! মাগুর! তুমি তো আমার মনের কথা বুঝো।", "gift_neutral": "থ্যাংকস ভাই!", "gift_hate": "এইটা আমার পছন্দ না ভাই, তবু নিলাম।",
	},
	"shiuli": {
		"name": "শিউলি আপা", "role": "প্রাথমিক বিদ্যালয়ের শিক্ষক", "likes": ["crop_alu", "crop_chili"], "hates": ["fish_tengra"],
		"schedule": [[8, 14, 23, 9], [14, 18, 17, 13], [18, 26, 7, 9]],
		"lines": ["আমার ক্লাসের ছাত্ররা প্রশ্ন করে — ফসল কেন বাড়ে? আমি বলি, যত্ন নিলে।", "শালবনে শালপাতা ঝরে, সেটাই আমাদের গ্রামের সৌন্দর্য।", "পড়াশোনার সাথে মাটির সম্পর্ক ভুলে যেও না।", "গ্রামের সবাইকে চেনো তো? আস্তে আস্তে চিনে যাবে।"],
		"gift_like": "কী সুন্দর! তুমি সত্যিই যত্ন নিয়ে চাষ করো বোঝা যায়।", "gift_neutral": "ধন্যবাদ, এটা খুব কাজে লাগবে।", "gift_hate": "আমার এটা ভালো লাগে না, ক্ষমা করো।",
	},
}

# stat: key into Game.stats. Completed quests pay `reward` once.
const QUESTS: Array = [
	{"id": "q_seed", "title": "প্রথম বীজ", "text": "একটি বীজ মাটিতে বোনো", "reward": 100, "stat": "planted", "target": 1},
	{"id": "q_harvest", "title": "প্রথম ফসল", "text": "মোট ৩টি ফসল তোলো", "reward": 200, "stat": "harvested", "target": 3},
	{"id": "q_fish", "title": "জেলের হাতেখড়ি", "text": "মোট ৩টি মাছ ধরো", "reward": 150, "stat": "fish", "target": 3},
	{"id": "q_village", "title": "চালাবনের বন্ধু", "text": "গ্রামের সব মানুষের সাথে কথা বলো", "reward": 250, "stat": "talked_count", "target": 4},
	{"id": "q_money", "title": "হাটের খ্যাতি", "text": "মোট ১৫০০ টাকা আয় করো", "reward": 400, "stat": "earned", "target": 1500},
]


static func crop_index(key: String) -> int:
	return CROP_ORDER.find(key) + 1


static func is_tool(id: String) -> bool:
	return TOOLS.has(id)


static func item_name(id: String) -> String:
	if TOOLS.has(id):
		return TOOLS[id]["name"]
	var parts: PackedStringArray = id.split("_", true, 1)
	if parts.size() < 2:
		return id
	var key: String = parts[1]
	if parts[0] == "seed" and CROPS.has(key):
		return CROPS[key]["name"] + " বীজ"
	if parts[0] == "crop" and CROPS.has(key):
		return CROPS[key]["name"]
	if parts[0] == "fish" and FISH.has(key):
		return FISH[key]["name"]
	return id


static func item_price(id: String) -> int:
	var parts: PackedStringArray = id.split("_", true, 1)
	if parts.size() < 2:
		return 0
	var key: String = parts[1]
	if parts[0] == "seed" and CROPS.has(key):
		return int(CROPS[key]["seed"])
	if parts[0] == "crop" and CROPS.has(key):
		return int(CROPS[key]["price"])
	if parts[0] == "fish" and FISH.has(key):
		return int(FISH[key]["price"])
	return 0


static func is_sellable(id: String) -> bool:
	return id.begins_with("crop_") or id.begins_with("fish_")


static func is_giftable(id: String) -> bool:
	return id.begins_with("crop_") or id.begins_with("fish_")


static func fish_for_season(season: int) -> Array:
	var out: Array = []
	for k in FISH_ORDER:
		if FISH[k]["seasons"].has(season):
			out.append(k)
	return out


static func crops_for_season(season: int) -> Array:
	var out: Array = []
	for k in CROP_ORDER:
		if CROPS[k]["seasons"].has(season):
			out.append(k)
	return out
