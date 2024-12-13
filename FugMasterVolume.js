/*:
 * @plugindesc Adds master volume settings for developers and players.
 * @author Fug
 *
 * @param Debug Logs
 * @type boolean
 * @desc Log spam! (true/false)
 * @default false
 *
 * @param Dev Master Volume
 * @type number
 * @desc Default master volume setting (0-100%).
 * Permanent master volume setting.
 * @default 70
 *
 * @param Show User Volume
 * @type boolean
 * @desc Use and Show User Volume in the option menu.
 * User volume persists across game saves. (true/false)
 * @default true
 *
 * @param User Master Volume
 * @text User Master Volume
 * @parent Show User Volume
 * @type number
 * @desc Default master volume (0-100%)
 * Not used if user volume is off.
 * @default 90
 *
 * @param Option Position
 * @type select
 * @option TopAll
 * @option TopVolume
 * @option BottomVolume
 * @desc Position of the master volume option in the options menu.
 * @default TopVolume
 *
 * @help
 * =====================================================================================
 * Introduction
 * =====================================================================================
 * This plugin fixes the annoying problem of RPG Maker MV/MZ games starting at full-blast
 * --RIP-headphone-users volume. Developers can lock in a permanent default volume so
 * your game doesn’t scare the neighbors—or blast anyone out of their chair—on the first
 * launch. Players also get a master volume slider in the Options menu, just in case you
 * still got it wrong. And the user can even crank the volume above 100%!
 * =====================================================================================
 * Features
 * =====================================================================================
 * 1. **Developer Master Volume:**
 *    - Set a global, developer-defined volume level for new games.
 *    - Ensures a pleasant and controlled audio experience from first launch.
 *
 * 2. **User Master Volume (Optional):**
 *    - Provides players with an adjustable master volume slider in the Options menu.
 *    - Settings persist across game sessions via ConfigManager.
 *    - Adjustable in 1% increments, can go to 900%
 *
 * =====================================================================================
 * Compatibility
 * =====================================================================================
 * If Yanfly's Option Core plugin is enabled, this plugin automatically disables
 * the User Master Volume option to avoid conflicts. Developer volume settings
 * still apply for initial game launches.
 *
 * =====================================================================================
 * Instructions
 * =====================================================================================
 * 1. Configure the desired volume levels in the plugin parameters:
 *    - **Dev Master Volume**: Sets the global default volume.
 *    - **Show User Volume**: Enables or disables the user-adjustable volume slider.
 * 2. Use the **Option Position** parameter to decide where the Master Volume option appears.
 *
 * =====================================================================================
 * License
 * =====================================================================================
 * This plugin is distributed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, distribute, and modify the plugin under the terms of the GPLv3.
 * See <https://www.gnu.org/licenses/gpl-3.0.en.html> for details.
 *
 * =====================================================================================
 * Terms of Use
 * =====================================================================================
 * - Free for commercial and non-commercial use.
 * - Attribution and a link is appreciated but not required.
 */

(() => {
  debugger;
  const pluginName = "FugsMasterVolume";
  const params = PluginManager.parameters(pluginName);

  const debug = params["Debug Logs"] === "true";
  const devMasterVolume = Number(params["Dev Master Volume"]) || 100;
  const userMasterVolume = Number(params["User Master Volume"]) || 100;
  const useConfigManager = PluginManager._scripts.includes("YEP_OptionsCore")
    ? false
    : params["Show User Volume"] === "true";
  const optionPosition = String(params["Option Position"]);

  if (debug) {
    console.log("Developer Master Volume (default):", devMasterVolume + "%");
    console.log("User Master Volume (default):", userMasterVolume + "%");
    console.log("Use ConfigManager (persist user settings):", useConfigManager);
    console.log("Master Volume Option Position:", optionPosition);
  }
  // get volume average
  const finalMasterVolume = useConfigManager
    ? (devMasterVolume * userMasterVolume) / 10000
    : devMasterVolume / 100;
  if (debug) {
    console.log("Combined Master Volume", finalMasterVolume);
  }

  // WebAudio/Dev Volume
  WebAudio.setMasterVolume(finalMasterVolume);
  // ConfigManager.masterVolume = finalMasterVolume;

  console.log(
    "ConfigManager.masterVolume:",
    ConfigManager.masterVolume,
    finalMasterVolume
  );
  AudioManager._masterVolume = finalMasterVolume;
  ConfigManager.masterVolume = finalMasterVolume;
  //If YEP set the start volume from devMaster
  if (PluginManager._scripts.includes("YEP_OptionsCore")) {
    if (debug)
      console.warn(
        "YEP_OptionsCore detected! Not using Fugs Master Volume for User Volume control!"
      );
  }
  // AudioManager.masterVolume = finalMasterVolume;
  console.log(
    "AudioManager.masterVolume ConfigManager ",
    AudioManager._masterVolume,
    ConfigManager.masterVolume
  );

  if (debug) {
    console.log("AudioManager.masterVolume:", AudioManager._masterVolume);
    console.log("WebAudio.masterVolume:", WebAudio._masterVolume);
    console.log("ConfigManager.masterVolume:", ConfigManager.masterVolume);
  }

  if (useConfigManager) {
    if (debug)
      console.log(
        "ConfigManager integration enabled. User volume:",
        userMasterVolume
      );

    Object.defineProperty(ConfigManager, "userMasterVolume", {
      get() {
        return this._userMasterVolume;
      },
      set(value) {
        this._userMasterVolume = value / 100;
      },
      configurable: true,
    });

    const originalMakeData = ConfigManager.makeData;
    ConfigManager.makeData = function () {
      const config = originalMakeData.call(this);
      this.masterVolume = finalMasterVolume;
      return config;
    };

    const originalApplyData = ConfigManager.applyData;
    ConfigManager.applyData = function (config) {
      originalApplyData.call(this, config);
      this.masterVolume = finalMasterVolume;
    };
  }
  // const isPlaytest = Utils.isOptionValid("test");
  // if (isPlaytest === 1)

  // Add master volume option in the Options menu
  const addOption = function () {
    console.log("-------------Option added");
    this.addCommand("User Master Volume", "userMasterVolume");
  };
  // option menu
  const _statusText = Window_Options.prototype.statusText;
  Window_Options.prototype.statusText = function (symbol) {
    if (symbol === "userMasterVolume") {
      return `${ConfigManager.userMasterVolume}%`;
    }
    return _statusText.call(this, symbol);
  };

  const _processOk = Window_Options.prototype.processOk;
  Window_Options.prototype.processOk = function () {
    const symbol = this.commandSymbol(this.index());
    if (symbol === "userMasterVolume") {
      const currentValue = ConfigManager.userMasterVolume;
      ConfigManager.userMasterVolume =
        currentValue === 900 ? 0 : currentValue + 5;
      WebAudio.setMasterVolume(ConfigManager.userMasterVolume / 100);
      this.redrawCurrentItem();
      return;
    }
    _processOk.call(this);
  };

  const _cursorRight = Window_Options.prototype.cursorRight;
  Window_Options.prototype.cursorRight = function (wrap) {
    const symbol = this.commandSymbol(this.index());
    if (symbol === "userMasterVolume") {
      ConfigManager.userMasterVolume = Math.min(
        ConfigManager.userMasterVolume + 1,
        900
      );
      WebAudio.setMasterVolume(ConfigManager.userMasterVolume / 100); // Apply volume in real-time
      this.redrawCurrentItem();
      return;
    }
    _cursorRight.call(this, wrap);
  };

  const _cursorLeft = Window_Options.prototype.cursorLeft;
  Window_Options.prototype.cursorLeft = function (wrap) {
    const symbol = this.commandSymbol(this.index());
    if (symbol === "userMasterVolume") {
      ConfigManager.userMasterVolume = userMasterVolume;
      WebAudio.setMasterVolume(finalMasterVolume); // Apply volume in real-time
      this.redrawCurrentItem();
      return;
    }
    _cursorLeft.call(this, wrap);
  };
  const originalMakeCommandList = Window_Options.prototype.makeCommandList;
  Window_Options.prototype.makeCommandList = function () {
    if (!useConfigManager) {
      console.log("Not adding to list");

      return originalMakeCommandList.call(this);
    }

    if (optionPosition === "Bottom") {
      this.addGeneralOptions();
      this.addVolumeOptions();
      addOption.call(this);
    } else if (optionPosition === "TopAll") {
      console.log("TopAll");
      addOption.call(this);
      this.addGeneralOptions();
      this.addVolumeOptions();
    } else if (optionPosition === "TopVolume") {
      this.addGeneralOptions();
      addOption.call(this);
      this.addVolumeOptions();
    } else if (optionPosition === "BottomVolume") {
      this.addGeneralOptions();
      this.addVolumeOptions();
      addOption.call(this);
    } else {
      console.log("didn't trigger");

      originalMakeCommandList.call(this);
    }
  };

  console.log(
    "Final Applied Volume: ",
    AudioManager.masterVolume,
    WebAudio._masterVolume
  );
})();
