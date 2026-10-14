class_name NpcBrain
extends RefCounted
## Decision layer for one villager: a needs-driven utility AI.
##
## Each decision tick the brain scores every candidate action from the current
## world context (time of day, rain, player distance, nearby villagers, needs and
## memory of the player) and picks the highest score. Hysteresis keeps the current
## action unless a new one is clearly better, so villagers do not flicker.
##
## The design follows the common split used in shipped open-world games:
## routines/schedules as the baseline, utility scoring for moment-to-moment choices,
## and memory that modifies how people react to the player. It is pure logic
## (no scene nodes) so it can be unit-tested headless.

const ACT_ROUTINE: String = "routine"
const ACT_SHELTER: String = "shelter"
const ACT_GREET: String = "greet"
const ACT_SOCIAL: String = "socialize"
const ACT_WANDER: String = "wander"

const SWITCH_MARGIN: float = 0.15       # new action must beat the current one by this much
const GREET_COOLDOWN_HOURS: float = 2.0  # in-game hours before greeting the player again
const SOCIAL_GAIN_PER_SEC: float = 0.006 # need rises ~3 minutes to full
const SOCIAL_AFTER_CHAT: float = 0.1

var npc_id: String = ""
var social: float = 0.4                  # 0..1, how much the villager wants company
var action: String = ACT_ROUTINE
var greet_hour: float = -99.0            # game hour of the last greeting
var greet_day: int = -1
var greets_total: int = 0                # how many times the player was greeted
var _last_scores: Dictionary = {}


func _init(id: String = "") -> void:
	npc_id = id


## Needs grow with real time; chatting resets them.
func tick_needs(dt: float) -> void:
	social = minf(1.0, social + SOCIAL_GAIN_PER_SEC * dt)


func after_chat() -> void:
	social = SOCIAL_AFTER_CHAT


## Player mood 0..1 from friendship points; drives tone of greetings.
static func mood_from_friendship(points: int) -> float:
	return clampf(float(points) / 300.0, 0.0, 1.0)


## ctx keys:
##   hour: float, rain: bool, routine: Vector2i, shelter: Vector2i,
##   player_dist: int (cells), social_partner_dist: int (-1 if none),
##   friendship: int, outdoors: bool
## Returns a Dictionary: {action, score, scores} for the chosen action.
func decide(ctx: Dictionary) -> Dictionary:
	var scores: Dictionary = {}
	scores[ACT_ROUTINE] = 0.6
	# Shelter from rain: the more it rains, the stronger the pull indoors.
	scores[ACT_SHELTER] = 0.9 if (bool(ctx.get("rain", false)) and bool(ctx.get("outdoors", true))) else 0.0
	# Greeting the player when close, at most once per cooldown window.
	var pd: int = int(ctx.get("player_dist", 99))
	var can_greet: bool = _can_greet(float(ctx.get("hour", 0.0)), int(ctx.get("day", 0)))
	var mood: float = mood_from_friendship(int(ctx.get("friendship", 0)))
	scores[ACT_GREET] = (0.85 + 0.1 * mood) if (pd <= 3 and can_greet) else 0.0
	# Socialising with a nearby villager when the social need is high.
	var sd: int = int(ctx.get("social_partner_dist", -1))
	scores[ACT_SOCIAL] = social * 0.95 if (sd >= 0 and sd <= 6 and social > 0.55) else 0.0
	# Wandering is the low-priority filler.
	scores[ACT_WANDER] = 0.15

	# Hysteresis: keep the current action if it still scores close to the best.
	var best: String = ACT_ROUTINE
	for k in scores.keys():
		if float(scores[k]) > float(scores[best]):
			best = k
	var chosen: String = best
	if action != best and float(scores.get(action, 0.0)) > 0.0:
		if float(scores[best]) < float(scores[action]) + SWITCH_MARGIN:
			chosen = action
	action = chosen
	_last_scores = scores
	return {"action": chosen, "score": float(scores[chosen]), "scores": scores}


func _can_greet(hour: float, day: int) -> bool:
	if day != greet_day:
		return true
	return hour - greet_hour >= GREET_COOLDOWN_HOURS or hour < greet_hour


func register_greet(hour: float, day: int) -> void:
	greet_hour = hour
	greet_day = day
	greets_total += 1


func last_scores() -> Dictionary:
	return _last_scores
