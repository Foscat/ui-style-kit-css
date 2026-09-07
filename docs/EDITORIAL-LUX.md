# Editorial Lux

Editorial Lux implements the retained couture UI element system: a double-rule frame, Didone masthead and stacked headline, collection rail, portrait, restrained forest actions, oxblood destructive states, brass measurement details and ruled component bands.

The display name is **Editorial Lux**. The existing preset ID `editorial-luxe`, stylesheet entrypoints and `luxe-*` prefix are unchanged. The library remains CSS-only; demo JavaScript is an example controller, not a runtime dependency of the package.

## Usage and Tokens

```html
<link rel="stylesheet" href="ui-style-kit-css/editorial-luxe.css">
<main data-ui="editorial-luxe" data-mode="light">
  <button class="luxe-button luxe-button-primary">View look</button>
</main>
```

Omit `data-theme` for the fallback reference palette. Add any supported theme, such as `data-theme="arctic-indigo"`, for shared color-theme switching. Both named themes and application overrides flow through `--usk-*` into the `--luxe-*` aliases. Geometry and typography remain preset-owned.

| Role | Light fallback | Dark fallback |
| --- | --- | --- |
| Surface | `#f8f5ef` | `#0e1110` |
| Text | `#111413` | `#e8dfd2` |
| Primary fill | `#123229` | `#18382e` |
| Destructive fill | `#7d1113` | `#8d1b1c` |
| Structural rule | `#706d65` | `#95825c` |
| Brass material | `#a58246` | `#a58246` |

Primary/destructive backgrounds use separate on-color tokens. Small success/error text has contrast-safe foreground aliases so deep pigments are not used as unreadable dark-canvas copy. Neutral muted copy and rules are strengthened where the original compact sheet is too faint for functional UI. Contrast mode follows the existing high-contrast token system.

## Component Surface

All existing universal `luxe-*` classes remain available. New preset-only suffixes are declared in `manifest.classApi.presetExtras['editorial-luxe']`; there is no public `el-*` alias layer.

| Reference group | Public components |
| --- | --- |
| Editorial shell | `luxe-sheet`, `luxe-masthead`, `luxe-masthead-title`, `luxe-collection-rail`, `luxe-portrait`, `luxe-story`, `luxe-story-title`, `luxe-byline`, `luxe-deck`, `luxe-colophon`, `luxe-section-title`, `luxe-section-number` |
| 01 Buttons | Existing `luxe-button` primary/secondary/ghost/danger variants; `.is-pressed`, native `disabled`, and `aria-busy` |
| 02 Inputs | Existing input/select/textarea/label; `luxe-input-valid`, `luxe-help-error`, `luxe-file-upload`, `luxe-file-drop`, `luxe-select-panel`, `luxe-option` |
| 03 Choices | Existing check/radio controls; `luxe-switch-segment` off/on control |
| 04 Ranges | `luxe-range`, `luxe-range-scale`, labeled native inputs and outputs |
| 05 Measurement | Existing progress/bar; `luxe-segmented-progress`, `luxe-meter` |
| 06 Alerts | Existing success/warning/danger alerts; `luxe-alert-mark`, `luxe-alert-close` |
| 07 Tabs | `luxe-tabs`, `luxe-tab-list`, `luxe-tab`, `luxe-tab-panel` |
| 08 Data | Existing table/table-wrap; `luxe-details` disclosure |
| 09 Status/navigation | `luxe-badge-medallion`, `luxe-badge-brass`, existing danger badge; `luxe-pagination`, `luxe-stepper` |
| 10 Overlay/loading | Existing tooltip/spinner; `luxe-skeleton`, `luxe-dialog`, `luxe-dialog-actions` |

`luxe-badge-medallion luxe-badge-danger` produces the red Hold mark. `luxe-badge-medallion luxe-badge-brass` produces the Saved mark. `--luxe-value` sets the threshold indicator from 0 through 100; provide matching meter semantics and visible meaning. `.is-done` marks completed progress segments.

## Accessible Interaction Contract

Use native buttons and inputs with visible labels. Pair errors with `aria-invalid` and `aria-describedby`; use state text and icons in addition to color. File-drop styling wraps a real file input rather than an inaccessible simulated picker.

The demo implements keyboard tabs and listbox options with roving focus, synchronized native selects, slider outputs, quantity bounds 1-99, page selection, local archive filtering, file-name feedback, alert dismissal and focus recovery. The dialog uses `showModal()`, Escape/cancel/confirm, and returns focus to its opener. Actions affect inert local sample state only; Share and Download do not send or export user data.

Make scrollable table regions focusable and name them. Connect tooltips with `aria-describedby`. Busy actions require an appropriate accessible name and disabled/busy handling in the consuming application's controller. Coarse-pointer targets are at least 44px; reduced motion stops the spinner and skeleton animation.

Standalone loaders use counter-rotating fine rings consistent with the double-rule frame, including semantic and native spinner aliases. Both rings stop under reduced motion. Seal numerals are 28px above 12px captions. Checkbox marks use centered geometric strokes instead of font-dependent glyphs. Warning badges and alert icons use light foregrounds over darkened theme warning pigment; warning labels and outlines retain the original semantic color. Demo toolbar selects use one native indicator in this preset.

## Demo and Fidelity

Open `index.html` or `demo/index.html`, select **Editorial Lux**, then use the specimen's **Use reference palette** button to compare fallback colors. Choose a named Color Theme to resume token-based theme switching.

All ten board groups are visible in the main specimen. Native number/date/time/file/progress/meter examples, validation, loading and token swatches are available in **Native fields & foundations**. The source's additional table disclosure and editorial reading sample are also included. Preset-specific regions are rendered or shown only when their owning style is active, with an all-preset isolation regression test.

The new source module is `demo/demo-editorial-lux.js`; component styling is in `styles/editorial-luxe.css`; demo-only composition is in `demo/demo.css`. The portrait is retained at `demo/assets/editorial-portrait.png`. Icons use the existing licensed Lucide collection, including its paperclip icon.

The reference PNG and supplied interactive HTML are not identical. This implementation follows the PNG's ten-group composition and retains the HTML's additional control surface. Intentional functional adaptations include associated labels, accessible status colors, native browser controls, keyboard focus, 44px touch targets, and responsive reflow instead of shrinking a fixed 1536px canvas. Supplemental controls use disclosure to preserve the main board composition. Font stacks resolve to installed system fonts; no Didot/Bodoni font files are bundled. These differences mean the result is not claimed as a pixel-identical raster reproduction.

## Verification

Focused tests cover the manifest/CSS inventory, all-preset demo isolation, reference light/dark/contrast accessibility, desktop/602px/390px geometry, portrait loading, calibration rules, touch targets, expanded native fields, keyboard interactions and live theme-token overrides. Full-demo representative scans cover all three modes with Arctic Indigo. Interaction tests also run in Firefox and WebKit.

`tests/e2e/editorial-lux-annotations.spec.js` covers the seven annotation refinements in Heritage Brass, including measured warning contrast, centered alert icons, seal typography, native toolbar indicators and reduced-motion spinner aliases.

Rebuild before browser verification because the demo loads `dist/ui-style-kit.css`. Generated default, visual-only, focused visual and bridge bundles are build outputs. No full CI, publication, commit or deployment is implied by these local checks.
