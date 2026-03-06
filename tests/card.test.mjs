import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CARD_SOURCE = path.resolve(__dirname, "../dist/solvis-home-assistant-lovelace-card.js");

function makeClassList() {
  const classes = new Set();
  return {
    add(name) {
      classes.add(name);
    },
    remove(name) {
      classes.delete(name);
    },
    toggle(name, force) {
      if (force === undefined) {
        if (classes.has(name)) {
          classes.delete(name);
          return false;
        }
        classes.add(name);
        return true;
      }
      if (force) classes.add(name);
      else classes.delete(name);
      return Boolean(force);
    },
    contains(name) {
      return classes.has(name);
    },
  };
}

class FakeEventTarget {
  constructor() {
    this._listeners = new Map();
  }

  addEventListener(type, callback) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }
    this._listeners.get(type).push(callback);
  }

  removeEventListener(type, callback) {
    const list = this._listeners.get(type);
    if (!list) return;
    this._listeners.set(
      type,
      list.filter((cb) => cb !== callback),
    );
  }

  dispatchEvent(event) {
    if (!event || !event.type) return true;
    if (!event.target) {
      event.target = this;
    }
    const list = this._listeners.get(event.type) || [];
    for (const callback of list) {
      callback.call(this, event);
    }
    return true;
  }
}

function makeNode(tagName = "div") {
  const node = new FakeEventTarget();
  node.tagName = String(tagName).toUpperCase();
  node.dataset = {};
  node.style = {};
  node.classList = makeClassList();
  node.children = [];
  node.textContent = "";
  node.value = "";
  node.id = "";
  node.appendChild = (child) => {
    node.children.push(child);
    return child;
  };
  node.setAttribute = (name, value) => {
    node[name] = String(value);
    if (name === "id") node.id = String(value);
  };
  if (node.tagName === "CANVAS") {
    node.width = 0;
    node.height = 0;
    node.getContext = () => ({
      setTransform() {},
      clearRect() {},
      fillRect() {},
      strokeRect() {},
      fillText() {},
      measureText(text) {
        return {
          width: String(text ?? "").length * 6,
          actualBoundingBoxAscent: 8,
          actualBoundingBoxDescent: 2,
        };
      },
      font: "",
      lineWidth: 1,
      fillStyle: "",
      strokeStyle: "",
      textAlign: "center",
      textBaseline: "middle",
      imageSmoothingEnabled: true,
    });
  }
  return node;
}

class FakeShadowRoot extends FakeEventTarget {
  constructor() {
    super();
    this._html = "";
    this._nodes = {};
    this._pickers = [];
  }

  set innerHTML(html) {
    this._html = String(html);
    this._nodes = {};
    this._pickers = [];

    if (this._html.includes("<ha-card")) {
      this._nodes["ha-card"] = makeNode("ha-card");
    }
    if (this._html.includes('class="wrapper"')) {
      const wrapper = makeNode("div");
      wrapper.offsetHeight = 0;
      this._nodes[".wrapper"] = wrapper;
      if (this._nodes["ha-card"]) {
        this._nodes["ha-card"].appendChild(wrapper);
      }
    }
    if (this._html.includes('class="base"')) {
      const img = makeNode("img");
      img.dataset = {};
      img.src = "";
      img.onerror = null;
      img.onload = null;
      this._nodes["img.base"] = img;
      if (this._nodes[".wrapper"]) {
        this._nodes[".wrapper"].appendChild(img);
      }
    }
    if (this._html.includes('class="overlay-canvas"')) {
      const canvas = makeNode("canvas");
      this._nodes["canvas.overlay-canvas"] = canvas;
      if (this._nodes[".wrapper"]) {
        this._nodes[".wrapper"].appendChild(canvas);
      }
    }

    const pickerRegex = /<ha-entity-picker[^>]*data-group="([^"]+)"[^>]*data-key="([^"]+)"[^>]*>/g;
    let match;
    while ((match = pickerRegex.exec(this._html)) !== null) {
      const picker = makeNode("ha-entity-picker");
      picker.dataset = { group: match[1], key: match[2] };
      picker.includeDomains = [];
      picker.allowCustomEntity = false;
      picker.hass = undefined;
      this._pickers.push(picker);
    }
  }

  get innerHTML() {
    return this._html;
  }

  querySelector(selector) {
    return this._nodes[selector] || null;
  }

  querySelectorAll(selector) {
    if (selector === "ha-entity-picker") return this._pickers;
    return [];
  }
}

class FakeHTMLElement extends FakeEventTarget {
  constructor() {
    super();
    this.shadowRoot = null;
    this.offsetWidth = 0;
  }

  attachShadow() {
    this.shadowRoot = new FakeShadowRoot();
    return this.shadowRoot;
  }

  getBoundingClientRect() {
    return { width: this.offsetWidth, height: 0 };
  }
}

class FakeCustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail;
    this.bubbles = Boolean(init.bubbles);
    this.composed = Boolean(init.composed);
    this.target = undefined;
  }
}

function loadCardRuntime(options = {}) {
  const { scriptSrc = "" } = options;
  const registry = new Map();
  const customElements = {
    define(name, klass) {
      registry.set(name, klass);
    },
    get(name) {
      return registry.get(name);
    },
  };

  const context = {
    console,
    process: { env: { SOLVIS_CARD_TEST: "1" } },
    window: { customCards: [] },
    document: {
      createElement(tagName) {
        return makeNode(tagName);
      },
      querySelectorAll(selector) {
        if (selector !== "script[src]" || !scriptSrc) return [];
        return [{
          src: scriptSrc,
          getAttribute(name) {
            if (name === "src") return scriptSrc;
            return null;
          },
        }];
      },
    },
    customElements,
    HTMLElement: FakeHTMLElement,
    CustomEvent: FakeCustomEvent,
    Map,
    Set,
    Object,
    String,
    Number,
    Boolean,
    JSON,
    Math,
    Array,
    Error,
    RegExp,
    Date,
  };

  context.globalThis = context;

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(CARD_SOURCE, "utf8"), context, {
    filename: "solvis-home-assistant-lovelace-card.js",
  });

  return context.__SOLVIS_CARD_TEST__;
}

test("card re-renders only on relevant mapped entity changes", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, SolvisHomeAssistantLovelaceCard } = runtime;

  const card = new SolvisHomeAssistantLovelaceCard();
  let renderCalls = 0;
  card._render = () => {
    renderCalls += 1;
  };

  card.setConfig({
    type: `custom:${CARD_TYPE}`,
    entities: { s10: "sensor.solvis_temp" },
    binary_entities: { a1: "binary_sensor.solvis_solarpump" },
  });
  assert.equal(renderCalls, 1);

  card.hass = {
    states: {
      "sensor.solvis_temp": { state: "12.0" },
      "binary_sensor.solvis_solarpump": { state: "off" },
    },
  };
  assert.equal(renderCalls, 2);

  card.hass = {
    states: {
      "sensor.solvis_temp": { state: "12.0" },
      "binary_sensor.solvis_solarpump": { state: "off" },
      "sensor.other": { state: "999" },
    },
  };
  assert.equal(renderCalls, 2, "unrelated state must not trigger re-render");

  card.hass = {
    states: {
      "sensor.solvis_temp": { state: "13.0" },
      "binary_sensor.solvis_solarpump": { state: "off" },
    },
  };
  assert.equal(renderCalls, 3, "mapped state change must trigger re-render");
});

test("editor hass setter avoids full render churn", () => {
  const runtime = loadCardRuntime();
  const { SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  let renderCalls = 0;
  let ensureCalls = 0;
  let updatePickerCalls = 0;

  editor._render = () => {
    renderCalls += 1;
  };
  editor._ensureRegistryLoaded = () => {
    ensureCalls += 1;
  };
  editor._updatePickerHass = () => {
    updatePickerCalls += 1;
  };

  editor.hass = { states: {} };
  assert.equal(renderCalls, 1);
  assert.equal(ensureCalls, 1);
  assert.equal(updatePickerCalls, 0);

  editor.hass = { states: { "sensor.foo": { state: "1" } } };
  assert.equal(renderCalls, 1, "subsequent hass updates should not force full render");
  assert.equal(ensureCalls, 2);
  assert.equal(updatePickerCalls, 1, "picker hass references should still update");
});

test("system change emits one config update with defaults applied", () => {
  const runtime = loadCardRuntime();
  const {
    CARD_TYPE,
    normalizeConfig,
    SolvisHomeAssistantLovelaceCardEditor,
  } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });
  editor._systemEntityMap = {
    "3412": {
      s10: "sensor.solvis_3412_s10",
      a1: "binary_sensor.solvis_3412_a1",
    },
    "7777": {
      s10: "sensor.solvis_7777_s10",
      a1: "binary_sensor.solvis_7777_a1",
    },
  };

  let emitCalls = 0;
  let emittedConfig;
  editor._emitConfig = (config) => {
    emitCalls += 1;
    emittedConfig = config;
  };

  editor._onSystemChanged({ target: { value: "7777" } });

  assert.equal(emitCalls, 1);
  assert.equal(emittedConfig.system_id, "7777");
  assert.equal(emittedConfig.entities.s10, "sensor.solvis_7777_s10");
  assert.equal(emittedConfig.binary_entities.a1, "binary_sensor.solvis_7777_a1");
});

test("buildSystemEntityMap maps solvis keys via unique_id suffix", () => {
  const runtime = loadCardRuntime();
  const { buildSystemEntityMap } = runtime;

  const map = buildSystemEntityMap([
    {
      platform: "solvis_remote",
      unique_id: "3412_s17",
      entity_id: "sensor.solvis_solaranlage_durchfluss_solar",
    },
    {
      platform: "solvis_remote",
      unique_id: "3412_a1",
      entity_id: "binary_sensor.solvis_solaranlage_solarpumpe",
    },
    {
      platform: "other_platform",
      unique_id: "3412_s10",
      entity_id: "sensor.ignore_me",
    },
  ]);

  assert.equal(
    JSON.stringify(map),
    JSON.stringify({
      "3412": {
        s17: "sensor.solvis_solaranlage_durchfluss_solar",
        a1: "binary_sensor.solvis_solaranlage_solarpumpe",
      },
    }),
  );
});

test("delegated picker value-changed updates corresponding mapping", () => {
  const runtime = loadCardRuntime();
  const {
    CARD_TYPE,
    normalizeConfig,
    SolvisHomeAssistantLovelaceCardEditor,
  } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });

  let emittedConfig;
  editor._emitConfig = (config) => {
    emittedConfig = config;
  };

  editor._onPickerValueChanged({
    target: { dataset: { group: "entities", key: "s17" } },
    detail: { value: "sensor.solvis_solaranlage_durchfluss_solar" },
  });

  assert.equal(
    emittedConfig.entities.s17,
    "sensor.solvis_solaranlage_durchfluss_solar",
  );
});

test("detects script base path for icon and image candidates", () => {
  const runtime = loadCardRuntime({
    scriptSrc: "/hacsfiles/solvis-home-assistant-lovelace-card/solvis-home-assistant-lovelace-card.js?v=1",
  });

  assert.equal(
    runtime.SCRIPT_BASE_PATH,
    "/hacsfiles/solvis-home-assistant-lovelace-card",
  );
  assert.equal(
    runtime.CARD_ICON_URL,
    "/hacsfiles/solvis-home-assistant-lovelace-card/solvis-icon.png",
  );
  assert.equal(
    runtime.DEFAULT_IMAGE_CANDIDATES[0],
    "/hacsfiles/solvis-home-assistant-lovelace-card/solvis-home-assistant-lovelace-card-base.jpg",
  );
});

test("tracked entity ids are cached and invalidated on setConfig", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, SolvisHomeAssistantLovelaceCard } = runtime;

  const card = new SolvisHomeAssistantLovelaceCard();
  card.setConfig({
    type: `custom:${CARD_TYPE}`,
    entities: { s10: "sensor.one" },
    binary_entities: { a1: "binary_sensor.one" },
  });

  const first = card._trackedEntityIds();
  const second = card._trackedEntityIds();
  assert.strictEqual(first, second, "expected cached array reference");

  card.setConfig({
    type: `custom:${CARD_TYPE}`,
    entities: { s10: "sensor.two" },
    binary_entities: { a1: "binary_sensor.two" },
  });

  const third = card._trackedEntityIds();
  assert.notStrictEqual(third, first, "cache must be invalidated by setConfig");
  assert.equal(
    JSON.stringify(third.sort()),
    JSON.stringify(["binary_sensor.two", "sensor.two"].sort()),
  );
});

test("card and package versions are in sync", () => {
  const runtime = loadCardRuntime();
  const pkg = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"),
  );
  assert.equal(runtime.CARD_VERSION, pkg.version);
});

test("editor renders manual input fallback when ha-entity-picker is unavailable", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });
  editor._render();

  const html = editor.shadowRoot.innerHTML;
  assert.match(html, /placeholder="sensor\.entity_id"/);
  assert.match(html, /placeholder="binary_sensor\.entity_id"/);
});

test("manual fallback entity input updates mapping on change", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });

  let emittedConfig;
  editor._emitConfig = (config) => {
    emittedConfig = config;
  };

  editor._onEditorChange({
    target: {
      tagName: "INPUT",
      dataset: { group: "entities", key: "s10" },
      value: "sensor.custom_temp",
      id: "",
    },
  });

  assert.equal(emittedConfig.entities.s10, "sensor.custom_temp");
});

test("manual fallback entity input does not emit on each input keystroke", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });

  let emitCalls = 0;
  editor._emitConfig = () => {
    emitCalls += 1;
  };

  editor._onEditorInput({
    target: {
      tagName: "INPUT",
      dataset: { group: "sensor_labels", key: "s10" },
      value: "Aussen",
      id: "",
    },
  });

  assert.equal(emitCalls, 0);
});

test("title input does not emit config on each keystroke", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });

  let emitCalls = 0;
  editor._emitConfig = () => {
    emitCalls += 1;
  };

  editor._onEditorInput({
    target: {
      tagName: "INPUT",
      id: "title",
      dataset: {},
      value: "Anlage",
    },
  });

  assert.equal(emitCalls, 0);
});

test("title change updates config exactly once", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });

  let emittedConfig;
  let emitCalls = 0;
  editor._emitConfig = (config) => {
    emitCalls += 1;
    emittedConfig = config;
  };

  editor._onEditorChange({
    target: {
      id: "title",
      value: "Mein Schema",
    },
  });

  assert.equal(emitCalls, 1);
  assert.equal(emittedConfig.title, "Mein Schema");
});

test("overlay text size setting applies fixed font size", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCard } = runtime;

  const card = new SolvisHomeAssistantLovelaceCard();
  const style = {
    values: {},
    setProperty(name, value) {
      this.values[name] = value;
    },
  };

  card._wrapperEl = {
    offsetWidth: 200,
    style,
  };

  card._config = normalizeConfig({
    type: `custom:${CARD_TYPE}`,
    overlay_text_size: "large",
  });
  card._updateOverlayScale();
  assert.equal(style.values["--overlay-font-size"], "14px");
});

test("text size change from editor updates config", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });

  let emittedConfig;
  editor._emitConfig = (config) => {
    emittedConfig = config;
  };

  editor._onTextSizeChanged({ target: { value: "small" } });
  assert.equal(emittedConfig.overlay_text_size, "small");

  editor._onTextSizeChanged({ target: { value: "invalid" } });
  assert.equal(emittedConfig.overlay_text_size, "auto");
});

test("sensor label override is applied in overlay text", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, SolvisHomeAssistantLovelaceCard } = runtime;

  const card = new SolvisHomeAssistantLovelaceCard();
  card.setConfig({
    type: `custom:${CARD_TYPE}`,
    entities: { s10: "sensor.solvis_temp" },
    sensor_labels: { s10: "AT" },
  });
  card.hass = {
    states: {
      "sensor.solvis_temp": { state: "12.3" },
    },
  };

  const text = card._formatSensorOverlayText({ key: "s10", format: "{v}°C", label: "S10" });
  assert.equal(text, "12.3°C AT");
});

test("card uses english default title for non-german locales", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, SolvisHomeAssistantLovelaceCard } = runtime;

  const card = new SolvisHomeAssistantLovelaceCard();
  card.setConfig({ type: `custom:${CARD_TYPE}` });
  card.hass = {
    locale: { language: "en-US" },
    states: {},
  };

  assert.equal(card._cardEl?.header, "System diagram");
});

test("card uses german default title for german locales", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, SolvisHomeAssistantLovelaceCard } = runtime;

  const card = new SolvisHomeAssistantLovelaceCard();
  card.setConfig({ type: `custom:${CARD_TYPE}` });
  card.hass = {
    locale: { language: "de-DE" },
    states: {},
  };

  assert.equal(card._cardEl?.header, "Anlagenschema");
});

test("editor renders english labels for non-german locales", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });
  editor._hass = {
    locale: { language: "en-GB" },
    states: {},
  };
  editor._render();

  const html = editor.shadowRoot.innerHTML;
  assert.match(html, /<h3>General<\/h3>/);
  assert.match(html, /<h3>Sensors \(values\)<\/h3>/);
  assert.match(html, /<h3>Binary sensors \(status\)<\/h3>/);
  assert.match(html, /S10 - Outdoor temperature/);
  assert.match(html, /A12 - Reheating/);
});

test("editor renders german labels for german locales", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });
  editor._hass = {
    locale: { language: "de-DE" },
    states: {},
  };
  editor._render();

  const html = editor.shadowRoot.innerHTML;
  assert.match(html, /<h3>Allgemein<\/h3>/);
  assert.match(html, /<h3>Sensoren \(Werte\)<\/h3>/);
  assert.match(html, /<h3>Binärsensoren \(Status\)<\/h3>/);
  assert.match(html, /S10 - Aussentemperatur/);
  assert.match(html, /A12 - Nachheizung/);
});

test("editor includes sensor picker datalist options from hass states", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });
  editor._hass = {
    states: {
      "sensor.one": { state: "1" },
      "sensor.two": { state: "2" },
      "binary_sensor.pump": { state: "off" },
    },
  };
  editor._render();

  const html = editor.shadowRoot.innerHTML;
  assert.match(html, /datalist id="sensor-entity-options"/);
  assert.match(html, /datalist id="binary-entity-options"/);
  assert.match(html, /value="sensor\.one"/);
  assert.match(html, /value="sensor\.two"/);
  assert.match(html, /value="binary_sensor\.pump"/);
});

test("title field is a plain text input without datalist lookup", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });
  editor._render();

  const html = editor.shadowRoot.innerHTML;
  assert.match(html, /<input id="title" type="text" value="[^"]*"\s*\/>/);
  assert.doesNotMatch(html, /<input id="title"[^>]*\slist="/);
});

test("only entity fields use lookup; label fields stay plain text", () => {
  const runtime = loadCardRuntime();
  const { CARD_TYPE, normalizeConfig, SolvisHomeAssistantLovelaceCardEditor } = runtime;

  const editor = new SolvisHomeAssistantLovelaceCardEditor();
  editor._config = normalizeConfig({ type: `custom:${CARD_TYPE}` });
  editor._render();

  const html = editor.shadowRoot.innerHTML;
  assert.match(html, /data-group="entities"[^>]*\slist="sensor-entity-options"/);
  assert.match(html, /data-group="binary_entities"[^>]*\slist="binary-entity-options"/);
  assert.match(html, /data-group="binary_entities"[^>]*placeholder="binary_sensor\.entity_id"/);
  assert.doesNotMatch(html, /data-group="sensor_labels"[^>]*\slist="/);
  assert.doesNotMatch(html, /data-group="binary_labels"[^>]*\slist="/);
});

test("drawLabeledBox respects left/right/center alignment for fixed width", () => {
  const runtime = loadCardRuntime();
  const { SolvisHomeAssistantLovelaceCard } = runtime;

  const card = new SolvisHomeAssistantLovelaceCard();
  card._overlayFontPx = 12;

  const calls = [];
  const ctx = {
    measureText() {
      return {
        width: 20,
        actualBoundingBoxAscent: 8,
        actualBoundingBoxDescent: 2,
      };
    },
    fillRect() {},
    strokeRect(x, y, w, h) {
      calls.push({ x, y, w, h });
    },
    fillText() {},
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    textAlign: "center",
    textBaseline: "middle",
  };

  card._drawLabeledBox(ctx, 100, 50, "X", {
    fillStyle: "#fff",
    strokeStyle: "#000",
    textStyle: "#000",
    padX: 4,
    padY: 2,
    fixedWidth: 40,
    align: "left",
  });
  card._drawLabeledBox(ctx, 100, 50, "X", {
    fillStyle: "#fff",
    strokeStyle: "#000",
    textStyle: "#000",
    padX: 4,
    padY: 2,
    fixedWidth: 40,
    align: "right",
  });
  card._drawLabeledBox(ctx, 100, 50, "X", {
    fillStyle: "#fff",
    strokeStyle: "#000",
    textStyle: "#000",
    padX: 4,
    padY: 2,
    fixedWidth: 40,
    align: "center",
  });

  assert.equal(calls[0].x, 100); // left aligned
  assert.equal(calls[1].x, 60); // right aligned
  assert.equal(calls[2].x, 80); // centered
});

test("canvas click emits hass-more-info for matching target", () => {
  const runtime = loadCardRuntime();
  const { SolvisHomeAssistantLovelaceCard } = runtime;

  const card = new SolvisHomeAssistantLovelaceCard();
  card._clickTargets = [{ entityId: "sensor.solvis_temp", x: 10, y: 10, w: 80, h: 20 }];

  let emittedEvent;
  card.dispatchEvent = (event) => {
    emittedEvent = event;
    return true;
  };

  let prevented = false;
  let stopped = false;
  card._onCanvasClick({
    offsetX: 20,
    offsetY: 15,
    preventDefault() {
      prevented = true;
    },
    stopPropagation() {
      stopped = true;
    },
  });

  assert.equal(prevented, true);
  assert.equal(stopped, true);
  assert.equal(emittedEvent?.type, "hass-more-info");
  assert.equal(emittedEvent?.detail?.entityId, "sensor.solvis_temp");
});

test("canvas hover sets pointer only for clickable targets", () => {
  const runtime = loadCardRuntime();
  const { SolvisHomeAssistantLovelaceCard } = runtime;

  const card = new SolvisHomeAssistantLovelaceCard();
  card._canvasEl = { style: { cursor: "default" } };
  card._clickTargets = [{ entityId: "binary_sensor.pump", x: 5, y: 5, w: 30, h: 15 }];

  card._onCanvasPointerMove({ offsetX: 10, offsetY: 10 });
  assert.equal(card._canvasEl.style.cursor, "pointer");

  card._onCanvasPointerMove({ offsetX: 200, offsetY: 200 });
  assert.equal(card._canvasEl.style.cursor, "default");

  card._onCanvasPointerLeave();
  assert.equal(card._canvasEl.style.cursor, "default");
});
