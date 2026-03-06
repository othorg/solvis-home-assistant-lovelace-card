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
      this._nodes["img.base"] = img;
      if (this._nodes[".wrapper"]) {
        this._nodes[".wrapper"].appendChild(img);
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

function loadCardRuntime() {
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
