# UI Style Kit CSS

**UI Style Kit CSS** is a CSS-only theme and UI style preset library for accessible websites, dashboards, admin interfaces, and customer-facing pages.

It is separate from, but complementary to, **Interactive Surface CSS**. Use **UI Style Kit CSS** for visual identity, color themes, UI presets, layout mood, and native HTML styling. Use **Interactive Surface CSS** for interaction-state animation systems and surface behavior.

## Features

- 11 UI style systems
- 10 shared color schemes
- `light`, `dark`, and `contrast` modes
- Combined CSS bundle and optional per-style imports
- Scoped native HTML element coverage
- Visible `:focus-visible` defaults
- Skip-link and visually-hidden helpers per style prefix
- Optional bridge tokens for `interactive-surface-css`
- Reduced-motion, high-contrast, forced-colors, and print support
- Cascade-layered CSS for easier consumer overrides
- No runtime dependencies

## Install

```bash
npm install ui-style-kit-css
```

## Import

Full bundle:

```js
import "ui-style-kit-css/dist/ui-style-kit.css";
```

Single style system:

```js
import "ui-style-kit-css/styles/minimal-saas.css";
import "ui-style-kit-css/styles/cyberpunk.css";
```

Shortcut imports are also exported:

```js
import "ui-style-kit-css/minimal-saas.css";
import "ui-style-kit-css/retro-glass.css";
```

Optional bridge for Interactive Surface CSS:

```js
import "ui-style-kit-css/interactive-surface-bridge";
```

## CDN usage

After publishing to NPM:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@latest/dist/ui-style-kit.min.css" />
```

For production, pin a version:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@1.2.2/dist/ui-style-kit.min.css" />
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

## Modes

```txt
light
dark
contrast
```

## Native HTML coverage

Each style system scopes defaults under `[data-ui="..."]` and covers common native elements, including:

- headings, paragraphs, links, lists, blockquotes, code, pre, mark, abbr
- images, media, figures, captions
- forms, fieldsets, labels, inputs, textareas, selects, checkboxes, radios, range, color, file inputs
- buttons and submit/reset controls
- tables and captions
- `details`, `summary`, `dialog`, `progress`, and `meter`

CSS improves accessibility presentation, but it cannot guarantee accessibility by itself. Use semantic HTML, real labels, keyboard-safe JavaScript, meaningful link/button text, and correct ARIA state management.

## Cascade layers

The library styles are wrapped in `@layer ui-style-kit.*`. Unlayered consumer CSS can override the library without specificity fights:

```css
[data-ui="minimal-saas"][data-theme="arctic-indigo"] {
  --saas-primary-rgb: 72 91 255;
}
```

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
  styles/
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

`npm run check` rebuilds the bundle, runs stylelint, verifies package metadata, and checks core contrast pairs. Optional Playwright visual smoke tests are available through `npm run test:visual` after installing dev dependencies.

## License

MIT
