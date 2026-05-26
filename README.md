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

## Wiki

Extended documentation lives in [`wiki/`](wiki/):

- [`wiki/Home.md`](wiki/Home.md)
- [`wiki/Installation-and-Setup.md`](wiki/Installation-and-Setup.md)
- [`wiki/Theming-Model.md`](wiki/Theming-Model.md)
- [`wiki/Class-API.md`](wiki/Class-API.md)
- [`wiki/UI-Systems.md`](wiki/UI-Systems.md)
- [`wiki/Accessibility.md`](wiki/Accessibility.md)

## Community

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

## Quality

```bash
npm install
npm run build
npm run lint:css
npm test
```

Run Playwright tests:

```bash
npm run test:e2e:install
npm run test:e2e
```

Auto-fix style issues:

```bash
npm run lint:css:fix
```

Full release gate:

```bash
npm run verify
```

## Demo SEO Files

The demo page includes production SEO/social metadata plus supporting files for GitHub Pages:

- `index.html` comprehensive metadata + JSON-LD
- `robots.txt`
- `sitemap.xml`
- `site.webmanifest`
- `browserconfig.xml`
- `.nojekyll`
- `logo.png`
- `assets/seo/social-card.png`

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
  CONTRIBUTING.md
  SECURITY.md
  CODE_OF_CONDUCT.md
  LICENSE
  index.html
  logo.png
  llms.txt
  robots.txt
  sitemap.xml
  site.webmanifest
  browserconfig.xml
  assets/
    seo/
      social-card.png
  .stylelintrc.json
  .stylelintignore
  .editorconfig
  .gitattributes
  .github/
    workflows/
      ci.yml
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
  wiki/
    Home.md
    Installation-and-Setup.md
    Theming-Model.md
    Class-API.md
    UI-Systems.md
    Accessibility.md
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
