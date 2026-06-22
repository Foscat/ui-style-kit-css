# UI Style Kit CSS

**UI Style Kit CSS** is a CSS-only theme and UI style preset library for accessible websites, dashboards, admin interfaces, and customer-facing pages.

It is separate from, but complementary to, **Interactive Surface CSS**. Use **UI Style Kit CSS** for visual identity, color themes, UI presets, layout mood, and native HTML styling. Use **Interactive Surface CSS** for interaction-state animation systems and surface behavior.

## Features

- 11 UI style systems
- 10 shared color schemes
- `light`, `dark`, and `contrast` modes
- Combined CSS bundle and per-style production imports
- Shared `theme-colors.css` scheme layer for all UI systems
- Scoped native HTML element coverage, including semantic containers and inline text elements
- Visible `:focus-visible` defaults
- Skip-link and visually-hidden helpers per style prefix
- Compact shared palette → prefixed alias → UI-rule token model
- Theme-driven card, panel, control, page-background, and spinner defaults
- Visible tooltip classes and native `[role="tooltip"]` styling inside each UI scope
- Font-family override variables for body, headings, controls, and mono text
- Optional bridge tokens and opt-in bridge bundle for `interactive-surface-css`
- Reduced-motion, high-contrast, forced-colors, and print support
- Cascade-layered CSS for easier consumer overrides
- No runtime dependencies

## Install

```bash
npm install ui-style-kit-css
```

## Import

Use a single style import for production apps that use one visual system:

```js
import "ui-style-kit-css/minimal-saas.css";
```

In 2.0.0, standalone style files import the shared color-scheme layer from `styles/theme-colors.css`. Bundlers that understand CSS `@import` will resolve it automatically. If your build pipeline does not resolve CSS imports, import the shared colors before the style file:

```js
import "ui-style-kit-css/theme-colors.css";
import "ui-style-kit-css/minimal-saas.css";
```

The longer `styles/*` paths are also exported:

```js
import "ui-style-kit-css/styles/minimal-saas.css";
import "ui-style-kit-css/styles/cyberpunk.css";
```

Use the full bundle when users need to switch `data-ui` systems at runtime:

```js
import "ui-style-kit-css/dist/ui-style-kit.css";
```

Use the opt-in bridge bundle when you want UI Style Kit CSS and the Interactive Surface bridge in one import:

```js
import "ui-style-kit-css/with-bridge.css";
```

Or import the bridge by itself when you are using a single style file:

```js
import "ui-style-kit-css/minimal-saas.css";
import "ui-style-kit-css/interactive-surface-bridge";
```

The default full bundle does **not** include the bridge. That keeps `dist/ui-style-kit.css` focused on UI systems and prevents accidental duplicate bridge imports.

### Bundle size guide

| Import | Raw | Gzip | Best for |
|---|---:|---:|---|
| `ui-style-kit-css/dist/ui-style-kit.min.css` | ~324 KB | ~37 KB | Runtime UI-system switchers and demos |
| `ui-style-kit-css/with-bridge.css` | ~403 KB | ~58 KB | Runtime switchers plus Interactive Surface bridge |
| `ui-style-kit-css/theme-colors.css` | ~25 KB | ~3 KB | Shared color schemes for standalone style imports |
| Single style imports | ~31-33 KB | ~6 KB | Production apps with one visual system |

## CDN usage

After publishing to NPM:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@latest/dist/ui-style-kit.min.css" />
```

For production, pin a version:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@2.0.0/dist/ui-style-kit.min.css" />
```

## Basic usage

```html
<body data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="light">
  <main class="saas-page">
    <section class="saas-container saas-stack">
      <article class="saas-card">
        <h1 class="saas-title">UI Style Kit CSS</h1>
        <p class="saas-subtitle">Switch UI systems, themes, and modes with attributes.</p>
        <button class="saas-button saas-button-primary">Primary Action</button>
        <span class="saas-spinner" aria-label="Loading"></span>
      </article>
    </section>
  </main>
</body>
```

## Dynamic switching

```js
document.body.dataset.ui = "cyberpunk";
document.body.dataset.theme = "midnight-gold";
document.body.dataset.mode = "dark";
```

## UI systems

| UI style | `data-ui` | Class prefix | Best for |
|---|---:|---:|---|
| Minimal SaaS | `minimal-saas` | `saas` | dashboards, admin tools, SaaS apps |
| Bento UI | `bento` | `bento` | landing pages, feature sections, showcases |
| Maximalist / Playful | `maximalist` | `max` | creators, entertainment, bold client sites |
| Bauhaus / Swiss Modern | `bauhaus` | `bau` | agencies, editorial layouts, design-forward brands |
| Skeuomorphic / Tactile | `tactile` | `tactile` | premium tactile interfaces, control panels |
| Neumorphism | `neumorphism` | `neo` | soft dashboards, experimental UI |
| Retrofuturism | `retrofuturism` | `retro` | futuristic portfolios and product pages |
| Brutalism | `brutalism` | `brutal` | bold creative websites |
| Cyberpunk | `cyberpunk` | `cyber` | security, gaming, encryption, tech demos |
| Y2K | `y2k` | `y2k` | nostalgic, playful, fashion/music/event sites |
| Retro Glass | `retro-glass` | `rg` | futuristic glass dashboards and hero sections |

## Color themes

```txt
midnight-gold
ocean-steel
forest-moss
sunset-ember
royal-plum
graphite-cyan
desert-sage
rose-quartz
cyber-lime
arctic-indigo
```

Color schemes are defined once in `styles/theme-colors.css` as shared `--usk-*` RGB roles. Each UI style maps those shared roles back to its public prefix, so existing component rules still consume variables such as `--saas-primary`, `--bau-surface`, and `--rg-on-primary`.

## Modes

```txt
light
dark
contrast
```

## Native HTML coverage

Each style system scopes defaults under `[data-ui="..."]` and covers common native elements, including:

- semantic containers: `main`, `section`, `header`, `footer`, `nav`, `article`, `aside`, `address`
- headings, paragraphs, links, lists, definition lists, blockquotes, code, pre, mark, abbr
- inline semantics: `strong`, `b`, `em`, `i`, `cite`, `var`, `q`, `ins`, `del`, `s`, `sub`, `sup`, `output`, `time`, `data`, `dfn`, `ruby`, `rt`, `rp`
- images, media, figures, captions, `audio`, `picture`, `object`, `embed`, and `math`
- forms, fieldsets, labels, inputs, textareas, selects, checkboxes, radios, range, color, file inputs
- buttons and submit/reset controls
- tables and captions
- `details`, `summary`, `dialog`, `progress`, `meter`, `menu`, `search`, `optgroup`, and `option`
- loading indicators through `<prefix>-spinner`, `<prefix>-loading-spinner`, and busy native buttons with `aria-busy="true"`
- tooltip surfaces through `<prefix>-tooltip`, `<prefix>-tooltip-arrow`, `.ui-tooltip`, `[role="tooltip"]`, and `[data-tooltip]`

CSS improves accessibility presentation, but it cannot guarantee accessibility by itself. Use semantic HTML, real labels, keyboard-safe JavaScript, meaningful link/button text, and correct ARIA state management.

Semantic text utilities such as `saas-text-primary`, `saas-text-warning`, and `saas-text-danger` use the active theme palette directly. Filled UI such as buttons, badges, and busy states use compact `on-*` aliases like `--saas-on-primary` and `--saas-on-danger`.


## Loading states

Every style includes theme-driven spinner utilities:

```html
<span class="saas-spinner" aria-label="Loading"></span>
<span class="saas-loading-spinner saas-spinner-sm" aria-hidden="true"></span>
<button class="saas-button saas-button-primary" aria-busy="true">Saving</button>
```

Spinner track, stroke, and accent colors come from the active `data-theme` and `data-mode`. The generic `.ui-spinner`, `.loading-spinner`, and `[data-loading-spinner]` hooks are also themed inside any `[data-ui="..."]` scope.

## Tooltip surfaces

Every style includes visible tooltip utilities with the same API and preset-specific visual treatment:

```html
<span class="saas-tooltip" role="tooltip">
  Helpful context
  <span class="saas-tooltip-arrow" aria-hidden="true"></span>
</span>
```

Inside a `[data-ui="..."]` scope, generic `.ui-tooltip`, `[role="tooltip"]`, and `[data-tooltip]` hooks inherit the active UI system.

## Font overrides

Each style exposes backward-compatible base font variables plus more granular aliases:

```css
[data-ui="minimal-saas"] {
  --saas-font-sans: Inter, system-ui, sans-serif;
  --saas-font-display: Inter, system-ui, sans-serif;
  --saas-font-body: var(--saas-font-sans);
  --saas-font-heading: var(--saas-font-display);
  --saas-font-control: var(--saas-font-display);
  --saas-font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

Override `--<prefix>-font-sans` and `--<prefix>-font-display` for the broadest changes, or override `--<prefix>-font-body`, `--<prefix>-font-heading`, `--<prefix>-font-control`, and `--<prefix>-font-mono` for targeted typography control.

## Cascade layers

The library styles are wrapped in `@layer ui-style-kit.*`. Unlayered consumer CSS can override the library without specificity fights:

```css
[data-ui="minimal-saas"][data-theme="arctic-indigo"] {
  --saas-radius-md: 1rem;
  --saas-font-sans: Inter, system-ui, sans-serif;
  --saas-font-display: Inter, system-ui, sans-serif;
  --saas-font-body: var(--saas-font-sans);
  --saas-font-heading: var(--saas-font-display);
  --saas-font-control: var(--saas-font-display);
}

:where([data-ui][data-theme="arctic-indigo"][data-mode="light"]) {
  --usk-primary-rgb: 72 91 255;
  --usk-primary-hover-rgb: 55 75 230;
  --usk-primary-text-rgb: 255 255 255;
}
```

The color model is intentionally small: shared `--usk-*` RGB variables feed prefixed aliases such as `--<prefix>-bg`, `--<prefix>-text`, `--<prefix>-surface`, and `--<prefix>-border`. Filled components use `--<prefix>-on-primary`, `--<prefix>-on-secondary`, `--<prefix>-on-success`, `--<prefix>-on-warning`, and `--<prefix>-on-danger` for readable text over filled surfaces.

## File structure

```txt
ui-style-kit-css/
  package.json
  README.md
  LICENSE
  CHANGELOG.md
  STYLE-MAP.md
  dist/
    ui-style-kit.css
    ui-style-kit.min.css
    ui-style-kit.with-bridge.css
    ui-style-kit.with-bridge.min.css
  styles/
    theme-colors.css
    minimal-saas.css
    bento.css
    maximalist.css
    bauhaus.css
    tactile.css
    neumorphism.css
    retrofuturism.css
    brutalism.css
    cyberpunk.css
    y2k.css
    retro-glass.css
    interactive-surface-bridge.css
  docs/
    TOKENS.md
    STYLE-GUIDE.md
    PUBLISHING.md
  demo/
    index.html
```

## Development checks

```bash
npm run check
npm run pack:dry-run
```

`npm run check` rebuilds the bundles, runs stylelint, verifies package metadata, checks the documented class API, and validates contrast for base text/link pairs and filled component `on-*` pairs. Optional Playwright visual smoke tests are available through `npm run test:visual` after installing dev dependencies.

## 2.0.0 Migration Notes

The 2.0.0 release removes duplicated per-UI color-scheme blocks. Color schemes now live in `theme-colors.css` as shared `--usk-*` roles, and each UI style aliases those roles back to its prefix.

- Use `--usk-*-rgb` when defining or overriding a color scheme.
- Continue using prefixed functional tokens such as `--saas-primary`, `--neo-card-bg`, and `--rg-on-primary` inside components.
- Import `ui-style-kit-css/theme-colors.css` before standalone style files if your bundler does not follow CSS `@import`.
- Keep using `ui-style-kit-css/interactive-surface-bridge` or `ui-style-kit-css/with-bridge.css` for the current bridge. The bridge is intentionally isolated so `interactive-surface-css` can be revised independently.

## License

MIT
