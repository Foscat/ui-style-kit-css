# Class API

Class names follow:

`<prefix>-<suffix>`

Examples:

- `saas-button`
- `bento-card`
- `retro-nav-link`

`<prefix>` comes from the selected `data-ui` style.

## Core Cross-Style API (11/11 styles)

These suffixes exist in every style file.

### Layout and Structure

- `page`
- `container`
- `section`
- `grid`
- `stack`
- `cluster`
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

## Loading API

Every style has prefixed spinner utilities:

```html
<span class="saas-spinner" aria-label="Loading"></span>
<span class="saas-loading-spinner saas-spinner-lg" aria-hidden="true"></span>
<button class="saas-button saas-button-primary" aria-busy="true">Saving</button>
```

Inside a `[data-ui="..."]` scope, generic `.ui-spinner`, `.loading-spinner`, and `[data-loading-spinner]` elements also receive theme-aware spinner styling.

## Shared State Class

`is-active` is a state class, not a prefixed utility. Apply it to supported prefixed components:

```html
<a class="saas-nav-link is-active">Overview</a>
<button class="saas-button is-active">Active</button>
```

The same components also support native state hooks such as `aria-current="page"` and `aria-pressed="true"` where appropriate.

## Extended Utility Bundle (7 styles)

The following suffixes are available in:

- `minimal-saas`
- `bento`
- `maximalist`
- `bauhaus`
- `tactile`
- `neumorphism`
- `retrofuturism`

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
- `split`
- `sr-only`
- `visually-hidden`
- `skip-link`

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
