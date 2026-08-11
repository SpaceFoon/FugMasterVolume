/*:
 * @target MV MZ
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
 * This plugin fixes the annoying problem of RPG Maker games starting at a
 * volume that blows out your ear drums. Developers can set a default volume
 * and users get a master volume control.
 *
 * === Console Testing Helper ===
 * A small helper is exposed for quick runtime testing:
 *   - `FugsMasterVolumeTest.setDev(percent)`   // set developer volume 0-100
 *   - `FugsMasterVolumeTest.setUser(percent)`  // set user volume 0-200 (persists if slider active)
 *   - `FugsMasterVolumeTest.setBoth(dev, user)`
 *   - `FugsMasterVolumeTest.bumpUser(delta)`   // nudge user volume
 *   - `FugsMasterVolumeTest.get()` / `.log()`  // inspect current dev/user/final
 * These call the same code paths as the options slider (when enabled) so you can audition levels live.
 *
 * ============================================================================
 * Plugin Parameters
 * ============================================================================
 *
 * Debug Logs: Enable debug console logging
 * Dev Master Volume: Permanent developer-set volume level (0-100%)
 * Show User Master Volume: Allow users to control master volume in options menu
 * Hide Stock Volume Control: Hide stock BGM/BGS/SE/ME volume controls
 * Master Volume Name: Name of the master volume slider in options menu
 * Stock Volume Names: Customize names of stock volume sliders
 * Default User Master Volume: Default user volume setting (0-200%)
 * Arrow Volume Step Size: Increment/decrement step size for arrow keys
 * Click Volume Step Size: Increment/decrement step size for mouse clicks
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
 * @param Show User Volume
 * @parent User Settings
 * @text Show User Volume Control
 * @desc Allow users to control master volume in options menu
 * @type boolean
 * @on Show
 * @off Hide
 * @default true
 *
 * @param Slider Name
 * @parent User Settings
 * @text Volume Slider Name
 * @desc The name of the volume slider in the options menu
 * @type string
 * @default Master Volume
 *
 * @param User Master Volume
 * @parent User Settings
 * @text Default User Master Volume
 * @desc Default user master volume when first enabled (0-200%)
 * @type number
 * @min 0
 * @max 200
 * @default 90
 *
 * @param Option Menu Settings
 * @text Option Menu Settings
 * @desc How the volume control appears in menus
 *
 * @param Hide Stock Volume
 * @parent Option Menu Settings
 * @text Hide Stock Volume Controls
 * @desc Hide the default BGM/BGS/SE/ME volume controls from options menu
 * @type boolean
 * @on Hide
 * @off Show
 * @default false
 *
 * @param Arrow volume step size
 * @parent Option Menu Settings
 * @text Arrow Key Volume Step Size
 * @desc The increment/decrement step size for volume adjustments with arrow keys
 * @type number
 * @min 1
 * @max 25
 * @default 5
 *
 * @param Click volume step size
 * @parent Option Menu Settings
 * @text Click Volume Step Size
 * @desc The increment/decrement step size for volume adjustments with mouse clicks
 * @type number
 * @min 1
 * @max 100
 * @default 25
 *
 * @param Stock Volume Names
 * @text Stock Volume Slider Names
 * @desc Customize the names of stock volume sliders
 *
 * @param BGM Volume Name
 * @parent Stock Volume Names
 * @text BGM Volume Slider Name
 * @desc Custom name for the BGM volume slider
 * @type string
 * @default BGM Volume
 *
 * @param BGS Volume Name
 * @parent Stock Volume Names
 * @text BGS Volume Slider Name
 * @desc Custom name for the BGS volume slider
 * @type string
 * @default BGS Volume
 *
 * @param SE Volume Name
 * @parent Stock Volume Names
 * @text SE Volume Slider Name
 * @desc Custom name for the SE volume slider
 * @type string
 * @default SE Volume
 *
 * @param ME Volume Name
 * @parent Stock Volume Names
 * @text ME Volume Slider Name
 * @desc Custom name for the ME volume slider
 * @type string
 * @default ME Volume
 *
 */

(() => {
  const pluginName = "FugsMasterVolume";
  const params = PluginManager.parameters(pluginName);

  // Parse parameters
  const debug = params["Debug Logs"] === "true";
  let devMasterVolume = Number(params["Dev Master Volume"]) || 70; //let for console testing
  const showUserVolume = params["Show User Volume"] === "true";
  const defaultUserVolume = Number(params["User Master Volume"]) || 90;
  const sliderName = String(params["Slider Name"]) || "Master Volume";
  // const optionPosition = String(params["Option Position"]) || "TopVolume";
  const hideStockVolume = params["Hide Stock Volume"] === "true";
  const volumeStepSize = Number(params["Arrow volume step size"]) || 5;
  const clickVolumeStepSize = Number(params["Click volume step size"]) || 25;
  const bgmVolumeName = String(params["BGM Volume Name"]) || "BGM Volume";
  const bgsVolumeName = String(params["BGS Volume Name"]) || "BGS Volume";
  const seVolumeName = String(params["SE Volume Name"]) || "SE Volume";
  const meVolumeName = String(params["ME Volume Name"]) || "ME Volume";

  // Check for YEP Options and disable user controls if present
  const hasYEPOptions = typeof Yanfly !== "undefined" && Yanfly.Options;

  function getUserVolumeMultiplier() {
    if (!showUserVolume) return 1;

    if (hasYEPOptions) {
      const yepMasterVolume = Number(ConfigManager.masterVolume);
      const safeYepMasterVolume = Number.isFinite(yepMasterVolume) ? yepMasterVolume : 100;
      return Math.max(0, Math.min(100, safeYepMasterVolume)) / 100;
    }

    const localUserVolume = Number(ConfigManager.userMasterVolume);
    const safeLocalUserVolume = Number.isFinite(localUserVolume) ? localUserVolume : defaultUserVolume;
    return Math.max(0, Math.min(200, safeLocalUserVolume)) / 100;
  }

  // Debug function
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
      showUserVolume: showUserVolume,
      hasYEPOptions: hasYEPOptions,
      defaultUserVolume: defaultUserVolume + "%",
      sliderName: sliderName,
      // optionPosition: optionPosition,
      hideStockVolume: hideStockVolume,
      volumeStepSize: volumeStepSize,
      clickVolumeStepSize: clickVolumeStepSize,
      bgmVolumeName: bgmVolumeName,
      bgsVolumeName: bgsVolumeName,
      seVolumeName: seVolumeName,
      meVolumeName: meVolumeName,
    });
    debugLog("WebAudio master volume at initialization:", WebAudio._masterVolume || "undefined");
  }

  // Set up ConfigManager for user volume control
  if (showUserVolume) {
    Object.defineProperty(ConfigManager, "userMasterVolume", {
      get: function () {
        return this._userMasterVolume;
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
      const userVolume = getUserVolumeMultiplier();
      const finalVolume = devVolume * userVolume;

      debugLog(
        `Applying volume: Dev(${devVolume.toFixed(
          2
        )}) × User(${userVolume.toFixed(2)}) = ${finalVolume.toFixed(2)}`
      );

      try {
        if (WebAudio && WebAudio.setMasterVolume) {
          WebAudio.setMasterVolume(finalVolume);
          debugLog("Combined volume applied successfully");
        } else {
          debugLog("WebAudio not ready for combined volume");
        }
      } catch (error) {
        debugLog("Error applying combined volume:", error);
      }
    };

    // ConfigManager persistence
    const _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function () {
      const config = _ConfigManager_makeData.call(this);
      config.userMasterVolume = this.userMasterVolume;
      return config;
    };

    const _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function (config) {
      _ConfigManager_applyData.call(this, config);
      this.userMasterVolume = this.readValue(config, "userMasterVolume", defaultUserVolume);
    };

    const _ConfigManager_readValue = ConfigManager.readValue;
    ConfigManager.readValue = function (config, name, defaultValue) {
      if (name === "userMasterVolume") {
        const value = config[name];
        return value !== undefined ? Number(value) : defaultValue;
      }
      return _ConfigManager_readValue.call(this, config, name, defaultValue);
    };

    // If YEP Options manages masterVolume, re-apply developer scaling whenever
    // the YEP master slider changes so both controls combine correctly.
    if (hasYEPOptions) {
      const masterVolumeDescriptor = Object.getOwnPropertyDescriptor(ConfigManager, "masterVolume");
      if (masterVolumeDescriptor && typeof masterVolumeDescriptor.set === "function") {
        const originalMasterGetter = masterVolumeDescriptor.get;
        const originalMasterSetter = masterVolumeDescriptor.set;

        Object.defineProperty(ConfigManager, "masterVolume", {
          get: function () {
            return originalMasterGetter
              ? originalMasterGetter.call(this)
              : this._masterVolume;
          },
          set: function (value) {
            originalMasterSetter.call(this, value);
            this.applyMasterVolume();
          },
          configurable: true,
        });
      }
    }

    // Override necessary for name changes
    Window_Options.prototype.addVolumeOptions = function () {
      if (showUserVolume && !hasYEPOptions) this.addCommand(sliderName, "userMasterVolume");
      if (!hideStockVolume && !hasYEPOptions) {
        this.addCommand(bgmVolumeName, "bgmVolume");
        this.addCommand(bgsVolumeName, "bgsVolume");
        this.addCommand(seVolumeName, "seVolume");
        this.addCommand(meVolumeName, "meVolume");
      }
    };

    // Show volume percentage
    const _Window_Options_statusText = Window_Options.prototype.statusText;
    Window_Options.prototype.statusText = function (symbol) {
      if (symbol === "userMasterVolume" && !hasYEPOptions) {
        return ConfigManager.userMasterVolume + "%";
      }
      return _Window_Options_statusText.call(this, symbol);
    };

    // Click cycling through presets
    const _Window_Options_processOk = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function () {
      const symbol = this.commandSymbol(this.index());
      if (symbol === "userMasterVolume" && !hasYEPOptions) {
        const currentValue = ConfigManager.userMasterVolume;
        const presets = [];
        const step = clickVolumeStepSize;
        for (let i = 0; i <= 200; i += step) {
          presets.push(i);
        }
        const currentIndex = presets.indexOf(currentValue);
        const nextIndex = (currentIndex + 1) % presets.length;
        ConfigManager.userMasterVolume = presets[nextIndex];
        this.redrawCurrentItem();
        SoundManager.playCursor();
        return;
      }
      _Window_Options_processOk.call(this);
    };

    // Right arrow fine adjustment
    const _Window_Options_cursorRight = Window_Options.prototype.cursorRight;
    Window_Options.prototype.cursorRight = function (wrap) {
      const symbol = this.commandSymbol(this.index());
      if (symbol === "userMasterVolume" && !hasYEPOptions) {
        ConfigManager.userMasterVolume = Math.min(
          ConfigManager.userMasterVolume + volumeStepSize,
          200
        );
        this.redrawCurrentItem();
        SoundManager.playCursor();
        return;
      }
      _Window_Options_cursorRight.call(this, wrap);
    };

    // Left arrow fine adjustment
    const _Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
    Window_Options.prototype.cursorLeft = function (wrap) {
      const symbol = this.commandSymbol(this.index());
      if (symbol === "userMasterVolume" && !hasYEPOptions) {
        ConfigManager.userMasterVolume = Math.max(
          ConfigManager.userMasterVolume - volumeStepSize,
          0
        );
        this.redrawCurrentItem();
        SoundManager.playCursor();
        return;
      }
      _Window_Options_cursorLeft.call(this, wrap);
    };
  }

  // Apply initial volume
  function initDevVolume() {
    try {
      if (WebAudio && WebAudio.setMasterVolume) {
        if (showUserVolume && ConfigManager.applyMasterVolume) {
          ConfigManager.applyMasterVolume();
        } else {
          const devVolume = devMasterVolume / 100;
          WebAudio.setMasterVolume(devVolume);
          debugLog(`Dev volume applied: ${devVolume.toFixed(2)}`);
        }
        debugLog("Plugin initialization complete");
        return;
      }
    } catch (error) {
      debugLog("WebAudio not ready yet, retrying...");
    }
    setTimeout(initDevVolume, 100);
  }

  // Console helper for quick testing: FugsMasterVolumeTest.set(50), .bump(10), .get(), .log()
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, Number(val)));
  }

  function applyUserVolume(percent) {
    const clampedUser = clamp(percent, 0, 200);

    // If YEP Options controls master volume, route test helper through it.
    if (showUserVolume && hasYEPOptions && ConfigManager.applyMasterVolume) {
      ConfigManager.masterVolume = Math.max(0, Math.min(100, clampedUser));
      return {
        dev: devMasterVolume,
        user: Number(ConfigManager.masterVolume),
        final: WebAudio._masterVolume,
      };
    }

    // If plugin slider exists, reuse the normal path so it persists in ConfigManager.
    if (showUserVolume && !hasYEPOptions && ConfigManager.applyMasterVolume) {
      ConfigManager.userMasterVolume = clampedUser;
      return { dev: devMasterVolume, user: clampedUser, final: WebAudio._masterVolume };
    }

    // Otherwise, compute combined volume manually and set master
    const devVolume = devMasterVolume / 100;
    const userVolume = clampedUser / 100;
    const finalVolume = devVolume * userVolume;
    if (WebAudio && WebAudio.setMasterVolume) {
      WebAudio.setMasterVolume(finalVolume);
    }
    return { dev: devMasterVolume, user: clampedUser, final: finalVolume };
  }

  function applyDevVolume(percent) {
    devMasterVolume = clamp(percent, 0, 100);

    // Reapply using current user setting if available.
    if (showUserVolume && ConfigManager.applyMasterVolume) {
      ConfigManager.applyMasterVolume();
      return {
        dev: devMasterVolume,
        user: getUserVolumeMultiplier() * 100,
        final: WebAudio._masterVolume,
      };
    }

    const devVolume = devMasterVolume / 100;
    const userVolume = getUserVolumeMultiplier();
    const finalVolume = devVolume * userVolume;
    if (WebAudio && WebAudio.setMasterVolume) {
      WebAudio.setMasterVolume(finalVolume);
    }
    return { dev: devMasterVolume, user: userVolume * 100, final: finalVolume };
  }

  window.FugsMasterVolumeTest = {
    setUser(percent) {
      const res = applyUserVolume(percent);
      debugLog(`Test user set → dev:${res.dev}% user:${res.user}% final:${res.final}`);
      return res;
    },
    setDev(percent) {
      const res = applyDevVolume(percent);
      debugLog(`Test dev set → dev:${res.dev}% user:${res.user}% final:${res.final}`);
      return res;
    },
    setBoth(devPercent, userPercent) {
      applyDevVolume(devPercent);
      return this.setUser(userPercent);
    },
    bumpUser(delta) {
      const current = showUserVolume && !hasYEPOptions ? ConfigManager.userMasterVolume : 100;
      return this.setUser(current + Number(delta || 0));
    },
    get() {
      return {
        dev: devMasterVolume,
        user: showUserVolume && !hasYEPOptions ? ConfigManager.userMasterVolume : null,
        final: WebAudio ? WebAudio._masterVolume : null,
      };
    },
    log() {
      const res = this.get();
      console.log(`[FugsMasterVolumeTest] dev:${res.dev}% user:${res.user}% final:${res.final}`);
      return res;
    },
  };

  initDevVolume();
})();
