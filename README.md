# Solvis Home Assistant Lovelace Card

Custom Lovelace card for Home Assistant that renders a Solvis-style system diagram with live overlays.

This project is the corresponding Lovelace card for the Solvis Home Assistant integration:
`solvis-ha-integration` / `solvis_remote`  
https://github.com/othorg/solvis-ha-integration

## Features

- Same visual concept as `solvis-ha-integration` image rendering
- Fully frontend-configurable via Lovelace Card Editor (no CLI/YAML mapping required)
- Auto-detects and pre-fills entities from `solvis_remote` integration
- Supports multiple Solvis systems (system selector in editor)
- 12 sensor overlays + 5 binary status highlights

## Installation (HACS)

1. Open `HACS`.
2. Open menu (top-right 3 dots) -> `Custom repositories`.
3. Repository URL:
`https://github.com/othorg/solvis-home-assistant-lovelace-card`
4. Category: `Dashboard`.
5. Click `Add`.
6. Search and install **Solvis Home Assistant Lovelace Card** in HACS.
7. Reload Home Assistant frontend (or restart Home Assistant once).
8. Add card in dashboard: `Solvis Home Assistant Lovelace Card`.

## Manual Resource (optional)

If needed, add resource manually:

- URL: `/hacsfiles/solvis-home-assistant-lovelace-card/solvis-home-assistant-lovelace-card.js`
- Type: `module`

## Card Configuration

Use the Lovelace UI card editor.

- No manual YAML entity mapping required.
- Defaults are auto-loaded from `solvis_remote` entities.
- You can override every mapped sensor/binary sensor in the editor.

## Card Type

`custom:solvis-home-assistant-lovelace-card`

## Tests

Run the lightweight Node.js test suite:

```bash
npm test
```

## Icon

The card ships with the same Solvis icon style used in `solvis-ha-integration`:

- [assets/solvis-icon.png](assets/solvis-icon.png)

This icon is exposed in the card metadata (`window.customCards`) and is used by Home Assistant where custom card icons are supported.
