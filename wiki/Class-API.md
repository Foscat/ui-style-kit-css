# Class API

## Generic Semantic API

Lead with `.ui-*` component classes when the root `data-ui` value can switch across presets:

```html
<article class="ui-card">
  <button class="ui-button" data-ui-variant="primary">Save</button>
</article>
```

`manifest.json#semanticComponentApi` defines the 29 implemented generic component selectors. They preserve unchanged markup across all 20 presets in generated default, visual, and with-bridge bundles. Generated focused `visual/<preset>.css` entrypoints support semantic aliases for their one preset. Raw `styles/*` and standalone preset exports remain prefixed advanced APIs. `implementationStatus` partitions the two retained hooks, 27 generated aliases, and an empty pending set.

| Role | Generic selectors |
| --- | --- |
| Buttons | `.ui-button`, `.ui-icon-button` |
| Card | `.ui-card` |
| Forms | `.ui-field`, `.ui-label`, `.ui-help-text`, `.ui-input`, `.ui-select`, `.ui-textarea` |
| Choice controls | `.ui-check`, `.ui-check-control`, `.ui-radio`, `.ui-radio-control`, `.ui-switch`, `.ui-switch-track`, `.ui-switch-thumb` |
| Badge | `.ui-badge` |
| Alert | `.ui-alert`, `.ui-alert-title`, `.ui-alert-body` |
| Navigation | `.ui-nav`, `.ui-nav-link` |
| Table | `.ui-table`, `.ui-table-wrap` |
| Progress | `.ui-progress`, `.ui-progress-bar` |
| Toolbar | `.ui-toolbar` |
| Existing generic hooks | `.ui-spinner`, `.ui-tooltip` |

`data-ui-variant` is the only new semantic component attribute. Omit it for neutral styling.

| Selector | Values |
| --- | --- |
| `.ui-button` | `primary`, `secondary`, `danger`, `ghost` |
| `.ui-badge` | `primary`, `secondary`, `success`, `warning`, `danger` |
| `.ui-alert` | `success`, `warning`, `danger` |

Native and ARIA state hooks, `.is-active`, and `[data-ui-tooltip-anchor]` remain the state and tooltip-anchor APIs. `data-ui-state`, `data-ui-size`, and `data-ui-placement` are not defined.

Modal and dialog roles use neutral native `<dialog>` styling. The API intentionally has no `.ui-modal` or `.ui-dialog` selector.

## Advanced and compatibility prefixed API

Preset-prefixed classes remain supported compatibility and advanced APIs. Partial preset-only extras, typography and paint utilities, surface/size/placement helpers, shape and accessibility utilities remain prefix-bound.

Prefixed class names follow `<prefix>-<suffix>`, where `<prefix>` comes from the selected `data-ui` style. Examples include `saas-button`, `bento-card`, and `retro-nav-link`.

## Core Cross-Style API (20/20 styles)

These suffixes exist in every style file.

### Layout and Structure

- `panel`
- `well`
- `inset`
- `card`
- `toolbar`
- `nav`
- `nav-link`
- `table-wrap`
- `table`

### Typography and Text

- `title`
- `subtitle`
- `kicker`
- `heading`
- `copy`
- `label`
- `help-text`
- `text-primary`
- `text-secondary`
- `text-muted`
- `text-success`
- `text-warning`
- `text-danger`
- `text-accent`

### Form Controls

- `field`
- `input`
- `textarea`
- `select`

### Actions and Feedback

- `button`
- `button-primary`
- `button-secondary`
- `button-danger`
- `icon-button`
- `badge`
- `badge-primary`
- `badge-secondary`
- `badge-success`
- `badge-warning`
- `badge-danger`
- `alert`
- `alert-success`
- `alert-warning`
- `alert-danger`
- `alert-title`
- `alert-body`
- `progress`
- `progress-bar`
- `hover-lift`
- `spinner`
- `loading-spinner`
- `spinner-sm`
- `spinner-lg`
- `tooltip`
- `tooltip-arrow`

## Commercial / Marketing Components (20/20 styles)

These visual modifiers provide reusable service-card, trust-strip, media, CTA, and badge patterns without encoding a specific business domain.

- `card-media`
- `card-service`
- `card-feature`
- `card-accent-edge`
- `icon-medallion`
- `button-cut`
- `button-outline-heavy`
- `badge-seal`
- `feature-strip`
- `feature-item`
- `callout-bar`
- `eyebrow`
- `media-scrim`

Example:

```html
<aside class="cyber-callout-bar">
  <span class="cyber-icon-medallion" aria-hidden="true">!</span>
  <div>
    <p class="cyber-eyebrow">Need help?</p>
    <strong>Talk with the team.</strong>
  </div>
  <a class="cyber-button cyber-button-outline-heavy cyber-button-cut" href="#">Contact</a>
</aside>
```

### Composition guidance

- Build service cards from `card` + `card-service`, then add optional `card-media`, `icon-medallion`, and existing action modifiers.
- Use `media-scrim` around real media and a caption; the class supplies readable token-driven paint, while applications own media selection and alternative text.
- Put `feature-item` children inside `feature-strip`; the strip reflows at narrow widths without additional responsive class names.
- Use `callout-bar` as a dedicated action lane and compose its real link or button with `button-cut` or `button-outline-heavy`. No `button-cta` class exists.
- Treat medallions as decorative with `aria-hidden="true"` unless they convey information, and always preserve visible focus and an accessible name on clipped controls.

These classes consume only the active theme and mode roles. The shared containment contract keeps long labels, captions, and URLs inside consumer-owned grids without taking ownership of the outer page layout.

## Loading API

Every style has prefixed spinner utilities:

```html
<span class="saas-spinner" aria-label="Loading"></span>
<span class="saas-loading-spinner saas-spinner-lg" aria-hidden="true"></span>
<button class="saas-button saas-button-primary" aria-busy="true">Saving</button>
```

Inside a `[data-ui="..."]` scope, generic `.ui-spinner`, `.loading-spinner`, and `[data-loading-spinner]` elements receive both theme-aware colors and the active preset's loader identity. Busy buttons use the same visual language without changing their accessible label.

## Tooltip API

Every style has prefixed tooltip utilities plus generic scoped hooks:

```html
<span class="saas-tooltip" role="tooltip">
  Helpful context
  <span class="saas-tooltip-arrow" aria-hidden="true"></span>
</span>
```

Inside a `[data-ui="..."]` scope, generic `.ui-tooltip`, `[role="tooltip"]`, and `[data-tooltip]` elements inherit the selected UI system.

## Shared State Class

`is-active` is a state class, not a prefixed utility. Apply it to supported prefixed components:

```html
<a class="saas-nav-link is-active">Overview</a>
<button class="saas-button is-active">Active</button>
```

The same components also support native state hooks such as `aria-current="page"` and `aria-pressed="true"` where appropriate.

## Extended Utility Bundle (20 styles)

The following suffixes are available in every manifest preset through the shared component foundation:

Suffixes:

- `bg-primary`
- `bg-secondary`
- `disabled`
- `surface`
- `surface-sm`
- `surface-lg`
- `border`
- `button-ghost`
- `check`
- `check-control`
- `radio`
- `radio-control`
- `switch`
- `switch-track`
- `switch-thumb`
- `divider`
- `pill`
- `rounded`
- `rounded-lg`
- `rounded-xl`
- `sr-only`
- `visually-hidden`
- `skip-link`

## Deprecated Structural Compatibility API

The prefixed `page`, `container`, `section`, `grid`, `stack`, `cluster`, and `split` suffixes remain available only as deprecated compatibility classes for the v2 line. They are not semantic component selectors and are reserved for removal in v3.

## Additional Selective Suffixes

| Suffix | Styles |
| --- | --- |
| `pressed` | `tactile`, `brutalism` |
| `console` | `cyberpunk`, `retro-glass` |
| `empty-state`, `metric`, `metric-label`, `metric-value` | `minimal-saas` |
| `grid-feature`, `stat`, `stat-label`, `stat-value`, `tile`, `tile-sm`, `tile-md`, `tile-lg` | `bento` |
| `callout`, `sticker`, `wiggle` | `maximalist` |
| `block`, `composition`, `rail` | `bauhaus` |
| `bevel`, `knob` | `tactile` |
| `bubble` | `y2k` |

## Semantic Text Utilities

Semantic text utilities use the active theme palette directly:

```css
.saas-text-primary { color: var(--saas-primary); }
.saas-text-warning { color: var(--saas-warning); }
```

Filled classes such as `button-primary` and `badge-warning` use compact `on-*` aliases such as `--saas-on-primary` and `--saas-on-warning` for text over colored fills.

Color schemes are shared across UI systems in `theme-colors.css`; class APIs remain prefix-bound to the selected `data-ui`.

## Prefix Translation Example

`button-primary` by style:

- Minimal SaaS: `saas-button-primary`
- Neumorphism: `neo-button-primary`
- Cyberpunk: `cyber-button-primary`
- Retro Glass: `rg-button-primary`
