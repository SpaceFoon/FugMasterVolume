# 📦 Master Volume Plugin v1.0

**Author:** Fug  
**Version:** 1.0  
**Targets:** RPG Maker MV
**Plugin Filename:** `FugsMasterVolume.js`  
**URL:** [itch.io/](https://itch.io/profile/spacefoon)

---

This plugin solves the problem of RPG Maker games launching at a volume that blows out your ear drums.
It allows developers to enforce a fixed master volume and gives players a custom master volume control in the Options menu.

Optional settings allow hiding default volume sliders, customizing labels,  
and controlling how volume sliders behave.

---

## 🔧 Features

- Developer-defined default master volume (applied once at game start)
- User master volume control (0–200%, saved in config)
- Option to hide stock BGM/BGS/SE/ME sliders
- Custom slider names (master + stock)
- Adjustable step sizes for arrow keys and mouse clicks
- Extensive debug logging

---

## 🚀 Installation Instructions

1. Place `FugsMasterVolume.js` in your project’s `js/plugins/` folder.
2. Open **Plugin Manager** in RPG Maker.
3. Click **“Add Plugin”**, select `FugsMasterVolume`, and **turn it ON**.
4. Configure parameters or leave default:
   - Set developer volume (`Dev Master Volume`)
   - Enable/disable user control
   - Customize appearance and behavior
5. Test in-game: Master volume should apply globally to all sound output.

---

## 🔌 Compatibility

- ✅ Works with RPG Maker **MV 1.5+**

- ✅ Compatible with:
  - **YEP_OptionsCore works with dev volume only.**
  - OCRams audio mods when placed BEFORE them in the plugin list.
  - FugsMultiTrackAudioEx
- ⚠️ Other plugins that **override the Options menu** may interfere and require manual plugin order adjustment.
- ✅ Minimal side effects: The plugin avoids overriding global audio systems like `AudioManager`, and only interacts with `WebAudio.setMasterVolume()` when needed.

---

## 📜 License

This plugin is **free for commercial and non-commercial use**.

- Attribution appreciated but not required.
- Modification and redistribution allowed (credit encouraged).
- Do not sell the plugin by itself.

---

## 🧩 Need Help?

Post issues or ideas on [my itch.io profile](https://itch.io/profile/spacefoon), or open a discussion wherever this plugin is hosted.

---
