/*:
 * @plugindesc v1.0 Adds master volume settings for developers and players.
 * @author Fug
 *
 * @param Debug Logs
 * @type boolean
 * @desc So many logs it might slow your game down. (true/false)
 * @default false
 *
 * @param Dev Master Volume
 * @type number
 * @desc Default master volume setting (0-100%). This is permanently applied and not visible to the user.
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
 * @desc Default user master volume (0-100%)
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
 * Fixed Master Volume Plugin v1.1
 * =====================================================================================
 * This plugin fixes the annoying problem of RPG Maker MV games starting at a volume
 * that blows out your ear drums. Developers can set a default volume and users get a
 * master volume control.
 * This plugin is designed to work with and without plugins like YEP_OptionsCore, OCRams
 * audio plugins and FugsMultiTrackAudioEx.
 *
 * Features:
 * - Developer-defined default volume (applied on first launch)
 * - User master volume control (0-200%, saved in config)
 * - Proper ConfigManager integration
 * - YEP_OptionsCore compatibility
 * =====================================================================================
 */

(() => {
  const params = PluginManager.parameters("FugsMasterVolume");

  const debug = params["Debug Logs"] === "true";
  const devMasterVolume = Number(params["Dev Master Volume"]) || 70;
  const defaultUserVolume = Number(params["User Master Volume"]) || 90;
  const showUserVolume = params["Show User Volume"] === "true";
  const optionPosition = String(params["Option Position"]);

  // Check for YEP_OptionsCore
  const hasYEPOptions = typeof Yanfly !== "undefined" && Yanfly.Options;
  const useConfigManager = !hasYEPOptions && showUserVolume;

  if (debug) {
    console.log("[FugsMasterVolume] Debug Info:");
    console.log("  Developer Master Volume:", devMasterVolume + "%");
    console.log("  Default User Volume:", defaultUserVolume + "%");
    console.log("  Show User Volume:", showUserVolume);
    console.log("  Use ConfigManager:", useConfigManager);
    console.log("  YEP Options detected:", hasYEPOptions);
    console.log("  Option Position:", optionPosition);
    console.log("Stock WebAudio master volume:", WebAudio._masterVolume);
    console.log(
      "Stock AudioManager master volume:",
      AudioManager._masterVolume || "undefined"
    );
  }

  // Set up ConfigManager property for user master volume
  if (useConfigManager) {
    Object.defineProperty(ConfigManager, "userMasterVolume", {
      get: function () {
        return this._userMasterVolume || defaultUserVolume;
      },
      set: function (value) {
        this._userMasterVolume = Math.max(0, Math.min(200, value));
        this.applyMasterVolume();
      },
      configurable: true,
    });

    // Combine dev and user volumes
    ConfigManager.applyMasterVolume = function () {
      const devVolume = devMasterVolume / 100;
      const userVolume = this.userMasterVolume / 100;
      const finalVolume = devVolume * userVolume;

      if (debug) {
        console.log(
          `[FugsMasterVolume] Applying volume: Dev(${devVolume}) * User(${userVolume}) = ${finalVolume}`
        );
      }

      WebAudio.setMasterVolume(finalVolume);
    };

    // Override ConfigManager.makeData to save userMasterVolume
    const _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function () {
      const config = _ConfigManager_makeData.call(this);
      config.userMasterVolume = this.userMasterVolume;
      return config;
    };

    // Override ConfigManager.applyData to load userMasterVolume
    const _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function (config) {
      _ConfigManager_applyData.call(this, config);
      this.userMasterVolume = this.readValue(
        config,
        "userMasterVolume",
        defaultUserVolume
      );
    };

    // Override ConfigManager.readValue to handle our custom property
    const _ConfigManager_readValue = ConfigManager.readValue;
    ConfigManager.readValue = function (config, name, defaultValue) {
      if (name === "userMasterVolume") {
        const value = config[name];
        return value !== undefined ? value : defaultValue;
      }
      return _ConfigManager_readValue.call(this, config, name, defaultValue);
    };
  } else {
    // Just apply dev volume directly
    const devVolume = devMasterVolume / 100;
    if (debug) {
      console.log(`[FugsMasterVolume] Applying dev volume only: ${devVolume}`);
    }
    WebAudio.setMasterVolume(devVolume);
  }

  // Options menu integration (only if ConfigManager is being used)
  if (useConfigManager) {
    // Override Window_Options.prototype.makeCommandList
    const _Window_Options_makeCommandList =
      Window_Options.prototype.makeCommandList;
    Window_Options.prototype.makeCommandList = function () {
      switch (optionPosition) {
        case "TopAll":
          this.addCommand("Master Volume", "userMasterVolume");
          this.addGeneralOptions();
          this.addVolumeOptions();
          break;
        case "TopVolume":
          this.addGeneralOptions();
          this.addCommand("Master Volume", "userMasterVolume");
          this.addVolumeOptions();
          break;
        case "BottomVolume":
          this.addGeneralOptions();
          this.addVolumeOptions();
          this.addCommand("Master Volume", "userMasterVolume");
          break;
        default:
          _Window_Options_makeCommandList.call(this);
          this.addCommand("Master Volume", "userMasterVolume");
      }
    };

    // Override statusText to show the volume percentage
    const _Window_Options_statusText = Window_Options.prototype.statusText;
    Window_Options.prototype.statusText = function (symbol) {
      if (symbol === "userMasterVolume") {
        return ConfigManager.userMasterVolume + "%";
      }
      return _Window_Options_statusText.call(this, symbol);
    };

    // Override processOk for clicking on the option
    const _Window_Options_processOk = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function () {
      const symbol = this.commandSymbol(this.index());
      if (symbol === "userMasterVolume") {
        const currentValue = ConfigManager.userMasterVolume;
        // Cycle through preset values: 0, 25, 50, 75, 100, 125, 150, 200
        const presets = [0, 25, 50, 75, 100, 125, 150, 200];
        const currentIndex = presets.indexOf(currentValue);
        const nextIndex = (currentIndex + 1) % presets.length;
        ConfigManager.userMasterVolume = presets[nextIndex];
        this.redrawCurrentItem();
        SoundManager.playCursor();
        return;
      }
      _Window_Options_processOk.call(this);
    };

    // Override cursorRight for fine control
    const _Window_Options_cursorRight = Window_Options.prototype.cursorRight;
    Window_Options.prototype.cursorRight = function (wrap) {
      const symbol = this.commandSymbol(this.index());
      if (symbol === "userMasterVolume") {
        ConfigManager.userMasterVolume = Math.min(
          ConfigManager.userMasterVolume + 5,
          200
        );
        this.redrawCurrentItem();
        SoundManager.playCursor();
        return;
      }
      _Window_Options_cursorRight.call(this, wrap);
    };

    // Override cursorLeft for fine control
    const _Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
    Window_Options.prototype.cursorLeft = function (wrap) {
      const symbol = this.commandSymbol(this.index());
      if (symbol === "userMasterVolume") {
        ConfigManager.userMasterVolume = Math.max(
          ConfigManager.userMasterVolume - 5,
          0
        );
        this.redrawCurrentItem();
        SoundManager.playCursor();
        return;
      }
      _Window_Options_cursorLeft.call(this, wrap);
    };
  }

  // Apply initial volume on plugin load
  if (useConfigManager) {
    // Will be applied when ConfigManager loads
    if (debug) {
      console.log(
        "[FugsMasterVolume] ConfigManager will handle initial volume application"
      );
    }
  } else {
    // Apply dev volume immediately
    setTimeout(() => {
      const devVolume = devMasterVolume / 100;
      WebAudio.setMasterVolume(devVolume);
      if (debug) {
        console.log(`[FugsMasterVolume] Initial volume applied: ${devVolume}`);
      }
    }, 100);
  }

  if (debug) {
    console.log("[FugsMasterVolume] Plugin initialization complete");
  }
})();
