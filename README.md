# UI Style Kit CSS

**UI Style Kit CSS** is a CSS-only theme and visual style preset library for standardizing websites, dashboards, admin tools, and customer-facing pages.

It is designed to be separate from, but complementary to, **Interactive Surface CSS**. Use this library for visual identity, color themes, UI style presets, and native HTML coverage. Use Interactive Surface CSS for interaction-state animation systems and surface behavior.

## Features

- 11 UI style systems
- 10 shared color schemes
- `light`, `dark`, and `contrast` modes
- one combined CSS entry file
- optional per-style CSS files
- CSS-only native HTML element coverage
- visible focus states
- reduced-motion support
- high-contrast and forced-colors support
- print styles
- NPM/CDN-friendly package structure

## Install

```bash
npm install ui-style-kit-css
```

## Import

```js
import "ui-style-kit-css/dist/ui-style-kit.css";
```

Or import one style system only:

```js
import "ui-style-kit-css/styles/minimal-saas.css";
import "ui-style-kit-css/styles/cyberpunk.css";
```

## Browser / CDN usage

After publishing to NPM:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@latest/dist/ui-style-kit.min.css" />
```

Local usage:

```html
<link rel="stylesheet" href="dist/ui-style-kit.css" />
```

## Basic usage

```html
<body data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="light">
  <main class="saas-page">
    <section class="saas-container saas-stack">
      <article class="saas-card">
        <h1 class="saas-title">UI Style Kit CSS</h1>
        <p class="saas-subtitle">Switch UI systems, themes, and modes with attributes.</p>
      </article>
    </section>
  </main>
</body>
```

## UI systems

| UI style | `data-ui` | Class prefix |
|---|---:|---:|
| Minimal SaaS | `minimal-saas` | `saas` |
| Bento UI | `bento` | `bento` |
| Maximalist / Playful | `maximalist` | `max` |
| Bauhaus / Swiss Modern | `bauhaus` | `bau` |
| Skeuomorphic / Tactile | `tactile` | `tactile` |
| Neumorphism | `neumorphism` | `neo` |
| Retrofuturism | `retrofuturism` | `retro` |
| Brutalism | `brutalism` | `brutal` |
| Cyberpunk | `cyberpunk` | `cyber` |
| Y2K | `y2k` | `y2k` |
| Retro Glass | `retro-glass` | `rg` |

## Color themes

- `midnight-gold`
- `ocean-steel`
- `forest-moss`
- `sunset-ember`
- `royal-plum`
- `graphite-cyan`
- `desert-sage`
- `rose-quartz`
- `cyber-lime`
- `arctic-indigo`

## Modes

- `light`
- `dark`
- `contrast`

## Dynamic switching

```js
document.body.dataset.ui = "cyberpunk";
document.body.dataset.theme = "midnight-gold";
document.body.dataset.mode = "dark";
```

## File structure

```txt
ui-style-kit-css/
  package.json
  README.md
  LICENSE
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
  demo/
    index.html
```

## Accessibility scope

UI Style Kit CSS includes CSS-only accessibility presentation helpers:

- scoped native HTML defaults
- visible `:focus-visible` styles
- `prefers-reduced-motion` support
- `prefers-contrast: more` support
- `forced-colors: active` support
- print styles
- skip-link and visually-hidden utilities per style prefix

CSS cannot guarantee accessibility by itself. Use semantic HTML, real labels, keyboard-safe JavaScript, and correct ARIA state management for interactive components.

## License

MIT
