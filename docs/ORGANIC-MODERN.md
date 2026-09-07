# Organic Modern

The September 2026 Organic template is implemented with public `organic-*`
classes. Cormorant Garamond display type and DM Sans interface type are bundled
locally under their SIL Open Font Licenses. Shape, typography, and material
treatment remain unchanged when a color scheme is selected.

## Palette Contract

```html
<!-- Original limestone palette; omit data-theme entirely. -->
<body data-ui="organic-modern" data-mode="light">

<!-- Original forest-dark palette. -->
<body data-ui="organic-modern" data-mode="dark">

<!-- Shared theme paints canvas, panels, controls, text, borders, and feedback. -->
<body data-ui="organic-modern" data-theme="arctic-indigo" data-mode="dark">
```

Preset roles resolve `--usk-*-rgb` first, then `--organic-fallback-*-rgb`.
Live shared RGB overrides work without changing component selectors. Use a valid
manifest theme ID or omit the attribute; an empty string is not a theme ID.
The existing high-contrast mode remains supported. The secondary button uses the
raised-surface/text pair, matching the reference rather than a saturated fill.
Original dark destructive text is white instead of warm ivory to meet 4.5:1.

## Component Map

| Source Design Family | Public Classes |
| --- | --- |
| Masthead and identity | `organic-masthead`, `organic-brand`, `organic-icon`, `organic-search`, `organic-avatar` |
| Project selection | `organic-project-list`, `organic-project-item` |
| Status and people | `organic-status-card`, `organic-score`, `organic-avatar-row` |
| Editorial imagery | `organic-photo`, `organic-hero-card`, `organic-hero-overlay`, `organic-quote-card` |
| Materials and metrics | `organic-materials`, `organic-material`, `organic-material-image`, `organic-impact`, `organic-performance` |
| Schedule and notices | `organic-table`, `organic-table-wrap`, `organic-notices`, `organic-notice` |
| Add-material form | `organic-add-material`, `organic-field`, `organic-input-grid`, `organic-dialog-actions` |
| Control laboratory | `organic-control-lab`, `organic-section-heading`, `organic-button-grid` |
| Actions | `organic-button` with `-primary`, `-secondary`, `-outline`, `-danger`; `organic-icon-button` |
| Fields | `organic-input`, `organic-textarea`, `organic-select`, `organic-input-action`, `organic-file-drop` |
| Multi-select and menu | `organic-token-input`, `organic-token`, `organic-expanded-select`, `organic-option` |
| Choices | Native checkbox/radio/switch; existing `organic-check`, `organic-radio`, `organic-switch` APIs retained |
| Progress | `organic-range`, `organic-value`, `organic-progress`, `organic-progress-bar`, `organic-progress-steps`, native meter |
| Navigation | `organic-tabs`, `organic-tab`, `organic-pagination`, `organic-segmented` |
| Quantity and feedback | `organic-stepper`, `organic-badge`, `organic-alert`, `organic-spinner`, `organic-tooltip` |
| Dialog | `organic-dialog`, `organic-dialog-actions` |

All additions are registered in `manifest.json`. Existing semantic aliases such
as `.ui-card` and `.ui-button` receive the updated visual treatment automatically.
The JavaScript in `demo/demo-organic.js` is specimen behavior, not a runtime
dependency of the CSS library. Consumers own application state and persistence.

## Source Adaptation

The source is a fixed 1536 x 1024 export board, not a responsive application.
The implementation keeps its component geometry and visual roles while using
readable 12-14px controls and intrinsic height. The three-zone layout reflows into
two columns, then one, instead of scaling all text into a fixed-size screenshot.

Only photographic regions of the supplied board are shown through clipped image
windows in the demo. No screenshot pixels stand in for controls or interface text.
The hero uses the unobstructed photographic region, so its framing differs from
the complete reference image. The original individual photographs were not
provided. All example project names and metrics are fictional demonstration data.

The specimen uses bundled Phosphor regular SVG icons under their MIT license.
`scripts/build.mjs` embeds these into `demo/demo-organic-icons.js` so local-file
and HTTP demos behave alike. The retained board is `demo/assets/organic-reference-light.png`.
Fonts and their licenses ship in `styles/assets` and `dist/assets`; focused
distribution paths are rebased by the existing build pipeline.

## Annotation Refinements

Standalone and busy-button loaders share a veined Phosphor leaf with a gentle
sway. Reduced-motion preferences disable the animation. The embedded SVG mask
works without a network request; its MIT license ships as
`assets/organic-icons-LICENSE.txt` alongside the library assets.

Marketing medallions use centered SVG icons, with a larger service star and
30px/14px seal labels. Outline-heavy actions have uniform themed borders.
Prefixed and semantic tables share a tinted sans-serif header, horizontal rules,
and a left-aligned caption. Demo toolbar selects show one custom chevron.

## Verification Evidence

Focused tests cover public class coverage and isolation, both fallback palettes,
20 themes across light/dark/contrast, live RGB overrides, keyboard/native control
behavior, responsive screenshots, local asset loading, and scoped accessibility.
Supplied template QA is historical evidence only; see the repository QA log for
fresh implementation results.
