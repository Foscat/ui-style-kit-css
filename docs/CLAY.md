# Clay Reference System

The Clay specimen implements the paired **Sculpted Product Studio** reference
images from the explicitly requested `artifact-template-clay` template. The saved
template and original references are unchanged.

## Entry Points

Use `ui-style-kit-css/clay.css` for the complete preset, or
`ui-style-kit-css/visual/clay.css` for its visual-only distribution. Set
`data-ui="clay"` and `data-mode="light"`, `dark`, or `contrast` on the owning root.
The full demo is available in both `index.html` and `demo/index.html`.

## Unified Material

The approved hand-molded direction supersedes the earlier split between a smooth
reference sheet and deeply embossed general components. Both now share the same
type roles, imperfect control contours, matte grain, theme paint, and three depth
treatments: resting slabs, raised controls, and recessed wells. The sheet retains
its compact dimensions and responsive arrangement, not a separate component skin.

Section dividers sit on a continuous slab instead of framing every group as a
rounded card. Grain is blended into backgrounds rather than overlaid on text.
Body copy, field values, alerts, and table cells remain crisp; restrained impressed
lettering is limited to headings and short control labels. Pressed buttons recess,
and inset keyboard rings remain visible inside the irregular silhouettes.

Rounded headings use the locally bundled Nunito variable font (exposed as
`Clay Rounded`), with its SIL Open Font License retained in
`styles/assets/clay-rounded-OFL.txt`. Source: [Google Fonts Nunito](https://github.com/google/fonts/tree/main/ofl/nunito).
Body copy and input values retain the compact system font. Circular controls use
smooth, slightly oval silhouettes rather than faceted polygons. Check marks and
demo icons are centered independently of font baselines.

Tables share a formed outer edge and matte raised headers while keeping straight,
readable rows. Feature strips use one blended slab without internal dividers;
supporting copy uses the surface's high-contrast foreground. Range, progress,
threshold, and milestone controls share the same grain and relief as buttons.

Set `data-theme` to any shared scheme to color the entire preset: canvas, slabs,
raised and inset surfaces, text, controls, status colors, tooltips, and the reference
sheet. Prefixed classes, semantic `.ui-*` components, and native elements use the
same material mappings. Live `--usk-*-rgb` overrides on the owning root also apply.
The sculpted edges, grain, and relief remain Clay-specific across schemes.

Omit `data-theme` to retain the original mineral palette. The demo sheet displays
live semantic-role swatches for a selected theme and mineral swatches in reference
palette mode. Contrast themes retain their paired semantic foreground/background
colors while suppressing decorative texture on selected controls.

## Component Inventory

`clay-helper` supplies the existing compact supporting-copy treatment for fields
and component groups. It is included in the manifest alongside the classes below.

| Reference Area | Public Classes |
| --- | --- |
| Continuous slab and rail | `clay-sheet`, `clay-rail`, `clay-rail-link`, `clay-studio-mark` |
| Masthead, studio plate, palette | `clay-masthead`, `clay-studio`, `clay-palette`, `clay-palette-grid`, `clay-swatch` |
| Seamed component groups | `clay-reference-section`, `clay-section-title`, `clay-component-matrix`, `clay-choice-stack` |
| Button state matrix | `clay-button-matrix`, `clay-button`, `clay-button-primary`, `clay-button-secondary`, `clay-button-outline`, `clay-button-danger`, `clay-loading-track` |
| Text, password, search, numeric, date, time, datetime, textarea | `clay-field-row`, `clay-input-wrap`, `clay-input`, `clay-textarea`, `clay-icon-button` |
| Upload zone | `clay-file-zone` |
| Closed and expanded select | `clay-select`, `clay-select-menu`, `clay-option` |
| Removable multi-select tags | `clay-tags`, `clay-chip` |
| Checked, unchecked, mixed, selected and disabled controls | `clay-choices`, `clay-check`, `clay-check-control`, `clay-radio`, `clay-radio-control`, `clay-switch`, `clay-switch-track`, `clay-switch-thumb` |
| Range and value flag | `clay-control-band`, `clay-range`, `clay-range-scale`, `clay-value-flag` |
| Continuous and segmented progress | `clay-progress`, `clay-progress-bar`, `clay-segments` |
| Horizontal milestones and vertical progress | `clay-milestones`, `clay-milestone`, `clay-vertical-progress` |
| Threshold meter | `clay-threshold`, `clay-threshold-scale` |
| Tabs and panel | `clay-navigation-band`, `clay-tabs`, `clay-tab`, `clay-tab-panel`, `clay-tab-media` |
| Pagination, view modes, quantity | `clay-pagination`, `clay-segmented`, `clay-quantity` |
| Success, information, warning and error messages | `clay-feedback-band`, `clay-alert`, `clay-alert-success`, `clay-alert-info`, `clay-alert-warning`, `clay-alert-danger`, `clay-alert-close` |
| Tooltip and bead loader | `clay-tooltip`, `clay-tooltip-bottom`, `clay-spinner`, `clay-spinner-lg` |
| Status, category and count badges | `clay-data-band`, `clay-badge` and its semantic color variants |
| Task table | `clay-table-wrap`, `clay-table` |
| Team portraits and overflow count | `clay-avatar`, `clay-avatar-group` |
| Text and engraved studio seal | `clay-inset`, `clay-badge-seal` |
| Inline confirmation and native modal | `clay-dialog`, `clay-dialog-actions` |

The 50 added reference-specific classes are registered in `manifest.json`, alongside
the four existing Clay extras. Layout-only
legacy `clay-section` is not repurposed as a new visual component.

## Behavior And Integration

The CSS library does not install event handlers. `demo/demo-clay.js` demonstrates
the HTML/ARIA contracts and local interactions: mode switching, anchor navigation,
password visibility, selectable/filterable options, tag creation/removal, keyboard
tabs, pagination, segmented selections, bounded quantity changes, range output,
message dismissal, and native modal confirmation with focus restoration.

Uploads are inspected locally, never sent to a server. The sample accepts PDF,
DOCX, XLSX and PNG files up to 10 MB. Tag values are inserted with `textContent`.
Loading examples and progress indicators are presentation samples, not claims of
background work. Table actions open the local confirmation demonstration.

`ClaySpecimen.render()` returns an empty string for every other preset. The shared
demo visibility pass also hides any `data-preset-only` region that does not match
the selected style. The browser test checks this across all 20 presets.

## Assets And Fidelity

`styles/assets/clay-grain.png` is a generated, neutral clay-grain texture packaged
with every CSS entrypoint. `demo/assets/clay-avatars.png` contains three generated
fictional headshots in equal-width cells, used only by the demo. Lucide icons are
retained locally under their existing license; additional icons use version 0.468.0.

The reference is a raster, not a source design file with font metrics and separate
assets. The implemented sheet matches its component inventory and band composition,
but it is not a pixel-identical rendering: the approved unified material, system font metrics, native date/time
controls, generated portraits, and reconstructed material grain differ. Responsive
views deliberately reflow the desktop matrix instead of shrinking its labels.

## Focused Verification

- `node --test tests/clay-template.test.js`
- `npx playwright test tests/e2e/clay-template.spec.js --project=chromium --workers=1`
- Existing Clay material test in `tests/e2e/clay-reference-fidelity.spec.js`
- `tests/e2e/clay-theme-colors.spec.js` checks all 20 themes in three modes,
  live RGB overrides, stable material geometry, and desktop/mobile containment
- `tests/e2e/clay-unified-material.spec.js` compares rendered public and sheet
  controls, reading-surface typography, keyboard/pressed states, and responsive views
- CSS lint, ownership, compatibility, package, and demo asset-version checks

Run individual browser cases during iteration. Do not replace a focused failure
with an unrelated full-suite run.
