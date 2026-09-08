# Bauhaus Workshop Components

The Bauhaus preset follows the September 2026 paired component boards from the
personal `artifact-template-bauhaus` template. Its public `bau-*` classes, generated
semantic aliases, and native HTML fallbacks retain the library's shared color system.

## Usage

```html
<body data-ui="bauhaus" data-mode="light" data-theme="arctic-indigo">
  <article class="bau-panel">
    <h2 class="bau-heading">Workshop settings</h2>
    <button class="bau-button bau-button-primary">Save changes</button>
  </article>
</body>
```

Omit `data-theme` for the reference palette. Light mode defaults to an ivory
`#eee9dd` canvas, `#fffdf7` panels, and cobalt `#064bc4` primary actions. Dark mode
defaults to `#050505`, `#080808`, and `#0a54e8`. Contrast mode keeps the existing
high-contrast fallback. Danger and focus fallbacks use contrast-conscious variants
where small control labels or boundaries need stronger contrast than the board.

Every `--bau-*-rgb` resolver reads `--usk-*-rgb` first, with the preset color only
as a fallback. Shared tokens may be defined directly on the host or inherited
from an ancestor. This preset never assigns a palette to `--usk-*-rgb` variables.
An active theme therefore controls surfaces, text, selection, status colors,
and their paired foregrounds without changing the component geometry.

The sidebar is black with light text only in fallback mode. With a theme it uses
the inherited strong surface and text roles. The reference's fixed black rail
must not override the user's selected library theme.

## Visual Contract

- Square panels, fields, badges, rectangular switch tracks/thumbs, and ruled tables.
- Circular radios, range thumbs, and continuously rotating ring loaders.
- No decorative panel bands, rounded card corners, soft elevation, or clipped buttons.
- Secondary buttons are outlined; primary, warning, danger, and status fills use
  their semantic theme roles and matching foregrounds.
- The dialog retains the board's hard warning-colored offset as a specific exception.
- Existing `bau-switch` remains the labeled checkbox-based API. `bau-compact-switch`
  is the source's button-based switch; it requires `role="switch"`, `aria-checked`,
  an accessible name, and application state handling. These APIs do not share a
  fixed-width label container.
- `bau-tooltip` remains an actual tooltip. `bau-tooltip-panel` is the specimen module
  containing a trigger and tooltip, so the existing API stays compatible.

## Typography

The package bundles Barlow Regular/Semibold and Barlow Condensed Bold/ExtraBold
from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/barlow) and
[Barlow Condensed](https://github.com/google/fonts/tree/main/ofl/barlowcondensed),
with their SIL Open Font Licenses in `styles/assets/` and `dist/assets/`.
No runtime font request is needed. Override `--bau-font-sans` and
`--bau-font-display` to use application fonts. Display sizes do not scale with
viewport width, and letter spacing is zero in the new workshop treatments.

## Reference Mapping

The full component inventory maps as follows. Existing public classes remain
available; the added reference-specific composition is scoped inside `bau-sheet`.
`bh-stage` and export-only pointer suppression are intentionally not public UI.
Use the normal layout library for application page topology; the sheet is an
optional responsive component specimen, not a required application wrapper.

The existing `bau-alert-text` class styles an alert's copy region and is included
in the preset-specific manifest inventory.

| Template | Library |
| --- | --- |
| `.bauhaus-ui` | `.bau-sheet` |
| `.bh-panel` | `.bau-panel` |
| `.bh-sidebar` | `.bau-sidebar` |
| `.bh-brand` | `.bau-brand` |
| `.bh-brand-mark` | `.bau-brand-mark` |
| `.bh-sidebar-spacer` | `.bau-sidebar-spacer` |
| `.bh-sidebar-note` | `.bau-sidebar-note` |
| `.bh-theme-toggle` | `.bau-theme-toggle` |
| `.bh-switch` | `.bau-compact-switch` |
| `.bh-canvas` | `.bau-canvas` |
| `.bh-top-grid` | `.bau-top-grid` |
| `.bh-middle-grid` | `.bau-middle-grid` |
| `.bh-bottom-grid` | `.bau-bottom-grid` |
| `.bh-hero` | `.bau-hero` |
| `.bh-hero-copy` | `.bau-hero-copy` |
| `.bh-eyebrow` | `.bau-eyebrow` |
| `.bh-inline-actions` | `.bau-inline-actions` |
| `.bh-hero-art` | `.bau-hero-art` |
| `.bh-button` | `.bau-button` |
| `.bh-actions` | `.bau-actions` |
| `.bh-system` | `.bau-system` |
| `.bh-live-dot` | `.bau-live-dot` |
| `.bh-service-row` | `.bau-service-row` |
| `.bh-usage` | `.bau-usage` |
| `.bh-usage-cell` | `.bau-usage-cell` |
| `.bh-sliders` | `.bau-sliders` |
| `.bh-metrics-stack` | `.bau-metrics-stack` |
| `.bh-utility-stack` | `.bau-utility-stack` |
| `.bh-quota` | `.bau-quota` |
| `.bh-quota-copy` | `.bau-quota-copy` |
| `.bh-form-panel` | `.bau-form-panel` |
| `.bh-form-grid` | `.bau-form-grid` |
| `.bh-field` | `.bau-field` |
| `.bh-table-tools` | `.bau-table-tools` |
| `.bh-input-icon` | `.bau-input-icon` |
| `.bh-file` | `.bau-file` |
| `.bh-choices` | `.bau-choices` |
| `.bh-switch-row` | `.bau-switch-row` |
| `.bh-stepper` | `.bau-stepper` |
| `.bh-segment` | `.bau-segment` |
| `.bh-badges` | `.bau-badges` |
| `.bh-status` | `.bau-status` |
| `.bh-alert` | `.bau-alert` |
| `.bh-toast` | `.bau-toast` |
| `.bh-tooltip` | `.bau-tooltip-panel` |
| `.bh-loading` | `.bau-loading` |
| `.bh-spinner` | `.bau-spinner` |
| `.bh-spin` | `.bau-spin` |
| `.bh-skeleton` | `.bau-skeleton` |
| `.bh-table-panel` | `.bau-table-panel` |
| `.bh-table-wrap` | `.bau-table-wrap` |
| `.bh-service-card` | `.bau-service-card` |
| `.bh-service-icon` | `.bau-service-icon` |
| `.bh-listbox` | `.bau-listbox` |
| `.bh-dialog-zone` | `.bau-dialog-zone` |
| `.bh-dialog-toolbar` | `.bau-dialog-toolbar` |
| `.bh-tabs` | `.bau-tabs` |
| `.bh-dialog-surface` | `.bau-dialog-surface` |
| `.bh-dialog-close` | `.bau-dialog-close` |
| `.bh-dialog-icon` | `.bau-dialog-icon` |
| `.bh-live-status` | `.bau-live-status` |
| `.bh-visually-hidden` | `.bau-visually-hidden` |

## Demo And Evidence

`demo/demo-bauhaus.js` provides local examples of switching, password visibility,
range values, filtering, tab/listbox keyboard navigation, notices, and dialogs.
No demo action sends data to a server. Its visuals live in `styles/bauhaus.css`.
The complete unaltered source boards are available under the Reference board
disclosure; they are never cropped into substitute hero artwork.

The supplied package did not include separate geometry artwork or runnable
application source. The live specimen uses the existing licensed icon assets and
does not claim to reproduce missing decorative artwork. Responsive layouts and
readable control sizes replace the source's fixed 1536 x 1024 export geometry.

Focused tests cover the public mapping and fonts, existing component geometry,
native loaders, all 20 themes in three modes, ancestor-token inheritance,
reference palettes, responsive widths, reduced motion, keyboard controls, and
accessibility. These are fresh library tests, not the source package's historical
QA claims.
