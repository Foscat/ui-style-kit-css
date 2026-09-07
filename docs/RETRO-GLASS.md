# Retro Glass

The `retro-glass` preset implements the retained RetroGlass light and dark element
boards with rounded glass surfaces, brushed chrome, inset inputs, and glossy actions.
All components use the `rg-*` API. The shared semantic API remains unchanged.

```html
<link rel="stylesheet" href="ui-style-kit-css/retro-glass.css">
<main data-ui="retro-glass" data-mode="dark">
  <section class="rg-panel">
    <h2 class="rg-section-title">Library</h2>
    <label class="rg-field">
      <span class="rg-label">Search documents</span>
      <input class="rg-input" type="search">
    </label>
    <button class="rg-button rg-button-primary">Apply</button>
  </section>
</main>
```

## Themes

Omit `data-theme` for the reference palette. Set `data-theme` to any supported
scheme, such as `arctic-indigo`, to use semantic `--usk-*-rgb` colors. Switch
`data-mode` between `light`, `dark`, and `contrast` without changing markup.
Custom semantic tokens continue to override preset fallbacks.

The demo's mode pill activates the reference palette and updates the color-theme
selector. Choosing a shared theme restores that scheme. The token editor supports
both paths; reference overrides are scoped to the active preset and mode.

Default controls follow a 36px rhythm with 6px corners. Panels use 10px corners,
window chrome uses 14px, and badges, switches, and tracks use pills. Touch input
expands interactive targets to at least 44px. Application text defaults to 14px;
the desktop specimen uses compact documentation typography from the reference.

Reference accent channels are retained. Muted text and essential borders use
stronger foregrounds for contrast. Glossy actions have a dedicated foreground
because their shaded material differs from a flat semantic swatch.

## Component Coverage

| Board group | Public classes and states |
| --- | --- |
| Action states | `rg-button`, `rg-button-primary`, `rg-button-secondary`, `rg-button-ghost`, `rg-button-danger`, `rg-icon-button`; default, hover, pressed, loading, disabled |
| Form inputs | `rg-field`, `rg-label`, `rg-input`, `rg-select`, `rg-textarea`, `rg-input-wrap`, `rg-input-icon`, `rg-helper`, `rg-error-text` |
| Choices and tags | `rg-choice`, `rg-switch`, `rg-switch-track`, `rg-switch-thumb`, `rg-segmented`, `rg-segment`, `rg-chip`, `rg-chip-danger`, `rg-chip-warning` |
| Select and upload | `rg-dropdown`, `rg-option`, `rg-tags`, `rg-file` |
| Ranges and progress | `rg-range`, `rg-range-critical`, `rg-progress`, `rg-progress-bar`, `rg-progress-danger`, `rg-meter`, `rg-stepper`, `rg-step` |
| Feedback | `rg-alert` and success/warning/danger modifiers, `rg-toast`, `rg-spinner`, `rg-skeleton` |
| Navigation | `rg-breadcrumb`, `rg-tabs`, `rg-tab`, `rg-nav`, `rg-nav-link`, `rg-pagination`, `rg-pagination-page` |
| Data | `rg-table`, `rg-badge` and semantic modifiers, `rg-avatar`, `rg-avatar-danger`, `rg-avatar-neutral`, `rg-avatar-group` |
| Overlays and disclosure | `rg-tooltip`, `rg-popover`, `rg-modal`, `rg-modal-actions`, `rg-accordion` |
| Foundations | `rg-title`, `rg-heading`, `rg-section-title`, `rg-overline`, `rg-token-swatch`, `rg-code`, `rg-list`, `rg-quote`, existing `rg-console` |

The library keeps canonical single-hyphen modifiers, translating reference names
such as `rg-button--primary` to `rg-button-primary`. The template's pagination
item becomes `rg-pagination-page`; the existing `rg-page` layout shell is preserved.
Every published preset extra is listed in `manifest.json`.

## State And Interaction Contracts

- Use native `disabled`, `aria-busy`, `aria-invalid`, `aria-selected`, and
  `aria-current` attributes. Static `.is-hover`, `.is-focus`, `.is-pressed`,
  `.is-loading`, and `.is-disabled` classes are available for specimens.
- Associate visible error text with its input using `aria-describedby`.
- Keep switch inputs focusable. Include the `rg-switch-thumb` inside the track.
- Set `--rg-value` to a percentage for range fill and meter position. Update it
  alongside the native input value and an accessible `output`.
- Set `--rg-progress-value` on `rg-progress-bar`. Supply the progressbar name and
  `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` on the track.
- Use native `dialog.showModal()` for modal behavior and native `details` for
  disclosure. A visual `rg-modal` class alone does not create a focus trap.
- Set `--rg-token-swatch-color` to the semantic color shown by a token swatch.
- Standalone, semantic, and native busy indicators share a complete circular
  track with one highlighted quadrant. Busy controls reserve a non-shrinking
  16px indicator; reduced-motion preferences stop rotation.
- Disabled choices retain readable labels and use dashed outlines to distinguish
  their state without relying on faded text. Keep the native `disabled` attribute.
- Anchor buttons retain the same contrast-safe foreground as button elements.
  Marketing seals use opaque chrome with inherited text color.

CSS supplies visual states; applications own interaction behavior. The demo adds
roving keyboard focus for tabs and listbox options, file selection and drop,
range output, filter chips, pagination, a menu, and a native modal dialog.
Examples use inert local data and do not upload or delete real documents.

## Preset Isolation

The demo renders preset extras only for their owner. All exclusive regions use
`data-preset-only` and a shared visibility synchronizer. Changing the style removes
the prior preset's generated markup; presets with no extras show no extras region.
This rule applies to all presets, including the Cyberpunk and Retro Glass boards.

## Assets

The demo vendors Lucide 0.468.0 icons in `demo/assets/lucide`, including the upstream
license. The build generates `demo/demo-icons.js` from those source files so icons
work offline through either HTML entry point, including `file:` URLs.

The semantic demo settings icon uses a 24px SVG in a stable 44px control across
presets. Retro Glass feature checks use a heavier SVG stroke inside the medallion.

`npm run build` regenerates the default, visual, focused, and bridge bundles,
containment foundations, demo icon asset, and README bundle-size metadata.
