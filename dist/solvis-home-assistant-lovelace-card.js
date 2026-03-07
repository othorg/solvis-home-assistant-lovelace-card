/* Solvis Home Assistant Lovelace Card */

const CARD_TYPE = "solvis-home-assistant-lovelace-card";
const CARD_NAME = "Solvis Home Assistant Lovelace Card";
const CARD_VERSION = "0.50.2";

function detectScriptBasePath() {
  if (typeof document === "undefined" || typeof document.querySelectorAll !== "function") {
    return "";
  }

  const scriptName = "solvis-home-assistant-lovelace-card.js";
  for (const script of document.querySelectorAll("script[src]")) {
    const src = script.getAttribute?.("src") || script.src || "";
    if (!src) continue;
    const clean = src.split("?")[0];
    if (!clean.endsWith(scriptName)) continue;
    const lastSlash = clean.lastIndexOf("/");
    if (lastSlash < 0) continue;
    return clean.slice(0, lastSlash);
  }
  return "";
}

const SCRIPT_BASE_PATH = detectScriptBasePath();
const CARD_ICON_URL = SCRIPT_BASE_PATH
  ? `${SCRIPT_BASE_PATH}/solvis-icon.png`
  : "/hacsfiles/solvis-home-assistant-lovelace-card/solvis-icon.png";

const DEFAULT_IMAGE_CANDIDATES = [
  ...(SCRIPT_BASE_PATH ? [
    `${SCRIPT_BASE_PATH}/solvis-home-assistant-lovelace-card-base.jpg`,
    `${SCRIPT_BASE_PATH}/assets/solvis-home-assistant-lovelace-card-base.jpg`,
  ] : []),
  "/hacsfiles/solvis-home-assistant-lovelace-card/solvis-home-assistant-lovelace-card-base.jpg",
  "/hacsfiles/solvis-home-assistant-lovelace-card/dist/solvis-home-assistant-lovelace-card-base.jpg",
  "/local/community/solvis-home-assistant-lovelace-card/solvis-home-assistant-lovelace-card-base.jpg",
  "/local/community/solvis-home-assistant-lovelace-card/dist/solvis-home-assistant-lovelace-card-base.jpg",
  "/hacsfiles/solvis-home-assistant-lovelace-card/assets/solvis-home-assistant-lovelace-card-base.jpg",
  "/local/solvis-home-assistant-lovelace-card/assets/solvis-home-assistant-lovelace-card-base.jpg",
  "/local/community/solvis-home-assistant-lovelace-card/assets/solvis-home-assistant-lovelace-card-base.jpg",
  "/hacsfiles/solvis-home-assistant-lovelace-card/assets/solvis-home-assistant-lovelace-card-base.png",
  "/local/solvis-home-assistant-lovelace-card/assets/solvis-home-assistant-lovelace-card-base.png",
  "/local/community/solvis-home-assistant-lovelace-card/assets/solvis-home-assistant-lovelace-card-base.png",
];

const SENSOR_OVERLAYS = [
  { key: "s10", relPos: [0.495, 0.100], format: "{v}°C", label: "S10", name: "Aussentemperatur" },
  { key: "s1", relPos: [0.558, 0.227], format: "{v}°C", label: "S1", name: "Speicher oben" },
  { key: "s4", relPos: [0.558, 0.391], format: "{v}°C", label: "S4", name: "Speicher Nachheizung" },
  { key: "s9", relPos: [0.558, 0.536], format: "{v}°C", label: "S9", name: "Speicher Mitte" },
  { key: "s3", relPos: [0.558, 0.936], format: "{v}°C", label: "S3", name: "Speicher unten" },
  { key: "slv", relPos: [0.192, 0.689], format: "{v}kW", label: "SL", name: "Solarleistung" },
  { key: "sev", relPos: [0.192, 0.729], format: "{v}kWh", label: "SE", name: "Solarertrag" },
  { key: "s17", relPos: [0.192, 0.769], format: "{v}l/h", label: "S17", name: "Durchfluss Solar" },
  { key: "s8", relPos: [0.192, 0.809], format: "{v}°C", label: "S8", name: "Kollektortemperatur" },
  { key: "s2", relPos: [0.655, 0.536], format: "{v}°C", label: "S2", name: "Warmwasser" },
  { key: "s11", relPos: [0.655, 0.622], format: "{v}°C", label: "S11", name: "Zirkulation" },
  { key: "s12", relPos: [0.655, 0.787], format: "{v}°C", label: "S12", name: "Heizkreis Vorlauf" },
];

const BINARY_OVERLAYS = [
  { key: "a12", relPos: [0.389, 0.391], text: "Nachheizung" },
  { key: "a1", relPos: [0.192, 0.640], text: "Solaranlage" },
  { key: "a2", relPos: [0.655, 0.495], text: "Warmwasser" },
  { key: "a5", relPos: [0.655, 0.578], text: "Zirkulation" },
  { key: "a3", relPos: [0.655, 0.713], text: "Heizkreis 1" },
];

const SENSOR_KEYS = SENSOR_OVERLAYS.map((s) => s.key);
const BINARY_KEYS = BINARY_OVERLAYS.map((b) => b.key);
const ALL_KEYS = [...SENSOR_KEYS, ...BINARY_KEYS];
const ALL_OVERLAYS = [
  ...SENSOR_OVERLAYS.map((overlay) => ({ ...overlay, kind: "sensor" })),
  ...BINARY_OVERLAYS.map((overlay) => ({ ...overlay, kind: "binary" })),
];
const OVERLAY_TEXT_SIZE_OPTIONS = ["auto", "small", "medium", "large"];
const OVERLAY_TEXT_SIZE_PIXELS = {
  small: 10,
  medium: 12,
  large: 14,
};
const OVERLAY_ACTION_TYPES = ["more-info", "navigate", "toggle", "none"];
const DEFAULT_LONG_PRESS_MS = 550;
const DEFAULT_STALE_MINUTES = 30;
const STALE_MINUTES_RANGE = { min: 1, max: 240 };
const LONG_PRESS_RANGE = { min: 200, max: 2000 };

const I18N = {
  de: {
    default_title: "Anlagenschema",
    image_alt: "Solvis Anlagenschema",
    general: "Allgemein",
    title: "Titel",
    base_image_url_optional: "Basisbild URL (optional)",
    overlay_text_size: "Textgroesse Overlay",
    size_auto: "Auto",
    size_small: "Klein",
    size_medium: "Mittel",
    size_large: "Gross",
    system_auto_detected: "Solvis Anlage (auto erkannt)",
    no_system_found: "Keine Solvis Anlage automatisch gefunden",
    load_defaults: "Default-Werte aus Solvis laden",
    entities_notice_before: "Entitäten werden automatisch aus ",
    entities_notice_after: " vorbelegt und können unten einzeln überschrieben werden.",
    loading_entities: "Solvis Entitäten werden geladen...",
    auto_discovery_failed: "Auto-Erkennung fehlgeschlagen",
    sensors_values: "Sensoren (Werte)",
    binary_sensors_status: "Binärsensoren (Status)",
    label_placeholder: "Bezeichner (Standard: {default})",
    display_options: "Anzeige",
    compact_mode: "Kompaktmodus",
    show_status_badges: "Status-Badges anzeigen",
    stale_threshold_minutes: "Stale-Schwelle (Minuten)",
    long_press_ms: "Long-Press Dauer (ms)",
    interaction_presets: "Interaktions-Presets",
    preset: "Preset",
    preset_standard: "Standard",
    preset_compact: "Kompakt",
    preset_service: "Service",
    apply_preset: "Preset anwenden",
    overlay_actions: "Overlay-Aktionen",
    tap_action: "Tap-Aktion",
    hold_action: "Hold-Aktion",
    navigation_path: "Navigationspfad (optional)",
    action_more_info: "More Info",
    action_navigate: "Navigation",
    action_toggle: "Toggle",
    action_none: "Keine",
    import_export: "Import / Export",
    export_config: "Konfiguration exportieren",
    import_config: "Konfiguration importieren",
    config_json: "Konfiguration (JSON)",
    config_json_placeholder: "{\"type\":\"custom:solvis-home-assistant-lovelace-card\", ...}",
    import_failed: "Import fehlgeschlagen",
    export_ready: "Konfiguration exportiert",
    stale_badge: "Veraltet",
    offline_badge: "Offline",
    stale_entities_title: "Veraltete Entitäten",
    offline_entities_title: "Offline Entitäten",
    status_entities_intro: "Folgende Entitäten sind betroffen:",
  },
  en: {
    default_title: "System diagram",
    image_alt: "Solvis system diagram",
    general: "General",
    title: "Title",
    base_image_url_optional: "Base image URL (optional)",
    overlay_text_size: "Overlay text size",
    size_auto: "Auto",
    size_small: "Small",
    size_medium: "Medium",
    size_large: "Large",
    system_auto_detected: "Solvis system (auto detected)",
    no_system_found: "No Solvis system detected automatically",
    load_defaults: "Load default values from Solvis",
    entities_notice_before: "Entities are prefilled from ",
    entities_notice_after: " and can be overridden below.",
    loading_entities: "Loading Solvis entities...",
    auto_discovery_failed: "Auto-discovery failed",
    sensors_values: "Sensors (values)",
    binary_sensors_status: "Binary sensors (status)",
    label_placeholder: "Label (default: {default})",
    display_options: "Display",
    compact_mode: "Compact mode",
    show_status_badges: "Show status badges",
    stale_threshold_minutes: "Stale threshold (minutes)",
    long_press_ms: "Long-press duration (ms)",
    interaction_presets: "Interaction presets",
    preset: "Preset",
    preset_standard: "Standard",
    preset_compact: "Compact",
    preset_service: "Service",
    apply_preset: "Apply preset",
    overlay_actions: "Overlay actions",
    tap_action: "Tap action",
    hold_action: "Hold action",
    navigation_path: "Navigation path (optional)",
    action_more_info: "More info",
    action_navigate: "Navigate",
    action_toggle: "Toggle",
    action_none: "None",
    import_export: "Import / Export",
    export_config: "Export config",
    import_config: "Import config",
    config_json: "Configuration (JSON)",
    config_json_placeholder: "{\"type\":\"custom:solvis-home-assistant-lovelace-card\", ...}",
    import_failed: "Import failed",
    export_ready: "Configuration exported",
    stale_badge: "Stale",
    offline_badge: "Offline",
    stale_entities_title: "Stale entities",
    offline_entities_title: "Offline entities",
    status_entities_intro: "Affected entities:",
  },
};

const SENSOR_NAME_I18N = {
  de: {
    s10: "Aussentemperatur",
    s1: "Speicher oben",
    s4: "Speicher Nachheizung",
    s9: "Speicher Mitte",
    s3: "Speicher unten",
    slv: "Solarleistung",
    sev: "Solarertrag",
    s17: "Durchfluss Solar",
    s8: "Kollektortemperatur",
    s2: "Warmwasser",
    s11: "Zirkulation",
    s12: "Heizkreis Vorlauf",
  },
  en: {
    s10: "Outdoor temperature",
    s1: "Storage top",
    s4: "Storage reheating",
    s9: "Storage middle",
    s3: "Storage bottom",
    slv: "Solar power",
    sev: "Solar yield",
    s17: "Solar flow",
    s8: "Collector temperature",
    s2: "Hot water",
    s11: "Circulation",
    s12: "Heating circuit flow",
  },
};

const BINARY_NAME_I18N = {
  de: {
    a12: "Nachheizung",
    a1: "Solaranlage",
    a2: "Warmwasser",
    a5: "Zirkulation",
    a3: "Heizkreis 1",
  },
  en: {
    a12: "Reheating",
    a1: "Solar system",
    a2: "Hot water",
    a5: "Circulation",
    a3: "Heating circuit 1",
  },
};

const SENSOR_OVERLAY_BY_KEY = new Map(SENSOR_OVERLAYS.map((overlay) => [overlay.key, overlay]));
const BINARY_OVERLAY_BY_KEY = new Map(BINARY_OVERLAYS.map((overlay) => [overlay.key, overlay]));

// Pixel fine-tuning groups (requested UX):
// - left solar block: right aligned on red frame
// - right warmwater/heating blocks: left aligned on blue frame
const SOLAR_GROUP_KEYS = ["a1", "slv", "sev", "s17", "s8"];
const RIGHT_GROUP_KEYS = ["a2", "s2", "a5", "s11", "a3", "s12"];
const SOLAR_GROUP_ANCHOR_X_REL = 0.347;
const RIGHT_GROUP_ANCHOR_X_REL = 0.632;

function resolveLanguage(hass) {
  const raw = String(hass?.locale?.language || hass?.language || "").toLowerCase();
  return raw.startsWith("de") ? "de" : "en";
}

function t(lang, key) {
  return I18N[lang]?.[key] || I18N.en[key] || key;
}

function localizeSensorName(lang, key, fallback = "") {
  return SENSOR_NAME_I18N[lang]?.[key] || SENSOR_NAME_I18N.en[key] || fallback || key.toUpperCase();
}

function localizeBinaryName(lang, key, fallback = "") {
  return BINARY_NAME_I18N[lang]?.[key] || BINARY_NAME_I18N.en[key] || fallback || key.toUpperCase();
}

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

function defaultOverlayActionForKey(key, kind) {
  const isBinary = BINARY_KEYS.includes(key);
  if (kind === "tap") return "more-info";
  if (kind === "hold" && isBinary) return "toggle";
  return "navigate";
}

function buildServicePresetOverlayActions() {
  const actions = {};
  for (const key of BINARY_KEYS) {
    actions[key] = {
      tap_action: "toggle",
      hold_action: "more-info",
      navigation_path: "",
    };
  }
  return actions;
}

function buildPresetConfig(name) {
  if (name === "compact") {
    return {
      compact_mode: true,
      overlay_text_size: "small",
      show_status_badges: true,
      stale_threshold_minutes: 45,
      long_press_ms: 500,
    };
  }
  if (name === "service") {
    return {
      compact_mode: false,
      overlay_text_size: "medium",
      show_status_badges: true,
      stale_threshold_minutes: 10,
      long_press_ms: 450,
      overlay_actions: buildServicePresetOverlayActions(),
    };
  }
  return {
    compact_mode: false,
    overlay_text_size: "auto",
    show_status_badges: true,
    stale_threshold_minutes: DEFAULT_STALE_MINUTES,
    long_press_ms: DEFAULT_LONG_PRESS_MS,
  };
}

function resolveOverlayActionConfig(config, key) {
  const configured = config?.overlay_actions?.[key];
  const action = typeof configured === "object" && configured ? { ...configured } : {};
  const isBinary = BINARY_KEYS.includes(key);
  return {
    tap_action: OVERLAY_ACTION_TYPES.includes(action.tap_action)
      ? action.tap_action
      : defaultOverlayActionForKey(key, "tap"),
    hold_action: OVERLAY_ACTION_TYPES.includes(action.hold_action)
      ? action.hold_action
      : defaultOverlayActionForKey(key, "hold"),
    navigation_path: String(action.navigation_path || "").trim(),
    isBinary,
  };
}

function normalizeConfig(config) {
  const {
    entities,
    binary_entities: binaryEntities,
    overlay_actions: overlayActions,
    ...rest
  } = config || {};
  const normalized = {
    type: `custom:${CARD_TYPE}`,
    title: "",
    image: "",
    system_id: "",
    overlay_text_size: "auto",
    compact_mode: false,
    show_status_badges: true,
    stale_threshold_minutes: DEFAULT_STALE_MINUTES,
    long_press_ms: DEFAULT_LONG_PRESS_MS,
    sensor_labels: {},
    binary_labels: {},
    ...rest,
    entities: { ...(entities || {}) },
    binary_entities: { ...(binaryEntities || {}) },
    overlay_actions: { ...(overlayActions || {}) },
  };

  normalized.compact_mode = Boolean(normalized.compact_mode);
  normalized.show_status_badges = Boolean(normalized.show_status_badges);
  normalized.stale_threshold_minutes = clampNumber(
    normalized.stale_threshold_minutes,
    STALE_MINUTES_RANGE.min,
    STALE_MINUTES_RANGE.max,
    DEFAULT_STALE_MINUTES,
  );
  normalized.long_press_ms = clampNumber(
    normalized.long_press_ms,
    LONG_PRESS_RANGE.min,
    LONG_PRESS_RANGE.max,
    DEFAULT_LONG_PRESS_MS,
  );

  return normalized;
}

function clampImageIdx(value) {
  return Math.max(0, Math.min(DEFAULT_IMAGE_CANDIDATES.length - 1, value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const escapeAttribute = escapeHtml;

function isStateUnavailable(stateObj) {
  if (!stateObj) return true;
  const state = String(stateObj.state ?? "").toLowerCase();
  return state === "unknown" || state === "unavailable" || state === "none";
}

function formatNumericIfPossible(raw) {
  if (raw === null || raw === undefined) return null;
  const asNumber = Number(raw);
  if (!Number.isFinite(asNumber)) return String(raw);
  if (Number.isInteger(asNumber)) return String(asNumber);
  return asNumber.toFixed(1);
}

function parseSystemFromUniqueId(uniqueId, key) {
  const suffix = `_${key}`;
  if (!uniqueId || !uniqueId.endsWith(suffix)) return null;
  return uniqueId.slice(0, -suffix.length) || null;
}

function buildSystemEntityMap(entityRegistryEntries) {
  const bySystem = {};
  for (const entry of entityRegistryEntries) {
    if (entry.platform !== "solvis_remote") continue;
    if (!entry.unique_id || !entry.entity_id) continue;

    for (const key of ALL_KEYS) {
      const systemId = parseSystemFromUniqueId(entry.unique_id, key);
      if (!systemId) continue;
      if (!bySystem[systemId]) bySystem[systemId] = {};
      bySystem[systemId][key] = entry.entity_id;
      break;
    }
  }
  return bySystem;
}

class SolvisHomeAssistantLovelaceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = normalizeConfig({});
    this._hass = undefined;
    this._imageIdx = 0;
    this._domReady = false;
    this._cardEl = null;
    this._imgEl = null;
    this._canvasEl = null;
    this._canvasCtx = null;
    this._wrapperEl = null;
    this._statusLayerEl = null;
    this._offlineBadgeEl = null;
    this._staleBadgeEl = null;
    this._overlayFontPx = 12;
    this._cachedTrackedEntityIds = null;
    this._resizeObserver = null;
    this._canvasRafId = null;
    this._clickTargets = [];
    this._activePress = null;
    this._boundOnCanvasPointerMove = this._onCanvasPointerMove.bind(this);
    this._boundOnCanvasPointerLeave = this._onCanvasPointerLeave.bind(this);
    this._boundOnCanvasPointerDown = this._onCanvasPointerDown.bind(this);
    this._boundOnCanvasPointerUp = this._onCanvasPointerUp.bind(this);
    this._boundOnCanvasPointerCancel = this._onCanvasPointerCancel.bind(this);
    this._boundOnOfflineBadgeClick = (ev) => this._onStatusBadgeClick("offline", ev);
    this._boundOnStaleBadgeClick = (ev) => this._onStatusBadgeClick("stale", ev);
    this._boundOnOfflineBadgeKeyDown = (ev) => this._onStatusBadgeKeyDown("offline", ev);
    this._boundOnStaleBadgeKeyDown = (ev) => this._onStatusBadgeKeyDown("stale", ev);
  }

  static getStubConfig() {
    return {
      type: `custom:${CARD_TYPE}`,
      title: "",
    };
  }

  static getConfigElement() {
    return document.createElement("solvis-home-assistant-lovelace-card-editor");
  }

  setConfig(config) {
    if (!config || config.type !== `custom:${CARD_TYPE}`) {
      throw new Error(`Invalid configuration for ${CARD_TYPE}`);
    }
    this._config = normalizeConfig(config);
    this._cachedTrackedEntityIds = null;
    this._imageIdx = 0;
    this._render();
  }

  connectedCallback() {
    if (this._hass) {
      this._render();
    }
  }

  set hass(hass) {
    const previous = this._hass;
    this._hass = hass;
    const previousLang = resolveLanguage(previous);
    const nextLang = resolveLanguage(hass);
    if (!previous || previousLang !== nextLang || this._hasRelevantStateChanges(previous, hass)) {
      this._render();
    }
  }

  getCardSize() {
    const width = this.offsetWidth || this.getBoundingClientRect().width || 0;
    if (!width) return 10;
    const imageHeight = this._wrapperEl?.offsetHeight || ((width * 720) / 1080);
    const headerHeight = 56;
    return Math.max(6, Math.ceil((imageHeight + headerHeight) / 50));
  }

  _lang() {
    return resolveLanguage(this._hass);
  }

  _t(key) {
    return t(this._lang(), key);
  }

  _defaultSensorName(key, fallback = "") {
    return localizeSensorName(this._lang(), key, fallback);
  }

  _defaultBinaryName(key, fallback = "") {
    return localizeBinaryName(this._lang(), key, fallback);
  }

  _compactFactor() {
    return this._config?.compact_mode ? 0.82 : 1;
  }

  _getLongPressMs() {
    return clampNumber(
      this._config?.long_press_ms,
      LONG_PRESS_RANGE.min,
      LONG_PRESS_RANGE.max,
      DEFAULT_LONG_PRESS_MS,
    );
  }

  _getStaleThresholdMs() {
    const minutes = clampNumber(
      this._config?.stale_threshold_minutes,
      STALE_MINUTES_RANGE.min,
      STALE_MINUTES_RANGE.max,
      DEFAULT_STALE_MINUTES,
    );
    return minutes * 60 * 1000;
  }

  _getOverlayActionConfig(key) {
    return resolveOverlayActionConfig(this._config, key);
  }

  _buildDefaultNavigationPath(entityId) {
    if (!entityId) return "/history";
    return `/history?entity_id=${encodeURIComponent(entityId)}`;
  }

  _emitNavigate(path) {
    if (!path) return;
    this.dispatchEvent(new CustomEvent("hass-navigate", {
      detail: { navigation_path: path },
      bubbles: true,
      composed: true,
    }));
  }

  async _toggleEntity(entityId) {
    if (!entityId || typeof this._hass?.callService !== "function") return false;
    const [domain] = entityId.split(".");
    if (domain === "binary_sensor") return false;
    try {
      await this._hass.callService("homeassistant", "toggle", { entity_id: entityId });
      return true;
    } catch (err1) {
      try {
        await this._hass.callService(domain || "homeassistant", "toggle", { entity_id: entityId });
        return true;
      } catch (err2) {
        console.warn(
          `${CARD_NAME}: toggle action failed for ${entityId}`,
          err2 || err1,
        );
        return false;
      }
    }
  }

  _executeOverlayAction(target, kind) {
    if (!target?.entityId) return;
    if (!target?.key) {
      this._emitMoreInfo(target.entityId);
      return;
    }
    const actionConfig = this._getOverlayActionConfig(target.key);
    const actionType = kind === "hold" ? actionConfig.hold_action : actionConfig.tap_action;
    if (actionType === "none") return;

    if (actionType === "more-info") {
      this._emitMoreInfo(target.entityId);
      return;
    }
    if (actionType === "navigate") {
      const path = actionConfig.navigation_path || this._buildDefaultNavigationPath(target.entityId);
      this._emitNavigate(path);
      return;
    }
    if (actionType === "toggle") {
      this._toggleEntity(target.entityId).then((ok) => {
        // If toggle is unsupported/failed (for example binary_sensor), fall back to more-info.
        if (!ok) this._emitMoreInfo(target.entityId);
      });
    }
  }

  _formatEntityDisplayName(entityId, stateObj) {
    const friendlyName = String(stateObj?.attributes?.friendly_name || "").trim();
    return friendlyName || entityId;
  }

  _collectEntityHealth() {
    const thresholdMs = this._getStaleThresholdMs();
    const now = Date.now();
    const offline = [];
    const stale = [];

    for (const entityId of this._trackedEntityIds()) {
      const stateObj = this._hass?.states?.[entityId];
      if (!stateObj || isStateUnavailable(stateObj)) {
        offline.push({
          entityId,
          name: this._formatEntityDisplayName(entityId, stateObj),
        });
        continue;
      }
      const ts = Date.parse(stateObj.last_updated || stateObj.last_changed || "");
      if (Number.isFinite(ts) && (now - ts) > thresholdMs) {
        stale.push({
          entityId,
          name: this._formatEntityDisplayName(entityId, stateObj),
        });
      }
    }

    return { offline, stale };
  }

  _computeStatusSummary() {
    const health = this._collectEntityHealth();
    return {
      offline: health.offline.length,
      stale: health.stale.length,
    };
  }

  _buildStatusBadgeTooltip(entities) {
    if (!Array.isArray(entities) || entities.length === 0) return "";
    const preview = entities.slice(0, 4).map((item) => item.name).join(", ");
    if (entities.length <= 4) return preview;
    return `${preview} (+${entities.length - 4})`;
  }

  async _showStatusEntities(kind) {
    const health = this._collectEntityHealth();
    const items = kind === "stale" ? health.stale : health.offline;
    if (!items.length || typeof this._hass?.callService !== "function") return;

    const title = kind === "stale"
      ? `${this._t("stale_entities_title")} (${items.length})`
      : `${this._t("offline_entities_title")} (${items.length})`;
    const lines = items.map((item) => `- ${item.name} (\`${item.entityId}\`)`);
    const message = `${this._t("status_entities_intro")}\n${lines.join("\n")}`;

    try {
      await this._hass.callService("persistent_notification", "create", {
        title,
        message,
        notification_id: `${CARD_TYPE}_${kind}_entities`,
      });
    } catch (err) {
      console.warn(`${CARD_NAME}: failed to open status entity list for ${kind}`, err);
    }
  }

  _onStatusBadgeClick(kind, ev) {
    ev?.preventDefault?.();
    ev?.stopPropagation?.();
    this._showStatusEntities(kind);
  }

  _onStatusBadgeKeyDown(kind, ev) {
    const key = String(ev?.key || "");
    if (key !== "Enter" && key !== " ") return;
    ev.preventDefault?.();
    ev.stopPropagation?.();
    this._showStatusEntities(kind);
  }

  _resolveImageUrl() {
    if (this._config.image) return this._config.image;
    return DEFAULT_IMAGE_CANDIDATES[clampImageIdx(this._imageIdx)];
  }

  _handleImageError = () => {
    if (this._config.image) return;
    if (this._imageIdx < DEFAULT_IMAGE_CANDIDATES.length - 1) {
      this._imageIdx += 1;
      this._render();
      return;
    }
    // Final fallback exhausted: keep overlays visible and report candidates for support/debugging.
    console.error(
      `${CARD_NAME}: failed to load base image from all fallback paths`,
      DEFAULT_IMAGE_CANDIDATES,
    );
  };

  _getSensorEntityId(key) {
    return this._config.entities?.[key] || "";
  }

  _getBinaryEntityId(key) {
    return this._config.binary_entities?.[key] || "";
  }

  _resolveSensorLabel(overlay) {
    const custom = this._config.sensor_labels?.[overlay.key];
    const label = String(custom ?? "").trim();
    return label || overlay.label;
  }

  _resolveBinaryLabel(overlay) {
    const custom = this._config.binary_labels?.[overlay.key];
    const label = String(custom ?? "").trim();
    return label || this._defaultBinaryName(overlay.key, overlay.text);
  }

  _formatSensorOverlayText(overlay) {
    const entityId = this._getSensorEntityId(overlay.key);
    const stateObj = entityId ? this._hass?.states?.[entityId] : undefined;
    const label = this._resolveSensorLabel(overlay);

    if (!stateObj || isStateUnavailable(stateObj)) {
      return `-- ${label}`;
    }

    const rawValue = stateObj.state;
    const value = formatNumericIfPossible(rawValue);
    const formatted = overlay.format.replace("{v}", value ?? "--");
    return `${formatted} ${label}`;
  }

  _getBinaryState(overlay) {
    const entityId = this._getBinaryEntityId(overlay.key);
    const stateObj = entityId ? this._hass?.states?.[entityId] : undefined;
    if (!stateObj || isStateUnavailable(stateObj)) return "unavailable";
    return String(stateObj.state).toLowerCase() === "on" ? "on" : "off";
  }

  _isBinaryOn(overlay) {
    return this._getBinaryState(overlay) === "on";
  }

  _trackedEntityIds() {
    if (this._cachedTrackedEntityIds) {
      return this._cachedTrackedEntityIds;
    }
    const ids = new Set();
    for (const entityId of Object.values(this._config.entities || {})) {
      if (entityId) ids.add(entityId);
    }
    for (const entityId of Object.values(this._config.binary_entities || {})) {
      if (entityId) ids.add(entityId);
    }
    this._cachedTrackedEntityIds = [...ids];
    return this._cachedTrackedEntityIds;
  }

  _hasRelevantStateChanges(previousHass, nextHass) {
    const trackTimestamps = Boolean(this._config?.show_status_badges);
    for (const entityId of this._trackedEntityIds()) {
      const beforeObj = previousHass?.states?.[entityId];
      const afterObj = nextHass?.states?.[entityId];
      const before = beforeObj?.state ?? null;
      const after = afterObj?.state ?? null;
      if (before !== after) return true;
      if (trackTimestamps) {
        const beforeUpdated = beforeObj?.last_updated ?? beforeObj?.last_changed ?? null;
        const afterUpdated = afterObj?.last_updated ?? afterObj?.last_changed ?? null;
        if (beforeUpdated !== afterUpdated) return true;
      }
    }
    return false;
  }

  disconnectedCallback() {
    if (this._imgEl) this._imgEl.onerror = null;
    if (this._canvasEl) {
      this._canvasEl.removeEventListener("pointermove", this._boundOnCanvasPointerMove);
      this._canvasEl.removeEventListener("pointerleave", this._boundOnCanvasPointerLeave);
      this._canvasEl.removeEventListener("pointerdown", this._boundOnCanvasPointerDown);
      this._canvasEl.removeEventListener("pointerup", this._boundOnCanvasPointerUp);
      this._canvasEl.removeEventListener("pointercancel", this._boundOnCanvasPointerCancel);
    }
    if (this._offlineBadgeEl) {
      this._offlineBadgeEl.removeEventListener("click", this._boundOnOfflineBadgeClick);
      this._offlineBadgeEl.removeEventListener("keydown", this._boundOnOfflineBadgeKeyDown);
    }
    if (this._staleBadgeEl) {
      this._staleBadgeEl.removeEventListener("click", this._boundOnStaleBadgeClick);
      this._staleBadgeEl.removeEventListener("keydown", this._boundOnStaleBadgeKeyDown);
    }
    if (this._resizeObserver && this._wrapperEl) {
      this._resizeObserver.unobserve(this._wrapperEl);
    }
    this._resizeObserver = null;
    if (this._canvasRafId !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(this._canvasRafId);
    }
    this._canvasRafId = null;
    if (this._activePress?.timer && typeof clearTimeout === "function") {
      clearTimeout(this._activePress.timer);
    }
    this._activePress = null;
    this._clickTargets = [];
    this._hass = undefined;
  }

  _ensureCardDom() {
    if (!this.shadowRoot || this._domReady) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        ha-card {
          overflow: hidden;
        }

        .wrapper {
          position: relative;
          width: 100%;
          background: #e9e9e9;
          aspect-ratio: 1080 / 720;
        }

        .base {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .overlay-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: auto;
          cursor: default;
          touch-action: manipulation;
        }

        .status-badges {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 6px;
          align-items: center;
          z-index: 2;
        }

        .status-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid transparent;
          backdrop-filter: blur(2px);
          white-space: nowrap;
        }

        .status-badge[role="button"] {
          cursor: pointer;
        }

        .status-badge:focus-visible {
          outline: 2px solid rgba(30, 120, 220, 0.9);
          outline-offset: 2px;
        }

        .status-badge.offline {
          color: #7a1f1f;
          background: rgba(255, 190, 190, 0.8);
          border-color: rgba(170, 55, 55, 0.7);
        }

        .status-badge.stale {
          color: #6c5b00;
          background: rgba(255, 236, 173, 0.82);
          border-color: rgba(160, 132, 20, 0.7);
        }
      </style>
      <ha-card>
        <div class="wrapper">
          <div class="status-badges" hidden>
            <span class="status-badge offline" hidden></span>
            <span class="status-badge stale" hidden></span>
          </div>
          <img class="base" alt="" />
          <canvas class="overlay-canvas"></canvas>
        </div>
      </ha-card>
    `;

    this._cardEl = this.shadowRoot.querySelector("ha-card");
    this._wrapperEl = this.shadowRoot.querySelector(".wrapper");
    this._statusLayerEl = this.shadowRoot.querySelector(".status-badges");
    this._offlineBadgeEl = this.shadowRoot.querySelector(".status-badge.offline");
    this._staleBadgeEl = this.shadowRoot.querySelector(".status-badge.stale");
    this._imgEl = this.shadowRoot.querySelector("img.base");
    this._canvasEl = this.shadowRoot.querySelector("canvas.overlay-canvas");
    this._canvasCtx = this._canvasEl?.getContext?.("2d") || null;

    if (!this._wrapperEl || !this._imgEl || !this._canvasEl || !this._canvasCtx) return;
    this._imgEl.onerror = this._handleImageError;
    this._imgEl.onload = () => this._scheduleCanvasRender();
    this._canvasEl.addEventListener("pointermove", this._boundOnCanvasPointerMove);
    this._canvasEl.addEventListener("pointerleave", this._boundOnCanvasPointerLeave);
    this._canvasEl.addEventListener("pointerdown", this._boundOnCanvasPointerDown);
    this._canvasEl.addEventListener("pointerup", this._boundOnCanvasPointerUp);
    this._canvasEl.addEventListener("pointercancel", this._boundOnCanvasPointerCancel);
    if (this._offlineBadgeEl) {
      this._offlineBadgeEl.addEventListener("click", this._boundOnOfflineBadgeClick);
      this._offlineBadgeEl.addEventListener("keydown", this._boundOnOfflineBadgeKeyDown);
    }
    if (this._staleBadgeEl) {
      this._staleBadgeEl.addEventListener("click", this._boundOnStaleBadgeClick);
      this._staleBadgeEl.addEventListener("keydown", this._boundOnStaleBadgeKeyDown);
    }
    this._updateOverlayScale();
    this._scheduleCanvasRender();
    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => {
        this._updateOverlayScale();
        this._scheduleCanvasRender();
      });
      this._resizeObserver.observe(this._wrapperEl);
    }

    this._domReady = true;
  }

  _updateOverlayScale() {
    if (!this._wrapperEl) return;
    const configuredSize = this._config?.overlay_text_size || "auto";
    const width = this._wrapperEl.offsetWidth || 1080;
    let fontPx;

    if (configuredSize !== "auto" && OVERLAY_TEXT_SIZE_PIXELS[configuredSize]) {
      fontPx = OVERLAY_TEXT_SIZE_PIXELS[configuredSize];
    } else {
      const ratio = Math.max(0.45, Math.min(1.2, width / 1080));
      fontPx = Math.max(8, Math.min(16, Math.round(12 * ratio * 10) / 10));
    }
    fontPx = Math.max(7, Math.round(fontPx * this._compactFactor() * 10) / 10);

    if (fontPx === this._overlayFontPx) return;

    if (this._wrapperEl.style && typeof this._wrapperEl.style.setProperty === "function") {
      this._wrapperEl.style.setProperty("--overlay-font-size", `${fontPx}px`);
    } else if (this._wrapperEl.style) {
      this._wrapperEl.style["--overlay-font-size"] = `${fontPx}px`;
    }
    this._overlayFontPx = fontPx;
  }

  _scheduleCanvasRender() {
    if (this._canvasRafId !== null) return;

    if (typeof requestAnimationFrame !== "function") {
      this._renderOverlayCanvas();
      return;
    }

    this._canvasRafId = requestAnimationFrame(() => {
      this._canvasRafId = null;
      this._renderOverlayCanvas();
    });
  }

  _drawLabeledBox(ctx, x, y, text, options) {
    const {
      fillStyle,
      strokeStyle,
      textStyle,
      padX,
      padY,
      fixedWidth,
      dash,
      align = "center",
    } = options;

    const metrics = ctx.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || (this._overlayFontPx * 0.75);
    const descent = metrics.actualBoundingBoxDescent || (this._overlayFontPx * 0.25);
    const textWidth = metrics.width;
    const textHeight = ascent + descent;

    const boxW = fixedWidth ?? (textWidth + (padX * 2));
    let boxX;
    if (align === "right") {
      boxX = x - boxW;
    } else if (align === "left") {
      boxX = x;
    } else {
      boxX = x - (boxW / 2);
    }
    const boxY = y - (textHeight / 2) - padY;
    const boxH = textHeight + (padY * 2);

    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = Math.max(1, this._overlayFontPx * 0.08);
    if (typeof ctx.setLineDash === "function") {
      ctx.setLineDash(Array.isArray(dash) ? dash : []);
    }
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    if (typeof ctx.setLineDash === "function") {
      ctx.setLineDash([]);
    }

    ctx.fillStyle = textStyle;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textX = boxX + (boxW / 2);
    ctx.fillText(text, textX, y);

    return { x: boxX, y: boxY, w: boxW, h: boxH };
  }

  _buildGroupedEntry(key) {
    const sensorOverlay = SENSOR_OVERLAY_BY_KEY.get(key);
    if (sensorOverlay) {
      return {
        key,
        yRel: sensorOverlay.relPos[1],
        text: this._formatSensorOverlayText(sensorOverlay),
        isBinary: false,
        entityId: this._getSensorEntityId(sensorOverlay.key),
      };
    }

    const binaryOverlay = BINARY_OVERLAY_BY_KEY.get(key);
    if (binaryOverlay) {
      const binaryState = this._getBinaryState(binaryOverlay);
      const label = this._resolveBinaryLabel(binaryOverlay);
      return {
        key,
        yRel: binaryOverlay.relPos[1],
        text: binaryState === "unavailable" ? `-- ${label}` : label,
        isBinary: true,
        binaryState,
        entityId: this._getBinaryEntityId(binaryOverlay.key),
      };
    }
    return null;
  }

  _registerClickTarget(target, box) {
    if (!target?.entityId || !target?.key || !box) return;
    this._clickTargets.push({
      key: target.key,
      entityId: target.entityId,
      isBinary: Boolean(target.isBinary),
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
    });
  }

  _findClickTargetAt(x, y) {
    for (let i = this._clickTargets.length - 1; i >= 0; i -= 1) {
      const target = this._clickTargets[i];
      if (x >= target.x && x <= (target.x + target.w) && y >= target.y && y <= (target.y + target.h)) {
        return target;
      }
    }
    return null;
  }

  _pointerToCanvasCoords(ev) {
    if (!ev) return null;
    // Click targets and drawing coordinates are in CSS pixels.
    // Canvas DPR scaling is handled via ctx.setTransform(dpr, ...), so no extra conversion here.
    const rect = this._canvasEl?.getBoundingClientRect?.();
    if (rect && Number.isFinite(rect.left) && Number.isFinite(rect.top)) {
      return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top,
      };
    }
    if (Number.isFinite(ev.offsetX) && Number.isFinite(ev.offsetY)) {
      return { x: ev.offsetX, y: ev.offsetY };
    }
    return null;
  }

  _emitMoreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      detail: { entityId },
      bubbles: true,
      composed: true,
    }));
  }

  _clearActivePress() {
    if (this._activePress?.timer && typeof clearTimeout === "function") {
      clearTimeout(this._activePress.timer);
    }
    this._activePress = null;
  }

  _onCanvasPointerDown(ev) {
    const point = this._pointerToCanvasCoords(ev);
    if (!point) return;
    const target = this._findClickTargetAt(point.x, point.y);
    if (!target) {
      this._clearActivePress();
      return;
    }

    const press = {
      target,
      longPressTriggered: false,
      timer: null,
      pointerId: ev?.pointerId,
    };
    this._activePress = press;
    if (ev?.pointerType !== "touch") {
      ev.preventDefault?.();
    }

    if (typeof setTimeout === "function") {
      press.timer = setTimeout(() => {
        if (this._activePress !== press || press.longPressTriggered) return;
        press.longPressTriggered = true;
        this._executeOverlayAction(press.target, "hold");
      }, this._getLongPressMs());
    }
  }

  _onCanvasPointerUp(ev) {
    const point = this._pointerToCanvasCoords(ev);
    const active = this._activePress;
    this._clearActivePress();
    if (!active || active.longPressTriggered || !point) return;

    const target = this._findClickTargetAt(point.x, point.y);
    if (!target || target.entityId !== active.target.entityId || target.key !== active.target.key) return;
    this._executeOverlayAction(active.target, "tap");
  }

  _onCanvasPointerCancel() {
    this._clearActivePress();
  }

  _onCanvasPointerMove(ev) {
    const point = this._pointerToCanvasCoords(ev);
    if (!point || !this._canvasEl) return;
    const target = this._findClickTargetAt(point.x, point.y);
    this._canvasEl.style.cursor = target ? "pointer" : "default";
  }

  _onCanvasPointerLeave() {
    this._clearActivePress();
    if (this._canvasEl) {
      this._canvasEl.style.cursor = "default";
    }
  }

  _drawGroupedAlignedBoxes(ctx, width, height, entries, anchorXRel, align) {
    if (!entries.length) return;

    const compact = this._compactFactor();
    const padX = Math.max(3, Math.round(this._overlayFontPx * 0.50 * compact));
    const padY = Math.max(2, Math.round(this._overlayFontPx * 0.25 * compact));
    let maxTextWidth = 0;
    for (const entry of entries) {
      maxTextWidth = Math.max(maxTextWidth, ctx.measureText(entry.text).width);
    }
    const fixedWidth = Math.ceil(maxTextWidth + (padX * 2));
    const anchorX = anchorXRel * width;

    for (const entry of entries) {
      const y = entry.yRel * height;
      let fillStyle = "rgba(255,255,255,0.78)";
      let strokeStyle = "rgba(92,92,92,0.45)";
      let textStyle = "rgba(28,28,28,0.95)";
      let dash;

      if (entry.isBinary) {
        if (entry.binaryState === "on") {
          fillStyle = "rgba(170,235,145,0.85)";
          strokeStyle = "rgba(85,150,70,0.85)";
          textStyle = "rgba(33,80,31,0.96)";
        } else if (entry.binaryState === "off") {
          fillStyle = "rgba(235,235,235,0.72)";
          strokeStyle = "rgba(110,110,110,0.55)";
          textStyle = "rgba(50,50,50,0.95)";
        } else {
          fillStyle = "rgba(245,245,245,0.45)";
          strokeStyle = "rgba(120,120,120,0.65)";
          textStyle = "rgba(70,70,70,0.9)";
          dash = [4, 2];
        }
      }

      const box = this._drawLabeledBox(ctx, anchorX, y, entry.text, {
        fillStyle,
        strokeStyle,
        textStyle,
        padX,
        padY,
        fixedWidth,
        dash,
        align,
      });
      this._registerClickTarget({
        key: entry.key,
        entityId: entry.entityId,
        isBinary: entry.isBinary,
      }, box);
    }
  }

  _renderOverlayCanvas() {
    if (!this._canvasEl || !this._canvasCtx || !this._wrapperEl) return;

    const width = this._wrapperEl.clientWidth || this._wrapperEl.offsetWidth || 0;
    const height = this._wrapperEl.clientHeight || this._wrapperEl.offsetHeight || 0;
    if (!width || !height) return;

    const dpr = (typeof window !== "undefined" && window.devicePixelRatio) ? window.devicePixelRatio : 1;
    const canvasWidth = Math.max(1, Math.round(width * dpr));
    const canvasHeight = Math.max(1, Math.round(height * dpr));

    if (this._canvasEl.width !== canvasWidth || this._canvasEl.height !== canvasHeight) {
      this._canvasEl.width = canvasWidth;
      this._canvasEl.height = canvasHeight;
    }

    const ctx = this._canvasCtx;
    this._clickTargets = [];
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.font = `600 ${this._overlayFontPx}px "DejaVu Sans", Arial, sans-serif`;
    ctx.imageSmoothingEnabled = true;

    const groupedDrawnKeys = new Set();
    const solarEntries = SOLAR_GROUP_KEYS
      .map((key) => this._buildGroupedEntry(key))
      .filter((entry) => entry !== null);
    const rightEntries = RIGHT_GROUP_KEYS
      .map((key) => this._buildGroupedEntry(key))
      .filter((entry) => entry !== null);

    this._drawGroupedAlignedBoxes(
      ctx,
      width,
      height,
      solarEntries,
      SOLAR_GROUP_ANCHOR_X_REL,
      "right",
    );
    this._drawGroupedAlignedBoxes(
      ctx,
      width,
      height,
      rightEntries,
      RIGHT_GROUP_ANCHOR_X_REL,
      "left",
    );

    for (const entry of [...solarEntries, ...rightEntries]) {
      groupedDrawnKeys.add(entry.key);
    }

    const compact = this._compactFactor();
    const sensorPadX = Math.max(3, Math.round(this._overlayFontPx * 0.45 * compact));
    const sensorPadY = Math.max(2, Math.round(this._overlayFontPx * 0.28 * compact));
    const binaryPadX = Math.max(3, Math.round(this._overlayFontPx * 0.55 * compact));
    const binaryPadY = Math.max(2, Math.round(this._overlayFontPx * 0.25 * compact));

    for (const overlay of SENSOR_OVERLAYS) {
      if (groupedDrawnKeys.has(overlay.key)) continue;
      const text = this._formatSensorOverlayText(overlay);
      const x = overlay.relPos[0] * width;
      const y = overlay.relPos[1] * height;
      const box = this._drawLabeledBox(ctx, x, y, text, {
        fillStyle: "rgba(255,255,255,0.78)",
        strokeStyle: "rgba(92,92,92,0.45)",
        textStyle: "rgba(28,28,28,0.95)",
        padX: sensorPadX,
        padY: sensorPadY,
      });
      this._registerClickTarget({
        key: overlay.key,
        entityId: this._getSensorEntityId(overlay.key),
        isBinary: false,
      }, box);
    }

    for (const overlay of BINARY_OVERLAYS) {
      if (groupedDrawnKeys.has(overlay.key)) continue;
      const binaryState = this._getBinaryState(overlay);
      const label = this._resolveBinaryLabel(overlay);
      const displayLabel = binaryState === "unavailable" ? `-- ${label}` : label;
      const x = overlay.relPos[0] * width;
      const y = overlay.relPos[1] * height;
      let fillStyle;
      let strokeStyle;
      let textStyle;
      let dash;
      if (binaryState === "on") {
        fillStyle = "rgba(170,235,145,0.85)";
        strokeStyle = "rgba(85,150,70,0.85)";
        textStyle = "rgba(33,80,31,0.96)";
      } else if (binaryState === "off") {
        fillStyle = "rgba(235,235,235,0.72)";
        strokeStyle = "rgba(110,110,110,0.55)";
        textStyle = "rgba(50,50,50,0.95)";
      } else {
        fillStyle = "rgba(245,245,245,0.45)";
        strokeStyle = "rgba(120,120,120,0.65)";
        textStyle = "rgba(70,70,70,0.9)";
        dash = [4, 2];
      }
      const box = this._drawLabeledBox(ctx, x, y, displayLabel, {
        fillStyle,
        strokeStyle,
        textStyle,
        padX: binaryPadX,
        padY: binaryPadY,
        dash,
      });
      this._registerClickTarget({
        key: overlay.key,
        entityId: this._getBinaryEntityId(overlay.key),
        isBinary: true,
      }, box);
    }
  }

  _updateStatusBadges() {
    if (!this._statusLayerEl || !this._offlineBadgeEl || !this._staleBadgeEl) return;

    if (!this._config?.show_status_badges) {
      this._statusLayerEl.hidden = true;
      this._offlineBadgeEl.hidden = true;
      this._staleBadgeEl.hidden = true;
      return;
    }

    const health = this._collectEntityHealth();
    const showOffline = health.offline.length > 0;
    const showStale = health.stale.length > 0;

    this._offlineBadgeEl.hidden = !showOffline;
    this._staleBadgeEl.hidden = !showStale;

    if (showOffline) {
      this._offlineBadgeEl.textContent = `${this._t("offline_badge")}: ${health.offline.length}`;
      this._offlineBadgeEl.title = this._buildStatusBadgeTooltip(health.offline);
      this._offlineBadgeEl.setAttribute("role", "button");
      this._offlineBadgeEl.setAttribute("tabindex", "0");
    } else {
      this._offlineBadgeEl.removeAttribute("title");
      this._offlineBadgeEl.removeAttribute("role");
      this._offlineBadgeEl.removeAttribute("tabindex");
    }
    if (showStale) {
      this._staleBadgeEl.textContent = `${this._t("stale_badge")}: ${health.stale.length}`;
      this._staleBadgeEl.title = this._buildStatusBadgeTooltip(health.stale);
      this._staleBadgeEl.setAttribute("role", "button");
      this._staleBadgeEl.setAttribute("tabindex", "0");
    } else {
      this._staleBadgeEl.removeAttribute("title");
      this._staleBadgeEl.removeAttribute("role");
      this._staleBadgeEl.removeAttribute("tabindex");
    }
    this._statusLayerEl.hidden = !(showOffline || showStale);
  }

  _updateCardDom() {
    if (!this._domReady) return;

    const title = this._config.title || this._t("default_title");
    if (this._cardEl) {
      this._cardEl.header = title;
      this._cardEl.setAttribute("header", title);
    }
    if (this._imgEl) {
      this._imgEl.alt = this._t("image_alt");
    }

    const imageUrl = this._resolveImageUrl();
    if (this._imgEl && this._imgEl.dataset.src !== imageUrl) {
      this._imgEl.dataset.src = imageUrl;
      this._imgEl.src = imageUrl;
    }
    this._updateStatusBadges();
    this._updateOverlayScale();
    this._scheduleCanvasRender();
  }

  _render() {
    if (!this.shadowRoot) return;
    this._ensureCardDom();
    this._updateCardDom();
  }
}

class SolvisHomeAssistantLovelaceCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = undefined;
    this._config = normalizeConfig({});
    this._systemEntityMap = {};
    this._registryLoaded = false;
    this._loadingRegistry = false;
    this._lastError = "";
    this._lastInfo = "";
    this._editorEventsBound = false;
    this._configJsonBuffer = "";

    this._boundOnEditorChange = this._onEditorChange.bind(this);
    this._boundOnEditorClick = this._onEditorClick.bind(this);
    this._boundOnPickerValueChanged = this._onPickerValueChanged.bind(this);
  }

  setConfig(config) {
    this._config = normalizeConfig(config);
    this._configJsonBuffer = "";
    this._lastInfo = "";
    this._render();
    this._ensureRegistryLoaded();
  }

  set hass(hass) {
    const previous = this._hass;
    this._hass = hass;
    const previousLang = resolveLanguage(previous);
    const nextLang = resolveLanguage(hass);
    if (!previous || previousLang !== nextLang) {
      this._render();
    } else {
      this._updatePickerHass();
    }
    this._ensureRegistryLoaded();
  }

  _lang() {
    return resolveLanguage(this._hass);
  }

  _t(key) {
    return t(this._lang(), key);
  }

  _defaultSensorName(key, fallback = "") {
    return localizeSensorName(this._lang(), key, fallback);
  }

  _defaultBinaryName(key, fallback = "") {
    return localizeBinaryName(this._lang(), key, fallback);
  }

  async _ensureRegistryLoaded() {
    if (!this._hass || this._registryLoaded || this._loadingRegistry) return;
    this._loadingRegistry = true;
    this._lastError = "";

    try {
      const entityRegistry = await this._hass.callWS({ type: "config/entity_registry/list" });
      this._systemEntityMap = buildSystemEntityMap(entityRegistry);
      this._registryLoaded = true;
      this._applyDefaultsForCurrentSystem({ onlyMissing: true, setSystemIfMissing: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this._lastError = `${this._t("auto_discovery_failed")}: ${message}`;
    } finally {
      this._loadingRegistry = false;
      this._render();
    }
  }

  _emitConfig(config) {
    this._config = normalizeConfig(config);
    this._lastInfo = "";
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
    this._render();
  }

  _systems() {
    return Object.keys(this._systemEntityMap).sort();
  }

  _applyDefaultsForCurrentSystem({ onlyMissing, setSystemIfMissing, baseConfig, emit = true }) {
    const systems = this._systems();
    const next = normalizeConfig(baseConfig ?? this._config);
    if (!systems.length) {
      return { changed: false, next };
    }

    const currentSystem = next.system_id && this._systemEntityMap[next.system_id]
      ? next.system_id
      : systems[0];

    const sourceMap = this._systemEntityMap[currentSystem] || {};
    let changed = false;

    if (setSystemIfMissing && next.system_id !== currentSystem) {
      next.system_id = currentSystem;
      changed = true;
    }

    for (const key of SENSOR_KEYS) {
      const candidate = sourceMap[key];
      if (!candidate) continue;
      if (!onlyMissing || !next.entities[key]) {
        if (next.entities[key] !== candidate) {
          next.entities[key] = candidate;
          changed = true;
        }
      }
    }

    for (const key of BINARY_KEYS) {
      const candidate = sourceMap[key];
      if (!candidate) continue;
      if (!onlyMissing || !next.binary_entities[key]) {
        if (next.binary_entities[key] !== candidate) {
          next.binary_entities[key] = candidate;
          changed = true;
        }
      }
    }

    if (changed && emit) {
      this._emitConfig(next);
    }
    return { changed, next };
  }

  _onSystemChanged = (ev) => {
    const value = ev.target.value;
    const base = normalizeConfig(this._config);
    base.system_id = value;
    const { next } = this._applyDefaultsForCurrentSystem({
      onlyMissing: false,
      setSystemIfMissing: false,
      baseConfig: base,
      emit: false,
    });
    this._emitConfig(next);
  };

  _onTitleChanged = (ev) => {
    const next = normalizeConfig(this._config);
    next.title = ev.target.value;
    this._emitConfig(next);
  };

  _onImageChanged = (ev) => {
    const next = normalizeConfig(this._config);
    next.image = ev.target.value;
    this._emitConfig(next);
  };

  _onTextSizeChanged = (ev) => {
    const value = String(ev?.target?.value || "auto");
    const next = normalizeConfig(this._config);
    next.overlay_text_size = OVERLAY_TEXT_SIZE_OPTIONS.includes(value) ? value : "auto";
    this._emitConfig(next);
  };

  _onCompactModeChanged = (ev) => {
    const next = normalizeConfig(this._config);
    next.compact_mode = Boolean(ev?.target?.checked);
    this._emitConfig(next);
  };

  _onShowStatusBadgesChanged = (ev) => {
    const next = normalizeConfig(this._config);
    next.show_status_badges = Boolean(ev?.target?.checked);
    this._emitConfig(next);
  };

  _onStaleThresholdChanged = (ev) => {
    const next = normalizeConfig(this._config);
    next.stale_threshold_minutes = clampNumber(
      ev?.target?.value,
      STALE_MINUTES_RANGE.min,
      STALE_MINUTES_RANGE.max,
      next.stale_threshold_minutes,
    );
    this._emitConfig(next);
  };

  _onLongPressChanged = (ev) => {
    const next = normalizeConfig(this._config);
    next.long_press_ms = clampNumber(
      ev?.target?.value,
      LONG_PRESS_RANGE.min,
      LONG_PRESS_RANGE.max,
      next.long_press_ms,
    );
    this._emitConfig(next);
  };

  _onAutofill = () => {
    this._applyDefaultsForCurrentSystem({ onlyMissing: false, setSystemIfMissing: true });
  };

  _onEntityChanged = (group, key, value) => {
    const next = normalizeConfig(this._config);
    if (!next[group] || typeof next[group] !== "object") {
      next[group] = {};
    }
    next[group][key] = value || "";
    this._emitConfig(next);
  };

  _onOverlayActionChanged = (key, field, value) => {
    if (!key || !field) return;
    const next = normalizeConfig(this._config);
    if (!next.overlay_actions[key] || typeof next.overlay_actions[key] !== "object") {
      next.overlay_actions[key] = {};
    }
    if (field === "tap_action" || field === "hold_action") {
      next.overlay_actions[key][field] = OVERLAY_ACTION_TYPES.includes(value) ? value : "more-info";
    } else if (field === "navigation_path") {
      next.overlay_actions[key][field] = String(value || "").trim();
    }
    this._emitConfig(next);
  };

  _onPresetApply = (name) => {
    const presetName = String(name || "standard");
    const next = normalizeConfig(this._config);
    const preset = buildPresetConfig(presetName);
    next.compact_mode = preset.compact_mode;
    next.overlay_text_size = preset.overlay_text_size;
    next.show_status_badges = preset.show_status_badges;
    next.stale_threshold_minutes = preset.stale_threshold_minutes;
    next.long_press_ms = preset.long_press_ms;
    if (preset.overlay_actions) {
      next.overlay_actions = { ...next.overlay_actions, ...preset.overlay_actions };
    }
    this._emitConfig(next);
  };

  _exportConfigToJson = () => JSON.stringify(this._config, null, 2);

  _importConfigFromJson = (jsonText) => {
    const raw = JSON.parse(String(jsonText || ""));
    if (!raw || typeof raw !== "object") {
      throw new Error("invalid_json");
    }
    const next = normalizeConfig(raw);
    if (next.type !== `custom:${CARD_TYPE}`) {
      next.type = `custom:${CARD_TYPE}`;
    }
    this._emitConfig(next);
    return next;
  };

  _onEditorChange(ev) {
    const target = ev?.target;
    if (!target) return;
    const group = target?.dataset?.group;
    const key = target?.dataset?.key;
    const field = target?.dataset?.field;
    if (group && key) {
      if (group === "overlay_actions") {
        this._onOverlayActionChanged(key, field, target?.value || "");
      } else {
        this._onEntityChanged(group, key, target?.value || "");
      }
      return;
    }
    if (typeof target.id !== "string") return;
    switch (target.id) {
      case "system":
        this._onSystemChanged(ev);
        break;
      case "text_size":
        this._onTextSizeChanged(ev);
        break;
      case "title":
        this._onTitleChanged(ev);
        break;
      case "image":
        this._onImageChanged(ev);
        break;
      case "compact_mode":
        this._onCompactModeChanged(ev);
        break;
      case "show_status_badges":
        this._onShowStatusBadgesChanged(ev);
        break;
      case "stale_threshold_minutes":
        this._onStaleThresholdChanged(ev);
        break;
      case "long_press_ms":
        this._onLongPressChanged(ev);
        break;
      case "config_json":
        this._configJsonBuffer = String(target?.value || "");
        break;
      default:
        break;
    }
  }

  _onEditorClick(ev) {
    const target = ev?.target;
    if (!target || typeof target.id !== "string") return;
    if (target.id === "autofill") this._onAutofill();
    if (target.id === "apply_preset") {
      const presetInput = this.shadowRoot?.querySelector?.("#preset");
      const presetName = presetInput?.value || "standard";
      this._onPresetApply(presetName);
      return;
    }
    if (target.id === "export_config") {
      this._configJsonBuffer = this._exportConfigToJson();
      this._lastError = "";
      this._lastInfo = this._t("export_ready");
      this._render();
      return;
    }
    if (target.id === "import_config") {
      try {
        this._lastError = "";
        this._lastInfo = "";
        const textarea = this.shadowRoot?.querySelector?.("#config_json");
        const jsonText = String(textarea?.value || this._configJsonBuffer || "");
        this._configJsonBuffer = jsonText;
        this._importConfigFromJson(jsonText);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this._lastError = `${this._t("import_failed")}: ${message}`;
        this._lastInfo = "";
        this._render();
      }
    }
  }

  _onPickerValueChanged(ev) {
    const target = ev?.target;
    const group = target?.dataset?.group;
    const key = target?.dataset?.key;
    if (!group || !key) return;
    this._onEntityChanged(group, key, ev.detail?.value || "");
  }

  _ensureEditorEventHandlers() {
    if (!this.shadowRoot || this._editorEventsBound) return;
    this.shadowRoot.addEventListener("change", this._boundOnEditorChange);
    this.shadowRoot.addEventListener("click", this._boundOnEditorClick);
    this.shadowRoot.addEventListener("value-changed", this._boundOnPickerValueChanged);
    this._editorEventsBound = true;
  }

  _updatePickerHass() {
    if (!this.shadowRoot || !this._hass) return;
    for (const picker of this.shadowRoot.querySelectorAll("ha-entity-picker")) {
      picker.hass = this._hass;
    }
  }

  _render() {
    if (!this.shadowRoot) return;

    const systems = this._systems();
    const selectedSystem = this._config.system_id || (systems[0] || "");
    const hasSystems = systems.length > 0;
    const safeTitle = escapeAttribute(this._config.title || "");
    const safeImage = escapeAttribute(this._config.image || "");
    const safeError = this._lastError ? escapeHtml(this._lastError) : "";
    const safeInfo = this._lastInfo ? escapeHtml(this._lastInfo) : "";
    const textSize = OVERLAY_TEXT_SIZE_OPTIONS.includes(this._config.overlay_text_size)
      ? this._config.overlay_text_size
      : "auto";
    const compactMode = Boolean(this._config.compact_mode);
    const showStatusBadges = Boolean(this._config.show_status_badges);
    const staleThresholdMinutes = clampNumber(
      this._config.stale_threshold_minutes,
      STALE_MINUTES_RANGE.min,
      STALE_MINUTES_RANGE.max,
      DEFAULT_STALE_MINUTES,
    );
    const longPressMs = clampNumber(
      this._config.long_press_ms,
      LONG_PRESS_RANGE.min,
      LONG_PRESS_RANGE.max,
      DEFAULT_LONG_PRESS_MS,
    );
    const safeConfigJson = escapeHtml(this._configJsonBuffer || "");

    const sensorEntityIds = this._hass?.states
      ? Object.keys(this._hass.states).filter((entityId) => entityId.startsWith("sensor.")).sort()
      : [];
    const binaryEntityIds = this._hass?.states
      ? Object.keys(this._hass.states).filter((entityId) => entityId.startsWith("binary_sensor.")).sort()
      : [];
    const actionRows = ALL_OVERLAYS.map((overlay) => {
      const defaults = resolveOverlayActionConfig(this._config, overlay.key);
      const displayName = overlay.kind === "sensor"
        ? `${overlay.label} - ${this._defaultSensorName(overlay.key, overlay.name)}`
        : `${overlay.key.toUpperCase()} - ${this._defaultBinaryName(overlay.key, overlay.text)}`;
      return `
      <div class="row">
        <div class="label">${escapeHtml(displayName)}</div>
        <div class="grid3">
          <select data-group="overlay_actions" data-key="${overlay.key}" data-field="tap_action">
            <option value="more-info" ${defaults.tap_action === "more-info" ? "selected" : ""}>${escapeHtml(this._t("action_more_info"))}</option>
            <option value="navigate" ${defaults.tap_action === "navigate" ? "selected" : ""}>${escapeHtml(this._t("action_navigate"))}</option>
            <option value="toggle" ${defaults.tap_action === "toggle" ? "selected" : ""}>${escapeHtml(this._t("action_toggle"))}</option>
            <option value="none" ${defaults.tap_action === "none" ? "selected" : ""}>${escapeHtml(this._t("action_none"))}</option>
          </select>
          <select data-group="overlay_actions" data-key="${overlay.key}" data-field="hold_action">
            <option value="more-info" ${defaults.hold_action === "more-info" ? "selected" : ""}>${escapeHtml(this._t("action_more_info"))}</option>
            <option value="navigate" ${defaults.hold_action === "navigate" ? "selected" : ""}>${escapeHtml(this._t("action_navigate"))}</option>
            <option value="toggle" ${defaults.hold_action === "toggle" ? "selected" : ""}>${escapeHtml(this._t("action_toggle"))}</option>
            <option value="none" ${defaults.hold_action === "none" ? "selected" : ""}>${escapeHtml(this._t("action_none"))}</option>
          </select>
          <input type="text" data-group="overlay_actions" data-key="${overlay.key}" data-field="navigation_path" value="${escapeAttribute(defaults.navigation_path || "")}" placeholder="${escapeAttribute(this._t("navigation_path"))}" />
        </div>
      </div>
      `;
    }).join("");
    const sensorRows = SENSOR_OVERLAYS.map((overlay) => `
      <div class="row">
        <div class="label">${escapeHtml(overlay.label)} - ${escapeHtml(this._defaultSensorName(overlay.key, overlay.name))}</div>
        <input type="text" data-group="entities" data-key="${overlay.key}" value="${escapeAttribute(this._config.entities?.[overlay.key] || "")}" placeholder="sensor.entity_id" list="sensor-entity-options" />
        <input type="text" data-group="sensor_labels" data-key="${overlay.key}" value="${escapeAttribute(this._config.sensor_labels?.[overlay.key] || "")}" placeholder="${escapeAttribute(this._t("label_placeholder").replace("{default}", overlay.label))}" />
      </div>
    `).join("");

    const binaryRows = BINARY_OVERLAYS.map((overlay) => `
      <div class="row">
        <div class="label">${escapeHtml(overlay.key.toUpperCase())} - ${escapeHtml(this._defaultBinaryName(overlay.key, overlay.text))}</div>
        <input type="text" data-group="binary_entities" data-key="${overlay.key}" value="${escapeAttribute(this._config.binary_entities?.[overlay.key] || "")}" placeholder="binary_sensor.entity_id" list="binary-entity-options" />
        <input type="text" data-group="binary_labels" data-key="${overlay.key}" value="${escapeAttribute(this._config.binary_labels?.[overlay.key] || "")}" placeholder="${escapeAttribute(this._t("label_placeholder").replace("{default}", this._defaultBinaryName(overlay.key, overlay.text)))}" />
      </div>
    `).join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .editor {
          display: grid;
          gap: 12px;
          padding: 4px 0;
        }

        .block {
          border: 1px solid rgba(120, 120, 120, 0.35);
          border-radius: 8px;
          padding: 12px;
          display: grid;
          gap: 10px;
        }

        .block h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
        }

        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .grid3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1.2fr;
          gap: 6px;
        }

        .field {
          display: grid;
          gap: 6px;
        }

        .field label {
          font-size: 12px;
          color: var(--secondary-text-color);
        }

        input, select, button {
          font: inherit;
        }

        input, select, textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid rgba(120, 120, 120, 0.45);
          background: var(--card-background-color);
          color: var(--primary-text-color);
        }

        textarea {
          min-height: 120px;
          resize: vertical;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12px;
        }

        button {
          justify-self: start;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(120, 120, 120, 0.45);
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
        }

        .row {
          display: grid;
          gap: 6px;
        }

        .label {
          font-size: 12px;
          color: var(--secondary-text-color);
        }

        .notice {
          font-size: 12px;
          color: var(--secondary-text-color);
        }

        .error {
          color: var(--error-color);
          font-size: 12px;
        }

        .info {
          color: var(--secondary-text-color);
          font-size: 12px;
        }

        @media (max-width: 900px) {
          .grid2 {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <div class="editor">
        <div class="block">
          <h3>${escapeHtml(this._t("general"))}</h3>
          <div class="grid2">
            <div class="field">
              <label>${escapeHtml(this._t("title"))}</label>
              <input id="title" type="text" value="${safeTitle}" />
            </div>
            <div class="field">
              <label>${escapeHtml(this._t("base_image_url_optional"))}</label>
              <input id="image" type="text" value="${safeImage}" placeholder="/hacsfiles/.../solvis-home-assistant-lovelace-card-base.jpg" />
            </div>
          </div>
          <div class="field">
            <label>${escapeHtml(this._t("overlay_text_size"))}</label>
            <select id="text_size">
              <option value="auto" ${textSize === "auto" ? "selected" : ""}>${escapeHtml(this._t("size_auto"))}</option>
              <option value="small" ${textSize === "small" ? "selected" : ""}>${escapeHtml(this._t("size_small"))}</option>
              <option value="medium" ${textSize === "medium" ? "selected" : ""}>${escapeHtml(this._t("size_medium"))}</option>
              <option value="large" ${textSize === "large" ? "selected" : ""}>${escapeHtml(this._t("size_large"))}</option>
            </select>
          </div>
          <div class="grid2">
            <div class="field">
              <label>${escapeHtml(this._t("system_auto_detected"))}</label>
              ${hasSystems ? `
                <select id="system">
                  ${systems.map((s) => `<option value="${escapeAttribute(s)}" ${s === selectedSystem ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
                </select>
              ` : `
                <input type="text" value="${escapeAttribute(this._t("no_system_found"))}" disabled />
              `}
            </div>
            <div class="field" style="align-content:end;">
              <button id="autofill" type="button" ${hasSystems ? "" : "disabled"}>${escapeHtml(this._t("load_defaults"))}</button>
            </div>
          </div>
          <div class="notice">${escapeHtml(this._t("entities_notice_before"))}<code>solvis_remote</code>${escapeHtml(this._t("entities_notice_after"))}</div>
          ${this._loadingRegistry ? `<div class="notice">${escapeHtml(this._t("loading_entities"))}</div>` : ""}
          ${safeError ? `<div class="error">${safeError}</div>` : ""}
          ${safeInfo ? `<div class="info">${safeInfo}</div>` : ""}
        </div>

        <div class="block">
          <h3>${escapeHtml(this._t("display_options"))}</h3>
          <div class="grid2">
            <label class="field">
              <span>${escapeHtml(this._t("compact_mode"))}</span>
              <input id="compact_mode" type="checkbox" ${compactMode ? "checked" : ""} />
            </label>
            <label class="field">
              <span>${escapeHtml(this._t("show_status_badges"))}</span>
              <input id="show_status_badges" type="checkbox" ${showStatusBadges ? "checked" : ""} />
            </label>
          </div>
          <div class="grid2">
            <label class="field">
              <span>${escapeHtml(this._t("stale_threshold_minutes"))}</span>
              <input id="stale_threshold_minutes" type="number" min="${STALE_MINUTES_RANGE.min}" max="${STALE_MINUTES_RANGE.max}" value="${escapeAttribute(staleThresholdMinutes)}" />
            </label>
            <label class="field">
              <span>${escapeHtml(this._t("long_press_ms"))}</span>
              <input id="long_press_ms" type="number" min="${LONG_PRESS_RANGE.min}" max="${LONG_PRESS_RANGE.max}" value="${escapeAttribute(longPressMs)}" />
            </label>
          </div>
        </div>

        <div class="block">
          <h3>${escapeHtml(this._t("interaction_presets"))}</h3>
          <div class="grid2">
            <div class="field">
              <label>${escapeHtml(this._t("preset"))}</label>
              <select id="preset">
                <option value="standard">${escapeHtml(this._t("preset_standard"))}</option>
                <option value="compact">${escapeHtml(this._t("preset_compact"))}</option>
                <option value="service">${escapeHtml(this._t("preset_service"))}</option>
              </select>
            </div>
            <div class="field" style="align-content:end;">
              <button id="apply_preset" type="button">${escapeHtml(this._t("apply_preset"))}</button>
            </div>
          </div>
        </div>

        <div class="block">
          <h3>${escapeHtml(this._t("overlay_actions"))}</h3>
          <div class="label">${escapeHtml(this._t("tap_action"))} / ${escapeHtml(this._t("hold_action"))} / ${escapeHtml(this._t("navigation_path"))}</div>
          ${actionRows}
        </div>

        <div class="block">
          <h3>${escapeHtml(this._t("import_export"))}</h3>
          <label class="field">
            <span>${escapeHtml(this._t("config_json"))}</span>
            <textarea id="config_json" placeholder="${escapeAttribute(this._t("config_json_placeholder"))}">${safeConfigJson}</textarea>
          </label>
          <div class="grid2">
            <button id="export_config" type="button">${escapeHtml(this._t("export_config"))}</button>
            <button id="import_config" type="button">${escapeHtml(this._t("import_config"))}</button>
          </div>
        </div>

        <div class="block">
          <h3>${escapeHtml(this._t("sensors_values"))}</h3>
          <datalist id="sensor-entity-options">
            ${sensorEntityIds.map((entityId) => `<option value="${escapeAttribute(entityId)}"></option>`).join("")}
          </datalist>
          ${sensorRows}
        </div>

        <div class="block">
          <h3>${escapeHtml(this._t("binary_sensors_status"))}</h3>
          <datalist id="binary-entity-options">
            ${binaryEntityIds.map((entityId) => `<option value="${escapeAttribute(entityId)}"></option>`).join("")}
          </datalist>
          ${binaryRows}
        </div>
      </div>
    `;

    this._ensureEditorEventHandlers();
  }

  disconnectedCallback() {
    if (this.shadowRoot && this._editorEventsBound) {
      this.shadowRoot.removeEventListener("change", this._boundOnEditorChange);
      this.shadowRoot.removeEventListener("click", this._boundOnEditorClick);
      this.shadowRoot.removeEventListener("value-changed", this._boundOnPickerValueChanged);
      this._editorEventsBound = false;
    }
    this._hass = undefined;
  }
}

if (!customElements.get(CARD_TYPE)) {
  customElements.define(CARD_TYPE, SolvisHomeAssistantLovelaceCard);
}

if (!customElements.get("solvis-home-assistant-lovelace-card-editor")) {
  customElements.define("solvis-home-assistant-lovelace-card-editor", SolvisHomeAssistantLovelaceCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_TYPE)) {
  window.customCards.push({
    type: CARD_TYPE,
    name: CARD_NAME,
    description: "Solvis system diagram card with auto-mapped entities from solvis_remote.",
    icon: CARD_ICON_URL,
    documentationURL: "https://github.com/othorg/solvis-home-assistant-lovelace-card",
    preview: true,
  });
}

console.info(`%c${CARD_NAME} %c${CARD_VERSION}`, "color:#0b75b7;font-weight:700", "color:#666;font-weight:400");

if (typeof process !== "undefined" && process?.env?.SOLVIS_CARD_TEST === "1") {
  globalThis.__SOLVIS_CARD_TEST__ = {
    CARD_TYPE,
    CARD_VERSION,
    CARD_ICON_URL,
    SCRIPT_BASE_PATH,
    DEFAULT_IMAGE_CANDIDATES,
    normalizeConfig,
    buildSystemEntityMap,
    SolvisHomeAssistantLovelaceCard,
    SolvisHomeAssistantLovelaceCardEditor,
  };
}
