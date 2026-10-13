#pragma once
// FarmGrid: C++ simulation core for the farm plots (tilling, planting, watering, growth).
// Exposed to GDScript as the native class "FarmGrid".
#include <godot_cpp/classes/ref_counted.hpp>
#include <godot_cpp/variant/dictionary.hpp>
#include <godot_cpp/variant/packed_int32_array.hpp>

namespace chalabon {

class FarmGrid : public godot::RefCounted {
	GDCLASS(FarmGrid, godot::RefCounted)

	int width = 0;
	int height = 0;
	// Per-cell state, struct-of-arrays. crop: 0 = none, otherwise crop index (1-based).
	godot::PackedInt32Array crop;
	godot::PackedInt32Array grown;       // days grown
	godot::PackedInt32Array required;    // days to mature
	godot::PackedInt32Array regrow;      // days between harvests (0 = single harvest)
	godot::PackedInt32Array watered;     // 0/1, cleared at end of day
	godot::PackedInt32Array tilled;      // 0/1

	bool valid(int x, int y) const;
	int idx(int x, int y) const { return y * width + x; }

protected:
	static void _bind_methods();

public:
	void setup(int w, int h);
	int get_width() const { return width; }
	int get_height() const { return height; }

	bool till(int x, int y);
	bool plant(int x, int y, int crop_index, int days_to_mature, int regrow_days);
	bool water(int x, int y);
	int harvest(int x, int y);  // returns crop index harvested, 0 if nothing ready
	int get_crop(int x, int y) const;
	int get_stage(int x, int y) const;  // 0 none, 1 sprout, 2-3 growing, 4 ready
	bool is_tilled(int x, int y) const;
	bool is_watered(int x, int y) const;
	void end_of_day();   // watered crops grow one day; water evaporates

	godot::Dictionary export_state() const;
	void import_state(const godot::Dictionary &state);

	static int hash_cell(int seed, int x, int y);  // deterministic per-cell noise, 0..9999
};

} // namespace chalabon
