# Installation and Setup

## Install

```bash
npm install ui-style-kit-css
```

## Import (combined CSS)

```js
import "ui-style-kit-css/dist/ui-style-kit.css";
```

## Import (single style file)

```js
import "ui-style-kit-css/styles/minimal-saas.css";
```

## Browser / CDN Usage

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@latest/dist/ui-style-kit.min.css" />
```

Local build:

```html
<link rel="stylesheet" href="dist/ui-style-kit.css" />
```

## Package Maintenance Scripts

```bash
npm run build
npm run lint
npm test
```

Playwright E2E:

```bash
npm run test:e2e:install
npm run test:e2e
```

## Minimal Markup Contract

1. Apply all three attributes on your root container (usually `<body>`): `data-ui`, `data-theme`, `data-mode`.
2. Use classes that match the selected style prefix.
3. Keep prefix usage consistent in a component tree.

Example:

```html
<body data-ui="bento" data-theme="ocean-steel" data-mode="dark">
  <section class="bento-page">
    <div class="bento-container bento-stack">
      <article class="bento-card">
        <h1 class="bento-title">Dashboard</h1>
        <p class="bento-subtitle">Ready</p>
      </article>
    </div>
  </section>
</body>
```

## Dynamic Runtime Switching

```js
document.body.dataset.ui = "cyberpunk";
document.body.dataset.theme = "midnight-gold";
document.body.dataset.mode = "dark";
```
