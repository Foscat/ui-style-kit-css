# Token Contract

Each UI style uses its own prefix, but concrete color schemes are shared. The 2.0 token model is deliberately compact:

```txt
shared scheme channels -> prefixed aliases -> UI rules
```

`styles/theme-colors.css` defines the active scheme and mode once as `--usk-*` RGB channels. Each UI style maps those shared channels to its public prefix, then component rules consume prefixed functional variables. `styles/native-elements.css` owns native HTML fallback selectors and consumes `--usk-native-*` tokens that each preset maps back to its own public variables.

## Shared semantic token handshake

The existing `[data-ui][data-theme][data-mode]` native-token root publishes 12 fully typed `--ui-*` values. UI Style Kit is the primary producer, but the names are intentionally package-neutral so a third-party theme can produce the same contract. Consumer libraries treat these values as optional fallbacks: a package-specific override wins first, then the shared semantic value, then the consumer's legacy token and literal default.

| Shared token | CSS type | UI Style Kit source |
|---|---|---|
| `--ui-color-bg` | `<color>` | `rgb(var(--usk-bg-rgb))` |
| `--ui-color-surface` | `<color>` | `var(--usk-native-surface-strong)` |
| `--ui-color-text` | `<color>` | `var(--usk-native-text)` |
| `--ui-color-muted` | `<color>` | `var(--usk-native-text-muted)` |
| `--ui-color-primary` | `<color>` | `var(--usk-native-primary)` |
| `--ui-color-on-primary` | `<color>` | `var(--usk-native-on-primary)` |
| `--ui-color-border` | `<color>` | `var(--usk-native-border)` |
| `--ui-radius-control` | `<length>` | `var(--usk-native-radius)` |
| `--ui-shadow-control` | `<shadow-list>` | `var(--usk-native-shadow)` |
| `--ui-focus-color` | `<color>` | `var(--usk-native-focus)` |
| `--ui-motion-duration` | `<time>` | `var(--usk-motion-duration)` |
| `--ui-motion-easing` | `<easing-function>` | `var(--usk-motion-easing)` |

The two motion sources are scalar values (`140ms` and `cubic-bezier(0.2, 0, 0.2, 1)`), not values derived from a transition shorthand. That keeps them valid wherever a consumer needs one duration or one easing function.

A third-party theme can provide the same handshake without importing UI Style Kit:

```css
[data-theme="partner"] {
  --ui-color-surface: rgb(250 252 255);
  --ui-color-text: rgb(18 28 45);
  --ui-color-primary: rgb(20 92 180);
  --ui-color-on-primary: white;
  --ui-color-border: rgb(150 165 185);
  --ui-radius-control: 0.75rem;
  --ui-shadow-control: 0 8px 24px rgb(20 40 70 / 0.16);
  --ui-focus-color: rgb(20 92 180);
  --ui-motion-duration: 140ms;
  --ui-motion-easing: cubic-bezier(0.2, 0, 0.2, 1);
}
```

UI Style Kit entrypoints publish all 12 values. Standalone consumer packages must remain complete when none of them are present.

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
| Editorial Luxe | `luxe` |
| Organic Modern | `organic` |
| Industrial Utility | `utility` |
| Technical Blueprint | `blueprint` |
| Art Deco | `deco` |
| Clay | `clay` |
| Data Terminal | `terminal` |
| Paper Editorial | `paper` |
| Neo-Noir | `noir` |

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

Each standalone style file imports the shared color and native layers, then aliases those roles back to the style prefix:

```css
[data-ui="minimal-saas"][data-theme][data-mode] {
  --saas-bg-rgb: var(--usk-bg-rgb);
  --saas-primary-rgb: var(--usk-primary-rgb);
  --saas-primary-text-rgb: var(--usk-primary-text-rgb);
}
```

## Native fallback tokens

Native HTML coverage is shared in `styles/native-elements.css` to avoid repeating the same semantic selector blocks in every preset. Preset files provide visual mappings for these stable native-layer tokens:

```css
--usk-native-surface
--usk-native-surface-strong
--usk-native-surface-soft
--usk-native-card-bg
--usk-native-control-bg
--usk-native-text
--usk-native-text-muted
--usk-native-border
--usk-native-primary
--usk-native-primary-hover
--usk-native-on-primary
--usk-native-focus
--usk-native-success
--usk-native-warning
--usk-native-danger
--usk-native-link
--usk-native-font-body
--usk-native-font-heading
--usk-native-font-control
--usk-native-font-mono
--usk-native-radius-sm
--usk-native-radius
--usk-native-radius-lg
--usk-native-border-width
--usk-native-field-gap
--usk-native-panel-padding
--usk-native-control-min-block-size
--usk-native-control-padding-block
--usk-native-control-padding-inline
--usk-native-subcontrol-padding-block
--usk-native-subcontrol-padding-inline
--usk-native-track
--usk-native-track-fill
--usk-native-thumb
--usk-native-thumb-border
--usk-native-indicator
--usk-native-shadow
--usk-native-shadow-md
--usk-native-focus-ring
```

Consumers usually override the prefixed public tokens, not these internal bridge tokens. Use `--usk-native-*` only when intentionally customizing native fallback styling across every UI preset.

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

The class utilities are `<prefix>-spinner`, `<prefix>-loading-spinner`, `<prefix>-spinner-sm`, and `<prefix>-spinner-lg`. Each preset owns its loader silhouette, cadence, and depth while consuming only these active theme roles. Native buttons and prefixed buttons render the matching preset-owned indicator when `aria-busy="true"` is present.

## Interactive Surface bridge tokens

The opt-in bridge maps shared `--usk-*` roles directly to `--interactive-surface-*` tokens. It avoids per-UI token maps so the bridge follows the same shared scheme -> mode role -> component rule flow as the main bundle.

Use `.interactive-surface` with `data-surface-variant` for semantic intent and `data-surface-level` for visual depth:

```html
<button class="interactive-surface" data-surface-variant="primary" data-surface-level="2">
  Save changes
</button>
```

Stable bridge attributes:

```txt
data-surface-variant="primary|secondary|accent|subtle|warning|danger"
data-surface-level="1|2|3"
```

The bridge defines visible state layer tokens for hover, active, and focus plus level tokens such as `--interactive-surface-level-1-bg`, `--interactive-surface-level-2-bg`, and `--interactive-surface-level-3-bg`.

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

## 2.x compatibility notes

- Component-facing prefixed tokens remain available.
- Concrete color authoring moved to `--usk-*` shared roles.
- Bundled CSS inlines `theme-colors.css`; standalone style files import it.
- If a consumer build system ignores CSS `@import`, import `ui-style-kit-css/theme-colors.css` before the standalone style file.
