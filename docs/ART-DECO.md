# Art Deco Element System

The Art Deco preset implements the retained light and dark **Art Deco UI Element System** boards using the canonical `deco-*` namespace. No public `ad-*` source aliases are introduced. All shared semantic components remain part of the unchanged `.ui-*` API.

## Loading And Palettes

```html
<link rel="stylesheet" href="dist/ui-style-kit.css">
<body data-ui="art-deco" data-mode="light">
  <button class="deco-button deco-button-primary">Primary action</button>
</body>
```

Omit `data-theme` for the reference palette. Add a supported theme, for example `data-theme="arctic-indigo"`, to use shared color tokens. `data-mode` supports light, dark, and contrast. The demo's mode-labeled button at the bottom of the Art Deco specimen selects the reference palette; the shared Color Theme picker returns to a named scheme.

Reference light uses ivory, navy, teal, burgundy, and structural gold. Dark uses near-black green surfaces, navy anchors, pale text, and brighter metal. Separate `--deco-on-primary`, `--deco-on-secondary`, `--deco-on-warning`, and other foreground aliases protect text on filled surfaces. They resolve from the corresponding `--usk-*-text-rgb` tokens. Ordinary component paint resolves through `--deco-*-rgb` to the shared theme tokens, with local reference fallbacks.

Stepped geometry, serif display type, diamond instruments, and segmented loading rings persist when colors change. Structural metal accepts the host accent token; geometry is not replaced by the color scheme.

## Public Component Inventory

All entries compose with the existing universal suffixes and appear in `manifest.classApi.presetExtras["art-deco"]` where preset-specific.

| Board group | Public classes |
| --- | --- |
| 01 Buttons | `deco-button`, `deco-icon-button`, `deco-button-primary`, `deco-button-secondary`, `deco-button-ghost`, `deco-button-danger`, `deco-button-loading` |
| 02 Navigation | `deco-breadcrumb`, `deco-pagination`, existing nav and badge classes |
| 03 Fields | `deco-input`, `deco-input-valid`, `deco-select`, `deco-textarea`, `deco-label`, `deco-help-error`, `deco-file-upload`, `deco-file` |
| 04 Select and choice | `deco-select-panel`, `deco-group-label`, `deco-option`, `deco-multi`, `deco-chip` |
| 05 Checkboxes | `deco-check`, `deco-check-control` |
| 06 Radios | `deco-radio`, `deco-radio-control` |
| 07 Switches | `deco-switch`, `deco-switch-track`, `deco-switch-thumb` |
| 08 Empty and loading | `deco-empty-state`, `deco-spinner`, `deco-loading-spinner` and spinner size helpers |
| 09 Range | `deco-slider-wrap`, `deco-slider`, `deco-slider-output` |
| 10 Threshold meter | `deco-meter` |
| 11 Progress | `deco-progress`, `deco-progress-bar`, `deco-step-progress` |
| 12 Tabs and segments | `deco-tabs`, `deco-tab-list`, `deco-tab`, `deco-tab-panel`, `deco-segmented`, `deco-segment` |
| 13 Quantity | `deco-stepper` |
| 14 Stages | `deco-stage-list`, `deco-stage`, `deco-stage-number` |
| 15 Feedback | Existing badge/alert variants plus `deco-badge-info`, `deco-badge-outline`, `deco-alert-info`, `deco-alert-icon`, `deco-alert-close` |
| 16 Table | `deco-table-wrap`, `deco-table` |
| 17 Overlays | `deco-tooltip`, `deco-dialog`, `deco-dialog-actions`, existing spinner classes |

Foundations: `deco-sheet`, `deco-fan`, `deco-frame`, `deco-frame-navy`, `deco-masthead`, `deco-masthead-title`, `deco-monogram`, `deco-stat`, `deco-stat-value`, `deco-stat-label`, `deco-health`, `deco-meta-grid`, `deco-meta`, `deco-status-dot`, `deco-performance`, `deco-section-title`, `deco-number`, `deco-divider`, `deco-palette`, and `deco-swatch`.

Additional source recipes: `deco-details` and `deco-skeleton`. The previous metric components and all other existing public classes remain supported and showcased in the shared sections.

## Composition And Fidelity

The demo begins with a symmetrical serif masthead and two overview bands, followed by five component lanes, a feedback/table/dialog row, and an eight-swatch footer. Four fan motifs, fine construction lines, stepped framing, the curved health gauge, and numbered section rules carry the reference identity.

The supplied PNGs are visual references, not production-ready markup. Their companion CSS has fixed board dimensions, a seven-column palette, a dotted spinner, a static range fill, and static dialog positioning. This implementation resolves those gaps with responsive composition, eight swatches, segmented rings, bound values, and native modal lifecycle behavior.

Deliberate functional adaptations: native date/time/number/file controls retain platform behavior; touch targets grow to 44px; layouts reflow below desktop widths instead of scaling text down; extra disclosure/skeleton examples and palette selection sit in a supplemental row. Source paragraph text and status colors are adjusted where needed for readability. These adaptations mean browser captures are not pixel-identical raster copies of the reference board.

## Interaction Contract

This package is CSS-only. Applications own state and event handling. `demo/demo-art-deco.js` provides local specimen behavior without introducing runtime JavaScript into the published stylesheet API.

- Buttons retain stepped focus indicators. Loading state reserves indicator width and uses `aria-busy`; the app must prevent duplicate submissions.
- Native labels and choice inputs retain keyboard activation. Custom choice paint accompanies the input instead of replacing its semantics.
- Tabs use `role="tablist"`, `role="tab"`, `aria-selected`, roving tab stops, and a labeled panel. Arrow keys and Home/End update selection.
- Expanded choices use a listbox/option contract and keyboard selection. The demo keeps the native select synchronized.
- Chip removal announces the change and moves focus to a remaining control. File names are assigned with `textContent`, not inserted as HTML.
- Range fill and value bubble share `--deco-value` with the native input value. Quantity controls clamp values to 0-99 and disable at the limits.
- Threshold and progress examples have accessible numeric values. Stage completion includes readable text and `aria-current="step"` in addition to color.
- Dialogs use `showModal()`, Escape/cancel, and focus return. The static dialog specimen is a labeled group, not an automatically opened modal.
- Loaders stop under reduced motion. Alerts include status text and named dismiss controls.

## Demo Isolation

The Art Deco specimen is created only when `data-ui="art-deco"` is selected. Existing `data-preset-only` synchronization also hides any other preset-owned regions. Switching styles rebuilds the active specimen instead of leaving hidden controls, stale dialogs, or source-only components visible. Shared semantic examples stay available and change appearance through the normal preset adapter.

## Verification

Focused coverage lives in `tests/art-deco-template.test.js` and `tests/e2e/art-deco-template.spec.js`. The browser spec checks the full component inventory, all-preset visibility, both reference palettes, axe results, keyboard interactions, dialog focus return, token overrides, mobile containment, typography, progress rendering, dismiss icons, and touch targets. Its temporary HTTP server exists only for tests so WebKit can inspect stylesheet rules without local-file access errors.

Full-demo Art Deco accessibility states are included in `tests/e2e/accessibility.spec.js`. Reference screenshots are written to the operating system's temporary `usk-art-deco-template` directory. Repository build, CSS lint, palette contrast, compatibility, ownership, and package checks remain the project's standard commands.

The semantic authored-hook test currently detects additional `.ui-*` hooks in existing Retrofuturism source, independent of this Art Deco implementation. That source is not changed here. Generated declaration fingerprints and the distinct preset-extras count are updated for the intentional Art Deco expansion; no release, commit, push, or full CI run is implied.
