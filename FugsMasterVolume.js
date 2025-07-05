/*:
 * @target MV
 * @plugindesc [v1.0] Master Volume Plugin
 * @author Fug
 * @version 1.0
 * @url https://itch.io/profile/spacefoon
 * @help FugsMasterVolume.js
 *
 * ============================================================================
 * Master Volume Plugin v1.0
 * ============================================================================
 *
 * This plugin fixes the annoying problem of RPG Maker MV games starting at a
 * volume that blows out your ear drums. Developers can set a default volume
 * and users get a master volume control.
 *
 * This plugin is designed to work with and without plugins like YEP_OptionsCore,
 * OCRams audio plugins and FugsMultiTrackAudioEx.
 *
 * Features:
 * - Developer-defined default volume (applied on first launch)
 * - User master volume control (0-200%, saved in config)
 * - YEP_OptionsCore compatibility
 * - Option to show/hide user volume control
 *
 * ============================================================================
 * Plugin Parameters
 * ============================================================================
 *
 * Debug Logs: Enable debug console logging
 * Dev Master Volume: Permanent developer-set volume level (0-100%)
 * Show User Volume: Allow users to control volume in options menu
 * User Master Volume: Default user volume setting (0-100%)
 * Option Position: Where to place the volume option in the menu
 *
 * ============================================================================
 * Terms of Use
 * ============================================================================
 *
 * Free for commercial and non-commercial use.
 *
 * ============================================================================
 *
 * @param Developer Settings
 * @text Developer Settings
 * @desc Settings that developers configure
 *
 * @param Debug Logs
 * @parent Developer Settings
 * @text Enable Debug Logs
 * @desc Enable debug console logging for troubleshooting
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 *
 * @param Dev Master Volume
 * @parent Developer Settings
 * @text Developer Master Volume
 * @desc Permanent master volume setting set by developer (0-100%)
 * @type number
 * @min 0
 * @max 100
 * @default 70
 *
 * @param User Settings
 * @text User Volume Settings
 * @desc Settings for user-controllable volume
 *
 * @param Slider Name
 * @parent User Settings
 * @text Volume Slider Name
 * @desc The name of the volume slider in the options menu
 * @type string
 * @default Master Volume
 *
 * @param Show User Volume
 * @parent User Settings
 * @text Show User Volume Control
 * @desc Allow users to control master volume in options menu
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @param User Master Volume
 * @parent Show User Volume
 * @text Default User Master Volume
 * @desc Default user master volume when first enabled (0-100%)
 * @type number
 * @min 0
 * @max 200
 * @default 90
 *
 * @param Interface Settings
 * @text Interface Settings
 * @desc How the volume control appears in menus
 *
 * @param Option Position
 * @parent Interface Settings
 * @text Volume Option Position
 * @desc Position of the master volume option in the options menu
 * @type select
 * @option Top of All Options
 * @value TopAll
 * @option Top of Volume Section
 * @value TopVolume
 * @option Bottom of Volume Section
 * @value BottomVolume
 * @default TopVolume
 *
 */

(() => {
  "use strict";

  const pluginName = "FugsMasterVolume";
  const params = PluginManager.parameters(pluginName);

  // Parse parameters with proper type conversion
  const debug = params["Debug Logs"] === "true";
  const devMasterVolume = Number(params["Dev Master Volume"]) || 70;
  const defaultUserVolume = Number(params["User Master Volume"]) || 90;
  const showUserVolume = params["Show User Volume"] === "true";
  const optionPosition = String(params["Option Position"]) || "TopVolume";

  // Check for YEP_OptionsCore compatibility
  const hasYEPOptions = typeof Yanfly !== "undefined" && Yanfly.Options;
  const useConfigManager = !hasYEPOptions && showUserVolume;

  // Debug logging function
  function debugLog(message, ...args) {
    if (debug) {
      console.log(`[${pluginName}] ${message}`, ...args);
    }
  }

  // Initialize debug information
  if (debug) {
    debugLog("Plugin initialization started");
    debugLog("Configuration:", {
      devMasterVolume: devMasterVolume + "%",
      defaultUserVolume: defaultUserVolume + "%",
      showUserVolume: showUserVolume,
      useConfigManager: useConfigManager,
      hasYEPOptions: hasYEPOptions,
      optionPosition: optionPosition,
    });
    debugLog("WebAudio master volume:", WebAudio._masterVolume);
    debugLog(
      "AudioManager master volume:",
      AudioManager._masterVolume || "undefined"
    );
  }

  // Set up ConfigManager property for user master volume
  if (useConfigManager) {
    Object.defineProperty(ConfigManager, "userMasterVolume", {
      get: function () {
        return this._userMasterVolume !== undefined
          ? this._userMasterVolume
          : defaultUserVolume;
      },
      set: function (value) {
        this._userMasterVolume = Math.max(0, Math.min(200, Number(value)));
        this.applyMasterVolume();
      },
      configurable: true,
    });

    // Apply combined developer and user volumes
    ConfigManager.applyMasterVolume = function () {
      const devVolume = devMasterVolume / 100;
      const userVolume = this.userMasterVolume / 100;
      const finalVolume = devVolume * userVolume;

      debugLog(
        `Applying volume calculation: Dev(${devVolume.toFixed(
          2
        )}) × User(${userVolume.toFixed(2)}) = ${finalVolume.toFixed(2)}`
      );

      WebAudio.setMasterVolume(finalVolume);
    };

    // Override ConfigManager methods to handle persistence
    const _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function () {
      const config = _ConfigManager_makeData.call(this);
      config.userMasterVolume = this.userMasterVolume;
      return config;
    };

    const _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function (config) {
      _ConfigManager_applyData.call(this, config);
      this.userMasterVolume = this.readValue(
        config,
        "userMasterVolume",
        defaultUserVolume
      );
    };

    const _ConfigManager_readValue = ConfigManager.readValue;
    ConfigManager.readValue = function (config, name, defaultValue) {
      if (name === "userMasterVolume") {
        const value = config[name];
        return value !== undefined ? Number(value) : defaultValue;
      }
      return _ConfigManager_readValue.call(this, config, name, defaultValue);
    };
  } else {
    // Apply developer volume only
    const devVolume = devMasterVolume / 100;
    debugLog(`Applying developer volume only: ${devVolume.toFixed(2)}`);
    WebAudio.setMasterVolume(devVolume);
  }

  // Options menu integration
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

    // Override statusText to show volume percentage
    const _Window_Options_statusText = Window_Options.prototype.statusText;
    Window_Options.prototype.statusText = function (symbol) {
      if (symbol === "userMasterVolume") {
        return ConfigManager.userMasterVolume + "%";
      }
      return _Window_Options_statusText.call(this, symbol);
    };

    // Override processOk for preset cycling
    const _Window_Options_processOk = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function () {
      const symbol = this.commandSymbol(this.index());
      if (symbol === "userMasterVolume") {
        const currentValue = ConfigManager.userMasterVolume;
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

    // Override cursorRight for fine adjustment
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

    // Override cursorLeft for fine adjustment
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

  // Apply initial volume settings
  if (useConfigManager) {
    debugLog("ConfigManager will handle initial volume application");
  } else {
    // Apply developer volume with slight delay to ensure WebAudio is ready
    setTimeout(() => {
      const devVolume = devMasterVolume / 100;
      WebAudio.setMasterVolume(devVolume);
      debugLog(`Initial developer volume applied: ${devVolume.toFixed(2)}`);
    }, 100);
  }

  debugLog("Plugin initialization complete");
})();
