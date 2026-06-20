# Token Contract

Each UI style uses its own prefix, but concrete color schemes are shared. The 2.0 token model is deliberately compact:

```txt
shared scheme channels -> prefixed aliases -> UI rules
```

`styles/theme-colors.css` defines the active scheme and mode once as `--usk-*` RGB channels. Each UI style maps those shared channels to its public prefix, then components and native HTML rules consume prefixed functional variables.

## Prefixes

| UI style | Prefix |
|---|---:|
| Minimal SaaS | `saas` |
| Bento UI | `bento` |
| Maximalist / Playful | `max` |
| Bauhaus / Swiss Modern | `bau` |
| Skeuomorphic / Tactile | `tactile` |
| Neumorphism | `neo` |
| Retrofuturism | `retro` |
| Brutalism | `brutal` |
| Cyberpunk | `cyber` |
| Y2K | `y2k` |
| Retro Glass | `rg` |

## Stable functional tokens

Replace `<prefix>` with the style prefix:

```css
--<prefix>-bg
--<prefix>-fg
--<prefix>-surface
--<prefix>-surface-fg
--<prefix>-surface-strong
--<prefix>-surface-soft
--<prefix>-text
--<prefix>-text-muted
--<prefix>-muted
--<prefix>-border
--<prefix>-control-bg
--<prefix>-control-fg
--<prefix>-primary
--<prefix>-primary-hover
--<prefix>-secondary
--<prefix>-secondary-hover
--<prefix>-accent
--<prefix>-success
--<prefix>-warning
--<prefix>-danger
--<prefix>-link
--<prefix>-focus
--<prefix>-theme-bg
--<prefix>-theme-bg-size
--<prefix>-card-bg
--<prefix>-spinner-track
--<prefix>-spinner-stroke
--<prefix>-spinner-accent
```

## Filled-surface text aliases

Filled UI uses compact `on-*` aliases instead of a large foreground-token matrix:

```css
--<prefix>-on-primary
--<prefix>-on-secondary
--<prefix>-on-accent
--<prefix>-on-success
--<prefix>-on-warning
--<prefix>-on-danger
```

Backward-compatible aliases `--<prefix>-primary-text` and `--<prefix>-secondary-text` remain available and point to the same filled-surface text colors.

## Shared RGB palette channels

Concrete theme/mode blocks now live in `styles/theme-colors.css` and expose shared RGB channels:

```css
--usk-bg-rgb
--usk-surface-rgb
--usk-surface-strong-rgb
--usk-surface-soft-rgb
--usk-text-rgb
--usk-text-muted-rgb
--usk-border-rgb
--usk-primary-rgb
--usk-primary-hover-rgb
--usk-primary-text-rgb
--usk-secondary-rgb
--usk-secondary-hover-rgb
--usk-secondary-text-rgb
--usk-accent-rgb
--usk-accent-text-rgb
--usk-success-rgb
--usk-success-text-rgb
--usk-warning-rgb
--usk-warning-text-rgb
--usk-danger-rgb
--usk-danger-text-rgb
--usk-link-rgb
--usk-focus-rgb
```

Each standalone style file imports the shared color layer and aliases those roles back to the style prefix:

```css
[data-ui="minimal-saas"][data-theme][data-mode] {
  --saas-bg-rgb: var(--usk-bg-rgb);
  --saas-primary-rgb: var(--usk-primary-rgb);
  --saas-primary-text-rgb: var(--usk-primary-text-rgb);
}
```

Use prefixed RGB aliases for component-local alpha effects:

```css
.my-component {
  border-color: rgb(var(--saas-primary-rgb) / 0.35);
}
```

Use shared `--usk-*` roles when defining or overriding a scheme:

```css
:where([data-ui][data-theme="arctic-indigo"][data-mode="light"]) {
  --usk-primary-rgb: 72 91 255;
  --usk-primary-hover-rgb: 55 75 230;
  --usk-primary-text-rgb: 255 255 255;
}
```

## Theme-composition tokens

The library derives larger visual defaults from the active theme:

```css
--<prefix>-theme-bg       /* page-level background layers */
--<prefix>-theme-bg-size  /* matching background-size list */
--<prefix>-card-bg        /* default card/panel background */
--<prefix>-control-bg     /* default neutral button/toolbar/table-wrap background */
```

These tokens make color themes visually distinct by changing page atmosphere, card tinting, and neutral control surfaces when `data-theme` or `data-mode` changes.

## Spinner tokens

Loading indicators use theme variables by default:

```css
--<prefix>-spinner-track
--<prefix>-spinner-stroke
--<prefix>-spinner-accent
```

The class utilities are `<prefix>-spinner`, `<prefix>-loading-spinner`, `<prefix>-spinner-sm`, and `<prefix>-spinner-lg`. Native buttons and prefixed buttons also render an inline spinner when `aria-busy="true"` is present.

## Typography tokens

Each style exposes broad and granular font variables:

```css
--<prefix>-font-sans
--<prefix>-font-display
--<prefix>-font-body
--<prefix>-font-heading
--<prefix>-font-control
--<prefix>-font-mono
```

`--<prefix>-font-body`, `--<prefix>-font-heading`, and `--<prefix>-font-control` default back to `font-sans` or `font-display`, so existing overrides continue to work.

## Palette utilities vs filled UI

Semantic text utility classes use direct palette colors:

```css
.saas-text-primary { color: var(--saas-primary); }
.saas-text-warning { color: var(--saas-warning); }
```

Filled UI uses the matching `on-*` alias:

```css
.saas-button-primary {
  background: var(--saas-primary);
  color: var(--saas-on-primary);
}

.saas-badge-warning {
  background: var(--saas-warning);
  color: var(--saas-on-warning);
}
```

## Override example

```css
/* Consumer CSS is unlayered, so it overrides the library's layered rules cleanly. */
[data-ui="minimal-saas"][data-theme="arctic-indigo"] {
  --saas-radius-md: 1rem;
  --saas-font-sans: Inter, system-ui, sans-serif;
  --saas-font-display: Inter, system-ui, sans-serif;
}

:where([data-ui][data-theme="arctic-indigo"][data-mode="light"]) {
  --usk-primary-rgb: 72 91 255;
  --usk-primary-hover-rgb: 55 75 230;
  --usk-primary-text-rgb: 255 255 255;
}
```

## 2.0.0 compatibility notes

- Component-facing prefixed tokens remain available.
- Concrete color authoring moved to `--usk-*` shared roles.
- Bundled CSS inlines `theme-colors.css`; standalone style files import it.
- If a consumer build system ignores CSS `@import`, import `ui-style-kit-css/theme-colors.css` before the standalone style file.
