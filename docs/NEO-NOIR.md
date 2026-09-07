# Neo Noir / Midnight Cut

The existing **Neo-Noir** preset ID (neo-noir), stylesheet entrypoints and **noir-** prefix remain stable. The updated preset implements the retained Midnight Cut reference: blue-black or soft-white paper, fine grain, a diagonal corner, narrow display type, square fields, complete parallelogram action borders, diamond stages, calibrated exposure controls and semantic production states.

The package remains CSS-only. The demo controller is not a runtime dependency.

## Usage

~~~html
<link rel="stylesheet" href="ui-style-kit-css/visual/neo-noir.css">
<main data-ui="neo-noir" data-mode="dark">
  <button class="noir-button noir-button-primary">Approve</button>
</main>
~~~

Omit data-theme for reference colors. Named schemes such as arctic-indigo override palette roles through the existing --usk-* to --noir-* aliases. Geometry remains preset-owned. In the demo, select Neo-Noir and use the specimen's **Use reference palette** button.

## Component Inventory

All names below use the **noir-** prefix. Existing universal classes remain supported. Preset-only additions are declared in manifest.classApi.presetExtras["neo-noir"]; no source nn-* alias layer is exported.

| Group | Public component families |
| --- | --- |
| Identity | sheet, identity, brand-line, title, edition, subtitle, section-title, section-number |
| 01 Navigation | breadcrumbs, tabs, tab, tab-panel, pagination, segmented, stepper-track, step, step-marker |
| 02 Buttons | Existing button/primary/secondary/danger/ghost/icon-button; button-outline; default, hover, pressed, focus, disabled and busy |
| 03 Forms | Existing input/select/textarea/label; field-row, file-zone, file-state; text/password/search/number/date/time/datetime-local/textarea states |
| 04 Select | Native select; listbox, option with single selection |
| 05 Multi-select | chips, chip; add and remove tokens |
| 06 Controls | Existing check/check-control, radio/radio-control, switch/track/thumb; checked, selected, on/off and disabled |
| 07 Exposure | range, slider-value, range-scale, range-legend |
| 08 Progress | Existing progress/bar; segments, workflow, threshold, threshold-labels |
| 09 Feedback | Existing badges and alerts; badge-review, alert-close, processing, tooltip, details |
| 10 Table | Existing table/table-wrap; progress-cell; six production records |
| 11 Confirmation | dialog, dialog-meta, dialog-actions; nonmodal anatomy and real native modal |
| 12 Palette | swatches, swatch; neutral, action and semantic roles |
| 13 Type | display-sample, alpha, mono-sample |
| 14 Geometry | geometry-row, shape, line-samples, texture-sample |
| 15 Accessibility | ratio, focus-sample, color-safe, existing sr-only |
| Retained utilities | metric, metric-label, metric-value, empty-state |

## State and Controller Contract

- aria-selected and roving tabindex control tabs/options. Each tab points to an associated panel. Arrow keys, Home and End work alongside pointer activation. The native select and expanded listbox remain synchronized.
- aria-current="page" marks pagination; aria-current="step" marks the diamond workflow stage. Segmented controls and workflow buttons use aria-pressed.
- Native disabled, aria-invalid="true" and aria-busy="true" communicate control states. Pair application errors with descriptions. The specimen uses visible Default/Focus/Success/Error/Disabled labels rather than color alone.
- data-noir-state="hover|pressed|focus|success" freezes reference states for inspection. Real hover, active and focus selectors work independently.
- File rows use data-status="success|error|locked". File zones wrap real inputs and accept drops. The demo reads only file name and size and does not upload content.
- Set --noir-value to a percentage for the range flag and meter indicator. Keep the native range and output synchronized. Exposure runs from -5 to +5 in 0.1 increments.
- .is-done marks completed segments. Provide progressbar/meter semantics and explicit safe/caution/critical meaning. Omitting aria-valuenow selects indeterminate progress.
- Modal actions use showModal(), native Escape/cancel and focus return. Approval changes only sample state. Icon actions report their selected command without editing or sending real production data.
- Name scrollable table regions and make them keyboard focusable. Connect tooltips with aria-describedby.
- Narrow/coarse-pointer targets expand to 44px. Reduced motion stops processing/progress animations. Contrast mode removes textures. Contrast-ratio labels are targets, not certification of arbitrary consuming content.

## Tokens and Assets

| Role | Light reference | Dark reference |
| --- | --- | --- |
| Paper | #f2f1ed | #070d11 |
| Surface | #f8f7f3 | #080f14 |
| Text | #101417 | #ddd6c7 |
| Primary action | #f1c35e | #f2bd4b |
| Focus signal | #159eb4 | #36b8c8 |
| Review foreground | #68438f | #ae7adb |

Small semantic foregrounds and muted copy are strengthened from the original pigments for readable contrast. Named themes still control semantic colors.

Four supplied raster files are retained unchanged in styles/assets/neo-noir-{texture,corner}-{light,dark}.png. The build copies them into dist/assets; focused stylesheets rebase URLs to ../assets. Keep these asset directories when self-hosting CSS. Grain is composited at low opacity instead of displaying its raw black-and-white pixels as a surface.

Source provenance: the explicitly requested artifact-template-neo-noir skill's references/source assets, design guide and specimen, with its paired 3072x2048 references. Icons are retained Lucide SVGs under demo/assets/lucide with its license.

## Demo and Fidelity

All 15 groups are present at once for Neo-Noir; retained utility examples follow the board. The renderer returns no Neo Noir specimen for other styles. Existing data-preset-only regions remain governed by the shared all-preset visibility controller.

The PNG's component arrangement is the target, not the simplified browser capture. Intentional adaptations include native localized date/time controls, stronger semantic text, installed system font fallbacks, extra source field states, real keyboard/modal behavior and responsive reflow instead of scaling or clipping the entire sheet. Desktop spacing is compact; narrow layouts retain controls and scroll only the dense table. These changes are not a claim of pixel-identical raster reproduction.

Implementation is split between styles/neo-noir.css (public components), demo/demo.css (composition), and demo/demo-neo-noir.js (example controller). No unrelated preset material was redesigned.

## Local Verification

The annotation refinements retain the existing component API: loaders use a fixed registration ring with rotating aperture segments (and a dashed-ring fallback), directional tooltip modifiers expose external pointers, the service star is 28px inside its unchanged 60px medallion, and the callout uses a centered Lucide arrow. The 80px seal uses a 28px number and 13px label. Reduced motion stops the aperture blades and busy-control indicators. These refinements are scoped to Neo Noir.

The focused `tests/e2e/neo-noir-annotations.spec.js` checks geometry, tooltip directions, animated versus reduced-motion loaders, and light/dark/mobile captures. Annotation images are written to the system temporary directory as `noir-annotations-*.png`.

The follow-up refinements use octagonal medallions and seals at the same dimensions, remove rectangular paint behind skewed button states, and give explicit rounding utilities 8/12/16px corners. The demo selectors retain one native indicator. Native checkboxes use a centered angular check, with hidden custom-choice inputs excluded. The exposure handle is 24px wide with a center index; keep `--noir-position` (0 to 1) synchronized with `--noir-value` (percentage) so its value flag follows native thumb travel. The ruler retains eleven evenly spaced labels. `tests/e2e/neo-noir-refinements.spec.js` covers these changes, keyboard behavior, and responsive screenshots.

Focused unit tests cover the independent API inventory and portable asset URLs. Focused browser tests cover 15-group coverage, all 20 presets' isolation, light/dark/contrast accessibility, 1920/1115/602/390px geometry, aligned controls, keyboard navigation, live range values, safe tag text, upload feedback, modal lifecycle, palette switching and reduced motion.

Browser captures are written to the local temporary directory usk-neo-noir. Rebuild before browser checks because the demo loads generated distribution CSS. Local checks do not imply a full CI run, commit, publication or deployment.

The build now content-versions local CSS and JavaScript URLs in both demo entrypoints, including the default/bridge switch URLs. Reload the HTML page after a rebuild to pick up these URLs; already-open pages do not hot-reload. Native Neo Noir dialogs have 20px inner padding. The dark-mode annotation regression checks the full button matrix, single dropdown indicators, octagonal badges and dialog insets.

The focused Neo Noir checks pass locally, including interaction runs in Chromium, Firefox and WebKit. The broader public-API manifest test currently fails on unrelated Tactile workspace classes absent from that preset's manifest entry; that work was left untouched. Intermittent Windows write errors occurred during builds, followed by successful completed retries.
