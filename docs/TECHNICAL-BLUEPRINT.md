# Technical Blueprint

The Technical Blueprint preset follows the retained Technical Blueprint element
boards and design guide: square controls, a 16px construction grid, drafting
registration marks, calibrated line weights, and restrained semantic ink colors.
The canonical public prefix is `blueprint-`; source-template `tb-` aliases are
not exported.

## Theme and Material

Set `data-ui="technical-blueprint"` and `data-mode="light"` or `"dark"` on the
containing element. Existing `--usk-*` semantic tokens feed the `--blueprint-*`
aliases, so changing `data-theme` changes color without replacing drafting
geometry. In the demo, **Use reference palette** selects the guide's fallback
colors instead of a named color theme. Primary action fill and foreground are
paired separately from annotation ink for readable labels in both modes.

## Component Surface

The manifest is the authoritative class inventory. Alongside the shared button,
input, card, table, alert, badge, tooltip, progress, spinner, and switch families,
Technical Blueprint exports these preset-only components:

- Sheet frame, datum marker, line sample, section title, overline, token swatch.
- Choice, input wrapper/icon, helper/error text, range, critical range, meter.
- Dropdown/option, file upload surface, tags, chips and semantic chip variants.
- Segmented controls, tabs, breadcrumb, pagination and pagination page.
- Stepper/step, revision progress, toast, skeleton.
- Avatars and groups, code, quote, list, metric, empty state.
- Popover, modal/actions, accordion.

`blueprint-page` remains the page shell. Pagination items use
`blueprint-pagination-page` to avoid changing that existing API.

## Demo and Accessibility

The demo includes all ten reference groups: actions, forms, choices, selects and
upload, ranges and progress, alerts and loading, navigation, data display,
overlays, and foundations. Additional code, quote, metric, and empty-state
examples live in the preset-specific extras section. Every preset-owned demo
region is hidden when a different preset is selected.

The specimen uses labeled native inputs, named icon buttons, keyboard-operated
tabs and listboxes, a native dialog, file selection, and live range outputs.
Sample actions are local demonstrations; they do not upload or delete data.
CSS alone provides presentation, not dialog/listbox application behavior.
Controls retain visible focus, disabled-state cues, reduced-motion handling,
forced-color fallbacks, and 44px touch targets on coarse-pointer devices.

Native date/time formatting, file pickers, font rasterization, and responsive
reflow follow the browser rather than reproducing static illustration pixels.

## Focused Verification

- `node --test tests/technical-blueprint-template.test.js`
- `npx playwright test tests/e2e/technical-blueprint-template.spec.js --project=chromium`

The browser checks use the generated bundle, verify all preset-only regions,
audit both reference modes with axe, and exercise keyboard behavior, token
overrides, and mobile overflow. Rebuild distribution CSS before browser checks.
