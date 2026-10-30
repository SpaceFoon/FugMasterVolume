# Fugs Master Volume

Set a developer-defined starting volume and give players a saved master-volume slider in RPG Maker's Options menu.

| | |
|---|---|
| **Version** | 1.0.0 |
| **Engines** | RPG Maker MV 1.5+ and MZ |
| **Plugin file** | `FugsMasterVolume.js` |
| **License** | GNU GPL-3.0 ([LICENSE](LICENSE)) |

## Download

- [GitHub Releases](https://github.com/SpaceFoon/FugMasterVolume/releases) — versioned install ZIPs will appear here.
- [Plugin source](https://github.com/SpaceFoon/FugMasterVolume/blob/main/FugsMasterVolume.js)
- [Repository](https://github.com/SpaceFoon/FugMasterVolume)
- [Itch.io profile](https://itch.io/profile/spacefoon)

## Features

- Apply a developer-defined starting master volume.
- Add a saved player master-volume control from 0–200%.
- Optionally hide RPG Maker's stock BGM, BGS, SE, and ME sliders.
- Customize slider names and keyboard/mouse step sizes.
- Use the included `FugsMasterVolumeTest` console helpers during development.

## Install

1. Copy `FugsMasterVolume.js` into your game's `js/plugins/` folder.
2. Enable **FugsMasterVolume** in Plugin Manager.
3. Configure the developer volume and player Options settings.
4. Test the Options menu and all audio paths used by your game.

## Compatibility

- RPG Maker MV 1.5+ and MZ.
- YEP_OptionsCore works with the developer volume setting only.
- For OcRams audio mods, load this plugin before those mods.
- Other plugins that replace the Options menu may require a different plugin order.

## License

GNU GPL-3.0. Commercial and non-commercial use are permitted under the license terms; see [LICENSE](LICENSE) for redistribution and modification conditions.
