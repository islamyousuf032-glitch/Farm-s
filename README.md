# Farm-s — চালাবন ফার্ম

গাজীপুর-অনুপ্রাণিত বাংলাদেশি খামার-জীবনের গেম। ইঞ্জিন: **Godot 4.7** (GDScript)। Android APK।

- **গেম (Godot):** `godot/` — দৃশ্য, স্ক্রিপ্ট (`godot/scripts/`), ফন্ট, পিক্সেল আর্ট।
- **ফার্ম সিমুলেশন:** `godot/scripts/farm_grid.gd` — `FarmGrid` (জমি, চাষ, পানি, ফসল বৃদ্ধি, সেভ-ডেটা)। C++ সংস্করণ `native/src/` এ আছে, কিন্তু এখন APK-তে যুক্ত নয় (নিচে দেখুন)।
- **আর্ট জেনারেটর:** `tools/gen_art.py` — সব পিক্সেল আর্ট কোড থেকে তৈরি (`python3 tools/gen_art.py`)।
- **APK ও রিলিজ:** `.github/workflows/android-release.yml` — Godot headless টেস্ট, সাইন করা APK, GitHub Release।
- **সাইনিং কী:** `signing/` (প্রতিটি আপডেট APK একই কী দিয়ে সাই করা হয়)।
- **ডকুমেন্ট:** `docs/` (GDD, চরিত্র ডিজাইন, বন্ধুত্ব শিট, ইনস্টল গাইড)।
- **পুরোনো গবেষণা নথি:** রিপোর্টের বাকি `.md` ফাইলগুলো (ম্যাপ, ঋতু, উৎস গবেষণা)।

## স্থানীয়ভাবে চালাতে (ঐচ্ছিক)

```bash
# Godot 4.7 editor-এ godot/project.godot খুলুন
godot --headless --path godot --script res://tests/smoke_test.gd
```
