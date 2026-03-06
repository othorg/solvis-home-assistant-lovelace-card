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
- Clean canvas-based overlay rendering for sharper labels and status badges
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

## Release Notes in HA (HACS)

When a new tagged release is published, HACS can show the release notes in the update dialog.

- Release notes source: GitHub Releases  
  https://github.com/othorg/solvis-home-assistant-lovelace-card/releases
- This repository contains an automated workflow that creates GitHub Releases with generated notes from commits when a tag (`v*`) is pushed.

## Manual Resource (optional)

If needed, add resource manually:

- URL: `/hacsfiles/solvis-home-assistant-lovelace-card/solvis-home-assistant-lovelace-card.js`
- Type: `module`

## Card Configuration

Use the Lovelace UI card editor.

- No manual YAML entity mapping required.
- Defaults are auto-loaded from `solvis_remote` entities.
- You can override every mapped sensor/binary sensor in the editor.
- Entity mapping is always editable in the UI. If `ha-entity-picker` is unavailable, the editor falls back to plain text input fields.
- Overlay text size is configurable in the editor (`Auto`, `Klein`, `Mittel`, `Gross`).
- Overlay labels are configurable per sensor and per binary status directly in the editor.
- Sensor and binary entity inputs provide picker-like suggestions via datalist from current HA states.
- If the base image is not shown in your installation, set `Basisbild URL` explicitly in the card editor, for example:
`/hacsfiles/solvis-home-assistant-lovelace-card/solvis-home-assistant-lovelace-card-base.jpg`

Image loading behavior:

- The card auto-detects its own script base URL and tries matching image paths first.
- Additional fallback paths for HACS and `/local/community` are included.

## Card Type

`custom:solvis-home-assistant-lovelace-card`

## Tests

Run the lightweight Node.js test suite:

```bash
npm test
```

## Maintainer Release Flow

To publish an update with visible release notes in HACS:

1. Update version in:
`package.json` and `dist/solvis-home-assistant-lovelace-card.js` (`CARD_VERSION`).
2. Commit and push to `main`.
3. Create and push a semver tag:
`git tag -a vX.Y.Z -m "Release vX.Y.Z" && git push origin vX.Y.Z`
4. GitHub Actions creates the Release with generated notes from commits.

## Icon

The card ships with the same Solvis icon style used in `solvis-ha-integration`:

- [assets/solvis-icon.png](assets/solvis-icon.png)
- [dist/solvis-icon.png](dist/solvis-icon.png)

This icon is exposed in the card metadata (`window.customCards`) and is used by Home Assistant where custom card icons are supported.
