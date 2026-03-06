/* Solvis Home Assistant Lovelace Card */

const CARD_TYPE = "solvis-home-assistant-lovelace-card";
const CARD_NAME = "Solvis Home Assistant Lovelace Card";
const CARD_VERSION = "0.1.0";
const CARD_ICON_URL = "/hacsfiles/solvis-home-assistant-lovelace-card/assets/solvis-icon.png";

const DEFAULT_IMAGE_CANDIDATES = [
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
    this._wrapperEl = null;
    this._sensorNodes = new Map();
    this._binaryNodes = new Map();
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
    this._imageIdx = 0;
    this._render();
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
    }
  };

  _getSensorEntityId(key) {
    return this._config.entities?.[key] || "";
  }

  _getBinaryEntityId(key) {
    return this._config.binary_entities?.[key] || "";
  }

  _formatSensorOverlayText(overlay) {
    const entityId = this._getSensorEntityId(overlay.key);
    const stateObj = entityId ? this._hass?.states?.[entityId] : undefined;

    if (!stateObj || isStateUnavailable(stateObj)) {
      return `-- ${overlay.label} ${overlay.name}`;
    }

    const rawValue = stateObj.state;
    const value = formatNumericIfPossible(rawValue);
    const formatted = overlay.format.replace("{v}", value ?? "--");
    return `${formatted} ${overlay.label} ${overlay.name}`;
  }

  _isBinaryOn(overlay) {
    const entityId = this._getBinaryEntityId(overlay.key);
    const stateObj = entityId ? this._hass?.states?.[entityId] : undefined;
    if (!stateObj || isStateUnavailable(stateObj)) return false;
    return String(stateObj.state).toLowerCase() === "on";
  }

  _trackedEntityIds() {
    const ids = new Set();
    for (const entityId of Object.values(this._config.entities || {})) {
      if (entityId) ids.add(entityId);
    }
    for (const entityId of Object.values(this._config.binary_entities || {})) {
      if (entityId) ids.add(entityId);
    }
    return [...ids];
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

        .overlay {
          position: absolute;
          transform: translate(-50%, -50%);
          font-size: clamp(9px, 1.3vw, 18px);
          line-height: 1.2;
          border: 1px solid rgba(92, 92, 92, 0.45);
          border-radius: 2px;
          font-weight: 600;
          white-space: nowrap;
          backdrop-filter: blur(0.5px);
        }

        .sensor {
          background: rgba(255, 255, 255, 0.78);
          color: rgba(28, 28, 28, 0.95);
          padding: 3px 6px;
        }

        .binary {
          padding: 2px 7px;
          color: rgba(50, 50, 50, 0.95);
          background: rgba(235, 235, 235, 0.72);
          border-color: rgba(110, 110, 110, 0.55);
        }

        .binary.on {
          background: rgba(170, 235, 145, 0.85);
          border-color: rgba(85, 150, 70, 0.85);
          color: rgba(33, 80, 31, 0.96);
        }
      </style>
      <ha-card>
        <div class="wrapper">
          <img class="base" alt="Solvis Anlagenschema" />
        </div>
      </ha-card>
    `;

    this._cardEl = this.shadowRoot.querySelector("ha-card");
    this._wrapperEl = this.shadowRoot.querySelector(".wrapper");
    this._imgEl = this.shadowRoot.querySelector("img.base");

    if (!this._wrapperEl || !this._imgEl) return;
    this._imgEl.onerror = this._handleImageError;

    for (const overlay of SENSOR_OVERLAYS) {
      const node = document.createElement("div");
      node.className = "overlay sensor";
      node.style.left = `${overlay.relPos[0] * 100}%`;
      node.style.top = `${overlay.relPos[1] * 100}%`;
      this._wrapperEl.appendChild(node);
      this._sensorNodes.set(overlay.key, node);
    }

    for (const overlay of BINARY_OVERLAYS) {
      const node = document.createElement("div");
      node.className = "overlay binary off";
      node.style.left = `${overlay.relPos[0] * 100}%`;
      node.style.top = `${overlay.relPos[1] * 100}%`;
      node.textContent = overlay.text;
      this._wrapperEl.appendChild(node);
      this._binaryNodes.set(overlay.key, node);
    }

    this._domReady = true;
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

    for (const overlay of SENSOR_OVERLAYS) {
      const node = this._sensorNodes.get(overlay.key);
      if (!node) continue;
      node.textContent = this._formatSensorOverlayText(overlay);
    }

    for (const overlay of BINARY_OVERLAYS) {
      const node = this._binaryNodes.get(overlay.key);
      if (!node) continue;
      const isOn = this._isBinaryOn(overlay);
      node.classList.toggle("on", isOn);
      node.classList.toggle("off", !isOn);
      node.textContent = overlay.text;
    }
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

  _onAutofill = () => {
    this._applyDefaultsForCurrentSystem({ onlyMissing: false, setSystemIfMissing: true });
  };

  _onEntityChanged = (group, key, value) => {
    const next = normalizeConfig(this._config);
    if (group === "entities") {
      next.entities[key] = value || "";
    } else {
      next.binary_entities[key] = value || "";
    }
    this._emitConfig(next);
  };

  _onEditorInput(ev) {
    const target = ev?.target;
    if (!target || typeof target.id !== "string") return;
    if (target.id === "title") this._onTitleChanged(ev);
    if (target.id === "image") this._onImageChanged(ev);
  }

  _onEditorChange(ev) {
    const target = ev?.target;
    if (!target || typeof target.id !== "string") return;
    if (target.id === "system") this._onSystemChanged(ev);
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

    const sensorRows = SENSOR_OVERLAYS.map((overlay) => `
      <div class="row">
        <div class="label">${escapeHtml(overlay.label)} - ${escapeHtml(overlay.name)}</div>
        <ha-entity-picker data-group="entities" data-key="${overlay.key}"></ha-entity-picker>
      </div>
    `).join("");

    const binaryRows = BINARY_OVERLAYS.map((overlay) => `
      <div class="row">
        <div class="label">${escapeHtml(overlay.key.toUpperCase())} - ${escapeHtml(overlay.text)}</div>
        <ha-entity-picker data-group="binary_entities" data-key="${overlay.key}"></ha-entity-picker>
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
          ${sensorRows}
        </div>

        <div class="block">
          <h3>Binärsensoren (Status)</h3>
          ${binaryRows}
        </div>
      </div>
    `;

    this._ensureEditorEventHandlers();

    for (const picker of this.shadowRoot.querySelectorAll("ha-entity-picker")) {
      const group = picker.dataset.group;
      const key = picker.dataset.key;
      const includeDomains = group === "entities" ? ["sensor"] : ["binary_sensor"];
      const value = group === "entities"
        ? (this._config.entities?.[key] || "")
        : (this._config.binary_entities?.[key] || "");

      picker.hass = this._hass;
      picker.includeDomains = includeDomains;
      picker.value = value;
      picker.allowCustomEntity = true;
    }
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
    normalizeConfig,
    buildSystemEntityMap,
    SolvisHomeAssistantLovelaceCard,
    SolvisHomeAssistantLovelaceCardEditor,
  };
}
