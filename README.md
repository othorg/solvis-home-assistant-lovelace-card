# Solvis Home Assistant Lovelace Card

Custom Lovelace card for Home Assistant that renders a Solvis-style system diagram with live overlays.

## Features

- Same visual concept as `solvis-ha-integration` image rendering
- Fully frontend-configurable via Lovelace Card Editor (no CLI/YAML mapping required)
- Auto-detects and pre-fills entities from `solvis_remote` integration
- Supports multiple Solvis systems (system selector in editor)
- 12 sensor overlays + 5 binary status highlights

## Installation (HACS)

1. Add this repository as a custom frontend repository in HACS.
2. Install **Solvis Home Assistant Lovelace Card**.
3. Reload Home Assistant frontend.
4. Add card in dashboard: `Solvis Home Assistant Lovelace Card`.

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
