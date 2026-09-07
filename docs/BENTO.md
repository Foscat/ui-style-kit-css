# Bento: Soft Mosaic

The Bento preset implements the retained September 2026 Bento UI template. Organic and other presets are not changed by this integration.

## Usage

```html
<body data-ui="bento" data-mode="light">
  <article class="bento-panel">
    <header><h2>Workspace</h2></header>
    <button class="bento-button bento-button-primary">Continue</button>
  </article>
</body>
```

Add `data-theme="arctic-indigo"` (or any registered theme) to use shared theme colors. Omit `data-theme` to use the reference fallback palette. Existing `--usk-*-rgb` roles remain authoritative; no template palette is assigned to shared theme variables. Light defaults use canvas #f8f9fd and primary #3157dc; dark defaults use canvas #07111f and primary #2b5ee2. Contrast mode retains the library's high-contrast fallback.

The Manrope variable font is bundled with its SIL Open Font License in `styles/assets/` and copied to the distribution. Applications may override `--bento-font-sans`.

## Class Mapping

Source `bm-*` classes map one-to-one to the public `bento-*` names below; `.bento-ui` becomes `.bento-sheet`. Existing public classes remain available. Export-only `bm-stage` is not needed in applications. All new geometry lives in `styles/bento.css`, not demo CSS.

The existing `.bento-stage` wrapper is inventoried for reference/export consumers.
It is optional; do not apply its `.is-export` state in an interactive application,
because that state deliberately suppresses pointer input and motion for capture.

| Template | Library |
| --- | --- |
| `.bento-ui` | `.bento-sheet` |
| `.bm-panel` | `.bento-panel` |
| `.bm-sidebar` | `.bento-sidebar` |
| `.bm-brand` | `.bento-brand` |
| `.bm-brand-mark` | `.bento-brand-mark` |
| `.bm-sidebar-spacer` | `.bento-sidebar-spacer` |
| `.bm-sidebar-note` | `.bento-sidebar-note` |
| `.bm-theme-toggle` | `.bento-theme-toggle` |
| `.bm-switch` | `.bento-switch` |
| `.bm-canvas` | `.bento-canvas` |
| `.bm-top-grid` | `.bento-top-grid` |
| `.bm-middle-grid` | `.bento-middle-grid` |
| `.bm-bottom-grid` | `.bento-bottom-grid` |
| `.bm-hero` | `.bento-hero` |
| `.bm-hero-copy` | `.bento-hero-copy` |
| `.bm-eyebrow` | `.bento-eyebrow` |
| `.bm-inline-actions` | `.bento-inline-actions` |
| `.bm-hero-art` | `.bento-hero-art` |
| `.bm-button` | `.bento-button` |
| `.bm-actions` | `.bento-actions` |
| `.bm-system` | `.bento-system` |
| `.bm-live-dot` | `.bento-live-dot` |
| `.bm-service-row` | `.bento-service-row` |
| `.bm-usage` | `.bento-usage` |
| `.bm-usage-cell` | `.bento-usage-cell` |
| `.bm-sliders` | `.bento-sliders` |
| `.bm-metrics-stack` | `.bento-metrics-stack` |
| `.bm-utility-stack` | `.bento-utility-stack` |
| `.bm-quota` | `.bento-quota` |
| `.bm-quota-copy` | `.bento-quota-copy` |
| `.bm-form-panel` | `.bento-form-panel` |
| `.bm-form-grid` | `.bento-form-grid` |
| `.bm-field` | `.bento-field` |
| `.bm-table-tools` | `.bento-table-tools` |
| `.bm-input-icon` | `.bento-input-icon` |
| `.bm-file` | `.bento-file` |
| `.bm-choices` | `.bento-choices` |
| `.bm-switch-row` | `.bento-switch-row` |
| `.bm-stepper` | `.bento-stepper` |
| `.bm-segment` | `.bento-segment` |
| `.bm-badges` | `.bento-badges` |
| `.bm-status` | `.bento-status` |
| `.bm-alert` | `.bento-alert` |
| `.bm-toast` | `.bento-toast` |
| `.bm-tooltip` | `.bento-tooltip` |
| `.bm-loading` | `.bento-loading` |
| `.bm-spinner` | `.bento-spinner` |
| `.bm-spin` | `.bento-spin` |
| `.bm-skeleton` | `.bento-skeleton` |
| `.bm-table-panel` | `.bento-table-panel` |
| `.bm-table-wrap` | `.bento-table-wrap` |
| `.bm-service-card` | `.bento-service-card` |
| `.bm-service-icon` | `.bento-service-icon` |
| `.bm-listbox` | `.bento-listbox` |
| `.bm-dialog-zone` | `.bento-dialog-zone` |
| `.bm-dialog-toolbar` | `.bento-dialog-toolbar` |
| `.bm-tabs` | `.bento-tabs` |
| `.bm-dialog-surface` | `.bento-dialog-surface` |
| `.bm-dialog-close` | `.bento-dialog-close` |
| `.bm-dialog-icon` | `.bento-dialog-icon` |
| `.bm-live-status` | `.bento-live-status` |
| `.bm-visually-hidden` | `.bento-visually-hidden` |

## States and Existing Components

Source button modifiers `is-primary`, `is-secondary`, `is-danger`, and `is-ghost` are supported alongside the established `bento-button-primary`, `bento-button-secondary`, `bento-button-danger`, and `bento-button-ghost` classes. `is-hover` and `is-busy` expose sample states; application loading should also set `aria-busy="true"`. Warning keeps the shared paired warning role. Disabled controls use native `disabled`.

Native `button[aria-busy="true"]` controls use the same current-color circular ring as authored and semantic busy buttons. The Bento-only override removes the legacy tile background, inset shadow, and clipped corners; reduced-motion preferences remain respected. This is covered by `tests/e2e/bento-native-busy.spec.js` in light, dark, and contrast modes.

Labeled `bento-switch` / `ui-switch` checkboxes retain a separate text lane beside a fixed 37px by 20px track. Compact button/span switches use the same geometry without applying their thumb rules to label text. Focus and checked states remain native-input driven. Spinner sizes are 16px, 28px, and 40px; intrinsic flex sizing keeps each ring circular. The `ui-spinner`, `loading-spinner`, and `data-loading-spinner` aliases also receive the Bento ring treatment.

Alert titles and bodies wrap at spaces rather than splitting words. Direct title/body siblings can wrap into separate rows in narrow containers. Service medallion text icons use 32px type while retaining their existing container size.

Status chips support `is-violet`, `is-success`, `is-warning`, `is-danger`, and `is-info`. Switches use `role="switch"` and `aria-checked`; listboxes use option `aria-selected`; segmented buttons use `aria-pressed`. CSS does not implement application state or persist data.

Existing cards/panels use 17px corners, buttons 8px, inputs/selects/textareas 6px, badges 5px, feedback 9px, and dialogs 14px. Native form elements inherit the same role tokens. Legacy `ui-*` aliases continue to be generated by the package build.

## Responsive and Accessibility Adaptations

The source is a fixed 1536 x 1024 board. Library compositions use intrinsic rows and responsive tracks instead of scaling the board or clipping labels. The sidebar becomes a horizontal strip on smaller screens, then panels stack. Tables retain horizontal scrolling. Typography is at least 12px in the specimen; controls are at least 36px high where the original used tiny 26px targets. Semantic chip text uses the body foreground over tinted backgrounds to preserve contrast rather than reproducing low-contrast source labels.

Muted light text and hover fills are slightly darker than the source to meet text contrast requirements. The light quota figure uses a darker green fallback; small blue text uses the link role, particularly in dark mode. Selected dialog tabs use the paired surface/text roles. These accessibility adjustments do not override a selected shared theme.

The Bento-only demo includes local sample interactions for password visibility, upload filenames, switches, range output, segmented choices, dismissible feedback, customer filtering, keyboard listbox/tab navigation, details, and a nonmodal inline confirmation dialog. It makes no service requests and does not store input. Its reference-palette selector is demo state, not a library requirement.

The native-element demo uses measured grid spans to pack unequal sample heights without reordering the DOM. A demo-only ResizeObserver updates spans when controls, disclosures, fonts, or viewport dimensions change and is disconnected when switching presets. Library consumers do not need this demo layout code. The follow-up annotation checks in `tests/e2e/bento-annotations.spec.js` cover switch activation, spinner geometry and aliases, word-boundary wrapping, icon scale, and desktop/mobile sample gaps.

## Reference Assets

The retained template contains light/dark full-board PNGs, extracted from the supplied SVG wrappers, plus the original guide and CSS. It does not contain separate transparent illustration assets or the historical application's source/tests. The demo displays an illustration-only window from each unchanged board; it does not use a screenshot as interactive UI. Those illustration pixels keep their original colors and are not theme tokens. New CSS components contain no dependency on demo images.

Source provenance: `artifact-template-bento-ui/references/source/bento-ui.css`, `BENTO-UI-DESIGN-GUIDE.md`, and the retained light/dark board assets. Historical supplied QA is not evidence of current library validation.
