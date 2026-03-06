/* Solvis Home Assistant Lovelace Card */

const CARD_TYPE = "solvis-home-assistant-lovelace-card";
const CARD_NAME = "Solvis Home Assistant Lovelace Card";
const CARD_VERSION = "0.1.3";

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
const OVERLAY_TEXT_SIZE_OPTIONS = ["auto", "small", "medium", "large"];
const OVERLAY_TEXT_SIZE_PIXELS = {
  small: 10,
  medium: 12,
  large: 14,
};

function normalizeConfig(config) {
  const {
    entities,
    binary_entities: binaryEntities,
    ...rest
  } = config || {};
  return {
    type: `custom:${CARD_TYPE}`,
    title: "Anlagenschema",
    image: "",
    system_id: "",
    overlay_text_size: "auto",
    sensor_labels: {},
    binary_labels: {},
    ...rest,
    entities: { ...(entities || {}) },
    binary_entities: { ...(binaryEntities || {}) },
  };
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
    this._overlayFontPx = 12;
    this._cachedTrackedEntityIds = null;
    this._resizeObserver = null;
  }

  static getStubConfig() {
    return {
      type: `custom:${CARD_TYPE}`,
      title: "Anlagenschema",
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
    if (!previous || this._hasRelevantStateChanges(previous, hass)) {
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
    return label || overlay.text;
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

  _isBinaryOn(overlay) {
    const entityId = this._getBinaryEntityId(overlay.key);
    const stateObj = entityId ? this._hass?.states?.[entityId] : undefined;
    if (!stateObj || isStateUnavailable(stateObj)) return false;
    return String(stateObj.state).toLowerCase() === "on";
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
    for (const entityId of this._trackedEntityIds()) {
      const before = previousHass?.states?.[entityId]?.state ?? null;
      const after = nextHass?.states?.[entityId]?.state ?? null;
      if (before !== after) return true;
    }
    return false;
  }

  disconnectedCallback() {
    if (this._imgEl) this._imgEl.onerror = null;
    if (this._resizeObserver && this._wrapperEl) {
      this._resizeObserver.unobserve(this._wrapperEl);
    }
    this._resizeObserver = null;
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
          pointer-events: none;
        }
      </style>
      <ha-card>
        <div class="wrapper">
          <img class="base" alt="Solvis Anlagenschema" />
          <canvas class="overlay-canvas"></canvas>
        </div>
      </ha-card>
    `;

    this._cardEl = this.shadowRoot.querySelector("ha-card");
    this._wrapperEl = this.shadowRoot.querySelector(".wrapper");
    this._imgEl = this.shadowRoot.querySelector("img.base");
    this._canvasEl = this.shadowRoot.querySelector("canvas.overlay-canvas");
    this._canvasCtx = this._canvasEl?.getContext?.("2d") || null;

    if (!this._wrapperEl || !this._imgEl || !this._canvasEl || !this._canvasCtx) return;
    this._imgEl.onerror = this._handleImageError;
    this._imgEl.onload = () => this._renderOverlayCanvas();
    this._updateOverlayScale();
    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => this._updateOverlayScale());
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

    if (this._wrapperEl.style && typeof this._wrapperEl.style.setProperty === "function") {
      this._wrapperEl.style.setProperty("--overlay-font-size", `${fontPx}px`);
    } else if (this._wrapperEl.style) {
      this._wrapperEl.style["--overlay-font-size"] = `${fontPx}px`;
    }
    this._overlayFontPx = fontPx;
    this._renderOverlayCanvas();
  }

  _drawLabeledBox(ctx, x, y, text, options) {
    const {
      fillStyle,
      strokeStyle,
      textStyle,
      padX,
      padY,
    } = options;

    const metrics = ctx.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || (this._overlayFontPx * 0.75);
    const descent = metrics.actualBoundingBoxDescent || (this._overlayFontPx * 0.25);
    const textWidth = metrics.width;
    const textHeight = ascent + descent;

    const boxX = x - (textWidth / 2) - padX;
    const boxY = y - (textHeight / 2) - padY;
    const boxW = textWidth + (padX * 2);
    const boxH = textHeight + (padY * 2);

    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = Math.max(1, this._overlayFontPx * 0.08);
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = textStyle;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
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
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.font = `600 ${this._overlayFontPx}px "DejaVu Sans", Arial, sans-serif`;
    ctx.imageSmoothingEnabled = true;

    const sensorPadX = Math.max(3, Math.round(this._overlayFontPx * 0.45));
    const sensorPadY = Math.max(2, Math.round(this._overlayFontPx * 0.28));
    const binaryPadX = Math.max(4, Math.round(this._overlayFontPx * 0.55));
    const binaryPadY = Math.max(2, Math.round(this._overlayFontPx * 0.25));

    for (const overlay of SENSOR_OVERLAYS) {
      const text = this._formatSensorOverlayText(overlay);
      const x = overlay.relPos[0] * width;
      const y = overlay.relPos[1] * height;
      this._drawLabeledBox(ctx, x, y, text, {
        fillStyle: "rgba(255,255,255,0.78)",
        strokeStyle: "rgba(92,92,92,0.45)",
        textStyle: "rgba(28,28,28,0.95)",
        padX: sensorPadX,
        padY: sensorPadY,
      });
    }

    for (const overlay of BINARY_OVERLAYS) {
      const isOn = this._isBinaryOn(overlay);
      const label = this._resolveBinaryLabel(overlay);
      const x = overlay.relPos[0] * width;
      const y = overlay.relPos[1] * height;
      this._drawLabeledBox(ctx, x, y, label, {
        fillStyle: isOn ? "rgba(170,235,145,0.85)" : "rgba(235,235,235,0.72)",
        strokeStyle: isOn ? "rgba(85,150,70,0.85)" : "rgba(110,110,110,0.55)",
        textStyle: isOn ? "rgba(33,80,31,0.96)" : "rgba(50,50,50,0.95)",
        padX: binaryPadX,
        padY: binaryPadY,
      });
    }
  }

  _updateCardDom() {
    if (!this._domReady) return;

    const title = this._config.title || "Anlagenschema";
    if (this._cardEl) {
      this._cardEl.header = title;
      this._cardEl.setAttribute("header", title);
    }

    const imageUrl = this._resolveImageUrl();
    if (this._imgEl && this._imgEl.dataset.src !== imageUrl) {
      this._imgEl.dataset.src = imageUrl;
      this._imgEl.src = imageUrl;
    }
    this._updateOverlayScale();
    this._renderOverlayCanvas();
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
    this._editorEventsBound = false;

    this._boundOnEditorInput = this._onEditorInput.bind(this);
    this._boundOnEditorChange = this._onEditorChange.bind(this);
    this._boundOnEditorClick = this._onEditorClick.bind(this);
    this._boundOnPickerValueChanged = this._onPickerValueChanged.bind(this);
  }

  setConfig(config) {
    this._config = normalizeConfig(config);
    this._render();
    this._ensureRegistryLoaded();
  }

  set hass(hass) {
    const previous = this._hass;
    this._hass = hass;
    if (!previous) {
      this._render();
    } else {
      this._updatePickerHass();
    }
    this._ensureRegistryLoaded();
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
      this._lastError = `Auto-Erkennung fehlgeschlagen: ${message}`;
    } finally {
      this._loadingRegistry = false;
      this._render();
    }
  }

  _emitConfig(config) {
    this._config = normalizeConfig(config);
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

  _onEditorInput(ev) {
    const target = ev?.target;
    if (!target) return;
    if (typeof target.id === "string") {
      if (target.id === "title") this._onTitleChanged(ev);
      if (target.id === "image") this._onImageChanged(ev);
    }
    const group = target?.dataset?.group;
    const key = target?.dataset?.key;
    if (group && key && target.tagName === "INPUT") {
      this._onEntityChanged(group, key, target.value || "");
    }
  }

  _onEditorChange(ev) {
    const target = ev?.target;
    if (!target || typeof target.id !== "string") return;
    if (target.id === "system") this._onSystemChanged(ev);
    if (target.id === "text_size") this._onTextSizeChanged(ev);
  }

  _onEditorClick(ev) {
    const target = ev?.target;
    if (!target || typeof target.id !== "string") return;
    if (target.id === "autofill") this._onAutofill();
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
    this.shadowRoot.addEventListener("input", this._boundOnEditorInput);
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
    const textSize = OVERLAY_TEXT_SIZE_OPTIONS.includes(this._config.overlay_text_size)
      ? this._config.overlay_text_size
      : "auto";

    const sensorEntityIds = this._hass?.states
      ? Object.keys(this._hass.states).filter((entityId) => entityId.startsWith("sensor.")).sort()
      : [];
    const binaryEntityIds = this._hass?.states
      ? Object.keys(this._hass.states).filter((entityId) => entityId.startsWith("binary_sensor.")).sort()
      : [];

    const sensorRows = SENSOR_OVERLAYS.map((overlay) => `
      <div class="row">
        <div class="label">${escapeHtml(overlay.label)} - ${escapeHtml(overlay.name)}</div>
        <input type="text" data-group="entities" data-key="${overlay.key}" value="${escapeAttribute(this._config.entities?.[overlay.key] || "")}" placeholder="sensor.entity_id" list="sensor-entity-options" />
        <input type="text" data-group="sensor_labels" data-key="${overlay.key}" value="${escapeAttribute(this._config.sensor_labels?.[overlay.key] || "")}" placeholder="Bezeichner (Standard: ${escapeAttribute(overlay.label)})" />
      </div>
    `).join("");

    const binaryRows = BINARY_OVERLAYS.map((overlay) => `
      <div class="row">
        <div class="label">${escapeHtml(overlay.key.toUpperCase())} - ${escapeHtml(overlay.text)}</div>
        <input type="text" data-group="binary_entities" data-key="${overlay.key}" value="${escapeAttribute(this._config.binary_entities?.[overlay.key] || "")}" placeholder="binary_sensor.entity_id" list="binary-entity-options" />
        <input type="text" data-group="binary_labels" data-key="${overlay.key}" value="${escapeAttribute(this._config.binary_labels?.[overlay.key] || "")}" placeholder="Bezeichner (Standard: ${escapeAttribute(overlay.text)})" />
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

        input, select {
          width: 100%;
          box-sizing: border-box;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid rgba(120, 120, 120, 0.45);
          background: var(--card-background-color);
          color: var(--primary-text-color);
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

        @media (max-width: 900px) {
          .grid2 {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <div class="editor">
        <div class="block">
          <h3>Allgemein</h3>
          <div class="grid2">
            <div class="field">
              <label>Titel</label>
              <input id="title" type="text" value="${safeTitle}" />
            </div>
            <div class="field">
              <label>Basisbild URL (optional)</label>
              <input id="image" type="text" value="${safeImage}" placeholder="/hacsfiles/.../solvis-home-assistant-lovelace-card-base.jpg" />
            </div>
          </div>
          <div class="field">
            <label>Textgroesse Overlay</label>
            <select id="text_size">
              <option value="auto" ${textSize === "auto" ? "selected" : ""}>Auto</option>
              <option value="small" ${textSize === "small" ? "selected" : ""}>Klein</option>
              <option value="medium" ${textSize === "medium" ? "selected" : ""}>Mittel</option>
              <option value="large" ${textSize === "large" ? "selected" : ""}>Gross</option>
            </select>
          </div>
          <div class="grid2">
            <div class="field">
              <label>Solvis Anlage (auto erkannt)</label>
              ${hasSystems ? `
                <select id="system">
                  ${systems.map((s) => `<option value="${escapeAttribute(s)}" ${s === selectedSystem ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
                </select>
              ` : `
                <input type="text" value="Keine Solvis Anlage automatisch gefunden" disabled />
              `}
            </div>
            <div class="field" style="align-content:end;">
              <button id="autofill" type="button" ${hasSystems ? "" : "disabled"}>Default-Werte aus Solvis laden</button>
            </div>
          </div>
          <div class="notice">Entitäten werden automatisch aus <code>solvis_remote</code> vorbelegt und können unten einzeln überschrieben werden.</div>
          ${this._loadingRegistry ? '<div class="notice">Solvis Entitäten werden geladen...</div>' : ""}
          ${safeError ? `<div class="error">${safeError}</div>` : ""}
        </div>

        <div class="block">
          <h3>Sensoren (Werte)</h3>
          <datalist id="sensor-entity-options">
            ${sensorEntityIds.map((entityId) => `<option value="${escapeAttribute(entityId)}"></option>`).join("")}
          </datalist>
          ${sensorRows}
        </div>

        <div class="block">
          <h3>Binärsensoren (Status)</h3>
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
      this.shadowRoot.removeEventListener("input", this._boundOnEditorInput);
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
