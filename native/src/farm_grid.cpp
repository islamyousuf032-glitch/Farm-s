#include "farm_grid.h"

using namespace godot;

namespace chalabon {

bool FarmGrid::valid(int x, int y) const {
	return x >= 0 && y >= 0 && x < width && y < height;
}

void FarmGrid::_bind_methods() {
	ClassDB::bind_method(D_METHOD("setup", "width", "height"), &FarmGrid::setup);
	ClassDB::bind_method(D_METHOD("get_width"), &FarmGrid::get_width);
	ClassDB::bind_method(D_METHOD("get_height"), &FarmGrid::get_height);
	ClassDB::bind_method(D_METHOD("till", "x", "y"), &FarmGrid::till);
	ClassDB::bind_method(D_METHOD("plant", "x", "y", "crop_index", "days_to_mature", "regrow_days"), &FarmGrid::plant);
	ClassDB::bind_method(D_METHOD("water", "x", "y"), &FarmGrid::water);
	ClassDB::bind_method(D_METHOD("harvest", "x", "y"), &FarmGrid::harvest);
	ClassDB::bind_method(D_METHOD("get_crop", "x", "y"), &FarmGrid::get_crop);
	ClassDB::bind_method(D_METHOD("get_stage", "x", "y"), &FarmGrid::get_stage);
	ClassDB::bind_method(D_METHOD("is_tilled", "x", "y"), &FarmGrid::is_tilled);
	ClassDB::bind_method(D_METHOD("is_watered", "x", "y"), &FarmGrid::is_watered);
	ClassDB::bind_method(D_METHOD("end_of_day"), &FarmGrid::end_of_day);
	ClassDB::bind_method(D_METHOD("export_state"), &FarmGrid::export_state);
	ClassDB::bind_method(D_METHOD("import_state", "state"), &FarmGrid::import_state);
}

void FarmGrid::setup(int w, int h) {
	width = w < 0 ? 0 : w;
	height = h < 0 ? 0 : h;
	int n = width * height;
	crop.resize(n); grown.resize(n); required.resize(n); regrow.resize(n);
	watered.resize(n); tilled.resize(n);
	crop.fill(0); grown.fill(0); required.fill(0); regrow.fill(0);
	watered.fill(0); tilled.fill(0);
}

bool FarmGrid::till(int x, int y) {
	if (!valid(x, y)) return false;
	int i = idx(x, y);
	if (tilled[i] || crop[i] != 0) return false;
	tilled[i] = 1;
	return true;
}

bool FarmGrid::plant(int x, int y, int crop_index, int days_to_mature, int regrow_days) {
	if (!valid(x, y) || crop_index <= 0 || days_to_mature <= 0) return false;
	int i = idx(x, y);
	if (!tilled[i] || crop[i] != 0) return false;
	crop[i] = crop_index;
	grown[i] = 0;
	required[i] = days_to_mature;
	regrow[i] = regrow_days < 0 ? 0 : regrow_days;
	return true;
}

bool FarmGrid::water(int x, int y) {
	if (!valid(x, y)) return false;
	int i = idx(x, y);
	if (!tilled[i] || watered[i]) return false;
	watered[i] = 1;
	return true;
}

int FarmGrid::harvest(int x, int y) {
	if (!valid(x, y)) return 0;
	int i = idx(x, y);
	if (crop[i] == 0 || grown[i] < required[i]) return 0;
	int got = crop[i];
	if (regrow[i] > 0) {
		// Plant keeps producing: next harvest after regrow days.
		grown[i] = required[i] - regrow[i];
	} else {
		crop[i] = 0; grown[i] = 0; required[i] = 0; regrow[i] = 0;
		tilled[i] = 0;
	}
	return got;
}

int FarmGrid::get_crop(int x, int y) const {
	return valid(x, y) ? crop[idx(x, y)] : 0;
}

int FarmGrid::get_stage(int x, int y) const {
	if (!valid(x, y)) return 0;
	int i = idx(x, y);
	if (crop[i] == 0) return 0;
	if (grown[i] >= required[i]) return 4;
	int stage = 1 + (grown[i] * 3) / required[i];
	return stage > 3 ? 3 : stage;
}

bool FarmGrid::is_tilled(int x, int y) const {
	return valid(x, y) && tilled[idx(x, y)] != 0;
}

bool FarmGrid::is_watered(int x, int y) const {
	return valid(x, y) && watered[idx(x, y)] != 0;
}

void FarmGrid::end_of_day() {
	int n = width * height;
	for (int i = 0; i < n; i++) {
		if (crop[i] != 0 && watered[i] && grown[i] < required[i]) {
			grown[i] += 1;
		}
		watered[i] = 0;
	}
}

Dictionary FarmGrid::export_state() const {
	Dictionary d;
	d["w"] = width;
	d["h"] = height;
	d["crop"] = crop;
	d["grown"] = grown;
	d["required"] = required;
	d["regrow"] = regrow;
	d["watered"] = watered;
	d["tilled"] = tilled;
	return d;
}

void FarmGrid::import_state(const Dictionary &state) {
	setup(state.get("w", 0), state.get("h", 0));
	int n = width * height;
	auto load = [n](const Dictionary &s, const char *key, PackedInt32Array &dst) {
		PackedInt32Array src = s.get(key, PackedInt32Array());
		if (src.size() == n) dst = src;
	};
	load(state, "crop", crop);
	load(state, "grown", grown);
	load(state, "required", required);
	load(state, "regrow", regrow);
	load(state, "watered", watered);
	load(state, "tilled", tilled);
}

int FarmGrid::hash_cell(int seed, int x, int y) {
	uint32_t h = (uint32_t)seed * 374761393u + (uint32_t)x * 668265263u + (uint32_t)y * 2246822519u;
	h = (h ^ (h >> 13)) * 1274126177u;
	h ^= h >> 16;
	return (int)(h % 10000u);
}

} // namespace chalabon
