# Changelog

All notable changes to this project are documented in this file and in GitHub Releases:

- https://github.com/othorg/solvis-home-assistant-lovelace-card/releases

## [Unreleased]

### Changed
- No changes yet.

## [0.50.1] - 2026-03-06

### Fixed
- Fixed JSON import in editor to read current textarea content even without prior `change`/blur.
- Fixed touch interaction behavior by avoiding `preventDefault()` on touch `pointerdown` (reduces scroll blocking).
- Fixed noisy/ambiguous config normalization by removing redundant `overlay_actions` default assignment.
- Fixed obsolete click-path usage by relying on pointer tap flow consistently.

### Changed
- Improved state-change detection to include timestamp diffs only when status badges are enabled.
- Improved toggle-action diagnostics by logging a warning when both toggle service fallbacks fail.
- Refactored editor change routing to a `switch` for clearer single-dispatch control flow.
- Extended test coverage for pointer tap handling, timestamp-only update filtering, touch pointer behavior, and JSON import without blur.

## [0.50.0] - 2026-03-06

### Added
- Added per-overlay action configuration in editor (`tap_action`, `hold_action`, optional `navigation_path`).
- Added long-press handling for overlays with configurable duration (`long_press_ms`).
- Added display status badges for `offline` and `stale` entity counts.
- Added editor presets (`Standard`, `Compact`, `Service`).
- Added editor config import/export via JSON textarea.
- Added compact mode to render denser overlays.

### Changed
- Updated README documentation for interaction model, presets, display options, and import/export workflow.
- Improved interaction model to support per-overlay actions (`more-info`, `navigate`, `toggle`, `none`) for both tap and hold.
- Added configurable navigation target handling and binary toggle support through Home Assistant services.
- Extended automated test coverage for presets, import/export, action dispatching, stale/offline summary, and long-press behavior.

## [0.15.3] - 2026-03-06

### Fixed
- Removed redundant canvas renders on card updates to avoid double rendering.
- Removed unused editor `input` listener overhead while preserving stable focus behavior.
- Unified grouped and ungrouped binary "off" styling for consistent visuals.

### Changed
- Added requestAnimationFrame-based canvas render scheduling to reduce render bursts on resize and updates.
- Switched overlay hover handling from mouse events to pointer events for better cross-device behavior.
- Improved binary state rendering with explicit `unavailable` handling (`-- label` + dashed border).
- Added CSS-pixel coordinate clarification comment for click hit-testing with DPR-scaled canvas.
- Simplified label placeholder construction in editor rendering.

## [0.15.2] - 2026-03-06

### Added
- Added direct interaction on overlay boxes: clicking a sensor/binary sensor value now opens the corresponding Home Assistant more-info dialog.
- Added hover pointer feedback on clickable overlay boxes.

### Changed
- Overlay rendering now tracks click hitboxes for mapped entities and updates them on redraw.
- Extended tests for click-to-more-info and hover cursor behavior.

## [0.15.1] - 2026-03-06

### Fixed
- Fixed focus loss while typing in free text fields in the editor (labels and manual entity text inputs).
- Changed text-input persistence behavior to update on `change` instead of each `input` keystroke.

### Changed
- Kept lookup suggestions for entity mapping fields while keeping label fields as plain text fields.
- Extended and adjusted test coverage for editor input behavior and focus stability.

## [0.15.0] - 2026-03-06

### Added
- Bilingual UI support for card and editor:
  - German for Home Assistant language `de*`
  - English for all other languages

### Changed
- Localized card default title, editor labels, notices, and error texts.
- Localized default sensor and binary names used in editor and overlays.
- Kept entity fields as lookup-enabled fields and label fields as plain text fields.
- Added i18n regression tests for both German and English rendering paths.

## [0.1.4] - 2026-03-06

### Fixed
- Fixed editor title field focus loss by preventing config updates on each keystroke.

### Changed
- Fine-tuned solar and right-side overlay alignment anchors.
- Added fixed-width box alignment logic for grouped overlays (left/right/center).
- Increased test coverage for alignment behavior and title field handling.

## [0.1.3] - 2026-03-06

### Added
- Canvas-based overlay rendering for cleaner visual quality.
- Configurable sensor and binary labels in editor.
- Sensor picker suggestions via datalist from HA state list.
- Overlay text size configuration (`Auto`, `Klein`, `Mittel`, `Gross`).

### Changed
- Improved base image and icon path fallback detection.
- Improved editor UX fallback when entity picker is unavailable.
- Expanded test coverage for configuration and rendering behavior.
