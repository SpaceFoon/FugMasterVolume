# FugsMasterVolume Plugin

## Description
Adds master volume settings for developers and players to control audio levels more effectively in RPG Maker MV games.

---

## Parameters

### Debug Logs
- **Type:** Boolean
- **Description:** Enables log spam for debugging purposes.
- **Default:** `false`

### Dev Master Volume
- **Type:** Number
- **Description:** Sets the permanent default master volume (0-100%).
- **Default:** `70`

### Show User Volume
- **Type:** Boolean
- **Description:** Allows users to adjust and display the master volume slider in the Options menu. Persists across game saves.
- **Default:** `true`

### User Master Volume
- **Type:** Number
- **Parent Parameter:** Show User Volume
- **Description:** Default adjustable master volume for users (0-100%). Not used if Show User Volume is disabled.
- **Default:** `90`

### Option Position
- **Type:** Select
- **Options:**
  - `TopAll`
  - `TopVolume`
  - `BottomVolume`
- **Description:** Determines the position of the Master Volume option in the Options menu.
- **Default:** `TopVolume`

---

## Features

1. **Developer Master Volume:**
   - Set a global, developer-defined volume level for new games.
   - Ensures a pleasant and controlled audio experience from the first launch.

2. **User Master Volume (Optional):**
   - Provides players with an adjustable master volume slider in the Options menu.
   - Settings persist across game sessions via ConfigManager.
   - Adjustable in 1% increments, with a maximum of 900%.

---

## Compatibility

- Automatically disables the User Master Volume option if Yanfly's Options Core plugin is detected, avoiding potential conflicts.
- Developer-defined volume settings still apply for initial game launches.

---

## Instructions

1. Configure the desired volume levels in the plugin parameters:
   - **Dev Master Volume:** Sets the global default volume.
   - **Show User Volume:** Enables or disables the user-adjustable volume slider.
2. Use the **Option Position** parameter to decide where the Master Volume option appears in the Options menu.

---

## License

This plugin is distributed under the GNU General Public License v3.0 (GPLv3).

- You may copy, distribute, and modify the plugin under the terms of the GPLv3.
- See [GNU GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.en.html) for details.

---

## Terms of Use

- Free for commercial and non-commercial use.
- Attribution and a link are appreciated but not required.
